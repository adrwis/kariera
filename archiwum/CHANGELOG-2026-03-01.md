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
