/* Vini dal catalogo del cliente (Catalogo Feudi Salentini, PDF, 6 nov 2026): descrizione, gradazione, resa, zona, tecnica; vista, aromi e abbinamenti ricavati dal suo testo.
   Il resto (collezioni, esperienze, premi, news, azienda) da feudisalentini.com (29 ott 2026).
   color = colore indicativo del vino nel bicchiere, ricavato dalla descrizione della scheda (non è un dato del cliente).
   check = incongruenza trovata sul sito attuale, da far confermare al cliente. */
window.FS_DATA = (() => {
  const B = 'assets/bottles/';
  const OLD = 'https://feudisalentini.com/';

  const collections = [
    { id: 'luxury', name: 'Collezione 53', line: 'Luxury', url: OLD + 'luxury/' },
    { id: 'lounge', name: '125 Uno Due Cinque', line: 'Lounge Bar', url: OLD + 'lounge-collezione/' },
    { id: 'classica', name: 'Classica', line: 'Classica', url: OLD + 'territorio-collezione/' },
    { id: 'terra', name: 'Terra', line: 'Terra', url: OLD + 'terra/' },
    { id: 'organic', name: '125 Organic', line: 'Organic', url: OLD + 'organic-collezione/' },
    { id: 'internazionali', name: 'Gli internazionali', line: 'Gli internazionali', url: OLD } // dal catalogo: sul sito non c'è ancora
  ];

  // piatti per la scelta "Cosa c'è a tavola?" (ricavati dal campo Abbinamenti di ogni scheda)
  const foods = [
    { id: 'crudo', label: 'Crudo e crostacei' },
    { id: 'pesce', label: 'Pesce' },
    { id: 'pasta', label: 'Pasta e pizza' },
    { id: 'carne', label: 'Carne rossa e brasati' },
    { id: 'selvaggina', label: 'Selvaggina' },
    { id: 'formaggi', label: 'Formaggi stagionati' },
    { id: 'freschi', label: 'Salumi e formaggi freschi' },
    { id: 'pugliese', label: 'Cucina pugliese' },
    { id: 'aperitivo', label: 'Aperitivo' },
    { id: 'dolci', label: 'Dolci di mandorla' }
  ];

  // dove finisce il vetro in ogni foto (frazione dell'altezza), misurato sull'alfa: fine_vetro in tools/dipingi_bottiglie.py. Sotto c'è il riflesso: per posare la bottiglia su un filo si sposta di (1 - fondo)
  const FONDO = { '125malvasiabianca': 0.911, '125pinotgrigio': 0.911, '125rosato': 0.914, '3CUORI': 0.914, 'appassimento': 0.910, 'begro': 0.906, 'biook-2': 0.920, 'cala': 0.910, 'claria': 0.909, 'gocce': 0.914, 'malvasia': 0.915, 'marpiccolo': 0.911, 'more': 0.912, 'negro125-1': 0.912, 'negro125': 0.915, 'negroamaro': 0.910, 'olivia': 0.914, 'philia': 0.961, 'priitivobio': 0.923, 'primaura-bianca': 0.905, 'primaura-blu': 0.904, 'primitivo53': 0.910, 'resale': 0.961, 'sassirossi': 0.909, 'suss': 0.904, 'sussrose': 0.907, 'terra': 0.910, 'terramalvasia': 0.913, 'terramalvasiabianca': 0.908, 'terraplatinum': 0.908, 'terraprimitivo': 0.913, 'terrarosato': 0.908, 'vis': 0.911 };
  // i riconoscimenti di ogni vino, come li mostra il cliente: Bilancio di sostenibilità 2025 pag. 7-9 (medaglie sopra la bottiglia, dall'alto in basso) e, per i due Terra, catalogo pag. 34.
  // concorso-medaglia-anno; l'immagine è assets/premi/medaglie/<chiave>.webp (ritagliata dal PDF, solo il bianco attorno tolto)
  const PREMI = {
    'c53-primitivo': ['awc-oro-2022', 'cmb-argento-2021', 'awc-oro-2019', 'cmb-oro-2019', 'berliner-oro-2019'],
    'c53-negroamaro': ['awc-argento-2022', 'asia-oro-2019', 'berliner-oro-2019', 'awc-argento-2019', 'cwsa-oro-2018'],
    'gocce': ['berliner-oro-2022', 'berliner-oro-2021', 'berliner-oro-2020', 'awc-oro-2019', 'berliner-oro-2019'],
    'sassirossi': ['berliner-oro-2022', 'awc-argento-2022', 'awc-oro-2021', 'berliner-oro-2020', 'awc-argento-2020'],
    'terra-gold': ['berliner-oro-2022'],
    'terra-platinum': ['berliner-oro-2021'],
    '125-primitivo': ['berliner-oro-2022', 'awc-oro-2022', 'cmb-argento-2022', 'awc-argento-2021', 'awc-argento-2020'],
    '125-negroamaro': ['berliner-oro-2022', 'decanter-bronzo-2021', 'berliner-oro-2021', 'berliner-oro-2019', 'awc-argento-2019'],
    '125-malvasia-nera': ['awc-oro-2022', 'berliner-oro-2022', 'berliner-oro-2020', 'cmb-oro-2019', 'awc-oro-2019'],
    '125-malvasia-bianca': ['awc-argento-2022', 'berliner-oro-2021', 'decanter-bronzo-2021', 'berliner-oro-2020', 'awc-argento-2020'],
    '125-rosato': ['awc-argento-2022', 'awc-seal-2020', 'berliner-oro-2019'],
    'vis': ['awc-oro-2022', 'awc-argento-2021', 'awc-argento-2020', 'awc-argento-2019', 'berliner-oro-2018'],
    'more': ['berliner-oro-2020', 'cmb-argento-2019', 'berliner-oro-2019', 'berliner-oro-2018', 'cmb-oro-2018'],
    'tre-cuori': ['berliner-oro-2020', 'awc-seal-2019'],
    'claria': ['awc-seal-2022', 'cwsa-argento-2018', 'awc-argento-2018'],
    'appassimento': ['berliner-oro-2022', 'awc-oro-2022'],
    'susumaniello-rose': ['awc-seal-2022'],
    'susumaniello': ['berliner-oro-2022', 'awc-oro-2022']
  };
  const CONCORSO = { awc: 'AWC Vienna International Wine Challenge', berliner: 'Berliner Wein Trophy', cmb: 'Concours Mondial de Bruxelles', decanter: 'Decanter World Wine Awards', asia: 'Asia Wine Trophy', cwsa: 'China Wine & Spirits Awards, Best Value' };
  const METALLO = { oro: 'Oro', argento: 'Argento', bronzo: 'Bronzo', seal: 'Seal of Approval' };
  const premio = (k) => { const [c, m, a] = k.split('-'); return { k, concorso: CONCORSO[c], medaglia: METALLO[m], anno: +a, img: 'assets/premi/medaglie/' + k + '.webp' }; };
  const w = (o) => ({ zona: 'provincia di Taranto', aromi: [], ...o, bottle: B + o.bottle + '.webp', fondo: FONDO[o.bottle] ?? 0.91, premi: (PREMI[o.id] || []).map(premio), url: o.url ? OLD + o.url + '/' : OLD }); // url vuoto: vino che il sito non ha, si va alla home

  const wines = [
    // Collezione 53 · Luxury
    w({ id: "c53-primitivo", name: "Collezione 53 Primitivo", collection: "luxury", denom: "Primitivo di Manduria DOP", tipo: "rosso", uve: "Primitivo",
      desc: "Da vecchie vigne coltivate ad alberello seguendo l’antica tradizione familiare, un’attenta selezione manuale dei singoli grappoli di Primitivo di Manduria dà vita a questo vino, dal colore rosso intenso con carichi riflessi violacei. Al naso, profumi intensi di confettura ai frutti di bosco maturi. Gusto morbido ed elegante che racchiude le caratteristiche del suo territorio. Perfetto con selvaggina, carne rossa e formaggi stagionati. Ottimo anche come vino da meditazione.",
      vista: "Rosso intenso con carichi riflessi violacei", aromi: ["confettura ai frutti di bosco maturi"], abb: "Selvaggina, carne rossa e formaggi stagionati", foods: ["carne", "selvaggina", "formaggi"],
      alcool: "15% vol.", resa: "6.000 kg", bottle: "primitivo53", url: "primitivo-di-manduria-doc", color: "#6e0c1c",
      tecnica: "Vinificazione con macerazione a temperatura controllata di 26°-28°C. Dopo la FML, affinamento in barrique, tonneau e botti, con ulteriore affinamento in bottiglia." }),
    w({ id: "gocce", name: "Gocce", collection: "luxury", denom: "Primitivo di Manduria DOP", tipo: "rosso", uve: "Primitivo",
      desc: "Da vecchie vigne nel cuore della DOP, l’accurata selezione di uve Primitivo raccolte manualmente in cassette dà vita a Gocce. È un vino dal colore rosso intenso e dai profumi di confettura, frutti di bosco e note di caramello. Gusto rotondo, morbido ed elegante, con un’importante struttura che identifica egregiamente il suo territorio. Si abbina perfettamente a carne rossa, selvaggina e formaggi stagionati accompagnati da confetture.",
      vista: "Rosso intenso", aromi: ["confettura", "frutti di bosco", "caramello"], abb: "Carne rossa, selvaggina e formaggi stagionati con confetture", foods: ["carne", "selvaggina", "formaggi"],
      alcool: "14,5% vol.", resa: "6.000 kg", bottle: "gocce", url: "gocce-3", color: "#6a0e1f",
      tecnica: "Vinificazione con macerazione a temperatura controllata di 26°-28°C. Dopo la FML, affinamento in barrique, tonneau e botti con ulteriore affinamento in bottiglia." }),
    w({ id: "c53-negroamaro", name: "Collezione 53 Negroamaro", collection: "luxury", denom: "Negroamaro Salento IGP", tipo: "rosso", uve: "Negroamaro",
      desc: "Vino dal colore rosso intenso che nasce da un’accurata selezione di uve Negroamaro. Il suo bouquet si contraddistingue per l’elegante unione della frutta rossa con cannella, tabacco, pepe nero e netti sentori di liquirizia. Al gusto si presenta equilibrato, con una persistente complessità balsamica sul finale. Ottimo da abbinare con sughi, carne rossa e formaggi stagionati.",
      vista: "Rosso intenso", aromi: ["frutta rossa", "cannella", "tabacco", "pepe nero", "liquirizia"], abb: "Sughi, carne rossa e formaggi stagionati", foods: ["carne", "formaggi", "pasta"],
      alcool: "15% vol.", resa: "8.000 – 9.000 kg", bottle: "begro", url: "negroamaro-del-salento", color: "#5c0d1a",
      tecnica: "Vinificazione con macerazione a temperatura controllata di 24°-26°C. Dopo la FML, affinamento in barrique, tonneau e botti, con ulteriore affinamento in bottiglia." }),

    // 125 Uno Due Cinque · Lounge Bar
    w({ id: "125-malvasia-nera", name: "125 Malvasia Nera", collection: "lounge", denom: "Malvasia Nera Salento IGP", tipo: "rosso", uve: "Malvasia Nera",
      desc: "Vino dal colore rosso intenso con riflessi violacei e con profumi che rimandano a sentori fruttati di lampone e melograno. Al palato è fresco ed equilibrato, con un piacevole gusto fruttato. Ottimo in abbinamento con pasta, pizza e formaggi stagionati.",
      vista: "Rosso intenso con riflessi violacei", aromi: ["lampone", "melograno"], abb: "Pasta, pizza e formaggi stagionati", foods: ["pasta", "formaggi"],
      alcool: "12,5% vol.", resa: "8.000 – 9.000 kg", bottle: "malvasia", url: "malvasia-nera-del-salento", color: "#6b1236",
      tecnica: "Vinificazione con macerazione a temperatura controllata di 24°-28°C. Dopo la FML, breve affinamento in bottiglia." }),
    w({ id: "125-negroamaro", name: "125 Negroamaro", collection: "lounge", denom: "Negroamaro Salento IGP", tipo: "rosso", uve: "Negroamaro",
      desc: "Alla vista si presenta di colore rosso deciso con riflessi amaranto e al naso si percepiscono intensi profumi di frutti di bosco, specialmente more e mirtilli. Il gusto sprigiona note fruttate di lunga persistenza, con un sapore vellutato e morbido. Si abbina a formaggi stagionati, pasta e pizza.",
      vista: "Rosso deciso con riflessi amaranto", aromi: ["frutti di bosco", "more", "mirtilli"], abb: "Formaggi stagionati, pasta e pizza", foods: ["pasta", "formaggi"],
      alcool: "12,5% vol.", resa: "8.000 – 9.000 kg", bottle: "negro125", url: "125-uno-due-cinque-negroamaro", color: "#741426",
      tecnica: "Vinificazione con macerazione a temperatura controllata di 24°-28°C. Dopo la FML, affinamento in legno e in bottiglia." }),
    w({ id: "125-primitivo", name: "125 Primitivo", collection: "lounge", denom: "Primitivo Salento IGP", tipo: "rosso", uve: "Primitivo",
      desc: "Vino dal colore rosso elegante e dal profumo intenso, con sentori di prugne mature, foglie di tabacco, confettura di ciliegia. Leggermente speziato, dona un piacevole finale con note di vaniglia e cacao. Al palato si presenta di grande struttura, morbido e ricco di tannini maturi. Si abbina a formaggi stagionati, pasta e pizza.",
      vista: "Rosso elegante", aromi: ["prugne mature", "foglie di tabacco", "confettura di ciliegia", "vaniglia", "cacao"], abb: "Formaggi stagionati, pasta e pizza", foods: ["pasta", "formaggi"],
      alcool: "12,5% vol.", resa: "8.000 – 9.000 kg", bottle: "negro125-1", url: "125-uno-due-cinque-primitivo-del-salento", color: "#721024",
      tecnica: "Vinificazione con macerazione a temperatura controllata di 24°-28°C. Dopo la FML, affinamento in legno e in bottiglia." }),
    w({ id: "125-rosato", name: "125 Rosato", collection: "lounge", denom: "Rosato Salento IGP", tipo: "rosato", uve: "",
      desc: "È un vino rosa chiaro con riflessi violacei, piacevole, elegante e leggermente mosso. I suoi inebrianti profumi richiamano frutta rossa appena raccolta. Brioso al palato, accompagna alla perfezione aperitivi e piatti leggeri. Ottimo da abbinare anche a crostacei e formaggi.",
      vista: "Rosa chiaro con riflessi violacei", aromi: ["frutta rossa appena raccolta"], abb: "Aperitivi e piatti leggeri, crostacei e formaggi", foods: ["crudo", "pesce", "aperitivo", "freschi"],
      alcool: "12,5% vol.", resa: "9.000 kg", bottle: "125rosato", url: "125-uno-due-cinque", color: "#eba9a1",
      tecnica: "Breve criomacerazione pellicolare in pressa soffice cui segue la pulizia del mosto per flottazione dei sedimenti a mezzo di azoto. La fermentazione viene termo controllata a 15°C e bloccata a 12,5% vol. di alcool con freddo e filtrazione tangenziale. Affinamento in acciaio con sospensione periodica delle fecce mediante iniezione di anidride carbonica." }),
    w({ id: "125-pinot-grigio", name: "125 Pinot Grigio", collection: "lounge", denom: "Pinot Grigio Puglia IGP", tipo: "bianco", uve: "Pinot Grigio",
      desc: "Vino dall’ intenso colore giallo paglierino. Al naso fruttato con note floreali. Sapido, elegante ed equilibrato al palato con sentori di pera matura, mela, agrumi e acacia. Si abbina perfettamente con crostacei, insalate di mare e piatti a base di pesce.",
      vista: "Giallo paglierino intenso", aromi: ["fiori", "pera matura", "mela", "agrumi", "acacia"], abb: "Crostacei, insalate di mare e piatti di pesce", foods: ["crudo", "pesce"],
      alcool: "12,5% vol.", resa: "9.000 – 10.000 kg", bottle: "125pinotgrigio", url: "lounge-collezione", color: "#e7da8a",
      tecnica: "Lieve macerazione, pressatura soffice, fermentazione a temperatura controllata di 14°C. Affinamento in acciaio." }),
    w({ id: "125-malvasia-bianca", name: "125 Malvasia Bianca", collection: "lounge", denom: "Malvasia Bianca Salento IGP", tipo: "bianco", uve: "Malvasia Bianca",
      desc: "Questo vino dall’intenso colore giallo con sfumature dorate, nasce dall’incontro del sole della Puglia con l’uva Malvasia Bianca. Al naso si presenta aromatico e fruttato. Freschezza ed equilibrio caratterizzano il suo gusto armonico, persistente e delicato. Accompagna egregiamente i piatti a base di pesce, crostacei, formaggi e insalate.",
      vista: "Giallo intenso con sfumature dorate", aromi: ["note aromatiche", "frutta"], abb: "Piatti di pesce, crostacei, formaggi e insalate", foods: ["pesce", "crudo", "freschi"],
      alcool: "12,5% vol.", resa: "12.000 – 13.000 kg", bottle: "125malvasiabianca", url: "lounge-collezione", color: "#e2cf72",
      tecnica: "24 ore di macerazione, pressatura soffice, fermentazione a temperatura controllata di 14°C. Affinamento in acciaio." }),

    // Classica
    w({ id: "sassirossi", name: "Sassirossi", collection: "classica", denom: "Primitivo di Manduria DOP", tipo: "rosso", uve: "Primitivo",
      desc: "Le uve Primitivo da cui si ottiene Sassirossi vengono raccolte nei vigneti allevati ad alberello. Il suo colore è rosso intenso con vivaci riflessi violacei. I penetranti profumi di questo vino richiamano confetture di frutta, ribes nero, mora, ciliegia, cacao e liquirizia. Al palato ha un gusto rotondo, morbido e ben bilanciato. Adatto per accompagnare tutto il pasto, in particolare sughi di carne, intingoli, stufati, carni rosse alla griglia e brasati.",
      vista: "Rosso intenso con vivaci riflessi violacei", aromi: ["confetture di frutta", "ribes nero", "mora", "ciliegia", "cacao", "liquirizia"], abb: "Tutto il pasto: sughi di carne, intingoli, stufati, carni rosse alla griglia e brasati", foods: ["carne", "pugliese"],
      alcool: "14% vol.", resa: "6.000 – 7.000 kg", zona: "provincia sud di Taranto", bottle: "sassirossi", url: "primitivo-di-manduria-dop", color: "#66102a",
      tecnica: "Vinificazione con macerazione a temperatura controllata a 26°-28°C. Dopo la FML, affinamento in barrique, tonneau e botti con ulteriore affinamento in bottiglia." }),
    w({ id: "tre-cuori", name: "Tre Cuori", collection: "classica", denom: "Rosa di Primitivo Puglia IGP", tipo: "rosato", uve: "Primitivo",
      desc: "Vino dal colore rosa cerasuolo. Bouquet che richiama piccoli frutti rossi, con note balsamiche. Gusto fresco, dal piacevole finale sapido. Ottimo con salumi e formaggi freschi o con piatti tipici pugliesi a base di pesce.",
      vista: "Rosa cerasuolo", aromi: ["piccoli frutti rossi", "note balsamiche"], abb: "Salumi e formaggi freschi, piatti pugliesi a base di pesce", foods: ["freschi", "pesce", "pugliese"],
      alcool: "13% vol.", resa: "9.000 kg", bottle: "3CUORI", url: "rosa-di-primitivo-puglia-tre-cuori", color: "#d8645c",
      tecnica: "Breve criomacerazione e pressatura soffice. Fermentazione a temperatura controllata di 15°C - 16 °C. Affinamento in acciaio con sospensione periodica delle fecce." }),
    w({ id: "cala", name: "Càla", collection: "classica", denom: "Verdeca Salento IGP", tipo: "bianco", uve: "Verdeca",
      desc: "Càla si presenta di colore giallo trasparente, tendente al verdolino. Al naso emana essenze floreali con intense note agrumate. Al gusto, è un vino con una buona freschezza supportata da un tocco di sapidità e una giusta corposità. Il finale è persistente e rimanda a note di mandorla e mela. Accompagna egregiamente crostacei e primi piatti a base di vongole.",
      vista: "Giallo trasparente tendente al verdolino", aromi: ["fiori", "agrumi", "mandorla", "mela"], abb: "Crostacei e primi piatti a base di vongole", foods: ["crudo", "pesce"],
      alcool: "11,5% vol.", resa: "8.000 – 9.000 kg", bottle: "cala", url: "cala", color: "#e6db8f",
      tecnica: "Vinificazione con pressatura soffice, fermentazione a temperatura controllata di 14°C. Affinamento in acciaio." }),
    w({ id: "philia", name: "Philia", collection: "classica", denom: "Primitivo di Manduria Dolce Naturale DOCG", tipo: "dolce", uve: "Primitivo",
      desc: "Al naso sprigiona prevalentemente aromi di ciliegia, prugna matura, ribes nero e note speziate. Vino di ottima struttura, al gusto si presenta opulento, ricco di piacevoli sentori di varie spezie e con una forte presenza di liquirizia. Accompagna egregiamente i dolci a base di mandorle e anche i formaggi stagionati.",
      vista: "Rosso granato", aromi: ["ciliegia", "prugna matura", "ribes nero", "spezie", "liquirizia"], abb: "Dolci a base di mandorle e formaggi stagionati", foods: ["dolci", "formaggi"],
      alcool: "15+4% vol.", resa: "4.000 – 5.000 kg", zona: "Manduria, a sud di Taranto", bottle: "philia", url: "philia", color: "#4b0e18",
      tecnica: "Vinificazione con macerazione a temperatura controllata di max 26°C. Il ciclo di fermentazione si arresta spontaneamente a circa 15 gradi alcolici. Affinamento in barrique, tonneau e botti, con ulteriore affinamento in bottiglia.",
      check: "Il catalogo scrive Primitivo di Manduria DOCG: qui resta la denominazione per esteso, Dolce Naturale DOCG" }),
    w({ id: "re-sale", name: "Re Sale", collection: "classica", denom: "Primitivo Salento IGP", tipo: "rosso", uve: "Primitivo",
      desc: "Re Sale nasce da uve Primitivo. Il suo nome deriva da uno degli antichi re del Salento, “Re Sale”, da cui, secondo una leggenda, si è originato il nome stesso della zona. Questo vino si presenta di colore rosso carico, dai profumi delicati e dal gusto ricco, elegante e speziato. La morbidezza dei tannini e la versatilità di abbinamento con svariati piatti della cucina mediterranea rendono questo vino netto e pulito.",
      vista: "Rosso carico", aromi: ["amarena", "prugna", "spezie"], abb: "Piatti della cucina mediterranea", foods: ["pugliese", "pasta"],
      alcool: "14% vol.", resa: "8.000 – 9.000 kg", bottle: "resale", url: "resale", color: "#6e0f22",
      tecnica: "Vinificazione con macerazione a temperatura controllata di 24°-28°C. Dopo la FML, affinamento in legno e in bottiglia." }),
    w({ id: "vis", name: "Vis", collection: "classica", denom: "Primitivo Tarantino IGP", tipo: "rosso", uve: "Primitivo e Aglianico",
      desc: "Dalla perfetta combinazione tra la coltivazione con tecniche tradizionali delle vigne presenti nella provincia di Taranto e la migliore selezione di uve Primitivo e Aglianico, nasce Vis. È un vino dal colore rosso intenso con sfumature violacee, dai profumi pieni di frutti rossi maturi e gradevoli note speziate. Al gusto si presenta equilibrato, sapido con una piacevole persistenza finale aromatica. Adatto per accompagnare carni speziate, selvaggina, formaggi stagionati e piccanti.",
      vista: "Rosso intenso con sfumature violacee", aromi: ["frutti rossi maturi", "spezie"], abb: "Carni speziate, selvaggina, formaggi stagionati e piccanti", foods: ["carne", "selvaggina", "formaggi"],
      alcool: "14% vol.", resa: "8.000 – 9.000 kg", bottle: "vis", url: "vis-primitivo-tarantino", color: "#5f1030",
      tecnica: "Vinificazione con macerazione a temperatura controllata di 26°-28°C. Dopo la FML, affinamento in legno e in bottiglia." }),
    w({ id: "more", name: "More", collection: "classica", denom: "Salice Salentino DOP", tipo: "rosso", uve: "Negroamaro",
      desc: "Vino rosso carico, con un bouquet fruttato e intensi sentori di vaniglia, cacao e caffè. Al palato è elegante, armonioso ed equilibrato, con un lungo retrogusto fruttato e speziato. Ideale da abbinare con cacciagione, carni rosse e crostacei.",
      vista: "Rosso carico", aromi: ["frutta", "vaniglia", "cacao", "caffè", "spezie"], abb: "Cacciagione, carni rosse e crostacei", foods: ["carne", "selvaggina", "crudo"],
      alcool: "13,5% vol.", resa: "8.000 – 9.000 kg", zona: "comuni di Salice Salentino, Guagnano, Campi Salentina", bottle: "more", url: "more-salice-salentino-dop", color: "#6a1020",
      tecnica: "Vinificazione con macerazione a temperatura controllata di 26°-28°C. Dopo la FML, affinamento in bottiglia." }),
    w({ id: "claria", name: "Claria", collection: "classica", denom: "Verdeca Sauvignon Puglia IGP", tipo: "bianco", uve: "Verdeca e Sauvignon",
      desc: "Dal blend di morbido Verdeca e fresco Sauvignon nasce questo vino dal limpido colore paglierino, con sfumature verdoline. Il suo elegante bouquet richiama aromi floreali e note citriche. Al palato è persistente ed equilibrato. Vino stimolante con formaggi freschi e piatti di mare. Ideale anche come aperitivo.",
      vista: "Paglierino limpido con sfumature verdoline", aromi: ["fiori", "note citriche"], abb: "Formaggi freschi e piatti di mare, anche come aperitivo", foods: ["pesce", "crudo", "freschi", "aperitivo"],
      alcool: "12% vol.", resa: "9.000 kg", bottle: "claria", url: "verdeca-sauvignon-puglia-igp-claria", color: "#e3dd96",
      tecnica: "Vinificazione con pressatura soffice, fermentazione a temperatura controllata di 14°C. Affinamento in acciaio." }),
    w({ id: "olivia", name: "Olivia", collection: "classica", denom: "Chardonnay Puglia IGP", tipo: "bianco", uve: "Chardonnay",
      desc: "Vino dal colore dorato, con note fruttate e di mandorla. Gusto morbido, con una buona acidità. Ideale con crostacei e piatti di pesce.",
      vista: "Dorato", aromi: ["frutta", "mandorla"], abb: "Crostacei e piatti di pesce", foods: ["crudo", "pesce"],
      alcool: "13,5% vol.", resa: "9.000 kg", bottle: "olivia", url: "olivia-chardonnay-di-puglia", color: "#dcbd5e",
      tecnica: "Vinificazione con pressatura soffice, fermentazione in barrique a 16°-18°C. Affinamento in legno e in bottiglia sulle fecce fini a bâtonnage periodici sino alla fine di Febbraio." }),
    w({ id: "susumaniello", name: "Susumaniello", collection: "classica", denom: "Susumaniello Salento IGP", tipo: "rosso", uve: "Susumaniello",
      desc: "Il vitigno autoctono Susumaniello, che qui cresce nel cuore del Salento, produce questo vino di colore rosso intenso. Profumi di frutta rossa matura trovano una nota speziata; al palato è strutturato con tannini maturi e grande persistenza. Ideale con carne e piatti tipici della tradizione pugliese.",
      vista: "Rosso intenso", aromi: ["frutta rossa matura", "spezie"], abb: "Carne e piatti della tradizione pugliese", foods: ["carne", "pugliese"],
      alcool: "14% vol.", resa: "8.000 – 9.000 kg", zona: "Salento", bottle: "suss", url: "susumaniello-igp", color: "#6c0e20",
      tecnica: "Breve macerazione prefermentativa delle uve diraspate a una temperatura di 12-14°C per estrarne gli aromi caratteristici a cui segue una fermentazione di 15-20 giorni a temperatura controllata di 24-26°C. Poi si procede alla separazione del vino dalle bucce per avviare la fermentazione malolattica. Infine il vino matura in legno e in bottiglia." }),
    w({ id: "susumaniello-rose", name: "Susumaniello Rosé", collection: "classica", denom: "Susumaniello Salento IGP", tipo: "rosato", uve: "Susumaniello",
      desc: "Dalle Uve Susumaniello allevate nel cuore del Salento nasce un vino di colore rosa tenue con riflessi violacei. Gli intensi profumi di questo vino ricordano la frutta rossa appena raccolta. Al palato si presenta come un vino delicato ma dal carattere deciso con una buona acidità e persistenza. Ideale per aperitivo e abbinato a primi piatti di pesce e della tradizione pugliese.",
      vista: "Rosa tenue con riflessi violacei", aromi: ["frutta rossa appena raccolta"], abb: "Aperitivo, primi piatti di pesce e della tradizione pugliese", foods: ["aperitivo", "pesce", "pugliese"],
      alcool: "13% vol.", resa: "6.000 – 7.000 kg", zona: "Salento", bottle: "sussrose", url: "susumaniello-rose-vino-puglia", color: "#e7a4b0",
      tecnica: "Breve crio-macerazione e pressatura soffice. Fermentazione a temperatura controllata di 15°C-16°C. Affinamento in acciaio con sospensione periodica delle fecce." }),
    w({ id: "appassimento", name: "Appassimento", collection: "classica", denom: "Rosso Puglia IGP", tipo: "rosso", uve: "Negroamaro, Primitivo e Malvasia Nera",
      desc: "Dai vitigni Negroamaro, Primitivo e Malvasia Nera appassiti per circa 20 giorni per far disidratare leggermente l’uva, nasce un vino di colore rosso deciso. Gli intensi profumi di questo vino ricordano i frutti rossi maturi con note di vaniglia e cacao. Al palato si confermano gli aromi. È corposo, ideale per piatti a base di carne.",
      vista: "Rosso deciso", aromi: ["frutti rossi maturi", "vaniglia", "cacao"], abb: "Piatti a base di carne", foods: ["carne"],
      alcool: "15% vol.", resa: "8.000 – 9.000 kg", zona: "Salento", bottle: "appassimento", url: "appassimento-vino-rosso-di-puglia", color: "#5e0c1c",
      tecnica: "Vinificazione fatta con macerazione pre-fermentativa dell’uva diraspata a una temperatura di 12°-14°C per estrarne gli aromi caratteristici a cui segue una fermentazione di 20-25 giorni a temperatura controllata di 24°-26°C. Terminata la fermentazione alcolica, si procede alla separazione del vino dalle bucce per avviare la fermentazione malolattica. Terminata la fermentazione malolattica, il vino matura in legno e in bottiglia." }),
    w({ id: "marpiccolo", name: "Marpiccolo", collection: "classica", denom: "Fiano Salento IGP", tipo: "bianco", uve: "Fiano",
      desc: "Fiano, dal colore giallo chiaro con lievi riflessi dorati. All’olfatto presenta un ampio e intenso bouquet aromatico con sentori di pera matura e fiori di sambuco. Al gusto le note di mandorla e agrumi sono supportate da una dolce freschezza e delicata sapidità.",
      vista: "Giallo chiaro con lievi riflessi dorati", aromi: ["pera matura", "fiori di sambuco", "mandorla", "agrumi"], abb: "", foods: [],
      alcool: "13% vol.", resa: "9.000 kg", zona: "Salento", bottle: "marpiccolo", url: "territorio-collezione", color: "#e9df9a",
      tecnica: "Vinificazione con pressatura soffice, fermentazione a temperatura controllata di 14°C. Affinamento in acciaio." }),

    // Terra
    w({ id: "terra-platinum", name: "Terra Platinum Edition", collection: "terra", denom: "Primitivo di Manduria DOP", tipo: "rosso", uve: "Primitivo",
      desc: "Bouquet penetrante di confetture di frutta, ribes nero, mora, ciliegia, cioccolato e liquirizia. Gusto rotondo, morbido ed equilibrato. Ideale con sughi di carne, intingoli, stufati, carni rosse alla griglia e brasati.",
      vista: "Rosso", aromi: ["confetture di frutta", "ribes nero", "mora", "ciliegia", "cioccolato", "liquirizia"], abb: "Sughi di carne, intingoli, stufati, carni rosse alla griglia e brasati", foods: ["carne"],
      alcool: "14% vol.", resa: "6.000 kg", zona: "provincia sud di Taranto", bottle: "terraplatinum", url: "terra-primitivo-di-manduria-dop", color: "#620e20",
      tecnica: "Vinificazione con macerazione a temperatura controllata a 26°-28°C. Dopo la FML, affinamento in barrique, tonneau e botti con ulteriore affinamento in bottiglia." }),
    w({ id: "terra-gold", name: "Terra Gold Edition", collection: "terra", denom: "Primitivo di Manduria DOP", tipo: "rosso", uve: "Primitivo",
      desc: "Bouquet di confettura, frutti di bosco e note di caramello. Al palato rotondo, morbido, elegante e strutturato. Perfetto con carne rossa, selvaggina e formaggi stagionati con confetture.",
      vista: "Rosso", aromi: ["confettura", "frutti di bosco", "caramello"], abb: "Carne rossa, selvaggina e formaggi stagionati con confetture", foods: ["carne", "selvaggina", "formaggi"],
      alcool: "14% vol.", resa: "6.000 kg", bottle: "terra", url: "terra-gold-primitivo-di-manduria-dop", color: "#680f1e",
      tecnica: "Vinificazione con macerazione a temperatura controllata a 26°-28°C. Dopo la FML, affinamento in barrique, tonneau e botti con ulteriore affinamento in bottiglia." }),
    w({ id: "terra-primitivo", name: "Terra Primitivo", collection: "terra", denom: "Primitivo Salento IGP", tipo: "rosso", uve: "Primitivo",
      desc: "Bouquet intenso, con sentori di prugne mature, foglie di tabacco, confettura di ciliegie e note di cacao. Gusto strutturato, morbido e ricco di tannini maturi. Perfetto con pasta, pizza e formaggi stagionati.",
      vista: "Rosso", aromi: ["prugne mature", "foglie di tabacco", "confettura di ciliegie", "cacao"], abb: "Pasta, pizza e formaggi stagionati", foods: ["pasta", "formaggi"],
      alcool: "12,5% vol.", resa: "9.000 kg", bottle: "terraprimitivo", url: "terra-primitivo-del-salento-igp", color: "#701024",
      tecnica: "Vinificazione con macerazione a temperatura controllata di 24°-28°C. Dopo la FML, affinamento in legno e in bottiglia." }),
    w({ id: "terra-negroamaro", name: "Terra Negroamaro", collection: "terra", denom: "Negroamaro Salento IGP", tipo: "rosso", uve: "Negroamaro",
      desc: "Al naso intense note di frutti di bosco come more e mirtilli. Gusto fruttato persistente, vellutato e morbido. Ideale con pasta, pizza e formaggi stagionati.",
      vista: "Rosso", aromi: ["frutti di bosco", "more", "mirtilli"], abb: "Pasta, pizza e formaggi stagionati", foods: ["pasta", "formaggi"],
      alcool: "12,5% vol.", resa: "9.000 kg", bottle: "negroamaro", url: "terra-negroamaro-del-salento", color: "#6a1226",
      tecnica: "Vinificazione con macerazione a temperatura controllata di 24°-28°C. Dopo la FML, affinamento in legno e in bottiglia." }),
    w({ id: "terra-malvasia-bianca", name: "Terra Malvasia Bianca", collection: "terra", denom: "Malvasia Bianca Salento IGP", tipo: "bianco", uve: "Malvasia Bianca",
      desc: "Al naso aromatico e fruttato. Gusto delicato, fresco, equilibrato e persistente. Ideale con piatti di pesce, crostacei, formaggi e insalate.",
      vista: "Paglierino", aromi: ["frutta"], abb: "Piatti di pesce, crostacei, formaggi e insalate", foods: ["pesce", "crudo", "freschi"],
      alcool: "12,5% vol.", resa: "9.000 kg", bottle: "terramalvasiabianca", url: "terra-malvasia-bianca-salento-igp", color: "#e6d98c",
      tecnica: "24 ore di macerazione, pressatura soffice, fermentazione a temperatura controllata di 14°C. Affinamento in acciaio." }),
    w({ id: "terra-malvasia-nera", name: "Terra Malvasia Nera", collection: "terra", denom: "Malvasia Nera Salento IGP", tipo: "rosso", uve: "Malvasia Nera",
      desc: "Sentori fruttati di lampone e melograno. Al palato è fresco ed equilibrato, con un piacevole gusto fruttato. Ottimo con pasta, pizza e formaggi stagionati.",
      vista: "Rosso", aromi: ["lampone", "melograno"], abb: "Pasta, pizza e formaggi stagionati", foods: ["pasta", "formaggi"],
      alcool: "12,5% vol.", resa: "9.000 kg", bottle: "terramalvasia", url: "terra-malvasia-nera-salento-igp", color: "#6b1236",
      tecnica: "Vinificazione con macerazione a temperatura controllata di 24°-28°C. Dopo la FML, breve affinamento in bottiglia." }),
    w({ id: "terra-rosato", name: "Terra Rosato", collection: "terra", denom: "Rosato Salento IGP", tipo: "rosato", uve: "",
      desc: "Profumi intensi di frutta rossa appena raccolta. Brioso, piacevole ed elegante al palato. Perfetto con piatti leggeri, aperitivi, crostacei e formaggi.",
      vista: "Rosato", aromi: ["frutta rossa appena raccolta"], abb: "Piatti leggeri, aperitivi, crostacei e formaggi", foods: ["aperitivo", "crudo", "freschi"],
      alcool: "12,5% vol.", resa: "9.000 kg", bottle: "terrarosato", url: "terra-rosato-del-salento-igp", color: "#e59a90",
      tecnica: "Breve criomacerazione pellicolare in pressa soffice cui segue la pulizia del mosto per flottazione dei sedimenti a mezzo di azoto. La fermentazione viene termo controllata a 15°C e bloccata a 12,5% vol. di alcool con freddo e filtrazione tangenziale. Affinamento in acciaio con sospensione periodica delle fecce mediante iniezione di anidride carbonica." }),

    // 125 Organic
    w({ id: "organic-bianco", name: "125 Bianco Organic", collection: "organic", denom: "Bianco Puglia IGP biologico", tipo: "bianco", uve: "",
      desc: "Il colore giallo paglierino di questo vino Bianco Biologico presenta riflessi verdolini. I suoi eleganti profumi aromatici ricordano note di fiori bianchi, unite a sentori agrumati e fruttati. L’equilibrata acidità rende il suo gusto persistente e fresco. Si abbina perfettamente a crostacei, pesce crudo e insalate di stagione.",
      vista: "Giallo paglierino con riflessi verdolini", aromi: ["fiori bianchi", "agrumi", "frutta"], abb: "Crostacei, pesce crudo e insalate di stagione", foods: ["crudo", "pesce"],
      alcool: "12,5% vol.", resa: "8.000 – 9.000 kg", bottle: "biook-2", url: "bianco-puglia-biologico", color: "#e4dc8e",
      tecnica: "Vinificazione con pressatura soffice. Fermentazione a temperatura controllata di 14°C. Affinamento in acciaio." }),
    w({ id: "organic-primitivo", name: "125 Primitivo Organic", collection: "organic", denom: "Primitivo Puglia IGP biologico", tipo: "rosso", uve: "Primitivo",
      desc: "Vino rosso elegante con riflessi violacei. Bouquet intenso, con sentori di prugne mature, foglie di tabacco e cacao. Gusto strutturato, morbido e ricco di tannini maturi. Perfetto con formaggi stagionati, pasta e pizza.",
      vista: "Rosso elegante con riflessi violacei", aromi: ["prugne mature", "foglie di tabacco", "cacao"], abb: "Formaggi stagionati, pasta e pizza", foods: ["formaggi", "pasta"],
      alcool: "12,5% vol.", resa: "8.000 – 9.000 kg", bottle: "priitivobio", url: "primitivo-puglia-bio-organic", color: "#64102e",
      tecnica: "Vinificazione con macerazione a temperatura controllata di 24°-26°C. Breve affinamento in bottiglia." }),

    // Gli internazionali
    w({ id: "primaura", name: "Primaura", collection: "internazionali", denom: "Rosso Puglia IGP", tipo: "rosso", uve: "Cabernet Sauvignon, Primitivo e Syrah",
      desc: "Dal colore rosso deciso. Profumi intensi che richiamano sensazioni come confettura di frutta, ribes nero, mora, ciliegia, cioccolato e liquirizia. Vino morbido, con una persistenza finale.",
      vista: "Rosso deciso", aromi: ["confettura di frutta", "ribes nero", "mora", "ciliegia", "cioccolato", "liquirizia"], abb: "", foods: [],
      alcool: "14% vol.", resa: "12.000 kg", zona: "Puglia", bottle: "primaura-bianca", url: "", color: "#5e0f22",
      tecnica: "Vinificazione con macerazione a temperatura controllata di 26°-28°C. Affinamento in legno e in bottiglia." }),
    w({ id: "primaura-nero-di-troia", name: "Primaura", collection: "internazionali", denom: "Rosso Puglia IGP", tipo: "rosso", uve: "Primitivo, Nero di Troia, Syrah e Cabernet Sauvignon",
      desc: "Dal colore rosso deciso. Profumo intenso di frutta rossa, ribes nero e note di ciliegia. Al palato, frutta scura, pepe verde e spezie. Rotondo e pieno, ma allo stesso tempo morbido ed elegante con un finale lungo e persistente.",
      vista: "Rosso deciso", aromi: ["frutta rossa", "ribes nero", "ciliegia", "frutta scura", "pepe verde", "spezie"], abb: "", foods: [],
      alcool: "14% vol.", resa: "12.000 kg", zona: "Puglia", bottle: "primaura-blu", url: "", color: "#4f0d1e",
      tecnica: "Vinificazione con macerazione a temperatura controllata di 26°-28°C. Affinamento in legno e in bottiglia." })
  ];

  // vino fuori catalogo citato nelle esperienze
  const malvasiaBianca125 = { id: null, name: '125 Malvasia Bianca', denom: 'Malvasia Bianca Salento IGP', tipo: 'bianco', color: '#e6d98c' };

  const experiences = [
    { id: 'calice', name: 'Un calice di Feudi Salentini', price: 17, min: 2, durata: '1 h 30′',
      desc: 'Una passeggiata tra i vigneti, una visita veloce alla produzione e poi in cantina a degustare tre vini.',
      include: ['Visita alle vigne', 'Passeggiata nella masseria', 'Degustazione in cantina', '3 vini'],
      wines: ['125-negroamaro', malvasiaBianca125, '125-primitivo'],
      photos: ['assets/photo/alberello.webp', 'assets/photo/vigna-passeggiata.webp', 'assets/photo/masseria-cortile.webp'],
      url: OLD + 'prodotto/un-calice-di-feudi-salentini/' },
    { id: 'assaporare', name: 'La Puglia da assaporare', price: 37, min: 2, durata: '2 h',
      desc: 'Visita alla masseria di famiglia, passeggiata nelle vigne di Primitivo ad alberello e degustazione in cantina di quattro rossi con un assaggio di prodotti locali.',
      include: ['Visita alla masseria', 'Vigne di Primitivo ad alberello', 'Prodotti locali in abbinamento', '4 vini'],
      wines: ['125-negroamaro', 'susumaniello', 'sassirossi', 'philia'],
      lunch: { price: 50, label: 'Con pranzo di piatti tipici pugliesi' },
      photos: ['assets/photo/ulivo-trulli.webp', 'assets/photo/barriques.webp', 'assets/photo/masseria-vigne.webp'],
      url: OLD + 'prodotto/la-puglia-da-assaporare/',
      check: 'Partecipanti minimi: 2 nei dati, 6 nella descrizione. Il testo cita il 125 Primitivo, la lista dei vini il 125 Negroamaro' },
    { id: 'picnic', name: 'Voglia di pic nic', price: 37, min: 5, durata: '2 h 30′',
      desc: 'Visita alla cantina, passeggiata nella masseria di famiglia e picnic nel vigneto con tre vini della collezione 125 e specialità pugliesi. Meteo permettendo.',
      include: ['Passeggiata nella masseria', 'Visita ai vigneti', 'Prodotti locali in abbinamento', '3 vini'],
      wines: ['125-rosato', malvasiaBianca125, '125-primitivo'],
      photos: ['assets/photo/picnic-calici.webp', 'assets/photo/vigna-tramonto.webp', 'assets/photo/papaveri.webp'],
      url: OLD + 'prodotto/voglia-di-pic-nic/' }
  ];
  const lingue = 'Italiano, inglese, polacco, tedesco, cinese, russo';

  const awards = [
    { name: 'James Suckling', text: 'Due Primitivo di Manduria DOP premiati da James Suckling.', logo: 'assets/photo/james-suckling.webp', url: OLD + 'james-suckling-premia-i-vini-feudi-salentini/' },
    { name: 'AWC Vienna', text: 'International Wine Challenge, tra i concorsi enologici più grandi al mondo.', logo: 'assets/premi/awc.png', url: OLD + 'awc-vienna-international-wine-challenge/' },
    { name: 'Concours Mondial de Bruxelles', text: 'Concorso internazionale itinerante dei vini.', logo: 'assets/premi/concours.png', url: OLD + 'concours-mondial-de-bruxelles/' },
    { name: 'Mundus Vini', text: 'Tra i concorsi internazionali più prestigiosi del settore.', logo: 'assets/premi/mundus.png', url: OLD + 'mundus-vini/' },
    { name: 'Berliner Wein Trophy', text: 'Il principale concorso enologico internazionale in Germania.', logo: 'assets/premi/berliner.png', url: OLD + 'berlin-wine-trophy/' }
  ];

  const news = [
    { title: 'Feudi Salentini a ProWein 2026: i vini del Salento protagonisti a Düsseldorf', date: 'Marzo 2026', img: 'assets/photo/prowein-2026.webp', url: OLD + 'feudi-salentini-a-prowein-2026-i-vini-del-salento-protagonisti-a-dusseldorf/' },
    { title: 'Al Vinitaly tante novità', date: '54ª edizione di Vinitaly', img: 'assets/photo/barriques.webp', url: OLD + 'feudi-salentini-vinitaly-puglia/' },
    { title: 'Berliner Wein Trophy 2017: medaglia d’oro al Primitivo', date: '2017', img: 'assets/premi/berliner.png', url: OLD + 'berliner-wein-trophy-2017-medaglia-doro-al-primitivo/' }
  ];

  const company = {
    name: 'Feudi Salentini srl',
    address: 'Via Esterna Talsano, 36 · 74020 Leporano (TA)',
    tel: '+39 099 5315370', fax: '+39 099 5315739', piva: '02592180737',
    sostenibilita: OLD + 'wp-content/uploads/2026/08/Feudi_bilancio-di-sostenibilita_2025.pdf',
    check: 'Il footer del sito riporta due indirizzi: Via Esterna Talsano 36 e Via Amendola 36'
  };

  const byId = Object.fromEntries(wines.map((x) => [x.id, x]));
  return { collections, foods, wines, byId, experiences, lingue, awards, news, company };
})();
