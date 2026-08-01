import React, { useState, useCallback, useEffect } from 'react';
import { useSchedulerApi } from './hooks/useSchedulerApi';
import { useRouteDirections } from './hooks/useRouteDirections';
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
  Map,
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
  Sparkles,
  Repeat,
  Mail,
  Share2,
  Tag,
  User,
  Settings,
  List
} from 'lucide-react';

// Import constants
import { 
  TICKETS, 
  DAYS, 
  RUN_STYLES,
  CREW_COLORS,
  INITIAL_BACKLOG,
  INITIAL_SCHEDULE,
  INITIAL_CREWS,
  MAX_DAILY_LOAD,
  RECURRING_FREQUENCY,
  AVAILABILITY_STATUS
} from './constants';

// Import utility functions
import {
  formatCurrency,
  formatCurrencyCompact,
  checkTicketConflict,
  isCrewQualified,
  getQualifiedCrews,
  calculateTotalCost,
  groupJobsByDay,
  groupJobsByCrew,
  groupJobsByCrewAndDay,
  escapeCsvValue,
  downloadCsv,
  copyToClipboard,
  debounce,
  sortByPriority,
  generateId,
  generateRecurringJobs,
  formatRecurringDescription,
  isRecurringJob,
  getParentJobId,
  generateICalContent,
  checkConflict,
  generateJobId,
  formatTime,
  timeToMinutes,
  minutesToTime,
  calculateDuration,
  formatDuration,
  getAvailableTimeSlots
} from './utils';

// Import components
import { ErrorBoundary } from './components/ErrorBoundary';
import { FullPageLoading } from './components/LoadingSkeleton';
import { GlobalBanner } from './components/GlobalBanner';
import { Header } from './components/Header';
import { MetricsBar } from './components/MetricsBar';
import { Sidebar } from './components/Sidebar';
import { BacklogPanel } from './components/BacklogPanel';
import { CrewsPanel } from './components/CrewsPanel';
import { NotificationsPanel } from './components/NotificationsPanel';
import { CrewManagementModal } from './components/CrewComponents';
import { CreateJobModal, JobDetailModal } from './components/JobModals';
import { RouteOptimizationModal } from './components/RouteOptimizationModal';
import ScheduleGrid from './components/ScheduleGrid';
import MapPreview from './components/MapPreview';

// Import new feature components
import { RecurringJobModal } from './components/RecurringJobModal';
import { TimeSlotSelector } from './components/TimeSlotSelector';
import { AvailabilityCalendar } from './components/AvailabilityCalendar';
import { ReminderSettings } from './components/ReminderSettings';
import { JobTemplateModal } from './components/JobTemplateModal';
import { ExportModal } from './components/ExportModal';

