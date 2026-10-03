// Płace zawodów z oficjalnej publikacji GUS „Struktura wynagrodzeń według zawodów za październik 2024 r.”
// (wyniki/gus-place-2026-10-03.json). Zastępuje dotychczasowe widełki bez daty i źródła.
// GUS publikuje zawody tylko do 3 cyfr KZiS i podaje decyle (nie kwartyle): min = d1, max = d9, median = piąty decyl.
// Zawody, których GUS nie wyodrębnia, tracą kwoty (salary usunięte, salaryNote wyjaśnia dlaczego).
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const gus = JSON.parse(fs.readFileSync(path.join(__dirname, 'wyniki', 'gus-place-2026-10-03.json'), 'utf8'));
const file = path.join(ROOT, 'data', 'careers.json');
const careers = JSON.parse(fs.readFileSync(file, 'utf8'));
const byId = new Map(gus.zawody.map(z => [z.id, z]));
// Po weryfikacji kodów (wyniki/kzis-weryfikacja-2026-10-03.json): ekonomista (263102) leży w grupie GUS 263, tej samej co psycholog,
// a ratownik medyczny (325601) w grupie 325 „Inny średni personel do spraw zdrowia”, której liczb nie mamy, więc bez kwot.
byId.set('ekonomista', { ...byId.get('psycholog'), id: 'ekonomista', szerokoscGrupy: 'szeroka' });
byId.delete('ratownik-medyczny');
const missing = new Set([...gus.brak.map(b => b.id), 'ratownik-medyczny']);
const r = n => Math.round(n);
// Grupy GUS szersze niż sam zawód (np. programiści razem z analitykami, technicy ICT razem z helpdeskiem)
const WIDE = new Set(['programista', 'programista-gier', 'technik-informatyk', 'specjalista-marketingu', 'specjalista-pr']);
// Powody braku kwot per zawód (zamiast jednego zdania dla wszystkich)
const REASON = {};
const why = (ids, text) => ids.forEach(id => { REASON[id] = text; });
why(['psychiatra', 'pediatra', 'chirurg', 'kardiolog'], 'GUS podaje płace lekarzy łącznie, bez podziału na specjalizacje, dlatego nie ma osobnych kwot.');
why(['sedzia', 'prokurator'], 'GUS nie wyodrębnia sędziów i prokuratorów z grupy prawników, dlatego nie ma osobnych kwot.');
why(['adwokat', 'notariusz', 'komornik'], 'Te zawody wykonuje się zwykle na własnej działalności, której badanie GUS nie obejmuje, dlatego nie ma kwot.');
why(['aktor', 'muzyk', 'rezyser-filmowy'], 'Praca na umowach cywilnoprawnych i własnej działalności jest poza badaniem GUS, dlatego nie ma kwot.');
why(['rolnik'], 'Rolnicy pracują głównie na własny rachunek, a badanie GUS obejmuje tylko pracowników etatowych, dlatego nie ma kwot.');
why(['psychoterapeuta', 'fizjoterapeuta', 'pedagog', 'logopeda', 'ratownik-medyczny'], 'GUS nie wyodrębnia tego zawodu z szerszej grupy, dlatego nie ma osobnych kwot.');
why(['projektant-ux', 'tester', 'specjalista-cyberbezpieczenstwa', 'data-scientist', 'devops-engineer'], 'GUS nie wyodrębnia tego zawodu z grupy informatyków, dlatego nie ma osobnych kwot.');
why(['barista', 'pilot-wycieczek', 'stolarz', 'lesnik', 'ogrodnik'], 'GUS nie przypisuje tego zawodu jednoznacznie do jednej grupy, dlatego nie ma kwot.');
const UNIFORMED = new Set(['policjant', 'zolnierz-zawodowy', 'funkcjonariusz-sg', 'strazak']);

let set = 0, cleared = 0;
for (const c of careers) {
  const z = byId.get(c.id);
  if (z) {
    const group = z.grupaGus.replace(/^\d+\s+/, '');
    c.salary = {
      min: r(z.d1), max: r(z.d9), median: r(z.mediana), currency: 'PLN', gross: true, period: 'month',
      asOf: gus.zrodlo.okres, sourceName: 'GUS, Struktura wynagrodzeń według zawodów za październik 2024 r.',
      sourceUrl: gus.zrodlo.stronaUrl, scope: z.szerokoscGrupy === 'waska' && !WIDE.has(c.id) ? 'zawód' : 'grupa', group,
    };
    delete c.salaryNote;
    set++;
  } else if (missing.has(c.id)) {
    delete c.salary;
    c.salaryNote = UNIFORMED.has(c.id)
      ? 'Służby mundurowe nie wchodzą do badania GUS, więc nie podajemy kwot.'
      : (REASON[c.id] || 'GUS nie podaje płac tego zawodu osobno, dlatego nie ma kwot.');
    cleared++;
  }
}
// Kwota z cennika szkolenia nie może przeczyć brakowi kwot w profilu (np. „z wynagrodzeniem ~3500 PLN/mies.”)
const txt = JSON.stringify(careers).replace(/, z wynagrodzeniem ~3500 PLN\/mies\./g, ', z wynagrodzeniem');
fs.writeFileSync(file, JSON.stringify(JSON.parse(txt), null, 2));
console.log('płace z GUS:', set, ', bez kwot:', cleared, ', razem zawodów:', careers.length);
