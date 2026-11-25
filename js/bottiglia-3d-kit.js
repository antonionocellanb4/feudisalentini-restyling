/* La bottiglia 3D (17 nov 2026), costruita una volta sola qui e usata da bottiglia-3d.html (si gira trascinando, js/bottiglia-3d.js), da bottiglie-3d.html (le altre bottiglie, js/bottiglie-3d.js)
   e dall'apertura di Fotografia (segue lo scorrimento, js/foto-3d.js).
   I pezzi vengono dalla foto del catalogo, che non si tocca (tools/bottiglia_3d.py → assets/3d): il profilo girato attorno all'asse fa vetro e capsula; l'etichetta è la foto srotolata
   e finisce dove finisce in foto ("le etichette finiscono qui, il pezzo in più non serve"), coi disegni in rame che riflettono (maschera). Il castello sulla capsula è il marchio (assets/logo/feudi-marchio.svg).
   Luce ("hdr è una merda": via la stanza finta di three, che dava riflessi a scatole): uno studio nero dipinto qui in HDR, senza file. Due bank verticali morbidi ai lati-dietro fanno le strisce lunghe
   sui fianchi del vetro, come nella foto del catalogo; carta e capsula hanno in più una luce larga davanti, che il vetro non riflette (il fronte del vetro resta nero).
   Rende la bottiglia, alta 1 col fondo a quota 0. Niente ombra a terra (17 nov: "non metterei quell'ombra finta sotto il 3D").
   18 nov, le altre bottiglie ("prendi un bianco, un rosa e un vino speciale"): vetro chiaro col colore del vino letto sulla foto (un velo, vedi sotto), etichette frontali su carta bianca,
   capsula bianca o di stagnola, castello del suo colore, fascetta DOCG. Senza questi dati nel json la bottiglia è come Collezione 53 Primitivo.
   shortcut: oltre il bordo dell'etichetta e sul retro c'è solo vetro, perché c'è una foto sola; con la grafica di stampa dell'etichetta si cambia il file e si vede tutta. */
import * as THREE from 'three';

/* ---- lo studio: una mappa equirettangolare di numeri (1024 x 512), poi sfocata da three per i materiali. Ogni luce è una fascia: az dove sta (0 = dalla parte della macchina, positivo a destra
   di chi guarda), largo e sfuma in gradi, da che elevazione a quale, forza. Su un cilindro una luce all'azimut A si riflette all'angolo A/2. Si dipinge una volta per renderer: con più bottiglie si riusa.
   18 nov ("al minimo peso, senza che si blocchi la pagina"): 512 x 256 invece di 1024 x 512 (la sfocatura per i materiali le rende uguali) e ogni studio si dipinge solo quando serve a una bottiglia ---- */
