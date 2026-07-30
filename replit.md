# SafeMaster Scheduler

A React + Vite frontend app for managing safety inspection crews and scheduling jobs across a weekly calendar, backed by an Express + Postgres API.

## Stack
- React 18 + Vite 7
- Tailwind CSS
- Leaflet / React Leaflet (map support)
- Lucide React (icons)
- Backend: Express + `pg`, persisting to Postgres (`server/index.js`, `server/schema.sql`)

## Running the app
```
npm run dev:full
```
Runs Vite (port 5000) and the API server (port 3001) together via `concurrently`. The "Start application" Replit workflow runs this automatically; Replit's `postgresql-16` module provides `DATABASE_URL`.

For local (non-Replit) development, start a local Postgres first:
```
docker compose -f docker-compose.dev.yml up -d
cp .env.example .env
npm run dev:full
```

Running just the frontend (`npm run dev`) or just the API (`npm run server`) also works independently.

## Key features
- **Jobs Backlog** — drag unscheduled jobs into the weekly calendar grid
- **Crews & Tickets** — add/edit/delete inspectors, manage safety certifications (WAH, EWP, ROPE, CSE)
- **AI Auto-Route** — local route optimisation that matches jobs to qualified crews and balances workload
- **Night-Before SMS** — notification workflow for upcoming jobs
- **Excel Importer** — bulk job import via spreadsheet

## Project structure
- `src/App.jsx` — root component, main state
- `src/components/` — ScheduleGrid, CrewComponents, JobModals, RouteOptimizationModal, MapPreview
- `src/hooks/useSchedulerApi.js` — fetches/persists jobs, schedule, crews via the API (falls back to localStorage via `usePersistedState.js` if the API is unreachable)
- `server/index.js` — Express API (jobs/crews CRUD + bulk endpoints)
- `server/schema.sql` — Postgres schema, applied automatically on server startup

## User preferences
<!-- Add user preferences here as they are confirmed -->
