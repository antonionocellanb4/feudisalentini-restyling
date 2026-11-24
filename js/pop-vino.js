/* PAGINA DEL VINO nello stile Pop (19 nov 2026), pop-vino.html?id=<id di js/data.js>: "passiamo alla pagina del singolo vino", "voglio qualcosa di wow con il 3d".
   La bottiglia fa da rullo. All'apertura attraversa lo schermo rotolando e dietro di sé stampa il nome gigante; scorrendo torna indietro e, dove passa, cancella un capitolo
   e stampa il successivo: una riga sola taglia i due testi, e sta sempre sull'asse della bottiglia. Sul computer la bottiglia è in piedi sul piano e va da destra a sinistra
   e ritorno (gira quanto si sposta, come nell'apertura di pop-b.html); sul telefono è sdraiata, vista dall'alto, e va dal fondo dello schermo a sotto l'header e ritorno.
   Si ferma sempre di fronte (giri interi). Sul computer si gira trascinandola. Nelle bottiglie chiare il nome si legge attraverso il vino (js/lente-vino.js, taglio = la riga).
   Capitoli, tutti da js/data.js (catalogo del cliente): il nome con collezione e denominazione; il vino (la descrizione); nel calice e in tavola (la vista in grande,
   profumi, abbinamenti); in vigna e in cantina (zona, resa, gradazione, tecnica); i riconoscimenti, se ne ha. Sotto, gli altri vini della collezione: sei alla volta
   (fila sulla riga a pennarello; ?altri=righe per la prova a righe).
   Le bottiglie 3D sono in assets/3d (TRE_D); gli altri vini usano la foto del catalogo su un piano, che scivola senza girare: la foto non si tocca, si taglia solo il
   riflesso sotto il vetro (w.fondo). Con le animazioni ridotte, o se il 3D non parte, niente palco: la foto e i capitoli uno sotto l'altro (css/pop-vino.css).
   Dipende da: three (importmap nella pagina), gsap, ScrollTrigger, FS (js/main.js), FS.mk (js/moderna-kit.js). */
import * as THREE from 'three';
import { creaBottiglia, ombraContatto, posaOmbra } from './bottiglia-3d-kit.js';
import { scritta, lenteVino, colore } from './lente-vino.js';

const $ = (q, r = document) => r.querySelector(q), $$ = (q, r = document) => [...r.querySelectorAll(q)];
const tra = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const fermo = matchMedia('(prefers-reduced-motion: reduce)').matches;
const D = FS.data, w = FS.wine(new URLSearchParams(location.search).get('id')) || D.wines[0], col = FS.collection(w.collection);
document.title = `${w.name} · Feudi Salentini`;
/* vino → file in assets/3d. shortcut: dieci bottiglie su trentatré; per le altre serve tools/bottiglia_3d.py (misure sulla foto), poi una riga qui */
const TRE_D = { 'c53-primitivo': 'primitivo53', '125-primitivo': '125-primitivo', '125-negroamaro': '125-negroamaro', 'tre-cuori': 'tre-cuori', marpiccolo: 'marpiccolo', philia: 'philia', 'terra-primitivo': 'terra-primitivo', 'terra-negroamaro': 'terra-negroamaro', 'terra-rosato': 'terra-rosato', 'organic-bianco': 'organic-bianco' };
const RIGA = '<svg class="pp-riga" viewBox="0 0 1000 12" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M3 7 C120 2 260 11 400 6 S700 2 860 7 S960 9 997 5"/></svg>';

/* ---- il contenuto ---- */
const sez = $('.sv'), palco = $('.sv-st'), dentro = $('.sv-dentro'), tela = $('.sv-tela'), presa = $('.sv-presa');
/* Botanica con questa impaginazione (vino-b.html, css/botanica-pop.css; 24 nov: "la struttura come pop-vino ma con stile botanico"): il colore di sala della collezione del vino
   e, dietro i capitoli, la targa delle copertine con la sua pianta intera (come le schede di js/pop-collezioni.js) */
