"""Il grappolo dipinto per i numeri della pagina azienda (6 nov 2026, "nella parte dei numeri un'altra cosa dipinta, alternativa al ramo, sempre per il vino"):
dalla foto vera assets/photo/uva.webp il grappolo di sinistra col suo gambo, scontornato con un contorno fatto a mano e, dentro, per luce (il fondo è quasi nero)
e per colore (la foglia gialla a destra resta fuori); poi ridipinto con i tocchi a setole di tools/dipingi_ramo.py, tenendo un po' di foto perché gli acini si leggano.
uso: python -I tools/dipingi_grappolo.py   scrive assets/quadri/grappolo.webp (con trasparenza) e una prova sul blu notte in tools/grappolo-prova.jpg"""
import math, os, random, sys
import numpy as np
from PIL import Image, ImageDraw
from scipy.ndimage import gaussian_filter as blur, sobel, maximum_filter

R0 = os.path.dirname(os.path.dirname(os.path.abspath(sys.argv[0])))
SRC, DST = os.path.join(R0, 'assets', 'photo', 'uva.webp'), os.path.join(R0, 'assets', 'quadri', 'grappolo.webp')
random.seed('grappolo'); np.random.seed(11)

X0, Y0, X1, Y1 = 640, 0, 1120, 1260  # il grappolo di sinistra, col gambo fino al bordo alto della foto
im = Image.open(SRC).convert('RGB').crop((X0, Y0, X1, Y1)); W, H = im.size
rgb0 = np.asarray(im, dtype=np.float32) / 255
r, g, b = rgb0[..., 0] * 255, rgb0[..., 1] * 255, rgb0[..., 2] * 255
CONT = [(876, 0), (932, 0), (932, 290), (968, 300), (975, 395), (1020, 420), (1022, 500), (1080, 580), (1082, 660), (1060, 712), (1064, 800), (1062, 860), (1072, 960),
        (1035, 1050), (1025, 1140), (980, 1200), (925, 1228), (830, 1228), (800, 1150), (765, 1060), (752, 900), (745, 830), (675, 720), (668, 590), (675, 500),
        (780, 440), (850, 400), (862, 300), (876, 290)]  # coordinate della foto intera
dentro = Image.new('L', (W, H), 0); ImageDraw.Draw(dentro).polygon([(x - X0, y - Y0) for x, y in CONT], fill=255)
dentro = blur(np.asarray(dentro, dtype=np.float32) / 255, 6)
luce = np.clip((0.3 * r + 0.59 * g + 0.11 * b - 26) / 26, 0, 1)  # il fondo attorno è quasi nero, gli acini anche in ombra no
xx = np.arange(W)[None, :] + X0
yy = np.arange(H)[:, None] + Y0
foglia = np.clip((g - b - 75) / 35, 0, 1) * (g > r - 10) * np.clip((xx - 950) / 30, 0, 1) * (yy < 900)  # la foglia gialla dietro, a destra; i piccioli verdi dentro il grappolo e l'acino verde in basso restano
prato = np.clip((g - r + 2) / 8, 0, 1) * np.clip((g - b - 15) / 12, 0, 1) * np.clip((yy - 1010) / 30, 0, 1)  # in basso il fondo sfocato è un verde più chiaro: gli acini lì sono rossi
tralcio = np.clip((np.abs(xx - 259 - X0) - 9) / 3, 0, 1) * (np.abs(yy - 135) < 26)  # il tralcio che incrocia il gambo: resta solo il gambo, niente croce
a0 = blur(dentro * luce * (1 - foglia) * (1 - prato) * (1 - tralcio), 0.8)

