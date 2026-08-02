import { useState, useEffect, useCallback, useRef } from 'react';

const STORAGE_KEY = 'safemaster-scheduler-state-v1';

function readPersistedState() {
  if (typeof window === 'undefined') return null;
  try {
   const raw = window.localStorage.getItem(STORAGE_KEY);
   return raw ? JSON.parse(raw) : null;
  } catch (error) {
   console.warn('Unable to read scheduler persistence', error);
   return null;
  }
}

/**
 * Fetches all scheduler data from the API and seeds defaults if empty.
 * Returns { backlog, schedule, crews, loading, error, api }
 * where `api` exposes granular mutation helpers.
 */
export function useSchedulerApi(initialBacklog, initialSchedule, initialCrews) {
  const [backlog, setBacklogState] = useState(() => {
    const persisted = readPersistedState();
    return persisted?.backlog ?? [];
  });
  const [schedule, setScheduleState] = useState(() => {
    const persisted = readPersistedState();
    return persisted?.schedule ?? [];
  });
  const [crews, setCrewsState] = useState(() => {
    const persisted = readPersistedState();
    return persisted?.crews ?? [];
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const seeded = useRef(false);

  const writePersistedState = useCallback((nextBacklog, nextSchedule, nextCrews) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
        backlog: nextBacklog,
        schedule: nextSchedule,
        crews: nextCrews,
        savedAt: new Date().toISOString(),
      }));
    } catch (error) {
      console.warn('Unable to persist scheduler state', error);
    }
  }, []);

  useEffect(() => {
    if (loading) return;
    writePersistedState(backlog, schedule, crews);
  }, [backlog, schedule, crews, loading, writePersistedState]);

  // ── Initial load ───────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      const persisted = readPersistedState();
      try {
        const [jobsRes, schedRes, crewsRes] = await Promise.all([
          fetch('/api/jobs'),
          fetch('/api/schedule'),
          fetch('/api/crews'),
        ]);
        if (!jobsRes.ok || !schedRes.ok || !crewsRes.ok) {
          if (persisted) {
            setBacklogState(persisted.backlog ?? []);
            setScheduleState(persisted.schedule ?? []);
            setCrewsState(persisted.crews ?? []);
            setError(null);
            return;
          }
          throw new Error('API fetch failed');
        }
        const [jobs, sched, crewList] = await Promise.all([
          jobsRes.json(),
          schedRes.json(),
          crewsRes.json(),
        ]);

        // Seed defaults on first ever load (empty DB)
        if (!seeded.current && jobs.length === 0 && sched.length === 0 && crewList.length === 0) {
          seeded.current = true;
          await Promise.all([
            fetch('/api/jobs/bulk', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ jobs: initialBacklog }),
            }),
            fetch('/api/jobs/bulk', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ jobs: initialSchedule }),
            }),
            fetch('/api/crews/bulk', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ crews: initialCrews }),
            }),
          ]);
          setBacklogState(initialBacklog);
          setScheduleState(initialSchedule);
          setCrewsState(initialCrews);
        } else {
          setBacklogState(jobs);
          setScheduleState(sched);
          setCrewsState(crewList);
        }
      } catch (err) {
        console.error('API load failed:', err);
        if (persisted) {
          setBacklogState(persisted.backlog ?? []);
          setScheduleState(persisted.schedule ?? []);
          setCrewsState(persisted.crews ?? []);
          setError(null);
        } else {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Backlog mutations ──────────────────────────────────────────────────────

  const addJobToBacklog = useCallback(async (job) => {
    setBacklogState(prev => [job, ...prev]);
    await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(job),
    }).catch(console.error);
  }, []);

  const updateBacklogJob = useCallback(async (updatedJob) => {
    setBacklogState(prev => prev.map(j => j.id === updatedJob.id ? updatedJob : j));
    await fetch(`/api/jobs/${updatedJob.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedJob),
    }).catch(console.error);
  }, []);

  const removeFromBacklog = useCallback(async (jobId) => {
    setBacklogState(prev => prev.filter(j => j.id !== jobId));
    await fetch(`/api/jobs/${jobId}`, { method: 'DELETE' }).catch(console.error);
  }, []);

  // ── Schedule mutations ────────────────────────────────────────────────────

  const addJobToSchedule = useCallback(async (job) => {
    setScheduleState(prev => [...prev, job]);
    await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(job),
    }).catch(console.error);
  }, []);

  const updateScheduledJob = useCallback(async (updatedJob) => {
    setScheduleState(prev => prev.map(j => j.id === updatedJob.id ? updatedJob : j));
    await fetch(`/api/jobs/${updatedJob.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedJob),
    }).catch(console.error);
  }, []);

  const removeFromSchedule = useCallback(async (jobId) => {
    setScheduleState(prev => prev.filter(j => j.id !== jobId));
    await fetch(`/api/jobs/${jobId}`, { method: 'DELETE' }).catch(console.error);
  }, []);

  // ── Cross-collection moves ─────────────────────────────────────────────────

  /** Move a job from backlog → schedule */
  const scheduleJob = useCallback(async (jobId, day, crewId) => {
    let movedJob = null;
    setBacklogState(prev => {
      movedJob = prev.find(j => j.id === jobId);
      return prev.filter(j => j.id !== jobId);
    });
    if (!movedJob) return;
    const scheduled = { ...movedJob, day, crewId, status: 'scheduled' };
    setScheduleState(prev => [...prev, scheduled]);
    await fetch(`/api/jobs/${jobId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scheduled),
    }).catch(console.error);
  }, []);

  /** Move a job within the schedule (reassign day/crew) */
  const reassignJob = useCallback(async (jobId, day, crewId) => {
    let updatedJob = null;
    setScheduleState(prev => prev.map(j => {
      if (j.id === jobId) {
        updatedJob = { ...j, day, crewId };
        return updatedJob;
      }
      return j;
    }));
    if (!updatedJob) return;
    await fetch(`/api/jobs/${jobId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedJob),
    }).catch(console.error);
  }, []);

  /** Move a job from schedule → backlog */
  const unscheduleJob = useCallback(async (jobId) => {
    let movedJob = null;
    setScheduleState(prev => {
      movedJob = prev.find(j => j.id === jobId);
      return prev.filter(j => j.id !== jobId);
    });
    if (!movedJob) return;
    const backlogged = { ...movedJob, status: 'backlog' };
    delete backlogged.day;
    delete backlogged.crewId;
    setBacklogState(prev => [...prev, backlogged]);
    await fetch(`/api/jobs/${jobId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(backlogged),
    }).catch(console.error);
  }, []);

  // ── Crew mutations ────────────────────────────────────────────────────────

  const addCrew = useCallback(async (crew) => {
    setCrewsState(prev => [...prev, crew]);
    await fetch('/api/crews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(crew),
    }).catch(console.error);
  }, []);

  const updateCrew = useCallback(async (updatedCrew) => {
    setCrewsState(prev => prev.map(c => c.id === updatedCrew.id ? updatedCrew : c));
    await fetch(`/api/crews/${updatedCrew.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedCrew),
    }).catch(console.error);
  }, []);

  const removeCrew = useCallback(async (crewId) => {
    setCrewsState(prev => prev.filter(c => c.id !== crewId));
    await fetch(`/api/crews/${crewId}`, { method: 'DELETE' }).catch(console.error);
  }, []);

  // ── Bulk ops (route optimiser) ────────────────────────────────────────────

  /** Add many jobs to schedule at once and remove them from backlog */
  const applyBulkSchedule = useCallback(async (newAssignments) => {
    const ids = new Set(newAssignments.map(j => j.id));
    setBacklogState(prev => prev.filter(j => !ids.has(j.id)));
    setScheduleState(prev => [...prev, ...newAssignments]);
    await fetch('/api/jobs/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobs: newAssignments }),
    }).catch(console.error);
    // Mark the originals as removed from backlog by updating their status
    for (const job of newAssignments) {
      await fetch(`/api/jobs/${job.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(job),
      }).catch(console.error);
    }
  }, []);

  /** Add many jobs to backlog (import) */
  const importJobs = useCallback(async (newJobs) => {
    setBacklogState(prev => [...newJobs, ...prev]);
    await fetch('/api/jobs/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobs: newJobs }),
    }).catch(console.error);
  }, []);

  /** Update a crew's tickets (toggle) */
  const updateCrewTickets = useCallback(async (crewId, tickets) => {
    let updatedCrew = null;
    setCrewsState(prev => prev.map(c => {
      if (c.id === crewId) {
        updatedCrew = { ...c, tickets };
        return updatedCrew;
      }
      return c;
    }));
    if (!updatedCrew) return;
    await fetch(`/api/crews/${crewId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedCrew),
    }).catch(console.error);
  }, []);

  /** Unschedule all jobs for a crew (used when deleting a crew) */
  const unscheduleCrewJobs = useCallback(async (crewId) => {
    const toUnschedule = schedule.filter(j => j.crewId === crewId);
    const backlogged = toUnschedule.map(job => {
      const b = { ...job, status: 'backlog' };
      delete b.day;
      delete b.crewId;
      return b;
    });
    setScheduleState(prev => prev.filter(j => j.crewId !== crewId));
    setBacklogState(prev => [...prev, ...backlogged]);
    for (const job of backlogged) {
      await fetch(`/api/jobs/${job.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(job),
      }).catch(console.error);
    }
  }, [schedule]);

  // ── Excel Upload operations ────────────────────────────────────────────────────────

  /** Upload Excel file to import jobs */
  const uploadExcelFile = useCallback(async (file, options = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    if (options && Object.keys(options).length > 0) {
      formData.append('options', JSON.stringify(options));
    }
    
    try {
      const response = await fetch('/api/upload/excel', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload Excel file');
      }
      
      const result = await response.json();
      if (result.ok && result.results?.jobs?.length) {
        // Add imported jobs to backlog if they have backlog status
        const importedJobs = result.results.jobs.filter(job => job.status === 'backlog');
        if (importedJobs.length > 0) {
          setBacklogState(prev => [...importedJobs, ...prev]);
        }
        
        // Add scheduled jobs to schedule if they have scheduled status
        const scheduledJobs = result.results.jobs.filter(job => job.status === 'scheduled');
        if (scheduledJobs.length > 0) {
          setScheduleState(prev => [...prev, ...scheduledJobs]);
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error uploading Excel file:', error);
      throw error;
    }
  }, []);

  /** Preview Excel file without importing */
  const previewExcelFile = useCallback(async (file, options = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    if (options && Object.keys(options).length > 0) {
      formData.append('options', JSON.stringify(options));
    }
    
    try {
      const response = await fetch('/api/upload/excel-preview', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to preview Excel file');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error previewing Excel file:', error);
      throw error;
    }
  }, []);

  /** Download Excel template */
  const downloadExcelTemplate = useCallback(async () => {
    try {
      const response = await fetch('/api/upload/excel-template');
      if (!response.ok) {
        throw new Error('Failed to download Excel template');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'safemaster-jobs-template.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return true;
    } catch (error) {
      console.error('Error downloading Excel template:', error);
      throw error;
    }
  }, []);

  return {
    backlog,
    schedule,
    crews,
    loading,
    error,
    api: {
      // Backlog
      addJobToBacklog,
      updateBacklogJob,
      removeFromBacklog,
      // Schedule
      addJobToSchedule,
      updateScheduledJob,
      removeFromSchedule,
      // Moves
      scheduleJob,
      reassignJob,
      unscheduleJob,
      // Crews
      addCrew,
      updateCrew,
      removeCrew,
      updateCrewTickets,
      unscheduleCrewJobs,
      // Bulk
      applyBulkSchedule,
      importJobs,
      // Excel Upload
      uploadExcelFile,
      previewExcelFile,
      downloadExcelTemplate,
    },
  };
}
