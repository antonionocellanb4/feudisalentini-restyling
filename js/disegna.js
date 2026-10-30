/* PROVA A "Disegna il tuo vino" (giro 3). Il tratto di chi visita viene misurato (rotondo o teso, ampio o leggero, lungo o corto),
   confrontato con la "forma" dei 28 vini ricavata dai dati veri (aromi, gradazione, tipo, legno), poi la matita lo ripassa e lo
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

  /* ---- la forma di ogni vino, dai dati veri ---- */
  const ROUND = /confettur|prugn|matur|^mora$|amarena|vaniglia|cacao|cioccolato|caramello|frutta secca/;
  const TENSE = /pepe|spezie|cannella|tabacco|liquirizia|balsamic|erbacea|melograno|agrumi|ribes|lampone|appena raccolta|fiori|mandorla/;
  const SPICE = /pepe|spezie|cannella|tabacco|liquirizia/;
  const VINI = D.wines.map((w) => {
    const r = w.aromi.filter((a) => ROUND.test(a)).length, t = w.aromi.filter((a) => TENSE.test(a)).length;
    const alc = parseFloat(w.alcool.replace(',', '.')) || 13, ample = M.clamp((alc - 11.5) / 4);
    const round = (r + 0.5) / (r + t + 1) + (w.tipo === 'dolce' ? 0.15 : 0) + (alc >= 14.5 ? 0.1 : 0) - (w.tipo === 'bianco' || w.tipo === 'rosato' ? 0.15 : 0);
    const legno = /barrique|affinat|legno|botti|appassiment/i.test(w.desc) || w.tipo === 'dolce';
    const long = w.collection === 'luxury' ? 0.9 : M.clamp(ample * 0.7 + (legno ? 0.3 : 0));
    return { w, v: { round: M.clamp(round), ample, long, spice: M.clamp(w.aromi.filter((a) => SPICE.test(a)).length / 2) } };
  });

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
  const etichette = (f) => [f.round > 0.6 ? 'Rotonda' : f.round < 0.4 ? 'Tesa' : 'Equilibrata', f.ample > 0.55 ? 'Ampia' : f.ample < 0.3 ? 'Leggera' : 'Di media struttura', f.long > 0.6 ? 'Lunga' : f.long < 0.3 ? 'Corta' : null].filter(Boolean);

  /* ---- disegni degli aromi: tratti in un riquadro 100×100, acquerello nel colore naturale ---- */
  const C = M.circle, E = M.ellipse, S = M.smooth, LF = M.leaf, VERDE = '#7d8f45';
  const rect = (x1, y1, x2, y2, w) => { const L = Math.hypot(x2 - x1, y2 - y1), nx = (-(y2 - y1) / L) * w, ny = ((x2 - x1) / L) * w; return [[x1 + nx, y1 + ny], [x2 + nx, y2 + ny], [x2 - nx, y2 - ny], [x1 - nx, y1 - ny], [x1 + nx * 0.8, y1 + ny * 0.8]]; };
  const DIS = {
    ciliegie: () => ({ l: [C(34, 68, 15, -2), C(64, 73, 14, -1.2), S([[36, 53], [42, 36], [56, 16]]), S([[63, 59], [61, 38], [56, 16]]), LF(56, 16, 84, 10, 7, -2), [[59, 15], [80, 11]]],
      w: [[C(34, 68, 15, 0, 1), '#a3202e'], [C(64, 73, 14, 0, 1), '#a3202e'], [LF(56, 16, 84, 10, 7, -2), VERDE]] }),
    prugna: () => ({ l: [E(50, 58, 22, 27, -0.35), S([[45, 34], [39, 52], [42, 70], [50, 84]]), [[52, 32], [55, 20]], LF(55, 21, 77, 13, 6)],
      w: [[E(50, 58, 22, 27, -0.35, 0, 1), '#5b2d63'], [LF(55, 21, 77, 13, 6), VERDE]] }),
    more: () => {
      const g = [[44, 45], [56, 45], [38, 54], [50, 54], [62, 54], [38, 63], [50, 63], [62, 63], [44, 72], [56, 72], [50, 80]];
      return { l: [...g.map(([x, y], i) => C(x, y, 6.3, i)), LF(50, 39, 35, 31, 3), LF(50, 39, 65, 31, 3), LF(50, 39, 50, 27, 3), S([[50, 28], [52, 14]])],
        w: [[E(50, 62, 18, 23, 0, 0, 1), '#3a1f3d'], [LF(50, 39, 35, 31, 3), VERDE], [LF(50, 39, 65, 31, 3), VERDE]] };
    },
    fragola: () => {
      const o = S([[50, 90], [36, 77], [28, 58], [31, 44], [40, 39], [50, 41], [60, 39], [69, 44], [72, 58], [64, 77]], true);
      const semi = [[42, 52], [52, 50], [61, 54], [38, 64], [48, 62], [58, 66], [44, 74], [54, 76], [50, 84]].map(([x, y]) => [[x, y], [x + 1.4, y + 3]]);
      const corona = [[30, 43], [38, 32], [44, 41], [50, 28], [56, 41], [62, 32], [70, 43]];
      return { l: [o, ...semi, corona, [[50, 30], [52, 17]]], w: [[o, '#c23a2e'], [[...corona, [50, 47]], VERDE]] };
    },
    barattolo: () => {
      const corpo = S([[32, 45], [28, 53], [28, 82], [33, 88], [67, 88], [72, 82], [72, 53], [68, 45]], true);
      const tela = S([[24, 40], [32, 30], [50, 27], [68, 30], [76, 40], [70, 45], [64, 40], [57, 46], [50, 41], [43, 46], [36, 40], [30, 45]], true);
      return { l: [corpo, tela, S([[28, 44], [50, 47], [72, 44]]), [[37, 61], [63, 61], [63, 74], [37, 74], [37, 61.6]]],
        w: [[S([[29, 57], [71, 57], [72, 82], [67, 88], [33, 88], [28, 82]], true), '#7d1626'], [tela, '#d9c08a']] };
    },
    melograno: () => ({ l: [C(50, 62, 26, -1.5), [[42, 38], [43, 28], [47, 34], [50, 25], [53, 34], [57, 28], [58, 38]], S([[33, 58], [35, 49], [42, 43]])],
      w: [[C(50, 62, 26, 0, 1), '#b5352f']] }),
    liquirizia: () => {
      const st = [[24, 82, 72, 24], [32, 87, 80, 31], [17, 71, 63, 21]];
      return { l: st.flatMap(([a, b, c, d]) => [rect(a, b, c, d, 3.6), [[c, d], [c + 3, d - 3]], [[c - 2, d], [c, d - 5]]]), w: st.map(([a, b, c, d]) => [rect(a, b, c, d, 3.6), '#3d2a22']) };
    },
    cannella: () => {
      const st = [[18, 74, 74, 34], [26, 86, 82, 48]];
      return { l: st.flatMap(([a, b, c, d]) => [rect(a, b, c, d, 6), E(c, d, 5, 6.5, -0.6), S([[c - 2, d - 1], [c + 1, d - 3], [c + 2, d + 1], [c - 1, d + 2]])]),
        w: st.map(([a, b, c, d]) => [rect(a, b, c, d, 6), '#a05f2c']) };
    },
    tabacco: () => {
      const f = LF(16, 88, 84, 14, 24, 4), vene = [];
      for (const t of [0.22, 0.36, 0.5, 0.64, 0.78]) {
        const x = 16 + 68 * t, y = 88 - 74 * t, k = 15 * (1 - Math.abs(t - 0.45));
        vene.push(S([[x, y], [x - 4 + 4, y - 9], [x - k * 0.7 - 2, y - k * 0.7 - 4]]), S([[x, y], [x + 7, y + 2], [x + k * 0.75 + 4, y + k * 0.5 - 2]]));
      }
      return { l: [f, S([[17, 87], [50, 52], [83, 15]]), ...vene], w: [[f, '#9a7433']] };
    },
    pepe: () => {
      const g = [[38, 40], [57, 36], [67, 53], [48, 55], [31, 61], [55, 71], [40, 77]];
      return { l: g.flatMap(([x, y], i) => [C(x, y, 7, i * 0.9), S([[x - 3, y - 1], [x, y - 3.5], [x + 3, y - 1]])]), w: g.map(([x, y]) => [C(x, y, 7, 0, 1), '#3a2e28']) };
    },
    rametto: () => {
      const gambo = S([[30, 90], [40, 66], [50, 44], [64, 16]]), q = M.resample(gambo, 40), foglie = [];
      for (let i = 6, s = 1; i < 38; i += 4, s = -s) { const [x, y] = q[i], [x2, y2] = q[i + 1], a = Math.atan2(y2 - y, x2 - x) + s * 0.95; foglie.push(LF(x, y, x + Math.cos(a) * 15, y + Math.sin(a) * 15, 3.2)); }
      return { l: [gambo, ...foglie], w: foglie.map((f) => [f, '#7f9a62']) };
    },
    fiore: (term) => {
      const pet = Array.from({ length: 5 }, (_, k) => { const a = -Math.PI / 2 + (k * M.TAU) / 5; return E(50 + Math.cos(a) * 14, 40 + Math.sin(a) * 14, 11, 7, a, a + 2, 1.04, 28); });
      const col = /bianch/.test(term) ? '#e6dccb' : '#c3a9d3';
      return { l: [...pet, C(50, 40, 5.5), S([[50, 47], [49, 68], [52, 92]]), LF(50, 72, 69, 62, 5)], w: [...pet.map((p) => [p, col]), [C(50, 40, 5.5, 0, 1), '#e2b13c'], [LF(50, 72, 69, 62, 5), VERDE]] };
    },
    cacao: () => {
      const b = S([[20, 66], [30, 46], [48, 33], [68, 29], [82, 35], [80, 48], [66, 63], [46, 74], [29, 75]], true);
      return { l: [b, S([[24, 63], [46, 47], [78, 36]]), S([[28, 71], [52, 59], [80, 45]]), [[82, 35], [90, 29]]], w: [[b, '#8a4b26']] };
    },
    vaniglia: () => ({ l: [LF(14, 86, 84, 22, 4.5, -6), LF(22, 92, 88, 34, 4.5, -5), S([[84, 22], [89, 18], [90, 24]])], w: [[LF(14, 86, 84, 22, 4.5, -6), '#3b2618'], [LF(22, 92, 88, 34, 4.5, -5), '#3b2618']] }),
    caramella: () => {
      const sx = S([[36, 55], [19, 42], [23, 55], [17, 68]], true), dx = S([[64, 55], [81, 42], [77, 55], [83, 68]], true);
      return { l: [E(50, 55, 15, 11), sx, dx, [[36, 55], [22, 48]], [[36, 55], [21, 61]], [[64, 55], [78, 48]], [[64, 55], [79, 61]], [[45, 45], [41, 64]], [[55, 45], [51, 65]]],
        w: [[E(50, 55, 15, 11, 0, 0, 1), '#c9862b'], [sx, '#e3c48a'], [dx, '#e3c48a']] };
    },
    mandorla: () => {
      const m = (ox, oy) => S([[50, 22], [60, 40], [62, 58], [56, 72], [44, 72], [38, 58], [40, 40]].map(([x, y]) => [x + ox, y + oy]), true);
      const a = m(-12, 2), b = m(13, 12), punti = [[36, 44], [40, 56], [35, 62], [64, 56], [61, 68], [66, 74]].map(([x, y]) => [[x, y], [x + 1.2, y + 1.6]]);
      return { l: [a, b, ...punti], w: [[a, '#b78657'], [b, '#b78657']] };
    },
    agrume: () => {
      const spicchi = Array.from({ length: 8 }, (_, k) => { const a = (k / 8) * M.TAU; return [[50 + Math.cos(a) * 3, 56 + Math.sin(a) * 3], [50 + Math.cos(a) * 21, 56 + Math.sin(a) * 21]]; });
      return { l: [C(50, 56, 28, -2), C(50, 56, 23, 1, 1.03), ...spicchi], w: [[C(50, 56, 28, 0, 1), '#e9c43f']] };
    },
    mela: () => {
      const o = S([[50, 37], [38, 30], [26, 38], [23, 56], [30, 76], [42, 86], [50, 82], [58, 86], [70, 76], [77, 56], [74, 38], [62, 30]], true);
      return { l: [o, S([[50, 38], [52, 28], [55, 20]]), LF(54, 25, 72, 17, 6)], w: [[o, '#a8b04a'], [LF(54, 25, 72, 17, 6), VERDE]] };
    },
  };
  const AROMA = [[/ciliegi|amarena/, 'ciliegie'], [/confettur/, 'barattolo'], [/prugn/, 'prugna'], [/mor[ae]|frutti di bosco|mirtill|ribes|piccoli frutti|lampone/, 'more'],
    [/frutt[ai] ross|frutti rossi/, 'fragola'], [/melograno/, 'melograno'], [/liquirizia/, 'liquirizia'], [/cannella|spezie/, 'cannella'], [/tabacco/, 'tabacco'],
    [/pepe/, 'pepe'], [/erbacea|balsamic/, 'rametto'], [/fiori/, 'fiore'], [/cacao|cioccolato/, 'cacao'], [/vaniglia/, 'vaniglia'], [/caramello/, 'caramella'],
    [/mandorla|frutta secca/, 'mandorla'], [/agrumi/, 'agrume'], [/^frutta$/, 'mela']];
  const aromiDi = (w) => {
    const out = [];
    for (const a of w.aromi) { const k = AROMA.find(([re]) => re.test(a))?.[1]; if (!k) continue; const g = out.find((o) => o.k === k); if (g) g.terms.push(a); else out.push({ k, terms: [a] }); }
    return out.slice(0, 6);
  };

  /* ---- contorno della bottiglia dall'alfa della foto (bordo sinistro e destro di ogni riga) ---- */
  const contours = {};
  const contourOf = (src) => (contours[src] ??= new Promise((ok) => {
    const im = new Image();
    im.onload = () => {
      const W = 163, H = 256, c = document.createElement('canvas'); c.width = W; c.height = H;
      const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(im, 0, 0, W, H);
      const d = x.getImageData(0, 0, W, H).data, L = [], Rr = [];
      for (let y = 0; y < H; y += 3) {
        let a = -1, b = -1;
        for (let i = 0; i < W; i++) if (d[(y * W + i) * 4 + 3] > 110) { if (a < 0) a = i; b = i; }
        if (a >= 0) { L.push([a / W, y / H]); Rr.push([(b + 1) / W, y / H]); }
      }
      let p = [...L, ...Rr.reverse()];
      p = p.map((q, i) => { const a = p[Math.max(0, i - 1)], b = p[Math.min(p.length - 1, i + 1)]; return [(a[0] + q[0] + b[0]) / 3, (a[1] + q[1] + b[1]) / 3]; }); // scalini dei pixel
      ok(p.length > 4 ? [...p, p[0], p[1]] : null);
    };
    im.onerror = () => ok(null);
    im.src = src;
  }));

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
    $('.dv-res__aromi').innerHTML = ar ? ar.replace(/^./, (c) => c.toUpperCase()) : '<span class="tbd">Non indicati sul sito attuale</span>';
    $('.dv-res__abb').textContent = w.abb;
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
