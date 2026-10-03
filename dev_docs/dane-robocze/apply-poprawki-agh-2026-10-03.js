// AGH: progi pochodzą ze strony https://rekrutacja.agh.edu.pl/kierunki-studiow/, zakładka „Progi punktowe”.
// Wartości sprawdzone 2026-10-03 w tabelach tej strony (studia I stopnia: Informatyka, Cyberbezpieczeństwo, Geodezja i Kartografia,
// Mechanika i Budowa Maszyn, Tworzenie Przestrzeni Wirtualnych i Gier; lata 2024 do 2026, cykl 1; wszystkie 33 zgodne).
// Zakładka otwiera się kliknięciem, więc adres bez fragmentu #progi-punktowe (ten fragment nic nie robił), a w opisie wskazówka, gdzie szukać.
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', '..', 'data', 'careers.json');
const careers = JSON.parse(fs.readFileSync(file, 'utf8'));
const URL_OLD = /^https:\/\/rekrutacja\.agh\.edu\.pl\/kierunki-studiow\/(#progi-punktowe)?$/;
const URL_NEW = 'https://rekrutacja.agh.edu.pl/kierunki-studiow/';
const HINT = 'strona AGH, zakładka „Progi punktowe”';
let n = 0;
for (const c of careers) for (const s of (c.education && c.education.schools) || []) for (const m of s.modes || []) for (const t of m.thresholds || []) {
  if (!URL_OLD.test(t.sourceUrl || '')) continue;
  t.sourceUrl = URL_NEW;
  if (!(t.round || '').includes(HINT)) t.round = (t.round ? t.round + '; ' : '') + HINT;
  n++;
}
fs.writeFileSync(file, JSON.stringify(careers, null, 2));
console.log('AGH: poprawiono', n, 'progów');
