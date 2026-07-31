import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, User, Check, X } from 'lucide-react';
import { DAYS as DAYS, DAYS_OF_WEEK, AVAILABILITY_STATUS } from '../constants/recurring';

/**
 * Availability calendar component for managing crew availability
 */
export const AvailabilityCalendar = ({
  crews,
  schedule,
  onAvailabilityChange,
  startDate = new Date()
}) => {
  const [currentDate, setCurrentDate] = useState(new Date(startDate));
  const [selectedCrew, setSelectedCrew] = useState(crews[0]?.id || null);
  const [viewMode, setViewMode] = useState('week'); // 'week' or 'month'
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

  // Get current month/week data
  const getCalendarData = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    if (viewMode === 'month') {
      return generateMonthData(year, month);
    } else {
      return generateWeekData(currentDate);
    }
  };

  // Generate month data
  const generateMonthData = (year, month) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay(); // 0=Sunday
    const daysInMonth = lastDay.getDate();
    
    const days = [];
    
    // Add days from previous month
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        day: prevMonthLastDay - i,
        month: month - 1,
        isCurrentMonth: false,
        isToday: false
      });
    }
    
    // Add days from current month
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        day,
        month,
        isCurrentMonth: true,
        isToday: date.toDateString() === today.toDateString()
      });
    }
    
    // Add days from next month to fill the grid
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: new Date(year, month + 1, day),
        day,
        month: month + 1,
        isCurrentMonth: false,
        isToday: false
      });
    }
    
    return days;
  };

  // Generate week data
  const generateWeekData = (startDate) => {
    const days = [];
    const current = new Date(startDate);
    
    // Go to the start of the week (Monday)
    current.setDate(current.getDate() - current.getDay() + (current.getDay() === 0 ? -6 : 1));
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(current);
      date.setDate(current.getDate() + i);
      
      const today = new Date();
      days.push({
        date,
        day: date.getDate(),
        month: date.getMonth(),
        isCurrentMonth: date.getMonth() === startDate.getMonth(),
        isToday: date.toDateString() === today.toDateString()
      });
    }
    
    return days;
  };

  // Get availability for a crew on a specific day
  const getAvailability = (crewId, date) => {
    const crew = crews.find(c => c.id === crewId);
    if (!crew) return AVAILABILITY_STATUS.AVAILABLE;
    
    // Check if crew has custom availability for this day
    if (crew.availability && crew.availability[date.toISOString().split('T')[0]]) {
      return crew.availability[date.toISOString().split('T')[0]];
    }
    
    // Check if crew has jobs scheduled on this day
    const hasJobs = schedule.some(job => 
      job.crewId === crewId && 
      new Date(job.date).toDateString() === date.toDateString()
    );
    
    // Default to available if no jobs
    return hasJobs ? AVAILABILITY_STATUS.BUSY : AVAILABILITY_STATUS.AVAILABLE;
  };

  // Get jobs for a crew on a specific day
  const getJobsForDay = (crewId, date) => {
    return schedule.filter(job => 
      job.crewId === crewId && 
      new Date(job.date).toDateString() === date.toDateString()
    );
  };

  // Handle availability change
  const handleAvailabilityChange = (crewId, date, status) => {
    onAvailabilityChange(crewId, date, status);
  };

  // Navigate to previous period
  const goToPrevious = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() - 7);
      setCurrentDate(newDate);
    }
  };

  // Navigate to next period
  const goToNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + 7);
      setCurrentDate(newDate);
    }
  };

  // Navigate to today
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get month name
  const getMonthName = (date) => {
    return date.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' });
  };

  // Get week range
  const getWeekRange = (date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay() + (start.getDay() === 0 ? -6 : 1));
    
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    
    return `${start.toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })}`;
  };

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString('en-AU', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const calendarData = getCalendarData();
  const monthName = getMonthName(currentDate);
  const weekRange = getWeekRange(currentDate);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      
      {/* Header */}
      <div className="bg-slate-950 p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Crew Availability
          </h3>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Crew Selector */}
          <select
            value={selectedCrew}
            onChange={(e) => setSelectedCrew(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-xs text-slate-100"
          >
            {crews.map(crew => (
              <option key={crew.id} value={crew.id}>{crew.name}</option>
            ))}
          </select>
          
          {/* View Mode Toggle */}
          <div className="flex rounded-lg overflow-hidden border border-slate-700">
            <button
              onClick={() => setViewMode('week')}
              className={`px-2 py-1.5 text-xs font-medium transition-all ${
                viewMode === 'week' 
                  ? 'bg-teal-500 text-slate-950' 
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-2 py-1.5 text-xs font-medium transition-all ${
                viewMode === 'month' 
                  ? 'bg-teal-500 text-slate-950' 
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Month
            </button>
          </div>
          
          {/* Navigation */}
          <div className="flex items-center gap-1">
            <button
              onClick={goToPrevious}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={goToToday}
              className="px-2 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200"
            >
              Today
            </button>
            <button
              onClick={goToNext}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-px bg-slate-800">
          {DAYS_OF_WEEK.map(day => (
            <div
              key={day.value}
              className="p-2 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider"
            >
              {day.short}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-px bg-slate-800 border border-slate-800">
          {calendarData.map((dayInfo, index) => {
            const crew = crews.find(c => c.id === selectedCrew);
            const availability = getAvailability(selectedCrew, dayInfo.date);
            const jobs = getJobsForDay(selectedCrew, dayInfo.date);
            const isSelected = selectedDay?.toDateString() === dayInfo.date.toDateString();
            
            return (
              <div
                key={index}
                onClick={() => {
                  if (dayInfo.isCurrentMonth) {
                    setSelectedDay(dayInfo.date);
                  }
                }}
                className={`
                  relative aspect-square min-h-[80px] p-2 flex flex-col cursor-pointer transition-all
                  ${dayInfo.isCurrentMonth 
                    ? 'bg-slate-900/50 hover:bg-slate-800/50' 
                    : 'bg-slate-950/30 cursor-not-allowed opacity-50'
                  }
                  ${isSelected ? 'ring-2 ring-teal-500' : ''}
                `}
              >
                {/* Day Number */}
                <div className="flex justify-between items-start">
                  <span className={`text-xs font-bold ${
                    dayInfo.isToday 
                      ? 'text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded' 
                      : 'text-slate-300'
                  }`}>
                    {dayInfo.day}
                  </span>
                  
                  {/* Today indicator */}
                  {dayInfo.isToday && (
                    <span className="text-[8px] bg-teal-500 text-slate-950 px-1 rounded">Today</span>
                  )}
                </div>

                {/* Availability Status */}
                <div className="flex-1 flex items-center justify-center mt-1">
                  {dayInfo.isCurrentMonth && (
                    <span
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                        AVAILABILITY_STATUS[availability]?.color || 'bg-slate-700'
                      } ${AVAILABILITY_STATUS[availability]?.text || 'text-white'}`}
                    >
                      {AVAILABILITY_STATUS[availability]?.label || 'Unknown'}
                    </span>
                  )}
                </div>

                {/* Job Count */}
                {jobs.length > 0 && dayInfo.isCurrentMonth && (
                  <div className="flex justify-end mt-1">
                    <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">
                      {jobs.length} job{jobs.length > 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Period Label */}
        <div className="text-center pt-3">
          <p className="text-xs text-slate-500">
            {viewMode === 'month' ? monthName : weekRange}
          </p>
        </div>
      </div>

      {/* Day Details Modal */}
      {selectedDay && showAvailabilityModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-white text-sm uppercase tracking-wider">
                Set Availability
              </h3>
              <button 
                type="button"
                onClick={() => setShowAvailabilityModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-300">
                Set availability for <strong>{selectedCrew && crews.find(c => c.id === selectedCrew)?.name}</strong> on {selectedDay.toLocaleDateString('en-AU', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>

              <div className="flex gap-2 flex-wrap">
                {Object.values(AVAILABILITY_STATUS).map(status => (
                  <button
                    key={status.value}
                    onClick={() => {
                      handleAvailabilityChange(selectedCrew, selectedDay, status.value);
                      setShowAvailabilityModal(false);
                    }}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      status.color || 'bg-slate-700'
                    } ${status.text || 'text-white'}`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAvailabilityModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Day Details (when clicking a day) */}
      {selectedDay && !showAvailabilityModal && (
        <div className="mt-4 p-4 bg-slate-950/50 border border-slate-800 rounded-lg">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-semibold text-white">
              {selectedDay.toLocaleDateString('en-AU', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h4>
            <button
              onClick={() => setShowAvailabilityModal(true)}
              className="text-xs bg-slate-800 hover:bg-slate-750 text-slate-300 px-2.5 py-1 rounded"
            >
              Set Availability
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-400 mb-1">Jobs Scheduled</p>
              {getJobsForDay(selectedCrew, selectedDay).length > 0 ? (
                <div className="space-y-2">
                  {getJobsForDay(selectedCrew, selectedDay).map(job => (
                    <div
                      key={job.id}
                      className="p-2 bg-slate-800/50 border border-slate-700 rounded text-xs"
                    >
                      <p className="text-slate-300 font-medium">{job.site}</p>
                      <p className="text-slate-400">{job.startTime || 'TBD'} - {job.endTime || 'TBD'}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">No jobs scheduled</p>
              )}
            </div>

            <div>
              <p className="text-xs text-slate-400 mb-1">Availability</p>
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${
                  AVAILABILITY_STATUS[getAvailability(selectedCrew, selectedDay)]?.color || 'bg-slate-700'
                } ${AVAILABILITY_STATUS[getAvailability(selectedCrew, selectedDay)]?.text || 'text-white'}`}
              >
                {AVAILABILITY_STATUS[getAvailability(selectedCrew, selectedDay)]?.label || 'Unknown'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailabilityCalendar;
