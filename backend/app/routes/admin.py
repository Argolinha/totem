"""
Rotas administrativas (painel /admin do frontend) - substituem TODOS os dados
mockados das telas de admin por operações reais no banco de dados.

Todas as rotas (exceto /auth/login) exigem header `Authorization: Bearer <token>`,
obtido em POST /api/admin/auth/login.
"""
import shutil
import uuid
import json
from datetime import datetime, date
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile
from sqlalchemy import func
from sqlalchemy.orm import Session as DBSession

from app.auth import authenticate_admin, create_access_token, get_current_admin, require_role
from app.config import settings
from app.database import get_db
from app.models import (
    save_presentation, AdminPresentation, AdminUser, Cliente, Evento, EventoStatus, Orcamento, OrcamentoStatus,
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
    cliente = Cliente(**payload.model_dump(exclude={"ui"}))
    db.add(cliente)
    save_presentation(db, cliente, payload.ui)
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
    save_presentation(db, cliente, payload.ui)
    for field, value in payload.model_dump(exclude_unset=True, exclude={"ui"}).items():
        setattr(cliente, field, value)
    db.commit()
    db.refresh(cliente)
    return cliente


@router.delete("/clientes/{cliente_id}", status_code=204)
def remover_cliente(cliente_id: str, db: DBSession = Depends(get_db), _user: AdminUser = Depends(require_role("admin"))):
    cliente = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    if not cliente:
        raise HTTPException(404, "Cliente não encontrado")
    if cliente.eventos or cliente.orcamentos or db.query(SessionModel).filter(SessionModel.cliente_id == cliente.id).first():
        raise HTTPException(409, "Cliente possui histórico. Desative-o em vez de excluir.")
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
    if payload.status not in {x.value for x in EventoStatus}:
        raise HTTPException(422, "Status de evento inválido")
    evento = Evento(**payload.model_dump(exclude={"ui"}))
    db.add(evento)
    save_presentation(db, evento, payload.ui)
    db.commit()
    db.refresh(evento)
    return evento


@router.put("/eventos/{evento_id}", response_model=EventoResponse)
def atualizar_evento(evento_id: str, payload: EventoUpdate, db: DBSession = Depends(get_db), _user: AdminUser = Depends(get_current_admin)):
    evento = db.query(Evento).filter(Evento.id == evento_id).first()
    if not evento:
        raise HTTPException(404, "Evento não encontrado")
    save_presentation(db, evento, payload.ui)
    data = payload.model_dump(exclude_unset=True, exclude={"ui"})
    if "status" in data and data["status"]:
        try:
            data["status"] = EventoStatus(data["status"])
        except ValueError:
            raise HTTPException(422, "Status de evento inválido")
    if "cliente_id" in data and not db.get(Cliente, data["cliente_id"]):
        raise HTTPException(422, "Cliente informado não existe")
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
        created_at=o.created_at, ui=o.ui,
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
    save_presentation(db, orcamento, payload.ui)
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

    if orcamento.status == OrcamentoStatus.CONVERTIDO and payload.status not in (None, "convertido"):
        raise HTTPException(409, "Orçamento convertido deve manter seu histórico de conversão")
    save_presentation(db, orcamento, payload.ui)
    data = payload.model_dump(exclude_unset=True, exclude={"ui"})
    itens = data.pop("itens", None)
    if "status" in data and data["status"]:
        try:
            data["status"] = OrcamentoStatus(data["status"])
        except ValueError:
            raise HTTPException(422, "Status de orçamento inválido")
    if "cliente_id" in data and not db.get(Cliente, data["cliente_id"]):
        raise HTTPException(422, "Cliente informado não existe")
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
    existing_event = db.query(Evento).filter(Evento.orcamento_id == orcamento.id).first()
    if existing_event:
        raise HTTPException(409, "Este orçamento já foi convertido em evento")
    if orcamento.status != OrcamentoStatus.APROVADO:
        raise HTTPException(409, "Aprove o orçamento antes de converter em evento")
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
    save_presentation(db, evento, {**orcamento.ui, "status": "Confirmado"})
    db.commit()
    db.refresh(evento)
    return evento


@router.delete("/orcamentos/{orcamento_id}", status_code=204)
def remover_orcamento(orcamento_id: str, db: DBSession = Depends(get_db), _user: AdminUser = Depends(require_role("admin"))):
    orcamento = db.query(Orcamento).filter(Orcamento.id == orcamento_id).first()
    if not orcamento:
        raise HTTPException(404, "Orçamento não encontrado")
    if db.query(Evento).filter(Evento.orcamento_id == orcamento.id).first():
        raise HTTPException(409, "Orçamento vinculado a um evento não pode ser excluído")
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
    efeito = Efeito(**payload.model_dump(exclude={"ui"}))
    db.add(efeito)
    save_presentation(db, efeito, payload.ui)
    db.commit()
    db.refresh(efeito)
    return efeito


@router.put("/efeitos/{efeito_id}", response_model=EfeitoResponse)
def atualizar_efeito(efeito_id: str, payload: EfeitoUpdate, db: DBSession = Depends(get_db), _user: AdminUser = Depends(get_current_admin)):
    efeito = db.query(Efeito).filter(Efeito.id == efeito_id).first()
    if not efeito:
        raise HTTPException(404, "Efeito não encontrado")
    save_presentation(db, efeito, payload.ui)
    for field, value in payload.model_dump(exclude_unset=True, exclude={"ui"}).items():
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

    ext = Path(file.filename or "scene.jpg").suffix.lower() or ".jpg"
    _validate_image(file, ext)
    settings.SCENES_DIR.mkdir(parents=True, exist_ok=True)
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
    nome: str = Form(...),
    padrao: bool = Form(False),
    ui: str = Form("{}"),
    file: UploadFile = File(...),
    db: DBSession = Depends(get_db),
    _user: AdminUser = Depends(get_current_admin),
):
    ext = Path(file.filename or "frame.png").suffix.lower() or ".png"
    _validate_image(file, ext)
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = FRAMES_DIR / filename
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    if padrao:
        db.query(Moldura).update({Moldura.padrao: False})

    moldura = Moldura(nome=nome, arquivo_path=f"/static/frames/{filename}", padrao=padrao)
    try:
        presentation = json.loads(ui)
        if not isinstance(presentation, dict):
            raise ValueError()
    except (ValueError, TypeError):
        raise HTTPException(422, "Dados da moldura inválidos")
    db.add(moldura)
    save_presentation(db, moldura, presentation)
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
        results = [f"/static/generated/{Path(str(path).replace(chr(92), chr(47))).name}" for path in (s.photo.generated_paths or [])]
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
    limit: int = Query(100, ge=1, le=500),
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
    if session.status not in (SessionStatus.ERROR, SessionStatus.QUEUED_OFFLINE):
        raise HTTPException(409, "Somente sessões em erro ou offline podem ser reprocessadas")
    if not session.photo or not session.photo.original_path:
        raise HTTPException(409, "Sessão não possui foto original")
    previous_status = session.status
    previous_error = session.error_message
    session.status = SessionStatus.UPLOADED
    session.error_message = None
    db.commit()
    try:
        process_photo_task.apply_async(args=[session.id], retry=False)
    except Exception:
        session.status = previous_status
        session.error_message = previous_error
        db.commit()
        raise HTTPException(503, "Fila indisponível. Confira os serviços Redis e Celery e tente novamente.")
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


