"""
Modelos de banco de dados.

Session: representa uma sessão de uso do totem (do "toque para começar" até a impressão).
Photo: representa a fotografia original e as variações geradas por IA para uma sessão.
"""
import enum
import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, Integer, Enum, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship

from app.database import Base


def gen_uuid() -> str:
    return str(uuid.uuid4())


class SessionStatus(str, enum.Enum):
    CREATED = "created"                # sessão criada, aguardando foto
    UPLOADED = "uploaded"              # foto recebida, aguardando processamento
    QUEUED_OFFLINE = "queued_offline"  # sem internet, foto na fila local
    PROCESSING = "processing"          # IA processando as 6 variações
    READY = "ready"                    # 6 resultados prontos para escolha
    CHOSEN = "chosen"                  # usuário escolheu uma imagem
    PRINTING = "printing"              # imagem enviada para impressão
    PRINTED = "printed"                # impressão concluída - fluxo finalizado
    ERROR = "error"                    # erro em qualquer etapa


class PrinterStatus(str, enum.Enum):
    AVAILABLE = "available"
    PRINTING = "printing"
    COMPLETED = "completed"
    OUT_OF_PAPER = "out_of_paper"
    PRINT_ERROR = "print_error"
    DISCONNECTED = "disconnected"


class Session(Base):
    __tablename__ = "sessions"

    id = Column(String, primary_key=True, default=gen_uuid)
    totem_id = Column(String, nullable=False, default="totem-001")
    people_count = Column(Integer, nullable=False, default=1)  # 1 ou 2 pessoas
    status = Column(Enum(SessionStatus), nullable=False, default=SessionStatus.CREATED)
    error_message = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    photo = relationship("Photo", back_populates="session", uselist=False, cascade="all, delete-orphan")


class Photo(Base):
    __tablename__ = "photos"

    id = Column(String, primary_key=True, default=gen_uuid)
    session_id = Column(String, ForeignKey("sessions.id"), nullable=False, unique=True)

    original_path = Column(String, nullable=True)       # caminho da foto original no disco
    generated_paths = Column(JSON, nullable=True)        # lista com os 6 caminhos/urls gerados
    effect_names = Column(JSON, nullable=True)           # nomes dos efeitos aplicados (mesma ordem)

    chosen_index = Column(Integer, nullable=True)         # índice (0-5) escolhido pelo usuário
    download_token = Column(String, nullable=True, unique=True)
    download_token_expires_at = Column(DateTime, nullable=True)

    printed = Column(Boolean, default=False)
    printer_status = Column(Enum(PrinterStatus), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    session = relationship("Session", back_populates="photo")
