"""
Tasks assíncronas do Vive AI Photobooth
=======================================

Processamento das fotos e impressão usando Celery.
"""

from __future__ import annotations

import logging
import secrets
import socket
from datetime import datetime, timedelta
from pathlib import Path

from celery import Celery

from app.config import settings
from app.database import SessionLocal
from app.models import (
    Session as SessionModel,
    Photo,
    SessionStatus,
    PrinterStatus,
)

from app.services import ai_service


logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# CELERY
# ---------------------------------------------------------------------------

celery_app = Celery(
    "vive_ai_photobooth",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="America/Sao_Paulo",
    enable_utc=False,
    task_track_started=True,
    worker_prefetch_multiplier=1,
)


# ---------------------------------------------------------------------------
# CONEXÃO COM INTERNET
# ---------------------------------------------------------------------------

def has_internet_connection(
    host: str = "8.8.8.8",
    port: int = 53,
    timeout: float = 2.0,
) -> bool:
    """
    Verifica rapidamente se existe conexão com a internet.
    """

    try:
        socket.setdefaulttimeout(timeout)

        sock = socket.socket(
            socket.AF_INET,
            socket.SOCK_STREAM,
        )

        sock.connect((host, port))
        sock.close()

        return True

    except OSError:
        return False


# ---------------------------------------------------------------------------
# PROCESSAMENTO DA FOTO
# ---------------------------------------------------------------------------

@celery_app.task(
    bind=True,
    name="app.tasks.process_photo_task",
    max_retries=2,
)
def process_photo_task(
    self,
    session_id: str,
):
    """
    Processa a foto de uma sessão.

    Fluxo:

    1. Localiza a sessão.
    2. Localiza a foto original.
    3. Busca os efeitos configurados.
    4. Gera as variações através do ai_service.
    5. Salva os caminhos gerados.
    6. Salva os nomes dos efeitos.
    7. Gera o token de download.
    8. Define a validade do token.
    9. Marca a sessão como READY.
    """

    db = SessionLocal()

    try:
        logger.info(
            "Iniciando processamento da sessão %s",
            session_id,
        )

        # ---------------------------------------------------------------
        # BUSCAR SESSÃO
        # ---------------------------------------------------------------

        session = (
            db.query(SessionModel)
            .filter(SessionModel.id == session_id)
            .first()
        )

        if session is None:
            logger.error(
                "Sessão %s não encontrada.",
                session_id,
            )

            return {
                "success": False,
                "error": "Sessão não encontrada",
            }

        # ---------------------------------------------------------------
        # STATUS PROCESSING
        # ---------------------------------------------------------------

        try:
            session.status = SessionStatus.PROCESSING
            db.commit()

        except Exception:
            db.rollback()

        # ---------------------------------------------------------------
        # BUSCAR FOTO
        # ---------------------------------------------------------------

        photo = (
            db.query(Photo)
            .filter(Photo.session_id == session.id)
            .order_by(Photo.created_at.desc())
            .first()
        )

        if photo is None:
            raise RuntimeError(
                "Nenhuma foto encontrada para a sessão."
            )

        # ---------------------------------------------------------------
        # CAMINHO DA FOTO ORIGINAL
        # ---------------------------------------------------------------

        if not photo.original_path:
            raise RuntimeError(
                "A foto não possui original_path."
            )

        original_path = Path(photo.original_path)

        if not original_path.exists():
            raise RuntimeError(
                f"Arquivo original não encontrado: {original_path}"
            )

        logger.info(
            "Foto original encontrada: %s",
            original_path,
        )

        # ---------------------------------------------------------------
        # EFEITOS
        # ---------------------------------------------------------------

        efeitos = []

        try:
            from app.models import Efeito

            efeitos_db = (
                db.query(Efeito)
                .filter(Efeito.ativo == True)
                .order_by(Efeito.ordem.asc())
                .all()
            )

            for efeito in efeitos_db:
                efeitos.append(
                    {
                        "name": efeito.nome,
                        "prompt": getattr(
                            efeito,
                            "prompt",
                            efeito.nome,
                        ),
                        "scene_file": getattr(
                            efeito,
                            "scene_file",
                            None,
                        ),
                        "provider_preferido": getattr(
                            efeito,
                            "provider_preferido",
                            None,
                        ),
                    }
                )

        except Exception as exc:
            logger.warning(
                "Não foi possível carregar efeitos do banco: %s",
                exc,
            )

            efeitos = []

        # ---------------------------------------------------------------
        # FALLBACK PARA CONFIGURAÇÃO
        # ---------------------------------------------------------------

        if not efeitos:
            efeitos = settings.AI_EFFECT_PROMPTS

        logger.info(
            "Quantidade de efeitos para processar: %s",
            len(efeitos),
        )

        # ---------------------------------------------------------------
        # GERAR VARIAÇÕES
        # ---------------------------------------------------------------

        generated_paths, effect_names, providers_used = (
            ai_service.generate_variations(
                original_path=original_path,
                output_dir=settings.GENERATED_DIR,
                session_id=str(session.id),
                efeitos=efeitos,
            )
        )

        logger.info(
            "Variações geradas: %s",
            len(generated_paths),
        )

        logger.info(
            "Efeitos utilizados: %s",
            effect_names,
        )

        logger.info(
            "Provedores utilizados: %s",
            providers_used,
        )

        # ---------------------------------------------------------------
        # SALVAR RESULTADOS NA FOTO
        # ---------------------------------------------------------------

        photo.generated_paths = generated_paths
        photo.effect_names = effect_names

        # ---------------------------------------------------------------
        # GERAR TOKEN DE DOWNLOAD
        # ---------------------------------------------------------------

        download_token = secrets.token_urlsafe(32)

        photo.download_token = download_token

        photo.download_token_expires_at = (
            datetime.utcnow()
            + timedelta(
                seconds=settings.DOWNLOAD_TOKEN_EXPIRATION
            )
        )

        logger.info(
            "Token de download criado para foto %s.",
            photo.id,
        )

        logger.info(
            "Token válido até: %s",
            photo.download_token_expires_at,
        )

        # ---------------------------------------------------------------
        # STATUS READY
        # ---------------------------------------------------------------

        session.status = SessionStatus.READY

        db.commit()

        logger.info(
            "Sessão %s processada com sucesso.",
            session_id,
        )

        return {
            "success": True,
            "session_id": str(session.id),
            "generated_paths": generated_paths,
            "effect_names": effect_names,
            "providers_used": providers_used,
            "download_token": download_token,
            "download_token_expires_at": (
                photo.download_token_expires_at.isoformat()
            ),
        }

    except Exception as exc:
        db.rollback()

        logger.exception(
            "Erro ao processar sessão %s: %s",
            session_id,
            exc,
        )

        # ---------------------------------------------------------------
        # MARCAR ERRO
        # ---------------------------------------------------------------

        try:
            session = (
                db.query(SessionModel)
                .filter(SessionModel.id == session_id)
                .first()
            )

            if session is not None:
                session.status = SessionStatus.ERROR
                session.error_message = str(exc)

                db.commit()

        except Exception as db_exc:
            db.rollback()

            logger.error(
                "Não foi possível salvar erro da sessão: %s",
                db_exc,
            )

        # ---------------------------------------------------------------
        # RETRY
        # ---------------------------------------------------------------

        try:
            raise self.retry(
                exc=exc,
                countdown=5,
            )

        except self.MaxRetriesExceededError:
            logger.error(
                "Número máximo de tentativas excedido para sessão %s.",
                session_id,
            )

            return {
                "success": False,
                "session_id": str(session_id),
                "error": str(exc),
            }

    finally:
        db.close()


