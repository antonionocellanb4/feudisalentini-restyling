/* LA SCELTA DEL MOOD (index.html, css/mood.css; 17 nov 2026). Il sito è uno, visto in più mood: qui si sceglie, e qui porta il comando "Mood" della barra di ogni pagina
   (js/main.js gli passa ?ora=<mood>&b=<pagina>&f=<pagina>: la stessa pagina in ogni mood, così la scelta riporta lì).
   Colonne a tutto schermo, una per mood. PROVA: due effetti, nella fascia scura in alto (?s=onda|cambio, resta per la sessione). A scelta fatta si tolgono l'altro, la fascia e i suoi pezzi qui sotto.
   Le sale di Botanica (colore, ripiano, pianta) vengono da js/dati-bf.js, come nella home e nelle pagine del vino. Le piante sono quelle vere del cliente e si vedono intere.
   Il passaggio alla pagina scelta lo fa il browser (sections/_head.html, css/nav.css: mood-apre): qui si annota da che forma parte, "da|a|opacità" in sessionStorage fs-mood-da. */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const q = new URLSearchParams(location.search), reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const memo = (k, v) => { try { if (v !== undefined) sessionStorage.setItem(k, v); return sessionStorage.getItem(k); } catch (e) { return null; } };
  const semplice = (e) => !(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button); /* un clic normale: con ctrl o col tasto centrale il link si apre a parte, come sempre */

  /* la prova: una scena alla volta */
  const scene = $$('[data-scena]'), voluta = q.get('s') || memo('fs-mood-s'), el = scene.find((n) => n.dataset.scena === voluta) || scene[0], s = el.dataset.scena;
  memo('fs-mood-s', s);
  scene.forEach((n) => { n.hidden = n !== el; });
  $$('.mood-prova a').forEach((a) => { const p = new URLSearchParams(q); p.set('s', a.dataset.s); a.href = '?' + p; if (a.dataset.s === s) a.setAttribute('aria-current', 'true'); });

  /* da dove si arriva. Le pagine di ritorno le scrive js/main.js: qui passa solo il nome di una pagina di questa cartella, niente indirizzi esterni */
  const porte = $$('a[data-mood]'), zone = $$('.mood__z', el), ora = porte.some((a) => a.dataset.mood === q.get('ora')) ? q.get('ora') : '';
  porte.forEach((a) => {
    const t = q.get(a.dataset.mood);
    if (t && /^[\w-]+\.html(\?[\w=&%.~+-]*)?$/.test(t)) a.setAttribute('href', t);
    if (a.dataset.mood !== ora) return;
    const v = $('.mood__v', a);
    a.setAttribute('aria-current', 'true'); v.classList.add('is-qui'); v.textContent = a.dataset.qui;
  });
  if (ora) {
    const x = $('.mood__x');
    document.documentElement.dataset.ora = ora;
    x.href = porte.find((a) => a.dataset.mood === ora).href; x.hidden = false;
    x.addEventListener('click', (e) => { if (semplice(e) && history.length > 1 && document.referrer.startsWith(location.origin)) { e.preventDefault(); history.back(); } }); /* torna dov'eri, al punto in cui eri */
  }

  const SALE = window.FS_BF || [];
  const sala = (t, piante) => { /* la pianta è una maschera: l'indirizzo sta nello stile dell'elemento, perché dentro una variabile css Chrome lo cercherebbe a partire dalla cartella del foglio di stile */
    const p = `url(assets/botanica/${t.pianta}.webp)`;
    return `<span class="sala" style="--c:${t.c};--c2:${t.c2};--c3:${t.c3}">${`<i style="-webkit-mask-image:${p};mask-image:${p}"></i>`.repeat(piante)}</span>`;
  };
  const vai = (a, da) => { memo('fs-mood-da', da); location.href = a.href; };
  /* le due metà dello schermo: passarci sopra col mouse (o arrivarci col tabulatore) è "lato", il clic è "scelta". Col dito non c'è il passaggio: un tocco sceglie.
     Con il movimento ridotto il clic resta un link normale. "torna": si è tornati qui col tasto indietro e la pagina è quella di prima */
  const ascolta = (lato, scelta, torna) => {
    zone.forEach((a) => {
      a.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') lato(a.dataset.mood); });
      a.addEventListener('focus', () => { if (a.matches(':focus-visible')) lato(a.dataset.mood); });
      a.addEventListener('blur', () => lato(''));
      a.addEventListener('click', (e) => { if (!semplice(e) || reduce) return; e.preventDefault(); scelta(a); });
    });
    el.addEventListener('pointerleave', () => lato(''));
    addEventListener('pageshow', (e) => { if (e.persisted) torna(); });
  };

  /* PROVA 1, Onda. Il confine fra le due colonne è una linea elastica: gli estremi (e) e il punto all'altezza del puntatore (m) sono due molle che inseguono la stessa meta (T, da 0 a 1),
     quella di mezzo più svelta. Così il confine parte da dove sta il puntatore e il resto lo segue; "pancia" lo tiene gonfio verso la colonna che cede. Al clic la meta va oltre il bordo */
  const onda = () => {
    const B = $('.onda__b', el), foto = $$('.onda__f1 img', el), H = 1 / 120, N = 28;
    B.innerHTML = SALE.map((t) => sala(t, 2)).join('');
    const sale = $$('.sala', B);
    let T = .5, pancia = 0, m = reduce ? .5 : ora === 'b' ? 1 : 0, e = m, vm = 0, ve = 0, py = .5, ty = .5, raf = 0, prima = 0, acc = 0, via = null, is = 0, ifo = 0;
    const disegna = () => {
      const p = ['0% 0%'];
      for (let j = 0; j <= N; j++) { const y = j / N, g = Math.cos(Math.min(1, Math.abs(y - py) / .85) * Math.PI / 2) ** 2; p.push(((e + (m - e) * g) * 100).toFixed(2) + '% ' + (y * 100).toFixed(1) + '%'); }
      B.style.clipPath = `polygon(${p.join(',')},0% 100%)`;
    };
    const giro = (t) => {
      const k = via ? .5 : 1, tm = T + pancia; /* al clic più piano: l'onda che copre lo schermo dura mezzo secondo e si vede */
      acc = Math.min(.1, acc + (t - prima) / 1000); prima = t;
      for (; acc >= H; acc -= H) { /* passi fissi: la molla va uguale a 60 e a 120 fotogrammi */
        vm += ((tm - m) * 190 * k - vm * 26) * H; m += vm * H;
        ve += ((T - e) * 80 * k - ve * 13) * H; e += ve * H;
        py += (ty - py) * .06;
      }
      disegna();
      if (via && (T > 1 ? e >= 1 : e <= 0)) { raf = 0; vai(via, 'inset(0% 0% 0% 0%)|inset(0% 0% 0% 0%)|0'); return; } /* lo schermo è tutto del mood scelto: la sua pagina ci compare sopra */
      raf = Math.abs(tm - m) + Math.abs(T - e) + Math.abs(vm) + Math.abs(ve) + Math.abs(ty - py) > 4e-4 ? requestAnimationFrame(giro) : 0;
    };
    const muovi = () => {
      if (reduce) { m = e = T; py = ty; disegna(); return; }
      if (!raf) { prima = performance.now(); raf = requestAnimationFrame(giro); }
    };
    const lato = (d) => { if (via) return; el.dataset.lato = d; T = d === 'b' ? .58 : d === 'f' ? .42 : .5; pancia = d === 'b' ? .03 : d === 'f' ? -.03 : 0; /* mai oltre il 38%: lì finisce la foto di Fotografia (css/mood.css, .onda__f1) */ muovi(); };
    const scelta = (a) => { if (via) return; via = a; T = a.dataset.mood === 'b' ? 1.12 : -.12; pancia = T > 1 ? .14 : -.14; muovi(); };
    ascolta(lato, scelta, () => { via = null; lato(''); });
    el.addEventListener('pointermove', (ev) => { const r = el.getBoundingClientRect(); ty = (ev.clientY - r.top) / r.height; muovi(); });

    /* le due colonne cambiano a turno, come le aperture dei due mood: una sala (colore e pianta) per collezione, e le foto */
    sale[0].classList.add('is-sotto'); foto[0].classList.add('is-su');
    let turno = 0;
    if (!reduce) setInterval(() => {
      if (document.hidden || via) return;
      if (turno++ % 2) { foto[ifo].classList.remove('is-su'); ifo = (ifo + 1) % foto.length; foto[ifo].classList.add('is-su'); return; }
      const sotto = sale[is];
      sale.forEach((n) => n.classList.remove('is-su', 'is-sotto'));
      sotto.classList.add('is-sotto'); is = (is + 1) % sale.length; sale[is].classList.add('is-su');
    }, 2600);

    disegna();
    setTimeout(muovi, ora ? 700 : 120); /* da fuori Botanica entra da sinistra; arrivando da un mood si parte da lì e l'altro entra dal suo lato */
  };

  /* PROVA 2, Cambio: n è quante colonne (da sinistra) ha Botanica. Due a riposo, tre o una passando su un mood, quattro o zero al clic: poi la pagina sale da sotto come un foglio solo */
  const cambio = () => {
    const col = $$('.cmb__c', el);
    col.forEach((c, i) => c.insertAdjacentHTML('beforeend', sala(SALE[i], 1)));
    let via = null;
    const metti = (n) => col.forEach((c, i) => { c.dataset.b = +(i < n); });
    const lato = (d) => { if (!via) metti(d === 'b' ? 3 : d === 'f' ? 1 : 2); };
    const scelta = (a) => {
      if (via) return;
      via = a; metti(a.dataset.mood === 'b' ? 4 : 0);
      setTimeout(() => vai(a, 'inset(100% 0% 0% 0%)|inset(0% 0% 0% 0%)'), 640);
    };
    ascolta(lato, scelta, () => { via = null; metti(2); });
    metti(ora === 'b' ? 4 : ora === 'f' ? 0 : 2);
    if (ora) setTimeout(() => lato(''), 700);
  };

  ({ onda, cambio }[s])();
})();
