"""Dall'11 nov 2026 i quadri delle sale sono ridipinti così (quelli di prima, il loro strumento e il loro js stanno in _archivio-prove/moderna-h-quadri-prima/): il tocco è piccolo in fondo e grande davanti (LONT), ogni pittore ha pochi colori suoi (tavolozza), le bottiglie si dipingono insieme al luogo e poi si rifiniscono dentro (il contorno è del quadro), qualcosa del luogo passa davanti al piede (davanti), pose diverse da sala a sala, via le due persone dalla sala Terra. Il feudo d'ingresso resta quello di prima (due prove di ridipingerlo non erano meglio).
Nato come prova a parte (prova-soggetto.html): la bottiglia è il soggetto del quadro la bottiglia è il soggetto del quadro e ogni scena ha il suo stile di pittura, bottiglia compresa, tutti classici: nel modo di Van Gogh, di Courbet (spatola), di Monet, puntinismo, nel modo di Turner. Solo le scritte delle etichette restano quelle della foto: si devono leggere. Le foto non si toccano.
uso: python -I tools/dipingi_soggetto.py [scene]   scrive assets/quadri/soggetto/<scena>.webp (largo) e <scena>-m.webp (telefono, composizione verticale sua). Con --mappe scrive solo <scena>-mappa.webp e <scena>-m-mappa.webp: cosa si muove in moderna-h (rosso cielo, verde chiome e fiori, blu acqua), mai le bottiglie. Le posizioni delle bottiglie vanno riportate in js/moderna-f.js (SALE_H). Con --notte: i pezzi dipinti delle altre sezioni: i fondi blu e crema (assets/quadri/notte*.webp, crema*.webp), le macchie dietro le bottiglie (assets/quadri/macchie/), i bordi a setole (assets/quadri/bordo*.webp)"""
import math, os, random, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy.ndimage import gaussian_filter as blur, sobel

OUT = 'assets/quadri/soggetto/'
os.makedirs(OUT, exist_ok=True)
LUM = np.array([0.3, 0.59, 0.11], dtype=np.float32)


def u8(a):
    return (np.clip(a, 0, 1) * 255 + 0.5).astype(np.uint8)


def satura(a, s):
    l = (a @ LUM)[..., None]
    return np.clip(l + (a - l) * s, 0, 1)


def verso(a, s):
    """la direzione delle forme in ogni punto, e quanto sono nette"""
    l = blur(a @ LUM, s); gx, gy = sobel(l, 1), sobel(l, 0)
    xx, yy, xy = blur(gx * gx, s * 3), blur(gy * gy, s * 3), blur(gx * gy, s * 3)
    return 0.5 * np.arctan2(2 * xy, xx - yy) + np.pi / 2, np.sqrt(xx + yy)


CREMA = np.array([0.953, 0.937, 0.918], dtype=np.float32)  # --cream del sito: la tela che si vede fra i tocchi
LONT = None  # la misura del tocco in ogni punto del luogo (1 = normale): piccolo in fondo, grande davanti. None per le bottiglie
BOTT = None  # dove stanno le bottiglie nel luogo: lì non è mai cielo


def lontananza(H, W, o, lo=0.5, hi=1.45):
    y = np.linspace(0, 1, H, dtype=np.float32)[:, None] * np.ones((1, W), np.float32)
    if o <= 0.03: return lo + 0.1 + (hi - lo - 0.1) * y  # senza orizzonte: tutto terra, dal fondo a qui
    return np.where(y < o, 0.85 + 0.55 * (o - y) / o, lo + (hi - lo) * (y - o) / (1 - o)).astype(np.float32)


def punti(H, W, passo, scarto=0.45):
    """dove cadono i tocchi e quanto è grande ognuno: dove sono piccoli ce ne vogliono di più"""
    if LONT is None: p = griglia(H, W, passo, scarto); return zip(p, np.ones(len(p), np.float32))
    lo = float(LONT.min()); p = griglia(H, W, passo * lo, scarto); m = LONT[p[:, 0], p[:, 1]]
    tieni = np.random.random(len(p)) < (lo / m) ** 2
    return zip(p[tieni], m[tieni])


def tavolozza(s, colori, forza, dolce=0.035):
    """pochi colori, quelli del pittore: ogni colore della foto va verso i più vicini della tavolozza"""
    num = np.zeros_like(s); den = np.zeros(s.shape[:2], np.float32)
    for c in np.array(colori, dtype=np.float32):
        w = np.exp(-((s - c) ** 2).sum(-1) / dolce); num += w[..., None] * c; den += w
    return s * (1 - forza) + num / (den[..., None] + 1e-6) * forza


# terre e pigmenti dei cinque pittori, a occhio dai loro quadri: niente ciano e blu elettrico da schermo
VANGOGH = [(0.17, 0.33, 0.62), (0.1, 0.16, 0.4), (0.38, 0.64, 0.62), (0.62, 0.76, 0.78), (0.93, 0.76, 0.2), (0.8, 0.6, 0.22), (0.86, 0.47, 0.15), (0.17, 0.44, 0.3), (0.46, 0.53, 0.2), (0.95, 0.92, 0.72), (0.07, 0.11, 0.22), (0.6, 0.22, 0.16)]
COURBET = [(0.1, 0.08, 0.06), (0.28, 0.19, 0.12), (0.62, 0.44, 0.24), (0.78, 0.64, 0.38), (0.14, 0.22, 0.12), (0.36, 0.4, 0.18), (0.56, 0.6, 0.3), (0.55, 0.62, 0.68), (0.9, 0.86, 0.76), (0.55, 0.27, 0.16)]
MONET = [(0.42, 0.36, 0.6), (0.62, 0.66, 0.86), (0.5, 0.68, 0.42), (0.22, 0.42, 0.36), (0.95, 0.84, 0.4), (0.88, 0.24, 0.16), (0.94, 0.66, 0.62), (0.8, 0.86, 0.92), (0.96, 0.93, 0.82), (0.72, 0.78, 0.36)]
SIGNAC = [(0.2, 0.28, 0.68), (0.32, 0.56, 0.8), (0.38, 0.7, 0.72), (0.52, 0.4, 0.7), (0.95, 0.6, 0.24), (0.98, 0.86, 0.4), (0.95, 0.66, 0.68), (0.38, 0.64, 0.4), (0.82, 0.28, 0.24), (0.97, 0.95, 0.86), (0.16, 0.15, 0.4), (0.86, 0.74, 0.5)]


def griglia(H, W, passo, scarto=0.45):
    ys, xs = np.mgrid[passo / 2:H:passo, passo / 2:W:passo]
    pts = np.stack([ys.ravel(), xs.ravel()], 1) + np.random.uniform(-scarto, scarto, (ys.size, 2)) * passo
    pts = np.clip(pts, 0, [H - 1, W - 1]).astype(int)
    np.random.shuffle(pts)
    return pts


def impasto(col, alt, forza, sc):
    A = blur(np.asarray(alt, dtype=np.float32) / 255, 0.8 * sc)
    luce = np.clip((-np.gradient(A, axis=1) - np.gradient(A, axis=0)) * 0.7 * forza * sc, -0.4, 0.4)
    return col * (1 + luce)[..., None]


def ingrandisci(a, W, H):
    return np.asarray(Image.fromarray(u8(a)).resize((W, H), Image.LANCZOS), dtype=np.float32) / 255


