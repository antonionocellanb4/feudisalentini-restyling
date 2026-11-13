"""Versione "Botanica" (13 nov 2026): le sei piante delle copertine Instagram del cliente (una per collezione), a retino tono su tono.
Parte da tavole botaniche d'epoca di pubblico dominio (tools/tavole/, da Wikimedia Commons):
  cappero   Illustration Capparis spinosa0.jpg     O. W. Thomé, Flora von Deutschland, Österreich und der Schweiz, 1885
  fico      Illustration Opuntia vulgaris0 clean.jpg   idem
  ulivo     Illustration Olea europaea0.jpg        idem
  menta     Illustration Mentha spicata0.jpg       idem
  ginepro   Illustration Juniperus communis0.jpg   idem
  camomilla Matricaria recutita - Köhler's Medizinal-Pflanzen-091.jpg   Köhler's Medizinal-Pflanzen, 1887
Toglie la carta, tiene solo la pianta grande (via i particolari e le scritte), la passa a retino a 45 gradi e la salva come maschera:
assets/botanica/<pianta>.webp è nera con la trasparenza, il colore lo dà il css (mask-image + background).
Uso: python -I tools/botanica.py [pianta ...]   Poi: python -I tools/botanica.py --prova  -> tools/shots/botanica-prova.jpg (le sei sul loro colore)."""
import sys
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

R = Path(__file__).resolve().parent.parent
SRC, OUT = R / 'tools' / 'tavole', R / 'assets' / 'botanica'
LATO, CELLA = 1500, 9  # lato lungo della maschera e passo del retino, in pixel

# tieni: quanti pezzi staccati fanno parte della pianta (il più grande, poi i successivi se servono); taglio: riquadro (x0, y0, x1, y1) in frazioni, per escludere scritte attaccate; via: riquadri da cancellare, in frazioni del taglio
PIANTE = {
    'cappero': dict(file='cappero.jpg', tieni=1),
    'fico': dict(file='fico.jpg', tieni=1, gamma=2.2),  # pale verde scuro: senza, verrebbero un pieno senza chiaroscuro
    'ulivo': dict(file='ulivo.jpg', tieni=1, taglio=(0.11, 0.02, 0.98, 0.955), via=[(0, 0.845, 0.34, 1)]),  # a sinistra l'ombra della rilegatura; via: un nocciolo disegnato ai piedi, che restava attaccato
    'menta': dict(file='menta.jpg', tieni=1, taglio=(0.11, 0.02, 0.98, 0.955)),
    'ginepro': dict(file='ginepro.jpg', tieni=1, taglio=(0.03, 0.02, 0.93, 0.955)),
    'camomilla': dict(file='camomilla.jpg', tieni=1),
}
COLORI = {'ginepro': ('#600028', '#3d0117'), 'menta': ('#023e25', '#022517'), 'ulivo': ('#503323', '#3e2719'), 'cappero': ('#bf5138', '#732e1e'), 'camomilla': ('#717b57', '#56603f'), 'fico': ('#905e3b', '#7a4630')}


