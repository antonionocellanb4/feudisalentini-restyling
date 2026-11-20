/* Le sezioni sotto le foto di pop-b.html (19 nov 2026): "ora bisogna aggiungere le altre sezioni, quelle dell'azienda, i premi, le news, in stile pop, come stiamo andando".
   L'azienda è scritta nell'html (testi della pagina dell'azienda). Qui: i premi e le news, che vengono da js/data.js, e i movimenti.
   Premi: il numero è la somma delle medaglie dei vini (FS.wine().premi, dal bilancio di sostenibilità del cliente); sotto, quante per concorso, ognuno col suo loghetto. Le tre fasce con
   tutte le medaglie sono state tolte ("possiamo evitare tutto questo"): _archivio-prove/pop-fasce-medaglie-19nov. News: una riga per notizia, portano al sito di adesso.
   Il segno a pennarello (.pp-riga, css/pop-prove.css) si disegna quando la sua riga entra: qui si mette solo la classe, il resto è css. Con le animazioni ridotte niente
   di tutto questo: righe già disegnate. */
const $ = (q, r = document) => r.querySelector(q), $$ = (q, r = document) => [...r.querySelectorAll(q)];
const fermo = matchMedia('(prefers-reduced-motion: reduce)').matches;
const RIGA = '<svg class="pp-riga" viewBox="0 0 1000 12" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M3 7 C120 2 260 11 400 6 S700 2 860 7 S960 9 997 5"/></svg>';

/* ---- i premi ---- */
const premi = FS.data.wines.flatMap((w) => w.premi.map((p) => ({ w, p })));
console.assert(premi.length, 'premi: nessuna medaglia nei dati');
$('[data-premi-n]').textContent = premi.length;
/* un loghetto per concorso, non uno per medaglia ("mettili i loghetti ma non ripetuti come erano"): la sua medaglia più alta e, a pari grado, la più recente */
const GRADI = ['Oro', 'Argento', 'Bronzo'], grado = (p) => GRADI.indexOf(p.medaglia) + 1 || 9;
const conta = {}, logo = {};
premi.forEach(({ p }) => { conta[p.concorso] = (conta[p.concorso] || 0) + 1; const l = logo[p.concorso]; if (!l || grado(p) < grado(l) || (grado(p) === grado(l) && p.anno > l.anno)) logo[p.concorso] = p; });
$('.pd-conta').innerHTML = Object.entries(conta).sort((a, b) => b[1] - a[1]).map(([nome, n]) => `<div><dt>${nome}</dt><dd>${n}<img src="${logo[nome].img}" alt="" loading="lazy" decoding="async"></dd></div>`).join('');

/* ---- le news ---- */
$('.pq-lista').innerHTML = FS.data.news.map((n) => `<li class="pq-riga">${RIGA}<a class="pq-n" href="${n.url}" target="_blank" rel="noopener"><span class="pq-d">${n.date}</span><h3 class="pq-h">${n.title}</h3><img src="${n.img}" alt="" loading="lazy" decoding="async"></a></li>`).join('');

