/* PAGINE dello stile E "La giornata" (10 nov 2026): azienda-e.html e vino-e.html?id=<id di js/data.js>. Come la home E (js/moderna-e.js): palco fermo,
   si cammina in orizzontale scorrendo o trascinando, il disegno sopra il ripiano e i testi sotto. Ogni tappa ha un'incisione (assets/incisioni/, da
   tools/incidi_pagine_e.mjs) che si disegna da sola quando la tappa arriva, e resta disegnata. Il cielo si scalda camminando verso sera.
   Nella scheda del vino la bottiglia vera sta nella sua scena (quella della scheda della home: due per collezione), poi si fa da parte e accompagna
   il cammino; all'ultima tappa esce e arrivano gli altri vini della collezione. Unità delle incisioni: 600 = il riquadro, il ripiano a y = 214.
   Stile: css/moderna-e.css (palco, binario, testi) + css/pagine-e.css · Dipende da: gsap, FS (main.js), FS.mk (moderna-kit.js) */
(() => {
  const { $, $$, reduce, clamp, ss, spezza, entra, titoli, apri } = FS.mk, D = FS.data;
  const sec = $('.pe'), PIEDE = 214, SOPRA = 514; // dall'alto del riquadro (-300) al ripiano
  $$('.foot a[href^="#"]').forEach((a) => { if (!document.getElementById(a.hash.slice(1))) a.href = FS.home + a.hash; }); // ancore della home nel footer comune
  const mob = () => innerWidth <= 860;
  // 10 nov, "proverei a fare anche una versione verticale": le stesse tappe una sotto l'altra. 11 nov: si apre in verticale, l'orizzontale resta con &v=oriz e il selettore, per farle vedere alla cliente
  const VERT = !sec.classList.contains('pe--vino') || new URLSearchParams(location.search).get('v') !== 'oriz'; // 11 nov: l'azienda solo in verticale, "racconta meglio" (foto, sostenibilità)
  const breve = (w) => w.name.replace(/^(Collezione 53|125 Organic|125|Terra)\s+/, '').replace(/\s+(Organic|Edition)$/, ''); // come i nomi sul ripiano della home E

  /* ---- la scheda del vino: le tappe si fanno dai dati ---- */
  let w = null;
  if (sec.classList.contains('pe--vino')) {
    w = FS.wine(new URLSearchParams(location.search).get('id'));
    if (!w) { // link vecchio o id sbagliato: si propone la cantina
      sec.outerHTML = `<section class="pe-vuoto" data-subito><h1 class="e-t" data-chars>Vino non trovato.</h1><p class="e-d">Il link non porta a nessuno dei nostri vini. Puoi sceglierne uno dalla cantina.</p><div class="e-cta"><button class="btn btn--gold" type="button">Apri i nostri vini</button></div></section>`;
      $('.pe-vuoto .btn').addEventListener('click', () => apri());
      titoli();
      return;
    }
    const c = FS.collection(w.collection), fra = D.wines.filter((x) => x.collection === w.collection), n = fra.indexOf(w), altri = fra.filter((x) => x !== w);
    document.title = `${w.name} · Feudi Salentini`;
    $('meta[name="description"]').content = `${w.name}, ${w.denom}. ${w.desc}`.slice(0, 300);
    // la scena della bottiglia è quella della scheda della home E (FS.mk.scenaE): nella stessa collezione si alternano e dal terzo vino si specchiano; il mare solo ai vini da pesce
    const sua = FS.mk.scenaE(w)[0], usate = new Set([sua]), scegli = (...k) => { const s = k.find((x) => !usate.has(x)) || k[0]; usate.add(s); return s; };
    const TIPO = { rosso: 'Rosso', rosato: 'Rosato', bianco: 'Bianco', dolce: 'Dolce' }, METALLO = ['Oro', 'Argento', 'Bronzo', 'Seal of Approval'];
    const cibi = w.foods.map((f) => D.foods.find((x) => x.id === f)).filter(Boolean);
    const ps = [...w.premi].sort((a, b) => b.anno - a.anno || METALLO.indexOf(a.medaglia) - METALLO.indexOf(b.medaglia));
    const fatti = [TIPO[w.tipo] || w.tipo, w.uve, w.alcool].filter(Boolean).join(' · ');
    const T = [
      { k: sua, sp: n % 4 > 1, via: true, h: `<div class="e-h"><button class="e-n pe-col" type="button">${c.name}</button><h1 class="e-t2" id="pe-t" data-chars data-ritardo="0.4">${w.name}</h1></div><p class="e-d">${w.denom}<span class="pe-fatti">${fatti}</span></p><div class="e-cta"><button class="btn btn--gold" type="button" data-vai="1">Scopri il vino</button></div>` },
      { k: scegli('grappolo', 'vite'), lungo: true, n: TIPO[w.tipo] || 'Il vino', t: w.uve || w.denom, h: `<p class="e-d">${w.desc}</p>` },
      { k: scegli('calici', 'pergola'), n: 'Nel calice', t: ['La vista.', 'La vista e il profumo.'][w.aromi.length] ?? 'La vista e i profumi.', h: `<p class="e-d">${w.vista}</p><p class="pe-parole">${w.aromi.join(' · ')}</p>` },
      w.abb && { k: scegli('pergola', 'ulivo'), n: 'Abbinamenti', t: 'In tavola.', h: `<p class="e-d">${w.abb}</p>${cibi.length ? `<ul class="pe-piatti">${cibi.map((f) => `<li><img src="assets/incisioni/piatti/${f.id}.svg" alt="" width="80" height="80" loading="lazy" decoding="async"><span>${f.label}</span></li>`).join('')}</ul>` : ''}` },
      { k: scegli('filari', 'vite', 'campo'), lungo: true, n: 'Vigna e cantina', t: 'In vigna e in cantina.', h: `<p class="e-d">${w.tecnica}</p><dl class="pe-dati">${[['Zona', w.zona], ['Resa', w.resa], ['Gradazione', w.alcool]].filter(([, v]) => v).map(([a, b]) => `<div><dt>${a}</dt><dd>${b}</dd></div>`).join('')}</dl>` },
      // 10 nov, "i riconoscimenti li farei più visibili": le medaglie vere, grandi, appese a nastri incisi al posto dell'incisione; sul telefono i concorsi vanno nel testo
      ps.length && { k: VERT ? 'medaglia' : 0, med: true, n: 'Concorsi internazionali', t: ps.length === 1 ? 'Un riconoscimento.' : `${ps.length} riconoscimenti.`, h: `<p class="e-d">Nei concorsi internazionali, ${ps.at(-1).anno === ps[0].anno ? `nel ${ps[0].anno}` : `dal ${ps.at(-1).anno} al ${ps[0].anno}`}.<span class="pe-conc"> ${[...new Set(ps.map((p) => p.concorso))].join(', ')}.</span></p>` },
      altri.length && { fila: true, n: 'Vini consigliati', t: `Gli altri vini di ${c.name}.`, h: `<p class="e-d">La linea ${c.line}, ${fra.length} vini.</p><div class="e-cta"><button class="btn btn--line" type="button" data-tutti>Tutti i ${D.wines.length} vini</button></div>` }
    ].filter(Boolean);
    let num = 0;
    $('.e-track', sec).innerHTML = T.map((t) => t.via
      ? `<div class="e-tappa e-tappa--via" data-subito><div class="pe-quadro" data-scena="${t.k}"${t.sp ? ' data-specchio' : ''}></div><div class="e-testo">${t.h}</div></div>`
      : `<article class="e-tappa${t.fila ? ' e-tappa--fila' : ''}${t.lungo ? ' pe-lungo' : ''}" aria-labelledby="pe-${++num}">${t.k ? `<div class="pe-quadro" data-scena="${t.k}"></div>` : ''}${t.fila ? `<ul class="pe-fila">${altri.map((x) => `<li style="--b:${x.fondo}"><a href="${FS.wineUrl(x.id)}" data-wine="${x.id}"><img src="${x.bottle}" alt="" decoding="async" loading="lazy" draggable="false"><span>${breve(x)}</span></a></li>`).join('')}</ul>` : ''}${t.med ? `<i class="pe-asta" aria-hidden="true"></i><ul class="pe-appese">${ps.map((p) => `<li><svg class="pe-nastro" viewBox="0 0 40 100" preserveAspectRatio="none" aria-hidden="true"><path class="n" d="M6 0L17 100M34 0L23 100"/><path class="h" d="M21 12L32 1M21 26L33 13M20 40L32 27M20 54L31 42M19 68L29 58M19 82L27 74M18 96L24 90"/></svg><img src="${p.img}" alt="${p.concorso}, ${p.medaglia.toLowerCase()} ${p.anno}" loading="lazy" decoding="async" draggable="false"><p><b>${p.medaglia} · ${p.anno}</b><span>${p.concorso}</span></p></li>`).join('')}</ul>` : ''}<div class="e-testo"><div class="e-h"><p class="e-n">${String(num).padStart(2, '0')} · ${t.n}</p><h2 class="e-t2" id="pe-${num}">${t.t}</h2></div>${t.h}</div></article>`).join('');
    $('.e-stage', sec).insertAdjacentHTML('beforeend', `<img class="pe-bt" src="${w.bottle}" alt="${w.name}" decoding="async" draggable="false">`);
    sec.style.setProperty('--vino', w.color);
    $('.pe-col', sec).addEventListener('click', () => apri(c.id));
    $('[data-tutti]', sec)?.addEventListener('click', () => apri());
  } else {
    // azienda: numeri dei riconoscimenti dai dati, come azienda.html
    const tutti = D.wines.flatMap((x) => x.premi), anni = tutti.map((p) => p.anno), conc = D.awards.map((a) => a.name);
    $$('[data-premi-totale]').forEach((el) => (el.textContent = tutti.length));
    $('.pe-premi').textContent = `Dal ${Math.min(...anni)} al ${Math.max(...anni)}, per ${D.wines.filter((x) => x.premi.length).length} dei nostri vini: ${conc.slice(0, -1).join(', ')} e ${conc.at(-1)}. Ogni scheda del vino mostra i suoi.`;
  }

  const stage = $('.e-stage', sec), track = $('.e-track', sec), alto = $('.e-alto', sec), tappe = $$('.e-tappa', sec), N = tappe.length;
  const bt = $('.pe-bt', sec), fila = $$('.pe-fila li', sec), FILA = tappe.findIndex((t) => t.classList.contains('e-tappa--fila'));
  if (w) {
    const u = (o) => `vino-e.html?id=${encodeURIComponent(w.id)}${o ? '&v=oriz' : ''}`;
    document.body.insertAdjacentHTML('beforeend', `<nav class="pe-alt${VERT ? '' : ' pe-alt--o'}" aria-label="Versioni da confrontare"><a href="${u(0)}" aria-current="${VERT}">Verticale</a><a href="${u(1)}" aria-current="${!VERT}">Orizzontale</a></nav>`);
  }
  if (VERT) { sec.classList.add('pe--vert'); sec.removeAttribute('data-nav-trasparente'); if (bt) tappe[0].append(bt); }
  if (VERT && $('.pe-appese', sec)) { // 11 nov, "i riconoscimenti su un'unica riga": in verticale medaglie e asta stanno nella fascia, accanto a titolo e testo
    const ap = $('.pe-appese', sec), t = ap.closest('.e-tappa'), riga = document.createElement('div');
    riga.className = 'pe-premi-riga'; riga.append($('.pe-asta', t), ap); $('.e-testo', t).append(riga); t.classList.add('pe-premi-v');
  } // in verticale l'header torna pieno scorrendo, come nelle pagine normali
  // le medaglie appese: scendono col loro nastro quando arriva la tappa
  const cala = (t) => { const li = $$('.pe-appese li', t); if (!li.length || t._cala) return; t._cala = true; if (!reduce) gsap.fromTo(li, { y: -90, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: 'expo.out', stagger: 0.12 }); };
  if (!reduce) gsap.set($$('.pe-appese li', sec), { opacity: 0 });

  /* ---- le incisioni: si caricano tutte subito, si disegnano quando la loro tappa arriva ---- */
  const quadri = tappe.map((t) => $('.pe-quadro', t));
  const disegna = (q) => {
    if (!q || q._fatto) return; q._fatto = true;
    if (!q._svg || reduce) return; // senza movimento sono già disegnate; se il disegno non è ancora arrivato, si disegna all'arrivo
    gsap.to($$('.t', q), { strokeDashoffset: 0, duration: 0.9, stagger: { amount: 1.2 }, ease: 'power1.inOut', overwrite: true });
    gsap.to($$('.o', q), { opacity: 1, duration: 0.35, stagger: { amount: 0.7 }, delay: 0.1, overwrite: true });
  };
  quadri.forEach((q) => q && fetch(`assets/incisioni/${q.dataset.scena}${VERT && !mob() && q.closest('.e-tappa--via') ? '-largo' : ''}.svg`).then((r) => (r.ok ? r.text() : Promise.reject(r.status))).then((s) => {
    q.innerHTML = s; q._svg = $('svg', q); q._vb = q._svg.viewBox.baseVal.width || 600;
    if ('specchio' in q.dataset) q._svg.style.scale = '-1 1';
    q.style.setProperty('--vbw', q._vb);
    if (!reduce) { gsap.set($$('.t', q), { strokeDashoffset: 1 }); gsap.set($$('.o', q), { opacity: 0 }); }
    if (q._fatto) { q._fatto = false; disegna(q); }
  }).catch(() => {}));

  /* ---- misure ---- */
  let W = 0, H = 0, edge = 0, bh = 0, X = [], fine = 1, cam = 0, dest = 0, Bx = 0;
  const T0 = () => (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 76) + 10;
  const misura = () => {
    const m = mob(), hv = alto.offsetHeight || innerHeight, q = stage.getBoundingClientRect(); W = q.width; H = q.height;
    edge = hv * (m ? (w ? 0.5 : 0.6) : 0.72); // sul telefono la scheda tiene più ripiano: descrizione e note di cantina sono lunghe
    const U = Math.min((edge - T0()) / SOPRA, (W * (m ? 1.02 : 0.9)) / 600); // l'incisione riempie l'altezza sopra il ripiano; sul telefono può uscire di poco ai lati
    bh = Math.min((edge + 14 - (m ? 150 : 190)) / 0.91, m ? W * 0.95 : 1e4);
    Bx = W * (m ? 0.2 : 0.3);
    stage.style.setProperty('--edge', `${edge}px`); stage.style.setProperty('--u', `${U}px`); stage.style.setProperty('--bh', `${bh}px`); stage.style.setProperty('--w', `${W}px`);
    // le medaglie: in fila sopra il ripiano (sul telefono, se sono più di tre, su due file), ognuna col suo nastro fino in cima
    // in verticale (11 nov: "c'è molto spazio") ogni tappa è alta quanto il suo disegno più i testi: il filo di ciascuna sta sotto il disegno
    if (VERT) tappe.forEach((t, i) => t.style.setProperty('--edge', `${(i ? (m ? 56 : 96) : T0() + 8) + SOPRA * U}px`)); // aria sopra ogni disegno: la tappa comincia lì
    // l'apertura in verticale riempie il primo schermo: il disegno arriva fin dove comincia la fascia col nome, che chiude lo schermo
    let e0 = edge, U0 = U;
    if (VERT) { const sh0 = $('.e-testo', tappe[0]).offsetHeight; e0 = Math.max(hv - sh0, T0() + 320); U0 = Math.min((e0 - T0() - 8) / SOPRA, (W * (m ? 1.02 : 0.9)) / 600); tappe[0].style.setProperty('--edge', `${e0}px`); tappe[0].style.setProperty('--u', `${U0}px`); }
    const ap = $('.pe-appese', sec);
    if (ap && VERT) ap.style.setProperty('--m', `${m ? 56 : 104}px`); // sul telefono cinque medaglie stanno su una riga sotto l'asta
    else if (ap) {
      const li = [...ap.children], n = li.length, rows = m && n > 3 ? 2 : 1, per = Math.ceil(n / rows), cx = W * (VERT ? 0.5 : m ? 0.67 : 0.62), area = W * (VERT ? (m ? 0.9 : 0.7) : m ? 0.62 : 0.56), g = m ? 14 : 28; // sul telefono a destra della bottiglia
      // appese a un'asta incisa (11 nov: "non le terrei appese nel vuoto"); in verticale l'asta sta subito sopra le medaglie, che arrivano quasi al filo
      const sz = Math.min(m ? 96 : 150, area / per - g), capH = m ? 0 : 64, l0 = VERT ? (m ? 28 : 44) : Math.max(24, (edge - T0()) * (m ? 0.08 : 0.14));
      const eT = VERT ? parseFloat(ap.closest('.e-tappa').style.getPropertyValue('--edge')) : edge, top = VERT ? eT - (l0 + rows * sz + (rows - 1) * (m ? 16 : 76) + capH + (m ? 20 : 32)) : T0();
      li.forEach((el, i) => { const r = Math.floor(i / per), k = i % per, nr = Math.min(per, n - r * per); el.style.cssText += `;--x:${cx + (k - (nr - 1) / 2) * (sz + g)}px;--m:${sz}px;--l:${l0 + r * (sz + (m ? 16 : 76))}px;top:${top}px;z-index:${rows - r}`; }); // la seconda fila coi nastri dietro la prima
      const xs = li.map((el) => parseFloat(el.style.getPropertyValue('--x')));
      $('.pe-asta', ap.parentNode).style.cssText = `left:${Math.min(...xs) - sz / 2 - 28}px;width:${Math.max(...xs) - Math.min(...xs) + sz + 56}px;top:${top - 3}px`;
    }
    if (VERT) { X = tappe.map(() => 0); fine = 1; if (fila.length) { const ul = $('.pe-fila', sec), av = ul.clientWidth - 2 * parseFloat(getComputedStyle(ul).paddingLeft), s = m ? 104 : clamp((av - 8) / fila.length, 80, 132); stage.style.setProperty('--bh2', `${m ? bh * 0.75 : Math.min(bh * 0.75, s * 3.2)}px`); stage.style.setProperty('--s', `${s}px`); } }
    else X = tappe.map((t, i) => { t.style.left = `${i * W}px`; return i * W; });
    // l'ultima tappa della scheda: gli altri vini in fila; se non stanno in uno schermo il cammino continua finché passano tutti (in verticale la fila va a capo: css)
    if (!VERT && fila.length) {
      const bh2 = bh * 0.75, s = Math.max(bh2 * 0.42, m ? 92 : 112), x0 = Math.max(W * (m ? 0.06 : 0.1), (W - fila.length * s) / 2); // pochi vini: al centro
      stage.style.setProperty('--bh2', `${bh2}px`); stage.style.setProperty('--s', `${s}px`);
      fila.forEach((li, i) => li.style.setProperty('--x', `${x0 + (i + 0.5) * s}px`));
      fine = X[N - 1] + Math.max(0, x0 + fila.length * s + W * 0.08 - W);
    } else fine = X[N - 1];
    if (!VERT) sec.style.height = `${100 + (Math.max(fine, W) / W) * 120}lvh`;
    if (bt) { const b0 = VERT ? Math.min((e0 + 14 - (m ? 150 : 190)) / 0.91, m ? W * 0.95 : 1e4) : bh; bt.style.height = `${b0}px`; bt.style.top = `${e0 - b0 * w.fondo}px`; if (VERT) bt.style.left = `${W / 2}px`; }
  };
  const corsa = () => sec.offsetHeight - stage.offsetHeight;
  const vai = (n) => { if (VERT) return FS.lenis ? FS.lenis.scrollTo(tappe[n], { duration: 1.2 }) : tappe[n].scrollIntoView({ behavior: 'smooth' }); const y = sec.getBoundingClientRect().top + scrollY + (X[n] / fine) * corsa(); FS.lenis ? FS.lenis.scrollTo(y, { duration: 1.4 + Math.abs(n - cam / W) * 0.3 }) : scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' }); };
  $$('[data-vai]', sec).forEach((b) => b.addEventListener('click', () => vai(+b.dataset.vai)));

  /* ---- si trascina il palco: col dito o col mouse si cammina (solo in orizzontale: in verticale scorre la pagina), come la home E ---- */
  let tira = null, tirato = false;
  stage.addEventListener('pointerdown', (e) => { if (VERT || e.target.closest('a, button')) return; tira = { x: e.clientX, y: e.clientY, s: scrollY, su: false, id: e.pointerId }; tirato = false; });
  stage.addEventListener('pointermove', (e) => {
    if (!tira || e.pointerId !== tira.id) return;
    const d = e.clientX - tira.x, dy = e.clientY - tira.y;
    if (!tira.su) { if (Math.abs(d) < 8 || Math.abs(d) < Math.abs(dy)) return; tira.su = true; stage.setPointerCapture(e.pointerId); stage.classList.add('is-tira'); }
    const y = tira.s - ((d * corsa()) / fine) * 1.2; FS.lenis ? FS.lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y);
  });
  const lascia = () => { if (tira?.su) tirato = true; tira = null; stage.classList.remove('is-tira'); };
  stage.addEventListener('pointerup', lascia); stage.addEventListener('pointercancel', lascia);
  stage.addEventListener('click', (e) => { if (tirato) { e.stopPropagation(); e.preventDefault(); tirato = false; } }, true);

  /* ---- i titoli delle tappe salgono lettera per lettera quando la tappa arriva ---- */
  const tit = tappe.map((t) => { const h = $('h2.e-t2', t); if (!h) return null; const ch = spezza(h); if (!reduce) gsap.set(ch, { yPercent: 110 }); return ch; });

  /* ---- il cielo: dall'alba alla sera, come i CIELI della home E; i fondi pieni delle incisioni prendono lo stesso colore ---- */
  const CIELI = [[0, [243, 239, 234]], [0.45, [245, 238, 224]], [0.8, [245, 228, 208]], [1, [243, 218, 196]]];
  const cielo = (p) => { let i = 0; while (i < CIELI.length - 2 && p > CIELI[i + 1][0]) i++; const [a, ca] = CIELI[i], [b, cb] = CIELI[i + 1], f = clamp((p - a) / (b - a)); return `rgb(${ca.map((v, j) => Math.round(v + (cb[j] - v) * f)).join(' ')})`; };

  /* ---- il giro ---- */
  let prima = performance.now(), misW = 0, misH = 0, colore = '';
  const giro = (now) => {
    requestAnimationFrame(giro);
    const dt = Math.min(60, now - prima); prima = now;
    if (innerWidth !== misW || alto.offsetHeight !== misH) { misW = innerWidth; misH = alto.offsetHeight; misura(); }
    const q = sec.getBoundingClientRect(); if (q.bottom < 0 || q.top > innerHeight) return;
    dest = clamp(-q.top / Math.max(1, corsa())) * fine;
    cam += (dest - cam) * (reduce ? 1 : 1 - Math.exp(-dt / 110)); if (Math.abs(dest - cam) < 0.1) cam = dest;
    track.style.transform = `translate3d(${-cam}px,0,0)`;
    const c = cielo(cam / Math.max(1, fine)); if (c !== colore) { colore = c; stage.style.setProperty('--pe-cielo', c); }
    tappe.forEach((t, i) => {
      const resta = i === N - 1 ? Math.max(0, cam - X[i]) : 0, d = X[i] - cam + resta; // l'ultima tappa: i testi restano mentre passano gli altri vini
      if (d < W * 0.55) { disegna(quadri[i]); cala(t); if (tit[i] && !t._su) { t._su = true; if (!reduce) entra(tit[i]); } }
      if (Math.abs(d) > W * 1.3) return;
      const tx = t._t ?? (t._t = [...$('.e-testo', t).children]);
      tx.forEach((el, k) => (el.style.translate = `${d * (0.1 + k * 0.12) + resta}px 0`));
      const o = 1 - ss(clamp((Math.abs(d) - W * 0.1) / (W * 0.36)));
      if (o !== t._o) { t._o = o; const el = $('.e-testo', t); el.style.opacity = o; el.style.visibility = o > 0.01 ? 'visible' : 'hidden'; }
    });
    if (bt) { // la bottiglia: al centro della sua scena, poi si fa da parte; all'ultima tappa esce col paesaggio
      const via = FILA > 0 ? Math.max(0, cam - (X[FILA] - W * (mob() ? 0.95 : 0.8))) : 0;
      bt.style.left = `${W / 2 + (Bx - W / 2) * ss(clamp(cam / (W * 0.7))) - via}px`;
    }
  };

  misura(); sec.classList.add('is-pronto');
  titoli();
  const P = $('.m-pill'); P?.classList.add('in-storia'); // la pillola "I nostri vini" non copre i testi del ripiano, come nella home E
  ScrollTrigger.create({ trigger: sec, start: 'top bottom', end: 'bottom 60%', onToggle: (s) => P?.classList.toggle('in-storia', s.isActive) });
  if (!reduce) {
    gsap.fromTo($$('.e-testo > :not(.e-h, .e-t)', tappe[0]), { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'expo.out', stagger: 0.08, delay: 0.9 });
    if (bt) gsap.fromTo(bt, { marginTop: 40, opacity: 0 }, { marginTop: 0, opacity: 1, duration: 1.2, ease: 'expo.out', delay: 0.5 }); // niente y: gsap riscriverebbe il translate -50% che la centra
  }
  disegna(quadri[0]);
  if (VERT) { // una tappa sotto l'altra (disegno su carta crema, testi sulla fascia di pietra sotto il filo): il disegno e le medaglie arrivano entrando in vista
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (!e.isIntersecting) return; const t = e.target, i = tappe.indexOf(t); disegna(quadri[i]); cala(t); if (tit[i] && !t._su) { t._su = true; if (!reduce) entra(tit[i]); } io.unobserve(t); }), { rootMargin: '0px 0px -30% 0px' });
    tappe.forEach((t) => io.observe(t));
    addEventListener('resize', () => { if (innerWidth !== misW) { misW = innerWidth; misura(); } });
  } else requestAnimationFrame(giro);
})();
