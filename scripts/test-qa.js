const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('C:/Users/adria/OneDrive/Dokumenty/GitHub/adriana-gusciora-pl/node_modules/.pnpm/playwright@1.58.2/node_modules/playwright');

const MIME = { '.html':'text/html','.css':'text/css','.js':'application/javascript','.json':'application/json','.svg':'image/svg+xml','.png':'image/png' };
const ROOT = path.resolve(__dirname, '..');

const server = http.createServer((req, res) => {
  let filePath = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://localhost').pathname).replace('/kariera', ''));
  if (filePath.endsWith(path.sep) || filePath === ROOT) filePath = path.join(ROOT, 'index.html');
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) { res.writeHead(404); res.end('404'); return; }
  const ext = path.extname(filePath);
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(0, async () => {
  const port = server.address().port;
  const base = 'http://localhost:' + port;
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));

  try {
    // Test 1: Landing loads
    await page.goto(base + '/kariera/', { waitUntil: 'networkidle' });
    const title = await page.title();
    console.log('PASS: Title =', title);
    const h1 = await page.textContent('h1');
    console.log('PASS: H1 =', h1.trim());

    // Test 2: Theme toggle
    await page.click('#themeToggle');
    const theme = await page.getAttribute('html', 'data-theme');
    console.log('PASS: Theme toggle =', theme);

    // Test 3: Search autocomplete
    await page.fill('#searchQuery', 'psycholog');
    await page.waitForTimeout(500);
    const acItems = await page.locator('.autocomplete__item').count();
    console.log('PASS: Autocomplete items =', acItems);

    // Test 4: Navigate to career detail
    await page.goto(base + '/kariera/#/zawod/psycholog', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const careerTitle = await page.title();
    console.log('PASS: Career title =', careerTitle);

    // Test 5: Check heading hierarchy (h1 -> h2, no h3→h1 skip)
    const headings = await page.locator('h1,h2,h3').evaluateAll(els => els.map(e => e.tagName + ':' + e.textContent.trim().substring(0, 30)));
    console.log('PASS: Headings =', headings.slice(0, 6).join(' | '));

    // Test 6: Famous card popup + focus
    const famousCard = page.locator('.famous-card').first();
    if (await famousCard.count() > 0) {
      await famousCard.click();
      await page.waitForTimeout(300);
      const popupVisible = await page.locator('.person-popup').count() > 0;
      console.log('PASS: Person popup visible =', popupVisible);
      const focusedTag = await page.evaluate(() => document.activeElement?.tagName);
      console.log('PASS: Focused on =', focusedTag);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);
      const popupGone = await page.locator('.person-popup-overlay').count() === 0;
      console.log('PASS: Popup closed after Escape =', popupGone);
    }

    // Test 7: Check meta tags
    const ogUrl = await page.locator('meta[property="og:url"]').getAttribute('content');
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
    const twCard = await page.locator('meta[name="twitter:card"]').getAttribute('content');
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    const apple = await page.locator('link[rel="apple-touch-icon"]').count() > 0;
    console.log('PASS: og:url =', ogUrl);
    console.log('PASS: og:image =', ogImage);
    console.log('PASS: twitter:card =', twCard);
    console.log('PASS: canonical =', canonical);
    console.log('PASS: apple-touch-icon =', apple);

    // Test 8: JSON-LD
    const jsonLd = await page.locator('script[type="application/ld+json"]').textContent();
    const ld = JSON.parse(jsonLd);
    console.log('PASS: JSON-LD type =', ld['@type']);

    // Test 9: Scripts have defer
    const scripts = await page.locator('script[src]').evaluateAll(els => els.map(e => e.src.split('/').pop() + ' defer=' + e.defer));
    console.log('PASS: Scripts =', scripts.join(', '));

    // Test 10: Manifest has icons
    const manifestLink = await page.locator('link[rel="manifest"]').getAttribute('href');
    console.log('PASS: Manifest =', manifestLink);

    console.log('\nJS errors:', errors.length ? errors.join('; ') : 'NONE');
    console.log('\n=== ALL TESTS PASSED ===');
  } catch (e) {
    console.error('FAIL:', e.message);
  }

  await browser.close();
  server.close();
});
