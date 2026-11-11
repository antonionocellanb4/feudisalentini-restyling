/* HOME MODERNA C "archi" (30 ott 2026). Hero: la foto della corte è a tutto schermo ma ritagliata ad arco (clip-path con gli angoli
   superiori tondi quanto metà larghezza); all'apertura l'arco sale dal basso e la bottiglia vera si posa sulla soglia; scorrendo (palco
   fermo) l'arco si apre fino ai bordi, "Feudi" e "Salentini" escono ai lati. Un solo calcolo per stato (apertura + scroll), niente tween
   in gara. Poi foto ad arco che salgono a velocità diverse, nicchie, righe alterne. Pezzi comuni in js/moderna-kit.js. */
(() => {
  const { $, $$, reduce, clamp, ss, titoli, parole, apri, sale, collezioni } = FS.mk, D = FS.data, pad = (n) => String(n).padStart(2, '0');

  /* ---- hero ad arco ---- */
  const st = $('.c-hero__stage'), foto = $('.c-hero__foto'), img = $('img', foto), bt = $('.c-hero__bt'), sx = $('.c-hero__sx'), dx = $('.c-hero__dx'), lead = $('.c-hero__lead');
  bt.src = FS.wine('c53-primitivo').bottle;
  const S = { apre: reduce ? 1 : 0, posa: reduce ? 1 : 0, p: 0 };
  let G = null;
  const geo = () => {
    const W = st.clientWidth, H = st.clientHeight, mob = W <= 860;
    const aw = mob ? W * 0.68 : Math.min(W * 0.27, H * 0.46), ah = mob ? Math.min(H * 0.6, aw * 1.75) : Math.min(H * 0.74, aw * 1.8);
    const top = mob ? H - ah - 100 : (H - ah) / 2 + 30, hb = ah * 0.56;
    G = { W, H, aw, ah, top, lato: (W - aw) / 2, sotto: H - top - ah, hb };
    bt.style.height = `${hb}px`; bt.style.top = `${top + ah - hb * 0.91 - ah * 0.04}px`; // la foto ha ~9% vuoto sotto la bottiglia
  };
  const stato = () => {
    if (!G) geo();
    const e = ss(clamp(S.p / 0.85)), a = S.apre, q = 1 - e;
    const t = (G.top + G.ah * (1 - a)) * q, r = (G.aw / 2) * q, rb = 8 * q;
    foto.style.clipPath = `inset(${t}px ${G.lato * q}px ${G.sotto * q}px ${G.lato * q}px round ${r}px ${r}px ${rb}px ${rb}px)`;
    gsap.set(img, { scale: 1.14 - 0.14 * Math.max(a, e) });
    gsap.set(bt, { xPercent: -50, y: 40 * (1 - S.posa) + G.H * 0.12 * e, scale: 1 + 0.25 * e, opacity: S.posa * (1 - clamp(e / 0.45)) });
    gsap.set(sx, { x: -G.W * 0.3 * e, opacity: 1 - clamp(e / 0.6) });
    gsap.set(dx, { x: G.W * 0.3 * e, opacity: 1 - clamp(e / 0.6) });
    gsap.set(lead, { opacity: (reduce ? 1 : clamp(S.posa)) * (1 - clamp(S.p / 0.15)) });
  };
  addEventListener('resize', () => { G = null; stato(); });
  stato();
  if (!reduce) {
    gsap.to(S, { apre: 1, duration: 1.6, ease: 'expo.inOut', delay: 0.15, onUpdate: stato });
    gsap.to(S, { posa: 1, duration: 1.3, ease: 'expo.out', delay: 1.1, onUpdate: stato });
    ScrollTrigger.create({ trigger: '.c-hero', start: 'top top', end: 'bottom bottom', onUpdate: (s) => { S.p = s.progress; stato(); } });
  }

  /* ---- collezioni nelle nicchie ---- */
  const C = collezioni();
  $('.c-vini__nicchie').innerHTML = C.map((c) => `<li><button class="c-nicchia" type="button" data-col="${c.col.id}"><span class="c-nicchia__vano"><img src="${c.w.bottle}" style="--b:${c.w.fondo}" alt="" loading="lazy" decoding="async"></span>
    <span class="c-nicchia__nome">${c.col.name}</span><span class="c-nicchia__info">${c.tipi}</span><span class="c-nicchia__vai">Vedi i vini</span></button></li>`).join('');
  $('.c-vini__nicchie').addEventListener('click', (e) => { const b = e.target.closest('[data-col]'); if (b) apri(b.dataset.col); });

  /* ---- premi, news (dati veri) ---- */
  $('.c-pr__lista').innerHTML = D.awards.map((a) => `<li><a href="${a.url}" target="_blank" rel="noopener"><span class="c-pr__logo"><img src="${a.logo}" alt="" loading="lazy"></span>
    <span class="c-pr__nome">${a.name}</span><span class="c-pr__txt">${a.text}</span></a></li>`).join('');
  $('.c-nw__grid').innerHTML = D.news.map((n) => `<a class="c-nw__item" href="${n.url}" target="_blank" rel="noopener"><div class="c-nw__fig"><img src="${n.img}" alt="" loading="lazy" decoding="async"></div>
    <p class="c-nw__date">${n.date}</p><h3 class="c-nw__title">${n.title}</h3></a>`).join('');

  titoli();
  parole($('.c-cantina__t'), 0.22);
  if (reduce) return;

  // le tre foto ad arco della cantina salgono a velocità diverse
  $$('.c-ad').forEach((el) => gsap.fromTo(el, { y: -+el.dataset.v }, { y: +el.dataset.v, ease: 'none', scrollTrigger: { trigger: '.c-cantina', start: 'top bottom', end: 'bottom top', scrub: true } }));
  // nicchie che salgono, poi le bottiglie dentro
  sale('.c-vini__nicchie > li', '.c-vini__nicchie');
  gsap.fromTo('.c-nicchia__vano img', { yPercent: 20, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.3, ease: 'expo.out', stagger: 0.1, delay: 0.3, clearProps: 'transform,translate,opacity', // in percentuale: la y in px annullava lo spostamento che posa il vetro (--b)
    scrollTrigger: { trigger: '.c-vini__nicchie', start: 'top 80%' } });
  sale('.c-pr__lista li', '.c-pr__lista');
  sale('.c-nw__item', '.c-nw__grid');
})();
