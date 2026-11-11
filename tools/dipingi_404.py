"""La pagina 404 (6 nov 2026, "stile sempre dipinto, con uva rotta sul monitor"): un acino vero di assets/photo/uva.webp arriva contro lo schermo e scoppia.
Qui si dipinge lo schizzo: la macchia di succo col disegno fatto dal codice (centro, raggi, gocce), le bucce strappate di due acini veri della stessa foto, la polpa
e i vinaccioli; poi i tocchi a setole di tools/dipingi_grappolo.py e i riflessi del bagnato. Le colate sono a parte, ognuna nella sua colonna, così nella pagina
scendono una per una.
uso: python -I tools/dipingi_404.py   scrive assets/quadri/404/{schizzo,colate,acino}.webp, sections/404-colate.html (le colate, generato) e tools/404-prova.jpg"""
import math, os, random, sys
import numpy as np
from PIL import Image, ImageDraw
from scipy.ndimage import gaussian_filter as blur, sobel, maximum_filter

R0 = os.path.dirname(os.path.dirname(os.path.abspath(sys.argv[0])))
OUT = os.path.join(R0, 'assets', 'quadri', '404'); os.makedirs(OUT, exist_ok=True)
random.seed('404'); rng = np.random.default_rng(404); np.random.seed(404)
W, H, CX, CY, RC = 1200, 1700, 600, 580, 190  # la tela, il centro dello schizzo, il raggio della macchia piena
FOTO = Image.open(os.path.join(R0, 'assets', 'photo', 'uva.webp')).convert('RGB')
ss = lambda a, b, x: np.clip((x - a) / (b - a), 0, 1) ** 2 * (3 - 2 * np.clip((x - a) / (b - a), 0, 1))

def acino(x, y, r, k=2.2):
    """un acino vero, tondo, ingrandito k volte: (rgb 0-1, alfa 0-1)"""
    p = FOTO.crop((x - r - 4, y - r - 4, x + r + 4, y + r + 4)); n = round(p.width * k); p = p.resize((n, n), Image.LANCZOS)
    m = Image.new('L', (n, n), 0); ImageDraw.Draw(m).ellipse((4 * k, 4 * k, n - 4 * k, n - 4 * k), fill=255)
    return np.asarray(p, dtype=np.float32) / 255, blur(np.asarray(m, dtype=np.float32) / 255, 1.2)

