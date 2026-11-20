"""Dalla foto ritagliata di una bottiglia ai pezzi per mostrarla in 3D (js/bottiglia-3d-kit.js): il profilo da far girare attorno all'asse e l'etichetta srotolata.
   python -I tools/bottiglia_3d.py assets/bottles/primitivo53.webp assets/3d/primitivo53 --etichetta 457 792 --curva 18 8 --capsula 228 --castello 171 198
   python -I tools/bottiglia_3d.py assets/bottles/marpiccolo.webp assets/3d/marpiccolo --etichetta 637 892 --lati 229.5 425.5 --metallo no --capsula 249 --castello 193 227 --vetro 590 632 --vuoto 256 288 --livello 294
   python -I tools/bottiglia_3d.py assets/bottles/3CUORI.webp assets/3d/tre-cuori --etichetta 656 894 --lati 223.5 425.5 --metallo oro --capsula 250 --castello 208 232 --vetro 600 650 --vuoto 256 289 --livello 294
   python -I tools/bottiglia_3d.py assets/bottles/philia.webp assets/3d/philia --etichetta 449 823 --curva 5 9 --metallo no --capsula 230 --capsula-metallo --fascetta 172 230
   python -I tools/bottiglia_3d.py assets/bottles/terraprimitivo.webp assets/3d/terra-primitivo --etichetta 438 760 --curva 1 3 --metallo oro --capsula 243 --castello 185 213
   python -I tools/bottiglia_3d.py assets/bottles/negro125-1.webp assets/3d/125-primitivo --etichetta 451 801 --curva 2 8 --metallo no --capsula 240 --castello 197 222
   19 nov, i vini delle foto nuove ("se c'è da fare altre bottiglie in 3D falle"): le due scure con le misure della loro linea, le due chiare poi con la pelle di Blender (--velo):
   python -I tools/bottiglia_3d.py assets/bottles/negroamaro.webp assets/3d/terra-negroamaro --etichetta 438 760 --curva 1 3 --metallo oro --capsula 243 --castello 185 213
   python -I tools/bottiglia_3d.py assets/bottles/negro125.webp assets/3d/125-negroamaro --etichetta 451 801 --curva 2 8 --metallo no --capsula 240 --castello 197 222
   python -I tools/bottiglia_3d.py assets/bottles/terrarosato.webp assets/3d/terra-rosato --etichetta 432 777 --curva 1 3 --metallo rame --lamina 0.27 --capsula 237 --capsula-metallo --vetro 355 420 --vuoto 242 272 --livello 279
   python -I tools/bottiglia_3d.py assets/bottles/biook-2.webp assets/3d/organic-bianco --etichetta 449 868 --curva 2 8 --metallo no --capsula 243 --castello 200 222 --vetro 350 430 --vuoto 248 270 --livello 275
   Le misure si prendono sulla foto, in righe, al centro della bottiglia: dove comincia e finisce l'etichetta, dove finisce la capsula, dove sta il castello sulla capsula.
   --curva: di quante righe il bordo alto dell'etichetta scende, e quello basso sale, arrivando ai fianchi. È la prospettiva della foto (scattata da vicino): da lì si ricavano
   distanza e altezza della macchina, e l'etichetta si srotola dritta fino al bordo. Senza --curva la foto si prende come vista da lontanissimo. La foto non viene toccata.
   --lati: per le etichette che non girano tutto il fronte (18 nov, i bianchi e i rosati), le colonne dei bordi sinistro e destro a metà etichetta; senza, l'etichetta va fino a VISTA.
   --metallo: la lamina che brilla (rame come Collezione 53, oro come le X di Tre Cuori, no). La carta chiara o scura si riconosce da sola.
   --lamina F: la lamina sta solo in cima all'etichetta, fino alla frazione F della sua altezza (19 nov, Terra Rosato: sulla carta chiara l'ombra calda del fianco sembrava rame).
   --vetro, --vuoto, --livello: bottiglia di vetro chiaro. Il colore del vino si legge sulla foto, colonna per colonna, in un tratto di corpo pulito (--vetro) e nel collo vuoto (--vuoto),
   e diventa un velo: per ogni distanza dall'asse il colore più trasparente che sul bianco dà quello della foto (la pagina è bianca), così dietro si vede quello che c'è.
   --capsula-metallo: capsula di stagnola (Philia). --fascetta: le righe della fascetta di stato sul collo (DOCG), srotolata e chiusa tutto attorno col suo colore.
   19 nov, Philia: "da questo vino togliamo questa etichetta": dopo averlo rifatto, togliere "fascetta" da philia.json (le righe servono ancora a leggere il colore della capsula)
   e aggiungere "castello":{"quota":0.85,"alto":0.031} ("il logo oro di Feudi qui": in foto sulla capsula c'è la fascetta, il marchio d'oro l'ha chiesto lui).
   Scrive <uscita>.json (profilo: raggio e quota in altezze di bottiglia, dal fondo; quote vere di etichetta, capsula e castello; l'arco dell'etichetta; colori di capsula e castello),
   <uscita>-etichetta.webp (colore) e <uscita>-orm.webp (verde = ruvidezza, blu = metallo: i disegni in rame brillano, la carta no); col vetro chiaro nel json il velo
   (128 colori RGBA: i primi 64 il vino, poi il collo vuoto; da sinistra a destra la distanza dall'asse), con la fascetta <uscita>-fascetta.webp.
   L'etichetta si srotola da -VISTA a +VISTA gradi e lì finisce (17 nov: "le etichette finiscono qui, il pezzo in più non serve"): niente carta inventata ai lati.
   shortcut: una foto sola, quindi oltre VISTA e sul retro c'è solo vetro, e gli ultimi gradi sono sfocati (pixel schiacciati); con la grafica di stampa dell'etichetta si sostituisce il file."""
