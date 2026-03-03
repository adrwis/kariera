const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('C:/Users/adria/OneDrive/Dokumenty/GitHub/adriana-gusciora-pl/node_modules/.pnpm/playwright@1.58.2/node_modules/playwright');

const MIME = { '.html':'text/html','.css':'text/css','.js':'application/javascript','.json':'application/json','.svg':'image/svg+xml','.png':'image/png' };
const ROOT = path.resolve(__dirname, '..');

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  let filePath = path.join(ROOT, urlPath.replace('/kariera', ''));
  if (filePath.endsWith(path.sep) || filePath === ROOT) filePath = path.join(ROOT, 'index.html');
  // SPA fallback: serve index.html for /kariera/ subpaths that don't match files
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    if (urlPath.startsWith('/kariera/')) {
      filePath = path.join(ROOT, 'index.html');
    } else {
      res.writeHead(404); res.end('404'); return;
    }
  }
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

  let passed = 0;
  let failed = 0;

  function check(name, condition) {
    if (condition) { console.log(`  OK  ${name}`); passed++; }
    else { console.log(`  FAIL ${name}`); failed++; }
  }

  try {
    // Test 1: Landing page loads
    await page.goto(base + '/kariera/', { waitUntil: 'networkidle' });
    const title = await page.title();
    check('Landing title', title.includes('NextMove'));

    // Test 2: Direct URL to career detail (pushState route)
    await page.goto(base + '/kariera/zawod/psycholog', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const h1 = await page.locator('.career-hero__name').textContent().catch(() => '');
    check('Career detail renders', h1.includes('Psycholog'));
    check('URL is clean (no hash)', !page.url().includes('#'));
    check('URL path correct', page.url().includes('/kariera/zawod/psycholog'));

    // Test 3: Back link works (pushState navigation)
    const backHref = await page.locator('.results__back').first().getAttribute('href');
    check('Back link uses /kariera/', backHref.startsWith('/kariera/'));

    // Test 4: Navigate via popular tag from landing
    await page.goto(base + '/kariera/', { waitUntil: 'networkidle' });
    const tagHref = await page.locator('.popular__tag').first().getAttribute('href');
    check('Popular tag href uses /kariera/', tagHref.startsWith('/kariera/'));
    await page.click('.popular__tag');
    await page.waitForTimeout(2000);
    check('After tag click, URL has /kariera/', page.url().includes('/kariera/'));
    check('After tag click, no hash', !page.url().includes('#'));

    // Test 5: Search form navigates correctly
    await page.goto(base + '/kariera/', { waitUntil: 'networkidle' });
    await page.fill('#searchQuery', 'programista');
    // Close autocomplete first, then submit
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    await page.click('#searchBtn');
    await page.waitForTimeout(1000);
    check('Search URL has /kariera/wyniki', page.url().includes('/kariera/wyniki'));
    check('Search URL has query', page.url().includes('q=programista'));

    // Test 6: Old hash URL backwards compat
    await page.goto(base + '/kariera/#/zawod/lekarz', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const h1_6 = await page.locator('.career-hero__name').textContent().catch(() => '');
    check('Hash compat: career renders', h1_6.includes('Lekarz'));

    // Test 7: Category link in detail
    await page.goto(base + '/kariera/zawod/psycholog', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const catLink = await page.locator('.career-hero__category').getAttribute('href').catch(() => '');
    check('Category link uses /kariera/', catLink.startsWith('/kariera/'));

    // Test 8: Browser back button works
    await page.goto(base + '/kariera/', { waitUntil: 'networkidle' });
    await page.click('.popular__tag');
    await page.waitForTimeout(2000);
    const urlBefore = page.url();
    await page.goBack();
    await page.waitForTimeout(1000);
    check('Browser back works', page.url() !== urlBefore);
    check('Browser back to landing', page.url().includes('/kariera/') && !page.url().includes('/zawod/'));

    // Test 9: Filter button works
    await page.goto(base + '/kariera/', { waitUntil: 'networkidle' });
    await page.click('.filters__cat-chip[data-cat="it"]');
    await page.click('#filterBtn');
    await page.waitForTimeout(1000);
    check('Filter URL has /kariera/wyniki', page.url().includes('/kariera/wyniki'));
    check('Filter URL has filter params', page.url().includes('filter=1'));

    // Test 10: Filter state persistence via sessionStorage
    // After filtering (test 9), sessionStorage should have kr-filters
    const savedFilters = await page.evaluate(() => sessionStorage.getItem('kr-filters'));
    check('Filter state saved to sessionStorage', savedFilters !== null && savedFilters.includes('it'));

    // Navigate to a career, then back to landing — filters should restore
    await page.click('.result-card');
    await page.waitForTimeout(2000);
    await page.goBack(); // back to results
    await page.waitForTimeout(500);
    await page.goBack(); // back to landing
    await page.waitForTimeout(1000);
    const itChipActive = await page.locator('.filters__cat-chip[data-cat="it"]').getAttribute('class');
    check('Filter state restored on landing', itChipActive.includes('filters__cat-chip--active'));

    // Test 11: Reset clears sessionStorage
    await page.click('#filterReset');
    await page.waitForTimeout(200);
    const afterReset = await page.evaluate(() => sessionStorage.getItem('kr-filters'));
    check('Reset clears filter state', afterReset === null);

    console.log(`\n${passed} passed, ${failed} failed`);
    console.log('JS errors:', errors.length ? errors.join('; ') : 'NONE');
  } catch (e) {
    console.error('FAIL:', e.message);
    console.log('JS errors:', errors.length ? errors.join('; ') : 'NONE');
  }

  await browser.close();
  server.close();
});
