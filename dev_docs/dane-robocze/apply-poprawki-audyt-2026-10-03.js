// Poprawki po audycie danych 2026-10-03 (krytyk danych). Skrypt jest idempotentny.
// 1. famousPeople: 15 wpisów prowadziło do nieistniejących artykułów Wikipedii (sprawdzone przez API 2026-10-03).
//    Cztery naprawione (poprawny adres lub nazwa), reszta usunięta, bo nie ma artykułu, który potwierdzałby osobę.
//    Wpis „Jan Gruby, lekarz weterynarz, pionier mikologii” miał też błędny opis (najpewniej chodziło o Davida Gruby'ego, lekarza ludzi).
// 2. CX LO Warszawa: dwie klasy „1C1” mają różne języki, a próg 2025 (126) dotyczył klasy 1C1 z angielskim i niemieckim,
//    więc nie przypinamy go żadnej z nich i rozróżniamy nazwy.
// 3. Literówka w nazwie klasy w Poznaniu (AKAEDMICKA).
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..', '..');

const careersFile = path.join(ROOT, 'data', 'careers.json');
const careers = JSON.parse(fs.readFileSync(careersFile, 'utf8'));
const REMOVE = {
  weterynarz: ['Jan Gruby'], sedzia: ['Stanisław Dąbrowski'], komornik: ['Rafał Fronczek', 'Stanisław Chmielewski'],
  'funkcjonariusz-sg': ['Dominik Tracz'], fryzjer: ['Tomasz Schmitt', 'Oribe Canales'], tester: ['Lisa Crispin', 'Michael Bolton'],
  'pracownik-ochrony': ['Clive Fairweather'], kosmetyczka: ['Joanna Czech'],
};
const FIX = {
  strazak: { 'Florian Dąbrowski': { name: 'Święty Florian', sourceUrl: 'https://pl.wikipedia.org/wiki/Florian_(męczennik)' } },
  'data-scientist': { 'Andrew Ng': { sourceUrl: 'https://en.wikipedia.org/wiki/Andrew_Ng' } },
  kartograf: { 'Gerardus Mercator': { sourceUrl: 'https://pl.wikipedia.org/wiki/Gerard_Merkator' } },
  ogrodnik: { 'Szymon Syreniusz': { sourceUrl: 'https://pl.wikipedia.org/wiki/Szymon_Syreński_(Syreniusz)' } },
};
let removed = 0, fixed = 0;
for (const c of careers) {
  if (!c.famousPeople) continue;
  const rm = REMOVE[c.id] || [];
  const before = c.famousPeople.length;
  c.famousPeople = c.famousPeople.filter(p => !rm.includes(p.name));
  removed += before - c.famousPeople.length;
  for (const p of c.famousPeople) {
    const fx = (FIX[c.id] || {})[p.name];
    if (fx) { Object.assign(p, fx); fixed++; }
  }
}
fs.writeFileSync(careersFile, JSON.stringify(careers, null, 2));
console.log('famousPeople: usunięto', removed, ', naprawiono', fixed);

const wFile = path.join(ROOT, 'data', 'szkoly', 'warszawa.json');
const w = JSON.parse(fs.readFileSync(wFile, 'utf8'));
const cx = w.schools.find(s => s.rspo === 83621);
const c1 = cx.profiles.filter(p => /^Klasa 1C1/.test(p.name));
if (c1.length === 2) {
  for (const p of c1) {
    p.thresholds = (p.thresholds || []).filter(t => t.year !== 2025);
    const lang = (p.languages || []).includes('wlo') ? 'włoski' : 'hiszpański';
    p.name = `Klasa 1C1 (język ${lang})`;
  }
  console.log('CX LO: rozróżnione klasy 1C1, usunięty próg 2025');
}
fs.writeFileSync(wFile, JSON.stringify(w));

const pFile = path.join(ROOT, 'data', 'szkoly', 'poznan.json');
const poz = fs.readFileSync(pFile, 'utf8');
fs.writeFileSync(pFile, poz.replace(/AKAEDMICKA/g, 'AKADEMICKA'));
