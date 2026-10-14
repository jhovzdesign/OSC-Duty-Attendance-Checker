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
  Building
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
  const [reportType, setReportType] = useState<'DAILY_MANIFEST' | 'DIVISION_METRICS' | 'PUNCTUALITY_AUDIT'>('DAILY_MANIFEST');

  const selectedDayRecords = attendance.filter(r => r.date === reportDate);
  const totalOfficers = personnel.length;
  const attendedCount = selectedDayRecords.length;
  const punctualCount = selectedDayRecords.filter(r => r.status === 'PRESENT').length;
  const tardyCount = selectedDayRecords.filter(r => r.status === 'LATE').length;
  const attendanceRate = totalOfficers > 0 ? Math.round((attendedCount / totalOfficers) * 100) : 0;
  const punctualityRate = attendedCount > 0 ? Math.round((punctualCount / attendedCount) * 100) : 100;

  // Division calculations
  const divisionMap: Record<string, { total: number; present: number; late: number }> = {};
  personnel.forEach(p => {
    if (!divisionMap[p.division]) {
      divisionMap[p.division] = { total: 0, present: 0, late: 0 };
    }
    divisionMap[p.division].total += 1;
  });

  selectedDayRecords.forEach(r => {
    if (divisionMap[r.division]) {
      if (r.status === 'PRESENT') divisionMap[r.division].present += 1;
      if (r.status === 'LATE') divisionMap[r.division].late += 1;
    }
  });

  const handlePrint = () => {
    window.print();
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
            Institutional duty roll-call manifests, division attendance comparisons, and compliance analytics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={reportDate}
            onChange={(e) => setReportDate(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Official Report</span>
          </button>
        </div>
      </div>

      {/* Analytics Summary Cards (no-print) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 no-print">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Roll-Call Manifest Size
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">
              {attendedCount} / {totalOfficers}
            </span>
            <span className="text-xs font-semibold text-blue-400 font-mono">
              {attendanceRate}% Turnout
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Punctuality Compliance
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
              {punctualityRate}%
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {punctualCount} Punctual
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Tardy / Grace Exceeded
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
              {tardyCount}
            </span>
            <span className="text-xs text-amber-500 font-mono">
              Requires Justification
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Active Shifts Monitored
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-blue-400 tabular-nums">
              {shifts.length}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              24/7 Watch Coverage
            </span>
          </div>
        </div>
      </div>

      {/* Official Institutional Manifest (Formatted for screen and print) */}
      <div className="p-8 rounded-2xl bg-white text-slate-900 shadow-2xl border border-slate-300 print:border-none print:shadow-none print:p-0">
        {/* Institutional Letterhead */}
        <div className="flex items-center justify-between pb-6 border-b-2 border-slate-900">
          <div className="flex items-center gap-4">
            <img
              src="/src/assets/images/osc_institutional_emblem_1791956358770.jpg"
              alt="Official Seal"
              className="w-16 h-16 rounded-full border-2 border-slate-900 object-cover shrink-0"
            />
            <div>
              <span className="text-xs font-bold tracking-widest uppercase text-slate-600 block">
                Republic of the Philippines · Executive Branch
              </span>
              <h2 className="text-xl font-extrabold tracking-tight text-slate-950">
                OFFICE OF STRATEGIC COMMUNICATIONS
              </h2>
              <span className="text-xs font-semibold text-blue-900 block mt-0.5">
                OSC Duty Attendance Management Tracking System (OSC-DAMTS)
              </span>
            </div>
          </div>

          <div className="text-right text-xs">
            <div className="font-mono font-bold text-slate-900 uppercase">
              REPORT REF: OSC-MANIFEST-{reportDate.replace(/-/g, '')}
            </div>
            <div className="text-slate-600">
              Generated: {new Date().toLocaleString()}
            </div>
            <div className="font-semibold text-emerald-700">
              STATUS: CERTIFIED RECORD
            </div>
          </div>
        </div>

        {/* Report Meta Info */}
        <div className="my-6 grid grid-cols-3 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <span className="text-slate-500 block font-semibold">Report Period:</span>
            <span className="font-bold text-slate-900 text-sm font-mono">{reportDate}</span>
          </div>
          <div>
            <span className="text-slate-500 block font-semibold">Reporting Station:</span>
            <span className="font-bold text-slate-900 text-sm">OSC Central Terminal Checkpoint</span>
          </div>
          <div>
            <span className="text-slate-500 block font-semibold">Duty Tour Officer Count:</span>
            <span className="font-bold text-slate-900 text-sm font-mono">{selectedDayRecords.length} Officers Recorded</span>
          </div>
        </div>

        {/* Manifest Table */}
        <div className="mt-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3">
            Official Personnel Duty Manifest
          </h3>

          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b-2 border-slate-900 bg-slate-100 font-bold text-slate-900">
                <th className="py-2.5 px-3">No.</th>
                <th className="py-2.5 px-3">Duty ID</th>
                <th className="py-2.5 px-3">Officer Name</th>
                <th className="py-2.5 px-3">Operational Division</th>
                <th className="py-2.5 px-3">Watch Session</th>
                <th className="py-2.5 px-3 font-mono">Time-In</th>
                <th className="py-2.5 px-3 font-mono">Time-Out</th>
                <th className="py-2.5 px-3 text-right">Duty Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {selectedDayRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 italic">
                    No verified attendance records logged for date {reportDate}.
                  </td>
                </tr>
              ) : (
                selectedDayRecords.map((r, idx) => (
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
                      {r.timestampOut 
                        ? new Date(r.timestampOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                        : 'ACTIVE'}
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
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Division Breakdown Manifest Section */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
            Division Compliance Summary
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {Object.entries(divisionMap).map(([div, data]) => (
              <div key={div} className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-900 block truncate">{div}</span>
                <span className="text-[11px] text-slate-600 block mt-1 font-mono">
                  {data.present + data.late}/{data.total} Present ({data.late} Late)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Official Signatory Certification Block */}
        <div className="mt-12 pt-8 border-t-2 border-slate-900 grid grid-cols-2 gap-12 text-xs">
          <div>
            <span className="text-slate-500 block mb-8 font-semibold">Verified & Logged by:</span>
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
