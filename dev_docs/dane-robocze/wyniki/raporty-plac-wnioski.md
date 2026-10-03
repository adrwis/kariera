# Raporty płacowe (Hays, Sedlak, Antal) a płace na stronie NextMove

Data analizy: 2026-10-03. Dane szczegółowe: `dev_docs/dane-robocze/wyniki/raporty-plac-hays-2026-10-03.json` (631 ról z numerami stron, 79 dopasowań, gotowe teksty). W projekcie nie zmieniono żadnych innych plików.

## Najważniejsze wnioski

1. Z 79 zawodów 17 ma dobre dopasowanie do ról Hays, 7 przybliżone, 55 nie ma żadnego. Raporty Hays opisują stanowiska biurowe, kierownicze, inżynierskie i IT. Zawodów medycznych, nauczycielskich, mundurowych, rzemieślniczych, artystycznych i rolniczych w nich nie ma.
2. Z 24 dopasowanych zawodów 18 ma też liczby GUS, a 6 nie ma (tester, projektant UX, cyberbezpieczeństwo, data scientist, DevOps oraz adwokat, którego nie zalecamy uzupełniać).
3. Hays Opt (najczęściej oferowana kwota) wynosi zwykle od 1,1 do 1,7 mediany GUS. To spodziewana różnica: oferty z agencji dla średnich i dużych firm w 2025 roku kontra płace wszystkich pracowników z października 2024. Wzrost płac w tym czasie to według Hays najczęściej 2,5 do 5 proc., więc tłumaczy tylko niewielką część różnicy.
4. Żaden zawód nie ma zakresu Hays całkowicie poza przedziałem d1 do d9 GUS. Podejrzane są tylko dwa przypadki słabego dopasowania grupy GUS (biegły rewident, ekonomista) i jeden odwrotny kierunek (inżynier budowy w budownictwie ogólnym).
5. Rekomendacja: dodać osobny, opisany akapit „Rynek ofert (Hays Poland, 2025)” dla 9 zawodów o wysokim priorytecie i 3 opcjonalnych, pokazać Hays zamiast braku kwot dla 5 zawodów IT, dodać ostrzeżenia przy 4 zawodach ze zbyt szeroką grupą GUS. Pola salary i kart zawodów nie ruszać.

## 1. Czym są raporty

### Hays Poland, Raport płacowy 2026 (62 strony)

- **Próba.** Analiza płac opiera się na kilku tysiącach projektów rekrutacyjnych zrealizowanych przez Hays Poland dla średnich firm i dużych firm międzynarodowych (s. 3). Raport pokazuje ponad 500 stanowisk (s. 4). Osobno, w części o trendach, opisano badanie z końca 2025 roku: blisko 1100 firm i ponad 1800 pracowników i kandydatów (s. 4, uczestnicy na s. 23). Badanie ankietowe nie jest źródłem liczb w tabelach płac.
- **Okres.** Rekrutacje przeprowadzone w 2025 roku (s. 4 i stopka każdej tabeli). Raport nosi datę 2026.
- **Trzy liczby w tabelach.** Min*, Opt**, Max*. Min i Max to „miesięczne wynagrodzenie PLN brutto na danym stanowisku (pełen etat)”. Opt to „najczęściej oferowane wynagrodzenie na danym stanowisku” (przypisy pod tabelami, np. s. 27). We wstępie (s. 3) Opt nazwano „optymalnym”. Raport nie wyjaśnia, jak wyliczono Min i Max (czy to skrajne oferty, czy typowy dolny i górny koniec), więc nie przypisujemy im percentyli.
- **Jednostka.** PLN brutto miesięcznie, pełen etat, dane uśrednione dla całej Polski (s. 3).
- **Umowa i premie.** Raport nie pisze „umowa o pracę” ani nie mówi, czy kwoty zawierają premie i dodatki. Słowa „oferowanych osobom pracującym na pełny etat” sugerują etat, ale to wniosek.
- **Charakter danych.** Oferty z rekrutacji prowadzonych przez agencję (kandydaci pozyskiwani przez Hays), nie wypłaty wszystkich pracowników. Role są stanowiskami specjalistycznymi i kierowniczymi w średnich i dużych firmach. Raport nie dzieli danych na regiony ani wielkość firmy w tabelach.
- **Poziomy.** Tabele nie mają kolumny poziomu. Część ról ma doświadczenie w nazwie lub przypisie (np. s. 37: 3 do 5 lat), reszta to nazwa stanowiska (młodszy, starszy, kierownik, dyrektor). Poziom w pliku danych jest wnioskowany z nazwy, co oznaczono w polu poziomPochodzenie.
- **Podwyżki w tle.** Podwyżki w 2025: wynagrodzenia wzrosły w 80 proc. firm, najczęściej o 2,5 do 5 proc. (s. 15). 74 proc. specjalistów i menedżerów dostało podwyżkę, najczęściej do 10 proc. (s. 16). W instytucjach finansowych wzrost wyniósł około 4 proc. (s. 26).

### Hays, Raport płacowy IT Contracting 2026 (18 stron)

- **Próba.** Ponad 100 stanowisk IT, oparte na oczekiwaniach finansowych ponad 15 tysięcy kontraktorów IT (s. 3, Metodyka badania).
- **Okres.** Projekty rekrutacyjne Hays Poland z 2025 roku (s. 3).
- **Trzy liczby.** Min*, Opt**, Max*: „stawka godzinowa netto w PLN w ramach współpracy B2B”; Opt to „najczęściej oczekiwana stawka godzinowa netto” (s. 14).
- **Jednostka.** PLN netto za godzinę, współpraca B2B, uśrednione dla całej Polski (s. 3).
- **Oczekiwane, nie oferowane.** To stawki oczekiwane przez kontraktorów, w odróżnieniu od raportu etatowego, w którym są kwoty oferowane przez firmy.
- **Czego raport nie podaje.** Raport nie wyjaśnia, co znaczy „netto” (przyjmujemy, że to kwota na fakturze bez VAT, przed podatkiem dochodowym, składkami i kosztami firmy; wymaga potwierdzenia u Hays), nie podaje liczby godzin ani dni roboczych w miesiącu i nie podaje stawek miesięcznych.
- **Poziomy.** Poziom wynika z doświadczenia w nazwie roli: 1 do 2 lat (junior), 3 do 5 lat (specjalista), 5+ lat (senior). Role bez przedziału (Scrum Master, Product Owner, wsparcie 1. i 2. linii) nie mają poziomu.

