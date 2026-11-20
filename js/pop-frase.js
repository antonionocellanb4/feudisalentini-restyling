/* La frase con le foto (18 nov 2026), in pop-b.html fra l'apertura e le collezioni. Da sweet-tape.com la struttura e il movimento, non i materiali ("non dovevi copiare o mettere
   gli scotch, va fatto in base allo stile che stiamo adottando"; carta da pacchi e nastro in _archivio-prove/pop-carta-nastro-18nov). La curva coi vitigni che c'era prima è stata
   tolta ("togliamo anche questa, non mi piace"): è in _archivio-prove/pop-curva-vitigni-18nov.
   La frase: "Born in Salento, experienced worldwide." gigante, sul palco fermo scorre di lato, con le foto dello shooting grandi fra le parole, dal giorno alla notte
   (19 nov: "le foto che hai usato poi sono le stesse ... scegline altre": il pallone in piscina, il rosato a tavola, le carte, il brindisi in piscina di notte; tools/pop_foto.py);
   su ogni foto un giro di pennarello attorno alla bottiglia e il nome del vino accanto (prima un fumetto: scelto dal campionario pop-stili.html). Con le animazioni ridotte la frase va a capo e sta ferma.
   Prove della sezione foto (?foto=, la sceglie js/pop-prove.js): "piena" (foto a tutta larghezza con i pezzi di frase fra una e l'altra), "sipario" (foto a tutto schermo
   che si coprono dal basso, frase e nome in un riquadro bianco), "lettere" (le foto dentro le parole, si entra in una lettera), "tunnel" (si attraversa la frase in profondità)
   e "mosaico" (tutte le foto in una griglia che esplode sul mappamondo). */
const $ = (q, r = document) => r.querySelector(q), $$ = (q, r = document) => [...r.querySelectorAll(q)];
const fermo = matchMedia('(prefers-reduced-motion: reduce)').matches;
const tra = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/* ---- il giro di pennarello attorno alla bottiglia (css/pop-prove.css, .pp-cerchio; 19 nov, "cerchio pennarello ... anche sulle foto grandi"): il tracciato, fatto a mano con
   le punte che si accavallano, si scrive alla misura vera del riquadro e si riscrive quando cambia; due tratti uguali, l'inchiostro sotto e il bianco sopra ---- */
const GIRO = [[0.62, 0.04], [0.2, 0.01, 0.04, 0.3, 0.06, 0.55], [0.08, 0.825, 0.3, 0.98, 0.55, 0.97], [0.84, 0.96, 0.96, 0.7, 0.94, 0.48], [0.92, 0.225, 0.75, 0.05, 0.4, 0.07]];
const giro = (el) => {
  const w = el.clientWidth, h = el.clientHeight; if (!w || !h) return;
  const d = GIRO.map((p, i) => (i ? 'C' : 'M') + p.map((v, k) => (v * (k % 2 ? h : w)).toFixed(1)).join(' ')).join(' ');
  $('svg', el).setAttribute('viewBox', `0 0 ${w} ${h}`); $$('path', el).forEach((q) => q.setAttribute('d', d));
};
const misuraGiri = new ResizeObserver((voci) => voci.forEach((v) => giro(v.target)));
$$('.pp-cerchio').forEach((el) => { el.insertAdjacentHTML('afterbegin', '<svg aria-hidden="true"><path pathLength="1"/><path pathLength="1"/></svg>'); misuraGiri.observe(el); });

/* ---- la frase: palco fermo, scorre di lato con lo scorrimento (lettere alte un terzo dello schermo, foto grandi). La sezione è alta quanto serve alla corsa; mentre corre le
   foto si piegano appena con la velocità ("foto che si piegano con la velocità") e quando ci si ferma tornano dritte ---- */