const studi = new WeakMap(), dipinti = {}; /* dipinti: i numeri di ogni studio, uguali per tutte le tele della pagina (25 nov: ogni tela li ricalcolava, a pagina ferma) */
function luci(renderer) {
  if (studi.has(renderer)) return studi.get(renderer);
  const pm = new THREE.PMREMGenerator(renderer), molle = (x) => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };
  const studio = (nome, luci, fondo) => {
    const W = 512, H = 256, fatto = dipinti[nome], d = fatto || (dipinti[nome] = new Float32Array(W * H * 4));
    for (let j = 0; j < H && !fatto; j++) {
      const el = ((j + 0.5) / H) * 180 - 90; /* la prima riga è sotto i piedi */
      for (let i = 0; i < W; i++) {
        let az = 90 - ((i + 0.5) / W - 0.5) * 360; if (az > 180) az -= 360;
        let v = fondo;
        for (const L of luci) v += L.forza * (1 - molle((Math.abs(((az - L.az + 540) % 360) - 180) - L.largo / 2) / L.sfuma + 0.5)) * molle((el - L.giu) / 14 + 0.5) * (1 - molle((el - L.su) / 14 + 0.5));
        const k = (j * W + i) * 4; d[k] = d[k + 1] = d[k + 2] = v; d[k + 3] = 1;
      }
    }
    const t = new THREE.DataTexture(d, W, H, THREE.RGBAFormat, THREE.FloatType);
    t.mapping = THREE.EquirectangularReflectionMapping; t.needsUpdate = true;
    const env = pm.fromEquirectangular(t).texture; t.dispose(); return env;
  };
  /* il set della foto del catalogo, letto dai suoi riflessi angolo per angolo: sul vetro una fascia chiara e netta da -50° a -28° (un bank grande a sinistra, fra -100° e -56°),
     una fascia grigia da +15° a +45° (un pannello debole a destra), i due bordi accesi oltre i 72° (il fondale bianco dietro). Le forze danno gli stessi grigi della foto */
  const SET = [{ az: -78, largo: 44, sfuma: 4, giu: -35, su: 80, forza: 8 }, { az: 60, largo: 60, sfuma: 8, giu: -35, su: 80, forza: 0.7 }, { az: 180, largo: 76, sfuma: 12, giu: -35, su: 70, forza: 0.8 }];
  const ricette = {
    vetro: () => studio('vetro', SET, 0.01),
    carta: () => studio('carta', [...SET, { az: -15, largo: 170, sfuma: 60, giu: -20, su: 85, forza: 1.2 }, { az: 36, largo: 14, sfuma: 10, giu: -20, su: 70, forza: 2.5 }], 0.02), /* in più, per carta e capsula: la luce larga davanti e una stretta che accende il rame mentre gira */
    bianca: () => studio('bianca', [{ az: -35, largo: 150, sfuma: 80, giu: -30, su: 85, forza: 0.4 }], 0.68) /* la carta bianca (18 nov): col bank del vetro bruciava a sinistra; qui tanta luce diffusa e una larga davanti a sinistra, tarate sulla carta della foto */
  };
  const fatti = {}, L = {};
  for (const k in ricette) Object.defineProperty(L, k, { get: () => (fatti[k] ??= ricette[k]()) });
  studi.set(renderer, L);
  return L;
}

/* vetro chiaro: per ogni distanza dall'asse, vista dalla macchina (-1 bordo sinistro, +1 destro: la luce resta a sinistra come nella foto mentre la bottiglia gira), il colore della foto
   come velo (colore e trasparenza che sul bianco ridanno la foto: tools/bottiglia_3d.py). Sotto il livello il vino, sopra il collo vuoto. Si scrive così com'è, senza luci né tone mapping */
const VELO_V = 'varying vec3 vN; varying float vY; void main() { vN = normalMatrix * normal; vY = position.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
/* la pelle di Blender (18 nov, tools/velo_blender.py): la stessa idea, ma letta da Cycles per ogni altezza (vetro col suo spessore, vino, fondo, capsula); sopra restano etichetta e castello 3D */
const PELLE_F = 'uniform sampler2D pelle; varying vec3 vN; varying float vY; void main() { vec3 n = normalize(vN); float u = n.x / max(length(n.xz), 1e-4); float k = clamp((u + 0.995) / 1.99, 0.0, 1.0) * 255.0; gl_FragColor = texture2D(pelle, vec2((k + 0.5) / 256.0, vY)); }';
const VELO_F = 'uniform sampler2D velo; uniform float livello; varying vec3 vN; varying float vY; void main() { vec3 n = normalize(vN); float u = n.x / max(length(n.xz), 1e-4); float k = clamp((u + 0.985) / 1.97, 0.0, 1.0) * 63.0; gl_FragColor = texture2D(velo, vec2((k + 0.5) / 64.0, vY < livello ? 0.25 : 0.75)); }';

