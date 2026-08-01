import React from 'react';
import { formatCurrencyCompact } from '../utils';

/**
 * Metrics bar component displaying key statistics
 * Shows planning focus, critical backlog, unqualified jobs, and briefing info
 */
export const MetricsBar = ({
  openBacklogJobs,
  highPriorityBacklog,
  unqualifiedBacklog,
  briefingDay,
  dayBriefingJobs,
  dayBriefingValue
}) => {
  return (
    <div className="border-b border-slate-800 bg-slate-950/70 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-slate-950/50">
      <div className="grid gap-3 lg:grid-cols-4">
        <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3">
          <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">Planning focus</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-lg font-semibold text-white">{openBacklogJobs}</span>
            <span className="text-xs text-slate-400">open jobs</span>
          </div>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3">
          <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">Critical backlog</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-lg font-semibold text-rose-400">{highPriorityBacklog}</span>
            <span className="text-xs text-slate-400">high priority</span>
          </div>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3">
          <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">Needs qualified crew</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-lg font-semibold text-amber-400">{unqualifiedBacklog}</span>
            <span className="text-xs text-slate-400">items flagged</span>
          </div>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3">
          <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">{briefingDay} briefing</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-lg font-semibold text-emerald-400">{dayBriefingJobs.length}</span>
            <span className="text-xs text-slate-400">jobs • ${formatCurrencyCompact(dayBriefingValue)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsBar;
