// Buduje rekordy szkół (bez profili) z RSPO i CKE dla nowych miast
const fs = require('fs');
const RET = '2026-10-01';
const LANG = { angielski: 'ang', niemiecki: 'niem', francuski: 'fr', hiszpański: 'hisz', rosyjski: 'ros', włoski: 'wlo' };
const cke = { 2026: require('./cke_2026.json'), 2025: require('./cke_2025.json') };
const CKE_URL = y => `https://mapa.wyniki.edu.pl/MapaEgzaminow/assets/data/CSV/EM2023/${y}/EM2023_${y}_szkoly_07.xlsx`;
function shortName(name) {
  let m = /\b([IVXLC]+) (?:SPORTOWE |SPOŁECZNE |PRYWATNE |AUTORSKIE )?LICEUM/.exec(name);
  if (m) return m[1] + ' LO';
  m = /TECHNIKUM(?: [A-ZĄĆĘŁŃÓŚŹŻ]+)* NR (\d+)/.exec(name);
  if (m) return 'Technikum nr ' + m[1];
  return null;
}
const url = w => !w ? null : (w.trim().startsWith('http') ? w.trim() : 'https://' + w.trim());
for (const city of ['Warszawa', 'Gdynia', 'Sopot']) {
  const list = JSON.parse(fs.readFileSync(`list_${city}.json`));
  const out = [];
  for (const it of list) {
    const d = JSON.parse(fs.readFileSync(`rspo/${it.rspo}.json`));
    const r = String(d.rspo);
    const type = d.institutionType.id === 14 ? 'liceum' : 'technikum';
    let addr = `${d.hqAddressStreet} ${d.hqAddressBuildingNr}`.trim();
    if (d.hqAddressPremiseNr) addr += '/' + d.hqAddressPremiseNr;
    addr += `, ${d.hqAddressZipCode} ${d.hqAddressPostal}`;
    const g = d.hqAddressGeotag || {};
    const year = cke[2026][r] ? 2026 : cke[2025][r] ? 2025 : null;
    const c = year && cke[year][r];
    const rec = {
      rspo: d.rspo, type, name: d.name, shortName: shortName(d.name), city,
      district: city === 'Warszawa' ? (d.hqAddressLocality && d.hqAddressLocality.name) : null,
      address: addr.replace(/^al\. Aleja /, 'al. '),
      geo: g.latitude ? { lat: g.latitude, lng: g.longitude } : null,
      url: url(d.website), public: d.publicStatus.id === 1, students: d.studentsNr,
      languages: (d.languageList || []).map(l => LANG[l.name] || l.name),
      specifics: (d.departmentSpecificityList || []).map(s => s.name),
      professionsRspo: type === 'technikum' ? (d.professionRegularList || []).map(p => p.name) : [],
      matura: c ? { year, passRate: c.passRate, examinees: c.examinees, certificates: c.certificates, extended: c.extended, sourceUrl: CKE_URL(year) } : null,
      profiles: [],
      sources: [{ name: 'RSPO, Rejestr Szkół i Placówek Oświatowych', url: `https://rspo.gov.pl/api/Institution/${r}`, retrieved: RET }],
    };
    if (c) rec.sources.push({ name: `CKE Mapa Egzaminów, matura ${year}`, url: CKE_URL(year), retrieved: RET });
    out.push(rec);
  }
  fs.writeFileSync(`base_${city}.json`, JSON.stringify(out, null, 1));
  console.log(city, out.length, 'z maturą 2026:', out.filter(s => s.matura && s.matura.year === 2026).length, 'bez skrótu:', out.filter(s => !s.shortName).length);
}
