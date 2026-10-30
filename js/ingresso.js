/* Ingresso dal portone, A MATITA (30 ott 2026; la versione three.js è in tools/ingresso-3d.backup.*): preloader della prima visita della
   sessione, automatico. Il marchio vero (corona e torre di assets/logo/feudi-marchio.svg) ridisegnato a mano con js/matita.js: è già
   completo da subito (non si costruisce), la matita trema appena. I battenti di legno si aprono su un corridoio con la luce in fondo e
   ci camminiamo dentro (prospettiva vera: la facciata ci passa accanto, il fondo si avvicina piano); in fondo c'è la pagina vera. Esc o Salta = si salta.
   Contratto: sessionStorage fs-ingresso=1, via la classe ingresso-attivo, evento fs:ingresso-fine. Dipende da matita.js, gsap, FS. */
(() => {
  const html = document.documentElement, el = document.querySelector('[data-ingresso]'), M = window.Matita;
  if (!el) return;
  if (!html.classList.contains('ingresso-attivo') || !M || !window.gsap) { el.remove(); html.classList.remove('ingresso-attivo'); return; }

  const behind = [...document.querySelectorAll('#main, .foot')], ui = el.querySelector('.ingresso-ui'), salta = el.querySelector('.ingresso-salta');
  let done = false, tl = null;
  const finish = (fast) => {
    if (done) return;
    done = true; tl?.kill();
    removeEventListener('keydown', onKey);
    try { sessionStorage.setItem('fs-ingresso', '1'); } catch (e) {}
    if (fast) { el.classList.add('ingresso--via'); setTimeout(() => el.remove(), 380); } else el.remove();
    behind.forEach((n) => (n.inert = false));
    html.classList.remove('ingresso-attivo');
    FS.lenis?.start();
    document.dispatchEvent(new Event('fs:ingresso-fine'));
  };
  const onKey = (e) => { if (e.key === 'Escape') finish(true); };
  addEventListener('keydown', onKey);
  salta.addEventListener('click', () => finish(true));
  el.style.animation = 'none';
  el.classList.add('is-disegno');
  behind.forEach((n) => (n.inert = true));
  FS.lenis?.stop();

  /* ---- il marchio a matita, in px dello schermo (unità del marchio: 60,05 × 89,35) ---- */
  const CREAM = getComputedStyle(html).getPropertyValue('--cream').trim() || '#f3efea', ORO = '#cdb780', LEGNO = '#7a4a2b';
  const DL = 23.78, DR = 36.27, DT = 56.31, TB = 89.35; // vano del portone
  const st = { show: 0, open: 0, dive: 0 };
  let G = null;
  const costruisci = (w, h) => {
    const H = Math.min(h * 0.44, (w * 0.62 * 89.35) / 60.05), S = H / 89.35, ox = w / 2 - 30.025 * S, oy = h * 0.62 - H;
    const P = (x, y) => [ox + x * S, oy + y * S], pts = (a) => a.map(([x, y]) => P(x, y));
    const corona = pts([[0, 0.53], [17.69, 13.2], [30.02, 0.34], [42.35, 13.2], [60.05, 0.53], [60.05, 23.31], [0, 23.31], [0, 0.53]]);
    const torre = pts([[0, 29.14], [60.05, 29.14], [60.05, 89.35], [DR, 89.35], [DR, DT], [DL, DT], [DL, 89.35], [0, 89.35], [0, 29.14]]);
    const R = M.rng(21), pietre = [], ombraP = pts([[42, 30], [60, 30], [60, 88.5], [42, 88.5]]);
    for (let y = 33, r = 0; y < 87; y += 5.6, r++) { // corsi di pietra: trattini sfalsati, mai sul vano
      for (let x = 2 + (r % 2) * 4 + R() * 2; x < 57; x += 8 + R() * 4) {
        const x2 = Math.min(58, x + 3.5 + R() * 3);
        if (y > DT - 2 && x2 > DL - 1 && x < DR + 1) continue;
        pietre.push(M.stroke(pts([[x, y], [x2, y + (R() - 0.5) * 0.6]]), { w: 1, amp: 0.6, sketch: false, alpha: 0.45 }));
      }
    }
    G = { S, P, door: { x0: P(DL, DT)[0], y0: P(DL, DT)[1], x1: P(DR, TB)[0], y1: P(DR, TB)[1] },
      segni: [M.stroke(corona, { w: 2.2, amp: 0.9 }), M.stroke(torre, { w: 2.2, amp: 0.9 }), ...pietre,
        M.stroke([P(-26, 89.6), P(86, 89.1)], { w: 1.6, amp: 1.1 })], // la terra sotto la torre
      acqua: [M.wash(corona, { color: ORO, alpha: 0.95, amp: 2.4, seed: 5 }), M.wash(torre, { color: ORO, alpha: 0.8, amp: 2.4, seed: 6 }),
        M.wash(pts([[DL, DT], [DR, DT], [DR, TB], [DL, TB]]), { color: '#f6d58f', alpha: 0.9, amp: 1.2, seed: 7 })], // la luce dentro
      ombra: M.hatch(ombraP, { angle: -0.95, gap: 6, w: 0.9, alpha: 0.32, seed: 8 }), ombraP: M.densify([...ombraP, ombraP[0]], 6) };
  };
  // un battente: gira sul cardine verso l'interno del vano, in prospettiva (il bordo libero va in profondità fino alla parete del corridoio)
  const BATT = 0.1; // quanto va in profondità il bordo libero, aperto (era 0.2: entrando i battenti coprivano mezzo schermo)
  const battente = (lato, a, pr) => {
    const { x0, y0, x1, y1 } = G.door, w = (x1 - x0) / 2, h = y1 - y0, hx = lato < 0 ? x0 : x1, ang = a * 1.45;
    const at = (t, y) => pr(hx - lato * w * t * Math.cos(ang), y, 1 + BATT * t * Math.sin(ang)); // punto del battente a t (0 cardine, 1 bordo libero)
    const q = [at(0, y0), at(1, y0), at(1, y1), at(0, y1), at(0, y0)];
    const assi = [0.33, 0.66].map((t) => { const p = at(t, y0 + 3), r = at(t, y1 - 3); return M.stroke([p, r], { w: 0.9, amp: 0.5, sketch: false, seed: 40 + t * 10 + lato, alpha: 0.6 }); });
    const [kx, ky] = at(0.82, y0 + h * 0.55);
    const pomo = M.stroke(M.ellipse(kx, ky, 1.8, 1.8, 0, 0, 1.05, 10), { w: 1.2, amp: 0.3, sketch: false, seed: 60 + lato });
    return { lati: M.stroke(q, { w: 1.8, amp: 0.7, seed: 30 + lato }), legno: M.wash(q, { color: LEGNO, alpha: 0.75, amp: 0.8, seed: 34 + lato }), assi, pomo,
      ombra: 0.35 * Math.sin(ang) }; // girando verso il buio si scurisce
  };

  const cv = el.querySelector('.ingresso-3d');
  /* la camminata: la facciata è a profondità 1, il fondo del corridoio a BACK. Un punto a profondità d sta sullo schermo a
     C + (P - C) / (d - z): avanzando (z cresce) la facciata ci passa accanto più in fretta del fondo, poi siamo nel vano e il fondo si apre */
  const BACK = 1.32, Z_FINE = 1.3; // corridoio corto (30 ott: "troppo lungo")
  const sheet = new M.Sheet(cv, (ctx, f) => {
    if (!G) return;
    const { door } = G, z = st.dive, k = st.show, dpr = sheet.dpr, W = sheet.w, H = sheet.h;
    const passo = Math.sin(z * 22) * 2.5 * Math.min(1, z * 4) * (1 - z / BACK); // un passo appena, che si spegne arrivando
    const C = [(door.x0 + door.x1) / 2, door.y0 + (door.y1 - door.y0) * 0.62 + passo]; // gli occhi all'altezza giusta nel vano
    const Rmax = 2 * Math.hypot(W, H), sc = (d) => 1 / Math.max(1e-3, d - z);
    // i punti troppo lontani si accorciano lungo il raggio dal punto di fuga: gli spigoli del corridoio restano dritti (tagliare x e y a parte li piegava)
    const pr = (x, y, d) => { const s = sc(d), dx = (x - C[0]) * s, dy = (y - C[1]) * s, m = Math.min(1, Rmax / (Math.hypot(dx, dy) || 1)); return [C[0] + dx * m, C[1] + dy * m]; };
    ctx.fillStyle = CREAM; ctx.fillRect(0, 0, W, H); // il foglio copre la pagina
    if (z < BACK - 0.07) { // il corridoio dietro il portone: pareti in prospettiva fino alla luce in fondo (negli ultimi passi non si disegna più)
      const R4 = [[door.x0, door.y0], [door.x1, door.y0], [door.x1, door.y1], [door.x0, door.y1]];
      const F = R4.map(([x, y]) => pr(x, y, 1)), Bk = R4.map(([x, y]) => pr(x, y, BACK));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      [[F[0], Bk[0], Bk[3], F[3], '#8a6a45', 0.55], [F[1], Bk[1], Bk[2], F[2], '#7a5c3b', 0.6], [F[0], F[1], Bk[1], Bk[0], '#6b4f33', 0.5], [F[3], F[2], Bk[2], Bk[3], '#a0825a', 0.45]]
        .forEach(([p, q, r, t, col, al], i) => M.drawWash(ctx, M.wash([p, q, r, t, p], { color: col, alpha: al * k, amp: 1.2, seed: 70 + i }), f));
      M.drawWash(ctx, M.wash([...Bk, Bk[0]], { color: '#f6d58f', alpha: 0.95 * k, amp: 1, seed: 80 }), f); // la luce in fondo
      [[F[0], Bk[0]], [F[1], Bk[1]], [F[2], Bk[2]], [F[3], Bk[3]], [...Bk, Bk[0]]].forEach((p, i) => { const t = M.stroke(p, { w: 1.4, amp: 0.6, seed: 90 + i }); t.alpha = k; M.draw(ctx, t, f); });
      const buco = M.clamp((z - 0.9) / 0.22); // in fondo si vede la pagina vera, appena passato il portone
      if (buco > 0) {
        ctx.globalCompositeOperation = 'destination-out'; ctx.globalAlpha = buco;
        ctx.beginPath(); ctx.moveTo(Bk[0][0], Bk[0][1]); Bk.slice(1).forEach(([x, y]) => ctx.lineTo(x, y)); ctx.closePath(); ctx.fill();
        ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
      }
      if (1 + BATT * Math.sin(st.open * 1.45) - z > 0.03) [-1, 1].forEach((lato) => { // i battenti, dentro il vano: restano finché non li abbiamo superati (prima sparivano di colpo con la facciata)
        const b = battente(lato, st.open, pr);
        b.legno.alpha = 0.75 * k; M.drawWash(ctx, b.legno, f);
        if (b.ombra > 0.01) { const o = M.wash(b.legno.p, { color: '#2b1d16', alpha: b.ombra * k, amp: 0.6, seed: 36 + lato }); M.drawWash(ctx, o, f); }
        [b.lati, b.pomo, ...b.assi].forEach((t) => { t.alpha *= k; M.draw(ctx, t, f); });
      });
    }
    const via = M.clamp((z - (BACK - 0.15)) / 0.08); // ultimi passi: il foglio sfuma e resta la pagina (tutto sfumato prima che il corridoio smetta di disegnarsi)
    if (via > 0) { ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.globalCompositeOperation = 'destination-out'; ctx.globalAlpha = via; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; }
    if (1 - z > 0.03) { // la facciata: torre, corona, terra (finché non ci è passata accanto)
      // punti proiettati uno a uno, non il canvas ingrandito: a 30x i tratti diventavano fasce e l'acqua tremava di decine di px
      const fa = ([x, y]) => pr(x, y, 1);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      [...G.segni, ...G.acqua.slice(0, 2), ...G.ombra.lines].forEach((t) => { t.p0 ??= t.p; t.p = t.p0.map(fa); t.f = null; });
      G.ombra.clip = new Path2D(); G.ombraP.map(fa).forEach(([x, y], i) => G.ombra.clip[i ? 'lineTo' : 'moveTo'](x, y));
      G.acqua.slice(0, 2).forEach((w, i) => { w.alpha = (i ? 0.8 : 0.95) * k; M.drawWash(ctx, w, f); });
      G.ombra.alpha = 0.32 * k; M.drawHatch(ctx, G.ombra, f);
      G.segni.forEach((t) => { t.alpha = (t.w < 1.2 ? 0.45 : 1) * k; M.draw(ctx, t, f); });
    }
  }, (w, h) => costruisci(w, h));

  const kick = () => sheet.kick(120);
  tl = gsap.timeline({ onUpdate: kick, onComplete: () => finish(false) })
    .to(st, { show: 1, duration: 0.7, ease: 'power1.out' }, 0.1)
    .to(ui, { opacity: 1, duration: 0.7, ease: 'power1.out' }, 0.35)
    .to(st, { open: 1, duration: 1.0, ease: 'power2.inOut' }, 1.1)
    .to([ui, salta], { opacity: 0, duration: 0.4 }, 1.7)
    .to(st, { dive: Z_FINE, duration: 1.6, ease: 'power1.inOut' }, 1.75); // camminiamo: si parte piano, si va, si rallenta entrando
})();
