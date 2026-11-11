"""Dipinge le bottiglie per i quadri di moderna-f.html: stessi tocchi a setole di tools/dipingi.py, ma fini, così l'etichetta si legge. Le foto in assets/bottles non si toccano: si scrive una copia dipinta, senza il riflesso sotto il vetro.
uso: python -I tools/dipingi_bottiglie.py <cartella uscita> [nome ...]   senza nomi le fa tutte"""
import glob, math, os, random, sys
import numpy as np
from PIL import Image, ImageDraw
from scipy.ndimage import gaussian_filter as blur, sobel, maximum_filter

R0 = os.path.dirname(os.path.dirname(os.path.abspath(sys.argv[0])))
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
def fine_vetro(im):
    """dove finisce il vetro nella foto: al centro della bottiglia l'alfa è piena, il riflesso sotto è semitrasparente. Va riportato in FONDO (js/data.js)"""
    a = np.asarray(im, dtype=np.float32)[..., 3] / 255
    xs = np.where(a.max(0) > 0.5)[0]; m, l = (xs.min() + xs.max()) // 2, xs.max() - xs.min()
    return float(np.where(a[:, m - l // 6:m + l // 6].mean(1) > 0.85)[0].max() + 1) / im.height
ALTA = 1100
def dipingi(src, dst):
    im = Image.open(src).convert('RGBA'); fondo = fine_vetro(im); W = round(im.width * ALTA / im.height); H = ALTA
    arr = np.asarray(im.resize((W, H), Image.LANCZOS), dtype=np.float32) / 255
    a0 = arr[..., 3].copy(); a0[int(H * fondo) + 2:] = 0
    pes = blur(a0, 6) + 1e-3; rgb = arr[..., :3]; rif0 = np.where((a0 > 0.5)[..., None], rgb, np.stack([blur(rgb[..., i] * a0, 6) / pes for i in range(3)], -1))
    tela = Image.new('RGB', (W, H), (20, 16, 14)); dc = ImageDraw.Draw(tela); cop = Image.new('L', (W, H), 0); dk = ImageDraw.Draw(cop); ril = Image.new('L', (W, H), 90); dh = ImageDraw.Draw(ril)
    for R, st, lung, soglia in [(13, 10, 9, 0), (6.5, 5, 7, 0.05), (3.2, 3, 6, 0.06), (1.7, 2, 5, 0.07)]:
        rif = blur(rif0, (R * 0.5, R * 0.5, 0)); l = rif @ np.array([0.3, 0.59, 0.11], dtype=np.float32); sx, sy = sobel(l, 1) / 8, sobel(l, 0) / 8
        err = np.abs(np.asarray(tela, dtype=np.float32) / 255 - rif).sum(-1); punti = []
        for y in np.arange(st / 2, H, st):
            for x in np.arange(st / 2, W, st):
                xa, ya = int(x + random.uniform(-st, st) * 0.45), int(y + random.uniform(-st, st) * 0.45)
                if 0 <= xa < W and 0 <= ya < H and a0[ya, xa] > 0.5 and err[ya, xa] >= soglia: punti.append((xa, ya))
        random.shuffle(punti)
        for xa, ya in punti:
            col = rif[ya, xa]; pts = [(xa, ya)]; px, py = float(xa), float(ya); d0x, d0y = 0, 0
            for i in range(lung):
                gx, gy = sx[int(py), int(px)], sy[int(py), int(px)]; g = math.hypot(gx, gy)
                dx, dy = (-gy / g, gx / g) if g > 0.012 else (0.0, 1.0)  # dove il vetro è liscio, tocchi lungo la bottiglia
                if dx * d0x + dy * d0y < 0: dx, dy = -dx, -dy
                if i: dx, dy = 0.45 * dx + 0.55 * d0x, 0.45 * dy + 0.55 * d0y
                n = math.hypot(dx, dy) or 1; dx, dy = dx / n, dy / n; px += dx * R; py += dy * R
                if not (0 <= px < W - 1 and 0 <= py < H - 1) or a0[int(py), int(px)] < 0.3: break
                if i >= 2 and np.abs(rif[int(py), int(px)] - col).sum() > 0.2: break
                pts.append((px, py)); d0x, d0y = dx, dy
            if len(pts) < 2: pts.append((xa, ya + R))
            n_s = 3 if R < 4 else 5; w_s = max(1, int(2.3 * R / n_s)); base = np.clip(col + np.random.normal(0, 0.018, 3), 0, 1); alt = random.uniform(120, 215)
            for s in range(n_s):
                o = (s / (n_s - 1) - 0.5) * 2 * R; q = []
                for j, (a, b) in enumerate(pts):
                    c, d = pts[min(len(pts) - 1, j + 1)]; e, f = pts[max(0, j - 1)]; nx, ny = -(d - f), c - e; ll = math.hypot(nx, ny) or 1; q.append((a + nx / ll * o, b + ny / ll * o))
                cc = tuple(int(max(0, min(1, v)) * 255) for v in base * random.uniform(0.96, 1.04))
                dc.line(q, fill=cc, width=w_s, joint='curve'); dk.line(q, fill=255, width=w_s, joint='curve'); dh.line(q, fill=int(alt + random.uniform(-30, 30)), width=w_s, joint='curve')
    Hm = blur(np.asarray(ril, dtype=np.float32) / 255, 0.9); dX, dY = np.gradient(Hm, axis=1), np.gradient(Hm, axis=0); luce = (-dX * 0.7 - dY * 0.7) * 2.4
    col = np.asarray(tela, dtype=np.float32) / 255; col = col * (1 + np.clip(luce, -0.38, 0.38))[..., None]
    copre = blur(np.asarray(cop, dtype=np.float32) / 255, 0.7)[..., None]
    fin = col * 0.66 + rif0 * 0.34  # un terzo della foto: l'etichetta resta leggibile
    fin = fin * copre + rif0 * (1 - copre)  # dove non è arrivato un tocco, la foto
    l0 = rif0 @ np.array([0.3, 0.59, 0.11], dtype=np.float32)
    fine = blur(np.abs(l0 - blur(l0, 2.2)), 5)  # quanto dettaglio fine c'è in ogni punto
    scritte = np.clip((blur(np.clip((fine - 0.012) / 0.02, 0, 1), 3) - 0.08) / 0.3, 0, 1)[..., None] * 0.94
    fin = fin * (1 - scritte) + rif0 * scritte  # si deve leggere: su scritte e disegni dell'etichetta resta la foto
    al = np.minimum(copre[..., 0], blur(maximum_filter(a0, 5), 1.2))
    z = np.clip((np.arange(H, dtype=np.float32) / H - (fondo - 0.07)) / 0.04, 0, 1)[:, None]  # il piede ha il contorno vero del vetro: i tocchi lo sfrangiavano
    al = al * (1 - z) + blur(a0, 0.6) * z
    Image.fromarray((np.clip(np.dstack([fin, al]), 0, 1) * 255).astype(np.uint8), 'RGBA').save(dst, 'WEBP', quality=84, alpha_quality=90, method=5)
    return os.path.getsize(dst) // 1024

scelte = sys.argv[2:]
for f in sorted(glob.glob(os.path.join(R0, 'assets', 'bottles', '*.webp'))):
    nome = os.path.splitext(os.path.basename(f))[0]
    if scelte and nome not in scelte: continue
    random.seed(nome); np.random.seed(sum(map(ord, nome)))
    print(nome, dipingi(f, os.path.join(OUT, nome + '.webp')), 'KB', flush=True)
