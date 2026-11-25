/* IL PIEDE del Pop (20 nov 2026), su pop-b, pop-vino e pop-azienda: "nel footer togli il numero in grande e metti il logo in grande da parte a parte e nel footer io
   metterei comunque le bottiglie che scorrendo riappaiono e fanno magari un altro movimento mentre rotolano sul piano".
   Il logo è quello del piede comune (sections/footer.html): css/pop-prove.css lo fa a tutta larghezza, in cima al piede, sopra le colonne ("la parte del footer la
   sposterei sopra alle info contatti cantina ecc"; al primo giro stava in fondo). Qui:
   1. il pannello delle prove si toglie finché la scritta del logo è sullo schermo (l'header no: resta sempre, col suo vetro bianco);
   2. le bottiglie 3D: le quattro dell'apertura della home tornano rotolando dai due lati e si fermano ai fianchi del castello, in piedi sulla scritta del logo, che fa da
      piano. L'altro movimento: mentre corrono pendono all'indietro e, fermandosi, dondolano sulla base finché si quietano (una molla sull'inclinazione, spinta dalla
      velocità). Entrano quando il piano è sullo schermo; tornando su rotolano via, così scendendo di nuovo riappaiono. Sul telefono due sole, più alte del logo.
   Con le animazioni ridotte, o se il 3D non parte, resta il logo. Dipende da: gsap, FS (js/main.js), js/pop-palco3d.js. */
import { palco3d, altezze } from './pop-palco3d.js';

const foot = document.querySelector('.foot'), cima = foot.querySelector('.foot__top'), logo = cima.querySelector('.logo');
const tra = (t) => Math.min(1, Math.max(0, t));
const PIANO = 137.2 / 164; /* la cima delle lettere dritte nel logo (assets/logo/feudi-logo.svg, 396 x 164; le tonde salgono un filo di più): lì poggiano le bottiglie */

/* ---- 1. il pannello delle prove (chiuso), che in basso a sinistra coprirebbe la scritta del logo: via finché la scritta è sullo schermo.
   L'header non si tocca: "la sticky header resta sempre sul bianco come fondo blurred" (prima si toglieva mentre il castello gli passava sotto) ---- */
const via = () => { const r = logo.getBoundingClientRect(); document.querySelector('.pp-varianti')?.classList.toggle('is-via', r.top + r.height * PIANO < innerHeight && r.bottom > 0); };
addEventListener('scroll', via, { passive: true }); addEventListener('resize', via); via();

/* ---- 2. le bottiglie ---- */
async function bottiglie() {
  const largo = innerWidth > 860;
  /* quali, dove (dal centro del logo, in larghezze del logo: sopra le lettere, ai lati del castello) e con che ritardo partono: prima quelle vicine al castello, che hanno più strada */
  const NOMI = largo ? ['primitivo53', 'organic-bianco', 'tre-cuori', 'terra-negroamaro'] : ['primitivo53', 'tre-cuori'];
  const POSTI = largo ? [-0.4, -0.23, 0.23, 0.4] : [-0.31, 0.31], RIT = largo ? [0.25, 0, 0, 0.25] : [0, 0], QUANTO = largo ? 0.95 : 2.4; /* quanto sono alte, rispetto a quanto il piano dista dalla cima del logo */
  const tela = document.createElement('canvas'); tela.className = 'foot__tela'; tela.setAttribute('aria-hidden', 'true'); cima.append(tela);
  try {
    const P = await palco3d(tela), att = await Promise.all(NOMI.map(P.nuova)), kMax = altezze(att), st = { p: 0 };
    let dentro = false;
    P.gira(cima, (ora, dt) => {
      const L = logo.getBoundingClientRect(), T = tela.getBoundingClientRect(), { W, H, Vw, Vh } = P.m, piano = L.top + L.height * PIANO;
      const sulPiano = piano < innerHeight - 30; /* il piano è sullo schermo: entrano; se torna sotto il bordo, escono */
      if (sulPiano !== dentro) { dentro = sulPiano; gsap.to(st, { p: dentro ? 1 : 0, duration: dentro ? 2.4 : 0.9, ease: 'none', overwrite: true }); }
      att.forEach((a, i) => {
        P.quieta(a, i, ora, dt);
        const lato = Math.sign(POSTI[i]), x0 = (L.left + L.width * (0.5 + POSTI[i]) - T.left) / W, hh = ((L.height * PIANO * QUANTO) / H) * (a.k / kMax);
        const e = 1 - Math.pow(1 - tra(st.p * 1.25 - RIT[i]), 3), x = x0 + lato * (1 - e) * (lato < 0 ? x0 + 0.12 : 1.12 - x0);
        /* la molla: pende dalla parte opposta a dove va, quanto corre; ferma, torna dritta passando oltre e dondola */
        const corre = a.xp === undefined ? 0 : Math.max(-3, Math.min(3, (x - a.xp) / Math.max(dt, 0.001)));
        a.xp = x; a.tz ??= 0; a.tv ??= 0;
        a.tv += ((Math.max(-0.24, Math.min(0.24, corre * 0.3)) - a.tz) * 70 - a.tv * 3.2) * dt; a.tz += a.tv * dt;
        P.metti(a, { x, piede: (piano - T.top) / H, hh, ry: a.giro + ((x - x0) * Vw) / (a.r * hh * Vh), tz: a.tz }); /* rotolando gira quanto si sposta: al suo posto è di fronte */
      });
    });
  } catch (e) { console.warn('piede: il 3D non parte, resta il logo', e); tela.remove(); }
}
if (!FS.reduce) {
  let partite = false, mosso = performance.now();
  const parti = () => { if (partite) return; partite = true; vede.disconnect(); bottiglie(); };
  const vede = new IntersectionObserver((voci) => { if (voci.some((v) => v.isIntersecting)) parti(); }, { rootMargin: '150% 0px' }); /* al più tardi quando il piede è a uno schermo e mezzo */
  vede.observe(foot);
  /* 25 nov ("alleggerire... dove lo scroll si blocca"): prepararle mentre si arrivava al piede bloccava lo scorrimento lì. Ora si preparano prima, cinque secondi dopo il
     caricamento e a pagina ferma; chi scorre senza mai fermarsi le trova come prima */
  addEventListener('scroll', () => (mosso = performance.now()), { passive: true });
  const aspetta = () => { if (!partite) performance.now() - mosso > 600 ? parti() : setTimeout(aspetta, 300); };
  addEventListener('load', () => setTimeout(aspetta, 5000));
}
