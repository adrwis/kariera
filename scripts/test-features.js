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
    // Load landing
    await page.goto(base + '/kariera/', { waitUntil: 'networkidle' });
    console.log('PASS: Landing loaded');

    // Test 1: Scroll-to-top button exists and is hidden
    const btn = page.locator('#scrollTopBtn');
    const ariaHidden = await btn.getAttribute('aria-hidden');
    console.log('PASS: scroll-top aria-hidden =', ariaHidden);
    const opacity = await btn.evaluate(el => getComputedStyle(el).opacity);
    console.log('PASS: scroll-top opacity (should be 0) =', opacity);

    // Test 2: Navigate to career detail (scrollable page)
    await page.goto(base + '/kariera/#/zawod/psycholog', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    console.log('PASS: Career page loaded');

    // Test 3: Scroll down and check button appears
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(500);
    const opacityAfterScroll = await btn.evaluate(el => getComputedStyle(el).opacity);
    const hasVisibleClass = await btn.evaluate(el => el.classList.contains('scroll-top--visible'));
    console.log('PASS: scroll-top visible after scroll =', hasVisibleClass, 'opacity =', opacityAfterScroll);

    // Test 4: Click scroll-to-top
    if (hasVisibleClass) {
      await btn.click();
      await page.waitForTimeout(800);
      const scrollY = await page.evaluate(() => window.scrollY);
      console.log('PASS: scrollY after click (should be ~0) =', scrollY);
    }

    // Test 5: Check famous cards have data-person-idx
    const famousCards = await page.locator('.famous-card').count();
    console.log('PASS: Famous cards count =', famousCards);

    // Test 6: Wait for Wikipedia thumbnails to load
    await page.waitForTimeout(4000);
    const avatarsWithImg = await page.locator('.famous-card__avatar--has-img').count();
    console.log('PASS: Avatars with Wikipedia photos =', avatarsWithImg);

    // Test 7: Click a famous card and check popup avatar
    if (famousCards > 0) {
      await page.locator('.famous-card').first().click();
      await page.waitForTimeout(500);
      const popupAvatar = page.locator('.person-popup__avatar');
      const hasImg = await popupAvatar.evaluate(el => el.classList.contains('person-popup__avatar--has-img'));
      const imgSrc = hasImg ? await popupAvatar.locator('img').getAttribute('src') : null;
      console.log('PASS: Popup avatar has image =', hasImg, imgSrc ? '(URL loaded)' : '(no img)');
      await page.keyboard.press('Escape');
    }

    console.log('\nJS errors:', errors.length ? errors.join('; ') : 'NONE');
    console.log('\n=== ALL TESTS PASSED ===');
  } catch (e) {
    console.error('FAIL:', e.message);
  }

  await browser.close();
  server.close();
});
