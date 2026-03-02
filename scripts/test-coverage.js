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

  // Test multiple careers for photo coverage
  const careers = ['psycholog', 'programista', 'lekarz', 'architekt', 'nauczyciel'];
  let totalCards = 0;
  let totalWithImg = 0;

  try {
    for (const career of careers) {
      await page.goto(base + '/kariera/#/zawod/' + career, { waitUntil: 'networkidle' });
      await page.waitForTimeout(6000); // Wait for all API calls (3 strategies)

      const cards = await page.locator('.famous-card').evaluateAll(els =>
        els.map(el => ({
          name: el.querySelector('.famous-card__name')?.textContent || '?',
          hasImg: el.querySelector('.famous-card__avatar')?.classList.contains('famous-card__avatar--has-img') || false
        }))
      );

      const withImg = cards.filter(c => c.hasImg).length;
      totalCards += cards.length;
      totalWithImg += withImg;
      console.log(`${career}: ${withImg}/${cards.length} photos`);
      cards.forEach(c => console.log(`  ${c.hasImg ? 'IMG' : '---'} ${c.name}`));
    }

    console.log(`\nTOTAL: ${totalWithImg}/${totalCards} photos (${Math.round(totalWithImg/totalCards*100)}%)`);
    console.log('JS errors:', errors.length ? errors.join('; ') : 'NONE');
  } catch (e) {
    console.error('FAIL:', e.message);
  }

  await browser.close();
  server.close();
});
