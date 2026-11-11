/* Sotto il cammino di moderna-e (scelte del 2 nov 2026): cantina e premi in diagonale come l'index (js/home.js), news con il titolo che si apre sulla foto, visite che si aprono scorrendo.
   Ogni sezione si muove con lo scorrimento (scrub); dati veri di js/data.js. Con reduced motion: cantina e news sull'ultima scena, premi e visite elenchi fermi. */
(() => {
  const { $, $$, reduce, clamp, ss } = FS.mk, D = FS.data, mob = () => innerWidth <= 860, nuovo = 'target="_blank" rel="noopener"';
  const scrub = (el, fn, o = {}) => (reduce ? addEventListener('load', () => { o.misura?.(); fn(1); }) : ScrollTrigger.create({ trigger: el, start: o.start ?? 'top top', end: o.end ?? (() => `bottom-=${el.classList.contains('h-coda') ? innerHeight * 1.2 : 0} bottom`), /* h-coda (moderna-h): in fondo restano 1,2 schermi fermi per il passaggio alla sezione dopo */ onUpdate: (s) => fn(s.progress), onRefresh: (s) => { o.misura?.(); fn(s.progress); } }));

  // la diagonale dell'index: s = distanza dal centro in foto, 0 al centro e grande, ±1 piccola nell'angolo
  const sulla = (L) => (s) => { const a = Math.min(Math.abs(s), 1.6), k = 1 - 0.58 * Math.min(a, 1) - 0.1 * Math.max(0, a - 1), w = L.bw * k, h = L.bh * k; return { x: L.cx + s * L.dx - w / 2, y: L.cy + s * L.dy - h / 2, w, h }; };
  const metti = (el, r) => { el.style.transform = `translate(${r.x}px,${r.y}px)`; el.style.width = `${r.w}px`; el.style.height = `${r.h}px`; };

  /* ---- Cantina: la sequenza dell'index senza la matita: la foto nel titolo cresce, le foto passano in diagonale, l'ultima va a tutto schermo e porta il testo ---- */
  {
    const ca = $('#azienda'); if (reduce) ca.classList.add('ca--ferma');
    const palco = $('.ca-stage', ca), slot = $('.ca-slot', ca), apre = $('.ca-apre', ca), figs = $$('.ca-f', ca), N = figs.length, fine = [...$('.ca-fine', ca).children];
    const lerp = (a, b, t) => a + (b - a) * t, mix = (r, q, t) => ({ x: lerp(r.x, q.x, t), y: lerp(r.y, q.y, t), w: lerp(r.w, q.w, t), h: lerp(r.h, q.h, t) });
    let L = null, posto = null;
    const misura = () => { const W = palco.clientWidth, H = palco.clientHeight, m = W < 768, pr = palco.getBoundingClientRect(), sr = slot.getBoundingClientRect(), bw = m ? W * 0.84 : Math.min(W * 0.46, H * 0.58 * 1.5); L = { W, H, bw, bh: bw / 1.5, cx: W / 2, cy: H / 2 + (m ? 0 : 16), dx: m ? W * 0.52 : W * 0.4, dy: m ? H * 0.34 : H * 0.42, sosta: m ? 0.3 : 0, slot: { x: sr.left - pr.left, y: sr.top - pr.top, w: sr.width, h: sr.height } }; posto = sulla(L); };
    scrub(ca, (p) => {
      if (!L) misura();
      const A = 0.14, B = 0.72, C = 0.86, a = ss(clamp((p - 0.025) / (A - 0.025))), e = ss(clamp((p - B) / (C - B))), d = clamp((p - C) / (1 - C)), u = ((N - 1) * (p - A)) / (B - A), j = Math.floor(u), h = L.sosta;
      const g = p < A ? a - 1 : p < B ? (h ? j + ss(clamp((u - j - h) / (1 - 2 * h))) : u) : N - 1 + e * 0.7;
      apre.style.opacity = p < A ? Math.max(0.15, 1 - 1.7 * a) : Math.max(0, 0.15 - (p - A) * 4);
      figs.forEach((fig, i) => {
        let s = i - g, r = null, rad = 8;
        if (i === 0 && p < A) { r = mix(L.slot, posto(0), a); s = (1 - a) * 2; }
        if (i === N - 1 && p >= B) { r = mix(posto(0), { x: 0, y: 0, w: L.W, h: L.H }, e); s = 0; rad = 8 * (1 - e); }
        const vis = Math.abs(s) < 1.9; fig.style.visibility = vis ? '' : 'hidden'; if (!vis) return;
        metti(fig, r ?? posto(s)); fig.style.setProperty('--rad', `${rad}px`); fig.style.setProperty('--nota', clamp(1 - Math.abs(s) * 2.5));
      });
      ca.style.setProperty('--scrim', e);
      fine.forEach((el, i) => { const q = ss(clamp(d * 1.8 - i * 0.3)); el.style.opacity = q; el.style.transform = q < 1 ? `translateY(${(1 - q) * 32}px)` : ''; });
    }, { misura });
  }

  /* ---- Premi: la stessa diagonale con i loghi tondi, a sinistra il testo del logo al centro ---- */
  {
    const sec = $('#premi'), stage = $('.pv-dg__stage', sec), head = $('.pv-dg__h', sec), testi = $('.pv-dg__testi', sec), A0 = D.awards, n = A0.length, testo = (a) => `<h3 class="pv-dg__n">${a.name}</h3><p class="pv-dg__d">${a.text}</p><a class="pv-link" href="${a.url}" ${nuovo}>Leggi l'articolo</a>`;
    sec.style.setProperty('--n', n);
    if (reduce) { sec.classList.add('pv-dg--ferma'); testi.innerHTML = A0.map((a) => `<div class="pv-dg__txt"><img src="${a.logo}" alt="" loading="lazy" decoding="async">${testo(a)}</div>`).join(''); }
    else {
      $('.pv-dg__foto', sec).innerHTML = A0.map((a) => `<figure class="pv-dg__f"><img src="${a.logo}" alt="" loading="lazy" decoding="async"></figure>`).join('');
      testi.innerHTML = A0.map((a) => `<div class="pv-dg__txt">${testo(a)}</div>`).join('');
      const figs = $$('.pv-dg__f', sec), txt = $$('.pv-dg__txt', sec);
      let posto = null;
      const misura = () => { const W = stage.clientWidth, H = stage.clientHeight, m = mob(), bw = m ? Math.min(W * 0.6, H * 0.5) : Math.min(W * 0.3, H * 0.62); posto = sulla({ bw, bh: bw, cx: m ? W * 0.5 : W * 0.64, cy: m ? H * 0.36 : H * 0.5 + 16, dx: m ? W * 0.52 : W * 0.36, dy: m ? H * 0.28 : H * 0.42 }); };
      scrub(sec, (p) => {
        if (!posto) misura();
        const A = 0.14, u = clamp((p - A) / (1 - A)) * (n - 1), j = Math.min(n - 2, Math.floor(u)), g = p < A ? (ss(p / A) - 1) * 1.4 : j + ss(clamp((u - j - 0.2) / 0.6));
        const v = 1 - ss(clamp(sec.classList.contains('h-coda') ? (p - A * 0.2) / (A * 0.42) : p / (A * 0.8))); head.style.opacity = v; /* h-coda (moderna-h): il titolo resta un po' fermo, se ne va prima che arrivi il testo del primo premio */ head.style.visibility = v > 0.01 ? '' : 'hidden'; sec.style.setProperty('--titolo', v);
        figs.forEach((fig, i) => { const s = i - g, vis = Math.abs(s) < 1.9; fig.style.visibility = vis ? '' : 'hidden'; if (vis) metti(fig, posto(s)); });
        txt.forEach((t, k) => { const q = clamp(1 - Math.abs(k - g) * 2.4); if (q === t._q) return; t._q = q; t.style.opacity = q; t.style.visibility = q > 0.02 ? 'visible' : 'hidden'; t.style.transform = `translateY(${(1 - q) * 14}px)`; });
      }, { misura });
    }
  }

  /* ---- News: ogni notizia è uno schermo: il titolo arriva intero, poi si divide in due e tra le due parti si apre la foto. Foto col suo formato, mai ritagliata a forza ---- */
  {
    const s = $('.pv-ti'), GAP = mob() ? 22 : 16;
    D.news.forEach((n) => {
      const c = n.title.includes(':') ? n.title.indexOf(':') + 1 : n.title.lastIndexOf(' ', n.title.length / 2), b = document.createElement('article');
      b.className = `pv-ti__b${s.classList.contains('h-coda') && n === D.news.at(-1) ? ' h-coda' : ''}`;
      b.innerHTML = `<div class="pv-ti__st"><img class="pv-ti__f" src="${n.img}" alt="" loading="lazy" decoding="async"><div class="pv-ti__su"><p class="pv-dg__m">${n.date}</p><h3 class="pv-ti__t">${n.title.slice(0, c)}</h3></div><div class="pv-ti__giu"><p class="pv-ti__t">${n.title.slice(c).trim()}</p><a class="pv-link" href="${n.url}" ${nuovo}>Leggi l'articolo</a></div></div>`;
      s.append(b);
      const st = $('.pv-ti__st', b), f = $('.pv-ti__f', b), su = $('.pv-ti__su', b), giu = $('.pv-ti__giu', b);
      let H = 0;
      // la foto è alta quanto resta tolti i testi: titolo lungo o finestra bassa, non esce mai
      const misura = () => { const top = parseFloat(getComputedStyle(st).getPropertyValue('--header-h')) || 72, liberi = innerHeight - top - 12, testi = su.offsetHeight + giu.offsetHeight + GAP * 2; H = Math.max(120, Math.min(innerHeight * (mob() ? 0.34 : 0.46), liberi - testi)); f.style.height = `${H}px`; st.style.setProperty('--y', `${top + (liberi - testi - H) / 2 + su.offsetHeight + GAP + H / 2}px`); };
      scrub(b, (p) => {
        const e = ss(clamp(p / 0.28)), o = ss(clamp((p - 0.3) / 0.55)), d = o * (H / 2 + GAP);
        su.style.transform = `translateY(${-d + (1 - e) * 26}px)`; su.style.opacity = e;
        giu.style.transform = `translateY(${d + (1 - e) * 44}px)`; giu.style.opacity = e;
        f.style.clipPath = `inset(${(1 - o) * 50}% 0 round var(--r))`; f.style.scale = 1.1 - 0.1 * o;
      }, { start: 'top 70%', misura });
    });
  }

  // la pillola dei vini non copre i testi delle sezioni ferme
  ScrollTrigger.create({ trigger: '#azienda', start: 'top 60%', endTrigger: '#news', end: 'bottom 60%', onToggle: (t) => $('.m-pill')?.classList.toggle('in-pin', t.isActive) }); // un trigger solo, che parte dove finisce quello del cammino: con uno per sezione tra l'una e l'altra lampeggiava
})();
