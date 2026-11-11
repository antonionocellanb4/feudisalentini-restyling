"""Dipinge la foto del feudo a olio: tocchi a setole che seguono le forme, colori spezzati, rilievo del colore (impasto).
uso: python -I dipingi_feudo.py <foto> <uscita.png> <larghezza>"""
import sys, time, math, random
import numpy as np
from PIL import Image, ImageDraw
from scipy.ndimage import gaussian_filter as blur, sobel, binary_opening, label

src, out, W = sys.argv[1], sys.argv[2], int(sys.argv[3])
random.seed(7); np.random.seed(7)
k = W / 3000  # le misure sono pensate per 3000 px
im = Image.open(src).convert('RGB'); H = round(im.height * W / im.width)
ref = np.asarray(im.resize((W, H), Image.LANCZOS), dtype=np.float32) / 255
r0, g0, b0 = ref[..., 0], ref[..., 1], ref[..., 2]
lum = 0.3 * r0 + 0.59 * g0 + 0.11 * b0
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
hex3 = lambda h: np.array([int(h[i:i + 2], 16) / 255 for i in (1, 3, 5)], dtype=np.float32)
def rampa(t, tappe):
    pos = [p for p, _ in tappe]; cols = [hex3(c) for _, c in tappe]
    return np.stack([np.interp(t, pos, [c[i] for c in cols]) for i in range(3)], -1).astype(np.float32)

# il cielo: la parte chiara e azzurrata in alto, un pezzo solo
cielo = (b0 > r0 - 0.03) & (lum > 0.5) & (yy < H * 0.5)
cielo = binary_opening(cielo, iterations=max(1, int(3 * k)))
et, n = label(cielo)
if n:
    conta = np.bincount(et.ravel()); conta[0] = 0; cielo = et == conta.argmax()
cielo_m = blur(cielo.astype(np.float32), 3 * k)[..., None]

