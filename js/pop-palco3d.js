/* IL PALCO 3D del Pop (20 nov 2026): una tela con le bottiglie di js/bottiglia-3d-kit.js appoggiate su un piano. Lo usano la pagina Chi siamo (js/pop-azienda.js, dove
   è nato il 19 nov) e il piede di tutte le pagine Pop (js/pop-piede.js). La macchina è quella della home (js/pop-prove.js: lontana, quasi senza prospettiva).
   nuova() carica una bottiglia di assets/3d con la sua ombra; metti() la posa: x centro e piede in frazioni della tela, hh altezza in frazioni dell'altezza, ry quanto è
   girata, tz quanto pende (fa perno sullo spigolo della base dalla parte dove pende, come una bottiglia vera che dondola). three e il kit si caricano solo alla prima tela.
   Dipende da: FS (js/main.js); three (importmap nella pagina). */
const fermo = FS.reduce, TAU = Math.PI * 2;
let moduli;
export async function palco3d(tela) {
  const [THREE, { creaBottiglia, ombraContatto, posaOmbra }] = await (moduli ??= Promise.all([import('three'), import('./bottiglia-3d-kit.js')]));
  const renderer = new THREE.WebGLRenderer({ canvas: tela, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const scena = new THREE.Scene(), D = 30, SU = THREE.MathUtils.degToRad(3), camera = new THREE.PerspectiveCamera(6, 1, 1, 100), m = { W: 1, H: 1, Vw: 1, Vh: 1 };
  camera.position.set(0, 0, D);
  const misura = () => {
    m.W = tela.clientWidth || 1; m.H = tela.clientHeight || 1; renderer.setSize(m.W, m.H, false);
    camera.aspect = m.W / m.H; camera.setFocalLength(200); camera.updateProjectionMatrix();
    m.Vh = 2 * D * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)); m.Vw = m.Vh * camera.aspect;
  };
  new ResizeObserver(misura).observe(tela); misura();
  const mira = { x: 0, y: 0 }, occhio = { x: 0, y: 0 }; /* dove sta il puntatore e dove guardano le bottiglie, che lo raggiungono piano (come nell'apertura di pop-b) */
  if (!fermo && matchMedia('(hover: hover) and (pointer: fine)').matches) addEventListener('pointermove', (e) => { mira.x = e.clientX / innerWidth - 0.5; mira.y = e.clientY / innerHeight - 0.5; }, { passive: true });
  const nuova = async (file) => {
    const bott = await creaBottiglia(renderer, 'assets/3d/' + file), perno = new THREE.Group(), asse = new THREE.Group();
    bott.position.y = -0.5; asse.add(bott); perno.add(asse); scena.add(perno); perno.rotation.order = 'XZY';
    const a = { perno, asse, r: new THREE.Box3().setFromObject(bott).max.x, collo: bott.userData.collo, k: 1, giro: 0, vel: 0, sosta: 0, px: 0, ombra: ombraContatto(bott.userData.chiara) };
    scena.add(a.ombra); perno.visible = a.ombra.visible = false;
    return a;
  };
  const metti = (a, { x, piede, hh, ry, tz = 0 }) => {
    const mezza = a.r * hh * (m.H / m.W), vis = x - mezza < 1.05 && x + mezza > -0.05;
    a.perno.visible = a.ombra.visible = vis; a.px = x * m.W;
    if (!vis) return;
    const alta = hh * m.Vh, rag = a.r * alta, px = (x - 0.5) * m.Vw, py = (0.5 - piede) * m.Vh, s = Math.sign(tz), c = Math.cos(tz), sn = Math.sin(tz); /* px, py: il punto d'appoggio */
    a.perno.position.set(px - s * rag * (1 - c) - (alta / 2) * sn, py + s * rag * sn + (alta / 2) * c, 0); /* il centro, girato attorno allo spigolo su cui pende */
    a.perno.scale.setScalar(alta); a.perno.rotation.set(SU + occhio.y * 0.12, 0, -occhio.x * 0.06 + tz); a.asse.rotation.y = ry + occhio.x * 0.5;
    posaOmbra(a.ombra, px, py, 2 * rag);
  };
  /* trascinando si gira la bottiglia più vicina al dito, fra quelle che quali() dice in scena; lasciata rallenta e torna di fronte dondolando appena (quieta, a ogni fotogramma) */
  let presa = null, ultimo = 0;
  const trascina = (quali) => {
    tela.addEventListener('pointerdown', (e) => { const x = e.clientX - tela.getBoundingClientRect().left, q = quali(); if (!q.length) return; presa = q.reduce((b, a) => (Math.abs(a.px - x) < Math.abs(b.px - x) ? a : b)); ultimo = e.clientX; presa.vel = 0; tela.setPointerCapture(e.pointerId); });
    tela.addEventListener('pointermove', (e) => { if (!presa) return; presa.vel = (e.clientX - ultimo) * 0.008; presa.giro += presa.vel; ultimo = e.clientX; });
    for (const ev of ['pointerup', 'pointercancel']) tela.addEventListener(ev, () => { if (presa) presa.sosta = performance.now() + 2000; presa = null; });
  };
  const quieta = (a, i, ora, dt) => {
    if (a === presa) return;
    a.giro += a.vel; a.vel *= 0.92;
    if (Math.abs(a.vel) < 0.002 && ora > a.sosta) a.giro += (Math.round(a.giro / TAU) * TAU + 0.18 * Math.sin(ora / 2600 + i * 1.9) - a.giro) * Math.min(1, dt * 0.9);
  };
  /* il giro di disegno: solo quando il palco è sullo schermo */
  const gira = (palco, passo) => { let prima = performance.now(); const f = (ora) => { requestAnimationFrame(f); const r = palco.getBoundingClientRect(); if (r.bottom <= 0 || r.top >= innerHeight) { prima = ora; return; } occhio.x += (mira.x - occhio.x) * 0.06; occhio.y += (mira.y - occhio.y) * 0.06; passo(ora, Math.min(0.05, (ora - prima) / 1000)); prima = ora; renderer.render(scena, camera); }; requestAnimationFrame(f); };
  return { m, nuova, metti, trascina, quieta, gira };
}
export const altezze = (att) => { const rif = att[0].collo; att.forEach((a) => (a.k = rif / a.collo)); return Math.max(...att.map((a) => a.k)); }; /* il collo è largo uguale in tutte: dà le altezze vere quando stanno insieme */
