# SafeMaster Scheduler - Copilot Instructions

## Build, Test, and Lint Commands

### Development
- **Dev server**: `npm run dev` - Starts Vite dev server on port 5173
- **Production build**: `npm run build` - Outputs to `/dist` for Nginx serving
- **Preview build locally**: `npm run preview` - Tests the production build locally

**No test or lint tools are currently configured.**

### Docker
- **Build image**: `docker build -t safemaster-scheduler .`
- **Run with Docker Compose**: `docker-compose up` - Serves on http://localhost:8080

The Dockerfile uses a two-stage build: Node 20 Alpine builds the React app, then Nginx Alpine serves the static assets.

## High-Level Architecture

### Purpose
SafeMaster Scheduler is a job scheduling system for work crews with certification tracking. It manages job backlogs, crew assignments, and validates that crews have required safety certifications before assignments.

### Core Concepts

**Jobs**: Work assignments with properties:
- `id`, `site`, `cost`, `run` (Southwest Run, Programmed, etc.), `notes`, `tags`
- `ewpRequired`: Boolean flag for elevated work platform requirement
- `requiredTicket`: One of the four ticket types (WAH, EWP, ROPE, CSE)
- `priority`: "normal", "warning", "high"
- `status`: "backlog" or scheduled

**Tickets** (Certifications): Tracked at the crew level, required for job assignment
```javascript
WAH: Working at Heights (Basic)
EWP: Elevated Work Platform License (>11m)
ROPE: IRATA Rope Access Certificate
CSE: Confined Space Entry
```

**Crews**: Teams with:
- `id`, `name`, `size` (number of workers)
- `tickets`: Array of certification codes crew members hold
- `notes`

**Schedule**: Displayed as a grid with days (Mon-Sun) as columns and crews as rows. Jobs are assigned to day/crew cells.

### Data Flow
1. Jobs start in the **backlog** panel (left side)
2. Jobs are **drag-and-dropped** from backlog onto schedule grid cells (specific day + crew)
3. The scheduler **validates ticket requirements** when assigning jobs to crews
4. Backlog supports **search/filter** by run and priority
5. **CSV import** allows bulk job creation
6. Jobs can be **edited inline** via modal dialog

### Component Structure
- **Single-file monolithic architecture** (`src/App.jsx`)
- ~1800 lines; uses React hooks for state management
- Three sidebar tabs: "Backlog", "Crews", "Notifications"
- Drag-and-drop implementation using HTML5 API
- Modal dialogs for job creation/editing

## Key Conventions

### Data Constants
Define domain data at the top of App.jsx:
- `TICKETS`: Ticket type definitions with display name, color, code
- `INITIAL_BACKLOG`: Starting job list
- `INITIAL_SCHEDULE`: Initial weekly assignments
- `INITIAL_CREWS`: Initial crew roster

**Color scheme**: Uses dark Tailwind theme (`bg-{color}-900/60 text-{color}-300`) for ticket badges.

### State Management
All state uses `useState` hooks. Major state variables:
- `backlog`, `schedule`, `crews`: Primary data collections
- `draggedJobId`, `dragSource`: Drag-and-drop tracking
- `leftActiveTab`: Sidebar tab selection ("backlog" | "crews" | "notifications")
- Modal/UI states: `showImportModal`, `showCreateModal`, `selectedJob`

### Job Assignment Logic
- **Validation**: Before assigning, check that crew has required ticket via `crew.tickets.includes(job.requiredTicket)`
- **EWP jobs** require `ewpRequired: true` to be treated specially
- **Drag endpoints**: Jobs drag from backlog → schedule grid cells, or schedule → backlog

### Styling
- **Tailwind CSS**: All styling via utility classes
- **Custom scrollbar**: Defined in `index.css` with `.custom-scrollbar` class
- **Dark mode colors**: Theme uses slate/blue/cyan/purple/amber families at 900/60 opacity
- **Icons**: All from lucide-react

### CSV Import Format
Jobs imported via CSV should match job object structure. Parser validates required fields: `site`, `cost`, `requiredTicket`.

## New Features (Latest)

### Crew Management (Inspector Add/Edit/Delete)
The "Crews & Tickets" tab now includes full CRUD operations for managing inspectors/employees:
- **Add Inspector**: Button to create new crew members with full details (name, email, phone, base location, notes)
- **Edit Inspector**: Click edit icon on any crew card to modify their information and certifications
- **Delete Inspector**: Remove crew members (unassigns all their scheduled jobs)
- **Certification Toggle**: Manage safety tickets for each inspector inline

Each crew automatically gets a unique color for visual identification in the schedule grid.

### AI Route Optimization (Local Heuristic)
Located in the Crews tab, the "AI Auto-Route" button:
- Analyzes all unscheduled jobs in the backlog
- Sorts by priority (high → warning → normal) and cost
- Matches jobs to qualified crews based on required certifications
- Distributes workload evenly across crew/day combinations
- Generates optimized weekly assignments
- Shows a preview modal before applying

No external API calls—uses local rule-based optimization for instant results.

### Location Data & Map Foundation
All job objects now include:
- `lat`, `lng` - Coordinates for job sites
- Map libraries installed: Leaflet + react-leaflet@4
- Ready for satellite imagery display on job cards (future enhancement)
- Coordinates enable distance calculations for route efficiency

### Updated Dependencies
- Added: `leaflet@latest`, `react-leaflet@4.x` (for map visualization, compatibility with React 18)

## MCP Servers

### Web Browser (Recommended)
For interactive testing of the scheduler UI, configure the Web Browser MCP server:
1. Start the dev server: `npm run dev` (runs on http://localhost:5173)
2. The Web Browser MCP will let you interact with the running app for manual testing of:
   - Drag-and-drop job assignments
   - Job search and filtering
   - CSV imports
   - Crew ticket assignment
   - **NEW**: Adding/editing/deleting inspectors
   - **NEW**: AI route optimization preview

## Refactoring Opportunities

The monolithic 1800+ line App.jsx component can be improved by extracting:
- `<ScheduleGrid />` - Weekly grid display and drag-drop handlers
- `<BacklogPanel />` - Job search, filter, list
- `<CrewPanel />` - Crew listing and ticket management (now with Add/Edit/Delete modals)
- `<JobModal />` - Create/edit dialog
- `<ImportModal />` - CSV import dialog
- `<AIOptimizeModal />` - Route optimization preview
- `<CrewManagementModal />` - Add/edit inspector dialog
- Custom hooks: `useDragDrop()`, `useScheduleState()`, `useRouteOptimization()` for state logic

This would improve maintainability as the app grows.
