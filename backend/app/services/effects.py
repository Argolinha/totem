"""Catálogo de experiências do totem, na ordem da tela inicial."""
import unicodedata
from app.config import settings
from app.models import Efeito


def effect_key(value):
    value = unicodedata.normalize("NFKD", str(value)).encode("ascii", "ignore").decode().lower()
    return "".join(c for c in value if c.isalnum())


def available_effects(db):
    # Mantém os 12 estilos da interface; reutiliza personalizações cadastradas.
    rows = db.query(Efeito).order_by(Efeito.ordem.asc()).all()
    configured = {effect_key(e.nome): e for e in rows}
    effects = []
    for preset in settings.AI_EFFECT_PROMPTS:
        effect = dict(preset)
        custom = configured.get(effect_key(effect["name"]))
        if custom is not None:
            if not custom.ativo:
                continue
            effect.update(prompt=custom.prompt, scene_file=custom.scene_file,
                          provider_preferido=custom.provider_preferido)
        effects.append(effect)
    return effects
