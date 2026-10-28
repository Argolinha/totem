"""
Ponto de entrada da aplicação FastAPI - Vive AI Photobooth.
"""

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import init_db, SessionLocal

from app.routes import session, download, admin

from app.auth import ensure_default_admin


logging.basicConfig(
    level=logging.INFO
)


app = FastAPI(
    title="Vive AI Photobooth API",
    description="Backend do totem fotográfico interativo com efeitos de IA.",
    version="1.0.0",
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# DIRETÓRIOS ESTÁTICOS
# ============================================================

app.mount(
    "/static/original",
    StaticFiles(
        directory=str(
            settings.ORIGINAL_DIR
        )
    ),
    name="original",
)


app.mount(
    "/static/generated",
    StaticFiles(
        directory=str(
            settings.GENERATED_DIR
        )
    ),
    name="generated",
)


# ============================================================
# ROTAS
# ============================================================

app.include_router(
    session.router
)

app.include_router(
    download.router
)

app.include_router(
    admin.router
)


# ============================================================
# STARTUP
# ============================================================

@app.on_event("startup")
def on_startup():

    # Cria as tabelas
    init_db()

    # Cria administrador padrão
    db = SessionLocal()

    try:
        ensure_default_admin(db)
    finally:
        db.close()

    logging.info(
        "Vive AI Photobooth API iniciada. Provedor de IA: %s",
        settings.AI_PROVIDER,
    )


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/")
def root():
    return {
        "status": "ok",
        "service": "Vive AI Photobooth API",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }