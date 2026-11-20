"""La scena della bottiglia che versa pronta per il sito (pop-b.html, legata allo scorrimento): da tools/scena/<prova>.mp4 (tools/pop_scena.py) a assets/pop/scena.mp4 e scena.webp.
Il fondo di Gemini Omni è un grigio da studio (218 negli angoli, 243 al centro): sulla pagina bianca si vedrebbe il rettangolo. Correzione del fondo: il fondo pulito è il pixel più
chiaro di tutti i fotogrammi (la bottiglia e il calice si spostano, il fondo resta), sfumato; ogni fotogramma si divide per lui, così il fondo diventa bianco pieno e ombre, vetro e
etichetta restano nei loro rapporti. Senza audio, 1600 x 900, un fotogramma chiave ogni 4 (si scorre avanti e indietro senza scatti), più la prima immagine in webp.
uso: python -I tools/pop_scena_web.py <prova>"""
import os
import subprocess
import sys

import numpy as np
from PIL import Image, ImageFilter

prova = sys.argv[1]
radice = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
grezzo = os.path.join(radice, 'tools', 'scena', f'{prova}.mp4')
W, H = 1600, 900


def fotogrammi():
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', grezzo, '-vf', f'scale={W}:{H}:flags=lanczos', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
    n = W * H * 3
    while True:
        b = p.stdout.read(n)
        if len(b) < n:
            break
        yield np.frombuffer(b, np.uint8).reshape(H, W, 3)
    p.wait()


fondo = None
for f in fotogrammi():
    fondo = f.copy() if fondo is None else np.maximum(fondo, f)
fondo = np.asarray(Image.fromarray(fondo).filter(ImageFilter.GaussianBlur(24)), np.float32)
print('fondo: da', int(fondo.min()), 'a', int(fondo.max()))
assert fondo.min() > 150, 'il fondo pulito ha ancora un oggetto dentro'

dest = os.path.join(radice, 'assets', 'pop', 'scena.mp4')
enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', '24', '-i', '-', '-an', '-c:v', 'libx264', '-preset', 'slow',
                        '-crf', '24', '-g', '4', '-keyint_min', '4', '-sc_threshold', '0', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', dest], stdin=subprocess.PIPE)
n = 0
for f in fotogrammi():
    v = np.clip(f.astype(np.float32) / fondo * 255.0, 0, 255)
    v = np.where(v > 215, 215 + (v - 215) * 1.74, v)  # la luce generata cambia un poco da un fotogramma all'altro (fascia a 238 dietro il calice): il quasi bianco va a bianco, ombre e bordi del vetro restano
    out = np.clip(v, 0, 255).astype(np.uint8)
    if n == 0:
        Image.fromarray(out).save(os.path.join(radice, 'assets', 'pop', 'scena.webp'), quality=82)
        angoli = [out[10, 10], out[10, W - 10], out[H - 10, 10], out[H - 10, W - 10], out[20, W // 2]]
        assert all(min(a) >= 250 for a in angoli), f'il fondo non è bianco: {angoli}'
    enc.stdin.write(out.tobytes()); n += 1
enc.stdin.close(); enc.wait()
print('scritto', dest, n, 'fotogrammi', os.path.getsize(dest), 'byte')