def dipingi(rif0, a0, passate, fp):
    """i tocchi a setole (come tools/dipingi_grappolo.py) dentro l'alfa a0; fp = quanta parte del riferimento resta"""
    h, w = a0.shape
    tela = Image.new('RGB', (w, h), (243, 239, 234)); dc = ImageDraw.Draw(tela); cop = Image.new('L', (w, h), 0); dk = ImageDraw.Draw(cop); ril = Image.new('L', (w, h), 90); dh = ImageDraw.Draw(ril)
    for R, st, lung, soglia in passate:
        rif = blur(rif0, (R * 0.5, R * 0.5, 0)); l = rif @ np.array([0.3, 0.59, 0.11], dtype=np.float32); sx, sy = sobel(l, 1) / 8, sobel(l, 0) / 8
        err = np.abs(np.asarray(tela, dtype=np.float32) / 255 - rif).sum(-1); punti = []
        for y in np.arange(st / 2, h, st):
            for x in np.arange(st / 2, w, st):
                xa, ya = int(x + random.uniform(-st, st) * 0.45), int(y + random.uniform(-st, st) * 0.45)
                if 0 <= xa < w and 0 <= ya < h and a0[ya, xa] > 0.4 and err[ya, xa] >= soglia: punti.append((xa, ya))
        random.shuffle(punti)
        for xa, ya in punti:
            col = rif[ya, xa]; pts = [(xa, ya)]; px, py = float(xa), float(ya); d0x, d0y = 0, 0
            for i in range(lung):
                gx, gy = sx[int(py), int(px)], sy[int(py), int(px)]; gg = math.hypot(gx, gy)
                dx, dy = (-gy / gg, gx / gg) if gg > 0.012 else (0.1, 1.0)  # dove è liscio, tocchi che scendono come il succo
                if dx * d0x + dy * d0y < 0: dx, dy = -dx, -dy
                if i: dx, dy = 0.45 * dx + 0.55 * d0x, 0.45 * dy + 0.55 * d0y
                n = math.hypot(dx, dy) or 1; dx, dy = dx / n, dy / n; px += dx * R; py += dy * R
                if not (0 <= px < w - 1 and 0 <= py < h - 1) or a0[int(py), int(px)] < 0.3: break
                if i >= 2 and np.abs(rif[int(py), int(px)] - col).sum() > 0.22: break
                pts.append((px, py)); d0x, d0y = dx, dy
            if len(pts) < 2: pts.append((xa + R * 0.2, ya + R))
            n_s = 3 if R < 4 else 5; w_s = max(1, int(2.3 * R / n_s)); base = np.clip(col + np.random.normal(0, 0.02, 3), 0, 1); alt = random.uniform(120, 215)
            for s_ in range(n_s):
                o = (s_ / (n_s - 1) - 0.5) * 2 * R; q = []
                for j, (pa, pb) in enumerate(pts):
                    c, dd = pts[min(len(pts) - 1, j + 1)]; e, f = pts[max(0, j - 1)]; nx, ny = -(dd - f), c - e; ll = math.hypot(nx, ny) or 1; q.append((pa + nx / ll * o, pb + ny / ll * o))
                cc = tuple(int(max(0, min(1, v)) * 255) for v in base * random.uniform(0.95, 1.05))
                dc.line(q, fill=cc, width=w_s, joint='curve'); dk.line(q, fill=255, width=w_s, joint='curve'); dh.line(q, fill=int(alt + random.uniform(-30, 30)), width=w_s, joint='curve')
        print('passata', R, len(punti), flush=True)
    Hm = blur(np.asarray(ril, dtype=np.float32) / 255, 0.9); dX, dY = np.gradient(Hm, axis=1), np.gradient(Hm, axis=0); lu = (-dX * 0.7 - dY * 0.7) * 2.4
    col = np.asarray(tela, dtype=np.float32) / 255 * (1 + np.clip(lu, -0.38, 0.38))[..., None]
    copre = blur(np.asarray(cop, dtype=np.float32) / 255, 0.7)[..., None]
    fin = col * (1 - fp) + rif0 * fp
    return fin * copre + rif0 * (1 - copre)

# ---- la forma dello schizzo: irregolare e spinta verso l'alto a destra (l'acino arriva dal basso a sinistra): lobi larghi e raggi sottili di ogni lunghezza,
#      con la goccia in punta e gocce allungate nella direzione del volo, più gli spruzzi fini
S = Image.new('L', (W, H), 0); d = ImageDraw.Draw(S)
DIR = -0.75
ph = rng.uniform(0, 2 * np.pi, 14); amp = [0, 0, .07, .06, .05, .045, .035, .03, .025, .02, .02, .015, .015, .012]
rag = lambda t: RC * (1 + sum(amp[k] * math.sin(k * t + ph[k]) for k in range(2, 14))) * (1 + 0.16 * math.cos(t - DIR))
d.polygon([(CX + rag(t) * math.cos(t), CY + rag(t) * math.sin(t)) for t in np.linspace(0, 2 * np.pi, 600, endpoint=False)], fill=255)
def goccia(x, y, r, t, k=1.0):
    d.polygon([(x + r * k * math.cos(s_) * math.cos(t) - r * math.sin(s_) * math.sin(t), y + r * k * math.cos(s_) * math.sin(t) + r * math.sin(s_) * math.cos(t))
               for s_ in np.linspace(0, 2 * np.pi, 28, endpoint=False)], fill=255)
