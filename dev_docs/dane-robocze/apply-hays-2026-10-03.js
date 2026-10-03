// Raport płacowy Hays Poland 2026 (oferty z rekrutacji 2025, brutto miesięcznie, pełny etat, średnie i duże firmy) jako OSOBNA
// perspektywa obok płac GUS, zgodnie z wnioskami z dev_docs/dane-robocze/wyniki/raporty-plac-wnioski.md:
//  - salaryMarket: 14 zawodów z dobrym dopasowaniem roli (5 z nich nie ma kwot GUS), liczby nie wchodzą do pola salary;
//  - salary.caveat: ostrzeżenie tam, gdzie grupa GUS słabo opisuje zawód.
// „Najczęściej oferowana kwota” to kolumna Opt raportu, nie mediana. Uruchamiać po apply-place-gus.js.
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', '..', 'data', 'careers.json');
const careers = JSON.parse(fs.readFileSync(file, 'utf8'));
const hays = JSON.parse(fs.readFileSync(path.join(__dirname, 'wyniki', 'raporty-plac-hays-2026-10-03.json'), 'utf8'));
const byId = new Map(hays.dopasowania.map(d => [d.zawodId, d]));

const MARKET = ['programista', 'administrator-systemow', 'ksiegowy', 'doradca-podatkowy', 'specjalista-hr', 'specjalista-marketingu', 'prawnik',
  'architekt', 'inzynier-budownictwa', 'tester', 'projektant-ux', 'specjalista-cyberbezpieczenstwa', 'data-scientist', 'devops-engineer'];
const CAVEAT = {
  ekonomista: 'GUS zalicza ekonomistów do grupy, w której są też psycholodzy, socjologowie i pracownicy socjalni, więc ta kwota jest tylko orientacyjna.',
  'doradca-podatkowy': 'GUS podaje płace wszystkich specjalistów od finansów, więc dla doradcy podatkowego ta kwota jest tylko orientacyjna.',
  'biegly-rewident': 'GUS podaje płace wszystkich specjalistów od finansów, a biegli rewidenci w firmach audytorskich zwykle zarabiają wyraźnie więcej.',
  fryzjer: 'Liczba dotyczy grupy zawodów razem z kosmetyczkami. GUS bada tylko firmy od 10 osób, a w tym zawodzie wiele osób pracuje w małych salonach, gdzie płace mogą być niższe.',
  kosmetyczka: 'Liczba dotyczy grupy zawodów razem z fryzjerami. GUS bada tylko firmy od 10 osób, a w tym zawodzie wiele osób pracuje w małych gabinetach, gdzie płace mogą być niższe.',
  piekarz: 'Liczba dotyczy całej grupy robotników przetwórstwa spożywczego. GUS bada tylko firmy od 10 osób, a w małych piekarniach płace mogą być niższe.',
  cukiernik: 'Liczba dotyczy całej grupy robotników przetwórstwa spożywczego. GUS bada tylko firmy od 10 osób, a w małych cukierniach płace mogą być niższe.',
  kucharz: 'GUS bada tylko firmy od 10 osób, a w małych lokalach gastronomicznych płace mogą być niższe.',
  'inzynier-budownictwa': 'GUS podaje płace wszystkich inżynierów razem z kierownikami i doświadczonymi specjalistami, więc inżynier na początku kariery może zarabiać mniej.',
};
let market = 0, caveats = 0;
for (const c of careers) {
  delete c.salaryMarket;
  const d = byId.get(c.id);
  if (MARKET.includes(c.id) && d && d.haysMin && d.haysMid && d.haysMax) {
    const roles = [...new Set((d.rolaRdzeniowa || []).map(r => r.replace(/\s*\(s\. \d+\)$/, '')))].slice(0, 3);
    c.salaryMarket = { min: d.haysMin, typical: d.haysMid, max: d.haysMax, roles, year: 2025, sourceName: 'Hays Poland, Raport płacowy 2026', sourceUrl: 'https://www.hays.pl/raport-placowy' };
    market++;
  }
  if (c.salary) { delete c.salary.caveat; if (CAVEAT[c.id]) { c.salary.caveat = CAVEAT[c.id]; caveats++; } }
}
fs.writeFileSync(file, JSON.stringify(careers, null, 2));
console.log('rynek ofert (Hays):', market, 'zawodów; ostrzeżenia przy płacach GUS:', caveats);
