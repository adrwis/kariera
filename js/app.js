/* ============================================
   NextMove — App (Router + Main Logic)
   ============================================ */

(function () {
  'use strict';

  // --- Category display names ---
  const CATEGORY_NAMES = {
    it: 'IT i Technologia',
    medycyna: 'Medycyna i Zdrowie',
    prawo: 'Prawo i Administracja',
    edukacja: 'Edukacja i Nauka',
    biznes: 'Biznes i Finanse',
    inzynieria: 'Inżynieria',
    sztuka: 'Sztuka i Kultura',
    przyroda: 'Przyroda i Środowisko',
    uslugi: 'Usługi i Handel',
    bezpieczenstwo: 'Bezpieczeństwo',
  };

  // --- State ---
  let lastResultsHash = '';
  let currentResults = null;
  let currentSort = 'relevance';

  // --- Screen reader announcements ---
  const srAnnounce = document.getElementById('srAnnounce');
  function announce(msg) {
    if (!srAnnounce) return;
    srAnnounce.textContent = '';
    void srAnnounce.offsetHeight;
    srAnnounce.textContent = msg;
  }

  // --- Theme ---
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('kr-theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('kr-theme', next);
  });

  // --- Views ---
  const views = {
    landing: document.getElementById('view-landing'),
    wyniki: document.getElementById('view-wyniki'),
    zawod: document.getElementById('view-zawod'),
  };

  function showView(name) {
    for (const [key, el] of Object.entries(views)) {
      if (key === name) {
        el.hidden = false;
        el.classList.add('active');
      } else {
        el.hidden = true;
        el.classList.remove('active');
      }
    }
    window.scrollTo(0, 0);

    // Focus management: move focus to heading of new view (skip 'zawod' — handled by render functions)
    if (name !== 'zawod') {
      const heading = views[name].querySelector('h1, h2');
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
      }
    }
  }

  // --- Router ---
  function getRoute() {
    const hash = window.location.hash || '#/';
    if (hash.startsWith('#/wyniki')) return { view: 'wyniki', params: new URLSearchParams(hash.split('?')[1] || '') };
    if (hash.startsWith('#/zawod/')) return { view: 'zawod', params: hash.replace('#/zawod/', '') };
    return { view: 'landing', params: null };
  }

  function navigate() {
    const route = getRoute();

    switch (route.view) {
      case 'landing':
        showView('landing');
        break;

      case 'wyniki':
        showView('wyniki');
        lastResultsHash = window.location.hash;
        handleResults(route.params);
        break;

      case 'zawod':
        showView('zawod');
        handleCareerDetail(route.params);
        break;

      default:
        showView('landing');
    }
  }

  window.addEventListener('hashchange', navigate);

  // --- Search form (landing) ---
  const searchForm = document.getElementById('searchForm');
  const searchInput = document.getElementById('searchQuery');
  const nameInput = document.getElementById('userName');
  const autocompleteList = document.getElementById('autocompleteList');

  // Restore name from localStorage
  const savedName = localStorage.getItem('kr-name');
  if (savedName) nameInput.value = savedName;

  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (!query) return;

    // Save name
    const name = nameInput.value.trim();
    if (name) localStorage.setItem('kr-name', name);

    // Navigate to results
    window.location.hash = `#/wyniki?q=${encodeURIComponent(query)}`;
    closeAutocomplete();
  });

  // --- Inline search form (results) ---
  const resultsSearchForm = document.getElementById('resultsSearchForm');
  const resultsSearchInput = document.getElementById('resultsSearchInput');

  resultsSearchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = resultsSearchInput.value.trim();
    if (!query) return;
    window.location.hash = `#/wyniki?q=${encodeURIComponent(query)}`;
  });

  // --- Sort toolbar ---
  const resultsToolbar = document.getElementById('resultsToolbar');

  resultsToolbar.addEventListener('click', (e) => {
    const btn = e.target.closest('.results__sort-btn');
    if (!btn) return;

    const sort = btn.dataset.sort;
    if (sort === currentSort) return;

    currentSort = sort;

    // Update active state
    for (const b of resultsToolbar.querySelectorAll('.results__sort-btn')) {
      b.classList.toggle('results__sort-btn--active', b === btn);
    }

    // Re-render with new sort
    if (currentResults) {
      renderResultCards(sortResults(currentResults, currentSort));
    }
  });

  // --- Autocomplete ---
  let acIndex = -1;

  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim();
    if (query.length < 2) {
      closeAutocomplete();
      return;
    }

    const results = CareerSearch.autocomplete(query);
    if (results.length === 0) {
      closeAutocomplete();
      return;
    }

    renderAutocomplete(results);
  });

  searchInput.addEventListener('keydown', (e) => {
    const items = autocompleteList.querySelectorAll('.autocomplete__item');
    if (!items.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      acIndex = Math.min(acIndex + 1, items.length - 1);
      updateAcSelection(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      acIndex = Math.max(acIndex - 1, 0);
      updateAcSelection(items);
    } else if (e.key === 'Enter' && acIndex >= 0) {
      e.preventDefault();
      items[acIndex].click();
    } else if (e.key === 'Escape') {
      closeAutocomplete();
    }
  });

  function renderAutocomplete(results) {
    acIndex = -1;
    autocompleteList.innerHTML = '';

    searchInput.removeAttribute('aria-activedescendant');

    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      const li = document.createElement('li');
      li.className = 'autocomplete__item';
      li.id = 'ac-item-' + i;
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', 'false');
      li.innerHTML = `
        <span>${escapeHtml(r.name)}</span>
        <span class="autocomplete__item-code">${escapeHtml(r.code)}</span>
      `;
      li.addEventListener('click', () => {
        if (r.type === 'rich') {
          window.location.hash = `#/zawod/${r.id}`;
        } else {
          window.location.hash = `#/zawod/${r.code}`;
        }
        closeAutocomplete();
      });
      autocompleteList.appendChild(li);
    }

    autocompleteList.hidden = false;
    searchInput.setAttribute('aria-expanded', 'true');
  }

  function updateAcSelection(items) {
    items.forEach((item, i) => {
      item.setAttribute('aria-selected', i === acIndex ? 'true' : 'false');
    });
    if (acIndex >= 0 && items[acIndex]) {
      searchInput.setAttribute('aria-activedescendant', items[acIndex].id);
    }
  }

  function closeAutocomplete() {
    autocompleteList.hidden = true;
    autocompleteList.innerHTML = '';
    acIndex = -1;
    searchInput.setAttribute('aria-expanded', 'false');
    searchInput.removeAttribute('aria-activedescendant');
  }

  // Close autocomplete on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-box__input-wrapper')) {
      closeAutocomplete();
    }
  });

  // --- Polish declension helper ---
  function pluralZawod(n) {
    if (n === 1) return 'zawód';
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'zawody';
    return 'zawodów';
  }

  // --- Results ---
  const resultsList = document.getElementById('resultsList');
  const resultsEmpty = document.getElementById('resultsEmpty');
  const resultsQuery = document.getElementById('resultsQuery');
  const resultsCount = document.getElementById('resultsCount');
  const resultsEmptyCats = document.getElementById('resultsEmptyCats');

  function handleResults(params) {
    const query = params.get('q') || '';
    const cat = params.get('cat') || '';

    // Reset sort to relevance
    currentSort = 'relevance';
    for (const b of resultsToolbar.querySelectorAll('.results__sort-btn')) {
      b.classList.toggle('results__sort-btn--active', b.dataset.sort === 'relevance');
    }

    const isFilter = params.get('filter') === '1';

    let results;
    if (isFilter) {
      const catsStr = params.get('cats');
      const categories = catsStr ? catsStr.split(',') : [];
      const sMin = parseInt(params.get('smin')) || null;
      const sMax = parseInt(params.get('smax')) || null;
      const demandStr = params.get('demand');
      const demands = demandStr ? demandStr.split(',') : [];
      const schoolsStr = params.get('schools');
      const schools = schoolsStr ? schoolsStr.split('|') : [];

      results = CareerSearch.filterCareers({
        categories,
        salaryMin: sMin,
        salaryMax: sMax,
        demands,
        schools,
      });

      // Build description
      const parts = [];
      if (categories.length) {
        parts.push(categories.map(c => CATEGORY_NAMES[c] || c).join(', '));
      }
      if (sMin || sMax) {
        parts.push(`zarobki ${(sMin || 3000).toLocaleString('pl-PL')}–${(sMax || 35000).toLocaleString('pl-PL')} PLN`);
      }
      if (demands.length && demands.length < 3) {
        parts.push(`zapotrzebowanie: ${demands.join(', ')}`);
      }
      if (schools.length) {
        parts.push(`uczelnia: ${schools.join(', ')}`);
      }
      const name = localStorage.getItem('kr-name');
      resultsQuery.textContent = name
        ? `${name}, oto wyniki filtrowania: ${parts.join(' · ') || 'wszystkie zawody'}`
        : `Filtrowanie: ${parts.join(' · ') || 'wszystkie zawody'}`;
    } else if (cat) {
      results = CareerSearch.searchByCategory(cat);
      const catName = CATEGORY_NAMES[cat] || cat;
      const name = localStorage.getItem('kr-name');
      resultsQuery.textContent = name
        ? `${name}, oto zawody z kategorii ${catName}`
        : `Kategoria: ${catName}`;
    } else if (query) {
      results = CareerSearch.search(query);
      const name = localStorage.getItem('kr-name');
      resultsQuery.textContent = name
        ? `${name}, oto wyniki dla: "${query}"`
        : `Wyniki dla: "${query}"`;
    } else {
      results = { rich: [], simple: [] };
    }

    // Pre-fill inline search
    resultsSearchInput.value = query;

    const total = results.rich.length + results.simple.length;

    // Single result → redirect to detail
    if (total === 1) {
      const item = results.rich[0] || results.simple[0];
      const id = item.id || item.code;
      window.location.hash = `#/zawod/${id}`;
      return;
    }

    if (total === 0) {
      resultsList.innerHTML = '';
      resultsCount.textContent = '';
      resultsToolbar.hidden = true;
      resultsEmpty.hidden = false;
      announce('Nie znaleziono zawodów');

      // Populate empty state category suggestions
      resultsEmptyCats.innerHTML = '';
      const suggestedCats = ['it', 'medycyna', 'biznes', 'edukacja', 'sztuka'];
      for (const catKey of suggestedCats) {
        const a = document.createElement('a');
        a.href = `#/wyniki?cat=${catKey}`;
        a.className = 'popular__tag';
        a.textContent = CATEGORY_NAMES[catKey];
        resultsEmptyCats.appendChild(a);
      }
      return;
    }

    resultsEmpty.hidden = true;
    resultsToolbar.hidden = false;
    resultsCount.textContent = `Znaleziono ${total} ${pluralZawod(total)}`;
    announce(`Znaleziono ${total} ${pluralZawod(total)}`);

    // Store for sorting
    currentResults = results;
    renderResultCards(sortResults(results, currentSort));
  }

  // --- Sort logic ---
  function sortResults(results, sort) {
    // Build combined flat list with type markers
    const rich = results.rich.map(r => ({ ...r, _type: 'rich' }));
    const simple = results.simple.map(s => ({ ...s, _type: 'simple' }));

    if (sort === 'relevance') {
      // Original order: rich first, then simple
      return { rich: results.rich, simple: results.simple };
    }

    if (sort === 'name') {
      const all = [...rich, ...simple];
      all.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pl'));
      return {
        rich: all.filter(x => x._type === 'rich'),
        simple: all.filter(x => x._type === 'simple'),
      };
    }

    if (sort === 'salary') {
      // Rich cards sorted by salary.max desc, simple cards always at the bottom
      const sortedRich = [...results.rich].sort((a, b) => {
        const aMax = a.salary ? a.salary.max : 0;
        const bMax = b.salary ? b.salary.max : 0;
        return bMax - aMax;
      });
      return { rich: sortedRich, simple: results.simple };
    }

    return results;
  }

  // --- Render result cards ---
  function renderResultCards(results) {
    resultsList.innerHTML = '';
    let idx = 0;

    for (const career of results.rich) {
      const card = createRichCard(career);
      card.style.animationDelay = `${Math.min(idx * 60, 480)}ms`;
      resultsList.appendChild(card);
      idx++;
    }

    for (const entry of results.simple) {
      const card = createSimpleCard(entry);
      card.style.animationDelay = `${Math.min(idx * 60, 480)}ms`;
      resultsList.appendChild(card);
      idx++;
    }
  }

  function createRichCard(career) {
    const a = document.createElement('a');
    a.href = `#/zawod/${career.id}`;
    a.className = 'result-card';
    a.setAttribute('role', 'listitem');

    const salaryText = career.salary
      ? `${career.salary.min.toLocaleString('pl-PL')}–${career.salary.max.toLocaleString('pl-PL')} PLN`
      : '';

    const demandClass = career.demand ? `result-card__badge--demand-${career.demand}` : '';

    a.innerHTML = `
      <div class="result-card__name">${escapeHtml(career.name)}</div>
      <div class="result-card__code">KZiS: ${escapeHtml(career.code)}</div>
      <div class="result-card__desc">${escapeHtml(career.shortDescription || '')}</div>
      <div class="result-card__meta">
        ${salaryText ? `<span class="result-card__badge result-card__badge--salary">${salaryText}</span>` : ''}
        ${career.demand ? `<span class="result-card__badge ${demandClass}">${escapeHtml(career.demand)}</span>` : ''}
      </div>
    `;
    return a;
  }

  function createSimpleCard(entry) {
    const a = document.createElement('a');
    a.href = `#/zawod/${entry.code}`;
    a.className = 'result-card result-card--simple';
    a.setAttribute('role', 'listitem');
    a.innerHTML = `
      <div class="result-card__name">${escapeHtml(entry.name)}</div>
      <div class="result-card__code">KZiS: ${escapeHtml(entry.code)} · ${escapeHtml(entry.group || '')}</div>
    `;
    return a;
  }

  // --- Career Detail ---
  const careerDetail = document.getElementById('careerDetail');

  function getBackHref() {
    return lastResultsHash || '#/';
  }

  function handleCareerDetail(idOrCode) {
    // Try rich profile first
    let career = CareerSearch.getCareerById(idOrCode);

    if (career) {
      renderRichDetail(career);
      return;
    }

    // Try KZiS by code
    const kzis = CareerSearch.getKzisByCode(idOrCode);
    if (kzis) {
      renderFallbackDetail(kzis);
      return;
    }

    // Not found
    careerDetail.innerHTML = `
      <a href="${escapeAttr(getBackHref())}" class="results__back">&larr; Wróć</a>
      <div class="career-fallback">
        <p class="career-fallback__text">Nie znaleziono zawodu o identyfikatorze "${escapeHtml(idOrCode)}".</p>
        <a href="#/" class="career-fallback__link">Wróć do wyszukiwarki</a>
      </div>
    `;
  }

  const DEMAND_LABELS = {
    deficytowy: 'Deficytowy (poszukiwany na rynku pracy)',
    'zrównoważony': 'Zrównoważony (podaż ≈ popyt)',
    'nadwyżkowy': 'Nadwyżkowy (więcej kandydatów niż ofert)',
  };

  function renderRichDetail(c) {
    currentCareerData = c;

    const salaryText = c.salary
      ? `${c.salary.min.toLocaleString('pl-PL')}–${c.salary.max.toLocaleString('pl-PL')} PLN brutto/mies.`
      : '';

    const demandClass = c.demand ? `result-card__badge--demand-${c.demand}` : '';
    const demandTitle = c.demand ? ` title="${escapeAttr(DEMAND_LABELS[c.demand] || c.demand)}"` : '';

    const catName = CATEGORY_NAMES[c.category] || '';
    const categoryBadge = catName
      ? `<a href="#/wyniki?cat=${escapeAttr(c.category)}" class="career-hero__category">${escapeHtml(catName)}</a>`
      : '';

    const aliasesHtml = c.aliases && c.aliases.length
      ? `<p class="career-hero__aliases">Znany też jako: ${c.aliases.map(escapeHtml).join(', ')}</p>`
      : '';

    // Skills column
    let skillsHtml = '';
    if (c.skills) {
      if (c.skills.soft && c.skills.soft.length) {
        skillsHtml += '<h4 class="career-column__subtitle">Umiejętności miękkie</h4>';
        skillsHtml += '<ul class="career-column__list career-column__list--soft">';
        for (const s of c.skills.soft) {
          skillsHtml += `<li class="career-column__item career-column__item--soft">${escapeHtml(s)}</li>`;
        }
        skillsHtml += '</ul>';
      }
      if (c.skills.technical && c.skills.technical.length) {
        skillsHtml += '<h4 class="career-column__subtitle career-column__subtitle--spaced">Umiejętności techniczne</h4>';
        skillsHtml += '<ul class="career-column__list career-column__list--tech">';
        for (const s of c.skills.technical) {
          skillsHtml += `<li class="career-column__item career-column__item--tech">${escapeHtml(s)}</li>`;
        }
        skillsHtml += '</ul>';
      }
      // Fallback for old data format
      if (!c.skills.soft && !c.skills.technical && c.skills.required && c.skills.required.length) {
        skillsHtml += '<h4 class="career-column__subtitle">Wymagane umiejętności</h4>';
        skillsHtml += '<ul class="career-column__list">';
        for (const s of c.skills.required) {
          skillsHtml += `<li class="career-column__item">${escapeHtml(s)}</li>`;
        }
        skillsHtml += '</ul>';
      }
      if (c.skills.certifications && c.skills.certifications.length) {
        skillsHtml += '<h4 class="career-column__subtitle career-column__subtitle--spaced">Certyfikaty</h4>';
        skillsHtml += '<ul class="career-column__list">';
        for (const cert of c.skills.certifications) {
          skillsHtml += cert.url
            ? `<li class="career-column__item"><a href="${escapeAttr(cert.url)}" target="_blank" rel="noopener" class="career-column__link">${escapeHtml(cert.name)}</a></li>`
            : `<li class="career-column__item">${escapeHtml(cert.name)}</li>`;
        }
        skillsHtml += '</ul>';
      }
      if (c.skills.training && c.skills.training.length) {
        skillsHtml += '<h4 class="career-column__subtitle career-column__subtitle--spaced">Szkolenia</h4>';
        skillsHtml += '<div class="training-cards">';
        for (let ti = 0; ti < c.skills.training.length; ti++) {
          const t = c.skills.training[ti];
          const provCount = t.providers ? t.providers.length : 0;
          const metaText = t.price ? t.price : (provCount ? provCount + ' provider' + (provCount > 1 ? 'ów' : '') : '');
          skillsHtml += `
            <button type="button" class="training-card" data-training-idx="${ti}" aria-label="Szczegóły: ${escapeAttr(t.name)}">
              <span class="training-card__icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              </span>
              <span class="training-card__info">
                <span class="training-card__name">${escapeHtml(t.name)}</span>
                ${metaText ? `<span class="training-card__meta">${escapeHtml(metaText)}</span>` : ''}
              </span>
              <svg class="training-card__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
            </button>`;
        }
        skillsHtml += '</div>';
      }
    }

    // Education column
    let eduHtml = '';
    if (c.education) {
      if (c.education.level) {
        eduHtml += `<p class="career-column__text"><strong>Poziom:</strong> ${escapeHtml(c.education.level)}</p>`;
      }
      if (c.education.fields && c.education.fields.length) {
        eduHtml += `<p class="career-column__text"><strong>Kierunki:</strong> ${c.education.fields.map(escapeHtml).join(', ')}</p>`;
      }
      if (c.education.schools && c.education.schools.length) {
        eduHtml += '<h4 class="career-column__subtitle career-column__subtitle--spaced">Uczelnie</h4>';
        eduHtml += '<div class="school-cards">';
        for (let si = 0; si < c.education.schools.length; si++) {
          const s = c.education.schools[si];
          eduHtml += `
            <button type="button" class="school-card" data-school-idx="${si}" aria-label="Szczegóły: ${escapeAttr(s.name)}">
              <span class="school-card__icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 22h20"/><path d="M6 18V7"/><path d="M18 18V7"/><path d="M2 10l10-6 10 6"/><rect x="10" y="12" width="4" height="6"/></svg>
              </span>
              <span class="school-card__info">
                <span class="school-card__name">${escapeHtml(s.name)}</span>
                ${s.city ? `<span class="school-card__city">${escapeHtml(s.city)}</span>` : ''}
              </span>
              <svg class="school-card__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
            </button>`;
        }
        eduHtml += '</div>';
      }
    }

    // Famous people column
    let famousHtml = '';
    if (c.famousPeople && c.famousPeople.length) {
      famousHtml += '<div class="famous-people">';
      for (let fi = 0; fi < c.famousPeople.length; fi++) {
        const p = c.famousPeople[fi];
        const initials = getInitials(p.name);
        famousHtml += `
          <button type="button" class="famous-card" data-person-idx="${fi}" aria-label="Pokaż biografię: ${escapeAttr(p.name)}">
            <span class="famous-card__avatar" aria-hidden="true">${escapeHtml(initials)}</span>
            <span class="famous-card__info">
              <span class="famous-card__name">${escapeHtml(p.name)}</span>
              <span class="famous-card__desc">${escapeHtml(p.description || '')}</span>
            </span>
            <svg class="famous-card__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
          </button>`;
      }
      famousHtml += '</div>';
    } else {
      famousHtml = '<p class="career-column__empty">Brak danych</p>';
    }

    // Workplaces column
    let workplacesHtml = '';
    if (c.workplaces && c.workplaces.length) {
      workplacesHtml += '<div class="workplace-list">';
      for (const wp of c.workplaces) {
        workplacesHtml += `
          <div class="workplace-item">
            <span class="workplace-item__icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
            </span>
            <span class="workplace-item__info">
              <span class="workplace-item__name">${escapeHtml(wp.name)}</span>
              ${wp.description ? `<span class="workplace-item__desc">${escapeHtml(wp.description)}</span>` : ''}
            </span>
          </div>`;
      }
      workplacesHtml += '</div>';
    } else {
      workplacesHtml = '<p class="career-column__empty">Brak danych</p>';
    }

    // Related careers
    let relatedHtml = '';
    if (c.relatedCareers && c.relatedCareers.length) {
      const relatedTags = c.relatedCareers.map(id => {
        const rich = CareerSearch.getCareerById(id);
        const label = rich ? rich.name : id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        return `<a href="#/zawod/${escapeAttr(id)}" class="popular__tag">${escapeHtml(label)}</a>`;
      }).join('');
      relatedHtml = `
        <div class="career-related career-related--detail">
          <h3 class="career-related__title">Powiązane zawody</h3>
          <div class="career-related__tags">${relatedTags}</div>
        </div>
      `;
    }

    // Sources
    let sourcesHtml = '';
    if (c.sources && c.sources.length) {
      sourcesHtml = `
        <div class="career-sources career-sources--detail">
          <strong>Źródła:</strong> ${c.sources.map(escapeHtml).join(', ')}
          · <a href="https://psz.praca.gov.pl/rynek-pracy/bazy-danych/infodoradca/-/infodoradca/zawody" target="_blank" rel="noopener">INFOdoradca+</a>
          · <a href="https://barometrzawodow.pl" target="_blank" rel="noopener">Barometr Zawodów</a>
        </div>
      `;
    }

    careerDetail.innerHTML = `
      <a href="${escapeAttr(getBackHref())}" class="results__back">&larr; Wróć</a>

      <div class="career-hero career-hero--detail">
        ${categoryBadge}
        <h1 class="career-hero__name">${escapeHtml(c.name)}</h1>
        ${aliasesHtml}
        <p class="career-hero__code">KZiS: ${escapeHtml(c.code)}</p>
        <div class="career-hero__badges">
          ${salaryText ? `<span class="result-card__badge result-card__badge--salary">${salaryText}</span>` : ''}
          ${c.demand ? `<span class="result-card__badge ${demandClass}"${demandTitle}>${escapeHtml(c.demand)}</span>` : ''}
        </div>
        ${c.fullDescription ? `<p class="career-hero__desc">${escapeHtml(c.fullDescription)}</p>` : (c.shortDescription ? `<p class="career-hero__desc">${escapeHtml(c.shortDescription)}</p>` : '')}
      </div>

      <div class="career-columns career-columns--detail">
        <div class="career-column career-column--detail">
          <h3 class="career-column__title">Umiejętności i certyfikaty</h3>
          ${skillsHtml || '<p class="career-column__empty">Brak danych</p>'}
        </div>
        <div class="career-column career-column--detail">
          <h3 class="career-column__title">Wykształcenie i uczelnie</h3>
          ${eduHtml || '<p class="career-column__empty">Brak danych</p>'}
        </div>
        <div class="career-column career-column--detail">
          <h3 class="career-column__title">Gdzie pracować</h3>
          ${workplacesHtml}
        </div>
        <div class="career-column career-column--detail">
          <h3 class="career-column__title">Znane osoby</h3>
          ${famousHtml}
        </div>
      </div>

      ${relatedHtml}
      ${sourcesHtml}
    `;

    const heading = careerDetail.querySelector('.career-hero__name');
    if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus({ preventScroll: true }); }
    announce(`Zawód: ${c.name}`);
  }

  function renderFallbackDetail(kzis) {
    const catName = CATEGORY_NAMES[kzis.category] || '';
    const categoryBadge = catName
      ? `<a href="#/wyniki?cat=${escapeAttr(kzis.category)}" class="career-hero__category">${escapeHtml(catName)}</a>`
      : '';

    // Find up to 5 rich profiles from the same category
    let suggestionsHtml = '';
    if (kzis.category) {
      const suggestions = CareerSearch.careers
        .filter(c => c.category === kzis.category)
        .slice(0, 5);
      if (suggestions.length) {
        suggestionsHtml = `
          <div class="career-fallback__suggestions">
            <h4 class="career-fallback__suggestions-title">Inne zawody z kategorii ${escapeHtml(catName)}</h4>
            <div class="career-fallback__suggestions-tags">
              ${suggestions.map(s => `<a href="#/zawod/${escapeAttr(s.id)}" class="popular__tag">${escapeHtml(s.name)}</a>`).join('')}
            </div>
          </div>
        `;
      }
    }

    careerDetail.innerHTML = `
      <a href="${escapeAttr(getBackHref())}" class="results__back">&larr; Wróć</a>

      <div class="career-hero career-hero--detail">
        ${categoryBadge}
        <h1 class="career-hero__name">${escapeHtml(kzis.name)}</h1>
        <p class="career-hero__code">KZiS: ${escapeHtml(kzis.code)}${kzis.group ? ` · ${escapeHtml(kzis.group)}` : ''}</p>
      </div>

      <div class="career-fallback">
        <svg class="career-fallback__icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
        </svg>
        <h3 class="career-fallback__heading">Profil w przygotowaniu</h3>
        <p class="career-fallback__text">Szczegółowy profil tego zawodu jest w przygotowaniu. Sprawdź zewnętrzne źródła:</p>
        <div class="career-fallback__links">
          <a href="https://psz.praca.gov.pl/rynek-pracy/bazy-danych/infodoradca/-/infodoradca/zawody" target="_blank" rel="noopener" class="career-fallback__link">
            INFOdoradca+ &rarr;
          </a>
          <a href="https://barometrzawodow.pl" target="_blank" rel="noopener" class="career-fallback__link career-fallback__link--secondary">
            Barometr Zawodów &rarr;
          </a>
        </div>
      </div>

      ${suggestionsHtml}
    `;

    const heading = careerDetail.querySelector('.career-hero__name');
    if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus({ preventScroll: true }); }
    announce(`Zawód: ${kzis.name}`);
  }

  // --- Famous people popup ---
  let currentCareerData = null;

  function getInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function openPersonPopup(person) {
    // Close any existing popup
    closePersonPopup();

    const initials = getInitials(person.name);
    const overlay = document.createElement('div');
    overlay.className = 'person-popup-overlay';
    overlay.id = 'personPopupOverlay';

    const bioText = person.bio
      ? person.bio.split('\n').map(p => `<p>${escapeHtml(p)}</p>`).join('')
      : `<p>${escapeHtml(person.description || 'Brak dodatkowych informacji.')}</p>`;

    const sourceHtml = person.sourceUrl
      ? `<a href="${escapeAttr(person.sourceUrl)}" target="_blank" rel="noopener" class="person-popup__source">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          Źródło
        </a>`
      : '';

    overlay.innerHTML = `
      <div class="person-popup" role="dialog" aria-modal="true" aria-label="Biografia: ${escapeAttr(person.name)}">
        <button type="button" class="person-popup__close" aria-label="Zamknij">&times;</button>
        <div class="person-popup__header">
          <span class="person-popup__avatar" aria-hidden="true">${escapeHtml(initials)}</span>
          <div>
            <div class="person-popup__name">${escapeHtml(person.name)}</div>
            ${person.description ? `<div class="person-popup__subtitle">${escapeHtml(person.description)}</div>` : ''}
          </div>
        </div>
        <div class="person-popup__bio">${bioText}</div>
        ${sourceHtml}
      </div>
    `;

    document.body.appendChild(overlay);

    // Focus close button
    const closeBtn = overlay.querySelector('.person-popup__close');
    closeBtn.focus();

    // Close handlers
    closeBtn.addEventListener('click', closePersonPopup);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closePersonPopup();
    });
    overlay.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closePersonPopup();
    });

    announce(`Biografia: ${person.name}`);
  }

  function closePersonPopup() {
    const overlay = document.getElementById('personPopupOverlay');
    if (overlay) overlay.remove();
  }

  // Delegate click on famous cards
  careerDetail.addEventListener('click', (e) => {
    const card = e.target.closest('.famous-card');
    if (card && currentCareerData) {
      const idx = parseInt(card.dataset.personIdx);
      const person = currentCareerData.famousPeople && currentCareerData.famousPeople[idx];
      if (person) openPersonPopup(person);
      return;
    }

    // Delegate click on school cards
    const schoolCard = e.target.closest('.school-card');
    if (schoolCard && currentCareerData) {
      const si = parseInt(schoolCard.dataset.schoolIdx);
      const school = currentCareerData.education && currentCareerData.education.schools && currentCareerData.education.schools[si];
      if (school) openSchoolPopup(school);
      return;
    }

    // Delegate click on training cards
    const trainingCard = e.target.closest('.training-card');
    if (trainingCard && currentCareerData) {
      const ti = parseInt(trainingCard.dataset.trainingIdx);
      const training = currentCareerData.skills && currentCareerData.skills.training && currentCareerData.skills.training[ti];
      if (training) openTrainingPopup(training);
    }
  });

  // --- School popup ---
  function openSchoolPopup(school) {
    closeSchoolPopup();

    const overlay = document.createElement('div');
    overlay.className = 'person-popup-overlay';
    overlay.id = 'schoolPopupOverlay';

    // Build website link
    const linkHtml = school.url
      ? `<a href="${escapeAttr(school.url)}" target="_blank" rel="noopener" class="school-popup__link">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          Strona uczelni
        </a>`
      : '';

    // Build modes sections (stacjonarne / niestacjonarne)
    let modesHtml = '';
    if (school.modes && school.modes.length) {
      for (const mode of school.modes) {
        const modeLabel = escapeHtml(mode.type.charAt(0).toUpperCase() + mode.type.slice(1));
        const paidBadge = mode.paid
          ? `<span class="school-popup__badge school-popup__badge--paid">płatne${mode.tuition ? ' · ' + escapeHtml(mode.tuition) : ''}</span>`
          : '<span class="school-popup__badge school-popup__badge--free">bezpłatne</span>';

        let thresholdRows = '';
        if (mode.thresholds && mode.thresholds.length) {
          thresholdRows = `
            <table class="school-popup__thresholds">
              <thead><tr><th>Rok</th><th>Punkty</th></tr></thead>
              <tbody>
                ${mode.thresholds.map(t => `<tr><td>${escapeHtml(String(t.year))}</td><td>${escapeHtml(String(t.points))} pkt</td></tr>`).join('')}
              </tbody>
            </table>`;
        }

        modesHtml += `
          <div class="school-popup__section">
            <div class="school-popup__section-title">${modeLabel} ${paidBadge}</div>
            ${thresholdRows}
          </div>`;
      }
    } else if (school.thresholds && school.thresholds.length) {
      // Fallback for old data format (flat thresholds)
      modesHtml = `
        <div class="school-popup__section">
          <div class="school-popup__section-title">Progi punktowe</div>
          <table class="school-popup__thresholds">
            <thead><tr><th>Rok</th><th>Punkty</th></tr></thead>
            <tbody>
              ${school.thresholds.map(t => `<tr><td>${escapeHtml(String(t.year))}</td><td>${escapeHtml(String(t.points))} pkt</td></tr>`).join('')}
            </tbody>
          </table>
        </div>`;
    }

    // Build requirements list
    let reqsHtml = '';
    if (school.requirements && school.requirements.length) {
      reqsHtml = `
        <div class="school-popup__section">
          <div class="school-popup__section-title">Wymagania maturalne</div>
          <ul class="school-popup__requirements">
            ${school.requirements.map(r => `<li>${escapeHtml(r)}</li>`).join('')}
          </ul>
        </div>`;
    }

    // Fallback if no data at all
    const hasData = (school.modes && school.modes.length) || (school.thresholds && school.thresholds.length) || (school.requirements && school.requirements.length);
    const noDataHtml = !hasData
      ? '<p style="font-size:0.88rem;color:var(--kr-text-muted);font-style:italic;">Szczegółowe dane rekrutacyjne będą dostępne wkrótce.</p>'
      : '';

    overlay.innerHTML = `
      <div class="school-popup" role="dialog" aria-modal="true" aria-label="Szczegóły: ${escapeAttr(school.name)}">
        <button type="button" class="school-popup__close" aria-label="Zamknij">&times;</button>
        <div class="school-popup__header">
          <span class="school-popup__icon" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 22h20"/><path d="M6 18V7"/><path d="M18 18V7"/><path d="M2 10l10-6 10 6"/><rect x="10" y="12" width="4" height="6"/></svg>
          </span>
          <div>
            <div class="school-popup__name">${escapeHtml(school.name)}</div>
            ${school.city ? `<div class="school-popup__city">${escapeHtml(school.city)}</div>` : ''}
          </div>
        </div>
        ${linkHtml}
        ${modesHtml}
        ${reqsHtml}
        ${noDataHtml}
      </div>
    `;

    document.body.appendChild(overlay);

    const closeBtn = overlay.querySelector('.school-popup__close');
    closeBtn.focus();

    closeBtn.addEventListener('click', closeSchoolPopup);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeSchoolPopup();
    });
    overlay.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeSchoolPopup();
    });

    announce(`Szczegóły uczelni: ${school.name}`);
  }

  function closeSchoolPopup() {
    const overlay = document.getElementById('schoolPopupOverlay');
    if (overlay) overlay.remove();
  }

  // --- Training popup ---
  function openTrainingPopup(training) {
    closeTrainingPopup();

    const overlay = document.createElement('div');
    overlay.className = 'person-popup-overlay';
    overlay.id = 'trainingPopupOverlay';

    // Description
    const descHtml = training.description
      ? `<div class="training-popup__desc">${escapeHtml(training.description)}</div>`
      : '';

    // Meta grid (price + requirements)
    let metaItems = '';
    if (training.price) {
      metaItems += `
        <div class="training-popup__meta-item">
          <span class="training-popup__meta-label">Cena</span>
          <span class="training-popup__meta-value">${escapeHtml(training.price)}</span>
        </div>`;
    }
    if (training.requirements) {
      metaItems += `
        <div class="training-popup__meta-item">
          <span class="training-popup__meta-label">Wymagania</span>
          <span class="training-popup__meta-value">${escapeHtml(training.requirements)}</span>
        </div>`;
    }
    const metaHtml = metaItems ? `<div class="training-popup__meta-grid">${metaItems}</div>` : '';

    // Providers list
    let providersHtml = '';
    if (training.providers && training.providers.length) {
      const providerItems = training.providers.map(prov => {
        const isObj = typeof prov === 'object';
        const name = isObj ? prov.name : prov;
        const url = isObj ? prov.url : null;
        const linkTag = url
          ? `<a href="${escapeAttr(url)}" target="_blank" rel="noopener" class="training-popup__provider-link">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              Strona
            </a>`
          : '';
        return `<li class="training-popup__provider">
          <span class="training-popup__provider-name">${escapeHtml(name)}</span>
          ${linkTag}
        </li>`;
      }).join('');
      providersHtml = `
        <div class="training-popup__providers-title">Rekomendowani organizatorzy</div>
        <ul class="training-popup__providers">${providerItems}</ul>`;
    }

    // Fallback
    const noDataHtml = !training.description && !training.price && (!training.providers || !training.providers.length)
      ? '<p style="font-size:0.88rem;color:var(--kr-text-muted);font-style:italic;">Szczegóły szkolenia będą dostępne wkrótce.</p>'
      : '';

    overlay.innerHTML = `
      <div class="training-popup" role="dialog" aria-modal="true" aria-label="Szkolenie: ${escapeAttr(training.name)}">
        <button type="button" class="training-popup__close" aria-label="Zamknij">&times;</button>
        <div class="training-popup__header">
          <span class="training-popup__icon" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          </span>
          <div class="training-popup__name">${escapeHtml(training.name)}</div>
        </div>
        ${descHtml}
        ${metaHtml}
        ${providersHtml}
        ${noDataHtml}
      </div>
    `;

    document.body.appendChild(overlay);

    const closeBtn = overlay.querySelector('.training-popup__close');
    closeBtn.focus();

    closeBtn.addEventListener('click', closeTrainingPopup);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeTrainingPopup();
    });
    overlay.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeTrainingPopup();
    });

    announce(`Szkolenie: ${training.name}`);
  }

  function closeTrainingPopup() {
    const overlay = document.getElementById('trainingPopupOverlay');
    if (overlay) overlay.remove();
  }

  // --- Utilities ---
  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function escapeAttr(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // --- Filters ---
  const salaryMinInput = document.getElementById('salaryMin');
  const salaryMaxInput = document.getElementById('salaryMax');
  const salaryRangeMin = document.getElementById('salaryRangeMin');
  const salaryRangeMax = document.getElementById('salaryRangeMax');
  const demandChecks = document.querySelectorAll('.filters__check input[type="checkbox"]');
  const schoolFilterInput = document.getElementById('schoolFilter');
  const schoolDropdown = document.getElementById('schoolDropdown');
  const schoolSelected = document.getElementById('schoolSelected');
  const filterBtn = document.getElementById('filterBtn');
  const filterReset = document.getElementById('filterReset');

  let selectedSchools = [];
  let selectedCategories = [];
  let allSchools = [];

  // Category chip toggles
  const catChips = document.querySelectorAll('.filters__cat-chip');
  catChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const cat = chip.dataset.cat;
      const idx = selectedCategories.indexOf(cat);
      if (idx >= 0) {
        selectedCategories.splice(idx, 1);
        chip.classList.remove('filters__cat-chip--active');
      } else {
        selectedCategories.push(cat);
        chip.classList.add('filters__cat-chip--active');
      }
    });
  });

  // Sync range sliders ↔ number inputs
  function syncSalary(source) {
    if (source === 'range') {
      let min = parseInt(salaryRangeMin.value);
      let max = parseInt(salaryRangeMax.value);
      if (min > max) { const t = min; min = max; max = t; }
      salaryMinInput.value = min;
      salaryMaxInput.value = max;
    } else {
      let min = parseInt(salaryMinInput.value) || 3000;
      let max = parseInt(salaryMaxInput.value) || 35000;
      if (min > max) { const t = min; min = max; max = t; }
      salaryRangeMin.value = min;
      salaryRangeMax.value = max;
    }
  }

  salaryRangeMin.addEventListener('input', () => syncSalary('range'));
  salaryRangeMax.addEventListener('input', () => syncSalary('range'));
  salaryMinInput.addEventListener('change', () => syncSalary('input'));
  salaryMaxInput.addEventListener('change', () => syncSalary('input'));

  // School autocomplete
  schoolFilterInput.addEventListener('input', () => {
    const q = schoolFilterInput.value.trim().toLowerCase();
    if (q.length < 2) { schoolDropdown.hidden = true; return; }

    const matches = allSchools
      .filter(s => s.toLowerCase().includes(q) && !selectedSchools.includes(s))
      .slice(0, 8);

    if (!matches.length) { schoolDropdown.hidden = true; return; }

    schoolDropdown.innerHTML = '';
    for (const name of matches) {
      const li = document.createElement('li');
      li.className = 'filters__dropdown-item';
      li.setAttribute('role', 'option');
      li.textContent = name;
      li.addEventListener('click', () => {
        selectedSchools.push(name);
        renderSchoolTags();
        schoolFilterInput.value = '';
        schoolDropdown.hidden = true;
      });
      schoolDropdown.appendChild(li);
    }
    schoolDropdown.hidden = false;
  });

  // Close school dropdown on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.filters__school-wrapper')) {
      schoolDropdown.hidden = true;
    }
  });

  function renderSchoolTags() {
    schoolSelected.innerHTML = '';
    for (const name of selectedSchools) {
      const tag = document.createElement('span');
      tag.className = 'filters__school-tag';
      tag.innerHTML = `${escapeHtml(name)} <button type="button" class="filters__school-tag-remove" aria-label="Usuń ${escapeHtml(name)}">&times;</button>`;
      tag.querySelector('button').addEventListener('click', () => {
        selectedSchools = selectedSchools.filter(s => s !== name);
        renderSchoolTags();
      });
      schoolSelected.appendChild(tag);
    }
  }

  // Filter button
  filterBtn.addEventListener('click', () => {
    const params = new URLSearchParams();
    params.set('filter', '1');

    if (selectedCategories.length) params.set('cats', selectedCategories.join(','));

    const sMin = parseInt(salaryMinInput.value) || 3000;
    const sMax = parseInt(salaryMaxInput.value) || 35000;
    if (sMin > 3000) params.set('smin', sMin);
    if (sMax < 35000) params.set('smax', sMax);

    const activeDemands = [...demandChecks].filter(c => c.checked).map(c => c.value);
    if (activeDemands.length < 3) params.set('demand', activeDemands.join(','));

    if (selectedSchools.length) params.set('schools', selectedSchools.join('|'));

    window.location.hash = `#/wyniki?${params.toString()}`;
  });

  // Reset button
  filterReset.addEventListener('click', () => {
    salaryMinInput.value = 3000;
    salaryMaxInput.value = 35000;
    salaryRangeMin.value = 3000;
    salaryRangeMax.value = 35000;
    demandChecks.forEach(c => { c.checked = true; });
    selectedSchools = [];
    selectedCategories = [];
    renderSchoolTags();
    catChips.forEach(c => c.classList.remove('filters__cat-chip--active'));
  });

  // --- Init ---
  async function init() {
    // Load data
    await CareerSearch.loadData();
    allSchools = CareerSearch.getAllSchools();

    // Start animations
    Constellation.init();
    TypingEffect.init();

    // Handle initial route
    navigate();
  }

  // Start when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
