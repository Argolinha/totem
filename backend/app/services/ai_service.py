"""
Vive AI Photobooth
==================

ORQUESTRADOR REAL DE IA

Este arquivo gera variações reais da foto usando:

1. fal.ai / FLUX
2. InsightFace
3. OpenAI Images
4. Stability AI
5. Pillow somente como último fallback

IMPORTANTE:
- NÃO existe mais modo "mock" neste arquivo.
- Se um provedor de IA estiver configurado, ele será usado.
- O Pillow só será usado quando os provedores reais não estiverem
  disponíveis ou falharem.
"""

from __future__ import annotations

import base64
import io
import logging
import socket
import time
from pathlib import Path
from typing import List, Optional, Tuple

import httpx
from PIL import Image, ImageEnhance, ImageFilter, ImageOps

from app.config import settings

logger = logging.getLogger(__name__)


# ============================================================================
# ORDEM DOS PROVEDORES
# ============================================================================

DEFAULT_CHAIN = [
    "fal",
    "openai",
    "stability",
    "insightface",
    "local",
]


# ============================================================================
# VERIFICAÇÃO DE INTERNET
# ============================================================================

def has_internet_connection(
    host: str = "8.8.8.8",
    port: int = 53,
    timeout: float = 2.0,
) -> bool:
    try:
        socket.setdefaulttimeout(timeout)

        connection = socket.socket(
            socket.AF_INET,
            socket.SOCK_STREAM,
        )

        connection.connect((host, port))
        connection.close()

        return True

    except OSError:
        return False


# ============================================================================
# CENAS LOCAIS
# ============================================================================

def _effect_scene_path(efeito: dict) -> Optional[Path]:

    scene_file = efeito.get("scene_file")

    if not scene_file:
        return None

    path = settings.SCENES_DIR / scene_file

    if path.exists():
        return path

    return None


# ============================================================================
# PROMPTS PROFISSIONAIS
# ============================================================================

STYLE_PROMPTS = {

    "Cartoon 3D": """
Create a high-end cinematic 3D cartoon portrait.
Transform the person into a polished stylized 3D character.
Keep the person's face, identity, hairstyle, expression and recognizable
facial features.
Use realistic 3D skin, detailed eyes, cinematic lighting,
soft studio illumination, vibrant colors, premium animated movie quality,
depth of field, detailed clothing and professional composition.
Do not change the person's identity.
""",

    "Anime 3D": """
Transform the portrait into a premium 3D anime character.
Preserve the exact identity, facial structure, hairstyle and expression.
Use detailed anime eyes, cinematic 3D rendering, beautiful lighting,
high quality character design, detailed hair, polished skin,
dramatic composition and professional Japanese animation aesthetics.
Do not replace the person's identity.
""",

    "Anos 80": """
Transform the portrait into a cinematic 1980s retro photograph.
Preserve the person's identity and facial characteristics.
Use authentic 1980s fashion, neon lights, retro studio background,
magenta and cyan lighting, vintage film grain, analog photography,
dramatic shadows, colorful atmosphere and nostalgic cinematic style.
""",

    "Cyberpunk": """
Transform the person into a cinematic cyberpunk character.
Preserve the exact facial identity.
Use futuristic neon city lights, cyan and magenta illumination,
rainy futuristic streets, holographic signs, technological clothing,
cinematic atmosphere, detailed skin, realistic lighting,
high contrast and premium science-fiction movie quality.
""",

    "Aquarela": """
Transform the portrait into an elegant watercolor painting.
Preserve the person's recognizable face, identity and expression.
Use delicate watercolor brush strokes, paper texture,
beautiful color bleeding, artistic highlights,
soft natural colors and professional fine-art composition.
""",

    "Black & White": """
Transform the portrait into an artistic black and white cinematic photograph.
Preserve the exact identity and facial structure.
Use dramatic monochrome lighting, rich shadows,
beautiful skin texture, high dynamic range,
professional photography, subtle film grain and timeless composition.
""",

    "Fantasia": """
Transform the portrait into a cinematic fantasy character.
Preserve the person's identity and facial characteristics.
Use magical lighting, fantasy environment, glowing particles,
epic atmosphere, detailed costume, cinematic depth,
dramatic colors and premium fantasy movie quality.
""",

    "Super-herói": """
Transform the portrait into a cinematic superhero character.
Preserve the person's identity, face, hairstyle and expression.
Use premium superhero costume design, dramatic cinematic lighting,
powerful pose, detailed textures, atmospheric background,
high-end blockbuster movie quality.
""",

    "Pintura Digital": """
Transform the portrait into a premium digital painting.
Preserve the person's identity and recognizable facial characteristics.
Use sophisticated brushwork, detailed skin, artistic lighting,
rich colors, cinematic composition and professional concept-art quality.
""",

    "Futurista": """
Transform the portrait into a futuristic cinematic character.
Preserve the exact person's identity.
Use advanced technology, futuristic architecture,
holographic lighting, metallic details, cinematic illumination,
premium science-fiction visual design and highly detailed rendering.
""",

    "Fashion Editorial": """
Transform the portrait into a luxury fashion editorial photograph.
Preserve the person's exact identity and facial structure.
Use professional studio lighting, luxury styling,
high-end fashion photography, sophisticated composition,
premium skin detail, elegant colors and magazine-quality finish.
""",

    "3D Realista": """
Transform the portrait into a highly detailed realistic 3D character.
Preserve the person's exact identity, face, hairstyle and expression.
Use realistic skin, detailed eyes, realistic hair,
cinematic studio lighting, volumetric light,
physically based rendering and premium 3D quality.
""",
}


