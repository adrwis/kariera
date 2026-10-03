// Koszty życia i akademiki: zamienia surowe wyniki agentów (wyniki/koszty-<miasto>-*.json) w pliki strony data/koszty/<miasto>.json
// i listę miast data/koszty/index.json. Miasta za granicą pochodzą z data/zagranica/index.json, polskie z listy POLSKA poniżej.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const SRC = path.join(__dirname, 'wyniki');
const OUT = path.join(ROOT, 'data', 'koszty');
fs.mkdirSync(OUT, { recursive: true });
const { walk } = require('./poprawki-zagranica');

// Duże miasta akademickie w Polsce (slug, nazwa)
const POLSKA = [
  ['warszawa', 'Warszawa'], ['krakow', 'Kraków'], ['wroclaw', 'Wrocław'], ['poznan', 'Poznań'], ['trojmiasto', 'Trójmiasto (Gdańsk, Gdynia, Sopot)'],
  ['lodz', 'Łódź'], ['lublin', 'Lublin'], ['katowice', 'Katowice'], ['szczecin', 'Szczecin'], ['bialystok', 'Białystok'],
  ['torun', 'Toruń'], ['rzeszow', 'Rzeszów'], ['olsztyn', 'Olsztyn'],
];

const num = v => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : (typeof v === 'string' && /^\d+(?:[.,]\d+)?$/.test(v.trim()) ? parseFloat(v.replace(',', '.')) : null));
const txt = v => (v == null ? null : (String(v).trim() || null));
const url = v => (typeof v === 'string' && /^https?:\/\//.test(v) ? v : null);
const CUR = new Set(['EUR', 'PLN', 'CZK', 'HUF', 'SEK', 'DKK', 'RON', 'GBP', 'USD', 'CHF', 'NOK', 'BGN']);
const cur = (v, fallback) => (typeof v === 'string' && CUR.has(v.trim().toUpperCase()) ? v.trim().toUpperCase() : fallback);

function normalize(raw, meta) {
  const currency = cur(raw.currency, meta.currency || 'EUR');
  const dorms = (raw.dorms || []).map(d => ({
    name: txt(d.name), operator: txt(d.operator), url: url(d.url), roomType: txt(d.roomType),
    priceFrom: num(d.priceFrom), priceTo: num(d.priceTo), currency: cur(d.currency, currency), period: txt(d.period) || 'miesiąc',
    includes: txt(d.includes), deposit: txt(d.deposit), eligibility: txt(d.eligibility), applicationInfo: txt(d.applicationInfo),
    applyUrl: url(d.applyUrl), waitlist: txt(d.waitlist), sourceUrl: url(d.sourceUrl), notes: txt(d.notes),
  })).filter(d => d.name && (d.priceFrom != null || d.priceTo != null || d.applicationInfo || d.notes) && d.sourceUrl);
  const rent = (raw.rent || []).map(r => ({
    type: txt(r.type), area: txt(r.area), priceFrom: num(r.priceFrom), priceTo: num(r.priceTo), currency: cur(r.currency, currency),
    period: txt(r.period) || 'miesiąc', year: txt(r.year), includesUtilities: txt(r.includesUtilities), official: r.official !== false,
    source: txt(r.source), sourceUrl: url(r.sourceUrl), notes: txt(r.notes),
  })).filter(r => r.type && (r.priceFrom != null || r.priceTo != null) && r.sourceUrl);
  const b = raw.budget || null;
  const budget = b && (num(b.from) != null || num(b.to) != null) && url(b.sourceUrl)
    ? { from: num(b.from), to: num(b.to), currency: cur(b.currency, currency), period: txt(b.period) || 'miesiąc', text: txt(b.text), sourceUrl: url(b.sourceUrl), official: b.official !== false } : null;
  return {
    slug: meta.slug, name: meta.name, country: meta.country, region: meta.region, currency, retrieved: txt(raw.retrieved) || '',
    summary: (raw.summary || []).map(s => ({ label: txt(s.label), text: txt(s.text) })).filter(s => s.label && s.text),
    budget, dorms, rent,
    gaps: (raw.gaps || raw.luki || []).map(txt).filter(Boolean),
    sources: (raw.sources || []).map(s => ({ url: url(s.url), note: txt(s.note) || '' })).filter(s => s.url),
  };
}

const zIdx = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'zagranica', 'index.json'), 'utf8')).cities;
const METAS = [
  ...zIdx.map(c => ({ slug: c.slug, name: c.name, country: c.country, region: 'zagranica', currency: 'EUR' })),
  ...POLSKA.map(([slug, name]) => ({ slug, name, country: 'Polska', region: 'polska', currency: 'PLN' })),
];
const index = [];
for (const meta of METAS) {
  const file = fs.existsSync(SRC) ? fs.readdirSync(SRC).filter(f => f.startsWith(`koszty-${meta.slug}-`)).sort().pop() : null;
  let data = null;
  if (file) {
    try { data = normalize(JSON.parse(fs.readFileSync(path.join(SRC, file), 'utf8')), meta); } catch (e) { console.log(`  BŁĄD ${meta.slug}: ${e.message}`); }
  }
  if (!data || (!data.dorms.length && !data.rent.length && !data.budget)) {
    index.push({ slug: meta.slug, name: meta.name, country: meta.country, region: meta.region, status: 'w przygotowaniu', dorms: 0, rent: 0, budget: false });
    continue;
  }
  walk(data);
  fs.writeFileSync(path.join(OUT, meta.slug + '.json'), JSON.stringify(data));
  index.push({ slug: meta.slug, name: meta.name, country: meta.country, region: meta.region, status: 'dostępne', currency: data.currency, dorms: data.dorms.length, rent: data.rent.length, budget: !!data.budget });
}
fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify({ cities: index }));
const ok = index.filter(c => c.status === 'dostępne');
console.log(`koszty: ${ok.length} miast z danymi (${ok.filter(c => c.region === 'zagranica').length} za granicą, ${ok.filter(c => c.region === 'polska').length} w Polsce), akademików ${ok.reduce((a, c) => a + c.dorms, 0)}, wierszy wynajmu ${ok.reduce((a, c) => a + c.rent, 0)}`);
