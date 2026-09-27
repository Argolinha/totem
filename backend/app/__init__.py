from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.config import settings


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


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


def init_db():
    from app import models

    print(
        f"[DATABASE] Criando/verificando banco: "
        f"{settings.DATABASE_URL}"
    )

    Base.metadata.create_all(
        bind=engine
    )

    print(
        "[DATABASE] Tabelas verificadas/criadas com sucesso."
    )

    try:
        from app.auth import seed_default_admin

        db = SessionLocal()

        try:
            seed_default_admin(db)
        finally:
            db.close()

    except ImportError:
        print(
            "[DATABASE] seed_default_admin não encontrado. "
            "Banco continuará funcionando normalmente."
        )

    except Exception as exc:
        print(
            f"[DATABASE] Aviso ao criar administrador padrão: {exc}"
        )