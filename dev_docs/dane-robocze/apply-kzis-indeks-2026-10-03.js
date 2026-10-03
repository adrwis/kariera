// Indeks KZiS (wpisy bez profilu) dopasowany do obowiązującej klasyfikacji (Dz.U. 2025 poz. 1534, tekst w zrodla/kzis-2025-dz-u-2025-poz-1534.txt):
// - wpis, którego nazwa jest w klasyfikacji, dostaje oficjalny kod i traci flagę codeUnverified;
// - kilka wpisów przemianowanych na oficjalną nazwę zawodu (RENAME);
// - wpisy bez odpowiednika w klasyfikacji (np. „Nauczyciel matematyki”, „Kierowca ciężarówki”) usunięte.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const text = fs.readFileSync(path.join(__dirname, 'zrodla', 'kzis-2025-dz-u-2025-poz-1534.txt'), 'utf8');
const official = new Map();
for (const line of text.split('\n')) {
  const m = line.match(/^\s*(\d{6})\s+(.+?)\s*$/);
  if (m) official.set(m[2].toLowerCase().replace(/\s+/g, ' '), { code: m[1], name: m[2] });
}
const lookup = n => {
  const k = n.toLowerCase().replace(/\s+/g, ' ');
  return official.get(k) || official.get(k + 's') || official.get(k + ' s') || null;
};
const RENAME = {
  'Psycholog sportu': 'Psycholog sportowy', 'Psycholog pracy i organizacji': 'Psycholog organizacji', 'Psycholog kliniczny': 'Specjalista w dziedzinie psychologii klinicznej',
  'Lekarz neurolog': 'Lekarz – specjalista neurologii', 'Lekarz onkolog': 'Lekarz – specjalista onkologii klinicznej',
  'Lekarz radiolog': 'Lekarz – specjalista radiologii i diagnostyki obrazowej', 'Kucharz szef kuchni': 'Szef kuchni (kuchmistrz)',
  'Grafik multimedialny': 'Grafik komputerowy multimediów', 'Inżynier chemik': 'Inżynier technologii chemicznej',
};
const file = path.join(ROOT, 'data', 'kzis-index.json');
const kzis = JSON.parse(fs.readFileSync(file, 'utf8'));
let verified = 0, renamed = 0, removed = 0;
const out = [];
for (const k of kzis) {
  if (k.id || !k.codeUnverified) { out.push(k); continue; }
  const target = RENAME[k.name] || k.name;
  const o = lookup(target);
  if (!o) { removed++; continue; }
  if (RENAME[k.name]) renamed++;
  k.name = RENAME[k.name] ? target.replace(/^Lekarz – specjalista /, 'Lekarz specjalista ').replace('Specjalista w dziedzinie psychologii klinicznej', 'Psycholog kliniczny') : k.name;
  k.code = o.code; delete k.codeUnverified; verified++;
  out.push(k);
}
fs.writeFileSync(file, '[\n' + out.map(x => '  ' + JSON.stringify(x)).join(',\n') + '\n]\n');
console.log('wpisy z oficjalnym kodem:', verified, ', przemianowane:', renamed, ', usunięte (brak w klasyfikacji):', removed, ', w indeksie zostało:', out.length);
