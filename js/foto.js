/* FOTOGRAFIA (13 nov 2026), la quinta versione: struttura di moncalisse.com/en, fotografie del profilo Instagram del cliente. Qui: l'apertura POP con la bottiglia 3D (dal 17 nov, prima tre colonne di foto),
   le foto delle righe che scorrono un poco più lente della pagina, e le collezioni: si cammina in orizzontale (si scorre o si trascina, come nelle altre home), una fotografia a tutto schermo e una carta
   per collezione, con tre bottiglie che aprono la scheda comune (js/scheda.js). Testi delle collezioni: quelli delle altre home. Le foto dei vini non si toccano. */
(() => {
  const { $, $$, reduce, clamp, titoli, collezioni, apri } = FS.mk;

  /* ---- apertura POP (17 nov). Le richieste in ordine sono in testa a css/foto.css; l'ultima forma: fondo bianco, l'esempio sweet-tape.com, la bottiglia che rotola e scopre il testo.
     Palco fermo, una linea del tempo legata allo scorrimento. La bottiglia 3D (js/foto-3d.js) legge lo stato FS.apre: centro del vetro x, y e altezza h in frazioni dello schermo,
     rz inclinazione, ry giro attorno all'asse; rotola = 1 quando la bottiglia è sdraiata sul piano (vista dall'alto) e gira quanto si sposta, come un rullo, con l'etichetta di fronte quando x = x0;
     pista (0-1) è quanto è scorsa la fila di parole, corsa la sua lunghezza in pixel; xb e xc fin dove la bottiglia ha scoperto la presentazione e il nome del vino.
     a) la frase del profilo in lettere giganti scorre di lato, la bottiglia davanti (col mouse guarda il puntatore, con la velocità si piega; 18 nov: tolti foto e grappolo, "non era così che lo volevo");
     b) rotola fuori a destra, rientra da sinistra e passando scopre la presentazione, esce di nuovo; c) rientra e si ferma sul suo capitolo scoprendone il nome. Con le animazioni ridotte si salta
     da un momento all'altro ---- */
  const hero = $('.fo-apre'), palco = $('.fo-apre__st'), foto = $('.fo-apre__foto'), tela = $('.fo-apre__tela');
  const pista = $('.fo-pista'), bB = $('.fo-apre__b'), nome = $('.fo-apre__vino');
  const st = (FS.apre = { x: 0.62, y: 0.54, h: 0.8, rz: 0, ry: 0, rotola: 0, x0: 0.5, pista: 0, corsa: 1, xb: -1, xc: -1 });
  const taglia = (el, x) => { /* il testo si vede solo dove la bottiglia è già passata (a sinistra del suo centro) */
    const r = el.getBoundingClientRect(), via = Math.min(r.width, Math.max(0, r.right - x));
    el.style.clipPath = via <= 0 ? '' : via >= r.width ? 'inset(0 100% 0 0)' : `inset(-40px ${via.toFixed(0)}px -40px -40px)`;
  };
  const segui = () => {
    pista.style.transform = `translate3d(${(-st.pista * st.corsa).toFixed(1)}px,0,0)`;
    const W = tela.clientWidth, H = tela.clientHeight;
    taglia(bB, st.xb * W); taglia(nome, st.xc * W);
    if (palco.classList.contains('is-3d')) return;
    /* la foto della bottiglia, finché il 3D non è pronto (o se non parte), con lo stesso stato: nella foto il vetro va dalla riga 72 alla 932 su 1024, centro a 340 su 653 */
    const ih = (st.h * H * 1024) / 860, iw = (ih * 653) / 1024;
    foto.style.cssText = `height:${ih.toFixed(1)}px;left:${(st.x * W - 0.5214 * iw).toFixed(1)}px;top:${(st.y * H - 0.4902 * ih).toFixed(1)}px;transform-origin:52.14% 49.02%;rotate:${(-st.rz).toFixed(4)}rad`;
  };
  const misura = () => { /* quanto scorre la pista; all'apertura la bottiglia sta nel suo posto dopo la prima parola */
    st.corsa = Math.max(0, pista.scrollWidth - pista.parentElement.clientWidth);
    if (st.pista === 0 && st.rotola === 0) { const p = $('.fo-pista__posto').getBoundingClientRect(), x = (p.left + p.width / 2) / tela.clientWidth; if (x < 0.85) st.x = x; } /* sul telefono il posto cade fuori schermo: lì resta dove la mette S.a, sotto le parole */
    segui();
  };
  gsap.matchMedia().add({ largo: '(min-width: 861px)', stretto: '(max-width: 860px)', fermo: '(prefers-reduced-motion: reduce)' }, ({ conditions: { largo, fermo } }) => { /* stretto c'è perché gsap parte solo se almeno una condizione è vera */
    const S = largo /* a: accanto alla prima parola; p: davanti alla pista; r: sdraiata sul piano mentre rotola; c: in piedi sul suo capitolo (sul telefono a sinistra, coi dati a destra) */
      ? { a: { x: 0.62, y: 0.54, h: 0.8 }, p: { x: 0.5, y: 0.53, h: 0.7 }, r: { y: 0.5, h: 0.6 }, c: { x: 0.5, y: 0.565, h: 0.74 } }
      : { a: { x: 0.5, y: 0.6, h: 0.42 }, p: { x: 0.5, y: 0.6, h: 0.42 }, r: { y: 0.62, h: 0.44 }, c: { x: 0.26, y: 0.6, h: 0.5 } };
    Object.assign(st, S.a, { rz: 0, ry: 0, rotola: 0, x0: S.p.x, pista: 0, xb: -1, xc: -1 });
    const c = $$('.fo-apre__riga, .fo-apre__note, .fo-apre__dati');
    const tl = gsap.timeline({ defaults: { ease: 'none' }, onUpdate: segui })
      .addLabel('a', 0)
      .to('.fo-apre__s, .fo-apre__btn', { y: 30, autoAlpha: 0, duration: 0.4, ease: 'power2.in' }, 0.3)
      .to(st, { x: S.p.x, y: S.p.y, h: S.p.h, duration: 0.6, ease: 'power2.inOut' }, 0.3)
      .to(st, { pista: 1, duration: 3.7 }, 0.3)
      .addLabel('m', 2.15).addLabel('e', 4) /* metà e fine della pista: servono alle animazioni ridotte */
      /* b) sdraiata sul piano rotola via a destra, rientra da sinistra scoprendo la presentazione ed esce di nuovo */
      .to(pista, { autoAlpha: 0, duration: 0.4 }, 4)
      .set(st, { rotola: 1 }, 4)
      .to(st, { x: 1.3, y: S.r.y, h: S.r.h, duration: 0.6, ease: 'power1.in' }, 4)
      .fromTo(bB, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 }, 4.6)
      .set(st, { x: -0.3, xb: -0.3 }, 4.61)
      .to(st, { x: 1.3, xb: 1.3, duration: 1.5, ease: 'power1.inOut' }, 4.62)
      .addLabel('b', 6.3)
      /* c) rientra e si ferma sul suo capitolo: il nome si scopre dove passa, poi tutto */
      .to(bB, { autoAlpha: 0, y: -40, duration: 0.4, ease: 'power2.in' }, 6.4)
      .set(st, { x: -0.3, xc: -0.3, x0: S.c.x }, 6.45)
      .to(st, { x: S.c.x, xc: S.c.x, y: S.c.y, h: S.c.h, duration: 1.1, ease: 'power2.out' }, 6.5)
      .to(st, { xc: 1.3, duration: 0.35, ease: 'power1.in' }, 7.55)
      .fromTo(c, { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, ease: 'power2.out', stagger: 0.08 }, 7.5)
      .addLabel('c', 8)
      .to({}, { duration: 0.4 });
    const quale = (p) => (p < 0.13 ? 'a' : p < 0.37 ? 'm' : p < 0.61 ? 'e' : p < 0.85 ? 'b' : 'c'); /* a metà strada fra i momenti: m 2,15, e 4, b 6,3, c 8 su 8,4 */
    const salta = (p) => { tl.seek(quale(p)); segui(); }; /* seek non chiama onUpdate: la pista e i tagli del testo vanno aggiornati a mano */
    if (fermo) { tl.pause(); salta(0); }
    const t = ScrollTrigger.create({ trigger: hero, start: 'top top', end: 'bottom bottom', ...(fermo ? { onUpdate: (s) => salta(s.progress) } : { animation: tl, scrub: 0.8 }) });
    misura(); addEventListener('resize', misura); document.fonts.ready.then(misura);
    return () => { t.kill(); tl.kill(); removeEventListener('resize', misura); };
  });

  /* ---- le foto con data-par scorrono più lente: il numero è di quanti punti percentuali si spostano ---- */
  if (!reduce) $$('[data-par]').forEach((el) => gsap.fromTo(el, { yPercent: +el.dataset.par }, { yPercent: -el.dataset.par, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));
  $$('.fo-link[data-col]').forEach((b) => b.addEventListener('click', () => apri(b.dataset.col)));

  /* ---- le collezioni: sei sale larghe uno schermo. Foto di fondo: una del profilo per collezione (Terra, Organic e Internazionali mostrano una loro bottiglia; per le altre tre è una scelta mia) ---- */
  const sec = $('.fo-giro'), stage = $('.fo-giro__st'), track = $('.fo-giro__track'), nomi = $('.fo-giro__nomi');
  const SALE = window.FS_BF.map((t) => [t.id, t.foto, t.d]); /* js/dati-bf.js, in comune con Botanica e con la pagina del vino */
  const dati = collezioni(), lista = SALE.map(([id, foto, d]) => ({ ...dati.find((c) => c.col.id === id), id, foto, d })).filter((t) => t.col), N = lista.length;
  console.assert(N === 6, 'foto: manca una collezione nei dati');
  const num = (i) => String(i + 1).padStart(2, '0'), corto = (w) => w.name.replace(/^(Collezione 53|125 Organic|125|Terra)\s+/, '').replace(/\s+(Organic|Edition)$/, '') || w.name;
  track.innerHTML = lista.map((t, i) => `<article class="fo-sala" aria-labelledby="fo-s${i}">
      <img class="fo-sala__f" src="assets/foto-ig/${t.foto}.webp" alt="" decoding="async" loading="lazy" draggable="false">
      <div class="fo-carta">
        <p class="fo-carta__n">${num(i)} / ${num(N - 1)}</p>
        <h3 class="fo-carta__t" id="fo-s${i}">${t.col.name}</h3>
        <div class="fo-carta__bt">${t.vini.slice(0, 3).map((w) => `<button class="fo-bt" type="button" data-wine="${w.id}" aria-label="${w.name}, apri la scheda" style="--b:${w.fondo}"><img src="${w.bottle}" alt="" width="653" height="1024" decoding="async" loading="lazy" draggable="false"><span>${corto(w)}</span></button>`).join('')}</div>
        <p class="fo-carta__d">${t.d}</p>
        <button class="fo-link" type="button" data-col="${t.id}">${t.n > 3 ? `Tutti i ${t.n} vini` : 'I vini della collezione'}</button>
      </div>
    </article>`).join('');
  nomi.innerHTML = lista.map((t, i) => `<button type="button" data-vai="${i}">${t.col.name}</button>`).join('');
  const voci = $$('button', nomi), sale = $$('.fo-sala', track), fondi = $$('.fo-sala__f', track);
  const scheda = Scheda(sec, { schizzi: false });
  track.addEventListener('click', (e) => { const b = e.target.closest('.fo-bt'), c = e.target.closest('[data-col]'); if (b) scheda.apri(FS.wine(b.dataset.wine), b); else if (c) apri(c.dataset.col); });

  let W = 1, cam = -1, cur = -1;
  const corsa = () => sec.offsetHeight - stage.offsetHeight;
  const vai = (n) => { const y = sec.getBoundingClientRect().top + scrollY + (n / (N - 1)) * corsa(); FS.lenis ? FS.lenis.scrollTo(y, { duration: 1.4 }) : scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' }); };
  voci.forEach((b, i) => b.addEventListener('click', () => vai(i)));
  const giro = () => {
    const q = sec.getBoundingClientRect(); if (q.bottom < 0 || q.top > innerHeight) return;
    W = stage.clientWidth; const dest = clamp(-q.top / Math.max(1, corsa())) * (N - 1) * W;
    if (Math.abs(dest - cam) < 0.05) return; cam = dest;
    track.style.transform = `translate3d(${-cam}px,0,0)`;
    fondi.forEach((f, i) => { const d = i * W - cam; if (Math.abs(d) < W * 1.1) f.style.transform = `translate3d(${(-d * 0.18).toFixed(1)}px,0,0)`; }); /* la foto di fondo scorre più lenta della carta */
    const n = clamp(Math.round(cam / W), 0, N - 1); if (n !== cur) { cur = n; voci.forEach((b, i) => b.setAttribute('aria-current', i === n)); }
  };
  gsap.ticker.add(giro);

  /* si trascina in orizzontale, come le altre passeggiate; in verticale scorre la pagina */
  let tira = null, tirato = false;
  stage.addEventListener('pointerdown', (e) => { if (e.target.closest('.fb-zoom, .fo-giro__nomi, .fo-link')) return; tira = { x: e.clientX, y: e.clientY, s: scrollY, su: false, id: e.pointerId }; tirato = false; });
  stage.addEventListener('pointermove', (e) => { if (!tira || e.pointerId !== tira.id) return; const d = e.clientX - tira.x, dy = e.clientY - tira.y;
    if (!tira.su) { if (Math.abs(d) < 8 || Math.abs(d) < Math.abs(dy)) return; tira.su = true; stage.setPointerCapture(e.pointerId); stage.classList.add('is-tira'); }
    const y = tira.s - (d * corsa()) / ((N - 1) * W) * 1.2; FS.lenis ? FS.lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y); });
  const lascia = () => { if (tira?.su) tirato = true; tira = null; stage.classList.remove('is-tira'); };
  stage.addEventListener('pointerup', lascia); stage.addEventListener('pointercancel', lascia);
  stage.addEventListener('click', (e) => { if (tirato) { e.stopPropagation(); e.preventDefault(); tirato = false; } }, true);

  /* la pillola fissa "I nostri vini" non si vede sull'apertura né durante il cammino */
  const P = $('.m-pill'); P?.classList.add('in-storia');
  ScrollTrigger.create({ trigger: '#hero', start: 'top bottom', end: 'bottom 40%', onToggle: (s) => P?.classList.toggle('in-storia', s.isActive) });
  ScrollTrigger.create({ trigger: sec, start: 'top 60%', end: 'bottom 60%', onToggle: (s) => P?.classList.toggle('in-pin', s.isActive) });
  titoli();
})();
