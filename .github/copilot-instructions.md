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

The Dockerfile uses a two-stage build: Node 20 Alpine builds the React app, then Nginx Alpine serves the static assets. Nginx is configured with gzip compression and SPA routing (all requests fallback to `/index.html`).

## High-Level Architecture

### Purpose
SafeMaster Scheduler is a job scheduling system for work crews with safety certification tracking. It manages job backlogs, crew assignments, and validates that crews have required certifications before job assignments. The system automatically optimizes scheduling to balance workload across qualified crews and integrates location data for route planning.

### Core Concepts

**Jobs**: Work assignments with properties:
- `id`, `site`, `cost`, `run` (Southwest Run, Programmed, etc.), `notes`, `tags`
- `lat`, `lng`: GPS coordinates for job sites (Western Australia format)
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

**Crews**: Employees/inspectors with:
- `id`, `name`, `email`, `phone`, `baseLocation`, `notes`
- `color`: Unique Tailwind color scheme for visual identification
- `tickets`: Array of certification codes crew members hold
- Auto-assigned from 6-color palette (emerald, sky, violet, amber, rose, cyan)

**Schedule**: Displayed as a grid with days (Mon-Sun) as columns and crews as rows. Jobs are assigned to day/crew cells.

### Data Flow & User Workflows
1. **Manual Scheduling**: Drag jobs from backlog → schedule grid cells (specific day + crew)
2. **AI Optimization**: Use "AI Auto-Route" to automatically assign unscheduled jobs to qualified crews
3. **Crew Management**: Add/edit/delete inspectors with their certifications
4. **Validation**: System prevents assigning jobs without matching crew certifications
5. **Bulk Import**: CSV import for rapid job backlog creation
6. **Search/Filter**: Backlog supports filtering by run type and priority

### Component Architecture
**Transitioning from monolithic to component-based structure:**
- **Main**: `src/App.jsx` (~1800 lines) - Primary state management, grid logic, main UI orchestration
- **Job Components**: `src/components/JobModals.jsx` - CreateJobModal, JobDetailModal
- **Crew Components**: `src/components/CrewComponents.jsx` - CrewManagementModal, CrewCard
- **Optimization**: `src/components/RouteOptimizationModal.jsx` - AI schedule preview
- **Maps**: `src/components/MapPreview.jsx` - Location visualization (Leaflet + react-leaflet)

**State Management**: All state in App.jsx using `useState` hooks. Consider extracting to custom hooks (`useDragDrop()`, `useScheduleState()`, `useRouteOptimization()`) as complexity grows.

## Key Conventions

### Data Constants (Top of App.jsx)
Define domain data at the top of App.jsx:
- `TICKETS`: Ticket type definitions with display name, color, code (WAH, EWP, ROPE, CSE)
- `INITIAL_BACKLOG`: Starting job list with coordinates (lat/lng) and priority
- `INITIAL_SCHEDULE`: Pre-scheduled jobs to seed the weekly grid
- `INITIAL_CREWS`: Initial crew roster with emails, locations, and certifications

Example ticket definition:
```javascript
WAH: { code: "WAH", name: "Working at Heights (Basic)", color: "bg-blue-900/60 text-blue-300 border-blue-700" }
```

### State Management Patterns
**Primary state** (in App.jsx using `useState`):
- `backlog`, `schedule`: Job collections 
- `crews`: Crew roster with certifications
- `draggedJobId`, `dragSource`: Drag-and-drop tracking (source is "backlog" or crew ID)
- `leftActiveTab`: Active sidebar tab ("backlog" | "crews" | "notifications")
- `selectedJob`: Currently viewed job (for detail modal)

**Modal states**:
- `showCreateModal`, `showImportModal`: Job operations
- `showCrewModal`, `editingCrewId`: Crew management
- `showAIOptimizeModal`, `optimizedSchedule`: Route optimization preview

**Crew color palette** (6 colors, assigned sequentially):
- Emerald, sky, violet, amber, rose, cyan - each with Tailwind classes

### Job Assignment & Validation
**Core validation logic**: Before assigning a job to a crew, check:
```javascript
crew.tickets.includes(job.requiredTicket)
```
If validation fails, show alert preventing assignment.

