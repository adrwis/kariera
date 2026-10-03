// Kody KZiS po weryfikacji w obowiązującym rozporządzeniu MRPiPS z 21.10.2025 (Dz.U. 2025 poz. 1534), wyniki w
// wyniki/kzis-weryfikacja-2026-10-03.json. 41 kodów było błędnych (inne zawody pod tym numerem), 21 poprawnych, 17 zawodów
// nie ma w klasyfikacji pod jedną nazwą (tylko specjalizacje albo pozycje „gdzie indziej niesklasyfikowani”): ich kodu
// nie pokazujemy na stronie (codeUnverified), żeby nie podawać numeru, którego nie umiemy obronić.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const ver = JSON.parse(fs.readFileSync(path.join(__dirname, 'wyniki', 'kzis-weryfikacja-2026-10-03.json'), 'utf8'));
const careersFile = path.join(ROOT, 'data', 'careers.json');
const kzisFile = path.join(ROOT, 'data', 'kzis-index.json');
const careers = JSON.parse(fs.readFileSync(careersFile, 'utf8'));
const kzis = JSON.parse(fs.readFileSync(kzisFile, 'utf8'));
const byId = new Map(ver.zawody.map(z => [z.id, z]));

let changed = 0, unverified = 0;
for (const c of careers) {
  const v = byId.get(c.id);
  if (!v) continue;
  if (v.status === 'poprawny kod inny' && v.kodPoprawny) {
    const e = kzis.find(k => k.id === c.id);
    if (e) e.code = v.kodPoprawny;
    c.code = v.kodPoprawny;
    delete c.codeUnverified;
    changed++;
  } else if (v.status === 'niejednoznaczny') {
    c.codeUnverified = true;
    const e = kzis.find(k => k.id === c.id);
    if (e) e.codeUnverified = true;
    unverified++;
  } else {
    delete c.codeUnverified;
  }
}
// Wpisy indeksu KZiS bez profilu mają kody z naszej własnej listy (co najmniej 36 z 38 niezgodnych z rozporządzeniem z 2025),
// więc strona pokazuje przy nich tylko grupę, bez numeru, dopóki nie zostaną zweryfikowane.
for (const k of kzis) if (!k.id) k.codeUnverified = true;
// Wpisy KZiS bez profilu, które po zmianach dzielą kod z profilem, nie mogą go dublować
const richCodes = new Set(careers.filter(c => !c.codeUnverified).map(c => c.code));
const before = kzis.length;
const cleaned = kzis.filter(k => k.id || !richCodes.has(k.code));
const dupes = new Map();
for (const c of careers) dupes.set(c.code, (dupes.get(c.code) || 0) + 1);
fs.writeFileSync(careersFile, JSON.stringify(careers, null, 2));
fs.writeFileSync(kzisFile, '[\n' + cleaned.map(x => '  ' + JSON.stringify(x)).join(',\n') + '\n]\n');
console.log('kody zmienione:', changed, ', niejednoznaczne (bez pokazywania kodu):', unverified, ', usunięte duplikaty w indeksie KZiS:', before - cleaned.length);
console.log('powtórzone kody między profilami:', [...dupes].filter(([, n]) => n > 1).map(([k]) => k).join(', ') || 'brak');
