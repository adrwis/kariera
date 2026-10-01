/* ============================================
   NextMove — Szkoły średnie (licea i technika)
   Widoki: /szkoly (lista z filtrami), /szkola/<rspo> (strona szkoły)
   oraz sekcja „Szkoła średnia” na profilu zawodu.
   ============================================ */

const Szkoly = (function () {
  'use strict';

  const DATA_DIR = 'data/szkoly/';
  const CITIES = {
    gdansk: { name: 'Gdańsk', loc: 'w Gdańsku', files: ['gdansk'] },
    gdynia: { name: 'Gdynia', loc: 'w Gdyni', files: ['gdynia'] },
    sopot: { name: 'Sopot', loc: 'w Sopocie', files: ['sopot'] },
    trojmiasto: { name: 'Trójmiasto', loc: 'w Trójmieście', files: ['gdansk', 'gdynia', 'sopot'] },
    warszawa: { name: 'Warszawa', loc: 'w Warszawie', files: ['warszawa'] },
  };
  const CITY_CHIPS = ['trojmiasto', 'gdansk', 'gdynia', 'sopot', 'warszawa'];
  const DEFAULT_CITY = 'gdansk';

  const SUBJECTS = {
    mat: 'matematyka', pol: 'język polski', ang: 'język angielski', niem: 'język niemiecki',
    fr: 'język francuski', hisz: 'język hiszpański', ros: 'język rosyjski', wlo: 'język włoski',
    bio: 'biologia', chem: 'chemia', fiz: 'fizyka', inf: 'informatyka', geo: 'geografia',
    hist: 'historia', wos: 'WOS', hsz: 'historia sztuki', hmuz: 'historia muzyki', fil: 'filozofia', lac: 'łacina',
    ang_dwj: 'angielski dwujęzyczny', niem_dwj: 'niemiecki dwujęzyczny', fr_dwj: 'francuski dwujęzyczny',
    hisz_dwj: 'hiszpański dwujęzyczny', ros_dwj: 'rosyjski dwujęzyczny', wlo_dwj: 'włoski dwujęzyczny',
    ukr: 'język ukraiński', ukr_dwj: 'ukraiński dwujęzyczny', norw: 'język norweski',
  };

  // Dopełniacz do zdań typu „matury rozszerzonej z biologii”
  const SUBJECTS_GEN = {
    mat: 'matematyki', pol: 'języka polskiego', ang: 'języka angielskiego', niem: 'języka niemieckiego',
    fr: 'języka francuskiego', hisz: 'języka hiszpańskiego', ros: 'języka rosyjskiego', wlo: 'języka włoskiego',
    bio: 'biologii', chem: 'chemii', fiz: 'fizyki', inf: 'informatyki', geo: 'geografii',
    hist: 'historii', wos: 'WOS', hsz: 'historii sztuki', hmuz: 'historii muzyki', fil: 'filozofii', lac: 'łaciny',
  };

  // Przedmioty pokazywane jako chipy w filtrze rozszerzeń
  const FILTER_SUBJECTS = ['mat', 'fiz', 'inf', 'bio', 'chem', 'geo', 'pol', 'hist', 'wos', 'ang'];
  const TYPES = ['liceum', 'technikum'];

  // Zawody z technikum, które prowadzą wprost do zawodu z bazy NextMove
  const CAREER_PROFESSIONS = {
    'technik-informatyk': ['technik informatyk'],
    'programista': ['technik programista'],
    'programista-gier': ['technik programista'],
    'administrator-systemow': ['technik informatyk', 'technik teleinformatyk'],
    'elektryk': ['technik elektryk'],
    'mechanik-samochodowy': ['technik pojazdów samochodowych'],
    'fryzjer': ['technik usług fryzjerskich'],
    'technik-weterynarii': ['technik weterynarii'],
    'fotograf': ['technik fotografii i multimediów'],
    'kucharz': ['technik żywienia i usług gastronomicznych'],
    'geodeta': ['technik geodeta'],
    'spawacz': ['technik spawalnictwa'],
    'stolarz': ['technik technologii drewna'],
    'pilot-wycieczek': ['technik organizacji turystyki'],
    'ksiegowy': ['technik rachunkowości'],
    'architekt-krajobrazu': ['technik architektury krajobrazu', 'technik architektury krajobrazu i arborystyki'],
    'inzynier-budownictwa': ['technik budownictwa'],
    'inzynier-mechanik': ['technik mechanik', 'technik mechatronik'],
    'inzynier-srodowiska': ['technik ochrony środowiska'],
    'grafik': ['technik grafiki i poligrafii cyfrowej'],
    'specjalista-marketingu': ['technik reklamy'],
  };

  let ctx = null;
  const fileCache = {};       // slug pliku -> Promise z danymi
  const setCache = {};        // slug miasta -> Promise ze scalonym zbiorem
  let indexPromise = null;
  let lastCareer = null;      // do przełączania miasta w sekcji na profilu zawodu
  let renderSeq = 0;          // chroni przed wstawieniem wyniku po zmianie widoku
  let backContext = null;     // {href, label} dla linku powrotu ze strony szkoły

  function init(context) { ctx = context; }

  function setBackContext(c) { backContext = c; }

  function fetchJson(url) {
    return fetch(url).then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
  }

  function loadFile(slug) {
    if (!fileCache[slug]) {
      fileCache[slug] = fetchJson(DATA_DIR + slug + '.json').catch(err => { delete fileCache[slug]; throw err; });
    }
    return fileCache[slug];
  }

  // Zbiór szkół dla miasta (Trójmiasto = trzy pliki razem)
  function load(citySlug) {
    const slug = CITIES[citySlug] ? citySlug : currentCity();
    if (!setCache[slug]) {
      setCache[slug] = Promise.all(CITIES[slug].files.map(loadFile)).then(parts => {
        const d = {
          slug, city: CITIES[slug],
          retrieved: parts.map(p => p.retrieved).sort().pop(),
          schools: parts.flatMap(p => p.schools.map(s => ({ ...s, city: s.city || p.city }))),
        };
        prepare(d);
        return d;
      }).catch(err => { delete setCache[slug]; throw err; });
    }
    return setCache[slug];
  }

  // Indeks rspo -> plik miasta, żeby otworzyć stronę szkoły bez wczytywania wszystkich miast
  function loadIndex() {
    if (!indexPromise) indexPromise = fetchJson(DATA_DIR + 'index.json').catch(err => { indexPromise = null; throw err; });
    return indexPromise;
  }

  // Po przywróceniu strony z bfcache przerwane pobrania zostają w pamięci jako wiszące obietnice
  function resetPending() {
    for (const k of Object.keys(fileCache)) delete fileCache[k];
    for (const k of Object.keys(setCache)) delete setCache[k];
    indexPromise = null;
  }

  function currentCity() {
    try {
      const c = localStorage.getItem('kr-miasto');
      if (CITIES[c]) return c;
    } catch (e) { /* brak dostępu do localStorage */ }
    return DEFAULT_CITY;
  }

  function setCity(slug) {
    if (!CITIES[slug]) return;
    try { localStorage.setItem('kr-miasto', slug); } catch (e) { /* ignoruj */ }
  }

  // Średnie z rozszerzeń w mieście (ważone liczbą zdających) z tych samych danych CKE, osobno dla każdego roku matury
  function prepare(d) {
    const acc = {};
    for (const s of d.schools) {
      if (!s.matura) continue;
      const y = s.matura.year;
      for (const [code, v] of Object.entries(s.matura.extended || {})) {
        if (!v || v.mean == null || !v.n) continue;
        acc[y] = acc[y] || {};
        acc[y][code] = acc[y][code] || { sum: 0, n: 0 };
        acc[y][code].sum += v.mean * v.n;
        acc[y][code].n += v.n;
      }
    }
    d.cityMeans = Object.fromEntries(Object.entries(acc).map(([y, subj]) =>
      [y, Object.fromEntries(Object.entries(subj).map(([k, v]) => [k, Math.round(v.sum / v.n * 10) / 10]))]));
  }

  // --- Helpers ---
  const esc = s => ctx.escapeHtml(String(s ?? ''));
  const attr = s => ctx.escapeAttr(String(s ?? ''));

  function subjectName(code) { return SUBJECTS[code] || code; }
  function subjectGen(code) { return SUBJECTS_GEN[code] || subjectName(code); }
  function typeKey(t) { return t === 'technikum' ? 'technikum' : 'liceum'; }
  function typeLabel(t) { return t === 'technikum' ? 'Technikum' : 'Liceum'; }
  function fmtNum(n) { return esc(String(n).replace('.', ',')); }
  function fmtDate(iso) { return esc(String(iso || '').split('-').reverse().join('.')); }

  function plural(n, one, few, many) {
    if (n === 1) return one;
    const d = n % 10, dd = n % 100;
    return d >= 2 && d <= 4 && (dd < 12 || dd > 14) ? few : many;
  }

  function setRobots(value) {
    const m = document.querySelector('meta[name="robots"]');
    if (m) m.setAttribute('content', value);
  }

  function focusHeading(container) {
    const h = container.querySelector('h1');
    if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
  }

  // Wszystkie przedmioty, które uczeń klasy może mieć rozszerzone:
  // obowiązkowe, do wyboru i język klasy dwujęzycznej.
  // Obsługuje też starszy zapis opisowy (np. „fiz albo inf”).
  function profileSubjects(p) {
    const out = new Set();
    const addFrom = v => {
      if (SUBJECTS[v]) { out.add(v); return; }
      String(v).toLowerCase().split(/[^a-ząćęłńóśźż_]+/).forEach(tok => { if (SUBJECTS[tok]) out.add(tok); });
    };
    (p.extended || []).forEach(addFrom);
    (p.extendedChoice || []).flat().forEach(addFrom);
    if (p.bilingual) addFrom(p.bilingual);
    return out;
  }

  function profileMatches(p, subjects) {
    if (!subjects.length) return true;
    const have = profileSubjects(p);
    return subjects.every(code => have.has(code));
  }

  function professionMatches(profession, wanted) {
    if (!profession) return false;
    const p = profession.toLowerCase();
    return wanted.some(w => p.split('/').map(x => x.trim()).includes(w));
  }

  function sourceLink(url, label) {
    return ctx.isHttpUrl(url)
      ? `<a href="${attr(url)}" target="_blank" rel="noopener" class="szkola__src">${esc(label || 'źródło')}</a>`
      : '';
  }

  function schoolYearOf(d) {
    const counts = {};
    d.schools.forEach(s => (s.profiles || []).forEach(p => { if (p.schoolYear) counts[p.schoolYear] = (counts[p.schoolYear] || 0) + 1; }));
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([y]) => y)[0] || '';
  }

  // Numer rzymski z początku nazwy („XIV LO”) do sortowania
  function romanValue(name) {
    const m = /^([IVXLC]+)\s/.exec(name || '');
    if (!m) return Infinity;
    const val = { I: 1, V: 5, X: 10, L: 50, C: 100 };
    let total = 0;
    for (let i = 0; i < m[1].length; i++) {
      const cur = val[m[1][i]], next = val[m[1][i + 1]] || 0;
      total += cur < next ? -cur : cur;
    }
    return total;
  }

  function errorHtml() {
    return `
      <div class="results szkoly">
        <a href="${ctx.BASE}/" class="results__back">&larr; Strona główna</a>
        <h1 class="results__title">Nie udało się wczytać danych o szkołach</h1>
        <p class="results__query">Sprawdź połączenie z internetem i odśwież stronę.</p>
      </div>`;
  }

  function showError(container) {
    container.innerHTML = errorHtml();
    ctx.updateMeta('Błąd wczytywania | NextMove', 'Nie udało się wczytać danych o szkołach.', location.pathname);
    setRobots('noindex');
    focusHeading(container);
  }

  // --- Lista szkół ---
  function readFilters(params, d) {
    const districts = new Set(d.schools.map(s => s.district).filter(Boolean));
    const typ = params.get('typ') || '';
    const dz = params.get('dz') || '';
    return {
      typ: TYPES.includes(typ) ? typ : '',
      rozsz: (params.get('rozsz') || '').split(',').filter(c => FILTER_SUBJECTS.includes(c)),
      dz: districts.has(dz) ? dz : '',
      pub: params.get('pub') === '1',
      q: (params.get('q') || '').trim(),
    };
  }

  function filtersToQuery(f, citySlug) {
    const p = new URLSearchParams();
    if (citySlug) p.set('miasto', citySlug);
    if (f.typ) p.set('typ', f.typ);
    if (f.rozsz.length) p.set('rozsz', f.rozsz.join(','));
    if (f.dz) p.set('dz', f.dz);
    if (f.pub) p.set('pub', '1');
    if (f.q) p.set('q', f.q);
    const s = p.toString();
    return s ? '?' + s : '';
  }

  function hasActiveFilters(f) {
    return !!(f.typ || f.rozsz.length || f.dz || f.pub || f.q);
  }

  // 0 = dokładna nazwa skrócona, 1 = początek słowa, 2 = gdziekolwiek, -1 = brak
  function queryScore(s, q) {
    if (!q) return 0;
    const short = (s.shortName || '').toLowerCase();
    if (short === q || short.startsWith(q + ' ') || short.startsWith(q + ' (')) return 0;
    const hay = (s.name + ' ' + short + ' ' + (s.profiles || []).map(p => p.profession || '').join(' ')).toLowerCase();
    const idx = hay.indexOf(q);
    if (idx === -1) return -1;
    return idx === 0 || /[\s(/,-]/.test(hay[idx - 1]) ? 1 : 2;
  }

  function filterSchools(schools, f) {
    const q = f.q.toLowerCase();
    return schools
      .filter(s => !f.typ || s.type === f.typ)
      .filter(s => !f.dz || s.district === f.dz)
      .filter(s => !f.pub || s.public)
      .map(s => ({ school: s, score: queryScore(s, q), matching: (s.profiles || []).filter(p => profileMatches(p, f.rozsz)) }))
      .filter(x => x.score >= 0)
      .filter(x => !f.rozsz.length || x.matching.length)
      .sort((a, b) => (a.score - b.score)
        || (a.school.type === b.school.type ? 0 : a.school.type === 'liceum' ? -1 : 1)
        || (b.school.public - a.school.public)
        || (romanValue(a.school.shortName) - romanValue(b.school.shortName))
        || (a.school.shortName || a.school.name).localeCompare(b.school.shortName || b.school.name, 'pl', { numeric: true }));
  }

  // Krótka etykieta klasy na liście: nazwa, a przy nazwach z samym symbolem także rozszerzenia
  function profileLabel(p) {
    const ext = (p.extended || []).map(subjectName);
    const lower = (p.name || '').toLowerCase();
    if (ext.length && (p.nameSource || !ext.some(e => lower.includes(e.split(' ').pop().slice(0, 4))))) return `${p.name}: ${ext.join(', ')}`;
    return p.name;
  }

  function maturaBadge(m) {
    if (!m || m.passRate == null) return '';
    if (m.examinees && m.examinees < 20) {
      return `<span class="szkoly__badge">matura: ${esc(m.examinees)} ${plural(m.examinees, 'osoba', 'osoby', 'osób')}</span>`;
    }
    return `<span class="szkoly__badge">zdawalność matury ${fmtNum(m.passRate)}%</span>`;
  }

  function schoolCard(s, matching, f, showCity) {
    const list = f.rozsz.length ? matching : s.profiles || [];
    const shown = list.slice(0, 4);
    const more = list.length - shown.length;
    const hasThresholds = (s.profiles || []).some(p => (p.thresholds || []).length);
    const badges = [
      `<span class="szkoly__badge szkoly__badge--${typeKey(s.type)}">${typeLabel(s.type)}</span>`,
      `<span class="szkoly__badge">${s.public ? 'publiczna' : 'niepubliczna'}</span>`,
      showCity && s.city ? `<span class="szkoly__badge">${esc(s.city)}</span>` : '',
      s.district ? `<span class="szkoly__badge">${esc(s.district)}</span>` : '',
      maturaBadge(s.matura),
      hasThresholds ? '<span class="szkoly__badge szkoly__badge--progi">progi punktowe</span>' : '',
    ].join('');
    const profilesHtml = shown.length
      ? `<ul class="szkoly__card-profiles">${shown.map(p => `<li>${esc(profileLabel(p))}</li>`).join('')}${more > 0 ? `<li class="szkoly__more">i ${more} więcej</li>` : ''}</ul>`
      : '<p class="szkoly__card-none">Brak danych o klasach w NextMove.</p>';
    return `
      <li>
        <a class="result-card szkoly__card" href="${ctx.BASE}/szkola/${attr(s.rspo)}">
          <div class="result-card__name">${esc(s.shortName || s.name)}</div>
          <div class="result-card__code">${esc(s.name)}</div>
          <div class="szkoly__badges">${badges}</div>
          ${profilesHtml}
        </a>
      </li>`;
  }

  function renderListShell(container, d, f) {
    const districts = [...new Set(d.schools.map(s => s.district).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pl'));
    const year = schoolYearOf(d);
    const activeCount = (f.typ ? 1 : 0) + f.rozsz.length + (f.dz ? 1 : 0) + (f.pub ? 1 : 0);
    container.innerHTML = `
      <div class="results szkoly">
        <div class="results__header">
          <a href="${ctx.BASE}/" class="results__back">&larr; Strona główna</a>
          <h1 class="results__title">Szkoły średnie ${esc(d.city.loc)}</h1>
          <p class="results__query">Licea i technika dla absolwentów podstawówki.${year ? ` Oferta klas na rok ${esc(year)}.` : ''}</p>
          <p class="career-column__text"><a href="${ctx.BASE}/kalkulator?miasto=${d.slug}" class="szkoly__calc-link">Policz swoje punkty i sprawdź, gdzie masz szansę</a></p>
          <nav class="szkoly__cities" aria-label="Miasto">
            ${CITY_CHIPS.map(c => `<a href="${ctx.BASE}/szkoly?miasto=${c}" class="szkoly__city${c === d.slug ? ' szkoly__city--active' : ''}"${c === d.slug ? ' aria-current="page"' : ''}>${esc(CITIES[c].name)}</a>`).join('')}
          </nav>
          <details class="szkoly__filters-wrap"${activeCount || window.innerWidth > 700 ? ' open' : ''}>
            <summary class="szkoly__filters-toggle">Filtry${activeCount ? ` (${activeCount})` : ''}</summary>
            <form class="szkoly__filters" id="szkolyFilters">
              <fieldset class="szkoly__fieldset">
                <legend class="szkoly__legend">Rodzaj szkoły</legend>
                <div class="szkoly__chips">
                  ${[['', 'Wszystkie'], ['liceum', 'Licea'], ['technikum', 'Technika']].map(([v, l]) => `
                    <label class="szkoly__chip"><input type="radio" name="typ" value="${v}"${f.typ === v ? ' checked' : ''}> ${l}</label>`).join('')}
                </div>
              </fieldset>
              <fieldset class="szkoly__fieldset">
                <legend class="szkoly__legend">Przedmioty rozszerzone w klasie</legend>
                <div class="szkoly__chips">
                  ${FILTER_SUBJECTS.map(c => `
                    <label class="szkoly__chip"><input type="checkbox" name="rozsz" value="${c}"${f.rozsz.includes(c) ? ' checked' : ''}> ${esc(subjectName(c))}</label>`).join('')}
                </div>
              </fieldset>
              <div class="szkoly__row">
                <label class="szkoly__field">
                  <span class="szkoly__legend">Dzielnica</span>
                  <select name="dz" class="szkoly__select">
                    <option value="">Wszystkie</option>
                    ${districts.map(x => `<option value="${attr(x)}"${f.dz === x ? ' selected' : ''}>${esc(x)}</option>`).join('')}
                  </select>
                </label>
                <label class="szkoly__field">
                  <span class="szkoly__legend">Nazwa szkoły lub zawód</span>
                  <input type="search" name="q" class="szkoly__select" value="${attr(f.q)}" placeholder="np. V LO, technik informatyk" autocomplete="off">
                </label>
                <label class="szkoly__chip szkoly__chip--solo"><input type="checkbox" name="pub" value="1"${f.pub ? ' checked' : ''}> Tylko publiczne</label>
              </div>
            </form>
          </details>
          <p class="results__count" id="szkolyCount" aria-live="polite"></p>
        </div>
        <ul class="results__list szkoly__list" id="szkolyList"></ul>
        <p class="szkoly__footnote">Źródła: RSPO (MEN, licencja CC BY 4.0), wyniki matur CKE, strony i regulaminy rekrutacji szkół. Na stronie każdej szkoły są linki do konkretnych dokumentów. Dane z ${fmtDate(d.retrieved)}.</p>
      </div>`;

    const form = container.querySelector('#szkolyFilters');
    const update = () => {
      const fd = new FormData(form);
      const nf = {
        typ: fd.get('typ') || '',
        rozsz: fd.getAll('rozsz'),
        dz: fd.get('dz') || '',
        pub: fd.get('pub') === '1',
        q: (fd.get('q') || '').trim(),
      };
      history.replaceState(null, '', ctx.BASE + '/szkoly' + filtersToQuery(nf, d.slug));
      renderListResults(container, d, nf);
    };
    form.addEventListener('change', e => { if (e.target.name !== 'q') update(); });
    let timer = null;
    form.addEventListener('input', e => {
      if (e.target.name !== 'q') return;
      clearTimeout(timer);
      timer = setTimeout(update, 250);
    });
    form.addEventListener('submit', e => { e.preventDefault(); update(); });
  }

  function renderListResults(container, d, f) {
    const list = container.querySelector('#szkolyList');
    const count = container.querySelector('#szkolyCount');
    const res = filterSchools(d.schools, f);
    const showCity = CITIES[d.slug].files.length > 1;
    backContext = { href: location.pathname + location.search, label: 'Wróć do listy szkół' };
    if (res.length) {
      count.textContent = `Pasujące szkoły: ${res.length}`;
      list.innerHTML = res.map(x => schoolCard(x.school, x.matching, f, showCity)).join('');
      return;
    }
    count.textContent = 'Żadna szkoła nie pasuje do tych filtrów.';
    list.innerHTML = `
      <li class="szkoly__empty">
        ${f.rozsz.length > 1 ? 'Spróbuj wybrać mniej przedmiotów naraz. ' : ''}
        ${hasActiveFilters(f) ? `<a href="${ctx.BASE}/szkoly?miasto=${d.slug}" class="szkoly__clear">Wyczyść filtry</a>` : ''}
      </li>`;
  }

  async function renderList(container, params) {
    const my = ++renderSeq;
    const citySlug = CITIES[params.get('miasto')] ? params.get('miasto') : currentCity();
    if (params.get('miasto') && params.get('miasto') !== citySlug) {
      params.set('miasto', citySlug);
      history.replaceState(null, '', `${ctx.BASE}/szkoly?${params}`);
    }
    setCity(citySlug);
    container.innerHTML = '<p class="szkoly__loading">Wczytuję szkoły…</p>';
    let d;
    try { d = await load(citySlug); } catch (e) { if (my === renderSeq) showError(container); return; }
    if (my !== renderSeq) return;
    setRobots('index, follow');
    ctx.updateMeta(`Szkoły średnie ${d.city.loc} | NextMove`, `Licea i technika ${d.city.loc}: klasy, przedmioty rozszerzone, wyniki matur i progi punktowe.`, `${ctx.BASE}/szkoly?miasto=${d.slug}`);
    const f = readFilters(params, d);
    renderListShell(container, d, f);
    renderListResults(container, d, f);
    focusHeading(container);
  }

  // --- Strona szkoły ---
  function thresholdHtml(p) {
    const th = (p.thresholds || []).slice().sort((a, b) => b.year - a.year);
    if (!th.length) return '';
    return th.map(t => {
      const who = t.kind === 'wstępna kwalifikacja' ? 'wstępna kwalifikacja' : t.kind ? 'ostatnia osoba zakwalifikowana' : 'ostatnia osoba przyjęta';
      const admitted = t.qualified != null && t.places
        ? `<div class="szkola__muted">Przyjętych: ${esc(t.qualified)} na ${esc(t.places)} ${plural(t.places, 'miejsce', 'miejsca', 'miejsc')}.</div>`
        : '';
      return `<div class="szkola__threshold">Próg ${esc(t.year)}: <strong>${fmtNum(t.min)} z ${esc(t.scale)} pkt</strong> <span class="szkola__muted">(${who})</span> ${sourceLink(t.sourceUrl)}${admitted}</div>`;
    }).join('');
  }

  function profileHtml(p, isTech) {
    const ext = (p.extended || []).map(subjectName);
    const choice = (p.extendedChoice || []).map(g => g.map(subjectName).join(' lub '));
    const other = p.extendedOther || [];
    const rows = [
      isTech && p.profession ? `<div><dt>Zawód</dt><dd>${esc(p.profession)}${(p.qualifications || []).length ? ` · kwalifikacje ${p.qualifications.map(esc).join(', ')}` : ''}</dd></div>` : '',
      ext.length ? `<div><dt>Rozszerzenia</dt><dd>${ext.map(esc).join(', ')}</dd></div>` : '',
      choice.length ? `<div><dt>Do wyboru</dt><dd>${choice.map(esc).join('; ')}</dd></div>` : '',
      other.length ? `<div><dt>Inne rozszerzenia</dt><dd>${other.map(esc).join(', ')}</dd></div>` : '',
      p.bilingual ? `<div><dt>Klasa dwujęzyczna</dt><dd>${esc(subjectName(p.bilingual))}</dd></div>` : '',
      (p.languages || []).length ? `<div><dt>Języki</dt><dd>${p.languages.map(c => esc(subjectName(c))).join(', ')}</dd></div>` : '',
      (p.scoredSubjects || []).length ? `<div><dt>Oceny brane do punktacji</dt><dd>${p.scoredSubjects.map(c => esc(subjectName(c))).join(', ')}</dd></div>` : '',
      p.places ? `<div><dt>Miejsca</dt><dd>${esc(p.places)}</dd></div>` : '',
    ].join('');
    return `
      <li class="szkola__profile">
        <h3 class="szkola__profile-name">${esc(p.name)}</h3>
        <dl class="szkola__dl">${rows}</dl>
        ${thresholdHtml(p)}
        <div class="szkola__profile-src">${sourceLink(p.sourceUrl, 'źródło oferty')}</div>
      </li>`;
  }

  function maturaHtml(m, cityMeans, cityName, cityLoc) {
    if (!m) return '<p class="career-column__empty">CKE nie podaje wyników matury dla tej szkoły (np. szkoła nie ma jeszcze absolwentów).</p>';
    const ext = Object.entries(m.extended || {})
      .filter(([, v]) => v && v.n)
      .sort((a, b) => b[1].n - a[1].n);
    const rows = ext.map(([code, v]) => `
      <tr><td>${esc(subjectName(code))}</td><td>${esc(v.n)}</td><td>${v.mean != null ? fmtNum(v.mean) + '%' : '<span class="szkola__muted">poniżej 5</span>'}</td><td>${cityMeans[code] != null ? fmtNum(cityMeans[code]) + '%' : ''}</td></tr>`).join('');
    const n = m.examinees;
    return `
      <p class="career-column__text">${m.passRate != null ? `Zdawalność: <strong>${fmtNum(m.passRate)}%</strong>` : 'CKE nie podaje zdawalności (za mało zdających)'}${n ? `, zdawało ${esc(n)} ${plural(n, 'osoba', 'osoby', 'osób')}` : ''}. ${sourceLink(m.sourceUrl, 'dane CKE')}</p>
      ${rows ? `
      <div class="szkola__table-wrap">
        <table class="school-popup__thresholds szkola__matura">
          <caption class="school-popup__caption">Matura rozszerzona: ile osób zdawało i średni wynik. Ostatnia kolumna to średnia wszystkich szkół ${esc(cityLoc)} z tym przedmiotem, dla porównania.</caption>
          <thead><tr><th>Przedmiot</th><th>Zdających</th><th>Średnia</th><th>${esc(cityName)}</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>` : ''}`;
  }

  function relatedCareersHtml(s) {
    if (typeof CareerSearch === 'undefined' || !CareerSearch.careers) return '';
    const professions = (s.profiles || []).map(p => p.profession).filter(Boolean);
    let careers;
    let intro = '';
    if (s.type === 'technikum') {
      careers = CareerSearch.careers.filter(c => {
        const wanted = CAREER_PROFESSIONS[c.id];
        return wanted && professions.some(p => professionMatches(p, wanted));
      });
    } else {
      // Licea: zawody, dla których uczelnie wymagają rozszerzeń dostępnych w tej szkole
      careers = CareerSearch.careers.filter(c => {
        const { required } = careerMaturaGroups(c);
        return required.length && (s.profiles || []).some(p => profileCovers(p, required));
      });
      intro = '<p class="career-column__text szkola__muted">Zawody, na które uczelnie wymagają konkretnej matury rozszerzonej, a ta szkoła ma klasę z takimi przedmiotami. Na pozostałe kierunki przyjmują absolwentów każdego liceum.</p>';
    }
    if (!careers.length) return '';
    return `
      <section class="szkola__section">
        <h2 class="career-column__title">Dokąd prowadzi ta szkoła</h2>
        ${intro}
        <div class="popular__tags szkola__tags">
          ${careers.map(c => `<a href="${ctx.BASE}/zawod/${attr(c.id)}" class="popular__tag">${esc(c.name)}</a>`).join('')}
        </div>
      </section>`;
  }

  function notFound(container) {
    container.innerHTML = `
      <div class="results szkoly">
        <a href="${ctx.BASE}/szkoly" class="results__back">&larr; Wszystkie szkoły</a>
        <h1 class="results__title">Nie ma takiej szkoły w bazie</h1>
        <p class="results__query">Na razie są tu licea i technika z Gdańska, Gdyni, Sopotu i Warszawy.</p>
      </div>`;
    ctx.updateMeta('Nie znaleziono szkoły | NextMove', 'Tej szkoły nie ma w bazie NextMove.', location.pathname);
    setRobots('noindex');
    focusHeading(container);
  }

  async function renderDetail(container, rspo) {
    const my = ++renderSeq;
    container.innerHTML = '<p class="szkoly__loading">Wczytuję szkołę…</p>';
    let d, s;
    try {
      const idx = await loadIndex();
      const file = idx.rspo && idx.rspo[String(rspo)];
      if (file) {
        const citySlug = Object.keys(CITIES).find(k => CITIES[k].files.length === 1 && CITIES[k].files[0] === file);
        d = await load(citySlug);
        s = d.schools.find(x => String(x.rspo) === String(rspo));
      }
    } catch (e) { if (my === renderSeq) showError(container); return; }
    if (my !== renderSeq) return;
    if (!s) { notFound(container); return; }
    setRobots('index, follow');
    const isTech = s.type === 'technikum';
    const profiles = s.profiles || [];
    const anyThresholds = profiles.some(p => (p.thresholds || []).length);
    const year = profiles.map(p => p.schoolYear).find(Boolean) || schoolYearOf(d);
    const back = backContext || { href: `${ctx.BASE}/szkoly?miasto=${d.slug}`, label: `Szkoły ${d.city.loc}` };
    container.innerHTML = `
      <div class="results szkoly szkola">
        <a href="${attr(back.href)}" class="results__back">&larr; ${esc(back.label)}</a>
        <div class="career-hero">
          <h1 class="career-hero__name">${esc(s.shortName || s.name)}</h1>
          <p class="career-hero__aliases">${esc(s.name)}</p>
          <div class="szkoly__badges">
            <span class="szkoly__badge szkoly__badge--${typeKey(s.type)}">${typeLabel(s.type)}</span>
            <span class="szkoly__badge">${s.public ? 'publiczna' : 'niepubliczna'}</span>
            ${s.district ? `<span class="szkoly__badge">${esc(s.district)}</span>` : ''}
          </div>
          <p class="career-hero__desc">
            ${esc(s.address || '')}${s.students ? ` · ${esc(s.students)} ${plural(s.students, 'uczeń', 'uczniów', 'uczniów')}` : ''}
            ${ctx.isHttpUrl(s.url) ? ` · <a href="${attr(s.url)}" target="_blank" rel="noopener">strona szkoły</a>` : ''}
          </p>
        </div>

        <section class="szkola__section">
          <h2 class="career-column__title">Klasy${year ? ` w roku ${esc(year)}` : ''}</h2>
          ${anyThresholds ? '<p class="career-column__text szkola__muted">Próg to liczba punktów ostatniej osoby przyjętej albo zakwalifikowanej do klasy, tak jak podaje źródło. Zwykle skala wynosi od 0 do 200: połowa to egzamin ósmoklasisty, połowa oceny ze świadectwa i osiągnięcia. Klasy ze sprawdzianem (sportowe, dwujęzyczne) mogą mieć wyższą skalę, podaną przy progu.</p>' : ''}
          ${profiles.length
            ? `<ul class="szkola__profiles">${profiles.map(p => profileHtml(p, isTech)).join('')}</ul>`
            : '<p class="career-column__empty">Brak danych o klasach w NextMove. Ofertę sprawdzisz na stronie szkoły.</p>'}
          ${s.admission ? `<p class="career-column__text">${esc(s.admission)}</p>` : ''}
          ${profiles.length && !anyThresholds ? '<p class="career-column__text szkola__muted">Szkoła nie publikuje progów punktowych.</p>' : ''}
        </section>

        <section class="szkola__section">
          <h2 class="career-column__title">Matura${s.matura ? ` ${esc(s.matura.year)}` : ''}</h2>
          ${maturaHtml(s.matura, (d.cityMeans || {})[s.matura ? s.matura.year : 0] || {}, d.city.name, d.city.loc)}
        </section>

        ${relatedCareersHtml(s)}

        <section class="szkola__section career-sources career-sources--detail">
          <h2 class="career-column__title">Źródła</h2>
          <ul class="szkola__sources">
            ${(s.sources || []).map(src => `<li>${sourceLink(src.url, src.name)}${src.retrieved ? `, pobrano ${fmtDate(src.retrieved)}` : ''}</li>`).join('')}
          </ul>
        </section>
      </div>`;
    ctx.updateMeta(`${s.shortName || s.name} | ${s.city || d.city.name} | NextMove`, `${typeLabel(s.type)} ${CITIES[d.slug].loc}: klasy, rozszerzenia, wyniki matur.`, `${ctx.BASE}/szkola/${s.rspo}`);
    ctx.announce(`Szkoła: ${s.shortName || s.name}`);
    focusHeading(container);
  }

  // --- Sekcja na profilu zawodu ---
  // Z zweryfikowanych wymagań uczelni wybiera grupy przedmiotów, które coś zawężają:
  // najwyżej 3 przedmioty do wyboru, bez „dowolnego” i „dowolnego języka obcego”.
  // required: uczelnia wymaga rozszerzenia (R); recommended: liczy P lub R, ale R daje więcej punktów.
  const groupsCache = new Map();
  function careerMaturaGroups(career) {
    if (groupsCache.has(career.id)) return groupsCache.get(career.id);
    const schools = ((career.education && career.education.schools) || []).filter(s => s.requirementsStructured && s.requirementsStructured.length);
    const count = { R: new Map(), PR: new Map() };
    for (const s of schools) {
      const seen = new Set();
      for (const g of s.requirementsStructured) {
        const codes = (g.anyOf || []).filter(c => SUBJECTS[c]);
        if (!codes.length || codes.length !== (g.anyOf || []).length || codes.length > 3) continue;
        const bucket = g.level === 'R' ? 'R' : g.level === 'P lub R' ? 'PR' : null;
        if (!bucket) continue;
        const key = bucket + ':' + [...codes].sort().join('|');
        if (seen.has(key)) continue;
        seen.add(key);
        count[bucket].set(key, (count[bucket].get(key) || 0) + 1);
      }
    }
    const pick = bucket => [...count[bucket].entries()]
      .filter(([, n]) => schools.length && n / schools.length >= 0.5)
      .map(([k]) => k.split(':')[1].split('|'));
    let required = pick('R');
    // Grupa „chemia lub fizyka” jest zbędna, jeśli chemia i tak jest wymagana osobno
    const singles = new Set(required.filter(g => g.length === 1).map(g => g[0]));
    required = required.filter(g => g.length === 1 || !g.some(c => singles.has(c)));
    const requiredKeys = new Set(required.map(g => g.join('|')));
    const recommended = pick('PR').filter(g => !requiredKeys.has(g.join('|')) && !g.some(c => singles.has(c)));
    const out = { required, recommended, schoolsCounted: schools.length };
    groupsCache.set(career.id, out);
    return out;
  }

  function profileCovers(p, groups) {
    const have = profileSubjects(p);
    return groups.every(g => g.some(code => have.has(code)));
  }

  // „z biologii i chemii, a także z fizyki lub matematyki”
  function groupsSentence(groups) {
    const singles = groups.filter(g => g.length === 1).map(g => subjectGen(g[0]));
    const multi = groups.filter(g => g.length > 1).map(g => 'z ' + g.map(subjectGen).join(' lub '));
    const parts = [];
    if (singles.length) parts.push('z ' + (singles.length > 1 ? singles.slice(0, -1).join(', ') + ' i ' + singles[singles.length - 1] : singles[0]));
    return [parts.join(''), ...multi].filter(Boolean).join(', a także ');
  }

  function filterHref(groups, citySlug) {
    const codes = groups.filter(g => g.length === 1).map(g => g[0]).filter(c => FILTER_SUBJECTS.includes(c));
    return `${ctx.BASE}/szkoly?miasto=${citySlug}&typ=liceum${codes.length ? '&rozsz=' + codes.join(',') : ''}`;
  }

  async function careerSectionHtml(career) {
    lastCareer = career;
    let d;
    try { d = await load(currentCity()); } catch (e) { return ''; }
    const wanted = CAREER_PROFESSIONS[career.id];
    const tech = wanted
      ? d.schools.filter(s => s.type === 'technikum' && (s.profiles || []).some(p => professionMatches(p.profession, wanted)))
      : [];
    const { required, recommended } = careerMaturaGroups(career);
    const lo = required.length
      ? d.schools.filter(s => s.type === 'liceum').map(s => ({ s, ps: (s.profiles || []).filter(p => profileCovers(p, required)) })).filter(x => x.ps.length)
        .sort((a, b) => (romanValue(a.s.shortName) - romanValue(b.s.shortName)) || (a.s.shortName || a.s.name).localeCompare(b.s.shortName || b.s.name, 'pl'))
      : [];
    const citySwitch = `
      <p class="career-secondary__cities">Miasto:
        ${CITY_CHIPS.map(c => `<button type="button" class="szkoly__city${c === d.slug ? ' szkoly__city--active' : ''}" data-city="${c}" aria-pressed="${c === d.slug}">${esc(CITIES[c].name)}</button>`).join('')}
      </p>`;
    if (!tech.length && !lo.length && !recommended.length) {
      return `
      <section class="career-secondary">
        <h2 class="career-column__title">Szkoła średnia ${esc(d.city.loc)}</h2>
        ${citySwitch}
        <p class="career-column__text">Nie znaleźliśmy technikum z tym zawodem ${esc(d.city.loc)}, a uczelnie nie wymagają konkretnych rozszerzeń.</p>
        <a href="${ctx.BASE}/szkoly?miasto=${d.slug}" class="career-secondary__all">Wszystkie licea i technika ${esc(d.city.loc)}</a>
      </section>`;
    }

    const techHtml = tech.length ? `
      <h3 class="career-column__subtitle">Technika z tym zawodem</h3>
      <ul class="szkoly__mini">
        ${tech.slice(0, 6).map(s => `<li><a href="${ctx.BASE}/szkola/${attr(s.rspo)}">${esc(s.shortName || s.name)}</a> <span class="szkola__muted">· ${esc([CITIES[d.slug].files.length > 1 ? s.city : '', s.district].filter(Boolean).join(', '))}</span></li>`).join('')}
      </ul>
      ${tech.length > 6 ? `<p class="career-column__text"><a href="${ctx.BASE}/szkoly?miasto=${d.slug}&typ=technikum&q=${encodeURIComponent(wanted[0])}">Zobacz wszystkie ${tech.length} ${plural(tech.length, 'technikum', 'technika', 'techników')}</a></p>` : ''}` : '';

    let loHtml = '';
    const MAX_LO = 6;
    if (lo.length) {
      loHtml = `
      <h3 class="career-column__subtitle">Licea z pasującymi klasami</h3>
      <p class="career-column__text szkola__muted">Uczelnie na tej stronie zwykle wymagają matury rozszerzonej ${esc(groupsSentence(required))}.</p>
      <ul class="szkoly__mini">
        ${lo.slice(0, MAX_LO).map(x => `<li><a href="${ctx.BASE}/szkola/${attr(x.s.rspo)}">${esc(x.s.shortName || x.s.name)}</a> <span class="szkola__muted">· ${CITIES[d.slug].files.length > 1 && x.s.city ? esc(x.s.city) + ', ' : ''}${x.ps.map(p => esc(profileLabel(p))).join('; ')}</span></li>`).join('')}
      </ul>
      ${lo.length > MAX_LO ? `<p class="career-column__text"><a href="${attr(filterHref(required, d.slug))}">Zobacz wszystkie ${lo.length} ${plural(lo.length, 'liceum', 'licea', 'liceów')}</a></p>` : ''}`;
    } else if (recommended.length) {
      loHtml = `
      <h3 class="career-column__subtitle">Liceum</h3>
      <p class="career-column__text">Uczelnie przyjmują z maturą podstawową albo rozszerzoną, więc pasuje każde liceum. Więcej punktów da rozszerzenie ${esc(groupsSentence(recommended))}.</p>
      <p class="career-column__text"><a href="${attr(filterHref(recommended, d.slug))}">Licea z takimi klasami</a></p>`;
    }

    return `
      <section class="career-secondary">
        <h2 class="career-column__title">Szkoła średnia ${esc(d.city.loc)}</h2>
        ${citySwitch}
        ${techHtml}
        ${loHtml}
        <a href="${ctx.BASE}/szkoly?miasto=${d.slug}" class="career-secondary__all">Wszystkie licea i technika ${esc(d.city.loc)}</a>
      </section>`;
  }

  // Przełączanie miasta w sekcji na profilu zawodu
  document.addEventListener('click', e => {
    const btn = e.target.closest('.career-secondary [data-city]');
    if (!btn || !lastCareer) return;
    const section = btn.closest('.career-secondary');
    const career = lastCareer;
    const previous = currentCity();
    const slug = btn.dataset.city;
    load(slug).then(() => {
      setCity(slug);
      return careerSectionHtml(career);
    }).catch(() => {
      setCity(previous);
      const msg = section.querySelector('.career-secondary__error') || section.appendChild(Object.assign(document.createElement('p'), { className: 'career-column__text career-secondary__error' }));
      msg.textContent = 'Nie udało się wczytać szkół z tego miasta. Spróbuj ponownie.';
      return '';
    }).then(html => {
      if (!html || !section.isConnected || lastCareer !== career) return;
      section.outerHTML = html;
      const again = document.querySelector(`.career-secondary [data-city="${btn.dataset.city}"]`);
      if (again) again.focus();
    });
  });

  // --- Kalkulator punktów ósmoklasisty ---
  // Wzór: rozporządzenie Ministra Edukacji z 3 kwietnia 2025 r., Dz.U. 2025 poz. 464, § 3 do § 7.
  // Pierwszeństwo laureatów i finalistów: art. 132 ustawy Prawo oświatowe.
  const LAW_URL = 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20250000464';
  const GRADES = [['', 'wybierz'], ['6', 'celujący, 18'], ['5', 'bardzo dobry, 17'], ['4', 'dobry, 14'], ['3', 'dostateczny, 8'], ['2', 'dopuszczający, 2']];
  const GRADE_POINTS = { 6: 18, 5: 17, 4: 14, 3: 8, 2: 2 };
  // Oceny, o które pytamy; drugi język obcy obejmuje niemiecki, francuski, hiszpański, rosyjski, włoski
  const CALC_SUBJECTS = [['pol', 'Język polski'], ['mat', 'Matematyka'], ['ang', 'Język angielski'], ['obcy2', 'Drugi język obcy'],
    ['bio', 'Biologia'], ['chem', 'Chemia'], ['fiz', 'Fizyka'], ['geo', 'Geografia'], ['hist', 'Historia'], ['inf', 'Informatyka'], ['wos', 'WOS']];
  const SECOND_LANG = ['niem', 'fr', 'hisz', 'ros', 'wlo'];
  const MARGIN = 5;
  const CLOSE_MISS = 15;

  function clampNum(v, min, max) {
    const n = parseFloat(String(v).replace(',', '.'));
    if (Number.isNaN(n) || n < min || n > max) return null;
    return n;
  }

  // Punkty za jeden wpis ze scoredSubjects; null = nie da się ustalić (brak oceny albo nieznany przedmiot)
  function gradeFor(item, g) {
    const raw = String(item).toLowerCase();
    if (raw.includes('/')) {
      const vals = raw.split('/').map(x => gradeFor(x.trim(), g));
      return vals.some(v => v === null) ? null : Math.max(...vals);
    }
    if (/obcy|język obcy/.test(raw)) {
      const vals = [g.ang, g.obcy2].filter(v => v != null);
      return vals.length ? Math.max(...vals) : null;
    }
    const code = SECOND_LANG.includes(raw) ? 'obcy2' : raw;
    return g[code] != null ? g[code] : null;
  }

  // Punkty z ocen dla klasy: według jej przedmiotów punktowanych albo ostrożnie, gdy ich nie znamy
  function gradePointsFor(p, g) {
    const scored = (p.scoredSubjects || []).filter(Boolean);
    if (scored.length === 4) {
      const vals = scored.map(x => gradeFor(x, g));
      if (vals.every(v => v !== null)) return { points: vals.reduce((x, y) => x + y, 0), mode: 'exact' };
      return { points: null, mode: 'missing', missing: scored.filter((x, i) => vals[i] === null) };
    }
    if (g.pol == null || g.mat == null) return { points: null, mode: 'missing', missing: ['pol', 'mat'].filter(k => g[k] == null) };
    const others = Object.entries(g).filter(([k, v]) => k !== 'pol' && k !== 'mat' && v != null).map(([, v]) => v).sort((x, y) => x - y);
    if (others.length < 2) return { points: null, mode: 'missing', missing: ['dwa inne przedmioty'] };
    return { points: g.pol + g.mat + others[0] + others[1], mode: 'cautious' };
  }

  function readCalc(form) {
    const fd = new FormData(form);
    const o = {};
    for (const [k, v] of fd.entries()) o[k] = v;
    o.wyr = fd.get('wyr') === '1';
    o.wol = fd.get('wol') === '1';
    return o;
  }
  function saveCalc(o) { try { sessionStorage.setItem('kr-kalkulator', JSON.stringify(o)); } catch (e) { /* ignoruj */ } }
  function loadCalc() { try { return JSON.parse(sessionStorage.getItem('kr-kalkulator') || '{}'); } catch (e) { return {}; } }

  function parseCalc(f) {
    const exam = {};
    const invalid = [];
    for (const k of ['pol', 'mat', 'obcy']) {
      if (f[k] === undefined || String(f[k]).trim() === '') { exam[k] = null; continue; }
      exam[k] = clampNum(f[k], 0, 100);
      if (exam[k] === null) invalid.push(k);
    }
    const osiRaw = String(f.osi ?? '').trim();
    const osi = osiRaw === '' ? 0 : clampNum(osiRaw, 0, 18);
    if (osi === null) invalid.push('osi');
    const g = {};
    for (const [k] of CALC_SUBJECTS) g[k] = f['g_' + k] ? GRADE_POINTS[f['g_' + k]] : null;
    const examComplete = ['pol', 'mat', 'obcy'].every(k => exam[k] !== null);
    const examPts = examComplete ? exam.pol * 0.35 + exam.mat * 0.35 + exam.obcy * 0.3 : null;
    const extra = (f.wyr ? 7 : 0) + (f.wol ? 3 : 0) + (osi ? Math.round(osi) : 0);
    return { exam, examPts, extra, g, invalid, osi: osi ? Math.round(osi) : 0 };
  }

  function latestThreshold(p) {
    return (p.thresholds || []).filter(t => typeof t.min === 'number' && t.scale === 200).sort((a, b) => b.year - a.year)[0] || null;
  }

  function calcResultsHtml(d, c, typ) {
    const rows = [];
    let otherScale = 0;
    const missingCount = {};
    let missingClasses = 0;
    for (const s of d.schools) {
      if (typ && s.type !== typ) continue;
      for (const p of s.profiles || []) {
        const t = latestThreshold(p);
        if (!t) { if ((p.thresholds || []).length) otherScale++; continue; }
        const gp = gradePointsFor(p, c.g);
        if (gp.points === null) {
          missingClasses++;
          gp.missing.forEach(m => { missingCount[m] = (missingCount[m] || 0) + 1; });
          continue;
        }
        const total = Math.round((c.examPts + gp.points + c.extra) * 100) / 100;
        const unfilled = t.qualified != null && t.places && t.qualified < 0.75 * t.places;
        rows.push({ s, p, t, total, mode: gp.mode, diff: Math.round((total - t.min) * 100) / 100, unfilled });
      }
    }
    const safe = rows.filter(r => r.diff >= MARGIN).sort((a, b) => b.t.min - a.t.min);
    const edge = rows.filter(r => r.diff > -MARGIN && r.diff < MARGIN).sort((a, b) => Math.abs(a.diff) - Math.abs(b.diff));
    const unfilledBelow = rows.filter(r => r.diff <= -MARGIN && r.unfilled).sort((a, b) => b.diff - a.diff);
    const miss = rows.filter(r => r.diff <= -MARGIN && r.diff > -CLOSE_MISS && !r.unfilled).sort((a, b) => b.diff - a.diff);
    const far = rows.filter(r => r.diff <= -CLOSE_MISS && !r.unfilled).length;
    const multi = CITIES[d.slug].files.length > 1;
    const totals = rows.map(r => r.total);
    const item = (r, extraNote) => `
      <li>
        <a href="${ctx.BASE}/szkola/${attr(r.s.rspo)}">${esc(r.s.shortName || r.s.name)}</a>${multi && r.s.city ? ` <span class="szkola__muted">(${esc(r.s.city)})</span>` : ''}:
        ${esc(profileLabel(r.p))}
        <span class="kalk__thr">próg ${esc(r.t.year)}: ${fmtNum(r.t.min)} pkt · Ty: ${fmtNum(r.total)} pkt${r.mode === 'cautious' ? ' (przedmioty punktowane nieznane, liczę z dwóch najniższych ocen)' : ''}${extraNote ? ' · ' + extraNote(r) : ''}</span>
      </li>`;
    const group = (title, list, cls, note, limit, extraNote) => list.length ? `
      <section class="kalk__group kalk__group--${cls}">
        <h3 class="career-column__subtitle">${title} <span class="szkola__muted">(${list.length})</span></h3>
        ${note ? `<p class="career-column__text szkola__muted">${note}</p>` : ''}
        <ul class="szkoly__mini kalk__list">${list.slice(0, limit).map(r => item(r, extraNote)).join('')}</ul>
        ${list.length > limit ? `<p class="career-column__text szkola__muted">Pokazuję ${limit} z ${list.length}. Zawęź listę rodzajem szkoły.</p>` : ''}
      </section>` : '';
    const missingNames = Object.entries(missingCount).sort((a, b) => b[1] - a[1]).map(([k]) => {
      const known = CALC_SUBJECTS.find(([c]) => c === k) || (SECOND_LANG.includes(k) ? ['obcy2', 'drugi język obcy'] : null);
      return known ? known[1].toLowerCase() : k;
    });
    const summary = rows.length
      ? `Twój wynik: ${totals.length && Math.min(...totals) !== Math.max(...totals) ? `od ${fmtNum(Math.min(...totals))} do ${fmtNum(Math.max(...totals))} pkt, zależnie od przedmiotów punktowanych w klasie` : `${fmtNum(totals[0])} pkt`}. Porównano ${rows.length} klas ${esc(d.city.loc)}: powyżej progu ${safe.length}, blisko progu ${edge.length}.`
      : `Brak klas do porównania ${esc(d.city.loc)}.`;
    return `
      <p class="kalk__summary" id="kalkSummary">${summary}</p>
      ${missingClasses ? `<p class="career-column__text">Uzupełnij oceny, żeby porównać jeszcze ${missingClasses} klas. Najczęściej brakuje: ${esc([...new Set(missingNames)].slice(0, 4).join(', '))}.</p>` : ''}
      ${group('Blisko progu', edge, 'edge', `Różnica mniejsza niż ${MARGIN} pkt w jedną albo drugą stronę. Tu decyduje rok i liczba chętnych.`, 40)}
      ${group('Powyżej ostatniego progu', safe, 'safe', `Twój wynik jest co najmniej ${MARGIN} pkt wyższy od ostatniego progu. Jeśli w tym roku progi pójdą w górę, może nie wystarczyć.`, 40)}
      ${group('Brakuje kilku punktów', miss, 'miss', `Ostatni próg był wyższy o ${MARGIN} do ${CLOSE_MISS} pkt.`, 10, r => `brakuje ${fmtNum(Math.round(-r.diff * 100) / 100)} pkt`)}
      ${group('Klasy, które nie wypełniły limitu miejsc', unfilledBelow, 'unfilled', 'W ostatniej rekrutacji przyjęto tu wyraźnie mniej osób, niż było miejsc, więc niższy wynik też mógł wystarczyć.', 20, r => `przyjętych ${esc(r.t.qualified)} na ${esc(r.t.places)}`)}
      ${far ? `<p class="career-column__text szkola__muted">W ${far} klasach ostatni próg był wyższy o ${CLOSE_MISS} pkt lub więcej.</p>` : ''}
      ${otherScale ? `<p class="career-column__text szkola__muted">Pominięte klasy z inną skalą punktów: ${otherScale}. To klasy dwujęzyczne, artystyczne, sportowe i inne, które doliczają sprawdzian albo dodatkowe punkty.</p>` : ''}`;
  }

  async function renderCalculator(container, params) {
    const my = ++renderSeq;
    const citySlug = CITIES[params.get('miasto')] ? params.get('miasto') : currentCity();
    const saved = loadCalc();
    const typ = TYPES.includes(params.get('typ')) ? params.get('typ') : (TYPES.includes(saved.typ) ? saved.typ : '');
    setRobots('index, follow');
    ctx.updateMeta('Kalkulator punktów ósmoklasisty | NextMove', 'Policz punkty rekrutacyjne do szkoły średniej i porównaj je z ostatnimi progami klas.', ctx.BASE + '/kalkulator');
    const gradeSelect = (k, label) => `
      <label class="szkoly__field kalk__field">
        <span class="szkoly__legend">${label}</span>
        <select name="g_${k}" class="szkoly__select">${GRADES.map(([v, l]) => `<option value="${v}"${String(saved['g_' + k] || '') === v ? ' selected' : ''}>${l}</option>`).join('')}</select>
      </label>`;
    const examInput = (name, label) => `
      <label class="szkoly__field kalk__field">
        <span class="szkoly__legend">${label}</span>
        <input type="number" inputmode="decimal" min="0" max="100" step="1" name="${name}" class="szkoly__select" value="${attr(saved[name] ?? '')}" placeholder="np. 80" aria-describedby="err_${name}">
        <span class="kalk__err" id="err_${name}" hidden>Wpisz wynik od 0 do 100%.</span>
      </label>`;
    container.innerHTML = `
      <div class="results szkoly kalk">
        <a href="${ctx.BASE}/szkoly?miasto=${citySlug}" class="results__back">&larr; Szkoły średnie</a>
        <h1 class="results__title">Kalkulator punktów ósmoklasisty</h1>
        <p class="results__query">Wpisz wyniki egzaminu i oceny ze świadectwa. Policzę punkty według rozporządzenia o rekrutacji i porównam je z ostatnimi progami klas.</p>
        <form class="kalk__form" id="kalkForm" novalidate>
          <fieldset class="szkoly__fieldset">
            <legend class="szkoly__legend">Egzamin ósmoklasisty (wynik w procentach)</legend>
            <div class="szkoly__row">${examInput('pol', 'Język polski')}${examInput('mat', 'Matematyka')}${examInput('obcy', 'Język obcy')}</div>
            <p class="career-column__text szkola__muted">Przed egzaminem wpisz wyniki, których się spodziewasz, np. z próbnego egzaminu.</p>
          </fieldset>
          <fieldset class="szkoly__fieldset">
            <legend class="szkoly__legend">Oceny na świadectwie</legend>
            <div class="kalk__grades">${CALC_SUBJECTS.map(([k, l]) => gradeSelect(k, l)).join('')}</div>
            <p class="career-column__text szkola__muted">Każda klasa punktuje polski, matematykę i dwa inne przedmioty. Wpisz oceny ze wszystkich, a kalkulator weźmie te, które liczy dana klasa.</p>
          </fieldset>
          <fieldset class="szkoly__fieldset">
            <legend class="szkoly__legend">Dodatkowe punkty</legend>
            <div class="szkoly__row">
              <label class="szkoly__chip szkoly__chip--solo"><input type="checkbox" name="wyr" value="1"${saved.wyr ? ' checked' : ''}> Świadectwo z wyróżnieniem (7 pkt)</label>
              <label class="szkoly__chip szkoly__chip--solo"><input type="checkbox" name="wol" value="1"${saved.wol ? ' checked' : ''}> Wolontariat (3 pkt)</label>
              <label class="szkoly__field kalk__field kalk__field--small">
                <span class="szkoly__legend">Osiągnięcia (0 do 18 pkt)</span>
                <input type="number" inputmode="numeric" min="0" max="18" step="1" name="osi" class="szkoly__select" value="${attr(saved.osi ?? '')}" placeholder="0" aria-describedby="err_osi">
                <span class="kalk__err" id="err_osi" hidden>Wpisz liczbę od 0 do 18.</span>
              </label>
            </div>
            <details class="kalk__help">
              <summary>Ile punktów za osiągnięcia?</summary>
              <ul>
                <li>Finalista konkursu przedmiotowego kuratorów o zasięgu ponadwojewódzkim albo ogólnopolskiego: 10 pkt.</li>
                <li>Finalista wojewódzkiego konkursu przedmiotowego kuratora: 7 pkt, dwa lub więcej tytułów: 10 pkt.</li>
                <li>Laureat konkursu tematycznego lub interdyscyplinarnego: 5 do 7 pkt, finalista: 3 do 5 pkt (zależnie od zasięgu).</li>
                <li>Wysokie miejsce w innych zawodach wiedzy, artystycznych lub sportowych wpisanych na świadectwo: międzynarodowe 4 pkt, krajowe 3, wojewódzkie 2, powiatowe 1.</li>
                <li>Razem najwyżej 18 pkt. Szczegóły w § 6 rozporządzenia.</li>
              </ul>
            </details>
          </fieldset>
          <fieldset class="szkoly__fieldset">
            <legend class="szkoly__legend">Gdzie szukać</legend>
            <nav class="szkoly__cities" aria-label="Miasto">
              ${CITY_CHIPS.map(c => `<a href="${ctx.BASE}/kalkulator?miasto=${c}" class="szkoly__city${c === citySlug ? ' szkoly__city--active' : ''}"${c === citySlug ? ' aria-current="page"' : ''}>${esc(CITIES[c].name)}</a>`).join('')}
            </nav>
            <div class="szkoly__chips">
              ${[['', 'Licea i technika'], ['liceum', 'Licea'], ['technikum', 'Technika']].map(([v, l]) => `
                <label class="szkoly__chip"><input type="radio" name="typ" value="${v}"${typ === v ? ' checked' : ''}> ${l}</label>`).join('')}
            </div>
          </fieldset>
        </form>
        <div class="kalk__total" id="kalkTotal"></div>
        <div id="kalkResults" aria-live="polite"></div>
        <p class="szkoly__footnote">Punkty liczone według rozporządzenia Ministra Edukacji z 3 kwietnia 2025 r. (<a href="${LAW_URL}" target="_blank" rel="noopener">Dz.U. 2025 poz. 464</a>): polski i matematyka z egzaminu ×0,35, język obcy ×0,3 (także na poziomie dwujęzycznym), cztery oceny po 2 do 18 pkt, wyróżnienie 7 pkt, osiągnięcia do 18 pkt, wolontariat 3 pkt. Razem do 200 pkt.
        Osoby zwolnione z egzaminu albo z jednego przedmiotu dostają punkty z ocen na świadectwie według § 8 rozporządzenia; tego kalkulator nie liczy. Laureaci i finaliści olimpiad oraz laureaci konkursów przedmiotowych kuratora są przyjmowani w pierwszej kolejności (art. 132 Prawa oświatowego).
        Progi zmieniają się co roku. Lista pokazuje, gdzie taki wynik wystarczał ostatnio, i nie gwarantuje przyjęcia.</p>
      </div>`;
    const form = container.querySelector('#kalkForm');
    const totalEl = container.querySelector('#kalkTotal');
    const resultsEl = container.querySelector('#kalkResults');
    let d = null;
    const update = () => {
      const f = readCalc(form);
      saveCalc(f);
      const c = parseCalc(f);
      for (const k of ['pol', 'mat', 'obcy', 'osi']) {
        const bad = c.invalid.includes(k);
        const input = form.querySelector(`[name="${k}"]`);
        input.setAttribute('aria-invalid', bad ? 'true' : 'false');
        form.querySelector('#err_' + k).hidden = !bad;
      }
      if (c.examPts === null || c.invalid.length) {
        totalEl.innerHTML = `<p class="kalk__points">${c.invalid.length ? 'Popraw zaznaczone pola' : 'Uzupełnij wyniki egzaminu'}</p><p class="szkola__muted">Porównanie z progami pojawi się po wpisaniu wyników z polskiego, matematyki i języka obcego.</p>`;
        resultsEl.innerHTML = '';
        return;
      }
      totalEl.innerHTML = `
        <p class="kalk__points">Egzamin: <strong>${fmtNum(Math.round(c.examPts * 100) / 100)}</strong> z 100 pkt · dodatkowe: <strong>${esc(c.extra)}</strong> pkt</p>
        <p class="szkola__muted">Do tego oceny ze świadectwa, do 72 pkt. Ich liczba zależy od klasy, dlatego wynik w każdej klasie jest policzony osobno.</p>`;
      resultsEl.innerHTML = d ? calcResultsHtml(d, c, f.typ || '') : '<p class="szkoly__loading">Wczytuję progi…</p>';
    };
    let timer = null;
    form.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(update, 250); });
    form.addEventListener('change', update);
    form.addEventListener('submit', e => { e.preventDefault(); update(); });
    update();
    focusHeading(container);
    try { d = await load(citySlug); } catch (e) { if (my === renderSeq) resultsEl.innerHTML = '<p class="career-column__empty">Nie udało się wczytać progów. Sprawdź połączenie i odśwież stronę.</p>'; return; }
    if (my !== renderSeq) return;
    setCity(citySlug);
    update();
  }

  return { init, load, renderList, renderDetail, renderCalculator, careerSectionHtml, setBackContext, currentCity, resetPending, CAREER_PROFESSIONS };
})();

window.Szkoly = Szkoly;
