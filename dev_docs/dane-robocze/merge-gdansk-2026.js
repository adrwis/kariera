// Scala dane Gdańska na rekrutację 2026/27: rekordy szkół z data/szkoly/gdansk.json (RSPO, dzielnice)
// + profile i progi od agentów (wyniki/wynik-gd-*.json) + matura z CKE (baza/cke_2026.json, cke_2025.json).
// Zasady: tylko dane ze źródłem; profile z niedatowanej albo sprzecznej oferty i klasy z 0 miejsc w naborze usuwane.
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '../..');
const W = path.join(__dirname, 'wyniki');
const B = path.join(__dirname, 'baza');
const RET = '2026-10-01';

const results = ['wynik-gd-lo-1.json', 'wynik-gd-lo-2.json', 'wynik-gd-tech.json']
  .flatMap(f => JSON.parse(fs.readFileSync(path.join(W, f), 'utf8')));
const byRspo = new Map(results.map(r => [r.rspo, r]));
const cke = { 2026: JSON.parse(fs.readFileSync(path.join(B, 'cke_2026.json'))), 2025: JSON.parse(fs.readFileSync(path.join(B, 'cke_2025.json'))) };
const CKE_URL = y => `https://mapa.wyniki.edu.pl/MapaEgzaminow/assets/data/CSV/EM2023/${y}/EM2023_${y}_szkoly_07.xlsx`;

const DROP_ALL_PROFILES = { 265997: 'oferta bez roku szkolnego', 480958: 'sprzeczne daty oferty' };
const ZERO_PLACES = new Set([11821, 17295, 480106]); // klasy z 0 miejsc w naborze: nie wiadomo, czy ruszyły

const cur = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/szkoly/gdansk.json'), 'utf8'));
const log = [];
const schools = cur.schools.map(s => {
  const r = byRspo.get(s.rspo);
  if (!r) { log.push(`${s.rspo}: brak wyniku agenta, profile usunięte`); return { ...s, profiles: [] }; }
  let profiles = (r.profiles || []).map(p => {
    const { qualificationsSource, ...rest } = p;
    return rest;
  });
  if (DROP_ALL_PROFILES[s.rspo]) { log.push(`${s.shortName}: usunięto ${profiles.length} profili (${DROP_ALL_PROFILES[s.rspo]})`); profiles = []; }
  if (ZERO_PLACES.has(s.rspo)) {
    const before = profiles.length;
    profiles = profiles.filter(p => p.places !== null);
    if (before !== profiles.length) log.push(`${s.shortName}: usunięto ${before - profiles.length} klas z 0 miejsc w naborze`);
  }
  const year = cke[2026][s.rspo] ? 2026 : cke[2025][s.rspo] ? 2025 : null;
  const c = year && cke[year][s.rspo];
  const matura = c ? { year, passRate: c.passRate, examinees: c.examinees, certificates: c.certificates, extended: c.extended, sourceUrl: CKE_URL(year) } : null;
  const sources = (s.sources || []).filter(x => !/CKE|Strona szkoły/.test(x.name)).map(x => ({ ...x, name: x.name.replace(/ [–—] /g, ', ') }));
  if (matura) sources.push({ name: `CKE Mapa Egzaminów, matura ${year}`, url: CKE_URL(year), retrieved: RET });
  const out = { ...s, matura, profiles, sources };
  if (r.admission) out.admission = r.admission; else delete out.admission;
  if (r.shortName) out.shortName = r.shortName;
  return out;
});

fs.writeFileSync(path.join(ROOT, 'data/szkoly/gdansk.json'), JSON.stringify({ city: 'Gdańsk', retrieved: RET, schools }));
const prof = schools.reduce((a, s) => a + s.profiles.length, 0);
const th = schools.reduce((a, s) => a + s.profiles.reduce((b, p) => b + (p.thresholds || []).length, 0), 0);
console.log(log.join('\n'));
console.log(`Gdańsk: ${schools.length} szkół, ${prof} profili, ${th} progów, matura 2026: ${schools.filter(s => s.matura && s.matura.year === 2026).length}`);
