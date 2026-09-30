// Odświeża pole matura we wszystkich plikach szkół z baza/cke_2026.json (lub 2025), np. po poprawce parsera
// (WOS ma w pliku CKE 2026 dwie kolumny: M19-21 i M22; język ukraiński osobno).
const fs = require('fs');
const path = require('path');
const B = path.join(__dirname, 'baza');
const cke = { 2026: JSON.parse(fs.readFileSync(path.join(B, 'cke_2026.json'))), 2025: JSON.parse(fs.readFileSync(path.join(B, 'cke_2025.json'))) };
const URL = y => `https://mapa.wyniki.edu.pl/MapaEgzaminow/assets/data/CSV/EM2023/${y}/EM2023_${y}_szkoly_07.xlsx`;
function matura(rspo) {
  const year = cke[2026][rspo] ? 2026 : cke[2025][rspo] ? 2025 : null;
  if (!year) return null;
  const c = cke[year][rspo];
  return { year, passRate: c.passRate, examinees: c.examinees, certificates: c.certificates, extended: c.extended, sourceUrl: URL(year) };
}
const targets = [
  ...fs.readdirSync(path.resolve(__dirname, '../../data/szkoly')).filter(f => f.endsWith('.json') && f !== 'index.json').map(f => path.resolve(__dirname, '../../data/szkoly', f)),
  ...fs.readdirSync(B).filter(f => /^base_/.test(f)).map(f => path.join(B, f)),
];
for (const p of targets) {
  const raw = JSON.parse(fs.readFileSync(p, 'utf8'));
  const list = Array.isArray(raw) ? raw : raw.schools;
  let n = 0;
  for (const s of list) { s.matura = matura(String(s.rspo)); if (s.matura) n++; }
  fs.writeFileSync(p, Array.isArray(raw) ? JSON.stringify(raw, null, 1) : JSON.stringify(raw));
  console.log(path.basename(p), 'szkół z maturą:', n, 'z WOS:', list.filter(s => s.matura && s.matura.extended.wos).length);
}
