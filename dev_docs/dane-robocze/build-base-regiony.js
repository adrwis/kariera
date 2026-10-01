// Rekordy bazowe (RSPO + matura CKE) dla dużych miast i powiatu wejherowskiego.
// Wejście: baza/by-region.json (rspo pogrupowane po powiecie), baza/rspo/<rspo>.json, baza/cke_*.json.
const fs = require('fs');
const path = require('path');
const B = path.join(__dirname, 'baza');
const RET = '2026-10-01';
const LANG = { angielski: 'ang', niemiecki: 'niem', francuski: 'fr', hiszpański: 'hisz', rosyjski: 'ros', włoski: 'wlo' };
const cke = { 2026: JSON.parse(fs.readFileSync(path.join(B, 'cke_2026.json'))), 2025: JSON.parse(fs.readFileSync(path.join(B, 'cke_2025.json'))) };
const CKE_URL = y => `https://mapa.wyniki.edu.pl/MapaEgzaminow/assets/data/CSV/EM2023/${y}/EM2023_${y}_szkoly_07.xlsx`;
const SLUG = { 'Kraków': 'krakow', 'Wrocław': 'wroclaw', 'Łódź': 'lodz', 'Poznań': 'poznan', 'Szczecin': 'szczecin', 'Bydgoszcz': 'bydgoszcz', 'Lublin': 'lublin', 'Białystok': 'bialystok', 'Katowice': 'katowice', 'Powiat wejherowski': 'wejherowo' };
function shortName(name) {
  let m = /\b([IVXLC]+) (?:SPORTOWE |SPOŁECZNE |PRYWATNE |AUTORSKIE |AKADEMICKIE )?LICEUM/.exec(name);
  if (m) return m[1] + ' LO';
  m = /TECHNIKUM(?: [A-ZĄĆĘŁŃÓŚŹŻ]+)* NR (\d+)/.exec(name);
  if (m) return 'Technikum nr ' + m[1];
  return null;
}
const url = w => !w ? null : (w.trim().startsWith('http') ? w.trim() : 'https://' + w.trim());
const byRegion = JSON.parse(fs.readFileSync(path.join(B, 'by-region.json')));
for (const [region, ids] of Object.entries(byRegion)) {
  const slug = SLUG[region];
  const out = [];
  for (const id of ids) {
    const d = JSON.parse(fs.readFileSync(path.join(B, 'rspo', `${id}.json`)));
    if (!(d.studentsNr > 0)) continue;
    const r = String(d.rspo);
    const type = d.institutionType.id === 14 ? 'liceum' : 'technikum';
    let addr = `${d.hqAddressStreet || ''} ${d.hqAddressBuildingNr || ''}`.trim();
    if (d.hqAddressPremiseNr) addr += '/' + d.hqAddressPremiseNr;
    addr += `, ${d.hqAddressZipCode} ${d.hqAddressPostal}`;
    const loc = d.hqAddressLocality ? d.hqAddressLocality.name : '';
    const isCounty = slug === 'wejherowo';
    // W miastach na prawach powiatu RSPO podaje dzielnicę jako „Kraków-Krowodrza” albo samą nazwę dzielnicy
    const district = isCounty ? null : (loc.startsWith(region + '-') ? loc.slice(region.length + 1) : (loc !== region ? loc : null));
    const city = isCounty ? (d.hqAddressPostal || loc) : region;
    const g = d.hqAddressGeotag || {};
    const year = cke[2026][r] ? 2026 : cke[2025][r] ? 2025 : null;
    const c = year && cke[year][r];
    const rec = {
      rspo: d.rspo, type, name: d.name, shortName: shortName(d.name), city, district,
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
  fs.writeFileSync(path.join(B, `base_${slug}.json`), JSON.stringify(out, null, 1));
  console.log(slug.padEnd(10), out.length, 'szkół, z maturą', out.filter(s => s.matura).length, 'dzielnice:', [...new Set(out.map(s => s.district).filter(Boolean))].slice(0, 4).join(', '));
}
