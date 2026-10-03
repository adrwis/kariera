// NextMove — Build script (minification)
// Requires: npm install

const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');

async function build() {
  // Migawka średnich kursów NBP dla przelicznika walut (zapas, gdy NBP nie odpowiada w przeglądarce)
  try { require('child_process').execFileSync(process.execPath, [path.join(__dirname, 'update-kursy.js')], { stdio: 'inherit', timeout: 30000 }); } catch (e) { console.log('  kursy NBP: pominięto'); }
  const jsFiles = ['app.js', 'search.js', 'szkoly.js', 'quiz.js', 'zagranica.js', 'feedback.js', 'animations.js'];
  let totalSaved = 0;

  // Minify JS files
  for (const file of jsFiles) {
    const src = path.join(ROOT, 'js', file);
    const out = path.join(ROOT, 'js', file.replace('.js', '.min.js'));
    const code = fs.readFileSync(src, 'utf-8');
    const result = await esbuild.transform(code, {
      minify: true,
      target: 'es2020',
    });
    fs.writeFileSync(out, result.code);
    const srcSize = fs.statSync(src).size;
    const outSize = fs.statSync(out).size;
    const pct = Math.round((1 - outSize / srcSize) * 100);
    totalSaved += srcSize - outSize;
    console.log(`  js/${file} → ${file.replace('.js', '.min.js')}  (${srcSize} → ${outSize} bytes, -${pct}%)`);
  }

  // Minify CSS
  const cssSrc = path.join(ROOT, 'css', 'style.css');
  const cssOut = path.join(ROOT, 'css', 'style.min.css');
  const cssCode = fs.readFileSync(cssSrc, 'utf-8');
  const cssResult = await esbuild.transform(cssCode, {
    minify: true,
    loader: 'css',
  });
  fs.writeFileSync(cssOut, cssResult.code);
  const cssSrcSize = fs.statSync(cssSrc).size;
  const cssOutSize = fs.statSync(cssOut).size;
  const cssPct = Math.round((1 - cssOutSize / cssSrcSize) * 100);
  totalSaved += cssSrcSize - cssOutSize;
  console.log(`  css/style.css → style.min.css  (${cssSrcSize} → ${cssOutSize} bytes, -${cssPct}%)`);

  // Dane zawodów bez wcięć i bez pól roboczych, których strona nie pokazuje
  const careersSrc = path.join(ROOT, 'data', 'careers.json');
  const careersOut = path.join(ROOT, 'data', 'careers.min.json');
  const careers = JSON.parse(fs.readFileSync(careersSrc, 'utf-8'));
  const dropKeys = new Set(['tuitionNoteRaw']);
  fs.writeFileSync(careersOut, JSON.stringify(careers, (k, v) => (dropKeys.has(k) ? undefined : v)));
  const cSrc = fs.statSync(careersSrc).size;
  const cOut = fs.statSync(careersOut).size;
  totalSaved += cSrc - cOut;
  console.log(`  data/careers.json → careers.min.json  (${cSrc} → ${cOut} bytes, -${Math.round((1 - cOut / cSrc) * 100)}%)`);

  // Statyczne kopie index.html z własnym tytułem i opisem: GitHub Pages zwraca dla nich 200 (a nie 404 z 404.html),
  // a boty podglądów linków i wyszukiwarki widzą właściwe meta. Aplikacja i tak odczytuje ścieżkę ze swojego routera.
  const SITE = 'https://adrwis.github.io/kariera';
  const attrEsc = v => String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const textEsc = v => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const template = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf-8');
  const cut = (txt, n) => (txt.length > n ? txt.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : txt);
  function staticPage(rel, title, desc, h1, text) {
    let html = template
      .replace(/<title>[\s\S]*?<\/title>/, `<title>${textEsc(title)}</title>`)
      .replace(/(<meta name="description" content=")[^"]*(")/, `$1${attrEsc(desc)}$2`)
      .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${attrEsc(title)}$2`)
      .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${attrEsc(desc)}$2`)
      .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${SITE}/${rel}/$2`)
      .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${attrEsc(title)}$2`)
      .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${attrEsc(desc)}$2`)
      .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${SITE}/${rel}/$2`)
      .replace('<main id="main">', `<main id="main"><noscript><p><strong>${textEsc(h1)}</strong></p><p>${textEsc(text)}</p></noscript>`);
    const dir = path.join(ROOT, rel);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), html);
  }
  const pages = [
    ['quiz', 'Quiz zainteresowań | NextMove', 'Odpowiedz na kilka pytań o to, co lubisz, i zobacz zawody, które warto sprawdzić.', 'Quiz zainteresowań', 'Odpowiedz na kilka pytań o to, co lubisz, i zobacz zawody, które warto sprawdzić.'],
    ['kalkulator', 'Kalkulator punktów ósmoklasisty | NextMove', 'Policz punkty rekrutacyjne do szkoły średniej i porównaj je z ostatnimi progami klas.', 'Kalkulator punktów ósmoklasisty', 'Policz punkty rekrutacyjne do szkoły średniej i porównaj je z ostatnimi progami klas.'],
    ['zagranica', 'Studia za granicą | NextMove', 'Studia w stolicach krajów UE, w Londynie i w innych miastach akademickich: kierunki, język, opłaty dla obywateli UE, warunki przyjęcia z polską maturą i terminy z oficjalnych źródeł.', 'Studia za granicą', 'Studia w stolicach krajów UE, w Londynie i w innych miastach akademickich: kierunki, język, opłaty dla obywateli UE, warunki przyjęcia z polską maturą i terminy.'],
    ['zagranica/koszty', 'Koszty życia i akademiki | NextMove', 'Akademiki i przykładowe ceny wynajmu w miastach akademickich za granicą i w Polsce, z miesięcznym budżetem studenta i przeliczeniem walut po kursie NBP.', 'Koszty życia i akademiki', 'Akademiki, przykładowe ceny wynajmu i miesięczny budżet studenta w miastach z zakładki Studia za granicą oraz w dużych miastach akademickich w Polsce.'],
    ['szkoly', 'Szkoły średnie | NextMove', 'Licea i technika w 14 miejscach w Polsce: klasy, przedmioty rozszerzone, wyniki matur i progi punktowe.', 'Szkoły średnie', 'Licea i technika w 14 miejscach w Polsce: klasy, przedmioty rozszerzone, wyniki matur i progi punktowe.'],
  ];
  for (const c of careers) {
    const desc = cut(c.shortDescription || c.fullDescription || '', 200);
    pages.push([`zawod/${c.id}`, `${c.name} | zawód | NextMove`, desc, c.name, desc]);
  }
  fs.rmSync(path.join(ROOT, 'zawod'), { recursive: true, force: true });
  for (const pg of pages) staticPage(...pg);

  // Strona jest ukryta (noindex, bez mapy strony): dostęp mają tylko osoby z adresem
  fs.rmSync(path.join(ROOT, 'sitemap.xml'), { force: true });
  console.log(`  statyczne strony: ${pages.length}`);

  console.log(`\n  Total saved: ${(totalSaved / 1024).toFixed(1)} KB`);
}

build().catch(e => { console.error('Build failed:', e); process.exit(1); });
