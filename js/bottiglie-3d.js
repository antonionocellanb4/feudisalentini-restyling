/* PROVA (18 nov 2026): le altre bottiglie in 3D, su bottiglie-3d.html (non collegata). Marpiccolo (bianco), Tre Cuori (rosato) e Philia (Dolce Naturale DOCG) accanto a Collezione 53 Primitivo.
   Le bottiglie e le luci si costruiscono in js/bottiglia-3d-kit.js; qui la macchina, la fila e i movimenti, come la prova di una bottiglia (js/bottiglia-3d.js): ognuna si gira trascinandola
   (tutte con le frecce), lasciata torna di fronte e dondola. Altezze vere: il collo sotto il tappo è largo uguale per tutte. Sul telefono due per riga. Con le animazioni ridotte stanno ferme di fronte.
   shortcut: se il 3D non parte la pagina resta bianca (è una prova); nell'apertura di Fotografia resta la foto. */
import * as THREE from 'three';
import { creaBottiglia } from './bottiglia-3d-kit.js';

const box = document.querySelector('.b3s'), tela = box.querySelector('.b3s-tela'), nomi = [...box.querySelectorAll('.b3s-nome')], fermo = matchMedia('(prefers-reduced-motion: reduce)').matches;
const QUALI = (new URLSearchParams(location.search).get('quali') || 'primitivo53,marpiccolo,tre-cuori,philia').split(','), RIGA = 1.3, PASSO = 0.55; /* ?quali=a,b,c,d: altre quattro da guardare (i nomi sotto restano quelli della pagina) */
try {
  const renderer = new THREE.WebGLRenderer({ canvas: tela, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const scena = new THREE.Scene(), camera = new THREE.PerspectiveCamera(6, 1, 0.5, 200);
  const bott = await Promise.all(QUALI.map((q) => creaBottiglia(renderer, 'assets/3d/' + q)));
  const rif = bott[0].userData.collo;
  const stato = bott.map((b, i) => { b.scale.setScalar(rif / b.userData.collo); scena.add(b); return { giro: fermo ? 0 : -0.5 + i * 0.3, vel: 0, sosta: 0 }; });

  /* la macchina: 200 mm come la prova di una bottiglia, lontana quanto serve perché la fila stia intera coi nomi sotto */
  const SU = THREE.MathUtils.degToRad(3), v = new THREE.Vector3();
  const misura = () => {
    const w = tela.clientWidth, h = tela.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.setFocalLength(200);
    const colonne = camera.aspect < 0.9 ? 2 : 4, righe = QUALI.length / colonne, t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const d = Math.max((righe * RIGA + 0.3) / (2 * t), (colonne * PASSO) / (2 * t * camera.aspect));
    const passo = colonne === 2 ? d * t * camera.aspect : PASSO; /* sul telefono a un quarto e tre quarti della larghezza, così i nomi lunghi non si toccano */
    bott.forEach((b, i) => b.position.set(((i % colonne) - (colonne - 1) / 2) * passo, (righe * RIGA) / 2 - 1.1 - Math.floor(i / colonne) * RIGA, 0));
    camera.position.set(0, d * Math.sin(SU), d * Math.cos(SU)); camera.lookAt(0, 0, 0); camera.updateProjectionMatrix();
  };
  new ResizeObserver(misura).observe(tela); misura();

  /* trascinando si gira la bottiglia più vicina al dito; lasciata resta dov'è per due secondi e mezzo */
  let presa = -1, px = 0;
  const schermo = (b, y) => { v.set(b.position.x, b.position.y + y * b.scale.y, 0).project(camera); return [((v.x + 1) / 2) * tela.clientWidth, ((1 - v.y) / 2) * tela.clientHeight]; };
  tela.tabIndex = 0;
  tela.addEventListener('pointerdown', (e) => {
    const r = tela.getBoundingClientRect(); let meglio = Infinity;
    bott.forEach((b, i) => { const [x, y] = schermo(b, 0.5), dd = Math.hypot(x - (e.clientX - r.left), y - (e.clientY - r.top)); if (dd < meglio) { meglio = dd; presa = i; } });
    px = e.clientX; stato[presa].vel = 0; tela.setPointerCapture(e.pointerId);
  });
  tela.addEventListener('pointermove', (e) => { if (presa < 0) return; const s = stato[presa]; s.vel = (e.clientX - px) * 0.008; s.giro += s.vel; px = e.clientX; });
  for (const ev of ['pointerup', 'pointercancel']) tela.addEventListener(ev, () => { if (presa >= 0) stato[presa].sosta = performance.now() + 2500; presa = -1; });
  tela.addEventListener('keydown', (e) => { if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return; for (const s of stato) { s.vel = e.key === 'ArrowLeft' ? -0.06 : 0.06; s.sosta = performance.now() + 2500; } e.preventDefault(); });

  let prima = performance.now();
  const passo = (ora) => {
    requestAnimationFrame(passo);
    const dt = Math.min(0.05, (ora - prima) / 1000); prima = ora;
    stato.forEach((s, i) => {
      if (i !== presa) { /* lasciata, rallenta e resta lì; poi torna piano di fronte e dondola (il retro non c'è in foto, non si mostra da solo) */
        s.giro += s.vel; s.vel *= 0.92;
        if (!fermo && Math.abs(s.vel) < 0.002 && ora > s.sosta) { const fronte = Math.round(s.giro / (Math.PI * 2)) * Math.PI * 2; s.giro += (fronte + 0.5 * Math.sin(ora / 2300 + i * 1.7) - s.giro) * Math.min(1, dt * 0.9); }
      }
      bott[i].rotation.y = s.giro;
      const [x, y] = schermo(bott[i], -0.05); nomi[i].style.left = x + tela.offsetLeft + 'px'; nomi[i].style.top = y + tela.offsetTop + 'px';
    });
    renderer.render(scena, camera);
  };
  requestAnimationFrame(passo);
  box.classList.add('is-3d');
} catch (e) { console.warn('bottiglie 3D: non partono', e); }