def tono(im, o):
    """Quanto inchiostro c'è in ogni punto (0 carta, 1 pieno), solo sulla pianta grande."""
    a = np.asarray(im.convert('RGB'), dtype=np.float32)
    x0, y0, x1, y1 = o.get('taglio', (0.02, 0.02, 0.98, 0.955))
    H, W = a.shape[:2]
    a = a[int(y0 * H):int(y1 * H), int(x0 * W):int(x1 * W)]
    # la carta, poi corretta zona per zona (i fogli sono ingialliti in modo irregolare)
    # colonna per colonna (l'ombra della rilegatura è una fascia verticale): in ogni colonna la carta è il chiaro che prevale
    carta = ndi.gaussian_filter1d(np.percentile(a, 85, axis=0), 6, axis=0)[None, :, :].repeat(a.shape[0], axis=0).astype(np.float32)
    pre = np.linalg.norm(a - carta, axis=2)
    libero = (pre < 34).astype(np.float32)
    s = 45
    den = ndi.gaussian_filter(libero, s) + 1e-3
    loc = np.stack([ndi.gaussian_filter(a[..., c] * libero, s) / den for c in range(3)], axis=2)
    loc = np.where((den > 0.08)[..., None], loc, carta)
    dist = np.linalg.norm(a - loc, axis=2)
    lum = a @ np.array([0.299, 0.587, 0.114], dtype=np.float32); lumc = loc @ np.array([0.299, 0.587, 0.114], dtype=np.float32)
    scuro = np.clip((lumc - lum) / np.maximum(lumc, 1), 0, 1)
    t = np.clip(0.22 * np.clip((dist - 14) / 150, 0, 1) + 1.05 * scuro, 0, 1) ** o.get('gamma', 1)  # il chiaroscuro della tavola resta: foglie scure a punti grossi, fiori chiari a punti fini
    for (vx0, vy0, vx1, vy1) in o.get('via', []): t[int(vy0 * t.shape[0]):int(vy1 * t.shape[0]), int(vx0 * t.shape[1]):int(vx1 * t.shape[1])] = 0
    # la pianta grande: i pezzi che si toccano (allargati di poco), dal più esteso
    pieno = ndi.binary_dilation(t > 0.13, iterations=o.get('lega', 4))
    lab, n = ndi.label(pieno)
    aree = ndi.sum(pieno, lab, range(1, n + 1)); ordine = np.argsort(aree)[::-1][:o.get('tieni', 1)] + 1
    scelta = ndi.gaussian_filter(ndi.binary_dilation(np.isin(lab, ordine), iterations=3).astype(np.float32), 2)
    t = t * np.clip(scelta * 1.6, 0, 1)
    ys, xs = np.where(scelta > 0.5); p = 12
    t = t[max(0, ys.min() - p):ys.max() + p, max(0, xs.min() - p):xs.max() + p]
    return Image.fromarray((t * 255).astype(np.uint8))


def retino(t):
    """Retino a 45 gradi: punti tanto più grossi quanto più inchiostro c'è; oltre il 90% si chiudono in un pieno."""
    k = LATO / max(t.size)
    t = t.resize((round(t.width * k), round(t.height * k)), Image.LANCZOS)
    v = ndi.gaussian_filter(np.asarray(t, dtype=np.float32) / 255, CELLA / 3.2)
    v = np.clip((v - 0.05) / 0.9, 0, 1)
    H, W = v.shape; y, x = np.mgrid[0:H, 0:W].astype(np.float32)
    a, b = (x + y) / 1.41421356, (x - y) / 1.41421356
    d = np.hypot(a - (np.floor(a / CELLA) + 0.5) * CELLA, b - (np.floor(b / CELLA) + 0.5) * CELLA)
    alfa = np.clip((CELLA * 0.74 * np.sqrt(v) - d) * 1.3 + 0.5, 0, 1)
    alfa[v < 0.02] = 0
    out = np.zeros((H, W, 4), dtype=np.uint8); out[..., 3] = (alfa * 255).astype(np.uint8)
    return Image.fromarray(out, 'RGBA')


def prova():
    """Le sei maschere sul colore della loro collezione, come nelle copertine: per giudicarle a colpo d'occhio."""
    L = 520; f = Image.new('RGB', (L * 3, L * 2))
    for i, (n, (fondo, pianta)) in enumerate(COLORI.items()):
        m = Image.open(OUT / f'{n}.webp'); m.thumbnail((L - 40, L - 40))
        c = Image.new('RGB', (L, L), fondo); c.paste(Image.new('RGB', m.size, pianta), ((L - m.width) // 2, (L - m.height) // 2), m.getchannel('A'))
        f.paste(c, ((i % 3) * L, (i // 3) * L))
    (R / 'tools' / 'shots').mkdir(exist_ok=True); f.save(R / 'tools' / 'shots' / 'botanica-prova.jpg', quality=88); print('tools/shots/botanica-prova.jpg')


if __name__ == '__main__':
    if '--prova' in sys.argv: prova(); sys.exit()
    OUT.mkdir(parents=True, exist_ok=True)
    for n in [a for a in sys.argv[1:] if a in PIANTE] or PIANTE:
        m = retino(tono(Image.open(SRC / PIANTE[n]['file']), PIANTE[n]))
        assert m.getchannel('A').getextrema()[1] == 255, n  # una maschera vuota vuol dire carta non riconosciuta
        m.save(OUT / f'{n}.webp', lossless=True, quality=100, method=6)
        print(n, m.size, (OUT / f'{n}.webp').stat().st_size // 1024, 'KB')