const sala = document.body.classList.contains('bp') && window.FS_BF?.find((x) => x.id === w.collection);
if (sala) { const m = `url(assets/botanica/${sala.pianta}.webp)`; for (const el of [sez, $('.sv-altri')]) el.style.cssText += `;--c:${sala.c};--c2:${sala.c2};--c3:${sala.c3}`; dentro.insertAdjacentHTML('afterbegin', `<span class="bp-targa" aria-hidden="true"><i class="bp-pianta" style="-webkit-mask-image:${m};mask-image:${m}"></i></span>`); }
const premi = [...w.premi].sort((a, b) => b.anno - a.anno), aromi = w.aromi.join(', ').replace(/^./, (c) => c.toUpperCase());
const dl = (c, v) => `<dl class="${c}">${v.filter(([, x]) => x).map(([k, x]) => `<div><dt>${k}</dt><dd>${x}</dd></div>`).join('')}</dl>`;
const capitoli = [
  ['vino', w.denom, `<p class="sv-lead">${w.desc}</p>`],
  ['calice', 'Nel calice e in tavola', `<div class="sv-due"><p class="sv-h">${w.vista}.</p>${dl('sv-dl', [['Profumi', aromi], ['In tavola', w.abb]])}</div>`],
  ['cantina', 'In vigna e in cantina', `${dl('sv-fatti', [['Zona', w.zona], ['Resa', w.resa], ['Gradazione', w.alcool]])}${w.tecnica ? `<p class="sv-p">${w.tecnica}</p>` : ''}`],
  premi.length && ['premi', 'Riconoscimenti', `<div class="sv-due"><p class="sv-h"><b>${premi.length}</b> ${premi.length === 1 ? 'riconoscimento' : 'riconoscimenti'}.</p><ul class="sv-medaglie">${premi.map((p) => `<li><img src="${p.img}" alt="" width="96" height="96" loading="lazy" decoding="async"><b>${p.medaglia} ${p.anno}</b><span>${p.concorso}</span></li>`).join('')}</ul></div>`]
].filter(Boolean);
const num = (i) => String(i).padStart(2, '0');
dentro.insertAdjacentHTML('beforeend', `<article class="sv-sc sv-sc--apre is-a"><div class="sv-in">
    <h1 class="sv-vh" id="sv-t">${w.name}</h1>
    <img class="sv-foto" src="${w.bottle}" alt="La bottiglia di ${w.name}" width="653" height="1024" decoding="async" style="--b:${w.fondo}">
    <p class="sv-nome" aria-hidden="true"><span>${w.name}</span></p>
    <div class="sv-meta"><button class="fo-link" type="button" data-col="${w.collection}">${col.name}</button><p>${[w.denom, w.uve, w.alcool].filter(Boolean).join(' · ')}</p></div>
  </div></article>` + capitoli.map(([k, t, h], i) => `<article class="sv-sc sv-sc--${k} ${i % 2 ? 'is-a' : 'is-b'}"><div class="sv-in">${RIGA}<h2 class="sv-k"><b>${num(i + 1)}</b><span>${t}</span></h2>${h}</div></article>`).join(''));
$$('[data-col]', sez).forEach((b) => b.addEventListener('click', () => FS.mk.apri(b.dataset.col)));
const scene = $$('.sv-sc', dentro), N = scene.length, nome = $('.sv-nome'), stretto = () => innerWidth <= 860;

