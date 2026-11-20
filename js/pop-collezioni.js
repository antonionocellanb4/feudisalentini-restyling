/* Le collezioni col 3D (18 nov 2026), nella pagina di prova pop-b.html subito dopo l'apertura (le foto vengono dopo): "raccontare le collezioni a sezione usando il 3D, poi con il clip-path passiamo all'altra
   collezione e la bottiglia mentre gira cambia". Seconda forma, dopo "la bottiglia stessa altezza; quando cambia si deve vedere e non a scatto, deve essere fluido; non il cerchio ma una
   scheda fissa che con il clip-path verso il lato mostra l'altra collezione, e il vino al centro man mano cambia mentre passa, anche quando ruota; unisci le due versioni".
   Palco fermo legato allo scorrimento (GSAP, ScrollTrigger e Lenis da js/main.js). Prima il passaggio dall'apertura: le altre bottiglie rotolano via a destra, dietro di loro entra da sinistra la scheda della Collezione 53 e la sua bottiglia resta e va al centro. Poi una scheda per
   collezione, ferme una sopra l'altra: la successiva si scopre da destra verso sinistra (clip-path), e la stessa linea passa sulla bottiglia: a destra della linea c'è già la bottiglia nuova,
   a sinistra ancora la vecchia (la scena si disegna due volte, ognuna tagliata dalla sua parte della linea); intanto girano insieme di due giri (a metà, quando la linea è sulla bottiglia, sono di fronte) e si fermano di fronte. Tutte alte uguale.
   Nella scheda: il nome gigante dietro la bottiglia, la frase della copertina del cliente e il racconto (js/dati-bf.js), a destra gli altri vini della collezione come foto del catalogo.
   Bottiglie: Collezione 53 Primitivo, 125 Primitivo, Tre Cuori per la Classica, Terra Primitivo (assets/3d). Con le animazioni ridotte si salta da una collezione all'altra.
   shortcut: Organic e Internazionali non ci sono perché le loro bottiglie non sono ancora in 3D. */
import * as THREE from 'three';
import { creaBottiglia } from './bottiglia-3d-kit.js';
import { scritta, lenteVino, colore } from './lente-vino.js';

const $ = (q, r = document) => r.querySelector(q), $$ = (q, r = document) => [...r.querySelectorAll(q)];
const sez = $('.pc'), palco = $('.pc-st', sez), tela = $('.pc-tela', palco);
const fermo = matchMedia('(prefers-reduced-motion: reduce)').matches;
const tra = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v)), dolce = (t) => t * t * (3 - 2 * t);

/* [collezione, file 3D, vino]: il vino che la rappresenta qui è quello che abbiamo in 3D */
const SCELTE = [['luxury', 'primitivo53', 'c53-primitivo'], ['lounge', '125-primitivo', '125-primitivo'], ['classica', 'tre-cuori', 'tre-cuori'], ['terra', 'terra-primitivo', 'terra-primitivo']];
const dati = FS.mk.collezioni();
const lista = SCELTE.map(([id, file, vino]) => ({ file, w: FS.wine(vino), c: dati.find((x) => x.col.id === id), bf: window.FS_BF.find((x) => x.id === id) }));
console.assert(lista.every((t) => t.w && t.c && t.bf), 'collezioni: manca un dato');
const N = lista.length, num = (i) => String(i + 1).padStart(2, '0');
palco.insertAdjacentHTML('afterbegin', lista.map((t, i) => `<article class="pc-pan" aria-labelledby="pc-n${i}">
    <p class="pc-cima"><span>${num(i)} / ${num(N - 1)}</span><span>${t.c.tipi}</span></p>
    <h2 class="pc-nome" id="pc-n${i}">${t.c.col.name}</h2>
    <div class="pc-sx">${t.bf.frase ? `<p class="pc-frase" lang="en">${t.bf.frase}</p>` : ''}<p class="pc-d">${t.bf.d}</p></div>
    <div class="pc-dx"><div class="pc-vini">${t.c.vini.filter((w) => w.id !== t.w.id).slice(0, 4).map((w) => `<a class="fo-bt" href="${FS.wineUrl(w.id)}" style="--b:${w.fondo}"><img src="${w.bottle}" alt="" width="653" height="1024" decoding="async" loading="lazy"><span>${w.name}</span></a>`).join('')}</div><a class="fo-link" href="${FS.wineUrl(t.w.id)}">${t.c.n > 5 ? `Tutti i ${t.c.n} vini` : 'I vini della collezione'}</a></div>
  </article>`).join(''));
