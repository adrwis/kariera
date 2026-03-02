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

  // Load careers.json to get all career IDs
  const careers = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/careers.json'), 'utf-8'));
  const ids = careers.map(c => c.id);

  // Test first 15 careers (sample)
  const sample = ids.slice(0, 15);
  let totalCards = 0;
  let totalWithImg = 0;
  const missing = [];

  try {
    for (const id of sample) {
      await page.goto(base + '/kariera/#/zawod/' + id, { waitUntil: 'networkidle' });
      await page.waitForTimeout(5000);

      const cards = await page.locator('.famous-card').evaluateAll(els =>
        els.map(el => ({
          name: el.querySelector('.famous-card__name')?.textContent || '?',
          hasImg: el.querySelector('.famous-card__avatar')?.classList.contains('famous-card__avatar--has-img') || false
        }))
      );

      const withImg = cards.filter(c => c.hasImg).length;
      totalCards += cards.length;
      totalWithImg += withImg;
      const status = withImg === cards.length ? 'OK' : `${withImg}/${cards.length}`;
      process.stdout.write(`${id}: ${status}  `);

      cards.filter(c => !c.hasImg).forEach(c => missing.push(`${id}: ${c.name}`));
    }

    console.log(`\n\nTOTAL: ${totalWithImg}/${totalCards} photos (${Math.round(totalWithImg/totalCards*100)}%)`);
    if (missing.length) {
      console.log('\nMissing photos:');
      missing.forEach(m => console.log('  -', m));
    }
  } catch (e) {
    console.error('FAIL:', e.message);
  }

  await browser.close();
  server.close();
});