/* ---- il nome gigante: si prova ogni modo di andare a capo (due righe, tre sul telefono) e si tiene quello che lo fa più grande nel suo spazio ---- */
/* su due righe certe parole non si separano ("Collezione" a capo e "53 Primitivo" sotto si leggeva male); su tre, sul telefono, ogni parola ha la sua riga e l'ordine basta */
const UNITE = ['Collezione 53', 'Nero di Troia', 'Malvasia Bianca', 'Malvasia Nera', 'Pinot Grigio'], metro = document.createElement('canvas').getContext('2d');
const spezza = (testo, n) => { const parole = (n < 3 ? UNITE.reduce((s, u) => s.replace(u, u.replace(/ /g, '\u00a0')), testo) : testo).split(' ').map((s) => s.replace(/\u00a0/g, ' ')), out = []; const vai = (i, r) => { if (i === parole.length) return out.push(r); if (r.length) vai(i + 1, [...r.slice(0, -1), `${r.at(-1)} ${parole[i]}`]); if (r.length < n) vai(i + 1, [...r, parole[i]]); }; vai(0, []); return out; };
/* scrive testo in el su al più n righe, grande quanto sta in zw x zh (tetto: mai più alto di questa parte di zh). Fra i modi di andare a capo vince il carattere più grande;
   con pieno vince chi riempie di più l'altezza (il nome della collezione accanto alle bottiglie: su due righe è alto quanto loro) */
const inRighe = (el, testo, zw, zh, n, tetto = 1, pieno = false) => {
  const cn = getComputedStyle(el), alta = parseFloat(cn.lineHeight) / parseFloat(cn.fontSize) || 0.86;
  metro.font = `${cn.fontWeight} 100px ${cn.fontFamily}`; metro.letterSpacing = `${((parseFloat(cn.letterSpacing) || 0) / parseFloat(cn.fontSize)) * 100}px`;
  let meglio = null;
  for (const r of spezza(testo, n)) { const fs = Math.min((zw * 100) / Math.max(...r.map((s) => metro.measureText(s).width)), zh / (r.length * alta), zh * tetto), voto = pieno ? fs * r.length : fs; if (!meglio || voto > meglio.voto + 0.5) meglio = { fs, r, voto }; }
  el.style.fontSize = `${Math.floor(meglio.fs)}px`;
  if (el.dataset.r !== meglio.r.join('|')) { el.dataset.r = meglio.r.join('|'); el.innerHTML = meglio.r.map((s) => `<span>${s}</span>`).join(''); }
};
let dopoNome = () => {};
const adatta = () => {
  if (!sez.classList.contains('is-viva')) { nome.style.fontSize = ''; return; }
  const sc = scene[0], cs = getComputedStyle(sc), meta = $('.sv-meta', sc);
  inRighe(nome, w.name, sc.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight), sc.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - meta.offsetHeight - parseFloat(getComputedStyle(meta).marginTop), stretto() ? 3 : 2, 0.74);
  dopoNome();
};

/* ---- gli altri vini della collezione: mai più di sei bottiglie alla volta, "Altri N vini" per le altre.
   Rifatta il 19 nov ("questa non mi piace": erano foto piccole sparse su tutta la riga; quella versione è in _archivio-prove/pop-vino-altri-griglia-19nov).
   Fila: le bottiglie grandi e vicine, in piedi su una riga a pennarello; fino a tre stanno accanto al nome gigante della collezione, che poggia sulla stessa riga,
   da quattro in su il nome sta sopra e la fila prende la larghezza. Entrano scivolando da destra. Righe (?altri=righe, dal pannello Prove): una riga per vino,
   nome gigante e bottiglia sdraiata. Il meccanismo l'ho scelto io: aspetta il suo giudizio ---- */
