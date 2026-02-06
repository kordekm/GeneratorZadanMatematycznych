# Generator Kart Pracy z Matematyki - Działania w Słupkach

Aplikacja klient-serwer do generowania spersonalizowanych kart pracy z zadaniami z dodawania, odejmowania, mnożenia i dzielenia pisemnego (w słupkach) dla dzieci.

## 🏗️ Architektura

Projekt składa się z dwóch niezależnych serwisów:

- **Backend** (`backend/`) - Node.js + Express, generowanie zadań, automatyczne drukowanie
- **Frontend** (`frontend/`) - React + Vite, interfejs konfiguracyjny i podgląd

### Backend
- API REST do generowania zadań
- Zapis/odczyt konfiguracji z pliku JSON
- Automatyczne drukowanie przy pierwszym uruchomieniu każdego dnia
- Generowanie PDF (wkhtmltopdf lub chromium)
- Drukowanie przez `lp` (Linux)

### Frontend
- Interfejs konfiguracyjny
- Podgląd zadań na żywo
- Eksport/import konfiguracji do/z pliku JSON
- Zapis konfiguracji na serwerze

## 🎯 Funkcje

### Rodzaje działań

Każdy typ działania można włączyć/wyłączyć niezależnie:

- **➕ Dodawanie w słupku** - zakres wartości, liczba składników (2-8)
- **➖ Odejmowanie w słupku** - zakres wartości, opcja wyników ujemnych
- **✖️ Mnożenie w słupku** - liczba cyfr czynników
- **➗ Dzielenie w słupku** - liczba cyfr dzielnej/dzielnika, opcja reszty

### Tryby przeniesień/pożyczania

- **Bez przeniesień/pożyczania** - tylko proste działania
- **Musi być przeniesienie/pożyczanie** - wymusza trudniejsze zadania
- **Dowolne** - losowy mix

### Personalizacja wyglądu

- Rozmiar czcionki (18-72px)
- Kratka zeszytowa (wyłączona/jasna/średnia)
- Liczba kolumn (1-4)
- Numerowanie zadań

## 📋 Wymagania

- Node.js (wersja 18 lub nowsza)
- npm
- Do automatycznego drukowania: `wkhtmltopdf` lub `chromium` + skonfigurowana drukarka (Linux)

## 🚀 Instalacja

```bash
cd GeneratorZadanMatematycznych

# Zainstaluj zależności backendu
cd backend && npm install && cd ..

# Zainstaluj zależności frontendu
cd frontend && npm install && cd ..
```

## 💻 Uruchomienie

### Tryb deweloperski

W dwóch osobnych terminalach:

```bash
# Terminal 1 - Backend (port 3001)
cd backend
npm run dev

# Terminal 2 - Frontend (port 5173)
cd frontend
npm run dev
```

Frontend automatycznie proxy'uje requesty `/api` do backendu.

