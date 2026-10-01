// Wpisuje etykiety quizu zainteresowań (wyniki/quiz-tagi.json) do data/careers.json jako pole quiz.
// keywords: polskie nazwy zainteresowań, przeszukiwane przez wyszukiwarkę.
const fs = require('fs');
const path = require('path');
const DATA = path.resolve(__dirname, '../../data/careers.json');
const tags = JSON.parse(fs.readFileSync(path.join(__dirname, 'wyniki/quiz-tagi.json'), 'utf8'));
const LABELS = {
  ludzie: 'ludzie rozmowy pomaganie', dzieci: 'dzieci młodzież', zwierzeta: 'zwierzęta', przyroda: 'przyroda rośliny środowisko',
  zdrowie: 'zdrowie ciało człowieka', komputery: 'komputery programowanie', technika: 'maszyny elektronika urządzenia technika',
  budowanie: 'budowanie praca rękami majsterkowanie', liczby: 'liczby analizy finanse matematyka', jezyki: 'języki obce',
  pisanie: 'pisanie czytanie media', sztuka: 'rysowanie projektowanie tworzenie sztuka', scena: 'muzyka teatr film scena',
  sport: 'sport ruch', prawo: 'prawo zasady', bezpieczenstwo: 'bezpieczeństwo ratowanie mundur', biznes: 'biznes sprzedaż organizowanie',
  jedzenie: 'gotowanie jedzenie', wyglad: 'uroda moda wygląd', podroze: 'podróże turystyka', nauka: 'nauka badania eksperymenty',
};
// Przypisania uznane przy przeglądzie za naciągane
const DROP = { aktor: ['pisanie'], dietetyk: ['sport'] };
const data = JSON.parse(fs.readFileSync(DATA, 'utf8'));
let n = 0;
for (const c of data) {
  const t = tags[c.id];
  if (!t) { console.log('brak tagów:', c.id); continue; }
  const interests = t.interests.filter(i => !(DROP[c.id] || []).includes(i));
  c.quiz = { interests, contact: t.contact, physical: t.physical, places: t.places, path: t.path, subjects: t.subjects, keywords: interests.map(i => LABELS[i]).join(' ') };
  n++;
}
fs.writeFileSync(DATA, JSON.stringify(data, null, 2));
console.log('zawodów z quizem:', n);
