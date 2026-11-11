/* Ingresso dal portone: preloader della prima visita della sessione, automatico.
   1) torre e corona si disegnano a filo d'oro  2) la torre si riempie d'oro dal basso con la superficie che ondeggia:
   il livello segue il caricamento vero (font, immagini, load) e la percentuale sotto  3) tra i battenti chiusi del portone
   filtra una lama di luce, poi si aprono verso l'interno  4) la camera attraversa il portone: dietro c'è la hero vera
   (il vano è un buco nella notte, non un'immagine). Lo zoom riscrive il viewBox: il marchio resta nitido a ogni scala.
   Esc o Salta = si salta. Contratto: sessionStorage fs-ingresso=1, via la classe ingresso-attivo, evento fs:ingresso-fine. */
(() => {
  const html = document.documentElement;
  const el = document.querySelector('[data-ingresso]');
  if (!el) return;
  if (!html.classList.contains('ingresso-attivo')) { el.remove(); return; }

  const svg = el.querySelector('.ingresso-scena');
  const notte = el.querySelector('.ingresso-notte');
  const oro = el.querySelector('.ingresso-oro');
  const fili = [...el.querySelectorAll('.ingresso-filo')];
  const batt = el.querySelector('.ingresso-battenti');
  const [sx, dx] = batt.children;
  const ui = el.querySelector('.ingresso-ui');
  const conta = el.querySelector('[data-conta]');
  const behind = [...document.querySelectorAll('#main, .foot')];

  // geometria del marchio, unità di assets/logo/feudi-marchio.svg (tools/ingresso-marchio.py)
  const W = 60.05, TB = 89.35, DL = 23.78, DR = 36.27, DT = 56.31;
  const DW = DR - DL, DH = TB - DT, DCX = (DL + DR) / 2, DCY = (DT + TB) / 2;
  const st = { draw: 0, fill: 0, seam: 0, open: 0, zoom: 0, ui: 0 };
  let done = false, exiting = false, load = 0.08, t0 = performance.now();

  // caricamento vero: font, immagini già nel DOM, load della pagina
  const imgs = [...document.querySelectorAll('#main img')].slice(0, 12);
  const tick = () => {
    const ok = imgs.filter((i) => i.complete).length / Math.max(1, imgs.length);
    load = Math.max(load, 0.15 + ok * 0.45 + (document.fonts?.status === 'loaded' ? 0.15 : 0) + (document.readyState === 'complete' ? 0.25 : 0));
  };
  addEventListener('load', tick); document.fonts?.ready.then(tick);

  function render() {
    const vw = innerWidth, vh = innerHeight;
    const k0 = Math.min(vh * 0.3 / TB, vw * 0.42 / W);       // px per unità a riposo: marchio al 30% dell'altezza
    const kEnd = Math.max(vw / DW, vh / DH) * 1.25;           // oltre la copertura: si attraversa il vano ancora in moto
    const k = k0 * Math.pow(kEnd / k0, st.zoom);              // esponenziale: velocità costante a ogni scala
    const lift = 46;                                           // marchio un po' sopra il centro: sotto c'è la scritta
    const y0 = vh / 2 + (DCY - TB / 2) * k0 - lift;
    const sy = y0 + (vh / 2 - y0) * st.zoom;                  // il vano scorre al centro dello schermo entrando
    const x = DCX - vw / 2 / k, y = DCY - (sy - vh / 2) / k - vh / 2 / k, w = vw / k, h = vh / k;
    svg.setAttribute('viewBox', `${x} ${y} ${w} ${h}`);

    // notte meno il vano del portone (bordo di 1px oltre: niente filo scuro sull'antialias)
    const e = 1 / k;
    notte.setAttribute('d', `M${x - w} ${y - h}h${3 * w}v${3 * h}h${-3 * w}Z M${DL - e} ${DT - e}H${DR + e}V${TB + e}H${DL - e}Z`);
    fili.forEach((f) => (f.style.strokeDashoffset = 1 - st.draw));
    fili.forEach((f) => (f.style.opacity = 1 - st.zoom * 4));

    // oro che sale dal suolo con la superficie che ondeggia (più calma quando è pieno)
    const lv = TB + 1 - st.fill * (TB + 2), amp = 1.1 * (1 - st.fill) + 0.15, ph = performance.now() / 380;
    let d = `M-1 ${TB + 2}V${lv}`;
    for (let i = 0; i <= 24; i++) { const xx = -1 + (i / 24) * (W + 2); d += `L${xx.toFixed(2)} ${(lv + Math.sin(xx * 0.22 + ph) * amp + Math.sin(xx * 0.51 - ph * 1.3) * amp * 0.4).toFixed(2)}`; }
    oro.setAttribute('d', d + `V${TB + 2}Z`);

    // battenti posati sul vano; fra i due la lama di luce
    const pw = DW * k, phh = DH * k;
    batt.style.cssText = `width:${pw}px;height:${phh}px;perspective:${2.2 * phh}px;--seam:${(st.seam * pw * 0.06).toFixed(2)}px;transform:translate(${(DL - x) * k}px,${(DT - y) * k}px)`;
    sx.style.transform = `rotateY(${st.open * 82}deg)`;
    dx.style.transform = `rotateY(${-st.open * 82}deg)`;

    // scritta e percentuale sotto il marchio
    ui.style.top = `${y0 + (TB - DCY) * k0 + 34}px`;
    ui.style.opacity = st.ui;
    conta.textContent = Math.round(st.fill * 100);

    if (st.zoom > 0 && pw >= vw && sy - phh / 2 <= 0 && sy + phh / 2 >= vh) finish(false);
  }

  // 1) il filo si disegna, la scritta compare
  gsap.timeline().to(st, { draw: 1, duration: 1.1, ease: 'power2.inOut' }, 0.15).to(st, { ui: 1, duration: 0.8, ease: 'power2.out' }, 0.5);

  // 2) il livello insegue il caricamento (almeno ~1,6 s di riempimento, al massimo 4,5 s in tutto)
  const loop = () => {
    if (done) return;
    tick();
    const age = (performance.now() - t0) / 1000;
    const cap = Math.min(1, Math.max(0, (age - 0.45) / 1.6));   // non più veloce di così: si deve vedere riempirsi
    const target = age > 4.5 ? 1 : Math.min(load, cap);
    st.fill += (target - st.fill) * 0.09;
    if (!exiting && st.fill > 0.995 && st.draw >= 1) exit();
    render();
    requestAnimationFrame(loop);
  };

  // 3) luce tra i battenti, si aprono  4) si entra
  function exit() {
    exiting = true; st.fill = 1;
    gsap.timeline({ onUpdate: render, onComplete: () => finish(false) })
      .to(st, { ui: 0, duration: 0.4, ease: 'power2.in' }, 0.1)
      .to(st, { seam: 1, duration: 0.45, ease: 'power2.out' }, 0.15)
      .to(st, { open: 1, duration: 0.9, ease: 'power3.inOut' }, 0.5)
      .to(st, { zoom: 1, duration: 1.25, ease: 'power3.in' }, 0.75);
  }
  const skip = () => finish(true);

  const onKey = (e) => { if (e.key === 'Escape') skip(); };
  addEventListener('keydown', onKey);
  el.querySelector('.ingresso-salta').addEventListener('click', skip);
  addEventListener('resize', render);

  function finish(fast) {
    if (done) return;
    done = true;
    removeEventListener('keydown', onKey);
    try { sessionStorage.setItem('fs-ingresso', '1'); } catch (e) {}
    if (fast) { el.classList.add('ingresso--via'); setTimeout(() => el.remove(), 380); } else el.remove();
    behind.forEach((n) => (n.inert = false));
    html.classList.remove('ingresso-attivo');
    FS.lenis?.start();
    document.dispatchEvent(new Event('fs:ingresso-fine'));
  }

  // script arrivato quando la rete di sicurezza CSS (6 s) ha già tolto l'overlay: niente ingresso
  if (performance.now() > 5500) return finish(false);
  el.style.animation = 'none'; // da qui decide lo script; la rete CSS serve solo se fallisce
  behind.forEach((n) => (n.inert = true));
  FS.lenis?.stop();
  render();
  requestAnimationFrame(loop);
  setTimeout(() => !done && !exiting && exit(), 6500); // rete: qualsiasi intoppo, si entra comunque
})();