import argparse
import json

import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter, map_coordinates, uniform_filter1d

VISTA = 77  # gradi per lato: fin dove si prende la foto (il bordo della sagoma sta a circa 85)
TW, TH = 2048, 1024
PASSO = 4  # righe della foto fra un punto del profilo e il successivo
LUM = np.array([0.3, 0.59, 0.11], dtype=np.float32)

p = argparse.ArgumentParser()
p.add_argument('foto')
p.add_argument('uscita')
p.add_argument('--etichetta', nargs=2, type=float, required=True)
p.add_argument('--curva', nargs=2, type=float, default=[0, 0])
p.add_argument('--capsula', type=float, required=True)
p.add_argument('--castello', nargs=2, type=float)
p.add_argument('--lati', nargs=2, type=float)
p.add_argument('--metallo', choices=['rame', 'oro', 'no'], default='rame')
p.add_argument('--lamina', type=float)
p.add_argument('--vetro', nargs=2, type=float)
p.add_argument('--vuoto', nargs=2, type=float)
p.add_argument('--livello', type=float)
p.add_argument('--capsula-metallo', action='store_true')
p.add_argument('--fascetta', nargs=2, type=float)
A = p.parse_args()
(e0, e1), (cala, sale), cap = A.etichetta, A.curva, A.capsula
assert not A.vetro or A.livello, 'col vetro chiaro serve --livello, la riga dove finisce il vino'

a = np.asarray(Image.open(A.foto).convert('RGBA')).astype(np.float32)
H, W = a.shape[:2]
alfa = a[..., 3] / 255
largo = alfa.sum(axis=1)  # larghezza riga per riga, coi mezzi pixel del bordo
righe = np.where((alfa > 0.5).sum(axis=1) > 8)[0]  # solo i pixel pieni: sotto la bottiglia c'è il riflesso semitrasparente del catalogo, che non è bottiglia
y0, yb = int(righe[0]), int(righe[-1])
assert y0 < cap < e0 < e1 < yb, 'le righe di capsula ed etichetta devono stare dentro la bottiglia, in ordine'
xs = np.arange(W)
centro = (alfa * xs).sum(axis=1) / np.maximum(largo, 1e-6)
r = uniform_filter1d(largo / 2, 5)
R = lambda y: float(np.interp(y, np.arange(H), r))
esa = lambda c: '#%02x%02x%02x' % tuple(int(round(float(v))) for v in c)