/* l'ombra di una bottiglia appoggiata (18 nov: "le ombre ai vini per far capire che sono appoggiati"). 20 nov: "l'ombra non sotto la bottiglia ma dietro, devo dare il senso
   di essere appoggiate": prima era un'ellisse sotto il piede e la bottiglia sembrava sospesa. Ora è l'ombra portata: la luce viene da davanti a sinistra (come le strisce sul
   vetro) e l'ombra cade sul piano dietro la bottiglia, verso destra, con le spalle e il collo in fondo e sempre più morbida; sotto il piede resta solo il filo scuro dove tocca.
   Si dipinge sul piano visto dall'alto, in diametri di bottiglia attorno al punto d'appoggio (OMBRA: da dove a dove), e si schiaccia (sch) come lo vede la macchina: più di
   quanto direbbe la macchina vera, che è quasi all'altezza del piano e la ridurrebbe a un filo. Le chiare (chiara = true) la fanno più leggera e calda, come la luce passata
   dal vino. posaOmbra() la mette e la scala: chi la usa le dà il punto d'appoggio e il diametro */
const OMBRA = { x0: -0.8, x1: 2.1, z0: -0.7, z1: 1.9, sch: 0.26 };
let ombraTex;
export function ombraContatto(chiara) {
  ombraTex ??= (() => {
    const W = 256, H = 96, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'), im = g.createImageData(W, H);
    const molle = (a, b, v) => { v = Math.min(1, Math.max(0, (v - a) / (b - a))); return v * v * (3 - 2 * v); };
    const FI = (52 * Math.PI) / 180, dx = Math.sin(FI), dz = Math.cos(FI), L = 1.5; /* da che parte cade (gradi da "dritto dietro" verso destra) e quanto è lunga */
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
      const X = OMBRA.x0 + ((i + 0.5) / W) * (OMBRA.x1 - OMBRA.x0), Z = OMBRA.z1 - ((j + 0.5) / H) * (OMBRA.z1 - OMBRA.z0), d = Math.hypot(X, Z);
      const t = (X * dx + Z * dz) / L, lato = Math.abs(X * dz - Z * dx); /* quanto è lontano lungo l'ombra (0 il piede, 1 la punta) e di lato */
      const mezza = 0.5 - 0.33 * molle(0.6, 0.8, t), sfuma = 0.05 + 0.2 * Math.max(0, t); /* il corpo, poi le spalle e il collo; la penombra cresce con la distanza */
      let al = (1 - molle(-sfuma, sfuma, t > 0 ? lato - mezza : d - 0.5)) * (1 - molle(0.75, 1.1, t)) * 0.6 * (1 - 0.5 * Math.max(0, t)) + 0.45 * Math.exp(-((d / 0.45) ** 2));
      al = al * molle(-0.16, 0.02, Z) + 0.5 * Math.exp(-((Z / 0.07) ** 2)) * (1 - molle(0.38, 0.56, Math.abs(X))); /* davanti al piede niente; il filo scuro dove tocca */
      im.data.set([0, 0, 0, Math.round(Math.min(1, al) * 255)], (j * W + i) * 4);
    }
    g.putImageData(im, 0, 0); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  /* stencil: dove c'è la sagoma di un vetro chiaro l'ombra non si disegna (la scrive creaBottiglia, vedi "sagoma") */
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: ombraTex, color: chiara ? 0x6b4a3a : 0x000000, transparent: true, opacity: chiara ? 0.3 : 0.55, depthWrite: false, toneMapped: false, stencilWrite: true, stencilRef: 1, stencilFunc: THREE.NotEqualStencilFunc }));
  m.renderOrder = -2; return m;
}
/* x, y: il punto d'appoggio nella scena (il centro della base, alla quota del piano); dia: il diametro della bottiglia */
export function posaOmbra(ombra, x, y, dia) {
  const { x0, x1, z0, z1, sch } = OMBRA;
  ombra.position.set(x + ((x0 + x1) / 2) * dia, y + ((z0 + z1) / 2) * sch * dia, -0.01); ombra.scale.set((x1 - x0) * dia, (z1 - z0) * sch * dia, 1);
}

