"""Catálogo comum à escolha inicial e ao processamento de uma única foto."""
import unicodedata
from app.models import Efeito, AdminPresentation
from app.services.effect_presets import PRESETS


def effect_key(value):
    text = unicodedata.normalize("NFKD", str(value)).encode("ascii", "ignore").decode().lower()
    return "".join(c for c in text if c.isalnum())


def available_effects(db):
    rows = db.query(Efeito).order_by(Efeito.ordem.asc()).all()
    configured = {effect_key(e.nome): e for e in rows}
    preset_rows = {e.ui.get("preset_id"): e for e in rows if e.ui.get("preset_id")}
    managed = db.get(AdminPresentation, "catalog:admin-real-v1") is not None
    used = set()
    result = []
    for preset in PRESETS:
        custom = preset_rows.get(preset["id"]) or configured.get(effect_key(preset["name"]))
        if custom is None and managed:
            continue
        e = dict(preset)
        if custom is not None:
            used.add(custom.id)
            if not custom.ativo:
                continue
            e.update(name=custom.nome, prompt=custom.prompt, scene_file=custom.scene_file,
                     provider_preferido=custom.provider_preferido)
        result.append(e)
    for row in rows:
        if row.ativo and row.id not in used:
            result.append({"id": row.id, "name": row.nome, "prompt": row.prompt,
                           "scene_file": row.scene_file, "provider_preferido": row.provider_preferido})
    return result


def resolve_effect(effects, selected_id):
    key = effect_key(selected_id)
    key = {"pb": "blackwhite"}.get(key, key)
    matches = [e for e in effects if key in (effect_key(e["id"]), effect_key(e["name"]))]
    if len(matches) != 1:
        raise ValueError("Efeito indisponível. Escolha novamente.")
    return matches[0]
