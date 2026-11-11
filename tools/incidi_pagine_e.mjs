// Le incisioni delle pagine azienda-e e vino-e, nello stile di moderna-e (6 e 10 nov 2026): stessi pezzi di disegno di js/moderna-e.js
// (la linea da incisione, le dieci scene delle schede, i piatti incisi), presi da lì così come sono, più la masseria d'apertura e la medaglia.
// Scrive assets/incisioni/<scena>.svg (js/pagine-e.js le carica e le mette nella pagina, pronte a disegnarsi da sole: pathLength 1)
// e assets/incisioni/piatti/<cibo>.svg (immagini ferme). Il tratteggio nel colore del vino è class="v": lo colora --vino del css.
// uso: node tools/incidi_pagine_e.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const R0 = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = readFileSync(join(R0, 'js', 'moderna-e.js'), 'utf8');
const pezzo = (da, a) => { const i = src.indexOf(da), j = a ? src.indexOf(a, i) : src.indexOf('\n', i); if (i < 0 || j < 0) throw new Error(`moderna-e.js è cambiato: non trovo ${da}`); return src.slice(i, j); };
const codice = [pezzo('  let seme = 11;', '  /* ---- gruppi'), pezzo('  const cirro = '), pezzo('  const TR = '), pezzo('  const BORDO = ', '  const piatta = '), pezzo('  const PIEDE = 214', '  const disegnoInciso = ')].join('\n');
globalThis.Path2D = class { moveTo() {} lineTo() {} }; // il disegno qui diventa SVG: i Path2D del canvas non servono
const INK = '#2b221c', ORO = '#a98a4a', TENUE = '#8f8172', TERRA = '#9a4a32', VINO = '#010203'; // VINO: segnaposto, diventa class="v"
const P = new Function('INK', 'ORO', 'TENUE', 'TERRA', 'TAU', `${codice}\nreturn { R, r, riga, cerchio, arcoP, chiudi, tratteggio, fogliaVite, grappolo, viticcio, ramo, cipresso, foglioline, PIEDE, SCENE, BORDO, MOTIVI, liscia, cirro, gabbiani, barca, spiga, papavero, chioma, pajara, mur, torreta, calice };`)(INK, ORO, TENUE, TERRA, Math.PI * 2);
const { R, r, riga, cerchio, arcoP, chiudi, tratteggio, fogliaVite, grappolo, viticcio, ramo, cipresso, foglioline, PIEDE, SCENE, BORDO, MOTIVI, liscia, cirro, gabbiani, barca, spiga, papavero, chioma, pajara, mur, torreta, calice } = P;
const TAU = Math.PI * 2;

// l'apertura: la masseria con la torre e il portale d'oro, come in moderna-e; le mura finiscono contro la torre
const masseria = () => {
  const B = PIEDE, hB = 130, top = B - hB, tx = 56, tTop = top - 84, k = tx / 74, x0 = -330, x1 = 330, out = [], occ = [];
  const merli = (a, b, y, p0 = 30) => { const n = Math.round((b - a) / p0), p = (b - a) / n, q = [[a, y]]; for (let i = 0; i < n; i++) { const x = a + i * p; q.push([x, y - 14], [x + p / 2, y - 14], [x + p / 2, y], [x + p, y]); } return q; };
  occ.push([[x0, B], [x0, top], [x1, top], [x1, B]]);
  out.push(riga([[x0, B], ...merli(x0, -tx, top)], INK, 1.3), riga([...merli(tx, x1, top), [x1, B]], INK, 1.3), riga([[x0, top + 14], [-tx, top + 14]], INK, 0.7), riga([[tx, top + 14], [x1, top + 14]], INK, 0.7));
  for (const i of [-3, -2, -1, 1, 2, 3]) { const x = i * 92, f = arcoP(x, top + hB * 0.5, 26, 46, 8); out.push(riga(f, INK, 1), ...tratteggio(f.slice(0, -1), 1.1, 4, INK, 0.5), riga(arcoP(x, B - 4, 34, 56, 8), INK, 0.9)); }
  for (let i = 0; i < 46; i++) { const x = r(x0 + 8, x1 - 50), y = r(top + 24, B - 8); if (Math.abs(x) > tx + 30) out.push(riga([[x, y], [x + r(12, 38), y]], TENUE, 0.6)); }
  out.push(...tratteggio([[x1 - 70, top + 14], [x1, top + 14], [x1, B], [x1 - 70, B]], -1, 7, INK, 0.5));
  occ.push([[-tx, B], [-tx, tTop], [tx, tTop], [tx, B]]);
  const cor = [[0, 0.53], [17.69, 13.2], [30.02, 0.34], [42.35, 13.2], [60.05, 0.53], [60.05, 23.31], [0, 23.31]].map(([a, c]) => [(a - 30.025) * ((tx * 2) / 60.05), tTop - 8 - (23.31 - c) * 2.5 * k]); occ.push(cor);
  out.push(riga([[-tx, B], [-tx, tTop], [tx, tTop], [tx, B]], INK, 1.3), riga(chiudi(cor), INK, 1.3), ...tratteggio([[tx * 0.4, tTop], [tx, tTop], [tx, B], [tx * 0.4, B]], -1, 6, INK, 0.5));
  for (let i = 0; i < 12; i++) { const x = r(-tx + 6, tx * 0.2), y = r(tTop + 8, B - 8); if (Math.abs(x) > 40 * k || y < B - 130 * k) out.push(riga([[x, y], [x + r(10, 22), y]], TENUE, 0.6)); }
  const porta = arcoP(0, B, 66 * k, 118 * k, 12); out.push(riga(arcoP(0, B, 84 * k, 130 * k, 12), INK, 1), riga(porta, ORO, 1.5), riga([[0, B], [0, B - 118 * k]], ORO, 1), ...tratteggio(porta.slice(0, -1), 1.57, 8, ORO, 0.7));
  for (const q of [-1, 1]) out.push(riga(arcoP(q * 30 * k, tTop + 58 * k, 22 * k, 44 * k, 8), INK, 1));
  return [{ occ, righe: out }, cipresso(x0 - 42, B + 2, 210), cipresso(x0 - 96, B + 2, 150, 0.8), cipresso(x1 + 46, B + 2, 230)];
};

