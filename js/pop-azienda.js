/* PAGINA CHI SIAMO nello stile Pop (19 nov 2026), pop-azienda.html: "passiamo alla pagina chi siamo". Testi nell'html (quelli di azienda.template.html); qui quello che
   viene da js/data.js (i quattro numeri, i vitigni coi loro vini) e i movimenti. Dopo il primo giro: "la hero dammi alternative, non mi piace quell'immagine", "voglio 3d",
   "fare un'alternativa anche alla sostenibilità". Le scelte stanno nel pannello Prove (?apre=, ?foto=, ?vitigni=, ?sos=); la prima di ogni elenco è quella senza niente nell'indirizzo.
   20 nov, la sua scelta: "scelgo Rullo nella hero, foto vigna, sostenibilità palco, vitigni palco 3d". Sono le prime degli elenchi; le altre restano nel pannello finché non dice di toglierle.
   1. apertura. Bottiglie: le due i di "Chi siamo." sono due bottiglie 3D alte quanto lo schermo (Collezione 53 Primitivo e Tre Cuori); la prima arriva dalla macchina
      partendo dall'etichetta, la seconda rotolando; si girano trascinandole, scorrendo rotolano via. Dentro la bottiglia: una bottiglia gigante fra le due parole diventa la finestra sulla foto. Rullo: la bottiglia attraversa lo schermo e stende la foto. Lettere: le lettere sono finestre sulla foto e si entra in una lettera; stesso calcolo di js/pop-frase.js, che è lo
      script di pop-b e parte da solo (non si può importare). La foto della masseria è stata tolta: non gli piaceva;
   2. i nomi della famiglia salgono lettera per lettera (data-chars, js/moderna-kit.js), le righe a pennarello si disegnano entrando;
   3. i vitigni. Palco 3D: un nastro fermo sullo schermo, un vitigno alla volta col nome gigante, le sue bottiglie 3D alte quanto lo schermo e l'elenco dei suoi vini;
      scorrendo il nastro va a sinistra e le bottiglie rotolano. Fila: un blocco per vitigno con le foto del catalogo, sei alla volta (come gli altri vini di js/pop-vino.js);
   4. il Salento: sul computer palco fermo, la foto di un luogo copre quella di prima e il suo nome si riempie; sul telefono e con le animazioni ridotte le foto in colonna;
   5. sostenibilità. Palco: un fatto per schermo, la cifra gigante, il successivo copre il precedente da destra. Righe: i sei fatti uno sotto l'altro.
   Con le animazioni ridotte: titolo fermo con le sue i, vitigni in fila, luoghi in griglia, fatti in riga. Se il 3D non parte restano le i e la fila.
   Dipende da: gsap, ScrollTrigger, FS (js/main.js), FS.mk (js/moderna-kit.js); js/pop-palco3d.js (il palco 3D: three e js/bottiglia-3d-kit.js, caricati solo quando servono). */
import { palco3d, altezze } from './pop-palco3d.js';
const { $, $$ } = FS.mk;
const fermo = FS.reduce, tra = (t) => Math.min(1, Math.max(0, t)), TAU = Math.PI * 2, stretto = () => innerWidth <= 860;
const RIGA = '<svg class="pp-riga" viewBox="0 0 1000 12" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M3 7 C120 2 260 11 400 6 S700 2 860 7 S960 9 997 5"/></svg>';
const testa = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 76;
/* il carattere di un elemento, caricato davvero: document.fonts.ready da solo può arrivare prima che il browser l'abbia chiesto, e le misure venivano prese col carattere di riserva */
const caratteri = (el) => { const s = getComputedStyle(el); return document.fonts.load(`${s.fontWeight} 100px ${s.fontFamily}`).catch(() => {}).then(() => document.fonts.ready); };
const nav = $('.nav'), palcoFermo = (s) => nav.classList.toggle('pp-palco', s.isActive); /* mentre un palco è fermo l'header non ha il vetro (css/pop-prove.css) */

/* ---- le prove ---- */
const Q = new URLSearchParams(location.search);
const PROVE = { apre: ['Apertura', { rullo: 'Rullo', bottiglie: 'Bottiglie 3D', dentro: 'Dentro la bottiglia', lettere: 'Lettere' }], foto: ['Foto', { vigna: 'vigna', mare: 'mare', vite: 'vite' }], vitigni: ['Vitigni', { palco: 'Palco 3D', fila: 'Fila' }], sos: ['Sostenibilità', { palco: 'Palco', righe: 'Righe' }] };
/* la pagina può tenere solo alcune aperture (body data-aperture): company.html, il terzo mood, solo Lettere (le altre hanno le bottiglie e la scritta "Chi siamo."); una prova con una voce sola non va nel pannello */
const solo = document.body.dataset.aperture?.split(' ');
if (solo) PROVE.apre[1] = Object.fromEntries(Object.entries(PROVE.apre[1]).filter(([k]) => solo.includes(k)));
const scelta = Object.fromEntries(Object.entries(PROVE).map(([k, [, v]]) => [k, v[Q.get(k)] ? Q.get(k) : Object.keys(v)[0]]));
const verso = (k, v) => { const q = new URLSearchParams(location.search); if (v === Object.keys(PROVE[k][1])[0]) q.delete(k); else q.set(k, v); const s = q.toString(); return s ? `?${s}` : location.pathname; };
document.body.insertAdjacentHTML('beforeend', `<details class="pp-varianti"><summary>Prove: ${Object.entries(PROVE).map(([k, [, v]]) => v[scelta[k]]).join(' · ')}</summary><nav aria-label="Varianti di prova">${Object.entries(PROVE).filter(([, [, v]]) => Object.keys(v).length > 1).map(([k, [nome, v]]) =>
  `<p><span>${nome}</span>${Object.entries(v).map(([id, n]) => `<a href="${verso(k, id)}"${id === scelta[k] ? ' aria-current="true"' : ''}>${n}</a>`).join('')}</p>`).join('')}</nav></details>`);