/* 25 nov ("per alleggerire il progetto su computer non come il mio, dove lo scroll si blocca"). Misurato col processore quattro volte più lento: i blocchi (60-200 ms) erano
   il primo fotogramma in cui una bottiglia compare, quando la scheda video riceve i suoi programmi e le sue immagini.
   scalda(): glieli manda prima, a pagina ferma (mezzo secondo senza scorrere) e in una pausa del browser, disegnandola in un pixel solo della tela (il giro di disegno al fotogramma dopo ridisegna tutto).
   leggera(): rende una funzione da chiamare a ogni fotogramma, prima di disegnare; se in media vengono più lenti di 26 ms la tela si disegna con meno pixel
   (2 → 1,5 → 1,25 → 1). Sui computer veloci non scatta mai.
   shortcut: non torna su se il computer si libera, e su uno schermo a densità 1 non ha niente da togliere; se serve, il passo dopo è spegnere l'antialias. */
let mosso = 0; addEventListener('scroll', () => (mosso = performance.now()), { passive: true });
const aRiposo = (f) => (performance.now() - mosso < 500 ? setTimeout(() => aRiposo(f), 250) : window.requestIdleCallback ? requestIdleCallback(f, { timeout: 2000 }) : setTimeout(f, 50)); /* Safari non ha requestIdleCallback */
export function scalda(renderer, scena, camera, oggetto, attesa = 0) {
  setTimeout(() => aRiposo(() => {
    const era = oggetto.visible; oggetto.visible = true; oggetto.traverse((o) => (o.frustumCulled = false)); /* anche fuori dall'inquadratura: deve arrivare alla scheda video */
    renderer.setScissor(0, 0, 1, 1); renderer.setScissorTest(true);
    try { renderer.render(scena, camera); } catch (e) {} /* se non riesce si prepara al primo fotogramma, come prima */
    renderer.setScissorTest(false); oggetto.visible = era; oggetto.traverse((o) => (o.frustumCulled = true));
  }), attesa);
}
export function leggera(renderer) {
  let prima = 0, n = 0, somma = 0;
  return (ora) => {
    const dt = ora - prima; prima = ora;
    if (dt <= 0 || dt > 200) return; /* un blocco, o il ritorno sullo schermo, non fanno media */
    somma += dt; if (++n < 50) return;
    const lenta = somma / n > 26, r = renderer.getPixelRatio(); n = somma = 0;
    if (lenta && r > 1) renderer.setPixelRatio(r > 1.5 ? 1.5 : r > 1.25 ? 1.25 : 1);
  };
}

