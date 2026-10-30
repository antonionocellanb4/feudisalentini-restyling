/* Matita: il motore del disegno a mano delle prove del giro 3 (rif. campagna Prada "Animated by hand"). Canvas 2D, script classico.
   Ogni tratto è una linea densa (un punto ogni ~3,5px) che a ogni fotogramma del "boil" (10 al secondo) viene spostata da un rumore
   liscio: il disegno trema come un'animazione rifatta a mano foglio per foglio. Con reduced motion il fotogramma resta fermo.
   Grana della matita = pattern di rumore usato come colore del tratto; acquerello = poligono riempito più volte con bordi diversi.
   Uso: const t = Matita.stroke(punti, {w, color}); nel disegno della Sheet: Matita.draw(ctx, t, f). Piano: tools/PIANO-giro3.md */
window.Matita = (() => {
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FPS = 10;
  const GRAPHITE = '#2f2925';
  const TAU = Math.PI * 2;

  /* ---- numeri: hash intero, rumore 1D liscio, generatore con seme ---- */
  const hash = (n) => { n |= 0; n = Math.imul(n ^ (n >>> 16), 0x45d9f3b); n = Math.imul(n ^ (n >>> 16), 0x45d9f3b); n ^= n >>> 16; return ((n >>> 0) / 4294967295) * 2 - 1; };
  const noise = (x, seed) => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f), a = hash(i + seed * 7919), b = hash(i + 1 + seed * 7919); return a + (b - a) * u; };
  const rng = (seed) => () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  let nextSeed = 1;

  /* ---- geometria ---- */
  const cumul = (p) => { const c = [0]; for (let i = 1; i < p.length; i++) c.push(c[i - 1] + Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1])); return c; };
  const resample = (p, n) => {
    const c = cumul(p), L = c[c.length - 1], out = [];
    if (p.length < 2 || !L) return Array.from({ length: n }, () => p[0].slice());
    for (let i = 0, j = 0; i < n; i++) {
      const s = (L * i) / (n - 1);
      while (j < c.length - 2 && c[j + 1] < s) j++;
      const k = (s - c[j]) / (c[j + 1] - c[j] || 1);
      out.push([p[j][0] + (p[j + 1][0] - p[j][0]) * k, p[j][1] + (p[j + 1][1] - p[j][1]) * k]);
    }
    return out;
  };
  const densify = (p, step = 3.5) => { const c = cumul(p); return resample(p, Math.max(2, Math.ceil(c[c.length - 1] / step) + 1)); };
  // curva morbida che passa per i punti di controllo (Catmull-Rom)
  const smooth = (pts, closed = false, steps = 8) => {
    const P = closed ? [pts[pts.length - 1], ...pts, pts[0], pts[1]] : [pts[0], ...pts, pts[pts.length - 1]], out = [];
    for (let i = 1; i < P.length - 2; i++) for (let k = 0; k < steps; k++) {
      const t = k / steps, t2 = t * t, t3 = t2 * t, p0 = P[i - 1], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2];
      out.push([0, 1].map((d) => 0.5 * (2 * p1[d] + (p2[d] - p0[d]) * t + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * t2 + (3 * p1[d] - p0[d] - 3 * p2[d] + p3[d]) * t3)));
    }
    out.push(P[P.length - 2].slice());
    return out;
  };
  // ellisse a mano: parte da a0 e fa poco più di un giro, così il tratto si chiude sovrapponendosi come in un disegno vero
  const ellipse = (cx, cy, rx, ry, rot = 0, a0 = -Math.PI / 2, turns = 1.07, n = 48) => Array.from({ length: n + 1 }, (_, i) => {
    const a = a0 + turns * TAU * (i / n), x = Math.cos(a) * rx, y = Math.sin(a) * ry * (1 + 0.025 * (i / n)); // la fine non torna esatta sul via
    return [cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)];
  });
  const circle = (cx, cy, r, a0, turns) => ellipse(cx, cy, r, r, 0, a0, turns, Math.max(16, Math.round(r * 1.4)));
  // foglia o baccello: forma chiusa a punta tra (x1,y1) e (x2,y2), larga w
  const leaf = (x1, y1, x2, y2, w, bend = 0) => {
    const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
    const q = (t, s) => [x1 + dx * t + nx * (s + bend * Math.sin(Math.PI * t)), y1 + dy * t + ny * (s + bend * Math.sin(Math.PI * t))];
    return smooth([[x1, y1], q(0.28, w * 0.85), q(0.62, w * 0.8), [x2, y2], q(0.62, -w * 0.8), q(0.28, -w * 0.85), [x1 + nx * 0.6, y1 + ny * 0.6]], false, 6);
  };
  const bbox = (p) => { let a = Infinity, b = Infinity, c = -Infinity, d = -Infinity; for (const [x, y] of p) { if (x < a) a = x; if (y < b) b = y; if (x > c) c = x; if (y > d) d = y; } return { x: a, y: b, w: c - a, h: d - b }; };
  const map = (pts, sx, sy, ox, oy) => pts.map(([x, y]) => [ox + x * sx, oy + y * sy]);

  /* ---- colore: grana della matita come pattern (uno per colore, in cache) ---- */
  const rgb = (h) => { h = h.replace('#', ''); if (h.length === 3) h = [...h].map((c) => c + c).join(''); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); };
  const grains = new Map();
  const grain = (ctx, color) => {
    let g = grains.get(color);
    if (!g) {
      const c = document.createElement('canvas'); c.width = c.height = 128;
      const x = c.getContext('2d'), id = x.createImageData(128, 128), [r, gg, b] = rgb(color), R = rng(7);
      for (let i = 0; i < id.data.length; i += 4) { const v = R(); id.data[i] = r; id.data[i + 1] = gg; id.data[i + 2] = b; id.data[i + 3] = 255 * (v < 0.22 ? 0.18 + v : 0.7 + v * 0.3); }
      x.putImageData(id, 0, 0);
      g = ctx.createPattern(c, 'repeat');
      const d = Math.min(devicePixelRatio || 1, 2); if (g.setTransform && d > 1) g.setTransform(new DOMMatrix().scale(1 / d)); // grana al pixel del dispositivo
      grains.set(color, g);
    }
    return g;
  };

  /* ---- tratti ---- */
  const stroke = (pts, o = {}) => {
    const p = densify(pts, o.step ?? 3.5), c = cumul(p);
    return { p, c, L: c[c.length - 1], w: o.w ?? 1.6, color: o.color ?? GRAPHITE, amp: o.amp ?? 1.1, seed: o.seed ?? nextSeed++,
      sketch: o.sketch ?? true, progress: o.progress ?? 1, alpha: o.alpha ?? 1, f: null, q: null, q2: null };
  };
  // punti spostati dal rumore per il fotogramma f (lunghezza d'onda ~40px: la mano devia piano, non vibra)
  const wobble = (t, f, amp, salt) => {
    const s1 = t.seed * 13 + f * 101 + salt, s2 = s1 + 57, out = new Array(t.p.length);
    for (let i = 0; i < t.p.length; i++) { const s = t.c[i] / 40; out[i] = [t.p[i][0] + noise(s, s1) * amp, t.p[i][1] + noise(s, s2) * amp]; }
    return out;
  };
  const pathOf = (q, c, upto) => {
    const P = new Path2D(); P.moveTo(q[0][0], q[0][1]);
    let i = 1;
    for (; i < q.length && c[i] <= upto; i++) P.lineTo(q[i][0], q[i][1]);
    if (i < q.length && upto > c[i - 1]) { const k = (upto - c[i - 1]) / (c[i] - c[i - 1] || 1); P.lineTo(q[i - 1][0] + (q[i][0] - q[i - 1][0]) * k, q[i - 1][1] + (q[i][1] - q[i - 1][1]) * k); }
    return P;
  };
  const draw = (ctx, t, f, color) => {
    if (t.progress <= 0 || t.alpha <= 0.002) return;
    if (t.f !== f) { t.f = f; t.q = wobble(t, f, t.amp, 0); t.q2 = t.sketch ? wobble(t, f, t.amp * 1.9, 991) : null; t.P = null; }
    const full = t.progress >= 1, upto = t.L * Math.min(1, t.progress);
    let P = full ? t.P : null;
    if (!P) { P = [pathOf(t.q, t.c, upto), t.q2 && pathOf(t.q2, t.c, upto * 0.97)]; if (full) t.P = P; }
    ctx.lineCap = ctx.lineJoin = 'round';
    ctx.strokeStyle = grain(ctx, color || t.color);
    ctx.globalAlpha = t.alpha; ctx.lineWidth = t.w; ctx.stroke(P[0]);
    if (P[1]) { ctx.globalAlpha = t.alpha * 0.42; ctx.lineWidth = Math.max(0.6, t.w * 0.5); ctx.stroke(P[1]); } // secondo passaggio: il tratto doppio dello schizzo
    ctx.globalAlpha = 1;
  };

  /* ---- acquerello: tre veli con bordi diversi, bordo appena più scuro; si espande da un punto (origin) ---- */
  const wash = (pts, o = {}) => {
    const t = stroke(pts, { step: 6, amp: o.amp ?? 3, seed: o.seed });
    const b = bbox(t.p), origin = o.origin ?? [b.x + b.w / 2, b.y + b.h / 2];
    t.color = o.color ?? '#b8452f'; t.alpha = o.alpha ?? 0.5; t.origin = origin; t.progress = o.progress ?? 1;
    t.reach = Math.max(...t.p.map(([x, y]) => Math.hypot(x - origin[0], y - origin[1]))) * 1.08;
    return t;
  };
  const closedPath = (q) => { const P = new Path2D(); P.moveTo(q[0][0], q[0][1]); for (let i = 1; i < q.length; i++) P.lineTo(q[i][0], q[i][1]); P.closePath(); return P; };
  const drawWash = (ctx, t, f) => {
    if (t.progress <= 0 || t.alpha <= 0.002) return;
    const ff = Math.floor(f / 2); // l'acqua trema più piano della matita
    if (t.f !== ff) { t.f = ff; t.P = [0, 1, 2].map((k) => closedPath(wobble(t, ff, t.amp * (1 + k * 0.7), k * 31))); }
    ctx.save();
    if (t.progress < 1) { // la macchia che si allarga: cerchio a bordo irregolare
      const r = t.reach * t.progress, C = new Path2D();
      for (let i = 0; i <= 40; i++) { const a = (i / 40) * TAU, rr = r * (1 + noise(i * 0.45, t.seed + 3) * 0.14); C[i ? 'lineTo' : 'moveTo'](t.origin[0] + Math.cos(a) * rr, t.origin[1] + Math.sin(a) * rr); }
      ctx.clip(C);
    }
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = t.color;
    t.P.forEach((P) => { ctx.globalAlpha = t.alpha * 0.36; ctx.fill(P); });
    ctx.strokeStyle = t.color; // il pigmento si accumula sul bordo, come nell'acquerello vero
    ctx.globalAlpha = t.alpha * 0.14; ctx.lineWidth = 7; ctx.stroke(t.P[1]);
    ctx.globalAlpha = t.alpha * 0.32; ctx.lineWidth = 1.3; ctx.stroke(t.P[2]);
    ctx.restore();
  };

  /* ---- tratteggio: linee parallele ritagliate dentro una forma chiusa ---- */
  const hatch = (poly, o = {}) => {
    const b = bbox(poly), a = o.angle ?? -0.8, gap = o.gap ?? 7, cx = b.x + b.w / 2, cy = b.y + b.h / 2, R = Math.hypot(b.w, b.h) / 2 + 4;
    const ux = Math.cos(a), uy = Math.sin(a), lines = [], rnd = rng(o.seed ?? 4);
    for (let d = -R; d <= R; d += gap * (0.75 + rnd() * 0.5)) { // passo e lunghezza irregolari, come a mano
      const ox = cx - uy * d, oy = cy + ux * d, k = Math.sqrt(Math.max(0, R * R - d * d)), k0 = -k * (1 - rnd() * 0.3), k1 = k * (1 - rnd() * 0.3);
      lines.push(stroke([[ox + ux * k0, oy + uy * k0], [ox + ux * k1, oy + uy * k1]], { w: (o.w ?? 1) * (0.7 + rnd() * 0.6), color: o.color, amp: 0.9, sketch: false, step: 6 }));
    }
    // shade = cerchio di luce: il tratteggio resta solo fuori, sul lato in ombra (una mezzaluna)
    let out = null;
    if (o.shade) { const { x, y, r } = o.shade; out = new Path2D(); out.rect(b.x - 50, b.y - 50, b.w + 100, b.h + 100); out.moveTo(x + r, y); out.arc(x, y, r, 0, TAU); }
    return { lines, clip: closedPath(poly), out, progress: o.progress ?? 1, alpha: o.alpha ?? 0.5 };
  };
  const drawHatch = (ctx, h, f) => {
    if (h.progress <= 0 || h.alpha <= 0.002) return;
    ctx.save(); ctx.clip(h.clip); if (h.out) ctx.clip(h.out, 'evenodd');
    const n = h.lines.length;
    h.lines.forEach((l, i) => { l.progress = clamp(h.progress * n * 1.4 - i * 1.4 + 1); l.alpha = h.alpha; draw(ctx, l, f); });
    ctx.restore();
  };

  /* ---- foglio: canvas a misura del suo box, si ridisegna a ogni fotogramma del boil o di continuo mentre qualcosa si muove ---- */
  class Sheet {
    constructor(canvas, render, onResize) {
      this.cv = canvas; this.ctx = canvas.getContext('2d'); this.render = render; this.onResize = onResize;
      this.until = 0; this.f = -1; this.vis = true; this.dirty = true;
      this.resize();
      new ResizeObserver(() => { const r = this.cv.getBoundingClientRect(); if (Math.abs(r.width - this.w) > 0.5 || Math.abs(r.height - this.h) > 0.5) this.resize(); }).observe(canvas); // anche quando cresce la sezione, non solo la finestra
      new IntersectionObserver(([e]) => { this.vis = e.isIntersecting; }).observe(canvas);
      const loop = (now) => {
        requestAnimationFrame(loop);
        if (!this.vis || document.hidden) return;
        const f = RM ? 0 : Math.floor((now / 1000) * FPS);
        if (f === this.f && now > this.until && !this.dirty) return;
        this.f = f; this.dirty = false;
        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
        this.ctx.clearRect(0, 0, this.w, this.h);
        this.render(this.ctx, f, now);
      };
      requestAnimationFrame(loop);
    }
    resize() {
      const r = this.cv.getBoundingClientRect();
      this.dpr = Math.min(devicePixelRatio || 1, 2); this.w = r.width; this.h = r.height;
      this.cv.width = Math.round(r.width * this.dpr); this.cv.height = Math.round(r.height * this.dpr);
      this.dirty = true; this.onResize?.(this.w, this.h);
    }
    kick(ms = 1000) { this.until = Math.max(this.until, performance.now() + ms); } // ridisegno continuo per ms (animazioni gsap)
  }

  return { RM, FPS, GRAPHITE, TAU, noise, rng, clamp, cumul, resample, densify, smooth, ellipse, circle, leaf, bbox, map, rgb,
    stroke, draw, wash, drawWash, hatch, drawHatch, Sheet };
})();
