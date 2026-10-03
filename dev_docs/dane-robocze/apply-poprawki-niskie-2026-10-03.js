// Drobne poprawki z czwartego przeglądu: domeny z błędem certyfikatu TLS w danych szkoleń.
// gestalt.pl przekierowuje na instytutgestalt.pl; irp-fundacja.pl nie działa, więc tytuły czeladnika i mistrza wskazują na
// Związek Rzemiosła Polskiego; kcp.krakow.pl wygasła (przekierowanie na stronę hostingu), więc organizator znika;
// przy zsg.edu.pl (brak działającego https) zostaje sama nazwa szkoły bez linku.
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', '..', 'data', 'careers.json');
const careers = JSON.parse(fs.readFileSync(file, 'utf8'));
let n = 0;
for (const c of careers) {
  const sk = c.skills || {};
  for (const ce of sk.certifications || []) {
    if (/irp-fundacja\.pl/.test(ce.url || '')) { ce.url = 'https://zrp.pl'; n++; }
  }
  for (const t of sk.training || []) {
    t.providers = (t.providers || []).filter(p => !(typeof p === 'object' && /kcp\.krakow\.pl/.test(p.url || '')));
    for (const p of t.providers) {
      if (typeof p !== 'object') continue;
      if (/gestalt\.pl/.test(p.url || '')) { p.url = 'https://instytutgestalt.pl'; n++; }
      if (/zsg\.edu\.pl/.test(p.url || '')) { delete p.url; n++; }
    }
  }
}
fs.writeFileSync(file, JSON.stringify(careers, null, 2));
console.log('adresy poprawione lub usunięte:', n);
