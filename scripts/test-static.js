// Testy statycznych stron i plików wdrożenia (wynik `npm run build`): meta każdej strony zawodu, ukrycie przed wyszukiwarkami, pliki z sw.js.
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

console.log('\n=== Ukrycie strony (tylko dla osób z adresem) ===');
check('brak sitemap.xml', !fs.existsSync(path.join(ROOT, 'sitemap.xml')));
check('robots.txt nie wskazuje mapy strony', !/sitemap/i.test(read('robots.txt')));
const staticHtml = ['index.html', '404.html', ...fs.readdirSync(ROOT).filter(d => fs.existsSync(path.join(ROOT, d, 'index.html')) && d !== 'node_modules').map(d => d + '/index.html')];
const zawodDir = path.join(ROOT, 'zawod');
if (fs.existsSync(zawodDir)) fs.readdirSync(zawodDir).forEach(d => staticHtml.push(`zawod/${d}/index.html`));
const open = staticHtml.filter(f => fs.existsSync(path.join(ROOT, f)) && !/<meta name="robots" content="noindex, nofollow/.test(read(f)));
check(`każda z ${staticHtml.length} stron ma noindex`, !open.length, open.slice(0, 3).join(', '));

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
const staticDirs = fs.readdirSync(ROOT).filter(d => fs.existsSync(path.join(ROOT, d, 'index.html')) && d !== 'node_modules');
const notCopied = staticDirs.filter(d => !new RegExp('cp -r[^\\n]*\\b' + d + '\\b').test(wf));
check(`CI kopiuje każdy katalog ze stronami statycznymi (${staticDirs.join(', ')})`, !notCopied.length, notCopied.join(', '));

console.log('\n=== Studia za granicą ===');
const zIndex = JSON.parse(read('data/zagranica/index.json')).cities;
check(`lista miast: ${zIndex.length} (26 stolic UE bez Warszawy i Londyn)`, zIndex.length === 27 && zIndex.some(c => c.slug === 'londyn'));
const zBad = [];
let zPrograms = 0;
for (const c of zIndex.filter(c => c.status === 'dostępne')) {
  const f = `data/zagranica/${c.slug}.json`;
  if (!fs.existsSync(path.join(ROOT, f))) { zBad.push(`${c.slug}: brak pliku`); continue; }
  const d = JSON.parse(read(f));
  const blob = JSON.stringify(d);
  if (/WebFetch|scratchpad|wyniki wyszukiwania/i.test(blob)) zBad.push(`${c.slug}: żargon narzędzi w danych`);
  if (/[—–]/.test(blob)) zBad.push(`${c.slug}: długi myślnik`);
  for (const u of d.universities) for (const p of u.programs) {
    zPrograms++;
    if (!/^https?:\/\//.test(p.url || p.applyUrl || '')) zBad.push(`${c.slug}: ${p.name} bez linku do programu`);
    if (!p.academicYear) zBad.push(`${c.slug}: ${p.name} bez roku akademickiego`);
  }
  if (c.programs !== d.universities.reduce((a, u) => a + u.programs.length, 0)) zBad.push(`${c.slug}: liczba programów w indeksie niezgodna`);
}
check(`dane miast: ${zPrograms} programów z linkiem, rokiem akademickim i bez żargonu`, !zBad.length, zBad.slice(0, 4).join('; '));
check('strony zagranica/ i zagranica/koszty/ istnieją', fs.existsSync(path.join(ROOT, 'zagranica', 'index.html')) && fs.existsSync(path.join(ROOT, 'zagranica', 'koszty', 'index.html')));

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
if (failed) process.exitCode = 1;
