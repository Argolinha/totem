"""
Autenticação simples do painel administrativo.

Usa tokens assinados com HMAC usando apenas a biblioteca padrão
do Python, evitando dependências extras.
"""

import base64
import hashlib
import hmac
import json
import os
import time
from typing import Optional

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import AdminUser


security = HTTPBearer(auto_error=False)

SECRET_KEY = os.getenv(
    "AUTH_SECRET_KEY",
    "vive-ai-photobooth-secret-change-this"
)

ADMIN_EMAIL = os.getenv(
    "ADMIN_EMAIL",
    "admin@viveai.com"
)

ADMIN_PASSWORD = os.getenv(
    "ADMIN_PASSWORD",
    "admin123"
)


# ============================================================
# SENHA
# ============================================================

def hash_password(password: str) -> str:
    salt = os.urandom(16)

    derived = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        120_000,
    )

    return (
        base64.urlsafe_b64encode(salt).decode()
        + "$"
        + base64.urlsafe_b64encode(derived).decode()
    )


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        salt_b64, hash_b64 = stored_hash.split("$", 1)

        salt = base64.urlsafe_b64decode(
            salt_b64.encode()
        )

        expected = base64.urlsafe_b64decode(
            hash_b64.encode()
        )

        actual = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            salt,
            120_000,
        )

        return hmac.compare_digest(
            actual,
            expected,
        )

    except Exception:
        return False


# ============================================================
# TOKEN
# ============================================================

def _encode_part(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode().rstrip("=")


def _decode_part(value: str) -> bytes:
    padding = "=" * (-len(value) % 4)
    return base64.urlsafe_b64decode(
        (value + padding).encode()
    )


def create_access_token(
    subject: str,
    extra_claims: Optional[dict] = None,
) -> str:

    payload = {
        "sub": subject,
        "exp": int(time.time()) + 60 * 60 * 12,
    }

    if extra_claims:
        payload.update(extra_claims)

    payload_part = _encode_part(
        json.dumps(
            payload,
            separators=(",", ":"),
        ).encode()
    )

    signature = hmac.new(
        SECRET_KEY.encode(),
        payload_part.encode(),
        hashlib.sha256,
    ).digest()

    signature_part = _encode_part(signature)

    return f"{payload_part}.{signature_part}"


def decode_access_token(token: str) -> dict:
    try:
        payload_part, signature_part = token.split(".", 1)

        expected_signature = hmac.new(
            SECRET_KEY.encode(),
            payload_part.encode(),
            hashlib.sha256,
        ).digest()

        received_signature = _decode_part(
            signature_part
        )

        if not hmac.compare_digest(
            expected_signature,
            received_signature,
        ):
            raise ValueError("Assinatura inválida")

        payload = json.loads(
            _decode_part(payload_part)
        )

        if payload.get("exp", 0) < int(time.time()):
            raise ValueError("Token expirado")

        return payload

    except Exception as exc:
        raise HTTPException(
            status_code=401,
            detail="Token inválido ou expirado",
        ) from exc


# ============================================================
# USUÁRIO ADMIN
# ============================================================

def authenticate_admin(
    db: Session,
    email: str,
    password: str,
):
    user = (
        db.query(AdminUser)
        .filter(
            AdminUser.email == email,
            AdminUser.ativo.is_(True),
        )
        .first()
    )

    if not user:
        return None

    if not verify_password(
        password,
        user.password_hash,
    ):
        return None

    return user


def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    if credentials is None:
        raise HTTPException(
            status_code=401,
            detail="Autenticação necessária",
        )

    payload = decode_access_token(
        credentials.credentials
    )

    user_id = payload.get("sub")

    user = (
        db.query(AdminUser)
        .filter(
            AdminUser.id == user_id,
            AdminUser.ativo.is_(True),
        )
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Usuário administrativo não encontrado",
        )

    return user


def require_role(required_role: str):
    def dependency(
        current_user: AdminUser = Depends(
            get_current_admin
        ),
    ):
        if current_user.role != required_role:
            raise HTTPException(
                status_code=403,
                detail="Permissão insuficiente",
            )

        return current_user

    return dependency


# ============================================================
# CRIA ADMIN PADRÃO
# ============================================================

def ensure_default_admin(db: Session):
    existing = (
        db.query(AdminUser)
        .filter(
            AdminUser.email == ADMIN_EMAIL
        )
        .first()
    )

    if existing:
        return existing

    user = AdminUser(
        nome="Administrador",
        email=ADMIN_EMAIL,
        password_hash=hash_password(
            ADMIN_PASSWORD
        ),
        role="admin",
        ativo=True,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user