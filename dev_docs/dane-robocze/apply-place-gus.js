// Płace zawodów z oficjalnej publikacji GUS „Struktura wynagrodzeń według zawodów za październik 2024 r.”
// (wyniki/gus-place-2026-10-03.json). Zastępuje dotychczasowe widełki bez daty i źródła.
// GUS publikuje zawody tylko do 3 cyfr KZiS i podaje decyle (nie kwartyle): min = d1, max = d9, median = piąty decyl.
// Zawody, których GUS nie wyodrębnia, tracą kwoty (salary usunięte, salaryNote wyjaśnia dlaczego).
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const gus = JSON.parse(fs.readFileSync(path.join(__dirname, 'wyniki', 'gus-place-2026-10-03.json'), 'utf8'));
const file = path.join(ROOT, 'data', 'careers.json');
const careers = JSON.parse(fs.readFileSync(file, 'utf8'));
const byId = new Map(gus.zawody.map(z => [z.id, z]));
const missing = new Set(gus.brak.map(b => b.id));
const r = n => Math.round(n);

let set = 0, cleared = 0;
for (const c of careers) {
  const z = byId.get(c.id);
  if (z) {
    const group = z.grupaGus.replace(/^\d+\s+/, '');
    c.salary = {
      min: r(z.d1), max: r(z.d9), median: r(z.mediana), currency: 'PLN', gross: true, period: 'month',
      asOf: gus.zrodlo.okres, sourceName: 'GUS, Struktura wynagrodzeń według zawodów za październik 2024 r.',
      sourceUrl: gus.zrodlo.stronaUrl, scope: z.szerokoscGrupy === 'waska' ? 'zawód' : 'grupa', group,
    };
    delete c.salaryNote;
    set++;
  } else if (missing.has(c.id)) {
    delete c.salary;
    c.salaryNote = 'GUS nie podaje zarobków tego zawodu osobno: grupa zawodów łączy wiele różnych zawodów albo zawód wykonuje się głównie poza etatem. Dlatego nie podajemy kwot.';
    cleared++;
  }
}
fs.writeFileSync(file, JSON.stringify(careers, null, 2));
console.log('płace z GUS:', set, ', bez kwot:', cleared, ', razem zawodów:', careers.length);
