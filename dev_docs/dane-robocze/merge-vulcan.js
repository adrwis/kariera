// Progi z oficjalnych serwisów statystyk naboru VULCAN (gdansk-, gdynia-, sopot-stat.edu.com.pl).
// Gdańsk: profile dopasowane po groupId i nazwie dostają progi 2026 i 2025 wyłącznie z serwisu
// (2025 tylko przy tej samej klasie). Gdynia i Sopot: do istniejących progów dopisujemy liczbę przyjętych i miejsc.
// Kolejność uruchamiania: merge-gdansk-2026.js, merge-miasta-2026.js, tidy-szkoly.js, merge-vulcan.js.
const fs = require('fs');
const path = require('path');
const DIR = path.resolve(__dirname, '../../data/szkoly');
const recs = JSON.parse(fs.readFileSync(path.join(__dirname, 'wyniki/wynik-vulcan-stat.json'), 'utf8'));
const FILES = { 'Gdańsk': 'gdansk.json', 'Gdynia': 'gdynia.json', 'Sopot': 'sopot.json' };
const log = {};
for (const [city, file] of Object.entries(FILES)) {
  const p = path.join(DIR, file);
  const d = JSON.parse(fs.readFileSync(p, 'utf8'));
  const mine = recs.filter(r => r.city === city);
  let replaced = 0, annotated = 0, places = 0;
  for (const s of d.schools) {
    for (const prof of s.profiles || []) {
      const rs = mine.filter(r => r.rspo === s.rspo && r.profileName === prof.name);
      if (!rs.length) continue;
      if (city === 'Gdańsk') {
        const th = rs.filter(r => typeof r.min === 'number' && r.scale && /^https?:\/\//.test(r.sourceUrl))
          .map(r => ({ year: r.year, min: r.min, scale: r.scale, kind: 'zakwalifikowani', sourceUrl: r.sourceUrl, qualified: r.qualified, places: r.places }))
          .sort((a, b) => b.year - a.year);
        prof.thresholds = th;
        replaced++;
        const r26 = rs.find(r => r.year === 2026);
        if (r26 && r26.places && !prof.places) { prof.places = r26.places; places++; }
      } else {
        for (const t of prof.thresholds || []) {
          const r = rs.find(x => x.year === t.year && x.sourceUrl === t.sourceUrl);
          if (r) { t.qualified = r.qualified; t.places = r.places; annotated++; }
        }
      }
    }
  }
  fs.writeFileSync(p, JSON.stringify(d));
  log[city] = { replaced, annotated, places, thresholds: d.schools.reduce((a, s) => a + (s.profiles || []).reduce((b, x) => b + (x.thresholds || []).length, 0), 0) };
}
console.log(JSON.stringify(log));
