# Aktualizacja danych uczelni do rekrutacji 2026/2027

Dziś jest 1.10.2026. Plik wejściowy: szkoły {name, city, url, entries[]}, entry = {career, program, requirements[], requirementsYear, requirementsSource, modes[{type, paid, tuition, thresholds[{year, points, scaleMax|scaleFormula, sourceUrl}]}]}. Te dane zostały zweryfikowane z oficjalnymi źródłami dla lat 2023 do 2025 i rekrutacji 2025/26. Twoje zadanie to AKTUALIZACJA i POPRAWKI, nie weryfikacja od zera.

## Zadania dla każdego entry
1. Próg 2026 (rekrutacja na 2026/2027) dla tego samego kierunku i trybu: wynik ostatniej osoby przyjętej, z tego samego typu źródła co poprzednie lata. Dodaj jako {year: 2026, points, scaleMax lub scaleFormula (jak w poprzednich latach), sourceUrl, round: opis tury/cyklu}.
2. Sprawdź, czy istniejące progi 2023 do 2025 pochodzą z WIERSZA WŁAŚCIWEGO KIERUNKU (znane błędy do poprawienia: urbanista „PW — Wydział Architektury” ma progi Gospodarki przestrzennej z WGiK; devops „Politechnika Wrocławska — WIT” ma progi Informatyki stosowanej zamiast Informatyki technicznej; nauczyciel „UG — Wydział Nauk Społecznych” PPiW ma progi „Pedagogiki I st.”; programista-gier AGH 2025 876 to próg kierunku TPWiG; uszkodzony sourceUrl w data-scientist PW MiNI 2023). Otwórz sourceUrl i sprawdź wiersz. Jeśli błąd: podaj poprawione wartości ze źródła.
3. Konwencja tur: zapisz dla każdego progu, z której tury/cyklu pochodzi (`round`). Preferuj „I tura / cykl 1” tam, gdzie uczelnia publikuje kilka; jeśli uczelnia publikuje tylko „realny próg” lub jedną wartość, zapisz to.
4. Wymagania: jeśli requirementsYear to 2025/2026, sprawdź zasady na 2026/2027 (uchwała rekrutacyjna Senatu). Jeśli się zmieniły, podaj nowe (display[], structured [{anyOf:[kody], level:"R"|"P"|"P lub R"}], exam, sourceUrl, academicYear). Jeśli bez zmian, status "unchanged" + sourceUrl na 2026/27.
5. Czesne: jeśli jest nowsza stawka na 2026/2027, podaj ją (display w formacie „14100 PLN/rok”, bez spacji w liczbie; sourceUrl). Jeśli kwota dotyczy tylko I roku, zaznacz w `tuitionNote`.

## Zasady
- TYLKO oficjalne źródła uczelni (strona, BIP, uchwały, zarządzenia, komunikaty rekrutacyjne) i ich kopie w web.archive.org. Zero serwisów wtórnych.
- NIGDY nie wymyślaj. Jeśli progu 2026 nie ma: status "not_published".
- Limit WebSearch wyczerpany: WebFetch i curl, zaczynaj od sourceUrl z danych (często ta sama strona ma już rok 2026). Nie zmieniaj niczego w /Users/ada/GitHub, nie wysyłaj formularzy.

## Wyjście: tablica, jeden rekord na entry
{ school, career, program (poprawiony, jeśli trzeba), thresholdsFix: [ {year, points, scaleMax|scaleFormula, sourceUrl, round} ] (pełna poprawna lista 2023 do 2026 dla tego trybu, osobno per type): { "stacjonarne": [...], "niestacjonarne": [...] }, threshold2026Status: "added"|"not_published"|"not_applicable", rowFix: null | "opis poprawki wiersza", requirements: {status: "unchanged"|"updated"|"not_found", ...}, tuition: [{type, status: "unchanged"|"updated"|"not_found", display, amount, period, academicYear, sourceUrl, tuitionNote}], notes }
Pola school i career identyczne z wejściem. Zapisuj przyrostowo. Na koniec po polsku: ile progów 2026 dodanych, ile wierszy poprawionych, czego nie znaleziono.
