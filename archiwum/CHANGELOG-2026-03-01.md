# Changelog — 2026-03-01

## Podsumowanie

Kompletny redesign landing page NextMove (dawniej Kariera Explorer): nowy layout asymetryczny z glassmorphism, rebrand na "NextMove", stonowany monochromatyczny styl, SVG ikony konturowe zamiast kolorowych emoji.

**Build:** statyczny HTML/CSS/JS — brak builda
**Pliki zmodyfikowane:** 2 | **Pliki nowe:** 1 (archiwum)

---

## Zmiany

### 1. Rebrand: Kariera Explorer → NextMove
**Problem:** Nazwa "Kariera Explorer" nie brzmiała dobrze, potrzebna lepsza.
**Rozwiązanie:** Zmiana na "NextMove" z podtytułem "A jaki będzie Twój następny ruch?"
| Plik | Zmiana |
|------|--------|
| `index.html` | Title, OG, topbar (ikona K→N), hero, footer — wszystko na "NextMove" |
| `css/style.css` | `.landing__subtitle` — nowy styl podtytułu |

### 2. Asymetryczny layout split (no-scroll)
**Problem:** Landing page wymagał scrollowania, kategorie były pod search boxem.
**Rozwiązanie:** Grid `1fr 370px` — hero+search po lewej, kategorie po prawej. Flex chain eliminuje scroll.
| Plik | Zmiana |
|------|--------|
| `index.html` | `landing__split > landing__left + landing__right` wrapper |
| `css/style.css` | Split grid, flex chain (`view→flex:1, landing→flex:1`), sticky categories |

### 3. Glassmorphism + premium topbar
**Problem:** Prosty topbar bez charakteru.
**Rozwiązanie:** Glassmorphism (`backdrop-filter: blur(20px)`), gradient accent line, logo glow, badge "2500+ zawodów".
| Plik | Zmiana |
|------|--------|
| `index.html` | `topbar__right` wrapper, `topbar__stat` badge |
| `css/style.css` | Glass bg, accent line, circular theme toggle, stat badge |

### 4. Bento grid kategorii z SVG ikonami
**Problem:** Kolorowe emoji (💻🏥⚖️) nie pasowały do premium estetyki.
**Rozwiązanie:** 10 monochromatycznych SVG ikon konturowych (`stroke="currentColor"`, `stroke-width="1.5"`). Bento grid z featured tiles spanning full width.
| Plik | Zmiana |
|------|--------|
| `index.html` | 10 inline SVG ikon (code, pulse, courthouse, graduation, trend, wrench, pen, leaf, bag, shield) |
| `css/style.css` | `.category-tile__icon` → flex container, 28×28px, `color: var(--kr-text-muted)`, hover → primary |

### 5. Stonowany tytuł (luxury brand feel)
**Problem:** "Move" miał vivid teal-to-gold gradient — za kolorowy.
**Rozwiązanie:** Monochromatyczny gradient navy→indigo. "Next" w kolorze tekstu, "Move" w subtelnym primary gradient.
| Plik | Zmiana |
|------|--------|
| `css/style.css` | `.landing__title-static` → `var(--kr-text)`, `.landing__title-accent` → gradient `var(--kr-primary)` → `var(--kr-primary-light)` |
| `css/style.css` | Hero accent bar, topbar line, tile hover bar — wszystko monochromatyczne navy |

### 6. Animacje i efekty
**Problem:** Brak animacji entrance.
**Rozwiązanie:** Staggered reveal na tile'ach, shimmer button, ambient glow, typing effect.
| Plik | Zmiana |
|------|--------|
| `css/style.css` | `@keyframes tileReveal`, `animation-delay` nth-child, button shimmer `::before`, ambient glow `::before` |

---

## Sesja 2 — Faza 4 (search+wyniki) + Faza 5 (detal zawodu)

### Podsumowanie

Implementacja wyników wyszukiwania (Faza 4) i pełny upgrade widoku detalu zawodu (Faza 5): category badge, aliases, training providers, enhanced fallback, animacje wejścia, tablet layout.

**Build:** statyczny HTML/CSS/JS — brak builda
**Pliki zmodyfikowane:** 3 | **Pliki nowe:** 0

---

