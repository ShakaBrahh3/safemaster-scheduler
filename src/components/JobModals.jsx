import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import MapPreview from './MapPreview';

export const CreateJobModal = ({ 
  showModal, 
  setShowModal, 
  newJob, 
  setNewJob, 
  TICKETS,
  RUN_STYLES,
  onCreateJob
}) => {
  const [showMapModal, setShowMapModal] = useState(false);

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in-50">
      <form onSubmit={onCreateJob} className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center sticky top-0">
          <h3 className="font-bold text-white text-sm uppercase tracking-wider">New Height Safety Recertification Entry</h3>
          <button 
            type="button"
            onClick={() => setShowModal(false)}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs text-slate-400 font-medium uppercase tracking-wider block mb-1">Site / Facility Name *</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Kelmscott Undercover Area"
              value={newJob.site}
              onChange={(e) => setNewJob({ ...newJob, site: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-slate-400 font-medium uppercase tracking-wider block mb-1">Cost Allocation ($)</label>
              <input 
                type="number" 
                placeholder="e.g. 1250"
                value={newJob.cost}
                onChange={(e) => setNewJob({ ...newJob, cost: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium uppercase tracking-wider block mb-1">Run Assignment</label>
              <select 
                value={newJob.run}
                onChange={(e) => setNewJob({ ...newJob, run: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                {Object.keys(RUN_STYLES).map(run => (
                  <option key={run} value={run}>{run}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium uppercase tracking-wider block mb-1">Priority</label>
              <select 
                value={newJob.priority}
                onChange={(e) => setNewJob({ ...newJob, priority: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="normal">Normal</option>
                <option value="warning">Warning</option>
                <option value="high">High/Critical</option>
              </select>
            </div>
          </div>

          {/* Location Section */}
          <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">📍 Job Location</h4>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-[10px] text-slate-400 font-medium block mb-1">Latitude</label>
                <input 
                  type="number" 
                  step="0.0001"
                  placeholder="-31.9505"
                  value={newJob.lat || ''}
                  onChange={(e) => setNewJob({ ...newJob, lat: parseFloat(e.target.value) || null })}
                  className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-sm text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-medium block mb-1">Longitude</label>
                <input 
                  type="number" 
                  step="0.0001"
                  placeholder="115.8605"
                  value={newJob.lng || ''}
                  onChange={(e) => setNewJob({ ...newJob, lng: parseFloat(e.target.value) || null })}
                  className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-sm text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
            
            {newJob.lat && newJob.lng && (
              <div className="text-[10px] text-teal-400 bg-teal-950/30 p-2 rounded border border-teal-900/30">
                ✓ Coordinates: {newJob.lat.toFixed(4)}, {newJob.lng.toFixed(4)}
              </div>
            )}
            
            <button
              type="button"
              onClick={() => setShowMapModal(!showMapModal)}
              className="mt-2 w-full px-2 py-1.5 text-[10px] font-semibold bg-slate-800 hover:bg-slate-750 text-slate-300 rounded border border-slate-700 transition-all"
            >
              {showMapModal ? '↑ Hide Location Preview' : '↓ Show Location Preview'}
            </button>

            {showMapModal && (
              <div className="mt-3">
                <MapPreview 
                  jobs={[newJob].filter(j => j.lat && j.lng)} 
                  height="250px"
                />
              </div>
            )}
          </div>

          <div>
            <label className="text-xs text-slate-400 font-medium uppercase tracking-wider block mb-1">Mandated License Required</label>
            <select 
              value={newJob.requiredTicket}
              onChange={(e) => setNewJob({ ...newJob, requiredTicket: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              {Object.values(TICKETS).map(t => (
                <option key={t.code} value={t.code}>{t.name} ({t.code})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400 font-medium uppercase tracking-wider block mb-1">Site Instructions / Equipment Notes</label>
            <textarea 
              rows={2}
              placeholder="e.g. Key pickup required, static line 4 years old..."
              value={newJob.notes}
              onChange={(e) => setNewJob({ ...newJob, notes: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
            <input 
              type="checkbox"
              checked={newJob.ewpRequired}
              onChange={(e) => setNewJob({ ...newJob, ewpRequired: e.target.checked })}
              className="accent-emerald-500 h-4 w-4 bg-slate-950 border-slate-800"
            />
            <span>EWP Bookings / High Access Required?</span>
          </label>
        </div>

        <div className="bg-slate-950 p-4 border-t border-slate-800 flex justify-end gap-2 sticky bottom-0">
          <button 
            type="button"
            onClick={() => setShowModal(false)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold rounded-lg"
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-all"
          >
            Create Job Entry
          </button>
        </div>
      </form>
    </div>
  );
};

export const JobDetailModal = ({ 
  selectedJob, 
  setSelectedJob, 
  TICKETS,
  onDelete,
  onUnschedule,
  onSaveEdit
}) => {
  if (!selectedJob) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in-50">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center sticky top-0">
          <h3 className="font-bold text-white text-sm uppercase tracking-wider">Job Details</h3>
          <button 
            type="button"
            onClick={() => setSelectedJob(null)}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Location Preview */}
          {selectedJob.lat && selectedJob.lng && (
            <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">📍 Job Location</h4>
              <MapPreview 
                jobs={[selectedJob]} 
                height="250px"
              />
              <p className="text-[10px] text-slate-400 mt-2">
                Coordinates: {selectedJob.lat.toFixed(4)}, {selectedJob.lng.toFixed(4)}
              </p>
            </div>
          )}

          <div>
            <label className="text-xs text-slate-400 font-medium uppercase tracking-wider block mb-1">Site Name</label>
            <input 
              type="text"
              value={selectedJob.site}
              onChange={(e) => setSelectedJob({ ...selectedJob, site: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 font-medium uppercase tracking-wider block mb-1">Cost ($)</label>
              <input 
                type="number" 
                value={selectedJob.cost}
                onChange={(e) => setSelectedJob({ ...selectedJob, cost: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium uppercase tracking-wider block mb-1">Required Ticket</label>
              <select 
                value={selectedJob.requiredTicket}
                onChange={(e) => setSelectedJob({ ...selectedJob, requiredTicket: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                {Object.values(TICKETS).map(t => (
                  <option key={t.code} value={t.code}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 font-medium uppercase tracking-wider block mb-1">Notes</label>
            <textarea 
              rows={3}
              value={selectedJob.notes}
              onChange={(e) => setSelectedJob({ ...selectedJob, notes: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="bg-slate-950 p-4 rounded-lg border border-slate-850">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Height Safety Compliance</h4>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                <input 
                  type="checkbox"
                  checked={selectedJob.ewpRequired}
                  onChange={(e) => setSelectedJob({ ...selectedJob, ewpRequired: e.target.checked })}
                  className="accent-emerald-500 h-4 w-4 bg-slate-900 border-slate-800 rounded"
                />
                <span>EWP Access Needed</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                <input 
                  type="checkbox"
                  checked={selectedJob.tags?.includes("Anchor Testing")}
                  onChange={(e) => {
                    const newTags = e.target.checked 
                      ? [...(selectedJob.tags || []), "Anchor Testing"] 
                      : (selectedJob.tags || []).filter(t => t !== "Anchor Testing");
                    setSelectedJob({ ...selectedJob, tags: newTags });
                  }}
                  className="accent-emerald-500 h-4 w-4 bg-slate-900 border-slate-800 rounded"
                />
                <span>Anchor point test</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                <input 
                  type="checkbox"
                  checked={selectedJob.tags?.includes("Static Line")}
                  onChange={(e) => {
                    const newTags = e.target.checked 
                      ? [...(selectedJob.tags || []), "Static Line"] 
                      : (selectedJob.tags || []).filter(t => t !== "Static Line");
                    setSelectedJob({ ...selectedJob, tags: newTags });
                  }}
                  className="accent-emerald-500 h-4 w-4 bg-slate-900 border-slate-800 rounded"
                />
                <span>Static Line Test</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                <input 
                  type="checkbox"
                  checked={selectedJob.tags?.includes("Load Tester")}
                  onChange={(e) => {
                    const newTags = e.target.checked 
                      ? [...(selectedJob.tags || []), "Load Tester"] 
                      : (selectedJob.tags || []).filter(t => t !== "Load Tester");
                    setSelectedJob({ ...selectedJob, tags: newTags });
                  }}
                  className="accent-emerald-500 h-4 w-4 bg-slate-900 border-slate-800 rounded"
                />
                <span>Load Tester</span>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-slate-950 p-4 border-t border-slate-800 flex justify-between gap-2 sticky bottom-0">
          <button 
            type="button"
            onClick={() => onDelete(selectedJob.id, selectedJob.status === "scheduled")}
            className="px-3 py-2 bg-rose-950/40 hover:bg-rose-950 border border-rose-900 text-rose-400 hover:text-rose-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete</span>
          </button>

          <div className="flex gap-2">
            {selectedJob.status === "scheduled" && (
              <button 
                type="button"
                onClick={() => { onUnschedule(selectedJob.id); setSelectedJob(null); }}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold rounded-lg transition-colors"
              >
                Send to Backlog
              </button>
            )}
            <button 
              type="button"
              onClick={() => { onSaveEdit(selectedJob); setSelectedJob(null); }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
