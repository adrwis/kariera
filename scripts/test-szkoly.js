// Testy widoków szkół średnich (/szkoly, /szkola/<rspo>, sekcja na profilu zawodu)
// i spójności danych w data/szkoly/*.json.
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const MIME = { '.html':'text/html','.css':'text/css','.js':'application/javascript','.json':'application/json','.svg':'image/svg+xml','.png':'image/png' };
const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data', 'szkoly');
const CODES = new Set(['mat','pol','ang','niem','fr','hisz','ros','wlo','bio','chem','fiz','inf','geo','hist','wos','hsz','hmuz','fil','lac']);

let passed = 0;
let failed = 0;
function check(name, condition, detail) {
  if (condition) { console.log(`  OK  ${name}`); passed++; }
  else { console.log(`  FAIL ${name}${detail ? ': ' + detail : ''}`); failed++; }
}

// --- Dane ---
console.log('\n=== Dane ===');
const index = JSON.parse(fs.readFileSync(path.join(DATA, 'index.json'), 'utf8'));
const cityFiles = fs.readdirSync(DATA).filter(f => f.endsWith('.json') && f !== 'index.json');
for (const f of cityFiles) {
  const d = JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8'));
  const slug = f.replace('.json', '');
  const badCodes = [];
  const noSource = [];
  const badThreshold = [];
  for (const s of d.schools) {
    if (index.rspo[s.rspo] !== slug) badCodes.push(`index ${s.rspo}`);
    for (const p of s.profiles || []) {
      for (const c of [...(p.extended || []), ...(p.extendedChoice || []).flat()]) if (!CODES.has(c)) badCodes.push(`${s.rspo} ${p.name}: ${c}`);
      if (!/^https?:\/\//.test(p.sourceUrl || '')) noSource.push(`${s.rspo} ${p.name}`);
      for (const t of p.thresholds || []) {
        if (!(t.min > 0 && t.min <= (t.scale || 200)) || !/^https?:\/\//.test(t.sourceUrl || '')) badThreshold.push(`${s.rspo} ${p.name} ${t.year}`);
      }
    }
  }
  check(`${f}: rozszerzenia tylko jako kody i szkoły w indeksie`, !badCodes.length, badCodes.slice(0, 5).join('; '));
  check(`${f}: każdy profil ma źródło`, !noSource.length, noSource.slice(0, 5).join('; '));
  check(`${f}: progi w skali i ze źródłem`, !badThreshold.length, badThreshold.slice(0, 5).join('; '));
}

// --- Przeglądarka ---
const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  let filePath = path.join(ROOT, urlPath.replace('/kariera', ''));
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) filePath = path.join(ROOT, 'index.html');
  // Opóźnienie danych szkół, żeby sprawdzić wyścigi przy szybkiej nawigacji
  const delay = urlPath.includes('/data/szkoly/') && req.headers['x-slow'] ? 1500 : 0;
  setTimeout(() => {
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  }, delay);
});