**Special handling**:
- `ewpRequired: true` on job forces EWP ticket requirement (don't rely on requiredTicket alone)
- Jobs always have `status: "backlog"` or `status: "scheduled"`
- Scheduled jobs stored in `schedule` array with additional `day` and `crewId` properties

**Drag endpoints**:
- Backlog → Schedule grid cells: Moves job from backlog to scheduled week
- Schedule → Backlog: Unassigns job, returns to backlog
- Schedule → Different cell: Reassigns job to different day/crew

### Styling Conventions
- **Tailwind CSS**: All styling via utility classes (no inline styles or separate CSS files)
- **Custom scrollbar**: Defined in `src/index.css` via `.custom-scrollbar` class for consistent scroll styling
- **Dark theme colors**: Uses opacity syntax (`900/60`) on color families:
  - Tickets/domains: blue, cyan, purple, amber
  - UI accents: slate, rose, emerald, sky
- **Component spacing**: Consistent use of `gap-4`, `p-4`, `rounded-lg` patterns
- **Icons**: All from lucide-react (e.g., `<Plus />`, `<Trash2 />`, `<Edit3 />`)

### CSV Import Format
Jobs imported via CSV must include:
```
site,cost,requiredTicket,run,priority,notes,lat,lng
Puma Collie,1250,WAH,SOUTHWEST RUN,normal,Testing,−33.6550,115.3319
```

Parser validates required fields: `site`, `cost`, `requiredTicket`. Optional: `run`, `priority`, `notes`, `lat`, `lng`, `tags`.

### Component Interface Patterns
When creating new modal or card components in `src/components/`:

**Props pattern**:
```javascript
// Modal component
export function MyModal({ isOpen, onClose, onSubmit, data }) {
  // Use onClose() to dismiss, onSubmit() to save
}

// Card/display component  
export function MyCard({ item, onEdit, onDelete }) {
  // item is data to display, callbacks are for actions
}
```

**Shared state passing**: Pass state handlers (not entire state objects) to components. Example:
```javascript
<CrewCard crew={crew} onEdit={() => setEditingCrewId(crew.id)} />
```

## New Features (Latest)

### Crew Management (CRUD Operations)
Located in "Crews & Tickets" tab. Full inspector/employee lifecycle:
- **Add Inspector**: CrewManagementModal with form fields (name, email, phone, baseLocation, notes) + ticket checkboxes
- **Edit Inspector**: Same modal, pre-populated with crew data, saves edits to state
- **Delete Inspector**: Removes crew record and unassigns all scheduled jobs back to backlog
- **Toggle Certifications**: Quick ticket toggle buttons on each crew card

Color assignment: Automatic, sequential from `crewColors` palette (prevents duplicates).

### AI Route Optimization (Local Heuristic)
"AI Auto-Route" button in Crews tab. Algorithm:
1. Filter backlog jobs with `status: "backlog"`
2. Sort by `priority` (high → warning → normal), then by `cost` (descending)
3. For each job:
   - Find crews with matching `requiredTicket`
   - Assign to crew/day combo with lowest current workload
   - Mark as `status: "scheduled"` with `day` and `crewId` properties
4. Show preview modal before committing (RouteOptimizationModal)

**Constraints**: 
- Only qualifies jobs with matching crew certifications
- Unqualified jobs remain in backlog
- Respects manual assignments (doesn't override)
- No external API calls (instant, local execution)

### Location Data Integration
All jobs include GPS coordinates (`lat`, `lng`) for Western Australia region. Enables:
- Distance calculations for route efficiency
- Map visualization (Leaflet + react-leaflet@4 installed)
- Future enhancements: satellite imagery, geofencing, delivery order optimization

Sample data includes realistic WA coordinates (Puma Collie, Donnybrook, Yallingup, etc.)

### Updated Dependencies
- `leaflet@^1.9.4` - Map rendering library
- `react-leaflet@^4.2.1` - React wrapper (compatible with React 18)
- `lucide-react@^0.395.0` - Icon library (used throughout UI)
- `tailwindcss@^3.3.5` - Utility-first CSS framework
- `vite@^5.0.8` - Build tool with fast HMR

## Common Implementation Patterns

### Adding a New Feature
1. **Define state in App.jsx** (top-level):
   ```javascript
   const [myFeatureState, setMyFeatureState] = useState(initialValue);
   ```

2. **Create component in src/components/** (if UI is complex):
   ```javascript
   export function MyFeatureComponent({ state, onStateChange, onClose }) {
     // Use state for display, onStateChange for updates
     return (...);
   }
   ```

3. **Pass handlers (not state)** to child components:
   ```javascript
   <MyFeatureComponent 
     state={myFeatureState}
     onStateChange={(newValue) => setMyFeatureState(newValue)}
     onClose={() => setShowModal(false)}
   />
   ```

### Validating Job Assignment
Always check tickets before allowing drag-drop assignment:
```javascript
const canAssign = (job, crew) => {
  return crew.tickets.includes(job.requiredTicket);
};

// In drag handlers
if (!canAssign(draggedJob, targetCrew)) {
  alert(`Crew needs ${job.requiredTicket} ticket`);
  return; // Prevent assignment
}
```

### Modifying Job List
Jobs exist in two collections. Update both:
```javascript
// Remove from backlog
setBacklog(backlog.filter(job => job.id !== jobId));

// Add to schedule with scheduling info
setSchedule([...schedule, { ...job, day: "Monday", crewId: "crew-1", status: "scheduled" }]);
```

### Updating Crew Certifications
Toggle ticket in crew's ticket array:
```javascript
const toggleTicket = (crewId, ticketCode) => {
  setCrews(crews.map(crew => {
    if (crew.id === crewId) {
      return {
        ...crew,
        tickets: crew.tickets.includes(ticketCode)
          ? crew.tickets.filter(t => t !== ticketCode)
          : [...crew.tickets, ticketCode]
      };
    }
    return crew;
  }));
};
```

## Working with Components

### CrewComponents.jsx
Exported: `CrewManagementModal`, `CrewCard`

**CrewManagementModal**:
- Props: `{ isOpen, onClose, crew, onSave }`
- Manages form state for add/edit operations
- Auto-assigns color from palette when creating
- Returns crew object with all fields on save

**CrewCard**:
- Props: `{ crew, onEdit, onDelete, onToggleTicket }`
- Displays crew with ticket badges
- Ticket badges toggle certification on click
- Edit/delete icons call respective handlers

### JobModals.jsx
Exported: `CreateJobModal`, `JobDetailModal`

**CreateJobModal**:
- Props: `{ isOpen, onClose, onCreateJob }`
- Form fields: site, cost, run, priority, requiredTicket, notes, lat, lng
- Validates required fields before submission
- Auto-generates job ID

**JobDetailModal**:
- Props: `{ job, isOpen, onClose }`
- Read-only display of job details
- Shows location coordinates
- Displays ticket requirement and priority

### RouteOptimizationModal.jsx
Exported: `RouteOptimizationModal`

**Props**: `{ isOpen, optimizedSchedule, crews, onApply, onClose }`
- Displays proposed job assignments
- Shows crew names with color indicators
- Shows day and required ticket for each assignment
- Two action buttons: "Discard" and "Apply Optimized Schedule"

## Testing & Verification

### Manual Testing Checklist
Before committing changes:
- [ ] Dev server starts: `npm run dev` → no errors
- [ ] Feature works in browser (drag-drop, form submission, etc.)
- [ ] State updates persist when switching tabs
- [ ] No console errors (open DevTools)
- [ ] Production build succeeds: `npm run build` (takes 5-10s)

### Common Testing Scenarios
1. **Drag-drop assignment**: Drag backlog job → schedule cell → validates ticket
2. **Crew management**: Create crew → assign ticket → assign job → delete crew
3. **CSV import**: Upload file → jobs appear in backlog
4. **Route optimization**: Add jobs → click AI Auto-Route → preview → apply
5. **Mobile responsiveness**: Resize window → check layout (optional, not required)

### Debugging Tips
- **State issues**: Check React DevTools to inspect component props/state
- **Drag-drop bugs**: Add `console.log()` in `onDragStart`, `onDragOver`, `onDrop` handlers
- **Validation failures**: Check crew.tickets array vs job.requiredTicket
- **UI not updating**: Verify you're using `setState` and not mutating state directly

## Refactoring Opportunities

App.jsx is ~1800 lines and can be improved by extracting logic:

**High Priority** (easier extraction, big impact):
- `<ScheduleGrid />` - Weekly grid display and drag-drop handlers (300+ lines)
- `<BacklogPanel />` - Job search, filter, list display (150+ lines)
- Custom hook `useDragDrop()` - Consolidate draggedJobId, dragSource state + handlers

**Medium Priority** (moderate complexity):
- `useScheduleState()` - Manage schedule, backlog, crew state mutations
- `<NotificationsPanel />` - Error/success messages sidebar (currently 50 lines)
- Custom hooks for ticket validation logic

**Lower Priority** (can wait):
- Separate styling constants to a `theme.js` file
- Extract constants (TICKETS, INITIAL_BACKLOG) to `data.js`
- Unit tests (currently no test framework)

**Architectural notes**: Components already follow modular pattern in `src/components/`. Continue this for new features instead of adding to App.jsx.

## MCP Server Configuration

### Web Browser (Recommended for Interactive Testing)
To enable browser automation for testing the scheduler UI:

1. Start the dev server in a terminal:
   ```bash
   npm run dev
   ```
   App runs at `http://localhost:5173`

2. Configure Web Browser MCP in your Copilot CLI settings to point to this URL

3. Use the browser to test:
   - **Drag-and-drop**: Drag jobs from backlog → schedule cells
   - **Crew management**: Add/edit/delete inspectors and toggle certifications
   - **Route optimization**: Run "AI Auto-Route" and verify assignments
   - **CSV imports**: Upload job files and verify parsing
   - **Form validation**: Test modal forms with invalid/empty inputs
   - **Mobile responsiveness**: Resize window and check layout

**Note**: Web Browser is optional. All development can be done without it, but it's helpful for visual verification before committing changes.
