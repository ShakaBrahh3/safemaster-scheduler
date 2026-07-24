import React from 'react';
import { Sparkles, Check, AlertTriangle } from 'lucide-react';

export const RouteOptimizationModal = ({
  showModal,
  setShowModal,
  optimizedSchedule,
  skippedJobs = [],
  crews,
  TICKETS,
  onApply
}) => {
  if (!showModal || !optimizedSchedule) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in-50">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden">
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
          <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-teal-400" />
            AI Route Optimization Results
          </h3>
          <button 
            type="button"
            onClick={() => setShowModal(false)}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <p className="text-[12px] text-slate-400 bg-slate-950/50 p-3 rounded border border-slate-800">
            The system analyzed unscheduled jobs and matched {optimizedSchedule.length} to qualified crews based on certifications, workload distribution, and priority levels.
          </p>

          {optimizedSchedule.length > 0 ? (
            <div className="space-y-3">
              {optimizedSchedule.map((job, idx) => {
                const crew = crews.find(c => c.id === job.crewId);
                return (
                  <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="text-xs font-bold text-white">{job.site}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">{job.notes}</p>
                      </div>
                      <span className="text-xs font-bold text-emerald-400">${job.cost}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-[9px] font-bold px-2 py-1 rounded ${crew?.color || 'bg-slate-800 text-slate-400'}`}>
                        ➜ {crew?.name || "Unknown"} / {job.day}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${TICKETS[job.requiredTicket]?.color}`}>
                        {job.requiredTicket}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-lg text-center text-slate-400">
              No jobs could be auto-assigned
            </div>
          )}

          {skippedJobs.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" />
                {skippedJobs.length} job{skippedJobs.length !== 1 ? 's' : ''} skipped — no qualified crew
              </h4>
              {skippedJobs.map((job) => (
                <div key={job.id} className="p-2.5 bg-amber-950/20 border border-amber-900/40 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200">{job.site}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${TICKETS[job.requiredTicket]?.color}`}>
                      Needs {job.requiredTicket}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-slate-950 p-4 border-t border-slate-800 flex justify-end gap-2">
          <button 
            type="button"
            onClick={() => setShowModal(false)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold rounded-lg"
          >
            Discard
          </button>
          <button 
            type="button"
            onClick={() => { onApply(); setShowModal(false); }}
            disabled={optimizedSchedule.length === 0}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-2"
          >
            <Check className="h-3.5 w-3.5" />
            Apply Optimized Schedule
          </button>
        </div>
      </div>
    </div>
  );
};
