"""moderna-g: dalla finestra del palazzo si entra in una stanza che non esiste, e in fondo alla stanza un arco dà sul quadro dopo.
La parete di fondo con l'arco la dipinge l'AI (Flux Fill su Comfy Cloud, a pagamento), poi tools/dipingi.py la ripassa con i suoi pennelli.
Il resto della stanza è buio, come una stanza vista da fuori in pieno giorno: la parete di fondo allungata verso i bordi e scurita. Senza AI: lasciata libera di riempire uno spazio grande, l'AI dipinge un'illustrazione per conto suo (persiane, sedie, cornici, firme).
Fuori dalla finestra del palazzo resta sempre il quadro vero: il confine fra quadro e stanza è il bordo della finestra.
  python -I tools/ponte_ai.py tela feudo 4      tools/ponti/feudo-4.png, alfa 0 dove dipinge l'AI: tutto tranne il quadro dopo
  node tools/comfy_fill.mjs tools/ponti/feudo-4.png tools/ponti/feudo-4-fatta.png tools/ponti/feudo-4.txt
  python -I tools/ponte_ai.py monta feudo       scrive feudo-z1..z4 e feudo-g (con -m)
p e z in js/moderna-f.js vanno ricopiati da geometria() di tools/dipingi_porte.py. Le prove scartate del 6 nov sono in tools/ponti/finestra/."""
import sys, os, math
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter as blur
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dipingi_porte import geometria, dipingi, salva, apertura, AREA, Q, SALE

D = 'tools/ponti/'
W, H = 1408, 972  # per Flux Fill: circa 1,4 megapixel con la forma del quadro
FINESTRA = {'feudo': 3}  # il livello in cui si guarda nella finestra del palazzo: dentro la stanza buia. Quelli dopo sono la parete di fondo fatta dall'AI
COPRI = {'feudo': [(0, 0.92, 0.15, 1), (0.83, 0.92, 1, 1)]}  # zone dell'immagine AI da coprire col colore attorno, in frazioni [x0, y0, x1, y1]. feudo: due firme inventate negli angoli in basso


def a_im(a):
    return Image.fromarray((np.clip(a, 0, 1) * 255 + 0.5).astype(np.uint8))


def a_arr(im, size=None):
    return np.asarray(im.resize(size, Image.LANCZOS) if size else im, dtype=np.float32) / 255


def taglia(A, box, size):
    x, y, w, h = box
    return a_arr(A.resize(size, Image.LANCZOS, box=(x * A.width, y * A.height, (x + w) * A.width, (y + h) * A.height)))


def pixel(box, ins, size):
    "il riquadro ins (frazioni del quadro) in pixel di una tela grande size che mostra box"
    x, y, w, h = box
    return (round((ins[0] - x) / w * size[0]), round((ins[1] - y) / h * size[1]), round((ins[0] + ins[2] - x) / w * size[0]), round((ins[1] + ins[3] - y) / h * size[1]))


def buco(nome, box, size):
    "1 dentro la finestra del palazzo, nella tela grande size che mostra box"
    A, _, rect, _, forma = geometria(nome)
    yy, xx = np.mgrid[0:size[1], 0:size[0]].astype(np.float32)
    return apertura(box[0] + (xx + 0.5) / size[0] * box[2], box[1] + (yy + 0.5) / size[1] * box[3], rect, forma, A.width / A.height, 0.2)  # 0,2: i bordi quasi dritti, da finestra; mossi sembra una macchia


def allunga(F, box, ins, size):
    "F messo nel riquadro ins della tela che mostra box; fuori dal riquadro si ripete il suo bordo. Restituisce anche quanto ogni punto è lontano dal riquadro, in sue larghezze"
    x0, y0, x1, y1 = pixel(box, ins, size)
    F = a_arr(a_im(F), (x1 - x0, y1 - y0))
    yy, xx = np.mgrid[0:size[1], 0:size[0]]
    lontano = np.hypot(np.maximum(np.maximum(x0 - xx, xx - x1), 0) / (x1 - x0), np.maximum(np.maximum(y0 - yy, yy - y1), 0) / (y1 - y0))
    return F[np.clip(yy - y0, 3, y1 - y0 - 4), np.clip(xx - x0, 3, x1 - x0 - 4)], lontano  # 3: l'ultima riga dell'AI è spesso una linea scura


def tela(nome, j):
    "per l'AI: il livello j col quadro dopo al centro, alfa 0 dove deve dipingere"
    A, B, rect, liv, _ = geometria(nome)
    assert j == len(liv), 'l\'AI fa solo la parete di fondo'
    t = taglia(A, liv[j - 1], (W, H))
    x0, y0, x1, y1 = pixel(liv[j - 1], rect, (W, H))
    t[y0:y1, x0:x1] = a_arr(B, (x1 - x0, y1 - y0))
    yy, xx = np.mgrid[0:H, 0:W]
    m = (x1 - x0) * 0.02  # l'AI ridipinge anche un filo del quadro, così non resta uno spigolo
    a = ((xx > x0 + m) & (xx < x1 - m) & (yy > y0 + m) & (yy < y1 - m)).astype(np.float32)
    a_im(np.dstack([t, a])).save(f'{D}{nome}-{j}.png')
    a_im(t * a[..., None] + (1 - a[..., None]) * np.array([1, 0, 1])).save(f'{D}{nome}-{j}-vista.jpg', quality=85)
    print(f'{nome}-{j}: l\'AI dipinge il {(1 - a).mean() * 100:.0f}%')


