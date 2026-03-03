/**
 * NextMove — Accordion tests (workplace + skill)
 * Tests workplace accordion expand/collapse with job links,
 * skill accordion expand/collapse with training links.
 */
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

let pass = 0, fail = 0;

function ok(cond, msg) {
  if (cond) { pass++; console.log('  PASS', msg); }
  else { fail++; console.log('  FAIL', msg); }
}

server.listen(0, async () => {
  const port = server.address().port;
  const base = 'http://localhost:' + port;
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Navigate to psycholog detail page
    await page.goto(base + '/kariera/zawod/psycholog', { waitUntil: 'networkidle' });
    await page.waitForSelector('.career-hero__name');

    console.log('\n=== Workplace Accordion ===');

    // Check workplace items exist
    const wpBtns = await page.$$('.workplace-item--interactive');
    ok(wpBtns.length > 0, `Found ${wpBtns.length} workplace accordion buttons`);

    // First button should be collapsed
    const firstWp = wpBtns[0];
    const expanded1 = await firstWp.getAttribute('aria-expanded');
    ok(expanded1 === 'false', 'First workplace starts collapsed (aria-expanded=false)');

    // Links should be hidden
    const linksHidden = await page.$eval('.workplace-links', el => el.hidden);
    ok(linksHidden === true, 'Job links hidden by default');

    // Click to expand
    await firstWp.click();
    const expanded2 = await firstWp.getAttribute('aria-expanded');
    ok(expanded2 === 'true', 'After click: aria-expanded=true');

    const linksVisible = await page.$eval('.workplace-links', el => el.hidden);
    ok(linksVisible === false, 'After click: job links visible');

    // Check job links content
    const jobLinks = await page.$$('.workplace-links__link');
    ok(jobLinks.length >= 2, `Found ${jobLinks.length} job search links (min 2)`);

    // Check Pracuj.pl and Indeed are always present
    const linkTexts = await page.$$eval('.workplace-links__link', els => els.map(e => e.textContent.trim()));
    ok(linkTexts.some(t => t.includes('Pracuj.pl')), 'Has Pracuj.pl link');
    ok(linkTexts.some(t => t.includes('Indeed')), 'Has Indeed link');

    // Psycholog is "medycyna" category — should have MP Praca
    ok(linkTexts.some(t => t.includes('MP Praca')), 'Medycyna category has MP Praca link');

    // Click again to collapse
    await firstWp.click();
    const expanded3 = await firstWp.getAttribute('aria-expanded');
    ok(expanded3 === 'false', 'After second click: collapsed again');

    const linksHidden2 = await page.$eval('.workplace-links', el => el.hidden);
    ok(linksHidden2 === true, 'After second click: links hidden again');

    console.log('\n=== Skill Accordion ===');

    // Check skill buttons exist
    const skillBtns = await page.$$('.skill-btn');
    ok(skillBtns.length > 0, `Found ${skillBtns.length} skill accordion buttons`);

    // First skill should be collapsed
    const firstSkill = skillBtns[0];
    const sExpanded1 = await firstSkill.getAttribute('aria-expanded');
    ok(sExpanded1 === 'false', 'First skill starts collapsed');

    // Click to expand
    await firstSkill.click();
    const sExpanded2 = await firstSkill.getAttribute('aria-expanded');
    ok(sExpanded2 === 'true', 'After click: skill expanded');

    const sLinksVisible = await firstSkill.evaluate(btn => !btn.nextElementSibling.hidden);
    ok(sLinksVisible, 'Skill training links visible');

    // Check training links
    const sLinks = await page.$$('.skill-links__link');
    ok(sLinks.length >= 3, `Found ${sLinks.length} training links (min 3)`);

    const sLinkTexts = await page.$$eval('.skill-links__link', els => els.map(e => e.textContent.trim()));
    ok(sLinkTexts.some(t => t.includes('Udemy')), 'Has Udemy link');
    ok(sLinkTexts.some(t => t.includes('Coursera')), 'Has Coursera link');
    ok(sLinkTexts.some(t => t.includes('Szkolenia.com')), 'Has Szkolenia.com link');

    // Click to collapse
    await firstSkill.click();
    const sExpanded3 = await firstSkill.getAttribute('aria-expanded');
    ok(sExpanded3 === 'false', 'Skill collapsed after second click');

    console.log('\n=== IT Category (justjoin.it + nofluffjobs) ===');

    // Navigate to an IT career
    await page.goto(base + '/kariera/zawod/programista', { waitUntil: 'networkidle' });
    await page.waitForSelector('.career-hero__name');

    const itWpBtns = await page.$$('.workplace-item--interactive');
    if (itWpBtns.length > 0) {
      await itWpBtns[0].click();
      const itLinks = await page.$$eval('.workplace-links__link', els => els.map(e => e.textContent.trim()));
      ok(itLinks.some(t => t.includes('Just Join IT')), 'IT category has Just Join IT link');
      ok(itLinks.some(t => t.includes('No Fluff Jobs')), 'IT category has No Fluff Jobs link');

      // Technical skills should have LinkedIn Learning
      const techSkillBtns = await page.$$('.career-column__item--tech .skill-btn');
      if (techSkillBtns.length > 0) {
        await techSkillBtns[0].click();
        const techLinks = await page.$$eval('.career-column__item--tech .skill-links__link', els => els.map(e => e.textContent.trim()));
        ok(techLinks.some(t => t.includes('LinkedIn Learning')), 'Technical skill has LinkedIn Learning link');
      } else {
        ok(false, 'No technical skills found for programista');
      }
    } else {
      ok(false, 'No workplace buttons for programista');
    }

    console.log('\n=== Keyboard Navigation ===');

    await page.goto(base + '/kariera/zawod/psycholog', { waitUntil: 'networkidle' });
    await page.waitForSelector('.career-hero__name');

    // Tab to first workplace button and use Enter
    const wpBtn = await page.$('.workplace-item--interactive');
    await wpBtn.focus();
    await page.keyboard.press('Enter');
    const kbExpanded = await wpBtn.getAttribute('aria-expanded');
    ok(kbExpanded === 'true', 'Enter key expands workplace accordion');

    await page.keyboard.press('Space');
    const kbCollapsed = await wpBtn.getAttribute('aria-expanded');
    ok(kbCollapsed === 'false', 'Space key collapses workplace accordion');

    console.log('\n=== Browser Back/Forward ===');

    // Navigate to psycholog, then programista, then back
    await page.goto(base + '/kariera/zawod/psycholog', { waitUntil: 'networkidle' });
    await page.waitForSelector('.career-hero__name');
    const name1 = await page.$eval('.career-hero__name', el => el.textContent);
    ok(name1 === 'Psycholog', 'On psycholog page');

    await page.goto(base + '/kariera/zawod/programista', { waitUntil: 'networkidle' });
    await page.waitForSelector('.career-hero__name');
    const name2 = await page.$eval('.career-hero__name', el => el.textContent);
    ok(name2 === 'Programista', 'Navigated to programista');

    await page.goBack({ waitUntil: 'networkidle' });
    await page.waitForSelector('.career-hero__name');
    const name3 = await page.$eval('.career-hero__name', el => el.textContent);
    ok(name3 === 'Psycholog', 'Browser back returns to psycholog');

  } catch (err) {
    fail++;
    console.log('  FAIL', err.message);
  } finally {
    await browser.close();
    server.close();

    console.log(`\n=== Results: ${pass} passed, ${fail} failed ===\n`);
    process.exit(fail > 0 ? 1 : 0);
  }
});
