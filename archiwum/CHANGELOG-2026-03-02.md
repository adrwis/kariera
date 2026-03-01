# Changelog — 2026-03-02

## Podsumowanie

Sesja 6: Implementacja 4 z 9 punktów planu NextMove — szybkie fixy UI (centrowanie kafelków, kolor przycisku, topbar motto) + nowa funkcjonalność filtrów z unified filter panel (kategorie jako chipy, suwak zarobków, checkboxy zapotrzebowania, dropdown uczelni).

**Build:** nie dotyczy (vanilla HTML/CSS/JS)
**Pliki zmodyfikowane:** 4 | **Pliki nowe:** 1 (archiwum/)

---

## Zmiany

### 1. Centrowanie szerokich kafelków kategorii (plan pkt 1)
**Problem:** Kafelki IT/Technologia i Inżynieria (full-width) miały tekst wyrównany do lewej.
**Rozwiązanie:** `justify-content: center` na szerokich kafelkach.

| Plik | Zmiana |
|------|--------|
| `css/style.css` | `.category-tile:nth-child(1/6)` → `justify-content: center` |

### 2. Kolor przycisku "Sprawdź" (plan pkt 2)
**Problem:** Przycisk miał niebieski gradient (#1e88e5), za agresywny.
**Rozwiązanie:** Zmiana na fioletowy kolor kreski (--kr-primary/#3949ab light, #7986cb dark).

| Plik | Zmiana |
|------|--------|
| `css/style.css` | `--kr-btn-bg/hover/shadow` → fioletowy w obu trybach |

### 3. Topbar — motto zamiast logo (plan pkt 3)
**Problem:** Topbar miał ikonkę "N" + "NextMove" — do usunięcia.
**Rozwiązanie:** Zastąpiono zdaniem motywacyjnym "Znajdź swoją ścieżkę kariery z naszą pomocą" w Sora 400.

| Plik | Zmiana |
|------|--------|
| `index.html` | Usunięto `topbar__logo` + `topbar__icon`, dodano `topbar__motto` |
| `css/style.css` | Nowy `.topbar__motto`, usunięto style logo/icon |

### 4. Sekcja filtrów — unified panel (plan pkt 4)
**Problem:** Brak filtrowania po zarobkach, zapotrzebowaniu, uczelniach. Kategorie jako osobna sekcja.
**Rozwiązanie:** Unified glassmorphism panel "Przeglądaj i filtruj" z:
- Kategorie jako toggle-able chipy z ikonkami SVG (multi-select)
- Suwak zarobków (dual range 3k–35k PLN + number inputs)
- Checkboxy zapotrzebowania (deficytowy/zrównoważony/nadwyżkowy)
- Dropdown uczelni (searchable, 152 uczelnie z danych)
- Przycisk "Filtruj" → wyniki + "Resetuj filtry"
- Search form zwężony (max-width: 480px)

| Plik | Zmiana |
|------|--------|
| `index.html` | Nowy `.filters-panel` z chipami kategorii, suwakiem, checkboxami, dropdownem |
| `css/style.css` | Style: `.filters-panel`, `.filters__cat-chip`, `.filters__divider`, kontrolki |
| `js/search.js` | Nowe: `filterCareers({categories, salaryMin, salaryMax, demands, schools})`, `getAllSchools()` |
| `js/app.js` | Obsługa filtrów: sync suwaków, autocomplete uczelni, toggle chipów, router `filter=1` |

### 5. Redesign prawego panelu
**Problem:** Kategorie jako osobny bento grid + filtry poniżej — za dużo scrollowania.
**Rozwiązanie:** Połączenie w jeden panel z eleganckim gradient dividerem.

| Plik | Zmiana |
|------|--------|
| `css/style.css` | Usunięto `.categories__grid`, `.category-tile` styles; dodano `.filters-panel` glass card |
