# NextMove — Plan sesja 6 (2026-03-01)

## Punkty do implementacji

### 1. ✅ Centrowanie nazw szerokich kafelków kategorii
- Kafelki IT/Technologia i Inżynieria (full-width) — tekst wyśrodkowany
- Sesja 2026-03-02: `justify-content: center`

### 2. ✅ Kolor przycisku "Sprawdź"
- Przycisk w kolorze fioletowej kreski (--kr-primary)
- Sesja 2026-03-02: #3949ab (light) / #7986cb (dark)

### 3. ✅ Topbar — usunięcie logo i nazwy
- Usunięto ikonkę "N" i napis "NextMove"
- Dodano motto "Znajdź swoją ścieżkę kariery z naszą pomocą" (Sora 400)

### 4. ✅ Sekcja filtrów (NOWA FUNKCJONALNOŚĆ)
- Unified panel "Przeglądaj i filtruj" z glassmorphism
- Kategorie jako toggle-able chipy z ikonkami (multi-select)
- Suwak zarobków (dual range 3k–35k PLN)
- Checkboxy zapotrzebowania (deficytowy/zrównoważony/nadwyżkowy)
- Dropdown uczelni (searchable, 152 uczelnie)
- Przycisk "Filtruj" → strona z listą zawodów, sortowalna
- Search form zwężony (max-width: 480px)

### 5. ✅ Znane osoby — zdjęcia + popup z biografią
- Klikalne karty z inicjałami jako avatar (gradient circle)
- Popup modal z biografią (blur backdrop, slide-up, Escape/click-outside close)
- Bio dodane do 130 osób w careers.json
- Sesja 2026-03-02: `.famous-card` + `.person-popup` + 130 bios

### 6. Uczelnie — popup ze szczegółami
- Kliknięcie w uczelnię → popup z:
  - Stroną internetową uczelni
  - Progi punktowe z ostatnich 2-3 lat
  - Co trzeba zrobić żeby się dostać (przedmioty na maturze itp.)

### 7. Szkolenia — popup z rekomendacjami
- Kliknięcie w szkolenie → popup z:
  - Starannie wyselekcjonowane szkolenia (jakość prowadzących, opinie)
  - Opis szkolenia
  - Wymagania
  - Cena

### 8. NOWA kolumna: "Gdzie można pracować"
- Na podstronie zawodu dodać kolumnę z miejscami pracy
- Np. psycholog → HR, konsultacje psychologiczne, psycholog sądowy
- Odnośniki do tych obszarów po więcej szczegółów

### 9. Podział umiejętności
- Oddzielić umiejętności miękkie od technicznych/certyfikowanych
- Osobne sekcje w kolumnie umiejętności

---

## Status: 5/9 DONE — next: pkt 6 (uczelnie — popup ze szczegółami)
