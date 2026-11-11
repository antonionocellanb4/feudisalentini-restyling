/* HOME MODERNA, versione 3 "pop" (30 ott 2026): movimenti come klimtwine, il linguaggio delle serie pop, dati veri di js/data.js.
   Le foto delle bottiglie non si toccano: il pop sta nei fondi pieni, nella ripetizione e nei punti Ben-Day.
   - hero: quattro tele della stessa bottiglia si stampano una dopo l'altra (il colore passa dall'alto in basso come la racla);
     scorrendo (palco fermo) si entra nell'ultima: lo zoom attraversa il retino e il suo colore diventa il fondo della cantina;
   - i titoli entrano lettera per lettera da una maschera; il paragrafo della cantina si accende parola per parola;
   - il muro dei 28 vini: una tela per vino, colore per collezione, filtro per collezione; le tele si stampano entrando;
   - il fondo è il body e cambia colore sezione per sezione; la pillola in basso apre il menu dei vini.
   Con reduced motion resta tutto fermo e leggibile. Versione 2 (bottiglia che viaggia, capitoli) in tools/moderna-v2/, versione 1 in tools/moderna-v1/. */
(() => {
  const D = FS.data, $ = (q, r = document) => r.querySelector(q), $$ = (q, r = document) => [...r.querySelectorAll(q)];
  const reduce = FS.reduce, clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v)), ss = (t) => t * t * (3 - 2 * t);
  const body = document.body, css = getComputedStyle(document.documentElement), tok = (v) => css.getPropertyValue(v).trim();
  const CREAM = tok('--cream'), STONE = tok('--stone');
  // la serie: per ogni collezione il fondo pieno della tela e il colore dei punti (il testo scuro si legge su tutti i fondi)
  const POP = { luxury: ['#f49ac2', '#e8322b'], lounge: ['#58c6c9', '#2f6fd0'], classica: ['#ffd84a', '#f47b2a'], terra: ['#f7a347', '#d6402a'], organic: ['#b5df78', '#3f9a4a'] };
  const tela = ([c, d], src, extra = '') => `<div class="p-pan" style="--c:${c};--d:${d}"${extra}><i class="p-pan__punti"></i><span class="p-pan__b"><img src="${src}" alt="" decoding="async"></span></div>`;

  // l'header comune punta alle ancore della home disegnata: qui portano alle sezioni di questa pagina
  $$('a[href^="index.html#"]').forEach((a) => { if (document.getElementById(a.hash.slice(1))) a.setAttribute('href', a.hash); });

  /* ---- titoli lettera per lettera ---- */
  const lettere = (text) => text.split(' ').map((w) => `<span style="display:inline-block;white-space:nowrap">${[...w].map((c) => `<span class="ch"><span>${c}</span></span>`).join('')}</span>`).join(' ');
  const spezza = (el, text = el.textContent) => { const t = text.replace(/\s+/g, ' ').trim(); el.setAttribute('aria-label', t); el.innerHTML = `<span aria-hidden="true">${lettere(t)}</span>`; return $$('.ch > span', el); };
  const entra = (ch, d = 0) => gsap.fromTo(ch, { yPercent: 110, filter: 'blur(6px)' }, { yPercent: 0, filter: 'blur(0px)', duration: 1.2, ease: 'expo.out', stagger: 0.025, delay: d });
  $$('[data-chars]').forEach((el) => {
    const ch = spezza(el);
    if (reduce) return;
    gsap.set(ch, { yPercent: 110 });
    if (el.closest('.p-hero')) document.fonts.ready.then(() => entra(ch, 0.3));
    else ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true, onEnter: () => entra(ch) });
  });

  /* ---- fondo: il body cambia colore secondo la sezione a metà schermo (la cantina ha il suo, quello dell'ultima tela) ---- */
  const fondo = (col) => gsap.to(body, { backgroundColor: col, duration: reduce ? 0 : 0.9, ease: 'power1.out', overwrite: 'auto',
    onComplete: () => dispatchEvent(new Event('scroll')) }); // l'header ricalcola il suo tono sul fondo nuovo
  [['.p-hero', CREAM], ['.p-muro', CREAM], ['.k-es', CREAM], ['.k-pr', STONE], ['.k-nw', CREAM]].forEach(([q, c]) =>
    ScrollTrigger.create({ trigger: q, start: 'top 50%', end: 'bottom 50%', onToggle: (s) => s.isActive && fondo(c) }));

  /* ---- hero: quattro tele della stessa bottiglia (come le serie di Warhol) ---- */
  const c53 = FS.wine('c53-primitivo'), SERIE = [POP.classica, POP.lounge, POP.terra, POP.luxury];
  const quattro = $('.p-quattro'), testo = $('.p-hero__testo');
  quattro.innerHTML = SERIE.map((p) => tela(p, c53.bottle)).join('');
  const pans = $$('.p-pan', quattro), ultima = pans[3], ultimaImg = $('img', ultima), ultimiPunti = $('.p-pan__punti', ultima);
  $('.p-about').style.setProperty('--zoom', SERIE[3][0]);
  if (!reduce) {
    gsap.fromTo(pans, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'power3.inOut', stagger: 0.12, delay: 0.2, clearProps: 'clipPath' });
    gsap.fromTo($$('.p-pan__b', quattro), { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1.4, ease: 'expo.out', stagger: 0.12, delay: 0.6 });
    gsap.fromTo($$('.p-pan__punti', quattro), { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'power1.out', stagger: 0.12, delay: 1.1 });
    gsap.fromTo(['.p-hero__lead', '.p-hero__cta'], { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.1, delay: 0.9 });

    /* entrare nella tela: il blocco si ingrandisce attorno a un punto del retino dell'ultima tela (a destra della bottiglia, che scivola via
       a sinistra) finché la tela copre tutto lo schermo; i punti diventano grandi, poi lasciano il colore pieno. Ingrandimento a passo
       costante (interpolato in scala logaritmica), un solo calcolo dallo scroll */
    const T = [0.8, 0.78]; // il punto del retino in cui si entra, in frazioni della tela
    let Z = null;
    const misura = () => {
      gsap.set(quattro, { clearProps: 'transform' });
      const st = $('.p-hero__stage').getBoundingClientRect(), q = quattro.getBoundingClientRect(), r = ultima.getBoundingClientRect();
      const ox = r.left - q.left + r.width * T[0], oy = r.top - q.top + r.height * T[1];
      Z = { ox, oy, dx: innerWidth / 2 - (q.left - st.left + ox), dy: innerHeight / 2 - (q.top - st.top + oy),
        s: Math.max(innerWidth / 2 / (r.width * Math.min(T[0], 1 - T[0])), innerHeight / 2 / (r.height * Math.min(T[1], 1 - T[1]))) * 1.06 };
    };
    const zoom = (p) => {
      if (!Z) misura();
      const e = ss(clamp(p / 0.8)), t = clamp(p / 0.22);
      gsap.set(quattro, { transformOrigin: `${Z.ox}px ${Z.oy}px`, x: Z.dx * e, y: Z.dy * e, scale: Z.s ** e });
      gsap.set(testo, { opacity: 1 - t, y: -40 * t });
      gsap.set(ultimaImg, { opacity: 1 - clamp((e - 0.3) / 0.25) });
      gsap.set(ultimiPunti, { opacity: 1 - clamp((p - 0.74) / 0.2) });
    };
    const zt = ScrollTrigger.create({ trigger: '.p-hero', start: 'top top', end: 'bottom bottom', onUpdate: (s) => zoom(s.progress), onRefresh: (s) => { Z = null; zoom(s.progress); } });
    zoom(zt.progress);
  }

  /* ---- la cantina: parole che si accendono scorrendo ---- */
  const ab = $('.p-about__t');
  ab.innerHTML = ab.textContent.split(' ').map((w) => `<span class="w">${w}</span>`).join(' ');
  const parole = $$('.w', ab);
  if (reduce) gsap.set(parole, { opacity: 1 });
  else ScrollTrigger.create({ trigger: ab, start: 'top 75%', end: 'bottom 40%', scrub: true,
    onUpdate: (s) => parole.forEach((w, i) => (w.style.opacity = 0.2 + 0.8 * clamp((s.progress * (parole.length + 5) - i) / 5))) });

  /* ---- pillola dei vini: apre il menu dei vini (sulla collezione scelta nel muro); sparisce sul footer ---- */
  const P = $('.k-pill');
  let pillCol = '';
  function pill(col) {
    pillCol = col;
    const c = col && FS.collection(col);
    $('.k-pill__t', P).textContent = c ? c.name : 'I nostri vini';
    $('.k-pill__mini', P).innerHTML = (c ? D.wines.filter((x) => x.collection === col) : ['c53-primitivo', '125-rosato', 'claria'].map(FS.wine).filter(Boolean)).slice(0, 3).map((x) => `<img src="${x.bottle}" alt="">`).join('');
  }
  P.addEventListener('click', () => document.dispatchEvent(new CustomEvent('fs:open-cantina', { detail: pillCol ? { col: pillCol } : {} })));
  ScrollTrigger.create({ trigger: '.foot', start: 'top 90%', onToggle: (s) => P.classList.toggle('is-via', s.isActive) });
  pill('');

  /* ---- il muro dei vini: una tela per vino; le tele si stampano entrando (fila per fila), il filtro tiene solo una collezione ---- */
  const grid = $('.p-muro__grid');
  grid.innerHTML = D.wines.map((w) => `<li class="p-tela" data-col="${w.collection}"><a href="${w.url}" target="_blank" rel="noopener">${tela(POP[w.collection] || POP.luxury, w.bottle).replace('decoding="async"', 'loading="lazy" decoding="async"')}
    <span class="p-tela__n">${w.name}</span><span class="p-tela__d">${w.denom}</span></a></li>`).join('');
  const tele = $$('.p-tela', grid);
  const stampa = (els) => {
    gsap.fromTo(els.map((t) => $('.p-pan', t)), { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'power3.inOut', stagger: 0.06, clearProps: 'clipPath' });
    gsap.fromTo(els.map((t) => $('.p-pan__b', t)), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: 'expo.out', stagger: 0.06, delay: 0.3 });
    gsap.fromTo(els.flatMap((t) => $$('.p-tela__n, .p-tela__d', t)), { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'power1.out', stagger: 0.03, delay: 0.5 });
  };
  if (!reduce) {
    gsap.set(tele.map((t) => $('.p-pan', t)), { clipPath: 'inset(0% 0% 100% 0%)' });
    ScrollTrigger.batch(tele, { start: 'top 90%', once: true, onEnter: stampa });
  }
  const filtri = $('.p-filtri');
  filtri.innerHTML = [['', 'Tutti'], ...D.collections.map((c) => [c.id, c.name])].map(([id, n]) =>
    `<button type="button" data-col="${id}" aria-pressed="${!id}"${id ? ` style="--c:${POP[id][0]}"` : ''}>${n}</button>`).join('');
  filtri.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    const col = b.dataset.col;
    $$('button', filtri).forEach((x) => x.setAttribute('aria-pressed', x === b));
    const vis = tele.filter((t) => { const on = !col || t.dataset.col === col; t.hidden = !on; return on; });
    pill(col);
    ScrollTrigger.refresh();
    if (!reduce) stampa(vis);
  });

  /* ---- esperienze, premi, news (dati veri) ---- */
  $('.k-es__grid').innerHTML = D.experiences.map((x) => `<article class="k-es__card"><div class="k-es__fig"><img src="${x.photos[0]}" alt="" loading="lazy" decoding="async"></div>
    <h3 class="k-es__name">${x.name}</h3><p class="k-es__meta">${x.durata} · da ${x.min} persone</p><p class="k-es__desc">${x.desc}</p>
    <div class="k-es__row"><p class="k-es__price">da <strong>${FS.euro(x.price)}</strong> a persona</p><a class="btn btn--gold" href="${x.url}" target="_blank" rel="noopener">Prenota</a></div></article>`).join('');
  $('.k-pr__list').innerHTML = D.awards.map((a) => `<li><a href="${a.url}" target="_blank" rel="noopener"><span class="k-pr__logo"><img src="${a.logo}" alt="" loading="lazy"></span>
    <span class="k-pr__n">${a.name}</span><span class="k-pr__d">${a.text}</span></a></li>`).join('');
  $('.k-nw__grid').innerHTML = D.news.map((n) => `<a class="k-nw__item" href="${n.url}" target="_blank" rel="noopener"><div class="k-nw__fig"><img src="${n.img}" alt="" loading="lazy" decoding="async"></div>
    <p class="k-nw__date">${n.date}</p><h3 class="k-nw__title">${n.title}</h3></a>`).join('');
  if (!reduce) [['.k-es__grid', '.k-es__card'], ['.k-pr__list', 'li'], ['.k-nw__grid', '.k-nw__item']].forEach(([g, it]) =>
    gsap.fromTo(`${g} ${it}`, { y: 48, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: g, start: 'top 85%' } }));

})();
