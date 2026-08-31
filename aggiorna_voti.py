import sys
import csv
import requests
from bs4 import BeautifulSoup

giornata = sys.argv[1]

url = (
    "https://www.fantapiu3.com/voti-globali/"
    f"fantacalcio-voti-gazzetta-sport-serie-a.php?fonte=GDS&giornata={giornata}"
)

html = requests.get(
    url,
    headers={
        "User-Agent": "Mozilla/5.0"
    }
).text

with open(
    f"dati_giornate/giornata_{giornata}.csv",
    "w",
    newline="",
    encoding="utf-8"
) as f:

    writer = csv.writer(f)

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

print("Download completato")
