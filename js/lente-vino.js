/* La lente del vino (18 nov 2026: "qui ci sono i liquidi dentro, tu che sei esperto in 3D dovresti sapere cosa succede", poi "ricordati che qui dentro c'è liquido").
   Nelle bottiglie chiare la scritta che sta dietro si vede attraverso il vino ingrandita e rovesciata da destra a sinistra, piegata verso i bordi, come attraverso una bottiglia vera.
   Le scritte della pagina si disegnano anche in texture col loro carattere (scritta); il vetro (lente) segue il raggio di ogni suo punto nel cilindro di vino (entra, si piega, esce:
   indice 1,34, il muro con la scritta a tre raggi dietro l'asse) e va a leggere la scritta dove arriva; sopra il livello del vino il vetro vuoto non piega. Il colore e la luce del vetro
   restano quelli di Blender (la pelle, js/bottiglia-3d-kit.js): sopra il fondo della pagina (fondoA in alto, fondoB in basso) e la scritta col suo colore (inchiostro).
   Quando la bottiglia gira e l'etichetta va dietro ("la parte dell'etichetta vista da dietro sparisce"): il raggio che esce dal vino dove c'è l'etichetta trova la sua carta. Si vede
   ingrandita ma dritta, perché sta più vicina del fuoco (la scritta sul muro è oltre, per questo si rovescia), e col colore del retro del kit.
   La usano l'apertura (js/pop-prove.js) e le collezioni (js/pop-collezioni.js); chi la usa aggiorna a ogni fotogramma scala, tela, dpr e rettangoli delle scritte (pixel CSS);
   l'asse lo trova il vertex shader da solo, anche con la bottiglia inclinata (asseX resta fra le uniform ma non serve più). */
import * as THREE from 'three';

const ALLARGA = { '75%': 'condensed', '87.5%': 'semi-condensed', '100%': 'normal' };

