# Przegląd danych „Za granicą” (2026-10-03): co zostało po poprawkach

Krytyków było trzech (dane, 3 grupy miast) plus jeden do kodu i UX. Surowe raporty: `dev_docs/dane-robocze/wyniki/krytyk-zagranica-*.json`.
Poprawki zastosowane na danych: `dev_docs/dane-robocze/poprawki-zagranica.js` (uruchamia je `build-zagranica.js`).

## Naprawione
- Praga: polskie świadectwo jest równoważne z czeskim bez nostryfikacji (opis i status matury przepisane).
- Kopenhaga: termin 15 marca dla CBS dotyczy tylko osób potrzebujących zezwolenia na pobyt, obywatele UE mają do 5 lipca.
- Berlin TU: stare terminy 2025/26 zastąpione informacją, że termin 2027/28 nie jest opublikowany.
- Londyn Imperial: usunięte progi stanine przypisane do Polski „z kolejności listy”.
- Lizbona: status „wymaga dodatkowego etapu” przy programach z Matemática A.
- Nikozja (cennik UNIC UE), Sofia (czesne TU, matura po bułgarsku), Wilno (egzamin na medycynę), Ateny, Valletta, Helsinki (SAT/ACT), Wiedeń, Rzym, Bratysława, Ryga, Zagrzeb, Budapeszt, Amsterdam, Dublin: poprawki statusów, ostrzeżeń i zdań.
- We wszystkich miastach: żargon zbierania danych („nie pobrano”, „w tej sesji”, „HTTP 403”), doklejona fraza „Część danych do potwierdzenia…”, twarde spacje w kwotach.

## Do zrobienia (wymaga ponownego sprawdzenia stron uczelni)
- Londyn: QMUL i KCL niezweryfikowane (strony dały 403), dodano tylko ostrzeżenie przy programie.
- Zagrzeb: po uzupełnieniu 15 programów (architektura, budownictwo, dziennikarstwo, ZŠEM, FSB, EFZG). Czesne UE na programach po chorwacku niepotwierdzone (rozporządzenie NN 78/2023 nieodczytane), natječaj na 2027/28 jeszcze nie opublikowany, brak medycyny po chorwacku.
- Nikozja: brak Uniwersytetu Cypryjskiego (blokada), medycyna ok. 90%: nie wiadomo, jak liczyć polską maturę.
- Ryga: brak RTU (blokada), więc brak architekta, inżyniera budownictwa i mechanika.
- Luksemburg: dodany (10 programów), ale uni.lu jest za ekranem weryfikacji, więc nazwy programów, języki i terminy pochodzą z ministerstwa i wymagają potwierdzenia na uni.lu. Czesne: 400 EUR za semestr wg ministerstwa, inna strona podaje 200 do 400 EUR. Brak psychologii, data science i architektury na licencjacie.
- Czas trwania studiów (`durationYears`) nadal brakuje w: Bukareszt (UPB, UTCB, ASE poza Drept), Ateny (NKUA, AUEB), Sofia (UNI Sofia), Praga FSv. Uzupełniono 8 pól z cytatami (UB, ASE Drept, FS ČVUT).
- Bukareszt: kwoty w lejach bez przeliczenia na EUR z datą kursu.
- Daty naborów z cyklu 2026 bez roku w źródle (Amsterdam, Berlin HTW, Dublin, Paryż, Sztokholm, Madryt UNEDasiss, Ateny).
- Budapeszt: 3 martwe adresy `admissionUrl` na Corvinus.
- Bruksela ULB: status matury i terminy niepotwierdzone na stronach ARES.
- Praga FS ČVUT, Bratysława EUBA: karty prawie puste (pokazują „brak potwierdzonych danych”).
- Teksty: antytezy typu „a nie wynik matury” w kilku miastach (Budapeszt, Bratysława, Wilno, Lublana, Tallinn, Helsinki), kalki („opłata aplikacyjna”).
- Dublin: tabela przeliczania CAO powtórzona w każdym programie (do przeniesienia do opisu miasta).

## Partia 2 (miasta poza stolicami), przegląd 2026-10-03
Raporty: `dev_docs/dane-robocze/wyniki/krytyk-zagranica2-*.json`. Oceny przed poprawkami: Groningen 8, Maastricht 8, Bolonia 8, Walencja 7, Monachium 7, Lyon 7, Rotterdam 6,5, Barcelona 6, Mediolan 6, Porto 5,5, Hamburg 5, Lowanium 5.

