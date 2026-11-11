/* HOME MODERNA D "Cinque porte" (2 nov 2026). Un teatrino di carta ritagliata disegnato su canvas (niente foto, niente matita): ogni piano è un foglio pieno
   a una sua profondità, scorrendo la camera avanza e passa dentro le porte: prima quella del logo, poi una porta d'oro per collezione.
   Prospettiva: scala = F / (F + distanza), il piano del palco a distanza 0 ha scala 1. Unità: 360 sotto l'occhio c'è il bordo del palco (Y), U = px per unità.
   Il sole sta nel cielo, dietro a tutti i fogli, e cammina con lo scorrimento; con lui la luce (alba, giorno, tramonto) si moltiplica su tutti i colori della carta.
   Interazioni: le porte si aprono col passaggio del cursore e col tocco; le bottiglie vere salgono dal palco e toccandole si apre la scheda; il cursore sposta la camera.
   Le foto dei vini si disegnano così come sono: la luce non le tocca. Pezzi comuni in js/moderna-kit.js, scheda del vino in js/scheda.js */
(() => {
  const { $, $$, reduce, clamp, ss, titoli, apri, sale } = FS.mk, D = FS.data;
  if (!$('.d-st')) return; // vino-d.html con un id sbagliato: niente teatrino
  const sec = $('.d-st'), stage = $('.d-stage'), cv = $('.d-cv'), ctx = cv.getContext('2d', { alpha: false }), alto = $('.d-alto'), caps = $$('.d-cap');
  const mob = innerWidth <= 860; // shortcut: il teatrino si ritaglia una volta sola: ruotando il telefono restano le posizioni di prima, come torre e pergola della fiaba
  const CODA = 60; // px di scorrimento dopo l'ultima tappa: la sezione dopo (che sale con l'orlo tagliato) non spunta mentre ci si è ancora fermi
  const F = 1000, Y = 360, BH = mob ? 480 : 470, DX = mob ? 172 : 215, TAU = Carta.TAU, OMBRA = 'rgb(28 18 10 / .2)';
  const lato = (x) => x * (mob ? 0.62 : 1); // quello che sta ai lati, sul telefono più vicino al centro
  const INK = '#1d1612', ORO = '#cdb780';

  /* ---- la carta: fogli (poligoni tagliati a forbice), riempiti col colore moltiplicato per la luce ---- */
  const { R, r, rgb, tracciato, carta, tratto, taglia, ell, rett, foglia, collina, onda, nuvola, cipresso, fico, vite, papavero } = Carta;
  const varco = (cx, b, w, h) => rett(cx - w / 2, b - h, cx + w / 2, b); // porte e finestre sono rettangoli, come la porta del logo
  const nuvole = (...n) => carta(n.flatMap(([x, y, k]) => nuvola(lato(x), y, k)), '#fbf4e2', { sh: [7, 8] });
  const piano = (dz, forme, o = {}) => ({ dz, forme: forme.flat(), ...o });

  /* ---- 0: la torre, in pietra, con la corona del logo e il grande portale d'oro (come le altre porte) ---- */
  const scena0 = () => {
    const tw = mob ? 420 : 900, bh = mob ? 330 : 400, cor = mob ? 136 : 174, pw = mob ? 170 : 290, ph = mob ? 270 : 340, k = tw / 60.05, yb = Y - bh, yc = yb - 16;
    const corona = [[0, 0.53], [17.69, 13.2], [30.02, 0.34], [42.35, 13.2], [60.05, 0.53], [60.05, 23.31], [0, 23.31]].map(([x, y]) => [(x - 30.025) * k, yc - (23.31 - y) * (cor / 23.31)]);
    const buco = varco(0, Y, pw, ph), cornice = varco(0, Y, pw + (mob ? 56 : 76), ph + (mob ? 28 : 38)), segni = [];
    for (let i = 0; i < 74; i++) { const x = r(-tw / 2 + 24, tw / 2 - 70), y = r(yb + 18, Y - 14); if (Math.abs(x) > pw / 2 + 56 || y < Y - ph - 50) segni.push([[x, y], [x + r(26, 62), y + r(-1.5, 1.5)]]); }
    const finestre = [-1, 1].map((q) => varco(q * tw * 0.36, yb + (mob ? 120 : 150), mob ? 40 : 58, mob ? 76 : 108));
    return { cielo: '#cfe0dc', top: '#cfe0dc', fascia: '#f6efe0', vini: [], dietro: [piano(1700, [nuvole([-700, -90, 1.3], [640, -150, 1.1], [1500, -60, 1.4])], { pop: 0.12 }),
      piano(1400, [carta(collina(50, 42, 420, 1), '#dcc48f')], { pop: 0.14 }),
      piano(950, [carta(collina(160, 30, 300, 2), '#aeb27a'), carta(Array.from({ length: 70 }, () => { const x = r(-2600, 2600), y = r(200, 300); return ell(x, y, r(14, 24), 7, 0, 6); }), '#8d9658')], { pop: 0.2 }),
      piano(560, [carta(collina(250, 18, 260, 3.4), '#86904f'), cipresso(lato(-880), 262, 300), cipresso(lato(-980), 262, 230), cipresso(lato(900), 262, 340), cipresso(lato(1240), 262, 260), cipresso(-1500, 262, 300)], { pop: 0.26 }),
      piano(340, [carta(collina(Y - 40, 12, 240, 5), '#6e7a3e'), fico(lato(-760), Y - 34, 1.15), fico(lato(790), Y - 34, 1), fico(-1200, Y - 34, 1.2)], { pop: 0.32 })],
      porta: { dz: 180, pop: 0.38, forme: [carta([taglia(rett(-tw / 2, yb, tw / 2, Y), 70, 1.6), buco], '#efe4c8', { odd: 1, sh: [12, 10] }), carta(taglia(corona, 60, 1.4), '#efe4c8', { sh: [12, 10] }), carta(rett(-tw / 2 - 12, yc, tw / 2 + 12, yb + 2), '#b59d6c', { sh: [5, 5] }),
        carta([[tw * 0.3, yb + 2], [tw / 2, yb + 2], [tw / 2, Y], [tw * 0.3, Y]], '#ddcfae'), tratto(segni, '#c0ad83', 3), carta(finestre, '#5f4c33'), carta([cornice, buco], '#a98f5f', { odd: 1, sh: [4, 4] })],
        buco: tracciato(buco), box: { x0: -pw / 2, x1: pw / 2, y0: Y - ph, y1: Y }, yd: Y - ph / 2 }, davanti: [] };
  };

  /* ---- 1: Collezione 53, la corte in tufo col portico ---- */
  const scena1 = () => {
    const w = mob ? 490 : 640, h = 490, q = [[-5200, 5000], [-5200, -150]]; // porta larga: si vede oro ai lati della bottiglia centrale
    for (let x = -5200; x < 5200; x += 180) q.push([x + 90, -150], [x + 90, -215], [x + 180, -215], [x + 180, -150]);
    q.push([5200, 5000]);
    const nicchie = [-1760, -1200, -640, 640, 1200, 1760], buco = varco(0, Y, w, h), pw = mob ? 620 : 1240, ph = mob ? 560 : 610;
    const ghirlanda = [], ghirlanda2 = [];
    for (let i = 0; i < 110; i++) { const s = r(0, ph * 2 + pw), j = r(-18, 18), x = s < ph ? -pw / 2 + j : s < ph + pw ? -pw / 2 + s - ph : pw / 2 + j, y = s < ph ? Y - s : s < ph + pw ? Y - ph + j : Y - ph + (s - ph - pw); (i % 3 ? ghirlanda : ghirlanda2).push(foglia(x, y, r(0, TAU), r(30, 46), r(10, 15))); } // sale dal suolo sui due stipiti e corre sull'architrave
    return { cielo: '#efd9a6', top: '#efd9a6', fascia: INK, vini: [['c53-primitivo', 'Primitivo'], ['gocce', 'Gocce'], ['c53-negroamaro', 'Negroamaro']], dietro: [piano(1900, [nuvole([-900, -420, 1.8], [900, -500, 1.6])])],
      porta: { dz: 1000, forme: [carta([taglia(q, 200, 1.5), buco], '#e6d5ac', { odd: 1, sh: [10, 8] }), carta(nicchie.map((x) => varco(lato(x), Y, 300, 430)), '#cdb98b', { sh: [-6, -5] }), carta(nicchie.map((x) => varco(lato(x), 170, 110, 190)), '#6e5837')],
        buco: tracciato(buco), box: { x0: -w / 2, x1: w / 2, y0: Y - h, y1: Y }, yd: 90 },
      davanti: [piano(680, [carta(collina(Y), '#d7c397')]), piano(430, [carta(collina(Y), '#c7b183')]),
        piano(320, [carta([rett(-5200, -3000, 5200, 5000), varco(0, Y, pw, ph)], '#b89f6c', { odd: 1, sh: [12, 10] }), carta(ghirlanda, '#5d6d34', { sh: [3, 4] }), carta(ghirlanda2, '#7f8f47')], { pop: 0.74 }),
        piano(170, [carta(collina(Y), '#a98f5f')])] };
  };

  /* ---- 2: Terra, la terra rossa con le viti ad alberello, la pajara e il muretto a secco ---- */
  const scena2 = () => {
    const tiers = [[1560, 210], [1240, 180], [960, 150], [690, 120], [440, 90]], sx = [], dx = [], ombre = [], segni = [];
    let y = Y;
    tiers.forEach(([ww, hh], i) => {
      const nw = tiers[i + 1]?.[0] ?? ww * 0.7, top = ww / 2 - 22;
      sx.push([-ww / 2, y], [-top, y - hh], [-nw / 2, y - hh]); dx.push([ww / 2, y], [top, y - hh], [nw / 2, y - hh]);
      ombre.push([[ww * 0.2, y], [ww / 2, y], [top, y - hh], [ww * 0.2 - 6, y - hh]]);
      for (let j = 0; j < 7 + (4 - i) * 3; j++) { const x = r(-ww / 2 + 30, ww / 2 - 60), yy = y - r(16, hh - 14); if (Math.abs(x) > 340 || yy < Y - 500) segni.push([[x, yy], [x + r(24, 54), yy + r(-2, 2)]]); }
      y -= hh;
    });
    const sagoma = [...sx, ...dx.reverse()], pw = mob ? 490 : 620, buco = varco(0, Y, pw, 500), muro = [], muro2 = [];
    for (let rg = 0; rg < 3; rg++) for (let x = -(mob ? 1100 : 2600) + rg * 34; x < (mob ? 1100 : 2600);) { const ww = r(58, 104), yy = Y - rg * 40, q = [[x + 3, yy - 3], [x + ww * 0.5, yy - r(0, 3)], [x + ww - 3, yy - 4], [x + ww - 1, yy - 24], [x + ww - 6, yy - 38], [x + ww * 0.45, yy - r(38, 41)], [x + 4, yy - 37], [x + 1, yy - 18]]; (R() < 0.55 ? muro : muro2).push(q); x += ww + 3; }
    const filare = (dz, col, k, xs, pop) => piano(dz, [carta(collina(Y), col), ...xs.flatMap((x) => [lato(x), lato(-x)]).map((x) => vite(x + r(-14, 14), Y + 2, k))], { pop });
    return { cielo: '#efe3c6', top: '#efe3c6', fascia: '#a8402a', vini: [['terra-platinum', 'Platinum'], ['terra-gold', 'Gold'], ['terra-primitivo', 'Primitivo']], dietro: [piano(1800, [nuvole([-1000, -340, 2], [300, -460, 1.6], [1300, -280, 2.1])]),
      piano(1700, [carta(collina(-10, 56, 500, 0.6), '#cfc89d')]), piano(1300, [carta(collina(90, 26, 340, 2.2), '#d27a55')])],
      porta: { dz: 1000, forme: [carta(collina(Y), '#c25a3a'), carta([taglia(sagoma, 90, 2.5), buco], '#d3c29a', { odd: 1, sh: [10, 8] }), carta(ombre, '#bca97e'), tratto(segni, '#9c8a62', 4)], buco: tracciato(buco), box: { x0: -pw / 2, x1: pw / 2, y0: Y - 500, y1: Y }, yd: 120 },
      davanti: [filare(800, '#b9502f', 1.3, [760, 1100, 1440, 1780], 0.68), filare(560, '#ad4529', 1.35, [680, 1010, 1340, 1670], 0.71), filare(330, '#9c3c24', 1.45, [640, 1000, 1360], 0.74),
        piano(110, [carta(rett(-5200, Y - 124, 5200, Y + 60), '#6d5a3f'), carta(muro, '#dccdaa'), carta(muro2, '#c9b88f')], { pop: 0.76 })] };
  };

  /* ---- 3: 125 Organic, il campo di papaveri e l'ulivo col tronco cavo ---- */
  const scena3 = () => {
    const tronco = [[-580, Y], [-430, Y - 120], [-340, Y - 300], [-380, Y - 460], [-450, Y - 640], [-330, Y - 820], [-90, Y - 600], [30, Y - 880], [130, Y - 600], [360, Y - 820], [470, Y - 630], [390, Y - 450], [330, Y - 290], [430, Y - 110], [600, Y]];
    const pw = mob ? 480 : 590, buco = varco(0, Y, pw, 470), chioma = [], chioma2 = [], f1 = [], f2 = [], drupe = [];
    [[-960, -340, 320, 170], [-520, -420, 340, 200], [0, -480, 400, 240], [500, -420, 350, 200], [960, -340, 320, 170], [-260, -620, 320, 180], [280, -630, 330, 180], [-1420, -350, 300, 160], [1420, -350, 300, 160]].forEach(([x, yy, rx, ry], i) => (i % 2 ? chioma2 : chioma).push(ell(x, yy, rx, ry, 0, 15)));
    for (let i = 0; i < 260; i++) { const x = r(-1650, 1650), yy = r(-740, -210), a = r(-0.6, 0.6) + (R() < 0.5 ? 0 : Math.PI); (i % 2 ? f1 : f2).push(foglia(x, yy, a, r(40, 62), r(7, 10))); if (i % 7 === 0) drupe.push(ell(x + 10, yy + 20, 9, 12, 0, 7)); }
    const campo = (dz, col, k, n, pop) => { const pp = []; for (let i = 0; i < n; i++) { const s = i % 2 ? 1 : -1, x = lato(s * r(360, 1500)); pp.push(papavero(x, Y + 4, r(90, 170) * k, k)); } return piano(dz, [carta(collina(Y), col), ...pp], { pop }); };
    const ape = [carta(ell(0, 0, 13, 8, 0, 9), '#e8b830'), tratto([[[-3, -7], [-3, 7]], [[4, -7], [4, 7]]], INK, 2.4), carta([ell(-3, -13, 7, 10, -0.5, 7), ell(5, -13, 7, 10, 0.5, 7)], '#fbf4e2')];
    return { cielo: '#e4ebd0', top: '#4e5c2b', fascia: '#46532a', anim: 1, vini: [['organic-bianco', 'Bianco'], ['organic-primitivo', 'Primitivo']], dietro: [piano(1800, [nuvole([-1100, -120, 1.8], [1200, -160, 2])]), piano(1700, [carta(collina(10, 44, 460, 2.6), '#bcc58f')]), piano(1300, [carta(collina(100, 24, 330, 0.8), '#a4b06f')])],
      porta: { dz: 1000, forme: [carta(collina(Y), '#8b9a53'), carta([taglia(tronco, 70, 3), buco], '#7c6a4c', { odd: 1, sh: [10, 8] }), tratto([[[-400, Y - 80], [-330, Y - 330], [-380, Y - 540]], [[420, Y - 90], [340, Y - 320], [400, Y - 530]], [[-20, Y - 500], [24, Y - 700]]], '#5f4f38', 9),
        carta(chioma2, '#6f8040', { sh: [8, 10] }), carta(chioma, '#566533', { sh: [8, 10] }), carta(f2, '#3f4c25'), carta(f1, '#93a258'), carta(drupe, '#2e2a2a')], buco: tracciato(buco), box: { x0: -pw / 2, x1: pw / 2, y0: Y - 470, y1: Y }, yd: 130 },
      davanti: [campo(720, '#7f8f49', 0.9, 34, 0.68), campo(440, '#6f7f3f', 1.15, 26, 0.72),
        piano(300, [], { dyn: () => ape.length && [0, 1, 2].forEach((i) => { const t = tempo * (0.9 + i * 0.13) + i * 2; ctx.save(); ctx.translate(lato(i * 300 - 330) + Math.cos(t) * 120, 40 + i * 28 + Math.sin(t * 1.7) * 44); ape.forEach(foglio); ctx.restore(); }) }),
        campo(190, '#5f6f35', 1.5, 16, 0.76)] };
  };

  /* ---- 4: Classica, il mare con la torre costiera su uno scoglio, le onde, la barca ---- */
  const scena4 = () => {
    const ta = [[-400, 262], [-330, 90], [-330, -250], [330, -250], [330, 90], [400, 262]], merli = [], pw = mob ? 470 : 560;
    for (let i = 0; i < 5; i++) merli.push(rett(-330 + i * 142, -304, -330 + i * 142 + 76, -248));
    const buco = varco(0, 262, pw, 440), onde = [[820, '#4aa3a3', 22, 150], [640, '#38909a', 26, 170], [460, '#2b7f8b', 30, 200], [280, '#226f7d', 36, 240], [130, '#1c5f6d', 40, 280]];
    const barca = (x, yy, k) => [carta([[x - 80 * k, yy - 8 * k], [x + 90 * k, yy - 12 * k], [x + 58 * k, yy + 24 * k], [x - 56 * k, yy + 24 * k]], '#9a3b2a', { sh: [3, 3] }), carta([[x + 4 * k, yy - 16 * k], [x + 4 * k, yy - 138 * k], [x + 74 * k, yy - 22 * k]], '#fbf4e2', { sh: [3, 3] }), carta([[x - 6 * k, yy - 16 * k], [x - 6 * k, yy - 104 * k], [x - 56 * k, yy - 20 * k]], '#f0e1c0'), tratto([[x, yy - 8 * k], [x, yy - 146 * k]], INK, 4 * k)];
    return { cielo: '#d9ecea', top: '#d9ecea', fascia: '#184f5c', anim: 1, vini: [['cala', 'Càla'], ['tre-cuori', 'Tre Cuori'], ['sassirossi', 'Sassirossi']], dietro: [piano(1900, [nuvole([-1200, -340, 2], [-100, -420, 1.5], [1100, -300, 2.2])]),
      piano(1800, [carta(collina(-30, 0), '#7cc0bb')]), piano(1650, [carta(taglia([[-3400, 60], [-3400, -60], [-1500, -60], [-1100, -24], [-780, 8], [-600, 60]], 80, 3), '#b9a77e'), carta(taglia([[3400, 60], [3400, -90], [1900, -70], [1400, -28], [1000, 10], [820, 60]], 80, 3), '#a99671')]),
      piano(1500, [barca(mob ? -470 : -1120, 74, 1.15)], { bob: 1 }), piano(1200, [carta(onda(120, 12, 110), '#62aeaa')], { onda: 1 })],
      porta: { dz: 1000, forme: [carta(taglia([[-1000, 440], [-860, 290], [-560, 262], [560, 262], [820, 280], [1020, 440]], 60, 4), '#a58f6d', { sh: [8, 8] }), carta([taglia(ta, 60, 2), buco], '#e0cda0', { odd: 1, sh: [10, 8] }), carta(merli, '#e0cda0', { sh: [6, 6] }), carta([[pw / 2, 262], [400, 262], [330, 90], [330, -250], [pw / 2, -250]], '#cbb688')],
        buco: tracciato(buco), box: { x0: -pw / 2, x1: pw / 2, y0: 262 - 440, y1: 262 }, yd: 100 },
      davanti: [...onde.map(([dz, col, amp, wl], i) => piano(dz, [carta(onda(Y - 40 + i * 8, amp, wl), col)], { onda: i + 2 }))] };
  };

  /* ---- 5: 125 Uno Due Cinque, la pergola con le lampadine e la tavola al tramonto ---- */
  const scena5 = () => {
    const top = mob ? -130 : -175, px = lato(620), foglie = [], foglie2 = [], lampade = [], fili = [];
    [[-px, 0], [0, px]].forEach(([a, b]) => { const c = Array.from({ length: 15 }, (_, i) => { const t = i / 14; return [a + (b - a) * t, top + 20 + 150 * t * (1 - t) * 1.2]; }); fili.push(c); for (let i = 1; i < 14; i += 2) lampade.push(ell(c[i][0], c[i][1] + 10, 10, 12, 0, 9)); });
    for (let i = 0; i < 90; i++) { const x = r(-px * 1.7, px * 1.7), yy = top + r(-34, 12), a = r(0, TAU); (i % 3 ? foglie : foglie2).push(foglia(x, yy, a, r(36, 54), r(11, 16))); }
    const palo = (x) => [carta(rett(x - 15, top, x + 15, Y + 40), '#5b432f', { sh: [8, 6] }), tratto([[x - 22, Y], [x + 18, Y - 100], [x - 18, Y - 220], [x + 18, Y - 340], [x, top + 10]], '#3e2d20', 7)];
    const calice = (x, col) => { const b = Y - 2; return [carta([[x - 30, b - 118], [x + 30, b - 118], [x + 24, b - 72], [x + 5, b - 52], [x + 4, b - 8], [x + 22, b], [x - 22, b], [x - 4, b - 8], [x - 5, b - 52], [x - 24, b - 72]], '#fbf4e2', { sh: [3, 3] }), carta([[x - 28, b - 96], [x + 28, b - 96], [x + 24, b - 72], [x + 5, b - 54], [x - 5, b - 54], [x - 24, b - 72]], col)]; };
    return { cielo: '#f6dcc0', top: '#f6dcc0', fascia: '#f6efe0', vini: [['125-rosato', 'Rosato'], ['125-primitivo', 'Primitivo'], ['125-negroamaro', 'Negroamaro']], dietro: [piano(1900, [nuvole([-1200, -260, 2.2], [1000, -340, 1.8])]), piano(1700, [carta(collina(30, 52, 480, 1.4), '#c9958a')]), piano(1250, [carta(collina(140, 34, 340, 3), '#a56f68')]),
      piano(800, [carta(collina(250, 20, 280, 0.4), '#7c5650'), cipresso(lato(-720), 262, 300, '#4d3a34'), cipresso(lato(780), 262, 360, '#4d3a34'), cipresso(1300, 262, 280, '#4d3a34')]), piano(500, [carta(collina(Y - 28, 6, 300, 2), '#5f463a')])],
      porta: null,
      davanti: [piano(300, [palo(-px), palo(px), palo(-px * 2.1), palo(px * 2.1), carta(rett(-6000, top - 12, 6000, top + 14), '#5b432f', { sh: [6, 7] }), carta(foglie, '#67783a', { sh: [3, 4] }), carta(foglie2, '#8a9a4e'), tratto(fili, INK, 2.5), carta(lampade, '#f2c46b', { e: 1, sh: [2, 3] })], { pop: 0.74 }),
        mob ? piano(1, []) : piano(1, [calice(-360, '#eba9a1'), calice(-440, '#721024'), calice(370, '#741426')])] };
  };

  // le pagine azienda-d e vino-d (js/pagine-d.js) usano lo stesso teatrino coi loro capitoli: window.D_SCENE riceve i pezzi e restituisce le scene
  const CAP = window.D_SCENE ? window.D_SCENE({ mob, lato, Y, F, INK, ORO, varco, nuvole, piano, scene: [scena0, scena1, scena2, scena3, scena4, scena5] }) : [scena0(), scena1(), scena2(), scena3(), scena4(), scena5()], N = CAP.length, Z = [0];
  const sei = (A) => (A.length === N ? A : Array.from({ length: N }, (_, i) => { const u = (i / Math.max(1, N - 1)) * (A.length - 1), j = Math.min(A.length - 2, Math.floor(u)); return A[j] + (A[j + 1] - A[j]) * (u - j); })); // sole e luce pensati per sei tappe: con meno o più si ricampionano
  CAP.forEach((C, i) => { if (i < N - 1) Z.push(Z[i] + C.porta.dz + F + 420); C.z = Z[i]; C.band = carta(collina(Y), C.fascia); C.bt = C.vini.map(([id], j) => { const n = C.vini.length, b = { w: FS.wine(id), x: n === 1 ? 0 : n === 2 ? (j ? 1 : -1) * DX * 0.56 : (j - 1) * DX, su: 0, m: 0, img: new Image() }; b.img.decoding = 'async'; b.img.onload = () => (sporco = true); b.img.src = b.w.bottle; return b; }); });

  /* ---- la luce: alba, giorno, tramonto. Moltiplica i colori della carta, come una luce vera ---- */
  const LUCI = [[1, 0.92, 0.84], [1, 1, 1], [1, 0.74, 0.56]];
  const AUTO = sei([0.06, 0.3, 0.5, 0.66, 0.82, 1]); // la luce cammina con le porte
  let tL = -1, L = LUCI[1], ver = 0, sU = 0, sporco = true;
  const luce = (t) => { if (Math.abs(t - tL) < 0.0008) return; tL = t; const x = t * 2, i = Math.min(1, Math.floor(x)), f = x - i; L = LUCI[i].map((v, j) => v + (LUCI[i + 1][j] - v) * f); ver++; sporco = true; };
  const tinta = (c, e = 0, k = 1) => `rgb(${c.map((v, i) => Math.round(v * Math.max(L[i], e) * k)).join(' ')})`;
  const chiaro = (c) => (0.2126 * c[0] * L[0] + 0.7152 * c[1] * L[1] + 0.0722 * c[2] * L[2]) / 255;
  const foglio = (f) => {
    if (f.v !== ver) { f.css = tinta(f.c, f.e); f.v = ver; }
    if (f.lw) { ctx.strokeStyle = f.css; ctx.lineWidth = f.lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(f.p); }
    else {
      const regola = f.odd ? 'evenodd' : 'nonzero';
      if (f.sh) { ctx.fillStyle = OMBRA; ctx.translate(f.sh[0], f.sh[1]); ctx.fill(f.p, regola); ctx.translate(-f.sh[0], -f.sh[1]); }
      ctx.fillStyle = f.css; ctx.fill(f.p, regola);
    }
  };

  /* ---- camera e disegno ---- */
  let W = 1, H = 1, hv = 1, U = 1, cx = 0, cy = 0, band = 0, dpr = 1, camZ = 0, camY = 0, pX = 0, pY = 0, gX = 0, gY = 0, intro = reduce ? 1 : 0, tempo = 0, picchio = 0, soprapk = -1, vis = true;
  /* il sole: un ritaglio nel cielo, disegnato prima di tutti i fogli. Per ogni tappa un punto dove si vede (unità del teatrino, da centro e fascia), in mezzo cammina */
  const SX = sei(mob ? [-71, 0, 203, 239, 218, 132] : [-533, -115, 187, 317, 432, 418]), SY = sei(mob ? [-85, -130, -113, -36, -90, 36] : [-54, -135, -99, -45, -99, -36]);
  const SOLI = [rgb('#f6b667'), rgb('#f4c544'), rgb('#e8693a')], disco = new Path2D();
  for (let i = 0; i < 18; i++) { const a = (i / 18) * TAU, q = 1 + (((i * 7) % 3) - 1) / 48; disco[i ? 'lineTo' : 'moveTo'](Math.cos(a) * q, Math.sin(a) * q); }
  disco.closePath();
  const lungo = (A, u) => { if (N < 2) return A[0]; const i = Math.min(N - 2, Math.floor(u)); return A[i] + (A[i + 1] - A[i]) * (u - i); }; // N = 1: la scheda di vino-d ha un capitolo solo
  const astro = () => {
    const x = tL * 2, i = Math.min(1, Math.floor(x)), f = x - i, q = U * (mob ? 46 : 62) * dpr;
    ctx.setTransform(q, 0, 0, q, dpr * (cx + U * (lungo(SX, sU) + pX)), dpr * (cy + U * (lungo(SY, sU) + pY) + (1 - intro) * hv * 0.2));
    ctx.fillStyle = OMBRA; ctx.translate(0.07, 0.08); ctx.fill(disco); ctx.translate(-0.07, -0.08);
    ctx.fillStyle = `rgb(${SOLI[i].map((v, j) => Math.round(v + (SOLI[i + 1][j] - v) * f)).join(' ')})`; ctx.fill(disco);
  };
  const arrivo = (i) => (i ? clamp((camZ - Z[i - 1]) / (Z[i] - Z[i - 1])) : 1), partenza = (i) => (i < N - 1 ? clamp((camZ - Z[i]) / (Z[i + 1] - Z[i])) : 0);
  const vista = (z, giu = 0) => { // prepara il foglio a profondità z; 0 se la camera l'ha già passato
    const dz = z - camZ; if (dz <= -F * 0.965) return 0;
    const s = F / (F + dz), q = U * s * dpr;
    ctx.setTransform(q, 0, 0, q, dpr * (cx + U * pX * (1 - s)), dpr * (cy + U * (pY * (1 - s) + (giu - camY) * s)));
    return s;
  };
  const sale2 = (i, j) => ss(clamp(((i ? arrivo(i) : intro) - 0.6 - j * 0.05) / 0.32)) // nel primo capitolo le bottiglie salgono con l'apertura (nella home lì non ce ne sono) * (1 - ss(clamp((partenza(i) - 0.01 - j * 0.015) / 0.14)));
  const apertura = (i) => { const o = ss(clamp((partenza(i) - 0.03) / 0.28)); return i === soprapk ? Math.max(o, picchio * 0.3) : o; };
  const ante = (pt, o) => {
    const b = pt.box, hw = (b.x1 - b.x0) / 2, a = o * 1.3, fx = Math.cos(a) * hw, d = Math.sin(a) * hw * 0.24, c = rgb(ORO), k = 1 - 0.2 * o;
    ctx.save(); ctx.clip(pt.buco);
    [[b.x0, 1], [b.x1, -1]].forEach(([hx, s]) => {
      ctx.beginPath(); ctx.moveTo(hx, b.y0 - 2); ctx.lineTo(hx + s * fx, b.y0 - 2 - d); ctx.lineTo(hx + s * fx, b.y1 + d * 0.5); ctx.lineTo(hx, b.y1 + 2); ctx.closePath();
      ctx.fillStyle = tinta(c, 1, k); ctx.fill();
      ctx.strokeStyle = tinta(c, 1, k * 0.76); ctx.lineWidth = Math.max(1.4, hw * 0.022); ctx.beginPath();
      for (let i = 1; i < 4; i++) { const u = i / 4; ctx.moveTo(hx + s * fx * u, b.y0 - d * u); ctx.lineTo(hx + s * fx * u, b.y1 + d * 0.5 * u); }
      ctx.stroke();
      ctx.fillStyle = tinta(rgb(INK), 0, 1); ctx.beginPath(); ctx.arc(hx + s * fx * 0.86, (b.y0 + b.y1) / 2 + hw * 0.12, Math.max(2, hw * 0.05), 0, TAU); ctx.fill();
    });
    ctx.restore();
  };
  const stendi = (C, P, arr) => {
    const giu = P.pop === undefined ? 0 : (1 - ss(clamp((arr - P.pop) / 0.24))) * 700;
    if (!vista(C.z + P.dz, giu)) return;
    if (P.onda && !reduce) ctx.translate(Math.sin(tempo * 0.7 + P.onda) * 20, Math.cos(tempo * 0.9 + P.onda) * 4);
    if (P.bob && !reduce) ctx.translate(0, Math.sin(tempo * 1.3) * 4);
    P.forme.forEach(foglio);
    P.dyn?.();
  };
  const capitolo = (i, prof = 0) => {
    const C = CAP[i], arr = i ? arrivo(i) : intro * 1.1;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = tinta(C.cielo.c ?? (C.cielo.c = rgb(C.cielo)) , 0); ctx.fillRect(0, 0, cv.width, cv.height);
    astro();
    C.dietro.forEach((P) => stendi(C, P, arr));
    const pt = C.porta;
    if (pt) {
      const giu = pt.pop === undefined ? 0 : (1 - ss(clamp((arr - pt.pop) / 0.3))) * 700;
      if (vista(C.z + pt.dz, giu)) {
        const o = apertura(i);
        if (o > 0.002 && prof < 1 && i < N - 1) { ctx.save(); ctx.clip(pt.buco); capitolo(i + 1, prof + 1); ctx.restore(); vista(C.z + pt.dz, giu); }
        if (o < 0.999) ante(pt, o);
        pt.forme.forEach(foglio);
      }
    }
    C.davanti.forEach((P) => stendi(C, P, arr));
    const su = i ? (1 - ss(clamp((arr - 0.62) / 0.3))) * 700 : 0; // la fascia sale insieme alle bottiglie: attraversando la porta non si vede una massa scura
    if (vista(C.z, su)) {
      ctx.fillStyle = OMBRA; ctx.translate(0, -9); ctx.fill(C.band.p); ctx.translate(0, 9); // l'ombra della fascia va sotto le bottiglie: le foto non si toccano
      vista(C.z);
      C.bt.forEach((b, j) => { const q = sale2(i, j); if (q <= 0 || !b.img.naturalWidth || b.via) return; const w = (BH * b.img.naturalWidth) / b.img.naturalHeight; ctx.drawImage(b.img, b.x - w / 2, Y - BH * 0.91 + (1 - q) * (BH + 90) - b.su * 14, w, BH); });
      vista(C.z, su); foglio(C.band);
    }
  };
  const corrente = () => { for (let i = 0; i < N - 1; i++) if (camZ < Z[i] + CAP[i].porta.dz + F * 0.965) return i; return N - 1; };
  const altezza = () => { for (let i = 0; i < N - 1; i++) if (camZ <= Z[i + 1]) { const y = CAP[i].porta.yd, cr = Z[i] + CAP[i].porta.dz + F; return camZ < cr ? y * ss(clamp((camZ - Z[i]) / (cr - Z[i]))) : y * (1 - ss(clamp((camZ - cr) / (Z[i + 1] - cr)))); } return 0; };

  /* ---- misure ---- */
  const nomi = caps.map((c) => $('.d-nomi', c));
  caps.forEach((c, i) => { const C = CAP[i]; if (!C.vini.length) return;
    nomi[i].innerHTML = C.bt.map((b, j) => `<li>${C.vini[j][1]}</li>`).join('');
    C.bt.forEach((b) => { b.el = document.createElement('button'); b.el.className = 'd-hit'; b.el.type = 'button'; b.el.setAttribute('aria-label', `${b.w.name}, apri la scheda`); c.append(b.el);
      b.el.addEventListener('pointerenter', () => { b.m = 1; }); b.el.addEventListener('pointerleave', () => { b.m = 0; });
      b.el.addEventListener('click', () => schedaApri(b)); }); });
  const misura = () => {
    const q = stage.getBoundingClientRect(); W = q.width; H = q.height; dpr = Math.min(devicePixelRatio || 1, 2); cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    hv = alto.offsetHeight || H; U = Math.min(hv / 900, W / (mob ? 508 : 1150)); cx = W / 2; band = hv * (mob ? 0.66 : 0.7); cy = band - Y * U;
    stage.style.setProperty('--band', `${band}px`); stage.style.setProperty('--hv', `${hv}px`);
    caps.forEach((c, i) => { c.style.transformOrigin = `50% ${cy - band}px`; const li = [...nomi[i]?.children ?? []]; CAP[i].bt.forEach((b, j) => {
      const ww = (DX * U - 8), set = (el, o) => Object.entries(o).forEach(([k, v]) => el.style.setProperty(k, v));
      set(li[j], { '--x': b.x * U, '--w': ww }); set(b.el, { '--x': b.x * U, '--w': BH * U * 0.36, '--h': BH * U * 0.88 }); }); });
    sporco = true;
  };
  new ResizeObserver(misura).observe(stage);
  misura();
  new IntersectionObserver(([e]) => { vis = e.isIntersecting; }).observe(sec);

  /* ---- porte e bottiglie: il cursore, i tocchi ---- */
  const vai = (n) => { const y = sec.getBoundingClientRect().top + scrollY + (n / (N - 1)) * (sec.offsetHeight - stage.offsetHeight - CODA); FS.lenis ? FS.lenis.scrollTo(y, { duration: 2.8 }) : scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' }); };
  caps.forEach((c, i) => $$('[data-vai]', c).forEach((b) => b.addEventListener('click', () => vai(i + 1))));
  $$('[data-col]', sec).forEach((b) => b.addEventListener('click', () => apri(b.dataset.col)));
  const sullaPorta = (e) => { const i = corrente(), C = CAP[i], q = cv.getBoundingClientRect(); if (!C.porta || i >= N - 1 || partenza(i) > 0.05 || !vista(C.z + C.porta.dz)) return -1; return ctx.isPointInPath(C.porta.buco, (e.clientX - q.left) * dpr, (e.clientY - q.top) * dpr) ? i : -1; };
  stage.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'mouse') { gX = (e.clientX / W - 0.5) * -150; gY = (e.clientY / H - 0.5) * -60; }
    const k = e.target === cv ? sullaPorta(e) : -1; soprapk = k >= 0 ? k : soprapk; if (k < 0 && picchio < 0.01) soprapk = -1;
    fuori = k < 0; cv.style.cursor = k >= 0 ? 'pointer' : '';
  });
  let fuori = true;
  stage.addEventListener('pointerleave', () => { gX = gY = 0; fuori = true; });
  cv.addEventListener('click', (e) => { const k = sullaPorta(e); if (k >= 0) vai(k + 1); });

  /* ---- la scheda della bottiglia: la stessa della fiaba (js/scheda.js). Qui la bottiglia è sul canvas: si dice dov'è e sparisce mentre la scheda è aperta ---- */
  const zoom = $('.fb-zoom'), scheda = Scheda(sec, { schizzi: false }); // solo la bottiglia, niente disegno attorno
  const schedaApri = (b) => {
    const s = F / (F + CAP[corrente()].z - camZ), w = (BH * b.img.naturalWidth) / b.img.naturalHeight;
    scheda.apri(b.w, b.el, { rect: { left: cx + U * (pX * (1 - s) + (b.x - w / 2) * s), top: cy + U * (pY * (1 - s) + (Y - BH * 0.91 - b.su * 14 - camY) * s), width: w * U * s, height: BH * U * s }, nascondi: (on) => { b.via = on; sporco = true; } });
  };

  /* ---- il testo segue il suo piano ---- */
  let scuro = null, inkV = -1;
  const testi = () => {
    caps.forEach((c, i) => {
      const a = arrivo(i), p = partenza(i), o = ss(clamp((a - 0.9) / 0.09)) * (1 - ss(clamp(p / 0.08)));
      if (o !== c._o) { c._o = o; c.style.opacity = o; c.style.visibility = o > 0.01 ? 'visible' : 'hidden'; }
      if (o > 0) { const d = Z[i] - camZ, s = F / (F + d); c.style.transform = `translateY(${-camY * U * s}px) scale(${s})`; }
    });
    if (inkV !== ver) { inkV = ver; caps.forEach((c, i) => { const ch = chiaro(CAP[i].band.c) > 0.42; c.style.setProperty('--d-ink', ch ? 'var(--ink)' : 'var(--paper)'); c.style.setProperty('--d-ink-2', ch ? 'var(--ink-2)' : 'var(--paper-2)'); }); }
    const C = CAP[corrente()], cTop = C.top.c ?? (C.top.c = rgb(C.top)), d = zoom.hidden && chiaro(cTop) < 0.4; // con la scheda aperta l'header sta sulla carta chiara
    if (d !== scuro) { scuro = d; sec.classList.toggle('hero--dark', d); dispatchEvent(new Event('scroll')); }
  };

  /* ---- il giro ---- */
  let prima = performance.now(), ultimo = 0;
  const giro = (now) => {
    requestAnimationFrame(giro);
    if (!vis) return;
    const dt = Math.min(60, now - prima); prima = now; tempo = now / 1000;
    const q = sec.getBoundingClientRect(), p = clamp(-q.top / Math.max(1, q.height - H - CODA)), u = p * (N - 1), j = Math.max(0, Math.min(N - 2, Math.floor(u))), e = ss(clamp((u - j - 0.18) / 0.64));
    const dest = N < 2 ? 0 : Z[j] + (Z[j + 1] - Z[j]) * e, k = reduce ? 1 : 1 - Math.exp(-dt / 130);
    if (Math.abs(dest - camZ) > 0.25) { camZ += (dest - camZ) * k; sporco = true; }
    const ky = 1 - Math.exp(-dt / 280);
    if (Math.abs(gX - pX) + Math.abs(gY - pY) > 0.15) { pX += (gX - pX) * ky; pY += (gY - pY) * ky; sporco = true; }
    const dp = soprapk >= 0 && !fuori ? 1 : 0; if (Math.abs(dp - picchio) > 0.004) { picchio += (dp - picchio) * ky; sporco = true; }
    CAP[corrente()].bt.forEach((b) => { if (Math.abs(b.m - b.su) > 0.004) { b.su += (b.m - b.su) * ky; sporco = true; } });
    camY = altezza();
    if (Math.abs(j + e - sU) > 0.0005) { sU += (j + e - sU) * k; sporco = true; } // il sole insieme alla camera
    luce(lungo(AUTO, sU));
    const anima = CAP[corrente()].anim && !reduce && now - ultimo > 33;
    if (sporco || anima) { sporco = false; ultimo = now; capitolo(corrente()); testi(); }
  };
  if (!reduce) gsap.to({ v: 0 }, { v: 1, duration: 2.2, ease: 'power2.out', delay: 0.15, onUpdate() { intro = this.targets()[0].v; sporco = true; } });
  document.fonts?.ready.then(() => { sporco = true; });
  requestAnimationFrame(giro);

  /* ---- sotto il teatrino: dati veri, bordi tagliati a forbice, niente colori. Con lo scorrimento si muovono solo oggetti interi: volo tra le foto, ruota dei premi, mazzo che si apre, schede di carta per le esperienze ---- */
  const pad = (n) => String(n).padStart(2, '0');
  const lista = $('.d-pr__lista'), griglia = $('.d-nw__grid'); // sotto il teatrino: nelle pagine azienda-d e vino-d ci sono solo alcune di queste sezioni
  if (lista) lista.innerHTML = D.awards.map((a, i) => `<li><button class="d-pr__logo" type="button" aria-label="${a.name}" data-i="${i}"><img src="${a.logo}" alt="" loading="lazy"></button><div class="d-pr__testo"><h3 class="d-pr__nome">${a.name}</h3><p class="d-pr__txt">${a.text}</p><a class="d-pr__link" href="${a.url}" target="_blank" rel="noopener">Leggi l'articolo</a></div></li>`).join('');
  if (griglia) griglia.innerHTML = D.news.map((n) => `<a class="d-nw__item" href="${n.url}" target="_blank" rel="noopener"><div class="d-ritaglio d-nw__fig"><img src="${n.img}" alt="" loading="lazy" decoding="async"></div><div class="d-nw__t"><p class="d-nw__date">${n.date}</p><h3 class="d-nw__title">${n.title}</h3></div></a>`).join('');
  $$('.d-sez').forEach((s) => { const q = ['0 100%', '0 16px']; for (let x = 4; x < 100; x += r(5, 11)) q.push(`${x.toFixed(1)}% ${r(0, 20).toFixed(0)}px`); q.push('100% 8px', '100% 100%'); s.style.clipPath = `polygon(${q.join(',')})`; });
  $$('.d-ritaglio').forEach((f) => { const q = [], n = 16; for (let i = 0; i < n; i++) { const a = (i / n) * 4, l = Math.floor(a), t = a - l, j = r(0, 2.4), P = [[t * 100, j], [100 - j, t * 100], [100 - t * 100, 100 - j], [j, 100 - t * 100]][l]; q.push(`${P[0].toFixed(1)}% ${P[1].toFixed(1)}%`); } f.style.clipPath = `polygon(${q.join(',')})`; });
  $('.m-pill')?.classList.add('in-storia');
  ScrollTrigger.create({ trigger: sec, start: 'top bottom', end: 'bottom 60%', onToggle: (s) => $('.m-pill')?.classList.toggle('in-storia', s.isActive) });
  titoli();
  const col = (el, fn, start = 'top top', end = 'bottom bottom') => ScrollTrigger.create({ trigger: el, start, end, onUpdate: (s) => fn(s.progress), onRefresh: (s) => fn(s.progress) });
  const sosta = (u, n) => { const j = Math.min(n - 2, Math.floor(u)); return j + ss(clamp((u - j - 0.2) / 0.6)); }; // da una voce all'altra, con una pausa su ciascuna
  if (reduce) ['.d-cantina', '.d-pr', '.d-nw'].forEach((q) => $(q)?.classList.add('d-ferma'));
  else {
    if ($('.d-cantina')) {
    // cantina: si vola in avanti tra le foto, che passano ai lati del testo senza mai toccarlo; in fondo si entra nell'ultima, a tutto schermo
    const ca = $('.d-cantina'), palco = $('.d-cantina__st', ca), t = $('.d-cantina__t', ca), ff = $$('.d-tun__f', ca), fine = $('.d-tun__fine', ca), PX = 900, PASSO = 520, Yd = [-0.17, 0.15, 0.2, -0.12, -0.2, 0.08, 0.18, -0.08], Dfin = (ff.length + 1) * PASSO;
    t.innerHTML = t.textContent.trim().split(/\s+/).map((w) => `<span>${w}</span>`).join(' ');
    const ws = [...t.children];
    col(ca, (p) => {
      const W = palco.clientWidth, Hv = innerHeight, m = W <= 860, cam = p * Dfin, cy = Hv * (m ? 0.3 : 0.52), q = clamp(p / 0.34) * (ws.length + 6);
      ws.forEach((w, i) => { w.style.opacity = 0.24 + 0.76 * clamp((q - i) / 6); });
      const via = 1 - ss(clamp((p - 0.62) / 0.08)), s0 = m ? 0.24 : 0.42; t.style.opacity = via; t.style.visibility = via > 0.01 ? '' : 'hidden';
      ff.forEach((f, i) => { const s = PX / (PX + (i + 1) * PASSO - cam), vis = s > s0 && s < 2.6; f.style.visibility = vis ? '' : 'hidden'; if (!vis) return; const lato = i % 2 ? 1 : -1; f.style.opacity = clamp((s - s0) / 0.12); f.style.zIndex = Math.round(s * 100); f.style.transform = `translate(-50%,-50%) translate(${lato * W * (m ? 0.52 : 0.62) * s}px,${Yd[i] * Hv * (m ? 0.6 : 1) * s}px) scale(${s})`; });
      const sf = PX / (PX + Dfin - cam), of = clamp((sf - 0.42) / 0.08); fine.style.visibility = of > 0 ? '' : 'hidden'; fine.style.opacity = of; fine.style.transform = `scale(${sf})`;
    }, 'top 60%');
    }
    if ($('.d-pr')) {
    // premi: i loghi girano su una ruota grande, sempre della stessa misura; quello in cima è il premio di cui si legge. Toccandone uno si va lì
    const pr = $('.d-pr'), st = $('.d-pr__st', pr), ruota = $('.d-pr__ruota', pr), li = $$('.d-pr__lista li', pr), lg = li.map((l) => $('.d-pr__logo', l)), tx = li.map((l) => $('.d-pr__testo', l)), N0 = li.length;
    col(pr, (p) => {
      const W = st.clientWidth, Hv = innerHeight, m = W <= 860, R = m ? W * 1.1 : Math.min(W * 0.6, Hv * 1.1), A = (m ? 36 : 24) * (Math.PI / 180), apice = m ? 196 : Hv * 0.34, cy = apice + R, g = p < 0.1 ? (ss(p / 0.1) - 1) * 0.9 : sosta(((p - 0.1) / 0.9) * (N0 - 1), N0);
      ruota.style.width = ruota.style.height = `${R * 2}px`; ruota.style.left = `${W / 2 - R}px`; ruota.style.top = `${apice}px`; ruota.firstElementChild.style.transform = `rotate(${(-g * A * 180) / Math.PI}deg)`;
      st.style.setProperty('--ty', `${apice + (m ? 72 : 104)}px`);
      lg.forEach((l, i) => { const a = (i - g) * A, vis = Math.abs(a) < 1.4; l.style.visibility = vis ? '' : 'hidden'; if (vis) l.style.transform = `translate(-50%,-50%) translate(${W / 2 + R * Math.sin(a)}px,${cy - R * Math.cos(a)}px)`; });
      tx.forEach((x, k) => { const o = clamp(1 - Math.abs(k - g) * 2.4); x.style.opacity = o; x.style.visibility = o > 0.02 ? 'visible' : 'hidden'; x.style.transform = `translate(-50%,${(1 - o) * 16}px)`; });
    });
    lg.forEach((l, i) => l.addEventListener('click', () => { const y = pr.getBoundingClientRect().top + scrollY + (0.1 + (0.9 * i) / (N0 - 1)) * (pr.offsetHeight - innerHeight); FS.lenis ? FS.lenis.scrollTo(y, { duration: 1.2 }) : scrollTo(0, y); }));
    }
    if ($('.d-nw')) {
    // news: un mazzo al centro; scorrendo le foto si girano e vanno ognuna al suo posto. In fondo si vedono tutte, con i titoli
    const nw = $('.d-nw'), sn = $('.d-nw__st', nw), fg = $$('.d-nw__fig', nw), tt = $$('.d-nw__t', nw), ROT = [-7, 5, -3];
    fg.forEach((f, i) => { f.style.zIndex = fg.length - i; });
    let dove = null;
    ScrollTrigger.addEventListener('refreshInit', () => { fg.forEach((f) => { f.style.transform = ''; }); dove = null; });
    col(nw, (p) => {
      if (!dove) { const c = sn.getBoundingClientRect(); dove = fg.map((f) => { const r0 = f.getBoundingClientRect(); return [c.left + c.width / 2 - (r0.left + r0.width / 2), c.top + innerHeight * 0.55 - (r0.top + r0.height / 2)]; }); }
      fg.forEach((f, i) => { const e = ss(clamp((p - 0.08 - i * 0.05) / 0.62)), k = 1 - e; f.style.transform = `perspective(1100px) translate(${dove[i][0] * k}px,${dove[i][1] * k}px) rotate(${ROT[i] * k}deg) rotateY(${(i - 1) * 64 * k}deg) scale(${0.72 + 0.28 * e})`; const o = clamp((e - 0.72) / 0.28); tt[i].style.opacity = o; tt[i].style.transform = `translateY(${(1 - o) * 20}px)`; });
    });
    }
  }
})();
