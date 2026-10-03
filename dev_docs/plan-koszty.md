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
