# Generator Kart Pracy - Działania w Słupkach

Aplikacja webowa do generowania spersonalizowanych kart pracy z zadaniami z dodawania i odejmowania pisemnego (w słupkach) dla dzieci.

## 🎯 Funkcje

- **Wybór rodzaju działań z proporcjami**

  - Dodawanie (%)
  - Odejmowanie (%)
  - Działania mieszane (%) - losowe mieszanie + i - w jednym zadaniu
  - Możliwość wyników ujemnych w odejmowaniu
- **Konfigurowalne parametry zadań**

  - Zakres liczb (min/max) - określa maksymalną liczbę cyfr
  - Liczba składników (2-8)
  - Liczba zadań (5-200)
- **Tryby przeniesień/pożyczania**

  - Bez przeniesień/pożyczania
  - Musi być przeniesienie/pożyczanie
  - Dowolne (losowe)
- **Personalizacja wyglądu**

  - Rozmiar czcionki (18-72px) - automatycznie wpływa na paginację
  - Kratka zeszytowa (wyłączona/jasna/średnia)
  - Liczba kolumn (1-4)
  - Numerowanie zadań
  - Dynamiczny nagłówek dostosowany do wybranych działań

## 📋 Wymagania

- Node.js (wersja 18 lub nowsza)
- npm lub yarn

## 🚀 Instalacja

```bash
# Sklonuj lub pobierz projekt
cd GeneratorZadanMatematycznych

# Zainstaluj zależności
npm install
```

## 💻 Uruchomienie

### Tryb deweloperski

```bash
npm run dev
```

Aplikacja będzie dostępna pod adresem: `http://localhost:5173`

### Build produkcyjny

```bash
npm run build
```

Zbudowane pliki znajdą się w katalogu `dist/`.

### Podgląd buildu produkcyjnego

```bash
npm run preview
```

## 📖 Jak używać

1. **Wybierz rodzaj działań**:

   - Ustaw proporcje dla dodawania, odejmowania i działań mieszanych (wartości w %)
   - Jeśli wybierzesz odejmowanie, możesz zaznaczyć opcję "Zezwól na wyniki ujemne"
2. **Skonfiguruj parametry zadań**:

   - Ustaw zakres liczb (określa maksymalną liczbę cyfr)
   - Wybierz liczbę składników (2-8)
   - Określ liczbę zadań do wygenerowania (5-200)
3. **Dostosuj wygląd**:

   - Zmień rozmiar czcionki (większa czcionka = mniej zadań na stronę)
   - Włącz/wyłącz kratkę zeszytową
   - Wybierz liczbę kolumn (1-4)
   - Włącz/wyłącz numerowanie zadań
4. **Podgląd na żywo**:

   - Podgląd aktualizuje się automatycznie
   - Widzisz dokładnie to, co zostanie wydrukowane
5. **Drukowanie/Zapisywanie**:

   - Kliknij "Drukuj zadania"
   - W oknie dialogowym drukowania możesz wydrukować lub zapisać jako PDF

## 🔧 Technologie

- **React 18** - framework UI
- **TypeScript** - typowanie
- **Vite** - build tool
- **Tailwind CSS** - stylowanie
- **seedrandom** - deterministyczna losowość

## 📐 Algorytm paginacji

Aplikacja automatycznie oblicza ile zadań mieści się na stronie na podstawie:

- Rozmiaru czcionki
- Liczby składników w zadaniach
- Marginesów i nagłówka
- Liczby kolumn

**Większa czcionka = mniej zadań na stronę = więcej stron PDF**

## 🎓 Logika przeniesień i pożyczania

Generator symuluje działania kolumnami od prawej do lewej:

- **Dodawanie**: wykrywa przeniesienia między kolumnami (gdy suma cyfr ≥ 10)
- **Odejmowanie**: wykrywa pożyczanie między kolumnami (gdy cyfra jest mniejsza od odejmowanej)
- **Działania mieszane**: obsługuje zarówno przeniesienia jak i pożyczanie
- Odrzuca losowania niespełniające wybranego trybu
- Ma limit 1000 prób - jeśli nie uda się wygenerować, wyświetla komunikat z sugestią zmiany parametrów

## 📝 Przykładowe użycie

### Zadania dla początkujących - dodawanie bez przeniesień

- Dodawanie: 100%, Odejmowanie: 0%, Mieszane: 0%
- Min: 10, Max: 40
- Składniki: 2-3
- Tryb: Bez przeniesień
- Czcionka: 48px

### Zadania z odejmowaniem - tylko wyniki dodatnie

- Dodawanie: 0%, Odejmowanie: 100%, Mieszane: 0%
- Wyniki ujemne: NIE
- Min: 10, Max: 99
- Składniki: 2
- Czcionka: 40px

### Zadania mieszane - średniozaawansowane

- Dodawanie: 50%, Odejmowanie: 30%, Mieszane: 20%
- Wyniki ujemne: TAK
- Min: 10, Max: 500
- Składniki: 3-4
- Tryb: Musi być przeniesienie/pożyczanie
- Czcionka: 32px

### Zadania trudne - wszystkie typy

- Dodawanie: 40%, Odejmowanie: 30%, Mieszane: 30%
- Wyniki ujemne: TAK
- Min: 100, Max: 9999
- Składniki: 4-6
- Tryb: Dowolne
- Czcionka: 24px

## 🐛 Rozwiązywanie problemów

### Błąd "Nie można wygenerować zadania"

- Zmniejsz liczbę składników
- Zwiększ zakres liczb
- Zmień tryb przeniesień/pożyczania na "Dowolne"
- Dla odejmowania bez wyników ujemnych: zwiększ zakres liczb lub zmniejsz liczbę składników

### Błąd "Musisz wybrać przynajmniej jedno działanie"

- Ustaw wartość większą niż 0 dla przynajmniej jednego typu działania (dodawanie, odejmowanie lub mieszane)

### Zadania się powtarzają

- Aplikacja używa systemu seed - te same ustawienia generują te same zadania
- To jest funkcja, nie błąd - pozwala na powtarzalność zestawów

## 📄 Licencja

Projekt stworzony dla nauczycieli i rodziców. Wolne użytkowanie.

## 🤝 Wsparcie

W razie problemów lub pytań, sprawdź kod źródłowy lub skontaktuj się z autorem.

---

**Wykonane z ❤️ dla edukacji**
