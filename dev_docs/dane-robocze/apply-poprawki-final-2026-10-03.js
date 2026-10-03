// Poprawki z czwartego przeglądu danych 2026-10-03: nieaktualne symbole kwalifikacji, niepotwierdzone nazwy szkoleń,
// opisy osób niezgodne z artykułem lub słabo związane z zawodem, encje HTML w danych szkół.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const file = path.join(ROOT, 'data', 'careers.json');
const careers = JSON.parse(fs.readFileSync(file, 'utf8'));
const g = id => careers.find(c => c.id === id);

const ti = g('technik-informatyk').skills.training[0];
ti.name = 'Kwalifikacyjne kursy zawodowe INF.02 i INF.03';
ti.description = 'Kursy kwalifikacyjne w zakresie administracji i eksploatacji systemów komputerowych, urządzeń peryferyjnych i lokalnych sieci komputerowych (INF.02) oraz tworzenia i administrowania stronami i aplikacjami internetowymi (INF.03). Przygotowują do egzaminów potwierdzających kwalifikacje zawodowe w technikum informatycznym.';
ti.requirements = 'Ukończona szkoła podstawowa';
const cuk = g('cukiernik').skills.training[0];
cuk.description = cuk.description.replace('TG.04', 'SPC.01');
g('pilot-wycieczek').skills.training[0].name = 'Kurs pilota wycieczek (dobrowolny)';
// „Służba przygotowawcza w LP” nie występuje w ustawie o lasach ani w rozporządzeniu o Służbie Leśnej
g('lesnik').skills.training = g('lesnik').skills.training.filter(t => !/Służba przygotowawcza/.test(t.name));

const REMOVE = [['pracownik-ochrony', 'Kevin Costner'], ['specjalista-pr', 'Krystyna Janda'], ['notariusz', 'Justynian I Wielki'],
  ['inzynier-srodowiska', 'Greta Thunberg'], ['rolnik', 'Vandana Shiva'], ['farmaceuta', 'Maria Skłodowska-Curie']];
for (const [id, name] of REMOVE) g(id).famousPeople = g(id).famousPeople.filter(p => p.name !== name);
const FIX = {
  'Ludwik Hirszfeld': { description: 'Współodkrywca dziedziczenia grup krwi, immunolog' },
  'Hipokrates': { description: 'Ojciec medycyny' },
  'Nikola Tesla': { description: 'Twórca silnika indukcyjnego i systemów prądu przemiennego' },
  'Thomas Edison': { description: 'Twórca praktycznej żarówki i systemu dystrybucji prądu' },
  'Eliot Ness': { description: 'Agent federalny z zespołu ścigającego Ala Capone' },
  'Ada Lovelace': { description: 'Uważana za jedną z pierwszych programistek' },
  'Thomas Chippendale': { description: 'Najsłynniejszy brytyjski projektant mebli' },
  'Nakashima George': { name: 'George Nakashima' },
};
let fixed = 0;
for (const c of careers) for (const p of c.famousPeople || []) if (FIX[p.name]) { Object.assign(p, FIX[p.name]); fixed++; }
fs.writeFileSync(file, JSON.stringify(careers, null, 2));

// Encje HTML w danych szkół (Białystok): „&nbsp;pr&#243;ba”
const bFile = path.join(ROOT, 'data', 'szkoly', 'bialystok.json');
let b = fs.readFileSync(bFile, 'utf8');
const before = (b.match(/&nbsp;|&#\d+;/g) || []).length;
b = b.replace(/&nbsp;/g, ' ').replace(/&#(\d+);/g, (m, n) => String.fromCharCode(+n)).replace(/\s{2,}/g, ' ');
fs.writeFileSync(bFile, b);
console.log('osoby poprawione:', fixed, ', encje HTML w Białymstoku usunięte:', before);