@router.get("/system")
def system_info(_user: AdminUser = Depends(get_current_admin)):
    return {
        "disco_percentual": round(shutil.disk_usage(settings.STORAGE_DIR).used / shutil.disk_usage(settings.STORAGE_DIR).total * 100),
        "totem_id": settings.TOTEM_ID,
        "provedor_ia": settings.AI_PROVIDER,
        "url_publica": settings.PUBLIC_BASE_URL,
        "impressao": "Simulação; este projeto ainda não integra uma impressora física",
    }


def _validate_image(file: UploadFile, extension: str):
    from PIL import Image, UnidentifiedImageError
    if extension not in {".png", ".jpg", ".jpeg", ".webp"}:
        raise HTTPException(422, "Use uma imagem PNG, JPEG ou WebP")
    file.file.seek(0, 2)
    if file.file.tell() > 25 * 1024 * 1024:
        raise HTTPException(413, "Imagem deve ter até 25 MB")
    file.file.seek(0)
    try:
        with Image.open(file.file) as img:
            img.verify()
    except (UnidentifiedImageError, OSError, ValueError):
        raise HTTPException(422, "Arquivo de imagem inválido")
    finally:
        file.file.seek(0)


@router.put("/molduras/{moldura_id}", response_model=MolduraResponse)
def editar_moldura(moldura_id: str, payload: dict, db: DBSession = Depends(get_db), _user: AdminUser = Depends(get_current_admin)):
    moldura = db.get(Moldura, moldura_id)
    if not moldura:
        raise HTTPException(404, "Moldura não encontrada")
    for key in ("nome", "ativa", "padrao"):
        if key in payload:
            value = payload[key]
            if key == "nome" and (not isinstance(value, str) or not value.strip()):
                raise HTTPException(422, "Nome inválido")
            if key != "nome" and not isinstance(value, bool):
                raise HTTPException(422, "Status inválido")
            setattr(moldura, key, value)
    if moldura.padrao:
        db.query(Moldura).filter(Moldura.id != moldura.id).update({Moldura.padrao: False})
    if "ui" in payload:
        if not isinstance(payload["ui"], dict):
            raise HTTPException(422, "Dados da moldura inválidos")
        save_presentation(db, moldura, payload["ui"])
    db.commit()
    db.refresh(moldura)
    return moldura


