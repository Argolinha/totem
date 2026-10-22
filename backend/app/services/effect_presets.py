"""Experiências aprovadas para o totem, na ordem da tela inicial."""
PRESETS = [{'id': 'cartoon3d',
  'name': 'Cartoon 3D',
  'prompt': 'high quality 3D animated movie portrait, soft dimensional shading, stylized clothing '
            'and background Preserve the person identity and recognizable facial proportions: same '
            'nose, mouth, jaw and eyes. Do not change age, ethnicity or eye color. Keep every '
            'person in the source photo. Apply the requested artistic medium without reshaping '
            'facial anatomy. Transform the actual photograph, including the people and '
            'environment, in this medium. No picture frame, border, vignette frame, collage, text, '
            'logo or watermark. Deliver one full-bleed image.'},
 {'id': 'anime',
  'name': 'Anime',
  'prompt': 'anime illustration, clean cel shading and delicate ink outlines, illustrated '
            'background Preserve the person identity and recognizable facial proportions: same '
            'nose, mouth, jaw and eyes. Do not change age, ethnicity or eye color. Keep every '
            'person in the source photo. Apply the requested artistic medium without reshaping '
            'facial anatomy. Transform the actual photograph, including the people and '
            'environment, in this medium. No picture frame, border, vignette frame, collage, text, '
            'logo or watermark. Deliver one full-bleed image.'},
 {'id': 'anos80',
  'name': 'Anos 80',
  'prompt': '1980s synthwave editorial portrait, retro neon environment, vintage film atmosphere '
            'Preserve the person identity and recognizable facial proportions: same nose, mouth, '
            'jaw and eyes. Do not change age, ethnicity or eye color. Keep every person in the '
            'source photo. Apply the requested artistic medium without reshaping facial anatomy. '
            'Transform the actual photograph, including the people and environment, in this '
            'medium. No picture frame, border, vignette frame, collage, text, logo or watermark. '
            'Deliver one full-bleed image.'},
 {'id': 'pb',
  'name': 'Black & White',
  'prompt': 'timeless black and white photographic portrait, balanced monochrome tones, soft '
            'studio light Preserve the person identity and recognizable facial proportions: same '
            'nose, mouth, jaw and eyes. Do not change age, ethnicity or eye color. Keep every '
            'person in the source photo. Apply the requested artistic medium without reshaping '
            'facial anatomy. Transform the actual photograph, including the people and '
            'environment, in this medium. No picture frame, border, vignette frame, collage, text, '
            'logo or watermark. Deliver one full-bleed image.'},
 {'id': 'aquarela',
  'name': 'Aquarela',
  'prompt': 'delicate watercolor painting, translucent pigment washes on textured paper, soft '
            'illustrated background Preserve the person identity and recognizable facial '
            'proportions: same nose, mouth, jaw and eyes. Do not change age, ethnicity or eye '
            'color. Keep every person in the source photo. Apply the requested artistic medium '
            'without reshaping facial anatomy. Transform the actual photograph, including the '
            'people and environment, in this medium. No picture frame, border, vignette frame, '
            'collage, text, logo or watermark. Deliver one full-bleed image.'},
 {'id': 'cyberpunk',
  'name': 'Cyberpunk',
  'prompt': 'cinematic cyberpunk portrait, futuristic city background with cyan and magenta neon '
            'lights Preserve the person identity and recognizable facial proportions: same nose, '
            'mouth, jaw and eyes. Do not change age, ethnicity or eye color. Keep every person in '
            'the source photo. Apply the requested artistic medium without reshaping facial '
            'anatomy. Transform the actual photograph, including the people and environment, in '
            'this medium. No picture frame, border, vignette frame, collage, text, logo or '
            'watermark. Deliver one full-bleed image.'},
 {'id': 'fantasia3d',
  'name': 'Fantasia 3D',
  'prompt': 'premium 3D fantasy portrait, enchanted environment, magical particles and cinematic '
            'depth Preserve the person identity and recognizable facial proportions: same nose, '
            'mouth, jaw and eyes. Do not change age, ethnicity or eye color. Keep every person in '
            'the source photo. Apply the requested artistic medium without reshaping facial '
            'anatomy. Transform the actual photograph, including the people and environment, in '
            'this medium. No picture frame, border, vignette frame, collage, text, logo or '
            'watermark. Deliver one full-bleed image.'},
 {'id': 'luxo3d',
  'name': 'Luxo 3D',
  'prompt': 'luxury 3D editorial portrait, elegant black and gold environment, premium materials '
            'and soft cinematic light Preserve the person identity and recognizable facial '
            'proportions: same nose, mouth, jaw and eyes. Do not change age, ethnicity or eye '
            'color. Keep every person in the source photo. Apply the requested artistic medium '
            'without reshaping facial anatomy. Transform the actual photograph, including the '
            'people and environment, in this medium. No picture frame, border, vignette frame, '
            'collage, text, logo or watermark. Deliver one full-bleed image.'},
 {'id': 'galaxia',
  'name': 'Galáxia',
  'prompt': 'cosmic portrait with a beautiful galaxy background, nebulae, stars and cinematic '
            'depth Preserve the person identity and recognizable facial proportions: same nose, '
            'mouth, jaw and eyes. Do not change age, ethnicity or eye color. Keep every person in '
            'the source photo. Apply the requested artistic medium without reshaping facial '
            'anatomy. Transform the actual photograph, including the people and environment, in '
            'this medium. No picture frame, border, vignette frame, collage, text, logo or '
            'watermark. Deliver one full-bleed image.'},
 {'id': 'superheroi3d',
  'name': 'Super-herói 3D',
  'prompt': 'cinematic 3D superhero portrait, heroic costume and epic city background, no mask '
            'over the face Preserve the person identity and recognizable facial proportions: same '
            'nose, mouth, jaw and eyes. Do not change age, ethnicity or eye color. Keep every '
            'person in the source photo. Apply the requested artistic medium without reshaping '
            'facial anatomy. Transform the actual photograph, including the people and '
            'environment, in this medium. No picture frame, border, vignette frame, collage, text, '
            'logo or watermark. Deliver one full-bleed image.'},
 {'id': 'popart',
  'name': 'Pop Art',
  'prompt': 'pop art screen print portrait, bold colors, graphic halftone texture and clean '
            'outlines Preserve the person identity and recognizable facial proportions: same nose, '
            'mouth, jaw and eyes. Do not change age, ethnicity or eye color. Keep every person in '
            'the source photo. Apply the requested artistic medium without reshaping facial '
            'anatomy. Transform the actual photograph, including the people and environment, in '
            'this medium. No picture frame, border, vignette frame, collage, text, logo or '
            'watermark. Deliver one full-bleed image.'},
 {'id': 'retrogaming',
  'name': 'Retro Gaming',
  'prompt': 'retro video game pixel art portrait, nostalgic arcade palette and pixel environment '
            'Preserve the person identity and recognizable facial proportions: same nose, mouth, '
            'jaw and eyes. Do not change age, ethnicity or eye color. Keep every person in the '
            'source photo. Apply the requested artistic medium without reshaping facial anatomy. '
            'Transform the actual photograph, including the people and environment, in this '
            'medium. No picture frame, border, vignette frame, collage, text, logo or watermark. '
            'Deliver one full-bleed image.'}]
