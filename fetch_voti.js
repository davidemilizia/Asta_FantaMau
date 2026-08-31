const fs = require('fs');
const path = require('path');

// Recupera la giornata dagli argomenti (es. node fetch_voti.js 1) o default 1
const giornata = process.argv[2] || 1;
const url = `https://www.fantapiu3.com/moduli/scarica-voti-excel-txt.php?giornata=${giornata}&tipologia=excel`;

async function scaricaVoti() {
  console.log(`⏳ Scaricamento voti per la Giornata ${giornata}...`);
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    
    const text = await response.text();
    
    // Assicurati che la cartella dati_giornate esista
    const dirPath = path.join(__dirname, 'dati_giornate');
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Salva il file come giornata_X.csv
    const filePath = path.join(dirPath, `giornata_${giornata}.csv`);
    fs.writeFileSync(filePath, text, 'utf-8');
    
    console.log(`✅ Giornata ${giornata} salvata con successo in ${filePath}`);
  } catch (err) {
    console.error(`❌ Errore nel download della Giornata ${giornata}:`, err.message);
    process.exit(1);
  }
}

scaricaVoti();
