/* ============================================
   NextMove — „Czego brakuje?”: okienko do zgłaszania brakujących miast, zawodów, szkół i błędów.
   Zgłoszenia idą do Formularza Google (konfiguracja w data/feedback.json). Dopóki formularz nie jest podłączony
   (enabled: false), przyciski są ukryte, żeby nie było przycisku, który nic nie robi.
   ============================================ */

const Feedback = (function () {
  'use strict';

  let ctx = null;
  let cfg = { enabled: false };
  let modal = null;
  let opener = null;

  const TYPES = [
    ['miasto', 'Miasto lub kraj do studiów za granicą'],
    ['kierunek-zagranica', 'Kierunek lub uczelnia za granicą'],
    ['zawod', 'Zawód'],
    ['szkola', 'Szkoła średnia'],
    ['uczelnia', 'Uczelnia lub kierunek w Polsce'],
    ['blad', 'Błąd albo nieaktualne dane'],
    ['inne', 'Coś innego'],
  ];
  const MIN_GAP_MS = 30000;
  const MAX_LEN = 1000;

  const esc = s => ctx.escapeHtml(String(s ?? ''));
  const attr = s => ctx.escapeAttr(String(s ?? ''));

  async function init(context) {
    ctx = context;
    document.addEventListener('click', e => {
      const t = e.target.closest('[data-feedback]');
      if (t) { e.preventDefault(); open(t.dataset.feedback, t.dataset.feedbackContext || '', t); }
    });
    try {
      const r = await fetch('data/feedback.json');
      if (r.ok) cfg = await r.json();
    } catch (e) { /* bez konfiguracji przyciski zostają ukryte */ }
    const ok = !!(cfg && cfg.enabled && /^https:\/\/docs\.google\.com\/forms\//.test(cfg.formResponseUrl || ''));
    cfg.enabled = ok;
    document.body.classList.toggle('feedback-on', ok);
  }

  function enabled() { return !!cfg.enabled; }

  // Przycisk do wstawiania w treści widoków (pusty, gdy formularz nie jest podłączony, ale CSS i tak go ukrywa)
  function button(type, label, context) {
    return `<button type="button" class="feedback-trigger" data-feedback="${attr(type || 'inne')}"${context ? ` data-feedback-context="${attr(context)}"` : ''}>${esc(label)}</button>`;
  }

  function build() {
    const el = document.createElement('div');
    el.className = 'feedback-overlay';
    el.hidden = true;
    el.innerHTML = `
      <div class="feedback-dialog" role="dialog" aria-modal="true" aria-labelledby="fbTitle" tabindex="-1">
        <button type="button" class="feedback-close" aria-label="Zamknij okienko">&times;</button>
        <h2 id="fbTitle" class="feedback-title">Czego brakuje na stronie?</h2>
        <form id="fbForm" novalidate>
          <p class="feedback-lead">Napisz, czego szukasz i nie możesz znaleźć. Zbieramy takie zgłoszenia, żeby uzupełniać stronę.</p>
          <label class="feedback-field"><span>Czego dotyczy?</span>
            <select name="typ">${TYPES.map(([v, l]) => `<option value="${v}">${esc(l)}</option>`).join('')}</select></label>
          <label class="feedback-field"><span>Co mamy dodać albo poprawić?</span>
            <textarea name="opis" rows="4" maxlength="${MAX_LEN}" required placeholder="np. studia w Oslo, zawód: weterynarz koni, Liceum nr 5 w Gdyni"></textarea>
            <small class="feedback-err" id="fbErr" hidden></small></label>
          <div class="feedback-field feedback-hp" aria-hidden="true"><label>Nie wypełniaj tego pola<input type="text" name="www" tabindex="-1" autocomplete="off"></label></div>
          <label class="feedback-field"><span>Twój e-mail (nieobowiązkowy)</span>
            <input type="email" name="email" autocomplete="email" placeholder="np. imie@poczta.pl"></label>
          <label class="feedback-consent" id="fbConsentRow" hidden><input type="checkbox" name="zgoda">
            <span>Zgadzam się, żeby autorka strony użyła mojego adresu e-mail tylko po to, by napisać mi, że dane zostały dodane. Po wysłaniu tej wiadomości adres zostanie usunięty.</span></label>
          <p class="feedback-small">Nie wpisuj w treści imienia, nazwiska ani innych danych osobowych. E-mail jest dobrowolny: jeśli go zostawisz, dostaniesz wiadomość, gdy dodamy to, o co prosisz. Osoby poniżej 16 lat niech zostawią to pole puste albo poproszą o wpisanie e-maila rodzica lub opiekuna.</p>
          <p class="feedback-status" id="fbStatus" role="status" aria-live="polite"></p>
          <div class="feedback-actions"><button type="submit" class="feedback-send">Wyślij zgłoszenie</button>
            <button type="button" class="feedback-cancel">Anuluj</button></div>
        </form>
      </div>`;
    document.body.appendChild(el);
    el.addEventListener('click', e => { if (e.target === el || e.target.closest('.feedback-close, .feedback-cancel')) close(); });
    el.addEventListener('keydown', e => {
      if (e.key === 'Escape') { e.stopPropagation(); close(); }
      if (e.key === 'Tab') trap(e, el);
    });
    const form = el.querySelector('#fbForm');
    const email = form.elements.email;
    email.addEventListener('input', () => { el.querySelector('#fbConsentRow').hidden = !email.value.trim(); });
    form.addEventListener('submit', e => { e.preventDefault(); submit(form); });
    return el;
  }

  function trap(e, root) {
    const items = [...root.querySelectorAll('button, input, select, textarea')].filter(x => !x.disabled && x.offsetParent !== null && x.tabIndex !== -1);
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function open(type, context, from) {
    if (!cfg.enabled) return;
    opener = from || document.activeElement;
    if (!modal) modal = build();
    const form = modal.querySelector('#fbForm');
    form.reset();
    form.hidden = false;
    form.querySelector('.feedback-send').disabled = false;
    modal.querySelector('#fbConsentRow').hidden = true;
    modal.querySelector('#fbErr').hidden = true;
    modal.querySelector('#fbStatus').textContent = '';
    if (TYPES.some(([v]) => v === type)) form.elements.typ.value = type;
    modal.dataset.context = context || '';
    modal.hidden = false;
    document.body.classList.add('feedback-open');
    modal.querySelector('.feedback-dialog').focus();
    form.elements.opis.focus();
  }

  function close() {
    if (!modal) return;
    modal.hidden = true;
    document.body.classList.remove('feedback-open');
    if (opener && opener.isConnected) opener.focus();
    opener = null;
  }

  function fail(msg) {
    const err = modal.querySelector('#fbErr');
    err.textContent = msg; err.hidden = false;
  }

  async function submit(form) {
    const status = modal.querySelector('#fbStatus');
    modal.querySelector('#fbErr').hidden = true;
    if (form.elements.www.value) { close(); return; } // pole-pułapka dla botów
    const opis = form.elements.opis.value.trim();
    const email = form.elements.email.value.trim();
    if (opis.length < 3) { fail('Napisz kilka słów, czego brakuje.'); form.elements.opis.focus(); return; }
    if (email && !form.elements.email.checkValidity()) { status.textContent = 'Ten adres e-mail wygląda na niepoprawny. Popraw go albo zostaw pole puste.'; form.elements.email.focus(); return; }
    if (email && !form.elements.zgoda.checked) { status.textContent = 'Żeby zostawić e-mail, zaznacz zgodę poniżej pola. Albo zostaw pole puste.'; return; }
    let last = 0;
    try { last = +localStorage.getItem('kr-feedback-last') || 0; } catch (e) { /* ignoruj */ }
    if (Date.now() - last < MIN_GAP_MS) { status.textContent = 'Poczekaj chwilę przed wysłaniem kolejnego zgłoszenia.'; return; }

    const fd = new FormData();
    const en = cfg.entries || {};
    const put = (k, v) => { if (en[k] && v) fd.append(en[k], v); };
    // Formularz Google ma trzy pola, więc typ zgłoszenia dopisujemy na początku opisu, a stronę i kontekst do uwag
    const typLabel = TYPES.find(([v]) => v === form.elements.typ.value)?.[1] || form.elements.typ.value;
    put('opis', `[${typLabel}] ${opis.slice(0, MAX_LEN)}`);
    put('email', email);
    put('uwagi', `Strona: ${location.pathname}${location.search}${modal.dataset.context ? ` | Kontekst: ${modal.dataset.context}` : ''}`);
    const send = form.querySelector('.feedback-send');
    send.disabled = true;
    status.textContent = 'Wysyłam…';
    try {
      // Formularz Google nie zwraca odpowiedzi czytelnej dla przeglądarki (no-cors), więc sukcesem jest brak błędu sieci
      await fetch(cfg.formResponseUrl, { method: 'POST', mode: 'no-cors', body: fd });
      try { localStorage.setItem('kr-feedback-last', String(Date.now())); } catch (e) { /* ignoruj */ }
      form.hidden = true;
      status.innerHTML = '';
      const done = document.createElement('div');
      done.className = 'feedback-done';
      done.innerHTML = `<p><strong>Dziękujemy!</strong> Zgłoszenie dotarło.${email ? ' Napiszemy do Ciebie, gdy dodamy to, o co prosisz.' : ''}</p><button type="button" class="feedback-cancel feedback-send">Zamknij</button>`;
      const old = modal.querySelector('.feedback-done'); if (old) old.remove();
      modal.querySelector('.feedback-dialog').appendChild(done);
      done.querySelector('button').addEventListener('click', () => { done.remove(); close(); });
      done.querySelector('button').focus();
    } catch (e) {
      send.disabled = false;
      status.textContent = 'Nie udało się wysłać zgłoszenia. Sprawdź połączenie i spróbuj ponownie.';
    }
  }

  return { init, enabled, button, open, close };
})();
