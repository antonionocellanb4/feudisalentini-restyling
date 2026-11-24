/* PROVA dell'apertura Pop (18 nov 2026), pop-b.html. Seconda forma, dopo "non mi piace nessuno dei due: le bottiglie devono essere grandi quanto lo schermo, devono stare insieme come se
   fossero appoggiate sul fondo della hero, anche le foto le metterei in un'altra sezione" (le prove di prima in _archivio-prove/pop-a-18nov).
   Le quattro bottiglie 3D di js/bottiglia-3d-kit.js entrano rotolando da sinistra all'apertura e restano in fila, vicine, appoggiate sul piano con la loro ombra; nelle chiare la scritta
   dietro si vede attraverso il vino come attraverso una lente (rovesciata e ingrandita). La più alta arriva sotto l'header, le altre in proporzione
   (altezze vere: il collo sotto il tappo è largo uguale in tutte). Sul telefono la fila sta nella larghezza, quindi sono più basse. Trascinandola si gira la bottiglia più vicina al dito
   (lasciata, rallenta e torna di fronte); col mouse guardano un poco il puntatore. Scorrendo la frase dietro si apre e si passa alle collezioni: le altre
   tre rotolano via a destra (girano quanto si spostano, come rulli), dietro di loro entra da sinistra la scheda della Collezione 53 e la sua bottiglia resta, al centro. Dopo le collezioni le foto (js/pop-frase.js). Palco fermo con GSAP, ScrollTrigger e Lenis (js/main.js). Con le animazioni ridotte stanno ferme in fila.
   shortcut: prova, non collegata dal sito; se il 3D non parte resta la frase. */
import * as THREE from 'three';
import { creaBottiglia, ombraContatto, posaOmbra } from './bottiglia-3d-kit.js';
import { scritta, lenteVino, colore } from './lente-vino.js';

const $ = (q, r = document) => r.querySelector(q), $$ = (q, r = document) => [...r.querySelectorAll(q)];
const palco = $('.pp-apre .fo-apre__st'), tela = $('.pp-tela', palco), hero = palco.parentElement;
const fermo = matchMedia('(prefers-reduced-motion: reduce)').matches;
const tra = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v)), dolce = (t) => t * t * (3 - 2 * t);
/* il passaggio alla prima collezione ("la parte delle collezioni la passerei come seconda, per far apparire la prima collezione facendo rotolare le bottiglie e lasciando solo quella
   che serve"; poi "devono scorrere verso destra tutte" e "deve passare già alla seconda sezione"): js/pop-collezioni.js muove v da 0 a 1 coi primi 100lvh del suo palco.
   Qui le bottiglie (nastro e dove, più sotto); la Collezione 53 la disegna la tela delle collezioni, che sta sopra la scheda: si scrive in ppPassaggio.posa dove sta */
const passaggio = (window.ppPassaggio ??= { v: 0 });

/* ---- le prove: ?apertura=volo (senza: la fila) e ?foto= per la sezione foto (js/pop-frase.js). Il pannello in basso a sinistra le cambia.
   18 nov: "teniamo la fila e in volo, colore lasciamo bianco al momento, foto dammi altre alternative": Una, Giostra e il verde acido sono in _archivio-prove/pop-hero-varianti-18nov
   20 nov: "foto impostiamo lettere sia per botanica che per pop": Lettere vale senza niente nell'indirizzo, la Frase di prima è ?foto=frase (senza data-foto, come prima) ---- */
