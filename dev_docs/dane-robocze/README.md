# Dane robocze: szkoły średnie i uczelnie

Surowe wyniki agentów (`wyniki/`), dane bazowe z RSPO i CKE (`baza/`) oraz skrypty, które budują pliki strony w `data/`.
Zasada: na stronę trafia tylko to, co ma oficjalne źródło; niepewne rzeczy skrypty usuwają (listy wyjątków są w komentarzach).

## Kolejność uruchamiania (Node, z katalogu repozytorium)

1. `node dev_docs/dane-robocze/merge-gdansk-2026.js`: Gdańsk, oferta 2026/27 i matura
2. `node dev_docs/dane-robocze/merge-miasta-2026.js`: Warszawa, Gdynia, Sopot; aktualizuje `data/szkoly/index.json`
3. `node dev_docs/dane-robocze/tidy-szkoly.js`: nazwy klas, wielkie litery, drobne poprawki po audycie
4. `node dev_docs/dane-robocze/merge-vulcan.js`: progi z serwisów statystyk naboru VULCAN
   Potem `merge-lodz-uml.js`: progi 2025 Łodzi z pliku urzędu miasta (`zrodla/lodz/`)
   Potem `merge-qualified.js`: liczba zakwalifikowanych i miejsc przy progach VULCAN (z `wyniki/turtle-api-2026-10-03.json`)
   Potem `merge-wroclaw-lo6.js`: progi 2025 LO VI Wrocław z tabeli PNG
5. `node dev_docs/dane-robocze/patch-matura.js`: wyniki matur z `baza/cke_*.json`
6. `node dev_docs/dane-robocze/merge-uczelnie-2026.js` i `merge-tri-uczelnie.js`: uczelnie w `data/careers.json`
7. `node dev_docs/dane-robocze/normalize-dashes.js`: bez długich myślników i półpauz
   Potem `stats-szkoly.js`: liczba klas z progami w każdym mieście (do kalkulatora)
8. `npm run build && npm test`

Instrukcje dla agentów zbierających dane: `INSTRUKCJA-*.md`, `baza/INSTRUKCJA-MIASTA.md`.

Po kroku 6 jednorazowo: `apply-decyzje-2026-10-01.js` (decyzje Ady: przywrócone wartości odstające, TPWiG na AGH).

Po audycie 2026-10-03 jednorazowo: `apply-poprawki-audyt-2026-10-03.js` (martwe linki osób, klasy 1C1 w CX LO, literówka w Poznaniu).
