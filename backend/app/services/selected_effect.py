"""Catálogo comum à escolha inicial e ao processamento de uma única foto."""
import unicodedata
from app.models import Efeito
from app.services.effect_presets import PRESETS


def effect_key(value):
    text = unicodedata.normalize("NFKD", str(value)).encode("ascii", "ignore").decode().lower()
    return "".join(c for c in text if c.isalnum())


def available_effects(db):
    rows = db.query(Efeito).order_by(Efeito.ordem.asc()).all()
    configured = {effect_key(e.nome): e for e in rows}
    result = []
    for preset in PRESETS:
        e = dict(preset)
        custom = configured.get(effect_key(e["name"]))
        if custom is not None:
            if not custom.ativo:
                continue
            e.update(prompt=custom.prompt, scene_file=custom.scene_file,
                     provider_preferido=custom.provider_preferido)
        result.append(e)
    return result


def resolve_effect(effects, selected_id):
    key = effect_key(selected_id)
    key = {"pb": "blackwhite"}.get(key, key)
    matches = [e for e in effects if key in (effect_key(e["id"]), effect_key(e["name"]))]
    if len(matches) != 1:
        raise ValueError("Efeito indisponível. Escolha novamente.")
    return matches[0]