// i riconoscimenti: una medaglia appesa al nastro, la zigrinatura, l'alloro e al centro il grappolo
const medaglia = () => {
  const cy = -10, Rm = 150, a0 = cy - Rm + 4, out = [];
  out.push({ occ: [[-64, -300], [-20, a0], [20, a0], [64, -300]], righe: [riga([[-64, -300], [-20, a0]], INK, 1.1), riga([[64, -300], [20, a0]], INK, 1.1), riga([[-20, a0], [20, a0]], INK, 1), riga([[-42, -300], [0, a0 - 30], [42, -300]], INK, 0.6), ...tratteggio([[0, -300], [64, -300], [20, a0], [0, a0]], -1.2, 6, ORO, 0.6)] });
  const disco = cerchio(0, cy, Rm, Rm, 0, 96), righe = [riga(disco, INK, 1.3), riga(cerchio(0, cy, Rm - 7, Rm - 7, 0, 96), INK, 0.6), riga(cerchio(0, cy, Rm - 24, Rm - 24, 0, 84), ORO, 1.2), riga(cerchio(0, cy, Rm - 28, Rm - 28, 0, 84), ORO, 0.6)];
  for (let i = 0; i < 80; i++) { const a = (i / 80) * TAU; righe.push(riga([[Math.cos(a) * (Rm - 8), cy + Math.sin(a) * (Rm - 8)], [Math.cos(a) * (Rm - 22), cy + Math.sin(a) * (Rm - 22)]], INK, 0.5)); }
  out.push({ occ: disco, righe });
  const ra = Rm - 52;
  for (const q of [-1, 1]) {
    const a = (t) => Math.PI / 2 + q * t; // dal basso, su per il fianco
    out.push(riga(Array.from({ length: 22 }, (_, i) => { const t = 0.18 + (i / 21) * 2.2; return [Math.cos(a(t)) * ra, cy + Math.sin(a(t)) * ra]; }), INK, 0.9));
    for (let i = 0; i < 9; i++) { const t = 0.3 + i * 0.24, x = Math.cos(a(t)) * ra, y = cy + Math.sin(a(t)) * ra, tg = Math.atan2(q * Math.cos(a(t)), -q * Math.sin(a(t))); for (const s of [-1, 1]) out.push(foglioline(x, y, tg + s * 0.55, 26 - i * 0.8, 7)); }
  }
  out.push(grappolo(0, cy - 40, 2.3), viticcio(6, cy - 66, -0.6, 1.2));
  return out;
};


