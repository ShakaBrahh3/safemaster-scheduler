import React from 'react';

/**
 * Global banner component displaying system status and information
 */
export const GlobalBanner = ({ crews, activeTab }) => {
  return (
    <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white px-4 py-2 text-xs font-semibold tracking-wide uppercase shadow-inner flex justify-between items-center">
      <div className="flex items-center gap-2">
        <span className="animate-pulse bg-white/30 h-2 w-2 rounded-full inline-block"></span>
        <span>SYSTEM UPGRADED: Dynamic Competency Rules & SMS Dispatcher Enabled</span>
      </div>
      <div className="hidden md:flex items-center gap-4 text-white/90">
        <span>Active Crews: {crews.length}</span>
        <span>Auto-save: local browser cache + live API sync</span>
        <span>Safety Code Compliance: Standard WA 2026</span>
      </div>
    </div>
  );
};

export default GlobalBanner;
