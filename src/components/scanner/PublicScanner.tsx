import React, { useState, useEffect } from 'react';
import { Camera, QrCode, CheckCircle2, Clock, Shield, Search, ArrowRight, UserCheck, AlertTriangle, ChevronRight, LogIn } from 'lucide-react';
import { db } from '../../services/database';
import { playAudioFeedback } from '../../services/sound';
import { CameraQrReader } from './CameraQrReader';
import { AttendanceRecord, Personnel } from '../../types';

interface PublicScannerProps {
  onNavigateLogin: () => void;
}

export const PublicScanner: React.FC<PublicScannerProps> = ({ onNavigateLogin }) => {
  const [isCameraActive, setIsCameraActive] = useState<boolean>(true);
  const [manualInput, setManualInput] = useState<string>('');
  const [mode, setMode] = useState<'AUTO' | 'TIME_IN' | 'TIME_OUT'>('AUTO');
  const [lastResult, setLastResult] = useState<{
    success: boolean;
    record?: AttendanceRecord;
    personnel?: Personnel;
    action: 'CLOCKED_IN' | 'CLOCKED_OUT' | 'ALREADY_RECORDED' | 'NOT_FOUND';
    message: string;
    timestamp: string;
  } | null>(null);
  const [recentLogs, setRecentLogs] = useState<AttendanceRecord[]>([]);
  const [personnelList, setPersonnelList] = useState<Personnel[]>([]);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [showQuickBadgeDrawer, setShowQuickBadgeDrawer] = useState<boolean>(false);

  // Live time ticker
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync data from database
  useEffect(() => {
    const updateLocal = () => {
      setRecentLogs(db.getAttendanceRecords().slice(0, 5));
      setPersonnelList(db.getPersonnel());
    };
    updateLocal();
    return db.subscribe(updateLocal);
  }, []);

  // Process a scanned or entered Duty ID
  const handleVerify = (dutyId: string) => {
    if (!dutyId.trim()) return;

    const res = db.recordAttendance(dutyId, mode, 'OSC-PUBLIC-KIOSK');
    const nowStr = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    if (res.success) {
      if (res.action === 'CLOCKED_OUT') {
        playAudioFeedback('CLOCK_OUT');
      } else {
        playAudioFeedback('SUCCESS');
      }
    } else {
      playAudioFeedback('WARNING');
    }

    setLastResult({
      ...res,
      timestamp: nowStr,
    });

    setManualInput('');

    // Auto-dismiss after 7 seconds
    const timeout = setTimeout(() => {
      setLastResult(prev => (prev?.timestamp === nowStr ? null : prev));
    }, 7000);

    return () => clearTimeout(timeout);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerify(manualInput);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      {/* Top Header Bar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/src/assets/images/osc_institutional_emblem_1791956358770.jpg"
              alt="OSC Seal"
              className="w-10 h-10 rounded-full border border-blue-500/30 object-cover shadow-sm shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-white text-base md:text-lg">
                  OSC Duty Attendance
                </span>
                <span className="text-[11px] font-mono tracking-wider px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800/60 uppercase">
                  Terminal Station 01
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Office of Strategic Communications · Executive Command
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right font-mono">
              <span className="text-sm font-semibold text-slate-200 tabular-nums">
                {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
              </span>
              <span className="text-xs text-slate-400">
                {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            <button
              onClick={onNavigateLogin}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-colors shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5 text-blue-400" />
              <span>Admin Portal Login</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 md:py-12 flex flex-col items-center justify-center">
        {/* Verification Success / Status Modal Popup */}
        {lastResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-center relative overflow-hidden">
              {/* Institutional Top Stripe */}
              <div className={`absolute top-0 left-0 right-0 h-2 ${
                lastResult.success 
                  ? lastResult.action === 'CLOCKED_OUT' ? 'bg-cyan-500' : 'bg-emerald-500' 
                  : 'bg-amber-500'
              }`} />

              <div className="my-3">
                {lastResult.success ? (
                  <div className="w-16 h-16 rounded-full bg-emerald-950/80 border-2 border-emerald-500/50 text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-amber-950/80 border-2 border-amber-500/50 text-amber-400 flex items-center justify-center mx-auto mb-3">
                    <AlertTriangle className="w-9 h-9" />
                  </div>
                )}

                {/* Requested Exact Success Message */}
                <h3 className="text-xl font-bold text-white tracking-tight">
                  {lastResult.success && lastResult.action === 'CLOCKED_IN'
                    ? 'Duty Attendance Successfully Recorded'
                    : lastResult.message}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Recorded at {lastResult.timestamp} · Station Terminal 01
                </p>
              </div>

              {lastResult.personnel && (
                <div className="mt-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-left space-y-3">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={lastResult.personnel.avatarUrl}
                      alt={lastResult.personnel.fullName}
                      className="w-14 h-14 rounded-xl object-cover border border-slate-700 shadow-md shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-mono font-semibold text-blue-400">
                          {lastResult.personnel.dutyId}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {lastResult.personnel.clearanceLevel.replace('_', ' ')}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white truncate">
                        {lastResult.personnel.fullName}
                      </h4>
                      <p className="text-xs text-slate-400 truncate">
                        {lastResult.personnel.rankDesignation}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                    <div>
                      <span className="text-slate-500 text-[11px] block">Division</span>
                      <span className="font-medium text-slate-200 truncate block">
                        {lastResult.personnel.division}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px] block">Duty Action</span>
                      <span className={`font-semibold block ${
                        lastResult.action === 'CLOCKED_OUT' ? 'text-cyan-400' : 'text-emerald-400'
                      }`}>
                        {lastResult.action === 'CLOCKED_OUT' ? 'TOUR CONCLUDED (OUT)' : 'DUTY COMMENCED (IN)'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => setLastResult(null)}
                className="mt-5 w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-blue-600/20"
              >
                Acknowledge & Close
              </button>
            </div>
          </div>
        )}

        {/* Public QR Scanner Hero Card */}
        <div className="w-full max-w-xl bg-slate-950/70 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-sm text-center">
          {/* Official Emblem & Titles */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative mb-3">
              <img
                src="/src/assets/images/osc_institutional_emblem_1791956358770.jpg"
                alt="Office of Strategic Communications Seal"
                className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-blue-500/40 shadow-xl object-cover"
              />
              <div className="absolute -bottom-1 -right-1 p-1 bg-slate-900 border border-blue-500/50 rounded-full text-blue-400 shadow-md">
                <Shield className="w-4 h-4" />
              </div>
            </div>

            {/* Requested Exact Title and Subtitle */}
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              OSC Duty Attendance
            </h1>
            <p className="text-sm md:text-base text-slate-400 mt-1 font-medium">
              Duty Attendance Monitoring and Verification
            </p>
          </div>

          {/* Mode Selector */}
          <div className="inline-flex p-1 bg-slate-900 rounded-xl border border-slate-800 mb-6">
            <button
              onClick={() => setMode('AUTO')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                mode === 'AUTO'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Auto Detect (In/Out)
            </button>
            <button
              onClick={() => setMode('TIME_IN')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                mode === 'TIME_IN'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Time In
            </button>
            <button
              onClick={() => setMode('TIME_OUT')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                mode === 'TIME_OUT'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Time Out
            </button>
          </div>

          {/* Camera Scanner Viewport */}
          <div className="mb-6">
            <CameraQrReader active={isCameraActive} onScan={handleVerify} />
          </div>

          {/* Primary Action Button (Explicit prompt requirement) */}
          <div className="space-y-4">
            <button
              onClick={() => setIsCameraActive(prev => !prev)}
              type="button"
              className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base transition-all shadow-lg shadow-blue-600/30 active:scale-[0.99]"
            >
              <QrCode className="w-5 h-5" />
              <span>{isCameraActive ? 'Scan QR Code' : 'Activate Camera Scanner'}</span>
            </button>

            {/* Quick Demo Simulator and Manual Code Lookup */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <form onSubmit={handleManualSubmit} className="flex-1 w-full flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder="Enter Duty ID (e.g. OSC-2026-001)"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-800 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shrink-0"
                >
                  Verify
                </button>
              </form>

              <button
                type="button"
                onClick={() => setShowQuickBadgeDrawer(!showQuickBadgeDrawer)}
                className="w-full sm:w-auto px-3 py-2 text-xs font-medium rounded-lg bg-slate-900 hover:bg-slate-800 text-blue-400 border border-blue-900/60 transition-colors shrink-0"
              >
                Test Personnel Badges
              </button>
            </div>
          </div>

          {/* Quick Personnel Badges Simulation Drawer */}
          {showQuickBadgeDrawer && (
            <div className="mt-5 p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-left space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">
                  Select Officer Badge to Simulate Scan:
                </span>
                <span className="text-[11px] text-slate-500 font-mono">1-Click Verification</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {personnelList.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      handleVerify(p.dutyId);
                      setShowQuickBadgeDrawer(false);
                    }}
                    type="button"
                    className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/80 hover:bg-blue-950/50 border border-slate-800/80 hover:border-blue-500/50 text-left transition-colors group"
                  >
                    <img
                      src={p.avatarUrl}
                      alt={p.fullName}
                      className="w-7 h-7 rounded-md object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-bold text-slate-200 truncate group-hover:text-blue-300">
                        {p.fullName}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500">
                        {p.dutyId} · {p.status}
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-400" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Live Public Roll Call Feed Bar */}
        {recentLogs.length > 0 && (
          <div className="w-full max-w-xl mt-6">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2 px-1">
              <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-500">
                Today's Verified Check-ins
              </span>
              <span className="font-mono text-slate-500">Live Kiosk Feed</span>
            </div>
            <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-3 space-y-2">
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between text-xs py-1.5 px-3 rounded-lg bg-slate-900/60 border border-slate-800/40"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <UserCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="font-semibold text-slate-200 truncate">
                      {log.personnelName}
                    </span>
                    <span className="text-slate-500 font-mono text-[11px]">
                      {log.dutyId}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
                    <span className={log.status === 'LATE' ? 'text-amber-400' : 'text-emerald-400'}>
                      {log.status}
                    </span>
                    <span className="text-slate-400">
                      {new Date(log.timestampIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Requested Exact Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 px-6 py-4 text-center">
        <p className="text-xs text-slate-400 font-medium">
          OSC Duty Attendance Management Tracking System
        </p>
        <p className="text-[11px] text-slate-600 mt-0.5">
          Office of Strategic Communications · Authorized Personnel Duty Verification Gateway
        </p>
      </footer>
    </div>
  );
};
