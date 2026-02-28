/* ============================================
   Kariera Explorer — App (Router + Main Logic)
   ============================================ */

(function () {
  'use strict';

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

  // --- Search form ---
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

  // --- Results ---
  const resultsList = document.getElementById('resultsList');
  const resultsEmpty = document.getElementById('resultsEmpty');
  const resultsQuery = document.getElementById('resultsQuery');

  function handleResults(params) {
    const query = params.get('q') || '';
    const cat = params.get('cat') || '';

    let results;
    if (cat) {
      results = CareerSearch.searchByCategory(cat);
      resultsQuery.textContent = `Kategoria: ${cat}`;
    } else if (query) {
      results = CareerSearch.search(query);
      const name = localStorage.getItem('kr-name');
      resultsQuery.textContent = name
        ? `${name}, oto wyniki dla: "${query}"`
        : `Wyniki dla: "${query}"`;
    } else {
      results = { rich: [], simple: [] };
    }

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
      resultsEmpty.hidden = false;
      return;
    }

    resultsEmpty.hidden = true;
    resultsList.innerHTML = '';

    // Rich results first
    for (const career of results.rich) {
      resultsList.appendChild(createRichCard(career));
    }

    // Simple KZiS results
    for (const entry of results.simple) {
      resultsList.appendChild(createSimpleCard(entry));
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
      <a href="#/" class="results__back">&larr; Wróć</a>
      <div class="career-fallback">
        <p class="career-fallback__text">Nie znaleziono zawodu o identyfikatorze "${escapeHtml(idOrCode)}".</p>
        <a href="#/" class="career-fallback__link">Wróć do wyszukiwarki</a>
      </div>
    `;
  }

  function renderRichDetail(c) {
    const salaryText = c.salary
      ? `${c.salary.min.toLocaleString('pl-PL')}–${c.salary.max.toLocaleString('pl-PL')} PLN`
      : '';

    const demandClass = c.demand ? `result-card__badge--demand-${c.demand}` : '';

    // Skills column
    let skillsHtml = '';
    if (c.skills) {
      if (c.skills.required && c.skills.required.length) {
        skillsHtml += '<h4 style="font-size:0.85rem;margin-bottom:0.3rem;color:var(--kr-text-muted)">Wymagane umiejętności</h4>';
        skillsHtml += '<ul class="career-column__list">';
        for (const s of c.skills.required) {
          skillsHtml += `<li class="career-column__item">${escapeHtml(s)}</li>`;
        }
        skillsHtml += '</ul>';
      }
      if (c.skills.certifications && c.skills.certifications.length) {
        skillsHtml += '<h4 style="font-size:0.85rem;margin:0.75rem 0 0.3rem;color:var(--kr-text-muted)">Certyfikaty</h4>';
        skillsHtml += '<ul class="career-column__list">';
        for (const cert of c.skills.certifications) {
          skillsHtml += cert.url
            ? `<li class="career-column__item"><a href="${escapeAttr(cert.url)}" target="_blank" rel="noopener" class="career-column__link">${escapeHtml(cert.name)}</a></li>`
            : `<li class="career-column__item">${escapeHtml(cert.name)}</li>`;
        }
        skillsHtml += '</ul>';
      }
      if (c.skills.training && c.skills.training.length) {
        skillsHtml += '<h4 style="font-size:0.85rem;margin:0.75rem 0 0.3rem;color:var(--kr-text-muted)">Szkolenia</h4>';
        skillsHtml += '<ul class="career-column__list">';
        for (const t of c.skills.training) {
          skillsHtml += `<li class="career-column__item">${escapeHtml(t.name)}</li>`;
        }
        skillsHtml += '</ul>';
      }
    }

    // Education column
    let eduHtml = '';
    if (c.education) {
      if (c.education.level) {
        eduHtml += `<p style="font-size:0.9rem;margin-bottom:0.5rem"><strong>Poziom:</strong> ${escapeHtml(c.education.level)}</p>`;
      }
      if (c.education.fields && c.education.fields.length) {
        eduHtml += `<p style="font-size:0.9rem;margin-bottom:0.5rem"><strong>Kierunki:</strong> ${c.education.fields.map(escapeHtml).join(', ')}</p>`;
      }
      if (c.education.schools && c.education.schools.length) {
        eduHtml += '<h4 style="font-size:0.85rem;margin:0.5rem 0 0.3rem;color:var(--kr-text-muted)">Uczelnie</h4>';
        eduHtml += '<ul class="career-column__list">';
        for (const s of c.education.schools) {
          const link = s.url
            ? `<a href="${escapeAttr(s.url)}" target="_blank" rel="noopener" class="career-column__link">${escapeHtml(s.name)}</a>`
            : escapeHtml(s.name);
          eduHtml += `<li class="career-column__item">${link}${s.city ? ` <span style="color:var(--kr-text-muted);font-size:0.8rem">(${escapeHtml(s.city)})</span>` : ''}</li>`;
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
      famousHtml = '<p style="color:var(--kr-text-muted);font-size:0.9rem">Brak danych</p>';
    }

    // Related careers
    let relatedHtml = '';
    if (c.relatedCareers && c.relatedCareers.length) {
      relatedHtml = `
        <div class="career-related">
          <h3 class="career-related__title">Powiązane zawody</h3>
          <div class="career-related__tags">
            ${c.relatedCareers.map(id => `<a href="#/zawod/${escapeAttr(id)}" class="popular__tag">${escapeHtml(id.replace(/-/g, ' '))}</a>`).join('')}
          </div>
        </div>
      `;
    }

    // Sources
    let sourcesHtml = '';
    if (c.sources && c.sources.length) {
      sourcesHtml = `
        <div class="career-sources">
          <strong>Źródła:</strong> ${c.sources.map(escapeHtml).join(', ')}
          · <a href="https://psz.praca.gov.pl/rynek-pracy/bazy-danych/infodoradca/-/infodoradca/zawody" target="_blank" rel="noopener">INFOdoradca+</a>
          · <a href="https://barometrzawodow.pl" target="_blank" rel="noopener">Barometr Zawodów</a>
        </div>
      `;
    }

    careerDetail.innerHTML = `
      <a href="#/" class="results__back">&larr; Wróć</a>

      <div class="career-hero">
        <h2 class="career-hero__name">${escapeHtml(c.name)}</h2>
        <p class="career-hero__code">KZiS: ${escapeHtml(c.code)}</p>
        <div class="career-hero__badges">
          ${salaryText ? `<span class="result-card__badge result-card__badge--salary">${salaryText}</span>` : ''}
          ${c.demand ? `<span class="result-card__badge ${demandClass}">${escapeHtml(c.demand)}</span>` : ''}
        </div>
        ${c.fullDescription ? `<p class="career-hero__desc">${escapeHtml(c.fullDescription)}</p>` : (c.shortDescription ? `<p class="career-hero__desc">${escapeHtml(c.shortDescription)}</p>` : '')}
      </div>

      <div class="career-columns">
        <div class="career-column">
          <h3 class="career-column__title">Umiejętności i certyfikaty</h3>
          ${skillsHtml || '<p style="color:var(--kr-text-muted);font-size:0.9rem">Brak danych</p>'}
        </div>
        <div class="career-column">
          <h3 class="career-column__title">Wykształcenie i uczelnie</h3>
          ${eduHtml || '<p style="color:var(--kr-text-muted);font-size:0.9rem">Brak danych</p>'}
        </div>
        <div class="career-column">
          <h3 class="career-column__title">Znane osoby</h3>
          ${famousHtml}
        </div>
      </div>

      ${relatedHtml}
      ${sourcesHtml}
    `;
  }

  function renderFallbackDetail(kzis) {
    careerDetail.innerHTML = `
      <a href="#/" class="results__back">&larr; Wróć</a>

      <div class="career-hero">
        <h2 class="career-hero__name">${escapeHtml(kzis.name)}</h2>
        <p class="career-hero__code">KZiS: ${escapeHtml(kzis.code)}${kzis.group ? ` · ${escapeHtml(kzis.group)}` : ''}</p>
      </div>

      <div class="career-fallback">
        <p class="career-fallback__text">Szczegółowy profil tego zawodu jest w przygotowaniu.</p>
        <a href="https://psz.praca.gov.pl/rynek-pracy/bazy-danych/infodoradca/-/infodoradca/zawody" target="_blank" rel="noopener" class="career-fallback__link">
          Sprawdź w INFOdoradca+ &rarr;
        </a>
      </div>
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
