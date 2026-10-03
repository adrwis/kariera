// Test zakładki „Za granicą”: render miast, filtry z zachowaniem fokusu, brak poziomego przewijania na telefonie,
// komunikaty o brakach danych, odporność na złośliwe parametry adresu.
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png' };
let passed = 0, failed = 0;
const check = (name, ok, detail) => { if (ok) { console.log(`  OK  ${name}`); passed++; } else { console.log(`  FAIL ${name}${detail ? ': ' + detail : ''}`); failed++; } };

const server = http.createServer((req, res) => {
  let u = decodeURIComponent(req.url.split('?')[0]).replace(/^\/kariera/, '') || '/';
  let f = path.join(ROOT, u);
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  if (!fs.existsSync(f)) f = path.join(ROOT, 'index.html');
  res.setHeader('Content-Type', MIME[path.extname(f)] || 'application/octet-stream');
  res.end(fs.readFileSync(f));
}).listen(0, async () => {
  const base = `http://localhost:${server.address().port}/kariera/`;
  const browser = await chromium.launch();
  const errors = [];
  try {
    const page = await (await browser.newContext({ viewport: { width: 390, height: 800 } })).newPage();
    page.on('pageerror', e => errors.push(e.message));
    const index = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/zagranica/index.json'), 'utf8'));
    await page.goto(base + 'zagranica/');
    await page.waitForSelector('.zagr__card');
    const cards = await page.locator('.zagr__card').count();
    check(`przegląd pokazuje wszystkie miasta (${cards})`, cards === index.cities.length, `${cards} vs ${index.cities.length}`);

    for (const slug of index.cities.filter(c => c.status === 'dostępne').map(c => c.slug)) {
      await page.goto(base + 'zagranica?miasto=' + slug);
      await page.waitForSelector('.zagr__city');
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      check(`${slug}: brak poziomego przewijania na 390 px`, overflow <= 0, `nadmiar ${overflow}px`);
    }

    await page.goto(base + 'zagranica?miasto=wieden');
    await page.waitForSelector('.zagr__city');
    check('filtry są przed opisem miasta', await page.evaluate(() => { const f = document.querySelector('#zagrFilters'), o = document.querySelector('.zagr__overview'); return f && o && (f.compareDocumentPosition(o) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0; }));
    check('opis miasta jest zwinięty', !(await page.locator('.zagr__overview').evaluate(d => d.open)));
    await page.selectOption('#zagrFilters select[name=kierunek]', { index: 1 });
    await page.waitForFunction(() => /kierunek=/.test(location.search));
    await page.waitForTimeout(300);
    check('po zmianie filtra fokus zostaje na filtrze', await page.evaluate(() => document.activeElement && document.activeElement.name === 'kierunek'));
    check('liczba programów się zmienia', /Pokazano \d+ z \d+/.test(await page.locator('#zagrCount').textContent()));

    await page.goto(base + 'zagranica?miasto=wieden&kierunek=nie-ma-takiego');
    await page.waitForSelector('.zagr__city');
    check('nieznany kierunek: komunikat i link „Wyczyść filtry”', await page.locator('.career-column__empty a').count() === 1);

    await page.goto(base + 'zagranica?miasto=%3Cimg%20src%3Dx%20onerror%3Dwindow.__xss%3D1%3E&kierunek=%22%3E%3Cscript%3Ewindow.__xss%3D1%3C%2Fscript%3E');
    await page.waitForTimeout(800);
    check('złośliwe parametry nie wykonują kodu', !(await page.evaluate(() => window.__xss)));

    // Przeliczanie walut: kursy NBP podstawione (EUR 4,00 zł, CZK 0,20 zł), więc wyniki są przewidywalne
    const fx = await browser.newContext({ viewport: { width: 390, height: 800 } });
    await fx.route('https://api.nbp.pl/**', r => r.fulfill({ contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify([{ table: 'A', no: '999/A/NBP/2026', effectiveDate: '2026-10-05', rates: [{ code: 'EUR', mid: 4 }, { code: 'CZK', mid: 0.2 }, { code: 'RON', mid: 0.8 }, { code: 'GBP', mid: 5 }] }]) }));
    const fp = await fx.newPage();
    fp.on('pageerror', e => errors.push(e.message));
    await fp.goto(base + 'zagranica?miasto=praga');
    await fp.waitForSelector('.zagr__city');
    check('kwoty w CZK mają odpowiednik w EUR po kursie NBP', (await fp.locator('.zagr__eur').count()) > 0);
    check('podpowiedź kursu pokazuje datę tabeli NBP', /2026-10-05/.test(await fp.locator('.zagr__eur').first().getAttribute('title')));
    check('informacja o kursie NBP przy filtrach', /2026-10-05/.test(await fp.locator('.zagr__rate-note').textContent()));
    await fp.locator('.zagr__calc > summary').click();
    await fp.fill('#zagrCalc input[name=kwota]', '1 000');
    await fp.selectOption('#zagrCalc select[name=waluta]', 'CZK');
    await fp.waitForFunction(() => /EUR/.test(document.querySelector('#zagrCalcOut').textContent));
    const out = (await fp.locator('#zagrCalcOut').textContent()).replace(/\u00a0/g, ' ');
    check('1 000 CZK = 50 EUR i 200 zł (kurs podstawiony)', /50 EUR/.test(out) && /200 zł/.test(out), out);
    await fp.selectOption('#zagrCalc select[name=waluta]', 'RON');
    await fp.waitForTimeout(150);
    check('1 000 RON = 200 EUR', /200 EUR/.test((await fp.locator('#zagrCalcOut').textContent()).replace(/\u00a0/g, ' ')));
    await fp.fill('#zagrCalc input[name=kwota]', 'abc');
    await fp.waitForTimeout(150);
    check('zła kwota: komunikat zamiast wyniku', /liczb/.test(await fp.locator('#zagrCalcOut').textContent()));
    check('notatka podaje numer tabeli NBP', /999\/A\/NBP\/2026/.test(await fp.locator('#zagrCalcNote').textContent()));
    await fx.close();

    // NBP nie odpowiada: używana jest zapisana kopia kursów
    const off = await browser.newContext({ viewport: { width: 390, height: 800 } });
    await off.route('https://api.nbp.pl/**', r => r.abort());
    const op = await off.newPage();
    op.on('pageerror', e => errors.push(e.message));
    await op.goto(base + 'zagranica?miasto=praga');
    await op.waitForSelector('.zagr__city');
    check('bez odpowiedzi NBP kwoty nadal mają przeliczenie (zapisana kopia kursów)', (await op.locator('.zagr__eur').count()) > 0);
    await off.close();

    const missing = await page.evaluate(async () => {
      const idx = await (await fetch('data/zagranica/index.json')).json();
      return idx.cities.length;
    });
    check('index.json się wczytuje', missing > 0);
  } catch (e) {
    console.error('FAIL:', e.message);
    failed++;
  }
  console.log(`\n${passed} passed, ${failed} failed`);
  console.log('JS errors:', errors.length ? errors.join('; ') : 'NONE');
  if (failed || errors.length) process.exitCode = 1;
  await browser.close();
  server.close();
});
