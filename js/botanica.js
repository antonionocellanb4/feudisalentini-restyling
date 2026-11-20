/* BOTANICA IN VERTICALE, "DISCESA" (17 nov 2026; scelta fra tre prove: "scelgo discesa come modello", le altre due in _archivio-prove/botanica-17nov-tre-prove).
   Nata da "dobbiamo uscire da questo setting" (targa, ripiano, bottiglie) e "guarda quanto sono belle (le grafiche), le mettiamo a destra o a sinistra o al centro in una forma":
   le piante come nelle pagine del cliente, grandi, tono su tono, intere. Niente palco: si scorre e basta. Ogni collezione è una pagina lunga con la sua pianta, larga quasi quanto lo schermo,
   che scorre più piano del resto; il fondo della sezione passa da un colore all'altro a cavallo dei confini. Dopo la copertina foto e bottiglie a righe alterne (17 nov: "il racconto è foto e bottiglia"),
   foto che si scoprono dal basso, bottiglie che salgono, il racconto del cliente fra le righe (titolo lettera per lettera, testo parola per parola).
   Markup e testi in sections/botanica.html, stile in css/botanica-v.css. In comune con le altre pagine di Botanica: colori e piante (js/dati-bf.js), la scheda del vino (js/scheda.js),
   i vini del menu e dei più venduti (FS.stileVino). Le foto dei vini non si toccano. */