server.listen(0, async () => {
  const base = 'http://localhost:' + server.address().port + '/kariera';
  const browser = await browser_();
  async function browser_() { return chromium.launch(); }
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));

  console.log('\n=== Lista szkół ===');
  await page.goto(base + '/szkoly?miasto=gdansk&typ=liceum&rozsz=mat,fiz');
  await page.waitForSelector('#szkolyList li');
  check('deep link z filtrami zaznacza chipy', await page.isChecked('input[name="rozsz"][value="fiz"]') && await page.isChecked('input[name="typ"][value="liceum"]'));
  const countMatFiz = await page.textContent('#szkolyCount');
  check('licznik wyników jest widoczny', /Pasujące szkoły: \d+/.test(countMatFiz), countMatFiz);

  await page.goto(base + '/szkoly?miasto=gdansk&rozsz=ang');
  await page.waitForSelector('#szkolyList li');
  const angNames = await page.$$eval('#szkolyList .result-card__name', els => els.map(e => e.textContent));
  check('filtr „angielski” znajduje klasy dwujęzyczne XX LO', angNames.some(n => /XX LO/.test(n)), angNames.slice(0, 5).join(', '));

  await page.goto(base + '/szkoly?miasto=gdansk&q=zzzz');
  await page.waitForSelector('#szkolyList li');
  check('zero wyników jest ogłaszane w liczniku', /Żadna szkoła/.test(await page.textContent('#szkolyCount')));

  await page.goto(base + '/szkoly?typ=foo&dz=xyz');
  await page.waitForSelector('#szkolyList li');
  check('nieznane parametry są ignorowane', /Pasujące szkoły/.test(await page.textContent('#szkolyCount')));

  console.log('\n=== Strona szkoły ===');
  await page.goto(base + '/szkola/7051/');
  await page.waitForSelector('.szkola h1');
  check('ukośnik na końcu adresu działa', /V LO/.test(await page.textContent('.szkola h1')));
  await page.goto(base + '/szkola/999999');
  await page.waitForSelector('h1:visible');
  check('nieznana szkoła ma noindex', (await page.getAttribute('meta[name="robots"]', 'content')) === 'noindex');

  console.log('\n=== Wyścigi przy szybkiej nawigacji ===');
  const slow = await browser.newPage({ extraHTTPHeaders: { 'x-slow': '1' } });
  slow.on('pageerror', e => errors.push(e.message));
  await slow.goto(base + '/');
  await slow.waitForTimeout(800);
  await slow.evaluate(() => { history.pushState(null, '', '/kariera/szkola/7051'); dispatchEvent(new PopStateEvent('popstate')); });
  await slow.waitForTimeout(100);
  await slow.goBack();
  await slow.waitForTimeout(2500);
  check('tytuł szkoły nie trafia na stronę główną', !/V LO/.test(await slow.title()), await slow.title());

  await slow.goto(base + '/zawod/lekarz');
  await slow.waitForTimeout(300);
  await slow.goBack();
  await slow.goForward();
  await slow.waitForTimeout(7000);
  const sections = (await slow.$$('.career-secondary')).length;
  check('sekcja szkół pojawia się raz', sections === 1, `sekcji: ${sections}`);

  console.log('\n=== Profil zawodu ===');
  await page.goto(base + '/zawod/technik-informatyk');
  await page.waitForSelector('.career-secondary');
  check('technik informatyk ma listę techników', (await page.$$('.career-secondary li')).length > 0);
  await page.click('.career-secondary [data-city="warszawa"]');
  await page.waitForFunction(() => /Warszawie/.test(document.querySelector('.career-secondary h2').textContent));
  check('przełączenie miasta zmienia sekcję', true);
  await page.evaluate(() => localStorage.setItem('kr-miasto', 'gdansk'));

  console.log('\n=== Kalkulator ===');
  await page.goto(base + '/kalkulator?miasto=trojmiasto');
  await page.waitForSelector('#kalkForm');
  await page.fill('[name=pol]', '80');
  await page.fill('[name=mat]', '70');
  await page.fill('[name=obcy]', '90');
  for (const [n, v] of [['gPol', '5'], ['gMat', '5'], ['g1', '4'], ['g2', '5']]) await page.selectOption(`[name=${n}]`, v);
  await page.check('[name=wyr]');
  await page.check('[name=wol]');
  await page.waitForFunction(() => /Z zapasem/.test(document.querySelector('#kalkResults').textContent));
  const pts = await page.textContent('.kalk__points');
  check('wynik liczony według rozporządzenia (154,5 pkt)', /154,5/.test(pts), pts);
  await page.fill('[name=osi]', '40');
  await page.waitForTimeout(400);
  check('osiągnięcia ograniczone do 18 pkt', /172,5/.test(await page.textContent('.kalk__points')));
  await page.evaluate(() => sessionStorage.clear());

  console.log('\n=== Telefon ===');
  const mobile = await browser.newPage({ viewport: { width: 390, height: 800 } });
  for (const u of ['/', '/zawod/lekarz', '/szkoly', '/szkola/7051']) {
    await mobile.goto(base + u);
    await mobile.waitForTimeout(1200);
    const w = await mobile.evaluate(() => document.documentElement.scrollWidth);
    check(`${u} mieści się na ekranie 390 px`, w <= 390, `scrollWidth ${w}`);
  }

  check('brak błędów JS', !errors.length, errors.join(' | '));
  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
  await browser.close();
  server.close();
  process.exit(failed ? 1 : 0);
});
