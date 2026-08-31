async function importaVotiFantapiu(giornata) {

    try {

        const timestamp = Date.now();

        const response = await fetch(
            `./dati_giornate/giornata_${giornata}.csv?t=${timestamp}`
        );

        if (!response.ok) {
            throw new Error(
                `File giornata_${giornata}.csv non trovato`
            );
        }

        const csvText = await response.text();

        return parsingCSVVoti(csvText);

    } catch (err) {

        console.error(err);

        return [];
    }
}

function leggiCSVFileLocale(file) {

    return new Promise((resolve, reject) => {

        const reader = new FileReader();

        reader.onload = (e) => {
            resolve(
                parsingCSVVoti(e.target.result)
            );
        };

        reader.onerror = reject;

        reader.readAsText(file);

    });
}

function parsingCSVVoti(csvText) {

    const righe = csvText.trim().split(/\r?\n/);

    if (righe.length < 2) {
        return [];
    }

    const dati = [];

    for (let i = 1; i < righe.length; i++) {

        if (!righe[i].trim()) continue;

        const campi = righe[i].match(
            /(".*?"|[^",]+)(?=\s*,|\s*$)/g
        );

        if (!campi || campi.length < 14) {
            continue;
        }

        const pulisci = (v) =>
            String(v)
                .replace(/^"/, "")
                .replace(/"$/, "")
                .trim();

        dati.push({
            giocatore: pulisci(campi[0]),
            squadra: pulisci(campi[1]),
            ruolo: pulisci(campi[2]),
            fv: pulisci(campi[3]),
            voto: pulisci(campi[4]),
            ass: pulisci(campi[11])
        });
    }

    return dati;
}
