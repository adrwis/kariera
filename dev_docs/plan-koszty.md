# Koszty życia i akademiki: plan i instrukcja zbierania (dla agentów)

Projekt: /Users/ada/GitHub/inne/kariera (strona NextMove). Zakładka „Koszty życia i akademiki” obok zakładki „Za granicą”. Najpierw miasta z listy w `data/zagranica/index.json`, potem duże miasta akademickie w Polsce. Dziś 2026-10-03. Odbiorcy to nastolatkowie i ich rodzice, więc dane mają być konkretne, aktualne i uczciwie opisane.

## Co zebrać dla miasta
1. **Akademiki i rezydencje studenckie** (2 do 5 pozycji): główny operator (np. Studentenwerk, CROUS, DUWO, SSSB, uczelniane domy studenckie, rezydencje uniwersytetu) i ewentualnie największy prywatny operator z oficjalnej strony. Dla każdej pozycji: nazwa, typ pokoju (jednoosobowy, dwuosobowy, studio), cena od-do z walutą i okresem (miesiąc/semestr/rok), co obejmuje (media, internet), kaucja, czy przyjmują studentów zagranicznych i obywateli UE, jak i do kiedy składać wniosek (z rokiem), czy jest lista oczekujących, adres strony wniosku.
2. **Przykładowe ceny wynajmu** (3 do 5 wierszy): pokój w mieszkaniu współdzielonym, kawalerka lub studio, mieszkanie 1-pokojowe, ewentualnie 2-pokojowe, z dzielnicą lub strefą i rokiem. Cena od-do w walucie lokalnej, za miesiąc, z informacją, czy zawiera media.
3. **Miesięczny budżet studenta**: oficjalna szacunkowa kwota (od uczelni, rządowego portalu dla studentów, urzędu migracyjnego lub urzędu statystycznego), z opisem, co obejmuje (czynsz, jedzenie, transport, ubezpieczenie).
4. **Jak szukać mieszkania**: 2 do 4 zdań (oficjalne platformy uczelni, miasta lub organizacji studenckiej, uwaga o oszustwach i kaucji).

## Źródła (twarde zasady)
- **Akademiki i budżet:** tylko oficjalne źródła (strony uczelni, organizacji studenckich i akademików, rządowe portale dla studentów typu Study in X/Studyinholland/Campus France/DAAD, urzędy statystyczne, miasto).
- **Wynajem:** najpierw źródła oficjalne (uczelnie, urzędy statystyczne, Eurostat, miasto, rządowe portale, organizacje studenckie). Jeśli ich brak, wolno użyć opublikowanego raportu rynkowego dużego portalu najmu lub oficjalnego narzędzia branżowego, ale wiersz MUSI mieć `official: false` i etykietę „dane nieoficjalne” oraz link. Nie używaj pojedynczych ogłoszeń ani forów, ani Numbeo/Expatistan jako jedynego źródła. Nie mieszaj wartości z różnych lat bez podania roku.
- Każda liczba z `sourceUrl` i krótkim dosłownym cytatem. Brak potwierdzenia: `null` i opis w `gaps`. NIE zgaduj, NIE wyprowadzaj z innego miasta, NIE przeliczaj walut (strona przelicza sama po kursie NBP).
- Strony czytaj przez curl z nagłówkiem User-Agent przeglądarki, dosłownie (pdftotext dla PDF). WebFetch streszcza i myli liczby. WebSearch jest wyczerpany. Zablokowane strony (403, ekran weryfikacji): nie obchodź, zapisz w `gaps`.

## Zasady redakcji
Po polsku, pełnymi zdaniami, bez żargonu zbierania danych („nie pobrano”, „w tej sesji”, „odczytano”, „limit narzędzi”, „wyszukiwanie”), bez długich myślników i antytez „to X, nie Y”, zakresy przez „do”, kwoty w polach liczbowych jako liczby (bez spacji), a w tekstach z twardą spacją (U+00A0) i separatorem tysięcy. Miasto, w którym jest wiele uczelni, opisz zbiorczo; nazwy operatorów zachowaj oryginalne.

