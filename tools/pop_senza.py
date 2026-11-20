"""La foto dello shooting senza la bottiglia, per la prova A dell'apertura Pop (18 nov 2026: "la bottiglia che esce dalla foto ed è il 3D").
Taglia l'originale in 4:5 come tools/pop_foto.py, chiede a Comfy Cloud (Nano Banana Pro, GeminiImage2Node, circa 0,17 $) la stessa foto senza la bottiglia e la sua ombra,
poi rimette i pixel veri dappertutto tranne attorno alla bottiglia (maschera sfumata), così cambia solo il posto da cui esce il 3D.
Scrive assets/pop/<nome>.webp (con la bottiglia) e <nome>-vuota.webp (senza), 880 x 1100, e stampa dove sta la bottiglia nel taglio (in frazioni), per allineare il 3D.
La chiave non si stampa mai: arriva dalla variabile COMFY_API_KEY.
uso: COMFY_API_KEY=... python -I tools/pop_senza.py <originale.jpg> <nome> <alto> [--ia file già generato, per rifare solo il montaggio senza spendere]"""
import io
import json
import os
import sys
import time
import urllib.request
import uuid

import numpy as np
from PIL import Image, ImageFilter, ImageOps

orig, nome, alto = sys.argv[1], sys.argv[2], float(sys.argv[3])
gia = sys.argv[sys.argv.index('--ia') + 1] if '--ia' in sys.argv else None
radice = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
COMFY = 'https://cloud.comfy.org'
W, H = 1600, 2000  # quello che si manda a Comfy; il sito usa 880 x 1100

im = ImageOps.exif_transpose(Image.open(orig)).convert('RGB')
w, h = im.size
th = round(w * 5 / 4)
assert th <= h, 'non è verticale abbastanza per il 4:5'
y0 = round((h - th) * alto)
taglio = im.crop((0, y0, w, y0 + th)).resize((W, H), Image.LANCZOS)


def chiama(path, dati=None, tipo='application/json', segui=True):
    chiave = os.environ['COMFY_API_KEY']
    req = urllib.request.Request(COMFY + path, data=dati, headers={'X-API-Key': chiave, **({'Content-Type': tipo} if dati is not None else {})})
    if not segui:  # /api/view risponde 302 verso un link firmato, da scaricare senza la chiave
        class Fermo(urllib.request.HTTPRedirectHandler):
            def redirect_request(self, *a, **k):
                return None
        try:
            urllib.request.build_opener(Fermo).open(req, timeout=60)
        except urllib.error.HTTPError as e:
            return e.headers.get('Location')
        raise RuntimeError('mi aspettavo un 302 da /api/view')
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.loads(r.read())


if gia:
    ia = Image.open(gia).convert('RGB')
else:
    buf = io.BytesIO(); taglio.save(buf, 'JPEG', quality=92)
    confine = uuid.uuid4().hex
    corpo = (f'--{confine}\r\nContent-Disposition: form-data; name="image"; filename="{nome}.jpg"\r\nContent-Type: image/jpeg\r\n\r\n').encode() + buf.getvalue() + \
        (f'\r\n--{confine}\r\nContent-Disposition: form-data; name="type"\r\n\r\ninput\r\n--{confine}\r\nContent-Disposition: form-data; name="overwrite"\r\n\r\ntrue\r\n--{confine}--\r\n').encode()
    caricata = chiama('/api/upload/image', corpo, f'multipart/form-data; boundary={confine}')['name']
    prompt = ('Remove the wine bottle from this photo completely, together with its shadow. Where the bottle was, show what is behind it: the same stone wall, '
              'the same stone ledge, the same sunlight and shadows, continuing naturally. Keep everything else exactly identical: framing, perspective, colors, '
              'light, texture, grain and sharpness. Do not add any object, text or logo.')
    flusso = {
        '3': {'class_type': 'LoadImage', 'inputs': {'image': caricata}},
        '1': {'class_type': 'GeminiImage2Node', 'inputs': {'prompt': prompt, 'model': 'gemini-3-pro-image-preview', 'seed': 1801,
                                                            'aspect_ratio': '4:5', 'resolution': '2K', 'response_modalities': 'IMAGE', 'images': ['3', 0]}},
        '2': {'class_type': 'SaveImage', 'inputs': {'images': ['1', 0], 'filename_prefix': 'feudi-pop'}},
    }
    chiave = os.environ['COMFY_API_KEY']
    lavoro = chiama('/api/prompt', json.dumps({'prompt': flusso, 'extra_data': {'api_key_comfy_org': chiave}}).encode())['prompt_id']
    print('lavoro', lavoro)
    for _ in range(90):
        time.sleep(4)
        st = chiama(f'/api/job/{lavoro}/status').get('status')
        if st in ('error', 'non_retryable_error', 'lost', 'cancelled'):
            sys.exit(f'Comfy: {st}')
        if st == 'success':
            break
    else:
        sys.exit('Comfy: troppo tempo')
    out = chiama(f'/api/jobs/{lavoro}')['outputs']['2']['images'][0]
    firmato = chiama('/api/view?' + urllib.parse.urlencode({'filename': out['filename'], 'subfolder': out.get('subfolder', ''), 'type': 'output'}), segui=False)
    with urllib.request.urlopen(firmato, timeout=120) as r:
        grezza = r.read()
    salva = os.path.join(radice, 'tools', 'pop', f'{nome}-ia.png'); os.makedirs(os.path.dirname(salva), exist_ok=True)
    open(salva, 'wb').write(grezza)
    print('salvata', salva)
    ia = Image.open(io.BytesIO(grezza)).convert('RGB')