def puntinismo(a, k, cielo=None):
    """nel modo di Signac: tessere di colore puro in file ordinate che seguono le forme, la tela chiara fra una e l'altra: i colori si mescolano nell'occhio"""
    H, W = a.shape[:2]
    s = tavolozza(satura(a, 1.45), SIGNAC, 0.4)
    blu = a[..., 2] > a[..., 0] + 0.04
    th, forza = verso(a, 6 * k)
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    th = np.where(forza < 0.03, 0.1 * np.sin(xx / (300 * k) + yy / (170 * k)), th)  # cielo e mare fermi: file orizzontali appena mosse
    b0 = blur(s, (10 * k, 10 * k, 0)); chiaro = np.clip((b0 @ LUM - 0.25) / 0.4, 0, 1)[..., None] * 0.3
    tela = Image.fromarray(u8(b0 * (1 - chiaro) + CREMA * chiaro)); dc = ImageDraw.Draw(tela)
    l = a @ LUM; det = blur(np.abs(l - blur(l, 4 * k)), 8 * k)
    VICINI = [np.array(c, dtype=np.float32) for c in ((0.5, 0.45, 0.88), (0.4, 0.76, 0.8), (0.72, 0.68, 0.94), (0.96, 0.8, 0.74))]
    for passo, r, soglia in ((15, 8.3, -1), (8, 4.5, 0.012)):
        rif = blur(s, (r * k * 0.35, r * k * 0.35, 0))
        for (y, x), m in punti(H, W, passo * k, 0.3):
            if det[y, x] < soglia: continue
            c = rif[y, x]; u = random.random(); l1 = float(c @ LUM)
            if u < 0.13 and l1 > 0.22:
                if blu[y, x]: c = c * 0.6 + random.choice(VICINI[:3] if l1 < 0.5 else VICINI) * 0.4  # cielo e mare: blu, turchesi, viola e un rosa chiaro
                else: c = np.clip(l1 + (l1 - c) * 0.7, 0, 1)  # il colore opposto con la stessa luce
            elif u < 0.45: c = c + np.random.normal(0, 0.025 + 0.06 * l1, 3)  # sullo scuro poco: sul vetro nero sembrava rumore
            else: c = c * random.uniform(0.94, 1.08)
            t = th[y, x] + random.uniform(-0.12, 0.12); ca, sa = math.cos(t), math.sin(t)
            ln, la = r * k * m * random.uniform(1.05, 1.4), r * k * m * random.uniform(0.7, 0.9)
            dc.polygon([(x - ca * ln - sa * la, y - sa * ln + ca * la), (x + ca * ln - sa * la, y + sa * ln + ca * la), (x + ca * ln + sa * la, y + sa * ln - ca * la), (x - ca * ln + sa * la, y - sa * ln - ca * la)], fill=tuple(u8(c).tolist()))
    return blur(np.asarray(tela, dtype=np.float32) / 255, (0.45 * k, 0.45 * k, 0))


def vangogh(a, k, cielo=None):
    """tocchi lunghi e pieni che seguono le forme, il cielo a vortici, i contorni scuri, tanto colore in rilievo"""
    H, W = a.shape[:2]
    s = tavolozza(np.clip((satura(a, 1.3) - 0.5) * 1.12 + 0.5, 0, 1), VANGOGH, 0.5)
    th, forza = verso(a, 6 * k)
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    th = np.where(forza < 0.02, 0.25 * np.sin(xx / (240 * k) + yy / (150 * k)) + 0.1, th)
    sky = np.zeros((H, W), bool)
    if cielo:
        sky = ((a[..., 2] > a[..., 0] + 0.2) | ((a[..., 2] > a[..., 0] + 0.05) & (a @ LUM > 0.62))) & (yy < cielo * H)
        if BOTT is not None: sky &= ~BOTT
        v = np.clip(yy / (cielo * H), 0, 1)[..., None]; cob = np.array([0.2, 0.36, 0.66], dtype=np.float32) * (1 - v) + np.array([0.6, 0.72, 0.76], dtype=np.float32) * v
        s = np.where(sky[..., None], s * 0.42 + cob * 0.58, s)
        vx, vy = np.ones_like(xx), np.full_like(xx, 0.12)
        for cx, cy, f in ((0.2, 0.2, 1), (0.55, 0.1, 1.3), (0.84, 0.28, 0.9)):
            dx, dy = xx - cx * W, yy - cy * H; d = np.hypot(dx, dy) + 1; g = f * np.exp(-d / (0.2 * max(W, H))) * 2.4
            vx += -dy / d * g; vy += dx / d * g
        th = np.where(sky, np.arctan2(vy, vx), th)
    tela = Image.fromarray(u8(blur(s, (12 * k, 12 * k, 0)) * 0.65 + np.array([0.78, 0.66, 0.42], dtype=np.float32) * 0.35)); dc = ImageDraw.Draw(tela)  # sotto, un fondo ocra: fra i tocchi non resta il blu scuro
    ril = Image.new('L', (W, H), 70); dh = ImageDraw.Draw(ril)
    def tocco(x, y, R, lung, c, alto):
        pts = [(x, y)]; px, py, d0x, d0y = float(x), float(y), 0.0, 0.0
        for i in range(lung):
            t = th[int(py), int(px)]; dx, dy = math.cos(t), math.sin(t)
            if dx * d0x + dy * d0y < 0: dx, dy = -dx, -dy
            px += dx * R * 0.95; py += dy * R * 0.95
            if not (0 <= px < W - 1 and 0 <= py < H - 1): break
            pts.append((px, py)); d0x, d0y = dx, dy
        if len(pts) < 2: return
        n = max(2, int(R / (2.2 * k))); w = max(1, int(2.3 * R / n))
        for j in range(n):
            o = (j / (n - 1) - 0.5) * 2 * R; q = []
            for m, (a0, b0) in enumerate(pts):
                c1, d1 = pts[min(len(pts) - 1, m + 1)]; e1, f1 = pts[max(0, m - 1)]; nx, ny = -(d1 - f1), c1 - e1; ll = math.hypot(nx, ny) or 1
                q.append((a0 + nx / ll * o, b0 + ny / ll * o))
            dc.line(q, fill=tuple(u8(c * random.uniform(0.86, 1.14)).tolist()), width=w, joint='curve')
            dh.line(q, fill=int(alto + random.uniform(-45, 45)), width=w, joint='curve')
    for R, passo, lung in ((24, 22, 11), (13, 12, 10), (7.5, 7.5, 8)):
        rif = blur(s, (R * k * 0.32, R * k * 0.32, 0))
        for (y, x), m in punti(H, W, passo * k):
            c = rif[y, x]; u = random.random()
            if sky[y, x] and u < 0.14: c = c * 0.55 + np.array([0.98, 0.9, 0.55], dtype=np.float32) * 0.45  # gialli e bianchi fra i blu
            elif u < 0.1: c = c * 0.78 + (1 - c) * 0.22
            tocco(x, y, R * k * m, lung, c, random.uniform(120, 230))
    gr = np.hypot(sobel(blur(a @ LUM, 2.5 * k), 1), sobel(blur(a @ LUM, 2.5 * k), 0)); forte = max(0.3, float(np.quantile(gr[~sky], 0.95)))
    for (y, x), m in punti(H, W, 8 * k):  # i contorni: solo sui bordi veri, a tratti lunghi che fanno una linea (prima erano trattini sparsi)
        if gr[y, x] > forte and not sky[y, x]: tocco(x, y, 3.2 * k * m, 9, np.array([0.07, 0.11, 0.24], dtype=np.float32), 235)
    return impasto(np.asarray(tela, dtype=np.float32) / 255, ril, 2.8, max(1, k * 1.6))