/* ---- i movimenti ---- */
if (!fermo) {
  document.body.classList.add('pp-attesa');
  const vede = new IntersectionObserver((voci) => voci.forEach((v) => { if (v.isIntersecting) { v.target.classList.add('is-su'); vede.unobserve(v.target); } }), { rootMargin: '0px 0px -14% 0px' });
  $$('.pa-testa, .pa-riga, .pq-riga').forEach((r) => vede.observe(r));

  /* l'azienda dinamica ("rifarei la sezione sulla famiglia Varvaglione come una cosa dinamica"): le foto dei capitoli escono dalle righe e diventano una pila di stampe
     che resta ferma accanto al testo; ogni capitolo che sale butta la sua stampa sulla pila, legata allo scorrimento (tornando su, torna giù). La versione ferma, con le
     foto nelle righe, resta per le animazioni ridotte: _archivio-prove/pop-azienda-righe-19nov */
  const pila = $('.pa-pila'), stretto = () => innerWidth <= 860, POSA = [[-4, -3, 2], [3.5, 4, -3], [-2, -2, -2], [5, 3, 3]]; /* come si posa ogni stampa: gradi, x%, y% */
  /* "no, mi servono altre alternative": tre versioni fra cui scegliere dal pannello Prove (?azienda=), stesso html e stessi testi.
     palco (uno schermo fermo per capitolo: titolo grande, la foto vola dentro e fuori), pila, striscia (i capitoli scorrono di lato).
     Scelta sua: "mettiamo palco", che ora è quella senza niente nell'indirizzo; le altre due restano nel pannello finché non dice di toglierle */
  const quale = ['pila', 'striscia'].find((v) => v === new URLSearchParams(location.search).get('azienda')) || 'palco';
  const giro = $('.pa-giro'), righe = $$('.pa-riga');
  if (giro) { /* company.html usa premi e news senza l'azienda della home (la sua storia è quella del Chi siamo) */
  $('.pa').classList.add('is-viva', 'is-' + quale);
  if (quale === 'palco') {
    /* un solo timeline lungo quanto il palco: ogni capitolo entra nell'ultimo mezzo passo prima del suo numero, sta fermo mezzo passo, poi esce */
    const tl = gsap.timeline({ defaults: { ease: 'power2.out' }, scrollTrigger: { trigger: giro, start: 'top top', end: 'bottom bottom', scrub: 0.6, invalidateOnRefresh: true } });
    righe.forEach((r, k) => {
      const f = $('.pa-f', r), t = [$('.pa-n', r), $('.pa-h', r), ...$$('.pa-c > :not(.pa-h)', r)], g = k % 2 ? 3 : -3;
      gsap.set(f, { rotation: g });
      if (k) tl.fromTo(t, { yPercent: 40, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.3, stagger: 0.04 }, k - 0.3)
        .fromTo(f, { y: () => innerHeight, rotation: g + 22 }, { y: 0, rotation: g, duration: 0.42 }, k - 0.42)
        .fromTo(r, { '--su': 0 }, { '--su': 1, duration: 0.35, ease: 'none' }, k - 0.3);
      if (k < righe.length - 1) tl.to(t, { yPercent: -30, autoAlpha: 0, duration: 0.2, stagger: 0.03, ease: 'power1.in' }, k + 0.5)
        .to(f, { y: () => -innerHeight, rotation: g - 16, duration: 0.4, ease: 'power1.in' }, k + 0.5);
    });
    tl.to({}, { duration: 0.5 }, righe.length - 1);
  }
  if (quale === 'striscia') {
    const ol = $('.pa-righe');
    /* offsetWidth, non scrollWidth: quello cambia con le foto che scivolano e la corsa finiva nel posto sbagliato */
    const corsa = gsap.to(ol, { x: () => giro.clientWidth - ol.offsetWidth, ease: 'none', scrollTrigger: { trigger: giro, start: 'top top', end: 'bottom bottom', scrub: 0.6, invalidateOnRefresh: true } });
    /* ogni foto scivola un po' dentro il suo capitolo mentre attraversa lo schermo: dà profondità alla corsa */
    righe.forEach((r, k) => { const g = k % 2 ? 3 : -3;
      gsap.fromTo($('.pa-f', r), { xPercent: 20, rotation: g + 7 }, { xPercent: -12, rotation: g - 3, ease: 'none', scrollTrigger: { containerAnimation: corsa, trigger: r, start: 'left right', end: 'right left', scrub: true } }); });
  }
  if (quale === 'pila') righe.forEach((r, k) => {
    const f = $('.pa-f', r), [g, x, y] = POSA[k % POSA.length], lato = k % 2 ? -1 : 1, sotto = pila.lastElementChild;
    pila.append(f);
    const tl = gsap.timeline({ scrollTrigger: { trigger: r, start: () => `top ${stretto() ? 100 : 78}%`, end: () => `top ${stretto() ? 58 : 26}%`, scrub: 0.6, invalidateOnRefresh: true } });
    /* a schermo largo la stampa sale da sotto; sul telefono entra di lato, perché da sotto passerebbe sopra il testo che si sta leggendo */
    tl.fromTo(f, { x: () => (stretto() ? innerWidth * lato : 0), y: () => (stretto() ? 0 : innerHeight), xPercent: x + 22 * lato, yPercent: y, rotation: g + 26 * lato }, { x: 0, y: 0, xPercent: x, yPercent: y, rotation: g, duration: 1, ease: 'power2.out' }, 0);
    if (sotto) tl.to($('figcaption', sotto), { autoAlpha: 0, duration: 0.4 }, 0.3); /* la didascalia della stampa che finisce sotto se ne va: ne spunterebbe un pezzo dal bordo */
  });
  }
}
