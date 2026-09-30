// Dopisuje uczelnie trójmiejskie (wyniki/wynik-tri-uczelnie-*.json) do zawodów w data/careers.json.
// Pomija wpisy już istniejące (ta sama nazwa szkoły w zawodzie) i dopasowania oznaczone przez agenta jako naciągane.
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '../..');
const W = path.join(__dirname, 'wyniki');
const DATA = path.join(ROOT, 'data/careers.json');
const isUrl = u => typeof u === 'string' && /^https?:\/\/\S+$/.test(u);
const SKIP = [['pracownik-ochrony', /./]]; // UG Bezpieczeństwo narodowe, AMW Bezpieczeństwo wewnętrzne: dopasowanie na granicy

const entries = [1, 2].map(n => path.join(W, `wynik-tri-uczelnie-${n}.json`)).filter(fs.existsSync)
  .flatMap(f => JSON.parse(fs.readFileSync(f, 'utf8')));
const data = JSON.parse(fs.readFileSync(DATA, 'utf8'));
const byId = new Map(data.map(c => [c.id, c]));
let added = 0, thresholds = 0, skipped = 0;
for (const e of entries) {
  const c = byId.get(e.career);
  if (!c || SKIP.some(([id, re]) => id === e.career && re.test(e.name))) { skipped++; continue; }
  if (c.education.schools.some(s => s.name === e.name && (s.program || '') === (e.program || ''))) continue;
  const modes = (e.modes || []).map(m => {
    const out = { type: m.type, paid: !!m.paid };
    if (m.paid && m.tuition && isUrl(m.tuitionSource)) {
      out.tuition = String(m.tuition).replace(/(\d)\s(\d{3})/g, '$1$2');
      out.tuitionSource = m.tuitionSource;
      if (m.tuitionYear) out.tuitionYear = m.tuitionYear;
      if (m.tuitionNote) out.tuitionNote = m.tuitionNote;
    }
    out.thresholds = (m.thresholds || [])
      .filter(t => typeof t.points === 'number' && isUrl(t.sourceUrl) && (t.scaleMax || t.scaleFormula))
      .map(t => {
        const o = { year: t.year, points: t.points };
        if (t.scaleMax) o.scaleMax = t.scaleMax; else o.scaleFormula = t.scaleFormula;
        o.sourceUrl = t.sourceUrl;
        if (t.round) o.round = t.round;
        return o;
      })
      .sort((a, b) => a.year - b.year);
    thresholds += out.thresholds.length;
    return out;
  });
  const school = { name: e.name, url: isUrl(e.url) ? e.url : undefined, city: e.city, program: e.program };
  if (isUrl(e.requirementsSource)) {
    school.requirements = e.requirements || [];
    school.requirementsStructured = e.requirementsStructured || [];
    if (e.exam) school.exam = e.exam;
    school.requirementsSource = e.requirementsSource;
    school.requirementsYear = e.requirementsYear;
  } else {
    school.requirements = [];
  }
  school.modes = modes;
  c.education.schools.push(school);
  added++;
}
fs.writeFileSync(DATA, JSON.stringify(data, null, 2));
console.log(`dopisane wpisy: ${added}, progi: ${thresholds}, pominięte: ${skipped}`);
