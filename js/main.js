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
  window.FS = {
    data: D,
    lenis, reduce, touch,
    isMobile: () => innerWidth < 768,
    wine: (id) => D.byId[id],
    wineUrl: (id) => `vino.html?id=${encodeURIComponent(id)}`,
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
    if (!a || a.hash.length < 2 || page(a.pathname) !== page(location.pathname)) return; // anche index.html#x quando si è già in home
    const t = document.querySelector(a.hash);
    if (!t) return;
    e.preventDefault();
    FS.scrollTo(t);
  });

  // altezze che cambiano dopo il caricamento delle immagini: ricalcola i pin
  addEventListener('load', () => ScrollTrigger.refresh());
})();