ia = ia.resize((W, H), Image.LANCZOS)

# la bottiglia nel taglio: i pixel scuri del vetro, riga per riga dal primo all'ultimo (dentro ci sono anche etichetta e fascetta)
a = np.asarray(taglio).astype(np.float32)
lum = a @ np.array([0.3, 0.59, 0.11], np.float32)
scuro = lum < 45
cols = np.where(scuro[int(H * 0.1):int(H * 0.7)].sum(axis=0) > H * 0.08)[0]  # le colonne dove il vetro scuro è alto
x0, x1 = cols.min(), cols.max()
rows = np.where(scuro[:, x0:x1 + 1].mean(axis=1) > 0.2)[0]
blocchi = np.split(rows, np.where(np.diff(rows) > H * 0.06)[0] + 1)  # la fascetta chiara fa un buco di poche righe; l'ombra a terra sta molto più sotto
blocco = max(blocchi, key=lambda b: b[-1] - b[0])
yb0, yb1 = blocco[0], blocco[-1]
print(f'bottiglia nel taglio: x {x0 / W:.4f}-{x1 / W:.4f}, y {yb0 / H:.4f}-{yb1 / H:.4f} (centro x {(x0 + x1) / 2 / W:.4f}, centro y {(yb0 + yb1) / 2 / H:.4f}, alta {(yb1 - yb0) / H:.4f})')

# quanto la foto dell'IA sta sopra quella vera fuori dalla bottiglia (se si è spostata, il montaggio si vedrebbe)
SX = int(W * 0.25)  # l'ombra della bottiglia cade sul muro a sinistra (sole da destra), larga quanto la bottiglia e oltre
fuori = np.ones((H, W), bool); fuori[max(0, yb0 - 80):yb1 + 80, max(0, x0 - SX - 60):x1 + 120] = False
diff = np.abs(np.asarray(ia).astype(np.float32) - a).mean(axis=-1)
print(f'scarto medio fuori dalla bottiglia: {diff[fuori].mean():.1f} livelli')

# maschera: il rettangolo della bottiglia allargato (a sinistra fino in fondo all'ombra sul muro), sfumato
m = Image.new('L', (W, H), 0)
m.paste(255, (max(0, x0 - SX), max(0, yb0 - 50), min(W, x1 + 70), min(H, yb1 + 60)))
m = m.filter(ImageFilter.GaussianBlur(28))
vuota = Image.composite(ia, taglio, m)
for img, suff in ((taglio, ''), (vuota, '-vuota')):
    p = os.path.join(radice, 'assets', 'pop', f'{nome}{suff}.webp')
    img.resize((880, 1100), Image.LANCZOS).save(p, 'WEBP', quality=75, method=6)
    print(p, os.path.getsize(p) // 1024, 'KB')
