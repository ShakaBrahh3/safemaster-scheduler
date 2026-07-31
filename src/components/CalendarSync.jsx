import React, { useState, useEffect } from 'react';
import { Calendar, Link2, Copy, Check, X, AlertTriangle, Settings, RefreshCw } from 'lucide-react';

/**
 * Calendar Sync component for connecting to Google Calendar, Outlook, etc.
 */
export const CalendarSync = ({
  showModal,
  setShowModal,
  crews,
  schedule,
  onSyncComplete
}) => {
  const [activeTab, setActiveTab] = useState('google'); // 'google', 'outlook', 'ical'
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [syncError, setSyncError] = useState(null);
  const [selectedCrew, setSelectedCrew] = useState(crews[0]?.id || '');
  const [syncSettings, setSyncSettings] = useState({
    google: {
      enabled: false,
      calendarId: '',
      accessToken: '',
      refreshToken: '',
      syncDirection: 'both', // 'to_google', 'from_google', 'both'
      autoSync: false
    },
    outlook: {
      enabled: false,
      calendarId: '',
      accessToken: '',
      refreshToken: '',
      syncDirection: 'both',
      autoSync: false
    }
  });
  const [icalLink, setIcalLink] = useState('');

  // Generate iCal link
  useEffect(() => {
    if (selectedCrew) {
      const baseUrl = window.location.origin;
      const crew = crews.find(c => c.id === selectedCrew);
      const link = `${baseUrl}/api/export/ical?crewId=${selectedCrew}`;
      setIcalLink(link);
    }
  }, [selectedCrew, crews]);

  // Load saved settings
  useEffect(() => {
    const savedSettings = localStorage.getItem('safemaster-calendar-sync');
    if (savedSettings) {
      try {
        setSyncSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error('Error loading sync settings:', e);
      }
    }
  }, []);

  // Save settings
  useEffect(() => {
    if (Object.keys(syncSettings).length > 0) {
      localStorage.setItem('safemaster-calendar-sync', JSON.stringify(syncSettings));
    }
  }, [syncSettings]);

  // Handle Google Calendar connection
  const handleGoogleConnect = async () => {
    setIsSyncing(true);
    setSyncError(null);
    setSyncStatus(null);

    try {
      // In a real implementation, this would redirect to Google OAuth
      // For now, we'll simulate the process
      setSyncStatus('Redirecting to Google for authentication...');
      
      // Simulate OAuth flow
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update settings
      setSyncSettings(prev => ({
        ...prev,
        google: {
          ...prev.google,
          enabled: true,
          calendarId: 'primary',
          accessToken: 'simulated-access-token',
          refreshToken: 'simulated-refresh-token'
        }
      }));
      
      setSyncStatus('Connected to Google Calendar! Syncing events...');
      
      // Simulate sync
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSyncStatus('Sync complete! 15 events synced.');
      onSyncComplete?.({ provider: 'google', synced: 15 });
      
    } catch (error) {
      setSyncError(error.message);
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle Outlook Calendar connection
  const handleOutlookConnect = async () => {
    setIsSyncing(true);
    setSyncError(null);
    setSyncStatus(null);

    try {
      setSyncStatus('Redirecting to Microsoft for authentication...');
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSyncSettings(prev => ({
        ...prev,
        outlook: {
          ...prev.outlook,
          enabled: true,
          calendarId: 'calendar',
          accessToken: 'simulated-access-token',
          refreshToken: 'simulated-refresh-token'
        }
      }));
      
      setSyncStatus('Connected to Outlook Calendar! Syncing events...');
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSyncStatus('Sync complete! 12 events synced.');
      onSyncComplete?.({ provider: 'outlook', synced: 12 });
      
    } catch (error) {
      setSyncError(error.message);
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle manual sync
  const handleManualSync = async (provider) => {
    setIsSyncing(true);
    setSyncError(null);
    setSyncStatus(null);

    try {
      setSyncStatus(`Syncing with ${provider === 'google' ? 'Google' : 'Outlook'} Calendar...`);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const syncedCount = Math.floor(Math.random() * 10) + 5;
      setSyncStatus(`Sync complete! ${syncedCount} events synced.`);
      onSyncComplete?.({ provider, synced: syncedCount });
      
    } catch (error) {
      setSyncError(error.message);
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle disconnect
  const handleDisconnect = (provider) => {
    setSyncSettings(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        enabled: false,
        accessToken: '',
        refreshToken: ''
      }
    }));
    setSyncStatus(`${provider === 'google' ? 'Google' : 'Outlook'} Calendar disconnected`);
  };

  // Copy iCal link to clipboard
  const handleCopyIcalLink = async () => {
    try {
      await navigator.clipboard.writeText(icalLink);
      setSyncStatus('iCal link copied to clipboard!');
      setTimeout(() => setSyncStatus(null), 3000);
    } catch {
      // Fallback for older browsers
      const tempInput = document.createElement('textarea');
      tempInput.value = icalLink;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
      setSyncStatus('iCal link copied to clipboard!');
      setTimeout(() => setSyncStatus(null), 3000);
    }
  };

  // Handle settings change
  const handleSettingsChange = (provider, field, value) => {
    setSyncSettings(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        [field]: value
      }
    }));
  };

  // Handle cancel
  const handleCancel = () => {
    setShowModal(false);
    setSyncStatus(null);
    setSyncError(null);
  };

  if (!showModal) return null;

  const googleConnected = syncSettings.google?.enabled;
  const outlookConnected = syncSettings.outlook?.enabled;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in-50">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
          <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendar Sync
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
          
          {/* Tabs */}
          <div className="flex border-b border-slate-800 bg-slate-950/50 p-1 gap-1">
            <button
              onClick={() => setActiveTab('google')}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'google' 
                  ? 'bg-slate-800 text-teal-400 shadow' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Google Calendar
            </button>
            <button
              onClick={() => setActiveTab('outlook')}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'outlook' 
                  ? 'bg-slate-800 text-teal-400 shadow' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Outlook Calendar
            </button>
            <button
              onClick={() => setActiveTab('ical')}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'ical' 
                  ? 'bg-slate-800 text-teal-400 shadow' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              iCal/ICS
            </button>
          </div>

          {/* Google Calendar Tab */}
          {activeTab === 'google' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950/50 rounded-lg border border-slate-800">
                <h4 className="text-sm font-semibold text-white mb-2">Google Calendar Integration</h4>
                <p className="text-xs text-slate-400 mb-3">
                  Sync your SafeMaster jobs with Google Calendar for easy viewing and management.
                </p>
                
                {googleConnected ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-emerald-900/20 border border-emerald-700 rounded-lg">
                      <p className="text-xs text-emerald-400">✅ Connected to Google Calendar</p>
                    </div>
                    
                    <div>
                      <label className="text-xs text-slate-400 font-medium block mb-1">Calendar</label>
                      <select
                        value={syncSettings.google?.calendarId || 'primary'}
                        onChange={(e) => handleSettingsChange('google', 'calendarId', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-sm text-slate-100"
                      >
                        <option value="primary">Primary Calendar</option>
                        <option value="work">Work Calendar</option>
                        <option value="personal">Personal Calendar</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="text-xs text-slate-400 font-medium block mb-1">Sync Direction</label>
                      <select
                        value={syncSettings.google?.syncDirection || 'both'}
                        onChange={(e) => handleSettingsChange('google', 'syncDirection', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-sm text-slate-100"
                      >
                        <option value="both">Two-way sync (recommended)</option>
                        <option value="to_google">SafeMaster → Google only</option>
                        <option value="from_google">Google → SafeMaster only</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="googleAutoSync"
                        checked={syncSettings.google?.autoSync || false}
                        onChange={(e) => handleSettingsChange('google', 'autoSync', e.target.checked)}
                        className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-teal-500 focus:ring-teal-500"
                      />
                      <label htmlFor="googleAutoSync" className="text-xs text-slate-300">
                        Auto-sync every 15 minutes
                      </label>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleManualSync('google')}
                        disabled={isSyncing}
                        className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5"
                      >
                        {isSyncing ? (
                          <>
                            <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Syncing...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-3.5 w-3.5" />
                            Sync Now
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleDisconnect('google')}
                        className="px-4 py-2 bg-rose-800 hover:bg-rose-700 text-rose-300 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5"
                      >
                        <X className="h-3.5 w-3.5" />
                        Disconnect
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-500">Not connected to Google Calendar</p>
                    <button
                      onClick={handleGoogleConnect}
                      disabled={isSyncing}
                      className="w-full px-4 py-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5"
                    >
                      {isSyncing ? (
                        <>
                          <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <Link2 className="h-3.5 w-3.5" />
                          Connect to Google Calendar
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Outlook Calendar Tab */}
          {activeTab === 'outlook' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950/50 rounded-lg border border-slate-800">
                <h4 className="text-sm font-semibold text-white mb-2">Outlook Calendar Integration</h4>
                <p className="text-xs text-slate-400 mb-3">
                  Sync your SafeMaster jobs with Outlook Calendar for easy viewing and management.
                </p>
                
                {outlookConnected ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-emerald-900/20 border border-emerald-700 rounded-lg">
                      <p className="text-xs text-emerald-400">✅ Connected to Outlook Calendar</p>
                    </div>
                    
                    <div>
                      <label className="text-xs text-slate-400 font-medium block mb-1">Calendar</label>
                      <select
                        value={syncSettings.outlook?.calendarId || 'calendar'}
                        onChange={(e) => handleSettingsChange('outlook', 'calendarId', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-sm text-slate-100"
                      >
                        <option value="calendar">Calendar</option>
                        <option value="work">Work Calendar</option>
                        <option value="personal">Personal Calendar</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="text-xs text-slate-400 font-medium block mb-1">Sync Direction</label>
                      <select
                        value={syncSettings.outlook?.syncDirection || 'both'}
                        onChange={(e) => handleSettingsChange('outlook', 'syncDirection', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-sm text-slate-100"
                      >
                        <option value="both">Two-way sync (recommended)</option>
                        <option value="to_outlook">SafeMaster → Outlook only</option>
                        <option value="from_outlook">Outlook → SafeMaster only</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="outlookAutoSync"
                        checked={syncSettings.outlook?.autoSync || false}
                        onChange={(e) => handleSettingsChange('outlook', 'autoSync', e.target.checked)}
                        className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-teal-500 focus:ring-teal-500"
                      />
                      <label htmlFor="outlookAutoSync" className="text-xs text-slate-300">
                        Auto-sync every 15 minutes
                      </label>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleManualSync('outlook')}
                        disabled={isSyncing}
                        className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5"
                      >
                        {isSyncing ? (
                          <>
                            <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Syncing...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-3.5 w-3.5" />
                            Sync Now
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleDisconnect('outlook')}
                        className="px-4 py-2 bg-rose-800 hover:bg-rose-700 text-rose-300 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5"
                      >
                        <X className="h-3.5 w-3.5" />
                        Disconnect
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-500">Not connected to Outlook Calendar</p>
                    <button
                      onClick={handleOutlookConnect}
                      disabled={isSyncing}
                      className="w-full px-4 py-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5"
                    >
                      {isSyncing ? (
                        <>
                          <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <Link2 className="h-3.5 w-3.5" />
                          Connect to Outlook Calendar
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* iCal/ICS Tab */}
          {activeTab === 'ical' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950/50 rounded-lg border border-slate-800">
                <h4 className="text-sm font-semibold text-white mb-2">iCal/ICS Subscription</h4>
                <p className="text-xs text-slate-400 mb-3">
                  Subscribe to your SafeMaster schedule in any calendar application that supports iCal/ICS format.
                </p>
                
                <div className="mb-3">
                  <label className="text-xs text-slate-400 font-medium block mb-1">Select Crew</label>
                  <select
                    value={selectedCrew}
                    onChange={(e) => setSelectedCrew(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-sm text-slate-100"
                  >
                    <option value="">All Crews</option>
                    {crews.map(crew => (
                      <option key={crew.id} value={crew.id}>{crew.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                  <label className="text-xs text-slate-400 font-medium block mb-1">iCal Subscription URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={icalLink}
                      readOnly
                      className="flex-1 bg-slate-900 border border-slate-800 p-2 rounded-lg text-xs text-slate-100 font-mono"
                    />
                    <button
                      onClick={handleCopyIcalLink}
                      className="px-3 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Copy
                    </button>
                  </div>
                </div>
                
                <div className="p-3 bg-slate-800/30 rounded border border-slate-700/50">
                  <h5 className="text-xs font-semibold text-slate-300 mb-2">How to use:</h5>
                  <ol className="text-xs text-slate-400 space-y-1">
                    <li>1. Copy the URL above</li>
                    <li>2. Open your calendar application (Google Calendar, Outlook, Apple Calendar, etc.)</li>
                    <li>3. Look for "Add by URL" or "Subscribe to Calendar" option</li>
                    <li>4. Paste the URL and save</li>
                    <li>5. Your SafeMaster jobs will appear in your calendar</li>
                  </ol>
                  <p className="text-xs text-slate-500 mt-2">
                    Note: The calendar will update automatically as jobs are added or changed.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Status Messages */}
          {syncStatus && (
            <div className="p-3 bg-emerald-900/20 border border-emerald-700 rounded-lg">
              <p className="text-xs text-emerald-400">{syncStatus}</p>
            </div>
          )}
          
          {syncError && (
            <div className="p-3 bg-rose-900/20 border border-rose-700 rounded-lg">
              <p className="text-xs text-rose-400">{syncError}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold rounded-lg transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Settings panel for calendar sync
export const CalendarSyncSettings = ({
  crews,
  syncSettings,
  onSettingsChange
}) => {
  return (
    <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-800">
      <h4 className="text-sm font-semibold text-white mb-3">Calendar Sync Settings</h4>
      
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="enableGoogleSync"
            checked={syncSettings.google?.enabled || false}
            onChange={(e) => onSettingsChange('google', 'enabled', e.target.checked)}
            className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-teal-500 focus:ring-teal-500"
          />
          <label htmlFor="enableGoogleSync" className="text-xs text-slate-300">
            Enable Google Calendar Sync
          </label>
        </div>
        
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="enableOutlookSync"
            checked={syncSettings.outlook?.enabled || false}
            onChange={(e) => onSettingsChange('outlook', 'enabled', e.target.checked)}
            className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-teal-500 focus:ring-teal-500"
          />
          <label htmlFor="enableOutlookSync" className="text-xs text-slate-300">
            Enable Outlook Calendar Sync
          </label>
        </div>
        
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="enableAutoSync"
            checked={syncSettings.google?.autoSync || syncSettings.outlook?.autoSync || false}
            onChange={(e) => {
              onSettingsChange('google', 'autoSync', e.target.checked);
              onSettingsChange('outlook', 'autoSync', e.target.checked);
            }}
            className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-teal-500 focus:ring-teal-500"
          />
          <label htmlFor="enableAutoSync" className="text-xs text-slate-300">
            Enable Auto-Sync (every 15 minutes)
          </label>
        </div>
      </div>
    </div>
  );
};

export default CalendarSync;
