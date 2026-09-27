"""
Modelos de banco de dados do Vive AI Photobooth.
"""
import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    Column,
    String,
    DateTime,
    Integer,
    Enum,
    ForeignKey,
    JSON,
    Boolean,
)
from sqlalchemy.orm import relationship

from app.database import Base


def gen_uuid() -> str:
    return str(uuid.uuid4())


# ============================================================
# ENUMS
# ============================================================

class SessionStatus(str, enum.Enum):
    CREATED = "created"
    UPLOADED = "uploaded"
    QUEUED_OFFLINE = "queued_offline"
    PROCESSING = "processing"
    READY = "ready"
    CHOSEN = "chosen"
    PRINTING = "printing"
    PRINTED = "printed"
    ERROR = "error"


class PrinterStatus(str, enum.Enum):
    AVAILABLE = "available"
    PRINTING = "printing"
    COMPLETED = "completed"
    OUT_OF_PAPER = "out_of_paper"
    PRINT_ERROR = "print_error"
    DISCONNECTED = "disconnected"


class EventoStatus(str, enum.Enum):
    AGENDADO = "agendado"
    REALIZADO = "realizado"
    CANCELADO = "cancelado"


class OrcamentoStatus(str, enum.Enum):
    RASCUNHO = "rascunho"
    ENVIADO = "enviado"
    APROVADO = "aprovado"
    RECUSADO = "recusado"
    CONVERTIDO = "convertido"


# ============================================================
# USUÁRIO ADMINISTRATIVO
# ============================================================

class AdminUser(Base):
    __tablename__ = "admin_users"

    id = Column(String, primary_key=True, default=gen_uuid)
    nome = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False, default="admin")
    ativo = Column(Boolean, nullable=False, default=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )


# ============================================================
# CLIENTES
# ============================================================

class Cliente(Base):
    __tablename__ = "clientes"

    id = Column(String, primary_key=True, default=gen_uuid)

    nome = Column(String, nullable=False)
    email = Column(String, nullable=True)
    telefone = Column(String, nullable=True)
    documento = Column(String, nullable=True)
    empresa = Column(String, nullable=True)
    endereco = Column(String, nullable=True)
    observacoes = Column(String, nullable=True)
    origem = Column(String, nullable=True)

    ativo = Column(Boolean, nullable=False, default=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    eventos = relationship(
        "Evento",
        back_populates="cliente",
        cascade="all, delete-orphan",
    )

    orcamentos = relationship(
        "Orcamento",
        back_populates="cliente",
        cascade="all, delete-orphan",
    )


# ============================================================
# EVENTOS
# ============================================================

class Evento(Base):
    __tablename__ = "eventos"

    id = Column(String, primary_key=True, default=gen_uuid)

    cliente_id = Column(
        String,
        ForeignKey("clientes.id"),
        nullable=False,
    )

    orcamento_id = Column(
        String,
        ForeignKey("orcamentos.id"),
        nullable=True,
    )

    nome = Column(String, nullable=False)
    local = Column(String, nullable=True)

    data_evento = Column(DateTime, nullable=False)

    hora_inicio = Column(String, nullable=True)
    hora_fim = Column(String, nullable=True)

    totem_id = Column(String, nullable=True)

    status = Column(
        Enum(EventoStatus),
        nullable=False,
        default=EventoStatus.AGENDADO,
    )

    efeito_padrao_id = Column(String, nullable=True)
    moldura_padrao_id = Column(String, nullable=True)

    observacoes = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    cliente = relationship(
        "Cliente",
        back_populates="eventos",
    )

    orcamento = relationship(
        "Orcamento",
        back_populates="eventos",
        foreign_keys=[orcamento_id],
    )

    sessoes = relationship(
        "Session",
        back_populates="evento",
    )


# ============================================================
# ORÇAMENTOS
# ============================================================

class Orcamento(Base):
    __tablename__ = "orcamentos"

    id = Column(String, primary_key=True, default=gen_uuid)

    cliente_id = Column(
        String,
        ForeignKey("clientes.id"),
        nullable=False,
    )

    titulo = Column(String, nullable=False)

    data_evento_prevista = Column(DateTime, nullable=True)

    # Valor armazenado em centavos
    valor_total = Column(Integer, nullable=False, default=0)

    status = Column(
        Enum(OrcamentoStatus),
        nullable=False,
        default=OrcamentoStatus.RASCUNHO,
    )

    validade = Column(DateTime, nullable=True)
    observacoes = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    cliente = relationship(
        "Cliente",
        back_populates="orcamentos",
    )

    itens = relationship(
        "ItemOrcamento",
        back_populates="orcamento",
        cascade="all, delete-orphan",
    )

    eventos = relationship(
        "Evento",
        back_populates="orcamento",
    )


class ItemOrcamento(Base):
    __tablename__ = "itens_orcamento"

    id = Column(String, primary_key=True, default=gen_uuid)

    orcamento_id = Column(
        String,
        ForeignKey("orcamentos.id"),
        nullable=False,
    )

    descricao = Column(String, nullable=False)
    quantidade = Column(Integer, nullable=False, default=1)

    # Valor armazenado em centavos
    valor_unitario = Column(Integer, nullable=False, default=0)

    created_at = Column(DateTime, default=datetime.utcnow)

    orcamento = relationship(
        "Orcamento",
        back_populates="itens",
    )


# ============================================================
# EFEITOS DE IA
# ============================================================

class Efeito(Base):
    __tablename__ = "efeitos"

    id = Column(String, primary_key=True, default=gen_uuid)

    nome = Column(String, nullable=False)
    prompt = Column(String, nullable=False)

    scene_file = Column(String, nullable=True)

    provider_preferido = Column(
        String,
        nullable=True,
    )

    ativo = Column(
        Boolean,
        nullable=False,
        default=True,
    )

    ordem = Column(
        Integer,
        nullable=False,
        default=0,
    )

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )


