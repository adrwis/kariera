// Trzeci audyt danych 2026-10-03: osoby w famousPeople (sprawdzone wstępy artykułów Wikipedii przez API).
// Usunięte: osoby z linkiem do innej osoby albo firmy, z biogramem bez pokrycia, bez artykułu do zweryfikowania.
// Poprawione: daty według wstępów artykułów, linki do Wikipedii zamiast wyszukiwarki Google tam, gdzie artykuł istnieje.
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', '..', 'data', 'careers.json');
const careers = JSON.parse(fs.readFileSync(file, 'utf8'));
const REMOVE = new Set(['Adam Rapacki', 'Jadwiga Łuszczewska', 'Marcin Iwuć', 'Arthur Andersen', 'Robert Half', 'Tadeusz Kantor',
  'Chad Robertson', 'Adam Haertle', 'Benoit Renaud', 'Robin McKenzie', 'Patrick Debois', 'Thomas Limoncelli']);
const en = t => 'https://en.wikipedia.org/wiki/' + t;
const FIX = {
  'Adam Loret': { description: 'Polski leśnik, ofiara sowieckich represji w 1939 roku', bio: 'Polski leśnik (1884 do 1939), ofiara sowieckich represji w 1939 roku.' },
  'Marian Zembala': { bio: 'Polski lekarz i kardiochirurg (1950 do 2022), profesor nauk medycznych. W 2015 roku minister zdrowia, poseł na Sejm VIII kadencji.' },
  'Witold Modzelewski': { description: 'Profesor prawa, doradca podatkowy', bio: 'Polski prawnik (ur. 1956), profesor nauk prawnych na Uniwersytecie Warszawskim, doradca podatkowy i prezes Instytutu Studiów Podatkowych.' },
  'Warren Buffett': { description: 'Legendarny inwestor, wieloletni prezes Berkshire Hathaway' },
  'Eleanor Roosevelt': { bio: 'Amerykańska polityk i działaczka społeczna (1884 do 1962). Pierwsza Dama USA, przewodnicząca komisji ONZ, która opracowała Powszechną Deklarację Praw Człowieka w 1948 roku.' },
  'Stefan Sagmeister': { sourceUrl: en('Stefan_Sagmeister') }, 'Nate Silver': { sourceUrl: en('Nate_Silver') },
  'James Bach': { sourceUrl: en('James_Marcus_Bach') }, 'Kelsey Hightower': { sourceUrl: en('Kelsey_Hightower') },
  'Dave Ulrich': { sourceUrl: en('Dave_Ulrich') }, 'Laszlo Bock': { sourceUrl: en('Laszlo_Bock') },
  'Kelly Wearstler': { sourceUrl: en('Kelly_Wearstler') }, 'Rick Steves': { sourceUrl: en('Rick_Steves') },
  'Sam Maloof': { sourceUrl: en('Sam_Maloof') }, 'Monty Don': { sourceUrl: en('Monty_Don') },
};
// Poprawki dat w istniejących biogramach (stary fragment => nowy)
const TEXT = {
  'Adrian Chmielarz': [['(ur. 1973)', '(ur. 1971)']], 'Paweł Tkaczyk': [['(ur. 1979)', '(ur. 1978)']],
  'Dorota Szelągowska': [['(ur. 1978)', '(ur. 1980)']], 'Maciej Zień': [['(ur. 1975)', '(ur. 1979)']],
  'Luca Pacioli': [['(ok. 1447 do 1517)', '(1445 do 1517)']], 'James Hoffmann': [[' (ur. 1981)', '']],
  'Agnieszka Rojewska': [[' (ur. ok. 1985)', '']], 'Kelsey Hightower': [['(ur. ok. 1981)', '(ur. 1981)']],
  'Warren Buffett': [['Prezes Berkshire Hathaway', 'Wieloletni prezes Berkshire Hathaway']],
};
let removed = 0, fixed = 0, texts = 0;
for (const c of careers) {
  if (!c.famousPeople) continue;
  const n = c.famousPeople.length;
  c.famousPeople = c.famousPeople.filter(p => !REMOVE.has(p.name));
  removed += n - c.famousPeople.length;
  for (const p of c.famousPeople) {
    if (FIX[p.name]) { Object.assign(p, FIX[p.name]); fixed++; }
    for (const [from, to] of TEXT[p.name] || []) if (p.bio.includes(from)) { p.bio = p.bio.replace(from, to); texts++; }
  }
}
fs.writeFileSync(file, JSON.stringify(careers, null, 2));
const google = careers.flatMap(c => (c.famousPeople || []).filter(p => /google\./i.test(p.sourceUrl || '')).map(p => p.name));
const empty = careers.filter(c => !(c.famousPeople || []).length).map(c => c.id);
console.log('osoby: usunięto', removed, ', poprawiono', fixed, ', poprawek tekstu', texts);
console.log('nadal ze źródłem Google:', google.length, google.join(', '));
console.log('zawody bez osób:', empty.join(', ') || 'brak');
