"""I luoghi del Salento dipinti per la pagina azienda (6 nov 2026, prova "dal quadro alla foto"): la foto vera ridipinta coi tocchi a setole di tools/dipingi_ramo.py,
coi colori della foto (niente tavolozza come in tools/dipingi.py): nella pagina il quadro arriva a pennellate e poi lascia il posto alla foto da cui è dipinto.
uso: python -I tools/dipingi_luogo.py <nome> [<nome> ...]   legge assets/photo/<nome>.webp, scrive assets/quadri/luoghi/<nome>.webp (1400 px di larghezza)"""
import math, os, random, sys
import numpy as np
from PIL import Image, ImageDraw
from scipy.ndimage import gaussian_filter as blur, sobel

R0 = os.path.dirname(os.path.dirname(os.path.abspath(sys.argv[0])))
OUT = os.path.join(R0, 'assets', 'quadri', 'luoghi'); os.makedirs(OUT, exist_ok=True)

def dipingi(nome):
    random.seed(nome); np.random.seed(sum(map(ord, nome)))
    im = Image.open(os.path.join(R0, 'assets', 'photo', nome + '.webp')).convert('RGB')
    W = 1400; H = round(im.height * W / im.width)
    rif0 = np.asarray(im.resize((W, H), Image.LANCZOS), dtype=np.float32) / 255
    tela = Image.fromarray((blur(rif0, (12, 12, 0)) * 255).astype(np.uint8)); dc = ImageDraw.Draw(tela)
    ril = Image.new('L', (W, H), 90); dh = ImageDraw.Draw(ril)
    for R, st, lung, soglia in [(14, 11, 9, 0), (7, 6, 8, 0.06), (3.6, 3.4, 6, 0.08)]:
        rif = blur(rif0, (R * 0.5, R * 0.5, 0)); l = rif @ np.array([0.3, 0.59, 0.11], dtype=np.float32); sx, sy = sobel(l, 1) / 8, sobel(l, 0) / 8
        err = np.abs(np.asarray(tela, dtype=np.float32) / 255 - rif).sum(-1); punti = []
        for y in np.arange(st / 2, H, st):
            for x in np.arange(st / 2, W, st):
                xa, ya = int(x + random.uniform(-st, st) * 0.45), int(y + random.uniform(-st, st) * 0.45)
                if 0 <= xa < W and 0 <= ya < H and err[ya, xa] >= soglia: punti.append((xa, ya))
        random.shuffle(punti)
        for xa, ya in punti:
            col = rif[ya, xa]; pts = [(xa, ya)]; px, py = float(xa), float(ya); d0x, d0y = 0, 0
            for i in range(lung):
                gx, gy = sx[int(py), int(px)], sy[int(py), int(px)]; gg = math.hypot(gx, gy)
                dx, dy = (-gy / gg, gx / gg) if gg > 0.012 else (1.0, 0.15)  # dove è liscio (cielo, mare), tocchi quasi orizzontali
                if dx * d0x + dy * d0y < 0: dx, dy = -dx, -dy
                if i: dx, dy = 0.45 * dx + 0.55 * d0x, 0.45 * dy + 0.55 * d0y
                n = math.hypot(dx, dy) or 1; dx, dy = dx / n, dy / n; px += dx * R; py += dy * R
                if not (0 <= px < W - 1 and 0 <= py < H - 1): break
                if i >= 2 and np.abs(rif[int(py), int(px)] - col).sum() > 0.2: break
                pts.append((px, py)); d0x, d0y = dx, dy
            if len(pts) < 2: pts.append((xa + R, ya))
            n_s = 3 if R < 4 else 5; w_s = max(1, int(2.3 * R / n_s)); base = np.clip(col + np.random.normal(0, 0.022, 3), 0, 1); alt = random.uniform(120, 215)
            for s_ in range(n_s):
                o = (s_ / (n_s - 1) - 0.5) * 2 * R; q = []
                for j, (pa, pb) in enumerate(pts):
                    c, dd = pts[min(len(pts) - 1, j + 1)]; e, f = pts[max(0, j - 1)]; nx, ny = -(dd - f), c - e; ll = math.hypot(nx, ny) or 1; q.append((pa + nx / ll * o, pb + ny / ll * o))
                cc = tuple(int(max(0, min(1, v)) * 255) for v in base * random.uniform(0.95, 1.05))
                dc.line(q, fill=cc, width=w_s, joint='curve'); dh.line(q, fill=int(alt + random.uniform(-30, 30)), width=w_s, joint='curve')
    Hm = blur(np.asarray(ril, dtype=np.float32) / 255, 0.9); dX, dY = np.gradient(Hm, axis=1), np.gradient(Hm, axis=0); luce = (-dX * 0.7 - dY * 0.7) * 2.4
    col = np.asarray(tela, dtype=np.float32) / 255; col = col * (1 + np.clip(luce, -0.38, 0.38))[..., None]
    dst = os.path.join(OUT, nome + '.webp')
    Image.fromarray((np.clip(col * 0.9 + rif0 * 0.1, 0, 1) * 255).astype(np.uint8)).save(dst, 'WEBP', quality=84, method=5)
    return os.path.getsize(dst) // 1024

for nome in sys.argv[1:]:
    print(nome, dipingi(nome), 'KB', flush=True)
