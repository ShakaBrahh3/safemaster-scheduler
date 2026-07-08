import React, { useState } from 'react';
import { 
  Calendar, 
  Users, 
  Upload, 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  AlertTriangle, 
  MapPin, 
  DollarSign, 
  Sliders, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ShieldAlert, 
  ChevronRight,
  Info,
  Download,
  Check,
  Award,
  Bell,
  Send,
  Copy,
  UserCheck,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

// Component imports
import MapPreview from './components/MapPreview';
import { CrewManagementModal, CrewCard } from './components/CrewComponents';
import { CreateJobModal, JobDetailModal } from './components/JobModals';
import { RouteOptimizationModal } from './components/RouteOptimizationModal';

// STANDARD TICKET DEFINITIONS
const TICKETS = {
  WAH: { code: "WAH", name: "Working at Heights (Basic)", color: "bg-blue-900/60 text-blue-300 border-blue-700" },
  EWP: { code: "EWP", name: "EWP Ticket > 11m (WP License)", color: "bg-cyan-900/60 text-cyan-300 border-cyan-700" },
  ROPE: { code: "ROPE", name: "IRATA Rope Access Cert", color: "bg-purple-900/60 text-purple-300 border-purple-700" },
  CSE: { code: "CSE", name: "Confined Space Entry (CSE)", color: "bg-amber-900/60 text-amber-300 border-amber-700" }
};

// INITIAL DATASETS WITH SPECIFIC TICKET CONSTRAINTS
const INITIAL_BACKLOG = [
  {
    id: "job-1",
    site: "Puma Collie",
    cost: 1250.00,
    run: "SOUTHWEST RUN",
    notes: "STAY BUSSELTON. Annual anchor point testing & static lines.",
    tags: ["Anchor Testing", "Static Line"],
    ewpRequired: false,
    requiredTicket: "WAH", // Basic Heights
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
    requiredTicket: "EWP", // Requires EWP ticket
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
    requiredTicket: "EWP", // Requires EWP Ticket
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
    requiredTicket: "ROPE", // Requires Rope Access Ticket
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
    requiredTicket: "CSE", // Requires CSE ticket
    priority: "high",
    status: "backlog",
    lat: -32.0122,
    lng: 115.8558
  }
];

const INITIAL_SCHEDULE = [
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

const INITIAL_CREWS = [
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

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const RUN_STYLES = {
  "SOUTHWEST RUN": { bg: "bg-emerald-100 text-emerald-800 border-emerald-300", dot: "bg-emerald-500" },
  "PROGRAMMED": { bg: "bg-green-100 text-green-800 border-green-300", dot: "bg-green-500" },
  "PROGRAMMED SOR SCHOOLS": { bg: "bg-lime-100 text-lime-800 border-lime-300", dot: "bg-lime-500" },
  "REPORTS": { bg: "bg-yellow-100 text-yellow-800 border-yellow-300", dot: "bg-yellow-500" },
  "REPORTS DAY": { bg: "bg-yellow-100 text-yellow-800 border-yellow-300", dot: "bg-yellow-500" },
  "PROGRAMMED OVERFLOW DAY": { bg: "bg-purple-100 text-purple-800 border-purple-300", dot: "bg-purple-500" },
  "HIGH PRIORITY/CRITICAL": { bg: "bg-rose-100 text-rose-800 border-rose-300", dot: "bg-rose-500" },
  "LIGHT DUTIES": { bg: "bg-slate-100 text-slate-800 border-slate-300", dot: "bg-slate-500" }
};

export default function App() {
  const [backlog, setBacklog] = useState(INITIAL_BACKLOG);
  const [schedule, setSchedule] = useState(INITIAL_SCHEDULE);
  const [crews, setCrews] = useState(INITIAL_CREWS);
  
  const [selectedJob, setSelectedJob] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRunFilter, setSelectedRunFilter] = useState("ALL");
  const [draggedJobId, setDraggedJobId] = useState(null);
  const [dragSource, setDragSource] = useState(null); 
  
  // Interactive UI Tabs on Left sidebar
  const [leftActiveTab, setLeftActiveTab] = useState("backlog"); // "backlog" | "crews" | "notifications"

  // Notification states
  const [briefingDay, setBriefingDay] = useState("Wednesday");
  const [copiedStatus, setCopiedStatus] = useState(null); // tracking copy clipboard state

  // State for Import Panel
  const [showImportModal, setShowImportModal] = useState(false);
  const [csvInput, setCsvInput] = useState("");
  const [importFeedback, setImportFeedback] = useState("");

  // Create Job Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newJob, setNewJob] = useState({
    site: "",
    cost: "",
    run: "SOUTHWEST RUN",
    notes: "",
    tags: [],
    ewpRequired: false,
    requiredTicket: "WAH",
    priority: "normal",
    lat: null,
    lng: null
  });

  // Crew Management Modal State
  const [showCrewModal, setShowCrewModal] = useState(false);
  const [editingCrewId, setEditingCrewId] = useState(null);
  const [newCrew, setNewCrew] = useState({
    name: "",
    email: "",
    phone: "",
    baseLocation: "",
    notes: "",
    tickets: ["WAH"]
  });
  const crewColors = ["border-emerald-500 bg-emerald-50/40 text-emerald-950", "border-sky-500 bg-sky-50/40 text-sky-950", "border-violet-500 bg-violet-50/40 text-violet-950", "border-amber-500 bg-amber-50/40 text-amber-950", "border-rose-500 bg-rose-50/40 text-rose-950", "border-cyan-500 bg-cyan-50/40 text-cyan-950"];

  // Route Optimization state
  const [showAIOptimizeModal, setShowAIOptimizeModal] = useState(false);
  const [optimizedSchedule, setOptimizedSchedule] = useState(null);

  // Map view state
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapJobId, setMapJobId] = useState(null);

  // Calculate statistics
  const totalWeeklyValue = schedule.reduce((sum, job) => sum + Number(job.cost || 0), 0);
  const backlogValue = backlog.reduce((sum, job) => sum + Number(job.cost || 0), 0);
  const totalScheduledJobs = schedule.length;
  const totalEwpJobs = schedule.filter(j => j.ewpRequired).length;

  // Crew Management Handlers
  const handleAddCrew = () => {
    if (!newCrew.name || !newCrew.email) {
      alert("Please fill in name and email");
      return;
    }
    const newCrewId = `crew-${Date.now()}`;
    const colorIndex = crews.length % crewColors.length;
    const createdCrew = {
      id: newCrewId,
      ...newCrew,
      color: crewColors[colorIndex]
    };
    setCrews([...crews, createdCrew]);
    setNewCrew({ name: "", email: "", phone: "", baseLocation: "", notes: "", tickets: ["WAH"] });
    setShowCrewModal(false);
    alert(`${newCrew.name} added successfully!`);
  };

  const handleEditCrew = (crewId) => {
    const crew = crews.find(c => c.id === crewId);
    if (crew) {
      setNewCrew({ ...crew });
      setEditingCrewId(crewId);
      setShowCrewModal(true);
    }
  };

  const handleSaveEditCrew = () => {
    if (!newCrew.name || !newCrew.email) {
      alert("Please fill in name and email");
      return;
    }
    setCrews(crews.map(c => c.id === editingCrewId ? { ...newCrew, id: c.id, color: c.color } : c));
    setNewCrew({ name: "", email: "", phone: "", baseLocation: "", notes: "", tickets: ["WAH"] });
    setEditingCrewId(null);
    setShowCrewModal(false);
    alert("Crew updated successfully!");
  };

  const handleDeleteCrew = (crewId) => {
    if (confirm("Are you sure? This will unassign all their scheduled jobs.")) {
      setCrews(crews.filter(c => c.id !== crewId));
      setSchedule(schedule.filter(j => j.crewId !== crewId));
      alert("Crew removed successfully!");
    }
  };

  const handleNewCrewToggleTicket = (ticketCode) => {
    const hasIt = newCrew.tickets.includes(ticketCode);
    setNewCrew({
      ...newCrew,
      tickets: hasIt ? newCrew.tickets.filter(t => t !== ticketCode) : [...newCrew.tickets, ticketCode]
    });
  };

  // Route Optimization (Local Heuristic)
  const optimizeRoutes = () => {
    const unscheduledJobs = backlog.filter(j => j.status === "backlog");
    if (unscheduledJobs.length === 0) {
      alert("No unscheduled jobs to optimize");
      return;
    }

    const sortedJobs = [...unscheduledJobs].sort((a, b) => {
      // Priority: high > warning > normal, then by cost (higher first)
      const priorityMap = { high: 3, warning: 2, normal: 1 };
      const priorityDiff = (priorityMap[b.priority] || 0) - (priorityMap[a.priority] || 0);
      if (priorityDiff !== 0) return priorityDiff;
      return b.cost - a.cost;
    });

    const assignments = [];
    const dayCrewMap = {};

    sortedJobs.forEach(job => {
      const qualifiedCrews = crews.filter(crew => crew.tickets.includes(job.requiredTicket));
      if (qualifiedCrews.length === 0) {
        console.warn(`No qualified crew for ${job.site}, needs ${job.requiredTicket}`);
        return;
      }

      let bestCrewDay = null;
      let minLoad = Infinity;

      DAYS.forEach(day => {
        qualifiedCrews.forEach(crew => {
          const key = `${day}-${crew.id}`;
          const currentLoad = dayCrewMap[key] || 0;
          const dayScheduled = schedule.filter(j => j.day === day && j.crewId === crew.id).reduce((s, j) => s + j.cost, 0);
          const totalLoad = currentLoad + dayScheduled;

          if (totalLoad < minLoad) {
            minLoad = totalLoad;
            bestCrewDay = { day, crewId: crew.id };
          }
        });
      });

      if (bestCrewDay) {
        assignments.push({ ...job, ...bestCrewDay, status: "scheduled" });
        dayCrewMap[`${bestCrewDay.day}-${bestCrewDay.crewId}`] = minLoad + job.cost;
      }
    });

    setOptimizedSchedule(assignments);
    setShowAIOptimizeModal(true);
  };

  const applyOptimization = () => {
    if (optimizedSchedule) {
      setSchedule([...schedule, ...optimizedSchedule]);
      setBacklog(backlog.filter(j => !optimizedSchedule.find(o => o.id === j.id)));
      setShowAIOptimizeModal(false);
      setOptimizedSchedule(null);
      alert("Optimized route assignments applied!");
    }
  };

  // Toggle dynamic ticket ownership for interactive demo
  const handleToggleCrewTicket = (crewId, ticketCode) => {
    setCrews(crews.map(c => {
      if (c.id === crewId) {
        const hasIt = c.tickets.includes(ticketCode);
        const updatedTickets = hasIt 
          ? c.tickets.filter(t => t !== ticketCode)
          : [...c.tickets, ticketCode];
        return { ...c, tickets: updatedTickets };
      }
      return c;
    }));
  };

  // Drag and Drop Logic
  const handleDragStart = (e, jobId, source) => {
    setDraggedJobId(jobId);
    setDragSource(source);
    e.dataTransfer.setData("text/plain", jobId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDropOnCell = (e, day, crewId) => {
    e.preventDefault();
    if (!draggedJobId) return;

    if (dragSource === "backlog") {
      const jobIndex = backlog.findIndex(j => j.id === draggedJobId);
      if (jobIndex !== -1) {
        const job = { ...backlog[jobIndex], day, crewId, status: "scheduled" };
        setSchedule([...schedule, job]);
        setBacklog(backlog.filter(j => j.id !== draggedJobId));
      }
    } else if (dragSource === "calendar") {
      setSchedule(schedule.map(job => {
        if (job.id === draggedJobId) {
          return { ...job, day, crewId };
        }
        return job;
      }));
    }

    setDraggedJobId(null);
    setDragSource(null);
  };

  const handleDropOnBacklog = (e) => {
    e.preventDefault();
    if (!draggedJobId) return;

    if (dragSource === "calendar") {
      const jobIndex = schedule.findIndex(j => j.id === draggedJobId);
      if (jobIndex !== -1) {
        const job = { ...schedule[jobIndex], status: "backlog" };
        delete job.day;
        delete job.crewId;
        setBacklog([...backlog, job]);
        setSchedule(schedule.filter(j => j.id !== draggedJobId));
      }
    }
    setDraggedJobId(null);
    setDragSource(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  // Edit / Delete helpers
  const handleSaveJobEdit = (updatedJob) => {
    if (updatedJob.status === "scheduled") {
      setSchedule(schedule.map(j => j.id === updatedJob.id ? updatedJob : j));
    } else {
      setBacklog(backlog.map(j => j.id === updatedJob.id ? updatedJob : j));
    }
    setSelectedJob(null);
  };

  const unscheduleJob = (jobId) => {
    const job = schedule.find(j => j.id === jobId);
    if (job) {
      const updated = { ...job, status: "backlog" };
      delete updated.day;
      delete updated.crewId;
      setBacklog([...backlog, updated]);
      setSchedule(schedule.filter(j => j.id !== jobId));
    }
    setSelectedJob(null);
  };

  const deleteJob = (jobId, isScheduled) => {
    if (isScheduled) {
      setSchedule(schedule.filter(j => j.id !== jobId));
    } else {
      setBacklog(backlog.filter(j => j.id !== jobId));
    }
    setSelectedJob(null);
  };

  // CSV/Excel Import Parse logic
  const handleImportCSV = () => {
    if (!csvInput.trim()) {
      setImportFeedback("Please paste Excel columns first.");
      return;
    }

    const lines = csvInput.split("\n");
    let addedCount = 0;
    const newJobsParsed = [];

    lines.forEach((line, index) => {
      if (!line.trim()) return;
      const parts = line.includes("\t") ? line.split("\t") : line.split(",");
      if (parts.length > 0) {
        const site = parts[0]?.trim() || `Imported Site #${index + 1}`;
        let cost = parseFloat(parts[1]?.replace(/[^0-9.]/g, '')) || 0;
        const run = parts[2]?.trim().toUpperCase() || "PROGRAMMED";
        const notes = parts[3]?.trim() || "Routine height compliance.";
        
        // Auto detect ticket needs based on text
        let requiredTicket = "WAH";
        if (notes.toLowerCase().includes("rope") || notes.toLowerCase().includes("descent")) requiredTicket = "ROPE";
        else if (notes.toLowerCase().includes("ewp") || notes.toLowerCase().includes("elevating")) requiredTicket = "EWP";
        else if (notes.toLowerCase().includes("confined") || notes.toLowerCase().includes("pit")) requiredTicket = "CSE";

        newJobsParsed.push({
          id: `imported-${Date.now()}-${index}`,
          site,
          cost,
          run: Object.keys(RUN_STYLES).includes(run) ? run : "PROGRAMMED",
          notes,
          tags: requiredTicket !== "WAH" ? [TICKETS[requiredTicket].code] : [],
          ewpRequired: requiredTicket === "EWP",
          requiredTicket,
          priority: notes.toLowerCase().includes("urgent") ? "high" : "normal",
          status: "backlog"
        });
        addedCount++;
      }
    });

    if (newJobsParsed.length > 0) {
      setBacklog([...newJobsParsed, ...backlog]);
      setImportFeedback(`Successfully imported ${addedCount} height safety tasks!`);
      setCsvInput("");
      setTimeout(() => {
        setShowImportModal(false);
        setImportFeedback("");
      }, 1500);
    } else {
      setImportFeedback("No valid data rows found. Check column arrangement.");
    }
  };

  // Prepopulate sample spreadsheet rows
  const loadMockExcelSheet = () => {
    const samplePaste = `Mandurah Retail complex\t1920.00\tPROGRAMMED\tEWP Booked. Operates high outreach anchor test.\nSt Georges Roof Descents\t3400.00\tHIGH PRIORITY/CRITICAL\tIRATA Level 2 setup needed. Rope descent lines on external facade.\nSubiaco Sewer Intake\t1150.00\tLIGHT DUTIES\tConfined space cert on static intake bracket.\nHarvey Primary Pavilion\t880.00\tPROGRAMMED SOR SCHOOLS\tBasic ladder climb anchor test.\nEaton Community Centre\t1560.00\tSOUTHWEST RUN\tSM4419. EWP required to reach roof ladder.`;
    setCsvInput(samplePaste);
  };

  // Check if scheduled job has a ticket conflict
  const checkTicketConflict = (job, crewId) => {
    const crew = crews.find(c => c.id === crewId);
    if (!crew) return false;
    const required = job.requiredTicket || "WAH";
    return !crew.tickets.includes(required);
  };

  const handleCreateJob = (e) => {
    e.preventDefault();
    if (!newJob.site) return;

    const formattedJob = {
      ...newJob,
      id: `manual-${Date.now()}`,
      cost: parseFloat(newJob.cost) || 0,
      status: "backlog",
      tags: newJob.ewpRequired ? ["EWP Hire", ...newJob.tags] : newJob.tags
    };

    setBacklog([formattedJob, ...backlog]);
    setShowCreateModal(false);
    setNewJob({
      site: "",
      cost: "",
      run: "SOUTHWEST RUN",
      notes: "",
      tags: [],
      ewpRequired: false,
      requiredTicket: "WAH",
      priority: "normal"
    });
  };

  // Generate Night-Before Notification draft for a specific Crew & Day
  const generateBriefingSMS = (crew, day) => {
    const dayJobs = schedule.filter(j => j.day === day && j.crewId === crew.id);
    if (dayJobs.length === 0) {
      return `Hi ${crew.name.split(" ")[0]}, no jobs scheduled for you on ${day}. Enjoy your day off! - SafeMaster`;
    }

    let sms = `📢 SafeMaster Height Safety Briefing - ${day.toUpperCase()}\n-------------------------\nHi ${crew.name.split(" ")[0]},\n`;
    sms += `You have ${dayJobs.length} site recertifications tomorrow:\n\n`;

    dayJobs.forEach((job, idx) => {
      sms += `${idx + 1}. SITE: ${job.site}\n`;
      sms += `   💰 VALUE: $${job.cost}\n`;
      sms += `   🛠️ TICKET REQUIRED: ${TICKETS[job.requiredTicket || "WAH"].name}\n`;
      if (job.ewpRequired) sms += `   ⚠️ ACCESS: EWP Access platform booked for site!\n`;
      if (job.notes) sms += `   📝 INST: ${job.notes}\n`;
      sms += `\n`;
    });

    sms += `Make sure your vehicles are pre-loaded with appropriate calibrators, anchor testers, and PPE. Reply to dispatch if there are access or ticket issues.`;
    return sms;
  };

  // Copy helper
  const handleCopyText = (text, crewId) => {
    const tempInput = document.createElement("textarea");
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);

    setCopiedStatus(crewId);
    setTimeout(() => setCopiedStatus(null), 2000);
  };

  // Filters backlog items
  const filteredBacklog = backlog.filter(job => {
    const matchesSearch = job.site.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          job.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          job.run.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRun = selectedRunFilter === "ALL" || job.run === selectedRunFilter;
    return matchesSearch && matchesRun;
  });

  const getDayTotalCost = (day) => {
    return schedule
      .filter(job => job.day === day)
      .reduce((sum, job) => sum + Number(job.cost || 0), 0);
  };

  const getRunStyle = (runName) => {
    return RUN_STYLES[runName] || { bg: "bg-gray-100 text-gray-800 border-gray-300", dot: "bg-gray-500" };
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-slate-900">
      
      {/* GLOBAL BANNER */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white px-4 py-2 text-xs font-semibold tracking-wide uppercase shadow-inner flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="animate-pulse bg-white/30 h-2 w-2 rounded-full inline-block"></span>
          <span>SYSTEM UPGRADED: Dynamic Competency Rules & SMS Dispatcher Enabled</span>
        </div>
        <div className="hidden md:flex items-center gap-4 text-white/90">
          <span>Active Crews: 4</span>
          <span>Safety Code Compliance: Standard WA 2026</span>
        </div>
      </div>

      {/* HEADER SECTION */}
      <header className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sticky top-0 z-30 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl shadow-md text-slate-950">
            <ShieldAlert className="h-6 w-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              SafeMaster Scheduler
              <span className="text-xs font-medium px-2 py-0.5 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-md">
                Safety Engine v4.5
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Continuous Anchor Point, Static Line & Inspector Competency Dashboard</p>
          </div>
        </div>

        {/* METRICS HEADER */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 xl:gap-4">
          <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-lg flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">Weekly Scheduled Run</span>
            <span className="text-lg font-bold text-emerald-400 mt-1">${totalWeeklyValue.toLocaleString('en-AU', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-lg flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">Backlog Value</span>
            <span className="text-lg font-bold text-yellow-500 mt-1">${backlogValue.toLocaleString('en-AU', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-lg flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">Scheduled Tasks</span>
            <span className="text-lg font-bold text-white mt-1 flex items-baseline gap-1">
              {totalScheduledJobs} <span className="text-xs text-slate-500 font-normal">allocated</span>
            </span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-lg flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">EWP Bookings</span>
            <span className="text-lg font-bold text-cyan-400 mt-1 flex items-center gap-1.5">
              {totalEwpJobs} <span className="text-xs px-1.5 py-0.5 bg-cyan-400/10 text-cyan-400 rounded">Alert</span>
            </span>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-2 justify-end self-end lg:self-center">
          <button 
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-sm font-semibold rounded-lg text-slate-200 transition-all flex items-center gap-2 shadow"
          >
            <Upload className="h-4 w-4" />
            <span>Excel Importer</span>
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg transition-all flex items-center gap-2 shadow-md hover:shadow-emerald-900/20"
          >
            <Plus className="h-4 w-4" />
            <span>New Job Entry</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 flex flex-col xl:flex-row overflow-hidden">
        
        {/* LEFT COLUMN: MULTI-TAB WORKSPACE PANEL */}
        <section className="w-full xl:w-[420px] bg-slate-950 border-r border-slate-800 flex flex-col z-10 shrink-0">
          
          {/* Workspace Tabs Header */}
          <div className="grid grid-cols-3 border-b border-slate-800 bg-slate-900/60 p-1 gap-1">
            <button
              onClick={() => setLeftActiveTab("backlog")}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${leftActiveTab === "backlog" ? "bg-slate-800 text-teal-400 shadow" : "text-slate-400 hover:text-slate-200"}`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Jobs Backlog ({filteredBacklog.length})</span>
            </button>
            <button
              onClick={() => setLeftActiveTab("crews")}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${leftActiveTab === "crews" ? "bg-slate-800 text-teal-400 shadow" : "text-slate-400 hover:text-slate-200"}`}
            >
              <Award className="h-3.5 w-3.5" />
              <span>Crews & Tickets</span>
            </button>
            <button
              onClick={() => setLeftActiveTab("notifications")}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all relative ${leftActiveTab === "notifications" ? "bg-slate-800 text-teal-400 shadow" : "text-slate-400 hover:text-slate-200"}`}
            >
              <Bell className="h-3.5 w-3.5" />
              <span>Night-Before SMS</span>
              <span className="absolute -top-1 -right-1 bg-teal-500 text-slate-950 text-[9px] w-4.5 h-4.5 font-black rounded-full flex items-center justify-center border-2 border-slate-950 animate-bounce">
                {schedule.length}
              </span>
            </button>
          </div>

          {/* TAB CONTENT: 1. JOBS BACKLOG */}
          {leftActiveTab === "backlog" && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-slate-900 bg-slate-950/50">
                {/* Run Filtering badges */}
                <div className="flex flex-wrap gap-1 mb-3">
                  <button 
                    onClick={() => setSelectedRunFilter("ALL")}
                    className={`text-[9px] px-2 py-1 rounded font-bold transition-all ${selectedRunFilter === "ALL" ? "bg-slate-100 text-slate-950 font-semibold" : "bg-slate-800 text-slate-400 hover:bg-slate-750"}`}
                  >
                    ALL RUNS
                  </button>
                  {Object.keys(RUN_STYLES).map(run => (
                    <button
                      key={run}
                      onClick={() => setSelectedRunFilter(run)}
                      className={`text-[9px] px-2 py-1 rounded font-bold transition-all truncate max-w-[110px] ${selectedRunFilter === run ? "bg-teal-500 text-slate-950 font-bold" : "bg-slate-850 text-slate-400 hover:bg-slate-800"}`}
                    >
                      {run.replace(" RUN", "")}
                    </button>
                  ))}
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Search site, instructions, runs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 focus:border-teal-500 focus:outline-none rounded-lg text-xs placeholder-slate-500 text-slate-200 transition-all"
                  />
                </div>
              </div>

              {/* Backlog List container */}
              <div 
                onDragOver={handleDragOver}
                onDrop={handleDropOnBacklog}
                className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/80 custom-scrollbar"
              >
                {filteredBacklog.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-slate-800 rounded-xl p-4 text-center">
                    <Info className="h-8 w-8 text-slate-600 mb-2" />
                    <p className="text-xs text-slate-400 font-medium">No height safety jobs match selection.</p>
                  </div>
                ) : (
                  filteredBacklog.map(job => (
                    <div
                      key={job.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, job.id, "backlog")}
                      onClick={() => setSelectedJob(job)}
                      className="group relative bg-slate-900 border-l-4 hover:bg-slate-850 p-3.5 rounded-r-lg rounded-l shadow transition-all cursor-grab active:cursor-grabbing border-slate-700 hover:border-teal-500"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className={`text-[8px] uppercase px-1.5 py-0.5 rounded font-extrabold ${getRunStyle(job.run).bg}`}>
                          {job.run}
                        </span>
                        <span className="text-xs font-bold text-white">
                          ${job.cost.toFixed(2)}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-200 group-hover:text-white line-clamp-1 mb-1">
                        {job.site}
                      </h4>

                      <p className="text-[11px] text-slate-400 line-clamp-2 mb-2">
                        {job.notes}
                      </p>

                      <div className="flex flex-wrap items-center gap-1.5">
                        {/* Ticket constraint badge */}
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${TICKETS[job.requiredTicket || "WAH"].color}`}>
                          <Award className="h-2.5 w-2.5" />
                          <span>Req: {job.requiredTicket}</span>
                        </span>

                        {job.ewpRequired && (
                          <span className="text-[9px] bg-cyan-950 text-cyan-400 px-1.5 py-0.5 rounded font-bold border border-cyan-800">
                            EWP
                          </span>
                        )}

                        {job.priority === 'high' && (
                          <span className="text-[9px] bg-rose-950 text-rose-400 border border-rose-900 px-1.5 py-0.5 rounded font-bold ml-auto">
                            CRITICAL
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB CONTENT: 2. CREWS & TICKETS REGISTRY */}
          {leftActiveTab === "crews" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/80">
              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-emerald-400" />
                  Inspector Management & Competency
                </h3>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
                  Manage crew members, assign safety tickets, and track qualifications. Toggle credentials for any inspector or add new employees.
                </p>
                <div className="flex gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => { setEditingCrewId(null); setNewCrew({ name: "", email: "", phone: "", baseLocation: "", notes: "", tickets: ["WAH"] }); setShowCrewModal(true); }}
                    className="flex-1 px-2 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded flex items-center justify-center gap-1 transition-all"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add Inspector</span>
                  </button>
                  <button
                    onClick={optimizeRoutes}
                    className="flex-1 px-2 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-[10px] font-bold rounded flex items-center justify-center gap-1 transition-all"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>AI Auto-Route</span>
                  </button>
                </div>
              </div>

              {crews.map(crew => (
                <div key={crew.id} className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-white flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${crew.color.split(" ")[0].replace("border-", "bg-")}`}></span>
                        {crew.name}
                      </h4>
                      <p className="text-[9px] text-slate-400 mt-0.5">{crew.email}</p>
                      {crew.phone && <p className="text-[9px] text-slate-500">{crew.phone}</p>}
                      {crew.baseLocation && <p className="text-[9px] text-slate-500">📍 {crew.baseLocation}</p>}
                      {crew.notes && <p className="text-[9px] text-slate-400 italic mt-1">{crew.notes}</p>}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditCrew(crew.id)}
                        className="p-1 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded text-slate-400 hover:text-slate-200 transition-all"
                      >
                        <Edit3 className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteCrew(crew.id)}
                        className="p-1 bg-rose-950/30 hover:bg-rose-950/60 border border-rose-900/50 rounded text-rose-400 hover:text-rose-300 transition-all"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">Active Credentials:</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {Object.values(TICKETS).map(t => {
                        const ownsTicket = crew.tickets.includes(t.code);
                        return (
                          <button
                            key={t.code}
                            type="button"
                            onClick={() => handleToggleCrewTicket(crew.id, t.code)}
                            className={`px-2 py-1.5 rounded text-[10px] font-bold border transition-all text-left flex items-center justify-between ${ownsTicket ? 'bg-slate-950 text-teal-400 border-teal-500/50 shadow-sm' : 'bg-slate-900 text-slate-500 border-slate-850 hover:bg-slate-850'}`}
                          >
                            <span>{t.code} - {t.name.split(" ")[0]}</span>
                            {ownsTicket ? <Check className="h-3 w-3 stroke-[3]" /> : <span className="text-xs opacity-40">+</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB CONTENT: 3. NIGHT BEFORE SMS DISPATCHER */}
          {leftActiveTab === "notifications" && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-slate-900 bg-slate-950/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-teal-400" />
                    Automated SMS Briefing Engine
                  </span>
                  
                  {/* Select dispatch day */}
                  <select 
                    value={briefingDay}
                    onChange={(e) => setBriefingDay(e.target.value)}
                    className="bg-slate-900 text-xs font-bold text-slate-200 border border-slate-800 rounded px-2 py-1 focus:outline-none focus:border-teal-500"
                  >
                    {DAYS.map(day => (
                      <option key={day} value={day}>{day}'s Jobs</option>
                    ))}
                  </select>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Sends complete task layouts, ticket mandates, and specific site warnings directly to each inspector's handheld terminal the night before the scheduled job.
                </p>
              </div>

              {/* Generated SMS Briefs */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/80">
                {crews.map(crew => {
                  const smsText = generateBriefingSMS(crew, briefingDay);
                  const crewScheduledJobs = schedule.filter(j => j.day === briefingDay && j.crewId === crew.id);

                  return (
                    <div key={crew.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
                      {/* Crew header */}
                      <div className="bg-slate-950 px-3.5 py-2 flex items-center justify-between border-b border-slate-850">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${crew.color.split(" ")[0].replace("border-", "bg-")}`}></span>
                          {crew.name.split(" ")[0]}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                          {crewScheduledJobs.length} scheduled
                        </span>
                      </div>

                      {/* Brief text box */}
                      <div className="p-3 bg-slate-950/50 m-2.5 rounded-lg border border-slate-800/60 font-mono text-[10px] text-emerald-400 whitespace-pre-wrap leading-relaxed max-h-[140px] overflow-y-auto custom-scrollbar">
                        {smsText}
                      </div>

                      {/* Dispatch Action */}
                      <div className="px-3.5 py-2 bg-slate-900 flex justify-between gap-2 border-t border-slate-850">
                        <span className="text-[9px] text-slate-500 italic self-center">
                          Ready for 7:00 PM auto dispatch
                        </span>
                        
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopyText(smsText, crew.id)}
                            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded text-[10px] font-bold text-slate-200 flex items-center gap-1 transition-all"
                          >
                            {copiedStatus === crew.id ? (
                              <>
                                <Check className="h-3 w-3 text-emerald-400" />
                                <span className="text-emerald-400">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                <span>Copy SMS</span>
                              </>
                            )}
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => {
                              alert(`Sms briefing successfully pushed to ${crew.name.split(" ")[0]}'s mobile terminal for tomorrow's run.`);
                            }}
                            className="px-2.5 py-1.5 bg-teal-600 hover:bg-teal-500 rounded text-[10px] font-bold text-slate-950 flex items-center gap-1 transition-all"
                          >
                            <Send className="h-3 w-3" />
                            <span>Dispatch</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </section>

        {/* RIGHT COLUMN: CALENDAR WEEKLY RUNS SCHEDULER GRID */}
        <section className="flex-1 flex flex-col overflow-x-auto min-w-[900px] bg-slate-900">
          
          {/* Legend and Active Tickets Guide */}
          <div className="bg-slate-950 px-6 py-2.5 border-b border-slate-800 flex justify-between items-center text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">Competency Key:</span>
              <div className="flex gap-2 font-semibold">
                <span className="px-1.5 py-0.5 bg-blue-900/60 text-blue-300 border border-blue-800 rounded text-[9px]">WAH: Heights</span>
                <span className="px-1.5 py-0.5 bg-cyan-900/60 text-cyan-300 border border-cyan-800 rounded text-[9px]">EWP: Elevating Platforms</span>
                <span className="px-1.5 py-0.5 bg-purple-900/60 text-purple-300 border border-purple-800 rounded text-[9px]">ROPE: Rope Access Facades</span>
                <span className="px-1.5 py-0.5 bg-amber-900/60 text-amber-300 border border-amber-800 rounded text-[9px]">CSE: Confined Spaces</span>
              </div>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded">
              <AlertTriangle className="h-3 w-3 text-yellow-500" />
              <span>Realtime safety validation active</span>
            </div>
          </div>

          {/* GRID WRAPPER */}
          <div className="flex-1 grid grid-cols-5 divide-x divide-slate-800 h-full overflow-y-auto">
            
            {/* EACH DAY OF WEEK COLUMN */}
            {DAYS.map(day => {
              const dayJobs = schedule.filter(job => job.day === day);
              const dayCostSum = getDayTotalCost(day);

              return (
                <div key={day} className="flex flex-col h-full bg-slate-900">
                  
                  {/* Day Header */}
                  <div className="p-3 bg-slate-950 border-b border-slate-800 sticky top-0 z-10 flex flex-col justify-between h-20">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-white text-xs">{day.toUpperCase()}</h3>
                      <span className="text-[9px] font-mono text-slate-400">WEEK 27</span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-900">
                      <span className="text-[10px] text-slate-400 font-medium">Daily Value</span>
                      <span className="text-xs font-bold text-teal-400">
                        ${dayCostSum.toLocaleString('en-AU', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* CREW LANES INSIDE THE DAY */}
                  <div className="flex-1 flex flex-col divide-y divide-slate-850 min-h-0">
                    {crews.map(crew => {
                      const crewJobs = dayJobs.filter(job => job.crewId === crew.id);

                      return (
                        <div
                          key={crew.id}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDropOnCell(e, day, crew.id)}
                          className="flex-1 min-h-[160px] p-2 bg-slate-900/40 hover:bg-slate-850/30 transition-colors flex flex-col relative group"
                        >
                          {/* Label Indicator for Crew */}
                          <div className="flex justify-between items-center mb-1.5 bg-slate-950/60 p-1.5 rounded border border-slate-800/40">
                            <span className="text-[10px] font-bold text-slate-300 truncate max-w-[120px]">
                              {crew.name.split(" ")[0]}
                            </span>
                            <div className="flex items-center gap-1 font-mono text-[9px] text-slate-400">
                              <span>${crewJobs.reduce((sum, j) => sum + j.cost, 0).toFixed(0)}</span>
                            </div>
                          </div>

                          {/* Crew dynamic ticket tags helper */}
                          <div className="flex flex-wrap gap-0.5 mb-2">
                            {crew.tickets.map(t => (
                              <span key={t} className="text-[7px] font-bold px-1 bg-slate-950 text-slate-400 rounded">
                                {t}
                              </span>
                            ))}
                          </div>

                          {/* LIST OF JOBS IN THIS SPECIFIC DAY + CREW CELL */}
                          <div className="flex-1 space-y-2 relative">
                            {crewJobs.length === 0 ? (
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/20 rounded border border-dashed border-slate-850 pointer-events-none">
                                <span className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">Drop Job Here</span>
                              </div>
                            ) : (
                              crewJobs.map(job => {
                                const hasConflict = checkTicketConflict(job, crew.id);

                                return (
                                  <div
                                    key={job.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, job.id, "calendar")}
                                    onClick={() => setSelectedJob(job)}
                                    className={`p-2 rounded border bg-slate-950 hover:bg-slate-900 cursor-grab active:cursor-grabbing hover:border-slate-500 shadow hover:shadow-lg transition-all group ${hasConflict ? 'border-rose-700/80 bg-rose-950/20' : 'border-slate-800'}`}
                                  >
                                    {/* Conflict Indicator block */}
                                    {hasConflict && (
                                      <div className="mb-1.5 px-1.5 py-0.5 bg-rose-950/80 border border-rose-900 rounded text-[8px] font-black text-rose-400 flex items-center gap-1 animate-pulse">
                                        <AlertTriangle className="h-3 w-3" />
                                        <span>SAFETY WARNING: Needs {job.requiredTicket}!</span>
                                      </div>
                                    )}

                                    {/* Color Run tag line */}
                                    <div className="flex items-center justify-between mb-1 gap-1">
                                      <div className="flex items-center gap-1 truncate max-w-[70%]">
                                        <span className={`w-1.5 h-1.5 rounded-full ${getRunStyle(job.run).dot}`}></span>
                                        <span className="text-[8px] font-extrabold uppercase text-slate-400 truncate">
                                          {job.run}
                                        </span>
                                      </div>
                                      <span className="text-[10px] font-extrabold text-white">
                                        ${job.cost.toFixed(0)}
                                      </span>
                                    </div>

                                    {/* Site Title */}
                                    <h5 className="text-[11px] font-bold text-slate-100 leading-tight line-clamp-2">
                                      {job.site}
                                    </h5>

                                    {/* Special flags inside cell */}
                                    <div className="mt-2 flex flex-wrap items-center gap-1">
                                      <span className={`text-[8px] font-extrabold px-1 rounded ${TICKETS[job.requiredTicket || "WAH"].color}`}>
                                        Req: {job.requiredTicket}
                                      </span>

                                      {job.ewpRequired && (
                                        <div className="flex items-center text-[7px] font-black text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-900">
                                          EWP
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              );
            })}

          </div>
        </section>

      </main>

      {/* JOB DETAIL EDITING MODAL */}
      {selectedJob && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-4 flex justify-between items-center text-white">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-white/20 px-2 py-0.5 rounded">
                  {selectedJob.status === "scheduled" ? "Allocated Task Details" : "Unscheduled Master Database"}
                </span>
                <h3 className="text-lg font-bold mt-1">{selectedJob.site}</h3>
              </div>
              <button 
                onClick={() => setSelectedJob(null)}
                className="text-white/80 hover:text-white bg-black/10 hover:bg-black/20 p-1.5 rounded-full transition-colors text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Site Name and Cost */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 font-medium uppercase tracking-wider block mb-1">Site / Facility Name</label>
                  <input 
                    type="text" 
                    value={selectedJob.site}
                    onChange={(e) => {
                      const updated = { ...selectedJob, site: e.target.value };
                      setSelectedJob(updated);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium uppercase tracking-wider block mb-1">Recertification Cost ($)</label>
                  <input 
                    type="number" 
                    value={selectedJob.cost}
                    onChange={(e) => {
                      const updated = { ...selectedJob, cost: parseFloat(e.target.value) || 0 };
                      setSelectedJob(updated);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Inspector Ticket Required selection */}
              <div>
                <label className="text-xs text-slate-400 font-medium uppercase tracking-wider block mb-1">Mandated Inspector Competency Ticket</label>
                <select 
                  value={selectedJob.requiredTicket || "WAH"}
                  onChange={(e) => {
                    const updated = { ...selectedJob, requiredTicket: e.target.value };
                    setSelectedJob(updated);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  {Object.values(TICKETS).map(t => (
                    <option key={t.code} value={t.code}>{t.name} ({t.code})</option>
                  ))}
                </select>
              </div>

              {/* Run Classification Selection */}
              <div>
                <label className="text-xs text-slate-400 font-medium uppercase tracking-wider block mb-1">Run Assignment Group</label>
                <select 
                  value={selectedJob.run}
                  onChange={(e) => {
                    const updated = { ...selectedJob, run: e.target.value };
                    setSelectedJob(updated);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  {Object.keys(RUN_STYLES).map(run => (
                    <option key={run} value={run}>{run}</option>
                  ))}
                </select>
              </div>

              {/* Special Site Instructions & Access Notes */}
              <div>
                <label className="text-xs text-slate-400 font-medium uppercase tracking-wider block mb-1">Special Site Access Instructions / Notes</label>
                <textarea 
                  rows={3}
                  value={selectedJob.notes}
                  onChange={(e) => {
                    const updated = { ...selectedJob, notes: e.target.value };
                    setSelectedJob(updated);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. key pickup, EWP booked, onsite contact name..."
                />
              </div>

              {/* Height Safety Requirements Checklist */}
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-850">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Height Safety Compliance Checklists</h4>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                    <input 
                      type="checkbox"
                      checked={selectedJob.ewpRequired}
                      onChange={(e) => {
                        const updated = { ...selectedJob, ewpRequired: e.target.checked };
                        setSelectedJob(updated);
                      }}
                      className="accent-emerald-500 h-4 w-4 bg-slate-900 border-slate-800 rounded"
                    />
                    <span>EWP Access Needed</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                    <input 
                      type="checkbox"
                      checked={selectedJob.tags.includes("Anchor Testing")}
                      onChange={(e) => {
                        const newTags = e.target.checked 
                          ? [...selectedJob.tags, "Anchor Testing"] 
                          : selectedJob.tags.filter(t => t !== "Anchor Testing");
                        setSelectedJob({ ...selectedJob, tags: newTags });
                      }}
                      className="accent-emerald-500 h-4 w-4 bg-slate-900 border-slate-800 rounded"
                    />
                    <span>Anchor point test cert</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                    <input 
                      type="checkbox"
                      checked={selectedJob.tags.includes("Static Line")}
                      onChange={(e) => {
                        const newTags = e.target.checked 
                          ? [...selectedJob.tags, "Static Line"] 
                          : selectedJob.tags.filter(t => t !== "Static Line");
                        setSelectedJob({ ...selectedJob, tags: newTags });
                      }}
                      className="accent-emerald-500 h-4 w-4 bg-slate-900 border-slate-800 rounded"
                    />
                    <span>Static Line Test cert</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                    <input 
                      type="checkbox"
                      checked={selectedJob.tags.includes("Load Tester")}
                      onChange={(e) => {
                        const newTags = e.target.checked 
                          ? [...selectedJob.tags, "Load Tester"] 
                          : selectedJob.tags.filter(t => t !== "Load Tester");
                        setSelectedJob({ ...selectedJob, tags: newTags });
                      }}
                      className="accent-emerald-500 h-4 w-4 bg-slate-900 border-slate-800 rounded"
                    />
                    <span>Load Tester Required</span>
                  </label>
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="bg-slate-950 p-4 border-t border-slate-800 flex justify-between gap-2">
              <button 
                type="button"
                onClick={() => deleteJob(selectedJob.id, selectedJob.status === "scheduled")}
                className="px-3 py-2 bg-rose-950/40 hover:bg-rose-950 border border-rose-900 text-rose-400 hover:text-rose-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Entry</span>
              </button>

              <div className="flex gap-2">
                {selectedJob.status === "scheduled" && (
                  <button 
                    type="button"
                    onClick={() => unscheduleJob(selectedJob.id)}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold rounded-lg transition-colors"
                  >
                    Send to Backlog
                  </button>
                )}
                <button 
                  type="button"
                  onClick={() => handleSaveJobEdit(selectedJob)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MANUALLY CREATE JOB MODAL */}
      <CreateJobModal 
        showModal={showCreateModal}
        setShowModal={setShowCreateModal}
        newJob={newJob}
        setNewJob={setNewJob}
        TICKETS={TICKETS}
        RUN_STYLES={RUN_STYLES}
        onCreateJob={handleCreateJob}
      />

      {/* JOB DETAIL MODAL */}
      <JobDetailModal
        selectedJob={selectedJob}
        setSelectedJob={setSelectedJob}
        TICKETS={TICKETS}
        onDelete={deleteJob}
        onUnschedule={unscheduleJob}
        onSaveEdit={handleSaveJobEdit}
      />

      {/* CREW MANAGEMENT MODAL */}
      <CrewManagementModal
        showModal={showCrewModal}
        setShowModal={setShowCrewModal}
        editingCrewId={editingCrewId}
        setEditingCrewId={setEditingCrewId}
        newCrew={newCrew}
        setNewCrew={setNewCrew}
        TICKETS={TICKETS}
        onAddCrew={handleAddCrew}
        onSaveEditCrew={handleSaveEditCrew}
      />

      {/* AI ROUTE OPTIMIZATION MODAL */}
      <RouteOptimizationModal
        showModal={showAIOptimizeModal}
        setShowModal={setShowAIOptimizeModal}
        optimizedSchedule={optimizedSchedule}
        crews={crews}
        TICKETS={TICKETS}
        onApply={applyOptimization}
      />

      {/* COMPLIANCE WARNING FOOTER PANEL */}
      <footer className="bg-slate-950 border-t border-slate-800 px-6 py-3 text-xs text-slate-400 flex flex-col md:flex-row justify-between items-center gap-2">
        <div className="flex items-center gap-2 text-[11px]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Automatic database validation active. Crews & Tickets registry is persistent.</span>
        </div>
        <div className="text-[11px] text-slate-500 text-center md:text-right">
          SafeMaster Heights Control System &copy; {new Date().getFullYear()}
        </div>
      </footer>

    </div>
  );
}