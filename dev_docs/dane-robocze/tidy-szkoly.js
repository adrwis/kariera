// Porządki w danych szkół po scaleniu: nazwy klas bez „ - ” jako myślnika, skrócone nazwy pisane
// wielkimi literami na zwykłą pisownię, zakazane słowa (reguła stylu). Uruchamiać po merge-*.js.
const fs = require('fs');
const path = require('path');
const DIR = path.resolve(__dirname, '../../data/szkoly');
const ROMAN = /^[IVXLC]+$/;
function titleCase(str) {
  return str.toLowerCase().split(/(\s+|-)/).map(w => {
    if (ROMAN.test(w.toUpperCase()) && w.length > 0 && /^[ivxlc]+$/.test(w)) return w.toUpperCase();
    if (['nr', 'im.', 'i', 'w', 'z', 'na', 'dla'].includes(w)) return w;
    return w.charAt(0).toUpperCase() + w.slice(1);
  }).join('');
}
function tidyName(name) {
  return name
    .replace(/([a-ząćęłńóśźż]o) - ([a-ząćęłńóśźż])/g, '$1-$2')   // „matematyczno - geograficzna”
    .replace(/ - /g, ': ');
}
let changed = 0;
for (const f of fs.readdirSync(DIR).filter(f => f.endsWith('.json') && f !== 'index.json')) {
  const p = path.join(DIR, f);
  const d = JSON.parse(fs.readFileSync(p, 'utf8'));
  for (const s of d.schools) {
    if (s.shortName && s.shortName.length > 6 && s.shortName === s.shortName.toUpperCase() && /[A-ZĄĆĘŁŃÓŚŹŻ]{4}/.test(s.shortName)) {
      s.shortName = titleCase(s.shortName); changed++;
    }
    if (s.admission) s.admission = s.admission.replace('nie jest kluczowy', 'nie decyduje o przyjęciu');
    for (const p2 of s.profiles || []) {
      if (/ - /.test(p2.name)) { p2.name = tidyName(p2.name); changed++; }
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
