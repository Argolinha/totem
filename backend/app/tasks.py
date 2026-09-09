"""
Tarefas assíncronas do Celery.

Fluxo principal:
    upload da foto -> process_photo_task (gera 6 variações via IA)
                    -> sessão fica "ready"
    escolha da foto -> print_photo_task (envia para impressora)
                    -> sessão fica "printed"

Fluxo offline:
    Se não há internet no momento do upload, a sessão fica "queued_offline"
    e a tarefa `process_photo_task` é enfileirada com `retry` automático.
    Um beat periódico (`requeue_pending_sessions_task`) varre sessões
    presas em queued_offline e tenta reprocessá-las assim que a conexão
    volta (ver seção de agendamento no celery_app / README).
"""
import logging
import socket

from app.celery_app import celery_app
from app.database import SessionLocal
from app.models import Session as SessionModel, Photo, SessionStatus, PrinterStatus
from app.config import settings
from app.services import ai_service, printer_service

logger = logging.getLogger(__name__)


def has_internet_connection(host: str = "8.8.8.8", port: int = 53, timeout: float = 2.0) -> bool:
    """Verifica rapidamente se há conectividade com a internet."""
    try:
        socket.setdefaulttimeout(timeout)
        socket.socket(socket.AF_INET, socket.SOCK_STREAM).connect((host, port))
        return True
    except OSError:
        return False


@celery_app.task(bind=True, max_retries=20, default_retry_delay=15)
def process_photo_task(self, session_id: str):
    """
    Processa a fotografia de uma sessão: gera as 6 variações via IA.
    Se não houver internet e o provedor de IA exigir rede externa, a
    tarefa se reagenda automaticamente (retry) até a conexão voltar.
    """
    db = SessionLocal()
    try:
        session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
        if not session or not session.photo:
            logger.error(f"Sessão ou foto não encontrada: {session_id}")
            return

        photo = session.photo

        # Provedores externos de IA precisam de internet; o mock local não precisa.
        needs_internet = settings.AI_PROVIDER != "mock"
        if needs_internet and not has_internet_connection():
            session.status = SessionStatus.QUEUED_OFFLINE
            db.commit()
            logger.warning(f"Sem internet - sessão {session_id} permanece na fila offline.")
            raise self.retry()

        session.status = SessionStatus.PROCESSING
        db.commit()

        generated_paths, effect_names = ai_service.generate_variations(
            original_path=photo.original_path,
            output_dir=settings.GENERATED_DIR,
            session_id=session_id,
        )

        # Converte caminhos absolutos em URLs relativas servidas pelo StaticFiles
        generated_urls = [
            f"/static/generated/{p.split('/')[-1]}" for p in generated_paths
        ]

        photo.generated_paths = generated_urls
        photo.effect_names = effect_names
        session.status = SessionStatus.READY
        db.commit()
        logger.info(f"Sessão {session_id}: 6 variações geradas com sucesso.")

    except Exception as exc:  # noqa: BLE001
        db.rollback()
        session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
        if session:
            session.status = SessionStatus.ERROR
            session.error_message = str(exc)
            db.commit()
        logger.exception(f"Erro ao processar sessão {session_id}: {exc}")
    finally:
        db.close()


@celery_app.task(bind=True, max_retries=10, default_retry_delay=10)
def print_photo_task(self, session_id: str):
    """Envia a imagem escolhida para a impressora (simulada no MVP)."""
    db = SessionLocal()
    try:
        session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
        if not session or not session.photo or session.photo.chosen_index is None:
            logger.error(f"Sessão sem escolha definida para impressão: {session_id}")
            return

        photo = session.photo
        session.status = SessionStatus.PRINTING
        db.commit()

        chosen_url = photo.generated_paths[photo.chosen_index]
        filename = chosen_url.split("/")[-1]
        chosen_path = str(settings.GENERATED_DIR / filename)

        status = printer_service.print_photo(chosen_path, session_id)

        photo.printer_status = status
        if status == PrinterStatus.COMPLETED:
            photo.printed = True
            session.status = SessionStatus.PRINTED
        else:
            session.status = SessionStatus.ERROR
            session.error_message = f"Falha de impressão: {status}"
        db.commit()

    except Exception as exc:  # noqa: BLE001
        db.rollback()
        logger.exception(f"Erro ao imprimir sessão {session_id}: {exc}")
        raise self.retry(exc=exc)
    finally:
        db.close()


@celery_app.task
def requeue_pending_sessions_task():
    """
    Tarefa periódica (agendar via celery beat) que varre sessões travadas
    em QUEUED_OFFLINE e tenta reprocessá-las assim que a internet retorna.
    """
    db = SessionLocal()
    try:
        if not has_internet_connection():
            return
        pending = db.query(SessionModel).filter(
            SessionModel.status == SessionStatus.QUEUED_OFFLINE
        ).all()
        for session in pending:
            logger.info(f"Reenviando sessão pendente para processamento: {session.id}")
            process_photo_task.delay(session.id)
    finally:
        db.close()
