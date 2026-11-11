"""Le bottiglie nuove del catalogo PDF del cliente (Catalogo Feudi Salentini, 6 nov 2026) messe come quelle di assets/bottles: foto su fondo bianco -> fondo trasparente,
nella stessa cornice (tela 653x1024, tappo a y 74, fine del vetro a y 932: Scheda.FONDO resta 0,91). La foto non si ritocca: si toglie solo il bianco attorno.
Il bianco che tocca i bordi è fondo; dentro la sagoma (etichette bianche comprese) l'alfa è piena, sul filo del bordo sfuma; sotto il vetro il riflesso resta appena accennato.
uso: python -I tools/bottiglie_catalogo.py <foto.png> <nome> [<foto.png> <nome> ...]   scrive assets/bottles/<nome>.webp"""
import sys
import numpy as np
from PIL import Image
from scipy.ndimage import label, binary_erosion

W0, H0, TOP, BASE = 653, 1024, 74, 932


def scontorna(src, nome):
    a = np.asarray(Image.open(src).convert('RGB')).astype(np.float32); H, W, _ = a.shape
    d = 255 - a.min(2)  # quanto il pixel è lontano dal bianco del fondo
    righe = (d > 25).sum(1); sat = a.max(2) - a.min(2)
    top, yb = int(np.argmax(righe > 3)), int(np.nonzero(righe > 40)[0].max()) + 5  # tappo e fine del vetro, con la curva del fondo (sotto c'è solo il riflesso, quasi bianco)
    vetro = [y for y in range(top, H) if righe[y] > 40 and (np.median(sat[y][d[y] > 25]) > 12 or np.median(d[y][d[y] > 25]) > 150)]  # il vetro è colorato o scuro
    if yb - max(vetro) > 10: yb = max(vetro) + 3  # sotto c'è l'ombra grigia della foto (Pinot Grigio, Malvasia Bianca, Marpiccolo): non è vetro, la bottiglia ci starebbe sopra sospesa
    lab, _ = label(d < 5); bordo = set(np.unique(np.r_[lab[0], lab[-1], lab[:, 0], lab[:, -1]])) - {0}
    fondo = np.isin(lab, list(bordo)); dentro = ~fondo
    for y in range(top, yb + 1):  # la bottiglia non ha rientranze: fra il primo e l'ultimo pixel di una riga è tutta piena (i tappi bianchi si confondono col fondo)
        xs = np.nonzero(dentro[y] & (d[y] > 12))[0]
        if len(xs) > 1: dentro[y, xs.min():xs.max() + 1] = True; fondo[y, xs.min():xs.max() + 1] = False
    nucleo = binary_erosion(dentro, iterations=2); nucleo[max(0, yb - 14):] = False  # sul fondo del vetro (curvo, chiaro) l'alfa scende come nelle foto del sito: niente gradino chiaro sotto la bottiglia
    al = np.where(nucleo, 1.0, np.clip(d / 40, 0, 1))  # il filo del bordo sfuma, niente alone bianco sui fondi scuri
    sotto = np.arange(H)[:, None] > yb
    al = np.where(sotto, np.clip(d / 255 * 2.4, 0, 0.5), al)  # il riflesso
    al = np.where(fondo & ~sotto, np.clip(d / 255 * 2.4, 0, 0.35), al)
    col = np.where(al[..., None] > 0.01, (a - (1 - al[..., None]) * 255) / np.maximum(al[..., None], 0.01), 0)  # il colore senza il bianco mescolato
    im = Image.fromarray(np.dstack([np.clip(col, 0, 255), al * 255]).astype(np.uint8), 'RGBA')
    s = (BASE - TOP) / (yb - top); xs = np.nonzero(dentro[top:yb].any(0))[0]; cx = (xs.min() + xs.max()) / 2
    im = im.resize((round(W * s), round(H * s)), Image.LANCZOS)
    tela = Image.new('RGBA', (W0, H0), (0, 0, 0, 0)); tela.paste(im, (round(W0 / 2 - cx * s), round(TOP - top * s)))  # la tela è vuota: si copia, fuori dai bordi si taglia
    tela.save(f'assets/bottles/{nome}.webp', quality=90, method=6)
    print(nome, 'tappo', top, 'vetro', yb, 'scala', round(s, 3))


if __name__ == '__main__':
    args = sys.argv[1:]
    assert args and len(args) % 2 == 0, __doc__
    for i in range(0, len(args), 2): scontorna(args[i], args[i + 1])
