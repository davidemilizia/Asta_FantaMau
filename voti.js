/*
 * Carica i voti direttamente dai CSV presenti nel repository GitHub
 */

async function importaVotiFantapiu(giornata) {

    try {

        const timestamp = Date.now();

       const response = await fetch(
    `./dati_giornate/giornata_${giornata}.csv?t=${timestamp}`
);
``;

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

/*
 * Lettura CSV locale importato dal PC
 */
function leggiCSVFileLocale(file, giornata) {

    return new Promise((resolve, reject) => {

        const reader = new FileReader();

        reader.onload = (e) => {

            const csvText = e.target.result;

            resolve(
                parsingCSVVoti(csvText)
            );

        };

        reader.onerror = reject;

        reader.readAsText(file);

    });
}

/*
 * Parser CSV GENERICO
 */
function parsingCSVVoti(csvText) {

    const righe = csvText.trim().split(/\r?\n/);

    if (righe.length < 2) {
        return [];
    }

    const intestazioni = righe[0]
        .split(";")
        .map(x => x.trim());

    const dati = [];

    for (let i = 1; i < righe.length; i++) {

        const valori = righe[i]
            .split(";")
            .map(x => x.trim());

        if (valori.length < intestazioni.length) {
            continue;
        }

        const record = {};

        intestazioni.forEach((campo, indice) => {
            record[campo] = valori[indice] || "";
        });

        dati.push({
            giocatore:
                record.Nome ||
                record.Giocatore ||
                record.Calciatore ||
                "",

            squadra:
                record.Squadra ||
                "",

            ruolo:
                record.Ruolo ||
                record.R ||
                "",

            voto:
                record.Voto ||
                "",

            fv:
                record["Fantavoto"] ||
                record.FV ||
                "",

            ass:
                record.Assist ||
                0
        });
    }

    return dati;
}
