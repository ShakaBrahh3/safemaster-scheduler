import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function ScheduleGrid({
  days,
  crews,
  schedule,
  TICKETS,
  onSelectJob,
  onDragStart,
  onDragOver,
  onDropOnCell,
  checkTicketConflict,
  getDayTotalCost,
  getRunStyle
}) {
  return (
    <section className="flex-1 flex flex-col overflow-x-auto min-w-[900px] bg-slate-900">
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

      <div className="flex-1 grid grid-cols-5 divide-x divide-slate-800 h-full overflow-y-auto">
        {days.map(day => {
          const dayJobs = schedule.filter(job => job.day === day);
          const dayCostSum = getDayTotalCost(day);

          return (
            <div key={day} className="flex flex-col h-full bg-slate-900">
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

              <div className="flex-1 flex flex-col divide-y divide-slate-850 min-h-0">
                {crews.map(crew => {
                  const crewJobs = dayJobs.filter(job => job.crewId === crew.id);

                  return (
                    <div
                      key={crew.id}
                      onDragOver={onDragOver}
                      onDrop={(e) => onDropOnCell(e, day, crew.id)}
                      className="flex-1 min-h-[160px] p-2 bg-slate-900/40 hover:bg-slate-850/30 transition-colors flex flex-col relative group"
                    >
                      <div className="flex justify-between items-center mb-1.5 bg-slate-950/60 p-1.5 rounded border border-slate-800/40">
                        <span className="text-[10px] font-bold text-slate-300 truncate max-w-[120px]">
                          {crew.name.split(" ")[0]}
                        </span>
                        <div className="flex items-center gap-1 font-mono text-[9px] text-slate-400">
                          <span>${crewJobs.reduce((sum, j) => sum + j.cost, 0).toFixed(0)}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-0.5 mb-2">
                        {crew.tickets.map(t => (
                          <span key={t} className="text-[7px] font-bold px-1 bg-slate-950 text-slate-400 rounded">
                            {t}
                          </span>
                        ))}
                      </div>

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
                                onDragStart={(e) => onDragStart(e, job.id, 'calendar')}
                                onClick={() => onSelectJob(job)}
                                className={`p-2 rounded border bg-slate-950 hover:bg-slate-900 cursor-grab active:cursor-grabbing hover:border-slate-500 shadow hover:shadow-lg transition-all group ${hasConflict ? 'border-rose-700/80 bg-rose-950/20' : 'border-slate-800'}`}
                              >
                                {hasConflict && (
                                  <div className="mb-1.5 px-1.5 py-0.5 bg-rose-950/80 border border-rose-900 rounded text-[8px] font-black text-rose-400 flex items-center gap-1 animate-pulse">
                                    <AlertTriangle className="h-3 w-3" />
                                    <span>SAFETY WARNING: Needs {job.requiredTicket}!</span>
                                  </div>
                                )}

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

                                <h5 className="text-[11px] font-bold text-slate-100 leading-tight line-clamp-2">
                                  {job.site}
                                </h5>

                                <div className="mt-2 flex flex-wrap items-center gap-1">
                                  <span className={`text-[8px] font-extrabold px-1 rounded ${TICKETS?.[job.requiredTicket]?.color || 'bg-slate-800 text-slate-300'}`}>
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
  );
}
