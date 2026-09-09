"""
Instância do Celery usada para processar tarefas assíncronas e pesadas:
  - Geração das 6 variações de IA (pode levar vários segundos).
  - Envio para impressão.
  - Reprocessamento da fila offline quando a internet retorna.

Rodar o worker:
    celery -A app.celery_app worker --loglevel=info

(Requer um Redis rodando - veja docker-compose.yml)
"""
from celery import Celery

from app.config import settings

celery_app = Celery(
    "vive_photobooth",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=["app.tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="America/Sao_Paulo",
    enable_utc=True,
    task_track_started=True,
    # Retry automático da tarefa de processamento em caso de falha de rede/IA
    task_acks_late=True,
)