for i in range(22):
    t = DIR + rng.normal(0, 0.5) if i < 6 else rng.uniform(0, 2 * np.pi)
    uy = math.sin(t)
    L = RC * min(1.3, rng.pareto(2.2) * 0.45 + 0.12) * (1 + 0.5 * max(0, math.cos(t - DIR))) * (0.55 if uy > 0.5 else 1)
    b = RC * (rng.uniform(0.16, 0.3) if L < RC * 0.3 else rng.uniform(0.05, 0.12))  # i corti sono lobi larghi, i lunghi raggi sottili
    r0, r1 = rag(t) * 0.8, min(470, rag(t) * 0.95 + L); bend = rng.normal(0, 0.06)
    lato = [(r0 + (r1 - r0) * q, b * (1 - 0.7 * q), t + bend * q * q) for q in np.linspace(0, 1, 12)]
    d.polygon([(CX + rr_ * math.cos(tt) - ww * math.sin(tt), CY + rr_ * math.sin(tt) + ww * math.cos(tt)) for rr_, ww, tt in lato] +
              [(CX + rr_ * math.cos(tt) + ww * math.sin(tt), CY + rr_ * math.sin(tt) - ww * math.cos(tt)) for rr_, ww, tt in lato[::-1]], fill=255)
    tt = t + bend; rt = b * rng.uniform(0.5, 0.8); goccia(CX + (r1 + rt * 0.4) * math.cos(tt), CY + (r1 + rt * 0.4) * math.sin(tt), rt, tt, 1.15)
    dist, rr = r1 + rt * 1.5, rt
    for k in range(int(rng.integers(0, 5))):
        rr *= rng.uniform(0.5, 0.8); dist += rr * 2.6 + rng.uniform(6, 40)
        if rr >= 3.5 and dist < 540: goccia(CX + dist * math.cos(tt), CY + dist * math.sin(tt), rr, tt, rng.uniform(1.2, 2.0))
for i in range(130):  # spruzzi fini, più fitti nella direzione del volo
    t = DIR + rng.normal(0, 1.1) if i < 80 else rng.uniform(0, 2 * np.pi); dist = RC * rng.uniform(1.25, 2.5); rr = rng.uniform(3.5, 9) * (1.45 - dist / (2.5 * RC))
    if rr >= 3.5 and dist < 540: goccia(CX + dist * math.cos(t), CY + dist * math.sin(t), rr, t, rng.uniform(1, 1.9))
Sf = ss(0.3, 0.55, blur(np.asarray(S, dtype=np.float32) / 255, 4))  # si fondono come un liquido