export async function creaBottiglia(renderer, base = 'assets/3d/primitivo53') {
  const dati = await (await fetch(base + '.json')).json();
  const studio = luci(renderer); /* si leggono solo quando servono: studio.vetro (vetro scuro), studio.carta, studio.bianca (carta bianca) */

  /* il profilo: raggio e quota dal fondo alla cima. raggio(y) lo legge a una quota qualsiasi; fascia() ne prende un tratto, un filo più in fuori (per quello che sta sopra il vetro) */
  const P = dati.profilo;
  const raggio = (y) => { for (let i = 1; i < P.length; i++) if (P[i][1] >= y) { const [r0, y0] = P[i - 1], [r1, y1] = P[i]; return y1 === y0 ? r1 : r0 + ((r1 - r0) * (y - y0)) / (y1 - y0); } return 0; };
  const fascia = (ya, yb, n, fuori) => Array.from({ length: n + 1 }, (_, i) => { const y = ya + ((yb - ya) * i) / n; return new THREE.Vector2(raggio(y) + fuori, y); });
  const gira = (punti, mat, da = 0, quanto = Math.PI * 2, spicchi = 96) => new THREE.Mesh(new THREE.LatheGeometry(punti, spicchi, da, quanto), mat);
  const carica = (u) => new THREE.TextureLoader().loadAsync(u);
  const immagine = (u) => new Promise((ok, no) => { const im = new Image(); im.onload = () => ok(im); im.onerror = no; im.src = u; });
  const [colore, orm, marchio, fasc, pelle] = await Promise.all([carica(base + '-etichetta.webp'), carica(base + '-orm.webp'), immagine('assets/logo/feudi-marchio.svg'), dati.fascetta ? carica(base + '-fascetta.webp') : null, dati.velo2d ? carica(base + '-velo.webp') : null]);
  colore.colorSpace = THREE.SRGBColorSpace;
  colore.anisotropy = orm.anisotropy = renderer.capabilities.getMaxAnisotropy(); /* di sbieco, sui fianchi, l'etichetta resta nitida */

  const bott = new THREE.Group(), arco = THREE.MathUtils.degToRad(dati.arco), [e0, e1] = dati.etichetta;
  /* il retro dell'etichetta, visto dal vetro chiaro quando la bottiglia gira: la carta la illumina solo la luce passata dal vino, quindi è tinta del vino (come in Blender, rosa scuro nel rosato) */
  const retro = new THREE.Color(dati.carta ?? '#ffffff'), v = dati.vetro?.velo?.[31];
  if (v) retro.multiply(new THREE.Color().setRGB(...v.slice(0, 3).map((c) => (c / 255) * (v[3] / 255) + 1 - v[3] / 255), THREE.SRGBColorSpace)).multiplyScalar(0.3); /* poca luce: tarato su Blender (retro 199,134,122) */
  /* 20 nov ("check su tutti i 3D e le ombre"): dietro un vetro chiaro l'ombra, la sua o quella della vicina, si vedeva attraverso la bottiglia e sembrava davanti. La sagoma del
     vetro si scrive nello stencil (niente colore né profondità; va coi pezzi opachi, quindi prima delle ombre) e l'ombra lì non si disegna */
  const sagoma = (vetro) => new THREE.Mesh(vetro.geometry, new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false, depthTest: false, stencilWrite: true, stencilRef: 1, stencilZPass: THREE.ReplaceStencilOp }));
  bott.userData.chiara = !!dati.vetro; /* vetro chiaro: chi mette l'ombra la vuole leggera (ombraContatto) */
  if (pelle) { /* vetro, vino e capsula come in Blender; la tabella si legge così com'è, senza mipmap (i bordi sottili del vetro restano netti) */
    pelle.minFilter = THREE.LinearFilter; pelle.generateMipmaps = false;
    const vetro = gira(P.map(([r, y]) => new THREE.Vector2(r, y)), new THREE.ShaderMaterial({ uniforms: { pelle: { value: pelle } }, vertexShader: VELO_V, fragmentShader: PELLE_F, transparent: true, depthWrite: false }), 0, Math.PI * 2, 128);
    vetro.renderOrder = -1; bott.add(vetro, sagoma(vetro));
    bott.userData.vetro = vetro; bott.userData.livello = dati.vetro?.livello ?? 1; /* per chi vuole la rifrazione di quello che c'è dietro (pop-b.html, js/pop-prove.js) */
    bott.add(bott.userData.retro = gira(fascia(e0, e1, 24, 0.0012), new THREE.MeshStandardMaterial({ color: retro, roughness: 1, side: THREE.BackSide, envMap: studio.carta }), -arco / 2, arco)); /* con la lente del vino lo disegna lei (js/lente-vino.js) */
  } else if (dati.vetro) {
    const velo = new THREE.DataTexture(new Uint8Array(dati.vetro.velo.flat()), 64, 2);
    velo.magFilter = velo.minFilter = THREE.LinearFilter; velo.needsUpdate = true;
    const vetro = gira(P.map(([r, y]) => new THREE.Vector2(r, y)), new THREE.ShaderMaterial({ uniforms: { velo: { value: velo }, livello: { value: dati.vetro.livello } }, vertexShader: VELO_V, fragmentShader: VELO_F, transparent: true, depthWrite: false }));
    bott.add(vetro, sagoma(vetro));
    bott.add(gira(fascia(e0, e1, 24, 0.0012), new THREE.MeshStandardMaterial({ color: retro, roughness: 1, side: THREE.BackSide, envMap: studio.carta }), -arco / 2, arco)); /* il retro dell'etichetta, che si vede dal vetro chiaro quando gira */
  } else {
    bott.add(gira(P.map(([r, y]) => new THREE.Vector2(r, y)), new THREE.MeshStandardMaterial({ color: 0x0b0706, roughness: 0.05, envMap: studio.vetro }))); /* vetro scuro pieno di vino: quasi nero, lucido. Senza pelle di Blender di proposito (18 nov: "i riflessi sulle bottiglie nere come il WebGL"): le strisce di questo studio sono quelle della foto */
  }
  /* carta e capsula nere sono opache: specularIntensity basso, se no la luce larga davanti le fa grigie (sul rame, che è metallo, non incide).
     La carta bianca (18 nov) con quella luce e il tone mapping usciva grigia e con gli inchiostri sbiaditi: meno luce e niente tone mapping, così davanti ha i colori della foto */
  const chiara = dati.carta && new THREE.Color(dati.carta).getHSL({}).l > 0.5;
  bott.add(gira(fascia(e0, e1, 24, 0.0012), new THREE.MeshPhysicalMaterial({ map: colore, roughnessMap: orm, metalnessMap: orm, roughness: 1, metalness: 1, specularIntensity: 0.15, envMap: chiara ? studio.bianca : studio.carta, envMapIntensity: 1, toneMapped: !chiara }), -arco / 2, arco)); /* il centro della foto guarda avanti */
  if (!pelle || dati.capsulaMetallo) { /* con la pelle la capsula è già lì; la stagnola no: nelle riprese di Blender esce grigia e piatta (Terra Rosato, 19 nov), si mette questa sopra */
    const capsula = dati.capsulaMetallo
      ? new THREE.MeshStandardMaterial({ color: 0xc9c9c4, metalness: 1, roughness: 0.32, envMap: studio.carta }) /* stagnola */
      : new THREE.MeshPhysicalMaterial({ color: dati.capsulaColore ? new THREE.Color(dati.capsulaColore).multiplyScalar(0.6) : 0x0e0e0e, roughness: 0.6, specularIntensity: 0.5, envMap: studio.carta }); /* il colore letto in foto è già illuminato: con la luce dello studio sopra il nero usciva grigio (#262626 → #313131, in foto #232323); 0.6 lo riporta lì. Tarato sulle capsule scure, le sole rimaste su questa strada */
    bott.add(gira([...fascia(dati.capsula, P.at(-2)[1], 40, 0.001), new THREE.Vector2(0, 1.0005)], capsula));
  }
  if (dati.castello) { /* dove sta in foto; l'angolo che occupa viene dalle proporzioni del marchio. La lamina è l'oro del marchio, l'inchiostro prende il colore della foto (Marpiccolo azzurro) */
    const { quota, alto, colore: tinta, metallo = true } = dati.castello, tc = document.createElement('canvas'), g = tc.getContext('2d'); tc.width = 240; tc.height = 357; g.drawImage(marchio, 0, 0, 240, 357);
    if (!metallo) { g.globalCompositeOperation = 'source-in'; g.fillStyle = tinta; g.fillRect(0, 0, 240, 357); }
    const oro = new THREE.CanvasTexture(tc), ac = (alto * 60.05) / 89.35 / raggio(quota); oro.colorSpace = THREE.SRGBColorSpace;
    bott.add(gira(fascia(quota - alto / 2, quota + alto / 2, 2, 0.0016), new THREE.MeshStandardMaterial({ map: oro, transparent: true, roughness: metallo ? 0.35 : 0.8, metalness: metallo ? 1 : 0, envMap: studio.carta }), -ac / 2, ac, 8));
  }
  if (fasc) { /* la fascetta di stato sul collo (Philia, DOCG): carta tutta attorno, la foto davanti */
    fasc.colorSpace = THREE.SRGBColorSpace;
    bott.add(gira(fascia(dati.fascetta[0], dati.fascetta[1], 6, 0.0024), new THREE.MeshStandardMaterial({ map: fasc, roughness: 0.75, envMap: studio.carta }), -Math.PI, Math.PI * 2));
  }
  bott.userData.luce = studio.carta; /* lo stesso studio per altri oggetti della scena (il grappolo dell'apertura di Fotografia) */
  bott.userData.collo = raggio(0.97); /* il collo sotto il tappo è largo uguale in tutte le bottiglie: dà le altezze vere quando stanno insieme */
  return bott;
}
