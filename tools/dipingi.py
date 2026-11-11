"""Dipinge a olio una foto del progetto per moderna-f.html: tocchi a setole che seguono le forme, colori spezzati, rilievo del colore (impasto).
uso: python -I tools/dipingi.py <profilo> <foto> <uscita.png> <larghezza> [solo-mappa]   profili in PROFILI, 3000 px è la misura di riferimento. I profili si ritoccano a occhio guardando il risultato.
Accanto scrive <uscita>-mappa.png, piccola: dice a js/moderna-f.js cosa si muove e come (rosso cielo, verde chiome e fiori, blu acqua)."""
import os, sys, time, math, random
import numpy as np
from PIL import Image, ImageDraw
from scipy.ndimage import gaussian_filter as blur, sobel, binary_opening, label

# le tavolozze: da scuro a chiaro. Pietra ocra con ombre viola, verdi caldi con ombre blu, terra rossa
PIETRA = [(0, '#23233f'), (0.22, '#4b4670'), (0.42, '#8a7184'), (0.6, '#c49f78'), (0.8, '#e8cf9c'), (1, '#f8ecc8')]
VERDE = [(0, '#0f2a2c'), (0.18, '#1c4a3a'), (0.38, '#2f7040'), (0.58, '#6d9a3c'), (0.8, '#b6c24f'), (1, '#ecdf7e')]
TERRA = [(0, '#3a1d28'), (0.25, '#7b3324'), (0.48, '#bc5c2e'), (0.72, '#e39a55'), (1, '#f6d394')]
ROSSO = [(0, '#5a0f18'), (0.3, '#a81c1f'), (0.55, '#d9352a'), (0.8, '#ee6146'), (1, '#f79a78')]
ACQUA = [(0, '#0d3f5e'), (0.3, '#17708f'), (0.55, '#35a5ad'), (0.78, '#8ed6cc'), (1, '#f4f5e6')]
CIELO_CALMO = [(0, '#a9cbd8'), (0.34, '#c4dbdc'), (0.62, '#e4e6d6'), (0.86, '#f5e6c6'), (1, '#f8dfb4')]
PROFILI = {
    'nudo': dict(cielo=None, nudo=True, fine=(0, 1)),  # moderna-g: ridipinge un quadro già dipinto, senza cambiare i colori (tools/dipingi_porte.py)
    'feudo': dict(cielo=dict(lum=0.5, y=0.5, pezzo=True), ramp_cielo=CIELO_CALMO, calmo=True, fine=(0.24, 0.6)),
    'vigne': dict(cielo=dict(lum=0.24, y=0.8, pezzo=False), ramp_cielo=[(0, '#215a9e'), (0.4, '#3f86c0'), (0.7, '#86bdd2'), (1, '#e3e2c8')], fine=(0, 0.82)),
    'terra': dict(cielo=None, terra=[(0, '#2e1622'), (0.22, '#742c20'), (0.45, '#b84c26'), (0.68, '#de8038'), (0.86, '#efb46a'), (1, '#fae0ae')], fine=(0.2, 0.8)),
    'campo': dict(cielo=dict(lum=0.45, y=0.3, pezzo=True), ramp_cielo=[(0, '#8fb0d8'), (0.5, '#bcd2e2'), (1, '#efe9d6')], fine=(0.28, 1)),
    'mare': dict(cielo=dict(lum=0.35, y=0.3, pezzo=True), ramp_cielo=[(0, '#6ea4d6'), (0.5, '#a9cce0'), (1, '#ece9d6')], acqua=True, terra=[(0, '#4a3f3a'), (0.3, '#8f7a62'), (0.6, '#cdb892'), (0.85, '#ece0c0'), (1, '#fbf5e2')], fine=(0.26, 0.9)),
    'tramonto': dict(luce=0.74, cielo=dict(lum=0.42, y=0.46, pezzo=False, caldo=True), ramp_cielo=[(0, '#6d7fae'), (0.35, '#a79bb6'), (0.65, '#e7b79c'), (1, '#f9dcaa')], verde=[(0, '#141f24'), (0.2, '#2c4630'), (0.42, '#667a30'), (0.62, '#ad9a38'), (0.82, '#e0bf52'), (1, '#f8e38c')], pietra=[(0, '#2a2240'), (0.25, '#5e4668'), (0.5, '#a66f6a'), (0.72, '#dc9f6e'), (1, '#f8d9a0')], fine=(0.3, 0.8)),
}