### Build produkcyjny

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
```

## 📖 Jak używać

1. **Wybierz rodzaje działań**:
   - Włącz/wyłącz dodawanie, odejmowanie, mnożenie lub dzielenie przełącznikami
   - Dla każdego typu ustaw liczbę zadań
   - Skonfiguruj parametry specyficzne dla danego działania

2. **Skonfiguruj parametry**:
   - **Dodawanie**: zakres liczb (min/max), liczba składników (2-8)
   - **Odejmowanie**: zakres liczb (min/max), opcja wyników ujemnych
   - **Mnożenie**: liczba cyfr dla obu czynników (niezależnie od zakresu)
   - **Dzielenie**: liczba cyfr dzielnej (2-4) i dzielnika (1-2), opcja reszty

3. **Ustaw tryb przeniesień** (globalnie dla wszystkich działań):
   - Bez przeniesień/pożyczania
   - Musi być przeniesienie/pożyczanie
   - Dowolne

4. **Dostosuj wygląd**:
   - Rozmiar czcionki (18-72px)
   - Kratka zeszytowa (wyłączona/jasna/średnia)
   - Liczba kolumn (1-4)
   - Numerowanie zadań

5. **Podgląd na żywo**:
   - Podgląd aktualizuje się automatycznie po każdej zmianie
   - Widzisz dokładnie to, co zostanie wydrukowane

6. **Generowanie i drukowanie**:
   - Kliknij "🔄 Nowy zestaw" aby wygenerować inne zadania z tymi samymi ustawieniami
   - Kliknij "🖨️ Drukuj zadania" aby wydrukować lub zapisać jako PDF
   - Ustawienia są automatycznie zapisywane w przeglądarce

## 🔧 Technologie

- **React 18** - framework UI
- **TypeScript** - typowanie statyczne
- **Vite** - build tool i dev server
- **Tailwind CSS** - stylowanie
- **Web Workers** - generowanie zadań w tle
- **seedrandom** - deterministyczna losowość
- **localStorage** - zapisywanie konfiguracji

## 📐 Architektura i algorytmy

### Paginacja
Aplikacja automatycznie oblicza ile zadań mieści się na stronie:
- Rozmiar czcionki
- Maksymalna liczba składników w zadaniach
- Marginesy i nagłówek
- Liczba kolumn

**Większa czcionka = mniej zadań na stronę = więcej stron PDF**

### Generowanie zadań
- Wykorzystuje **Web Workers** do generowania w tle (nie blokuje UI)
- System seed zapewnia powtarzalność zestawów
- Inteligentne algorytmy naprawiające dla trybu przeniesień
- Timeout 5 sekund dla bezpieczeństwa
- Maksymalnie 1000 prób na zadanie

## 🎓 Logika przeniesień i pożyczania

Generator symuluje działania kolumnami od prawej do lewej:

- **Dodawanie**: wykrywa przeniesienia (gdy suma cyfr w kolumnie ≥ 10)
- **Odejmowanie**: wykrywa pożyczanie (gdy cyfra jest mniejsza od odejmowanej)
- **Mnożenie**: wykrywa przeniesienia w mnożeniu cyfr i sumowaniu wyników cząstkowych
- Inteligentne naprawianie liczb po 10 nieudanych próbach losowych
- Limit 1000 prób na zadanie
- Timeout 5 sekund dla całego zestawu
- Komunikaty błędów z sugestiami rozwiązania

## 📝 Przykładowe użycie

### Zadania dla początkujących - dodawanie bez przeniesień

- **Dodawanie**: włączone, 20 zadań, min: 10, max: 40, składniki: 2-3
- **Odejmowanie**: wyłączone
- **Mnożenie**: wyłączone
- **Tryb**: Bez przeniesień
- **Czcionka**: 48px

### Zadania z odejmowaniem - tylko wyniki dodatnie

- **Dodawanie**: wyłączone
- **Odejmowanie**: włączone, 15 zadań, min: 10, max: 99, bez wyników ujemnych
- **Mnożenie**: wyłączone
- **Tryb**: Dowolne
- **Czcionka**: 40px

### Zadania mieszane - średniozaawansowane

- **Dodawanie**: włączone, 10 zadań, min: 10, max: 500, składniki: 3-4
- **Odejmowanie**: włączone, 10 zadań, min: 10, max: 500, z wynikami ujemnymi
- **Mnożenie**: wyłączone
- **Tryb**: Musi być przeniesienie/pożyczanie
- **Czcionka**: 32px
- **Kolumny**: 2

### Zadania trudne - wszystkie typy

- **Dodawanie**: włączone, 8 zadań, min: 100, max: 9999, składniki: 4-6
- **Odejmowanie**: włączone, 6 zadań, min: 100, max: 9999, z wynikami ujemnymi
- **Mnożenie**: włączone, 6 zadań, czynnik 1: 3 cyfry, czynnik 2: 2 cyfry
- **Dzielenie**: włączone, 5 zadań, dzielna: 3 cyfry, dzielnik: 2 cyfry, z resztą
- **Tryb**: Dowolne
- **Czcionka**: 24px
- **Kolumny**: 3

### Zadania z dzieleniem - nauka dzielenia pisemnego

- **Dodawanie**: wyłączone
- **Odejmowanie**: wyłączone
- **Mnożenie**: wyłączone
- **Dzielenie**: włączone, 20 zadań, dzielna: 3 cyfry, dzielnik: 1 cyfra, z resztą
- **Czcionka**: 36px
- **Kolumny**: 2

## 🐛 Rozwiązywanie problemów

### Błąd "Nie można wygenerować zadania"

**Przyczyny i rozwiązania:**
- **Zbyt restrykcyjne parametry**: zmień tryb na "Dowolne" lub zwiększ zakres liczb
- **Odejmowanie bez wyników ujemnych**: zwiększ zakres liczb (max musi być wystarczająco duże)
- **Mnożenie z "bez przeniesień"**: bardzo trudne, spróbuj trybu "Dowolne"
- **Zbyt wiele składników**: zmniejsz liczbę składników w dodawaniu
- **Dzielenie bez reszty**: jeśli wyłączona opcja "Zezwól na resztę", może być trudno wygenerować zadania z niektórymi kombinacjami cyfr

### Brak zadań do wyświetlenia

- Upewnij się, że przynajmniej jedno działanie jest włączone (przełącznik)
- Sprawdź czy liczba zadań jest większa od 0

### Zadania się powtarzają

- **To jest funkcja, nie błąd!**
- Aplikacja używa systemu seed dla powtarzalności
- Kliknij "🔄 Nowy zestaw" aby wygenerować inne zadania
- Te same ustawienia zawsze dają te same zadania (deterministyczne)

### Konfiguracja się nie zapisuje

- Sprawdź czy przeglądarka ma włączone localStorage
- Konfiguracja zapisuje się automatycznie przy każdej zmianie
- Działa tylko w tej samej przeglądarce

## 📄 Licencja

Projekt stworzony dla nauczycieli i rodziców. Wolne użytkowanie.

## 🤝 Wsparcie

W razie problemów lub pytań, sprawdź kod źródłowy lub skontaktuj się z autorem.

---

**Wykonane z ❤️ dla edukacji**
