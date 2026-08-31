/**
 * Scarica i voti della giornata invocando l'Action di GitHub dal sito web
 */
async function importaVotiFantapiu(giornata) {
  // CONFIGURAZIONE GITHUB
  const TOKEN = 'ghp_3oZBNTyJ3BM1KchnvN1FaVss5pnpH03U91AD';
  const OWNER = 'davidemilitia';
  const REPO = 'Asta_FantaMau';

  try {
    console.log(`Richiesta aggiornamento voti inviata a GitHub per la Giornata ${giornata}...`);

    // 1. Invia il comando a GitHub Actions per avviare il download della giornata desiderata
    const dispatchResponse = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows/aggiorna_voti.yml/dispatches`, {
      method: 'POST',
     headers: {
      'Accept': 'application/vnd.github+json',
      'Authorization': `token ${TOKEN}`,
      'X-GitHub-Api-Version': '2022-11-28'
    },
      body: JSON.stringify({
        ref: 'main',
        inputs: {
          giornata: giornata.toString()
        }
      })
    });

    if (!dispatchResponse.ok) {
      console.warn(`Impossibile avviare il workflow automatico (Stato: ${dispatchResponse.status}). Tento comunque di leggere il file esistente...`);
    } else {
      console.log("Workflow avviato su GitHub! Attendo 12 secondi il completamento del download...");
      // Aspetta 12 secondi affinché GitHub esegua il download in cloud
      await new Promise(resolve => setTimeout(resolve, 12000));
    }

  } catch (err) {
    console.error("Errore durante la chiamata a GitHub API:", err);
  }

  // 2. Legge il file CSV scaricato / aggiornato
  const timestamp = Date.now();
  const percorsiPossibili = [
    `./giornata_${giornata}.csv?t=${timestamp}`,
    `./giornata ${giornata}.csv?t=${timestamp}`,
    `./dati_giornate/giornata_${giornata}.csv?t=${timestamp}`,
    `./dati_giornate/giornata ${giornata}.csv?t=${timestamp}`
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
