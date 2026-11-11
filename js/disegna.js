/* PROVA A "Disegna il tuo vino" (giro 3). Il tratto di chi visita viene misurato (rotondo o teso, ampio o leggero, lungo o corto),
   confrontato con la "forma" dei vini ricavata dai dati veri (aromi, gradazione, tipo, legno), poi la matita lo ripassa e lo
   trasforma nella forma del vino più vicino: acquerello del suo colore, tratteggio, contorno a matita della bottiglia preso dall'alfa
   della foto, la foto vera dentro, gli aromi disegnati attorno. Limite dichiarato: il sito non dà corpo e acidità dei vini.
   Dipende da: js/matita.js, gsap, FS_DATA (js/data.js), FS (js/main.js). Piano: tools/PIANO-giro3.md */
(() => {
  const sec = document.querySelector('.dv');
  if (!sec || !window.Matita) return;
  const M = Matita, D = window.FS_DATA, html = document.documentElement;
  const $ = (s) => sec.querySelector(s);
  const pad = $('.dv-pad'), hint = $('.dv-hint'), res = $('.dv-res'), img = $('.dv-bottle'), ul = $('.dv-aromi');
  const hintHTML = hint.innerHTML;
  const narrow = () => innerWidth <= 860;
  let R = { x: 0, y: 0, w: 1, h: 1 }; // area di disegno in coordinate della sezione (= del canvas)
  const measure = () => { const s = sec.getBoundingClientRect(), p = pad.getBoundingClientRect(); R = { x: p.left - s.left, y: p.top - s.top, w: p.width, h: p.height }; };

  /* ---- la forma di ogni vino, i disegni degli aromi e il contorno della bottiglia: in js/aromi.js (usati anche da vino-i.html) ---- */
  const VINI = D.wines.map((w) => ({ w, v: Aromi.forma(w) }));
  const { DIS, aromiDi, contourOf } = Aromi, S = M.smooth;

  /* ---- misura del tratto ---- */
  const analyze = (raw) => {
    let p = M.resample(raw, 128);
    for (let k = 0; k < 2; k++) p = p.map((q, i) => (i && i < 127 ? [(p[i - 1][0] + q[0] + p[i + 1][0]) / 3, (p[i - 1][1] + q[1] + p[i + 1][1]) / 3] : q)); // via il tremolio del mouse
    const b = M.bbox(p), ang = (i, j) => Math.atan2(p[j][1] - p[i][1], p[j][0] - p[i][0]), wrap = (d) => Math.atan2(Math.sin(d), Math.cos(d));
    let abs = 0, corners = 0, flips = 0, prev = 0, inCorner = false;
    for (let i = 1; i < 127; i++) abs += Math.abs(wrap(ang(i, i + 1) - ang(i - 1, i)));
    for (let i = 2; i < 126; i++) {
      const d = wrap(ang(i, i + 2) - ang(i - 2, i));                          // svolta su una finestra: uno spigolo diviso su due punti conta una volta
      if (Math.abs(d) > 0.9) { if (!inCorner) corners++; inCorner = true; } else inCorner = false;
      if (Math.abs(d) > 0.25) { const s = Math.sign(d); if (prev && s !== prev) flips++; prev = s; }
    }
    const closed = Math.hypot(p[0][0] - p[127][0], p[0][1] - p[127][1]) < 0.3 * Math.max(b.w, b.h);
    const cornerS = M.clamp(corners / 4), zig = M.clamp(flips / 8), curvy = M.clamp(abs / M.TAU), straight = closed ? 0 : M.clamp(1 - abs / Math.PI);
    return {
      round: M.clamp(0.5 + 0.5 * curvy * (1 - cornerS) - 0.45 * cornerS - 0.3 * zig - 0.35 * straight),
      ample: M.clamp((b.h / R.h - 0.08) / 0.6),
      long: M.clamp((b.w / R.w - 0.1) / 0.7),
    };
  };
  let lastId = null;
  const match = (f) => {
    const d = VINI.map((x) => ({ x, d: 1.3 * (x.v.round - f.round) ** 2 + (x.v.ample - f.ample) ** 2 + 0.8 * (x.v.long - f.long) ** 2 })).sort((a, b) => a.d - b.d);
    const pick = d[0].x.w.id === lastId && d[1].d < d[0].d * 1.25 + 0.01 ? d[1] : d[0]; // stesso disegno di prima: il secondo più vicino, se è quasi pari
    lastId = pick.x.w.id;
    return pick.x;
  };
  const { etichette } = Aromi; // "Rotonda", "Di media struttura", "Lunga": in js/aromi.js


  /* ---- forme pronte (bottoni) e dimostrazione a riposo ---- */
  const preset = (n) => {
    const cx = R.x + R.w / 2, cy = R.y + R.h * 0.5, w = R.w, h = R.h;
    const giro = (rx, ry, a0, k = 9, turns = 1.04) => S(Array.from({ length: k }, (_, i) => { const a = a0 + (i / (k - 1)) * M.TAU * turns; return [cx + Math.cos(a) * rx * (1 + ((i % 3) - 1) * 0.04), cy + Math.sin(a) * ry]; }), false, 10);
    if (n === 'rotondo') return giro(w * 0.2, h * 0.19, -2.2);
    if (n === 'ampio') return giro(w * 0.25, h * 0.38, -1.4);
    if (n === 'leggero') return giro(w * 0.08, h * 0.08, -2, 7, 1.02);
    return Array.from({ length: 9 }, (_, i) => [R.x + w * (0.14 + (0.72 * i) / 8), cy + (i % 2 ? -1 : 1) * h * 0.045]); // teso: zigzag lungo e basso
  };
  const ghost = { t: null, tw: null, i: 0 };
  const ghostStart = () => {
    if (scene || live || M.RM) return;
    const t = M.stroke(preset(['rotondo', 'teso', 'ampio', 'leggero'][ghost.i++ % 4]), { w: 1.8, amp: 1, alpha: 0.34 });
    t.progress = 0; ghost.t = t;
    ghost.tw = gsap.timeline({ onComplete: ghostStart }).to(t, { progress: 1, duration: 1.8, ease: 'power1.inOut' }).to(t, { alpha: 0, duration: 0.5 }, '+=0.9');
    sheet.kick(3400);
  };
  const ghostStop = () => { ghost.tw?.kill(); ghost.t = null; };

  /* ---- scena del risultato ---- */
  let live = null, scene = null, tl = null, raw = [];
  const st = { morph: 0, color: 0, wash: 0, hatch: 0, contour: 0, photo: 0, icons: 0, fade: 1 };
  const ZERO = { morph: 0, color: 0, wash: 0, hatch: 0, contour: 0, photo: 0, icons: 0, fade: 1 };

  const build = (rawPts, x, cont) => {
    const w = x.w, v = x.v, N = 220;
    const Hi = R.h * (narrow() ? 0.9 : 0.86), Wi = (Hi * 653) / 1024, bx = R.x + R.w / 2, by = R.y + R.h - Hi;
    const cx = bx, cy = by + Hi * 0.62;
    const rx = R.w * (0.16 + 0.2 * v.long), ry = R.h * (0.12 + 0.18 * v.ample), e = 2 - 1.1 * (1 - v.round);
    const a0 = Math.atan2((rawPts[0][1] - cy) / ry, (rawPts[0][0] - cx) / rx); // la forma parte da dove è partito il tratto
    const to = Array.from({ length: N }, (_, i) => {
      const a = a0 + (1.06 * M.TAU * i) / (N - 1), c = Math.cos(a), s = Math.sin(a), k = 1 + v.spice * 0.04 * Math.sin(11 * a);
      return [cx + rx * Math.sign(c) * Math.abs(c) ** (2 / e) * k, cy + ry * Math.sign(s) * Math.abs(s) ** (2 / e) * k];
    });
    const [r, g, b] = M.rgb(w.color), lum = (0.3 * r + 0.59 * g + 0.11 * b) / 255;
    const s = {
      w, from: M.resample(rawPts, N), to, shape: M.stroke(to, { w: 2.2, amp: 1.1, seed: 11 }),
      wash: M.wash(to.slice(0, N - 12), { color: w.color, origin: [cx, cy], amp: 3.5 }), washA: lum > 0.6 ? 0.75 : 0.32,
      hatch: M.hatch(to.slice(0, N - 12), { angle: -0.9, gap: 6, w: 1.1, shade: { x: cx - rx * 0.38, y: cy - ry * 0.4, r: Math.max(rx, ry) * 1.02 } }),
      contour: cont && M.stroke(cont.map(([u, q]) => [bx - Wi / 2 + u * Wi, by + q * Hi]), { w: 1.4, amp: 1.2 }),
      icons: [], img: { x: bx - Wi / 2, y: by, h: Hi },
    };
    // aromi attorno alla bottiglia
    const Sz = M.clamp(R.w * 0.14, 60, 124), off = Wi * 0.22 + Sz * 1.05;
    const slots = [[-1, 0.16], [1, 0.24], [-1, 0.47], [1, 0.55], [-1, 0.77], [1, 0.83]];
    ul.innerHTML = '';
    aromiDi(w).forEach((a, j) => {
      const [side, yy] = slots[j], ix = M.clamp(bx + side * off, R.x + Sz / 2 + 4, R.x + R.w - Sz / 2 - 4), iy = R.y + R.h * yy;
      const d = DIS[a.k](a.terms[0]), sc = Sz / 100, ox = ix - Sz / 2, oy = iy - Sz / 2;
      const li = document.createElement('li');
      li.textContent = a.terms.join(', ').replace(/^./, (c) => c.toUpperCase());
      li.style.cssText = `left:${ix}px;top:${iy + Sz / 2 + 6}px`;
      ul.append(li);
      s.icons.push({ li, l: d.l.map((p) => M.stroke(M.map(p, sc, sc, ox, oy), { w: 1.35, amp: 0.8 })), w: d.w.map(([p, c]) => M.wash(M.map(p, sc, sc, ox, oy), { color: c, amp: 1.6, alpha: 0.6 })) });
    });
    img.src = w.bottle;
    img.style.cssText = `left:${s.img.x}px;top:${s.img.y}px;height:${s.img.h}px`;
    return s;
  };

  const paint = () => { // stato HTML che segue st (foto ed etichette)
    if (!scene) return;
    img.style.opacity = st.photo * st.fade;
    img.style.clipPath = `inset(${(1 - st.photo) * 100}% 0 0 0)`;
    scene.icons.forEach((ic, j) => { ic.li.style.opacity = M.clamp((st.icons - j * 0.55 - 0.3) / 0.4) * st.fade; });
  };

  /* il filo: la radice della fiaba (js/fiaba.js) arriva dall'alto sul centro del foglio e qui scende fino al primo disegno, il cerchio
     "rotondo" (telefono: fin sopra il titolo); sparisce quando si disegna o c'è un risultato */
  let filo = null, filoP = 0;
  const filoMisura = () => {
    const x = R.x + R.w / 2, y1 = narrow() ? $('.dv-intro').offsetTop - 16 : R.y + R.h * 0.31 - 4;
    filo = y1 > 20 ? M.stroke(M.smooth([[x, -8], [x + 5, y1 * 0.35], [x - 4, y1 * 0.7], [x, y1]]), { w: 2, amp: 0.7 }) : null;
  };
  const render = (ctx, f) => {
    if (filo && !scene && !live) { filo.progress = filoP; M.draw(ctx, filo, f); }
    if (ghost.t) M.draw(ctx, ghost.t, f);
    if (live) M.draw(ctx, live, f);
    if (!scene || st.fade <= 0) return;
    const s = scene, k = st.fade;
    if (st.morph < 1 || s.morphed !== 1) { // il tratto si trasforma nella forma del vino
      const e = st.morph, p = s.from.map((a, i) => [a[0] + (s.to[i][0] - a[0]) * e, a[1] + (s.to[i][1] - a[1]) * e]);
      s.shape.p = p; s.shape.c = M.cumul(p); s.shape.L = s.shape.c[p.length - 1]; s.shape.f = null; s.morphed = st.morph;
    }
    s.wash.progress = st.wash; s.wash.alpha = s.washA * k; M.drawWash(ctx, s.wash, f);
    s.hatch.progress = st.hatch; s.hatch.alpha = 0.42 * k; M.drawHatch(ctx, s.hatch, f);
    s.shape.alpha = (1 - st.color) * k; M.draw(ctx, s.shape, f);
    s.shape.alpha = st.color * k; M.draw(ctx, s.shape, f, s.w.color);
    if (s.contour) { s.contour.progress = st.contour; s.contour.alpha = k * (1 - 0.5 * st.photo); M.draw(ctx, s.contour, f); }
    s.icons.forEach((ic, j) => {
      const loc = M.clamp(st.icons - j * 0.55), n = ic.l.length;
      ic.w.forEach((wa) => { wa.progress = M.clamp((loc - 0.45) / 0.55); wa.alpha = 0.6 * k; M.drawWash(ctx, wa, f); });
      ic.l.forEach((l, i) => { l.progress = M.clamp((loc / 0.6) * n - i); l.alpha = k; M.draw(ctx, l, f); });
    });
  };

  const sheet = new M.Sheet($('.dv-canvas'), render, () => {
    measure(); filoMisura();
    if (scene) { const id = scene.w.id; contourOf(scene.w.bottle).then((c) => { scene = build(raw, VINI.find((x) => x.w.id === id), c); paint(); sheet.kick(100); }); }
    else if (ghost.t) { ghostStop(); gsap.delayedCall(0.3, ghostStart); }
  });

  const fill = (w, f) => {
    $('.dv-res__col').textContent = FS.collection(w.collection)?.name || '';
    $('.dv-res__name').textContent = w.name;
    $('.dv-res__denom').textContent = [w.denom, w.uve, w.alcool].filter(Boolean).join(' · ');
    $('.dv-res__forma').innerHTML = etichette(f).map((t) => `<li>${t}</li>`).join('');
    const ar = w.aromi.join(', ');
    $('.dv-res__aromi').innerHTML = ar ? ar.replace(/^./, (c) => c.toUpperCase()) : '<span class="tbd">Non indicati nel catalogo</span>';
    $('.dv-res__abb').textContent = w.abb || 'Non indicato nel catalogo';
    const go = $('.dv-res__go'); go.href = FS.wineUrl(w.id); go.dataset.wine = w.id;
  };

  // telefono: col risultato la sezione cresce e il pin di home.js (che la tiene ferma mentre sale la cantina) va rimisurato, senza spostare quello che si vede
  const cima = () => (sec.parentNode.classList.contains('pin-spacer') ? sec.parentNode : sec).getBoundingClientRect().top + scrollY; // lo spacer del pin resta al posto della sezione
  const rimisura = () => { const y = sec.getBoundingClientRect().top; ScrollTrigger.refresh(); const t = cima() - y; FS.lenis ? FS.lenis.scrollTo(t, { immediate: true }) : scrollTo(0, t); };

  const play = async (pts) => {
    raw = pts;
    const f = analyze(pts), x = match(f), cont = await contourOf(x.w.bottle);
    live = null; Object.assign(st, ZERO);
    scene = build(pts, x, cont);
    fill(x.w, f);
    if (narrow()) pad.style.height = pad.offsetHeight + 'px'; // telefono: la sezione cresce col risultato, il foglio resta com'era
    res.hidden = false; sec.classList.add('is-res'); sec.classList.remove('is-drawing');
    const ni = scene.icons.length * 0.55 + 0.5;
    tl = gsap.timeline({ onUpdate: paint })
      .to(st, { morph: 1, duration: 0.9, ease: 'power2.inOut' }, 0)
      .to(st, { color: 1, duration: 0.6, ease: 'none' }, 0.35)
      .to(st, { wash: 1, duration: 1.1, ease: 'power1.out' }, 0.7)
      .to(st, { hatch: 1, duration: 0.9, ease: 'none' }, 0.9)
      .to(st, { contour: 1, duration: 0.8, ease: 'power1.inOut' }, 1.0)
      .to(st, { photo: 1, duration: 0.7, ease: 'power2.out' }, 1.6)
      .to(st, { icons: ni, duration: ni * 0.9, ease: 'none' }, 1.9)
      .fromTo(res.children, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.06, ease: 'power3.out' }, 0.4); // fromTo: se si ridisegna a metà non restano trasparenti
    sheet.kick(tl.duration() * 1000 + 300);
    if (narrow()) { rimisura(); const off = -(parseFloat(getComputedStyle(html).getPropertyValue('--header-h')) || 76) - 8; gsap.delayedCall(1.6, () => (FS.lenis ? FS.lenis.scrollTo(pad, { offset: off }) : scrollTo({ top: pad.getBoundingClientRect().top + scrollY + off, behavior: 'smooth' }))); } // area di disegno sotto l'header, il nome del vino subito sotto
  };

  const clear = () => {
    tl?.kill(); scene = null; Object.assign(st, ZERO);
    sec.classList.remove('is-res'); res.hidden = true; img.style.opacity = 0; ul.innerHTML = ''; pad.style.height = '';
  };
  const again = () => {
    if (!scene) return;
    tl?.kill();
    const via = () => { gsap.to(st, { fade: 0, duration: 0.35, onUpdate: paint, onComplete: () => { clear(); if (narrow()) rimisura(); gsap.delayedCall(0.4, ghostStart); } }); sheet.kick(500); };
    if (narrow() && FS.lenis) FS.lenis.scrollTo(cima(), { duration: 0.7, onComplete: via }); else via(); // telefono: prima in cima al foglio, così quando la sezione torna bassa non salta
  };

  /* ---- disegno col puntatore ---- */
  const pt = (e) => { const s = sec.getBoundingClientRect(); return [e.clientX - s.left, e.clientY - s.top]; };
  let drawing = false;
  pad.addEventListener('pointerdown', (e) => {
    if (e.button > 0) return;
    pad.setPointerCapture(e.pointerId);
    ghostStop(); clear(); hint.innerHTML = hintHTML;
    drawing = true; raw = [pt(e)];
    live = M.stroke(raw.concat([[raw[0][0] + 0.5, raw[0][1]]]), { w: 2, amp: 0.9, seed: 5 });
    sec.classList.add('is-drawing'); sheet.kick(300);
  });
  pad.addEventListener('pointermove', (e) => {
    if (!drawing) return;
    for (const ev of e.getCoalescedEvents?.() || [e]) { const p = pt(ev), q = raw[raw.length - 1]; if (Math.hypot(p[0] - q[0], p[1] - q[1]) > 2) raw.push(p); }
    live = M.stroke(raw, { w: 2, amp: 0.9, seed: 5 }); sheet.kick(200);
  });
  const end = () => {
    if (!drawing) return;
    drawing = false;
    const L = M.cumul(raw).at(-1);
    if (raw.length < 6 || L < 60) { // troppo corto per leggerci una forma
      live = null; sec.classList.remove('is-drawing'); sheet.kick(100);
      hint.textContent = 'Disegna una linea più lunga'; return;
    }
    play(raw.slice());
  };
  pad.addEventListener('pointerup', end);
  pad.addEventListener('pointercancel', end);

  // bottoni: la mano disegna la forma scelta, poi si legge come un disegno vero
  let presetTw = null;
  sec.querySelectorAll('[data-forma]').forEach((b) => b.addEventListener('click', () => {
    ghostStop(); clear(); presetTw?.kill();
    const p = preset(b.dataset.forma), t = M.stroke(p, { w: 2, amp: 0.9, seed: 5 });
    t.progress = 0; live = t;
    presetTw = gsap.to(t, { progress: 1, duration: 0.9, ease: 'power1.inOut', onComplete: () => play(p) });
    sheet.kick(1000);
  }));
  $('.dv-res__again').addEventListener('click', again);

  /* ---- ingresso del titolo, poi la dimostrazione ---- */
  FS.righe($('[data-righe]'));
  gsap.set(['.dv-lead', '.dv-scelte'].map((q) => $(q)), { y: 16, opacity: 0 });
  FS.dopoIngresso(() => ScrollTrigger.create({ trigger: sec, start: 'top bottom', end: 'top 55%', scrub: true, onUpdate: (s) => { filoP = s.progress; sheet.kick(150); } }));
  FS.dopoIngresso(() => ScrollTrigger.create({ trigger: sec, start: 'top 65%', once: true, onEnter: () => { // parte quando la sezione arriva in vista
    gsap.to(['.dv-lead', '.dv-scelte'].map((q) => $(q)), { y: 0, opacity: 1, duration: 0.8, delay: 0.35, stagger: 0.1, ease: 'power3.out' });
    gsap.delayedCall(1.1, ghostStart);
  } }));
})();
