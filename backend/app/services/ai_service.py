"""Geração por provedores de IA. Erros de nuvem não viram filtros locais.
O contrato de generate_variations é preservado para o worker Celery.
"""
from __future__ import annotations

import base64
import io
import logging
import socket
import time
from urllib.parse import urlparse
from pathlib import Path
from typing import List, Optional, Tuple

import httpx
from PIL import Image, ImageEnhance, ImageFilter, ImageOps

from app.config import settings

logger = logging.getLogger(__name__)

# Cadeia de fallback usada quando AI_PROVIDER="auto"
DEFAULT_CHAIN = ["fal", "insightface", "openai", "stability", "local"]


def has_internet_connection(host: str = "8.8.8.8", port: int = 53, timeout: float = 2.0) -> bool:
    try:
        socket.setdefaulttimeout(timeout)
        socket.socket(socket.AF_INET, socket.SOCK_STREAM).connect((host, port))
        return True
    except OSError:
        return False


def _effect_scene_path(efeito: dict) -> Optional[Path]:
    scene_file = efeito.get("scene_file")
    if not scene_file:
        return None
    path = settings.SCENES_DIR / scene_file
    return path if path.exists() else None


# ---------------------------------------------------------------------------
# 1) fal.ai - FLUX (image-to-image, estilo/cenário temático)
# ---------------------------------------------------------------------------

def _fal_error(response):
    if response.status_code in (401, 403):
        return RuntimeError("A fal.ai recusou a chave ou o acesso ao modelo. Confira FAL_KEY.")
    if response.status_code == 402:
        return RuntimeError("A fal.ai informou falta de saldo. Confira os créditos da conta.")
    return RuntimeError(f"A fal.ai retornou HTTP {response.status_code}. Confira o acesso ao modelo e os logs.")


def _queue_url(value):
    parsed = urlparse(value)
    if parsed.scheme != "https" or parsed.hostname != "queue.fal.run":
        raise RuntimeError("A fal.ai retornou uma URL de fila inválida.")
    return value


def generate_with_fal(image: Image.Image, efeito: dict) -> Image.Image:
    if not settings.FAL_KEY:
        raise RuntimeError("Configure FAL_KEY no backend/.env para usar os efeitos de IA.")
    model = settings.FAL_FLUX_MODEL.strip()
    # Modelos antigos de geração não implementam a edição de retrato esperada.
    if model in ("", "fal-ai/flux/dev", "fal-ai/flux-pro"):
        model = "fal-ai/flux-pro/kontext"
    if model not in ("fal-ai/flux-pro/kontext", "fal-ai/flux-pro/kontext/max"):
        raise RuntimeError("Configure FAL_FLUX_MODEL=fal-ai/flux-pro/kontext para editar a foto capturada.")
    buf = io.BytesIO()
    ImageOps.exif_transpose(image).convert("RGB").save(buf, format="JPEG", quality=92)
    data_uri = "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()
    payload = {"image_url": data_uri, "prompt": _portrait_prompt(efeito), "num_images": 1, "output_format": "jpeg"}
    headers = {"Authorization": f"Key {settings.FAL_KEY}"}
    timeout = httpx.Timeout(30.0, connect=15.0)
    logger.info("Gerando efeito %s via fal.ai, modelo %s", efeito["name"], model)
    with httpx.Client(timeout=timeout, follow_redirects=True) as client:
        try:
            response = client.post(f"https://queue.fal.run/{model}", json=payload, headers=headers)
            if response.is_error:
                raise _fal_error(response)
            data = response.json()
            if "status_url" in data:
                status_url = _queue_url(data["status_url"])
                result_url = _queue_url(data["response_url"])
                deadline = time.monotonic() + 240
                while True:
                    status_response = client.get(status_url, headers=headers)
                    if status_response.is_error:
                        raise _fal_error(status_response)
                    status = status_response.json()
                    if status.get("status") == "COMPLETED":
                        result_response = client.get(result_url, headers=headers)
                        if result_response.is_error:
                            raise _fal_error(result_response)
                        data = result_response.json()
                        break
                    if status.get("status") not in ("IN_QUEUE", "IN_PROGRESS"):
                        raise RuntimeError("A fal.ai não concluiu a geração da imagem.")
                    if time.monotonic() >= deadline:
                        raise RuntimeError("A fal.ai excedeu o tempo de espera. A solicitação pode continuar na fila; confira o painel antes de refazer.")
                    time.sleep(2)
            if data.get("error") or not data.get("images"):
                raise RuntimeError("A fal.ai não retornou uma imagem válida para este efeito.")
            image_url = data["images"][0]["url"]
            if urlparse(image_url).scheme != "https":
                raise RuntimeError("A fal.ai retornou uma imagem inválida.")
            # A chave fica somente nas requisições à fila, nunca no download.
            downloaded = client.get(image_url)
            downloaded.raise_for_status()
            return Image.open(io.BytesIO(downloaded.content)).convert("RGB")
        except httpx.TimeoutException as exc:
            raise RuntimeError("A conexão com a fal.ai demorou demais. Confira a solicitação no painel antes de refazer.") from exc
        except httpx.RequestError as exc:
            raise RuntimeError("Não foi possível conectar à fal.ai. Confira a internet do computador.") from exc


