"""
Schemas Pydantic usados pela API do Vive AI Photobooth.
"""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field, ConfigDict


# ============================================================
# TOTEM / SESSÃO
# ============================================================

class SessionCreateRequest(BaseModel):
    people_count: int = Field(
        1,
        ge=1,
        le=2,
    )

    totem_id: Optional[str] = None


class SessionResponse(BaseModel):
    id: str
    totem_id: str
    people_count: int
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SessionStatusResponse(BaseModel):
    id: str
    status: str
    error_message: Optional[str] = None
    printer_status: Optional[str] = None


class ChooseImageRequest(BaseModel):
    chosen_index: int = Field(
        ...,
        ge=0,
        le=5,
    )


class ResultsResponse(BaseModel):
    session_id: str
    status: str
    results: List[str] = []
    effect_names: List[str] = []


class QRCodeResponse(BaseModel):
    url: str
    download_url: str
    token: str
    expires_at: datetime
    
class PrinterStatusResponse(BaseModel):
    printer_status: str
    printed: bool


# ============================================================
# LOGIN / ADMIN
# ============================================================

class LoginRequest(BaseModel):
    email: str
    password: str


class AdminUserResponse(BaseModel):
    id: str
    nome: str
    email: str
    role: str

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: AdminUserResponse


# ============================================================
# CLIENTES
# ============================================================

class ClienteCreate(BaseModel):
    nome: str
    email: Optional[str] = None
    telefone: Optional[str] = None
    documento: Optional[str] = None
    empresa: Optional[str] = None
    endereco: Optional[str] = None
    observacoes: Optional[str] = None
    origem: Optional[str] = None
    ativo: bool = True


class ClienteUpdate(BaseModel):
    nome: Optional[str] = None
    email: Optional[str] = None
    telefone: Optional[str] = None
    documento: Optional[str] = None
    empresa: Optional[str] = None
    endereco: Optional[str] = None
    observacoes: Optional[str] = None
    origem: Optional[str] = None
    ativo: Optional[bool] = None


class ClienteResponse(BaseModel):
    id: str
    nome: str
    email: Optional[str] = None
    telefone: Optional[str] = None
    documento: Optional[str] = None
    empresa: Optional[str] = None
    endereco: Optional[str] = None
    observacoes: Optional[str] = None
    origem: Optional[str] = None
    ativo: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============================================================
# EVENTOS
# ============================================================

class EventoCreate(BaseModel):
    cliente_id: str
    nome: str
    local: Optional[str] = None
    data_evento: datetime
    hora_inicio: Optional[str] = None
    hora_fim: Optional[str] = None
    totem_id: Optional[str] = None
    status: str = "agendado"
    efeito_padrao_id: Optional[str] = None
    moldura_padrao_id: Optional[str] = None
    observacoes: Optional[str] = None


class EventoUpdate(BaseModel):
    cliente_id: Optional[str] = None
    nome: Optional[str] = None
    local: Optional[str] = None
    data_evento: Optional[datetime] = None
    hora_inicio: Optional[str] = None
    hora_fim: Optional[str] = None
    totem_id: Optional[str] = None
    status: Optional[str] = None
    efeito_padrao_id: Optional[str] = None
    moldura_padrao_id: Optional[str] = None
    observacoes: Optional[str] = None


class EventoResponse(BaseModel):
    id: str
    cliente_id: str
    orcamento_id: Optional[str] = None
    nome: str
    local: Optional[str] = None
    data_evento: datetime
    hora_inicio: Optional[str] = None
    hora_fim: Optional[str] = None
    totem_id: Optional[str] = None
    status: str
    efeito_padrao_id: Optional[str] = None
    moldura_padrao_id: Optional[str] = None
    observacoes: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============================================================
# ORÇAMENTOS
# ============================================================

class ItemOrcamentoCreate(BaseModel):
    descricao: str
    quantidade: int = Field(1, ge=1)
    valor_unitario: float = Field(0, ge=0)


class ItemOrcamentoResponse(BaseModel):
    id: str
    descricao: str
    quantidade: int
    valor_unitario: float

    model_config = ConfigDict(from_attributes=True)


class OrcamentoCreate(BaseModel):
    cliente_id: str
    titulo: str
    data_evento_prevista: Optional[datetime] = None
    validade: Optional[datetime] = None
    observacoes: Optional[str] = None
    itens: List[ItemOrcamentoCreate] = []


class OrcamentoUpdate(BaseModel):
    cliente_id: Optional[str] = None
    titulo: Optional[str] = None
    data_evento_prevista: Optional[datetime] = None
    validade: Optional[datetime] = None
    observacoes: Optional[str] = None
    status: Optional[str] = None
    itens: Optional[List[ItemOrcamentoCreate]] = None


class OrcamentoResponse(BaseModel):
    id: str
    cliente_id: str
    titulo: str
    data_evento_prevista: Optional[datetime] = None
    valor_total: float
    status: str
    validade: Optional[datetime] = None
    observacoes: Optional[str] = None
    itens: List[ItemOrcamentoResponse] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============================================================
# EFEITOS
# ============================================================

class EfeitoCreate(BaseModel):
    nome: str
    prompt: str
    scene_file: Optional[str] = None
    provider_preferido: Optional[str] = None
    ativo: bool = True
    ordem: int = 0


class EfeitoUpdate(BaseModel):
    nome: Optional[str] = None
    prompt: Optional[str] = None
    scene_file: Optional[str] = None
    provider_preferido: Optional[str] = None
    ativo: Optional[bool] = None
    ordem: Optional[int] = None


class EfeitoResponse(BaseModel):
    id: str
    nome: str
    prompt: str
    scene_file: Optional[str] = None
    provider_preferido: Optional[str] = None
    ativo: bool
    ordem: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============================================================
# MOLDURAS
# ============================================================

class MolduraResponse(BaseModel):
    id: str
    nome: str
    arquivo_path: str
    ativa: bool
    padrao: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============================================================
# DASHBOARD
# ============================================================

class DashboardStatsResponse(BaseModel):
    total_sessions: int
    sessions_hoje: int
    total_fotos_impressas: int
    total_clientes: int
    eventos_agendados: int
    orcamentos_abertos: int
    receita_total_orcamentos_aprovados: float
    sessions_por_status: dict
    fila_offline: int


# ============================================================
# SESSÕES NO ADMIN
# ============================================================

class SessionAdminResponse(BaseModel):
    id: str
    totem_id: str
    people_count: int
    status: str
    error_message: Optional[str] = None
    evento_id: Optional[str] = None
    cliente_id: Optional[str] = None
    created_at: datetime
    results: List[str] = []
    effect_names: List[str] = []
    printed: bool

    model_config = ConfigDict(from_attributes=True)