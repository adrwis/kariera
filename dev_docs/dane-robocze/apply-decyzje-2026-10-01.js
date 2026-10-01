// Decyzje Ady z 2026-10-01 dla danych uczelni (data/careers.json):
// 1. przywrócić wartości odstające z oficjalnych PDF-ów (WUM, PŁ FTIMS, AKF),
// 3. programista gier na AGH: kierunek Tworzenie przestrzeni wirtualnych i gier (TPWiG).
// (2: konwencja „I tura” zostaje; 4: licea dla edukacji domowej wykluczone w merge-miasta-2026.js; 5: pominięte dopasowania zostają pominięte.)
const fs = require('fs');
const path = require('path');
const DATA = path.resolve(__dirname, '../../data/careers.json');
const data = JSON.parse(fs.readFileSync(DATA, 'utf8'));
const school = (careerId, re) => data.find(c => c.id === careerId).education.schools.find(s => re.test(s.name));
function put(careerId, re, type, t) {
  const s = school(careerId, re);
  const m = s.modes.find(x => x.type === type);
  m.thresholds = m.thresholds.filter(x => x.year !== t.year).concat(t).sort((a, b) => a.year - b.year);
  console.log(`${careerId} | ${s.name} | ${t.year}: ${t.points}`);
}
const WUM24 = 'https://rekrutacja-info.wum.edu.pl/sites/rekrutacja-info.wum.edu.pl/files/progi_punktowe_2024_za_wkr.pdf';
const WUM25 = 'https://rekrutacja-info.wum.edu.pl/sites/rekrutacja-info.wum.edu.pl/files/progi_punktowe_2025_za_wkr.pdf';
put('farmaceuta', /^WUM, Wydział Farmaceutyczny/, 'stacjonarne', { year: 2024, points: 42, scaleMax: 200, sourceUrl: WUM24, round: 'zasadnicze postępowanie rekrutacyjne' });
put('ratownik-medyczny', /^WUM, Wydział Nauk o Zdrowiu/, 'stacjonarne', { year: 2024, points: 50, scaleMax: 200, sourceUrl: WUM24, round: 'zasadnicze postępowanie rekrutacyjne' });
put('dietetyk', /^WUM, Wydział Nauk o Zdrowiu/, 'stacjonarne', { year: 2025, points: 57.7, scaleMax: 270, sourceUrl: WUM25, round: 'próg punktowy (WUM nie publikuje tur)' });
put('administrator-systemow', /^Politechnika Łódzka, FTIMS/, 'stacjonarne', { year: 2024, points: 754, scaleFormula: 'punkty rekrutacyjne PŁ, uczelnia nie podaje maksimum', sourceUrl: 'https://rekrutacja.p.lodz.pl/studia-i-i-ii-stopnia/rekrutuj/progi-punktowe', round: 'I etap' });
put('fizjoterapeuta', /^AKF/, 'stacjonarne', { year: 2024, points: 97.5, scaleMax: 150, sourceUrl: 'https://web.archive.org/web/20250314153744/https://esr.akf.krakow.pl/images/listy_rankingowe/fizjoterapia-5-letnie-jednolite-studia.pdf', round: 'I tura, najniższy wynik z decyzją „przyjęty”' });

// TPWiG: kierunek od 2025/26 (Wydział Informatyki i Wydział Humanistyczny). Progi z tabeli AGH „Progi punktowe”, cykl 1.
// Wymagań TPWiG nie weryfikowano, więc wymagania informatyki są usuwane, żeby nie wprowadzać w błąd.
const agh = school('programista-gier', /^AGH, Wydział Informatyki/);
agh.name = 'AGH, Wydział Informatyki i Wydział Humanistyczny';
agh.program = 'Tworzenie przestrzeni wirtualnych i gier (I stopień, stacjonarne)';
agh.requirements = [];
delete agh.requirementsStructured;
delete agh.requirementsSource;
delete agh.requirementsYear;
agh.modes = [{ type: 'stacjonarne', paid: false, thresholds: [
  { year: 2025, points: 876, scaleMax: 1000, sourceUrl: 'https://rekrutacja.agh.edu.pl/kierunki-studiow/', round: 'Cykl 1' },
  { year: 2026, points: 768, scaleMax: 1000, sourceUrl: 'https://web.archive.org/web/20260909200004/https://rekrutacja.agh.edu.pl/kierunki-studiow/', round: 'Cykl 1, nowy wzór punktacji, nie porównuj wprost z latami wcześniejszymi' },
] }];
console.log('AGH programista gier: TPWiG');
fs.writeFileSync(DATA, JSON.stringify(data, null, 2));
