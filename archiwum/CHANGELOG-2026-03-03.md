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

| # | Zadanie | Szacunek |
|---|---------|----------|
| 3 | Workplace accordion z linkami do ofert pracy | ~30 min |
| 4 | Skill accordion z linkami do szkoleń | ~25 min |
| 5 | Build + testy Playwright | ~15 min |
| 6 | Audyt providerów (research + data) | osobna sesja |