const altri = D.wines.filter((x) => x.collection === w.collection && x !== w);
if (altri.length) {
  const sa = $('.sv-altri'), banco = $('.sv-banco', sa), coll = $('.sv-coll', sa), fila = $('.sv-fila', sa), b = $('.sv-altri__b', sa);
  const qs = new URLSearchParams(location.search), FORME = { fila: 'Fila', righe: 'Righe' }, forma = qs.get('altri') in FORME ? qs.get('altri') : 'fila';
  const corto = (x) => x.name.replace(/^(Collezione 53|125 Organic|125|Terra)\s+/, '').replace(/\s+(Organic|Edition)$/, '') || x.name;
  const foto = (x) => `<img src="${x.bottle}" alt="" width="653" height="1024" loading="lazy" decoding="async">`;
  sa.classList.add('is-' + forma);
  let da = 0;
  /* il nome della collezione: accanto alle bottiglie su due righe al più, alto fino a metà bottiglia; sopra (tante bottiglie, righe, telefono) su una riga, due sul telefono */
  const misura = () => {
    const accanto = forma === 'fila' && !stretto() && !banco.classList.contains('is-tanti');
    if (accanto) inRighe(coll, col.name, coll.clientWidth, fila.firstElementChild.firstElementChild.offsetHeight, 2, 0.8, true);
    else inRighe(coll, col.name, banco.clientWidth, innerHeight * (stretto() ? 0.3 : 0.26), stretto() ? 2 : 1);
  };
  const mostra = (entra) => {
    const v = altri.slice(da, da + 6);
    fila.innerHTML = v.map((x) => (forma === 'righe'
      ? `<a class="sv-altro" href="${FS.wineUrl(x.id)}" style="--b:${x.fondo}">${RIGA}<b>${corto(x)}</b><span>${x.denom}</span><i>${foto(x)}</i></a>`
      : `<a class="fo-bt" href="${FS.wineUrl(x.id)}" style="--b:${x.fondo}">${foto(x)}<span>${corto(x)}</span></a>`)).join('');
    banco.classList.toggle('is-tanti', v.length > 3); fila.style.setProperty('--n', v.length);
    const resto = altri.length - da - 6; b.hidden = altri.length <= 6; b.textContent = resto > 0 ? `Altri ${resto} vini` : 'Ricomincia';
    misura();
    if (entra && !fermo) gsap.from(forma === 'righe' ? $$('i', fila) : fila.children, { x: () => innerWidth * 0.5, duration: 1.1, ease: 'power3.out', stagger: 0.08, clearProps: 'transform' });
  };
  b.addEventListener('click', () => { da = da + 6 < altri.length ? da + 6 : 0; mostra(true); });
  sa.hidden = false; mostra();
  document.fonts.ready.then(misura); addEventListener('resize', () => setTimeout(misura, 80));
  if (!fermo) { /* la riga si disegna e le bottiglie arrivano quando la sezione entra */
    sa.classList.add('sv-attesa');
    const vede = new IntersectionObserver(([e]) => { if (!e.isIntersecting) return; vede.disconnect(); sa.classList.add('is-su'); mostra(true); }, { rootMargin: '0px 0px -18% 0px' });
    vede.observe(banco);
  }
  const verso = (v) => { const q = new URLSearchParams(location.search); if (v === 'fila') q.delete('altri'); else q.set('altri', v); return `?${q}`; };
  document.body.insertAdjacentHTML('beforeend', `<details class="pp-varianti"><summary>Prove: altri vini ${FORME[forma]}</summary><nav aria-label="Varianti di prova"><p><span>Altri vini</span>${Object.entries(FORME).map(([k, n]) => `<a href="${verso(k)}"${k === forma ? ' aria-current="true"' : ''}>${n}</a>`).join('')}</p></nav></details>`);
}

/* i capitoli devono stare nel loro spazio (telefoni bassi, descrizioni lunghe): se uno sborda, i suoi testi si stringono a passi del 4% */
const stringi = () => scene.forEach((sc) => {
  const dentroSc = $('.sv-in', sc), cs = getComputedStyle(sc);
  for (let z = 1; z > 0.6; z -= 0.04) { sc.style.setProperty('--sv-z', z.toFixed(2)); if (dentroSc.offsetHeight <= sc.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) + 1) break; }
});

