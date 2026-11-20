"""Le viste del giro di Blender (tools/bottiglia_blender.py --giro N) per la pagina (18 nov 2026): tutte tagliate sullo stesso riquadro attorno alla bottiglia, con l'asse al centro,
   in due misure webp: g/ per lo schermo grande, p/ per il telefono. Le immagini di Blender restano in tools/blender.
   python -I tools/giro_web.py tools/blender/tre-cuori-giro assets/giro/tre-cuori [--alto 1100] [--piccolo 620] [--q 80]"""
import argparse
import glob
import os

import numpy as np
from PIL import Image

p = argparse.ArgumentParser()
p.add_argument('cartella')
p.add_argument('uscita')
p.add_argument('--alto', type=int, default=1100)
p.add_argument('--piccolo', type=int, default=620)
p.add_argument('--q', type=int, default=80)
A = p.parse_args()

viste = sorted(glob.glob(os.path.join(A.cartella, '*.png')))
assert viste, 'nessuna vista in ' + A.cartella
W = Image.open(viste[0]).width
x0, y0, x1, y1 = W, 10 ** 9, 0, 0
for f in viste:  # il riquadro che contiene la bottiglia in tutte le viste (il fondo è bianco pieno; qualche pixel sporco isolato negli angoli non conta)
    m = np.asarray(Image.open(f).convert('RGB')).min(axis=2) < 250
    xs, ys = np.where(m.sum(axis=0) >= 3)[0], np.where(m.sum(axis=1) >= 3)[0]
    x0, y0, x1, y1 = min(x0, xs.min()), min(y0, ys.min()), max(x1, xs.max() + 1), max(y1, ys.max() + 1)
mezzo = max(W / 2 - x0, x1 - W / 2) + 6  # simmetrico: l'asse della bottiglia resta al centro dell'immagine
box = (round(W / 2 - mezzo), y0 - 6, round(W / 2 + mezzo), y1 + 6)
tot = {}
for nome, alto in (('g', A.alto), ('p', A.piccolo)):
    os.makedirs(os.path.join(A.uscita, nome), exist_ok=True)
    tot[nome] = 0
    for i, f in enumerate(viste):
        im = Image.open(f).convert('RGB').crop(box)
        im = im.resize((round(im.width * alto / im.height), alto), Image.LANCZOS)
        out = os.path.join(A.uscita, nome, f'{i:03d}.webp')
        im.save(out, quality=A.q, method=6)
        tot[nome] += os.path.getsize(out)
    print(f'{nome}: {len(viste)} viste {im.width}x{im.height}, {tot[nome] / 1024:.0f} KB in tutto, {tot[nome] / len(viste) / 1024:.1f} KB a vista')
