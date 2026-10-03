# Instrukcja poprawiania danych miasta po przeglądzie (dla agentów)

Projekt: /Users/ada/GitHub/inne/kariera (strona NextMove, zakładka Za granicą). Dziś 2026-10-03. Cel: podnieść jakość danych wskazanych miast do co najmniej 8 na 10. Najpierw przeczytaj `dev_docs/plan-zagranica.md` (zasady), `dev_docs/plan-zagranica-zbieranie-dodatek.md` (standardy jakości, słownik statusów matury) i raporty krytyków: `dev_docs/dane-robocze/wyniki/krytyk-zagranica-*.json` oraz `krytyk-zagranica2-*.json` (filtruj wpisy po polu `city`).

## Zadanie dla każdego miasta
1. Wczytaj aktualne dane: `data/zagranica/<slug>.json` (to wersja już po wcześniejszych poprawkach kodowych; nie edytuj jej).
2. Zbierz WSZYSTKIE uwagi krytyków o tym mieście (krytyczne i ważne obowiązkowo, drobne jeśli tanie) oraz uwagi z `dev_docs/pozostale-uwagi-zagranica.md`.
3. Dla każdej uwagi sprawdź źródło ponownie: curl z nagłówkiem User-Agent przeglądarki, czytaj stronę dosłownie (pdftotext dla PDF). WebSearch jest wyczerpany. Zablokowane strony (403, ekran weryfikacji): nie obchodź, zapisz w luki.
4. Napraw: popraw wartość, dodaj brakujące (czas trwania, język, terminy z rokiem, czesne dla UE z walutą i rokiem, status matury według słownika), dodaj poprawne adresy źródeł, usuń lub oznacz jako niepotwierdzone to, czego nie da się potwierdzić. NIE zgaduj i nie wyprowadzaj z innych uczelni. Brak potwierdzenia: null lub zdanie „do potwierdzenia na stronie uczelni”.
5. Gdy trzeba, dodaj brakujące programy (np. kierunek, który uczelnia ma, a krytyk wskazał jako brak) lub brakującą uczelnię, ale tylko z oficjalnych źródeł.
6. Teksty po polsku, pełnymi zdaniami, bez żargonu zbierania danych („nie pobrano”, „w tej sesji”, „HTTP 403”, „limit narzędzi”), bez długich myślników i antytez „to X, nie Y”, kwoty z twardą spacją (U+00A0), zakresy przez „do”.

## Format wyniku (jeden plik na miasto)
`dev_docs/dane-robocze/wyniki/poprawki-agentow-<slug>-2026-10-03.json`:
```
{
  "slug": "...",
  "programPatches": [ { "university": "dokładna nazwa uczelni jak w pliku", "programName": "dokładna nazwa programu jak w pliku", "set": { "pole": "wartość", ... }, "sourceUrl": "https://...", "quote": "dosłowny cytat ze strony (min. 10 znaków)" } ],
  "removePrograms": [ { "university": "...", "programName": "...", "reason": "..." } ],
  "addPrograms": [ { "university": "...", "universityUrl": "...", "universityType": "uniwersytet", "program": { pełny obiekt programu jak w pliku miasta }, "sourceUrl": "...", "quote": "..." } ],
  "summaryPatches": [ { "label": "Polska matura|Opłaty|Rekrutacja|Znajomość języka|Zakres|Uwagi", "text": "nowy tekst", "sourceUrl": "...", "quote": "..." } ],
  "gapsSet": [ "pełna, nowa lista luk jako zdania dla czytelnika (zastępuje starą)" ],
  "sourcesAdd": [ { "url": "https://...", "note": "krótka notka, czego dotyczy" } ]
}
```
Dozwolone pola w `set`: tuitionEu, tuitionNonEu, tuitionUrl, matura, requirements, languageProof, admissionUrl, selective, deadline, applyUrl, url, notes, durationYears, level, languages (tablica), academicYear. Każda zmiana programu i opisu MUSI mieć `sourceUrl` i `quote`, inaczej zostanie odrzucona. `gapsSet` napisz tak, by zawierał tylko to, co nadal niepotwierdzone po Twojej pracy. Uzupełnij `sourcesAdd` (puste notki w sources były uwagą krytyków).

Niczego innego w projekcie nie zmieniaj (nie edytuj data/, kodu ani innych plików). Pliki robocze w scratchpadzie `/private/tmp/claude-502/-Users-ada-GitHub/26143b21-06a7-4c88-83a0-03a307742ff0/scratchpad/<twoje-miasto>/`. Ogranicz się do ok. 80 wywołań narzędzi na dwa miasta.

## Odpowiedź końcowa (krótko)
Dla każdego miasta: co naprawiono, czego nie dało się potwierdzić (zostało w luki), szacunkowa ocena po poprawkach 1 do 10.

## Runda 2 (po przeglądzie końcowym, 2026-10-03)
Miasta poniżej 8 po przeglądzie końcowym dostają drugą rundę. Nowe zasady:
- Aktualne dane `data/zagranica/<slug>.json` zawierają już WSZYSTKIE wcześniejsze poprawki (pliki `poprawki-agentow-<slug>-2026-10-03.json` i poprawki kodowe). Nie powtarzaj ich. Napraw tylko to, co nadal jest otwarte według raportów `wyniki/krytyk-zagranica4-*.json` (najnowsze), `krytyk-zagranica3-*.json` i `dev_docs/pozostale-uwagi-zagranica.md`.
- Wynik zapisz jako NOWY plik `dev_docs/dane-robocze/wyniki/poprawki-agentow-<slug>-2026-10-03b.json` (sufiks `b`, format jak wyżej). Nakłada się on na poprzedni plik, więc podawaj tylko zmiany, które nadal są potrzebne.
- Zamiast ogólnych zastrzeżeń („do potwierdzenia”) spróbuj naprawdę znaleźć brakującą informację (np. czas trwania, język wykładowy, poziom języka, termin z rokiem, status matury z cytatem) na stronach uczelni, krajowych portalach i w oficjalnych bazach; próbuj alternatywnych adresów (angielskie wersje, PDF-y, strony wydziałów, publiczne API otwartych danych). Zablokowanych stron (403, ekran weryfikacji) nie obchodź. Tylko jeśli naprawdę nic nie znajdziesz, zostaw uczciwą informację „do potwierdzenia na stronie uczelni” i wpisz to w `gapsSet`.
- Nie używaj regexów do usuwania zdań z tekstów, nie sklejaj zdań bez spacji i kropki; podawaj pełne nowe wartości pól. Przed zapisem sprawdź, że w nowych tekstach nie ma żargonu zbierania danych („nie pobrano”, „odczytano”, „sprawdzonych stron”, „nie badano”, „wyszukiwanie”), antytez „to X, nie Y”, długich myślników i że kwoty mają twardą spację i separator tysięcy.
