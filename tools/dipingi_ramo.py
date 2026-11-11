"""Il ramo di vite dipinto per l'apertura della pagina azienda (6 nov 2026, "un ramo di vigna dipinto"): dalla foto vera assets/photo/alberello.webp
(il tronco ad alberello col grappolo, sul cielo) si toglie il cielo per colore e, con due contorni fatti a mano, la vite sfocata a sinistra e il terreno sotto il tronco;
poi si ridipinge con i tocchi a setole di tools/dipingi_bottiglie.py (qui più dipinto e meno foto: non c'è un'etichetta da leggere).
Dopo "l'uva si può rendere più visibile, alcune parti non così tagliate, e le foglie si muovono": l'uva è dipinta più fine e tiene più foto; i contorni a mano sfumano larghi
(il ramo si perde nella notte invece di essere tagliato); in più la mappa del vento (assets/quadri/ramo-mappa.webp, chiara dove sono foglie e uva) per il vento di js/pagine.js,
la stessa formula delle chiome nei quadri di H (js/moderna-f.js FS_QUADRO).
uso: python -I tools/dipingi_ramo.py   scrive assets/quadri/ramo.webp (con trasparenza), ramo-mappa.webp e una prova sul blu notte in tools/ramo-prova.jpg"""
import math, os, random, sys
import numpy as np
from PIL import Image, ImageDraw
from scipy.ndimage import gaussian_filter as blur, sobel, maximum_filter

R0 = os.path.dirname(os.path.dirname(os.path.abspath(sys.argv[0])))
SRC, DST = os.path.join(R0, 'assets', 'photo', 'alberello.webp'), os.path.join(R0, 'assets', 'quadri', 'ramo.webp')
random.seed('ramo'); np.random.seed(7)

# ---- lo scontorno, sulla foto intera (1920x1280)
im = Image.open(SRC).convert('RGB'); W0, H0 = im.size
a = np.asarray(im, dtype=np.float32)
r, g, b = a[..., 0], a[..., 1], a[..., 2]
cielo = np.clip((b - r - 10) / 22, 0, 1) * (b > g - 12)  # il cielo è più blu che rosso; foglie, uva e tronco no
fuori = Image.new('L', (W0, H0), 0); d = ImageDraw.Draw(fuori)
# la vite sfocata a sinistra, sopra il tronco (il ricciolo resta)
d.polygon([(0, 0), (750, 0), (750, 620), (620, 690), (520, 700), (410, 720), (400, 890), (300, 915), (200, 945), (0, 1000)], fill=255)
# il terreno e il fogliame scuro sotto il tronco e sotto il ramo, l'orizzonte a destra
d.polygon([(0, 1165), (100, 1130), (200, 1095), (300, 1065), (400, 1030), (500, 1005), (600, 985), (700, 955), (800, 900), (900, 830), (1000, 760), (1080, 720),
           (1160, 700), (1170, 900), (1460, 930), (1560, 860), (1920, 820), (1920, 1280), (0, 1280)], fill=255)  # sotto le foglie gialle; a destra anche la foschia dell'orizzonte
fuori = blur(np.asarray(fuori, dtype=np.float32) / 255, 26)  # largo: il ramo si perde nella notte, non è tagliato
alfa = np.clip(1 - cielo, 0, 1) * np.clip((1 - fuori) * 1.25, 0, 1)
alfa = blur(alfa, 1.2)

# l'uva: il grappolo grande fra le foglie (coordinate della foto intera)
uva = Image.new('L', (W0, H0), 0); ImageDraw.Draw(uva).ellipse((1160, 270, 1450, 600), fill=255)
uva = blur(np.asarray(uva, dtype=np.float32) / 255, 30)
# la mappa del vento: foglie e uva (verdi e gialle) si muovono, il tronco (bruno) no
foglie = np.clip((g - r * 0.82) / 38, 0, 1) * alfa
foglie = np.maximum(foglie, uva * alfa * 0.6)  # l'uva pesa: si muove meno delle foglie

