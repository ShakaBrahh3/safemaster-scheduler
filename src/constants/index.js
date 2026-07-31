// SafeMaster Scheduler - Constants
// Centralized configuration and static data

// Ticket definitions
export const TICKETS = {
  WAH: { code: "WAH", name: "Working at Heights (Basic)", color: "bg-blue-900/60 text-blue-300 border-blue-700" },
  EWP: { code: "EWP", name: "EWP Ticket > 11m (WP License)", color: "bg-cyan-900/60 text-cyan-300 border-cyan-700" },
  ROPE: { code: "ROPE", name: "IRATA Rope Access Cert", color: "bg-purple-900/60 text-purple-300 border-purple-700" },
  CSE: { code: "CSE", name: "Confined Space Entry (CSE)", color: "bg-amber-900/60 text-amber-300 border-amber-700" }
};

// Available days
export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

// Run styles for visual differentiation
export const RUN_STYLES = {
  "SOUTHWEST RUN": { bg: "bg-emerald-100 text-emerald-800 border-emerald-300", dot: "bg-emerald-500" },
  "PROGRAMMED": { bg: "bg-green-100 text-green-800 border-green-300", dot: "bg-green-500" },
  "PROGRAMMED SOR SCHOOLS": { bg: "bg-lime-100 text-lime-800 border-lime-300", dot: "bg-lime-500" },
  "REPORTS": { bg: "bg-yellow-100 text-yellow-800 border-yellow-300", dot: "bg-yellow-500" },
  "REPORTS DAY": { bg: "bg-yellow-100 text-yellow-800 border-yellow-300", dot: "bg-yellow-500" },
  "PROGRAMMED OVERFLOW DAY": { bg: "bg-purple-100 text-purple-800 border-purple-300", dot: "bg-purple-500" },
  "HIGH PRIORITY/CRITICAL": { bg: "bg-rose-100 text-rose-800 border-rose-300", dot: "bg-rose-500" },
  "LIGHT DUTIES": { bg: "bg-slate-100 text-slate-800 border-slate-300", dot: "bg-slate-500" }
};

// Priority levels
export const PRIORITY_LEVELS = ["high", "warning", "normal"];

// Priority display names and colors
export const PRIORITY_CONFIG = {
  high: { label: "High", color: "text-rose-400", bg: "bg-rose-900/30", border: "border-rose-700" },
  warning: { label: "Warning", color: "text-amber-400", bg: "bg-amber-900/30", border: "border-amber-700" },
  normal: { label: "Normal", color: "text-emerald-400", bg: "bg-emerald-900/30", border: "border-emerald-700" }
};

// Crew color palette
export const CREW_COLORS = [
  "border-emerald-500 bg-emerald-50/40 text-emerald-950",
  "border-sky-500 bg-sky-50/40 text-sky-950",
  "border-violet-500 bg-violet-50/40 text-violet-950",
  "border-amber-500 bg-amber-50/40 text-amber-950",
  "border-rose-500 bg-rose-50/40 text-rose-950",
  "border-cyan-500 bg-cyan-50/40 text-cyan-950"
];

// Maximum daily workload (configurable)
export const MAX_DAILY_LOAD = 5000; // $5000 max per crew per day

// Default filter values
export const DEFAULT_FILTERS = {
  run: "ALL",
  priority: "ALL",
  showOnlyUnqualified: false
};

// API configuration
export const API_CONFIG = {
  baseUrl: '/api',
  timeout: 10000,
  retries: 3
};

// Local storage keys
export const STORAGE_KEYS = {
  schedulerState: 'safemaster-scheduler-state-v1',
  userPreferences: 'safemaster-user-preferences',
  lastExport: 'safemaster-last-export'
};

// Validation patterns
export const VALIDATION = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\d\s\-\+\(\)]{8,20}$/,
  cost: /^\d{1,8}(\.\d{1,2})?$/,
  site: /^[\w\s\-\.,#]{2,100}$/
};

