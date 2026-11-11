# Brief comune: restyling Feudi Salentini (prototipo statico)

## GIRO 2 (29 ott sera) — prevale su quanto scritto sotto dove è in conflitto
Correzioni dell'utente dopo aver visto il giro 1: "a livello di stile mi aspettavo qualcosa in più, sembra un po' AI slop".
- FONT come klimtwine.com: titoli = Fraunces sottile (equivalente gratuito di Canela Thin), testi = Instrument Sans (equivalente di ABC Monument Grotesk). Token già in base.css (`--font-display`, `--font`, `--title-weight` 200, `--title-track`). Niente altri font.
- ANIMAZIONI come klimtwine.com (ORA si possono prendere, l'ha chiesto lui): titoli che entrano lettera per lettera salendo da una maschera (sfasati, leggermente sfocati all'inizio), paragrafi che si "accendono" parola per parola allo scroll (da grigio a pieno), la BOTTIGLIA protagonista che si muove e ruota tra le sezioni, fondo che cambia colore secondo il vino/collezione. Restano vietati: copiare i loro testi, il tronco di vite, la versata nel calice identica.
- BOTTIGLIE: si usano (le bottiglie vere scontornate in assets/bottles).
- PAGINE SEPARATE invece di una home lunghissima.
- INTERATTIVO come pasqua.it, e la CHIMICA ALLA FINE della home, con le molecole interattive in stile https://5y6dqc.csb.app/ (sfere lucide che si attraggono al centro e il cursore le spinge via con la fisica).
- Riferimento tecnico three.js: `tools/threejs-skills/skills/*/SKILL.md` (scritti per three moderno a moduli). Per le sezioni 3D nuove si può usare three moderno come modulo: `<script type="module">` con `import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js'` e addons da `https://cdn.jsdelivr.net/npm/three@0.169.0/examples/jsm/...`. Non mescolare due three nella stessa pagina (come-nasce usa r128: va su una pagina sua).
- Mappa delle pagine (agente PAGINE): `index.html` home = ingresso dal portone → hero (macerazione) → #bottiglie (viaggio della bottiglia per collezioni, agente BOTTIGLIE) → un passaggio verso esperienze/territorio → #molecole (chimica interattiva, agente MOLECOLE, IN FONDO) → footer. `vini.html` = collezioni + "Cosa c'è a tavola?". `come-nasce.html` = #nasce. `azienda.html` = #terra. `esperienze.html` = #esperienze. `premi.html` = premi e notizie. `vino.html` = scheda.


Cantina del Salento (Leporano, TA), famiglia Varvaglione. Sito attuale: https://feudisalentini.com (WordPress vecchio).
Questo è un **prototipo statico HTML/CSS/JS** del restyling, come fatto per Intessuto (intessutoitalia-v2): GSAP + ScrollTrigger + Lenis, nessun framework.

## L'idea: il Salento si assaggia
Il cliente ha chiesto priorità all'**esperienza di navigazione** e qualcosa di **sensoriale** e **inventato**, non copiato
(precedente che gli è piaciuto: su Intessuto il carrello mostra ogni tessuto che si srotola su un metro da sarta lungo quanto i metri ordinati).
Qui la stessa logica: ogni interazione usa i gesti e i sensi del vino.
- Il **colore vero di ogni vino** (`color` in data.js) è il filo della navigazione: si usa pieno, come colore di prodotto.
- Il **calice visto dall'alto** (un cerchio di vino) è il motivo che torna: superficie del vino, bicchieri sulla tavola, colore nella scheda.
- Gesti: toccare il vino (onde), ruotare il calice (aromi), guardare in controluce (colore), apparecchiare la tavola (quantità).
- Un riferimento esterno (klimtwine.com) è stato guardato solo come livello di qualità: **non copiarne layout né effetti** (bottiglia 3D che viaggia, versata nel calice, pillola "Our Wines" in basso, galleria a gradini: vietati).

## Direzione artistica: ASTRATTA (richiesta dell'utente arrivata dopo il via, vale per tutti)
Il linguaggio visivo deve essere **astratto e artistico**, non illustrativo. Il vino è un **pigmento**: si dipinge con il vino.
- Il motivo del calice resta, ma non come oggetto disegnato: diventa **l'anello e la macchia che il calice lascia sulla carta**, campi di colore, forme organiche, velature che si sovrappongono come acquerello o inchiostro, bordo che si asciuga più scuro, granulazione del pigmento, colature, segni di pennello. Pensa a pittura astratta (campi di colore alla Rothko, macchie, cerchi alla Kandinsky), non a icone.
- VIETATO il letterale: niente piatti disegnati, posate, tovaglie, bicchieri in prospettiva, sassolini realistici, tavoli di legno. Gli stessi significati (piatto, coperto, calice, terra rossa) vanno detti con forme astratte: un cerchio, una macchia, un anello, una stratificazione di pigmento.
- Le forme sono generate dal codice (canvas 2D, SVG con filtri feTurbulence/feDisplacementMap, WebGL) e ogni gesto dell'utente le muove o le dipinge: il gesto sensoriale resta, cambia la resa.
- Confine: l'opera astratta è la scena; l'interfaccia (testi, bottoni, filtri, prezzi) resta piena, leggibile e ordinata sopra o accanto. La velatura trasparente è ammessa solo DENTRO la pittura, mai sui componenti UI.

