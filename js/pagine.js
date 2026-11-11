/* PAGINE azienda.html e vino.html (versione 3 del 6 nov 2026, "lo sticky laterale è un po' passato di moda"): niente più colonna che scorre accanto a un'immagine
   ferma. Ogni pagina è un palco a tutto schermo e lo scorrimento fa entrare e uscire le scene attorno al soggetto (la bottiglia, la foto), come le sale di H.
   Sul telefono le scene vanno in colonna sotto il palco d'apertura. Dati veri di js/data.js. La versione di prima è in js/pagine-v2.js, la 1 in js/pagine-v1.js.
   Stile: css/pagine.css · Dipende da: gsap + ScrollTrigger, FS (main.js), FS.mk (moderna-kit.js) */
(() => {
  const { $, $$, reduce, clamp, ss, spezza, titoli, sale, apri } = FS.mk;
  const tel = () => matchMedia('(max-width: 860px)').matches;
  const MOB = tel(); // shortcut: il modo (palco o colonna) si sceglie al caricamento; girando il telefono a metà pagina serve ricaricare
  const lerp = (a, b, t) => a + (b - a) * t;

  // footer comune: le ancore della home (#premi, #news...) qui non ci sono, portano alla home
  $$('.foot a[href^="#"]').forEach((a) => { if (!document.getElementById(a.hash.slice(1))) a.href = 'index.html' + a.hash; });

  // un solo giro di disegno per fotogramma, per tutte le parti che seguono lo scorrimento
  const ogni = [];
  let raf = 0;
  const giro = () => { raf = 0; ogni.forEach((f) => f()); };
  const chiedi = () => { if (!raf) raf = requestAnimationFrame(giro); };
  addEventListener('scroll', chiedi, { passive: true });
  addEventListener('resize', () => { ogni.forEach((f) => f.misura?.()); chiedi(); });

  // il crema (o la notte, o una foto) entra da destra a pennellate, come i cambi di sala di H: bordo-v.webp è il filo di setole, a destra è pieno
  const pennella = (el, W, f) => { if (el._f === f && el._W === W) return; el._f = f; el._W = W; const xe = lerp(W, -170, f); el.style.maskPosition = `${xe}px 0, ${xe + 169}px 0`; el.style.maskSize = `170px auto, ${Math.max(0, W - xe)}px 100%`; };
  const nav = $('[data-nav]');

  /* Le scene dei palchi. p = quanto è avanzata la scena (0-1): il titolo sale lettera per lettera, i pezzi (.pz) entrano uno dopo l'altro salendo
     (.pz-su sale da dietro il suo filo, [data-lato] scivola di lato), poi la scena esce salendo, se non è l'ultima. */
  const prepara = (sc, tit) => { sc._ch = $$(tit, sc).flatMap((h) => spezza(h)); sc._pz = $$('.pz', sc); if (!reduce) gsap.set(sc._ch, { yPercent: 110 }); };
  const scena = (sc, p, ultima = false) => {
    const out = ultima ? 0 : ss(clamp((p - 0.84) / 0.16)), on = p > 0 && out < 1;
    if (sc._on !== on) { sc._on = on; sc.style.visibility = on ? 'visible' : 'hidden'; }
    const su = p > 0.02;
    if (su !== sc._su && !reduce) { sc._su = su; gsap.to(sc._ch, su ? { yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: 0.025, overwrite: true } : { yPercent: 110, duration: 0.3, overwrite: true }); }
    if (!on) return;
    sc.style.opacity = 1 - out; sc.style.translate = `0 ${-out * 56}px`;
    const passo = Math.min(0.06, 0.42 / Math.max(1, sc._pz.length));
    sc._pz.forEach((pz, i) => {
      const v = reduce ? 1 : ss(clamp((p - 0.05 - i * passo) / 0.16));
      if (pz._v === v) return; pz._v = v;
      if (pz.classList.contains('pz-su')) pz.style.transform = `translateY(${(1 - v) * 105}%)`;
      else if (pz.dataset.lato) { pz.style.opacity = v; pz.style.transform = `translateX(${(1 - v) * pz.dataset.lato * 30}vw)`; }
      else { pz.style.opacity = v; pz.style.transform = `translateY(${(1 - v) * 36}px)`; }
    });
  };

  /* ================= SCHEDA DEL VINO ================= */
  const TIPO = { rosso: 'Rosso', rosato: 'Rosato', bianco: 'Bianco', dolce: 'Dolce' };
  const METALLO = ['Oro', 'Argento', 'Bronzo', 'Seal of Approval'];
  const tbd = (t) => `<span class="tbd">${t}</span>`;
  const righe = (rs, pz = '') => rs.map(([t, v, largo]) => `<div class="${[largo && 'vn-dati__largo', pz].filter(Boolean).join(' ')}"><dt>${t}</dt><dd>${v}</dd></div>`).join('');

  const vino = () => {
    const w = FS.wine(new URLSearchParams(location.search).get('id'));
    const vn = $('.vn'), st = $('.vn__st');
    if (!w) { // link vecchio o id sbagliato: si propone la cantina
      vn.outerHTML = `<section class="pg-sec pg-crema vn-vuoto" data-subito><div class="pg-in"><h1 class="pg-h1" data-chars>Vino non trovato.</h1><p class="pg-lead">Il link non porta a nessuno dei nostri vini. Puoi sceglierne uno dalla cantina.</p><button class="btn btn--gold" type="button">Apri i nostri vini</button></div></section>`;
      $('.vn-vuoto .btn').addEventListener('click', () => apri());
      return;
    }
    const c = FS.collection(w.collection), ix = FS.data.wines.indexOf(w);
    document.title = `${w.name} · Feudi Salentini`;
    $('meta[name="description"]').content = `${w.name}, ${w.denom}. ${w.desc}`.slice(0, 300);

    // ---- testi: presentazione e scene ----
    const col = $('.vn-col'); col.textContent = c.name; col.addEventListener('click', () => apri(c.id));
    $('.vn-nome').textContent = w.name;
    $('.vn-denom').textContent = w.denom;
    $('.vn-desc').textContent = w.desc;
    $('.vn-fatti').innerHTML = righe([['Tipo', TIPO[w.tipo] || w.tipo], ['Uve', w.uve || tbd('Non indicate nel catalogo')], ['Gradazione', w.alcool]]);
    const cibi = w.foods.map((f) => FS.data.foods.find((x) => x.id === f)).filter(Boolean);
    const ps = [...w.premi].sort((a, b) => b.anno - a.anno || METALLO.indexOf(a.medaglia) - METALLO.indexOf(b.medaglia));
    const dati = [['Uve', w.uve || tbd('Non indicate nel catalogo')], ['Zona di produzione', w.zona], ['Resa per ettaro', w.resa], ['Gradazione', w.alcool]].filter(([, v]) => v);
    const scene = [
      (w.vista || w.aromi.length) && ['calice', `${w.vista ? `<div class="vn-sx"><h2 class="vn__t">La vista</h2><p class="vn-grande pz">${w.vista}</p></div>` : ''}${w.aromi.length ? `<div class="vn-dx"><h2 class="vn__t">${w.aromi.length > 1 ? 'I profumi' : 'Il profumo'}</h2><ul class="vn-parole">${w.aromi.map((a) => `<li class="pz">${a}</li>`).join('')}</ul></div>` : ''}`],
      w.abb && ['tavola', `<div class="vn-sx"><h2 class="vn__t">In tavola</h2><p class="pg-lead pz">${w.abb}</p></div>${cibi.length ? `<ul class="vn-tavola">${cibi.map((f, i) => `<li class="pz" data-lato="${i % 2 ? 1 : -1}"><img src="assets/quadri/piatti/${f.id}.webp" alt="" loading="lazy" decoding="async"><span>${f.label}</span></li>`).join('')}</ul>` : ''}`],
      ['cantina', `<div class="vn-sx"><h2 class="vn__t">In vigna e in cantina</h2><dl class="vn-dati">${righe(dati, 'pz')}</dl></div><div class="vn-dx"><dl class="vn-dati">${righe([['Denominazione', w.denom, true], ['Vinificazione e affinamento', w.tecnica || tbd('Non indicata nel catalogo'), true]], 'pz')}</dl></div>`],
      ps.length && ['premi', `<div class="vn-sx"><h2 class="vn__t">Riconoscimenti</h2><p class="pg-lead pz">${ps.length === 1 ? 'Un riconoscimento' : `${ps.length} riconoscimenti`} nei concorsi internazionali, ${ps.at(-1).anno === ps[0].anno ? `nel ${ps[0].anno}` : `dal ${ps.at(-1).anno} al ${ps[0].anno}`}.</p></div>
        <div class="vn-dx"><ul class="vn-medaglie" style="--cols:${Math.min(3, ps.length)}">${ps.map((p) => `<li><span class="vn-med"><img class="pz pz-su" src="${p.img}" alt="" loading="lazy" decoding="async"></span><p class="pz"><b>${p.medaglia} · ${p.anno}</b><span>${p.concorso}</span></p></li>`).join('')}</ul></div>`]
    ].filter(Boolean);
    $('.vn__scena').insertAdjacentHTML('beforeend', scene.map(([id, html]) => `<div class="vn-sc vn-sc--${id}" data-sc="${id}">${html}</div>`).join(''));
    const SC = $$('.vn-sc'), TIT = '.vn-nome, .vn__t';
    if (MOB) $$(TIT).forEach((h) => (h.dataset.chars = ''));
    else SC.forEach((sc) => prepara(sc, TIT));
    // il palco: l'apertura dura T0 schermi (il nome grande resta mezzo schermo), poi ogni scena DS schermi
    const T0 = 0.6, DS = 1.1;
    vn.style.setProperty('--lungo', (T0 + (SC.length - 0.15) * DS + 1).toFixed(2)); // il palco resta fermo finché l'ultima scena è entrata, più lo schermo che lo porta via

    // ---- il palco: crema, bottiglia vera, nome grande ----
    const crema = $('.vn__crema', st), foto = $('.vn__foto', st), macchia = $('.vn__macchia', st), filo = $('.vn__filo', st), gig = $('.vn__gigante', st);
    st.style.cssText = `--wine:${w.color};--stain:var(--nav-stain-${ix % 3});--fondo:${w.fondo}`;
    foto.src = w.bottle;
    gig.textContent = w.name;
    vn.dataset.quadro = '0'; // 10 nov: niente più quadro dipinto all'ingresso ("abbiamo già la bottiglia")
    const tavola = $$('.vn-tavola li');
    let lettere = [], L = null;
    // l'arrivo: la bottiglia parte da dove la mostrava la finestra della home (posizione salvata da js/nav.js al clic su "Scheda del vino") e scivola al suo posto,
    // poi sale il nome grande. Senza finestra prima (link diretto) sale dal basso
    const fp = window.fsPour, R0 = fp && fp.id === w.id && Date.now() - fp.t < 10000 && fp.r, ent = { e: reduce ? 1 : 0 };
    // le misure del palco: dove sta la bottiglia, quanto spazio lascia ai lati
    const misura = () => {
      const W = st.clientWidth, H = st.clientHeight, t = MOB;
      const bh = t ? Math.min(H * 0.6, 520) : clamp(H * 0.78, 340, 860), yL = t ? H * 0.88 : H * 0.92, gF = w.fondo * bh, pad = clamp(W * 0.04, 16, 56); // = --pad-x
      L = { W, H, t, bh, yL, gF, pad, fw: Math.min(W * 0.9, bh * 0.95) };
      foto.style.height = `${bh}px`; foto.style.top = `${yL - gF}px`;
      macchia.style.width = `${bh * 0.86}px`; macchia.style.top = `${yL - gF + bh * 0.5}px`;
      filo.style.top = `${yL}px`; filo.style.width = `${L.fw}px`;
      gig.style.fontSize = '100px'; const g = gig.firstElementChild?.offsetWidth || 1; gig.style.fontSize = `${Math.min(100 * (W * 0.92) / g, H * 0.36)}px`; gig.style.top = `${Math.max(76 + 8, yL - gF - H * 0.02)}px`;
      // i lati: la bottiglia e la macchia stanno nel mezzo, i testi fuori
      const gap = Math.max(bh * 0.5, 180); // la macchia più larga (calice, 1,12) arriva a 0,48 bh dal centro
      vn.style.setProperty('--gap', `${gap}px`);
      if (!t && tavola.length) { // i piatti si posano sul filo ai due lati della bottiglia
        const ph = Math.min(H * 0.2, (W / 2 - gap - pad) / 2.4, 170);
        tavola.forEach((li, i) => { const k = Math.floor(i / 2), x = W / 2 + li.dataset.lato * (gap + (k + 0.5) * ph * 1.3); Object.assign(li.style, { width: `${ph}px`, left: `${x - ph / 2}px`, top: `${yL - ph}px` }); });
      }
    };
    let nomeSu = false;
    const nomeEntra = (su) => { if (su === nomeSu || reduce) return; nomeSu = su; gsap.to(lettere, { yPercent: su ? 0 : 110, duration: su ? 1.1 : 0.4, ease: su ? 'expo.out' : 'power2.in', stagger: su ? 0.03 : 0.01, overwrite: true }); };
    const disegna = () => {
      if (!L) return;
      const { W, H, t, bh, yL, gF } = L, Y = -vn.getBoundingClientRect().top / H;
      const s = t ? 0 : ss(clamp((Y - T0 + 0.06) / (DS * 0.12))), xF = W / 2, e = ent.e; // il nome grande se ne va prima che salga il titolo
      // l'arrivo: dalla bottiglia della finestra (R0, il piede del vetro sul piede del vetro) o dal basso
      const fx = R0 ? (R0[0] + R0[2] / 2 - xF) * (1 - e) : 0, fy = R0 ? (R0[1] + w.fondo * R0[3] - yL) * (1 - e) : 70 * (1 - e), fk = R0 ? lerp(R0[3] / bh, 1, e) : 1;
      foto.style.left = `${xF - bh * 0.319}px`;
      foto.style.transform = `translate(${fx}px, ${fy}px) scale(${fk})`; foto.style.transformOrigin = `50% ${w.fondo * 100}%`;
      foto.style.opacity = R0 ? 1 : clamp(e / 0.4);
      pennella(crema, W, 1);
      const pronto = ss(clamp((e - 0.7) / 0.3)); // macchia e filo arrivano quando la bottiglia è a posto
      macchia.style.left = `${xF}px`; filo.style.left = `${xF}px`; filo.style.opacity = pronto;
      macchia.style.setProperty('--su', pronto); if (!t) macchia.style.setProperty('--giro', `${Y * 24}deg`); // gira piano con lo scorrimento, come nei più venduti di H
      gig.style.opacity = 1 - s; gig.style.translate = `0 ${-s * 40}px`;
      nomeEntra(e > 0.85 && s < 0.3);
      if (t) return;
      // le scene attorno alla bottiglia; la macchia risponde (css: .vn__st[data-cap]); nella tavola il filo si allarga fino ai bordi
      let cap = 'intro', ft = 0;
      SC.forEach((sc, i) => { const p = clamp((Y - T0 - i * DS) / DS); scena(sc, p, i === SC.length - 1); if (p > 0) cap = sc.dataset.sc; if (sc.dataset.sc === 'tavola') ft = ss(clamp(p / 0.2)) * (1 - ss(clamp((p - 0.84) / 0.16))); });
      if (st.dataset.cap !== cap) st.dataset.cap = cap;
      filo.style.width = `${lerp(L.fw, W - 2 * L.pad, ft)}px`;
    };
    ogni.push(Object.assign(disegna, { misura }));

    // ---- gli altri della collezione, tutti in fila sul filo ----
    const altri = FS.data.wines.filter((x) => x.collection === w.collection && x !== w);
    if (altri.length) {
      $('.vn-altri').hidden = false;
      const h = $('#vn-al-t'); h.textContent = c.name; h.dataset.chars = '';
      const fila = $('.vn-fila'); fila.style.setProperty('--n', altri.length);
      fila.innerHTML = altri.map((x) => `<li class="vn-b" style="--b:${x.fondo};--wine:${x.color};--stain:var(--nav-stain-${FS.data.wines.indexOf(x) % 3})"><a href="${FS.wineUrl(x.id)}" data-wine="${x.id}"><span class="vn-b__fig"><i class="vn-b__macchia"></i><img src="${x.bottle}" alt="" loading="lazy" decoding="async"></span><span class="vn-b__n">${x.name}</span></a></li>`).join('');
    }

    lettere = spezza(gig);
    if (!reduce) gsap.set(lettere, { yPercent: 110 });
    misura(); disegna();
    if (!reduce) gsap.to(ent, { e: 1, duration: R0 ? 1.3 : 1.1, ease: R0 ? 'expo.inOut' : 'expo.out', delay: R0 ? 0.75 : 0.25, onUpdate: chiedi }); // dopo la copertura versata, che scende in un secondo
    addEventListener('load', () => { misura(); disegna(); });
    document.fonts.ready.then(() => { misura(); disegna(); }); // il nome grande si misura col suo font, non con quello di riserva
    if (reduce) return;
    // telefono: le scene in colonna salgono entrando in vista
    if (MOB) SC.forEach((sc) => sale($$('.pz:not(.pz-su)', sc), sc));
    const bt = $$('.vn-b__fig img');
    if (bt.length) gsap.fromTo(bt, { yPercent: 100 }, { yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: 0.05, scrollTrigger: { trigger: '.vn-fila', start: 'top 80%' } });
  };

  /* ================= AZIENDA ================= */
  // il vento sul ramo dell'apertura: la stessa formula delle chiome nei quadri di H (js/moderna-f.js FS_QUADRO), sulla mappa del ramo
  // (assets/quadri/ramo-mappa.webp, chiara su foglie e uva): le foglie si muovono, il tronco resta fermo. Senza WebGL2 o con movimento ridotto resta il ramo fermo
  const vento = (vivo) => {
    if (!vento.gl) return;
    if (vivo && !vento.raf) { const giro = (t) => { vento.raf = vento.vivo ? requestAnimationFrame(giro) : 0; vento.disegna(t / 1000); }; vento.vivo = true; vento.raf = requestAnimationFrame(giro); }
    if (!vivo) vento.vivo = false;
  };
  const ventoPronto = (ramo) => {
    if (reduce) return;
    const cv = document.createElement('canvas'), gl = cv.getContext('webgl2', { premultipliedAlpha: true, alpha: true, antialias: false });
    if (!gl) return;
    const sh = (t, src) => { const s = gl.createShader(t); gl.shaderSource(s, src); gl.compileShader(s); return s; }, P = gl.createProgram();
    gl.attachShader(P, sh(gl.VERTEX_SHADER, `#version 300 es
      out vec2 v; void main() { vec2 a = vec2(float(gl_VertexID & 1) * 4. - 1., float(gl_VertexID >> 1) * 4. - 1.); v = vec2(a.x * .5 + .5, .5 - a.y * .5); gl_Position = vec4(a, 0., 1.); }`));
    gl.attachShader(P, sh(gl.FRAGMENT_SHADER, `#version 300 es
      precision highp float; uniform sampler2D uTex, uMap; uniform float uT; in vec2 v; out vec4 o;
      void main() { vec2 uv = v; float m = texture(uMap, uv).r;
        float b1 = sin(uT * 1.15 + uv.x * 22. + uv.y * 14.) + .5 * sin(uT * 2.6 + uv.x * 47. - uv.y * 31.), b2 = cos(uT * .95 + uv.y * 24. - uv.x * 9.);
        m = clamp(m * 1.6, 0., 1.);
        uv += m * (vec2(sin(uT * .7 + uv.y * 3.) * .009, cos(uT * .55 + uv.x * 2.5) * .006) + vec2(b1 * .0045, b2 * .003)); // la chioma ondeggia tutta insieme, sopra il fremito delle foglie
        o = texture(uTex, uv); }`));
    gl.linkProgram(P);
    if (!gl.getProgramParameter(P, gl.LINK_STATUS)) return;
    gl.useProgram(P);
    const tex = (im, unit) => { const t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); };
    const mappa = new Image(); mappa.src = 'assets/quadri/ramo-mappa.webp';
    Promise.all([ramo.decode(), mappa.decode()]).then(() => {
      cv.width = ramo.naturalWidth; cv.height = ramo.naturalHeight; gl.viewport(0, 0, cv.width, cv.height);
      tex(ramo, 0); tex(mappa, 1); gl.uniform1i(gl.getUniformLocation(P, 'uTex'), 0); gl.uniform1i(gl.getUniformLocation(P, 'uMap'), 1);
      const uT = gl.getUniformLocation(P, 'uT');
      vento.disegna = (t) => { gl.uniform1f(uT, t * 1.25); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLES, 0, 3); };
      cv.className = 'az-ramo az-ramo--gl is-pieno'; cv.setAttribute('aria-hidden', 'true');
      // finché il ramo arriva a pennellate si vede la foto dipinta; poi la tela col vento prende il suo posto
      vento.via = () => { ramo.after(cv); vento.cv = cv; vento.gl = gl; vento.disegna(0); ramo.style.visibility = 'hidden'; chiedi(); };
      if (ramo.classList.contains('is-pieno')) vento.via();
    }).catch(() => {});
  };

  const azienda = () => {
    // numeri e medaglie dai dati
    const W_ = FS.data.wines, tutti = W_.flatMap((w) => w.premi.map((p) => ({ ...p, vino: w.name }))), premiati = W_.filter((w) => w.premi.length).length;
    const ANNI = [...new Set(tutti.map((p) => p.anno))].sort((a, b) => a - b);
    $$('[data-premi-totale]').forEach((el) => (el.textContent = tutti.length));
    $$('[data-vini-totale]').forEach((el) => (el.textContent = W_.length));
    const COL = FS.mk.collezioni();
    $('.az-premi__lead').textContent = `Nei concorsi internazionali, dal ${ANNI[0]} al ${ANNI.at(-1)}, per ${premiati} dei nostri vini: ogni scheda del vino mostra i suoi.`;
    // i riconoscimenti anno per anno: le medaglie dell'anno, ognuna col suo concorso e quanti vini l'hanno presa
    const premiDi = (a) => tutti.filter((p) => p.anno === a), medaglieDi = (a) => [...new Map(premiDi(a).map((p) => [p.k, p])).values()];
    $('.az-anni-i').innerHTML = ANNI.map((a) => `<li class="pz"><span>${a}</span><b>${premiDi(a).length} premi</b></li>`).join('');
    $('.az-anni').innerHTML = ANNI.map((a) => `<div class="az-anno" style="--n:${medaglieDi(a).length}"><h3 class="az-anno__t">${a} <span>${premiDi(a).length} premi</span></h3><ul>${medaglieDi(a).map((m) => {
      const v = tutti.filter((p) => p.k === m.k).map((p) => p.vino);
      return `<li><span class="az-med"><img src="${m.img}" alt="${m.concorso}, ${m.medaglia.toLowerCase()} ${a}" loading="lazy" decoding="async"></span><p><b>${m.medaglia}</b>${m.concorso}<span title="${v.join(', ')}">${v.length === 1 ? v[0] : `${v.length} vini`}</span></p></li>`;
    }).join('')}</ul></div>`).join('');
    // i vitigni: quanti vini per ciascuno (uve in js/data.js) e le loro bottiglie, ognuna porta alla sua scheda
    const VIT = ['Primitivo', 'Negroamaro', 'Verdeca', 'Malvasia Bianca'], viniDi = (v) => W_.filter((w) => (w.uve || '').includes(v));
    $$('[data-vitigni-totale]').forEach((el) => (el.textContent = VIT.length));
    $('.az-vit').innerHTML = VIT.map((v) => `<li class="pz"><span>${v}</span><b>${viniDi(v).length} vini</b></li>`).join('');
    $('.az-file').innerHTML = VIT.map((v) => `<ul class="az-fila" style="--n:${viniDi(v).length}" aria-label="I vini di ${v}">${viniDi(v).map((w) => `<li style="--b:${w.fondo}"><a href="${FS.wineUrl(w.id)}" data-wine="${w.id}" title="${w.name}"><img src="${w.bottle}" alt="${w.name}" loading="lazy" decoding="async"></a></li>`).join('')}</ul>`).join('');

    const Z = $('.az'), st = $('.az__st'), cor = $('.az__cornice'), creme = $$('.az__crema'), posti = $$('.az__posti .az__img'), apre = $('.az__apre'), notteA = $('.az-apre'), box = $('.az-num');
    const S = Object.fromEntries($$('.az-sc').map((sc) => [sc.dataset.sc, sc])), TIT = '.az-t';
    if (MOB) $$(TIT).forEach((h) => (h.dataset.chars = ''));
    else Object.values(S).forEach((sc) => prepara(sc, TIT));
    const banda = $('.az-banda'), terrP = $('.az-terr-p'), riga = $('.az-luoghi'), luoghiLi = $$('.az-luoghi li');
    // i gruppi sul filo (le bottiglie di ogni vitigno, le medaglie di ogni anno): salgono uno dopo l'altro, a fine turno scendono e sale il gruppo dopo
    const fileV = $$('.az-fila').map((ul) => Object.assign(ul, { _a: $$('a', ul) }));
    const fileA = $$('.az-anno').map((g) => Object.assign(g, { _a: $$('.az-med img', g).map((im) => Object.assign(im, { _t: im.closest('li').querySelector('p') })) }));
    const sulFilo = (gruppi, u) => gruppi.forEach((g, j) => {
      const giu = j < gruppi.length - 1 ? ss(clamp((u - j - 0.85) / 0.12)) : 0, passo = Math.min(0.03, 0.3 / g._a.length);
      g._a.forEach((el, i) => { const yv = Math.max(1 - ss(clamp((u - j - i * passo) / 0.2)), giu); if (el._y === yv) return; el._y = yv; el.style.transform = `translateY(${yv * 105}%)`; if (el._t) el._t.style.opacity = 1 - yv; });
    });
    // il nome grande dietro il gruppo (il vitigno, l'anno) cambia salendo; nell'elenco in alto si accende il suo
    const gigante = (el, nomi, lis) => {
      let k0 = -1, ch = [];
      const fit = () => { if (k0 < 0) return; el.style.fontSize = '100px'; const g = el.firstElementChild?.offsetWidth || 1; el.style.fontSize = `${Math.min(100 * (st.clientWidth * 0.9) / g, innerHeight * 0.3)}px`; };
      const vai = (k) => {
        if (k === k0) return; k0 = k;
        lis.forEach((li, j) => li.classList.toggle('is-on', j === k));
        if (k < 0) { if (!reduce) gsap.to(ch, { yPercent: 110, duration: 0.3, overwrite: true }); return; }
        ch = spezza(el, String(nomi[k])); fit();
        if (!reduce) gsap.fromTo(ch, { yPercent: 110 }, { yPercent: 0, duration: 1, ease: 'expo.out', stagger: 0.03 });
      };
      return Object.assign(vai, { fit });
    };
    const vitigno = gigante($('.az-sc--vitigni .az-gigante'), VIT, $$('.az-vit li')), anno = gigante($('.az-sc--premi .az-gigante'), ANNI, $$('.az-anni-i li'));
    // il manifesto del catalogo: sul computer le parole si accendono scorrendo, sul telefono con la regola del kit
    const frase = $('.az-man__frase'), fotoM = $$('.az-man__f');
    let pw = [];
    if (MOB) FS.mk.parole(frase);
    else { frase.innerHTML = frase.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(' '); pw = $$('.w', frase); }
    // ---- i numeri, sezione a parte sulla notte sotto il ramo (scelti "i dipinti" fra tre prove; le altre in azienda-v6.html): due per schermo,
    //      la cifra d'oro con dentro la macchia d'oro di H si dipinge a pennellate mentre si scorre, poi sale l'etichetta
    const NUM = [['4ª', 'generazione della famiglia Varvaglione'], [String(VIT.length), 'vitigni autoctoni pugliesi'], [String(W_.length), `vini in ${COL.length} collezioni`], [String(tutti.length), 'riconoscimenti internazionali']];
    box.insertAdjacentHTML('beforeend', NUM.map(([n, t], i) => `<div class="az-n1 az-n1--${i % 2 ? 'r' : 'l'}"><b aria-hidden="true">${n}</b><span><span class="sr-only">${n} </span>${t}</span></div>`).join(''));
    const it = $$('.az-n1', box).map((el) => Object.assign(el, { _b: $('b', el), _t: $('span', el) }));
    const grap = $('.az-grappolo', box); // il grappolo dipinto fra le cifre: arriva a pennellate con la prima coppia e resta finché c'è la notte
    const numeri = (q) => it.forEach((el, i) => {
      const c = Math.floor(i / 2), d = i % 2, a = c ? (q - 0.44) / 0.56 : q / 0.5, // la seconda coppia comincia mentre la prima se ne va: niente schermo vuoto
        via = c === 0 ? ss(clamp((a - 0.84) / 0.16)) : 0, on = a > 0 && via < 1;
      if (el._on !== on) { el._on = on; el.style.visibility = on ? 'inherit' : 'hidden'; } // inherit: col css nascosto, '' lo lascerebbe nascosto
      if (!on) return;
      pennella(el._b, el._b.clientWidth, reduce ? 1 : clamp((a - 0.04 - d * 0.18) / 0.32));
      el._t.style.opacity = ss(clamp((a - 0.32 - d * 0.18) / 0.14)); el.style.opacity = 1 - via;
    });
    // la scaletta del palco, in schermi: il ramo (fino a 0,45), i numeri (da N0 per ND), la notte se ne va (A2), famiglia, manifesto, la nostra filosofia, il Salento, riconoscimenti
    const N0 = 0.4, ND = 1.6, A1 = N0 + ND, A2 = A1 + 0.5, F0 = A2 + 0.05, M0 = F0 + 1.4, MD = 1.5, V0 = M0 + MD, VD = 0.3 + VIT.length * 0.7 + 0.35, T0 = V0 + VD,
      P0 = T0 + 0.55 + posti.length * 0.6 + 0.2, PD = 0.3 + ANNI.length * 0.6 + 0.3;
    Z.style.setProperty('--lungo', (P0 + 0.3 + PD + 1).toFixed(2));
    if (MOB) $('.az__a').style.height = `${(A2 + 0.9) * 100}lvh`; // sul telefono il palco d'apertura dura quanto ramo, numeri e notte
    // le misure: la cornice dei luoghi
    const testoA = $('.az-apre__testo'), ramo = $('.az-ramo');
    ventoPronto(ramo);
    const misuraA = () => {
      vitigno.fit(); anno.fit();
      const W = st.clientWidth, pad = clamp(W * 0.04, 16, 56);
      if (!MOB) $('.az__posti').style.clipPath = `inset(${banda.offsetTop + banda.offsetHeight + 20}px ${pad}px ${pad}px ${pad}px round 8px)`;
    };
    const palco = () => {
      const H = innerHeight, W = st.clientWidth, SH = st.clientHeight, y = -Z.getBoundingClientRect().top, Y = y / H, pad = clamp(W * 0.04, 16, 56);
      // 0. l'apertura sulla notte: il ramo dipinto (le foglie al vento) e il nome. Scorrendo il ramo scivola via e il nome sale; poi, sezione a parte
      //    sulla stessa notte, i numeri dipinti; poi la notte si ritira a pennellate sulla famiglia
      const eT = ss(clamp(Y / 0.45)), fN = 1 - ss(clamp((Y - A1) / (A2 - A1)));
      ramo.style.translate = `${-eT * 14}vw ${eT * 10}lvh`; ramo.style.opacity = 1 - ss(clamp((Y - 0.1) / 0.35));
      if (vento.cv) { vento.cv.style.translate = ramo.style.translate; vento.cv.style.opacity = ramo.style.opacity; vento(Y < 0.5); }
      testoA.style.transform = `translateY(${-eT * 48}px)`; testoA.style.opacity = 1 - eT;
      const nIn = clamp((Y - N0 + 0.05) / 0.15); box.style.opacity = nIn; box.style.visibility = nIn > 0 ? 'inherit' : 'hidden'; // la sezione dei numeri c'è solo dopo il ramo
      numeri(clamp((Y - N0) / ND));
      const gf = clamp((Y - N0 - 0.08) / 0.3), gOn = gf > 0;
      if (grap._on !== gOn) { grap._on = gOn; grap.style.visibility = gOn ? 'inherit' : 'hidden'; grap.classList.toggle('is-on', gOn); }
      if (gOn) pennella(grap, grap.clientWidth, reduce ? 1 : gf);
      pennella(notteA, W, fN);
      apre.style.visibility = fN > 0 ? 'visible' : 'hidden';
      if (fN > 0.5) { nav.dataset.forza = 'dark'; nav._notte = true; } else if (nav._notte) { delete nav.dataset.forza; nav._notte = false; } // sotto la barra c'è la notte
      const fin = MOB ? { t: 76 + 12, b: pad, l: pad } : { t: 76 + 28, b: SH * 0.08, l: W / 2 - Math.min(W * 0.17, H * 0.42) };
      cor.style.clipPath = `inset(${fin.t}px ${fin.l}px ${fin.b}px ${fin.l}px round 8px)`;
      cor.style.visibility = 'visible';
      if (MOB) return;
      // 1. la famiglia: il nome a sinistra, il racconto a destra della finestra; poi il crema la ricopre
      scena(S.famiglia, clamp((Y - F0) / 1.4));
      pennella(creme[0], W, clamp((Y - F0 - 1.0) / 0.4));
      // 2. il manifesto del catalogo: la frase si accende parola per parola, le foto in bianco e nero salgono ai lati a velocità diverse
      const pm = clamp((Y - M0) / MD);
      scena(S.manifesto, pm);
      if (S.manifesto._on) {
        const q = clamp((pm - 0.06) / 0.6);
        pw.forEach((w, i) => { const v = 0.2 + 0.8 * clamp((q * (pw.length + 4) - i) / 4); if (w._v !== v) { w._v = v; w.style.opacity = v; } });
        fotoM.forEach((f, i) => { f.style.opacity = ss(clamp(pm / 0.12)); f.style.transform = `translateY(${(0.45 - pm) * SH * [0.5, 0.85, 0.65][i]}px)`; });
      }
      // 3. la nostra filosofia: per ogni vitigno le sue bottiglie salgono dal filo col suo nome grande dietro
      const u = (Y - V0 - 0.3) / 0.7;
      scena(S.vitigni, clamp((Y - V0) / VD));
      if (S.vitigni._on) { sulFilo(fileV, u); vitigno(u > -0.2 ? clamp(Math.floor(u + 0.1), 0, VIT.length - 1) : -1); } else vitigno(-1);
      // 4. il Salento: il titolo in alto e il racconto al centro; poi i luoghi, uno alla volta a pennellate nella cornice, e sotto il titolo si accende il nome
      scena(S.territorio, clamp((Y - T0) / (P0 + 0.35 - T0)));
      let k = -1;
      posti.forEach((im, i) => { const f = clamp((Y - T0 - 0.55 - i * 0.6) / 0.4); pennella(im, W, f); if (f > 0.5) k = i; });
      terrP.style.opacity = ss(clamp((Y - T0 - 0.05) / 0.2)) * (1 - ss(clamp((Y - T0 - 0.42) / 0.12)));
      riga.style.opacity = ss(clamp((Y - T0 - 0.45) / 0.15));
      if (riga._k !== k) { riga._k = k; luoghiLi.forEach((li, i) => li.classList.toggle('is-on', i === k)); }
      // 5. i riconoscimenti anno per anno: il crema torna a pennellate, poi per ogni anno le sue medaglie salgono dal filo con l'anno grande dietro
      pennella(creme[1], W, clamp((Y - P0) / 0.45));
      const ua = (Y - P0 - 0.6) / 0.6;
      scena(S.premi, clamp((Y - P0 - 0.3) / PD), true);
      if (S.premi._on) { sulFilo(fileA, ua); anno(ua > -0.2 ? clamp(Math.floor(ua + 0.1), 0, ANNI.length - 1) : -1); } else anno(-1);
    };
    palco.misura = misuraA;
    ogni.push(palco);
    misuraA(); palco(); // il primo disegno subito, non al primo fotogramma
    document.fonts.ready.then(() => { misuraA(); chiedi(); });
    // il ramo arriva a pennellate, come il feudo nell'ingresso di H; poi le foglie e l'uva si muovono al vento (il tronco no)
    if (reduce) ramo.classList.add('is-pieno');
    else { const o = { f: 0 }; pennella(ramo, ramo.clientWidth, 0); ramo.decode().catch(() => {}).then(() => gsap.to(o, { f: 1, duration: 2, delay: 0.2, ease: 'power2.inOut', onUpdate: () => pennella(ramo, ramo.clientWidth, o.f), onComplete: () => { ramo.classList.add('is-pieno'); vento.via?.(); } })); }
    if (MOB && !reduce) Object.values(S).forEach((sc) => sale($$('.pz', sc), sc));
    // dove trovarci: la mappa del catalogo entra a pennellate mentre la sezione sale, i dati salgono
    const mappa = $('.az-dove__mappa');
    const dove = () => { const r = mappa.getBoundingClientRect(); if (r.top > innerHeight || r.bottom < 0) return; pennella(mappa, mappa.clientWidth, reduce ? 1 : clamp((innerHeight * 0.95 - r.top) / (innerHeight * 0.55))); };
    ogni.push(dove);
    if (!reduce) sale('.az-dove__testo > :not(h2)', '.az-dove');

    // 5. sostenibilità, con la grammatica dei premi di H: la notte entra a pennellate, poi i numeri del bilancio passano in diagonale sopra la macchia d'oro
    //    (grande al centro, piccoli verso gli angoli), il loro testo sale e sfuma con loro; alla fine gli obiettivi entrano uno dopo l'altro
    const O = $('.az-o'), notte = $('.az-o__notte'), oro = $('.az-o__oro'), testa = $('.az-o__testa'), dischi = $$('.az-o__dischi li'), testi = $$('.az-o__testi > li'), fine = $('.az-o__fine'), h2 = $('#az-o-t');
    const n = dischi.length, pezziFine = [$('.pg-h2', fine), ...$$('.az-obiettivi li', fine), $('.btn', fine)];
    O.style.setProperty('--n', n);
    const lettereT = spezza(h2);
    if (!reduce) gsap.set(lettereT, { yPercent: 110 });
    let titolo = false, posto = null;
    const misuraO = () => { const W = O.clientWidth, H = innerHeight, t = tel(), bw = t ? Math.min(W * 0.56, H * 0.3) : Math.min(W * 0.24, H * 0.5);
      const L = t ? { cx: W * 0.5, cy: H * 0.33, dx: W * 0.62, dy: H * 0.05 } : { cx: W * 0.66, cy: H * 0.5 + 16, dx: W * 0.36, dy: H * 0.42 };
      posto = (s) => { const a = Math.min(Math.abs(s), 1.6), k = 1 - 0.58 * Math.min(a, 1) - 0.1 * Math.max(0, a - 1), w = bw * k; return { x: L.cx + s * L.dx - w / 2, y: L.cy + s * L.dy - w / 2, w }; }; };
    const sostenibilita = () => {
      if (!posto) misuraO();
      const H = innerHeight, W = O.clientWidth, r = O.getBoundingClientRect(), y = -r.top, t = tel(), q = (a, b) => clamp((y - H * a) / (H * (b - a)));
      const f = clamp((y + H * 0.5) / H), pronto = clamp((f - 0.9) / 0.1);
      pennella(notte, W, f);
      if (pronto > 0.5 && !titolo) { titolo = true; if (!reduce) gsap.to(lettereT, { yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: 0.03 }); }
      // g: quale numero è al centro. Entrano da destra (in basso a destra), passano, escono verso l'alto a sinistra
      const u = clamp((y - H * 1.4) / (H * 0.7 * (n - 1))) * (n - 1), j = Math.min(n - 2, Math.floor(u)), fq = q(1.4 + 0.7 * (n - 1) + 0.2, 1.4 + 0.7 * (n - 1) + 1.0);
      const g = y < H * 1.4 ? -1.5 + 1.5 * ss(q(0.8, 1.4)) : j + ss(clamp((u - j - 0.2) / 0.6)) + 1.6 * ss(fq);
      const via = ss(q(1.0, 1.35)); testa.style.opacity = pronto * (1 - via); testa.style.translate = `0 ${-via * 40}px`; testa.style.visibility = pronto * (1 - via) > 0.01 ? '' : 'hidden';
      oro.style.setProperty('--su', ss(q(0.8, 1.4)) * (t ? 1 - ss(fq) : 1)); // sul telefono gli obiettivi stanno dove c'era la macchia: se ne va
      dischi.forEach((d, i) => { const s = i - g, vis = Math.abs(s) < 1.9; d.style.visibility = vis ? 'visible' : 'hidden'; if (!vis) return; const p = posto(s); d.style.transform = `translate(${p.x}px, ${p.y}px)`; d.style.width = d.style.height = `${p.w}px`; });
      testi.forEach((tx, k) => { const v = y < H * 1.2 ? 0 : clamp(1 - Math.abs(k - g) * 2.4); if (v === tx._v) return; tx._v = v; tx.style.opacity = v; tx.style.visibility = v > 0.02 ? 'visible' : 'hidden'; tx.style.transform = `translateY(${(1 - v) * (k < g ? -18 : 18)}px)`; });
      // gli obiettivi: il titolo, poi un obiettivo alla volta, poi il bilancio
      pezziFine.forEach((el, i) => { const v = ss(clamp((fq - 0.3) * 2.2 - i * 0.22)); el.style.opacity = v; el.style.transform = `translateY(${(1 - v) * 28}px)`; });
      fine.style.visibility = fq > 0.01 ? 'visible' : 'hidden';
      // l'header: sotto c'è già la notte dipinta solo quando le pennellate sono passate (come la forza di H)
      const sotto = r.top <= 0 && r.bottom > 76;
      if (sotto) nav.dataset.forza = f > 0.6 ? 'dark' : 'light'; else if (nav.dataset.forzaDi === 'az') delete nav.dataset.forza;
      nav.dataset.forzaDi = sotto ? 'az' : '';
    };
    sostenibilita.misura = misuraO;
    ogni.push(sostenibilita);
    addEventListener('load', chiedi);
  };

  if (document.body.classList.contains('page-vino')) vino();
  if (document.body.classList.contains('page-azienda')) azienda();
  titoli();
  chiedi();
})();
