// Poprawki po przeglądzie krytyków (2026-10-03), stosowane na gotowych danych miasta w build-zagranica.js.
// Surowe wyniki agentów zostają nietknięte. Każda poprawka wskazuje, z którego ustalenia krytyka wynika.
// Czego tu nie ma: uzupełnienia brakujących danych (wymaga ponownego sprawdzenia stron uczelni), zob. pozostale-uwagi-zagranica.md.
const NB = ' ';
const warnings = [];

// ---- tekst: twarde spacje, język bez żargonu zbierania danych ----
const SENTENCE_JARGON = /limit(u)? (narzędzi|zbierania|wywołań)|w tej sesji|HTTP \d{3}|\bWAF\b|SharePoint|obchodzono|ekran(u)? ochronn|ograniczeni\w+ liczby wywołań|wynik(i|ów)? wyszukiwani|Dzisiaj jest|dzisiaj jest/;
const REWRITES = [
  [/\s*Część danych do potwierdzenia na stronie uczelni\./g, ''],
  [/kwoty nie pobrano/gi, 'kwoty nie podano na stronie'],
  [/nie została pobrana/gi, 'nie jest dostępna publicznie'],
  [/nie zostały pobrane/gi, 'nie są dostępne publicznie'],
  [/\bnie pobrano\b/gi, 'nie podano na stronie'],
  [/plikach SharePoint niedostępnych publicznie/g, 'dokumentach niedostępnych publicznie'],
];
const CUR = '(?:EUR|GBP|CZK|HUF|SEK|DKK|RON|lei|zł|€|£)';
function fixText(s) {
  if (typeof s !== 'string') return s;
  let t = s;
  for (const [re, to] of REWRITES) t = t.replace(re, to);
  // zdania o sposobie zbierania danych usuwamy w całości
  if (SENTENCE_JARGON.test(t)) {
    const parts = t.split(/(?<=[.;])\s+/).filter(x => !SENTENCE_JARGON.test(x));
    t = parts.join(' ').trim();
  }
  // twarda spacja w tysiącach i przed walutą, separator tysięcy przy czterocyfrowych kwotach
  t = t.replace(/(?<![\d.,/])(\d{1,3}) (\d{3})(?!\d)/g, `$1${NB}$2`);
  t = t.replace(new RegExp(`(?<![\\d.,/:-])(\\d)(\\d{3})(?=[ \\u00a0]${CUR})`, 'g'), `$1${NB}$2`);
  t = t.replace(new RegExp(`(\\d) (?=${CUR}(?![A-Za-zĄ-ż]))`, 'g'), `$1${NB}`);
  return t.trim();
}
function walk(v) {
  if (typeof v === 'string') return fixText(v);
  if (Array.isArray(v)) return v.map(walk).filter(x => x !== '');
  if (v && typeof v === 'object') { for (const k of Object.keys(v)) v[k] = walk(v[k]); return v; }
  return v;
}

const progs = d => d.universities.flatMap(u => u.programs.map(p => [u, p]));
const sub = (obj, key, re, to, label) => {
  if (typeof obj[key] === 'string' && re.test(obj[key])) { obj[key] = obj[key].replace(re, to); return true; }
  warnings.push(`brak dopasowania: ${label}`); return false;
};
const sumItem = (d, label) => d.summary.find(s => s.label === label);