// Main App Component
export default function App() {
  // State from custom hook
  const { backlog, schedule, crews, loading, error, api } = useSchedulerApi(
    INITIAL_BACKLOG,
    INITIAL_SCHEDULE,
    INITIAL_CREWS
  );

  // UI State
  const [selectedJob, setSelectedJob] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRunFilter, setSelectedRunFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [showOnlyUnqualified, setShowOnlyUnqualified] = useState(false);
  const [selectedBacklogIds, setSelectedBacklogIds] = useState([]);
  const [bulkTargetDay, setBulkTargetDay] = useState("Monday");
  const [bulkTargetCrewId, setBulkTargetCrewId] = useState("");
  const [bulkFeedback, setBulkFeedback] = useState("");
  const [draggedJobId, setDraggedJobId] = useState(null);
  const [dragSource, setDragSource] = useState(null);
  const [leftActiveTab, setLeftActiveTab] = useState("backlog");
  const [briefingDay, setBriefingDay] = useState("Wednesday");
  const [copiedStatus, setCopiedStatus] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [csvInput, setCsvInput] = useState("");
  const [importFeedback, setImportFeedback] = useState("");
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
    lng: null,
    startTime: '09:00',
    endTime: '17:00',
    duration: 480
  });
  const [showCrewModal, setShowCrewModal] = useState(false);
  const [editingCrewId, setEditingCrewId] = useState(null);
  const [newCrew, setNewCrew] = useState({
    name: "",
    email: "",
    phone: "",
    baseLocation: "",
    notes: "",
    tickets: ["WAH"],
    workingHours: { start: '08:00', end: '17:00' },
    availability: {}
  });
  const [showAIOptimizeModal, setShowAIOptimizeModal] = useState(false);
  const [optimizedSchedule, setOptimizedSchedule] = useState(null);
  const [skippedJobs, setSkippedJobs] = useState([]);
  const [mainView, setMainView] = useState("schedule");
  const [mapFilterCrew, setMapFilterCrew] = useState("all");
  const [mapFilterDay, setMapFilterDay] = useState("Monday");

  // New feature states
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
  const [showAvailabilityCalendar, setShowAvailabilityCalendar] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCrewForTime, setSelectedCrewForTime] = useState(null);
  const [jobTemplates, setJobTemplates] = useState([]);

  // Initialize
  useEffect(() => {
    if (!bulkTargetCrewId && crews.length > 0) {
      setBulkTargetCrewId(crews[0].id);
    }
    
    // Load templates from localStorage
    const savedTemplates = localStorage.getItem('safemaster-templates');
    if (savedTemplates) {
      try {
        setJobTemplates(JSON.parse(savedTemplates));
      } catch (e) {
        console.error('Error loading templates:', e);
      }
    }
  }, [bulkTargetCrewId, crews]);

  // Save templates to localStorage
  useEffect(() => {
    if (jobTemplates.length > 0) {
      localStorage.setItem('safemaster-templates', JSON.stringify(jobTemplates));
    }
  }, [jobTemplates]);

  // Driving directions for selected crew/day route
  const routeWaypoints = mapFilterCrew !== "all"
    ? schedule
        .filter(j => j.crewId === mapFilterCrew && j.day === mapFilterDay && j.lat && j.lng)
        .map(j => ({ lat: j.lat, lng: j.lng }))
    : [];
  const { routeData, loading: routeLoading, error: routeError } = useRouteDirections(
    routeWaypoints.length >= 2 ? routeWaypoints : null
  );

  // Calculate statistics
  const totalWeeklyValue = calculateTotalCost(schedule);
  const backlogValue = calculateTotalCost(backlog);
  const totalScheduledJobs = schedule.length;
  const totalEwpJobs = schedule.filter(j => j.ewpRequired).length;
  const openBacklogJobs = backlog.filter(job => job.status === 'backlog').length;
  const highPriorityBacklog = backlog.filter(job => job.priority === 'high').length;
