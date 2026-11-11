"""moderna-g: uno zoom infinito come lo Zoomquilt (zoomquilt.org). Un solo dipinto continuo, disegnato a più scale: il quadro dopo sta già dentro un dettaglio di quello prima (una finestra, una foglia, la foschia in fondo), piccolissimo e nitido.
uso: python -I tools/dipingi_porte.py [--prova] [nomi]   --prova scrive solo gli schizzi senza dipingere, in tools/shots/porte-<nome>-<livello>.jpg
Per ogni quadro scrive assets/quadri/<nome>-g.webp (il quadro con il quadro dopo nel dettaglio) e <nome>-z1.webp, -z2... (lo stesso punto visto da sempre più vicino, ridipinto da tools/dipingi.py a ogni scala, così i tocchi restano nitidi); le stesse con -m per il telefono. Stampa le righe per PORTE in js/moderna-f.js."""
import sys, os, math, subprocess, tempfile, concurrent.futures as cf
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter as blur

Q = 'assets/quadri/'
PASSO, AREA, RAPP_M = 3, 2048 * 1414, 0.5  # ogni livello è 3 volte più vicino del precedente
SALE = {
    # il quadro: (quello dopo, centro del dettaglio, larghezza del quadro dopo in frazioni, forma dell'apertura: più è alta più è squadrata; misure dell'apertura se è una cosa che c'è già nel quadro)
    'feudo': ('vigne', (0.534, 0.456), 0.004, 6, (0.021, 0.044)),  # una finestra vera del palazzo, stesse misure. Il quadro dopo è piccolo: è la finestra in fondo a una stanza (tools/ponte_ai.py)
    'vigne': ('terra', (0.437, 0.345), 0.022, 3.5),  # la foglia dorata
    'terra': ('campo', (0.225, 0.2), 0.02, 3),  # un varco nel filare
    'campo': ('mare', (0.505, 0.385), 0.035, 3),  # la foschia fra i filari
    'mare': ('tramonto', (0.55, 0.79), 0.025, 3),  # un cespuglio in primo piano
}


def apri(nome):
    return Image.open(f'{Q}{nome}.webp').convert('RGB')


def geometria(nome):
    dopo, (cx, cy), ow, forma, *mis = SALE[nome]
    A, B = apri(nome), apri(dopo)
    oh = ow * (A.width / A.height) * (B.height / B.width)
    rect = (cx - ow / 2, cy - oh / 2, ow, oh)  # dove sta tutto il quadro dopo, in frazioni del quadro
    # i livelli si stringono verso P, il punto che ha lo stesso posto nel quadro e nel riquadro finale: così ognuno contiene il seguente
    s_b = max(ow, oh) * 1.2
    px, py = (cx - s_b / 2) / (1 - s_b), (cy - s_b / 2) / (1 - s_b)
    livelli, s = [], 1 / PASSO
    while s > s_b * 1.2:
        livelli.append((px * (1 - s), py * (1 - s), s, s))
        s /= PASSO
    return A, B, rect, livelli, (forma, mis[0] if mis else None)


def apertura(X, Y, rect, forma, asp, mosso=1.0):
    """1 dentro l'apertura. Contiene sempre il riquadro del quadro dopo; il bordo è irregolare e uguale a ogni scala"""
    x0, y0, w, h = rect
    cx, cy = x0 + w / 2, y0 + h / 2
    forma, mis = forma
    m = 2 ** (1 / forma) * 1.03
    aw, ah = mis or (w * m, h * m)
    dx, dy = (X - cx) / (aw / 2), (Y - cy) / (ah / 2)
    d = (np.abs(dx) ** forma + np.abs(dy) ** forma) ** (1 / forma)
    an = np.arctan2(dy, dx)
    d = d + mosso * (0.035 * np.sin(an * 5 + 1) + 0.02 * np.sin(an * 11 + 2) + 0.012 * np.sin(an * 23 + 4)) - 0.067
    t = np.clip((1 - d) / 0.05, 0, 1)
    return t * t * (3 - 2 * t)


def schizzo(A, B, rect, forma, box, size):
    """il quadro visto in box [x, y, w, h], con il quadro dopo dentro l'apertura. Fuori dal suo riquadro del quadro dopo resta solo il colore: niente forme specchiate"""
    (bx, by, bw, bh), (W, H) = box, size
    fondo = np.asarray(A.resize(size, Image.LANCZOS, box=(bx * A.width, by * A.height, (bx + bw) * A.width, (by + bh) * A.height)), dtype=np.float32) / 255
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    X, Y = bx + (xx + 0.5) / W * bw, by + (yy + 0.5) / H * bh
    M = apertura(X, Y, rect, forma, A.width / A.height)
    x0, y0, w, h = rect
    iw, ih = max(4, round(w / bw * W)), max(4, round(h / bh * H))
    I = np.asarray(B.resize((iw, ih), Image.LANCZOS), dtype=np.float32) / 255
    def piega(v, n):
        v = np.mod(v, 2 * n)
        return np.where(v < n, v, 2 * n - 1 - v).astype(int)
    xf, yf = np.floor((X - x0) / w * iw), np.floor((Y - y0) / h * ih)
    xi, yi = piega(xf, iw), piega(yf, ih)
    sig = max(1, min(iw, ih) * 0.08)
    fuori = np.clip(np.maximum(np.maximum(-xf, xf - iw), np.maximum(-yf, yf - ih)) / (sig * 0.6), 0, 1)[..., None]
    scena = I[yi, xi] * (1 - fuori) + blur(I, (sig, sig, 0))[np.clip(yf, 0, ih - 1).astype(int), np.clip(xf, 0, iw - 1).astype(int)] * fuori
    return fondo * (1 - M[..., None]) + scena * M[..., None], M


