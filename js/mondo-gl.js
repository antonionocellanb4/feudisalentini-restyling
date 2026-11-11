/* Il mondo inciso dell'apertura di azienda-e in WebGL2, senza librerie (11 nov 2026: "la parte immersiva della hero farla meglio, con una tecnologia leggera").
   Gli stessi pezzi di assets/incisioni/mondo.svg, ma in uno spazio 3D vero: ogni tratto è un rettangolo sottile che resta largo gli stessi pixel a ogni distanza
   (come vector-effect: non-scaling-stroke), i fondi pieni scrivono la profondità e coprono ciò che sta dietro. Terra, viale, solchi e ombre li disegna lo shader del suolo.
   I disegni sono piatti ma stanno nello spazio: di fronte (alberi, casale) o girati di 90° (i muretti che corrono lungo il viale). Il dettaglio fine si vede solo da vicino.
   Tutto il mondo sta in due buffer fatti una volta: per fotogramma cambiano solo le uniform (camera, vento, fronte dell'incisione).
   window.MondoGL(tela, opzioni) → { disegna, misura, vivo } oppure null se WebGL2 non c'è (js/azienda-e.js allora tiene l'svg). */
window.MondoGL = (tela, o) => {
  const gl = tela.getContext('webgl2', { alpha: false, antialias: true });
  if (!gl) return null;
  const { defs, cose, strati, mobili = [], UM, CAM, ottica, OCCHIO, FRONTE, fermo } = o;
  const hex = (h) => [1, 3, 5].map((i) => parseInt((/^#[0-9a-f]{6}$/i.test(h) ? h : '#f3efea').slice(i, i + 2), 16) / 255);
  const CIELO = hex(o.cielo), SUOLO = hex(o.suolo), PAL = [], colore = (h) => { let i = PAL.indexOf(h); if (i < 0) i = PAL.push(h) - 1; return i; };

  /* ---- i pezzi: dai path dell'svg (solo M, L, Z) a spezzate e poligoni, con la base in y = 0 e y verso l'alto ---- */
  const orecchie = (q) => { // triangola un poligono semplice (ear clipping): bastano poche decine di punti
    const p = q.filter((a, i) => { const b = q[(i + 1) % q.length]; return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) > 1e-6; }), V = p.map((_, i) => i), out = [];
    let area = 0; p.forEach((a, i) => { const b = p[(i + 1) % p.length]; area += a[0] * b[1] - b[0] * a[1]; });
    const s = Math.sign(area) || 1, giro = (a, b, c) => ((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])) * s;
    for (let guardia = p.length * p.length; V.length > 3 && guardia > 0; guardia--) {
      let i = V.findIndex((_, k) => {
        const a = p[V[(k + V.length - 1) % V.length]], b = p[V[k]], c = p[V[(k + 1) % V.length]], g = giro(a, b, c);
        if (Math.abs(g) < 1e-9) return true; // tre punti in fila: il vertice si toglie e basta
        return g > 0 && !V.some((j) => { const d = p[j]; return d !== a && d !== b && d !== c && giro(a, b, d) >= 0 && giro(b, c, d) >= 0 && giro(c, a, d) >= 0; });
      });
      if (i < 0) i = 0; // poligono intrecciato: si va avanti lo stesso, il fondo è del colore della carta
      const a = p[V[(i + V.length - 1) % V.length]], b = p[V[i]], c = p[V[(i + 1) % V.length]];
      if (Math.abs(giro(a, b, c)) >= 1e-9) out.push(a, b, c);
      V.splice(i, 1);
    }
    if (V.length === 3) out.push(p[V[0]], p[V[1]], p[V[2]]);
    return out;
  };
  const PEZZI = {}, pezzo = (id) => (PEZZI[id] ??= (() => {
    const g = defs.querySelector(`#${id}`), dy = +(g.getAttribute('transform')?.match(/translate\(0 (-?[\d.]+)\)/)?.[1] ?? 0), seg = [], tri = [];
    let el = 0; // ogni fondo pieno apre un elemento nuovo, che copre i tratti di quelli prima: l'ordine di pittura dell'svg qui diventa profondità
    for (const p of g.children) {
      const pieno = p.classList.contains('o'), c = pieno ? 0 : colore(p.classList.contains('v') ? o.vino : p.getAttribute('stroke')), w = +p.getAttribute('stroke-width') || 1;
      if (pieno) el++;
      for (const s of p.getAttribute('d').split('M')) {
        if (!s) continue;
        const pts = s.replace('Z', '').split('L').map((q) => { const [x, y] = q.trim().split(' '); return [+x, -(+y + dy)]; });
        if (pieno) for (const t of orecchie(pts)) tri.push([t[0], t[1], el]);
        else { if (s.includes('Z')) pts.push(pts[0]); for (let i = 1; i < pts.length; i++) seg.push([...pts[i - 1], ...pts[i], w, c, el]); }
      }
    }
    return { seg, tri };
  })());
  // un elenco di cose → i due buffer: tratti [x0 y0 z0 larghezza | x1 y1 z1 colore+ordine | fase del vento, distanza del dettaglio] e fondi [x y z fase].
  // Ogni cosa è un disegno piatto: di fronte (ang 0) o girato attorno alla verticale (ang ±90°: un muro che corre lungo il viale). Dentro il pezzo ogni elemento
  // sta 3 cm più avanti di quello prima e il suo fondo a metà strada: copre gli elementi dietro, mai i suoi tratti.
  // Il dettaglio: i tratti sotto 0,75 px si vedono solo da vicino, quelli sotto 0,95 fino a media distanza, gli altri sempre; la distanza cresce con la misura della cosa (lod)
  const PASSO = 0.03;
  const monta = (lista) => {
    const T = [], P = [];
    for (const c of lista) {
      const { seg, tri } = pezzo(c.id), k = (c.k ?? 1) * (c.um ?? UM), kx = c.sp ? -k : k, ca = Math.cos(c.ang || 0), sa = Math.sin(c.ang || 0), lod = c.um ? 0 : c.lod ?? c.k ?? 1;
      const fase = /cip|oliv/.test(c.id) ? 0.1 + Math.random() * 6 : /alb|papav/.test(c.id) ? 8.1 + Math.random() * 6 : -1; // da 8 in su: piante basse, che fremono di più
      const X = (u, e) => c.x + u * kx * ca + sa * e, Z = (u, e) => c.z + u * kx * sa - ca * e;
      seg.forEach(([x0, y0, x1, y1, w, col, n], i) => { const e = n * PASSO; T.push(X(x0, e), y0 * k, Z(x0, e), w, X(x1, e), y1 * k, Z(x1, e), col + (i / seg.length) * 0.999, fase, w === 1.05 ? -250 * lod : lod * (w < 0.75 ? 110 : w < 0.95 ? 250 : 0)); }); // larghezza 1,05 = contorno che si vede solo da lontano (distanza negativa)
      for (const [x, y, n] of tri) { const e = (n - 0.5) * PASSO; P.push(X(x, e), y * k, Z(x, e), fase); }
    }
    return { T: new Float32Array(T), P: new Float32Array(P) };
  };

  /* ---- shader ---- */
  const prog = (vs, fs) => {
    const p = gl.createProgram();
    for (const [t, s] of [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]]) { const sh = gl.createShader(t); gl.shaderSource(sh, `#version 300 es\nprecision highp float;\n${s}`); gl.compileShader(sh); if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh)); gl.attachShader(p, sh); }
    gl.linkProgram(p);
    const u = {}; for (let i = 0; i < gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS); i++) { const n = gl.getActiveUniform(p, i).name.replace('[0]', ''); u[n] = gl.getUniformLocation(p, n); }
    return { p, u };
  };
  // il vento piega le chiome: niente alla base, di più in cima (y in metri), ogni pianta con la sua fase
  const GL_VENTO = 'uniform float u_t; float vento(float y, float f) { if (f < 0.) return 0.; float n = step(8., f), p = f - 8. * n; return mix(.0011, .018, n) * y * y * (sin(u_t * (1.2 + n) + p + y * .25) + .5 * sin(u_t * (2.3 + n * 1.4) + p * 1.7)); }';
  let pT, pP, pS;
  try {
    pT = prog(`${GL_VENTO}
      layout(location=0) in vec4 a_a; layout(location=1) in vec4 a_b; layout(location=2) in vec2 a_c;
      uniform mat4 u_m; uniform vec3 u_tr; uniform vec2 u_res; uniform vec4 u_k, u_g; uniform vec3 u_pal[8];
      out vec4 v_c; out vec2 v_d;
      void main() {
        float lato = float(gl_VertexID >> 1) * 2. - 1., capo = float(gl_VertexID & 1), ci = floor(a_b.w);
        vec3 A = vec3(a_a.x * u_tr.x, a_a.y * u_tr.x + u_tr.y, a_a.z + u_tr.z), B = vec3(a_b.x * u_tr.x, a_b.y * u_tr.x + u_tr.y, a_b.z + u_tr.z);
        // un pezzo che si muove (un battente, gli uccelli): u_g lo sposta in x e z e lo gira attorno alla verticale; per il mondo fermo vale 0, 0, 1, 0
        A.xz = u_g.xy + vec2(A.x * u_g.z + A.z * u_g.w, A.z * u_g.z - A.x * u_g.w); B.xz = u_g.xy + vec2(B.x * u_g.z + B.z * u_g.w, B.z * u_g.z - B.x * u_g.w);
        float zf = A.z; A.x += vento(A.y, a_c.x); B.x += vento(B.y, a_c.x);
        vec4 a = u_m * vec4(A, 1.), b = u_m * vec4(B, 1.);
        float dz = mix(a.w, b.w, capo);
        // l'incisione: il fronte avanza dal vicino al lontano e ogni pezzo si traccia tratto dopo tratto (ordine = parte decimale di a_b.w)
        float alfa = u_k.z * clamp(((u_k.y + 8. - zf) / 22. - (a_b.w - ci)) * 6., 0., 1.);
        if (a_c.y > 0. && u_k.w > .5) alfa *= clamp((a_c.y - dz) / (.35 * a_c.y), 0., 1.); // il dettaglio fine si vede solo da vicino
        if (a_c.y < 0. && u_k.w > .5) alfa *= clamp((dz + a_c.y * .6) / (-a_c.y * .4), 0., 1.); // e il contorno semplice solo da lontano, quando il dettaglio se n'è andato
        if (min(a.w, b.w) < .6 || alfa <= 0.) { gl_Position = vec4(2., 2., 2., 1.); return; }
        float w = a_a.w * u_k.x * (1. + u_k.w * .5 * clamp(1. - dz / 18., 0., 1.)); // da vicino il tratto è un po' più deciso
        vec2 sa = a.xy / a.w * u_res, sb = b.xy / b.w * u_res, d = sb - sa; float l = length(d); d = l > 1e-4 ? d / l : vec2(1., 0.);
        float hw = w * .5 + 1.;
        vec2 s = mix(sa, sb, capo) + d * (capo * 2. - 1.) * w * .5 + vec2(-d.y, d.x) * lato * hw;
        vec4 c = mix(a, b, capo);
        gl_Position = vec4(s / u_res * c.w, c.z, c.w);
        v_c = vec4(u_pal[int(ci)], alfa * mix(1., .32 + .68 * clamp(1.25 - dz / 120., 0., 1.), u_k.w)); // la foschia: più lontano, più chiaro
        v_d = vec2(lato * hw, w * .5);
      }`, 'in vec4 v_c; in vec2 v_d; out vec4 o; void main() { o = vec4(v_c.rgb, v_c.a * clamp(v_d.y + .5 - abs(v_d.x), 0., min(1., v_d.y * 2.))); }');
    pP = prog(`${GL_VENTO}
      layout(location=0) in vec4 a_v; uniform mat4 u_m; uniform float u_fronte;
      void main() { vec3 p = a_v.xyz; p.x += vento(p.y, a_v.w); gl_Position = a_v.z > u_fronte + 8. ? vec4(2., 2., 2., 1.) : u_m * vec4(p, 1.); }`,
    'uniform vec3 u_cielo; out vec4 o; void main() { o = vec4(u_cielo, 1.); }');
    // il suolo: per ogni pixel sotto l'orizzonte si trova il punto di terra che si sta guardando; lì il viale più chiaro, i suoi bordi, i solchi ogni 4 metri
    pS = prog('out vec2 v_n; void main() { v_n = vec2(gl_VertexID == 1 ? 3. : -1., gl_VertexID == 2 ? 3. : -1.); gl_Position = vec4(v_n, 0., 1.); }', `
      in vec2 v_n; out vec4 o;
      uniform mat3 u_r; uniform vec3 u_cam, u_o, u_cielo, u_suolo, u_ink, u_alte; uniform vec4 u_k, u_om;
      // l'ombra di una fila di cipressi (base in x = bx, il primo in z0, uno ogni u_om.z metri): la luce viene da sinistra, l'ombra va a destra e un po' in avanti
      float ombra(vec2 p, float bx, float z0, float giro) {
        const vec2 D = vec2(.94, .34);
        float zs = p.y - (p.x - bx) * D.y / D.x, n = clamp(floor((zs - z0) / u_om.z + .5), 0., u_om.w - 1.); // l'asse d'ombra più vicino
        float t = (p.x - bx) / D.x / (u_alte[int(mod(n + giro, 3.))] * .7), larga = (.12 + .85 * sin(3.1416 * pow(clamp(t, 0., 1.), .65))) * (1. - smoothstep(.9, 1., t));
        return step(0., t) * step(t, 1.) * clamp((larga - abs(zs - z0 - n * u_om.z) * D.x) / max(fwidth(zs), 1e-4) + .5, 0., 1.);
      }
      void main() {
        vec3 r = u_r * vec3(v_n.x * u_o.x, (v_n.y - u_o.z) * u_o.y, 1.);
        float g = clamp(.5 - r.y / fwidth(r.y), 0., 1.), t = u_cam.y / max(-r.y, 1e-5);
        vec2 p = u_cam.xz + r.xz * t; float dz = p.y - u_cam.z, fx = abs(dFdx(p.x)), fz = abs(dFdy(p.y)), lw = .4 * u_k.x + .5, fronte = clamp((u_k.y - p.y) / 10., 0., 1.);
        vec3 c = mix(mix(u_cielo, u_suolo, u_k.z), u_cielo, clamp((2.4 - abs(p.x)) / fx + .5, 0., 1.));
        // le ombre: tratteggio verso il punto di fuga, sempre fra 6 e 12 pixel di passo. Il passo raddoppia con la distanza e una linea su due sfuma prima del salto
        float gx = max(length(vec2(dFdx(p.x), dFdy(p.x))), 1e-5), s = .05 * exp2(ceil(log2(gx * 6. / .05))), q = p.x / s, i = floor(q + .5);
        float om = max(ombra(p, -u_om.x, u_om.y, 0.), ombra(p, u_om.x, u_om.y + u_om.z * .5, 1.)) * fronte * clamp(1.3 - dz / 90., 0., 1.) * clamp((dz - 1.5) / 2.5, 0., 1.); // sotto i piedi l'ombra si scioglie
        om *= .04 + .5 * clamp(lw - abs(q - i) * s / gx, 0., 1.) * (mod(i, 2.) < .5 ? 1. : clamp(s / gx / 6. - 1., 0., 1.));
        float bordi = clamp(lw - abs(abs(p.x) - 2.4) / fx * .57, 0., 1.) * .7 * u_k.z;
        float solchi = clamp(lw - abs(mod(p.y - 1., 4.) - 2.) / fz, 0., 1.) * clamp(1.15 - dz / 80., 0., 1.) * .45 * fronte;
        o = vec4(mix(u_cielo, mix(c, u_ink, max(om, max(bordi, solchi)) * u_k.w), g), 1.);
      }`);
  } catch (e) { console.warn('MondoGL', e); return null; }

  const vao = (dati, attr, passo) => { // attributi in fila nello stesso buffer; passo = 1: uno per tratto (instancing)
    const v = gl.createVertexArray(), n = attr.reduce((a, b) => a + b, 0); gl.bindVertexArray(v); gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, dati, gl.STATIC_DRAW);
    let da = 0; attr.forEach((k, i) => { gl.enableVertexAttribArray(i); gl.vertexAttribPointer(i, k, gl.FLOAT, false, n * 4, da * 4); gl.vertexAttribDivisor(i, passo); da += k; });
    return { v, n: dati.length / n };
  };
  const mondo = monta(cose), vT = vao(mondo.T, [4, 4, 2], 1), vP = vao(mondo.P, [4], 0);
  const cieli = strati.map((s) => ({ ...s, ...vao(monta([{ id: s.id, x: 0, z: 0, um: 1 }]).T, [4, 4, 2], 1) })); // nuvole, colli, uccelli: lontani, senza profondità
  const mossi = mobili.map((m) => ({ ...m, ...vao(monta([{ id: m.id, x: 0, z: 0, sp: m.sp }]).T, [4, 4, 2], 1) })); // i battenti: stanno nel mondo, girano sul cardine
  const vuoto = gl.createVertexArray(), pal = new Float32Array(24); PAL.forEach((h, i) => pal.set(hex(h), i * 3));
  gl.depthFunc(gl.LEQUAL); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.clearColor(...CIELO, 1);

  /* ---- la camera: cammina lungo il viale (CAM.z) e segue appena il puntatore, di lato e con lo sguardo ---- */
  let ot, dpr = 1; const occhio = { x: 0, y: 0, vx: 0, vy: 0 }, M = new Float32Array(16), R = new Float32Array(9);
  const misura = () => { ot = ottica(); dpr = Math.min(devicePixelRatio || 1, 2); const w = Math.round(ot.W * dpr), h = Math.round(ot.H * dpr); if (tela.width !== w || tela.height !== h) { tela.width = w; tela.height = h; } gl.viewport(0, 0, w, h); cieli.forEach((s) => (s.tr = s.posa(ot))); };
  const tratti = (v, tr, k, g = [0, 0, 1, 0]) => { gl.uniform3f(pT.u.u_tr, ...tr); gl.uniform4f(pT.u.u_k, ...k); gl.uniform4f(pT.u.u_g, ...g); gl.bindVertexArray(v.v); gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, v.n); };
  const disegna = () => {
    const { W, H, F } = ot, oriz = ot.o0 + (ot.o1 - ot.o0) * CAM.su, fx = (2 * F) / W, fy = (2 * F) / H, oy = 1 - (2 * oriz) / H, N = 0.5, L = 2500, A = (L + N) / (L - N), B = (-2 * L * N) / (L - N);
    const su = occhio.y * CAM.su; // finché c'è il testo d'apertura lo sguardo non si alza né si abbassa: i colli gli passerebbero sotto
    const calma = 1 - (CAM.calma || 0); // sulla soglia lo sguardo di lato si ferma: il testo sta fra i battenti
    const cx = occhio.x * 0.5 * calma, cy = OCCHIO - su * 0.08, cz = CAM.z, ps = occhio.x * 0.035 * (0.5 + 0.5 * calma), th = -su * 0.015, cp = Math.cos(ps), sp = Math.sin(ps), ct = Math.cos(th), st = Math.sin(th);
    const rx = [cp, 0, -sp], ry = [-st * sp, ct, -st * cp], rz = [ct * sp, st, ct * cp], C = [cx, cy, cz], meno = (r) => -(r[0] * C[0] + r[1] * C[1] + r[2] * C[2]);
    for (let i = 0; i < 3; i++) { M[i * 4] = fx * rx[i]; M[i * 4 + 1] = fy * ry[i] + oy * rz[i]; M[i * 4 + 2] = A * rz[i]; M[i * 4 + 3] = rz[i]; R[i] = rx[i]; R[3 + i] = ry[i]; R[6 + i] = rz[i]; }
    M[12] = fx * meno(rx); M[13] = fy * meno(ry) + oy * meno(rz); M[14] = A * meno(rz) + B; M[15] = meno(rz);
    const t = fermo ? 0 : performance.now() / 1000, fronte = CAM.neb * FRONTE;
    gl.depthMask(true); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // la maschera va riaperta prima: con la scrittura chiusa clear() non azzera la profondità e il fotogramma di prima copre questo
    gl.disable(gl.DEPTH_TEST); gl.depthMask(false); gl.disable(gl.BLEND);
    gl.useProgram(pS.p); gl.bindVertexArray(vuoto);
    gl.uniformMatrix3fv(pS.u.u_r, false, R); gl.uniform3f(pS.u.u_cam, ...C); gl.uniform3f(pS.u.u_o, 1 / fx, 1 / fy, oy); gl.uniform3f(pS.u.u_cielo, ...CIELO); gl.uniform3f(pS.u.u_suolo, ...SUOLO); gl.uniform3f(pS.u.u_ink, ...hex(o.ink));
    gl.uniform4f(pS.u.u_k, dpr, fronte, CAM.neb, CAM.terra); gl.uniform4f(pS.u.u_om, ...o.viale); gl.uniform3f(pS.u.u_alte, ...o.alte); gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.enable(gl.BLEND); gl.useProgram(pT.p);
    gl.uniformMatrix4fv(pT.u.u_m, false, M); gl.uniform2f(pT.u.u_res, tela.width / 2, tela.height / 2); gl.uniform1f(pT.u.u_t, t); gl.uniform3fv(pT.u.u_pal, pal);
    cieli.forEach((s) => tratti(s, s.tr, [dpr, 1e6, (s.alfa.call ? s.alfa() : s.alfa) * CAM.neb, 0], [s.vola ? s.vola(t) : 0, 0, 1, 0]));
    gl.enable(gl.DEPTH_TEST); gl.depthMask(true); gl.disable(gl.BLEND);
    gl.useProgram(pP.p); gl.uniformMatrix4fv(pP.u.u_m, false, M); gl.uniform1f(pP.u.u_t, t); gl.uniform1f(pP.u.u_fronte, fronte); gl.uniform3f(pP.u.u_cielo, ...CIELO);
    gl.bindVertexArray(vP.v); gl.drawArrays(gl.TRIANGLES, 0, vP.n);
    gl.depthMask(false); gl.enable(gl.BLEND); gl.useProgram(pT.p); tratti(vT, [1, 0, 0], [dpr, fronte, 1, 1]);
    mossi.forEach((m) => { const a = m.ang(); tratti(m, [1, 0, 0], [dpr, fronte, 1, 1], [m.x, m.z, Math.cos(a), Math.sin(a)]); });
  };
  // gira solo mentre l'apertura si vede; lo sguardo insegue il puntatore con un po' di ritardo
  let acceso = false, raf = 0;
  const giro = () => { raf = 0; if (!acceso) return; occhio.x += (occhio.vx - occhio.x) * 0.06; occhio.y += (occhio.vy - occhio.y) * 0.06; disegna(); raf = requestAnimationFrame(giro); };
  const vivo = (si) => { acceso = si && !fermo; if (acceso && !raf) raf = requestAnimationFrame(giro); };
  if (!fermo && matchMedia('(hover: hover)').matches) addEventListener('pointermove', (e) => { occhio.vx = (e.clientX / innerWidth) * 2 - 1; occhio.vy = (e.clientY / innerHeight) * 2 - 1; }, { passive: true });
  tela.addEventListener('webglcontextlost', (e) => { e.preventDefault(); acceso = false; }); // shortcut: contesto perso = disegno fermo; se capita davvero, ricaricare i buffer su webglcontextrestored
  misura();
  return { disegna, misura, vivo, tratti: vT.n };
};
