/* AROMI E FORMA DEI VINI (10 nov 2026): tolti da js/disegna.js così li usa anche la scheda vino-i.html. La forma di ogni vino ricavata dai dati veri
   (rotonda o tesa, ampia, lunga, speziata), i disegni degli aromi a matita con l'acquerello del colore naturale (riquadro 100×100), il contorno della
   bottiglia preso dall'alfa della foto. Dipende da: js/matita.js, FS_DATA (js/data.js) */
window.Aromi = (() => {
  const M = Matita;

  /* ---- la forma di ogni vino, dai dati veri ---- */
  const ROUND = /confettur|prugn|matur|^mora$|amarena|vaniglia|cacao|cioccolato|caramello|frutta secca/;
  const TENSE = /pepe|spezie|cannella|tabacco|liquirizia|balsamic|erbacea|melograno|agrumi|ribes|lampone|appena raccolta|fiori|mandorla/;
  const SPICE = /pepe|spezie|cannella|tabacco|liquirizia/;
  const forma = (w) => {
    const r = w.aromi.filter((a) => ROUND.test(a)).length, t = w.aromi.filter((a) => TENSE.test(a)).length;
    const alc = parseFloat(w.alcool.replace(',', '.')) || 13, ample = M.clamp((alc - 11.5) / 4);
    const round = (r + 0.5) / (r + t + 1) + (w.tipo === 'dolce' ? 0.15 : 0) + (alc >= 14.5 ? 0.1 : 0) - (w.tipo === 'bianco' || w.tipo === 'rosato' ? 0.15 : 0);
    const legno = /barrique|affinat|legno|botti|appassiment/i.test(w.desc) || w.tipo === 'dolce';
    const long = w.collection === 'luxury' ? 0.9 : M.clamp(ample * 0.7 + (legno ? 0.3 : 0));
    return { round: M.clamp(round), ample, long, spice: M.clamp(w.aromi.filter((a) => SPICE.test(a)).length / 2) };
  };

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

  const etichette = (f) => [f.round > 0.6 ? 'Rotonda' : f.round < 0.4 ? 'Tesa' : 'Equilibrata', f.ample > 0.55 ? 'Ampia' : f.ample < 0.3 ? 'Leggera' : 'Di media struttura', f.long > 0.6 ? 'Lunga' : f.long < 0.3 ? 'Corta' : null].filter(Boolean);
  return { forma, etichette, DIS, aromiDi, contourOf };
})();
