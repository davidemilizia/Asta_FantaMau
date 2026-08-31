const fs = require('fs');
const path = require('path');
const https = require('https');

const giornata = process.argv[2] || '1';
const url = `https://www.fantapiu3.com/moduli/scarica-voti-excel-txt.php?giornata=${giornata}&tipologia=excel`;

console.log(`⏳ Inizio scaricamento voti per la Giornata ${giornata}...`);

function scaricaFile(urlTarget) {
  return new Promise((resolve, reject) => {
    // Configuriamo gli opzioni HTTP con un User-Agent valido da browser
    const parsedUrl = new URL(urlTarget);
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Referer': 'https://www.fantapiu3.com/'
      }
    };

    https.get(options, (res) => {
      // Gestione reindirizzamenti (301, 302, 307, 308)
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (!redirectUrl.startsWith('http')) {
          redirectUrl = `https://${parsedUrl.hostname}${redirectUrl}`;
        }
        return resolve(scaricaFile(redirectUrl));
      }

      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP Error: ${res.statusCode}`));
      }

      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    }).on('error', (err) => reject(err));
  });
}

async function esegui() {
  try {
    const csvContent = await scaricaFile(url);

    const dirPath = path.join(__dirname, 'dati_giornate');
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    const filePath = path.join(dirPath, `giornata_${giornata}.csv`);
    fs.writeFileSync(filePath, csvContent, 'utf-8');

    console.log(`✅ File salvato con successo: ${filePath}`);
  } catch (err) {
    console.error(`❌ Errore nel download della Giornata ${giornata}:`, err.message);
    process.exit(1);
  }
}

esegui();
