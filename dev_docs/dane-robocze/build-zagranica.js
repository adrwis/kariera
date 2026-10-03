// Studia za granicą: zamienia surowe wyniki agentów (wyniki/zagranica-<miasto>-*.json) w pliki strony data/zagranica/<miasto>.json
// i listę miast data/zagranica/index.json (miasta bez danych mają status 'w przygotowaniu').
// Struktura wyników agentów różni się drobiazgami (np. nazwy pól w opisie kraju), dlatego mapowanie jest tolerancyjne.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const SRC = path.join(__dirname, 'wyniki');
const OUT = path.join(ROOT, 'data', 'zagranica');
fs.mkdirSync(OUT, { recursive: true });

// Stolice krajów UE (bez Warszawy) i Londyn. gdzie: miejscownik do zdań ("w Berlinie")
const CITIES = [
  ['amsterdam', 'Amsterdam', 'Holandia', true], ['ateny', 'Ateny', 'Grecja', true], ['berlin', 'Berlin', 'Niemcy', true],
  ['bratyslawa', 'Bratysława', 'Słowacja', true], ['bruksela', 'Bruksela', 'Belgia', true], ['bukareszt', 'Bukareszt', 'Rumunia', true],
  ['budapeszt', 'Budapeszt', 'Węgry', true], ['dublin', 'Dublin', 'Irlandia', true], ['helsinki', 'Helsinki', 'Finlandia', true],
  ['kopenhaga', 'Kopenhaga', 'Dania', true], ['lizbona', 'Lizbona', 'Portugalia', true], ['lublana', 'Lublana', 'Słowenia', true],
  ['luksemburg', 'Luksemburg', 'Luksemburg', true], ['madryt', 'Madryt', 'Hiszpania', true], ['nikozja', 'Nikozja', 'Cypr', true],
  ['paryz', 'Paryż', 'Francja', true], ['praga', 'Praga', 'Czechy', true], ['ryga', 'Ryga', 'Łotwa', true], ['rzym', 'Rzym', 'Włochy', true],
  ['sofia', 'Sofia', 'Bułgaria', true], ['sztokholm', 'Sztokholm', 'Szwecja', true], ['tallinn', 'Tallinn', 'Estonia', true],
  ['valletta', 'Valletta', 'Malta', true], ['wieden', 'Wiedeń', 'Austria', true], ['wilno', 'Wilno', 'Litwa', true], ['zagrzeb', 'Zagrzeb', 'Chorwacja', true],
  ['londyn', 'Londyn', 'Wielka Brytania', false],
  // Ośrodki akademickie poza stolicami (flaga capital: false), dane zbierane od 2026-10-03
  ['barcelona', 'Barcelona', 'Hiszpania', true, false], ['walencja', 'Walencja', 'Hiszpania', true, false],
  ['mediolan', 'Mediolan', 'Włochy', true, false], ['bolonia', 'Bolonia', 'Włochy', true, false],
  ['monachium', 'Monachium', 'Niemcy', true, false], ['hamburg', 'Hamburg', 'Niemcy', true, false],
  ['lyon', 'Lyon', 'Francja', true, false], ['groningen', 'Groningen', 'Holandia', true, false],
  ['maastricht', 'Maastricht', 'Holandia', true, false], ['rotterdam', 'Rotterdam', 'Holandia', true, false],
  ['porto', 'Porto', 'Portugalia', true, false], ['lowanium', 'Lowanium (Leuven)', 'Belgia', true, false],
];

const poprawki = require('./poprawki-zagranica');
const text = v => (v == null ? '' : String(v).trim());
// Zdania o sposobie zbierania danych (narzędzia, limity zapytań, streszczenia stron) nie są informacją dla ucznia: usuwamy je,
// a przy uwagach o niepewności zostawiamy jedno zdanie po ludzku.
const INTERNAL = /pole tuition|tuition\.(eu|nonEu)|\bnull\b|WebFetch|wyszukiwar|wynik(ów|i) wyszukiwani|scratchpad|skrypt|limit(u)? (zapytań|wywołań)|zabrakło limitu|streszczeni/i;
function clean(t) {
  const s = text(t);
  if (!INTERNAL.test(s)) return s;
  const parts = s.split(/(?<=[.;])\s+/).filter(x => !INTERNAL.test(x));
  const kept = parts.join(' ').trim();
  return kept ? kept + ' Część danych do potwierdzenia na stronie uczelni.' : 'Dane do potwierdzenia na stronie uczelni.';
}
// Opis kraju: pola o różnych nazwach sprowadzamy do czterech etykiet
function summaryOf(raw) {
  const o = raw.overview || raw.ogolne || raw.ogolneZasadyBerlina || raw.generalNotes || {};
  if (typeof o === 'string') return { items: [{ label: 'Zasady', text: o }], sources: [] };
  const items = [];
  const sources = [];
  const add = (label, t) => { if (clean(t)) items.push({ label, text: clean(t) }); };
  for (const [k, v] of Object.entries(o)) {
    if (typeof v !== 'string') {
      if (/^sources?$/i.test(k) && Array.isArray(v)) v.forEach(s => s && s.url && sources.push({ url: s.url, note: text(s.claim || s.quote).slice(0, 140) }));
      continue;
    }
    if (/^https?:\/\/\S+$/.test(v.trim())) { sources.push({ url: v.trim(), note: '' }); continue; }
    if (/^(zrodlo|cytat|sourceUrl)|source$/i.test(k)) continue;
    if (/matur/i.test(k)) add('Polska matura', v);
    else if (/czesn|tuition|oplat/i.test(k)) add('Opłaty', v);
    else if (/jezyk|language/i.test(k)) add('Język', v);
    else if (/visa|wiza/i.test(k)) add('Wiza i pobyt', v);
    else if (/english|angiel/i.test(k)) add('Znajomość angielskiego', v);
    else if (/rekrut|deadline|system|equal|apply|generalDeadlines/i.test(k)) add('Rekrutacja', v);
    else add('Uwagi', v);
  }
  // kolejność stała
  const order = ['Polska matura', 'Opłaty', 'Wiza i pobyt', 'Język', 'Znajomość angielskiego', 'Rekrutacja', 'Uwagi', 'Zasady'];
  items.sort((a, b) => order.indexOf(a.label) - order.indexOf(b.label));
  return { items, sources };
}