## Format wyniku (jeden plik na miasto): `dev_docs/dane-robocze/wyniki/koszty-<slug>-2026-10-03.json`
```
{
  "slug": "...", "name": "...", "country": "...", "currency": "EUR", "retrieved": "2026-10-03",
  "summary": [ { "label": "Akademiki" | "Wynajem" | "Budżet miesięczny" | "Jak szukać mieszkania" | "Uwagi", "text": "1 do 4 zdań" } ],
  "budget": { "from": liczba|null, "to": liczba|null, "currency": "EUR", "period": "miesiąc", "text": "co obejmuje i dla kogo", "sourceUrl": "https://...", "quote": "cytat", "official": true },
  "dorms": [ { "name": "...", "operator": "...", "url": "https://...", "roomType": "jednoosobowy|dwuosobowy|studio|...", "priceFrom": liczba|null, "priceTo": liczba|null, "currency": "EUR", "period": "miesiąc|semestr|rok", "includes": "...", "deposit": "..."|null, "eligibility": "...", "applicationInfo": "jak i do kiedy (z rokiem)", "applyUrl": "https://..."|null, "waitlist": "..."|null, "sourceUrl": "https://...", "quote": "cytat", "notes": "..."|null } ],
  "rent": [ { "type": "pokój w mieszkaniu współdzielonym|kawalerka (studio)|mieszkanie 1-pokojowe|mieszkanie 2-pokojowe", "area": "dzielnica lub miasto", "priceFrom": liczba|null, "priceTo": liczba|null, "currency": "EUR", "period": "miesiąc", "year": "2026", "includesUtilities": "tak|nie|nie wiadomo", "official": true|false, "source": "nazwa źródła", "sourceUrl": "https://...", "quote": "cytat", "notes": "..."|null } ],
  "gaps": [ "pełne zdania dla czytelnika o tym, czego nie udało się potwierdzić" ],
  "sources": [ { "url": "https://...", "note": "czego dotyczy" } ]
}
```
Walutę podawaj lokalną (CZK, HUF, SEK, DKK, RON, GBP) lub EUR. Jeśli miasto nie ma akademików dla studentów zagranicznych, zapisz to w `summary` i `gaps` (nie zostawiaj pustych sekcji bez wyjaśnienia). Niczego innego w projekcie nie zmieniaj. Pliki robocze w scratchpadzie `/private/tmp/claude-502/-Users-ada-GitHub/26143b21-06a7-4c88-83a0-03a307742ff0/scratchpad/<twój-podkatalog>/`. Ogranicz się do ok. 25 wywołań narzędzi na miasto.

## Odpowiedź końcowa (krótko)
Dla każdego miasta: liczba akademików i wierszy wynajmu, zakres cen, budżet miesięczny, które dane nieoficjalne, główne luki.

## Dodatek: miasta w Polsce
Dotyczy slugów: warszawa, krakow, wroclaw, poznan, trojmiasto (Gdańsk, Gdynia, Sopot), lodz, lublin, katowice, szczecin, bialystok, torun, rzeszow, olsztyn. Kraj: Polska, waluta PLN (ceny podawaj w złotych, `currency: "PLN"`). Slug i nazwa miasta według listy w `dev_docs/dane-robocze/build-koszty.js` (stała POLSKA).
- **Akademiki:** domy studenckie największych uczelni publicznych w mieście (np. uniwersytet, politechnika, uczelnia medyczna, ekonomiczna): cena za miejsce w pokoju 1-, 2-, 3-osobowym (miesięcznie, z mediami), kaucja, zasady przyznawania miejsc (kryteria socjalne i odległość od domu, pierwszeństwo studentów I roku), terminy składania wniosków (z rokiem), adres systemu rezerwacji, uwaga o liście rezerwowej. Zwykle dane są w zarządzeniu rektora o opłatach za domy studenckie na rok 2026/27 lub w cenniku domów studenckich. Ceny z poprzednich lat oznacz rokiem.
- **Wynajem:** oficjalne źródła to m.in. NBP (informacja o cenach mieszkań i stawkach najmu w największych miastach), urzędy miast, uczelnie (przewodniki dla studentów, Study in Poland / NAWA), samorządy studenckie. Gdy ich brak, wolno użyć opublikowanego raportu rynkowego dużego portalu najmu (np. Otodom, Morizon, Rentier, Gratka) z wyraźnym `official: false`, rokiem i linkiem. Podaj przykładowe ceny: pokój w mieszkaniu współdzielonym, kawalerka, mieszkanie 2-pokojowe, z informacją o opłatach (czynsz administracyjny, media).
- **Budżet miesięczny:** oficjalny szacunek (NAWA / Study in Poland, uczelnia, miasto) lub brak.
- Dla Trójmiasta opisz zbiorczo Gdańsk, Gdynię i Sopot (uczelnie: Uniwersytet Gdański, Politechnika Gdańska, Gdański Uniwersytet Medyczny, Akademia Morska, Uniwersytet Morski), z podaniem różnic cen między miastami, jeśli źródła je podają.
- Wszystkie pozostałe zasady z tego pliku obowiązują bez zmian.