### Antal, Raport Płacowy 2026

- Strona informacyjna bez tabel. Brak raportu do pobrania w materiałach. Średnie miesięczne wynagrodzenie specjalistów i menedżerów 16 400 zł brutto, wzrost o 5 proc. względem poprzedniej edycji (15 700 zł brutto). 15. edycja, dane z procesów rekrutacyjnych z drugiej połowy 2025 i pierwszej połowy 2026 roku.
- Użycie: Wyłącznie kontekst. To średnia (nie mediana) dla specjalistów i menedżerów razem, więc nie nadaje się do porównań z żadnym zawodem na stronie. Zgodna co do kierunku z Hays (wzrost płac o kilka procent).

### Poradnik Sedlak & Sedlak

To poradnik dla pracodawców o wartościowaniu stanowisk i budowie tabeli płac w związku z Dyrektywą 2023/970. Nie jest instrukcją czytania raportów płac. Używamy z niego tylko tego, co dotyczy porównywania płac, i oznaczamy, czego w nim brakuje (reguła 12).

## 2. Reguły z poradnika i jak je stosujemy

| Nr | Reguła | Strona | Status | Zastosowanie u nas |
|---|---|---|---|---|
| 1 | Widełki płacowe składają się z minimum, środka (midpoint) i maksimum. Środek zwykle równa się medianie rynkowej. | s. 30 | wprost z poradnika | Hays podaje Min, Opt i Max, ale Opt to najczęściej oferowana kwota, a nie mediana. Nie pisać „mediana Hays”. Zamiast tego „najczęściej oferowano”. |
| 2 | Benchmark rynkowy wymaga prawidłowej grupy porównawczej. Najczęściej wybiera się kryteria regionalne, branżowe lub szczebel organizacji. | s. 32 | wprost z poradnika | GUS (grupa 3-cyfrowa, wszystkie szczeble, firmy od 10 osób) i Hays (konkretne stanowiska, średnie i duże firmy) mają inne grupy porównawcze. Pokazywać je jako dwie osobne perspektywy z opisem, nie jako jedną liczbę. |
| 3 | Nazwa stanowiska nie wystarcza do porównania. „Kierownik”, „specjalista” i „koordynator” mogą oznaczać zupełnie inny poziom odpowiedzialności i płac. Stanowiska warto rozdzielać na od 2 do 6 poziomów (np. młodszy, doświadczony, starszy, ekspert). Test młodszy kontra starszy pokazuje, ile różnicy w płacy tłumaczy doświadczenie. | s. 10, 17, 41 | wprost z poradnika | Dopasowywać role po nazwie i poziomie. Nie zestawiać jednego poziomu (np. inżyniera budowy z początku kariery) z całą grupą zawodów bez ostrzeżenia. Hays rozdziela poziomy, GUS nie. |
| 4 | Rozpiętości płac zależą od szczebla: stanowiska operacyjne 15 do 20 proc., specjaliści 20 do 40 proc., kadra zarządzająca 40 do 60 proc. | s. 30 | wprost z poradnika | Zakres min do max dla jednej roli Hays i zakres d1 do d9 dla całej grupy GUS mają różną szerokość i inne znaczenie. Nie „zszywać” ich w jeden zakres. |
| 5 | Widełki sąsiednich poziomów powinny na siebie nachodzić, aby doświadczony pracownik niższego poziomu mógł zarabiać więcej niż początkujący wyższego. | s. 31 | wprost z poradnika | Nakładanie się zakresów junior i senior w raportach Hays jest normalne. Nie traktować zakresów jako rozłącznych. |
| 6 | Wynagrodzenie zasadnicze różni się od całkowitego. Ocena pracownika decyduje o miejscu w widełkach oraz o premiach i bonusach. Raport płacowy podaje też benefity (total rewards). | s. 10, 36, 43 | wprost z poradnika | GUS to wynagrodzenie ogółem z premiami, a Hays nie definiuje składników. Nie dodawać ani nie odejmować premii na własną rękę. Poinformować, że definicje mogą się różnić. |
| 7 | Dane płacowe starzeją się. Tabele i benchmark odświeża się co roku. Indeksacja o inflację lub wzrost płac rynkowych wynosi zwykle 1 do 3 proc. Wzrost płacy minimalnej wypycha najniższe kategorie. Wartościowanie stanowisk weryfikuje się co 3 do 5 lat. | s. 32, 33 | wprost z poradnika | GUS z października 2024 jest o 12 do 14 miesięcy starszy niż oferty Hays z 2025 roku. Oznaczać datę przy każdej liczbie. Kwoty bliskie płacy minimalnej (4 300 zł) opisywać jako próg, co strona już robi. |
| 8 | Comparatio, czyli płaca podzielona przez środek widełek: poniżej 80 proc. to sygnał ryzyka odejścia, od 90 do 110 proc. stan optymalny, 120 proc. to płaca powyżej rynku. | s. 33 | wprost z poradnika (dotyczy płacy pracownika względem widełek) | Analogicznie traktujemy stosunek Hays Opt do mediany GUS jako sygnał diagnostyczny. Progi 0,9 do 1,2 jako „zwykłe” i powyżej 1,5 jako „do wyjaśnienia” to nasza analogia, poradnik jej nie zawiera. |
| 9 | Różnice płac w tej samej kategorii uzasadniają obiektywne czynniki, np. wyraźnie wyższe stawki rynkowe i deficyt kandydatów. Realne widełki w ogłoszeniach stają się standardem. | s. 11, 35 | wprost z poradnika | W zawodach deficytowych (IT, cyberbezpieczeństwo) wyższe oferty Hays niż GUS są spodziewane i nie oznaczają błędu GUS. |
| 10 | Raport płacowy dostarcza dane pozyskane bezpośrednio od firm oraz dane makroekonomiczne (planowane i zrealizowane podwyżki, inflacja, PKB), które pomagają zinterpretować liczby. | s. 38, 44 | wprost z poradnika | Dane Hays o podwyżkach (s. 15, 16) pozwalają ocenić, ile z różnicy między październikiem 2024 a 2025 wynika z czasu. To kilka procent, a nie 30 do 60 proc. |
| 11 | Nie mieszać źródeł w jednym przedziale i nie uśredniać liczb z różnych badań. | wniosek z reguł 2, 3 i 6 (s. 10, 32, 36) | wniosek z poradnika (poradnik nie formułuje tego wprost) | Każde źródło ma własną linię z nazwą, datą i populacją. Pole salary pozostaje wyłącznie z GUS. |
| 12 | Poradnik nie definiuje percentyli i kwartyli (kwartyle pojawiają się tylko na wykresie luki płacowej, s. 43), nie omawia różnicy brutto i netto, umów o pracę i B2B, wielkości firm ani regionów jako cech próby badania. | cały poradnik | czego poradnik nie zawiera | Te zasady opieramy na wiedzy ogólnej: mediana to płaca środkowa i nie jest wrażliwa na bardzo wysokie płace, d1 i d9 GUS oznaczają, że 10 proc. pracowników zarabia mniej niż d1 i 10 proc. więcej niż d9, stawka B2B netto za godzinę nie przelicza się wprost na brutto na etacie. |