/* il piede comune: le ancore della home (#premi, #news) qui non ci sono, portano alla home (come js/pagine.js). Logo gigante e bottiglie: js/pop-piede.js */
$$('.foot a[href^="#"]').forEach((a) => { if (!document.getElementById(a.hash.slice(1))) a.href = FS.home + a.hash; });
$$(`a[href^="${FS.home}#"]`).forEach((a) => { if (document.getElementById(a.hash.slice(1))) a.setAttribute('href', a.hash); }); /* "Contatti" dell'header: il piede c'è anche qui, non serve tornare in home */

/* ---- i numeri e i vitigni, dai dati ---- */
const VINI = FS.data.wines, VIT = ['Primitivo', 'Negroamaro', 'Verdeca', 'Malvasia Bianca'], viniDi = (v) => VINI.filter((w) => (w.uve || '').includes(v)); /* i quattro della frase qui sopra, come js/pagine.js */
const N = { vitigni: VIT.length, vini: VINI.length, collezioni: FS.mk.collezioni().length, premi: VINI.flatMap((w) => w.premi).length };
console.assert(N.vini && N.premi && VIT.every((v) => viniDi(v).length), 'chi siamo: numeri o vitigni vuoti nei dati');
$$('[data-n]').forEach((el) => (el.textContent = N[el.dataset.n]));

/* ---- il 3D: palco3d e altezze stanno in js/pop-palco3d.js (dal 20 nov li usa anche il piede, js/pop-piede.js) ---- */

/* ---- 1. l'apertura ---- */
const apre = $('.pu-apre'), palco = $('.pu-apre__st'), pillola = $('.m-pill');

async function apreBottiglie() {
  /* 19 nov, secondo giro: "apertura bottiglie 3d puoi fare meglio ... e poi le bottiglie grandi". Le bottiglie sono alte quanto lo schermo (dal piano fin sotto l'header) e
     la scritta poggia sul piano con loro: le due i sono due bottiglie alte il doppio delle lettere. La prima arriva dalla macchina: parte con l'etichetta a tutto schermo e
     si allontana girando fino al suo posto; la seconda entra rotolando da destra. Sul telefono due righe, la prima a destra e la seconda a sinistra, così ogni bottiglia ha
     il vuoto sopra di sé. Senza 3D (animazioni ridotte, o non parte): la scritta al centro con le sue i */
  const tit = $('.pu-tit', apre), dentro = $('.pu-tit__in', tit), parole = $$('.pu-w', tit), posti = $$('.pu-i', tit), tela = $('.pu-tela', apre), geo = { hh: 0.5 };
  let con3d = !fermo;
  if (con3d) apre.classList.add('is-b3', 'is-bott');
  const adatta = () => {
    const W = palco.clientWidth, H = palco.clientHeight, cima = testa(), largo = W > 860;
    tit.style.fontSize = '100px'; tit.style.paddingBottom = ''; tit.classList.remove('is-due'); posti.forEach((p) => (p.style.width = con3d ? '0px' : ''));
    const [a, b] = parole.map((p) => p.getBoundingClientRect().width); /* le due parole a 100px (col 3D senza il posto delle i, che è in pixel) */
    if (!con3d) { /* su una riga o su due: quella che viene più grande */
      const una = Math.min((W * 0.92 * 100) / (a + b + 22), (H - cima) * 0.82), due = Math.min((W * 0.92 * 100) / Math.max(a, b), ((H - cima) * 0.86) / 2.1);
      tit.classList.toggle('is-due', due > una); tit.style.fontSize = `${Math.max(una, due).toFixed(1)}px`;
      return;
    }
    const piano = largo ? 0.94 : 0.9; /* dove poggiano scritta e bottiglie, in frazioni dell'altezza */
    geo.hh = largo ? piano - cima / H - 0.02 : 0.36;
    const posto = 2 * 0.126 * geo.hh * H * 1.1; /* quanto è larga una bottiglia così alta (il corpo è circa un ottavo dell'altezza), più un filo d'aria */
    tit.classList.toggle('is-due', !largo);
    tit.style.fontSize = `${(largo ? ((W * 0.92 - 2 * posto) * 100) / (a + b + 22) : ((W * 0.92 - posto) * 100) / Math.max(a, b)).toFixed(1)}px`;
    posti.forEach((p) => (p.style.width = `${posto.toFixed(1)}px`));
    /* la linea di base dell'ultima riga sul piano: il segnaposto dentro la i sta sulla linea di base */
    tit.style.paddingBottom = `${Math.max(0, H * (1 - piano) - (dentro.getBoundingClientRect().bottom - posti[1].firstElementChild.getBoundingClientRect().bottom)).toFixed(1)}px`;
  };
  await caratteri(tit); adatta(); addEventListener('resize', adatta); document.fonts.addEventListener('loadingdone', adatta);
  apre.classList.add('is-pronta');
  if (fermo) return;
  const inCima = scrollY < 10 && !FS.arrivo;
  if (inCima) { /* arrivando in cima la scritta sale da sotto e la frase la segue ("la scritta grande deve sempre comparire in qualche modo") */
    gsap.fromTo(dentro, { yPercent: 30, clipPath: 'inset(0% -5% 100% -5%)' }, { yPercent: 0, clipPath: 'inset(-120% -5% -30% -5%)', duration: 1.2, ease: 'expo.out', delay: 0.1, clearProps: 'clipPath,transform' });
    gsap.from('.pu-apre__s', { autoAlpha: 0, y: 20, duration: 0.9, ease: 'power2.out', delay: 0.9 });
  }
  const st = { entra: inCima ? 0 : 1, via: 0 };
  gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: apre, start: 'top top', end: 'bottom bottom', scrub: 0.8 } })
    .to('.pu-apre__s', { autoAlpha: 0, duration: 0.2 }, 0.05).to(st, { via: 1, duration: 0.8 }, 0.1).to({}, { duration: 0.1 });
  try {
    const P = await palco3d(tela), att = await Promise.all(['primitivo53', 'tre-cuori'].map(P.nuova)), kMax = altezze(att);
    gsap.to(st, { entra: 1, duration: 2.3, ease: 'none', delay: 0.1 });
    P.trascina(() => att);
    P.gira(palco, (ora, dt) => {
      const tr = tela.getBoundingClientRect(), { W, H, Vw, Vh } = P.m;
      att.forEach((a, i) => {
        P.quieta(a, i, ora, dt);
        const q = posti[i].getBoundingClientRect(), piano = (posti[i].firstElementChild.getBoundingClientRect().bottom - tr.top) / H, x0 = (q.left + q.width / 2 - tr.left) / W, hh0 = geo.hh * (a.k / kMax);
        const e = 1 - Math.pow(1 - tra(st.entra * 1.2 - i * 0.2), 3), u = Math.pow(tra(st.via * 1.25 - (1 - i) * 0.25), 2), via = u * (1.3 - x0); /* scorrendo rotolano via a destra, prima quella di destra */
        if (i) { const x = x0 + via + (1 - e) * (1.25 - x0); P.metti(a, { x, piede: piano, hh: hh0, ry: a.giro + ((x - x0) * Vw) / (a.r * hh0 * Vh) }); return; } /* rotolando gira quanto si sposta: al suo posto è di fronte */
        const hh = hh0 * (1 + 2.6 * Math.pow(1 - e, 1.6)); /* la prima: da tre volte e mezza (l'etichetta al centro dello schermo) alla sua misura, facendo un giro */
        P.metti(a, { x: x0 + via + (0.5 - x0) * (1 - e), piede: piano + (0.5 + 0.37 * hh - piano) * (1 - e), hh, ry: a.giro + TAU * (1 - e) + (via * Vw) / (a.r * hh * Vh) });
      });
    });
  } catch (e) { console.warn('chi siamo: il 3D dell\'apertura non parte, restano le lettere', e); con3d = false; apre.classList.remove('is-b3', 'is-bott'); adatta(); }
}