def misura(A, box):
    q = (box[2] * A.width) / (box[3] * A.height)
    w = round(math.sqrt(AREA * q))
    return w, round(w / q)


def fatta(nome, j):
    "l'immagine dell'AI del livello j, con le zone COPRI riempite dal colore attorno"
    s = a_arr(Image.open(f'{D}{nome}-{j}-fatta.png').convert('RGB'))
    h_, w_ = s.shape[:2]
    m = np.zeros((h_, w_), np.float32)
    for a0, b0, a1, b1 in COPRI.get(nome, []):
        m[round(b0 * h_):round(b1 * h_), round(a0 * w_):round(a1 * w_)] = 1
    if m.any():
        resto = blur(1 - m, 45)[..., None]
        colore = blur(s * (1 - m)[..., None], (45, 45, 0)) / np.maximum(resto, 1e-6)
        m = blur(m, 4)[..., None]
        s = s * (1 - m) + colore * m
    return s


def luce(nome, box, size):
    "quanta luce c'è nella stanza: piena attorno all'arco in fondo, poi sempre più buio. Uguale a ogni livello, misurata sul quadro: così quando arriva il livello dopo non compare un riquadro più chiaro"
    _, _, rect, liv, _ = geometria(nome)
    c, m = liv[FINESTRA[nome]], (rect[0] + rect[2] / 2, rect[1] + rect[3] / 2)
    yy, xx = np.mgrid[0:size[1], 0:size[0]].astype(np.float32)
    r = np.hypot((box[0] + (xx + 0.5) / size[0] * box[2] - m[0]) / (c[2] / 2), (box[1] + (yy + 0.5) / size[1] * box[3] - m[1]) / (c[3] / 2))
    return (0.22 + 0.78 * np.exp(-(np.maximum(r - 0.7, 0) / 0.8) ** 2))[..., None]


def stanza(nome):
    "il livello FINESTRA: il quadro vero, e dentro la finestra la stanza: al centro la parete di fondo, attorno la stessa allungata, e sempre più buio"
    A, _, _, liv, _ = geometria(nome)
    j = FINESTRA[nome]
    su, lontano = allunga(fatta(nome, j + 1), liv[j - 1], liv[j], (W, H))
    su = su + (blur(su, (25, 25, 0)) - su) * np.clip(lontano * 12, 0, 1)[..., None]  # il bordo ripetuto fa righe: fuori dalla parete di fondo si sfoca
    su = su * luce(nome, liv[j - 1], (W, H))
    M = buco(nome, liv[j - 1], (W, H))[..., None]
    return taglia(A, liv[j - 1], (W, H)) * (1 - M) + su * M


def finestra(nome, box, size, S):
    "il quadro vero visto in box, con dentro la finestra del palazzo la stanza S (il livello FINESTRA). Restituisce anche il peso"
    A, _, _, liv, _ = geometria(nome)
    su, _ = allunga(S, box, liv[FINESTRA[nome] - 1], size)  # la finestra è più alta del livello FINESTRA: in cima e in fondo si allunga il suo bordo, già buio
    M = buco(nome, box, size)[..., None]
    return taglia(A, box, size) * (1 - M) + su * M, M[..., 0]


def monta(nome):
    A, B, rect, liv, _ = geometria(nome)
    for j in range(FINESTRA[nome] + 1, len(liv) + 1):
        salva(dipingi(a_arr(a_im(fatta(nome, j) * luce(nome, liv[j - 1], (W, H))), misura(A, liv[j - 1]))), f'{nome}-z{j}')
        print('  fatto', nome, j, flush=True)
    S = stanza(nome)
    a_im(S).save(f'{D}{nome}-{FINESTRA[nome]}-stanza.jpg', quality=90)
    salva(dipingi(a_arr(a_im(S), misura(A, liv[FINESTRA[nome] - 1]))), f'{nome}-z{FINESTRA[nome]}')
    print('  fatto', nome, FINESTRA[nome], flush=True)
    for j in range(FINESTRA[nome] - 1, 0, -1):
        salva(dipingi(finestra(nome, liv[j - 1], misura(A, liv[j - 1]), S)[0]), f'{nome}-z{j}')
        print('  fatto', nome, j, flush=True)
    # a riposo: il quadro vero; dentro la finestra la stanza, ridipinta coi pennelli del quadro
    (cx, cy), (aw, ah) = SALE[nome][1], SALE[nome][4]  # centro e misure della finestra vera
    X0, Y0, X1, Y1 = (round(v) for v in ((cx - aw) * A.width, (cy - ah) * A.height, (cx + aw) * A.width, (cy + ah) * A.height))
    size, rb = (X1 - X0, Y1 - Y0), (X0 / A.width, Y0 / A.height, (X1 - X0) / A.width, (Y1 - Y0) / A.height)
    t, M = finestra(nome, rb, size, S)
    d = dipingi(t, k=math.sqrt(A.width * A.height) / 2493)
    O = a_arr(A)
    G = blur(np.clip(M * 1.3, 0, 1), 1.5)[..., None]
    O[Y0:Y1, X0:X1] = O[Y0:Y1, X0:X1] * (1 - G) + d * G
    im = a_im(O)
    im.save(f'{Q}{nome}-g.webp', quality=88, method=6)
    im.resize(Image.open(f'{Q}{nome}-m.webp').size, Image.LANCZOS).save(f'{Q}{nome}-g-m.webp', quality=86, method=6)
    print('  fatto', nome, 0, flush=True)


if __name__ == '__main__':
    cosa, nome = sys.argv[1], sys.argv[2]
    tela(nome, int(sys.argv[3])) if cosa == 'tela' else monta(nome)