// 11 nov, "il disegno della hero deve continuare nei lati": per l'apertura della scheda (in verticale) ogni scena ha anche la versione larga,
// <scena>-largo.svg: il riquadro di 600 resta com'è e ai lati, fino a ±L, continua il suo paesaggio (orizzonte, onde, colli, filari, pergola, stelle)
const L = 1300, LATI2 = [[-L, -300], [300, L]];
const suoloL = (y) => LATI2.map(([a, b]) => riga([[a, y], [b, y]], INK, 1));
const colleL = (pts, v, base = PIEDE) => { const q = liscia(pts, false, 6); return [riga(q, INK, 1), ...tratteggio([...q, [q.at(-1)[0], base], [q[0][0], base]], 0.1, 11, v, 0.7)]; };
const ondeL = (h) => { const out = []; for (let i = 0; i < 13; i++) { const q = i / 12, y = h + 10 + (298 - h - 10) * q ** 1.45, am = 1.5 + q * 5, wl = 26 + q * 44; for (const [a, b] of LATI2) for (let x = a + r(0, 40); x < b;) { const l = r(70, 190) * (0.6 + q), p = []; for (let u = x; u < Math.min(b, x + l); u += 8) p.push([u, y + Math.sin(u / wl + i * 1.3) * am]); if (p.length > 1) out.push(riga(p, INK, 0.6 + q * 0.5)); x += l + r(14, 46); } } return out; };
const cirri = (pos) => pos.flatMap(([x, y, l]) => cirro(x, y, l));
const vigna = (x0, x1) => { const out = []; for (let x = x0; x < x1; x += r(84, 104)) { const t = x + r(-6, 6), y = PIEDE - r(30, 40); out.push(riga([[x, PIEDE], [x + r(-3, 3), PIEDE - 18], [t, y]], INK, 0.9), fogliaVite(t, y, -2.4 + r(-0.3, 0.3), r(22, 28)), fogliaVite(t, y, -0.7 + r(-0.3, 0.3), r(22, 28))); } return out; };
const olivo = (x, k) => { const P = (l) => l.map(([u, v]) => [x + u * k, PIEDE + v * k]); return [ramo(P([[0, 4], [-20, -70], [14, -140], [-8, -200]]), 18 * k, 9 * k), chioma(P([[-8, -200], [-90, -256], [-190, -262]]), 7 * k, 7), chioma(P([[-8, -200], [70, -250], [160, -246]]), 6 * k, 6)]; };
const LATI = {
  vite: (v) => [colleL([[-L, 160], [-1100, 124], [-880, 150], [-680, 100], [-470, 138], [-300, PIEDE]], v), colleL([[300, PIEDE], [470, 128], [690, 92], [920, 142], [1120, 110], [L, 150]], v), suoloL(PIEDE),
    cipresso(-640, PIEDE, 190, 0.85), cipresso(-588, PIEDE, 124, 0.62), cipresso(860, PIEDE, 210, 0.9), cipresso(1190, PIEDE, 150, 0.72), vigna(-L, -330), vigna(330, L)],
  grappolo: (v) => [colleL([[-L, 150], [-1060, 112], [-820, 146], [-600, 108], [-420, 150], [-300, PIEDE]], v), colleL([[300, PIEDE], [440, 140], [640, 102], [880, 136], [1100, 104], [L, 140]], v), suoloL(PIEDE),
    cipresso(-760, PIEDE, 200, 0.88), cipresso(980, PIEDE, 180, 0.8), cipresso(1036, PIEDE, 120, 0.6), vigna(-L, -330), vigna(330, L)],
  filari: (v) => { const h = 96, out = LATI2.map(([a, b]) => riga(Array.from({ length: Math.round((b - a) / 30) + 1 }, (_, i) => [a + i * 30, h - 5 * Math.sin((a + i * 30 + 300) / 37.5) - 3]), INK, 1));
    for (const s of [-1, 1]) for (let a = 8; a <= 42; a += 2) { const xb = s * a * 50; out.push(riga([[xb * 0.08, h + 2], [xb, 300]], TERRA, 0.75)); /* ai lati un solco su due: la terra rossa non diventa una macchia */ if (a % 4 === 0) for (let k = 0; k < 3; k++) { const q = ((k + 0.5) / 6) ** 1.6, x = xb * (0.08 + 0.92 * q), y = h + (300 - h) * q, z = 0.4 + q * 1.1; if (Math.abs(x) < L) out.push(riga([[x, y], [x + 2 * z, y - 22 * z]], INK, 0.8), fogliaVite(x + 2 * z, y - 20 * z, -2.5, 15 * z), fogliaVite(x + 2 * z, y - 20 * z, -0.64, 15 * z)); } }
    return [out, cipresso(-560, h + 2, 120, 0.6), cipresso(-520, h + 2, 84, 0.46), cipresso(900, h + 2, 110, 0.56)]; },
  pajara: (v) => [cirri([[-1100, -240, 200], [-700, -190, 150], [600, -250, 190], [1000, -200, 150]]), suoloL(PIEDE), mur(-L, -720, PIEDE), pajara(-520, PIEDE + 2, 0.5, v), mur(300, 1060, PIEDE), cipresso(1150, PIEDE, 180, 0.8), olivo(-960, 0.56)],
  ulivo: (v) => [colleL([[-L, 150], [-1080, 118], [-860, 140], [-640, 100], [-440, 130], [-300, 176]], v, 176), colleL([[300, 176], [460, 126], [680, 104], [900, 138], [1100, 112], [L, 146]], v, 176), suoloL(176), suoloL(PIEDE),
    Array.from({ length: 40 }, () => { const x = (R() < 0.5 ? -1 : 1) * r(310, L), y = r(190, PIEDE - 2); return riga([[x, y], [x + r(-6, 6), y - r(6, 12)]], TENUE, 0.7); }),
    olivo(-720, 0.62), olivo(860, 0.7), Array.from({ length: 5 }, (_, i) => papavero(-420 - i * 30 + r(-8, 8), PIEDE + r(-6, 6), r(40, 90), r(0.75, 0.95)))],
  campo: (v) => [cirri([[-1100, -230, 190], [-640, -260, 160], [560, -236, 180], [1000, -260, 150]]), colleL([[-L, 150], [-1060, 104], [-820, 132], [-560, 92], [-400, 150], [-300, PIEDE]], v), colleL([[300, PIEDE], [430, 132], [640, 90], [880, 128], [1120, 96], [L, 130]], v), suoloL(PIEDE),
    Array.from({ length: 22 }, (_, i) => { const a = r(320, L); return spiga((i % 2 ? 1 : -1) * a, PIEDE + r(-2, 6), r(70, 150)); }), Array.from({ length: 14 }, (_, i) => papavero((i % 2 ? 1 : -1) * r(330, L), PIEDE + r(-4, 8), r(40, 110), r(0.8, 1.15)))],
  mare: (v) => { const h = 112, cap = liscia([[560, h], [640, h - 14], [780, h - 26], [960, h - 20], [1100, h - 34], [L, h - 30]], false, 6);
    return [suoloL(h), ondeL(h), cirri([[-1150, -230, 200], [-760, -170, 150], [520, -250, 190], [980, -200, 160]]), gabbiani([[-640, -60, 0.8], [-600, -84, 0.6], [760, -40, 0.7]]), barca(-860, h + 18, 0.42), { occ: [...cap, [L, h], [560, h]], righe: [riga(cap, INK, 1), ...tratteggio([...cap, [L, h]], -1, 7, INK, 0.45)] }]; },
  torre: (v) => { const h = 128, sc = liscia([[300, PIEDE - 34], [420, PIEDE - 58], [560, PIEDE - 50], [700, PIEDE - 86], [860, PIEDE - 74], [1040, PIEDE - 102], [L, PIEDE - 96]], false, 6);
    return [suoloL(h), ondeL(h), cirri([[-1150, -236, 200], [-760, -160, 150], [560, -240, 180], [1000, -180, 150]]), gabbiani([[-620, -40, 0.8], [-580, -66, 0.6]]), barca(-900, h + 12, 0.4), { occ: [...sc, [L, 300], [300, 300]], righe: [riga(sc, INK, 1.1), ...Array.from({ length: 40 }, () => { const x = r(320, L - 20), y = r(PIEDE - 20, 296); return riga([[x, y], [x + r(10, 26), y + r(4, 12)]], INK, 0.6); })] }, cipresso(1000, PIEDE - 100, 150, 0.7)]; },
  pergola: (v) => { const h = 132, top = -262, out = [suoloL(h), suoloL(PIEDE)], fili = [];
    for (const x of [-1310, -786, 786, 1310]) out.push(ramo([[x - 3, PIEDE + 2], [x + 4, 60], [x - 2, -100], [x, top]], 8, 6));
    for (const [a, b] of LATI2) { out.push(riga([[a, top - 8], [b, top - 8]], INK, 1.2), riga([[a, top + 6], [b, top + 6]], INK, 1.2)); for (let x = a + 10; x < b; x += 58) out.push(riga([[x, top - 13], [x + 16, top + 12]], INK, 0.7)); for (let x = a + 20; x < b; x += r(36, 48)) out.push(fogliaVite(x, top + r(2, 18), 1.57 + r(-0.9, 0.9), r(34, 48))); }
    for (const x of [-1180, -1000, -640, -440, 440, 640, 1000, 1180]) out.push(grappolo(x, top + 36, 1));
    [[-1310, -1048], [-1048, -786], [-786, -524], [-524, -262], [262, 524], [524, 786], [786, 1048], [1048, 1310]].forEach(([a, b]) => { const c = Array.from({ length: 13 }, (_, i) => { const u = i / 12; return [a + (b - a) * u, top + 14 + 4 * u * (1 - u) * 64]; }); fili.push(riga(c, INK, 0.8)); for (let i = 1; i < 12; i += 2) { const o = cerchio(c[i][0], c[i][1] + 9, 6, 6, 0, 12); fili.push({ occ: o, righe: [riga(o, ORO, 1.2)] }); } });
    return [out, fili]; },
  masseria: () => [cirri([[-1100, -220, 190], [-700, -250, 150], [640, -240, 180], [1040, -200, 150]]), suoloL(PIEDE), mur(-L, -760, PIEDE), olivo(-600, 0.6), cipresso(560, PIEDE, 170, 0.8), olivo(820, 0.66), mur(980, L, PIEDE)],
  calici: (v) => { const st = []; for (const [a, b] of LATI2) for (let x = a + 20; x < b; x += 68) for (let w = 0; w < 4; w++) { const xx = x + r(-22, 22), y = -284 + w * 50 + r(-14, 14), q = r(3, 6); st.push(riga([[xx - q, y], [xx + q, y]], ORO, 0.9), riga([[xx, y - q], [xx, y + q]], ORO, 0.9)); } return [st, suoloL(PIEDE)]; },
};
// le scene: la masseria è più larga (le mura escono dal riquadro); le dieci di moderna-e col tratteggio nel colore del vino
const SCENE_E = { masseria: { vb: '-450 -300 900 600', cose: masseria }, medaglia: { cose: medaglia }, ...Object.fromEntries(Object.keys(SCENE).map((k) => [k, { cose: () => SCENE[k](VINO) }])),
  ...Object.fromEntries(Object.keys(LATI).map((k) => [`${k}-largo`, { vb: `${-L} -300 ${2 * L} 600`, cose: () => [k === 'masseria' ? masseria() : SCENE[k](VINO), LATI[k](VINO)] }])) }; // le larghe dopo: le scene di sempre restano identiche
