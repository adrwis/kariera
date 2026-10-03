# Instrukcja zbierania danych o studiach w stolicy (dla agentów)

Projekt: /Users/ada/GitHub/inne/kariera (strona NextMove). Najpierw przeczytaj `dev_docs/plan-zagranica.md` (cel, zasady, schemat), a jako wzór jakości obejrzyj gotowy wynik `dev_docs/dane-robocze/wyniki/zagranica-wieden-2026-10-03.json`. Dziś 2026-10-03.

## Co zebrać

- Uczelnie: 3 do 4 największych publicznych uczelni w aglomeracji stolicy (uniwersytet, politechnika, uczelnia ekonomiczna lub medyczna, ewentualnie uczelnia zawodowa).
- Kierunki (tylko jeśli uczelnia je ma, nie wymyślaj): psychologia (careerIds: psycholog), informatyka (programista, analityk-danych), data science (analityk-danych), medycyna (lekarz), architektura (architekt), prawo (prawnik), ekonomia lub zarządzanie (ekonomista), budownictwo (inzynier-budownictwa), mechanika (inzynier-mechanik), dziennikarstwo lub komunikacja (dziennikarz). Około 10 do 18 programów, najlepiej po angielsku, poziom licencjat lub jednolite.
- Dla każdego programu: oryginalna i angielska nazwa, poziom, czas trwania, języki wykładowe, rok akademicki naboru, czesne dla obywateli UE i spoza UE (osobno opłaty obowiązkowe), zasady przyjęcia osób z polską maturą (uznanie świadectwa, wymagane przedmioty i poziomy, egzaminy wstępne, limity miejsc), wymagany dowód znajomości języka, termin składania wniosków, link do składania wniosku i do strony programu.
- Przy każdej liczbie, terminie i warunku zapisz `sourceUrl` i krótki opis lub cytat, skąd to wzięto. Brak oficjalnego potwierdzenia: wpisz `null` i opis w uwagach. NIE zgaduj.

## Zasady (twarde)

- Tylko oficjalne źródła: strony uczelni, krajowe portale rekrutacyjne i informacyjne, ministerstwa, oficjalne portale rządowe. Agregatory, rankingi, blogi i fora NIE.
- Nie obchodź zabezpieczeń (CAPTCHA, ekrany ochrony, 403, logowanie). Strona zablokowana: zapisz w `luki`.
- Strony czytane przez WebFetch są streszczane, więc liczby ważne (opłaty, terminy, progi) potwierdzaj drugim źródłem lub pobierz stronę przez curl i przeczytaj dosłownie (pdftotext dla PDF-ów). Tam, gdzie nie udało się potwierdzić dosłownie, napisz to w uwagach po ludzku (np. „do potwierdzenia na stronie uczelni”), BEZ wzmianek o narzędziach.
- Nic nie zmieniaj w projekcie poza plikiem wyniku, niczego nie wysyłaj. Pliki robocze w scratchpadzie `/private/tmp/claude-502/-Users-ada-GitHub/26143b21-06a7-4c88-83a0-03a307742ff0/scratchpad/<miasto>/` (scratchpad jest współdzielony, używaj własnego podkatalogu).
- WebSearch używaj oszczędnie (kilka zapytań). Ogranicz się do ok. 60 wywołań narzędzi.
- Pisz po polsku (nazwy programów oryginalne), bez długich myślników i antytez „to X, nie Y”, zakresy liczb przez „do”, kwoty z twardą spacją.

## Format wyniku

JSON jak we wzorze: `city`, `country`, `retrieved`, `overview` (obiekt z polami `polishMatura`, `tuition`, `generalDeadlines`, `englishProof` lub podobnymi, każde jedno do czterech zdań po polsku), `universities[].programs[]` z polami `name`, `nameEn`, `careerIds`, `level`, `durationYears`, `languages`, `academicYear`, `tuition{eu, nonEu, sourceUrl}`, `admission{polishMatura, requirements, languageProof, selective, sourceUrl}`, `deadline`, `applyUrl`, `sourceUrl`, `notes`, oraz `luki[]` (lista rzeczy niepotwierdzonych, pisana dla człowieka). Plik: `dev_docs/dane-robocze/wyniki/zagranica-<slug>-2026-10-03.json`.

W odpowiedzi podaj krótko: uczelnie i liczbę programów, jak kraj traktuje polską maturę, czesne dla UE, główne luki.