const variante = document.body.dataset.foto || 'frase'; /* le prove della sezione foto: la scelta la mette js/pop-prove.js (?foto=) */
if (!fermo && variante === 'frase') {
  const sez = $('.pf'), palco = $('.pf-st', sez), rullo = $('.pf-rullo', palco), foto = $$('.pf-foto', rullo);
  const largo = () => rullo.lastElementChild.offsetLeft + rullo.lastElementChild.offsetWidth; /* dal layout, senza gli spostamenti delle foto (scrollWidth li conta e la corsa si allungava) */
  const corsa = () => largo() - palco.clientWidth * 0.84; /* dal bordo sinistro all'8% fino al bordo destro al 92% */
  const alto = () => (sez.style.height = `${innerHeight + corsa() * 0.75}px`);
  ScrollTrigger.addEventListener('refreshInit', alto); alto();
  ScrollTrigger.create({ trigger: sez, start: 'top top', end: 'bottom bottom', toggleClass: { targets: '.nav', className: 'pp-palco' } }); /* header senza vetro sul palco fermo, come nelle collezioni */
  const piega = foto.map((f) => gsap.quickTo(f, 'skewX', { duration: 0.6, ease: 'power3' }));
  const scorre = gsap.fromTo(rullo, { x: () => palco.clientWidth * 0.08 }, { x: () => palco.clientWidth * 0.92 - largo(), ease: 'none', scrollTrigger: { trigger: sez, start: 'top top', end: 'bottom bottom', scrub: 0.6, invalidateOnRefresh: true,
    onUpdate: (s) => { const k = Math.max(-6, Math.min(6, -s.getVelocity() / 300)); piega.forEach((q) => q(k)); } } });
  /* il giro di pennarello attorno alla bottiglia si disegna quando la sua foto è entrata (bordo sinistro al 62% dello schermo) e si cancella se si torna indietro (css/pop-prove.css) */
  sez.classList.add('pf-attesa');
  foto.forEach((f) => { const nv = $('.pp-cerchio', f); if (nv) ScrollTrigger.create({ trigger: f, containerAnimation: scorre, start: 'left 62%', end: 'right -50%', toggleClass: { targets: nv, className: 'is-su' } }); });
  ScrollTrigger.addEventListener('scrollEnd', () => piega.forEach((q) => q(0)));
  const spingi = foto.map((f) => gsap.quickSetter(f, 'x', 'px')); /* le foto passano un poco più veloci delle parole: stanno davanti */
  gsap.ticker.add(() => {
    const r = palco.getBoundingClientRect(); if (r.bottom <= 0 || r.top >= innerHeight) return;
    const tx = gsap.getProperty(rullo, 'x'), W = palco.clientWidth;
    foto.forEach((f, i) => spingi[i]((tx + f.offsetLeft + f.offsetWidth / 2 - W / 2) * 0.08));
  });
  document.fonts.ready.then(() => ScrollTrigger.refresh()); /* la corsa dipende dalla larghezza delle parole */
}