# ---- la pittura, a 1200 px di larghezza
S = 1200 / W0; W, H = 1200, round(H0 * S)
rgb0 = np.asarray(im.resize((W, H), Image.LANCZOS), dtype=np.float32) / 255
a0 = np.asarray(Image.fromarray((alfa * 255).astype(np.uint8)).resize((W, H), Image.LANCZOS), dtype=np.float32) / 255
uvaS = np.asarray(Image.fromarray((uva * 255).astype(np.uint8)).resize((W, H), Image.LANCZOS), dtype=np.float32) / 255
pes = blur(a0, 6) + 1e-3
rif0 = np.where((a0 > 0.5)[..., None], rgb0, np.stack([blur(rgb0[..., i] * a0, 6) / pes for i in range(3)], -1))  # fuori dal ramo il colore del ramo, non il cielo
tela = Image.new('RGB', (W, H), (20, 26, 48)); dc = ImageDraw.Draw(tela); cop = Image.new('L', (W, H), 0); dk = ImageDraw.Draw(cop); ril = Image.new('L', (W, H), 90); dh = ImageDraw.Draw(ril)
for R, st, lung, soglia in [(11, 9, 9, 0), (5.5, 4.5, 7, 0.05), (2.8, 2.6, 6, 0.06), (1.5, 1.6, 4, 0.05)]:
    rif = blur(rif0, (R * 0.5, R * 0.5, 0)); l = rif @ np.array([0.3, 0.59, 0.11], dtype=np.float32); sx, sy = sobel(l, 1) / 8, sobel(l, 0) / 8
    err = np.abs(np.asarray(tela, dtype=np.float32) / 255 - rif).sum(-1); punti = []
    for y in np.arange(st / 2, H, st):
        for x in np.arange(st / 2, W, st):
            xa, ya = int(x + random.uniform(-st, st) * 0.45), int(y + random.uniform(-st, st) * 0.45)
            if 0 <= xa < W and 0 <= ya < H and a0[ya, xa] > 0.45 and err[ya, xa] >= soglia and (R > 2 or uvaS[ya, xa] > 0.3): punti.append((xa, ya))  # l'ultima passata, finissima, solo sull'uva
    random.shuffle(punti)
    for xa, ya in punti:
        col = rif[ya, xa]; pts = [(xa, ya)]; px, py = float(xa), float(ya); d0x, d0y = 0, 0
        for i in range(lung):
            gx, gy = sx[int(py), int(px)], sy[int(py), int(px)]; gg = math.hypot(gx, gy)
            dx, dy = (-gy / gg, gx / gg) if gg > 0.012 else (1.0, -0.6)  # dove è liscio, tocchi lungo il ramo (sale verso destra)
            if dx * d0x + dy * d0y < 0: dx, dy = -dx, -dy
            if i: dx, dy = 0.45 * dx + 0.55 * d0x, 0.45 * dy + 0.55 * d0y
            n = math.hypot(dx, dy) or 1; dx, dy = dx / n, dy / n; px += dx * R; py += dy * R
            if not (0 <= px < W - 1 and 0 <= py < H - 1) or a0[int(py), int(px)] < 0.3: break
            if i >= 2 and np.abs(rif[int(py), int(px)] - col).sum() > 0.22: break
            pts.append((px, py)); d0x, d0y = dx, dy
        if len(pts) < 2: pts.append((xa + R, ya - R * 0.6))
        n_s = 3 if R < 4 else 5; w_s = max(1, int(2.3 * R / n_s)); base = np.clip(col + np.random.normal(0, 0.02, 3), 0, 1); alt = random.uniform(120, 215)
        for s_ in range(n_s):
            o = (s_ / (n_s - 1) - 0.5) * 2 * R; q = []
            for j, (pa, pb) in enumerate(pts):
                c, dd = pts[min(len(pts) - 1, j + 1)]; e, f = pts[max(0, j - 1)]; nx, ny = -(dd - f), c - e; ll = math.hypot(nx, ny) or 1; q.append((pa + nx / ll * o, pb + ny / ll * o))
            cc = tuple(int(max(0, min(1, v)) * 255) for v in base * random.uniform(0.95, 1.05))
            dc.line(q, fill=cc, width=w_s, joint='curve'); dk.line(q, fill=255, width=w_s, joint='curve'); dh.line(q, fill=int(alt + random.uniform(-30, 30)), width=w_s, joint='curve')
    print('passata', R, len(punti), flush=True)
Hm = blur(np.asarray(ril, dtype=np.float32) / 255, 0.9); dX, dY = np.gradient(Hm, axis=1), np.gradient(Hm, axis=0); luce = (-dX * 0.7 - dY * 0.7) * 2.4
col = np.asarray(tela, dtype=np.float32) / 255; col = col * (1 + np.clip(luce, -0.38, 0.38))[..., None]
copre = blur(np.asarray(cop, dtype=np.float32) / 255, 0.7)[..., None]
fp = 0.14 + 0.36 * uvaS[..., None]  # dipinto: della foto resta poco, un po' di più sull'uva perché gli acini si vedano
fin = col * (1 - fp) + rif0 * fp
fin = fin * copre + rif0 * (1 - copre)
al = np.minimum(copre[..., 0], blur(maximum_filter(a0, 5), 1.2))
Image.fromarray((np.clip(np.dstack([fin, al]), 0, 1) * 255).astype(np.uint8), 'RGBA').save(DST, 'WEBP', quality=86, alpha_quality=90, method=5)
mp = blur(np.asarray(Image.fromarray((foglie * 255).astype(np.uint8)).resize((W, H), Image.LANCZOS), dtype=np.float32) / 255, 6)  # morbida: niente strappi fra foglia e ramo
Image.fromarray((np.clip(mp, 0, 1) * 255).astype(np.uint8), 'L').save(DST.replace('ramo.webp', 'ramo-mappa.webp'), 'WEBP', quality=80)
prova = Image.new('RGBA', (W, H), (21, 28, 52, 255)); prova.alpha_composite(Image.open(DST)); prova.convert('RGB').save(os.path.join(R0, 'tools', 'ramo-prova.jpg'), quality=82)
print('ok', DST, os.path.getsize(DST) // 1024, 'KB')
