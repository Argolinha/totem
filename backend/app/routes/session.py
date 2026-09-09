"""
Rotas relacionadas ao ciclo de vida de uma sessão do totem:
criação -> upload -> status -> resultados -> escolha -> qr code
"""
import shutil
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session as DBSession

from app.config import settings
from app.database import get_db
from app.models import Session as SessionModel, Photo, SessionStatus
from app.schemas import (
    SessionCreateRequest,
    SessionResponse,
    SessionStatusResponse,
    ChooseImageRequest,
    ResultsResponse,
    QRCodeResponse,
    PrinterStatusResponse,
)
from app.services import qr_service, printer_service
from app.tasks import process_photo_task, print_photo_task, has_internet_connection

router = APIRouter(prefix="/api", tags=["session"])


@router.post("/session", response_model=SessionResponse)
def create_session(payload: SessionCreateRequest, db: DBSession = Depends(get_db)):
    """Cria uma nova sessão de uso do totem."""
    session = SessionModel(
        people_count=payload.people_count,
        totem_id=payload.totem_id or settings.TOTEM_ID,
        status=SessionStatus.CREATED,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.post("/session/{session_id}/upload", response_model=SessionStatusResponse)
async def upload_photo(session_id: str, file: UploadFile = File(...), db: DBSession = Depends(get_db)):
    """
    Recebe a fotografia original capturada pela webcam do totem.
    Armazena localmente e dispara o processamento de IA em background (Celery).
    Se não houver internet, a sessão fica marcada como fila offline e o
    Celery tentará novamente automaticamente até a conexão retornar.
    """
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Sessão não encontrada")

    # Salva o arquivo original com nome único
    ext = Path(file.filename).suffix or ".jpg"
    filename = f"{session_id}_{uuid.uuid4().hex}{ext}"
    filepath = settings.ORIGINAL_DIR / filename

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    photo = session.photo
    if photo is None:
        photo = Photo(session_id=session.id)
        db.add(photo)

    photo.original_path = str(filepath)
    session.status = SessionStatus.UPLOADED
    db.commit()

    # Se o provedor exigir internet e ela estiver ausente, marca fila offline
    # (a própria task fará o retry/backoff automaticamente).
    if settings.AI_PROVIDER != "mock" and not has_internet_connection():
        session.status = SessionStatus.QUEUED_OFFLINE
        db.commit()

    process_photo_task.delay(session.id)

    db.refresh(session)
    return SessionStatusResponse(id=session.id, status=session.status.value)


@router.get("/session/{session_id}/status", response_model=SessionStatusResponse)
def get_status(session_id: str, db: DBSession = Depends(get_db)):
    """Retorna o status atual da sessão (usado pelo frontend em polling)."""
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Sessão não encontrada")

    printer_status = None
    if session.photo and session.photo.printer_status:
        printer_status = session.photo.printer_status.value

    return SessionStatusResponse(
        id=session.id,
        status=session.status.value,
        error_message=session.error_message,
        printer_status=printer_status,
    )


@router.get("/session/{session_id}/results", response_model=ResultsResponse)
def get_results(session_id: str, db: DBSession = Depends(get_db)):
    """Retorna as 6 imagens geradas pela IA, quando prontas."""
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Sessão não encontrada")

    results = []
    effect_names = []
    if session.photo and session.photo.generated_paths:
        results = [f"{settings.PUBLIC_BASE_URL}{p}" for p in session.photo.generated_paths]
        effect_names = session.photo.effect_names or []

    return ResultsResponse(session_id=session.id, status=session.status.value, results=results, effect_names=effect_names)


@router.post("/session/{session_id}/choose", response_model=SessionStatusResponse)
def choose_image(session_id: str, payload: ChooseImageRequest, db: DBSession = Depends(get_db)):
    """
    Registra a escolha do usuário, gera o token de download e dispara
    a impressão automática em background.
    """
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not session or not session.photo:
        raise HTTPException(status_code=404, detail="Sessão não encontrada")

    if session.status != SessionStatus.READY:
        raise HTTPException(status_code=400, detail="Sessão ainda não está pronta para escolha")

    photo = session.photo
    if not photo.generated_paths or payload.chosen_index >= len(photo.generated_paths):
        raise HTTPException(status_code=400, detail="Índice de imagem inválido")

    photo.chosen_index = payload.chosen_index
    photo.download_token = qr_service.generate_download_token()
    photo.download_token_expires_at = qr_service.get_token_expiration()
    session.status = SessionStatus.CHOSEN
    db.commit()

    # Dispara a impressão automaticamente, sem intervenção do operador
    print_photo_task.delay(session.id)

    db.refresh(session)
    return SessionStatusResponse(id=session.id, status=session.status.value)


@router.get("/session/{session_id}/qr", response_model=QRCodeResponse)
def get_qr_data(session_id: str, db: DBSession = Depends(get_db)):
    """Retorna a URL de download que o frontend deve codificar em QR Code."""
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not session or not session.photo or not session.photo.download_token:
        raise HTTPException(status_code=404, detail="Nenhuma imagem escolhida para esta sessão")

    photo = session.photo
    return QRCodeResponse(
        download_url=qr_service.build_download_url(photo.download_token),
        token=photo.download_token,
        expires_at=photo.download_token_expires_at,
    )


@router.get("/printer/status", response_model=PrinterStatusResponse)
def printer_status(db: DBSession = Depends(get_db)):
    """Consulta o status atual (simulado) da impressora Fujifilm ASK 400."""
    status = printer_service.get_printer_status()
    return PrinterStatusResponse(printer_status=status.value, printed=status.value == "completed")
