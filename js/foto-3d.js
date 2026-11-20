/* APERTURA POP di Fotografia (17 nov 2026). La bottiglia 3D di js/bottiglia-3d-kit.js segue lo stato FS.apre, che js/foto.js fa scorrere con la pagina: x e y del centro del vetro e altezza h
   in frazioni dello schermo, rz inclinazione nel piano dello schermo, ry giro attorno all'asse; rotola = 1 quando è sdraiata sul piano e gira quanto si sposta, come un rullo vero (17 nov: "come se il vino
   rotolasse sulla superficie"), con l'etichetta di fronte quando x = x0. Col mouse guarda il puntatore; mentre la pista scorre si piega un poco all'indietro. Niente ombra a terra ("ombra finta").
   18 nov: tolti dalla scena il grappolo 3D e le foto della pista dietro il vetro rigato ("togliamo sto grappolo, togli le foto con le glass refracted, non era così che lo volevo"):
   la versione con loro è in _archivio-prove/pop-17nov-grappolo-foto-vetro.
   Obiettivo da 200 mm come nella prova; disegna solo mentre l'apertura è in vista. Se il 3D non parte restano le immagini e la foto della bottiglia, che js/foto.js muove con lo stesso stato. */
import * as THREE from 'three';
import { creaBottiglia } from './bottiglia-3d-kit.js';

const palco = document.querySelector('.fo-apre__st'), tela = palco?.querySelector('.fo-apre__tela'), st = window.FS?.apre;
if (tela && st) try {
  const renderer = new THREE.WebGLRenderer({ canvas: tela, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const bott = await creaBottiglia(renderer);

  /* perno al centro del vetro: inclinazione (z) e tre gradi di sguardo dall'alto (x) sul perno, il giro attorno all'asse dentro */
  const scena = new THREE.Scene(), perno = new THREE.Group(), asse = new THREE.Group();
  bott.position.y = -0.5; asse.add(bott); perno.add(asse); scena.add(perno);
  perno.rotation.order = 'XZY';
  const D = 30, SU = THREE.MathUtils.degToRad(3), camera = new THREE.PerspectiveCamera(6, 1, 1, 100);
  camera.position.set(0, 0, D);
  let Vh = 1, Vw = 1; /* quanto mondo si vede alla distanza della bottiglia */
  const misura = () => {
    const w = tela.clientWidth, h = tela.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.setFocalLength(200); camera.updateProjectionMatrix();
    Vh = 2 * D * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)); Vw = Vh * camera.aspect;
  };
  new ResizeObserver(misura).observe(tela); misura();
  const tra = (v, a, b) => Math.min(b, Math.max(a, v));

  const fermo = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mira = { x: 0, y: 0 }, occhio = { x: 0, y: 0 }; /* dove sta il puntatore (-0,5..0,5) e dove guarda la bottiglia, che lo raggiunge piano */
  if (!fermo && matchMedia('(hover: hover) and (pointer: fine)').matches) addEventListener('pointermove', (e) => { mira.x = e.clientX / innerWidth - 0.5; mira.y = e.clientY / innerHeight - 0.5; }, { passive: true });

  const pista = palco.querySelector('.fo-pista'); /* la fila delle parole: la bottiglia si piega con la sua velocità */
  let pronto = false, vel = 0, primaX = null, prima = performance.now();
  const passo = (ora) => {
    requestAnimationFrame(passo);
    const r = palco.getBoundingClientRect(); if (pronto && (r.bottom <= 0 || r.top >= innerHeight)) return;
    const dt = Math.max(1, ora - prima); prima = ora;
    occhio.x += (mira.x - occhio.x) * 0.06; occhio.y += (mira.y - occhio.y) * 0.06;
    /* la velocità della pista in px al secondo (negativa quando va a sinistra), smussata */
    const x0 = pista.getBoundingClientRect().left; if (primaX !== null) vel += (((x0 - primaX) / dt) * 1000 - vel) * 0.15; primaX = x0;

    /* la bottiglia: piegata all'indietro dalla velocità della pista; sdraiata, gira di quanto si sposta diviso il raggio (0,105 dell'altezza) */
    const rullo = st.rotola * (((st.x - st.x0) * Vw) / (0.105 * st.h * Vh));
    perno.position.set((st.x - 0.5) * Vw, (0.5 - st.y) * Vh, 0);
    perno.scale.setScalar(st.h * Vh);
    perno.rotation.set(SU + occhio.y * 0.16, 0, st.rz - occhio.x * 0.14 + (fermo ? 0 : (1 - st.rotola) * tra(-vel / 9000, -0.2, 0.2)));
    asse.rotation.y = st.ry + rullo + occhio.x * 0.9 + (fermo ? 0 : 0.25 * Math.sin(ora / 2300)); /* guarda il puntatore e dondola piano attorno al fronte */

    renderer.render(scena, camera);
    if (!pronto) { pronto = true; palco.classList.add('is-3d'); }
  };
  requestAnimationFrame(passo);
} catch (e) { console.warn('apertura 3D: non parte, resta la foto', e); }