def dipingi(a, k=None):
    """ridipinge con tools/dipingi.py. k: la grandezza dei pennelli, se non è quella della misura"""
    with tempfile.TemporaryDirectory() as d:
        p, o = os.path.join(d, 'a.png'), os.path.join(d, 'b.png')
        Image.fromarray((np.clip(a, 0, 1) * 255 + 0.5).astype(np.uint8)).save(p)
        env = dict(os.environ, DIP_K=str(k)) if k else None
        subprocess.run([sys.executable, '-I', 'tools/dipingi.py', 'nudo', p, o, str(a.shape[1])], check=True, env=env, stdout=subprocess.DEVNULL)
        return np.asarray(Image.open(o).convert('RGB'), dtype=np.float32) / 255


def salva(a, nome):
    im = Image.fromarray((np.clip(a, 0, 1) * 255 + 0.5).astype(np.uint8))
    im.save(f'{Q}{nome}.webp', quality=84, method=6)
    im.resize((round(im.width * RAPP_M), round(im.height * RAPP_M)), Image.LANCZOS).save(f'{Q}{nome}-m.webp', quality=80, method=6)


def livello(nome, j, box):
    A, B, rect, _, forma = geometria(nome)
    q = (box[2] * A.width) / (box[3] * A.height)  # il livello ha la forma del pezzo di quadro che mostra
    W = round(math.sqrt(AREA * q)); H = round(W / q)
    s, _ = schizzo(A, B, rect, forma, box, (W, H))
    if PROVA:
        Image.fromarray((np.clip(s, 0, 1) * 255).astype(np.uint8)).save(f'tools/shots/porte-{nome}-{j}.jpg', quality=85)
        return
    salva(dipingi(s), f'{nome}-z{j}')
    print('  fatto', nome, j, flush=True)


def riposo(nome):
    """il quadro a riposo: uguale all'originale, tranne l'apertura, ridipinta con i suoi stessi pennelli"""
    A, B, rect, _, forma = geometria(nome)
    x0, y0, w, h = rect
    lato = max(w * A.width, h * A.height) * 2.2
    bw, bh = lato / A.width, lato / A.height
    bx, by = max(0, x0 + w / 2 - bw / 2), max(0, y0 + h / 2 - bh / 2)
    W, H = round(lato), round(lato)
    s, M = schizzo(A, B, rect, forma, (bx, by, bw, bh), (W, H))
    if PROVA:
        Image.fromarray((np.clip(s, 0, 1) * 255).astype(np.uint8)).save(f'tools/shots/porte-{nome}-0.jpg', quality=85)
        return
    d = dipingi(s, k=math.sqrt(A.width * A.height) / 2493)
    O = np.asarray(A, dtype=np.float32) / 255
    y, x = round(by * A.height), round(bx * A.width)
    G = blur(np.clip(M * 1.6, 0, 1), 2.5)[..., None]
    O[y:y + H, x:x + W] = O[y:y + H, x:x + W] * (1 - G) + d * G
    im = Image.fromarray((O * 255 + 0.5).astype(np.uint8))
    im.save(f'{Q}{nome}-g.webp', quality=88, method=6)
    mob = Image.open(f'{Q}{nome}-m.webp')
    im.resize(mob.size, Image.LANCZOS).save(f'{Q}{nome}-g-m.webp', quality=86, method=6)
    print('  fatto', nome, 0, flush=True)


PROVA = '--prova' in sys.argv
if __name__ == '__main__':  # tools/ponte_ai.py ne usa le funzioni
    nomi = [a for a in sys.argv[1:] if not a.startswith('--')] or list(SALE)
    with cf.ThreadPoolExecutor(1 if PROVA else 4) as ex:
        fu = []
        for nome in nomi:
            fu.append(ex.submit(riposo, nome))
            for j, box in enumerate(geometria(nome)[3], 1):
                fu.append(ex.submit(livello, nome, j, box))
        for f in fu:
            f.result()
    for nome in nomi:
        _, _, r, liv, _ = geometria(nome)
        print(nome, 'p: [%.4f, %.4f, %.4f], z: %s' % (r[0], r[1], r[2], '[' + ', '.join('[%.4f, %.4f, %.4f, %.4f]' % z for z in liv) + ']'))