@router.get("/preferences/{section}")
def get_preferences(section: str, db: DBSession = Depends(get_db), _user: AdminUser = Depends(get_current_admin)):
    if section not in {"config", "impressao"}:
        raise HTTPException(404, "Configuração não encontrada")
    row = db.get(AdminPresentation, f"preferences:{section}")
    defaults = {"nomeTotem": "Vive AI Photobooth", "qualidade": "Alta", "contagem": "3", "som": False, "modoNoturno": False, "impressaoAutomatica": False} if section == "config" else {}
    return {**defaults, **(row.data if row else {})}


@router.put("/preferences/{section}")
def put_preferences(section: str, payload: dict, db: DBSession = Depends(get_db), _user: AdminUser = Depends(require_role("admin"))):
    if section not in {"config", "impressao"}:
        raise HTTPException(404, "Configuração não encontrada")
    if section == "config":
        allowed = {"nomeTotem", "qualidade", "contagem", "som", "modoNoturno", "impressaoAutomatica"}
        if set(payload) - allowed:
            raise HTTPException(422, "Configuração desconhecida")
        if "contagem" in payload and str(payload["contagem"]) not in {"3", "5", "7", "10"}:
            raise HTTPException(422, "Contagem inválida")
        if "qualidade" in payload and payload["qualidade"] not in {"Baixa", "Média", "Alta", "Ultra"}:
            raise HTTPException(422, "Qualidade inválida")
        for name in ("som", "modoNoturno", "impressaoAutomatica"):
            if name in payload and not isinstance(payload[name], bool):
                raise HTTPException(422, "Valor de opção inválido")
        if "nomeTotem" in payload and (not isinstance(payload["nomeTotem"], str) or not payload["nomeTotem"].strip() or len(payload["nomeTotem"]) > 120):
            raise HTTPException(422, "Nome do totem inválido")
    key = f"preferences:{section}"
    row = db.get(AdminPresentation, key)
    if not row:
        row = AdminPresentation(key=key)
        db.add(row)
    row.data = payload
    db.commit()
    return payload


@router.get('/dashboard/overview')
def dashboard_overview(periodo: str = 'Hoje', db: DBSession = Depends(get_db), _user: AdminUser = Depends(get_current_admin)):
    from datetime import timedelta, timezone
    from zoneinfo import ZoneInfo
    from collections import Counter
    now = datetime.now(ZoneInfo('America/Sao_Paulo'))
    midnight = now.replace(hour=0, minute=0, second=0, microsecond=0)
    begin = midnight - timedelta(days=1 if periodo == 'Ontem' else 6 if periodo == 'Últimos 7 dias' else 0)
    finish = midnight if periodo == 'Ontem' else now
    # Existing timestamps are naive UTC values.
    start_utc = begin.astimezone(timezone.utc).replace(tzinfo=None)
    end_utc = finish.astimezone(timezone.utc).replace(tzinfo=None)
    rows = db.query(SessionModel).filter(SessionModel.created_at >= start_utc, SessionModel.created_at <= end_utc).all()
    effects = Counter(name for s in rows if s.photo for name in (s.photo.effect_names or []))
    queue = db.query(SessionModel).filter(SessionModel.status.in_([SessionStatus.UPLOADED, SessionStatus.PROCESSING, SessionStatus.QUEUED_OFFLINE, SessionStatus.PRINTING])).order_by(SessionModel.created_at.desc()).limit(3).all()
    disk = shutil.disk_usage(settings.STORAGE_DIR)
    return {
        'total': sum(1 for s in rows if s.photo),
        'processadas': sum(1 for s in rows if s.photo and s.photo.generated_paths),
        'impressas': sum(1 for s in rows if s.photo and s.photo.printed),
        'pendentes': sum(1 for s in rows if s.status in [SessionStatus.CREATED, SessionStatus.UPLOADED, SessionStatus.PROCESSING, SessionStatus.QUEUED_OFFLINE, SessionStatus.PRINTING]),
        'efeitos': dict(effects), 'fila': [_session_to_admin_response(s).model_dump() for s in queue],
        'disco_percentual': round(disk.used / disk.total * 100),
    }


