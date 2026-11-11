/* HOME MODERNA F "La galleria" (orizzontale) e G (immersiva), 3 nov 2026: una visita in museo. All'ingresso il feudo, poi cinque sale, una per collezione: ogni quadro è dipinto a olio da una foto dei luoghi (tools/dipingi.py) e vive da solo: il vento muove vigne e fiori, il mare si muove, il cielo scorre.
   Il vino è parte del quadro: le bottiglie sono dipinte anch'esse (tools/dipingi_bottiglie.py), si dipingono da sole, hanno la loro ombra a terra e se ne vanno col quadro. Cliccandole si apre la scheda con la foto vera, che non si tocca.
   F (moderna-f.html): si cammina in orizzontale come in moderna-e, scorrendo o trascinando; la sala dopo arriva a pennellate. G (moderna-g.html, body.page-mg): uno zoom infinito come lo Zoomquilt, un solo dipinto continuo a più scale. Il quadro dopo sta già dentro un dettaglio di quello prima, piccolissimo e nitido, e avvicinandosi diventa tutto lo schermo. In mezzo ci sono viste sempre più vicine dello stesso punto, ridipinte a ogni scala (tools/dipingi_porte.py).
   H (moderna-h.html, body.page-mh): il cammino di F, ma le bottiglie sono già dentro i quadri (tools/dipingi_soggetto.py), ogni sala col suo stile: sopra stanno solo i bottoni invisibili, e "Tutti i vini" apre l'elenco della collezione. Dopo l'ultima sala le pennellate dipingono il fondo blu della cantina (quadro 'notte') e la scoprono al suo posto: il tramonto diventa notte e non resta uno schermo vuoto.
   Quadri e bottiglie stanno in due shader (WebGL2); la mappa di ogni quadro dice cosa si muove (rosso cielo, verde chiome, blu acqua). Senza WebGL2 restano i quadri fermi con le foto delle bottiglie. Pillola delle sale e "Altri vini" come in moderna-e, scheda in js/scheda.js, dati veri di js/data.js */
