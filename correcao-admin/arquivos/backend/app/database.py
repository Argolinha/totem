from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.config import settings


# ============================================================
# DATABASE
# ============================================================

connect_args = {}

if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {
        "check_same_thread": False
    }


engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
)


SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


Base = declarative_base()


# ============================================================
# DEPENDENCY
# ============================================================

def get_db():
    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


# ============================================================
# INIT DATABASE
# ============================================================

def init_db():
    from app import models

    # Garante que as tabelas sejam criadas
    Base.metadata.create_all(bind=engine)

    # Cria administrador padrão
    try:
        from app.auth import seed_default_admin

        db = SessionLocal()

        try:
            seed_default_admin(db)
        finally:
            db.close()

    except Exception as exc:
        print(
            f"[DATABASE] Aviso ao criar administrador padrão: {exc}"
        )

    from app.models import Efeito, AdminPresentation, save_presentation
    from app.services.effect_presets import PRESETS
    from app.services.selected_effect import effect_key
    with SessionLocal() as db:
        if not db.get(AdminPresentation, "catalog:admin-real-v1"):
            existing = {effect_key(e.nome): e for e in db.query(Efeito).all()}
            for index, effect in enumerate(PRESETS):
                record = existing.get(effect_key(effect["name"]))
                if record is None:
                    record = Efeito(nome=effect["name"], prompt=effect["prompt"], ordem=index, ativo=True)
                    db.add(record)
                save_presentation(db, record, {"preset_id": effect["id"]})
            db.add(AdminPresentation(key="catalog:admin-real-v1", data={"done": True}))
            db.commit()
