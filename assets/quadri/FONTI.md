# Quadri di moderna-f.html

Dipinti col codice da foto del progetto (tools/dipingi.py <profilo> <foto> <uscita> <larghezza>). Il file -mappa dice allo shader cosa si muove: rosso cielo, verde chiome e fiori, blu acqua.

| Quadro | Sala | Foto di partenza |
|---|---|---|
| feudo | ingresso | assets/photo/masseria-vigne.webp |
| vigne | Collezione 53 | assets/photo/alberello.webp |
| terra | Terra | assets/photo/vigna-passeggiata.webp |
| campo | 125 Organic | assets/photo/papaveri.webp |
| mare | Classica | assets/photo/mare-salento.webp |
| tramonto | 125 Uno Due Cinque | assets/photo/vigna-tramonto.webp |

In moderna-h anche notte e crema (fondi delle sezioni), macchie/ (dietro le bottiglie e i premi) e bordo (il bordo a setole con cui appaiono le sezioni): dipinti dal codice senza foto, `python -I tools/dipingi_soggetto.py --notte`.

Da verificare prima di andare online: provenienza e diritti delle foto di partenza. I capolavori provati prima sono in _archivio-giro3/capolavori.

Quadri di "Altri vini" (soggetto/terra-2, terra-3, spiaggia-2, spiaggia-3, spiaggia-4, spiaggia-5, tramonto-2, più le versioni -m): stesse foto di luogo della loro scena, con le foto delle bottiglie di assets/bottles. Dipinti da tools/dipingi_soggetto.py --altri.

Bottiglie dal catalogo del cliente (6 nov 2026, "Catalogo Feudi Salentini_.pdf", foto su fondo bianco): assets/bottles/125pinotgrigio (pag. 8), 125malvasiabianca (pag. 9), marpiccolo (pag. 13), primaura-bianca (pag. 22), primaura-blu (pag. 23).
Tolto solo il bianco attorno e messe nella cornice delle altre con `python -I tools/bottiglie_catalogo.py`; le copie dipinte in quadri/bottiglie con tools/dipingi_bottiglie.py. Foto più piccole delle altre (circa 365x895 px nel PDF): ingrandite del 5% circa.
Piatti dipinti di "Cosa c'è in tavola?" in moderna-h: quadri/piatti/, dai disegni incisi di moderna-e, `python -I tools/dipingi_piatti.py`.
Medaglie (assets/premi/medaglie/, 6 nov 2026): ritagliate dal Bilancio di sostenibilità 2025 del cliente (pag. 7-9, feudisalentini.com/wp-content/uploads/2026/08/Feudi_bilancio-di-sostenibilita_2025.pdf), tolto solo il bianco attorno.

Dal catalogo del cliente per la pagina azienda (6 nov 2026, sera): assets/photo/catalogo-vite.webp (pag. 4, 627 px), catalogo-mani.webp (pag. 6, 797 px), catalogo-vigna.webp (pag. 5, 1134x913), foto in bianco e nero così come sono, solo convertite. assets/quadri/mappa-puglia.webp: il disegno della pag. 35 (Dove trovarci) reso a 4x, senza titolo, contatti e marchio Heidelberg, bianco reso trasparente e tratto color inchiostro.
Grappolo dei numeri nella pagina azienda (6 nov 2026): assets/quadri/grappolo.webp, il grappolo di sinistra della foto del cliente assets/photo/uva.webp, scontornato e ridipinto con `python -I tools/dipingi_grappolo.py`.

Dall'11 nov 2026 le sale di soggetto/ sono ridipinte dalle stesse foto con `python -I tools/dipingi_soggetto.py` (poi `--mappe` e `--altri`): tocco che cambia con la distanza, tavolozze per pittore, bottiglie dipinte insieme al luogo, pose diverse. Nella sala Terra le due persone della foto vigna-passeggiata.webp sono tolte prima di dipingere (al loro posto la terra accanto). I quadri di prima, col loro strumento e il loro js, stanno in _archivio-prove/moderna-h-quadri-prima/.