def _get_effect_prompt(efeito: dict) -> str:

    name = efeito.get("name", "Estilo AI")

    custom_prompt = efeito.get("prompt")

    # Se o banco tiver um prompt realmente configurado,
    # utiliza esse prompt.
    if custom_prompt and len(custom_prompt.strip()) > 20:
        return custom_prompt.strip()

    if name in STYLE_PROMPTS:
        return STYLE_PROMPTS[name].strip()

    return f"""
Transform this portrait into a professional {name} visual style.
Preserve the exact person's identity, facial structure, hairstyle
and recognizable characteristics.
Create a highly detailed cinematic image with professional lighting,
high quality rendering and beautiful composition.
"""


# ============================================================================
# FAL.AI / FLUX
# ============================================================================

def generate_with_fal(
    image: Image.Image,
    efeito: dict,
) -> Image.Image:

    api_key = getattr(settings, "FAL_KEY", None)

    if not api_key:
        raise RuntimeError(
            "FAL_KEY não configurada."
        )

    prompt = _get_effect_prompt(efeito)

    buffer = io.BytesIO()

    image.convert("RGB").save(
        buffer,
        format="JPEG",
        quality=95,
    )

    image_b64 = base64.b64encode(
        buffer.getvalue()
    ).decode("utf-8")

    data_uri = (
        f"data:image/jpeg;base64,{image_b64}"
    )

    model = getattr(
        settings,
        "FAL_FLUX_MODEL",
        "fal-ai/flux/dev/image-to-image",
    )

    payload = {
        "image_url": data_uri,

        "prompt": f"""
{prompt}

IMPORTANT:
Preserve the exact identity of the person.
Keep the face recognizable.
Do not replace the person.
Do not create another person.
The result must clearly look like the same person
in the requested visual style.
""",

        "strength": 0.65,

        "num_inference_steps": 30,

        "guidance_scale": 4.0,
    }

    headers = {
        "Authorization": f"Key {api_key}",
        "Content-Type": "application/json",
    }

    url = f"https://queue.fal.run/{model}"

    logger.info(
        "Gerando efeito '%s' usando fal.ai / FLUX",
        efeito.get("name"),
    )

    with httpx.Client(timeout=120.0) as client:

        response = client.post(
            url,
            json=payload,
            headers=headers,
        )

        response.raise_for_status()

        result = response.json()

        # ------------------------------------------------------------
        # FAL ASSÍNCRONO
        # ------------------------------------------------------------

        if (
            "status_url" in result
            or "response_url" in result
        ):

            status_url = (
                result.get("status_url")
                or result.get("response_url")
            )

            response_url = (
                result.get("response_url")
                or status_url
            )

            completed = False

            for _ in range(60):

                status_response = client.get(
                    status_url,
                    headers=headers,
                )

                status_response.raise_for_status()

                status_data = status_response.json()

                status = status_data.get(
                    "status"
                )

                if status == "COMPLETED":

                    result = client.get(
                        response_url,
                        headers=headers,
                    ).json()

                    completed = True

                    break

                if status in (
                    "FAILED",
                    "CANCELLED",
                ):
                    raise RuntimeError(
                        f"fal.ai falhou: {status}"
                    )

                time.sleep(2)

            if not completed:
                raise RuntimeError(
                    "Tempo limite aguardando fal.ai."
                )

        # ------------------------------------------------------------
        # IMAGEM
        # ------------------------------------------------------------

        images = result.get("images", [])

        if not images:
            raise RuntimeError(
                f"fal.ai não retornou imagem: {result}"
            )

        image_url = images[0].get("url")

        if not image_url:
            raise RuntimeError(
                "fal.ai retornou imagem sem URL."
            )

        image_response = client.get(
            image_url
        )

        image_response.raise_for_status()

        return Image.open(
            io.BytesIO(
                image_response.content
            )
        ).convert("RGB")


