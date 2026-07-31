import React, { useState } from 'react';
import { Download, Calendar, FileText, Mail, Share2, X, Check, Clock } from 'lucide-react';
import { generateICalContent } from '../utils/recurring';

/**
 * Export modal for exporting jobs to various formats
 */
export const ExportModal = ({
  showModal,
  setShowModal,
  jobs,
  crews,
  schedule
}) => {
  const [exportFormat, setExportFormat] = useState('csv');
  const [selectedCrew, setSelectedCrew] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [includeRecurring, setIncludeRecurring] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState(null);
  const [exportSuccess, setExportSuccess] = useState(null);

  // Get filtered jobs for export
  const getFilteredJobs = () => {
    let filteredJobs = schedule;
    
    // Filter by crew
    if (selectedCrew !== 'all') {
      filteredJobs = filteredJobs.filter(job => job.crewId === selectedCrew);
    }
    
    // Filter by date range
    if (dateRange === 'custom' && startDate && endDate) {
      filteredJobs = filteredJobs.filter(job => {
        if (!job.date) return true;
        const jobDate = new Date(job.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return jobDate >= start && jobDate <= end;
      });
    } else if (dateRange === 'this_week') {
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      filteredJobs = filteredJobs.filter(job => {
        if (!job.date) return true;
        const jobDate = new Date(job.date);
        return jobDate >= weekStart && jobDate <= weekEnd;
      });
    } else if (dateRange === 'this_month') {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      filteredJobs = filteredJobs.filter(job => {
        if (!job.date) return true;
        const jobDate = new Date(job.date);
        return jobDate >= monthStart && jobDate <= monthEnd;
      });
    } else if (dateRange === 'next_week') {
      const now = new Date();
      const nextWeekStart = new Date(now);
      nextWeekStart.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1) + 7);
      const nextWeekEnd = new Date(nextWeekStart);
      nextWeekEnd.setDate(nextWeekEnd.getDate() + 6);
      
      filteredJobs = filteredJobs.filter(job => {
        if (!job.date) return true;
        const jobDate = new Date(job.date);
        return jobDate >= nextWeekStart && jobDate <= nextWeekEnd;
      });
    }
    
    // Filter by recurring
    if (!includeRecurring) {
      filteredJobs = filteredJobs.filter(job => !job.isRecurring);
    }
    
    return filteredJobs;
  };

  // Handle export
  const handleExport = async () => {
    const filteredJobs = getFilteredJobs();
    
    if (filteredJobs.length === 0) {
      setExportError('No jobs match the selected criteria');
      return;
    }
    
    setIsExporting(true);
    setExportError(null);
    
    try {
      switch (exportFormat) {
        case 'csv':
          exportToCSV(filteredJobs);
          break;
        case 'ical':
          exportToICal(filteredJobs);
          break;
        case 'json':
          exportToJSON(filteredJobs);
          break;
        case 'email':
          await exportToEmail(filteredJobs);
          break;
        default:
          exportToCSV(filteredJobs);
      }
      
      setExportSuccess(`${filteredJobs.length} job(s) exported successfully`);
      setTimeout(() => setExportSuccess(null), 3000);
    } catch (error) {
      setExportError(error.message);
    } finally {
      setIsExporting(false);
    }
  };

  // Export to CSV
  const exportToCSV = (jobs) => {
    const headers = [
      'ID', 'Site', 'Cost', 'Date', 'Day', 'Start Time', 'End Time', 'Crew', 
      'Run', 'Priority', 'Required Ticket', 'EWP Required', 'Notes', 'Status'
    ];
    
    const rows = jobs.map(job => [
      job.id || '',
      job.site || '',
      job.cost || 0,
      job.date || '',
      job.day || '',
      job.startTime || '',
      job.endTime || '',
      crews.find(c => c.id === job.crewId)?.name || job.crewId || '',
      job.run || '',
      job.priority || '',
      job.requiredTicket || '',
      job.ewpRequired ? 'Yes' : 'No',
      job.notes || '',
      job.status || ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => escapeCSV(cell)).join(','))
    ].join('\n');
    
    downloadFile(csvContent, `safemaster-schedule-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
  };

  // Export to iCal
  const exportToICal = (jobs) => {
    let icalContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//SafeMaster Scheduler//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
`;
    
    jobs.forEach(job => {
      const crew = crews.find(c => c.id === job.crewId);
      const ical = generateICalContent(job, crew);
      icalContent += ical + '\n';
    });
    
    icalContent += 'END:VCALENDAR';
    downloadFile(icalContent, `safemaster-schedule-${new Date().toISOString().split('T')[0]}.ics`, 'text/calendar');
  };

  // Export to JSON
  const exportToJSON = (jobs) => {
    const jsonContent = JSON.stringify(jobs, null, 2);
    downloadFile(jsonContent, `safemaster-schedule-${new Date().toISOString().split('T')[0]}.json`, 'application/json');
  };

  // Export to Email (copy to clipboard)
  const exportToEmail = async (jobs) => {
    const emailContent = generateEmailContent(jobs);
    await navigator.clipboard.writeText(emailContent);
    alert('Schedule copied to clipboard. Paste into your email client.');
  };

  // Generate email content
  const generateEmailContent = (jobs) => {
    const crew = crews.find(c => c.id === jobs[0]?.crewId);
    const crewName = crew?.name || 'Crew Member';
    
    let email = `Subject: SafeMaster Schedule - ${jobs.length} Job(s)\n\n`;
    email += `Hi ${crewName},\n\n`;
    email += `Here is your upcoming schedule:\n\n`;
    
    jobs.forEach((job, index) => {
      email += `${index + 1}. ${job.site}\n`;
      email += `   Date: ${job.date || job.day || 'TBD'}\n`;
      email += `   Time: ${job.startTime || 'TBD'} - ${job.endTime || 'TBD'}\n`;
      email += `   Cost: $${job.cost || 0}\n`;
      email += `   Notes: ${job.notes || 'None'}\n\n`;
    });
    
    email += `Total: ${jobs.length} job(s) - $${jobs.reduce((sum, job) => sum + (job.cost || 0), 0).toFixed(2)}\n\n`;
    email += `Regards,\nSafeMaster Scheduler`;
    
    return email;
  };

  // Escape CSV cell
  const escapeCSV = (cell) => {
    if (cell == null) return '';
    const string = String(cell);
    if (string.includes(',') || string.includes('"') || string.includes('\n')) {
      return `"${string.replace(/"/g, '""')}"`;
    }
    return string;
  };

  // Download file
  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle cancel
  const handleCancel = () => {
    setShowModal(false);
    setExportFormat('csv');
    setSelectedCrew('all');
    setDateRange('all');
    setStartDate('');
    setEndDate('');
    setIncludeRecurring(true);
    setExportError(null);
    setExportSuccess(null);
  };

  if (!showModal) return null;

  const filteredJobs = getFilteredJobs();

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in-50">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
          <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Schedule
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
          
          {/* Export Format */}
          <div>
            <label className="text-xs text-slate-400 font-medium uppercase tracking-wider block mb-1">
              Export Format
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setExportFormat('csv')}
                className={`p-3 rounded-lg border border-slate-800 text-xs font-medium transition-all flex flex-col items-center gap-1 ${
                  exportFormat === 'csv' 
                    ? 'bg-teal-500/10 border-teal-700 text-teal-400' 
                    : 'bg-slate-900/50 text-slate-400 hover:bg-slate-800/50'
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>CSV</span>
                <span className="text-[10px] text-slate-500">Spreadsheet</span>
              </button>
              <button
                onClick={() => setExportFormat('ical')}
                className={`p-3 rounded-lg border border-slate-800 text-xs font-medium transition-all flex flex-col items-center gap-1 ${
                  exportFormat === 'ical' 
                    ? 'bg-teal-500/10 border-teal-700 text-teal-400' 
                    : 'bg-slate-900/50 text-slate-400 hover:bg-slate-800/50'
                }`}
              >
                <Calendar className="h-4 w-4" />
                <span>iCal</span>
                <span className="text-[10px] text-slate-500">Calendar</span>
              </button>
              <button
                onClick={() => setExportFormat('json')}
                className={`p-3 rounded-lg border border-slate-800 text-xs font-medium transition-all flex flex-col items-center gap-1 ${
                  exportFormat === 'json' 
                    ? 'bg-teal-500/10 border-teal-700 text-teal-400' 
                    : 'bg-slate-900/50 text-slate-400 hover:bg-slate-800/50'
                }`}
              >
                <Share2 className="h-4 w-4" />
                <span>JSON</span>
                <span className="text-[10px] text-slate-500">Data</span>
              </button>
              <button
                onClick={() => setExportFormat('email')}
                className={`p-3 rounded-lg border border-slate-800 text-xs font-medium transition-all flex flex-col items-center gap-1 ${
                  exportFormat === 'email' 
                    ? 'bg-teal-500/10 border-teal-700 text-teal-400' 
                    : 'bg-slate-900/50 text-slate-400 hover:bg-slate-800/50'
                }`}
              >
                <Mail className="h-4 w-4" />
                <span>Email</span>
                <span className="text-[10px] text-slate-500">Copy to Clipboard</span>
              </button>
            </div>
          </div>

          {/* Crew Filter */}
          <div>
            <label className="text-xs text-slate-400 font-medium uppercase tracking-wider block mb-1">
              Crew
            </label>
            <select
              value={selectedCrew}
              onChange={(e) => setSelectedCrew(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-sm text-slate-100"
            >
              <option value="all">All Crews</option>
              {crews.map(crew => (
                <option key={crew.id} value={crew.id}>{crew.name}</option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="text-xs text-slate-400 font-medium uppercase tracking-wider block mb-1">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-sm text-slate-100"
            >
              <option value="all">All Dates</option>
              <option value="this_week">This Week</option>
              <option value="next_week">Next Week</option>
              <option value="this_month">This Month</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Custom Date Range */}
          {dateRange === 'custom' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 p-2 rounded-lg text-sm text-slate-100"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 p-2 rounded-lg text-sm text-slate-100"
                />
              </div>
            </div>
          )}

          {/* Include Recurring */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="includeRecurring"
              checked={includeRecurring}
              onChange={(e) => setIncludeRecurring(e.target.checked)}
              className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-teal-500 focus:ring-teal-500"
            />
            <label htmlFor="includeRecurring" className="text-xs text-slate-300">
              Include Recurring Jobs
            </label>
          </div>

          {/* Preview */}
          <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800">
            <p className="text-xs text-slate-400 mb-2">
              Preview: {filteredJobs.length} job(s) will be exported
            </p>
            {filteredJobs.length > 0 && (
              <div className="space-y-1 max-h-20 overflow-y-auto">
                {filteredJobs.slice(0, 5).map(job => (
                  <div key={job.id} className="text-xs text-slate-400 flex justify-between">
                    <span>{job.site}</span>
                    <span>{job.date || job.day}</span>
                  </div>
                ))}
                {filteredJobs.length > 5 && (
                  <p className="text-xs text-slate-500">+ {filteredJobs.length - 5} more</p>
                )}
              </div>
            )}
          </div>

          {/* Status Messages */}
          {exportError && (
            <div className="p-3 bg-rose-900/20 border border-rose-700 rounded-lg">
              <p className="text-xs text-rose-400">{exportError}</p>
            </div>
          )}
          
          {exportSuccess && (
            <div className="p-3 bg-emerald-900/20 border border-emerald-700 rounded-lg">
              <p className="text-xs text-emerald-400">{exportSuccess}</p>
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
              onClick={handleExport}
              disabled={isExporting || filteredJobs.length === 0}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5"
            >
              {isExporting ? (
                <>
                  <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5" />
                  Export {filteredJobs.length} Job(s)
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
