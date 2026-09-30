// Usuwa długie myślniki i półpauzy z tekstów wyświetlanych na stronie (reguła stylu Ady).
// Zakresy liczb: „do”, lata w nawiasie: łącznik, wtrącenia: przecinek. Adresy URL bez zmian.
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '../..');
const files = ['data/careers.json', ...fs.readdirSync(path.join(ROOT, 'data/szkoly')).filter(f => f.endsWith('.json')).map(f => 'data/szkoly/' + f)];

function fix(str) {
  if (/^https?:\/\//.test(str)) return str;
  return str
    .replace(/\((\d{4})\s*[–—]\s*(\d{4})\)/g, '($1-$2)')                    // lata życia
    .replace(/(\d)\s*[–—]\s*(\d)/g, '$1 do $2')                             // zakresy liczb
    .replace(/\b([IVXL]+)\s*[–—]\s*([IVXL]+)\b/g, '$1-$2')                  // klasy I–VIII
    .replace(/\s+[–—]\s+/g, ', ')                                            // wtrącenia
    .replace(/[–—]/g, '-')
    .replace(/,\s*,/g, ',');
}
function walk(v) {
  if (typeof v === 'string') return fix(v);
  if (Array.isArray(v)) return v.map(walk);
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, walk(x)]));
  return v;
}
for (const f of files) {
  const p = path.join(ROOT, f);
  const raw = fs.readFileSync(p, 'utf8');
  const before = (raw.match(/[–—]/g) || []).length;
  const out = walk(JSON.parse(raw));
  const pretty = f === 'data/careers.json';
  const txt = pretty ? JSON.stringify(out, null, 2) : JSON.stringify(out);
  fs.writeFileSync(p, txt);
  console.log(f, 'myślników przed:', before, 'po:', (txt.match(/[–—]/g) || []).length);
}
