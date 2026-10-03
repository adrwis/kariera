# NextMove — Znajdź swój zawód

Wyszukiwarka zawodów dla osób, które nie wiedzą, kim chcą zostać: 79 profili zawodów (zarobki z GUS dla 48 z nich), uczelniami (progi, wymagania i czesne ze źródłami) oraz szkoły średnie w 14 miejscach (Trójmiasto, powiat wejherowski, Warszawa i inne duże miasta): klasy, rozszerzenia, progi, wyniki matur, kalkulator punktów ósmoklasisty i quiz zainteresowań.

**Live:** [adrwis.github.io/kariera](https://adrwis.github.io/kariera/)

## Tech stack

- Vanilla HTML / CSS / JS; minifikacja przez esbuild (`npm install`, `npm run build`), testy Playwright (`npm test`)
- [Fuse.js](https://www.fusejs.io/) — fuzzy search (CDN)
- GitHub Pages — hosting + deploy

## Funkcje

- Wyszukiwanie zawodów z podpowiedziami (autocomplete)
- 79 szczegółowych profili + 117 wpisów KZiS
- Przeglądanie po 10 kategoriach
- Sortowanie wyników (trafność / nazwa / zarobki)
- Tryb jasny / ciemny
- WCAG 2.1 AA (aria-live, focus management, tap targets)
- Responsive (desktop / tablet / mobile)

## Dane

Źródła danych: [KZiS](https://psz.praca.gov.pl), [Barometr Zawodów](https://barometrzawodow.pl), [INFOdoradca+](https://psz.praca.gov.pl/rynek-pracy/bazy-danych/infodoradca).

Szkoły średnie: [RSPO](https://rspo.gov.pl) (CC BY 4.0), wyniki matur [CKE](https://mapa.wyniki.edu.pl), pliki rekrutacyjne miast (Biuro Edukacji m.st. Warszawy, serwisy statystyk naboru Gdyni i Sopotu, Nabór Pomorze) i strony szkół. Uczelnie: strony rekrutacyjne, uchwały i zarządzenia uczelni. Zarobki: GUS, „Struktura wynagrodzeń według zawodów za październik 2024 r.” (mediana i decyle; GUS podaje zawody do 3 cyfr KZiS, więc część liczb dotyczy grupy zawodów, a zawody, których GUS nie wyodrębnia, nie mają kwot). Progi punktowe, wymagania i czesne mają link do źródła przy każdej liczbie. Skrypty i surowe wyniki: `dev_docs/dane-robocze/`.
