// Fakty w szkoleniach i ścieżkach wejścia sprawdzone w oficjalnych aktach prawnych (wyniki/szkolenia-fakty-2026-10-03.json).
// 1. „do poprawy”: wartość z wyniku audytu (z ręcznie skróconymi tekstami w OVERRIDE).
// 2. „do usunięcia”: kwoty bez podstawy i nieistniejące certyfikaty (np. „Licencja pilota wycieczek”).
// 3. „niepotwierdzone” ceny kursów (rynkowe, bez źródła i daty): usunięte, karta pokazuje wtedy liczbę organizatorów.
// Linki, których nie udało się sprawdzić (TLS, 403), zostają bez zmian.
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', '..', 'data', 'careers.json');
const careers = JSON.parse(fs.readFileSync(file, 'utf8'));
const ver = JSON.parse(fs.readFileSync(path.join(__dirname, 'wyniki', 'szkolenia-fakty-2026-10-03.json'), 'utf8'));

const OVERRIDE = {
  'architekt|skills.training[0].name': 'Praktyka zawodowa (min. 2 lata: 1 rok przy projektowaniu i 1 rok na budowie)',
  'architekt|skills.training[0].description': 'Obowiązkowa praktyka zawodowa pod nadzorem uprawnionego architekta, wymagana do uzyskania uprawnień budowlanych. Obejmuje udział w projektowaniu i nadzorze budowlanym. Odbycie praktyki potwierdza oświadczenie osoby z uprawnieniami, wpisanej na listę członków izby.',
  'lekarz|skills.training[0].price': 'Umowa o pracę na czas określony, zasadnicze wynagrodzenie stażysty 8 458 zł brutto miesięcznie od 1.07.2026',
  'lekarz|skills.training[1].price': 'Rezydentura: wynagrodzenie zasadnicze od 10 595,24 zł do 12 714,29 zł brutto miesięcznie (od 1.07.2026, zależnie od dziedziny i etapu)',
  'sedzia|skills.training[0].price': 'Bezpłatna; aplikant pobiera stypendium: 5 766 zł miesięcznie przez pierwsze 12 miesięcy i 6 366 zł później',
  'prokurator|skills.training[0].price': 'Bezpłatna; aplikant pobiera stypendium: 5 766 zł miesięcznie przez pierwsze 12 miesięcy i 6 366 zł później',
  'nauczyciel-akademicki|skills.training[0].price': 'Bezpłatne; stypendium doktoranckie wynosi od 1.01.2026 co najmniej 3 570,50 zł do oceny śródokresowej i 5 500,50 zł po niej',
  'doradca-podatkowy|skills.training[0].price': 'Egzamin od 1.07.2026: ok. 3 363 zł łącznie (opłata wstępna 480 zł, część pisemna 1 201 zł, ustna 1 682 zł; wyliczenie z przepisów) plus kurs przygotowawczy według oferty',
  'inzynier-budownictwa|skills.training[0].price': 'Opłaty PIIB od jesieni 2026: kwalifikowanie 1 800 zł plus egzamin 1 800 zł (projektowanie albo kierowanie robotami) lub po 2 700 zł (oba zakresy łącznie)',
  'inzynier-budownictwa|skills.training[0].requirements': 'Dyplom studiów odpowiednich dla specjalności oraz praktyka: projektowanie 1 rok przy projektach i 1 rok na budowie, kierowanie robotami 1,5 roku (3 lata po studiach I stopnia), projektowanie i kierowanie razem 1 rok plus 1,5 roku',
};
// Zamiany fragmentów tekstu (stary => nowy), gdy audyt wskazał tylko zdanie do usunięcia lub zmiany
const REPLACE = {
  'lekarz|skills.training[0].description': [[/\s*Kończy się egzaminem LEK\.?/, '']],
  'psycholog|skills.training[0].description': [[/Program zakończony certyfikatem uprawniającym do samodzielnej praktyki\./, 'Certyfikat towarzystwa naukowego nie jest warunkiem prowadzenia praktyki.']],
  'psychoterapeuta|fullDescription': [[/a po studiach musi ukończyć 4[- ]letnie szkolenie psychoterapeutyczne/, 'a po studiach potrzebuje podyplomowego szkolenia psychoterapeutycznego (NFZ wymaga co najmniej 1200 godzin, zwykle trwa ono ok. 4 lat) i zwykle certyfikatu towarzystwa naukowego, choć sam zawód nie jest regulowany ustawą']],
  'biegly-rewident|skills.training[0].description': [[/obejmujący 10 egzaminów z zakresu rachunkowości, rewizji finansowej, prawa i podatków/, 'obejmujący egzaminy z 10 tematów (rachunkowość, rewizja finansowa, prawo, podatki) oraz egzamin dyplomowy']],
};

function parse(p) { return p.replace(/\[(\d+)\]/g, '.$1').split('.'); }
function getParent(obj, keys) { let o = obj; for (const k of keys.slice(0, -1)) { if (o == null) return null; o = o[k]; } return o; }
const stats = { poprawiono: 0, usunieteCeny: 0, usunieteCertyfikaty: 0, pominiete: 0 };
const certRemovals = [];
for (const v of ver) {
  const c = careers.find(x => x.id === v.id);
  if (!c) { stats.pominiete++; continue; }
  const keys = parse(v.pole);
  const parent = getParent(c, keys);
  const last = keys[keys.length - 1];
  const key = v.id + '|' + v.pole;
  if (!parent) { stats.pominiete++; continue; }
  if (v.status === 'do poprawy') {
    if (OVERRIDE[key]) { parent[last] = OVERRIDE[key]; stats.poprawiono++; }
    else if (REPLACE[key]) {
      let t = parent[last];
      for (const [re, to] of REPLACE[key]) t = t.replace(re, to);
      parent[last] = t; stats.poprawiono++;
    } else if (v.proponowanaWartosc && !/^(\.\.\.|Usunąć)/.test(v.proponowanaWartosc)) { parent[last] = v.proponowanaWartosc; stats.poprawiono++; }
    else stats.pominiete++;
  } else if (v.status === 'do usunięcia') {
    if (v.pole.startsWith('skills.certifications[')) certRemovals.push([c, +keys[2]]);
    else if (last === 'price') { delete parent[last]; stats.usunieteCeny++; }
  } else if (v.status === 'niepotwierdzone' && last === 'price') {
    delete parent[last]; stats.usunieteCeny++;
  }
}
// Certyfikaty usuwamy od końca, żeby nie przesunąć indeksów
const done = new Set();
for (const [c, i] of certRemovals.sort((a, b) => b[1] - a[1])) {
  const k = c.id + i; if (done.has(k)) continue; done.add(k);
  c.skills.certifications.splice(i, 1); stats.usunieteCertyfikaty++;
}
fs.writeFileSync(file, JSON.stringify(careers, null, 2));
console.log(JSON.stringify(stats));
