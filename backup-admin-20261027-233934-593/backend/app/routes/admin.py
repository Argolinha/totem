"""
Rotas administrativas (painel /admin do frontend) - substituem TODOS os dados
mockados das telas de admin por operações reais no banco de dados.

Todas as rotas (exceto /auth/login) exigem header `Authorization: Bearer <token>`,
obtido em POST /api/admin/auth/login.
"""
import shutil
import uuid
from datetime import datetime, date
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from sqlalchemy import func
from sqlalchemy.orm import Session as DBSession

from app.auth import authenticate_admin, create_access_token, get_current_admin, require_role
from app.config import settings
from app.database import get_db
from app.models import (
    AdminUser, Cliente, Evento, EventoStatus, Orcamento, OrcamentoStatus,
    ItemOrcamento, Efeito, Moldura, Session as SessionModel, SessionStatus, Photo,
)
from app.schemas import (
    LoginRequest, TokenResponse, AdminUserResponse,
    ClienteCreate, ClienteUpdate, ClienteResponse,
    EventoCreate, EventoUpdate, EventoResponse,
    OrcamentoCreate, OrcamentoUpdate, OrcamentoResponse, ItemOrcamentoResponse,
    EfeitoCreate, EfeitoUpdate, EfeitoResponse, MolduraResponse,
    DashboardStatsResponse, SessionAdminResponse,
)
from app.tasks import process_photo_task

router = APIRouter(prefix="/api/admin", tags=["admin"])


# ---------------------------------------------------------------------------
# Autenticação
# ---------------------------------------------------------------------------

