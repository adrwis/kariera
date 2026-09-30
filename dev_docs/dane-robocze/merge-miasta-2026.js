// Scala dane nowych miast (Warszawa, Gdynia, Sopot): rekordy bazowe z RSPO i CKE (baza/base_*.json)
// + profile, progi i opis rekrutacji od agentów (wyniki/wynik-waw-*.json, wynik-trojmiasto.json).
// Szkoły bez uczniów w RSPO pomijamy. Klasy z 0 miejsc w naborze pomijamy (nie wiadomo, czy ruszyły).
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '../..');
const W = path.join(__dirname, 'wyniki');
const B = path.join(__dirname, 'baza');
const RET = '2026-10-01';
const CODES = new Set(['mat','pol','ang','niem','fr','hisz','ros','wlo','bio','chem','fiz','inf','geo','hist','wos','hsz','hmuz','fil','lac']);

const resultFiles = fs.readdirSync(W).filter(f => /^wynik-(waw-|trojmiasto)/.test(f));
const results = new Map();
for (const f of resultFiles) for (const r of JSON.parse(fs.readFileSync(path.join(W, f), 'utf8'))) results.set(r.rspo, r);

// Nazwa oddziału z pliku miasta Warszawy: „1A1 - piłka nożna (męska) - (MS) - geo, ang (ang - niem)”.
// Do wyświetlenia składamy symbol, opis i typ (tylko skróty o pewnym znaczeniu); oryginał zostaje w nameSource.
const TYPE_LABEL = { O: '', D: 'dwujęzyczna', MS: 'mistrzostwa sportowego', S: 'sportowa' };
function prettyName(name) {
  const parts = name.split(' - ');
  if (parts.length < 3) return null;
  const typeIdx = parts.findIndex(x => /^\([A-Za-z/]{1,4}\)$/.test(x.trim()));
  if (typeIdx < 1) return null;
  const code = parts[typeIdx].trim().slice(1, -1);
  const descr = parts.slice(1, typeIdx).map(x => x.trim()).filter(Boolean);
  const label = TYPE_LABEL[code];
  const bits = [parts[0].trim(), ...descr];
  if (label) bits.push(label);
  return 'Klasa ' + bits.join(', ');
}

function cleanProfile(p) {
  const { qualificationsSource, ...rest } = p;
  const pretty = prettyName(rest.name || '');
  if (pretty) { rest.nameSource = rest.name; rest.name = pretty; }
  // Kody spoza słownika przenosimy do „innych rozszerzeń”, żeby filtr działał na samych kodach
  const other = [...(rest.extendedOther || [])];
  rest.extended = (rest.extended || []).filter(c => CODES.has(c) || (other.push(c), false));
  rest.extendedChoice = (rest.extendedChoice || []).map(g => g.filter(c => CODES.has(c))).filter(g => g.length);
  rest.extendedOther = other;
  rest.thresholds = (rest.thresholds || []).filter(t => typeof t.min === 'number' && /^https?:\/\//.test(t.sourceUrl || ''));
  return rest;
}

// Poprawki po raportach agentów (zasada: tylko dane pewne)
const CLEAR_EXTENDED = new Set([478575]);          // TEB Warszawa: rozszerzenia z niedatowanych stron klas
const DROP_PROFILES = new Set([485988]);           // InnEdu: „ścieżki” edukacji domowej, nie oddziały

const index = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/szkoly/index.json'), 'utf8'));
const log = [];
for (const [slug, city] of [['warszawa', 'Warszawa'], ['gdynia', 'Gdynia'], ['sopot', 'Sopot']]) {
  const base = JSON.parse(fs.readFileSync(path.join(B, `base_${city}.json`), 'utf8')).filter(s => s.students > 0);
  let withProfiles = 0, thresholds = 0, done = 0;
  const schools = base.map(({ professionsRspo, ...s }) => {
    const r = results.get(s.rspo);
    if (!r) return s;
    done++;
    let profiles = DROP_PROFILES.has(s.rspo) ? [] : (r.profiles || []).filter(p => /^https?:\/\//.test(p.sourceUrl || '') && p.places !== 0).map(cleanProfile);
    if (CLEAR_EXTENDED.has(s.rspo)) profiles = profiles.map(p => ({ ...p, extended: [], extendedChoice: [] }));
    if (profiles.length) withProfiles++;
    thresholds += profiles.reduce((a, p) => a + p.thresholds.length, 0);
    const out = { ...s, profiles };
    if (r.shortName) out.shortName = r.shortName;
    if (r.url && /^https?:\/\//.test(r.url)) out.url = r.url;
    if (r.district && !s.district) out.district = r.district;
    if (r.admission) out.admission = r.admission;
    return out;
  });
  schools.forEach(s => { index.rspo[s.rspo] = slug; });
  fs.writeFileSync(path.join(ROOT, `data/szkoly/${slug}.json`), JSON.stringify({ city, retrieved: RET, schools }));
  log.push(`${city}: ${schools.length} szkół, z wynikiem agenta ${done}, z klasami ${withProfiles}, progów ${thresholds}`);
}
fs.writeFileSync(path.join(ROOT, 'data/szkoly/index.json'), JSON.stringify(index));
console.log(log.join('\n'));
