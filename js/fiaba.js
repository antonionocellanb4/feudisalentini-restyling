/* PROVA B "La fiaba del feudo" (giro 3). Una giornata al feudo disegnata a matita e acquerello (js/matita.js), percorsa in orizzontale
   scorrendo (pin + scrub di ScrollTrigger). Mondo alto 900 unità, largo WW: k = altezza schermo / 900 (sul telefono più piccolo).
   Ogni elemento si disegna quando entra da destra (prima i tratti, poi l'acquerello) e resta disegnato; i piani lontani scorrono più piano
   (parallasse attorno al proprio centro); cielo e sole cambiano dall'alba al tramonto. Il cursore o il dito fa vento (taglio orizzontale
   sui disegni con sway), il portone della torre si apre al passaggio e porta alla Collezione 53. Testi e bottiglie vere sono HTML nella
   .fb-track, alle stesse coordinate. Dipende da: matita.js, gsap + ScrollTrigger, FS / FS_DATA. Piano: tools/PIANO-giro3.md
   LA DISCESA: finito il cammino la camera gira e scende sotto la tavola (ultimo tratto del pin): terra rossa, roccia calcarea e le
   radici della vite che crescono mentre si scorre. Scende sempre più veloce fino a pareggiare lo scroll, così quando il pin finisce la
   pagina continua senza scatti; la radice più lunga arriva in fondo sopra il foglio di "Disegna il tuo vino" (js/disegna.js la continua).
   (La prova in verticale a pannelli è stata scartata il 30 ott.) */
