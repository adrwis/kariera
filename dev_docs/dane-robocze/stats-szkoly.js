// Liczby do wyboru miasta w kalkulatorze: ile klas ma próg w skali 200 pkt (data/szkoly/index.json, pole stats).
// Uruchamiać na końcu, po wszystkich skryptach zmieniających data/szkoly.
const fs = require('fs');
const path = require('path');
const DIR = path.resolve(__dirname, '../../data/szkoly');
const indexFile = path.join(DIR, 'index.json');
const index = JSON.parse(fs.readFileSync(indexFile, 'utf8'));
index.stats = {};
for (const f of fs.readdirSync(DIR).filter(f => f.endsWith('.json') && f !== 'index.json')) {
  const d = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
  let classes = 0, withThresholds = 0;
  for (const s of d.schools) for (const p of s.profiles || []) {
    classes++;
    if ((p.thresholds || []).some(t => typeof t.min === 'number' && t.scale === 200)) withThresholds++;
  }
  index.stats[f.replace('.json', '')] = { classes, withThresholds };
}
fs.writeFileSync(indexFile, JSON.stringify(index));
console.log(Object.entries(index.stats).map(([k, v]) => `${k} ${v.withThresholds}/${v.classes}`).join(', '));
