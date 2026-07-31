// Recurring job utilities
import { DAYS, DAYS_OF_WEEK } from '../constants';

/**
 * Generate recurring job instances from a template
 * @param {Object} jobTemplate - The job template with recurring settings
 * @param {Date} startDate - The start date for generating instances
 * @param {Date} endDate - Optional end date to limit generation
 * @returns {Array} Array of job instances
 */
export const generateRecurringJobs = (jobTemplate, startDate = new Date(), endDate = null) => {
  const instances = [];
  const { recurring } = jobTemplate;
  
  if (!recurring || recurring.frequency === 'none') {
    return [jobTemplate];
  }

  const currentDate = new Date(startDate);
  const maxDate = endDate ? new Date(endDate) : getMaxDate(recurring);
  
  let occurrenceCount = 0;
  const maxOccurrences = recurring.maxOccurrences || 50;

  while (currentDate <= maxDate && occurrenceCount < maxOccurrences) {
    // Skip the first occurrence if it's the template itself
    if (occurrenceCount === 0 && !isSameDay(currentDate, new Date(jobTemplate.createdAt))) {
      // This is the first generated instance
    }
    
    // Check if this date matches the recurring pattern
    if (matchesRecurringPattern(currentDate, recurring)) {
      const jobInstance = createJobInstance(jobTemplate, currentDate, occurrenceCount);
      instances.push(jobInstance);
      occurrenceCount++;
    }
    
    // Move to next date based on frequency
    advanceDate(currentDate, recurring.frequency, recurring.interval);
  }
  
  return instances;
};

/**
 * Check if a date matches the recurring pattern
 * @param {Date} date - The date to check
 * @param {Object} recurring - Recurring settings
 * @returns {boolean} True if date matches pattern
 */
const matchesRecurringPattern = (date, recurring) => {
  switch (recurring.frequency) {
    case 'daily':
      return true; // Every day matches
    
    case 'weekly':
      const dayIndex = (date.getDay() + 6) % 7;
      const dayValue = DAYS_OF_WEEK[dayIndex]?.value;
      return recurring.daysOfWeek.includes(dayValue);
    
    case 'biweekly': {
      const biweekDayIndex = date.getDay();
      const biweekDayValue = DAYS_OF_WEEK[biweekDayIndex]?.value;
      if (!recurring.daysOfWeek.includes(biweekDayValue)) return false;
      
      // Check if it's the correct week (every 2 weeks)
      const biweekStartDate = new Date(recurring.startDate || date);
      const biweekWeekDiff = getWeekDifference(biweekStartDate, date);
      return biweekWeekDiff % 2 === 0;
    }
    
    case 'monthly':
      return matchesMonthlyPattern(date, recurring);
    
    case 'yearly':
      return matchesYearlyPattern(date, recurring);
    
    default:
      return true;
  }
};

/**
 * Check if date matches monthly pattern
 */
const matchesMonthlyPattern = (date, recurring) => {
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  
  switch (recurring.monthOption) {
    case 'same_day':
      return day === recurring.dayOfMonth;
    
    case 'same_weekday':
      // Find the nth occurrence of this weekday in the month
      const weekday = date.getDay(); // 0=Sunday
      const firstDay = new Date(year, month, 1);
      const firstWeekday = firstDay.getDay();
      const offset = (weekday - firstWeekday + 7) % 7;
      const occurrence = Math.floor((day - 1 - offset) / 7) + 1;
      return occurrence === recurring.weekOfMonth;
    
    case 'last_day':
      const lastDay = new Date(year, month + 1, 0).getDate();
      return day === lastDay;
    
    case 'custom':
      return day === recurring.dayOfMonth;
    
    default:
      return day === recurring.dayOfMonth;
  }
};

/**
 * Check if date matches yearly pattern
 */
const matchesYearlyPattern = (date, recurring) => {
  const month = date.getMonth();
  const day = date.getDate();
  
  return month === (recurring.month - 1) && day === recurring.dayOfMonth;
};

/**
 * Create a job instance from template
 */
const createJobInstance = (template, date, occurrenceIndex) => {
  const dayName = DAYS[date.getDay()] || DAYS[0];
  
  return {
    ...template,
    id: `${template.id}-recurring-${occurrenceIndex}`,
    day: dayName,
    date: date.toISOString().split('T')[0],
    startTime: template.startTime || '09:00',
    endTime: template.endTime || '17:00',
    isRecurring: true,
    recurringInstance: occurrenceIndex,
    parentJobId: template.id,
    status: 'scheduled'
  };
};

