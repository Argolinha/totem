"""
Configuração da conexão com o banco de dados usando SQLAlchemy.
Usa SQLite por padrão (fácil de rodar no MVP), mas basta trocar a
DATABASE_URL no .env para migrar para PostgreSQL sem alterar o código.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.config import settings

# connect_args é necessário apenas para SQLite (permite uso multi-thread)
connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependency do FastAPI: cria uma sessão de banco por requisição e a fecha ao final."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Cria as tabelas no banco caso ainda não existam. Chamado na inicialização da app."""
    from app import models  # noqa: F401 - garante que os modelos sejam registrados
    Base.metadata.create_all(bind=engine)
