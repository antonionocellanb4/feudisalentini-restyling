"""I piatti di "Cosa c'è in tavola?" dipinti per moderna-h (6 nov 2026: "fammeli nello stile in cui si trovano"). Gli stessi disegni incisi di js/piatti-incisi.js,
ripassati a pennello con le setole di tools/dipingi_soggetto.py: il piatto è un disco color porcellana a tocchi che girano, il filo ocra-oro sul bordo, il motivo a inchiostro e oro.
uso: python -I tools/dipingi_piatti.py [id ...]   scrive assets/quadri/piatti/<id>.webp (trasparente fuori dal piatto)"""
import json, math, os, random, re, sys
import numpy as np
from PIL import Image, ImageDraw
sys.path.insert(0, os.path.dirname(__file__))
from scipy.spatial import ConvexHull
from dipingi_soggetto import u8, griglia, percorso, setole, impasto, blur

S, OUT = 240, 'assets/quadri/piatti/'
INK, ORO, PORC = np.array([0.17, 0.13, 0.11]), np.array([0.66, 0.53, 0.29]), np.array([0.975, 0.955, 0.915])
CIBO = {'crudo': (0.93, 0.70, 0.60), 'pesce': (0.60, 0.68, 0.73), 'pasta': (0.93, 0.79, 0.44), 'carne': (0.62, 0.24, 0.18), 'selvaggina': (0.58, 0.42, 0.27),
        'formaggi': (0.95, 0.82, 0.46), 'freschi': (0.88, 0.55, 0.50), 'pugliese': (0.92, 0.80, 0.52), 'aperitivo': (0.84, 0.64, 0.34), 'dolci': (0.74, 0.53, 0.33)}  # il colore di quello che si mangia
SAGOMA = {'formaggi'}  # disegni fatti di linee aperte: si campisce tutta la sagoma (l'involucro dei punti)


def tracciati():
    """[linee d'inchiostro, linee d'oro] per piatto, in unità del viewBox (-102..102)"""
    js = open('js/piatti-incisi.js', encoding='utf-8').read()
    B, M = json.loads(re.search(r'const B = (\[.*?\]), M', js).group(1)), json.loads(re.search(r'M = (\{.*?\});', js).group(1))
    linee = lambda d: [[tuple(map(float, p.split())) for p in seg.split('L')] for seg in d.split('M') if seg]
    return {k: (linee(B[0] + v[0]), linee(B[1] + v[1])) for k, v in M.items()}


def fitto(pts, passo):
    """punti ogni passo px lungo la linea: le setole seguono la curva senza spigoli"""
    out = [pts[0]]
    for (a, b), (c, d) in zip(pts, pts[1:]):
        n = max(1, int(math.hypot(c - a, d - b) / passo))
        out += [(a + (c - a) * t / n, b + (d - b) * t / n) for t in range(1, n + 1)]
    return out


def piatto(nome, ink, oro):
    random.seed(nome)
    S2 = S * 2; sc = S2 / 224; c0 = S2 / 2; k = S2 / 900
    P = lambda x, y: (c0 + x * sc, c0 + y * sc)
    yy, xx = np.mgrid[0:S2, 0:S2].astype(np.float32)
    r = np.hypot(xx - c0, yy - c0) / sc; ang = np.arctan2(yy - c0, xx - c0)
    th = ang + np.pi / 2 + 0.25 * np.sin(xx / (0.2 * S2) + random.uniform(0, 6))  # i tocchi girano attorno al centro, come sul tornio
    luce = (1 - 0.05 * np.clip((xx + yy - S2) / S2, -1, 1))[..., None]  # un filo d'ombra in basso a destra
    tela = Image.new('RGBA', (S2, S2), (0, 0, 0, 0)); dc = ImageDraw.Draw(tela, 'RGBA')
    ril = Image.new('L', (S2, S2), 90); dh = ImageDraw.Draw(ril)
    dc.ellipse([c0 - 97 * sc, c0 - 97 * sc, c0 + 97 * sc, c0 + 97 * sc], fill=tuple(u8(PORC).tolist()) + (255,))  # sotto i tocchi il piatto è pieno: niente buchi
    for R, passo, alfa, lung in ((26, 22, 170, 12), (14, 13, 190, 10)):
        for y, x in griglia(S2, S2, passo * k):
            if r[y, x] > 99: continue
            pts = [(a, b) for a, b in percorso(th, x, y, R * k * 0.5, lung, 0.2) if math.hypot(a - c0, b - c0) / sc < 99.5]
            if len(pts) > 1: setole(dc, dh, pts, R * k, k * 0.8, PORC * luce[y, x] * random.uniform(0.95, 1.02), alfa, random.uniform(90, 200))
    cibo = np.array(CIBO[nome]); motivo = [l for l in ink if max(math.hypot(x, y) for x, y in l) < 95]  # il bordo del piatto non si campisce
    if nome in SAGOMA: tutti = [q for l in motivo for q in l]; motivo = [[tutti[i] for i in ConvexHull(tutti).vertices] + [tutti[ConvexHull(tutti).vertices[0]]]] + motivo
    for l in motivo:  # le forme chiuse si campiscono a tocchi col colore del cibo, sotto le linee aperte passa una pennellata di colore
        chiusa = len(l) >= 4 and math.hypot(l[0][0] - l[-1][0], l[0][1] - l[-1][1]) < 3
        if chiusa:
            m = Image.new('L', (S2, S2), 0); ImageDraw.Draw(m).polygon([P(x, y) for x, y in l], fill=255); m = np.asarray(m) > 0
            for y, x in griglia(S2, S2, 9 * k):
                if not m[y, x]: continue
                pts = [(a, b) for a, b in percorso(th, x, y, 5 * k, 6, 0.5) if m[int(b), int(a)]]
                if len(pts) > 1: setole(dc, dh, pts, 9 * k, k * 0.8, cibo * random.uniform(0.85, 1.08), 200, random.uniform(120, 220))
        else:
            q = fitto([P(x, y) for x, y in l], 3)
            if len(q) > 1: setole(dc, dh, q, 15 * k, k * 0.9, cibo * random.uniform(0.9, 1.06), 150, random.uniform(120, 200))
    for linee, col, R in ((oro, ORO, 6), (ink, INK, 4.6)):  # prima l'oro, sopra l'inchiostro
        for pts in linee:
            q = fitto([P(x, y) for x, y in pts], 3)
            if len(q) > 1: setole(dc, dh, q, R * k * 1.6, k * 0.9, col * random.uniform(0.92, 1.08), 235, random.uniform(150, 240))
    a = np.asarray(tela, dtype=np.float32) / 255
    col = impasto(a[..., :3], ril, 1.6, max(1, k * 1.4))
    al = a[..., 3] * np.clip((103 - r) / 2, 0, 1)
    Image.fromarray(np.dstack([u8(col), u8(al)]), 'RGBA').resize((S, S), Image.LANCZOS).save(f"{OUT}{nome}.webp", quality=82, method=6)


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    T = tracciati(); scelti = sys.argv[1:] or list(T)
    assert all(n in T for n in scelti), scelti
    for n in scelti:
        piatto(n, *T[n]); print(n)
