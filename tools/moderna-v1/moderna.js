/* HOME MODERNA (30 ott 2026): schede dai dati veri di js/data.js e movimenti (GSAP + ScrollTrigger + Lenis di main.js).
   Hero: nome a tutta larghezza che sale lettera per lettera (la foto liquida è in js/moderna-hero.js) · manifesto: parole che si
   accendono · collezioni: righe giganti, le bottiglie seguono il cursore · i 28 vini: palco fermo, la bottiglia cambia e il fondo prende
   il colore del vino · territorio: SALENTO come finestra che si allarga sulla foto · esperienze: il pannello attivo si allarga ·
   premi: nastro che accelera con lo scroll · pulsanti calamita (solo mouse). Con reduced motion resta tutto fermo e leggibile. */
(() => {
  const D = FS.data, $ = (q, r = document) => r.querySelector(q), $$ = (q, r = document) => [...r.querySelectorAll(q)];
  const reduce = FS.reduce, mouse = matchMedia('(hover: hover) and (pointer: fine)').matches, narrow = () => innerWidth <= 860;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v)), pad = (n) => String(n).padStart(2, '0');
  const scuro = (hex, t) => { // colore del vino portato verso il fondo notte (t = quanto colore resta): il testo crema resta leggibile
    const n = parseInt(hex.slice(1), 16), a = [21, 16, 13], c = [n >> 16, (n >> 8) & 255, n & 255];
    return `rgb(${c.map((v, i) => Math.round(a[i] + (v - a[i]) * t)).join(',')})`;
  };

  // l'header comune punta alle ancore della home disegnata: qui portano alle sezioni di questa pagina
  $$('a[href^="index.html#"]').forEach((a) => { if (document.getElementById(a.hash.slice(1))) a.setAttribute('href', a.hash); });
  $$('[data-righe]').forEach(FS.righe);

  /* ---- hero: nome a tutta larghezza (misurato), lettere che salgono, poi in scroll il nome sale più in fretta della pagina ---- */
  const hero = $('.m-hero'), ht = $('.m-hero__t'), righe = $$('.m-hero__r', ht);
  righe.forEach((r) => { r.innerHTML = [...r.textContent].map((c) => `<span class="c"><span>${c}</span></span>`).join(''); r.setAttribute('aria-hidden', 'true'); });
  const misura = () => {
    ht.style.fontSize = '100px'; ht.style.flexDirection = narrow() ? 'column' : 'row';
    const w = righe.map((r) => r.getBoundingClientRect().width), av = ht.clientWidth;
    ht.style.fontSize = (narrow() ? (100 * av) / Math.max(...w) : (100 * av * 0.96) / (w[0] + w[1])) + 'px';
  };
  const lettere = $$('.c > span', ht), sopra = [$('.m-hero__luogo'), $('.m-hero__lead'), ...$$('.m-hero__cta .btn')];
  document.fonts.ready.then(() => {
    misura(); addEventListener('resize', misura);
    if (reduce) return gsap.set(lettere, { y: 0, yPercent: 0 });
    gsap.fromTo(lettere, { y: 0, yPercent: 105 }, { yPercent: 0, duration: 1.4, ease: 'expo.out', stagger: 0.035, delay: 0.25 }); // y: 0 azzera lo spostamento del CSS
    gsap.from(sopra, { opacity: 0, y: 18, duration: 0.9, ease: 'power3.out', stagger: 0.08, delay: 0.7 });
    gsap.to(ht, { yPercent: -38, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.m-hero__top', { opacity: 0, y: -40, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: '45% top', scrub: true } });
  });

  /* ---- manifesto: le parole si accendono una dopo l'altra mentre si scorre ---- */
  const man = $('.m-manifesto__t');
  man.innerHTML = man.textContent.split(' ').map((w) => `<span class="w">${w}</span>`).join(' ');
  const parole = $$('.w', man);
  if (reduce) gsap.set(parole, { opacity: 1 });
  else ScrollTrigger.create({ trigger: man, start: 'top 80%', end: 'bottom 45%', scrub: true,
    onUpdate: (st) => parole.forEach((w, i) => (w.style.opacity = 0.18 + 0.82 * clamp((st.progress * (parole.length + 5) - i) / 5))) });

  /* ---- collezioni: righe giganti; col mouse le bottiglie della riga seguono il cursore, al clic si va ai suoi vini ---- */
  const COL = D.collections.map((c) => ({ c, w: D.wines.filter((x) => x.collection === c.id) })).filter((g) => g.w.length);
  const VINI = COL.flatMap((g) => g.w);
  const lista = $('.m-col__list'), float = $('.m-col__float'), colSec = $('.m-col');
  lista.innerHTML = COL.map(({ c, w }, i) => `<li><button class="m-col__row" type="button" data-i="${i}"><span class="m-col__n">${pad(i + 1)}</span>
    <span class="m-col__name">${c.name}</span><span class="m-col__meta"><strong>${w.length} vini</strong>${c.line !== c.name ? c.line : ''}</span>
    <span class="m-col__mini" aria-hidden="true">${w.slice(0, 3).map((x) => `<img src="${x.bottle}" alt="" loading="lazy">`).join('')}</span></button></li>`).join('');
  if (mouse && !reduce) {
    const qx = gsap.quickTo(float, 'x', { duration: 0.6, ease: 'power3.out' }), qy = gsap.quickTo(float, 'y', { duration: 0.6, ease: 'power3.out' });
    const qr = gsap.quickTo(float, 'rotation', { duration: 0.8, ease: 'power3.out' });
    let lx = 0;
    lista.addEventListener('pointermove', (e) => {
      const r = colSec.getBoundingClientRect(), x = e.clientX - r.left - float.offsetWidth / 2, y = e.clientY - r.top - float.offsetHeight / 2;
      qx(x); qy(y); qr(clamp((e.clientX - lx) * 0.5, -10, 10)); lx = e.clientX;
    });
    $$('.m-col__row', lista).forEach((b) => b.addEventListener('pointerenter', () => {
      const g = COL[+b.dataset.i];
      float.style.background = g.w[0].color;
      float.innerHTML = g.w.slice(0, 4).map((x) => `<img src="${x.bottle}" alt="">`).join('');
      gsap.to(float, { opacity: 1, scale: 1, duration: 0.45, ease: 'power3.out', overwrite: 'auto' });
    }));
    lista.addEventListener('pointerleave', () => gsap.to(float, { opacity: 0, scale: 0.85, duration: 0.35, ease: 'power2.out', overwrite: 'auto' }));
  }

  /* ---- i 28 vini: un vino ogni 20vh di scroll; il nome scorre in su, la bottiglia cambia, il fondo prende il colore del vino ---- */
  const cat = $('.m-cat'), bt = $('.m-cat__bt'), nome = $('.m-cat__name'), catList = $('.m-cat__list');
  cat.style.setProperty('--n', VINI.length);
  VINI.forEach((w) => { new Image().src = w.bottle; }); // pronte prima di arrivarci
  catList.innerHTML = VINI.map((w, i) => `<li><button type="button" data-i="${i}">${w.name}</button></li>`).join('');
  const catBtns = $$('button', catList);
  let cur = -1, catST = null;
  const vaiA = (i) => { if (!catST) return; const y = catST.start + ((i + 0.5) / VINI.length) * (catST.end - catST.start); FS.lenis ? FS.lenis.scrollTo(y, { duration: 1.4 }) : scrollTo({ top: y, behavior: 'smooth' }); };
  const mostra = (i) => {
    const w = VINI[i], dir = i > cur ? 1 : -1, primo = cur < 0;
    cur = i;
    cat.style.setProperty('--cat-bg', scuro(w.color, 0.42));
    $('.m-cat__n').textContent = `${pad(i + 1)} / ${VINI.length}`;
    $('.m-cat__col').textContent = FS.collection(w.collection)?.name || '';
    $('.m-cat__meta').textContent = [w.denom, w.uve, w.alcool].filter(Boolean).join(' · ');
    $('.m-cat__aromi').textContent = w.aromi.length ? w.aromi.join(', ').replace(/^./, (c) => c.toUpperCase()) : '';
    $('.m-cat__go').href = w.url;
    catBtns.forEach((b, j) => b.setAttribute('aria-current', j === i));
    // nome: il vecchio esce in alto, il nuovo entra dal basso (al contrario tornando indietro)
    $$('span', nome).forEach((s) => { gsap.killTweensOf(s); if (primo || reduce) s.remove(); else gsap.to(s, { yPercent: -110 * dir, opacity: 0, duration: 0.5, ease: 'power3.in', onComplete: () => s.remove() }); });
    const s = document.createElement('span'); s.textContent = w.name; nome.append(s);
    if (!primo && !reduce) gsap.fromTo(s, { yPercent: 110 * dir, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.8, ease: 'expo.out', delay: 0.12 });
    // bottiglia: la vecchia sale e sparisce, la nuova arriva dal basso
    $$('img', bt).forEach((im) => { gsap.killTweensOf(im); if (primo || reduce) im.remove(); else gsap.to(im, { y: -80 * dir, opacity: 0, duration: 0.5, ease: 'power3.in', onComplete: () => im.remove() }); });
    const im = document.createElement('img'); im.src = w.bottle; im.alt = w.name; bt.append(im);
    if (!primo && !reduce) gsap.fromTo(im, { y: 120 * dir, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'expo.out', delay: 0.1 });
  };
  mostra(0);
  catST = ScrollTrigger.create({ trigger: cat, start: 'top top', end: 'bottom bottom',
    onUpdate: (st) => { const i = Math.min(VINI.length - 1, Math.floor(st.progress * VINI.length)); if (i !== cur) mostra(i); } });
  catBtns.forEach((b) => b.addEventListener('click', () => vaiA(+b.dataset.i)));
  $$('.m-col__row', lista).forEach((b) => b.addEventListener('click', () => vaiA(VINI.indexOf(COL[+b.dataset.i].w[0]))));

  /* ---- territorio: la parola SALENTO è una finestra sulla foto; scorrendo si allarga dalla T finché la foto riempie lo schermo ---- */
  const terra = $('.m-terra'), testo = $$('.m-terra__testo > *');
  if (reduce) { gsap.set('.m-terra__mask', { display: 'none' }); gsap.set(testo, { opacity: 1 }); terra.style.setProperty('--scrim', 1); terra.style.height = '100vh'; }
  else document.fonts.ready.then(() => {
    const e = $('.m-terra__parola').getExtentOfChar(5); // la T: il centro cade sul suo gambo
    gsap.timeline({ scrollTrigger: { trigger: terra, start: 'top top', end: 'bottom bottom', scrub: true } })
      .fromTo('.m-terra__g', { scale: 1 }, { scale: 70, svgOrigin: `${e.x + e.width / 2} ${e.y + e.height * 0.56}`, ease: 'power3.in', duration: 0.55 }, 0)
      .fromTo('.m-terra__img', { scale: 1.3 }, { scale: 1, ease: 'power2.out', duration: 0.7 }, 0)
      .set('.m-terra__mask', { opacity: 0 }, 0.56)
      .fromTo(terra, { '--scrim': 0 }, { '--scrim': 1, duration: 0.12 }, 0.6)
      .fromTo(testo, { opacity: 0, y: 30 }, { opacity: 1, y: 0, stagger: 0.06, duration: 0.14 }, 0.66)
      .to({}, { duration: 0.12 }); // un attimo fermi sul testo prima di uscire
  });

  /* ---- esperienze: tre pannelli, il primo aperto; passandoci sopra (o col tab, o toccando) si apre l'altro ---- */
  const panels = $('.m-es__panels');
  panels.innerHTML = D.experiences.map((x, i) => `<article class="m-es__p${i ? '' : ' is-on'}" tabindex="0" aria-label="${x.name}">
    <img src="${x.photos[0]}" alt="" loading="lazy" decoding="async">
    <div class="m-es__c"><h3 class="m-es__name">${x.name}</h3>
      <div class="m-es__more"><div>
        <p class="m-es__meta">${x.durata} · da ${x.min} persone</p>
        <p class="m-es__desc">${x.desc}</p>
        <ul class="m-es__inc">${x.include.map((t) => `<li>${t}</li>`).join('')}</ul>
        <div class="m-es__row"><p class="m-es__price">da <strong>${FS.euro(x.price)}</strong> a persona</p><a class="btn btn--gold" href="${x.url}" target="_blank" rel="noopener">Prenota</a></div>
      </div></div>
    </div></article>`).join('');
  const pp = $$('.m-es__p', panels), apri = (p) => pp.forEach((q) => q.classList.toggle('is-on', q === p));
  pp.forEach((p) => ['pointerenter', 'focusin', 'click'].forEach((ev) => p.addEventListener(ev, (e) => { if (ev === 'pointerenter' && e.pointerType !== 'mouse') return; apri(p); })));

  /* ---- premi: nastro infinito; scorrendo accelera e segue la direzione dello scroll ---- */
  const track = $('.m-pr__track');
  const premio = (a) => `<li><a href="${a.url}" target="_blank" rel="noopener"><span class="m-pr__logo"><img src="${a.logo}" alt="" loading="lazy"></span><span class="m-pr__name">${a.name}</span></a></li>`;
  track.innerHTML = D.awards.map(premio).join('') + D.awards.map(premio).join('').replace(/<a /g, '<a tabindex="-1" aria-hidden="true" ');
  if (reduce) track.style.flexWrap = 'wrap';
  else {
    let x = 0, boost = 0, dir = 1, on = false;
    ScrollTrigger.create({ trigger: '.m-pr', start: 'top bottom', end: 'bottom top', onToggle: (s) => (on = s.isActive),
      onUpdate: (s) => { boost = clamp(Math.abs(s.getVelocity()) / 220, 0, 14); dir = s.direction; } });
    gsap.ticker.add(() => {
      if (!on) return;
      const half = track.scrollWidth / 2;
      x -= (0.7 + boost) * dir; boost *= 0.93;
      if (x <= -half) x += half; if (x > 0) x -= half;
      track.style.transform = `translate3d(${x}px,0,0)`;
    });
  }

  /* ---- news ---- */
  $('.m-nw__grid').innerHTML = D.news.map((n) => `<a class="m-nw__item" href="${n.url}" target="_blank" rel="noopener"><div class="m-nw__fig"><img src="${n.img}" alt="" loading="lazy" decoding="async"></div>
    <p class="m-nw__date">${n.date}</p><h3 class="m-nw__title">${n.title}</h3></a>`).join('');
  if (!reduce) gsap.from('.m-nw__item', { y: 48, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: '.m-nw__grid', start: 'top 82%' } });

  /* ---- pulsanti calamita: solo col mouse ---- */
  if (mouse && !reduce) $$('#main .btn').forEach((b) => {
    b.addEventListener('pointermove', (e) => { const r = b.getBoundingClientRect(); gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * 0.22, y: (e.clientY - r.top - r.height / 2) * 0.32, duration: 0.4, ease: 'power3.out' }); });
    b.addEventListener('pointerleave', () => gsap.to(b, { x: 0, y: 0, duration: 0.6, ease: 'power3.out' }));
  });
})();
