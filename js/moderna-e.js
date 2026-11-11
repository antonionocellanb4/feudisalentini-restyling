/* Dall'11 nov 2026 è la versione con l'apertura rivista (alberelli veri, piani che si staccano, muretto e pajara di pietra): le modifiche sono segnate "11 nov". Quella di prima resta in bozza: moderna-e-bozza.html + js/moderna-e-bozza.js.
   HOME MODERNA E "La giornata" (2 nov 2026). La passeggiata della fiaba, con un disegno elegante che si muove: linea sottile e precisa da incisione (come l'oro sulle etichette di Collezione 53), niente matita né acquerello, niente foto.
   Palco fermo, si cammina in orizzontale dall'alba al tramonto. Il disegno è su canvas, in unità: 620 = dal fondo dell'header al ripiano (U = px per unità); ogni tappa ha il suo centro, x relativa a lì. I piani lontani scorrono più piano.
   Il disegno si traccia da solo in apertura, camminando arriva già intero, e vive: viti e papaveri al vento (anche quello del cursore e del camminare), onde, barca, uccelli, raggi, lampadine.
   Dopo il tramonto si cena: si sceglie un piatto inciso, quello grande si incide da solo e sul ripiano salgono i suoi vini. Poi scende la notte, blu-nera come la sezione dopo: non sfuma, si colora a passate dall'alto, e sotto c'è già il disegno di notte.
   Bottiglie e testi arrivano da destra sul ripiano. Si scorre o si trascina; pillola come js/fiaba.js, scheda del vino in js/scheda.js. Le foto dei vini non si toccano. Pezzi comuni in js/moderna-kit.js */