## 3. Czym różnią się GUS i Hays (do czytania każdego porównania)

- Populacja: GUS to wszyscy pracownicy etatowi firm od 10 osób, z początkującymi i seniorami, wszystkimi regionami. Hays to oferty z rekrutacji do średnich i dużych firm, na wybranych stanowiskach.
- Okres: GUS to październik 2024. Hays to rekrutacje z całego 2025 roku. Różnica około 12 do 14 miesięcy, w których płace rosły według Hays najczęściej o 2,5 do 5 proc.
- Rodzaj liczby: GUS podaje decyle (d1, mediana, d9) rzeczywistych płac. Hays podaje najniższą, najczęściej oferowaną i najwyższą kwotę oferty. Opt Hays nie jest medianą.
- Składniki: GUS to wynagrodzenie ogółem z premiami. Hays nie mówi, czy kwoty zawierają premie.
- Szerokość kategorii: GUS to grupy 3-cyfrowe (kilka zawodów razem). Hays to konkretne stanowiska z nazwami.
- Rodzaj liczby 2: oferty to ceny z ogłoszeń, a nie wypłaty. Faktyczna pensja po negocjacjach i po latach pracy może być inna.

Na stronie `salary.min` to d1, `salary.max` to d9, `salary.median` to piąty decyl GUS.

## 4. Dopasowanie 79 zawodów

Dobre: 17. Przybliżone: 7. Brak: 55.

- **Dobre:** programista, architekt, grafik, prawnik, analityk-danych, ksiegowy, tester, projektant-ux, specjalista-cyberbezpieczenstwa, data-scientist, devops-engineer, administrator-systemow, specjalista-hr, specjalista-marketingu, specjalista-pr, doradca-podatkowy, inzynier-budownictwa.
- **Przybliżone:** technik-informatyk, ekonomista, doradca-finansowy, biegly-rewident, adwokat, inzynier-mechanik, inzynier-srodowiska.
- **Brak:** pozostałe 55 zawodów. Dla dziesięciu zawodów, które mogą wyglądać na dopasowane, zapisano powód odrzucenia (elektryk, spawacz, pracownik ochrony, farmaceuta, architekt wnętrz, mechanik samochodowy, dziennikarz, programista gier, tłumacz, psycholog) w polu uwagi i najblizszeRoleOdrzucone.

Zasady dopasowania: po nazwie roli i poziomie, nie po kodzie. „Środek” (haysMid) to mediana najczęściej oferowanych kwot (Opt) ról rdzeniowych. Zakres haysMin i haysMax to najniższa dolna i najwyższa górna granica ról z pasma, od młodszego do starszego. Gdy w raporcie jest jedna rola, zakres jest wąski i oznaczono to w ocenie.

## 5. Tabela porównawcza

Kwoty w zł brutto miesięcznie. Hays: Min, Opt (środek), Max. GUS (październik 2024): d1, mediana, d9. Stosunek to środek Hays podzielony przez medianę GUS.

