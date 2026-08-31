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

    if (righe.length <= 1) {
        return [];
    }

    return righe.slice(1).map(riga => {

        const campi = riga.split(";");

        return {
            giocatore: campi[0] || "",
            squadra: campi[1] || "",
            ruolo: campi[2] || "",
            voto: campi[3] || "",
            fv: campi[4] || "",
            ass: campi[5] || ""
        };

    });

}
