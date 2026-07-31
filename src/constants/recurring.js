// Recurring job constants and utilities

// Recurring frequency options
export const RECURRING_FREQUENCY = {
  NONE: { label: 'None', value: 'none' },
  DAILY: { label: 'Daily', value: 'daily' },
  WEEKLY: { label: 'Weekly', value: 'weekly' },
  BIWEEKLY: { label: 'Bi-weekly', value: 'biweekly' },
  MONTHLY: { label: 'Monthly', value: 'monthly' },
  YEARLY: { label: 'Yearly', value: 'yearly' },
  CUSTOM: { label: 'Custom', value: 'custom' }
};

// Days of week for recurring patterns
export const DAYS_OF_WEEK = [
  { label: 'Monday', value: 'monday', short: 'Mon' },
  { label: 'Tuesday', value: 'tuesday', short: 'Tue' },
  { label: 'Wednesday', value: 'wednesday', short: 'Wed' },
  { label: 'Thursday', value: 'thursday', short: 'Thu' },
  { label: 'Friday', value: 'friday', short: 'Fri' },
  { label: 'Saturday', value: 'saturday', short: 'Sat' },
  { label: 'Sunday', value: 'sunday', short: 'Sun' }
];

// Month options for monthly recurring
export const MONTH_OPTIONS = {
  SAME_DAY: { label: 'Same day each month', value: 'same_day' },
  SAME_WEEKDAY: { label: 'Same weekday each month', value: 'same_weekday' },
  LAST_DAY: { label: 'Last day of month', value: 'last_day' },
  CUSTOM: { label: 'Custom day', value: 'custom' }
};

// End date options for recurring jobs
export const RECURRING_END = {
  NEVER: { label: 'Never', value: 'never' },
  AFTER_OCCURRENCES: { label: 'After occurrences', value: 'after_occurrences' },
  ON_DATE: { label: 'On date', value: 'on_date' }
};

// Default recurring settings
export const DEFAULT_RECURRING = {
  frequency: 'none',
  interval: 1,
  daysOfWeek: [],
  dayOfMonth: 1,
  monthOption: 'same_day',
  endType: 'never',
  endAfter: 10,
  endDate: null,
  maxOccurrences: 50
};

// Time slot constants
export const TIME_SLOT_DURATIONS = [
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
  { label: '45 minutes', value: 45 },
  { label: '1 hour', value: 60 },
  { label: '1.5 hours', value: 90 },
  { label: '2 hours', value: 120 },
  { label: '2.5 hours', value: 150 },
  { label: '3 hours', value: 180 },
  { label: '4 hours', value: 240 },
  { label: 'Half day', value: 240 },
  { label: 'Full day', value: 480 }
];

// Buffer time options (between jobs)
export const BUFFER_TIMES = [
  { label: 'No buffer', value: 0 },
  { label: '5 minutes', value: 5 },
  { label: '10 minutes', value: 10 },
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
  { label: '1 hour', value: 60 }
];

// Reminder time options
export const REMINDER_TIMES = [
  { label: 'At time of job', value: 0 },
  { label: '5 minutes before', value: 5 },
  { label: '15 minutes before', value: 15 },
  { label: '30 minutes before', value: 30 },
  { label: '1 hour before', value: 60 },
  { label: '2 hours before', value: 120 },
  { label: '1 day before', value: 1440 },
  { label: '2 days before', value: 2880 },
  { label: '1 week before', value: 10080 }
];

// Notification method options
export const NOTIFICATION_METHODS = {
  EMAIL: { label: 'Email', value: 'email', icon: '📧' },
  SMS: { label: 'SMS', value: 'sms', icon: '📱' },
  BOTH: { label: 'Email + SMS', value: 'both', icon: '📧📱' },
  PUSH: { label: 'Push Notification', value: 'push', icon: '🔔' }
};

// Job status options (expanded)
export const JOB_STATUS = {
  BACKLOG: { label: 'Backlog', value: 'backlog', color: 'bg-slate-700', text: 'text-slate-300' },
  SCHEDULED: { label: 'Scheduled', value: 'scheduled', color: 'bg-emerald-700', text: 'text-emerald-300' },
  IN_PROGRESS: { label: 'In Progress', value: 'in_progress', color: 'bg-blue-700', text: 'text-blue-300' },
  COMPLETED: { label: 'Completed', value: 'completed', color: 'bg-green-700', text: 'text-green-300' },
  CANCELLED: { label: 'Cancelled', value: 'cancelled', color: 'bg-rose-700', text: 'text-rose-300' },
  POSTPONED: { label: 'Postponed', value: 'postponed', color: 'bg-amber-700', text: 'text-amber-300' },
  ON_HOLD: { label: 'On Hold', value: 'on_hold', color: 'bg-slate-700', text: 'text-slate-300' }
};

// Job priority options (expanded)
export const JOB_PRIORITY = {
  CRITICAL: { label: 'Critical', value: 'critical', color: 'bg-rose-500', text: 'text-rose-100', order: 0 },
  HIGH: { label: 'High', value: 'high', color: 'bg-rose-400', text: 'text-rose-950', order: 1 },
  WARNING: { label: 'Warning', value: 'warning', color: 'bg-amber-400', text: 'text-amber-950', order: 2 },
  NORMAL: { label: 'Normal', value: 'normal', color: 'bg-emerald-400', text: 'text-emerald-950', order: 3 },
  LOW: { label: 'Low', value: 'low', color: 'bg-slate-400', text: 'text-slate-950', order: 4 }
};

// Availability status for crew
export const AVAILABILITY_STATUS = {
  AVAILABLE: { label: 'Available', value: 'available', color: 'bg-emerald-500', text: 'text-white' },
  BUSY: { label: 'Busy', value: 'busy', color: 'bg-rose-500', text: 'text-white' },
  ON_LEAVE: { label: 'On Leave', value: 'on_leave', color: 'bg-amber-500', text: 'text-white' },
  OUT_OF_OFFICE: { label: 'Out of Office', value: 'out_of_office', color: 'bg-slate-500', text: 'text-white' },
  PARTIAL: { label: 'Partial Day', value: 'partial', color: 'bg-cyan-500', text: 'text-white' }
};

// Working hours presets
export const WORKING_HOURS_PRESETS = [
  { label: 'Standard (9-5)', value: { start: '09:00', end: '17:00' } },
  { label: 'Early (8-4)', value: { start: '08:00', end: '16:00' } },
  { label: 'Late (10-6)', value: { start: '10:00', end: '18:00' } },
  { label: 'Extended (8-6)', value: { start: '08:00', end: '18:00' } },
  { label: 'Flexible (7-7)', value: { start: '07:00', end: '19:00' } },
  { label: 'Custom', value: null }
];

// Color presets for calendar
export const CALENDAR_COLORS = [
  'bg-blue-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-teal-500',
  'bg-lime-500', 'bg-yellow-500', 'bg-amber-500', 'bg-orange-500',
  'bg-rose-500', 'bg-pink-500', 'bg-purple-500', 'bg-violet-500'
];
export { DAYS } from '../constants';