(() => {
  const sec = document.querySelector('.fb');
  if (!sec || !window.Matita) return;
  const M = Matita, html = document.documentElement;
  // informazioni delle tappe (30 ott): la c (biglietto di carta) è la scelta; ?info=0 = la versione di prima, a e b le altre prove
  const INFO = new URLSearchParams(location.search).get('info') ?? 'c';
  if (/^[abc]$/.test(INFO || '')) html.dataset.info = INFO;
  const pin = sec.querySelector('.fb-pin'), track = sec.querySelector('.fb-track'), nav = sec.querySelector('.fb-tappe');
  const WW = 10600, GROUND = 640;
  const TAPPE = [{ x: 0, col: 'luxury' }, { x: 2400, col: 'terra' }, { x: 4400, col: 'organic' }, { x: 6300, col: 'classica' }, { x: 8300, col: 'lounge' }];
  const narrow = () => innerWidth <= 860;
  const S = { intro: M.RM ? 1 : 0 };
  let k = 1, oy = 0, vw = innerWidth, vh = innerHeight, cam = 0, cs = 0, ce = 1, prog = 0, st = null; // cs, ce: dove parte e dove finisce la camera (telefono: dalla torre alla tavola)
  let camY = 0, YE = 1, DV = 2, hp = 1; // discesa: camY px già scesi, YE px in fondo, DV px di scroll che dura, hp px di scroll del cammino
  const R = M.rng(42), r = (a, b) => a + R() * (b - a);
  const gy = (x) => GROUND + 9 * Math.sin(x / 520) + 5 * Math.sin(x / 190 + 1); // linea del terreno

  /* ---- mattoncini del disegno ---- */
  const L = (pts, o = {}) => M.stroke(pts, { w: o.w ?? 1.8, amp: o.amp ?? 1.3, color: o.color, sketch: o.sketch ?? true });
  const l = (pts, w = 1.2) => M.stroke(pts, { w, amp: 1, sketch: false }); // dettagli: un passaggio solo
  const Wa = (pts, color, alpha = 0.5, amp = 4) => M.wash(pts, { color, alpha, amp });
  const blob = (cx, cy, rx, ry, j = 0.15, n = 10) => M.smooth(Array.from({ length: n }, (_, i) => { const a = (i / n) * M.TAU, q = 1 + (R() - 0.5) * 2 * j; return [cx + Math.cos(a) * rx * q, cy + Math.sin(a) * ry * q]; }), true, 6);
  const els = [], CARTA = getComputedStyle(html).getPropertyValue('--cream').trim() || '#f3efea';
  const add = (part, o = {}) => {
    const b = M.bbox([...(part.s || []).flatMap((t) => t.p), ...(part.w || []).flatMap((t) => t.p), ...(o.box || [])]);
    const e = { cielo: o.cielo, s: part.s || [], w: part.w || [], h: part.h || [], occ: (part.occ || []).map((q) => { const P = new Path2D(); q.forEach(([x, y], i) => P[i ? 'lineTo' : 'moveTo'](x, y)); P.closePath(); return P; }), f: o.f ?? 1, x0: b.x, x1: b.x + b.w, ax: b.x + b.w / 2, y0: b.y, rev: 0, bob: o.bob, dyn: o.dyn,
      sway: o.sway ? { bx: o.sway[0], by: o.sway[1], h: o.sway[2], cy: o.sway[1] - o.sway[2] / 2, x: 0, v: 0 } : null };
    els.push(e);
    return e;
  };

  /* ---- i disegni ---- */
  const torre = (cx, base, sc = 5.2) => { // la torre del logo (coordinate di assets/logo/feudi-marchio.svg)
    const P = (x, y) => [cx + (x - 30.025) * sc, base - (89.35 - y) * sc], pts = (a) => a.map(([x, y]) => P(x, y));
    const corpo = pts([[0, 29.14], [60.05, 29.14], [60.05, 89.35], [36.27, 89.35], [36.27, 56.31], [23.78, 56.31], [23.78, 89.35], [0, 89.35], [0, 29.8]]);
    const corona = pts([[0, 0.53], [17.69, 13.2], [30.02, 0.34], [42.35, 13.2], [60.05, 0.53], [60.05, 23.31], [0, 23.31], [0, 1.2]]);
    const s = [L(corpo, { w: 2.4 }), L(corona, { w: 2.4 })];
    for (let y = 33; y < 88; y += 5.4) for (let x = 2.5 + (Math.round(y / 5.4) % 2) * 4; x < 56; x += 7 + R() * 7) { // corsi di pietra
      if (x > 20 && x < 39 && y > 53) continue;
      s.push(l([P(x, y), P(Math.min(58, x + 2.5 + R() * 3.5), y + (R() - 0.5) * 0.5)], 1));
    }
    return { part: { s, occ: [corpo, corona], w: [Wa(corpo, '#dccbaa', 0.5), Wa(corona, '#cdb780', 0.8)], h: [M.hatch(pts([[42, 29.5], [60, 29.5], [60, 89], [42, 89]]), { angle: -1, gap: 7, alpha: 0.45 })] },
      door: { x0: P(23.78, 0)[0], x1: P(36.27, 0)[0], y0: P(0, 56.31)[1], y1: base } };
  };
  const fico = (cx, base) => { // fico d'india
    const s = [], w = [];
    const occ = [];
    [[0, -40, 25, 36, 0], [-36, -98, 22, 30, -0.45], [32, -104, 24, 32, 0.35], [-10, -156, 20, 27, 0.1], [50, -164, 18, 24, 0.55]].forEach(([dx, dy, rx, ry, rot], i) => {
      const e = M.ellipse(cx + dx, base + dy, rx, ry, rot, -1 + i, 1.06, 36);
      s.push(L(e, { w: 1.7 })); w.push(Wa(e, '#8ea35c', 0.5, 2.5)); occ.push(M.ellipse(cx + dx, base + dy, rx, ry, rot, 0, 1, 24));
      for (let j = 0; j < 5; j++) { const a = R() * M.TAU, q = R() * 0.7, x = cx + dx + Math.cos(a) * rx * q, y = base + dy + Math.sin(a) * ry * q; s.push(l([[x, y], [x + 2, y - 2]], 1)); }
    });
    [[-48, -126], [-30, -130], [22, -136], [40, -137], [56, -186]].forEach(([dx, dy]) => { const e = M.ellipse(cx + dx, base + dy, 6, 8, 0, 0, 1.05, 14); s.push(l(e, 1.3)); w.push(Wa(e, '#d9663a', 0.75, 1)); });
    return { s, w, occ };
  };
  const cipresso = (cx, base, h) => {
    const o = M.smooth([[cx - 3, base], [cx - 24, base - h * 0.28], [cx - 18, base - h * 0.68], [cx, base - h], [cx + 17, base - h * 0.66], [cx + 23, base - h * 0.27], [cx + 3, base]], false, 8);
    const s = [L(o)];
    for (let i = 0; i < 9; i++) { const t = 0.12 + i * 0.09, y = base - h * t, ww = 18 * Math.sin(Math.PI * (1 - t)); s.push(l(M.smooth([[cx - ww * 0.6, y + 6], [cx - ww * 0.1, y - 4], [cx + ww * 0.5, y + 4]]), 1)); }
    return { s, occ: [o], w: [Wa(o, '#4f6b3a', 0.45, 2.5)] };
  };
  const alberello = (cx, base, sc) => { // vite ad alberello
    const T = (dx, dy) => [cx + dx * sc, base + dy * sc];
    const s = [L(M.smooth([T(-5, 0), T(3, -24), T(-5, -48), T(1, -70)]), { w: 2.6 * sc }), L(M.smooth([T(4, 0), T(9, -26), T(2, -50), T(7, -70)]), { w: 2.2 * sc })], w = [];
    [[-58, -112], [-6, -134], [54, -114]].forEach(([tx, ty]) => {
      s.push(L(M.smooth([T(3, -68), T(tx * 0.45, ty * 0.75 + 8), T(tx, ty)]), { w: 1.8 * sc }));
      w.push(Wa(blob(cx + tx * sc, base + (ty - 6) * sc, 34 * sc, 24 * sc, 0.2), '#7f9a48', 0.45, 3));
      for (let j = 0; j < 6; j++) {
        const a = -Math.PI / 2 + (j - 2.5) * 0.55 + (R() - 0.5) * 0.3, x = cx + (tx + Math.cos(a) * 14) * sc, y = base + (ty + Math.sin(a) * 10) * sc;
        s.push(l(M.leaf(x, y, x + Math.cos(a) * 22 * sc, y + Math.sin(a) * 22 * sc, 7 * sc, 2 * sc), 1.2));
      }
    });
    [[-30, -84], [30, -82]].forEach(([gx, gyy]) => { // grappoli
      [[0, 0], [-6, 0], [6, 0], [-3, 9], [3, 9], [0, 18], [-9, -2]].forEach(([dx, dy]) => s.push(l(M.circle(cx + (gx + dx) * sc, base + (gyy + dy) * sc, 4.6 * sc, R() * 6, 1.05), 1)));
      w.push(Wa(blob(cx + gx * sc, base + (gyy + 8) * sc, 11 * sc, 15 * sc, 0.1, 8), '#4a1d3c', 0.6, 1.5));
    });
    return { s, w };
  };
  const muretto = (x0, x1, base, rows = 3) => { // muretto a secco
    const s = [], w = [];
    let y = base;
    for (let rr = 0; rr < rows; rr++) {
      const hh = 22 + R() * 6;
      for (let x = x0 + (rr % 2) * 18; x < x1 - 20;) {
        const ww = 38 + R() * 30, q = M.smooth([[x + 3, y - 2], [x + ww * 0.5, y - 1 + R() * 2], [x + ww - 3, y - 3], [x + ww - 1, y - hh * 0.6], [x + ww - 6, y - hh + 2], [x + ww * 0.45, y - hh - 1 + R() * 3], [x + 4, y - hh + 3], [x + 1, y - hh * 0.4]], true, 4);
        s.push(l(q, 1.3)); if (R() < 0.5) w.push(Wa(q, R() < 0.5 ? '#d8cbb2' : '#c9b99a', 0.55, 1.5));
        x += ww + 2;
      }
      y -= hh;
    }
    return { part: { s, w }, top: y };
  };
  const pajara = (cx, base) => { // la pajara, il trullo di pietra a gradoni
    const tiers = [[160, 46], [126, 40], [94, 34], [64, 28], [36, 22]], s = [], w = [], occ = [];
    let y = base;
    tiers.forEach(([ww, hh], i) => {
      const nw = tiers[i + 1]?.[0] ?? ww * 0.7, q = [[cx - ww / 2, y], [cx + ww / 2, y], [cx + nw / 2 + 4, y - hh], [cx - nw / 2 - 4, y - hh], [cx - ww / 2, y - 1]];
      s.push(L(q, { w: 1.6 })); w.push(Wa(q, '#dccfb4', 0.45, 2)); occ.push(q);
      for (let j = 0; j < 4; j++) { const x = cx - ww / 2 + 12 + R() * (ww - 30); s.push(l([[x, y - hh * 0.5], [x + 10, y - hh * 0.5 + 1]], 1)); }
      y -= hh;
    });
    const porta = M.smooth([[cx - 14, base], [cx - 14, base - 26], [cx, base - 38], [cx + 14, base - 26], [cx + 14, base]]);
    s.push(L(porta, { w: 1.5 })); w.push(Wa(porta, '#3b2e26', 0.6, 1));
    return { s, w, occ };
  };
  const ulivo = (cx, base) => { // ulivo secolare: tronco attorcigliato, chioma (quella col vento) a parte
    const sx = M.smooth([[cx - 46, base], [cx - 30, base - 60], [cx - 52, base - 120], [cx - 24, base - 180], [cx - 50, base - 230]]);
    const dx = M.smooth([[cx + 44, base], [cx + 26, base - 70], [cx + 50, base - 130], [cx + 18, base - 190], [cx + 40, base - 236]]);
    const tronco = { s: [L(sx, { w: 2.6 }), L(dx, { w: 2.6 }), L(M.ellipse(cx - 2, base - 100, 9, 22, 0.2, -1, 1.05, 24), { w: 1.6 }),
      ...[[-6, -60], [8, -150], [-14, -200], [12, -40]].map(([a, b]) => l(M.smooth([[cx + a - 10, base + b], [cx + a, base + b - 12], [cx + a + 6, base + b - 30]]), 1.2)),
      L(M.smooth([[cx - 40, base - 228], [cx - 110, base - 280], [cx - 170, base - 300]]), { w: 2 }), L(M.smooth([[cx + 34, base - 232], [cx + 100, base - 290], [cx + 160, base - 300]]), { w: 2 }),
      L(M.smooth([[cx - 6, base - 230], [cx, base - 300], [cx + 10, base - 350]]), { w: 2 })],
      w: [Wa([...sx, ...dx.slice().reverse()], '#8c7a63', 0.45, 2)], occ: [[...sx, ...dx.slice().reverse()]] };
    const s = [], w = [], occ = [];
    [[-120, -300, 120, 70], [60, -320, 140, 80], [-10, -380, 110, 60], [150, -270, 70, 46], [-190, -272, 70, 44]].forEach(([a, b, rx, ry]) => { const q = blob(cx + a, base + b, rx, ry, 0.22, 12); w.push(Wa(q, '#9aa577', 0.42, 5)); occ.push(q); });
    for (let i = 0; i < 150; i++) { const a = R() * M.TAU, q = Math.sqrt(R()), x = cx - 10 + Math.cos(a) * 230 * q, y = base - 315 + Math.sin(a) * 95 * q, t = (R() - 0.5) * 1.6; s.push(l([[x, y], [x + Math.cos(t) * 14, y + Math.sin(t) * 6]], 1.1)); }
    s.sort((a, b) => a.p[0][0] - b.p[0][0]);
    return { tronco, chioma: { s, w, occ } };
  };
  const papaveri = (cx, base) => {
    const s = [], w = [];
    for (let i = 0; i < 4; i++) {
      const x = cx + r(-40, 40), b = base + r(-6, 10), hh = r(60, 120), bend = r(-14, 14), top = [x + bend, b - hh];
      s.push(l(M.smooth([[x, b], [x + bend * 0.3, b - hh * 0.5], top]), 1.2));
      const head = blob(top[0], top[1] - 7, 13, 9, 0.25, 8);
      s.push(l(head, 1.3), l(M.circle(top[0], top[1] - 7, 2.5, 0, 1.1), 1.4)); w.push(Wa(head, '#d23b2a', 0.7, 2));
      if (R() < 0.6) s.push(l(M.leaf(x + bend * 0.2, b - hh * 0.3, x + bend * 0.2 + r(-20, 20), b - hh * 0.3 - 18, 4), 1));
    }
    for (let i = 0; i < 6; i++) { const x = cx + r(-60, 60); s.push(l([[x, base + 4], [x + r(-6, 6), base - r(12, 26)]], 1)); } // erba
    return { s, w };
  };
  const scogli = (cx, base) => {
    const s = [], w = [], h = [], tops = [], occ = [];
    [[-120, 0, 90, 46], [10, 10, 110, 58], [140, 4, 80, 40]].forEach(([dx, dy, rx, ry]) => {
      const b = M.smooth([[cx + dx - rx, base + dy], [cx + dx - rx * 0.7, base + dy - ry * 0.8], [cx + dx - rx * 0.1, base + dy - ry], [cx + dx + rx * 0.6, base + dy - ry * 0.7], [cx + dx + rx, base + dy]], false, 6);
      const poly = [...b, [cx + dx - rx, base + dy]];
      s.push(L(b, { w: 1.7 })); w.push(Wa(poly, '#bfae93', 0.5, 2)); occ.push(poly);
      h.push(M.hatch(poly, { angle: -0.7, gap: 7, alpha: 0.4, shade: { x: cx + dx - rx * 0.3, y: base + dy - ry, r: rx * 0.9 } }));
      tops.push([cx + dx - rx * 0.1, base + dy - ry + 5]);
    });
    return { part: { s, w, h, occ }, tops };
  };
  const barca = (cx, y) => {
    const hull = M.smooth([[cx - 62, y - 4], [cx - 50, y + 16], [cx + 40, y + 17], [cx + 66, y - 8]]), cab = [[cx - 18, y - 5], [cx - 18, y - 30], [cx + 14, y - 30], [cx + 14, y - 6]];
    return { s: [L(hull, { w: 1.8 }), L([[cx - 62, y - 4], [cx + 66, y - 8]], { w: 1.4 }), L(cab, { w: 1.4 }), L([[cx + 2, y - 30], [cx + 2, y - 86]], { w: 1.4 }),
      l([[cx + 2, y - 86], [cx + 22, y - 80], [cx + 2, y - 74]], 1.2), l(M.smooth([[cx - 54, y + 6], [cx, y + 8], [cx + 54, y + 2]]), 1)],
      w: [Wa([...hull, [cx - 62, y - 4]], '#3f6f8f', 0.5, 1.5), Wa(cab, '#efe6d6', 0.6, 1)], occ: [[...hull, [cx - 62, y - 4]], cab] };
  };
  const torreMare = (cx, base) => { // torre costiera di Saturo, su uno scoglio, in lontananza
    const rock = blob(cx, base + 6, 110, 26, 0.2, 10), t = [[cx - 44, base], [cx + 44, base], [cx + 34, base - 70], [cx + 34, base - 150], [cx - 34, base - 150], [cx - 34, base - 70], [cx - 44, base - 1]];
    const s = [L(t, { w: 1.6 }), l([[cx - 34, base - 70], [cx + 34, base - 70]], 1.2), L(rock.slice(0, Math.floor(rock.length * 0.55)), { w: 1.4 }), l([[cx - 4, base - 110], [cx - 4, base - 124], [cx + 4, base - 124], [cx + 4, base - 110]], 1.2)];
    for (let i = 0; i < 4; i++) s.push(l([[cx - 34 + i * 20, base - 150], [cx - 34 + i * 20, base - 162], [cx - 24 + i * 20, base - 162], [cx - 24 + i * 20, base - 150]], 1.2)); // merli
    return { s, occ: [t, rock], w: [Wa(t, '#d8c6a3', 0.5, 2), Wa(rock, '#b7a58a', 0.4, 3)] };
  };
  const agave = (cx, base) => {
    const s = [], w = [];
    for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i - 4) * 0.32, len = 90 - Math.abs(i - 4) * 9, f = M.leaf(cx, base, cx + Math.cos(a) * len, base + Math.sin(a) * len, 9, (i - 4) * 1.5); s.push(l(f, 1.4)); w.push(Wa(f, '#7f9b86', 0.45, 1.5)); }
    return { s, w };
  };
  const pergola = (x0, x1, top, base) => {
    const s = [], w = [];
    [x0, (x0 + x1) / 2, x1].forEach((x) => s.push(L([[x, base], [x + r(-3, 3), top]], { w: 2.2 }), l([[x + 8, base], [x + 8 + r(-2, 2), top + 6]], 1),
      L(M.smooth([[x - 14, base], [x + 9, base - 110], [x - 9, base - 220], [x + 9, base - 330], [x + 2, top + 10]]), { w: 2.4 }))); // la vite sale attorno al palo (sotto terra ha le radici)
    s.push(L([[x0 - 40, top], [x1 + 40, top + 4]], { w: 2.2 }), l([[x0 - 40, top + 9], [x1 + 40, top + 13]], 1.2));
    for (let x = x0 - 20; x < x1 + 30; x += 70) s.push(l([[x, top - 10], [x + 26, top + 20]], 1.3)); // travetti
    for (let x = x0; x < x1; x += 34 + R() * 20) { const y = top + r(-12, 10), a = r(0.4, 2.6), f = M.leaf(x, y, x + Math.cos(a) * 24, y + Math.sin(a) * 24, 8); s.push(l(f, 1.1)); w.push(Wa(f, '#88a04f', 0.45, 1.5)); }
    [[x0, (x0 + x1) / 2], [(x0 + x1) / 2, x1]].forEach(([a, b]) => { // lucine
      const c = Array.from({ length: 17 }, (_, i) => { const t = i / 16; return [a + (b - a) * t, top + 24 + 184 * t * (1 - t)]; });
      s.push(l(M.smooth(c), 1));
      for (let i = 1; i < 16; i += 2) { const e = M.circle(c[i][0], c[i][1] + 7, 5, R() * 6, 1.05); s.push(l(e, 1.1)); w.push(Wa(e, '#f2c46b', 0.85, 0.8)); }
    });
    return { s, w };
  };
  const tavola = (x0, x1, top, calici) => {
    const drape = []; for (let x = x0; x <= x1; x += 40) drape.push([x + 20, top + 70 + (Math.round(x / 40) % 2 ? 8 : -2)]);
    const orlo = M.smooth(drape);
    const s = [L([[x0 + 20, top], [x1 - 20, top]], { w: 1.8 }), L([[x0, top + 16], [x1, top + 16]], { w: 1.8 }), l([[x0 + 20, top], [x0, top + 16]], 1.6), l([[x1 - 20, top], [x1, top + 16]], 1.6),
      L(orlo, { w: 1.4 }), l([[x0, top + 16], [x0 + 6, top + 72]], 1.3), l([[x1, top + 16], [x1 - 6, top + 72]], 1.3), ...[x0 + 30, x1 - 30].map((x) => l([[x, top + 72], [x + 2, top + 160]], 2))];
    for (let x = x0 + 60; x < x1 - 40; x += 80) s.push(l([[x, top + 20], [x + 4, top + 66]], 0.9)); // pieghe
    const telo = [[x0 + 20, top], [x1 - 20, top], [x1, top + 16], ...orlo.slice().reverse(), [x0, top + 16]], w = [Wa(telo, '#e6e0d4', 0.7, 2)];
    calici.forEach(([gx, col]) => {
      const b = top - 2, coppa = M.smooth([[gx + 14, b - 34], [gx + 7, b - 22], [gx, b - 20], [gx - 7, b - 22], [gx - 14, b - 34]]);
      s.push(l(M.smooth([[gx - 12, b - 52], [gx - 14, b - 34], [gx - 7, b - 22], [gx, b - 20], [gx + 7, b - 22], [gx + 14, b - 34], [gx + 12, b - 52]]), 1.3),
        l(M.ellipse(gx, b - 52, 12, 2.5, 0, 0, 1.05, 16), 1), l([[gx, b - 20], [gx, b - 3]], 1.2), l(M.ellipse(gx, b - 2, 9, 2, 0, 0, 1.05, 14), 1.1));
      w.push(Wa([[gx - 13.5, b - 38], [gx + 13.5, b - 38], ...coppa], col, 0.85, 1));
    });
    return { s, w, occ: [telo] };
  };
  const lastra = (x0, x1, top, hh = 16, terra = null) => { // lastra di pietra su cui poggiano le bottiglie: piano dritto, fronte tratteggiato
    // con terra (la linea del terreno): è un blocco che poggia a terra, il fondo segue il terreno (30 ott: sospesa a sinistra, affondata a destra)
    const fondo = terra ? Array.from({ length: Math.ceil((x1 - x0) / 40) + 1 }, (_, i) => { const x = Math.max(x0, x1 - i * 40); return [x, terra(x) + 1]; }) : null;
    const q = terra ? [[x0 + 8, top], [x1 - 6, top + 1], [x1, top + 6], ...fondo, [x0, top + 6], [x0 + 8, top + 0.5]]
      : [[x0 + 8, top], [x1 - 6, top + 1], [x1, top + hh * 0.5], [x1 - 4, top + hh], [x0 + 4, top + hh + 1], [x0, top + hh * 0.45], [x0 + 8, top + 0.5]];
    const fronte = terra ? [[x0, top + 4], [x1, top + 4], ...fondo] : [[x0, top + 4], [x1, top + 4], [x1, top + hh], [x0, top + hh]];
    return { s: [L(q, { w: 1.8 }), l([[x0 + 10, top + 4], [x1 - 8, top + 5]], 1)], w: [Wa(q, '#d4c6a8', 0.6, 1.5)], h: [M.hatch(fronte, { angle: -1.1, gap: 6, alpha: 0.45 })], occ: [q] };
  };
  const cassetta = (x0, x1, top, hh = 54) => { // cassetta della vendemmia in legno
    const s = [L([[x0, top], [x1, top], [x1, top + hh], [x0, top + hh], [x0, top + 0.5]], { w: 1.8 })], fondo = [[x0, top], [x1, top], [x1, top + hh], [x0, top + hh]];
    for (const y of [top + hh * 0.36, top + hh * 0.68]) s.push(l([[x0 + 2, y], [x1 - 2, y + 1]], 1.2)); // assi
    for (const x of [x0 + 10, x1 - 10]) s.push(l([[x, top + 3], [x, top + hh - 3]], 1.1));
    s.push(l(M.ellipse((x0 + x1) / 2, top + hh * 0.18, 18, 4, 0, 0, 1.05, 16), 1)); // la presa
    return { s, w: [Wa(fondo, '#b98a5a', 0.55, 1.5)], occ: [fondo] };
  };
  const ombra = (x, y, h) => { // ombra di contatto sotto una bottiglia alta h
    const rx = h * 0.15, e = M.ellipse(x + rx * 0.12, y + 1, rx, h * 0.022, 0, 0, 1, 20);
    return { w: [Wa(e, '#3a2e26', 0.4, 0.6)], s: [l([[x - rx * 0.5, y + 2], [x + rx * 0.9, y + 3]], 1)] };
  };
  const colline = (x0, x1, y) => {
    const p = []; for (let x = x0; x <= x1; x += 40) p.push([x, y - 44 * Math.max(0, Math.sin(x / 420)) - 16 * Math.sin(x / 170 + 2)]);
    const linea = l(p, 1.2); linea.alpha = 0.6;
    return { s: [linea], w: [Wa([[x0 - 120, GROUND + 10], ...p, [x1 + 120, GROUND + 10]], '#cfc7a3', 0.22, 6)] }; // ai capi la collina scende sul terreno
  };
  const nuvola = (cx, cy, sc) => {
    const top = Array.from({ length: 8 }, (_, i) => { const t = i / 7; return [cx - 90 * sc + t * 180 * sc, cy - Math.sin(Math.PI * t) * 30 * sc - (i % 2 ? 12 : 0) * sc]; });
    return { s: [l(M.smooth([...top, [cx + 95 * sc, cy + 4], [cx - 95 * sc, cy + 4]], true, 6), 1.1)] };
  };

  /* ---- il mondo, dal più lontano al più vicino ---- */
  [[600, 112, 0.8], [2100, 124, 0.7], [3300, 104, 0.85], [4700, 120, 0.7], [6000, 106, 0.8], [7600, 122, 0.7], [9000, 110, 0.8]].forEach(([x, y, s]) => add(nuvola(x, y, s), { f: 0.3, cielo: true }));
  add(colline(0, 6200, 560), { f: 0.5 }); add(colline(8300, WW, 560), { f: 0.5 }); // una campitura per tratto: niente giunte
  add(torreMare(7900, 505), { f: 0.8 });

  const terreno = (x0, x1) => { const p = []; for (let x = x0; x <= x1; x += 20) p.push([x, gy(x)]); return p; };
  const riva = (x) => 652 + 14 * Math.sin(x / 260) + 8 * Math.sin(x / 90);
  const zona = (x0, x1, c, al, top) => {
    const t = []; for (let x = x0; x <= x1; x += 40) t.push([x, top(x)]);
    add({ w: [M.wash([...t, [x1 + 170, 760], [x1 + 70, 905], [x0 - 90, 905], [x0 + 130, 770]], { color: c, alpha: al, amp: 9, origin: [x0, top(x0)] })] }); // bordi in diagonale: le zone si fondono
  };
  zona(-40, 2440, '#d9cfb5', 0.3, gy); zona(2380, 4440, '#b5523a', 0.3, gy); zona(4380, 6300, '#a3b06c', 0.3, gy);
  zona(6250, 8320, '#e3cf9f', 0.42, riva); zona(8280, WW + 40, '#d4c3a3', 0.3, gy);
  // il mare: orizzonte, due promontori ai lati, onde; la riva fa da terreno
  {
    const x0 = 6250, x1 = 8300, hor = 505, top = [], sh = [];
    const capoS = M.smooth([[x0, riva(x0)], [x0 + 90, 600], [x0 + 200, 530], [x0 + 300, hor]], false, 8), capoD = M.smooth([[x1 - 300, hor], [x1 - 190, 528], [x1 - 80, 596], [x1, riva(x1)]], false, 8);
    for (let x = x0 + 300; x <= x1 - 300; x += 50) top.push([x, hor + Math.sin(x / 300) * 2]);
    for (let x = x1; x >= x0; x -= 50) sh.push([x, riva(x)]);
    add({ w: [Wa([...capoS, ...top, ...capoD, ...sh], '#78b7b5', 0.45, 5)] });
    const onde = [];
    for (let i = 0; i < 46; i++) { const x = r(x0 + 320, x1 - 340), y = r(hor + 14, 630), ww = r(14, 30); onde.push(l(M.smooth([[x, y], [x + ww * 0.5, y - 3], [x + ww, y]]), 1)); }
    onde.sort((a, b) => a.p[0][0] - b.p[0][0]);
    const tratto = (a, b) => ({ s: [l(top.filter(([x]) => x >= a && x <= b + 50), 1.5), L(sh.filter(([x]) => x >= a && x <= b + 50).reverse(), { w: 1.6 }), ...onde.filter((o) => o.p[0][0] >= a && o.p[0][0] < b)] });
    const pz = tratto(x0, x0 + 512); pz.s.push(L(capoS, { w: 1.6 })); add(pz);
    for (let i = 1; i < 3; i++) add(tratto(x0 + i * 512, x0 + (i + 1) * 512));
    const ul = tratto(x0 + 1536, x1); ul.s.push(L(capoD, { w: 1.6 })); add(ul);
  }
  for (const [a, b] of [[0, 6260], [8290, WW]]) for (let x = a; x < b; x += 600) add({ s: [L(terreno(x, Math.min(b, x + 610)), { w: 1.6 })] });

  // tappa 1: la torre
  add(fico(700, gy(700) + 4));
  const T = torre(1050, gy(1050) + 2, narrow() ? 4.4 : 5.2); // sul telefono più bassa, sotto la fascia dei testi
  const door = { ...T.door, open: 0, target: 0 };
  add(T.part, { dyn: (ctx, f) => drawDoor(ctx, f) });
  const L1 = 626; add(lastra(1215, 1710, L1, 16, gy)); // poggia sul terreno
  add(cipresso(2150, gy(2150), 230), { sway: [2150, gy(2150), 230] });
  add(cipresso(2245, gy(2245), 180), { sway: [2245, gy(2245), 180] });
  // tappa 2: la terra rossa
  for (let x = 2620; x < 3560; x += 180) add(alberello(x + r(-20, 20), 612 + r(-6, 6), 0.7), { sway: [x, 612, 95] });
  for (let x = 2720; x < 3660; x += 225) add(alberello(x + r(-20, 20), 770 + r(-8, 8), 1.05), { sway: [x, 770, 140] });
  add(pajara(4440, gy(4440)));
  const mur = muretto(3700, 4300, 700, 3);
  add(mur.part);
  const L2 = mur.top - 10; add(lastra(3690, 4310, L2, 13)); // copertina del muretto
  // tappa 3: il campo
  const U = ulivo(4820, gy(4820) + 6);
  add(U.tronco); add(U.chioma, { sway: [4820, gy(4820) - 230, 160] });
  for (let x = 5120; x < 6100; x += 120) add(papaveri(x, 700 + r(-14, 14)), { sway: [x, 700, 110] });
  const L3 = 690; add(cassetta(5380, 5730, L3));
  const api = [0, 1, 2].map(() => ({ s: [l(M.ellipse(0, 0, 7, 4.6, 0, 0, 1.06, 16), 1.2), l([[-2, -4], [-2, 4]], 1.1), l([[2.5, -4], [2.5, 4]], 1.1), l(M.ellipse(-2, -8, 4, 6, -0.5, 0, 1.05, 12), 0.9), l(M.ellipse(3, -8, 4, 6, 0.5, 0, 1.05, 12), 0.9)], w: [Wa(M.ellipse(0, 0, 7, 4.6, 0, 0, 1, 14), '#e8b830', 0.8, 0.6)] }));
  add({ s: [] }, { box: [[5250, 520], [6000, 640]], dyn: (ctx, f, t) => api.forEach((a, i) => {
    ctx.save(); ctx.translate(5380 + i * 230 + Math.cos(t * 1.1 + i * 2) * 70, 560 + Math.sin(t * 1.9 + i) * 28);
    a.w.forEach((x) => M.drawWash(ctx, x, f)); a.s.forEach((x) => M.draw(ctx, x, f)); ctx.restore();
  }) });
  // tappa 4: il mare
  add(barca(7350, 580), { bob: true });
  const SC = scogli(7190, 752); // scogli tondi di contorno, a destra
  add(SC.part);
  const L4 = 690; add(lastra(6650, 7020, L4, 22)); // scoglio piatto sulla riva
  add(agave(7760, 712), { sway: [7760, 712, 90] });
  // tappa 5: il tramonto
  add(pergola(8800, 9700, 330, 760));
  add(tavola(8850, 9650, 600, [[8930, '#eba9a1'], [9500, '#721024'], [9575, '#741426']]));

  /* ---- il portone della torre: si apre al passaggio del cursore (o al tocco), dentro c'è la luce d'oro ---- */
  const dentro = Wa([[0, 0], [1, 0], [1, 1], [0, 1]].map(([u, v]) => [door.x0 + u * (door.x1 - door.x0), door.y0 + v * (door.y1 - door.y0)]), '#e0bd6a', 0.9, 1);
  let doorKey = -1, leaves = [];
  const drawDoor = (ctx, f) => {
    const o = Math.round(door.open * 50) / 50;
    if (o !== doorKey) { // battenti come trapezi: in prospettiva si stringono e il bordo libero si allunga un po'
      doorKey = o;
      const hw = (door.x1 - door.x0) / 2, a = o * 1.25, fx = Math.cos(a) * hw, d = Math.sin(a) * 9;
      leaves = [[door.x0, 1], [door.x1, -1]].map(([hx, s]) => M.stroke([[hx, door.y0], [hx + s * fx, door.y0 - d], [hx + s * fx, door.y1 + d * 0.4], [hx, door.y1]], { w: 1.8, amp: 1, sketch: false, seed: 900 + s }));
    }
    dentro.alpha = 0.15 + 0.75 * door.open; M.drawWash(ctx, dentro, f);
    leaves.forEach((t) => M.draw(ctx, t, f));
  };

  /* ---- cielo, sole e uccelli: nello spazio dello schermo ---- */
  const SKY = ['#cfdedd', '#dfe5d3', '#ebe2c4', '#f0d5b0', '#efb48e'];
  const lerpC = (cs, p) => { const x = M.clamp(p) * (cs.length - 1), i = Math.min(cs.length - 2, Math.floor(x)), t = x - i, a = M.rgb(cs[i]), b = M.rgb(cs[i + 1]); return '#' + a.map((v, j) => Math.round(v + (b[j] - v) * t).toString(16).padStart(2, '0')).join(''); };
  let sky = null;
  const makeSky = () => { const y = oy + k * 470, p = [[-30, -30], [vw + 30, -30]]; for (let x = vw + 30; x >= -30; x -= 60) p.push([x, y + 18 * Math.sin(x / 170) + 10 * Math.sin(x / 61)]); sky = Wa(p, SKY[0], 0.4, 6); };
  const sole = { s: L(M.circle(0, 0, 44, -2), { w: 1.8 }), w: Wa(M.circle(0, 0, 44, 0, 1), '#f2c94c', 0.75, 2), raggi: Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * M.TAU; return l([[Math.cos(a) * 58, Math.sin(a) * 58], [Math.cos(a) * 76, Math.sin(a) * 76]], 1.3); }) };
  const ali = [[[-11, -3], [-5, 2], [0, 0], [5, 2], [11, -3]], [[-11, 4], [-5, -1], [0, 0], [5, -1], [11, 4]]].map((p) => l(M.smooth(p), 1.3));
  const uccelli = Array.from({ length: 5 }, (_, i) => ({ x: 0.2 + i * 0.13 + R() * 0.05, y: 0.12 + R() * 0.12, ph: R() * 10 }));
  let mx = -999, my = -999, mvx = 0;

  /* ---- un elemento del paesaggio (la trasformazione del suo pannello o della camera è già impostata); true = si sta ancora muovendo ---- */
  const drawEl = (ctx, e, f, t, rev) => {
    let moving = false;
    if (e.bob) ctx.translate(0, Math.sin(t * 1.4) * 3);
    if (e.sway) { // molla: il vento la piega, torna dritta da sola
      const s = e.sway;
      s.v = s.v * 0.86 - s.x * 0.08; s.x += s.v;
      moving = Math.abs(s.x) > 0.05 || Math.abs(s.v) > 0.05;
      ctx.translate(s.bx, s.by); ctx.transform(1, 0, -s.x / s.h, 1, 0, 0); ctx.translate(-s.bx, -s.by);
    }
    const pw = M.clamp((rev - 0.5) / 0.5), n = e.s.length;
    if (e.occ.length) { ctx.fillStyle = CARTA; ctx.globalAlpha = M.clamp(rev * 3); e.occ.forEach((P) => ctx.fill(P)); ctx.globalAlpha = 1; }
    e.w.forEach((wa) => { wa.progress = pw; M.drawWash(ctx, wa, f); });
    e.h.forEach((h) => { h.progress = pw; M.drawHatch(ctx, h, f); });
    e.s.forEach((q, i) => { q.progress = M.clamp((rev - (0.45 * i) / n) / 0.55); M.draw(ctx, q, f); });
    e.dyn?.(ctx, f, t);
    return moving;
  };
  const uccelliDraw = (ctx, f, t, dpr, dy) => { // uccelli: volano piano (30 ott: non scappano più dal cursore, a 10 fotogrammi al secondo saltavano a scatti)
    uccelli.forEach((u, i) => {
      const bx = ((u.x - t * 0.012 + 2) % 1.2 - 0.1) * vw, by = (u.y + dy) * vh + Math.sin(t * 0.7 + u.ph) * 8;
      ctx.setTransform(dpr * k, 0, 0, dpr * k, dpr * bx, dpr * by);
      const a = ali[(f + i) % 2]; a.progress = M.clamp(S.intro * 2 - 0.6); M.draw(ctx, a, f);
    });
    return false;
  };

  /* ---- disegno di un fotogramma ---- */
  const render = (ctx, f, now) => {
    const t = now / 1000, dpr = sheet.dpr, camW = cam / k;
    let moving = false;
    const mob = narrow(), cy = camY; // nella discesa sale tutto insieme (un cielo più lento coprirebbe la terra: gli acquerelli non si coprono)
    ctx.setTransform(dpr, 0, 0, dpr, 0, -dpr * cy);
    if (sky) { sky.color = lerpC(SKY, prog); sky.progress = M.clamp(S.intro * 2); M.drawWash(ctx, sky, f); }
    // il sole attraversa il cielo: in alto a destra al mattino, basso sull'orizzonte al tramonto
    const sx = vw * (0.88 - 0.06 * prog), sy = (narrow() ? oy + k * (290 + 210 * prog ** 1.5) : oy + k * (110 + 380 * prog ** 1.5)) - cy;
    ctx.setTransform(dpr * k, 0, 0, dpr * k, dpr * sx, dpr * sy);
    sole.w.color = lerpC(['#f2c94c', '#f0b23e', '#e8743a'], prog); sole.w.progress = M.clamp(S.intro * 2 - 0.4); M.drawWash(ctx, sole.w, f);
    sole.s.progress = M.clamp(S.intro * 2 - 0.2); M.draw(ctx, sole.s, f);
    sole.raggi.forEach((q) => { q.alpha = M.clamp(1 - prog * 2.2); q.progress = sole.s.progress; M.draw(ctx, q, f); });
    if (uccelliDraw(ctx, f, t, dpr, (mob ? 0.3 : 0) - cy / vh)) moving = true;
    // il paesaggio
    const front = M.RM ? 1e9 : S.intro * 1.05 * vw; // oltre questa x dello schermo non è ancora disegnato
    for (const e of els) {
      const dx = e.f === 1 ? 0 : (1 - e.f) * (vw / 2 - k * (e.ax - camW)); // parallasse attorno al centro dell'elemento
      const sx0 = k * e.x0 - cam + dx, sx1 = k * e.x1 - cam + dx;
      const rv = M.clamp((front - sx0) / (0.45 * vw));
      if (rv > e.rev) e.rev = rv;
      if (sx1 < -80 || sx0 > vw + 80 || e.rev <= 0) continue;
      ctx.setTransform(dpr * k, 0, 0, dpr * k, dpr * (dx - cam), dpr * (oy - camY));
      if (e.cielo && mob) ctx.translate(0, 190); // telefono: nuvole sotto la fascia dei testi
      if (drawEl(ctx, e, f, t, e.rev)) moving = true;
    }
    if (camY > 0) { // sotto terra: ogni segno si disegna mentre il fronte (poco sopra il fondo dello schermo) passa da y=a a y=b
      const fr = (vh + camY - oy) / k - (1 - camY / YE) * 0.15 * vh / k;
      ctx.setTransform(dpr * k, 0, 0, dpr * k, -dpr * cam, dpr * (oy - camY));
      for (const q of sotto) {
        const p = M.clamp((fr - q.a) / (q.b - q.a));
        if (p <= 0) continue;
        if (q.w) { q.w.alpha = q.al * p; M.drawWash(ctx, q.w, f); } // l'acquerello arriva piano
        if (q.h) { q.h.progress = p; M.drawHatch(ctx, q.h, f); }
        if (q.s) { q.s.progress = p; M.draw(ctx, q.s, f); }
      }
    }
    const pv = M.clamp(1 - camY / (0.12 * vh)); // la pillola delle tappe se ne va appena si scende
    if (pv !== nav.o) { nav.o = pv; nav.style.opacity = pv; nav.style.visibility = pv > 0 ? '' : 'hidden'; }
    if (Math.abs(door.target - door.open) > 0.005) { door.open += (door.target - door.open) * 0.14; moving = true; }
    if (moving) sheet.kick(120);
    // testi e bottiglie seguono il mondo
    track.style.transform = `translate3d(${-cam}px,${-camY}px,0)`;
    const testo = !mob ? -1 : prog > 0.97 ? testi.length - 1 : testi.reduce((c, h, i) => (k * h.x - cam < vw * 0.55 ? i : c), 0); // in fondo: il saluto con le CTA
    for (const h of htmlEls) {
      if (mob && h.testo) { // telefono: i testi non scorrono, stanno fermi in alto e si danno il cambio
        const o = testi[testo] === h ? M.clamp(S.intro * 2) : 0, left = `${cam + 16}px`;
        if (o !== h.o || h.el.style.left !== left) { h.o = o; h.el.style.left = left; h.el.style.opacity = o; h.el.style.translate = ''; h.el.style.visibility = o > 0 ? '' : 'hidden'; }
        continue;
      }
      if (!mob && h.el.style.left) h.el.style.left = '';
      const sxh = k * h.x - cam, rv = M.clamp((front - sxh) / (0.45 * vw)); if (rv > h.rev) h.rev = rv;
      const o = M.clamp(h.rev * 1.6 - 0.25);
      if (o !== h.o) { h.o = o; h.el.style.opacity = o; h.el.style.translate = `0 ${(1 - o) * 14}px`; h.el.style.visibility = o > 0 ? '' : 'hidden'; }
    }
    // tappa corrente nella pillola
    const cur = TAPPE.reduce((c, tp, i) => (k * tp.x <= cam + vw * 0.5 ? i : c), 0);
    if (INFO === 'a' && fisso) { // il titolo fisso compare quando la didascalia della tappa entrerebbe nello schermo, sparisce sul saluto finale
      const i = mob || camY > 0 || k * 9850 - cam < vw * 0.7 ? -1 : caps.reduce((c, el, j) => (k * parseFloat(el.style.getPropertyValue('--x')) - cam < vw * 0.82 ? j : c), -1);
      if (i !== fi) fissoAggiorna(i);
    }
    if (cur !== curTappa) { curTappa = cur; segna(cur); }
  };

  /* ---- sotto terra (la discesa finale): si costruisce a ogni misura, perché il fondo e il punto d'arrivo dipendono dallo schermo ---- */
  const cvEl = sec.querySelector('.fb-canvas');
  let sotto = [];
  const sottoterra = () => {
    const Rs = M.rng(7), rs = (a, b) => a + Rs() * (b - a), y0 = 900, yE = (vh + YE - oy) / k, D = yE - y0;
    const xa = ce / k - 160, xb = (ce + vw) / k + 160, it = [];
    const pad = document.querySelector('.dv-pad')?.getBoundingClientRect(), xp = (ce + (pad?.width ? pad.left + pad.width / 2 : vw / 2)) / k; // sopra il centro del foglio da disegno
    const metti = (o, a, b) => { if (o.w) o.al = o.w.alpha; it.push({ ...o, a, b: Math.max(a + 1, b) }); };
    const linea = (fn) => { const p = []; for (let x = xa; x <= xb; x += 30) p.push([x, fn(x)]); return p; };
    const T = linea((x) => y0 - 8 + 5 * Math.sin(x / 130) + 3 * Math.sin(x / 41)); // il taglio sotto il prato
    const S1 = linea((x) => y0 + D * 0.32 + 14 * Math.sin(x / 160 + 2) + 6 * Math.sin(x / 53)); // fine della terra rossa
    const S2 = linea((x) => y0 + D * 0.58 + 20 * Math.sin(x / 190 + 4) + 8 * Math.sin(x / 61)); // fine della roccia
    metti({ w: Wa([...T, ...S1.slice().reverse()], '#b5523a', 0.3, 5) }, y0, y0 + D * 0.3);
    metti({ w: Wa([...S1, ...S2.slice().reverse()], '#d9cfb5', 0.5, 6) }, y0 + D * 0.3, y0 + D * 0.52);
    metti({ s: L(T, { w: 1.6 }) }, y0 - 40, y0 + 60);
    metti({ s: l(S1, 1.1) }, y0 + D * 0.28, y0 + D * 0.38);
    for (let i = 0; i < 26; i++) { // sassi nella terra rossa
      const x = rs(xa, xb), y = rs(y0 + 28, y0 + D * 0.28), e = M.ellipse(x, y, rs(6, 15), rs(4, 9), rs(-0.4, 0.4), rs(0, 6), 1.06, 18);
      metti({ w: Wa(e, '#8c7f72', 0.35, 0.8), s: l(e, 1.1) }, y - 20, y + 30);
    }
    for (let x = xa + rs(0, 90); x < xb; x += rs(170, 250)) { // blocchi di roccia calcarea, a spigoli, tratteggiati
      const y = rs(y0 + D * 0.38, y0 + D * 0.5), rx = rs(46, 90), ry = rs(18, 34);
      const q = Array.from({ length: 7 }, (_, i) => { const a = (i / 7) * M.TAU + rs(-0.2, 0.2), m = rs(0.8, 1.1); return [x + Math.cos(a) * rx * m, y + Math.sin(a) * ry * m]; });
      metti({ s: l([...q, q[0]], 1.3), h: M.hatch(q, { angle: -1, gap: 7, alpha: 0.4 }) }, y - ry, y + ry + 30);
    }
    // radici: crescono verso il basso, i rami laterali piegano giù
    const radice = (x, y, ang, len, w, liv) => {
      const p = [[x, y]], n = Math.max(3, Math.round(len / 30));
      let a = ang;
      for (let i = 0; i < n; i++) { a = (a + rs(-0.35, 0.35)) * 0.84; x += (Math.sin(a) * len) / n; y += (Math.cos(a) * len) / n; p.push([x, y]); }
      metti({ s: M.stroke(M.smooth(p), { w, amp: 0.8, sketch: liv === 0 }) }, p[0][1], y);
      if (liv < 2) for (let j = 1; j < p.length - 1; j++) if (Rs() < (liv ? 0.3 : 0.5)) radice(p[j][0], p[j][1], (Rs() < 0.5 ? -1 : 1) * rs(0.7, 1.2), len * rs(0.25, 0.45), w * 0.6, liv + 1);
    };
    const pali = [8800, 9250, 9700], x0 = pali.reduce((c, x) => (Math.abs(x - xp) < Math.abs(c - xp) ? x : c));
    pali.forEach((x) => { if (x !== x0 && x > xa && x < xb) radice(x, y0 - 4, rs(-0.3, 0.3), D * rs(0.4, 0.5), 1.9, 0); });
    // la radice più lunga: scende fino in fondo e arriva dritta, in verticale, sopra il foglio della sezione dopo
    const yz = yE + 40, P = Array.from({ length: 16 }, (_, i) => { const t = i / 15, q = Math.min(1, t / 0.8), e = q * q * (3 - 2 * q); return [x0 + (xp - x0) * e + (i && q < 1 ? rs(-14, 14) * (1 - t) : 0), y0 - 4 + (yz - y0) * t]; }); // l'ultimo quinto è dritto
    metti({ s: M.stroke(M.smooth(P), { w: 2 / k, amp: 0.7 }) }, y0 - 4, yE - 12); // finita poco prima del fondo: quando il pin si stacca è già intera
    P.forEach(([x, y], i) => { if (i > 1 && y < y0 + D * 0.55 && Rs() < 0.6) radice(x, y, (i % 2 ? -1 : 1) * rs(0.7, 1.1), rs(80, 190), 1.3, 1); });
    sotto = it;
  };

  /* ---- bottiglie vere (HTML) nel disegno ---- */
  const FONDO = { 'assets/bottles/philia.webp': 0.958, 'assets/bottles/resale.webp': 0.958 }; // dove finisce il vetro nella foto (misurato sull'alfa); le altre ~0,91
  const bottiglia = (id, x, y, h, row) => {
    const w = FS.wine(id), a = document.createElement('a');
    a.className = 'fb-bt'; a.href = FS.wineUrl(id); a.dataset.wine = id;
    a.style.cssText = `--x:${x};--y:${y};--h:${h};--b:${FONDO[w.bottle] ?? 0.91}`;
    a.innerHTML = `<img src="${w.bottle}" alt="" decoding="async"><span>${w.name}</span>`; // una riga sola: i nomi lunghi vanno a capo (css)
    track.append(a);
  };
  // le bottiglie poggiano su lastra, muretto, cassetta, scoglio piatto e tavola; base = piano della superficie (+3: dentro lo spessore del tratto)
  const GRUPPI = [[[['c53-primitivo', 1290], ['gocce', 1450], ['c53-negroamaro', 1610]], L1, 300], [[['terra-platinum', 3830], ['terra-gold', 3990], ['terra-primitivo', 4150]], L2, 270],
    [[['organic-bianco', 5470], ['organic-primitivo', 5640]], L3, 290], [[['cala', 6720], ['tre-cuori', 6835], ['sassirossi', 6950]], L4, 260],
    [[['125-rosato', 9030], ['125-primitivo', 9200], ['125-negroamaro', 9370]], 608, 240]]; // una per tappa, nell'ordine di TAPPE
  GRUPPI.forEach(([g, y, h]) => g.forEach(([id, x], i) => {
    bottiglia(id, x, y + 3, h, i % 2);
    add(ombra(x, y + 3, h));
  }));
  /* ---- prove "info" (?info=a|b|c, 30 ott). a: titolo fisso in alto come klimtwine · b: annotazioni a matita accanto alle bottiglie ·
     c: biglietto di carta con l'elenco dei vini. Le posizioni solo su schermi larghi: sul telefono il biglietto sta fermo in alto ---- */
  const caps = [...track.querySelectorAll('.fb-cap')];
  if ((INFO === 'b' || INFO === 'c') && !narrow()) caps.forEach((el, i) => { // accanto al gruppo di bottiglie, in alto quanto le bottiglie
    const [g, ys, h] = GRUPPI[i], xl = g[g.length - 1][1];
    el.style.setProperty('--x', xl + 115); el.style.setProperty('--y', INFO === 'c' ? ys - 6 : ys - h * 0.9); // c: il biglietto poggia sulla base delle bottiglie e cresce in su (css)
    if (INFO === 'b') add({ s: [ // freccia dall'appunto alla spalla dell'ultima bottiglia e un trattino da ogni nome al suo tappo
      M.stroke(M.smooth([[xl + 108, ys - h * 0.55], [xl + 80, ys - h * 0.47], [xl + 40, ys - h * 0.52]]), { w: 1.5, amp: 0.8 }),
      M.stroke([[xl + 50, ys - h * 0.58], [xl + 40, ys - h * 0.52], [xl + 51, ys - h * 0.47]], { w: 1.5, amp: 0.6 }),
      ...g.map(([, x]) => M.stroke([[x - 1, ys - h * 0.84 - 18], [x + 1, ys - h * 0.84 - 4]], { w: 1.3, amp: 0.5 }))] });
  });
  if (INFO === 'c') caps.forEach((el, i) => el.querySelector('.fb-cap__go').insertAdjacentHTML('beforebegin', `<ul class="fb-cap__vini">${GRUPPI[i][0]
    .map(([id]) => FS.wine(id)).filter(Boolean).map((w) => `<li><span class="wine-dot" style="--wine:${w.color}"></span>${w.name}</li>`).join('')}</ul>`));
  // a: un titolo solo, fermo in alto; cambia lettera per lettera quando cambia la tappa
  const fisso = sec.querySelector('.fb-fisso');
  let fi = -2;
  const lettere = (t) => t.split(' ').map((w) => `<span style="display:inline-block;white-space:nowrap">${[...w].map((c) => `<span class="ch"><span>${c}</span></span>`).join('')}</span>`).join(' ');
  const fissoAggiorna = (i) => {
    const dir = i > fi ? 1 : -1;
    fi = i;
    fisso.classList.toggle('is-on', i >= 0);
    if (i < 0) return;
    const el = caps[i], t = fisso.querySelector('.fb-fisso__t'), testo = `${String(i + 1).padStart(2, '0')} ${el.querySelector('.fb-cap__t').textContent}`;
    fisso.querySelector('.fb-fisso__d').textContent = el.querySelector('.fb-cap__d').textContent;
    const go = fisso.querySelector('.fb-fisso__go'), b = el.querySelector('.fb-cap__go');
    go.textContent = b.textContent + ' →'; go.dataset.col = b.dataset.col;
    const vecchie = [...t.querySelectorAll('.ch > span')];
    const nuovo = () => { t.innerHTML = lettere(testo); t.setAttribute('aria-label', testo); if (!M.RM) gsap.fromTo(t.querySelectorAll('.ch > span'), { yPercent: 110 * dir }, { yPercent: 0, duration: 1, ease: 'expo.out', stagger: 0.025 }); };
    if (!vecchie.length || M.RM) return nuovo();
    gsap.killTweensOf(vecchie);
    gsap.to(vecchie, { yPercent: -110 * dir, duration: 0.4, ease: 'power3.in', stagger: 0.01, onComplete: nuovo });
  };
  fisso?.querySelector('.fb-fisso__go').addEventListener('click', (e) => document.dispatchEvent(new CustomEvent('fs:open-cantina', { detail: { col: e.currentTarget.dataset.col } })));

  const htmlEls = [...track.querySelectorAll('.fb-testo, .fb-bt')].map((el) => ({ el, testo: el.classList.contains('fb-testo'), x: parseFloat(el.style.getPropertyValue('--x')) + (el.classList.contains('fb-bt') ? 0 : 40), rev: 0, o: -1 }));
  const testi = htmlEls.filter((h) => h.testo);

  /* ---- pillola delle tappe (come la "Our Wines" di klimtwine, scelta il 30 ott): la tappa corrente con le sue bottiglie e 01/05;
     la freccia apre l'elenco delle cinque tappe ---- */
  let curTappa = -1;
  const mini = (i) => GRUPPI[i][0].map(([id]) => `<img src="${FS.wine(id).bottle}" alt="" decoding="async">`).join('');
  const nome = (i) => FS.collection(TAPPE[i].col).name, num = (i) => String(i + 1).padStart(2, '0');
  nav.innerHTML = `<ul class="fb-menu" id="fb-menu" hidden>${TAPPE.map((tp, i) => `<li><button type="button"><span class="fb-mini">${mini(i)}</span><span class="n">${num(i)}</span>${nome(i)}</button></li>`).join('')}</ul>
    <button class="fb-pill" type="button" aria-expanded="false" aria-controls="fb-menu"><span class="fb-mini"></span><span class="fb-pill__t"></span><span class="fb-pill__n"></span><span class="fb-pill__v" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="1.6"/></svg></span></button>`;
  const pill = nav.querySelector('.fb-pill'), menu = nav.querySelector('.fb-menu'), navBtns = [...menu.querySelectorAll('button')];
  const apri = (on) => { menu.hidden = !on; pill.setAttribute('aria-expanded', on); };
  const segna = (i) => {
    pill.querySelector('.fb-mini').innerHTML = mini(i); pill.querySelector('.fb-pill__t').textContent = nome(i);
    pill.querySelector('.fb-pill__n').textContent = `${num(i)}/${num(TAPPE.length - 1)}`;
    navBtns.forEach((b, j) => b.setAttribute('aria-current', j === i));
  };
  pill.addEventListener('click', () => apri(menu.hidden));
  document.addEventListener('click', (e) => { if (!nav.contains(e.target)) apri(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { apri(false); pill.focus(); } });
  navBtns.forEach((b, i) => b.addEventListener('click', () => {
    apri(false);
    if (!st) return;
    const p = M.clamp((TAPPE[i].x * k - (i ? vw * 0.04 : 0) - cs) / Math.max(1, ce - cs)), y = st.start + p * hp;
    FS.lenis ? FS.lenis.scrollTo(y, { duration: 1.6 }) : scrollTo({ top: y, behavior: 'smooth' });
  }));
  sec.querySelectorAll('[data-col]').forEach((b) => b.addEventListener('click', () => document.dispatchEvent(new CustomEvent('fs:open-cantina', { detail: b.dataset.col ? { col: b.dataset.col } : {} }))));

  /* ---- bottiglia al centro: clic su una bottiglia → il disegno si vela, la bottiglia scivola al centro con un solo movimento morbido
     (30 ott: niente salto né rotazioni, niente disegni attorno oltre alla macchia del suo colore e all'ombra), accanto la scheda.
     Esc, Chiudi o clic sul velo la riportano al suo posto. Dati veri di js/data.js ---- */
  const zoom = sec.querySelector('.fb-zoom'), zq = (c) => zoom.querySelector(c), zImg = zq('.fb-zoom__bt');
  const zInfo = [...zq('.fb-zoom__info').children], zX = zq('.fb-zoom__x');
  const zst = { wash: 0, fade: 1 };
  let zs = null;
  const zSheet = new M.Sheet(zq('.fb-zoom__cv'), (ctx, f) => {
    if (!zs) return;
    zs.wash.progress = zst.wash; zs.wash.alpha = zs.washA * zst.fade; M.drawWash(ctx, zs.wash, f);
    zs.base.progress = zst.wash; zs.base.alpha = zst.fade; M.draw(ctx, zs.base, f);
  });
  const zScena = (w) => { // misure, macchia e ombra, in px dell'overlay
    const W = zoom.clientWidth, H = zoom.clientHeight, mob = narrow();
    const Hb = mob ? H * 0.36 : H * 0.7, Wb = (Hb * 653) / 1024, bx = mob ? W / 2 : W * 0.62, by = mob ? 76 + 64 : (H - Hb) / 2 + H * 0.03;
    const yb = by + Hb * (FONDO[w.bottle] ?? 0.91), [r, g, b] = M.rgb(w.color), lum = (0.3 * r + 0.59 * g + 0.11 * b) / 255;
    return { w, bx, by, Hb, Wb, washA: lum > 0.6 ? 0.45 : 0.24,
      wash: M.wash(M.ellipse(bx, by + Hb * 0.56, Wb * 0.62, Hb * 0.38, 0, 0, 1, 40), { color: w.color, origin: [bx, by + Hb * 0.6], amp: 6 }),
      base: M.stroke(M.ellipse(bx, yb, Wb * 0.36, Hb * 0.024, 0, -2.4, 1.1, 40), { w: 1.5, amp: 0.8 }) };
  };
  const zScheda = (w) => {
    zq('.fb-zoom__col').textContent = FS.collection(w.collection)?.name || '';
    zq('.fb-zoom__t').textContent = w.name;
    zq('.fb-zoom__meta').textContent = [w.denom, w.uve, w.alcool].filter(Boolean).join(' · ');
    zq('.fb-zoom__desc').textContent = w.desc || '';
    const ar = w.aromi.join(', ').replace(/^./, (c) => c.toUpperCase());
    zq('.fb-zoom__dati').innerHTML = [['Vista', w.vista], ['Aromi', ar || '<span class="tbd">Non indicati sul sito attuale</span>'], ['In tavola', w.abb]]
      .filter(([, v]) => v).map(([t, v]) => `<div><dt>${t}</dt><dd>${v}</dd></div>`).join('');
    zq('.fb-zoom__go').href = w.url;
    zq('.fb-zoom__col-go').dataset.col = w.collection;
  };
  const zApri = (a) => {
    if (zs) return;
    const w = FS.wine(a.dataset.wine);
    zScheda(w);
    zoom.hidden = false; sec.classList.add('is-zoom'); zSheet.resize(); FS.lenis?.stop();
    Object.assign(zst, { wash: 0, fade: 1 });
    zs = zScena(w); zs.a = a;
    zImg.src = w.bottle;
    zImg.style.cssText = `left:${zs.bx - zs.Wb / 2}px;top:${zs.by}px;height:${zs.Hb}px`;
    const r0 = a.querySelector('img').getBoundingClientRect(), zr = zoom.getBoundingClientRect();
    zs.da = { x: r0.left + r0.width / 2 - zr.left - zs.bx, y: r0.top + r0.height / 2 - zr.top - (zs.by + zs.Hb / 2), scale: r0.height / zs.Hb };
    gsap.set(zImg, zs.da);
    a.style.visibility = 'hidden';
    zs.tl = gsap.timeline({ onUpdate: () => zSheet.kick(120) })
      .fromTo(zoom, { '--velo': 0 }, { '--velo': 1, duration: 0.6, ease: 'power1.out' }, 0)
      .to(zImg, { x: 0, y: 0, scale: 1, duration: 1.3, ease: 'expo.inOut' }, 0)
      .to(zst, { wash: 1, duration: 1.4, ease: 'power1.out' }, 0.8)
      .fromTo([...zInfo, zX], { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.06, ease: 'power2.out' }, 0.8);
    zX.focus({ preventScroll: true });
  };
  const zChiudi = (poi) => {
    if (!zs || zs.via) return;
    const z = zs; z.via = true; z.tl.kill();
    gsap.timeline({ onUpdate: () => zSheet.kick(120), onComplete: () => {
      z.a.style.visibility = ''; zoom.hidden = true; sec.classList.remove('is-zoom'); zs = null; FS.lenis?.start(); z.a.focus({ preventScroll: true }); poi?.();
    } })
      .to(zst, { fade: 0, duration: 0.35 }, 0)
      .to([...zInfo, zX], { opacity: 0, duration: 0.25 }, 0)
      .to(zImg, { ...z.da, duration: 0.9, ease: 'expo.inOut' }, 0.1)
      .to(zoom, { '--velo': 0, duration: 0.45 }, 0.4);
  };
  track.addEventListener('click', (e) => { const a = e.target.closest('.fb-bt'); if (!a) return; e.preventDefault(); zApri(a); });
  zX.addEventListener('click', () => zChiudi());
  zoom.addEventListener('click', (e) => { if (e.target === zoom) zChiudi(); });
  zq('.fb-zoom__col-go').addEventListener('click', (e) => { const col = e.currentTarget.dataset.col; zChiudi(() => document.dispatchEvent(new CustomEvent('fs:open-cantina', { detail: { col } }))); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && zs) zChiudi(); });
  addEventListener('resize', () => zChiudi()); // shortcut: chiude invece di ricalcolare la scena, da rivedere se dà fastidio ruotando il telefono

  /* ---- vento, portone ---- */
  const scr = (x, y) => [k * x - cam, oy + k * y - camY]; // dal mondo allo schermo (coordinate del canvas)
  const inDoor = (x, y) => { const [a, b] = scr(door.x0, door.y0), [c, d] = scr(door.x1, door.y1); return x > a && x < c && y > b && y < d; };
  let lastX = null;
  sec.addEventListener('pointermove', (e) => {
    const b = cvEl.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top;
    mvx = lastX === null ? 0 : x - lastX; lastX = x; mx = x; my = y;
    for (const el of els) if (el.sway && el.rev > 0.5) {
      const s = el.sway, [sx, sy] = scr(s.bx, s.cy), d = Math.hypot(x - sx, y - sy), R0 = 200 * k;
      if (d < R0) s.v += mvx * 0.05 * (1 - d / R0) / k;
    }
    const over = inDoor(x, y);
    door.target = over ? 1 : 0;
    sec.style.cursor = over ? 'pointer' : '';
    sheet.kick(160);
  });
  sec.addEventListener('pointerleave', () => { lastX = null; mx = my = -999; door.target = 0; });
  sec.addEventListener('click', (e) => { // portone = Collezione 53
    const b = cvEl.getBoundingClientRect();
    if (!inDoor(e.clientX - b.left, e.clientY - b.top)) return;
    door.target = 1; sheet.kick(600);
    setTimeout(() => document.dispatchEvent(new CustomEvent('fs:open-cantina', { detail: { col: 'luxury' } })), 450);
  });

  /* ---- misure, pin, partenza ---- */
  const total = () => Math.max(1, WW * k - vw);
  const sheet = new M.Sheet(cvEl, render, (w, h) => {
    vw = w; vh = h;
    k = narrow() ? Math.min(h / 900, w / 500) : h / 900;
    oy = h - 900 * k + (narrow() ? 0 : 80 * k); // desktop: scena più bassa (30 ott); oltre 80 la cassetta di 125 Organic tocca la pillola delle tappe
    cs = narrow() ? Math.max(0, k * 1050 - w / 2) : 0;
    ce = narrow() ? Math.min(total(), k * 9300 - w / 2) : total();
    hp = Math.max(1, (ce - cs) * (narrow() ? 0.65 : 1));
    YE = Math.round(h * 0.85); DV = 2 * YE; // con camY = u²/2DV la discesa parte ferma e finisce alla velocità dello scroll
    if (camY) camY = YE;
    track.style.setProperty('--k', k); track.style.setProperty('--oy', oy);
    makeSky(); sottoterra();
    cam = cs + prog * (ce - cs);
    if (st) ScrollTrigger.refresh();
  });
  st = ScrollTrigger.create({
    trigger: sec, pin, start: 'top top', end: () => '+=' + Math.round(hp + DV), scrub: true, invalidateOnRefresh: true,
    onUpdate: (s) => {
      const px = s.progress * (s.end - s.start), u = Math.max(0, px - hp); // prima il cammino, poi la discesa
      prog = M.clamp(px / hp); cam = cs + prog * (ce - cs); camY = (u * u) / (2 * DV);
      sec.toggleAttribute('data-nav-trasparente', camY < 1); // header senza fondo solo nel cammino; scendendo i testi gli passano sotto
      sheet.kick(150);
    },
  });

  FS.righe(sec.querySelector('[data-righe]'));
  FS.dopoIngresso(() => requestAnimationFrame(() => requestAnimationFrame(() => {
    gsap.to(S, { intro: 1, duration: M.RM ? 0 : 3.2, ease: 'power1.inOut', onUpdate: () => sheet.kick(100) });
  })));
})();
