/* PROVA: una bottiglia in 3D (17 nov 2026, "riesci a fare una di queste bottiglie in 3d e me la fai vedere?"). Collezione 53 Primitivo, su bottiglia-3d.html (non collegata).
   La bottiglia e le luci si costruiscono in js/bottiglia-3d-kit.js (la usa anche l'apertura di Fotografia); qui la macchina e i movimenti. L'ombra a terra è stata tolta il 17 nov ("ombra finta").
   Macchina: obiettivo da 200 mm ("e l'obiettivo 200mm"), tre gradi sopra l'orizzonte.
   Dondola piano attorno al fronte; si trascina per girarla tutta (col dito in orizzontale: in verticale la pagina scorre) o con le frecce, e lasciata torna di fronte. Con le animazioni ridotte sta ferma di fronte, ma si può girare.
   three.js arriva da unpkg come le altre librerie del sito (importmap nella pagina). Se il 3D non parte resta la foto. */
import * as THREE from 'three';
import { creaBottiglia } from './bottiglia-3d-kit.js';

const box = document.querySelector('.b3'), tela = box.querySelector('.b3-tela'), fermo = matchMedia('(prefers-reduced-motion: reduce)').matches;
try {
  const renderer = new THREE.WebGLRenderer({ canvas: tela, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const scena = new THREE.Scene(), camera = new THREE.PerspectiveCamera(6, 1, 0.5, 60);
  const bott = await creaBottiglia(renderer);
  scena.add(bott);

  /* la macchina: 200 mm (three lo conta su pellicola da 35 mm), lontana quanto serve perché la bottiglia stia intera con un po' d'aria, anche sul telefono */
  const SU = THREE.MathUtils.degToRad(3);
  const misura = () => {
    const w = tela.clientWidth, h = tela.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.setFocalLength(200);
    const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)), d = Math.max(0.62 / t, 0.2 / (t * camera.aspect));
    camera.position.set(0, 0.5 + d * Math.sin(SU), d * Math.cos(SU));
    camera.lookAt(0, 0.5, 0); camera.updateProjectionMatrix();
  };
  new ResizeObserver(misura).observe(tela); misura();

  let giro = fermo ? 0 : -0.7, incl = 0, vel = 0, preso = false, px = 0, py = 0, prima = performance.now(), sosta = 0;
  const lascia = () => { sosta = performance.now() + 2500; }; /* dopo averla girata resta dov'è per due secondi e mezzo */
  tela.tabIndex = 0;
  tela.addEventListener('pointerdown', (e) => { preso = true; px = e.clientX; py = e.clientY; vel = 0; tela.setPointerCapture(e.pointerId); });
  tela.addEventListener('pointermove', (e) => { if (!preso) return; vel = (e.clientX - px) * 0.008; giro += vel; incl = THREE.MathUtils.clamp(incl + (e.clientY - py) * 0.002, -0.12, 0.22); px = e.clientX; py = e.clientY; });
  for (const ev of ['pointerup', 'pointercancel']) tela.addEventListener(ev, () => { preso = false; lascia(); });
  tela.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { vel = e.key === 'ArrowLeft' ? -0.06 : 0.06; lascia(); e.preventDefault(); } });
  const passo = (ora) => {
    requestAnimationFrame(passo);
    const dt = Math.min(0.05, (ora - prima) / 1000); prima = ora;
    if (!preso) { /* lasciata, rallenta e resta lì; poi torna piano di fronte e dondola di una trentina di gradi per lato (il retro non c'è in foto, non si mostra da solo). Con le animazioni ridotte resta dove la si lascia */
      giro += vel; vel *= 0.92; incl *= 0.96;
      if (!fermo && Math.abs(vel) < 0.002 && ora > sosta) { const fronte = Math.round(giro / (Math.PI * 2)) * Math.PI * 2; giro += (fronte + 0.55 * Math.sin(ora / 2300) - giro) * Math.min(1, dt * 0.9); }
    }
    bott.rotation.set(incl, giro, 0);
    renderer.render(scena, camera);
  };
  requestAnimationFrame(passo);
  box.classList.add('is-3d');
} catch (e) { console.warn('bottiglia 3D: non parte, resta la foto', e); }
