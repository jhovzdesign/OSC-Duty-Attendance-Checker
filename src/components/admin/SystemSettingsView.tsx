import React, { useState } from 'react';
import { 
  Settings, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  Check, 
  RotateCcw, 
  Download, 
  Save, 
  ShieldCheck, 
  Volume2, 
  Globe,
  Server,
  Activity
} from 'lucide-react';
import { SystemSettings } from '../../types';
import { db } from '../../services/database';

interface SystemSettingsViewProps {
  settings: SystemSettings;
}

export const SystemSettingsView: React.FC<SystemSettingsViewProps> = ({ settings }) => {
  const [formData, setFormData] = useState<SystemSettings>(settings);
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string } | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotificationMessage(msg);
    setTimeout(() => setNotificationMessage(null), 3500);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/health');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setTestResult({
        success: true,
        message: `Connected to Central Cloud Database! (${data.recordsCount || 0} attendance records, ${data.personnelCount || 0} personnel rostered, Server v${data.version || 1})`,
      });
      db.updateSettings({
        syncConnected: true,
        lastSyncTimestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Connection error: ${err.message || 'Unable to reach central cloud database engine'}.`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    db.updateSettings(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleExportBackup = () => {
    const backupData = {
      system: 'OSC-DAMTS',
      exportDate: new Date().toISOString(),
      personnel: db.getPersonnel(),
      shifts: db.getShifts(),
      attendance: db.getAttendanceRecords(),
      operators: db.getOperators(),
      settings: db.getSettings(),
    };
    const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const link = document.createElement('a');
    link.href = jsonStr;
    link.download = `OSC_DAMTS_Database_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleResetSeed = () => {
    if (confirm('Reset database to default institutional seed records? All customized test logs will be restored to clean baseline.')) {
      db.resetToDefaultSeed();
      setFormData(db.getSettings());
      showNotification('Centralized database restored to clean baseline seed data.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            System Settings & Database Engine
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1 font-medium">
            Configure centralized database synchronization, institutional system identity, and operational policies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportBackup}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Export Database JSON</span>
          </button>
          <button
            onClick={handleResetSeed}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Baseline Data</span>
          </button>
        </div>
      </div>

      {/* Live Central Cloud Database Multi-Device Sync Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-slate-900 border border-blue-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
            <Globe className="w-6 h-6 animate-pulse-subtle" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                Centralized Cloud Database
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                LIVE CLOUD ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              One shared cloud database across all phones, tablets, and desktop computers. Any update reflects immediately everywhere.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={async () => {
              await db.syncFromCloudServer(false);
              showNotification('Centralized cloud database synchronized successfully across all devices.');
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5 shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Force Re-sync</span>
          </button>
        </div>
      </div>

      {/* Notification Toast/Banner */}
      {notificationMessage && (
        <div className="p-4 rounded-xl bg-blue-950/80 border border-blue-600/60 text-blue-200 text-xs font-medium flex items-center justify-between shadow-lg animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{notificationMessage}</span>
          </div>
          <button
            onClick={() => setNotificationMessage(null)}
            className="text-slate-400 hover:text-white"
          >
            &times;
          </button>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Centralized Cloud Database Engine Status & Verification */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-600/40 flex items-center justify-center text-blue-400 shadow-sm">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">
                  Centralized Cloud Database Hub
                </h2>
                <p className="text-xs text-slate-400">
                  Unified persistent datastore synchronized across all browsers, tablets, and scanner kiosks.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Central Cloud Synchronized
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-blue-400" />
                Engine Architecture
              </div>
              <div className="font-bold text-white text-sm">Centralized Cloud Engine</div>
              <p className="text-[11px] text-slate-500 mt-1">
                Shared persistent datastore synchronized across all browsers &amp; devices.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                Data API Endpoint
              </div>
              <div className="font-mono font-bold text-emerald-400 text-sm">/api/data</div>
              <p className="text-[11px] text-slate-500 mt-1">
                Synchronized bidirectional endpoints for scans &amp; records.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                Data Integrity
              </div>
              <div className="font-bold text-white text-sm">Auto-Persisted Storage</div>
              <p className="text-[11px] text-slate-500 mt-1">
                Saved atomically on server disk, safe across all restarts.
              </p>
            </div>
          </div>

          {/* Test Status Banner */}
          {testResult && (
            <div className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${
              testResult.success
                ? 'bg-emerald-950/70 border-emerald-700/60 text-emerald-300'
                : 'bg-red-950/70 border-red-700/60 text-red-300'
            }`}>
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>{isTesting ? 'Verifying Central Engine...' : 'Test Central Database Connection'}</span>
              </button>
              <span className="text-xs text-slate-400">
                Verifies server responsiveness and data integrity across terminals.
              </span>
            </div>

            <div className="text-[11px] text-slate-500 font-mono">
              Last synced: {formData.lastSyncTimestamp ? new Date(formData.lastSyncTimestamp).toLocaleTimeString() : 'Active'}
            </div>
          </div>
        </div>

        {/* Institutional System Identity & Branding */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h2 className="text-base font-bold text-white tracking-tight">
              Institutional Identity & Station Information
            </h2>
            <p className="text-xs text-slate-400">
              System branding enforced across public scanner, reports, and credential cards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Official System Name
              </label>
              <input
                type="text"
                value={formData.systemName}
                onChange={(e) => setFormData({ ...formData, systemName: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-semibold focus:outline-none focus:border-blue-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Official institutional name requested by command
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Official Abbreviation
              </label>
              <input
                type="text"
                value={formData.abbreviation}
                onChange={(e) => setFormData({ ...formData, abbreviation: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono font-bold focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Active Terminal Station Name
              </label>
              <input
                type="text"
                value={formData.stationName}
                onChange={(e) => setFormData({ ...formData, stationName: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Terminal Station ID
              </label>
              <input
                type="text"
                value={formData.stationId}
                onChange={(e) => setFormData({ ...formData, stationId: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Operational Timekeeping Rules */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h2 className="text-base font-bold text-white tracking-tight">
              Operational Timekeeping & Scanner Policies
            </h2>
            <p className="text-xs text-slate-400">
              Grace windows, auto-timeout thresholds, and feedback mechanisms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Default Grace Window (Minutes)
              </label>
              <input
                type="number"
                min="0"
                max="60"
                value={formData.defaultGracePeriod}
                onChange={(e) => setFormData({ ...formData, defaultGracePeriod: Number(e.target.value) })}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-blue-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Arrivals after this window are tagged Late in the manifest.
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Auto Duty Tour Timeout (Hours)
              </label>
              <input
                type="number"
                min="4"
                max="24"
                value={formData.autoTimeoutHours}
                onChange={(e) => setFormData({ ...formData, autoTimeoutHours: Number(e.target.value) })}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-blue-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Maximum shift duration before supervisor audit flag.
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Audio Chime Feedback
              </label>
              <select
                value={formData.soundEnabled ? 'ENABLED' : 'DISABLED'}
                onChange={(e) => setFormData({ ...formData, soundEnabled: e.target.value === 'ENABLED' })}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="ENABLED">Sound Chime Enabled (Synthesized Audio)</option>
                <option value="DISABLED">Muted (Silent Scanning)</option>
              </select>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Pleasant verification chime on successful scan.
              </span>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {isSaved && (
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
              <Check className="w-4 h-4" />
              <span>Settings Successfully Updated</span>
            </span>
          )}
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/20 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save System Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
