import React, { useState } from 'react';
import { Bell, Clock, Mail, MessageSquare, Check, X, Plus, Trash2 } from 'lucide-react';
import { REMINDER_TIMES, NOTIFICATION_METHODS } from '../constants/recurring';

/**
 * Reminder settings component for configuring job reminders
 */
export const ReminderSettings = ({
  showModal,
  setShowModal,
  job,
  onSave,
  crews
}) => {
  const [reminders, setReminders] = useState(job?.reminders || []);
  const [newReminder, setNewReminder] = useState({
    timeBefore: '24', // hours
    timeUnit: 'hours',
    method: 'email',
    message: '',
    recipient: 'crew'
  });

  // Get crew for this job
  const crew = crews.find(c => c.id === job?.crewId);

  // Handle add reminder
  const handleAddReminder = () => {
    if (!newReminder.timeBefore || newReminder.timeBefore <= 0) {
      return;
    }
    
    const reminder = {
      id: `reminder-${Date.now()}`,
      ...newReminder,
      // Convert to minutes for easier processing
      minutesBefore: calculateMinutesBefore(newReminder)
    };
    
    setReminders([...reminders, reminder]);
    setNewReminder({
      timeBefore: '24',
      timeUnit: 'hours',
      method: 'email',
      message: '',
      recipient: 'crew'
    });
  };

  // Calculate minutes before
  const calculateMinutesBefore = (reminder) => {
    const time = parseInt(reminder.timeBefore);
    switch (reminder.timeUnit) {
      case 'minutes': return time;
      case 'hours': return time * 60;
      case 'days': return time * 60 * 24;
      case 'weeks': return time * 60 * 24 * 7;
      default: return time * 60; // Default to hours
    }
  };

  // Format minutes before for display
  const formatMinutesBefore = (minutes) => {
    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    if (minutes < 60 * 24) {
      const hours = Math.floor(minutes / 60);
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
    const days = Math.floor(minutes / (60 * 24));
    return `${days} day${days !== 1 ? 's' : ''}`;
  };

  // Handle remove reminder
  const handleRemoveReminder = (id) => {
    setReminders(reminders.filter(r => r.id !== id));
  };

  // Handle save
  const handleSave = () => {
    onSave({
      ...job,
      reminders: reminders.map(r => ({
        ...r,
        minutesBefore: calculateMinutesBefore(r)
      }))
    });
    setShowModal(false);
  };

  // Handle cancel
  const handleCancel = () => {
    setShowModal(false);
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in-50">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
          <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Reminder Settings
          </h3>
          <button 
            type="button"
            onClick={handleCancel}
            className="text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          
          {/* Job Info */}
          <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800">
            <p className="text-sm text-slate-300">
              <strong>Job:</strong> {job?.site || 'New Job'}
            </p>
            {crew && (
              <p className="text-sm text-slate-300">
                <strong>Crew:</strong> {crew.name}
              </p>
            )}
            {job?.date && (
              <p className="text-sm text-slate-300">
                <strong>Date:</strong> {new Date(job.date).toLocaleDateString('en-AU', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}
              </p>
            )}
          </div>

          {/* Existing Reminders */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Current Reminders ({reminders.length})
            </h4>
            
            {reminders.length === 0 ? (
              <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg text-center">
                <p className="text-sm text-slate-400">No reminders configured</p>
                <p className="text-xs text-slate-500">Add reminders below</p>
              </div>
            ) : (
              <div className="space-y-2">
                {reminders.map((reminder, index) => (
                  <div
                    key={reminder.id}
                    className="p-3 bg-slate-800/50 border border-slate-700 rounded-lg flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-300">
                          {formatMinutesBefore(reminder.minutesBefore || calculateMinutesBefore(reminder))} before
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${NOTIFICATION_METHODS[reminder.method]?.color || 'bg-slate-700'}`}>
                          {NOTIFICATION_METHODS[reminder.method]?.icon} {NOTIFICATION_METHODS[reminder.method]?.label}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">
                        To: {reminder.recipient === 'crew' ? (crew?.name || 'Crew') : 'Client'}
                      </div>
                      {reminder.message && (
                        <div className="text-xs text-slate-500 mt-1 truncate max-w-[200px]">
                          "{reminder.message}"
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveReminder(reminder.id)}
                      className="p-1.5 rounded hover:bg-rose-800/20 text-rose-400 hover:text-rose-300 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Reminder */}
          <div className="pt-4 border-t border-slate-800">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Add New Reminder
            </h4>
            
            <div className="space-y-3">
              {/* Time Before */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Time Before</label>
                  <input
                    type="number"
                    value={newReminder.timeBefore}
                    onChange={(e) => setNewReminder(prev => ({
                      ...prev,
                      timeBefore: e.target.value
                    }))}
                    min="1"
                    max="365"
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-sm text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Unit</label>
                  <select
                    value={newReminder.timeUnit}
                    onChange={(e) => setNewReminder(prev => ({
                      ...prev,
                      timeUnit: e.target.value
                    }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-sm text-slate-100"
                  >
                    <option value="minutes">Minutes</option>
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Method</label>
                  <select
                    value={newReminder.method}
                    onChange={(e) => setNewReminder(prev => ({
                      ...prev,
                      method: e.target.value
                    }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-sm text-slate-100"
                  >
                    {Object.values(NOTIFICATION_METHODS).map(method => (
                      <option key={method.value} value={method.value}>
                        {method.icon} {method.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Recipient */}
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Send To</label>
                <div className="flex gap-1">
                  <button
                    onClick={() => setNewReminder(prev => ({ ...prev, recipient: 'crew' }))}
                    className={`px-2.5 py-1.5 rounded text-xs font-medium transition-all ${
                      newReminder.recipient === 'crew'
                        ? 'bg-teal-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                    }`}
                  >
                    Crew
                  </button>
                  <button
                    onClick={() => setNewReminder(prev => ({ ...prev, recipient: 'client' }))}
                    className={`px-2.5 py-1.5 rounded text-xs font-medium transition-all ${
                      newReminder.recipient === 'client'
                        ? 'bg-teal-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                    }`}
                  >
                    Client
                  </button>
                  <button
                    onClick={() => setNewReminder(prev => ({ ...prev, recipient: 'both' }))}
                    className={`px-2.5 py-1.5 rounded text-xs font-medium transition-all ${
                      newReminder.recipient === 'both'
                        ? 'bg-teal-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                    }`}
                  >
                    Both
                  </button>
                </div>
              </div>

              {/* Custom Message */}
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">
                  Custom Message (Optional)
                </label>
                <textarea
                  value={newReminder.message}
                  onChange={(e) => setNewReminder(prev => ({
                    ...prev,
                    message: e.target.value
                  }))}
                  placeholder="Reminder: Your job at {site} is coming up!"
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-sm text-slate-100 resize-none"
                />
              </div>

              {/* Add Button */}
              <button
                onClick={handleAddReminder}
                className="w-full py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Reminder
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5"
            >
              <Check className="h-3.5 w-3.5" />
              Save Reminders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component for quick reminder presets
export const ReminderPresets = ({ onSelectPreset }) => {
  const presets = [
    { label: '5 min before', minutes: 5, method: 'email' },
    { label: '15 min before', minutes: 15, method: 'email' },
    { label: '30 min before', minutes: 30, method: 'email' },
    { label: '1 hour before', minutes: 60, method: 'email' },
    { label: '1 day before', minutes: 1440, method: 'email' },
    { label: '2 days before', minutes: 2880, method: 'email' },
    { label: '1 week before', minutes: 10080, method: 'email' }
  ];

  return (
    <div className="flex gap-1 flex-wrap mb-3">
      {presets.map(preset => (
        <button
          key={preset.minutes}
          onClick={() => onSelectPreset(preset)}
          className="px-2 py-1 rounded text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-750 transition-all"
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
};

export default ReminderSettings;