function programOf(p) {
  const adm = p.admission || {};
  const t = p.tuition || {};
  const langs = (p.languages || []).map(text).filter(Boolean);
  return {
    name: text(p.name), nameEn: text(p.nameEn), careerIds: p.careerIds || [],
    level: text(p.level), durationYears: p.durationYears == null ? null : p.durationYears,
    languages: langs, english: langs.some(l => /angiel|english/i.test(l)),
    academicYear: text(p.academicYear),
    tuitionEu: clean(t.eu) || null, tuitionNonEu: clean(t.nonEu) || null, tuitionUrl: /^https?:/.test(t.sourceUrl || '') ? t.sourceUrl : null,
    matura: clean(adm.polishMatura) || null, requirements: clean(adm.requirements) || null, languageProof: clean(adm.languageProof) || null,
    selective: adm.selective == null ? null : !!adm.selective, admissionUrl: /^https?:/.test(adm.sourceUrl || '') ? adm.sourceUrl : null,
    deadline: clean(p.deadline) || null, applyUrl: /^https?:/.test(p.applyUrl || '') ? p.applyUrl : null,
    url: /^https?:/.test(p.sourceUrl || '') ? p.sourceUrl : null, notes: clean(p.notes) || null,
  };
}

const index = [];
for (const [slug, name, country, eu, capital = true] of CITIES) {
  const file = fs.readdirSync(SRC).filter(f => f.startsWith(`zagranica-${slug}-`)).sort().pop();
  if (!file) { index.push({ slug, name, country, eu, capital, status: 'w przygotowaniu', universities: 0, programs: 0 }); continue; }
  const raw = JSON.parse(fs.readFileSync(path.join(SRC, file), 'utf8'));
  const sum = summaryOf(raw);
  const universities = (raw.universities || []).map(u => ({
    name: text(u.name), nameEn: text(u.nameEn), url: /^https?:/.test(u.url || '') ? u.url : null, type: text(u.type),
    // Programy oparte na streszczeniach z wyszukiwarki (agent zaznaczył to w uwagach) nie trafiają na stronę: tylko oficjalne źródła
    programs: (u.programs || []).filter(p => !/wynik(ów|i) wyszukiwani|streszczeni\w* z wyszukiwar/i.test(`${p.notes || ''} ${JSON.stringify(p.sources || '')}`)).map(programOf).filter(p => p.name && (p.tuitionEu || p.tuitionNonEu || p.matura || p.requirements || p.deadline) && p.academicYear),  // puste programy (sam opis i czas trwania) nie trafiają na stronę
  })).filter(u => u.programs.length);
  // Miasto bez żadnego programu z potwierdzonymi danymi (np. strony uczelni nie dały się odczytać) zostaje „w przygotowaniu”
  if (!universities.reduce((a, u) => a + u.programs.length, 0)) { index.push({ slug, name, country, eu, capital, status: 'w przygotowaniu', universities: 0, programs: 0 }); continue; }
  const data = { slug, name, country, eu, capital, retrieved: text(raw.retrieved), summary: sum.items, sources: sum.sources, gaps: (raw.luki || []).map(x => text(x)).filter(x => x && !/^[^.]*\b(nie użyłem|nie użyłam|nie sprawdzałem|nie sprawdzałam)\b[^.]*(limit|portal)/i.test(x)).map(clean).filter(Boolean), universities };
  poprawki.apply(slug, data);
  fs.writeFileSync(path.join(OUT, slug + '.json'), JSON.stringify(data));
  index.push({ slug, name, country, eu, capital, status: 'dostępne', retrieved: data.retrieved, universities: data.universities.length, programs: data.universities.reduce((a, u) => a + u.programs.length, 0) });
}
fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify({ cities: index }));
if (poprawki.warnings.length) console.log('UWAGA, poprawki bez dopasowania:\n  ' + poprawki.warnings.join('\n  '));
console.log('miasta:', index.filter(c => c.status === 'dostępne').map(c => `${c.name} (${c.programs})`).join(', ') || 'brak', '| w przygotowaniu:', index.filter(c => c.status !== 'dostępne').length);
