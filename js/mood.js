/* LA SCELTA DEL MOOD (index.html, css/mood.css). Rifatta il 20 nov 2026: l'apertura delle due home, Botanica sopra ritagliata fino a un'onda e Pop sotto.
   L'onda è quella della prova Onda di prima (_archivio-prove/scelta-mood-cambio-onda-20nov): gli estremi (e) e il punto all'altezza del puntatore (m) sono due molle che inseguono
   la stessa meta (T, da 0 a 1), quella di mezzo più svelta; "pancia" la tiene gonfia verso il mood che cede. Ferma sta dove la frase si legge meglio (riposo) e ondeggia piano
   come l'angolo del cambio di mood (js/cambio-mood.js), ma solo col mouse: sul telefono non ondeggia e si ridisegna solo quando si muove.
   Passare su una metà (o arrivarci col tabulatore) la allarga; il clic porta l'onda oltre il bordo e si va alla home, che fa tutto il suo ingresso: la frase, poi le bottiglie che entrano
   rotolando ("l'animazione delle bottiglie che entrano la devo vedere quando clicco, altrimenti non so cosa ci sia scritto dietro le bottiglie": prima si apriva già composta,
   con fs-arrivo come il cambio di mood). Per questo al clic frase, bottiglie e nomi se ne vanno mentre l'onda copre lo schermo (is-via, css/mood.css): resta il fondo del mood,
   da cui parte anche la home, che ci sfuma sopra (fs-mood-da). Col dito non c'è il passaggio: un tocco sceglie. Con il movimento ridotto l'onda sta ferma al suo posto e il clic è un link normale. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches, ondeggia = !reduce && matchMedia('(hover: hover) and (pointer: fine)').matches;
  const el = document.querySelector('.mood'), B = document.querySelector('.mood__s--b'), zone = [...document.querySelectorAll('.mood__z')], H = 1 / 120, N = 48, A = .004;
  let T0 = .5, R = [[0, 0]], dove = '', T = .5, pancia = 0, m = reduce ? .5 : -.05, e = m, vm = 0, ve = 0, py = .5, ty = .5, raf = 0, prima = 0, acc = 0, via = null, attesa = 0, clic = 0;
  /* la piega dell'onda ferma (riposo, sotto): R sono i punti [altezza, spostamento]; fra l'uno e l'altro l'onda passa morbida, sopra il primo e sotto l'ultimo resta dritta */
  const piega = (y) => { if (y <= R[0][0]) return R[0][1]; for (let i = 1; i < R.length; i++) if (y <= R[i][0]) { const [y0, o0] = R[i - 1], [y1, o1] = R[i]; return o0 + (o1 - o0) * (1 - Math.cos(Math.PI * (y - y0) / (y1 - y0))) / 2; } return R[R.length - 1][1]; };
  const disegna = (t) => {
    const s = t / 1000, a = ondeggia && !via ? A : 0, p = ['0% 0%'];
    for (let j = 0; j <= N; j++) {
      const y = j / N, g = Math.cos(Math.min(1, Math.abs(y - py) / .85) * Math.PI / 2) ** 2, w = a * (.6 * Math.sin(7 * y + 1.7 * s) + .4 * Math.sin(13 * y - 2.3 * s));
      p.push(((e + (m - e) * g + w + piega(y)) * 100).toFixed(2) + '% ' + (y * 100).toFixed(1) + '%');
    }
    B.style.clipPath = `polygon(${p.join(',')},0% 100%)`;
  };
  const vai = (a) => { try { sessionStorage.setItem('fs-mood-da', 'inset(0% 0% 0% 0%)|inset(0% 0% 0% 0%)|0'); } catch (x) {} location.href = a.href; };
  const giro = (t) => {
    const k = via ? .5 : 1, tm = T + pancia, oltre = Math.max(...R.map((r) => Math.abs(r[1]))) + .005; /* al clic più piano: l'onda che copre lo schermo dura mezzo secondo e si vede */
    acc = Math.min(.1, acc + (t - prima) / 1000); prima = t;
    for (; acc >= H; acc -= H) { /* passi fissi: la molla va uguale a 60 e a 120 fotogrammi */
      vm += ((tm - m) * 190 * k - vm * 26) * H; m += vm * H;
      ve += ((T - e) * 80 * k - ve * 13) * H; e += ve * H;
      py += (ty - py) * .06;
    }
    disegna(t);
    if (via && (T > 1 ? e >= 1 + oltre : e <= -oltre) && t - clic > 750) { raf = 0; vai(via); return; } /* lo schermo è tutto del mood scelto, piega compresa, e le bottiglie sono uscite: la sua home ci sfuma sopra */
    raf = ondeggia || Math.abs(tm - m) + Math.abs(T - e) + Math.abs(vm) + Math.abs(ve) + Math.abs(ty - py) > 4e-4 ? requestAnimationFrame(giro) : 0;
  };
  const muovi = () => {
    if (reduce) { m = e = T; py = ty; disegna(0); return; }
    if (!raf) { prima = performance.now(); raf = requestAnimationFrame(giro); }
  };
  const lato = (d) => { if (via) return; dove = d; T = T0 + (d === 'b' ? .08 : d === 'f' ? -.08 : 0); pancia = d === 'b' ? .03 : d === 'f' ? -.03 : 0; muovi(); }; /* l'onda resta fra il 40 e il 66%: i nomi stanno sul fondo del loro mood */

  /* DOVE STA L'ONDA FERMA. A metà schermo si leggeva "Wine that set the e mood": le due frasi hanno misure diverse e dove l'una e l'altra vengono tagliate cadono lettere diverse.
     Per ogni lettera si somma quanto se ne vede nel serif di Botanica (a sinistra) e quanto in Londrina (a destra): il taglio buono è quello in cui nessuna va lontano da una, né doppia né persa.
     Uno dritto per tutte e due le righe al meglio lascia un quinto di lettera in più o in meno; con un taglio per riga, a pochi pixel l'uno dall'altro (8 sul telefono, una ventina
     sul computer), le righe si leggono intere. Cercati sulle lettere vere fra il 38 e il 62% (oltre ci sono i nomi): conta la lettera peggio tagliata di ogni riga (sommate,
     così ognuna cerca il suo taglio e non si accontenta di quello dell'altra), poi quanto si piega l'onda, poi quanto si allontana da metà. Torna il centro fra i due tagli; R dice dove sono le righe e di quanto piegare.
     In alto l'onda passa dal centro del marchio, che resta mezzo oro e mezzo inchiostro (dritta sulla frase lo tagliava all'ultima lettera, e sembrava un errore) */
  const riposo = () => {
    const W = el.clientWidth, r0 = el.getBoundingClientRect(), parte = (v) => Math.min(1, Math.max(0, v)), cx = document.createElement('canvas').getContext('2d');
    /* di ogni lettera conta l'inchiostro, non la casella: della casella può restare fuori un pezzetto vuoto, dell'asta di una m no (si vedeva un filo prima di "mood") */
    const righe = (q) => [...document.querySelectorAll(q + ' .mood__frase span')].map((sp) => { const st = getComputedStyle(sp); cx.font = `${st.fontWeight} ${st.fontSize} ${st.fontFamily}`;
      return [...sp.textContent].map((ch, i) => { const r = document.createRange(); r.setStart(sp.firstChild, i); r.setEnd(sp.firstChild, i + 1); const b = r.getBoundingClientRect(), t = cx.measureText(ch), l = b.left - t.actualBoundingBoxLeft; return [ch, l, b.left + t.actualBoundingBoxRight - l || 1, (b.top + b.bottom) / 2]; }); });
    const rb = righe('.mood__s--b'), rf = righe('.mood__s--f');
    const costo = (x, k) => Math.max(...rb[k].map(([ch, l, w], i) => (ch === ' ' ? 0 : Math.abs(parte((x - l) / w) + parte((rf[k][i][1] + rf[k][i][2] - x) / rf[k][i][2]) - 1))));
    const a = Math.round(W * .38), n = Math.round(W * .24), c = [0, 1].map((k) => Array.from({ length: n + 1 }, (_, i) => costo(a + i, k)));
    let v0 = Infinity, ia = n / 2, ib = n / 2;
    for (let i = 0; i <= n; i++) for (let j = 0; j <= n; j++) { const v = c[0][i] + c[1][j] +(2 * Math.abs(i - j) + Math.abs((i + j) / 2 + a - W / 2)) / W; if (v < v0) { v0 = v; ia = i; ib = j; } }
    const xa = (a + ia) / W, xb = (a + ib) / W, mezzo = (xa + xb) / 2, y = (k) => ((rb[k][0][3] + rf[k][0][3]) / 2 - r0.top) / r0.height;
    R = [[(document.querySelector('.mood__logo').getBoundingClientRect().bottom - r0.top) / r0.height + .01, .5 - mezzo], [y(0), xa - mezzo], [y(1), xb - mezzo]];
    return mezzo;
  };

  const scelta = (a) => { if (via) return; via = a; clic = performance.now(); el.classList.add('is-via'); T = a.dataset.mood === 'b' ? 1.12 : -.12; pancia = T > 1 ? .14 : -.14; muovi(); };
  zone.forEach((a) => {
    a.addEventListener('pointerenter', (ev) => { if (ev.pointerType === 'mouse') lato(a.dataset.mood); });
    a.addEventListener('focus', () => { if (a.matches(':focus-visible')) lato(a.dataset.mood); });
    a.addEventListener('blur', () => lato(''));
    a.addEventListener('click', (ev) => { if (reduce || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey || ev.button) return; ev.preventDefault(); scelta(a); }); /* con ctrl o il tasto centrale si apre a parte, come un link */
  });
  el.addEventListener('pointerleave', () => lato(''));
  el.addEventListener('pointermove', (ev) => { const r = el.getBoundingClientRect(); ty = (ev.clientY - r.top) / r.height; muovi(); }, { passive: true });
  addEventListener('pageshow', (ev) => { if (ev.persisted) { via = null; el.classList.remove('is-via'); lato(''); } }); /* tornati col tasto indietro: l'onda torna al suo posto e tutto rientra */
  addEventListener('resize', () => { clearTimeout(attesa); attesa = setTimeout(() => { T0 = riposo(); lato(dove); }, 120); });

  /* l'ingresso parte coi caratteri pronti (frase e nomi cambierebbero forma a metà, e il riposo si misura sulle lettere vere), al più dopo un secondo e mezzo;
     css/mood.css tiene ferme le animazioni finché c'è is-attesa */
  disegna(0);
  if (!reduce) el.classList.add('is-attesa');
  const font = ["900 1em 'Londrina Solid'", "1em 'Instrument Serif'", "500 1em 'DM Sans'"].map((f) => document.fonts.load(f).catch(() => {}));
  Promise.race([Promise.all(font), new Promise((ok) => setTimeout(ok, 1500))]).then(() => { el.classList.remove('is-attesa'); T0 = riposo(); setTimeout(() => lato(dove), reduce ? 0 : 120); });
})();
