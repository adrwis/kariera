// Pełna weryfikacja 271 biogramów osób względem wstępów artykułów Wikipedii (wyniki/osoby-weryfikacja-2026-10-03.json):
// bio i opis zastąpione tekstami opartymi wyłącznie na wstępie artykułu, 6 osób usuniętych (opis niezgodny z artykułem
// albo artykuł o firmie). Twierdzenia, których wstęp nie potwierdza (nakłady, nagrody, „pierwszy”, cytaty), zniknęły.
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', '..', 'data', 'careers.json');
const careers = JSON.parse(fs.readFileSync(file, 'utf8'));
const ver = JSON.parse(fs.readFileSync(path.join(__dirname, 'wyniki', 'osoby-weryfikacja-2026-10-03.json'), 'utf8'));
const key = (id, name) => id + '|' + name;
const by = new Map(ver.map(v => [key(v.zawodId, v.imie), v]));
let removed = 0, updated = 0, descs = 0;
for (const c of careers) {
  if (!c.famousPeople) continue;
  c.famousPeople = c.famousPeople.filter(p => {
    const v = by.get(key(c.id, p.name));
    if (v && v.status === 'usun') { removed++; return false; }
    return true;
  });
  for (const p of c.famousPeople) {
    const v = by.get(key(c.id, p.name));
    if (!v || v.status !== 'popraw') continue;
    if (v.proponowanyBio) { p.bio = v.proponowanyBio; updated++; }
    if (v.proponowanyOpis) { p.description = v.proponowanyOpis; descs++; }
  }
}
fs.writeFileSync(file, JSON.stringify(careers, null, 2));
const per = careers.map(c => (c.famousPeople || []).length);
console.log('osoby: usunięto', removed, ', bio zastąpione', updated, ', opisy zastąpione', descs, '; min osób w zawodzie', Math.min(...per), ', razem', per.reduce((a, b) => a + b, 0));
