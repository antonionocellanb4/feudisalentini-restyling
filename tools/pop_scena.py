"""La scena della bottiglia che versa, per pop-b.html (18 nov 2026: "manca la generazione della scena che sarà collegata allo scroll, da fare con Veo omni"; l'idea è sua:
"una scena con una delle bottiglie che versa il vino", "tutto in motion design").
Primo fotogramma: la foto vera del catalogo (assets/bottles/primitivo53.webp, già scontornata, non toccata) su bianco pieno 1920 x 1080. Comfy Cloud la anima con Google Gemini Omni
(Video), Omni Flash 1.2, 1080p, 8 secondi: circa 0,15 $ al secondo, 1,20 $ a prova. Il video grezzo resta in tools/scena/, quello per il sito lo fa tools/pop_scena_web.py.
La chiave non si stampa mai: arriva dalla variabile COMFY_API_KEY.
uso: COMFY_API_KEY=... python -I tools/pop_scena.py <nome della prova>"""
import io
import json
import os
import sys
import time
import urllib.parse
import urllib.request
import uuid

from PIL import Image

nome = sys.argv[1]
radice = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
uscita = os.path.join(radice, 'tools', 'scena'); os.makedirs(uscita, exist_ok=True)
COMFY = 'https://cloud.comfy.org'

# il primo fotogramma: la bottiglia in piedi un po' a sinistra (a destra serve posto per il calice), alta tre quarti del quadro
W, H = 1920, 1080
bott = Image.open(os.path.join(radice, 'assets/bottles/primitivo53.webp')).convert('RGBA')
alta = round(H * 0.78); bott = bott.resize((round(bott.width * alta / bott.height), alta), Image.LANCZOS)
quadro = Image.new('RGBA', (W, H), (255, 255, 255, 255))
quadro.alpha_composite(bott, (round(W * 0.40 - bott.width / 2), round(H * 0.92 - alta)))
quadro = quadro.convert('RGB'); quadro.save(os.path.join(uscita, f'{nome}-primo.png'))

PROMPT = ('An 8-second clip. Minimalist product motion design on a pure white seamless background, static locked-off camera. The wine bottle from the image lifts slightly '
          'and slowly tilts to the right, pouring a smooth glossy stream of deep ruby red wine into a crystal clear wine glass that glides into frame from the right and '
          'stops below the bottle neck; the glass fills to one third with gentle ripples. The bottle stays whole and in focus, the label always facing the camera and '
          'exactly as in the image. Soft even studio light, a faint soft shadow under the objects, the background stays pure white. No hands, no people, no added text, '
          'no logos, no camera movement, no cuts.')


def chiama(path, dati=None, tipo='application/json', segui=True):
    req = urllib.request.Request(COMFY + path, data=dati, headers={'X-API-Key': os.environ['COMFY_API_KEY'], **({'Content-Type': tipo} if dati is not None else {})})
    if not segui:  # /api/view risponde 302 verso un link firmato, da scaricare senza la chiave
        class Fermo(urllib.request.HTTPRedirectHandler):
            def redirect_request(self, *a, **k):
                return None
        try:
            urllib.request.build_opener(Fermo).open(req, timeout=60)
        except urllib.error.HTTPError as e:
            return e.headers.get('Location')
        raise RuntimeError('mi aspettavo un 302 da /api/view')
    try:
        with urllib.request.urlopen(req, timeout=180) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:  # gli errori di validazione dicono quali ingressi vuole il nodo (non costano)
        sys.exit(f'Comfy {e.code}: {e.read().decode("utf-8", "replace")[:1500]}')


buf = io.BytesIO(); quadro.save(buf, 'PNG')
confine = uuid.uuid4().hex
corpo = (f'--{confine}\r\nContent-Disposition: form-data; name="image"; filename="{nome}-primo.png"\r\nContent-Type: image/png\r\n\r\n').encode() + buf.getvalue() + \
    (f'\r\n--{confine}\r\nContent-Disposition: form-data; name="type"\r\n\r\ninput\r\n--{confine}\r\nContent-Disposition: form-data; name="overwrite"\r\n\r\ntrue\r\n--{confine}--\r\n').encode()
caricata = chiama('/api/upload/image', corpo, f'multipart/form-data; boundary={confine}')['name']
flusso = {
    '3': {'class_type': 'LoadImage', 'inputs': {'image': caricata}},
    '1': {'class_type': 'GeminiVideoOmniV2', 'inputs': {'model': 'Omni Flash 1.2', 'model.prompt': PROMPT, 'model.resolution': '1080p', 'model.aspect_ratio': '16:9',
                                                         'model.task_type': 'image_to_video', 'model.images.image_1': ['3', 0], 'model.seed': 1953}},
    '2': {'class_type': 'SaveVideo', 'inputs': {'video': ['1', 0], 'filename_prefix': 'feudi-scena', 'format': 'auto', 'codec': 'auto'}},
}
lavoro = chiama('/api/prompt', json.dumps({'prompt': flusso, 'extra_data': {'api_key_comfy_org': os.environ['COMFY_API_KEY']}}).encode())['prompt_id']
print('lavoro', lavoro, flush=True)
for _ in range(150):
    time.sleep(6)
    st = chiama(f'/api/job/{lavoro}/status').get('status')
    if st in ('error', 'non_retryable_error', 'lost', 'cancelled'):
        sys.exit(f'Comfy: {st} {json.dumps(chiama(f"/api/jobs/{lavoro}"))[:1500]}')
    if st == 'success':
        break
else:
    sys.exit('Comfy: troppo tempo')
uscite = chiama(f'/api/jobs/{lavoro}')['outputs']['2']
out = next(v[0] for k, v in uscite.items() if isinstance(v, list) and v and isinstance(v[0], dict) and 'filename' in v[0])
firmato = chiama('/api/view?' + urllib.parse.urlencode({'filename': out['filename'], 'subfolder': out.get('subfolder', ''), 'type': 'output'}), segui=False)
dest = os.path.join(uscita, f'{nome}.mp4')
with urllib.request.urlopen(firmato, timeout=300) as r, open(dest, 'wb') as f:
    f.write(r.read())
print('scritto', dest, os.path.getsize(dest), 'byte')
