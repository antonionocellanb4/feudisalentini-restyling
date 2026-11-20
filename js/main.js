/* Base comune: scroll fluido (Lenis) agganciato a GSAP/ScrollTrigger e piccoli helper.
   Gli script delle sezioni (caricati con defer dopo questo) trovano tutto in window.FS. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touch = matchMedia('(hover: none), (pointer: coarse)').matches;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  const D = window.FS_DATA;
  // ogni stile è un sito a sé (body data-sito): home, azienda e scheda del vino sue, e l'header comune porta lì. Senza data-sito restano quelle di H.
  // 17 nov: il sito è uno, visto in più mood (MOOD: Botanica e Fotografia, che diventerà Pop). Acquerello (i), Incisione (e) e Pittura (h) sono da parte: restano ai loro indirizzi, niente porta più lì
  const SITI = { i: ['acquerello.html', 'azienda-i.html', 'vino-i.html'], d: ['moderna-d.html', 'azienda-d.html', 'vino.html'], e: ['moderna-e.html', 'azienda-e.html', 'vino-e.html'], h: ['moderna-h.html', 'azienda.html', 'vino.html'], b: ['botanica-pop.html', 'azienda.html', 'vino-b.html'] /* 20 nov: "cambia la pagina di Botanica nello switch": la home di Botanica è la prova col layout del Pop; la vecchia, botanica.html, resta al suo indirizzo */, f: ['pop-b.html', 'pop-azienda.html', 'pop-vino.html'] /* Botanica e Pop: home e pagina del vino loro; Botanica ha ancora l'azienda di Pittura. 20 nov: "è Pop, non più Fotografia": f sono le pagine Pop (foto.html e vino-f.html restano ai loro indirizzi) */ }, MOOD = { b: 'Botanica', f: 'Pop' }, qui = location.pathname.split('/').pop() || 'index.html';
  if (window.top === window) try { const m = sessionStorage.getItem('fs-mood'); if (qui !== 'azienda.html') sessionStorage.setItem('fs-mood', document.body.dataset.sito || ''); else if (MOOD[m]) document.body.dataset.sito = m; } catch (e) {} // l'azienda è una pagina sola per tutti: prende il mood da cui si arriva, così la barra riporta lì. Nella finestra dell'angolo del mood (sotto) no: la pagina lì è un'anteprima
  const SITO = SITI[document.body.dataset.sito];
  const [home, azienda, vino] = document.body.dataset.pagine?.split(',') || SITO || ['index.html', 'azienda.html', 'vino.html']; /* data-pagine (19 nov, Pop): home, azienda e vino di una prova che usa il mood di un altro sito (pop-b.html e pop-vino.html stanno in Fotografia) */
  if (SITO) {
    document.querySelectorAll(qui === home ? 'a[href="index.html"]' : 'a[href^="index.html"]').forEach((a) => a.setAttribute('href', home + a.getAttribute('href').slice(10))); // sulla home stessa solo il logo: le ancore le sistema moderna-kit
    document.querySelectorAll('a[href^="azienda.html"]').forEach((a) => a.setAttribute('href', azienda + a.getAttribute('href').slice(12)));
  }
  /* IL CAMBIO DI MOOD (20 nov): lo disegna js/cambio-mood.js; qui dove porta. La stessa pagina (home, azienda o vino: con data-pagine anche nelle prove del Pop) nel mood
     successivo; niente fuori dai mood, dove l'altro mood ha la stessa pagina (azienda.html) e nella finestra che mostra l'altra pagina */
  const sito = document.body.dataset.sito, ruolo = Math.max(0, [home, azienda, vino].indexOf(qui)), chiavi = Object.keys(MOOD);
  const dopo = chiavi[(chiavi.indexOf(sito) + 1) % chiavi.length], meta = MOOD[sito] ? SITI[dopo][ruolo] + (ruolo === 2 ? location.search : '') : '';
  const cambio = meta && meta.split('?')[0] !== qui && window.top === window ? { meta, dopo, nome: MOOD[dopo] } : null;
  /* arrivati dal cambio di mood (js/cambio-mood.js): la pagina era già nell'onda con l'apertura fatta, qui le aperture partono finite (20 nov: "il cambio del mood non deve far
     ristartare l'ingresso delle bottiglie"). Vale qualche secondo e una volta sola; nella finestra dell'onda non si legge, se no la consumerebbe lei */
  let arrivo = false;
  if (window.top === window) try { const t = +sessionStorage.getItem('fs-arrivo'); sessionStorage.setItem('fs-arrivo', ''); arrivo = t > 0 && Date.now() - t < 10000; } catch (e) {}
  window.FS = {
    data: D,
    lenis, reduce, touch, home, cambio, arrivo,
    isMobile: () => innerWidth < 768,
    wine: (id) => D.byId[id],
    wineUrl: (id) => `${vino}?id=${encodeURIComponent(id)}`,
    collection: (id) => D.collections.find((c) => c.id === id),
    scrollTo: (target) => (lenis ? lenis.scrollTo(target, { offset: 0 }) : document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' })),
    // useGrouping 'always': in it-IT il punto delle migliaia altrimenti manca sotto 10.000 (€ 1000)
    euro: (n) => '€ ' + n.toLocaleString('it-IT', { minimumFractionDigits: n % 1 ? 2 : 0, useGrouping: 'always' }),
    // titolo [data-righe]: parole in una maschera, entrano quando il titolo arriva in vista (stile in base.css)
    righe: (el) => {
      let i = 0;
      el.innerHTML = el.innerHTML.split(' ').map((w) => `<span class="w"><span style="--i:${i++}">${w}</span></span>`).join(' ');
      const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add('is-in'); io.disconnect(); } }, { threshold: 0.4 });
      FS.dopoIngresso(() => io.observe(el));
    },
    // dopo l'ingresso dal portone (se c'è), altrimenti subito
    dopoIngresso: (fn) => (document.documentElement.classList.contains('ingresso-attivo') ? document.addEventListener('fs:ingresso-fine', fn, { once: true }) : fn())
  };

  // ancore interne con lo scroll fluido
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href*="#"]'), page = (p) => p.replace(/index\.html$/, '');
    if (!a || a.hash.length < 2 || page(a.pathname) !== page(location.pathname) || a.search !== location.search) return; // anche index.html#x quando si è già in home; con un'altra query è un'altra pagina
    const t = document.querySelector(a.hash);
    if (!t) return;
    e.preventDefault();
    FS.scrollTo(t);
  });

  // altezze che cambiano dopo il caricamento delle immagini: ricalcola i pin
  addEventListener('load', () => ScrollTrigger.refresh());
})();