const pannelli = $$('.pc-pan', palco);
/* Botanica con questa impaginazione (botanica-pop.html, css/botanica-pop.css): ogni scheda ha il colore della sua sala e dietro la bottiglia la targa delle copertine con la sua
   pianta, intera */
if (document.body.classList.contains('bp')) pannelli.forEach((p, i) => {
  const t = lista[i].bf, m = `url(assets/botanica/${t.pianta}.webp)`;
  p.style.cssText += `;--c:${t.c};--c2:${t.c2};--c3:${t.c3}`; p.insertAdjacentHTML('afterbegin', `<span class="bp-targa" aria-hidden="true"><i class="bp-pianta" style="-webkit-mask-image:${m};mask-image:${m}"></i></span>`);
});
/* gli altri vini: i nomi su una riga e mai uno sull'altro (19 nov, Terra e 125 Uno Due Cinque); si tolgono da destra finché fra due nomi restano 8 px, gli altri sono in "Tutti i N vini" */
const stanno = () => $$('.pc-vini', palco).forEach((v) => {
  const b = [...v.children]; b.forEach((e) => (e.style.display = ''));
  const stretti = () => { const r = b.filter((e) => e.offsetWidth).map((e) => e.lastElementChild.getBoundingClientRect()); return r.some((q, i) => i && r[i - 1].right + 8 > q.left); };
  for (let i = b.length - 1; i > 0 && stretti(); i--) b[i].style.display = 'none';
});
stanno(); document.fonts.ready.then(stanno); addEventListener('resize', stanno);
const PASSA = fermo ? 0 : 100; /* lvh del passaggio dall'apertura; senza movimento non c'è */
sez.style.height = `${100 + PASSA + (N - 1) * 130 + 30}lvh`; /* 100 il palco, il passaggio, poi le collezioni */
/* il passaggio (18 nov: "la parte delle collezioni la passerei come seconda, per far apparire la prima collezione facendo rotolare le bottiglie e lasciando solo quella che serve",
   poi "devono scorrere verso destra tutte, riapparire a sinistra, lasciando poi la prima bottiglia della collezione", "deve passare già alla seconda sezione" e "la bottiglia deve
   rimanere, non deve rientrare"): la sezione parte mentre il palco dell'apertura è ancora fermo (css/pop-prove.css). Nei primi 100lvh v va da 0 a 1: le altre bottiglie
   dell'apertura rotolano via a destra e subito dietro di loro entra da sinistra la scheda della Collezione 53, finita a v 0,5; la sua bottiglia resta e va al centro. Le bottiglie
   le muove js/pop-prove.js, che scrive qui dove sta la 53 (ppPassaggio.posa) e fin dove può arrivare la scheda senza coprire quelle che disegna lui sotto la scheda (ppPassaggio.tetto) */
const passaggio = (window.ppPassaggio ??= { v: 0 });
if (fermo) passaggio.v = 1;
else {
  gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: sez, start: 'top top', end: () => `+=${(innerHeight * PASSA) / 100}`, scrub: 0.8, invalidateOnRefresh: true } })
    .fromTo(passaggio, { v: 0 }, { v: 1, duration: 1 }, 0);
  let taglio = '';
  gsap.ticker.add(() => { /* la linea della prima scheda, da sinistra; scritta solo quando cambia */
    const L = passaggio.v >= 1 ? 1 : Math.min(tra(passaggio.v / 0.5), tra(passaggio.tetto ?? 1)), s = L >= 1 ? 'none' : `inset(0% ${(100 - L * 100).toFixed(2)}% 0% 0%)`;
    if (s !== taglio) pannelli[0].style.clipPath = taglio = s;
  });
}
ScrollTrigger.create({ trigger: sez, start: 'top top', end: 'bottom bottom', toggleClass: { targets: '.nav', className: 'pp-palco' } }); /* header senza vetro sul palco fermo (css/pop-prove.css) */ /* la pillola "I nostri vini" la nasconde js/pop-prove.js fino alla fine delle foto, che vengono dopo */