# ============================================================================
# OPENAI
# ============================================================================

def generate_with_openai(
    image: Image.Image,
    efeito: dict,
) -> Image.Image:

    api_key = getattr(
        settings,
        "OPENAI_API_KEY",
        None,
    )

    if not api_key:
        raise RuntimeError(
            "OPENAI_API_KEY não configurada."
        )

    prompt = _get_effect_prompt(efeito)

    logger.info(
        "Gerando efeito '%s' usando OpenAI Images",
        efeito.get("name"),
    )

    buffer = io.BytesIO()

    image.convert("RGBA").save(
        buffer,
        format="PNG",
    )

    buffer.seek(0)

    headers = {
        "Authorization": f"Bearer {api_key}",
    }

    files = {
        "image": (
            "original.png",
            buffer,
            "image/png",
        )
    }

    image_model = getattr(
        settings,
        "OPENAI_IMAGE_MODEL",
        "gpt-image-1",
    )

    data = {
        "model": image_model,

        "prompt": f"""
Transform this portrait into the following visual style:

{prompt}

IMPORTANT REQUIREMENTS:

- Keep the same person.
- Preserve facial identity.
- Preserve recognizable facial features.
- Preserve general face shape.
- Preserve hairstyle when compatible with the style.
- Do not add another person.
- Do not create a different identity.
- Apply the requested visual transformation strongly.
- Produce a polished professional image.
""",

        "size": "1024x1024",

        "n": 1,
    }

    with httpx.Client(timeout=180.0) as client:

        response = client.post(
            "https://api.openai.com/v1/images/edits",
            data=data,
            files=files,
            headers=headers,
        )

        response.raise_for_status()

        result = response.json()

    data_result = result.get("data", [])

    if not data_result:
        raise RuntimeError(
            f"OpenAI não retornou imagem: {result}"
        )

    image_data = data_result[0]

    if "b64_json" in image_data:

        decoded = base64.b64decode(
            image_data["b64_json"]
        )

        return Image.open(
            io.BytesIO(decoded)
        ).convert("RGB")

    if "url" in image_data:

        with httpx.Client(timeout=120.0) as client:

            image_response = client.get(
                image_data["url"]
            )

            image_response.raise_for_status()

            return Image.open(
                io.BytesIO(
                    image_response.content
                )
            ).convert("RGB")

    raise RuntimeError(
        "OpenAI retornou uma resposta sem imagem."
    )


