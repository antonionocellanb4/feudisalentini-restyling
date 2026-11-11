/* HOME MODERNA B "luminarie" (30 ott 2026). Hero: una galleria di archi di lampadine (come le luminarie delle feste del Salento) in
   prospettiva; all'apertura si accendono dal basso, arco dopo arco; scorrendo (palco fermo) camminiamo sotto gli archi e in fondo ci
   aspetta la bottiglia vera, che si avvicina e prende il suo nome. Disegno su canvas: lampadine = un'unica immagine di alone ridisegnata
   in somma di luce; un punto a profondità z sta a schermo in C + P * f / (z - cam). Pezzi comuni in js/moderna-kit.js. */
(() => {
  const { $, $$, reduce, clamp, ss, titoli, parole, apri, sale, collezioni } = FS.mk, D = FS.data, pad = (n) => String(n).padStart(2, '0');

  /* ---- la galleria di luci ---- */
  const stage = $('.b-hero__stage'), cv = $('.b-hero__cv'), ctx = cv.getContext('2d'), testo = $('.b-hero__testo'), cap = $('.b-hero__vino');
  const mob = innerWidth <= 860, N = mob ? 5 : 6, PASSO = 0.9, Z0 = 1.2, OCCHI = 0.5;
  const ZB = Z0 + (N - 1) * PASSO + 0.4, CAM_FINE = ZB - 0.72; // la bottiglia sta oltre l'ultimo arco; ci si ferma poco prima
  const c53 = FS.wine('c53-primitivo'), bt = new Image();
  bt.src = c53.bottle;
  $('span', cap).textContent = c53.name; $('small', cap).textContent = c53.denom;
  const luci = [];
  for (let i = 0; i < N; i++) { // un arco: due contorni (pilastri + mezzo cerchio), il rosone in alto, i raggi tra rosone e arco interno
    const z = Z0 + i * PASSO, S = 0.034, p = [];
    const linea = (ax, ay, bx, by) => { const n = Math.max(1, Math.round(Math.hypot(bx - ax, by - ay) / S)); for (let k = 0; k < n; k++) p.push([ax + (bx - ax) * k / n, ay + (by - ay) * k / n]); };
    const giro = (cx, cy, r, a0, a1, s = S) => { const n = Math.max(2, Math.round(Math.abs(a1 - a0) * r / s)); for (let k = 0; k <= n; k++) { const a = a0 + (a1 - a0) * k / n; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
    [0.5, 0.41].forEach((r) => { linea(-r, 0, -r, 0.9); giro(0, 0.9, r, Math.PI, 0); linea(r, 0.9, r, 0); });
    giro(0, 1.0, 0.1, 0, Math.PI * 2, S * 0.75);
    for (let k = 1; k < 8; k++) { const a = Math.PI * k / 8; linea(Math.cos(a) * 0.14, 1.0 + Math.sin(a) * 0.14, Math.cos(a) * 0.38, 0.9 + Math.sin(a) * 0.38); }
    p.forEach(([x, y]) => luci.push({ x, y, z, t: 0.3 + i * 0.28 + (y / 1.41) * 0.8 })); // si accendono dal basso, l'arco più vicino per primo
  }
  const alone = document.createElement('canvas'); // l'alone di una lampadina: centro quasi bianco, poi oro caldo che sfuma
  alone.width = alone.height = 64;
  { const g = alone.getContext('2d'), r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    r.addColorStop(0, 'rgba(255,250,235,1)'); r.addColorStop(0.16, 'rgba(255,226,160,.95)'); r.addColorStop(0.4, 'rgba(240,180,90,.28)'); r.addColorStop(1, 'rgba(240,170,80,0)');
    g.fillStyle = r; g.fillRect(0, 0, 64, 64); }

  let W = 0, H = 0, dpr = 1, f = 1, hy = 0, cam = 0, accese = reduce ? 99 : 0, sporco = true;
  const misura = () => {
    dpr = Math.min(2, devicePixelRatio || 1); W = stage.clientWidth; H = stage.clientHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    hy = H * (mob ? 0.6 : 0.62); f = Math.min((hy - H * 0.1) * Z0 / 0.91, W * 0.8 * Z0); sporco = true;
  };
  const disegna = () => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    const cx = W / 2;
    // la bottiglia in fondo, su una pozza di luce
    const dz = ZB - cam, k = f / dz, base = hy + (OCCHI - 0.26) * k - (mob ? H * 0.08 : 0), alta = (mob ? 0.58 : 0.66) * k;
    const pozza = ctx.createRadialGradient(cx, base, 0, cx, base, alta * 0.9);
    pozza.addColorStop(0, `rgba(255,214,150,${0.32 * clamp(accese / 2.6)})`); pozza.addColorStop(1, 'rgba(255,214,150,0)');
    ctx.save(); ctx.translate(cx, base); ctx.scale(1, 0.22); ctx.translate(-cx, -base); ctx.fillStyle = pozza; ctx.fillRect(cx - alta, base - alta, alta * 2, alta * 2); ctx.restore();
    if (bt.complete && bt.naturalWidth) { const h = alta / 0.91, w = h * bt.naturalWidth / bt.naturalHeight; ctx.globalAlpha = clamp((accese - 1.6) / 0.8); ctx.drawImage(bt, cx - w / 2, base - h * 0.91, w, h); ctx.globalAlpha = 1; }
    // le lampadine, in somma di luce; le più lontane più deboli, quelle che ci passano accanto sfumano
    ctx.globalCompositeOperation = 'lighter';
    for (const l of luci) {
      const d = l.z - cam;
      if (d < 0.12) continue;
      const a = clamp((accese - l.t) / 0.25) * clamp(1.5 - d * 0.16) * clamp((d - 0.12) / 0.3);
      if (a <= 0.01) continue;
      const s = Math.min(160, Math.max(3, 0.06 * f / d)), x = cx + l.x * f / d, y = hy - (l.y - OCCHI) * f / d;
      if (x < -s || x > W + s || y < -s || y > H + s) continue;
      ctx.globalAlpha = a; ctx.drawImage(alone, x - s / 2, y - s / 2, s, s);
    }
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    // il nome del vino accanto alla bottiglia, quando siamo arrivati
    if (!mob) cap.style.left = `${cx + alta * 0.45 + 32}px`;
    sporco = false;
  };
  misura();
  addEventListener('resize', misura);
  bt.onload = () => (sporco = true);
  gsap.ticker.add(() => { if (sporco) disegna(); });
  if (!reduce) {
    gsap.to({ v: 0 }, { v: 1, duration: 3.6, ease: 'none', onUpdate() { accese = this.targets()[0].v * 3.6; sporco = true; } }); // le luci si accendono
    gsap.fromTo('.b-hero__lead', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 1.4 });
    ScrollTrigger.create({ trigger: '.b-hero', start: 'top top', end: 'bottom bottom', onUpdate: (s) => {
      const p = s.progress;
      cam = CAM_FINE * ss(clamp(p / 0.9)); sporco = true;
      gsap.set(testo, { opacity: 1 - clamp(p / 0.12), y: -30 * clamp(p / 0.12) });
      gsap.set(cap, { opacity: clamp((p - 0.82) / 0.1) });
    } });
  } else gsap.set(cap, { opacity: 1 });

  /* ---- collezioni sotto la luce ---- */
  const C = collezioni();
  $('.b-vini__fila').innerHTML = C.map((c) => `<li><button class="b-vetrina" type="button" data-col="${c.col.id}"><span class="b-vetrina__luce" aria-hidden="true"></span>
    <img class="b-vetrina__bt" src="${c.w.bottle}" style="--b:${c.w.fondo}" alt="" loading="lazy" decoding="async"><span class="b-vetrina__nome">${c.col.name}</span><span class="b-vetrina__info">${c.tipi}</span><span class="b-vetrina__vai">Vedi i vini</span></button></li>`).join('');
  $('.b-vini__fila').addEventListener('click', (e) => { const b = e.target.closest('[data-col]'); if (b) apri(b.dataset.col); });

  /* ---- premi e news ---- */
  $('.b-pr__nomi').innerHTML = D.awards.map((a) => `<li><a href="${a.url}" target="_blank" rel="noopener" title="${a.text}"><img src="${a.logo}" alt="" loading="lazy">${a.name}</a></li>`).join('');
  $('.b-nw__righe').innerHTML = D.news.map((n) => `<li><a href="${n.url}" target="_blank" rel="noopener"><span class="b-nw__date">${n.date}</span><span class="b-nw__title">${n.title}</span>
    <span class="b-nw__fig"><img src="${n.img}" alt="" loading="lazy" decoding="async"></span></a></li>`).join('');

  titoli();
  parole($('.b-cantina__t'), 0.2);
  if (reduce) return;

  // la masseria tra le vigne si allarga fino ai bordi; i fasci di luce si accendono uno dopo l'altro
  gsap.fromTo('.b-cantina__foto', { clipPath: 'inset(0% 22% 0% 22% round 12px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none',
    scrollTrigger: { trigger: '.b-cantina__foto', start: 'top bottom', end: 'center center', scrub: true } });
  gsap.fromTo('.b-vetrina__luce', { opacity: 0 }, { opacity: 1, duration: 1.2, ease: 'power1.out', stagger: 0.18, scrollTrigger: { trigger: '.b-vini__fila', start: 'top 75%' } });
  gsap.fromTo('.b-vetrina__bt', { yPercent: 9, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.3, ease: 'expo.out', stagger: 0.12, clearProps: 'transform,translate,opacity', // in percentuale: la y in px annullava lo spostamento che posa il vetro (--b)
    scrollTrigger: { trigger: '.b-vini__fila', start: 'top 80%' } });
  sale('.b-es__box > *', '.b-es__box');
  sale('.b-pr__nomi li', '.b-pr__nomi');
  sale('.b-nw__righe li', '.b-nw__righe');
})();
