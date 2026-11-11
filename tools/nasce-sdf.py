"""Converte gli SDF 3D di PubChem (V2000) in JSON per la scena #nasce.
Uso: python -I tools/nasce-sdf.py <cartella-sdf> <cartella-uscita>
Ogni file <nome>.sdf diventa <nome>.json: {"cid", "formula", "atoms": [[el, x, y, z]], "bonds": [[a, b, ordine]]}
con le coordinate in angstrom centrate sul baricentro. Legge solo il primo record del file."""
import json, sys, pathlib
from collections import Counter


def parse(text):
    lines = text.splitlines()
    cid = lines[0].strip()
    na, nb = int(lines[3][0:3]), int(lines[3][3:6])
    atoms = []
    for ln in lines[4:4 + na]:
        atoms.append([ln[31:34].strip(), float(ln[0:10]), float(ln[10:20]), float(ln[20:30])])
    bonds = []
    for ln in lines[4 + na:4 + na + nb]:
        bonds.append([int(ln[0:3]) - 1, int(ln[3:6]) - 1, int(ln[6:9])])
    cx, cy, cz = (sum(a[i] for a in atoms) / na for i in (1, 2, 3))
    atoms = [[a[0], round(a[1] - cx, 3), round(a[2] - cy, 3), round(a[3] - cz, 3)] for a in atoms]
    count = Counter(a[0] for a in atoms)
    order = ['C', 'H'] + sorted(k for k in count if k not in ('C', 'H'))  # ordine di Hill
    formula = ''.join(k + (str(count[k]) if count[k] > 1 else '') for k in order if k in count)
    return {'cid': int(cid), 'formula': formula, 'atoms': atoms, 'bonds': bonds}


def main(src, dst):
    out = pathlib.Path(dst)
    out.mkdir(parents=True, exist_ok=True)
    for f in sorted(pathlib.Path(src).glob('*.sdf')):
        m = parse(f.read_text(encoding='utf-8'))
        assert len(m['atoms']) and all(0 <= b[0] < len(m['atoms']) and 0 <= b[1] < len(m['atoms']) for b in m['bonds']), f.name
        (out / (f.stem + '.json')).write_text(json.dumps(m, separators=(',', ':')), encoding='utf-8')
        print(f.stem, m['cid'], m['formula'], len(m['atoms']), 'atomi', len(m['bonds']), 'legami')


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
