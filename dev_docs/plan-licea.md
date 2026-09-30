# NextMove — plan rozszerzenia o licea (LO)

> **Data:** 2026-09-30
> **Status (2026-10-01):** Etapy 0 do 4 zrobione dla Gdańska, Gdyni, Sopotu i Warszawy (rekrutacja 2026/27). Dane uczelni zaktualizowane o progi 2026 i uczelnie trójmiejskie. Skrypty scalające i wyniki agentów w `dev_docs/dane-robocze/`.
> **Wzór:** mapakarier.org/strefa-mlodziezy (filtr preferencji z przedmiotami szkolnymi, losowanie zawodu, osobna ścieżka dla ósmoklasistów, język pisany do nastolatka)

---

## Skąd ten plan

Trzech krytyków przejrzało stronę: UX i treść, kod z dostępnością, dane o liceach. Wniosek: licea da się dodać, ale dopiero po naprawie danych o szkołach. Dziś pole `education.schools` wrzuca do jednego worka uczelnie, technika, kursy i szkoły służb, a wszystkim daje progi maturalne. Jeśli dołożymy do tego licea bez zmiany schematu, błąd się powieli.

---

## Etap 0. Fundament techniczny (bez tego żadna zmiana nie trafi na stronę)

- [ ] **Build działa tylko na starym komputerze.** `scripts/build.js:4` ładuje esbuild ze ścieżki `C:/Users/adria/...`, a `index.html` wczytuje wyłącznie pliki `*.min.*`. Dodać `package.json` z esbuild i playwright w `devDependencies`, poprawić ścieżki w `scripts/test-*.js`.
- [ ] **Build w GitHub Actions.** `deploy.yml` wgrywa cały katalog, razem z `archiwum/`, `dev_docs/` i `scripts/`. Budować do `dist/` i wgrywać tylko ten katalog.
- [ ] **Service worker.** `sw.js:46-51` zawsze podaje stary `index.html` z cache, a JS i JSON aktualizuje w tle, więc po deployu może się pomieszać stary HTML z nowym JS. Nawigacja network-first, nazwy plików z hashem, wersja cache generowana w buildzie.
- [ ] **Bezpieczeństwo.** `escapeHtml` nie escapuje cudzysłowu (`app.js:1435`), adresy zdjęć z Wikipedii idą do `innerHTML` bez escapowania (`app.js:1048`, `:1088`), a `escapeAttr` przepuszcza `javascript:`. Dodać `safeUrl()` z listą dozwolonych protokołów. To obowiązkowe, zanim wejdą dane z RSPO.
- [ ] **Fuse.js lokalnie** w `js/vendor/`, bo z CDN nie trafia do cache SW i offline wyszukiwarka nie działa.

## Etap 1. Wiarygodność danych

- [ ] **Typ szkoły.** Nowe pole `school.type`: `uczelnia` / `liceum` / `technikum` / `branzowa` / `kurs` / `sluzba`. Osobny szablon popupu dla każdego typu. Technikom, kursom i szkołom służb usunąć matury i progi (technikum: rekrutacja po egzaminie ósmoklasisty, skala 0–200).
- [ ] **Progi.** 375 trybów ma po 3 progi 2023–2025 bez skali i źródła. Progi rosną rok w rok o 1–4 pkt, co wygląda na dane wygenerowane z szablonu. Usunąć każdy próg, którego nie da się podlinkować do komunikatu uczelni. Te, które zostaną, dostają `scale`, `sourceUrl` i `asOf`.
- [ ] **Zarobki.** 35 z 79 zawodów ma `salary.min` poniżej płacy minimalnej (krytyk przyjął 4806 zł brutto na 2026 r., kwotę trzeba sprawdzić). Przeliczyć widełki, dodać `salary.source` i `salary.asOf`, suwak zaczynać od płacy minimalnej.
- [ ] **Nieaktualne treści.** Technik informatyk ma kwalifikacje EE.08/EE.09 (`careers.json:6914`) zamiast INF.02/INF.03, do tego wymaganie „szkoła podstawowa (minimum 18 lat)”. Stare kwoty u lekarza stażysty i policjanta. „Wyższa Szkoła Policji w Szczytnie” to dziś Akademia Policji. Kucharz linkuje do uczelni z Bydgoszczy.
- [ ] **Poziom wykształcenia.** `education.level` ma 37 różnych wolnych wartości. Zamienić na słownik: `branzowa` / `technikum` / `matura+kurs` / `licencjat` / `magister` / `jednolite`.
- [ ] **Źródła.** Przypisać źródło do konkretnych danych (płace, zapotrzebowanie, rekrutacja), pokazać „Stan danych: MM.RRRR”, usunąć zdublowane linki w sekcji źródeł (`app.js:811-817`). Każdy profil dostaje `reviewedAt`.
- [ ] **Walidator schematu** w `scripts/`, uruchamiany w CI.

## Etap 2. Odkrywanie zawodów, na wzór Mapy Karier

