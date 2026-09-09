"""
Serviço responsável por transformar a fotografia original em 6 variações
usando Inteligência Artificial.

Para o MVP, o provedor padrão é "mock": ele gera 6 variações simples
(aplicando filtros de cor/efeito com Pillow) a partir da foto original,
sem depender de nenhuma API externa. Isso permite demonstrar o fluxo
completo do totem sem custos de API nem necessidade de internet.

Quando quiser plugar um provedor real, defina AI_PROVIDER=replicate (ou
stability/openai) no .env e implemente a chamada correspondente — os
pontos de extensão já estão marcados com TODO abaixo.
"""
import io
import logging
from pathlib import Path
from typing import List, Tuple

from PIL import Image, ImageEnhance, ImageFilter, ImageOps

from app.config import settings

logger = logging.getLogger(__name__)


def _apply_mock_effect(image: Image.Image, effect_name: str) -> Image.Image:
    """
    Aplica um efeito visual simples e determinístico usando apenas Pillow,
    simulando 6 "estilos" diferentes de IA para fins de demonstração do MVP.
    """
    img = image.copy().convert("RGB")

    if effect_name == "Cartoon":
        img = img.filter(ImageFilter.SMOOTH_MORE)
        img = ImageEnhance.Color(img).enhance(1.8)
        img = ImageEnhance.Contrast(img).enhance(1.3)
    elif effect_name == "Cyberpunk":
        img = ImageEnhance.Color(img).enhance(2.2)
        r, g, b = img.split()
        b = ImageEnhance.Brightness(b).enhance(1.4)
        img = Image.merge("RGB", (r, g, b))
    elif effect_name == "Fantasia":
        img = ImageEnhance.Brightness(img).enhance(1.15)
        img = ImageEnhance.Color(img).enhance(1.5)
        img = img.filter(ImageFilter.GaussianBlur(radius=0.6))
    elif effect_name == "Pintura a Óleo":
        img = img.filter(ImageFilter.EDGE_ENHANCE_MORE)
        img = img.filter(ImageFilter.SMOOTH)
    elif effect_name == "Espaço":
        img = ImageOps.autocontrast(img)
        img = ImageEnhance.Color(img).enhance(0.6)
        img = ImageEnhance.Brightness(img).enhance(0.85)
    elif effect_name == "Super-herói":
        img = ImageEnhance.Contrast(img).enhance(1.6)
        img = ImageEnhance.Sharpness(img).enhance(2.0)
    else:
        img = ImageOps.autocontrast(img)

    return img


def generate_variations_mock(original_path: Path, output_dir: Path, session_id: str) -> Tuple[List[str], List[str]]:
    """
    Gera 6 variações locais (mock) da foto original usando Pillow.
    Retorna (lista_de_caminhos_relativos, lista_de_nomes_dos_efeitos).
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    image = Image.open(original_path)

    generated_paths: List[str] = []
    effect_names: List[str] = []

    for i, effect in enumerate(settings.AI_EFFECT_PROMPTS):
        name = effect["name"]
        result_img = _apply_mock_effect(image, name)

        filename = f"{session_id}_{i}_{name.lower().replace(' ', '_').replace('á','a').replace('ó','o').replace('ó','o').replace('í','i').replace('ê','e')}.jpg"
        filepath = output_dir / filename
        result_img.save(filepath, "JPEG", quality=88)

        generated_paths.append(str(filepath))
        effect_names.append(name)

    return generated_paths, effect_names


def generate_variations_replicate(original_path: Path, output_dir: Path, session_id: str) -> Tuple[List[str], List[str]]:
    """
    TODO: Integração real com a API da Replicate (ex.: modelos de img2img /
    face-swap / style-transfer).

    Passos esperados nessa implementação real:
      1. Fazer upload da imagem original (ou converter para base64/URL pública).
      2. Para cada prompt em settings.AI_EFFECT_PROMPTS, chamar
         replicate.run(<model_version>, input={"image": ..., "prompt": prompt}).
      3. Baixar a imagem resultante e salvar em output_dir.
      4. Retornar (caminhos, nomes) no mesmo formato do mock.

    Por enquanto, cai no mock para manter o MVP funcional sem chave de API.
    """
    logger.warning("AI_PROVIDER=replicate ainda não implementado - usando fallback mock.")
    return generate_variations_mock(original_path, output_dir, session_id)


def generate_variations(original_path: Path, output_dir: Path, session_id: str) -> Tuple[List[str], List[str]]:
    """Ponto de entrada único: escolhe o provedor de IA configurado."""
    if settings.AI_PROVIDER == "replicate":
        return generate_variations_replicate(original_path, output_dir, session_id)
    # "stability" e "openai" podem ser implementados seguindo o mesmo padrão.
    return generate_variations_mock(original_path, output_dir, session_id)
