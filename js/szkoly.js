/* ============================================
   NextMove — Szkoły średnie (licea i technika)
   Widoki: /szkoly (lista z filtrami), /szkola/<rspo> (strona szkoły)
   oraz sekcja „Szkoła średnia” na profilu zawodu.
   ============================================ */

const Szkoly = (function () {
  'use strict';

  const DATA_URL = 'data/szkoly/gdansk.json';

  const SUBJECTS = {
    mat: 'matematyka', pol: 'język polski', ang: 'język angielski', niem: 'język niemiecki',
    fr: 'język francuski', hisz: 'język hiszpański', ros: 'język rosyjski', wlo: 'język włoski',
    bio: 'biologia', chem: 'chemia', fiz: 'fizyka', inf: 'informatyka', geo: 'geografia',
    hist: 'historia', wos: 'WOS', hsz: 'historia sztuki', fil: 'filozofia', lac: 'łacina',
    ang_dwj: 'angielski dwujęzyczny', niem_dwj: 'niemiecki dwujęzyczny', fr_dwj: 'francuski dwujęzyczny',
    hisz_dwj: 'hiszpański dwujęzyczny', ros_dwj: 'rosyjski dwujęzyczny', wlo_dwj: 'włoski dwujęzyczny',
  };

  // Przedmioty pokazywane jako chipy w filtrze rozszerzeń
  const FILTER_SUBJECTS = ['mat', 'fiz', 'inf', 'bio', 'chem', 'geo', 'pol', 'hist', 'wos', 'ang'];

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
    'architekt-krajobrazu': ['technik architektury krajobrazu'],
    'inzynier-budownictwa': ['technik budownictwa'],
    'inzynier-mechanik': ['technik mechanik', 'technik mechatronik'],
    'inzynier-srodowiska': ['technik ochrony środowiska'],
    'grafik': ['technik grafiki i poligrafii cyfrowej'],
    'specjalista-marketingu': ['technik reklamy'],
  };

  let ctx = null;
  let data = null;
  let loading = null;

  function init(context) { ctx = context; }

  function load() {
    if (data) return Promise.resolve(data);
    if (!loading) {
      loading = fetch(DATA_URL)
        .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(json => { data = json; return data; })
        .catch(err => { loading = null; throw err; });
    }
    return loading;
  }

  // --- Helpers ---
  const esc = s => ctx.escapeHtml(String(s ?? ''));
  const attr = s => ctx.escapeAttr(String(s ?? ''));

  function subjectName(code) { return SUBJECTS[code] || code; }
  function typeLabel(t) { return t === 'technikum' ? 'Technikum' : 'Liceum'; }
  function fmtNum(n) { return String(n).replace('.', ','); }

  function profileMatches(p, subjects) {
    if (!subjects.length) return true;
    const ext = p.extended || [];
    return subjects.every(code => ext.includes(code));
  }

  function professionMatches(profession, wanted) {
    if (!profession) return false;
    const p = profession.toLowerCase();
    return wanted.some(w => p.split('/').map(x => x.trim()).includes(w));
  }

  function sourceLink(url, label) {
    return ctx.isHttpUrl(url)
      ? `<a href="${attr(url)}" target="_blank" rel="noopener">${esc(label || 'źródło')}</a>`
      : '';
  }

  function errorHtml() {
    return `<p class="szkoly__empty">Nie udało się wczytać danych o szkołach. Sprawdź połączenie i odśwież stronę.</p>`;
  }

  // --- Lista szkół ---
  function readFilters(params) {
    return {
      typ: params.get('typ') || '',
      rozsz: (params.get('rozsz') || '').split(',').filter(c => SUBJECTS[c]),
      dz: params.get('dz') || '',
      pub: params.get('pub') === '1',
      q: (params.get('q') || '').trim(),
    };
  }

  function filtersToQuery(f) {
    const p = new URLSearchParams();
    if (f.typ) p.set('typ', f.typ);
    if (f.rozsz.length) p.set('rozsz', f.rozsz.join(','));
    if (f.dz) p.set('dz', f.dz);
    if (f.pub) p.set('pub', '1');
    if (f.q) p.set('q', f.q);
    const s = p.toString();
    return s ? '?' + s : '';
  }

  function filterSchools(schools, f) {
    const q = f.q.toLowerCase();
    return schools
      .filter(s => !f.typ || s.type === f.typ)
      .filter(s => !f.dz || s.district === f.dz)
      .filter(s => !f.pub || s.public)
      .filter(s => !q || (s.name + ' ' + (s.shortName || '') + ' ' + (s.profiles || []).map(p => p.profession || '').join(' ')).toLowerCase().includes(q))
      .map(s => ({ school: s, matching: (s.profiles || []).filter(p => profileMatches(p, f.rozsz)) }))
      .filter(x => !f.rozsz.length || x.matching.length)
      .sort((a, b) => (a.school.type === b.school.type ? 0 : a.school.type === 'liceum' ? -1 : 1)
        || (b.school.public - a.school.public)
        || (a.school.shortName || a.school.name).localeCompare(b.school.shortName || b.school.name, 'pl', { numeric: true }));
  }

  function schoolCard(s, matching, f) {
    const shown = (f.rozsz.length ? matching : s.profiles || []).slice(0, 4);
    const more = (f.rozsz.length ? matching : s.profiles || []).length - shown.length;
    const hasThresholds = (s.profiles || []).some(p => (p.thresholds || []).length);
    const badges = [
      `<span class="szkoly__badge szkoly__badge--${s.type}">${typeLabel(s.type)}</span>`,
      `<span class="szkoly__badge">${s.public ? 'publiczna' : 'niepubliczna'}</span>`,
      s.district ? `<span class="szkoly__badge">${esc(s.district)}</span>` : '',
      s.matura && s.matura.passRate != null ? `<span class="szkoly__badge">zdawalność matury ${fmtNum(s.matura.passRate)}%</span>` : '',
      hasThresholds ? '<span class="szkoly__badge szkoly__badge--progi">progi punktowe</span>' : '',
    ].join('');
    const profilesHtml = shown.length
      ? `<ul class="szkoly__card-profiles">${shown.map(p => `<li>${esc(p.name)}</li>`).join('')}${more > 0 ? `<li class="szkoly__more">i ${more} więcej</li>` : ''}</ul>`
      : '<p class="szkoly__card-none">Szkoła nie opublikowała oferty klas na 2025/2026.</p>';
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
    container.innerHTML = `
      <div class="results szkoly">
        <div class="results__header">
          <a href="${ctx.BASE}/" class="results__back">&larr; Strona główna</a>
          <h1 class="results__title">Szkoły średnie w Gdańsku</h1>
          <p class="results__query">Licea i technika dla absolwentów podstawówki. Oferta klas na rok 2025/2026, dane z ${esc(d.retrieved.split('-').reverse().join('.'))}.</p>
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
                  <option value="">Cały Gdańsk</option>
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
          <p class="results__count" id="szkolyCount" aria-live="polite"></p>
        </div>
        <ul class="results__list szkoly__list" id="szkolyList"></ul>
        <p class="szkoly__footnote">Źródła: RSPO (MEN, licencja CC BY 4.0), wyniki matur CKE i OKE w Gdańsku, strony i regulaminy rekrutacji szkół. Na stronie każdej szkoły są linki do konkretnych dokumentów.</p>
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
      history.replaceState(null, '', ctx.BASE + '/szkoly' + filtersToQuery(nf));
      renderListResults(container, d, nf);
    };
    form.addEventListener('change', update);
    form.addEventListener('input', e => { if (e.target.name === 'q') update(); });
    form.addEventListener('submit', e => { e.preventDefault(); update(); });
  }

  function renderListResults(container, d, f) {
    const list = container.querySelector('#szkolyList');
    const count = container.querySelector('#szkolyCount');
    const res = filterSchools(d.schools, f);
    count.textContent = res.length ? `Pasujące szkoły: ${res.length}` : '';
    list.innerHTML = res.length
      ? res.map(x => schoolCard(x.school, x.matching, f)).join('')
      : '<li class="szkoly__empty">Żadna szkoła nie pasuje do tych filtrów. Spróbuj odznaczyć któryś przedmiot.</li>';
  }

  async function renderList(container, params) {
    container.innerHTML = '<p class="szkoly__loading">Wczytuję szkoły…</p>';
    ctx.updateMeta('Szkoły średnie w Gdańsku | NextMove', 'Licea i technika w Gdańsku: profile klas, przedmioty rozszerzone, wyniki matur i progi punktowe.', ctx.BASE + '/szkoly');
    let d;
    try { d = await load(); } catch (e) { container.innerHTML = errorHtml(); return; }
    const f = readFilters(params);
    renderListShell(container, d, f);
    renderListResults(container, d, f);
    const h = container.querySelector('h1');
    if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
  }

  // --- Strona szkoły ---
  function thresholdHtml(p) {
    const th = p.thresholds || [];
    if (!th.length) return '';
    return th.map(t => {
      const kind = t.kind ? ` (${esc(t.kind)})` : '';
      return `<div class="szkola__threshold">Próg ${esc(t.year)}${kind}: <strong>${fmtNum(t.min)} / ${esc(t.scale)} pkt</strong> ${sourceLink(t.sourceUrl)}</div>`;
    }).join('');
  }

  function profileHtml(p, isTech) {
    const ext = (p.extended || []).map(subjectName);
    const rows = [
      isTech && p.profession ? `<div><dt>Zawód</dt><dd>${esc(p.profession)}${(p.qualifications || []).length ? ` · kwalifikacje ${p.qualifications.map(esc).join(', ')}` : ''}</dd></div>` : '',
      ext.length ? `<div><dt>Rozszerzenia</dt><dd>${ext.map(esc).join(', ')}</dd></div>` : '',
      (p.languages || []).length ? `<div><dt>Języki</dt><dd>${p.languages.map(c => esc(subjectName(c))).join(', ')}</dd></div>` : '',
      (p.scoredSubjects || []).length ? `<div><dt>Punktowane oceny</dt><dd>${p.scoredSubjects.map(c => esc(subjectName(c))).join(', ')}</dd></div>` : '',
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

  function maturaHtml(m) {
    if (!m) return '<p class="career-column__empty">CKE nie podaje wyników matury dla tej szkoły (np. brak absolwentów).</p>';
    const ext = Object.entries(m.extended || {})
      .filter(([, v]) => v && v.n)
      .sort((a, b) => b[1].n - a[1].n);
    const rows = ext.map(([code, v]) => `
      <tr><td>${esc(subjectName(code))}</td><td>${esc(v.n)}</td><td>${v.mean != null ? fmtNum(v.mean) + '%' : '<span class="szkola__muted">mniej niż 5 osób</span>'}</td></tr>`).join('');
    return `
      <p class="career-column__text">Zdawalność: <strong>${fmtNum(m.passRate)}%</strong>${m.examinees ? ` · zdawało ${esc(m.examinees)} osób` : ''}. ${sourceLink(m.sourceUrl, 'dane CKE')}</p>
      ${rows ? `
      <div class="szkola__table-wrap">
        <table class="school-popup__thresholds szkola__matura">
          <caption class="school-popup__caption">Przedmioty rozszerzone: ile osób zdawało i średni wynik.</caption>
          <thead><tr><th>Przedmiot</th><th>Zdających</th><th>Średnia</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>` : ''}`;
  }

  function relatedCareersHtml(s) {
    if (typeof CareerSearch === 'undefined' || !CareerSearch.careers) return '';
    const professions = (s.profiles || []).map(p => p.profession).filter(Boolean);
    const careers = CareerSearch.careers.filter(c => {
      const wanted = CAREER_PROFESSIONS[c.id];
      return wanted && professions.some(p => professionMatches(p, wanted));
    });
    if (!careers.length) return '';
    return `
      <section class="szkola__section">
        <h2 class="career-column__title">Dokąd prowadzi ta szkoła</h2>
        <div class="popular__tags szkola__tags">
          ${careers.map(c => `<a href="${ctx.BASE}/zawod/${attr(c.id)}" class="popular__tag">${esc(c.name)}</a>`).join('')}
        </div>
      </section>`;
  }

  async function renderDetail(container, rspo) {
    container.innerHTML = '<p class="szkoly__loading">Wczytuję szkołę…</p>';
    let d;
    try { d = await load(); } catch (e) { container.innerHTML = errorHtml(); return; }
    const s = d.schools.find(x => String(x.rspo) === String(rspo));
    if (!s) {
      container.innerHTML = `
        <div class="results szkoly">
          <a href="${ctx.BASE}/szkoly" class="results__back">&larr; Wszystkie szkoły</a>
          <h1 class="results__title">Nie ma takiej szkoły w bazie</h1>
          <p class="results__query">Na razie są tu tylko licea i technika z Gdańska.</p>
        </div>`;
      return;
    }
    const isTech = s.type === 'technikum';
    const profiles = s.profiles || [];
    const anyThresholds = profiles.some(p => (p.thresholds || []).length);
    container.innerHTML = `
      <div class="results szkoly szkola">
        <a href="${ctx.BASE}/szkoly" class="results__back">&larr; Wszystkie szkoły</a>
        <div class="career-hero">
          <h1 class="career-hero__name">${esc(s.shortName || s.name)}</h1>
          <p class="career-hero__aliases">${esc(s.name)}</p>
          <div class="szkoly__badges">
            <span class="szkoly__badge szkoly__badge--${s.type}">${typeLabel(s.type)}</span>
            <span class="szkoly__badge">${s.public ? 'publiczna' : 'niepubliczna'}</span>
            ${s.district ? `<span class="szkoly__badge">${esc(s.district)}</span>` : ''}
          </div>
          <p class="career-hero__desc">
            ${esc(s.address || '')}${s.students ? ` · ${esc(s.students)} uczniów` : ''}
            ${ctx.isHttpUrl(s.url) ? ` · <a href="${attr(s.url)}" target="_blank" rel="noopener">strona szkoły</a>` : ''}
          </p>
        </div>

        <section class="szkola__section">
          <h2 class="career-column__title">Klasy w roku 2025/2026</h2>
          ${anyThresholds ? '<p class="career-column__text szkola__muted">Próg to liczba punktów ostatniej przyjętej osoby, w skali od 0 do 200 (egzamin ósmoklasisty i świadectwo).</p>' : ''}
          ${profiles.length
            ? `<ul class="szkola__profiles">${profiles.map(p => profileHtml(p, isTech)).join('')}</ul>`
            : '<p class="career-column__empty">Szkoła nie opublikowała oferty klas na 2025/2026 albo nie dało się jej potwierdzić.</p>'}
          ${profiles.length && !anyThresholds ? '<p class="career-column__text szkola__muted">Szkoła nie publikuje progów punktowych.</p>' : ''}
        </section>

        <section class="szkola__section">
          <h2 class="career-column__title">Matura ${esc(s.matura ? s.matura.year : '')}</h2>
          ${maturaHtml(s.matura)}
        </section>

        ${relatedCareersHtml(s)}

        <section class="szkola__section career-sources career-sources--detail">
          <h2 class="career-column__title">Źródła</h2>
          <ul class="szkola__sources">
            ${(s.sources || []).map(src => `<li>${sourceLink(src.url, src.name)}${src.retrieved ? ` · pobrano ${esc(src.retrieved.split('-').reverse().join('.'))}` : ''}</li>`).join('')}
          </ul>
        </section>
      </div>`;
    ctx.updateMeta(`${s.shortName || s.name} | Gdańsk | NextMove`, `${typeLabel(s.type)} w Gdańsku: klasy, rozszerzenia, wyniki matur.`, `${ctx.BASE}/szkola/${s.rspo}`);
    ctx.announce(`Szkoła: ${s.shortName || s.name}`);
    const h = container.querySelector('h1');
    if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
  }

  // --- Sekcja na profilu zawodu ---
  // Z zweryfikowanych wymagań uczelni wybiera grupy przedmiotów, które coś zawężają:
  // najwyżej 3 przedmioty do wyboru, bez „dowolnego” i „dowolnego języka obcego”.
  // required — uczelnia wymaga rozszerzenia (R); recommended — liczy P lub R, ale R daje więcej punktów.
  function careerMaturaGroups(career) {
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
    const required = pick('R');
    const requiredKeys = new Set(required.map(g => g.join('|')));
    const recommended = pick('PR').filter(g => !requiredKeys.has(g.join('|')));
    return { required, recommended, schoolsCounted: schools.length };
  }

  function profileCovers(p, groups) {
    const ext = p.extended || [];
    return groups.every(g => g.some(code => ext.includes(code)));
  }

  function groupsText(groups) {
    return groups.map(g => g.map(subjectName).join(' lub ')).join('; ');
  }

  async function careerSectionHtml(career) {
    let d;
    try { d = await load(); } catch (e) { return ''; }
    const wanted = CAREER_PROFESSIONS[career.id];
    const tech = wanted
      ? d.schools.filter(s => s.type === 'technikum' && (s.profiles || []).some(p => professionMatches(p.profession, wanted)))
      : [];
    const { required, recommended, schoolsCounted } = careerMaturaGroups(career);
    const target = required.length ? required : recommended;
    const lo = target.length
      ? d.schools.filter(s => s.type === 'liceum').map(s => ({ s, ps: (s.profiles || []).filter(p => profileCovers(p, target)) })).filter(x => x.ps.length)
      : [];
    if (!tech.length && !lo.length) return '';

    const techHtml = tech.length ? `
      <h3 class="career-column__subtitle">Technika z tym zawodem</h3>
      <ul class="szkoly__mini">
        ${tech.map(s => `<li><a href="${ctx.BASE}/szkola/${attr(s.rspo)}">${esc(s.shortName || s.name)}</a>${s.district ? ` <span class="szkola__muted">· ${esc(s.district)}</span>` : ''}</li>`).join('')}
      </ul>` : '';
    const why = required.length
      ? `Co najmniej połowa uczelni przypisanych do tego zawodu (${schoolsCounted} z danymi) wymaga matury rozszerzonej z: ${esc(groupsText(required))}.`
      : `Co najmniej połowa uczelni przypisanych do tego zawodu (${schoolsCounted} z danymi) punktuje: ${esc(groupsText(recommended))}. Wystarczy poziom podstawowy, ale rozszerzenie daje więcej punktów.`;
    // Przy długiej liście pokazujemy link do listy szkół z filtrem (działa, gdy każda grupa to jeden przedmiot)
    const MAX_LO = 6;
    const singleCodes = target.every(g => g.length === 1) ? target.map(g => g[0]).filter(c => FILTER_SUBJECTS.includes(c)) : [];
    const filterLink = singleCodes.length === target.length && singleCodes.length
      ? `${ctx.BASE}/szkoly?typ=liceum&rozsz=${singleCodes.join(',')}`
      : '';
    const loList = lo.length > MAX_LO && filterLink
      ? `<p class="career-column__text"><a href="${attr(filterLink)}">Zobacz ${lo.length} liceów z takimi klasami</a></p>`
      : `<ul class="szkoly__mini">
        ${lo.slice(0, MAX_LO).map(x => `<li><a href="${ctx.BASE}/szkola/${attr(x.s.rspo)}">${esc(x.s.shortName || x.s.name)}</a> <span class="szkola__muted">· ${x.ps.map(p => esc(p.name)).join(', ')}</span></li>`).join('')}
        ${lo.length > MAX_LO ? `<li class="szkola__muted">i ${lo.length - MAX_LO} więcej na liście szkół</li>` : ''}
      </ul>`;
    const loHtml = lo.length ? `
      <h3 class="career-column__subtitle">Licea z pasującymi rozszerzeniami</h3>
      <p class="career-column__text szkola__muted">${why}</p>
      ${loList}` : '';
    return `
      <section class="career-secondary">
        <h2 class="career-column__title">Szkoła średnia w Gdańsku</h2>
        ${techHtml}
        ${loHtml}
        <a href="${ctx.BASE}/szkoly" class="career-secondary__all">Wszystkie licea i technika w Gdańsku</a>
      </section>`;
  }

  return { init, load, renderList, renderDetail, careerSectionHtml, CAREER_PROFESSIONS };
})();

window.Szkoly = Szkoly;
