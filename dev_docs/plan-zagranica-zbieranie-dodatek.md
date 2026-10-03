# Dodatek do instrukcji zbierania danych (po przeglądzie krytyków 2026-10-03)

Obowiązuje razem z `plan-zagranica-zbieranie.md`. Dotyczy miast, które nie są stolicami: wybierz 3 do 4 największych uczelni publicznych w tym mieście lub aglomeracji (uczelnie w sąsiednim mieście wpisuj tylko, gdy to ta sama aglomeracja, i zaznacz to w nazwie). Wzór jakości: `wyniki/zagranica-wieden-2026-10-03.json`.

## Czego nauczył nas przegląd (unikaj tych błędów)
1. **Status matury** ustawiaj tylko według słownika: „uznawana” (źródło wprost wymienia polskie świadectwo albo równoważność świadectw UE bez dodatkowego etapu), „uznawana z warunkami” (uznanie świadectwa lub przedmioty wymagane), „wymaga dodatkowego etapu” (egzamin wstępny, test, SAT/ACT, nostryfikacja), „wymaga potwierdzenia przez uczelnię” (źródło nie mówi nic o Polsce). Nie wpisuj „uznawana”, gdy źródło tylko ogólnie mówi o „zagranicznych świadectwach”. Nie przypisuj wymagań krajowi „z kolejności na liście”, jeśli kraj nie jest podpisany.
2. **Czesne:** zawsze podaj walutę i rok akademicki, osobno obywatele UE i spoza UE. „Brak czesnego” wpisuj tylko, gdy źródło mówi to dosłownie (nie z braku wzmianki). Kwoty w walutach lokalnych zostaw w tej walucie (strona przeliczy je sama po kursie NBP).
3. **Terminy** zawsze z rokiem. Jeśli strona podaje tylko dzień i miesiąc albo termin poprzedniego cyklu, napisz to wprost („termin z naboru 2026/27, na 2027/28 jeszcze nieopublikowany”). Nigdy nie wyprowadzaj roku z cyklu.
4. **Czas trwania (`durationYears`)** wypełnij dla każdego programu (180 ECTS = 3 lata, 240 = 4, itd.) z cytatem ze strony; brak źródła: null.
5. **Język wykładowy** i wymagany poziom języka wpisz dla każdego programu. Programy w języku lokalnym oznacz tak, żeby było to widać (np. w `languages` i `notes`: wymagany poziom).
6. **Selekcja (`selective`)**: true, gdy są limity miejsc, testy, ranking lub oferty wymagające wysokich wyników. Nie ustawiaj false „bo nie znaleziono”.
7. Każda liczba z `sourceUrl` i krótkim cytatem. Strony czytaj przez curl z nagłówkiem User-Agent przeglądarki i dosłownie (pdftotext dla PDF); WebFetch streszcza i myli liczby. WebSearch jest wyczerpany. Zablokowane strony (403, ekran weryfikacji): zapisz w `luki`, nie obchodź.
8. **Teksty:** pisz po polsku pełnymi zdaniami, bez żargonu zbierania danych (nie pisz „nie pobrano”, „w tej sesji”, „HTTP 403”, „WAF”, „limit narzędzi”, „wynik wyszukiwania”). Niepotwierdzone: „nie podano na stronie” albo „do potwierdzenia na stronie uczelni”. Bez długich myślników, bez antytez „to X, nie Y”, kwoty z twardą spacją (U+00A0) i separatorem tysięcy („12 000 EUR”), zakresy przez „do”.
9. `luki`: pełne zdania dla czytelnika (np. „Nie udało się sprawdzić X, bo strona uczelni jest niedostępna publicznie”). Bez fraz doklejanych w środek zdań.
10. W `overview` podaj: polishMatura, tuition, generalDeadlines, englishProof (każde 1 do 4 zdań), a w `sources` listę ogólnych źródeł (url, krótka notka).
11. Plik wyniku: `dev_docs/dane-robocze/wyniki/zagranica-<slug>-2026-10-03.json`. Niczego innego w projekcie nie zmieniaj. Maks. ok. 60 do 70 wywołań narzędzi.

## Odpowiedź końcowa agenta (krótko)
Uczelnie i liczba programów, jak kraj/uczelnie traktują polską maturę, czesne dla UE, główne luki.