const unqualifiedBacklog = backlog.filter(job => {
    const required = job.ewpRequired ? "EWP" : (job.requiredTicket || "WAH");
    return !crews.some(crew => crew.tickets.includes(required));
  }).length;
  const dayBriefingJobs = schedule.filter(job => job.day === briefingDay);
  const dayBriefingValue = calculateTotalCost(dayBriefingJobs);

  // Check if a crew is qualified for a job
  const hasQualifiedCrew = useCallback((job) => {
    return crews.some(crew => crew.tickets.includes(job.requiredTicket));
  }, [crews]);

  // Filter backlog items
  const filteredBacklog = backlog.filter(job => {
    const matchesSearch = job.site.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          job.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          job.run.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRun = selectedRunFilter === "ALL" || job.run === selectedRunFilter;
    const matchesPriority = priorityFilter === "ALL" || job.priority === priorityFilter;
    const matchesQualification = !showOnlyUnqualified || !hasQualifiedCrew(job);
    return matchesSearch && matchesRun && matchesPriority && matchesQualification;
  });

  // Get day total cost
  const getDayTotalCost = useCallback((day) => {
    return schedule
      .filter(job => job.day === day)
      .reduce((sum, job) => sum + Number(job.cost || 0), 0);
  }, [schedule]);

  // Get run style
  const getRunStyle = useCallback((runName) => {
    return RUN_STYLES[runName] || { bg: "bg-gray-100 text-gray-800 border-gray-300", dot: "bg-gray-500" };
  }, []);

  // Crew Management Handlers
  const handleAddCrew = useCallback(() => {
    if (!newCrew.name || !newCrew.email) {
      alert("Please fill in name and email");
      return;
    }
    const newCrewId = `crew-${Date.now()}`;
    const colorIndex = crews.length % CREW_COLORS.length;
    const createdCrew = {
      id: newCrewId,
      ...newCrew,
      color: CREW_COLORS[colorIndex],
      workingHours: newCrew.workingHours || { start: '08:00', end: '17:00' },
      availability: newCrew.availability || {}
    };
    api.addCrew(createdCrew);
    setNewCrew({ name: "", email: "", phone: "", baseLocation: "", notes: "", tickets: ["WAH"], workingHours: { start: '08:00', end: '17:00' }, availability: {} });
    setShowCrewModal(false);
    alert(`${newCrew.name} added successfully!`);
  }, [newCrew, crews.length, api]);

  const handleEditCrew = useCallback((crewId) => {
    const crew = crews.find(c => c.id === crewId);
    if (crew) {
      setNewCrew({ 
        ...crew,
        workingHours: crew.workingHours || { start: '08:00', end: '17:00' },
        availability: crew.availability || {}
      });
      setEditingCrewId(crewId);
      setShowCrewModal(true);
    }
  }, [crews]);

  const handleSaveEditCrew = useCallback(() => {
    if (!newCrew.name || !newCrew.email) {
      alert("Please fill in name and email");
      return;
    }
    const existingCrew = crews.find(c => c.id === editingCrewId);
    const updatedCrew = { 
      ...newCrew, 
      id: editingCrewId, 
      color: existingCrew?.color ?? newCrew.color,
      workingHours: newCrew.workingHours || existingCrew?.workingHours || { start: '08:00', end: '17:00' },
      availability: newCrew.availability || existingCrew?.availability || {}
    };
    api.updateCrew(updatedCrew);
    setNewCrew({ name: "", email: "", phone: "", baseLocation: "", notes: "", tickets: ["WAH"], workingHours: { start: '08:00', end: '17:00' }, availability: {} });
    setEditingCrewId(null);
    setShowCrewModal(false);
    alert("Crew updated successfully!");
  }, [newCrew, editingCrewId, crews, api]);

  const handleDeleteCrew = useCallback((crewId) => {
    if (confirm("Are you sure? This will unassign all their scheduled jobs and return them to the backlog.")) {
      api.unscheduleCrewJobs(crewId);
      api.removeCrew(crewId);
      alert("Crew removed. Their jobs have been returned to the backlog.");
    }
  }, [api]);

  // Toggle crew ticket
  const handleToggleCrewTicket = useCallback((crewId, ticketCode) => {
    const crew = crews.find(c => c.id === crewId);
    if (!crew) return;
    const hasIt = crew.tickets.includes(ticketCode);
    const updatedTickets = hasIt
      ? crew.tickets.filter(t => t !== ticketCode)
      : [...crew.tickets, ticketCode];
    api.updateCrewTickets(crewId, updatedTickets);
  }, [crews, api]);

  // Route Optimization (Local Heuristic)
  const optimizeRoutes = useCallback(() => {
    const unscheduledJobs = backlog.filter(j => j.status === "backlog");
    if (unscheduledJobs.length === 0) {
      alert("No unscheduled jobs to optimize");
      return;
    }

    const sortedJobs = sortByPriority([...unscheduledJobs]);

    const assignments = [];
    const skipped = [];
    const dayCrewMap = {};

    sortedJobs.forEach(job => {
      const qualifiedCrews = getQualifiedCrews(job, crews);
      if (qualifiedCrews.length === 0) {
        skipped.push(job);
        return;
      }

      let bestCrewDay = null;
      let minLoad = Infinity;

      DAYS.forEach(day => {
        qualifiedCrews.forEach(crew => {
          const key = `${day}-${crew.id}`;
          const currentLoad = dayCrewMap[key] || 0;
          const dayScheduled = schedule.filter(j => j.day === day && j.crewId === crew.id)
            .reduce((s, j) => s + j.cost, 0);
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
    setSkippedJobs(skipped);
    setShowAIOptimizeModal(true);
  }, [backlog, crews, schedule]);

  const applyOptimization = useCallback(() => {
    if (optimizedSchedule) {
      api.applyBulkSchedule(optimizedSchedule);
      setShowAIOptimizeModal(false);
      setOptimizedSchedule(null);
      setSkippedJobs([]);
      alert("Optimized route assignments applied!");
    }
  }, [optimizedSchedule, api]);

  // Drag and Drop Logic
  const handleDragStart = useCallback((e, jobId, source) => {
    setDraggedJobId(jobId);
    setDragSource(source);
    e.dataTransfer.setData("text/plain", jobId);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDropOnCell = useCallback((e, day, crewId) => {
    e.preventDefault();
    if (!draggedJobId) return;

    const job = dragSource === "backlog"
      ? backlog.find(j => j.id === draggedJobId)
      : schedule.find(j => j.id === draggedJobId);

    if (job && checkTicketConflict(job, crewId, crews)) {
      const crew = crews.find(c => c.id === crewId);
      const ticketName = TICKETS[job.requiredTicket]?.name || job.requiredTicket;
      if (!confirm(`SAFETY WARNING: ${crew?.name || 'This crew'} does not hold the required ${ticketName} ticket.\n\nAssign anyway? (Not recommended for compliance)`)) {
        setDraggedJobId(null);
        setDragSource(null);
        return;
      }
    }

    if (dragSource === "backlog") {
      if (backlog.find(j => j.id === draggedJobId)) {
        api.scheduleJob(draggedJobId, day, crewId);
      }
    } else if (dragSource === "calendar") {
      api.reassignJob(draggedJobId, day, crewId);
    }

    setDraggedJobId(null);
    setDragSource(null);
  }, [draggedJobId, dragSource, backlog, schedule, crews, api]);

  const handleDropOnBacklog = useCallback((e) => {
    e.preventDefault();
    if (!draggedJobId) return;

    if (dragSource === "calendar") {
      if (schedule.find(j => j.id === draggedJobId)) {
        api.unscheduleJob(draggedJobId);
      }
    }
    setDraggedJobId(null);
    setDragSource(null);
  }, [draggedJobId, dragSource, schedule, api]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  // Job handlers
  const handleSaveJobEdit = useCallback((updatedJob) => {
    if (updatedJob.status === "scheduled") {
      api.updateScheduledJob(updatedJob);
    } else {
      api.updateBacklogJob(updatedJob);
    }
    setSelectedJob(null);
  }, [api]);

  const unscheduleJob = useCallback((jobId) => {
    api.unscheduleJob(jobId);
    setSelectedJob(null);
  }, [api]);

  const deleteJob = useCallback((jobId, isScheduled) => {
    if (isScheduled) {
      api.removeFromSchedule(jobId);
    } else {
      api.removeFromBacklog(jobId);
    }
    setSelectedJob(null);
  }, [api]);

  // CSV/Excel Import
  const handleImportCSV = useCallback(() => {
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
          status: "backlog",
          startTime: '09:00',
          endTime: '17:00',
          duration: 480
        });
        addedCount++;
      }
    });

    if (newJobsParsed.length > 0) {
      api.importJobs(newJobsParsed);
      setImportFeedback(`Successfully imported ${addedCount} height safety tasks!`);
      setCsvInput("");
      setTimeout(() => {
        setShowImportModal(false);
        setImportFeedback("");
      }, 1500);
    } else {
      setImportFeedback("No valid data rows found. Check column arrangement.");
    }
  }, [csvInput, api]);

  const loadMockExcelSheet = useCallback(() => {
    const samplePaste = `Mandurah Retail complex\t1920.00\tPROGRAMMED\tEWP Booked. Operates high outreach anchor test.\nSt Georges Roof Descents\t3400.00\tHIGH PRIORITY/CRITICAL\tIRATA Level 2 setup needed. Rope descent lines on external facade.\nSubiaco Sewer Intake\t1150.00\tLIGHT DUTIES\tConfined space cert on static intake bracket.\nHarvey Primary Pavilion\t880.00\tPROGRAMMED SOR SCHOOLS\tBasic ladder climb anchor test.\nEaton Community Centre\t1560.00\tSOUTHWEST RUN\tSM4419. EWP required to reach roof ladder.`;
    setCsvInput(samplePaste);
  }, []);

  // Generate Night-Before Notification draft for a specific Crew & Day
  const generateBriefingSMS = useCallback((crew, day) => {
    const dayJobs = schedule.filter(j => j.day === day && j.crewId === crew.id);
    if (dayJobs.length === 0) {
      return `Hi ${crew.name.split(" ")[0]}, no jobs scheduled for you on ${day}. Enjoy your day off! - SafeMaster`;
    }

    let sms = `📧 SafeMaster Height Safety Briefing - ${day.toUpperCase()}\n-------------------------\nHi ${crew.name.split(" ")[0]},\n`;
    sms += `You have ${dayJobs.length} site recertifications tomorrow:\n\n`;

    dayJobs.forEach((job, idx) => {
      sms += `${idx + 1}. SITE: ${job.site}\n`;
      sms += `   💰 VALUE: ${formatCurrency(job.cost)}\n`;
      sms += `   🔐 TICKET REQUIRED: ${TICKETS[job.requiredTicket || "WAH"]?.name || job.requiredTicket}\n`;
      if (job.ewpRequired) sms += `   ⚠️ ACCESS: EWP Access platform booked for site!\n`;
      if (job.notes) sms += `   📝 INST: ${job.notes}\n`;
      sms += `\n`;
    });

    sms += `Make sure your vehicles are pre-loaded with appropriate calibrators, anchor testers, and PPE. Reply to dispatch if there are access or ticket issues.`;
    return sms;
  }, [schedule, TICKETS]);

  // Copy helper
  const handleCopyText = useCallback(async (text, crewId) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedStatus(crewId);
      setTimeout(() => setCopiedStatus(null), 2000);
    }
  }, []);

  // Export handlers
  const handleExportBacklogCsv = useCallback(() => {
    const rows = backlog.map(job => ({
      id: job.id,
      site: job.site,
      cost: job.cost,
      run: job.run,
      priority: job.priority,
      requiredTicket: job.requiredTicket,
      ewpRequired: job.ewpRequired ? 'yes' : 'no',
      notes: job.notes,
      tags: (job.tags || []).join('|'),
      lat: job.lat ?? '',
      lng: job.lng ?? '',
      status: job.status
    }));
    downloadCsv(`safemaster-backlog-${new Date().toISOString().slice(0, 10)}.csv`, rows);
  }, [backlog]);

  const handleExportScheduleCsv = useCallback(() => {
    const rows = schedule.map(job => ({
      id: job.id,
      site: job.site,
      cost: job.cost,
      day: job.day || '',
      crewId: job.crewId || '',
      run: job.run,
      priority: job.priority,
      requiredTicket: job.requiredTicket,
      ewpRequired: job.ewpRequired ? 'yes' : 'no',
      notes: job.notes,
      tags: (job.tags || []).join('|'),
      lat: job.lat ?? '',
      lng: job.lng ?? '',
      status: job.status,
      startTime: job.startTime || '',
      endTime: job.endTime || '',
      duration: job.duration || ''
    }));
    downloadCsv(`safemaster-schedule-${new Date().toISOString().slice(0, 10)}.csv`, rows);
  }, [schedule]);

  // Bulk assignment handlers
  const handleToggleBacklogSelection = useCallback((jobId) => {
    setSelectedBacklogIds(prev => prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]);
  }, []);

  const handleSelectVisibleBacklog = useCallback(() => {
    setSelectedBacklogIds(filteredBacklog.map(job => job.id));
    setBulkFeedback(`Selected ${filteredBacklog.length} visible backlog items.`);
  }, [filteredBacklog]);

  const handleClearBacklogSelection = useCallback(() => {
    setSelectedBacklogIds([]);
    setBulkFeedback('Selection cleared.');
  }, []);

  const handleBulkAssignBacklog = useCallback(async () => {
    if (selectedBacklogIds.length === 0) {
      setBulkFeedback('Select at least one backlog item to assign.');
      return;
    }

    const targetCrew = crews.find(crew => crew.id === bulkTargetCrewId);
    if (!targetCrew) {
      setBulkFeedback('Choose a valid crew before bulk assigning.');
      return;
    }

    const selectedJobs = backlog.filter(job => selectedBacklogIds.includes(job.id));
    let assignedCount = 0;
    let skippedCount = 0;

    for (const job of selectedJobs) {
      if (checkTicketConflict(job, bulkTargetCrewId, crews)) {
        skippedCount += 1;
        continue;
      }
      await api.scheduleJob(job.id, bulkTargetDay, bulkTargetCrewId);
      assignedCount += 1;
    }

    setSelectedBacklogIds([]);
    setBulkFeedback(`${assignedCount} jobs assigned to ${targetCrew.name} on ${bulkTargetDay}. ${skippedCount} skipped due to ticket mismatch.`);
  }, [selectedBacklogIds, bulkTargetCrewId, bulkTargetDay, backlog, crews, api]);

  // Create job handler
  const handleCreateJob = useCallback((e) => {
    e.preventDefault();
    if (!newJob.site) return;

    const formattedJob = {
      ...newJob,
      id: `manual-${Date.now()}`,
      cost: parseFloat(newJob.cost) || 0,
      status: "backlog",
      tags: newJob.ewpRequired ? ["EWP Hire", ...newJob.tags] : newJob.tags
    };

    api.addJobToBacklog(formattedJob);
    setShowCreateModal(false);
    setNewJob({
      site: "",
      cost: "",
      run: "SOUTHWEST RUN",
      notes: "",
      tags: [],
      ewpRequired: false,
      requiredTicket: "WAH",
      priority: "normal",
      startTime: '09:00',
      endTime: '17:00',
      duration: 480
    });
  }, [newJob, api]);

  // New feature handlers
  const handleOpenRecurringModal = useCallback((job = null) => {
    setNewJob(job || {
      site: "",
      cost: "",
      run: "SOUTHWEST RUN",
      notes: "",
      tags: [],
      ewpRequired: false,
      requiredTicket: "WAH",
      priority: "normal",
      startTime: '09:00',
      endTime: '17:00',
      duration: 480
    });
    setShowRecurringModal(true);
  }, []);

  const handleSaveRecurringJob = useCallback((jobWithRecurring) => {
    if (jobWithRecurring.recurring) {
      // Generate recurring instances
      const instances = generateRecurringJobs(jobWithRecurring);
      // For now, just save the first instance with recurring info
      // In production, you'd save all instances
      const jobToSave = {
        ...jobWithRecurring,
        id: jobWithRecurring.id || generateJobId('job'),
        isRecurring: true,
        parentJobId: jobWithRecurring.id
      };
      api.addJobToBacklog(jobToSave);
      alert(`Recurring job saved! ${instances.length} instances would be generated.`);
    } else {
      api.addJobToBacklog(jobWithRecurring);
    }
    setShowRecurringModal(false);
    setNewJob({
      site: "",
      cost: "",
      run: "SOUTHWEST RUN",
      notes: "",
      tags: [],
      ewpRequired: false,
      requiredTicket: "WAH",
      priority: "normal",
      startTime: '09:00',
      endTime: '17:00',
      duration: 480
    });
  }, [api]);

  const handleOpenTimeSlotModal = useCallback((crew, date) => {
    setSelectedCrewForTime(crew);
    setSelectedDate(date);
    setShowTimeSlotModal(true);
  }, []);

  const handleTimeSelect = useCallback((time) => {
    setNewJob(prev => ({ ...prev, ...time }));
    setShowTimeSlotModal(false);
  }, []);

  const handleOpenAvailabilityCalendar = useCallback(() => {
    setShowAvailabilityCalendar(true);
  }, []);

  const handleAvailabilityChange = useCallback((crewId, date, status) => {
    api.updateCrew({ 
      id: crewId,
      availability: {
        ...crews.find(c => c.id === crewId)?.availability,
        [date]: status
      }
    });
    alert(`Availability set to ${status} for ${crews.find(c => c.id === crewId)?.name} on ${new Date(date).toLocaleDateString()}`);
  }, [crews, api]);

  const handleOpenReminderModal = useCallback((job) => {
    setSelectedJob(job);
    setShowReminderModal(true);
  }, []);

  const handleSaveWithReminders = useCallback((jobWithReminders) => {
    if (jobWithReminders.status === "scheduled") {
      api.updateScheduledJob(jobWithReminders);
    } else {
      api.updateBacklogJob(jobWithReminders);
    }
    setSelectedJob(null);
    setShowReminderModal(false);
    alert('Reminders saved successfully!');
  }, [api]);

  const handleOpenTemplateModal = useCallback(() => {
    setShowTemplateModal(true);
  }, []);

  const handleSaveTemplate = useCallback((template) => {
    setJobTemplates(prev => {
      const existingIndex = prev.findIndex(t => t.id === template.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = template;
        return updated;
      }
      return [...prev, template];
    });
    alert(`Template "${template.name}" saved successfully!`);
  }, []);

  const handleDeleteTemplate = useCallback((templateId) => {
    setJobTemplates(prev => prev.filter(t => t.id !== templateId));
    alert('Template deleted successfully!');
  }, []);

  const handleUseTemplate = useCallback((template) => {
    setNewJob({
      ...template,
      id: undefined,
      status: 'backlog'
    });
    setShowCreateModal(true);
  }, []);

  const handleOpenExportModal = useCallback(() => {
    setShowExportModal(true);
  }, []);

  // Loading state
  if (loading) {
    return <FullPageLoading message="Loading SafeMaster Scheduler..." />;
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center flex-col gap-4 p-6">
        <div className="p-3 bg-rose-600 rounded-xl shadow-md">
          <AlertTriangle className="h-8 w-8 text-white stroke-[2.5]" />
        </div>
        <div className="text-center max-w-md">
          <p className="text-base font-bold text-rose-400 mb-1">Database connection failed</p>
          <p className="text-xs text-slate-400 leading-relaxed">
            SafeMaster Scheduler could not reach its database. Your data has not been loaded and
            changes cannot be saved. Please check that the API server is running and the database
            is reachable, then reload the page.
          </p>
          <pre className="mt-3 text-[10px] bg-slate-800 text-rose-300 rounded-lg p-3 text-left overflow-auto max-h-28">
            {error}
          </pre>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm font-semibold text-slate-200 transition-all"
        >
          Reload page
        </button>
      </div>
    );
  }

  // Render main application
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-slate-900">
        
        {/* Global Banner */}
        <GlobalBanner crews={crews} activeTab={leftActiveTab} />

        {/* Header */}
        <Header
          totalWeeklyValue={totalWeeklyValue}
          backlogValue={backlogValue}
          totalScheduledJobs={totalScheduledJobs}
          totalEwpJobs={totalEwpJobs}
          mainView={mainView}
          setMainView={setMainView}
          onExportSchedule={handleOpenExportModal}
          onExportBacklog={handleExportBacklogCsv}
          onImport={() => setShowImportModal(true)}
          onCreateJob={() => setShowCreateModal(true)}
        />

        {/* Metrics Bar */}
        <MetricsBar
          openBacklogJobs={openBacklogJobs}
          highPriorityBacklog={highPriorityBacklog}
          unqualifiedBacklog={unqualifiedBacklog}
          briefingDay={briefingDay}
          dayBriefingJobs={dayBriefingJobs}
          dayBriefingValue={dayBriefingValue}
        />

        {/* Main Container */}
        <main className="flex-1 flex flex-col xl:flex-row overflow-hidden gap-0">
          
          {/* Sidebar with Tabs */}
          <Sidebar
            leftActiveTab={leftActiveTab}
            setLeftActiveTab={setLeftActiveTab}
            filteredBacklog={filteredBacklog}
            schedule={schedule}
          />

          {/* Tab Content */}
          <div className="flex-1 flex flex-col overflow-hidden border-r border-slate-800/60">
            {leftActiveTab === "backlog" && (
              <BacklogPanel
                backlog={backlog}
                filteredBacklog={filteredBacklog}
                crews={crews}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedRunFilter={selectedRunFilter}
                setSelectedRunFilter={setSelectedRunFilter}
                priorityFilter={priorityFilter}
                setPriorityFilter={setPriorityFilter}
                showOnlyUnqualified={showOnlyUnqualified}
                setShowOnlyUnqualified={setShowOnlyUnqualified}
                selectedBacklogIds={selectedBacklogIds}
                setSelectedBacklogIds={setSelectedBacklogIds}
                bulkTargetDay={bulkTargetDay}
                setBulkTargetDay={setBulkTargetDay}
                bulkTargetCrewId={bulkTargetCrewId}
                setBulkTargetCrewId={setBulkTargetCrewId}
                bulkFeedback={bulkFeedback}
                setBulkFeedback={setBulkFeedback}
                hasQualifiedCrew={hasQualifiedCrew}
                checkTicketConflict={(job, crewId) => checkTicketConflict(job, crewId, crews)}
                handleBulkAssignBacklog={handleBulkAssignBacklog}
                handleSelectVisibleBacklog={handleSelectVisibleBacklog}
                handleClearBacklogSelection={handleClearBacklogSelection}
                handleToggleBacklogSelection={handleToggleBacklogSelection}
                onDragStart={handleDragStart}
                onDropOnBacklog={handleDropOnBacklog}
                onDragOver={handleDragOver}
              />
            )}

            {leftActiveTab === "crews" && (
              <CrewsPanel
                crews={crews}
                showCrewModal={showCrewModal}
                setShowCrewModal={setShowCrewModal}
                editingCrewId={editingCrewId}
                setEditingCrewId={setEditingCrewId}
                newCrew={newCrew}
                setNewCrew={setNewCrew}
                crewColors={CREW_COLORS}
                onAddCrew={handleAddCrew}
                onEditCrew={handleEditCrew}
                onDeleteCrew={handleDeleteCrew}
                onToggleCrewTicket={handleToggleCrewTicket}
                onOptimizeRoutes={optimizeRoutes}
              />
            )}

            {leftActiveTab === "notifications" && (
              <NotificationsPanel
                crews={crews}
                schedule={schedule}
                briefingDay={briefingDay}
                setBriefingDay={setBriefingDay}
                copiedStatus={copiedStatus}
                setCopiedStatus={setCopiedStatus}
              />
            )}
          </div>

          {/* Main View Area (Schedule or Map) */}
          <div className="flex-1 flex flex-col overflow-hidden xl:col-span-2 bg-slate-900/40">
            {mainView === "schedule" ? (
<ScheduleGrid
                days={DAYS}
                crews={crews}
                schedule={schedule}
                TICKETS={TICKETS}
                onSelectJob={setSelectedJob}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDropOnCell={handleDropOnCell}
                checkTicketConflict={(job, crewId) => checkTicketConflict(job, crewId, crews)}
                getDayTotalCost={getDayTotalCost}
                getRunStyle={getRunStyle}
                DAYS={DAYS}
                onJobDoubleClick={(job) => handleOpenReminderModal(job)}
              />
            ) : (
              <MapPreview
                schedule={schedule}
                crews={crews}
                mapFilterCrew={mapFilterCrew}
                setMapFilterCrew={setMapFilterCrew}
                mapFilterDay={mapFilterDay}
                setMapFilterDay={setMapFilterDay}
                routeData={routeData}
                routeLoading={routeLoading}
                routeError={routeError}
                DAYS={DAYS}
              />
            )}
          </div>
        </main>

        {/* Modals */}
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

