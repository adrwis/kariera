// Progi 2025 LO VI Wrocław (4 klasy) z tabeli PNG na stronie szkoły.
// Liczby sprawdzone wzrokowo na obrazie 2026-10-03. Wiersz "biologia, chemia, angielski" (156,45)
// pominięty: pasuje do 1C1 i 1C2 (sportowy), a 1B1 i 1E nie mają wiersza.
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', '..', 'data', 'szkoly', 'wroclaw.json');
const SOURCE = 'https://www.lo6.wroc.pl/progi-punktowe-z-poprzedniego-roku.html';
const RSPO = 11476;
const PROGI = { '1A': 159.15, '1B2': 161.45, '1D1': 153.85, '1D2': 154.5 };

const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const school = data.schools.find((s) => s.rspo === RSPO);
if (!school) throw new Error('Brak LO VI (RSPO ' + RSPO + ')');

let n = 0;
for (const p of school.profiles) {
  const code = p.name.split(':')[0].trim();
  if (!(code in PROGI)) continue;
  p.thresholds = (p.thresholds || []).filter((t) => t.year !== 2025);
  p.thresholds.push({ year: 2025, min: PROGI[code], scale: 200, kind: null, sourceUrl: SOURCE });
  n++;
}
if (n !== Object.keys(PROGI).length) throw new Error('Dopasowano ' + n + ' klas zamiast 4');

fs.writeFileSync(FILE, JSON.stringify(data));
console.log('LO VI Wrocław: wpisano progi dla', n, 'klas');