profilo, src, out, W = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4])
PR = PROFILI[profilo]
random.seed(7); np.random.seed(7)
im = Image.open(src).convert('RGB'); H = round(im.height * W / im.width)
k = float(os.environ.get('DIP_K') or math.sqrt(W * H) / 2493)  # le misure dei pennelli sono pensate per 3000x2072
ref = np.asarray(im.resize((W, H), Image.LANCZOS), dtype=np.float32) / 255
r0, g0, b0 = ref[..., 0], ref[..., 1], ref[..., 2]
lum = 0.3 * r0 + 0.59 * g0 + 0.11 * b0
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
hex3 = lambda h: np.array([int(h[i:i + 2], 16) / 255 for i in (1, 3, 5)], dtype=np.float32)
def rampa(t, tappe):
    pos = [p for p, _ in tappe]; cols = [hex3(c) for _, c in tappe]
    return np.stack([np.interp(t, pos, [c[i] for c in cols]) for i in range(3)], -1).astype(np.float32)

# il cielo
C = PR['cielo']; cielo = np.zeros((H, W), bool)
if C:
    cielo = ((g0 < np.maximum(r0, b0) + 0.012) if C.get('caldo') else (b0 > r0 - 0.03)) & (lum > C['lum']) & (yy < H * C['y'])
    cielo = binary_opening(cielo, iterations=max(1, int(3 * k)))
    if C['pezzo']:
        et, n = label(cielo)
        if n:
            conta = np.bincount(et.ravel()); conta[0] = 0; cielo = et == conta.argmax()
cielo_m = blur(cielo.astype(np.float32), 3 * k)[..., None]

