import React from 'react';

/**
 * Loading skeleton components for better UX during data loading
 * These provide visual placeholders that match the actual content layout
 */

// Job card skeleton
export const JobCardSkeleton = ({ className = '' }) => (
  <div className={`animate-pulse p-3 border border-slate-800 rounded-lg bg-slate-900/50 ${className}`}>
    <div className="flex items-start justify-between mb-2">
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-slate-800 rounded w-3/4"></div>
        <div className="h-3 bg-slate-800 rounded w-1/2"></div>
      </div>
      <div className="h-6 w-16 bg-slate-800 rounded"></div>
    </div>
    <div className="flex gap-2 mt-2">
      <div className="h-6 w-12 bg-slate-800 rounded"></div>
      <div className="h-6 w-12 bg-slate-800 rounded"></div>
    </div>
  </div>
);

// Crew card skeleton
export const CrewCardSkeleton = ({ className = '' }) => (
  <div className={`animate-pulse p-3 border border-slate-800 rounded-lg bg-slate-900/50 ${className}`}>
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 bg-slate-800 rounded-full"></div>
      <div className="flex-1 space-y-1">
        <div className="h-4 bg-slate-800 rounded w-1/3"></div>
        <div className="h-3 bg-slate-800 rounded w-1/2"></div>
      </div>
    </div>
    <div className="mt-3 flex gap-1">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-6 w-12 bg-slate-800 rounded"></div>
      ))}
    </div>
  </div>
);

// Schedule grid skeleton
export const ScheduleGridSkeleton = () => (
  <div className="flex-1 overflow-auto">
    <div className="min-w-full">
      {/* Header row */}
      <div className="grid grid-cols-6 gap-2 mb-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-8 bg-slate-800 rounded"></div>
        ))}
      </div>
      {/* Crew rows */}
      {[...Array(4)].map((_, crewIdx) => (
        <div key={crewIdx} className="mb-2">
          <div className="h-6 bg-slate-800 rounded mb-1"></div>
          <div className="grid grid-cols-5 gap-2">
            {[...Array(5)].map((_, dayIdx) => (
              <JobCardSkeleton key={dayIdx} className="h-20" />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Backlog list skeleton
export const BacklogListSkeleton = ({ count = 5 }) => (
  <div className="space-y-2">
    {[...Array(count)].map((_, i) => (
      <JobCardSkeleton key={i} />
    ))}
  </div>
);

// Metrics card skeleton
export const MetricsCardSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 xl:gap-4">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-lg flex flex-col justify-between">
        <div className="h-3 bg-slate-800 rounded w-1/2"></div>
        <div className="h-6 bg-slate-800 rounded w-1/3 mt-2"></div>
      </div>
    ))}
  </div>
);

// Full page loading skeleton
export const FullPageLoading = ({ message = 'Loading...' }) => (
  <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center flex-col gap-4">
    <div className="p-3 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl shadow-md">
      <div className="h-8 w-8 bg-slate-950 rounded-full animate-bounce"></div>
    </div>
    <div className="text-center">
      <p className="text-sm font-semibold text-slate-300">{message}</p>
      <p className="text-xs text-slate-500 mt-1">Please wait</p>
    </div>
    <div className="w-32 h-1 bg-slate-800 rounded-full overflow-hidden">
      <div className="h-full bg-teal-500 rounded-full animate-pulse w-2/3"></div>
    </div>
  </div>
);

// Table row skeleton
export const TableRowSkeleton = ({ columns = 4 }) => (
  <tr className="border-b border-slate-800">
    {[...Array(columns)].map((_, i) => (
      <td key={i} className="p-3">
        <div className="h-4 bg-slate-800 rounded animate-pulse"></div>
      </td>
    ))}
  </tr>
);

// Button skeleton
export const ButtonSkeleton = ({ className = '' }) => (
  <div className={`h-8 bg-slate-800 rounded-lg animate-pulse ${className}`}>
    <div className="h-full w-16 bg-slate-700 rounded-lg"></div>
  </div>
);
