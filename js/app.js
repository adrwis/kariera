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

    for (const r of results) {
      const li = document.createElement('li');
      li.className = 'autocomplete__item';
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
  }

  function closeAutocomplete() {
    autocompleteList.hidden = true;
    autocompleteList.innerHTML = '';
    acIndex = -1;
    searchInput.setAttribute('aria-expanded', 'false');
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

    let results;
    if (cat) {
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
      if (c.skills.required && c.skills.required.length) {
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
        skillsHtml += '<ul class="career-column__list">';
        for (const t of c.skills.training) {
          skillsHtml += `<li class="career-column__item">${escapeHtml(t.name)}`;
          if (t.providers && t.providers.length) {
            skillsHtml += `<span class="career-column__providers">${t.providers.map(escapeHtml).join(', ')}</span>`;
          }
          skillsHtml += '</li>';
        }
        skillsHtml += '</ul>';
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
        eduHtml += '<ul class="career-column__list">';
        for (const s of c.education.schools) {
          const link = s.url
            ? `<a href="${escapeAttr(s.url)}" target="_blank" rel="noopener" class="career-column__link">${escapeHtml(s.name)}</a>`
            : escapeHtml(s.name);
          eduHtml += `<li class="career-column__item">${link}${s.city ? ` <span class="career-column__annotation">(${escapeHtml(s.city)})</span>` : ''}</li>`;
        }
        eduHtml += '</ul>';
      }
    }

    // Famous people column
    let famousHtml = '';
    if (c.famousPeople && c.famousPeople.length) {
      famousHtml += '<ul class="career-column__list">';
      for (const p of c.famousPeople) {
        famousHtml += `<li class="career-column__item"><strong>${escapeHtml(p.name)}</strong>${p.description ? ` — ${escapeHtml(p.description)}` : ''}</li>`;
      }
      famousHtml += '</ul>';
    } else {
      famousHtml = '<p class="career-column__empty">Brak danych</p>';
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
        <h2 class="career-hero__name">${escapeHtml(c.name)}</h2>
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
          <h3 class="career-column__title">Znane osoby</h3>
          ${famousHtml}
        </div>
      </div>

      ${relatedHtml}
      ${sourcesHtml}
    `;
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
        <h2 class="career-hero__name">${escapeHtml(kzis.name)}</h2>
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

  // --- Init ---
  async function init() {
    // Load data
    await CareerSearch.loadData();

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
