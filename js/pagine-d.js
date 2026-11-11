/* PAGINE dello stile D "Cinque porte" (10 nov 2026): azienda-d.html e vino-d.html?id=<id di js/data.js>. Lo stesso teatrino di carta della home
   (js/moderna-d.js, caricato dopo questo file): qui si dicono i suoi capitoli (window.D_SCENE) e si scrivono i testi e le sezioni di carta tagliata sotto.
   Azienda: la torre, la corte (la famiglia), la terra rossa (la filosofia), il mare (il Salento), il campo con le api (la sostenibilità), la pergola (la visita).
   Vino: la torre col portale; dietro la porta la scena della sua collezione, con la sua bottiglia che sale dal palco; sotto la scheda coi dati veri.
   Stile: css/moderna-d.css + css/pagine-d.css */
(() => {
  const { $, $$, apri } = FS.mk, D = FS.data;
  $$('.foot a[href^="#"]').forEach((a) => { if (!document.getElementById(a.hash.slice(1))) a.href = FS.home + a.hash; }); // ancore della home nel footer comune
  const breve = (w) => w.name.replace(/^(Collezione 53|125 Organic|125|Terra)\s+/, '').replace(/\s+(Organic|Edition)$/, '');

  if (!document.body.classList.contains('page-vd')) {
    window.D_SCENE = ({ scene: [s0, s1, s2, s3, s4, s5] }) => [s0(), s1(), s2(), s4(), s3(), s5()].map((c) => ({ ...c, vini: [] }));
    $$('[data-premi-totale]').forEach((el) => (el.textContent = D.wines.flatMap((w) => w.premi).length));
    return;
  }

  /* ---- la scheda del vino ---- */
  const w = FS.wine(new URLSearchParams(location.search).get('id'));
  if (!w) { // link vecchio o id sbagliato: si propone la cantina (moderna-d.js non parte senza teatrino)
    $('.d-st').outerHTML = `<section class="vd-vuoto"><h1 class="d-cap__t">Vino non trovato.</h1><p class="d-cap__d">Il link non porta a nessuno dei nostri vini. Puoi sceglierne uno dalla cantina.</p><div class="d-cap__cta"><button class="btn btn--gold" type="button">Apri i nostri vini</button></div></section>`;
    $('.vd-vuoto .btn').addEventListener('click', () => apri());
    return;
  }
  const c = FS.collection(w.collection), fra = D.wines.filter((x) => x.collection === w.collection), altri = fra.filter((x) => x !== w);
  document.title = `${w.name} · Feudi Salentini`;
  $('meta[name="description"]').content = `${w.name}, ${w.denom}. ${w.desc}`.slice(0, 300);
  // la scena della collezione e il colore della sua fascia, come nella home D
  const SC = { luxury: 1, terra: 2, organic: 3, classica: 4, lounge: 5 }[w.collection] ?? 1;
  const FASCIA = ['#1d1612', '#1d1612', '#a8402a', '#46532a', '#184f5c', '#f6efe0'][SC];
  // 10 nov, "il vino è il protagonista, non ha senso l'ingresso con la porta": un capitolo solo, la scena della collezione con la sua bottiglia che sale dal palco
  window.D_SCENE = ({ scene }) => [{ ...scene[SC](), vini: [[w.id, '']] }];

  const TIPO = { rosso: 'Rosso', rosato: 'Rosato', bianco: 'Bianco', dolce: 'Dolce' }, METALLO = ['Oro', 'Argento', 'Bronzo', 'Seal of Approval'];
  const tipo = TIPO[w.tipo] || w.tipo, cibi = w.foods.map((f) => D.foods.find((x) => x.id === f)).filter(Boolean);
  const ps = [...w.premi].sort((a, b) => b.anno - a.anno || METALLO.indexOf(a.medaglia) - METALLO.indexOf(b.medaglia));
  $('.d-cap .d-cap__testo').innerHTML = `<div class="d-cap__h"><button class="d-cap__n vd-col" type="button">${c.name}</button><h1 class="d-cap__t" id="d-t" data-chars data-ritardo="1.2">${w.name}</h1></div><p class="d-cap__d">${w.denom}<span class="vd-fatti">${[tipo, w.uve, w.alcool].filter(Boolean).join(' · ')}</span></p><div class="d-cap__cta"><button class="btn btn--gold" type="button" data-scheda>Leggi la scheda</button></div>`;

  const riga = (k, v) => (v ? `<div><dt>${k}</dt><dd>${v}</dd></div>` : '');
  const tag = (l) => `<ul class="vd-tag">${l.map((t) => `<li class="d-ritaglio">${t}</li>`).join('')}</ul>`;
  $('.d-st').insertAdjacentHTML('afterend', [
    `<section class="d-sez vd-a" id="scheda" aria-labelledby="vd-a-t"><div class="vd-in"><div><p class="vd-k">${c.name}</p><h2 class="vd-h" id="vd-a-t" data-chars>${w.name}</h2><p class="vd-lead">${w.desc}</p></div>
      <dl class="vd-dati">${riga('Denominazione', w.denom)}${riga('Tipo', tipo)}${riga('Uve', w.uve)}${riga('Gradazione', w.alcool)}${riga('Zona', w.zona)}${riga('Resa', w.resa)}</dl></div></section>`,
    `<section class="d-sez vd-b${FASCIA === '#f6efe0' ? '' : ' vd-scuro'}" style="--f:${FASCIA}" aria-labelledby="vd-b-t"><div class="vd-in"><div><h2 class="vd-h" id="vd-b-t" data-chars>${['La vista.', 'La vista e il profumo.'][w.aromi.length] ?? 'La vista e i profumi.'}</h2><p class="vd-lead">${w.vista}</p>${tag(w.aromi)}</div>
      ${w.abb ? `<div><h2 class="vd-h" data-chars>In tavola.</h2><p class="vd-lead">${w.abb}</p>${cibi.length ? tag(cibi.map((f) => f.label)) : ''}</div>` : ''}</div></section>`,
    `<section class="d-sez vd-c" aria-labelledby="vd-c-t"><div class="vd-in"><h2 class="vd-h" id="vd-c-t" data-chars>In vigna e in cantina.</h2><p class="vd-lead">${w.tecnica}</p></div></section>`,
    ps.length ? `<section class="d-sez vd-d" aria-labelledby="vd-d-t"><div class="vd-in"><div><h2 class="vd-h" id="vd-d-t" data-chars>${ps.length === 1 ? 'Un riconoscimento.' : `${ps.length} riconoscimenti.`}</h2><p class="vd-lead">Nei concorsi internazionali, ${ps.at(-1).anno === ps[0].anno ? `nel ${ps[0].anno}` : `dal ${ps.at(-1).anno} al ${ps[0].anno}`}.</p></div>
      <ul class="vd-med">${ps.map((p) => `<li><span class="vd-med__f"><img src="${p.img}" alt="" loading="lazy" decoding="async"></span><p><b>${p.medaglia} · ${p.anno}</b>${p.concorso}</p></li>`).join('')}</ul></div></section>` : '',
    altri.length ? `<section class="d-sez vd-e" aria-labelledby="vd-e-t"><div class="vd-in"><h2 class="vd-h" id="vd-e-t" data-chars>Gli altri vini di ${c.name}.</h2>
      <ul class="vd-fila">${altri.map((x) => `<li style="--b:${x.fondo}"><a href="${FS.wineUrl(x.id)}" data-wine="${x.id}"><span class="vd-fila__f"><img src="${x.bottle}" alt="" loading="lazy" decoding="async"></span><span class="vd-fila__n">${breve(x)}</span></a></li>`).join('')}</ul>
      <div class="d-cap__cta"><button class="btn btn--line" type="button" data-tutti>Tutti i ${D.wines.length} vini</button></div></div></section>` : ''
  ].join(''));

  const scheda = () => (FS.lenis ? FS.lenis.scrollTo('#scheda', { duration: 1.4 }) : $('#scheda').scrollIntoView({ behavior: 'smooth' }));
  $('.vd-col').addEventListener('click', () => apri(c.id));
  $('[data-scheda]').addEventListener('click', scheda);
  $('[data-tutti]')?.addEventListener('click', () => apri());
  // la bottiglia sul palco: nella home apre la scheda a comparsa; qui la scheda è la pagina, si scende lì
  $('.d-stage').addEventListener('click', (e) => { if (e.target.closest('.d-hit')) { e.stopPropagation(); scheda(); } }, true);
})();
