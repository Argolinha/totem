import os
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent


class Settings:

    # ============================================================
    # DATABASE
    # ============================================================

    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        f"sqlite:///{BASE_DIR / 'storage' / 'vive_photobooth.db'}"
    )

    # ============================================================
    # REDIS / CELERY
    # ============================================================

    REDIS_URL: str = os.getenv(
        "REDIS_URL",
        "redis://redis:6379/0"
    )

    CELERY_BROKER_URL: str = os.getenv(
        "CELERY_BROKER_URL",
        REDIS_URL
    )

    CELERY_RESULT_BACKEND: str = os.getenv(
        "CELERY_RESULT_BACKEND",
        REDIS_URL
    )

    # ============================================================
    # STORAGE
    # ============================================================

    STORAGE_DIR: Path = BASE_DIR / "storage"

    ORIGINAL_DIR: Path = STORAGE_DIR / "original"

    GENERATED_DIR: Path = STORAGE_DIR / "generated"

    FRAMES_DIR: Path = STORAGE_DIR / "frames"

    SCENES_DIR: Path = STORAGE_DIR / "scenes"

    # ============================================================
    # URL PÚBLICA
    # ============================================================

    PUBLIC_BASE_URL: str = os.getenv(
        "PUBLIC_BASE_URL",
        "http://localhost:8000"
    )

    # ============================================================
    # INTELIGÊNCIA ARTIFICIAL
    # ============================================================

    AI_PROVIDER: str = os.getenv(
        "AI_PROVIDER",
        "local"
    )

    # ------------------------------------------------------------
    # OpenAI
    # ------------------------------------------------------------

    OPENAI_API_KEY: str = os.getenv(
        "OPENAI_API_KEY",
        ""
    )

    OPENAI_TEXT_MODEL: str = os.getenv(
        "OPENAI_TEXT_MODEL",
        "gpt-4o-mini"
    )

    OPENAI_IMAGE_MODEL: str = os.getenv(
        "OPENAI_IMAGE_MODEL",
        "gpt-image-1"
    )

    # ------------------------------------------------------------
    # Stability AI
    # ------------------------------------------------------------

    STABILITY_API_KEY: str = os.getenv(
        "STABILITY_API_KEY",
        ""
    )

    # ------------------------------------------------------------
    # fal.ai
    # ------------------------------------------------------------

    FAL_KEY: str = os.getenv(
        "FAL_KEY",
        ""
    )

    FAL_FLUX_MODEL: str = os.getenv(
        "FAL_FLUX_MODEL",
        "fal-ai/flux/dev"
    )

    # ------------------------------------------------------------
    # InsightFace
    # ------------------------------------------------------------

    INSIGHTFACE_ENABLED: bool = (
        os.getenv(
            "INSIGHTFACE_ENABLED",
            "false"
        ).lower()
        in ("true", "1", "yes", "on")
    )

    INSIGHTFACE_MODEL_PACK: str = os.getenv(
        "INSIGHTFACE_MODEL_PACK",
        "buffalo_l"
    )

    INSIGHTFACE_ROOT: str = os.getenv(
        "INSIGHTFACE_ROOT",
        str(BASE_DIR / "models")
    )

    INSIGHTFACE_SWAPPER_MODEL_PATH: str = os.getenv(
        "INSIGHTFACE_SWAPPER_MODEL_PATH",
        str(BASE_DIR / "models" / "inswapper_128.onnx")
    )

    # ============================================================
    # EFEITOS / ESTILOS DE IA
    # ============================================================
    #
    # Estes estilos substituem as antigas "bordas".
    #
    # A ideia agora é gerar uma imagem visualmente transformada:
    #
    # Cartoon 3D
    # Anime
    # Anos 80
    # Black & White
    # Aquarela
    # Cyberpunk
    # Fantasia 3D
    # Luxo 3D
    # Galáxia
    # Super-herói 3D
    # Pop Art
    # Retro Gaming
    #
    # ============================================================

    AI_EFFECT_PROMPTS = [

        # --------------------------------------------------------
        # CARTOON 3D
        # --------------------------------------------------------

        {
            "name": "Cartoon 3D",
            "prompt": (
                "Transform the uploaded portrait into a premium high-end "
                "3D cartoon character. Keep the person's recognizable face "
                "and identity. Stylized 3D character, expressive facial "
                "features, polished skin, detailed hair, vibrant colors, "
                "soft cinematic studio lighting, realistic 3D materials, "
                "beautiful depth of field, professional animated movie "
                "quality, charming and modern 3D aesthetic."
            ),
        },

        # --------------------------------------------------------
        # ANIME
        # --------------------------------------------------------

        {
            "name": "Anime",
            "prompt": (
                "Transform the uploaded portrait into a premium modern "
                "Japanese anime character. Preserve the person's recognizable "
                "facial identity, hairstyle and general appearance. Detailed "
                "anime eyes, beautiful hair, clean line art, sophisticated "
                "shading, vibrant colors, cinematic lighting, highly detailed "
                "anime illustration, professional modern anime movie quality."
            ),
        },

        # --------------------------------------------------------
        # ANOS 80
        # --------------------------------------------------------

        {
            "name": "Anos 80",
            "prompt": (
                "Transform the portrait into a spectacular 1980s retro "
                "synthwave scene. Preserve the person's recognizable face "
                "and identity. Neon pink and cyan lights, glowing futuristic "
                "city, retro grid, VHS atmosphere, vintage 1980s aesthetic, "
                "dramatic rim lighting, colorful reflections, cinematic "
                "composition, nostalgic premium retro photography."
            ),
        },

        # --------------------------------------------------------
        # BLACK & WHITE
        # --------------------------------------------------------

        {
            "name": "Black & White",
            "prompt": (
                "Transform the portrait into an elegant premium black and "
                "white cinematic photograph. Preserve the person's identity "
                "and facial characteristics. Deep shadows, beautiful "
                "highlights, sophisticated grayscale tones, dramatic studio "
                "lighting, professional editorial photography, subtle film "
                "grain, timeless black and white photographic aesthetic."
            ),
        },

        # --------------------------------------------------------
        # AQUARELA
        # --------------------------------------------------------

        {
            "name": "Aquarela",
            "prompt": (
                "Transform the portrait into a beautiful hand-painted "
                "watercolor artwork. Preserve the person's recognizable "
                "face and identity. Delicate watercolor washes, artistic "
                "brush strokes, soft pigments, elegant paper texture, "
                "dreamy colors, artistic composition, premium watercolor "
                "illustration, sophisticated handmade painting aesthetic."
            ),
        },

        # --------------------------------------------------------
        # CYBERPUNK
        # --------------------------------------------------------

        {
            "name": "Cyberpunk",
            "prompt": (
                "Transform the uploaded portrait into an ultra-detailed "
                "cyberpunk character. Preserve the person's recognizable "
                "face and identity. Futuristic neon city, cyan and magenta "
                "lights, holographic technology, glowing details, futuristic "
                "clothing, reflective materials, dramatic cinematic lighting, "
                "premium 3D rendering, futuristic movie poster quality."
            ),
        },

        # --------------------------------------------------------
        # FANTASIA 3D
        # --------------------------------------------------------

        {
            "name": "Fantasia 3D",
            "prompt": (
                "Transform the portrait into an epic fantasy 3D character. "
                "Preserve the person's recognizable face and identity. "
                "Magical environment, enchanted forest, glowing particles, "
                "fantasy costume, mystical atmosphere, volumetric lighting, "
                "beautiful cinematic depth, premium 3D character rendering, "
                "fantasy movie quality."
            ),
        },

        # --------------------------------------------------------
        # LUXO 3D
        # --------------------------------------------------------

        {
            "name": "Luxo 3D",
            "prompt": (
                "Transform the portrait into a luxurious premium 3D fashion "
                "portrait. Preserve the person's identity. Elegant black "
                "and gold environment, sophisticated studio lighting, "
                "luxury fashion aesthetic, glossy realistic materials, "
                "premium cinematic composition, beautiful depth of field, "
                "high-end editorial advertising quality."
            ),
        },

        # --------------------------------------------------------
        # GALÁXIA
        # --------------------------------------------------------

        {
            "name": "Galáxia",
            "prompt": (
                "Transform the portrait into an epic cosmic 3D character. "
                "Preserve the person's recognizable face and identity. "
                "Deep space, colorful galaxy, stars, nebulae, blue and purple "
                "cosmic lighting, glowing particles, futuristic atmosphere, "
                "cinematic composition, premium science fiction movie "
                "visual quality."
            ),
        },

        # --------------------------------------------------------
        # SUPER-HERÓI 3D
        # --------------------------------------------------------

        {
            "name": "Super-herói 3D",
            "prompt": (
                "Transform the portrait into a premium superhero 3D character. "
                "Preserve the person's recognizable face and identity. "
                "Heroic cinematic pose, detailed superhero costume, dramatic "
                "lighting, powerful background, dynamic atmosphere, realistic "
                "3D materials, cinematic depth, premium superhero movie "
                "poster quality."
            ),
        },

        # --------------------------------------------------------
        # POP ART
        # --------------------------------------------------------

        {
            "name": "Pop Art",
            "prompt": (
                "Transform the portrait into a bold premium pop art artwork. "
                "Preserve the person's recognizable face and identity. "
                "Vibrant contrasting colors, graphic composition, comic book "
                "influence, halftone textures, strong clean lines, artistic "
                "poster aesthetic, modern gallery-quality pop art."
            ),
        },

        # --------------------------------------------------------
        # RETRO GAMING
        # --------------------------------------------------------

        {
            "name": "Retro Gaming",
            "prompt": (
                "Transform the portrait into a spectacular retro arcade "
                "gaming character. Preserve the person's recognizable face "
                "and identity. Colorful arcade environment, neon lights, "
                "retro gaming elements, futuristic game interface, vibrant "
                "colors, nostalgic 1980s and 1990s arcade atmosphere, "
                "premium 3D character rendering."
            ),
        },
    ]

    # ============================================================
    # DOWNLOAD
    # ============================================================

    DOWNLOAD_TOKEN_EXPIRATION: int = 60 * 60 * 24

    # ============================================================
    # TOTEM
    # ============================================================

    TOTEM_ID: str = os.getenv(
        "TOTEM_ID",
        "totem-001"
    )

    # ============================================================
    # CORS
    # ============================================================

    CORS_ORIGINS = os.getenv(
        "CORS_ORIGINS",
        (
            "http://localhost:5173,"
            "http://localhost:3000,"
            "http://localhost:8000"
        )
    ).split(",")

    # ============================================================
    # ADMIN
    # ============================================================

    AUTH_SECRET_KEY: str = os.getenv(
        "AUTH_SECRET_KEY",
        "vive-ai-photobooth-dev-secret-change-me"
    )

    ADMIN_EMAIL: str = os.getenv(
        "ADMIN_EMAIL",
        "admin@vive.local"
    )

    ADMIN_PASSWORD: str = os.getenv(
        "ADMIN_PASSWORD",
        "admin123"
    )


# ================================================================
# INSTÂNCIA GLOBAL
# ================================================================

settings = Settings()


# ================================================================
# CRIAÇÃO DAS PASTAS
# ================================================================

settings.STORAGE_DIR.mkdir(
    parents=True,
    exist_ok=True
)

settings.ORIGINAL_DIR.mkdir(
    parents=True,
    exist_ok=True
)

settings.GENERATED_DIR.mkdir(
    parents=True,
    exist_ok=True
)

settings.FRAMES_DIR.mkdir(
    parents=True,
    exist_ok=True
)

settings.SCENES_DIR.mkdir(
    parents=True,
    exist_ok=True
)