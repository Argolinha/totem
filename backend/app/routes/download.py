"""
Rota pública (sem autenticação) usada pelo usuário final para baixar sua
fotografia via QR Code. Protegida apenas por um token efêmero (expira em 24h).
"""
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session as DBSession

from app.database import get_db
from app.models import Photo
from app.config import settings

router = APIRouter(prefix="/api", tags=["download"])


@router.get("/download/{token}")
def download_photo(token: str, db: DBSession = Depends(get_db)):
    """Serve o arquivo de imagem escolhido pelo usuário, validando o token."""
    photo = db.query(Photo).filter(Photo.download_token == token).first()
    if not photo:
        raise HTTPException(status_code=404, detail="Link inválido")

    if photo.download_token_expires_at and photo.download_token_expires_at < datetime.utcnow():
        raise HTTPException(status_code=410, detail="Link expirado")

    if photo.chosen_index is None or not photo.generated_paths:
        raise HTTPException(status_code=404, detail="Nenhuma imagem escolhida")

    chosen_url = photo.generated_paths[photo.chosen_index]
    filename = chosen_url.split("/")[-1]
    filepath = settings.GENERATED_DIR / filename

    if not filepath.exists():
        raise HTTPException(status_code=404, detail="Arquivo não encontrado")

    return FileResponse(filepath, media_type="image/jpeg", filename="vive-ai-photobooth.jpg")
