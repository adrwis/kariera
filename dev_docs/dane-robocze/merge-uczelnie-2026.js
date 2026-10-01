// Wpina aktualizację uczelni (progi 2026, poprawione wiersze, wymagania i czesne na 2026/27)
// z wyniki/wynik-uczelnie-*.json do data/careers.json. Uruchamiać przed zmianą nazw szkół (nazwy są kluczem).
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '../..');
const W = path.join(__dirname, 'wyniki');
const DATA = path.join(ROOT, 'data/careers.json');

const results = [1, 2, 3].map(n => path.join(W, `wynik-uczelnie-${n}.json`)).filter(fs.existsSync)
  .flatMap(f => JSON.parse(fs.readFileSync(f, 'utf8')));
const norm = n => n.replace(/\s+[–—]\s+/g, ', ');
const byKey = new Map(results.map(r => [norm(r.school) + '|' + r.career, r]));
const isUrl = u => typeof u === 'string' && /^https?:\/\/\S+$/.test(u);

// Wartości odstające (WUM, PŁ, AKF) przywrócone decyzją Ady 2026-10-01: lista wyjątków jest pusta.
const DROP = [];
// Politechnika Krakowska publikuje tylko „wymaganą liczbę punktów” (minimum), nie wynik ostatniej osoby przyjętej
const dropped = (r, t) => /^Politechnika Krakowska/.test(r.school)
  || DROP.some(([re, career, year]) => re.test(r.school) && r.career === career && t.year === year);

// Rozstrzygnięcia po raportach agentów
function adjust(r, type, t) {
  if (/Akademia Pożarnicza/.test(r.school) && t.scaleMax) {
    return { ...t, scaleMax: undefined, scaleFormula: 'punkty rekrutacyjne Akademii Pożarniczej, uczelnia nie podaje maksimum' };
  }
  if (/SGGW/.test(r.school) && r.career === 'weterynarz' && t.year === 2025) return { ...t, scaleMax: 80 };
  if (/^AGH/.test(r.school) && t.year === 2026) return { ...t, round: (t.round ? t.round + ', ' : '') + 'nowy wzór punktacji, nie porównuj wprost z latami wcześniejszymi' };
  return t;
}

function cleanThreshold(t) {
  const out = { year: t.year, points: t.points };
  if (t.scaleMax) out.scaleMax = t.scaleMax; else if (t.scaleFormula) out.scaleFormula = t.scaleFormula;
  out.sourceUrl = t.sourceUrl;
  if (t.round) out.round = t.round;
  return out;
}

const data = JSON.parse(fs.readFileSync(DATA, 'utf8'));
const log = { entries: 0, modesUpdated: 0, thresholds2026: 0, rowFixes: [], reqUpdated: 0, reqYear: 0, tuitionUpdated: 0, programs: 0, missing: 0 };
for (const c of data) {
  for (const s of c.education.schools) {
    const r = byKey.get(norm(s.name) + '|' + c.id);
    if (!r) { log.missing++; continue; }
    log.entries++;
    if (r.program && r.program !== s.program) { s.program = r.program; log.programs++; }
    for (const m of s.modes || []) {
      const fix = r.thresholdsFix && r.thresholdsFix[m.type];
      if (!Array.isArray(fix) || !fix.length) continue;
      const valid = fix.filter(t => !dropped(r, t)).map(t => adjust(r, m.type, t))
        .filter(t => typeof t.points === 'number' && isUrl(t.sourceUrl) && (t.scaleMax || t.scaleFormula));
      if (!valid.length) { if (/^Politechnika Krakowska/.test(r.school)) m.thresholds = []; continue; }
      m.thresholds = valid.map(cleanThreshold).sort((a, b) => a.year - b.year);
      log.modesUpdated++;
      log.thresholds2026 += m.thresholds.filter(t => t.year === 2026).length;
    }
    if (r.rowFix) log.rowFixes.push(`${c.id} | ${s.name}`);
    const q = r.requirements || {};
    if (q.status === 'updated' && isUrl(q.sourceUrl)) {
      if (q.display) s.requirements = q.display;
      if (q.structured) s.requirementsStructured = q.structured;
      if (q.exam !== undefined) { if (q.exam) s.exam = q.exam; else delete s.exam; }
      s.requirementsSource = q.sourceUrl;
      s.requirementsYear = q.academicYear || s.requirementsYear;
      log.reqUpdated++;
    } else if (q.status === 'unchanged' && isUrl(q.sourceUrl) && q.academicYear) {
      s.requirementsSource = q.sourceUrl;
      s.requirementsYear = q.academicYear;
      log.reqYear++;
    }
    for (const t of r.tuition || []) {
      if (t.status !== 'updated' || !isUrl(t.sourceUrl) || !t.display) continue;
      const m = (s.modes || []).find(x => x.type === t.type);
      if (!m) continue;
      m.paid = true;
      m.tuition = t.display.replace(/(\d)\s(\d{3})/g, '$1$2');
      m.tuitionSource = t.sourceUrl;
      m.tuitionYear = t.academicYear || m.tuitionYear;
      if (t.tuitionNote) m.tuitionNote = t.tuitionNote;
      log.tuitionUpdated++;
    }
  }
}
fs.writeFileSync(DATA, JSON.stringify(data, null, 2));
console.log(JSON.stringify({ ...log, rowFixes: log.rowFixes.length, rowFixList: log.rowFixes }, null, 1));