// Initial data for fresh installations
export const INITIAL_BACKLOG = [
  {
    id: "job-1",
    site: "Puma Collie",
    cost: 1250.00,
    run: "SOUTHWEST RUN",
    notes: "STAY BUSSELTON. Annual anchor point testing & static lines.",
    tags: ["Anchor Testing", "Static Line"],
    ewpRequired: false,
    requiredTicket: "WAH",
    priority: "normal",
    status: "backlog",
    lat: -33.6550,
    lng: 115.3319
  },
  {
    id: "job-2",
    site: "Tula Lodge - Donnybrook",
    cost: 890.00,
    run: "SOUTHWEST RUN",
    notes: "SM18756. Harness attachment point certification. Client contact out of office.",
    tags: ["Harness Point"],
    ewpRequired: false,
    requiredTicket: "WAH",
    priority: "warning",
    status: "backlog",
    lat: -33.3822,
    lng: 115.7400
  },
  {
    id: "job-4",
    site: "Seashells - Yallingup",
    cost: 1178.00,
    run: "SOUTHWEST RUN",
    notes: "SM3061. High reach access. Requires valid EWP ticket for operators.",
    tags: ["EWP Hire", "Anchor Testing"],
    ewpRequired: true,
    requiredTicket: "EWP",
    priority: "high",
    status: "backlog",
    lat: -33.7025,
    lng: 115.0319
  },
  {
    id: "job-5",
    site: "Broadwater Resort - Busselton",
    cost: 1373.74,
    run: "SOUTHWEST RUN",
    notes: "SM17374. Certify safety lines and anchor layout.",
    tags: ["Static Line"],
    ewpRequired: false,
    requiredTicket: "WAH",
    priority: "normal",
    status: "backlog",
    lat: -33.6606,
    lng: 115.3631
  },
  {
    id: "job-6",
    site: "Salvation Army - Seaforth Gardens",
    cost: 1658.00,
    run: "PROGRAMMED",
    notes: "Full system recertification. High risk roof margins.",
    tags: ["Static Line", "Anchor Testing"],
    ewpRequired: false,
    requiredTicket: "WAH",
    priority: "high",
    status: "backlog",
    lat: -32.0453,
    lng: 115.8133
  },
  {
    id: "job-7",
    site: "Armadale Senior High School",
    cost: 1205.12,
    run: "PROGRAMMED SOR SCHOOLS",
    notes: "Undercover area only. Static lines and vertical ladders.",
    tags: ["Ladder Inspection", "Static Line"],
    ewpRequired: false,
    requiredTicket: "WAH",
    priority: "normal",
    status: "backlog",
    lat: -32.1642,
    lng: 116.0124
  },
  {
    id: "job-9",
    site: "AE Hoskins 3x Site",
    cost: 2656.00,
    run: "SOUTHWEST RUN",
    notes: "EWP Booked. Waiting on confirmation for EWP hire & local traffic permit.",
    tags: ["EWP Hire", "Static Line"],
    ewpRequired: true,
    requiredTicket: "EWP",
    priority: "high",
    status: "backlog",
    lat: -32.2149,
    lng: 115.9281
  },
  {
    id: "job-13",
    site: "Paradiso Apartments Subiaco",
    cost: 3033.00,
    run: "HIGH PRIORITY/CRITICAL",
    notes: "Complex steep roofline. Rope access descent certification only.",
    tags: ["Rope Access", "Anchor Testing"],
    ewpRequired: false,
    requiredTicket: "ROPE",
    priority: "high",
    status: "backlog",
    lat: -31.9455,
    lng: 115.8186
  },
  {
    id: "job-14",
    site: "Water Corporation Pit - Canning",
    cost: 1850.00,
    run: "LIGHT DUTIES",
    notes: "Below ground entry anchor certification. Strictly requires Confined Space Entry.",
    tags: ["Confined Space", "Anchor Testing"],
    ewpRequired: false,
    requiredTicket: "CSE",
    priority: "high",
    status: "backlog",
    lat: -32.0122,
    lng: 115.8558
  }
];

