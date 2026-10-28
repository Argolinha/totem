"""Cria um administrador ou redefine sua senha explicitamente, via terminal."""
import argparse
from getpass import getpass
from app.database import init_db, SessionLocal
from app.models import AdminUser
from app.auth import hash_password


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--email', required=True)
    args = parser.parse_args()
    password = getpass('Nova senha do administrador: ')
    if len(password) < 8:
        parser.error('Use uma senha com pelo menos 8 caracteres.')
    if password != getpass('Confirme a nova senha: '):
        parser.error('As senhas não coincidem.')
    init_db()
    with SessionLocal() as db:
        user = db.query(AdminUser).filter(AdminUser.email == args.email.strip()).first()
        if not user:
            user = AdminUser(nome='Administrador', email=args.email.strip())
            db.add(user)
        user.password_hash = hash_password(password)
        user.role = 'admin'
        user.ativo = True
        db.commit()
    print('Administrador atualizado. Faça login com o e-mail informado e a nova senha.')


if __name__ == '__main__':
    main()
