/* PAGINA DEL VINO delle versioni Botanica (vino-b.html?id=) e Fotografia (vino-f.html?id=), 13 nov 2026. Stesso contenuto, due vesti (css/pagine-bf.css), dati veri di js/data.js; colori, piante e foto da js/dati-bf.js.
   Due modi, da confrontare col selettore in alto a sinistra (PROVA: scelto uno, l'altro e il selettore si tolgono):
   - palco (si apre così su desktop): la bottiglia resta al centro per tutta la pagina e si sposta da un lato all'altro; attorno passano le scene (nome, racconto, calice e tavola, vigna e cantina, riconoscimenti),
     dietro scorre il nome in grande. Tutto legato allo scorrimento (gsap + ScrollTrigger). Botanica: sul colore della collezione, la targa col disegno segue la bottiglia e la pianta ci cresce dentro.
     Fotografia: su crema, e a "vigna e cantina" una fotografia del profilo si apre dal centro a tutto schermo.
   - pagina (&v=pagina; sempre sul telefono e con le animazioni ridotte): le stesse cose una sotto l'altra.
   Le foto dei vini non si toccano. Dipende da: gsap, FS (main.js), FS.mk (moderna-kit.js) */
(() => {
  const { $, $$, reduce, titoli, parole, apri } = FS.mk, D = FS.data, BO = document.body.classList.contains('page-vb');
  const qs = new URLSearchParams(location.search), w = FS.wine(qs.get('id')) || D.wines[0], col = FS.collection(w.collection), t = window.FS_BF.find((x) => x.id === w.collection) || window.FS_BF[0];
  const PALCO = !reduce && innerWidth > 860 && qs.get('v') !== 'pagina';
  document.title = `${w.name} · Feudi Salentini`;
  const main = $('#main');
  for (const [k, v] of [['--c', t.c], ['--c2', t.c2], ['--c3', t.c3], ['--ar', t.ar], ['--m', `url(${new URL(`assets/botanica/${t.pianta}.webp`, location.href)})`]]) main.style.setProperty(k, v);
  const dl = (righe) => `<dl class="vp-dl">${righe.filter(([, v]) => v).map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>`;
  const targa = (c) => `<span class="bo-targa ${c}" aria-hidden="true"><i class="bo-et__p"></i>${t.una ? '' : '<i class="bo-et__p bo-et__p--2"></i>'}</span>`;
  const aromi = w.aromi.join(', ').replace(/^./, (c) => c.toUpperCase());
  const premi = [...w.premi].sort((a, b) => b.anno - a.anno);
  const altri = D.wines.filter((x) => x.collection === w.collection && x !== w);
  const corto = (x) => x.name.replace(/^(Collezione 53|125 Organic|125|Terra)\s+/, '').replace(/\s+(Organic|Edition)$/, '') || x.name;
  const url = (v) => `${location.pathname.split('/').pop()}?id=${encodeURIComponent(w.id)}${v ? '&v=pagina' : ''}`;

  // pezzi comuni ai due modi
  const testa = `<p class="vp-col">${BO ? `<i>Collezione</i> <b>${t.nome}</b>` : col.name}</p><h1 class="vp-t" id="vp-t" data-chars>${w.name}</h1><p class="vp-meta">${[w.denom, w.uve, w.alcool].filter(Boolean).join(' · ')}</p><button class="${BO ? 'btn btn--line' : 'fo-link'}" type="button" data-col="${w.collection}">Vini della collezione</button>`;
  const calice = dl([['Vista', w.vista], ['Profumi', aromi], ['In tavola', w.abb]]), cantina = `${w.tecnica ? `<p class="vp-p">${w.tecnica}</p>` : ''}${dl([['Zona', w.zona], ['Resa', w.resa], ['Gradazione', w.alcool]])}`;
  const medaglie = `<ul class="vp-medaglie">${premi.map((p) => `<li><img src="${p.img}" alt="" width="96" height="96" loading="lazy" decoding="async"><span><b>${p.medaglia} ${p.anno}</b><br>${p.concorso}</span></li>`).join('')}</ul>`;
  const frecce = altri.length > 6 ? `<p class="vp-frecce">${[[-1, 'precedenti', 'M15 5l-7 7 7 7'], [1, 'successivi', 'M9 5l7 7-7 7']].map(([d, n, p]) => `<button class="vp-fr" type="button" data-fila="${d}" aria-label="Vini ${n}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${p}"/></svg></button>`).join('')}</p>` : ''; /* una riga sola, sei alla volta: oltre i sei, le frecce */
  const fila = altri.length ? `<section class="vp-sez vp-altri" aria-labelledby="vp-a"><div class="vp-altri__t"><h2 class="vp-h2" id="vp-a" data-chars>Gli altri vini della collezione</h2>${frecce}</div><div class="vp-fila">${altri.map((x) => `<a class="vp-altro" href="${FS.wineUrl(x.id)}" data-wine="${x.id}" style="--b:${x.fondo}"><span class="vp-altro__f">${BO ? targa('vp-altro__t') : ''}<img src="${x.bottle}" alt="" width="653" height="1024" loading="lazy" decoding="async"></span><span class="vp-altro__n">${corto(x)}</span></a>`).join('')}</div></section>` : '';
  const bottiglia = (c) => `<img class="${c}" src="${w.bottle}" alt="La bottiglia di ${w.name}" width="653" height="1024" decoding="async">${BO ? `<img class="${c} vp-bt--o" src="${w.bottle}" alt="" width="653" height="1024" decoding="async">` : ''}`;

  if (PALCO) {
    const scene = [['apre', 's', testa], w.desc && ['racconto', 'd', `<p class="vq-desc">${w.desc}</p>`], ['calice', 's', `<h2 class="vp-h2">Nel calice e in tavola</h2>${calice}`],
      ['cantina', 'd', `<h2 class="vp-h2">In vigna e in cantina</h2>${cantina}`], premi.length && ['premi', 's', `<h2 class="vp-h2">Riconoscimenti</h2>${medaglie}`]].filter(Boolean), N = scene.length;
    main.innerHTML = `<section class="vq${BO ? ' hero--dark' : ''}" id="hero" aria-labelledby="vp-t" style="height:${N * 100 + 30}lvh"${BO ? ' data-nav-trasparente' : ''}>
        <div class="vq-st">
          ${BO ? '' : `<div class="vq-foto" aria-hidden="true"><img src="assets/foto-ig/${t.foto}.webp" alt="" decoding="async"></div>`}
          <p class="vq-nome" aria-hidden="true">${w.name}</p>
          <div class="vq-sogg" style="--b:${w.fondo}">${BO ? targa('vp-targa') : '<i class="vq-pannello"></i>'}${bottiglia('vp-bt')}</div>
          ${scene.map(([k, lato, h], i) => `<div class="vq-sc vq-sc--${lato} vq-sc--${k}"${i ? '' : ' data-subito'}>${h}</div>`).join('')}
        </div>
      </section>${fila}`;
    const sec = $('.vq'), sogg = $('.vq-sogg'), nome = $('.vq-nome'), blocchi = $$('.vq-sc'), foto = $('.vq-foto'), lato = (i) => (scene[i][1] === 's' ? 1 : -1) * innerWidth * 0.16;
    const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' }, scrollTrigger: { trigger: sec, start: 'top top', end: 'bottom bottom', scrub: 0.7, invalidateOnRefresh: true } });
    tl.fromTo(nome, { x: () => innerWidth * 0.3 }, { x: () => -(nome.scrollWidth - innerWidth * 0.55), ease: 'none', duration: N }, 0); /* il nome grande attraversa lo schermo dietro la bottiglia */
    blocchi.forEach((b, i) => {
      if (i) tl.fromTo(b, { autoAlpha: 0, y: 70 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power2.out' }, i - 0.08).fromTo(sogg, { x: () => lato(i - 1) }, { x: () => lato(i), duration: 0.62, immediateRender: false }, i - 0.42); /* la bottiglia passa dall'altra parte, il testo entra dal lato che lascia */
      if (i < N - 1) tl.to(b, { autoAlpha: 0, y: -70, duration: 0.3, ease: 'power2.in' }, i + 0.52);
    });
    gsap.set(sogg, { x: lato(0) });
    if (BO) tl.fromTo('.vp-targa > i', { '--g': 0.72 }, { '--g': 1.06, ease: 'none', duration: N }, 0); /* la pianta cresce nella targa per tutta la pagina */
    const ic = scene.findIndex(([k]) => k === 'cantina');
    if (foto) tl.fromTo(foto, { autoAlpha: 0, clipPath: 'inset(22% 41% 22% 41%)' }, { autoAlpha: 1, clipPath: 'inset(0% 0% 0% 0%)', duration: 0.5 }, ic - 0.5).to(foto, { autoAlpha: 0, duration: 0.3 }, Math.min(N - 0.02, ic + 0.62)).fromTo(blocchi[ic], { '--f': 1 }, { '--f': 0, duration: 0.1, ease: 'none' }, ic + 0.72) /* la foto se ne va: il testo torna scuro, a metà della dissolvenza */
      .to('.vq-pannello', { autoAlpha: 0, duration: 0.2 }, ic - 0.45).to('.vq-pannello', { autoAlpha: 1, duration: 0.3 }, Math.min(N - 0.02, ic + 0.7)); /* a "vigna e cantina" la fotografia si apre dal centro a tutto schermo */
    gsap.fromTo('.vp-bt:not(.vp-bt--o)', { opacity: 0 }, { opacity: 1, duration: 1.1, ease: 'power2.out', delay: 0.25 }); gsap.fromTo('.vp-bt--o', { opacity: 0 }, { opacity: 0.3, duration: 1.1, delay: 0.5 }); /* solo l'opacità: le bottiglie sono centrate col translate del css, che gsap azzererebbe */
    if (BO) gsap.fromTo('.vp-targa', { '--s': 0.86, opacity: 0 }, { '--s': 1, opacity: 1, duration: 1.2, ease: 'expo.out', delay: 0.1 });
    gsap.fromTo($$('.vq-sc--apre > :not(.vp-t)'), { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'expo.out', stagger: 0.08, delay: 0.5 });
  } else {
    main.innerHTML = `
    <section class="vp-apre${BO ? ' hero--dark' : ''}" id="hero" aria-labelledby="vp-t" data-subito${BO ? ' data-nav-trasparente' : ''}>
      <div class="vp-apre__t">${testa}</div>
      <div class="vp-apre__f" style="--b:${w.fondo}">${BO ? targa('vp-targa') : ''}${bottiglia('vp-bt')}</div>
    </section>
    ${w.desc ? `<section class="vp-sez vp-racconto"><p class="vp-desc">${w.desc}</p></section>` : ''}
    <section class="vp-sez vp-calice" aria-labelledby="vp-c"><h2 class="vp-h2" id="vp-c" data-chars>Nel calice e in tavola</h2>${calice}</section>
    ${BO ? '' : `<figure class="fo-largo vp-foto"><img src="assets/foto-ig/${t.foto}.webp" alt="" loading="lazy" decoding="async" data-par="8"></figure>`}
    <section class="vp-sez vp-cantina" aria-labelledby="vp-v">${BO ? '<div class="vp-muro" aria-hidden="true"><i class="bo-pi bo-pi--a"></i><i class="bo-pi bo-pi--b"></i></div>' : ''}
      <div class="vp-cantina__in"><h2 class="vp-h2" id="vp-v" data-chars>In vigna e in cantina</h2>${cantina}</div></section>
    ${premi.length ? `<section class="vp-sez vp-premi" aria-labelledby="vp-p"><h2 class="vp-h2" id="vp-p" data-chars>Riconoscimenti</h2>${medaglie}</section>` : ''}${fila}`;
    const desc = $('.vp-desc'); if (desc) parole(desc);
    if (!reduce) {
      gsap.fromTo($$('.vp-bt'), { yPercent: 8, opacity: 0 }, { yPercent: 0, opacity: (i) => (i ? 0.3 : 1), duration: 1.3, ease: 'expo.out', delay: 0.25 });
      if (BO) { gsap.fromTo('.vp-targa', { '--s': 0.86, opacity: 0 }, { '--s': 1, opacity: 1, duration: 1.2, ease: 'expo.out', delay: 0.1 }); gsap.fromTo('.vp-targa > i', { '--g': 0.6 }, { '--g': 1, duration: 1.7, ease: 'expo.out', stagger: 0.12, delay: 0.3 });
        gsap.fromTo('.vp-muro > i', { '--g': 0.7 }, { '--g': 1, ease: 'none', stagger: 0.1, scrollTrigger: { trigger: '.vp-cantina', start: 'top bottom', end: 'center center', scrub: true } }); }
      gsap.fromTo($$('.vp-apre__t > :not(.vp-t)'), { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'expo.out', stagger: 0.08, delay: 0.5 });
      $$('[data-par]', main).forEach((el) => gsap.fromTo(el, { yPercent: +el.dataset.par }, { yPercent: -el.dataset.par, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));
    }
  }
  /* PROVA: il selettore dei due modi, solo dove il palco esiste (desktop, animazioni attive) */
  if (!reduce && innerWidth > 860) document.body.insertAdjacentHTML('beforeend', `<nav class="vp-alt" aria-label="Due modi della pagina da confrontare"><a href="${url(0)}" aria-current="${PALCO}">Palco</a><a href="${url(1)}" aria-current="${!PALCO}">Pagina</a></nav>`);
  $$('.foot a[href^="#"]').forEach((a) => { if (!document.getElementById(a.hash.slice(1))) a.href = FS.home + a.hash; }); /* le ancore della home nel footer comune */
  $$('[data-col]', main).forEach((b) => b.addEventListener('click', () => apri(b.dataset.col)));
  const riga = $('.vp-fila'), fr = $$('[data-fila]');
  if (fr.length) {
    const stato = () => fr.forEach((b) => { b.disabled = b.dataset.fila < 0 ? riga.scrollLeft < 4 : riga.scrollLeft > riga.scrollWidth - riga.clientWidth - 4; });
    fr.forEach((b) => b.addEventListener('click', () => riga.scrollBy({ left: b.dataset.fila * riga.clientWidth, behavior: reduce ? 'auto' : 'smooth' })));
    riga.addEventListener('scroll', stato, { passive: true }); stato();
  }
  titoli();
  if (!reduce) $$('.vp-altro').forEach((el) => gsap.fromTo(el, { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } }));
  if (!reduce && !PALCO) $$('.vp-dl > div, .vp-medaglie > li').forEach((el) => gsap.fromTo(el, { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } }));
})();
