// Progi 2025 dla Łodzi z pliku Urzędu Miasta Łodzi „Analiza liczby punktów w rekrutacji na rok szkolny 2025/2026”
// (zrodla/lodz/, pobrany ręcznie przez Adę 2026-10-01; strona ma ochronę antybotową).
// Dopasowanie klas 2025 do oferty 2026/27: wyniki/lodz-progi-2025-uml.json (tylko pewne; reszta w lodz-progi-2025-niedopasowane.json).
// Uruchamiać po merge-vulcan.js.
const fs = require('fs');
const path = require('path');
const FILE = path.resolve(__dirname, '../../data/szkoly/lodz.json');
const SOURCE = 'https://uml.lodz.pl/files/public/user_upload2/2026/03/Analiza_liczby_punktow_w_rekrutacji_na_rok_szkolny_2025_2026.pdf';
// Dopasowania oparte na dodatkowym założeniu, pominięte
const SKIP = [
  [25360, /1B-gr\.1/],      // XXV LO: próg jednej grupy przypisany do całej klasy
  [22522, /łaci/],          // VI LO: klasa z łaciną, w 2026/27 bez łaciny
  [118756, /TWe/],          // T19: TWe a I TW, inny symbol
  [38979, /Cyberbezpiecz/], // T9: w 2025 pół oddziału to cyberbezpieczeństwo
];
const rows = JSON.parse(fs.readFileSync(path.join(__dirname, 'wyniki/lodz-progi-2025-uml.json'), 'utf8'));
const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const bySchool = new Map(data.schools.map(s => [s.rspo, s]));
let added = 0, skipped = 0, had = 0, missing = 0;
for (const r of rows) {
  if (SKIP.some(([rspo, re]) => rspo === r.rspo && re.test(r.pdfClass))) { skipped++; continue; }
  const p = (bySchool.get(r.rspo)?.profiles || []).find(p => p.name === r.profileName);
  if (!p) { missing++; console.log('brak klasy:', r.rspo, r.profileName); continue; }
  p.thresholds = p.thresholds || [];
  // Próg 2025 podany przez szkołę zostaje (np. XXXIII LO podaje minima grup)
  if (p.thresholds.some(t => t.year === 2025)) { had++; continue; }
  p.thresholds.push({ year: 2025, min: r.min, scale: r.scale || 200, kind: 'zakwalifikowani', sourceUrl: SOURCE });
  p.thresholds.sort((a, b) => b.year - a.year);
  added++;
}
fs.writeFileSync(FILE, JSON.stringify(data));
console.log(`Łódź: dodano ${added} progów 2025, pominięto ${skipped} niepewnych, ${had} miało już próg ze strony szkoły, brak klasy ${missing}`);