## Runda poprawek (po przeglądzie jakości, 2026-10-03)
Dla miast za granicą są raporty krytyków: `dev_docs/dane-robocze/wyniki/krytyk-koszty1..6-2026-10-03.json` (filtruj po polu `city`). Napraw WSZYSTKIE krytyczne i ważne uwagi o swoich miastach i tanie drobne. Zapisz POPRAWIONY PEŁNY plik miasta jako `dev_docs/dane-robocze/wyniki/koszty-<slug>-2026-10-03b.json` (sufiks `b`; builder wybiera najnowszy plik miasta, więc musi zawierać komplet danych, a nie tylko zmiany). Zasady dodatkowe:
- Przed zapisem sprawdź ponownie źródła zakwestionowane przez krytyka (curl z User-Agent przeglądarki). Gdy krytyk ma rację i nie da się potwierdzić, usuń pozycję lub zostaw `null` z opisem w `gaps`.
- **Pole `budget.kind`**: `"szacunek"` (oficjalna kwota kosztów życia lub miesięcznego budżetu), `"wymog"` (formalny wymóg środków przy wizie lub rejestracji pobytu, nie szacunek wydatków), `"suma"` (suma pozycji z tabeli, którą policzyłeś sam, tylko gdy źródło wylicza pozycje, i opisz wyliczenie w `text`). Budżet będący sumą lub wymogiem NIE ma `official: true` w znaczeniu oficjalnego szacunku: ustaw `official` zgodnie z prawdą o źródle liczb i `kind` zgodnie z charakterem kwoty. Okres podawaj zgodnie ze źródłem (`rok` dla kwot rocznych).
- **Rok danych (`rent[].year`)**: wpisuj wyłącznie rok podany w źródle; gdy źródło go nie podaje, wpisz `null` (strona pokaże „brak daty na stronie źródła”). Nie wpisuj „2026” z daty pobrania. Ceny akademików z poprzedniego roku akademickiego oznacz rokiem w `notes` i `priceFrom/priceTo` zostaw tylko jeśli są potwierdzone jako obowiązujące.
- **Zakresy cen** nie mogą mieszkać jednostek (miejsce, pokój, całe studio, całe mieszkanie): rozdziel na osobne pozycje albo podaj w `notes`. Ceny „od” zapisuj jako `priceFrom` z `priceTo: null`.
- **Widełki regionalne** (np. Campus France „inne regiony”) opisz w tekście jako dotyczące regionu, nie miasta.
- Teksty: bez żargonu zbierania danych („błąd 403”, „zablokował dostęp”, „nie otwierał się”, „zebrano”, „odczytano”, „pole puste”, „w pliku”, „nie znaleźliśmy”), bez narracji w pierwszej osobie, bez antytez, bez długich myślników; jednoliterowe spójniki (w, z, i, o, a, u) są oddzielone od następnego słowa twardą spacją U+00A0; „euro” zapisuj jako „EUR”. Luki opisuj jako zdania dla czytelnika.
- Wiersze `official: false` tylko z linkiem do raportu i etykietą w `source`.
