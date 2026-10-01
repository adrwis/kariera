// Notatki o czesnym dla czytelnika: krótkie zdanie zamiast notatki roboczej (oryginał w tuitionNoteRaw, niewyświetlany).
const fs = require('fs');
const path = require('path');
const DATA = path.resolve(__dirname, '../../data/careers.json');
const data = JSON.parse(fs.readFileSync(DATA, 'utf8'));
function short(note) {
  if (/^\d+ rat po \d+ PLN/.test(note)) return note;
  if (/całego cyklu|stała dla całego|ta sama stawka|wszystkich lat/i.test(note)) return 'Ta sama kwota przez całe studia.';
  if (/I rok|pierwszy rok|I roku|kolejnych lat/i.test(note)) return 'Kwota za pierwszy rok, w kolejnych latach może być wyższa.';
  return null;
}
let changed = 0;
for (const c of data) for (const s of c.education.schools) for (const m of s.modes || []) {
  if (!m.tuitionNote || m.tuitionNoteRaw) continue;
  const sh = short(m.tuitionNote);
  if (sh === m.tuitionNote) continue;
  m.tuitionNoteRaw = m.tuitionNote;
  if (sh) m.tuitionNote = sh; else delete m.tuitionNote;
  changed++;
}
// Opis szkolenia biegłego rewidenta bez formuły „Wymaga…”
const br = data.find(c => c.id === 'biegly-rewident');
for (const t of (br && br.skills.training) || []) {
  if (t.description) t.description = t.description.replace(/Wymaga odbycia praktyk/, 'Obejmuje też praktyki');
}
fs.writeFileSync(DATA, JSON.stringify(data, null, 2));
console.log('notatek o czesnym zmienionych:', changed);