# ---- le colate: dal bordo basso della macchia, una per colonna; più larghe dove partono, si gonfiano e si stringono, con la goccia in fondo
D = np.zeros((H, W), dtype=np.float32); colate = []
for fx, w_, L in [(-0.92, 14, 300), (-0.46, 26, 900), (0.0, 13, 520), (0.46, 24, 1000), (0.92, 15, 420)]:
    x0 = int(CX + fx * RC + rng.uniform(-6, 6)); col_ = np.nonzero(Sf[CY:CY + int(RC * 1.6), x0] > 0.5)[0]
    y0 = CY + int(col_.max()) - 26; L = min(L, H - 70 - y0); fi = rng.uniform(0, 6.28)
    gonfio = blur(rng.normal(size=L // 2 + 2), 7); gonfio /= np.abs(gonfio).max() + 1e-6
    m = Image.new('L', (W, H), 0); dm = ImageDraw.Draw(m); xs = []
    for n_, y in enumerate(range(y0, y0 + L, 2)):
        u = (y - y0) / L; x = x0 + 5 * math.sin((y - y0) / 85 + fi) + 5 * u * math.sin(fi)
        r = w_ / 2 * (1 - 0.32 * u) * (1 + 0.24 * gonfio[n_]) + w_ * 0.5 * max(0, 1 - (y - y0) / 45)
        dm.ellipse((x - r, y - r, x + r, y + r), fill=255); xs.append(x)
    rb = w_ / 2 * 1.3; dm.ellipse((xs[-1] - rb, y0 + L - rb * 0.6, xs[-1] + rb, y0 + L + rb * 1.4), fill=255)
    D = np.maximum(D, np.asarray(m, dtype=np.float32) / 255)
    colate.append((int(min(xs) - w_ - 3), y0 - 6, int(max(xs) + w_ + 3), int(y0 + L + rb * 1.6)))
Df = ss(0.35, 0.6, blur(D, 2.2))
for i, a in enumerate(colate):
    for b in colate[i + 1:]: assert a[2] < b[0] or b[2] < a[0], 'le colonne delle colate non devono toccarsi'
U = np.maximum(Sf, Df)

# ---- il colore del succo: come una macchia vera, il bordo più scuro (il colore si ferma lì), dentro più chiaro e mosso
T = np.clip(blur(U, 10) * 1.35, 0, 1)
bordo = np.clip((U - blur(U, 5)) * 2.6, 0, 1)
C_ = lambda *v: np.array(v, dtype=np.float32) / 255
rif = C_(156, 34, 72) + (C_(108, 16, 46) - C_(156, 34, 72)) * (T ** 0.6)[..., None]
rif = rif * (1 - 0.72 * bordo[..., None]) + C_(46, 6, 24) * (0.72 * bordo[..., None])
for sg, k in [(14, np.array([0.07, 0.0, 0.03])), (42, np.array([0.04, -0.01, 0.05]))]:
    nz = blur(rng.normal(size=(H, W)), sg); nz /= np.abs(nz).max(); rif = rif + nz[..., None] * k
rif = np.clip(rif, 0, 1).astype(np.float32)
al = U * (0.84 + 0.16 * T)
# l'uva rotta: la buccia strappata dell'acino viola che vola (una sola: due mezzelune facevano un occhio) (schiacciate, il bordo coperto dal succo), la polpa verde chiara e lucida, i vinaccioli
for (x, y, r), (cx, cy), ang, sq in [((918, 487, 44), (CX - 34, CY - 14), 25, 0.68)]:
    rgb, m = acino(x, y, r, 3.0); n = m.shape[0]
    tg = np.linspace(-1, 1, n); cut = n / 2 + rng.normal(0, 4, n).cumsum() * 0.6 + 10 * np.sin(tg * 9)  # lo strappo, frastagliato
    m = m * (np.arange(n)[:, None] < cut[None, :])
    rgb = rgb * 0.72 * (0.6 + 0.4 * blur(m, 6))[..., None]  # la buccia si scurisce verso lo strappo
    im = Image.fromarray((np.dstack([np.clip(rgb, 0, 1), m]) * 255).astype(np.uint8), 'RGBA').resize((n, round(n * sq))).rotate(ang, expand=True, resample=Image.BICUBIC)
    a = np.asarray(im, dtype=np.float32) / 255; h_, w_ = a.shape[:2]; y1, x1 = cy - h_ // 2, cx - w_ // 2
    ab = a[..., 3:] * (1 - 0.65 * np.clip((a[..., 3:] - blur(a[..., 3], 4)[..., None]) * 3, 0, 1))  # sul bordo della buccia passa il succo
    rif[y1:y1 + h_, x1:x1 + w_] = rif[y1:y1 + h_, x1:x1 + w_] * (1 - ab) + a[..., :3] * ab
    al[y1:y1 + h_, x1:x1 + w_] = np.maximum(al[y1:y1 + h_, x1:x1 + w_], a[..., 3])
polpa = Image.new('L', (W, H), 0); dp = ImageDraw.Draw(polpa)
for (x, y, r) in [(CX + 40, CY + 34, 28)]:
    dp.polygon([(x + r * (1 + 0.2 * math.sin(3 * t + x)) * math.cos(t), y + r * (1 + 0.2 * math.sin(3 * t + x)) * math.sin(t) * 0.8) for t in np.linspace(0, 6.28, 90)], fill=255)
pm = blur(np.asarray(polpa, dtype=np.float32) / 255, 4) * 0.5
rif = rif * (1 - pm[..., None]) + C_(190, 196, 140) * pm[..., None]
sem = Image.new('L', (W, H), 0); ds = ImageDraw.Draw(sem)
for (x, y, ang) in [(CX + 52, CY + 40, 0.5)]:
    ca, sa = math.cos(ang), math.sin(ang)
    ds.polygon([(x + (u * 11) * ca - (v * 7 * (1 - 0.5 * max(0, u))) * sa, y + (u * 11) * sa + (v * 7 * (1 - 0.5 * max(0, u))) * ca) for u, v in
                [(math.cos(t), math.sin(t)) for t in np.linspace(0, 6.28, 40)]], fill=255)
sm = blur(np.asarray(sem, dtype=np.float32) / 255, 0.8)
rif = rif * (1 - sm[..., None]) + C_(150, 100, 48) * sm[..., None]

fin = dipingi(rif, (al > 0.3).astype(np.float32) * al, [(6, 5, 7, 0), (3.2, 3, 6, 0.05), (1.7, 1.7, 5, 0.06)], 0.36)
# il bagnato: un riflesso chiaro solo sulle gocce spesse, dove guardano la luce (in alto a sinistra)
Hh = blur(np.maximum(U, pm), 5); gy, gx = np.gradient(Hh); luce = np.clip((-gx * 0.5 - gy * 0.85) * 20 - 0.3, 0, 1) ** 2 * np.clip((T - 0.3) / 0.3, 0, 1)
fin = fin + (1 - fin) * (luce * 0.7)[..., None]
alfa = np.clip(al + luce * 0.4 * U, 0, 1)
dentro = np.maximum(Sf, maximum_filter((al > 0.5).astype(np.float32) * (1 - Df), 3))  # le bucce stanno nello schizzo, non nelle colate
sch = alfa * np.clip(np.maximum(Sf, dentro * (Df < 0.5)), 0, 1)
col_a = alfa * Df * (1 - Sf)
Image.fromarray((np.clip(np.dstack([fin, sch]), 0, 1) * 255).astype(np.uint8), 'RGBA').save(os.path.join(OUT, 'schizzo.webp'), 'WEBP', quality=86, alpha_quality=90, method=5)
Image.fromarray((np.clip(np.dstack([fin, col_a]), 0, 1) * 255).astype(np.uint8), 'RGBA').save(os.path.join(OUT, 'colate.webp'), 'WEBP', quality=86, alpha_quality=90, method=5)

# l'acino che vola: quello viola, dipinto intero
rgb, m = acino(918, 487, 44, 3.2)
a_fin = dipingi(rgb, m, [(3.2, 3, 5, 0), (1.7, 1.7, 4, 0.05)], 0.5)
Image.fromarray((np.clip(np.dstack([a_fin, m]), 0, 1) * 255).astype(np.uint8), 'RGBA').save(os.path.join(OUT, 'acino.webp'), 'WEBP', quality=86, alpha_quality=90, method=5)

# le colate nella pagina: ogni colonna mostra il suo pezzo di colate.webp e scende per conto suo (css/pagine.css .e4__colata)
pc = lambda v, t: f'{v / t * 100:.2f}%'
righe = []
for i, (x0, y0, x1, y1) in enumerate(colate):
    w_, h_ = (x1 - x0) / W, (y1 - y0) / H
    righe.append(f'<i class="e4__colata" style="--l:{pc(x0, W)};--t:{pc(y0, H)};--w:{w_ * 100:.2f}%;--h:{h_ * 100:.2f}%;--bx:{x0 / W / (1 - w_) * 100:.2f}%;--by:{y0 / H / (1 - h_) * 100:.2f}%;'
                 f'--sx:{100 / w_:.1f}%;--sy:{100 / h_:.1f}%;--d:{1.6 + (y1 - y0) / 260:.2f}s;--r0:{1.05 + rng.uniform(0, 0.5):.2f}s"></i>')
open(os.path.join(R0, 'sections', '404-colate.html'), 'w', encoding='utf-8').write('<!-- generato da tools/dipingi_404.py: le colate dello schizzo, una per colonna -->\n' + '\n'.join(righe) + '\n')
prova = Image.new('RGBA', (W, H), (243, 239, 234, 255))
for f in ['schizzo', 'colate']: prova.alpha_composite(Image.open(os.path.join(OUT, f + '.webp')))
prova.convert('RGB').resize((W // 2, H // 2)).save(os.path.join(R0, 'tools', '404-prova.jpg'), quality=84)
print('ok', {f: os.path.getsize(os.path.join(OUT, f + '.webp')) // 1024 for f in ['schizzo', 'colate', 'acino']}, 'KB')
