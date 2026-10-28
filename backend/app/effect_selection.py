"""Resolve o efeito escolhido pelo totem sem substituir escolhas por outro efeito."""
import unicodedata
from fastapi import HTTPException
from app.models import Efeito, save_presentation

PRESETS = {
    'cyberpunk': ('Cyberpunk', 'Cyberpunk portrait, neon lighting, futuristic city, preserve the identity and recognizable facial features of the photographed person.'),
    'cartoon3d': ('Cartoon 3D', '3D animated cartoon portrait, colorful cinematic lighting, preserve the identity and recognizable facial features of the photographed person.'),
    'anos80': ('Anos 80', '1980s retro portrait, synthwave colors, analog photographic atmosphere, preserve the identity and recognizable facial features of the photographed person.'),
    'anime': ('Anime', 'Anime illustration portrait, expressive clean line art, preserve the identity and recognizable facial features of the photographed person.'),
    'pb': ('Black & White', 'Black and white photographic portrait, dramatic studio lighting, preserve the identity and recognizable facial features of the photographed person.'),
    'aquarela': ('Aquarela', 'Watercolor portrait, natural paper texture, soft painted colors, preserve the identity and recognizable facial features of the photographed person.'),
}
ALIASES = {'cartoon3d': {'cartoon3d', 'cartoon', 'avatarcartoon'}, 'pb': {'pb', 'blackwhite', 'blackandwhite', 'pretoebranco'}}


def normalized(value):
    text = unicodedata.normalize('NFKD', value).encode('ascii', 'ignore').decode().lower()
    return ''.join(c for c in text if c.isalnum())


def resolve_effect(db, chosen):
    chosen = chosen.strip()
    if not chosen:
        raise HTTPException(422, "Informe um efeito válido")
    effect = db.get(Efeito, chosen)
    key = normalized(chosen)
    aliases = ALIASES.get(key, {key})
    if effect is None:
        effect = next((e for e in db.query(Efeito).all() if normalized(e.nome) in aliases or normalized(e.ui.get('slug', '')) == key), None)
    if effect is None and key in PRESETS:
        name, prompt = PRESETS[key]
        effect = Efeito(nome=name, prompt=prompt, ativo=True, ordem=100)
        db.add(effect)
        save_presentation(db, effect, {'slug': key, 'categoria': 'Estilo'})
        db.flush()
    if effect is None:
        raise HTTPException(422, 'Efeito selecionado não encontrado')
    if not effect.ativo:
        raise HTTPException(409, 'O efeito selecionado está desativado no painel administrativo')
    return effect
