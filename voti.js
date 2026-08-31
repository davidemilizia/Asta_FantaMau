/**
 * Legge il file CSV della giornata provando sia con "_" che con spazio " "
 */
async function importaVotiFantapiu(giornata) {
  // Prova prima con l'underscore (giornata_1.csv), poi con lo spazio (giornata 1.csv)
  const percorsiPossibili = [
    `./dati_giornate/giornata_${giornata}.csv`,
    `./dati_giornate/giornata ${giornata}.csv`
  ];

  for (const filePath of percorsiPossibili) {
    try {
      const res = await fetch(filePath);
      if (res.ok) {
        const csvText = await res.text();
        return parsingCSVVoti(csvText, giornata);
      }
    } catch (e) {
      // Prova il percorso successivo
    }
  }

  console.warn(`File CSV per la giornata ${giornata} non trovato su GitHub Pages.`);
  return [];
}

/**
 * Legge un file CSV selezionato manualmente dall'utente dal PC
 */
function leggiCSVFileLocale(file, giornata) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const csvText = e.target.result;
      const voti = parsingCSVVoti(csvText, giornata);
      resolve(voti);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsText(file);
  });
}

/**
 * Funzione helper per analizzare le righe del CSV
 */
function parsingCSVVoti(csvText, giornata) {
  const righe = csvText.split(/\r?\n/);
  if (righe.length <= 1) return [];

  const listaVoti = [];

  for (let i = 1; i < righe.length; i++) {
    const riga = righe[i].trim();
    if (!riga) continue;

    const colonne = riga.includes(';') ? riga.split(';') : riga.split(',');

    if (colonne.length >= 5) {
      const pulisci = (text) => text ? text.replace(/^"|"$/g, '').trim() : '';

      const nome = pulisci(colonne[0]);
      const squadra = pulisci(colonne[1]);
      const ruolo = pulisci(colonne[2]).toUpperCase();

      const parseNum = (val) => {
        if (!val) return 0;
        const str = pulisci(val).replace(',', '.');
        const num = parseFloat(str);
        return isNaN(num) ? 0 : num;
      };

      const fv = parseNum(colonne[3]);
      const voto = parseNum(colonne[4]);
      const gf_gs = parseNum(colonne[5]);
      const gsr = parseNum(colonne[6]);
      const amm = parseNum(colonne[7]);
      const esp = parseNum(colonne[8]);
      const rp_rs = parseNum(colonne[9]);
      const aut = parseNum(colonne[10]);
      const ass = parseNum(colonne[11]);
      const adf = parseNum(colonne[12]);

      if (nome && (voto > 0 || fv > 0)) {
        listaVoti.push({
          giocatore: nome,
          squadra: squadra,
          ruolo: ruolo,
          voto: voto,
          fv: fv,
          gf_gs: gf_gs,
          gsr: gsr,
          amm: amm,
          esp: esp,
          rp_rs: rp_rs,
          aut: aut,
          ass: ass,
          adf: adf,
          giornata: parseInt(giornata)
        });
      }
    }
  }

  return listaVoti;
}
