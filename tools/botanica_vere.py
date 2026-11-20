"""Le piante VERE di Botanica (17 nov 2026), dal file Illustrator del cliente con le copertine delle sei collezioni ("qui trovi le grafiche vere per Botanica").
Prendono il posto di quelle provvisorie di tools/botanica.py (tavole di pubblico dominio): stessi nomi in assets/botanica, nere con la trasparenza, il colore lo dà il css.

uso: python -I tools/botanica_vere.py <all.ai> [prova]
     scrive assets/botanica/<pianta>.webp e stampa le proporzioni da riportare in js/dati-bf.js (ar = larghezza / altezza); con "prova" fa anche tools/shots/botanica-vere.jpg

Com'è fatto il file: 12 fogli da 1080 x 1350 (copertina e testo di ogni collezione). In ogni copertina la pianta è un gruppo di tracciati neri in moltiplica,
ritagliato dalla sagoma della targa: qui si ridisegna il gruppo SENZA il ritaglio, quindi la pianta intera (due rami specchiati che si incrociano alla base).
Il fico d'India degli Internazionali non è a tracciati: è un'immagine a retino a 1 bit (bianco = inchiostro), usata più volte ruotata. Si prende quella, intera.
Serve PyMuPDF (pymupdf) e Pillow. Il file è un pdf compatibile: non serve Illustrator."""
import io, sys
from pathlib import Path
import pymupdf
from PIL import Image, ImageChops

R = Path(__file__).resolve().parent.parent
OUT = R / 'assets' / 'botanica'
ALTO = 1500  # px, come le maschere di prima
FOGLI = {'ginepro': 0, 'menta': 2, 'ulivo': 4, 'cappero': 5, 'camomilla': 10}  # la copertina di ogni collezione: Luxury, Lounge Bar, Classic, Terra, Organic
FICO = 8  # la copertina International: lì la pianta è l'immagine


def gruppo_della_targa(p):
    """I tracciati neri del gruppo che viene subito dopo il ritaglio a sagoma (l'unico ritaglio fatto di tante curve).
    Nello stesso foglio ci sono anche i gruppi dei fogli vicini, ognuno col suo ritaglio fuori dal foglio: quelli non si prendono."""
    preso, curve, dentro = [], 0, False
    for x in p.get_drawings(extended=True):
        if x['type'] == 'clip':
            curve = len(x.get('items', []))
        elif x['type'] == 'group':
            if dentro and preso:
                break
            dentro = curve > 10
        elif dentro and x['type'] in ('f', 'fs') and x.get('fill') and max(x['fill'][:3]) < .02:
            preso.append(x)
    return preso


def ridisegna(tr):
    box = pymupdf.Rect()
    for x in tr:
        box |= x['rect']
    foglio = pymupdf.open().new_page(width=box.width, height=box.height)
    sh, dx, dy = foglio.new_shape(), -box.x0, -box.y0
    P = lambda a: pymupdf.Point(a.x + dx, a.y + dy)
    for x in tr:
        for it in x['items']:
            if it[0] == 'l': sh.draw_line(P(it[1]), P(it[2]))
            elif it[0] == 'c': sh.draw_bezier(P(it[1]), P(it[2]), P(it[3]), P(it[4]))
            elif it[0] == 're': sh.draw_rect(pymupdf.Rect(it[1].x0 + dx, it[1].y0 + dy, it[1].x1 + dx, it[1].y1 + dy))
            elif it[0] == 'qu': sh.draw_quad(pymupdf.Quad(*[P(a) for a in it[1]]))
        sh.finish(fill=(0, 0, 0), color=None, even_odd=bool(x.get('even_odd')), closePath=True)
    sh.commit()
    z = ALTO / box.height
    pm = foglio.get_pixmap(matrix=pymupdf.Matrix(z, z), colorspace=pymupdf.csGRAY, alpha=False)
    return ImageChops.invert(Image.frombytes('L', (pm.width, pm.height), pm.samples))  # bianco = inchiostro


def salva(nome, inchiostro):
    inchiostro = inchiostro.crop(inchiostro.getbbox())  # via i margini vuoti: la pianta tocca i quattro lati, così poggia dove la si mette
    inchiostro = inchiostro.point(lambda v: round(v / 85) * 85)  # quattro livelli di trasparenza: i bordi restano morbidi e il file pesa un terzo (373 KB -> 116 la menta)
    m = Image.new('RGBA', inchiostro.size, (0, 0, 0, 0))
    m.putalpha(inchiostro)
    m.save(OUT / f'{nome}.webp', lossless=True, quality=100, method=6)
    print(f"{nome:10} {m.width} x {m.height}  ar {m.width / m.height:.3f}  {(OUT / f'{nome}.webp').stat().st_size // 1024} KB")
    return m


def main():
    d = pymupdf.open(sys.argv[1], filetype='pdf')
    assert d.page_count == 12, f'attesi 12 fogli, trovati {d.page_count}: il file è cambiato, ricontrollare FOGLI'
    fatte = {}
    for nome, n in FOGLI.items():
        tr = gruppo_della_targa(d[n])
        assert len(tr) > 300, f'{nome}: nel foglio {n} il gruppo della targa ha solo {len(tr)} tracciati'
        fatte[nome] = salva(nome, ridisegna(tr))
    imgs = {im[0] for im in d[FICO].get_images(full=True)}
    assert len(imgs) == 1, f'fico: attesa una sola immagine nel foglio {FICO}, trovate {len(imgs)}'
    im = Image.open(io.BytesIO(d.extract_image(imgs.pop())['image'])).convert('L')  # è una maschera a 1 bit: estratta così, il bianco è l'inchiostro
    fatte['fico'] = salva('fico', im)  # alla sua misura (1100 px): ingrandire un retino a 1 bit lo sporca e lo fa pesare dieci volte
    if 'prova' in sys.argv[2:]:  # tutte in fila su un colore, per guardarle
        L = 560
        f = Image.new('RGB', (L * len(fatte), int(L * 1.3)), '#bf5138')
        for i, m in enumerate(fatte.values()):
            m = m.copy(); m.thumbnail((L - 60, int(L * 1.3) - 60))
            tinta = Image.new('RGB', m.size, '#732e1e')
            f.paste(tinta, (i * L + (L - m.width) // 2, int(L * 1.3) - 30 - m.height), m)
        (R / 'tools' / 'shots').mkdir(exist_ok=True); f.save(R / 'tools' / 'shots' / 'botanica-vere.jpg', quality=88); print('tools/shots/botanica-vere.jpg')


if __name__ == '__main__':
    main()
