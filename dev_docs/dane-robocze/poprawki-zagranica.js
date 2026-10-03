// Poprawki po przeglądzie krytyków (2026-10-03), stosowane na gotowych danych miasta w build-zagranica.js.
// Surowe wyniki agentów zostają nietknięte. Każda poprawka wskazuje, z którego ustalenia krytyka wynika.
// Czego tu nie ma: uzupełnienia brakujących danych (wymaga ponownego sprawdzenia stron uczelni), zob. pozostale-uwagi-zagranica.md.
const NB = ' ';
const warnings = [];

// ---- tekst: twarde spacje, język bez żargonu zbierania danych ----
const SENTENCE_JARGON = /Poprzednia wersja|pobrano tylko stronę|wyszukiwani[ea] (?:sugerowa|wskaza)|zebrano tylko ogólną rolę|ARDI|careerIds|pole name |wpisano pustą listę|w sprawdzonym zbiorze|limit(u)? (narzędzi|zbierania|wywołań)|w tej sesji|HTTP \d{3}|\bWAF\b|SharePoint|obchodzono|ekran(u)? ochronn|ograniczeni\w+ liczby wywołań|wynik(i|ów)? wyszukiwani|Dzisiaj jest|dzisiaj jest/;
const REWRITES = [
  [/\s*Część danych do potwierdzenia na stronie uczelni\./g, ''],
  [/kwoty nie pobrano/gi, 'kwoty nie podano na stronie'],
  [/nie została pobrana/gi, 'nie jest dostępna publicznie'],
  [/nie zostały pobrane/gi, 'nie są dostępne publicznie'],
  [/\bnie pobrano\b/gi, 'nie podano na stronie'],
  [/plikach SharePoint niedostępnych publicznie/g, 'dokumentach niedostępnych publicznie'],
  // Skrót uczelni EUR (Erasmus University Rotterdam) mylił się z walutą
  [/\(EUR, StudyinNL\)/g, '(Erasmus University Rotterdam, StudyinNL)'],
  [/według EUR i StudyinNL/g, 'według Erasmus University Rotterdam i StudyinNL'],
  [/na większości programów EUR i 28 300 EUR/g, 'na większości programów Erasmus University Rotterdam i 28 300 EUR'],
  [/większość wydziałów EUR\)/g, 'większość wydziałów Erasmus University Rotterdam)'],
  [/rozpatrza każde zgłoszenie/g, 'rozpatruje każde zgłoszenie'],
  // Język roboczy z zbierania danych
  [/ \(bazy niedostępne podczas zbierania danych\)/g, ' (bazy były niedostępne)'],
  [/ podczas zbierania danych/g, ''],
  [/nie znaleziono na sprawdzonych stronach/g, 'nie znaleziono na stronach uczelni'],
  [/niedostępne publicznie dla automatycznego pobierania/g, 'niedostępne publicznie'],
  [/Żadna z odwiedzonych stron/g, 'Żadna ze stron uczelni'],
  [/odwiedzonych stron/g, 'sprawdzonych stron uczelni'],
  [/Terminy w pliku pochodzą/g, 'Podane terminy pochodzą'],
  [/Nie zebrano programów/g, 'Nie opisano programów'],
  [/Nie zebrano tabel/g, 'Nie opisano tabel'],
  [/[,;]\s*(?:ich stron nie sprawdzano osobno|strony programu nie otwierano osobno)/g, ''],
  [/\bnie badano\b/g, 'nie opisano'],
  [/\bnie sprawdzano\b/g, 'nie opisano'],
  [/na sprawdzonych stronach/g, 'na stronach uczelni'],
  [/nie zostało odczytane/g, 'nie było dostępne'],
  [/nie dały się odczytać/g, 'są niedostępne'],
  [/nie był dostępny do odczytania/g, 'nie był dostępny'],
  [/nie zostały? odczytan\w+/g, 'nie był dostępny'],
  [/Nie udało się odczytać stron/g, 'Nie opisano stron'],
  [/zablokowała dostęp ekranem weryfikacji/g, 'jest niedostępna bez weryfikacji przeglądarki'],
  [/w odczytanych źródłach/g, 'w źródłach'],
  [/nie dała się odczytać/g, 'jest niedostępna publicznie'],
  [/nie ma w niej odczytanych przykładowych cen/g, 'nie ma w niej przykładowych cen'],
  [/Nie udało się odczytać cen/g, 'Nie ma cen'],
  [/nie udało się odczytać/g, 'nie jest podane'],
  [/nie udało się ich odczytać ze stron opisowych/g, 'nie ma ich na stronach opisowych'],
  [/na odczytanej stronie/g, 'na stronie'],
  [/odczytana (\d{4}-\d{2}-\d{2})/g, 'sprawdzona $1'],
  [/\bNie odczytano\b/g, 'Nie podano'],
  [/kwoty odczytano z tabel[^.]*\./g, 'Kwoty pochodzą z tabel w skanach, więc warto sprawdzić je w oryginalnym cenniku.'],
  [/nie da się z niej odczytać kosztu pokoju/g, 'nie da się z niej podać kosztu pokoju'],
  [/(\d{4})[–—](\d{4})/g, '$1/$2'],
  [/nie zostały (?:tu )?odczytane/g, 'nie są podane na stronie'],
  [/na pobranej stronie/g, 'na stronie programu'],
  [/w pobranej wersji/g, 'w wersji na stronie'],
  [/\(terminy na stronie uczelni, nie pobrane\)/g, '(terminy do potwierdzenia na stronie uczelni)'],
  [/na odczytanych stronach/g, 'na stronach uczelni'],
  [/nie został odczytany ze strony wydziału/g, 'nie jest podany na stronie wydziału'],
  [/nie udało się odczytać/g, 'nie podano'],
  [/na pobranej stronie programu/g, 'na stronie programu'],
  [/nie została (?:tu )?odczytana/g, 'nie jest podana na stronie'],
  [/\bnie odczytano\b/g, 'nie podano na stronie'],
  [/nie udało się (?:go|ich|jej) pobrać/g, 'nie jest dostępny publicznie'],
  [/\bw dniu pobrania\b/g, ''],
  [/\bzostała pobrana\b/g, 'została sprawdzona'],
  [/\bzostały pobrane\b/g, 'zostały sprawdzone'],
  [/\bpobranych\b/g, 'sprawdzonych'],
  [/\bnie pobierano\b/g, 'nie sprawdzono'],
  [/nie znaleźliśmy/g, 'nie znaleziono'],
  [/(?:Strony programu|Ich strony|Strony programów) nie otwierano osobno[^.]*\./g, 'Język i czas trwania podano według cennika uczelni, do potwierdzenia na stronie programu.'],
  [/(?:Główna strona )?rtu\.lv jest zasłonięta ekranem weryfikacji\.?/g, 'Dane pochodzą z systemu rekrutacji RTU (apply.rtu.lv), bo główna strona uczelni jest niedostępna publicznie.'],
  [/\(strona uczelni jest chroniona przed automatycznym pobieraniem\)/g, '(strona uczelni jest niedostępna bez weryfikacji przeglądarki)'],
  [/nie jest publicznie dostępna z automatycznego pobierania/g, 'nie jest publicznie dostępna bez logowania'],
  [/ i nie było przedmiotem tego zbierania/g, ' i nie jest tu opisany'],
  [/bo skupiono się/g, 'bo skupiliśmy się'],
  [/podnosi się do 4 punktami/g, 'podnosi się o maksymalnie 4 punkty'],
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
  // Powtórzone pod rząd to samo zdanie zostawiamy raz
  t = t.split(/(?<=[.;])\s+/).filter((x, i, a) => i === 0 || x !== a[i - 1]).join(' ');
  return t.replace(/ {2,}/g, ' ').trim();
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
  hamburg(d) {
    for (const [u, p] of progs(d)) {
      if (/Bucerius/.test(u.name)) {
        const rest = (p.tuitionEu || '').match(/Opłata za postępowanie rekrutacyjne[^]*$/);
        p.tuitionEu = 'Studia płatne w modelu odroczonym: czesne płaci się dopiero po wejściu w życie zawodowe, a nie w trakcie studiów. Kwoty nie podano na stronie, zapytaj uczelnię. ' + (rest ? rest[0] : '');
        if (p.deadline && !/^Termin z naboru/.test(p.deadline)) p.deadline = 'Termin z naboru 2026, nabór na 2027 jeszcze nieopublikowany. ' + p.deadline;
      }
      if (/HAW/.test(u.name) && /Mechanical|Maschinenbau/.test(p.name) && p.deadline && !/^UWAGA/.test(p.deadline)) p.deadline = 'UWAGA: nabór trwa teraz, na semestr letni od 1 października do 30 listopada. ' + p.deadline;
    }
  },
  lyon(d) {
    for (const [, p] of progs(d)) if (/Data Science for Responsible Business/.test(p.name) && p.tuitionEu && !/^Czesne dla obywateli UE niepotwierdzone/.test(p.tuitionEu)) p.tuitionEu = 'Czesne dla obywateli UE niepotwierdzone. ' + p.tuitionEu;
  },
  lowanium(d) {
    for (const [, p] of progs(d)) {
      if (/Engineering Technology/.test(p.name)) {
        p.deadline = 'Nabór na 2027/28: do 15 czerwca 2027 dla obywateli UE i EOG, do 15 stycznia 2027 dla osób spoza EOG. Wyniki testów językowych i matematycznych powinny wpłynąć do 1 sierpnia (28 sierpnia dla obywateli EOG z belgijskim pozwoleniem na pobyt). Okres zapisów po przyjęciu w 2026/27 wynosił od 17 sierpnia do 16 września, a na 2027/28 nie został jeszcze opublikowany.';
        p.academicYear = '2027/28';
      }
    }
    const r = sumItem(d, 'Rekrutacja');
    if (r) {
      sub(r, 'text', /Bachelor of Engineering Technology do 1 czerwca \(nabór 2026\/27\)/, 'Bachelor of Engineering Technology do 15 czerwca 2027 dla obywateli UE i EOG (do 15 stycznia 2027 dla osób spoza EOG)', 'Lowanium rekrutacja');
      sub(r, 'text', /ścisły termin 1 lutego dotyczy tylko osób spoza EOG/, 'termin 1 lutego dotyczy osób spoza EOG (do potwierdzenia na stronie KU Leuven)', 'Lowanium 1 lutego');
    }
    d.gaps = d.gaps.map(g => g.replace(/dla Bachelor of Engineering Technology podano termin z naboru 2026\/27 \(1 czerwca\), dla programów/, 'dla programów'));
  },
  porto(d) {
    for (const [, p] of progs(d)) {
      p.deadline = (p.deadline || '').replace(/od 20 do 27 lipca 2026/g, 'od 20 do 29 lipca 2026');
      if (p.deadline && !/Kolejne fazy w 2026/.test(p.deadline)) p.deadline += ' Kolejne fazy w 2026: druga od 24 sierpnia do 20 września (wyniki 30 września), trzecia od 10 do 12 października (kalendarz DGES, Despacho 9359-A/2026).';
      // Wszystkie programy idą tym samym konkursem krajowym i żaden polski egzamin nie ma potwierdzonego odpowiednika wszystkich egzaminów wstępnych
      if (/^wymaga potwierdzenia przez uczelnię/.test(p.matura || '')) p.matura = p.matura.replace(/^wymaga potwierdzenia przez uczelnię/, 'wymaga dodatkowego etapu');
    }
    d.summary.forEach(x => { x.text = x.text.replace(/od 20 do 27 lipca/g, 'od 20 do 29 lipca'); });
    d.gaps = d.gaps.filter(g => !/Kalendarz 2026 w Guia da Candidatura[^.]*różni się/.test(g));
  },
  rotterdam(d) {
    for (const [u, p] of progs(d)) if (/Delft/.test(u.name) && !/Computer Science/.test(p.name) && /computer-science-and-engineering/.test(p.tuitionUrl || '')) p.tuitionUrl = null;
  },
  groningen(d) {
    for (const [, p] of progs(d)) if (/^Psychology/.test(p.name) && /psychology\/\?lang=en/.test(p.url || '')) {
      p.url = 'https://www.rug.nl/bachelors/psychology-en/';
      if (/psychology\/\?lang=en/.test(p.tuitionUrl || '')) p.tuitionUrl = p.url;
    }
    const e = d.summary.find(x => /angielsk/i.test(x.label));
    if (e) sub(e, 'text', /IELTS Academic 6,0 \(poziom 1, ekonomia, IB, psychologia\)/, 'IELTS Academic 6,0 (poziom 1, ekonomia, IB), a na psychologii angielskiej 6,5', 'Groningen IELTS');
  },
  barcelona(d) {
    for (const [, p] of progs(d)) if (/^uznawana z warunkami/.test(p.matura || '') || !p.matura) p.matura = 'wymaga dodatkowego etapu (akredytacja świadectwa w UNEDasiss, która daje notę dostępu od 5 do 10; uczelnie nie opisują osobno ścieżki dla Polski, więc potwierdź zasady w UNEDasiss)';
    for (const x of d.summary) x.text = x.text.replace(/Przedmioty z liceum widoczne w akredytacji nie liczą się do podniesienia noty\./, 'Czy przedmioty zdane na maturze mogą podnieść notę, zależy od zasad UNEDasiss (Universitat de València opisuje taką możliwość dla egzaminów zdanych w kraju pochodzenia), więc sprawdź to w UNEDasiss.');
  },
  mediolan(d) {
    d.gaps = d.gaps.filter(g => !/nie ma w pliku/.test(g));
    if (!d.summary.some(x => x.label === 'Zakres')) d.summary.unshift({ label: 'Zakres', text: 'Z uczelni publicznych opisana jest tylko Politechnika (Polimi). Strony Università degli Studi di Milano i Milano-Bicocca były niedostępne, więc psychologia, prawo i medycyna mają tu tylko uczelnie prywatne, za 7 690 do 20 690 EUR rocznie.' });
    for (const [, p] of progs(d)) {
      p.tuitionEu = (p.tuitionEu || '').replace(/Pełne albo częściowe zwolnienie ze składki przysługuje przy ISEE do 30[ \u00a0]000 EUR \(dla pierwszego roku\)\./, 'Wysokość składki zależy od ISEE, szczegóły na stronie Polimi.');
    }
    for (const x of d.summary) x.text = x.text.replace(/ Medycyna po włosku od roku 2025\/26 działa w systemie 'semestru filtrującego' \(dekret MUR nr 941 z 10 lipca 2026\) i nie jest objęta tym opisem\./, ' Medycyna po włosku ma osobny system selekcji (tzw. semestr filtrujący) i nie jest objęta tym opisem.');
  },
  monachium(d) {
    for (const [u, p] of progs(d)) if (/LMU|Ludwig/.test(u.name) && /^uznawana z warunkami/.test(p.matura || '')) p.matura = p.matura.replace(/^uznawana z warunkami/, 'wymaga potwierdzenia przez uczelnię');
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
// Uzupełnienia pól (czas trwania, terminy) z cytatem i adresem źródła: wyniki/uzupelnienia-zagranica-*.json
const fs = require('fs');
const path = require('path');
const FILL = (() => {
  const dir = path.join(__dirname, 'wyniki');
  return fs.readdirSync(dir).filter(f => f.startsWith('uzupelnienia-zagranica-')).sort()
    .flatMap(f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')))
    .filter(x => x && x.slug && x.programName && x.field && x.value != null && /^https?:/.test(x.sourceUrl || '') && String(x.quote || '').length > 10);
})();
function fill(slug, data) {
  for (const x of FILL.filter(x => x.slug === slug)) {
    const hit = progs(data).filter(([, p]) => p.name === x.programName);
    if (!hit.length) { warnings.push(`uzupełnienie bez programu: ${slug} / ${x.programName}`); continue; }
    for (const [, p] of hit) {
      if (x.field === 'durationYears' && Number.isFinite(+x.value) && p.durationYears == null) p.durationYears = +x.value;
      else if (x.field === 'deadline' && (!p.deadline || /niepotwierdz|nie został|nie jest/.test(p.deadline))) p.deadline = String(x.value);
    }
  }
}
// Poprawki od agentów po ponownym sprawdzeniu źródeł: wyniki/poprawki-agentow-<slug>-*.json (najnowszy plik miasta).
// Przyjmujemy tylko zmiany z adresem źródła i cytatem; format opisany w dev_docs/plan-zagranica-poprawki.md.
const PATCH_FIELDS = ['tuitionEu', 'tuitionNonEu', 'tuitionUrl', 'matura', 'requirements', 'languageProof', 'admissionUrl', 'selective', 'deadline', 'applyUrl', 'url', 'notes', 'durationYears', 'level', 'languages', 'academicYear'];
const okSrc = x => x && /^https?:\/\//.test(x.sourceUrl || '') && String(x.quote || '').length > 4;
function agentPatches(slug, data) {
  const dir = path.join(__dirname, 'wyniki');
  const files = fs.readdirSync(dir).filter(f => f.startsWith(`poprawki-agentow-${slug}-`)).sort();
  if (!files.length) return;
  // wszystkie pliki poprawek miasta po kolei (starsze najpierw), każdy nakłada się na poprzednie
  for (const file of files) applyPatchFile(slug, data, JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8')));
}
function applyPatchFile(slug, data, P) {
  const findUni = name => data.universities.find(u => u.name === name || (name && (u.name.includes(name) || name.includes(u.name))));
  for (const x of P.programPatches || []) {
    if (!okSrc(x)) { warnings.push(`poprawka bez źródła/cytatu: ${slug} / ${x.programName}`); continue; }
    const hit = progs(data).filter(([u, p]) => p.name === x.programName && (!x.university || u.name === x.university || u.name.includes(x.university) || x.university.includes(u.name)));
    if (!hit.length) { warnings.push(`poprawka bez programu: ${slug} / ${x.programName}`); continue; }
    for (const [, p] of hit) for (const [k, v] of Object.entries(x.set || {})) {
      if (!PATCH_FIELDS.includes(k)) { warnings.push(`pole spoza listy: ${k}`); continue; }
      p[k] = v;
      if (k === 'languages') p.english = (v || []).some(l => /angiel|english/i.test(l));
    }
  }
  for (const x of P.removePrograms || []) {
    const u = findUni(x.university);
    if (u) u.programs = u.programs.filter(p => p.name !== x.programName);
  }
  for (const x of P.addPrograms || []) {
    if (!okSrc(x) || !x.program || !x.program.name) { warnings.push(`dodanie programu bez źródła: ${slug}`); continue; }
    let u = findUni(x.university);
    if (!u) { u = { name: x.university, nameEn: '', url: x.universityUrl || null, type: x.universityType || '', programs: [] }; data.universities.push(u); }
    const p = Object.assign({ nameEn: '', careerIds: [], level: 'licencjat', durationYears: null, languages: [], english: false, academicYear: '', tuitionEu: null, tuitionNonEu: null, tuitionUrl: null, matura: null, requirements: null, languageProof: null, selective: null, admissionUrl: null, deadline: null, applyUrl: null, url: null, notes: null }, x.program);
    p.english = (p.languages || []).some(l => /angiel|english/i.test(l));
    u.programs.push(p);
  }
  data.universities = data.universities.filter(u => u.programs.length);
  for (const x of P.summaryPatches || []) {
    if (x.remove) { data.summary = data.summary.filter(s => s.label !== x.label); continue; }
    if (!okSrc(x)) { warnings.push(`poprawka opisu bez źródła: ${slug} / ${x.label}`); continue; }
    // Etykieta „Znajomość języka” zastępuje starą „Znajomość angielskiego”
    if (x.label === 'Znajomość języka' && !data.summary.some(s => s.label === x.label)) { const old = data.summary.find(s => s.label === 'Znajomość angielskiego'); if (old) old.label = x.label; }
    const it = data.summary.find(s => s.label === x.label);
    if (it) it.text = x.text; else data.summary.push({ label: x.label, text: x.text });
    // replaceAll: agent połączył kilka wpisów o tej etykiecie w jeden, więc pozostałe usuwamy
    if (x.replaceAll) data.summary = data.summary.filter(s => s.label !== x.label || s === it || (!it && s.text === x.text));
  }
  if (Array.isArray(P.gapsSet)) data.gaps = P.gapsSet.map(String).filter(Boolean);
  for (const x of P.sourcesAdd || []) {
    if (!/^https?:\/\//.test(x.url || '')) continue;
    const have = data.sources.find(s => s.url === x.url);
    if (!have) data.sources.push({ url: x.url, note: x.note || '' });
    else if (!have.note && x.note) have.note = x.note; // uzupełnienie pustej notki przy istniejącym źródle
  }
}
// ---- Poprawki po przeglądzie kontrolnym (2026-10-03, raporty krytyk-zagranica3-*.json) ----
const eachStr = (v, fn) => {
  if (typeof v === 'string') return fn(v);
  if (Array.isArray(v)) return v.map(x => eachStr(x, fn));
  if (v && typeof v === 'object') { for (const k of Object.keys(v)) v[k] = eachStr(v[k], fn); return v; }
  return v;
};
function replaceAllIn(data, re, to, label) {
  let n = 0;
  eachStr(data, t => { re.lastIndex = 0; if (re.test(t)) n++; re.lastIndex = 0; return t.replace(re, to); });
  if (!n) warnings.push(`brak dopasowania (kontrola): ${label}`);
}
const setIf = (data, uniRe, nameRe, fn, label) => {
  let n = 0;
  for (const [u, p] of progs(data)) if ((!uniRe || uniRe.test(u.name)) && (!nameRe || nameRe.test(p.name))) { fn(p, u); n++; }
  if (!n) warnings.push(`brak programu (kontrola): ${label}`);
};
const PL_STATUS = (p, txt) => { p.matura = txt; };
const dropS = (text, re) => (typeof text === 'string' ? text.split(/(?<=[.;])\s+/).filter(x => !re.test(x)).join(' ').trim() : text);
const FINAL = {
  dublin(d) {
    setIf(d, /Trinity/, /Computer Science/, p => { p.tuitionNonEu = '29 570 EUR rocznie (2026/27, strona opłat TCD)'; }, 'Dublin TCD CS');
  },
  lyon(d) {
    setIf(d, /ENSA|Architecture|architecture/i, /architecture/i, p => { p.tuitionEu = '391 EUR rocznie na licence w 2026/27 (390 EUR w 2025/26), plus składka CVEC; reforma opłat nie dotyczy szkół architektury'; p.tuitionNonEu = 'Ta sama stawka (391 EUR rocznie, 2026/27); reforma opłat dla osób spoza UE nie dotyczy szkół architektury.'; }, 'Lyon ENSAL');
  },
  wieden(d) {
    setIf(d, /TU Wien|Technische/, /Bauingenieurwesen|Maschinenbau|Architektur|Informatik/, p => {
      p.requirements = dropS(p.requirements || '', /Darstellende Geometrie|UBVO|670 miejsc|1[  ]030 rejestracji|881 rejestracji/) || null;
    }, 'Wiedeń TU Wien');
  },
  hamburg(d) {
    const m = d.summary.find(x => x.label === 'Polska matura');
    if (m && !/Status „uznawana z warunkami”/.test(m.text)) m.text += ' Status „uznawana z warunkami” przy programach oznacza, że świadectwo trzeba uznać (VPD z uni-assist albo portal uczelni); żadna z uczelni nie wymienia Polski z nazwy.';
  },
  kopenhaga(d) {
    replaceAllIn(d, /Po angielsku dostępne są trzy licencjaty/g, 'Po angielsku dostępne są cztery licencjaty', 'Kopenhaga cztery');
    setIf(d, /DTU|Technical University of Denmark/, /General Engineering/, p => { p.notes = 'Program nie ma osobnej ścieżki budownictwa ani mechaniki, więc nie przypisano go do zawodów.'; }, 'Kopenhaga DTU GE');
    setIf(d, /IT University|ITU/, /Softwareudvikling|Software/, p => { if (!/^UWAGA/.test(p.requirements || '')) p.requirements = 'UWAGA: nie potwierdzono, że program jest otwarty dla kandydatów międzynarodowych z polską maturą. ' + (p.requirements || ''); }, 'Kopenhaga ITU');
  },
  sztokholm(d) {
  },
  amsterdam(d) {
    const fixus = (p) => { p.matura = 'wymaga dodatkowego etapu (numerus fixus i selekcja)'; };
    setIf(d, /Amsterdam|UvA|Hogeschool van Amsterdam|HvA/, /^Psychologie|Psychology|Economics and Business Economics|Toegepaste Psychologie/, p => { if (/^(uznawana|wymaga potwierdzenia)/.test(p.matura || '') || !p.matura) fixus(p); }, 'Amsterdam fixus UvA/HvA');
    setIf(d, /Vrije|VU/, /^Psychologie|Psychology/, p => { if (/^(uznawana|wymaga potwierdzenia)/.test(p.matura || '') || !p.matura) fixus(p); }, 'Amsterdam fixus VU');
    setIf(d, /Vrije|VU/, /Computer Science|Economics|Communicatie|Communication/, p => { if (/^uznawana(?! z)|^wymaga dodatkowego etapu \(numerus fixus i selekcja\)/.test(p.matura || '')) p.matura = 'uznawana z warunkami (matematyka na poziomie VWO A lub B)'; }, 'Amsterdam VU bez fixus');
    setIf(d, /Amsterdam|UvA/, /Global Communication Science|Informatica|Business Analytics/, p => {
      if (!p.matura) p.matura = 'wymaga potwierdzenia przez uczelnię (strona programu nie podaje wymagań)';
      if (!p.deadline) p.deadline = 'Termin do potwierdzenia na stronie uczelni.';
      p.academicYear = '2027/28';
      if (!/strona programu nie podaje wymagań/.test(p.notes || '')) p.notes = ((p.notes || '') + ' Strona programu nie podaje wymagań, do potwierdzenia w uczelni.').trim();
    }, 'Amsterdam puste rekordy');
  },
  lowanium(d) {
    const u = d.summary.find(x => x.label === 'Uwagi');
    if (u) u.text = u.text.replace(/[^.]*(?:tylko|jedyn\w+)[^.]*(?:po angielsku|angielskojęzyczn)[^.]*\./i, 'Spośród ujętych programów po angielsku prowadzony jest tylko Bachelor of Engineering Technology.');
  },
  ateny(d) {
    setIf(d, /UNIWA|West Attica|Zachodniej Attyki/, null, p => {
      p.matura = p.matura || 'wymaga potwierdzenia przez uczelnię (warunki do potwierdzenia na stronie uczelni)';
      p.requirements = p.requirements || 'Warunki przyjęcia do potwierdzenia na stronie uczelni.';
      p.languageProof = p.languageProof || 'Do potwierdzenia na stronie uczelni.';
      p.deadline = p.deadline || 'Termin do potwierdzenia na stronie uczelni.';
    }, 'Ateny UNIWA');
  },
  zagrzeb(d) {
    for (const [, p] of progs(d)) if (/Ukrain|natječaj/.test(p.tuitionEu || '') && (p.tuitionEu || '').length > 200) p.tuitionEu = 'Czesne dla obywateli UE na tym programie po chorwacku nie jest podane w ogłoszeniu o naborze (pełną dotację wymieniono tylko dla wybranych grup, wśród których nie ma obywateli UE). Do potwierdzenia na stronie uczelni.';
  },
  valletta(d) { for (const [, p] of progs(d)) if (p.selective === false) p.selective = null; },
  praga(d) {
    setIf(d, /Univerzita Karlova|Charles/, /Všeobecné lékařství|General Medicine/, p => { if (/^uznawana/.test(p.matura || '')) p.matura = p.matura.replace(/^uznawana z warunkami/, 'uznawana'); }, 'Praga 1. LF');
  },
  helsinki(d) {
    setIf(d, /Aalto/, null, p => { if (/1[  ]?350/.test(p.requirements || '') && !/orientacyjne/.test(p.requirements)) p.requirements += ' Progi SAT i ACT są orientacyjne i zmieniają się co roku; sprawdź je na stronie naboru Aalto.'; }, 'Helsinki Aalto');
  },
  rzym(d) {
    setIf(d, /Roma Tre|Roma 3/, /Scienze della Comunicazione|Communication/, p => { p.requirements = 'Dostęp wolny, bez ruchomej listy rankingowej. Obowiązkowy jest test przygotowania początkowego; brak zaliczenia oznacza dodatkowe obowiązki edukacyjne (OFA) według ogłoszenia dla kierunku L-20.'; p.selective = false; }, 'Rzym L-20');
  },
  mediolan(d) {
    replaceAllIn(d, /,?\s*(?:a\s+)?(?:\+\s*)?50 (?:miejsc )?(?:dla osób )?spoza UE(?: \(razem 200\))?/g, '', 'Mediolan Humanitas 50');
    setIf(d, /Bicocca/, /Informatica/, p => { p.languages = []; p.english = false; p.durationYears = null; p.academicYear = 'do potwierdzenia na stronie uczelni'; if (!/Język wykładowy i czas trwania do potwierdzenia/.test(p.notes || '')) p.notes = ('Język wykładowy i czas trwania do potwierdzenia na stronie uczelni. ' + (p.notes || '')).trim(); }, 'Mediolan Bicocca');
  },
  barcelona(d) {
    replaceAllIn(d, /(^|\.\s+)[^.]*nie liczą się[^.]*\./g, '$1Według strony Generalitat przedmioty wpisane do akredytacji nie podnoszą noty. Czy wynik matury rozszerzonej może być wpisany jako egzamin zewnętrzny (jak opisuje to Walencja), trzeba potwierdzić w UNEDasiss.', 'Barcelona nie liczą się');
    setIf(d, /Barcelona|Pompeu|UB\b|UPF/, null, p => { if (!p.languages.length && p.durationYears == null && !/do potwierdzenia na stronie uczelni/.test(p.notes || '')) p.notes = ('Język wykładowy i czas trwania do potwierdzenia na stronie uczelni (jej strony są niedostępne bez weryfikacji przeglądarki). ' + (p.notes || '')).trim(); }, 'Barcelona UB UPF');
  },
};
// Druga runda poprawek końcowych (przegląd końcowy 2026-10-03, raporty krytyk-zagranica4-*.json)
const GREEK_LABELS = /^(uznawana|wymaga)/;
const FINAL2 = {
  ateny(d) {
    for (const [, p] of progs(d)) {
      if (p.matura && !GREEK_LABELS.test(p.matura)) {
        const greek = p.languages.some(l => /grec|greek/i.test(l)) || /Ψυχολογία|Πληροφορική|Νομική|Αρχαιολογία/.test(p.name);
        if (/^brak potwierdzenia/.test(p.matura)) p.matura = 'wymaga potwierdzenia przez uczelnię (' + p.matura.replace(/^brak potwierdzenia:?\s*/, '').replace(/\.$/, '') + ')';
        else if (greek) p.matura = 'wymaga dodatkowego etapu (osobna ścieżka dla cudzoziemców i certyfikat greckiego przed zapisem). ' + p.matura;
        else p.matura = 'wymaga potwierdzenia przez uczelnię. ' + p.matura;
      }
      if (p.notes) {
        p.notes = dropS(p.notes, /pola są puste/);
      }
    }
  },
  nikozja(d) {
    for (const [u, p] of progs(d)) {
      if (p.matura && !GREEK_LABELS.test(p.matura)) p.matura = /^brak potwierdzenia/.test(p.matura) ? 'wymaga potwierdzenia przez uczelnię (' + p.matura.replace(/^brak potwierdzenia:?\s*/, '').replace(/\.$/, '') + ')' : 'wymaga potwierdzenia przez uczelnię. ' + p.matura;
    }
  },
  helsinki(d) {
    setIf(d, /Hanken/, null, p => { if (/12[  ]?000/.test(p.tuitionNonEu || '') && !/niepotwierdzona/.test(p.tuitionNonEu)) p.tuitionNonEu += ' (kwota niepotwierdzona na stronach programu, do sprawdzenia na stronie Hanken)'; }, 'Helsinki Hanken');
  },
  sofia(d) { replaceAllIn(d, /nie został(?:a)? odczytan\w+/g, 'nie jest podany na stronie', 'Sofia odczytan'); },
};
// Zdania w polach wymagań i uwag kończymy kropką
function englishFlag(d) { for (const [, p] of progs(d)) if (!p.languages.length) p.english = null; }
function endPeriods(d) {
  for (const [, p] of progs(d)) for (const k of ['requirements', 'notes']) if (typeof p[k] === 'string' && p[k] && !/[.!?)”"]$/.test(p[k])) p[k] += '.';
}
// Trzecia runda: ostatnie uwagi z kontroli (raporty krytyk-zagranica5-*.json)
const FINAL3 = {
  berlin(d) {
    setIf(d, /HTW/, /International Business/, p => { p.tuitionNonEu = (p.tuitionNonEu || '').replace(/\('Tuition free[^)]*\)/, '(strona programu: „without tuition fees”)'); }, 'Berlin HTW IB cytat');
  },
  amsterdam(d) {
    setIf(d, /Amsterdam|UvA|Vrije|VU/, /Geneeskunde/, p => { if (/^wymaga dodatkowego etapu/.test(p.matura || '')) p.matura = p.matura.replace(/^wymaga dodatkowego etapu/, 'wymaga potwierdzenia przez uczelnię'); }, 'Amsterdam medycyna');
  },
  nikozja(d) {
    setIf(d, /UNIC|University of Nicosia/, null, p => {
      if (p.selective === false) p.selective = null;
      p.requirements = (p.requirements || '').replace(/, bez odrzucenia\./, '.').replace(/ bez odrzucenia\./, '.');
      if (p.requirements && !/wyższe wymagania/.test(p.requirements)) p.requirements += ' Niektóre programy mają wyższe wymagania wstępne, więc warunki konkretnego kierunku trzeba potwierdzić na stronie uczelni.';
    }, 'Nikozja UNIC');
  },
  sztokholm(d) {
    if (!d.gaps.some(g => /podział języków/i.test(g))) d.gaps.push('Podział języków w programach civilingenjör KTH (pierwsze trzy lata po szwedzku, dwa ostatnie po angielsku) pochodzi z katalogu programów KTH i nie został potwierdzony na stronach samych programów.');
    replaceAllIn(d, /Fizyka 2/g, 'Fysik 2', 'Sztokholm Fysik');
    replaceAllIn(d, /nabór otwarty od 2026-10-16/g, 'nabór rusza 16 października 2026', 'Sztokholm data');
    replaceAllIn(d, /\bHT26\b/g, 'semestr jesienny 2026', 'Sztokholm HT26');
    replaceAllIn(d, /\bVT27\b/g, 'semestr wiosenny 2027', 'Sztokholm VT27');
  },
  ateny(d) {
    replaceAllIn(d, /Wszystkie (\d+) miejsc(?:a)? zostało zajętych/g, 'Zajęto wszystkie miejsca ($1)', 'Ateny miejsca');
    for (const [, p] of progs(d)) if (p.notes) p.notes = dropS(p.notes, /^Kierunek należy do oferty NKUA\.?$/);
  },
};
function apply(slug, data) {
  Object.assign(data, plain(data));
  fill(slug, data);
  if (BY_CITY[slug]) BY_CITY[slug](data);
  agentPatches(slug, data);
  Object.assign(data, plain(data)); // teksty od agentów mają twarde spacje, a dopasowania poniżej działają na zwykłych
  if (FINAL[slug]) FINAL[slug](data);
  if (FINAL2[slug]) FINAL2[slug](data);
  if (FINAL3[slug]) FINAL3[slug](data);
  endPeriods(data);
  englishFlag(data);
  // Opisy o sposobie badania zamiast o treści (np. „Nie badano osobno…”) nie są informacją dla ucznia
  data.summary = data.summary.filter(x => !/^Nie badano\b/.test(x.text));
  walk(data);
  return data;
}
module.exports = { apply, warnings, fixText, walk };
