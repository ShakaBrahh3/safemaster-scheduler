import React, { useState, useEffect } from 'react';
import { Clock, Check, X, AlertTriangle } from 'lucide-react';
import { getAvailableTimeSlots, formatTime, calculateDuration } from '../utils/recurring';

/**
 * Time slot selector component for scheduling jobs
 * Shows available time slots for a crew on a given day
 */
export const TimeSlotSelector = ({
  showModal,
  setShowModal,
  crew,
  date,
  existingJobs,
  onSelect,
  minDuration = 30,
  maxDuration = 480
}) => {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [duration, setDuration] = useState(60); // Default 1 hour
  const [availableSlots, setAvailableSlots] = useState([]);
  const [customStart, setCustomStart] = useState('09:00');
  const [customEnd, setCustomEnd] = useState('10:00');
  const [useCustom, setUseCustom] = useState(false);
  const [error, setError] = useState(null);

  // Calculate available slots when props change
  useEffect(() => {
    if (crew && date) {
      const slots = getAvailableTimeSlots(crew, date, existingJobs, minDuration);
      setAvailableSlots(slots);
      setSelectedSlot(null);
    }
  }, [crew, date, existingJobs, minDuration]);

  // Handle slot selection
  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setDuration(calculateDuration(slot.start, slot.end));
    setUseCustom(false);
    setError(null);
  };

  // Handle custom time change
  const handleCustomTimeChange = (field, value) => {
    if (field === 'start') {
      setCustomStart(value);
    } else {
      setCustomEnd(value);
    }
    setUseCustom(true);
    setSelectedSlot(null);
  };

  // Validate custom times
  const validateCustomTimes = () => {
    if (customStart >= customEnd) {
      setError('End time must be after start time');
      return false;
    }
    
    const duration = calculateDuration(customStart, customEnd);
    if (duration < minDuration) {
      setError(`Minimum duration is ${minDuration} minutes`);
      return false;
    }
    
    if (duration > maxDuration) {
      setError(`Maximum duration is ${maxDuration} minutes (${maxDuration / 60} hours)`);
      return false;
    }
    
    setError(null);
    return true;
  };

  // Handle save
  const handleSave = () => {
    if (useCustom) {
      if (!validateCustomTimes()) {
        return;
      }
      onSelect({
        startTime: customStart,
        endTime: customEnd,
        duration: calculateDuration(customStart, customEnd)
      });
    } else if (selectedSlot) {
      onSelect({
        startTime: selectedSlot.start,
        endTime: selectedSlot.end,
        duration: calculateDuration(selectedSlot.start, selectedSlot.end)
      });
    } else {
      setError('Please select a time slot');
      return;
    }
    setShowModal(false);
  };

  // Handle cancel
  const handleCancel = () => {
    setShowModal(false);
    setSelectedSlot(null);
    setUseCustom(false);
    setError(null);
  };

  // Generate time options
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push(
          <option key={time} value={time}>{formatTime(time)}</option>
        );
      }
    }
    return options;
  };

  if (!showModal || !crew || !date) return null;

  // Format date for display
  const formattedDate = new Date(date).toLocaleDateString('en-AU', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in-50">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
          <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Select Time Slot
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
          {/* Crew and Date Info */}
          <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800">
            <p className="text-sm text-slate-300">
              <strong>Crew:</strong> {crew.name}
            </p>
            <p className="text-sm text-slate-300">
              <strong>Date:</strong> {formattedDate}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Working hours: {crew.workingHours?.start || '08:00'} - {crew.workingHours?.end || '17:00'}
            </p>
          </div>

          {/* Available Slots */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Available Time Slots
            </h4>
            
            {availableSlots.length === 0 ? (
              <div className="p-4 bg-amber-900/20 border border-amber-700 rounded-lg text-center">
                <AlertTriangle className="h-6 w-6 text-amber-400 mx-auto mb-2" />
                <p className="text-sm text-amber-300">No available slots</p>
                <p className="text-xs text-amber-400 mt-1">
                  {crew.name} is fully booked on {formattedDate}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                {availableSlots.map((slot, index) => {
                  const duration = calculateDuration(slot.start, slot.end);
                  const isSelected = selectedSlot?.start === slot.start && selectedSlot?.end === slot.end;
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handleSlotSelect(slot)}
                      className={`p-2 rounded-lg border text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-teal-500 text-slate-950 border-teal-700'
                          : 'bg-slate-800/50 text-slate-300 border-slate-700 hover:bg-slate-750'
                      }`}
                    >
                      <div className="text-left">
                        <div className="font-semibold">{formatTime(slot.start)}</div>
                        <div className="text-slate-400">{formatTime(slot.end)}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {duration} min
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Custom Time */}
          <div className="pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                id="useCustom"
                checked={useCustom}
                onChange={(e) => setUseCustom(e.target.checked)}
                className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-teal-500 focus:ring-teal-500"
              />
              <label htmlFor="useCustom" className="text-xs text-slate-300 font-medium">
                Use custom time
              </label>
            </div>

            {useCustom && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Start Time</label>
                  <select
                    value={customStart}
                    onChange={(e) => handleCustomTimeChange('start', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-sm text-slate-100"
                  >
                    {generateTimeOptions()}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">End Time</label>
                  <select
                    value={customEnd}
                    onChange={(e) => handleCustomTimeChange('end', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-sm text-slate-100"
                  >
                    {generateTimeOptions()}
                  </select>
                </div>
              </div>
            )}

            {useCustom && (
              <div className="mt-2 p-2 bg-slate-800/50 rounded border border-slate-700">
                <p className="text-xs text-slate-400">
                  Duration: {calculateDuration(customStart, customEnd)} minutes
                </p>
              </div>
            )}

            {error && (
              <div className="p-2 bg-rose-900/20 border border-rose-700 rounded-lg">
                <p className="text-xs text-rose-400">{error}</p>
              </div>
            )}
          </div>

          {/* Selected Slot Summary */}
          {(selectedSlot || useCustom) && (
            <div className="p-3 bg-teal-900/10 border border-teal-700/30 rounded-lg">
              <p className="text-xs text-teal-300 font-medium">
                Selected: {useCustom ? customStart : selectedSlot?.start} - {useCustom ? customEnd : selectedSlot?.end}
              </p>
              <p className="text-xs text-teal-400">
                Duration: {useCustom 
                  ? calculateDuration(customStart, customEnd) 
                  : calculateDuration(selectedSlot?.start, selectedSlot?.end)} minutes
              </p>
            </div>
          )}

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
              disabled={!selectedSlot && !useCustom}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5"
            >
              <Check className="h-3.5 w-3.5" />
              Select Time
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeSlotSelector;
