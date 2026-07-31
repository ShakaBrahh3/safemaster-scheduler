import React from 'react';
import { Plus, Edit3, Trash2, Award, ShieldCheck, Sparkles } from 'lucide-react';
import { TICKETS } from '../constants';

/**
 * Crews panel component for managing crew members and their certifications
 */
export const CrewsPanel = ({
  crews,
  showCrewModal,
  setShowCrewModal,
  editingCrewId,
  setEditingCrewId,
  newCrew,
  setNewCrew,
  crewColors,
  onAddCrew,
  onEditCrew,
  onDeleteCrew,
  onToggleCrewTicket,
  onOptimizeRoutes
}) => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-4 border-b border-slate-900 bg-slate-950/50">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h3 className="text-sm font-semibold text-white">
            <Award className="h-4 w-4 inline mr-1" />
            Crew Management
          </h3>
          <div className="flex gap-2">
            <button
              onClick={onOptimizeRoutes}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI Auto-Route</span>
            </button>
            <button
              onClick={() => {
                setNewCrew({ name: "", email: "", phone: "", baseLocation: "", notes: "", tickets: ["WAH"] });
                setEditingCrewId(null);
                setShowCrewModal(true);
              }}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Inspector</span>
            </button>
          </div>
        </div>

        {/* Crew statistics */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-2.5">
            <p className="text-[9px] uppercase tracking-[0.24em] text-slate-400">Total Crews</p>
            <p className="text-sm font-semibold text-white">{crews.length}</p>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-2.5">
            <p className="text-[9px] uppercase tracking-[0.24em] text-slate-400">Certifications</p>
            <p className="text-sm font-semibold text-teal-400">
              {new Set(crews.flatMap(c => c.tickets)).size} types
            </p>
          </div>
        </div>
      </div>

      {/* Crew list */}
      <div className="flex-1 overflow-auto p-3 space-y-2">
        {crews.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p>No crews added yet</p>
            <button
              onClick={() => {
                setNewCrew({ name: "", email: "", phone: "", baseLocation: "", notes: "", tickets: ["WAH"] });
                setEditingCrewId(null);
                setShowCrewModal(true);
              }}
              className="mt-2 text-sm text-teal-400 hover:text-teal-300"
            >
              Add your first crew member
            </button>
          </div>
        ) : (
          crews.map(crew => (
            <div
              key={crew.id}
              className={`p-3 rounded-lg border border-slate-800 bg-slate-900/50 ${crew.color}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-white truncate">{crew.name}</h4>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                      {crew.baseLocation || 'N/A'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">{crew.email}</p>
                  {crew.phone && (
                    <p className="text-[11px] text-slate-500">{crew.phone}</p>
                  )}
                  {crew.notes && (
                    <p className="text-[10px] text-slate-500 mt-1">{crew.notes}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => onEditCrew(crew.id)}
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                    title="Edit crew"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteCrew(crew.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-800/20 text-rose-400 hover:text-rose-300 transition-colors"
                    title="Delete crew"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Ticket badges */}
              <div className="flex flex-wrap gap-1 mt-2">
                {Object.values(TICKETS).map(ticket => {
                  const hasTicket = crew.tickets.includes(ticket.code);
                  return (
                    <button
                      key={ticket.code}
                      onClick={() => onToggleCrewTicket(crew.id, ticket.code)}
                      className={`text-[9px] px-2 py-0.5 rounded font-bold transition-all ${
                        hasTicket 
                          ? ticket.color 
                          : 'bg-slate-800 text-slate-500 hover:bg-slate-750'
                      }`}
                      title={hasTicket ? `Remove ${ticket.name}` : `Add ${ticket.name}`}
                    >
                      {hasTicket ? '✓' : '+'} {ticket.code}
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CrewsPanel;
