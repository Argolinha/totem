"""
Serviço responsável por gerar o token único de download da fotografia
escolhida e montar a URL que será codificada no QR Code exibido no totem.

A geração da imagem do QR Code em si fica a cargo do FRONTEND
(biblioteca `qrcode.react`), que recebe apenas a URL de download deste
backend e a transforma visualmente. Isso evita processamento extra no
servidor e mantém o QR sempre atualizado na tela.
"""
import secrets
from datetime import datetime, timedelta

from app.config import settings


def generate_download_token() -> str:
    """Gera um token aleatório e seguro para identificar o download."""
    return secrets.token_urlsafe(24)


def get_token_expiration() -> datetime:
    """Retorna o timestamp de expiração do token (24h por padrão)."""
    return datetime.utcnow() + timedelta(seconds=settings.DOWNLOAD_TOKEN_EXPIRATION)


def build_download_url(token: str) -> str:
    """Monta a URL pública de download que será codificada no QR Code."""
    return f"{settings.PUBLIC_BASE_URL}/api/download/{token}"
