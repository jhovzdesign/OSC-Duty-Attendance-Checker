import React from 'react';
import { 
  Users, 
  UserCheck, 
  Clock, 
  ShieldCheck, 
  AlertCircle, 
  TrendingUp, 
  ArrowUpRight, 
  Scan, 
  QrCode, 
  FileSpreadsheet,
  Calendar,
  Building2
} from 'lucide-react';
import { AttendanceRecord, DutyShift, Personnel, ActiveView } from '../../types';

interface DashboardViewProps {
  personnel: Personnel[];
  attendance: AttendanceRecord[];
  shifts: DutyShift[];
  onNavigate: (view: ActiveView) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  personnel,
  attendance,
  shifts,
  onNavigate,
}) => {
  const today = new Date().toISOString().split('T')[0];
  const todayRecords = attendance.filter(r => r.date === today);
  const onDutyCount = personnel.filter(p => p.status === 'ON_DUTY').length;
  const presentCount = todayRecords.length;
  const lateCount = todayRecords.filter(r => r.status === 'LATE').length;
  const onTimeCount = todayRecords.filter(r => r.status === 'PRESENT').length;
  const punctualityRate = presentCount > 0 ? Math.round((onTimeCount / presentCount) * 100) : 100;

  // Breakdown by division
  const divisionStats: Record<string, { total: number; onDuty: number }> = {};
  personnel.forEach(p => {
    if (!divisionStats[p.division]) {
      divisionStats[p.division] = { total: 0, onDuty: 0 };
    }
    divisionStats[p.division].total += 1;
    if (p.status === 'ON_DUTY') {
      divisionStats[p.division].onDuty += 1;
    }
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Required Titles */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            OSC Duty Attendance Dashboard
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1 font-medium">
            Manage duty attendance, personnel credentials, and attendance records in one centralized system.
          </p>
        </div>

        {/* Quick Action Shortcuts */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('admin-scanner')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-colors shrink-0"
          >
            <Scan className="w-3.5 h-3.5" />
            <span>Station Scanner</span>
          </button>
          <button
            onClick={() => onNavigate('credentials')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors shrink-0"
          >
            <QrCode className="w-3.5 h-3.5 text-blue-400" />
            <span>Issue Badges</span>
          </button>
          <button
            onClick={() => onNavigate('reports')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors shrink-0"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Daily Manifest</span>
          </button>
        </div>
      </div>

      {/* 4 Primary Roll-Call KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Total OSC Personnel
            </span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white font-mono tabular-nums">
              {personnel.length}
            </span>
            <span className="text-xs font-medium text-slate-400">
              Active Roster
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500">
            <span>Official Communications Registry</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Currently On Duty
            </span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-emerald-400 font-mono tabular-nums">
              {onDutyCount}
            </span>
            <span className="text-xs font-medium text-slate-400">
              {personnel.length > 0 ? Math.round((onDutyCount / personnel.length) * 100) : 0}% Active Tour
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Verified in Post</span>
            <span className="font-mono text-emerald-400">Station Gate 01</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Punctuality Rate
            </span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white font-mono tabular-nums">
              {punctualityRate}%
            </span>
            <span className="text-xs font-medium text-emerald-400">
              {onTimeCount} Punctual
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500">
            <span>Grace Window: 15 Minutes</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Tardy / Flagged
            </span>
            <AlertCircle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-amber-400 font-mono tabular-nums">
              {lateCount}
            </span>
            <span className="text-xs font-medium text-slate-400">
              Needs Supervisor Note
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500">
            <span>Standard Compliance Rule</span>
          </div>
        </div>
      </div>

      {/* Active Duty Shifts Bar */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Active Duty Operational Sessions
            </h2>
          </div>
          <button
            onClick={() => onNavigate('schedules')}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            <span>Manage Shift Rosters</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {shifts.map((shift) => {
            const assigned = personnel.filter(p => p.assignedShiftId === shift.id).length;
            return (
              <div
                key={shift.id}
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono font-bold text-blue-400">
                    {shift.code}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                    {shift.startTime} – {shift.endTime}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-slate-200 truncate">
                  {shift.name}
                </h3>
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Assigned Personnel:</span>
                  <span className="font-mono font-bold text-white tabular-nums">
                    {assigned} Officers
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Grid: Today's Roll Call Manifest & Division Coverage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Real-Time Verified Duty Roll-Call */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Today's Duty Verification Manifest
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Live verification stream from OSC QR terminals
                </p>
              </div>
              <button
                onClick={() => onNavigate('attendance')}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <span>View All Records</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Officer</th>
                    <th className="py-2.5 px-3">Duty ID</th>
                    <th className="py-2.5 px-3">Division</th>
                    <th className="py-2.5 px-3">Time In</th>
                    <th className="py-2.5 px-3">Time Out</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {todayRecords.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        No duty attendance records logged yet today.
                      </td>
                    </tr>
                  ) : (
                    todayRecords.map((rec) => {
                      const person = personnel.find(p => p.id === rec.personnelId);
                      return (
                        <tr key={rec.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5">
                              {person?.avatarUrl ? (
                                <img
                                  src={person.avatarUrl}
                                  alt={rec.personnelName}
                                  className="w-7 h-7 rounded-md object-cover border border-slate-700"
                                />
                              ) : (
                                <div className="w-7 h-7 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300">
                                  {rec.personnelName.substring(0, 2).toUpperCase()}
                                </div>
                              )}
                              <span className="font-semibold text-slate-200">
                                {rec.personnelName}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3 font-mono text-[11px] text-blue-400">
                            {rec.dutyId}
                          </td>
                          <td className="py-3 px-3 text-slate-400 text-xs truncate max-w-[160px]">
                            {rec.division}
                          </td>
                          <td className="py-3 px-3 font-mono text-[11px] text-slate-300 tabular-nums">
                            {new Date(rec.timestampIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </td>
                          <td className="py-3 px-3 font-mono text-[11px] text-slate-400 tabular-nums">
                            {rec.timestampOut 
                              ? new Date(rec.timestampOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                              : <span className="text-emerald-400 font-sans font-medium text-[11px]">ACTIVE TOUR</span>}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                              rec.status === 'LATE'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800/80'
                                : 'bg-emerald-950 text-emerald-300 border border-emerald-800/80'
                            }`}>
                              {rec.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Division Coverage Breakdown */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Division Coverage
              </h2>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Personnel distribution across Strategic Communications operational divisions.
            </p>

            <div className="space-y-4">
              {Object.entries(divisionStats).map(([division, stats]) => {
                const pct = stats.total > 0 ? Math.round((stats.onDuty / stats.total) * 100) : 0;
                return (
                  <div key={division} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-300 truncate max-w-[190px]">
                        {division}
                      </span>
                      <span className="font-mono text-slate-400 tabular-nums">
                        {stats.onDuty}/{stats.total} on duty
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Centralized Database</span>
            <span className="font-mono text-blue-400">OSC-DAMTS v2.4</span>
          </div>
        </div>
      </div>
    </div>
  );
};
