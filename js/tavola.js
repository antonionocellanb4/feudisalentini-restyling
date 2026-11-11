/* F, G, H: le due sezioni nuove, sections/moderna-f-venduti.html e sections/moderna-f-tavola.html.
   I più venduti: giostra infinita a tutta larghezza. Il palco resta fermo e scorrendo la pagina passano tutte le bottiglie, con una sosta su ognuna (6 nov: "manco li scorro tutti").
   Si trascina col mouse o col dito e si ferma sempre su una bottiglia; frecce e tastiera. La bottiglia al centro è la più grande e dà il nome sotto. Le bottiglie restano dritte.
   La macchia dipinta della bottiglia che arriva al centro sboccia (fino a 1,25) e gira, quelle che si allontanano si richiudono; il nome sotto cambia salendo. Le foto delle bottiglie non si toccano.
   Cosa c'è in tavola?: si sceglie il piatto, inciso in F e G (js/piatti-incisi.js), dipinto in H (assets/quadri/piatti/) e tutti i suoi vini stanno in fila sulla tavola, nessuno nascosto; cambiando piatto spuntano da dietro il bordo. */
(() => {
  const { data: D, reduce } = FS, $ = (c, r = document) => r.querySelector(c), $$ = (c, r = document) => [...r.querySelectorAll(c)];
  const ss = (t) => t * t * (3 - 2 * t), clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const fig = (w) => `<span class="tv-v__fig" style="--wine:${w.color};--stain:var(--nav-stain-${D.wines.indexOf(w) % 3});--b:${Scheda.FONDO[w.bottle] ?? 0.91}"><i class="tv-macchia"></i><img src="${w.bottle}" alt="" decoding="async" draggable="false"></span>`;
  const visibile = (el, fn) => new IntersectionObserver(([e]) => fn(e.isIntersecting), { rootMargin: '10% 0px' }).observe(el);

  /* ---- I più venduti ---- */
  // shortcut: vini scelti per prova su sua richiesta, non ci sono dati di vendita. Da sostituire con l'elenco vero della cantina
  const VENDUTI = ['c53-primitivo', 'sassirossi', 'cala', '125-rosato', 'terra-primitivo', 'tre-cuori', 'organic-primitivo', 'gocce'];
  const bv = $('#venduti');
  if (bv) {
    const box = $('.bv__giostra', bv), vini = VENDUTI.map((id) => FS.wine(id)).filter(Boolean), dopo = bv.nextElementSibling;
    $('.bv__fila', bv).innerHTML = vini.map((w) => `<li class="bv-v"><a href="${FS.wineUrl(w.id)}" draggable="false" aria-label="${w.name}">${fig(w)}</a></li>`).join('');
    const el = $$('.bv-v', bv), n1 = $('.bv__n1', bv), n2 = $('.bv__n2', bv), N = el.length;
    let passo = 1, mio = 0, tira = null, mosso = false, meta = null, vivo = false, ultimo = 0, centro = -1, ora = 0, ferma = 0;
    const misura = () => { passo = el[0].offsetWidth * 1.18; };
    const corsa = () => { // dall'arrivo in cima a quando la sezione dopo comincia a coprirla (in H: ci si dipinge sopra), una bottiglia dopo l'altra
      const a = bv.getBoundingClientRect().top, c = dopo.getBoundingClientRect().top - a - innerHeight; if (c <= 0 || N < 2) return 0;
      const f = clamp(-a / c) * (N - 1), i = Math.min(N - 2, Math.floor(f)); return (i + ss(clamp((f - i - 0.15) / 0.7))) * passo; };
    const giro = (t) => { // posa ogni bottiglia: la distanza dal centro dà grandezza e luce
      const dt = Math.min(64, t - ultimo || 16); ultimo = t; const tot = passo * N, W2 = box.clientWidth / 2, R = Math.max(W2, passo * 1.7); // R: su telefono lo schermo è stretto rispetto al passo, a metà strada le bottiglie non devono rimpicciolire troppo
      if (meta !== null && !tira) { const d = meta - mio; mio += d * (1 - Math.exp(-dt / 140)); if (Math.abs(d) < 0.5) { mio = meta; meta = null; } }
      const off = corsa() + mio; let vicino = 0, dmin = 1e9;
      el.forEach((e, i) => {
        let x = (((i * passo - off) % tot) + tot) % tot; if (x > tot / 2) x -= tot;
        const d = clamp(Math.abs(x) / R, 0, 1.3), s = 1 - 0.5 * ss(clamp(d)), vicina = 1 - ss(clamp(Math.abs(x) / passo)); if (Math.abs(x) < dmin) { dmin = Math.abs(x); vicino = i; }
        e.style.transform = `translate3d(calc(${x}px - 50%), 0, 0) scale(${s})`; e.style.setProperty('--luce', 1 - 0.55 * ss(clamp(d))); e.style.zIndex = 100 - Math.round(d * 50); e.style.setProperty('--giro', `${(x / W2) * 24}deg`); e.style.setProperty('--fiore', 0.8 + 0.45 * vicina);
      });
      if (vicino !== centro) { const primo = centro < 0; centro = vicino; const w = vini[vicino]; n1.textContent = w.name; n2.textContent = w.denom; if (!primo && !reduce) gsap.fromTo([n1, n2], { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.55, stagger: 0.06, ease: 'expo.out', overwrite: true }); } // il nome nuovo sale
      if (vivo) ora = requestAnimationFrame(giro); // segue lo scorrimento finché la sezione è in vista
    };
    const parti = () => { cancelAnimationFrame(ora); ultimo = 0; ora = requestAnimationFrame(giro); };
    const tonda = (x) => Math.round(x / passo) * passo; // ci si ferma sempre su una bottiglia
    const vai = (i) => { const tot = passo * N, d = ((((i * passo - corsa() - mio) % tot) + tot * 1.5) % tot) - tot / 2; meta = tonda(mio + d); parti(); }; // la strada più corta per portare i al centro
    misura(); addEventListener('resize', () => { misura(); parti(); });
    visibile(bv, (si) => { vivo = si; if (si) parti(); });
    box.addEventListener('pointerdown', (e) => { if (e.button) return; tira = { x: e.clientX, o: mio, t: performance.now(), v: 0, px: e.clientX }; mosso = false; meta = null; });
    addEventListener('pointermove', (e) => { if (!tira) return; const t = performance.now(), dx = e.clientX - tira.x; if (Math.abs(dx) > 6) mosso = true; mio = tira.o - dx; tira.v = (-(e.clientX - tira.px) / Math.max(8, t - tira.t)) * 1000; tira.px = e.clientX; tira.t = t; });
    addEventListener('pointerup', () => { if (!tira) return; meta = tonda(mio + clamp(tira.v, -2400, 2400) * (reduce ? 0 : 0.25)); tira = null; }); // lanciata va avanti per inerzia e si ferma su una bottiglia
    addEventListener('pointercancel', () => { if (tira) { meta = tonda(mio); tira = null; } });
    box.addEventListener('click', (e) => { if (mosso) { e.preventDefault(); mosso = false; } }, true); // un trascinamento non apre il vino
    box.addEventListener('wheel', (e) => { if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return; e.preventDefault(); mio += e.deltaX; meta = null; clearTimeout(ferma); ferma = setTimeout(() => { meta = tonda(mio); }, 160); }, { passive: false }); // trackpad in orizzontale
    box.addEventListener('focusin', (e) => { const i = el.indexOf(e.target.closest('.bv-v')); if (i >= 0) vai(i); });
    $$('.tv__fr', bv).forEach((b) => b.addEventListener('click', () => vai((centro + +b.dataset.d + N) % N)));
  }

  /* ---- Cosa c'è in tavola? ---- */
  const tv = $('#tavola');
  if (tv) {
    const menu = $('.tv__menu', tv), fila = $('.tv__tavola', tv), scelto = $('.tv__scelto', tv);
    const dipinti = document.body.classList.contains('page-mh'), icona = (id) => (dipinti ? `<img src="assets/quadri/piatti/${id}.webp" alt="" loading="lazy" decoding="async" draggable="false">` : FS.incisi(id)); // in H i piatti dipinti (tools/dipingi_piatti.py), in F e G incisi come in E
    menu.innerHTML = D.foods.map((f) => `<li><button class="tv-p" type="button" aria-pressed="false" data-f="${f.id}">${icona(f.id)}<span>${f.label}</span></button></li>`).join('');
    let piatto = null, giro = null;
    const scegli = (id, subito) => {
      if (id === piatto) return; piatto = id;
      $$('.tv-p', menu).forEach((b) => b.setAttribute('aria-pressed', b.dataset.f === id));
      const f = D.foods.find((x) => x.id === id), vini = D.wines.filter((w) => w.foods?.includes(id));
      const entra = () => {
        scelto.innerHTML = `${f.label} <span>${vini.length === 1 ? 'un vino' : `${vini.length} vini`}</span>`;
        fila.style.setProperty('--n', vini.length); fila.scrollLeft = 0;
        fila.innerHTML = vini.map((w) => `<li class="tv-b" style="--b:${Scheda.FONDO[w.bottle] ?? 0.91}"><a href="${FS.wineUrl(w.id)}" draggable="false"><span class="tv-b__fig"><img src="${w.bottle}" alt="" decoding="async" draggable="false"></span><span class="tv-b__n">${w.name}</span></a></li>`).join('');
        if (subito || reduce) return;
        gsap.fromTo($$('.tv-b__fig img', fila), { yPercent: 100 }, { yPercent: 0, duration: 1.1, stagger: 0.06, ease: 'expo.out', clearProps: 'transform' }); // spuntano da dietro il bordo della tavola
        gsap.fromTo([scelto, ...$$('.tv-b__n', fila)], { opacity: 0 }, { opacity: 1, duration: 0.6, stagger: 0.04, delay: 0.25, clearProps: 'opacity' });
      };
      giro?.kill();
      if (subito || reduce || !fila.children.length) return entra();
      giro = gsap.timeline({ onComplete: entra })
        .to($$('.tv-b__fig img', fila), { yPercent: 100, duration: 0.35, stagger: 0.02, ease: 'power2.in' }, 0)
        .to([scelto, ...$$('.tv-b__n', fila)], { opacity: 0, duration: 0.25 }, 0);
    };
    menu.addEventListener('click', (e) => { const b = e.target.closest('[data-f]'); if (b) scegli(b.dataset.f); });
    scegli('pugliese', true);
  }
})();
