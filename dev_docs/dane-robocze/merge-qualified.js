// Dopisuje liczbę zakwalifikowanych (qualified) i miejsc (places) do progów z serwisów statystyk VULCAN,
// które ich nie miały (Bydgoszcz, Katowice, część Gdyni i Sopotu). Źródło: odpowiedzi publicznego API serwisów
// *-stat.edu.com.pl zapisane przy audycie danych 2026-10-03 (wyniki/turtle-api-2026-10-03.json), dopasowanie po sourceUrl.
// Dzięki temu strona oznacza klasy z niepełnym naborem (próg niski z braku chętnych).
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', '..', 'data', 'szkoly');
const api = JSON.parse(fs.readFileSync(path.join(__dirname, 'wyniki', 'turtle-api-2026-10-03.json'), 'utf8'));
const byUrl = new Map(api.map(r => [r.url, r.src]));

for (const city of ['bydgoszcz', 'katowice', 'gdynia', 'sopot', 'gdansk']) {
  const file = path.join(DIR, city + '.json');
  const d = JSON.parse(fs.readFileSync(file, 'utf8'));
  let filled = 0;
  for (const s of d.schools) for (const p of s.profiles || []) for (const t of p.thresholds || []) {
    const src = byUrl.get(t.sourceUrl);
    if (!src) continue;
    if (t.qualified == null && Number.isFinite(src.qualifiedCandidatesCount)) { t.qualified = src.qualifiedCandidatesCount; filled++; }
    if (t.places == null && Number.isFinite(src.numberOfOfferedPlaces)) t.places = src.numberOfOfferedPlaces;
  }
  fs.writeFileSync(file, JSON.stringify(d));
  console.log(city + ': dopisano liczbę zakwalifikowanych w', filled, 'progach');
}
