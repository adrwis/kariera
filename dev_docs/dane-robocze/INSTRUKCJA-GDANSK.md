# Aktualizacja szkół średnich w Gdańsku do rekrutacji 2026/2027

Dziś jest 1.10.2026. Rekrutacja na rok szkolny 2026/2027 skończyła się w lipcu 2026. Twoje zadanie: dla każdej szkoły z pliku wejściowego ustalić ofertę klas na 2026/2027 i progi z rekrutacji 2026, a także (jeśli źródło podaje) progi z 2025.

## Zasady nadrzędne
- TYLKO oficjalne źródła: strona szkoły, jej regulamin/zarządzenie rekrutacyjne, BIP, strona miasta (edu.gdansk.pl, gdansk.pl), kuratorium (kuratorium.gda.pl), system nabor-pomorze.edu.com.pl, kopie tych stron w web.archive.org. ZERO serwisów wtórnych, prasy, forów, rankingów.
- NIGDY nie wymyślaj, nie zgaduj, nie uzupełniaj z pamięci. Czego nie zobaczyłeś w źródle, tego nie wpisuj. Każdy profil i każdy próg ma sourceUrl.
- Jeśli przypisanie liczby do klasy wymaga domysłu (np. grafika z samymi skrótami, które trzeba rozszyfrować), NIE wpisuj tej liczby; opisz ją w polu `doubts` szkoły.
- Kwalifikacje w technikach: zestaw kwalifikacji wynika z rozporządzenia MEN w sprawie podstaw programowych kształcenia w zawodach (tekst jednolity Dz.U. 2024 poz. 611; uwaga na zmiany Dz.U. 2026 poz. 404 obowiązujące od 1.09.2026, np. nowy zawód „technik architektury krajobrazu i arborystyki”). Dla rocznika rozpoczynającego naukę 1.09.2026 wpisz kwalifikacje obowiązujące ten rocznik. Podaj w `qualificationsSource` URL aktu (isap.sejm.gov.pl lub dziennikustaw.gov.pl). Nie zostawiaj pustych kwalifikacji, jeśli zawód jest znany.
- `scoredSubjects` (oceny ze świadectwa brane do punktacji) wpisuj tylko, jeśli źródło je wymienia. Szkoły przyjmujące po rozmowie: puste + opis w `admission`.
- Limit WebSearch jest wyczerpany: używaj WebFetch i curl. Nie wysyłaj formularzy ani maili. Nie zmieniaj niczego w /Users/ada/GitHub.

## Format rozszerzeń (WAŻNE, poprzedni format psuł filtry)
- `extended`: WYŁĄCZNIE kody z listy: mat, pol, ang, niem, fr, hisz, ros, wlo, bio, chem, fiz, inf, geo, hist, wos, hsz, fil, lac, hmuz (historia muzyki). Tylko przedmioty rozszerzone obowiązkowe dla całej klasy.
- `extendedChoice`: lista grup do wyboru, np. [["fiz","inf"]] gdy „fizyka albo informatyka”. Tylko kody.
- `bilingual`: kod języka, jeśli klasa dwujęzyczna (np. "ang"), inaczej null.
- `extendedOther`: przedmioty rozszerzone spoza matury jako tekst (np. "biznes i zarządzanie").

## Format wyjścia: tablica szkół
{ "rspo", "profiles": [ { "name", "schoolYear": "2026/2027", "extended": [], "extendedChoice": [], "bilingual": null, "extendedOther": [], "profession": null | "technik ...", "qualifications": [], "qualificationsSource": null|url, "languages": [kody], "scoredSubjects": [kody], "places": liczba|null, "thresholds": [ {"year": 2026, "min": liczba, "scale": 200, "kind": null | "wstępna kwalifikacja" | "zakwalifikowani", "sourceUrl"} ], "sourceUrl" } ],
  "admission": null | "opis dla szkół bez punktacji",
  "noOffer2026": true/false (true gdy nie znalazłeś oferty 2026/2027),
  "doubts": [ "opis rzeczy znalezionych, ale niepewnych" ],
  "checkedUrls": [ ... ] }
Pole rspo musi być identyczne z wejściem. Szkoły bez znalezionej oferty 2026/2027 też wpisz (profiles: [], noOffer2026: true).

Progi: `min` = liczba punktów ostatniej osoby przyjętej/zakwalifikowanej w danej klasie, skala 200. Jeśli źródło podaje progi dla oferty 2025 z tej samej strony, dodaj je z year 2025 tylko wtedy, gdy klasa ma tę samą nazwę i profil. `kind` zgodnie z tym, jak źródło je nazywa.

Zapisuj przyrostowo co kilka szkół. Na koniec krótko po polsku: ile szkół ma ofertę 2026/27, ile ma progi 2026, czego nie znalazłeś.
