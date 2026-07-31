// SafeMaster Scheduler - Utility Functions
// Reusable helper functions and utilities

/**
 * Format currency for Australian dollars
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  if (amount == null) return '$0.00';
  return `$${parseFloat(amount).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Format currency without decimals for compact display
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrencyCompact = (amount) => {
  if (amount == null) return '$0';
  return `$${parseFloat(amount).toLocaleString('en-AU', { maximumFractionDigits: 0 })}`;
};

/**
 * Format a number with commas for thousands
 * @param {number} num - The number to format
 * @returns {string} Formatted number string
 */
export const formatNumber = (num) => {
  if (num == null) return '0';
  return parseFloat(num).toLocaleString('en-AU');
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} Truncated text
 */
export const truncate = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Generate a unique ID
 * @param {string} prefix - Optional prefix for the ID
 * @returns {string} Unique ID
 */
export const generateId = (prefix = 'id') => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Check if a job has a ticket conflict with a crew
 * @param {Object} job - The job to check
 * @param {string} crewId - The crew ID to check against
 * @param {Array} crews - Array of crew objects
 * @returns {boolean} True if there's a conflict
 */
export const checkTicketConflict = (job, crewId, crews) => {
  const crew = crews.find(c => c.id === crewId);
  if (!crew) return true; // Assume conflict if crew not found
  const required = job.requiredTicket || "WAH";
  return !crew.tickets.includes(required);
};

/**
 * Check if a crew is qualified for a job
 * @param {Object} crew - The crew to check
 * @param {Object} job - The job to check
 * @returns {boolean} True if qualified
 */
export const isCrewQualified = (crew, job) => {
  if (!crew || !job) return false;
  const required = job.requiredTicket || "WAH";
  return crew.tickets.includes(required);
};

/**
 * Get qualified crews for a specific job
 * @param {Object} job - The job
 * @param {Array} crews - Array of crew objects
 * @returns {Array} Array of qualified crew objects
 */
export const getQualifiedCrews = (job, crews) => {
  if (!job) return [];
  const required = job.requiredTicket || "WAH";
  return crews.filter(crew => crew.tickets.includes(required));
};

/**
 * Calculate total cost for an array of jobs
 * @param {Array} jobs - Array of job objects
 * @returns {number} Total cost
 */
export const calculateTotalCost = (jobs) => {
  return jobs.reduce((sum, job) => sum + Number(job.cost || 0), 0);
};

/**
 * Group jobs by day
 * @param {Array} jobs - Array of job objects
 * @returns {Object} Jobs grouped by day
 */
export const groupJobsByDay = (jobs) => {
  return jobs.reduce((acc, job) => {
    const day = job.day || 'Unassigned';
    acc[day] ||= [];
    acc[day].push(job);
    return acc;
  }, {});
};

/**
 * Group jobs by crew
 * @param {Array} jobs - Array of job objects
 * @returns {Object} Jobs grouped by crew
 */
export const groupJobsByCrew = (jobs) => {
  return jobs.reduce((acc, job) => {
    const crewId = job.crewId || 'Unassigned';
    acc[crewId] ||= [];
    acc[crewId].push(job);
    return acc;
  }, {});
};

/**
 * Group jobs by crew and day (2D grouping)
 * @param {Array} jobs - Array of job objects
 * @returns {Object} Jobs grouped by crew and day
 */
export const groupJobsByCrewAndDay = (jobs) => {
  return jobs.reduce((acc, job) => {
    const crewId = job.crewId || 'Unassigned';
    const day = job.day || 'Unassigned';
    acc[crewId] ||= {};
    acc[crewId][day] ||= [];
    acc[crewId][day].push(job);
    return acc;
  }, {});
};

/**
 * Escape CSV value to prevent injection
 * @param {*} value - Value to escape
 * @returns {string} Escaped CSV value
 */
