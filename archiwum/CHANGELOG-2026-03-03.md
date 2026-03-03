# Changelog — 2026-03-03

## Podsumowanie

Rozpoczęcie sesji NextMove v2 — dwie pierwsze zmiany UX: rename tekstu providerów + redesign przycisku scroll-to-top. Pozostałe 4 zadania (workplace accordion, skill accordion, testy, audyt providerów) zaplanowane na kolejną sesję.

**Build:** ✅ `node scripts/build.js` — OK
**Pliki zmodyfikowane:** 6 | **Pliki nowe:** 0

---

## Zmiany

### 1. "Rekomendowani organizatorzy" → "Przykładowi organizatorzy"
**Problem:** Tekst "Rekomendowani" w popup szkoleniowym sugerował endorsement — użytkownik chciał neutralną etykietę.
**Rozwiązanie:** Zamiana na "Przykładowi organizatorzy" w `openTrainingPopup()`.
| Plik | Zmiana |
|------|--------|
| `js/app.js` | Linia 1205 — zmiana tekstu w `.training-popup__providers-title` |
| `js/app.min.js` | Rebuild — automatycznie |

### 2. Scroll-to-top — wyraźniejszy design
**Problem:** Przycisk scroll-to-top z glassmorphism stylem był mało widoczny.
**Rozwiązanie:** Solid `--kr-primary` tło, biały tekst/ikona, pill shape z labelem "Na górę" na desktop (≥768px), circle 48px na mobile (<768px), box-shadow dla głębi, hover → `--kr-primary-light`.
| Plik | Zmiana |
|------|--------|
| `index.html` | Dodanie `<span class="scroll-top__label">Na górę</span>` + klasa `.scroll-top__icon` na SVG |
| `css/style.css` | Nowy design `.scroll-top` — solid bg, pill shape, responsive label show/hide |
| `css/style.min.css` | Rebuild — automatycznie |

### 3. SW cache bump
| Plik | Zmiana |
|------|--------|
| `sw.js` | `nextmove-v2` → `nextmove-v3` |

---

## Zaplanowane na kolejną sesję

| # | Zadanie | Status |
|---|---------|--------|
| 3 | Workplace accordion z linkami do ofert pracy | ✅ Sesja 2 |
| 4 | Skill accordion z linkami do szkoleń | ✅ Sesja 2 |
| 5 | Build + testy Playwright | ✅ Sesja 2 |
| 6 | Audyt providerów (research + data) | osobna sesja |

---

## Sesja 2 — Accordion + 9 audytorów + fixy

### Podsumowanie

Implementacja kroków 3-5 planu v2 (workplace accordion, skill accordion, testy Playwright 28/28 PASS). Następnie 9 audytorów równoległych (SEO, WCAG, UX, Mobile, Theme, Links, PWA, Copy, Conversion). Fix 25 HIGH+ issues: heading tags, contrast, touch targets, accordion discoverability, body scroll lock, popup close 44px, aria-pressed, focus ring, dynamic SEO meta/canonical/OG, sitemap 90 URLs, noscript, 4th grid animation, copy fixes.

**Build:** ✅ | **Pliki zmodyfikowane:** 10 | **Pliki nowe:** 1

---

### 4. Workplace accordion — klikalne z linkami do ofert pracy
**Problem:** Workplace items były statyczne div-y bez interakcji.
**Rozwiązanie:** Accordion inline z chevronem, `buildJobSearchLinks()` generuje linki do pracuj.pl, indeed.pl + branżowe (justjoin.it/nofluffjobs dla IT, mp.pl/praca dla medycyny).
| Plik | Zmiana |
|------|--------|
| `js/app.js` | Nowa `buildJobSearchLinks()`, workplace div→button, accordion click handler |
| `css/style.css` | `.workplace-item-wrapper`, `.workplace-item--interactive`, `.workplace-links`, `.workplace-links__link` |

### 5. Skill accordion — klikalne z linkami do szkoleń
**Problem:** Skill list items były statyczne `<li>`.
**Rozwiązanie:** Każdy skill = `<button class="skill-btn">` z chevronem, accordion z linkami do Udemy/Coursera/Szkolenia.com + LinkedIn Learning (technical).
| Plik | Zmiana |
|------|--------|
| `js/app.js` | Nowa `buildSkillTrainingLinks()`, skill li→button+accordion, click handler |
| `css/style.css` | `.skill-btn`, `.skill-links`, `.skill-links__link` |

### 6. Testy Playwright (28/28 PASS)
| Plik | Zmiana |
|------|--------|
| `scripts/test-accordion.js` | **NOWY** — testy accordion expand/collapse, linki, keyboard, IT/medycyna branże, back/forward |

### 7. 9× audyt + fix 25 HIGH+ issues
**Audytorzy:** SEO, WCAG, UX, Mobile, Theme, Links, PWA, Copy, Conversion.

**Naprawione:**
| # | Fix | Pliki |
|---|-----|-------|
| 1 | Heading tag mismatch (10x `<h2>...</h3>`, `<h3>...</h4>`) | `app.js` |
| 2 | `--kr-secondary` #00897b→#00796b (contrast 4.2→5.2:1) | `style.css` |
| 3 | `--kr-demand-surplus` #ef6c00→#bf5b00 (contrast 3.1→4.6:1) | `style.css` |
| 4 | Dark mode `--kr-btn-bg` #7986cb→#5c6bc0 (contrast 3.3→5.1:1) | `style.css` |
| 5 | Focus ring `--kr-accent`→`--kr-focus-ring` (navy light, yellow dark) | `style.css` (13 instancji) |
| 6 | Touch targets 44px (skill-btn, links, cards, inputs) | `style.css` @media ≤900px |
| 7 | Accordion chevron → teal, 14px, opacity hover | `style.css`, `app.js` |
| 8 | Body scroll lock na popup open/close (3 popupy) | `app.js` |
| 9 | Popup close buttons 32→44px default | `style.css` |
| 10 | aria-pressed na category chips + sort buttons | `app.js` |
| 11 | Scroll-to-top tabindex=-1 when hidden | `app.js` |
| 12 | 4th grid column animation delay 320ms | `style.css` |
| 13 | Dynamic SEO: canonical, description, OG, Twitter per route | `app.js` |
| 14 | Sitemap: 1→90 URLs (home + 10 cat + 79 careers) | `sitemap.xml` |
| 15 | `<noscript>` fallback | `index.html` |
| 16 | "80+ zawodów"→"Blisko 80" / "79 zawodów" | `index.html`, `manifest.json`, `animations.js` |
| 17 | Accordion labels: "Oferty pracy", "Szukaj szkoleń" | `app.js` |
| 18 | Typing effect: usunięto patetyczne, dodano konkretne | `animations.js` |
| 19 | iOS zoom fix 601-900px (font-size 1rem) | `style.css` |
| 20 | SW cache v3→v4 | `sw.js` |

**Pozostało na następną sesję:**
- Data fixes: 22 broken relatedCareers, 6 empty URLs, barista grammar
- Hardcoded box-shadows → CSS vars (theme)
- Krok 6 planu v2: audyt providerów
