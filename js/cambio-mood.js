/* IL CAMBIO DI MOOD (20 nov 2026; prima era la pillola "Mood" nella barra, che portava alla pagina della scelta). Le sue parole: "facciamo un angolo in basso a destra, effetto
   onda, che se ci vado sopra si allarga per coprire tutto"; "non deve essere una selezione, deve già trasportarmi sull'altro: mentre si muove mostra già l'altra versione";
   "se ci resto sopra lo completa, se lo tolgo torna indietro".
   Un quarto di cerchio nell'angolo col bordo che ondeggia e il nome dell'altro mood. Col mouse sopra l'onda si allarga e dentro c'è già la stessa pagina nell'altro mood (home,
   azienda o lo stesso vino), viva in un iframe che si carica quando il mouse si avvicina all'angolo, al fuoco o al primo tocco; va avanti finché il mouse resta nell'angolo e
   torna indietro se esce. Coperto lo schermo si va lì e la pagina vera sfuma sopra (sections/_head.html, fs-mood-da). Clic, dito e tastiera vanno diretti; Esc fa tornare.
   Con il movimento ridotto è un link. Dove porta lo dice js/main.js (FS.cambio). Stile: css/nav.css (.cmood).
   Provate e bocciate il 20 nov ("no non mi piacciono, torniamo a come era prima"): i fogli da sfogliare e la parola "mood" della home, in _archivio-prove/mood-fogli-parola-20nov */