/**
 * Advance date based on frequency
 */
const advanceDate = (date, frequency, interval = 1) => {
  switch (frequency) {
    case 'daily':
      date.setDate(date.getDate() + interval);
      break;
    case 'weekly':
      date.setDate(date.getDate() + (7 * interval));
      break;
    case 'biweekly':
      date.setDate(date.getDate() + (14 * interval));
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + interval);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + interval);
      break;
    default:
      date.setDate(date.getDate() + 1);
  }
};

/**
 * Get maximum date for recurring jobs
 */
const getMaxDate = (recurring) => {
  if (recurring.endType === 'never') {
    // Max 1 year from now
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1);
    return maxDate;
  }
  
  if (recurring.endType === 'on_date' && recurring.endDate) {
    return new Date(recurring.endDate);
  }
  
  // Default to 1 year
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);
  return maxDate;
};

/**
 * Check if two dates are the same day
 */
const isSameDay = (date1, date2) => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};

/**
 * Get week difference between two dates
 */
const getWeekDifference = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  
  const diffTime = Math.abs(d2 - d1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 7);
};

/**
 * Format recurring description
 */
export const formatRecurringDescription = (recurring) => {
  if (!recurring || recurring.frequency === 'none') {
    return 'One time';
  }
  
  const frequency = recurring.frequency === 'biweekly'
    ? 'Bi-weekly'
    : recurring.frequency.charAt(0).toUpperCase() + recurring.frequency.slice(1);
  
  let description = `Repeats ${frequency}`;
  
  if (recurring.interval > 1) {
    description += ` every ${recurring.interval} ${recurring.frequency}`;
  }
  
  if (recurring.frequency === 'weekly' && recurring.daysOfWeek.length > 0) {
    const days = recurring.daysOfWeek.map(d => {
      const day = DAYS_OF_WEEK.find(w => w.value === d);
      return day ? day.short : d;
    });
    description += ` on ${days.join(', ')}`;
  }
  
  if (recurring.endType !== 'never') {
    if (recurring.endType === 'after_occurrences') {
      description += `, ends after ${recurring.endAfter} occurrences`;
    } else if (recurring.endType === 'on_date' && recurring.endDate) {
      const endDate = new Date(recurring.endDate);
      description += `, ends on ${endDate.toLocaleDateString()}`;
    }
  }
  
  return description;
};

/**
 * Check if a job is part of a recurring series
 */
export const isRecurringJob = (job) => {
  return job.isRecurring || job.parentJobId || job.recurringInstance !== undefined;
};

/**
 * Get the parent job from a recurring instance
 */
export const getParentJobId = (job) => {
  return job.parentJobId || job.id;
};

/**
 * Generate iCal/ICS content for a job
 */
