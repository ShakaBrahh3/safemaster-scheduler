import React from 'react';
import { FileText, Search, Filter, AlertTriangle, Sliders, Trash2, Edit3, CheckCircle2, Clock, ShieldAlert, ChevronRight, Info, Download, Check, Award, Bell, Send, Copy, UserCheck, ShieldCheck, Sparkles } from 'lucide-react';
import { RUN_STYLES, DAYS } from '../constants';

/**
 * Backlog panel component for managing jobs
 * Includes filtering, bulk operations, and job list
 */
export const BacklogPanel = ({
  backlog,
  filteredBacklog,
  crews,
  searchQuery,
  setSearchQuery,
  selectedRunFilter,
  setSelectedRunFilter,
  priorityFilter,
  setPriorityFilter,
  showOnlyUnqualified,
  setShowOnlyUnqualified,
  selectedBacklogIds,
  setSelectedBacklogIds,
  bulkTargetDay,
  setBulkTargetDay,
  bulkTargetCrewId,
  setBulkTargetCrewId,
  bulkFeedback,
  setBulkFeedback,
  hasQualifiedCrew,
  checkTicketConflict,
  handleBulkAssignBacklog,
  handleSelectVisibleBacklog,
  handleClearBacklogSelection,
  handleToggleBacklogSelection,
  onDragStart,
  onDropOnBacklog,
  onDragOver
}) => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-4 border-b border-slate-900 bg-slate-950/50 space-y-3">
        {/* Bulk scheduling controls */}
        <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">Bulk scheduling</p>
            <span className="text-[10px] text-slate-500">{selectedBacklogIds.length} selected</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select
              value={bulkTargetDay}
              onChange={(e) => setBulkTargetDay(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-xs text-slate-200"
            >
              {DAYS.map(day => <option key={day} value={day}>{day}</option>)}
            </select>
            <select
              value={bulkTargetCrewId}
              onChange={(e) => setBulkTargetCrewId(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-xs text-slate-200"
            >
              {crews.map(crew => <option key={crew.id} value={crew.id}>{crew.name}</option>)}
            </select>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSelectVisibleBacklog}
              className="px-2.5 py-1.5 rounded border border-slate-700 bg-slate-800 text-[10px] font-semibold text-slate-200"
            >
              Select visible
            </button>
            <button
              type="button"
              onClick={handleClearBacklogSelection}
              className="px-2.5 py-1.5 rounded border border-slate-700 bg-slate-900 text-[10px] font-semibold text-slate-400"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleBulkAssignBacklog}
              className="px-2.5 py-1.5 rounded bg-teal-600 text-[10px] font-semibold text-slate-950"
            >
              Assign selected
            </button>
          </div>
          {bulkFeedback && (
            <p className="text-[10px] text-slate-400">{bulkFeedback}</p>
          )}
        </div>

        {/* Backlog statistics */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-2.5">
            <p className="text-[9px] uppercase tracking-[0.24em] text-slate-400">Open jobs</p>
            <p className="text-sm font-semibold text-white">{backlog.length}</p>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-2.5">
            <p className="text-[9px] uppercase tracking-[0.24em] text-slate-400">Filtered view</p>
            <p className="text-sm font-semibold text-teal-400">{filteredBacklog.length}</p>
          </div>
        </div>

        {/* Priority filters */}
        <div className="flex flex-wrap gap-1">
          {['ALL', 'high', 'warning', 'normal'].map(level => (
            <button
              key={level}
              onClick={() => setPriorityFilter(level)}
              className={`text-[9px] px-2 py-1 rounded font-bold transition-all ${priorityFilter === level ? 'bg-teal-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:bg-slate-750'}`}
            >
              {level === 'ALL' ? 'ALL PRIORITY' : level.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Unqualified filter */}
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setShowOnlyUnqualified(prev => !prev)}
            className={`text-[10px] px-2.5 py-1.5 rounded border font-semibold transition-all ${showOnlyUnqualified ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'}`}
          >
            {showOnlyUnqualified ? 'Showing unqualified only' : 'Show unqualified only'}
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedRunFilter('ALL');
              setPriorityFilter('ALL');
              setShowOnlyUnqualified(false);
              setSearchQuery('');
            }}
            className="text-[10px] px-2.5 py-1.5 rounded border border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200 transition-all"
          >
            Reset
          </button>
        </div>

        {/* Run filtering badges */}
        <div className="flex flex-wrap gap-1">
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
      </div>

      {/* Backlog list */}
      <div 
        className="flex-1 overflow-auto p-3 space-y-2"
        onDrop={onDropOnBacklog}
        onDragOver={onDragOver}
      >
        {filteredBacklog.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p>No jobs match the current filters</p>
            <button
              onClick={() => {
                setSelectedRunFilter('ALL');
                setPriorityFilter('ALL');
                setShowOnlyUnqualified(false);
                setSearchQuery('');
              }}
              className="mt-2 text-sm text-teal-400 hover:text-teal-300"
            >
              Clear filters
            </button>
          </div>
        ) : (
          filteredBacklog.map(job => {
            const isSelected = selectedBacklogIds.includes(job.id);
            const hasConflict = !hasQualifiedCrew(job);
            const runStyle = RUN_STYLES[job.run] || RUN_STYLES['PROGRAMMED'];

            return (
              <div
                key={job.id}
                draggable
                onDragStart={(e) => onDragStart(e, job.id, "backlog")}
                className={`p-3 rounded-lg border border-slate-800 bg-slate-900/50 cursor-grab active:cursor-grabbing transition-all ${
                  isSelected ? 'ring-2 ring-teal-500 border-teal-700' : ''
                } ${hasConflict ? 'border-amber-700 bg-amber-900/10' : ''}`}
                onClick={() => handleToggleBacklogSelection(job.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`h-2 w-2 rounded-full ${runStyle.dot}`} />
                      <h4 className="text-sm font-semibold text-white truncate">{job.site}</h4>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        job.priority === 'high' ? 'bg-rose-500/10 text-rose-400' :
                        job.priority === 'warning' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {job.priority.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">{job.notes}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs text-slate-500">${job.cost}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        job.ewpRequired ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' :
                        'bg-slate-800 text-slate-500'
                      }`}>
                        {job.ewpRequired ? 'EWP Required' : 'Standard'}
                      </span>
                      <span className="text-[10px] text-slate-500">{job.requiredTicket}</span>
                    </div>
                  </div>
                </div>
                {hasConflict && (
                  <div className="mt-2 p-2 bg-amber-900/20 border border-amber-700 rounded text-[10px] text-amber-400">
                    <AlertTriangle className="h-3 w-3 inline mr-1" />
                    No qualified crew available for {job.requiredTicket}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default BacklogPanel;
