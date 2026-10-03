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
- Zagrzeb: tylko 5 programów. Brakuje architektury, budownictwa, ekonomii (EFZG), mechaniki (FSB), dziennikarstwa.
- Nikozja: brak Uniwersytetu Cypryjskiego (blokada), medycyna ok. 90%: nie wiadomo, jak liczyć polską maturę.
- Ryga: brak RTU (blokada), więc brak architekta, inżyniera budownictwa i mechanika.
- Luksemburg: w przygotowaniu.
- Czas trwania studiów (`durationYears`) brakuje w: Bukareszt 18 z 21, Ateny 8 z 16, Praga FS, Sofia.
- Bukareszt: kwoty w lejach bez przeliczenia na EUR z datą kursu.
- Daty naborów z cyklu 2026 bez roku w źródle (Amsterdam, Berlin HTW, Dublin, Paryż, Sztokholm, Madryt UNEDasiss, Ateny).
- Budapeszt: 3 martwe adresy `admissionUrl` na Corvinus.
- Bruksela ULB: status matury i terminy niepotwierdzone na stronach ARES.
- Praga FS ČVUT, Bratysława EUBA: karty prawie puste (pokazują „brak potwierdzonych danych”).
- Teksty: antytezy typu „a nie wynik matury” w kilku miastach (Budapeszt, Bratysława, Wilno, Lublana, Tallinn, Helsinki), kalki („opłata aplikacyjna”).
- Dublin: tabela przeliczania CAO powtórzona w każdym programie (do przeniesienia do opisu miasta).
