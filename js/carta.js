/* Ritagli di carta comuni a moderna-d.html e fiaba-carta.html: fogli (poligoni tagliati a forbice) e le forme del Salento. Solo geometria e Path2D: come si disegnano e con che luce lo decide la pagina. */
(() => {
  const TAU = Math.PI * 2;
  let seme = 53;
  const R = () => { seme = (seme + 0x6d2b79f5) | 0; let t = Math.imul(seme ^ (seme >>> 15), 1 | seme); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const r = (a, b) => a + R() * (b - a);
  const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const tracciato = (poli, aperto) => { const p = new Path2D(); if (!poli.length) return p; (typeof poli[0][0] === 'number' ? [poli] : poli).forEach((q) => { q.forEach(([x, y], i) => p[i ? 'lineTo' : 'moveTo'](x, y)); if (!aperto) p.closePath(); }); return p; };
  const estremi = (poli) => { const xs = (typeof poli[0]?.[0] === 'number' ? [poli] : poli).flat().map((q) => q[0]); return xs.length ? [Math.min(...xs), Math.max(...xs)] : [0, 0]; };
  const carta = (poli, col, o = {}) => ({ p: tracciato(poli), c: rgb(col), v: -1, x: estremi(poli), ...o });
  const tratto = (poli, col, lw, o = {}) => ({ p: tracciato(poli, true), c: rgb(col), lw, v: -1, x: estremi(poli), ...o });
  const taglia = (pts, passo = 40, j = 2) => pts.flatMap((a, i) => { const b = pts[(i + 1) % pts.length], n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / passo)); return Array.from({ length: n }, (_, k) => [a[0] + ((b[0] - a[0]) * k) / n + (k ? r(-j, j) : 0), a[1] + ((b[1] - a[1]) * k) / n + (k ? r(-j, j) : 0)]); });
  const ell = (cx, cy, rx, ry, rot = 0, n = 13) => Array.from({ length: n }, (_, i) => { const a = (i / n) * TAU, x = Math.cos(a) * rx * r(0.95, 1.05), y = Math.sin(a) * ry * r(0.95, 1.05); return [cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]; });
  const rett = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const arco = (cx, base, w, h, n = 14) => { const q = w / 2, c = base - h + q, p = [[cx - q, base]]; for (let i = 0; i <= n; i++) { const a = Math.PI + (i / n) * Math.PI; p.push([cx + Math.cos(a) * q, c + Math.sin(a) * q]); } p.push([cx + q, base]); return p; };
  const foglia = (x, y, a, l, w) => { const c = Math.cos(a), s = Math.sin(a); return [[x, y], [x + c * l * 0.42 - s * w, y + s * l * 0.42 + c * w], [x + c * l, y + s * l], [x + c * l * 0.42 + s * w, y + s * l * 0.42 - c * w]]; };
  const collina = (y, amp = 0, wl = 300, ph = 0, x0 = -5200, x1 = 5200) => { const q = []; for (let x = x0; x <= x1; x += 80) q.push([x, y + amp * Math.sin(x / wl + ph) + amp * 0.38 * Math.sin(x / (wl * 0.37) + ph * 2) + r(-1.6, 1.6)]); q.push([x1, y + 5000], [x0, y + 5000]); return q; };
  const onda = (y, amp, wl) => { const q = []; for (let x = -5200; x <= 5200; x += wl / 6) q.push([x, y - amp * Math.abs(Math.sin((x / wl) * Math.PI))]); q.push([5200, y + 5000], [-5200, y + 5000]); return q; };
  const nuvola = (x, y, k) => [ell(x - 70 * k, y - 22 * k, 62 * k, 34 * k), ell(x + 8 * k, y - 40 * k, 78 * k, 50 * k), ell(x + 86 * k, y - 20 * k, 58 * k, 30 * k), rett(x - 130 * k, y - 20 * k, x + 142 * k, y)];
  const cipresso = (x, b, h, col = '#3f5230') => { const k = h / 230; return carta(taglia([[x - 6, b], [x - 28 * k, b - h * 0.3], [x - 21 * k, b - h * 0.68], [x, b - h], [x + 19 * k, b - h * 0.66], [x + 28 * k, b - h * 0.28], [x + 6, b]], 34, 2.4), col, { sh: [6, 6] }); };
  const fico = (x, b, k) => { const pale = [[0, -46, 30, 44, 0], [-42, -116, 26, 38, -0.45], [38, -122, 28, 40, 0.35], [-12, -186, 24, 34, 0.1], [62, -192, 22, 30, 0.55]]; return [
    carta(pale.map(([a, c, rx, ry, rot]) => ell(x + a * k, b + c * k, rx * k, ry * k, rot)), '#7c964f', { sh: [5, 5] }),
    carta([[-56, -150], [-34, -156], [26, -160], [48, -162], [70, -222]].map(([a, c]) => ell(x + a * k, b + c * k, 8 * k, 11 * k, 0, 7)), '#d9663a')]; };
  const vite = (x, b, k) => { // vite ad alberello: tronco basso e attorcigliato, tre ciuffi di foglie, due grappoli
    const T = (a, c) => [x + a * k, b + c * k], sc = [], ch = [], gr = [];
    [[-74, -172], [-6, -206], [66, -170]].forEach(([a, c]) => { for (let i = 0; i < 9; i++) { const an = r(0, TAU), q = r(4, 26), px = x + (a + Math.cos(an) * q) * k, py = b + (c + Math.sin(an) * q * 0.7) * k; (i % 3 ? sc : ch).push(foglia(px, py, an, 40 * k, 13 * k)); } });
    [[-34, -116], [36, -112]].forEach(([a, c]) => [[0, 0], [-9, 0], [9, 0], [-5, 12], [5, 12], [0, 24]].forEach(([u, v]) => gr.push(ell(x + (a + u) * k, b + (c + v) * k, 7 * k, 7 * k, 0, 7))));
    return [carta([T(-12, 0), T(-5, -58), T(-14, -104), T(-74, -164), T(-64, -178), T(-6, -128), T(-3, -196), T(9, -196), T(8, -126), T(58, -172), T(70, -160), T(14, -100), T(10, -50), T(15, 0)], '#4d3a2a', { sh: [4, 4] }),
      carta(sc, '#6f8040', { sh: [3, 4] }), carta(ch, '#94a356'), carta(gr, '#43183a')];
  };
  const papavero = (x, b, h, k) => { const t = x + r(-14, 14), petali = [0, 1, 2, 3].map((i) => ell(t + Math.cos((i / 4) * TAU) * 13 * k, b - h + Math.sin((i / 4) * TAU) * 11 * k, 17 * k, 14 * k, 0, 8)); return [
    tratto([[x, b], [(x + t) / 2 + r(-5, 5), b - h / 2], [t, b - h]], '#46552a', 4 * k), carta(petali, '#c8321f', { sh: [3, 3] }), carta(ell(t, b - h, 6 * k, 6 * k, 0, 7), '#231712')]; };
  window.Carta = { TAU, R, r, rgb, tracciato, carta, tratto, taglia, ell, rett, arco, foglia, collina, onda, nuvola, cipresso, fico, vite, papavero };
})();
