/* PROVA (18 nov 2026): Tre Cuori di Blender che gira, su bottiglia-giro.html (non collegata). A sinistra le 72 viste di Blender (una ogni 5 gradi, tools/bottiglia_blender.py --giro 72,
   tools/giro_web.py), fra due viste vicine una sfumatura; a destra la bottiglia 3D della pagina (js/bottiglia-3d-kit.js) con la pelle di Blender (tools/velo_blender.py), che gira continua.
   Un solo angolo per tutte e due: gira da sola piano (un giro ogni 12 secondi), si trascina l'una o l'altra (in orizzontale: in verticale la pagina scorre) o con le frecce; lasciata,
   rallenta e riprende. Il telefono prende le viste piccole. Con le animazioni ridotte stanno ferme di fronte, ma si girano lo stesso trascinando. */
import * as THREE from 'three';
import { creaBottiglia } from './bottiglia-3d-kit.js';

const tela = document.querySelector('.giro-tela'), tela3 = document.querySelector('.giro-3d'), g = tela.getContext('2d'), fermo = matchMedia('(prefers-reduced-motion: reduce)').matches;
const N = 72, cartella = 'assets/giro/tre-cuori/' + (matchMedia('(max-width: 860px)').matches ? 'p' : 'g') + '/';
const viste = Array.from({ length: N }, (_, i) => { const im = new Image(); im.src = cartella + String(i).padStart(3, '0') + '.webp'; return im; });
const GIRO = N / 12; /* viste al secondo da sola */
let pos = 0, vel = 0, preso = false, px = 0, sosta = 0, prima = performance.now(), pronte = 0, bott = null, renderer, scena, camera;

/* ---- le viste: la tela ha le proporzioni delle immagini e i pixel dello schermo; la tela del 3D è grande uguale */
const misura = () => {
  const v = viste[0], dpr = Math.min(devicePixelRatio, 2);
  for (const t of [tela, tela3]) t.style.aspectRatio = v.naturalWidth + ' / ' + v.naturalHeight;
  tela.width = Math.round(tela.clientWidth * dpr); tela.height = Math.round(tela.clientHeight * dpr);
  if (!renderer) return;
  renderer.setSize(tela3.clientWidth, tela3.clientHeight, false);
  /* la stessa inquadratura delle viste: 200 mm, tre gradi sopra, la bottiglia alta quanto la tela (le viste hanno 6 px di margine su 1100) */
  camera.aspect = tela3.clientWidth / tela3.clientHeight; camera.setFocalLength(200);
  const SU = THREE.MathUtils.degToRad(3), d = (1 / (1 - 12 / 1100)) / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
  camera.position.set(0, 0.5 + d * Math.sin(SU), d * Math.cos(SU)); camera.lookAt(0, 0.5, 0); camera.updateProjectionMatrix();
};
const disegna = () => {
  const i = Math.floor(pos), f = pos - i, a = viste[((i % N) + N) % N], b = viste[(((i + 1) % N) + N) % N];
  if (a.complete) {
    g.globalAlpha = 1; g.drawImage(a, 0, 0, tela.width, tela.height);
    if (f > 0.01 && b.complete) { g.globalAlpha = f; g.drawImage(b, 0, 0, tela.width, tela.height); }
  }
  if (bott) { bott.rotation.y = (pos / N) * Math.PI * 2; renderer.render(scena, camera); }
};

/* ---- trascinare: la superficie segue il dito, tanti pixel quanti ne fa il vetro girando */
const lascia = () => { sosta = performance.now() + 1500; };
for (const t of [tela, tela3]) {
  t.addEventListener('pointerdown', (e) => { preso = true; px = e.clientX; vel = 0; t.setPointerCapture(e.pointerId); });
  t.addEventListener('pointermove', (e) => { if (!preso) return; vel = ((e.clientX - px) / (t.clientWidth * 0.45)) * (N / (2 * Math.PI)); pos += vel; px = e.clientX; });
  for (const ev of ['pointerup', 'pointercancel']) t.addEventListener(ev, () => { preso = false; lascia(); });
  t.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { vel = e.key === 'ArrowLeft' ? -0.6 : 0.6; lascia(); e.preventDefault(); } });
}

window.giroVai = (p) => { pos = p; vel = 0; }; /* per le prove: porta tutte e due a una vista */
const passo = (ora) => {
  requestAnimationFrame(passo);
  const dt = Math.min(0.05, (ora - prima) / 1000); prima = ora;
  if (!preso) { pos += vel; vel *= 0.92; if (!fermo && pronte === N && ora > sosta) pos += GIRO * dt; }
  disegna();
};

try { /* il 3D: se non parte resta la colonna delle immagini */
  renderer = new THREE.WebGLRenderer({ canvas: tela3, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  scena = new THREE.Scene(); camera = new THREE.PerspectiveCamera(6, 1, 0.5, 60);
  bott = await creaBottiglia(renderer, 'assets/3d/tre-cuori');
  scena.add(bott);
} catch (e) { console.warn('giro: il 3D non parte', e); bott = null; }
viste[0].decode().then(() => { misura(); new ResizeObserver(misura).observe(tela); requestAnimationFrame(passo); }, () => console.warn('giro: le viste non si caricano'));
for (const v of viste) v.decode().then(() => { pronte++; }, () => {});
