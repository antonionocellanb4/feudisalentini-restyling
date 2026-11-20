"""Le fotografie delle collezioni per Botanica (17 nov 2026): i post di Instagram del cliente, quattro per collezione (cartella "Archivio" mandata dall'utente: luxury, lounge, classic, international, organic; Terra non c'è).
Tutte a 4:5 come i post: i reel (9:16) si tagliano al centro, dove il cliente ha già messo marchio e castello come nei post. Uscita: assets/botanica/post/<collezione>-<n>.webp, 800 x 1000.
Le scritte del marchio dentro le foto restano: sono i post così come li pubblica il cliente.

uso: python -I tools/botanica_post.py <cartella Archivio>"""
import sys
from pathlib import Path
from PIL import Image

Image.MAX_IMAGE_PIXELS = None
R = Path(__file__).resolve().parent.parent
OUT = R / 'assets' / 'botanica' / 'post'
CARTELLE = {'luxury': 'luxury', 'lounge': 'lounge', 'classica': 'classic', 'internazionali': 'international', 'organic': 'organic'}  # id di js/dati-bf.js: cartella dell'Archivio
L, A = 800, 1000


def main():
    src = Path(sys.argv[1])
    OUT.mkdir(parents=True, exist_ok=True)
    for col, cart in CARTELLE.items():
        fs = sorted(f for f in (src / cart).iterdir() if f.suffix.lower() in ('.jpg', '.jpeg', '.png') and not f.name.startswith('._'))
        assert len(fs) == 4, f'{cart}: attese 4 foto, trovate {len(fs)}'
        for n, f in enumerate(fs, 1):
            im = Image.open(f).convert('RGB')
            w, h = im.size
            if h / w > 1.3:  # reel 9:16: si tiene il riquadro 4:5 centrale
                hh = round(w * 5 / 4); im = im.crop((0, (h - hh) // 2, w, (h - hh) // 2 + hh))
            assert abs(im.height / im.width - 1.25) < .01, f'{f.name}: non è 4:5 ({im.size})'
            im = im.resize((L, A), Image.LANCZOS)
            dest = OUT / f'{col}-{n}.webp'
            im.save(dest, quality=80, method=6)
            print(f'{dest.name:22} da {f.name:28} {dest.stat().st_size // 1024} KB')


if __name__ == '__main__':
    main()