const qs = new URLSearchParams(location.search);
const MODI = { fila: 'Fila', volo: 'In volo' };
const FOTO = { frase: 'Frase', piena: 'Piena', sipario: 'Sipario', lettere: 'Lettere', tunnel: 'Tunnel', mosaico: 'Mosaico' };
const modo = MODI[qs.get('apertura')] ? qs.get('apertura') : 'fila', foto = qs.get('foto') in FOTO ? qs.get('foto') : 'lettere';
document.body.dataset.apertura = modo; if (foto !== 'frase') document.body.dataset.foto = foto;
/* i caratteri (19 nov: "proviamo londrina", "per i testi mettiamo un font lineare, non usiamo grotesk", "fallo su quello ufficiale"): la pagina nasce con Londrina Solid
   nei titoli e DM Sans nei testi (body[data-titoli][data-testi] nell'html, regole in fondo a css/pop-prove.css). ?titoli= e ?testi= ne provano un altro; "bricolage" toglie
   l'attributo e torna a com'era. Il nome qui è la famiglia: si chiede subito, così chi aspetta document.fonts.ready aspetta anche lei; arrivata, tutto si rimisura
   (lente, lettere, corsa della frase, nomi dei vini) */
const TITOLI = { londrina: 'Londrina Solid', unbounded: 'Unbounded', bricolage: 'Bricolage Grotesque' }, titoli = qs.get('titoli') in TITOLI ? qs.get('titoli') : 'londrina';
const TESTI = { dm: 'DM Sans', outfit: 'Outfit', figtree: 'Figtree', nunito: 'Nunito', bricolage: 'Bricolage Grotesque' }, testi = qs.get('testi') in TESTI ? qs.get('testi') : 'dm';
const bp = document.body.classList.contains('bp'); /* Botanica con questa impaginazione (botanica-pop.html, css/botanica-pop.css): i caratteri sono i suoi, niente prove dei caratteri del Pop */
/* il carattere di Botanica, scelto il 24 nov dopo le prove ("per la Botanica font da usare Instrument Serif e per paragrafi e pulsanti sempre DM Sans"): sta in css/botanica-pop.css */
const FONT_BP = ["400 1em 'Instrument Serif'", "italic 400 1em 'Instrument Serif'", "400 1em 'DM Sans'", "700 1em 'DM Sans'"];
if (!bp) {
  if (titoli === 'bricolage') delete document.body.dataset.titoli; else document.body.dataset.titoli = titoli;
  if (testi === 'bricolage') delete document.body.dataset.testi; else document.body.dataset.testi = testi;
}
Promise.all((bp ? FONT_BP : [`900 1em '${TITOLI[titoli]}'`, `400 1em '${TESTI[testi]}'`, `700 1em '${TESTI[testi]}'`]).map((c) => document.fonts.load(c).catch(() => {}))).then(() => { dispatchEvent(new Event('resize')); window.ScrollTrigger?.refresh(); });
/* 20 nov, il luogo e il bottone in basso a destra: "c'è altro che possiamo scrivere qui, o metterlo diversamente, e non so dove". Ora: com'era. Numeri: i vini e le collezioni
   (contati dai dati) al posto del luogo, che resta sotto in piccolo. A sinistra: lo stesso blocco dall'altra parte della fila, lontano dall'angolo del mood. Niente: solo frase e bottiglie */
/* Scelta sua, 20 nov: "tieni Numeri, ma cambierei il testo: da Leporano sul mar Ionio non vuol dire nulla". Sotto il numero ora cosa sono, per colore (dai dati: 20 rossi, 8 bianchi,
   4 rosati e un dolce). Numeri è la pagina senza niente nell'indirizzo; le altre restano nel pannello finché non dice di toglierle */