/* un testo della pagina disegnato in una texture col suo carattere, grande come il suo riquadro; disegna() di nuovo quando cambia misura */
export function scritta(el, renderer) {
  const c = document.createElement('canvas'), t = new THREE.CanvasTexture(c);
  t.minFilter = THREE.LinearFilter; t.generateMipmaps = false;
  const disegna = () => {
    const cs = getComputedStyle(el), q = el.getBoundingClientRect(), dpr = renderer.getPixelRatio();
    c.width = Math.max(2, Math.ceil(q.width * dpr)); c.height = Math.max(2, Math.ceil(q.height * dpr));
    const g = c.getContext('2d'); g.scale(dpr, dpr);
    g.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`; g.fontStretch = ALLARGA[cs.fontStretch] || 'normal'; g.letterSpacing = cs.letterSpacing;
    const testo = el.getAttribute('aria-label') || el.textContent.trim(), m = g.measureText(testo), lh = parseFloat(cs.lineHeight) || q.height;
    g.scale(q.width / Math.max(1, m.width), 1);
    g.fillStyle = '#000'; g.fillText(testo, 0, (lh - (m.fontBoundingBoxAscent + m.fontBoundingBoxDescent)) / 2 + m.fontBoundingBoxAscent);
    t.needsUpdate = true;
  };
  return { t, disegna };
}

/* un colore CSS ("rgb(20, 16, 13)" o "255 106 61") in tre numeri fra 0 e 1, così come li scrive la pagina */
export const colore = (s, prima = [255, 255, 255]) => { const [r, g, b] = (String(s).match(/[\d.]+/g) || prima).map((x) => x / 255); return new THREE.Vector3(r, g, b); };

/* vAsse: dove cade sullo schermo l'asse della bottiglia alla quota di quel punto (pixel CSS); così regge anche la bottiglia inclinata (pop-b, apertura "in volo") */
const VS = `uniform float scala, dpr; uniform vec2 tela; varying vec3 vN; varying vec2 vP; varying float vY; varying float vR; varying float vAsse;
  void main() { vN = normalMatrix * normal; vP = position.xz; vY = position.y; vR = length(position.xz) * scala;
    vec4 a = projectionMatrix * modelViewMatrix * vec4(0.0, position.y, 0.0, 1.0); vAsse = (a.x / a.w * 0.5 + 0.5) * tela.x / dpr;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const FS = `uniform sampler2D pelle, riga0, riga1; uniform vec4 rett0, rett1, etichetta; uniform vec2 tela; uniform vec3 inchiostro, fondoA, fondoB, carta; uniform float dpr, livello, acceso, taglio;
  varying vec3 vN; varying vec2 vP; varying float vY; varying float vR; varying float vAsse;
  float lente(vec2 E, out vec2 X) { /* dove arriva sul muro, in raggi dall'asse, il raggio che entra nel vino in E (cerchio di raggio 1, la macchina guarda verso +y); X è dove esce dal vino */
    vec2 d1 = refract(vec2(0.0, 1.0), E, 1.0 / 1.34);
    X = E - 2.0 * dot(E, d1) * d1;
    vec2 d2 = refract(d1, -X, 1.34);
    if (dot(d2, d2) < 0.5) return E.x;
    return X.x + (3.0 - X.y) * d2.x / max(d2.y, 0.05);
  }
  float leggi(sampler2D t, vec4 r, vec2 q) { if (r.z < 1.0) return 0.0; vec2 uv = (q - r.xy) / r.zw; if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) return 0.0; return texture2D(t, vec2(uv.x, 1.0 - uv.y)).a; }
  void main() {
    vec3 n = normalize(vN); float u = n.x / max(length(n.xz), 1e-4);
    float k = clamp((u + 0.995) / 1.99, 0.0, 1.0) * 255.0; vec4 p = texture2D(pelle, vec2((k + 0.5) / 256.0, vY));
    float b = clamp(u, -0.995, 0.995); vec2 E = vec2(b, -sqrt(1.0 - b * b)), X = vec2(b, -E.y); /* sopra il vino il raggio va dritto */
    float xb = vY < livello ? lente(E, X) : u;
    vec2 q = vec2(vAsse + xb * vR, (tela.y - gl_FragCoord.y) / dpr);
    float a = max(leggi(riga0, rett0, q), leggi(riga1, rett1, q)) * acceso * step(q.x, taglio); /* taglio: la scritta c'è solo a sinistra di questa colonna (pop-vino.html, dove la bottiglia la stampa passando) */
    vec3 fondo = mix(fondoA, fondoB, clamp(q.y * dpr / tela.y, 0.0, 1.0));
    /* il retro dell'etichetta: l'angolo di X sulla bottiglia è quello del punto davanti più quanto gira il raggio dentro; etichetta = centro, mezza larghezza, quota sotto e sopra */
    float fi = atan(vP.x, vP.y) + atan(X.y, X.x) - atan(E.y, E.x) - etichetta.x;
    float su = (1.0 - smoothstep(etichetta.y - 0.02, etichetta.y + 0.02, abs(mod(fi + 3.14159265, 6.2831853) - 3.14159265))) * smoothstep(etichetta.z - 0.002, etichetta.z + 0.002, vY) * (1.0 - smoothstep(etichetta.w - 0.002, etichetta.w + 0.002, vY));
    vec3 cv = carta; /* la carta come la renderebbe three: tone mapping e sRGB, come il resto della pagina */
    #ifdef TONE_MAPPING
    cv = toneMapping(cv);
    #endif
    cv = linearToOutputTexel(vec4(cv, 1.0)).rgb;
    /* la pelle di Blender è fatta sul fondo bianco: su un fondo scuro con la scritta chiara (Botanica, crema sul colore della sala) il suo velo schiariva tutto e la scritta
       dietro non si vedeva più ("in botanico i testi dietro non si vede"). Quando la scritta è più chiara del fondo torna sopra il velo per tre quarti; nel Pop (scuro su chiaro) niente */
    float forza = 0.75 * step(dot(fondo, vec3(0.2126, 0.7152, 0.0722)) + 0.3, dot(inchiostro, vec3(0.2126, 0.7152, 0.0722)));
    vec3 col = p.rgb * p.a + (1.0 - p.a) * mix(mix(fondo, inchiostro, a), cv, su);
    gl_FragColor = vec4(mix(col, inchiostro, a * forza * (1.0 - su)), 1.0);
  }`;

/* mette la lente al posto della pelle di una bottiglia chiara (null se la bottiglia è scura); rende le uniform da aggiornare */
export function lenteVino(bott) {
  const v = bott.userData.vetro; if (!v) return null;
  const r = bott.userData.retro, g = r?.geometry.parameters; if (r) r.visible = false; /* il retro dell'etichetta lo disegna la lente, rifratto */
  const u = {
    /* 1,56: la luce che la carta del retro prende nello studio, misurata sul kit (con questa esce uguale: Tre Cuori 183,150,144, Marpiccolo 187,185,164) */
    carta: { value: r ? r.material.color.clone().multiplyScalar(1.56) : new THREE.Color() },
    etichetta: { value: g ? new THREE.Vector4(g.phiStart + g.phiLength / 2, g.phiLength / 2, g.points[0].y, g.points.at(-1).y) : new THREE.Vector4(0, -1, 2, 2) },
    pelle: v.material.uniforms.pelle, riga0: { value: null }, riga1: { value: null }, rett0: { value: new THREE.Vector4() }, rett1: { value: new THREE.Vector4() },
    tela: { value: new THREE.Vector2(1, 1) }, inchiostro: { value: new THREE.Vector3() }, fondoA: { value: new THREE.Vector3(1, 1, 1) }, fondoB: { value: new THREE.Vector3(1, 1, 1) },
    dpr: { value: 1 }, asseX: { value: 0 }, livello: { value: bott.userData.livello }, acceso: { value: 1 }, taglio: { value: 1e6 }, scala: { value: 1 }
  };
  v.material = new THREE.ShaderMaterial({ uniforms: u, vertexShader: VS, fragmentShader: FS, transparent: true, depthWrite: false });
  return u;
}