| Zawód | Dopas. | Role Hays (strony) | Hays Min / Opt / Max | GUS d1 / mediana / d9 | Stosunek | Dolna / d1 | Górna / d9 | Ocena |
|---|---|---|---|---|---|---|---|---|
| Programista | dobre | .NET/ C# Developer (s. 60); C/ C++ Developer (s. 60); Front-End Developer (s. 60); Java Developer (s. 60); Mobile Developer (s. 60); PHP Developer (s. | 12 000 / 18 500 / 25 000 | 7 084 / 13 900 / 26 000 | 1,33 | 1,69 | 0,96 | spodziewana |
| Architekt | dobre | Architekt (s. 41); Architekt Revit (s. 41); Starszy Architekt/ Architekt Prowadzący (s. 41) | 7 000 / 11 000 / 17 000 | 5 000 / 7 802 / 13 781 | 1,41 | 1,40 | 1,23 | spodziewana |
| Grafik komputerowy | dobre | Graphic Designer (s. 48) | 9 500 / 10 500 / 12 500 | 5 000 / 7 802 / 13 781 | 1,35 | 1,90 | 0,91 | spodziewana (jedna rola, wąska podstawa) |
| Prawnik | dobre | Młodszy Prawnik Kancelarii (s. 32); Prawnik Kancelarii (s. 32); Prawnik Wewnętrzny (s. 32); Starszy Prawnik Kancelarii (s. 32) | 7 500 / 14 000 / 43 000 | 7 325 / 14 745 / 25 388 | 0,95 | 1,02 | 1,69 | zgodna z GUS |
| Analityk danych | dobre | Analityk Danych (s. 28) | 10 000 / 13 000 / 15 000 | 6 738 / 11 943 / 23 162 | 1,09 | 1,48 | 0,65 | spodziewana (wąska podstawa) |
| Księgowy | dobre | Księgowy (s. 30); Młodszy Księgowy (s. 30); Samodzielny/ Starszy Księgowy (s. 30) | 6 500 / 10 000 / 18 000 | 5 355 / 7 867 / 12 402 | 1,27 | 1,21 | 1,45 | spodziewana |
| Tester oprogramowania | dobre | Automation Tester (s. 60); Manual Tester (s. 60) | 9 000 / 14 500 / 21 000 | brak w GUS | nie dotyczy | nie dotyczy | nie dotyczy | brak GUS, dane Hays jedyne |
| Projektant UX/UI | dobre | UX/ UI Designer (s. 48) | 10 000 / 13 500 / 16 500 | brak w GUS | nie dotyczy | nie dotyczy | nie dotyczy | brak GUS, dane Hays jedyne (jedna rola etatowa) |
| Specjalista ds. cyberbezpieczeństwa | dobre | Applications Security Specialist (s. 61); Cybersecurity Engineer (s. 61); Cybersecurity SOC Analyst Tier 2 (s. 61); Cybersecurity SOC Analyst Tier 3 ( | 15 000 / 22 500 / 34 000 | brak w GUS | nie dotyczy | nie dotyczy | nie dotyczy | brak GUS, dane Hays jedyne |
| Data scientist | dobre | Data Scientist (s. 61); Machine Learning Engineer (s. 61) | 19 000 / 23 500 / 27 000 | brak w GUS | nie dotyczy | nie dotyczy | nie dotyczy | brak GUS, dane Hays jedyne |
| DevOps engineer | dobre | Cloud Engineer (s. 60); DevOps Engineer (s. 60) | 18 000 / 23 500 / 26 000 | brak w GUS | nie dotyczy | nie dotyczy | nie dotyczy | brak GUS, dane Hays jedyne |
| Administrator systemów komputerowych | dobre | Database Administrator (Oracle, Microsoft SQL) (s. 60); Microsoft Windows Server Admin (s. 60); Network Administrator (s. 60); Unix/ Linux Admin (Redh | 14 000 / 17 000 / 20 000 | 6 738 / 11 943 / 23 162 | 1,42 | 2,08 | 0,86 | spodziewana |
| Technik informatyk | przybliżone | 2nd Line Support (s. 60); 3rd Line Support (s. 60) | 9 000 / 12 000 / 18 000 | 5 198 / 8 238 / 15 532 | 1,46 | 1,73 | 1,16 | spodziewana, ale dopasowanie przybliżone |
| Ekonomista | przybliżone | Analityk Finansowy (s. 30); Młodszy Analityk Finansowy (s. 30); Starszy Analityk Finansowy (s. 30) | 9 000 / 14 000 / 17 000 | 6 073 / 8 767 / 12 835 | 1,60 | 1,48 | 1,32 | podejrzana: grupa GUS nie pasuje do zawodu |
| Doradca finansowy | przybliżone | Doradca Klienta Bankowości Prywatnej (s. 27); Doradca Klienta MŚP (s. 27) | 9 000 / 14 000 / 19 000 | 6 072 / 9 650 / 17 500 | 1,45 | 1,48 | 1,09 | spodziewana, dopasowanie przybliżone |
| Specjalista ds. HR | dobre | HR Generalist (s. 34); Specjalista ds. Rekrutacji (s. 34); Specjalista ds. Zasobów Ludzkich (s. 34); Talent Acquisition Specialist (s. 34) | 7 500 / 10 500 / 14 000 | 5 897 / 9 000 / 15 406 | 1,17 | 1,27 | 0,91 | spodziewana |
| Specjalista ds. marketingu | dobre | Digital Marketing Specialist (s. 48); Marketing Specialist (s. 49) | 9 000 / 12 000 / 15 000 | 5 173 / 8 623 / 17 022 | 1,39 | 1,74 | 0,88 | spodziewana |
| Specjalista ds. PR | dobre | PR Specialist (s. 49) | 8 500 / 9 500 / 13 000 | 5 173 / 8 623 / 17 022 | 1,10 | 1,64 | 0,76 | spodziewana (jedna rola, wąska podstawa) |
| Doradca podatkowy | dobre | Doradca Podatkowy (s. 32); Konsultant ds. Podatków (s. 32); Specjalista ds. Podatków (s. 32); Starszy Konsultant ds. Podatków (s. 32) | 10 000 / 16 000 / 19 000 | 6 072 / 9 650 / 17 500 | 1,66 | 1,65 | 1,09 | wyższa niż zwykle, wyjaśnia ją zbyt szeroka grupa GUS |
| Biegły rewident | przybliżone | Audytor/ Starszy Audytor Wewnętrzny (s. 30); Senior/ Audit Manager (s. 30) | 14 000 / 22 000 / 25 000 | 6 072 / 9 650 / 17 500 | 2,28 | 2,31 | 1,43 | podejrzana: środek Hays powyżej d9 GUS, dopasowanie niepewne |
| Adwokat | przybliżone | Prawnik Kancelarii (s. 32); Starszy Prawnik Kancelarii (s. 32) | 11 000 / 14 000 / 43 000 | brak w GUS | nie dotyczy | nie dotyczy | nie dotyczy | brak GUS, dopasowanie przybliżone i populacja różna |
| Inżynier budownictwa | dobre | Inżynier Budowy (s. 41); Inżynier Budowy (s. 43); Kierownik Robót (s. 41); Kierownik Robót (s. 43) | 6 000 / 10 250 / 20 000 | 6 015 / 9 728 / 17 110 | 1,05 | 1,00 | 1,17 | zgodna ogółem, ale w budownictwie ogólnym odwrotny kierunek |
| Inżynier mechanik | przybliżone | Design Engineer (s. 37); Maintenance Engineer (s. 37); Production/ Process Engineer (s. 37); R&D Engineer (s. 37) | 8 000 / 11 000 / 18 000 | 6 015 / 9 728 / 17 110 | 1,13 | 1,33 | 1,05 | spodziewana, dopasowanie przybliżone |
| Inżynier środowiska | przybliżone | EHS Specialist (s. 37); Ekspert ds. Środowiska (s. 43) | 8 000 / 13 000 / 18 000 | 6 015 / 9 728 / 17 110 | 1,34 | 1,33 | 1,05 | spodziewana, dopasowanie przybliżone |

Stawki B2B (Hays IT Contracting, zł netto za godzinę) dla zawodów IT:

| Zawód | Junior (min / opt / max) | Specjalista 3 do 5 lat | Senior 5+ lat |
|---|---|---|---|
| Programista | 65 / 85 / 110 | 100 / 130 / 165 | 125 / 160 / 190 |
| Analityk danych | 70 / 90 / 110 | 110 / 125 / 140 | 130 / 145 / 160 |
| Tester oprogramowania | 50 / 75 / 95 | 75 / 102 / 135 | 95 / 150 / 185 |
| Projektant UX/UI | 65 / 75 / 90 | 90 / 100 / 115 | 120 / 130 / 160 |
| Specjalista ds. cyberbezpieczeństwa | 75 / 105 / 135 | 100 / 145 / 185 | 140 / 205 / 265 |
| Data scientist | 80 / 100 / 120 | 115 / 140 / 155 | 150 / 170 / 195 |
| DevOps engineer | 85 / 100 / 115 | 120 / 150 / 165 | 165 / 180 / 200 |
| Administrator systemów komputerowych | brak | 95 / 112 / 140 | 120 / 140 / 175 |
| Technik informatyk | brak | 55 / 72 / 95 | brak |

Kontrola spójności obu raportów Hays: stawka B2B specjalisty razy 168 godzin to na fakturze od 1,0 do 1,25 razy tyle, ile brutto na etacie (tester 1,1, DevOps 1,1, data scientist 1,0). To zwykła relacja między formami zatrudnienia, a liczby pochodzą z jednej agencji. Nie jest to przelicznik dla czytelnika.

## 6. Rozbieżności i ich ocena

Spodziewane przyczyny rozbieżności, w kolejności wpływu: (1) populacja (specjaliści, średnie i duże firmy kontra wszyscy pracownicy, w tym początkujący i małe firmy), (2) oferty z rekrutacji kontra faktyczne płace, (3) szerokość grupy GUS kontra nazwa stanowiska, (4) czas, czyli kilka procent, (5) wynagrodzenie ogółem z premiami (GUS) kontra niezdefiniowane składniki (Hays).

Pięć najważniejszych rozbieżności (szósta jako uzupełnienie):

1. **biegly-rewident.** Hays senior lub audit manager 22 000 zł (najczęściej) kontra mediana GUS 9 650 zł, stosunek 2,28. Środek Hays leży powyżej d9 GUS (17 500 zł). Przyczyna: grupa GUS 241 to wszyscy specjaliści do spraw finansowych, a rola Hays to wysoki szczebel audytu zewnętrznego, bez informacji o uprawnieniach.
2. **doradca-podatkowy.** Hays 16 000 zł (najczęściej, doradca podatkowy) kontra mediana GUS 9 650 zł, stosunek 1,66, a górna granica Hays 19 000 zł przekracza d9 GUS 17 500 zł. Ta sama szeroka grupa GUS 241.
3. **ekonomista.** Hays analityk finansowy 14 000 zł kontra mediana GUS 8 767 zł, stosunek 1,60. Kwoty GUS są identyczne jak u psychologa (grupa 263), co świadczy o słabym dopasowaniu grupy.
4. **architekt.** Hays architekt 11 000 zł kontra mediana GUS 7 802 zł, stosunek 1,41. Grupa GUS 216 łączy architektów z geodetami, kartografami i projektantami. Górna granica Hays 17 000 zł leży o 23 proc. powyżej d9 GUS.
5. **inzynier-budownictwa.** Odwrotny kierunek. Inżynier budowy w budownictwie ogólnym Hays 8 500 zł kontra mediana GUS 9 728 zł, stosunek 0,87. W energetyce 12 000 zł (1,23). Grupa GUS 214 zawiera kierowników i doświadczonych inżynierów, a rola Hays obejmuje też początkujących (min 6 000 zł).
6. **administrator-systemow.** Dolna granica Hays (14 000 zł) jest 2,1 razy wyższa niż d1 GUS (6 738 zł), a środek 1,42 mediany. Spodziewane (GUS ma początkujących i małe firmy), ale to największa różnica dolnych granic wśród dobrych dopasowań.

Żaden zawód z dopasowaniem nie ma zakresu Hays całkowicie poza przedziałem d1 do d9 GUS. Tylko w jednym przypadku (biegły rewident) środek Hays leży powyżej d9, a w jednym (inżynier budowy w budownictwie ogólnym) najczęściej oferowana kwota leży poniżej mediany GUS.

## 7. Rekomendacje korekt strony

### (a) Dodać drugą perspektywę „Rynek ofert (Hays Poland, 2025)”

Zawody o wysokim priorytecie: programista, administrator-systemow, ksiegowy, doradca-podatkowy, specjalista-hr, specjalista-marketingu, prawnik, architekt, inzynier-budownictwa. Opcjonalnie: grafik, specjalista-pr, analityk-danych.

Uzasadnienie: Reguły 2, 3, 7 i 9: różna populacja, poziom i data wymagają pokazania obu źródeł osobno i opisanych. Hays dodaje to, czego GUS nie ma: podział na poziomy i dane z 2025 roku. Forma: osobny akapit pod opisem GUS w `salaryNoteHtml`, z nazwą źródła, rokiem i krótkim wyjaśnieniem różnicy. Nie łączyć w jeden przedział, nie zmieniać `salaryCardText`.

### (b) Zawody bez kwot GUS, dla których Hays daje widełki

Tester, projektant UX, specjalista ds. cyberbezpieczeństwa, data scientist, DevOps engineer. Reguła 2 (grupa porównawcza) i 9 (rynkowe widełki): to jedyne dane o płacach tych zawodów w materiałach. Reguła 11: nie wpisywać ich do pola salary, które ma sens statystyczny GUS.

Propozycja techniczna: osobne pole `salaryMarket` zamiast wpisywania liczb do `salary`. Wymaga zmiany `js/app.js`, której nie wykonano. Dla zawodów IT opcjonalne zdanie o stawkach B2B, z zastrzeżeniem, że znaczenie „netto” wymaga potwierdzenia u Hays.

### (c) Zawody z obecnymi liczbami GUS słabo dopasowanymi do rynku

- **ekonomista.** Ta kwota dotyczy szerokiej grupy zawodów, w której są też psycholodzy i socjologowie, więc dla ekonomisty jest tylko orientacją.
- **doradca-podatkowy.** Kwota GUS dotyczy całej grupy specjalistów do spraw finansowych, w której są także analitycy i doradcy, więc dla doradcy podatkowego to tylko orientacja.
- **biegly-rewident.** Kwota GUS dotyczy całej grupy specjalistów do spraw finansowych, w której są także analitycy i doradcy, więc dla biegłego rewidenta jest tylko orientacją.
- **inzynier-budownictwa.** Kwota GUS dotyczy wszystkich inżynierów w grupie, z kierownikami i doświadczonymi specjalistami. Inżynier budowy na początku kariery może zarabiać mniej.

- Grupy GUS powtarzają się: kwoty 5 000 zł, 7 802 zł, 13 781 zł mają architekt, grafik, architekt wnętrz, projektant mody, geodeta, urbanista, kartograf i architekt krajobrazu (grupa 216). Kwoty 6 072 zł, 9 650 zł, 17 500 zł mają doradca finansowy, doradca podatkowy i biegły rewident (grupa 241). Kwoty 6 073 zł, 8 767 zł, 12 835 zł mają psycholog i ekonomista (grupa 263). Tekst „Liczba dotyczy całej grupy zawodów” jest tu potrzebny i już jest na stronie. Dla ekonomisty zdanie „obejmuje też pokrewne zawody” jest mylące, bo psycholog nie jest pokrewny.
- Karta zawodu pokazuje „typowo X brutto” z GUS. Jeśli w przyszłości pojawi się liczba Hays, jej etykieta powinna brzmieć „najczęściej oferowano”, żeby dwie „typowe” liczby nie sugerowały tego samego.

### (d) Gotowe teksty na stronę

Zasady: prosty język, brak długich myślników i antytez, zakresy przez „do”, kwoty „8 767 zł” z twardą spacją, brutto wyjaśnione. Teksty poniżej zawierają twarde spacje.

**Programista** (A)

> Rynek ofert w 2025 roku (agencja Hays Poland): programistom na pełnym etacie oferowano od 12 000 zł do 25 000 zł brutto miesięcznie. Najczęściej proponowane kwoty dla poszczególnych języków mieszczą się między 16 000 zł a 20 000 zł. Te kwoty są wyższe niż dane GUS. Częściowo wynika to z tego, że GUS liczy wszystkich pracowników etatowych w firmach od 10 osób, także początkujących, a Hays opisuje rekrutacje do średnich i dużych firm. Brutto to kwota przed odjęciem podatku i składek.
>
> B2B (opcjonalnie): Wielu programistów pracuje na własnej działalności i wystawia faktury za godziny pracy. Według raportu Hays IT Contracting 2026 stawki godzinowe netto wynosiły od 65 zł do 110 zł na początku kariery i od 125 zł do 190 zł przy doświadczeniu powyżej 5 lat. Z takiej kwoty trzeba jeszcze zapłacić podatek, składki i koszty firmy, więc nie da się jej porównać wprost z pensją brutto.

**Architekt** (A)

> Rynek ofert w 2025 roku (agencja Hays Poland): architekt z doświadczeniem w projektowaniu dostawał oferty od 7 000 zł do 13 000 zł brutto miesięcznie, najczęściej około 11 000 zł. Starszy architekt lub architekt prowadzący od 10 000 zł do 17 000 zł. W grupie GUS są też geodeci, kartografowie i projektanci, więc jego mediana jest niższa. Brutto to kwota przed odjęciem podatku i składek.

**Grafik komputerowy** (A (opcjonalnie))

> Rynek ofert w 2025 roku (agencja Hays Poland): grafik w firmach zajmujących się marketingiem cyfrowym i e-commerce dostawał oferty od 9 500 zł do 12 500 zł brutto miesięcznie, najczęściej około 10 500 zł. Raport nie obejmuje grafików pracujących na zlecenia. Brutto to kwota przed odjęciem podatku i składek.

**Prawnik** (A)

> Rynek ofert w 2025 roku (agencja Hays Poland): młodszy prawnik w kancelarii dostawał oferty od 7 500 zł do 10 000 zł brutto miesięcznie, prawnik od 11 000 zł do 20 000 zł, a starszy prawnik od 14 000 zł do 43 000 zł. Prawnik zatrudniony w firmie (in-house) mógł liczyć na kwoty od 13 000 zł do 30 000 zł. Najczęściej oferowano odpowiednio 9 000 zł, 14 000 zł, 22 000 zł i 22 000 zł. Brutto to kwota przed odjęciem podatku i składek.

**Analityk danych** (A (opcjonalnie))

> Rynek ofert w 2025 roku (agencja Hays Poland): analityk danych w bankach, firmach leasingowych i funduszach dostawał oferty od 10 000 zł do 15 000 zł brutto miesięcznie, najczęściej około 13 000 zł. Dla analityków w innych branżach raport nie podaje osobnych kwot. Brutto to kwota przed odjęciem podatku i składek.
>
> B2B (opcjonalnie): Analitycy pracujący na własnej działalności podawali w raporcie Hays IT Contracting 2026 stawki godzinowe netto od 70 zł do 110 zł na początku kariery i od 130 zł do 160 zł po 5 latach. Z takiej kwoty trzeba jeszcze zapłacić podatek, składki i koszty firmy.

**Księgowy** (A)

> Rynek ofert w 2025 roku (agencja Hays Poland): młodszy księgowy dostawał oferty od 6 500 zł do 9 000 zł brutto miesięcznie, księgowy od 9 000 zł do 14 000 zł, a samodzielny lub starszy księgowy od 12 000 zł do 18 000 zł. Najczęściej oferowano odpowiednio 8 000 zł, 10 000 zł i 14 000 zł. Dane z rekrutacji do średnich i dużych firm są wyższe niż GUS, który obejmuje też małe biura rachunkowe. Brutto to kwota przed odjęciem podatku i składek.

**Tester oprogramowania** (B)

> GUS nie podaje płac testerów osobno. Według agencji Hays Poland (rekrutacje z 2025 roku) tester ręczny dostawał oferty od 9 000 zł do 14 000 zł brutto miesięcznie, najczęściej około 11 000 zł. Tester automatyzujący, który pisze programy sprawdzające inne programy, od 14 000 zł do 21 000 zł, najczęściej około 18 000 zł. To oferty dla firm rekrutujących przez agencję, więc nie obejmują wszystkich testerów w Polsce. Brutto to kwota przed odjęciem podatku i składek.
>
> B2B (opcjonalnie): Testerzy pracujący na własnej działalności podawali w raporcie Hays IT Contracting 2026 stawki godzinowe netto od 50 zł do 95 zł na początku kariery i od 95 zł do 185 zł po 5 latach doświadczenia.

**Projektant UX/UI** (B)

> GUS nie podaje płac projektantów UX osobno. Według agencji Hays Poland (rekrutacje z 2025 roku) projektant UX/UI w firmach z marketingu cyfrowego i e-commerce dostawał oferty od 10 000 zł do 16 500 zł brutto miesięcznie, najczęściej około 13 500 zł. Brutto to kwota przed odjęciem podatku i składek.
>
> B2B (opcjonalnie): Projektanci pracujący na własnej działalności podawali w raporcie Hays IT Contracting 2026 stawki godzinowe netto od 65 zł do 90 zł na początku kariery i od 120 zł do 160 zł po 5 latach.

**Specjalista ds. cyberbezpieczeństwa** (B)

> GUS nie podaje płac specjalistów od cyberbezpieczeństwa osobno. Według agencji Hays Poland (rekrutacje z 2025 roku) analityk SOC, który monitoruje ataki na firmę, dostawał oferty od 15 000 zł do 20 000 zł brutto miesięcznie na poziomie 2 i od 20 000 zł do 29 000 zł na poziomie 3. Specjalista ds. bezpieczeństwa infrastruktury lub aplikacji od 18 000 zł do 23 000 zł, a inżynier cyberbezpieczeństwa od 25 000 zł do 34 000 zł. Brutto to kwota przed odjęciem podatku i składek.
>
> B2B (opcjonalnie): Specjaliści pracujący na własnej działalności podawali w raporcie Hays IT Contracting 2026 stawki godzinowe netto od 75 zł do 135 zł na początku kariery i od 140 zł do 265 zł po 5 latach.

**Data scientist** (B)

> GUS nie podaje płac data scientistów osobno. Według agencji Hays Poland (rekrutacje z 2025 roku) data scientist oraz inżynier uczenia maszynowego dostawali oferty od 19 000 zł do 27 000 zł brutto miesięcznie, najczęściej od 23 000 zł do 24 000 zł. Raport nie podaje, dla jakiego doświadczenia są te liczby. Brutto to kwota przed odjęciem podatku i składek.
>
> B2B (opcjonalnie): Data scientiści pracujący na własnej działalności podawali w raporcie Hays IT Contracting 2026 stawki godzinowe netto od 80 zł do 120 zł na początku kariery i od 150 zł do 195 zł po 5 latach.

**DevOps engineer** (B)

> GUS nie podaje płac inżynierów DevOps osobno. Według agencji Hays Poland (rekrutacje z 2025 roku) inżynier DevOps dostawał oferty od 18 000 zł do 25 000 zł brutto miesięcznie, najczęściej około 23 000 zł. Inżynier chmury (cloud engineer) od 20 000 zł do 26 000 zł. Brutto to kwota przed odjęciem podatku i składek.
>
> B2B (opcjonalnie): Inżynierowie DevOps pracujący na własnej działalności podawali w raporcie Hays IT Contracting 2026 stawki godzinowe netto od 85 zł do 115 zł na początku kariery i od 165 zł do 200 zł po 5 latach.

**Administrator systemów komputerowych** (A)

> Rynek ofert w 2025 roku (agencja Hays Poland): administratorom sieci, systemów Linux i Windows oraz baz danych oferowano od 14 000 zł do 20 000 zł brutto miesięcznie, najczęściej od 16 000 zł do 18 000 zł. Te kwoty są wyższe niż dane GUS. Częściowo wynika to z tego, że GUS liczy wszystkich pracowników etatowych w firmach od 10 osób, także początkujących, a Hays opisuje rekrutacje do średnich i dużych firm. Brutto to kwota przed odjęciem podatku i składek.
>
> B2B (opcjonalnie): Administratorzy pracujący na własnej działalności podawali w raporcie Hays IT Contracting 2026 stawki godzinowe netto od 95 zł do 140 zł po 3 do 5 latach i od 120 zł do 175 zł po 5 latach.

**Specjalista ds. HR** (A)

> Rynek ofert w 2025 roku (agencja Hays Poland): specjalistom ds. zasobów ludzkich, rekrutacji i HR generalistom oferowano od 7 500 zł do 14 000 zł brutto miesięcznie, najczęściej od 8 500 zł do 12 000 zł. Młodszy specjalista dostawał od 6 000 zł do 7 500 zł. Dane z rekrutacji do średnich i dużych firm są nieco wyższe niż GUS. Brutto to kwota przed odjęciem podatku i składek.

**Specjalista ds. marketingu** (A)

> Rynek ofert w 2025 roku (agencja Hays Poland): specjalistom ds. marketingu oferowano od 9 000 zł do 15 000 zł brutto miesięcznie, najczęściej od 11 000 zł do 13 000 zł. Te kwoty są wyższe niż dane GUS. Częściowo wynika to z tego, że GUS liczy wszystkich pracowników etatowych w firmach od 10 osób, także początkujących, a Hays opisuje rekrutacje do średnich i dużych firm. Brutto to kwota przed odjęciem podatku i składek.

**Specjalista ds. PR** (A (opcjonalnie))

> Rynek ofert w 2025 roku (agencja Hays Poland): specjalista ds. PR dostawał oferty od 8 500 zł do 13 000 zł brutto miesięcznie, najczęściej około 9 500 zł. To zbliżone do danych GUS. Brutto to kwota przed odjęciem podatku i składek.

**Doradca podatkowy** (A + C)

> Rynek ofert w 2025 roku (agencja Hays Poland): doradcy podatkowemu oferowano od 13 000 zł do 19 000 zł brutto miesięcznie, najczęściej około 16 000 zł. Konsultant ds. podatków dostawał od 10 000 zł do 15 000 zł. Dane GUS są niższe, bo dotyczą wszystkich specjalistów do spraw finansowych, także analityków i doradców inwestycyjnych. Brutto to kwota przed odjęciem podatku i składek.

**Inżynier budownictwa** (A + C)

> Rynek ofert w 2025 roku (agencja Hays Poland): inżynier budowy w budownictwie ogólnym dostawał oferty od 6 000 zł do 11 000 zł brutto miesięcznie, najczęściej około 8 500 zł, a przy budowie instalacji energetycznych od 10 000 zł do 15 000 zł. Kierownik budowy mógł liczyć na kwoty od 14 000 zł do 20 000 zł w budownictwie ogólnym i od 15 000 zł do 28 000 zł w energetyce. Kwota GUS dotyczy wszystkich inżynierów w grupie, więc początkujący inżynier budowy może zaczynać poniżej niej. Brutto to kwota przed odjęciem podatku i składek.

**Ekonomista**, ostrzeżenie: Ta kwota dotyczy szerokiej grupy zawodów, w której są też psycholodzy i socjologowie, więc dla ekonomisty jest tylko orientacją.

**Biegły rewident**, ostrzeżenie: Kwota GUS dotyczy całej grupy specjalistów do spraw finansowych, w której są także analitycy i doradcy, więc dla biegłego rewidenta jest tylko orientacją.

### (e) Czego nie zmieniać

- Pole salary (min, median, max z GUS) i tekst na karcie zawodu. Jedna karta, jedno źródło, jedna liczba (reguły 2 i 11).
- Zawody bez dopasowania (55) pozostają bez zmian, razem z obecnym salaryNote lub opisem GUS. Raporty Hays nie obejmują zawodów medycznych, nauczycielskich, mundurowych, robotniczych, rzemieślniczych, artystycznych i rolniczych.
- Nie wpisywać liczb Hays do pola salary i nie uśredniać ich z GUS.
- Nie przeliczać stawek B2B na brutto na etacie ani na miesięczne pensje w tekście dla czytelnika (ilustracja 168 godzin jest tylko kontrolą spójności w danych roboczych).
- Nie nazywać Opt medianą.
- Nie dodawać Antal poza ewentualnym zdaniem kontekstu, bo nie ma tabel ani stanowisk.
- Zapisu progu płacy minimalnej (4 300 zł) przy fryzjerze, kosmetyczce i cukierniku. Hays ich nie obejmuje.
- Nie dodawać linii Hays dla zawodów z dopasowaniem przybliżonym (technik informatyk, ekonomista, doradca finansowy, biegły rewident, inżynier mechanik, inżynier środowiska, adwokat). Dla trzech z nich zaproponowano ostrzeżenie zamiast liczb.

## 8. Ograniczenia i pytania do potwierdzenia

- Czy „netto” w IT Contracting oznacza kwotę na fakturze bez VAT (pytanie do Hays).
- Czy kwoty w raporcie etatowym zawierają premie i dodatki (raport nie mówi).
- Jak policzono Min i Max (skrajne oferty czy typowy dolny i górny koniec).
- Czy dla ról IT na s. 60 i 61 raport zakłada doświadczenie (tabele nie podają poziomu).
- Poradnik Sedlak nie opisuje czytania raportów płac wprost. Reguły 1 do 10 są cytowane ze stron, reguła 11 jest wnioskiem, reguła 12 wskazuje luki.
- Role Hays w sektorach nie dzielą danych na regiony ani wielkość firm. Liczby są uśrednione dla całej Polski.
- Poziom (junior, specjalista, senior, manager) w raporcie etatowym wnioskowano z nazw ról, co oznaczono w danych.
- Tabele odczytano programowo z tekstu PDF, sprawdzono kontrolą min <= opt <= max i ręcznie uzupełniono cztery wiersze o nietypowym układzie (s. 60, 61).
