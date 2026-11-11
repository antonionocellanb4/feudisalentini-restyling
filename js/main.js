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
  // ogni stile è un sito a sé (body data-sito): home, azienda e scheda del vino sue, e l'header comune porta lì. Senza data-sito restano quelle di H
  const SITI = { i: ['index.html', 'azienda-i.html', 'vino-i.html'], d: ['moderna-d.html', 'azienda-d.html', 'vino.html'], e: ['moderna-e.html', 'azienda-e.html', 'vino-e.html'], h: ['moderna-h.html', 'azienda.html', 'vino.html'] }, SITO = SITI[document.body.dataset.sito];
  const [home, azienda, vino] = SITO || ['index.html', 'azienda.html', 'vino.html'];
  if (SITO) {
    const qui = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll(qui === home ? 'a[href="index.html"]' : 'a[href^="index.html"]').forEach((a) => a.setAttribute('href', home + a.getAttribute('href').slice(10))); // sulla home stessa solo il logo: le ancore le sistema moderna-kit
    document.querySelectorAll('a[href^="azienda.html"]').forEach((a) => a.setAttribute('href', azienda + a.getAttribute('href').slice(12)));
  }
  if (SITO && 'ieh'.includes(document.body.dataset.sito)) { // PROVA (11 nov): le tre versioni da confrontare, index, E e H, con un selettore fisso. Porta alla stessa pagina dell'altra versione: home, azienda, scheda dello stesso vino. Stile in css/nav.css (.sito-alt). A scelta fatta si toglie
    const ruolo = Math.max(0, SITO.indexOf(location.pathname.split('/').pop() || 'index.html')), id = new URLSearchParams(location.search).get('id');
    document.body.insertAdjacentHTML('beforeend', `<nav class="sito-alt" aria-label="Versioni del sito da confrontare">${[['i', 'Acquerello'], ['e', 'Incisione'], ['h', 'Pittura']].map(([k, n], j) => `<a href="${SITI[k][ruolo]}${ruolo === 2 && id ? `?id=${encodeURIComponent(id)}` : ''}" aria-label="Versione ${j + 1}, ${n}" aria-current="${k === document.body.dataset.sito}"><b>${j + 1}</b><span>${n}</span></a>`).join('')}</nav>`);
  }
  window.FS = {
    data: D,
    lenis, reduce, touch, home,
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
