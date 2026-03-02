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

### 6. ✅ Uczelnie — popup ze szczegółami
- Klikalne karty `.school-card` z ikonką budynku SVG
- Popup z: stroną uczelni, tryby stacj./niestacj. (badge płatne/bezpłatne + czesne), progi punktowe 2023-2025, wymagania maturalne
- 213 szkół z danymi modes[], requirements[]
- Bonus: link źródłowy (Wikipedia) w popupie znanych osób (130 sourceUrl)
- Sesja 2026-03-02: `.school-card` + `.school-popup` + modes + sourceUrl

### 7. ✅ Szkolenia — popup z rekomendacjami
- Klikalne karty `.training-card` z ikonką książki (teal gradient)
- Popup z: opisem, ceną, wymaganiami, listą rekomendowanych organizatorów z linkami
- 77 szkoleń z description, price, requirements; providers jako obiekty {name, url}
- Sesja 2026-03-02: `.training-card` + `.training-popup`

### 8. ✅ NOWA kolumna: "Gdzie można pracować"
- 4. kolumna w layoucie detalu (grid 2×2 zamiast 3-kolumn)
- Każde miejsce pracy z ikonką walizki, nazwą i opisem
- 79 karier × 4-6 workplaces (name + description)
- Sesja 2026-03-02: `.workplace-item` + grid `repeat(2, 1fr)`

### 9. ✅ Podział umiejętności
- `skills.required` → `skills.soft` (💬) + `skills.technical` (⚙️)
- Osobne sekcje z emoji ikonkami
- 79 karier: 137 soft + 336 technical = 473 total
- Sesja 2026-03-02: fallback na `required` dla starego formatu

---

## Status: 9/9 DONE — ALL COMPLETE
