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
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  try {
    // Go to psycholog career detail
    await page.goto(base + '/kariera/#/zawod/psycholog', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000); // Wait for Wikipedia thumbnails

    // Check which cards have images
    const cards = await page.locator('.famous-card').evaluateAll(els =>
      els.map((el, i) => ({
        idx: i,
        name: el.querySelector('.famous-card__name').textContent,
        hasImg: el.querySelector('.famous-card__avatar').classList.contains('famous-card__avatar--has-img')
      }))
    );
    console.log('Famous cards:', JSON.stringify(cards, null, 2));

    // Scroll to famous people section
    await page.evaluate(() => {
      const famous = document.querySelector('.famous-people');
      if (famous) famous.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(ROOT, 'screenshot-famous.png') });
    console.log('Screenshot: screenshot-famous.png');

    // Scroll down to show scroll-to-top button
    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(ROOT, 'screenshot-scrolltop.png') });
    console.log('Screenshot: screenshot-scrolltop.png');

    // Click famous card that has image (or first one)
    const cardWithImg = cards.find(c => c.hasImg);
    const clickIdx = cardWithImg ? cardWithImg.idx : 0;
    await page.evaluate(() => {
      const famous = document.querySelector('.famous-people');
      if (famous) famous.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await page.waitForTimeout(300);
    await page.locator(`.famous-card[data-person-idx="${clickIdx}"]`).click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(ROOT, 'screenshot-popup.png') });
    console.log('Screenshot: screenshot-popup.png (clicked card', clickIdx, '-', cardWithImg ? cardWithImg.name : cards[0]?.name, ')');

  } catch (e) {
    console.error('FAIL:', e.message);
  }

  await browser.close();
  server.close();
});
