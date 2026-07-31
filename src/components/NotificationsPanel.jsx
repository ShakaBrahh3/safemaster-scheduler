import React, { useState } from 'react';
import { Bell, Send, Copy, Check, Clock, Calendar, MapPin, DollarSign, UserCheck, ShieldCheck } from 'lucide-react';
import { TICKETS, DAYS } from '../constants';
import { copyToClipboard, formatCurrency } from '../utils';

/**
 * Notifications panel for generating and sending night-before SMS briefings
 */
export const NotificationsPanel = ({
  crews,
  schedule,
  briefingDay,
  setBriefingDay,
  copiedStatus,
  setCopiedStatus
}) => {
  const [selectedCrewId, setSelectedCrewId] = useState(null);

  // Get all days that have scheduled jobs
  const scheduledDays = [...new Set(schedule.map(job => job.day).filter(Boolean))];
  const availableDays = scheduledDays.length > 0 ? scheduledDays : DAYS;

  // Generate SMS for selected crew and day
  const generateBriefingSMS = (crew, day) => {
    const dayJobs = schedule.filter(j => j.day === day && j.crewId === crew.id);
    if (dayJobs.length === 0) {
      return `Hi ${crew.name.split(" ")[0]}, no jobs scheduled for you on ${day}. Enjoy your day off! - SafeMaster`;
    }

    let sms = `📧 SafeMaster Height Safety Briefing - ${day.toUpperCase()}\n-------------------------\nHi ${crew.name.split(" ")[0]},\n`;
    sms += `You have ${dayJobs.length} site recertifications tomorrow:\n\n`;

    dayJobs.forEach((job, idx) => {
      sms += `${idx + 1}. SITE: ${job.site}\n`;
      sms += `   💰 VALUE: ${formatCurrency(job.cost)}\n`;
      sms += `   🔐 TICKET REQUIRED: ${TICKETS[job.requiredTicket || "WAH"]?.name || job.requiredTicket}\n`;
      if (job.ewpRequired) sms += `   ⚠️ ACCESS: EWP Access platform booked for site!\n`;
      if (job.notes) sms += `   📝 INST: ${job.notes}\n`;
      sms += `\n`;
    });

    sms += `Make sure your vehicles are pre-loaded with appropriate calibrators, anchor testers, and PPE. Reply to dispatch if there are access or ticket issues.`;
    return sms;
  };

  // Handle copy to clipboard
  const handleCopyText = async (text, crewId) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedStatus(crewId);
      setTimeout(() => setCopiedStatus(null), 2000);
    }
  };

  // Get crews with jobs on the selected day
  const crewsWithJobs = [...new Set(schedule
    .filter(job => job.day === briefingDay)
    .map(job => job.crewId)
  )];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-4 border-b border-slate-900 bg-slate-950/50">
        <div className="flex items-center gap-3 mb-4">
          <h3 className="text-sm font-semibold text-white">
            <Bell className="h-4 w-4 inline mr-1" />
            Night-Before SMS Dispatcher
          </h3>
        </div>

        {/* Day selector */}
        <div className="mb-4">
          <label className="text-[10px] uppercase tracking-[0.24em] text-slate-400 block mb-1">
            Select Briefing Day
          </label>
          <div className="flex flex-wrap gap-1">
            {availableDays.map(day => (
              <button
                key={day}
                onClick={() => setBriefingDay(day)}
                className={`text-[10px] px-2.5 py-1.5 rounded border font-semibold transition-all ${
                  briefingDay === day 
                    ? 'bg-teal-500 text-slate-950 border-teal-700' 
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-2.5">
            <p className="text-[9px] uppercase tracking-[0.24em] text-slate-400">Crews with jobs</p>
            <p className="text-sm font-semibold text-white">{crewsWithJobs.length}</p>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-2.5">
            <p className="text-[9px] uppercase tracking-[0.24em] text-slate-400">Total jobs</p>
            <p className="text-sm font-semibold text-teal-400">
              {schedule.filter(j => j.day === briefingDay).length}
            </p>
          </div>
        </div>
      </div>

      {/* Crew list with SMS previews */}
      <div className="flex-1 overflow-auto p-3 space-y-2">
        {crews.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p>No crews available</p>
          </div>
        ) : (
          crews.map(crew => {
            const dayJobs = schedule.filter(j => j.day === briefingDay && j.crewId === crew.id);
            const smsText = generateBriefingSMS(crew, briefingDay);
            const isCopied = copiedStatus === crew.id;

            return (
              <div
                key={crew.id}
                className={`p-3 rounded-lg border border-slate-800 bg-slate-900/50 ${crew.color}`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-white truncate">{crew.name}</h4>
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                        {crew.baseLocation || 'N/A'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{crew.email}</p>
                  </div>
                </div>

                {/* Job count for this crew on selected day */}
                <div className="mb-2">
                  <span className="text-[10px] uppercase tracking-[0.24em] text-slate-400">
                    {briefingDay} Jobs
                  </span>
                  <div className="flex gap-1 mt-1">
                    {dayJobs.map(job => (
                      <span 
                        key={job.id} 
                        className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded"
                      >
                        {job.site}
                      </span>
                    ))}
                  </div>
                  {dayJobs.length === 0 && (
                    <p className="text-[10px] text-slate-500 mt-1">No jobs scheduled</p>
                  )}
                </div>

                {/* SMS preview and actions */}
                <div className="mt-2 pt-2 border-t border-slate-800">
                  <div className="flex gap-2 mb-2">
                    <button
                      onClick={() => {
                        setSelectedCrewId(selectedCrewId === crew.id ? null : crew.id);
                      }}
                      className="text-[10px] px-2.5 py-1 rounded border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-750 transition-colors"
                    >
                      {selectedCrewId === crew.id ? 'Hide SMS' : 'Show SMS'}
                    </button>
                    <button
                      onClick={() => handleCopyText(smsText, crew.id)}
                      className="text-[10px] px-2.5 py-1 rounded border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-750 transition-colors flex items-center gap-1"
                    >
                      <Copy className="h-3 w-3" />
                      <span>{isCopied ? 'Copied!' : 'Copy SMS'}</span>
                    </button>
                    <button
                      onClick={() => {
                        // In a real app, this would send the SMS via an API
                        alert(`SMS would be sent to ${crew.name} at ${crew.phone || 'their phone'}`);
                      }}
                      className="text-[10px] px-2.5 py-1 rounded bg-teal-600 text-white hover:bg-teal-500 transition-colors flex items-center gap-1"
                    >
                      <Send className="h-3 w-3" />
                      <span>Send SMS</span>
                    </button>
                  </div>

                  {/* SMS preview (collapsible) */}
                  {selectedCrewId === crew.id && (
                    <div className="p-2 bg-slate-800/50 rounded text-[11px] text-slate-300 whitespace-pre-wrap font-mono">
                      {smsText}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NotificationsPanel;
