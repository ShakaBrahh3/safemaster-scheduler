import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Repeat, X, Check, AlertTriangle } from 'lucide-react';
import { 
  RECURRING_FREQUENCY, 
  DAYS_OF_WEEK, 
  RECURRING_END,
  TIME_SLOT_DURATIONS
} from '../constants/recurring';
import { formatRecurringDescription, generateJobId } from '../utils/recurring';

/**
 * Modal for creating/editing recurring jobs
 */
export const RecurringJobModal = ({
  showModal,
  setShowModal,
  job,
  onSave,
  crews,
  TICKETS
}) => {
  const [recurringSettings, setRecurringSettings] = useState({
    frequency: 'none',
    interval: 1,
    daysOfWeek: [],
    dayOfMonth: 1,
    weekOfMonth: 1,
    monthOption: 'same_day',
    endType: 'never',
    endAfter: 10,
    endDate: '',
    maxOccurrences: 50,
    startDate: job?.date || new Date().toISOString().split('T')[0]
  });

  const [timeSettings, setTimeSettings] = useState({
    startTime: job?.startTime || '09:00',
    endTime: job?.endTime || '17:00',
    duration: job?.duration || 480 // 8 hours in minutes
  });

  const [errors, setErrors] = useState({});
  const [previewJobs, setPreviewJobs] = useState([]);

  // Update preview when settings change
  useEffect(() => {
    if (recurringSettings.frequency !== 'none') {
      const preview = generatePreviewJobs();
      setPreviewJobs(preview);
    } else {
      setPreviewJobs([]);
    }
  }, [recurringSettings, timeSettings]);

  // Generate preview of recurring jobs
  const generatePreviewJobs = () => {
    const startDate = new Date(recurringSettings.startDate);
    const endDate = getEndDate();
    
    const jobs = [];
    const currentDate = new Date(startDate);
    let occurrenceCount = 0;
    const maxOccurrences = Math.min(recurringSettings.maxOccurrences, 20); // Limit preview
    
    while (currentDate <= endDate && occurrenceCount < maxOccurrences) {
      if (matchesPattern(currentDate)) {
        const dayName = getDayName(currentDate.getDay());
        jobs.push({
          date: currentDate.toISOString().split('T')[0],
          day: dayName,
          startTime: timeSettings.startTime,
          endTime: timeSettings.endTime,
          occurrence: occurrenceCount + 1
        });
        occurrenceCount++;
      }
      advanceDate(currentDate);
    }
    
    return jobs;
  };

  // Match recurring pattern
  const matchesPattern = (date) => {
    const dayIndex = date.getDay();
    const dayValue = DAYS_OF_WEEK[dayIndex]?.value;
    
    switch (recurringSettings.frequency) {
      case 'daily':
        return true;
      case 'weekly':
        return recurringSettings.daysOfWeek.includes(dayValue);
      case 'biweekly':
        if (!recurringSettings.daysOfWeek.includes(dayValue)) return false;
        const start = new Date(recurringSettings.startDate);
        const weekDiff = Math.floor((date - start) / (7 * 24 * 60 * 60 * 1000));
        return weekDiff % 2 === 0;
      case 'monthly':
        return date.getDate() === recurringSettings.dayOfMonth;
      default:
        return true;
    }
  };

  // Advance date based on frequency
  const advanceDate = (date) => {
    switch (recurringSettings.frequency) {
      case 'daily':
        date.setDate(date.getDate() + recurringSettings.interval);
        break;
      case 'weekly':
        date.setDate(date.getDate() + (7 * recurringSettings.interval));
        break;
      case 'biweekly':
        date.setDate(date.getDate() + (14 * recurringSettings.interval));
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + recurringSettings.interval);
        break;
      default:
        date.setDate(date.getDate() + 1);
    }
  };

  // Get end date for preview
  const getEndDate = () => {
    if (recurringSettings.endType === 'on_date' && recurringSettings.endDate) {
      return new Date(recurringSettings.endDate);
    }
    
    const endDate = new Date(recurringSettings.startDate);
    endDate.setMonth(endDate.getMonth() + 3); // Preview 3 months
    return endDate;
  };

  // Get day name from index
  const getDayName = (index) => {
    return DAYS_OF_WEEK[index]?.label || DAYS_OF_WEEK[0].label;
  };

  // Handle frequency change
  const handleFrequencyChange = (frequency) => {
    setRecurringSettings(prev => ({
      ...prev,
      frequency,
      // Reset daysOfWeek for non-weekly frequencies
      daysOfWeek: frequency === 'weekly' || frequency === 'biweekly' 
        ? prev.daysOfWeek.length > 0 ? prev.daysOfWeek : [DAYS_OF_WEEK[0].value]
        : []
    }));
  };

  // Handle day of week toggle
  const handleDayToggle = (dayValue) => {
    setRecurringSettings(prev => {
      const days = [...prev.daysOfWeek];
      const index = days.indexOf(dayValue);
      if (index > -1) {
        days.splice(index, 1);
      } else {
        days.push(dayValue);
      }
      return { ...prev, daysOfWeek: days };
    });
  };

  // Handle time change
  const handleTimeChange = (field, value) => {
    setTimeSettings(prev => {
      const newTime = { ...prev, [field]: value };
      
      // Auto-calculate duration if both times are set
      if (field === 'startTime' || field === 'endTime') {
        const startMins = timeToMinutes(newTime.startTime);
        const endMins = timeToMinutes(newTime.endTime);
        newTime.duration = endMins - startMins;
      }
      
      // Auto-calculate end time if duration changes
      if (field === 'duration') {
        const startMins = timeToMinutes(newTime.startTime);
        newTime.endTime = minutesToTime(startMins + parseInt(value));
      }
      
      return newTime;
    });
  };

  // Convert time to minutes
  const timeToMinutes = (time) => {
    if (!time) return 0;
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + (minutes || 0);
  };

  // Convert minutes to time
  const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  // Validate settings
  const validateSettings = () => {
    const newErrors = {};
    
    if (recurringSettings.frequency !== 'none') {
      if (recurringSettings.frequency === 'weekly' && recurringSettings.daysOfWeek.length === 0) {
        newErrors.daysOfWeek = 'Please select at least one day of the week';
      }
      
      if (recurringSettings.frequency === 'monthly' && 
          (recurringSettings.dayOfMonth < 1 || recurringSettings.dayOfMonth > 31)) {
        newErrors.dayOfMonth = 'Please enter a valid day (1-31)';
      }
      
      if (recurringSettings.endType === 'after_occurrences' && 
          (recurringSettings.endAfter < 1 || recurringSettings.endAfter > 100)) {
        newErrors.endAfter = 'Please enter a valid number of occurrences (1-100)';
      }
      
      if (recurringSettings.endType === 'on_date' && !recurringSettings.endDate) {
        newErrors.endDate = 'Please select an end date';
      }
    }
    
    if (timeSettings.startTime >= timeSettings.endTime) {
      newErrors.time = 'End time must be after start time';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSave = () => {
    if (!validateSettings()) {
      return;
    }
    
    const recurringConfig = recurringSettings.frequency === 'none' 
      ? null 
      : {
          ...recurringSettings,
          // Don't include endDate if endType is not 'on_date'
          endDate: recurringSettings.endType === 'on_date' ? recurringSettings.endDate : undefined
        };
    
    const jobData = {
      ...job,
      id: job.id || generateJobId('job'),
      startTime: timeSettings.startTime,
      endTime: timeSettings.endTime,
      duration: timeSettings.duration,
      recurring: recurringConfig,
      isRecurring: recurringConfig !== null
    };
    
    onSave(jobData);
    setShowModal(false);
  };

  // Handle cancel
  const handleCancel = () => {
    setShowModal(false);
  };

  if (!showModal) return null;

  // Calculate total occurrences for preview
  const totalOccurrences = previewJobs.length;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in-50">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center sticky top-0">
          <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
            <Repeat className="h-4 w-4" />
            Recurring Job Settings
          </h3>
          <button 
            type="button"
            onClick={handleCancel}
            className="text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Time Settings */}
          <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Time Settings
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Start Time</label>
                <select
                  value={timeSettings.startTime}
                  onChange={(e) => handleTimeChange('startTime', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-sm text-slate-100"
                >
                  {generateTimeOptions()}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">End Time</label>
                <select
                  value={timeSettings.endTime}
                  onChange={(e) => handleTimeChange('endTime', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-sm text-slate-100"
                >
                  {generateTimeOptions()}
                </select>
              </div>
            </div>
            
            <div className="mt-2">
              <label className="text-xs text-slate-400 font-medium block mb-1">Duration</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={timeSettings.duration}
                  onChange={(e) => handleTimeChange('duration', parseInt(e.target.value) || 0)}
                  min="15"
                  max="1440"
                  step="15"
                  className="w-20 bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-sm text-slate-100"
                />
                <span className="text-xs text-slate-400">minutes</span>
              </div>
            </div>
            
            {errors.time && (
              <p className="text-xs text-rose-400 mt-1">{errors.time}</p>
            )}
          </div>

          {/* Recurring Settings */}
          <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Recurring Pattern
            </h4>
            
            {/* Frequency */}
            <div className="mb-3">
              <label className="text-xs text-slate-400 font-medium block mb-1">Repeat</label>
              <div className="flex gap-1 flex-wrap">
                {Object.values(RECURRING_FREQUENCY).map(freq => (
                  <button
                    key={freq.value}
                    onClick={() => handleFrequencyChange(freq.value)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                      recurringSettings.frequency === freq.value
                        ? 'bg-teal-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                    }`}
                  >
                    {freq.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Weekly: Days of week */}
            {(recurringSettings.frequency === 'weekly' || recurringSettings.frequency === 'biweekly') && (
              <div className="mb-3">
                <label className="text-xs text-slate-400 font-medium block mb-1">
                  {recurringSettings.frequency === 'biweekly' ? 'Days (every 2 weeks)' : 'Days of Week'}
                </label>
                <div className="flex gap-1 flex-wrap">
                  {DAYS_OF_WEEK.map(day => {
                    const isSelected = recurringSettings.daysOfWeek.includes(day.value);
                    return (
                      <button
                        key={day.value}
                        onClick={() => handleDayToggle(day.value)}
                        className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-teal-500 text-slate-950'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                        }`}
                      >
                        {day.short}
                      </button>
                    );
                  })}
                </div>
                {errors.daysOfWeek && (
                  <p className="text-xs text-rose-400 mt-1">{errors.daysOfWeek}</p>
                )}
              </div>
            )}

            {/* Monthly: Day of month */}
            {recurringSettings.frequency === 'monthly' && (
              <div className="mb-3">
                <label className="text-xs text-slate-400 font-medium block mb-1">Day of Month</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={recurringSettings.dayOfMonth}
                    onChange={(e) => setRecurringSettings(prev => ({
                      ...prev,
                      dayOfMonth: parseInt(e.target.value) || 1
                    }))}
                    min="1"
                    max="31"
                    className="w-16 bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-sm text-slate-100"
                  />
                  <select
                    value={recurringSettings.monthOption}
                    onChange={(e) => setRecurringSettings(prev => ({
                      ...prev,
                      monthOption: e.target.value
                    }))}
                    className="bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-sm text-slate-100"
                  >
                    <option value="same_day">Same day each month</option>
                    <option value="same_weekday">Same weekday each month</option>
                    <option value="last_day">Last day of month</option>
                  </select>
                </div>
                {errors.dayOfMonth && (
                  <p className="text-xs text-rose-400 mt-1">{errors.dayOfMonth}</p>
                )}
              </div>
            )}

            {/* Interval */}
            {recurringSettings.frequency !== 'none' && recurringSettings.frequency !== 'daily' && (
              <div className="mb-3">
                <label className="text-xs text-slate-400 font-medium block mb-1">
                  Repeat every {recurringSettings.interval} {recurringSettings.frequency}(s)
                </label>
                <input
                  type="number"
                  value={recurringSettings.interval}
                  onChange={(e) => setRecurringSettings(prev => ({
                    ...prev,
                    interval: parseInt(e.target.value) || 1
                  }))}
                  min="1"
                  max="12"
                  className="w-16 bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-sm text-slate-100"
                />
              </div>
            )}

            {/* End Settings */}
            {recurringSettings.frequency !== 'none' && (
              <div className="pt-3 border-t border-slate-800">
                <label className="text-xs text-slate-400 font-medium block mb-1">Ends</label>
                <div className="flex gap-2 mb-2">
                  {Object.values(RECURRING_END).map(end => (
                    <button
                      key={end.value}
                      onClick={() => setRecurringSettings(prev => ({
                        ...prev,
                        endType: end.value
                      }))}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                        recurringSettings.endType === end.value
                          ? 'bg-teal-500 text-slate-950'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                      }`}
                    >
                      {end.label}
                    </button>
                  ))}
                </div>
                
                {recurringSettings.endType === 'after_occurrences' && (
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="number"
                      value={recurringSettings.endAfter}
                      onChange={(e) => setRecurringSettings(prev => ({
                        ...prev,
                        endAfter: parseInt(e.target.value) || 10
                      }))}
                      min="1"
                      max="100"
                      className="w-16 bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-sm text-slate-100"
                    />
                    <span className="text-xs text-slate-400">occurrences</span>
                  </div>
                )}
                
                {recurringSettings.endType === 'on_date' && (
                  <div className="mb-2">
                    <input
                      type="date"
                      value={recurringSettings.endDate}
                      onChange={(e) => setRecurringSettings(prev => ({
                        ...prev,
                        endDate: e.target.value
                      }))}
                      min={recurringSettings.startDate}
                      className="bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-sm text-slate-100"
                    />
                  </div>
                )}
                
                {errors.endAfter && (
                  <p className="text-xs text-rose-400">{errors.endAfter}</p>
                )}
                {errors.endDate && (
                  <p className="text-xs text-rose-400">{errors.endDate}</p>
                )}
              </div>
            )}
          </div>

          {/* Preview */}
          {recurringSettings.frequency !== 'none' && (
            <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Preview ({totalOccurrences} occurrences)
              </h4>
              
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {previewJobs.map((preview, index) => (
                  <div
                    key={index}
                    className="p-2 bg-slate-800/50 border border-slate-700 rounded text-xs"
                  >
                    <div className="flex justify-between">
                      <span className="text-slate-300">{preview.date}</span>
                      <span className="text-slate-400">{preview.day}</span>
                    </div>
                    <div className="text-slate-500">
                      {preview.startTime} - {preview.endTime}
                    </div>
                  </div>
                ))}
              </div>
              
              {totalOccurrences >= 20 && (
                <p className="text-xs text-slate-500 mt-2">
                  Showing first 20 occurrences. {formatRecurringDescription(recurringSettings)}
                </p>
              )}
            </div>
          )}

          {/* Description */}
          {recurringSettings.frequency !== 'none' && (
            <div className="p-3 bg-slate-800/30 rounded border border-slate-700/50">
              <p className="text-xs text-slate-400">
                <strong className="text-slate-300">Pattern:</strong> {formatRecurringDescription(recurringSettings)}
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
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5"
            >
              <Check className="h-3.5 w-3.5" />
              Save Recurring Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to generate time options
const generateTimeOptions = () => {
  const options = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const label = formatTimeLabel(hour, minute);
      options.push(
        <option key={time} value={time}>{label}</option>
      );
    }
  }
  return options;
};

// Format time for display
const formatTimeLabel = (hour, minute) => {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
};

export default RecurringJobModal;
