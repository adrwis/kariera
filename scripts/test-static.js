// Testy statycznych stron i plików wdrożenia (wynik `npm run build`): meta każdej strony zawodu, sitemap, pliki z sw.js.
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
let passed = 0, failed = 0;
function check(name, ok, detail) {
  if (ok) { console.log(`  OK  ${name}`); passed++; }
  else { console.log(`  FAIL ${name}${detail ? ': ' + detail : ''}`); failed++; }
}
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

console.log('\n=== Strony statyczne ===');
const careers = JSON.parse(read('data/careers.json'));
const bad = [];
for (const c of careers) {
  const f = `zawod/${c.id}/index.html`;
  if (!fs.existsSync(path.join(ROOT, f))) { bad.push(`${c.id}: brak pliku`); continue; }
  const h = read(f);
  const title = (h.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
  const canon = (h.match(/<link rel="canonical" href="([^"]*)"/) || [])[1] || '';
  const og = (h.match(/<meta property="og:url" content="([^"]*)"/) || [])[1] || '';
  if (!title.startsWith(c.name.replace(/&/g, '&amp;'))) bad.push(`${c.id}: tytuł "${title}"`);
  if (canon !== `https://adrwis.github.io/kariera/zawod/${c.id}/` || canon !== og) bad.push(`${c.id}: canonical/og:url`);
  const own = (h.match(/<main id="main"><noscript>([^]*?)<\/noscript>/) || [])[1] || '';
  if (!own || /<h1\b/.test(own)) bad.push(`${c.id}: własny noscript bez treści albo z drugim h1`);
}
check(`każdy z ${careers.length} zawodów ma stronę z własnym tytułem i canonical`, !bad.length, bad.slice(0, 3).join('; '));
for (const p of ['quiz', 'kalkulator', 'szkoly']) check(`strona ${p}/ istnieje`, fs.existsSync(path.join(ROOT, p, 'index.html')));

console.log('\n=== Sitemap ===');
const sitemap = read('sitemap.xml');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].replace('https://adrwis.github.io/kariera/', ''));
const missing = urls.filter(u => u && !fs.existsSync(path.join(ROOT, u, 'index.html')));
check(`wszystkie ${urls.length} adresów z sitemap ma plik na dysku`, !missing.length, missing.slice(0, 3).join(', '));
check('sitemap nie zawiera adresów z parametrami', !urls.some(u => u.includes('?')));

console.log('\n=== Service worker i wdrożenie ===');
const sw = read('sw.js');
const shell = [...sw.matchAll(/'\/kariera\/([^']*)'/g)].map(m => m[1]).filter(Boolean);
const absent = shell.filter(f => !fs.existsSync(path.join(ROOT, f)));
check(`wszystkie ${shell.length} plików z APP_SHELL istnieje`, !absent.length, absent.join(', '));
const html = read('index.html');
const assets = [...html.matchAll(/(?:href|src)="((?:css|js|icons|data)\/[^"#?]+)"/g)].map(m => m[1]);
const lost = assets.filter(f => !fs.existsSync(path.join(ROOT, f)));
check(`zasoby z index.html istnieją (${assets.length})`, !lost.length, lost.join(', '));
const wf = read('.github/workflows/deploy.yml');
check('CI robi build i testy przed publikacją', wf.indexOf('npm run build') !== -1 && wf.indexOf('npm test') > wf.indexOf('npm run build'));
check('CI nie publikuje dev_docs', !/cp[^\n]*dev_docs/.test(wf));

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
if (failed) process.exitCode = 1;
