"""Foto dello shooting per l'apertura Pop di Fotografia (17 nov 2026): "per il pop vanno associate anche le foto in questo stile ... prendine alcune, vanno inserite nella navigation motion".
Dalla cartella degli originali (swisstransfer_8d349188-..., JPEG da 14-25 MB) sei foto, tagliate a 4:5 come i post e ridotte a 880 x 1100, WebP qualità 75, in assets/pop.
Solo taglio e misura: niente filtri. ALTO = quanto del taglio va tolto sopra (0 = tutto sotto, 0,5 = metà e metà), scelto guardando dove stanno le teste.
uso: python -I tools/pop_foto.py <cartella originali>"""
import sys, os
from PIL import Image, ImageOps

SCELTE = [  # (originale, nome, ALTO): solo foto dove il vino si legge, perché la didascalia dice quale (17 nov: "le foto senza un contesto, senza una storia")
    ('_DSC7324.jpg', 'ciambella', 0.5),     # Marpiccolo, Fiano Salento IGP
    ('_DSC7197.jpg', 'materassino', 0.25),  # 125 Bianco Organic
    ('_DSC8031.jpg', 'pizza', 0.4),         # Appassimento
    ('_DSC7581.jpg', 'chesterfield', 0.3),  # Gocce
    ('_DSC7927.jpg', 'mappamondo', 0.3),    # Collezione 53 Primitivo, la bottiglia del 3D
    ('_DSC8072.jpg', 'tre-cuori', 0.4),     # Tre Cuori mentre lo versano (18 nov, prova B dell'apertura). Philia (_DSC8100) la fa tools/pop_senza.py, anche senza bottiglia
    # 19 nov, per la frase di pop-b.html: "le foto che hai usato poi sono le stesse ... scegline altre": altre scene e altri vini, dal giorno alla notte
    ('_DSC7239.jpg', 'pallone', 0.3),       # 125 Bianco Organic sul bordo, il pallone in aria
    ('_DSC7636.jpg', 'rosato', 0.4),        # Terra Rosato versato fra pomodorini e lime
    ('_DSC7450-Modifica.jpg', 'carte', 0.7),  # Terra Negroamaro, tre amici a carte
    ('_DSC8388-Modifica.jpg', 'notte', 0.25),  # 125 Negroamaro sul bordo, il brindisi in piscina di notte
]
src, dst = sys.argv[1], os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'pop')
os.makedirs(dst, exist_ok=True)
for nome_in, nome, alto in SCELTE:
    im = ImageOps.exif_transpose(Image.open(os.path.join(src, nome_in))).convert('RGB')
    w, h = im.size
    th = round(w * 5 / 4)
    assert th <= h, f'{nome_in}: non è verticale abbastanza per il 4:5'
    y0 = round((h - th) * alto)
    im = im.crop((0, y0, w, y0 + th)).resize((880, 1100), Image.LANCZOS)
    out = os.path.join(dst, nome + '.webp')
    im.save(out, 'WEBP', quality=75, method=6)
    print(nome, os.path.getsize(out) // 1024, 'KB')
