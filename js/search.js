/* ============================================
   NextMove — Search (Fuse.js)
   ============================================ */

const CareerSearch = (() => {
  let fuseMain = null;   // careers.json (rich profiles)
  let fuseKzis = null;   // kzis-index.json (all names)
  let careersData = [];
  let kzisData = [];
  let isLoaded = false;

  async function loadData() {
    if (isLoaded) return;
    try {
      const [careersRes, kzisRes] = await Promise.all([
        fetch('data/careers.json'),
        fetch('data/kzis-index.json'),
      ]);

      if (careersRes.ok) {
        careersData = await careersRes.json();
      }
      if (kzisRes.ok) {
        kzisData = await kzisRes.json();
      }

      // Initialize Fuse.js for rich careers
      if (careersData.length && typeof Fuse !== 'undefined') {
        fuseMain = new Fuse(careersData, {
          keys: [
            { name: 'name', weight: 0.4 },
            { name: 'aliases', weight: 0.25 },
            { name: 'shortDescription', weight: 0.2 },
            { name: 'skills.required', weight: 0.15 },
          ],
          threshold: 0.35,
          includeScore: true,
          minMatchCharLength: 2,
        });
      }

      // Initialize Fuse.js for KZiS index
      if (kzisData.length && typeof Fuse !== 'undefined') {
        fuseKzis = new Fuse(kzisData, {
          keys: [
            { name: 'name', weight: 0.7 },
            { name: 'group', weight: 0.3 },
          ],
          threshold: 0.3,
          includeScore: true,
          minMatchCharLength: 2,
        });
      }

      isLoaded = true;
    } catch (err) {
      console.error('Failed to load career data:', err);
    }
  }

  // Search across both datasets
  function search(query, limit = 30) {
    const results = { rich: [], simple: [] };
    if (!query || query.length < 2) return results;

    // Search rich profiles
    if (fuseMain) {
      results.rich = fuseMain.search(query, { limit })
        .map(r => ({ ...r.item, _score: r.score }));
    }

    // Search KZiS index (exclude those already in rich results)
    if (fuseKzis) {
      const richIds = new Set(results.rich.map(r => r.code));
      results.simple = fuseKzis.search(query, { limit: limit * 2 })
        .filter(r => !richIds.has(r.item.code))
        .slice(0, limit)
        .map(r => ({ ...r.item, _score: r.score }));
    }

    return results;
  }

  // Search by category
  function searchByCategory(cat) {
    const rich = careersData.filter(c => c.category === cat);
    const richCodes = new Set(rich.map(r => r.code));
    const simple = kzisData.filter(k => k.category === cat && !richCodes.has(k.code));
    return { rich, simple };
  }

  // Autocomplete (returns top N matches for live dropdown)
  function autocomplete(query, limit = 8) {
    if (!query || query.length < 2) return [];

    const results = [];

    // First, rich profiles (prioritized)
    if (fuseMain) {
      const mainResults = fuseMain.search(query, { limit });
      for (const r of mainResults) {
        results.push({
          id: r.item.id,
          name: r.item.name,
          code: r.item.code,
          type: 'rich',
          score: r.score,
        });
      }
    }

    // Then, KZiS index
    if (fuseKzis && results.length < limit) {
      const richCodes = new Set(results.map(r => r.code));
      const kzisResults = fuseKzis.search(query, { limit: limit * 2 });
      for (const r of kzisResults) {
        if (richCodes.has(r.item.code)) continue;
        if (results.length >= limit) break;
        results.push({
          id: r.item.id || r.item.code,
          name: r.item.name,
          code: r.item.code,
          type: 'simple',
          score: r.score,
        });
      }
    }

    return results;
  }

  // Get career by ID (rich profile)
  function getCareerById(id) {
    return careersData.find(c => c.id === id) || null;
  }

  // Get KZiS entry by code
  function getKzisByCode(code) {
    return kzisData.find(k => k.code === code) || null;
  }

  // Filter careers by multiple criteria
  function filterCareers({ categories, salaryMin, salaryMax, demands, schools }) {
    let filtered = careersData;

    // Category filter
    if (categories && categories.length > 0) {
      filtered = filtered.filter(c => categories.includes(c.category));
    }

    // Salary filter
    if (salaryMin != null || salaryMax != null) {
      filtered = filtered.filter(c => {
        if (!c.salary) return false;
        const min = salaryMin || 0;
        const max = salaryMax || Infinity;
        return c.salary.max >= min && c.salary.min <= max;
      });
    }

    // Demand filter
    if (demands && demands.length > 0 && demands.length < 3) {
      filtered = filtered.filter(c => demands.includes(c.demand));
    }

    // School filter
    if (schools && schools.length > 0) {
      filtered = filtered.filter(c => {
        if (!c.education || !c.education.schools) return false;
        return c.education.schools.some(s => schools.includes(s.name));
      });
    }

    return { rich: filtered, simple: [] };
  }

  // Get all unique schools
  function getAllSchools() {
    const set = new Set();
    for (const c of careersData) {
      if (c.education && c.education.schools) {
        for (const s of c.education.schools) set.add(s.name);
      }
    }
    return [...set].sort((a, b) => a.localeCompare(b, 'pl'));
  }

  return {
    loadData,
    search,
    searchByCategory,
    filterCareers,
    getAllSchools,
    autocomplete,
    getCareerById,
    getKzisByCode,
    get isReady() { return isLoaded; },
    get careers() { return careersData; },
  };
})();