## Il vino prima della bottiglia (seconda richiesta dell'utente, vale per tutti)
"Qualcosa non legato all'estetica della bottiglia ma al vino, alla chimica, a come è fatto; poi mostriamo le bottiglie."
- La pittura astratta nasce dalla **chimica vera del vino**: il colore viene dalle bucce (antociani) e non dal succo, la fermentazione trasforma gli zuccheri in alcol e anidride carbonica (C₆H₁₂O₆ → 2 C₂H₅OH + 2 CO₂), l'appassimento fa evaporare l'acqua e concentra gli zuccheri, nel legno l'ossigeno passa piano e il colore evolve da violaceo a rubino a granato (gli antociani si legano ai tannini), il ferro del suolo fa rossa la terra.
- Solo conoscenza enologica generale e corretta, più i fatti veri dei vini Feudi in data.js (barrique americane, tonneau francesi, botti grandi, temperatura controllata, appassimento circa 20 giorni, appassimento su pianta di Philia, alberello, terreno ricco di ferro). Mai numeri inventati sull'azienda.
- Le bottiglie arrivano DOPO: in hero e in #nasce niente bottiglie.

## Ingresso dal portone (terza idea dell'utente)
Il marchio Feudi è una torre con corona e un PORTONE al centro: alla prima apertura della home si entra nel sito attraversando il portone (agente INGRESSO, file `sections/ingresso.html`, `css/ingresso.css`, `js/ingresso.js`). Quando l'ingresso è attivo `<html>` ha la classe `ingresso-attivo`; alla fine parte `document.dispatchEvent(new Event('fs:ingresso-fine'))` e la classe viene tolta. Chi ha animazioni d'apertura in hero le fa partire a quell'evento se la classe c'è, altrimenti subito.