const RIGA = { numeri: 'Numeri', ora: 'Luogo', sinistra: 'A sinistra', via: 'Niente' }, riga = qs.get('riga') in RIGA ? qs.get('riga') : 'numeri';
if (riga !== 'ora') document.body.dataset.riga = riga;
if (riga === 'numeri') {
  const vini = FS.data.wines, quanti = [['rosso', 'rossi'], ['bianco', 'bianchi'], ['rosato', 'rosati'], ['dolce', 'dolci']].map(([t, tanti]) => [vini.filter((w) => w.tipo === t).length, t, tanti]).filter(([n]) => n).map(([n, t, tanti]) => (n === 1 ? `un&nbsp;${t}` : `${n}&nbsp;${tanti}`)); /* numero e colore non vanno a capo separati */
  $('.fo-apre__s').innerHTML = `<b class="pp-cifra">${vini.length} vini</b>in ${FS.data.collections.length}&nbsp;collezioni: ${quanti.length > 1 ? `${quanti.slice(0, -1).join(', ')} e ${quanti.at(-1)}` : quanti[0]}`;
}
const AZIENDA = { palco: 'Palco', pila: 'Pila', striscia: 'Striscia' }, azienda = qs.get('azienda') in AZIENDA ? qs.get('azienda') : 'palco'; /* le versioni della sezione sull'azienda: le fa js/pop-sotto.js, che legge lo stesso ?azienda= */
/* 19 nov: il verde acido come accento è stato provato sulla home e tolto ("lasciamo come era, togliamo l'accento, lasciamo i colori nella pagina stili"):
   _archivio-prove/pop-verde-acido-home-19nov; gli esempi restano in pop-stili.html#colore */
const verso = (k, v) => { const p = new URLSearchParams(location.search); if (v) p.set(k, v); else p.delete(k); return `?${p}`; };
const voci = (k, tutte, ora, base = '') => Object.entries(tutte).map(([v, n]) => `<a href="${verso(k, v === base ? '' : v)}"${v === ora ? ' aria-current="true"' : ''}>${n}</a>`).join(''); /* base: la voce che vale senza niente nell'indirizzo */
document.body.insertAdjacentHTML('beforeend', `<details class="pp-varianti"><summary>Prove: ${MODI[modo]} · foto ${FOTO[foto]} · ${bp ? 'Instrument Serif e DM Sans' : `${TITOLI[titoli]} e ${TESTI[testi]}`}</summary><nav aria-label="Varianti di prova"><p><span>Apertura</span>${voci('apertura', MODI, modo, 'fila')}</p><p><span>Foto</span>${voci('foto', FOTO, foto, 'lettere')}</p>${bp ? '' : `<p><span>Titoli</span>${voci('titoli', TITOLI, titoli, 'londrina')}</p><p><span>Testi</span>${voci('testi', TESTI, testi, 'dm')}</p>`}<p><span>Azienda</span>${voci('azienda', AZIENDA, azienda, 'palco')}</p><p><span>Sotto</span>${voci('riga', RIGA, riga, 'numeri')}</p></nav></details>`); /* chiuso è una linguetta: non copre luogo e bottone */

FS.mk?.titoli?.(); /* le parole [data-chars] entrano lettera per lettera */
const pillola = $('.m-pill'); pillola?.classList.add('in-storia'); /* la pillola "I nostri vini" non si vede dall'apertura alla fine delle foto, che vengono dopo le collezioni (un solo trigger: due si darebbero il cambio male) */
const sezFoto = $$('.pf, .pl, .pw, .pk, .pn, .pm').find((s) => getComputedStyle(s).display !== 'none'); /* la prova di foto scelta: le altre non hanno misura */
ScrollTrigger.create({ trigger: hero, endTrigger: sezFoto || '.pc', start: 'top bottom', end: 'bottom 40%', onToggle: (s) => pillola?.classList.toggle('in-storia', s.isActive) });

