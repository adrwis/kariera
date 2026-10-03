// Etykiety zapotrzebowania według Barometru Zawodów 2026 (prognoza na 2026 r., XI edycja), skala krajowa; pomorskie dopisane,
// gdy się różni. Barometr ocenia grupy zawodów, więc dopasowanie jest po nazwie grupy (wyniki/barometr-2026-10-03.json).
// W Barometrze nie ma nadwyżek w skali kraju ani pomorskiego, dlatego etykieta „nadwyżkowy” znika. Zawody spoza Barometru
// (aktor, muzyk, reżyser, nauczyciel akademicki) nie mają etykiety.
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', '..', 'data', 'careers.json');
const careers = JSON.parse(fs.readFileSync(file, 'utf8'));
const bar = JSON.parse(fs.readFileSync(path.join(__dirname, 'wyniki', 'barometr-2026-10-03.json'), 'utf8'));
const byId = new Map(bar.zawody.map(z => [z.id, z]));
const MAP = { deficyt: 'deficytowy', 'równowaga': 'zrównoważony', 'nadwyżka': 'nadwyżkowy' };
let changed = 0, removed = 0;
for (const c of careers) {
  const z = byId.get(c.id);
  if (!z) continue;
  const nat = MAP[z.klasyfikacja];
  const pom = MAP[z.klasyfikacjaPomorskie];
  delete c.demandPomorskie;
  if (nat) {
    if (c.demand !== nat) changed++;
    c.demand = nat;
    c.demandGroup = z.nazwaWBarometrze;
    if (pom && pom !== nat) c.demandPomorskie = pom;
  } else {
    if (c.demand) removed++;
    delete c.demand; delete c.demandGroup;
  }
  c.sources = (c.sources || []).map(s => (s === 'Barometr Zawodów 2025' ? 'Barometr Zawodów 2026' : s));
}
fs.writeFileSync(file, JSON.stringify(careers, null, 2));
const cnt = {}; careers.forEach(c => { cnt[c.demand || 'brak'] = (cnt[c.demand || 'brak'] || 0) + 1; });
console.log('etykiety zmienione:', changed, ', usunięte (poza Barometrem):', removed, JSON.stringify(cnt));