export const generateICalContent = (job, crew = null) => {
  const startDate = job.date ? new Date(`${job.date}T${job.startTime || '09:00'}`) : new Date();
  const endDate = job.date ? new Date(`${job.date}T${job.endTime || '17:00'}`) : new Date();
  endDate.setHours(endDate.getHours() + 2); // Default 2 hour duration
  
  const uid = `safemaster-${job.id}-${Date.now()}@safemaster.com.au`;
  const organizer = crew ? `CN=${crew.name}:MAILTO:${crew.email}` : 'CN=SafeMaster Scheduler';
  const attendee = crew ? `MAILTO:${crew.email}` : '';
  
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//SafeMaster Scheduler//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace('\.', '')}
DTSTART:${formatICalDate(startDate)}
DTEND:${formatICalDate(endDate)}
SUMMARY:${job.site || 'Job'}
DESCRIPTION:${escapeICalText(job.notes || '')}
LOCATION:${job.site || ''}
ORGANIZER:${organizer}
ATTENDEE:${attendee}
STATUS:CONFIRMED
SEQUENCE:0
TRANSP:OPAQUE
CLASS:PUBLIC
END:VEVENT
END:VCALENDAR`;
};

/**
 * Format date for iCal
 */
const formatICalDate = (date) => {
  const pad = (num) => num.toString().padStart(2, '0');
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;
};

/**
 * Escape text for iCal
 */
const escapeICalText = (text) => {
  return text.replace(/[,\\n;]/g, (match) => {
    switch (match) {
      case ',': return '\\,';
      case '\\': return '\\\\';
      case ';': return '\\;';
      case '\n': return '\\n';
      default: return match;
    }
  });
};

/**
 * Check for scheduling conflicts
 */
export const checkConflict = (newJob, existingJobs, crewId = null) => {
  if (!newJob.date || !newJob.startTime || !newJob.endTime) {
    return false; // Can't check without time info
  }
  
  const newStart = new Date(`${newJob.date}T${newJob.startTime}`);
  const newEnd = new Date(`${newJob.date}T${newJob.endTime}`);
  
  // Filter jobs for the same crew and date
  const relevantJobs = existingJobs.filter(job => {
    if (crewId && job.crewId !== crewId) return false;
    if (!job.date) return false;
    if (job.id === newJob.id) return false; // Skip self
    
    const jobDate = new Date(job.date);
    const newDate = new Date(newJob.date);
    
    // Same day check
    return jobDate.getFullYear() === newDate.getFullYear() &&
           jobDate.getMonth() === newDate.getMonth() &&
           jobDate.getDate() === newDate.getDate();
  });
  
  // Check for overlaps
  for (const job of relevantJobs) {
    if (!job.startTime || !job.endTime) continue;
    
    const jobStart = new Date(`${job.date}T${job.startTime}`);
    const jobEnd = new Date(`${job.date}T${job.endTime}`);
    
    // Check if times overlap
    if (newStart < jobEnd && newEnd > jobStart) {
      return true; // Conflict found
    }
  }
  
  return false; // No conflicts
};

/**
 * Generate unique job ID
 */
export const generateJobId = (prefix = 'job') => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
};

/**
 * Format time for display
 */
export const formatTime = (timeString) => {
  if (!timeString) return '';
  
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours);
  const minute = minutes || '00';
  
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  
  return `${displayHour}:${minute} ${period}`;
};

/**
 * Parse time string to minutes
 */
export const timeToMinutes = (timeString) => {
  if (!timeString) return 0;
  
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + (minutes || 0);
};

/**
 * Minutes to time string
 */
export const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

/**
 * Calculate duration in minutes
 */
export const calculateDuration = (startTime, endTime) => {
  return timeToMinutes(endTime) - timeToMinutes(startTime);
};

/**
 * Format duration for display
 */
export const formatDuration = (minutes) => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (mins === 0) {
    return `${hours} hr${hours > 1 ? 's' : ''}`;
  }
  
  return `${hours} hr ${mins} min`;
};

/**
 * Get available time slots for a crew on a given day
 */
export const getAvailableTimeSlots = (crew, date, existingJobs, slotDuration = 30) => {
  const workingHours = crew.workingHours || { start: '08:00', end: '17:00' };
  const startTime = timeToMinutes(workingHours.start);
  const endTime = timeToMinutes(workingHours.end);
  
  // Create all possible slots
  const allSlots = [];
  for (let mins = startTime; mins + slotDuration <= endTime; mins += slotDuration) {
    allSlots.push({
      start: minutesToTime(mins),
      end: minutesToTime(mins + slotDuration),
      startMinutes: mins,
      endMinutes: mins + slotDuration
    });
  }
  
  // Filter out booked slots
  const bookedSlots = existingJobs
    .filter(job => job.crewId === crew.id && job.date === date)
    .map(job => ({
      start: timeToMinutes(job.startTime || workingHours.start),
      end: timeToMinutes(job.endTime || workingHours.end)
    }));
  
  const availableSlots = [];
  for (const slot of allSlots) {
    const conflicts = bookedSlots.filter(booked => 
      slot.startMinutes < booked.end && slot.endMinutes > booked.start
    );
    
    if (conflicts.length === 0) {
      availableSlots.push(slot);
    }
  }
  
  return availableSlots;
};

export default {
  generateRecurringJobs,
  formatRecurringDescription,
  isRecurringJob,
  getParentJobId,
  generateICalContent,
  checkConflict,
  generateJobId,
  formatTime,
  timeToMinutes,
  minutesToTime,
  calculateDuration,
  formatDuration,
  getAvailableTimeSlots
};
