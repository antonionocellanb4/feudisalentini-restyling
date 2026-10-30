"""Assembla le pagine: sostituisce <!-- @include sections/x.html --> con il contenuto del file (anche annidati).
Uso: python -I build.py   (da qualsiasi cartella). Non modificare le pagine .html generate a mano."""
import re, pathlib, hashlib
root = pathlib.Path(__file__).resolve().parent
inc = re.compile(r'<!-- @include (\S+) -->')
# css/js locali con ?v=<hash del contenuto>: a ogni modifica l'URL cambia e il browser non può tenere la versione vecchia in cache
ver = re.compile(r'((?:href|src)="((?:css|js)/[^"?]+\.(?:css|js)))"')
bust = lambda m: f'{m.group(1)}?v={hashlib.md5((root / m.group(2)).read_bytes()).hexdigest()[:8]}"' if (root / m.group(2)).exists() else m.group(0)
for tpl in root.glob('*.template.html'):
    out = tpl.read_text(encoding='utf-8')
    for _ in range(5):  # le parti comuni (_head, _scripts) possono includere altro
        out = inc.sub(lambda m: (root / m.group(1)).read_text(encoding='utf-8').rstrip('\n'), out)
    out = ver.sub(bust, out)
    target = root / tpl.name.replace('.template', '')
    tmp = target.with_suffix('.tmp')
    tmp.write_text(out, encoding='utf-8'); tmp.replace(target)  # scrittura atomica
    print('ok', target.name)
