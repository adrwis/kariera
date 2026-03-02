# Plan — NextMove v2: 5 zmian na podstronie zawodu

> **Data:** 2026-03-03
> **Status:** W trakcie (2/6 kroków)

---

## Kontekst

Podstrona detalu zawodu (np. `/kariera/zawod/psycholog`) ma layout 2×2:
- Umiejętności i certyfikaty | Wykształcenie i uczelnie
- Gdzie pracować | Znane osoby

Cel: poprawa UX + interaktywność — klikalne workplace'y z ofertami pracy, klikalne skille z linkami do szkoleń, weryfikacja jakości providerów.

---

## Kroki

### [x] 1. "Rekomendowani" → "Przykładowi organizatorzy"
- **Plik:** `js/app.js` linia 1205
- **Zmiana:** Tekst w `openTrainingPopup()` — neutralna etykieta
- **Status:** ✅ Done (sesja 2026-03-03)

### [x] 2. Scroll-to-top — wyraźniejszy design
- **Pliki:** `index.html`, `css/style.css`
- **Zmiana:** Solid primary bg, pill shape z labelem "Na górę" (desktop), circle (mobile), box-shadow
- **Status:** ✅ Done (sesja 2026-03-03)

### [ ] 3. Workplace → klikalne z linkami do ofert pracy (~30 min)
- **Wzorzec:** Accordion inline (nie popup)
- **JS:** W `renderRichDetail()` workplace `<div>` → `<button>` z chevronem, nowa `buildJobSearchLinks(careerName, workplaceName, category)`
  - Zawsze: pracuj.pl, indeed.pl
  - IT: + justjoin.it, nofluffjobs.com
  - Medycyna: + mp.pl/praca
- **CSS:** `.workplace-item--interactive`, `.workplace-item__chevron` (rotate 180°), `.workplace-links`, `.workplace-links__link`
- **HTML generowane przez JS:**
  ```html
  <div class="workplace-item-wrapper">
    <button class="workplace-item workplace-item--interactive" aria-expanded="false">
      [icon] [name + desc] [chevron ↓]
    </button>
    <div class="workplace-links" hidden>
      <div class="workplace-links__title">Przykładowe oferty pracy</div>
      <a href="pracuj.pl/...">Pracuj.pl ↗</a>
      <a href="indeed.pl/...">Indeed ↗</a>
    </div>
  </div>
  ```

### [ ] 4. Skille → klikalne z linkami do szkoleń (~25 min)
- **Wzorzec:** Accordion inline (identyczny pattern jak workplace)
- **JS:** W `renderRichDetail()` skill `<li>` zawiera `<button class="skill-btn">` z chevronem + `<div class="skill-links" hidden>`
  - Nowa `buildSkillTrainingLinks(skillName, skillType, careerData)`:
    - Sprawdza `careerData.skills.skillTrainings[skillName]` (curated)
    - Fallback: dynamiczne linki → Udemy, Coursera, szkolenia.com
    - Technical skills: + LinkedIn Learning
- **CSS:** `.skill-btn`, `.skill-links`, `.skill-links__link`
- **Uwaga:** Istniejące `::before` pseudo-elementy (emoji) na `<li>` zostają

### [ ] 5. Build + testy Playwright (~15 min)
- `node scripts/build.js`
- Bump SW cache version (jeśli potrzebne)
- Playwright testy:
  - Workplace click → accordion expand → linki visible
  - Skill click → accordion expand → linki visible
  - Scroll-to-top visibility + nowy design
  - Training popup → "Przykładowi organizatorzy"
  - Browser back/forward nadal działa

### [ ] 6. Audyt jakości providerów (osobna sesja)
- **Plik:** `data/careers.json`
- Ekstrakcja wszystkich unikalnych providerów z `skills.training[].providers[]`
- Weryfikacja: strona aktywna? opinie? kwalifikacje?
- Usunięcie wątpliwych, dodanie zweryfikowanych alternatyw
- **Zaufane platformy (zamienniki):**
  - SWPS (psychologia, psychoterapia)
  - SGH / ALK (biznes, finanse)
  - Codecool, Kodilla, SDA (IT bootcampy)
  - PTP, CMKP (certyfikaty medyczne/psychologiczne)
- Rebuild minified files po zmianach

---

## Pliki do modyfikacji

| Plik | Kroki |
|------|-------|
| `js/app.js` | 1 ✅, 3, 4 |
| `css/style.css` | 2 ✅, 3, 4 |
| `index.html` | 2 ✅ |
| `sw.js` | 2 ✅, 5 |
| `data/careers.json` | 6 |
