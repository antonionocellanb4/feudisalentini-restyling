/* La scheda del vino (nata nella fiaba, 2 nov 2026 in comune con moderna-d e moderna-e). Clic su una bottiglia → il disegno si vela, la bottiglia scivola al centro con un solo movimento morbido
   (30 ott: niente salto né rotazioni, niente disegni attorno oltre alla macchia del suo colore e all'ombra), accanto la scheda. Esc, Chiudi o clic sul velo la riportano al suo posto. Dati veri di js/data.js.
   Uso: const s = Scheda(sezione); s.apri(vino, elemento). Se la bottiglia non è un <img> dentro l'elemento (moderna-d la disegna su canvas): s.apri(vino, elemento, { rect, nascondi }).
   Con Scheda(sezione, { schizzi: false, disegno }) (moderna-d, moderna-e) niente macchia né ombra a matita, che sono lo stile dell'index: stessa pagina pulita, e il disegno attorno alla bottiglia lo fa la pagina nel suo stile: disegno(vino, riquadro, ritardo) riempie un riquadro centrato sulla bottiglia, 1,16 volte la sua altezza.
   HTML in sections/scheda.html, stile in css/fiaba.css. Dipende da: gsap, FS, matita.js solo con gli schizzi */
const Scheda = (sec, { schizzi = true, disegno = null, dissolvi = false } = {}) => { // dissolvi: la bottiglia della scena è dipinta e diversa dalla foto, la foto vi sfuma dentro invece di sostituirla di colpo
  const M = schizzi ? Matita : null, zoom = sec.querySelector('.fb-zoom'), zq = (c) => zoom.querySelector(c), zImg = zq('.fb-zoom__bt');
  const zInfo = [...zq('.fb-zoom__info').children], zX = zq('.fb-zoom__x');
  const zst = { wash: 0, fade: 1 };
  let zs = null;
  if (!schizzi) { zoom.classList.add('fb-zoom--pulita'); zq('.fb-zoom__cv').remove(); zoom.insertAdjacentHTML('afterbegin', '<div class="fb-zoom__dis" aria-hidden="true"></div>'); }
  const zDis = zq('.fb-zoom__dis');
  const zSheet = schizzi && new M.Sheet(zq('.fb-zoom__cv'), (ctx, f) => {
    if (!zs) return;
    zs.wash.progress = zst.wash; zs.wash.alpha = zs.washA * zst.fade; M.drawWash(ctx, zs.wash, f);
    zs.base.progress = zst.wash; zs.base.alpha = zst.fade; M.draw(ctx, zs.base, f);
  });
  const zScena = (w) => { // misure, macchia e ombra, in px dell'overlay
    const W = zoom.clientWidth, H = zoom.clientHeight, mob = innerWidth <= 860;
    const fondo = Scheda.FONDO[w.bottle] ?? 0.91, sopra = 76 + 8, spazio = H - zq('.fb-zoom__info').offsetHeight - sopra - 6; // telefono: la bottiglia intera tra l'header e la scheda
    const Hb = mob ? Math.min(H * 0.46, spazio / fondo) : H * 0.7, Wb = (Hb * 653) / 1024, bx = mob ? W / 2 : W * 0.62, by = mob ? sopra + (spazio - Hb * fondo) / 2 : (H - Hb) / 2 + H * 0.03;
    if (!schizzi) return { w, bx, by, Hb, Wb };
    const yb = by + Hb * fondo, [r, g, b] = M.rgb(w.color), lum = (0.3 * r + 0.59 * g + 0.11 * b) / 255;
    return { w, bx, by, Hb, Wb, washA: lum > 0.6 ? 0.45 : 0.24,
      wash: M.wash(M.ellipse(bx, by + Hb * 0.56, Wb * 0.62, Hb * 0.38, 0, 0, 1, 40), { color: w.color, origin: [bx, by + Hb * 0.6], amp: 6 }),
      base: M.stroke(M.ellipse(bx, yb, Wb * 0.36, Hb * 0.024, 0, -2.4, 1.1, 40), { w: 1.5, amp: 0.8 }) };
  };
  const zScheda = (w) => {
    zq('.fb-zoom__col').textContent = FS.collection(w.collection)?.name || '';
    zq('.fb-zoom__t').textContent = w.name;
    zq('.fb-zoom__meta').textContent = [w.denom, w.uve, w.alcool].filter(Boolean).join(' · ');
    zq('.fb-zoom__desc').textContent = w.desc || '';
    const ar = w.aromi.join(', ').replace(/^./, (c) => c.toUpperCase());
    zq('.fb-zoom__dati').innerHTML = [['Vista', w.vista], ['Aromi', ar || '<span class="tbd">Non indicati nel catalogo</span>'], ['In tavola', w.abb || '<span class="tbd">Non indicato nel catalogo</span>']]
      .filter(([, v]) => v).map(([t, v]) => `<div><dt>${t}</dt><dd>${v}</dd></div>`).join('');
    const go = zq('.fb-zoom__go'); go.href = FS.wineUrl(w.id); go.dataset.wine = w.id; // la pagina del vino (vino.html), col colore che si versa
    zq('.fb-zoom__col-go').dataset.col = w.collection;
  };
  const zApri = (w, a, o = {}) => {
    if (zs) return;
    zScheda(w);
    zoom.hidden = false; sec.classList.add('is-zoom'); zSheet && zSheet.resize(); FS.lenis?.stop();
    Object.assign(zst, { wash: 0, fade: 1 });
    zs = zScena(w); zs.a = a; zs.nascondi = o.nascondi ?? ((on) => { a.style.visibility = on ? 'hidden' : ''; });
    zImg.src = w.bottle;
    zImg.style.cssText = `left:${zs.bx - zs.Wb / 2}px;top:${zs.by}px;height:${zs.Hb}px`;
    const r0 = o.rect ?? a.querySelector('img').getBoundingClientRect(), zr = zoom.getBoundingClientRect();
    zs.da = { x: r0.left + r0.width / 2 - zr.left - zs.bx, y: r0.top + r0.height / 2 - zr.top - (zs.by + zs.Hb / 2), scale: r0.height / zs.Hb };
    gsap.set(zImg, { ...zs.da, opacity: dissolvi ? 0 : 1 });
    zs.nascondi(true);
    if (zDis) { const q = zs.Hb * 1.16; zDis.style.cssText = `left:${zs.bx}px;top:${zs.by + zs.Hb * 0.5}px;width:${q}px;height:${q}px`; gsap.set(zDis, { opacity: 1 }); disegno?.(w, zDis, 0.75); }
    zs.tl = gsap.timeline({ onUpdate: () => zSheet && zSheet.kick(120) })
      .fromTo(zoom, { '--velo': 0 }, { '--velo': 1, duration: 0.6, ease: 'power1.out' }, 0)
      .to(zImg, { x: 0, y: 0, scale: 1, duration: 1.3, ease: 'expo.inOut' }, 0)
      .to(zImg, { opacity: 1, duration: 0.35, ease: 'power1.out' }, 0)
      .to(zst, { wash: 1, duration: 1.4, ease: 'power1.out' }, 0.8)
      .fromTo([...zInfo, zX], { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.06, ease: 'power2.out' }, 0.8);
    zoom.focus({ preventScroll: true }); // il dialogo, non Chiudi: su iPhone il bottone restava con l'anello di focus
  };
  const zChiudi = (poi) => {
    if (!zs || zs.via) return;
    const z = zs; z.via = true; z.tl.kill();
    gsap.timeline({ onUpdate: () => zSheet && zSheet.kick(120), onComplete: () => {
      z.nascondi(false); zoom.hidden = true; sec.classList.remove('is-zoom'); zs = null; FS.lenis?.start(); z.a.focus({ preventScroll: true }); poi?.();
    } })
      .to(zst, { fade: 0, duration: 0.35 }, 0)
      .to([...zInfo, zX, zDis].filter(Boolean), { opacity: 0, duration: 0.3, ease: 'power1.in' }, 0)
      .to(zImg, { ...z.da, duration: 1.1, ease: 'expo.inOut' }, 0.1) // l'apertura al contrario: la scena torna mentre la bottiglia vola, non dopo
      .to(zoom, { '--velo': 0, duration: 0.7, ease: 'power1.inOut' }, 0.35)
      .to(zImg, { opacity: dissolvi ? 0 : 1, duration: 0.35, ease: 'power1.in' }, 0.85);
  };
  // Vini della collezione: la cantina si apre sopra la scheda, che sparisce quando è coperta. Prima si tornava alla scena e poi scendeva la cantina: due passaggi
  const zCantina = (col) => {
    if (!zs || zs.via) return;
    const z = zs; z.via = true; z.tl.kill();
    z.nascondi(false); z.a.focus({ preventScroll: true }); // chiudendo la cantina il fuoco torna qui
    document.dispatchEvent(new CustomEvent('fs:open-cantina', { detail: { col } }));
    gsap.to([...zInfo, zX, zDis, zImg].filter(Boolean), { opacity: 0, duration: 0.25 }); // il bordo della cantina che scende passa sul crema vuoto, non taglia a metà bottiglia e macchia
    gsap.delayedCall(0.7, () => { zoom.hidden = true; sec.classList.remove('is-zoom'); gsap.set(zoom, { '--velo': 0 }); zs = null; }); // la cantina ferma già lo scorrimento e lo riprende quando si chiude
  };
  zX.addEventListener('click', () => zChiudi());
  zoom.addEventListener('click', (e) => { if (e.target === zoom) zChiudi(); });
  zq('.fb-zoom__col-go').addEventListener('click', (e) => zCantina(e.currentTarget.dataset.col));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && zs) zChiudi(); });
  addEventListener('resize', () => zChiudi()); // shortcut: chiude invece di ricalcolare la scena, da rivedere se dà fastidio ruotando il telefono
  return { apri: zApri };
};
Scheda.FONDO = Object.fromEntries(FS.data.wines.map((w) => [w.bottle, w.fondo])); // la tabella sta in js/data.js (FONDO)