pes = blur(a0, 5) + 1e-3
rif0 = np.where((a0 > 0.5)[..., None], rgb0, np.stack([blur(rgb0[..., i] * a0, 5) / pes for i in range(3)], -1))  # fuori dal grappolo il suo colore, non il fondo
tela = Image.new('RGB', (W, H), (20, 26, 48)); dc = ImageDraw.Draw(tela); cop = Image.new('L', (W, H), 0); dk = ImageDraw.Draw(cop); ril = Image.new('L', (W, H), 90); dh = ImageDraw.Draw(ril)
for R, st, lung, soglia in [(7, 6, 7, 0), (3.6, 3.2, 6, 0.05), (1.8, 1.8, 5, 0.06)]:
    rif = blur(rif0, (R * 0.5, R * 0.5, 0)); l = rif @ np.array([0.3, 0.59, 0.11], dtype=np.float32); sx, sy = sobel(l, 1) / 8, sobel(l, 0) / 8
    err = np.abs(np.asarray(tela, dtype=np.float32) / 255 - rif).sum(-1); punti = []
    for y in np.arange(st / 2, H, st):
        for x in np.arange(st / 2, W, st):
            xa, ya = int(x + random.uniform(-st, st) * 0.45), int(y + random.uniform(-st, st) * 0.45)
            if 0 <= xa < W and 0 <= ya < H and a0[ya, xa] > 0.4 and err[ya, xa] >= soglia: punti.append((xa, ya))
    random.shuffle(punti)
    for xa, ya in punti:
        col = rif[ya, xa]; pts = [(xa, ya)]; px, py = float(xa), float(ya); d0x, d0y = 0, 0
        for i in range(lung):
            gx, gy = sx[int(py), int(px)], sy[int(py), int(px)]; gg = math.hypot(gx, gy)
            dx, dy = (-gy / gg, gx / gg) if gg > 0.012 else (0.15, 1.0)  # dove è liscio, tocchi lungo il gambo (scende)
            if dx * d0x + dy * d0y < 0: dx, dy = -dx, -dy
            if i: dx, dy = 0.45 * dx + 0.55 * d0x, 0.45 * dy + 0.55 * d0y
            n = math.hypot(dx, dy) or 1; dx, dy = dx / n, dy / n; px += dx * R; py += dy * R
            if not (0 <= px < W - 1 and 0 <= py < H - 1) or a0[int(py), int(px)] < 0.3: break
            if i >= 2 and np.abs(rif[int(py), int(px)] - col).sum() > 0.22: break
            pts.append((px, py)); d0x, d0y = dx, dy
        if len(pts) < 2: pts.append((xa + R * 0.3, ya + R))
        n_s = 3 if R < 4 else 5; w_s = max(1, int(2.3 * R / n_s)); base = np.clip(col + np.random.normal(0, 0.02, 3), 0, 1); alt = random.uniform(120, 215)
        for s_ in range(n_s):
            o = (s_ / (n_s - 1) - 0.5) * 2 * R; q = []
            for j, (pa, pb) in enumerate(pts):
                c, dd = pts[min(len(pts) - 1, j + 1)]; e, f = pts[max(0, j - 1)]; nx, ny = -(dd - f), c - e; ll = math.hypot(nx, ny) or 1; q.append((pa + nx / ll * o, pb + ny / ll * o))
            cc = tuple(int(max(0, min(1, v)) * 255) for v in base * random.uniform(0.95, 1.05))
            dc.line(q, fill=cc, width=w_s, joint='curve'); dk.line(q, fill=255, width=w_s, joint='curve'); dh.line(q, fill=int(alt + random.uniform(-30, 30)), width=w_s, joint='curve')
    print('passata', R, len(punti), flush=True)
Hm = blur(np.asarray(ril, dtype=np.float32) / 255, 0.9); dX, dY = np.gradient(Hm, axis=1), np.gradient(Hm, axis=0); lu = (-dX * 0.7 - dY * 0.7) * 2.4
col = np.asarray(tela, dtype=np.float32) / 255; col = col * (1 + np.clip(lu, -0.38, 0.38))[..., None]
copre = blur(np.asarray(cop, dtype=np.float32) / 255, 0.7)[..., None]
fin = col * 0.62 + rif0 * 0.38  # dipinto, ma gli acini restano tondi
fin = fin * copre + rif0 * (1 - copre)
al = np.minimum(copre[..., 0], blur(maximum_filter(a0, 3), 1))
assert al[5, 900 - X0 - 5:932 - X0].max() > 0.5 and al[600, 5] < 0.05, 'il gambo deve arrivare in cima e il fondo restare fuori'
Image.fromarray((np.clip(np.dstack([fin, al]), 0, 1) * 255).astype(np.uint8), 'RGBA').save(DST, 'WEBP', quality=86, alpha_quality=90, method=5)
prova = Image.new('RGBA', (W, H), (21, 28, 52, 255)); prova.alpha_composite(Image.open(DST)); prova.convert('RGB').save(os.path.join(R0, 'tools', 'grappolo-prova.jpg'), quality=82)
print('ok', DST, os.path.getsize(DST) // 1024, 'KB')
