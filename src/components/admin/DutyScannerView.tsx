import React, { useState } from 'react';
import { 
  Scan, 
  Camera, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  ShieldCheck, 
  Clock, 
  UserCheck 
} from 'lucide-react';
import { db } from '../../services/database';
import { playAudioFeedback } from '../../services/sound';
import { CameraQrReader } from '../scanner/CameraQrReader';
import { AttendanceRecord, Personnel } from '../../types';

interface DutyScannerViewProps {
  personnel: Personnel[];
  attendance: AttendanceRecord[];
}

export const DutyScannerView: React.FC<DutyScannerViewProps> = ({ personnel, attendance }) => {
  const [scannerActive, setScannerActive] = useState<boolean>(true);
  const [manualCode, setManualCode] = useState<string>('');
  const [mode, setMode] = useState<'AUTO' | 'TIME_IN' | 'TIME_OUT'>('AUTO');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [stationId, setStationId] = useState<string>('OSC-GATE-01');
  const [recentAction, setRecentAction] = useState<{
    success: boolean;
    record?: AttendanceRecord;
    personnel?: Personnel;
    action: 'CLOCKED_IN' | 'CLOCKED_OUT' | 'ALREADY_RECORDED' | 'NOT_FOUND';
    message: string;
    timestamp: string;
  } | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const todayLogs = attendance.filter(a => a.date === today);

  const handleScan = (dutyId: string) => {
    if (!dutyId.trim()) return;

    const res = db.recordAttendance(dutyId, mode, stationId);
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    if (soundEnabled) {
      if (res.success) {
        if (res.action === 'CLOCKED_OUT') playAudioFeedback('CLOCK_OUT');
        else playAudioFeedback('SUCCESS');
      } else {
        playAudioFeedback('WARNING');
      }
    }

    setRecentAction({
      ...res,
      timestamp: nowTime,
    });

    setManualCode('');
  };

  const handleSubmitManual = (e: React.FormEvent) => {
    e.preventDefault();
    handleScan(manualCode);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Duty Attendance Scanner Station
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1 font-medium">
            Administrative duty desk checkpoint scanner for personnel timekeeping, access verification, and tour control.
          </p>
        </div>

        {/* Station and Sound Controls */}
        <div className="flex items-center gap-3">
          <select
            value={stationId}
            onChange={(e) => setStationId(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="OSC-GATE-01">Station: OSC-GATE-01 (Main Checkpoint)</option>
            <option value="OSC-MEDIA-02">Station: OSC-MEDIA-02 (Press Hall)</option>
            <option value="OSC-EXEC-03">Station: OSC-EXEC-03 (Executive Suite)</option>
          </select>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border transition-colors ${
              soundEnabled
                ? 'bg-slate-900 border-slate-800 text-blue-400 hover:text-blue-300'
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-400'
            }`}
            title={soundEnabled ? 'Mute Audio Chime' : 'Enable Audio Chime'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Live Camera & Scanner Interface (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            {/* Mode Selector */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Scanner Action Mode:
              </span>
              <div className="inline-flex p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  onClick={() => setMode('AUTO')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                    mode === 'AUTO'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Auto In/Out
                </button>
                <button
                  onClick={() => setMode('TIME_IN')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                    mode === 'TIME_IN'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Time In
                </button>
                <button
                  onClick={() => setMode('TIME_OUT')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                    mode === 'TIME_OUT'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Time Out
                </button>
              </div>
            </div>

            {/* Camera Viewport */}
            <CameraQrReader active={scannerActive} onScan={handleScan} />

            {/* Quick Barcode / Manual Input */}
            <form onSubmit={handleSubmitManual} className="mt-4 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Barcode Scanner input or Duty ID (e.g. OSC-2026-001)..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-500 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 transition-colors shrink-0"
              >
                Log Entry
              </button>
            </form>
          </div>

          {/* Quick Test Officers Selector for Desk Officer */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <span className="text-slate-400 font-semibold block mb-2">
              Desk Manual Override / Quick Scan Simulator:
            </span>
            <div className="flex flex-wrap gap-2">
              {personnel.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleScan(p.dutyId)}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-mono text-[11px] transition-colors"
                >
                  {p.dutyId} ({p.fullName.split(' ')[0]})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Scan Verification Result & Real-Time Ledger (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Latest Verification Flash Card */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Last Terminal Verification Event
            </h3>

            {recentAction ? (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  {recentAction.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                  )}
                  <span className="font-bold text-sm text-white truncate">
                    {recentAction.message}
                  </span>
                </div>

                {recentAction.personnel && (
                  <div className="flex items-center gap-3 pt-2 border-t border-slate-800">
                    <img
                      src={recentAction.personnel.avatarUrl}
                      alt={recentAction.personnel.fullName}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-mono font-bold text-blue-400">
                        {recentAction.personnel.dutyId}
                      </span>
                      <h4 className="text-xs font-bold text-white truncate">
                        {recentAction.personnel.fullName}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate">
                        {recentAction.personnel.division}
                      </p>
                    </div>
                  </div>
                )}

                <div className="text-[11px] font-mono text-slate-500 pt-1 flex justify-between">
                  <span>Station: {stationId}</span>
                  <span className="text-slate-400 tabular-nums">{recentAction.timestamp}</span>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500 text-xs">
                Awaiting duty credential scan...
              </div>
            )}
          </div>

          {/* Today's Active Terminal Log */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Today's Station Log ({todayLogs.length})
              </span>
              <span className="text-[10px] font-mono text-emerald-400">
                LIVE TERMINAL
              </span>
            </div>

            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {todayLogs.map(log => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="font-semibold text-slate-200 truncate">
                      {log.personnelName}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      {log.dutyId} · {log.shiftName}
                    </div>
                  </div>
                  <div className="text-right font-mono text-[11px] shrink-0">
                    <div className={log.status === 'LATE' ? 'text-amber-400' : 'text-emerald-400'}>
                      {log.status}
                    </div>
                    <div className="text-slate-400 tabular-nums">
                      {new Date(log.timestampIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