/* ---- le aperture con la foto (?foto=): quale foto, per Dentro la bottiglia, Rullo e Lettere ---- */
const FOTO = { mare: ['mare-salento', 1920, 1080, 'La costa del Salento, sabbia e mare turchese', 'il mar Ionio, a due passi'], vigna: ['vigna-passeggiata', 1800, 1200, 'Due persone camminano fra i filari della vigna', 'fra i filari della vigna'], vite: ['alberello', 1920, 1280, 'Una vite di Primitivo ad alberello', 'Primitivo ad alberello'] };
const immagine = ([file, w, h, alt]) => `<img src="assets/photo/${file}.webp" alt="${alt}" width="${w}" height="${h}" decoding="async" fetchpriority="high">`;
/* la scritta gigante a 100px, per misurarla; poi aPiano la mette con la linea di base dell'ultima riga sul piano (il segnaposto .pu-base sta sulla linea di base) */
const misuraParole = (tit) => { tit.style.fontSize = '100px'; tit.style.paddingBottom = ''; tit.classList.remove('is-due'); return $$('.pu-w', tit).map((p) => p.getBoundingClientRect().width); };
const aPiano = (tit, piano) => { tit.style.paddingBottom = `${Math.max(0, palco.clientHeight * (1 - piano) - ($('.pu-tit__in', tit).getBoundingClientRect().bottom - $('.pu-base', tit).getBoundingClientRect().bottom)).toFixed(1)}px`; };
const sale = (el) => gsap.fromTo(el, { yPercent: 30, clipPath: 'inset(0% -5% 100% -5%)' }, { yPercent: 0, clipPath: 'inset(-120% -5% -30% -5%)', duration: 1.2, ease: 'expo.out', delay: 0.1, clearProps: 'clipPath,transform' }); /* la scritta sale da sotto */
/* la bottiglia che arriva dalla macchina (come la prima dell'apertura Bottiglie): da tre volte e mezza, con l'etichetta al centro dello schermo, alla sua misura, facendo un giro */
const dalVicino = (a, e, x0, piano, hh0) => { const hh = hh0 * (1 + 2.6 * Math.pow(1 - e, 1.6)); return { x: x0 + (0.5 - x0) * (1 - e), piede: piano + (0.5 + 0.37 * hh - piano) * (1 - e), hh, ry: a.giro + TAU * (1 - e) }; };

/* Dentro la bottiglia (19 nov: "voglio alternative oltre al testo che fa aprire l'immagine"): la Collezione 53 gigante sta fra "Chi" e "siamo."; scorrendo diventa una finestra
   della sua stessa forma (la sagoma viene dal profilo di assets/3d, quello che il kit fa girare) e ci si entra finché la foto è a tutto schermo. Sul telefono la bottiglia
   sta sopra la scritta. Con le animazioni ridotte: la finestra a forma di bottiglia già aperta, ferma */
