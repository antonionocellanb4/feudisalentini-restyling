/* FOTOGRAFIA (13 nov 2026), la quinta versione: struttura di moncalisse.com/en, fotografie del profilo Instagram del cliente. Qui: le tre colonne dell'apertura che cambiano foto una alla volta,
   le foto delle righe che scorrono un poco più lente della pagina, e le collezioni: si cammina in orizzontale (si scorre o si trascina, come nelle altre home), una fotografia a tutto schermo e una carta
   per collezione, con tre bottiglie che aprono la scheda comune (js/scheda.js). Testi delle collezioni: quelli delle altre home. Le foto dei vini non si toccano. */
(() => {
  const { $, $$, reduce, clamp, titoli, collezioni, apri } = FS.mk;

  /* ---- apertura: ogni colonna ha le sue foto una sopra l'altra; ne cambia una ogni 1,7 s, a turno ---- */
  const colonne = $$('.fo-col').map((c) => ({ ims: $$('img', c), i: 0 }));
  colonne.forEach((c) => c.ims[0].classList.add('is-su'));
  if (!reduce) { let k = 0; setInterval(() => { if (document.hidden || scrollY > innerHeight) return; const c = colonne[k++ % colonne.length]; if (c.ims.length < 2) return; c.ims[c.i].classList.remove('is-su'); c.i = (c.i + 1) % c.ims.length; c.ims[c.i].classList.add('is-su'); }, 1700); }

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