/* ---- prova "Piena": le foto a tutta larghezza si aprono da riquadro a schermo intero entrando e dentro scorrono un poco più piano; i pezzi di frase entrano di lato ---- */
if (!fermo && variante === 'piena') {
  $$('.pl-foto picture').forEach((p) => {
    gsap.fromTo(p, { clipPath: 'inset(9% 7% round 8px)' }, { clipPath: 'inset(0% 0% round 0px)', ease: 'none', scrollTrigger: { trigger: p, start: 'top bottom', end: 'top 20%', scrub: true } });
    gsap.fromTo($('img', p), { yPercent: -15 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: p, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  $$('.pl-parola').forEach((r, i) => gsap.fromTo(r, { xPercent: i % 2 ? 12 : -12 }, { xPercent: 0, ease: 'none', scrollTrigger: { trigger: r, start: 'top bottom', end: 'top 40%', scrub: true } }));
}

/* ---- prova "Sipario": palco fermo, ogni foto copre la precedente salendo dal basso e intanto si stringe da un poco più grande ---- */
if (!fermo && variante === 'sipario') {
  const quadri = $$('.pw-foto'), tl = gsap.timeline({ defaults: { ease: 'none' } });
  quadri.slice(1).forEach((f, k) => {
    const t = 0.5 + k * 1.4; /* prima una pausa: Philia e "Born in Salento," si leggono prima che salga la foto dopo */
    tl.fromTo(f, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1 }, t).fromTo($('img', f), { scale: 1.15 }, { scale: 1, duration: 1.4 }, t);
  });
  tl.to({}, { duration: 0.4 });
  ScrollTrigger.create({ trigger: '.pw', start: 'top top', end: 'bottom bottom', animation: tl, scrub: 0.6 });
}

/* ---- prova "Lettere": un velo bianco con le parole vuote, dentro si vede la foto; scorrendo si entra in una lettera (l'asta della l o della i) finché la foto è intera,
   col nome del vino; poi la parola dopo sale dal basso. Lo zoom cresce in proporzione (s = S^p), così all'occhio va a velocità costante ---- */
if (variante === 'lettere') {
  const palco = $('.pk-st'), passi = $$('.pk-passo', palco).map((f) => ({ f, t: $('.pk-velo text', f), velo: $('.pk-velo', f), img: $('img', f), nv: $('.pp-cerchio', f), S: 50, o: [0, 0], z: { p: 0 } }));
  /* le altre cose del vino, appese sotto il nome (19 nov: "far uscire anche altre info sul vino che possono interessare chi scrolla ... mentre scrollo escono, vale per tutti"):
     denominazione e gradi, le note, con cosa si beve. Vengono da js/data.js, mai scritte qui; quello che un vino non ha non si mette (Marpiccolo non ha abbinamenti).
     Le stesse vanno nella didascalia, per lo schermo parlante e per le animazioni ridotte */
  passi.forEach((d) => {
    const v = FS.wine(d.nv.dataset.vino), a = v.aromi.slice(0, 3);
    const righe = [[v.denom, v.alcool].filter(Boolean).join(' · '), a.length && 'Note di ' + (a.length > 1 ? `${a.slice(0, -1).join(', ')} e ${a.at(-1)}` : a[0]), v.abb && 'Con ' + v.abb[0].toLowerCase() + v.abb.slice(1)].filter(Boolean);
    $('b', d.nv).insertAdjacentHTML('beforeend', `<span class="pp-note">${righe.map((r) => `<i>${r}</i>`).join('')}</span>`);
    $('.pw-box', d.f).insertAdjacentHTML('beforeend', [v.alcool, ...righe.slice(1)].filter(Boolean).map((r) => `<span>${r}</span>`).join(''));
    d.note = $$('.pp-note i', d.nv);
  });
  const metti = (d) => {
    const s = Math.pow(d.S, d.z.p), [x, y] = d.o;
    d.t.setAttribute('transform', `matrix(${s} 0 0 ${s} ${x * (1 - s)} ${y * (1 - s)})`);
    d.velo.style.opacity = String(1 - tra((d.z.p - 0.6) / 0.4)); /* nell'ultimo tratto il bianco che resta si scioglie: lo zoom si ferma prima di coprire tutto */
  };
  /* le parole si misurano su un testo nascosto nella pagina: dentro la maschera il browser le misura solo dopo averle disegnate (fuori schermo davano zero) */
  const metro = palco.appendChild(document.createElement('span')), largo = (s) => { metro.textContent = s; return metro.getBoundingClientRect().width; };
  metro.className = 'pk-metro'; metro.setAttribute('aria-hidden', 'true');
  const adatta = () => { /* le parole larghe quasi quanto lo schermo, il blocco al centro sotto l'header; poi dove sta la lettera in cui si entra */
    const cima = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 0;
    passi.forEach((d) => {
      const righe = [...d.t.children], n = righe.length, W = d.f.clientWidth, H = d.f.clientHeight; /* la misura di ogni foto: con le animazioni ridotte stanno una sotto l'altra */
      const lunga = Math.max(...righe.map((r) => largo(r.textContent))); /* la riga più larga, a 100px */
      const F = Math.min((W * 0.92 * 100) / lunga, ((H - cima) * 0.78) / (n * 0.84)), k = F / 100; /* metro è a 100px */
      d.t.style.fontSize = `${F}px`;
      const y0 = (H + cima) / 2 + 0.35 * F - (n - 1) * 0.42 * F; /* la prima linea di base: il blocco, dalle maiuscole all'ultima base, sta al centro */
      righe.forEach((r, i) => r.setAttribute('y', (y0 + i * 0.84 * F).toFixed(1)));
      const riga = righe[n - 1].textContent, i = riga.indexOf(d.f.dataset.lettera); /* la riga è centrata: il centro della lettera dal centro della riga */
      d.o = [W / 2 + (largo(riga.slice(0, i)) + largo(riga[i]) / 2 - largo(riga) / 2) * k, y0 + (n - 1) * 0.84 * F - 0.25 * F];
      /* l'asta (circa 0,11 em) dovrebbe coprire tutto lo schermo, ma oltre circa 30.000 pixel dal punto dello zoom il browser disegna male le lettere (spicchi bianchi,
         poi tutto bianco: era il "glitcha tutto"). Quindi lo zoom si ferma dove la lettera più lontana resta sotto 20.000 pixel veri (contando la densità dello schermo) */
      const mezza = (lunga * k) / 2, alto = y0 - 0.8 * F, basso = y0 + (n - 1) * 0.84 * F + 0.3 * F; /* il blocco delle parole: centrato, dalle maiuscole alle discendenti */
      const lontano = Math.hypot(Math.max(d.o[0] - (W / 2 - mezza), W / 2 + mezza - d.o[0]), Math.max(d.o[1] - alto, basso - d.o[1]));
      d.S = Math.min((2.6 * Math.max(W, H)) / (0.11 * F), 20000 / (lontano * Math.min(devicePixelRatio || 1, 3)));
      metti(d);
      /* il giro di pennarello: attorno alla bottiglia della foto intera. La foto riempie lo schermo dal centro (object-fit: cover), larga 3:2 sul computer e 4:5 sul telefono:
         data-pl e data-p dicono dove sta la bottiglia in ognuna (x0, y0, x1, y1 in centesimi) e da che parte va il nome. Un po' di margine attorno; se la bottiglia è più alta
         dello schermo il giro si ferma sotto l'header e sopra il bordo basso */
      const larga = matchMedia('(min-width: 861px)').matches, v = (larga ? d.nv.dataset.pl : d.nv.dataset.p).split(','), [ba, bb, bc, bd] = v.slice(0, 4).map((n) => n / 100), r = larga ? 1.5 : 0.8, Dw = Math.max(W, H * r), Dh = Dw / r;
      const mx = (bc - ba) * Dw * 0.18, my = (bd - bb) * Dh * 0.04; /* ba, bb, bc, bd: sinistra, cima, destra e fondo della bottiglia */
      const sx = Math.max(14, W / 2 + (ba - 0.5) * Dw - mx), dx = Math.min(W - 14, W / 2 + (bc - 0.5) * Dw + mx), su = Math.max(cima + 14, H / 2 + (bb - 0.5) * Dh - my), giu = Math.min(H - 14, H / 2 + (bd - 0.5) * Dh + my);
      Object.assign(d.nv.style, { left: `${sx.toFixed(1)}px`, top: `${su.toFixed(1)}px`, width: `${(dx - sx).toFixed(1)}px`, height: `${(giu - su).toFixed(1)}px` });
      d.nv.dataset.lato = v[4];
      /* quanto posto hanno le righe sotto il nome: di lato fino al bordo dello schermo, sotto il giro quanto ne resta ai due lati del suo centro */
      d.nv.style.setProperty('--nw', `${Math.max(150, v[4] === 'dx' ? W - dx - 44 : v[4] === 'sx' ? sx - 44 : 2 * Math.min((sx + dx) / 2, W - (sx + dx) / 2) - 28).toFixed(0)}px`);
    });
  };
  document.fonts.ready.then(adatta); addEventListener('resize', adatta);
  if (!fermo) {
    const tl = gsap.timeline({ defaults: { ease: 'none' } });
    let t = 0;
    passi.forEach((d, k) => {
      if (k) { tl.fromTo(d.f, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1 }, t); t += 1; }
      tl.fromTo(d.img, { scale: 1.25 }, { scale: 1, duration: 2.6 }, t)
        .to(d.z, { p: 1, duration: 2, onUpdate: () => metti(d) }, t + 0.5)
        .set(d.velo, { visibility: 'hidden' }, t + 2.5)
        .fromTo(d.nv, { '--su': 0 }, { '--su': 1, duration: 0.55, ease: 'power1.out' }, t + 2.25) /* a foto intera il pennarello fa il giro attorno alla bottiglia, poi compare il nome (css/pop-prove.css) */
        .fromTo(d.note, { autoAlpha: 0, yPercent: 70 }, { autoAlpha: 1, yPercent: 0, duration: 0.3, ease: 'power2.out', stagger: 0.4 }, t + 2.9); /* poi, scorrendo ancora, le altre cose del vino una alla volta */
      t += 4.5; /* era 3,2: il tempo in più è delle righe (.pk è più alta in proporzione) */
    });
    tl.to({}, { duration: 0.6 }); /* l'ultima foto resta intera un poco prima delle collezioni */
    ScrollTrigger.create({ trigger: '.pk', start: 'top top', end: 'bottom bottom', animation: tl, scrub: 0.6 });
    gsap.fromTo(passi[0].img, { yPercent: -10 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.pk', start: 'top bottom', end: 'top top', scrub: true } }); /* entrando, la foto dentro le lettere scorre */
  }
}

/* ---- prova "Tunnel": si va avanti dentro la frase; le parole passano al centro, le foto ai lati, in fondo c'è il mappamondo che arrivando diventa la schermata.
   Prospettiva fatta a mano: a distanza d una cosa è grande 1/(1+d) e si avvicina al centro nella stessa misura ---- */
if (!fermo && variante === 'tunnel') {
  const palco = $('.pn-st'), cose = $$('.pn-cosa', palco), box = $('.pn-fine .pw-box', palco);
  /* per ogni cosa, nell'ordine della pagina: x e y a distanza 0 (frazioni dello schermo dal centro) e quanto è lontana */
  const LARGO = [[0, 0, 0.9], [-0.34, 0.05, 1.5], [0.34, -0.06, 2.1], [0, 0, 2.7], [-0.34, -0.07, 3.3], [0.34, 0.07, 3.9], [-0.34, 0.06, 4.5], [0.34, -0.05, 5.1], [0, 0, 5.7], [0, 0, 6.5]];
  const STRETTO = [[0, 0, 0.9], [-0.16, 0.2, 1.5], [0.16, -0.2, 2.1], [0, 0, 2.7], [-0.16, -0.2, 3.3], [0.16, 0.2, 3.9], [-0.16, 0.2, 4.5], [0.16, -0.2, 5.1], [0, 0, 5.7], [0, 0, 6.5]]; /* sul telefono le foto sopra e sotto la riga delle parole */
  const fine = LARGO.at(-1)[2], cam = { z: -0.9 }, parola = cose.map((el) => el.classList.contains('pn-parola'));
  const disegna = () => {
    const W = palco.clientWidth, H = palco.clientHeight, P = W > 860 ? LARGO : STRETTO;
    /* quanto si vede ogni cosa: da lontano poco (al centro non si affollano); le parole passano attraverso lo schermo, le foto ai lati */
    const o = P.map(([, , z], i) => { const d = z - cam.z; return d < -0.45 || d > 3 ? 0 : tra((3 - d) / 0.9) * (i === P.length - 1 ? 1 : parola[i] ? tra((d + 0.15) / 0.25) : tra((d + 0.45) / 0.3)); });
    cose.forEach((el, i) => {
      const [x, y, z] = P[i], d = z - cam.z;
      const sipario = Math.max(0, ...P.map((q, j) => (parola[j] && q[2] < z ? o[j] : 0))); /* una parola davanti fa da sipario: quello che sta dietro compare quando si scioglie */
      const a = o[i] * (1 - sipario);
      if (a < 0.002) { el.style.visibility = 'hidden'; return; }
      const s = 1 / (1 + d);
      el.style.visibility = ''; el.style.opacity = a.toFixed(3); el.style.zIndex = String(Math.round(1000 - d * 100));
      el.style.transform = `translate(-50%, -50%) translate(${(x * W * s).toFixed(1)}px, ${(y * H * s).toFixed(1)}px) scale(${s.toFixed(4)})`;
    });
    box.style.opacity = tra(1 - (fine - cam.z) / 0.35).toFixed(3);
  };
  /* la corsa: 100 entrando (la prima parola arriva grande quando il palco si ferma) e 460 sul palco fermo, come l'altezza della sezione (560lvh in css/pop-prove.css) */
  const tl = gsap.timeline({ defaults: { ease: 'none' }, onUpdate: disegna }).to(cam, { z: 0.75, duration: 100 }).to(cam, { z: fine, duration: 460 });
  ScrollTrigger.create({ trigger: '.pn', start: 'top bottom', end: 'bottom bottom', animation: tl, scrub: 1 });
  disegna(); addEventListener('resize', disegna);
}

/* ---- prova "Mosaico": tutte le foto dello shooting e la frase in una griglia che sale entrando; poi la griglia esplode (ogni pezzo vola via con la sua velocità)
   e il mappamondo al centro diventa la schermata, col nome del vino ---- */
if (variante === 'mosaico') {
  const palco = $('.pm-st'), pezzi = $$('.pm-pezzo', palco), centro = $('.pm-centro', palco), box = $(':scope > .pw-box', palco), nomi = $$('.pm-nome', palco);
  const VIA = pezzi.map((_, i) => ({ k: 1.1 + ((i * 3) % 4) * 0.12, r: (((i * 5) % 7) - 3) * 3, su: 0.2 + ((i * 2) % 3) * 0.12 })); /* quanto vola via, quanto gira, quanto sale entrando */
  const v = { e: fermo ? 1 : 0, p: 0 };
  let base = [], O = [0, 0], S = 4;
  const misura = () => {
    pezzi.forEach((el) => (el.style.transform = ''));
    $$('.pm-parola > span', palco).forEach((s) => { /* le parole riempiono la loro casella */
      s.style.fontSize = '100px';
      const c = s.parentElement, k = Math.min(c.clientWidth / s.offsetWidth, c.clientHeight / s.offsetHeight);
      s.style.fontSize = `${(100 * k * 0.98).toFixed(1)}px`;
    });
    const r0 = palco.getBoundingClientRect(), rc = centro.getBoundingClientRect();
    base = pezzi.map((el) => { const r = el.getBoundingClientRect(); return [r.left - r0.left + r.width / 2, r.top - r0.top + r.height / 2]; });
    O = base[pezzi.indexOf(centro)]; S = Math.max(r0.width / rc.width, r0.height / rc.height) * 1.02;
  };
  const disegna = () => {
    const W = palco.clientWidth, H = palco.clientHeight, s = Math.pow(S, v.p), g = (s - 1) / (S - 1);
    pezzi.forEach((el, i) => {
      if (el.offsetParent === null) return; /* sul telefono due foto non ci sono */
      const [x, y] = base[i], c = el === centro, { k, r, su } = VIA[i], kk = c ? 1 : 1 + (k - 1) * g;
      const nx = O[0] + (W / 2 - O[0]) * g + (x - O[0]) * s * kk, ny = O[1] + (H / 2 - O[1]) * g + (y - O[1]) * s * kk + (1 - v.e) * H * (c ? 0.08 : su);
      el.style.transform = `translate(${(nx - x).toFixed(1)}px, ${(ny - y).toFixed(1)}px) rotate(${c ? 0 : (r * g).toFixed(2)}deg) scale(${s.toFixed(4)})`;
    });
    nomi.forEach((n) => (n.style.opacity = (1 - tra(v.p * 6)).toFixed(3)));
  };
  const rifai = () => { misura(); disegna(); };
  document.fonts.ready.then(rifai); addEventListener('resize', rifai);
  if (!fermo) {
    gsap.to(v, { e: 1, ease: 'none', scrollTrigger: { trigger: '.pm', start: 'top bottom', end: 'top top', scrub: 0.8 }, onUpdate: disegna });
    const tl = gsap.timeline({ defaults: { ease: 'none' } }).to(v, { p: 1, duration: 1, onUpdate: disegna }, 0.15).fromTo(box, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.12 }, 1.08).to({}, { duration: 0.25 });
    ScrollTrigger.create({ trigger: '.pm', start: 'top top', end: 'bottom bottom', animation: tl, scrub: 0.8 });
  }
}
