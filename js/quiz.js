/* ============================================
   NextMove — Quiz zainteresowań (/quiz)
   Podpowiada zawody na podstawie zainteresowań, ulubionych przedmiotów i preferencji.
   Dane: careers.json, pole quiz {interests, contact, physical, places, path, subjects}.
   ============================================ */

const Quiz = (function () {
  'use strict';

  const INTERESTS = [
    ['ludzie', 'Rozmowy i pomaganie ludziom'], ['dzieci', 'Praca z dziećmi i młodzieżą'], ['zwierzeta', 'Zwierzęta'],
    ['przyroda', 'Przyroda, rośliny, środowisko'], ['zdrowie', 'Zdrowie i ciało człowieka'], ['komputery', 'Komputery i programowanie'],
    ['technika', 'Maszyny, elektronika, urządzenia'], ['budowanie', 'Budowanie i praca rękami'], ['liczby', 'Liczby, analizy, finanse'],
    ['jezyki', 'Języki obce'], ['pisanie', 'Pisanie, czytanie, media'], ['sztuka', 'Rysowanie, projektowanie, tworzenie'],
    ['scena', 'Muzyka, teatr, film'], ['sport', 'Sport i ruch'], ['prawo', 'Prawo i zasady'],
    ['bezpieczenstwo', 'Bezpieczeństwo, ratowanie, mundur'], ['biznes', 'Biznes, sprzedaż, organizowanie'], ['jedzenie', 'Gotowanie i jedzenie'],
    ['wyglad', 'Uroda, moda, wygląd'], ['podroze', 'Podróże i turystyka'], ['nauka', 'Nauka, badania, eksperymenty'],
  ];
  const SUBJECTS = [
    ['pol', 'Język polski'], ['mat', 'Matematyka'], ['ang', 'Język angielski'], ['bio', 'Biologia'], ['chem', 'Chemia'],
    ['fiz', 'Fizyka'], ['inf', 'Informatyka'], ['geo', 'Geografia'], ['hist', 'Historia'], ['wos', 'WOS'],
    ['plastyka', 'Plastyka'], ['muzyka', 'Muzyka'], ['wf', 'Wychowanie fizyczne'], ['technika', 'Technika'],
  ];
  const CONTACT = [['duzy', 'Lubię być wśród ludzi'], ['sredni', 'Czasem tak, czasem wolę sam'], ['maly', 'Wolę pracować sam']];
  const PHYSICAL = [['duzy', 'Lubię ruch i pracę fizyczną'], ['sredni', 'Trochę ruchu, trochę siedzenia'], ['maly', 'Wolę spokojną pracę przy biurku']];
  const PLACES = [['biuro', 'Biuro'], ['teren', 'W terenie, na zewnątrz'], ['szpital', 'Szpital, przychodnia'], ['warsztat', 'Warsztat, pracownia'],
    ['szkola', 'Szkoła, przedszkole'], ['scena', 'Scena, studio'], ['sklep', 'Sklep, salon, lokal'], ['dom', 'Z domu']];
  const PATH = [['krotka', 'Chcę szybko zacząć pracować (technikum, szkoła branżowa, kurs)'], ['studia', 'Matura i studia, ale bez przesady'], ['dlugie', 'Długie studia mi nie straszne'], ['', 'Nie wiem']];
  const PATH_LABEL = { krotka: 'krótka droga: technikum, szkoła branżowa albo kurs', studia: 'matura i studia', dlugie: 'długa nauka: jednolite studia albo specjalizacja' };
  const LEVELS = ['maly', 'sredni', 'duzy'];
  const MAX_INTERESTS = 5;

  let ctx = null;
  function init(context) { ctx = context; }
  const esc = s => ctx.escapeHtml(String(s ?? ''));
  const label = (list, id) => (list.find(([k]) => k === id) || [id, id])[1];

  function plZawod(n) {
    const m10 = n % 10, m100 = n % 100;
    if (n === 1) return 'zawód';
    return m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20) ? 'zawody' : 'zawodów';
  }
  function loadSaved() { try { return JSON.parse(sessionStorage.getItem('kr-quiz') || '{}'); } catch (e) { return {}; } }
  function save(a) { try { sessionStorage.setItem('kr-quiz', JSON.stringify(a)); } catch (e) { /* ignoruj */ } }

  function readAnswers(form) {
    const fd = new FormData(form);
    return {
      interests: fd.getAll('interests'),
      subjects: fd.getAll('subjects'),
      contact: fd.get('contact') || '',
      physical: fd.get('physical') || '',
      places: fd.getAll('places'),
      path: fd.get('path') || '',
    };
  }

  // Wynik dopasowania i powody; null, gdy zawód nie ma wspólnego zainteresowania ani przedmiotu
  function scoreCareer(c, a) {
    const q = c.quiz;
    if (!q) return null;
    const reasons = [];
    let score = 0;
    const sharedInterests = q.interests.filter(i => a.interests.includes(i));
    sharedInterests.forEach(i => { score += q.interests.indexOf(i) === 0 ? 4 : 3; });
    if (sharedInterests.length) reasons.push('lubisz: ' + sharedInterests.map(i => label(INTERESTS, i).toLowerCase()).join(', '));
    const sharedSubjects = (q.subjects || []).filter(s => a.subjects.includes(s));
    score += sharedSubjects.length * 1.5;
    if (sharedSubjects.length) reasons.push('przydadzą się: ' + sharedSubjects.map(s => label(SUBJECTS, s).toLowerCase()).join(', '));
    if (!sharedInterests.length && !sharedSubjects.length) return null;
    const LEVEL_TEXT = {
      contact: { maly: 'mało kontaktu z ludźmi, tak jak wolisz', sredni: 'trochę kontaktu z ludźmi, tak jak wolisz', duzy: 'dużo kontaktu z ludźmi, tak jak lubisz' },
      physical: { maly: 'spokojna praca, tak jak wolisz', sredni: 'umiarkowany ruch, tak jak wolisz', duzy: 'dużo ruchu, tak jak lubisz' },
    };
    for (const key of ['contact', 'physical']) {
      if (!a[key] || !q[key]) continue;
      const diff = Math.abs(LEVELS.indexOf(a[key]) - LEVELS.indexOf(q[key]));
      if (diff === 0) { score += 2; reasons.push(LEVEL_TEXT[key][a[key]] || ''); }
      if (diff === 2) score -= 3;
    }
    const sharedPlaces = (q.places || []).filter(p => a.places.includes(p));
    score += sharedPlaces.length;
    if (sharedPlaces.length) reasons.push('miejsce pracy: ' + sharedPlaces.map(p => label(PLACES, p).toLowerCase()).join(', '));
    if (a.path && q.path) {
      const order = ['krotka', 'studia', 'dlugie'];
      const gap = order.indexOf(q.path) - order.indexOf(a.path);
      if (gap > 0) score -= gap * 2.5;
      if (gap === 0) score += 1;
    }
    return { c, score, reasons };
  }

  function resultsHtml(a) {
    const careers = (typeof CareerSearch !== 'undefined' && CareerSearch.careers) || [];
    if (!careers.some(c => c.quiz)) return '<p class="career-column__empty">Quiz nie jest jeszcze gotowy.</p>';
    if (!a.interests.length && !a.subjects.length) {
      return '<p class="career-column__text szkola__muted">Zaznacz co najmniej jedno zainteresowanie albo ulubiony przedmiot, a podpowiem zawody.</p>';
    }
    const scored = careers.map(c => scoreCareer(c, a)).filter(Boolean).sort((x, y) => y.score - x.score);
    if (!scored.length) return '<p class="career-column__text">Nie znalazłem pasujących zawodów. Spróbuj zaznaczyć więcej zainteresowań.</p>';
    const top = scored.slice(0, 6);
    const more = scored.slice(6, 12);
    return `
      <h2 class="career-column__title">Zawody do sprawdzenia</h2>
      <ol class="quiz__results">
        ${top.map(r => `
          <li class="quiz__result">
            <a class="result-card" href="${ctx.BASE}/zawod/${ctx.escapeAttr(r.c.id)}">
              <div class="result-card__name">${esc(r.c.name)}</div>
              <div class="result-card__desc">${esc(r.c.shortDescription || '')}</div>
              <div class="quiz__why">Pasuje, bo ${esc(r.reasons.filter(Boolean).join('; '))}.</div>
              ${r.c.quiz.path ? `<div class="szkola__muted quiz__path">Droga do zawodu: ${esc(PATH_LABEL[r.c.quiz.path])}</div>` : ''}
            </a>
          </li>`).join('')}
      </ol>
      ${more.length ? `<p class="career-column__text">Też warto zajrzeć: ${more.map(r => `<a href="${ctx.BASE}/zawod/${ctx.escapeAttr(r.c.id)}">${esc(r.c.name)}</a>`).join(', ')}.</p>` : ''}`;
  }

  function chips(name, list, saved, type) {
    return `<div class="szkoly__chips">${list.map(([v, l]) => `
      <label class="szkoly__chip"><input type="${type}" name="${name}" value="${v}"${(Array.isArray(saved) ? saved.includes(v) : saved === v) ? ' checked' : ''}> ${esc(l)}</label>`).join('')}</div>`;
  }

  function render(container) {
    const saved = Object.assign({ interests: [], subjects: [], places: [] }, loadSaved());
    ctx.updateMeta('Quiz zainteresowań | NextMove', 'Odpowiedz na kilka pytań o to, co lubisz, i zobacz zawody, które warto sprawdzić.', ctx.BASE + '/quiz/');
    container.innerHTML = `
      <div class="results szkoly quiz">
        <a href="${ctx.BASE}/" class="results__back">&larr; Strona główna</a>
        <h1 class="results__title">Jaki zawód do mnie pasuje?</h1>
        <p class="results__query">Zaznacz, co lubisz: co najmniej jedno zainteresowanie albo ulubiony przedmiot. Wyniki pojawią się poniżej od razu, bez zakładania konta. Quiz podpowiada zawody do sprawdzenia i nie zastępuje rozmowy z doradcą zawodowym.</p>
        <form class="kalk__form" id="quizForm">
          <fieldset class="szkoly__fieldset">
            <legend class="szkoly__legend">1. Co Cię ciekawi? Wybierz do ${MAX_INTERESTS}.</legend>
            ${chips('interests', INTERESTS, saved.interests, 'checkbox')}
            <p class="kalk__err" id="quizMax" role="alert" hidden>Wybrano już ${MAX_INTERESTS}. Odznacz coś, żeby dodać inne.</p>
          </fieldset>
          <fieldset class="szkoly__fieldset">
            <legend class="szkoly__legend">2. Które przedmioty w szkole lubisz?</legend>
            ${chips('subjects', SUBJECTS, saved.subjects, 'checkbox')}
          </fieldset>
          <fieldset class="szkoly__fieldset">
            <legend class="szkoly__legend">3. Praca z ludźmi</legend>
            ${chips('contact', CONTACT, saved.contact, 'radio')}
          </fieldset>
          <fieldset class="szkoly__fieldset">
            <legend class="szkoly__legend">4. Ruch czy biurko?</legend>
            ${chips('physical', PHYSICAL, saved.physical, 'radio')}
          </fieldset>
          <fieldset class="szkoly__fieldset">
            <legend class="szkoly__legend">5. Gdzie chcesz pracować? Możesz wybrać kilka.</legend>
            ${chips('places', PLACES, saved.places, 'checkbox')}
          </fieldset>
          <fieldset class="szkoly__fieldset">
            <legend class="szkoly__legend">6. Jak długo chcesz się uczyć po podstawówce?</legend>
            ${chips('path', PATH, saved.path || '', 'radio')}
          </fieldset>
          <p><button type="button" class="szkoly__clear quiz__reset" id="quizReset">Zacznij od nowa</button></p>
        </form>
        <div id="quizResults"></div>
        <p class="sr-only" id="quizLive" aria-live="polite"></p>
        <button type="button" class="quiz__jump" id="quizJump" hidden></button>
      </div>`;
    const form = container.querySelector('#quizForm');
    const out = container.querySelector('#quizResults');
    const maxMsg = container.querySelector('#quizMax');
    const live = container.querySelector('#quizLive');
    const jump = container.querySelector('#quizJump');
    let resultsVisible = false;
    // Na telefonie wyniki są daleko pod pytaniami: przyklejony przycisk przewija do nich
    const syncJump = () => {
      const n = out.querySelectorAll('.quiz__result').length;
      jump.hidden = !n || resultsVisible;
      if (n) jump.textContent = `Pasuje ${n} ${plZawod(n)} · Zobacz`;
    };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => { resultsVisible = e.isIntersecting; syncJump(); }).observe(out);
    }
    jump.addEventListener('click', () => {
      out.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
      const h = out.querySelector('h2');
      if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    });
    const update = e => {
      // Limit zainteresowań: przy przekroczeniu cofamy ostatnie zaznaczenie
      if (e && e.target && e.target.name === 'interests' && e.target.checked && form.querySelectorAll('input[name="interests"]:checked').length > MAX_INTERESTS) {
        e.target.checked = false;
        maxMsg.hidden = false;
      } else if (e && e.target && e.target.name === 'interests') {
        maxMsg.hidden = true;
      }
      const a = readAnswers(form);
      save(a);
      out.innerHTML = resultsHtml(a);
      const names = [...out.querySelectorAll('.quiz__result .result-card__name')].map(x => x.textContent);
      // Czytnik ekranu słyszy krótkie podsumowanie, a nie całą listę po każdym kliknięciu
      if (e) live.textContent = names.length ? `Pasuje ${names.length} ${plZawod(names.length)}, najwyżej: ${names[0]}.` : '';
      syncJump();
    };
    form.addEventListener('change', update);
    container.querySelector('#quizReset').addEventListener('click', () => {
      try { sessionStorage.removeItem('kr-quiz'); } catch (e) { /* ignoruj */ }
      render(container);
    });
    update();
    const h = container.querySelector('h1');
    if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
  }

  return { init, render, scoreCareer };
})();

window.Quiz = Quiz;