(() => {
  const C = window.FS && FS.cambio; if (!C) return;
  const { meta, nome, dopo } = C, reduce = FS.reduce, lenis = FS.lenis, FONDO = { b: '#3e2719', f: '#fff' }; /* il fondo dell'altro mood finché la sua pagina non c'è */
  const cm = document.createElement('div'); cm.className = 'cmood'; cm.style.setProperty('--cm-vista', FONDO[dopo] || '#fff');
  cm.innerHTML = `<div class="cmood__vista" aria-hidden="true"></div><svg class="cmood__onda" aria-hidden="true"><path class="cmood__sotto"/></svg><a class="cmood__apri" href="${meta}" data-mood-da="circle(0% at 100% 100%)|circle(150% at 100% 100%)"><span class="cmood__nome">${nome}</span><span class="sr-only">: questa pagina nel mood ${nome}</span></a>`;
  document.body.append(cm);
  const vista = cm.querySelector('.cmood__vista'), onda = cm.querySelector('.cmood__sotto'), bott = cm.querySelector('.cmood__apri');
  let p = 0, da = 0, a = 0, t0 = 0, dur = 1, raf = 0, attesa = 0, riposo = false, tenuta = false, W = 1, H = 1, finestra = null, andato = false;
  const misura = () => { const r = vista.getBoundingClientRect(); W = r.width || 1; H = r.height || 1; }; /* il centro dell'onda è l'angolo dello schermo senza la barra di scorrimento */
  const prepara = () => {
    if (finestra || reduce) return;
    finestra = document.createElement('iframe'); finestra.src = meta; finestra.title = ''; finestra.tabIndex = -1; vista.append(finestra); removeEventListener('pointermove', vicino);
    finestra.addEventListener('load', () => { try { finestra.contentDocument.documentElement.style.scrollbarWidth = 'none'; } catch (e) {} }); /* una barra sola, quella della pagina (prima erano due) */
  };
  const vicino = (e) => { if (e.pointerType === 'mouse' && Math.hypot(W - e.clientX, H - e.clientY) < 360) prepara(); }; /* il mouse va verso l'angolo: l'altra pagina si carica, così nell'onda c'è già */
  const lontano = (e) => { if (Math.hypot(W - e.clientX, H - e.clientY) > bott.offsetWidth + 8) { riposo = false; removeEventListener('pointermove', lontano); } }; /* tornata col mouse sull'angolo non riparte finché il mouse non se ne va */
  const molle = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  /* il bordo: raggio R attorno all'angolo, mosso da due onde che scorrono, gonfie mentre si allarga (ampio); R arriva oltre l'angolo opposto, onde comprese */
  const disegna = (ora = performance.now()) => {
    raf = 0;
    const k = Math.min(1, (ora - t0) / (dur * 1000)), r0 = bott.offsetWidth, s = reduce ? 0 : ora / 1000;
    p = da + (a - da) * molle(k);
    const ampio = 0.05 + 0.06 * Math.sin(Math.PI * p), R = r0 + ((Math.hypot(W, H) + 40) / (1 - ampio) - r0) * p;
    let d = `M${W} ${H}`;
    for (let i = 0; i <= 96; i++) { const th = -0.1 + (i / 96) * (Math.PI / 2 + 0.2), r = R * (1 + ampio * (0.6 * Math.sin(6 * th + 1.7 * s) + 0.4 * Math.sin(11 * th - 2.3 * s))); d += `L${(W - r * Math.cos(th)).toFixed(1)} ${(H - r * Math.sin(th)).toFixed(1)}`; }
    onda.setAttribute('d', d + 'Z'); vista.style.clipPath = `path('${d}Z')`;
    if (k >= 1 && a === 1) { if (!andato) { andato = true; try { sessionStorage.setItem('fs-mood-da', 'inset(0% 0% 0% 0%)|inset(0% 0% 0% 0%)|0'); sessionStorage.setItem('fs-arrivo', String(Date.now())); } catch (e) {} location.href = meta; } return; } /* coperto: la pagina vera prende il posto della finestra sfumando */
    if (k >= 1 && cm.classList.contains('is-va')) { cm.classList.remove('is-va'); lenis?.start(); } /* tornata nell'angolo */
    if (k < 1 || !reduce) raf = requestAnimationFrame(disegna); /* chiusa ondeggia piano; con il movimento ridotto è ferma */
  };
  const vai = (verso) => {
    if (a === verso) return;
    cancelAnimationFrame(raf); da = p; a = verso; t0 = performance.now(); dur = verso ? 0.35 + 0.95 * (1 - p) : 0.2 + 0.5 * p;
    if (verso) { prepara(); cm.classList.add('is-va'); lenis?.stop(); } else { tenuta = false; riposo = true; addEventListener('pointermove', lontano); }
    raf = requestAnimationFrame(disegna);
  };
  /* tenuta: partita col mouse, l'onda va avanti finché il mouse resta nell'angolo (una volta e mezza il quarto di cerchio) e torna se esce, anche dalla finestra */
  const resta = (e) => { if (tenuta && a === 1 && (e.type === 'pointerout' ? !e.relatedTarget : Math.hypot(W - e.clientX, H - e.clientY) > bott.offsetWidth * 1.5)) vai(0); };
  addEventListener('pointermove', vicino, { passive: true });
  addEventListener('pointermove', resta, { passive: true }); document.addEventListener('pointerout', resta);
  bott.addEventListener('focus', prepara);
  bott.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse' && !riposo && !reduce) { clearTimeout(attesa); attesa = setTimeout(() => { tenuta = true; vai(1); }, 150); } }); /* un attimo sopra, non un passaggio per caso */
  bott.addEventListener('pointerleave', () => clearTimeout(attesa));
  bott.addEventListener('click', (e) => { if (reduce || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return; e.preventDefault(); tenuta = false; vai(1); }); /* con ctrl o il tasto centrale si apre a parte, come un link */
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && a === 1) vai(0); });
  addEventListener('resize', () => { misura(); if (!raf) disegna(); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden && !raf) raf = requestAnimationFrame(disegna); });
  addEventListener('pageshow', (e) => { if (!e.persisted) return; cancelAnimationFrame(raf); p = da = a = 0; t0 = 0; andato = false; cm.classList.remove('is-va'); lenis?.start(); disegna(); }); /* tornando indietro l'angolo è di nuovo un angolo */
  misura(); disegna();
})();
