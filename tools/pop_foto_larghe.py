"""Le foto dello shooting a tutta larghezza per pop-b.html (18 nov 2026: "farei anche alternative nella sezione foto, magari anche foto fullwidth se si può").
I tagli 4:5 di tools/pop_foto.py (880 x 1100) stirati a schermo intero sgranerebbero: qui si riparte dagli originali (2:3, circa 5500 x 8250) e si taglia una fascia 3:2
(il 16:9 tagliava la bottiglia di Philia) centrata sulla bottiglia, ridotta a 1920 x 1280, WebP qualità 75. Solo taglio e misura, niente filtri.
ALTO = quanto della parte che avanza sta sopra la fascia (0 = in cima, 1 = in fondo), scelto guardando dove sta la bottiglia.
uso: python -I tools/pop_foto_larghe.py <cartella originali>"""
import os
import sys

from PIL import Image, ImageOps

SCELTE = [('_DSC8100.jpg', 'philia', 0.42), ('_DSC7324.jpg', 'ciambella', 0.46), ('_DSC8072.jpg', 'tre-cuori', 0.32), ('_DSC7927.jpg', 'mappamondo', 0.36)]
src, dst = sys.argv[1], os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'pop')
for nome_in, nome, alto in SCELTE:
    im = ImageOps.exif_transpose(Image.open(os.path.join(src, nome_in))).convert('RGB')
    w, h = im.size
    fh = round(w * 2 / 3)
    assert fh <= h, f'{nome_in}: non è abbastanza alta per il 3:2'
    y0 = round((h - fh) * alto)
    out = os.path.join(dst, f'{nome}-largo.webp')
    im.crop((0, y0, w, y0 + fh)).resize((1920, 1280), Image.LANCZOS).save(out, 'WEBP', quality=75, method=6)
    print(nome, os.path.getsize(out) // 1024, 'KB')
