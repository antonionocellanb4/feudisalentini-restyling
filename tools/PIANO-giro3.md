# Giro 3: home disegnata a mano (piano, 29 ott 2026, da riprendere)

Richiesta: "piano piano iniziamo dalla home", come klimtwine.com/en, interattiva e artistica nello stile della campagna Prada "Animated by hand" (disegno a mano, una fiaba disegnata), esperienziale come il metro di Intessuto. Niente più bottiglie che girano.
L'utente ha scelto: **fare le prime due idee, due pagine separate, poi decide lui**. Si fa solo la hero, non i capitoli dei vini.

Stato (30 ott 2026): FATTE le due prove, da far giudicare all'utente.
- A: `disegna.html` (sections/disegna.html, css/disegna.css, js/disegna.js). Provata 1440 e 390: cerchio → Appassimento/Re Sale, zigzag → 125 Negroamaro.
- B: `fiaba.html` (sections/fiaba.html, css/fiaba.css, js/fiaba.js). Mondo largo 10600; sul telefono la camera va dalla torre alla tavola e i testi stanno fermi in alto.
- Comune: js/matita.js; .carta e il titolo [data-righe] in base.css; FS.righe e FS.dopoIngresso in main.js; nav.js accetta {col} in fs:open-cantina; tools/cdp.mjs ha il passo `drag`.
- index.html = HOME (30 ott, dopo "usale entrambe"): fiaba → disegna → sections/home-sotto.html (esperienze, cantina, premi, news; css/home.css, js/home.js) → footer.
- Fiaba in verticale a pannelli: provata e SCARTATA dall'utente (30 ott), codice tolto. Resta l'orizzontale.
- Fine del cammino (30 ott, "mi aspetto qualcosa di diverso quando passa al verticale"): LA DISCESA. Ultimo tratto del pin: la camera scende sotto la tavola (camY = u²/2DV, finisce alla velocità dello scroll, niente scatto quando il pin si stacca), terra rossa + roccia calcarea + radici della vite che crescono col fronte; la radice più lunga arriva dritta sopra il centro del foglio di disegna, dove js/disegna.js la continua (il "filo") fino al cerchio "rotondo".
- Header: tutta larghezza; senza fondo solo durante il cammino (fiaba.js toglie [data-nav-trasparente] appena si scende). Voci Esperienze/Azienda/Premi/Contatti → ancore della home.
- Cache: l'utente vedeva il CSS vecchio. build.py mette ?v=<hash> a css/js; server locale = `python -I tools/serve.py` (Cache-Control: no-store).
- 30 ott sera, dopo lo studio di klimtwine dal vivo ("le stesse animazioni tra una sezione e l'altra, e la parte fotografica"; "la grana non la metterei"):
  - grana della carta TOLTA (.carta = crema pieno; la grana della matita nei tratti resta);
  - passaggio tra le sezioni (fine di home.js): disegna → cantina → premi → news → esperienze → footer; quella che finisce si ferma (pin senza spazio) e si vela (--velo, .copre::after), la nuova sale sopra come carta che si allarga (clip-path inset 5% → 0);
  - cantina = sequenza fotografica: foto dentro il titolo che cresce, galleria in diagonale con nota + freccia a matita, vigna al tramonto a tutto schermo col testo (sezione 560vh, palco sticky; reduced motion = solo scena finale);
  - esperienze spostate in fondo, prima del footer ("dopo la storia aziendale");
  - pillola delle tappe come la "Our Wines" di klimtwine (scelta dall'utente): tappa corrente con le bottiglie in miniatura, 01/05, freccia che apre l'elenco;
  - fiaba su desktop più bassa di 80 unità (oy in fiaba.js);
  - ogni sezione della catena alta almeno uno schermo (.strato min-height 100vh): con una più bassa, ai lati della carta che sale si vedeva quella di due passi prima; cerchi dei premi ora finiscono tutti;
  - BOTTIGLIA AL CENTRO (fiaba.js, "vedi tu cosa riesci a darmi"): clic su una bottiglia → velo, la bottiglia scivola al centro (dopo "il salto non mi piace, troppi disegni": niente rotazioni, solo macchia del suo colore + ombra), scheda a sinistra (telefono: in basso); Esc / Chiudi / clic sul velo la riportano al posto;
  - (tardi) "la sovrapposizione delle sezioni non mi piace ovunque, dopo Leporano sul mar Ionio inventati altro" → sovrapposizione SOLO disegna → cantina; dopo la cantina scorrimento normale con fondo che cambia colore (body, sezioni .tinta trasparenti) e blocchi "dallo schizzo alla foto" (cornice a matita che RESTA, la foto si sviluppa dal basso, poi i testi; premi: prima il cerchio poi il logo);
  - pulsanti a pillola come Klimt (scelta sua), freccia ↗ su quelli che escono dal sito; contatori + / − tondi;
  - bug "disegno e non escono più le info a sinistra": ridisegnando mentre la scheda compariva, il .from() interrotto lasciava i testi trasparenti → .fromTo();
  - FOOTER rifatto come quello di klimtwine (chiaro, alto uno schermo, logo + newsletter, collezioni / cantina / contatti, legali); tolto il blocco scuro "Vieni a trovarci".
- Non verificato: peso su telefono vero, Safari. I link dell'header e "Apri la scheda" puntano a pagine archiviate.

## Cosa ha klimtwine (studiato il 29 ott)
- preloader: calice che si riempie + percentuale + "Passion and culture loading...";
- hero: frase grande centrata, con la bottiglia che vola sopra il testo;
- un capitolo pinned a schermo intero per vino: nome gigante (serif sottile) in alto a sinistra con numero "01", tipo a sinistra, note a sinistra, bottiglia ferma al centro, annata + descrizione + "Technical sheet / Food pairing" a destra, fondo nella tinta del vino con ombre di luce;
- pillola fissa in basso "Our Wines" con la miniatura della bottiglia e il menu a tendina;
- poi il carosello "Austria: Land of Art and Wine" e "Where to Buy".
- Screenshot nella scratchpad della sessione: non ci sono più, rifarli con tools/cdp.mjs se servono.

## File da creare (stesso metodo: template + build.py)
- `js/matita.js`: motore di disegno comune, canvas 2D, script classico, `window.Matita`.
- `disegna.template.html` + `sections/disegna.html` + `css/disegna.css` + `js/disegna.js` (idea A).
- `fiaba.template.html` + `sections/fiaba.html` + `css/fiaba.css` + `js/fiaba.js` (idea B).
- Entrambe le pagine: `_head` + header (mega menu) + ingresso (con lo script inline del head, come in index.template.html) + `_scripts` + `js/ingresso.js` come modulo, con l'importmap di three.
- Link da dare: `http://127.0.0.1:5510/disegna.html?ingresso=0` e `fiaba.html?ingresso=0`. Il server si avvia con `python -m http.server 5510` nella cartella.

## Motore matita.js (lo stile Prada)
- **Linee che tremano (boil):** ogni punto spostato da un rumore liscio lungo la linea (ampiezza 1–1,5px, bassa frequenza). Il seme cambia a 10 fps, quindi il disegno "trema" come l'animazione a mano. Con reduced motion il seme è fisso.
- **Grana della matita:** strokeStyle = CanvasPattern di rumore (pixel del colore con alpha casuale 0,35–1), uno per colore, in cache. Secondo passaggio più sottile e chiaro con un altro seme, per il tratto "doppio" da schizzo. Chiusure dei cerchi a ~1,08 giri: la sovrapposizione tipica del disegno a mano.
- **Pressione:** tratto diviso in 3 pezzi (inizio sottile, centro pieno, fine sottile), non segmento per segmento, per il costo.
- **Disegno progressivo:** `progress` 0..1 per tratto, misurato sulla lunghezza.
- **Acquerello:** poligono chiuso riempito 3–4 volte con alpha bassa e rumore diverso sul bordo, bordo leggermente più scuro, grana. Si espande da un punto ("bleed") dentro un cerchio a bordo irregolare che cresce. Si usa `multiply` tra acquerelli.
- **Tratteggio:** linee parallele corte ritagliate dentro una forma.
- **Cache:** Path2D per (tratto, fotogramma del boil) quando il tratto è completo. Si ridisegna solo se cambia il fotogramma del boil o se qualcosa si anima. Si ferma fuori schermo con IntersectionObserver. DPR al massimo 2.
- **Carta:** texture di rumore generata una volta come sfondo CSS (crema --cream).

## Idea A: "Disegna il tuo vino" (disegna.html)
Concetto: in bocca un vino si descrive con forme (rotondo, teso, ampio, lungo). Chi visita disegna la forma che gli piace e una mano d'illustratore la ripassa trasformandola nel vino più vicino tra i 28. È lo strumento che porta al prodotto, come il metro di Intessuto.

Hero 100svh su carta:
- **Desktop:** a sinistra titolo "Ogni vino ha una forma." (entra con l'animazione, principio 15) e un paragrafo: "Rotondo, teso, ampio, lungo: così si descrive un vino in bocca. Disegna quello che ti piace, ti diciamo quale dei nostri vini gli somiglia." A destra c'è l'area di disegno.
- **A riposo:** una mano invisibile disegna e cancella una linea d'esempio, a ciclo, con l'etichetta "Disegna qui". Sotto, i bottoni "Rotondo / Teso / Ampio / Leggero" per chi non disegna (servono anche per tastiera e telefono): la mano disegna la forma scelta.
- **Telefono:** l'area di disegno sta sotto il testo, alta circa 55svh, con `touch-action:none` solo lì, così il resto della pagina scorre.

Analisi del tratto: ricampionare a 128 punti; misurare bbox, lunghezza, svolta totale, angoli > 0,9 rad (spigoli) e zigzag.
- rotondo = svolta liscia senza spigoli (cerchi, anelli);
- teso = spigoli, zigzag o linea dritta aperta;
- ampio = altezza / altezza dell'area (piccolo = leggero);
- lungo = larghezza / larghezza dell'area.

Vettore dei vini, ricavato dai dati veri (data.js NON ha corpo né acidità: dirlo all'utente):
- aromi "rotondi": confettura*, prugna*, more mature, mora, amarena, vaniglia, cacao, cioccolato, caramello, frutta secca, frutti rossi maturi;
- aromi "tesi": pepe nero, spezie, cannella, tabacco, liquirizia, balsamiche, erbacea, melograno, agrumi, ribes, lampone, appena raccolta, fiori, mandorla;
- rotondo = rotondi / (rotondi + tesi), con +0,15 per il dolce e +0,1 da 14,5% in su; teso = il contrario, con +0,15 per bianchi e rosati;
- ampio = (alcool − 11,5) / 4;
- lungo = luxury 0,9; altrimenti alcool + 0,3 se nella desc c'è barrique, affinato o legno;
- si sceglie il più vicino; tra i 3 più vicini si varia, per non ripetere lo stesso vino di seguito;
- etichette mostrate: "Rotonda / Tesa", "Ampia / Leggera", "Lunga / Corta".

Sequenza del risultato, circa 3 secondi:
1. il tratto dell'utente si trasforma nella "forma del vino": ellisse con rx da lungo e ry da ampio, spigoli in base a teso, piccole onde se ci sono spezie; il colore passa dalla grafite al colore del vino;
2. l'acquerello del colore del vino si espande e compare il tratteggio;
3. la matita disegna il contorno della bottiglia, ricavato dall'alfa della webp (bordo sinistro e destro di ogni riga);
4. la foto vera entra dentro il contorno;
5. gli aromi si disegnano uno a uno attorno alla bottiglia, con l'etichetta in HTML;
6. a sinistra compaiono: "Il tuo disegno somiglia a", il nome, la denominazione, le etichette della forma, gli abbinamenti e i bottoni "Apri la scheda" (oro, `vino.html?id=` + data-wine) e "Disegna di nuovo".
- **Cala** non ha aromi sul sito: mostrarlo come dato mancante (.tbd).
- vino.html è archiviato, quindi il link per ora non funziona.

Disegni degli aromi (box 100×100, acquerello nel colore naturale):

| Disegno | Aromi che lo usano |
|---|---|
| ciliegie | ciliegia, amarena, confettura di ciliegia |
| prugna | prugna |
| more | more, mora, frutti di bosco, mirtilli, ribes, piccoli frutti rossi, lampone |
| fragola | frutta rossa* |
| barattolo di confettura | confettura, confetture di frutta |
| melograno | melograno |
| bastoncini di liquirizia | liquirizia |
| cannella | cannella, spezie |
| foglia di tabacco | tabacco |
| grani di pepe | pepe nero |
| rametto | erbacea, balsamiche |
| fiore a 5 petali | fiori, fiori bianchi |
| baccello di cacao | cacao, cioccolato |
| baccelli di vaniglia | vaniglia |
| caramella incartata | caramello |
| mandorle | mandorla, frutta secca |
| fetta di agrume | agrumi |
| mela | frutta |

## Idea B: "La fiaba del feudo" (fiaba.html)
Una giornata nel feudo, disegnata a matita e acquerello: passeggiata orizzontale (pin + scrub GSAP) su un panorama largo circa 5 schermi, con parallasse su 4 piani (cielo e mare, colline, piano medio, primo piano). Il sole attraversa il cielo e il cielo diventa tramonto alla fine. Gli elementi si disegnano quando entrano da destra (dal bordo al 70% dello schermo), poi l'acquerello. Tornando indietro restano disegnati.

Tappe, ognuna con un capitolo HTML che si muove col mondo (numero, nome della collezione in Fraunces, una riga di fatti, "Vedi la collezione", che apre il mega menu), e le bottiglie vere ferme dentro il disegno, col nome in hover e in focus:
1. **La torre del logo, con la corona** → Collezione 53 (Luxury). È la continuazione dell'ingresso: si arriva dal portone. Il portone si apre in hover o al click.
2. **Alberelli di Primitivo su terra rossa,** con muretto a secco e pajara → Terra.
3. **Campo con papaveri, ulivo secolare e api** → 125 Organic.
4. **Il mare di Leporano,** con onde, Torre Saturo, barca e scogli → Classica (era "territorio-collezione"): Cala, Tre Cuori, Claria.
5. **Tavola al tramonto,** con le bottiglie vere sul tavolo disegnato → 125 Uno Due Cinque (Lounge Bar).
- Alla fine: "Prenota una degustazione" / "Tutti i vini".

Interazioni:
- il cursore (o il dito) fa vento: viti, erba e fiori vicini si piegano in base alla velocità, a molla;
- gli uccelli volano via quando il cursore si avvicina;
- le api fanno giri;
- il portone si apre.
- Il disegno di prova del giro 2 (`_archivio-giro2/js/disegno.js`) ha già colline, torre costiera, ulivo, alberello e muretto procedurali in SVG: riusare le idee, non il codice SVG.

Telefono: scala = vh/1100, scorrimento verticale circa 0,6 del percorso orizzontale. Niente secondo passaggio della matita se è lento.

## Testi
Mai scritti "da AI": niente frasi evocative, niente trattini lunghi, niente provenienze o anni non verificati. Il 1921 dei Varvaglione NON è verificato. Fatti sicuri: Leporano (TA), sul mar Ionio a sud di Taranto, la famiglia Varvaglione, le 5 collezioni e i dati di data.js.

## Verifica prima di consegnare
- `node tools/cdp.mjs` a 1440×900 e 390×844 (TOUCH=1): disegnare un tratto con move e click non basta, servono mousePressed, move e mouseReleased; aggiungere un passo `drag` a cdp.mjs se serve.
- Zero errori in console, nessuno scroll orizzontale su telefono.

## Ingresso a matita (30 ott sera)
"Il 3D d'inizio nel quale si entra lo farei sempre a stile disegno" → js/ingresso.js ora è a matita (classico, dopo matita.js): il marchio vero
(feudi-marchio.svg) ridisegnato, già completo; battenti di legno che si aprono sulla luce, la camera entra nel portone e dal vano si vede la
pagina (la fiaba comincia dalla torre). Prova: index.html?ingresso=1. Il three.js è in tools/ingresso-3d.backup.* (non più collegato).

- Poi: "entriamo noi, non la porta che si avvicina" → a matita corridoio in prospettiva (facciata a profondità 1, fondo a 1,32: corto dopo "troppo lungo"),
  3D: occhi all'altezza del vano, obiettivo che si allarga, passo leggero, luce calda dentro. Il 3D NON è in uso (deciso 30 ott) ma è tenuto in moderna.html, parte solo con moderna.html?ingresso=3d
  (js/ingresso-3d.js, css/ingresso-3d.css, sections/ingresso-3d.html; chiave fs-ingresso-3d). Trappola: lookAt con z davanti alla camera
  durante la vista di tre quarti = la camera guarda di lato e si vede la pagina.
- Informazioni della fiaba: SCELTA la c (biglietto di carta con l'elenco dei vini), ora di default; la versione di prima resta con ?info=0, le prove a/b con ?info=a|b.
- Battenti dell'ingresso a matita: girano sui cardini verso l'interno in prospettiva (prima si restringevano come porte scorrevoli); negli ultimi passi il foglio sfuma (prima restavano due barre).
- Glitch entrando nel corridoio (30 ott notte), corretto: la facciata era il canvas ingrandito fino a 30x (tratti a fascia, acqua che tremava di decine di px) → ora punti proiettati uno a uno; i punti fuori schermo erano tagliati per x e y a parte (spigoli piegati) → ora accorciati lungo il raggio dal punto di fuga; i battenti sparivano di colpo con la facciata e prima erano profondi 0,2 (coprivano mezzo schermo) → BATT 0,1 e restano finché non li si supera.
- Revisione telefono (30 ott notte): biglietto di carta della fiaba anche sul telefono, COME DESKTOP (dopo "non stai capendo": non fermo in alto ma nel disegno accanto alle bottiglie, con l'elenco dei vini; l'ultimo, 125, prima delle bottiglie perché la camera del telefono si ferma sulla tavola: classe is-sx); apertura e saluto finale restano testi fermi in alto;
  pillola delle tappe width max-content (da left 50% si stringeva e "125 Uno Due Cinque" toccava 05/05); disegna alta 100svh col foglio che prende
  il resto e i 4 bottoni su una riga (prima 972px: il pin partiva col titolo già sotto l'header); col risultato la sezione cresce, il foglio resta
  alto uguale e disegna.js rimisura il pin (rimisura/cima) senza salti; cantina: sul telefono ogni foto si ferma al centro per il 60% del suo tratto
  (L.sosta), prima la nota con la freccia passava in un attimo. Desktop invariato.
- Revisione telefono 2 (2 nov, dagli screenshot iPhone 393x696): nessun testo sopra il disegno. Primo schermo come pagina di libro: titolo nel cielo, torre, testo sulla terra sotto la torre.
  Saluto finale tutto nel cielo: pergola più bassa (top 390), bottoni su una riga, compare solo a prog > 0.995 (biglietto 125 già uscito). Camera finale su x 9200 = tre bottiglie al centro; sole che tramonta tra due bottiglie.
  Ancore della pillola: centro del gruppo di bottiglie al centro dello schermo, anche su desktop (prima Terra portava a x 2400, senza bottiglie). Bottiglie a destra non più sbiadite (html rivelato prima sul telefono).
  Scheda vino: bottiglia intera tra header e scheda (altezza calcolata dalla scheda in zScena), velo pieno, due bottoni su una riga, focus sul dialogo (anello attorno a Chiudi su iPhone). Risultato di Disegna compattato di 100px; Aromi e A tavola a 15px.
  Fiaba alta tutto lo schermo: .fb-pin 100lvh (con 100svh sotto le barre di Safari spuntava la sezione dopo), ma disegno e pillola impaginati su 100svh (.fb-alto misura, Y0 = dove finisce il prato), scheda vino 100dvh. In Chrome svh = lvh: per provarlo forzare .fb-alto a 696px su finestra 800.
- Salto della fiaba a fine ingresso: con lenis fermo (overflow hidden) sparisce la barra di scorrimento, alla fine torna e la pagina passa da 1440 a 1425 → canvas della fiaba ridimensionato. Fix: html { scrollbar-gutter: stable } in base.css. In headless si vede solo con SCROLLBARS=1 node tools/cdp.mjs ...

## Prova E "La giornata" (2 nov): `moderna-e.html`
Tre passaggi: libro a due colonne con foto a lamelle ("l'effetto mi piace ma volevo come la fiaba") -> passeggiata con foto ("mi piace ma vorrei cose che si muovono come un disegno, togliendo le immagini; il disegno però deve essere elegante") -> ORA: stessa passeggiata della fiaba (una giornata al feudo, alba-tramonto, 5 tappe = 5 collezioni) con disegno a LINEA SOTTILE da incisione, precisa, inchiostro su crema, oro come unico accento: lo stile viene dall'oro sulle etichette di Collezione 53. Niente matita, niente acquerello, niente foto nella passeggiata.
Tutto su canvas (js/moderna-e.js), in unità: 620 = dall'header al ripiano. Ogni gruppo di linee si traccia entrando da destra e poi vive: viti, papaveri, olivi e cipressi al vento (del cursore e del camminare), onde a linee che scorrono, barca che dondola, api, uccelli, raggi del sole, lampadine, nuvole che passano.
Bottiglie e testi sul ripiano crema, arrivano da destra a velocità diverse. Si scorre o si trascina; pillola che centra le bottiglie; bottiglia al centro con la scheda; didascalie coi nomi dei posti (solo desktop). Sotto: "Cosa c'è in tavola?", cantina, premi, news, visite, con le foto vere.

La prova "fiaba di carta" (la fiaba in stile D) è stata fatta e ELIMINATA il 2 nov su richiesta.

Da correggere, trovato il 2 nov: a 360px di larghezza il footer (.foot__news, bottone della newsletter) allarga TUTTE le pagine a 387px e il bottone Menu esce dallo schermo. C'era già anche nella home; non toccato.

## Prova D "Cinque porte" (2 nov): `moderna-d.html`
Chiesta come "storytelling come la fiaba ma diversa, sempre con disegno ma altro stile, interattiva, stesse bottiglie". Carta ritagliata su canvas (js/moderna-d.js, css/moderna-d.css, sections/moderna-d.html): colori pieni, ombre nette, tagli a forbice.
Si scorre in PROFONDITÀ (la fiaba è orizzontale) e si passa dentro le porte: torre del logo, corte in tufo (Collezione 53), pajara nella terra rossa (Terra), ulivo cavo tra i papaveri (125 Organic), torre costiera sul mare (Classica), pergola (125, senza porta).
Interazioni: il sole è un ritaglio con la stanghetta e la presa, si sposta e cambia la luce, che si moltiplica sui colori della carta; cammina anche con lo scorrimento, spostarlo aggiunge uno scarto ("deve essere in sincrono, che sia con la mano o no"). Niente etichetta. Rifiutati il 2 nov: sole appeso a un filo, le quattro voci Alba/Giorno/Tramonto/Notte, trascinare tutta la scena; prima porta rifatta: torre in pietra con la corona del logo e grande portale d'oro (la torre nera col portoncino non piaceva); porte: si socchiudono al passaggio del cursore, si aprono al tocco o con "Apri la porta"; bottiglie: salgono dal palco, si toccano e si apre la scheda; il cursore sposta la camera attorno al palco.
Regole tenute: testi solo sulla fascia piena del palco, mai sopra il disegno; foto dei vini non toccate dalla luce, di notte la porta resta oro e fa loro da fondo; alta 100lvh ma impaginata su 100svh (.d-alto). Sotto: cantina, premi, news, esperienze, fogli di colore col bordo tagliato.

## Home moderna (30 ott sera): `moderna.html`
TRE ALTERNATIVE ATTUALI (30 ott notte, "non mi piace quello moderno, le sezioni sotto le lasci sempre uguali, voglio varianti e alternative,
lascia stare la pop art"). Ognuna ha TUTTE le sezioni sue (hero, cantina, collezioni, esperienze, premi, news); in comune solo js/moderna-kit.js +
css/moderna-kit.css (titoli lettera per lettera, paragrafo che si accende, pillola "I nostri vini", ancore, elenco collezioni). Foto dei vini mai alterate.
- A "cinema" moderna.html (sections/moderna-a.html, css/js moderna-a): scura, Inter Tight sottile, foto vigna che si apre come uno schermo,
  pellicola di foto che scorre di lato, collezioni in elenco grande che si apre (accordion), esperienze a carte impilate sticky, premi come
  titoli di coda, news una grande + due. Tiene l'ingresso 3D spento (?ingresso=3d).
- B "luminarie" moderna-b.html: notte, Fraunces sottile; hero canvas = galleria di archi di lampadine (luminarie del Salento) che si accendono
  dal basso, palco sticky 300vh, si cammina sotto gli archi e in fondo c'è la C53 vera che si avvicina col suo nome; collezioni sotto fasci di
  luce; esperienze a schede (tab); premi = nomi grandi in fila coi loghi; news a righe.
- C "archi" moderna-c.html: chiara/tufo, Newsreader sottile; hero = corte della masseria ritagliata ad arco con la bottiglia sulla soglia,
  "Feudi" e "Salentini" ai lati, scorrendo l'arco si apre a tutto schermo; tre foto ad arco in parallasse; collezioni in nicchie; esperienze a
  righe alterne con foto ad arco; premi in due colonne; news una grande + due (niente arco sulle news: le immagini hanno testo).
Archivio: v3 pop in tools/moderna-v3-pop/ (rifiutata: foto alterate + pop), v2 in tools/moderna-v2/, v1 in tools/moderna-v1/.

### Versione 3 "pop" (archiviata in tools/moderna-v3-pop/, rifiutata)
VERSIONE 3 "POP" ATTUALE ("ci vuole qualcosa legato all'arte, nel moderno qualcosa di pop"; poi "hai mantenuto la stessa impostazione del
layout" e "le immagini dei vini non dobbiamo toccarle"). Riferimento: serie di Warhol (stessa immagine su fondi pieni diversi, i 32 barattoli)
+ punti Ben-Day di Lichtenstein. FOTO DELLE BOTTIGLIE MAI ALTERATE (una prova a serigrafia con filtro/lastra di colore è stata RIFIUTATA):
il pop sta nei fondi pieni, nella ripetizione e nel retino. Hero: titolo a sinistra, 4 tele della stessa bottiglia (C53) su 4 colori;
scorrendo (palco sticky, 220vh) si entra nell'ultima tela attraverso il retino (zoom a scala logaritmica attorno a un punto dei puntini,
la bottiglia scivola via a sinistra, i punti diventano enormi e poi lasciano il rosa pieno = fondo della cantina). Paragrafo che si accende.
Muro dei 28 vini: una tela per vino, colore per collezione (POP in js/moderna.js), nome+denominazione sotto, filtro a pillole per collezione,
tele che si stampano entrando (racla dall'alto). Esperienze, premi, news, pillola come la v2. Font come la v2 (Fraunces sottile + Instrument Sans).
Versione 2 in tools/moderna-v2/.

### Versione 2 (archiviata in tools/moderna-v2/) ("font delicato ma animazioni come klimtwine"): Fraunces sottile + Instrument Sans; una bottiglia sola fissa che viaggia
(in piedi nell'hero, inclinata a lato del paragrafo, in piedi nei capitoli, esce) calcolata da UNA funzione di scroll (i tween scrub in gara
sulla stessa opacità davano stati casuali); body che cambia colore per sezione e per vino (tinta verso il crema); 5 capitoli sticky (un vino
per collezione) con titolo che esce/entra lettera per lettera; paragrafo che si accende; "Il resto si assaggia in cantina" con bottiglia che
scende e si posa; esperienze, premi, news; pillola "I nostri vini" fissa che apre il mega menu. La versione 1 qui sotto è in tools/moderna-v1/.

### Versione 1 (archiviata)
Richiesta: "un'alternativa completamente moderna, sempre con animazioni strafighe, diversa da questa, come pagina in più".
File: moderna.template.html, sections/moderna.html, css/moderna.css, js/moderna.js, js/moderna-hero.js (three.js). Header e footer comuni.
Scura e fotografica, un solo font (Instrument Sans, stretto nei titoli), oro unico accento, colori veri dei vini come informazione.
1. hero: foto WebGL liquida (goccia + separazione RGB secondo la velocità del puntatore), "Feudi Salentini" a tutta larghezza misurato via JS, lettere che salgono;
2. manifesto: parole che si accendono scorrendo;
3. collezioni: righe giganti, col mouse le bottiglie su tessera del colore del vino seguono il cursore (telefono: miniature sempre visibili); clic → il primo vino nel catalogo;
4. i 28 vini: palco sticky, 20vh per vino, nome che scorre, bottiglia che cambia, fondo = colore del vino verso il notte (42%), elenco cliccabile a destra;
5. territorio: SALENTO in SVG come maschera sulla foto del mare, si allarga dalla T (getExtentOfChar(5)) finché la foto riempie lo schermo, poi testo + 28/5/3;
6. esperienze: tre pannelli, il primo aperto, si apre al passaggio/tab/tocco (telefono: tutti aperti in colonna);
7. premi: nastro infinito che accelera e segue la direzione dello scroll;
8. news; pulsanti calamita solo col mouse.
Trappola: GSAP somma lo spostamento del CSS (transform: translateY) a yPercent → nei fromTo mettere y: 0.
Non verificato: telefono vero (WebGL + sticky lunghi), Safari.

## Correzioni del 2 nov sera a D ed E
- **Scheda del vino unica:** js/scheda.js + sections/scheda.html (stile in css/fiaba.css), estratta dalla fiaba e usata da fiaba, index, moderna-d, moderna-e. D la bottiglia è su canvas: passa `rect` e `nascondi`. D ed E caricano anche js/matita.js per la macchia di colore.
- **D, il sole:** non è più interattivo. Disco di carta sul canvas, disegnato subito dopo il cielo e prima di tutti i fogli; cammina con lo scorrimento, per ogni tappa ha un punto dove si vede (SX, SY in unità del teatrino). Tolti stanghetta, notte, stelle, luna, finestre accese: esistevano solo col sole spostato a mano.
- **E, in tavola:** "Cosa c'è in tavola?" non è più una sezione ma la tappa 6 del cammino (prima di "Fine della giornata"): 10 piatti incisi come miniature sul ripiano, quello scelto si incide grande sul canvas, salgono tre vini veri (prima uno per collezione), "Altri vini" passa ai successivi. Abbinamenti da `foods` in js/data.js.
- **E, la notte:** dalla tappa 6 alla 7 carta, ripiano e linee passano a --night: la sezione cantina continua senza stacco. Header scuro con hero--dark.
- **E, header:** `data-nav-trasparente` sul cammino, senza fondo come la fiaba.
- **E, scorrimento:** camera lineare come la fiaba (via soste e `ss` per tappa: una tacca di rotella spostava da 0 a 350px, ora sempre 157px a 1440). Sul desktop il disegno va a ogni fotogramma.

## E, sotto il cammino: 12 alternative sulla stessa pagina, da rivedere (2 nov notte)
Richiesta: "a immagini diagonali come l'index, effetto dinamico, non statico; vale per le altre sezioni; tutte le alternative nella stessa pagina, poi quando torno le rivedo". Tolte le vecchie sezioni statiche.
File da tenere separati finché non si sceglie: sections/moderna-e-sotto.html, js/moderna-e-sotto.js, css/moderna-e-sotto.css (Cantina A usa css/home.css). Ogni blocco ha `data-prova`; il menu in alto a sinistra le elenca: a scelta fatta si tolgono le altre e il menu (ultimo blocco del js).
- Cantina: A diagonale come l'index, senza matita · B colonne di foto inclinate con testo che si accende · C foto a tutto schermo a lamelle.
- Premi: A loghi in diagonale · B nomi su due nastri, più veloci scorrendo · C medaglie col bordo inciso dei piatti.
- News: A foto in diagonale · B in orizzontale, foto che scorrono nella cornice · C righe grandi, la foto le segue a destra.
- Visite: A foto in diagonale, scheda ferma a sinistra · B colonne che si aprono scorrendo · C schede impilate, un calice inciso a persona col totale.
Con reduced motion resta l'ultima scena (segnato con shortcut nel js): da rifare solo sulle scelte.

**Scelte del 2 nov:** Cantina A, Premi A, Visite B: le altre tolte da html, js e css. Le news A/B/C vecchie (diagonale, orizzontale, righe) scartate tutte; al loro posto tre nuove, da scegliere, tutte sulla notte: A il titolo si divide e tra le due parti si apre la foto (uno schermo per notizia, altezza foto calcolata sui testi), B il mazzo di foto con la prima che vola via (usa `diagonale()` con `o.posa`), C il quaderno con copertina oro che si sfoglia (3D, sul telefono si volta verso l'alto). Foto delle news mai ritagliate a forza: ProWein è una grafica con le scritte. Il menu in alto a sinistra ora elenca solo le news: scelta quella giusta si tolgono le altre e il menu. Passeggiata di E: rami d'ulivo con il tronco (non partono più dal vuoto), trave della pergola più corta sui lati esterni. Api tolte per errore mio, in D ci sono ancora.

**News scelta (2 nov):** la A, il titolo che si apre sulla foto. Tolti mazzo, quaderno e menu: in E sotto il cammino non ci sono più alternative. Con reduced motion: cantina e news sull'ultima scena, premi e visite elenchi fermi (`.pv-dg--ferma`, `.pv-fi--ferma`). `tools/cdp.mjs` ha `REDUCE=1` per provarlo.

**Stessa sera:** E: tracciatura a tratti tolta dal cammino (sembrava un errore), resta in apertura e sul piatto scelto. Visite con più spazio sotto. Scheda senza schizzi in D ed E: `Scheda(sec, { schizzi: false })`, `.fb-zoom--pulita` in css/fiaba.css: pagina pulita con qualche disegno attorno alla bottiglia nello stile della versione, opzione `disegno` (rifiutati il blocco di colore e la scena dietro). Vite di E: foglie e grappoli sul ramo. D sotto la storia: niente colori; porte nella foto, strisce e battenti rifiutati come buggati; ora volo tra le foto e ruota dei premi (approvati), mazzo con titolo al centro. Esperienze di D: rifiutate tutte le idee con le foto; ora griglia di tre schede con scene di carta senza foto nel blocco `.d-ex` di js/moderna-d.js (stessa prospettiva della storia, un canvas per scheda), da giudicare. Scheda di D solo con la bottiglia, E tiene il disegno inciso.

Aggiornamento 2 nov 2026 (sera).
- Moderna D, esperienze: griglia di tre riquadri con la forma tagliata (d-ritaglio, voluta da lui). Disegni in js/moderna-d-scene.js, ricavati dalle foto vere (barrique e botti; cortile della masseria: muro bianco, comignoli, tetto di coppi, pini, pilastro con la sfera; filari al tramonto, cesto d'uva). Vini giusti: 2 rossi + Malvasia, 4 rossi, rosato + Malvasia + Primitivo. Ogni piano e' un canvas stampato una volta, js/moderna-d.js lo muove soltanto. La versione con curve lisce e sfumature gli e' piaciuta come disegno ma "ha tolto l'effetto carta": ora linee a colpi di forbice, colori pieni, ombre nette, luce fatta di fogli; solo il vetro dei calici e' liscio.
- Moderna E: il fondo scuro e' blu-nero #0e1728 solo in E (--night in css/moderna-e.css, BUIO in js/moderna-e.js, scrim in css/moderna-e-sotto.css). La notte non sfuma: si colora a passate dall'alto (canvas .e-ink sopra il ripiano, maschera su un fotogramma di notte), comincia a X[TV]+0.6W perche' prima partiva troppo presto dopo "Cosa c'e' in tavola". Pillola dei vini: un trigger solo, con uno per sezione lampeggiava a ogni giunta; ora in E si vede solo sul footer.

Aggiornamento 2 nov 2026 (notte).
- Moderna D, esperienze: le scene disegnate sono state scartate ("usiamo le foto, un altro modo dinamico"), js/moderna-d-scene.js tolto; le due versioni disegnate restano solo nello scratchpad della sessione. Ora: foto vere a tutto schermo tagliate in strisce diagonali di larghezza diversa (canvas in js/moderna-d.js), una foto per visita (tre per visita bocciate: "hai fatto 3 slide, non va bene, una"), al cambio di visita le strisce si sfilano a pettine lungo il taglio e il blocco dati in basso a sinistra si taglia e si ricompone con gli stessi tagli (copie DOM ritagliate, .d-ex__fetta); velocita' e cursore smuovono le strisce della foto. I dati stanno su ritagli di carta sulla foto: foglio col nome, bollo a smerli col prezzo, etichette durata e persone, linguette delle tappe a destra; la scelta tra le tre visite e' una pillola con l'oro che scorre. Prima prova con colonna di testo a sinistra: "mi piace l'effetto ma non mi fa impazzire, i valori li disporrei in maniera simpatica".
- assets/photo/picnic-calici.webp ha la filigrana Depositphotos, si legge quando e' grande: tolta da D (pic nic = vigna-tramonto), resta in js/data.js come prima foto del pic nic e la usa E. Serve l'originale dal cliente.
- Moderna E, Cosa c'e' in tavola: "Altri vini" ora scala, "3 di 13 vini" + "Altri 10 vini", ultima pagina "Ricomincia" (il numero sul bottone vale anche sul telefono, dove il conteggio e' nascosto).
- Scheda del vino in E: il disegno e' lo stesso per tutti i vini, cambia solo il colore del tratteggio (w.color). Non ha ancora avuto risposta se differenziarlo.

Aggiornamento 2 nov 2026 (notte, dopo). Esperienze di moderna-d: anche le strisce bocciate ("non mi piace piu', facciamo altro"; nell'entrata si vedevano frammenti su fondo vuoto e il testo tagliato). Ora tre alternative sulla stessa pagina, da far scegliere (js/moderna-d-ex.js, css/moderna-d-ex.css): A cartoline che si girano (francobollo = prezzo, timbro = durata, righe = tappe), B titolo enorme che continua in bianco dentro le foto (come l'effetto di Intessuto), C porte d'oro della storia che si aprono sulla foto, con la fascia dei dati. Testo mai tagliato. Con reduced motion si vede solo B. Scelta una, togliere le altre.
Stesso giro: in moderna-d porte, finestre e nicchie sono rettangoli come la porta del logo ("le hai fatte tonde, la porta del logo e' un rettangolo"; varco() in js/moderna-d.js, ghirlanda lungo stipiti e architrave). Footer: .foot ora dichiara il colore, in A e B (pagine scure) ereditava il testo chiaro. Moderna B: bottiglia in fondo agli archi piu' grande.
Moderna E, tappe della storia: "Vedi i N vini" (apriva il menu) sostituito da "Altri N vini" sul posto, stesso meccanismo di Cosa c'e' in tavola (fila() in js/moderna-e.js): Terra 7, Classica 12, 125 Uno Due Cinque 4. Collezione 53 e 125 Organic hanno gia' tutti i vini in scena: solo il conteggio. Moderna D ha ancora "Vedi i N vini".
Storia di E e D: titolo, testo e bottone allineati in basso sulla stessa linea (.e-testo e .d-cap__testo, align-items: end). In E, tappa in tavola: colonna del titolo piu' stretta e piatti piu' piccoli, perche' il bottone "Altri N vini" copriva "Dolci di mandorla".

- 2 nov, moderna-e, scheda vino: SCENE e PER in js/moderna-e.js, due disegni per collezione legati alla tappa, fissi per vino. In css/fiaba.css il fondo di testo e Chiudi arriva col velo (color-mix su --velo). Muretto di Terra appoggiato al ripiano (mur, y0 = 620).

- 3 nov, moderna-f.html "La galleria": sei quadri dipinti dalle foto dei luoghi (tools/dipingi.py, assets/quadri, FONTI.md), vivi via shader (js/moderna-f.js), scorrimento orizzontale e trascinamento, targa, piano riflettente fisso, transizione a pennellate, header a targhette; sotto le sezioni di moderna-e. Da verificare su telefono vero e la provenienza delle foto di partenza.

## moderna-g, zoom da un quadro all'altro (3 nov 2026)
Zoom infinito come lo Zoomquilt: un solo dipinto continuo a più scale. Il quadro dopo sta già, piccolissimo e nitido, dentro un dettaglio di quello prima (finestra vera del palazzo, foglia dorata, varco nel filare, foschia, cespuglio sul mare). Niente macchie sfocate, dissolvenze o buchi dal nulla. tools/dipingi_porte.py scrive <nome>-g.webp e le viste ridipinte <nome>-z1, z2, z3 (e -m); poi stampa p e z per PORTE in js/moderna-f.js, che devono coincidere. Provate e scartate: macchia che si apre, pennellate giganti che si ridipingono. moderna-f usa i quadri originali. Peso: circa 1 MB a vista sul desktop, 200 KB sul telefono, da alleggerire prima di andare online.

## prova-soggetto.html, le bottiglie soggetto del quadro (3 nov 2026)
Prova a parte, non collegata a F e G. La bottiglia entra nella scena prima di dipingere, con ombra, riflessi e colori del luogo, poi il pittore ripassa tutto; dentro il contorno resta la copia dipinta fine, così l'etichetta si legge (tools/dipingi_soggetto.py). Tre luoghi con terreno vero e punto di vista basso: torre-mare, pajara, papaveri. Nessun oggetto davanti al piede: sembrava di nuovo mangiato. Sei schermate: ingresso col feudo, Collezione 53 pajara nel modo di Van Gogh, Terra a spatola nel modo di Courbet, 125 Organic papaveri nel modo di Monet, Classica spiaggia a puntini (cielo solo blu, turchesi e viola), 125 Uno Due Cinque nel modo di Turner. Pop e cubismo provati e rifiutati: solo stili classici. Sul telefono una composizione verticale sua. Le scritte delle etichette restano quelle della foto. Foto di pajara piccola (563 px). Da decidere: se piace, quali luoghi e stili per quali sale e come restano cliccabili i vini.

## moderna-h, la storia con le bottiglie dentro i quadri (3 nov 2026)
Il cammino di moderna-f (js/moderna-f.js con body.page-mh, sections/moderna-h.html, css/moderna-h.css) con i quadri di prova-soggetto. Bottoni invisibili sulle bottiglie dipinte: se si ridipinge una scena, le posizioni di SCENE in tools/dipingi_soggetto.py vanno riportate in SALE_H. Il cartellino sta fermo e compare, sul telefono va in alto sul cielo senza descrizione. Le bottiglie sono dipinte: "Tutti i vini" apre l'elenco della collezione, non le cambia. Mappe di movimento: dipingi_soggetto.py --mappe.
Provare H sempre scorrendo piano su più schermi (1536x730, 1920x950, 1366x650, 1440x900, telefoni) e guardare le etichette al 100%: a 1440x900 entra tutto e non si vede niente. Sugli schermi larghi il quadro copre in larghezza e perde in altezza: il quadro è composto a 1,85 con bottiglie grandi (rimpicciolirle al 58% le staccava dal quadro, l'ha notato subito), si taglia ai lati, le posizioni fx e sx in SALE_H tengono le bottiglie dove c'è posto. Solo le scritte vengono dalla foto: l'etichetta intera faceva sembrare la bottiglia incollata.
Cartellino e nomi arrivano col quadro, non si deve scorrere ancora per vederli (lo ha chiesto lui): le sale di H durano 1,3 schermi invece di 2.
La fermata della pillola in H sta a 0,5 schermi dall'inizio sala (VINO): cartellino e nomi vanno via a 0,7. Se si cambia uno dei due, ricontrollare che cliccando una sala il cartellino ci sia. Provare H un Chrome alla volta: sei insieme fanno fallire il caricamento degli script sul server locale e sembra un errore della pagina.
Prova del 4 nov, chiesta da lui, in attesa del suo giudizio: in moderna-h nel passaggio i due quadri scorrono di mezzo schermo (PAN, TR in js/moderna-f.js) con bottiglie, nomi e cartellino, sotto le pennellate. Il quadro nuovo arriva a posto a 0,62 del passaggio, prima che le pennellate tocchino il bordo sinistro: altrimenti si vede il bordo specchiato. Pillola al centro, alta 40 px, sotto il logo. moderna-h.html?fermo = com'era prima. Se la boccia: togliere FERMO, PAN e pan(), riportare TR a 0,6, VINO a 0,5 e la pillola a sinistra in css/moderna-h.css.

## 4 nov 2026: H, dopo la galleria

- Pillola a 80 px (16 px sotto il logo). Sala 5 ridipinta a setole (il cielo veniva a mattoni). Maschera dei passaggi senza buchi: da destra le pennellate finite si chiudono (fillRect in pennello) e il bordo sfilaccia nello shader (pen()).
- Galleria -> cantina: dopo la sala 5 un passaggio in più (quadro 'notte', e-st 860lvh, FINE = X[N]). .ca sta sopra l'ultimo schermo della galleria (margin-top -100lvh): il suo palco resta fermo in cima e appare dietro le pennellate, niente schermo vuoto (scopri()).
- Sezioni sotto: foto VERE (dipinte provate e bocciate), fondi dipinti solo per le sezioni: notte (blu, bocciato il marrone) e crema (quasi liscio, a pennellate più forti sembrava pelliccia). Macchia a pennello dietro le bottiglie (mega menu, schede) e oro dietro i premi.
- Fra le sezioni: bocciato il separatore fisso che sale da sotto e copre i testi. Ora la sezione resta ferma (h-coda: 1,2 schermi in più in fondo) e quella dopo si dipinge sopra a passate orizzontali (canvas .h-pittore, pittore()), appare dietro un bordo a setole (bordo.webp, mai sfumature: "bagliore" bocciato). Con reduced motion o senza WebGL niente di tutto questo: sezioni una sotto l'altra.
- Pezzi dipinti: python -I tools/dipingi_soggetto.py --notte. Macchie e fondi solo in H; F, G ed E restano com'erano.
- Da fare se richiesto: i 14 vini non dipinti (4 Terra, 9 Classica, 1 Malvasia Nera), circa 6 quadri in più caricati al clic.
- A 360 px l'intestazione sborda di 27 px (Menu tagliato) su tutte le home moderne: difetto vecchio, non toccato.

## 4 nov 2026, pomeriggio: H, Altri vini e flash

- Flash nei passaggi fra le sezioni (visto solo sul suo schermo, le catture di prova non lo mostrano): la tela .h-pittore aveva premultipliedAlpha false e si sommava alla pagina anche dove è trasparente (il disco beige più il blu dava bianco, il nero del logo blu). Ora colore premoltiplicato nello shader.
- Altri vini: tre alla volta come nelle altre prove (fila). In H le bottiglie sono nel quadro, quindi ogni gruppo è un quadro: tools/dipingi_soggetto.py --altri (dizionario ALTRI, stesso seme della scena, fuori dalle bottiglie identico al quadro di partenza). Le mappe restano quelle della scena: i nuovi usano gli stessi posti. Gruppo di una bottiglia sola: al posto di quella davanti.
- Al clic ridipingi() in js/moderna-f.js: le passate solo sulla fascia delle bottiglie, 2,2 s. Se si scorre in mezzo finisce subito. Carico: solo al clic (col mouse, al passaggio sul bottone), al massimo 5.5 MB su computer e 2.9 su telefono, se si aprono tutti.
- Bottiglie chiare (CHIARE in dipingi_soggetto.py): sull'etichetta resta quasi solo la foto e il vetro torna del suo colore, altrimenti il rosato di Terra veniva giallo e senza etichetta.
- L'elenco "Tutti i vini" e .h-tutti tolti.
- Fondo del footer tagliato (visto su schermo con finestra alta circa 1000-1100 px): in fondo alla pagina il footer si fermava a una frazione di pixel dalla cima, restava "in passaggio" e la parte piena della maschera finiva prima del suo fondo. Ora conta come arrivato sotto 1,5 px e la parte piena è alta 3 volte il palco.
- Testo d'ingresso di H: fermo al centro, non scorre più con il cammino, lo coprono le pennellate del primo passaggio (maschera bordo-o.webp, stesso ritmo delle passate). Con movimento ridotto o senza WebGL resta com'era: scorre e svanisce.
- Rotella veloce nella storia di H: il cammino ha un limite di velocità (rotella in giroF): ogni passaggio dura almeno 1,4 s, in fondo alla storia la pagina aspetta. Solo con la rotella o il trackpad: un clic su pillola o menu lo toglie fino alla rotellata dopo, sul telefono non c'è. Le sezioni sotto (pittore) restano legate allo scorrimento.

## 6 nov 2026: G, prova AI sul passaggio feudo > vigne

- Crediti Comfy ricaricati dall'utente, prova fatta: 3 immagini Flux Fill a pagamento (la prima tenuta, la seconda scartata perché da illustrazione con firma, la terza per la vista media). tools/ponte_ai.py prepara le tele (tela) e rimonta i livelli (monta); tools/comfy_fill.mjs le manda a Comfy. Immagini AI e testi in tools/ponti/, i livelli di prima in tools/ponti/prima/ (per tornare indietro basta ricopiarli in assets/quadri/).
- Cosa si è imparato: senza un pezzo di quadro vero attorno l'AI dipinge da illustrazione (muro piatto, blocchi) e firma il quadro. Il muro inventato lontano dalla finestra è un mosaico di tocchi che non somiglia alla facciata: se ne tiene solo l'intorno della finestra, poi si torna al muro vero sfumando (fatta() in ponte_ai.py). Le strisce di guida e la firma della prima immagine le ha ridipinte la seconda chiamata (RIFARE).
- Tutto ripassato da tools/dipingi.py: le parti AI prendono gli stessi tocchi del quadro.
- Da giudicare: a riposo la finestra ha una cornice arancio e lilla e si nota un po' più di prima. Gli altri quattro passaggi restano quelli di tools/dipingi_porte.py finché la prova non convince.- Giudizio 6 nov: "non mi piace la chiazza, non è parte del quadro, si vede che è una cosa messa lì". Prova AI scartata, livelli di prima rimessi in assets/quadri/ (le immagini AI restano in tools/ponti/). Il limite non è la tecnica: il quadro dopo ha colori (blu pieno, terra rossa) che nel muro del palazzo non ci sono, quindi ovunque lo si nasconda a riposo è una macchia estranea. Consiglio dato: fermare lo zoom di G e non spendere altri crediti.- Stesso giorno, dopo "dal palazzo entro e vedo un albero non esiste" e "puoi farla una stanza che non esiste": G, primo passaggio rifatto con logica vera. Dalla finestra del palazzo (buia come le altre a riposo) si entra in una stanza in penombra; in fondo un arco luminoso sulla vigna, e da lì il quadro delle vigne. Il quadro dopo ora è piccolo (p 0,004 del feudo, 4 livelli z1-z4, PORTE aggiornato in js/moderna-f.js). Solo la parete di fondo con l'arco è AI (tools/ponti/feudo-4-fatta.png, 2 firme coperte col colore attorno); il resto della stanza è buio ricavato da lei (luce() in tools/ponte_ai.py), senza AI: lasciata libera di riempire spazi grandi, l'AI ha dipinto porte a vetri, sedie, persiane, quadri con cornice e firme (scarti in tools/ponti/finestra/). Il confine fra quadro e AI è il bordo della finestra, mai una cucitura. Chiamate a pagamento: 3 per la prova di prima, 6 per la stanza.
- H, schede dei vini ("fluido il passaggio tra le schede e il ritorno al dipinto, come l'apertura"): in js/scheda.js la chiusura è l'apertura al contrario (il quadro torna mentre la bottiglia vola) e con dissolvi (F, G, H) la foto sfuma nella bottiglia dipinta invece di sparire di colpo. Vini della collezione: la cantina si apre sopra la scheda, che sfuma e sparisce sotto; prima si tornava al quadro e poi scendeva la cantina. Vale per tutte le pagine con la scheda.
- Newsletter tolta dal footer comune (sections/footer.html, css/nav.css, js/nav.js): sparisce da tutte le prove.- F, G, H: nuova sezione "Cosa c'è in tavola?" sotto la storia, dopo Esperienze e prima del footer (non nella storia, sua scelta; solo in queste tre). sections/moderna-f-tavola.html, js/tavola.js, stile in fondo a css/moderna-f.css (H: css/moderna-h.css, palco fermo 300lvh e arrivo a pennellate, '#tavola' in tappeS di js/moderna-f.js). Piatti e abbinamenti veri (foods di js/data.js). La giostra (fila che si trascina, frecce, bottiglie sulle macchie) è pensata per riusarla nel carosello dei best seller: i nomi li manda lui, non ci sono dati veri (il sito non ha "più venduti").- Stesso giorno, "scegli tu dei vini prova" e "Cosa c'è in tavola lo farei meglio": sotto la storia di F, G e H ora due sezioni (sections/moderna-f-tavola.html, js/tavola.js). I più venduti: giostra infinita a tutta larghezza, la bottiglia al centro più grande col nome sotto, gira piano da sola, si ferma sotto il mouse, si trascina con l'inerzia, si piega con la velocità e accelera con lo scorrimento della pagina (lenis). Vini SCELTI PER PROVA (VENDUTI in js/tavola.js), da sostituire con quelli veri. Cosa c'è in tavola? rifatta: carta dei piatti a sinistra (font dei titoli, numero di vini accanto, piatto scelto sottolineato in oro), tre bottiglie in posa al centro con la macchia grande come nella scheda, il vino scelto a destra (nome = link alla scheda, abbinamenti veri); frecce, clic sulle bottiglie ai lati o trascinamento le fanno ruotare. In basso 88 px liberi: c'è la pillola "I nostri vini" fissa. Le altezze delle bottiglie si calcolano dallo spazio libero (--fig).
- Stesso giorno, "molti glitch allo scroll", "i best seller prima dei premi", "le bottiglie che si piegano non mi piacciono", "i loghetti delle prime versioni non erano male":
  - Ordine sotto la storia di F, G e H: cantina, I più venduti, premi, news, esperienze, Cosa c'è in tavola?, footer. La cantina è uscita da moderna-e-sotto.html in sections/moderna-e-cantina.html (E la include ancora prima del resto, uguale a prima); I più venduti in sections/moderna-f-venduti.html; tappeS di H nello stesso ordine.
  - Glitch trovati in H: l'header restava blu notte per un paio di scatti sopra la sezione crema già dipinta (il tono lo leggeva dal DOM, che cambia solo quando la sezione arriva in cima). Ora il pittore lo forza (data-forza sull'header, letto in js/nav.js) quando la pennellata passa sotto la barra. La giostra dei più venduti con la rotella correva a ~1400 px/s (spinta accumulata da lenis): ora avanza in proporzione allo scorrimento (0,35 px per px). Tempi dei fotogrammi in headless puliti ovunque (17 ms).
  - Giostra: tolta la piega con la velocità, le bottiglie restano dritte.
  - Cosa c'è in tavola?: nella carta tornano i piatti incisi di E (fermati in js/piatti-incisi.js, estratti dalla pagina E: rigenerarli se lì cambiano), cinque per riga col nome sotto, quello scelto pieno d'oro. Su telefono senza nomi, il nome del piatto scelto sotto; frecce ai lati del nome del vino; bottiglie alte quanto lo spazio misurato col caso peggiore (nome su due righe).
- Stesso giorno, dopo "c'è ancora un glitch quando scorro la storia, la parte superiore", "i più venduti manco li scorro tutti", "non mi piace, non fa vedere le altre bottiglie, un'altra impostazione proprio":
  - Storia (F, G, H): nei cambi di sala le pennellate della fila in alto a volte crescevano verso il bordo e il quadro di prima restava appeso in alto a colature. Ora la fila in alto parte sempre dal bordo alto e quella in basso dal basso (passate() in js/moderna-f.js).
  - I più venduti: il palco resta fermo (F e G: sezione 400svh con palco sticky; H: 500lvh) e lo scroll porta una bottiglia dopo l'altra con una sosta su ognuna, tutte prima che arrivino i premi (~310 px di scroll a bottiglia a 1536×730). Niente più giro da solo; trascinata o con le frecce si ferma sempre su una bottiglia.
  - Cosa c'è in tavola? rifatta di nuovo: in alto il titolo e i dieci piatti incisi, sotto tutti i vini del piatto in fila su un filo d'inchiostro (la tavola), nomi sotto; cambiando piatto le bottiglie scendono dietro il filo e risalgono le nuove. Desktop: tutti in vista anche con 13 (formaggi). Telefono: fila che scorre di lato, quattro o cinque in vista.
- Stesso giorno, "il glitch c'è quando scorro velocemente nelle ultime due sezioni della storia", "farei qualcosa di più wow", "le bottiglie sono piccole, adattiamole al monitor":
  - H, fine della storia con la rotella veloce: la pagina aspetta che il cammino finisca riportando indietro lo scroll, ma lo faceva dopo aver posato la tela col vecchio scroll, che tremava di 4-12 px a ogni fotogramma. Ora la correzione è la prima cosa di stato() in js/moderna-f.js: tela ferma a 0, cantina dipinta in ~1,3 s.
  - I più venduti: bottiglie alte quanto lo schermo (--fig = 100svh - header - 200, fino a 980 px; la larghezza segue). Quella al centro sale fino all'header, dove il titolo non c'è; quelle ai lati scalano fino a metà e restano sotto il titolo (misurato: zero sovrapposizioni su 1366, 1536, 1920, 2000, 390, 360). La macchia che arriva al centro sboccia fino a 1,25 e gira con lo scroll, il nome sotto cambia salendo. Provato e tolto il nome gigante sul fondo come nella cantina: sul crema dipinto non si leggeva e la macchia lo copriva.
- Stesso giorno, i piatti di Cosa c'è in tavola? "fammeli nello stile in cui si trovano": in H ora sono dipinti (tools/dipingi_piatti.py, assets/quadri/piatti/<id>.webp, 240 px, ~29 KB l'uno): gli stessi disegni incisi ripassati con le setole di tools/dipingi_soggetto.py (reso importabile), piatto color porcellana a tocchi, filo ocra-oro, forme chiuse campite col colore del cibo (il formaggio sulla sagoma intera), sotto le linee aperte una pennellata di colore. Il piatto scelto ha dietro una macchia d'oro dipinta (--nav-stain-1). In F e G restano le incisioni di E: lì le sezioni sotto la storia sono quelle di E.
- Stesso giorno, "per tutte le prove il catalogo dei vini è questo (Catalogo Feudi Salentini_.pdf), aggiornali ovunque":
  - js/data.js riscritto dal catalogo: 33 vini (erano 28) in 6 collezioni. Nuovi: 125 Pinot Grigio, 125 Malvasia Bianca, Marpiccolo (Fiano, Classica), due Primaura (Rosso Puglia IGP, collezione nuova "Gli internazionali", sul sito non c'è). Per ogni vino: descrizione italiana del catalogo, gradazione, resa, zona, tecnica di produzione (campo nuovo `tecnica`, non ancora mostrato); vista, aromi e abbinamenti ricavati dal testo. Risolti i dubbi segnati in `check` (testo vero di Càla, Collezione 53 DOP, Vis 14%); valori cambiati: Gocce 14,5%, More 13,5% e zona, Platinum 14% e zona, Vis Primitivo e Aglianico, Philia 15+4%.
  - Resta in `check` Philia (il catalogo scrive Primitivo di Manduria DOCG, qui resta Dolce Naturale DOCG). I due Primaura con lo stesso nome: l'utente li vuole entrambi (6 nov), tolto il check. Il catalogo non dà gli abbinamenti di Marpiccolo e Primaura: in scheda "Non indicato nel catalogo" e non entrano in Cosa c'è in tavola?. Dove il catalogo non dà la resa (Terra, Susumaniello, Appassimento) resta quella del sito.
  - Bottiglie nuove scontornate dal PDF (tools/bottiglie_catalogo.py) + copie dipinte (F, G) + due quadri nuovi per H (soggetto/tramonto-2 rifatto con tre bottiglie, soggetto/spiaggia-5 con Marpiccolo).
  - Testi: la frase sull'azienda in A, B, C, D, E e index presa dal catalogo ("vini dai vitigni autoctoni pugliesi per eccellenza: Primitivo, Negroamaro, Verdeca e Malvasia Bianca"); i "28 vini" ora li conta la pagina (data-cantina-total), collezioni 6; F e H "Cinque sale, in ognuna una collezione". B e C: la fila delle collezioni su una riga sola anche con sei, link in fondo allineati.
  - Foto delle prove non cambiate: nel catalogo ci sono la torre sul mare, la vigna con i due uomini, un vecchio alberello, le mani alla vendemmia, le barrique (quasi tutte in bianco e nero); da decidere se usarle.

6 nov 2026 (pomeriggio), "gli allineiamo? vale per tutte le prove" + pagina azienda con la sostenibilità + scheda del vino coi riconoscimenti:
  - Bottiglie allineate: 125 Pinot Grigio, 125 Malvasia Bianca e Marpiccolo galleggiavano sul filo perché nel ritaglio l'ombra grigia della foto del catalogo contava come vetro. tools/bottiglie_catalogo.py ora ferma il vetro dove finisce il colore (o lo scuro); rifatte le 5 bottiglie, le copie dipinte e i quadri H tramonto-2 e spiaggia-5.
  - La tabella FONDO (dove finisce il vetro) è passata da js/scheda.js a js/data.js: ogni vino ha w.fondo, Scheda.FONDO resta come prima. Così la usano anche le pagine senza scheda.js (A, B, C, disegna).
  - Vetro sul filo anche negli scaffali della cantina (riflesso tagliato con clip-path, la macchia resta intera), fondi del vetro alla stessa altezza nel palco della cantina e nelle card di B e C.
  - Trappola GSAP: se un elemento ha un translate CSS e gsap lo anima con y in px, gsap mette translate:none in linea e lo spostamento si perde. Animare in yPercent (gsap lo assorbe e lo tiene) e clearProps a fine corsa: fatto in moderna-b.js e moderna-c.js.
  - Riconoscimenti per vino in js/data.js (PREMI): Bilancio di sostenibilità 2025 pag. 7-9 (16 vini) + catalogo pag. 34 (Terra Gold e Platinum). 18 vini, 65 riconoscimenti; 25 medaglie ritagliate in assets/premi/medaglie/.
  - azienda.html nuova (stile H): famiglia Varvaglione (quarta generazione, dal bilancio), vitigni (catalogo), territorio (sito), Sostenibilità con i dati del bilancio 2025 (Equalitas dal 2022, impronta di carbonio e idrica, tappi Nomacorc, welfare 3 Cuori, WWF Taranto, GRI, obiettivi) e il PDF. Header e footer puntano qui.
  - vino.html nuova (stile H): ?id=, nome, descrizione e bottiglia sul filo con la macchia, la scheda (piatti dipinti, vinificazione e affinamento ora visibili), Riconoscimenti con le medaglie vere, gli altri vini della collezione in fila. La scheda veloce (Scheda del vino) ora porta qui.
  - Stile e script comuni: css/pagine.css, js/pagine.js. Le ancore del footer (#premi, #news) nelle pagine portano a index.html.

6 nov 2026 (sera), "mi aspettavo di più dalla scheda del vino, qualcosa di più wow, sempre dinamico; qui l'overflow orizzontale" + "così come la pagina azienda":
  - Versione 2 di vino.html e azienda.html; la 1 resta navigabile in vino-v1.html e azienda-v1.html (css/pagine-v1.css, js/pagine-v1.js).
  - Vino: si apre sul quadro di H dove il vino è dipinto (QUADRO e POSTI in js/pagine.js, copiati da SALE_H e dagli ALTRI: se cambiano lì, vanno cambiati qui). Scorrendo il crema lo copre a pennellate da destra (bordo-v.webp), la foto vera si posa su quella dipinta e scivola al centro; il nome grande sale dietro. Poi la bottiglia va a destra e resta mentre scorrono i capitoli (vista, profumi, in tavola, vigna e cantina, riconoscimenti): la macchia si allarga sulla vista e diventa d'oro sui riconoscimenti. I due Primaura non hanno quadro: si parte dalla bottiglia.
  - Fila degli altri della collezione: larghezza per bottiglia = spazio / numero (min 100px), la Classica sta in una riga da 1200px; su telefono scorre di lato. Trappola: la foto larga allargava la colonna della griglia del link (grid-template-columns: minmax(0, 1fr)).
  - Azienda: 1 la foto vera da riquadro a tutto schermo, poi il crema a pennellate; 2 i vitigni si accendono uno alla volta e salgono le bottiglie fatte con quel vitigno (uve dei dati: Primitivo 15, Negroamaro 5...); 3 il Salento in galleria orizzontale di foto vere; 4 la notte entra a pennellate e i sei punti del bilancio si danno il cambio con il numero grande in oro. Su telefono vitigni e sostenibilità sono in colonna.
  - Tolta la pillola "I nostri vini" sulle due pagine (copriva la bottiglia, c'è già Vini nell'header).

6 nov 2026 (notte), "la scheda prodotto leggermente migliorabile ma va già meglio; la pagina azienda non ci siamo, ci sono dei bug; gli altri vini della collezione troppo piccoli":
  - Azienda versione 3 (la 2 scartata, la 1 resta in azienda-v1.html): stessa grammatica della scheda del vino. Si apre sul quadro del feudo di H che a pennellate torna la foto vera da cui è dipinto (masseria-vigne, stesso taglio 1,448); la cornice si stringe a destra e a ogni capitolo cambia foto a pennellate: la famiglia (numeri, 65 riconoscimenti dai dati), i vitigni (quanti vini per vitigno), il territorio luogo per luogo (torri, masserie, muretti, ulivi, mare: il luogo acceso è quello della foto, anche col mouse), i riconoscimenti (le 25 medaglie vere). Poi la sostenibilità: la notte comincia a entrare mentre la sezione sale.
  - Bug della 2 trovati navigando a 2000x900: la galleria orizzontale del Salento non scorreva e poi saltava via; con data-nav-trasparente i titoli passavano sotto l'header; uno schermo di solo crema dopo l'apertura; bottiglie dei vitigni minuscole.
  - Scheda del vino: la sezione degli altri vini della collezione ora è alta uno schermo, bottiglie fino a 600px (più strette quando sono tante, la Classica sta in una riga), nomi sempre dentro lo schermo.
  - Sostenibilità rifatta dopo "troppo statica, testi e numeri statici, vedi le altre": la grammatica dei premi di H (pv-dg in js/moderna-e-sotto.js) sul fondo notte. Pennellate, titolo che sale, poi i sei numeri del bilancio in dischi crema che passano in diagonale sopra la macchia d'oro (grande al centro, piccoli verso gli angoli), il testo sale e sfuma con loro; alla fine gli obiettivi entrano uno dopo l'altro con il bilancio in PDF, nello stesso palco (via la fascia sotto, che faceva una giunta tra due notti). Anche sul telefono: diagonale quasi orizzontale sopra, testo sotto.

6 nov 2026 (notte, dopo) "la sostenibilità è cambiata ma il resto della pagina è rimasto uguale; la scheda del vino carina la prima parte, poi lo sticky laterale è un po' passato di moda" + "l'hero così non mi piace, con la targhetta":
  - Le versioni di prima restano navigabili: vino-v2.html e azienda-v3.html (css/pagine-v2.css, js/pagine-v2.js).
  - Niente più colonna di testo che scorre accanto a un'immagine ferma. Su computer ogni pagina è un palco solo: il soggetto al centro e le scene che entrano e escono attorno (js/pagine.js scena: titolo lettera per lettera, pezzi uno dopo l'altro, la scena esce salendo). Sul telefono le scene vanno in colonna sotto il palco d'apertura (il modo si sceglie al caricamento: girando il telefono serve ricaricare).
  - Vino: apertura uguale (quadro, crema a pennellate, nome grande). Poi la bottiglia resta al centro sul filo e ai lati si danno il cambio: nome e descrizione; la vista e i profumi (la macchia si allarga); la tavola (il filo si allarga fino ai bordi e i piatti dipinti ci scivolano sopra dai lati); vigna e cantina; i riconoscimenti (macchia d'oro, medaglie che salgono da dietro il filo). La macchia gira piano con lo scorrimento come nei più venduti di H.
  - Azienda: apertura come H, titolo "Feudi Salentini." in alto e il quadro del feudo che arriva a pennellate nella cornice sotto (via la targhetta); la cornice sale col titolo, il quadro torna foto e si stringe in una finestra al centro (famiglia a sinistra, numeri a destra); il crema la ricopre e per ogni vitigno salgono dal filo le sue bottiglie (link alla scheda) col nome grande dietro; il territorio con titolo in alto, riga dei cinque luoghi (acceso quello della foto, via le targhette) e le foto a pennellate nella cornice; i riconoscimenti su tre scaffali. La sostenibilità resta quella della diagonale.
  - Trappola: in una fila flex con overflow-x visibile la bottiglia non si stringe sotto la sua larghezza (min-width auto): min-width: 0 sul li, se no la fila sfora e c'è scroll orizzontale.
  - Provato con la rotella vera a 2000x900 (tutte e due le pagine), stati a 1536x730 e 1366x650, telefono 390x844: nessun errore, niente scroll orizzontale. La scheda del vino ha ancora la targhetta sul quadro d'apertura (lì la prima parte era piaciuta): da chiedere.

6 nov 2026 (sera tardi), "continua a non piacermi quella hero" + "ci sono altre sezioni da prendere dal PDF, tipo la nostra filosofia, che non hai messo":
  - Azienda, due aperture da confrontare (selettore di prova in basso a sinistra, ?apertura=finestra | copertina; da togliere quando sceglie):
    la finestra = "Feudi" e "Salentini." grandi ai lati di una piccola finestra sulla foto del feudo; scorrendo la finestra si apre fino alla finestra della famiglia e spinge il nome fuori (telefono: nome sopra e sotto). La copertina = quella del catalogo: notte dipinta col marchio grande, titolo e "Vini di Puglia" in verticale; scorrendo si ritira a pennellate verso destra. Via il quadro del feudo (era lo stesso della home H).
  - Dal catalogo (pagine 2-6 e 35): il manifesto "Coltiviamo vitigni autoctoni..." al centro, si accende parola per parola, con le tre foto in bianco e nero del catalogo (vecchia vite, mani alla vendemmia, vigna con le nuvole: assets/photo/catalogo-*.webp, così come sono) che salgono ai lati; "La nostra filosofia." sui vitigni; "Il Salento, una terra divina." sul territorio (testi del catalogo, accorciati di qualche aggettivo); "Dove trovarci." in fondo con indirizzo, contatti, indicazioni stradali e la mappa del catalogo (assets/quadri/mappa-puglia.webp: il disegno a tratto della pagina 35 senza titolo, contatti e marchio della stampa, il bianco reso trasparente) che entra a pennellate.
  - Non usati: i Formati speciali (pagine 30-33: cassette in legno, 1,5 e 3 litri, Gocce da 0,375): le foto nel PDF sono piccole e fatte a tessere; starebbero meglio nelle schede di quei vini.
  - Trappola: senza script (o finché gsap arriva dal CDN) la cornice mostrava la foto a tutto schermo; ora è nascosta finché il primo disegno non la ritaglia.
  - Provato: 1536x730, 1366x650, 2000x900, telefono 390x844, tutte e due le aperture; nessun errore, niente scroll orizzontale.

6 nov 2026 (notte), "il fondo blu della copertina mi piace ma non il logo; partirei l'hero con questo fondo e giocherei coi numeri; i riconoscimenti non così":
  - Le due aperture di prova restano in azienda-v5.html (css/pagine-v3.css, js/pagine-v3.js); tolti selettore, finestra e marchio grande.
  - Apertura: la notte dipinta, "Feudi Salentini." a sinistra; a destra i numeri dell'azienda (4ª generazione, 33 vini, 6 collezioni, 4 vitigni autoctoni, 65 riconoscimenti, tutti dai dati) passano in verticale con lo scroll, grande e d'oro quello al centro con la sua etichetta, piccoli e spenti gli altri; poi la notte si ritira a pennellate verso destra e sotto c'è già la finestra della famiglia (ora nome a sinistra e racconto a destra: i numeri sono passati all'apertura). Telefono: titolo in alto, numeri sotto; palco d'apertura 290lvh.
  - Riconoscimenti anno per anno, stessa meccanica dei vitigni (sulFilo e gigante in js/pagine.js, in comune): in alto il titolo e gli anni coi premi (acceso quello in vista), l'anno grande dietro, le medaglie di quell'anno che salgono dal filo e sotto concorso e vini (il nome se è uno, altrimenti quanti). Telefono: un blocco per anno, medaglie a due colonne.
  - Trappole: una regola .az-cifre span colpiva anche gli span delle lettere (i numeri sparivano): ora li > span. Un figlio con visibility: visible resta visibile dentro un genitore hidden: per mostrare si toglie lo stile ('') invece di scrivere visible.
  - Subito dopo, "più o meno ok ma non immaginavo così i numeri: sempre in rotazione con lo sticky sul lato sinistro, quell'effetto va bene per altre cose": apertura rifatta come composizione. A riposo il nome al centro e i cinque numeri attorno, grandi e di misure diverse (posti in css/pagine.css .az-cifre li:nth-child); scorrendo si entra nella scena: i numeri si allargano verso i bordi a velocità diverse (VEL in js/pagine.js), il nome sfuma, la notte comincia a ritirarsi mentre i numeri sono ancora in vista (niente schermo vuoto) e scopre la finestra della famiglia. Apertura 1,1 schermi. Provato con la rotella a 2000x900, stati a 1366x650, 390x844 e 360x640.
  - Poi "abbiamo elementi come il vino, le vigne, il ramo della vigna: non possiamo usarli?": ogni numero dell'apertura ha accanto il suo elemento vero. 4ª generazione con la vecchia vite in bianco e nero del catalogo, 4 vitigni autoctoni col ramo ad alberello e il grappolo (assets/photo/alberello.webp), 33 vini in 6 collezioni con le sei bottiglie che rappresentano le collezioni sul filo (FS.mk.collezioni), 65 riconoscimenti con tre medaglie vere (due sul telefono). Stesso movimento: scorrendo i gruppi si allargano verso i bordi. Un ramo scontornato nel progetto non c'è: le foto stanno in riquadri. Telefono misurato a 390x844 e 360x640: nessun gruppo tocca il nome o un altro gruppo.
  - Poi "è utile tenere i numeri nell'hero? l'avrei fatta con altro, un 3D di un ramo di vigna, un ramo dipinto; coi numeri ci avrei giocato sotto, sezione a parte": apertura col ramo di vite dipinto (tools/dipingi_ramo.py: dalla foto vera assets/photo/alberello.webp si toglie il cielo per colore e con due contorni a mano la vite sfocata e il terreno, poi le setole di dipingi_bottiglie; esce assets/quadri/ramo.webp con trasparenza, prova in tools/ramo-prova.jpg). Il ramo arriva a pennellate appena l'immagine è pronta, poi si muove appena (css az-vento, spento con movimento ridotto); il nome sta sempre oltre il grappolo (--hr: la posizione del titolo dipende dall'altezza del ramo; misurato a 2000x900, 1920x950, 1536x730, 1366x650, 1280x900: almeno 40 px di distanza). Sotto, sulla stessa notte, i numeri in sezione a parte: griglia 2x2 (telefono 4 righe), arrivano dai bordi e si fermano; bottiglie accanto ai 33 vini, medaglie accanto ai 65 premi; via le foto della vite dai numeri. Poi la notte si ritira sulla famiglia (2 schermi in tutto). Il 3D non c'è: servirebbe un modello o una generazione a pagamento.
  - Poi sul ramo "l'uva si può rendere più visibile, alcune parti non così tagliate, le foglie che si muovono": tools/dipingi_ramo.py ridipinge l'uva più fine e con più foto (gli acini si vedono), i contorni a mano sfumano larghi (26 px) invece di tagliare, e scrive la mappa del vento assets/quadri/ramo-mappa.webp (foglie chiare, uva al 60%: pesa di più, tronco nero). In js/pagine.js ventoPronto/vento: una tela WebGL2 con la stessa formula delle chiome dei quadri di H prende il posto della foto dipinta dopo le pennellate d'ingresso; gira solo mentre il ramo si vede; senza WebGL2 o con movimento ridotto resta il ramo fermo. Verificato: fra due scatti a 0,7 s cambiano le foglie, il tronco e il titolo no.
  - Sui numeri (la griglia 2x2 con bottiglie e medaglie: "non li voglio così") tre prove da scegliere, selettore in basso (?numeri=1|2|3): 1 dipinti (due per schermo, la cifra d'oro con dentro la macchia d'oro di H arriva a pennellate, poi l'etichetta), 2 le cose contano (4ª e 4 grandi; poi le 33 bottiglie vere salgono sul filo divise per collezione col nome sotto; poi il muro dei 65 premi che si riempie), 3 dietro le cose (fascia che scorre di lato con sosta su ogni tappa: numero enorme blu chiaro sul fondo, davanti la vecchia vite, l'uva, le sei bottiglie, le medaglie; il numero da leggere in oro nell'etichetta). Tutte sulla notte sotto il ramo, poi la notte si ritira sulla famiglia.
  - Scelti i numeri dipinti (le altre due prove e il selettore tolti; tutte e tre restano in azienda-v6.html con css/pagine-v4.css e js/pagine-v4.js). "Le foglie del ramo devono muoversi": il vento era troppo sottile (onde corte, pochi pixel). Ora la chioma ondeggia tutta insieme (onda lenta e larga) con sopra il fremito delle foglie, mappa rinforzata nello shader (x1,6), tempo x1,25. Misurato: fra scatti a 0,6 s la chioma cambia 3-4 volte più di prima, il tronco resta fermo. Il vento non parte con WebGL2 assente o con le animazioni ridotte nel sistema (prefers-reduced-motion).
  - Il Salento, "mi dai altre alternative?": provate galleria orizzontale, dal quadro alla foto (i cinque luoghi dipinti con tools/dipingi_luogo.py in assets/quadri/luoghi/) e cartoline a mucchio. Scelta: l'attuale. Le tre prove restano navigabili in azienda-v7.html (css/pagine-v5.css, js/pagine-v5.js); i quadri dei luoghi li usa solo quella.

## 6 nov, sera: un grappolo dipinto fra i numeri
"Nella parte dei numeri un'altra cosa dipinta, alternativa al ramo, sempre per il vino". Scelto il grappolo della foto vera assets/photo/uva.webp (tools/dipingi_grappolo.py -> assets/quadri/grappolo.webp):
pende dall'alto al centro, fra le due cifre (il gambo sparisce sotto la barra), arriva a pennellate con la prima coppia, dondola piano (css az-dondola, ferma con riduci movimento) e se ne va con la notte.
Sul telefono le cifre vanno a sinistra e il grappolo pende a destra. Misurato: nessuna sovrapposizione con cifre ed etichette a 2000x900, 1920x950, 1536x730, 1366x650, 1280x900, 390x844, 360x640.
Scartati senza provarli: le bottiglie dipinte (scure sul blu notte, non si vedono) e le botti di barriques.webp (in fondo alla notte non c'è spazio sotto le etichette).

## 6 nov, sera: 404, mura di moderna-e, pagina azienda-e (fermi qui, si riprende lunedì)
- 404.html fatta (404.template.html, css/pagine.css .e4, tools/dipingi_404.py -> assets/quadri/404/ e sections/404-colate.html): acino vero che vola, scoppia sul vetro, colate una per una. Provata 2000x900, 1366x650, 390x844, 360x640. Il server locale non la mostra sugli indirizzi sbagliati (si apre /404.html); su Vercel sì.
- moderna-e: le mura ora finiscono contro la torre (js/moderna-e.js, merli e cornice divisi ai due lati).
- 10 nov: pulizia ("da lasciare: index, B, C, D, E, H con azienda.html, 404; le altre via"): moderna (A), F, G, fiaba, disegna, prova-soggetto, azienda-v1/3/5/6/7, vino-v1/2
  e i loro css/js propri spostati in _archivio-prove/ (recuperabili). vino.html resta: è la scheda di H.
- 10 nov: "per index, moderna d e moderna e la pagina azienda e la scheda prodotto nello stile di esse stesse". Ogni stile è un sito: body data-sito (i, d, e, h) e la tabella
  SITO in js/main.js portano logo, voce Azienda (header, menu, footer) e i vini del menu alle pagine del suo stile; senza data-sito (B, C, 404) restano quelle di H.
  E: azienda-e.html + vino-e.html, css/pagine-e.css + js/pagine-e.js sopra le classi di css/moderna-e.css; incisioni in assets/incisioni/ da tools/incidi_pagine_e.mjs
  (tratteggio del vino = class v, colorato da --vino). La scheda: bottiglia nella scena PER della home, poi si fa da parte; ultima tappa gli altri vini in fila.
  D: azienda-d.html + vino-d.html, js/pagine-d.js passa i capitoli al teatrino di js/moderna-d.js (window.D_SCENE; sole e luce si ricampionano; sezioni sotto opzionali).
  Azienda: torre, corte, terra rossa, mare, campo, pergola + ruota dei premi. Vino: torre, poi la scena della collezione con la sua bottiglia, sotto fogli di carta coi dati.
  index: azienda-i.html + vino-i.html, js/pagine-i.js + css/pagine-i.css. Forma del vino, disegni degli aromi e contorno della bottiglia spostati da js/disegna.js
  in js/aromi.js (disegna li prende da lì, provato). Azienda: foto vere "dallo schizzo alla foto", premi cerchiati. Vino: la forma del vino come il risultato di Disegna.
  Provate 1536x730 e 390x844 (E anche 360x640), tutte le 18 pagine senza errori né scorrimento di lato sul telefono. Da decidere con lui: D azienda riusa le scene della home.
- 10 nov, dopo il primo giudizio sulle schede: vino-d si apre subito sulla scena della collezione con la bottiglia (un capitolo solo: moderna-d.js ora regge N = 1);
  vino.html (H) non passa più dal quadro dipinto: la bottiglia parte da dove la mostrava la finestra della home (nav.js salva la posizione in fs-pour.r) e scivola al posto;
  vino-e: riconoscimenti = medaglie vere appese a nastri incisi (.pe-appese) + versione verticale vino-e.html?id=…&v=vert con selettore provvisorio .pe-alt (da togliere
  quando sceglie); vino-i rifatta come "quaderno del sommelier" (bottiglia disegnata e sviluppata a matita, frecce verso le note con lo scorrimento).
- 11 nov: vino-d accantonata (in _archivio-prove/; in D i vini aprono vino.html; il ramo page-vd di js/pagine-d.js e le regole .vd- restano, inerti).
  vino-e verticale compatta: tappa alta quanto disegno + testi (--edge per tappa, display flow-root contro il margine che usciva), medaglie appese a un'asta incisa (.pe-asta)
  sopra il filo, anche in orizzontale. vino-i: anche le sezioni sotto sono tavole del quaderno (.vt: foto vera nella cornice a matita, note frase per frase con le frecce;
  sul telefono un filo con una tacca per nota), medaglie cerchiate con la freccia alla didascalia.
- 11 nov (dopo): vino-e verticale con divisioni nette (disegno su crema, testi sulla fascia --stone sotto il filo), vini consigliati centrati coi vetri allineati a .96.
  vino-i: sezioni sotto rifatte senza foto ("fai tu i disegni, in verticale, al centro"): disegni a matita e acquerello fatti in js/pagine-i.js (DIS: grappolo nel colore
  del vino, botte se la vinificazione usa il legno, vite ad alberello altrimenti), tralcio al centro con le note a destra e sinistra; sul telefono note centrate e tralcio
  solo negli spazi. Trappola vista due volte oggi: un margine sul primo figlio esce dal contenitore (margin collapse): display flow-root.
- 11 nov (sera): vino-e verticale: apertura che riempie il primo schermo (--edge e --u della prima tappa da js), riconoscimenti su una riga della fascia (.pe-premi-riga), nomi centrati sotto le bottiglie (foto più larghe della colonna: left 50% / translate). vino-i: note di sinistra allineate verso la bottiglia (.vi-sx), altri vini centrati sui nomi (flex).
- 11 nov (notte): vino-e verticale: i riconoscimenti hanno l'incisione della medaglia sopra la fascia (si staccano dalla vigna); gli altri vini su una riga sola (colonna stretta fino a 80px, sul telefono scorre di lato) col titolo sopra, sulla carta. Il titolo prima finiva sotto: lo spostava il top della versione orizzontale.
- 11 nov (notte): vino-e verticale, l'apertura continua ai lati: tools/incidi_pagine_e.mjs scrive anche <scena>-largo.svg (viewBox ±1300, il riquadro di 600 identico + LATI per scena: orizzonte, onde, colli, filari, pergola, stelle). Solo desktop: sul telefono i lati non si vedono e resta la scena normale. filari-largo pesa 596 KB.
- 11 nov (notte): glitch tra le pagine E: al primo fotogramma le tappe stavano tutte a x=0 coi testi sovrapposti; ora .e-track resta nascosto finché lo script non aggiunge .is-pronto (moderna-e.js e pagine-e.js), e la pillola non lampeggia. azienda-e solo in verticale: sotto ogni capitolo .pe-piu con le foto di assets/photo, la frase della filosofia, i sei punti della sostenibilità (testi di azienda.html, bilancio 2025), gli obiettivi; l'apertura masseria-largo continua ai lati.
- 11 nov (notte, 2): ESPERIENZE TOLTE ovunque ("non le fanno più"): voce Esperienze e bottone Prenota una degustazione dall'header e dal menu, Visite e degustazioni dal footer, sezioni #esperienze di index, B, C, D (le tre alternative, js/css moderna-d-ex in _archivio-prove), E e H (moderna-e-sotto), il numero 'esperienze in cantina', i bottoni Prenota di azienda-d/azienda-i e delle fini della giornata (resta Tutti i vini, ora pieno). I dati D.experiences restano in js/data.js, non li usa più nessuno. azienda-e rifatta: racconto continuo, filo inciso a serpentina che si disegna scorrendo (js/azienda-e.js, css/azienda-e.css): disegni, testi, foto e i sei punti della sostenibilità poggiano sul filo ed entrano quando arriva la punta; medaglie appese al filo che oscillano toccandole; cielo dall'alba alla sera. La versione a fasce è in _archivio-prove/azienda-e-fasce.html.
- 11 nov (notte, 3): azienda-e in grande ("blocchetti di foto no", "la linea non deve girare intorno"): ogni capitolo si apre col suo paesaggio -largo a tutta larghezza, l'orizzonte si apre dal centro scorrendo, dal centro un filo scende dritto nella gola tra testo e foto grande (5:6) fino al paesaggio dopo; sostenibilità a due colonne coi nodi sul filo, medaglie appese all'orizzonte, sul telefono solo gli orizzonti. La serpentina è in _archivio-prove/azienda-e-serpentina.*
- 11 nov (notte, 4): azienda-e: apertura = mondo inciso in prospettiva vera (assets/incisioni/mondo.svg con i pezzi singoli in <defs>, <use> proiettati in js/azienda-e.js): viale di cipressi fino al casale, viti, ulivi, muretti, solchi, foschia; senza foto ("navigazione in profondità come un mondo 3D"). Tolte le aperture strati/lamelle/sviluppo/arco. Salento a prova: griglia | righe | ventaglio (?sal=, selettore da togliere). main.js: un link con #ancora ma query diversa non è più trattato come ancora interna (il selettore non cambiava pagina). Trappola: dentro <use> le regole css non arrivano ai cloni, colori e vector-effect vanno messi sugli originali.
- 11 nov (notte, 5): azienda-e = un unico mondo 3D per tutta la pagina ("tutta la pagina immersiva in 3D lasciando le forme in 2D"): viale → porta del casale → vigna → Salento (torre, pajare, muretti, gabbiani) → campi coi sei cartelli → pergola con le medaglie → tramonto; la camera si ferma alle tappe (data-z dei testi) e il testo compare in alto a sinistra, ciò che ci passa sotto si schiarisce. Foto = card html fluttuanti nella stessa prospettiva (le <image> nello svg si buggavano), ondeggiano col gsap.ticker. Terra colorata (--suolo), calici tolti su richiesta. Versione a sezioni in _archivio-prove/azienda-e-sezioni.*
- 11 nov (notte, 6): "le foto nel mondo sono sempre piccole: solo la hero 3D, le altre sezioni con GSAP" → rimessa la versione a sezioni (hero 3D del viale fino al casale + filosofia, Salento a prova griglia|righe|ventaglio, card della sostenibilità, medaglie, brindisi), con la terra colorata e il viale chiaro nella hero; ripristinata la misura dei disegni di campo e calici (prendevano --u vuoto). Il mondo unico è in _archivio-prove/azienda-e-mondo.*
- 11 nov (notte, 7): Salento: scelta la griglia (tolti selettore, righe e ventaglio). Filosofia rifatta: il grappolo si incide e attorno si accendono i quattro vitigni (Primitivo, Negroamaro, Verdeca, Malvasia Bianca) col tratteggio nel colore della loro uva, poi salgono le due foto grandi in bianco e nero e la frase si accende.
- 11 nov (notte, 8): azienda-e prende tre sezioni da azienda.html, nello stile E: i numeri dopo la hero (4ª generazione, 4 vitigni, 33 vini in 6 collezioni, 65 riconoscimenti; le cifre arrivano dai bordi, il filetto si traccia), i vitigni con le loro bottiglie (palco fermo, un vitigno alla volta, le bottiglie salgono dal ripiano e portano alla scheda), i riconoscimenti anno per anno (anno grande, medaglie appese al filo con concorso e vino; sul telefono due altezze sfalsate). Filosofia: tolti grappolo e vitigni intorno (il testo finiva sul disegno), restano le due foto in lungo che si aprono dal basso e salgono a velocità diverse. La frase dei premi conta i concorsi dalle medaglie (D.awards ne nomina due che fra i premi non ci sono).
- 11 nov (notte, 9): tolti i numeri ("non mi piacciono"). I vini per vitigno rifatti, due prove col selettore in basso a sinistra (?vit=ripiano|ruota, da togliere dopo la scelta): ripiano = un filo lungo con tutte le bottiglie e il cartello di ogni vitigno, scorre di lato a palco fermo e le bottiglie salgono entrando; ruota = le bottiglie sul bordo di una ruota incisa col centro sotto lo schermo, gira e porta in cima una bottiglia alla volta col nome (link alla scheda), vitigno e denominazione. Foto finale a tutta larghezza attaccata al footer, si allarga dal riquadro ai bordi; prima il margine della foto usciva dalla sezione e lasciava una fascia del fondo pagina.

- 11 nov (notte, 10): "la parte immersiva della hero farla meglio con una tecnologia leggera" → l'apertura di azienda-e in WebGL2 senza librerie (js/mondo-gl.js, 15 KB), stessi pezzi di assets/incisioni/mondo.svg e stessa composizione. Ogni tratto è un rettangolo sottile largo sempre gli stessi pixel (instancing, un solo buffer per tutto il mondo), i fondi pieni scrivono la profondità (6 cm dietro i loro tratti), terra, viale, solchi e ombre li disegna lo shader del suolo. In più rispetto all'svg: lo sguardo segue il puntatore (di lato 0,5 m e 2°; in verticale solo dopo che il testo se n'è andato), il vento piega le chiome, all'apertura il mondo si incide tratto per tratto dal vicino al lontano, i cipressi coprono davvero ciò che sta dietro, ombre dei cipressi a tratteggio sul viale (passo fra 6 e 12 px a ogni distanza), tratteggio sul lato in ombra dei cipressi (cipOmbra in tools/incidi_pagine_e.mjs: rigenerato solo mondo.svg, gli altri svg identici). Il disegno gira solo mentre la hero si vede. Selettore di prova dentro la hero, a destra: ?mondo=svg = versione di prima, che resta anche come riserva dove WebGL2 manca; scelto uno, togliere l'altro e il selettore.
  Testo d'apertura mai sopra i disegni, per tutte e due le versioni (prima sul telefono e sotto i 1100 px il primo cipresso finiva sul paragrafo): ottica() in js/azienda-e.js, se il cipresso passerebbe sul testo l'orizzonte parte più in basso (o0, fino a 0,8 H) e torna a 0,56 H nei primi passi (CAM.su), e se non basta si parte più indietro (z0); CAM.z ora è derivato da CAM.p. Prova: scratchpad tocca.json + tocca.py (testo nascosto, si contano i pixel di disegno nei suoi riquadri) su 1536x730, 1366x650, 1024x768, 1920x950, 1440x900, 900x700, 1100x560, 390x844, 360x640, 412x915, col puntatore al centro e ai quattro angoli: zero. Fluidità in Chrome vero con CPU rallentata 6 volte, stesso scorrimento di 6 s: svg 32-39 fps (oltre 70 fotogrammi lenti, il peggiore 117-150 ms), WebGL 59,6 fps (2 lenti, 33 ms); senza rallentamento su questo PC entrambe a 60. Trappole: `false?.metodo()` lancia (l'optional chaining salta solo null e undefined); il primo controllo del testo passava per caso perché il puntatore spostava il cipresso: provare sempre anche col puntatore al centro.

- 11 nov (notte, 11): giudizio sulla hero in WebGL: "hai solo rivisto questo? pensavo qualcosa di meglio; un disegno migliore dei vitigni anziché quelle foglie così così, come i muretti" e "allo scroll c'è un flickering allucinante, tratti che scompaiono, alberi semitrasparenti".
  Sfarfallio: errore mio. Scorrendo la scena veniva disegnata due volte nello stesso fotogramma (onUpdate di GSAP + il mio requestAnimationFrame) e gl.clear() non azzerava la profondità perché depthMask era rimasta chiusa dai tratti: il secondo disegno si scontrava con la profondità del primo. Da fermi non si vede (il browser azzera il buffer dopo ogni fotogramma presentato): si riproduce solo con scatti presi mentre la rotella gira (scratchpad rotella.json). Corretto: depthMask(true) prima di clear() e un disegno solo per fotogramma. Regola: una prova di WebGL va fatta anche in movimento, non solo a pagina ferma.
  Disegni nuovi, dalle foto vere, solo per il mondo in WebGL (pezzi m-alb-a|b|c e m-muretto-a|b in tools/incidi_pagine_e.mjs, con un caso a parte: gli altri svg restano identici; l'svg di riserva tiene m-vite e m-muro): alberello pugliese da assets/photo/alberello.webp (tronco nodoso con la corteccia, forca, due braccia, foglie in cima sui tralci, viticci, grappoli con gli acini d'oro) piantato a filari (due per lato su desktop, uno sul telefono); muretto a secco da assets/photo/muretto-secco.webp (corsi di altezze diverse, pietre grosse su due corsi, giunti storti, copertina, erba al piede) in moduli da 12 m che corrono lungo il viale dietro i cipressi, girati di 90°, fino a 24 m dal casale.
  Motore: tratti con due estremi 3D (10 numeri per tratto), cose con ang (rotazione attorno alla verticale) e sp (specchio); dentro un pezzo ogni fondo pieno apre un elemento 3 cm più avanti del precedente (l'ordine di pittura dell'svg diventa profondità: le foglie si coprono fra loro); dettaglio per distanza dalla larghezza del tratto (sotto 0,75 px fino a 110 m x lod, sotto 0,95 fino a 250 m x lod, gli altri sempre; lod = scala della cosa, viti 0,14, muretti 0,15); le viti fremono più degli alberi (fase da 8 in su). mondo.svg 236 KB (era 129). 159 mila tratti su desktop, 6,4 MB di buffer, costruiti in circa 35 ms (193 ms con CPU rallentata 6 volte); fluidità con CPU rallentata 6 volte 58,8 fps. Testo d'apertura ricontrollato sulle dieci misure: zero pixel di disegno sotto. Non provato su telefono vero. Gli ulivi hanno ancora il disegno di prima (foglie grandi): da rifare se li chiede.

- 11 nov (notte, 12): "ora sì, cos'altro potremmo aggiungere?" → proposte sei cose, approvate tutte tranne il mare all'orizzonte ("va bene tutto tranne il 6"). Fatte nel mondo in WebGL di azienda-e, ognuna spegnibile dall'indirizzo: ?senza=ulivi,portone,papaveri,pajara,uccelli (SENZA in js/azienda-e.js; ognuna è una riga, per toglierla basta cancellarla).
  Ulivi: ulivo secolare (m-oliv-a|b) al posto di quelli a foglie grandi, negli stessi punti: due fusti intrecciati con la cavità, tre branche in vista, ciuffi di foglioline a lancetta; il contorno dei ciuffi ha larghezza 1,05 = in js/mondo-gl.js si vede solo da lontano (lod negativo), quando le foglioline non si distinguono più. Pajara di pietra (m-pajara-p, da assets/photo/pajara.webp: tronco di cono a corsi, gradone, porticina buia), una, a destra oltre gli ulivi. Papaveri (m-papavero, già esistente) al piede dei muretti dalla parte del viale, fremono come le viti. Uccelli (m-gabbiani): tre, a 200 m, attraversano il cielo e ricominciano, compaiono solo quando il testo d'apertura se n'è andato (CAM.su).
  Portone: i battenti (m-battente, uno specchiato, pezzi mobili con u_g = cardine + rotazione nel vertex shader) si aprono in dentro fra 34 e 12 m dal casale (CAM.porta dipende solo dalla posizione); il casale del WebGL (m-casale-gl) ha il vano bucato nel fondo e dietro c'è m-luce, un foglio color carta; la camera non si ferma più a 13,5 m ma arriva sulla soglia (CAM.soglia, distanza ot.soglia: gli stipiti ai bordi dello schermo, sul telefono appena fuori), lo sguardo di lato si ferma (CAM.calma) e la famiglia compare al centro, fra i battenti aperti, in una colonna larga --entro (classe az--porta); scorrimento della hero 370% invece di 320%. Senza movimento o senza WebGL: casale chiuso e famiglia in basso come prima; con le animazioni ridotte la famiglia sta su una fascia sua con un filo sopra (prima, coi muretti nuovi, finiva sopra le pietre).
  Prove: testo d'apertura e testo della famiglia sulla soglia senza disegni sotto su dieci misure (scratchpad tocca.json e tocca-fine.json), puntatore al centro e ai quattro angoli; scatti a rotella in movimento puliti; con CPU rallentata 6 volte 59,9 fps. mondo.svg 330 KB circa. Non provato su telefono vero. Le finestre del casale sono archi a 8 lati: sulla soglia si vedono spigolose ai bordi.
  Chiesto anche un parere sulla hero di moderna-e.html (home "La giornata"): dato solo il parere, niente toccato.

- 11 nov (notte, 13): "sulla moderna-e fai una copia per capire il risultato come viene, poi scelgo quale tenere" → moderna-e2.html (moderna-e2.template.html + js/moderna-e2.js, copia di js/moderna-e.js; stessi sections e css). L'originale non è toccato: tools/incidi_pagine_e.mjs continua a leggere js/moderna-e.js. Nella copia le modifiche sono segnate PROVA:
  apertura con filari di alberelli veri al posto delle righe con le foglioline (otto fasce di profondità, ognuna un gruppo Gs dipinto elemento per elemento; il passaggio davanti al portone resta libero), casale e cipressi con f 0,86 e le fasce da 0,86 a 1,18 (i piani si staccano camminando e col cursore), prima tappa a 0,55 W invece di 0,62 (la prima bottiglia si vede intera, solo desktop), tralcio della tappa 1 allungato verso il centro (solo desktop);
  tappa Terra: alberelli nei filari, alberello grande a sinistra, pajara di pietra, muretto a secco nuovo; tappa Organic: chiomaFine, foglie piccole e fitte sui rami degli ulivi.
  I disegni nuovi (alberello, ceppo, muretto, pajaraPietra) sono gli stessi di tools/incidi_pagine_e.mjs, ricopiati nella copia con un caso a parte (q); fermo() salva e rimette il seme comune e i pezzi tolti si calcolano lo stesso, così le tappe non toccate restano identiche all'originale. In alto a sinistra (sul telefono nell'header) c'è il ritorno all'originale: da togliere dopo la scelta. Trappola presa due volte: un commento // a metà di una riga lunga cancella il codice che segue: in questi file usare /* */.
  Se sceglie la copia: sostituire js/moderna-e.js con la copia vuol dire controllare che tools/incidi_pagine_e.mjs trovi ancora i suoi segnaposto e rigenerare; se sceglie l'originale: cancellare moderna-e2.template.html, moderna-e2.html e js/moderna-e2.js.

- 11 nov (notte, 14): "va bene moderna-e2, sostituiamo a moderna-e e magari tienila in bozza" → la copia è diventata moderna-e (js/moderna-e.js, le modifiche segnate "11 nov" invece di PROVA, tolto il link di ritorno); moderna-e2.* non esiste più. Quella di prima resta in bozza: moderna-e-bozza.html (moderna-e-bozza.template.html + js/moderna-e-bozza.js), non collegata dal menu; lì le voci dell'header portano alla home nuova. tools/incidi_pagine_e.mjs legge il js nuovo e rifà tutte le incisioni identiche (diff -rq vuoto). Stato di prima dello scambio salvato nello scratchpad (scambio-prima/).

- 11 nov (notte, 15): sulla hero di moderna-h ha chiesto cosa migliorerei "a livello estetico dei quadri", poi "ok fai una copia" → moderna-h2.html (moderna-h2.template.html + js/moderna-h2.js, copia di js/moderna-f.js: cambiano solo SALE_H, la cartella dei quadri e il link di ritorno, segnati PROVA). L'originale non è toccato. I quadri nuovi stanno in assets/quadri/soggetto2/ (stessi 34 file di soggetto/), dipinti da tools/dipingi_soggetto2.py, copia di tools/dipingi_soggetto.py. Cosa cambia nei quadri:
  il tocco è piccolo in fondo e grande davanti (LONT, punti()); ogni pittore ha la sua tavolozza (tavolozza(): niente ciano e blu elettrico; il cielo di Van Gogh va al cobalto); Signac a tessere ordinate invece dei puntini a caso; Courbet a spatolate lunghe e più scuro; Monet con un giro fine e i tocchi che seguono le forme;
  le bottiglie si dipingono insieme al luogo e poi si rifiniscono un po' dentro il contorno (orlo), il nero del vetro prende lo scuro della sala (scuro), niente più macchioline sul vetro scuro; fili d'erba e fiori del luogo passano davanti al piede (davanti; tolti nella sala Turner, sembravano bastoncini); pose diverse da sala a sala (python -I tools/dipingi_soggetto2.py --pose le scrive per SALE_H);
  sala 1: la foto della pajara è 563 px, ingrandita mostrava i quadretti della compressione: ora è sfocata prima di dipingere, e le bottiglie stanno a sinistra così la pajara si vede; sala 2: via le due persone (senza_persone()); sala 3: taglio più alto, si vedono orizzonte e filari.
  Il feudo d'ingresso resta quello di prima: due prove di ridipingerlo (a tocchi impressionisti, e tools/dipingi.py con DIP_K=1.3) non erano meglio. Provato: 1536x730, 390x844, 360x640, animazioni ridotte, "Altri vini" nelle sale 2, 4 e 5: nessun errore.
  Se sceglie la copia: soggetto2 → soggetto, dipingi_soggetto2.py → dipingi_soggetto.py (tools/dipingi_piatti.py ne importa le setole: controllare), SALE_H nuovo in js/moderna-f.js, togliere moderna-h2.*; se sceglie l'originale: cancellare moderna-h2.template.html, moderna-h2.html, js/moderna-h2.js, tools/dipingi_soggetto2.py e assets/quadri/soggetto2/.

- 11 nov (notte, 16): "va bene la nuova, sostituiamola a quella" → i quadri ridipinti sono ora quelli di moderna-h: assets/quadri/soggetto2/ è diventata assets/quadri/soggetto/, tools/dipingi_soggetto2.py è diventato tools/dipingi_soggetto.py, in js/moderna-f.js cambiano solo le sei righe di SALE_H (controllato col confronto riga per riga); moderna-h2.* non esiste più. Quelli di prima (34 quadri, strumento, js) stanno in _archivio-prove/moderna-h-quadri-prima/ con un LEGGIMI per tornare indietro. tools/dipingi_piatti.py importa ancora le sue setole senza errori. Provato dopo lo scambio: 1536x730, 390x844, animazioni ridotte, "Altri vini": nessun errore. Le pagine d'archivio che usavano quei quadri (_archivio-prove/prova-soggetto.html, js/pagine-v2..v5.js) non sono state guardate.

- 11 nov (notte, 17): "la scheda che apri quando clicco su un vino, in base a cosa fa il disegno? qui per carni rosse ci metti il mare dietro" (Susumaniello). Prima il disegno dipendeva solo dalla collezione (due scene che si alternano): tutta la Classica aveva mare o torre, anche i rossi da carne. Ora la scelta sta in un posto solo, FS.mk.scenaE in js/moderna-kit.js, usata dalla scheda della home (js/moderna-e.js) e dalla pagina del vino (js/pagine-e.js), che prima avevano ognuna la sua tabella PER: il mare solo ai vini che il catalogo abbina al pesce (foods con pesce o crudo e senza carne o selvaggina; un vino senza abbinamenti tiene la scena della collezione); gli altri della Classica prendono filari e pajara. Cambiano sette vini: Sassirossi, Philia, Re Sale, Vis, More, Susumaniello, Appassimento. Le altre collezioni restano com'erano; i due Primaura (collezione internazionali, senza scene sue) prendono vite e grappolo invece di dare errore nella scheda. tools/incidi_pagine_e.mjs: il pezzo delle scene ora finisce a "const disegnoInciso" (PER non c'è più in moderna-e.js); incisioni rigenerate identiche. La bozza js/moderna-e-bozza.js tiene la regola di prima.
  Visto e non toccato: a 1050x790 il titolo della scheda finisce sopra il marchio in alto a sinistra.

- 11 nov (notte, 18): "mi metti la index e le sue pagine, la moderna-e e la moderna-h ultima insieme con un pulsante switch, ma prima la versione azienda della moderna-e metti a globo per i vini e lascia la nuova versione dell'immersione della hero".
  azienda-e, scelte chiuse: i vini stanno sulla ruota ("a globo"), l'apertura è quella in WebGL. Tolti il ripiano (js e css), i due selettori (.az-alt) e gli interruttori ?vit= ?mondo= ?senza= (ora non fanno niente). L'svg dell'apertura resta nel codice: è la riserva dove WebGL2 manca e con le animazioni ridotte, non si può togliere.
  Selettore dei tre siti (PROVA, da togliere a scelta fatta): js/main.js lo mette sulle pagine con data-sito i, e, h; stile .sito-alt in css/nav.css. Tre voci: Acquerello (index, azienda-i, vino-i), Incisione (moderna-e, azienda-e, vino-e), Pittura (moderna-h, azienda, vino). Porta alla stessa pagina dell'altra versione e nella scheda tiene lo stesso vino (?id=). Su desktop sta sotto l'header a sinistra coi nomi; sul telefono nell'header fra marchio e Menu coi numeri 1 2 3. Non compare su B, C, D. vino.html è anche la scheda di D: lì il selettore c'è e segna Pittura.
  Provato sulle nove pagine a 1536x730 e 390x844: nessun errore, il selettore non copre titoli né bottoni. Restano da scegliere: vino-e orizzontale o verticale (.pe-alt), la bozza moderna-e-bozza.html.

- 11 nov (notte, 19): pubblicato. Repo pubblico github.com/antonionocellanb4/feudisalentini-restyling, GitHub Pages da main: https://antonionocellanb4.github.io/feudisalentini-restyling/ (commit 3c680ca, .nojekyll). Fuori dal repo: _archivio-*, tools/shots, tools/ponti, tools/threejs-skills.
- 11 nov (notte, 20): scheda vino E. Prima "mettiamo la versione verticale", poi "lasciamo entrambi come scelta verticale o orizzontale così la cliente può vedere". Quindi restano tutte e due col selettore (.pe-alt), ma vino-e.html si apre in verticale; l'orizzontale è vino-e.html?id=…&v=oriz (i vecchi link &v=vert danno ancora la verticale). Nel selettore prima Verticale poi Orizzontale.
  Su desktop il selettore stava in basso a sinistra e nell'orizzontale copriva i titoli di tre tappe (In tavola, In vigna e in cantina, Gli altri vini): ora sta sotto il selettore dei siti (top header + 57px). Sul telefono resta in basso a sinistra, non copre niente a 390x844.
  Non fatto: nell'orizzontale i link agli altri vini e la cantina riaprono la scheda in verticale; a 730 px di altezza il paragrafo lungo di "In vigna e in cantina" in orizzontale esce dal fondo (c'era già). Modifica solo in locale, non ancora su GitHub.

- 11 nov (notte, 21): "ste file così cosa sono, i rami dobbiamo mettere" (apertura di vino-e, scena dei filari). Ogni pianta era un bastoncino con due o tre foglie in cima. Ora sono viti ad alberello (ceppo, due braccia, foglie, grappoli d'oro): viteFilare e vitiFilari in js/moderna-e.js, prima di SCENE. Stanno su un solco ogni quattro, sfalsate da un filare all'altro, in prospettiva vera (la prima quasi sul ripiano, mai sotto: prima le foglie spuntavano dal filo), le vicine coprono le lontane. Tre misure di dettaglio: davanti l'alberello vero con meno punti, in mezzo tronco a forca e cinque foglie, in fondo tre foglioline.
  SCENE.filari(v, campo): 300 nella scheda della home (il disegno non va sotto i testi), 500 nelle tappe di vino-e (il campo riempie il riquadro), 2100 nella scena larga dell'apertura (i solchi oltre 300 li mette LATI.filari in tools/incidi_pagine_e.mjs, che non disegna più piante). Rigenerati solo filari.svg (293 -> 104 KB) e filari-largo.svg (596 -> 361 KB): gli altri disegni sono identici byte per byte. Copia di prima in scratchpad/filari-prima.
  Il selettore Verticale | Orizzontale ora sta in alto a sinistra anche sul telefono (in basso copriva "Scopri il vino" nell'apertura verticale); solo sul telefono in orizzontale resta in basso (.pe-alt--o), perché in alto toccherebbe le medaglie.
  Provato: apertura a 1920x1000, 1536x730 e 390x844, tappa "In vigna e in cantina" del Càla, scheda del Sassirossi nella home, orizzontale, animazioni ridotte, bozza: nessun errore. La bozza moderna-e-bozza.js ha il suo codice: lì i filari della scheda sono quelli vecchi.

- 13 nov (22): "va messa una barra di ricerca con una ricerca dinamica in tempo reale nella modale". Fatta nel menu dei vini (la cantina, sections/header.html + js/nav.js + css/nav.css), che è di tutte le pagine. Un campo solo come codice (cercaHTML), messo due volte: sul telefono fra "I vini" e i filtri, su desktop in cima alla colonna delle collezioni. Filtra mentre si scrive, senza accenti né maiuscole; ogni parola deve trovarsi in nome, denominazione, uve, collezione, colore, profumi o abbinamenti (testo, trova in js/nav.js).
  Telefono: restano solo i vini trovati, i numeri sui filtri del colore si aggiornano, a zero un messaggio (se è colpa del filtro del colore lo dice e dà il numero in Tutti). Desktop: i risultati prendono il posto della collezione sul palco (cercaSet), passare col mouse su una collezione non cambia più il palco mentre si cerca, il clic sì e svuota il campo; a campo vuoto torna la collezione di prima. Esc svuota il campo prima di chiudere, Invio apre il primo vino. Su desktop il campo prende il fuoco all'apertura, sul telefono no (la tastiera coprirebbe l'elenco). Riaprendo il menu la ricerca è sempre vuota.
  Tolto il link "Pagina dei vini" in fondo alla colonna: portava a vini.html, che non esiste. Schermi bassi (1366x650): margine dei titoletti ridotto, la colonna non scorre. Provato a 1536x730, 1366x650, 390x844 su moderna-h, moderna-e, index, vino-e, vino-i: nessun errore. Resta un link morto nell'header di tutte le pagine: "Come nasce" (come-nasce.html non esiste).
- 13 nov (23): quarta versione "Botanica", dal profilo Instagram del cliente (instagram.com/feudi_salentini; senza accesso si vedono solo gli ultimi 12 post, le copertine delle collezioni me le ha mandate lui in immagine). botanica.html (template + sections/botanica.html + css/botanica.css + js/botanica.js), nel selettore delle versioni come quarta voce, solo dalle home (SITI.b in js/main.js: azienda e scheda sono ancora quelle di Pittura).
  Cosa viene dal profilo: un colore pieno per collezione (campionati dalle copertine delle storie in evidenza: 53 #600028, Terra #bf5138, Organic #79835e scurito a #717b57 perché il bianco piccolo si legga, Classica #503323, 125 #023e25, Internazionali #905e3b), la pianta a retino tono su tono dentro l'etichetta sagomata (ginepro, cappero, camomilla, ulivo, menta, fico d'India), "Collezione" in corsivo fra due filetti e il nome in maiuscolo largo (Montserrat + Pinyon Script), le frasi delle copertine in inglese (la 53 non ne ha una leggibile: senza), la bottiglia posata con l'ombra netta, le fotografie.
  Piante: NON sono i disegni del cliente. tools/botanica.py parte da tavole d'epoca di pubblico dominio (Thomé 1885, Köhler 1887, in tools/tavole/), toglie la carta colonna per colonna (l'ombra della rilegatura), tiene la pianta grande, retino a 45 gradi, e salva maschere nere con la trasparenza in assets/botanica (il colore lo dà il css). --prova fa il foglio di controllo. Se arrivano i file veri del cliente si sostituiscono le sei maschere.
  Pagina: apertura con la frase della biografia e le sei tavole (quella sotto il mouse si allarga; sul telefono griglia 2x3 come il profilo); poi un foglio per collezione, fermo in alto mentre il successivo gli sale sopra (position: sticky, tutti nella stessa .bo-pila; --k lo spegne). Dopo ogni foglio uno spazio lungo quanto la sua fila di bottiglie deve camminare (.bo-corsa, lo misura js): solo Classica cammina davvero su desktop. Le bottiglie sono alte quanto lascia la fila (100cqh), così non finiscono sotto la frase. Ombra = seconda copia della foto annerita, si sposta col puntatore (il sole); la foto non si tocca. Clic: la scheda comune (js/scheda.js) in .bo-scheda. Sul telefono e con animazioni ridotte la fila si scorre col dito. In fondo le foto del profilo in fila (512 px, le più grandi senza accesso; due con la scritta del marchio scartate).
  Trappola: gsap che anima scaleY azzera scale e rotate del css (la pianta gemella non era più specchiata): la crescita passa da --g.
  Provato: 1536x730, 1366x650, 1920x950, 390x844, 360x640, rotella vera fino al footer, scheda, menu dei vini, animazioni ridotte: nessun errore. Non provato: telefono vero, Safari. Niente esperienze né degustazioni.

- 13 nov (24): Botanica rifatta dopo il suo giudizio sulla prima (fogli che si impilano): "bella, ma mi aspettavo qualcosa sempre legato alla journey, mantenendo le sezioni usate nelle altre prove", poi "sono così belle quelle grafiche sulla botanica, sfruttiamole al meglio", "i titoli troppo grandi", "nelle sezioni sotto non userei il verde", "la parte iniziale dell'hero rifalla", "non sono convinto manco delle chiazze" (nei più venduti). Quello scritto al punto 23 su fogli e .bo-pila NON vale più.
  Ora botanica.html è la passeggiata delle altre home: body page-me page-bo, impaginazione del cammino da css/moderna-e.css (ripiano --edge, testi sul ripiano, tre bottiglie per tappa con "Altri N vini", pillola delle tappe, trascinamento), meccanica riscritta corta in js/botanica.js senza canvas. Sette tappe larghe uno schermo: apertura e sei sale (53, Terra, 125 Organic, Classica, 125 Uno Due Cinque, Internazionali).
  Sala: muro del colore della collezione, pianta a retino su tre piani (.bo-pi--f lontana in --c2, --a e --b vicine in --c3) che cresce dal ripiano mentre la sala arriva (--g), scorre a velocità diverse (--d per --k) e piega col vento del mouse e del camminare (--vx). Il muro finisce al filo del ripiano: i testi non stanno mai sul disegno. Sul ripiano: "01 · Il ginepro", "Collezione" in corsivo + nome in maiuscolo, frase della copertina in inglese + racconto delle altre home, conto e Altri vini. Nomi delle piante miei, dalle copertine: ginepro e menta sono i due meno sicuri, da far confermare.
  Apertura: una copertina a tutto schermo che cambia umore. Sei strati (.bo-umore: muro, piante ai lati, targa sagomata con la pianta, ripiano), il nuovo entra da destra; cambia da sola ogni 4,6 s finché si è in cima; sul ripiano i sei nomi delle collezioni (.bo-scegli) la portano sul loro e al clic vanno alla sala. Scritta nella targa: "Wines that" in corsivo + "SET THE MOOD." (la frase della biografia, spezzata come nelle copertine). Bocciata prima: sei tavole in fila sopra il titolo grande.
  Scheda del vino: dietro la bottiglia la pianta della collezione nel suo colore (disegno di Scheda). Più venduti: via le macchie ad acquerello, stessa pianta (js/botanica.js cambia --wine e --stain alle .tv-v__fig, forma in css/botanica.css).
  Sotto il cammino le sezioni di moderna-h: cantina, più venduti, premi, news, cosa c'è in tavola (stessi file, niente copie), poi le foto del profilo. Fondo scuro (--night) marrone della Classica #3e2719, non verde. Titoli delle sezioni in maiuscolo e ridotti (da 2,1 a 3,5rem al massimo). L'header sul cammino è sempre bianco (hero--dark fisso); con la scheda aperta torna scuro sulla sua fascia crema.
  Provato: 1536x730, 1366x650, 1920x950, 390x844, 360x640, scheda, Altri vini, più venduti: nessun errore. Non provato: telefono vero, Safari, rotella dall'inizio alla fine dopo l'ultima modifica.

- 13 nov (25): menu dei vini, per TUTTI i siti: sul palco mai più di sei bottiglie alla volta ("se apro la Classica si vedono le bottiglie mini, voglio mantenere la proporzione di quando ne sono 3 o 6"). In fondo alla fila un tondo "+7 / Altri vini", all'ultimo giro "Ricomincia" (SEI, da e .cstage__altri in js/nav.js e css/nav.css). Vale anche per i colori e per la ricerca. Le misure m e s della fila non servono più (restano nel css).
  Botanica, dietro le bottiglie: bocciate le piante libere e grandi ("un po' confusionario... al massimo la forma dell'inizio dell'hero dietro alla bottiglia, che si sviluppa in altezza col disegno, no ste cose giganti"). Ora ovunque la targa sagomata della collezione, alta, col disegno dentro tono su tono: più venduti (.tv-macchia), scheda del vino (.bo-targa--z) e menu dei vini (FS.stileVino in js/botanica.js, che js/nav.js aggiunge allo stile di ogni vino). Le piante grandi restano solo sui muri delle sale.
  Errore mio da non rifare: sostituendo showSet con uno script ho tagliato anche il blocco della ricerca che veniva dopo (cercavo l'ultima chiusura prima di sBtns). Rimesso e riprovato. Nelle sostituzioni a blocchi il confine va preso sul testo che segue, non sull'ultima graffa.
- 13 nov (26): quinta versione "Fotografia", foto.html, chiesta "come moncalisse.com/en con le foto di Instagram". Da Moncalisse la struttura: apertura a fotografie, fondo crema, titoli in maiuscolo con le grazie (Marcellus) a misura contenuta, righe editoriali con le foto sfalsate che scorrono più lente, una foto larga, la fascia a tutto schermo con la carta al centro. Marchio, testi e vini sono i nostri.
  Foto: assets/foto-ig, 1080 px, prese dalle pagine dei singoli post (lì Instagram le dà piene; dalla griglia solo 512). Solo gli ultimi 12 post: per le altre serve l'accesso o gli originali. Tre avevano il nome del marchio in alto e il castello in basso: ritagliate. tools: scratchpad/ig_1080.py (non nel repo).
  Pagina: apertura con tre foto verticali affiancate che cambiano a turno (una sola sul telefono) e la frase della biografia; presentazione; due righe editoriali (Terra, 125 Organic) con le frasi delle copertine; poi le collezioni come passeggiata orizzontale (palco fermo, sei sale, foto a tutto schermo + carta crema con tre bottiglie che aprono la scheda comune, nomi in basso, si trascina); sotto le sezioni comuni (cantina, più venduti senza macchie, premi, news, in tavola). Fondo scuro #2b1a12. js/foto.js, css/foto.css, sections/foto.html. Nel selettore è la quinta voce, solo dalle home.
  Abbinamento foto-collezione: certo per Terra, Organic e Internazionali (si vede la bottiglia), scelta mia per le altre tre.

- 13 nov (27): pagina del vino per Botanica (vino-b.html?id=) e Fotografia (vino-f.html?id=), chiesta subito dopo le due home. Una pagina sola come contenuto e script (js/pagine-bf.js: apertura con la bottiglia, racconto che si accende, calice e tavola, vigna e cantina, medaglie vere, altri vini della collezione), due vesti in css/pagine-bf.css sopra css/botanica.css o css/foto.css. Botanica: apertura sul colore della collezione con la targa col disegno dietro la bottiglia e l'ombra netta; "In vigna e in cantina" sul colore con la pianta grande ai lati (sul telefono no: finirebbe dietro il testo). Fotografia: crema, bottiglia su un pannello chiaro, una foto larga del profilo a metà.
  Le sei collezioni (colori, piante, frasi, racconti, foto) ora stanno in js/dati-bf.js, usato dalle due home e dalle pagine del vino. SITI in js/main.js: b e f hanno la loro pagina del vino; l'azienda è ancora quella di Pittura, e il selettore delle versioni le mostra su home e vino ma non sull'azienda.
  Menu dei vini in Fotografia: via la macchia ad acquerello ("non va bene la macchia in questo stile"), al suo posto un pannello chiaro pieno dietro la bottiglia accesa.
  Trappola trovata due volte oggi: un'immagine con height in percentuale dentro una griglia con la riga automatica prende la sua misura vera (bottiglie enormi, pagina larga 1872 px). Serve grid-template: minmax(0, 1fr) / minmax(0, 1fr). L'utente l'ha vista prima che la correggessi.

- 13 nov (28): critica-ui "vedi tu" sulle due versioni nuove, corretto subito: Fotografia: bottiglie delle carte al centro (la colonna della griglia si allargava alla foto: 40 px a destra; l'aveva notato anche lui), testi sotto i 15 px portati a 15, sfumatura scura sotto i nomi delle collezioni (sulle foto chiare non si leggevano), bottone "Vai alle collezioni" nell'apertura, al posto del marchio ripetuto nella presentazione i numeri veri (33 vini, 6 collezioni). Botanica: sul telefono via le piante vicine da apertura e sale (resta quella lontana, tono su tono), filetti bianchi semitrasparenti resi pieni, le foto in fondo ora sono quelle a 1080 px (assets/foto-ig; la cartella assets/botanica/foto non c'è più).
  "Il passaggio della chiazza da una pagina all'altra non la usare in botanica e fotografia": in js/nav.js la transizione versata non parte se body data-sito è b o f.
  Restano sotto i 15 px, nelle sezioni comuni e quindi in tutte le versioni: le etichette dei piatti (.tv-p, 13 px) e i nomi dei vini in tavola (.tv-b__n, 14 px, 12 sul telefono). Non toccati: sono di moderna-f, già visti da lui in Pittura.

- 13 nov (29): "dammi delle alternative più fighe con gsap, qualcosa di figo, sia per la scheda vino botanica che fotografia". Costruita UNA alternativa, "Palco", per tutte e due (js/pagine-bf.js, css/pagine-bf.css, classi .vq-*): la bottiglia resta al centro per tutta la pagina e passa da un lato all'altro, le scene (nome, racconto, calice e tavola, vigna e cantina, riconoscimenti) entrano dal lato che lascia libero, dietro il nome in grande attraversa lo schermo; tutto su una linea del tempo gsap legata allo scorrimento (scrub 0,7). Botanica: sul colore, la targa segue la bottiglia e la pianta ci cresce dentro. Fotografia: a "vigna e cantina" la foto del profilo si apre dal centro a tutto schermo.
  Si apre in Palco su desktop; "Pagina" (quella di prima) con &v=pagina, sempre sul telefono e con le animazioni ridotte. Selettore di prova .vp-alt sotto quello delle versioni: scelto uno, togliere l'altro e il selettore.
  Trappola ritrovata: translate del css + gsap che muove lo stesso elemento = gsap azzera il translate (il blocco "Nel calice" di Fotografia finiva fuori dal fondo; l'ombra della bottiglia, con calc() nel translate, si staccava). Ora quegli elementi sono centrati coi conti o con flex.
  Non costruite, proposte a parole: l'etichetta che si apre (la targa o il pannello si allarga fino a diventare la scena dopo) e la passeggiata orizzontale come in vino-e. Nessuna scheda della ricerca esterna copre la pagina prodotto.

- 13 nov (30): menu dei vini, tutti i siti: la bottiglia accesa non si alza più ("il primo vino è sempre più in alto delle altre"). Tolta la regola .cstage__wine.is-on img in css/nav.css; misurato su foto, botanica, moderna-e e index: fondi del vetro tutti alla stessa quota.

- 13 nov (31), dopo il push 3ea685f (non ancora online):
  a) Palco di Fotografia: "quando il testo va sul chiaro deve diventare nero alla fine dello scroll del palco". A "In vigna e in cantina" il testo era bianco fisso: se la scena era l'ultima (vino senza premi, es. Càla) la foto se ne andava e restava bianco su crema. Ora il colore segue la foto con la variabile --f (1 sulla foto, 0 senza), mossa da gsap a metà della dissolvenza; css con color-mix.
  b) Scheda Botanica, "Gli altri vini della collezione": "troppo pesante, ripensiamola" (dodici targhe scure su due righe). Ora, per Botanica e Fotografia: una riga sola, sei alla volta (tre e l'inizio della quarta sul telefono), frecce oltre i sei (.vp-fr, come .tv__fr), scorrimento nativo con scatto. Botanica: bottiglie in piedi su una linea sola, niente dietro; la targa col disegno cresce solo dietro quella indicata dal mouse. Fotografia: restano i pannelli chiari, bottiglie tutte alla stessa quota.
  c) la targa nella fila degli altri vini: fondo schiarito del 12% (.vp-altro__t, color-mix di --c2 col bianco) perché il disegno dentro non si vedeva. Solo lì: mega menu e scheda a comparsa tengono il tono di prima.

- 17 nov (32), cambio di progetto: "la parte dei disegni sta cambiando: acquerello, linea e dipinto non ci servono più, ma non li cancelliamo, teniamoli da parte. Restano Botanica e Fotografico; il Fotografico lo convertiremo in Pop, con un font più giovanile. Lo switch diventa il fulcro del progetto: un sito dinamico visibile in più mood, che si adattano ai linguaggi social del cliente. Va ripensato come una vera scelta di navigazione, qualcosa di interessante. Prima questo, poi il Pop".
  a) Da parte, non cancellate e non più collegate: Acquerello (acquerello.html, era index.html, con azienda-i e vino-i), Incisione (moderna-e.html, azienda-e, vino-e), Pittura (moderna-h.html, azienda.html, vino.html). Restano ai loro indirizzi.
  b) index.html è la scelta del mood: "Set the mood." (dalla frase del cliente "Wines that set the mood.") e una porta per mood, con la stessa bottiglia (Terra Malvasia Bianca) disegnata nella sua sala e fotografata a tavola. Sotto ogni immagine una fascia piena col nome nel carattere del mood. Markup in sections/mood.html, stile in css/nav.css (.mood).
  c) Le stesse porte si aprono dalla barra di ogni pagina: bottone "Mood Botanica" (.nav__mood, sul telefono solo il nome) che apre un dialog a tutto schermo (#mood-ov, <dialog> del browser). Ogni porta va alla stessa pagina dell'altro mood (home, o lo stesso vino). Ha preso il posto della pillola di prova .sito-alt, tolta.
  d) Passaggio: la porta scelta si apre fino a diventare la pagina nuova (passaggio fra documenti del browser, clip-path da dove stava la porta). Trappola trovata: il consenso @view-transition scritto in un file css viene annullato da Chrome se nel body c'è uno script ("opt-in disabled"); deve stare in uno <style> nella pagina (sections/_head.html). Parte solo dopo il clic su una porta: gli altri link cambiano pagina come prima. Firefox e Safari vecchi: cambio pagina semplice.
  e) Il mood resta in sessionStorage (fs-mood): azienda.html, una pagina sola per tutti e ancora di Pittura, prende il mood da cui si arriva e la barra riporta lì. Lì il bottone del mood non c'è.
  Un mood nuovo (o il Pop al posto di Fotografia) = una porta in sections/mood.html, una voce in SITI e MOOD di js/main.js.
  Da fare: Fotografia diventa Pop; l'azienda dei due mood (oggi è quella dipinta di Pittura); il 404 è ancora in stile Pittura.

- 17 nov (33), la scelta del mood rifatta: "avrei fatto qualcosa di differente di questa selezione, dai, impegnati" (le due porte affiancate del punto 32 b e c). Cosa cambia rispetto al 32:
  a) La scelta è una pagina sola, index.html (css/mood.css, js/mood.js): niente più dialog in ogni pagina e niente sections/mood.html. Il comando "Mood" della barra è un link che porta lì con ?ora=<mood>&b=<pagina>&f=<pagina> (js/main.js): la scelta riporta alla stessa pagina nell'altro mood, "Chiudi" torna indietro dov'eri.
  b) PROVA con tre versioni, nella fascia scura in alto (?s=sipario|lente|porte, resta per la sessione). In Sipario e Lente la bottiglia (Terra Primitivo) sta ferma al centro e i due mondi (sections/mondi.html) le stanno dietro: Botanica = sala Terra con la targa, Fotografia = quattro foto di Instagram col pannello chiaro. Stessa ossatura: immagini sopra la linea, fascia piena sotto con le scritte, bottiglia sulla linea.
     Sipario (quella che propongo): i due mondi affiancati, la linea passa dietro la bottiglia; si sposta col pomello (input range), trascinando ovunque o con la rotella; un clic su un lato, o la linea portata in fondo (oltre 90), fa entrare. Lente: un mood a tutto schermo, l'altro in un cerchio che segue il mouse; un clic lo allarga e i due si scambiano; pillola coi due nomi e un solo "Entra in ...". Porte: la versione del punto 32, per confronto.
  c) Il passaggio alla pagina scelta parte dalla forma scelta: il lato (Sipario), un cerchio dalla bottiglia (Lente), il riquadro (Porte), dall'alto quando si apre la scelta dalla barra. L'appunto in sessionStorage fs-mood-da ora è "da|a", due clip-path interi.
  d) Scartate prima di costruirle, con il motivo: la bottiglia a metà fra scontornato e foto (le due immagini non combaciano: nella foto di Terra Malvasia Bianca il collo è più lungo e l'etichetta più piccola, il Primaura fotografato ha la capsula bianca); la porta del marchio come finestra (è larga un quinto della torre: troppo stretta per far vedere un mood); una manopola (i comandi travestiti da oggetti li ha già bocciati).
  A scelta fatta: togliere la fascia .mood-prova, le due sezioni scartate in index.template.html e i loro pezzi in css/mood.css e js/mood.js.

- 17 nov (34), la scelta del mood rifatta ancora: "non mi piace, è un mappazzone di tutto; va bene la suddivisione in colonne che prendono tutto lo schermo, ma con effetti speciali" (le tre prove del punto 33, ora in _archivio-prove/mood-17nov-sipario-lente-porte, fuori da git).
  a) index.html: colonne a tutto schermo, una per mood, e nient'altro (via barra chiara, titolo, bottiglia, targa, pannello, pomello). Marchio nudo in alto al centro, in basso il nome nel carattere del mood, una riga e "Entra"; il titolo "Scegli il mood" c'è solo per i lettori di schermo. Ogni metà dello schermo è un link intero.
     Botanica = la "sala" delle sue pagine (muro, ripiano, pianta: da js/dati-bf.js, la scrive js/mood.js); Fotografia = le foto di Instagram con la sfumatura scura sotto il testo, come la sua apertura.
  b) PROVA con due effetti, fascia scura in alto (?s=onda|cambio). Onda: due colonne, il confine è elastico (due molle: gli estremi e il punto all'altezza del puntatore), la colonna su cui si passa si allarga, la foto si avvicina e la pianta cresce; le due colonne cambiano a turno (una sala per collezione, tre foto); al clic l'onda copre lo schermo e la pagina compare in dissolvenza (terzo campo dell'appunto fs-mood-da: "da|a|opacità").
     Cambio: quattro colonne, due per mood (sul telefono le due di mezzo); il mood su cui si passa si prende una colonna dell'altro, il foglio colorato scorre sulla foto o se ne va; al clic se le prende tutte e la pagina sale da sotto. A scelta fatta: togliere l'altra sezione, la fascia e i suoi pezzi in css/mood.css e js/mood.js.
  c) Corretto strada facendo: arrivando col passaggio animato la barra di Botanica restava chiara (js/nav.js guarda cosa c'è sotto la barra, e durante il passaggio non vede niente): a passaggio finito sections/_head.html manda un evento scroll. tools/cdp.mjs: una cattura chiesta mentre la pagina cambia non tornava più (ora 8 secondi e va avanti).
- 17 nov (35), le piante VERE di Botanica: "qui trovi le grafiche vere per Botanica, C:\Users\Utente\Downloads\all.ai; non le metterei tagliate così come le stai mostrando".
  Il file (pdf compatibile, 12 fogli 1080 x 1350: copertina e testo delle sei collezioni) ha le piante in vettoriale, intere: due rami specchiati che si incrociano alla base; il fico d'India è un'immagine a retino a 1 bit.
  tools/botanica_vere.py <all.ai> le riscrive in assets/botanica con gli stessi nomi (quelle di tools/botanica.py, da tavole di pubblico dominio, restano nella storia di git) e stampa le proporzioni, riportate in js/dati-bf.js (ar).
  Così cambiano in tutte le pagine di Botanica (home, pagina del vino, menu dei vini). Nella scelta del mood si vedono intere: il riquadro della pianta è lo spazio libero fra il marchio e il ripiano. Nella home di Botanica le piante grandi ai lati restano tagliate dal bordo come prima: da chiedere.
  Non toccati, ma il file li dice: i caratteri veri (Alex Brush per "The", Kaio per i titoli, Poppins per i testi; oggi Botanica usa Pinyon Script e Montserrat), i colori esatti (muro e sagoma: quasi uguali a quelli campionati), la sagoma vera della targa (25 curve, 941 x 1035) e l'opacità delle piante (moltiplica, dal 30 al 50%).
  In attesa: l'utente spiegherà le modifiche da fare ai due mood ("ora finisci e ti spiego le modifiche da fare poi per entrambi i mood").

- 17 nov (36), Botanica in VERTICALE: "non deve esserci più un racconto orizzontale ma verticale, usando le grafiche di Botanica e queste (C:\Users\Utente\Downloads\transfer-01a1e8e7\Archivio), le immagini generate per ogni sezione; in una maniera figa senza precedenti, qualcosa di fresco, o che come racconto si avvicina a klimtwine.com/en". In sospeso, detto nello stesso messaggio: "ci vanno messi i vini comunque nella prev di Botanica" (la colonna di Botanica nella scelta del mood), "ce ne occuperemo dopo".
  Materiali: Archivio = 20 post di Instagram, quattro per collezione (luxury, lounge, classic, international, organic; Terra non c'è: per Terra tavola.webp e rosato.webp di assets/foto-ig). tools/botanica_post.py li porta a 4:5, 800 x 1000, in assets/botanica/post (i reel tagliati al centro; marchio e castello stampati nelle foto restano, sono i post del cliente). Testi: le sei schede di testo di all.ai, parola per parola. La forma vera della targa (il ritaglio di 25 curve delle copertine, 941 x 1034) ora è --sagoma in css/nav.css.
  Pagina (sections/botanica.html, css/botanica-v.css, js/botanica.js; prefisso rv: "bv" era già la sezione dei più venduti, che js/tavola.js cerca): apertura = copertina del sito (targa vuota col titolo, la pianta intera ai lati, cambia colore da sola), poi sei capitoli nell'ordine del file del cliente (Luxury, Lounge Bar, Classic, Terra, International, Organic).
  Schermi larghi (almeno 1100 x 560, .rv--desk): palco fermo come i capitoli di klimtwine. Per ogni collezione sale una fascia nel colore della sua pianta con le sue fotografie; dietro la fascia c'è già il capitolo nuovo (il confine sta a metà della fascia), così la targa resta al centro e cambia colore da sotto in su. Poi la pianta cresce nella targa, il titolo della scheda di testo sale lettera per lettera, le bottiglie salgono sul ripiano (quante ne stanno col nome sotto, al più sei; "Altri N vini"), il racconto si accende parola per parola. Colonne: a sinistra numero, "The" + nome della copertina, titolo, nome del catalogo; a destra il racconto (il carattere scende fino a 13,5 px se non ci sta); sul ripiano nomi dei vini e bottoni. Pillola delle collezioni in basso. Unità: 0,4 schermi di apertura, poi per collezione 1 di cambio e 0,8 di lettura (11,25 schermi in tutto).
  Telefono, tablet, finestre basse, animazioni ridotte: niente palco, i capitoli uno sotto l'altro (fotografie in griglia, copertina coi vini, racconto sul ripiano), stessi ingressi quando entrano in vista; header pieno (senza palco il racconto è lungo e il testo ci passerebbe sotto).
  Insieme: Botanica usa il corsivo vero del cliente (Alex Brush, al posto del Pinyon Script) anche nella pagina del vino; nella targa (scheda, più venduti, menu, pagina del vino) una pianta sola intera al centro, perché quelle vere sono già due rami specchiati. Il racconto orizzontale è da parte in botanica-oriz.html (+ sections/botanica-oriz.html, js/botanica-oriz.js), non collegato.
  Provato senza errori: 1100x700, 1366x650, 1536x730, 1920x1080, 390x844 e 360x640 al tocco, movimento ridotto, scheda del vino, "Altri vini", pagina del vino, menu, scelta del mood, foto.html. Non visto su telefono vero né Safari; i passaggi giudicati su fotogrammi fermi.
  Nello stesso trasferimento c'è anche swisstransfer_8d349188-...: 91 foto originali dello shooting (_DSC*.jpg, 14-25 MB): non usate, utili per Fotografia/Pop.

- 17 nov (37), Botanica verticale bocciata come impostazione: "fammi alternative, tu hai fatto altro che prendere la versione orizzontale, impostarla in verticale e metterci le foto in mezzo in riferimento al set, usando sempre i vini appoggiati lì per ogni collezione: dobbiamo uscire da questo setting"; e, mentre lavoravo: "anche dall'utilizzo stesso delle grafiche: guarda quanto sono belle, le mettiamo a destra o a sinistra o al centro in una forma".
  Guardate le pagine del cliente in all.ai (ai-vista nel blocco degli appunti): le piante sono enormi, tono su tono (più scure del fondo), a tutta pagina, a volte specchiate ai bordi; il testo bianco ci sta sopra, centrato. Nessuna targa attorno al testo.
  Il verticale col set (targa al centro, ripiano, bottiglie, fascia di foto fra i capitoli) è in _archivio-prove/botanica-17nov-set-verticale (+ LEGGIMI.txt).
  Ora tre prove sullo stesso markup (sections/botanica.html, prefisso erb: "bt" è già in css/base.css), scelte dalla pillola "Prova" in basso a sinistra (?s=):
  * Mezzatinta (palco fermo): pagine a tutto schermo come i post di testo del cliente; si entra in una collezione attraverso la sua pianta, che compare intera al centro e cresce, e nei suoi puntini c'è già la pagina nuova; le foto compaiono dentro la sagoma della pianta della pagina e poi la sagoma cresce fino a scoprirle, due alla volta (poi le altre due salgono).
  * Specchio (palco fermo): una rivista aperta; a sinistra apertura, poi per collezione copertina, testo, la pianta da sola (toni invertiti), i vini a carta (uno per riga, oltre nove in due colonne); a destra l'indice delle sei collezioni a fasce colorate, poi le foto. Scorrendo la sinistra sale e la destra scende, e a ogni passo tornano affiancate. Terra (due foto): copertina e testo coi vini.
  * Discesa (niente palco): ogni collezione è una pagina lunga con la sua pianta larga quasi quanto lo schermo, intera, che scorre più piano; il fondo della sezione passa da un colore all'altro a cavallo dei confini (in oklab: in rgb fra bordeaux e verde veniva un viola fangoso); titolo a sinistra, racconto a destra, foto sfalsate come in una rivista, vini in fondo.
  In comune: apertura coi sei mood a toni invertiti (fondo scuro, pianta chiara) che si danno il cambio; i vini per nome (clic: la scheda, la bottiglia esce dal nome; "Tutti i N vini" apre la cantina); pillola delle collezioni. Telefono e movimento ridotto: le stesse pagine una sotto l'altra (Mezzatinta conserva l'ingresso dalla pianta mentre la pagina sale).
  Provato senza errori: 1440x810, 1920x1080, 1100x600 (carattere del racconto 15-18 px, i vini mai sotto la pillola), 390x844 al tocco (niente scorrimento orizzontale), movimento ridotto, scheda dal nome, vino-b, index. Lunghezza sul palco: Mezzatinta 11,8 schermi, Specchio circa 13.
  Restano: la scheda del vino ha ancora la targa dietro la bottiglia (in comune con vino-b); i vini nell'anteprima di Botanica della scelta del mood ("dopo").

- 17 nov (38), "scelgo discesa come modello". Botanica è Discesa e basta: via la pillola "Prova", Mezzatinta e Specchio (in _archivio-prove/botanica-17nov-tre-prove, + LEGGIMI.txt), via il palco e il contenitore erb-palco; js/botanica.js e css/botanica-v.css riscritti per la sola Discesa (selettori senza erb--ds).
  Promesso nel giro prima ("la cambio in base alla prova che scegli"): la scheda del vino della home non ha più la targa, dietro la bottiglia c'è la pianta intera nel colore della collezione sul crema (.erb-zp); nella pagina del vino (vino-b) la targa dietro la bottiglia grande perde forma e fondo e resta la pianta tono su tono sul colore della collezione (css/pagine-bf.css, .page-vb .vp-targa).
  Lasciate com'erano le targhe piccole: menu dei vini e più venduti (avevano preso il posto delle macchie il 13 nov) e la fila "Gli altri vini della collezione" della pagina del vino (compare al passaggio del mouse).
  Provato senza errori: 1440x810 (apertura, copertina, titolo, foto, confine, Terra, scheda dal nome), 390x844 al tocco (niente scorrimento orizzontale), movimento ridotto, vino-b su desktop e telefono.
  "Come modello": forse vale anche per l'altro mood (Fotografia → Pop); non toccato, in attesa delle sue modifiche. Sempre in sospeso: i vini nell'anteprima di Botanica della scelta del mood.

- 17 nov (39), prova 3D: "riesci a fare una di queste bottiglie in 3d e me la fai vedere?". Fatta la Collezione 53 Primitivo su bottiglia-3d.html (pagina a sé, non collegata; bottiglia-3d.template.html, js/bottiglia-3d.js).
  I pezzi dalla foto del catalogo, che non si tocca: tools/bottiglia_3d.py <foto> <uscita> <riga inizio etichetta> <riga fine etichetta> <riga fine capsula> → assets/3d (profilo .json, etichetta srotolata, maschera del rame).
  Il profilo (dalla trasparenza della foto, senza il riflesso semitrasparente sotto) gira attorno all'asse e fa vetro e capsula; l'etichetta è la foto srotolata da -70° a +70°, poi nero fino a 220° di giro, dietro vetro: il retro non c'è in nessuna foto.
  I disegni in rame sono metallo (maschera: pixel chiari e caldi), le scritte no. Il castello sulla capsula è assets/logo/feudi-marchio.svg messo dove sta in foto (quota e altezza in js, misurate).
  Luci: RoomEnvironment di three più due pannelli alti ai lati (le due strisce lunghe sul vetro, come nelle foto). three@0.160.0 da unpkg con importmap, come le altre librerie del sito.
  Movimento: dondola di circa 30° per lato attorno al fronte; trascinando gira tutta (col dito in orizzontale; frecce da tastiera), lasciata resta 2,5 s e torna di fronte. Animazioni ridotte: ferma, resta dove la si lascia. Se il 3D non parte resta la foto.
  Provato senza errori: 1440x810 (anche trascinata), 390x844 al tocco (bottiglia nei due terzi alti, testo sotto), movimento ridotto. Non visto su telefono vero né Safari; la nitidezza dell'etichetta è quella della foto da 653 px.
  Per un'altra bottiglia: tre righe da misurare sulla foto e la posizione del castello; capsule o etichette di forma diversa possono chiedere ritocchi.

- 17 nov (40), tre correzioni alla bottiglia 3D: "le etichette finiscono qui, il pezzo in più non serve" (su un ritaglio del pannello nero che avevo aggiunto ai lati), "hdr è una merda e l'obiettivo 200mm".
  Etichetta: finisce dove finisce la foto (77° per lato, 154° in tutto), niente carta inventata; oltre e dietro solo vetro. Per srotolarla dritta fino al bordo lo strumento ora tiene conto della prospettiva della foto:
  i bordi dell'etichetta in foto curvano (quello alto scende di 18 righe ai fianchi, quello basso sale di 8), da cui macchina a 1512 px dall'asse (1,75 altezze di bottiglia) e occhio alla riga 685. Nuovi argomenti:
  python -I tools/bottiglia_3d.py assets/bottles/primitivo53.webp assets/3d/primitivo53 --etichetta 457 792 --curva 18 8 --capsula 228 --castello 171 198 (quote vere di etichetta, capsula e castello nel .json).
  Luci: via RoomEnvironment (riflessi a scatole). Lo studio è dipinto in HDR dentro js/bottiglia-3d.js (mappa equirettangolare di numeri, nessun file), ed è il set della foto del catalogo letto dai suoi riflessi angolo per angolo:
  fascia chiara e netta da -50° a -28° (bank grande a sinistra, azimut da -100° a -56°, forza 8), fascia grigia da +15° a +45° (pannello debole a destra, forza 0,7), bordi accesi oltre 72° (fondale bianco dietro, forza 0,8).
  Su un cilindro una luce all'azimut A si riflette all'angolo A/2. Carta e capsula hanno una mappa a parte con in più la luce larga davanti (il vetro non la riflette) e specularIntensity basso, se no il nero diventa grigio.
  Misurato sul fotogramma: la fascia chiara viene 178-187 di luminosità, in foto 181-186.
  Macchina: camera.setFocalLength(200) (pellicola da 35 mm di three), 3° sopra l'orizzonte perché si veda l'ombra a terra. Col 200 mm i bordi dell'etichetta sono dritti; in foto curvano perché è scattata da vicino.
  Provato senza errori: 1440x810 di fronte, girata di lato e di spalle, 390x844 al tocco, movimento ridotto. Restano sfocati gli ultimi gradi dell'etichetta (pixel schiacciati in foto).

- 17 nov (41), Botanica Discesa: "ti ho detto che qui avrei voluto vedere le bottiglie di vino" (sul blocco "I vini" coi nomi), "lo scroll mi piace, diamo priorità alle foto, il racconto è foto e bottiglia".
  Ogni collezione ora: copertina sulla pianta, poi righe alterne foto + bottiglia (foto a 5 colonne, intera sotto l'header: i post hanno scritta e logo, non si tagliano; bottiglia a metà altezza
  dall'altra parte, con nome e denominazione sotto; clic = scheda), il racconto del cliente dopo le prime due righe, poi le altre righe. Accanto a ogni foto la bottiglia che ci si vede
  (data-vino sulle foto, controllato guardandole); alle foto senza bottiglia riconoscibile i vini che restano; i vini senza foto a coppie di sole bottiglie; al massimo sei bottiglie,
  "Tutti i N vini" solo dove sono di più (Classica 13, Terra 7). Le due Primaura hanno nome e denominazione uguali: sotto le uve. Righe fatte da js/botanica.js (.erb-storia, .erb-riga data-tipo fb/ff/bb/f, is-dx).
  Le bottiglie stanno lontane dal centro perché la pillola fissa in basso non copra i nomi: misurato riga per riga (riga centrata, animazioni ferme) a 1280x720, 1366x768, 1440x810, 1920x1080, 390x844, 360x740 nessun nome coperto;
  a 1100x600 il nome su tre righe della seconda Primaura tocca la pillola di 2 px. Collezioni più lunghe: 4,6-6,7 schermi l'una (prima circa 4,5).
- 17 nov (42), scheda del vino: "quando apro una bottiglia c'è sto rettangolo". Il fondo crema del riquadro dei testi arrivava col velo ma stava sopra il velo, quindi a metà apertura e chiusura faceva un riquadro più chiaro. Ora c'è solo a velo pieno (css/fiaba.css, .fb-zoom--pulita: vale anche per le altre pagine con la scheda pulita). Provato a 200 e 450 ms dall'apertura e a 420 e 720 ms dalla chiusura, 1920x1080 e 390x844: niente riquadro.
- 17 nov (43), header: "allo scroll togliamo il fondo colorato, usiamo un glass verso il trasparente". css/nav.css: niente più fondo pieno con .is-solid; un ::before con backdrop-filter blur(18px) e una velatura neutra (nera .46 sulle sezioni scure, bianca .5 sulle chiare) che continua 36 px sotto la barra e sfuma (mask). Il nero a .46 e non meno: con .28 il bianco dei link non si leggeva quando sotto passava una foto chiara (marmo, piscina, scacchiera). Con menu o cantina aperti (html.nav-lock) il fondo resta pieno, la barra fa un foglio solo col pannello. In Botanica la fascia crema dell'header con la scheda aperta resta solo dove non c'è il vetro (orizzontale). Provato 1440x810 (Botanica, Fotografia, vino-b) e 390x844 col menu: nessun errore.
- 17 nov (44), header: "magari non facendo vedere la linea della sfumatura verso il trasparente". La sfumatura del vetro era lineare su 36 px: si vedeva dove cominciava a calare. Ora è morbida all'inizio e alla fine (smoothstep, --nav-sfuma in css/nav.css) e più lunga (64 px sotto la barra). Confrontato ingrandito sopra la foto arancione, la pianta e la sezione chiara, e sul telefono: nessuna linea, nessun errore.
- 17 nov (45), Fotografia verso Pop, l'apertura. Richieste in fila (stessa sera): "la hero fotografica va cambiata, va resa più pop, più giovanile: userei il 3D del vino in una navigation motion,
  muovendolo un po' come klimtwine.com/en" (studiato dal vivo: bottiglia sul tralcio, si inclina e gira attraversando un testo, poi in piedi per ogni vino col nome grande dietro, fondo del colore del vino);
  bocciata la prima prova a tre fondi (rosso, azzurro, rosa) con ombra a terra: "non userei tutti quei colori, non metterei l'ombra finta, eviterei 200 colori per sezione anche quelli sotto; sì questo tipo
  di animazione ma non uguale a Klimt: inventa"; poi "le foto dello shooting nella navigation motion, magari effetto webgl"; bocciata anche la seconda (rosso, foto che saltano fuori dalla bottiglia e si
  sparpagliano): "il fondo deve essere bianco, e le foto messe così senza un contesto, senza una storia, allo scroll a caso"; poi "un ramo, qualcosa della vigna in 3D", l'esempio sweet-tape.com (parole
  giganti che scorrono di lato, accanto a ognuna la foto del prodotto in uso, i rotoli 3D che si muovono con loro), "una scena come se il vino rotolasse sulla superficie, facesse apparire il testo, uscisse
  e riapparisse dall'altra parte", "una versione pop con questi effetti" (immagini di glass refraction: vetro rigato).
  Ora (sections/foto.html .fo-apre, css/foto.css, js/foto.js, js/foto-3d.js; la bottiglia in js/bottiglia-3d-kit.js, senza ombra anche in bottiglia-3d.html): palco fermo di 5,8 schermi su fondo bianco,
  e bianca tutta la pagina di Fotografia (--cream: #fff; cantina e news non più marroni). a) la frase del profilo "Wines that set the mood." in Bricolage strettissimo alto un terzo di schermo scorre di lato
  (.fo-pista); fra le parole un grappolo 3D (acini fatti nel modulo, al posto di .fo-pista__uva) e cinque foto dello shooting, ognuna col vino che ci si vede in didascalia (da js/data.js, link alla
  pagina del vino): Marpiccolo, 125 Bianco Organic, Appassimento, Gocce, Collezione 53 Primitivo (la bottiglia del 3D, nel mappamondo bar). Le foto le disegna WebGL negli stessi riquadri delle immagini,
  dietro un vetro rigato che le copre entrando da destra e scivola via quando il loro centro passa il 45% dello schermo (più si va veloci, più rifrange). La bottiglia davanti, parole e didascalie dietro;
  col mouse guarda il puntatore, con la velocità della pista si piega all'indietro. b) sdraiata sul piano rotola via a destra, rientra da sinistra e scopre la presentazione dove passa (taglio del testo
  legato al suo centro), esce; c) rientra e si ferma sul suo capitolo scoprendone il nome. Rotolando gira di quanto si sposta diviso il raggio (0,105 dell'altezza), etichetta di fronte all'arrivo.
  Telefono: parole in alto, bottiglia sotto già all'apertura. Animazioni ridotte: cinque momenti fermi (a, metà pista, fine pista, b, c). Foto: tools/pop_foto.py <cartella originali> → assets/pop
  (880 x 1100, 51-92 KB, solo taglio); le tre provate e tolte (tuffo, raso, smoking) in _archivio-prove/pop-foto-17nov. Il gioco della bottiglia e la capriola della seconda prova non ci sono più.
  Provato senza errori: 1440x810, 1920x1080, 1100x600, 390x844 e 360x740 al tocco, movimento ridotto, sezioni sotto, bottiglia-3d.html. Non visto su telefono vero né Safari.
- 17 nov (46), DA FARE, annotato dall'utente: "fare altre bottiglie 3D e metterle nell'hero come se fossero appoggiate sulla superficie, possibilità di muoverle con il mouse, e allo scroll scorrono tutte
  verso destra uscendo dallo schermo". Non ancora fatto. Per farlo: ogni bottiglia nuova esce da tools/bottiglia_3d.py <foto del catalogo> <uscita> --etichetta <riga inizio> <riga fine> --curva <su> <giù>
  --capsula <riga> --castello <quota> <altezza> (righe da misurare sulla foto, come per primitivo53); js/bottiglia-3d-kit.js prende già il percorso (creaBottiglia(renderer, base)), ma il vetro oggi è sempre
  scuro pieno di rosso (0x0b0706): per i bianchi e i rosati serve il colore del vetro e del vino nel .json. Bottiglie di forma diversa (Marpiccolo, le 125) e capsule o etichette sagomate possono chiedere
  ritocchi allo strumento. Nell'apertura di oggi (45) la Collezione 53 è sola: le altre andrebbero sdraiate o in piedi sul piano bianco accanto a lei, trascinabili col mouse (sul telefono da decidere:
  col dito si scorre la pagina), e con lo scorrimento scivolano tutte a destra fuori dallo schermo.
  Riferimento, detto da lui: sweet-tape.com ("aggiungi vedere sweet-tape.com come riferimento"). Lì i rotoli di nastro sono modelli 3D (glb): uno appoggiato in fondo all'apertura, una fila che rotola
  insieme alle parole giganti, e in fondo alla pagina un mucchio di rotoli che si assestano come oggetti veri. Da guardare dal vivo prima di cominciare: se si trascinano e come reagiscono (non l'ho verificato).
- 18 nov (47), le altre bottiglie in 3D, primo passo della (46): "partiamo dal fare gli altri 3d delle bottiglie, prendi un bianco, un rosa e un vino speciale". Fatte Marpiccolo (Fiano, bianco),
  Tre Cuori (Rosa di Primitivo) e Philia (Primitivo di Manduria Dolce Naturale DOCG, l'unico dolce del catalogo), dalle foto del catalogo in assets/bottles (non toccate) → assets/3d/marpiccolo, tre-cuori,
  philia (comandi in testa a tools/bottiglia_3d.py). Prova da sola: bottiglie-3d.html (non collegata, fondo bianco come Pop): le quattro in fila con le altezze vere (il collo sotto il tappo è uguale per
  tutte), ognuna si gira trascinandola, sul telefono due per riga. Ancora NON nell'apertura di Fotografia: è il passo dopo (appoggiate sul piano, trascinabili, via a destra allo scorrimento).
  Strumento: --lati (etichette frontali che non girano tutto il fronte), --metallo rame|oro|no (oro: le X di Tre Cuori, anche quella pallida), carta chiara o scura riconosciuta da sola,
  --vetro/--vuoto/--livello (vetro chiaro), --capsula-metallo (stagnola di Philia), --fascetta (DOCG, srotolata e chiusa tutto attorno). Rifatta la Primitivo col nuovo strumento: texture e profilo
  identici al byte (il suo json resta quello del 17, senza i campi nuovi). Vetro chiaro: il colore della foto per ogni distanza dall'asse, vista dalla macchina, diventa un velo (colore + trasparenza che sul
  bianco ridanno la foto: reso 251,245,205 contro 251,245,204 in foto); sopra il livello il collo vuoto; si vede il retro dell'etichetta quando gira. Carta bianca: con lo studio della Primitivo usciva
  grigia e sbiadita, e bruciava a sinistra: luce sua (luceBianca, tanta diffusa + una larga davanti a sinistra), niente tone mapping; il profilo di luce dell'etichetta ora segue la foto (252→232 contro
  252→236). Capsula bianca: il colore della foto (reso 232 contro 233). Castello: la lamina resta l'oro del marchio, l'inchiostro prende il colore della foto (Marpiccolo azzurro). Le luci si dipingono una
  volta per renderer (più bottiglie nella stessa scena). Provato senza errori: 1440x810, 2600x1460, 390x844 al tocco, movimento ridotto, bottiglia girata di spalle; foto.html e bottiglia-3d.html
  invariate. Non visto su telefono vero né Safari. shortcut: oltre le etichette e sul retro solo vetro (una foto sola); il velo è giusto sul bianco, sopra le parole nere le schiarisce un po' invece di
  lasciarle nere come farebbe il vetro vero.
- 18 nov (48), bottiglia vera in Blender: "per un risultato ottimale e realistico? Blender?", poi "lascia stare le etichette, mi interessa la bottiglia in sé". tools/bottiglia_blender.py
  (Blender 4.5 portatile di Downloads/chicco-uva-3d, Cycles sulla RTX 4080, 8 s a immagine) costruisce dal profilo di assets/3d/<nome>.json una bottiglia fisica: vetro con spessore (3 mm,
  5 nel collo, 6 sul fondo, stimati), fondo rientrante 13 mm, vino come liquido fino al livello col menisco (colore dal velo del json), capsula con le pieghe in fondo, castello del marchio;
  l'etichetta resta quella srotolata dalla foto. Studio come il catalogo: fondale bianco largo, strisce solo per i riflessi, luce davanti che non si specchia; attraverso il vetro si vede
  bianco tutto attorno (tipi di raggio di Cycles). Trappole trovate: il colore base 0,8 di Blender tinge il vetro trasparente a ogni superficie (va bianco); le strisce laterali bruciavano
  la capsula bianca; la luce davanti rimbalzava dentro il vetro (rettangolo bianco). Fatte Tre Cuori e Marpiccolo: tools/blender/tre-cuori.png, marpiccolo.png, confronto con foto e
  3D della pagina in tools/blender/confronto-tre-cuori.jpg. Philia (vetro scuro, fascetta) non provata in Blender. Da decidere con lui: nell'apertura fotogrammi resi in Blender
  (fotografici, si spostano come immagini, il giro è una sequenza) o lo stesso modello nella pagina con vetro in tempo reale (tutti i movimenti, meno fotografico).
  18 nov, giro: "voglio vederla online che gira, quella di Blender è molto più realistica, quanto pesa?". bottiglia_blender.py --giro 72 (una vista ogni 5°, piatto girevole: luci e
  macchina ferme; 72 viste in circa 15 minuti) → tools/giro_web.py → assets/giro/tre-cuori/g (316x1100, 658 KB in tutto) e p (178x620, 313 KB, telefono). Pagina di prova
  bottiglia-giro.html (js/bottiglia-giro.js): gira da sola (un giro ogni 12 s, due viste vicine sfumate fra loro), si trascina, frecce; animazioni ridotte = ferma. Locale, non pubblicata:
  il sito su GitHub Pages ha 74 file locali non pubblicati di altri lavori; per metterla online va chiesto (si può pubblicare solo questa pagina).
  18 nov, spessori: "metti uno spessore al vetro 0.2, un piccolo spessore sul collo dell'etichetta e un po' di spessore sull'etichetta". Letto così: vetro 2 mm (0,2 come
  in Blender, in cm; prima 3 mm e 5 nel collo; il fondo resta 6 mm), la capsula ("l'etichetta del collo") 0,4 mm sopra il vetro con lo scalino del bordo in fondo, l'etichetta un foglio
  di 0,4 mm (fronte con la grafica, retro e quattro bordi di carta: foglio() in tools/bottiglia_blender.py). Rifatte le 72 viste del giro.
- 18 nov (49), DECISO per il sito: "le dobbiamo usare sul sito, fargli fare movimenti: vedi tu", poi "la miglior resa per il web al minimo peso, senza che si blocchi la pagina".
  Le 72 immagini di Blender sanno solo girare (e pesano 691 KB a bottiglia, a scatti): restano una prova. Sul sito il 3D della pagina con la PELLE DI BLENDER: bottiglia_blender.py --velo
  fa vetro, vino e capsula senza etichetta né castello, di fronte in proiezione parallela, sul bianco e sul nero (attraverso il vetro nero); tools/velo_blender.py ne fa una tabella colore +
  trasparenza per altezza e distanza dall'asse (assets/3d/<nome>-velo.webp, 256 x 1024, webp 92 con trasparenza esatta: 75 KB Tre Cuori, 67 Marpiccolo; "velo2d": true nel json) che
  il kit stende sul vetro (PELLE_F); etichetta e castello restano 3D. Provato su bottiglia-giro.html (a sinistra le immagini, a destra il 3D, stesso angolo): corpo uguale al pixel
  (255,212,203), etichetta allo stesso punto a 90/180/270°, retro dell'etichetta tinto del vino e a poca luce (207,138,122 contro 199,134,122 di Blender). Il vino non fa da lente nel 3D
  (il retro dell'etichetta in Blender è un filo più largo). Peso: luci dello studio a 512 x 256 e dipinte solo quando servono: prima bottiglia 87 → 23 ms, le altre 7-10 ms (su questo
  computer; un telefono 4-5 volte di più). Fatte Tre Cuori e Marpiccolo; da fare: Philia e Collezione 53 (vetro scuro in Blender mai provato, fascetta DOCG da aggiungere allo script),
  poi metterle nell'apertura Pop coi movimenti (appoggiate, trascinabili, via a destra), un solo renderer, shader compilati senza bloccare (compileAsync).
  18 nov, tutte e quattro con la pelle di Blender ("qui adesso sono tutte fatte in Blender?"): vetro scuro anche lui trasparente, foglia morta letta sul collo vuoto di Philia in foto
  (65,50,0 attraverso due pareti), vino rosso quasi nero dentro, livello 1,3 cm sotto la capsula come in foto; stagnola di Philia argento lucido (ruvidezza 0,1: strisce nette come in foto);
  la capsula non si specchia più (sulla spalla scura il suo riflesso faceva un pallino nero, come un buco). Pelli: Collezione 53 20 KB, Philia 21, Marpiccolo 67, Tre Cuori 74. La pelle vale
  anche nell'apertura di Fotografia (la Collezione 53 gira scorrendo) e in bottiglia-3d.html (bordeaux): provate senza errori. Etichette e fascetta di Philia restano 3D del kit.
  18 nov, correzioni sue dopo le quattro pelli: "vanno aggiustati i riflessi sulle bottiglie nere come il WebGL" → Collezione 53 e Philia SENZA pelle ("velo2d" tolto dai json),
  col vetro scuro del kit (studio SET letto sulla foto: fascia chiara a sinistra, corpo rosso scuro); pelli scure in _archivio-prove/pelle-scure-18nov. "I colli troppo realistici,
  rendiamoli lisci perfetti" → capsula senza pieghe, spigolo in fondo netto (set_sharp_from_angle) e vetro che non si stringe più sotto la capsula (la fessura faceva una riga scura).
  "La bottiglia col vino bianco è in sovraesposizione" → in tools/bottiglia_blender.py: luci invisibili attraverso il vetro (le strisce viste nel vino facevano i bordi bianchi),
  tenda grigia ai lati (TENDA 0.5: i bordi scuriscono come in foto), strisce 6 e 3 invece di 220 e 45 (bruciavano in righe bianche), vino tarato sul misurato (FONDALE 0.944 invece
  di 0,9 stimato), luce da sinistra solo per la capsula (chiara a sinistra come in foto). Alla quota del velo: Marpiccolo 248,245,206 contro 250,245,206 della foto, bordo 189 contro
  193; Tre Cuori 247,195,183 contro 246,194,182. Pelli: Marpiccolo 60 KB, Tre Cuori 59 (quelle con le pieghe in _archivio-prove/pelle-con-pieghe-18nov). Le 72 viste del giro e le
  immagini ferme in tools/blender/ sono ancora quelle di prima (pieghe, luci forti): non rifatte.
- 18 nov (50), apertura Pop: "innanzitutto togliamo sto grappolo, togli le foto con le glass refracted, non era così che lo volevo". Tolti dalla pista il grappolo 3D e le cinque foto dello
  shooting dietro il vetro rigato (markup in sections/foto.html, codice in js/foto-3d.js, stili in css/foto.css, didascalie in js/foto.js); restano le parole giganti e la bottiglia.
  Versione di prima in _archivio-prove/pop-17nov-grappolo-foto-vetro; le foto in assets/pop restano lì. Errore di lettura: il vetro rigato (esempi "Glass Refraction" mandati il 17 alle 18:46)
  era per "poi fare una versione pop usando sti effetti", una versione a parte, non per le foto dell'apertura.
  DA FARE, annotato da lui (18 nov): 1) le bottiglie scorrono su un piano e scoprono i testi, spariscono dal bordo destro dello schermo e riappaiono da sinistra nella seconda sezione;
  2) magari una scena con una delle bottiglie che versa il vino: con l'AI (Higgsfield, ma prima il conto di quanto si consuma su Comfy) oppure rendendo vive le bottiglie delle foto col 3D
  (la bottiglia si sposta, esce, versa). Conto dato il 18 nov coi prezzi Comfy letti il 27-28 ott (lib/studio.ts di ManyTask): Kling 4.0 1,13 $ per 5 s, Veo 3.1 Fast 0,80 $ per 8 s,
  Veo 3.1 3,20 $ per 8 s, Higgsfield Genjutsu (rigira un video che serve già) 4,87 $ per 5 s a 720p e 11,67 $ a 1080p; il 3D nella pagina non costa niente.
- 18 nov (51), PROVE dell'apertura Pop: "il sito deve essere un mix di entrambi [sweet-tape e klimtwine] dove useremo le foto ... versioni differenti: la bottiglia che esce dalla foto
  ed è il 3D; una versione con tutte le bottiglie 3D che escono da sotto, rotolano insieme nella hero verso destra, escono e poi parte la seconda scena che faremo da 0; non usare Higgsfield,
  vedi tu (magari Veo/Omni); tutto in motion design; fammi delle prove". pop-a.html e pop-b.html (template, js/pop-prove.js, css/pop-prove.css; base css/foto.css), non collegate.
  A) foto di Philia dello shooting (_DSC8100, l'unica con una delle quattro bottiglie 3D in piedi e di fronte) fra le parole giganti; il 3D le sta incollato sopra invisibile, dal 6% al 30%
  della pista salta fuori con un giro e si allunga (in foto la bottiglia è più larga: 0,32 contro 0,25 di larghezza su altezza, schiaccia e allunga), nella foto resta il posto vuoto
  (assets/pop/philia-vuota.webp: tools/pop_senza.py, Nano Banana Pro su Comfy Cloud, UNA generazione, circa 0,17 $, poi pixel veri fuori dalla maschera). Poi come foto.html con Philia.
  Differenza: nello shooting Philia ha capsula nera e scritta a sinistra, il 3D (foto del catalogo) capsula argento e scritta a destra; al salto si nota poco perché gira.
  B) le quattro salgono dal basso all'apertura (in fila a sinistra), scorrendo rotolano a destra e dove passano dipingono il quadro (Wines [Tre Cuori, _DSC8072] that set / [Philia] the mood.),
  escono, il quadro scorre via, rientrano da sinistra in fila coi nomi (sul telefono due per riga): segnaposto della seconda scena. Niente video AI: tutto 3D nella pagina.
  Provate a 1440 e 390 e con animazioni ridotte, senza errori. Non visto su telefono vero.
- 18 nov (52), dopo le prime prove ("non mi piace nessuno dei due: le bottiglie grandi quanto lo schermo, la A puoi toglierla, insieme come appoggiate sul fondo della hero, le foto
  in un'altra sezione"; A e vecchia B in _archivio-prove/pop-a-18nov). pop-b.html ora: le quattro bottiglie alte quanto lo schermo, in fila sul piano (poco sopra il bordo basso),
  ENTRANO ROTOLANDO DA SINISTRA ("magari le farei partire da sinistra"), ombra di contatto sotto ognuna ("le ombre per far capire che sono appoggiati"), nelle chiare la scritta
  dietro passa dalla LENTE DEL VINO ("ci sono i liquidi dentro, tu che sei esperto in 3D dovresti sapere cosa succede": raggio seguito nel cilindro di vino, indice 1,34, muro a 3
  raggi; la scritta disegnata anche in una texture col suo carattere; sopra il livello niente lente), trascinandole girano, scorrendo rotolano via a destra e la frase si apre;
  poi la sezione con le foto dello shooting dei quattro vini. Kit: bott.userData.vetro e .livello (per la lente).
  pop-collezioni.html (js/pop-collezioni.js): "raccontare le collezioni a sezione col 3D, clip-path per passare all'altra, la bottiglia che gira cambia": una schermata per collezione
  (Collezione 53, 125 Uno Due Cinque col 125 Primitivo, Classica con Tre Cuori, Terra col Terra Primitivo: questi due 3D nuovi, tools/bottiglia_3d.py), nome gigante dietro, frase della
  copertina e racconto da js/dati-bf.js, a destra gli altri vini della collezione come foto del catalogo; fra una e l'altra un giro intero: quando la bottiglia dà le spalle diventa
  quella dopo ("ruota in maniera talmente perfetta che mostra l'altra"), e la schermata dopo si apre in un cerchio dalla bottiglia. Fondi bianco e pietra.
  DA FARE annotato da lui: impostazione di sweet-tape.com (riguardato il 18: frase divisa in parole giganti per sezione, prodotti 3D sopra le parole, foto in riquadri tondi,
  passi numerati, frecce a mano, mucchio di prodotti nel piè di pagina); ordine della pagina: apertura, foto, le bottiglie rientrano correndo, una scena fatta con Comfy (da decidere
  quale, e il suo costo), le collezioni. Organic e Internazionali mancano: le loro bottiglie non sono in 3D.
- 18 nov (53), collezioni corrette e unite: "la bottiglia stessa altezza; quando cambia si deve vedere e non a scatto, fluido; non il cerchio ma scheda fissa che col clip-path verso
  il lato mostra l'altra collezione, e il vino al centro man mano cambia mentre passa, anche quando ruota; unisci le due versioni". Ora in pop-b.html dopo le foto (pop-collezioni.html
  in _archivio-prove/pop-collezioni-18nov): la bottiglia rientra rotolando da sinistra, schede ferme una sopra l'altra, la successiva si scopre da destra a sinistra (clip-path inset) a
  velocità costante; la stessa linea taglia la bottiglia: la scena si disegna due volte col taglio (setScissor), a sinistra la vecchia, a destra la nuova; due giri per passaggio, così
  quando la linea è sulla bottiglia è di fronte e si vedono le due etichette divise. Tutte alte uguale.
  VERSIONE VETRO, pop-vetro.html ("una versione nuova, inventa tu, con effetto refract glass per ogni sezione, anche nei colori, guarda sempre questa": gli esempi di glass refraction):
  stessa storia a colori pieni (apertura corallo in sfumatura, foto su rosso, collezioni rosso, lilla, corallo, arancio); js/vetro-rigato.js copia l'immagine finale della tela
  (copyFramebufferToTexture, così i colori restano quelli di sempre) e la ripiega in una fascia a scanalature (fetta rovesciata e stretta, rosso e blu sfasati, luce e ombra);
  apertura: la fascia segue il mouse e ripiega anche fondo e scritta; foto: copie rigate fatte da tools/pop_vetro.py (assets/pop/*-vetro.webp) che scivolano via scorrendo;
  collezioni: la linea è una lastra rigata (vetro sulla bottiglia + .pc-lastra sulla scheda). Body data-vetro; colori del fondo in --vetro-a/b come tre numeri.
  Provate a 1440 senza errori; telefono della versione Vetro non visto.
  18 nov, "ricordati che qui dentro c'è liquido" (Tre Cuori davanti a "Classica" nelle collezioni lasciava passare il nome dritto): la lente del vino e il disegno delle scritte in
  texture stanno ora in js/lente-vino.js (scritta, lenteVino, colore), usato dall'apertura (js/pop-prove.js) e dalle collezioni (js/pop-collezioni.js: la bottiglia chiara legge il
  nome gigante della sua scheda col colore di fondo della scheda). Provata in pop-b.html e pop-vetro.html senza errori.
  18 nov: VERSIONE VETRO TOLTA ("togliamo pop-vetro, continuiamo sul pop-b"): pagina, js/vetro-rigato.js, tools/pop_vetro.py, le foto -vetro e le copie dei moduli e dello stile col
  Vetro in _archivio-prove/pop-vetro-18nov; il suo codice tolto da js/pop-prove.js, js/pop-collezioni.js e css/pop-prove.css. Si continua su pop-b.html.
  18 nov, "quando ruota la bottiglia la parte dell'etichetta vista da dietro sparisce" (detto già prima): la lente esce piena (alfa 1) e copriva il retro dell'etichetta del kit.
  Ora lo disegna la lente (js/lente-vino.js): il raggio che esce dal vino dove c'è l'etichetta vede la carta, ingrandita e dritta (più vicina del fuoco), col colore del retro del kit
  (la sua luce misurata, x1,56: a 180 gradi Tre Cuori 203,130,114 contro 203,131,116 di prima, Marpiccolo uguale). Il kit passa il retro in userData.retro; con la lente si nasconde.
  Provato nell'apertura (Tre Cuori girato a mano), nelle collezioni a 1440 e 390, senza errori.
- 18 nov (54), la fila dei vini stile sweet-tape in pop-b.html ("qualcosa di sweet-tape come impostazione possiamo prenderla", poi "vai procedi e vediamo"): al posto della griglia di foto
  una sezione col palco fermo (js/pop-nastro.js, .pn-* in css/pop-prove.css). Una scheda per vino (Collezione 53, Marpiccolo, Tre Cuori, Philia) che passa come un nastro da sinistra a destra:
  le bottiglie uscite a destra dall'apertura rientrano da sinistra. Nome gigante maiuscolo in basso, che riempie la larghezza (sul telefono i corti crescono, massimo 28% del palco); la
  bottiglia 3D in piedi sulle cime delle maiuscole, rotola con la parola a giri interi e si ferma di fronte; foto dello shooting in un riquadro arrotondato con la didascalia; a destra una
  frase vera della sua scheda (js/data.js, controllata). Riga in alto con la frase "Born in Salento, experienced worldwide." e il numero 01/04. Sul telefono i nomi stanno a destra e la
  bottiglia nella colonna libera accanto alla foto. Con le animazioni ridotte salta da una scheda all'altra.
  Insieme: l'ombra di contatto ora è nel kit (ombraContatto); la pillola si nasconde con un solo trigger dall'apertura alla fine delle collezioni; sui palchi fermi (fila e collezioni)
  l'header perde il vetro (la riga in alto sotto il vetro usciva grigia); il bottone dell'apertura "Vai alle collezioni" porta davvero a #collezioni.
  Provata a 1440, 390 e con animazioni ridotte, senza errori. ATTENZIONE: tre catture lanciate insieme facevano perdere il CSS al server locale: una alla volta.
  Mancano: frecce a mano, mucchio di bottiglie nel piè di pagina, la scena Comfy fra fila e collezioni (idea e spesa da far scegliere a lui).
- 18 nov (55), dopo la fila: "mi piace più la seconda [le collezioni]... non ha senso avere due sezioni quasi uguali", "i nomi non devono andare a capo", "manca la generazione della
  scena collegata allo scroll, da fare con Veo omni", "quando parlo di sweet tape parlo di queste cose ma non l'hai navigato forse" (sue foto: carta da pacchi col nastro, la fascia
  ondulata, i prodotti sopra le parole giganti). Navigato davvero sweet-tape.com (catture e DOM): apertura con frase gigante e rotolo appoggiato; collage su carta stropicciata (carta da
  pacchi con frase gigante e nastro, post-it, pinza); wave-band = SVG con tracciato, testo lungo il tracciato che scorre e il prodotto come bollo; slider prodotti con usi; giant-pinning
  di 8800 px (TO CREATE / TO FIX / TO PROTECT con prodotti e foto attaccati sulle lettere, numeri cerchiati e frecce a mano); "let's make it stick"; mucchio di rotoli nel piè di pagina.
  FATTO in pop-b.html (fondo sempre bianco, dal riferimento i materiali):
  * fila tolta: _archivio-prove/pop-fila-18nov (js/pop-nastro.js e copie dei file com'erano);
  * fascia ondulata .pt-onda: nastro di carta color pietra con grana, "Born in Salento, experienced worldwide." che scorre, bolli col castello negli spazi (js/pop-carta.js);
  * collage .pk: carta da pacchi (texture da tools/pop_carta.py, fatte da zero) con "Primitivo, Negroamaro, Verdeca, Malvasia Bianca. Born in Salento, experienced worldwide."
    (vitigni dalla descrizione dell'azienda + sua frase), le quattro foto attaccate col nastro e un cartellino col nome che porta al vino; salgono a velocità diverse;
  * scena .ps: Collezione 53 che si alza, si inclina e versa nel calice, avanti e indietro con lo scorrimento. Generata con Google Gemini Omni (Video), Omni Flash 1.2, 1080p, 8 s,
    primo fotogramma la foto vera del catalogo su bianco (tools/pop_scena.py, prova versa1, circa 1,19 $); fondo grigio da studio portato a bianco dividendo per il fondo pulito
    (tools/pop_scena_web.py → assets/pop/scena.mp4 1,9 MB, fotogramma chiave ogni 4). Il video si scarica intero e si usa dalla memoria (il server locale non dà i pezzi: senza, non si
    poteva cercare un punto);
  * collezioni: i nomi dei vini non vanno più a capo.
  Provato a 1440, 390 e con animazioni ridotte, senza errori. Mancano: frecce e appunti a mano, mucchio di bottiglie nel piè di pagina.
- 18 nov (56): "togliamo il video generato, non serve, poi ci pensiamo" → scena tolta da pop-b (video, copertina e grezzi in _archivio-prove/pop-scena-18nov; tools/pop_scena.py e
  pop_scena_web.py restano per rifarla). Poi "non dovevi copiare o mettere gli scotch ecc, va fatto in base allo stile che stiamo adottando, hai copiato letteralmente il nastro" →
  carta da pacchi, nastri e cartellini tolti (_archivio-prove/pop-carta-nastro-18nov, con le texture e tools/pop_carta.py). Da sweet-tape restano solo struttura e movimento, nel
  nostro stile (bianco, Bricolage stretto nero in maiuscole e minuscole come l'apertura, foto col raggio del progetto, didascalie sottolineate):
  * la curva .pt-onda: i quattro vitigni dell'azienda in nero lungo un tracciato che scorrono con lo scorrimento, il castello oro fra un giro e l'altro (niente fascia di nastro);
  * la frase .pf: "Born in [Philia, la pietra al sole] Salento, / experienced [Marpiccolo, piscina] [Tre Cuori, pizza] / [Collezione 53, mappamondo] worldwide." gigante con le foto
    fra le parole, ognuna col nome sotto (centrato, mai a capo) che porta al vino; le righe entrano di lato alternate, le foto si aprono (js/pop-frase.js).
  Provato a 1440 e 390, senza errori.
- 18 nov (57), "puoi farle meglio queste sezioni, le foto devono essere grandiiii, o un po' di design": la frase con le foto piccole fra le parole (archivio pop-frase-piccola-18nov)
  diventa un palco fermo che scorre di lato (la struttura delle parole giganti di sweet-tape, nel nostro carattere): "Born in [Philia] Salento, experienced [Marpiccolo] [Tre Cuori]
  worldwide. [Collezione 53]" con lettere alte un terzo dello schermo e foto alte due terzi, ognuna un po' più su o più giù della riga e appena sopra le lettere vicine; sotto ogni
  foto nome (link) e denominazione, mai a capo. Le foto passano un poco più veloci delle parole (stanno davanti) e si piegano appena con la velocità, poi tornano dritte. La sezione è
  alta quanto la corsa (misurata dal layout: scrollWidth contava gli spostamenti delle foto e la corsa finiva troppo avanti). Finisce sul mappamondo della Collezione 53, poi le
  collezioni partono dalla Collezione 53. Con le animazioni ridotte la frase va a capo, foto fino al 70% dello schermo. Provato a 1440, 390 e ridotte, senza errori.
- 18 nov (58), "io ci metterei un po' di colore, farei delle prove con verde acido (Verde Acido 0660)" e "fare diverse hero sempre con le bottiglie 3D, fammi delle varianti".
  Prove in pop-b.html, scelte da una linguetta "Prove" in basso a sinistra (si toglie con le prove), con ?apertura= e ?colore= (js/pop-prove.js, css/pop-prove.css):
  * apertura: Fila (quella di prima), Una (la Collezione 53 grande a destra, la frase a sinistra), Giostra (le quattro in giro attorno al centro, quella davanti grande, gira piano
    da sola e un giro scorrendo), In volo (sospese e inclinate attorno alla frase, ondeggiano, salgono dal basso, scorrendo volano via);
  * colore: Bianco, Verde apertura, Verde frase. --acido #c6ff2d: il codice 0660 non l'ho trovato (ricerca senza risultati), da cambiare in una riga.
  La lente del vino trova l'asse da sola a ogni quota (vertex shader): regge le bottiglie inclinate. Provato a 1440 e 390, senza errori.
- 18 nov (59), "farei anche alternative nella sezione foto, magari anche foto fullwidth se si può": terza riga della linguetta "Prove", ?foto= (js/pop-prove.js e js/pop-frase.js):
  Frase (quella che scorre di lato), Piena (foto a tutta larghezza una sotto l'altra, i pezzi della frase giganti fra una e l'altra, entrando si aprono da riquadro a schermo
  intero e dentro scorrono più piano), Sipario (palco fermo, foto a tutto schermo che si coprono dal basso; pezzo di frase, nome e denominazione in un riquadro bianco pieno).
  Foto larghe 3:2 1920x1280 ritagliate dagli originali dello shooting (tools/pop_foto_larghe.py, transfer-01a1e8e7/swisstransfer_8d349188-...), centrate sulla bottiglia
  (il 16:9 tagliava Philia); sul telefono restano i tagli 4:5 (<picture>). Provate a 1440 e 390, senza errori.
- 18 nov (60), "teniamo la fila e in volo, colore lasciamo bianco al momento, foto dammi altre alternative wow"; poi, sulla curva coi vitigni, "togliamo anche questa, non mi piace".
  Tolte Una e Giostra e il verde acido (copia in _archivio-prove/pop-hero-varianti-18nov): la linguetta "Prove" ha Apertura (Fila, In volo) e Foto. Tolta la curva dei vitigni
  col castello (copia in _archivio-prove/pop-curva-vitigni-18nov): dopo l'apertura viene subito la sezione foto. Tre prove nuove della sezione foto, ?foto= (js/pop-frase.js):
  * Lettere: sopra la foto a tutto schermo un velo bianco con le parole vuote (maschera SVG), dentro si vede la foto; scorrendo si entra nell'asta di una lettera (la l di
    Salento, la i di experienced, la l di worldwide) finché la foto è intera, col nome nel riquadro bianco; la parola dopo sale dal basso. Philia, Marpiccolo, Collezione 53.
    Lo zoom cresce in proporzione (S^p). Le parole si misurano su un testo nascosto: dentro la maschera il browser dava zero per quelle fuori schermo.
  * Tunnel: si attraversa la frase in profondità (prospettiva a mano, 1/(1+d)); le parole passano al centro e fanno da sipario a quello che sta dietro, le foto ai lati (sul
    telefono sopra e sotto la riga), tutte e sette le foto dello shooting col nome e la denominazione; in fondo il mappamondo diventa la schermata.
  * Mosaico: le sette foto e la frase in una griglia sotto l'header che sale entrando; poi esplode (ogni pezzo vola via con la sua velocità e un poco girato) e il mappamondo
    al centro diventa la schermata col nome. Sul telefono quattro foto intorno.
  Con le animazioni ridotte: base.css dà a tutto una transizione di 0,01 ms, quindi un testo ingrandito e misurato subito dava la misura vecchia (transition: none dove si misura).
  Provate a 1440, 390 e ridotte, senza errori.
- 18 nov (61), tre richieste. (a) "c'è un bug nella parte lettere: fa lo zoom per l'immagine poi glitcha tutto": oltre circa 30.000 pixel dal punto dello zoom il browser
  disegna male le lettere della maschera (spicchi bianchi, poi un fotogramma tutto bianco, visto scorrendo con la rotella a zoom 43 e 63). Ora lo zoom si ferma dove la lettera più
  lontana resta sotto 20.000 pixel veri (densità dello schermo compresa; sul computer circa 27 invece di 89) e nell'ultimo 40% il velo bianco si scioglie.
  (b) "alle foto non voglio i link, ci saranno sotto le collezioni": in tutte le prove di foto le foto non sono più link e i nomi sono in grassetto senza sottolineatura
  (i vini si aprono dalle collezioni). (c) "la parte delle collezioni la passerei come seconda, per far apparire la prima collezione facendo rotolare le bottiglie e lasciando
  solo quella che serve alla prima collezione": ordine apertura > collezioni > foto (l'ordine di prima in _archivio-prove/pop-foto-prima-delle-collezioni-18nov).
  Le collezioni partono 200lvh prima della fine dell'apertura (margin-top), così il loro palco si ferma mentre quello dell'apertura è ancora fermo (apertura alta 240lvh:
  40 per luogo e bottone, 100 per il passaggio). Nel passaggio (window.ppPassaggio.v da 0 a 1, primi 100lvh del palco delle collezioni) le altre tre rotolano via a destra
  (In volo: volano via in alto), dopo un quarto la scheda della Collezione 53 si scopre da destra come fra una collezione e l'altra, e la Collezione 53 va al centro girando
  una volta: la calcola l'apertura (ppPassaggio.posa) e la disegna la tela delle collezioni, che sta sopra la scheda; alla fine posizione, altezza e rotazione sono quelle della
  prima collezione, che da lì continua da sola. "Vai alle collezioni" porta a scheda scoperta (#collezioni è un segnaposto a 100lvh). La pillola "I nostri vini" resta nascosta
  fino alla fine delle foto. Con le animazioni ridotte niente sovrapposizione, collezioni dopo l'apertura; corretto anche un difetto vecchio: entrando nelle collezioni si vedeva
  l'ultima scheda (onUpdate), ora la scheda si calcola dallo scorrimento di adesso. Provato a 1440 e 390, Fila e In volo, ridotte, senza errori.
- 18 nov (62), il passaggio rifatto in tre correzioni di fila. "devono scorrere verso destra tutte, riapparire a sinistra lasciando poi la prima bottiglia della
  collezione": provato un nastro (chi esce a destra rientra da sinistra, la Collezione 53 rientrava e si fermava al centro, passaggio di 150lvh). "deve passare già alla
  seconda sezione": la scheda della Collezione 53 entra da sinistra subito dietro le bottiglie che vanno a destra, non dopo. "la bottiglia deve rimanere, non deve rientrare":
  la 53 non esce più. Ora le altre tre rotolano via a destra sempre più veloci (fuori a v 0,45); la scheda entra da sinistra (finita a v 0,5) e non le copre mai:
  ppPassaggio.tetto è dove comincia, ombra compresa, la prima bottiglia da sinistra disegnata dall'apertura, e la linea si ferma lì. La 53 va al centro girando di giri
  interi (ferma a v 0,6), disegnata dalla tela delle collezioni sopra la scheda; ppPassaggio.sopra: l'apertura la nasconde solo dopo che l'altra tela l'ha disegnata, così
  non sparisce per un fotogramma. La linea della scheda la scrive un gsap.ticker in js/pop-collezioni.js (non più una tween). Passaggio di nuovo 100lvh. Con le animazioni
  ridotte niente passaggio: apertura alta 100lvh e collezioni subito dopo (prima c'erano 140 + 100lvh fermi). La versione di prima (scheda da destra) è in
  _archivio-prove/pop-passaggio-rotolano-via-18nov. Provato a 1440 e 390, Fila e In volo, ridotte, senza errori.
- 19 nov (63), pop-b.html, quattro richieste. 1) "quando vado avanti e torno indietro si glitcha la bottiglia": tornando su lo scrub del passaggio arriva dopo lo
  scorrimento, e la tela delle collezioni, che non è più ferma, disegnava la 53 280 px più in basso. Ora sposta la bottiglia di quanto è scesa e la passa all'apertura
  (ppPassaggio.sopra) solo a tela ferma. 2) "da questo vino togliamo questa etichetta": tolta la fascetta DOCG dal collo di Philia 3D ("fascetta" fuori da
  assets/3d/philia.json; json e texture di prima in _archivio-prove/philia-con-fascetta-19nov; nota in tools/bottiglia_3d.py). 3) nomi accavallati nelle schede (Terra, e
  anche 125 Uno Due Cinque): spazio fra le bottiglie 12 px e stanno() in js/pop-collezioni.js toglie da destra le bottiglie finché fra due nomi restano 8 px; Terra e 125
  ne mostrano 3, le altre sono in "Tutti i N vini". 4) "le foto che hai usato poi sono le stesse ... scegline altre, e dove mostriamo il vino una nuvoletta, qualcosa di pop,
  così se vado in hover alla bottiglia 3D": nella Frase quattro foto nuove dagli originali, dal giorno alla notte, con vini che in pagina non c'erano (pallone _DSC7239
  125 Bianco Organic, rosato _DSC7636 Terra Rosato, carte _DSC7450-Modifica Terra Negroamaro, notte _DSC8388-Modifica 125 Negroamaro; tools/pop_foto.py). Su ogni foto
  .pp-nuvola (css/pop-prove.css): fondo bianco, bordo e ombra netta d'inchiostro, coda che punta la bottiglia (--bx --by la punta, --cx dove sta la coda, --coda in cqh,
  data-sotto per il corpo sotto); prende il posto della didascalia e salta fuori quando la foto entra (ScrollTrigger con containerAnimation, js/pop-frase.js). Sulle
  bottiglie 3D dell'apertura la stessa nuvoletta col mouse sopra (al tocco mentre la si gira), punta il collo dalla parte del centro, nascosta nel passaggio. Le altre
  cinque prove di foto non sono toccate. Provato a 1280 e 390, animazioni ridotte, senza errori.
- 19 nov (64), pop-b.html, dopo aver visto le nuvolette. 1) "io la voglio qui in foto lettere, nuvolette": in Lettere, a foto intera, la nuvoletta punta la spalla della
  bottiglia (Philia, Marpiccolo, Collezione 53 Primitivo). La foto riempie lo schermo e il taglio cambia (3:2 sul computer, 4:5 sul telefono): data-pl e data-p dicono dove
  sta la bottiglia in ogni taglio (x, y, coda, in centesimi), adatta() in js/pop-frase.js fa il conto, tiene la nuvoletta sotto l'header e dentro i lati, e la fa saltare
  fuori con --su nella timeline. .pk-passo isolato (la nuvoletta della prima foto stava sopra le altre). La didascalia resta per lo schermo parlante e con le animazioni
  ridotte. 2) "nella hero quelle nuvolette così non mi piacciono": tolta la nuvoletta al passaggio del mouse sulle bottiglie dell'apertura (js/pop-prove.js di prima in
  _archivio-prove/pop-nuvoletta-apertura-19nov). 3) "il logo oro di Feudi qui, bottiglia Philia": castello {quota 0.85, alto 0.031} aggiunto a mano in assets/3d/philia.json.
  4) "se c'è da fare altre bottiglie in 3D falle, se dobbiamo usare altre immagini comunque probabilmente serviranno": le quattro dei vini delle foto nuove. Scure con le
  misure della loro linea: terra-negroamaro, 125-negroamaro. Chiare con la pelle di Blender (bottiglia_blender.py --spp 512 --velo, 30 s l'una, poi velo_blender.py):
  terra-rosato e organic-bianco. Nuovo --lamina F in tools/bottiglia_3d.py (sulla carta chiara della Terra Rosato l'ombra calda sembrava rame); nel kit la capsula di
  stagnola si disegna anche sopra la pelle (in Blender usciva grigia e piatta). Si guardano con bottiglie-3d.html?quali=terra-rosato,organic-bianco,terra-negroamaro,125-negroamaro.
  Non sono ancora usate in pop-b.html: da chiedere dove. 5) "fammi una lista di stili pop, un html per capire cosa potremmo usare e/o sostituire": pop-stili.html
  (pop-stili.template.html, stile e script dentro la pagina), dieci modi numerati di indicare il vino sulla foto del pallone (fumetto, fumetto pieno, bollino, punto e riga,
  scritta a mano, cerchio a pennarello, cartellino, scoppio, nome gigante, pillola che segue) e sei sulla fila di bottiglie del catalogo (3, 4, 5, 7, 11 nome sul piano, 12 la
  frase gigante diventa il nome). Solo inchiostro e bianco. Pagina di lavoro: scelti gli stili si toglie. Provato a 1280, 1750x702 e 390, senza errori.
- 19 nov (65), pop-b.html, le scelte dal campionario. 1) Apertura, stile 12: "la frase diventa il nome, potresti spostarla un po' più alta così si legge la frase".
  In js/pop-prove.js dici(i): col mouse sopra una bottiglia (sopra(), la stessa prova di prima), o col dito mentre la si gira, FS.mk.spezza riscrive le due righe giganti col
  nome del vino (i nomi lunghi su due righe, i corti su una e la seconda vuota) e le lettere salgono come all'apertura; la lente del vino rilegge il testo (disegnaRighe) e si
  riaccende a lettere arrivate; via il puntatore, dopo 280 ms, torna la frase; nel passaggio alle collezioni niente nomi. La frase sta più in alto sul computer
  (.pp-titolo: align-content start, padding-top 5svh): la prima riga dietro i colli. 2) Foto, stile 6: "scelgo al momento cerchio pennarello ma lo farei anche sulle foto
  grandi". .pp-cerchio in css/pop-prove.css: il riquadro è la bottiglia, dentro un svg con due tracciati uguali (inchiostro sotto, bianco sopra) che js/pop-frase.js scrive
  alla misura vera (GIRO, ResizeObserver) e il nome accanto in bianco col bordo d'inchiostro (data-lato dx, sx, su, giu). --su (registrata con @property) da 0 a 1 disegna il
  giro: nella frase con una transizione quando la foto è entrata, in Lettere nella timeline. In Lettere il riquadro viene dal taglio della foto (data-pl e data-p: x0, y0,
  x1, y1, lato) e si ferma sotto l'header e sopra il bordo basso quando la bottiglia è più alta dello schermo. Il fumetto di prima è in
  _archivio-prove/pop-fumetto-foto-19nov; .pp-nuvola resta nel css solo per il campionario. 3) "bianco puglia organic sostituiscilo nella hero al posto di marpiccolo,
  philia metti negroamaro salento ... le teniamo, andranno usate altrove, specialmente nelle schede di prodotto": nell'apertura ora primitivo53, organic-bianco, tre-cuori,
  terra-negroamaro (ho preso il Terra, etichetta blu: da confermare). 4) pop-stili.html aggiornato: frase più in alto, bottiglie di adesso, segnati il 6 e il 12.
  Trappola: con le animazioni ridotte ppPassaggio.v vale sempre 1, quindi "nel passaggio" va chiesto con !fermo. Provato a 1280, 1750x702, 390 al tocco, ridotte, senza errori.
- 19 nov (66). 1) "il punto nella foto lettere esce fuori": prima che il giro di pennarello partisse (--su a zero) si vedeva un punto bianco col bordo nero sopra il velo
  delle lettere. Col tratteggio "1px" in fondo al tracciato ricominciava un tratto lungo zero e la punta tonda ne faceva un punto (nel Chrome dell'utente; in quello senza
  finestra delle prove non si vede, quindi la prova è sui valori). In css/pop-prove.css: stroke-dasharray 1px 2px (il vuoto più lungo del tracciato) e l'svg con opacity
  legata a --su, spento finché è zero. Vale anche per i giri della frase. 2) "negli stili mi dai dei font pop, google font ovviamente, così magari ne testiamo altre":
  pop-stili.html, in fondo, "I caratteri": tredici per le scritte grandi con le lettere A-M (A è Bricolage, quello di adesso; poi Anton, Big Shoulders, Bowlby One,
  Dela Gothic One, Rubik, Unbounded, Climate Crisis, Bagel Fat One, Titan One, Londrina Solid, Caprasimo, Shrikhand) e sei a mano N-S per il nome accanto al cerchio
  (Caveat Brush, Permanent Marker, Knewave, Sedgwick Ave Display, Just Another Hand, Gochi Hand). Lo script li misura a caratteri arrivati e li porta alla larghezza di
  riga di Bricolage (--ps-k): un carattere largo viene più basso, come succederebbe nella pagina. I bottoni con le lettere sopra le bottiglie ne mettono uno nella frase
  (e nel nome del 6). Nessuno è ancora nella pagina vera: scelta la lettera si prova su pop-b.html (la lente del vino ridisegna il testo, va controllata).
  3) Dal giro prima, non ancora scritto: con le animazioni ridotte la timeline dell'apertura partiva da sola e nascondeva la scritta del luogo e "Vai alle collezioni";
  ora gsap.timeline({ ..., paused: fermo }) in js/pop-prove.js.
- 19 nov (67), pop-b.html?foto=lettere: "far uscire anche altre info sul vino che possono interessare chi scrolla, ovviamente mentre scrollo escono, vale per tutti".
  Sulle tre foto grandi, dopo il giro e il nome, continuando a scorrere escono una alla volta sotto il nome: denominazione e gradi, "Note di ..." (i primi tre aromi),
  "Con ..." (gli abbinamenti). js/pop-frase.js le prende da js/data.js (data-vino sul .pp-cerchio), niente scritto a mano: Marpiccolo non ha abbinamenti e ha due righe.
  .pp-note in css/pop-prove.css: stessa scritta bianca col bordo d'inchiostro, più piccola, appesa sotto il nome (che resta dov'era); --nw è il posto che ha, lo misura
  adatta(). Ogni foto dura 4,5 invece di 3,2 e .pk è alta 760lvh invece di 600. Le stesse righe vanno nella didascalia .pw-box (schermo parlante, animazioni ridotte: lì
  in colonna). Sul telefono il nome di Philia è passato da destra a sotto il giro (data-p ... giu): di lato per le righe non c'era posto.
  Non fatto: le foto piccole della frase (da chiedere, lì c'è posto per una riga sola), i premi (C53 ne ha cinque, sono in FS.wine().premi).
  Detto nello stesso giro: "sulla bottiglia di apertura invece non farei nulla al momento, poi decido cosa mettere": l'apertura non si tocca finché non lo dice lui.
- 19 nov (68), pop-b.html?titoli=unbounded: "proviamo unbounded per i titoli" (il G del campionario). Prova che si accende e si spegne: voce "Titoli" nel pannello delle
  prove (js/pop-prove.js mette body[data-titoli] e chiede subito il carattere, poi fa rimisurare tutto), regole in un blocco solo in fondo a css/pop-prove.css, Unbounded 900
  aggiunto al link dei caratteri della pagina. In Unbounded solo le scritte giganti: frase dell'apertura (e il nome che ne prende il posto), nomi delle collezioni, frase
  con le foto, parole di Lettere e delle altre prove foto. I nomi accanto al giro, le righe sul vino e i testi restano in Bricolage (nella frase il nome lo ereditava dal
  rullo: per questo il carattere va su .pf-parola e non su .pf-rullo). Misure: Unbounded è largo più del doppio (--tk .44 = stessa larghezza di riga); apertura 8vw sul
  computer e 10,5vw sul telefono (ai lati c'è posto), collezioni alla stessa larghezza di prima (comanda "125 Uno Due Cinque"), frase che scorre 21svh (16 sul telefono),
  Lettere e Mosaico le misura js. Provato a 1750x702 e 390x844: apertura, nome al passaggio e al tocco, collezioni, frase, Lettere. Piena, Sipario, Tunnel e Mosaico con
  Unbounded non guardati. Per toglierla: il blocco nel css, TITOLI in js/pop-prove.js, "&family=Unbounded:wght@900" nel link.
- 19 nov (69), pop-b.html?titoli=londrina: "proviamo londrina" (Londrina Solid 900, il K del campionario). Il blocco della prova in fondo a css/pop-prove.css ora vale
  per più caratteri: ognuno dice le sue misure con le variabili (--tf famiglia, --tk larghezza rispetto a Bricolage, --ta frase dell'apertura, --to frase che scorre,
  --ti interlinea, --tl spaziatura) e le regole sono una volta sola su body[data-titoli]. Per aggiungerne un altro: una riga di variabili, la voce in TITOLI
  (js/pop-prove.js, il valore è la famiglia) e la famiglia nel link della pagina. Londrina è largo una volta e mezza Bricolage (--tk .715): apertura 13vw (16vw sul
  telefono), frase che scorre 28svh (22). Sul telefono viene molto più grande di Unbounded. Provato a 1750x702 e 390x844: apertura, nome al passaggio e al tocco,
  collezioni, frase, Lettere. Nessuno dei due è scelto.
- 19 nov (70), pop-b.html, i caratteri diventano quelli della pagina. Tre messaggi: "vale anche per questi titoli" (foto della frase della collezione, "The enduring
  spirit of the land."), "per i testi, paragrafi ecc. mettiamo un font lineare, non usiamo grotesk ecc. ma sempre pop", e sulla foto del nome accanto al giro "anche qui
  fallo su quello ufficiale i testi eliminali tutti". Letto così: Londrina (l'ultimo provato) non è più una prova accesa dall'indirizzo ma il carattere dei titoli della
  pagina; titoli sono le scritte giganti, la frase della collezione (.pc-frase) e il nome accanto al giro (.pp-cerchio b); tutto il resto è testo e passa a un lineare,
  DM Sans (scelto da me: geometrico, amichevole, si legge bene piccolo), comprese le righe sul vino sotto il nome. Bricolage Grotesque non è più usato dalla pagina.
  DA CHIARIRE: "i testi eliminali tutti" potrebbe voler dire togliere le righe sul vino sotto il nome; le ho lasciate e l'ho chiesto.
  Come: <body data-titoli="londrina" data-testi="dm"> nell'html (così vale dal primo disegno, senza aspettare js); blocco "I CARATTERI" in fondo a css/pop-prove.css
  (variabili per carattere: --tf --tk --tl --ti --ta --to --tn --tg --tm; i testi cambiano --font); js/pop-prove.js legge ?titoli= (londrina, unbounded, bricolage) e
  ?testi= (dm, outfit, figtree, nunito, bricolage), "bricolage" toglie l'attributo e torna a com'era; il pannello delle prove ha le voci Titoli e Testi.
  Misure: il nome accanto al giro in Londrina è all'85% sulle foto piccole della frase (stretto) e al 110% sulle foto grandi di Lettere (sul telefono le righe sotto lo
  sovrastavano); le righe sul vino in DM Sans 700 un poco più piccole (il lineare è più largo). Intestazioni di menu e piede restano testo.
  Provato a 1750x702, 1280x800 e 390x844: apertura, collezioni, frase, Lettere; ritorno a Bricolage e Unbounded con Outfit dal pannello. Non guardati: Piena, Sipario,
  Tunnel, Mosaico; le altre pagine del sito non sono toccate (il carattere di .page-fo in css/foto.css è ancora Bricolage).
- 19 nov (71), pop-b.html. 1) "ho detto che nella hero non cambiamo il titolo all'hover delle bottiglie, pensiamo ad altro": via "la frase diventa il nome" (al
  passaggio e al tocco non succede più niente; trascinando le bottiglie girano come prima). Avevo letto male "sulla bottiglia di apertura non farei nulla al momento"
  come "non aggiungere altro": voleva dire togliere. La versione di prima è in _archivio-prove/pop-frase-diventa-nome-19nov; il campionario dice "provato e tolto".
  2) "ora bisogna aggiungere le altre sezioni, quelle dell'azienda, i premi, le news, in stile pop, come stiamo andando": tre sezioni dopo le foto, prima del piede.
  AZIENDA (.pa, fondo pietra): titolo gigante "La cantina della famiglia Varvaglione.", a destra la foto della masseria e dove siamo; poi quattro capitoli a tutta
  larghezza (01-04: numero e occhiello, titolo, testo, foto storta come una stampa), ognuno aperto da una riga tirata a pennarello che si disegna quando entra (.pp-riga).
  Testi, foto e didascalie sono quelli di azienda-i.html e della home, non riscritti. PREMI (.pd, bianco): "65" enorme e "riconoscimenti." sulla stessa riga, il numero è
  la somma delle medaglie dei vini; sotto quante per concorso (28 AWC, 26 Berliner, 6 Bruxelles, 2 CWSA, 2 Decanter, 1 Asia); poi le 65 medaglie vere in tre fasce che
  scorrono di lato con la pagina, quella di mezzo al contrario (alt e title: vino, medaglia, concorso, anno). NEWS (.pq, fondo notte): "Dalla cantina.", una riga per
  notizia (quando, titolo, immagine), tutta la riga porta alla notizia sul sito di adesso. js/pop-sotto.js scrive premi e news da js/data.js e mette le classi; i
  movimenti sono css (IntersectionObserver per is-su, ScrollTrigger solo per le tre fasce). Con le animazioni ridotte: righe già disegnate, foto ferme, medaglie a capo.
  Trappola: width e height sull'img fissano l'altezza se il css non dice height: auto (la prima foto veniva alta 797 px).
  Provato a 1750x702 e 390x844, ridotte, con Unbounded e con Bricolage: nessuna uscita dai bordi, nessun errore. Non fatto: "Come nasce" (è una pagina a sé), contatti
  (sono nel piede), link a una pagina news (il sito ha solo queste tre nei dati).
- 19 nov (72), pop-b.html, Premi. Schermata delle tre fasce di medaglie + "possiamo evitare tutto questo": tolte le fasce (html, css .pd-fasce/.pd-fascia, il pezzo
  gsap in js/pop-sotto.js). Restano "65 riconoscimenti.", la riga di testo e i sei conteggi per concorso: a 1750x702 la sezione è uno schermo esatto (705 px), a 390x844
  861 px. Le fasce sono in _archivio-prove/pop-fasce-medaglie-19nov con le istruzioni per rimetterle. Non deciso: se al posto delle medaglie va altro o niente.
- 19 nov (73), pop-b.html. 1) "mettili i loghetti ma non ripetuti come erano": nei Premi ogni conteggio ha accanto il loghetto del suo concorso, uno solo (6 in tutto,
  non 65): la medaglia più alta e, a pari grado, la più recente (js/pop-sotto.js, `logo`). Letto come "uno per concorso"; l'altra lettura (una per medaglia diversa, 25)
  non fatta. 2) "va cambiato il mega menu e il footer in base a questo stile": solo css in fondo a css/pop-prove.css ("MEGA MENU E PIEDE"), il markup comune
  (sections/header.html, footer.html) non è toccato e le altre pagine restano com'erano. MENU a schermo largo: collezioni e nome del vino nel carattere dei titoli, il nome
  gigante dietro le bottiglie nero pieno come nell'apertura, via il rettangolo dietro la bottiglia accesa (tagliava le lettere: la dice l'etichetta, in grassetto con la
  barra nera), bottone "Apri la scheda" nero, pallino nero. I nomi della colonna ora dipendono anche dall'altezza: a 1750x702 la colonna scorreva (615 su 578) e "Tutti i
  vini" restava sotto il bordo, ora ci sta (578 su 578). MENU del telefono: voci grandi nel carattere dei titoli, righe nere, filtro acceso nero. PIEDE: il telefono
  gigante a tutta larghezza sottolineato a pennarello (la riga si disegna quando entra), sotto le tre colonne coi titoli nel carattere dei titoli; .foot__contatti è
  display: contents per far uscire il telefono dalla terza colonna. Trappola: `.foot__contatti > *` prendeva anche il telefono e lo rimetteva in colonna 3 (pagina larga
  2614): serve :not(.foot__tel). Provato a 1750x702, 390x844, con Unbounded, con Bricolage a 1280 e sul telefono, con le animazioni ridotte a 1366x650: niente fuori dai
  bordi, nessun errore. Non toccati: la barra in alto, la pillola "I nostri vini", il fondo del piede (resta pietra).
- 19 nov (74), pop-b.html, Azienda. "rifarei la sezione sulla famiglia Varvaglione come una cosa dinamica": LA PILA DI STAMPE. Il titolo gigante e la masseria in alto
  restano; sotto, i quattro capitoli scorrono a sinistra e le loro foto escono dalle righe e diventano una pila ferma a destra (sticky, alta uno schermo): ogni capitolo che
  sale butta la sua stampa sulla pila, storta, legata allo scorrimento (scrub; tornando su, torna giù). Didascalia dentro la stampa, su un'etichetta piena; quella della
  stampa che finisce sotto se ne va. Sul telefono la pila sta ferma in alto e il testo le scorre sotto; lì le stampe entrano di lato (da sotto passavano sopra il testo).
  Come: template con .pa-giro (ol + .pa-pila vuota); js/pop-sotto.js mette .is-pila sulla sezione, sposta le figure e fa un timeline per riga; css "L'AZIENDA DINAMICA".
  Con le animazioni ridotte niente .is-pila: resta la versione ferma di prima (foto nelle righe), che è anche in _archivio-prove/pop-azienda-righe-19nov.
  Trappola: .pa-f aveva align-self: start (regola delle righe) e nella pila le stampe stavano in alto invece che al centro. Scelte mie, non sue: il meccanismo (pila di
  stampe) fra altri possibili (palco fermo coi titoli giganti dietro, striscia orizzontale); testi e foto sono gli stessi.
  Provato a 1750x702, 900x1100, 390x844, con Unbounded a 1280 e ridotte a 1366x650: pagina mai più larga dello schermo, nessun errore.
- 19 nov (75), pop-b.html, Azienda. Alla pila ha risposto "no mi servono altre alternative": letto come "no, mi servono altre alternative" (l'altra lettura, "non mi
  servono", vorrebbe dire che la pila basta: per questo la pila resta quella che si vede senza niente nell'indirizzo). Tre versioni nel pannello Prove, riga "Azienda"
  (?azienda=, js/pop-prove.js AZIENDA; le fa js/pop-sotto.js), stesso html e stessi testi: PILA (com'era); PALCO (?azienda=palco): uno schermo fermo per capitolo, alto
  400lvh, i quattro capitoli nello stesso posto, titolo grande su due righe, la foto vola dentro da sotto e fuori da sopra, la riga a pennarello si disegna con lo
  scorrimento (un timeline solo); STRISCIA (?azienda=striscia): i capitoli in fila scorrono di lato (100lvh + 150vw), la riga a pennarello continua da un capitolo
  all'altro, le foto scivolano un po' dentro il loro capitolo (containerAnimation). css: .is-viva (comune) + .is-pila / .is-palco / .is-striscia in "L'AZIENDA DINAMICA".
  Trappole: nella striscia la corsa va misurata con offsetWidth (scrollWidth cambia con le foto che scivolano); misurare subito dopo scrollTo dà la posizione vecchia
  (lo scrub arriva dopo 0,6 s). Provate tutte e tre a 1750x702 e 390x844, palco e striscia con Unbounded a 1280, ridotte: resta la versione ferma. Nessun errore.
- 19 nov (76), pop-b.html, Azienda. "mettiamo palco": il palco è la versione che si vede senza niente nell'indirizzo (js/pop-sotto.js `quale`, js/pop-prove.js AZIENDA).
  Pila e striscia restano nel pannello Prove (?azienda=pila, ?azienda=striscia): non ha detto di toglierle. Il "16 px oltre il fondo" dell'ultimo capitolo era una misura
  presa a foto ancora in volo: a fermo il contenuto finisce a 660 su 702 e a 590 su 844.
- 19 nov (77), pagina del vino Pop: pop-vino.html?id= ("passiamo alla pagina del singolo vino", "voglio qualcosa di wow con il 3d"). pop-vino.template.html, js/pop-vino.js, css/pop-vino.css.
  La bottiglia 3D fa da rullo: all'apertura attraversa lo schermo e stampa il nome gigante; scorrendo torna indietro e dove passa cancella un capitolo e stampa il successivo
  (clip-path dei due capitoli sulla stessa riga, che sta sull'asse della bottiglia). Computer: in piedi, da destra a sinistra e ritorno, si gira trascinandola. Telefono: sdraiata,
  vista dall'alto, dal fondo a sotto l'header e ritorno. Capitoli da js/data.js: nome, descrizione, vista in grande con profumi e abbinamenti, zona resa gradazione e tecnica,
  riconoscimenti (se ci sono). Sotto: gli altri vini della collezione, sei alla volta. Bottiglie chiare: il nome attraverso il vino (js/lente-vino.js, uniform nuova "taglio",
  che di base non cambia niente a pop-b). 3D per dieci vini (TRE_D in js/pop-vino.js); gli altri 23 usano la foto del catalogo su un piano, che scivola senza girare.
  Animazioni ridotte o niente WebGL: foto e capitoli uno sotto l'altro. Il meccanismo l'ho scelto io: in attesa del suo giudizio.
  Collegamenti: body data-pagine="home,azienda,vino" (js/main.js) dice a una prova quali pagine usare restando nel mood Fotografia; pop-b.html ora apre pop-vino.html da
  collezioni e menu, e il suo logo porta a pop-b.html (prima a foto.html). L'Azienda del menu: da pop-vino va a pop-b.html#azienda, da pop-b resta azienda.html (non chiesto).
  Provato a 1750x702, 1280x720, 390x844, 360x640, rotella vera su e giù, animazioni ridotte. Non provato su telefono vero né Safari.
- 19 nov (78), piede Pop: "qui togli fax metti tel". Nella colonna Contatti "Tel +39 099 5315370" al posto del fax, solo nel piede Pop (sections/footer.html ha le due righe,
  css/pop-prove.css sceglie); negli altri siti resta il fax. Il numero grande in cima al piede non è stato toccato: ora il telefono c'è due volte, da chiedere.
- 19 nov (79), pop-vino.html, "Gli altri vini della collezione": "questa non mi piace" (schermata di Collezione 53: due foto piccole lontane fra loro su una fascia vuota).
  Rifatta solo quella sezione; com'era in _archivio-prove/pop-vino-altri-griglia-19nov. Ora Fila: bottiglie grandi (60svh) e vicine in piedi su una riga a pennarello;
  fino a tre stanno accanto al nome gigante della collezione, che poggia sulla stessa riga; da quattro il nome sopra e la fila su tutta la larghezza. Entrano scivolando da
  destra quando la sezione arriva. Seconda prova dal pannello (?altri=righe): una riga per vino, nome gigante, denominazione e bottiglia sdraiata. Sempre sei alla volta.
  La pillola "I nostri vini" ora resta nascosta fino alla fine di questa sezione (copriva i nomi delle bottiglie). Meccanismi scelti da me: aspetta il suo giudizio.
  Provato a 1750x702, 1280x720, 390x844 con 1, 2 e 6 bottiglie.
- 19 nov (80), colore nel Pop: ha chiesto "dici che si potrebbero essere elementi colorati" (vale anche per la home) e poi "mi fai un file negli stili per vedere?".
  Parere dato: sì, come elementi e mai come fondi, un solo accento (il verde acido che aveva proposto lui) usato da evidenziatore, più il colore del vino una volta sola
  nella pagina del vino; i colori delle collezioni (copertine del cliente) sono scuri e terrosi, adatti a Botanica. In fondo a pop-stili.html la sezione "Il colore"
  (pop-stili.html#colore): nove esempi da C1 a C9 (evidenziatore nei titoli, parola colorata, bottoni, riga a pennarello, giro sulle foto, numeri, colore del vino,
  ombra netta dietro le foto, bollo e targhetta) e dieci bottoni di tinta (verde acido #c6ff2d a occhio, tre vini da js/data.js, sei collezioni da js/dati-bf.js).
  Niente applicato a pop-b.html né a pop-vino.html: aspetta i numeri che sceglie e l'esadecimale vero del verde.
- 19 nov (81), pop-b.html, verde acido: "proviamo con il verde acido solo in home". Prova accesa di base (body[data-colore="acido"], lo mette js/pop-prove.js; ?colore=no
  o la riga Colore del pannello la spegne). Non ha detto i numeri del campionario: ho messo quelli del mio parere, solo elementi e mai fondi: passata dietro "mood."
  nell'apertura (.pp-evid, si tira da sinistra dopo le lettere; la lente del vino la mostra anche attraverso le bottiglie chiare: uniform evid ed evidC in js/lente-vino.js,
  che a zero non cambiano niente altrove), "Salento," nella frase delle foto, il 65 dei premi, giri e nomi sulle foto, bottoni al passaggio. Regole in fondo a
  css/pop-prove.css. pop-vino.html non lo prende (non carica pop-prove.js). #c6ff2d è ancora a occhio. Da chiedere: quali togliere o aggiungere (C3 bottone pieno, C4 riga,
  C8 ombra, C9 bollo non ci sono), e l'esadecimale. Provato a 1750x702, 390x844, animazioni ridotte, spento.
- 19 nov (82), pop-b.html, verde acido nell'apertura: "il verde nella scritta della hero si vede dopo, deve esserci già". La passata dietro "mood." non la mette più lo
  script (arrivava quando partiva lui, e si tirava dopo un secondo e mezzo): è un ::before della seconda riga in css/pop-prove.css, largo --ev-w (quanto è larga "mood." rispetto
  alla riga: 43,11% Londrina, 45,88% Unbounded, 46,33% Bricolage; js/pop-prove.js lo rimisura) e pop-b.template.html nasce con data-colore="acido" sul body. C'è dal primo
  fotogramma, prima delle lettere; anche nella lente del vino (evid senza "acceso"). Ha chiesto anche "l'hai fatto anche nella scheda del vino?": no, solo home come aveva detto.
- 19 nov (83), verde acido TOLTO dalla home: "lasciamo come era, togliamo l'accento, lasciamo i colori nella pagina stili". pop-b.html è tornata inchiostro, bianco e pietra:
  via il blocco in fondo a css/pop-prove.css, COLORE/tinta/evidR da js/pop-prove.js (e la riga Colore del pannello), evid/evidC da js/lente-vino.js (resta "taglio", che serve
  alla pagina del vino), data-colore dal body. La prova intera è in _archivio-prove/pop-verde-acido-home-19nov. Gli esempi C1-C9 restano in pop-stili.html#colore.
- 19 nov (84), pagina CHI SIAMO nel Pop e menu: "passiamo alla pagina chi siamo e dal menu togli come nasce e premi".
  pop-azienda.template.html + css/pop-azienda.css + js/pop-azienda.js (classi .pu-). Cinque parti: apertura "Chi siamo." con le lettere finestra sulla masseria (si entra
  nella i finché la foto è intera; stesso calcolo delle Lettere di js/pop-frase.js, ripetuto perché quello script parte da solo; una riga o due secondo lo schermo);
  la famiglia coi cinque nomi giganti e i quattro numeri (vitigni, vini, collezioni e premi contati da js/data.js); la nostra filosofia coi quattro vitigni e le loro
  bottiglie in fila (stesse classi .sv-banco/.sv-fila di css/pop-vino.css, sei alla volta, portano alla scheda); il Salento a palco fermo sul computer (cinque luoghi,
  nome pieno e foto che copre la precedente; sul telefono e con le animazioni ridotte foto in colonna col nome sopra); sostenibilità in sei righe, obiettivi e bilancio.
  Testi tutti da azienda.template.html. Lasciati fuori: premi anno per anno (stanno in home) e "Dove trovarci" (c'è il piede). Niente WebGL in questa pagina.
  Menu: in css/pop-prove.css le voci "Come nasce" e "Premi" sono nascoste solo nel Pop (sections/header.html è comune: negli altri siti ci sono ancora, e
  come-nasce.html non esiste). data-pagine di pop-b e pop-vino ora punta a pop-azienda.html. Provata a 1750x702, 1280x720, 390x844 touch e con animazioni ridotte.
  Restano come prima su pop-vino: nel piede #premi e #news non portano da nessuna parte, "Contatti" dell'header torna in home.
- 19 nov (85), Chi siamo, secondo giro: sullo screenshot della fila di Primitivo "la hero dammi alternative non mi piace quell'immagine / voglio 3d e fare qualcosa di
  nsist [letto: consistente] / fare un'alternativa anche alla sostenibilità". Tre prove nuove, che ora sono la forma senza niente nell'indirizzo; le altre nel pannello Prove:
  apertura (?apre=): Bottiglie 3D = le due i di "Chi siamo." sono Collezione 53 Primitivo e Tre Cuori, arrivano rotolando dai lati, si trascinano, scorrendo rotolano via;
  Lettere con vigna (vigna-passeggiata), mare, vite. La foto della masseria tolta dall'apertura. Vitigni (?vitigni=): Palco 3D = nastro fermo, un vitigno alla volta, nome
  gigante dietro i colli, bottiglie 3D sulla riga, elenco di tutti i suoi vini coi link; Fila = quella di prima. Sostenibilità (?sos=): Palco = un fatto per schermo su fondi
  alternati, cifra gigante, taglio da destra; Righe = quella di prima. Bottiglie 3D nuove con tools/bottiglia_3d.py: assets/3d/cala (--etichetta 447 796 --curva 4 4 --metallo no
  --capsula 242 --vetro 350 430 --vuoto 250 284 --livello 293) e assets/3d/terra-malvasia-bianca (misure di Terra Rosato, --castello 194 216, --vuoto 242 266 --livello 273),
  senza la pelle di Blender (Blender non trovato sul computer: hanno il velo semplice). Claria (etichetta tonda) e 125 Malvasia Bianca (foto sgranata) non fatte.
  Nel 3D di questa pagina niente lente del vino: dietro le chiare il nome si vede per trasparenza. js/pop-azienda.js carica three e il kit solo quando servono; le dodici
  bottiglie dei vitigni partono quando il palco è a uno schermo e mezzo (sul telefono sette). Trappola trovata: con le animazioni ridotte css/base.css dà a tutto una
  transizione di .01ms, quindi cambiare il corpo e misurare subito legge il valore vecchio (.pu-tit ha transition-property: none).
  Provato a 1750x702, 1280x720, 390x844 touch, animazioni ridotte, e le varianti del pannello. Non provato su telefono vero.
- 19 nov (86), Chi siamo, apertura Bottiglie 3D rifatta: "apertura bottiglie 3d puoi fare meglio daiii e poi le bottiglie grandi". Prima le due bottiglie erano alte
  poco più delle lettere. Ora sono alte quanto lo schermo (dal piano fin sotto l'header) e la scritta poggia sul piano con loro, in fondo: le i sono alte il doppio delle
  lettere, il loro posto è in pixel (largo quanto la bottiglia) e il corpo della scritta si ricava da quello che resta. La Collezione 53 arriva dalla macchina: parte a tre
  volte e mezza con l'etichetta al centro dello schermo e si allontana facendo un giro; Tre Cuori entra rotolando da destra. Le bottiglie seguono appena il puntatore, come
  in home. La frase è salita in alto a destra. Telefono: due righe, "Ch" a destra e "s amo." a sinistra, bottiglie alte il 36% dello schermo. Classe .is-b3 sull'apertura
  quando si prova il 3D; se non parte si torna alla scritta al centro con le sue i. Provato a 1750x702, 1280x720, 390x844 touch, animazioni ridotte.
- 19 nov (87), Chi siamo, altre due aperture: "voglio alternative oltre al testo che fa aprire l'immagine". Nel pannello Prove ora Apertura ha quattro voci
  (?apre=bottiglie|dentro|rullo|lettere) e c'è la riga Foto (?foto=mare|vigna|vite, per le tre con la foto; prima la foto stava dentro la voce delle Lettere).
  Dentro la bottiglia: la Collezione 53 gigante sta fra "Chi" e "siamo." (sul telefono sopra la scritta, sotto la frase); scorrendo si scioglie in una finestra della sua
  stessa forma (sagoma dal "profilo" di assets/3d/primitivo53.json, messa in una maschera svg) e ci si entra finché la foto è a tutto schermo.
  Rullo: sotto la foto con la scritta bianca, sopra un foglio bianco con la stessa scritta nera (.pu-carta) tagliato sull'asse della bottiglia, che entra da sinistra, si
  ferma al margine e scorrendo attraversa lo schermo stendendo la foto. La scritta sta a destra (84% sul computer, 78% sul telefono) per lasciare il posto alla bottiglia ferma.
  Pezzi in comune in js/pop-azienda.js: misuraParole, aPiano (.pu-base = segnaposto sulla linea di base), sale, dalVicino. Con le animazioni ridotte: finestra a bottiglia
  già aperta e ferma; foglio a metà. Provato a 1750x702 e 390x844 touch, con le tre foto a campione, e con le animazioni ridotte. Bottiglie 3D resta quella senza niente nell'indirizzo.
- 20 nov (88), il piede del Pop (pop-b, pop-vino, pop-azienda): "nel footer togli il numero in grande e metti il logo in grande da parte a parte e nel footer io metterei
  comunque le bottiglie che scorrendo riappaiono e fanno magari un altro movimento mentre rotolano sul piano e l'ombra non sotto la bottiglia ma dietro, devo dare il senso
  di essere appoggiate". Il telefono gigante è tolto (resta la riga Tel nei contatti). Ordine: tre colonne, riga legale, e in fondo il logo a tutta larghezza
  (css/pop-prove.css; sections/footer.html non cambia). Il logo è nuovo in vettoriale, assets/logo/feudi-logo.svg: marchio di feudi-marchio.svg, scritta dai tracciati della
  copertina del catalogo del cliente (Downloads/Catalogo Feudi Salentini_.pdf, pagina 0), messi sulle proporzioni del PNG del sito (confrontati: uguali). Il PNG resta per gli altri.
  Bottiglie: js/pop-piede.js (nuovo, nelle tre pagine). Le quattro dell'apertura della home tornano rotolando dai due lati e si fermano ai fianchi del castello, in piedi sulla
  scritta (PIANO = 137.2/164 dell'altezza del logo); correndo pendono all'indietro e fermandosi dondolano sullo spigolo della base (molla; metti() ha ora tz). Entrano a tempo
  quando la scritta è sullo schermo, tornando su escono. Telefono: due, alte 2,4 volte il piano. Animazioni ridotte: solo il logo. Su schermi bassi e larghi (1750x702) il logo
  riempie lo schermo: l'header si toglie quando il logo gli arriva sotto (.nav.pp-via) e il pannello Prove chiuso sparisce sopra la scritta (.pp-varianti.is-via).
  Il palco 3D è uscito da js/pop-azienda.js: js/pop-palco3d.js (palco3d, altezze), usato da Chi siamo e dal piede.
  Ombra: ombraContatto() in js/bottiglia-3d-kit.js ora dipinge l'ombra portata (luce da davanti a sinistra, cade dietro verso destra, filo scuro dove tocca) e posaOmbra()
  la mette; usata in tutte le bottiglie 3D del Pop (home, pagina del vino, Chi siamo, piede). Prima era un'ellisse sotto il piede.
  Provato: pop-azienda a 1750x702, 1280x720, 390x844 touch, animazioni ridotte a 1366x650; pop-b e pop-vino a 1750x702; foto.html (piede degli altri mood) invariato.
- 20 nov (89), piede del Pop, ordine: "la parte del footer la sposterei sopra alle info contatti cantina ecc". Il logo con le bottiglie ora sta in cima al piede,
  sotto le tre colonne e la riga legale (tolti gli order in css/pop-prove.css: è l'ordine dell'html). L'header si toglie solo dove il logo non sta tutto sotto di lui e solo
  mentre il castello gli passa sotto, poi torna (js/pop-piede.js); il pannello Prove chiuso sparisce finché la scritta è sullo schermo.
  Provato: pop-azienda a 1750x702, pop-b a 1280x720, pop-vino a 390x844 touch.
- 20 nov (90), header sul piede del Pop: "la sticky header resta sempre sul bianco come fondo blurred". Il logo gigante è un fondo nero ritagliato (.logo, maschera):
  passando sotto l'header js/nav.js (underIsDark) lo prendeva per una sezione scura e faceva l'header scuro (vetro nero, testo bianco). Ora .foot__logo .logo ha
  pointer-events: none (css/pop-prove.css), così non viene letto e l'header resta chiaro; il link è il contenitore e funziona. Tolta anche la sparizione dell'header
  (.pp-via) messa al giro (88): resta sempre. Non toccati: l'header scuro sopra le sezioni davvero scure (news della home) e senza vetro nei palchi fermi (.pp-palco):
  chiesto a lui. Provato: pop-azienda a 1750x702, col castello sotto l'header in tre posizioni.
- 20 nov (91), Chi siamo, le scelte: "pagina about scelgo Rullo nella hero, foto vigna, sostenibilità palco, vitigni palco 3d". Rullo e vigna ora sono le prime
  degli elenchi in PROVE (js/pop-azienda.js), quindi la pagina senza niente nell'indirizzo è: Rullo con la vigna, vitigni a palco 3D, sostenibilità a palco. Le altre
  (Bottiglie 3D, Dentro la bottiglia, Lettere; mare, vite; Fila; Righe) restano nel pannello Prove: non ha detto di toglierle. Provato a 1750x702 e 390x844 touch.
- 20 nov (92), check su tutti i 3D e le ombre ("fammi un check generico su tutti i 3d e le ombre", con due ritagli della Càla sul palco dei vitigni). Trovato e corretto:
  1) dietro un vetro chiaro l'ombra (la sua o quella della vicina) si vedeva attraverso la bottiglia e sembrava davanti: ora la sagoma del vetro chiaro si scrive nello
  stencil e l'ombra lì non si disegna (js/bottiglia-3d-kit.js: "sagoma" in creaBottiglia, stencilFunc in ombraContatto; three 0.160 ha lo stencil acceso di suo, da r163 va
  chiesto al renderer con stencil: true). 2) Càla e Terra Malvasia Bianca avevano l'ombra nera: l'ombra leggera la decideva la lente o la pelle, ora bott.userData.chiara
  (kit) per pop-palco3d, pop-prove e pop-vino. 3) Càla e Terra Malvasia Bianca avevano il vetro piatto (senza pelle di Blender): fatte le riprese e la pelle
  (blender -b --factory-startup -P tools/bottiglia_blender.py -- assets/3d/<nome>.json tools/blender/<nome>.png --velo; poi python -I tools/velo_blender.py tools/blender/<nome>
  assets/3d/<nome>): ora velo2d true, capsula gialla della Càla come in foto. Blender sta in Downloads/chicco-uva-3d/tools/blender-4.5.15-windows-x64 (11 s a ripresa).
  4) capsule nere lette dalla foto (125 Primitivo, 125 Negroamaro, Terra Primitivo, Terra Negroamaro) uscivano grigie (#313131, in foto #232323): colore x 0.6 nel kit.
  Non toccati, proposti a lui: stagnola di Philia, Terra Rosato e Terra Malvasia più chiara della foto (#d2d2d0 contro #6c6d68); la fascetta DOCG di Philia tolta su sua
  richiesta il 19 nov; sul palco dei vitigni la bottiglia copre il nome lungo (Negroamaro, Malvasia Bianca); l'ombra della pagina del vino finisce al bordo dello schermo.
  Provato: pop-azienda (palco vitigni, apertura), pop-b (apertura e piede), pop-vino organic-bianco e terra-negroamaro, bottiglie-3d.html, foto.html a 1600x1000 o 1400x800.
- 20 nov (92b), Chi siamo: "togli fra i filari della vigna e i colori dell'header diventano bianchi quando passa la bottiglia, altrimenti non si legge nulla". Tolta la
  didascalia dal Rullo (resta in Dentro la bottiglia e Lettere, che sono nel pannello Prove). Le voci dell'header diventano bianche una alla volta quando il taglio le ha
  passate (classe pu-sufoto, js/pop-azienda.js apreRullo; css/pop-azienda.css) e tornano nere quando il palco esce da sotto l'header; in cima alla foto un velo scuro
  leggero (.pu-apre.is-rullo .pu-foto::after) perché il bianco si legga anche sulla terra al sole. Animazioni ridotte: il taglio fermo passa dal 50% al 42% (a metà tagliava
  in due il marchio) e sul telefono al 4% (a metà la foto copriva l'inizio della frase). Provato a 1600x1000, 390x844 touch, ridotte 1366x700 e 390x844.
- 20 nov (93), Chi siamo, header sul taglio del Rullo: ha mandato il ritaglio con "Azienda" a cavallo del taglio ("Az" nero sulla foto) e "c'è questo da capire cosa
  fare". Le voci cambiavano colore tutte intere a metà: a pagina ferma (o fermandosi a metà scorrimento) una voce restava mezza illeggibile. Ora la voce che il taglio
  attraversa è di due colori, divisa proprio sul taglio come la scritta: classe pu-ataglio e --t (px dal bordo sinistro della voce) da js/pop-azienda.js, in
  css/pop-azienda.css il testo col fondo ritagliato sulle lettere e lo stesso fondo su sottolineatura, marchio e bordo delle pillole (anello con mask-composite); le frecce
  della pillola sono una voce a sé. Corretto anche: con menu o cantina aperti le voci bianche restavano bianche sul foglio crema (ora html:not(.nav-lock)). Alternativa non
  fatta, detta a lui: spostare la bottiglia ferma perché il taglio cada fra due voci (cambia la composizione). Provato a 1920x1000 (taglio su Azienda, marchio, pillola,
  cantina aperta) e 390x844 touch (pillola e Menu).
- 20 nov (94), il cambio di mood: "il mood che oggi switchiamo con il pulsante nell'header, da lì lo toglierei: facciamo un angolo in basso a destra, effetto onda, che se
  ci vado sopra si allarga per coprire tutto". Tolta la pillola .nav__mood da sections/header.html (e le sue regole in css/nav.css, css/pop-azienda.css, js/pop-azienda.js).
  Al suo posto js/main.js crea .cmood: un quarto di cerchio d'inchiostro (in Botanica crema, sul verde scuro l'inchiostro non si vedeva) col bordo che ondeggia, scritta
  "Mood"; col mouse sopra 120 ms (o tocco, o Invio) l'onda si allarga fino a coprire lo schermo, con le onde che si gonfiano mentre cresce, e dentro ci sono i mood a
  lettere giganti (nel Pop in Londrina): ognuno porta alla stessa pagina in quel mood (home, o lo stesso vino: ruolo ora da [home, azienda, vino], così pop-vino porta a
  vino-b.html?id=, prima alla home di Botanica) e la pagina nuova si apre dall'angolo (data-mood-da circle). Quello in cui si è dice "Resta qui" e chiude, come Chiudi
  (dove stava Mood) ed Esc. Chiusa col mouse sull'angolo non si riapre finché il mouse non se ne va. Pagina sotto inert e ferma mentre è aperta. Non c'è su azienda.html
  (pagina unica) né fuori dai mood. La pagina della scelta (index.html) resta la prima pagina, ma dalle pagine non ci porta più niente. Trappola trovata: [hidden] con
  display: grid resta sopra la pagina e prende tutti i clic (.cmood__scelta[hidden] { display: none }). Provato: pop-b 1600x1000 e 1366x700 (anche ridotte), pop-vino,
  botanica, pop-azienda 390x844 touch e da tastiera.
- 20 nov (95), l'angolo porta diretto: "chiamalo Pop e da Botanica porta a quella del Pop, ma non deve essere una selezione: deve già trasportarmi sull'altro, mentre si
  muove mostra già l'altra versione, che è Pop non più Fotografia". In js/main.js MOOD.f = 'Pop' e SITI.f = pop-b, pop-azienda, pop-vino (foto.html e vino-f.html restano ai
  loro indirizzi, col loro logo che ora porta a pop-b). L'angolo è un link all'altro mood (con più mood: al successivo) e porta il suo nome scritto lungo l'arco ("Botanica"
  dritto non ci stava). Col mouse sopra 150 ms, un tocco o Invio: l'onda si allarga e dentro c'è la stessa pagina dell'altro mood viva in un iframe (.cmood__vista, ritagliata
  con lo stesso path); coperto lo schermo si va lì e la pagina vera sfuma sopra la finestra (fs-mood-da "inset(0)|inset(0)|0"). L'iframe si carica quando il mouse arriva a
  360 px dall'angolo (o al fuoco del link, o al tocco), fuori schermo con le misure vere; nella finestra main.js non mette l'angolo e non scrive fs-mood. Esc durante l'onda
  la fa tornare; dopo, col mouse fermo sull'angolo, non riparte. Tornando indietro (bfcache) l'angolo è di nuovo chiuso. Tolti la scelta a lista, Chiudi e Resta qui del (94).
  Limite: Botanica cambia sala da sola, quindi la sala nella finestra può essere diversa da quella con cui si apre la pagina vera (per questo la sfumatura). Provato:
  pop-b → botanica e botanica → pop-b a 1600x1000, pop-vino?id=cala → vino-b?id=cala su 390x844 touch.
- 20 nov (96), apertura del Pop, luogo e bottone: "c'è altro che possiamo scrivere qui, o metterlo diversamente, e non so dove". Nel pannello Prove la voce Sotto
  (?riga=, js/pop-prove.js; regole in css/pop-prove.css): Ora (com'era), Numeri ("33 vini" nel carattere dei titoli + "in 6 collezioni, da Leporano sul mar Ionio", contati
  da FS.data), A sinistra (lo stesso blocco nel margine sinistro della fila), Niente (solo frase e bottiglie). In tutte, sul computer, il blocco sale di 24 px sopra l'angolo
  del mood, che toccava il bottone. Consigliata Numeri. Provato a 1600x1000 tutte e Numeri su 390x844 touch.
- 20 nov (97), Numeri scelto: "tieni Numeri, ma cambierei il testo: da Leporano sul mar Ionio non vuol dire nulla". Numeri è la home senza niente nell'indirizzo (le altre
  restano nel pannello, Ora si chiama Luogo); sotto "33 vini" ora "in 6 collezioni: 20 rossi, 8 bianchi, 4 rosati e un dolce", contati per colore da FS.data, numero e
  colore uniti (&nbsp;), riga larga 16,5rem per stare in due righe. Provato a 1600x1000, 1280x720, 390x844 touch.
- 20 nov (97b), angolo del mood: "se ci resto sopra lo completa, ma se lo tolgo torna indietro". Partita col mouse, l'onda va avanti finché il mouse resta entro una volta e
  mezza il quarto di cerchio e torna indietro se esce (anche dalla finestra); rientrando riparte da dov'era. Col clic, col dito o da tastiera si va e basta (tenuta in
  js/main.js). Provato a 1600x1000: uscita a metà = torna e resta su pop-b; fermo sull'angolo = arriva su botanica.
- 20 nov (98), angolo del mood: "si attiva come un doppio overflow". Nell'onda la pagina dell'altro mood aveva la sua barra di scorrimento accanto a quella della pagina:
  all'arrivo dell'iframe main.js gli mette scrollbar-width: none sull'html (base.css ha scrollbar-gutter: stable), così è largo come la pagina vera (1585 a 1600). Chiesto
  anche: "se hai alternative a questo sistema dimmeli, poiché aggiungeremo probabilmente anche una terza versione del mood": proposte (due angoli, angolo a ventaglio,
  linguette sul bordo, ciclo), nessuna fatta; oggi con tre mood l'angolo porterebbe al successivo, a giro.
- 20 nov (99), il cambio di mood, "proviamo 1 e 2" (i fogli e la parola, fra le alternative "più fighe"). Il codice esce da js/main.js (che ora dice solo dove porta e
  quale forma: FS.cambio = meta, dopo, nome, porta) e va in js/cambio-mood.js (caricato da sections/_scripts.html). Tre forme, ?porta= che resta per la sessione (anche in
  Botanica), voce Mood nel pannello della home Pop: angolo (com'era), fogli, parola. Fogli: l'angolo della pagina piegato (lembo color carta col nome dell'altro mood, sotto
  l'iframe dell'altro mood ritagliato col pezzo di schermo oltre la piega, bordo della piega a onda, ombra del lembo); mouse sopra = si solleva, restandoci 650 ms si sfoglia
  piano (uscendo torna); tirato col dito o col mouse segue da dove l'hai preso, lasciato con la punta oltre metà schermo va, prima torna; clic = va; un tocco senza tirare lo
  solleva e basta. Parola: i fogli, e nella home Pop la parola "mood" di "set the mood." (anche dietro le bottiglie) col mouse sopra 180 ms o il dito premuto 250 ms fa
  partire l'onda (cerchio) da lì; un rullo sopra l'onda gira da "mood" al nome dell'altro mood; uscendo o alzando il dito torna. Provato: pop-b fogli (sollevato, tirato a
  metà = torna, tirato oltre = botanica), parola (dentro, fuori = torna, dentro di nuovo = botanica), angolo ancora uguale; pop-vino?id=cala fogli su 390x844 col dito
  (tocco = solo sollevato, tirato = vino-b?id=cala). Non provato: movimento ridotto, Safari, telefono vero.
- 20 nov (100), fogli e parola bocciati: "no non mi piacciono, torniamo a come era prima". Resta solo l'angolo con l'onda (js/cambio-mood.js riscritto con la sola forma
  angolo, uguale al (97b)-(98)); tolti ?porta=, la voce Mood del pannello, la parola della home e le regole dei fogli e del rullo. Copie com'erano in
  _archivio-prove/mood-fogli-parola-20nov (LEGGIMI.txt). Provato: pop-b a 1600x1000 (uscendo torna, restando arriva su botanica, anche con ?porta=fogli nell'indirizzo),
  pop-vino?id=cala su 390x844 col tocco.
- 20 nov (101), Botanica col layout del Pop: "Botanica va cambiata: dobbiamo provare lo stesso layout di Pop ma in stile Botanica, facciamo un test per la home della Botanica".
  Nuova pagina botanica-pop.html (template generato da pop-b.template.html: stesse sezioni, bottiglie 3D e movimenti, js/pop-*.js) con css/botanica-pop.css: Montserrat e Alex
  Brush, una sala piena per sezione (Luxury apertura, ogni collezione la sua nelle schede via js/pop-collezioni.js, Terra foto, Lounge azienda, Organic premi, Classica news e
  piede), i colori di base ridefiniti dove sta la sala (--cream/--stone/--night = --c, testi chiari), piante vere intere tono su tono (apertura: ginepro; schede: la loro),
  bottoni a pillola vuoti, header chiaro (hero--dark). In js/pop-prove.js con body.bp niente caratteri del Pop né le loro voci nel pannello. Nel mood Botanica il cambio di mood
  porta a pop-b. Provato a 1600x1000, 1366x700, 390x844 touch, tutte le sezioni. Non collegata dal sito; se pop-b cambia va riallineata a mano.
- 20 nov (102), Cosa c'è in tavola: "manca quella sezione figa che era cosa c'è in tavola, che metterei in Pop e in Botanica, prima delle news". In pop-b e botanica-pop
  la sezione di sempre (sections/moderna-f-tavola.html, js/tavola.js con scheda.js e piatti-incisi.js) prima delle news. Nel Pop titolo nel carattere dei titoli, niente oro
  (linee dei piatti in inchiostro, piatto scelto pieno di pietra: css/pop-prove.css); in botanica-pop la sala degli Internazionali e il piatto scelto pieno di carta.
- 20 nov (103), "cambia la pagina di Botanica nello switch": SITI.b[0] = botanica-pop.html (js/main.js). Dal Pop l'angolo porta alla nuova Botanica e viceversa; anche il logo
  delle pagine Botanica (vino-b, azienda) porta lì. botanica.html resta al suo indirizzo.
- 20 nov (104), "il cambio del mood non deve far ristartare l'ingresso delle bottiglie": js/cambio-mood.js scrive fs-arrivo, js/main.js lo legge una volta (FS.arrivo, non
  nell'iframe) e le aperture partono finite: bottiglie della home (js/pop-prove.js), corsa del vino (js/pop-vino.js), aperture di Chi siamo (js/pop-azienda.js), lettere
  [data-subito] (js/moderna-kit.js). Provato pop-b -> botanica-pop e ritorno a 1600x1000: arrivo con le bottiglie già ferme.
- 20 nov (105), terzo mood stile azienda: "ora mi serve una versione che sarebbe il terzo mood ma stile company, dove le bottiglie sono l'ultima cosa di cui parlare".
  company.html (company.template.html, css/company.css, js/company.js): apertura con la masseria fra le vigne a tutto schermo, quattro numeri (4ª generazione, 4 vitigni,
  Equalitas 2022, i riconoscimenti contati dai dati), la famiglia, il Salento (nastro di foto che scorre a palco fermo), la filosofia coi quattro vitigni, la sostenibilità col
  bilancio 2025, i riconoscimenti per concorso, le news e per ultimi i vini come collezioni (aprono la cantina). Inter Tight, inchiostro su carta calda, oro del marchio come
  solo accento. Testi e foto veri. Non è nel cambio di mood: con tre mood l'angolo porterebbe al successivo, da decidere con lui. Logo e ancore restano sulla pagina, "Come
  nasce" nascosto. Provato a 1600x1000, 390x844 touch, ridotte a 1366x700.
- 20 nov (106), Botanica: "su Botanica non voglio sto font, e farei anche un buon uso delle forme della Botanica". Tolto Alex Brush da botanica-pop (tutto Montserrat, la frase
  dell'apertura WINES THAT / SET THE MOOD. scritta in maiuscolo per la lente del vino). La targa delle copertine (--sagoma) piena di --c2 con dentro la pianta intera in --c3:
  dietro la frase dell'apertura e dietro la bottiglia di ogni scheda (js/pop-collezioni.js). È uno span: .fo-apre__st > div (css/foto.css) la metteva sopra la tela.
- 20 nov (107), Botanica: "attenzione, non deve essere Botanica Pop: mantenere stesso schema ma mood Botanica, quindi anche va via ste cose nella Botanica, e comunque
  Montserrat no, scegliamo altro" (screenshot della frase col giro a pennarello e il nome adesivo sulla foto). In botanica-pop niente pennarello: giro e nome tolti dalle foto
  della frase (template), in Lettere (prova del pannello) il nome resta come testo semplice, le righe a pennarello di capitoli e news sono un filo dritto che si allunga
  (css/botanica-pop.css). Carattere: di base Libre Caslon (Display nei titoli, Text nei testi, corsivo per la frase della copertina), nel pannello Prove la riga Carattere con
  Instrument Serif, Young Serif e Poppins (il carattere del file Botanica del cliente); ?carattere=, body[data-carattere], js/pop-prove.js. Scritte in minuscolo (frase
  dell'apertura e nomi delle collezioni non più in maiuscolo). --bk misura le scritte giganti per carattere, --tk e --tx i titoli delle sezioni sotto. Provato a 1600x1000 coi
  quattro caratteri e a 390x844. Non toccati, da proporre: le foto storte del palco dell'azienda (girano nel movimento, js/pop-sotto.js), le bottiglie 3D sul logo nel piede.
- 20 nov (108), Cosa c'è in tavola nello stile della pagina: "queste icone stile di dove si trovano ora, questi sono disegni lineari presi dai vecchi stili che abbiamo
  accantonato". body data-piatti (js/tavola.js). Botanica: sagome a retino come le piante, fatte dagli stessi disegni (tools/piatti_botanica.py -> assets/botanica/piatti,
  contorno pieno, linee interne in negativo, buchi piccoli vuoti), color carta; il piatto scelto sta nella targa delle copertine piena di carta e prende il colore della sala.
  Pop: gli stessi disegni senza il piatto (FS.incisi(id, true)) tirati a pennarello d'inchiostro, tratto 2,2 px; il piatto scelto lo prende il giro di pennarello delle foto
  (.pp-cerchio.tv-giro, disegnato da js/pop-frase.js). Le altre pagine con la sezione (moderna F, G, H, botanica, foto) restano come prima.
- 20 nov (109), foto: "foto impostiamo lettere sia per botanica che per pop". Lettere è la sezione foto senza niente nell'indirizzo in pop-b e botanica-pop (js/pop-prove.js);
  la Frase di prima resta nel pannello come ?foto=frase (senza data-foto, come prima). Provato a 1600x1000: Lettere visibile, Frase nascosta, ?foto=frase la rimette.
- 20 nov (110), company, seconda forma: "per la company versione, scusa, vedi cosa abbiamo e rifallo" (con /critica-ui). La prima era una pagina aziendale a blocchi standard,
  con la foto della masseria che lui aveva già fatto togliere dal Chi siamo e la frase "a Leporano sul mar Ionio" che aveva bocciato: _archivio-prove/company-v1-20nov.
  Ora company.html è fatta con le parti del Chi siamo Pop (pop-azienda): apertura Lettere con "Feudi Salentini." e la foto della vigna, la famiglia coi nomi giganti e i
  numeri, il Salento a palco, la sostenibilità a palco con obiettivi e bilancio; poi premi e news della home Pop (js/pop-sotto.js) e per ultimi i vitigni con le bottiglie 3D
  e l'elenco dei vini (portano a pop-vino.html, data-pagine). css/company.css è solo il mood: Inter Tight (data-titoli e data-testi "inter", un peso, 600, -.04em), carta
  #f6f3ee e pietra #ece6dc, notte per Salento e news, l'oro solo nel bottone pieno, niente segni del Pop (le righe a pennarello sono un filo dritto che si allunga, foto
  dritte), tolta la didascalia "fra i filari della vigna". js/company.js: logo e ancore restano sulla pagina, Azienda porta alla famiglia, Come nasce nascosto.
  Toccati per lei, senza cambiare le altre pagine: js/pop-azienda.js (body data-aperture tiene solo alcune aperture e una prova con una voce sola non va nel pannello;
  data-parole sono le parole di Lettere; la pillola "I nostri vini" si nasconde con un tratto per parte, anche non attaccati) e js/pop-sotto.js (l'azienda della home solo se
  c'è). Provato a 1600x1000, 390x844 touch e animazioni ridotte; pop-azienda e pop-b ancora senza errori.
- 20 nov (111), Botanica, la lente del vino: "in botanico i testi dietro non si vede" (screenshot dell'apertura). La lente c'era, ma la pelle di Blender è fatta sul fondo
  bianco: sul colore della sala schiariva tutto e la scritta crema dietro le bottiglie chiare si spegneva. js/lente-vino.js: quando la scritta è più chiara del fondo torna
  sopra il velo del vetro per tre quarti (lo decide lo shader dai due colori; nel Pop, scuro su chiaro, niente cambia). Vale anche per i nomi delle collezioni di Botanica.
  Provato pop-b e botanica-pop a 1600x1000.
- 20 nov (112), company, terza forma: "praticamente hai rifatto la company uguale agli altri mood anche nella forma di ogni sezione, deve essere una cosa nuova" (con
  /critica-ui). La seconda forma (le parti del Chi siamo Pop) è in _archivio-prove/company-v2-chi-siamo-20nov: "vedi cosa abbiamo" voleva dire i contenuti, non le forme.
  Ora company.html si legge come una pubblicazione aziendale, con forme che non stanno negli altri mood: l'indice dei capitoli (sul computer) in copertina è grande a sinistra
  e nei primi mezzi schermi si rimpicciolisce e resta lì come guida, col capitolo in cui si è e il filo d'oro della lettura (via sopra il piede); copertina col titolo su due
  righe e la foto in bianco e nero dei filari a fascia; la sintesi in una frase coi numeri veri in oro scuro (ricontrollati sui dati); la famiglia come elenco di nomi accanto
  alla foto della vendemmia ferma, poi la masseria; il Salento su una mappa vera (costa Natural Earth 1:10m, tools/mappa_salento.py -> js/company-mappa.js) che a palco fermo
  passa dal sud Italia al Salento e si ferma su Leporano, le città che compaiono avvicinandosi, poi cinque luoghi in fila; i quattro vitigni a pannelli che si aprono (nome e
  quanti vini sempre in vista, aperto la foto e i vini, col mouse si apre quello sotto; sul telefono tutti aperti); la sostenibilità a riquadri coi fatti del bilancio 2025 e il
  bilancio da scaricare (PDF 2,9 MB, bottone d'oro); i riconoscimenti come medagliere per anno (le 65 medaglie vere impilate, il totale sopra, il dettaglio al passaggio e
  tutte in una tabella apribile); le notizie, la più recente grande; per ultimi i vini, catalogo a righe per collezione col filtro per colore e la bottiglia della riga accanto.
  Inter Tight a un peso (500), carta e pietra, oro solo per numeri, guida e bottone. css/company.css e js/company.js nuovi; js/pop-azienda.js e js/pop-sotto.js tengono le
  aggiunte del (110), che non cambiano le altre pagine. Provato a 1600x1000, 1366x700, 390x844 touch e animazioni ridotte, senza errori.
- 20 nov (113), la scelta del mood (index.html) rifatta: "questa dobbiamo ripensare in base ai nuovi aggiornamenti senza mettere company e aggiornare nomi e font".
  I mood sono quelli dello switch, Botanica (botanica-pop.html) e Pop (pop-b.html); Company fuori. Le due home ora aprono uguali (la frase "Wines that set the mood." dietro le
  quattro bottiglie), quindi la pagina è quell'apertura nei due mood insieme, divisa da un'onda: a sinistra Botanica (bordeaux della 53, targa col ginepro, Libre Caslon), a destra
  Pop (bianco e inchiostro, Londrina Solid, DM Sans). Frase e targa con le misure delle home; bottiglie = foto del catalogo messe come la fila 3D (js/pop-prove.js, disponi).
  Restano le regole del (34): uno schermo, marchio in alto al centro, in basso nome nel carattere del mood ed "Entra", ogni metà un link. Bottoni pieni tutti e due (quello a filo
  di Botanica accanto al pieno del Pop sembrava secondario; passandoci sopra oro per Botanica, pietra per Pop). L'onda è quella della prova Onda: segue il mouse, al clic copre
  lo schermo e la home si apre già composta (fs-arrivo, come il cambio di mood). Ferma non sta a metà: lì si leggeva "Wine that set the e mood"; js/mood.js cerca sulle lettere
  vere (inchiostro, non casella) un taglio per riga in cui nessuna lettera è doppia o persa e piega l'onda fra le due righe, e in alto la fa passare dal centro del marchio.
  Via la riga sotto i nomi (quella di Fotografia non valeva più) e la logica ?ora/Chiudi (dalle pagine non ci porta più niente). La pagina di prima (Cambio e Onda con sale e foto di
  Instagram) è in _archivio-prove/scelta-mood-cambio-onda-20nov. Provato a 1440x900, 1100x700, 1920x1080, 390x844 e 360x640 al tocco, 844x390, animazioni ridotte, clic fino
  alla home e ritorno indietro, senza errori. Non pubblicato.
- 20 nov (114), scelta del mood, il passaggio alla home: "e ma l'animazione delle bottiglie che entrano la devo vedere quando clicco, altrimenti non so cosa ci sia scritto dietro
  le bottiglie". La home si apriva già composta (fs-arrivo, preso dal cambio di mood): tolto. Ora al clic, mentre l'onda copre lo schermo, frase e nomi svaniscono e le bottiglie
  escono a destra (prima quella di destra); resta il fondo del mood e la home ci sfuma sopra facendo tutto il suo ingresso: la frase lettera per lettera, poi le bottiglie che
  entrano rotolando da sinistra. Si va alla home solo a bottiglie uscite (750 ms dal clic). Sul telefono svanisce anche il marchio (lì la home lo ha a sinistra, se ne vedevano due).
  Il cambio di mood dall'angolo delle pagine resta com'è (lì la pagina nuova si vede viva nell'onda, ripartire sarebbe un salto). Provato a 1440x900 su Botanica, a 390x844 al tocco su Pop,
  animazioni ridotte, senza errori.
- 24 nov (115), pagina del vino di Botanica: "vino-b deve avere la struttura come pop-vino ma con stile botanico". vino-b.template.html ora è pop-vino.template.html
  (stesso palco, bottiglia che fa da rullo, stessi capitoli e altri vini: js/pop-vino.js, css/pop-vino.css) con body.bp e css/botanica-pop.css, come la home: Libre Caslon,
  colore di sala della collezione del vino (js/dati-bf.js, lo mette js/pop-vino.js), dietro i capitoli la targa delle copertine con la sua pianta intera (scelta mia, come
  nell'apertura della home), fili dritti al posto del pennarello, gli altri vini sul tono della targa. Con le animazioni ridotte niente targa. L'indirizzo resta vino-b.html,
  quindi menu, home e angolo del mood non cambiano. La pagina di prima (Palco e Pagina, js/pagine-bf.js, che resta per vino-f.html) è in
  _archivio-prove/vino-b-palco-pagina-24nov. Se pop-vino cambia, vino-b va riallineata a mano (sono due template). Provato a 1440x900 (c53-primitivo, organic-bianco chiara con
  la lente, gocce senza 3D), 1100x700 (tre-cuori), 390x844 al tocco, animazioni ridotte, pop-vino invariata, senza errori. Non pubblicato.
- 24 nov (116), caratteri di Botanica, SCELTI: "per la Botanica font da usare Instrument Serif e per paragrafi e pulsanti sempre DM Sans". In css/botanica-pop.css
  --font-display è Instrument Serif (--bk 1.08: è stretto, a parità di larghezza sta l'8% più grande) e --font è DM Sans; la frase delle copertine (.pc-frase) è il corsivo
  dell'Instrument Serif (scelta mia: era il corsivo del Caslon). Tolta la prova dei caratteri (?carattere=, riga Carattere del pannello, regole data-carattere). Stessi caratteri
  nella metà Botanica della scelta del mood (css/mood.css, js/mood.js, index.template.html) e nella pagina del vino (vino-b). Non pubblicato.
- 24 nov (117), mega menu dei vini, ALTERNATIVE IN PROVA: "mi daresti delle alternative più funzionali e non troppo incasinate?". js/menu-prove.js + css/menu-prove.css,
  caricati da sections/_head.html e _scripts.html; attivi solo su Pop e Botanica (body.page-fo) e da 1080 px in su (sul telefono resta l'elenco). A menu aperto, nella barra
  fra le voci e il marchio, il selettore A B C D (resta per la sessione; anche ?menu=b|c|d). A = quello di adesso, non toccato. In B, C e D: una riga sola in alto con ricerca,
  colori (ripremuti si tolgono) e Chiudi; ogni vino è un link diretto alla scheda; mai più di sei bottiglie, poi "Altri vini".
    B Scaffale: le sei collezioni in una riga di schede, sotto le bottiglie grandi su un filo con nome e denominazione.
    C Indice: tutti i 33 vini in vista, una colonna per collezione; a destra la bottiglia del vino sotto il mouse con "Apri la scheda" (in Botanica sulla targa con la pianta).
       È un elenco di nomi (lui il 17 nov, sulle sezioni della home: "qui avrei voluto vedere le bottiglie"): glielo dico.
    D Collezioni: sei fasce affiancate, quella aperta mostra le sue bottiglie, le altre il nome in piedi; in Botanica ogni fascia nel suo colore di sala e la targa nella aperta.
  Ganci in js/nav.js segnati "prove del menu": FS.cantina, eventi fs:cantina-aperta e fs:cantina-cerca, cerche() contato ogni volta. I due Primaura (stesso nome e stessa
  denominazione) si distinguono con le uve. Nelle fasce conta solo il mouse che si muove (pointermove): con pointerover una fascia che si chiudeva sotto il mouse fermo si riapriva.
  A scelta fatta: tenere la forma scelta, togliere il resto e i ganci. Provato a 1440x900, 1100x700, 1366x650 su Pop e Botanica, ricerca, vuoto, Esc, Invio, Chiudi,
  apertura dal piede su una collezione, telefono invariato, pagine fuori dai mood invariate, senza errori. Non pubblicato.
- 24 nov (118), mega menu dei vini, SCELTO: "direi la versione C per pop e botanico". L'Indice è il menu dei vini di Pop e Botanica da 1080 px in su: js/menu-vini.js +
  css/menu-vini.css (da sections/_head.html e _scripts.html; attivi solo con body.page-fo, il css solo se lo script è partito: html.cm-on). Tutti i 33 vini in sei colonne,
  ogni nome porta alla scheda; a destra la bottiglia del vino sotto il mouse o col fuoco, con "Apri la scheda" (in Botanica sulla targa nel colore di sala con la pianta).
  In alto ricerca, colori e Chiudi. Aperto su una collezione (piede, pagina del vino) la sua colonna è segnata e a destra c'è il suo primo vino. Il palco di js/nav.js (.cstage)
  resta per gli altri siti; sul telefono resta l'elenco. Scaffale, Collezioni e il selettore sono in _archivio-prove/menu-vini-prove-24nov. In js/nav.js restano FS.cantina e
  gli eventi fs:cantina-aperta / fs:cantina-cerca. Provato a 1440x900 (pop-b), 1366x650 (vino-b), 1100x700 (pop-azienda), telefono, moderna-e invariata, senza errori.
