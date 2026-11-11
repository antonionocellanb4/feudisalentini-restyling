/* HOME sotto la fiaba (giro 3): esperienze, cantina, premi, news, dai dati veri di js/data.js.
   Accenti a matita (js/matita.js): a ogni persona in più sul tavolo dell'esperienza si disegna un calice, del colore dei vini che si
   assaggiano (l'equivalente del metro da sarta di Intessuto); le foto della cantina in sequenza, con una nota e una freccia a matita;
   i loghi dei premi cerchiati. In fondo, il passaggio tra le sezioni (come klimtwine). Dipende da: matita.js, gsap + ScrollTrigger, FS / FS_DATA. */
(() => {
  const M = window.Matita, D = window.FS_DATA;
  if (!M || !D || !document.getElementById('azienda')) return; // 11 nov: le esperienze sono tolte, non le fanno più
  ['#azienda', '#premi', '#news'].forEach((id) => document.querySelectorAll(`${id} [data-righe]`).forEach(FS.righe));
  const vista = (el, fn) => FS.dopoIngresso(() => ScrollTrigger.create({ trigger: el, start: 'top 78%', once: true, onEnter: fn }));
  const rectIn = (el, cv) => { const a = el.getBoundingClientRect(), b = cv.getBoundingClientRect(); return { x: a.left - b.left, y: a.top - b.top, w: a.width, h: a.height }; };
  const graf = (pts, w = 1.5) => M.stroke(pts, { w, amp: 1 });

  /* ---- cantina, la parte fotografica (come klimtwine): la foto dentro il titolo si ingrandisce mentre il titolo sbiadisce, le foto
     passano in diagonale (entrano in basso a destra, escono in alto a sinistra) e quella al centro ha la sua nota con la freccia a
     matita; l'ultima, le vigne al tramonto, si allarga a tutto schermo e porta il testo. p = avanzamento nella sezione alta (0..1) ---- */
  const ca = document.getElementById('azienda'), palco = ca.querySelector('.ca-stage'), slot = ca.querySelector('.ca-slot'), apre = ca.querySelector('.ca-apre');
  const figs = [...ca.querySelectorAll('.ca-f')], N = figs.length, fine = [...ca.querySelector('.ca-fine').children];
  const ease = (t) => t * t * (3 - 2 * t), lerp = (a, b, t) => a + (b - a) * t, mix = (r, q, t) => ({ x: lerp(r.x, q.x, t), y: lerp(r.y, q.y, t), w: lerp(r.w, q.w, t), h: lerp(r.h, q.h, t) });
  const note = figs.map((fig) => {
    const cv = fig.querySelector('canvas');
    if (!cv) return null;
    const o = { p: 0, s: [] };
    o.sheet = new M.Sheet(cv, (ctx, f) => o.s.forEach((t, i) => { t.progress = i ? M.clamp(o.p * 4 - 3) : M.clamp(o.p * 1.3); M.draw(ctx, t, f); }), (w, h) => {
      const nw = fig.querySelector('figcaption').offsetWidth, a = [w - nw - 12, h - 26], b = [w - nw - 70, 6]; // dalla nota al bordo della foto
      const q = M.smooth([a, [lerp(a[0], b[0], 0.5) - 8, lerp(a[1], b[1], 0.5) + 12], b], false, 10), [p1, p2] = [q[q.length - 3], q[q.length - 1]], ang = Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);
      o.s = [graf(q, 1.4), graf([[b[0] - Math.cos(ang - 0.5) * 11, b[1] - Math.sin(ang - 0.5) * 11], b, [b[0] - Math.cos(ang + 0.5) * 11, b[1] - Math.sin(ang + 0.5) * 11]], 1.4)];
    });
    return o;
  });
  let L = null, caP = 0;
  const misura = () => {
    const W = palco.clientWidth, H = palco.clientHeight, mob = W < 768, pr = palco.getBoundingClientRect(), sr = slot.getBoundingClientRect();
    const bw = mob ? W * 0.84 : Math.min(W * 0.46, H * 0.58 * 1.5);
    L = { W, H, bw, bh: bw / 1.5, cx: W / 2, cy: H / 2 + (mob ? 0 : 16), dx: mob ? W * 0.52 : W * 0.4, dy: mob ? H * 0.34 : H * 0.42, sosta: mob ? 0.3 : 0,
      slot: { x: sr.left - pr.left, y: sr.top - pr.top, w: sr.width, h: sr.height } };
  };
  const posto = (s) => { // s = distanza dal centro in foto: 0 al centro e grande, ±1 piccola nell'angolo
    const a = Math.min(Math.abs(s), 1.6), sc = 1 - 0.58 * Math.min(a, 1) - 0.1 * Math.max(0, a - 1), w = L.bw * sc, h = L.bh * sc;
    return { x: L.cx + s * L.dx - w / 2, y: L.cy + s * L.dy - h / 2, w, h };
  };
  const scena = (p) => {
    if (!L) return;
    const A = 0.14, B = 0.72, C = 0.86; // titolo fermo un attimo, poi la sua foto cresce · galleria · ultima foto a tutto schermo · testo
    const a = ease(M.clamp((p - 0.025) / (A - 0.025))), e = ease(M.clamp((p - B) / (C - B))), d = M.clamp((p - C) / (1 - C));
    // telefono: ogni foto si ferma al centro per il 60% del suo tratto, con la nota e la freccia (prima passava in un attimo e la nota con lei)
    const u = ((N - 1) * (p - A)) / (B - A), j = Math.floor(u), h = L.sosta;
    const g = p < A ? a - 1 : p < B ? (h ? j + ease(M.clamp((u - j - h) / (1 - 2 * h))) : u) : N - 1 + e * 0.7;
    apre.style.opacity = p < A ? Math.max(0.15, 1 - 1.7 * a) : Math.max(0, 0.15 - (p - A) * 4); // il titolo sbiadisce mentre la foto cresce
    figs.forEach((fig, i) => {
      let s = i - g, r = null, rad = 8;
      if (i === 0 && p < A) { r = mix(L.slot, posto(0), a); s = (1 - a) * 2; } // la nota arriva solo a foto quasi grande
      if (i === N - 1 && p >= B) { r = mix(posto(0), { x: 0, y: 0, w: L.W, h: L.H }, e); s = 0; rad = 8 * (1 - e); }
      const vis = Math.abs(s) < 1.9;
      fig.style.visibility = vis ? '' : 'hidden';
      if (!vis) return;
      r ??= posto(s);
      fig.style.transform = `translate(${r.x}px,${r.y}px)`; fig.style.width = r.w + 'px'; fig.style.height = r.h + 'px'; fig.style.setProperty('--rad', rad + 'px');
      const o = note[i];
      if (o) { const v = M.clamp(1 - Math.abs(s) * 2.5); fig.style.setProperty('--nota', v); if (o.p !== v) { o.p = v; o.sheet.kick(150); } }
    });
    ca.style.setProperty('--scrim', e);
    fine.forEach((el, i) => { const q = ease(M.clamp(d * 1.8 - i * 0.3)); el.style.opacity = q; el.style.transform = q < 1 ? `translateY(${(1 - q) * 32}px)` : ''; });
  };
  if (FS.reduce) { ca.classList.add('ca--ferma'); addEventListener('load', () => { misura(); scena(1); }); }
  else ScrollTrigger.create({ trigger: ca, start: 'top top', end: 'bottom bottom', onUpdate: (st) => scena((caP = st.progress)), onRefresh: (st) => { misura(); scena((caP = st.progress)); } });

  /* ---- premi: loghi pieni, cerchiati a matita ---- */
  const ul = document.querySelector('.pr-list'), prCv = document.querySelector('.pr-canvas');
  ul.innerHTML = D.awards.map((a) => `<li><a href="${a.url}" target="_blank" rel="noopener"><span class="pr-logo"><img src="${a.logo}" alt="${a.name}" loading="lazy" decoding="async"></span><span class="pr-n">${a.name}</span><span class="pr-t">${a.text}</span></a></li>`).join('');
  let cerchi = [], prP = 0;
  const prSheet = new M.Sheet(prCv, (ctx, f) => cerchi.forEach((t, i) => { t.progress = M.clamp(prP * ((cerchi.length - 1) * 0.6 + 1) - i * 0.6); /* l'ultimo finisce a prP = 1 */ M.draw(ctx, t, f); }), () => {
    cerchi = [...ul.querySelectorAll('.pr-logo')].map((el, i) => { const r = rectIn(el, prCv); return graf(M.ellipse(r.x + r.w / 2, r.y + r.h / 2, r.w / 2 + 11, r.h / 2 + 9, 0.1 * (i % 2 ? 1 : -1), -2.2 + i, 1.12, 56), 1.6); });
  });
  // prima il cerchio a matita, poi il logo dentro (nello stesso ritmo del cerchio)
  const loghi = [...ul.querySelectorAll('.pr-logo img')];
  if (!FS.reduce) gsap.set(loghi, { opacity: 0, scale: 0.86 });
  vista(ul, () => {
    gsap.to({ v: 0 }, { v: 1, duration: 2.2, ease: 'none', onUpdate() { prP = this.targets()[0].v; prSheet.kick(200); } });
    gsap.to(loghi, { opacity: 1, scale: 1, duration: 0.7, ease: 'power2.out', delay: 0.45, stagger: (2.2 * 0.6) / ((loghi.length - 1) * 0.6 + 1) });
  });

  /* ---- news ---- */
  document.querySelector('.nw-grid').innerHTML = D.news.map((n) => `<a class="nw-item" href="${n.url}" target="_blank" rel="noopener">
    <img src="${n.img}" alt="" loading="lazy" decoding="async"><p class="nw-date">${n.date}</p><h3 class="nw-title">${n.title}</h3></a>`).join('');

  /* ---- passaggio tra "Disegna il tuo vino" e la cantina (come klimtwine): disegna si ferma e si vela, la cantina le sale sopra come una
     carta che si allarga fino ai bordi. Solo qui: il 30 ott "non ovunque, dopo Leporano sul mar Ionio inventati altro" ---- */
  const [sotto, sopra] = ['#disegna', '#azienda'].map((q) => document.querySelector(q));
  [sotto, sopra].forEach((el, i) => { el.classList.add('strato'); el.style.zIndex = i + 1; });
  if (!FS.reduce) FS.dopoIngresso(() => {
    sotto.classList.add('copre');
    ScrollTrigger.create({ trigger: sotto, pin: true, pinSpacing: false,
      start: () => (sotto.offsetHeight > innerHeight ? 'bottom bottom' : 'top top'), end: () => '+=' + Math.min(sotto.offsetHeight, innerHeight),
      onUpdate: (st) => sotto.style.setProperty('--velo', (st.progress * 0.35).toFixed(3)) });
    gsap.fromTo(sopra, { clipPath: 'inset(0% 5% 0% 5% round 8px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none',
      scrollTrigger: { trigger: sopra, start: 'top bottom', end: 'top 4%', scrub: true } }); // a filo prima di arrivare in cima
  });

  /* ---- dopo la cantina la pagina scorre normale: il fondo cambia colore piano da una sezione all'altra (come klimtwine tra un vino e
     l'altro) e i blocchi entrano "dallo schizzo alla foto": cornice a matita, la foto si sviluppa dal basso dentro la cornice, poi i
     testi; la cornice resta (30 ott: "ci stava, lasciala") ---- */
  const tinta = (q, v) => { const el = document.querySelector(q), col = getComputedStyle(document.documentElement).getPropertyValue(v).trim();
    el.classList.add('tinta');
    ScrollTrigger.create({ trigger: el, start: 'top 55%', end: 'bottom 55%', onToggle: (st) => st.isActive && gsap.to(document.body, { backgroundColor: col, duration: 0.9, ease: 'power1.out', overwrite: true }) });
  };
  [['#premi', '--stone'], ['#news', '--cream'], ['#contatti', '--stone']].forEach(([q, v]) => tinta(q, v));
  const schizzo = (wrap, item, foto) => { // foto: cosa si sviluppa dentro la cornice (null = tutto il blocco)
    if (FS.reduce) return;
    const cv = document.createElement('canvas'), els = [...wrap.querySelectorAll(item)], k = els.map(() => ({ p: 0, a: 1 })), dentro = (el) => (foto ? el.querySelector(foto) : el);
    cv.className = 'schizzo'; cv.setAttribute('aria-hidden', 'true'); wrap.append(cv);
    let segni = [];
    const sh = new M.Sheet(cv, (ctx, f) => segni.forEach((t, i) => { t.progress = k[i].p; t.alpha = k[i].a; M.draw(ctx, t, f); }), () => {
      segni = els.map((el) => { const r = rectIn(dentro(el), cv), a = 5; return graf([[r.x - a, r.y - 3], [r.x + r.w + 4, r.y - a], [r.x + r.w + a, r.y + r.h + 4], [r.x - 4, r.y + r.h + a], [r.x - a - 1, r.y - 1]], 1.4); });
    });
    const resto = (el) => (foto ? [...el.children].filter((c) => !c.matches(foto)) : [...el.querySelector('.es-body').children]);
    els.forEach((el) => { gsap.set(dentro(el), { clipPath: 'inset(100% 0% 0% 0%)' }); gsap.set(resto(el), { opacity: 0, y: 16 }); });
    vista(wrap, () => els.forEach((el, i) => gsap.timeline({ delay: i * 0.18, onUpdate: () => sh.kick(150) })
      .to(k[i], { p: 1, duration: 0.8, ease: 'power1.inOut' }, 0)
      .to(dentro(el), { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'expo.out' }, 0.55)
      .to(resto(el), { opacity: 1, y: 0, duration: 0.6, stagger: 0.06, ease: 'power2.out' }, 0.9)));
  };
  schizzo(document.querySelector('.nw-grid'), '.nw-item', 'img');
})();
