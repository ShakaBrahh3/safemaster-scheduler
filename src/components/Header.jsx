import React from 'react';
import { Calendar, Map, Download, Upload, Plus, ShieldAlert } from 'lucide-react';
import { formatCurrency } from '../utils';

/**
 * Header component for the SafeMaster Scheduler
 * Contains the main navigation, metrics, and action buttons
 */
export const Header = ({
  totalWeeklyValue,
  backlogValue,
  totalScheduledJobs,
  totalEwpJobs,
  mainView,
  setMainView,
  onExportSchedule,
  onExportBacklog,
  onImport,
  onCreateJob
}) => {
  return (
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

      {/* Metrics Header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 xl:gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-lg flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">Weekly Scheduled Run</span>
          <span className="text-lg font-bold text-emerald-400 mt-1">{formatCurrency(totalWeeklyValue)}</span>
        </div>
        <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-lg flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">Backlog Value</span>
          <span className="text-lg font-bold text-yellow-500 mt-1">{formatCurrency(backlogValue)}</span>
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

      {/* Actions */}
      <div className="flex gap-2 justify-end self-end lg:self-center flex-wrap">
        {/* Map / Schedule toggle */}
        <div className="flex rounded-lg overflow-hidden border border-slate-700 shadow">
          <button
            onClick={() => setMainView("schedule")}
            className={`px-3 py-2 text-sm font-semibold flex items-center gap-1.5 transition-all ${mainView === "schedule" ? "bg-teal-600 text-white" : "bg-slate-800 text-slate-400 hover:text-slate-200"}`}
          >
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Schedule</span>
          </button>
          <button
            onClick={() => setMainView("map")}
            className={`px-3 py-2 text-sm font-semibold flex items-center gap-1.5 transition-all ${mainView === "map" ? "bg-teal-600 text-white" : "bg-slate-800 text-slate-400 hover:text-slate-200"}`}
          >
            <Map className="h-4 w-4" />
            <span className="hidden sm:inline">Map View</span>
          </button>
        </div>
        <button 
          onClick={onExportSchedule}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-sm font-semibold rounded-lg text-slate-200 transition-all flex items-center gap-2 shadow"
        >
          <Download className="h-4 w-4" />
          <span>Export Schedule</span>
        </button>
        <button 
          onClick={onExportBacklog}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-sm font-semibold rounded-lg text-slate-200 transition-all flex items-center gap-2 shadow"
        >
          <Download className="h-4 w-4" />
          <span>Export Backlog</span>
        </button>
        <button 
          onClick={onImport}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-sm font-semibold rounded-lg text-slate-200 transition-all flex items-center gap-2 shadow"
        >
          <Upload className="h-4 w-4" />
          <span>Excel Importer</span>
        </button>
        <button 
          onClick={onCreateJob}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg transition-all flex items-center gap-2 shadow-md hover:shadow-emerald-900/20"
        >
          <Plus className="h-4 w-4" />
          <span>New Job Entry</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