# ---- la prospettiva della foto: D distanza della macchina dall'asse (in pixel), occhio la riga alla sua altezza. Un punto del fronte sta più vicino di D e in foto viene più grande:
#      vera(riga al centro, raggio) la riporta alla scala della sagoma, che sta a distanza D
if cala or sale:
    D = (e1 - e0) / (cala / R(e0 + cala) + sale / R(e1 - sale))
    occhio = e0 + cala * D / R(e0 + cala)
    vera = lambda y, raggio: occhio + (y - occhio) * (D - raggio) / D
else:
    D, occhio, vera = None, None, lambda y, raggio: y
t0, t1 = e0 + cala, e1 - sale  # le righe vere dei bordi dell'etichetta: quelle che si leggono ai fianchi

# ---- il profilo, dal fondo alla cima. In foto il fondo è arrotondato dalla prospettiva: si segue la sagoma finché è larga almeno nove decimi del corpo, poi tallone e fondo piatto
corpo = float(np.median(r[int(e1):yb - 40]))
yt = max(y for y in range(int(e1), yb) if r[y] >= 0.9 * corpo)
s = 1 / (yb - y0)
q = lambda y: (yb - y) * s  # quota dal fondo, in altezze di bottiglia
rt = float(r[yt])
punti = [[0, 0], [rt * 0.8 * s, 0]]
for k in (0.35, 0.7, 1):  # il tallone: un quarto di ellisse fino alla sagoma
    ang = k * np.pi / 2
    punti.append([(rt * 0.8 + rt * 0.2 * np.sin(ang)) * s, q(yt) * (1 - np.cos(ang))])
for y in range(yt - PASSO, y0 + 1, -PASSO):
    punti.append([float(r[y]) * s, q(y)])
punti.append([0, 1])
punti = [[round(float(x), 5), round(float(y), 5)] for x, y in punti]
assert all(b[1] >= a_[1] for a_, b in zip(punti, punti[1:])), 'profilo: le quote devono salire'
assert all(pt[0] >= 0 for pt in punti)


def srotola(ya, yb_, ga, gb, tw, th):
    """La foto srotolata: per ogni colonna un angolo (da ga a gb gradi), per ogni riga una quota vera (da ya a yb_); da lì il punto della foto, con la prospettiva."""
    gradi = np.linspace(ga, gb, tw)
    vere = np.linspace(ya, yb_, th)
    rag = np.interp(vere, np.arange(H), r)[:, None]
    cx = np.interp(vere, np.arange(H), centro)[:, None]
    sen, cos = np.sin(np.radians(gradi))[None, :], np.cos(np.radians(gradi))[None, :]
    if D:
        den = D - rag * cos
        X, Y = cx + D * rag * sen / den, occhio + D * (vere[:, None] - occhio) / den
    else:
        X, Y = cx + rag * sen, np.repeat(vere[:, None], tw, axis=1)
    return np.stack([map_coordinates(a[..., c], [Y, X], order=1) for c in range(3)], axis=-1)


