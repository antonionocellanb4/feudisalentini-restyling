/* IL TERZO MOOD, STILE AZIENDA (company.html, css/company.css). Terza forma del 20 nov 2026: "deve essere una cosa nuova, anche nella forma di ogni sezione".
   Qui: la barra (la pagina è a sé, logo e ancore restano qui), i numeri ricontrollati sui dati, l'indice dei capitoli che in copertina è grande e scorrendo diventa la guida
   a lato col capitolo in cui si è e il filo della lettura, la mappa del Salento che si avvicina a Leporano (js/company-mappa.js), i vitigni a pannelli, il medagliere per anno
   con la tabella di tutti i premi, le notizie, il catalogo dei vini col filtro per colore e la bottiglia accanto. Le cose entrano salendo quando arrivano in vista.
   Con le animazioni ridotte tutto fermo e al suo posto (la mappa già vicina). Dipende da: FS (js/main.js: data, reduce, righe, wineUrl), gsap e ScrollTrigger, FS_MAPPA.
   Le prime due forme: _archivio-prove/company-v1-20nov e company-v2-chi-siamo-20nov */
(() => {
  const $ = (q, r = document) => r.querySelector(q), $$ = (q, r = document) => [...r.querySelectorAll(q)];
  const { data: D, reduce } = FS, tra = (t) => Math.min(1, Math.max(0, t)), largo = () => innerWidth >= 1100;

  /* ---- la barra: logo e ancore restano qui (la pagina non è ancora un mood); "Azienda" porta alla famiglia, "Premi" ai riconoscimenti; "Come nasce" (una pagina vecchia) no ---- */
  $$('a[href^="index.html"]').forEach((a) => { const h = a.getAttribute('href').slice(10), id = h === '#premi' ? '#riconoscimenti' : h; a.setAttribute('href', id && document.querySelector(id) ? id : 'company.html'); });
  $$('a[href^="azienda.html"]').forEach((a) => a.setAttribute('href', '#famiglia'));
  $$('.nav__link[data-nav-for^="p-nasce"], .nav-menu__item[href^="come-nasce"]').forEach((a) => ((a.closest('li') || a).hidden = true));

  /* ---- i numeri: quelli della frase di sintesi sono scritti nell'html (FS.righe divide l'html agli spazi, i <b> non hanno attributi); qui si rimettono dai dati ---- */
  const premi = D.wines.flatMap((w) => w.premi.map((p) => ({ w, p })));
  const N = { vini: D.wines.length, collezioni: D.collections.length, premi: premi.length };
  const b = $$('.co-sintesi__p b'); /* 4ª, vini, collezioni, premi, 2022 */
  console.assert(b.length === 5 && N.vini && N.premi, 'company: frase di sintesi o dati cambiati');
  [b[1].textContent, b[2].textContent, b[3].textContent] = [N.vini, N.collezioni, N.premi];
  $$('[data-premi-n]').forEach((el) => (el.textContent = N.premi));
  $('[data-vini-n]').textContent = `${N.vini} vini in ${N.collezioni} collezioni. Ogni riga porta alla scheda del vino.`;
  $$('[data-righe]').forEach(FS.righe);

  /* ---- 03 i vitigni: un pannello per vitigno, aperto il primo. Foto vere con la loro didascalia (quella del Primitivo è sua, le altre dicono cosa si vede) ---- */
  const VIT = [['Primitivo', 'alberello', 1920, 1280, 'Una vite di Primitivo ad alberello', 'Primitivo ad alberello'], ['Negroamaro', 'uva', 1920, 1537, 'Grappoli d’uva sulla vite', 'l’uva sulla vite'],
    ['Verdeca', 'catalogo-vite', 627, 627, 'Il tronco di una vecchia vite', 'una vecchia vite'], ['Malvasia Bianca', 'vigna-tramonto', 1920, 1280, 'La vigna al tramonto', 'la vigna al tramonto']];
  const viniDi = (v) => D.wines.filter((w) => (w.uve || '').includes(v));
  $('.co-uve').innerHTML = VIT.map(([v, f, w, h, alt, dida], i) => { const vini = viniDi(v); return `<article class="co-uva${i ? '' : ' is-aperta'}">
    <button class="co-uva__testa" type="button" aria-expanded="${!i}" aria-controls="co-uva-${i}"><span class="co-uva__nome">${v}</span><span class="co-uva__n"><b>${vini.length}</b>${vini.length === 1 ? 'vino' : 'vini'}</span></button>
    <div class="co-uva__corpo" id="co-uva-${i}"><figure><img src="assets/photo/${f}.webp" alt="${alt}" width="${w}" height="${h}" loading="lazy" decoding="async"><figcaption>${dida}</figcaption></figure>
    <ul class="co-uva__vini">${vini.map((x) => `<li><a href="${FS.wineUrl(x.id)}">${x.name}</a></li>`).join('')}</ul></div></article>`; }).join('');
  console.assert(VIT.every(([v]) => viniDi(v).length), 'company: un vitigno senza vini nei dati');
  const uve = $$('.co-uva'), apri = (u) => uve.forEach((x) => { x.classList.toggle('is-aperta', x === u); $('.co-uva__testa', x).setAttribute('aria-expanded', String(x === u)); });
  uve.forEach((u) => {
    $('.co-uva__testa', u).addEventListener('click', () => apri(u));
    u.addEventListener('mouseenter', () => { if (matchMedia('(hover: hover) and (min-width: 861px)').matches) apri(u); });
  });

  /* ---- 05 il medagliere: una colonna per anno, le medaglie dall'oro in giù impilate dal basso; il dettaglio al passaggio, tutto nella tabella ---- */
  const GRADO = { Oro: 0, Argento: 1, Bronzo: 2, 'Seal of Approval': 3 }, conta = (m) => premi.filter(({ p }) => p.medaglia === m).length;
  const parola = (n, uno, tanti) => `${n} ${n === 1 ? uno : tanti}`, anni = [...new Set(premi.map(({ p }) => p.anno))].sort();
  $('[data-premi-metalli]').textContent = `${parola(conta('Oro'), 'oro', 'ori')}, ${parola(conta('Argento'), 'argento', 'argenti')}, ${parola(conta('Bronzo'), 'bronzo', 'bronzi')} e ${conta('Seal of Approval')} Seal of Approval dai concorsi internazionali del vino, dal ${anni[0]} al ${anni.at(-1)}.`;
  $('.co-anni').innerHTML = anni.map((a) => { const qui = premi.map((x, i) => ({ ...x, i })).filter(({ p }) => p.anno === a).sort((x, y) => GRADO[x.p.medaglia] - GRADO[y.p.medaglia]);
    return `<li class="co-anno" aria-label="${a}: ${qui.length} riconoscimenti"><span class="co-anno__n" aria-hidden="true">${qui.length}</span><div class="co-anno__pila" aria-hidden="true">${qui.map(({ p, i }, j) => `<span class="co-medaglia" data-i="${i}" style="--j:${j}"><img src="${p.img}" alt="" width="40" height="40" loading="lazy" decoding="async"></span>`).join('')}</div><span class="co-anno__a" aria-hidden="true">${a}</span></li>`; }).join('');
  const righe = premi.slice().sort((x, y) => y.p.anno - x.p.anno || GRADO[x.p.medaglia] - GRADO[y.p.medaglia] || x.w.name.localeCompare(y.w.name));
  const corpo = $('.co-tutti tbody');
  righe.forEach(({ w, p }) => { const tr = corpo.insertRow(); [p.anno, w.name, p.concorso, p.medaglia].forEach((v) => (tr.insertCell().textContent = v)); });
  const tip = $('.co-tip');
  const mostra = (e) => { const m = e.target.closest('.co-medaglia'); if (!m) { tip.hidden = true; return; }
    const { w, p } = premi[+m.dataset.i], t = document.createElement('b'), v = document.createElement('div'), c = document.createElement('span');
    t.textContent = `${p.medaglia} · ${p.anno}`; v.textContent = w.name; c.textContent = p.concorso; tip.replaceChildren(t, v, c); tip.hidden = false;
    const r = tip.getBoundingClientRect(), x = Math.min(innerWidth - r.width - 12, e.clientX + 16), y = e.clientY - r.height - 14 < 8 ? e.clientY + 18 : e.clientY - r.height - 14;
    tip.style.transform = `translate(${x}px, ${y}px)`; };
  $('.co-anni').addEventListener('pointermove', mostra); $('.co-anni').addEventListener('pointerleave', () => (tip.hidden = true));
  addEventListener('scroll', () => (tip.hidden = true), { passive: true }); /* scorrendo la medaglia se ne va da sotto il mouse */

  /* ---- 06 le notizie: la più recente grande, le altre in colonna (portano al sito di adesso) ---- */
  const [prima, ...altre] = D.news, foto = (n) => `<img src="${n.img}" alt="" loading="lazy" decoding="async"${n.img.endsWith('.png') ? ' class="is-logo"' : ''}>`;
  $('.co-news__in').innerHTML = `<a class="co-news__big" href="${prima.url}" target="_blank" rel="noopener">${foto(prima)}<span class="co-news__d">${prima.date}</span><h3>${prima.title}</h3></a>
    <ul class="co-news__lista">${altre.map((n) => `<li><a href="${n.url}" target="_blank" rel="noopener"><span class="co-news__d">${n.date}</span><h3>${n.title}</h3>${foto(n)}</a></li>`).join('')}</ul>`;

  /* ---- 07 i vini: il catalogo per collezione, il filtro per colore, la bottiglia della riga sotto il mouse (o col fuoco) accanto ---- */
  const TIPI = { tutti: 'Tutti', rosso: 'Rossi', bianco: 'Bianchi', rosato: 'Rosati', dolce: 'Dolce' };
  const nTipo = (t) => (t === 'tutti' ? D.wines.length : D.wines.filter((w) => w.tipo === t).length);
  $('.co-filtri').innerHTML = Object.entries(TIPI).filter(([t]) => nTipo(t)).map(([t, n]) => `<button class="co-filtro" type="button" data-tipo="${t}" aria-pressed="${t === 'tutti'}">${n} <span>${nTipo(t)}</span></button>`).join('');
  $('.co-cat__righe').innerHTML = D.collections.map((c) => { const vini = D.wines.filter((w) => w.collection === c.id); return vini.length ? `<div class="co-coll"><div class="co-coll__t"><h3>${c.name}</h3><span data-quanti></span></div>
    ${vini.map((w) => `<a class="co-vino" href="${FS.wineUrl(w.id)}" data-id="${w.id}" data-tipo="${w.tipo}"><span class="co-vino__nome">${w.name}</span><span class="co-vino__d">${w.denom || ''}</span><span class="co-vino__u">${w.uve || ''}</span></a>`).join('')}</div>` : ''; }).join('');
  const bott = $('.co-cat__bott'), bImg = $('img', bott), bDida = $('figcaption', bott);
  const vedi = (a) => { if (!a) return; const w = D.byId[a.dataset.id]; $$('.co-vino.is-vista').forEach((x) => x.classList.remove('is-vista')); a.classList.add('is-vista');
    bImg.src = w.bottle; bImg.style.setProperty('--b', w.fondo); bDida.innerHTML = `${w.name}<span>${w.denom || ''}</span>`; };
  const filtra = (t) => { $$('.co-filtro').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.tipo === t)));
    $$('.co-coll').forEach((c) => { let n = 0; $$('.co-vino', c).forEach((a) => { const si = t === 'tutti' || a.dataset.tipo === t; a.hidden = !si; n += si; }); c.hidden = !n; $('[data-quanti]', c).textContent = n === 1 ? 'un vino' : `${n} vini`; });
    vedi($('.co-vino:not([hidden])')); };
  $('.co-filtri').addEventListener('click', (e) => { const f = e.target.closest('.co-filtro'); if (f) filtra(f.dataset.tipo); });
  $('.co-cat__righe').addEventListener('pointerover', (e) => vedi(e.target.closest('.co-vino')));
  $('.co-cat__righe').addEventListener('focusin', (e) => vedi(e.target.closest('.co-vino')));
  filtra('tutti');

  /* ---- 02 la mappa: la terra di Natural Earth in km; i nomi sono html sopra (con l'inquadratura che cambia resterebbero della loro misura). Sul computer, scorrendo
     a palco fermo, l'inquadratura passa dal sud Italia al Salento: zoom costante all'occhio (la larghezza va per potenze), il centro dritto. I nomi delle città compaiono
     avvicinandosi (da lontano si accavallerebbero), quello di Leporano per ultimo ---- */
  const M = window.FS_MAPPA, fig = $('.co-mappa'), svg = $('.co-mappa__svg'), nomi = $('.co-mappa__nomi');
  $('.co-mappa__terra').setAttribute('d', M.d);
  const SOGLIA = { mare: 0, citta: 0.55, casa: 0.72 };
  const etichette = M.luoghi.map((l) => { const e = document.createElement('span'); e.className = `co-luogo co-luogo--${l.t}`;
    if (l.t === 'casa') { const s = document.createElement('span'), m = document.createElement('small'); s.textContent = l.n; m.textContent = 'la cantina'; s.append(m); e.append(s); } else e.textContent = l.n;
    nomi.append(e); return { l, e }; });
  let z = 1;
  const inquadra = () => {
    const [a, c] = [M.largo, M.vicino], w = a[2] * Math.pow(c[2] / a[2], z), h = a[3] * Math.pow(c[3] / a[3], z);
    const cx = a[0] + a[2] / 2 + (c[0] + c[2] / 2 - a[0] - a[2] / 2) * z, cy = a[1] + a[3] / 2 + (c[1] + c[3] / 2 - a[1] - a[3] / 2) * z, vb = [cx - w / 2, cy - h / 2, w, h];
    svg.setAttribute('viewBox', vb.map((v) => v.toFixed(2)).join(' '));
    const W = fig.clientWidth, H = fig.clientHeight, s = Math.max(W / w, H / h), ox = (W - w * s) / 2, oy = (H - h * s) / 2; /* come preserveAspectRatio slice */
    etichette.forEach(({ l, e }) => { const x = ox + (l.x - vb[0]) * s, y = oy + (l.y - vb[1]) * s, dentro = x > 10 && x < W - 40 && y > 16 && y < H - 30;
      e.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)${l.t === 'casa' ? '' : ' translateY(-50%)'}`; e.style.opacity = dentro && z >= SOGLIA[l.t] ? '' : '0'; }); /* Leporano: il punto sul posto e il nome sotto (css) */
  };
  inquadra(); addEventListener('resize', inquadra);

  /* ---- l'indice dei capitoli (sul computer): in copertina grande; nei primi mezzi schermi scorsi si rimpicciolisce (--k) e diventa la guida: il capitolo in cui si è
     (l'ultimo il cui inizio ha passato metà schermo), il filo della lettura (--p), via sopra il piede ---- */
  const indice = $('.co-indice'), voci = $$('.co-indice a'), capitoli = voci.map((a) => document.querySelector(a.hash)), piede = $('.foot'), K = 0.6;
  let ora = -1, prossimo = 0;
  const guida = () => {
    prossimo = 0;
    if (!largo()) return;
    const y = scrollY, H = innerHeight, D2 = H * 0.5, k = 1 - (1 - K) * tra(y / D2);
    indice.style.setProperty('--k', k.toFixed(4)); indice.classList.toggle('is-guida', y > D2 * 0.98);
    let i = -1; capitoli.forEach((c, j) => { if (c.getBoundingClientRect().top < H * 0.5) i = j; });
    if (i !== ora) { ora = i; voci.forEach((a, j) => { a.classList.toggle('is-ora', j === i); if (j === i) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); }); }
    const t0 = capitoli[0].getBoundingClientRect().top + y, t1 = capitoli.at(-1).getBoundingClientRect().bottom + y - H;
    indice.style.setProperty('--p', tra((y - t0) / Math.max(1, t1 - t0)).toFixed(4));
    indice.classList.toggle('is-via', piede.getBoundingClientRect().top < H * 0.92);
  };
  addEventListener('scroll', () => { if (!prossimo) prossimo = requestAnimationFrame(guida); }, { passive: true });
  addEventListener('resize', guida); guida();

  if (reduce) return;

  /* ---- i movimenti ---- */
  document.body.classList.add('co-attesa');
  const sale = (sel, passo = true) => $$(sel).forEach((el, i) => { el.classList.add('co-sale'); if (passo) el.style.setProperty('--i', i % 8); });
  sale('.co-nomi li'); sale('.co-luoghi li'); sale('.co-uva'); sale('.co-bento > li'); sale('.co-news__in > *'); sale('.co-coll', false);
  const vede = new IntersectionObserver((v) => v.forEach((x) => { if (x.isIntersecting) { x.target.classList.add('is-su'); vede.unobserve(x.target); } }), { rootMargin: '0px 0px -12% 0px' });
  $$('.co-sale, .co-anno').forEach((el) => vede.observe(el)); /* le colonne del medagliere non salgono: ci cadono dentro le medaglie (css) */
  /* la copertina: la foto si scopre dal basso, le voci dell'indice salgono una alla volta */
  gsap.fromTo('.co-cop__f img', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.out', delay: 0.15, clearProps: 'clipPath' });
  if (largo() && scrollY < 10) gsap.from('.co-indice li', { autoAlpha: 0, y: 24, duration: 0.9, ease: 'power3.out', stagger: 0.06, delay: 0.3, clearProps: 'all' });
  gsap.from('.co-cop__s', { autoAlpha: 0, y: 16, duration: 0.9, ease: 'power2.out', delay: 0.7 });
  /* la mappa si avvicina a palco fermo (sul computer) */
  gsap.matchMedia().add('(min-width: 861px)', () => {
    z = 0; inquadra();
    const st = ScrollTrigger.create({ trigger: '.co-sal__giro', start: 'top top', end: 'bottom bottom', scrub: 0.6, onUpdate: (s) => { const t = tra((s.progress - 0.08) / 0.8); z = t * t * (3 - 2 * t); inquadra(); } });
    return () => { st.kill(); z = 1; inquadra(); };
  });
  document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
