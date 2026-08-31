import csv
import re
import sys
import requests

if len(sys.argv) < 2:
    raise Exception("Specificare la giornata")

giornata = sys.argv[1]

url = (
    "https://www.fantapiu3.com/voti-globali/"
    f"fantacalcio-voti-gazzetta-sport-serie-a.php?fonte=GDS&giornata={giornata}"
)

headers = {
    "User-Agent": "Mozilla/5.0"
}

html = requests.get(url, headers=headers, timeout=30).text

if "team-name" not in html:
    raise Exception("Nessun dato trovato nella pagina")

righe = []

blocchi = html.split("team-name")

for blocco in blocchi[1:]:

    try:

        nome_match = re.search(
            r'">\s*([^<]+)\s*</p>',
            blocco
        )

        squadra_match = re.search(
            r'team-country.*?>\s*([^<]+)\s*</p>',
            blocco,
            re.S
        )

        if not nome_match or not squadra_match:
            continue

        giocatore = nome_match.group(1).strip()

        sr = squadra_match.group(1).strip()

        squadra = ""
        ruolo = ""

        if " - " in sr:
            parti = sr.split(" - ")
            squadra = parti[0].strip()
            ruolo = parti[1].strip()

        valori = re.findall(
            r'<p class="table-text bold">([^<]+)</p>',
            blocco
        )

        if len(valori) < 10:
            continue

        riga = [
            giocatore,
            squadra,
            ruolo,
            valori[0],   # FV
            valori[1],   # V
            valori[2],   # GF_GS
            valori[3],   # GSR
            valori[4],   # AMM
            valori[5],   # ESP
            valori[6],   # RP_RS
            valori[7],   # AUT
            valori[8],   # ASS
            valori[9],   # ADF
            giornata
        ]

        righe.append(riga)

    except Exception:
        pass

output = f"dati_giornate/giornata_{giornata}.csv"

with open(
    output,
    "w",
    newline="",
    encoding="utf-8"
) as csvfile:

    writer = csv.writer(csvfile)

    writer.writerow([
        "Giocatore",
        "Squadra",
        "Ruolo",
        "FV",
        "V",
        "GF_GS",
        "GSR",
        "AMM",
        "ESP",
        "RP_RS",
        "AUT",
        "ASS",
        "ADF",
        "Giornata"
    ])

    writer.writerows(righe)

print(
    f"Creato {output} con {len(righe)} giocatori"
)