(() => {
  const { $, $$, reduce, clamp, spezza, titoli, collezioni, apri } = FS.mk;
  const sec = $('.erb'), apre = $('.erb-apre', sec), nav = $('.erb-tappe', sec), testata = $('[data-nav]');
  const ORDINE = ['luxury', 'lounge', 'classica', 'terra', 'internazionali', 'organic']; /* l'ordine delle copertine nel file del cliente (all.ai) */
  const BREVE = { luxury: 'Luxury', lounge: 'Lounge Bar', classica: 'Classic', terra: 'Terra', internazionali: 'International', organic: 'Organic' }; /* i nomi delle copertine */
  const dati = collezioni();
  const lista = ORDINE.map((id) => ({ ...dati.find((c) => c.col.id === id), ...window.FS_BF.find((t) => t.id === id) })).filter((t) => t.col && t.c);
  console.assert(lista.length === 6, 'botanica: manca una collezione nei dati');
  const N = lista.length, num = (i) => String(i + 1).padStart(2, '0');
  const maschera = (t) => `url(${new URL(`assets/botanica/${t.pianta}.webp`, location.href)})`; /* indirizzo intero: dentro una variabile css un indirizzo relativo partirebbe dalla cartella del foglio di stile */
  const colora = (el, t) => { for (const [k, v] of [['--c', t.c], ['--c2', t.c2], ['--c3', t.c3], ['--ar', t.ar], ['--m', maschera(t)]]) el.style.setProperty(k, v); };
  const arts = lista.map((t) => $(`.erb-col[data-col="${t.id}"]`, sec));
  console.assert(arts.every(Boolean), 'botanica: manca una collezione nel markup');
  arts.forEach((a, i) => colora(a, lista[i]));
  const scrivi = (el, k, v) => { if (el['_' + k] !== v) { el['_' + k] = v; el.style.setProperty(k, v); } }; /* scrive solo se cambia */

  /* ---- l'apertura: i sei mood del cliente a toni invertiti (fondo scuro, pianta chiara) si danno il cambio da soli ogni 4,6 s finché si resta in cima; i sei nomi lo portano sul loro (mouse o fuoco), al clic vanno alla collezione ---- */
  const umori = $('.erb-umori', apre);
  umori.innerHTML = lista.map(() => '<div class="erb-umore"><i class="erb-pianta"></i></div>').join('');
  const um = $$('.erb-umore', umori);
  um.forEach((el, i) => colora(el, lista[i]));
  $('.erb-scegli', apre).innerHTML = lista.map((t, i) => `<li><button type="button" data-vai="${i}" aria-pressed="false">${BREVE[t.id]}</button></li>`).join('');
  const scelte = $$('.erb-scegli button', apre);
  let umore = -1, fermo = false, togli = 0;
  const metti = (k) => {
    if (k === umore) return;
    const prima = umore; umore = k;
    um.forEach((el, n) => { el.classList.toggle('is-su', n === k); el.classList.toggle('is-sotto', n === prima); }); /* quello di prima resta pieno sotto finché il nuovo non è entrato */
    scelte.forEach((b, n) => b.setAttribute('aria-pressed', n === k));
    clearTimeout(togli); togli = setTimeout(() => um[prima]?.classList.remove('is-sotto'), 1300);
  };
  metti(0);
  scelte.forEach((b, n) => { for (const ev of ['pointerenter', 'focus']) b.addEventListener(ev, () => { fermo = true; metti(n); }); for (const ev of ['pointerleave', 'blur']) b.addEventListener(ev, () => { fermo = false; }); });
  if (!reduce) setInterval(() => { if (!fermo && scrollY < innerHeight * 0.4 && !document.hidden && !sec.classList.contains('is-zoom')) metti((umore + 1) % N); }, 4600);

  /* ---- i testi: titolo lettera per lettera, racconto parola per parola (le parole in corsivo del cliente restano in corsivo) ---- */
  const spezzaParole = (el) => {
    const ws = [];
    const giro = (n) => [...n.childNodes].forEach((k) => {
      if (k.nodeType === 1) return giro(k);
      if (k.nodeType !== 3) return;
      const f = document.createDocumentFragment();
      k.textContent.split(/(\s+)/).forEach((p) => { if (!p) return; if (/^\s+$/.test(p)) return f.append(p); const w = document.createElement('span'); w.className = 'w'; w.textContent = p; f.append(w); ws.push(w); });
      k.replaceWith(f);
    });
    giro(el);
    return ws;
  };
  const lettere = arts.map((a) => spezza($('.erb-h', a)));
  const parole = arts.map((a) => $$('.erb-rac p', a).flatMap(spezzaParole));
  const accendi = (W, p) => { const n = W.length; W.forEach((w, j) => scrivi(w, 'opacity', (0.24 + 0.76 * clamp((p * (n + 6) - j) / 6)).toFixed(2))); };
  const pezzo = (q) => arts.map((a) => $(q, a));
  const cov = pezzo('.erb-cover'), nome = pezzo('.erb-nome'), rac = pezzo('.erb-rac'), vini = pezzo('.erb-vini'), testo = pezzo('.erb-testo'), piante = pezzo('.erb-pianta');
  const ims = arts.map((a) => [...$('.erb-foto', a).children]);

  /* ---- la scheda del vino: dietro la bottiglia la pianta della collezione, intera e grande, senza la targa intorno (come nel racconto); mentre è aperta l'header torna scuro sul crema ---- */
  const disegno = (w, box, rit) => {
    const t = lista.find((x) => x.id === w.collection); if (!t) return (box.innerHTML = '');
    colora(box, t);
    box.innerHTML = '<i class="erb-zp"></i>';
    if (!reduce) gsap.fromTo(box.firstChild, { '--g': 0, opacity: 0 }, { '--g': 1, opacity: 1, duration: 1.6, ease: 'expo.out', delay: rit });
  };
  FS.stileVino = (w) => { const t = lista.find((x) => x.id === w.collection); return t ? `;--wine:${t.c};--c3:${t.c3};--stain:${maschera(t)}` : ''; }; /* js/nav.js lo aggiunge allo stile di ogni vino del menu */
  const scheda = Scheda(sec, { schizzi: false, disegno });
  new MutationObserver(() => { const z = sec.classList.contains('is-zoom'); if (z === !!testata.dataset.forza) return; if (z) testata.dataset.forza = 'light'; else delete testata.dataset.forza; dispatchEvent(new Event('scroll')); }).observe(sec, { attributes: true, attributeFilter: ['class'] });

  /* ---- foto e bottiglie (17 nov: "qui avrei voluto vedere le bottiglie", "il racconto è foto e bottiglia"): righe alterne, accanto a ogni foto la bottiglia che ci si vede (data-vino),
     alle foto senza una bottiglia riconoscibile i vini che restano, poi i vini senza foto a coppie. Al massimo sei bottiglie: se ce ne sono di più, "Tutti i N vini" apre la cantina.
     Il racconto del cliente dopo le prime due righe. Clic su una bottiglia: la scheda, con la bottiglia che parte da lì ---- */
  const MAX = 6, coppie = (xs) => xs.reduce((r, x, j) => (j % 2 ? r[r.length - 1].push(x) : r.push([x]), r), []);
  const bott = (w, t) => `<button class="erb-bott" type="button" aria-label="${w.name}, apri la scheda"><img src="${w.bottle}" alt="" width="653" height="1024" loading="lazy" decoding="async">`
    + `<span><b>${w.name}</b>${t.vini.some((x) => x !== w && x.name === w.name) ? w.uve : w.denom}</span></button>`; /* le due Primaura hanno nome e denominazione uguali: sotto le uve */
  const botts = arts.map((a, k) => {
    const t = lista[k], resta = [...t.vini], foto = [...$('.erb-foto', a).children];
    const fb = foto.map((f) => { const j = resta.findIndex((w) => w.id === f.dataset.vino); return [f, j < 0 ? null : resta.splice(j, 1)[0]]; });
    let n = fb.filter((c) => c[1]).length;
    fb.forEach((c) => { if (!c[1] && n < MAX && resta.length) { c[1] = resta.shift(); n++; } });
    const altre = resta.splice(0, MAX - n), righe = [...fb.filter((c) => c[1]), ...coppie(fb.filter((c) => !c[1]).map((c) => c[0])), ...coppie(altre)];
    const storia = document.createElement('div'), vs = [];
    storia.className = 'erb-storia';
    righe.forEach((r, j) => {
      if (j === 2) storia.append(testo[k]);
      const d = document.createElement('div');
      d.className = j % 2 ? 'erb-riga is-dx' : 'erb-riga';
      d.dataset.tipo = r.map((x) => (x.tagName ? 'f' : 'b')).join('');
      r.forEach((x) => {
        if (x.tagName) return d.append(x);
        d.insertAdjacentHTML('beforeend', bott(x, t));
        const b = d.lastElementChild; vs.push(b);
        b.addEventListener('click', () => scheda.apri(x, b));
      });
      storia.append(d);
    });
    if (righe.length < 3) storia.append(testo[k]);
    cov[k].after(storia);
    $('.erb-foto', a).remove();
    if (t.vini.length > n + altre.length) {
      vini[k].innerHTML = `<button class="btn btn--line" type="button">Tutti i ${t.vini.length} vini</button>`;
      vini[k].firstChild.addEventListener('click', () => apri(t.id));
    } else vini[k].remove();
    return vs;
  });

  /* ---- la pillola delle collezioni, come nelle altre home: collezione corrente con tre bottiglie in miniatura, 01/06, elenco ---- */
  let cur = -2, capiOn = null;
  const mini = (i) => lista[i].vini.slice(0, 3).map((w) => `<img src="${w.bottle}" alt="" decoding="async">`).join('');
  nav.innerHTML = `<ul class="fb-menu" id="fb-menu" hidden>${lista.map((t, i) => `<li><button type="button"><span class="fb-mini">${mini(i)}</span><span class="n">${num(i)}</span>${BREVE[t.id]} Collection</button></li>`).join('')}</ul>
    <button class="fb-pill" type="button" aria-expanded="false" aria-controls="fb-menu"><span class="fb-mini"></span><span class="fb-pill__t"></span><span class="fb-pill__n"></span><span class="fb-pill__v" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="1.6"/></svg></span></button>`;
  const pill = $('.fb-pill', nav), menu = $('.fb-menu', nav), navB = $$('button', menu), apriM = (on) => { menu.hidden = !on; pill.setAttribute('aria-expanded', on); };
  const segna = (i) => { cur = i; $('.fb-mini', pill).innerHTML = mini(i); $('.fb-pill__t', pill).textContent = BREVE[lista[i].id]; $('.fb-pill__n', pill).textContent = `${num(i)}/${num(N - 1)}`; navB.forEach((b, k) => b.setAttribute('aria-current', k === i)); };
  const segnaPill = (k, on) => { if (on !== capiOn) { capiOn = on; sec.classList.toggle('is-capi', on); } if (k >= 0 && k !== cur) segna(k); };
  segna(0);
  pill.addEventListener('click', () => apriM(menu.hidden));
  document.addEventListener('click', (e) => { if (!nav.contains(e.target)) apriM(false); });
  const vai = (k) => { const y = arts[k].getBoundingClientRect().top + scrollY; FS.lenis ? FS.lenis.scrollTo(y, { duration: 1.4 + Math.min(1.2, Math.abs(k - cur) * 0.25) }) : scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' }); };
  navB.forEach((b, i) => b.addEventListener('click', () => { apriM(false); vai(i); }));
  $$('[data-vai]', sec).forEach((b) => b.addEventListener('click', () => vai(+b.dataset.vai)));

  /* ---- a ogni fotogramma: il colore della sezione (quello della collezione a metà schermo; a cavallo di un confine, 0,3 schermi prima e dopo, i due si mescolano in oklab:
     in rgb fra bordeaux e verde veniva un viola fangoso), le piante che scorrono più piano, la pillola sulla collezione corrente. Sotto l'apertura il fondo scuro del mood che si vede,
     così la sua sfumatura in basso ci finisce dentro ---- */
  const mix = (a, b, x) => `color-mix(in oklab, ${a} ${(100 - x * 100).toFixed(1)}%, ${b})`;
  const tinte = ['#600027', ...lista.map((t) => t.c)], zone = [apre, ...arts];
  const stato = () => {
    requestAnimationFrame(stato);
    const q = sec.getBoundingClientRect(); if (q.bottom <= 0 || q.top >= innerHeight) return segnaPill(-1, false);
    tinte[0] = lista[Math.max(0, umore)].c3;
    const mid = innerHeight / 2, Z = innerHeight * 0.3, r = zone.map((el) => el.getBoundingClientRect());
    let i = r.findIndex((z) => mid >= z.top && mid < z.bottom); if (i < 0) i = mid < r[0].top ? 0 : r.length - 1;
    let c = tinte[i];
    if (i < r.length - 1 && r[i].bottom - mid < Z) c = mix(tinte[i], tinte[i + 1], 0.5 * (1 - (r[i].bottom - mid) / Z));
    else if (i > 0 && mid - r[i].top < Z) c = mix(tinte[i - 1], tinte[i], 0.5 + (0.5 * (mid - r[i].top)) / Z);
    scrivi(sec, 'background-color', c);
    if (!reduce) arts.forEach((a, k) => { const z = r[k + 1]; if (z.bottom < 0 || z.top > innerHeight) return; scrivi(piante[k], 'translate', `-50% ${(((mid - z.top) / z.height - 0.5) * 0.16 * innerHeight).toFixed(1)}px`); });
    segnaPill(i - 1, i >= 1);
  };
  requestAnimationFrame(stato);

  /* ---- ingressi quando le cose entrano in vista (con le animazioni ridotte niente: tutto fermo e già al suo posto) ---- */
  if (!reduce) {
    arts.forEach((a, k) => {
      gsap.fromTo(cov[k], { y: 34, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: cov[k], start: 'top 82%' } });
      gsap.set(lettere[k], { yPercent: 110 });
      ScrollTrigger.create({ trigger: testo[k], start: 'top 78%', once: true, onEnter: () => gsap.to(lettere[k], { yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: 0.02 }) });
      gsap.fromTo(nome[k], { opacity: 0 }, { opacity: 1, duration: 0.8, delay: 0.3, scrollTrigger: { trigger: testo[k], start: 'top 78%' } });
      ScrollTrigger.create({ trigger: rac[k], start: 'top 82%', end: 'bottom 50%', scrub: true, onUpdate: (st) => accendi(parole[k], st.progress) });
      accendi(parole[k], 0);
      ims[k].forEach((im) => gsap.fromTo(im, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: im, start: 'top 90%' } }));
      botts[k].forEach((b) => gsap.fromTo(b.children, { y: 48, opacity: 0 }, { y: 0, opacity: 1, duration: 1.4, ease: 'expo.out', stagger: 0.12, scrollTrigger: { trigger: b, start: 'top 92%' } }));
      if (vini[k].isConnected) gsap.fromTo(vini[k], { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: vini[k], start: 'top 88%' } });
    });
    /* l'apertura entra: titolo, poi la riga e i nomi */
    gsap.fromTo($$('.erb-titolo > *', apre), { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: 'expo.out', stagger: 0.12, delay: 0.35 });
    gsap.fromTo([$('.erb-apre__d', apre), ...scelte], { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'expo.out', stagger: 0.06, delay: 0.7 });
    gsap.fromTo(um[0], { '--g': 0 }, { '--g': 1, duration: 2, ease: 'expo.out', delay: 0.2 });
  }
  document.fonts?.ready.then(() => ScrollTrigger.refresh());

  /* la pillola fissa "I nostri vini" non si vede durante il racconto, come nelle altre home */
  const P = $('.m-pill'); P?.classList.add('in-storia');
  ScrollTrigger.create({ trigger: sec, start: 'top bottom', end: 'bottom 60%', onToggle: (st) => P?.classList.toggle('in-storia', st.isActive) });

  /* ---- in fondo: le fotografie del profilo camminano da destra a sinistra mentre la sezione passa ---- */
  const riga = $('.bo-mood__riga');
  if (!reduce) gsap.fromTo(riga, { x: () => innerWidth * 0.18 }, { x: () => -Math.max(0, riga.scrollWidth - innerWidth), ease: 'none', scrollTrigger: { trigger: '.bo-mood', start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true } });
  else riga.parentElement.style.overflowX = 'auto';
  /* i più venduti (js/tavola.js): dietro ogni bottiglia la targa della sua collezione col disegno dentro; qui colori e maschera, la forma è in css/botanica.css */
  addEventListener('load', () => $$('.tv-v__fig').forEach((f) => { const w = FS.data.wines.find((x) => $('img', f)?.getAttribute('src') === x.bottle), t = w && lista.find((x) => x.id === w.collection); if (!t) return; f.style.setProperty('--wine', t.c); f.style.setProperty('--c3', t.c3); f.style.setProperty('--stain', maschera(t)); }));
  titoli();
})();
