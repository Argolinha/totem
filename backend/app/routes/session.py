from pathlib import Path
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import Session as SessionModel
from app.models import SessionStatus, Photo
from app.schemas import (
    SessionCreateRequest,
    SessionResponse,
    SessionStatusResponse,
    ChooseImageRequest,
    ResultsResponse,
    QRCodeResponse,
)
from app.tasks import process_photo_task


router = APIRouter(
    prefix="/api",
    tags=["Session"],
)


# ============================================================
# EFEITOS
# ============================================================

@router.get("/efeitos")
def get_efeitos():
    """
    Retorna os efeitos de IA disponíveis.
    """
    return settings.AI_EFFECT_PROMPTS


# ============================================================
# MOLDURAS
# ============================================================

@router.get("/molduras")
def get_molduras(db: Session = Depends(get_db)):
    """
    Retorna as molduras cadastradas.
    """
    try:
        from app.models import Moldura

        molduras = (
            db.query(Moldura)
            .order_by(Moldura.created_at.desc())
            .all()
        )

        return [
            {
                "id": str(moldura.id),
                "name": getattr(moldura, "name", ""),
                "path": getattr(moldura, "path", ""),
                "active": getattr(moldura, "active", True),
            }
            for moldura in molduras
        ]

    except Exception:
        return []


# ============================================================
# CRIAR SESSÃO
# ============================================================

@router.post(
    "/session",
    response_model=SessionResponse,
)
def create_session(
    payload: SessionCreateRequest,
    db: Session = Depends(get_db),
):
    """
    Cria uma nova sessão do Totem.
    """

    people_count = getattr(
        payload,
        "people_count",
        1,
    )

    if not people_count or people_count < 1:
        people_count = 1

    session = SessionModel(
        totem_id=settings.TOTEM_ID,
        people_count=people_count,
        status=SessionStatus.CREATED,
    )

    db.add(session)
    db.commit()
    db.refresh(session)

    return SessionResponse(
        id=str(session.id),
        totem_id=session.totem_id,
        people_count=session.people_count,
        status=session.status,
        created_at=session.created_at,
    )


# ============================================================
# UPLOAD DA FOTO
# ============================================================

@router.post("/session/{session_id}/upload")
async def upload_photo(
    session_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Recebe a foto original do Totem e inicia o processamento.
    """

    session = (
        db.query(SessionModel)
        .filter(SessionModel.id == session_id)
        .first()
    )

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Sessão não encontrada.",
        )

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="Arquivo inválido.",
        )

    settings.ORIGINAL_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    extension = Path(file.filename).suffix.lower()

    if extension not in [
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
    ]:
        extension = ".jpg"

    filename = f"{session_id}_original{extension}"

    original_path = (
        settings.ORIGINAL_DIR / filename
    )

    contents = await file.read()

    if not contents:
        raise HTTPException(
            status_code=400,
            detail="Arquivo vazio.",
        )

    with open(original_path, "wb") as output:
        output.write(contents)

    photo = Photo(
        session_id=session.id,
        original_path=str(original_path),
        generated_paths=[],
        effect_names=[],
        printed=False,
    )

    db.add(photo)

    session.status = SessionStatus.PROCESSING

    db.commit()
    db.refresh(photo)

    process_photo_task.delay(
        str(session.id)
    )

    return {
        "success": True,
        "session_id": str(session.id),
        "photo_id": str(photo.id),
        "status": session.status,
    }


# ============================================================
# STATUS DA SESSÃO
# ============================================================

@router.get(
    "/session/{session_id}/status",
    response_model=SessionStatusResponse,
)
def get_session_status(
    session_id: str,
    db: Session = Depends(get_db),
):
    """
    Retorna o status atual do processamento.
    """

    session = (
        db.query(SessionModel)
        .filter(SessionModel.id == session_id)
        .first()
    )

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Sessão não encontrada.",
        )

    return SessionStatusResponse(
        id=str(session.id),
        status=session.status,
        error_message=session.error_message,
    )


# ============================================================
# RESULTADOS
# ============================================================

@router.get(
    "/session/{session_id}/results",
    response_model=ResultsResponse,
)
def get_results(
    session_id: str,
    db: Session = Depends(get_db),
):
    """
    Retorna as imagens geradas pela IA.
    """

    session = (
        db.query(SessionModel)
        .filter(SessionModel.id == session_id)
        .first()
    )

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Sessão não encontrada.",
        )

    if not session.photo:
        raise HTTPException(
            status_code=404,
            detail="Foto não encontrada.",
        )

    generated_paths = (
        session.photo.generated_paths or []
    )

    results = []

    for path in generated_paths:

        filename = (
            str(path)
            .replace("\\", "/")
            .split("/")[-1]
        )

        url = (
            f"{settings.PUBLIC_BASE_URL}"
            f"/static/generated/{filename}"
        )

        results.append(url)

    return ResultsResponse(
        session_id=str(session.id),
        status=session.status,
        results=results,
    )


# ============================================================
# ESCOLHER IMAGEM
# ============================================================

@router.post(
    "/session/{session_id}/choose"
)
def choose_image(
    session_id: str,
    payload: ChooseImageRequest,
    db: Session = Depends(get_db),
):
    """
    Define qual imagem gerada foi escolhida.
    """

    session = (
        db.query(SessionModel)
        .filter(SessionModel.id == session_id)
        .first()
    )

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Sessão não encontrada.",
        )

    if not session.photo:
        raise HTTPException(
            status_code=404,
            detail="Foto não encontrada.",
        )

    index = getattr(
        payload,
        "chosen_index",
        None,
    )

    if index is None:
        index = getattr(
            payload,
            "index",
            None,
        )

    if index is None:
        raise HTTPException(
            status_code=400,
            detail="Índice da imagem não informado.",
        )

    generated_paths = (
        session.photo.generated_paths or []
    )

    if index < 0 or index >= len(generated_paths):
        raise HTTPException(
            status_code=400,
            detail="Índice da imagem inválido.",
        )

    session.photo.chosen_index = index

    db.commit()

    return {
        "success": True,
        "session_id": str(session.id),
        "chosen_index": index,
    }


# ============================================================
# QR CODE
# ============================================================

@router.get(
    "/session/{session_id}/qr",
    response_model=QRCodeResponse,
)
def get_qr_code(
    session_id: str,
    db: Session = Depends(get_db),
):
    """
    Retorna os dados necessários para gerar
    o QR Code de download da foto.
    """

    session = (
        db.query(SessionModel)
        .filter(SessionModel.id == session_id)
        .first()
    )

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Sessão não encontrada.",
        )

    if not session.photo:
        raise HTTPException(
            status_code=404,
            detail="Foto não encontrada.",
        )

    token = session.photo.download_token

    if not token:
        raise HTTPException(
            status_code=404,
            detail="Token de download não encontrado.",
        )

    url = (
        f"{settings.PUBLIC_BASE_URL}"
        f"/api/download/{token}"
    )

    expires_at = datetime.utcnow() + timedelta(
        minutes=10
    )

    return QRCodeResponse(
        url=url,
        download_url=url,
        token=token,
        expires_at=expires_at,
    )


# ============================================================
# STATUS DA IMPRESSORA
# ============================================================

@router.get("/printer/status")
def printer_status():
    """
    Retorna o status básico da impressora.
    """

    return {
        "status": "ready",
        "message": "Impressora pronta.",
    }