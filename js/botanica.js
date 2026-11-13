/* BOTANICA (13 nov 2026), la quarta versione: dal profilo Instagram del cliente (@feudi_salentini). La passeggiata delle altre home (meccanica di js/moderna-e.js: si scorre o si trascina, pillola delle tappe,
   tre vini per tappa con "Altri vini", scheda comune di js/scheda.js) dentro sei sale colorate. In ogni sala la pianta della collezione, a retino tono su tono, su tre piani: cresce dal ripiano mentre la sala
   arriva, i piani scorrono a velocità diverse e il vento (camminare, muovere il mouse) la piega. L'ombra delle bottiglie cade dalla parte opposta al puntatore, come col sole.
   Colori: campionati dalle copertine delle collezioni del profilo (l'Organic è scurito di poco, da #79835e a #717b57 col ripiano #67704f, perché il bianco piccolo si legga). Piante: assets/botanica, fatte da tools/botanica.py (ar = larghezza / altezza).
   Frasi: quelle delle copertine, in inglese come le scrive il cliente; la Collezione 53 non ne ha una leggibile sul profilo e resta senza. I testi delle tappe sono quelli delle altre home. Le foto dei vini non si toccano. */
(() => {
  const { $, $$, reduce, clamp, ss, titoli, collezioni } = FS.mk;
  const sec = $('.e-st'), stage = $('.e-stage'), alto = $('.e-alto'), track = $('.e-track'), nav = $('.fb-tappe', sec), testata = $('[data-nav]'), mob = () => innerWidth <= 860;
  const TAV = window.FS_BF; /* colori, piante, frasi e racconti: js/dati-bf.js, in comune con la pagina del vino */
  const dati = collezioni(), lista = TAV.map((t) => ({ ...dati.find((c) => c.col.id === t.id), ...t })).filter((t) => t.col);
  console.assert(lista.length === 6, 'botanica: manca una collezione nei dati');
  const maschera = (t) => `url(${new URL(`assets/botanica/${t.pianta}.webp`, location.href)})`;
  const stile = (t) => `--c:${t.c};--c2:${t.c2};--c3:${t.c3};--ar:${t.ar};--m:${maschera(t)}`;
  const num = (i) => String(i + 1).padStart(2, '0');
  const corto = (w) => w.name.replace(/^(Collezione 53|125 Organic|125|Terra)\s+/, '').replace(/\s+(Organic|Edition)$/, '') || w.name;

  /* ---- apertura: una copertina che cambia umore. Sei strati (colore, pianta ai lati, targa sagomata con la pianta dentro), uno alla volta: il nuovo entra da destra, come la sala che arriva.
     Cambia da sola ogni 4,6 secondi finché si resta in cima; i sei nomi sul ripiano la portano sul loro (mouse o fuoco) e al clic vanno alla sala ---- */
  const via = $('.bo-via');
  $('.bo-umori').innerHTML = lista.map((t) => `<div class="bo-umore" style="${stile(t)}"><div class="bo-muro"><i class="bo-pi bo-pi--a"></i><i class="bo-pi bo-pi--b"></i><span class="bo-targa"><i class="bo-et__p"></i>${t.una ? '' : '<i class="bo-et__p bo-et__p--2"></i>'}</span></div></div>`).join('');
  $('.bo-scegli').innerHTML = lista.map((t, i) => `<li><button type="button" data-vai="${i + 1}" aria-pressed="false">${t.col.name}</button></li>`).join('');
  const umori = $$('.bo-umore', via), scelte = $$('.bo-scegli button', via);
  let umore = -1, fermo = false;
  const metti = (k) => {
    if (k === umore) return;
    const prima = umore; umore = k;
    scelte.forEach((b, n) => b.setAttribute('aria-pressed', n === k));
    gsap.killTweensOf(umori);
    umori.forEach((u, n) => { u.style.clipPath = ''; u.classList.toggle('is-sotto', n === prima); u.classList.toggle('is-su', n === k); });
    if (reduce || prima < 0) return;
    gsap.fromTo(umori[k], { clipPath: 'inset(0 0 0 100%)' }, { clipPath: 'inset(0 0 0 0%)', duration: 1.2, ease: 'expo.inOut', onComplete: () => { umori[k].style.clipPath = ''; umori[prima].classList.remove('is-sotto'); } });
    gsap.fromTo($$('.bo-pi, .bo-et__p', umori[k]), { '--g': 0.72 }, { '--g': 1, duration: 1.7, ease: 'expo.out', stagger: 0.07, delay: 0.25 }); /* --g e non scaleY: se gsap prende la trasformazione azzera scale e rotate del css, e la pianta gemella non sarebbe più specchiata */
  };
  metti(0);
  if (!reduce) setInterval(() => { if (!fermo && cam < 4 && !document.hidden && !sec.classList.contains('is-zoom')) metti((umore + 1) % umori.length); }, 4600);
  scelte.forEach((b, n) => { for (const ev of ['pointerenter', 'focus']) b.addEventListener(ev, () => { fermo = true; metti(n); }); for (const ev of ['pointerleave', 'blur']) b.addEventListener(ev, () => { fermo = false; }); });

  /* ---- le sale: muro con la pianta su tre piani, ripiano con nomi, titolo, racconto e conto dei vini ---- */
  track.insertAdjacentHTML('beforeend', lista.map((t, i) => `<article class="e-tappa bo-sala" style="${stile(t)}" aria-labelledby="bo-c${i}">
      <div class="bo-muro" aria-hidden="true"><i class="bo-pi bo-pi--f"></i><i class="bo-pi bo-pi--a"></i><i class="bo-pi bo-pi--b"></i></div>
      <ul class="e-nomi"></ul>
      <div class="e-testo">
        <div class="e-h"><p class="e-n">${num(i)} · ${t.tappa}</p><h2 class="e-t2 bo-nome" id="bo-c${i}"><i>Collezione</i> <b>${t.nome}</b></h2></div>
        <p class="e-d">${t.frase ? `<b class="bo-claim" lang="en">${t.frase}</b>` : ''}${t.d}</p>
        <div class="e-cta e-cta--vini"><p class="e-vini__n" aria-live="polite"></p><button class="btn btn--line e-vini__altri" type="button">Altri vini</button></div>
      </div>
    </article>`).join(''));
  const tappe = $$('.e-tappa', track), N = tappe.length;

  /* ---- la scheda: dietro la bottiglia la targa della collezione, alta, col disegno dentro (13 nov: le piante libere e grandi dietro la bottiglia facevano confusione); mentre è aperta l'header torna scuro sul crema ---- */
  const disegno = (w, box, rit) => {
    const t = lista.find((x) => x.id === w.collection); if (!t) return (box.innerHTML = '');
    for (const [k, v] of [['--c2', t.c], ['--c3', t.c3], ['--m', maschera(t)]]) box.style.setProperty(k, v);
    box.innerHTML = `<span class="bo-targa bo-targa--z"><i class="bo-et__p"></i>${t.una ? '' : '<i class="bo-et__p bo-et__p--2"></i>'}</span>`;
    if (!reduce) { gsap.fromTo(box.firstChild, { '--s': 0.86, opacity: 0 }, { '--s': 1, opacity: 1, duration: 1.1, ease: 'expo.out', delay: rit }); gsap.fromTo(box.firstChild.children, { '--g': 0.6 }, { '--g': 1, duration: 1.6, ease: 'expo.out', stagger: 0.12, delay: rit + 0.1 }); }
  };
  FS.stileVino = (w) => { const t = lista.find((x) => x.id === w.collection); return t ? `;--wine:${t.c};--c3:${t.c3};--stain:${maschera(t)}` : ''; }; /* js/nav.js lo aggiunge allo stile di ogni vino del menu: qui la macchia diventa la targa della collezione (forma in css) */
  const scheda = Scheda(sec, { schizzi: false, disegno });
  new MutationObserver(() => { if (sec.classList.contains('is-zoom')) testata.dataset.forza = 'light'; else delete testata.dataset.forza; dispatchEvent(new Event('scroll')); }).observe(sec, { attributes: true, attributeFilter: ['class'] });

  /* ---- bottiglie e nomi: tre posti per sala; ogni bottiglia ha sotto la sua sagoma in ombra ---- */
  const bottiglie = [], quante = [];
  lista.forEach((t, k) => { const sala = tappe[k + 1], n = Math.min(3, t.vini.length); quante[k + 1] = n;
    $('.e-nomi', sala).innerHTML = '<li><button type="button"></button></li>'.repeat(n);
    for (let j = 0; j < n; j++) { const b = document.createElement('button'); b.type = 'button'; b.className = 'e-bt'; b.innerHTML = '<img alt="" decoding="async" draggable="false"><img class="bo-o" alt="" decoding="async" draggable="false">'; sala.append(b);
      const o = { el: b, nome: $('.e-nomi', sala).children[j], w: t.vini[j], j, i: k + 1, prof: n === 2 ? [0.94, 1.06][j] : [0.92, 1, 1.08][j] }; bottiglie.push(o);
      b.addEventListener('click', () => scheda.apri(o.w, o.el)); o.nome.querySelector('button').addEventListener('click', () => scheda.apri(o.w, o.el)); } });

  /* ---- misure (come moderna-e): --edge è il filo del ripiano, sopra il muro e le bottiglie, sotto i testi ---- */
  let W = 1, edge = 1, bh = 1, dx = 1, X = [0], cam = 0, pX = 0, gX = 0, ventoV = 0, vento = 0, prevCam = 0, ultimoV = 9;
  const piazza = () => bottiglie.forEach((b) => { const n = quante[b.i], x = (n === 1 ? 0 : n === 2 ? (b.j ? 1 : -1) * dx * 0.62 : (b.j - 1) * dx) + (mob() ? 0 : W * 0.08); for (const el of [b.el, b.nome]) { el.style.setProperty('--x', x); el.style.setProperty('--dx', dx); } });
  const misura = () => {
    const m = mob(), hv = alto.offsetHeight || innerHeight; W = stage.getBoundingClientRect().width;
    edge = hv * (m ? 0.6 : 0.72);
    const sopra = m ? 186 : 208; bh = Math.min((edge + 14 - sopra) / 0.91, m ? W - 24 : 1e4); dx = Math.min(bh * 0.42, W * 0.3);
    X = tappe.map((_, i) => i * W);
    for (const [k, v] of [['--edge', edge], ['--bh', bh], ['--rifl', bh * 0.09], ['--w', W]]) stage.style.setProperty(k, `${v}px`);
    tappe.forEach((t, i) => { t.style.left = `${X[i]}px`; });
    piazza();
  };

  /* ---- pillola delle tappe, come le altre home ---- */
  const mini = (i) => lista[i].vini.slice(0, 3).map((w) => `<img src="${w.bottle}" alt="" decoding="async">`).join('');
  nav.innerHTML = `<ul class="fb-menu" id="fb-menu" hidden>${lista.map((t, i) => `<li><button type="button"><span class="fb-mini">${mini(i)}</span><span class="n">${num(i)}</span>${t.col.name}</button></li>`).join('')}</ul>
    <button class="fb-pill" type="button" aria-expanded="false" aria-controls="fb-menu"><span class="fb-mini"></span><span class="fb-pill__t"></span><span class="fb-pill__n"></span><span class="fb-pill__v" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="1.6"/></svg></span></button>`;
  const pill = $('.fb-pill', nav), menu = $('.fb-menu', nav), navB = $$('button', menu), apriM = (on) => { menu.hidden = !on; pill.setAttribute('aria-expanded', on); };
  let cur = -1; const segna = (i) => { if (i === cur) return; cur = i; $('.fb-mini', pill).innerHTML = mini(i); $('.fb-pill__t', pill).textContent = lista[i].col.name; $('.fb-pill__n', pill).textContent = `${num(i)}/${num(lista.length - 1)}`; navB.forEach((b, k) => b.setAttribute('aria-current', k === i)); };
  pill.addEventListener('click', () => apriM(menu.hidden));
  document.addEventListener('click', (e) => { if (!nav.contains(e.target)) apriM(false); });
  const corsa = () => sec.offsetHeight - stage.offsetHeight;
  const vai = (n) => { const y = sec.getBoundingClientRect().top + scrollY + (X[n] / X[N - 1]) * corsa(); FS.lenis ? FS.lenis.scrollTo(y, { duration: 1.6 + Math.abs(n - cam / W) * 0.3 }) : scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' }); };
  navB.forEach((b, i) => b.addEventListener('click', () => { apriM(false); vai(i + 1); }));
  $$('[data-vai]', sec).forEach((b) => b.addEventListener('click', () => vai(+b.dataset.vai)));

  /* ---- si trascina il palco: col dito o col mouse si cammina (solo in orizzontale: in verticale scorre la pagina). Il puntatore fa vento e sposta il sole ---- */
  let tira = null, tirato = false, ultX = null;
  stage.addEventListener('pointerdown', (e) => { if (e.target.closest('.fb-zoom, .fb-tappe, a, .btn')) return; tira = { x: e.clientX, y: e.clientY, s: scrollY, su: false, id: e.pointerId }; tirato = false; });
  stage.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'mouse') { const nx = e.clientX / W - 0.5; gX = nx * -22; if (ultX !== null) ventoV += (e.clientX - ultX) * 0.00035; ultX = e.clientX;
      stage.style.setProperty('--ox', `${(-nx * 30).toFixed(1)}px`); stage.style.setProperty('--oy', `${(2 + (1 - e.clientY / innerHeight) * 9).toFixed(1)}px`); }
    if (!tira || e.pointerId !== tira.id) return;
    const d = e.clientX - tira.x, dy = e.clientY - tira.y;
    if (!tira.su) { if (Math.abs(d) < 8 || Math.abs(d) < Math.abs(dy)) return; tira.su = true; stage.setPointerCapture(e.pointerId); stage.classList.add('is-tira'); }
    const y = tira.s - (d * corsa()) / X[N - 1] * 1.2; FS.lenis ? FS.lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y);
  });
  const lascia = () => { if (tira?.su) tirato = true; tira = null; stage.classList.remove('is-tira'); };
  stage.addEventListener('pointerup', lascia); stage.addEventListener('pointercancel', lascia);
  stage.addEventListener('pointerleave', () => { gX = 0; ultX = null; });
  stage.addEventListener('click', (e) => { if (tirato) { e.stopPropagation(); e.preventDefault(); tirato = false; } }, true);

  /* ---- il giro: da scrollY a camera; ogni sala riceve --d (quanto manca, in px) e --g (quanto è cresciuta la pianta), il palco --vx (il vento) ---- */
  let prima = performance.now(), misW = 0, misH = 0;
  const stato = (now) => {
    requestAnimationFrame(stato);
    const dt = Math.min(60, now - prima); prima = now;
    if (innerWidth !== misW || alto.offsetHeight !== misH) { misW = innerWidth; misH = alto.offsetHeight; misura(); }
    const q = sec.getBoundingClientRect(); if (q.bottom < 0 || q.top > innerHeight) return;
    const dest = clamp(-q.top / Math.max(1, corsa())) * X[N - 1]; /* lineare: niente soste alle tappe, ogni tacca della rotella sposta uguale */
    cam += (dest - cam) * (reduce ? 1 : 1 - Math.exp(-dt / 110)); if (Math.abs(dest - cam) < 0.1) cam = dest;
    pX += (gX - pX) * (1 - Math.exp(-dt / 280));
    ventoV += (cam - prevCam) * 0.00004; prevCam = cam; ventoV *= 0.9; vento += (clamp(ventoV, -0.12, 0.12) - vento) * 0.12;
    const v = reduce ? 0 : Math.round(vento * 4000) / 100; if (v !== ultimoV) { ultimoV = v; stage.style.setProperty('--vx', v); }
    track.style.transform = `translate3d(${-cam}px,0,0)`;
    bottiglie.forEach((b) => { const d = X[b.i] - cam; if (Math.abs(d) > W * 1.3) return; b.el.style.translate = `${d * (b.prof - 1) + pX * 0.25 * (b.prof - 0.9) * 5}px 0`; });
    tappe.forEach((t, i) => { if (!i) return; const d = X[i] - cam; if (Math.abs(d) > W * 1.3) return; const g = reduce ? 1 : 0.74 + 0.26 * ss(clamp(1.2 - Math.abs(d) / W)); t.style.setProperty('--d', d.toFixed(1)); t.style.setProperty('--g', g.toFixed(3)); });
    segna(clamp(Math.round((cam - X[1]) / W), 0, lista.length - 1));
    nav.style.opacity = cam < X[1] * 0.4 ? clamp(cam / (X[1] * 0.4)) : 1; nav.style.visibility = cam < 2 ? 'hidden' : '';
  };
  misura(); sec.classList.add('is-pronto', 'hero--dark'); /* hero--dark: tutto il cammino è su colore, l'header resta bianco (js/nav.js lo legge da qui) */
  if (!reduce) {
    gsap.fromTo($$('.bo-pi, .bo-et__p', umori[0]), { '--g': 0.6, opacity: 0 }, { '--g': 1, opacity: 1, duration: 1.8, ease: 'expo.out', stagger: 0.12, delay: 0.2 });
    gsap.fromTo($$('.bo-titolo > *', via), { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: 'expo.out', stagger: 0.12, delay: 0.5 });
    gsap.fromTo($$('.e-testo > :not(.e-t)', tappe[0]), { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'expo.out', stagger: 0.08, delay: 0.9 });
  }
  requestAnimationFrame(stato);

  /* ---- i vini di una sala, tre alla volta: il numero scala a ogni clic e in fondo il bottone dice Ricomincia (come moderna-e) ---- */
  lista.forEach((t, k) => {
    const i = k + 1, sala = tappe[i], posti = bottiglie.filter((b) => b.i === i), altri = $('.e-vini__altri', sala), conta = $('.e-vini__n', sala), vini = t.vini;
    let da = 0, turno = 0;
    const mostra = (subito) => {
      const tre = vini.slice(da, da + 3), mio = ++turno, via = posti.flatMap((o) => [o.el, o.nome]), visti = da + tre.length, resto = vini.length - visti;
      conta.textContent = vini.length > 3 ? `${visti} di ${vini.length} vini` : `${vini.length} vini`;
      altri.textContent = !resto ? 'Ricomincia' : resto === 1 ? 'Altro 1 vino' : `Altri ${resto} vini`;
      const cambia = () => { if (mio !== turno) return; quante[i] = tre.length;
        posti.forEach((o, j) => { const w = tre[j]; o.el.hidden = o.nome.hidden = !w; if (!w) return; o.w = w; o.el.style.setProperty('--b', w.fondo); $$('img', o.el).forEach((im) => (im.src = w.bottle)); $('button', o.nome).textContent = corto(w); o.el.setAttribute('aria-label', `${w.name}, apri la scheda`); });
        piazza(); requestAnimationFrame(() => via.forEach((el) => el.classList.remove('is-via'))); };
      if (subito) return cambia();
      via.forEach((el) => el.classList.add('is-via'));
      Promise.all([new Promise((ok) => setTimeout(ok, 280)), ...tre.map((w) => { const im = new Image(); im.src = w.bottle; return im.decode().catch(() => {}); })]).then(cambia); /* le foto nuove sono pronte prima di comparire: niente buchi */
    };
    altri.addEventListener('click', () => { da = da + 3 >= vini.length ? 0 : da + 3; mostra(); });
    altri.hidden = vini.length <= 3; mostra(true);
  });

  /* la pillola fissa "I nostri vini" non si vede durante il cammino, come nelle altre home */
  const P = $('.m-pill'); P?.classList.add('in-storia');
  ScrollTrigger.create({ trigger: sec, start: 'top bottom', end: 'bottom 60%', onToggle: (s) => P?.classList.toggle('in-storia', s.isActive) });

  /* ---- in fondo: le fotografie del profilo camminano da destra a sinistra mentre la sezione passa ---- */
  const riga = $('.bo-mood__riga');
  if (!reduce) gsap.fromTo(riga, { x: () => innerWidth * 0.18 }, { x: () => -Math.max(0, riga.scrollWidth - innerWidth), ease: 'none', scrollTrigger: { trigger: '.bo-mood', start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true } });
  else riga.parentElement.style.overflowX = 'auto';
  /* i più venduti (js/tavola.js): niente macchia ad acquerello (13 nov: "non sono convinto delle chiazze"). Dietro ogni bottiglia la targa della sua collezione col disegno dentro, come nella scheda: qui si danno colori e maschera, la forma è in css */
  addEventListener('load', () => $$('.tv-v__fig').forEach((f) => { const w = FS.data.wines.find((x) => $('img', f)?.getAttribute('src') === x.bottle), t = w && lista.find((x) => x.id === w.collection); if (!t) return; f.style.setProperty('--wine', t.c); f.style.setProperty('--c3', t.c3); f.style.setProperty('--stain', maschera(t)); f.classList.toggle('bo-una', !!t.una); }));
  titoli();
})();