@router.get('/reports/events')
def event_reports(days: int = Query(30, ge=1, le=3650), db: DBSession = Depends(get_db), _user: AdminUser = Depends(get_current_admin)):
    from datetime import timedelta
    since = datetime.utcnow() - timedelta(days=days)
    sessions = db.query(SessionModel).filter(SessionModel.created_at >= since).all()
    groups = {}
    for session in sessions:
        key = session.evento_id or 'sem-evento'
        if key not in groups:
            event = db.get(Evento, key) if session.evento_id else None
            groups[key] = {'id': key, 'evento': event.nome if event else 'Sessões sem evento vinculado', 'data': session.created_at.strftime('%d/%m/%Y'), 'fotos': 0, 'impressoes': 0, 'efeitos': 0, 'status': 'Concluído'}
        group = groups[key]
        group['fotos'] += int(bool(session.photo))
        group['impressoes'] += int(bool(session.photo and session.photo.printed))
        group['efeitos'] += len(session.photo.generated_paths or []) if session.photo else 0
        if session.status in (SessionStatus.CREATED, SessionStatus.UPLOADED, SessionStatus.PROCESSING, SessionStatus.QUEUED_OFFLINE, SessionStatus.PRINTING):
            group['status'] = 'Em andamento'
    return list(groups.values())


@router.delete('/sessions/{session_id}/photos/{index}', status_code=204)
def delete_generated_photo(session_id: str, index: int, db: DBSession = Depends(get_db), _user: AdminUser = Depends(require_role('admin'))):
    session = db.get(SessionModel, session_id)
    if not session or not session.photo:
        raise HTTPException(404, 'Foto não encontrada')
    if session.status in (SessionStatus.PROCESSING, SessionStatus.PRINTING):
        raise HTTPException(409, 'Aguarde o processamento ou impressão terminar')
    photo = session.photo
    paths = list(photo.generated_paths or [])
    names = list(photo.effect_names or [])
    if index < 0 or index >= len(paths):
        raise HTTPException(404, 'Foto não encontrada')
    removed = paths.pop(index)
    if index < len(names):
        names.pop(index)
    photo.generated_paths = paths
    photo.effect_names = names
    if photo.chosen_index is not None:
        photo.chosen_index = None if photo.chosen_index == index else photo.chosen_index - int(photo.chosen_index > index)
    photo.download_token = None
    db.commit()
    filename = Path(str(removed).replace(chr(92), chr(47))).name
    target = (settings.GENERATED_DIR / filename).resolve()
    if target.is_relative_to(settings.GENERATED_DIR.resolve()) and target.is_file():
        target.unlink()


@router.post('/sessions/{session_id}/cancel')
def cancel_session(session_id: str, db: DBSession = Depends(get_db), _user: AdminUser = Depends(get_current_admin)):
    session = db.get(SessionModel, session_id)
    if not session:
        raise HTTPException(404, 'Sessão não encontrada')
    if session.status not in (SessionStatus.CREATED, SessionStatus.UPLOADED, SessionStatus.QUEUED_OFFLINE):
        raise HTTPException(409, 'Somente sessões aguardando processamento podem ser canceladas')
    session.status = SessionStatus.ERROR
    session.error_message = 'Cancelado pelo operador'
    db.commit()
    return {'status': 'cancelled'}
