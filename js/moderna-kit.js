/* KIT comune alle tre alternative della home moderna (30 ott 2026): A "cinema" (moderna.html), B "luminarie" (moderna-b.html),
   C "archi" (moderna-c.html). Qui solo i pezzi che hanno in comune: titoli lettera per lettera, paragrafo che si accende parola per
   parola, fondo del body che cambia per sezione, pillola fissa "I nostri vini", ancore dell'header. Ogni variante ha il suo js/moderna-x.js.
   Le foto dei vini non si toccano mai (né filtri né effetti sulle immagini). */
(() => {
  const $ = (q, r = document) => r.querySelector(q), $$ = (q, r = document) => [...r.querySelectorAll(q)];
  const reduce = FS.reduce, clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v)), ss = (t) => t * t * (3 - 2 * t);
  const tok = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

  // l'header comune punta alle ancore della home disegnata: qui portano alle sezioni di questa pagina
  $$('a[href^="index.html#"]').forEach((a) => { if (document.getElementById(a.hash.slice(1))) a.setAttribute('href', a.hash); });

  /* titoli [data-chars]: lettere che salgono da una maschera; quelli dentro [data-subito] all'apertura, gli altri entrando in vista */
  const lettere = (t) => t.split(' ').map((w) => `<span style="display:inline-block;white-space:nowrap">${[...w].map((c) => `<span class="ch"><span>${c}</span></span>`).join('')}</span>`).join(' ');
  const spezza = (el, text = el.textContent) => { const t = text.replace(/\s+/g, ' ').trim(); el.setAttribute('aria-label', t); el.innerHTML = `<span aria-hidden="true">${lettere(t)}</span>`; return $$('.ch > span', el); };
  const entra = (ch, d = 0) => gsap.fromTo(ch, { yPercent: 110 }, { yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: 0.025, delay: d });
  const titoli = () => $$('[data-chars]').forEach((el) => {
    const ch = spezza(el);
    if (reduce) return;
    gsap.set(ch, { yPercent: 110 });
    if (el.closest('[data-subito]')) document.fonts.ready.then(() => entra(ch, +(el.dataset.ritardo || 0.3)));
    else ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true, onEnter: () => entra(ch) });
  });

  /* paragrafo che si accende parola per parola scorrendo */
  const parole = (el, spento = 0.22) => {
    el.innerHTML = el.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(' ');
    const ws = $$('.w', el);
    if (reduce) return;
    gsap.set(ws, { opacity: spento });
    ScrollTrigger.create({ trigger: el, start: 'top 78%', end: 'bottom 45%', scrub: true,
      onUpdate: (s) => ws.forEach((w, i) => (w.style.opacity = spento + (1 - spento) * clamp((s.progress * (ws.length + 5) - i) / 5))) });
  };

  /* fondo: il body prende il colore della sezione a metà schermo; l'header ricalcola il suo tono a fine cambio */
  const fondi = (coppie) => coppie.forEach(([q, col]) => ScrollTrigger.create({ trigger: q, start: 'top 50%', end: 'bottom 50%',
    onToggle: (s) => s.isActive && gsap.to(document.body, { backgroundColor: col, duration: reduce ? 0 : 0.8, ease: 'power1.out', overwrite: 'auto', onComplete: () => dispatchEvent(new Event('scroll')) }) }));

  /* pillola fissa dei vini (come la "Our Wines" di klimtwine): apre il menu dei vini, sulla collezione se gliela si dà; sparisce sul footer */
  document.body.insertAdjacentHTML('beforeend', `<button class="m-pill" type="button" aria-label="Apri i nostri vini"><span class="m-pill__mini" aria-hidden="true"></span><span class="m-pill__t">I nostri vini</span><span class="m-pill__v" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="1.6"/></svg></span></button>`);
  const P = $('.m-pill');
  let pCol = '';
  const pill = (col = '') => {
    pCol = col;
    const c = col && FS.collection(col);
    $('.m-pill__t', P).textContent = c ? c.name : 'I nostri vini';
    $('.m-pill__mini', P).innerHTML = (c ? FS.data.wines.filter((x) => x.collection === col) : ['c53-primitivo', '125-rosato', 'claria'].map(FS.wine)).slice(0, 3).map((x) => `<img src="${x.bottle}" alt="">`).join('');
  };
  const apri = (col) => document.dispatchEvent(new CustomEvent('fs:open-cantina', { detail: col ? { col } : {} }));
  P.addEventListener('click', () => apri(pCol));
  addEventListener('load', () => ScrollTrigger.create({ trigger: '.foot', start: 'top 90%', onToggle: (s) => P.classList.toggle('is-via', s.isActive) }));
  pill();

  /* blocchi che salgono entrando in vista */
  const sale = (q, trigger) => !reduce && gsap.fromTo(q, { y: 48, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: trigger || q, start: 'top 85%' } });

  /* le collezioni col vino che le rappresenta (Gli internazionali dal catalogo del 6 nov 2026), quanti vini sono e di che tipo ("3 vini · rossi", "4 vini · rossi e rosato") */
  const PLUR = { rosso: 'rossi', rosato: 'rosati', bianco: 'bianchi' };
  const collezioni = () => [['luxury', 'c53-primitivo'], ['lounge', '125-rosato'], ['classica', 'claria'], ['terra', 'terra-platinum'], ['organic', 'organic-bianco'], ['internazionali', 'primaura']]
    .map(([id, w]) => {
      const vini = FS.data.wines.filter((x) => x.collection === id);
      const tipi = ['rosso', 'rosato', 'bianco'].map((t) => [t, vini.filter((x) => x.tipo === t).length]).filter(([, n]) => n).map(([t, n]) => (n > 1 ? PLUR[t] : t));
      return { col: FS.collection(id), w: FS.wine(w), n: vini.length, vini, tipi: `${vini.length} vini · ${tipi.length > 1 ? tipi.slice(0, -1).join(', ') + ' e ' + tipi.at(-1) : tipi[0]}` };
    }).filter((c) => c.col && c.w);

  /* stile E: la scena incisa di un vino, la stessa nella scheda della home (js/moderna-e.js) e nella sua pagina (js/pagine-e.js): due per collezione, che si alternano.
     Il mare però solo ai vini che il catalogo abbina al pesce (foods in js/data.js): gli altri della Classica, i rossi da carne e il dolce, prendono la campagna. Rende [scena, posto del vino nella collezione] */
  const SCENE_E = { luxury: ['vite', 'grappolo'], terra: ['filari', 'pajara'], organic: ['ulivo', 'campo'], classica: ['mare', 'torre'], lounge: ['pergola', 'calici'] };
  const scenaE = (w) => { const n = FS.data.wines.filter((v) => v.collection === w.collection).indexOf(w), f = w.foods || [], ha = (...q) => q.some((x) => f.includes(x)); return [(w.collection === 'classica' && f.length && (!ha('pesce', 'crudo') || ha('carne', 'selvaggina')) ? SCENE_E.terra : SCENE_E[w.collection] || SCENE_E.luxury)[n % 2], n]; };
  FS.mk = { $, $$, reduce, clamp, ss, tok, spezza, entra, titoli, parole, fondi, pill, apri, sale, collezioni, scenaE };
})();
