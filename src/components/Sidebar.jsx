import React from 'react';
import { FileText, Award, Bell } from 'lucide-react';

/**
 * Sidebar component with tab navigation
 * Contains tabs for Jobs Backlog, Crews & Tickets, and Night-Before SMS
 */
export const Sidebar = ({
  leftActiveTab,
  setLeftActiveTab,
  filteredBacklog,
  schedule
}) => {
  return (
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

      {/* Tab content will be rendered by parent */}
    </section>
  );
};

export default Sidebar;