/* un vino senza bottiglia 3D: la foto del catalogo su un piano, alta 1 col fondo del vetro a quota 0 come le bottiglie del kit. Della foto si usa il riquadro della bottiglia
   (dal tappo a dove finisce il vetro: sotto c'è il riflesso), letto sulla trasparenza; r = mezza larghezza, in altezze di bottiglia */
async function creaFoto(renderer, v) {
  const im = await new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = v.bottle; });
  const c = document.createElement('canvas'), g = c.getContext('2d', { willReadFrequently: true }); c.width = im.naturalWidth; c.height = im.naturalHeight; g.drawImage(im, 0, 0);
  const giu = Math.round(c.height * v.fondo), d = g.getImageData(0, 0, c.width, giu).data;
  let su = giu, sx = c.width, dx = 0;
  for (let y = 0; y < giu; y++) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3] > 24) { if (y < su) su = y; if (x < sx) sx = x; if (x > dx) dx = x; }
  console.assert(giu > su && dx > sx, 'foto del vino: non trovo la bottiglia');
  const alto = giu - su, largo = (dx - sx + 1) / alto, geo = new THREE.PlaneGeometry(largo, 1), uv = geo.attributes.uv;
  geo.translate(0, 0.5, 0);
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (sx + uv.getX(i) * (dx - sx + 1)) / c.width, 1 - (su + (1 - uv.getY(i)) * alto) / c.height);
  const t = new THREE.Texture(im); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = renderer.capabilities.getMaxAnisotropy(); t.needsUpdate = true;
  const gr = new THREE.Group(); gr.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: t, transparent: true, toneMapped: false }))); /* senza luci né tone mapping: i colori della foto */
  gr.userData.piatta = true; return gr;
}

