/* PAGINE dello stile della home index, a matita e acquerello (10 nov 2026): azienda-i.html e vino-i.html?id=<id di js/data.js>.
   Azienda: capitoli su carta, ogni foto vera entra "dallo schizzo alla foto" come le news della home (cornice a matita, la foto si sviluppa dal basso,
   la nota a matita sotto); i loghi dei premi cerchiati a matita come nella home.
   Vino: in apertura la forma del vino, come il risultato di "Disegna il tuo vino" (js/disegna.js): la sua forma ad acquerello nel suo colore, il tratteggio,
   il contorno a matita della bottiglia, la foto vera che si sviluppa dentro, gli aromi disegnati attorno; sotto la scheda coi dati veri.
   Dipende da: js/matita.js, js/aromi.js, gsap, FS (main.js) · Stile: css/disegna.css (testi della forma) + css/home.css + css/pagine-i.css */
(() => {
  const M = Matita, D = FS.data, $ = (q, r = document) => r.querySelector(q), $$ = (q, r = document) => [...r.querySelectorAll(q)];
  const reduce = FS.reduce, tel = () => innerWidth <= 860;
  $$('.foot a[href^="#"]').forEach((a) => { if (!document.getElementById(a.hash.slice(1))) a.href = FS.home + a.hash; }); // ancore della home nel footer comune
  const vista = (el, fn) => ScrollTrigger.create({ trigger: el, start: 'top 78%', once: true, onEnter: fn });
  const rectIn = (el, cv) => { const a = el.getBoundingClientRect(), b = cv.getBoundingClientRect(); return { x: a.left - b.left, y: a.top - b.top, w: a.width, h: a.height }; };
  const graf = (pts, w = 1.5) => M.stroke(pts, { w, amp: 1 });
  const breve = (w) => w.name.replace(/^(Collezione 53|125 Organic|125|Terra)\s+/, '').replace(/\s+(Organic|Edition)$/, '');
  const titoli = () => $$('[data-righe]').forEach((el) => FS.righe(el));

  // dallo schizzo alla foto, come le news della home (js/home.js): cornice a matita, la foto si sviluppa dal basso dentro la cornice, poi la nota
  const schizzo = (fig) => {
    const img = $('img', fig), nota = $('figcaption', fig), cv = document.createElement('canvas'), k = { p: reduce ? 1 : 0 };
    cv.className = 'schizzo'; cv.setAttribute('aria-hidden', 'true'); fig.append(cv);
    let segno = null;
    const sh = new M.Sheet(cv, (ctx, f) => { if (segno) { segno.progress = k.p; M.draw(ctx, segno, f); } }, () => { const r = rectIn(img, cv), a = 5; segno = graf([[r.x - a, r.y - 3], [r.x + r.w + 4, r.y - a], [r.x + r.w + a, r.y + r.h + 4], [r.x - 4, r.y + r.h + a], [r.x - a - 1, r.y - 1]], 1.4); });
    if (reduce) return;
    gsap.set(img, { clipPath: 'inset(100% 0% 0% 0%)' }); if (nota) gsap.set(nota, { opacity: 0, y: 10 });
    vista(fig, () => gsap.timeline({ onUpdate: () => sh.kick(150) })
      .to(k, { p: 1, duration: 0.8, ease: 'power1.inOut' }, 0)
      .to(img, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'expo.out' }, 0.55)
      .to(nota || [], { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0.9));
  };
  // il foglio a matita sopra una lista, come quello dei premi della home: .pr-wrap e .pr-canvas di css/base.css e css/home.css
  const tela2 = (ul) => { const wrap = document.createElement('div'), cv = document.createElement('canvas'); wrap.className = 'pr-wrap'; cv.className = 'pr-canvas'; cv.setAttribute('aria-hidden', 'true'); ul.before(wrap); wrap.append(ul, cv); return cv; };
  // cerchi a matita attorno a una fila di immagini (i loghi dei premi della home, le medaglie del vino); prima il cerchio, poi l'immagine dentro
  const cerchia = (ul, sel, frecce = false) => {
    const cv = tela2(ul);
    let cerchi = [], p = reduce ? 1 : 0;
    const sh = new M.Sheet(cv, (ctx, f) => cerchi.forEach((t, i) => { t.progress = M.clamp(p * ((cerchi.length - 1) * 0.6 + 1) - i * 0.6); M.draw(ctx, t, f); }), () => {
      cerchi = $$(sel, ul).map((el, i) => { const r = rectIn(el, cv); return graf(M.ellipse(r.x + r.w / 2, r.y + r.h / 2, r.w / 2 + 11, r.h / 2 + 9, 0.1 * (i % 2 ? 1 : -1), -2.2 + i, 1.12, 56), 1.6); });
      if (frecce) cerchi = cerchi.flatMap((t, i) => { const el = $$(sel, ul)[i], r = rectIn(el, cv), q = rectIn($('p', el.closest('li')), cv), x = r.x + r.w / 2; return [t, graf(M.smooth([[x + 4, r.y + r.h + 14], [x - 6, (r.y + r.h + q.y) / 2 + 4], [q.x + q.w / 2, q.y - 6]]), 1.3)]; }); // la freccia dopo il suo cerchio
    });
    const imgs = $$(`${sel} img`, ul);
    if (reduce) return;
    gsap.set(imgs, { opacity: 0, scale: 0.86 });
    vista(ul, () => {
      gsap.to({ v: 0 }, { v: 1, duration: 2.2, ease: 'none', onUpdate() { p = this.targets()[0].v; sh.kick(200); } });
      gsap.to(imgs, { opacity: 1, scale: 1, duration: 0.7, ease: 'power2.out', delay: 0.45, stagger: (2.2 * 0.6) / (Math.max(1, imgs.length - 1) * 0.6 + 1) });
    });
  };

  if (!document.body.classList.contains('page-vi')) {
    /* ---- azienda ---- */
    $('#pr-t').textContent = `${D.wines.flatMap((w) => w.premi).length} riconoscimenti.`; // testo semplice: FS.righe divide l'HTML per spazi e spezzerebbe un tag interno
    const anni = D.wines.flatMap((w) => w.premi.map((p) => p.anno)), conc = D.awards.map((x) => x.name);
    $('#premi .t-lead').textContent = `Dal ${Math.min(...anni)} al ${Math.max(...anni)}, per ${D.wines.filter((w) => w.premi.length).length} dei nostri vini: ${conc.slice(0, -1).join(', ')} e ${conc.at(-1)}. Ogni scheda del vino mostra i suoi.`;
    const ul = $('.pi-premi');
    ul.innerHTML = D.awards.map((a) => `<li><a href="${a.url}" target="_blank" rel="noopener"><span class="pr-logo"><img src="${a.logo}" alt="${a.name}" loading="lazy" decoding="async"></span><span class="pr-n">${a.name}</span><span class="pr-t">${a.text}</span></a></li>`).join('');
    $$('.pi-f').forEach(schizzo);
    cerchia(ul, '.pr-logo');
    titoli();
    return;
  }

  /* ---- la scheda del vino ---- */
  const w = FS.wine(new URLSearchParams(location.search).get('id'));
  if (!w) { // link vecchio o id sbagliato: si propone la cantina
    $('.vi').outerHTML = `<section class="sec carta vi-vuoto"><h1 class="t-hero" data-righe>Vino non trovato.</h1><p class="t-lead">Il link non porta a nessuno dei nostri vini. Puoi sceglierne uno dalla cantina.</p><button class="btn btn--gold" type="button">Apri i nostri vini</button></section>`;
    $('.vi-vuoto .btn').addEventListener('click', () => FS.mk?.apri ? FS.mk.apri() : document.dispatchEvent(new CustomEvent('fs:open-cantina', { detail: {} })));
    titoli();
    return;
  }
  const apri = (col) => document.dispatchEvent(new CustomEvent('fs:open-cantina', { detail: col ? { col } : {} }));
  const c = FS.collection(w.collection), fra = D.wines.filter((x) => x.collection === w.collection), altri = fra.filter((x) => x !== w);
  document.title = `${w.name} · Feudi Salentini`;
  $('meta[name="description"]').content = `${w.name}, ${w.denom}. ${w.desc}`.slice(0, 300);
  const TIPO = { rosso: 'Rosso', rosato: 'Rosato', bianco: 'Bianco', dolce: 'Dolce' }, METALLO = ['Oro', 'Argento', 'Bronzo', 'Seal of Approval'];
  const aromi = Aromi.aromiDi(w), cibi = w.foods.map((f) => D.foods.find((x) => x.id === f)).filter(Boolean);
  const ps = [...w.premi].sort((a, b) => b.anno - a.anno || METALLO.indexOf(a.medaglia) - METALLO.indexOf(b.medaglia));

  // i testi dell'apertura: collezione, nome, denominazione; il resto lo dicono le note attorno alla bottiglia
  $('.vi-testo').innerHTML = `<button class="vi-col" type="button">${c.name}</button><h1 class="vi-nome" id="vi-t" data-righe>${w.name}</h1><p class="vi-denom">${w.denom}</p>
    <div class="vi-cta"><a class="btn btn--gold" href="#scheda">Leggi la scheda</a><button class="btn btn--line" type="button" data-tutti>Tutti i ${D.wines.length} vini</button></div>`;
  $('.vi-col').addEventListener('click', () => apri(c.id));
  $('[data-tutti]').addEventListener('click', () => apri());
  $('a[href="#scheda"]').addEventListener('click', (e) => { e.preventDefault(); FS.lenis ? FS.lenis.scrollTo('#scheda', { duration: 1.4 }) : $('#scheda').scrollIntoView({ behavior: 'smooth' }); });

  // la scheda sotto (11 nov: "non hai fatto altro che mettere foto e un disegno attorno: fai tu i disegni e sviluppalo in verticale, allineato al centro"):
  // ogni sezione è un disegno a matita e acquerello fatto qui (il grappolo nel colore del vino, la barrique o la vite ad alberello), da cui scende un tralcio
  // al centro della pagina; le note, frase per frase dal catalogo, si staccano dal tralcio a destra e a sinistra, ognuna con la sua foglia
  const frasi = (t) => (t || '').split(/(?<=\.)\s+(?=[A-ZÀ-Ý])/).filter(Boolean); // "26°-28°C." e "6.000" non spezzano: serve la maiuscola dopo
  const legno = /barrique|tonneau|botti|legno/i.test(w.tecnica);
  const tralcio = (id, cls, titolo, dis, note) => `<section class="sec carta ${cls}"${id ? ` id="${id}"` : ''} aria-label="${titolo.replace(/\.$/, '')}"><h2 class="t-h2 vq-t" data-righe>${titolo}</h2>
    <div class="vq" data-dis="${dis}"><div class="vq-dis"></div><ol class="vq-note">${note.map((n, i) => `<li class="${i % 2 ? 'vq-dx' : 'vq-sx'}" style="grid-row:${i + 1}">${n}</li>`).join('')}</ol></div></section>`;
  $('.vi').insertAdjacentHTML('afterend', [
    tralcio('scheda', 'carta--pietra vi-a', 'Il vino.', 'grappolo', frasi(w.desc)),
    tralcio('', 'vi-b', 'In vigna e in cantina.', legno ? 'botte' : 'vite', [...frasi(w.tecnica), w.zona && `<b>Zona</b> ${w.zona}`, w.resa && `<b>Resa</b> ${w.resa} per ettaro`].filter(Boolean)),
    ps.length ? `<section class="sec carta carta--pietra vi-c" aria-labelledby="vi-c-t"><div class="vq-head"><h2 class="t-h2" id="vi-c-t" data-righe>${ps.length === 1 ? 'Un riconoscimento.' : `${ps.length} riconoscimenti.`}</h2><p class="t-lead">Nei concorsi internazionali, ${ps.at(-1).anno === ps[0].anno ? `nel ${ps[0].anno}` : `dal ${ps.at(-1).anno} al ${ps[0].anno}`}.</p></div>
      <ul class="vi-med">${ps.map((p) => `<li><span class="vi-med__f"><img src="${p.img}" alt="" loading="lazy" decoding="async"></span><p><b>${p.medaglia} · ${p.anno}</b>${p.concorso}</p></li>`).join('')}</ul></section>` : '',
    altri.length ? `<section class="sec carta vi-d" aria-labelledby="vi-d-t"><div class="vq-head"><h2 class="t-h2" id="vi-d-t" data-righe>Gli altri vini di ${c.name}.</h2></div>
      <ul class="vi-fila">${altri.map((x) => `<li><a href="${FS.wineUrl(x.id)}" data-wine="${x.id}"><span class="vi-fila__f"><img src="${x.bottle}" alt="" loading="lazy" decoding="async"></span><span class="vi-fila__n">${breve(x)}</span></a></li>`).join('')}</ul></section>` : ''
  ].join(''));

  /* ---- i disegni, in un riquadro centrato in (cx, cy) alto S: tratti (l) e acquerelli (a) ---- */
  const VERDE = '#7d8f45', LEGNO = '#a9744f', R = M.rng(w.id.length * 7 + 3), rr = (a, b) => a + R() * (b - a);
  const acini = (cx, cy, r, righe) => { const l = [], a = []; righe.forEach((n, k) => { for (let j = 0; j < n; j++) { const x = cx + (j - (n - 1) / 2) * r * 1.9 + rr(-r, r) * 0.18, y = cy + k * r * 1.62, q = r * rr(0.9, 1.06);
    l.push(M.circle(x, y, q, rr(0, 6), 1.08)); a.push([M.circle(x, y, q * 0.94, 0, 1), w.color]); } }); return { l, a }; };
  const DIS = {
    grappolo: (cx, cy, S) => {
      const r = S * 0.052, top = cy - S * 0.26, g = acini(cx, top, r, [5, 6, 5, 4, 3, 2, 1]);
      const sagoma = [[cx - r * 6, top - r], [cx + r * 6, top - r], [cx + r * 1.2, top + r * 11], [cx - r * 1.2, top + r * 11]];
      return { l: [...g.l, M.smooth([[cx + 2, top - r], [cx + 6, top - S * 0.13], [cx - 4, top - S * 0.2]]), M.leaf(cx - 4, top - S * 0.18, cx - S * 0.3, top - S * 0.3, S * 0.07, 6),
        M.smooth(Array.from({ length: 14 }, (_, i) => { const t = i / 13, a = t * 9; return [cx + S * 0.06 + t * S * 0.16 + Math.cos(a) * S * 0.03 * (1 - t), top - S * 0.2 - t * S * 0.06 + Math.sin(a) * S * 0.03 * (1 - t)]; }))],
        a: [...g.a, [M.leaf(cx - 4, top - S * 0.18, cx - S * 0.3, top - S * 0.3, S * 0.07, 6), VERDE]], h: M.hatch(sagoma, { angle: -0.9, gap: 6, w: 0.9, shade: { x: cx - r * 2, y: top + r * 3, r: r * 6.5 } }) };
    },
    botte: (cx, cy, S) => {
      const L = cx - S * 0.62, Rr = cx + S * 0.62, hm = S * 0.3, he = hm * 0.84, lato = (s) => M.smooth([[L, cy + s * he], [cx, cy + s * hm], [Rr, cy + s * he]]), y = (x, k) => { const t = (x - L) / (Rr - L); return cy + k * (he + (hm - he) * Math.sin(Math.PI * t)); };
      const doghe = [-0.66, -0.33, 0, 0.33, 0.66].map((k) => M.smooth([[L + S * 0.06, cy + k * he], [cx, cy + k * hm], [Rr, cy + k * he]]));
      const cerchi = [0.16, 0.3, 0.7, 0.84].map((t) => { const x = L + (Rr - L) * t; return M.smooth([[x + 3, y(x, -1)], [x - 5, cy], [x + 3, y(x, 1)]]); });
      const corpo = [...lato(-1), ...lato(1).reverse()], fondo = M.ellipse(L, cy, he * 0.3, he, 0, -Math.PI / 2, 1.07, 40);
      const terra = M.smooth([[cx - S * 0.8, cy + hm + 8], [cx, cy + hm + 6], [cx + S * 0.8, cy + hm + 9]]);
      return { l: [lato(-1), lato(1), fondo, M.ellipse(L, cy, he * 0.18, he * 0.62, 0, -Math.PI / 2, 1.05, 30), ...doghe, ...cerchi, terra, M.smooth([[cx - S * 0.36, cy + hm + 7], [cx - S * 0.3, cy + hm - 6], [cx - S * 0.22, cy + hm + 7]]), M.smooth([[cx + S * 0.22, cy + hm + 7], [cx + S * 0.3, cy + hm - 6], [cx + S * 0.36, cy + hm + 7]])],
        a: [[corpo, LEGNO], [M.ellipse(L, cy, he * 0.3, he, 0, 0, 1, 30), '#c99a6b']], h: M.hatch(corpo, { angle: -0.6, gap: 6, w: 0.9, shade: { x: cx - S * 0.1, y: cy - hm * 0.6, r: S * 0.5 } }) };
    },
    vite: (cx, cy, S) => {
      const base = cy + S * 0.4, tr = (dx) => M.smooth([[cx + dx, base], [cx + dx * 0.4 + S * 0.03, base - S * 0.22], [cx - dx * 0.6, base - S * 0.42], [cx + dx * 0.2, base - S * 0.55]]);
      const bracci = [[-1, 0.35], [1, 0.3], [-0.4, 0.45], [0.5, 0.5]].map(([s, l]) => M.smooth([[cx, base - S * 0.55], [cx + s * S * l * 0.5, base - S * 0.62 - rr(0, 0.06) * S], [cx + s * S * l, base - S * 0.7 + rr(-0.04, 0.04) * S]]));
      const foglie = Array.from({ length: 9 }, (_, i) => { const a = -Math.PI / 2 + (i - 4) * 0.36, d = S * rr(0.3, 0.42), x = cx + Math.cos(a) * d * 1.3, yy = base - S * 0.66 + Math.sin(a) * d * 0.55; return M.leaf(x, yy, x + Math.cos(a + rr(-0.6, 0.6)) * S * 0.14, yy + Math.sin(a + rr(-0.6, 0.6)) * S * 0.1, S * 0.05, rr(-4, 4)); });
      const g1 = acini(cx - S * 0.16, base - S * 0.5, S * 0.03, [4, 3, 2, 1]), g2 = acini(cx + S * 0.18, base - S * 0.46, S * 0.03, [3, 3, 2, 1]);
      const terra = M.smooth([[cx - S * 0.7, base + 2], [cx, base], [cx + S * 0.7, base + 3]]), zolle = Array.from({ length: 10 }, () => { const x = cx + rr(-0.6, 0.6) * S; return [[x, base + rr(8, 22)], [x + rr(10, 26), base + rr(8, 22)]]; });
      return { l: [tr(-8), tr(6), tr(-1), ...bracci, ...foglie, ...g1.l, ...g2.l, terra, ...zolle], a: [...foglie.map((f) => [f, VERDE]), ...g1.a, ...g2.a], h: null };
    }
  };
  // le tavole: disegno, tralcio al centro, rametti verso le note; tutto si traccia entrando in vista
  $$('.vq').forEach((vq) => {
    const cv = document.createElement('canvas'), li = $$('li', vq), dis = $('.vq-dis', vq); cv.className = 'pr-canvas'; cv.setAttribute('aria-hidden', 'true'); vq.append(cv);
    let T = null, p = reduce ? 1 : 0;
    const sh = new M.Sheet(cv, (ctx, f) => {
      if (!T) return;
      const k1 = M.clamp(p / 0.45);
      T.a.forEach((x) => { x.progress = M.clamp((k1 - 0.5) / 0.5); M.drawWash(ctx, x, f); });
      if (T.h) { T.h.progress = M.clamp((k1 - 0.6) / 0.4); T.h.alpha = 0.4; M.drawHatch(ctx, T.h, f); }
      T.l.forEach((x, i) => { x.progress = M.clamp(k1 * 1.6 - (i / T.l.length) * 0.6); M.draw(ctx, x, f); });
      T.asse.progress = M.clamp((p - 0.35) / 0.5); M.draw(ctx, T.asse, f);
      T.rami.forEach((x, i) => { const k = M.clamp((p - 0.4 - i * (0.5 / T.rami.length)) / 0.2); x.forEach((s) => { s.progress = k; M.draw(ctx, s, f); }); });
      T.foglie.forEach((x, i) => { x.progress = M.clamp((p - 0.45 - i * (0.5 / T.rami.length)) / 0.2); M.drawWash(ctx, x, f); });
    }, () => {
      const D0 = rectIn(dis, cv), cx = D0.x + D0.w / 2, S = D0.h, d = DIS[vq.dataset.dis](cx, D0.y + S / 2, S), m = tel();
      T = { l: d.l.map((q) => M.stroke(q, { w: 1.35, amp: 0.9 })), a: d.a.map(([q, col]) => M.wash(q, { color: col, amp: 1.8, alpha: col === w.color ? (M.rgb(col).reduce((s, v) => s + v, 0) > 600 ? 0.75 : 0.5) : 0.5 })), h: d.h, rami: [], foglie: [] };
      const ys = li.map((el) => { const r = rectIn(el, cv); return { r, y: r.y + 14 }; }), y0 = D0.y + S + 6, y1 = m ? ys.at(-1).r.y - 10 : ys.at(-1).y;
      if (m) { // telefono: le note sono al centro, il tralcio passa solo negli spazi fra l'una e l'altra, un tratto e una foglia per spazio
        const bordi = [[D0.y + S, ys[0].r.y], ...ys.slice(1).map((q, i) => [ys[i].r.y + ys[i].r.h, q.r.y])];
        T.asse = M.stroke([[cx, y0], [cx, y0]], { w: 1 });
        bordi.forEach(([a0, b0], i) => { const ya = a0 + 8, yb = b0 - 8, ym = (ya + yb) / 2, s = i % 2 ? 1 : -1, f0 = M.leaf(cx, ym, cx + s * 24, ym - 9, 7, s * 2);
          T.rami.push([M.stroke(M.smooth([[cx, ya], [cx + s * 3, ym], [cx, yb]]), { w: 1.4, amp: 0.8 }), M.stroke(f0, { w: 1.1, amp: 0.6 })]); T.foglie.push(M.wash(f0, { color: VERDE, amp: 1.2, alpha: 0.5 })); });
        return;
      }
      T.asse = M.stroke(M.smooth([[cx, y0], [cx + 6, (y0 * 2 + y1) / 3], [cx - 6, (y0 + y1 * 2) / 3], [cx, y1]]), { w: 1.5, amp: 1 });
      ys.forEach(({ r, y }, i) => {
        const s = li[i].classList.contains('vq-sx') ? -1 : 1;
        const ex = s < 0 ? r.x + r.w + 14 : r.x - 14, f0 = M.leaf(cx, y, cx + s * 30, y - 16, 8, s * 2);
        T.rami.push([M.stroke(M.smooth([[cx, y], [(cx + ex) / 2, y - 7], [ex, y]]), { w: 1.25, amp: 0.8 }), M.stroke(f0, { w: 1.1, amp: 0.6 })]);
        T.foglie.push(M.wash(f0, { color: VERDE, amp: 1.2, alpha: 0.5 }));
      });
    });
    const mostra = () => li.forEach((el, i) => { const k = M.clamp((p - 0.45 - i * (0.5 / li.length)) / 0.18); el.style.opacity = k; el.style.transform = `translateY(${(1 - k) * 10}px)`; });
    if (reduce) return;
    mostra();
    vista(vq, () => gsap.to({ v: 0 }, { v: 1, duration: 3.2, ease: 'none', onUpdate() { p = this.targets()[0].v; mostra(); sh.kick(200); } }));
  });
  if ($('.vi-med')) cerchia($('.vi-med'), '.vi-med__f', true);
  // il filo a matita sotto la fila delle bottiglie, tracciato entrando
  const fila = $('.vi-fila');
  if (fila) {
    const cv = tela2(fila);
    let fili = [], p = reduce ? 1 : 0;
    const sh = new M.Sheet(cv, (ctx, f) => fili.forEach((t) => { t.progress = p; M.draw(ctx, t, f); }), () => {
      const righe = new Map(); $$('.vi-fila__f', fila).forEach((el) => { const r = rectIn(el, cv), y = Math.round(r.y + r.h); righe.set(y, [Math.min(righe.get(y)?.[0] ?? 1e9, r.x), Math.max(righe.get(y)?.[1] ?? -1e9, r.x + r.w)]); });
      fili = [...righe].map(([y, [a, b]]) => graf(M.smooth([[a - 10, y + 1], [(a + b) / 2, y - 1.5], [b + 10, y + 1]]), 1.5));
    });
    if (!reduce) vista(fila, () => gsap.to({ v: 0 }, { v: 1, duration: 1.4, ease: 'power1.inOut', onUpdate() { p = this.targets()[0].v; sh.kick(200); } }));
  }

  /* ---- l'apertura, il quaderno del sommelier (10 nov, dopo "non mi piace" alla forma ad acquerello): la bottiglia vera protagonista, la matita ne disegna
     il contorno e la foto si sviluppa dentro; scorrendo, dalla bottiglia partono a matita le frecce verso le note (vista con la macchia del suo colore, profumi
     coi loro disegni, tavola, uve, vigna), una dopo l'altra. Dati veri di js/data.js; disegni degli aromi e contorno della bottiglia da js/aromi.js ---- */
  const vi = $('.vi'), tela = $('.vi-st'), foto = $('.vi-foto'), lista = $('.vi-note');
  const NOTE = [
    { t: 'La vista', d: w.vista, macchia: 1 },
    { t: w.aromi.length > 1 ? 'I profumi' : 'Il profumo', d: w.aromi.join(', ').replace(/^./, (x) => x.toUpperCase()), aromi: 1 },
    w.abb && { t: 'In tavola', d: w.abb },
    { t: w.uve ? 'Uve' : 'Denominazione', d: w.uve ? `${w.uve} · ${w.alcool}` : `${w.denom} · ${w.alcool}` },
    { t: 'In vigna', d: [w.zona.replace(/^./, (x) => x.toUpperCase()), w.resa && `resa ${w.resa} per ettaro`].filter(Boolean).join(', ') }
  ].filter(Boolean);
  lista.innerHTML = NOTE.map((n) => `<li><b>${n.t}</b><p>${n.d}</p></li>`).join('');
  const li = $$('li', lista);
  const st = { cont: reduce ? 1 : 0, foto: reduce ? 1 : 0 };
  let p = reduce ? 1 : 0, S = null, cont = null;
  // la nota i arriva con lo scorrimento: prima la freccia, poi il testo, poi il disegno
  const fase = (i) => (reduce ? 1 : M.clamp((p - 0.08 - i * (0.8 / NOTE.length)) / (0.8 / NOTE.length)));
  const costruisci = (W, H) => {
    if (!cont) return;
    const m = tel(), testo = $('.vi-testo'), tb = testo.getBoundingClientRect(), tt = tela.getBoundingClientRect();
    const y0 = tb.bottom - tt.top + 14, Hb = m ? H - y0 - 12 : H * 0.8, Wi = (Hb * 653) / 1024, bx = W * (m ? 0.25 : 0.5), by = m ? y0 : H * 0.95 - Hb, nw = m ? W * 0.48 : Math.min(300, W * 0.21);
    foto.style.cssText += `;left:${bx - Wi / 2}px;top:${by}px;height:${Hb}px`;
    const P = cont.map(([u, q]) => [bx - Wi / 2 + u * Wi, by + q * Hb]);
    const bordo = (y, lato) => { const vic = P.filter(([, q]) => Math.abs(q - y) < Hb * 0.02); return vic.length ? (lato > 0 ? Math.max(...vic.map(([x]) => x)) : Math.min(...vic.map(([x]) => x))) : bx; };
    const yTop = m ? y0 + 8 : by + Hb * 0.12, yBot = m ? H - 16 : by + Hb * 0.9;
    const s = { cont: M.stroke(P, { w: 1.4, amp: 1.1 }), note: [] };
    const extra = (nt) => (nt.aromi ? (m ? 48 : 60) : nt.macchia ? (m ? 40 : 50) : 0); // sotto il testo: i disegni degli aromi o la macchia
    li.forEach((el) => (el.style.width = `${nw}px`));
    const alte = li.map((el, i) => el.offsetHeight + extra(NOTE[i])), gap = m ? Math.max(10, (yBot - yTop - alte.reduce((a, b) => a + b, 0)) / Math.max(1, li.length - 1)) : 0;
    let yy = yTop;
    li.forEach((el, i) => {
      const lato = m ? 1 : i % 2 ? -1 : 1, n = NOTE.length;
      const h = el.offsetHeight, yc = m ? yy + 12 : yTop + (i / Math.max(1, n - 1)) * (yBot - yTop);
      if (m) yy += alte[i] + gap;
      const nx = m ? W * 0.5 : lato > 0 ? bx + Wi * 0.2 + W * 0.09 : bx - Wi * 0.2 - W * 0.09 - nw, ny = yc - 12;
      el.style.left = `${nx}px`; el.style.top = `${ny}px`; el.classList.toggle('vi-sx', lato < 0); // a sinistra il testo va verso la bottiglia: la freccia arriva al testo
      const ay = M.clamp(yc, by + Hb * 0.16, by + Hb * 0.86), ax = bordo(ay, lato) + lato * 8, ex = lato > 0 ? nx - 10 : nx + nw + 10, ey = ny + 11;
      const nota = { freccia: M.stroke(M.smooth([[ax, ay], [(ax + ex) / 2, (ay + ey) / 2 + (ey > ay ? -14 : 14)], [ex, ey]]), { w: 1.3, amp: 0.9 }), punto: M.stroke(M.ellipse(ax, ay, 4, 4, 0, 0, 1.05, 14), { w: 1.4, amp: 0.4 }), segni: [], macchie: [] };
      // la macchia del suo colore accanto alla vista; i disegni degli aromi sotto i profumi
      const nt = NOTE[i];
      if (nt.macchia) { const r0 = m ? 15 : 20, cx = lato < 0 ? nx + nw - r0 * 1.3 : nx + r0 * 1.3, cy = ny + h + r0 + 6; nota.macchie.push(M.wash(M.ellipse(cx, cy, r0 * 1.25, r0, 0.3, 0, 1, 18), { color: w.color, amp: 2.4, alpha: 0.75 })); }
      if (nt.aromi) aromi.slice(0, m ? 3 : 4).forEach((a, j) => { const sz = m ? 40 : 52, ox = lato < 0 ? nx + nw - (j + 1) * (sz + 8) + 8 : nx + j * (sz + 8), oy = ny + h + 6, d = Aromi.DIS[a.k](a.terms[0]), sc = sz / 100; d.l.forEach((q) => nota.segni.push(M.stroke(M.map(q, sc, sc, ox, oy), { w: 1.2, amp: 0.7 }))); d.w.forEach(([q, col]) => nota.macchie.push(M.wash(M.map(q, sc, sc, ox, oy), { color: col, amp: 1.4, alpha: 0.6 }))); });
      s.note.push(nota);
    });
    S = s;
  };
  const render = (ctx, f) => {
    if (!S) return;
    S.cont.progress = st.cont; S.cont.alpha = 1 - 0.55 * st.foto; M.draw(ctx, S.cont, f);
    S.note.forEach((n, i) => {
      const k = fase(i);
      n.punto.progress = M.clamp(k / 0.15); M.draw(ctx, n.punto, f);
      n.freccia.progress = M.clamp((k - 0.05) / 0.4); M.draw(ctx, n.freccia, f);
      n.macchie.forEach((x) => { x.progress = M.clamp((k - 0.55) / 0.4); M.drawWash(ctx, x, f); });
      n.segni.forEach((x, j) => { x.progress = M.clamp((k - 0.5) / 0.4 * n.segni.length - j * 0.6); M.draw(ctx, x, f); });
    });
  };
  const paint = () => {
    foto.style.opacity = st.foto; foto.style.clipPath = `inset(${(1 - st.foto) * 100}% 0 0 0)`;
    li.forEach((el, i) => { const k = M.clamp((fase(i) - 0.35) / 0.3); el.style.opacity = k; el.style.transform = `translateY(${(1 - k) * 12}px)`; });
    if (!tel()) { const o = 1 - M.clamp((fase(1) - 0.0) / 0.25); $('.vi-testo').style.opacity = o; $('.vi-testo').style.visibility = o > 0.01 ? '' : 'hidden'; } // a sinistra arriva la seconda nota: il nome lascia il posto
  };
  foto.src = w.bottle; foto.alt = w.name;
  const sheet = new M.Sheet($('.vi-cv'), render, (W, H) => Aromi.contourOf(w.bottle).then((c0) => { cont = c0; costruisci(W, H); paint(); sheet.kick(100); }));
  titoli();
  if (!reduce) {
    Aromi.contourOf(w.bottle).then(() => gsap.timeline({ delay: 0.25, onUpdate: () => { paint(); sheet.kick(120); } })
      .to(st, { cont: 1, duration: 1.6, ease: 'power1.inOut' })
      .to(st, { foto: 1, duration: 1.2, ease: 'expo.out' }, '-=0.5'));
    gsap.from($$('.vi-testo > :not(h1)'), { opacity: 0, y: 16, duration: 0.8, ease: 'expo.out', stagger: 0.07, delay: 0.6 });
    ScrollTrigger.create({ trigger: vi, start: 'top top', end: 'bottom bottom', onUpdate: (s) => { p = s.progress; paint(); sheet.kick(160); } });
  } else paint();
})();
