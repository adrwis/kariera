// Porządki w danych szkół po scaleniu: nazwy klas bez „ - ” jako myślnika, skrócone nazwy pisane
// wielkimi literami na zwykłą pisownię, zakazane słowa (reguła stylu). Uruchamiać po merge-*.js.
const fs = require('fs');
const path = require('path');
const DIR = path.resolve(__dirname, '../../data/szkoly');
const ROMAN = /^[IVXLC]+$/;
// Zwykła pisownia tylko dla słów od 5 liter; skróty (LO, TEB, ZSE, CKZiU) i liczby rzymskie zostają bez zmian
function titleCase(str) {
  return str.split(/(\s+|-|„|”|\(|\))/).map(w => {
    if (!w || /^(\s+|-|„|”|\(|\))$/.test(w)) return w;
    if (ROMAN.test(w) || w.length < 5 || /\d/.test(w)) return w;
    const lower = w.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }).join('');
}
function tidyName(name) {
  return name
    .replace(/([a-ząćęłńóśźż]o) - ([A-Za-ząćęłńóśźżĄĆĘŁŃÓŚŹŻ])/g, '$1-$2')   // „matematyczno - geograficzna”, „Psychologiczno - Prawniczy”
    .replace(/([a-ząćęłńóśźż]o): ([A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż])/g, '$1-$2')  // naprawa wcześniejszego „Psychologiczno: Prawniczy”
    .replace(/ - /g, ': ');
}
// Nazwy klas pisane wielkimi literami: zwykła pisownia, bez haseł reklamowych; skróty do 4 liter zostają
function tidyCaps(name) {
  const letters = name.replace(/[^A-Za-ząćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, '');
  if (letters.length < 8 || letters.replace(/[^A-ZĄĆĘŁŃÓŚŹŻ]/g, '').length / letters.length < 0.7) return name;
  let out = name.replace(/\s*NOWOŚĆ\s*\d*\s*!*/gi, ' ').replace(/!+/g, '').replace(/\s+/g, ' ').trim();
  out = out.split(/(\s+)/).map(w => (w.length >= 5 && !/^[IVXLC]+$/.test(w) && !/\d/.test(w)) ? w.toLowerCase() : w).join('');
  return out.charAt(0).toUpperCase() + out.slice(1);
}
let changed = 0;
for (const f of fs.readdirSync(DIR).filter(f => f.endsWith('.json') && f !== 'index.json')) {
  const p = path.join(DIR, f);
  const d = JSON.parse(fs.readFileSync(p, 'utf8'));
  for (const s of d.schools) {
    if (s.shortName && s.shortName === s.shortName.toUpperCase() && /[A-ZĄĆĘŁŃÓŚŹŻ]{5,}/.test(s.shortName.replace(/\b[IVXLC]+\b/g, ''))) {
      s.shortName = titleCase(s.shortName); changed++;
    }
    // Skrót „LO” zepsuty przez wcześniejszą wersję titleCase („VIII Lo”)
    if (s.shortName && /\bLo\b/.test(s.shortName)) { s.shortName = s.shortName.replace(/\bLo\b/g, 'LO'); changed++; }
    if (s.admission) s.admission = s.admission.replace('nie jest kluczowy', 'nie decyduje o przyjęciu').replace(/z kluczowych przedmiotów/g, 'z najważniejszych przedmiotów').replace(/kluczow\w*/g, 'najważniejsze');
    for (const p2 of s.profiles || []) {
      if (/ - |o: [A-ZĄĆĘŁŃÓŚŹŻ][a-z]/.test(p2.name)) { p2.name = tidyName(p2.name); changed++; }
      const capped = tidyCaps(p2.name);
      if (capped !== p2.name) { p2.name = capped; changed++; }
      // Łódź: informator wpisuje do języków tylko drugi język; angielski rozszerzony jest pierwszym językiem
      if (f === 'lodz.json' && (p2.extended || []).includes('ang') && !(p2.languages || []).includes('ang')) { p2.languages = ['ang', ...(p2.languages || [])]; changed++; }
      // Poprawki z audytu 2026-10-01
      if (s.rspo === 30409 && /ścisłowców/.test(p2.name) && !(p2.extended || []).includes('ang')) { p2.extended = [...(p2.extended || []), 'ang']; changed++; }
      if (s.rspo === 86092 && /^I bT/.test(p2.name)) { p2.qualifications = ['BUD.12', 'BUD.14']; changed++; }
      // Języki wpisane z RSPO albo bez pokrycia w źródle oferty (audyt 2026-10-01)
      if ([29709, 6128].includes(s.rspo) && (p2.languages || []).length) { p2.languages = []; changed++; }
      // Liceum Jezuitów w Gdyni, klasa architektoniczno-graficzna: regulamin punktuje też plastykę
      if (s.rspo === 6128 && /architektoniczno-graficzna/i.test(p2.name) && !(p2.scoredSubjects || []).includes('plastyka')) {
        p2.scoredSubjects = [...(p2.scoredSubjects || []), 'plastyka']; changed++;
      }
    }
  }
  fs.writeFileSync(p, JSON.stringify(d));
}
console.log('zmienione pola:', changed);
