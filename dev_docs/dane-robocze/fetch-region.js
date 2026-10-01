// Licea (14) i technika (16) dla młodzieży: duże miasta (powiat grodzki o tej nazwie) i powiat wejherowski.
const fs = require('fs');
const CITIES = ['Kraków', 'Wrocław', 'Łódź', 'Poznań', 'Szczecin', 'Bydgoszcz', 'Lublin', 'Białystok', 'Katowice'];
const COUNTY = 'wejherowski';
async function list(t) {
  let items = [], off = 0;
  for (;;) {
    const r = await fetch(`https://rspo.gov.pl/api/Institution?PageOffset=${off}&PageSize=200`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ institutionTypeIdList: [t], categoryIdList: [1] }) });
    const d = await r.json(); items.push(...d.items); off += 200; if (off >= d.totalCount) break;
  }
  return items;
}
async function detail(id) {
  const p = `rspo/${id}.json`;
  if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p));
  for (let a = 0; a < 3; a++) {
    try { const r = await fetch(`https://rspo.gov.pl/api/Institution/${id}`); if (!r.ok) throw r.status; const t = await r.text(); fs.writeFileSync(p, t); return JSON.parse(t); }
    catch (e) { await new Promise(r => setTimeout(r, 1500)); }
  }
  return null;
}
(async () => {
  const all = [];
  for (const t of [14, 16]) all.push(...(await list(t)).filter(it => !it.liquidationDate));
  // Kandydaci: poczta w dużym mieście albo kod pocztowy z zakresu 84-xxx (okolice Wejherowa, Rumi, Redy)
  const cand = all.filter(it => CITIES.some(c => it.hqAddressPostal === c || (it.hqAddressPostal || '').startsWith(c + '-')) || /^84-/.test(it.hqAddressZipCode || ''));
  const out = {};
  const q = [...cand];
  await Promise.all(Array.from({ length: 6 }, async () => {
    while (q.length) {
      const it = q.shift();
      const d = await detail(it.rspo);
      if (!d) continue;
      const dist = d.hqAddressLocality?.commune?.district?.name;
      const key = CITIES.includes(dist) ? dist : dist === COUNTY ? 'Powiat wejherowski' : null;
      if (key) (out[key] = out[key] || []).push(d.rspo);
    }
  }));
  fs.writeFileSync('by-region.json', JSON.stringify(out, null, 1));
  for (const [k, v] of Object.entries(out)) {
    const ds = v.map(r => JSON.parse(fs.readFileSync(`rspo/${r}.json`)));
    console.log(k.padEnd(20), 'razem', v.length, 'LO', ds.filter(d => d.institutionType.id === 14).length, 'T', ds.filter(d => d.institutionType.id === 16).length, 'z uczniami', ds.filter(d => d.studentsNr > 0).length);
  }
})();
