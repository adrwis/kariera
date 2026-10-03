// Drugi audyt danych 2026-10-03: osoby w famousPeople.
// 1. Usunięte rekordy, których link prowadził do strony zawodu, dziedziny lub firmy zamiast do osoby
//    (biogramy były ogólnikowe i nie dało się ich zweryfikować).
// 2. Naprawione strony ujednoznaczniające i błędne daty/opisy według wstępu artykułu w Wikipedii (sprawdzone przez API).
// 3. Antoni Wedel (1823-1898) zamieniony na Karola Wedla (założyciel firmy E. Wedel, 1813-1902).
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', '..', 'data', 'careers.json');
const careers = JSON.parse(fs.readFileSync(file, 'utf8'));

const REMOVE = new Set(['Witold Bień', 'Wiesław Jedliczka', 'Walenty Wasilewski', 'Jadwiga Biernat', 'Jacek Kall', 'Hanna Litwińczuk',
  'Józef Wojciechowski', 'Anna Paluch-Oleś', 'Aleksander Oleszko', 'Jacek Gołaczyński', 'Leszek Elas', 'Zbigniew Tarkowski',
  'Łukasz Słoniewski', 'Wacław Żenczykowski', 'Jan Hausbrandt', 'Janusz Kindler', 'Gene Kim', 'James Marwick', 'Marcel Grateau',
  'Richard Bourdon', 'Robert Gage', 'Anna Lewandowska']);
const wiki = t => 'https://pl.wikipedia.org/wiki/' + t;
const FIX = {
  'Kazimierz Dąbrowski': { sourceUrl: wiki('Kazimierz_Dąbrowski_(psycholog)') },
  'Henryk Tomaszewski': { sourceUrl: wiki('Henryk_Tomaszewski_(grafik)') },
  'Tadeusz Tołwiński': { sourceUrl: wiki('Tadeusz_Tołwiński_(architekt)') },
  'Jerzy Mellibruda': {
    description: 'Psycholog, specjalista od uzależnień',
    bio: 'Polski psycholog i psychoterapeuta (1938-2020), profesor w Szkole Wyższej Psychologii Społecznej. Specjalizował się w problematyce uzależnień, autor prac z dziedziny psychologii, w tym o problemach alkoholowych.',
  },
  'Marek Papała': {
    description: 'Komendant Główny Policji w latach 1997-1998',
    bio: 'Polski policjant, nadinspektor Policji (1959-1998). Komendant główny Policji w latach 1997-1998. Zginął w Warszawie w 1998 roku.',
  },
  'Irena Tuwim': {
    description: 'Tłumaczka literatury dla dzieci i młodzieży',
    bio: 'Polska poetka, prozaiczka i tłumaczka (1898-1987), siostra Juliana Tuwima. Tłumaczyła literaturę dla dzieci i młodzieży.',
  },
  'Joanna Agacka-Indecka': {
    description: 'Prezes Naczelnej Rady Adwokackiej w latach 2007-2010',
    bio: 'Polska adwokatka (1964-2010). W latach 2007-2010 prezes Naczelnej Rady Adwokackiej. Zginęła 10 kwietnia 2010 roku w Smoleńsku.',
  },
  'Leon Kaczmarek': {
    description: 'Ojciec polskiej logopedii',
    bio: 'Polski profesor, toponimista i logopeda (1911-1996), nazywany ojcem polskiej logopedii. Współtwórca Polskiego Towarzystwa Logopedycznego.',
  },
  'Elsie de Wolfe': { bio: 'Amerykańska projektantka wnętrz (ur. ok. 1859, zm. 1950). Uznawana za jedną z pierwszych zawodowych projektantek wnętrz.' },
  'Elizabeth Arden': { bio: 'Kanadyjsko-amerykańska przedsiębiorczyni (1881-1966). Założycielka marki kosmetycznej Elizabeth Arden.' },
  'Antoni Wedel': {
    name: 'Karol Wedel', description: 'Założyciel firmy E. Wedel',
    bio: 'Niemiecki cukiernik (1813-1902), założyciel przedsiębiorstwa E. Wedel. Zmarł w Warszawie.',
    sourceUrl: wiki('Karol_Wedel'),
  },
};
let removed = 0, fixed = 0;
for (const c of careers) {
  if (!c.famousPeople) continue;
  const before = c.famousPeople.length;
  c.famousPeople = c.famousPeople.filter(p => !REMOVE.has(p.name));
  removed += before - c.famousPeople.length;
  for (const p of c.famousPeople) if (FIX[p.name]) { Object.assign(p, FIX[p.name]); fixed++; }
}
fs.writeFileSync(file, JSON.stringify(careers, null, 2));
console.log('osoby: usunięto', removed, ', poprawiono', fixed);