(() => {
  const { $, $$, reduce, clamp, ss, titoli, apri } = FS.mk, D = FS.data;
  const sec = $('.e-st'), stage = $('.e-stage'), cv = $('.e-cv'), ink = $('.e-ink'), ictx = ink.getContext('2d'), nCv = document.createElement('canvas'), nctx = nCv.getContext('2d', { alpha: false }), track = $('.e-track'), tappe = $$('.e-tappa'), nav = $('.fb-tappe'), alto = $('.e-alto');
  let ctx = cv.getContext('2d', { alpha: false });
  const N = tappe.length, m0 = innerWidth <= 860; // shortcut: il disegno si fa una volta sola, ruotando il telefono restano le posizioni di prima, come nella fiaba
  const TV = 6, viniDi = (id) => { const tutti = D.wines.filter((w) => (w.foods || []).includes(id)), uno = tutti.filter((w, i, a) => a.findIndex((v) => v.collection === w.collection) === i); return [...uno, ...tutti.filter((w) => !uno.includes(w))]; }; // prima uno per collezione
  const VINI = [null,
    { col: 'luxury', vini: [['c53-primitivo', 'Primitivo'], ['gocce', 'Gocce'], ['c53-negroamaro', 'Negroamaro']] },
    { col: 'terra', vini: [['terra-platinum', 'Platinum'], ['terra-gold', 'Gold'], ['terra-primitivo', 'Primitivo']] },
    { col: 'organic', vini: [['organic-bianco', 'Bianco'], ['organic-primitivo', 'Primitivo']] },
    { col: 'classica', vini: [['cala', 'Càla'], ['tre-cuori', 'Tre Cuori'], ['sassirossi', 'Sassirossi']] },
    { col: 'lounge', vini: [['125-rosato', 'Rosato'], ['125-primitivo', 'Primitivo'], ['125-negroamaro', 'Negroamaro']] },
    { vini: viniDi('pugliese').slice(0, 3).map((w) => [w.id, w.name]) }, null];
  const mob = () => innerWidth <= 860;
  const INK = '#2b221c', ORO = '#a98a4a', TENUE = '#8f8172', TERRA = '#9a4a32', TAU = Math.PI * 2;
  let notte = 0, colore = 0, toni = {}, W = 1, H = 1, dpr = 1, edge = 1, U = 1, bh = 1, dx = 1, X = [0], cam = 0, pX = 0, gX = 0, tempo = 0, ventoV = 0, vento = 0, prevCam = 0, sporco = true, ultimo = 0;
  const T0 = 76, hv0 = alto.offsetHeight || innerHeight, W0 = stage.clientWidth || innerWidth, U0 = (hv0 * (m0 ? 0.6 : 0.72) - T0) / 620, half = W0 / (2 * U0), XE = (W0 * (m0 ? 0.8 : 0.55) + W0 * 6) / U0, O = m0 ? 190 : 400;
  const lato = (x) => (x * half) / 775; // le posizioni sono scritte per un mezzo schermo di 775 unità

  const tono = (c) => (notte ? toni[c] ?? c : c);

  /* ---- il tratto: linee precise, nessuna sbavatura ---- */
  let seme = 11;
  const R = () => { seme = (seme + 0x6d2b79f5) | 0; let t = Math.imul(seme ^ (seme >>> 15), 1 | seme); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const r = (a, b) => a + R() * (b - a);
  const liscia = (p, chiusa = false, n = 8) => { const q = []; const L = p.length, G = (i) => (chiusa ? p[(i + L) % L] : p[Math.max(0, Math.min(L - 1, i))]); for (let i = 0; i < (chiusa ? L : L - 1); i++) { const [a, b, c, d] = [G(i - 1), G(i), G(i + 1), G(i + 2)]; for (let k = 0; k < n; k++) { const t = k / n, t2 = t * t, t3 = t2 * t; q.push([0.5 * (2 * b[0] + (c[0] - a[0]) * t + (2 * a[0] - 5 * b[0] + 4 * c[0] - d[0]) * t2 + (3 * b[0] - a[0] - 3 * c[0] + d[0]) * t3), 0.5 * (2 * b[1] + (c[1] - a[1]) * t + (2 * a[1] - 5 * b[1] + 4 * c[1] - d[1]) * t2 + (3 * b[1] - a[1] - 3 * c[1] + d[1]) * t3)]); } } q.push(chiusa ? q[0] : p[L - 1]); return q; };
  const riga = (pts, c = INK, w = 1.1) => { const p = new Path2D(); let len = 0; pts.forEach(([x, y], i) => { p[i ? 'lineTo' : 'moveTo'](x, y); if (i) len += Math.hypot(x - pts[i - 1][0], y - pts[i - 1][1]); }); return { pts, c, w, len: len + 1, p }; };
  const cerchio = (cx, cy, rx, ry = rx, a0 = 0, n = 24, giro = 1) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (i / n) * TAU * giro; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
  const arcoP = (cx, base, w, h, n = 14) => { const q = w / 2, c = base - h + q, p = [[cx - q, base]]; for (let i = 0; i <= n; i++) { const a = Math.PI + (i / n) * Math.PI; p.push([cx + Math.cos(a) * q, c + Math.sin(a) * q]); } p.push([cx + q, base]); return p; };
  const chiudi = (p) => [...p, p[0]];
  const tratteggio = (poly, ang, gap, c = TENUE, w = 0.8) => { // linee parallele dentro un poligono: l'ombra da incisione
    const cs = Math.cos(-ang), sn = Math.sin(-ang), q = poly.map(([x, y]) => [x * cs - y * sn, x * sn + y * cs]), ys = q.map((p) => p[1]), out = [], cb = Math.cos(ang), sb = Math.sin(ang);
    for (let y = Math.min(...ys) + gap / 2; y < Math.max(...ys); y += gap) { const xs = []; q.forEach((a, i) => { const b = q[(i + 1) % q.length]; if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y)) xs.push(a[0] + ((y - a[1]) / (b[1] - a[1])) * (b[0] - a[0])); }); xs.sort((m, n) => m - n); for (let i = 0; i + 1 < xs.length; i += 2) out.push(riga([[xs[i], y], [xs[i + 1], y]].map(([x, yy]) => [x * cb - yy * sb, x * sb + yy * cb]), c, w)); }
    return out;
  };
  /* foglia di vite con le sue nervature */
  const fogliaVite = (x, y, a, s) => { const c = Math.cos(a), n = Math.sin(a), T = ([u, v]) => [x + (u * c - v * n) * s, y + (u * n + v * c) * s];
    const met = [[0, 0], [0.08, 0.2], [0.03, 0.4], [0.2, 0.5], [0.3, 0.66], [0.46, 0.56], [0.64, 0.58], [0.7, 0.36], [0.92, 0.16], [1.02, 0]], tutto = [...met, ...met.slice(1, -1).reverse().map(([u, v]) => [u, -v])].map(T), bordo = liscia(tutto, true, 5);
    return { occ: bordo, righe: [riga(bordo, INK, 1), riga([T([0, 0]), T([0.84, 0])], INK, 0.7), riga(liscia([T([0.06, 0]), T([0.2, 0.26]), T([0.3, 0.52])], false, 4), INK, 0.7), riga(liscia([T([0.06, 0]), T([0.2, -0.26]), T([0.3, -0.52])], false, 4), INK, 0.7), riga(liscia([T([0.36, 0]), T([0.52, 0.22]), T([0.62, 0.44])], false, 4), INK, 0.7), riga(liscia([T([0.36, 0]), T([0.52, -0.22]), T([0.62, -0.44])], false, 4), INK, 0.7)] }; };
  const grappolo = (x, y, s) => { const occ = [], righe = [riga([[x, y - 8 * s], [x + 3 * s, y - 26 * s]], INK, 1)]; [[0, 0], [-1, 0.2], [1, 0.2], [-1.5, 1], [-0.5, 1], [0.5, 1], [1.5, 1], [-1, 1.8], [0, 1.8], [1, 1.8], [-0.5, 2.6], [0.5, 2.6], [0, 3.4]].forEach(([u, v]) => { const cx = x + u * 9 * s, cy = y + v * 9 * s; occ.push(cerchio(cx, cy, 6 * s, 6 * s, 0, 14)); righe.push(riga(cerchio(cx, cy, 6 * s, 6 * s, 0, 14), INK, 0.9), riga(cerchio(cx, cy, 3.4 * s, 3.4 * s, 3.8, 6, 0.22), INK, 0.6)); }); return { occ, righe }; };
  const viticcio = (x, y, a, s) => { const p = []; for (let i = 0; i < 26; i++) { const t = i / 25, q = (1 - t * 0.85) * 12 * s, b = a + t * 9; p.push([x + t * 30 * s * Math.cos(a) + Math.cos(b) * q * t, y + t * 30 * s * Math.sin(a) + Math.sin(b) * q * t]); } return riga(p, INK, 0.8); };
  const ramo = (pts, w0, w1) => { // ramo a doppio contorno con le fibre dentro
    const s = liscia(pts, false, 8), n = s.length - 1, sx = [], dx2 = [], fib = [[], []];
    s.forEach((p, i) => { const a = s[Math.max(0, i - 1)], b = s[Math.min(n, i + 1)], l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, nx = -(b[1] - a[1]) / l, ny = (b[0] - a[0]) / l, w = w0 + (w1 - w0) * (i / n), o = Math.sin(i * 0.42) * w * 0.12; sx.push([p[0] + nx * (w + o), p[1] + ny * (w + o)]); dx2.push([p[0] - nx * (w - o), p[1] - ny * (w - o)]); fib[0].push([p[0] + nx * w * 0.35, p[1] + ny * w * 0.35]); fib[1].push([p[0] - nx * w * 0.4, p[1] - ny * w * 0.4]); });
    return { occ: [...sx, ...dx2.slice().reverse()], righe: [riga(sx, INK, 1.2), riga(dx2, INK, 1.2), riga(fib[0].slice(1, Math.floor(n * 0.7)), INK, 0.6), riga(fib[1].slice(2, Math.floor(n * 0.5)), INK, 0.6)] };
  };
  const cipresso = (x, b, h, s = 1) => { const q = liscia([[x - 4, b], [x - 22 * s, b - h * 0.26], [x - 16 * s, b - h * 0.66], [x, b - h], [x + 15 * s, b - h * 0.64], [x + 22 * s, b - h * 0.26], [x + 4, b]], false, 6), righe = [riga(q, INK, 1.1)]; for (let i = 0; i < 16; i++) { const t = 0.08 + i * 0.055, y = b - h * t, w = 17 * s * Math.sin(Math.PI * Math.min(1, 1.02 - t * 0.98)); righe.push(riga([[x + r(-w, 0), y + r(-3, 3)], [x + r(0, w), y - r(8, 18)]], INK, 0.6)); } return { occ: q, righe }; };
  const papavero = (x, b, h, s) => { const t = x + r(-18, 18), y = b - h, stelo = liscia([[x, b], [(x + t) / 2 + r(-8, 8), b - h * 0.5], [t, y]], false, 6), pet = [0, 1, 2, 3].map((i) => { const a = (i / 4) * TAU + 0.6; return liscia([[t, y], [t + Math.cos(a - 0.55) * 18 * s, y + Math.sin(a - 0.55) * 14 * s], [t + Math.cos(a) * 24 * s, y + Math.sin(a) * 18 * s], [t + Math.cos(a + 0.55) * 18 * s, y + Math.sin(a + 0.55) * 14 * s], [t, y]], false, 5); }); return { occ: pet.flat(), righe: [riga(stelo, INK, 0.9), ...pet.map((q) => riga(q, INK, 0.95)), riga(cerchio(t, y, 4 * s, 4 * s, 0, 10), INK, 0.9), ...[0, 1, 2, 3, 4, 5].map((i) => { const a = (i / 6) * TAU; return riga([[t + Math.cos(a) * 5 * s, y + Math.sin(a) * 5 * s], [t + Math.cos(a) * 8 * s, y + Math.sin(a) * 8 * s]], ORO, 1); })], ...(r(0, 1) < 0.6 ? {} : {}) }; };
  const foglioline = (x, y, a, l, w) => { const c = Math.cos(a), n = Math.sin(a), q = liscia([[x, y], [x + c * l * 0.5 - n * w, y + n * l * 0.5 + c * w], [x + c * l, y + n * l], [x + c * l * 0.5 + n * w, y + n * l * 0.5 - c * w], [x, y]], false, 4); return { occ: q, righe: [riga(q, INK, 0.9), riga([[x, y], [x + c * l * 0.85, y + n * l * 0.85]], INK, 0.55)] }; };

  const chioma = (pts, w0, seg, da = 0) => { const fo = [], fr = [], c = liscia(pts, false, 8), avanti = pts.at(-1)[0] > pts[0][0]; for (let i = 0; i < seg; i++) { const [x, y] = c[Math.round((da + ((1 - da) * (i + 0.5)) / seg) * (c.length - 1))]; for (const q of [-1, 1]) fo.push(foglioline(x, y, (avanti ? 0.4 : Math.PI - 0.4) + q * r(0.5, 1.1), r(34, 48), r(6, 8))); if (i % 3 === 1) fr.push({ occ: cerchio(x, y + 16, 6, 8, 0, 12), righe: [riga(cerchio(x, y + 16, 6, 8, 0, 12), INK, 0.9), riga([[x, y], [x, y + 8]], INK, 0.7), riga(cerchio(x - 1.5, y + 14, 2.5, 3.2, 3.6, 6, 0.3), INK, 0.5)] }); } return [ramo(pts, w0, 1.2), ...fo, ...fr]; };
  const calice = (x, b, s, a, vino = ORO) => { const c = Math.cos(a), n = Math.sin(a), T = ([u, v]) => [x + (u * c - v * n) * s, b + (u * n + v * c) * s], bordo = [[-58, -372], [-74, -300], [-60, -226], [-14, -180], [-5, -160], [-5, -24], [-44, -6], [44, -6], [5, -24], [5, -160], [14, -180], [60, -226], [74, -300], [58, -372]].map(T), liv = -278, cont = liscia(bordo, false, 6), lv = [[-72, liv], [-60, -226], [-14, -180], [14, -180], [60, -226], [72, liv]].map(T); return { occ: cont, righe: [riga(cont, INK, 1.2), riga(cerchio(T([0, -372])[0], T([0, -372])[1], 58 * s, 7 * s, 0, 30), INK, 1), riga(liscia(lv, false, 5), vino, 1), ...tratteggio(lv, a + 0.3, 6, vino, 0.7), riga([T([-44, -6]), T([44, -6])], INK, 1.2)] }; };

  const pajara = (Px, B, q0, vino = INK) => { const ti = [[230, 56], [180, 48], [132, 40], [90, 34], [52, 26]].map(([w, h]) => [w * q0, h * q0]), paj = []; let y = B, sxx = [], dxx = []; ti.forEach(([w, h], i) => { const nw = ti[i + 1]?.[0] ?? w * 0.7, top = w / 2 - 7; sxx.push([Px - w / 2, y], [Px - top, y - h], [Px - nw / 2, y - h]); dxx.push([Px + w / 2, y], [Px + top, y - h], [Px + nw / 2, y - h]); for (let k = 0; k < 8 - i; k++) { const xx = Px + r(-top + 8, top - 24), yy = y - r(8, h - 6); paj.push(riga([[xx, yy], [xx + r(10, 26), yy]], INK, 0.6)); } paj.push(...tratteggio([[Px + w * 0.16, y], [Px + w / 2, y], [Px + top, y - h], [Px + w * 0.16, y - h]], -1.05, 6, vino, 0.45)); y -= h; }); const sag = [...sxx, ...dxx.reverse()]; paj.push(riga(chiudi(sag), INK, 1.2), riga(arcoP(Px, B, 44 * q0, 62 * q0, 10), ORO, 1.4)); return { occ: sag, righe: paj }; };
  const mur = (a, b, y0 = 620) => { const occ = [], righe = []; for (let rg = 0; rg < 4; rg++) for (let x = a + rg * 16; x < b;) { const w = r(34, 62), yy = y0 - rg * 24, q = liscia([[x + 2, yy], [x + w * 0.5, yy + r(-1, 1)], [x + w - 2, yy], [x + w, yy - 12], [x + w - 3, yy - 22], [x + w * 0.4, yy - 23], [x + 3, yy - 21], [x, yy - 10]], true, 3); occ.push(q); righe.push(riga(q, INK, 0.9)); if (R() < 0.45) righe.push(riga([[x + 8, yy - r(6, 16)], [x + w * r(0.4, 0.7), yy - r(6, 16)]], INK, 0.5)); x += w + 2; } return { occ, righe }; };

  /* ---- 11 nov: i disegni nuovi dell'azienda portati qui. Alberello pugliese, muretto a secco e pajara di pietra
     sono gli stessi di tools/incidi_pagine_e.mjs (dalle foto vere), con un caso a parte (q) per non spostare il caso degli altri disegni ---- */
  const q = ((s) => (a, b) => a + ((s = (s * 16807) % 2147483647) / 2147483647) * (b - a))(53);
  const fogliaL = (x, y, a, s, vene) => { const c = Math.cos(a), n = Math.sin(a), T = ([u, v]) => [x + (u * c - v * n) * s, y + (u * n + v * c) * s];
    const met = [[0, 0], [0.08, 0.2], [0.03, 0.4], [0.2, 0.5], [0.3, 0.66], [0.46, 0.56], [0.64, 0.58], [0.7, 0.36], [0.92, 0.16], [1.02, 0]], bordo = liscia([...met, ...met.slice(1, -1).reverse().map(([u, v]) => [u, -v])].map(T), true, 2);
    return { occ: bordo, righe: [riga(bordo, INK, 0.9), riga([T([0, 0]), T([0.86, 0])], INK, 0.6), ...(vene ? [riga([T([0.08, 0]), T([0.3, 0.5])], INK, 0.6), riga([T([0.08, 0]), T([0.3, -0.5])], INK, 0.6), riga([T([0.42, 0]), T([0.62, 0.4])], INK, 0.6), riga([T([0.42, 0]), T([0.62, -0.4])], INK, 0.6)] : [])] }; };
  const uva = (x, y, s, fine) => { const occ = [], righe = [riga([[x, y - 5 * s], [x + q(-3, 3) * s, y - 24 * s]], INK, 0.9)];
    (fine ? [[0, 0], [-1, 0.2], [1, 0.2], [-1.5, 1], [-0.5, 1], [0.5, 1], [1.5, 1], [-1, 1.8], [0, 1.8], [1, 1.8], [-0.5, 2.6], [0.5, 2.6], [0, 3.4]] : [[0, 0.2], [-1, 0.6], [1, 0.6], [-0.5, 1.5], [0.5, 1.5], [0, 2.5]]).forEach(([u, v]) => { const o = cerchio(x + u * 9 * s, y + v * 9 * s, (fine ? 6 : 7.5) * s, (fine ? 6 : 7.5) * s, q(0, 1), fine ? 8 : 6); occ.push(o); righe.push(riga(o, ORO, 0.9)); });
    return { occ, righe }; };
  // il legno vecchio: come ramo() ma nodoso, col piede piatto e la corteccia a tratti, più fitta a destra (il lato in ombra)
  const ceppo = (pts, w0, w1, piede = 0, corteccia = true) => {
    const s = liscia(pts, false, 8), n = s.length - 1, f1 = q(0, 6), f2 = q(0, 6), sx = [], dx2 = [];
    const nor = s.map((p, i) => { const a = s[Math.max(0, i - 1)], b = s[Math.min(n, i + 1)], l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [-(b[1] - a[1]) / l, (b[0] - a[0]) / l]; }), larga = (i) => (w0 + (w1 - w0) * (i / n)) * (1 + piede * Math.max(0, 1 - i / 5) ** 2);
    s.forEach((p, i) => { const w = larga(i), a = w * (1 + 0.2 * Math.sin(i * 0.95 + f1)), b = w * (1 + 0.2 * Math.sin(i * 0.75 + f2)); sx.push([p[0] + nor[i][0] * a, p[1] + nor[i][1] * a]); dx2.push([p[0] - nor[i][0] * b, p[1] - nor[i][1] * b]); });
    if (piede) for (const l of [sx, dx2]) for (let i = 0; i < 4; i++) l[i][1] = Math.min(l[i][1], pts[0][1]);
    const righe = [riga(sx, INK, 1.2), riga(dx2, INK, 1.2)], destra = nor[n >> 1][0] > 0 ? 1 : -1;
    if (piede) righe.push(riga([sx[0], dx2[0]], INK, 1));
    for (let i = 1; i < n - 2; i += 2) { const o = destra * q(-0.35, 0.8) * larga(i), l = Math.min(n, i + 2 + Math.round(q(0, 2))), o2 = o + q(-1, 1); if (corteccia) righe.push(riga([[s[i][0] + nor[i][0] * o, s[i][1] + nor[i][1] * o], [s[l][0] + nor[l][0] * o2, s[l][1] + nor[l][1] * o2]], INK, 0.5)); }
    return { occ: [...sx, ...dx2.slice().reverse()], righe };
  };
  // l'alberello: tronco che si apre a forca in due braccia, le foglie in cima sui tralci, i grappoli d'oro che pendono. Alto circa 150, base in 0,0. fine = col dettaglio (venature, corteccia, viticci): solo per quelli grandi
  const alberello = (fine = true) => {
    const F = [q(-9, 9), -q(46, 56)], sp = F[0] < 0 ? 1 : -1, sciolte = [], legno = [], foglie = [], grappoli = [];
    legno.push(ceppo([[q(-2, 2), 0.5], [F[0] * 0.3 + sp * q(3, 6.5), -17], [F[0] * 0.9 - sp * q(1, 4), -34], F], 9.5, 6.6, 0.28, fine));
    for (const lato of [-1, 1]) {
      const C = [F[0] + lato * q(27, 38), F[1] - q(26, 40)], M = [F[0] + lato * q(15, 21), F[1] - q(4, 10)];
      legno.push(ceppo([F, M, C], 5.8, 3.4, 0, fine));
      [[[lato * q(6, 14), -q(17, 25)], [lato * q(-4, 12), -q(40, 52)], 3], [[lato * q(13, 20), -q(10, 17)], [lato * q(30, 42), -q(8, 22)], 2]].forEach(([m, e, n], k) => {
        const t = liscia([C, [C[0] + m[0], C[1] + m[1]], [C[0] + e[0], C[1] + e[1]]], false, 4); sciolte.push(riga(t, INK, 0.9));
        for (let i = 0; i < n; i++) { const j = Math.round(((i + 0.8) / n) * (t.length - 1)), p = t[Math.min(t.length - 1, j)], a = t[Math.max(0, j - 1)], dir = Math.atan2(p[1] - a[1], p[0] - a[0]); foglie.push([p[1], fogliaL(p[0], p[1], dir + (i % 2 ? -1 : 1) * lato * q(0.7, 1.25) * (i === n - 1 ? 0.3 : 1), q(24, 31) * (1 - 0.22 * (i / n)), fine)]); }
        if (k && fine) { const p = t.at(-1), v = []; for (let i = 0; i < 12; i++) { const u = i / 11, g = (1 - u * 0.8) * 5, b = u * 8; v.push([p[0] + lato * u * 12 + Math.cos(b) * g * u, p[1] - u * 6 + Math.sin(b) * g * u]); } sciolte.push(riga(v, INK, 0.6)); }
      });
      foglie.push([C[1] + 30, fogliaL(C[0] - lato * 3, C[1] - 3, Math.PI / 2 - lato * q(0.5, 1), q(20, 25), fine)]);
      if (lato < 0 || q(0, 1) < 0.45) { const u = q(0.45, 0.8), gx = F[0] + (M[0] - F[0]) * u * 1.4, gy = F[1] + (M[1] - F[1]) * u, sc = q(0.56, 0.7); grappoli.push(uva(gx, gy + 26 * sc, sc, fine)); }
    }
    sciolte.push(riga([[-24, 2], [-9, 3.5]], TENUE, 0.6), riga([[10, 3.5], [27, 2]], TENUE, 0.6));
    foglie.sort((a, b) => a[0] - b[0]);
    return [...sciolte, ...legno, ...foglie.map((f) => f[1]), ...grappoli];
  };
  // il muretto a secco lungo L: corsi di altezze diverse, pietre grosse su due corsi, giunti storti, le pietre di copertina, l'erba al piede. Base in y = 0, da x = 0
  const muretto = (L) => {
    const y0 = [0]; [12.5, 9, 11.5, 8.5, 10.5].forEach((h) => y0.push(y0.at(-1) - h - q(-1, 1)));
    const N = y0.length - 1, top = y0[N], righe = [], corso = (y, amp) => { const p = []; for (let x = 0; x < L; x += 12) p.push([x, y + (x ? q(-amp, amp) : 0)]); p.push([L, y]); return p; };
    const ys = y0.map((y, i) => corso(y, i ? 2.3 : 0.5)), alt = (i, x) => { const p = ys[i], k = Math.max(0, Math.min(p.length - 2, Math.floor(x / 12))), t = (x - p[k][0]) / (p[k + 1][0] - p[k][0]); return p[k][1] + (p[k + 1][1] - p[k][1]) * t; };
    const grosse = ys.map((_, i) => { const g = []; if (i > 0 && i < N) for (let x = q(20, 130); x < L - 44; x += q(90, 230)) g.push([x, x + q(17, 32)]); return g; }), dentro = (i, x) => (grosse[i] || []).some(([a, b]) => x > a - 3 && x < b + 3);
    const tratto = (i, da, a) => [[da, alt(i, da)], ...ys[i].filter((u) => u[0] > da && u[0] < a), [a, alt(i, a)]];
    righe.push(riga(ys[0], INK, 1));
    for (let i = 1; i <= N; i++) { let da = 0; for (const [a, b] of grosse[i]) { righe.push(riga(tratto(i, da, a), INK, 0.85)); da = b; for (const x of [a, b]) righe.push(riga([[x, alt(i - 1, x)], [x + q(-2, 2), alt(i + 1, x)]], INK, 0.6)); } righe.push(riga(tratto(i, da, L), INK, 0.85)); }
    for (let i = 0; i < N; i++) for (let x = q(4, 22); x < L - 4; x += q(10, 31)) { if (dentro(i, x) || dentro(i + 1, x)) continue; const d = q(-3.5, 3.5); righe.push(riga([[x, alt(i, x)], [x + d, alt(i + 1, x + d)]], INK, 0.6)); }
    for (let x = q(10, 40); x < L - 20; x += q(26, 60)) { const i = Math.floor(q(0, N)), y = (alt(i, x) + alt(i + 1, x)) / 2 + q(-1.5, 1.5); righe.push(riga([[x, y], [x + q(5, 11), y + q(-1, 1)]], TENUE, 0.5)); }
    const cima = [[0, top]], pietre = [];
    for (let x = 0; x < L;) { const w = Math.min(L - x, q(13, 34)), h = q(4.5, 9.5), p = liscia([[x, top], [x + w * q(0.1, 0.26), top - h], [x + w * q(0.7, 0.9), top - h * q(0.65, 1.1)], [x + w, top]], false, 3); cima.push(...p.slice(1)); pietre.push(p); x += w; }
    righe.push(riga(cima, INK, 1.1));
    for (let x = q(10, 50); x < L - 10; x += q(46, 110)) for (const a of [-0.5, 0, 0.45]) righe.push(riga([[x + a * 5, 0], [x + a * 14 + q(-1, 1), -q(6, 11)]], INK, 0.6));
    return { occ: [[[0, 0], [L, 0], [L, top], [0, top]], ...pietre], righe };
  };
  // la pajara di pietra: tronco di cono a corsi, un gradone verso la cima, la porticina bassa e buia. Base in 0,0, alta circa 110
  const pajaraPietra = () => {
    const H = 104, GR = 0.72, hw = (t) => (t < GR ? 78 - 32 * (t / GR) : 40 - 10 * ((t - GR) / (1 - GR))), fianco = (s) => [[s * 78, 0], [s * (62 + q(-1, 1)), -H * GR * 0.5], [s * 46, -H * GR], [s * 40, -H * GR], [s * 30, -H]];
    const sag = [...fianco(-1), ...liscia([[-30, -H], [-12, -H - 6], [12, -H - 6], [30, -H]], false, 3).slice(1, -1), ...fianco(1).reverse()], righe = [riga(chiudi(sag), INK, 1.1)];
    for (let y = -8.5; y > -H; y -= q(7.5, 9.5)) { const w = hw(-y / H) - 1.5, p = []; for (let x = -w; x < w; x += 10) p.push([x, y + q(-1, 1)]); p.push([w, y]); righe.push(riga(p, INK, 0.85)); for (let x = -w + q(3, 12); x < w - 3; x += q(9, 20)) righe.push(riga([[x, y], [x + q(-2, 2), y + q(7, 8.4)]], INK, 0.6)); }
    righe.push(...tratteggio([[26, 0], [78, 0], [46, -H * GR], [40, -H * GR], [30, -H], [14, -H]], -1.05, 5, INK, 0.5));
    const porta = arcoP(-8, 0, 20, 30, 8);
    return [{ occ: sag, righe }, { occ: porta, righe: [riga(porta, INK, 1.1), ...tratteggio(porta.slice(0, -1), -1, 2.4, INK, 0.85), riga([[-22, -33], [6, -33.5]], INK, 0.9)] }];
  };
  // la chioma dell'ulivo a foglie piccole: lungo il ramo tante foglioline a lancetta, fitte, e qualche oliva
  const chiomaFine = (pts, w0, seg, da = 0) => { const fo = [], c = liscia(pts, false, 8), base = pts.at(-1)[0] > pts[0][0] ? 0.4 : Math.PI - 0.4, n = seg * 3;
    for (let i = 0; i < n; i++) { const [x, y] = c[Math.round((da + ((1 - da) * (i + 0.5)) / n) * (c.length - 1))];
      for (const s of [-1, 1]) fo.push(foglioline(x + q(-3, 3), y + q(-3, 3), base + s * q(0.5, 1.25), q(16, 24), q(3.2, 4.4)));
      if (i % 2) fo.push(foglioline(x, y, base + q(-0.35, 0.35), q(14, 20), q(3, 4)));
      if (i % 6 === 3) { const o = cerchio(x + q(-4, 4), y + q(8, 13), 3.2, 4.2, 0, 10); fo.push({ occ: o, righe: [riga(o, INK, 0.9)] }); } }
    return [ramo(pts, w0, 1.2), ...fo]; };
  // un disegno fatto in 0,0 messo al suo posto: spostato, scalato, specchiato
  const sposta = (c, x, y, s = 1, sp = 1) => { const P = ([u, v]) => [x + u * s * sp, y + v * s], L = (l) => riga(l.pts.map(P), l.c, l.w);
    return Array.isArray(c) ? c.map((u) => sposta(u, x, y, s, sp)) : c.righe ? { occ: c.occ && (typeof c.occ[0][0] === 'number' ? c.occ.map(P) : c.occ.map((o) => o.map(P))), righe: c.righe.flat(Infinity).map(L) } : L(c); };

  /* ---- gruppi: linee e fondi insieme, x relativa al centro della tappa t ---- */
  const els = [];
  const G = (t, cose, o = {}) => {
    const lista = cose.flat(Infinity).filter(Boolean), righe = [], occ = new Path2D(); let haOcc = false;
    lista.forEach((c) => { if (c.righe) { righe.push(...c.righe.flat(Infinity)); if (c.occ) { const q = typeof c.occ[0][0] === 'number' ? [c.occ] : c.occ; q.forEach((pp) => { pp.forEach(([x, y], i) => occ[i ? 'lineTo' : 'moveTo'](x, y)); occ.closePath(); }); haOcc = true; } } else righe.push(c); });
    const xs = righe.flatMap((q) => q.pts.map((p) => p[0])), mappa = new Map();
    righe.forEach((q) => { const k = `${q.c}|${q.w}`; if (!mappa.has(k)) mappa.set(k, { c: q.c, w: q.w, p: new Path2D() }); mappa.get(k).p.addPath(q.p); });
    const e = { t, f: 1, righe, unite: [...mappa.values()], occ: haOcc ? occ : null, x0: xs.length ? Math.min(...xs) : -1500, x1: xs.length ? Math.max(...xs) : 1500, rev: 0, ...o };
    if (e.vento) Object.assign(e, { s: 0, v: 0, ph: r(0, 6) });
    els.push(e); return e;
  };
  // 11 nov: un gruppo dipinto elemento per elemento, ognuno col suo fondo: copre quelli prima (le foglie di una vite si coprono fra loro, una vite copre quella dietro)
  const Gs = (t, cose, o = {}) => { const e = G(t, cose, o); e.sub = cose.flat(Infinity).filter(Boolean).map((c) => { const righe = c.righe ? c.righe.flat(Infinity) : [c], mappa = new Map(); let occ = null;
    if (c.occ) { occ = new Path2D(); (typeof c.occ[0][0] === 'number' ? [c.occ] : c.occ).forEach((pp) => { pp.forEach(([x, y], i) => occ[i ? 'lineTo' : 'moveTo'](x, y)); occ.closePath(); }); }
    righe.forEach((l) => { const k = `${l.c}|${l.w}`; if (!mappa.has(k)) mappa.set(k, { c: l.c, w: l.w, p: new Path2D() }); mappa.get(k).p.addPath(l.p); });
    return { occ, unite: [...mappa.values()] }; }); return e; };
  const fermo = (fn) => { const s = seme, v = fn(); seme = s; return v; }; // 11 nov: quello che si aggiunge non consuma il caso comune: le tappe dopo restano uguali all'originale

  /* ---- il mondo, dal più lontano. Ogni scena sta nella sua larghezza di schermo (half = mezzo schermo in unità) e tutte condividono un solo orizzonte O: niente fondi che tagliano, le linee finiscono da sole ---- */
  const COL = (f, y, amp, wl, ph, c, w, righe = 0) => { const X1 = XE * f + half * 2, base = []; for (let x = -half * 2; x <= X1; x += 30) base.push([x, y - amp * (0.5 + 0.5 * Math.sin(x / wl + ph)) - amp * 0.26 * Math.sin(x / (wl * 0.37) + ph)]); const out = [riga(base, c, w)]; for (let k = 1; k <= righe; k++) { let a = -half * 2 + r(0, 300); while (a < X1) { const l = r(120, 420), q = base.filter(([x]) => x >= a && x < a + l).map(([x, yy]) => [x, yy + k * 7 + 2 * Math.sin(x / 90)]); if (q.length > 1) out.push(riga(q, c, w * 0.7)); a += l + r(60, 240); } } return G(0, out, { f, largo: 1 }); };
  // nuvole: pochi tratti lunghi, sottili, che scorrono
  const cirro = (x, y, l) => { const out = []; for (let i = 0; i < 4; i++) { const a = x + r(-30, 60), b = a + l * r(0.5, 1), yy = y + i * r(7, 11); const q = []; for (let u = a; u <= b; u += 14) q.push([u, yy + Math.sin(u / 44 + i) * 3.2]); out.push(riga(q, TENUE, 0.8)); } return out; };
  for (let x = -half; x < XE * 0.2 + half * 2.4; x += 620) G(0, cirro(x, r(20, O * 0.34), r(160, 300)), { f: 0.2, deriva: 5, largo: 1 });
  COL(0.34, O - 40, 42, 520, 1.2, TENUE, 0.9, 2); COL(0.58, O - 6, 28, 390, 3.2, TENUE, 1, 1);
  G(0, [riga(Array.from({ length: Math.ceil((XE + half * 3) / 60) }, (_, i) => [-half * 1.4 + i * 60, O + 2 * Math.sin(i * 0.7)]), INK, 1)], { largo: 1 });

  // apertura: la masseria con i merli, la torre con la corona del logo, il portale d'oro, i filari. Sta a sinistra: da destra arriva già la prima bottiglia
  { const hL = -half, hR = half * (m0 ? 0.62 : 0.26), cH = (hL + hR) / 2, wB = (hR - hL) * 0.44, B = O + (m0 ? 60 : 70), hB = m0 ? 110 : 170, top = B - hB, tx = m0 ? 52 : 74, tTop = top - (m0 ? 60 : 110), k = tx / 74, out = [], occ = [], x0 = cH - wB, x1 = cH + wB;
    const merli = (a, b, y, p0 = 34) => { const n = Math.round((b - a) / p0), p = (b - a) / n, q = [[a, y]]; for (let i = 0; i < n; i++) { const x = a + i * p; q.push([x, y - 16], [x + p / 2, y - 16], [x + p / 2, y], [x + p, y]); } return q; }; // tanti merli quanti ne stanno esatti: sforando, il muro tornava giù in diagonale
    occ.push([[x0, B], [x0, top], [x1, top], [x1, B]]);
    // le mura finiscono contro la torre: merli e cornice a sinistra e a destra, non sulla facciata della torre
    out.push(riga([[x0, B], ...merli(x0, cH - tx, top)], INK, 1.3), riga([...merli(cH + tx, x1, top), [x1, B]], INK, 1.3),
      riga([[x0, top + 16], [cH - tx, top + 16]], INK, 0.7), riga([[cH + tx, top + 16], [x1, top + 16]], INK, 0.7), riga([[x0, B], [x1, B]], INK, 1));
    const fin = m0 ? [-2, -1, 1, 2] : [-3, -2, -1, 1, 2, 3];
    for (const i of fin) { const x = cH + i * (wB / (m0 ? 2.6 : 3.6)), f = arcoP(x, top + hB * 0.5, 30 * k, 54 * k, 8); out.push(riga(f, INK, 1), ...tratteggio(f.slice(0, -1), 1.1, 4, INK, 0.5)); out.push(riga(arcoP(x, B - 6, 40 * k, 64 * k, 8), INK, 0.9)); }
    for (let i = 0; i < (m0 ? 44 : 90); i++) { const x = r(x0 + 8, x1 - 60), y = r(top + 26, B - 8); if (Math.abs(x - cH) > tx + 40) out.push(riga([[x, y], [x + r(14, 44), y]], TENUE, 0.6)); }
    out.push(...tratteggio([[x1 - wB * 0.22, top + 16], [x1, top + 16], [x1, B], [x1 - wB * 0.22, B]], -1, 7, INK, 0.5));
    occ.push([[cH - tx, B], [cH - tx, tTop], [cH + tx, tTop], [cH + tx, B]]);
    const cor = [[0, 0.53], [17.69, 13.2], [30.02, 0.34], [42.35, 13.2], [60.05, 0.53], [60.05, 23.31], [0, 23.31]].map(([a, c]) => [cH + (a - 30.025) * ((tx * 2) / 60.05), tTop - 8 - (23.31 - c) * 2.5 * k]); occ.push(cor);
    out.push(riga([[cH - tx, B], [cH - tx, tTop], [cH + tx, tTop], [cH + tx, B]], INK, 1.3), riga(chiudi(cor), INK, 1.3), ...tratteggio([[cH + tx * 0.4, tTop], [cH + tx, tTop], [cH + tx, B], [cH + tx * 0.4, B]], -1, 6, INK, 0.5));
    for (let i = 0; i < 16; i++) { const x = cH + r(-tx + 6, tx * 0.2), y = r(tTop + 8, B - 8); if (Math.abs(x - cH) > 48 * k || y < B - 136 * k) out.push(riga([[x, y], [x + r(10, 24), y]], TENUE, 0.6)); }
    const porta = arcoP(cH, B, 66 * k, 118 * k, 12); out.push(riga(arcoP(cH, B, 84 * k, 130 * k, 12), INK, 1), riga(porta, ORO, 1.5), riga([[cH, B], [cH, B - 118 * k]], ORO, 1), ...tratteggio(porta.slice(0, -1), 1.57, 8, ORO, 0.7));
    for (const q of [-1, 1]) out.push(riga(arcoP(cH + q * 38 * k, tTop + 58 * k, 22 * k, 44 * k, 8), INK, 1));
    const FC = 0.86; // 11 nov: il casale scorre un po' più piano dei filari davanti: camminando (e col cursore) i piani si staccano
    G(0, [{ occ, righe: out }], { f: FC });
    // i filari che vengono incontro
    const rows = []; for (const q of [-1, 1]) for (const a of [90, 210, 380, 620, 960]) { const xE = cH + q * a * (half / 775) * 1.1; if (xE < hL - 40 || xE > hR + 40) continue; rows.push(riga([[cH + (xE - cH) * 0.14, B], [xE, 640]], INK, 0.8)); for (let t = 0.2; t < 1; t += 0.11) { const u = t ** 1.5, yy = B + (640 - B) * u, xx = cH + (xE - cH) * (0.14 + 0.86 * u), s = 0.25 + u; rows.push(foglioline(xx, yy - 2, -1.57 + r(-0.9, 0.9), 22 * s, 5 * s), foglioline(xx, yy - 3, -1.57 + r(-0.9, 0.9), 18 * s, 4 * s)); } }
    // 11 nov: al posto delle righe con le foglioline (rows si calcola lo stesso, per non spostare il caso) filari di alberelli veri, a fasce di profondità: quelle davanti scorrono più svelte
    fermo(() => { const NF = 8, fasce = Array.from({ length: NF }, () => []);
      for (const lt of [-1, 1]) for (const a of [90, 210, 380, 620, 960]) { const xE = cH + lt * a * (half / 775) * 1.1; if (xE < hL - 40 || xE > hR + 40) continue;
        for (let i = 0; i < NF; i++) { const u = ((i + 0.6) / NF) ** 1.5, yy = B + (640 - B) * u, sc = (m0 ? 0.5 : 0.7) * ((yy - O) / (640 - O)); /* più grandi venendo avanti, come la terra in prospettiva; la misura massima è la stessa anche sul telefono, dove l'orizzonte è più in alto */ const xx = cH + (xE - cH) * (0.14 + 0.86 * u); if (Math.abs(xx - cH) > (m0 ? 18 : 30) + sc * (m0 ? 70 : 90)) fasce[i].push(sposta(alberello(sc > 0.36), xx, yy, sc, q(0, 1) < 0.5 ? -1 : 1)); } } // davanti al portone il passaggio resta libero
      fasce.forEach((v, i) => Gs(0, v, { f: FC + (1.18 - FC) * ((i + 0.6) / NF), vento: { bx: cH, by: B + (640 - B) * ((i + 0.6) / NF) ** 1.5, h: 60 } })); });
    const cA = x0 - 44, cB = x1 + 40; G(0, [cipresso(cA, B + 2, 210 * k + 20), cipresso(cA - 62, B + 2, 150 * k + 20)], { f: FC, vento: { bx: cA, by: B, h: 210 } }); G(0, [cipresso(cB, B + 2, 230 * k + 20)], { f: FC, vento: { bx: cB, by: B, h: 230 } });
  }

  // tappa 1: la vecchia vite ad alberello, enorme, sopra le bottiglie
  { const t = 1, F = m0 ? 0.72 : 1;
    G(t, [ramo([[20, 660], [-20, 520], [34, 400], [-16, 290], [10, 210]], 30, 15)]);
    // tutto sta sul ramo: u = dove lungo il ramo (0 al tronco, 1 in punta), a = verso dove punta la foglia. Le coordinate fisse lasciavano foglie e grappoli sospesi
    const braccio = (pts, w0, foglie, grappoli) => { const c = liscia(pts, false, 8), sul = (u) => c[Math.round(u * (c.length - 1))]; G(t, [ramo(pts, w0, 1), ...foglie.map(([u, a, s]) => fogliaVite(...sul(u), a, s * F)), ...grappoli.map(([u, s]) => { const [x, y] = sul(u); return grappolo(x - 3 * s * F, y + 26 * s * F, s * F); }), ...foglie.filter((_, i) => i % 2).map(([u]) => { const [x, y] = sul(u); return viticcio(x, y, r(0.4, 2.6), 1); })], { vento: { bx: pts[0][0], by: pts[0][1], h: 220 } }); };
    braccio([[0, 240], [lato(-160), 190], [lato(-340), 170], [lato(-540), 96], [lato(-690), 66]], 13, [[0.16, -2.1, 54], [0.28, 2.5, 56], [0.4, -1.8, 62], [0.5, 2.7, 58], [0.62, -2.2, 56], [0.74, 2.9, 52], [0.86, -1.5, 50], [1, -2.8, 48]], [[0.34, 1.1], [0.68, 1.15]]);
    // 11 nov: il tralcio continua, sottile, verso il centro del primo schermo (prima il cielo a sinistra del sole era vuoto); si muove insieme al braccio da cui nasce
    if (!m0) { const madre = els.at(-1); fermo(() => { const pts = [[lato(-690), 66], [lato(-790), 50], [lato(-900), 68], [lato(-985), 98]], c = liscia(pts, false, 8), sul = (u) => c[Math.round(u * (c.length - 1))], g = sul(0.5);
      G(t, [ramo(pts, 1.8, 0.8), ...[[0.22, 2.6, 46], [0.42, -2.0, 44], [0.62, 2.8, 42], [0.82, -1.7, 40], [1, -2.9, 38]].map(([u, an, sc]) => fogliaVite(...sul(u), an, sc)), grappolo(g[0] - 3, g[1] + 26, 1), viticcio(...sul(1), 2.4, 1)], { vento: { bx: 0, by: 240, h: 220 } }).ph = madre.ph; }); }
    braccio([[10, 230], [lato(180), 170], [lato(360), 150], [lato(590), 80], [lato(720), 50]], 13, [[0.16, -1, 54], [0.28, 0.6, 56], [0.4, -1.3, 62], [0.5, 0.4, 58], [0.62, -0.9, 56], [0.74, 0.2, 52], [0.86, -1.7, 50], [1, -0.3, 48]], [[0.34, 1.15], [0.68, 1.1]]);
    braccio([[6, 230], [-30, 150], [24, 76], [-10, 18]], 10, [[0.5, -2.4, (56 / F) * 0.9], [0.76, -0.7, (54 / F) * 0.9], [1, -1.6, (50 / F) * 0.9]], []);
  }

  // tappa 2: i filari sulla terra rossa, la pajara, il muretto a secco
  { const t = 2, out = [], viti = [], R2 = () => (seme2 = (seme2 * 16807) % 2147483647) / 2147483647; let seme2 = 7;
    for (let a = -9; a <= 9; a++) { const xb = (a / 9) * half; out.push(riga([[xb * 0.1, O + 3], [xb, 660]], TERRA, 0.9)); if (a % 2 === 0) for (let k = 0; k < 7; k++) { const u = (k + 0.4) / 7, q = u ** 1.6, x = xb * (0.1 + 0.9 * q), y = O + (660 - O) * q, s = 0.2 + q * 0.75; viti.push([y, x, s]); } }
    G(t, out);
    // 11 nov: nei filari alberelli veri al posto dei tre fili con le foglioline, i lontani dietro
    viti.sort((a, b) => a[0] - b[0]); Gs(t, viti.map(([y, x, s]) => sposta(alberello(s > 0.6), x, y, s * 0.4, R2() < 0.5 ? -1 : 1)));
    pajara(lato(590), O + 8, m0 ? 0.72 : 1); G(t, sposta(pajaraPietra(), lato(590), O + 8, (m0 ? 0.72 : 1) * 1.5)); // 11 nov: la pajara di pietra (quella di prima si calcola lo stesso: consuma il caso come nell'originale)
    Gs(t, sposta(alberello(true), lato(-610), O + 6, m0 ? 0.8 : 1.1), ((() => { const x = lato(-610), b = O + 6, s = m0 ? 0.8 : 1.1, ar = []; [[-44, -128], [-6, -152], [38, -130]].forEach(([u, v]) => { for (let i = 0; i < 5; i++) { const a = r(0, TAU); ar.push(foglioline(x + (u + Math.cos(a) * 8) * s, b + (v + Math.sin(a) * 6) * s, a, 30 * s, 9 * s)); } }); return [ramo([[x + 2, b + 2], [x - 5 * s, b - 50 * s], [x + 4 * s, b - 100 * s]], 8 * s, 4 * s), ramo([[x + 4 * s, b - 96 * s], [x - 42 * s, b - 126 * s]], 3.4 * s, 1.2), ramo([[x + 4 * s, b - 96 * s], [x + 36 * s, b - 126 * s]], 3.4 * s, 1.2), ...ar, grappolo(x - 20 * s, b - 88 * s, 0.7 * s), grappolo(x + 26 * s, b - 88 * s, 0.7 * s)]; })(), { vento: { bx: lato(-610), by: O, h: 150 } })); // 11 nov: l'alberello nuovo; la vite di prima si calcola e si butta
    mur(-half, lato(-300)); mur(lato(300), half); for (const [a, b] of [[-half, lato(-300)], [lato(300), half]]) G(t, [sposta(muretto((b - a) / 1.5), a, 620, 1.5)]); // 11 nov: il muretto a secco nuovo
  }

  // tappa 3: il campo, due ulivi ai lati con i rami in alto, papaveri e spighe che si muovono
  { const t = 3;
    for (let a = 0; a < (m0 ? 26 : 56); a++) { const x = r(-half, half), y = r(O + 10, 640); G(t, [riga([[x, y], [x + r(-10, 10), y - r(10, 22)]], TENUE, 0.7)]); }
    // due ulivi ai lati della tappa: i rami in alto partono da un tronco vero, come la vite della tappa 1, e non dal vuoto
    const sg = m0 ? 9 : 15, F = m0 ? 0.62 : 1;
    [[-1, -90, 96], [1, 120, 86]].forEach(([q, punta, py]) => { // q: da che parte sta l'ulivo; dentro = verso il centro della tappa
      const x = q * half * 0.92, Y = (u, y) => [x + q * u * F, y], cima = Y(4, 214), a = -q; // cima del tronco: da qui partono i rami
      G(t, [ramo([Y(8, 660), Y(-20, 540), Y(16, 420), Y(-10, 310), Y(6, 200)], 26 * F, 13 * F)]);
      const bosco = (pts, w0, n, da) => { chioma(pts, w0, n, da); return G(t, chiomaFine(pts, w0, n, da), { vento: { bx: cima[0], by: cima[1], h: 200 } }); }; // 11 nov: foglie piccole e fitte al posto di quelle grandi
      bosco([cima, [x + a * half * 0.09, 112], [x + a * half * 0.3, 62], [x + a * half * 0.58, 70], [lato(punta), py]], 9 * F, sg, 0.28); // il ramo lungo, verso le bottiglie
      bosco([cima, [x + q * half * 0.08, 120], [x + q * half * 0.2, 58], [x + q * half * (m0 ? 0.26 : 0.34), 66]], 7 * F, m0 ? 3 : 6, 0.4); // verso la tappa accanto
      bosco([cima, Y(-14, 130), Y(10, 60), Y(-6, 4)], 7 * F, m0 ? 3 : 4, 0.35); // in su
    });
    for (let i = 0; i < (m0 ? 26 : 44); i++) { const q = i % 2 ? 1 : -1, x = q * r(half * (m0 ? 0.54 : 0.36), half), b = r(590, 660), s = r(0.75, 1.3); G(t, [papavero(x, b, r(130, 260) * s, s), R() < 0.5 ? foglioline(x, b - 30, -1.57 + r(-0.8, 0.8), 40, 7) : null], { vento: { bx: x, by: b, h: 200 } }); }
  }

  // tappa 4: il mare a linee che si muovono, la barca, la torre costiera
  { const t = 4, Cx = lato(600), q0 = m0 ? 0.62 : 1;
    G(t, [riga([[0, 0], [0, 0]], INK, 1)], { x0: -half, x1: half, dyn: () => {
      ctx.strokeStyle = INK;
      for (let i = 0; i < 18; i++) { const q = i / 17, y = O + 6 + (640 - O) * q ** 1.55, a = 2 + q * 7, wl = 90 + q * 260, sp = 0.5 + q * 0.7; ctx.lineWidth = (0.6 + q * 0.55) / U; ctx.setLineDash([120 + q * 420, 30 + q * 120]); ctx.lineDashOffset = -tempo * (8 + q * 20) + i * 73; ctx.beginPath(); for (let x = -half; x <= half; x += 20) { const yy = y + Math.sin(x / wl + tempo * sp + i * 1.3) * a; x === -half ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy); } ctx.stroke(); } ctx.setLineDash([]);
    } });
    const B = O + 2, a = 62 * q0, tt = B - 180 * q0, q = [[Cx - a - 12, B], [Cx - a, B - 70 * q0], [Cx - a, tt], [Cx + a, tt], [Cx + a, B - 70 * q0], [Cx + a + 12, B]], ca = liscia([[Cx - half * 0.46, B + 4], [Cx - 200 * q0, B - 14], [Cx - 90 * q0, B - 4], [Cx + 110 * q0, B - 2], [half + 40, B - 22]], false, 6), me = []; for (let i = 0; i < 5; i++) me.push(riga(chiudi([[Cx - a + (i * a) / 2.2, tt], [Cx - a + (i * a) / 2.2, tt - 14 * q0], [Cx - a + (i * a) / 2.2 + 14 * q0, tt - 14 * q0], [Cx - a + (i * a) / 2.2 + 14 * q0, tt]]), INK, 1));
    G(t, [riga(ca, INK, 1), { occ: q, righe: [riga(q, INK, 1.2), riga([[Cx - a, B - 70 * q0], [Cx + a, B - 70 * q0]], INK, 0.8), ...me, riga(arcoP(Cx, B, 34 * q0, 50 * q0, 8), ORO, 1.3), ...tratteggio([[Cx + a * 0.26, tt], [Cx + a, tt], [Cx + a, B - 2], [Cx + a * 0.26, B - 2]], -1, 6, INK, 0.5), riga(arcoP(Cx - a * 0.35, tt + 58 * q0, 16 * q0, 30 * q0, 6), INK, 0.9)] }]);
    const Bx = lato(-560), By = O + (m0 ? 30 : 42), k = m0 ? 0.74 : 1; G(t, [{ occ: [[Bx - 72 * k, By - 6 * k], [Bx + 82 * k, By - 8 * k], [Bx + 54 * k, By + 20 * k], [Bx - 52 * k, By + 20 * k]], righe: [riga(chiudi([[Bx - 72 * k, By - 6 * k], [Bx + 82 * k, By - 8 * k], [Bx + 54 * k, By + 20 * k], [Bx - 52 * k, By + 20 * k]]), INK, 1.2), riga([[Bx - 62 * k, By + 4 * k], [Bx + 70 * k, By + 2 * k]], INK, 0.6)] }, riga([[Bx + 2 * k, By - 8 * k], [Bx + 2 * k, By - 138 * k]], INK, 1.1), { occ: [[Bx + 8 * k, By - 14 * k], [Bx + 8 * k, By - 132 * k], [Bx + 76 * k, By - 20 * k]], righe: [riga(chiudi([[Bx + 8 * k, By - 14 * k], [Bx + 8 * k, By - 132 * k], [Bx + 76 * k, By - 20 * k]]), INK, 1), ...tratteggio([[Bx + 8 * k, By - 14 * k], [Bx + 8 * k, By - 132 * k], [Bx + 76 * k, By - 20 * k]], 0.2, 9, INK, 0.45)] }, { occ: [[Bx - 4 * k, By - 14 * k], [Bx - 4 * k, By - 100 * k], [Bx - 50 * k, By - 18 * k]], righe: [riga(chiudi([[Bx - 4 * k, By - 14 * k], [Bx - 4 * k, By - 100 * k], [Bx - 50 * k, By - 18 * k]]), INK, 1)] }], { barca: { bx: Bx, by: By } });
  }

  // tappa 5 e la tavola: la pergola, le lampadine, la vite che pende
  for (const t of [5, TV]) { const top = 44, Px = half * (m0 ? 0.92 : 0.8), out = [], fili = [], lamp = [], F = m0 ? 0.74 : 1, A = t === 5 ? -Px - 30 : -half, B = t === 5 ? half : Px + 30, fine = t === 5 ? A : B; // la trave finisce poco oltre il palo sul lato esterno; tra le due tappe resta continua
    for (const x of [-Px, Px]) out.push(ramo([[x - 4, 660], [x + 4, 400], [x - 2, 200], [x, top]], 8, 6));
    out.push(riga([[A, top - 8], [B, top - 8]], INK, 1.2), riga([[A, top + 6], [B, top + 6]], INK, 1.2), riga([[fine, top - 8], [fine, top + 6]], INK, 1.2));
    for (let x = A; x < B; x += 100) out.push(riga([[x, top - 14], [x + 22, top + 14]], INK, 0.7));
    [[-Px, 0], [0, Px]].forEach(([a, b]) => { const c = Array.from({ length: 25 }, (_, i) => { const u = i / 24; return [a + (b - a) * u, top + 16 + 128 * 4 * u * (1 - u) * (m0 ? 0.56 : 0.72)]; }); fili.push(riga(c, INK, 0.8)); for (let i = 2; i < 24; i += 3) lamp.push([c[i][0], c[i][1] + 9]); });
    G(t, [out, fili]);
    const fg = []; for (let i = 0; i < (m0 ? 11 : 24); i++) { const u = (i + 0.5) / (m0 ? 11 : 24); fg.push(fogliaVite(A + u * (B - A) + r(-16, 16), top + r(2, 24), 1.57 + r(-0.9, 0.9), r(38, 54) * F)); } for (let i = 0; i < (m0 ? 3 : 6); i++) fg.push(grappolo(-Px * 0.86 + ((i + 0.5) / (m0 ? 3 : 6)) * Px * 1.72, top + r(56, 70), 0.9 * F));
    G(t, fg, { vento: { bx: 0, by: top, h: 200 }, cima: 1 });
    G(t, [riga([[0, 0], [0, 0]], INK, 1)], { x0: -half, x1: half, dyn: () => lamp.forEach(([x, y], i) => { const a = 0.55 + 0.45 * Math.sin(tempo * 1.6 + i * 1.7); ctx.globalAlpha = a; ctx.fillStyle = '#d9b76a'; ctx.beginPath(); ctx.arc(x, y, 5, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; ctx.strokeStyle = tono(INK); ctx.lineWidth = 0.8 / U; ctx.beginPath(); ctx.arc(x, y, 5.5, 0, TAU); ctx.stroke(); }) });
  }

  /* ---- la tavola: i piatti incisi, in unità di raggio 100: bordo d'oro e al centro quello che si mangia. Le linee da 0,8 in su vanno anche nelle miniature del ripiano ---- */
  const TR = (p, c = INK, w = 1.1) => riga(liscia(p, false, 8), c, w), CH = (p, c = INK, w = 1.1) => riga(liscia(p, true, 8), c, w), TO = (x, y, rx, ry = rx, c = INK, w = 1) => riga(cerchio(x, y, rx, ry, 0, Math.max(14, Math.round(rx * 0.9))), c, w);
  const BORDO = [TO(0, 0, 100, 100, INK, 1.2), TO(0, 0, 96.5, 96.5, INK, 0.6), TO(0, 0, 84, 84, ORO, 1.2), TO(0, 0, 81.5, 81.5, ORO, 0.6), ...Array.from({ length: 64 }, (_, i) => { const a = (i / 64) * TAU, q = i % 4 ? 90 : 92.5; return riga([[Math.cos(a) * 87, Math.sin(a) * 87], [Math.cos(a) * q, Math.sin(a) * q]], ORO, 0.7); })];
  const MOTIVI = {
    crudo: () => { const h = 46, n = 11, A = (i) => -Math.PI / 2 + (i - 5) * 0.235, Rg = (i) => 98 - Math.abs(i - 5) * 3.4, P = (i, q = 1, a = A(i)) => [Math.cos(a) * Rg(i) * q, h + Math.sin(a) * Rg(i) * q], out = [];
      for (let i = 0; i < n; i++) { out.push(riga([P(i, 0.16), P(i)], INK, 0.9)); if (i === n - 1) break; const m = (A(i) + A(i + 1)) / 2, a = P(i), b = P(i + 1); out.push(TR([a, [(a[0] + b[0]) / 2 + Math.cos(m) * 6, (a[1] + b[1]) / 2 + Math.sin(m) * 6], b])); for (const q of [0.42, 0.6, 0.78]) out.push(TR([P(i, q), P(i, q * 1.03, m), P(i + 1, q)], q === 0.6 ? ORO : INK, q === 0.6 ? 0.9 : 0.55)); }
      return [out, riga([P(0), [-11, h + 2]], INK, 1.1), riga([P(n - 1), [11, h + 2]], INK, 1.1), riga(chiudi([[-20, h + 3], [-25, h + 15], [25, h + 15], [20, h + 3]]), INK, 1), [-14, -7, 0, 7, 14].map((x) => riga([[x, h + 5], [x * 1.1, h + 13]], INK, 0.55))]; },
    pesce: () => { const alto = (x) => 28 * Math.sqrt(Math.max(0, 1 - ((x + 2) / 66) ** 2)), sc = [], ch = [];
      for (let x = -38; x < 26; x += 8.5) for (let y = -26; y <= 26; y += 8.5) { const yy = y + (Math.round(x / 8.5) & 1) * 4.25; if (Math.abs(yy) < alto(x) - 6) sc.push(riga(cerchio(x, yy, 5, 5, Math.PI - 0.8, 6, 0.255), INK, 0.6)); }
      for (let x = -16; x <= 30; x += 6) ch.push(riga([[x, -alto(x) - 1], [x + 3, -alto(x) - 10]], INK, 0.6));
      for (const x of [8, 14, 20]) ch.push(riga([[x, alto(x) - 1], [x + 1, alto(x) + 7]], INK, 0.6));
      return [CH([[-50, 0], [-30, -19], [0, -29], [32, -22], [56, -7], [68, 2], [54, 11], [30, 20], [0, 26], [-30, 17]]), TR([[-48, -2], [-60, -11], [-74, -20]]), TR([[-74, -20], [-67, 0], [-74, 20]]), TR([[-74, 20], [-60, 11], [-48, 2]]), [-5, -2, 2, 5].map((v) => riga([[-53, v * 0.7], [-68, v * 3]], INK, 0.6)),
        TR([[-24, -23], [-14, -38], [10, -41], [30, -33], [38, -18]], INK, 0.9), TR([[2, 26], [10, 38], [24, 34], [30, 19]], INK, 0.9), TR([[34, -20], [26, -6], [29, 9], [36, 17]], INK, 1), TR([[24, 6], [13, 12], [9, 20], [19, 18], [26, 12]], INK, 0.8), TO(49, -5, 4.4), TO(49, -5, 1.6, 1.6, ORO, 1), riga([[68, 2], [58, 5]], INK, 0.9), TR([[-46, -1], [-10, -5], [24, -3]], ORO, 0.9), sc, ch]; },
    pasta: () => { const out = []; for (let k = 0; k < 20; k++) { const a = k * 0.72, Rg = 30 + (k % 5) * 8; out.push(riga(cerchio(Math.cos(a) * 9, Math.sin(a) * 8, Rg, Rg * 0.88, a, 34, 0.66), INK, k % 3 ? 0.65 : 0.9)); } return [out, TO(-3, 4, 6, 6, ORO, 1), TO(7, -3, 4.6, 4.6, ORO, 1)]; },
    carne: () => { const S = [[-62, -22], [-40, -50], [0, -54], [44, -44], [66, -12], [52, 24], [14, 38], [-34, 36], [-60, 14]], ro = []; for (let x = -38; x <= 18; x += 8) { const y = 60 - ((x + 10) ** 2) / 300; ro.push(foglioline(x, y, -0.9, 13, 2.6), foglioline(x, y, 0.6, 13, 2.6)); }
      return [CH(S), CH(S.map(([x, y]) => [x * 0.88, -9 + (y + 9) * 0.88]), INK, 0.65), CH([[-45, -30], [-36, -34], [-23, -8], [-23, 22], [-31, 22], [-31, -6]], INK, 1), tratteggio([[-14, -36], [44, -34], [54, -8], [40, 16], [-14, 26]], 0.7, 6, INK, 0.55), TR([[-6, -22], [14, -10], [8, 10]], INK, 0.8), TR([[24, -28], [32, -8], [24, 10]], INK, 0.8), TR([[-46, 56], [-14, 60], [24, 56]], ORO, 1), ro]; },
    selvaggina: () => { const palco = (q) => { const M = (p) => p.map(([x, y]) => [x * q, y]); return [ramo(M([[7, 40], [22, 12], [32, -20], [22, -62]]), 4.4, 1), ramo(M([[23, 10], [42, 2], [58, -16]]), 2.6, 0.7), ramo(M([[31, -14], [50, -28], [60, -48]]), 2.4, 0.7), ramo(M([[29, -38], [38, -54], [38, -68]]), 1.8, 0.6), ramo(M([[13, 28], [32, 36], [50, 26]]), 2.4, 0.7)]; };
      return [palco(1), palco(-1), TR([[-12, 44], [0, 50], [12, 44]]), TR([[-7, 38], [0, 41], [7, 38]], INK, 0.9), [[-13, 62], [0, 66], [13, 62]].map(([x, y]) => [TO(x, y, 4.2, 4.2, ORO, 1), riga([[x, y - 4], [x, y - 7]], ORO, 0.8)])]; },
    formaggi: () => { const A = [-60, -8], B = [34, -40], C = [62, -8], A2 = [-60, 24], C2 = [62, 28];
      return [riga(chiudi([A, B, C])), riga([A, A2, C2, C]), riga([[37, -35], [58, -9]], INK, 0.8), tratteggio([[48, -8], [62, -8], [62, 28], [48, 27]], 1.57, 3.6, INK, 0.55), [[-34, 8, 5.5, 4.4], [-8, 16, 3.6, 3], [20, 6, 6.4, 5], [36, 19, 3.4, 2.8], [-12, -14, 5, 2.2], [18, -22, 3.6, 1.6]].map(([x, y, a, b]) => TO(x, y, a, b, INK, 0.9)), TR([[-44, -10], [-20, -18], [2, -12], [10, -2], [8, 9]], ORO, 1)]; },
    freschi: () => { const cx = -16, S = [[-50, 22], [-46, -10], [-16, -28], [-6, -36], [6, -36], [16, -28], [46, -10], [50, 22], [26, 44], [-26, 44]].map(([x, y]) => [x * 0.86 + cx, y + 4]), pu = [];
      for (let i = 0; i < 11; i++) { const a = i * 2.4, q = 3 + (i % 4) * 3.6; pu.push(TO(42 + Math.cos(a) * q, 40 + Math.sin(a) * q, 1.5, 1.5, ORO, 0.9)); }
      return [CH(S), TR([[cx - 5, -32], [cx - 16, -52], [cx, -44], [cx + 16, -52], [cx + 5, -32]]), riga([[cx - 5, -32], [cx + 5, -32]], INK, 1), TR([[cx - 3, -29], [cx - 8, -16], [cx - 13, -5]], INK, 0.6), TR([[cx + 3, -29], [cx + 8, -16], [cx + 13, -5]], INK, 0.6), riga([[cx, -29], [cx, -3]], INK, 0.6), riga(cerchio(cx + 3, 18, 30, 26, 0.3, 12, 0.2), INK, 0.6), riga(cerchio(cx + 3, 18, 24, 21, 0.4, 10, 0.18), INK, 0.6), TO(42, 40, 16, 16), TO(42, 40, 13.6, 13.6, INK, 0.6), pu, foglioline(16, -26, -0.5, 34, 9), foglioline(22, -18, 0.15, 28, 7)]; },
    pugliese: () => { const ore = (x, y, s, a0) => { const o = [riga(cerchio(x, y, 13.5 * s, 12.5 * s, a0, 16), INK, 1), riga(cerchio(x + 1.6, y + 1, 7.4 * s, 6.4 * s, a0, 12, 0.8), INK, 0.8)]; for (let i = 0; i < 9; i++) { const a = a0 + (i / 9) * TAU; o.push(riga([[x + Math.cos(a) * 10 * s, y + Math.sin(a) * 9.4 * s], [x + Math.cos(a) * 12.4 * s, y + Math.sin(a) * 11.4 * s]], INK, 0.55)); } return o; }, pos = [[0, 0], ...Array.from({ length: 6 }, (_, i) => [Math.cos((i / 6) * TAU) * 30, Math.sin((i / 6) * TAU) * 30]), ...Array.from({ length: 9 }, (_, i) => [Math.cos(((i + 0.4) / 9) * TAU) * 60, Math.sin(((i + 0.4) / 9) * TAU) * 60])];
      return pos.map(([x, y], i) => ore(x, y, i % 2 ? 1 : 0.92, i * 1.7)); },
    aperitivo: () => { const tar = (x, y, Rg) => { const o = [TO(x, y, Rg, Rg), TO(x, y, Rg * 0.52, Rg * 0.52, INK, 0.9)]; for (let i = 0; i < 16; i++) { const a = (i / 16) * TAU; o.push(riga([[x + Math.cos(a) * Rg * 0.6, y + Math.sin(a) * Rg * 0.6], [x + Math.cos(a + 0.3) * Rg * 0.92, y + Math.sin(a + 0.3) * Rg * 0.92]], INK, 0.55)); } return o; }, oli = (x, y, a) => { const c = Math.cos(a), n = Math.sin(a), T = ([u, v]) => [x + u * c - v * n, y + u * n + v * c]; return [riga(cerchio(0, 0, 11, 7.6, 0, 22).map(T), INK, 1), riga(cerchio(-2, -1.6, 6, 3.6, 3.4, 6, 0.3).map(T), INK, 0.55), riga([T([10.6, 0]), T([14, 0])], ORO, 1)]; };
      return [tar(-30, -26, 25), tar(24, -36, 21), tar(36, 20, 25), oli(-38, 28, 0.4), oli(-14, 46, -0.3), oli(-10, 16, 0.9), foglioline(8, 56, -0.2, 30, 7), foglioline(4, 52, -1, 22, 6)]; },
    dolci: () => { const man = (x, y, a) => { const c = Math.cos(a), n = Math.sin(a), T = ([u, v]) => [x + u * c - v * n, y + u * n + v * c]; return [CH([[-17, 0], [-7, -8.5], [8, -8], [20, 0], [8, 8], [-7, 8.5]].map(T), INK, 1), [-3.6, 0, 3.6].map((v) => riga(liscia([[-11, v * 0.8], [0, v * 1.15], [11, v * 0.6]], false, 5).map(T), INK, 0.55))]; }, fio = [], st = [];
      for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i / 5) * TAU, Pp = (d, q) => [Math.cos(a + d) * q, Math.sin(a + d) * q]; fio.push(TR([[0, 0], Pp(-0.52, 15), Pp(-0.16, 26), Pp(0.16, 26), Pp(0.52, 15), [0, 0]], INK, 1), riga([Pp(0, 8), Pp(0, 20)], INK, 0.55)); }
      for (let i = 0; i < 10; i++) { const a = (i / 10) * TAU; st.push(riga([[0, 0], [Math.cos(a) * 8, Math.sin(a) * 8]], ORO, 0.9)); }
      return [Array.from({ length: 7 }, (_, i) => { const b = (i / 7) * TAU - Math.PI / 2; return man(Math.cos(b) * 51, Math.sin(b) * 51, b); }), fio, st]; },
  };
  const piatta = (c) => (Array.isArray(c) ? c.flatMap(piatta) : !c ? [] : c.righe ? piatta(c.righe) : [c]);
  const M0 = Object.fromEntries(Object.keys(MOTIVI).map((k) => [k, piatta(MOTIVI[k]())]));
  const incisione = (id) => { const linee = [...BORDO, ...M0[id]].filter((s) => s.w >= 0.8), d = (oro) => linee.filter((s) => (s.c === ORO) === oro).map((s) => `M${s.pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L')}`).join(''); return `<svg viewBox="-102 -102 204 204" aria-hidden="true"><path d="${d(false)}"/><path class="o" d="${d(true)}"/></svg>`; };
  const PT = m0 ? { x: 0, y: 330, k: 2.5 } : { x: -half * 0.5, y: 370, k: 2.15 }, grande = (s) => riga(s.pts.map(([x, y]) => [PT.x + x * PT.k, PT.y + y * PT.k]), s.c, s.w);
  G(TV, [{ occ: cerchio(PT.x, PT.y, 100 * PT.k, 100 * PT.k, 0, 90), righe: BORDO.map(grande) }]);
  const grandi = Object.fromEntries(Object.keys(M0).map((k) => [k, G(TV, M0[k].map(grande), { off: true, dur: 1.3 })]));

  // fine: due calici, grandi, e le stelle
  { const t = 7, s0 = m0 ? 1.04 : 0.92;
    G(t, [calice(-half * (m0 ? 0.3 : 0.16), 616, s0, 0.12), calice(half * (m0 ? 0.3 : 0.16), 616, s0, -0.12)]);
    const st = []; for (let i = 0; i < (m0 ? 22 : 44); i++) { const x = r(-half, half), y = r(8, O - 20), q = r(2, 5); st.push(riga([[x - q, y], [x + q, y]], ORO, 0.9), riga([[x, y - q], [x, y + q]], ORO, 0.9)); } G(t, st);
    const lx = half * 0.62, ly = m0 ? 74 : 90, lr = m0 ? 26 : 36; G(t, [riga(cerchio(lx, ly, lr, lr, 1.0, 26, 0.72), ORO, 1.1), riga(liscia([[lx + Math.cos(1) * lr, ly + Math.sin(1) * lr], [lx - lr * 0.3, ly + lr * 0.3], [lx - lr * 0.3, ly - lr * 0.3], [lx + Math.cos(1 + TAU * 0.72) * lr, ly + Math.sin(1 + TAU * 0.72) * lr]], false, 6), ORO, 1.1)]);
  }

  /* ---- bottiglie e nomi ---- */
  const bottiglie = [];
  tappe.forEach((t, i) => { const v = VINI[i]; if (!v) return;
    $('.e-nomi', t).innerHTML = v.vini.map(([, n]) => `<li><button type="button">${n}</button></li>`).join('');
    v.vini.forEach(([id, n], j) => { const w = FS.wine(id), b = document.createElement('button'); b.type = 'button'; b.className = 'e-bt'; b.setAttribute('aria-label', `${w.name}, apri la scheda`); b.innerHTML = `<img src="${w.bottle}" alt="" decoding="async" draggable="false">`; t.append(b);
      const o = { el: b, nome: $('.e-nomi', t).children[j], w, j, i, prof: v.vini.length === 2 ? [0.94, 1.06][j] : [0.92, 1, 1.08][j] }; bottiglie.push(o);
      b.addEventListener('click', () => scheda.apri(o.w, o.el)); o.nome.querySelector('button').addEventListener('click', () => scheda.apri(o.w, o.el)); }); });

  /* ---- misure ---- */
  const piazza = () => bottiglie.forEach((b) => { const n = VINI[b.i].vini.length, x = (n === 1 ? 0 : n === 2 ? (b.j ? 1 : -1) * dx * 0.62 : (b.j - 1) * dx) + (b.i === TV && !mob() ? W * 0.17 : 0); b.x = x; for (const el of [b.el, b.nome]) { el.style.setProperty('--x', x); el.style.setProperty('--dx', dx); } });
  const misura = () => {
    const m = mob(), hv = alto.offsetHeight || innerHeight, q = stage.getBoundingClientRect(); W = q.width; H = q.height; dpr = Math.min(devicePixelRatio || 1, 2); ink.width = nCv.width = cv.width = Math.round(W * dpr); ink.height = nCv.height = cv.height = Math.round(H * dpr);
    edge = hv * (m ? 0.6 : 0.72); U = (edge - T0) / 620;
    const sopra = m ? 186 : 208; bh = Math.min((edge + 14 - sopra) / 0.91, m ? W - 24 : 1e4); dx = Math.min(bh * 0.42, W * 0.3);
    stage.style.setProperty('--edge', `${edge}px`); stage.style.setProperty('--bh', `${bh}px`); stage.style.setProperty('--rifl', `${bh * 0.09}px`); stage.style.setProperty('--w', `${W}px`);
    X = [0, W * (m ? 0.8 : 0.55)]; /* 11 nov: 0,55 invece di 0,62, la prima bottiglia entra tutta nel primo schermo */ for (let i = 2; i < N; i++) X[i] = X[i - 1] + W; // la prima tappa è vicina: dal primo schermo si vede già arrivare una bottiglia
    tappe.forEach((t, i) => { t.style.left = `${X[i]}px`; });
    piazza();
    sporco = true;
  };

  /* ---- pillola delle tappe, come la fiaba: centra le bottiglie della tappa ---- */
  const STOP = [1, 2, 3, 4, 5, TV], mini = (i) => VINI[STOP[i]].vini.map(([id]) => `<img src="${FS.wine(id).bottle}" alt="" decoding="async">`).join(''), nome = (i) => FS.collection(VINI[STOP[i]].col)?.name ?? 'In tavola', num = (i) => String(i + 1).padStart(2, '0');
  nav.innerHTML = `<ul class="fb-menu" id="fb-menu" hidden>${STOP.map((_, i) => `<li><button type="button"><span class="fb-mini">${mini(i)}</span><span class="n">${num(i)}</span>${nome(i)}</button></li>`).join('')}</ul>
    <button class="fb-pill" type="button" aria-expanded="false" aria-controls="fb-menu"><span class="fb-mini"></span><span class="fb-pill__t"></span><span class="fb-pill__n"></span><span class="fb-pill__v" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="1.6"/></svg></span></button>`;
  const pill = $('.fb-pill', nav), menu = $('.fb-menu', nav), navB = $$('button', menu), apriM = (on) => { menu.hidden = !on; pill.setAttribute('aria-expanded', on); };
  let cur = -1; const segna = (i) => { if (i === cur) return; cur = i; $('.fb-mini', pill).innerHTML = mini(i); $('.fb-pill__t', pill).textContent = nome(i); $('.fb-pill__n', pill).textContent = `${num(i)}/${num(STOP.length - 1)}`; navB.forEach((b, k) => b.setAttribute('aria-current', k === i)); };
  pill.addEventListener('click', () => apriM(menu.hidden));
  document.addEventListener('click', (e) => { if (!nav.contains(e.target)) apriM(false); });
  const corsa = () => sec.offsetHeight - stage.offsetHeight;
  const vai = (n) => { const y = sec.getBoundingClientRect().top + scrollY + (X[n] / X[N - 1]) * corsa(); FS.lenis ? FS.lenis.scrollTo(y, { duration: 1.6 + Math.abs(n - cam / W) * 0.3 }) : scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' }); };
  navB.forEach((b, i) => b.addEventListener('click', () => { apriM(false); vai(STOP[i]); }));
  $$('[data-vai]', sec).forEach((b) => b.addEventListener('click', () => vai(+b.dataset.vai)));
  $$('[data-col]', sec).forEach((b) => b.addEventListener('click', () => apri(b.dataset.col)));

  /* ---- si trascina il palco: col dito o col mouse si cammina (solo in orizzontale: in verticale scorre la pagina). Il cursore fa vento ---- */
  let tira = null, tirato = false, ultX = null;
  stage.addEventListener('pointerdown', (e) => { if (e.target.closest('.fb-zoom, .fb-tappe, .e-piatti, a, .btn')) return; tira = { x: e.clientX, y: e.clientY, s: scrollY, su: false, id: e.pointerId }; tirato = false; });
  stage.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'mouse') { gX = (e.clientX / W - 0.5) * -22; if (ultX !== null) ventoV += (e.clientX - ultX) * 0.00035; ultX = e.clientX; }
    if (!tira || e.pointerId !== tira.id) return;
    const d = e.clientX - tira.x, dy = e.clientY - tira.y;
    if (!tira.su) { if (Math.abs(d) < 8 || Math.abs(d) < Math.abs(dy)) return; tira.su = true; stage.setPointerCapture(e.pointerId); stage.classList.add('is-tira'); }
    const y = tira.s - (d * corsa()) / X[N - 1] * 1.2; FS.lenis ? FS.lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y);
  });
  const lascia = () => { if (tira?.su) tirato = true; tira = null; stage.classList.remove('is-tira'); };
  stage.addEventListener('pointerup', lascia); stage.addEventListener('pointercancel', lascia);
  stage.addEventListener('pointerleave', () => { gX = 0; ultX = null; });
  stage.addEventListener('click', (e) => { if (tirato) { e.stopPropagation(); e.preventDefault(); tirato = false; } }, true);

  /* ---- bottiglia al centro: la scheda della fiaba (js/scheda.js) ---- */
  /* ---- la scheda: attorno alla bottiglia una scena incisa della tappa del suo vino, due per collezione; quale, lo dice FS.mk.scenaE (js/moderna-kit.js): il mare solo ai vini da pesce. Ogni vino ha la sua: nella stessa collezione si alternano e dal terzo vino si specchiano, così quelli vicini non si somigliano. Il tratteggio è nel colore del vino. In unità: 600 = il riquadro, centrato sulla bottiglia, che poggia su PIEDE ---- */
  const PIEDE = 214, tralcio = (pts, w0, foglie, gr = []) => { const c = liscia(pts, false, 8), sul = (u) => c[Math.round(u * (c.length - 1))]; return [ramo(pts, w0, 1.2), ...gr.map(([u, s]) => { const [x, y] = sul(u); return grappolo(x - 3 * s, y + 26 * s, s); }), ...foglie.map(([u, a, s]) => fogliaVite(...sul(u), a, s))]; };
  const suolo = (y = PIEDE, m = 300) => riga([[-m, y], [m, y]], INK, 1);
  const colle = (pts, vino) => { const q = liscia(pts, false, 6); return [riga(q, INK, 1), ...tratteggio(q, 0.1, 11, vino, 0.7)]; };
  const sorge = (h, Rg, vino) => { const ar = cerchio(0, h, Rg, Rg, Math.PI, 44, 0.5), out = [riga(ar, ORO, 1.3), riga(cerchio(0, h, Rg + 8, Rg + 8, Math.PI, 44, 0.5), ORO, 0.6), ...tratteggio(ar, 0.72, 10, vino, 0.7)]; for (let i = 0; i < 25; i++) { const a = Math.PI + ((i + 0.5) / 25) * Math.PI, e = Rg + (i % 2 ? 32 : 56); out.push(riga([[Math.cos(a) * (Rg + 16), h + Math.sin(a) * (Rg + 16)], [Math.cos(a) * e, h + Math.sin(a) * e]], ORO, 0.9)); } return out; };
  const onde = (h) => { const out = []; for (let i = 0; i < 13; i++) { const q = i / 12, y = h + 10 + (298 - h - 10) * q ** 1.45, am = 1.5 + q * 5, wl = 26 + q * 44; for (let x = -300 + r(0, 50); x < 300;) { const l = r(70, 190) * (0.6 + q), p = []; for (let u = x; u < Math.min(300, x + l); u += 8) p.push([u, y + Math.sin(u / wl + i * 1.3) * am]); if (p.length > 1) out.push(riga(p, INK, 0.6 + q * 0.5)); x += l + r(14, 46); } } return out; };
  const gabbiani = (pos) => pos.flatMap(([x, y, z]) => [TR([[x - 15 * z, y - 2 * z], [x - 7 * z, y - 7 * z], [x, y]], INK, 1), TR([[x, y], [x + 7 * z, y - 7 * z], [x + 15 * z, y - 2 * z]], INK, 1)]);
  const barca = (x, y, k) => { const P = (l) => l.map(([u, v]) => [x + u * k, y + v * k]), sc = P([[6, -14], [6, -150], [84, -20]]), fi = P([[-6, -14], [-6, -112], [-58, -18]]), sf = P([[-80, -6], [90, -8], [60, 24], [-58, 24]]); return [riga(P([[0, -8], [0, -158]]), INK, 1.1), { occ: sc, righe: [riga(chiudi(sc), INK, 1), ...tratteggio(sc, 0.2, 9, INK, 0.45)] }, { occ: fi, righe: [riga(chiudi(fi), INK, 1)] }, { occ: sf, righe: [riga(chiudi(sf), INK, 1.2), riga(P([[-68, 6], [76, 4]]), INK, 0.6)] }]; };
  const torreta = (x, b, k, vino = INK) => { const a = 40 * k, tt = b - 170 * k, fa = b - 56 * k, q = [[x - a - 10 * k, b + 4 * k], [x - a, fa], [x - a, tt], [x + a, tt], [x + a, fa], [x + a + 10 * k, b + 4 * k]], me = []; for (let i = 0; i < 4; i++) { const m = x - a + i * 22 * k; me.push(riga(chiudi([[m, tt], [m, tt - 13 * k], [m + 14 * k, tt - 13 * k], [m + 14 * k, tt]]), INK, 1)); } return { occ: q, righe: [riga(q, INK, 1.2), riga([[x - a, fa], [x + a, fa]], INK, 0.8), ...me, ...tratteggio([[x + a * 0.2, tt], [x + a, tt], [x + a, b], [x + a * 0.2, b]], -1, 6 * Math.sqrt(k), vino, 0.6), riga(chiudi([[x - 7 * k, tt + 34 * k], [x + 7 * k, tt + 34 * k], [x + 7 * k, tt + 56 * k], [x - 7 * k, tt + 56 * k]]), INK, 0.9), riga([[x - 11 * k, b + 2], [x - 11 * k, b - 34 * k], [x + 11 * k, b - 34 * k], [x + 11 * k, b + 2]], ORO, 1.3)] }; };
  const spiga = (x, b, h) => { const t = x + r(-14, 14), y = b - h, o = [TR([[x, b], [(x + t) / 2 + r(-5, 5), b - h * 0.5], [t, y]], INK, 0.8), riga([[t, y + 3], [t, y - 9]], ORO, 1)]; for (let k = 0; k < 6; k++) for (const q of [-1, 1]) o.push(riga([[t, y + k * 8 + 3], [t + q * 6, y + k * 8 - 6]], ORO, 1)); return o; };
  /* 11 nov, "i rami dobbiamo mettere": nei filari viti ad alberello (ceppo, due braccia, foglie) al posto del bastoncino con le foglie in cima. Stanno su un solco ogni quattro,
     sfalsate da un filare all'altro, grandi quanto vuole la prospettiva (orizzonte h; la prima quasi sul ripiano), le vicine davanti alle lontane. Tre misure di dettaglio:
     davanti l'alberello vero con meno punti, in mezzo ceppo a forca e cinque foglie, in fondo tre foglioline. xbMax = fin dove arriva il campo ai lati */
  const viteFilare = (x, y, s) => {
    const sp = q(0, 1) < 0.5 ? -1 : 1, w = Math.round(Math.min(1, 0.4 + s * 1.3) * 10) / 10, P = ([u, v]) => [x + u * s * sp, y + v * s], rado = (l, k) => l.filter((_, i) => i % k === 0 || i === l.length - 1), L = (pts) => riga(pts.map(P), INK, w);
    if (s >= 0.4) { /* l'alberello vero, un tratto solo; i tralci sono un pezzo senza fondo, così le viti davanti li coprono */
      const a = alberello(false), pz = a.filter((c) => c.righe), uve = pz.filter((c) => c.righe.some((l) => l.c === ORO)), foglie = pz.slice(3).filter((c) => !uve.includes(c)).filter((_, i) => s > 0.5 || i % 3 !== 1), tralci = a.filter((c) => !c.righe && c.c === INK).map((l) => L(l.pts));
      const porta = (c, k) => ({ occ: typeof c.occ[0][0] === 'number' ? rado(c.occ, k).map(P) : c.occ.map((o) => o.map(P)), righe: c.righe.map((l) => riga(rado(l.pts, k).map(P), l.c, w)) });
      return [{ occ: [tralci[0].pts[0], tralci[0].pts[0], tralci[0].pts[0]], righe: tralci }, ...pz.slice(0, 3).map((c) => porta(c, 3)), ...foglie.map((c) => porta(c, 2)), ...uve.map((c) => porta(c, 1))];
    }
    const F = [q(-8, 8), -q(46, 54)], capi = [-1, 1].map((d) => [F[0] + d * q(28, 38), F[1] - q(28, 40)]);
    if (s >= 0.19) { /* tronco e braccia a contorno, cinque foglie a lobi */
      const asta = (a, b, wa, wb, pg) => { const mx = (a[0] + b[0]) / 2 + pg, my = (a[1] + b[1]) / 2, wm = (wa + wb) / 2; return [[[a[0] - wa, a[1]], [mx - wm, my], [b[0] - wb, b[1]]], [[a[0] + wa, a[1]], [mx + wm, my], [b[0] + wb, b[1]]]]; };
      const legni = [asta([q(-2, 2), 0], F, 8.5, 5.5, q(-5, 5)), ...capi.map((C, i) => asta(F, C, 5, 2.6, i ? 5 : -5))];
      const lobi = (px, py, a, l) => { const c = Math.cos(a), n = Math.sin(a); return chiudi([[0, 0], [0.06, 0.4], [0.3, 0.64], [0.46, 0.5], [0.66, 0.56], [0.74, 0.3], [1.02, 0], [0.74, -0.3], [0.66, -0.56], [0.46, -0.5], [0.3, -0.64], [0.06, -0.4]].map(([u, v]) => [px + (u * c - v * n) * l, py + (u * n + v * c) * l])); };
      const fg = [...capi.flatMap((C, i) => { const d = i ? 1 : -1; return [lobi(C[0], C[1] + 4, -1.57 + d * q(0.1, 0.5), q(32, 40)), lobi(C[0] + d * 2, C[1] + 8, -1.57 + d * q(1.1, 1.6), q(28, 34))]; }), lobi(F[0] + q(-3, 3), F[1] - 8, -1.57 + q(-0.35, 0.35), q(32, 38))];
      return [{ occ: legni.map(([sx, dx]) => [...sx, ...dx.slice().reverse()].map(P)), righe: legni.flatMap(([sx, dx]) => [L(sx), L(dx)]) }, { occ: fg.map((f) => f.map(P)), righe: fg.map(L) }];
    }
    const rombo = (px, py, a, l) => { const c = Math.cos(a), n = Math.sin(a), w2 = l * 0.3; return [[px, py], [px + c * l * 0.5 - n * w2, py + n * l * 0.5 + c * w2], [px + c * l, py + n * l], [px + c * l * 0.5 + n * w2, py + n * l * 0.5 - c * w2], [px, py]]; };
    const fg = [rombo(capi[0][0], capi[0][1] + 6, -2.2 + q(-0.3, 0.3), q(40, 50)), rombo(capi[1][0], capi[1][1] + 6, -0.94 + q(-0.3, 0.3), q(40, 50)), rombo(F[0], F[1] - 10, -1.57 + q(-0.3, 0.3), q(44, 54))];
    return [{ occ: fg.map((f) => f.map(P)), righe: [L([[0, 0], F]), L([capi[0], F, capi[1]]), ...fg.map(L)] }];
  };
  const vitiFilari = (h, xbMax) => { const K = PIEDE - 9 - h, viti = [];
    for (let xb = 100; xb <= xbMax; xb += 200) for (const lt of [-1, 1]) for (let i = 0; i < 5; i++) { const Z = 1 + 0.6 * i + (xb % 400 === 300 ? 0.3 : 0); viti.push([h + K / Z, lt * xb * (0.08 + (0.92 * K) / Z / (300 - h)), 0.58 / Z]); }
    return viti.sort((a, b) => a[0] - b[0]).map(([y, x, sc]) => viteFilare(x, y, sc)); };
  const SCENE = {
    // Collezione 53, le vecchie vigne
    vite: (v) => [colle([[-300, PIEDE], [-190, 120], [-40, 74], [120, 92], [236, 146], [300, PIEDE]], v), suolo(),
      cipresso(258, PIEDE, 210, 0.9), cipresso(206, PIEDE, 140, 0.68),
      ramo([[-212, PIEDE + 4], [-238, 130], [-192, 46], [-216, -40], [-180, -112]], 20, 9),
      tralcio([[-202, -6], [-246, -44], [-262, -96]], 6, [[0.5, 2.9, 38], [1, -1.7, 44]]),
      tralcio([[-180, -112], [-104, -192], [20, -226], [150, -196], [262, -116]], 9, [[0.1, -2.4, 54], [0.26, 2.9, 50], [0.42, -1.8, 62], [0.58, -1, 58], [0.74, -1.7, 56], [0.88, 0.2, 50], [1, -0.5, 52]], [[0.3, 1.5], [0.66, 1.6], [0.9, 1.35]]),
      viticcio(150, -196, -0.9, 1.5), viticcio(-104, -192, -2.4, 1.5)],
    grappolo: (v) => { const acini = []; [[-188, 5], [-132, 6], [-76, 7], [-20, 6], [36, 5], [92, 4]].forEach(([y, n]) => { for (let i = 0; i < n; i++) { const x = (i - (n - 1) / 2) * 66, o = cerchio(x, y, 37, 37, 0, 20); acini.push({ occ: o, righe: [riga(o, INK, 1), ...tratteggio(cerchio(x, y, 33, 33, -0.5, 10, 0.5), 0.72, 7, v, 0.65), riga(cerchio(x, y, 27, 27, 3.6, 6, 0.2), INK, 0.6)] }); } });
      return [suolo(), acini, ramo([[0, -216], [6, -244], [-4, -272]], 6, 3), fogliaVite(-10, -226, -2.9, 96), fogliaVite(10, -226, -0.24, 96), viticcio(-150, -214, 2.6, 1.3), viticcio(150, -214, 0.5, 1.3)]; },
    // Terra, la terra rossa: i filari, la pajara, il muretto a secco
    filari: (v, campo = 300) => { /* campo: fin dove arrivano le viti ai lati. 300 nella scheda della home (il disegno non va sotto i testi), 500 nelle tappe di vino-e (riempie il riquadro), 2100 nella scena larga, dove i solchi oltre 300 li mette LATI.filari di tools/incidi_pagine_e.mjs */ const h = 96, out = [...sorge(h, 236, v), riga(Array.from({ length: 21 }, (_, i) => [-300 + i * 30, h - 5 * Math.sin(i * 0.8) - 3]), INK, 1)];
      for (let a = campo === 500 ? -10 : -6; a <= (campo === 500 ? 10 : 6); a++) { const xb = a * 50; if (a) out.push(riga([[xb * 0.08, h + 2], [xb, 300]], TERRA, 0.9)); }
      out.push(pajara(238, h + 4, 0.44)); return [out, vitiFilari(h, campo)]; },
    pajara: (v) => { const te = []; for (let a = -6; a <= 6; a++) if (a) te.push(riga([[a * 31, PIEDE + 1], [a * 50, 298]], TERRA, 0.9));
      return [...cirro(-262, -240, 190), ...cirro(-210, -170, 130), suolo(), te,
        ramo([[196, PIEDE - 40], [184, 60], [208, -20], [196, -84]], 12, 6), tralcio([[196, -84], [146, -128], [104, -196]], 5, [[0.5, -2.6, 44], [1, -2, 50]], [[0.55, 1.15]]), tralcio([[196, -84], [244, -122], [270, -186]], 5, [[0.5, -0.5, 44], [1, -1.1, 50]], [[0.6, 1.1]]),
        mur(-80, 240, PIEDE), pajara(-172, PIEDE + 2, 0.94, v)]; },
    // 125 Organic, il campo: l'ulivo, papaveri e spighe
    ulivo: (v) => { const pa = []; for (let i = 0; i < 7; i++) pa.push(papavero(-112 - i * 26 + r(-8, 8), PIEDE + r(-6, 6), r(44, 120), r(0.8, 1.05)));
      return [colle([[-300, 176], [-204, 112], [-70, 84], [70, 96], [206, 128], [300, 176]], v), suolo(176, 300), suolo(), Array.from({ length: 16 }, () => { const x = r(-296, 296), y = r(190, PIEDE - 2); return riga([[x, y], [x + r(-6, 6), y - r(6, 12)]], TENUE, 0.7); }),
        ramo([[206, PIEDE + 6], [172, 136], [214, 58], [172, -18], [186, -76]], 30, 14),
        chioma([[186, -76], [96, -168], [-34, -222], [-166, -210], [-262, -146]], 10, 15, 0.1), chioma([[186, -76], [222, -152], [204, -232]], 7, 5, 0.3), chioma([[190, -62], [244, -106], [288, -176]], 6, 4, 0.3), pa]; },
    campo: (v) => { const sp = [], pa = []; for (let i = 0; i < 16; i++) { const a = r(100, 280); sp.push(spiga((i % 2 ? 1 : -1) * a, PIEDE + r(-2, 6), 90 + (a - 100) * 0.9 + r(0, 50))); } for (let i = 0; i < 14; i++) { const a = r(104, 258); pa.push(papavero((i % 2 ? 1 : -1) * a, PIEDE + r(-4, 8), 44 + (a - 104) * 0.8 + r(0, 40), r(0.85, 1.3))); }
      return [...cirro(-262, -226, 180), ...cirro(70, -256, 170), colle([[-300, PIEDE], [-214, 108], [-70, 66], [90, 80], [226, 128], [300, PIEDE]], v), suolo(), sp, pa]; },
    // Classica, il mare
    mare: (v) => { const h = 112, sol = cerchio(84, -36, 136, 136, 0, 44); return [...tratteggio(sol, 0.72, 10, v, 0.7), riga(sol, ORO, 1.3), riga(cerchio(84, -36, 144, 144, 0, 44), ORO, 0.6), suolo(h), ...cirro(-262, -236, 190), ...cirro(-250, -150, 130), ...onde(h), ...gabbiani([[-210, -92, 1], [-170, -116, 0.8], [-128, -84, 0.7]]), barca(-196, h + 34, 1), torreta(232, h, 1)]; },
    torre: (v) => { const h = 128, sc = liscia([[64, 300], [96, PIEDE + 12], [150, PIEDE - 6], [240, PIEDE - 12], [300, PIEDE - 34]], false, 6); return [suolo(h), ...cirro(-262, -236, 190), ...cirro(-240, -160, 120), ...onde(h), ...gabbiani([[-196, -60, 1], [-150, -92, 0.8], [-240, -28, 0.7]]), barca(-206, h + 16, 0.62), { occ: [...sc, [300, 300]], righe: [riga(sc, INK, 1.1), ...Array.from({ length: 14 }, () => { const x = r(110, 280), y = r(PIEDE + 8, 296); return riga([[x, y], [x + r(10, 26), y + r(4, 12)]], INK, 0.6); })] }, torreta(190, PIEDE + 2, 2.2, v)]; },
    // 125 Uno Due Cinque, il tramonto e l'aperitivo
    pergola: (v) => { const h = 132, top = -262, out = [...sorge(h, 176, v), suolo(h), suolo()], fili = [];
      for (const x of [-262, 262]) out.push(ramo([[x - 3, PIEDE + 2], [x + 4, 60], [x - 2, -100], [x, top]], 8, 6));
      out.push(riga([[-296, top - 8], [296, top - 8]], INK, 1.2), riga([[-296, top + 6], [296, top + 6]], INK, 1.2));
      for (let x = -290; x < 290; x += 58) out.push(riga([[x, top - 13], [x + 16, top + 12]], INK, 0.7));
      for (let i = 0; i < 14; i++) out.push(fogliaVite(-280 + ((i + 0.5) / 14) * 560 + r(-12, 12), top + r(2, 18), 1.57 + r(-0.9, 0.9), r(34, 48)));
      for (const x of [-196, -112, 112, 196]) out.push(grappolo(x, top + 36, 1));
      [[-262, 0], [0, 262]].forEach(([a, b]) => { const c = Array.from({ length: 13 }, (_, i) => { const u = i / 12; return [a + (b - a) * u, top + 14 + 4 * u * (1 - u) * 64]; }); fili.push(riga(c, INK, 0.8)); for (let i = 1; i < 12; i += 2) { const o = cerchio(c[i][0], c[i][1] + 9, 6, 6, 0, 12); fili.push({ occ: o, righe: [riga(o, ORO, 1.2)] }); } });
      return [out, fili]; },
    calici: (v) => { const st = [], lx = 206, ly = -226, lr = 34, ta = 1.05; for (let u = -4; u <= 4; u++) for (let w = 0; w < 4; w++) { const x = u * 68 + r(-22, 22), y = -284 + w * 50 + r(-14, 14), q = r(3, 6); if (Math.hypot(x - lx, y - ly) > lr + 22) st.push(riga([[x - q, y], [x + q, y]], ORO, 0.9), riga([[x, y - q], [x, y + q]], ORO, 0.9)); }
      return [st, riga(cerchio(lx, ly, lr, lr, ta, 26, (TAU - 2 * ta) / TAU), ORO, 1.1), riga(liscia([[lx + Math.cos(ta) * lr, ly + Math.sin(ta) * lr], [lx - lr * 0.34, ly], [lx + Math.cos(ta) * lr, ly - Math.sin(ta) * lr]], false, 8), ORO, 1.1), suolo(), calice(-200, PIEDE, 0.9, 0.1, v), calice(200, PIEDE, 0.9, -0.1, v)]; },
  };
  const disegnoInciso = (w, box, dopo) => {
    const [sua, n] = FS.mk.scenaE(w), cose = [SCENE[sua](w.color)].flat(Infinity).filter(Boolean);
    const d = (rr) => { const per = new Map(); rr.flat(Infinity).forEach((s) => { const q = `${s.c}|${s.w}`; if (!per.has(q)) per.set(q, { c: s.c, w: s.w, d: '' }); per.get(q).d += `M${s.pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L')}`; }); return [...per.values()].map((p) => `<path class="t" fill="none" stroke="${p.c}" stroke-width="${p.w}" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" d="${p.d}"/>`).join(''); };
    const unite = [], pezzi = []; cose.forEach((c) => { if (c.righe) pezzi.push(c); else unite.push(c); }); // le linee sciolte insieme, poi i pezzi col loro fondo pieno
    box.innerHTML = `<svg viewBox="-300 -300 600 600"><g transform="scale(${n % 4 > 1 ? -1 : 1} 1)">${d(unite)}${pezzi.map((c) => `<path class="o" fill="var(--cream)" d="${(typeof c.occ[0][0] === 'number' ? [c.occ] : c.occ).map((q) => `M${q.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L')}Z`).join('')}"/>${d(c.righe)}`).join('')}</g></svg>`;
    if (reduce) return;
    gsap.fromTo($$('.t', box), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.8, stagger: { amount: 0.9 }, ease: 'power1.inOut', delay: dopo });
    gsap.fromTo($$('.o', box), { opacity: 0 }, { opacity: 1, duration: 0.3, stagger: { amount: 0.5 }, delay: dopo + 0.1 });
  };
  const scheda = Scheda(sec, { schizzi: false, disegno: disegnoInciso });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') apriM(false); });

  /* ---- il disegno di un fotogramma ---- */
  const CIELI = [[0, [243, 239, 234]], [0.45, [245, 238, 224]], [0.8, [245, 228, 208]], [1, [243, 218, 196]], [1.25, [238, 224, 214]]];
  const misto = (a, b, f) => `rgb(${a.map((v, j) => Math.round(v + (b[j] - v) * f)).join(' ')})`;
  const cielo = (p) => { let i = 0; while (i < CIELI.length - 2 && p > CIELI[i + 1][0]) i++; const [a, ca] = CIELI[i], [b, cb] = CIELI[i + 1], f = clamp((p - a) / (b - a)); return ca.map((v, j) => v + (cb[j] - v) * f); };
  // la notte: la carta prende il colore della sezione dopo (--night di css/moderna-e-sotto.css), le linee si schiariscono
  const BUIO = [14, 23, 40], ORO_N = [205, 183, 128], TONI = [[INK, [43, 34, 28], [236, 229, 216]], [TENUE, [143, 129, 114], [108, 118, 134]], [ORO, [169, 138, 74], ORO_N], [TERRA, [154, 74, 50], [190, 120, 90]]];
  const toniN = Object.fromEntries(TONI.map(([c, a, b]) => [c, misto(a, b, 1)]));
  const notteA = (n) => { notte = n; toni = n ? toniN : {}; stage.style.setProperty('--ripiano', misto(CIELI[0][1], BUIO, n)); stage.style.setProperty('--filo', misto(TONI[0][1], ORO_N, n)); };
  // le passate del colore: avanti e indietro dall'alto in basso, ognuna con un arco della mano; le righine sotto sono il bordo asciutto del pennello
  const passate = () => { const lw = Math.max(H / 5, 110), dy = lw * 0.45, p = new Path2D(); let y = -lw * 0.4, dx = true, len = 0, ax = W + lw, ay = y; p.moveTo(ax, ay); for (let i = 0; y < H + lw; i++) { const pieno = lw * (i % 2 ? 0.1 : -0.1), b = dx ? -lw : W + lw; for (let j = 1; j <= 12; j++) { const t = j / 12, x = (dx ? W + lw : -lw) + (b - (dx ? W + lw : -lw)) * t, yy = y + dy * t + Math.sin(t * Math.PI) * pieno; p.lineTo(x, yy); len += Math.hypot(x - ax, yy - ay); ax = x; ay = yy; } y += dy; dx = !dx; } return { p, len, lw, W, H }; };
  let PS = null;
  const colora = (n) => {
    const c0 = ctx; ctx = nctx; notte = 1; toni = toniN; disegna(true);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.fillStyle = misto(BUIO, BUIO, 0); ctx.fillRect(0, edge, W, H - edge); ctx.fillStyle = misto(ORO_N, ORO_N, 0); ctx.fillRect(0, edge, W, 1);
    ctx = c0; notte = 0; toni = {};
    if (!PS || PS.W !== W || PS.H !== H) PS = passate();
    const x = ictx, L = PS.len * n;
    x.globalCompositeOperation = 'source-over'; x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, ink.width, ink.height); x.setTransform(dpr, 0, 0, dpr, 0, 0); x.lineCap = x.lineJoin = 'round'; x.strokeStyle = '#000'; x.setLineDash([L, PS.len]);
    x.lineWidth = PS.lw; x.stroke(PS.p);
    [[0.53, 3.2], [0.57, 1.6], [0.62, 2.4], [0.68, 1.2], [0.75, 1.8]].forEach(([o, w]) => { x.setTransform(dpr, 0, 0, dpr, 0, dpr * o * PS.lw); x.lineWidth = w; x.stroke(PS.p); });
    x.setLineDash([]); x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-in'; x.drawImage(nCv, 0, 0);
  };
  let intro = reduce ? 1 : 0;
  const disegna = (diNotte) => {
    const m = mob(), p = clamp(cam / Math.max(1, X[5]), 0, 1.25) , pv = Math.max(0, cam / Math.max(1, X[5])), front = reduce ? 1e9 : intro * 1.06 * W, dtD = reduce ? 9 : Math.min(0.1, (tempo - (disegna.t ?? tempo))) , carta = misto(cielo(pv), BUIO, notte), q = U * dpr, yb = dpr * T0;
    if (!diNotte && carta !== disegna.c) { disegna.c = carta; stage.style.setProperty('--carta', carta); }
    disegna.t = tempo;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = carta; ctx.fillRect(0, 0, cv.width, cv.height); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    // il sole: un disco pieno e i raggi fini che girano piano; tramonta dietro le colline
    const pp = Math.min(1, p), sx = W * ((m ? 0.84 : 0.8) - (m ? 0.14 : 0.1) * pp), sy = T0 + U * ((m ? 46 : 96) + (O - (m ? 46 : 96) + 24) * pp ** 1.6), sr = U * (m ? 34 : 46);
    const via = clamp((pv - 1) / 0.12); ctx.setTransform(dpr, 0, 0, dpr, dpr * sx, dpr * (sy + via * sr * 2));
    ctx.globalAlpha = 1 - via;
    ctx.fillStyle = `rgb(${236 - 4 * pp} ${216 - 60 * pp} ${150 - 40 * pp})`; ctx.beginPath(); ctx.arc(0, 0, sr, 0, TAU); ctx.fill(); ctx.strokeStyle = ORO; ctx.lineWidth = 1; ctx.stroke();
    ctx.globalAlpha = 1;
    if (pp < 0.9) { ctx.globalAlpha = 1 - pp; ctx.rotate(tempo * 0.06); ctx.beginPath(); for (let i = 0; i < 36; i++) { const a = (i / 36) * TAU, l = i % 2 ? 1.34 : 1.5; ctx.moveTo(Math.cos(a) * sr * 1.14, Math.sin(a) * sr * 1.14); ctx.lineTo(Math.cos(a) * sr * l, Math.sin(a) * sr * l); } ctx.stroke(); ctx.globalAlpha = 1; }
    // gli uccelli: pochi, lenti
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.strokeStyle = tono(INK); ctx.lineWidth = 0.9;
    for (let i = 0; i < 4; i++) { const x = ((0.2 + i * 0.27 - tempo * 0.008 + 3) % 1.3 - 0.15) * W, y = T0 + U * (40 + (i * 37) % 110) + Math.sin(tempo * 0.6 + i) * 6, a = Math.sin(tempo * 3.1 + i * 2) * 3.4, s = 7 + (i % 2) * 2; ctx.beginPath(); ctx.moveTo(x - s, y - a); ctx.quadraticCurveTo(x - s * 0.4, y - 2 - a * 0.2, x, y); ctx.quadraticCurveTo(x + s * 0.4, y - 2 - a * 0.2, x + s, y - a); ctx.stroke(); }
    for (const e of els) {
      if (e.off) continue;
      const cx = W / 2 + (X[e.t] - cam) * e.f + pX * (1 - e.f), sx0 = cx + e.x0 * U, sx1 = cx + e.x1 * U;
      const d0 = e.deriva ? (tempo * e.deriva) % 620 : 0;
      if (e.largo) e.rev = 1; else if (e.via) { e.rev -= dtD / 0.3; if (e.rev <= 0) { e.rev = 0; e.via = false; e.off = true; continue; } } else if (e.rev < 1 && front > sx0) e.rev = intro < 1 || e.rev > 0 || e.incide ? Math.min(1, e.rev + dtD / (e.dur ?? (e.dur = r(1.1, 1.9)))) : 1; // si traccia da solo solo in apertura e sul piatto scelto; camminando arriva già intero: a tratti, mentre si scorre, sembrava un errore
      if (sx1 + d0 * U < -60 || sx0 - 200 > W + 60 || e.rev <= 0) continue;
      ctx.setTransform(q, 0, 0, q, dpr * (cx - d0 * U * (e.deriva ? 1 : 0)), yb);
      if (e.vento) { const s = e.vento; e.v = (e.v + (vento - e.s) * 0.04) * 0.88; e.s += e.v; const sh = (e.s + Math.sin(tempo * 0.9 + e.ph) * 0.014 + Math.sin(tempo * 2.3 + e.ph * 2) * 0.005) * (e.cima ? 0.7 : 1); ctx.translate(s.bx, s.by); ctx.transform(1, 0, e.cima ? sh * 0.6 : -sh, 1, 0, 0); ctx.translate(-s.bx, -s.by); }
      if (e.barca) { ctx.translate(e.barca.bx, e.barca.by); ctx.rotate(Math.sin(tempo * 0.9) * 0.035); ctx.translate(-e.barca.bx, -e.barca.by + Math.sin(tempo * 1.3) * 2.5); }
      if (e.sub && e.rev >= 1) { for (const s of e.sub) { if (s.occ) { ctx.fillStyle = carta; ctx.fill(s.occ); } for (const u of s.unite) { ctx.strokeStyle = tono(u.c); ctx.lineWidth = u.w / U; ctx.stroke(u.p); } } e.dyn?.(); continue; } // 11 nov: elemento per elemento
      if (e.occ) { ctx.fillStyle = carta; ctx.fill(e.occ); }
      if (e.rev >= 1) { for (const u of e.unite) { ctx.strokeStyle = tono(u.c); ctx.lineWidth = u.w / U; ctx.stroke(u.p); } }
      else { const n = e.righe.length; e.righe.forEach((s, i) => { const k = clamp((e.rev - (0.5 * i) / n) / 0.5); if (k <= 0) return; ctx.strokeStyle = tono(s.c); ctx.lineWidth = s.w / U; ctx.setLineDash([s.len * k, s.len]); ctx.stroke(s.p); }); ctx.setLineDash([]); }
      e.dyn?.();
    }
  };

  /* ---- il giro: da scrollY a camera, disegno, testi ---- */
  let prima = performance.now(), misW = 0, misH = 0;
  const stato = (now) => {
    requestAnimationFrame(stato);
    const dt = Math.min(60, now - prima); prima = now; tempo = reduce ? 0 : now / 1000;
    if (innerWidth !== misW || alto.offsetHeight !== misH) { misW = innerWidth; misH = alto.offsetHeight; misura(); }
    const q = sec.getBoundingClientRect(); if (q.bottom < 0 || q.top > innerHeight) return;
    const dest = clamp(-q.top / Math.max(1, corsa())) * X[N - 1]; // lineare come la fiaba: niente soste alle tappe, ogni tacca della rotella sposta uguale
    cam += (dest - cam) * (reduce ? 1 : 1 - Math.exp(-dt / 110)); if (Math.abs(dest - cam) < 0.1) cam = dest;
    pX += (gX - pX) * (1 - Math.exp(-dt / 280));
    const n = reduce ? +(cam > X[TV] + W * 0.8) : clamp((cam - X[TV] - W * 0.6) / (W * 0.38)); // comincia quando la tavola è uscita, finisce arrivando all'ultima tappa
    if (n !== colore) { colore = n; const g = n >= 1 ? 1 : 0; if (g !== notte) notteA(g); ink.style.visibility = n > 0 && n < 1 ? 'visible' : 'hidden'; const d = n > 0.14; if (d !== sec.classList.contains('hero--dark')) { sec.classList.toggle('hero--dark', d); dispatchEvent(new Event('scroll')); } } // l'intestazione cambia quando le prime due passate le sono passate sotto
    if (cam !== prevCam) sporco = true;
    ventoV += (cam - prevCam) * 0.00004; prevCam = cam; ventoV *= 0.9; vento += (clamp(ventoV, -0.12, 0.12) - vento) * 0.12; // il vento: quello del cursore e quello del camminare
    if (!reduce && now - ultimo > (m0 ? 33 : 0)) { ultimo = now; disegna(); if (colore > 0 && colore < 1) colora(colore); } else if (reduce && sporco) { sporco = false; disegna(); }
    track.style.transform = `translate3d(${-cam}px,0,0)`;
    // ogni bottiglia con la sua profondità: arrivando e andando via si scansano un po', fermi tornano in fila
    bottiglie.forEach((b) => { const d = X[b.i] - cam; if (Math.abs(d) > W * 1.3) return; b.el.style.translate = `${d * (b.prof - 1) + pX * 0.25 * (b.prof - 0.9) * 5}px 0`; });
    // titolo e racconto a velocità diverse; si vedono solo vicino alla loro tappa
    tappe.forEach((t, i) => { const d = X[i] - cam; if (Math.abs(d) > W * 1.3) return; const tx = t._t ?? (t._t = $('.e-testo', t).children); tx[0].style.translate = `${d * 0.1}px 0`; if (tx[1]) tx[1].style.translate = `${d * 0.22}px 0`; if (tx[2]) tx[2].style.translate = `${d * 0.34}px 0`; const o = (1 - ss(clamp((Math.abs(d) - W * 0.1) / (W * 0.36)))) * (i === N - 1 ? ss(clamp((colore - 0.75) / 0.25)) : 1); if (o !== t._o) { t._o = o; for (const el of t._v ?? (t._v = [$('.e-testo', t), $('.e-nomi', t)].filter(Boolean))) { el.style.opacity = o; el.style.visibility = o > 0.01 ? 'visible' : 'hidden'; } } });
    segna(clamp(Math.round((cam - X[1]) / W), 0, STOP.length - 1));
    nav.style.opacity = (cam < X[1] * 0.25 ? clamp(cam / (X[1] * 0.25)) : 1) * (1 - colore); nav.style.visibility = cam < 2 || colore > 0.99 ? 'hidden' : '';
  };
  misura(); sec.classList.add('is-pronto');
  if (!reduce) {
    gsap.to({ v: 0 }, { v: 1, duration: 2.6, ease: 'power1.inOut', delay: 0.1, onUpdate() { intro = this.targets()[0].v; } });
    gsap.fromTo($$('.e-testo > :not(.e-t)', tappe[0]), { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'expo.out', stagger: 0.08, delay: 0.9 });
  }
  requestAnimationFrame(stato);

  /* ---- i vini di una tappa, tre alla volta: il numero scala a ogni clic e in fondo il bottone dice Ricomincia ---- */
  const fila = (i, nome = (w) => w.name) => {
    const t = tappe[i], posti = bottiglie.filter((b) => b.i === i), altri = $('.e-vini__altri', t), conta = $('.e-vini__n', t);
    let lista = [], da = 0, turno = 0;
    const mostra = (subito) => {
      const tre = lista.slice(da, da + 3), mio = ++turno, via = posti.flatMap((o) => [o.el, o.nome]), visti = da + tre.length, resto = lista.length - visti;
      conta.textContent = lista.length > 3 ? `${visti} di ${lista.length} vini` : lista.length === 1 ? 'Un vino' : `${lista.length} vini`; // il numero scala subito al clic, non quando arrivano le foto
      altri.textContent = !resto ? 'Ricomincia' : resto === 1 ? 'Altro 1 vino' : `Altri ${resto} vini`;
      const cambia = () => { if (mio !== turno) return; VINI[i].vini = tre.map((w) => [w.id, w.name]); posti.forEach((o, j) => { const w = tre[j]; o.el.hidden = o.nome.hidden = !w; if (!w) return; o.w = w; o.el.style.setProperty('--b', Scheda.FONDO[w.bottle] ?? 0.91); $('img', o.el).src = w.bottle; $('button', o.nome).textContent = nome(w); o.el.setAttribute('aria-label', `${w.name}, apri la scheda`); }); piazza(); requestAnimationFrame(() => via.forEach((el) => el.classList.remove('is-via'))); };
      if (subito) return cambia();
      via.forEach((el) => el.classList.add('is-via'));
      Promise.all([new Promise((ok) => setTimeout(ok, 280)), ...tre.map((w) => { const im = new Image(); im.src = w.bottle; return im.decode().catch(() => {}); })]).then(cambia); // le foto nuove sono pronte prima di comparire: niente buchi
    };
    altri.addEventListener('click', () => { da = da + 3 >= lista.length ? 0 : da + 3; mostra(); });
    return (l, subito) => { lista = l; da = 0; altri.hidden = l.length <= 3; mostra(subito); };
  };
  // le collezioni: prima le tre scelte per la tappa, poi le altre; sul ripiano il nome senza quello della collezione, che è già nel titolo
  VINI.forEach((v, i) => { if (!v?.col) return; const prime = v.vini.map(([id]) => FS.wine(id)); fila(i, (w) => w.name.replace(/^(Collezione 53|125 Organic|125|Terra)\s+/, '').replace(/\s+(Organic|Edition)$/, ''))([...prime, ...D.wines.filter((w) => w.collection === v.col && !prime.includes(w))], true); });

  /* ---- in tavola: abbinamenti veri (foods di js/data.js). Si sceglie un piatto: quello grande si incide da solo e sul ripiano salgono i suoi vini ---- */
  const piatti = $('.e-piatti'), inTavola = fila(TV);
  piatti.innerHTML = D.foods.map((f) => `<li><button class="e-pt" type="button" aria-pressed="false" data-f="${f.id}">${incisione(f.id)}<span>${f.label}</span></button></li>`).join('');
  let cibo = null;
  const tavola = (id, subito) => {
    if (id === cibo) return;
    if (cibo) grandi[cibo].via = true;
    Object.assign(grandi[id], { off: false, via: false, incide: !subito, rev: subito ? 1 : grandi[id].rev }); sporco = true;
    cibo = id;
    $$('.e-pt', piatti).forEach((b) => b.setAttribute('aria-pressed', b.dataset.f === id));
    $('.e-tv__scelto').textContent = D.foods.find((f) => f.id === id)?.label ?? '';
    inTavola(viniDi(id), subito);
  };
  piatti.addEventListener('click', (e) => { const b = e.target.closest('[data-f]'); if (b) tavola(b.dataset.f); });
  tavola('pugliese', true);

  const P = $('.m-pill'); P?.classList.add('in-storia');
  ScrollTrigger.create({ trigger: sec, start: 'top bottom', end: 'bottom 60%', onToggle: (s) => P?.classList.toggle('in-storia', s.isActive) });
  titoli();
})();