export const escapeCsvValue = (value) => {
  const stringValue = value == null ? '' : String(value);
  return /[,"\n]/.test(stringValue) ? `"${stringValue.replace(/"/g, '""')}"` : stringValue;
};

/**
 * Download data as CSV file
 * @param {string} filename - Name of the file
 * @param {Array} rows - Array of objects to convert to CSV
 */
export const downloadCsv = (filename, rows) => {
  if (!rows || !rows.length) return;
  
  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(','),
    ...rows.map(row => headers.map(header => escapeCsvValue(row[header])).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const tempInput = document.createElement('textarea');
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    const success = document.execCommand('copy');
    document.body.removeChild(tempInput);
    return success;
  }
};

/**
 * Debounce function to limit rapid function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function to limit function call frequency
 * @param {Function} func - Function to throttle
 * @param {number} limit - Maximum calls per time period
 * @param {number} time - Time period in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit, time) => {
  let lastFunc;
  let lastRan;
  return function() {
    const context = this;
    const args = arguments;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(function() {
        if ((Date.now() - lastRan) >= time) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, time - (Date.now() - lastRan));
    }
  };
};

/**
 * Sleep function for async operations
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Resolves after the specified time
 */
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Parse CSV text into array of objects
 * @param {string} csvText - CSV text to parse
 * @param {Object} options - Parsing options
 * @returns {Array} Array of parsed objects
 */
export const parseCsv = (csvText, options = {}) => {
  const { delimiter = ',', header = true } = options;
  const lines = csvText.split('\n');
  const result = [];
  
  if (header && lines.length > 0) {
    const headers = lines[0].split(delimiter).map(h => h.trim());
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const values = lines[i].split(delimiter);
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = values[index] ? values[index].trim() : '';
      });
      result.push(obj);
    }
  } else {
    for (const line of lines) {
      if (!line.trim()) continue;
      result.push(line.split(delimiter).map(v => v.trim()));
    }
  }
  
  return result;
};

/**
 * Get priority display name
 * @param {string} priority - Priority code
 * @returns {string} Display name
 */
export const getPriorityLabel = (priority) => {
  const labels = {
    high: 'High',
    warning: 'Warning',
    normal: 'Normal'
  };
  return labels[priority?.toLowerCase()] || priority || 'Normal';
};

/**
 * Get priority color class
 * @param {string} priority - Priority code
 * @returns {string} Tailwind color class
 */
export const getPriorityColor = (priority) => {
  const colors = {
    high: 'text-rose-400',
    warning: 'text-amber-400',
    normal: 'text-emerald-400'
  };
  return colors[priority?.toLowerCase()] || 'text-slate-400';
};

/**
 * Get priority background color class
 * @param {string} priority - Priority code
 * @returns {string} Tailwind background color class
 */
export const getPriorityBgColor = (priority) => {
  const colors = {
    high: 'bg-rose-900/30',
    warning: 'bg-amber-900/30',
    normal: 'bg-emerald-900/30'
  };
  return colors[priority?.toLowerCase()] || 'bg-slate-800';
};

/**
 * Check if value is empty (null, undefined, empty string, empty array)
 * @param {*} value - Value to check
 * @returns {boolean} True if empty
 */
export const isEmpty = (value) => {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/**
 * Safely parse JSON with fallback
 * @param {string} json - JSON string to parse
 * @param {*} fallback - Fallback value if parsing fails
 * @returns {*} Parsed value or fallback
 */
export const safeJsonParse = (json, fallback = null) => {
  try {
    return json ? JSON.parse(json) : fallback;
  } catch {
    return fallback;
  }
};

/**
 * Get initials from name
 * @param {string} name - Full name
 * @returns {string} Initials (up to 2 characters)
 */
export const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ')
    .filter(part => part.length > 0)
    .map(part => part[0].toUpperCase())
    .slice(0, 2)
    .join('');
};

/**
 * Format phone number for display
 * @param {string} phone - Phone number
 * @returns {string} Formatted phone number
 */
export const formatPhone = (phone) => {
  if (!phone) return '';
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  // Format as Australian phone number
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)} ${digits.slice(6)}`;
  }
  if (digits.length === 9) {
    return `0${digits.slice(0, 1)} ${digits.slice(1, 5)} ${digits.slice(5)}`;
  }
  return phone;
};

/**
 * Format date for display
 * @param {Date|string} date - Date to format
 * @param {string} format - Format string (e.g., 'DD/MM/YYYY', 'MMMM D, YYYY')
 * @returns {string} Formatted date
 */
export const formatDate = (date, format = 'DD/MM/YYYY') => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const pad = (num) => num.toString().padStart(2, '0');
  const day = pad(d.getDate());
  const month = pad(d.getMonth() + 1);
  const year = d.getFullYear();
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
const tokens = {
    dddd: dayNames[d.getDay()],
    MMMM: monthNames[d.getMonth()],
    YYYY: String(year),
    DD: day,
    D: String(d.getDate()),
    MM: month,
    HH: hours,
    mm: minutes
  };
  return format.replace(/dddd|MMMM|YYYY|DD|D|MM|HH|mm/g, token => tokens[token]);
};

/**
 * Get day name from date
 * @param {Date|string} date - Date to get day from
 * @returns {string} Day name (e.g., 'Monday')
 */
export const getDayName = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return dayNames[d.getDay()];
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lng1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lng2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Sort jobs by priority (high > warning > normal)
 * @param {Array} jobs - Array of job objects
 * @returns {Array} Sorted array
 */
export const sortByPriority = (jobs) => {
  const priorityOrder = { high: 0, warning: 1, normal: 2 };
  return [...jobs].sort((a, b) => {
    const aPriority = priorityOrder[a.priority?.toLowerCase()] || 2;
    const bPriority = priorityOrder[b.priority?.toLowerCase()] || 2;
    if (aPriority !== bPriority) return aPriority - bPriority;
    // Secondary sort by cost (higher first)
    return b.cost - a.cost;
  });
};