<CreateJobModal
          showModal={showCreateModal}
          setShowModal={setShowCreateModal}
          newJob={newJob}
          setNewJob={setNewJob}
          TICKETS={TICKETS}
          RUN_STYLES={RUN_STYLES}
          crews={crews}
          onOpenRecurring={() => handleOpenRecurringModal(newJob)}
          onOpenTimeSlot={() => handleOpenTimeSlotModal(crews[0], new Date().toISOString().split('T')[0])}
          templates={jobTemplates}
          onUseTemplate={handleUseTemplate}
          onCreateJob={handleCreateJob}
        />

<JobDetailModal
          selectedJob={selectedJob}
          setSelectedJob={setSelectedJob}
          TICKETS={TICKETS}
          RUN_STYLES={RUN_STYLES}
          onOpenReminder={() => handleOpenReminderModal(selectedJob)}
          onDelete={deleteJob}
          onUnschedule={unscheduleJob}
          onSaveEdit={handleSaveJobEdit}
        />

        <RouteOptimizationModal
          showModal={showAIOptimizeModal}
          setShowModal={setShowAIOptimizeModal}
          optimizedSchedule={optimizedSchedule}
          skippedJobs={skippedJobs}
          crews={crews}
          TICKETS={TICKETS}
          onApply={applyOptimization}
        />

        {/* New Feature Modals */}
        <RecurringJobModal
          showModal={showRecurringModal}
          setShowModal={setShowRecurringModal}
          job={newJob}
          onSave={handleSaveRecurringJob}
          crews={crews}
          TICKETS={TICKETS}
        />

        <TimeSlotSelector
          showModal={showTimeSlotModal}
          setShowModal={setShowTimeSlotModal}
          crew={selectedCrewForTime}
          date={selectedDate}
          existingJobs={schedule}
          onSelect={handleTimeSelect}
        />

        <AvailabilityCalendar
          showModal={showAvailabilityCalendar}
          setShowModal={setShowAvailabilityCalendar}
          crews={crews}
          schedule={schedule}
          onAvailabilityChange={handleAvailabilityChange}
        />

        <ReminderSettings
          showModal={showReminderModal}
          setShowModal={setShowReminderModal}
          job={selectedJob}
          onSave={handleSaveWithReminders}
          crews={crews}
        />

        <JobTemplateModal
          showModal={showTemplateModal}
          setShowModal={setShowTemplateModal}
          templates={jobTemplates}
          onSave={handleSaveTemplate}
          onDelete={handleDeleteTemplate}
          crews={crews}
        />

        <ExportModal
          showModal={showExportModal}
          setShowModal={setShowExportModal}
          jobs={schedule}
          crews={crews}
          schedule={schedule}
        />

        {/* Import Modal */}
        {showImportModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in-50">
            <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden">
              <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
                <h3 className="font-bold text-white text-sm uppercase tracking-wider">Import from Excel / CSV</h3>
                <button 
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-[12px] text-slate-400">
                  Paste your Excel columns below. The importer will automatically detect site names, costs, runs, and ticket requirements.
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={loadMockExcelSheet}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-semibold rounded-lg text-slate-200 transition-all"
                  >
                    Load sample data
                  </button>
                </div>

                <textarea
                  value={csvInput}
                  onChange={(e) => setCsvInput(e.target.value)}
                  placeholder="Paste Excel columns here..."
                  className="w-full h-40 bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-100 font-mono focus:outline-none focus:border-teal-500 resize-none"
                />

                {importFeedback && (
                  <p className={`text-xs ${importFeedback.includes('Successfully') ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {importFeedback}
                  </p>
                )}

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowImportModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-sm font-semibold rounded-lg text-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleImportCSV}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold rounded-lg transition-all"
                  >
                    Import Jobs
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