# ogni colore della foto passa alla sua tavolozza
verde = np.clip((g0 - np.maximum(r0, b0) + 0.015) / 0.05, 0, 1)
rosso = np.clip((np.minimum(r0 - g0, r0 - b0) - 0.2) / 0.1, 0, 1)
acqua = np.clip((b0 - r0 - 0.05) / 0.06, 0, 1) * (1 - verde) * (1 - cielo_m[..., 0]) if PR.get('acqua') else np.zeros_like(r0)
terra = np.clip((r0 - g0 - 0.015) / 0.05, 0, 1) * (1 - verde) * (1 - rosso) * (1 - acqua)
pietra = np.clip(1 - verde - terra - rosso - acqua, 0, 1)
t = np.clip((lum - 0.04) / 0.86, 0, 1) ** PR.get('luce', 1)
dip = rampa(t, PR.get('pietra', PIETRA)) * pietra[..., None] + rampa(t, PR.get('verde', VERDE)) * verde[..., None] + rampa(t, PR.get('terra', TERRA)) * terra[..., None] + rampa(t * 1.15, ROSSO) * rosso[..., None] + rampa(t * 1.2, ACQUA) * acqua[..., None]
dip = ref if PR.get('nudo') else dip * 0.8 + ref * 0.2
if C:
    v = yy / (H * C['y'])
    nuv = blur(np.random.rand(H // 8 + 1, W // 8 + 1).astype(np.float32), 16)
    nuv = np.asarray(Image.fromarray((nuv - nuv.min()) / (nuv.max() - nuv.min()) * 255).convert('L').resize((W, H), Image.BICUBIC), dtype=np.float32) / 255
    dip = dip * (1 - cielo_m) + rampa(np.clip(v * 0.9 + (nuv - 0.5) * 0.42, 0, 1), PR['ramp_cielo']) * cielo_m
ref = np.clip(dip, 0, 1)
print(profilo, W, H, flush=True)
mappa = np.stack([cielo_m[..., 0], np.clip(verde + rosso, 0, 1) * (1 - cielo_m[..., 0]), acqua], -1)
mw = 640; Image.fromarray((np.clip(blur(mappa, (1.5 * W / mw, 1.5 * W / mw, 0)), 0, 1) * 255).astype(np.uint8)).resize((mw, round(H * mw / W)), Image.BILINEAR).save(out.rsplit('.', 1)[0] + '-mappa.png')
if len(sys.argv) > 5: sys.exit()

# la tela e il suo rilievo
tela = Image.new('RGB', (W, H), (214, 196, 160)); dc = ImageDraw.Draw(tela)
rilievo = Image.new('L', (W, H), 60); dh = ImageDraw.Draw(rilievo)
calmo = PR.get('calmo', False)
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
    forza = (0.012 if calmo else 0.028) if sky else 0.05
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
        cc = base * (random.uniform(0.99, 1.01) if sky and calmo else random.uniform(0.95, 1.05))
        rgb = tuple(int(max(0, min(1, v0)) * 255) for v0 in cc)
        dc.line(q, fill=rgb, width=w_set, joint='curve')
        dh.line(q, fill=int(150 + random.uniform(-7, 7)) if sky and calmo else int(alt0 + random.uniform(-40, 40)), width=w_set, joint='curve')

t0 = time.time()
STRATI = [(46, 34, 9, 0), (24, 18, 8, 0.035), (12, 9, 7, 0.05), (6.5, 5, 6, 0.06), (3.4, 3, 5, 0.07)]
y0f, y1f = PR['fine']
for R0, st0, lung, soglia in STRATI:
    R, st = R0 * k, max(2, st0 * k)
    rif = blur(ref, (R * 0.55, R * 0.55, 0))
    l = rif[..., 0] * 0.3 + rif[..., 1] * 0.59 + rif[..., 2] * 0.11
    sx, sy = sobel(l, 1) / 8, sobel(l, 0) / 8
    err = np.abs(np.asarray(tela, dtype=np.float32) / 255 - rif).sum(-1)
    punti = []
    for y in np.arange(st / 2, H, st):
        for x in np.arange(st / 2, W, st):
            xa, ya = int(x + random.uniform(-st, st) * 0.45), int(y + random.uniform(-st, st) * 0.45)
            xa, ya = max(0, min(W - 1, xa)), max(0, min(H - 1, ya))
            if err[ya, xa] >= soglia: punti.append((xa, ya))
    random.shuffle(punti)
    for xa, ya in punti:
        sky = bool(cielo[ya, xa])
        if sky and R0 < 12 and random.random() < 0.85: continue  # il cielo resta a tocchi larghi
        if R0 < 5 and (sky or not (H * y0f < ya < H * y1f)): continue  # l'ultimo passaggio fine solo dove serve
        pennellata(xa, ya, R * (1.5 if sky else 1) * random.uniform(0.85, 1.15), rif[ya, xa], lung + (6 if sky else 0), sx, sy, sky)
    print(f'  R={R0}: {len(punti)} tocchi, {time.time() - t0:.0f}s', flush=True)

# l'impasto: la luce di taglio sul rilievo del colore e la trama della tela
sc = max(1, k * 1.6)
Hm = blur(np.asarray(rilievo, dtype=np.float32) / 255, 0.8 * sc) + 0.018 * np.sin(xx * 1.15 / sc) * np.sin(yy * 1.15 / sc)
dX, dY = np.gradient(Hm, axis=1), np.gradient(Hm, axis=0)
luce = (-dX * 0.7 - dY * 0.7) * 2.1 * sc * (1 - (0.72 if calmo else 0.3) * cielo_m[..., 0])
col = np.asarray(tela, dtype=np.float32) / 255
ris = col * (1 + np.clip(luce, -0.42, 0.42))[..., None] + (np.clip(luce - 0.1, 0, 1) ** 2 * 0.5)[..., None]
Image.fromarray((np.clip(ris, 0, 1) * 255).astype(np.uint8)).save(out)
print('fatto', out, f'{time.time() - t0:.0f}s')
