import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Fetches all scheduler data from the API and seeds defaults if empty.
 * Returns { backlog, schedule, crews, loading, error, api }
 * where `api` exposes granular mutation helpers.
 */
export function useSchedulerApi(initialBacklog, initialSchedule, initialCrews) {
  const [backlog, setBacklogState] = useState([]);
  const [schedule, setScheduleState] = useState([]);
  const [crews, setCrewsState] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const seeded = useRef(false);

  // ── Initial load ───────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const [jobsRes, schedRes, crewsRes] = await Promise.all([
          fetch('/api/jobs'),
          fetch('/api/schedule'),
          fetch('/api/crews'),
        ]);
        if (!jobsRes.ok || !schedRes.ok || !crewsRes.ok) {
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
        // Surface the error; do NOT silently fall back to in-memory defaults,
        // as that would mask a real persistence failure and give users the false
        // impression their changes are being saved.
        setError(err.message);
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
    },
  };
}