@router.post("/auth/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: DBSession = Depends(get_db)):
    user = authenticate_admin(db, payload.email, payload.password)
    if not user:
        raise HTTPException(status_code=401, detail="Email ou senha inválidos")
    token = create_access_token(subject=user.id, extra_claims={"role": user.role, "email": user.email})
    return TokenResponse(access_token=token, user=AdminUserResponse.model_validate(user))


@router.get("/auth/me", response_model=AdminUserResponse)
def me(current_user: AdminUser = Depends(get_current_admin)):
    return current_user


# ---------------------------------------------------------------------------
# Clientes (CRM) - tela clientes.tsx / AdicionarCliente.tsx
# ---------------------------------------------------------------------------

@router.get("/clientes", response_model=List[ClienteResponse])
def listar_clientes(
    q: Optional[str] = Query(None, description="Busca por nome, email ou telefone"),
    ativo: Optional[bool] = None,
    db: DBSession = Depends(get_db),
    _user: AdminUser = Depends(get_current_admin),
):
    query = db.query(Cliente)
    if q:
        like = f"%{q}%"
        query = query.filter((Cliente.nome.ilike(like)) | (Cliente.email.ilike(like)) | (Cliente.telefone.ilike(like)))
    if ativo is not None:
        query = query.filter(Cliente.ativo == ativo)
    return query.order_by(Cliente.nome).all()


@router.post("/clientes", response_model=ClienteResponse, status_code=201)
def criar_cliente(payload: ClienteCreate, db: DBSession = Depends(get_db), _user: AdminUser = Depends(get_current_admin)):
    cliente = Cliente(**payload.model_dump())
    db.add(cliente)
    db.commit()
    db.refresh(cliente)
    return cliente


@router.get("/clientes/{cliente_id}", response_model=ClienteResponse)
def obter_cliente(cliente_id: str, db: DBSession = Depends(get_db), _user: AdminUser = Depends(get_current_admin)):
    cliente = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    if not cliente:
        raise HTTPException(404, "Cliente não encontrado")
    return cliente


@router.put("/clientes/{cliente_id}", response_model=ClienteResponse)
def atualizar_cliente(cliente_id: str, payload: ClienteUpdate, db: DBSession = Depends(get_db), _user: AdminUser = Depends(get_current_admin)):
    cliente = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    if not cliente:
        raise HTTPException(404, "Cliente não encontrado")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(cliente, field, value)
    db.commit()
    db.refresh(cliente)
    return cliente


@router.delete("/clientes/{cliente_id}", status_code=204)
def remover_cliente(cliente_id: str, db: DBSession = Depends(get_db), _user: AdminUser = Depends(require_role("admin"))):
    cliente = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    if not cliente:
        raise HTTPException(404, "Cliente não encontrado")
    db.delete(cliente)
    db.commit()


# ---------------------------------------------------------------------------
# Eventos - tela Eventos.tsx
# ---------------------------------------------------------------------------

@router.get("/eventos", response_model=List[EventoResponse])
def listar_eventos(
    status: Optional[str] = None,
    cliente_id: Optional[str] = None,
    db: DBSession = Depends(get_db),
    _user: AdminUser = Depends(get_current_admin),
):
    query = db.query(Evento)
    if status:
        query = query.filter(Evento.status == status)
    if cliente_id:
        query = query.filter(Evento.cliente_id == cliente_id)
    return query.order_by(Evento.data_evento.desc()).all()


@router.post("/eventos", response_model=EventoResponse, status_code=201)
def criar_evento(payload: EventoCreate, db: DBSession = Depends(get_db), _user: AdminUser = Depends(get_current_admin)):
    cliente = db.query(Cliente).filter(Cliente.id == payload.cliente_id).first()
    if not cliente:
        raise HTTPException(400, "Cliente informado não existe")
    evento = Evento(**payload.model_dump())
    db.add(evento)
    db.commit()
    db.refresh(evento)
    return evento


@router.put("/eventos/{evento_id}", response_model=EventoResponse)
def atualizar_evento(evento_id: str, payload: EventoUpdate, db: DBSession = Depends(get_db), _user: AdminUser = Depends(get_current_admin)):
    evento = db.query(Evento).filter(Evento.id == evento_id).first()
    if not evento:
        raise HTTPException(404, "Evento não encontrado")
    data = payload.model_dump(exclude_unset=True)
    if "status" in data and data["status"]:
        data["status"] = EventoStatus(data["status"])
    for field, value in data.items():
        setattr(evento, field, value)
    db.commit()
    db.refresh(evento)
    return evento


@router.delete("/eventos/{evento_id}", status_code=204)
def remover_evento(evento_id: str, db: DBSession = Depends(get_db), _user: AdminUser = Depends(require_role("admin"))):
    evento = db.query(Evento).filter(Evento.id == evento_id).first()
    if not evento:
        raise HTTPException(404, "Evento não encontrado")
    db.delete(evento)
    db.commit()


# ---------------------------------------------------------------------------
# Orçamentos - tela Orcamentos.tsx
# ---------------------------------------------------------------------------

def _orcamento_to_response(o: Orcamento) -> OrcamentoResponse:
    return OrcamentoResponse(
        id=o.id, cliente_id=o.cliente_id, titulo=o.titulo,
        data_evento_prevista=o.data_evento_prevista,
        valor_total=o.valor_total / 100,
        status=o.status.value if hasattr(o.status, "value") else o.status,
        validade=o.validade, observacoes=o.observacoes,
        itens=[ItemOrcamentoResponse(id=i.id, descricao=i.descricao, quantidade=i.quantidade,
                                      valor_unitario=i.valor_unitario / 100) for i in o.itens],
        created_at=o.created_at,
    )


@router.get("/orcamentos", response_model=List[OrcamentoResponse])
def listar_orcamentos(status: Optional[str] = None, db: DBSession = Depends(get_db), _user: AdminUser = Depends(get_current_admin)):
    query = db.query(Orcamento)
    if status:
        query = query.filter(Orcamento.status == status)
    orcamentos = query.order_by(Orcamento.created_at.desc()).all()
    return [_orcamento_to_response(o) for o in orcamentos]


@router.post("/orcamentos", response_model=OrcamentoResponse, status_code=201)
def criar_orcamento(payload: OrcamentoCreate, db: DBSession = Depends(get_db), _user: AdminUser = Depends(get_current_admin)):
    cliente = db.query(Cliente).filter(Cliente.id == payload.cliente_id).first()
    if not cliente:
        raise HTTPException(400, "Cliente informado não existe")

    total_centavos = sum(int(round(item.valor_unitario * 100)) * item.quantidade for item in payload.itens)
    orcamento = Orcamento(
        cliente_id=payload.cliente_id,
        titulo=payload.titulo,
        data_evento_prevista=payload.data_evento_prevista,
        validade=payload.validade,
        observacoes=payload.observacoes,
        valor_total=total_centavos,
    )
    db.add(orcamento)
    db.flush()

    for item in payload.itens:
        db.add(ItemOrcamento(
            orcamento_id=orcamento.id,
            descricao=item.descricao,
            quantidade=item.quantidade,
            valor_unitario=int(round(item.valor_unitario * 100)),
        ))
    db.commit()
    db.refresh(orcamento)
    return _orcamento_to_response(orcamento)


@router.put("/orcamentos/{orcamento_id}", response_model=OrcamentoResponse)
def atualizar_orcamento(orcamento_id: str, payload: OrcamentoUpdate, db: DBSession = Depends(get_db), _user: AdminUser = Depends(get_current_admin)):
    orcamento = db.query(Orcamento).filter(Orcamento.id == orcamento_id).first()
    if not orcamento:
        raise HTTPException(404, "Orçamento não encontrado")

    data = payload.model_dump(exclude_unset=True)
    itens = data.pop("itens", None)
    if "status" in data and data["status"]:
        data["status"] = OrcamentoStatus(data["status"])
    for field, value in data.items():
        setattr(orcamento, field, value)

    if itens is not None:
        db.query(ItemOrcamento).filter(ItemOrcamento.orcamento_id == orcamento.id).delete()
        total_centavos = 0
        for item in itens:
            valor_centavos = int(round(item["valor_unitario"] * 100))
            total_centavos += valor_centavos * item["quantidade"]
            db.add(ItemOrcamento(orcamento_id=orcamento.id, descricao=item["descricao"],
                                  quantidade=item["quantidade"], valor_unitario=valor_centavos))
        orcamento.valor_total = total_centavos

    db.commit()
    db.refresh(orcamento)
    return _orcamento_to_response(orcamento)


@router.post("/orcamentos/{orcamento_id}/converter-em-evento", response_model=EventoResponse, status_code=201)
def converter_orcamento_em_evento(orcamento_id: str, db: DBSession = Depends(get_db), _user: AdminUser = Depends(get_current_admin)):
    """Fluxo real de CRM: orçamento aprovado vira evento agendado automaticamente."""
    orcamento = db.query(Orcamento).filter(Orcamento.id == orcamento_id).first()
    if not orcamento:
        raise HTTPException(404, "Orçamento não encontrado")
    if not orcamento.data_evento_prevista:
        raise HTTPException(400, "Orçamento não possui data prevista para o evento")

    evento = Evento(
        cliente_id=orcamento.cliente_id,
        orcamento_id=orcamento.id,
        nome=orcamento.titulo,
        data_evento=orcamento.data_evento_prevista,
        status=EventoStatus.AGENDADO,
    )
    orcamento.status = OrcamentoStatus.CONVERTIDO
    db.add(evento)
    db.commit()
    db.refresh(evento)
    return evento


@router.delete("/orcamentos/{orcamento_id}", status_code=204)
def remover_orcamento(orcamento_id: str, db: DBSession = Depends(get_db), _user: AdminUser = Depends(require_role("admin"))):
    orcamento = db.query(Orcamento).filter(Orcamento.id == orcamento_id).first()
    if not orcamento:
        raise HTTPException(404, "Orçamento não encontrado")
    db.delete(orcamento)
    db.commit()


# ---------------------------------------------------------------------------
# Efeitos de IA - tela Efeitos.tsx (substitui settings.AI_EFFECT_PROMPTS fixo)
# ---------------------------------------------------------------------------

@router.get("/efeitos", response_model=List[EfeitoResponse])
def listar_efeitos(db: DBSession = Depends(get_db), _user: AdminUser = Depends(get_current_admin)):
    return db.query(Efeito).order_by(Efeito.ordem).all()


@router.post("/efeitos", response_model=EfeitoResponse, status_code=201)
def criar_efeito(payload: EfeitoCreate, db: DBSession = Depends(get_db), _user: AdminUser = Depends(get_current_admin)):
    efeito = Efeito(**payload.model_dump())
    db.add(efeito)
    db.commit()
    db.refresh(efeito)
    return efeito


@router.put("/efeitos/{efeito_id}", response_model=EfeitoResponse)
def atualizar_efeito(efeito_id: str, payload: EfeitoUpdate, db: DBSession = Depends(get_db), _user: AdminUser = Depends(get_current_admin)):
    efeito = db.query(Efeito).filter(Efeito.id == efeito_id).first()
    if not efeito:
        raise HTTPException(404, "Efeito não encontrado")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(efeito, field, value)
    db.commit()
    db.refresh(efeito)
    return efeito


@router.delete("/efeitos/{efeito_id}", status_code=204)
def remover_efeito(efeito_id: str, db: DBSession = Depends(get_db), _user: AdminUser = Depends(require_role("admin"))):
    efeito = db.query(Efeito).filter(Efeito.id == efeito_id).first()
    if not efeito:
        raise HTTPException(404, "Efeito não encontrado")
    db.delete(efeito)
    db.commit()


@router.post("/efeitos/{efeito_id}/scene", response_model=EfeitoResponse)
async def upload_cena_efeito(efeito_id: str, file: UploadFile = File(...), db: DBSession = Depends(get_db), _user: AdminUser = Depends(get_current_admin)):
    """Upload da imagem de cena temática usada pelo InsightFace/fallback local para este efeito."""
    efeito = db.query(Efeito).filter(Efeito.id == efeito_id).first()
    if not efeito:
        raise HTTPException(404, "Efeito não encontrado")

    ext = Path(file.filename).suffix or ".jpg"
    filename = f"{efeito.id}{ext}"
    filepath = settings.SCENES_DIR / filename
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    efeito.scene_file = filename
    db.commit()
    db.refresh(efeito)
    return efeito


# ---------------------------------------------------------------------------
# Molduras - tela Molduras.tsx
# ---------------------------------------------------------------------------

FRAMES_DIR = settings.STORAGE_DIR / "frames"
FRAMES_DIR.mkdir(parents=True, exist_ok=True)


@router.get("/molduras", response_model=List[MolduraResponse])
def listar_molduras(db: DBSession = Depends(get_db), _user: AdminUser = Depends(get_current_admin)):
    return db.query(Moldura).order_by(Moldura.created_at.desc()).all()


@router.post("/molduras", response_model=MolduraResponse, status_code=201)
async def criar_moldura(
    nome: str,
    padrao: bool = False,
    file: UploadFile = File(...),
    db: DBSession = Depends(get_db),
    _user: AdminUser = Depends(get_current_admin),
):
    ext = Path(file.filename).suffix or ".png"
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = FRAMES_DIR / filename
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    if padrao:
        db.query(Moldura).update({Moldura.padrao: False})

    moldura = Moldura(nome=nome, arquivo_path=f"/static/frames/{filename}", padrao=padrao)
    db.add(moldura)
    db.commit()
    db.refresh(moldura)
    return moldura


@router.delete("/molduras/{moldura_id}", status_code=204)
def remover_moldura(moldura_id: str, db: DBSession = Depends(get_db), _user: AdminUser = Depends(require_role("admin"))):
    moldura = db.query(Moldura).filter(Moldura.id == moldura_id).first()
    if not moldura:
        raise HTTPException(404, "Moldura não encontrada")
    db.delete(moldura)
    db.commit()


# ---------------------------------------------------------------------------
# Sessões / Fila / Fotos - telas Fila.tsx, Fotos.tsx, Impressao.tsx
# ---------------------------------------------------------------------------

def _session_to_admin_response(s: SessionModel) -> SessionAdminResponse:
    results, effect_names, printed = [], [], False
    if s.photo:
        results = [f"{settings.PUBLIC_BASE_URL}{p}" for p in (s.photo.generated_paths or [])]
        effect_names = s.photo.effect_names or []
        printed = bool(s.photo.printed)
    return SessionAdminResponse(
        id=s.id, totem_id=s.totem_id, people_count=s.people_count,
        status=s.status.value, error_message=s.error_message,
        evento_id=s.evento_id, cliente_id=s.cliente_id,
        created_at=s.created_at, results=results, effect_names=effect_names, printed=printed,
    )


@router.get("/sessions", response_model=List[SessionAdminResponse])
def listar_sessions(
    status: Optional[str] = None,
    limit: int = Query(100, le=500),
    db: DBSession = Depends(get_db),
    _user: AdminUser = Depends(get_current_admin),
):
    query = db.query(SessionModel)
    if status:
        query = query.filter(SessionModel.status == status)
    sessions = query.order_by(SessionModel.created_at.desc()).limit(limit).all()
    return [_session_to_admin_response(s) for s in sessions]


@router.post("/sessions/{session_id}/reprocess", response_model=SessionAdminResponse)
def reprocessar_session(session_id: str, db: DBSession = Depends(get_db), _user: AdminUser = Depends(get_current_admin)):
    """Permite ao operador forçar o reprocessamento de uma sessão presa em erro/offline."""
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not session:
        raise HTTPException(404, "Sessão não encontrada")
    session.status = SessionStatus.UPLOADED
    session.error_message = None
    db.commit()
    process_photo_task.delay(session.id)
    db.refresh(session)
    return _session_to_admin_response(session)


# ---------------------------------------------------------------------------
# Dashboard / Relatórios - telas Dashboard.tsx, Relatorios.tsx
# ---------------------------------------------------------------------------

@router.get("/dashboard/stats", response_model=DashboardStatsResponse)
def dashboard_stats(db: DBSession = Depends(get_db), _user: AdminUser = Depends(get_current_admin)):
    total_sessions = db.query(func.count(SessionModel.id)).scalar() or 0

    hoje_inicio = datetime.combine(date.today(), datetime.min.time())
    sessions_hoje = db.query(func.count(SessionModel.id)).filter(SessionModel.created_at >= hoje_inicio).scalar() or 0

    total_impressas = db.query(func.count(Photo.id)).filter(Photo.printed.is_(True)).scalar() or 0
    total_clientes = db.query(func.count(Cliente.id)).filter(Cliente.ativo.is_(True)).scalar() or 0
    eventos_agendados = db.query(func.count(Evento.id)).filter(Evento.status == EventoStatus.AGENDADO).scalar() or 0
    orcamentos_abertos = db.query(func.count(Orcamento.id)).filter(
        Orcamento.status.in_([OrcamentoStatus.RASCUNHO, OrcamentoStatus.ENVIADO])
    ).scalar() or 0

    receita_centavos = db.query(func.coalesce(func.sum(Orcamento.valor_total), 0)).filter(
        Orcamento.status == OrcamentoStatus.APROVADO
    ).scalar() or 0

    fila_offline = db.query(func.count(SessionModel.id)).filter(SessionModel.status == SessionStatus.QUEUED_OFFLINE).scalar() or 0

    status_rows = db.query(SessionModel.status, func.count(SessionModel.id)).group_by(SessionModel.status).all()
    sessions_por_status = {status.value: count for status, count in status_rows}

    return DashboardStatsResponse(
        total_sessions=total_sessions,
        sessions_hoje=sessions_hoje,
        total_fotos_impressas=total_impressas,
        total_clientes=total_clientes,
        eventos_agendados=eventos_agendados,
        orcamentos_abertos=orcamentos_abertos,
        receita_total_orcamentos_aprovados=receita_centavos / 100,
        sessions_por_status=sessions_por_status,
        fila_offline=fila_offline,
    )
