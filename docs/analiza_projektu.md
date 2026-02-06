# Analiza Projektu: Generator Kart Pracy z Matematyki

## 1. Przegląd
Projekt to aplikacja webowa służąca do generowania kart pracy z zadaniami matematycznymi (dodawanie i odejmowanie pisemne). Aplikacja jest zbudowana jako Single Page Application (SPA) przy użyciu nowoczesnego stosu technologicznego.

## 2. Stos Technologiczny
*   **Core**: [React 18](package.json), [TypeScript](tsconfig.json)
*   **Build Tool**: [Vite](vite.config.ts)
*   **Stylizacja**: [Tailwind CSS](tailwind.config.js)
*   **Kluczowe biblioteki**: 
    *   `seedrandom` - do deterministycznego generowania losowych zadań (ważne dla powtarzalności wyników przy tym samym "seedzie").

## 3. Architektura i Struktura Plików
Projekt podąża za standardową strukturą Vite:

*   `src/App.tsx`: Główny komponent zarządzający stanem aplikacji (konfiguracja, wygenerowane zadania, błędy).
*   `src/components/`: Komponenty interfejsu podzielone funkcjonalnie.
    *   `ConfigPanel.tsx`: Panel konfiguracyjny z formularzami.
    *   `Preview.tsx`: Podgląd wygenerowanych zadań.
    *   `TaskRenderer.tsx`: Odpowiedzialny za wyświetlanie pojedynczego zadania (prawdopodobnie "na kartce").
*   `src/utils/`: Logika biznesowa.
    *   `generator.ts`: Silnik generujący zadania matematyczne.
    *   `layout.ts`: Logika paginacji i układu do druku.
    *   `validation.ts`: Walidacja konfiguracji użytkownika.
*   `src/types.ts`: Plik z definicjami typów TypeScript, co zapewnia spójność danych.

## 4. Przepływ Danych (Data Flow)
1.  **Stan Globalny (App.tsx)**: Obiekt `config` przechowuje wszystkie ustawienia (zakres liczb, typy działań, seed itp.).
2.  **Interakcja**: Użytkownik zmienia ustawienia w `ConfigPanel`.
3.  **Walidacja**: Po zmianie konfiguracji uruchamiana jest `validateConfig`.
4.  **Generowanie**: Jeśli walidacja przejdzie pomyślnie, funkcja `generateTasks` (z opóźnieniem debounce 300ms) tworzy nowy zestaw zadań.
5.  **Renderowanie**: Tablica `tasks` jest przekazywana do `Preview`, ktory renderuje podgląd.

## 5. Kluczowe Obserwacje
*   **Determinizm**: Użycie `seed` w konfiguracji pozwala na odtworzenie identycznego zestawu zadań, co jest świetną funkcją dla nauczycieli.
*   **Separacja Odpowiedzialności**: Wyraźny podział na logikę generowania (`utils/generator.ts`) i warstwę prezentacji (`components/`).
*   **UX**: Zastosowano debouncing przy generowaniu oraz walidację formularza "na żywo", co poprawia wrażenia użytkownika.

## 6. Podsumowanie
Kod jest czysty, dobrze ustrukturyzowany i wykorzystuje TypeScript do zapewnienia bezpieczeństwa typów. Architektura jest odpowiednia dla skali projektu, a podział na moduły ułatwia dalszy rozwój i utrzymanie.
