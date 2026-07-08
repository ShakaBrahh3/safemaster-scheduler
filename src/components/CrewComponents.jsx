import React from 'react';
import { Plus, Edit3, Trash2, Check } from 'lucide-react';

export const CrewManagementModal = ({ 
  showModal, 
  setShowModal, 
  editingCrewId,
  setEditingCrewId,
  newCrew, 
  setNewCrew, 
  TICKETS,
  onAddCrew,
  onSaveEditCrew
}) => {
  const handleToggleTicket = (ticketCode) => {
    const hasIt = newCrew.tickets.includes(ticketCode);
    setNewCrew({
      ...newCrew,
      tickets: hasIt ? newCrew.tickets.filter(t => t !== ticketCode) : [...newCrew.tickets, ticketCode]
    });
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in-50">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
          <h3 className="font-bold text-white text-sm uppercase tracking-wider">{editingCrewId ? "Edit Inspector" : "Add New Inspector"}</h3>
          <button 
            type="button"
            onClick={() => { setShowModal(false); setEditingCrewId(null); }}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs text-slate-400 font-medium uppercase tracking-wider block mb-1">Inspector Name *</label>
            <input 
              type="text" 
              required
              placeholder="e.g. John Smith"
              value={newCrew.name}
              onChange={(e) => setNewCrew({ ...newCrew, name: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 font-medium uppercase tracking-wider block mb-1">Email *</label>
              <input 
                type="email" 
                required
                placeholder="john@safemaster.com"
                value={newCrew.email}
                onChange={(e) => setNewCrew({ ...newCrew, email: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium uppercase tracking-wider block mb-1">Phone</label>
              <input 
                type="tel" 
                placeholder="0412 345 678"
                value={newCrew.phone}
                onChange={(e) => setNewCrew({ ...newCrew, phone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 font-medium uppercase tracking-wider block mb-1">Base Location</label>
            <input 
              type="text" 
              placeholder="e.g. Perth Metro, Busselton"
              value={newCrew.baseLocation}
              onChange={(e) => setNewCrew({ ...newCrew, baseLocation: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 font-medium uppercase tracking-wider block mb-1">Notes / Specialization</label>
            <textarea 
              rows={2}
              placeholder="e.g. EWP specialist, experienced operator..."
              value={newCrew.notes}
              onChange={(e) => setNewCrew({ ...newCrew, notes: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 font-medium uppercase tracking-wider block mb-3">Safety Tickets / Certifications</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(TICKETS).map(t => (
                <button
                  key={t.code}
                  type="button"
                  onClick={() => handleToggleTicket(t.code)}
                  className={`px-3 py-2 rounded text-[10px] font-bold border transition-all ${newCrew.tickets.includes(t.code) ? 'bg-emerald-950 text-emerald-400 border-emerald-700' : 'bg-slate-850 text-slate-500 border-slate-700 hover:border-slate-600'}`}
                >
                  {t.code}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-slate-950 p-4 border-t border-slate-800 flex justify-end gap-2">
          <button 
            type="button"
            onClick={() => { setShowModal(false); setEditingCrewId(null); }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold rounded-lg"
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={editingCrewId ? onSaveEditCrew : onAddCrew}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-all"
          >
            {editingCrewId ? "Save Changes" : "Add Inspector"}
          </button>
        </div>
      </div>
    </div>
  );
};

export const CrewCard = ({ crew, TICKETS, onToggleTicket, onEdit, onDelete }) => {
  return (
    <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="text-xs font-bold text-white flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${crew.color.split(" ")[0].replace("border-", "bg-")}`}></span>
            {crew.name}
          </h4>
          <p className="text-[9px] text-slate-400 mt-0.5">{crew.email}</p>
          {crew.phone && <p className="text-[9px] text-slate-500">{crew.phone}</p>}
          {crew.baseLocation && <p className="text-[9px] text-slate-500">📍 {crew.baseLocation}</p>}
          {crew.notes && <p className="text-[9px] text-slate-400 italic mt-1">{crew.notes}</p>}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => onEdit(crew.id)}
            className="p-1 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded text-slate-400 hover:text-slate-200 transition-all"
          >
            <Edit3 className="h-3 w-3" />
          </button>
          <button
            onClick={() => onDelete(crew.id)}
            className="p-1 bg-rose-950/30 hover:bg-rose-950/60 border border-rose-900/50 rounded text-rose-400 hover:text-rose-300 transition-all"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">Active Credentials:</span>
        <div className="grid grid-cols-2 gap-1.5">
          {Object.values(TICKETS).map(t => {
            const ownsTicket = crew.tickets.includes(t.code);
            return (
              <button
                key={t.code}
                type="button"
                onClick={() => onToggleTicket(crew.id, t.code)}
                className={`px-2 py-1.5 rounded text-[10px] font-bold border transition-all text-left flex items-center justify-between ${ownsTicket ? 'bg-slate-950 text-teal-400 border-teal-500/50 shadow-sm' : 'bg-slate-900 text-slate-500 border-slate-850 hover:bg-slate-850'}`}
              >
                <span>{t.code} - {t.name.split(" ")[0]}</span>
                {ownsTicket ? <Check className="h-3 w-3 stroke-[3]" /> : <span className="text-xs opacity-40">+</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
