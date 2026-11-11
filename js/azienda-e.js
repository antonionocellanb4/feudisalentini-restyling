/* AZIENDA dello stile E, verticale "dallo schizzo alla foto" (11 nov 2026, quarto giro: "usa effetti GSAP che conosci bene, manteniamo la verticalità").
   Ogni sezione ha un palco alto uno schermo che ScrollTrigger ferma (pin) mentre la sua timeline segue la rotella (scrub), avanti e indietro:
   apertura, il mondo inciso in 3D (WebGL2 in js/mondo-gl.js, svg di riserva); filosofia, le due foto in lungo; i vitigni con le bottiglie sulla ruota; Salento, la griglia;
   sostenibilità, i punti che si impilano; riconoscimenti anno per anno; fine, i calici che brindano.
   Il cielo va dall'alba alla sera. Dipende da: gsap, ScrollTrigger (main.js, con Lenis), FS.mk (moderna-kit.js) */
(() => {
  const { $, $$, reduce, spezza, entra } = FS.mk, D = FS.data;
  const az = $('.az');
  if (!az) return;
  $$('.foot a[href^="#"]').forEach((a) => { if (!document.getElementById(a.hash.slice(1))) a.href = FS.home + a.hash; }); // ancore della home nel footer comune
  const mob = innerWidth <= 860; // shortcut: deciso all'apertura; passando da telefono a desktop ridimensionando la finestra serve ricaricare

  /* ---- dai dati (sezioni prese da azienda.html, 11 nov): i numeri, i vitigni coi loro vini, i riconoscimenti anno per anno ---- */
  const W_ = D.wines, tutti = W_.flatMap((w) => w.premi.map((p) => ({ ...p, vino: w.name }))), ANNI = [...new Set(tutti.map((p) => p.anno))].sort((a, b) => a - b);
  const VIT = [['Primitivo', '#7a2131', 'nera'], ['Negroamaro', '#4a1f3a', 'nera'], ['Verdeca', '#a59a3c', 'bianca'], ['Malvasia Bianca', '#c29a3e', 'bianca']], viniDi = (v) => W_.filter((w) => (w.uve || '').includes(v));
  $$('[data-premi-totale]', az).forEach((el) => (el.textContent = tutti.length));
  $('.az-vit__l', az).innerHTML = VIT.map(([v, c, b]) => `<li style="--c:${c}"><b>${v}</b><span>${viniDi(v).length} vini · uva a bacca ${b}</span></li>`).join('');
  // i vini per vitigno: una ruota che porta in cima una bottiglia alla volta (11 nov: scelta questa fra due prove, l'altra è tolta)
  az.classList.add('az--ruota');
  // il nome senza il vitigno ("125 Primitivo" → "125"); quello intero resta per lo screen reader e per la didascalia della ruota
  const bottiglia = (w, v, i, k = 0) => `<li class="az-bt" style="--b:${w.fondo};--k:${k}" data-i="${i}" data-id="${w.id}"><a href="${FS.wineUrl(w.id)}" data-wine="${w.id}" aria-label="${w.name}"><span class="f"><img src="${w.bottle}" alt="" loading="lazy" decoding="async" draggable="false"></span><span class="n">${w.name.replace(v, '').replace(/\s+/g, ' ').trim() || w.name}</span></a></li>`;
  { let k = 0; $('.az-vit__pista', az).innerHTML = `<ul class="az-ruota">${VIT.map(([v], i) => viniDi(v).map((w) => bottiglia(w, v, i, k++)).join('') + (k++, '')).join('')}</ul><p class="az-ruota__cap"><a></a><span></span></p>`; } // un posto vuoto fra un vitigno e l'altro
  // i concorsi contati dalle medaglie che si vedono sotto (D.awards ne nomina anche altri che fra i premi dei vini non ci sono)
  $('.az-premi__d', az).textContent = `Dal ${ANNI[0]} al ${ANNI.at(-1)}, per ${W_.filter((x) => x.premi.length).length} dei nostri vini, in ${new Set(tutti.map((p) => p.concorso)).size} concorsi internazionali. Ogni scheda del vino mostra i suoi.`;
  const premiDi = (a) => tutti.filter((p) => p.anno === a), medaglieDi = (a) => [...new Map(premiDi(a).map((p) => [p.k, p])).values()], LUNGHI = [64, 128, 88, 150, 74, 112, 96];
  $('.az-premi__anni', az).innerHTML = ANNI.map((a) => `<li><b>${a}</b><span>${premiDi(a).length} premi</span></li>`).join('');
  $('.az-premi__anno', az).innerHTML = ANNI.map((a) => `<span>${a}</span>`).join('');
  $('.az-premi__filo', az).innerHTML = ANNI.map((a) => `<ul class="az-med" aria-label="Le medaglie del ${a}">${medaglieDi(a).map((m, i) => {
    const v = tutti.filter((p) => p.k === m.k).map((p) => p.vino);
    return `<li style="--l:${LUNGHI[i % LUNGHI.length]}px;--d:${-i * 0.7}s"><div class="az-pend"><svg class="az-nastro" viewBox="0 0 40 100" preserveAspectRatio="none" aria-hidden="true"><path class="n" d="M6 0L17 100M34 0L23 100"/><path class="h" d="M21 12L32 1M21 26L33 13M20 40L32 27M20 54L31 42M19 68L29 58M19 82L27 74M18 96L24 90"/></svg><img src="${m.img}" alt="${m.concorso}, ${m.medaglia.toLowerCase()} ${a}" loading="lazy" decoding="async" draggable="false"><p><b>${m.medaglia}</b><span>${m.concorso}</span><span class="az-med__v">${v.length <= 2 ? v.join(', ') : `${v.length} vini`}</span></p></div></li>`;
  }).join('')}</ul>`).join('');
  const medaglie = $$('.az-med li', az);
  medaglie.forEach((li) => { const tocca = () => { if (!reduce) gsap.fromTo($('.az-pend', li), { rotation: (Math.random() < 0.5 ? -1 : 1) * (7 + Math.random() * 5) }, { rotation: 0, duration: 2.4, ease: 'elastic.out(1, 0.22)', overwrite: 'auto' }); }; li.addEventListener('pointerenter', tocca); li.addEventListener('pointerdown', tocca); });

  /* ---- titoli lettera per lettera, frase parola per parola ---- */
  const tit = new Map();
  $$('[data-chars]', az).forEach((el) => { const ch = spezza(el); if (!reduce) gsap.set(ch, { yPercent: 110 }); tit.set(el, ch); });
  const frase = $('.az-frase', az);
  frase.innerHTML = frase.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(' ');
  const parole = $$('.w', frase);

  // Salento: scelta la griglia (11 nov); la torre incisa sta nell'ultima casella
  const apre = $('.az-apre', az), sal = $('.az-sal', az);
  { const torre = $('.az-sal__foto .az-sc', sal), c = document.createElement('div'); c.className = 'az-cella'; torre.replaceWith(c); c.append(torre); }

  /* ---- misure delle incisioni ---- */
  const scene = $$('.az-sc', az), grande = (q) => q.classList.contains('az-sc--largo') && !mob;
  const misura = () => {
    const W = innerWidth, H = innerHeight;
    scene.forEach((q) => {
      const sez = q.closest('section');
      let u;
      if (q.parentElement.matches('.az-cella')) { const c = q.parentElement; u = Math.min((c.clientWidth * 0.9) / 600, (c.clientHeight * 0.86) / 514); } // la torre nella sua casella
      else if (sez.matches('.az-sal')) u = mob ? (W * 0.8) / 600 : Math.min((H * 0.36) / 514, (W * 0.4) / 600);
      else u = mob ? (W * 0.96) / 600 : Math.min((H * (sez.matches('.az-fine') ? 0.46 : 0.42)) / 514, 3); // il campo della sostenibilità e i calici della fine
      q.style.setProperty('--u', `${u}px`); q._u = u;
      if (!q.style.getPropertyValue('--vbw')) q.style.setProperty('--vbw', grande(q) ? 2600 : 600);
    });
  };
  misura();
  const carica = (q) => fetch(`assets/incisioni/${q.dataset.scena}${grande(q) ? '-largo' : ''}.svg`).then((r) => (r.ok ? r.text() : Promise.reject(r.status))).then((s) => {
    q.innerHTML = s; q.style.setProperty('--vbw', $('svg', q).viewBox.baseVal.width || 600);
    q._t = $$('.t', q); q._o = $$('.o', q);
    if (!reduce) { gsap.set(q._t, { strokeDashoffset: 1 }); gsap.set(q._o, { opacity: 0 }); }
  }).catch(() => { q._t = []; q._o = []; });
  const incidi = (tl, q, at, dur = 0.45) => { if (!q._t?.length) return; tl.to(q._t, { strokeDashoffset: 0, ease: 'none', duration: dur, stagger: { amount: dur * 0.9 } }, at); tl.to(q._o, { opacity: 1, ease: 'none', duration: dur * 0.4, stagger: { amount: dur * 0.6 } }, at + dur * 0.3); };
  const entraTit = (el) => { const ch = tit.get(el); if (ch && !reduce) entra(ch); };
  const alVedere = (el, fn, start = 'top 80%') => ScrollTrigger.create({ trigger: el, start, once: true, onEnter: fn });


  /* ---- i movimenti: si costruiscono quando le incisioni sono arrivate ---- */
  const costruisci = () => {
    const W = innerWidth, H = innerHeight;
    // apertura: un mondo inciso in prospettiva vera. Il viale di cipressi va dritto al casale, viti e ulivi ai lati, i solchi della terra; scorrendo la camera
    // avanza lungo il viale (z), le cose vicine crescono e passano, quelle lontane sono più chiare (la foschia), il casale arriva fino a riempire lo schermo
    const stA = $('.az-st', apre), mondo = $('.az-mondo', apre), fam = $('.az-apre__fam', apre), NS = 'http://www.w3.org/2000/svg';
    const UM = 0.045, OCCHIO = 1.7, CASALE = 120, FERMA = CASALE - (mob ? 15 : 13.5); // metri per unità dei disegni, altezza dell'occhio, distanza del casale, dove si ferma la camera
    const caso = ((s) => () => (s = (s * 16807) % 2147483647) / 2147483647)(11); // sempre lo stesso mondo
    const cose = [], metti = (id, x, z, k = 1) => cose.push({ id, x, z, k });
    const VIALE = [4.2, 16, 7, 0], CIP = [['m-cip-c', 240], ['m-cip-a', 210], ['m-cip-b', 170]]; // i cipressi: distanza dal centro, il primo, il passo, quanti per fila; le tre forme con la loro altezza (js/mondo-gl.js ne disegna le ombre)
    for (let z = VIALE[1]; z < CASALE - 12; z += VIALE[2]) { const n = VIALE[3]++; metti(CIP[n % 3][0], -VIALE[0], z); metti(CIP[(n + 1) % 3][0], VIALE[0], z + VIALE[2] / 2); }
    for (let z = 19; z < CASALE - 18; z += 2.6) { metti('m-vite', -7.5 - caso() * 2, z, 0.85); metti('m-vite', 7.5 + caso() * 2, z + 1.3, 0.85); } // le prime più avanti: all'apertura non toccano il testo
    for (let i = 0; i < 14; i++) { const sx = !(i % 2); metti(caso() < 0.5 ? 'm-ulivo' : 'm-ulivo-b', (sx ? -1 : 1) * (16 + caso() * 12), (sx ? 60 : 26) + i * (sx ? 3 : 6) + caso() * 4, 0.9); } // a sinistra, dove c'è il titolo, solo lontani
    for (let i = 0; i < 6; i++) metti('m-muro', (i % 2 ? 1 : -1) * (11 + caso() * 6), 16 + i * 14, 0.32);
    metti('m-casale', 0, CASALE);
    cose.sort((a, b) => b.z - a.z); // i lontani si disegnano prima
    // il mondo in WebGL ha disegni suoi (11 nov, "un disegno migliore delle viti e dei muretti", presi dalle foto vere): gli alberelli a filari al posto delle viti a due foglie,
    // e i muretti a secco che corrono lungo il viale dietro i cipressi (girati di 90°, vanno verso il punto di fuga) al posto dei mucchietti di pietre. L'svg tiene i suoi
    // Il portone (solo WebGL e col movimento): i battenti si aprono arrivando e ci si ferma sulla soglia, con la famiglia fra i battenti aperti
    const apri = !reduce, MEZZA = ((66 * 56) / 74 / 2) * UM; // mezza porta, cioè un battente: 1,12 m (le misure di masseria() in tools/incidi_pagine_e.mjs)
    const coseGL = cose.filter((o) => !/vite|muro|ulivo/.test(o.id) && !(apri && o.id === 'm-casale')), MUR = 12; // un modulo di muretto: 960 unità, 12 metri
    if (apri) coseGL.push({ id: 'm-casale-gl', x: 0, z: CASALE }, { id: 'm-luce', x: 0, z: CASALE + 1.3, k: 1.25 }); // il casale col vano della porta bucato e, dietro, la luce: un foglio del colore della carta
    for (const x of mob ? [7.6] : [7.6, 10.3]) for (const s of [-1, 1]) for (let z = 6 + caso() * 2; z < CASALE - 16; z += mob ? 3 : 2.6) coseGL.push({ id: `m-alb-${'abc'[Math.floor(caso() * 3)]}`, x: s * (x + caso() * 0.6), z, k: 0.185 + caso() * 0.04, sp: caso() < 0.5, lod: 0.14 }); // lod basso: da lontano restano tronco e braccia, le foglie arrivano avvicinandosi
    for (let z = -24, n = 0; z < CASALE - 30; z += MUR, n++) for (const s of [-1, 1]) coseGL.push({ id: `m-muretto-${'ab'[(n + (s > 0)) % 2]}`, x: s * 5.8, z: s < 0 ? z : z + MUR, k: MUR / (960 * UM), ang: (-s * Math.PI) / 2, lod: 0.15 });
    // le aggiunte (11 nov, "va bene tutto tranne il 6"), ognuna in una riga: per toglierne una basta cancellarla
    for (const o of cose) if (/ulivo/.test(o.id)) coseGL.push({ id: `m-oliv-${caso() < 0.5 ? 'a' : 'b'}`, x: o.x, z: o.z, k: 0.66 + caso() * 0.2, sp: caso() < 0.5, lod: 0.3 }); // gli ulivi secolari al posto di quelli a foglie grandi, negli stessi punti
    coseGL.push({ id: 'm-pajara-p', x: 36, z: 52, k: 0.85, lod: 0.5 }); // una pajara, lontana, a destra oltre gli ulivi
    for (const s of [-1, 1]) for (let z = 3 + caso() * 3; z < CASALE - 32; z += (mob ? 6 : 3) + caso() * 4) for (let i = 0, n = 1 + Math.floor(caso() * 3); i < n; i++) coseGL.push({ id: 'm-papavero', x: s * (5.25 + caso() * 0.4), z: z + i * 0.35 + caso() * 0.3, k: 0.085 + caso() * 0.05, sp: caso() < 0.5 }); // i papaveri al piede dei muretti, dalla parte del viale
    // lunghezza focale in px e orizzonte. Il testo d'apertura non sta mai sopra i disegni: dove il primo cipresso di sinistra gli passerebbe sopra (telefono, finestre strette)
    // lo sguardo parte più alto, cioè l'orizzonte più in basso (o0), e torna dritto (o1) nei primi passi, mentre il testo se ne va (CAM.su); se non basta, si parte qualche metro più indietro (z0)
    let ot = null;
    const txA = $('.az-apre__tx', apre), ottica = () => (ot ??= (() => {
      const W = stA.clientWidth, H = stA.clientHeight, F = Math.min(H * 0.95, W * (mob ? 1 : 0.62)), o1 = H * 0.56, d = $('.e-d', txA), alto = (CIP[0][1] * UM - OCCHIO) * F, sotto = txA.offsetTop + txA.offsetHeight + 24;
      const nu = H * (mob ? 0.2 : 0.34); // le nuvole sopra l'orizzonte; sul telefono più basse: sotto il titolo
      // la soglia: ci si ferma dove gli stipiti del portone stanno ai bordi dello schermo (sul telefono appena fuori); fra i battenti aperti resta libera una colonna larga 'entro' per il testo
      const soglia = (F * MEZZA) / ((mob ? 0.75 : 0.46) * W), porta = { soglia, entro: 2 * F * (MEZZA / (soglia + MEZZA) - 0.02) - (mob ? 32 : 48) }; // 0,02: lo sguardo che segue il puntatore, sulla soglia, gira ancora di un grado
      if (W / 2 - ((VIALE[0] + 1.2) * F) / VIALE[1] > txA.offsetLeft + d.offsetLeft + d.offsetWidth + 56) return { W, H, F, o1, o0: o1, z0: 0, nu, ...porta }; // il cipresso passa accanto al testo (56 px: lo sguardo che segue il puntatore lo sposta)
      const o0 = Math.max(o1, Math.min(H * 0.8, sotto + alto / VIALE[1]));
      return { W, H, F, o1, o0, z0: Math.min(0, VIALE[1] - alto / Math.max(1, o0 - sotto)), nu: nu + (mob ? 0 : o0 - o1), ...porta }; // su desktop le nuvole restano dov'erano, non scendono sul testo con l'orizzonte
    })());
    // p: quanto del viale si è percorso, fino a FERMA o, col portone, fino alla soglia; porta: quanto sono aperti i battenti, dipende solo da dove si è (si aprono fra 34 e 12 metri dal casale)
    const CAM = { p: 0, terra: 1, neb: reduce ? 1 : 0, su: 0, calma: 0, soglia: false, get z() { const { z0, soglia } = ottica(), meta = this.soglia ? CASALE - soglia : FERMA; return z0 + (meta - z0) * this.p; },
      get porta() { const a = Math.max(0, Math.min(1, (this.z - (CASALE - 34)) / 22)); return a * a * (3 - 2 * a); } }, chiaro = (dz) => 0.32 + 0.68 * Math.max(0, Math.min(1, 1.25 - dz / 120)); // la foschia: più lontano, più chiaro
    // prova (11 nov, "farla meglio con una tecnologia leggera"): lo stesso mondo in WebGL2 senza librerie (js/mondo-gl.js). Con ?mondo=svg, o se WebGL2 manca, resta l'svg di prima
    const tela = $('.az-gl', apre), LONTANO = 1000, stile = getComputedStyle(az); // nuvole e colli a un chilometro
    const gl = window.MondoGL?.(tela, { defs: mondo, cose: coseGL, UM, CAM, ottica, OCCHIO, FRONTE: CASALE + 30, fermo: reduce, viale: VIALE, alte: CIP.map((c) => c[1] * UM), cielo: stile.getPropertyValue('--cielo').trim(), suolo: '#ebe3d6', ink: stile.getPropertyValue('--ink').trim(), vino: '#a98a4a',
      strati: [{ id: 'm-nuvole', alfa: 0.9, posa: ({ W, F, nu }) => [(W / 2300) * (LONTANO / F), (nu * LONTANO) / F, LONTANO] }, { id: 'm-colli', alfa: 0.55, posa: ({ W, F }) => [Math.max(0.8, (W / 2000) * (LONTANO / F)), 0, LONTANO] },
        // gli uccelli: tre, a 200 metri, attraversano il cielo da sinistra a destra e ricominciano; arrivano quando il testo d'apertura se n'è andato (CAM.su), così non gli passano dietro
        ...(!reduce ? [{ id: 'm-gabbiani', alfa: () => 0.85 * CAM.su, posa: ({ H, F }) => [(0.75 * 200) / F, (H * 0.27 * 200) / F, 200], vola: (t) => { const { W, F } = ottica(), m = ((W / 2 + 140) / F) * 200; return ((t * 7 + m * 0.7) % (2 * m)) - m; } }] : [])],
      mobili: apri ? [1, -1].map((s) => ({ id: 'm-battente', sp: s < 0, x: s * MEZZA, z: CASALE - 0.05, ang: () => (s * CAM.porta * Math.PI) / 2 })) : [] }); // i due battenti: lo stesso disegno, uno specchiato, girano sui cardini fino a 90°, contro i fianchi del vano
    let proietta;
    CAM.soglia = !!gl && apri; az.classList.toggle('az--porta', CAM.soglia);
    if (gl) { mondo.remove(); proietta = reduce ? gl.disegna : () => {}; new IntersectionObserver(([e]) => gl.vivo(e.isIntersecting)).observe(tela); } // col movimento il mondo si ridisegna da solo a ogni fotogramma: un disegno solo, non due
    else {
    tela.remove();
    const usa = (id) => { const u = document.createElementNS(NS, 'use'); u.setAttribute('href', `#${id}`); mondo.append(u); return u; }, riga = () => { const l = document.createElementNS(NS, 'line'); mondo.append(l); return l; };
    const forma = (c) => { const e = document.createElementNS(NS, 'path'); e.setAttribute('class', c); mondo.append(e); return e; };
    const nuvole = usa('m-nuvole'), colli = usa('m-colli'), suolo = forma('az3-suolo'), viale = forma('az3-strada'), strada = [riga(), riga()], SOLCHI = Array.from({ length: 30 }, (_, i) => ({ z: 3 + i * 4, el: riga() }));
    cose.forEach((o) => (o.el = usa(o.id)));
    proietta = () => {
      const { W, H, F, o0, o1, nu } = ottica(), oriz = o0 + (o1 - o0) * CAM.su, cx = W / 2, fronte = CAM.neb * (CASALE + 30);
      mondo.setAttribute('viewBox', `0 0 ${W} ${H}`);
      nuvole.setAttribute('transform', `translate(${cx} ${oriz - nu - CAM.z * 0.3}) scale(${W / 2300})`); nuvole.style.opacity = CAM.neb * 0.9;
      colli.setAttribute('transform', `translate(${cx} ${oriz}) scale(${(W / 2000) * (1 + CAM.z / 900)})`); colli.style.opacity = CAM.neb * 0.55;
      const s0 = F / 0.6; suolo.setAttribute('d', `M0 ${oriz}H${W}V${H}H0Z`); viale.setAttribute('d', `M${cx} ${oriz}L${cx + 2.4 * s0} ${oriz + OCCHIO * s0}L${cx - 2.4 * s0} ${oriz + OCCHIO * s0}Z`); suolo.style.opacity = viale.style.opacity = CAM.neb; // la terra e il viale più chiaro
      strada.forEach((l, i) => { const s = F / 0.6; l.setAttribute('x1', cx); l.setAttribute('y1', oriz); l.setAttribute('x2', cx + (i ? 1 : -1) * 2.4 * s); l.setAttribute('y2', oriz + OCCHIO * s); l.style.opacity = CAM.terra * CAM.neb * 0.7; });
      SOLCHI.forEach(({ z, el }) => { const dz = z - CAM.z; if (dz < 0.5 || z > fronte) { el.style.opacity = 0; return; } const s = F / dz, y = oriz + OCCHIO * s; el.setAttribute('x1', cx - 70 * s); el.setAttribute('x2', cx + 70 * s); el.setAttribute('y1', y); el.setAttribute('y2', y); el.style.opacity = CAM.terra * Math.max(0, Math.min(1, 1.15 - dz / 80)) * 0.45; });
      cose.forEach((o) => {
        const dz = o.z - CAM.z;
        if (dz < 0.4 || o.z > fronte + 8) { o.el.style.visibility = 'hidden'; return; }
        const s = F / dz, X = cx + o.x * s, Y = oriz + OCCHIO * s, k = s * UM * o.k;
        if (X < -W * 0.6 || X > W * 1.6) { o.el.style.visibility = 'hidden'; return; } // fuori dallo schermo
        o.el.style.visibility = ''; o.el.setAttribute('transform', `translate(${X.toFixed(1)} ${Y.toFixed(1)}) scale(${k.toFixed(4)})`);
        const vicino = o.id === 'm-vite' ? Math.max(0, Math.min(1, (dz - 1.5) / 4)) : Math.min(1, (dz - 0.4) / 1.4); // le viti se ne vanno prima di diventare enormi
        o.el.style.opacity = (chiaro(dz) * vicino * Math.min(1, (fronte + 8 - o.z) / 10)).toFixed(3);
      });
    };
    }
    const rimisura = () => { ot = null; gl?.misura(); if (CAM.soglia) stA.style.setProperty('--entro', `${Math.round(ottica().entro)}px`); proietta(); }; // la finestra è cambiata; la colonna del testo fra i battenti si rimisura
    if (CAM.soglia) stA.style.setProperty('--entro', `${Math.round(ottica().entro)}px`);
    if (reduce) { proietta(); addEventListener('resize', rimisura, { passive: true }); gsap.set(parole, { opacity: 1 }); pillola(); return; } // senza movimento: il viale fermo all'inizio
    // all'apertura il mondo esce dalla foschia, dal vicino al lontano; il titolo entra
    gsap.to(CAM, { neb: 1, duration: 2, ease: 'power1.out', delay: 0.2, onUpdate: proietta });
    proietta();
    document.fonts.ready.then(() => entra(tit.get($('h1', apre)), 0.4));
    gsap.fromTo([...$('.az-apre__tx', apre).children].filter((x) => !x.matches('[data-chars]')), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out', delay: 0.9 });
    gsap.set(fam.children, { opacity: 0, y: 26 });
    // scorrendo: il titolo se ne va, la camera cammina lungo il viale fino al casale (passo costante), alla fine la terra si svuota ed entra la famiglia
    const tlA = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: apre, pin: stA, start: 'top top', end: CAM.soglia ? '+=370%' : '+=320%', scrub: 0.6, invalidateOnRefresh: true, onRefresh: rimisura } }); // col portone la strada è più lunga: si arriva fino alla soglia
    tlA.to(txA, { y: -90, opacity: 0, duration: 0.12 }, 0)
      .to(CAM, { p: 1, duration: 1, ease: 'power1.inOut', onUpdate: proietta }, 0)
      .to(CAM, { su: 1, duration: 0.22, ease: 'power1.inOut' }, 0.04)
      .to(CAM, { terra: 0, duration: 0.12, onUpdate: proietta }, 0.86);
    // col portone: lo sguardo di lato si ferma avvicinandosi e la famiglia entra solo a camera ferma sulla soglia, quando i battenti aperti sono ai lati della colonna del testo
    if (CAM.soglia) tlA.to(CAM, { calma: 1, duration: 0.2 }, 0.78).to(fam.children, { opacity: 1, y: 0, duration: 0.1, stagger: 0.03 }, 1).fromTo(tit.get($('h2', fam)), { yPercent: 110 }, { yPercent: 0, duration: 0.14, stagger: 0.005 }, 1.01);
    else tlA.to(fam.children, { opacity: 1, y: 0, duration: 0.1, stagger: 0.03 }, 0.92).fromTo(tit.get($('h2', fam)), { yPercent: 110 }, { yPercent: 0, duration: 0.14, stagger: 0.005 }, 0.93);
    tlA.to({}, { duration: 0.12 });

    // filosofia (11 nov, "solo le due immagini in lungo"): le foto si aprono dal basso mentre dentro l'immagine si stringe, poi salgono a velocità diverse;
    // intanto la frase si accende parola per parola
    const fil = $('.az-fil', az), stF = $('.az-st', fil), foto = $$('.az-fil__f', fil), fotoI = foto.map((f) => $('img', f));
    alVedere(fil, () => entraTit($('h2', fil)), 'top 70%');
    gsap.set(foto, { clipPath: 'inset(100% 0% 0% 0% round 8px)' }); gsap.set(fotoI, { scale: 1.3 });
    const tlF = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: mob ? { trigger: fil, start: 'top 75%', end: 'bottom 85%', scrub: 0.6 } : { trigger: fil, pin: stF, start: 'top top', end: '+=150%', scrub: 0.6 } });
    tlF.to(foto, { clipPath: 'inset(0% 0% 0% 0% round 8px)', duration: 0.5, stagger: 0.18, ease: 'power2.out' }, 0)
      .to(fotoI, { scale: 1, duration: 0.9, stagger: 0.18, ease: 'power2.out' }, 0)
      .fromTo(foto[0], { y: 50 }, { y: -10, duration: 1.1 }, 0)
      .fromTo(foto[1], { y: 150 }, { y: -40, duration: 1.1 }, 0)
      .to(parole, { opacity: 1, duration: 0.6, stagger: { amount: 0.5 } }, 0.2);

    // i vitigni coi loro vini: in alto l'elenco dei vitigni, si accende quello che passa
    const vit = $('.az-vit', az), stV = $('.az-st', vit), vitLi = $$('.az-vit__l li', vit), bts = $$('.az-bt', vit), SPENTO = 0.38;
    alVedere(vit, () => entraTit($('h2', vit)), 'top 70%');
    gsap.set(vitLi, { opacity: SPENTO });
    let acceso = -1;
    const accendi = (k) => { if (k === acceso) return; acceso = k; vitLi.forEach((li, j) => gsap.to(li, { opacity: j === k ? 1 : SPENTO, duration: 0.3, overwrite: true })); };
    let tlV;
    // la ruota: le bottiglie stanno sul bordo di una ruota grande, incisa, col centro sotto lo schermo; scorrendo gira e porta in cima una bottiglia alla volta,
    // che si fa più grande; sotto, il suo nome (porta alla scheda) col vitigno e la denominazione
    const ru = $('.az-ruota', vit), cap = $('.az-ruota__cap', vit), capA = $('a', cap), capS = $('span', cap), N = Math.max(...bts.map((b) => +b.style.getPropertyValue('--k'))) + 1, perK = Object.fromEntries(bts.map((b) => [b.style.getPropertyValue('--k'), b]));
    let passo = 6, su = null;
    const misuraR = () => { const W = stV.clientWidth, bh = bts[0].offsetWidth / 0.4, R = Math.max(W * (mob ? 1.25 : 0.7), mob ? 480 : 900); passo = ((bh * 0.42) / R) * (180 / Math.PI); ru.style.setProperty('--R', `${R}px`); ru.style.setProperty('--passo', `${passo}deg`); };
    const gira = () => {
      const k = Math.round(-gsap.getProperty(ru, 'rotation') / passo), b = perK[Math.min(N - 1, k)];
      if (k < 0) { if (su) { su.classList.remove('is-su'); su = null; gsap.to(cap, { opacity: 0, duration: 0.2, overwrite: true }); } return; } // la ruota sta ancora arrivando
      if (!b || b === su) return;
      su?.classList.remove('is-su'); b.classList.add('is-su'); su = b;
      const w = D.byId[b.dataset.id]; capA.textContent = w.name; capA.href = FS.wineUrl(w.id); capA.dataset.wine = w.id; capS.textContent = `${VIT[b.dataset.i][0]} · ${w.denom}`;
      gsap.fromTo(cap, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out', overwrite: true });
      accendi(+b.dataset.i);
    };
    misuraR();
    tlV = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: vit, pin: stV, start: 'top top', end: `+=${N * 16}%`, scrub: 0.6, invalidateOnRefresh: true, onRefresh: misuraR } });
    gsap.set(cap, { opacity: 0 });
    tlV.fromTo(ru, { rotation: () => passo * 5 }, { rotation: () => -(N - 1) * passo, duration: 1, onUpdate: gira });
    gira(); accendi(0);
    tlV.to({}, { duration: 0.06 });

    // Salento, comune: il titolo entra, occhiello e testo salgono; la torre incisa si incide all'inizio
    const stS = $('.az-st', sal), box = $('.az-sal__foto', sal), scS = $('.az-sc', box), testoS = [$('.az-sal__tx .e-n', sal), $('.az-sal__d', sal)];
    alVedere(sal, () => entraTit($('h2', sal)), 'top 70%');
    gsap.set(testoS, { opacity: 0, y: 18 });
    alVedere(sal, () => gsap.to(testoS, { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out', stagger: 0.1, delay: 0.2 }), 'top 60%');
    const tlS = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: sal, pin: stS, start: 'top top', end: '+=220%', scrub: 0.6, invalidateOnRefresh: true } });
    incidi(tlS, scS, 0, 0.4);
    { // la griglia: si parte dentro la prima foto a tutto schermo, la camera arretra fino alla griglia dei luoghi
      const f0 = $('figure', box), caps = $$('figcaption', box);
      // misure di layout (offset), non i rettangoli: al refresh la griglia può essere già ingrandita
      const da = () => { const fw = f0.offsetWidth, fh = f0.offsetHeight, ox = f0.offsetLeft + fw / 2, oy = f0.offsetTop + fh / 2; return { k: Math.max(stS.clientWidth / fw, stS.clientHeight / fh) * 1.04, ox, oy, x: stS.clientWidth / 2 - (box.offsetLeft + ox), y: stS.clientHeight / 2 - (box.offsetTop + oy) }; };
      gsap.set(caps, { opacity: 0 });
      tlS.fromTo(box, { transformOrigin: () => `${da().ox}px ${da().oy}px`, scale: () => da().k, x: () => da().x, y: () => da().y }, { transformOrigin: () => `${da().ox}px ${da().oy}px`, scale: 1, x: 0, y: 0, duration: 1, ease: 'power2.inOut' }, 0.1)
        .to(caps, { opacity: 1, duration: 0.2, stagger: 0.04 }, 0.95)
        .to({}, { duration: 0.3 });
    }

    // sostenibilità: il campo si incide, i punti salgono dal fondo con una piccola rotazione e si impilano; quelli sotto arretrano in basso e spengono il testo
    const sost = $('.az-sost', az), stO = $('.az-st', sost), scO = $('.az-sc', sost), carte = $$('.az-carte > li', sost), PASSO = 0.75;
    alVedere(sost, () => entraTit($('h2', sost)), 'top 70%');
    gsap.set(carte, { yPercent: 118, rotation: 4 });
    const tlO = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: sost, pin: stO, start: 'top top', end: `+=${carte.length * 55}%`, scrub: 0.6,
      onUpdate: () => { const cima = Math.floor((tlO.time() - 0.5) / PASSO); carte.forEach((c, k) => c.classList.toggle('is-sotto', k < cima)); } } });
    incidi(tlO, scO, 0, 0.6);
    carte.forEach((c, i) => {
      tlO.to(c, { yPercent: 0, rotation: 0, duration: 0.6, ease: 'power2.out' }, i * PASSO + 0.2);
      carte.slice(0, i).forEach((p, k) => tlO.to(p, { y: (i - k) * 12, scale: 1 - (i - k) * 0.04, duration: 0.6, ease: 'power2.out' }, i * PASSO + 0.2));
    });
    tlO.to({}, { duration: 0.3 });

    // riconoscimenti anno per anno: a palco fermo il filo si traccia, poi un anno alla volta: l'anno grande sale cifra per cifra, le medaglie scendono
    // dal filo, a fine turno risalgono e arriva l'anno dopo
    const premi = $('.az-premi', az), stP = $('.az-st', premi), anniLi = $$('.az-premi__anni li', premi), gruppi = $$('.az-med', premi), grandi = $$('.az-premi__anno span', premi).map((s) => spezza(s)), txP = [...$('.az-premi__tx', premi).children];
    gsap.set(txP, { opacity: 0, y: 22 });
    alVedere(premi, () => gsap.to(txP, { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out', stagger: 0.08 }), 'top 60%');
    gsap.set(medaglie, { yPercent: -105 }); gsap.set(grandi.flat(), { yPercent: 110 }); gsap.set(anniLi, { opacity: SPENTO });
    const tlP = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: premi, pin: stP, start: 'top top', end: `+=${gruppi.length * 60}%`, scrub: 0.6 } });
    tlP.fromTo(premi, { '--or': 0 }, { '--or': 1, duration: 0.3 }, 0);
    gruppi.forEach((g, i) => {
      const at = 0.2 + i, med = $$('li', g);
      tlP.set(g, { visibility: 'visible' }, at).to(anniLi[i], { opacity: 1, duration: 0.15 }, at)
        .to(grandi[i], { yPercent: 0, duration: 0.35, stagger: 0.04, ease: 'power3.out' }, at)
        .to(med, { yPercent: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }, at + 0.05);
      if (i < gruppi.length - 1) tlP.to(med, { yPercent: -105, duration: 0.22, stagger: 0.03, ease: 'power2.in' }, at + 0.7).to(grandi[i], { yPercent: -110, duration: 0.22, stagger: 0.03, ease: 'power2.in' }, at + 0.7)
        .to(anniLi[i], { opacity: SPENTO, duration: 0.12 }, at + 0.86).set(g, { visibility: 'hidden' }, at + 1);
    });
    tlP.to({}, { duration: 0.3 });

    // fine: i due calici si incidono, poi si avvicinano e brindano (toccano il bordo e tornano un poco indietro); il testo entra sotto
    const fine = $('.az-fine', az), stE = $('.az-st', fine), scE = $('.az-brindisi', fine), sx = $('.sx', scE), dx = $('.dx', scE), txE = $('.az-fine__tx', fine);
    gsap.set([...txE.children].filter((x) => !x.matches('[data-chars]')), { opacity: 0, y: 18 });
    // i calici si incidono mentre la sezione entra (niente schermo vuoto), poi a palco fermo brindano e arriva il testo
    const tlE0 = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: fine, start: 'top 85%', end: 'top top', scrub: 0.6 } });
    incidi(tlE0, scE, 0, 1);
    const tlE = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: fine, pin: stE, start: 'top top', end: '+=100%', scrub: 0.6 } });
    if (sx && dx) tlE.to(sx, { x: 70, rotation: 10, svgOrigin: '-200 214', duration: 0.35, ease: 'power2.in' }, 0.05).to(dx, { x: -70, rotation: -10, svgOrigin: '200 214', duration: 0.35, ease: 'power2.in' }, 0.05)
      .to(sx, { x: 62, rotation: 8, duration: 0.15, ease: 'power1.out' }, 0.4).to(dx, { x: -62, rotation: -8, duration: 0.15, ease: 'power1.out' }, 0.4);
    tlE.to([...txE.children].filter((x) => !x.matches('[data-chars]')), { opacity: 1, y: 0, duration: 0.25, stagger: 0.05 }, 0.3)
      .fromTo(tit.get($('h2', txE)), { yPercent: 110 }, { yPercent: 0, duration: 0.3, stagger: 0.01 }, 0.25)
      .to({}, { duration: 0.25 });
    // la foto delle vigne si allarga fino a tutta la pagina e scende fino al footer
    gsap.fromTo($('.az-fine__f', fine), { clipPath: 'inset(8% 18% 0% 18% round 8px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'power2.out', scrollTrigger: { trigger: $('.az-fine__f', fine), start: 'top 95%', end: 'bottom bottom', scrub: 0.6 } });
    // arrivando dal selettore delle prove si riparte dai vini per vitigno
    if (new URLSearchParams(location.search).has('vit')) requestAnimationFrame(() => { const y = tlV.scrollTrigger.start + 2; FS.lenis ? FS.lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y); });

    // il cielo, dall'alba alla sera, lungo tutta la pagina
    const CIELI = [[243, 239, 234], [245, 238, 224], [245, 228, 208], [243, 218, 196]];
    ScrollTrigger.create({ trigger: az, start: 'top top', end: 'bottom bottom', onUpdate: (t) => { const p = t.progress * (CIELI.length - 1), i = Math.min(CIELI.length - 2, Math.floor(p)), f = p - i; az.style.setProperty('--cielo', `rgb(${CIELI[i].map((v, j) => Math.round(v + (CIELI[i + 1][j] - v) * f)).join(' ')})`); } });
    pillola();
    ScrollTrigger.refresh();
  };
  // la pillola "I nostri vini" non copre i testi: il suo trigger va creato dopo i pin, che allungano la pagina
  const pillola = () => { const P = $('.m-pill'); ScrollTrigger.create({ trigger: az, start: 'top bottom', end: 'bottom 60%', onToggle: (t) => P?.classList.toggle('in-storia', t.isActive) }); };

  // il mondo dell'apertura: i pezzi incisi (assets/incisioni/mondo.svg, da tools/incidi_pagine_e.mjs) entrano nelle <defs> del suo svg
  const mondo = fetch('assets/incisioni/mondo.svg').then((r) => r.text()).then((t) => {
    const m = $('.az-mondo', apre); m.insertAdjacentHTML('afterbegin', t.slice(t.indexOf('<defs>'), t.indexOf('</defs>') + 7));
    // dentro gli <use> le regole del css non arrivano: colori e linee vanno sui pezzi originali (gli stili in linea passano ai cloni, e var() si risolve lì)
    $$('defs path', m).forEach((p) => { p.setAttribute('vector-effect', 'non-scaling-stroke'); if (p.classList.contains('o')) p.style.fill = 'var(--cielo)'; else { p.setAttribute('fill', 'none'); p.setAttribute('stroke-linecap', 'round'); p.setAttribute('stroke-linejoin', 'round'); if (p.classList.contains('v')) p.style.stroke = 'var(--vino)'; } });
  }).catch(() => {});
  Promise.all([...scene.map(carica), mondo]).then(() => { costruisci(); az.classList.add('is-pronto'); });
  setTimeout(() => az.classList.add('is-pronto'), 2500); // se un disegno non arriva, la pagina si vede comunque
  addEventListener('resize', () => { misura(); }, { passive: true });
  $('.m-pill')?.classList.add('in-storia'); // finché i movimenti non sono pronti
})();