# ============================================================================
# STABILITY AI
# ============================================================================

def generate_with_stability(
    image: Image.Image,
    efeito: dict,
) -> Image.Image:

    api_key = getattr(
        settings,
        "STABILITY_API_KEY",
        None,
    )

    if not api_key:
        raise RuntimeError(
            "STABILITY_API_KEY não configurada."
        )

    prompt = _get_effect_prompt(efeito)

    logger.info(
        "Gerando efeito '%s' usando Stability AI",
        efeito.get("name"),
    )

    buffer = io.BytesIO()

    image.convert("RGB").save(
        buffer,
        format="PNG",
    )

    buffer.seek(0)

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Accept": "image/*",
    }

    files = {
        "image": (
            "original.png",
            buffer,
            "image/png",
        )
    }

    data = {
        "prompt": prompt,

        "mode": "image-to-image",

        "strength": "0.65",

        "output_format": "jpeg",
    }

    url = (
        "https://api.stability.ai/"
        "v2beta/stable-image/generate/sd3"
    )

    with httpx.Client(timeout=180.0) as client:

        response = client.post(
            url,
            headers=headers,
            files=files,
            data=data,
        )

        response.raise_for_status()

        return Image.open(
            io.BytesIO(
                response.content
            )
        ).convert("RGB")


# ============================================================================
# INSIGHTFACE
# ============================================================================

_insightface_app = None
_insightface_swapper = None


def _load_insightface():

    global _insightface_app
    global _insightface_swapper

    if _insightface_app is not None:
        return (
            _insightface_app,
            _insightface_swapper,
        )

    import insightface

    from insightface.app import FaceAnalysis

    app = FaceAnalysis(
        name=settings.INSIGHTFACE_MODEL_PACK,
        root=settings.INSIGHTFACE_ROOT,
    )

    app.prepare(
        ctx_id=0,
        det_size=(640, 640),
    )

    swapper_path = Path(
        settings.INSIGHTFACE_SWAPPER_MODEL_PATH
    )

    if not swapper_path.exists():

        raise RuntimeError(
            "Modelo InsightFace inswapper_128.onnx "
            f"não encontrado em {swapper_path}"
        )

    swapper = insightface.model_zoo.get_model(
        str(swapper_path)
    )

    _insightface_app = app
    _insightface_swapper = swapper

    return (
        _insightface_app,
        _insightface_swapper,
    )


def generate_with_insightface(
    image: Image.Image,
    efeito: dict,
) -> Image.Image:

    if not getattr(
        settings,
        "INSIGHTFACE_ENABLED",
        False,
    ):
        raise RuntimeError(
            "InsightFace desabilitado."
        )

    scene_path = _effect_scene_path(
        efeito
    )

    if scene_path is None:

        raise RuntimeError(
            f"Não existe cena local para "
            f"{efeito.get('name')}"
        )

    import cv2
    import numpy as np

    face_app, swapper = (
        _load_insightface()
    )

    source = cv2.cvtColor(
        np.array(
            image.convert("RGB")
        ),
        cv2.COLOR_RGB2BGR,
    )

    scene = Image.open(
        scene_path
    ).convert("RGB")

    target = cv2.cvtColor(
        np.array(scene),
        cv2.COLOR_RGB2BGR,
    )

    source_faces = face_app.get(
        source
    )

    target_faces = face_app.get(
        target
    )

    if not source_faces:

        raise RuntimeError(
            "Nenhum rosto encontrado na foto."
        )

    if not target_faces:

        raise RuntimeError(
            "Nenhum rosto encontrado na cena."
        )

    result = target.copy()

    for target_face in target_faces:

        result = swapper.get(
            result,
            target_face,
            source_faces[0],
            paste_back=True,
        )

    result_rgb = cv2.cvtColor(
        result,
        cv2.COLOR_BGR2RGB,
    )

    return Image.fromarray(
        result_rgb
    )


# ============================================================================
# FALLBACK LOCAL
# ============================================================================

def generate_with_local(
    image: Image.Image,
    efeito: dict,
) -> Image.Image:

    """
    Este NÃO é o gerador principal.

    Ele existe somente para impedir que o totem fique sem resposta
    quando todas as APIs de IA falharem.
    """

    name = efeito.get(
        "name",
        "Estilo AI",
    )

    img = image.copy().convert(
        "RGB"
    )

    if name in (
        "Black & White",
        "Preto e Branco",
    ):

        img = ImageOps.grayscale(
            img
        ).convert("RGB")

    elif name in (
        "Cartoon 3D",
        "Cartoon",
    ):

        img = img.filter(
            ImageFilter.SMOOTH_MORE
        )

        img = ImageEnhance.Color(
            img
        ).enhance(1.8)

        img = ImageEnhance.Contrast(
            img
        ).enhance(1.3)

    elif name == "Cyberpunk":

        img = ImageEnhance.Color(
            img
        ).enhance(2.0)

        r, g, b = img.split()

        b = ImageEnhance.Brightness(
            b
        ).enhance(1.5)

        img = Image.merge(
            "RGB",
            (r, g, b),
        )

    elif name == "Aquarela":

        img = img.filter(
            ImageFilter.GaussianBlur(
                radius=0.4
            )
        )

        img = ImageEnhance.Color(
            img
        ).enhance(1.4)

    elif name == "Anos 80":

        img = ImageEnhance.Color(
            img
        ).enhance(1.8)

        img = ImageEnhance.Contrast(
            img
        ).enhance(1.2)

    elif name == "Fantasia":

        img = ImageEnhance.Color(
            img
        ).enhance(1.5)

        img = ImageEnhance.Brightness(
            img
        ).enhance(1.1)

    else:

        img = ImageOps.autocontrast(
            img
        )

    return img


# ============================================================================
# PROVEDORES
# ============================================================================

PROVIDER_FUNCTIONS = {

    "fal": generate_with_fal,

    "openai": generate_with_openai,

    "stability": generate_with_stability,

    "insightface": generate_with_insightface,

    "local": generate_with_local,
}


# ============================================================================
# SELEÇÃO DA CADEIA
# ============================================================================

def _resolve_chain(
    efeito: dict,
) -> List[str]:

    provider = str(
        getattr(
            settings,
            "AI_PROVIDER",
            "auto",
        )
    ).lower().strip()

    preferred = efeito.get(
        "provider_preferido"
    )

    # ------------------------------------------------------------
    # LOCAL
    # ------------------------------------------------------------

    if provider == "local":

        return ["local"]

    # ------------------------------------------------------------
    # PROVEDOR ESPECÍFICO
    # ------------------------------------------------------------

    if provider in PROVIDER_FUNCTIONS:

        chain = [provider]

        if provider != "local":
            chain.append("local")

        return chain

    # ------------------------------------------------------------
    # PROVIDER AUTO
    # ------------------------------------------------------------

    if preferred in PROVIDER_FUNCTIONS:

        chain = [preferred]

        for item in DEFAULT_CHAIN:

            if item not in chain:
                chain.append(item)

        return chain

    return list(DEFAULT_CHAIN)


# ============================================================================
# GERA UMA VARIAÇÃO
# ============================================================================

def generate_single_variation(
    image: Image.Image,
    efeito: dict,
    online: bool,
) -> Tuple[Image.Image, str]:

    chain = _resolve_chain(
        efeito
    )

    last_error: Optional[
        Exception
    ] = None

    logger.info(
        "Efeito '%s' -> cadeia: %s",
        efeito.get("name"),
        chain,
    )

    for provider in chain:

        # --------------------------------------------------------
        # APIs externas precisam de internet
        # --------------------------------------------------------

        if (
            provider
            not in (
                "local",
                "insightface",
            )
            and not online
        ):

            logger.warning(
                "Internet indisponível. "
                "Pulando %s.",
                provider,
            )

            continue

        try:

            logger.info(
                "Tentando provedor %s "
                "para efeito %s",
                provider,
                efeito.get("name"),
            )

            function = PROVIDER_FUNCTIONS[
                provider
            ]

            result = function(
                image,
                efeito,
            )

            logger.info(
                "SUCESSO: efeito '%s' "
                "gerado por %s",
                efeito.get("name"),
                provider,
            )

            return (
                result,
                provider,
            )

        except Exception as exc:

            last_error = exc

            logger.exception(
                "Provedor %s falhou "
                "para efeito %s",
                provider,
                efeito.get("name"),
            )

    raise RuntimeError(
        f"Falha ao gerar efeito "
        f"'{efeito.get('name')}': "
        f"{last_error}"
    )


# ============================================================================
# NOME DE ARQUIVO
# ============================================================================

def _sanitize_filename(
    name: str,
) -> str:

    replacements = {
        "á": "a",
        "à": "a",
        "ã": "a",
        "â": "a",
        "é": "e",
        "ê": "e",
        "í": "i",
        "ó": "o",
        "ô": "o",
        "õ": "o",
        "ú": "u",
        "ç": "c",
    }

    result = (
        name.lower()
        .replace(" ", "_")
        .replace("&", "e")
    )

    for original, replacement in (
        replacements.items()
    ):

        result = result.replace(
            original,
            replacement,
        )

    return result


# ============================================================================
# GERA TODAS AS VARIAÇÕES
# ============================================================================

def generate_variations(
    original_path: Path,
    output_dir: Path,
    session_id: str,
    efeitos: Optional[
        List[dict]
    ] = None,
) -> Tuple[
    List[str],
    List[str],
    List[str],
]:

    """
    Gera todas as variações AI.

    Retorna:

        caminhos_gerados
        nomes_dos_efeitos
        provedores_usados
    """

    output_dir.mkdir(
        parents=True,
        exist_ok=True,
    )

    image = Image.open(
        original_path
    ).convert("RGB")

    online = has_internet_connection()

    # ------------------------------------------------------------
    # EFEITOS
    # ------------------------------------------------------------

    if efeitos:

        effect_list = efeitos

    else:

        effect_list = []

        for name, prompt in (
            STYLE_PROMPTS.items()
        ):

            effect_list.append(
                {
                    "name": name,
                    "prompt": prompt,
                    "scene_file": None,
                    "provider_preferido": None,
                }
            )

    generated_paths = []

    effect_names = []

    providers_used = []

    # ------------------------------------------------------------
    # GERA CADA ESTILO
    # ------------------------------------------------------------

    for index, effect in enumerate(
        effect_list
    ):

        logger.info(
            "======================================"
        )

        logger.info(
            "GERANDO IA %s/%s: %s",
            index + 1,
            len(effect_list),
            effect.get("name"),
        )

        logger.info(
            "======================================"
        )

        result_image, provider = (
            generate_single_variation(
                image,
                effect,
                online,
            )
        )

        filename = (
            f"{session_id}_"
            f"{index}_"
            f"{_sanitize_filename(effect['name'])}"
            f".jpg"
        )

        filepath = (
            output_dir / filename
        )

        result_image.convert(
            "RGB"
        ).save(
            filepath,
            "JPEG",
            quality=92,
        )

        generated_paths.append(
            str(filepath)
        )

        effect_names.append(
            effect["name"]
        )

        providers_used.append(
            provider
        )

        logger.info(
            "Imagem salva: %s",
            filepath,
        )

    return (
        generated_paths,
        effect_names,
        providers_used,
    )