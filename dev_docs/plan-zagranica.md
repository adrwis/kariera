# Studia w europejskich stolicach: plan i pilotaż

Stan na 2026-10-03. Plan do zatwierdzenia przez Adę po pilotażu. Nic z tego nie jest jeszcze na stronie.

## Cel

Pokazać uczniowi i rodzicowi, gdzie za granicą można studiować kierunki odpowiadające zawodom ze strony, i co to wymaga od osoby z polską maturą: język wykładowy, czesne dla obywateli UE, warunki przyjęcia, terminy, link do oficjalnej strony programu.

## Zasady (te same co dla reszty strony)

- Tylko oficjalne źródła z adresem URL: strony uczelni, krajowe portale rekrutacyjne i informacyjne (np. DAAD, studyinaustria, studyindenmark, Study in Czechia), rozporządzenia i oficjalne tabele opłat.
- Niepewne pomijamy, niczego nie zgadujemy, nie obchodzimy zabezpieczeń.
- Czesne i terminy mają rok akademicki i datę pobrania. Dane inne niż oficjalne (rankingi, blogi) nie wchodzą.
- Pisanie po polsku, bez długich myślników i antytez, zakresy przez „do”, kwoty z twardą spacją.

## Pilotaż: cztery stolice, bo różnią się systemem

| Stolica | Dlaczego |
|---|---|
| Berlin | Niemcy: brak czesnego, ale opłata semestralna, rekrutacja częściowo przez uni-assist, wymagany język niemiecki lub angielski |
| Praga | Czechy: studia po czesku bezpłatne, po angielsku płatne, osobne egzaminy wstępne |
| Wiedeń | Austria: niskie opłaty dla obywateli UE, ograniczenia przyjęć na niektórych kierunkach (np. medycyna), rejestracja do przyjęcia |
| Kopenhaga | Dania: bezpłatne dla obywateli UE, rekrutacja przez krajowy system, wysokie wymagania z języka angielskiego |

## Zakres pilotażu

- Uczelnie: 3 do 4 największych publicznych uczelni w każdej stolicy (uniwersytet, politechnika, uczelnia ekonomiczna lub medyczna).
- Kierunki: te odpowiadające 11 zawodom ze strony: psycholog, programista, analityk danych, lekarz, architekt, prawnik, ekonomista, inżynier budownictwa, inżynier mechanik, dziennikarz oraz (jeśli uczelnia ma) informatyka stosowana.
- Poziom: studia I stopnia i jednolite magisterskie. II stopień tylko tam, gdzie jest jedyną drogą do zawodu.
- Rok: najbliższy nabór, na który uczelnia już podała warunki (zwykle rok akademicki 2027/28, a jeśli nie ma, 2026/27 z adnotacją).

## Schemat danych (jeden plik na miasto: `data/zagranica/<miasto>.json`)

```
{
  "city": "Berlin", "country": "Niemcy", "retrieved": "2026-10-03",
  "universities": [{
    "name": "...", "url": "...", "type": "uniwersytet|politechnika|ekonomiczna|medyczna",
    "programs": [{
      "name": "oryginalna nazwa", "nameEn": "...", "careerIds": ["psycholog"],
      "level": "licencjat|magister|jednolite", "durationYears": 3,
      "languages": ["niemiecki"], "academicYear": "2027/28",
      "tuition": { "eu": "0 zł, opłata semestralna 330 EUR", "nonEu": "...", "sourceUrl": "..." },
      "admission": {
        "polishMatura": "uznawana | uznawana z warunkami | wymaga dodatkowego etapu",
        "requirements": "krótko: przedmioty, wynik, egzamin",
        "languageProof": "np. TestDaF 4x4, IELTS 6,5",
        "selective": true,
        "sourceUrl": "..."
      },
      "deadline": "...", "applyUrl": "...", "sourceUrl": "..."
    }]
  }]
}
```

## Pokazanie na stronie (do decyzji Ady)

1. Widok `/zagranica` z wyborem stolicy i kierunku.
2. Sekcja „Studia w europejskich stolicach” na profilu zawodu, obok uczelni polskich.
3. Przy każdej liczbie rok akademicki, data pobrania i link do źródła.

## Pytania do Ady po pilotażu

- Czy zostajemy przy stolicach UE, czy dodajemy też Londyn, Oslo, Zurych i inne stolice spoza UE (inne zasady czesnego)?
- Ile miast i uczelni (cała Europa to ok. 45 stolic i kilkaset programów)?
- Czy pokazujemy kierunki w językach lokalnych, czy tylko w angielskim?
- Czy dodajemy koszty życia i akademiki (osobne źródła, szybko się starzeją)?
