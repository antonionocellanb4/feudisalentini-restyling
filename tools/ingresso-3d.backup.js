/* Ingresso dal portone in three.js: preloader della prima visita della sessione, automatico.
   La torre del marchio è un volume d'oro (estrusione del profilo vero, spigoli smussati, riflessi da studio), la corona sopra,
   i battenti di legno nel vano. Dietro la torre c'è una parete scura con un buco esattamente sul portone: dal vano si vede la pagina vera.
   La torre è già completa: la luce la rivela, la camera si porta di fronte, i battenti si aprono, la camera attraversa il portone.
   Esc o Salta = si salta. Contratto: sessionStorage fs-ingresso=1, via la classe ingresso-attivo, evento fs:ingresso-fine. */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const html = document.documentElement;
const el = document.querySelector('[data-ingresso]');
if (el && !html.classList.contains('ingresso-attivo')) el.remove();
else if (el) start();

function start() {
  const behind = [...document.querySelectorAll('#main, .foot')];
  const ui = el.querySelector('.ingresso-ui');
  let done = false, exiting = false;
  const t0 = performance.now();

  const finish = (fast) => {
    if (done) return;
    done = true;
    removeEventListener('keydown', onKey);
    try { sessionStorage.setItem('fs-ingresso', '1'); } catch (e) {}
    if (fast) { el.classList.add('ingresso--via'); setTimeout(() => el.remove(), 380); } else el.remove();
    behind.forEach((n) => (n.inert = false));
    html.classList.remove('ingresso-attivo');
    FS.lenis?.start();
    document.dispatchEvent(new Event('fs:ingresso-fine'));
    renderer?.dispose();
  };
  const onKey = (e) => { if (e.key === 'Escape') finish(true); };
  addEventListener('keydown', onKey);
  el.querySelector('.ingresso-salta').addEventListener('click', () => finish(true));
  // modulo arrivato tardi (rete lenta): la rete di sicurezza CSS ha già tolto l'overlay
  if (performance.now() > 5500) return finish(false);
  el.style.animation = 'none';
  behind.forEach((n) => (n.inert = true));
  FS.lenis?.stop();

  /* ---- geometria del marchio (unità di assets/logo/feudi-marchio.svg) ---- */
  const W = 60.05, TT = 29.14, TB = 89.35, DL = 23.78, DR = 36.27, DT = 56.31, U = 1 / 25;
  const P = (x, y) => new THREE.Vector2((x - W / 2) * U, (TB / 2 - y) * U);
  const shape = (pts) => new THREE.Shape(pts.map(([x, y]) => P(x, y)));
  const DEPTH = 1.15, ext = { depth: DEPTH, bevelEnabled: true, bevelThickness: 0.035, bevelSize: 0.03, bevelSegments: 4, curveSegments: 1 };
  const towerGeo = new THREE.ExtrudeGeometry(shape([[0, TT], [W, TT], [W, TB], [DR, TB], [DR, DT], [DL, DT], [DL, TB], [0, TB]]), ext);
  const crownGeo = new THREE.ExtrudeGeometry(shape([[0, 0.53], [17.69, 13.2], [30.02, 0.34], [42.35, 13.2], [60.05, 0.53], [60.05, 23.31], [0, 23.31]]), ext);
  [towerGeo, crownGeo].forEach((g) => g.translate(0, 0, -DEPTH / 2));
  const yBot = P(0, TB).y, yTop = P(0, 0).y, door = { x: 0, y: (P(0, DT).y + yBot) / 2, w: (DR - DL) * U, h: (DT - TB) * -U };

  /* ---- scena ---- */
  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: el.querySelector('.ingresso-3d'), antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) { return finish(true); }
  renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 768 ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.08;
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.03).texture;
  const night = new THREE.Color(getComputedStyle(html).getPropertyValue('--night').trim());

  // parete scura con il buco del portone (dietro la torre): dal buco si vede la pagina
  const wall = new THREE.Shape([new THREE.Vector2(-300, -300), new THREE.Vector2(300, -300), new THREE.Vector2(300, 300), new THREE.Vector2(-300, 300)]);
  wall.holes.push(new THREE.Path([P(DL, DT), P(DR, DT), P(DR, TB), P(DL, TB)].map((v, i) => v.clone().add(new THREE.Vector2(i === 0 || i === 3 ? 0.004 : -0.004, i < 2 ? -0.004 : 0)))));
  const WALLZ = -DEPTH / 2 - 0.02;
  const wallMesh = new THREE.Mesh(new THREE.ShapeGeometry(wall), new THREE.MeshBasicMaterial({ color: night, toneMapped: false, fog: false }));
  wallMesh.position.z = WALLZ; scene.add(wallMesh);

  // oro spazzolato: righe sottili orizzontali come una lastra di metallo lavorata (rugosità e rilievo)
  const bc = document.createElement('canvas'); bc.width = bc.height = 256;
  const bg = bc.getContext('2d'); bg.fillStyle = '#808080'; bg.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 900; i++) { const y = Math.random() * 256, l = 30 + Math.random() * 200, x = Math.random() * 256, c = 100 + Math.random() * 80; bg.fillStyle = `rgb(${c},${c},${c})`; bg.fillRect(x, y, l, 0.6 + Math.random()); }
  const brush = new THREE.CanvasTexture(bc); brush.wrapS = brush.wrapT = THREE.RepeatWrapping; brush.repeat.set(0.4, 0.4); brush.offset.set(0.5, 0.5); // la giunta della texture resta fuori dal marchio
  const gold = new THREE.MeshPhysicalMaterial({ color: 0xd9bf80, metalness: 1, roughness: 0.34, roughnessMap: brush, bumpMap: brush, bumpScale: 0.18,
    clearcoat: 0.35, clearcoatRoughness: 0.25, envMapIntensity: 1.6 });
  const tower = new THREE.Mesh(towerGeo, gold), crown = new THREE.Mesh(crownGeo, gold);
  const mark = new THREE.Group(); mark.add(tower, crown); scene.add(mark);

  // battenti di legno, incernierati ai lati del vano, un po' rientrati
  const wood = new THREE.MeshStandardMaterial({ color: 0x2b1d16, roughness: 0.62, metalness: 0.05 });
  const knob = new THREE.MeshStandardMaterial({ color: 0xd9bf80, metalness: 1, roughness: 0.25 });
  const leaf = (side) => {
    const pivot = new THREE.Group(), w = door.w / 2 - 0.004;
    pivot.position.set(side * door.w / 2, door.y, DEPTH / 2 - 0.16);
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, door.h - 0.004, 0.06), wood); b.position.x = -side * w / 2; pivot.add(b);
    const k = new THREE.Mesh(new THREE.SphereGeometry(0.018, 16, 12), knob); k.position.set(-side * (w - 0.05), -0.04, 0.045); pivot.add(k);
    scene.add(pivot); return pivot;
  };
  const leaves = [leaf(-1), leaf(1)];

  const key = new THREE.SpotLight(0xffe7c2, 60, 30, 0.5, 0.6, 1.5); key.position.set(2.5, 5, 6); key.target = mark; scene.add(key);
  scene.add(new THREE.AmbientLight(0xffffff, 0.15));
  const rim = new THREE.DirectionalLight(0xfff1dc, 1.4); rim.position.set(-4, 2, -1); scene.add(rim); // filo di luce sul bordo sinistro

  const camera = new THREE.PerspectiveCamera(30, 1, 0.005, 200);
  const resize = () => { const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
  resize(); addEventListener('resize', resize);
  // distanza per avere il marchio alto ~34% dello schermo (più lontano su telefono stretto)
  const fitZ = () => ((yTop - yBot) / 0.34 / 2) / Math.tan(THREE.MathUtils.degToRad(15)) * Math.max(1, 0.75 / camera.aspect);
  const lookY = (yTop + yBot) / 2 + 0.35; // il marchio un po' sopra il centro: sotto ci sono scritta e percentuale

  // la luce rivela la torre già completa, la camera si porta di fronte, i battenti si aprono, si entra
  const st = { light: 0, orbit: 0, open: 0, dive: 0, ui: 0 };
  const lightK = key.intensity, envK = gold.envMapIntensity;
  gsap.timeline({ onComplete: () => finish(false) })
    .to(st, { light: 1, duration: 1.0, ease: 'power2.out' }, 0)
    .to(st, { ui: 1, duration: 0.8, ease: 'power2.out' }, 0.3)
    .to(st, { orbit: 1, duration: 1.8, ease: 'power2.inOut' }, 0)
    .to(st, { ui: 0, duration: 0.4, ease: 'power2.in' }, 1.7)
    .to(st, { open: 1, duration: 1.0, ease: 'power3.inOut' }, 1.75)
    .to(st, { dive: 1, duration: 1.5, ease: 'power3.in' }, 2.15);

  const v = new THREE.Vector3();
  el.classList.add('is-3d');
  const loop = () => {
    if (done) return;
    key.intensity = lightK * st.light; gold.envMapIntensity = envK * (0.15 + 0.85 * st.light);

    leaves[0].rotation.y = -st.open * 1.45; leaves[1].rotation.y = st.open * 1.45;

    // camera: di tre quarti → di fronte → dentro il vano
    const z0 = fitZ(), o = st.orbit, ang = (1 - o) * 0.42;
    const cx = Math.sin(ang) * z0, cz = Math.cos(ang) * z0, cy = lookY + (1 - o) * 0.5;
    const dz = THREE.MathUtils.lerp(cz, WALLZ - 0.6, st.dive), dy = THREE.MathUtils.lerp(cy, door.y, Math.min(1, st.dive * 1.6));
    camera.position.set(cx * (1 - st.dive), dy, dz);
    camera.lookAt(0, THREE.MathUtils.lerp(lookY, door.y, Math.min(1, st.dive * 1.6)), Math.min(0, dz - 1));
    renderer.render(scene, camera);

    // scritta e percentuale sotto la base della torre
    v.set(0, yBot, DEPTH / 2).project(camera);
    ui.style.top = `${((1 - v.y) / 2) * innerHeight + 34}px`;
    ui.style.opacity = st.ui;

    if (camera.position.z < WALLZ - 0.05) return finish(false);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  setTimeout(() => finish(false), 7000); // rete: qualsiasi intoppo, si entra comunque
}
