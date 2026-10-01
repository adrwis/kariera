// Wpisuje przepisane opisy zawodów (wyniki/opisy.json: {id: {shortDescription, fullDescription}}) do data/careers.json.
// Poprawki merytoryczne z przeglądu opisów: OSP to wolontariat, nie miejsce pracy strażaka.
const fs = require('fs');
const path = require('path');
const DATA = path.resolve(__dirname, '../../data/careers.json');
const opisy = JSON.parse(fs.readFileSync(path.join(__dirname, 'wyniki/opisy.json'), 'utf8'));
const data = JSON.parse(fs.readFileSync(DATA, 'utf8'));
let n = 0;
for (const c of data) {
  const o = opisy[c.id];
  if (!o) { console.log('brak opisu:', c.id); continue; }
  c.shortDescription = o.shortDescription;
  c.fullDescription = o.fullDescription;
  n++;
}
const strazak = data.find(c => c.id === 'strazak');
if (strazak) strazak.workplaces = (strazak.workplaces || []).filter(w => !/ochotnicz|OSP/i.test(w.name + ' ' + (w.description || '')));
fs.writeFileSync(DATA, JSON.stringify(data, null, 2));
console.log('opisy wpisane:', n, '| miejsca pracy strażaka:', strazak.workplaces.map(w => w.name).join(', '));