- [ ] **Naprawa wyszukiwarki.** `search.js:34` szuka w `skills.required`, a tego pola w danych już nie ma. Dodać `skills.soft`, `skills.technical` i `fullDescription` z `ignoreLocation: true`. Dziś podpowiedź z placeholdera „coś z ludźmi” daje 0 wyników.
- [ ] **Filtr preferencji.** Pole `interests` przy każdym zawodzie. Zakładki jak w Mapie Karier: czynności, kontakt z ludźmi, wysiłek fizyczny, środowisko pracy, **ulubione przedmioty szkolne**. Licznik „pasuje N zawodów” po każdej zmianie. Zakładka z przedmiotami łączy się potem wprost z rozszerzeniami w liceum.
- [ ] **„Wylosuj zawód”** jako trzecie wejście obok wyszukiwarki i filtra.
- [ ] **Język.** „Deficytowy” zamienić na „łatwo o pracę” i dać mu zielony kolor (dziś jest czerwony, `style.css:1107-1118`). Kod KZiS przenieść na dół profilu. Wyjaśnić, co znaczy (P) i (R). Usunąć pole „Jak masz na imię?” sprzed wyszukiwarki.
- [ ] **Profil zawodu.** Pod nagłówkiem sekcja „Ścieżka krok po kroku”: 8 klasa → szkoła średnia → matura lub egzamin zawodowy → studia lub kurs → praca. Do tego „Jak wygląda dzień pracy”. Znane osoby przenieść niżej.
- [ ] **Popularne zawody.** Wszystkie 8 tagów na stronie głównej to zawody po studiach. Dołożyć 2–3 zawody techniczne i branżowe.

## Etap 3. Architektura pod dwa typy treści

Dziś cały kod zakłada jeden typ: zawód.

- [ ] **Zmiana nazw.** W kodzie „school” oznacza uczelnię (`openSchoolPopup`, `.school-card`, `schoolFilter`, `education.schools`). Przemianować na `uczelnia`, zanim pojawi się liceum.
- [ ] **Rejestr typów.** `js/entities/zawod.js` i `js/entities/liceum.js`, każdy z własnym prefiksem adresu, kluczami wyszukiwania, kartą, widokiem szczegółów i filtrami.
- [ ] **Router.** `getRoute()` (`app.js:109-115`) zna tylko `/wyniki` i `/zawod/`. Zamienić na tabelę tras generowaną z rejestru (`/liceum/<slug>`, `/licea?miasto=`).
- [ ] **Wyszukiwarka.** Wynik jako lista `{type, item, score}`, podpowiedzi pogrupowane na „Zawody” i „Licea”.
- [ ] **Jeden komponent okna** na natywnym `<dialog>` zamiast trzech prawie identycznych popupów.
- [ ] **Dane w częściach.** Lekki `index.json` plus plik na zawód, licea w plikach per miasto, ładowane dopiero wtedy, gdy są potrzebne.
- [ ] **SEO.** Dziś każdy adres poza stroną główną zwraca Google status 404 (trik z `404.html`). Build generuje statyczne `zawod/<id>/index.html` i `liceum/<slug>/index.html` oraz sitemapę z danych.
- [ ] **Dostępność.** Karty wyników z `role="listitem"` nie są ogłaszane jako linki (`app.js:505`, `:529`). Efekt pisania z `aria-live` odczytuje każdą literę. Etykiety filtrów bez `for`.

## Etap 4. Licea, pilot w jednym mieście

**Pilot:** Gdańsk, licea i technika dla młodzieży, publiczne i niepubliczne.

### Źródła

