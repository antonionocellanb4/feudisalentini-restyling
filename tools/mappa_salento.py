"""La mappa del Salento per company.html (20 nov 2026, terzo mood stile azienda): la costa vera dell'Italia del sud, da Natural Earth 1:10m (world-atlas@2.0.2,
land-10m.json, scaricato a parte: https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/land-10m.json), ritagliata attorno al Salento e proiettata in chilometri
(equirettangolare centrata a 40,3 gradi nord: a questa scala la differenza da una proiezione conforme non si vede). Scrive js/company-mappa.js:
window.FS_MAPPA = { d: il tracciato della terra, largo e vicino: le due inquadrature (x, y, larghezza, altezza in km), luoghi: le città con le coordinate vere }.
Uso: python -I tools/mappa_salento.py <percorso di land-10m.json>"""
import json, math, sys
from pathlib import Path

R = Path(__file__).resolve().parent.parent
LAT0, KM = 40.3, 111.32  # centro della proiezione, chilometri per grado
TAGLIO = (13.2, 37.6, 19.6, 42.4)  # lon e lat minime e massime del ritaglio: abbastanza per l'inquadratura larga (Calabria, Basilicata, Puglia)
# le città, coordinate dei comuni (Wikipedia); Leporano è la cantina
LUOGHI = [('Leporano', 40.3833, 17.3333, 'casa'), ('Taranto', 40.4644, 17.2470, 'citta'), ('Manduria', 40.4000, 17.6333, 'citta'),
          ('Lecce', 40.3520, 18.1691, 'citta'), ('Brindisi', 40.6383, 17.9458, 'citta'), ('Gallipoli', 40.0556, 17.9925, 'citta'),
          ('Mar Ionio', 39.95, 17.25, 'mare'), ('Mare Adriatico', 40.82, 18.45, 'mare')]


def xy(lon, lat):
    return ((lon - 17.3) * math.cos(math.radians(LAT0)) * KM, (LAT0 - lat) * KM)


def anelli(topo):
    sx, sy = topo['transform']['scale']; tx, ty = topo['transform']['translate']
    archi = []
    for a in topo['arcs']:
        x = y = 0; pts = []
        for dx, dy in a:
            x += dx; y += dy; pts.append((x * sx + tx, y * sy + ty))
        archi.append(pts)
    def arco(i):
        return archi[i] if i >= 0 else archi[~i][::-1]
    for g in topo['objects']['land']['geometries']:
        poligoni = g['arcs'] if g['type'] == 'MultiPolygon' else [g['arcs']]
        for pol in poligoni:
            for anello in pol:
                pts = []
                for i in anello:
                    p = arco(i); pts.extend(p[1:] if pts else p)
                yield pts


def ritaglia(pts, x0, y0, x1, y1):
    """Sutherland-Hodgman contro il rettangolo del ritaglio (lon/lat)"""
    def taglia(pts, dentro, incrocio):
        out = []
        for i, b in enumerate(pts):
            a = pts[i - 1]
            if dentro(b):
                if not dentro(a): out.append(incrocio(a, b))
                out.append(b)
            elif dentro(a): out.append(incrocio(a, b))
        return out
    def ix(a, b, x): t = (x - a[0]) / (b[0] - a[0]); return (x, a[1] + t * (b[1] - a[1]))
    def iy(a, b, y): t = (y - a[1]) / (b[1] - a[1]); return (a[0] + t * (b[0] - a[0]), y)
    for dentro, incrocio in ((lambda p: p[0] >= x0, lambda a, b: ix(a, b, x0)), (lambda p: p[0] <= x1, lambda a, b: ix(a, b, x1)),
                             (lambda p: p[1] >= y0, lambda a, b: iy(a, b, y0)), (lambda p: p[1] <= y1, lambda a, b: iy(a, b, y1))):
        pts = taglia(pts, dentro, incrocio)
        if not pts: break
    return pts


def main():
    topo = json.loads(Path(sys.argv[1]).read_text(encoding='utf-8'))
    pezzi = []
    for pts in anelli(topo):
        c = ritaglia(pts, *TAGLIO)
        if len(c) < 3: continue
        q = [xy(lon, lat) for lon, lat in c]
        s = []  # via i punti più vicini di 0,4 km al precedente: alla misura della pagina non si vedono
        for p in q:
            if not s or math.dist(p, s[-1]) >= 0.4: s.append(p)
        if len(s) >= 3: pezzi.append('M' + 'L'.join(f'{x:.1f} {y:.1f}' for x, y in s) + 'Z')
    d = ''.join(pezzi)
    assert 'M' in d, 'nessuna terra nel ritaglio'
    luoghi = [{'n': n, 'x': round(xy(lon, lat)[0], 1), 'y': round(xy(lon, lat)[1], 1), 't': t} for n, lat, lon, t in LUOGHI]
    lep = luoghi[0]
    assert -10 < lep['x'] < 10 and -15 < lep['y'] < 5, lep  # Leporano sta vicino al centro della proiezione
    # le inquadrature: larga (il sud Italia, il Salento è il tacco) e vicina (il Salento, con Leporano poco a sinistra del centro)
    a, b = xy(14.6, 41.5), xy(19.2, 38.4); c, e = xy(16.75, 40.95), xy(18.65, 39.7)
    out = {'d': d, 'largo': [round(a[0]), round(a[1]), round(b[0] - a[0]), round(b[1] - a[1])], 'vicino': [round(c[0]), round(c[1]), round(e[0] - c[0]), round(e[1] - c[1])], 'luoghi': luoghi}
    testa = ('/* La mappa del Salento di company.html: la costa vera da Natural Earth 1:10m (world-atlas@2.0.2, land-10m), ritagliata e proiettata in chilometri da\n'
             '   tools/mappa_salento.py, che scrive questo file: non toccarlo a mano. d: la terra; largo e vicino: le due inquadrature (x, y, larghezza, altezza); luoghi: le città */\n')
    (R / 'js' / 'company-mappa.js').write_text(testa + 'window.FS_MAPPA = ' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n', encoding='utf-8')
    print('js/company-mappa.js', len(d) // 1024, 'KB di tracciato,', d.count('M'), 'pezzi di terra')


if __name__ == '__main__':
    main()