def impressionismo(a, k, cielo=None, viola=1):
    """tocchi brevi e morbidi, tanta luce, niente contorni, le ombre sono viola e non nere"""
    H, W = a.shape[:2]
    l = a @ LUM
    s = np.clip(a ** (1 - 0.24 * viola) + ((1 - l) ** 2)[..., None] * np.array([0.1, 0.05, 0.25], dtype=np.float32) * viola, 0, 1)
    s = satura(s, 1 + 0.4 * viola)
    if viola >= 0.5: s = tavolozza(s, MONET, 0.4 * viola)
    th, forza = verso(a, 6 * k)
    l0 = a @ LUM; det = blur(np.abs(l0 - blur(l0, 4 * k)), 6 * k)
    tela = Image.fromarray(u8(blur(s, (14 * k, 14 * k, 0)))); dc = ImageDraw.Draw(tela)
    ril = Image.new('L', (W, H), 90); dh = ImageDraw.Draw(ril)
    SPEZZA = [np.array(c, dtype=np.float32) for c in ((0.98, 0.86, 0.55), (0.6, 0.62, 0.95), (0.97, 0.66, 0.6), (0.55, 0.82, 0.65))]
    for R, passo, soglia in ((27, 24, -1), (15, 12.5, -1), (8.5, 7.5, -1), (4.6, 4.4, 0.02)):  # l'ultimo giro, fine, solo dove c'è qualcosa da dire: finestre, merli, fiori
        rif = blur(s, (R * k * 0.34, R * k * 0.34, 0))
        for (y, x), m in punti(H, W, passo * k):
            if det[y, x] < soglia: continue
            c = rif[y, x] + np.random.normal(0, 0.012 + 0.03 * float(rif[y, x] @ LUM), 3) * (0.45 if cielo and y < cielo * H else 1)
            su = bool(cielo) and y < cielo * H
            if random.random() < 0.16 and soglia < 0 and not su and float(rif[y, x] @ LUM) > 0.26: c = c * 0.74 + random.choice(SPEZZA) * 0.26
            r = R * k * m * random.uniform(0.75, 1.1); ln = r * random.uniform(1.2, 2.2)
            t = random.uniform(-0.22, 0.22) if su else th[y, x] + random.uniform(-0.5, 0.5) if forza[y, x] > 0.02 else random.uniform(-0.8, 0.5)  # il cielo a tocchi distesi, il resto segue le forme
            dx, dy = math.cos(t) * ln, math.sin(t) * ln; bx, by = -dy * 0.25 * random.choice((-1, 1)), dx * 0.25
            q = [(x - dx, y - dy), (x + bx, y + by), (x + dx, y + dy)]
            w = max(1, int(r * 1.5))
            dc.line(q, fill=tuple(u8(c).tolist()), width=w, joint='curve')
            for ex, ey in (q[0], q[2]): dc.ellipse((ex - w / 2, ey - w / 2, ex + w / 2, ey + w / 2), fill=tuple(u8(c).tolist()))
            dh.line(q, fill=int(random.uniform(90, 190)), width=w, joint='curve')
    return impasto(blur(np.asarray(tela, dtype=np.float32) / 255, (0.45 * k, 0.45 * k, 0)), ril, 1.25, max(1, k * 1.6))


def spatola(a, k, cielo=None):
    """nel modo di Courbet: il colore steso a spatola, piani larghi e netti con il bordo in rilievo. Terre calde e ombre profonde"""
    H, W = a.shape[:2]
    l = (a @ LUM)[..., None]
    s = np.clip(satura(a, 1.05) * np.array([1.08, 0.97, 0.84], dtype=np.float32), 0, 1)
    s = tavolozza(np.clip((s * (0.46 + 0.86 * l) - 0.5) * 1.12 + 0.5, 0, 1), COURBET, 0.28)  # ombre profonde e calde, luci piene, terre
    th, _ = verso(a, 7 * k)
    tela = Image.fromarray(u8(blur(s, (16 * k, 16 * k, 0)))); dc = ImageDraw.Draw(tela)
    ril = Image.new('L', (W, H), 100); dh = ImageDraw.Draw(ril)
    lb = a @ LUM; det = blur(np.abs(lb - blur(lb, 5 * k)), 7 * k)
    for R, passo, soglia in ((40, 30, -1), (22, 16, -1), (11.5, 9, 0.014), (6, 5.2, 0.034)):
        rif = blur(s, (R * k * 0.34, R * k * 0.34, 0))
        for (y, x), m in punti(H, W, passo * k):
            if det[y, x] < soglia: continue
            c = rif[y, x] * random.uniform(0.92, 1.08)
            t = th[y, x] + random.uniform(-0.35, 0.35); r = R * k * m * random.uniform(0.7, 1.1); ln = r * random.uniform(1.6, 2.9)  # spatolate lunghe: corte e tutte uguali sembravano un mosaico
            ca, sa = math.cos(t), math.sin(t)
            q = [(x - ca * ln - sa * r, y - sa * ln + ca * r), (x + ca * ln - sa * r * 0.8, y + sa * ln + ca * r * 0.8), (x + ca * ln + sa * r * 0.8, y + sa * ln - ca * r * 0.8), (x - ca * ln + sa * r, y - sa * ln - ca * r)]
            dc.polygon(q, fill=tuple(u8(c).tolist()))
            alto = int(random.uniform(90, 220)); dh.polygon(q, fill=alto)
            for j in range(2):  # dove la lama raschia: due strisce appena diverse
                o = random.uniform(-0.8, 0.8) * r; w = max(1, int(r * random.uniform(0.15, 0.4)))
                dc.line([(x - ca * ln - sa * o, y - sa * ln + ca * o), (x + ca * ln - sa * o, y + sa * ln + ca * o)], fill=tuple(u8(c * random.uniform(0.86, 1.15)).tolist()), width=w)
    return impasto(blur(np.asarray(tela, dtype=np.float32) / 255, (0.55 * k, 0.55 * k, 0)), ril, 2.2, max(1, k * 1.6))


def turner(a, k, cielo=None):
    """nel modo di Turner: la luce del tramonto scioglie le forme lontane, velature dorate leggere; le forme vicine restano, più dense"""
    H, W = a.shape[:2]
    fino, xs = cielo
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    l = a @ LUM
    tappe = (0, 0.2, 0.42, 0.62, 0.82, 1), [(0.13, 0.08, 0.08), (0.36, 0.17, 0.1), (0.72, 0.36, 0.14), (0.95, 0.62, 0.25), (0.99, 0.82, 0.5), (1, 0.95, 0.78)]
    oro = np.stack([np.interp(l, tappe[0], [t[i] for t in tappe[1]]) for i in range(3)], -1).astype(np.float32)
    s = oro * 0.48 + satura(a, 1.25) * 0.52
    lontano = np.clip((fino * 1.3 * H - yy) / (fino * 0.6 * H), 0, 1)[..., None]  # dall'orizzonte in su le forme si sciolgono
    s = s * (1 - lontano) + blur(s, (26 * k, 26 * k, 0)) * lontano
    v = np.clip(yy / (fino * H), 0, 1) + 0.05 * np.sin(xx / (260 * k) + yy / (120 * k))  # il cielo: dal grigio azzurro in alto al rosa, all'arancio, all'oro sull'orizzonte
    tv = (0, 0.42, 0.74, 1), [(0.42, 0.5, 0.68), (0.84, 0.56, 0.56), (0.98, 0.6, 0.28), (1, 0.85, 0.48)]
    rampa = np.stack([np.interp(v, tv[0], [t[i] for t in tv[1]]) for i in range(3)], -1).astype(np.float32)
    s = s * (1 - lontano * 0.74) + rampa * lontano * 0.74
    d = np.hypot((xx - xs * W), (yy - fino * H) * 1.5)
    bagliore = np.exp(-d / (0.3 * max(W, H) * (1 if W > H else 0.8)))[..., None]
    s = 1 - (1 - s) * (1 - bagliore * np.array([0.95, 0.76, 0.42], dtype=np.float32) * 0.62)  # la luce bassa che mangia l'orizzonte
    tela = Image.fromarray(u8(blur(s, (8 * k, 8 * k, 0)))); dc = ImageDraw.Draw(tela, 'RGBA')
    ril = Image.new('L', (W, H), 90); dh = ImageDraw.Draw(ril)
    th, _ = verso(a, 7 * k)
    th = np.where(lontano[..., 0] > 0.4, 0.32 * np.sin(xx / (300 * k) + yy / (90 * k)) + 0.14 * np.sin(yy / (210 * k) - xx / (520 * k)) + 0.03, th)  # il cielo: velature che girano piano
    lb = l; det = blur(np.abs(lb - blur(lb, 5 * k)), 7 * k) * (1 - lontano[..., 0])
    for R, passo, alfa, soglia, lung in ((40, 30, 80, -1, 8), (22, 16, 110, -1, 7), (11, 9, 150, 0.008, 5), (5.5, 5, 190, 0.02, 4)):
        rif = blur(s, (R * k * 0.4, R * k * 0.4, 0))
        for (y, x), m in punti(H, W, passo * k):
            if det[y, x] < soglia: continue
            pts = percorso(th, x, y, R * k * m * 0.9, lung, 0.25)  # a setole: con le estremità dritte il cielo veniva a mattoni
            if len(pts) > 1: setole(dc, dh, pts, R * k * m * 0.9, k, rif[y, x], alfa, random.uniform(70, 170))
    return impasto(blur(np.asarray(tela, dtype=np.float32) / 255, (0.6 * k, 0.6 * k, 0)), ril, 1, max(1, k * 1.6))