(() => {
  const { $, $$, reduce, clamp, ss, titoli } = FS.mk, D = FS.data;
  const sec = $('.e-st'), stage = $('.e-stage'), cv = $('.e-cv'), ink = $('.e-ink'), ictx = ink.getContext('2d'), track = $('.e-track'), tappe = $$('.e-tappa'), nav = $('.fb-tappe'), alto = $('.e-alto');
  const N = tappe.length, m0 = innerWidth <= 860, mob = () => innerWidth <= 860, v = m0 ? '-m' : '';
  const HH = document.body.classList.contains('page-mh'), FERMO = HH && location.search.includes('fermo'), IMM = document.body.classList.contains('page-mg'), FINE_I = N - 1 + 0.5; // G: in fondo ci si ferma sui vini dell'ultima sala
  // G: ogni quadro a riposo. c: un suo punto; s: dove sta quel punto sullo schermo; r: quanto è ingrandito. p: dove sta il quadro dopo, [x, y, larghezza] in frazioni del quadro; z: le viste ridipinte, [x, y, l, h]. p e z li stampa tools/dipingi_porte.py
  const PORTE = [
    { c: [0.56, 0.45], s: m0 ? [0.5, 0.6] : [0.58, 0.6], r: m0 ? 1.3 : 1.08, p: [0.5320, 0.4541, 0.0040], z: [[0.3561, 0.3039, 0.3333, 0.3333], [0.4748, 0.4051, 0.1111, 0.1111], [0.5144, 0.4389, 0.0370, 0.0370], [0.5276, 0.4502, 0.0123, 0.0123]] }, // una finestra del palazzo: dentro una stanza buia, in fondo l'arco sulla vigna (tools/ponte_ai.py)
    { c: [0.437, 0.345], s: m0 ? [0.5, 0.2] : [0.5, 0.27], r: m0 ? 1.25 : 1.1, p: [0.4260, 0.3340, 0.0220], z: [[0.2902, 0.2272, 0.3333, 0.3333], [0.3869, 0.3029, 0.1111, 0.1111], [0.4192, 0.3282, 0.0370, 0.0370]] }, // la foglia dorata
    { c: [0.36, 0.135], s: m0 ? [0.5, 0.15] : [0.5, 0.16], r: m0 ? 1.25 : 1.1, p: [0.2150, 0.1775, 0.0200], z: [[0.1395, 0.1219, 0.3333, 0.3333], [0.1860, 0.1626, 0.1111, 0.1111]] }, // un varco nel filare
    { c: [0.505, 0.38], s: m0 ? [0.5, 0.2] : [0.5, 0.33], r: m0 ? 1.3 : 1.1, p: [0.4875, 0.3784, 0.0350], z: [[0.3368, 0.2533, 0.3333, 0.3333], [0.4491, 0.3377, 0.1111, 0.1111]] }, // la foschia fra i filari
    { c: [0.56, 0.28], s: m0 ? [0.5, 0.2] : [0.5, 0.26], r: m0 ? 1.25 : 1.1, p: [0.5375, 0.7752, 0.0250], z: [[0.3679, 0.5338, 0.3333, 0.3333], [0.4905, 0.7117, 0.1111, 0.1111]] }, // un cespuglio in primo piano
    { r: m0 ? 1.04 : 1.1 },
  ];
  if (FERMO) document.body.classList.add('h-fermo'); // moderna-h.html?fermo: com'era prima dello scorrimento
  const SPAN = HH ? 1.3 : 2, VINO = HH ? (FERMO ? 0.5 : 0.3) : 0.85, TR = HH && !FERMO ? 0.8 : 0.6, PAN = HH && !FERMO ? 0.5 : 0; // una sala è lunga 2 schermi: all'inizio il quadro con la targa, a 0,85 le bottiglie sono al loro posto. H: 1,3 schermi, cartellino e nomi vanno via quando parte il passaggio (TR), la pillola deve fermarsi prima. PAN: nel passaggio il quadro che esce e quello che entra scorrono di mezzo schermo, sotto le pennellate
  // il quadro scorre da [fx, fy, zoom] a [fx, fy, zoom], sempre verso sinistra come chi cammina; col: il fondo finché l'immagine non è pronta
  const Q = (nome, col, desk, tel) => ({ nome, src: `assets/quadri/${nome}${IMM && nome !== 'tramonto' ? '-g' : ''}${v}.webp`, mappa: `assets/quadri/${nome}-mappa.webp`, col, g: m0 ? tel : desk });
  const QUADRI = [
    Q('feudo', '#c4dbdc', [0.4, 0, 1.08, 0.56, 0, 1.08], [0.36, 0, 1.3, 0.56, 0, 1.3]),
    Q('vigne', '#2f6fb0', [0.3, 0.3, 1.28, 0.7, 0.36, 1.28], [0.3, 0.5, 1, 0.74, 0.5, 1.04]),
    Q('terra', '#bc5c2e', [0.3, 0.46, 1.28, 0.66, 0.56, 1.28], [0.28, 0.5, 1, 0.66, 0.5, 1.04]),
    Q('campo', '#8fa86a', [0.38, 0.66, 1.2, 0.62, 0.78, 1.2], [0.34, 0.5, 1.02, 0.66, 0.56, 1.06]),
    Q('mare', '#35a5ad', [0.3, 0.5, 1.28, 0.7, 0.6, 1.28], [0.22, 0.5, 1, 0.72, 0.5, 1.04]),
    Q('tramonto', '#a79bb6', [0.3, 0.44, 1.28, 0.7, 0.54, 1.28], [0.28, 0.5, 1, 0.74, 0.5, 1.04]),
  ];
  if (HH) QUADRI.push(Q('notte', '#0e1728', [0.5, 0.5, 1 / 1.02, 0.5, 0.5, 1 / 1.02], [0.5, 0.5, 1 / 1.02, 0.5, 0.5, 1 / 1.02])); // H: dopo l'ultima sala il fondo blu della cantina, senza bottiglie né cartellino. Zoom giusto per coprire lo schermo come il suo background in css/moderna-h.css: quando le due si danno il cambio non si muove nulla
  // H: per ogni sala il quadro e dove ci sono dipinte le bottiglie, nell'ordine di VINI: [centro x, base y, altezza del vetro] in frazioni del quadro, largo e telefono (come in tools/dipingi_soggetto.py)
  const SALE_H = [null, /* 11 nov: pose diverse da sala a sala, da python -I tools/dipingi_soggetto.py --pose */
    { f: 'pajara', fx: 0.47, sx: 0.62, l: [[0.38, 0.93, 0.72], [0.47, 0.885, 0.63], [0.555, 0.85, 0.56]], t: [[0.25, 0.9, 0.41], [0.5, 0.865, 0.37], [0.76, 0.83, 0.33]] },
    { f: 'terra', fx: 0.715, sx: 0.78, l: [[0.615, 0.84, 0.62], [0.815, 0.855, 0.64], [0.715, 0.93, 0.78]], t: [[0.27, 0.84, 0.35], [0.73, 0.84, 0.35], [0.5, 0.9, 0.41]] },
    { f: 'papaveri', fx: 0.61, sx: 0.6, l: [[0.53, 0.94, 0.74], [0.69, 0.88, 0.62]], t: [[0.34, 0.9, 0.42], [0.68, 0.85, 0.37]] },
    { f: 'spiaggia', fx: 0.378, sx: 0.4, l: [[0.25, 0.875, 0.65], [0.505, 0.875, 0.65], [0.378, 0.9, 0.69]], t: [[0.2, 0.86, 0.35], [0.8, 0.86, 0.35], [0.5, 0.875, 0.37]] },
    { f: 'tramonto', fx: 0.71, sx: 0.74, l: [[0.6, 0.85, 0.58], [0.815, 0.93, 0.74], [0.7, 0.89, 0.66]], t: [[0.24, 0.82, 0.33], [0.76, 0.9, 0.41], [0.5, 0.86, 0.37]] }];
  if (HH) QUADRI.forEach((q, k) => { const s = SALE_H[k]; if (!s) return; q.src = `assets/quadri/soggetto/${s.f}${v}.webp`; q.mappa = `assets/quadri/soggetto/${s.f}${v}-mappa.webp`; q.h = m0 ? { fx: 0.5, sx: 0.5 } : s; q.g = [0.5, 0.5, 1, 0.5, 0.5, 1]; });
  QUADRI.forEach((q, k) => { q.ponti = IMM ? (PORTE[k].z || []).map((_, j) => ({ src: `assets/quadri/${q.nome}-z${j + 1}${v}.webp` })) : []; });
  const VINI = [null,
    { col: 'luxury', vini: ['c53-primitivo', 'gocce', 'c53-negroamaro'] },
    { col: 'terra', vini: ['terra-platinum', 'terra-gold', 'terra-primitivo'] },
    { col: 'organic', vini: ['organic-bianco', 'organic-primitivo'] },
    { col: 'classica', vini: ['cala', 'tre-cuori', 'sassirossi'] },
    { col: 'lounge', vini: ['125-rosato', '125-primitivo', '125-negroamaro'] }];
  const nome = (w) => w.name.replace(/^(Collezione 53|125 Organic|125|Terra)\s+/, '').replace(/\s+(Organic|Edition)$/, '');
  const scheda = Scheda(sec, { schizzi: false, dissolvi: true, disegno: HH ? (w, box, d) => { box.innerHTML = `<i class="h-macchia" style="--wine:${w.color};--stain:var(--nav-stain-${D.wines.indexOf(w) % 3})"></i>`; if (!reduce) gsap.fromTo(box.firstChild, { opacity: 0, scale: 0.7, rotate: -16 }, { opacity: 1, scale: 1, rotate: 0, duration: 1.2, delay: d, ease: 'expo.out' }); } : null }); // solo la bottiglia, come moderna-d. H: dietro, la macchia dipinta del suo colore

  /* ---- bottiglie e nomi: i bottoni sono invisibili e stanno sopra la bottiglia dipinta ---- */
  const bottiglie = [], perSala = tappe.map(() => []);
  tappe.forEach((t, i) => { const c = VINI[i]; if (!c) return;
    $('.e-nomi', t).innerHTML = c.vini.map(() => '<li><button type="button"></button></li>').join('');
    c.vini.forEach((id, j) => { const w = FS.wine(id), b = document.createElement('button'); b.type = 'button'; b.className = 'e-bt'; b.setAttribute('aria-label', `${w.name}, apri la scheda`); b.innerHTML = `<img src="${w.bottle}" alt="" decoding="async" draggable="false">`; t.append(b);
      const o = { el: b, nome: $('.e-nomi', t).children[j], w, j, i, x: 0, riv: 1, rivT: 1, h: 0, hT: 0, pos: HH && SALE_H[i][m0 ? 't' : 'l'][j] }; if (HH) b.style.zIndex = Math.round(o.pos[1] * 100); // dove si sovrappongono, vince la bottiglia davanti
      $('button', o.nome).textContent = nome(w); b.style.setProperty('--b', Scheda.FONDO[w.bottle] ?? 0.91); bottiglie.push(o); perSala[i].push(o);
      b.addEventListener('click', () => scheda.apri(o.w, o.el)); $('button', o.nome).addEventListener('click', () => scheda.apri(o.w, o.el));
      b.addEventListener('pointerenter', () => { o.hT = 1; }); b.addEventListener('pointerleave', () => { o.hT = 0; }); }); });

  /* ---- misure ---- */
  let W = 1, H = 1, dpr = Math.min(devicePixelRatio || 1, m0 ? 1.5 : 1.75), cam = 0, BH = 1, BASE = 1, PS = null, sporco = true, X = [0], Y = [0], FINE = 1; // X: dove comincia ogni sala; Y: dove le sue bottiglie sono al loro posto
  const corsa = () => sec.offsetHeight - stage.offsetHeight;
  const tele = () => { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); ink.width = Math.round(W * 0.5); ink.height = Math.round(H * 0.5); sporco = true; };
  const misura = () => {
    const m = mob(), hv = alto.offsetHeight || innerHeight, q = stage.getBoundingClientRect(); W = q.width; H = q.height; tele();
    const carte = tappe.slice(1).map((t) => $('.e-testo', t)), alta = m ? Math.max(...carte.map((c) => c.offsetHeight)) : 0, destra = m ? 0 : Math.max(...carte.map((c) => parseFloat(getComputedStyle(c).left) + c.offsetWidth));
    BASE = m ? hv - alta - 50 : hv - Math.max(46, hv * 0.056);
    const sopra = IMM ? hv * (m ? 0.29 : 0.46) : m ? 128 : 112; BH = Math.min((BASE - sopra) / 0.91, m ? W - 24 : hv * 0.7, m ? 1e4 : (W - destra - 72) / 1.2); const dx = Math.min(BH * 0.42, W * 0.3), xo = m ? 0 : (destra + 24) / 2;
    for (const [k, val] of [['--w', `${W}px`], ['--edge', `${BASE - 14}px`], ['--bh', `${BH}px`], ['--rifl', '0px']]) stage.style.setProperty(k, val);
    bottiglie.forEach((b) => { const n = VINI[b.i].vini.length; b.x = xo + (n === 1 ? 0 : n === 2 ? (b.j ? 1 : -1) * dx * 0.62 : (b.j - 1) * dx); for (const el of [b.el, b.nome]) { el.style.setProperty('--x', b.x); el.style.setProperty('--dx', dx); } });
    X = tappe.map((_, i) => (i ? W + (i - 1) * SPAN * W : 0)); if (HH) X.push(X[N - 1] + SPAN * W); Y = X.map((x, i) => (i ? x + VINO * W : 0)); FINE = HH ? X[N] : Y[N - 1]; if (!IMM) tappe.forEach((t, i) => { t.style.left = `${Y[i]}px`; });
    PS = null;
  };

  /* ---- il pittore vivo. Quadro: la mappa dice cosa ondeggia e come; in G gli strati annidati hanno un bordo morbido (uBordo) ed entrano piano (uAlfa). Bottiglia: si dipinge dal basso a tocchi. Tutti e due possono passare dalla maschera delle pennellate, così nel cambio di sala se ne vanno insieme ---- */
  const COMUNE = `
  uniform sampler2D uPen; uniform vec2 uRes; uniform float uPenOn; in vec2 vP; out vec4 o;
  float hh(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float nz(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f); return mix(mix(hh(i), hh(i + vec2(1, 0)), f.x), mix(hh(i + vec2(0, 1)), hh(i + vec2(1, 1)), f.x), f.y); }
  float pen() { if (uPenOn < .5) return 1.; vec2 f = vP * vec2(.3, .012), d = vec2(nz(f), nz(f + 41.)) - .5; return texture(uPen, (vP + d * vec2(34., 90.)) / uRes).a; } // la maschera letta di sbieco, a fili lunghi: il bordo della pennellata sfilaccia come una setola secca`;
  const VS_TUTTO = `#version 300 es
      uniform vec2 uRes; out vec2 vP; void main() { vec2 a = vec2(float(gl_VertexID & 1) * 4. - 1., float(gl_VertexID >> 1) * 4. - 1.); vP = vec2(a.x * .5 + .5, .5 - a.y * .5) * uRes; gl_Position = vec4(a, 0., 1.); }`;
  const FS_QUADRO = `#version 300 es
  precision highp float;${COMUNE}
  uniform sampler2D uTex, uMap; uniform vec4 uBox; uniform float uT, uRaffica, uMoto, uAlfa, uBordo, uNitido;
  void main() {
    vec2 uv = (vP - uBox.xy) / uBox.zw, b = uBordo > 0. ? clamp(min(uv, 1. - uv) / uBordo, 0., 1.) : vec2(1.); vec3 m = texture(uMap, uv).rgb * uMoto;
    float b1 = sin(uT * 1.15 + uv.x * 22. + uv.y * 14.) + .5 * sin(uT * 2.6 + uv.x * 47. - uv.y * 31.), b2 = cos(uT * .95 + uv.y * 24. - uv.x * 9.), ra = 1. + uRaffica * 2.4;
    uv += m.r * vec2(sin(uv.y * 7. + uT * .16) * .0035, sin(uv.x * 9. + uT * .12) * .002);
    uv += m.g * vec2(b1 * .0017, b2 * .0011) * ra;
    uv += m.b * vec2(sin(uv.y * 160. + uT * 1.3) * .0013 + sin(uv.y * 70. - uT * .7) * .0015, sin(uv.x * 90. + uT * .9) * .0009);
    vec3 c = texture(uTex, uv, uNitido).rgb;
    c += m.b * pow(max(0., sin(uv.x * 420. + uT * 2.) * sin(uv.y * 900. - uT * 1.5)), 24.) * .28;
    b = b * b * (3. - 2. * b); float a = pen() * uAlfa * b.x * b.y;
    o = vec4(c, a);
  }`;
  const FS_BOTTIGLIA = `#version 300 es
  precision highp float;${COMUNE}
  uniform sampler2D uTex; uniform vec4 uBox; uniform float uRiv, uFondo, uModo;
  void main() {
    vec2 uv = (vP - uBox.xy) / uBox.zw;
    if (uModo > .5) { vec2 e = (uv - .5) * 2.; float a = exp(-dot(e, e) * 2.4) * (.72 + .28 * sin(uv.y * 60. + nz(uv * vec2(9., 40.)) * 7.)); o = vec4(.07, .045, .05, a * .66 * clamp(uRiv * 1.6 - .1, 0., 1.) * pen()); return; }
    if (uv.x < 0. || uv.x > 1. || uv.y < 0. || uv.y > 1.) discard;
    vec4 t = texture(uTex, uv); if (t.a < .004) discard;
    float s = (1. - uv.y / uFondo) + (nz(vec2(uv.x * 8., uv.y * 3.)) - .5) * .45, a = smoothstep(s - .09, s + .09, uRiv * 1.55 - .28);
    o = vec4(t.rgb, t.a * a * pen());
  }`;
  const gl = cv.getContext('webgl2', { alpha: false, antialias: false, powerPreference: 'high-performance' }), c2 = gl ? null : cv.getContext('2d', { alpha: false });
  let pQ = null, pB = null, UQ = {}, UB = {}, tPen = null, aniso = null;
  const tinta = (col) => { const t = gl.createTexture(), h = parseInt(col.slice(1), 16); gl.bindTexture(gl.TEXTURE_2D, t); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([h >> 16, (h >> 8) & 255, h & 255, 255])); for (const [a, b] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, a, b); return t; };
  const NOMI = ['uPen', 'uRes', 'uPenOn', 'uTex', 'uBox', 'uMap', 'uT', 'uRaffica', 'uMoto', 'uAlfa', 'uBordo', 'uNitido', 'uRiv', 'uFondo', 'uModo'];
  if (gl) {
    stage.classList.add('f-gl');
    const sh = (tipo, src) => { const s = gl.createShader(tipo); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s)); return s; };
    const prog = (vs, fs) => { const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) console.error(gl.getProgramInfoLog(p)); return p; };
    const VS_RIQUADRO = `#version 300 es
      uniform vec2 uRes; uniform vec4 uBox; out vec2 vP; void main() { vec2 a = vec2(float(gl_VertexID & 1), float(gl_VertexID >> 1)); vP = uBox.xy - 90. + a * (uBox.zw + 180.); gl_Position = vec4(vP.x / uRes.x * 2. - 1., 1. - vP.y / uRes.y * 2., 0., 1.); }`;
    pQ = prog(VS_TUTTO, FS_QUADRO); pB = prog(VS_RIQUADRO, FS_BOTTIGLIA);
    for (const n of NOMI) { UQ[n] = gl.getUniformLocation(pQ, n); UB[n] = gl.getUniformLocation(pB, n); }
    gl.bindVertexArray(gl.createVertexArray());
    gl.useProgram(pQ); gl.uniform1i(UQ.uTex, 0); gl.uniform1i(UQ.uMap, 1); gl.uniform1i(UQ.uPen, 4);
    gl.useProgram(pB); gl.uniform1i(UB.uTex, 5); gl.uniform1i(UB.uPen, 4);
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    aniso = gl.getExtension('EXT_texture_filter_anisotropic'); tPen = tinta('#000000');
    QUADRI.forEach((q) => { q.tinta = tinta(q.col); q.nero = tinta('#000000'); q.tex = q.tinta; q.mtx = q.nero; });
  }
  /* le immagini: prima il feudo, poi le altre una alla volta. Sulla scheda grafica stanno solo i quadri vicini: uno solo caricato per fotogramma */
  const leggi = (src) => { const im = new Image(); im.src = src; return im.decode().catch(() => {}).then(() => im); };
  QUADRI.reduce((p, q) => p.then(() => Promise.all([leggi(q.src), leggi(q.mappa), ...q.ponti.map((o) => leggi(o.src).then((im) => { o.im = im; }))])).then(([a, b]) => { q.im = a; q.imM = b; q.ok = a.naturalWidth > 0; sporco = true; }), Promise.resolve());
  const tela = (im, specchio) => { const t = gl.createTexture(); const giro = specchio ? gl.MIRRORED_REPEAT : gl.CLAMP_TO_EDGE; // G e H: fuori dal bordo il quadro continua specchiato: arrivando o scorrendo non resta mai un vuoto
    gl.bindTexture(gl.TEXTURE_2D, t); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im); gl.generateMipmap(gl.TEXTURE_2D); for (const [a, b] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, giro], [gl.TEXTURE_WRAP_T, giro]]) gl.texParameteri(gl.TEXTURE_2D, a, b); if (aniso) gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, 4); return t; };
  const TB = new Map(), dipinta = (w) => `assets/quadri/bottiglie/${w.bottle.split('/').pop()}`;
  const pronta = (w) => { if (!gl || HH) return Promise.resolve(); const src = dipinta(w); let e = TB.get(src); if (!e) { e = { tex: null, ratio: 0.64 }; e.p = leggi(src).then((im) => { if (im.naturalWidth) { e.tex = tela(im); e.ratio = im.naturalWidth / im.naturalHeight; sporco = true; } }); TB.set(src, e); } return e.p; };
  const prepara = (i) => { if (!gl) return; let fatto = false; QUADRI.forEach((q, k) => { const vicino = k >= i - 1 && k <= i + 1; if (vicino) perSala[k]?.forEach((o) => pronta(o.w)); if (vicino && q.ok && !q.su && !fatto) { q.tex = tela(q.im, IMM || PAN > 0); q.mtx = q.imM.naturalWidth ? tela(q.imM) : q.nero; q.su = true; fatto = true; sporco = true; } else if (!vicino && q.su) { gl.deleteTexture(q.tex); if (q.mtx !== q.nero) gl.deleteTexture(q.mtx); q.tex = q.tinta; q.mtx = q.nero; q.su = false; } for (const o of q.ponti) { if (vicino && q.su && !fatto && !o.tex && o.im?.naturalWidth) { o.tex = tela(o.im); fatto = true; sporco = true; } else if (!vicino && o.tex) { gl.deleteTexture(o.tex); o.tex = null; } } }); };

  /* dove sta il quadro: copre lo schermo e scorre (t da 0 a 1, da quando arriva a quando se ne va) */
    const posa = (q, t) => { const u = reduce ? 0.5 : clamp(t), [f0, g0, z0, f1, g1, z1] = q.g, iw = q.im?.naturalWidth || 3, ih = q.im?.naturalHeight || 2, s = Math.max(W / iw, H / ih) * (z0 + (z1 - z0) * u) * 1.02, w = iw * s, h = ih * s; if (q.h) return [clamp(W * q.h.sx - (q.h.fx + (u - 0.5) * 0.012) * w, W - w, 0), clamp(H - 0.99 * h, H - h, 0), w, h]; /* H: le bottiglie stanno sempre dove c'è posto (fx nel quadro, sx sullo schermo), e in basso restano fondi e nomi */ return [clamp(W / 2 - (f0 + (f1 - f0) * u) * w, W - w, 0), clamp(H / 2 - (g0 + (g1 - g0) * u) * h, H - h, 0), w, h]; };
  /* G: il quadro fermo */
  const riposo = (k) => { const q = QUADRI[k], P = PORTE[k], iw = q.im?.naturalWidth || 3, ih = q.im?.naturalHeight || 2, s = Math.max(W / iw, H / ih) * P.r, w = iw * s, h = ih * s, [cx, cy] = P.c || [0.5, 0.5], [sx, sy] = P.s || [0.5, 0.5]; return { tx: clamp(W * sx - cx * w, W - w, 0), ty: clamp(H * sy - cy * h, H - h, 0), w, h }; };

  /* ---- il cambio di sala: una maschera di pennellate da destra a sinistra. Ogni pennellata è un fascio di setole che finiscono a lunghezze diverse, così non c'è mai un bordo dritto ---- */
  const passate = (xa = 0, xb = W) => { const nc = Math.ceil((xb - xa) / (W / (mob() ? 6 : 11))), nr = 3, cw = (xb - xa) / nc, lw = cw * 2.1, nS = mob() ? 14 : 22, lista = [], rnd = (a, b) => a + Math.random() * (b - a);
    for (let i = -1; i <= nc; i++) for (let j = 0; j < nr; j++) { const x0 = xa + (i + 0.5) * cw + rnd(-0.3, 0.3) * cw, y0 = ((j + 0.5) * H) / nr + (rnd(-0.14, 0.14) * H) / nr, an = 1.57 + rnd(-0.34, 0.34), L = (H / nr) * 1.9, sg = j === 0 ? 1 : j === nr - 1 ? -1 : Math.random() < 0.5 ? 1 : -1, /* la fila in alto parte dal bordo alto, quella in basso dal basso: se crescessero verso il bordo, il quadro di prima resterebbe appeso lì a colature finché non arrivano */ dx = Math.cos(an) * (L / 2) * sg, dy = Math.sin(an) * (L / 2) * sg, nx = -Math.sin(an), ny = Math.cos(an), bg = rnd(-0.22, 0.22) * L, ini = (1 - clamp((x0 - xa) / (xb - xa))) * 0.72 + rnd(0, 0.1);
      for (let k = 0; k < nS; k++) { const o = (k / (nS - 1) - 0.5) * lw; lista.push({ ax: x0 - dx + nx * o, ay: y0 - dy + ny * o, cx: x0 + nx * (o + bg), cy: y0 + ny * (o + bg), bx: x0 + dx + nx * o, by: y0 + dy + ny * o, ini: ini + rnd(0, 0.03), dur: rnd(0.11, 0.15) }); } }
    return { lista, w: (lw / nS) * 1.5 }; };
  const pennello = (n, ps, xa = 0, xb = W) => {
    const x = tratti(ps ?? (PS ??= passate()), n), pieno = xa + (xb - xa) * (1 - (n - 0.28) / 0.72); if (pieno < xb) x.fillRect(Math.max(xa, pieno), 0, xb - Math.max(xa, pieno), H); // da qui a destra le pennellate hanno tutte finito (0,28 è il ritardo massimo di una): si chiudono i buchi fra l'una e l'altra, da cui si vedrebbe ancora il quadro di prima
    gl.activeTexture(gl.TEXTURE4); gl.bindTexture(gl.TEXTURE_2D, tPen); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, ink);
  };
  const tratti = (ps, n) => {
    const x = ictx, va = new Path2D(), fine = new Path2D(); x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, ink.width, ink.height); x.setTransform(ink.width / W, 0, 0, ink.height / H, 0, 0); x.lineCap = 'round'; x.strokeStyle = x.fillStyle = '#000';
    for (const o of ps.lista) { const k = clamp((n - o.ini) / o.dur); if (k <= 0) continue; const p = k < 1 ? va : fine; p.moveTo(o.ax, o.ay); for (let t = 1; t <= 6; t++) { const u = (t / 6) * k, m = 1 - u; p.lineTo(m * m * o.ax + 2 * m * u * o.cx + u * u * o.bx, m * m * o.ay + 2 * m * u * o.cy + u * u * o.by); } }
    x.lineWidth = ps.w; x.stroke(va); x.lineWidth = ps.w * 2.4; x.stroke(fine); return x;
  };

  /* ---- pillola delle sale ---- */
  const STOP = [1, 2, 3, 4, 5], SOSTA = 0.18, mini = (i) => bottiglie.filter((b) => b.i === STOP[i] && !b.el.hidden).map((b) => `<img src="${b.w.bottle}" alt="" decoding="async">`).join(''), etichetta = (i) => FS.collection(VINI[STOP[i]].col)?.name ?? '';
  nav.innerHTML = `<ul class="fb-menu" id="fb-menu" hidden>${STOP.map((_, i) => `<li><button type="button"><span class="fb-mini">${mini(i)}</span><span class="n">Sala ${i + 1}</span>${etichetta(i)}</button></li>`).join('')}</ul>
    <button class="fb-pill" type="button" aria-expanded="false" aria-controls="fb-menu"><span class="fb-mini"></span><span class="fb-pill__t"></span><span class="fb-pill__n"></span><span class="fb-pill__v" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="1.6"/></svg></span></button>`;
  const pill = $('.fb-pill', nav), menu = $('.fb-menu', nav), navB = $$('button', menu), apriM = (on) => { menu.hidden = !on; pill.setAttribute('aria-expanded', on); };
  let cur = -1; const segna = (i) => { if (i === cur) return; cur = i; $('.fb-mini', pill).innerHTML = mini(i); $('.fb-pill__t', pill).textContent = etichetta(i); $('.fb-pill__n', pill).textContent = `Sala ${i + 1}`; navB.forEach((b, k) => b.setAttribute('aria-current', k === i)); };
  pill.addEventListener('click', () => apriM(menu.hidden));
  document.addEventListener('click', (e) => { if (!nav.contains(e.target)) apriM(false); });
  const vai = (a) => { const fr = IMM ? a / FINE_I : a / FINE, y = sec.getBoundingClientRect().top + scrollY + fr * corsa(); FS.lenis ? FS.lenis.scrollTo(y, { duration: IMM ? 1.8 + Math.abs(a - cam) * 1.6 : 1.8 + (Math.abs(a - cam) / W) * 0.3 }) : scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' }); };
  navB.forEach((b, k) => b.addEventListener('click', () => { apriM(false); vai(IMM ? STOP[k] + SOSTA : Y[STOP[k]]); }));
  $$('[data-vai]').forEach((b) => b.addEventListener('click', () => vai(IMM ? +b.dataset.vai + SOSTA : X[+b.dataset.vai])));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') apriM(false); });

  /* ---- F: si trascina per camminare, come moderna-e (solo in orizzontale: in verticale scorre la pagina) ---- */
  let tira = null;
  if (!IMM) {
    stage.addEventListener('pointerdown', (e) => { if (e.target.closest('.fb-zoom, .fb-tappe, a, .btn')) return; tira = { x: e.clientX, y: e.clientY, s: scrollY, su: false, id: e.pointerId }; });
    stage.addEventListener('pointermove', (e) => { if (!tira || e.pointerId !== tira.id) return; const d = e.clientX - tira.x; if (!tira.su) { if (Math.abs(d) < 8 || Math.abs(d) < Math.abs(e.clientY - tira.y)) return; tira.su = true; stage.setPointerCapture(e.pointerId); stage.classList.add('is-tira'); } const y = tira.s - ((d * corsa()) / FINE) * 1.2; FS.lenis ? FS.lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y); });
    const lascia = () => { tira = null; stage.classList.remove('is-tira'); };
    stage.addEventListener('pointerup', lascia); stage.addEventListener('pointercancel', lascia);
  }

  /* ---- il disegno di una scena: il quadro in un riquadro, poi le bottiglie con la loro ombra. sposta porta i riquadri delle bottiglie da dove stanno a dove sono ora ---- */
  const dipQ = (q, box, pen, t, raffica, moto = 1, alfa = 1, bordo = 0) => { gl.useProgram(pQ); gl.uniform2f(UQ.uRes, W, H); gl.uniform1f(UQ.uPenOn, pen ? 1 : 0); gl.uniform1f(UQ.uMoto, moto); gl.uniform1f(UQ.uAlfa, alfa); gl.uniform1f(UQ.uBordo, bordo); gl.uniform1f(UQ.uNitido, HH ? -0.85 : 0); gl.uniform4f(UQ.uBox, ...box); gl.uniform1f(UQ.uT, t); gl.uniform1f(UQ.uRaffica, raffica); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, q.tex); gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, q.mtx); gl.drawArrays(gl.TRIANGLES, 0, 3); };
  const dipB = (k, r, pen, sposta) => { if (r <= 0.001 || HH) return; const vive = perSala[k].filter((o) => !o.el.hidden && TB.get(dipinta(o.w))?.tex); gl.useProgram(pB); gl.uniform2f(UB.uRes, W, H); gl.uniform1f(UB.uPenOn, pen ? 1 : 0); gl.activeTexture(gl.TEXTURE5);
    gl.uniform1f(UB.uModo, 1); for (const o of vive) { const b = BH * 0.6; gl.uniform4f(UB.uBox, ...sposta([W / 2 + o.x - b * 0.34, BASE - BH * 0.035, b * 1.1, BH * 0.07])); gl.uniform1f(UB.uRiv, Math.min(r, o.riv)); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); }
    gl.uniform1f(UB.uModo, 0); for (const o of vive) { const e = TB.get(dipinta(o.w)), bw = BH * e.ratio, fo = Scheda.FONDO[o.w.bottle] ?? 0.91; gl.bindTexture(gl.TEXTURE_2D, e.tex); gl.uniform4f(UB.uBox, ...sposta([W / 2 + o.x - bw / 2, BASE - BH * fo - o.h * 8, bw, BH])); gl.uniform1f(UB.uRiv, Math.min(r, o.riv)); gl.uniform1f(UB.uFondo, fo); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); } };

  /* F: cam è in px lungo la galleria. In una sala, d = (cam - X[sala]) / W: a 0 il quadro con la targa; da 0,28 le bottiglie si dipingono nel quadro e ci restano, si muovono con lui; negli ultimi 0,6 la sala dopo a pennellate */
  const scorre = (f) => ((cam - X[f]) / W + 0.5) / (SPAN + 0.5);
  const pas = (i) => { if (i >= QUADRI.length - 1) return 0; const d = (cam - X[i]) / W; return ss(clamp(i ? (d - (SPAN - TR)) / TR : (d - 0.2) / 0.8)); }; // quanto è avanti il passaggio dalla sala i alla dopo
  const pan = (k) => (PAN && gl && !reduce ? PAN * W * ((k ? Math.max(0, 1 - pas(k - 1) / 0.62) : 0) - pas(k)) : 0); // H: di quanto il quadro è spostato: arriva da destra, se ne va a sinistra. Quello nuovo è già a posto prima che le pennellate arrivino al bordo sinistro (a 0,72): altrimenti si vedrebbe il suo bordo specchiato
  const rivela = (k) => (k ? ss(clamp(((cam - X[k]) / W - 0.28) / 0.4)) : 0);
  const fuori = (k) => { const q = QUADRI[k], c = ((Y[k] - X[k]) / W + 0.5) / (SPAN + 0.5); return posa(q, scorre(k))[0] - posa(q, c)[0]; }; // quanto il quadro si è spostato rispetto a dove le bottiglie stanno al loro posto
  const scena = (k, pen, t, raffica) => { const b = posa(QUADRI[k], scorre(k)); b[0] += pan(k); dipQ(QUADRI[k], b, pen, t, raffica); const off = fuori(k); dipB(k, rivela(k), pen, ([x, y, w, h]) => [x + off, y, w, h]); };
  let prima = performance.now(), misW = 0, misH = 0, ultimo = 0, intro = reduce ? 1 : 0, inizio = 0, sale = null, raffica = 0, conta = 0, somma = 0;
  const tempo = (dt) => { for (const o of bottiglie) { if (o.riv !== o.rivT) { sporco = true; o.riv = o.rivT > o.riv ? Math.min(o.rivT, o.riv + dt / 900) : Math.max(o.rivT, o.riv - dt / 260); } o.h += (o.hT - o.h) * (1 - Math.exp(-dt / 120)); } };
  const inSale = (on) => { if (on !== sale) { sale = on; document.body.classList.toggle('f-sale', on); } };
  const adatta = (pass) => { if (!reduce && dpr > 1) { conta++; somma += pass; if (conta === 50) { if (somma / conta > (m0 ? 48 : 30)) { dpr = Math.max(1, dpr - 0.25); tele(); } conta = somma = 0; } } }; // se il telefono fatica si scende di risoluzione
  const ingresso = (now, disegna) => { gl.clearColor(0.953, 0.937, 0.918, 1); gl.clear(gl.COLOR_BUFFER_BIT); if (QUADRI[0].su) { inizio ||= now; intro = Math.min(1, (now - inizio) / 2600); pennello(intro); disegna(); } };

  /* H, "Altri vini": il quadro nuovo è lo stesso con altre bottiglie. Le pennellate passano solo sulla fascia dove stanno, e le dipingono sul posto */
  const RIDIPINGI = 2200, quadroDi = (k, gruppo) => `assets/quadri/soggetto/${SALE_H[k].f}${gruppo ? `-${gruppo + 1}` : ''}${v}.webp`;
  const finisci = (q) => { gl.deleteTexture(q.tex); q.tex = q.nuovo.tex; q.nuovo = null; sporco = true; };
  const ridipingi = (k, im) => { const q = QUADRI[k]; if (!im.naturalWidth) return; q.im = im; sporco = true; if (!gl || !q.su) return; if (q.nuovo) finisci(q); const tex = tela(im, IMM || PAN > 0); if (reduce) { gl.deleteTexture(q.tex); q.tex = tex; } else q.nuovo = { tex, t0: performance.now() }; };
  const ridipinta = (k, now, t) => { const q = QUADRI[k], c = q.nuovo, b = posa(q, scorre(k)); b[0] += pan(k); if (!c.ps) { const cx = perSala[k].map((o) => o.pos[0]), m = Math.max(...perSala[k].map((o) => o.pos[2])) * b[3] * 0.75; c.xa = Math.max(0, b[0] + Math.min(...cx) * b[2] - m); c.xb = Math.min(W, b[0] + Math.max(...cx) * b[2] + m); c.ps = passate(c.xa, c.xb); } pennello(ss(clamp((now - c.t0) / RIDIPINGI)), c.ps, c.xa, c.xb); dipQ({ tex: c.tex, mtx: q.mtx }, b, true, t, raffica); };

  /* H: con la rotella veloce il cammino non corre: un passaggio dura almeno 1,4 s (fra un passaggio e l'altro va più svelto) e in fondo alla storia la pagina aspetta che sia finito. I clic su pillola e menu restano salti */
  let rotella = false; if (HH && gl && !reduce) { addEventListener('wheel', () => { rotella = true; }, { passive: true }); addEventListener('click', () => { rotella = false; }, true); }
  const giroF = (now, dt, q) => {
    const dest = clamp(-q.top / Math.max(1, corsa())) * FINE, prec = cam; let passo = (dest - cam) * (reduce ? 1 : 1 - Math.exp(-dt / 110));
    if (rotella) { let j = 0; while (j < N - 1 && cam >= X[j + 1]) j++; const g = pas(j), lim = (dt / 1000) * W * (g > 0 && g < 1 ? TR / 1.4 : 1.6); passo = clamp(passo, -lim, lim); }
    cam += passo; if (Math.abs(dest - cam) < 0.1) cam = dest; if (cam !== prec) sporco = true;
    raffica += (Math.min(1, (Math.abs(cam - prec) / Math.max(dt, 1)) * 0.5) - raffica) * (1 - Math.exp(-dt / 300)); // camminando si alza il vento
    tempo(dt);
    let i = 0; while (i < N - 1 && cam >= X[i + 1]) i++;
    const g0 = pas(i), w = reduce ? +(g0 > 0.5) : g0;
    track.style.transform = `translate3d(${-cam}px,0,0)`;
    tappe.forEach((t, k) => { const dd = Y[k] - cam, el = t._c ?? (t._c = $('.e-testo', t)), primo = !k && HH && gl && !reduce, o = primo ? +(pas(0) < 0.93) : HH && k ? ss(clamp((cam - X[k] + W * 0.3) / (W * 0.3))) * (1 - ss(clamp((cam - X[k + 1] + W * TR) / (W * 0.3)))) : Math.abs(dd) > W * 1.3 ? 0 : 1 - ss(clamp((Math.abs(dd) - W * 0.12) / (W * 0.34))); if (o !== t._o) { t._o = o; el.style.opacity = o; el.style.visibility = o > 0.01 ? 'visible' : 'hidden'; }
      if (primo && o) { const xf = W * (1 - (pas(0) - 0.02) / 0.72); t.style.translate = `${cam}px 0`; Object.assign(t.style, { maskImage: 'url(assets/quadri/bordo-o.webp), linear-gradient(#000, #000)', maskSize: `170px auto, ${Math.max(0, xf + 1)}px 100%`, maskRepeat: 'repeat-y, no-repeat', maskPosition: `${xf}px 0, 0 0` }); } // H: il testo d'ingresso sta fermo e lo coprono le pennellate del primo passaggio. La maschera c'è da subito: applicata dopo, la prima volta sparirebbe tutto finché l'immagine non è caricata
      if (!k) return;
      if (HH && o > 0) el.style.translate = `${-dd + pan(k)}px 0`; // H: il cartellino resta col suo quadro: camminando per conto suo passerebbe sopra le bottiglie
      const dk = (cam - X[k]) / W, r = rivela(k), via = k < N - 1 ? 1 - ss(clamp((dk - (SPAN - 0.62)) / 0.2)) : 1, vis = HH ? o : r * via; if (vis !== t._vis) { t._vis = vis; $('.e-nomi', t).style.opacity = vis; t.classList.toggle('f-vivo', vis > 0.5); }
      if (vis > 0 && HH) { const [tx, ty, wq, hq] = posa(QUADRI[k], scorre(k)); for (const o of perSala[k]) { const [cx, by, hv] = o.pos, x = `${tx + pan(k) + cx * wq - Y[k] + cam}px`, base = ty + by * hq, alto = hv * hq; o.el.style.setProperty('--off', x); o.el.style.setProperty('--offy', `${base - alto}px`); o.el.style.setProperty('--bh', `${alto / (Scheda.FONDO[o.w.bottle] ?? 0.91)}px`); o.nome.style.setProperty('--off', x); o.nome.style.setProperty('--offy', `${base + 8}px`); } }
      else if (vis > 0) t.style.setProperty('--off', `${cam - Y[k] + fuori(k)}px`); }); // i bottoni seguono le bottiglie, che stanno ferme nel quadro
    segna(clamp(Math.floor((cam - X[1] + W * 0.35) / (SPAN * W)), 0, STOP.length - 1));
    const notte = pas(N - 1), scura = notte > 0.42, so = clamp((cam - W * 0.62) / (W * 0.2)) * (1 - clamp(notte / 0.3)); nav.style.opacity = so; nav.style.visibility = so > 0 ? '' : 'hidden'; // H: verso la cantina se ne va la pillola
    inSale(cam > W * 0.6 && notte < 0.8); // le targhette restano finché le pennellate non hanno coperto anche la sinistra
    if (scura !== sec._scura) { sec._scura = scura; sec.classList.toggle('hero--dark', scura); dispatchEvent(new Event('scroll')); } // js/nav.js legge da qui il tono dell'intestazione, ma solo quando si scorre
    for (const c of QUADRI) if (c.nuovo && (c !== QUADRI[i] || w > 0 || now - c.nuovo.t0 >= RIDIPINGI)) finisci(c); // se si cammina finisce subito: la maschera delle pennellate è una sola
    prepara(i);
    const f = w >= 1 ? i + 1 : i, qf = QUADRI[f];
    if (!gl) { if (sporco && qf.ok) { sporco = false; const [tx, ty, wq, hq] = posa(qf, scorre(f)); c2.setTransform(dpr, 0, 0, dpr, 0, 0); c2.drawImage(qf.im, tx, ty, wq, hq); } return; }
    if (m0 && now - ultimo < 30) return;
    if (reduce && !sporco && intro >= 1) return; sporco = false;
    const pass = Math.min(120, now - ultimo); ultimo = now; const t = reduce ? 0 : now / 1000;
    gl.viewport(0, 0, cv.width, cv.height);
    if (intro < 1) { if (cam > W * 0.05) intro = 1; else return ingresso(now, () => dipQ(QUADRI[0], posa(QUADRI[0], scorre(0)), true, t, 0)); } // l'ingresso: il feudo arriva a pennellate sulla tela crema
    scena(f, false, t, raffica);
    if (w > 0 && w < 1) { pennello(w); scena(i + 1, true, t, raffica); }
    else if (qf.nuovo) ridipinta(f, now, t);
    adatta(pass);
  };

  /* G: cam è in sale. Si entra sempre, senza scatti: e va da 0 a 1 (quanto si è entrati nel quadro) e rallenta senza fermarsi dove ci sono le bottiglie. Ci si avvicina al dettaglio che contiene il quadro dopo. Sopra il quadro stanno le sue viste ridipinte, ciascuna entra quando è abbastanza grande da essere nitida: mostrano la stessa cosa, il passaggio non si vede. Le bottiglie stanno nel quadro: crescono e passano ai lati */
  const entra = (k, u) => (k < N - 1 ? 0.05 * u + 0.95 * ss(clamp((u - (k ? 0.3 : 0.06)) / (k ? 0.7 : 0.94))) : 0);
  const giroG = (now, dt, q) => {
    const dest = clamp(-q.top / Math.max(1, corsa())) * FINE_I, prec = cam; cam += (dest - cam) * (reduce ? 1 : 1 - Math.exp(-dt / 130)); if (Math.abs(dest - cam) < 1e-4) cam = dest; if (cam !== prec) sporco = true;
    raffica += (Math.min(1, (Math.abs(cam - prec) / Math.max(dt, 1)) * 900) - raffica) * (1 - Math.exp(-dt / 300));
    tempo(dt);
    const i0 = Math.min(N - 1, Math.floor(cam)), e0 = entra(i0, cam - i0), i = reduce && e0 > 0.5 ? i0 + 1 : i0, e = reduce ? 0 : e0, R0 = riposo(i), P = PORTE[i].p;
    // la camera: si ingrandisce attorno al punto (fx, fy) che porta il quadro dopo esattamente al suo posto. C porta le misure a riposo di un quadro sullo schermo
    const C = { k: i, r: R0, a: 1, bx: 0, by: 0 }; let dentro = null;
    if (P) { const R1 = riposo(i + 1), [ox, oy, ow] = P, Z = R1.w / (ow * R0.w), fx = (R1.tx - ox * R0.w * Z - Z * R0.tx) / (1 - Z), fy = (R1.ty - oy * R0.h * Z - Z * R0.ty) / (1 - Z); C.a = Z ** e; C.bx = fx * (1 - C.a); C.by = fy * (1 - C.a);
      const a1 = (C.a * ow * R0.w) / R1.w; dentro = { k: i + 1, r: R1, a: a1, bx: C.a * (R0.tx + ox * R0.w) + C.bx - a1 * R1.tx, by: C.a * (R0.ty + oy * R0.h) + C.by - a1 * R1.ty }; }
    tappe.forEach((t, k) => { const uk = cam - k, tg = t._t ?? (t._t = $('.f-targa', t)), el = t._c ?? (t._c = $('.e-testo', t));
      if (!k) { const o = 1 - ss(clamp(cam / 0.12)); if (o !== t._o) { t._o = o; el.style.opacity = o; el.style.visibility = o > 0.01 ? 'visible' : 'hidden'; } return; }
      const fine = k < N - 1 ? 1 - ss(clamp((uk - 0.26) / 0.07)) : 1, c0 = ss(clamp((uk - 0.05) / 0.09)) * fine, oT = ss(clamp((uk + 0.14) / 0.08)) * (1 - ss(clamp((uk - 0.01) / 0.05)));
      if (c0 !== t._o) { t._o = c0; el.style.opacity = c0; el.style.visibility = c0 > 0.01 ? 'visible' : 'hidden'; $('.e-nomi', t).style.opacity = c0; t.classList.toggle('f-vivo', c0 > 0.5); }
      if (oT !== tg._o) { tg._o = oT; tg.style.opacity = oT; tg.style.visibility = oT > 0.01 ? 'visible' : 'hidden'; }
      if (c0 > 0 && k === i) for (const o of perSala[k]) for (const b of [o.el, o.nome]) { b.style.setProperty('--off', `${(C.a - 1) * (W / 2 + o.x) + C.bx}px`); b.style.setProperty('--offy', `${(C.a - 1) * (BASE - BH * 0.45) + C.by}px`); } }); // i bottoni seguono le bottiglie
    segna(clamp(Math.floor(cam + 0.1) - 1, 0, STOP.length - 1));
    const so = clamp((cam - 0.62) / 0.2); nav.style.opacity = so; nav.style.visibility = so > 0 ? '' : 'hidden';
    inSale(cam > 0.6);
    prepara(i);
    if (!gl) { const qf = QUADRI[i]; if (sporco && qf.ok) { sporco = false; c2.setTransform(dpr, 0, 0, dpr, 0, 0); c2.drawImage(qf.im, R0.tx, R0.ty, R0.w, R0.h); } return; }
    if (m0 && now - ultimo < 30) return;
    if (reduce && !sporco && intro >= 1) return; sporco = false;
    const pass = Math.min(120, now - ultimo); ultimo = now; const t = reduce ? 0 : now / 1000, vaVia = 1 - ss(clamp((e - 0.25) / 0.25));
    gl.viewport(0, 0, cv.width, cv.height);
    const scatola = ({ r, a, bx, by }) => [a * r.tx + bx, a * r.ty + by, a * r.w, a * r.h], B0 = scatola(C), BORDO = 0.08;
    const bottiglie = ({ k, a, bx, by }, vb) => { if (k) dipB(k, ss(clamp((cam - k + 0.14) / 0.26)) * vb, false, ([x, y, w, h]) => [a * x + bx, a * y + by, w * a, h * a]); };
    if (intro < 1) { if (cam > 0.04) intro = 1; else return ingresso(now, () => dipQ(QUADRI[0], B0, true, t, 0)); }
    // gli strati: ciascuno entra quando è grande almeno metà del quadro a riposo, così è già nitido. Si salta quello che è coperto del tutto
    const strati = (PORTE[i].z || []).map((z, j) => ({ tex: QUADRI[i].ponti[j].tex, mtx: QUADRI[i].nero, box: [B0[0] + z[0] * B0[2], B0[1] + z[1] * B0[3], z[2] * B0[2], z[3] * B0[3]], alfa: ss(clamp((z[2] * C.a - 0.45) / 0.3)) })).filter((o) => o.tex && o.alfa > 0);
    const copre = ([x, y, w, h]) => x + BORDO * w <= 0 && y + BORDO * h <= 0 && x + w * (1 - BORDO) >= W && y + h * (1 - BORDO) >= H;
    const da = strati.reduce((d, o, j) => (o.alfa >= 1 && copre(o.box) ? j : d), -1), aD = dentro ? ss(clamp((dentro.a - 0.06) / 0.1)) : 0, bD = 0.06 * (1 - ss(clamp((e - 0.9) / 0.1)));
    if (aD < 1 || bD > 0) { if (da < 0) dipQ(QUADRI[i], B0, false, t, raffica, 1 / C.a); for (const o of strati.slice(Math.max(da, 0))) dipQ(o, o.box, false, t, raffica, 0, o.alfa, BORDO); }
    if (aD > 0) { dipQ(QUADRI[i + 1], scatola(dentro), false, t, raffica, ss(clamp((e - 0.7) / 0.3)), aD, bD); bottiglie(dentro, 1); }
    bottiglie(C, vaVia);
    adatta(pass);
  };

  /* H: la cantina sale sopra l'ultimo schermo della galleria, ma il suo palco resta fermo in cima e si scopre da destra dietro alle pennellate. Quando la sezione arriva in cima è già lì tutta, e da lì si muove da sola */
  const ca = HH && gl && !reduce ? $('#azienda') : null, palco = ca && $('.ca-stage', ca); ca?.classList.add('h-sopra', 'h-passa');
  const scopri = (q) => { const T = Math.max(0, q.bottom - H), n = pas(N - 1), su = T > 0 || (n < 0.995 && q.bottom > 0); if (!su && !ca._su) return; if (su !== ca._su) { ca._su = su; ca.classList.toggle('h-passa', su); sec.toggleAttribute('data-nav-trasparente', su); dispatchEvent(new Event('scroll')); }
    const xf = W * (1 - (n - 0.2) / 0.72); stage.style.translate = su && !T ? `0 ${H - q.bottom}px` : ''; /* la tela resta ferma finché il cammino non la raggiunge: salendo, al cambio col fondo vero si vedrebbe uno scatto */ palco.style.visibility = su && !n ? 'hidden' : ''; palco.style.translate = su && n && T ? `0 ${-T}px` : ''; Object.assign(palco.style, su && n ? { maskImage: 'url(assets/quadri/bordo-v.webp), linear-gradient(#000, #000)', maskSize: '170px auto, 300% 100%', maskRepeat: 'repeat-y, no-repeat', maskPosition: `${xf}px 0, ${xf + 169}px 0` } : { maskImage: '', maskSize: '', maskRepeat: '', maskPosition: '' }); };

  /* H, sotto la galleria: la sezione ferma resta da leggere, poi quella dopo le si dipinge sopra: passate orizzontali che salgono dal basso, con la sua stessa tela. Quando la tela è piena la sezione vera è già in cima, identica: la tela si toglie e non si vede */
  let pittore = null;
  if (ca) {
    for (const c of ['#azienda', '#venduti', '#premi', '#news', '#tavola']) $(c).classList.add('h-coda');
    const barra = $('[data-nav]'), piena = getComputedStyle($('.foot')).backgroundColor.match(/\d+/g).slice(0, 3).map(Number); // il footer non ha tela: il suo colore. Si legge prima che h-sotto gli tolga il fondo
    const tappeS = [['#venduti', 'crema', '.bv__st'], ['#premi', 'crema', '.pv-dg__stage'], ['#news', 'notte', null], ['#tavola', 'crema', '.tv__st'], ['.foot', null, '.foot__in']].map(([c, f, p]) => { const el = $(c); el.classList.add('h-segue', 'h-sotto'); return { el, f, p, su: true }; });
    const pit = document.createElement('canvas'), G = pit.getContext('webgl2', { alpha: true, antialias: false }); /* colore premoltiplicato per forza: con premultipliedAlpha false, sullo schermo vero, il quadro si sommava alla pagina anche dove la tela è trasparente (tutto flashato) e le catture di prova non lo vedono */ pit.className = 'h-pittore'; pit.setAttribute('aria-hidden', 'true'); document.body.append(pit);
    const sh = (t, src) => { const o = G.createShader(t); G.shaderSource(o, src); G.compileShader(o); if (!G.getShaderParameter(o, G.COMPILE_STATUS)) console.error(G.getShaderInfoLog(o)); return o; };
    const P = G.createProgram(); G.attachShader(P, sh(G.VERTEX_SHADER, VS_TUTTO)); G.attachShader(P, sh(G.FRAGMENT_SHADER, `#version 300 es
      precision highp float;${COMUNE}
      uniform sampler2D uTex; uniform vec4 uBox;
      void main() { vec2 f = vP.yx * vec2(.3, .012), d = vec2(nz(f), nz(f + 41.)) - .5; float a = texture(uPen, (vP + d * vec2(90., 34.)) / uRes).a; o = vec4(texture(uTex, (vP - uBox.xy) / uBox.zw).rgb * a, a); }`)); G.linkProgram(P); G.useProgram(P); G.bindVertexArray(G.createVertexArray()); // la maschera letta a fili lunghi, stavolta in orizzontale: il bordo sfilaccia lungo la passata
    const U = (n) => G.getUniformLocation(P, n); G.uniform1i(U('uTex'), 0); G.uniform1i(U('uPen'), 1);
    const tex = (i, im) => { G.activeTexture(G.TEXTURE0 + i); G.bindTexture(G.TEXTURE_2D, G.createTexture()); if (im.width) G.texImage2D(G.TEXTURE_2D, 0, G.RGBA, G.RGBA, G.UNSIGNED_BYTE, im); else G.texImage2D(G.TEXTURE_2D, 0, G.RGBA, 1, 1, 0, G.RGBA, G.UNSIGNED_BYTE, new Uint8Array(im.rgba)); for (const [a, b] of [[G.TEXTURE_MIN_FILTER, G.LINEAR], [G.TEXTURE_MAG_FILTER, G.LINEAR], [G.TEXTURE_WRAP_S, G.CLAMP_TO_EDGE], [G.TEXTURE_WRAP_T, G.CLAMP_TO_EDGE]]) G.texParameteri(G.TEXTURE_2D, a, b); return G.getParameter(G.TEXTURE_BINDING_2D); };
    tex(1, { rgba: [0, 0, 0, 0] });
    tappeS.forEach((q) => { if (!q.f) { q.iw = q.ih = 1; q.t = tex(0, { rgba: [...piena, 255] }); return; } q.t = tex(0, { rgba: [0, 0, 0, 255] }); const im = new Image(); im.src = `assets/quadri/${q.f}${v}.webp`; im.decode().catch(() => {}).then(() => { if (!im.naturalWidth) return; q.iw = im.naturalWidth; q.ih = im.naturalHeight; q.t = tex(0, im); }); });
    let PR = null;
    const righe = () => { const nr = mob() ? 9 : 7, rh = H / nr, lw = rh * 2.1, nS = mob() ? 14 : 20, lista = [], rnd = (a, b) => a + Math.random() * (b - a);
      for (let j = -1; j <= nr; j++) for (let i = 0; i < 3; i++) { const y0 = H - (j + 0.5) * rh + rnd(-0.2, 0.2) * rh, L = W * rnd(0.95, 1.25), x0 = ((i + 0.5) * W) / 3 + rnd(-0.1, 0.1) * W, dir = j % 2 ? 1 : -1, pend = rnd(-0.03, 0.03) * L, bg = rnd(-0.25, 0.25) * rh, ini = ((j + 1) / (nr + 1)) * 0.72 + rnd(0, 0.1);
        for (let k = 0; k < nS; k++) { const o = (k / (nS - 1) - 0.5) * lw; lista.push({ ax: x0 - (dir * L) / 2, ay: y0 - pend + o, cx: x0, cy: y0 + bg + o, bx: x0 + (dir * L) / 2, by: y0 + pend + o, ini: ini + rnd(0, 0.03), dur: rnd(0.11, 0.15) }); } }
      return { lista, w: (lw / nS) * 1.5 }; };
    pittore = () => {
      let k = null, T = 0; for (const q of tappeS) { q.top = q.el.getBoundingClientRect().top; const s = q.top > 1.5; if (s && !k) { k = q; T = q.top; } } // 1,5: con le scale di Windows in fondo alla pagina il footer può fermarsi a una frazione di pixel dalla cima, e deve contare come arrivato
      const n = k ? ss(clamp(1 - T / (0.8 * H))) : 0, on = n > 0, yf = H * (1 - (n - 0.14) / 0.72);
      for (const q of tappeS) { const s = q.top > 1.5, st = q.st ?? (q.st = q.p ? $(q.p, q.el) : $('.pv-ti__st', q.el)); if (st) { const qui = s && q === k && on; st.style.visibility = s && !qui ? 'hidden' : ''; st.style.translate = qui ? `0 ${-q.top}px` : ''; Object.assign(st.style, qui ? { maskImage: 'url(assets/quadri/bordo.webp), linear-gradient(#000, #000)', maskSize: 'auto 170px, 100% 300%', /* a fine passata comincia sopra lo schermo: alta come il palco ne taglierebbe il fondo */ maskRepeat: 'repeat-x, no-repeat', maskPosition: `0 ${yf}px, 0 ${yf + 169}px` } : { maskImage: '', maskSize: '', maskRepeat: '', maskPosition: '' }); } if (s !== q.su) { q.su = s; q.el.classList.toggle('h-sotto', s); } }
      const tono = on && yf + 85 < barra.offsetHeight ? (k.f === 'notte' || (!k.f && 0.2126 * piena[0] + 0.7152 * piena[1] + 0.0722 * piena[2] < 128) ? 'dark' : 'light') : ''; // la pennellata ha passato la barra: l'header prende il tono della sezione dopo, non aspetta che arrivi in cima
      if (tono !== (barra.dataset.forza ?? '')) { if (tono) barra.dataset.forza = tono; else delete barra.dataset.forza; dispatchEvent(new Event('scroll')); }
      pit.classList.toggle('is-su', on); if (!on) return;
      if (PR?.W !== W || PR?.H !== H) { PR = righe(); PR.W = W; PR.H = H; pit.width = Math.round(W); pit.height = Math.round(H); }
      const x = tratti(PR, n), pieno = H * (1 - (n - 0.28) / 0.72); if (pieno < H) x.fillRect(0, Math.max(0, pieno), W, H); // da qui in giù le passate hanno tutte finito: niente buchi
      G.viewport(0, 0, pit.width, pit.height); G.clearColor(0, 0, 0, 0); G.clear(G.COLOR_BUFFER_BIT); G.uniform2f(U('uRes'), W, H);
      const c = Math.max(W / (k.iw || 1), H / (k.ih || 1)), bw = (k.iw || 1) * c, bh = (k.ih || 1) * c; G.uniform4f(U('uBox'), (W - bw) / 2, (H - bh) / 2, bw, bh);
      G.activeTexture(G.TEXTURE1); G.texImage2D(G.TEXTURE_2D, 0, G.RGBA, G.RGBA, G.UNSIGNED_BYTE, ink); G.activeTexture(G.TEXTURE0); G.bindTexture(G.TEXTURE_2D, k.t); G.drawArrays(G.TRIANGLES, 0, 3);
    };
  }

  const stato = (now) => {
    requestAnimationFrame(stato);
    const dt = Math.min(60, now - prima); prima = now;
    if (innerWidth !== misW || alto.offsetHeight !== misH) { misW = innerWidth; misH = alto.offsetHeight; misura(); }
    let q = sec.getBoundingClientRect();
    if (rotella && !IMM && FS.lenis && q.bottom < H && q.bottom >= 0 && cam < FINE - 1) { FS.lenis.scrollTo(scrollY + q.bottom - H, { immediate: true }); q = sec.getBoundingClientRect(); } // in fondo alla storia la pagina aspetta che il cammino finisca. Prima di tutto il resto: fatto dopo, la tela si posava sullo scroll sbagliato e con la rotella veloce tremava di 4-12 px
    if (ca) { scopri(q); pittore(); } if (q.bottom < 0 || q.top > innerHeight || sec.classList.contains('is-zoom')) return;
    (IMM ? giroG : giroF)(now, dt, q);
  };
  misura();
  titoli();
  if (!reduce) gsap.fromTo($$('.e-testo > :not(.e-t)', tappe[0]), { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'expo.out', stagger: 0.08, delay: 0.9 });
  requestAnimationFrame(stato);

  /* ---- i vini di una sala, tre alla volta: il numero scala a ogni clic, in fondo il bottone dice Ricomincia. Le bottiglie nuove si dipingono al posto delle vecchie (H: sono nel quadro, si ridipinge il quadro, vedi ridipingi) ---- */
  const fila = (i) => {
    const t = tappe[i], posti = perSala[i], altri = $('.e-vini__altri', t), conta2 = $('.e-vini__n', t);
    let lista = [], da = 0, turno = 0;
    const mostra = (subito) => {
      const tre = lista.slice(da, da + 3), mio = ++turno, nomi = posti.map((o) => o.nome), visti = da + tre.length, resto = lista.length - visti, davanti = HH && tre.length === 1 ? posti.reduce((a, o) => (o.pos[1] > a.pos[1] ? o : a)) : null; // H: una bottiglia sola sta al posto di quella davanti
      conta2.textContent = lista.length > 3 ? `${visti} di ${lista.length} vini` : lista.length === 1 ? 'Un vino' : `${lista.length} vini`;
      altri.textContent = !resto ? 'Ricomincia' : resto === 1 ? 'Altro 1 vino' : `Altri ${resto} vini`;
      const cambia = () => { if (mio !== turno) return; posti.forEach((o, j) => { const w = davanti ? (o === davanti ? tre[0] : null) : tre[j]; o.el.hidden = o.nome.hidden = !w; if (!w) return; o.w = w; o.el.style.setProperty('--b', Scheda.FONDO[w.bottle] ?? 0.91); $('img', o.el).src = w.bottle; $('button', o.nome).textContent = nome(w); o.el.setAttribute('aria-label', `${w.name}, apri la scheda`); if (!subito) { o.riv = 0; o.rivT = 1; } }); const torna = () => nomi.forEach((el) => el.classList.remove('is-via')); if (HH && !subito) { cur = -1; setTimeout(torna, 900); } else requestAnimationFrame(torna); }; // H: i nomi tornano mentre il pennello passa; cur -1 aggiorna le bottigliette nella pillola
      if (subito) return cambia();
      posti.forEach((o) => { o.rivT = 0; }); nomi.forEach((el) => el.classList.add('is-via'));
      Promise.all([new Promise((ok) => setTimeout(ok, 280)), HH ? leggi(quadroDi(i, da / 3)) : null, ...tre.map(pronta), ...tre.map((w) => { const im = new Image(); im.src = w.bottle; return im.decode().catch(() => {}); })]).then(([, im]) => { if (HH && mio === turno) ridipingi(i, im); cambia(); });
    };
    const dopo = () => (da + 3 >= lista.length ? 0 : da + 3);
    altri.addEventListener('click', () => { if (HH && !QUADRI[i].ok) return; da = dopo(); mostra(); });
    if (HH) altri.addEventListener('pointerenter', () => leggi(quadroDi(i, dopo() / 3))); // col mouse parte prima del clic
    return (l, subito) => { lista = l; da = 0; altri.hidden = l.length <= 3; mostra(subito); };
  };
  VINI.forEach((c, i) => { if (!c) return; const prime = c.vini.map((id) => FS.wine(id)); const lista = [...prime, ...D.wines.filter((w) => w.collection === c.col && !prime.includes(w))]; fila(i)(lista, true); });
  misura(); document.fonts.ready.then(misura); // le misure dipendono dall'altezza dei cartellini: a testi pieni e coi font veri

  const Pm = $('.m-pill'); Pm?.classList.add('in-storia');
  ScrollTrigger.create({ trigger: sec, start: 'top bottom', end: 'bottom 60%', onToggle: (s) => Pm?.classList.toggle('in-storia', s.isActive) });
  FS.quadriPronti = () => QUADRI.every((q) => q.ok);
})();