const BY_CITY = {
  praga(d) {
    // KRYTYCZNE: polskie świadectwo jest w Czechach równoważne z czeskim bez nostryfikacji (1. LF UK, FA ČVUT art. 8, czeska strona FIT)
    for (const [, p] of progs(d)) {
      if (!/^wymaga dodatkowego etapu/.test(p.matura || '')) continue;
      p.matura = /FA ČVUT/.test(p.name)
        ? 'uznawana (poświadczona kopia polskiego świadectwa z tłumaczeniem urzędowym, bez nostryfikacji, wg warunków FA 2027/28)'
        : 'uznawana z warunkami (polskie świadectwo dojrzałości jest w Czechach równoważne z czeskim bez nostryfikacji; angielskie warunki wydziału wspominają o weryfikacji przez ČVUT, więc potwierdź z wydziałem)';
    }
    const m = sumItem(d, 'Polska matura');
    if (m) m.text = 'Polskie świadectwo dojrzałości jest w Czechach równoważne z czeską maturą z mocy umów międzynarodowych i nie wymaga nostryfikacji (podaje to wprost 1. Wydział Lekarski UK, a FA ČVUT przyjmuje poświadczoną kopię świadectwa z tłumaczeniem urzędowym). Angielskie warunki FIT ČVUT opisują ogólną procedurę nostryfikacji lub weryfikacji (950 CZK) i nie wymieniają Polski, więc przy FIT warto potwierdzić to z wydziałem. Nie ma centralnej aplikacji: każda uczelnia i wydział ma osobny system.';
    d.gaps = d.gaps.filter(g => !/Rozbieżność nie rozstrzygnięta/.test(g));
  },
  kopenhaga(d) {
    // KRYTYCZNE: 15 marca na CBS dotyczy tylko osób potrzebujących zezwolenia na pobyt, obywatele UE mają do 5 lipca
    const r = sumItem(d, 'Rekrutacja');
    if (r) sub(r, 'text', /kwota 2 i świadectwa zagraniczne do 15 marca godz\. 12:00/, 'kwota 2 do 15 marca godz. 12:00 (na CBS 15 marca dotyczy tylko osób potrzebujących zezwolenia na pobyt, obywatele UE składają dokumenty do 5 lipca godz. 12:00)', 'Kopenhaga summary');
    d.gaps = d.gaps.map(g => /ITU i KADK wskazują, że kandydaci ze świadectwem zagranicznym aplikują do 15 marca/.test(g)
      ? g.replace(/ITU i KADK wskazują, że kandydaci ze świadectwem zagranicznym aplikują do 15 marca/, 'ITU i KADK wskazują, że kandydaci ze świadectwem zagranicznym aplikują do 15 marca (na CBS ten termin dotyczy tylko osób potrzebujących zezwolenia na pobyt, obywatele UE mają do 5 lipca)') : g);
    for (const [u, p] of progs(d)) {
      if (/DTU|ITU|KADK|Københavns|KU\b/.test(u.name) && p.deadline && !/CBS/.test(u.name) && !/niepotwierdzon|rok niepodany/.test(p.deadline)) p.deadline += ' (rok nie jest podany na stronie uczelni, termin z poprzedniego cyklu, sprawdź na 2027)';
    }
  },
  berlin(d) {
    // KRYTYCZNE: terminy TU Berlin z zamkniętego cyklu 2025/26
    for (const [, p] of progs(d)) {
      if (p.deadline && /1\.12\.2025/.test(p.deadline)) p.deadline = 'Termin na semestr zimowy 2027/28 nie został jeszcze opublikowany. W poprzednim cyklu rejestracja trwała od 1 grudnia do 15 stycznia (kierunki z numerus clausus) i do 28 lutego (bez numerus clausus). Sprawdź stronę TU Berlin.';
    }
  },
  londyn(d) {
    // KRYTYCZNE: progi dla Matury na stronie Imperial nie mają podpisanego kraju
    for (const [u, p] of progs(d)) {
      if (/Imperial/.test(u.name) && /stanine/.test(p.requirements || '')) {
        p.requirements = 'Wymagania dla polskiej matury są niepotwierdzone: strona uczelni nie podpisuje krajów przy progach punktowych. Sprawdź wymagania na stronie kursu albo zapytaj uczelnię.';
      }
      if (/Queen Mary|QMUL/.test(u.name)) {
        p.notes = ((p.notes || '') + ' Dane tej uczelni nie zostały jeszcze potwierdzone na jej stronie, sprawdź je przed decyzją.').trim();
        if (p.selective === false && /A\*/.test(p.requirements || '')) p.selective = true;
      }
      if (/Imperial/.test(u.name) && p.selective === false && /A\*/.test(p.requirements || '')) p.selective = true;
    }
  },
  lizbona(d) {
    // KRYTYCZNE: wymagana Matemática A i egzaminy wstępne, równoważności polskiej matury nie znaleziono
    for (const [, p] of progs(d)) {
      if (/^uznawana z warunkami/.test(p.matura || '') && /Matem[aá]tica A/i.test(`${p.requirements || ''} ${p.matura || ''}`)) {
        p.matura = 'wymaga dodatkowego etapu (egzaminy wstępne z portugalskiego i matematyki; nie potwierdzono, że polska matura je zastępuje, skontaktuj się z DGES)';
      }
    }
    const e = d.summary.find(s => /angielsk/i.test(s.label));
    if (e) e.label = 'Znajomość języka';
  },
  madryt(d) { const e = d.summary.find(s => /angielsk/i.test(s.label)); if (e) e.label = 'Znajomość języka'; },
  nikozja(d) {
    const o = sumItem(d, 'Opłaty');
    if (o) {
      sub(o, 'text', /Dla obywateli UE osobnej zniżki w opublikowanych cennikach nie ma \(UNIC i EUC mają tę samą kwotę dla UE i spoza UE na większości kierunków\)\. strony UCY były zablokowane/, 'EUC pobiera te same kwoty od wszystkich, a UNIC ma osobny, o około 120 EUR niższy cennik dla obywateli UE (10 200 do 11 700 EUR rocznie). Strony Uniwersytetu Cypryjskiego (UCY) były dla nas niedostępne', 'Nikozja Opłaty');
      sub(o, 'text', /UNIC 10 200 do 11 820 EUR/, 'UNIC 10 200 do 11 700 EUR dla obywateli UE', 'Nikozja UNIC zakres');
    }
    if (d.summary[0] && !d.summary.some(s => s.label === 'Zakres')) d.summary.unshift({ label: 'Zakres', text: 'W Nikozji opisaliśmy tylko uczelnie prywatne, które są płatne. Uczelni publicznej (Uniwersytet Cypryjski) nie udało się opisać, bo jej strony były niedostępne.' });
  },
  sofia(d) {
    for (const [u, p] of progs(d)) {
      if (/Sofijska|TU Sofia|Technical/.test(u.name) && /^\s*30/.test(p.tuitionEu || '') && /egzamin/i.test(p.tuitionEu || '')) p.tuitionEu = 'Czesne dla obywateli UE: niepotwierdzone. Znana jest tylko opłata za egzamin wstępny: ' + p.tuitionEu.replace(/^\s*/, '');
      if (/^uznawana z warunkami/.test(p.matura || '') && p.languages.some(l => /bułgar/i.test(l)) && !/egzamin/i.test(p.matura)) p.matura = 'wymaga dodatkowego etapu (egzamin uczelni po bułgarsku lub bułgarska matura, polskie świadectwo musi przejść uznanie w NACID)';
      if (/Medyczny|Medical/.test(u.name) && /9[\s ]?950/.test(p.tuitionEu || '') && !/niepotwierdz/.test(p.tuitionEu)) p.tuitionEu += ' (kwota z wykazu dla cudzoziemców, dla obywateli UE niepotwierdzona)';
    }
  },
  zagrzeb(d) {
    for (const [, p] of progs(d)) if (/FER|Electrical|Computing/.test(p.name) && p.tuitionEu && !/niepotwierdz/.test(p.tuitionEu)) p.tuitionEu += ' (to stawka ścieżki międzynarodowej; dla obywateli UE niepotwierdzona, zapytaj FER)';
    if (!d.summary.some(s => s.label === 'Zakres')) d.summary.unshift({ label: 'Zakres', text: 'Dane dla Zagrzebia są niepełne: potwierdziliśmy tylko część kierunków. Brakuje m.in. architektury, budownictwa, mechaniki, dziennikarstwa i ekonomii na uczelniach publicznych.' });
  },
  wilno(d) {
    for (const [, p] of progs(d)) if (/Medic/i.test(p.name) && /^uznawana/.test(p.matura || '')) p.matura = 'wymaga dodatkowego etapu (egzamin wstępny online za 200 EUR; polska matura jest uznawana, ale nie wystarcza)';
  },
  ateny(d) {
    for (const [, p] of progs(d)) if (/IBT|BAAG|International Business|Business Administration/.test(p.name) && /^uznawana/.test(p.matura || '')) p.matura = 'wymaga potwierdzenia przez uczelnię (źródło nie wymienia polskiej matury)';
  },
  valletta(d) {
    for (const [, p] of progs(d)) if (/Medicine|Doctor/i.test(p.name)) p.matura = 'wymaga dodatkowego etapu (egzaminy MATSEC z wymaganych przedmiotów; termin zgłoszeń na medycynę przypada przed maturą)';
  },
  helsinki(d) {
    for (const [, p] of progs(d)) if (/^uznawana z warunkami/.test(p.matura || '') && /\b(SAT|ACT)\b/.test(`${p.matura} ${p.requirements || ''}`)) p.matura = 'wymaga dodatkowego etapu (przy selekcji liczy się wynik SAT lub ACT, nie sama matura)';
  },
  wieden(d) {
    const m = sumItem(d, 'Polska matura');
    if (m) sub(m, 'text', /^Austria nie ma numerus clausus ani punktów za maturę\./, 'Austria nie stosuje ogólnego numerus clausus ani punktów za maturę, ale na wielu kierunkach są limity miejsc i testy wstępne.', 'Wiedeń matura');
    for (const [u, p] of progs(d)) if (/Wirtschaftsuniversit|WU/.test(u.name) && /\b50[\s ]?EUR/.test(p.tuitionEu || '')) p.tuitionEu = p.tuitionEu.replace(/[^.]*\b50[\s ]?EUR[^.]*\.?\s*/, '').trim() || null;
  },
  rzym(d) {
    const r = sumItem(d, 'Rekrutacja');
    if (r) sub(r, 'text', /Wszystkie okna 2026\/27 już minęły; warunki naboru 2027\/28 nie zostały jeszcze ogłoszone\./, 'Część okien 2026/27 jest jeszcze otwarta (stan na 3 października 2026), ale dotyczy naboru na rok, który już trwa. Maturzysta z 2027 roku patrzy na nabór 2027/28, a jego warunki nie zostały jeszcze ogłoszone.', 'Rzym rekrutacja');
    const o = sumItem(d, 'Opłaty');
    if (o) { sub(o, 'text', /Roma Tre podaje ok\. 2[\s ]?000 EUR w 4 ratach z pełnym zwolnieniem przy ISEE do 23[\s ]?000 EUR\./, 'Kwoty Roma Tre na 2026/27 wymagają sprawdzenia na stronie uczelni.', 'Rzym Roma Tre');
      sub(o, 'text', /Opłaty na 2026\/27 Sapienza publikuje po 30 września 2026; dla Tor Vergata kwot nie potwierdzono\./, 'Kwoty z roku 2025/26: stawki na 2026/27 powinny być już opublikowane, sprawdź je ponownie na stronie Sapienza. Dla Tor Vergata kwot nie potwierdzono.', 'Rzym Sapienza'); }
    for (const [u, p] of progs(d)) if (/Roma Tre/.test(u.name) && /2[\s ]?000/.test(p.tuitionEu || '')) p.tuitionEu = 'Kwota niepotwierdzona, sprawdź regulamin opłat Roma Tre (dla osób z dochodami za granicą stosuje się ISEE parificato).';
  },
  bratyslawa(d) {
    for (const [, p] of progs(d)) {
      if (/Manažment a právo/.test(p.name) && /3[\s ]?999/.test(p.tuitionEu || '')) p.tuitionEu = '3 999 € za rok akademicki (kwota ze strony z danymi z 2021/22, potwierdź aktualną stawkę)';
      if (p.languages.some(l => /słowac/i.test(l)) && !p.languageProof) p.languageProof = 'Wykłady i egzamin po słowacku, wymagany poziom języka sprawdź u wydziału.';
    }
  },
  ryga(d) {
    for (const [u, p] of progs(d)) {
      if (/Latvijas/.test(u.name) && /Ārstniecība|Medicine/.test(p.name)) {
        p.level = 'jednolite';
        if (!/35/.test(p.notes || '')) p.notes = ((p.notes || '') + ' W 2026/27 było 35 miejsc płatnych.').trim();
        p.tuitionEu = '11 850 EUR rocznie w 1. roku; w kolejnych latach stawka rośnie (kwoty dla lat 2 do 6 niepotwierdzone, sprawdź na stronie Uniwersytetu Łotwy)';
      }
      if (/Latvijas/.test(u.name) && !p.deadline) p.deadline = 'Nabór 2027/28 nie został ogłoszony. W poprzednim roku ruszył 1 grudnia, sprawdzaj od listopada.';
    }
  },
  budapeszt(d) {
    for (const [, p] of progs(d)) if (/Építészmérnöki/.test(p.name) && p.tuitionEu && p.tuitionNonEu && !/potwierdź/.test(p.tuitionEu)) p.tuitionEu += ' (tabela BME podaje dla UE kwotę wyższą niż dla spoza UE, potwierdź w BME)';
  },
  amsterdam(d) {
    for (const [, p] of progs(d)) if (p.languages.some(l => /niderland/i.test(l)) && !/niderlandzk/i.test(p.notes || '')) p.notes = ((p.notes || '') + ' Program po niderlandzku, wymagany poziom języka niepotwierdzony.').trim();
  },
  dublin(d) {
    for (const [, p] of progs(d)) if (/TU Dublin|Technological/.test(p.name) === false && p.tuitionEu && /2[\s ]?500/.test(p.tuitionEu) && !/^Płacisz/.test(p.tuitionEu)) p.tuitionEu = 'Płacisz 2 500 EUR (Student Contribution), jeśli spełniasz warunek pobytu w UE/EOG; czesne pokrywa państwo. Szczegóły: ' + p.tuitionEu;
  },
};

// Dopasowania działają na zwykłych spacjach; twarde spacje wracają w walk() na końcu
const plain = v => (typeof v === 'string' ? v.replace(/\u00a0/g, ' ') : Array.isArray(v) ? v.map(plain) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, plain(x)])) : v);
function apply(slug, data) {
  Object.assign(data, plain(data));
  if (BY_CITY[slug]) BY_CITY[slug](data);
  walk(data);
  return data;
}
module.exports = { apply, warnings };