try {
  const renderer = new THREE.WebGLRenderer({ canvas: tela, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const scena = new THREE.Scene(), D = 30, SU = THREE.MathUtils.degToRad(3), camera = new THREE.PerspectiveCamera(6, 1, 1, 100);
  camera.position.set(0, 0, D);
  let Vh = 1, Vw = 1, W = 1, H = 1;
  const misura = () => {
    W = tela.clientWidth; H = tela.clientHeight;
    renderer.setSize(W, H, false);
    camera.aspect = W / H; camera.setFocalLength(200); camera.updateProjectionMatrix();
    Vh = 2 * D * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)); Vw = Vh * camera.aspect;
  };
  new ResizeObserver(misura).observe(tela); misura();
  const mira = { x: 0, y: 0 }, occhio = { x: 0, y: 0 };
  if (!fermo && matchMedia('(hover: hover) and (pointer: fine)').matches) addEventListener('pointermove', (e) => { mira.x = e.clientX / innerWidth - 0.5; mira.y = e.clientY / innerHeight - 0.5; }, { passive: true });

  const perno = new THREE.Group(), asse = new THREE.Group(); scena.add(perno); perno.add(asse); perno.rotation.order = 'XZY';
  const bott = await Promise.all(lista.map((t) => creaBottiglia(renderer, 'assets/3d/' + t.file)));
  bott.forEach((b) => { b.position.y = -0.5; b.visible = false; asse.add(b); }); /* tutte alte uguale ("la bottiglia stessa altezza") */
  const arrivo = () => (W > 860 ? { cy: 0.54, h: 0.66 } : { cy: 0.41, h: 0.29 }); /* il centro e l'altezza della bottiglia, in frazioni della tela */
  passaggio.arrivo = arrivo; /* da qui l'apertura sa dove portare la Collezione 53, e che questa tela è pronta a disegnarla */
  /* "ricordati che qui dentro c'è liquido": nella bottiglia chiara (Tre Cuori) il nome gigante della sua scheda si vede attraverso il vino, rovesciato e ingrandita (js/lente-vino.js);
     dietro c'è sempre la sua scheda: quando arriva è a destra della linea, quando se ne va a sinistra */
  const lenti = bott.map((b, i) => {
    const u = lenteVino(b); if (!u) return null;
    const nome = $('.pc-nome', pannelli[i]), s = scritta(nome, renderer);
    document.fonts.ready.then(s.disegna); addEventListener('resize', () => setTimeout(s.disegna, 50));
    u.riga0.value = s.t; u.inchiostro.value = colore(getComputedStyle(nome).color, [20, 16, 13]);
    u.fondoA.value = u.fondoB.value = colore(getComputedStyle(pannelli[i]).backgroundColor);
    return { u, nome };
  });

  /* p: a che collezione si è, anche a metà (1,5 = fra la seconda e la terza); fra un passaggio e l'altro resta fermo. Parte dopo il passaggio dall'apertura (PASSA) */
  const st = { p: 0 };
  const tl = gsap.timeline({ defaults: { ease: 'none' } });
  for (let k = 0; k < N - 1; k++) tl.to(st, { p: k + 1, duration: 1 }, 0.4 + k * 1.6);
  tl.to({}, { duration: 0.6 });
  const corsa = ScrollTrigger.create({ trigger: sez, start: `top top-=${PASSA}%`, end: 'bottom bottom', ...(fermo ? {} : { animation: tl, scrub: 0.8 }) });

  const passo = (ora) => {
    requestAnimationFrame(passo);
    const r = palco.getBoundingClientRect(); if (r.bottom <= 0 || r.top >= innerHeight) return;
    occhio.x += (mira.x - occhio.x) * 0.06; occhio.y += (mira.y - occhio.y) * 0.06;
    if (fermo) st.p = Math.round(corsa.progress * (N - 1)); /* senza movimento la scheda dallo scorrimento di adesso (con onUpdate a volte restava l'ultima) */
    const k = Math.min(N - 2, Math.floor(st.p)), f = st.p - k; /* passaggio dalla k alla k+1, e quanto è avanti */
    const { cy, h } = arrivo();
    /* la linea: da destra a sinistra; a destra la scheda e la bottiglia dopo */
    const avanti = fermo ? (f > 0.5 ? 1 : 0) : tra((f - 0.05) / 0.9), L = W * (1 - avanti); /* a velocità costante: sulla bottiglia non accelera */
    pannelli.forEach((p, j) => { if (j) p.style.clipPath = j <= k || (j === k + 1 && avanti >= 1) ? 'none' : j === k + 1 && avanti > 0 ? `inset(0 0 0 ${L.toFixed(1)}px)` : 'inset(0 0 0 100%)'; }); /* 'none': senza, tornerebbe la copertura di css/pop-prove.css */
    if (!fermo && passaggio.v < 1) { /* nel passaggio c'è solo la Collezione 53, dove la mette l'apertura */
      bott.forEach((b) => (b.visible = false));
      /* giu: tornando su lo scrub arriva dopo lo scorrimento, e intanto questa tela scende con la sezione ("si glitcha la bottiglia"); la 53 resta dove la disegna l'apertura, ferma */
      const q = passaggio.posa, giu = tela.getBoundingClientRect().top / H;
      if (passaggio.v > 0 && q) { perno.position.set((q.x - 0.5) * Vw, (0.5 - q.cy + giu) * Vh, 0); perno.scale.setScalar(q.h * Vh); perno.rotation.set(q.rx, 0, q.rz); asse.rotation.y = q.ry; bott[0].visible = true; }
      renderer.render(scena, camera); passaggio.sopra = bott[0].visible && Math.abs(giu) < 0.002; return; /* l'apertura la nasconde solo dopo che qui c'è, e solo a tela ferma: sopra il suo bordo la disegna lei */
    }
    /* la bottiglia: al centro, dove l'ha portata l'apertura; nei passaggi due giri (le due bottiglie girano insieme): così quando la linea la attraversa, a metà, è di fronte
       e si vedono le due etichette divise dalla linea; poi ferma di fronte, dondola appena */
    const x = 0.5;
    perno.position.set((x - 0.5) * Vw, (0.5 - cy) * Vh, 0);
    perno.scale.setScalar(h * Vh);
    perno.rotation.set(SU + occhio.y * 0.12, 0, -occhio.x * 0.08);
    asse.rotation.y = (fermo ? 0 : Math.PI * 4 * (k + dolce(f)) + 0.18 * Math.sin(ora / 2600)) + occhio.x * 0.6; /* uguale alla fine del passaggio in js/pop-prove.js */
    bott.forEach((b) => (b.visible = false));
    const tr = tela.getBoundingClientRect(), dpr = renderer.getPixelRatio();
    lenti.forEach((l) => { /* la lente: dove sta la bottiglia, quanto è grande, dove sta il nome dietro */
      if (!l) return;
      const q = l.nome.getBoundingClientRect();
      l.u.scala.value = h * H; l.u.asseX.value = x * W; l.u.dpr.value = dpr; l.u.tela.value.set(W * dpr, H * dpr); l.u.rett0.value.set(q.left - tr.left, q.top - tr.top, q.width, q.height);
    });
    const passa = avanti > 0 && avanti < 1;
    if (!passa) { bott[avanti >= 1 ? k + 1 : k].visible = true; renderer.render(scena, camera); return; }
    renderer.setScissorTest(true); /* due volte: la vecchia a sinistra della linea, la nuova a destra */
    bott[k].visible = true; renderer.setScissor(0, 0, L, H); renderer.render(scena, camera); bott[k].visible = false;
    bott[k + 1].visible = true; renderer.setScissor(L, 0, W - L, H); renderer.render(scena, camera); bott[k + 1].visible = false;
    renderer.setScissorTest(false);
  };
  requestAnimationFrame(passo);
} catch (e) { console.warn('collezioni 3D: non partono', e); }