def _portrait_prompt(efeito):
    return (
        "Edit the supplied photograph into this artistic style: " + efeito["prompt"] + ". "
        "Apply the style to the actual people and scene, not a decorative border. "
        "Preserve the identity, facial proportions, nose, mouth, jaw, age and eye color "
        "of every person. Keep all people present. No face replacement. "
        "No picture frame, polaroid, border, logo, text or watermark. One full-bleed image."
    )


# ---------------------------------------------------------------------------
# 2) InsightFace - troca de rosto local (ONNX), funciona 100% OFFLINE
# ---------------------------------------------------------------------------

_insightface_app = None
_insightface_swapper = None


def _load_insightface():
    """Carrega os modelos InsightFace sob demanda (lazy) e mantém em cache no processo."""
    global _insightface_app, _insightface_swapper
    if _insightface_app is not None:
        return _insightface_app, _insightface_swapper

    import insightface  # type: ignore
    from insightface.app import FaceAnalysis  # type: ignore

    app_ = FaceAnalysis(name=settings.INSIGHTFACE_MODEL_PACK, root=settings.INSIGHTFACE_ROOT)
    app_.prepare(ctx_id=0, det_size=(640, 640))

    swapper_path = Path(settings.INSIGHTFACE_SWAPPER_MODEL_PATH)
    if not swapper_path.exists():
        raise RuntimeError(
            f"Modelo inswapper não encontrado em {swapper_path}. "
            "Baixe 'inswapper_128.onnx' e coloque nesse caminho para habilitar troca de rosto offline."
        )
    swapper_ = insightface.model_zoo.get_model(str(swapper_path))

    _insightface_app, _insightface_swapper = app_, swapper_
    return _insightface_app, _insightface_swapper


def generate_with_insightface(image: Image.Image, efeito: dict) -> Image.Image:
    """
    Troca o rosto da imagem de cena temática (storage/scenes/<efeito>.jpg) pelo
    rosto capturado no totem. Roda 100% local/offline (sem chamadas de rede) -
    ideal como camada de geração de rosto quando não há internet.
    """
    if not settings.INSIGHTFACE_ENABLED:
        raise RuntimeError("InsightFace desabilitado (INSIGHTFACE_ENABLED=false)")

    scene_path = _effect_scene_path(efeito)
    if scene_path is None:
        raise RuntimeError(f"Sem imagem de cena local para o efeito '{efeito['name']}' (storage/scenes/)")

    import cv2  # type: ignore
    import numpy as np  # type: ignore

    face_app, swapper = _load_insightface()

    source_cv = cv2.cvtColor(np.array(image.convert("RGB")), cv2.COLOR_RGB2BGR)
    scene_img = Image.open(scene_path).convert("RGB")
    target_cv = cv2.cvtColor(np.array(scene_img), cv2.COLOR_RGB2BGR)

    source_faces = face_app.get(source_cv)
    target_faces = face_app.get(target_cv)
    if not source_faces:
        raise RuntimeError("Nenhum rosto detectado na foto original")
    if not target_faces:
        raise RuntimeError(f"Nenhum rosto detectado na cena '{scene_path.name}'")

    result_cv = target_cv.copy()
    for tf in target_faces:
        result_cv = swapper.get(result_cv, tf, source_faces[0], paste_back=True)

    result_rgb = cv2.cvtColor(result_cv, cv2.COLOR_BGR2RGB)
    return Image.fromarray(result_rgb)


# ---------------------------------------------------------------------------
# 3) OpenAI (ChatGPT p/ prompt + gpt-image-1 p/ edição de imagem)
# ---------------------------------------------------------------------------

