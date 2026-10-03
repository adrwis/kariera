// Zapisuje migawkę średnich kursów NBP (tabela A) do data/zagranica/kursy.json.
// Strona pobiera kursy na żywo z api.nbp.pl, a ta migawka jest zapasem, gdy NBP nie odpowiada.
// Uruchamiane przy `npm run build`; bez sieci zostaje poprzednia migawka.
const fs = require('fs');
const path = require('path');
const https = require('https');

const OUT = path.join(__dirname, '..', 'data', 'zagranica', 'kursy.json');
const CODES = ['EUR', 'CZK', 'HUF', 'SEK', 'DKK', 'RON', 'GBP', 'USD', 'CHF', 'NOK', 'BGN'];

https.get('https://api.nbp.pl/api/exchangerates/tables/A/?format=json', { timeout: 15000, headers: { Accept: 'application/json' } }, res => {
  let body = '';
  res.on('data', c => (body += c));
  res.on('end', () => {
    try {
      const t = JSON.parse(body)[0];
      const rates = {};
      for (const r of t.rates) if (CODES.includes(r.code)) rates[r.code] = r.mid;
      if (!rates.EUR) throw new Error('brak EUR');
      fs.writeFileSync(OUT, JSON.stringify({ effectiveDate: t.effectiveDate, table: t.no, source: 'NBP, tabela A (kursy średnie)', rates }) + '\n');
      console.log(`  kursy NBP: tabela ${t.no} z ${t.effectiveDate}, EUR = ${rates.EUR} zł`);
    } catch (e) { console.log('  kursy NBP: nie udało się zapisać (' + e.message + '), zostaje poprzednia migawka'); }
  });
}).on('error', e => console.log('  kursy NBP: brak sieci (' + e.message + '), zostaje poprzednia migawka')).on('timeout', function () { this.destroy(); });
