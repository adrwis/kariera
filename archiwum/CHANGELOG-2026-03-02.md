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

---

## Sesja 2

### Podsumowanie

Landing page no-scroll fix (szerszy search box, kompaktowe filtry) + implementacja pkt 5 planu — znane osoby z kartami, inicjałami jako avatary i popup z biografią.

**Pliki zmodyfikowane:** 3 | **Pliki nowe:** 0

---

### 1. Landing page — szerszy search box + kompaktowe filtry (plan pkt dodatkowy)
**Problem:** Search box ograniczony do 480px, filtry zajmowały dużo miejsca pionowego.
**Rozwiązanie:** Usunięto max-width z search-box, skompaktowano cały panel filtrów (mniejsze paddingi, fonty, gapy). Grid right column 370→330px.

| Plik | Zmiana |
|------|--------|
| `css/style.css` | `.search-box` max-width usunięty; `.filters-panel` padding 1.25→0.85rem; `.filters__cat-chip` font 0.75→0.7rem; `.filters__group` margin 1→0.55rem; `.filters__label` 0.82→0.75rem; `.filters__checks` gap 0.4→0.15rem; `.filters__btn` font 0.88→0.82rem; grid column 370→330px |

### 2. Znane osoby — karty z inicjałami + popup z biografią (plan pkt 5)
**Problem:** Znane osoby renderowane jako prosta lista `<li>` bez interakcji.
**Rozwiązanie:** Nowe klikalne karty z avatarem (inicjały w gradient circle), chevron, oraz modal popup z biografią (blur backdrop, slide-up animacja, close na ×/Escape/overlay click, focus management, aria-modal).

| Plik | Zmiana |
|------|--------|
| `css/style.css` | Nowe: `.famous-card` (avatar + chevron + hover), `.person-popup-overlay` (blur bg), `.person-popup` (dialog, slide-up anim), `.person-popup__close/header/avatar/name/bio` |
| `js/app.js` | Nowe: `getInitials()`, `openPersonPopup()`, `closePersonPopup()`, `currentCareerData` state, delegowany click na `.famous-card`, render kart w `renderRichDetail()` |
| `data/careers.json` | Dodano `bio` do wszystkich 130 znanych osób (2-3 zdania PL, daty życia, osiągnięcia) |

---

## Sesja 3

### Podsumowanie

Implementacja pkt 6-9 planu sesji 6: popup uczelni (tryby stacj./niestacj., progi, wymagania maturalne, płatność), popup szkoleń (opis, cena, wymagania, providerzy z linkami), kolumna "Gdzie pracować" (4-6 miejsc pracy per zawód, layout 2×2), podział umiejętności na miękkie vs techniczne. Dodatkowo: link źródłowy (Wikipedia) w popupie znanych osób.

**Build:** nie dotyczy (vanilla HTML/CSS/JS)
**Pliki zmodyfikowane:** 3 | **Pliki nowe:** 0

---

### 1. Popup uczelni — klikalne karty + tryby studiów (plan pkt 6)
**Problem:** Uczelnie renderowane jako prosta lista `<li>` z linkiem. Brak szczegółów rekrutacyjnych.
**Rozwiązanie:** Klikalne karty `.school-card` z ikonką budynku SVG. Popup `.school-popup` z: linkiem do strony uczelni, osobnymi sekcjami dla stacjonarnych (badge "bezpłatne") i niestacjonarnych (badge "płatne · X PLN/semestr"), tabelą progów punktowych 2023-2025, listą wymagań maturalnych.

| Plik | Zmiana |
|------|--------|
| `css/style.css` | Nowe: `.school-card` + `__icon/__info/__name/__city/__chevron`, `.school-popup` + `__close/__header/__icon/__name/__city/__link/__section/__section-title/__thresholds/__requirements/__badge--free/__badge--paid` |
| `js/app.js` | Renderowanie uczelni zmienione z `<li>` na `<button class="school-card">`, nowe: `openSchoolPopup()`/`closeSchoolPopup()`, obsługa `modes[]` (stacj./niestacj.) z fallback na stary format |
| `data/careers.json` | 213 szkół: `thresholds` → `modes[]` ({type, paid, tuition, thresholds[]}), uczelnie prywatne (SWPS, ALK, itp.) oba tryby paid. Niestacjonarne progi ~15-25 pkt niższe |

