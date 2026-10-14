import React, { useState } from 'react';
import { 
  Settings, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  RotateCcw, 
  Download, 
  Save, 
  ShieldCheck, 
  Terminal, 
  Volume2, 
  Globe 
} from 'lucide-react';
import { SystemSettings } from '../../types';
import { db } from '../../services/database';
import { testSupabaseConnection, SUPABASE_SQL_SCHEMA } from '../../services/supabaseClient';

interface SystemSettingsViewProps {
  settings: SystemSettings;
}

export const SystemSettingsView: React.FC<SystemSettingsViewProps> = ({ settings }) => {
  const [formData, setFormData] = useState<SystemSettings>(settings);
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string } | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [showSqlModal, setShowSqlModal] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);

  const handleTestConnection = async () => {
    if (!formData.supabaseUrl || !formData.supabaseAnonKey) {
      setTestResult({
        success: false,
        message: 'Please provide both Supabase Project URL and Supabase Anon Key.',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const res = await testSupabaseConnection(formData.supabaseUrl, formData.supabaseAnonKey);
    setIsTesting(false);
    setTestResult(res);

    if (res.success) {
      db.updateSettings({
        syncConnected: true,
        lastSyncTimestamp: new Date().toISOString(),
      });
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    db.updateSettings(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
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
      alert('System restored to clean institutional baseline.');
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
            Configure centralized Supabase database connection, institutional system identity, and operational policies.
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

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Supabase Centralized Database Configuration Section */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-600/40 flex items-center justify-center text-emerald-400 shadow-sm">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">
                  Centralized Supabase Database Integration
                </h2>
                <p className="text-xs text-slate-400">
                  Connect Public QR Scanner and Admin Portal to your centralized Supabase instance.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowSqlModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-xs font-semibold transition-colors self-start md:self-auto"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Generate Supabase SQL Schema</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Supabase Project URL
              </label>
              <input
                type="text"
                value={formData.supabaseUrl}
                onChange={(e) => setFormData({ ...formData, supabaseUrl: e.target.value })}
                placeholder="https://xyzproject.supabase.co"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-blue-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Found in your Supabase project dashboard under Project Settings &gt; API
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Supabase Anon / Public Key
              </label>
              <input
                type="password"
                value={formData.supabaseAnonKey}
                onChange={(e) => setFormData({ ...formData, supabaseAnonKey: e.target.value })}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-blue-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Public anon API key for client-side queries and scanner updates
              </span>
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

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors disabled:opacity-50"
            >
              {isTesting ? 'Testing Central Connection...' : 'Test Supabase Connection'}
            </button>
            <span className="text-xs text-slate-500">
              {formData.supabaseUrl ? 'Configured for live cloud database.' : 'Currently using active high-performance client storage engine.'}
            </span>
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

      {/* Supabase SQL Schema Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  Supabase PostgreSQL Schema Setup Script
                </h3>
              </div>
              <button
                onClick={() => setShowSqlModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="mt-3 text-slate-400">
              Copy this SQL script and paste it into the <strong>SQL Editor</strong> in your Supabase Dashboard to automatically provision the necessary tables, indexes, and Row Level Security policies.
            </p>

            <div className="mt-3 relative">
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-emerald-400 max-h-72 overflow-y-auto">
                {SUPABASE_SQL_SCHEMA}
              </pre>
              <button
                onClick={handleCopySql}
                className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-[11px] flex items-center gap-1.5 border border-slate-700 shadow-md"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Copied to Clipboard!' : 'Copy SQL'}</span>
              </button>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSqlModal(false)}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