def spiana(rgb, chiara=None):
    """Le fasce verticali di luce e ombra della foto (riflessi dello studio) girerebbero con la bottiglia: ogni colonna torna al tono medio della carta.
       Carta scura: il riferimento sono i pixel più scuri (non rame, non scritte); carta chiara: i più chiari (non disegni). Rende anche il colore della carta."""
    lum = rgb @ LUM
    chiara = np.median(lum) > 128 if chiara is None else chiara
    scegli = (lambda v: v > np.percentile(v, 40)) if chiara else (lambda v: v < np.percentile(v, 60))
    base = np.median(rgb[scegli(lum)], axis=0)
    med = np.array([np.median(lum[:, j][scegli(lum[:, j])]) for j in range(rgb.shape[1])])
    guad = np.clip(uniform_filter1d(float(base @ LUM) / np.maximum(med, 1), 31), 0.6, 1.7)
    return np.clip(rgb * guad[None, :, None], 0, 255), base


def angolo(x, y):
    """Il grado sul vetro di una colonna della foto alla riga y (per i bordi dell'etichetta), con la stessa prospettiva di srotola."""
    g = np.linspace(-89, 89, 3561)
    rag, cx = R(y), float(np.interp(y, np.arange(H), centro))
    sen, cos = np.sin(np.radians(g)), np.cos(np.radians(g))
    X = cx + (D * rag * sen / (D - rag * cos) if D else rag * sen)
    return float(np.interp(x, X, g))


# ---- l'etichetta srotolata, fino a VISTA o fino ai suoi bordi (un grado e mezzo dentro: sul bordo c'è il vetro)
if A.lati:
    ym = (e0 + e1) / 2
    ga, gb = angolo(A.lati[0], vera(ym, R(ym))) + 1.5, angolo(A.lati[1], vera(ym, R(ym))) - 1.5
    tw = 1024
else:
    ga, gb, tw = -VISTA, VISTA, TW
rgb, carta = spiana(srotola(t0 + 1.5, t1 - 1.5, ga, gb, tw, TH))  # un filo dentro i bordi: fuori c'è vetro
Rc, Gc, Bc = rgb[..., 0], rgb[..., 1], rgb[..., 2]
if A.metallo == 'rame':
    met = (Rc > 105) & (Rc - Bc > 30)  # chiaro e caldo: la lamina di rame
elif A.metallo == 'oro':
    met = (Rc > 150) & (Rc - Bc > 14) & (Gc - Bc > 10) & (Rc - Gc < 50)  # giallo caldo, anche pallido (la X di sinistra riflette la luce); il rosa dei cuori ha il verde sotto il blu e resta carta
else:
    met = np.zeros(Rc.shape, bool)
if A.lamina:
    met[int(met.shape[0] * A.lamina):] = False  # sotto la fascia è carta, anche dove l'ombra calda la fa sembrare rame
met = np.clip(gaussian_filter(met.astype(np.float32), 1.2), 0, 1)
orm = np.zeros(rgb.shape, dtype=np.float32)
orm[..., 1] = (0.86 - 0.5 * met) * 255
orm[..., 2] = met * 255
assert A.metallo == 'no' or met.mean() > 0.002, 'non trovo la lamina nell\'etichetta: soglie da rivedere per questa foto'
Image.fromarray(rgb.round().astype(np.uint8)).save(f'{A.uscita}-etichetta.webp', quality=90)
Image.fromarray(orm.round().astype(np.uint8)).save(f'{A.uscita}-orm.webp', quality=88)
dati = {'foto': A.foto.replace('\\', '/'), 'profilo': punti, 'etichetta': [round(q(t1 - 1.5), 5), round(q(t0 + 1.5), 5)], 'capsula': round(q(vera(cap, R(cap))), 5),
        'arco': round(gb - ga, 2), 'carta': esa(carta)}


def fronte(ya, yb_, u=0.4, salta=()):
    """I pixel della foto vicini al centro (entro u raggi), riga per riga, saltando le fasce date."""
    out = [a[y, int(centro[y] - u * r[y]):int(centro[y] + u * r[y]) + 1, :3] for y in range(int(ya), int(yb_)) if not any(f0 - 3 <= y <= f1 + 3 for f0, f1 in salta)]
    return np.concatenate(out)


