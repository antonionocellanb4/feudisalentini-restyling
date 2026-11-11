/* HOME MODERNA, versione 2 (30 ott 2026): movimenti come klimtwine, con i dati veri di js/data.js.
   - una bottiglia sola (fissa al centro dello schermo) viaggia: in piedi nell'hero, inclinata sopra il paragrafo della cantina,
     di nuovo in piedi nei capitoli (dove cambia vino), poi esce inclinandosi;
   - il fondo è il body e cambia colore sezione per sezione; nei capitoli prende la tinta del vino;
   - i titoli entrano lettera per lettera da una maschera (leggermente sfocati); nei capitoli il vecchio esce in alto e il nuovo entra;
   - il paragrafo della cantina si accende parola per parola; la pillola in basso apre il menu dei vini.
   Con reduced motion resta tutto fermo e leggibile. La versione 1 (scura, foto liquida) è in tools/moderna-v1/. */
(() => {
  const D = FS.data, $ = (q, r = document) => r.querySelector(q), $$ = (q, r = document) => [...r.querySelectorAll(q)];
  const reduce = FS.reduce, narrow = () => innerWidth <= 860, clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v)), pad = (n) => String(n).padStart(2, '0');
  const body = document.body, css = getComputedStyle(document.documentElement), tok = (v) => css.getPropertyValue(v).trim();
  const CREAM = tok('--cream'), STONE = tok('--stone'), NIGHT = tok('--night');
  const rgb = (hex) => { const n = parseInt(hex.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
  const tinta = (hex, t = 0.3) => { const a = rgb(CREAM), c = rgb(hex); return `rgb(${a.map((v, i) => Math.round(v + (c[i] - v) * t)).join(',')})`; }; // vino schiarito verso il crema: il testo resta scuro e leggibile
  const maiuscola = (s) => s.replace(/^./, (c) => c.toUpperCase());

  // l'header comune punta alle ancore della home disegnata: qui portano alle sezioni di questa pagina
  $$('a[href^="index.html#"]').forEach((a) => { if (document.getElementById(a.hash.slice(1))) a.setAttribute('href', a.hash); });

  /* ---- titoli lettera per lettera ---- */
  const lettere = (text) => text.split(' ').map((w) => `<span style="display:inline-block;white-space:nowrap">${[...w].map((c) => `<span class="ch"><span>${c}</span></span>`).join('')}</span>`).join(' ');
  const spezza = (el, text = el.textContent) => { const t = text.replace(/\s+/g, ' ').trim(); el.setAttribute('aria-label', t); el.innerHTML = `<span aria-hidden="true">${lettere(t)}</span>`; return $$('.ch > span', el); };
  const entra = (ch, dir = 1, d = 0) => gsap.fromTo(ch, { yPercent: 110 * dir, filter: 'blur(6px)' }, { yPercent: 0, filter: 'blur(0px)', duration: 1.2, ease: 'expo.out', stagger: 0.025, delay: d });
  $$('[data-chars]').forEach((el) => {
    const ch = spezza(el);
    if (reduce) return;
    gsap.set(ch, { yPercent: 110 });
    if (el.closest('.k-hero')) document.fonts.ready.then(() => entra(ch, 1, 0.3));
    else ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true, onEnter: () => entra(ch) });
  });

  /* ---- fondo: il body cambia colore secondo la sezione a metà schermo ---- */
  const fondo = (col) => gsap.to(body, { backgroundColor: col, duration: reduce ? 0 : 0.9, ease: 'power1.out', overwrite: 'auto',
    onComplete: () => dispatchEvent(new Event('scroll')) }); // l'header ricalcola il suo tono sul fondo nuovo
  const zona = (q, col) => ScrollTrigger.create({ trigger: q, start: 'top 50%', end: 'bottom 50%', onToggle: (s) => s.isActive && col && fondo(col) });
  [['.k-hero', NIGHT], ['.k-about', STONE], ['.k-taste', CREAM], ['.k-es', CREAM], ['.k-pr', STONE], ['.k-nw', CREAM]].forEach(([q, c]) => zona(q, c));

  /* ---- hero ---- */
  if (!reduce) gsap.from(['.k-hero__lead', '.k-hero__scorri'], { opacity: 0, y: 16, duration: 1, ease: 'power3.out', stagger: 0.1, delay: 0.9 });

  /* ---- la cantina: parole che si accendono scorrendo ---- */
  const ab = $('.k-about__t');
  ab.innerHTML = ab.textContent.split(' ').map((w) => `<span class="w">${w}</span>`).join(' ');
  const parole = $$('.w', ab);
  if (reduce) gsap.set(parole, { opacity: 1 });
  else ScrollTrigger.create({ trigger: ab, start: 'top 75%', end: 'bottom 40%', scrub: true,
    onUpdate: (s) => parole.forEach((w, i) => (w.style.opacity = 0.2 + 0.8 * clamp((s.progress * (parole.length + 5) - i) / 5))) });

  /* ---- pillola dei vini: mostra la collezione del capitolo, apre il menu dei vini; sparisce sul footer ---- */
  const P = $('.k-pill');
  let pillCol = null;
  function pill(c) {
    pillCol = c?.col.id || null;
    $('.k-pill__t', P).textContent = c ? c.col.name : 'I nostri vini';
    $('.k-pill__mini', P).innerHTML = (c ? D.wines.filter((x) => x.collection === c.col.id) : ['c53-primitivo', '125-rosato', 'claria'].map(FS.wine).filter(Boolean)).slice(0, 3).map((x) => `<img src="${x.bottle}" alt="">`).join('');
  }
  P.addEventListener('click', () => document.dispatchEvent(new CustomEvent('fs:open-cantina', { detail: pillCol ? { col: pillCol } : {} })));
  ScrollTrigger.create({ trigger: '.foot', start: 'top 90%', onToggle: (s) => P.classList.toggle('is-via', s.isActive) });
  pill(null);

  /* ---- capitoli: una collezione per capitolo, col suo vino ---- */
  const CAPI = [['luxury', 'c53-primitivo'], ['lounge', '125-rosato'], ['classica', 'claria'], ['terra', 'terra-platinum'], ['organic', 'organic-bianco']]
    .map(([col, id]) => ({ col: FS.collection(col), w: FS.wine(id), n: D.wines.filter((x) => x.collection === col).length })).filter((c) => c.col && c.w);
  CAPI.forEach((c) => { new Image().src = c.w.bottle; });
  const cap = $('.k-cap'), capT = $('.k-cap__t'), lati = [...$$('.k-cap__sx > *'), ...$$('.k-cap__dx > *')];
  cap.style.setProperty('--n', CAPI.length);
  const B = $('.k-bottle'), Bi = $('img', B); // B viaggia (scroll), Bi cambia vino (tempo): così il cambio non riaccende la bottiglia uscita
  let ci = -1, swap = null, inCap = false;
  const riempi = (c, i) => {
    $('.k-cap__tipo').textContent = [maiuscola(c.w.tipo || ''), c.w.uve].filter(Boolean).join(' · ');
    $('.k-cap__note').textContent = c.w.aromi.length ? maiuscola(c.w.aromi.join(', ')) : c.w.vista || '';
    $('.k-cap__denom').textContent = [c.w.denom, c.w.alcool].filter(Boolean).join(' · ');
    $('.k-cap__nome').textContent = c.w.name;
    $('.k-cap__desc').textContent = c.w.desc || '';
    $('.k-cap__col').textContent = `Vedi i ${c.n} vini della collezione`;
    $('.k-cap__col').dataset.col = c.col.id;
    $('.k-cap__go').href = c.w.url;
  };
  const capitolo = (i) => {
    const c = CAPI[i], dir = i > ci ? 1 : -1, primo = ci < 0;
    ci = i;
    riempi(c, i);
    if (inCap) { fondo(tinta(c.w.color)); pill(c); }
    const testo = `${pad(i + 1)} ${c.col.name}`;
    if (primo || reduce) { spezza(capT, testo); return; }
    // titolo: le lettere vecchie escono in alto, le nuove entrano dal basso (al contrario tornando indietro)
    const vecchie = $$('.ch > span', capT);
    gsap.killTweensOf(vecchie);
    gsap.to(vecchie, { yPercent: -110 * dir, duration: 0.45, ease: 'power3.in', stagger: 0.01, onComplete: () => entra(spezza(capT, testo), dir) });
    gsap.fromTo(lati, { y: 24 * dir, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', stagger: 0.05, delay: 0.25, overwrite: 'auto' });
    // la bottiglia: la vecchia sale e sparisce, il nuovo vino arriva dal basso
    swap?.kill();
    swap = gsap.timeline()
      .to(Bi, { y: -60 * dir, opacity: 0, duration: 0.4, ease: 'power3.in', onComplete: () => (Bi.src = c.w.bottle) })
      .fromTo(Bi, { y: 80 * dir }, { y: 0, opacity: 1, duration: 0.9, ease: 'expo.out' });
  };
  capitolo(0);
  ScrollTrigger.create({ trigger: cap, start: 'top 50%', end: 'bottom 50%',
    onToggle: (s) => { inCap = s.isActive; if (inCap) fondo(tinta(CAPI[ci].w.color)); pill(inCap ? CAPI[ci] : null); } });
  ScrollTrigger.create({ trigger: cap, start: 'top top', end: 'bottom bottom',
    onUpdate: (s) => { const i = Math.min(CAPI.length - 1, Math.floor(s.progress * CAPI.length)); if (i !== ci) capitolo(i); } });
  $('.k-cap__col').addEventListener('click', (e) => document.dispatchEvent(new CustomEvent('fs:open-cantina', { detail: { col: e.currentTarget.dataset.col } })));

  /* ---- la bottiglia che viaggia: in piedi nell'hero, inclinata a lato del paragrafo (sul telefono sopra), in piedi nei capitoli, poi
     esce inclinandosi. Un solo calcolo dalla posizione di scroll (niente tween in gara tra loro); l'entrata all'apertura è sull'immagine ---- */
  Bi.src = CAPI[0].w.bottle;
  const ab2 = $('.k-about'), ss = (t) => t * t * (3 - 2 * t), mix = (a, b, t) => a + (b - a) * t;
  const viaggio = () => {
    const y = scrollY, vh = innerHeight, mob = narrow();
    const aT = ab2.offsetTop, aC = aT + ab2.offsetHeight / 2, cT = cap.offsetTop, cB = cT + cap.offsetHeight;
    const t1 = ss(clamp((y - (aT - vh)) / (aC - vh / 2 - (aT - vh)))), t2 = ss(clamp((y - (cT - vh)) / vh)), t3 = ss(clamp((y - (cB - vh)) / (vh * 0.45)));
    const inc = { x: mob ? 0 : -innerWidth * 0.36, y: vh * (mob ? -0.3 : 0.06), r: -32, s: mob ? 0.55 : 0.72 };
    const k = t1 * (1 - t2); // quanto è inclinata
    gsap.set(B, { x: mix(inc.x * k, innerWidth * 0.3, t3), y: mix(inc.y * k, -vh * 0.25, t3), rotation: mix(inc.r * k, 28, t3), scale: mix(1 + (inc.s - 1) * k, 0.7, t3), autoAlpha: 1 - t3 });
  };
  gsap.set(B, { xPercent: -50, yPercent: -50 });
  if (reduce) gsap.set(B, { autoAlpha: 0 });
  else {
    viaggio();
    FS.lenis ? FS.lenis.on('scroll', viaggio) : addEventListener('scroll', viaggio, { passive: true });
    addEventListener('resize', viaggio); ScrollTrigger.addEventListener('refresh', viaggio);
    gsap.fromTo(Bi, { y: 70, opacity: 0 }, { y: 0, opacity: 1, duration: 1.5, ease: 'expo.out', delay: 0.5 });
  }

  /* ---- il resto si assaggia in cantina: una bottiglia scende e si posa (accompagna lo scroll, niente rimbalzi) ---- */
  const tb = $('.k-taste__bt');
  tb.src = FS.wine('gocce')?.bottle || CAPI[0].w.bottle;
  if (!reduce) gsap.fromTo(tb, { y: () => -innerHeight * 0.5, rotation: -10, opacity: 0 }, { y: 0, rotation: 0, opacity: 1, ease: 'power2.out',
    scrollTrigger: { trigger: '.k-taste', start: 'top 75%', end: 'center 55%', scrub: true, invalidateOnRefresh: true } });

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
