"""Ricostruisce il marchio Feudi (corona + torre con portone) come SVG misurando il PNG del logo.
Uso: python -I tools/ingresso-marchio.py  -> scrive assets/logo/feudi-marchio.svg e stampa le misure e l'errore.
Bordi al subpixel dalla copertura (alfa/255), punte della corona da una retta ai minimi quadrati sulle righe 1-11.
shortcut: ricostruzione da un PNG 396x164 (marchio alto 90px), sostituire col vettoriale originale del cliente quando arriva."""
import pathlib
import numpy as np
from PIL import Image, ImageDraw

root = pathlib.Path(__file__).resolve().parent.parent
a = np.asarray(Image.open(root / 'assets/logo/feudi-logo.png').convert('RGBA'))[:, :, 3].astype(float) / 255

# bordi verticali (colonne medie su righe interne)
col_t = a[30:55].mean(0)              # torre piena
col_d = a[60:88].mean(0)              # torre all'altezza del portone
L = 175 - col_t[160:175].sum()        # bordo sinistro
R = 220 + col_t[220:236].sum()        # bordo destro
DL = 175 + col_d[175:198].sum()       # stipite sinistro del portone
DR = 220 - col_d[198:220].sum()       # stipite destro
C = (L + R) / 2

# bordi orizzontali (righe medie su colonne interne)
f = a[:, 172:224].mean(1)             # tutta la larghezza, lontano dalle punte
fw = a[:, 170:190].mean(1)            # solo muro (senza portone)
fd = a[:, 194:202].mean(1)            # solo colonne del portone
CB = 14 + f[14:26].sum()              # fondo della corona
TT = 40 - f[24:40].sum()              # cima della torre
TB = 60 + fw[60:100].sum()            # base
DT = 30 + fd[30:70].sum()             # architrave del portone

# punte: larghezza di ogni segmento per riga, retta w = m*y + q (y al centro della riga)
ys = np.arange(1, 12) + 0.5
w_side = np.array([(a[y, 160:186].sum() + a[y, 211:236].sum()) / 2 for y in range(1, 12)])
w_mid = np.array([a[y, 186:211].sum() for y in range(1, 12)])
m1, q1 = np.polyfit(ys, w_side, 1)
m2, q2 = np.polyfit(ys, w_mid, 1)
tip_side, tip_mid = -q1 / m1, -q2 / m2
yn = (C - q2 / 2 - L - q1) / (m1 + m2 / 2)     # fondo della tacca: incontro delle due rette
xn = L + m1 * yn + q1

o = lambda x, y: (round(x - L, 2), round(y, 2))   # origine nell'angolo in alto a sinistra del marchio
corona = [o(L, tip_side), o(xn, yn), o(C, tip_mid), o(2 * C - xn, yn), o(R, tip_side), o(R, CB), o(L, CB)]
torre = [o(L, TT), o(R, TT), o(R, TB), o(DR, TB), o(DR, DT), o(DL, DT), o(DL, TB), o(L, TB)]
W, H = round(R - L, 2), round(TB, 2)
d = lambda pts: 'M' + ' '.join(f'{x:g} {y:g}' for x, y in pts) + 'Z'
svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W:g} {H:g}" width="{W:g}" height="{H:g}">'
       f'<title>Feudi Salentini, marchio (ricostruito dal PNG, da sostituire con l\'originale)</title>'
       f'<path fill="#cdb780" d="{d(corona)} {d(torre)}"/></svg>\n')
(root / 'assets/logo/feudi-marchio.svg').write_text(svg, encoding='utf-8')
print('viewBox 0 0', W, H)
print('corona', d(corona))
print('torre ', d(torre))
print('portone x', round(DL - L, 2), '-', round(DR - L, 2), ' y', round(DT, 2), '-', H)

# verifica: rasterizza i poligoni a 16x e confronta con l'alfa del PNG nel riquadro del marchio
S = 16
img = Image.new('L', (76 * S, 100 * S), 0)
g = ImageDraw.Draw(img)
for pts in (corona, torre):
    g.polygon([((x + L - 160) * S, y * S) for x, y in pts], fill=255)
mine = np.asarray(img.resize((76, 100), Image.BOX)).astype(float) / 255
err = np.abs(mine - a[0:100, 160:236])
print(f'errore medio {err.mean():.4f}, massimo {err.max():.2f}')
assert err.mean() < 0.02, 'ricostruzione troppo lontana dal PNG'
