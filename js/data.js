/* Dati veri presi da feudisalentini.com (29 ott 2026).
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
    { id: 'organic', name: '125 Organic', line: 'Organic', url: OLD + 'organic-collezione/' }
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

  const w = (o) => ({ zona: 'provincia di Taranto', aromi: [], ...o, bottle: B + o.bottle + '.webp', url: OLD + o.url + '/' });

  const wines = [
    // Collezione 53 · Luxury
    w({ id: 'c53-primitivo', name: 'Collezione 53 Primitivo', collection: 'luxury', denom: 'Primitivo di Manduria DOP', tipo: 'rosso', uve: 'Primitivo',
      desc: "Grappoli da vecchie vigne, raccolti a mano dopo un'attenta selezione, danno vita a questo Primitivo di Manduria affinato in barrique. Rosso rubino intenso, con profumi di confettura e di more mature. Ottimo anche come vino da meditazione.",
      vista: 'Rosso rubino intenso', aromi: ['confettura', 'more mature'], abb: 'Selvaggina, carne rossa e formaggi stagionati', foods: ['carne', 'selvaggina', 'formaggi'],
      alcool: '15% vol.', resa: '6.000 kg', bottle: 'primitivo53', url: 'primitivo-di-manduria-doc', color: '#6e0c1c',
      check: 'La scheda dice DOC, la pagina della collezione DOP' }),
    w({ id: 'gocce', name: 'Gocce', collection: 'luxury', denom: 'Primitivo di Manduria DOP', tipo: 'rosso', uve: 'Primitivo',
      desc: "Da un'accurata selezione a mano di uve Primitivo da vecchie vigne nel cuore della denominazione nasce Gocce. Affinato in botti francesi e barrique americane, ha buon corpo ed eleganza.",
      vista: 'Rosso rubino intenso', aromi: ['confettura', 'frutti di bosco', 'ciliegia', 'liquirizia'], abb: 'Carne rossa, selvaggina, formaggi stagionati e confetture', foods: ['carne', 'selvaggina', 'formaggi'],
      alcool: '14% vol.', resa: '6.000 kg', bottle: 'gocce', url: 'gocce-3', color: '#6a0e1f' }),
    w({ id: 'c53-negroamaro', name: 'Collezione 53 Negroamaro', collection: 'luxury', denom: 'Negroamaro Salento IGP', tipo: 'rosso', uve: 'Negroamaro',
      desc: "Nasce da un'accurata selezione di uve Negroamaro. Il bouquet unisce la frutta rossa a cannella, tabacco, pepe nero e netti sentori di liquirizia. Al gusto è equilibrato, con una persistente complessità balsamica sul finale.",
      vista: 'Rosso intenso', aromi: ['frutta rossa', 'cannella', 'tabacco', 'pepe nero', 'liquirizia'], abb: 'Sughi, carne rossa e formaggi stagionati', foods: ['carne', 'formaggi', 'pasta'],
      alcool: '15% vol.', resa: '8.000 – 9.000 kg', bottle: 'begro', url: 'negroamaro-del-salento', color: '#5c0d1a' }),

    // 125 Uno Due Cinque · Lounge Bar
    w({ id: '125-malvasia-nera', name: '125 Malvasia Nera', collection: 'lounge', denom: 'Malvasia Nera Salento IGP', tipo: 'rosso', uve: 'Malvasia Nera',
      desc: 'Al palato è fresco ed equilibrato, con un piacevole gusto fruttato.',
      vista: 'Rosso intenso con riflessi violacei', aromi: ['lampone', 'melograno'], abb: 'Pasta, pizza e formaggi stagionati', foods: ['pasta', 'formaggi'],
      alcool: '12,5% vol.', resa: '8.000 – 9.000 kg', bottle: 'malvasia', url: 'malvasia-nera-del-salento', color: '#6b1236' }),
    w({ id: '125-negroamaro', name: '125 Negroamaro', collection: 'lounge', denom: 'Negroamaro Salento IGP', tipo: 'rosso', uve: 'Negroamaro',
      desc: 'Da uno dei vitigni autoctoni tipici della Puglia. Vinificato a temperatura controllata, è affinato in tonneau francesi. Versatile: primi piatti, formaggi e aperitivi.',
      vista: 'Rosso', aromi: ['frutti di bosco', 'nota erbacea'], abb: 'Formaggi stagionati, pasta e pizza', foods: ['pasta', 'formaggi', 'aperitivo'],
      alcool: '12,5% vol.', resa: '8.000 – 9.000 kg', bottle: 'negro125', url: '125-uno-due-cinque-negroamaro', color: '#741426' }),
    w({ id: '125-primitivo', name: '125 Primitivo', collection: 'lounge', denom: 'Primitivo Salento IGP', tipo: 'rosso', uve: 'Primitivo',
      desc: "Una declinazione millennial dell'uva più famosa della Puglia, affinata in barrique americane. Si abbina a primi piatti, formaggi e aperitivi.",
      vista: 'Rosso', aromi: ['prugna', 'confettura di ciliegia', 'spezie'], abb: 'Formaggi stagionati, pasta e pizza', foods: ['pasta', 'formaggi', 'aperitivo'],
      alcool: '12,5% vol.', resa: '8.000 – 9.000 kg', bottle: 'negro125-1', url: '125-uno-due-cinque-primitivo-del-salento', color: '#721024' }),
    w({ id: '125-rosato', name: '125 Rosato', collection: 'lounge', denom: 'Rosato Salento IGP', tipo: 'rosato', uve: '',
      desc: 'Leggermente mosso. In bocca è sapido, con un lieve tannino. Ottimo come aperitivo o con crostacei e piatti di pesce.',
      vista: 'Rosa delicato', aromi: ['fiori', 'frutta rossa'], abb: 'Crostacei e formaggi', foods: ['crudo', 'pesce', 'aperitivo', 'freschi'],
      alcool: '12,5% vol.', resa: '9.000 kg', bottle: '125rosato', url: '125-uno-due-cinque', color: '#eba9a1' }),

    // Classica
    w({ id: 'sassirossi', name: 'Sassirossi', collection: 'classica', denom: 'Primitivo di Manduria DOP', tipo: 'rosso', uve: 'Primitivo',
      desc: 'Le uve vengono raccolte nei vigneti ad alberello, su un terreno sabbioso-calcareo ricco di ferro. I sassolini del suolo si sporcano di rosso a contatto con la terra: da qui il nome. Al palato è rotondo, morbido e ben bilanciato.',
      vista: 'Rosso intenso con vivaci riflessi violacei', aromi: ['confettura', 'ribes nero', 'mora', 'ciliegia', 'cacao', 'liquirizia'], abb: 'Tutto il pasto: sughi di carne, stufati, carni rosse alla griglia e brasati', foods: ['carne', 'pugliese'],
      alcool: '14% vol.', resa: '6.000 – 7.000 kg', zona: 'provincia sud di Taranto', bottle: 'sassirossi', url: 'primitivo-di-manduria-dop', color: '#66102a' }),
    w({ id: 'tre-cuori', name: 'Tre Cuori', collection: 'classica', denom: 'Rosa di Primitivo Puglia IGP', tipo: 'rosato', uve: 'Primitivo',
      desc: 'Gusto fresco, dal piacevole finale sapido.',
      vista: 'Rosa cerasuolo', aromi: ['piccoli frutti rossi', 'note balsamiche'], abb: 'Salumi e formaggi freschi, piatti pugliesi a base di pesce', foods: ['freschi', 'pesce', 'pugliese'],
      alcool: '13% vol.', resa: '9.000 kg', bottle: '3CUORI', url: 'rosa-di-primitivo-puglia-tre-cuori', color: '#d8645c' }),
    w({ id: 'cala', name: 'Càla', collection: 'classica', denom: 'Verdeca Salento IGP', tipo: 'bianco', uve: 'Verdeca',
      desc: '', vista: '', aromi: [], abb: 'Crostacei e primi piatti a base di vongole', foods: ['crudo', 'pesce'],
      alcool: '11,5% vol.', resa: '8.000 – 9.000 kg', bottle: 'cala', url: 'cala', color: '#e6db8f',
      check: 'Sul sito la descrizione di Càla è copiata da quella del 125 Negroamaro: serve il testo vero' }),
    w({ id: 'philia', name: 'Philia', collection: 'classica', denom: 'Primitivo di Manduria Dolce Naturale DOCG', tipo: 'dolce', uve: 'Primitivo',
      desc: "Nasce da vigne vecchie di Primitivo di Manduria, con appassimento dell'uva su pianta. Un vino dolce che accompagna i dolci di mandorla, i formaggi stagionati o la frutta fresca.",
      vista: 'Rosso granato', aromi: ['prugna matura', 'frutta secca', 'spezie'], abb: 'Dolci a base di mandorle e formaggi stagionati', foods: ['dolci', 'formaggi'],
      alcool: '15,4% vol.', resa: '4.000 – 5.000 kg', zona: 'Manduria, a sud di Taranto', bottle: 'philia', url: 'philia', color: '#4b0e18' }),
    w({ id: 're-sale', name: 'Re Sale', collection: 'classica', denom: 'Primitivo Salento IGP', tipo: 'rosso', uve: 'Primitivo',
      desc: "Prende il nome dall'antico re del Salento da cui deriva il nome stesso della zona. Da uva Primitivo, affinato in tonneau francesi, ha un tannino morbido.",
      vista: 'Rosso rubino intenso', aromi: ['amarena', 'prugna'], abb: 'Cucina mediterranea', foods: ['pugliese', 'pasta'],
      alcool: '14% vol.', resa: '8.000 – 9.000 kg', bottle: 'resale', url: 'resale', color: '#6e0f22' }),
    w({ id: 'vis', name: 'Vis', collection: 'classica', denom: 'Primitivo Tarantino IGP', tipo: 'rosso', uve: 'Primitivo e Aglianico',
      desc: "Nasce dall'unione di due vitigni autoctoni, Primitivo e Aglianico. Affinato in tonneau francesi, con un buon tannino.",
      vista: 'Rosso con riflessi violacei', aromi: ['frutti rossi maturi', 'spezie'], abb: 'Carni speziate, selvaggina, formaggi stagionati e piccanti', foods: ['carne', 'selvaggina', 'formaggi'],
      alcool: '14% vol.', resa: '8.000 – 9.000 kg', bottle: 'vis', url: 'vis-primitivo-tarantino', color: '#5f1030',
      check: 'Gradazione: 14% nel testo, 11,5% nei dati tecnici' }),
    w({ id: 'more', name: 'More', collection: 'classica', denom: 'Salice Salentino DOP', tipo: 'rosso', uve: 'Negroamaro',
      desc: "Si ottiene principalmente dal Negroamaro, l'uva che è la quintessenza del Salento. Affinato in botti grandi francesi, con un buon tannino; al palato è equilibrato e fine.",
      vista: 'Rosso rubino', aromi: ['frutta rossa matura', 'spezie'], abb: 'Cacciagione, carni rosse e crostacei', foods: ['carne', 'selvaggina'],
      alcool: '14% vol.', resa: '8.000 – 9.000 kg', bottle: 'more', url: 'more-salice-salentino-dop', color: '#6a1020' }),
    w({ id: 'claria', name: 'Claria', collection: 'classica', denom: 'Verdeca Sauvignon Puglia IGP', tipo: 'bianco', uve: 'Verdeca e Sauvignon',
      desc: 'Dal blend di Verdeca, morbido, e Sauvignon, fresco. Al palato è persistente ed equilibrato. Ideale anche come aperitivo.',
      vista: 'Paglierino limpido con sfumature verdoline', aromi: ['fiori', 'agrumi'], abb: 'Formaggi freschi e piatti di mare', foods: ['pesce', 'crudo', 'freschi', 'aperitivo'],
      alcool: '12% vol.', resa: '9.000 kg', bottle: 'claria', url: 'verdeca-sauvignon-puglia-igp-claria', color: '#e3dd96' }),
    w({ id: 'olivia', name: 'Olivia', collection: 'classica', denom: 'Chardonnay Puglia IGP', tipo: 'bianco', uve: 'Chardonnay',
      desc: 'Gusto morbido, con una buona acidità.',
      vista: 'Dorato', aromi: ['frutta', 'mandorla'], abb: 'Crostacei e piatti di pesce', foods: ['crudo', 'pesce'],
      alcool: '13,5% vol.', resa: '9.000 kg', bottle: 'olivia', url: 'olivia-chardonnay-di-puglia', color: '#dcbd5e' }),
    w({ id: 'susumaniello', name: 'Susumaniello', collection: 'classica', denom: 'Susumaniello IGP', tipo: 'rosso', uve: 'Susumaniello',
      desc: 'Il vitigno autoctono Susumaniello cresce qui nel cuore del Salento. Al palato è strutturato, con tannini maturi e grande persistenza.',
      vista: 'Rosso rubino intenso', aromi: ['frutta rossa matura', 'spezie'], abb: 'Carne e piatti della tradizione pugliese', foods: ['carne', 'pugliese'],
      alcool: '14% vol.', resa: '8.000 – 9.000 kg', zona: 'Salento', bottle: 'suss', url: 'susumaniello-igp', color: '#6c0e20' }),
    w({ id: 'susumaniello-rose', name: 'Susumaniello Rosé', collection: 'classica', denom: 'Susumaniello IGP', tipo: 'rosato', uve: 'Susumaniello',
      desc: 'Al palato è delicato ma di carattere deciso, con una buona acidità e persistenza.',
      vista: 'Rosa tenue con riflessi violacei', aromi: ['frutta rossa appena raccolta'], abb: 'Aperitivo, primi piatti di pesce e della tradizione pugliese', foods: ['aperitivo', 'pesce', 'pugliese'],
      alcool: '13% vol.', resa: '6.000 – 7.000 kg', zona: 'Salento', bottle: 'sussrose', url: 'susumaniello-rose-vino-puglia', color: '#e7a4b0' }),
    w({ id: 'appassimento', name: 'Appassimento', collection: 'classica', denom: 'Rosso Puglia IGP', tipo: 'rosso', uve: 'Negroamaro, Primitivo e Malvasia Nera',
      desc: "Le uve appassiscono per circa 20 giorni, per disidratarsi leggermente. Al palato si confermano gli aromi; è corposo.",
      vista: 'Rosso rubino intenso', aromi: ['frutti rossi maturi', 'vaniglia', 'cacao'], abb: 'Piatti a base di carne', foods: ['carne'],
      alcool: '15% vol.', resa: '8.000 – 9.000 kg', zona: 'Salento', bottle: 'appassimento', url: 'appassimento-vino-rosso-di-puglia', color: '#5e0c1c' }),

    // Terra
    w({ id: 'terra-platinum', name: 'Terra Platinum Edition', collection: 'terra', denom: 'Primitivo di Manduria DOP', tipo: 'rosso', uve: 'Primitivo',
      desc: 'Gusto rotondo, morbido ed equilibrato.',
      vista: 'Rosso', aromi: ['confetture di frutta', 'ribes nero', 'mora', 'ciliegia', 'cioccolato', 'liquirizia'], abb: 'Sughi di carne, stufati, carni rosse alla griglia e brasati', foods: ['carne'],
      alcool: '14,5% vol.', resa: '6.000 kg', bottle: 'terraplatinum', url: 'terra-primitivo-di-manduria-dop', color: '#620e20' }),
    w({ id: 'terra-gold', name: 'Terra Gold Edition', collection: 'terra', denom: 'Primitivo di Manduria DOP', tipo: 'rosso', uve: 'Primitivo',
      desc: 'Al palato rotondo, morbido, elegante e strutturato.',
      vista: 'Rosso', aromi: ['confettura', 'frutti di bosco', 'caramello'], abb: 'Carne rossa, selvaggina e formaggi stagionati con confetture', foods: ['carne', 'selvaggina', 'formaggi'],
      alcool: '14% vol.', resa: '6.000 kg', bottle: 'terra', url: 'terra-gold-primitivo-di-manduria-dop', color: '#680f1e' }),
    w({ id: 'terra-primitivo', name: 'Terra Primitivo', collection: 'terra', denom: 'Primitivo Salento IGP', tipo: 'rosso', uve: 'Primitivo',
      desc: 'Gusto strutturato, morbido e ricco di tannini maturi.',
      vista: 'Rosso', aromi: ['prugne mature', 'foglie di tabacco', 'confettura di ciliegie', 'cacao'], abb: 'Pasta, pizza e formaggi stagionati', foods: ['pasta', 'formaggi'],
      alcool: '12,5% vol.', resa: '9.000 kg', bottle: 'terraprimitivo', url: 'terra-primitivo-del-salento-igp', color: '#701024' }),
    w({ id: 'terra-negroamaro', name: 'Terra Negroamaro', collection: 'terra', denom: 'Negroamaro Salento IGP', tipo: 'rosso', uve: 'Negroamaro',
      desc: 'Gusto fruttato persistente, vellutato e morbido.',
      vista: 'Rosso', aromi: ['more', 'mirtilli'], abb: 'Pasta, pizza e formaggi stagionati', foods: ['pasta', 'formaggi'],
      alcool: '12,5% vol.', resa: '9.000 kg', bottle: 'negroamaro', url: 'terra-negroamaro-del-salento', color: '#6a1226' }),
    w({ id: 'terra-malvasia-bianca', name: 'Terra Malvasia Bianca', collection: 'terra', denom: 'Malvasia Bianca Salento IGP', tipo: 'bianco', uve: 'Malvasia Bianca',
      desc: 'Al naso aromatico e fruttato. Gusto delicato, fresco, equilibrato e persistente.',
      vista: 'Paglierino', aromi: ['frutta'], abb: 'Piatti di pesce, crostacei, formaggi e insalate', foods: ['pesce', 'crudo', 'freschi'],
      alcool: '12,5% vol.', resa: '9.000 kg', bottle: 'terramalvasiabianca', url: 'terra-malvasia-bianca-salento-igp', color: '#e6d98c' }),
    w({ id: 'terra-malvasia-nera', name: 'Terra Malvasia Nera', collection: 'terra', denom: 'Malvasia Nera Salento IGP', tipo: 'rosso', uve: 'Malvasia Nera',
      desc: 'Al palato è fresco ed equilibrato, con un piacevole gusto fruttato.',
      vista: 'Rosso', aromi: ['lampone', 'melograno'], abb: 'Pasta, pizza e formaggi stagionati', foods: ['pasta', 'formaggi'],
      alcool: '12,5% vol.', resa: '9.000 kg', bottle: 'terramalvasia', url: 'terra-malvasia-nera-salento-igp', color: '#6b1236' }),
    w({ id: 'terra-rosato', name: 'Terra Rosato', collection: 'terra', denom: 'Rosato Salento IGP', tipo: 'rosato', uve: '',
      desc: 'Brioso, piacevole ed elegante al palato.',
      vista: 'Rosato', aromi: ['frutta rossa appena raccolta'], abb: 'Piatti leggeri, aperitivi, crostacei e formaggi', foods: ['aperitivo', 'crudo', 'freschi'],
      alcool: '12,5% vol.', resa: '9.000 kg', bottle: 'terrarosato', url: 'terra-rosato-del-salento-igp', color: '#e59a90' }),

    // 125 Organic
    w({ id: 'organic-bianco', name: '125 Bianco Organic', collection: 'organic', denom: 'Bianco Puglia IGP biologico', tipo: 'bianco', uve: '',
      desc: "L'acidità equilibrata rende il gusto persistente e fresco.",
      vista: 'Giallo paglierino con riflessi verdolini', aromi: ['fiori bianchi', 'agrumi', 'frutta'], abb: 'Crostacei, pesce crudo e insalate di stagione', foods: ['crudo', 'pesce'],
      alcool: '12,5% vol.', resa: '8.000 – 9.000 kg', bottle: 'biook-2', url: 'bianco-puglia-biologico', color: '#e4dc8e' }),
    w({ id: 'organic-primitivo', name: '125 Primitivo Organic', collection: 'organic', denom: 'Primitivo Puglia IGP biologico', tipo: 'rosso', uve: 'Primitivo',
      desc: 'Gusto strutturato, morbido e ricco di tannini maturi.',
      vista: 'Rosso elegante con riflessi violacei', aromi: ['prugne mature', 'foglie di tabacco', 'cacao'], abb: 'Formaggi stagionati, pasta e pizza', foods: ['formaggi', 'pasta'],
      alcool: '12,5% vol.', resa: '8.000 – 9.000 kg', bottle: 'priitivobio', url: 'primitivo-puglia-bio-organic', color: '#64102e' })
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
