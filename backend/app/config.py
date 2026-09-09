"""
Configurações centrais da aplicação.
Todos os valores podem ser sobrescritos por variáveis de ambiente (.env).
"""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings:
    # Banco de dados
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/vive_photobooth.db")

    # Redis / Celery
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    CELERY_BROKER_URL: str = os.getenv("CELERY_BROKER_URL", REDIS_URL)
    CELERY_RESULT_BACKEND: str = os.getenv("CELERY_RESULT_BACKEND", REDIS_URL)

    # Armazenamento de arquivos
    STORAGE_DIR: Path = BASE_DIR / "storage"
    ORIGINAL_DIR: Path = STORAGE_DIR / "original"
    GENERATED_DIR: Path = STORAGE_DIR / "generated"

    # URL pública do backend (usada para montar o QR Code)
    PUBLIC_BASE_URL: str = os.getenv("PUBLIC_BASE_URL", "http://localhost:8000")

    # Integração com IA
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "mock")  # "mock" | "replicate" | "stability" | "openai"
    REPLICATE_API_TOKEN: str = os.getenv("REPLICATE_API_TOKEN", "")
    STABILITY_API_KEY: str = os.getenv("STABILITY_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")

    # Prompts fixos para as 6 variações do MVP
    AI_EFFECT_PROMPTS = [
        {"name": "Cartoon", "prompt": "cartoon style, vibrant colors, clean lines"},
        {"name": "Cyberpunk", "prompt": "cyberpunk style, neon lights, futuristic city"},
        {"name": "Fantasia", "prompt": "fantasy style, magical, epic lighting"},
        {"name": "Pintura a Óleo", "prompt": "oil painting style, classical art, textured brush strokes"},
        {"name": "Espaço", "prompt": "astronaut in space, stars and galaxy background"},
        {"name": "Super-herói", "prompt": "superhero style, dramatic pose, comic book art"},
    ]

    # Token de download expira em 24h (em segundos)
    DOWNLOAD_TOKEN_EXPIRATION: int = 60 * 60 * 24

    # Identificador do totem (permite múltiplos totens no futuro)
    TOTEM_ID: str = os.getenv("TOTEM_ID", "totem-001")

    # CORS - origens permitidas para o frontend
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")


settings = Settings()

# Garante que os diretórios de armazenamento existam
settings.ORIGINAL_DIR.mkdir(parents=True, exist_ok=True)
settings.GENERATED_DIR.mkdir(parents=True, exist_ok=True)