try {
  const renderer = new THREE.WebGLRenderer({ canvas: tela, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const scena = new THREE.Scene(), D = 30, SU = THREE.MathUtils.degToRad(3), camera = new THREE.PerspectiveCamera(6, 1, 1, 100);
  camera.position.set(0, 0, D);
  let Vh = 1, Vw = 1, W = 1, H = 1; /* quanto mondo si vede alla distanza delle bottiglie, e la tela in pixel */
  const misura = () => {
    W = tela.clientWidth; H = tela.clientHeight;
    renderer.setSize(W, H, false);
    camera.aspect = W / H; camera.setFocalLength(200); camera.updateProjectionMatrix();
    Vh = 2 * D * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)); Vw = Vh * camera.aspect;
  };
  new ResizeObserver(misura).observe(tela); misura();

  const mira = { x: 0, y: 0 }, occhio = { x: 0, y: 0 }; /* dove sta il puntatore e dove guardano le bottiglie, che lo raggiungono piano */
  const conMouse = !fermo && matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (conMouse) addEventListener('pointermove', (e) => { mira.x = e.clientX / innerWidth - 0.5; mira.y = e.clientY / innerHeight - 0.5; }, { passive: true });

  /* 19 nov: "bianco puglia organic sostituiscilo nella hero al posto di marpiccolo, philia metti negroamaro salento" (ho preso il Terra Negroamaro, quello con l'etichetta blu).
     Marpiccolo e Philia in 3D restano in assets/3d: "le teniamo, andranno usate altrove, specialmente nelle schede di prodotto". VINI: gli stessi, come stanno in js/data.js */
  const VINI = ['c53-primitivo', 'organic-bianco', 'tre-cuori', 'terra-negroamaro'];
  const att = await Promise.all(['primitivo53', 'organic-bianco', 'tre-cuori', 'terra-negroamaro'].map(async (nome) => {
    const bott = await creaBottiglia(renderer, 'assets/3d/' + nome), perno = new THREE.Group(), asse = new THREE.Group();
    bott.position.y = -0.5; asse.add(bott); perno.add(asse); scena.add(perno);
    perno.rotation.order = 'XZY';
    const r = new THREE.Box3().setFromObject(bott).max.x; /* il raggio del corpo in altezze di bottiglia: per stare vicine e per quanto girano rotolando */
    return { bott, perno, asse, r, collo: bott.userData.collo, k: 1, giro: 0, vel: 0, sosta: 0 };
  }));
  const rif = att[0].collo; att.forEach((a) => (a.k = rif / a.collo));
  const kMax = Math.max(...att.map((a) => a.k));

  /* ---- il liquido fa da lente (js/lente-vino.js): nelle bottiglie chiare la scritta dietro si vede attraverso il vino ingrandita e rovesciata da destra a sinistra ---- */
  const righe = $$('.pp-titolo > span'), strati = righe.map((el) => scritta(el, renderer));
  const disegnaRighe = () => strati.forEach((s) => s.disegna());
  document.fonts.ready.then(disegnaRighe); addEventListener('resize', () => setTimeout(disegnaRighe, 50));
  const inchiostro = colore(getComputedStyle(righe[0]).color, [20, 16, 13]);
  const luceScritta = { v: fermo ? 1 : 0 }; /* la scritta letta attraverso il vino compare quando quella vera ha finito di entrare */
  if (!fermo) gsap.to(luceScritta, { v: 1, duration: 0.6, delay: 1.5 });
  att.forEach((a) => {
    a.lente = lenteVino(a.bott); if (!a.lente) return; /* solo il vetro chiaro con la pelle di Blender */
    a.lente.riga0.value = strati[0].t; a.lente.riga1.value = strati[1].t; a.lente.inchiostro.value = inchiostro;
    a.lente.fondoA.value = a.lente.fondoB.value = colore(getComputedStyle(palco).backgroundColor); /* dietro il vetro c'è il fondo dell'apertura */
  });

  /* ---- le ombre di contatto sul piano (js/bottiglia-3d-kit.js) ---- */
  att.forEach((a) => { a.ombra = ombraContatto(a.bott.userData.chiara); a.ombraA = a.ombra.material.opacity; scena.add(a.ombra); });

  /* la fila: la più alta dal piano fin sotto l'header, vicine; se non sta nella larghezza (telefono) si rimpicciolisce tutta. Il piano poco sopra il bordo basso: lì si vede l'ombra */
  let fila = { h: 0.5, x: [], piano: 0.955 }, testaPx = 80;
  const header = () => (testaPx = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 80);
  header(); addEventListener('resize', header);
  const disponi = () => {
    const piano = W > 860 ? 0.955 : 0.965;
    let h = (piano - testaPx / H - 0.01) / kMax;
    const larghe = () => att.map((a) => 2 * a.r * h * a.k * H), spazio = W * 0.012;
    let tot = larghe().reduce((s, w) => s + w, 0) + spazio * 3;
    const max = W > 860 ? W - 2 * 270 : W * 0.94; /* sul computer resta l'angolo per luogo e bottone */
    if (tot > max) { h *= (max - spazio * 3) / (tot - spazio * 3); tot = max; }
    let x = (W - tot) / 2;
    fila = { h, piano, x: larghe().map((w) => { const c = (x + w / 2) / W; x += w + spazio; return c; }) };
  };

  /* all'apertura entrano rotolando da sinistra ("magari le farei partire da sinistra"), quella di destra per prima; scorrendo luogo e bottone vanno via e la frase si apre;
     col passaggio alla prima collezione scorrono a destra (nastro, più sotto) */
  const st = { entra: fermo || FS.arrivo ? 1 : 0 }; /* arrivati dal cambio di mood le bottiglie sono già al loro posto, come nell'onda */
  if (!st.entra) gsap.to(st, { entra: 1, duration: 2.4, ease: 'none', delay: 0.3 });
  const tl = gsap.timeline({ defaults: { ease: 'none' }, paused: fermo }) /* ferma con le animazioni ridotte: senza lo scorrimento che la guida partiva da sola e portava via luogo e bottone */
    .to('.fo-apre__s, .fo-apre__btn', { y: 30, autoAlpha: 0, duration: 0.3, ease: 'power2.in' }, 0.1)
    .to(righe[0], { xPercent: -10, duration: 3.4 }, 0)
    .to(righe[1], { xPercent: 10, duration: 3.4 }, 0)
    .to({}, { duration: 0.6 });
  if (!fermo) ScrollTrigger.create({ trigger: hero, start: 'top top', end: 'bottom bottom', animation: tl, scrub: 0.8 });
  const arrivo = (i) => { const u = tra(st.entra * 1.45 - (att.length - 1 - i) * 0.15); return 1 - Math.pow(1 - u, 3); }; /* quanto è arrivata, con frenata */
  const xDi = (i) => fila.x[i] - (1 - arrivo(i)) * (fila.x[att.length - 1] + 0.35);
  const esce = (u) => 1 - Math.pow(1 - tra(u), 3);

  /* dove sta ogni bottiglia nella variante scelta: x (frazione della larghezza), piede (dove poggia, frazione dell'altezza), hh (altezza), tz (inclinazione), rullo (quanto gira
     rotolando), ombra */
  const posa = (a, i, ora) => {
    const largo = W > 860, kk = a.k / kMax;
    if (modo === 'volo') { /* sospese e inclinate attorno alla frase, ondeggiano; salgono dal basso una dopo l'altra */
      const P = largo ? [[0.16, 0.42, 0.5, -14], [0.37, 0.67, 0.44, 9], [0.63, 0.36, 0.5, -8], [0.85, 0.5, 0.47, 13]] : [[0.76, 0.44, 0.26, -12], [0.22, 0.78, 0.26, 8], [0.55, 0.7, 0.27, -7], [0.84, 0.82, 0.26, 12]]; /* sul telefono lontane da luogo e bottone, a sinistra a metà */
      const [x0, y0, h0, t0] = P[i], hh = h0 * kk, y = y0 + (fermo ? 0 : Math.sin(ora / 1400 + i * 1.7) * 0.012) + (1 - esce(st.entra * 1.4 - i * 0.12)) * 1.0;
      return { x: x0, piede: y + hh / 2, hh, tz: THREE.MathUtils.degToRad(t0) + (fermo ? 0 : Math.sin(ora / 1900 + i) * 0.04), rullo: 0, ombra: false };
    }
    const hh = fila.h * a.k, x = xDi(i); /* la fila */
    return { x, piede: fila.piano, hh, tz: 0, rullo: ((x - fila.x[i]) * Vw) / (a.r * hh * Vh), ombra: true };
  };
  /* il passaggio alla prima collezione (18 nov: "devono scorrere verso destra tutte, riapparire a sinistra, lasciando poi la prima bottiglia della collezione", poi "deve passare
     già alla seconda sezione" e "la bottiglia deve rimanere, non deve rientrare"): le altre tre rotolano via a destra sempre più veloci; intanto da sinistra, subito dietro di loro,
     entra la scheda della Collezione 53 (js/pop-collezioni.js, che non le copre mai: passaggio.tetto è dove comincia, ombra compresa, la prima da sinistra disegnata qui sotto la
     scheda). La Collezione 53 resta: va al centro della prima collezione (passaggio.arrivo, in frazioni della tela: le due tele sono grandi uguali) girando di giri interi, così
     arriva di fronte; la disegna la tela delle collezioni, che sta sopra la scheda (passaggio.sopra: l'ha disegnata davvero, così non sparisce per un fotogramma). e = quanto è arrivata */
  const VA = 0.6, VS = 0.45; /* quando la 53 è al centro e quando le altre sono uscite */
  const nastro = (ora) => {
    const pp = att.map((a, i) => posa(a, i, ora)), M = 0.02 + Math.max(...pp.map((p, i) => att[i].r * p.hh * (H / W)));
    const serve = Math.max(...pp.slice(1).map((p) => 1 + M - p.x)); /* quanto devono andare a destra per uscire tutte */
    return { pp, o: serve * Math.pow(tra(passaggio.v / VS), 2), e: dolce(tra(passaggio.v / VA)) };
  };
  const dove = (a, i, n) => {
    const p = n.pp[i], A = passaggio.arrivo?.();
    if (fermo) return { ...p, e: 0 };
    if (i || !A) return { ...p, x: p.x + n.o, rullo: p.rullo + (n.o * Vw) / (a.r * p.hh * Vh), e: 0 }; /* rotolano via; senza la tela delle collezioni anche la 53 */
    const e = n.e, d = 0.5 - p.x, cy0 = p.piede - p.hh / 2, hh = p.hh + (A.h - p.hh) * e, cy = cy0 + (A.cy - cy0) * e;
    const giri = Math.sign(d) * Math.max(1, Math.round((Math.abs(d) * Vw) / (a.r * ((p.hh + A.h) / 2) * Vh * Math.PI * 2)));
    return { x: p.x + d * e, piede: cy + hh / 2, hh, tz: p.tz * (1 - e), rullo: p.rullo * (1 - e) + Math.PI * 2 * giri * e, ombra: p.ombra, e, su: passaggio.v > 0 };
  };

  /* trascinando si gira la bottiglia più vicina al dito; lasciata resta dov'è un attimo, poi torna di fronte */
  /* 19 nov: al passaggio sulle bottiglie non succede niente. Provati e tolti lo stesso giorno la nuvoletta col nome ("nella hero quelle nuvolette così non mi piacciono",
     _archivio-prove/pop-nuvoletta-apertura-19nov) e la frase che diventa il nome ("nella hero non cambiamo il titolo all'hover delle bottiglie, pensiamo ad altro",
     _archivio-prove/pop-frase-diventa-nome-19nov). Cosa metterci lo decide lui */
  let presa = null, px = 0;
  tela.addEventListener('pointerdown', (e) => {
    const x = e.clientX - tela.getBoundingClientRect().left, n = nastro(performance.now()), dist = att.map((a, i) => Math.abs(dove(a, i, n).x * W - x));
    presa = att[dist.indexOf(Math.min(...dist))];
    px = e.clientX; presa.vel = 0; tela.setPointerCapture(e.pointerId);
  });
  tela.addEventListener('pointermove', (e) => { if (!presa) return; presa.vel = (e.clientX - px) * 0.008; presa.giro += presa.vel; px = e.clientX; });
  for (const ev of ['pointerup', 'pointercancel']) tela.addEventListener(ev, () => { if (presa) presa.sosta = performance.now() + 2000; presa = null; });

  let pronto = false, prima = performance.now();
  const passo = (ora) => {
    requestAnimationFrame(passo);
    const r = palco.getBoundingClientRect(); if (pronto && (r.bottom <= 0 || r.top >= innerHeight)) return;
    const dt = Math.min(0.05, (ora - prima) / 1000); prima = ora;
    occhio.x += (mira.x - occhio.x) * 0.06; occhio.y += (mira.y - occhio.y) * 0.06;
    disponi();
    const n = nastro(ora);
    const tr = tela.getBoundingClientRect(), dpr = renderer.getPixelRatio();
    const rett = righe.map((el) => { const q = el.getBoundingClientRect(); return [q.left - tr.left, q.top - tr.top, q.width, q.height]; });
    let tetto = 9; /* fin dove può arrivare la scheda che entra da sinistra senza coprire una bottiglia di questa tela */
    att.forEach((a, i) => {
      if (a !== presa) { /* lasciata: rallenta, poi torna di fronte dondolando appena */
        a.giro += a.vel; a.vel *= 0.92;
        if (!fermo && Math.abs(a.vel) < 0.002 && ora > a.sosta) { const fronte = Math.round(a.giro / (Math.PI * 2)) * Math.PI * 2; a.giro += (fronte + 0.18 * Math.sin(ora / 2600 + i * 1.9) - a.giro) * Math.min(1, dt * 0.9); }
      }
      const p = dove(a, i, n); /* rotolando gira quanto si sposta (p.rullo) */
      const { x, hh } = p, mezza = a.r * hh * (H / W), vis = x - mezza < 1.05 && x + mezza > -0.05 && p.piede - hh < 1.02;
      a.perno.visible = vis && !(p.su && passaggio.sopra); /* nel passaggio la Collezione 53 la disegna la tela delle collezioni, che sta sopra la scheda */
      if (!p.su) tetto = Math.min(tetto, x - 2 * mezza); /* con l'ombra; anche fuori schermo, così la linea non salta */
      a.ombra.visible = vis && p.ombra; a.ombra.material.opacity = a.ombraA * (1 - p.e);
      a.perno.position.set((x - 0.5) * Vw, (0.5 - (p.piede - hh / 2)) * Vh, 0);
      a.perno.scale.setScalar(hh * Vh);
      a.perno.rotation.set(SU + occhio.y * 0.12, 0, -occhio.x * (0.06 + 0.02 * p.e) + p.tz);
      const giro = a.giro - Math.PI * 2 * Math.round(a.giro / (Math.PI * 2)); /* senza i giri interi fatti trascinando: verso il centro gira solo quanto serve */
      a.asse.rotation.y = p.e ? (giro + occhio.x * 0.5) * (1 - p.e) + (0.18 * Math.sin(ora / 2600) + occhio.x * 0.6) * p.e + p.rullo : a.giro + p.rullo + occhio.x * 0.5; /* alla fine uguale alla prima collezione */
      if (i === 0) passaggio.posa = p.su ? { x, cy: p.piede - hh / 2, h: hh, rx: a.perno.rotation.x, rz: a.perno.rotation.z, ry: a.asse.rotation.y } : null;
      posaOmbra(a.ombra, (x - 0.5) * Vw, (0.5 - p.piede) * Vh, 2 * a.r * hh * Vh); /* l'ombra portata, dietro la bottiglia (js/bottiglia-3d-kit.js) */
      if (a.lente) {
        const u = a.lente;
        u.scala.value = hh * H; u.asseX.value = x * W; u.dpr.value = dpr; u.tela.value.set(W * dpr, H * dpr); u.acceso.value = luceScritta.v;
        u.rett0.value.set(...rett[0]); u.rett1.value.set(...rett[1]);
      }
    });
    passaggio.tetto = tetto;
    renderer.render(scena, camera);
    if (!pronto) { pronto = true; palco.classList.add('is-3d'); }
  };
  requestAnimationFrame(passo);
} catch (e) { console.warn('prova Pop: il 3D non parte', e); }
