import React, { useState } from 'react';
import { 
  BarChart3, 
  Printer, 
  Download, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  FileText, 
  Award,
  Building,
  Timer,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { AttendanceRecord, DutyShift, Personnel } from '../../types';

interface ReportsAnalyticsViewProps {
  personnel: Personnel[];
  attendance: AttendanceRecord[];
  shifts: DutyShift[];
}

export const ReportsAnalyticsView: React.FC<ReportsAnalyticsViewProps> = ({
  personnel,
  attendance,
  shifts,
}) => {
  const [reportDate, setReportDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dateFilterMode, setDateFilterMode] = useState<'DATE' | 'ALL'>('DATE');

  // Filter records based on selected date or all-time
  const relevantRecords = dateFilterMode === 'DATE'
    ? attendance.filter(r => r.date === reportDate)
    : attendance;

  // Calculate duty hours for an attendance record
  const calculateRecordHours = (record: AttendanceRecord): { hours: number; formatted: string; isActive: boolean } => {
    const timeIn = new Date(record.timestampIn).getTime();
    if (isNaN(timeIn)) return { hours: 0, formatted: '0.0 hrs', isActive: false };

    let timeOut: number;
    let isActive = false;

    if (record.timestampOut) {
      timeOut = new Date(record.timestampOut).getTime();
    } else {
      // Active duty tour: count up to current time if today, or 8 hours standard default
      const today = new Date().toISOString().split('T')[0];
      if (record.date === today) {
        timeOut = Date.now();
        isActive = true;
      } else {
        timeOut = timeIn + 8 * 3600000;
      }
    }

    const durationMs = Math.max(0, timeOut - timeIn);
    const totalMinutes = Math.floor(durationMs / 60000);
    const hours = Math.round((durationMs / 3600000) * 10) / 10;
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;

    return {
      hours,
      formatted: `${hours.toFixed(1)} hrs (${h}h ${m}m)`,
      isActive,
    };
  };

  // Aggregated Total Duty Hours for the view
  const totalDutyHours = relevantRecords.reduce((acc, rec) => {
    return acc + calculateRecordHours(rec).hours;
  }, 0);

  const roundedTotalHours = Math.round(totalDutyHours * 10) / 10;
  const avgDutyHours = relevantRecords.length > 0 
    ? Math.round((totalDutyHours / relevantRecords.length) * 10) / 10 
    : 0;

  const totalOfficers = personnel.length;
  const attendedCount = relevantRecords.length;
  const punctualCount = relevantRecords.filter(r => r.status === 'PRESENT').length;
  const tardyCount = relevantRecords.filter(r => r.status === 'LATE').length;
  const attendanceRate = totalOfficers > 0 ? Math.round((attendedCount / totalOfficers) * 100) : 0;
  const punctualityRate = attendedCount > 0 ? Math.round((punctualCount / attendedCount) * 100) : 100;

  // Duty Hours & Attendance by Course / Division
  const courseDutyStats: Record<string, { totalHours: number; officersCount: number; recordsCount: number }> = {};
  personnel.forEach(p => {
    const key = p.course || p.division || 'Strategic Communications';
    if (!courseDutyStats[key]) {
      courseDutyStats[key] = { totalHours: 0, officersCount: 0, recordsCount: 0 };
    }
    courseDutyStats[key].officersCount += 1;
  });

  relevantRecords.forEach(r => {
    const key = r.division || 'Strategic Communications';
    if (!courseDutyStats[key]) {
      courseDutyStats[key] = { totalHours: 0, officersCount: 1, recordsCount: 0 };
    }
    courseDutyStats[key].recordsCount += 1;
    courseDutyStats[key].totalHours += calculateRecordHours(r).hours;
  });

  // Calculate accumulated duty hours per individual officer
  const officerDutyLedger = personnel.map(p => {
    const officerRecords = attendance.filter(r => r.personnelId === p.id);
    const currentPeriodRecords = relevantRecords.filter(r => r.personnelId === p.id);
    const periodHours = currentPeriodRecords.reduce((acc, r) => acc + calculateRecordHours(r).hours, 0);
    const allTimeHours = officerRecords.reduce((acc, r) => acc + calculateRecordHours(r).hours, 0);
    const activeTour = officerRecords.find(r => r.timestampOut === null && r.date === new Date().toISOString().split('T')[0]);

    return {
      personnel: p,
      periodHours: Math.round(periodHours * 10) / 10,
      allTimeHours: Math.round(allTimeHours * 10) / 10,
      toursCount: currentPeriodRecords.length,
      isActiveNow: !!activeTour,
    };
  }).sort((a, b) => b.periodHours - a.periodHours);

  const handlePrint = () => {
    window.print();
  };

  const exportCSV = () => {
    const headers = [
      'Report Date',
      'Officer Name',
      'Duty ID',
      'Course',
      'Shift',
      'Time In',
      'Time Out',
      'Total Duty Hours',
      'Status',
      'Station',
    ];
    const rows = relevantRecords.map(r => {
      const hoursInfo = calculateRecordHours(r);
      return [
        `"${r.date}"`,
        `"${r.personnelName}"`,
        `"${r.dutyId}"`,
        `"${r.division}"`,
        `"${r.shiftName}"`,
        `"${new Date(r.timestampIn).toLocaleTimeString()}"`,
        `"${r.timestampOut ? new Date(r.timestampOut).toLocaleTimeString() : 'ACTIVE TOUR'}"`,
        `"${hoursInfo.hours} hrs"`,
        `"${r.status}"`,
        `"${r.stationId}"`,
      ];
    });
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encoded = encodeURI(csv);
    const link = document.createElement('a');
    link.href = encoded;
    link.download = `OSC_Duty_Hours_Report_${reportDate}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-800 no-print">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Reports and Analytics
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1 font-medium">
            Institutional duty roll-call manifests, total duty hours accounting, and compliance analytics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Period Toggle */}
          <div className="inline-flex p-1 bg-slate-900 rounded-xl border border-slate-800">
            <button
              onClick={() => setDateFilterMode('DATE')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                dateFilterMode === 'DATE'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Specific Date
            </button>
            <button
              onClick={() => setDateFilterMode('ALL')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                dateFilterMode === 'ALL'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All-Time Summary
            </button>
          </div>

          {dateFilterMode === 'DATE' && (
            <input
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
            />
          )}

          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Official Report</span>
          </button>
        </div>
      </div>

      {/* Primary Analytics KPI Cards Featuring Total Duty Hours (no-print) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 no-print">
        {/* KPI 1: TOTAL DUTY HOURS (NEW FEATURE) */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-950/70 via-slate-900 to-slate-900 border-2 border-blue-600/50 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between text-blue-400">
            <span className="text-xs font-bold uppercase tracking-wider">
              Total Duty Hours
            </span>
            <Timer className="w-5 h-5 text-blue-400 animate-pulse-subtle" />
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white font-mono tabular-nums">
              {roundedTotalHours}
              <span className="text-sm font-semibold text-blue-400 ml-1">hrs</span>
            </span>
            <span className="text-xs font-semibold text-emerald-400 font-mono">
              {avgDutyHours} hrs avg / tour
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex justify-between">
            <span>Logged Work Output</span>
            <span className="font-mono text-blue-300">
              {dateFilterMode === 'DATE' ? `Date: ${reportDate}` : 'Cumulative All-Time'}
            </span>
          </div>
        </div>

        {/* KPI 2: Roll-Call Turnout */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Roll-Call Manifest Size
            </span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white font-mono tabular-nums">
              {attendedCount} / {totalOfficers}
            </span>
            <span className="text-xs font-semibold text-blue-400 font-mono">
              {attendanceRate}% Turnout
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500">
            <span>Verified Attendance Entries</span>
          </div>
        </div>

        {/* KPI 3: Punctuality Compliance */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Punctuality Compliance
            </span>
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-emerald-400 font-mono tabular-nums">
              {punctualityRate}%
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {punctualCount} On-Time
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500">
            <span>Standard Grace Period Window</span>
          </div>
        </div>

        {/* KPI 4: Tardiness / Attention */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Tardy / Flagged Tours
            </span>
            <AlertCircle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-amber-400 font-mono tabular-nums">
              {tardyCount}
            </span>
            <span className="text-xs text-amber-500 font-mono">
              Exceeded Grace Period
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500">
            <span>Supervisor Review Required</span>
          </div>
        </div>
      </div>

      {/* Duty Hours by Officer Leaderboard Strip (no-print) */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 no-print space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Duty Hours by Officer Ledger ({officerDutyLedger.length})
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Sorted by Total Duty Hours
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {officerDutyLedger.map((item, idx) => (
            <div
              key={item.personnel.id}
              className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-3"
            >
              <img
                src={item.personnel.avatarUrl}
                alt={item.personnel.fullName}
                className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 truncate">
                    {item.personnel.fullName}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    #{idx + 1}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  {item.personnel.course || item.personnel.division}
                </div>
                <div className="mt-1 flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-blue-400">
                    {item.periodHours} hrs
                  </span>
                  {item.isActiveNow ? (
                    <span className="text-[10px] font-mono text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Active Tour
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 font-mono">
                      {item.toursCount} tour(s)
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Official Institutional Manifest (Formatted for screen and high-resolution print) */}
      <div className="p-8 rounded-2xl bg-white text-slate-900 shadow-2xl border border-slate-300 print:border-none print:shadow-none print:p-0">
        {/* Institutional Letterhead */}
        <div className="flex items-center justify-between pb-6 border-b-2 border-slate-900">
          <div>
            <span className="text-xs font-bold tracking-widest uppercase text-slate-600 block">
              Republic of the Philippines · Executive Branch
            </span>
            <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-950">
              OFFICE OF STRATEGIC COMMUNICATIONS
            </h2>
            <span className="text-xs font-semibold text-blue-900 block mt-0.5">
              OSC Duty Attendance Management Tracking System (OSC-DAMTS)
            </span>
          </div>

          <div className="text-right text-xs">
            <div className="font-mono font-bold text-slate-900 uppercase">
              REPORT REF: OSC-MANIFEST-{reportDate.replace(/-/g, '')}
            </div>
            <div className="text-slate-600">
              Generated: {new Date().toLocaleString()}
            </div>
            <div className="font-semibold text-emerald-700">
              STATUS: CERTIFIED AUDIT MANIFEST
            </div>
          </div>
        </div>

        {/* Report Meta Info with Total Duty Hours Prominently Displayed */}
        <div className="my-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <span className="text-slate-500 block font-semibold">Report Period:</span>
            <span className="font-bold text-slate-900 text-sm font-mono">
              {dateFilterMode === 'DATE' ? reportDate : 'Cumulative All-Time'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block font-semibold">Officers Recorded:</span>
            <span className="font-bold text-slate-900 text-sm font-mono">
              {relevantRecords.length} Duty Entries
            </span>
          </div>
          <div>
            <span className="text-slate-500 block font-semibold">Total Duty Hours:</span>
            <span className="font-extrabold text-blue-900 text-base font-mono">
              {roundedTotalHours} Hours
            </span>
          </div>
          <div>
            <span className="text-slate-500 block font-semibold">Average Duty Hours:</span>
            <span className="font-bold text-slate-900 text-sm font-mono">
              {avgDutyHours} Hours / Officer
            </span>
          </div>
        </div>

        {/* Manifest Table with Total Duty Hours Column */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Official Personnel Duty Manifest & Hours Accounting
            </h3>
            <span className="text-xs font-mono font-bold text-blue-900 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
              Total Duty Hours Logged: {roundedTotalHours} hrs
            </span>
          </div>

          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b-2 border-slate-900 bg-slate-100 font-bold text-slate-900">
                <th className="py-2.5 px-3">No.</th>
                <th className="py-2.5 px-3">ID Number</th>
                <th className="py-2.5 px-3">Officer Name</th>
                <th className="py-2.5 px-3">Course / Division</th>
                <th className="py-2.5 px-3">Watch Session</th>
                <th className="py-2.5 px-3 font-mono">Time-In</th>
                <th className="py-2.5 px-3 font-mono">Time-Out</th>
                <th className="py-2.5 px-3 font-mono text-center bg-blue-50/80">Total Duty Hours</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {relevantRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500 italic">
                    No verified attendance records logged for date {reportDate}.
                  </td>
                </tr>
              ) : (
                relevantRecords.map((r, idx) => {
                  const hoursInfo = calculateRecordHours(r);
                  return (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono text-slate-500">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-900">{r.dutyId}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{r.personnelName}</td>
                      <td className="py-2.5 px-3 text-slate-700">{r.division}</td>
                      <td className="py-2.5 px-3 text-slate-700">{r.shiftName}</td>
                      <td className="py-2.5 px-3 font-mono font-semibold">
                        {new Date(r.timestampIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-2.5 px-3 font-mono">
                        {r.timestampOut ? (
                          new Date(r.timestampOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        ) : (
                          <span className="text-emerald-700 font-semibold font-sans text-[11px]">
                            ACTIVE TOUR
                          </span>
                        )}
                      </td>
                      {/* Total Duty Hours Cell */}
                      <td className="py-2.5 px-3 font-mono font-bold text-center text-blue-900 bg-blue-50/50">
                        {hoursInfo.formatted}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className={`font-mono font-bold px-2 py-0.5 rounded text-[10px] ${
                          r.status === 'LATE'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {/* Table Footer with Total Sum of Duty Hours */}
            {relevantRecords.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-slate-900 bg-slate-100 font-bold text-slate-900">
                  <td colSpan={7} className="py-3 px-3 text-right uppercase tracking-wider text-xs">
                    Sum Total of Duty Hours:
                  </td>
                  <td className="py-3 px-3 font-mono font-extrabold text-center text-sm text-blue-900 bg-blue-100/70">
                    {roundedTotalHours} Hours
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Course / Division Duty Hours Accounting Breakdown */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
            Total Duty Hours Accumulated by Course / Department
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            {Object.entries(courseDutyStats).map(([course, data]) => {
              const hoursRounded = Math.round(data.totalHours * 10) / 10;
              const pct = roundedTotalHours > 0 ? Math.round((hoursRounded / roundedTotalHours) * 100) : 0;
              return (
                <div key={course} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 truncate max-w-[170px]">{course}</span>
                    <span className="font-mono font-extrabold text-blue-900 text-xs">{hoursRounded} hrs</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden my-1.5">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                    <span>{data.recordsCount} tour(s)</span>
                    <span>{pct}% of total hours</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Official Signatory Certification Block */}
        <div className="mt-12 pt-8 border-t-2 border-slate-900 grid grid-cols-2 gap-12 text-xs">
          <div>
            <span className="text-slate-500 block mb-8 font-semibold">Verified & Certified by:</span>
            <div className="border-t border-slate-900 pt-1.5">
              <span className="font-bold text-slate-900 block">DUTY DESK SUPERVISOR</span>
              <span className="text-slate-600 block">OSC Terminal Registry Checkpoint</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-slate-500 block mb-8 font-semibold">Attested & Approved by:</span>
            <div className="border-t border-slate-900 pt-1.5">
              <span className="font-bold text-slate-900 block">DIRECTOR OF OPERATIONS</span>
              <span className="text-slate-600 block">Office of Strategic Communications</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