# ============================================================
# MOLDURAS
# ============================================================

class Moldura(Base):
    __tablename__ = "molduras"

    id = Column(String, primary_key=True, default=gen_uuid)

    nome = Column(String, nullable=False)

    arquivo_path = Column(
        String,
        nullable=False,
    )

    ativa = Column(
        Boolean,
        nullable=False,
        default=True,
    )

    padrao = Column(
        Boolean,
        nullable=False,
        default=False,
    )

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )


# ============================================================
# SESSÕES DO TOTEM
# ============================================================

class Session(Base):
    __tablename__ = "sessions"

    id = Column(
        String,
        primary_key=True,
        default=gen_uuid,
    )

    totem_id = Column(
        String,
        nullable=False,
        default="totem-001",
    )

    people_count = Column(
        Integer,
        nullable=False,
        default=1,
    )

    status = Column(
        Enum(SessionStatus),
        nullable=False,
        default=SessionStatus.CREATED,
    )

    error_message = Column(
        String,
        nullable=True,
    )

    evento_id = Column(
        String,
        ForeignKey("eventos.id"),
        nullable=True,
    )

    cliente_id = Column(
        String,
        ForeignKey("clientes.id"),
        nullable=True,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    photo = relationship(
        "Photo",
        back_populates="session",
        uselist=False,
        cascade="all, delete-orphan",
    )

    evento = relationship(
        "Evento",
        back_populates="sessoes",
    )


# ============================================================
# FOTOS
# ============================================================

class Photo(Base):
    __tablename__ = "photos"

    id = Column(
        String,
        primary_key=True,
        default=gen_uuid,
    )

    session_id = Column(
        String,
        ForeignKey("sessions.id"),
        nullable=False,
        unique=True,
    )

    # Caminho da foto original
    original_path = Column(
        String,
        nullable=True,
    )

    # Lista das imagens geradas
    generated_paths = Column(
        JSON,
        nullable=True,
    )

    # Nomes dos efeitos
    effect_names = Column(
        JSON,
        nullable=True,
    )

    chosen_index = Column(
        Integer,
        nullable=True,
    )

    download_token = Column(
        String,
        nullable=True,
        unique=True,
    )

    download_token_expires_at = Column(
        DateTime,
        nullable=True,
    )

    printed = Column(
        Boolean,
        default=False,
    )

    printer_status = Column(
        Enum(PrinterStatus),
        nullable=True,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    session = relationship(
        "Session",
        back_populates="photo",
    )