def _openai_refine_prompt(base_prompt: str) -> str:
    """Usa o ChatGPT para enriquecer o prompt de estilo antes de gerar a imagem."""
    headers = {"Authorization": f"Bearer {settings.OPENAI_API_KEY}", "Content-Type": "application/json"}
    body = {
        "model": settings.OPENAI_TEXT_MODEL,
        "messages": [
            {
                "role": "system",
                "content": "Você é um diretor de arte. Reescreva o prompt de estilo em uma frase técnica e "
                "vívida em inglês para um modelo de geração de imagens, preservando o pedido original.",
            },
            {"role": "user", "content": base_prompt},
        ],
        "max_tokens": 120,
        "temperature": 0.7,
    }
    with httpx.Client(timeout=20.0) as client:
        resp = client.post("https://api.openai.com/v1/chat/completions", json=body, headers=headers)
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"].strip()


def generate_with_openai(image: Image.Image, efeito: dict) -> Image.Image:
    if not settings.OPENAI_API_KEY:
        raise RuntimeError("OPENAI_API_KEY não configurada")

    prompt = _portrait_prompt(efeito)

    buf = io.BytesIO()
    image.convert("RGBA").save(buf, format="PNG")
    buf.seek(0)

    headers = {"Authorization": f"Bearer {settings.OPENAI_API_KEY}"}
    files = {"image": ("original.png", buf, "image/png")}
    data = {
        "model": settings.OPENAI_IMAGE_MODEL,
        "prompt": prompt,
        "size": "1024x1024",
        "n": 1,
    }
    with httpx.Client(timeout=240.0) as client:
        resp = client.post("https://api.openai.com/v1/images/edits", data=data, files=files, headers=headers)
        resp.raise_for_status()
        result = resp.json()
        b64 = result["data"][0]["b64_json"]
        return Image.open(io.BytesIO(base64.b64decode(b64))).convert("RGB")


# ---------------------------------------------------------------------------
# 4) Stability AI (provedor extra opcional - mesmo contrato de plugin)
# ---------------------------------------------------------------------------

def generate_with_stability(image: Image.Image, efeito: dict) -> Image.Image:
    if not settings.STABILITY_API_KEY:
        raise RuntimeError("STABILITY_API_KEY não configurada")

    buf = io.BytesIO()
    image.convert("RGB").save(buf, format="PNG")
    buf.seek(0)

    headers = {"Authorization": f"Bearer {settings.STABILITY_API_KEY}", "Accept": "image/*"}
    files = {"image": ("original.png", buf, "image/png")}
    data = {"prompt": efeito["prompt"], "mode": "image-to-image", "strength": 0.55, "output_format": "jpeg"}
    url = "https://api.stability.ai/v2beta/stable-image/generate/sd3"

    with httpx.Client(timeout=60.0) as client:
        resp = client.post(url, headers=headers, files=files, data=data)
        resp.raise_for_status()
        return Image.open(io.BytesIO(resp.content)).convert("RGB")


# ---------------------------------------------------------------------------
# 5) Motor local (Pillow) - SEMPRE disponível, 100% offline, sem custo de API.
#    É o fallback final e também compõe o rosto sobre a cena local quando existir.
# ---------------------------------------------------------------------------

def generate_with_local(image: Image.Image, efeito: dict) -> Image.Image:
    name = efeito["name"]
    img = image.copy().convert("RGB")

    scene_path = _effect_scene_path(efeito)
    if scene_path is not None:
        # Composição simples e determinística: mescla a cena temática com a foto
        # do usuário (sem exigir detecção facial), garantindo resultado sempre
        # disponível offline mesmo sem InsightFace instalado.
        scene = Image.open(scene_path).convert("RGB").resize(img.size)
        img = Image.blend(scene, img, alpha=0.55)

    if name == "Cartoon":
        img = img.filter(ImageFilter.SMOOTH_MORE)
        img = ImageEnhance.Color(img).enhance(1.8)
        img = ImageEnhance.Contrast(img).enhance(1.3)
    elif name == "Cyberpunk":
        img = ImageEnhance.Color(img).enhance(2.2)
        r, g, b = img.split()
        b = ImageEnhance.Brightness(b).enhance(1.4)
        img = Image.merge("RGB", (r, g, b))
    elif name == "Fantasia":
        img = ImageEnhance.Brightness(img).enhance(1.15)
        img = ImageEnhance.Color(img).enhance(1.5)
        img = img.filter(ImageFilter.GaussianBlur(radius=0.6))
    elif name == "Pintura a Óleo":
        img = img.filter(ImageFilter.EDGE_ENHANCE_MORE)
        img = img.filter(ImageFilter.SMOOTH)
    elif name == "Espaço":
        img = ImageOps.autocontrast(img)
        img = ImageEnhance.Color(img).enhance(0.6)
        img = ImageEnhance.Brightness(img).enhance(0.85)
    elif name == "Super-herói":
        img = ImageEnhance.Contrast(img).enhance(1.6)
        img = ImageEnhance.Sharpness(img).enhance(2.0)
    else:
        img = ImageOps.autocontrast(img)

    return img