# ---------------------------------------------------------------------------
# IMPRESSÃO
# ---------------------------------------------------------------------------

@celery_app.task(
    bind=True,
    name="app.tasks.print_photo_task",
    max_retries=2,
)
def print_photo_task(
    self,
    photo_id: str,
):
    """
    Task de impressão.

    Neste momento mantém a integração preparada para a impressora.
    """

    db = SessionLocal()

    try:
        logger.info(
            "Iniciando impressão da foto %s",
            photo_id,
        )

        photo = (
            db.query(Photo)
            .filter(Photo.id == photo_id)
            .first()
        )

        if photo is None:
            raise RuntimeError(
                "Foto não encontrada."
            )

        # ---------------------------------------------------------------
        # STATUS DA IMPRESSORA
        # ---------------------------------------------------------------

        photo.printer_status = PrinterStatus.PRINTING
        db.commit()

        # ---------------------------------------------------------------
        # CAMINHOS DAS IMAGENS
        # ---------------------------------------------------------------

        generated_paths = photo.generated_paths or []

        if not generated_paths:
            raise RuntimeError(
                "Nenhuma imagem gerada disponível para impressão."
            )

        logger.info(
            "Imagens disponíveis para impressão: %s",
            generated_paths,
        )

        # ---------------------------------------------------------------
        # INTEGRAÇÃO COM IMPRESSORA
        # ---------------------------------------------------------------
        #
        # A integração física com a impressora pode ser adicionada aqui.
        #
        # Por enquanto deixamos o fluxo preparado e marcamos como
        # impressão concluída para não bloquear o totem.
        #

        photo.printer_status = PrinterStatus.PRINTED

        db.commit()

        logger.info(
            "Impressão concluída para foto %s.",
            photo_id,
        )

        return {
            "success": True,
            "photo_id": str(photo_id),
        }

    except Exception as exc:
        db.rollback()

        logger.exception(
            "Erro ao imprimir foto %s: %s",
            photo_id,
            exc,
        )

        try:
            photo = (
                db.query(Photo)
                .filter(Photo.id == photo_id)
                .first()
            )

            if photo is not None:
                photo.printer_status = PrinterStatus.ERROR
                db.commit()

        except Exception:
            db.rollback()

        try:
            raise self.retry(
                exc=exc,
                countdown=5,
            )

        except self.MaxRetriesExceededError:
            return {
                "success": False,
                "photo_id": str(photo_id),
                "error": str(exc),
            }

    finally:
        db.close()


# ---------------------------------------------------------------------------
# REPROCESSAMENTO DE SESSÕES PENDENTES
# ---------------------------------------------------------------------------

@celery_app.task(
    name="app.tasks.requeue_pending_sessions_task",
)
def requeue_pending_sessions_task():
    """
    Procura sessões que ficaram presas em PROCESSING e coloca novamente
    na fila de processamento.
    """

    db = SessionLocal()

    try:
        sessions = (
            db.query(SessionModel)
            .filter(
                SessionModel.status == SessionStatus.PROCESSING
            )
            .all()
        )

        count = 0

        for session in sessions:
            process_photo_task.delay(
                str(session.id)
            )

            count += 1

        logger.info(
            "Sessões recolocadas na fila: %s",
            count,
        )

        return {
            "success": True,
            "requeued": count,
        }

    except Exception as exc:
        logger.exception(
            "Erro ao reprocessar sessões pendentes: %s",
            exc,
        )

        return {
            "success": False,
            "error": str(exc),
        }

    finally:
        db.close()