| Dane | Źródło | Jak | Licencja |
|---|---|---|---|
| Lista szkół, adres, geo, www, języki, specyfika oddziałów | RSPO: [dane.gov.pl zbiór 839](https://dane.gov.pl/pl/dataset/839,wykaz-szko-i-placowek-oswiatowych) + wyszukiwarka rspo.gov.pl | automatycznie, skrypt | CC BY 4.0 (dane.gov.pl); API wyszukiwarki jest nieudokumentowane |
| Wyniki matur z każdego przedmiotu rozszerzonego | CKE [Mapa Egzaminów](https://mapa.wyniki.edu.pl/MapaEgzaminow/), plik `szkoly_07.xlsx`, klucz RSPO | automatycznie, skrypt | licencja niesprawdzona, do potwierdzenia |
| Profile klas, rozszerzenia, progi | system naboru Gdańska i komunikaty o progach (do ustalenia) | ręcznie, maj–lipiec, z `sourceUrl` i `verifiedAt` | same fakty, bez kopiowania tekstów szkół |
| Ranking | Perspektywy | **tylko link**, bez kopiowania tabeli | brak zgody na republikację |

### Dane

- [ ] `data/subjects.json`: słownik przedmiotów maturalnych (`mat`, `pol`, `ang`, `bio`, `chem`, `fiz`, `inf`, `geo`, `hist`, `wos`…), nazwy zgodne z kolumnami CKE.
- [ ] `data/szkoly/gdansk.json`: szkoła z polami `rspo`, `name`, `city`, `district`, `address`, `geo`, `url`, `public`, `languages`, `specifics`, `matura`, `sources`, `profiles[]`.
- [ ] Profil klasy: `name`, `schoolYear`, `extended[]`, `languages[]`, `scoredSubjects[]`, `places`, `thresholds[{year, min, scale: 200}]`, `sourceUrl`, `verifiedAt`.
- [ ] 47 wolnotekstowych wymagań uczelni zamienić na `requirementsStructured: [{anyOf: ["bio","chem"], level: "R"}]`, zostawiając stare pole, żeby nic się nie popsuło po drodze.
- [ ] Dla każdego zawodu agregat `matura.required` / `matura.recommended` liczony z wymagań jego uczelni.

### Połączenie zawód ↔ liceum

- Profil klasy pasuje do zawodu, jeśli jego rozszerzenia pokrywają wymagane grupy przedmiotów. Na stronie pokazujemy procent pokrycia.
- Przy szkole: ilu uczniów zdawało dane rozszerzenie i z jakim wynikiem (CKE). Z tego widać, czy szkoła naprawdę uczy tego przedmiotu na rozszerzeniu.

### Widoki

- [ ] Na stronie głównej osobne wejście **„Wybieram szkołę po 8 klasie”**.
- [ ] Na profilu zawodu: „Jakie rozszerzenia wybrać” i „Licea i technika z pasującym profilem w Gdańsku”.
- [ ] Strona liceum: dane z RSPO, profile klas z progami (skala 200), wyniki matur z rozszerzeń, link do Perspektyw, źródła z datami.
- [ ] Lista liceów z filtrami: dzielnica, profil, przedmiot rozszerzony, publiczne/niepubliczne.
- [ ] Opcjonalnie mapa (współrzędne z RSPO).

## Etap 5. Skala

Po pilocie kolejne miasta. W RSPO jest 2848 LO młodzieżowych w całej Polsce. Szkoły i wyniki matur da się zaciągnąć automatycznie, ale profile i progi wymagają ręcznej pracy co roku, bo każde miasto ma inny system naboru. Dlatego rozszerzać miasto po mieście.

---

## Decyzje Ady (2026-09-30)

1. **Pilot: Gdańsk** zamiast Krakowa.
2. **Licea i technika** od razu. Technika łączą się z zawodami bez studiów, a dla nich są kwalifikacje i egzamin zawodowy.
3. **Progi bez źródła: weryfikujemy.** Każdy próg dostaje wiarygodne źródło albo znika. Kolejność źródeł: strona uczelni, komunikat miasta lub kuratorium, serwis wtórny (oznaczony jako taki).
4. **Nie piszemy do CKE ani Fundacji Perspektywy.** Strona jest na razie do użytku wewnętrznego.

**Uwaga:** strona jest publiczna pod adrwis.github.io/kariera, a deploy uruchamia każdy push do `main`. Dopóki ma zostać wewnętrzna, zmiany siedzą na gałęzi `licea-gdansk` i nie trafiają do `main`.

## Czego nikt jeszcze nie sprawdził

- Licencja Mapy Egzaminów CKE.
- Jak dostać login do oficjalnego API RSPO.
- Kwota płacy minimalnej na 2026 r., przyjęta przez krytyka.


---

## Stan po nocy 2026-10-01

**Zrobione**
- Szkoły średnie: Gdańsk 57, Gdynia 29, Sopot 8, Warszawa 253 (RSPO, szkoły z uczniami). Oferta klas 2026/27 i progi 2026 (i 2025 tam, gdzie klasa się nie zmieniła) z oficjalnych źródeł: pliki Biura Edukacji m.st. Warszawy, serwisy statystyk VULCAN Gdyni i Sopotu, Nabór Pomorze, strony i regulaminy szkół. Matura 2026 z CKE.
- Uczelnie: progi 2026, poprawione wiersze z cudzych kierunków, konwencja „I tura” z opisem tury przy każdym progu, wymagania i czesne 2026/27. Dodane uczelnie trójmiejskie (UG, PG, GUMed, UMG, AMW, AWFiS, ASP, Akademia Muzyczna).
- Kod: wybór miasta, filtry na kodach rozszerzeń, poprawki z audytu (wyścigi, bfcache, trasy z ukośnikiem, noindex, odmiana, kontrast, telefon, akordeony), service worker network-first, `scripts/test-szkoly.js`.
- Styl: bez długich myślników i półpauz w danych i tekstach strony.

**Otwarte**
- SEO: podstrony nadal zwracają 404 (trik z 404.html); statyczne strony i sitemap odłożone.
- Quiz zainteresowań i kalkulator punktów ósmoklasisty.
- 40 opisów zawodów kończy się formułą „Wymaga X, Y i Z” (do przepisania).
- Progi 2026 części uczelni (UW, UJ, WUM, UG) jeszcze nieopublikowane: do uzupełnienia po publikacji.