PROVIDER_FUNCTIONS = {
    "fal": generate_with_fal,
    "insightface": generate_with_insightface,
    "openai": generate_with_openai,
    "stability": generate_with_stability,
    "local": generate_with_local,
}


def _resolve_chain(efeito: dict) -> List[str]:
    provider = settings.AI_PROVIDER.strip().lower()
    keys = {"fal": settings.FAL_KEY, "openai": settings.OPENAI_API_KEY, "stability": settings.STABILITY_API_KEY}
    if provider in ("auto", "mock"):
        preferred = efeito.get("provider_preferido")
        order = [preferred] + ["fal", "openai", "stability"] if preferred else ["fal", "openai", "stability"]
        chain = list(dict.fromkeys(p for p in order if keys.get(p)))
    elif provider in keys:
        chain = [provider] if keys[provider] else []
    else:
        raise RuntimeError("Os efeitos exigem IA na nuvem. Configure AI_PROVIDER=fal e FAL_KEY no backend/.env.")
    if not chain:
        raise RuntimeError("Nenhum provedor de IA está configurado. Configure AI_PROVIDER=fal e FAL_KEY no backend/.env.")
    return chain


def ensure_ai_configured(efeito):
    _resolve_chain(efeito)


def generate_single_variation(image: Image.Image, efeito: dict, online: bool = True) -> Tuple[Image.Image, str]:
    # Falha explicitamente: nunca devolve um filtro local como se fosse IA.
    chain = _resolve_chain(efeito)
    last_error = None
    for provider in chain:
        try:
            return PROVIDER_FUNCTIONS[provider](image, efeito), provider
        except Exception as exc:
            last_error = exc
            logger.warning("Falha na geração do efeito %s pelo provedor %s (%s)", efeito["name"], provider, type(exc).__name__)
    if isinstance(last_error, RuntimeError):
        raise last_error
    raise RuntimeError("O provedor de IA não concluiu a geração. Confira a chave, o saldo e a conexão.") from last_error


def _sanitize_filename(name: str) -> str:
    replacements = {"á": "a", "à": "a", "ã": "a", "â": "a", "é": "e", "ê": "e",
                    "í": "i", "ó": "o", "ô": "o", "õ": "o", "ú": "u", "ç": "c"}
    result = name.lower().replace(" ", "_")
    for a, b in replacements.items():
        result = result.replace(a, b)
    return result


def generate_variations(
    original_path: Path,
    output_dir: Path,
    session_id: str,
    efeitos: Optional[List[dict]] = None,
) -> Tuple[List[str], List[str], List[str]]:
    """
    Ponto de entrada único usado pela task do Celery.

    `efeitos`: lista de dicts {name, prompt, scene_file, provider_preferido}.
    Se None, usa settings.AI_EFFECT_PROMPTS (fallback de compatibilidade).

    Retorna (caminhos_gerados, nomes_dos_efeitos, provedores_usados).
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    image = Image.open(original_path)
    online = True  # A conexão real ao provedor é o teste; DNS público pode estar bloqueado.

    if efeitos is not None and not efeitos:
        raise RuntimeError("Nenhum efeito selecionado.")
    effect_list = efeitos if efeitos is not None else settings.AI_EFFECT_PROMPTS

    generated_paths: List[str] = []
    effect_names: List[str] = []
    providers_used: List[str] = []

    for i, effect in enumerate(effect_list):
        result_img, provider = generate_single_variation(image, effect, online)

        filename = f"{session_id}_{i}_{_sanitize_filename(effect['name'])}.jpg"
        filepath = output_dir / filename
        result_img.convert("RGB").save(filepath, "JPEG", quality=90)

        generated_paths.append(str(filepath))
        effect_names.append(effect["name"])
        providers_used.append(provider)

    return generated_paths, effect_names, providers_used
