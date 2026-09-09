"""
Ponto de entrada da aplicação FastAPI - Vive AI Photobooth.

Rodar localmente:
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
"""
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import init_db
from app.routes import session, download

logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="Vive AI Photobooth API",
    description="Backend do totem fotográfico interativo com efeitos de IA.",
    version="1.0.0",
)

# CORS - permite que o frontend (React) acesse a API
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve as imagens originais e geradas como arquivos estáticos
app.mount("/static/original", StaticFiles(directory=str(settings.ORIGINAL_DIR)), name="original")
app.mount("/static/generated", StaticFiles(directory=str(settings.GENERATED_DIR)), name="generated")

app.include_router(session.router)
app.include_router(download.router)


@app.on_event("startup")
def on_startup():
    init_db()
    logging.info("Vive AI Photobooth API iniciada. Provedor de IA: %s", settings.AI_PROVIDER)


@app.get("/")
def root():
    return {"status": "ok", "service": "Vive AI Photobooth API"}


@app.get("/health")
def health():
    return {"status": "healthy"}
