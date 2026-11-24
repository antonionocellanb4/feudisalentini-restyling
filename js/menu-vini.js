/* IL MENU DEI VINI di Pop e Botanica (24 nov 2026), da 1080 px in su: l'Indice. Scelto fra tre prove ("il mega menu, mi daresti delle alternative più funzionali e non troppo
   incasinate?", poi "direi la versione C per pop e botanico"); le altre due, Scaffale e Collezioni, e il selettore sono in _archivio-prove/menu-vini-prove-24nov.
   Tutti i vini in vista, una colonna per collezione, ogni nome è un link alla sua scheda; a destra la bottiglia del vino sotto il mouse (o col fuoco) con denominazione, vista
   e "Apri la scheda"; in Botanica la bottiglia sta sulla targa delle copertine con la pianta della sua collezione. In alto una riga sola: ricerca, colori (ripremuti si
   tolgono), Chiudi. Prende il posto del palco di js/nav.js (.cstage: resta per gli altri siti, qui lo nasconde css/menu-vini.css); sotto i 1080 px resta l'elenco del telefono.
   Ricerca, conteggi, apertura e chiusura sono quelli di js/nav.js (FS.cantina, eventi fs:cantina-aperta e fs:cantina-cerca). */
(() => {
  const C = FS.cantina, cantina = document.getElementById('cantina');
  if (!C || !cantina || !document.body.classList.contains('page-fo')) return;
  const D = FS.data, bp = document.body.classList.contains('bp') && window.FS_BF, TIPI = [['rosso', 'Rossi'], ['rosato', 'Rosati'], ['bianco', 'Bianchi'], ['dolce', 'Dolce']];
  const cols = C.sets.filter((s) => s.group === 'col').map((s) => ({ id: s.key.slice(4), name: s.name, wines: s.wines }));
  const qui = FS.wine(new URLSearchParams(location.search).get('id')), vini = (n) => `${n} ${n === 1 ? 'vino' : 'vini'}`; /* qui: sulla pagina di un vino si parte da lui */
  let tipo = '', visto = qui || D.wines[0], segna = ''; /* segna: la collezione chiesta da chi apre il menu (piede, pagina del vino) */

  const cm = document.createElement('div'); cm.className = 'cm';
  cm.innerHTML = `<div class="cm-bar">${C.cercaHTML}<ul class="cm-tipi" aria-label="Filtra per colore">${TIPI.map(([t, n]) => `<li><button type="button" data-cm-tipo="${t}" aria-pressed="false">${n} <i></i></button></li>`).join('')}</ul><button class="cm-x" type="button">Chiudi</button></div><div class="cm-corpo"></div>`;
  cantina.querySelector('.cantina__in').append(cm);
  document.documentElement.classList.add('cm-on'); /* da qui il css nasconde il palco: se questo script non parte resta il menu di prima */
  const corpo = cm.querySelector('.cm-corpo'), campo = cm.querySelector('[data-cantina-cerca]');

  /* Botanica: la targa delle copertine nel colore di sala della collezione, con la sua pianta intera. L'indirizzo della pianta sta nello stile dell'elemento: in una variabile
     Chrome lo cercherebbe dalla cartella del css */
  const targa = (id) => { const s = bp && bp.find((x) => x.id === id), m = s && `url(assets/botanica/${s.pianta}.webp)`; return s ? `<span class="cm-targa" aria-hidden="true" style="--c:${s.c};--c3:${s.c3}"><i style="-webkit-mask-image:${m};mask-image:${m}"></i></span>` : ''; };
  const doppio = (w) => D.wines.some((x) => x !== w && x.name === w.name); /* i due Primaura hanno lo stesso nome e la stessa denominazione: li distinguono le uve */
  const va = (w) => (!tipo || w.tipo === tipo) && C.trova(w);
  /* la bottiglia del vino sotto il mouse, con quello che serve per sceglierlo */
  const anteprima = (w) => {
    const a = corpo.querySelector('.cm-ante'); if (!a || !w) return;
    visto = w; corpo.querySelectorAll('.cm-indice a').forEach((x) => x.classList.toggle('is-on', x.dataset.wine === w.id));
    if (a.dataset.w === w.id) return;
    a.dataset.w = w.id;
    a.innerHTML = `<a class="cm-ante__b" href="${FS.wineUrl(w.id)}" data-wine="${w.id}" tabindex="-1" aria-hidden="true" style="--b:${w.fondo}">${targa(w.collection)}<span class="cm-vetro"><img src="${w.bottle}" alt="" width="653" height="1024" decoding="async"></span></a><p class="cm-ante__n cm-t">${w.name}</p><p class="cm-ante__d">${w.denom} · ${FS.collection(w.collection).name}</p>${w.vista ? `<p class="cm-ante__v">${w.vista}</p>` : ''}<a class="btn cm-ante__go" href="${FS.wineUrl(w.id)}" data-wine="${w.id}">Apri la scheda</a>`;
  };
  const disegna = () => {
    cm.querySelectorAll('[data-cm-tipo]').forEach((b) => { b.setAttribute('aria-pressed', b.dataset.cmTipo === tipo); b.querySelector('i').textContent = D.wines.filter((w) => w.tipo === b.dataset.cmTipo && C.trova(w)).length; });
    const tutti = D.wines.filter(va);
    if (!tutti.includes(visto)) visto = tutti[0] || visto;
    corpo.innerHTML = tutti.length ? `<div class="cm-indice">${cols.map((c) => { const ws = c.wines.filter(va); return `<section class="cm-colonna${ws.length ? '' : ' is-vuota'}${c.id === segna ? ' is-qui' : ''}"><h3 class="cm-t">${c.name}</h3><p>${ws.length === c.wines.length ? vini(ws.length) : `${ws.length} di ${c.wines.length}`}</p><ul>${ws.map((w) => `<li><a href="${FS.wineUrl(w.id)}" data-wine="${w.id}">${C.short(w)}${doppio(w) ? `<small>${w.uve}</small>` : ''}</a></li>`).join('')}</ul></section>`; }).join('')}</div><aside class="cm-ante"></aside>`
      : `<p class="cm-vuoto" role="status">Nessun vino per «<span></span>»${tipo ? ' con questo filtro' : ''}. Si cerca per nome, vitigno, collezione, profumi e abbinamenti.</p>`;
    anteprima(visto);
    const f = corpo.querySelector('.cm-vuoto span'); if (f) f.textContent = C.frase(); /* come testo: è quello che ha scritto chi cerca */
  };

  cm.addEventListener('click', (e) => {
    const t = e.target.closest('button'); if (!t) return;
    if (t.matches('.cm-x')) return C.chiudi();
    if (t.dataset.cmTipo) { tipo = tipo === t.dataset.cmTipo ? '' : t.dataset.cmTipo; disegna(); } /* ripremuto si toglie */
  });
  const guarda = (e) => { const a = e.target.closest('.cm-indice a[data-wine]'); if (a) anteprima(FS.wine(a.dataset.wine)); };
  cm.addEventListener('pointerover', guarda); cm.addEventListener('focusin', guarda);
  cm.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target === campo) { e.stopPropagation(); corpo.querySelector('a[data-wine]')?.click(); } }); /* Invio apre il primo vino che si vede qui (js/nav.js aprirebbe il primo del suo palco) */
  document.addEventListener('fs:cantina-cerca', disegna);
  document.addEventListener('fs:cantina-aperta', (e) => {
    const d = e.detail || {}, c = cols.find((x) => x.id === d.col);
    segna = c ? c.id : ''; tipo = c ? '' : TIPI.some(([t]) => t === d.tipo) ? d.tipo : tipo;
    if (c) visto = c.wines[0]; /* aperto su una collezione: la sua colonna è segnata e a destra c'è il suo primo vino */
    disegna();
    if (matchMedia('(min-width: 1080px)').matches) requestAnimationFrame(() => campo.focus({ preventScroll: true })); /* si può scrivere subito */
  });
  disegna();
})();
