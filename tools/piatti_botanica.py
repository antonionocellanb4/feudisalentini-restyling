"""Cosa c'è in tavola nello stile di Botanica (20 nov 2026): "queste icone stile di dove si trovano ora, questi sono disegni lineari presi dai vecchi stili che abbiamo accantonato".
Dai piatti incisi (js/piatti-incisi.js, linee d'inchiostro e d'oro, senza il bordo del piatto) fa sagome piene a retino come le piante di Botanica (retino di tools/botanica.py):
le linee restano piene, dentro le forme chiuse il retino a 45 gradi, più fitto verso i bordi e in basso a destra (la luce viene da in alto a sinistra).
Ogni piatto riempie il suo quadrato (i disegni hanno misure diverse, le icone no).
assets/botanica/piatti/<piatto>.webp è nera con la trasparenza: il colore lo dà il css (mask-image + background), come per le piante.
Uso: python -I tools/piatti_botanica.py   Poi: python -I tools/piatti_botanica.py --prova -> tools/shots/piatti-botanica-prova.jpg (le dieci sul colore della sezione)."""
import json, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi

R = Path(__file__).resolve().parent.parent
OUT = R / 'assets' / 'botanica' / 'piatti'
S, LATO, CELLA, TRATTO = 1600, 320, 15, 2.6  # lato del disegno in pixel, lato della maschera, passo del retino nella maschera, spessore della linea in unità del disegno (il piatto intero è largo 204)


def piatti():
    t = (R / 'js' / 'piatti-incisi.js').read_text(encoding='utf-8')
    a = t.index('M = {') + 4
    return json.loads(t[a:t.index('};', a) + 1])  # {piatto: [linee d'inchiostro, linee d'oro]}, solo M e L


def linee(d):
    return [[tuple(map(float, p.split())) for p in s.split('L')] for s in d.split('M') if s.strip()]


def sagoma(tratti):
    pts = np.array([p for t in tratti for p in t])
    (x0, y0), (x1, y1) = pts.min(0), pts.max(0)
    lato = max(x1 - x0, y1 - y0) * 1.12; cx, cy = (x0 + x1) / 2, (y0 + y1) / 2; k = S / lato
    im = Image.new('L', (S, S), 0); dr = ImageDraw.Draw(im); w = round(TRATTO * k)  # spessore della linea in pixel del disegno
    for t in tratti:
        q = [((x - cx) * k + S / 2, (y - cy) * k + S / 2) for x, y in t]
        if len(q) > 1: dr.line(q, fill=255, width=w, joint='curve')
        for x, y in (q[0], q[-1]): dr.ellipse((x - w / 2, y - w / 2, x + w / 2, y + w / 2), fill=255)  # punte tonde
    riga = np.asarray(im) > 127
    pieno = ndi.binary_fill_holes(riga)
    # il contorno esterno resta pieno; le linee dentro la sagoma diventano tagli (come le nervature delle piante), i buchi piccoli restano vuoti (formaggio, occhio del pesce)
    fuori = ndi.binary_dilation(~pieno, iterations=w + 2)
    bordo = riga & fuori
    lab, n = ndi.label(pieno & ~riga)
    aree = ndi.sum(np.ones_like(lab), lab, index=np.arange(1, n + 1))
    buchi = np.isin(lab, 1 + np.flatnonzero(aree < 0.0035 * S * S))
    # quanto inchiostro dentro: più scuro vicino ai bordi e verso il basso a destra
    d = ndi.distance_transform_edt(pieno & ~riga)
    yy, xx = np.mgrid[0:S, 0:S].astype(np.float32) / S
    v = 0.18 + 0.55 * np.exp(-d / (0.035 * S)) + 0.32 * np.clip((xx + yy) - 0.7, 0, 1)
    v = np.where(pieno & ~riga & ~buchi, np.clip(v, 0, 0.88), 0.0).astype(np.float32)
    # retino a 45 gradi alla misura della maschera (come tools/botanica.py), poi giù a LATO
    c = CELLA * S / LATO
    a, b = (xx * S + yy * S) / 1.41421356, (xx * S - yy * S) / 1.41421356
    dd = np.hypot(a - (np.floor(a / c) + 0.5) * c, b - (np.floor(b / c) + 0.5) * c)
    alfa = np.where(bordo, 1.0, np.clip((c * 0.74 * np.sqrt(v) - dd) * (1.3 * LATO / S) + 0.5, 0, 1))
    alfa[(v < 0.02) & ~bordo] = 0
    m = Image.fromarray((alfa * 255).astype(np.uint8), 'L').resize((LATO, LATO), Image.LANCZOS)
    out = Image.new('RGBA', (LATO, LATO), (0, 0, 0, 0)); out.putalpha(m)
    return out


def prova():
    L = 220; nomi = list(piatti()); f = Image.new('RGB', (L * 5, L * 4), '#905e3b')
    for i, n in enumerate(nomi):
        m = Image.open(OUT / f'{n}.webp').getchannel('A').resize((L - 60, L - 60), Image.LANCZOS)
        for riga, col in ((0, '#f3efea'), (2, '#7a4630')):
            x, y = (i % 5) * L + 30, ((i // 5) + riga) * L + 30
            f.paste(Image.new('RGB', m.size, col), (x, y), m)
    (R / 'tools' / 'shots').mkdir(exist_ok=True); f.save(R / 'tools' / 'shots' / 'piatti-botanica-prova.jpg', quality=90); print('tools/shots/piatti-botanica-prova.jpg')


if __name__ == '__main__':
    if '--prova' in sys.argv: prova(); sys.exit()
    OUT.mkdir(parents=True, exist_ok=True)
    for n, (inch, oro) in piatti().items():
        m = sagoma(linee(inch) + linee(oro))
        assert m.getchannel('A').getextrema()[1] == 255, n  # vuota: il disegno non è stato letto
        m.save(OUT / f'{n}.webp', lossless=True, quality=100, method=6)
        print(n, (OUT / f'{n}.webp').stat().st_size // 1024, 'KB')
