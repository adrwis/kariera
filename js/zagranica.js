/* ============================================
   NextMove — Studia za granicą (/zagranica) i Koszty życia i akademiki (/zagranica/koszty)
   Dane: data/zagranica/index.json (lista miast) i data/zagranica/<miasto>.json (uczelnie i programy).
   ============================================ */

const Zagranica = (function () {
  'use strict';

  let ctx = null;
  function init(context) { ctx = context; }
  const esc = s => ctx.escapeHtml(String(s ?? ''));
  const attr = s => ctx.escapeAttr(String(s ?? ''));

  const CAREERS = {
    psycholog: 'Psycholog', programista: 'Programista', 'analityk-danych': 'Analityk danych', lekarz: 'Lekarz', architekt: 'Architekt',
    prawnik: 'Prawnik', ekonomista: 'Ekonomista', 'inzynier-budownictwa': 'Inżynier budownictwa', 'inzynier-mechanik': 'Inżynier mechanik',
    dziennikarz: 'Dziennikarz',
  };
  const LEVELS = { licencjat: 'licencjat', magister: 'magister', jednolite: 'studia jednolite magisterskie' };

  let indexCache = null;
  const cityCache = {};
  async function getJson(url) {
    const r = await fetch(url);
    if (!r.ok) throw new Error(url + ' ' + r.status);
    return r.json();
  }
  async function loadIndex() { return indexCache || (indexCache = (await getJson('data/zagranica/index.json')).cities); }
  async function loadCity(slug) { return cityCache[slug] || (cityCache[slug] = await getJson(`data/zagranica/${encodeURIComponent(slug)}.json`)); }

  // ---- Przeliczanie walut po średnim kursie NBP (tabela A): na żywo z api.nbp.pl, zapasem jest migawka z budowania strony ----
  const CUR_ALIAS = { lei: 'RON', RON: 'RON', CZK: 'CZK', HUF: 'HUF', SEK: 'SEK', DKK: 'DKK', GBP: 'GBP', USD: 'USD', '£': 'GBP' };
  const CALC_CURRENCIES = [['EUR', 'euro (EUR)'], ['PLN', 'złoty (PLN)'], ['CZK', 'korona czeska (CZK)'], ['HUF', 'forint (HUF)'], ['SEK', 'korona szwedzka (SEK)'], ['DKK', 'korona duńska (DKK)'], ['RON', 'lej rumuński (RON)'], ['GBP', 'funt (GBP)']];
  let rates = null; // { date, table, mid: { EUR: zł za 1 EUR, ... } }
  let ratesPromise = null;
  async function fetchRates() {
    try {
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), 3000);
      try {
        const r = await fetch('https://api.nbp.pl/api/exchangerates/tables/A/?format=json', { signal: ctl.signal, headers: { Accept: 'application/json' } });
        if (r.ok) {
          const t = (await r.json())[0];
          const mid = {};
          for (const x of t.rates) mid[x.code] = x.mid;
          if (mid.EUR) return { date: t.effectiveDate, table: t.no, mid, live: true };
        }
      } finally { clearTimeout(timer); }
    } catch (e) { /* zapas poniżej */ }
    try {
      const s = await getJson('data/zagranica/kursy.json');
      if (s && s.rates && s.rates.EUR) return { date: s.effectiveDate, table: s.table, mid: s.rates, live: false };
    } catch (e) { /* bez kursów strona działa bez przeliczeń */ }
    return null;
  }
  function loadRates() { return ratesPromise || (ratesPromise = fetchRates().then(r => { rates = r; return r; })); }
  const toEur = (amount, cur) => (!rates || !rates.mid[cur] ? null : cur === 'EUR' ? amount : (amount * rates.mid[cur]) / rates.mid.EUR);
  const toPln = (amount, cur) => (!rates || (cur !== 'PLN' && !rates.mid[cur]) ? null : cur === 'PLN' ? amount : amount * rates.mid[cur]);
  const fmtNum = n => {
    const v = n >= 1000 ? Math.round(n / 10) * 10 : n >= 100 ? Math.round(n) : Math.round(n * 10) / 10;
    return String(v).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');
  };
  const parseNum = s => {
    let t = String(s).replace(/&nbsp;|[\u00a0\s]/g, '');
    if (/,\d{1,2}$/.test(t)) t = t.replace(',', '.');
    else t = t.replace(/[.,](?=\d{3}(\D|$))/g, '');
    const n = parseFloat(t);
    return Number.isFinite(n) ? n : null;
  };
  const SP = String.raw`(?:\u00a0|&nbsp;| )`; // escapeHtml zamienia twarde spacje na &nbsp;
  const NUM = String.raw`\d{1,3}(?:${SP}\d{3})*(?:[.,]\d{1,2})?|\d+(?:[.,]\d{1,2})?`;
  const AMOUNT_RE = new RegExp(`(?<![\\d.,])(?:(${NUM})(?:\\s*(?:do|-)\\s*(${NUM}))?${SP}?(lei|RON|CZK|HUF|SEK|DKK|GBP|USD)(?![A-Za-z])|£(${NUM}))`, 'g');
  // Dodaje po kwotach w walutach innych niż euro orientacyjny odpowiednik w EUR (tekst musi być już zabezpieczony przez esc)
  function withEur(html) {
    if (!rates) return html;
    return html.replace(AMOUNT_RE, (m, a, b, cur, pound) => {
      const code = CUR_ALIAS[cur || '£'];
      const x = parseNum(a || pound), y = b ? parseNum(b) : null;
      const ex = x == null ? null : toEur(x, code);
      if (ex == null) return m;
      const ey = y == null ? null : toEur(y, code);
      const txt = ey != null ? `${fmtNum(ex)} do ${fmtNum(ey)}` : fmtNum(ex);
      return `${m} <span class="zagr__eur" title="Średni kurs NBP z ${esc(rates.date)}">(≈\u00a0${txt}\u00a0EUR)</span>`;
    });
  }
  function calcHtml() {
    return `
      <details class="zagr__details zagr__calc">
        <summary>Przelicznik walut na euro (średni kurs NBP)</summary>
        <form id="zagrCalc" class="zagr__calc-form" novalidate>
          <label class="szkoly__field kalk__field"><span class="szkoly__legend">Kwota</span>
            <input type="text" name="kwota" inputmode="decimal" autocomplete="off" class="szkoly__select" placeholder="np. 150000"></label>
          <label class="szkoly__field kalk__field"><span class="szkoly__legend">Waluta</span>
            <select name="waluta" class="szkoly__select">${CALC_CURRENCIES.map(([c, l]) => `<option value="${c}"${c === 'CZK' ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select></label>
        </form>
        <p class="zagr__calc-out" id="zagrCalcOut" role="status" aria-live="polite">Wpisz kwotę, np. czesne w koronach czy lejach.</p>
        <p class="szkola__muted" id="zagrCalcNote">Kursy: tabela A NBP (kursy średnie). Wynik jest orientacyjny: banki i kantory stosują własne kursy i prowizje.</p>
      </details>`;
  }
  function bindCalc(container) {
    const form = container.querySelector('#zagrCalc');
    if (!form) return;
    const out = container.querySelector('#zagrCalcOut'), note = container.querySelector('#zagrCalcNote');
    const run = async () => {
      const raw = form.elements.kwota.value.trim();
      if (!raw) { out.textContent = 'Wpisz kwotę, np. czesne w koronach czy lejach.'; return; }
      const amount = parseNum(raw);
      if (amount == null || amount < 0) { out.textContent = 'Wpisz kwotę jako liczbę, np. 150000.'; return; }
      const r = await loadRates();
      if (!r) { out.textContent = 'Nie udało się pobrać kursów NBP. Spróbuj za chwilę.'; return; }
      const cur = form.elements.waluta.value;
      const eur = toEur(amount, cur), pln = toPln(amount, cur);
      out.innerHTML = `<strong>${esc(fmtNum(amount))}\u00a0${esc(cur)}</strong> to około <strong>${esc(fmtNum(eur))}\u00a0EUR</strong>${cur === 'PLN' ? '' : ` i około <strong>${esc(fmtNum(pln))}\u00a0zł</strong>`}.`;
      note.innerHTML = `Kursy: ${esc(r.source || 'NBP, tabela A')} nr ${esc(r.table)} z dnia ${esc(r.date)}${r.live ? '' : ' (zapisana kopia, bo NBP nie odpowiedział)'}. Wynik jest orientacyjny: banki i kantory stosują własne kursy i prowizje. <a href="https://nbp.pl/statystyka-i-sprawozdawczosc/kursy/tabela-a/" target="_blank" rel="noopener">Tabela A na stronie NBP</a>.`;
    };
    form.addEventListener('input', run);
    form.addEventListener('change', run);
    form.addEventListener('submit', e => { e.preventDefault(); run(); });
    container.querySelector('.zagr__calc').addEventListener('toggle', e => { if (e.target.open) loadRates(); });
  }

  let renderSeq = 0;

  let pendingFocus = '';
  const isUrl = u => typeof u === 'string' && /^https?:\/\//i.test(u);
  const link = (u, label) => (isUrl(u) ? `<a href="${attr(u)}" target="_blank" rel="noopener">${esc(label)}</a>` : '');

  function tabs(active) {
    return `
      <nav class="zagr__tabs" aria-label="Zakładki: studia za granicą">
        <a href="${ctx.BASE}/zagranica"${active === 'studia' ? ' aria-current="page"' : ''}>Studia</a>
        <a href="${ctx.BASE}/zagranica/koszty"${active === 'koszty' ? ' aria-current="page"' : ''}>Koszty życia i akademiki <span class="zagr__soon">wkrótce</span></a>
      </nav>`;
  }

  function focusHeading(container) {
    const h = container.querySelector('h1');
    if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
  }

  function queryFrom(p) {
    const q = new URLSearchParams();
    if (p.miasto) q.set('miasto', p.miasto);
    if (p.kierunek) q.set('kierunek', p.kierunek);
    if (p.ang) q.set('ang', '1');
    const s = q.toString();
    return s ? '?' + s : '';
  }

  // Krótka etykieta statusu polskiej matury: pierwsze zdanie przed nawiasem, dwukropkiem lub średnikiem
  function maturaChip(m) {
    if (!m) return '';
    const short = m.split(/[(:;]/)[0].trim();
    return short.length > 60 ? short.slice(0, 57).trim() + '…' : short;
  }

  function programHtml(p, city) {
    const careers = (p.careerIds || []).map(id => CAREERS[id]).filter(Boolean);
    const level = LEVELS[p.level] || p.level;
    const badges = [
      level, p.durationYears ? `${p.durationYears} ${p.durationYears === 1 ? 'rok' : p.durationYears < 5 ? 'lata' : 'lat'}` : '',
      p.languages.length ? `po ${p.languages.join(', ')}` : '', p.academicYear ? `rok ${p.academicYear}` : '',
    ].filter(Boolean).map(b => `<span class="szkoly__badge">${esc(b)}</span>`).join('');
    const chip = maturaChip(p.matura);
    const fee = city.eu === false
      ? (p.tuitionNonEu ? ['Opłaty dla zagranicznych (po Brexicie)', p.tuitionNonEu] : null)
      : (p.tuitionEu ? ['Opłaty dla obywateli UE', p.tuitionEu] : null);
    const rows = [
      fee ? `<div><dt>${esc(fee[0])}</dt><dd>${withEur(esc(fee[1]))}${p.tuitionUrl ? ' ' + link(p.tuitionUrl, 'źródło') : ''}</dd></div>` : '',
      fee ? '' : `<div><dt>${city.eu === false ? 'Opłaty dla zagranicznych' : 'Opłaty dla obywateli UE'}</dt><dd class="zagr__missing">Brak potwierdzonych danych, sprawdź na stronie uczelni.</dd></div>`,
      `<div><dt>Termin</dt><dd${p.deadline ? '' : ' class="zagr__missing"'}>${p.deadline ? esc(p.deadline) : 'Brak potwierdzonego terminu, sprawdź na stronie uczelni.'}</dd></div>`,
    ].join('');
    const detailRows = [
      p.matura ? `<div><dt>Polska matura</dt><dd>${esc(p.matura)}</dd></div>` : '',
      p.requirements ? `<div><dt>Warunki przyjęcia</dt><dd>${esc(p.requirements)}${p.admissionUrl ? ' ' + link(p.admissionUrl, 'źródło') : ''}</dd></div>` : '',
      p.languageProof ? `<div><dt>Znajomość języka</dt><dd>${esc(p.languageProof)}</dd></div>` : '',
      p.selective != null ? `<div><dt>Selekcja</dt><dd>${p.selective ? 'tak, ograniczona liczba miejsc lub test' : 'brak selekcji w tym programie'}</dd></div>` : '',
      city.eu === false && p.tuitionEu ? `<div><dt>Uwaga o opłatach</dt><dd>${withEur(esc(p.tuitionEu))}</dd></div>` : '',
      p.notes ? `<div><dt>Uwagi</dt><dd>${esc(p.notes)}</dd></div>` : '',
    ].join('');
    return `
      <li class="szkola__profile zagr__prog">
        <h3 class="szkola__profile-name">${esc(p.name)}${p.nameEn && p.nameEn !== p.name ? ` <span class="szkola__muted">(${esc(p.nameEn)})</span>` : ''}</h3>
        <div class="zagr__badges">${badges}${chip ? `<span class="szkoly__badge szkoly__badge--progi" title="Polska matura">matura: ${esc(chip)}</span>` : ''}</div>
        ${careers.length ? `<p class="szkola__muted zagr__careers">Zawody: ${careers.map(esc).join(', ')}</p>` : ''}
        ${rows ? `<dl class="szkola__dl">${rows}</dl>` : ''}
        ${detailRows ? `<details class="zagr__details"><summary>Warunki przyjęcia i język</summary><dl class="szkola__dl">${detailRows}</dl></details>` : ''}
        <div class="zagr__links">${link(p.url, 'Strona programu')} ${link(p.applyUrl, 'Złóż wniosek')}</div>
      </li>`;
  }

  function cityHtml(city, f) {
    const careerIds = [...new Set(city.universities.flatMap(u => u.programs.flatMap(p => p.careerIds || [])))].filter(id => CAREERS[id]);
    const total = city.universities.reduce((a, u) => a + u.programs.length, 0);
    const keep = p => (!f.kierunek || (p.careerIds || []).includes(f.kierunek)) && (!f.ang || p.english);
    const unis = city.universities.map(u => ({ ...u, programs: u.programs.filter(keep) })).filter(u => u.programs.length);
    const shown = unis.reduce((a, u) => a + u.programs.length, 0);
    const summary = city.summary.length
      ? `<dl class="szkola__dl zagr__summary">${city.summary.map(s => `<div><dt>${esc(s.label)}</dt><dd>${withEur(esc(s.text))}</dd></div>`).join('')}</dl>`
      : '';
    const sources = city.sources.filter(s => isUrl(s.url));
    return `
      <section class="zagr__city" aria-label="${attr(city.name)}">
        <h2 class="career-column__title">${esc(city.name)}, ${esc(city.country)}</h2>
        <p class="szkola__muted">Dane z oficjalnych stron uczelni i portali krajowych, pobrane ${esc(city.retrieved || '')}. Rok akademicki jest przy każdym programie. Zawsze sprawdź aktualne warunki na stronie uczelni, bo terminy i opłaty się zmieniają.</p>
        ${sources.length ? `<details class="zagr__details"><summary>Źródła ogólne</summary><ul class="szkoly__mini">${sources.map(s => `<li>${link(s.url, s.url.replace(/^https?:\/\/(www\.)?/, '').slice(0, 70))}${s.note ? ` <span class="szkola__muted">${esc(s.note)}</span>` : ''}</li>`).join('')}</ul></details>` : ''}
        <form class="zagr__filters" id="zagrFilters" novalidate>
          <label class="szkoly__field kalk__field"><span class="szkoly__legend">Zawód</span>
            <select name="kierunek" class="szkoly__select"><option value="">Wszystkie</option>${careerIds.map(id => `<option value="${attr(id)}"${f.kierunek === id ? ' selected' : ''}>${esc(CAREERS[id])}</option>`).join('')}</select></label>
          <label class="szkoly__chip szkoly__chip--solo"><input type="checkbox" name="ang" value="1"${f.ang ? ' checked' : ''}> Tylko po angielsku</label>
        </form>
        ${rates ? `<p class="szkola__muted zagr__rate-note">Kwoty w innych walutach przeliczamy orientacyjnie na euro po średnim kursie NBP z ${esc(rates.date)} (znak ≈).</p>` : ''}
        <p class="results__count" id="zagrCount" aria-live="polite">Pokazano ${shown} z ${total} programów.</p>
        ${summary ? `<details class="zagr__details zagr__overview"><summary>Matura, opłaty i terminy w skrócie (cały kraj lub miasto)</summary>${summary}</details>` : ''}
        ${unis.length ? unis.map(u => `
          <section class="zagr__uni">
            <h3 class="career-column__subtitle">${isUrl(u.url) ? link(u.url, u.name) : esc(u.name)}${u.type ? ` <span class="szkola__muted">(${esc(u.type)})</span>` : ''}</h3>
            <ul class="szkola__profiles">${u.programs.map(p => programHtml(p, city)).join('')}</ul>
          </section>`).join('') : '<p class="career-column__empty">Żaden program w tym mieście nie pasuje do wybranych filtrów. <a href="' + ctx.BASE + '/zagranica?miasto=' + attr(city.slug) + '">Wyczyść filtry</a></p>'}
        <p class="zagr__ask">${ctx.feedbackButton('kierunek-zagranica', 'Brakuje kierunku albo uczelni w tym mieście? Daj znać', city.name)}</p>
        ${city.gaps.length ? `<details class="zagr__details zagr__gaps"><summary>Czego nie udało się potwierdzić (${city.gaps.length})</summary><ul>${city.gaps.map(g => `<li>${esc(g)}</li>`).join('')}</ul></details>` : ''}
      </section>`;
  }

  function cityPickerHtml(cities, current) {
    return `
      <label class="szkoly__field kalk__field zagr__city-field"><span class="szkoly__legend">Miasto</span>
        <select id="zagrCity" class="szkoly__select"><option value="">Wybierz miasto</option>
          ${cities.map(c => `<option value="${attr(c.slug)}"${c.slug === current ? ' selected' : ''}>${esc(c.name)} (${esc(c.country)})${c.status === 'dostępne' ? '' : ': dane w przygotowaniu'}</option>`).join('')}
        </select></label>`;
  }

  function overviewHtml(cities) {
    const ready = cities.filter(c => c.status === 'dostępne');
    const soon = cities.filter(c => c.status !== 'dostępne');
    const card = c => `<li><a class="zagr__card" href="${ctx.BASE}/zagranica?miasto=${attr(c.slug)}"><strong>${esc(c.name)}</strong><span class="szkola__muted">${esc(c.country)}${c.eu === false ? ', poza UE' : ''}</span><span class="szkoly__badge">${c.status === 'dostępne' ? `${c.programs} ${c.programs === 1 ? 'program' : 'programów'}` : 'w przygotowaniu'}</span></a></li>`;
    return `
      ${ready.length ? `<h2 class="career-column__subtitle">Dane gotowe (${ready.length})</h2><ul class="zagr__grid">${ready.map(card).join('')}</ul>` : ''}
      ${soon.length ? `<h2 class="career-column__subtitle">W przygotowaniu (${soon.length})</h2><ul class="zagr__grid">${soon.map(card).join('')}</ul>` : ''}`;
  }

  async function render(container, params) {
    const my = ++renderSeq;
    const f = { miasto: params.get('miasto') || '', kierunek: params.get('kierunek') || '', ang: params.get('ang') === '1' };
    ctx.updateMeta('Studia za granicą | NextMove', 'Studia w stolicach krajów UE i w Londynie: kierunki, język, opłaty dla obywateli UE, warunki przyjęcia z polską maturą i terminy z oficjalnych źródeł.', `${ctx.BASE}/zagranica/`);
    container.innerHTML = `
      <div class="results szkoly zagr">
        <a href="${ctx.BASE}/" class="results__back">&larr; Strona główna</a>
        <h1 class="results__title">Studia za granicą</h1>
        <p class="results__query">Stolice krajów UE i Londyn: jakie kierunki, w jakim języku, za ile i co jest potrzebne z polską maturą. Zbieramy kolejne miasta, więc część jest jeszcze w przygotowaniu.</p>
        ${tabs('studia')}
        <div id="zagrBody"><p class="szkoly__loading">Wczytuję miasta…</p></div>
      </div>`;
    const refocus = pendingFocus; pendingFocus = '';
    if (!refocus) focusHeading(container);
    const body = container.querySelector('#zagrBody');
    let cities;
    try { cities = await loadIndex(); } catch (e) { if (my === renderSeq) body.innerHTML = '<p class="career-column__empty">Nie udało się wczytać listy miast. Sprawdź połączenie i odśwież stronę.</p>'; return; }
    if (my !== renderSeq) return;
    const meta = cities.find(c => c.slug === f.miasto);
    let html = cityPickerHtml(cities, meta ? meta.slug : '') + calcHtml();
    if (!meta) {
      body.innerHTML = html + `<p class="zagr__ask">${ctx.feedbackButton('miasto', 'Nie ma Twojego miasta albo kierunku? Daj znać')}</p>` + overviewHtml(cities);
    } else if (meta.status !== 'dostępne') {
      body.innerHTML = html + `<div class="zagr__notice" role="status"><strong>${esc(meta.name)}: dane w przygotowaniu.</strong> Dla tego miasta zbieramy jeszcze kierunki, opłaty i warunki przyjęcia. Zajrzyj za jakiś czas albo wybierz miasto z gotowymi danymi. ${ctx.feedbackButton('kierunek-zagranica', 'Zależy Ci na tym mieście? Daj znać', meta.name)}</div>` + overviewHtml(cities.filter(c => c.slug !== meta.slug));
    } else {
      body.innerHTML = html + '<p class="szkoly__loading">Wczytuję programy…</p>';
      let city;
      try { [city] = await Promise.all([loadCity(meta.slug), loadRates()]); } catch (e) { if (my === renderSeq) body.innerHTML = html + '<p class="career-column__empty">Nie udało się wczytać danych tego miasta. Spróbuj ponownie.</p>'; bind(container, f); return; }
      if (my !== renderSeq) return;
      body.innerHTML = html + cityHtml(city, f);
    }
    bind(container, f);
    bindCalc(container);
    if (refocus) { const el = container.querySelector(refocus); if (el) el.focus({ preventScroll: true }); else focusHeading(container); }
  }

  // Zmiana miasta i filtrów przenosi na nowy adres (bez dokładania kroków do Wstecz)
  function bind(container, f) {
    const go = (p, focusSel) => { pendingFocus = focusSel || ''; history.replaceState(null, '', `${ctx.BASE}/zagranica${queryFrom(p)}`); dispatchEvent(new PopStateEvent('popstate')); };
    const city = container.querySelector('#zagrCity');
    if (city) city.addEventListener('change', () => go({ miasto: city.value }, '#zagrCity'));
    const form = container.querySelector('#zagrFilters');
    if (form) form.addEventListener('change', () => {
      go({ miasto: f.miasto, kierunek: form.elements.kierunek.value, ang: form.elements.ang.checked }, '#' + (document.activeElement && document.activeElement.form === form ? 'zagrFilters [name="' + document.activeElement.name + '"]' : 'zagrFilters select'));
    });
  }

  function renderCosts(container) {
    ++renderSeq;
    ctx.updateMeta('Koszty życia i akademiki | NextMove', 'Koszty życia i akademiki w miastach z zakładki Studia za granicą: zakładka w przygotowaniu.', `${ctx.BASE}/zagranica/koszty/`);
    container.innerHTML = `
      <div class="results szkoly zagr">
        <a href="${ctx.BASE}/" class="results__back">&larr; Strona główna</a>
        <h1 class="results__title">Koszty życia i akademiki</h1>
        ${tabs('koszty')}
        <div class="zagr__notice" role="status">
          <strong>Pracujemy nad tą zakładką.</strong>
          <p class="career-column__text">Tu pojawią się koszty życia i akademiki w miastach z zakładki <a href="${ctx.BASE}/zagranica">Studia za granicą</a>, każda kwota z oficjalnym źródłem i datą. Na razie najlepsze informacje o mieszkaniu dla studentów znajdziesz na stronach uczelni, przy programie, który Cię interesuje.</p>
        </div>
      </div>`;
    focusHeading(container);
  }

  return { init, render, renderCosts };
})();