def setole(dc, dh, pts, R, k, c, alfa, alto):
    """un tocco di pennello: un fascio di setole lungo il percorso, ognuna con la sua lunghezza e il suo colore, così non resta mai un bordo dritto"""
    n = max(3, int(R / (2.4 * k))); w = max(1, int(2.5 * R / n)); L = len(pts)
    for j in range(n):
        o = (j / (n - 1) - 0.5) * 2 * R; q = []
        ini, fin = random.randint(0, max(0, L // 4)), L - random.randint(0, max(0, L // 4))
        for m in range(ini, fin):
            a0, b0 = pts[m]; c1, d1 = pts[min(L - 1, m + 1)]; e1, f1 = pts[max(0, m - 1)]; nx, ny = -(d1 - f1), c1 - e1; ll = math.hypot(nx, ny) or 1
            q.append((a0 + nx / ll * o, b0 + ny / ll * o))
        if len(q) < 2: continue
        dc.line(q, fill=tuple(u8(c * random.uniform(0.9, 1.1)).tolist()) + (alfa,), width=w, joint='curve')
        dh.line(q, fill=int(alto + random.uniform(-30, 30)), width=w, joint='curve')


def percorso(th, x, y, passo, lung, scarto=0.0):
    H, W = th.shape; px, py = float(x), float(y); pts = [(px, py)]; d = random.uniform(-scarto, scarto)
    for i in range(lung):
        t = th[int(py), int(px)] + d; px += math.cos(t) * passo; py += math.sin(t) * passo
        if not (0 <= px < W - 1 and 0 <= py < H - 1): break
        pts.append((px, py))
    return pts


def fondo(W, H, nome, colore, tinta, va, terra, misto, rilievo, tocchi=((70, 70, 70, 7), (38, 40, 80, 7), (18, 24, 70, 6)), setola=1.6, sfuma=0):
    """un fondo dipinto per le sezioni di moderna-h: il colore pieno della sezione a tocchi larghi che girano piano, con qualche tocco di un altro colore sotto. In alto e in basso sfuma nel colore pieno, così la sezione accanto e l'intestazione continuano senza una riga. Dipinto al doppio e rimpicciolito"""
    C0 = np.array(colore, dtype=np.float32) / 255
    W2, H2 = W * 2, H * 2; k = 2 * max(W, H) / 1920; L = max(W2, H2)
    yy, xx = np.mgrid[0:H2, 0:W2].astype(np.float32)
    luce = np.exp(-(((xx - 0.6 * W2) / (0.55 * W2)) ** 2 + ((yy - 0.5 * H2) / (0.46 * H2)) ** 2))[..., None]
    base = C0 + luce * np.array(tinta, dtype=np.float32)
    th = 0.55 * np.sin(xx / (0.13 * L) + yy / (0.2 * L)) + 0.35 * np.sin(yy / (0.09 * L) - xx / (0.3 * L)) - 0.15
    tela = Image.fromarray(u8(base)); dc = ImageDraw.Draw(tela, 'RGBA')
    ril = Image.new('L', (W2, H2), 90); dh = ImageDraw.Draw(ril)
    T = np.array(terra, dtype=np.float32)
    for R, passo, alfa, lung in tocchi:
        for y, x in griglia(H2, W2, passo * k):
            c = base[y, x] * random.uniform(*va); pts = percorso(th, x, y, R * k * 0.8, lung, 0.5)
            if random.random() < 0.1: c = c * (1 - misto) + T * misto
            if len(pts) > 1: setole(dc, dh, pts, R * k, k * setola, c, alfa, random.uniform(70, 170))
    fin = impasto(np.asarray(tela, dtype=np.float32) / 255, ril, rilievo, max(1, k * 1.6))
    if sfuma: fin = blur(fin, (sfuma * k, sfuma * k, 0))
    f = np.clip((np.minimum(yy, H2 - 1 - yy) / H2 - 0.08) / 0.3, 0, 1)[..., None]; f = f * f * (3 - 2 * f)
    Image.fromarray(u8(C0 * (1 - f) + fin * f)).resize((W, H), Image.LANCZOS).save(f'assets/quadri/{nome}.webp', quality=88, method=6)


def macchia(nome, S=700):
    """la macchia dietro le bottiglie: una velatura, sopra tocchi a setole fini che girano attorno al centro e si sfilacciano sul bordo. Alfa: quanto colore c'è. Grigio: il rilievo, che la pagina fonde sul colore del vino"""
    S2 = S * 2; k = S2 / 900; c0 = S2 / 2
    yy, xx = np.mgrid[0:S2, 0:S2].astype(np.float32)
    ang = np.arctan2(yy - c0, xx - c0); r = np.hypot(xx - c0, yy - c0) / S2
    onde = [(m, random.uniform(0.006, 0.016), random.uniform(0, 6.28)) for m in (3, 5, 7, 11, 17)]
    lim = 0.345 + sum(a * np.sin(m * ang + p) for m, a, p in onde)
    th = ang + np.pi / 2 + 0.4 * np.sin(xx / (0.2 * S2) + random.uniform(0, 6)) + 0.3 * np.sin(yy / (0.14 * S2) + random.uniform(0, 6))
    vela = blur((r < lim * 0.97).astype(np.float32), 14 * k) * 0.62
    tela = Image.fromarray(u8(np.dstack([vela] * 3))); dc = ImageDraw.Draw(tela, 'RGBA')
    ril = Image.new('L', (S2, S2), 90); dh = ImageDraw.Draw(ril)
    for R, passo, alfa, lung, largo, vv in ((40, 34, 130, 16, 1, (0.5, 1)), (22, 20, 150, 14, 1.06, (0.55, 1)), (10, 13, 190, 10, 1.16, (0.65, 1))):
        for y, x in griglia(S2, S2, passo * k):
            if r[y, x] > lim[y, x] * largo: continue
            pts = percorso(th, x, y, R * k * 0.42, lung, 0.3)
            pts = pts[:next((i for i, (a, b) in enumerate(pts) if math.hypot(a - c0, b - c0) / S2 > 0.43), len(pts))]  # i tocchi lunghi finiscono prima del bordo dell'immagine, dove sarebbero tagliati dritti
            if len(pts) > 1: setole(dc, dh, pts, R * k, k * 0.75, np.full(3, random.uniform(*vv), dtype=np.float32), alfa, random.uniform(100, 230))
    al = np.asarray(tela, dtype=np.float32)[..., 0] / 255 * np.clip((0.498 - r) / 0.012, 0, 1)
    A = blur(np.asarray(ril, dtype=np.float32) / 255, 1.2 * k)
    gr = np.clip(0.5 + (-np.gradient(A, axis=1) - np.gradient(A, axis=0)) * 1.8 * k, 0, 1)
    Image.fromarray(np.dstack([u8(gr)] * 3 + [u8(al)]), 'RGBA').resize((S, S), Image.LANCZOS).save(f'assets/quadri/macchie/{nome}.webp', quality=72, method=6)


def bordo(W=2400, H=170):
    """il bordo con cui le sezioni appaiono dietro le pennellate: passate a setole, piene da una parte e sempre più sottili dall'altra, nessuna sfumatura. Si ripete senza stacco. bordo.webp per le passate che salgono, bordo-v.webp per quelle che vanno verso sinistra"""
    W2, H2 = W * 2, H * 2; k = 2
    im = Image.new('RGB', (W2, H2)); dc = ImageDraw.Draw(im, 'RGBA'); dh = ImageDraw.Draw(Image.new('L', (W2, H2)))
    onde = [(m, random.uniform(0.02, 0.05), random.uniform(0, 6.28)) for m in (2, 3, 5, 9)]
    linea = lambda x: H2 * (0.6 + sum(a * math.sin(m * x / W2 * 6.28318 + p) for m, a, p in onde))
    dc.polygon([(x, linea(x)) for x in range(0, W2 + 40, 40)] + [(W2, H2), (0, H2)], fill=(255, 255, 255, 255))
    def passata(x, y, R, passi):
        pend = random.uniform(-0.05, 0.05); cur = random.uniform(-0.002, 0.002); pts = [(x + i * R * 0.7, y + pend * i * R * 0.7 + cur * (i * R * 0.7) ** 2 / R) for i in range(passi)]
        for o in (-W2, 0, W2): setole(dc, dh, [(a + o, b) for a, b in pts], R, k * 0.8, np.ones(3, dtype=np.float32), 255, 100)
    for i in range(W // 26):
        x = random.uniform(0, W2); passata(x, linea(x) - random.uniform(-0.02, 0.1) * H2, random.uniform(13, 26) * k, random.randint(12, 26))
    for i in range(W // 22):
        x = random.uniform(0, W2); u = random.random(); passata(x, linea(x) - (0.05 + 0.13 * u) * H2, random.uniform(4, 9) * k * (1 - 0.5 * u), random.randint(22, 46))
    al = im.split()[0].resize((W, H), Image.LANCZOS).point(lambda v: 255 if v > 110 else 0).resize((W, H))  # netto: niente mezze trasparenze, niente bagliore
    al = al.filter(ImageFilter.GaussianBlur(0.6))
    Image.merge('RGBA', [Image.new('L', (W, H), 255)] * 3 + [al]).save('assets/quadri/bordo.webp', quality=80, method=6)
    v = al.transpose(Image.ROTATE_90)  # il pieno a destra
    Image.merge('RGBA', [Image.new('L', (H, W), 255)] * 3 + [v]).save('assets/quadri/bordo-v.webp', quality=80, method=6)
    Image.merge('RGBA', [Image.new('L', (H, W), 255)] * 3 + [v.transpose(Image.FLIP_LEFT_RIGHT)]).save('assets/quadri/bordo-o.webp', quality=80, method=6)  # il pieno a sinistra: i testi che le pennellate coprono


def fondi():
    os.makedirs('assets/quadri/macchie', exist_ok=True)
    random.seed('notte'); np.random.seed(7)
    blu = dict(colore=(14, 23, 40), tinta=(0.028, 0.04, 0.062), va=(0.72, 1.5), terra=(0.3, 0.2, 0.12), misto=0.28, rilievo=0.9)  # --night delle home moderne
    crema = dict(colore=(243, 239, 234), tinta=(-0.004, -0.006, -0.009), va=(0.995, 1.002), terra=(0.92, 0.88, 0.8), misto=0.04, rilievo=0, tocchi=((95, 90, 90, 6), (55, 60, 60, 6)), setola=7, sfuma=5)  # --cream: ci stanno sopra i testi, deve restare calmo
    fondo(1920, 1080, 'notte', **blu); fondo(780, 1688, 'notte-m', **blu)
    fondo(1920, 1080, 'crema', **crema); fondo(780, 1688, 'crema-m', **crema)
    Image.new('RGB', (8, 8)).save('assets/quadri/notte-mappa.webp')  # il fondo sta fermo
    for i in range(3): macchia(str(i))
    bordo()


ALTO, LARGO = (1170, 2532), (2800, 1514)  # telefono verticale: il luogo sta sopra, le bottiglie tutte dentro. Largo 1,85: su uno schermo 16:10 si taglia ai lati, su uno più largo appena in alto, mai le bottiglie
TRE = lambda a, b, c: [[a, 0.27, 0.84, 0.35], [b, 0.73, 0.84, 0.35], [c, 0.5, 0.9, 0.41]]


def senza_persone(im):
    """sala Terra: via le due persone sulla carrareccia (la maglia rossa era il punto più acceso del quadro e portava via l'occhio dalle bottiglie). Al loro posto la terra accanto, e le foglie dove il braccio entrava nel filare: sotto la spatola non resta cucitura"""
    o = np.asarray(im, dtype=np.float32) / 255; o = o.copy()
    foglia = lambda q: (q[..., 1] >= q[..., 0] - 0.04) & (q[..., 1] > q[..., 2] + 0.12)
    def copri(x0, x1, y0, y1, dx, solo=False):
        m = (~foglia(o[y0:y1, x0:x1])).astype(np.float32) if solo else np.ones((y1 - y0, x1 - x0), np.float32)
        nuovo = o[y0:y1, x0 + dx:x1 + dx]
        if dx > 0:
            sx, de = blur(o[y0:y1, x0 - 16:x0 - 3].mean(1), (8, 0)), blur(o[y0:y1, x1 + 3:x1 + 16].mean(1), (8, 0)); t = np.linspace(0, 1, x1 - x0, dtype=np.float32)[None, :, None]
            nuovo = (de[:, None] if solo else sx[:, None] * (1 - t) + de[:, None] * t) + nuovo - blur(nuovo, (10, 10, 0))  # a sinistra di quello in rosso c'è il filare: lì il tono è solo quello di destra
        m = blur(m, 4, mode='constant')[..., None]; o[y0:y1, x0:x1] = o[y0:y1, x0:x1] * (1 - m) + np.clip(nuovo, 0, 1) * m
    copri(778, 992, 362, 842, 208)  # quello in bianco: la terra alla sua destra
    copri(582, 706, 372, 812, 62, True)  # quello in rosso: la terra fra i due; le foglie davanti a lui restano
    copri(488, 582, 372, 812, -124, True)  # il suo braccio nel filare: foglie
    return Image.fromarray(u8(o))


SCENE = {
    # foto, da dove taglia in altezza (largo), stile; sole: da che parte viene (-1 sinistra, 1 destra); ombra: dove cade [x, y] per altezza di bottiglia
    # scuro: il colore che prende il nero del vetro in quella sala; davanti: cosa del luogo passa davanti al piede; velo: quanta aria della scena sta sulle bottiglie
    # bottiglie dalla più lontana alla più vicina: [nome, centro x, base y, altezza del vetro] in frazioni del quadro. tel: da dove taglia in larghezza, e le bottiglie in verticale. Le pose cambiano da sala a sala
    'pajara': dict(foto='assets/photo/pajara.webp', y=0.36, stile=vangogh, cielo=0.66, orizzonte=0.52, sole=-1, ombra=(0.55, 0.09), scuro=(0.04, 0.08, 0.2), davanti='erba',  # in diagonale verso la pajara, che resta libera a destra
                   bottiglie=[['begro', 0.555, 0.85, 0.56], ['gocce', 0.47, 0.885, 0.63], ['primitivo53', 0.38, 0.93, 0.72]],
                   tel=dict(x=0.48, cielo=0.5, orizzonte=0.5, bottiglie=[['begro', 0.76, 0.83, 0.33], ['gocce', 0.5, 0.865, 0.37], ['primitivo53', 0.25, 0.9, 0.41]])),
    'terra': dict(foto='assets/photo/vigna-passeggiata.webp', ritocco=senza_persone, y=0.12, stile=spatola, orizzonte=0, sole=-1, ombra=(0.5, 0.1), scuro=(0.09, 0.05, 0.03), davanti='erba', orlo=1.3,  # la natura morta: due dietro e una davanti
                  bottiglie=[['terraplatinum', 0.615, 0.84, 0.62], ['terra', 0.815, 0.855, 0.64], ['terraprimitivo', 0.715, 0.93, 0.78]],
                  tel=dict(x=0.28, bottiglie=TRE('terraplatinum', 'terra', 'terraprimitivo'))),
    'papaveri': dict(foto='assets/photo/papaveri.webp', y=0.33, stile=impressionismo, vetro=lambda a, k: impressionismo(a, k, viola=0.2), cielo=0.24, orizzonte=0.24, fiori=True, sole=1, ombra=(-0.3, 0.07), scuro=(0.1, 0.07, 0.2), davanti='fiori', tocco=(0.72, 1.6),  # taglio più alto: si vedono l'orizzonte e i filari, non solo fiori
                     bottiglie=[['priitivobio', 0.69, 0.88, 0.62], ['biook-2', 0.53, 0.94, 0.74]],
                     tel=dict(x=0.05, cielo=0.36, orizzonte=0.36, bottiglie=[['priitivobio', 0.68, 0.85, 0.37], ['biook-2', 0.34, 0.9, 0.42]])),
    'spiaggia': dict(foto='assets/photo/torre-mare.webp', y=0.22, stile=puntinismo, orizzonte=0.52, sole=-1, ombra=(0.5, 0.1), riflesso=True, scuro=(0.07, 0.06, 0.2),  # in fila sulla sabbia bagnata, ognuna col suo riflesso
                     bottiglie=[['cala', 0.25, 0.875, 0.65], ['3CUORI', 0.505, 0.875, 0.65], ['sassirossi', 0.378, 0.9, 0.69]],
                     tel=dict(x=0.5, orizzonte=0.56, bottiglie=[['cala', 0.2, 0.86, 0.35], ['3CUORI', 0.8, 0.86, 0.35], ['sassirossi', 0.5, 0.875, 0.37]])),
    'tramonto': dict(foto='assets/photo/vigna-tramonto.webp', y=0.12, stile=turner, vetro=lambda a, k: impressionismo(a, k, viola=0.2), cielo=(0.42, 0.3), orizzonte=0.38, sole=-1, ombra=(0.5, 0.09), scuro=(0.14, 0.07, 0.03), velo=0.1,  # in controluce, a scalare verso chi guarda
                     bottiglie=[['125rosato', 0.6, 0.85, 0.58], ['negro125', 0.7, 0.89, 0.66], ['negro125-1', 0.815, 0.93, 0.74]],
                     tel=dict(x=0.33, cielo=(0.5, 0.5), orizzonte=0.47, bottiglie=[['125rosato', 0.24, 0.82, 0.33], ['negro125', 0.5, 0.86, 0.37], ['negro125-1', 0.76, 0.9, 0.41]])),
}
ORDINE = {'pajara': ['primitivo53', 'gocce', 'begro'], 'terra': ['terraplatinum', 'terra', 'terraprimitivo'], 'papaveri': ['biook-2', 'priitivobio'], 'spiaggia': ['cala', '3CUORI', 'sassirossi'], 'tramonto': ['125rosato', 'negro125-1', 'negro125']}  # l'ordine dei vini in js/data.js: --pose scrive le posizioni così per SALE_H


# "Altri vini": lo stesso quadro con altre bottiglie, al posto di quelle indicate (le altre spariscono). Il nome finisce col numero del gruppo, stesso ordine di js/moderna-f.js: tre alla volta nell'ordine di js/data.js
ALTRI = {
    'terra-2': ('terra', {'terraplatinum': 'negroamaro', 'terra': 'terramalvasiabianca', 'terraprimitivo': 'terramalvasia'}),
    'terra-3': ('terra', {'terraprimitivo': 'terrarosato'}),
    'spiaggia-2': ('spiaggia', {'cala': 'philia', '3CUORI': 'resale', 'sassirossi': 'vis'}),
    'spiaggia-3': ('spiaggia', {'cala': 'more', '3CUORI': 'claria', 'sassirossi': 'olivia'}),
    'spiaggia-4': ('spiaggia', {'cala': 'suss', '3CUORI': 'sussrose', 'sassirossi': 'appassimento'}),
    'tramonto-2': ('tramonto', {'125rosato': 'malvasia', 'negro125-1': '125pinotgrigio', 'negro125': '125malvasiabianca'}),  # 6 nov 2026, dal catalogo: Pinot Grigio e Malvasia Bianca
    'spiaggia-5': ('spiaggia', {'sassirossi': 'marpiccolo'}),  # 6 nov 2026, dal catalogo: Marpiccolo, da solo al posto di quella davanti
}


# le bottiglie chiare: il fondo dell'etichetta non ha contrasto e il pennello se la mangerebbe. Da dove a dove sta l'etichetta, in frazioni della foto: lì resta quasi solo la foto. E il vetro torna del suo colore (la spatola lo scalda: il rosato veniva giallo)
CHIARE = {'marpiccolo': (0.6, 0.87), 'terrarosato': (0.42, 0.76), 'terramalvasiabianca': (0.42, 0.765), 'sussrose': (0.445, 0.715), 'appassimento': (0.425, 0.73)}


def fine_vetro(im):
    """come in tools/dipingi_bottiglie.py"""
    a = np.asarray(im, dtype=np.float32)[..., 3] / 255
    xs = np.where(a.max(0) > 0.5)[0]; m, l = (xs.min() + xs.max()) // 2, xs.max() - xs.min()
    return float(np.where(a[:, m - l // 6:m + l // 6].mean(1) > 0.85)[0].max() + 1) / im.height


def davanti(fin, terra, pose, tipo, oro=False):
    """qualcosa del luogo passa davanti al piede delle bottiglie: fili d'erba, fiori, zolle. Così stanno dentro il quadro e non sopra. I colori sono quelli del luogo lì accanto"""
    H, W = fin.shape[:2]; im = Image.fromarray(u8(fin)); dc = ImageDraw.Draw(im, 'RGBA'); dh = ImageDraw.Draw(Image.new('L', (W, H)))
    colore = lambda x, y: terra[int(np.clip(y, 0, H - 1)), int(np.clip(x, 0, W - 1))]
    cose = []
    for nb, x0, y0b, (w, h), rgb, al, base, Hv in pose:
        sc = Hv / 1000; xs = np.where(al[int(Hv * 0.8)] > 0.5)[0]; xa, xb = x0 + xs.min(), x0 + xs.max(); lw = xb - xa
        vivo = lambda c, lo: c * max(1, lo / (float(c @ LUM) + 1e-3))  # all'ombra del piede il colore è spento: davanti deve prendere luce
        if tipo == 'erba':
            for i in range(int(lw / (9 * sc))):
                x = random.uniform(xa - 0.3 * lw, xb + 0.3 * lw); y = base + random.uniform(-0.004, 0.028) * Hv; L = random.uniform(0.022, 0.07) * Hv; a = random.uniform(-0.55, 0.55)
                c = vivo(colore(x + random.choice((-1, 1)) * random.uniform(0.7, 1.3) * lw, y + random.uniform(0.01, 0.06) * Hv), 0.3) * random.uniform(0.9, 1.3)
                if oro: c = c * 0.6 + np.array([0.95, 0.72, 0.3], dtype=np.float32) * 0.4 * random.uniform(0.7, 1.1)  # controluce: i fili prendono l'oro del tramonto
                cose.append((y, 'e', [(x + math.sin(a) * L * t * (0.6 + 0.5 * t), y - L * t * math.cos(a * t)) for t in np.linspace(0, 1, 7)], random.uniform(5, 9) * sc, c, sc))
        elif tipo == 'fiori':
            for i in range(int(lw / (15 * sc))):
                x = random.uniform(xa - 0.9 * lw, xb + 0.9 * lw); y = base + random.uniform(-0.055, 0.035) * Hv; u = random.random()
                if u < 0.14: c = np.array([0.9, 0.27, 0.17], dtype=np.float32) * random.uniform(0.88, 1.1); r = random.uniform(13, 22) * sc
                elif u < 0.26: c = np.array([0.95, 0.84, 0.4], dtype=np.float32) * random.uniform(0.9, 1.05); r = random.uniform(8, 13) * sc
                else: c = vivo(colore(x + random.choice((-1, 1)) * random.uniform(0.7, 1.4) * lw, base + random.uniform(0.01, 0.06) * Hv), 0.46) * random.uniform(0.95, 1.25); r = random.uniform(9, 15) * sc
                cose.append((y, 'f', (x, y), r, c, sc))
    for y, t, dove, r, c, sc in sorted(cose, key=lambda o: o[0]):  # dal fondo a qui: quello più vicino copre
        col = tuple(u8(c).tolist())
        if t == 'e':
            wd = max(2, int(r * 1.5)); dc.line(dove[:4], fill=col, width=wd, joint='curve'); dc.line(dove[3:], fill=col, width=max(1, int(wd * 0.6)), joint='curve')
            ex, ey = dove[0]; dc.ellipse((ex - wd / 2, ey - wd / 2, ex + wd / 2, ey + wd / 2), fill=col)
        elif t == 'f':
            a = random.uniform(-1.3, -0.3) if c[1] > c[0] else random.uniform(-0.8, 0.5); ln = r * random.uniform(0.8, 1.4); dx, dy = math.cos(a) * ln, math.sin(a) * ln; x, y = dove; wd = max(1, int(r * 1.5))
            q = [(x - dx, y - dy), (x - dy * 0.25, y + dx * 0.25), (x + dx, y + dy)]; dc.line(q, fill=col, width=wd, joint='curve')
            for ex, ey in (q[0], q[2]): dc.ellipse((ex - wd / 2, ey - wd / 2, ex + wd / 2, ey + wd / 2), fill=col)
    return np.asarray(im, dtype=np.float32) / 255


def dipingi(nome, telefono):
    global LONT, BOTT
    di, cambi = ALTRI.get(nome, (nome, None))
    S = SCENE[di]; T = S['tel'] if telefono else S
    random.seed(di); np.random.seed(sum(map(ord, di)))
    im = Image.open(S['foto']).convert('RGB')
    if S.get('ritocco'): im = S['ritocco'](im)
    W, H = ALTO if telefono else LARGO
    if telefono:
        x0f = T['x'] * im.width; box = (x0f, 0, x0f + im.height * W / H, im.height)
    else:
        y0f = S['y'] * im.height; box = (0, y0f, im.width, y0f + im.width * H / W)
    comp = np.asarray(im.resize((W, H), Image.LANCZOS, box=box), dtype=np.float32) / 255
    ing = W / (box[2] - box[0])
    if ing > 2: comp = blur(comp, (ing * 0.5, ing * 0.5, 0))  # foto piccola (la pajara è 563 px): ingrandita mostra i quadretti della compressione, e il pennello li seguiva
    lontano = blur(comp, (W / 40, W / 40, 0))
    pose = []
    for nb, cx, by, hv in ([[cambi[b[0]], *b[1:]] for b in T['bottiglie'] if b[0] in cambi] if cambi else T['bottiglie']):
        foto = Image.open(f'assets/bottles/{nb}.webp').convert('RGBA')
        fv = fine_vetro(foto); Hv = hv * H; s = Hv / (foto.height * fv); k = Hv / 700
        size = (round(foto.width * s), round(foto.height * s))
        fa = np.asarray(foto.resize(size, Image.LANCZOS), dtype=np.float32) / 255
        fa[round(Hv):, 3] = 0
        x0, y0b, base, al = round(cx * W - size[0] / 2), round(by * H - Hv), round(by * H), fa[..., 3]

        # l'ombra a terra: la sagoma stesa dove cade la luce, più sfocata lontano. Più una zona scura dove il piede tocca
        ombra = np.zeros((H, W), np.float32); ox, oy = S['ombra']
        for r in range(round(Hv)):
            t = (Hv - r) / Hv; yo = round(base + t * oy * Hv); xo = round(x0 + t * ox * Hv)
            if 0 <= yo < H:
                a, b = max(0, xo), min(W, xo + size[0])
                if a < b: ombra[yo, a:b] = np.maximum(ombra[yo, a:b], al[r, a - xo:b - xo])
        ombra = blur(ombra, 3 * k) * 0.6 + blur(ombra, 14 * k) * 0.4
        ombra = np.maximum(ombra, 0.9 * np.exp(-(((np.arange(W) - cx * W) / (size[0] * 0.36)) ** 2)[None, :] - (((np.arange(H) - base - 2 * k) / (10 * k)) ** 2)[:, None]))
        comp *= 1 - np.clip(ombra, 0, 1)[..., None] * np.array([0.62, 0.66, 0.6], dtype=np.float32)

        # la luce del luogo sul vetro: dai bordi i colori intorno, più forti dalla parte del sole; il piede più scuro. Il nero prende lo scuro della sala (un pittore non usa il nero puro) e un velo dell'aria della scena
        amb = lontano[np.clip(y0b + size[1] // 2, 0, H - 1), np.clip(round(cx * W), 0, W - 1)]
        pes = blur(al, 6) + 1e-3
        rgb = np.where((al > 0.5)[..., None], fa[..., :3], np.stack([blur(fa[..., i] * al, 6) / pes for i in range(3)], -1))
        bordo = blur(al, size[0] * 0.05)
        fianco = np.clip((1 - bordo) * 1.6, 0, 1) * (al > 0.5)
        lato = np.clip(0.45 + 0.55 * (np.arange(size[0], dtype=np.float32) / size[0] - 0.5) * 2 * S['sole'], 0.15, 1)[None, :]
        piede = np.clip((np.arange(size[1], dtype=np.float32) / Hv - 0.93) / 0.07, 0, 1)[:, None]
        rgb = rgb * (1 + (amb / amb.mean() - 1) * 0.3) + amb * (fianco * lato)[..., None] * 0.55
        rgb = rgb + np.clip(1 - (rgb @ LUM)[..., None] / 0.22, 0, 1) * np.array(S['scuro'], dtype=np.float32) * 0.6
        if S.get('velo'): rgb = rgb * (1 - S['velo']) + amb * S['velo']
        rgb = np.clip(rgb * (1 - piede * 0.5)[..., None], 0, 1)

        # il riflesso nella sabbia bagnata, dipinto insieme alla sabbia
        if S.get('riflesso'):
            for r in range(round(Hv * 0.72)):
                yo, sr = base + r, round(Hv) - 1 - int(r / 0.82)
                if yo >= H or sr < 0: break
                xo = x0 + round(math.sin(r * 0.05 / k) * r * 0.018)
                a, b = max(0, xo), min(W, xo + size[0])
                if a >= b: continue
                f = al[sr, a - xo:b - xo, None] * (1 - r / (Hv * 0.72)) ** 1.5 * 0.55
                comp[yo, a:b] = comp[yo, a:b] * (1 - f) + rgb[sr, a - xo:b - xo] * f
        pose.append((nb, x0, y0b, size, rgb, al, base, Hv))

    # il luogo si dipinge con le bottiglie già dentro: i tocchi girano attorno al vetro e il contorno è del quadro, non un ritaglio. Poi ogni bottiglia si rifinisce a tocchi più piccoli, un po' dentro il contorno
    terra = comp.copy(); BOTT = np.zeros((H, W), bool)
    for nb, x0, y0b, (w, h), rgb, al, base, Hv in pose:
        a, b, c, d = max(0, y0b), min(H, y0b + h), max(0, x0), min(W, x0 + w)
        m = al[a - y0b:b - y0b, c - x0:d - x0, None]
        comp[a:b, c:d] = comp[a:b, c:d] * (1 - m) + rgb[a - y0b:b - y0b, c - x0:d - x0] * m; BOTT[a:b, c:d] |= m[..., 0] > 0.5
    LONT = lontananza(H, W, T.get('orizzonte', S['orizzonte']), *S.get('tocco', ()))
    fin = S['stile'](comp, 1.0, T.get('cielo', S.get('cielo')))
    LONT = BOTT = None
    for nb, x0, y0b, (w, h), rgb, al, base, Hv in pose:
        dip = S.get('vetro', S['stile'])(rgb, 0.6)
        l0 = rgb @ LUM; sc = h / 1100
        if nb in CHIARE: dip = np.clip(dip * blur(rgb, (30 * sc, 30 * sc, 0)) / (blur(dip, (30 * sc, 30 * sc, 0)) + 1e-3), 0, 1)
        fine = blur(np.abs(l0 - blur(l0, 2.2 * sc)), 5 * sc)  # si deve leggere: su scritte e disegni dell'etichetta resta la foto, sul resto il pennello: è il pennello che tiene la bottiglia nel quadro
        scritte = np.clip((blur(np.clip((fine - 0.01) / 0.02, 0, 1), 3 * sc) - 0.08) / 0.3, 0, 1)[..., None] * 0.94
        if nb in CHIARE: fascia = np.zeros((h, w, 1), np.float32); fascia[round(CHIARE[nb][0] * h):round(CHIARE[nb][1] * h)] = 0.86; scritte = np.maximum(scritte, fascia)
        dip = dip * (1 - scritte) + rgb * scritte
        a, b, c, d = max(0, y0b), min(H, y0b + h), max(0, x0), min(W, x0 + w)
        m = np.clip((blur(al, max(1.0, S.get('orlo', 4.5) * sc)) - 0.5) / 0.35, 0, 1)[a - y0b:b - y0b, c - x0:d - x0, None]
        fin[a:b, c:d] = fin[a:b, c:d] * (1 - m) + dip[a - y0b:b - y0b, c - x0:d - x0] * m
    if S.get('davanti'): fin = davanti(fin, terra, pose, S['davanti'], S.get('oro', False))
    if cambi:  # fuori dalle bottiglie resta identico il quadro di partenza: al clic il pennello ridipinge solo qui (in js/moderna-f.js copre un po' di più, 0,75 contro 0,55)
        tutte = T['bottiglie']; m = 0.55 * max(b[3] for b in tutte) * H
        zona = np.zeros((H, W), np.float32); zona[max(0, round((min(b[2] - b[3] for b in tutte) - 0.03) * H)):, max(0, round(min(b[1] for b in tutte) * W - m)):min(W, round(max(b[1] for b in tutte) * W + m))] = 1
        zona = blur(zona, 0.015 * W)[..., None]
        fin = np.asarray(Image.open(f"{OUT}{di}{'-m' if telefono else ''}.webp").convert('RGB'), dtype=np.float32) / 255 * (1 - zona) + fin * zona
    Image.fromarray(u8(fin)).save(f"{OUT}{nome}{'-m' if telefono else ''}.webp", quality=84 if telefono else 90, method=6)
    print('fatta', nome, 'telefono' if telefono else 'largo', flush=True)


def mappa(nome, telefono):
    S = SCENE[nome]; T = S['tel'] if telefono else S
    im = Image.open(S['foto']).convert('RGB')
    W, H = ALTO if telefono else LARGO
    if telefono:
        x0f = T['x'] * im.width; box = (x0f, 0, x0f + im.height * W / H, im.height)
    else:
        y0f = S['y'] * im.height; box = (0, y0f, im.width, y0f + im.width * H / W)
    mw = 640; mh = round(mw * H / W)
    a = np.asarray(im.resize((mw, mh), Image.LANCZOS, box=box), dtype=np.float32) / 255
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    yy, xx = np.mgrid[0:mh, 0:mw].astype(np.float32)
    o = S['orizzonte'] * mh if not telefono else T.get('orizzonte', S['orizzonte']) * mh
    cielo = np.clip((o - yy) / (0.04 * mh), 0, 1) * (a @ LUM > 0.3)
    chiome = np.clip((g - np.maximum(r, b) + 0.015) / 0.05, 0, 1) * (1 - cielo)
    if S.get('fiori'): chiome = np.maximum(chiome, np.clip((np.minimum(r - g, r - b) - 0.2) / 0.1, 0, 1))
    acqua = np.clip((b - r - 0.05) / 0.06, 0, 1) * np.clip((yy - o) / (0.02 * mh), 0, 1) if S.get('riflesso') else np.zeros_like(r)
    fuori = np.ones((mh, mw), np.float32)  # le bottiglie e un po' intorno stanno ferme: il vento non le deforma
    for nb, cx, by, hv in T['bottiglie']:
        bw = hv * H * 0.34 / W * mw
        fuori[max(0, round((by - hv) * mh) - 3):min(mh, round(by * mh) + 3), max(0, round(cx * mw - bw / 2) - 3):min(mw, round(cx * mw + bw / 2) + 3)] = 0
    m = np.stack([cielo, chiome, acqua], -1) * blur(fuori, 2)[..., None]
    Image.fromarray(u8(blur(m, (1.2, 1.2, 0)))).save(f"{OUT}{nome}{'-m' if telefono else ''}-mappa.webp", quality=82)


if __name__ == '__main__':  # importabile: tools/dipingi_piatti.py usa le sue setole
    if '--notte' in sys.argv: fondi(); sys.exit()
    if '--pose' in sys.argv:  # le posizioni da riportare in SALE_H di js/moderna-f.js
        for n, S in SCENE.items(): print(n, *[[[b[1], b[2], b[3]] for v in ORDINE[n] for b in bb if b[0] == v] for bb in (S['bottiglie'], S['tel']['bottiglie'])], sep='\n  ')
        sys.exit()
    nomi = [a for a in sys.argv[1:] if not a.startswith('--')] or list(ALTRI if '--altri' in sys.argv else SCENE)
    for nome in nomi:
        for telefono in (False, True):
            (mappa if '--mappe' in sys.argv else dipingi)(nome, telefono)