## Cartella
`C:\Users\Utente\Downloads\feudisalentini-restyling\`
- `index.template.html`, `vino.template.html`: pagine con `<!-- @include sections/x.html -->`. **Non toccarli** (salvo l'agente della scheda vino per vino.template.html, solo se serve).
- `python -I build.py` rigenera `index.html` e `vino.html`. Lancialo dopo ogni modifica a `sections/*.html`. Mai modificare index.html/vino.html a mano.
- `css/base.css`, `js/main.js`, `js/data.js`: base comune. **Solo lettura** (se ti serve un token nuovo, mettilo nel tuo CSS sotto il selettore della tua sezione e segnalalo nel resoconto).
- Ogni agente ha i **suoi** file (vedi il suo compito). Non modificare file di altri agenti: ci lavorano in parallelo.
- Asset: `assets/bottles/*.webp` (28 bottiglie scontornate, tutte 653×1024, bottiglia dentro x≈205-450, y≈74-950: stessa scala per tutte), `assets/photo/*.webp` (foto vere del cliente: uva, mare-salento, pajara, torre-mare, picnic-calici, vigna-passeggiata, masseria-vigne, alberello, barriques, vigneto-drone, papaveri, vigna-tramonto, muretto-secco, masseria-cortile, ulivo-trulli, prowein-2026, james-suckling), `assets/premi/*.png` (loghi concorsi su fondo bianco), `assets/logo/feudi-logo.png` (oro, usalo con la classe `.logo` che lo colora con currentColor).

## Dati (js/data.js → `FS.data`)
`wines` (28, con id, name, collection, denom, tipo rosso/rosato/bianco/dolce, uve, desc, vista, aromi[], abb, foods[], alcool, resa, zona, bottle, url vecchia scheda, color, check), `collections` (5), `foods` (10 piatti), `experiences` (3, con prezzi veri), `awards`, `news`, `company`.
Helper in `window.FS`: `FS.wine(id)`, `FS.wineUrl(id)` → `vino.html?id=…`, `FS.collection(id)`, `FS.lenis`, `FS.reduce` (reduced motion), `FS.touch`, `FS.isMobile()`, `FS.scrollTo(el)`, `FS.euro(n)`.
**Ogni link a un vino**: `<a href="vino.html?id=ID" data-wine="ID">` (l'agente della navigazione intercetta `a[data-wine]` per la transizione col colore del vino).
Campo `check`: incongruenza sul sito del cliente → mostrala nel prototipo con `<span class="tbd">da confermare</span>` o simile, mai nasconderla.

## Identità (token in css/base.css, usali sempre)
- Fondi: `--cream` chiaro, `--stone` chiaro secondario, `--night` scuro. Sezioni: `.sec` (chiara) / `.sec.sec--dark` / `.sec.sec--stone`, contenuto in `.wrap` (max 1440).
- Testo: `--ink`, `--ink-2` paragrafi, `--mute` secondario; su scuro `--paper`, `--paper-2`.
- **Un solo accento**: oro del logo `--gold` (riempimenti, testo su scuro) e `--gold-ink` (testo oro su chiaro). Altri colori solo i colori dei vini.
- **Un solo font**: Newsreader (variabile, opsz). Titoli `.t-hero/.t-h2/.t-h3`: un solo peso 300, tracking stretto. Testo minimo 16px, paragrafi 18px.
- **Un solo radius**: `--r` (8px). Bottoni `.btn.btn--gold` (primaria piena) e `.btn.btn--line` (secondaria), alti 52px, testo su una riga.
- Ordine della home e fondi (alternanza obbligatoria, AGGIORNATO): header fisso → `#hero` CHIARO (macerazione) → `#nasce` scuro (come nasce il vino) → `#collezioni` chiaro (qui compaiono le bottiglie) → `#tavola` scuro → `#terra` chiaro → `#esperienze` scuro → `#premi` chiaro → footer scuro.

## Gusto dell'utente (obbligatorio). Leggi PRIMA:
`C:\Users\Utente\.claude\skills\critica-ui\SKILL.md` e `C:\Users\Utente\.claude\skills\critica-ui\references\da-fare-e-da-non-fare.md`.
In sintesi:
- Si deve leggere: paragrafi scuri, mai testo sopra foto/gradienti senza contrasto, controlla hover e stati.
- **Mai tinte semitrasparenti colorate** su blocchi, badge, bottoni (`rgba(colore,.1)`): fondi pieni. Vetro neutro solo su elementi flottanti.
- Niente icone decorative, niente emoji, niente eyebrow maiuscole sopra ogni titolo (massimo 3 in tutta la pagina), niente pallini decorativi.
- Contenuto vero: dati di data.js; se manca, segnaposto dichiarato. **Mai numeri o affermazioni inventate.** Testi semplici, concreti, senza trattini lunghi (—), senza frasi "da AI" o evocative vuote.
- Le informazioni chiave sono visibili a riposo; hover e gesti aggiungono, non rivelano l'essenziale.
- CTA piena, verbo concreto ("Prenota la degustazione", "Apri la scheda"), mai "Scopri di più".
- Griglie senza buchi, card di pari altezza, stesse misure e allineamenti.
- Titoli animati **entrano** (all'ingresso nel viewport), non sono già lì.
- Motion d'interazione sobrio e di qualità (livello awwwards), non decorazione. Mai cursore personalizzato.
- **Mobile è metà del lavoro**: 390px, niente scroll orizzontale, effetti pesanti sostituiti da versioni leggere (non spenti nel vuoto), tocco = mouse.
- `prefers-reduced-motion`: contenuto completo e statico.

## Regole tecniche
- Script classico (niente moduli), IIFE, eseguito al caricamento (defer): DOM già pronto. Prefissa classi e id con il nome della tua sezione.
- ScrollTrigger: crea i trigger subito, in modo sincrono; pin solo con `gsap.matchMedia` se diversi tra desktop e mobile; dopo un pin rimosso `ScrollTrigger.refresh()`. Media lazy dentro o sopra sezioni agganciate: misure fisse (aspect-ratio + width) così le altezze non cambiano dopo il load. Pin + animazioni sullo stesso elemento in UN solo ScrollTrigger. Mai `ScrollTrigger.sort()` al primo caricamento. Sezioni agganciate alte `100lvh`, non `100svh`.
- WebGL: canvas nativo o three r128 da `https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js` (caricalo nel tuo partial solo se serve). Ferma il rendering quando la sezione è fuori schermo (IntersectionObserver). Qualità adattiva su mobile.
- Niente librerie oltre GSAP/ScrollTrigger/Lenis (già caricate) e three r128.

## Prova (obbligatoria prima di consegnare)
Server già acceso: `http://127.0.0.1:5510/index.html` e `http://127.0.0.1:5510/vino.html?id=sassirossi`.
Il browser MCP chrome-devtools NON è disponibile (occupato). Usa lo script CDP:
`node tools/cdp.mjs <url> tools/shots/<tuonome>-<prova> <w> <h> <steps.json>` (istruzioni nella prima riga del file; `wheel` fa scorrere con la rotella così Lenis si muove; `js` restituisce valori; gli screenshot sono JPEG da aprire con Read).
Metti steps.json e screenshot in `tools/shots/` con il tuo prefisso. Prova a 1440×900 e 390×844 (con `TOUCH=1`). Controlla: errori in console, scroll orizzontale (`document.documentElement.scrollWidth > innerWidth`), testo leggibile, bottoni su una riga. Guarda davvero gli screenshot.

## Resoconto finale (breve, in italiano)
Cosa hai costruito e il gesto sensoriale; quali file; cosa è segnaposto o da confermare; cosa NON hai verificato; eventuali token o richieste per gli altri agenti.