# ---- capsula, castello e fascetta: i colori si leggono al centro della foto
fasce = [tuple(A.castello)] if A.castello else []
if A.fascetta:
    fasce.append(tuple(A.fascetta))
capsula = np.median(fronte(y0 + 15, cap - 3, salta=fasce), axis=0)  # sotto l'orlo del tappo, visto un po' dall'alto
dati['capsulaColore'], dati['capsulaMetallo'] = esa(capsula), A.capsula_metallo
if A.castello:
    c0, c1 = (vera(y, R(y)) for y in A.castello)
    px = fronte(*A.castello, u=0.5)
    segno = px[np.abs(px - capsula).sum(axis=1) > 60]  # il disegno del castello, non la capsula attorno
    col = np.median(segno, axis=0)
    dati['castello'] = {'quota': round(q((c0 + c1) / 2), 5), 'alto': round((c1 - c0) * s, 5), 'colore': esa(col),
                        'metallo': bool(col[0] - col[2] > 40 and col[1] - col[2] > 20)}  # dorato = lamina, altrimenti inchiostro
if A.fascetta:
    f0, f1 = (vera(y, R(y)) for y in A.fascetta)
    fr, fbase = spiana(srotola(f0 + 1, f1 - 1, -VISTA, VISTA, round(1024 * 2 * VISTA / 360), 256), chiara=True)  # la fascetta è carta chiara, anche se ai fianchi va in ombra
    tutta = np.empty((256, 1024, 3), np.float32)
    tutta[:] = fbase  # attorno al collo, dove la foto non arriva, la fascetta col suo colore
    k = (1024 - fr.shape[1]) // 2
    tutta[:, k:k + fr.shape[1]] = fr
    Image.fromarray(tutta.round().astype(np.uint8)).save(f'{A.uscita}-fascetta.webp', quality=90)
    dati['fascetta'] = [round(q(f1 - 1), 5), round(q(f0 + 1), 5)]

# ---- vetro chiaro: il colore della foto per ogni distanza dall'asse (-1 bordo sinistro, +1 destro), come velo sul bianco
if A.vetro:
    def velo(ya, yb_, n=64):
        us = np.linspace(-0.985, 0.985, n)
        ys = np.arange(int(ya), int(yb_) + 1)
        X = centro[ys][:, None] + us[None, :] * r[ys][:, None]
        Y = np.repeat(ys[:, None], n, axis=1).astype(np.float32)
        c = np.median(np.stack([map_coordinates(a[..., k], [Y, X], order=1) for k in range(3)], axis=-1), axis=0) / 255
        al = np.clip(1 - c.min(axis=1), 0.04, 1)  # il velo più trasparente che sul bianco dà lo stesso colore
        v = np.concatenate([np.clip((c - (1 - al[:, None])) / al[:, None], 0, 1), al[:, None]], axis=1)
        assert np.abs(v[:, :3] * v[:, 3:] + (1 - v[:, 3:]) - c).max() < 0.05, 'il velo sul bianco non ridà la foto'
        return v
    pieno = velo(*A.vetro)
    vuoto = velo(*A.vuoto) if A.vuoto else pieno
    dati['vetro'] = {'livello': round(q(A.livello), 5), 'velo': (np.concatenate([pieno, vuoto]) * 255).round().astype(int).tolist()}

json.dump(dati, open(f'{A.uscita}.json', 'w', encoding='utf-8'), separators=(',', ':'))
print(f'ok: {len(punti)} punti, corpo {corpo * s:.4f}, etichetta {dati["etichetta"]} arco {dati["arco"]} carta {dati["carta"]}, capsula da {dati["capsula"]} {dati["capsulaColore"]}, '
      f'castello {dati.get("castello")}, fascetta {dati.get("fascetta")}, livello {dati.get("vetro", {}).get("livello")}, lamina {met.mean():.3f}'
      + (f', macchina a {D:.0f} px ({D * s:.2f} altezze), occhio alla riga {occhio:.0f}' if D else ''))