const n1 = (v) => v.toFixed(1);
const d = (rr) => { const per = new Map(); rr.flat(Infinity).forEach((s) => { const q = `${s.c}|${s.w}`; if (!per.has(q)) per.set(q, { c: s.c, w: s.w, d: '' }); per.get(q).d += `M${s.pts.map(([x, y]) => `${n1(x)} ${n1(y)}`).join('L')}`; });
  return [...per.values()].map((p) => `<path class="t${p.c === VINO ? ' v' : ''}"${p.c === VINO ? '' : ` stroke="${p.c}"`} stroke-width="${p.w}" pathLength="1" d="${p.d}"/>`).join(''); };
const DIR = join(R0, 'assets', 'incisioni');
mkdirSync(join(DIR, 'piatti'), { recursive: true });
for (const [k, { vb = '-300 -300 600 600', cose }] of Object.entries(SCENE_E)) {
  const lista = [cose()].flat(Infinity).filter(Boolean), unite = [], pezzi = [];
  lista.forEach((c) => (c.righe ? pezzi.push(c) : unite.push(c))); // le linee sciolte insieme, poi i pezzi col loro fondo pieno (come la scheda di moderna-e)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" class="inc" viewBox="${vb}" aria-hidden="true" focusable="false">${d(unite)}${pezzi.map((c) => `<path class="o" d="${(typeof c.occ[0][0] === 'number' ? [c.occ] : c.occ).map((q) => `M${q.map(([x, y]) => `${n1(x)} ${n1(y)}`).join('L')}Z`).join('')}"/>${d(c.righe)}`).join('')}</svg>`;
  if (!svg.includes('class="t')) throw new Error(`scena ${k} vuota`);
  writeFileSync(join(DIR, `${k}.svg`), svg);
  console.log(k, Math.round(svg.length / 1024), 'KB');
}
// 11 nov, il brindisi della fine di azienda-e: la scena dei calici con i due calici in gruppi a parte (.sx e .dx), così js/azienda-e.js li fa toccare
{
  const tutto = SCENE.calici(VINO), cal = tutto.slice(-2), resto = tutto.slice(0, -2), occ = (c) => (typeof c.occ[0][0] === 'number' ? [c.occ] : c.occ).map((q) => `M${q.map(([x, y]) => `${n1(x)} ${n1(y)}`).join('L')}Z`).join('');
  if (cal.some((c) => !c.righe)) throw new Error('moderna-e.js è cambiato: gli ultimi due pezzi dei calici non sono i calici');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" class="inc" viewBox="-300 -300 600 600" aria-hidden="true" focusable="false"><g class="cielo">${d(resto)}</g>${cal.map((c, i) => `<g class="${i ? 'dx' : 'sx'}"><path class="o" d="${occ(c)}"/>${d(c.righe)}</g>`).join('')}</svg>`;
  writeFileSync(join(DIR, 'brindisi.svg'), svg);
  console.log('brindisi', Math.round(svg.length / 1024), 'KB');
}
// 11 nov, il mondo dell'apertura di azienda-e ("una navigazione in profondità, come un mondo 3D"): i pezzi singoli, ognuno con la base al centro in basso
// (y = 0), in <defs>; js/azienda-e.js li mette in prospettiva lungo il viale con <use>. Unità come le scene (circa 0,045 m)
{
  const occ = (c) => (typeof c.occ[0][0] === 'number' ? [c.occ] : c.occ).map((q) => `M${q.map(([x, y]) => `${n1(x)} ${n1(y)}`).join('L')}Z`).join('');
  const pezzo = (id, cose, dy = 0) => { const l = [cose].flat(Infinity).filter(Boolean), u = l.filter((c) => !c.righe), p = l.filter((c) => c.righe); return `<g id="${id}"${dy ? ` transform="translate(0 ${dy})"` : ''}>${d(u)}${p.map((c) => `<path class="o" d="${occ(c)}"/>${d(c.righe)}`).join('')}</g>`; };
  // 11 nov (3): il lato in ombra dei cipressi ha il tratteggio (luce da sinistra, come la torre del casale e le ombre sul viale di js/mondo-gl.js)
  const cipOmbra = (h, s) => { const c = cipresso(0, 0, h, s), dx = c.occ.filter(([x]) => x > 0); return { occ: c.occ, righe: [...c.righe, ...tratteggio([...dx, ...dx.map(([x, y]) => [x * 0.3, y]).reverse()], -1, 5, INK, 0.5)] }; };
  // 11 nov (4), "un disegno migliore delle viti e dei muretti", per il mondo in WebGL (l'svg di riserva tiene m-vite e m-muro). Caso a parte (q): gli altri disegni restano identici.
  // Larghezze dei tratti = livelli di dettaglio di js/mondo-gl.js: sotto 0,75 spariscono per primi allontanandosi, sotto 0,95 dopo, gli altri mai
  const q = ((s) => (a, b) => a + ((s = (s * 16807) % 2147483647) / 2147483647) * (b - a))(53);
  // la foglia di vite di moderna-e con meno punti (nel mondo ce ne sono migliaia) e il grappolo con gli acini d'oro
  const foglia = (x, y, a, s) => { const c = Math.cos(a), n = Math.sin(a), T = ([u, v]) => [x + (u * c - v * n) * s, y + (u * n + v * c) * s];
    const met = [[0, 0], [0.08, 0.2], [0.03, 0.4], [0.2, 0.5], [0.3, 0.66], [0.46, 0.56], [0.64, 0.58], [0.7, 0.36], [0.92, 0.16], [1.02, 0]], bordo = liscia([...met, ...met.slice(1, -1).reverse().map(([u, v]) => [u, -v])].map(T), true, 2);
    return { occ: bordo, righe: [riga(bordo, INK, 0.9), riga([T([0, 0]), T([0.86, 0])], INK, 0.6), riga([T([0.08, 0]), T([0.3, 0.5])], INK, 0.6), riga([T([0.08, 0]), T([0.3, -0.5])], INK, 0.6), riga([T([0.42, 0]), T([0.62, 0.4])], INK, 0.6), riga([T([0.42, 0]), T([0.62, -0.4])], INK, 0.6)] }; };
  const uva = (x, y, s) => { const occ = [], righe = [riga([[x, y - 5 * s], [x + q(-3, 3) * s, y - 24 * s]], INK, 0.9)];
    [[0, 0], [-1, 0.2], [1, 0.2], [-1.5, 1], [-0.5, 1], [0.5, 1], [1.5, 1], [-1, 1.8], [0, 1.8], [1, 1.8], [-0.5, 2.6], [0.5, 2.6], [0, 3.4]].forEach(([u, v]) => { const o = cerchio(x + u * 9 * s, y + v * 9 * s, 6 * s, 6 * s, q(0, 1), 8); occ.push(o); righe.push(riga(o, ORO, 0.9)); });
    return { occ, righe }; };
  // l'alberello pugliese, dalla foto vera (assets/photo/alberello.webp): tronco grosso e contorto che si apre a forca in due braccia, le foglie raccolte in cima sui tralci,
  // i grappoli che pendono dalle braccia. Alto circa 150 unità, base in 0,0
  // il legno vecchio: come ramo() di moderna-e ma nodoso (il contorno ingrossa e si stringe, il piede si allarga) e con la corteccia a tratti, più fitta sul lato in ombra, a destra
  const ceppo = (pts, w0, w1, piede = 0) => {
    const s = liscia(pts, false, 8), n = s.length - 1, f1 = q(0, 6), f2 = q(0, 6), sx = [], dx = [];
    const nor = s.map((p, i) => { const a = s[Math.max(0, i - 1)], b = s[Math.min(n, i + 1)], l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [-(b[1] - a[1]) / l, (b[0] - a[0]) / l]; }), larga = (i) => (w0 + (w1 - w0) * (i / n)) * (1 + piede * Math.max(0, 1 - i / 5) ** 2);
    s.forEach((p, i) => { const w = larga(i), a = w * (1 + 0.2 * Math.sin(i * 0.95 + f1)), b = w * (1 + 0.2 * Math.sin(i * 0.75 + f2)); sx.push([p[0] + nor[i][0] * a, p[1] + nor[i][1] * a]); dx.push([p[0] - nor[i][0] * b, p[1] - nor[i][1] * b]); });
    if (piede) for (const l of [sx, dx]) for (let i = 0; i < 4; i++) l[i][1] = Math.min(l[i][1], pts[0][1]); // niente sotto terra: il piede è piatto
    const righe = [riga(sx, INK, 1.2), riga(dx, INK, 1.2)], destra = nor[n >> 1][0] > 0 ? 1 : -1; // da che parte del percorso sta la destra dello schermo
    if (piede) righe.push(riga([sx[0], dx[0]], INK, 1)); // il piede chiuso: il tronco poggia a terra
    for (let i = 1; i < n - 2; i += 2) { const o = destra * q(-0.35, 0.8) * larga(i), l = Math.min(n, i + 2 + Math.round(q(0, 2))), o2 = o + q(-1, 1); righe.push(riga([[s[i][0] + nor[i][0] * o, s[i][1] + nor[i][1] * o], [s[l][0] + nor[l][0] * o2, s[l][1] + nor[l][1] * o2]], INK, 0.5)); }
    return { occ: [...sx, ...dx.slice().reverse()], righe };
  };
  const alberello = () => {
    const F = [q(-9, 9), -q(46, 56)], sp = F[0] < 0 ? 1 : -1, sciolte = [], legno = [], foglie = [], grappoli = [];
    legno.push(ceppo([[q(-2, 2), 0.5], [F[0] * 0.3 + sp * q(3, 6.5), -17], [F[0] * 0.9 - sp * q(1, 4), -34], F], 9.5, 6.6, 0.28)); // prima il tronco, poi le braccia: nascono dalla forca
    for (const lato of [-1, 1]) {
      const C = [F[0] + lato * q(27, 38), F[1] - q(26, 40)], M = [F[0] + lato * q(15, 21), F[1] - q(4, 10)];
      legno.push(ceppo([F, M, C], 5.8, 3.4));
      // due tralci per braccio, uno in su e uno in fuori, con le foglie a destra e a sinistra
      [[[lato * q(6, 14), -q(17, 25)], [lato * q(-4, 12), -q(40, 52)], 3], [[lato * q(13, 20), -q(10, 17)], [lato * q(30, 42), -q(8, 22)], 2]].forEach(([m, e, n], k) => {
        const t = liscia([C, [C[0] + m[0], C[1] + m[1]], [C[0] + e[0], C[1] + e[1]]], false, 4); sciolte.push(riga(t, INK, 0.9));
        for (let i = 0; i < n; i++) { const j = Math.round(((i + 0.8) / n) * (t.length - 1)), p = t[Math.min(t.length - 1, j)], a = t[Math.max(0, j - 1)], dir = Math.atan2(p[1] - a[1], p[0] - a[0]); foglie.push([p[1], foglia(p[0], p[1], dir + (i % 2 ? -1 : 1) * lato * q(0.7, 1.25) * (i === n - 1 ? 0.3 : 1), q(24, 31) * (1 - 0.22 * (i / n)))]); } // l'ultima segue il tralcio
        if (k) { const p = t.at(-1), v = []; for (let i = 0; i < 12; i++) { const u = i / 11, g = (1 - u * 0.8) * 5, b = u * 8; v.push([p[0] + lato * u * 12 + Math.cos(b) * g * u, p[1] - u * 6 + Math.sin(b) * g * u]); } sciolte.push(riga(v, INK, 0.6)); } // il viticcio in punta
      });
      foglie.push([C[1] + 30, foglia(C[0] - lato * 3, C[1] - 3, Math.PI / 2 - lato * q(0.5, 1), q(20, 25))]); // una foglia che pende sul capo del braccio
      if (lato < 0 || q(0, 1) < 0.45) { const u = q(0.45, 0.8), gx = F[0] + (M[0] - F[0]) * u * 1.4, gy = F[1] + (M[1] - F[1]) * u, sc = q(0.56, 0.7); grappoli.push(uva(gx, gy + 26 * sc, sc)); }
    }
    sciolte.push(riga([[-24, 2], [-9, 3.5]], TENUE, 0.6), riga([[10, 3.5], [27, 2]], TENUE, 0.6)); // la terra al piede
    foglie.sort((a, b) => a[0] - b[0]); // dall'alto in basso: quelle basse stanno davanti
    return [sciolte, legno, foglie.map((f) => f[1]), grappoli];
  };
  // il muretto a secco, dalla foto vera (assets/photo/muretto-secco.webp): pietre piccole e piatte a corsi irregolari, in cima le pietre di copertina, l'erba al piede.
  // Un modulo lungo L unità che si ripete: gli estremi combaciano
  const muretto = (L) => {
    const y0 = [0]; [12.5, 9, 11.5, 8.5, 10.5].forEach((h) => y0.push(y0.at(-1) - h - q(-1, 1))); // corsi di altezze diverse
    const N = y0.length - 1, top = y0[N], righe = [], corso = (y, amp) => { const p = []; for (let x = 0; x < L; x += 12) p.push([x, y + (x ? q(-amp, amp) : 0)]); p.push([L, y]); return p; };
    const ys = y0.map((y, i) => corso(y, i ? 2.3 : 0.5)), alt = (i, x) => { const p = ys[i], k = Math.max(0, Math.min(p.length - 2, Math.floor(x / 12))), t = (x - p[k][0]) / (p[k + 1][0] - p[k][0]); return p[k][1] + (p[k + 1][1] - p[k][1]) * t; };
    // le pietre grosse prendono due corsi: lì il giunto fra i corsi manca
    const grosse = ys.map((_, i) => { const g = []; if (i > 0 && i < N) for (let x = q(20, 130); x < L - 44; x += q(90, 230)) g.push([x, x + q(17, 32)]); return g; }), dentro = (i, x) => (grosse[i] || []).some(([a, b]) => x > a - 3 && x < b + 3);
    const tratto = (i, da, a) => [[da, alt(i, da)], ...ys[i].filter((u) => u[0] > da && u[0] < a), [a, alt(i, a)]];
    righe.push(riga(ys[0], INK, 1));
    for (let i = 1; i <= N; i++) { let da = 0; for (const [a, b] of grosse[i]) { righe.push(riga(tratto(i, da, a), INK, 0.85)); da = b; for (const x of [a, b]) righe.push(riga([[x, alt(i - 1, x)], [x + q(-2, 2), alt(i + 1, x)]], INK, 0.6)); } righe.push(riga(tratto(i, da, L), INK, 0.85)); }
    for (let i = 0; i < N; i++) for (let x = q(4, 22); x < L - 4; x += q(10, 31)) { if (dentro(i, x) || dentro(i + 1, x)) continue; const d = q(-3.5, 3.5); righe.push(riga([[x, alt(i, x)], [x + d, alt(i + 1, x + d)]], INK, 0.6)); } // i giunti, sfalsati e un po' storti
    for (let x = q(10, 40); x < L - 20; x += q(26, 60)) { const i = Math.floor(q(0, N)), y = (alt(i, x) + alt(i + 1, x)) / 2 + q(-1.5, 1.5); righe.push(riga([[x, y], [x + q(5, 11), y + q(-1, 1)]], TENUE, 0.5)); } // la grana della pietra
    const cima = [[0, top]], pietre = [];
    for (let x = 0; x < L;) { const w = Math.min(L - x, q(13, 34)), h = q(4.5, 9.5), p = liscia([[x, top], [x + w * q(0.1, 0.26), top - h], [x + w * q(0.7, 0.9), top - h * q(0.65, 1.1)], [x + w, top]], false, 3); cima.push(...p.slice(1)); pietre.push(p); x += w; }
    righe.push(riga(cima, INK, 1.1));
    for (let x = q(10, 50); x < L - 10; x += q(46, 110)) for (const a of [-0.5, 0, 0.45]) righe.push(riga([[x + a * 5, 0], [x + a * 14 + q(-1, 1), -q(6, 11)]], INK, 0.6)); // i ciuffi d'erba
    return { occ: [[[0, 0], [L, 0], [L, top], [0, top]], ...pietre], righe };
  };
  // 11 nov (5), le aggiunte scelte ("va bene tutto tranne il 6"): ulivi rifatti, pajara di pietra, portone coi battenti che si aprono (papaveri e uccelli c'erano già)
  // l'ulivo secolare, come quello accanto alla pajara in assets/photo/pajara.webp: tronco grosso a due fusti con la cavità, tre branche, chioma larga e bassa a ciuffi di foglie piccole
  const ulivo = () => {
    const T = [q(-5, 5), -q(60, 70)], legno = [], ciuffi = []; // T: dove il tronco si apre
    legno.push(ceppo([[q(8, 13), 0.5], [q(14, 19), -22], [T[0] + q(2, 8), -44], [T[0] + q(8, 14), T[1] + 4]], 9.5, 6.5, 0.3)); // il fusto dietro
    const fusto = ceppo([[q(-4, 0), 0.5], [q(-12, -6), -20], [T[0] + q(4, 9), -42], T], 15, 10, 0.4), cx = q(-7, -2), cy = -q(24, 32), cav = liscia([[cx, cy - 11], [cx + 4.5, cy - 3], [cx + 3, cy + 9], [cx - 3.5, cy + 3]], true, 3);
    fusto.righe.push(riga(chiudi(cav), INK, 0.9), ...tratteggio(cav, -1, 2.2, INK, 0.5)); legno.push(fusto); // la cavità del tronco vecchio
    const capi = [[T[0] - q(62, 76), T[1] - q(34, 46)], [T[0] + q(-4, 12), T[1] - q(56, 68)], [T[0] + q(62, 78), T[1] - q(30, 42)]];
    capi.forEach((C) => legno.push(ceppo([T, [T[0] + (C[0] - T[0]) * 0.5 + q(-6, 6), T[1] + (C[1] - T[1]) * 0.42], C], 7, 3.2)));
    const ciuffo = (x, y, rr) => {
      // il bordo del ciuffo è leggero e frastagliato: la sagoma la fanno le foglioline (lancette di quattro tratti), fitte dentro e sporgenti sul bordo
      const f = q(0, 6), b = liscia(Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * 6.283, m = rr * (1 + 0.2 * Math.sin(a * 5 + f) + q(-0.1, 0.1)); return [x + Math.cos(a) * m * 1.15, y + Math.sin(a) * m * 0.78]; }), true, 3), righe = [riga(chiudi(b), INK, 1.05)]; // 1,05: in js/mondo-gl.js è il contorno che si vede solo da lontano, quando le foglioline non si distinguono più
      const lancetta = (px, py, dir, l) => { const c = Math.cos(dir), n = Math.sin(dir), w = l * 0.19; righe.push(riga([[px, py], [px + c * l * 0.5 - n * w, py + n * l * 0.5 + c * w], [px + c * l, py + n * l], [px + c * l * 0.5 + n * w, py + n * l * 0.5 - c * w], [px, py]], INK, 0.85)); };
      for (let i = 0; i < 24; i++) { const a = q(0, 6.283), d = Math.sqrt(q(0.02, 1)) * rr * 0.8; lancetta(x + Math.cos(a) * d * 1.15, y + Math.sin(a) * d * 0.78, a + q(-1.1, 1.1), q(6, 9.5)); }
      for (let i = 0; i < 12; i++) { const a = (i / 12) * 6.283 + q(-0.2, 0.2); lancetta(x + Math.cos(a) * rr * 1.02, y + Math.sin(a) * rr * 0.7, a + q(-0.5, 0.5), q(6.5, 10)); }
      for (let i = 0; i < 5; i++) { const px = x + q(0.05, 0.6) * rr, py = y + q(0.1, 0.42) * rr; righe.push(riga([[px, py], [px + q(4, 7), py - q(5, 9)]], INK, 0.5)); } // l'ombra, in basso a destra
      return [y, { occ: b, righe }];
    };
    // ciuffi piccoli e tanti, sulle cime e lungo le branche: fra l'uno e l'altro si vede il legno
    const lungo = (C, u, dy, rr) => [T[0] + (C[0] - T[0]) * u + q(-5, 5), T[1] + (C[1] - T[1]) * u + dy, rr], [a, b, c] = capi;
    for (const [x, y, rr] of [lungo(a, 1.08, -6, q(27, 32)), lungo(b, 1.1, -8, q(29, 34)), lungo(c, 1.08, -6, q(27, 32)), lungo(a, 0.7, -22, q(23, 27)), lungo(c, 0.7, -22, q(23, 27)), lungo(a, 0.86, 18, q(19, 23)), lungo(c, 0.86, 18, q(19, 23)), [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - 20, q(24, 29)], [(b[0] + c[0]) / 2, (b[1] + c[1]) / 2 - 20, q(24, 29)], lungo(b, 0.62, -4, q(18, 22))]) ciuffi.push(ciuffo(x, y, rr));
    ciuffi.sort((u, v) => u[0] - v[0]); // dall'alto in basso: i ciuffi bassi stanno davanti
    return [riga([[-40, 2], [-20, 3.5]], TENUE, 0.6), riga([[26, 3.5], [48, 2]], TENUE, 0.6), legno, ciuffi.map((u) => u[1])];
  };
  // la pajara, dalla foto vera (assets/photo/pajara.webp): un tronco di cono di pietre a secco con un gradone verso la cima e la porticina bassa e buia
  const pajaraPietra = () => {
    const H = 104, GR = 0.72, hw = (t) => (t < GR ? 78 - 32 * (t / GR) : 40 - 10 * ((t - GR) / (1 - GR))), fianco = (s) => [[s * 78, 0], [s * (62 + q(-1, 1)), -H * GR * 0.5], [s * 46, -H * GR], [s * 40, -H * GR], [s * 30, -H]];
    const sag = [...fianco(-1), ...liscia([[-30, -H], [-12, -H - 6], [12, -H - 6], [30, -H]], false, 3).slice(1, -1), ...fianco(1).reverse()], righe = [riga(chiudi(sag), INK, 1.1)];
    for (let y = -8.5; y > -H; y -= q(7.5, 9.5)) { const w = hw(-y / H) - 1.5, p = []; for (let x = -w; x < w; x += 10) p.push([x, y + q(-1, 1)]); p.push([w, y]); righe.push(riga(p, INK, 0.85)); for (let x = -w + q(3, 12); x < w - 3; x += q(9, 20)) righe.push(riga([[x, y], [x + q(-2, 2), y + q(7, 8.4)]], INK, 0.6)); } // i corsi e i giunti
    righe.push(...tratteggio([[26, 0], [78, 0], [46, -H * GR], [40, -H * GR], [30, -H], [14, -H]], -1.05, 5, INK, 0.5)); // il lato in ombra
    const porta = arcoP(-8, 0, 20, 30, 8);
    return [{ occ: sag, righe }, { occ: porta, righe: [riga(porta, INK, 1.1), ...tratteggio(porta.slice(0, -1), -1, 2.4, INK, 0.85), riga([[-22, -33], [6, -33.5]], INK, 0.9)] }];
  };
  let mas; // il casale di sempre, tenuto da parte per ricavarne quello col portone che si apre
  const pezzi = [
    pezzo('m-alb-a', alberello()), pezzo('m-alb-b', alberello()), pezzo('m-alb-c', alberello()), pezzo('m-muretto-a', muretto(960)), pezzo('m-muretto-b', muretto(960)),
    pezzo('m-oliv-a', ulivo()), pezzo('m-oliv-b', ulivo()), pezzo('m-pajara-p', pajaraPietra()),
    pezzo('m-cip-a', cipOmbra(210, 0.9)), pezzo('m-cip-b', cipOmbra(170, 0.75)), pezzo('m-cip-c', cipOmbra(240, 1)),
    pezzo('m-ulivo', olivo(0, 0.8), -PIEDE), pezzo('m-ulivo-b', olivo(0, 0.62), -PIEDE),
    pezzo('m-vite', vigna(-30, 30), -PIEDE),
    pezzo('m-muro', mur(-120, 120, 0)),
    pezzo('m-casale', (mas = masseria()[0]), -PIEDE),
    pezzo('m-colli', colleL([[-1300, PIEDE], [-1050, 168], [-760, 186], [-420, 150], [-140, 172], [180, 146], [520, 178], [860, 152], [1120, 176], [1300, PIEDE]], VINO), -PIEDE),
    pezzo('m-nuvole', cirri([[-420, -150, 200], [380, -50, 260], [920, -100, 180]])), // niente nuvole in basso a sinistra: lì c'è il titolo
    // 11 nov (2), tutta la pagina è il mondo: i pezzi delle altre tappe (Salento, campi, pergola dei premi, calici della fine)
    pezzo('m-torre', torreta(0, 0, 2.4, VINO)),
    pezzo('m-barca', barca(0, 0, 1)),
    pezzo('m-gabbiani', gabbiani([[0, 0, 1], [40, -24, 0.8], [86, 8, 0.7]])),
    pezzo('m-spiga', spiga(0, 0, 130)), pezzo('m-papavero', papavero(0, 0, 100, 1.1)),
    pezzo('m-pajara', pajara(0, 0, 0.9, VINO)),
    pezzo('m-calici', [calice(-62, 0, 0.9, 0.12, VINO), calice(62, 0, 0.9, -0.12, VINO)]),
    pezzo('m-pergola', (() => { const o = []; for (const x of [-120, 120]) o.push(ramo([[x - 3, 2], [x + 4, -70], [x - 2, -150]], 8, 6)); o.push(riga([[-160, -156], [160, -156]], INK, 1.2), riga([[-160, -144], [160, -144]], INK, 1.2)); for (let x = -150; x < 160; x += 30) o.push(riga([[x, -160], [x + 10, -140]], INK, 0.7)); for (let i = 0; i < 10; i++) o.push(fogliaVite(-140 + i * 31 + r(-8, 8), -146 + r(0, 10), 1.57 + r(-0.9, 0.9), r(26, 36))); return o; })()),
    pezzo('m-stelle', (() => { const o = []; for (let i = 0; i < 70; i++) { const x = r(-1200, 1200), y = r(-300, -40), q = r(3, 6); o.push(riga([[x - q, y], [x + q, y]], ORO, 0.9), riga([[x, y - q], [x, y + q]], ORO, 0.9)); } return o; })()),
  ];
  // il portone che si apre (solo WebGL): il casale senza i battenti e col vano della porta bucato nel fondo pieno, un battente a parte (cardine in x = 0, l'altro è lo stesso specchiato)
  // e la luce dentro, un foglio del colore della carta dietro il vano. Le misure sono quelle di masseria(): torre larga 2 x 56, porta 66k x 118k con k = 56/74
  {
    const B = PIEDE, top = B - 130, tx = 56, k = tx / 74, porta = arcoP(0, B, 66 * k, 118 * k, 12), assi = tratteggio(porta, 1.5708, 8, ORO, 0.7), mezza = (66 * k) / 2; // le assi dei battenti da terra all'arco (nel casale di sempre sono tagliate in diagonale)
    const fondo = [[[-330, B], [-330, top], [-tx, top], [-tx, B]], [[tx, B], [tx, top], [330, top], [330, B]], [[-tx, B], [-tx, top - 84], [tx, top - 84], [tx, B], ...porta.slice().reverse()], mas.occ[2]];
    const sposta = (l) => riga(l.pts.map(([x, y]) => [x - mezza, y]), l.c, l.w);
    const archi = [riga(arcoP(0, B, 84 * k, 130 * k, 30), INK, 1), riga(arcoP(0, B, 66 * k, 118 * k, 30), ORO, 1.5)]; // gli archi del portone più tondi: sulla soglia si vedono da un metro
    pezzi.push(pezzo('m-casale-gl', { occ: fondo, righe: [...mas.righe.filter((l) => l.c !== ORO && !(l.c === INK && l.w === 1 && l.pts.length === 15)), ...archi] }, -PIEDE),
      pezzo('m-battente', [...assi.filter((l) => l.pts[0][0] > 0.5).map(sposta), sposta(riga([[0.6, B], [0.6, B - 118 * k]], ORO, 1)), sposta(riga([[0.6, B - 26], [mezza, B - 26]], ORO, 0.7)), sposta(riga([[0.6, B - 62], [mezza, B - 62]], ORO, 0.7))], -PIEDE),
      pezzo('m-luce', { occ: [[-52, 0], [52, 0], [52, -100], [-52, -100]], righe: [] }));
  }
  writeFileSync(join(DIR, 'mondo.svg'), `<svg xmlns="http://www.w3.org/2000/svg"><defs>${pezzi.join('')}</defs></svg>`);
  console.log('mondo', Math.round(pezzi.join('').length / 1024), 'KB');
}
// i piatti: come i bottoni della tavola di moderna-e (incisione()), linee sottili che restano sottili a ogni misura
const piatta = (c) => (Array.isArray(c) ? c.flatMap(piatta) : !c ? [] : c.righe ? piatta(c.righe) : [c]);
for (const id of Object.keys(MOTIVI)) {
  const linee = [...BORDO, ...piatta(MOTIVI[id]())].filter((s) => s.w >= 0.8), dd = (oro) => linee.filter((s) => (s.c === ORO) === oro).map((s) => `M${s.pts.map(([x, y]) => `${n1(x)} ${n1(y)}`).join('L')}`).join('');
  writeFileSync(join(DIR, 'piatti', `${id}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-102 -102 204 204" fill="none" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path stroke="${INK}" vector-effect="non-scaling-stroke" d="${dd(false)}"/><path stroke="${ORO}" vector-effect="non-scaling-stroke" d="${dd(true)}"/></svg>`);
}
console.log('piatti', Object.keys(MOTIVI).join(' '));