export const INITIAL_SCHEDULE = [
  {
    id: "sched-1",
    site: "Puma Waterloo",
    cost: 1160.00,
    run: "SOUTHWEST RUN",
    notes: "HOME run job. Final site on loop.",
    tags: ["Anchor Testing"],
    ewpRequired: false,
    requiredTicket: "WAH",
    priority: "normal",
    day: "Wednesday",
    crewId: "tony",
    status: "scheduled",
    lat: -33.6750,
    lng: 115.3450
  },
  {
    id: "sched-2",
    site: "Spudshed Australind",
    cost: 850.00,
    run: "SOUTHWEST RUN",
    notes: "SM12089. Load testing on heavy anchors.",
    tags: ["Load Tester"],
    ewpRequired: false,
    requiredTicket: "WAH",
    priority: "high",
    day: "Thursday",
    crewId: "tony",
    status: "scheduled",
    lat: -33.8478,
    lng: 115.2561
  },
  {
    id: "sched-3",
    site: "Arum River Apartments Rivervale",
    cost: 944.00,
    run: "REPORTS",
    notes: "1000 ONSITE. Cannot be earlier. Call site contact when onsite for access. Collect key from main depot first.",
    tags: ["Key Pick Up"],
    ewpRequired: false,
    requiredTicket: "WAH",
    priority: "high",
    day: "Tuesday",
    crewId: "beau",
    status: "scheduled",
    lat: -31.9725,
    lng: 115.8694
  },
  {
    id: "sched-4",
    site: "Oxford Youth House Leederville",
    cost: 792.00,
    run: "PROGRAMMED",
    notes: "Load tester and harness check required.",
    tags: ["Load Tester"],
    ewpRequired: false,
    requiredTicket: "WAH",
    priority: "normal",
    day: "Wednesday",
    crewId: "beau",
    status: "scheduled",
    lat: -31.9461,
    lng: 115.8294
  }
];

export const INITIAL_CREWS = [
  { 
    id: "tony", 
    name: "Tony", 
    email: "tony@safemaster.com.au",
    phone: "0412 345 678",
    color: "border-emerald-500 bg-emerald-50/40 text-emerald-950",
    tickets: ["WAH", "EWP"],
    baseLocation: "Busselton",
    notes: "Southwest Run specialist, experienced EWP operator"
  },
  { 
    id: "beau", 
    name: "Beau", 
    email: "beau@safemaster.com.au",
    phone: "0412 345 679",
    color: "border-sky-500 bg-sky-50/40 text-sky-950",
    tickets: ["WAH"],
    baseLocation: "Perth Metro",
    notes: "Metro/SOR Run coverage"
  },
  { 
    id: "tyron", 
    name: "Tyron", 
    email: "tyron@safemaster.com.au",
    phone: "0412 345 680",
    color: "border-violet-500 bg-violet-50/40 text-violet-950",
    tickets: ["WAH", "EWP", "ROPE"],
    baseLocation: "North Perth",
    notes: "Elite rope access certified operator"
  },
  { 
    id: "andrew", 
    name: "Andrew", 
    email: "andrew@safemaster.com.au",
    phone: "0412 345 681",
    color: "border-amber-500 bg-amber-50/40 text-amber-950",
    tickets: ["WAH", "CSE"],
    baseLocation: "Midland",
    notes: "Reports and light duties, confined space specialist"
  }
];

// Utility functions
export const getTicketName = (ticketCode) => TICKETS[ticketCode]?.name || ticketCode;
export const getTicketColor = (ticketCode) => TICKETS[ticketCode]?.color || 'bg-slate-700 text-slate-300';
export const getRunStyle = (runName) => RUN_STYLES[runName] || { bg: "bg-gray-100 text-gray-800 border-gray-300", dot: "bg-gray-500" };
// Re-export recurring constants
export * from './recurring';
