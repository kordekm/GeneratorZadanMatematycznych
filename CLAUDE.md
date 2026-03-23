# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Generator Kart Pracy z Matematyki — a web app for generating printable math worksheets (dodawanie, odejmowanie, mnożenie, dzielenie pisemne). Teachers configure task parameters; the app generates a deterministic set of tasks via a seeded RNG and renders them in a columnar, print-ready layout.

## Architecture

The project is split into two independent Node.js packages:

- **`backend/`** — Express API server (port 3001). Handles task generation, PDF rendering, and config persistence. Entry point: `src/server.ts`.
- **`frontend/`** — React + Vite SPA (proxies `/api` to backend). Entry point: `src/App.tsx`.

### Request Flow

1. User adjusts config in `ConfigPanel` → `App.tsx` state updates
2. `App.tsx` debounces 300ms, then calls `useApi.generate(config)`
3. `useApi` POSTs to `/api/generate` → `backend/src/utils/generator.ts`
4. Backend uses `seedrandom(config.seed)` + operation-specific generators in `backend/src/generators/` to produce `Task[]`
5. Tasks return to frontend → `Preview` renders them using `TaskRenderer`

### Key Architectural Points

**Types are duplicated**: `frontend/src/types.ts` and `backend/src/types.ts` define the same `Config`, `Task`, `ValidationError` etc. Keep them in sync when adding fields.

**Task rendering** (`frontend/src/components/TaskRenderer.tsx`): Uses a CSS grid where the first column holds the operator symbol and subsequent columns hold individual digits. All tasks in a page share the same `maxGridWidth` (widest task) so columns align. Partial rows (for multiplication) are right-offset; horizontal lines are absolutely positioned.

**Layout/pagination** (`frontend/src/utils/layout.ts`): Converts px→pt, computes A4 dimensions, calculates how many tasks fit per column/page based on `maxLinesInTasks` and `fontSize`.

**PDF generation** (`backend/src/services/pdfService.ts`): Renders tasks to HTML server-side, then uses Puppeteer (or similar) to generate a PDF. The backend also has `printService.ts` for CUPS-based printing (`lp` command) and a startup auto-print feature that uses a date-based seed.

**Config persistence**: Two mechanisms — `localStorage` on the frontend (`frontend/src/utils/localStorage.ts`) and `backend/data/config.json` on the server (via `POST /api/config`).

## Commands

### Running the full stack

```bash
./run.sh
```

Starts backend (compiled, port 3001) and frontend dev server concurrently.

### Backend

```bash
cd backend
npm install
npm run dev      # tsx watch — hot reload
npm run build    # tsc → dist/
npm start        # node dist/server.js
```

### Frontend

```bash
cd frontend
npm install
npm run dev      # Vite dev server
npm run build    # tsc + vite build
npm run lint     # ESLint (0 warnings allowed)
```

### Environment Variables (backend)

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3001` | HTTP port |
| `PRINTER_NAME` | `""` | CUPS printer name for auto-print |

## Adding a New Operation Type

1. Add config interface and fields to both `backend/src/types.ts` and `frontend/src/types.ts`
2. Create `backend/src/generators/<operation>.ts` following the pattern of `addition.ts`
3. Wire it into `backend/src/utils/generator.ts` in the `plannedTasks` loop
4. Add a config UI component in `frontend/src/components/config/`
5. Update `TaskRenderer.tsx` to handle the new `operations` symbol
6. Update `getTaskLineCount` and `getTaskGridWidth` in `frontend/src/utils/layout.ts`
