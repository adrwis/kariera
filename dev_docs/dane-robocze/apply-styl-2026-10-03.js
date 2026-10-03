// Styl tekstów w data/careers.json zgodnie z regułą Ady: zakresy liczb przez „do” (nie łącznikiem), waluta „zł” zamiast „PLN” w tekście.
// Pola techniczne (adresy, kody, identyfikatory, daty w formacie RRRR-MM, nazwy źródeł) zostają bez zmian.
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', '..', 'data', 'careers.json');
const careers = JSON.parse(fs.readFileSync(file, 'utf8'));
const SKIP_KEYS = new Set(['url', 'sourceUrl', 'tuitionSource', 'requirementsSource', 'id', 'code', 'kzis', 'currency', 'sourceName', 'asOf', 'period', 'name', 'link', 'icon']);
let ranges = 0, zl = 0;
const fix = (s) => {
  let t = s.replace(/(?<![\w\/.:#-])(\d{1,4})\s?-\s?(\d{1,4})(?![\w\/-])/g, (m, a, b) => {
    if (/^20\d\d$/.test(a) && /^(0[1-9]|1[0-2])$/.test(b)) return m; // 2024-10 to data, nie zakres
    ranges++; return `${a} do ${b}`;
  });
  t = t.replace(/(\d)\s?PLN\b/g, (m, d) => { zl++; return `${d} zł`; }).replace(/\bPLN\b/g, () => { zl++; return 'zł'; });
  return t;
};
const walk = (o, key) => {
  if (typeof o === 'string') return /^https?:/.test(o) || SKIP_KEYS.has(key) ? o : fix(o);
  if (Array.isArray(o)) return o.map(v => walk(v, key));
  if (o && typeof o === 'object') { for (const [k, v] of Object.entries(o)) o[k] = walk(v, k); }
  return o;
};
walk(careers);
fs.writeFileSync(file, JSON.stringify(careers, null, 2));
console.log('zakresy zamienione na „do”:', ranges, ', waluty PLN na zł:', zl);
