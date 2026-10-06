from pathlib import Path
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, File, HTTPException, Response, UploadFile
from fastapi.responses import StreamingResponse
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
from app.services import camera_service
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
# UPLOAD DA FOTO (helper compartilhado)
# ============================================================

def _get_session_or_404(session_id: str, db: Session) -> SessionModel:
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
    return session


def _finalize_original_photo(
    db: Session,
    session: SessionModel,
    contents: bytes,
    extension: str,
) -> Photo:
    """
    Salva os bytes da foto original (vindos do upload do navegador OU da
    captura DSLR via gphoto2), cria o registro da sessão e dispara o
    processamento de IA. Lógica compartilhada por /upload e /capture-dslr.
    """
    settings.ORIGINAL_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    if extension not in [
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
    ]:
        extension = ".jpg"

    filename = f"{session.id}_original{extension}"
    original_path = settings.ORIGINAL_DIR / filename

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

    return photo


@router.post("/session/{session_id}/upload")
async def upload_photo(
    session_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Recebe a foto original enviada pelo navegador (webcam) e inicia o
    processamento. Para câmeras DSLR (que o navegador não reconhece como
    webcam), use POST /api/session/{session_id}/capture-dslr no lugar deste.
    """

    session = _get_session_or_404(session_id, db)

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="Arquivo inválido.",
        )

    extension = Path(file.filename).suffix.lower()
    contents = await file.read()

    if not contents:
        raise HTTPException(
            status_code=400,
            detail="Arquivo vazio.",
        )

    photo = _finalize_original_photo(db, session, contents, extension)

    return {
        "success": True,
        "session_id": str(session.id),
        "photo_id": str(photo.id),
        "status": session.status,
    }


# ============================================================
# CÂMERA DSLR (tethering via gphoto2 - ex.: Nikon D5100)
# ============================================================

@router.get("/camera/status")
def camera_status():
    """
    Verifica se há uma câmera DSLR conectada via USB e reconhecida pelo
    gphoto2 no backend. Usado pelo frontend para mostrar um indicador de
    conexão na tela de captura.
    """
    return camera_service.get_status()


@router.get("/camera/preview.jpg")
def camera_preview():
    """
    Retorna um frame de pré-visualização (live view) da DSLR em JPEG.
    Pensado para ser chamado repetidamente (polling) pelo frontend para
    simular um "espelho" em tempo real - o gphoto2 não expõe um stream de
    vídeo contínuo, então cada chamada busca um frame novo na câmera.
    """
    try:
        jpeg_bytes = camera_service.capture_preview()
    except camera_service.CameraError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    return Response(
        content=jpeg_bytes,
        media_type="image/jpeg",
        headers={"Cache-Control": "no-store"},
    )


@router.get("/camera/stream.mjpg")
def camera_stream():
    """
    Live view contínuo da DSLR em MJPEG - basta usar a URL num <img src>.
    Muito mais fluido que fazer polling de /camera/preview.jpg, e a câmera
    continua disponível para /capture-dslr no meio do stream.
    """
    status = camera_service.get_status()
    if not status["connected"]:
        raise HTTPException(status_code=503, detail=status["error"] or "Câmera não conectada.")
    return StreamingResponse(
        camera_service.preview_stream(),
        media_type="multipart/x-mixed-replace; boundary=frame",
        headers={"Cache-Control": "no-store"},
    )


@router.post("/session/{session_id}/capture-dslr")
def capture_dslr(
    session_id: str,
    db: Session = Depends(get_db),
):
    """
    Dispara o obturador da câmera DSLR conectada via USB (ex.: Nikon D5100),
    baixa a foto direto da câmera pelo gphoto2 e inicia o processamento -
    substitui o /upload quando o navegador não reconhece a câmera (DSLRs
    não aparecem como webcam/dispositivo de vídeo UVC).
    """

    session = _get_session_or_404(session_id, db)

    try:
        captured_path = camera_service.capture_photo(settings.ORIGINAL_DIR)
    except camera_service.CameraError as exc:
        raise HTTPException(status_code=503, detail=str(exc))

    contents = captured_path.read_bytes()
    extension = captured_path.suffix.lower()
    captured_path.unlink(missing_ok=True)  # o helper já regrava como "<id>_original.ext"

    photo = _finalize_original_photo(db, session, contents, extension)

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