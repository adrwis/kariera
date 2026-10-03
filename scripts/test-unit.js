// Testy jednostkowe czystych funkcji z js/szkoly.js (kalkulator i nazwy klas), bez przeglądarki.
const vm = require('vm');
const fs = require('fs');
const path = require('path');

const noop = () => {};
const sandbox = {
  console,
  document: { addEventListener: noop, getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] },
  window: { innerWidth: 1200, addEventListener: noop },
  location: { pathname: '/', search: '' },
  sessionStorage: { getItem: () => null, setItem: noop, removeItem: noop },
  localStorage: { getItem: () => null, setItem: noop, removeItem: noop },
  addEventListener: noop,
  fetch: () => Promise.reject(new Error('brak sieci w teście')),
};
vm.createContext(sandbox);
const code = fs.readFileSync(path.join(__dirname, '..', 'js', 'szkoly.js'), 'utf8');
vm.runInContext(code + '\n;this.__T = Szkoly._test;', sandbox);
const T = sandbox.__T;

let passed = 0, failed = 0;
function eq(name, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (ok) { console.log(`  OK  ${name}`); passed++; }
  else { console.log(`  FAIL ${name}: jest ${JSON.stringify(got)}, miało być ${JSON.stringify(want)}`); failed++; }
}

console.log('\n=== gradeFor ===');
const full = { pol: 14, mat: 17, ang: 17, obcy2: 8, bio: 14, chem: 8, fiz: 14, geo: 17, hist: 14, inf: 18, wos: 8, tech: 17, plast: 14, wf: 18 };
eq('prosty przedmiot', T.gradeFor('bio', full), 14);
eq('drugi język po kodzie', T.gradeFor('niem', full), 8);
eq('„lub” bierze wyższą', T.gradeFor('ang lub hisz (wyższa ocena)', full), 17);
eq('ukośnik i nawias', T.gradeFor('bio/chem/fiz/geo (najwyższa ocena)', full), 17);
eq('technika po polsku', T.gradeFor('technika', full), 17);
eq('plastyka', T.gradeFor('plastyka', full), 14);
eq('wychowanie fizyczne', T.gradeFor('wychowanie fizyczne', full), 18);
eq('„język obcy” to wyższa z angielskiego i drugiego', T.gradeFor('język obcy (najwyższa ocena)', full), 17);
eq('„gdy brak” bez angielskiego bierze język obcy', T.gradeFor('ang (gdy brak, najwyższa ocena z języka obcego)', { ...full, ang: null }), 8);
eq('„gdy brak” z angielskim bierze angielski', T.gradeFor('ang (gdy brak, najwyższa ocena z języka obcego)', full), 17);
eq('brak jednej z alternatyw daje null', T.gradeFor('inf lub technika (wyższa ocena)', { ...full, tech: null }), null);
eq('nieznany przedmiot daje null', T.gradeFor('łacina klasyczna', full), null);

console.log('\n=== gradePointsFor ===');
const exactClass = { scoredSubjects: ['pol', 'mat', 'bio', 'chem'] };
eq('cztery przedmioty: suma', T.gradePointsFor(exactClass, full), { points: 14 + 17 + 14 + 8, mode: 'exact' });
const missingG = { ...full, chem: null };
const m = T.gradePointsFor(exactClass, missingG);
eq('brak oceny: tryb missing i lista', [m.points, m.mode, m.missing], [null, 'missing', ['chem']]);
eq('nieznane przedmioty: ostrożnie z dwóch najniższych', T.gradePointsFor({ scoredSubjects: [] }, full).points, 14 + 17 + 8 + 8);
const cautiousOnlyRare = T.gradePointsFor({}, { pol: 18, mat: 18, tech: 2, plast: 2, wf: 2 });
eq('technika, plastyka i WF nie liczą się do trybu ostrożnego', [cautiousOnlyRare.points, cautiousOnlyRare.mode], [null, 'missing']);

console.log('\n=== itemLabel ===');
eq('alternatywa', T.itemLabel('ang lub hisz (wyższa ocena)'), 'język angielski lub drugi język obcy');
eq('technika', T.itemLabel('technika'), 'technika');
eq('język obcy', T.itemLabel('język obcy (najwyższa ocena)'), 'język obcy');

console.log('\n=== nazwy klas ===');
const p1 = { name: '1A1 [O] hist-ang-pol (ang-niem*,wlo,hisz*)', extended: ['hist', 'ang', 'pol'] };
eq('etykieta z rozszerzeniami', T.profileLabel(p1), '1A1: historia, angielski, polski');
eq('tytuł tylko symbol', T.profileTitle(p1), '1A1');
const p2 = { name: '1gDW [D] geogr-mat (ang-hisz,niem)', extended: ['geo', 'mat'] };
eq('klasa dwujęzyczna', T.profileLabel(p2), '1gDW (dwujęzyczna): geografia, matematyka');
const p3 = { name: '1b [O] medyczna (ang-fra*,niem)', extended: ['bio', 'chem'] };
eq('opis słowny zostaje', T.profileTitle(p3), '1b medyczna');
const p4 = { name: '1d [O] Technik programista (ang*-niem*)', extended: ['inf'] };
eq('technikum bez kodów', T.profileTitle(p4), '1d Technik programista');
const p5 = { name: 'Klasa 1C[D]h, dwujęzyczna', extended: ['bio'] };
eq('nawias w środku usunięty', T.profileTitle(p5), 'Klasa 1Ch, dwujęzyczna');
eq('zwykła nazwa bez zmian', T.profileTitle({ name: '1a matematyczno-fizyczna' }), '1a matematyczno-fizyczna');

console.log('\n=== isUnfilled ===');
eq('9 z 15 to niepełny nabór', !!T.isUnfilled({ qualified: 9, places: 15 }), true);
eq('13 z 14 to pełny nabór', !!T.isUnfilled({ qualified: 13, places: 14 }), false);
eq('bez danych nie oznaczamy', !!T.isUnfilled({}), false);

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
if (failed) process.exitCode = 1;
