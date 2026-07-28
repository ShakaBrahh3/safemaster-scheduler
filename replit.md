# SafeMaster Scheduler

A React + Vite frontend app for managing safety inspection crews and scheduling jobs across a weekly calendar.

## Stack
- React 18 + Vite 7
- Tailwind CSS
- Leaflet / React Leaflet (map support)
- Lucide React (icons)
- No backend — all state is managed client-side with `usePersistedState`

## Running the app
```
npm run dev
```
Serves on port 5000. The "Start application" workflow runs this automatically.

## Key features
- **Jobs Backlog** — drag unscheduled jobs into the weekly calendar grid
- **Crews & Tickets** — add/edit/delete inspectors, manage safety certifications (WAH, EWP, ROPE, CSE)
- **AI Auto-Route** — local route optimisation that matches jobs to qualified crews and balances workload
- **Night-Before SMS** — notification workflow for upcoming jobs
- **Excel Importer** — bulk job import via spreadsheet

## Project structure
- `src/App.jsx` — root component, main state
- `src/components/` — ScheduleGrid, CrewComponents, JobModals, RouteOptimizationModal, MapPreview
- `src/hooks/usePersistedState.js` — localStorage persistence hook

## User preferences
<!-- Add user preferences here as they are confirmed -->
