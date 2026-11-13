/* NAVIGAZIONE: header (tono secondo il fondo sotto la barra, voce corrente), cantina (tutti i vini, filtri, controluce),
   menu telefono a livelli, transizione "versata" (inchiostro del colore del vino), footer.
   Contratto con gli altri agenti: document.dispatchEvent(new CustomEvent('fs:open-cantina', {detail:{tipo:'rosso'}})) apre la cantina; {col:'terra'} su una collezione. */
(() => {
  const { data, lenis, reduce } = FS;
  const root = document.documentElement;
  const nav = document.querySelector('[data-nav]');
  const menu = document.getElementById('nav-menu');
  const cantina = document.getElementById('cantina');
  const shelves = cantina.querySelector('[data-cantina-shelves]');
  const vista = cantina.querySelector('.cantina__vista');
  const burger = nav.querySelector('.nav__burger');
  const toggles = document.querySelectorAll('[data-cantina-toggle]');
  const filters = [...cantina.querySelectorAll('[data-tipo]')];
  const compact = matchMedia('(max-width: 1079px)');
  const home = document.body.classList.contains('page-home');
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

  // sulla home le voci puntano alle ancore della pagina (scroll fluido di main.js); su vino.html restano index.html#…
  if (home) document.querySelectorAll('a[href^="index.html#"]').forEach((a) => a.setAttribute('href', a.getAttribute('href').slice(10)));

  /* ---------- macchie di pigmento: tre maschere generate una volta, colorate col colore del vino ---------- */
  const rng = (s) => () => { s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const stainMask = (seed) => {
    const S = 240, c = document.createElement('canvas'); c.width = c.height = S;
    const g = c.getContext('2d'), r = rng(seed), C = S / 2, R = S * 0.33;
    // quasi un cerchio (il piede del calice), con il bordo irregolare della carta che beve
    const harm = [[2, 0.022], [3, 0.03], [5, 0.022], [7, 0.016], [11, 0.012], [17, 0.008], [29, 0.005]].map(([k, a]) => [k, a * (0.6 + r() * 0.8), r() * 6.283]);
    const blob = (cx, cy, rad, amp) => {
      g.beginPath();
      for (let i = 0; i <= 240; i++) {
        const t = (i / 240) * 6.283; let q = 1;
        for (const [k, a, p] of harm) q += a * amp * Math.sin(k * t + p * amp);
        g[i ? 'lineTo' : 'moveTo'](cx + Math.cos(t) * rad * q, cy + Math.sin(t) * rad * q);
      }
      g.closePath();
    };
    // velature: due lavature leggere che sbordano dalla macchia
    for (let i = 0; i < 2; i++) { blob(C + (r() - 0.5) * 10, C + (r() - 0.5) * 10, R * (1.05 + r() * 0.06), 1.6 + i * 0.4); g.fillStyle = 'rgba(0,0,0,.13)'; g.fill(); }
    // la macchia: chiara al centro, il pigmento si raccoglie sul bordo che asciuga
    const grad = g.createRadialGradient(C, C, 0, C, C, R * 1.04);
    grad.addColorStop(0, 'rgba(0,0,0,.28)'); grad.addColorStop(0.55, 'rgba(0,0,0,.34)'); grad.addColorStop(0.82, 'rgba(0,0,0,.52)'); grad.addColorStop(0.95, 'rgba(0,0,0,.9)'); grad.addColorStop(1, 'rgba(0,0,0,1)');
    blob(C, C, R, 1); g.fillStyle = grad; g.fill();
    g.lineWidth = 1.6; g.strokeStyle = 'rgba(0,0,0,.95)'; g.stroke();
    // l'anello del calice appoggiato una seconda volta, aperto
    const a0 = r() * 6.283; g.beginPath(); g.arc(C + R * 0.16, C - R * 0.1, R * 0.86, a0, a0 + 3.6 + r() * 1.4);
    g.lineWidth = 2; g.strokeStyle = 'rgba(0,0,0,.45)'; g.stroke();
    // fioriture: il pigmento si deposita a chiazze morbide (rumore a bassa risoluzione ingrandito)
    const n = document.createElement('canvas'); n.width = n.height = 10;
    const nd = n.getContext('2d').createImageData(10, 10);
    for (let i = 3; i < nd.data.length; i += 4) nd.data[i] = 150 + r() * 105;
    n.getContext('2d').putImageData(nd, 0, 0);
    g.globalCompositeOperation = 'destination-in'; g.drawImage(n, 0, 0, S, S); g.globalCompositeOperation = 'source-over';
    // granulazione fine
    const img = g.getImageData(0, 0, S, S), d = img.data;
    for (let i = 3; i < d.length; i += 4) if (d[i]) d[i] = Math.min(255, d[i] * (0.8 + r() * 0.34));
    g.putImageData(img, 0, 0);
    return `url(${c.toDataURL()})`;
  };
  [11, 29, 47].forEach((s, i) => root.style.setProperty(`--nav-stain-${i}`, document.body.classList.contains('page-mh') ? `url(${new URL(`assets/quadri/macchie/${i}.webp`, location.href)})` : stainMask(s))); // moderna-h: macchie dipinte a pennello (tools/dipingi_soggetto.py --notte)

  /* ---------- cantina: scaffali per collezione ---------- */
  const stainOf = (w) => `var(--nav-stain-${data.wines.indexOf(w) % 3})`;
  shelves.innerHTML = data.collections.map((c) => {
    const ws = data.wines.filter((w) => w.collection === c.id);
    return `<div class="cantina__shelf" data-cantina-col="${c.id}">
        <span class="cantina__shelf-top"><span class="cantina__shelf-name">${c.name}</span></span>
        <span class="cantina__shelf-meta">${c.line !== c.name ? `<span>${c.line}</span>` : ''}<span data-n>${plural(ws.length, 'vino', 'vini')}</span></span>
      </div>` + ws.map((w) => `<a class="cantina__wine" href="${FS.wineUrl(w.id)}" data-wine="${w.id}" data-tipo="${w.tipo}" data-cantina-col="${c.id}" style="--wine:${w.color};--stain:${stainOf(w)};--b:${w.fondo}${FS.stileVino?.(w) ?? ''}">
        <span class="cantina__glass"><i class="cantina__stain"></i><img src="${w.bottle}" alt="" width="653" height="1024" loading="lazy" decoding="async"></span>
        <span class="cantina__name">${w.name}</span>
        <span class="cantina__denom">${w.denom}</span>
        <span class="cantina__vista-row">${w.vista || '<span class="tbd">vista da confermare</span>'}</span>
        ${w.check ? `<span class="tbd" title="${w.check}">da confermare</span>` : ''}
      </a>`).join('');
  }).join('');
  const wineEls = [...shelves.querySelectorAll('[data-wine]')];
  const shelfEls = [...shelves.querySelectorAll('.cantina__shelf')];
  document.querySelectorAll('[data-cantina-total]').forEach((el) => (el.textContent = data.wines.length));

  /* ricerca (13 nov): filtra mentre si scrive, senza accenti né maiuscole; ogni parola scritta deve trovarsi in nome, denominazione, uve, collezione, colore, profumi o abbinamenti */
  const tipoLabel = { rosso: 'Rossi', rosato: 'Rosati', bianco: 'Bianchi', dolce: 'Dolce' };
  const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const testo = new Map(data.wines.map((w) => { const c = FS.collection(w.collection); return [w.id, norm([w.name, w.denom, w.uve, c.name, c.line, w.tipo, tipoLabel[w.tipo], ...w.aromi, w.abb].join(' '))]; }));
  let q = [], frase = '';
  const trova = (w) => q.every((p) => testo.get(w.id).includes(p));
  const conta = () => filters.forEach((b) => (b.querySelector('span').textContent = data.wines.filter((w) => (b.dataset.tipo === 'tutti' || w.tipo === b.dataset.tipo) && trova(w)).length));
  conta();
  const cercaHTML = `<div class="cantina__cerca"><input type="search" data-cantina-cerca aria-label="Cerca un vino" placeholder="Cerca vino, vitigno o piatto" autocomplete="off" spellcheck="false" enterkeyhint="search"><button type="button" data-cantina-cerca-x aria-label="Cancella la ricerca" hidden><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="1.5"/></svg></button></div>`;
  cantina.querySelector('.cantina__title').insertAdjacentHTML('afterend', cercaHTML);
  shelves.insertAdjacentHTML('afterend', '<p class="cantina__vuoto" role="status" hidden></p>');
  const vuoto = shelves.nextElementSibling;

  let tipo = 'tutti', shown = data.wines.length, cols = data.collections.length;
  const restVista = () => (vista.innerHTML = `<span>${plural(shown, 'vino', 'vini')} in ${plural(cols, 'collezione', 'collezioni')}</span>`);
  const setTipo = (t, animate) => {
    tipo = filters.some((b) => b.dataset.tipo === t) ? t : 'tutti';
    filters.forEach((b) => b.setAttribute('aria-pressed', b.dataset.tipo === tipo));
    wineEls.forEach((a) => (a.hidden = (tipo !== 'tutti' && a.dataset.tipo !== tipo) || !trova(FS.wine(a.dataset.wine))));
    shown = 0; cols = 0;
    shelfEls.forEach((sh) => {
      const n = wineEls.filter((a) => a.dataset.cantinaCol === sh.dataset.cantinaCol && !a.hidden).length;
      sh.hidden = !n; shown += n; cols += !!n;
      sh.querySelector('[data-n]').textContent = plural(n, 'vino', 'vini');
    });
    // pochi vini: una sola fila, scaffali più grandi (colonne = celle visibili, almeno 6)
    shelves.classList.toggle('is-few', shown <= 8);
    shelves.style.setProperty('--cantina-cols', Math.max(6, shown + cols));
    vuoto.hidden = !!shown; const altri = shown ? 0 : data.wines.filter(trova).length; /* zero per colpa del filtro del colore: lo dice, invece di far credere che il vino non ci sia */
    vuoto.textContent = shown ? '' : altri ? `Nessun vino per «${frase}» con questo filtro. In «Tutti» ${altri === 1 ? 'ce n’è 1' : `ce ne sono ${altri}`}.` : `Nessun vino per «${frase}». Si cerca per nome, vitigno, collezione, profumi e abbinamenti.`;
    restVista();
    if (animate && !reduce) [...shelves.children].filter((el) => !el.hidden).forEach((el, i) =>
      el.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 420, delay: i * 18, easing: 'cubic-bezier(.22,.8,.2,1)', fill: 'backwards' }));
  };
  filters.forEach((b) => b.addEventListener('click', () => setTipo(b.dataset.tipo, true)));

  // controluce: la riga della vista dice il colore del vino sotto il mouse o col fuoco da tastiera
  const showVista = (a) => {
    const w = FS.wine(a.dataset.wine);
    vista.innerHTML = `<i class="cantina__swatch" style="--wine:${w.color};--stain:${stainOf(w)}"></i><span><strong>${w.name}</strong>&nbsp; ${w.vista || '<span class="tbd">vista da confermare</span>'}</span>`;
  };
  shelves.addEventListener('pointerover', (e) => { const a = e.target.closest('[data-wine]'); if (a) showVista(a); });
  shelves.addEventListener('pointerleave', restVista);
  shelves.addEventListener('focusin', (e) => { const a = e.target.closest('[data-wine]'); if (a) showVista(a); });
  shelves.addEventListener('focusout', (e) => { if (!shelves.contains(e.relatedTarget)) restVista(); });
  setTipo('tutti');

  /* ---------- palcoscenico (desktop): una collezione o un colore alla volta, bottiglie grandi in piedi,
     il vino sotto il mouse si alza con la macchia dietro e il suo nome gigante sul fondo ---------- */
  const cercaSet = { key: 'cerca', wines: [], ids: '' }; /* i risultati della ricerca: sul palco prendono il posto della collezione */
  const sets = [
    ...data.collections.map((c) => ({ key: 'col:' + c.id, group: 'col', name: c.name, sub: c.line !== c.name ? c.line : '', wines: data.wines.filter((w) => w.collection === c.id) })),
    ...Object.keys(tipoLabel).map((t) => ({ key: 'tipo:' + t, group: 'tipo', name: tipoLabel[t], wines: data.wines.filter((w) => w.tipo === t) })),
    { key: 'tutti', group: 'tipo', name: 'Tutti i vini', wines: data.wines }
  ];
  const setBtn = (st) => `<li><button class="cstage__set" type="button" data-set="${st.key}" aria-pressed="false"><span class="cstage__set-name">${st.name}</span><span class="cstage__set-n">${st.wines.length}</span></button></li>`;
  const stage = document.createElement('div');
  stage.className = 'cstage';
  stage.innerHTML = `
    <div class="cstage__nav">
      <p class="cstage__h">Collezioni</p><ul>${sets.filter((s) => s.group === 'col').map(setBtn).join('')}</ul>
      <p class="cstage__h">Per colore</p><ul class="cstage__tipi">${sets.filter((s) => s.group === 'tipo').map(setBtn).join('')}</ul>
    </div>
    <div class="cstage__main">
      <p class="cstage__bg" aria-hidden="true"></p>
      <div class="cstage__row"></div>
      <div class="cstage__info" aria-live="polite"></div>
    </div>
    <button class="cstage__close" type="button" data-cantina-close>Chiudi</button>`;
  cantina.querySelector('.cantina__in').append(stage);
  stage.querySelector('.cstage__nav').insertAdjacentHTML('afterbegin', cercaHTML);
  const sRow = stage.querySelector('.cstage__row'), sInfo = stage.querySelector('.cstage__info'), sBg = stage.querySelector('.cstage__bg');
  const sBtns = [...stage.querySelectorAll('[data-set]')];
  let curSet = null, curWine = null, setTimer = 0;
  const short = (w) => w.name.replace(/^(Collezione 53|125|Terra)\s+/, '') || w.name;
  // parole lunghe nelle etichette strette: trattino morbido a metà (Susuma-niello)
  const hy = (t) => t.replace(/\S{10,}/g, (m) => m.slice(0, Math.ceil(m.length / 2)) + '­' + m.slice(Math.ceil(m.length / 2)));

  const focusWine = (w) => {
    if (!w) return;
    sRow.querySelectorAll('[data-wine]').forEach((a) => a.classList.toggle('is-on', a.dataset.wine === w.id));
    if (w === curWine) return; /* stesso vino con la fila ridisegnata (ricerca): si riaccende senza rifare nome e dati */
    curWine = w;
    sInfo.innerHTML = `<div class="cstage__id"><p class="cstage__name">${w.name}</p><p class="cstage__denom">${w.denom} · ${FS.collection(w.collection).name}</p></div>
      <dl class="cstage__facts"><div><dt>Vista</dt><dd>${w.vista || '<span class="tbd">da confermare</span>'}</dd></div>
      <div><dt>Profumi</dt><dd>${w.aromi.length ? w.aromi.slice(0, 4).join(', ') : '<span class="tbd">da confermare</span>'}</dd></div>
      <div><dt>A tavola</dt><dd>${w.abb || '<span class="tbd">Non indicato nel catalogo</span>'}</dd></div></dl>
      <a class="btn btn--gold cstage__go" href="${FS.wineUrl(w.id)}" data-wine="${w.id}">Apri la scheda</a>`;
    // nome gigante sul fondo, lettera per lettera
    sBg.innerHTML = [...w.name].map((c) => `<span>${c === ' ' ? '&nbsp;' : c}</span>`).join('');
    sBg.style.fontSize = ''; // i nomi lunghi si rimpiccioliscono per stare nella larghezza, invece di essere tagliati
    const k = sBg.clientWidth / sBg.scrollWidth;
    if (k < 1) sBg.style.fontSize = `${parseFloat(getComputedStyle(sBg).fontSize) * k * 0.97}px`;
    if (!reduce) gsap.fromTo(sBg.children, { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.9, ease: 'expo.out', stagger: 0.022 });
  };

  /* 13 nov: sul palco mai più di sei bottiglie alla volta, così restano grandi come quando la collezione ne ha tre o sei ("se apro la Classica si vedono le bottiglie mini").
     Se sono di più, in fondo alla fila c'è "Altri vini" col numero di quelli che mancano; all'ultimo giro dice Ricomincia. Vale per collezioni, colori e risultati della ricerca */
  const SEI = 6; let da = 0;
  const showSet = (key, animate = true, pagina = false) => {
    const st = key === 'cerca' ? cercaSet : sets.find((s) => s.key === key) || sets[0];
    if (st === curSet && st !== cercaSet && !pagina) return;
    if (!pagina) da = 0;
    curSet = st; if (st !== cercaSet) curWine = null;
    sBtns.forEach((b) => b.setAttribute('aria-pressed', b.dataset.set === st.key));
    const n = st.wines.length, vis = st.wines.slice(da, da + SEI), resto = n - da - vis.length;
    const fill = () => {
      if (curSet !== st) return; /* una fila in uscita non riscrive quella arrivata dopo (la ricerca disegna subito) */
      sRow.style.setProperty('--n', vis.length + (n > SEI));
      sRow.dataset.size = Math.min(n, SEI) <= 4 ? 'xl' : 'l';
      sRow.innerHTML = vis.map((w) => `<a class="cstage__wine" href="${FS.wineUrl(w.id)}" data-wine="${w.id}" style="--wine:${w.color};--stain:${stainOf(w)};--b:${w.fondo}${FS.stileVino?.(w) ?? ''}">
          <span class="cstage__glass"><i class="cstage__stain"></i><img src="${w.bottle}" alt="" width="653" height="1024" decoding="${st === cercaSet ? 'sync' : 'async'}"></span>
          <span class="cstage__label">${hy(short(w))}</span></a>`).join('')
        + (n > SEI ? `<button class="cstage__altri" type="button" aria-label="${resto ? `Altri ${resto} vini` : 'Ricomincia dai primi'}"><span class="cstage__glass"><b>${resto ? `+${resto}` : '1–' + SEI}</b></span><span class="cstage__label">${resto ? 'Altri vini' : 'Ricomincia'}</span></button>` : '');
      if (!n) { curWine = null; sBg.textContent = ''; sInfo.innerHTML = '<div class="cstage__id cstage__id--vuoto"><p class="cstage__name"></p><p class="cstage__denom">Si cerca per nome, vitigno, collezione, profumi e abbinamenti.</p></div>'; sInfo.querySelector('.cstage__name').textContent = `Nessun vino per «${frase}»`; return; }
      focusWine(vis.includes(curWine) ? curWine : vis[0]);
      if (animate && !reduce) gsap.fromTo(sRow.querySelectorAll('.cstage__glass img'), { yPercent: 40, rotation: -5, opacity: 0 },
        { yPercent: 0, rotation: 0, opacity: 1, duration: 1.1, ease: 'expo.out', stagger: 0.06 });
    };
    const old = sRow.querySelectorAll('.cstage__glass img');
    if (animate && !reduce && old.length) gsap.to(old, { yPercent: 30, opacity: 0, duration: 0.22, ease: 'power2.in', stagger: 0.01, onComplete: fill });
    else fill();
  };
  sRow.addEventListener('click', (e) => { if (!e.target.closest('.cstage__altri') || !curSet) return; da = da + SEI >= curSet.wines.length ? 0 : da + SEI; curWine = null; showSet(curSet.key, true, true); requestAnimationFrame(() => setTimeout(() => sRow.querySelector('.cstage__altri')?.focus({ preventScroll: true }), 300)); });
  /* mentre si cerca, passare col mouse su una collezione non cambia il palco; il clic sì, e svuota il campo */
  let prima = null;
  const cerche = [...cantina.querySelectorAll('[data-cantina-cerca]')];
  const cerca = (v) => {
    frase = v.trim(); q = norm(frase).split(/\s+/).filter(Boolean);
    cerche.forEach((i) => { if (i.value !== v) i.value = v; i.nextElementSibling.hidden = !v; });
    conta(); setTipo(tipo);
    if (q.length) {
      const wines = data.wines.filter(trova), ids = wines.map((w) => w.id).join();
      if (curSet === cercaSet && ids === cercaSet.ids && ids) return; /* stessi vini: la fila resta com'è */
      prima ||= curSet === cercaSet ? null : curSet; cercaSet.wines = wines; cercaSet.ids = ids; showSet('cerca', false);
    } else if (curSet === cercaSet) { const k = (prima || sets[0]).key; prima = null; showSet(k, false); }
  };
  cantina.addEventListener('input', (e) => { if (e.target.matches('[data-cantina-cerca]')) cerca(e.target.value); });
  cantina.addEventListener('click', (e) => { const x = e.target.closest('[data-cantina-cerca-x]'); if (x) { cerca(''); x.previousElementSibling.focus(); } });
  cantina.addEventListener('keydown', (e) => {
    if (!e.target.matches('[data-cantina-cerca]')) return;
    if (e.key === 'Escape' && e.target.value) { e.stopPropagation(); e.preventDefault(); cerca(''); } /* Esc prima svuota il campo, poi chiude */
    if (e.key === 'Enter') (compact.matches ? wineEls.find((a) => !a.hidden) : sRow.querySelector('[data-wine].is-on'))?.click(); /* Invio apre il primo vino trovato */
  });
  sBtns.forEach((b) => {
    b.addEventListener('click', () => { if (q.length) { prima = null; cerca(''); } showSet(b.dataset.set); });
    b.addEventListener('pointerenter', () => { clearTimeout(setTimer); if (!q.length) setTimer = setTimeout(() => showSet(b.dataset.set), 140); });
    b.addEventListener('pointerleave', () => clearTimeout(setTimer));
  });
  sRow.addEventListener('pointerover', (e) => { const a = e.target.closest('[data-wine]'); if (a) focusWine(FS.wine(a.dataset.wine)); });
  sRow.addEventListener('focusin', (e) => { const a = e.target.closest('[data-wine]'); if (a) focusWine(FS.wine(a.dataset.wine)); });
  stage.querySelector('[data-cantina-close]').addEventListener('click', () => closeCantina());
  const stageOpen = (t, col) => showSet(col ? 'col:' + col : t ? 'tipo:' + t : curSet ? curSet.key : sets[0].key, isOpen(cantina));

  /* ---------- apertura e chiusura di cantina e menu ---------- */
  const isOpen = (el) => el.classList.contains('is-open');
  let opener = null, settle = 0;
  const sync = () => {
    const any = isOpen(cantina) || isOpen(menu);
    document.querySelectorAll('#main, .foot').forEach((el) => el.toggleAttribute('inert', any));
    menu.toggleAttribute('inert', isOpen(cantina)); // sotto la cantina il primo livello del menu non riceve il fuoco
    root.classList.toggle('nav-lock', any);
    any ? lenis?.stop() : lenis?.start();
    toggles.forEach((b) => b.setAttribute('aria-expanded', isOpen(cantina)));
    burger.setAttribute('aria-expanded', any);
    burger.textContent = any ? 'Chiudi' : 'Menu';
    // chiudendo, la barra resta "da pannello" finché il pannello non è uscito
    clearTimeout(settle);
    if (any) update(); else settle = setTimeout(update, 480);
  };
  const focusIn = (el) => requestAnimationFrame(() => el?.focus({ preventScroll: true }));
  const openCantina = (t, col) => {
    if (!isOpen(cantina)) opener = document.activeElement;
    if (frase || cerche.some((i) => i.value)) cerca(''); /* si riapre sempre senza una ricerca in corso */
    setTipo(t || 'tutti', isOpen(cantina));
    stageOpen(t, col);
    cantina.scrollTop = 0;
    cantina.classList.add('is-open');
    sync();
    focusIn(cantina.querySelector(compact.matches ? '.cantina__filter[aria-pressed="true"]' : '.cstage [data-cantina-cerca]')); /* su desktop si può scrivere subito; sul telefono no, la tastiera coprirebbe l'elenco */
  };
  const closeCantina = (refocus = true) => {
    if (!isOpen(cantina)) return;
    cantina.classList.remove('is-open');
    sync();
    if (refocus) focusIn(opener && opener.isConnected && !opener.closest('[inert]') ? opener : null);
  };
  const openMenu = () => { menu.scrollTop = 0; menu.classList.add('is-open'); sync(); focusIn(menu.querySelector('.nav-menu__item')); };
  const closeAll = () => { closeCantina(false); menu.classList.remove('is-open'); sync(); };

  toggles.forEach((b) => b.addEventListener('click', () => (isOpen(cantina) ? closeCantina() : openCantina())));
  cantina.querySelector('[data-cantina-close]').addEventListener('click', () => closeCantina());
  // "‹ Menu": la cantina è il secondo livello del menu telefono
  cantina.querySelector('[data-cantina-back]').addEventListener('click', () => {
    if (!isOpen(menu)) { menu.classList.add('is-open'); opener = menu.querySelector('[data-cantina-toggle]'); }
    closeCantina();
  });
  burger.addEventListener('click', () => (isOpen(cantina) || isOpen(menu) ? (closeAll(), burger.focus()) : openMenu()));
  // un link del menu o della barra chiude i pannelli PRIMA dello scroll di main.js (che con Lenis fermo non scorrerebbe)
  [nav, menu, cantina].forEach((el) => el.addEventListener('click', (e) => { if (e.target.closest('a:not([data-wine])')) closeAll(); }));
  addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (isOpen(cantina)) closeCantina(); else if (isOpen(menu)) { closeAll(); burger.focus(); }
  });
  compact.addEventListener('change', closeAll);
  document.addEventListener('fs:open-cantina', (e) => openCantina(e.detail?.tipo, e.detail?.col)); // detail.col = id collezione (palcoscenico desktop)
  // ingresso animato della home: l'header resta nascosto (css) e entra alla fine
  document.addEventListener('fs:ingresso-fine', () => { nav.classList.add('is-in'); onScroll(); });

  /* ---------- header: fondo pieno allo scroll, tono secondo la sezione sotto la barra, voce corrente ---------- */
  const underIsDark = () => {
    const y = nav.offsetHeight + 1;
    for (const el of document.elementsFromPoint(innerWidth / 2, y)) {
      if (el.closest('[data-nav], .nav-menu, .cantina, .pour')) continue;
      if (el.closest('#hero')) return el.closest('#hero').classList.contains('hero--dark'); // la hero sfuma in --night sul canvas: lo dice la sua classe
      for (let n = el; n && n !== root; n = n.parentElement) {
        const m = getComputedStyle(n).backgroundColor.match(/[\d.]+/g);
        if (m && (m[3] === undefined || +m[3] > 0.5)) return 0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2] < 128;
      }
      return false;
    }
    return false;
  };
  const links = [...nav.querySelectorAll('[data-nav-for]')];
  const sections = [...new Set(links.flatMap((a) => a.dataset.navFor.split(' ')))];
  let raf = 0;
  function update() {
    raf = 0;
    const panel = isOpen(cantina) || isOpen(menu);
    // sopra una sezione [data-nav-trasparente] (la fiaba, mentre si cammina in orizzontale) l'header resta senza fondo
    const tr = document.querySelector('[data-nav-trasparente]')?.getBoundingClientRect(), sopra = tr && tr.top <= 0 && tr.bottom > nav.offsetHeight;
    nav.classList.toggle('is-solid', panel || (scrollY > 8 && !sopra));
    nav.dataset.tone = !panel && (nav.dataset.forza ? nav.dataset.forza === 'dark' : underIsDark()) ? 'dark' : 'light'; // forza: in moderna H la sezione dopo è già dipinta sotto la barra (js/moderna-f.js)
    const line = innerHeight * 0.4;
    let cur = sections.find((id) => { const r = document.getElementById(id)?.getBoundingClientRect(); return r && r.top <= line && r.bottom > line; });
    if (!cur && document.body.classList.contains('page-vino')) cur = 'vino'; // nella scheda di un vino la voce corrente è Vini
    links.forEach((a) => (cur && a.dataset.navFor.split(' ').includes(cur) ? a.setAttribute('aria-current', 'location') : a.removeAttribute('aria-current')));
  }
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  addEventListener('load', onScroll);
  update();

  // arrivando da vino.html su index.html#sezione: dopo il ricalcolo dei pin si riallinea all'ancora
  if (location.hash.length > 1) addEventListener('load', () => setTimeout(() => {
    const t = document.querySelector(location.hash);
    if (t) lenis ? lenis.scrollTo(t, { immediate: true }) : t.scrollIntoView();
  }, 60));

  /* ---------- transizione versata: il colore del vino si allarga come inchiostro sulla carta, poi si naviga ---------- */
  const pour = document.querySelector('.pour'), cv = pour.querySelector('canvas'), ctx = cv.getContext('2d');
  let anim = 0, busy = false;
  const fit = () => {
    const dpr = Math.min(devicePixelRatio || 1, FS.isMobile() ? 1.25 : 1.75);
    cv.width = Math.round(innerWidth * dpr); cv.height = Math.round(innerHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const shade = (hex, k) => { const n = parseInt(hex.slice(1), 16); return `rgb(${(n >> 16) * k | 0},${(n >> 8 & 255) * k | 0},${(n & 255) * k | 0})`; };
  // bordo organico: raggio modulato da armoniche che scorrono nel tempo
  const HARM = [[3, 0.05, 0, 0.9], [5, 0.034, 1.7, -1.3], [8, 0.02, 4.1, 1.7], [13, 0.012, 2.3, -2.4], [21, 0.007, 5.5, 3.1]];
  const ring = (x, y, R, t, amp = 1) => {
    ctx.beginPath();
    for (let i = 0; i <= 180; i++) {
      const a = (i / 180) * 6.2832; let q = 1;
      for (const [k, am, p, w] of HARM) q += am * amp * Math.sin(k * a + p + w * t);
      ctx[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * R * q, y + Math.sin(a) * R * q);
    }
    ctx.closePath();
  };
  const grains = Array.from({ length: 260 }, (_, i, r = rng(i + 7)) => [r() * 6.2832, -4 - r() * 26, 0.6 + r() * 1.5, 0.15 + r() * 0.4]);

  const spread = (x, y, color, done) => {
    fit(); pour.classList.add('is-on');
    const W = innerWidth, H = innerHeight, dark = shade(color, 0.6), mid = shade(color, 0.82);
    const Rmax = Math.hypot(Math.max(x, W - x), Math.max(y, H - y)) * 1.12;
    const t0 = performance.now(), dur = 900;
    const frame = (now) => {
      const p = Math.min(1, Math.max(0, (now - t0) / dur)), t = p * 3;
      const R = 14 + (Rmax - 14) * Math.pow(p, 1.75);
      ctx.clearRect(0, 0, W, H);
      // velatura che bagna la carta davanti al bordo
      ring(x, y, R * 1.05 + 10, t * 1.2, 1.6); ctx.globalAlpha = 0.28; ctx.fillStyle = color; ctx.fill();
      // corpo dell'inchiostro, più carico verso il bordo che asciuga
      ctx.globalAlpha = 1; ring(x, y, R, t);
      const g = ctx.createRadialGradient(x, y, 0, x, y, R * 1.06);
      g.addColorStop(0, color); g.addColorStop(0.94, color); g.addColorStop(0.99, mid); g.addColorStop(1, dark);
      ctx.fillStyle = g; ctx.fill();
      ctx.lineWidth = 2.5; ctx.strokeStyle = dark; ctx.stroke();
      // granuli di pigmento che si raccolgono lungo il bordo
      ctx.fillStyle = dark;
      for (const [a, off, s, al] of grains) {
        let q = 1; for (const [k, am, ph, w] of HARM) q += am * Math.sin(k * a + ph + w * t);
        const rr = R * q + off; ctx.globalAlpha = al;
        ctx.beginPath(); ctx.arc(x + Math.cos(a) * rr, y + Math.sin(a) * rr, s, 0, 6.2832); ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (p < 1) anim = requestAnimationFrame(frame);
      else { ctx.fillStyle = color; ctx.fillRect(0, 0, W, H); done(); }
    };
    anim = requestAnimationFrame(frame);
  };

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-wine]');
    if (!a || reduce || busy || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || ['b', 'f'].includes(document.body.dataset.sito)) return; /* in Botanica e Fotografia niente chiazza che si allarga tra una pagina e l'altra (13 nov): si passa e basta */
    if ((a.target && a.target !== '_self') || a.hasAttribute('download')) return;
    const w = FS.wine(a.dataset.wine);
    if (!w) return;
    e.preventDefault();
    busy = true;
    // da tastiera il click non ha coordinate: si versa dal centro del link
    const b = a.getBoundingClientRect();
    const x = e.detail ? e.clientX : b.left + b.width / 2, y = e.detail ? e.clientY : b.top + b.height / 2;
    const bt = a.closest('.fb-zoom')?.querySelector('.fb-zoom__bt')?.getBoundingClientRect(); // dalla finestra della bottiglia: la scheda la fa partire da lì (js/pagine.js)
    spread(x, y, w.color, () => {
      try { sessionStorage.setItem('fs-pour', JSON.stringify({ id: w.id, color: w.color, t: Date.now(), r: bt && [bt.left, bt.top, bt.width, bt.height] })); } catch (err) {}
      location.href = a.href;
    });
  });

  // tornando indietro (bfcache) la copertura sparisce
  addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    cancelAnimationFrame(anim); busy = false;
    pour.classList.remove('is-on'); ctx.clearRect(0, 0, cv.width, cv.height);
    root.classList.remove('fs-poured');
  });

  // arrivo su vino.html: la pagina parte coperta (script in header.html) e il vino scende scoprendola
  if (root.classList.contains('fs-poured')) {
    const color = getComputedStyle(root).getPropertyValue('--pour').trim(), dark = shade(color, 0.6);
    fit(); pour.classList.add('is-on');
    const W = innerWidth, H = innerHeight;
    ctx.fillStyle = color; ctx.fillRect(0, 0, W, H);
    root.classList.remove('fs-poured'); // stesso fotogramma: il canvas pieno sostituisce il fondo CSS
    const edge = (top, t) => {
      ctx.beginPath(); ctx.moveTo(0, H + 10);
      for (let x = 0; x <= W + 20; x += 20) ctx.lineTo(x, top + 16 * Math.sin(x / W * 6.2832 * 1.3 + t * 2.1) + 8 * Math.sin(x / W * 6.2832 * 3.1 - t * 3.3) + 3 * Math.sin(x / W * 6.2832 * 7.7 + t * 5));
      ctx.lineTo(W + 20, H + 10); ctx.closePath();
    };
    let t0 = 0;
    const dur = 1000;
    const frame = (now) => {
      t0 ||= now;
      const p = Math.min(1, (now - t0) / dur), e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      const top = -60 + (H + 140) * e, t = p * 2;
      ctx.clearRect(0, 0, W, H);
      // velatura che resta indietro mentre il colore scende
      edge(top - 70, t + 0.7); ctx.globalAlpha = 0.22 * (1 - p); ctx.fillStyle = color; ctx.fill();
      ctx.globalAlpha = 1; edge(top, t); ctx.fillStyle = color; ctx.fill();
      // bordo che asciuga: alone scuro morbido e filo più netto
      ctx.strokeStyle = dark; ctx.globalAlpha = 0.3; ctx.lineWidth = 12; ctx.stroke();
      ctx.globalAlpha = 0.85; ctx.lineWidth = 1.5; ctx.stroke(); ctx.globalAlpha = 1;
      if (p < 1) anim = requestAnimationFrame(frame);
      else { pour.classList.remove('is-on'); ctx.clearRect(0, 0, W, H); }
    };
    setTimeout(() => (anim = requestAnimationFrame(frame)), 180);
  }

  /* ---------- footer ---------- */
  // le collezioni del footer aprono il menu dei vini sulla collezione
  document.querySelectorAll('.foot [data-col]').forEach((b) => b.addEventListener('click', () => document.dispatchEvent(new CustomEvent('fs:open-cantina', { detail: { col: b.dataset.col } }))));
})();