### 1. Faza 4 — Results view (index.html)
**Problem:** Widok wyników nie miał inline search, sort toolbar ani empty state.
**Rozwiązanie:** Dodano resultsCount, resultsSearchForm, resultsToolbar (sort buttons), rozbudowany empty state z kategoriami.
| Plik | Zmiana |
|------|--------|
| `index.html` | Inline search form, sort toolbar (trafność/nazwa/zarobki), empty state z SVG ikoną i sugestiami kategorii |

### 2. Inline styles → CSS classes (Faza 5, krok 1)
**Problem:** ~10 inline `style=""` w `renderRichDetail()` utrudniały maintenance.
**Rozwiązanie:** Nowe klasy CSS: `.career-column__subtitle`, `__subtitle--spaced`, `__text`, `__annotation`, `__empty`, `__providers`.
| Plik | Zmiana |
|------|--------|
| `js/app.js` | Zamiana inline styles na klasy CSS |
| `css/style.css` | 6 nowych klas w sekcji career-column |

### 3. Category badge w hero (krok 2)
**Problem:** Brak informacji o kategorii w widoku detalu.
**Rozwiązanie:** Pill badge `.career-hero__category` z linkiem do `#/wyniki?cat=...`, gradient hover.
| Plik | Zmiana |
|------|--------|
| `js/app.js` | Category badge w renderRichDetail + renderFallbackDetail |
| `css/style.css` | `.career-hero__category` — pill badge z transition |

### 4. Related careers — pełne nazwy (krok 3)
**Problem:** Related careers wyświetlały slugi (`analityk-danych` zamiast "Analityk danych").
**Rozwiązanie:** Lookup `CareerSearch.getCareerById()` → pełna nazwa. Fallback: capitalize slug.
| Plik | Zmiana |
|------|--------|
| `js/app.js` | `relatedCareers.map()` z lookup zamiast `id.replace(/-/g, ' ')` |

### 5. Training providers (krok 4)
**Problem:** `training[].providers` ignorowane — tylko nazwa szkolenia.
**Rozwiązanie:** `<span class="career-column__providers">` pod nazwą szkolenia (italic, muted).
| Plik | Zmiana |
|------|--------|
| `js/app.js` | Providers rendering w skills column |
| `css/style.css` | `.career-column__providers` — italic, muted, smaller |

### 6. Enhanced fallback KZiS-only (krok 5)
**Problem:** Minimalna wersja fallback — tylko tekst + 1 link.
**Rozwiązanie:** SVG ikona dokumentu, heading "Profil w przygotowaniu", 2 linki (INFOdoradca+, Barometr Zawodów), sugestie z tej samej kategorii (do 5 rich profili).
| Plik | Zmiana |
|------|--------|
| `js/app.js` | Nowy `renderFallbackDetail()` z category badge, SVG, 2 linkami, sugestiami |
| `css/style.css` | Fallback redesign: `__icon`, `__heading`, `__links`, `__link--secondary`, `__suggestions` |

### 7. Animacje wejścia sekcji (krok 6)
**Problem:** Brak animacji entrance w widoku detalu.
**Rozwiązanie:** `@keyframes detailReveal` (opacity + translateY), staggered delays: hero 0ms → kolumny 80/160/240ms → related 320ms → sources 380ms.
| Plik | Zmiana |
|------|--------|
| `css/style.css` | `detailReveal` keyframes, `--detail` modifiers z animation-delay |

### 8. Tablet 2-column layout (krok 7)
**Problem:** 3 kolumny za ciasne na tablecie.
**Rozwiązanie:** `@media (600-900px)` — `.career-columns: repeat(2, 1fr)`, 3. kolumna full width.
| Plik | Zmiana |
|------|--------|
| `css/style.css` | Nowy breakpoint tablet z 2-col grid |

### 9. Quick wins (krok 8)
**Problem:** Brak aliases, demand tooltip, salary label.
**Rozwiązanie:** Aliases w hero ("Znany też jako: ..."), demand `title` tooltip, salary "brutto/mies.".
| Plik | Zmiana |
|------|--------|
| `js/app.js` | `DEMAND_LABELS` map, `aliasesHtml`, salary label, demand title attr |
| `css/style.css` | `.career-hero__aliases` — italic, muted |
