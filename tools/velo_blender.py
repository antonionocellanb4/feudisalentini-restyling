"""La pelle di Blender per la bottiglia 3D della pagina (18 nov 2026, "le dobbiamo usare sul sito, fargli fare movimenti: vedi tu"). Dalle due riprese di tools/bottiglia_blender.py --velo
   (vetro, vino e capsula di fronte in proiezione parallela, sul bianco e sul nero) una tabella di colore e trasparenza per ogni altezza della bottiglia e distanza dall'asse vista dalla macchina,
   che js/bottiglia-3d-kit.js stende sul vetro: ha l'aspetto di Cycles e la bottiglia può muoversi come vuole (gira attorno al suo asse senza cambiare, perché è un solido di rotazione).
   Colore e trasparenza come li mescola il browser (sRGB): sul bianco ridanno la ripresa sul bianco; sul nero quasi quella sul nero (la trasparenza è una sola per i tre colori).
   python -I tools/velo_blender.py tools/blender/tre-cuori assets/3d/tre-cuori   → assets/3d/tre-cuori-velo.webp, e "velo2d": true nel suo json"""
import json
import sys

import numpy as np
from PIL import Image
from scipy.ndimage import map_coordinates

riprese, base = sys.argv[1], sys.argv[2]
U, Q = 256, 1024  # colonne (da bordo sinistro a destro) e righe (dal fondo alla cima)
m = json.load(open(riprese + '-velo.json', encoding='utf-8'))
W = np.asarray(Image.open(riprese + '-velo-bianco.png').convert('RGB')).astype(np.float32) / 255
K = np.asarray(Image.open(riprese + '-velo-nero.png').convert('RGB')).astype(np.float32) / 255
h, w = W.shape[:2]
assert (h, w) == (m['alto'], m['largo']), 'riprese e misure non combaciano'
sag = np.array(m['sagoma'])
q = (np.arange(Q) + 0.5) / Q
r = np.interp(q, sag[:, 0], sag[:, 1])  # raggio del contorno, in altezze di bottiglia
u = np.linspace(-0.995, 0.995, U)
px = h / m['scala']  # pixel per altezza di bottiglia
X = w / 2 - 0.5 + u[None, :] * r[:, None] * px
Y = np.repeat((h / 2 - (q - 0.5) * px - 0.5)[:, None], U, axis=1)
camp = lambda im: np.stack([map_coordinates(im[..., c], [Y, X], order=1) for c in range(3)], axis=-1)
b, n = camp(W), camp(K)
passa = np.clip((b - n).min(axis=-1), 0, 1)  # quanta luce passa dal fondo (il colore che passa meno: così il colore resta fra 0 e 1)
a = 1 - passa
col = np.where(a[..., None] > 1e-3, (b - passa[..., None]) / np.maximum(a[..., None], 1e-3), 1)
rgba = np.concatenate([np.clip(col, 0, 1), a[..., None]], axis=-1)
rgba[r < 1e-4] = 0  # sopra la cima, niente
assert np.abs(rgba[..., :3] * rgba[..., 3:] + (1 - rgba[..., 3:]) - b).max() < 0.02, 'sul bianco la pelle non ridà la ripresa'
img = Image.fromarray((rgba[::-1] * 255).round().astype(np.uint8), 'RGBA')  # la prima riga dell'immagine è la cima
img.save(base + '-velo.webp', quality=92, alpha_quality=100, method=6)  # colore con poca perdita (1,4 livelli in media), trasparenza esatta: 75 KB invece di 213
d = json.load(open(base + '.json', encoding='utf-8'))
d['velo2d'] = True
json.dump(d, open(base + '.json', 'w', encoding='utf-8'), separators=(',', ':'))
import os
print(f'ok: {U}x{Q}, {os.path.getsize(base + "-velo.webp") / 1024:.0f} KB, trasparenza media sul corpo {passa[int(Q * 0.4):int(Q * 0.6), U // 2 - 20:U // 2 + 20].mean():.2f}')