### 2. Link źródłowy w popupie znanych osób (rozszerzenie pkt 5)
**Problem:** Popup biografii nie miał linka do źródła informacji.
**Rozwiązanie:** Przycisk "Źródło" z linkiem do polskiej Wikipedii (lub Google Search jako fallback dla 18 obscure osób).

| Plik | Zmiana |
|------|--------|
| `css/style.css` | Nowy: `.person-popup__source` (przycisk-link, hover: primary bg) |
| `js/app.js` | Renderowanie `sourceUrl` w popupie jako link z ikonką SVG |
| `data/careers.json` | `sourceUrl` dodane do 130 znanych osób (112 pl.wikipedia, 18 Google fallback) |

### 3. Popup szkoleń — karty + szczegóły (plan pkt 7)
**Problem:** Szkolenia renderowane jako prosta lista z providerami jako tekst.
**Rozwiązanie:** Klikalne karty `.training-card` z ikonką książki (teal gradient). Popup `.training-popup` z: opisem szkolenia, siatką cena+wymagania, listą rekomendowanych organizatorów z linkami.

| Plik | Zmiana |
|------|--------|
| `css/style.css` | Nowe: `.training-card` + `__icon/__info/__name/__meta/__chevron`, `.training-popup` + `__close/__header/__icon/__name/__desc/__meta-grid/__meta-item/__meta-label/__meta-value/__providers-title/__providers/__provider/__provider-name/__provider-link` |
| `js/app.js` | Renderowanie szkoleń jako karty, nowe: `openTrainingPopup()`/`closeTrainingPopup()`, obsługa providerów jako obiektów z URL |
| `data/careers.json` | 77 szkoleń: dodano `description`, `requirements`, `price`; `providers` ze string[] → {name, url}[] |

### 4. Kolumna "Gdzie pracować" (plan pkt 8)
**Problem:** Brak informacji o miejscach pracy na stronie detalu zawodu.
**Rozwiązanie:** Nowa 4. kolumna w layoucie detalu zawodu. Grid zmieniony z 3-kolumnowego na 2×2. Każde miejsce pracy z ikonką walizki, nazwą i krótkim opisem.

| Plik | Zmiana |
|------|--------|
| `css/style.css` | Grid `.career-columns` zmieniony z `repeat(3, 1fr)` na `repeat(2, 1fr)`. Tablet breakpoint uproszczony do 1-kolumnowego. Nowe: `.workplace-list`, `.workplace-item` + `__icon/__info/__name/__desc` |
| `js/app.js` | Nowa sekcja renderowania `workplacesHtml`, 4. kolumna "Gdzie pracować" w HTML |
| `data/careers.json` | `workplaces[]` dodane do 79 karier (4-6 miejsc pracy z name+description) |

### 5. Podział umiejętności miękkie vs techniczne (plan pkt 9)
**Problem:** Umiejętności w jednej liście `skills.required` bez rozróżnienia typów.
**Rozwiązanie:** Podział na `skills.soft` (💬) i `skills.technical` (⚙️) z osobnymi sekcjami i ikonkami emoji.

| Plik | Zmiana |
|------|--------|
| `css/style.css` | Nowe: `.career-column__item--soft::before` (💬), `.career-column__item--tech::before` (⚙️) z padding-left i position absolute |
| `js/app.js` | Osobne renderowanie `c.skills.soft` i `c.skills.technical` z fallback na `c.skills.required` |
| `data/careers.json` | `skills.required` → `skills.soft` + `skills.technical` w 79 karierach (137 soft + 336 technical = 473 total) |