async function viva() {
  const renderer = new THREE.WebGLRenderer({ canvas: tela, antialias: true, alpha: true }); /* se il 3D non c'è si ferma qui, prima di cambiare la pagina */
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  sez.classList.add('is-viva');
  sez.style.height = `${100 + (N - 1) * 130 + 30}lvh`; /* 100 il palco, poi un passaggio per capitolo */
  const st = { p: 0, entra: 0 }; /* p: a che capitolo si è, anche a metà; fra un passaggio e l'altro resta fermo. entra: la corsa d'apertura */
  const tl = gsap.timeline({ defaults: { ease: 'none' } });
  for (let k = 0; k < N - 1; k++) tl.to(st, { p: k + 1, duration: 1 }, 0.4 + k * 1.6);
  tl.to({}, { duration: 0.6 });
  ScrollTrigger.create({ trigger: sez, start: 'top top', end: 'bottom bottom', animation: tl, scrub: 0.8 });
  ScrollTrigger.create({ trigger: sez, start: 'top top', end: 'bottom bottom', toggleClass: { targets: '.nav', className: 'pp-palco' } }); /* header senza vetro sul palco fermo (css/pop-prove.css) */
  const pillola = $('.m-pill'); pillola?.classList.add('in-storia'); /* la pillola "I nostri vini" non sta sopra il palco né sopra gli altri vini */
  ScrollTrigger.create({ trigger: sez, endTrigger: altri.length ? '.sv-altri' : sez, start: 'top bottom', end: 'bottom 40%', onToggle: (s) => pillola?.classList.toggle('in-storia', s.isActive) }); /* fino alla fine degli altri vini: lì sotto copriva i nomi delle bottiglie */

  const scena = new THREE.Scene(), DIST = 30, SU = THREE.MathUtils.degToRad(3), camera = new THREE.PerspectiveCamera(6, 1, 1, 100);
  camera.position.set(0, 0, DIST);
  let Vh = 1, Vw = 1, W = 1, H = 1; /* quanto mondo si vede alla distanza della bottiglia, e la tela in pixel */
  const misura = () => {
    W = tela.clientWidth; H = tela.clientHeight;
    renderer.setSize(W, H, false);
    camera.aspect = W / H; camera.setFocalLength(200); camera.updateProjectionMatrix();
    Vh = 2 * DIST * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)); Vw = Vh * camera.aspect;
  };
  new ResizeObserver(misura).observe(tela); misura();

  const file = TRE_D[w.id];
  const bott = await (file ? creaBottiglia(renderer, 'assets/3d/' + file).catch((e) => { console.warn('bottiglia 3D: non arriva, uso la foto', e); return creaFoto(renderer, w); }) : creaFoto(renderer, w));
  const piatta = !!bott.userData.piatta, perno = new THREE.Group(), asse = new THREE.Group();
  bott.position.y = -0.5; asse.add(bott); perno.add(asse); scena.add(perno); perno.rotation.order = 'XZY';
  const r = new THREE.Box3().setFromObject(bott).max.x; /* il raggio del corpo in altezze di bottiglia: quanto posto occupa e quanto gira rotolando */
  const lente = piatta ? null : lenteVino(bott); /* solo il vetro chiaro con la pelle di Blender */
  const ombra = ombraContatto(bott.userData.chiara), ombraA = ombra.material.opacity; scena.add(ombra);
  sez.classList.toggle('is-piatta', piatta);

  /* dove si ferma la bottiglia. Computer: in piedi sul piano, alta dall'header al piano, a (destra) e b (sinistra). Telefono: sdraiata, lunga quasi quanto lo schermo,
     a (in fondo) e b (sotto l'header). I capitoli lasciano libero quel posto: --sv-lato, --sv-su e --sv-giu (css/pop-vino.css) */
  let geo = {}, testa = 76;
  const disponi = () => {
    testa = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 76;
    const largo = W > 860, pad = Math.max(16, Math.min(W * 0.04, 56));
    if (largo) {
      const piano = 0.955, hh = piano - testa / H - 0.012, mezza = r * hh * H, cy = piano - hh / 2;
      geo = { largo, piano, hh, mezza, a: { x: (W - pad - mezza) / W, cy }, b: { x: (pad + mezza) / W, cy }, lato: pad + 2 * mezza + Math.max(24, W * 0.03) };
    } else {
      const lungo = Math.min(W * 0.94, 520), mezza = r * lungo;
      geo = { largo, hh: lungo / H, mezza, a: { x: 0.5, cy: (H - 12 - mezza) / H }, b: { x: 0.5, cy: (testa + 6 + mezza) / H }, su: testa + 6 + 2 * mezza + 14, giu: 12 + 2 * mezza + 14 };
    }
    const v = geo.largo ? `${geo.lato.toFixed(0)}` : `${geo.su.toFixed(0)}|${geo.giu.toFixed(0)}`;
    if (dentro.dataset.posto !== v) { /* scritto solo quando cambia: poi nome e capitoli si rimisurano */
      dentro.dataset.posto = v;
      for (const [k, x] of [['--sv-lato', geo.lato], ['--sv-su', geo.su], ['--sv-giu', geo.giu]]) x ? dentro.style.setProperty(k, `${x.toFixed(0)}px`) : dentro.style.removeProperty(k);
      adatta(); stringi();
    }
  };
  const posto = (i) => (i % 2 ? geo.b : geo.a); /* il nome ha la bottiglia in a, poi si alternano */

  /* la lente del vino: le prime due righe del nome, rifatte quando il nome cambia misura o va a capo in un altro modo */
  let strati = [];
  const inchiostro = colore(getComputedStyle(nome).color, [20, 16, 13]);
  dopoNome = () => {
    if (!lente) return;
    strati.forEach((s) => s.t.dispose());
    strati = $$('span', nome).slice(0, 2).map((el) => ({ el, ...scritta(el, renderer) }));
    strati.forEach((s) => s.disegna());
    lente.riga0.value = strati[0]?.t ?? null; lente.riga1.value = strati[1]?.t ?? null; lente.inchiostro.value = inchiostro;
    lente.fondoA.value = lente.fondoB.value = colore(getComputedStyle(sez).backgroundColor);
  };
  disponi();
  document.fonts.ready.then(() => { adatta(); stringi(); ScrollTrigger.refresh(); });
  addEventListener('resize', () => setTimeout(() => { misura(); dentro.dataset.posto = ''; disponi(); }, 60));

  const mira = { x: 0, y: 0 }, occhio = { x: 0, y: 0 }; /* dove sta il puntatore e dove guarda la bottiglia, che lo raggiunge piano */
  if (!piatta && matchMedia('(hover: hover) and (pointer: fine)').matches) addEventListener('pointermove', (e) => { mira.x = e.clientX / innerWidth - 0.5; mira.y = e.clientY / innerHeight - 0.5; }, { passive: true });
  /* trascinandola si gira (solo in piedi, e solo il 3D); lasciata rallenta, resta dov'è un attimo, poi torna di fronte */
  let preso = false, px = 0, giro = 0, vel = 0, sosta = 0;
  presa.addEventListener('pointerdown', (e) => { if (piatta) return; preso = true; px = e.clientX; vel = 0; presa.setPointerCapture(e.pointerId); });
  presa.addEventListener('pointermove', (e) => { if (!preso) return; vel = (e.clientX - px) * 0.008; giro += vel; px = e.clientX; });
  for (const ev of ['pointerup', 'pointercancel']) presa.addEventListener(ev, () => { if (preso) sosta = performance.now() + 2000; preso = false; });

  if (scrollY > 10 || FS.arrivo) st.entra = 1; /* pagina riaperta già scorsa, o arrivata dal cambio di mood: niente corsa d'apertura */
  else gsap.to(st, { entra: 1, duration: 2.1, ease: 'none', delay: 0.15 });

  const NIENTE = 'inset(0 100% 0 0)', taglio = scene.map(() => '');
  const taglia = (j, c) => { if (taglio[j] === c) return; taglio[j] = c; scene[j].style.clipPath = c; scene[j].style.visibility = c === NIENTE ? 'hidden' : 'visible'; };
  let pronto = false, prima = performance.now();
  const passo = (ora) => {
    requestAnimationFrame(passo);
    const q = palco.getBoundingClientRect(); if (pronto && (q.bottom <= 0 || q.top >= innerHeight)) return;
    const dt = Math.min(0.05, (ora - prima) / 1000); prima = ora;
    occhio.x += (mira.x - occhio.x) * 0.06; occhio.y += (mira.y - occhio.y) * 0.06;
    disponi();
    const { largo, hh, mezza } = geo, k = Math.min(N - 2, Math.floor(st.p)), f = st.p - k, av = tra((f - 0.04) / 0.92); /* a velocità costante: la riga non accelera sui testi */
    const da = posto(k), a = posto(k + 1), arr = 1 - Math.pow(1 - tra(st.entra), 3), apre = arr < 1 && st.p === 0;
    let x = da.x + (a.x - da.x) * av, cy = da.cy + (a.cy - da.cy) * av;
    /* la corsa d'apertura: da fuori schermo (sinistra, o sopra sul telefono) fino al suo posto, frenando; rotola quanto si sposta */
    const fuori = largo ? geo.a.x + mezza / W + 0.04 : geo.a.cy + mezza / H + 0.04, corsa = (1 - arr) * fuori;
    if (largo) x -= corsa; else cy -= corsa;
    /* nei passaggi gira di giri interi, quanti ne farebbe rotolando: arriva sempre di fronte */
    const via = largo ? (a.x - da.x) * W : (a.cy - da.cy) * H, giri = Math.sign(via) * Math.max(1, Math.round(Math.abs(via) / (Math.PI * 2 * mezza)));
    const rullo = Math.PI * 2 * giri * av - (corsa * (largo ? W : H)) / mezza;
    if (!preso) { giro += vel; vel *= 0.92; if (Math.abs(vel) < 0.002 && ora > sosta) { const fronte = Math.round(giro / (Math.PI * 2)) * Math.PI * 2; giro += (fronte + 0.18 * Math.sin(ora / 2600) - giro) * Math.min(1, dt * 0.9); } }

    /* la riga: sull'asse della bottiglia. Chi arriva sta dalla parte da cui la bottiglia viene, chi se ne va dall'altra */
    const A = largo ? x * W : cy * H, avanti = via > 0;
    const prima_ = largo ? `inset(0 ${(W - A).toFixed(1)}px 0 0)` : `inset(0 0 ${(H - A).toFixed(1)}px 0)`, dopo = largo ? `inset(0 0 0 ${A.toFixed(1)}px)` : `inset(${A.toFixed(1)}px 0 0 0)`; /* prima: a sinistra (o sopra) della riga */
    scene.forEach((_, j) => {
      if (j === k) taglia(j, apre ? prima_ : av <= 0 ? 'none' : av >= 1 ? NIENTE : avanti ? dopo : prima_);
      else if (j === k + 1) taglia(j, av >= 1 ? 'none' : av <= 0 ? NIENTE : avanti ? prima_ : dopo);
      else taglia(j, NIENTE);
    });

    perno.position.set((x - 0.5) * Vw, (0.5 - cy) * Vh, 0);
    perno.scale.setScalar(hh * Vh);
    perno.rotation.set(largo ? SU + occhio.y * 0.12 : 0, 0, largo ? -occhio.x * 0.06 : -Math.PI / 2); /* sul telefono sdraiata, col collo a destra */
    asse.rotation.y = piatta ? 0 : rullo + giro + (largo ? occhio.x * 0.5 : 0);
    ombra.visible = largo && !piatta; /* l'ombra di contatto solo in piedi sul piano; la foto ha già la sua luce */
    if (ombra.visible) { posaOmbra(ombra, (x - 0.5) * Vw, (0.5 - geo.piano) * Vh, 2 * r * hh * Vh); ombra.material.opacity = ombraA; }
    /* dove si prende per girarla */
    if (largo && !piatta) { const s = presa.style; s.left = `${(A - mezza).toFixed(0)}px`; s.top = `${((cy - hh / 2) * H).toFixed(0)}px`; s.width = `${(2 * mezza).toFixed(0)}px`; s.height = `${(hh * H).toFixed(0)}px`; }
    if (lente) { /* il nome attraverso il vino: solo in piedi, finché il nome c'è, e solo dove la riga l'ha già stampato (a sinistra) */
      const tr = tela.getBoundingClientRect(), dpr = renderer.getPixelRatio(), u = lente;
      u.scala.value = hh * H; u.asseX.value = A; u.dpr.value = dpr; u.tela.value.set(W * dpr, H * dpr); u.taglio.value = A;
      u.acceso.value = largo && k === 0 && av < 1 ? 1 : 0;
      [u.rett0, u.rett1].forEach((rt, i) => { const b = strati[i]?.el.getBoundingClientRect(); if (b) rt.value.set(b.left - tr.left, b.top - tr.top, b.width, b.height); else rt.value.set(0, 0, 0, 0); });
    }
    renderer.render(scena, camera);
    pronto = true;
  };
  requestAnimationFrame(passo);
}

if (!fermo) viva().catch((e) => { /* senza 3D: la pagina ferma, con la foto */
  console.warn('pagina del vino: il 3D non parte, resta la versione ferma', e);
  sez.classList.remove('is-viva'); sez.style.height = ''; scene.forEach((s) => { s.style.clipPath = ''; s.style.visibility = ''; });
  ScrollTrigger.getAll().forEach((t) => t.trigger === sez && t.kill()); nome.style.fontSize = '';
});
