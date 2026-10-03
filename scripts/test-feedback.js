// Test okienka „Czego brakuje?”: ukryte przy wyłączonej konfiguracji, a po jej włączeniu walidacja, zgoda na e-mail,
// wysyłka do Formularza Google (przechwycona) i dostępność (fokus, Esc).
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
    console.log('\n=== Wyłączone w konfiguracji ===');
    const off = await browser.newContext();
    await off.route('**/data/feedback.json', r => r.fulfill({ contentType: 'application/json', body: JSON.stringify({ enabled: false }) }));
    let page = await off.newPage();
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(base);
    await page.waitForTimeout(800);
    check('przycisk w stopce jest ukryty', !(await page.locator('.footer__feedback .feedback-trigger').isVisible()));
    await page.close();

    console.log('\n=== Włączone ===');
    const ctx = await browser.newContext();
    await ctx.route('**/data/feedback.json', r => r.fulfill({ contentType: 'application/json', body: JSON.stringify({ enabled: true, formResponseUrl: 'https://docs.google.com/forms/d/e/TEST/formResponse', entries: { opis: 'entry.2', email: 'entry.3', uwagi: 'entry.4' } }) }));
    const posts = [];
    await ctx.route('https://docs.google.com/forms/**', r => { posts.push(r.request().postData() || ''); r.fulfill({ status: 200, body: '' }); });
    page = await ctx.newPage();
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(base + 'zagranica/?miasto=wieden');
    await page.waitForSelector('.zagr__city');
    check('przycisk widoczny na stronie miasta', await page.locator('.zagr__city .feedback-trigger').isVisible());
    await page.locator('.zagr__city .feedback-trigger').click();
    check('okienko się otwiera i fokus jest w polu opisu', await page.evaluate(() => document.activeElement && document.activeElement.name === 'opis'));
    check('okienko ma rolę dialogu', (await page.locator('.feedback-dialog').getAttribute('role')) === 'dialog');
    await page.keyboard.press('Escape');
    check('Esc zamyka okienko', !(await page.locator('.feedback-overlay').isVisible()));
    check('fokus wraca na przycisk, który otworzył okienko', await page.evaluate(() => document.activeElement && document.activeElement.classList.contains('feedback-trigger')));

    await page.locator('.zagr__city .feedback-trigger').click();
    await page.click('.feedback-send');
    check('pusta treść: komunikat błędu, brak wysyłki', (await page.locator('#fbErr').isVisible()) && posts.length === 0);
    await page.fill('textarea[name=opis]', 'Studia w Oslo');
    await page.fill('input[name=email]', 'ktos@example.com');
    check('po wpisaniu e-maila pojawia się zgoda', await page.locator('#fbConsentRow').isVisible());
    await page.click('.feedback-send');
    check('e-mail bez zgody: brak wysyłki i komunikat', posts.length === 0 && /zgod/i.test(await page.locator('#fbStatus').textContent()));
    await page.check('input[name=zgoda]');
    await page.click('.feedback-send');
    await page.waitForSelector('.feedback-done');
    check('wysłano jedno zgłoszenie z wartościami z formularza', posts.length === 1 && posts[0].includes('Oslo') && posts[0].includes('entry.2') && posts[0].includes('ktos@example.com'));
    check('kontekst miasta i adres strony są w zgłoszeniu', posts[0].includes('Wiede') && posts[0].includes('zagranica'));
    check('wiadomość „Dziękujemy” po wysłaniu', /Dziękujemy/.test(await page.locator('.feedback-done').textContent()));
    await page.click('.feedback-done button');
    await page.locator('.zagr__city .feedback-trigger').click();
    await page.fill('textarea[name=opis]', 'Drugie zgłoszenie');
    await page.click('.feedback-send');
    check('limit: drugie zgłoszenie od razu jest wstrzymane', posts.length === 1 && /Poczekaj/.test(await page.locator('#fbStatus').textContent()));
    await ctx.close();
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