async function apreDentro(f) {
  $('.pu-tit', apre).remove(); apre.classList.add('is-b3', 'is-dentro');
  palco.insertAdjacentHTML('afterbegin', `<figure class="pu-foto">${immagine(f)}<svg class="pu-velo" aria-hidden="true"><mask id="pu-m"><rect width="100%" height="100%" fill="#fff"/><path fill="#000" fill-opacity="0"/></mask><rect width="100%" height="100%" fill="#fff" mask="url(#pu-m)"/></svg><figcaption class="pu-dida">${f[4]}</figcaption></figure>
    <p class="pu-tit" aria-hidden="true"><span class="pu-tit__in"><span class="pu-w">Chi</span><span class="pu-i"><i></i></span><span class="pu-w">siamo.<i class="pu-base"></i></span></span></p>`);
  const tit = $('.pu-tit', apre), dentro = $('.pu-tit__in', tit), parole = $$('.pu-w', tit), posto = $('.pu-i', tit), tela = $('.pu-tela', apre), foto = $('.pu-foto img'), velo = $('.pu-velo'), sagoma = $('path', velo);
  const profilo = (await (await fetch('assets/3d/primitivo53.json')).json()).profilo; /* [raggio, quota] in altezze di bottiglia, dal fondo alla cima */
  sagoma.setAttribute('d', `M${profilo.map(([r, y]) => `${r} ${y}`).join('L')}L${[...profilo].reverse().map(([r, y]) => `${-r} ${y}`).join('L')}Z`);
  const geo = { x: 0.5, piano: 0.94, hh: 0.5 }, z = { p: 0 };
  let S = 16;
  const dove = () => { /* dove sta la bottiglia: sul computer nel posto fra le due parole, sul telefono al centro sopra la scritta. In frazioni dello schermo */
    const r = palco.getBoundingClientRect(), q = posto.getBoundingClientRect();
    return geo.x === null ? { x: (q.left + q.width / 2 - r.left) / r.width, piano: (posto.firstElementChild.getBoundingClientRect().bottom - r.top) / r.height } : geo;
  };
  const apri = () => { /* la finestra: la sagoma al posto della bottiglia, ingrandita attorno al centro dell'etichetta (S^p, velocità costante all'occhio); alla fine il bianco che resta si scioglie */
    const W = palco.clientWidth, H = palco.clientHeight, d = dove(), cx = d.x * W, fy = d.piano * H, h = geo.hh * H, oy = fy - 0.37 * h, s = Math.pow(S, z.p);
    S = (1.3 * Math.hypot(Math.max(cx, W - cx), Math.max(oy, H - oy))) / (0.118 * h);
    sagoma.setAttribute('transform', `matrix(${s} 0 0 ${s} ${(cx * (1 - s)).toFixed(2)} ${(oy * (1 - s)).toFixed(2)}) translate(${cx.toFixed(2)} ${fy.toFixed(2)}) scale(${h.toFixed(2)} ${(-h).toFixed(2)})`);
    velo.style.opacity = String(1 - tra((z.p - 0.75) / 0.25));
  };
  const adatta = () => {
    const W = palco.clientWidth, H = palco.clientHeight, cima = testa(), largo = W > 860;
    posto.style.width = '0px'; posto.style.display = largo ? '' : 'none'; /* sul telefono la bottiglia non sta fra le parole: il posto vuoto faceva una riga in più */
    const [a, b] = misuraParole(tit);
    if (largo) {
      geo.x = null; geo.hh = 0.94 - cima / H - 0.02;
      const pw = 2 * 0.126 * geo.hh * H * 1.3;
      tit.style.fontSize = `${(((W * 0.92 - pw) * 100) / (a + b)).toFixed(1)}px`; posto.style.width = `${pw.toFixed(1)}px`; aPiano(tit, 0.94);
    } else { /* due righe in fondo, la bottiglia sopra */
      tit.classList.add('is-due'); tit.style.fontSize = `${((W * 0.92 * 100) / Math.max(a, b)).toFixed(1)}px`; aPiano(tit, 0.95);
      geo.x = 0.5; geo.piano = (dentro.getBoundingClientRect().top - palco.getBoundingClientRect().top - 10) / H; geo.hh = geo.piano - (cima + 124) / H; /* sotto la frase, che sul telefono sta in alto */
    }
    apri();
  };
  await caratteri(tit); adatta(); addEventListener('resize', adatta); document.fonts.addEventListener('loadingdone', adatta);
  apre.classList.add('is-pronta');
  if (fermo) { sagoma.setAttribute('fill-opacity', 1); return; }
  const inCima = scrollY < 10 && !FS.arrivo, st = { entra: inCima ? 0 : 1 };
  if (inCima) { sale(dentro); gsap.from('.pu-apre__s', { autoAlpha: 0, y: 20, duration: 0.9, ease: 'power2.out', delay: 0.9 }); }
  gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: apre, start: 'top top', end: 'bottom bottom', scrub: 0.6 } })
    .fromTo(foto, { scale: 1.15 }, { scale: 1, duration: 2.6 }, 0)
    .to('.pu-apre__s', { autoAlpha: 0, duration: 0.25 }, 0.08)
    .to(tela, { autoAlpha: 0, duration: 0.45 }, 0.15).to(sagoma, { attr: { 'fill-opacity': 1 }, duration: 0.35 }, 0.15) /* la bottiglia si scioglie nella sua finestra */
    .to(parole[0], { xPercent: -45, autoAlpha: 0, duration: 0.8, ease: 'power1.in' }, 0.4).to(parole[1], { xPercent: 30, autoAlpha: 0, duration: 0.8, ease: 'power1.in' }, 0.4)
    .to(z, { p: 1, duration: 1.75, onUpdate: apri }, 0.5)
    .set(velo, { visibility: 'hidden' }, 2.25)
    .fromTo('.pu-dida', { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power2.out' }, 2.25)
    .to({}, { duration: 0.5 });
  try {
    const P = await palco3d(tela), a = await P.nuova('primitivo53');
    gsap.to(st, { entra: 1, duration: 2, ease: 'none', delay: 0.1 });
    P.trascina(() => [a]);
    P.gira(palco, (ora, dt) => { P.quieta(a, 0, ora, dt); const d = dove(); P.metti(a, dalVicino(a, 1 - Math.pow(1 - tra(st.entra * 1.2), 3), d.x, d.piano, geo.hh)); });
  } catch (e) { console.warn('chi siamo: il 3D dell\'apertura non parte, resta la finestra', e); sagoma.setAttribute('fill-opacity', 1); }
}

/* Rullo: la Collezione 53 gigante fa da rullo, come nella pagina del vino. Sotto c'è la foto con la scritta bianca, sopra un foglio bianco con la stessa scritta nera: il
   foglio è tagliato sull'asse della bottiglia, che scorrendo attraversa lo schermo e dove passa stende la foto (e la scritta diventa bianca). All'apertura entra da sinistra
   e si ferma al margine. Con le animazioni ridotte: foto a sinistra e foglio a destra, fermo (sul telefono solo una striscia di foto) */
async function apreRullo(f) {
  $('.pu-tit', apre).remove(); apre.classList.add('is-b3', 'is-rullo');
  const scritta = (c) => `<p class="pu-tit${c}" aria-hidden="true"><span class="pu-tit__in"><span class="pu-w">Chi</span> <span class="pu-w">siamo.<i class="pu-base"></i></span></span></p>`;
  palco.insertAdjacentHTML('afterbegin', `<figure class="pu-foto">${immagine(f)}</figure>${scritta(' pu-tit--chiara')}<div class="pu-carta">${scritta('')}</div>`);
  const carta = $('.pu-carta', apre), tits = $$('.pu-tit', apre), tela = $('.pu-tela', apre), geo = { piano: 0.94, hh: 0.5 }, st = { entra: 0, via: 0 };
  carta.append($('.pu-apre__s', apre)); /* la frase sta sul foglio bianco e se ne va con lui */
  const adatta = () => {
    const W = palco.clientWidth, H = palco.clientHeight, cima = testa(), largo = W > 860, [a, b] = misuraParole(tits[0]);
    geo.piano = largo ? 0.94 : 0.9; geo.hh = largo ? geo.piano - cima / H - 0.02 : 0.42;
    geo.fermo = largo ? 0.07 : 0.04; /* dove si ferma all'apertura: al margine sinistro, a sinistra della scritta, che sta a destra (nell'84% sul computer, nel 78% sul telefono) */
    const F = largo ? Math.min((W * 0.84 * 100) / (a + b + 22), (H - cima) * 0.62) : (W * 0.78 * 100) / Math.max(a, b);
    tits.forEach((t) => { t.style.fontSize = `${F.toFixed(1)}px`; t.classList.toggle('is-due', !largo); aPiano(t, geo.piano); });
  };
  const xDi = () => (fermo ? (palco.clientWidth > 860 ? 0.42 : 0.04) : -0.1 + (geo.fermo + 0.1) * (1 - Math.pow(1 - tra(st.entra), 3)) + st.via * 1.15); /* l'asse della bottiglia: fuori a sinistra, poi ferma al margine, poi fin oltre il bordo destro. Fermo: il taglio a sinistra del marchio dell'header (a metà lo tagliava in due, mezzo sulla foto); sul telefono solo una striscia, perché a metà la foto copriva l'inizio della frase */
  /* 20 nov: "i colori dell'header diventano bianchi quando passa la bottiglia, altrimenti non si legge nulla". Ogni voce dell'header diventa bianca quando il taglio l'ha
     passata (sotto ha la foto) e torna nera quando il palco se ne va da sotto l'header; come la scritta, che è bianca dove la bottiglia è passata */
  const voci = $$('.nav__link, .nav__logo, .nav__lang, .nav__burger', nav);
  const taglia = () => {
    const r = palco.getBoundingClientRect(), X = xDi() * r.width, sotto = r.top < testa() / 2 && r.bottom > testa() / 2;
    carta.style.clipPath = `inset(0 0 0 ${X.toFixed(1)}px)`;
    voci.forEach((v) => { /* t: quanto della voce sta sulla foto. La voce che il taglio attraversa è di due colori, divisa proprio lì (--t, css/pop-azienda.css): "Az" nero sulla foto non si leggeva */
      const q = v.getBoundingClientRect(), t = sotto ? r.left + X - q.left : 0;
      v.classList.toggle('pu-sufoto', t > q.width / 2); v.classList.toggle('pu-ataglio', t > 0 && t < q.width); v.style.setProperty('--t', `${t.toFixed(1)}px`);
    });
  };
  await caratteri(tits[0]); adatta(); taglia(); addEventListener('resize', () => { adatta(); taglia(); }); document.fonts.addEventListener('loadingdone', adatta);
  addEventListener('scroll', taglia, { passive: true }); /* anche dopo la fine del palco: quando esce da sotto l'header le voci tornano nere */
  apre.classList.add('is-pronta');
  if (fermo) return;
  if (scrollY < 10 && !FS.arrivo) tits.forEach((t) => sale($('.pu-tit__in', t))); else st.entra = 1; /* già scorsa o arrivata dal cambio di mood: la bottiglia è già ferma al margine */
  gsap.to(st, { entra: 1, duration: 1.6, ease: 'none', delay: 0.5, onUpdate: taglia });
  gsap.timeline({ defaults: { ease: 'none' }, onUpdate: taglia, scrollTrigger: { trigger: apre, start: 'top top', end: 'bottom bottom', scrub: 0.8 } }).to(st, { via: 1, duration: 1 }, 0).to({}, { duration: 0.25 });
  try {
    const P = await palco3d(tela), a = await P.nuova('primitivo53');
    P.trascina(() => [a]);
    P.gira(palco, (ora, dt) => { P.quieta(a, 0, ora, dt); const x = xDi(); P.metti(a, { x, piede: geo.piano, hh: geo.hh, ry: a.giro + ((x - geo.fermo) * P.m.Vw) / (a.r * geo.hh * P.m.Vh) }); }); /* rotolando gira quanto si sposta: ferma al margine è di fronte */
  } catch (e) { console.warn('chi siamo: il 3D dell\'apertura non parte, resta il taglio', e); }
}

function apreLettere(f) {
  $('.pu-tit', apre).remove(); $('.pu-tela', apre).remove(); apre.classList.add('is-lettere');
  palco.insertAdjacentHTML('afterbegin', `<figure class="pu-foto">${immagine(f)}
    <svg class="pu-velo" aria-hidden="true"><mask id="pu-m"><rect width="100%" height="100%" fill="#fff"/><text></text></mask><rect width="100%" height="100%" fill="#fff" mask="url(#pu-m)"/></svg><figcaption class="pu-dida">${f[4]}</figcaption></figure>`);
  const fig = $('.pu-foto'), foto = $('img', fig), velo = $('.pu-velo'), testo = $('text', velo);
  const metro = palco.appendChild(document.createElement('span')), largo = (s) => { metro.textContent = s; return metro.getBoundingClientRect().width; }; /* dentro la maschera il browser misura le parole solo dopo averle disegnate */
  metro.className = 'pu-metro'; metro.setAttribute('aria-hidden', 'true');
  const z = { p: 0 }, PAROLE = (apre.dataset.parole || 'Chi siamo.').split(' '); /* data-parole: le parole della pagina (company.html: "Feudi Salentini."); si entra dalla prima i dell'ultima riga */
  let S = 50, o = [0, 0];
  const metti = () => { /* lo zoom cresce in proporzione (S^p), così all'occhio va a velocità costante; nell'ultimo tratto il bianco che resta si scioglie */
    const s = Math.pow(S, z.p);
    testo.setAttribute('transform', `matrix(${s} 0 0 ${s} ${o[0] * (1 - s)} ${o[1] * (1 - s)})`);
    velo.style.opacity = String(1 - tra((z.p - 0.6) / 0.4));
  };
  const adatta = () => { /* le parole larghe quasi quanto lo schermo, il blocco al centro sotto l'header; poi il punto in cui si entra: l'asta della i */
    const cima = testa(), W = fig.clientWidth, H = fig.clientHeight;
    /* su una riga o su due: quella che viene più grande. lunga: la riga più larga, a 100px */
    const prova = (parole) => { const lunga = Math.max(...parole.map(largo)); return { parole, lunga, F: Math.min((W * 0.92 * 100) / lunga, ((H - cima) * 0.78) / (parole.length * 0.84)) }; };
    const { parole, lunga, F } = [[PAROLE.join(' ')], PAROLE].map(prova).sort((a, b) => b.F - a.F)[0], k = F / 100;
    testo.innerHTML = parole.map((p) => `<tspan x="50%">${p}</tspan>`).join('');
    const righe = [...testo.children], n = righe.length;
    testo.style.fontSize = `${F}px`;
    const y0 = (H + cima) / 2 + 0.35 * F - (n - 1) * 0.42 * F;
    righe.forEach((r, i) => r.setAttribute('y', (y0 + i * 0.84 * F).toFixed(1)));
    const riga = righe[n - 1].textContent, i = riga.indexOf('i');
    o = [W / 2 + (largo(riga.slice(0, i)) + largo(riga[i]) / 2 - largo(riga) / 2) * k, y0 + (n - 1) * 0.84 * F - 0.25 * F];
    /* oltre circa 30.000 pixel dal punto dello zoom il browser disegna male le lettere: lo zoom si ferma dove la più lontana resta sotto 20.000 pixel veri */
    const mezza = (lunga * k) / 2, alto = y0 - 0.8 * F, basso = y0 + (n - 1) * 0.84 * F + 0.3 * F;
    const lontano = Math.hypot(Math.max(o[0] - (W / 2 - mezza), W / 2 + mezza - o[0]), Math.max(o[1] - alto, basso - o[1]));
    S = Math.min((2.6 * Math.max(W, H)) / (0.11 * F), 20000 / (lontano * Math.min(devicePixelRatio || 1, 3)));
    metti();
  };
  addEventListener('resize', adatta); document.fonts.addEventListener('loadingdone', adatta);
  caratteri(metro).then(adatta).finally(() => {
    apre.classList.add('is-pronta');
    if (!fermo && scrollY < 10) { /* arrivando in cima la foto sale dentro le lettere e la frase la segue */
      gsap.fromTo(foto, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'expo.out', delay: 0.15, clearProps: 'clipPath' });
      gsap.from('.pu-apre__s', { autoAlpha: 0, y: 20, duration: 0.9, ease: 'power2.out', delay: 0.8 });
    }
  });
  if (!fermo) gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: apre, start: 'top top', end: 'bottom bottom', scrub: 0.6 } })
    .fromTo(foto, { scale: 1.2 }, { scale: 1, duration: 2.5 }, 0)
    .to('.pu-apre__s', { autoAlpha: 0, duration: 0.3 }, 0.15)
    .to(z, { p: 1, duration: 2, onUpdate: metti }, 0.3)
    .set(velo, { visibility: 'hidden' }, 2.3)
    .fromTo('.pu-dida', { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power2.out' }, 2.3) /* a foto intera, cos'è */
    .to({}, { duration: 0.6 }); /* la foto resta intera un poco prima della famiglia */
}
({ bottiglie: apreBottiglie, dentro: apreDentro, rullo: apreRullo, lettere: apreLettere })[scelta.apre](FOTO[scelta.foto]);

/* ---- 3. i vitigni ---- */
const uve = $('.pu-uve');
function vitigniFila() { /* un blocco per vitigno con le foto del catalogo in fila sulla riga, sei alla volta ("non più di sei bottiglie alla volta"); le regole della fila sono in css/pop-vino.css */
  uve.classList.add('is-fila');
  uve.innerHTML = VIT.map((v, i) => `<article class="pu-uva${v.includes(' ') ? ' pu-uva--due' : ''}" aria-labelledby="pu-u${i}">
    <div class="sv-altri__t"><p class="sv-k"><b>${viniDi(v).length}</b>vini</p><button class="fo-link sv-altri__b" type="button" hidden></button></div>
    <div class="sv-banco"><h3 class="sv-coll" id="pu-u${i}" data-chars>${v}</h3>${RIGA.replace('pp-riga', 'pp-riga sv-piano')}<div class="sv-fila"></div></div>
  </article>`).join('');
  $$('.pu-uva').forEach((sa, i) => {
    const vini = viniDi(VIT[i]), banco = $('.sv-banco', sa), fila = $('.sv-fila', sa), b = $('.sv-altri__b', sa);
    let da = 0;
    banco.classList.toggle('is-tanti', vini.length > 3); /* sul totale, non sulla mandata: con tre bottiglie nell'ultima il blocco cambierebbe forma */
    const mostra = (entra) => {
      const v = vini.slice(da, da + 6), resto = vini.length - da - 6;
      fila.innerHTML = v.map((x) => `<a class="fo-bt" href="${FS.wineUrl(x.id)}" style="--b:${x.fondo}"><img src="${x.bottle}" alt="" width="653" height="1024" loading="lazy" decoding="async"><span>${x.name}</span></a>`).join('');
      fila.style.setProperty('--n', v.length);
      b.hidden = vini.length <= 6; b.textContent = resto > 0 ? `Altri ${resto} vini` : 'Ricomincia';
      if (entra && !fermo) gsap.from(fila.children, { x: () => innerWidth * 0.5, duration: 1.1, ease: 'power3.out', stagger: 0.08, clearProps: 'transform' });
    };
    b.addEventListener('click', () => { da = da + 6 < vini.length ? da + 6 : 0; mostra(true); });
    mostra();
    if (!fermo) { /* la riga si disegna e le bottiglie arrivano quando il blocco entra (le regole di .sv-attesa sono in css/pop-vino.css) */
      sa.classList.add('sv-attesa');
      const vede = new IntersectionObserver(([e]) => { if (!e.isIntersecting) return; vede.disconnect(); sa.classList.add('is-su'); mostra(true); }, { rootMargin: '0px 0px -18% 0px' });
      vede.observe(banco);
    }
  });
}

/* le bottiglie 3D che ci sono per ogni vitigno (assets/3d; Càla e Terra Malvasia Bianca fatte il 19 nov con tools/bottiglia_3d.py, il vetro di Blender il 20: tools/PIANO-giro3.md, 92). tel: quelle che si vedono anche sul telefono.
   shortcut: dodici bottiglie 3D su trentatré, quindi sul nastro non ci sono tutti i vini di un vitigno; l'elenco accanto invece li ha tutti. Con altre bottiglie in assets/3d basta aggiungerle qui */
const TRE_D = [[['125-primitivo'], ['primitivo53', 1], ['tre-cuori', 1], ['philia', 1], ['terra-primitivo']], [['125-negroamaro', 1], ['terra-negroamaro', 1]], [['cala', 1]], [['terra-malvasia-bianca', 1]]];
function vitigniPalco() {
  const PASSO = 1.15; /* quanto dista un vitigno dal successivo sul nastro, in larghezze di schermo */
  uve.classList.add('is-palco');
  uve.innerHTML = `<div class="pu-nastro">${VIT.map((v, i) => `<h3 class="pu-vn" id="pu-u${i}">${v}</h3>`).join('')}
    <canvas class="pu-tela3" role="img" aria-label="Le bottiglie in 3D dei vitigni, un vitigno alla volta: si girano trascinandole"></canvas>${RIGA.replace('pp-riga', 'pp-riga pu-piano')}
    ${VIT.map((v, i) => `<div class="pu-vl" role="group" aria-labelledby="pu-u${i}"><p class="sv-k"><b>${viniDi(v).length}</b>vini</p><ul>${viniDi(v).map((w) => `<li><a href="${FS.wineUrl(w.id)}">${w.name}</a></li>`).join('')}</ul></div>`).join('')}</div>`;
  const nastro = $('.pu-nastro', uve), tela = $('.pu-tela3', uve), scene = VIT.map((_, k) => [$$('.pu-vn', uve)[k], $$('.pu-vl', uve)[k]]), st = { p: 0, entra: 0 };
  const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' }, scrollTrigger: { trigger: uve, start: 'top top', end: 'bottom bottom', scrub: 0.8 } });
  ScrollTrigger.create({ trigger: uve, start: 'top 170', end: 'bottom 170', onToggle: palcoFermo }); /* il nome gigante arriva fin sotto l'header: il vetro va tolto finché il palco gli passa sotto, non solo mentre è fermo (sennò all'inizio e alla fine il nome usciva sfocato) */
  VIT.forEach((_, k) => { if (k) tl.to(st, { p: k, duration: 1 }, k * 1.5 - 1); }); /* un secondo di passaggio, mezzo di sosta */
  tl.to({}, { duration: 0.5 });
  const sposta = () => scene.forEach((s, k) => { const d = k - st.p, via = Math.abs(d) >= 0.98; s.forEach((el) => { el.style.visibility = via ? 'hidden' : ''; el.style.transform = `translate3d(${(d * PASSO * nastro.clientWidth).toFixed(1)}px,0,0)`; }); });
  sposta(); tl.eventCallback('onUpdate', sposta); addEventListener('resize', sposta);
  new IntersectionObserver(([e], io) => { if (!e.isIntersecting) return; io.disconnect(); nastro.classList.add('is-su'); }, { rootMargin: '0px 0px -30% 0px' }).observe(nastro); /* la riga del piano si disegna */

  /* le bottiglie si caricano quando il palco è a uno schermo e mezzo: dodici etichette srotolate pesano, e chi non arriva fin qui non le paga */
  new IntersectionObserver(async ([e], io) => {
    if (!e.isIntersecting) return; io.disconnect();
    try {
      const P = await palco3d(tela), tel = stretto();
      const gruppi = await Promise.all(TRE_D.map((g) => Promise.all(g.filter(([, t]) => !tel || t).map(([f]) => P.nuova(f)))));
      const kMax = altezze(gruppi.flat());
      let fatto = '';
      const disponi = () => { /* ogni vitigno: le sue bottiglie vicine, la più alta dal piano fin sotto l'header (sul telefono fin sotto il nome); se non stanno in larghezza si rimpiccioliscono */
        const { W, H } = P.m, largo = W > 860; if (fatto === W + 'x' + H) return; fatto = W + 'x' + H;
        const piano = largo ? 0.92 : 0.6, cima = largo ? testa() / H + 0.03 : (testa() + W * 0.4) / H, centro = largo ? 0.58 : 0.5, max = W * (largo ? 0.6 : 0.9), spazio = W * 0.012;
        nastro.style.setProperty('--piano', `${(piano * 100).toFixed(1)}%`);
        gruppi.forEach((g) => {
          let h = (piano - cima) / kMax; const larghe = () => g.map((a) => 2 * a.r * h * a.k * H), vuoti = spazio * (g.length - 1);
          let tot = larghe().reduce((s, w) => s + w, 0) + vuoti;
          if (tot > max) { h *= (max - vuoti) / (tot - vuoti); tot = max; }
          let x = centro * W - tot / 2;
          larghe().forEach((w, j) => { g[j].x = (x + w / 2) / W; g[j].hh = h * g[j].k; x += w + spazio; }); g.piano = piano;
        });
      };
      P.trascina(() => gruppi[Math.round(st.p)]);
      const vede = new IntersectionObserver(([v], io2) => { if (!v.isIntersecting) return; io2.disconnect(); gsap.to(st, { entra: 1, duration: 1.8, ease: 'none' }); }, { rootMargin: '0px 0px -35% 0px' }); /* le prime entrano rotolando da destra quando il palco arriva */
      vede.observe(nastro);
      P.gira(nastro, (ora, dt) => {
        disponi();
        gruppi.forEach((g, k) => g.forEach((a, j) => {
          P.quieta(a, j, ora, dt);
          const e = k ? 1 : 1 - Math.pow(1 - tra(st.entra * 1.4 - j * 0.1), 3), x = a.x + (k - st.p) * PASSO + (1 - e) * (1.15 - a.x);
          P.metti(a, { x, piede: g.piano, hh: a.hh, ry: a.giro + ((x - a.x) * P.m.Vw) / (a.r * a.hh * P.m.Vh) }); /* rotolando gira quanto si sposta: ferma al suo posto è di fronte */
        }));
      });
      nastro.classList.add('is-3d');
    } catch (err) { console.warn('chi siamo: il 3D dei vitigni non parte', err); }
  }, { rootMargin: '150% 0px' }).observe(nastro);
}
if (scelta.vitigni === 'palco' && !fermo) vitigniPalco(); else vitigniFila();

FS.mk.titoli(); /* le parole [data-chars] entrano lettera per lettera: dopo i vitigni, che in fila hanno il loro nome */

if (!fermo) {
  /* le righe a pennarello e le stampe: entrano quando la loro parte arriva in vista (css: .pp-attesa) */
  document.body.classList.add('pp-attesa');
  const vede = new IntersectionObserver((voci) => voci.forEach((v) => { if (v.isIntersecting) { v.target.classList.add('is-su'); vede.unobserve(v.target); } }), { rootMargin: '0px 0px -14% 0px' });
  $$('.pu-riga, .pu-fam__lato').forEach((r) => vede.observe(r));

  /* ---- 4. il Salento, solo sul computer: un passo di scorrimento per luogo. La foto nuova copre quella di prima da destra; a metà passata cambia il nome pieno ---- */
  const sal = $('.pu-sal'), luoghi = $$('.pu-luoghi li', sal), stampe = luoghi.map((l) => $('img', l));
  gsap.matchMedia().add('(min-width: 861px)', () => {
    sal.classList.add('is-viva');
    const ora = (k) => luoghi.forEach((l, i) => l.classList.toggle('is-ora', i === k));
    /* il nome cambia col tempo del timeline (onUpdate suo), non con lo scorrimento: lo scrub arriva dopo, e il nome restava indietro di un luogo */
    const tl = gsap.timeline({ defaults: { ease: 'none' }, onUpdate: () => ora(Math.min(luoghi.length - 1, Math.floor(tl.time() + 0.35))),
      scrollTrigger: { trigger: sal, start: 'top top', end: 'bottom bottom', scrub: 0.6, onToggle: palcoFermo } });
    stampe.forEach((f, k) => { if (k) tl.fromTo(f, { clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6 }, k - 0.6); });
    tl.to({}, { duration: 0.5 }, luoghi.length - 1);
    ora(0);
    return () => { sal.classList.remove('is-viva'); nav.classList.remove('pp-palco'); luoghi.forEach((l) => l.classList.remove('is-ora')); gsap.set(stampe, { clearProps: 'clipPath' }); };
  });

  /* ---- 5. sostenibilità a palco: un fatto per schermo, il successivo copre il precedente da destra (come le collezioni di pop-b: il taglio passa sulle lettere) ---- */
  if (scelta.sos === 'palco') {
    const sos = $('.pu-sos'), fatti = $$('.pu-fatto', sos);
    sos.classList.add('is-palco');
    const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: '.pu-giro', start: 'top top', end: 'bottom bottom', scrub: 0.6, onToggle: palcoFermo } });
    fatti.forEach((f, k) => { if (k) tl.fromTo(f, { clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6 }, k - 0.6); });
    tl.to({}, { duration: 0.5 }, fatti.length - 1);
  }

  /* la pillola "I nostri vini" non sta sopra l'apertura, i vitigni, il Salento e il palco della sostenibilità (lì coprirebbe nomi e testi). Un tratto per parte: la pillola
     resta via finché uno è attivo, anche dove due si accavallano (in company.html i vitigni stanno in fondo, non attaccati al Salento) */
  const attivi = new Set(), senza = (trigger) => ScrollTrigger.create({ trigger, start: 'top bottom', end: 'bottom 40%', onToggle: (s) => { attivi[s.isActive ? 'add' : 'delete'](s); pillola?.classList.toggle('in-storia', attivi.size > 0); } });
  pillola?.classList.add('in-storia');
  senza(apre); senza('.pu-vit'); senza(sal); if (scelta.sos === 'palco') senza('.pu-giro');
}