Naprawione: termin KU Leuven Engineering Technology (15 czerwca 2027 UE/EOG), okno Porto 20 do 29 lipca i kolejne fazy, spójne statusy matury w Porto, Bucerius jako czesne odroczone, ostrzeżenie przy HAW Maschinenbau (nabór trwa teraz), czesne BSc Centrale/emlyon niepotwierdzone dla UE, link do psychologii angielskiej w Groningen, skrót uczelni EUR mylący z walutą (Rotterdam), statusy matury w Barcelonie, Walencji i LMU, zakres Mediolanu (tylko Polimi), żargon zbierania danych.

Do zrobienia (wymaga ponownego sprawdzenia stron):
- Hamburg UHH: liczby o selekcji (90/10 procent, 148 miejsc, BaPsy) podpięte pod stronę bez tych liczb; czesne 0 EUR bez dosłownego źródła przy UHH i LMU.
- Monachium: uni-assist 75 i 30 EUR bez źródła (strony uni-assist dały 404), wartości NC LMU bez źródła.
- Barcelona: noty odcięcia nie ma w PDF podanym jako źródło, UB Psicologia i UAB Economia mają identyczną notę 9,660; UB i UPF bez języka i czasu trwania.
- Mediolan: brak Unimi i Bicocca (ekran weryfikacji), ARCHED daty niespójne między Bolonią a Mediolanem.
- Rotterdam i Groningen: lista z Polską (RUG, UM) ładowana dynamicznie, niepotwierdzona dosłownie; Econometrics i inne statusy matury do ujednolicenia między miastami holenderskimi.
- Porto: uchwała CNAES z Polską i data 30 marca 2027 bez adresu źródłowego; poziom portugalskiego niewidoczny.
- Wszystkie nowe miasta: puste notki w `sources`.

## Poprawki po przeglądzie kontrolnym (2026-10-03, sześciu krytyków, raporty krytyk-zagranica3-*.json)
Oceny kontrolne: Londyn 8, Paryż 8, Lyon 8, Wiedeń 8, Hamburg 8, Monachium 8, Kopenhaga 8, Bruksela 8, Rotterdam 8, Lowanium 8, Porto 8, Zagrzeb 8, Ryga 8, Tallinn 8, Praga 8,5, Bratysława 8,5, Bukareszt 8, Rzym 8, Mediolan 8; poniżej 8 przed tymi poprawkami: Dublin 7, Berlin 7, Sztokholm 7, Amsterdam 6, Lizbona 7, Ateny 7, Nikozja 7, Valletta 7, Sofia 6,5, Helsinki 7,5, Barcelona 7, Walencja 7.

Poprawione po kontroli: kwota TCD Computer Science spoza UE (29 570 EUR), data otwarcia CAO, opłata ENSAL 391 EUR, wymogi TU Wien bez źródła, czesne TU i HTW wywnioskowane z braku wzmianki, statusy matury w Amsterdamie (numerus fixus i VU), puste rekordy UvA, 342 miejsca VU, cztery licencjaty po angielsku w Kopenhadze, ostrzeżenie przy ITU Software, termin 15 kwietnia w Sztokholmie, UNIWA w Atenach, UCY zakres, zbędny akapit czesnego w Zagrzebiu, selective w Vallettcie, Rzym L-20 i ARDI, Humanitas i Bicocca w Mediolanie, zbyt mocna teza o notach w Barcelonie, noty UV w Walencji, zdublowane zdania w Sofii, żargon zbierania danych we wszystkich miastach.

Nadal otwarte (wymaga źródeł): progi SAT w Aalto (oznaczone jako orientacyjne), poziom szwedzkiego w Sztokholmie, kwoty płatnych miejsc SU w Sofii (dokumenty to skany), Unimi/Bicocca bez psychologii i medycyny, UB i UPF w Barcelonie bez języka, DAAD/anabin (Berlin), terminy 2027/28 we wszystkich miastach.

## Druga runda dla ośmiu miast poniżej 8 i kontrola (2026-10-03)
Oceny kontrolne po drugiej rundzie: Dublin 9, Berlin 8, Amsterdam 8, Barcelona 8, Walencja 8, Ateny 8, Sztokholm 7, Nikozja 7. Ostatnie poprawki po tej kontroli (cytat HTW, status matury medycyny w Amsterdamie, `selective` i zdanie „bez odrzucenia” w UNIC, niepotwierdzony podział języków KTH, drobiazgi w Atenach i Sztokholmie) są wdrożone bez ponownej kontroli.

Nadal otwarte: Sztokholm (podział języków w programach KTH niepotwierdzony na stronach programów, sekcje „Rekrutacja” zdublowane), Nikozja (kierunki UCY tylko z rejestru CYQAA, kryteria i terminy do potwierdzenia, UNIC bez progów), Berlin (status matury w DAAD i anabin, brak Uniwersytetu Humboldtów), Barcelona (język UPF Periodisme), brak terminów 2027/28 u większości uczelni.
