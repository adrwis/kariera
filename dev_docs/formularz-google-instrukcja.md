# Podłączenie okienka „Czego brakuje?” do Formularza Google

Okienko jest gotowe i ukryte (`data/feedback.json`, pole `enabled: false`). Po podłączeniu formularza przyciski „Daj znać” pojawią się w stopce, w pustych wynikach wyszukiwania i w zakładce Studia za granicą.

## 1. Zakładanie formularza (Ty, ok. 5 minut)

1. Wejdź na https://forms.google.com i utwórz pusty formularz o nazwie np. „NextMove: czego brakuje”.
2. Dodaj pięć pytań w tej kolejności i z tymi typami:
   1. **Czego dotyczy?** (krótka odpowiedź)
   2. **Co mamy dodać albo poprawić?** (akapit)
   3. **E-mail** (krótka odpowiedź, nieobowiązkowe)
   4. **Strona** (krótka odpowiedź, nieobowiązkowe)
   5. **Kontekst** (krótka odpowiedź, nieobowiązkowe)
   Żadne pytanie nie powinno być oznaczone jako wymagane i nie włączaj logowania ani zbierania adresów e-mail.
3. Zakładka „Odpowiedzi” → ikona arkusza, żeby odpowiedzi trafiały do arkusza Google (do wglądu i filtrowania).
4. Menu ⋮ → **Uzyskaj link do wstępnie wypełnionego formularza**. Wpisz w każdym polu przykładową wartość (np. `AAA`, `BBB`, `CCC`, `DDD`, `EEE`), kliknij „Uzyskaj link” i skopiuj go.

## 2. Co mi przesłać

Wklej mi skopiowany wstępnie wypełniony link. Z niego odczytam adres wysyłania i numery pól (`entry.123...`) i wpiszę je do `data/feedback.json`, ustawiając `enabled: true`. Niczego innego nie potrzebuję.

## 3. Prywatność

- Okienko mówi użytkownikowi, że e-mail jest dobrowolny, służy tylko do powiadomienia, że dane zostały dodane, i zostanie usunięty po wysłaniu wiadomości. Trzymaj się tej obietnicy: po wysłaniu informacji usuń wiersz lub adres z arkusza.
- Osoby poniżej 16 lat są proszone, by zostawiły pole puste albo podały e-mail rodzica.
- Jeśli kiedyś zechcesz zbierać więcej danych osobowych, potrzebna będzie pełna informacja o przetwarzaniu (administrator, podstawa, czas przechowywania).