# la tavolozza del pittore: pietra ocra con ombre viola, verdi caldi con ombre blu, terra rossa, cielo chiaro e calmo
sat = ref.max(-1) - ref.min(-1)
verde = np.clip((g0 - np.maximum(r0, b0) + 0.015) / 0.05, 0, 1)
terra = np.clip((r0 - g0 - 0.015) / 0.05, 0, 1) * (1 - verde)
pietra = np.clip(1 - verde - terra, 0, 1)
t = np.clip((lum - 0.04) / 0.86, 0, 1)
P_pietra = rampa(t, [(0, '#23233f'), (0.22, '#4b4670'), (0.42, '#8a7184'), (0.6, '#c49f78'), (0.8, '#e8cf9c'), (1, '#f8ecc8')])
P_verde = rampa(t, [(0, '#0f2a2c'), (0.18, '#1c4a3a'), (0.38, '#2f7040'), (0.58, '#6d9a3c'), (0.8, '#b6c24f'), (1, '#ecdf7e')])
P_terra = rampa(t, [(0, '#3a1d28'), (0.25, '#7b3324'), (0.48, '#bc5c2e'), (0.72, '#e39a55'), (1, '#f6d394')])
dip = (P_pietra * pietra[..., None] + P_verde * verde[..., None] + P_terra * terra[..., None]) * 0.8 + ref * 0.2
v = yy / (H * 0.5)
nuv = blur(np.random.rand(H // 8 + 1, W // 8 + 1).astype(np.float32), 16)
nuv = np.asarray(Image.fromarray((nuv - nuv.min()) / (nuv.max() - nuv.min()) * 255).convert('L').resize((W, H), Image.BICUBIC), dtype=np.float32) / 255
C = rampa(np.clip(v * 0.9 + (nuv - 0.5) * 0.42, 0, 1), [(0, '#a9cbd8'), (0.34, '#c4dbdc'), (0.62, '#e4e6d6'), (0.86, '#f5e6c6'), (1, '#f8dfb4')])
dip = dip * (1 - cielo_m) + C * cielo_m
ref = np.clip(dip, 0, 1)
print('tavolozza pronta', W, H, flush=True)

# la tela e il suo rilievo
tela = Image.new('RGB', (W, H), (214, 196, 160)); dc = ImageDraw.Draw(tela)
rilievo = Image.new('L', (W, H), 60); dh = ImageDraw.Draw(rilievo)
cielo_b = cielo
def flusso(x, y):  # dove la foto non ha forme, i tocchi seguono un'onda larga
    return 0.16 * math.sin(x / (420 * k) + y / (260 * k)) + 0.1 * math.sin(x / (160 * k) - 1)
SPEZZATI = [hex3(c) for c in ('#6a5fa8', '#3f6fa6', '#e6b24c', '#d9663c', '#7fa84a')]

def pennellata(x, y, R, col, passo_max, sx, sy, sky):
    pts = [(x, y)]; dx0, dy0 = 0, 0; px, py = x, y
    for i in range(passo_max):
        ix, iy = int(px), int(py)
        gx, gy = sx[iy, ix], sy[iy, ix]; g = math.hypot(gx, gy)
        if sky or g < 0.012:
            a = flusso(px, py); dx, dy = math.cos(a), math.sin(a)
        else:
            dx, dy = -gy / g, gx / g
        if dx * dx0 + dy * dy0 < 0: dx, dy = -dx, -dy
        if i: dx, dy = 0.42 * dx + 0.58 * dx0, 0.42 * dy + 0.58 * dy0
        n = math.hypot(dx, dy) or 1; dx, dy = dx / n, dy / n
        px += dx * R * 1.1; py += dy * R * 1.1
        if not (0 <= px < W - 1 and 0 <= py < H - 1): break
        if i >= 2 and np.abs(ref[int(py), int(px)] - col).sum() > 0.24: break
        pts.append((px, py)); dx0, dy0 = dx, dy
    if len(pts) < 2: pts.append((x + R, y))
    # il fascio di setole
    n_set = max(3, int(R / (2.3 * k) / 1.6)) if R > 6 * k else 3
    w_set = max(1, int(2.4 * R / n_set))
    forza = 0.012 if sky else 0.05
    base = np.clip(col + np.random.normal(0, forza, 3), 0, 1)
    if not sky and random.random() < 0.13: base = np.clip(base * 0.8 + random.choice(SPEZZATI) * 0.2, 0, 1)
    alt0 = random.uniform(120, 220)
    for s in range(n_set):
        o = (s / max(1, n_set - 1) - 0.5) * 2 * R
        q = []
        for j, (a, b) in enumerate(pts):
            c, d = pts[min(len(pts) - 1, j + 1)]; e, f = pts[max(0, j - 1)]
            nx, ny = -(d - f), c - e; l = math.hypot(nx, ny) or 1
            q.append((a + nx / l * o, b + ny / l * o))
        cc = base * random.uniform(0.95, 1.05) if not sky else base * random.uniform(0.99, 1.01)
        rgb = tuple(int(max(0, min(1, v0)) * 255) for v0 in cc)
        dc.line(q, fill=rgb, width=w_set, joint='curve')
        dh.line(q, fill=int(150 + random.uniform(-7, 7)) if sky else int(alt0 + random.uniform(-40, 40)), width=w_set, joint='curve')

t0 = time.time()
STRATI = [(46, 34, 9, 0), (24, 18, 8, 0.035), (12, 9, 7, 0.05), (6.5, 5, 6, 0.06), (3.4, 3, 5, 0.07)]
for R0, st0, lung, soglia in STRATI:
    R, st = R0 * k, max(2, st0 * k)
    rif = blur(ref, (R * 0.55, R * 0.55, 0))
    l = rif[..., 0] * 0.3 + rif[..., 1] * 0.59 + rif[..., 2] * 0.11
    sx, sy = sobel(l, 1) / 8, sobel(l, 0) / 8
    att = np.asarray(tela, dtype=np.float32) / 255
    err = np.abs(att - rif).sum(-1)
    punti = []
    for y in np.arange(st / 2, H, st):
        for x in np.arange(st / 2, W, st):
            xa, ya = int(x + random.uniform(-st, st) * 0.45), int(y + random.uniform(-st, st) * 0.45)
            xa, ya = max(0, min(W - 1, xa)), max(0, min(H - 1, ya))
            if err[ya, xa] >= soglia: punti.append((xa, ya))
    random.shuffle(punti)
    for xa, ya in punti:
        sky = bool(cielo_b[ya, xa])
        if sky and R0 < 12 and random.random() < 0.85: continue  # il cielo resta a tocchi larghi: calmo, ci va il titolo
        if R0 < 5 and not (H * 0.24 < ya < H * 0.6): continue
        pennellata(xa, ya, R * (1.5 if sky else 1) * random.uniform(0.85, 1.15), rif[ya, xa], lung + (6 if sky else 0), sx, sy, sky)
    print(f'strato R={R0}: {len(punti)} tocchi, {time.time() - t0:.0f}s', flush=True)

# l'impasto: la luce di taglio sul rilievo del colore e la trama della tela
Hm = np.asarray(rilievo, dtype=np.float32) / 255
Hm = blur(Hm, 0.8 * max(1, k * 1.6))
tr = 0.018 * np.sin(xx * 1.15 / max(1, k * 1.6)) * np.sin(yy * 1.15 / max(1, k * 1.6))
Hm = Hm + tr
dX, dY = np.gradient(Hm, axis=1), np.gradient(Hm, axis=0)
luce = (-dX * 0.7 - dY * 0.7) * 2.1 * max(1, k * 1.6) * (1 - 0.72 * cielo_m[..., 0])
col = np.asarray(tela, dtype=np.float32) / 255
ris = col * (1 + np.clip(luce, -0.42, 0.42))[..., None] + (np.clip(luce - 0.1, 0, 1) ** 2 * 0.5)[..., None]
Image.fromarray((np.clip(ris, 0, 1) * 255).astype(np.uint8)).save(out)
print('fatto', out, f'{time.time() - t0:.0f}s')
