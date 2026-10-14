import React, { useState } from 'react';
import { 
  ClipboardList, 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Edit3, 
  Trash2, 
  Printer, 
  Eye, 
  X,
  FileSpreadsheet,
  Plus
} from 'lucide-react';
import { AttendanceRecord, Personnel } from '../../types';
import { db } from '../../services/database';

interface AttendanceRecordsViewProps {
  attendance: AttendanceRecord[];
  personnel: Personnel[];
}

export const AttendanceRecordsView: React.FC<AttendanceRecordsViewProps> = ({
  attendance,
  personnel,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedDivision, setSelectedDivision] = useState<string>('ALL');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [inspectingRecord, setInspectingRecord] = useState<AttendanceRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [editStatus, setEditStatus] = useState<'PRESENT' | 'LATE' | 'OVERTIME' | 'EARLY_DEPARTURE' | 'EXCUSED'>('PRESENT');
  const [editNotes, setEditNotes] = useState<string>('');

  // Manual Attendance Record Modal State
  const [isManualModalOpen, setIsManualModalOpen] = useState<boolean>(false);
  const [manualPersonnelId, setManualPersonnelId] = useState<string>('');
  const [manualStatus, setManualStatus] = useState<'PRESENT' | 'LATE' | 'OVERTIME' | 'EARLY_DEPARTURE' | 'EXCUSED'>('PRESENT');
  const [manualTimeIn, setManualTimeIn] = useState<string>('08:00');
  const [manualTimeOut, setManualTimeOut] = useState<string>('17:00');
  const [manualDate, setManualDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [manualNotes, setManualNotes] = useState<string>('Manual administrative duty entry.');

  const divisions = Array.from(new Set(personnel.map(p => p.division)));

  const filtered = attendance.filter(rec => {
    const matchesSearch =
      rec.personnelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.dutyId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.shiftName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'ALL' || rec.status === selectedStatus;
    const matchesDivision = selectedDivision === 'ALL' || rec.division === selectedDivision;
    const matchesDate = !selectedDate || rec.date === selectedDate;
    return matchesSearch && matchesStatus && matchesDivision && matchesDate;
  });

  const handleOpenEdit = (rec: AttendanceRecord) => {
    setEditingRecord(rec);
    setEditStatus(rec.status);
    setEditNotes(rec.scannerNotes || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    db.updateAttendanceRecord(editingRecord.id, {
      status: editStatus,
      scannerNotes: editNotes,
    });

    setEditingRecord(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this attendance audit record?')) {
      db.deleteAttendanceRecord(id);
    }
  };

  const handleForceClockOut = (rec: AttendanceRecord) => {
    const nowIso = new Date().toISOString();
    db.updateAttendanceRecord(rec.id, {
      timestampOut: nowIso,
      scannerNotes: (rec.scannerNotes || '') + ' | Manual Supervisor Clock-Out.',
    });
    // Set personnel off duty
    const p = personnel.find(per => per.id === rec.personnelId);
    if (p) {
      db.updatePersonnel(p.id, { status: 'OFF_DUTY' });
    }
    if (inspectingRecord?.id === rec.id) {
      setInspectingRecord(prev => prev ? { ...prev, timestampOut: nowIso } : null);
    }
  };

  const exportCSV = () => {
    const headers = ['Record ID', 'Duty ID', 'Officer Name', 'Division', 'Shift', 'Date', 'Time In', 'Time Out', 'Status', 'Station', 'Notes'];
    const rows = filtered.map(r => [
      `"${r.id}"`,
      `"${r.dutyId}"`,
      `"${r.personnelName}"`,
      `"${r.division}"`,
      `"${r.shiftName}"`,
      `"${r.date}"`,
      `"${new Date(r.timestampIn).toLocaleTimeString()}"`,
      `"${r.timestampOut ? new Date(r.timestampOut).toLocaleTimeString() : 'ACTIVE'}"`,
      `"${r.status}"`,
      `"${r.stationId}"`,
      `"${(r.scannerNotes || '').replace(/"/g, '""')}"`,
    ]);
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const uri = encodeURI(csv);
    const link = document.createElement('a');
    link.href = uri;
    link.download = `OSC_Duty_Attendance_Log_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleOpenManual = () => {
    if (personnel.length > 0) {
      setManualPersonnelId(personnel[0].id);
    }
    setManualDate(new Date().toISOString().split('T')[0]);
    setManualTimeIn('08:00');
    setManualTimeOut('17:00');
    setManualStatus('PRESENT');
    setManualNotes('Manual administrative duty entry.');
    setIsManualModalOpen(true);
  };

  const handleSaveManual = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedP = personnel.find(p => p.id === manualPersonnelId);
    if (!selectedP) return;

    const [inH, inM] = manualTimeIn.split(':');
    const dIn = new Date(manualDate);
    dIn.setHours(Number(inH) || 8, Number(inM) || 0, 0);

    let dOut: string | null = null;
    if (manualTimeOut.trim()) {
      const [outH, outM] = manualTimeOut.split(':');
      const dOutDate = new Date(manualDate);
      dOutDate.setHours(Number(outH) || 17, Number(outM) || 0, 0);
      dOut = dOutDate.toISOString();
    }

    const shifts = db.getShifts();
    const shift = shifts.find(s => s.id === selectedP.assignedShiftId) || shifts[0];

    const newRecord: AttendanceRecord = {
      id: `att-manual-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      personnelId: selectedP.id,
      dutyId: selectedP.dutyId,
      personnelName: selectedP.fullName,
      division: selectedP.course || selectedP.division || 'Strategic Communications',
      shiftId: shift.id,
      shiftName: shift.name,
      timestampIn: dIn.toISOString(),
      timestampOut: dOut,
      status: manualStatus,
      date: manualDate,
      verificationType: 'MANUAL_VERIFY',
      stationId: 'OSC-ADMIN-DESK',
      scannerNotes: manualNotes,
      recordedBy: 'Administrator Manual Entry',
    };

    db.addAttendanceRecord(newRecord);
    setIsManualModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Attendance Records
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1 font-medium">
            Centralized official log of duty events, time-ins, time-outs, and verification timestamps.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleOpenManual}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Manual Entry</span>
          </button>
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span>Print Manifest</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by officer name, Duty ID, or shift..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
          />

          <select
            value={selectedDivision}
            onChange={(e) => setSelectedDivision(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Divisions</option>
            {divisions.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="PRESENT">Present</option>
            <option value="LATE">Late</option>
            <option value="OVERTIME">Overtime</option>
            <option value="EARLY_DEPARTURE">Early Departure</option>
            <option value="EXCUSED">Excused</option>
          </select>

          {selectedDate && (
            <button
              onClick={() => setSelectedDate('')}
              className="px-2 py-2 text-xs text-slate-400 hover:text-white"
            >
              Clear Date
            </button>
          )}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-950/40">
                <th className="py-3 px-4">Officer & ID</th>
                <th className="py-3 px-4">Division</th>
                <th className="py-3 px-4">Duty Shift</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Time In</th>
                <th className="py-3 px-4">Time Out</th>
                <th className="py-3 px-4 font-mono text-center">Duty Hours</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Station</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    No attendance records match your search criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((rec) => {
                  const person = personnel.find(p => p.id === rec.personnelId);
                  return (
                    <tr key={rec.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          {person?.avatarUrl ? (
                            <img
                              src={person.avatarUrl}
                              alt={rec.personnelName}
                              className="w-7 h-7 rounded-md object-cover border border-slate-700 shrink-0"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300">
                              {rec.personnelName.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-bold text-slate-200 truncate">
                              {rec.personnelName}
                            </div>
                            <div className="text-[10px] font-mono text-blue-400">
                              {rec.dutyId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-300 text-xs truncate max-w-[170px]">
                        {rec.division}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-300">
                        {rec.shiftName}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400 tabular-nums">
                        {rec.date}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-300 tabular-nums">
                        {new Date(rec.timestampIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] tabular-nums">
                        {rec.timestampOut ? (
                          <span className="text-slate-300">
                            {new Date(rec.timestampOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-semibold font-sans text-[11px]">
                            ACTIVE ON DUTY
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-center text-blue-400 font-semibold tabular-nums">
                        {(() => {
                          const timeIn = new Date(rec.timestampIn).getTime();
                          const timeOut = rec.timestampOut ? new Date(rec.timestampOut).getTime() : Date.now();
                          const hrs = Math.max(0, (timeOut - timeIn) / 3600000);
                          return `${hrs.toFixed(1)} hrs`;
                        })()}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          rec.status === 'LATE'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800/80'
                            : rec.status === 'PRESENT'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/80'
                            : 'bg-blue-950 text-blue-300 border border-blue-800/80'
                        }`}>
                          {rec.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[10px] text-slate-500">
                        {rec.stationId}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => setInspectingRecord(rec)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="Inspect Audit Metadata"
                          >
                            <Eye className="w-3.5 h-3.5 text-blue-400" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(rec)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="Edit Status / Notes"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                          </button>
                          <button
                            onClick={() => handleDelete(rec.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Record Modal */}
      {inspectingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative text-xs">
            <button
              onClick={() => setInspectingRecord(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">
              Duty Audit Inspection
            </h3>
            <p className="text-slate-400 mb-4 font-mono text-[11px]">
              Record ID: {inspectingRecord.id}
            </p>

            <div className="space-y-3 bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-500">Officer Name:</span>
                <span className="font-bold text-slate-200">{inspectingRecord.personnelName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Duty ID:</span>
                <span className="font-mono text-blue-400 font-bold">{inspectingRecord.dutyId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Division:</span>
                <span className="text-slate-200">{inspectingRecord.division}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Operational Shift:</span>
                <span className="text-slate-200">{inspectingRecord.shiftName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Check-In Timestamp:</span>
                <span className="font-mono text-slate-200">{new Date(inspectingRecord.timestampIn).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Check-Out Timestamp:</span>
                <span className="font-mono text-slate-200">
                  {inspectingRecord.timestampOut ? new Date(inspectingRecord.timestampOut).toLocaleString() : 'Active Tour (Not Clocked Out)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Verification Source:</span>
                <span className="font-mono text-slate-300">{inspectingRecord.verificationType} ({inspectingRecord.stationId})</span>
              </div>
              <div className="pt-2 border-t border-slate-800">
                <span className="text-slate-500 block mb-1">Audit Notes:</span>
                <span className="text-slate-300 italic block bg-slate-900 p-2 rounded-lg border border-slate-800">
                  {inspectingRecord.scannerNotes || 'Standard QR verification scan.'}
                </span>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              {!inspectingRecord.timestampOut && (
                <button
                  type="button"
                  onClick={() => handleForceClockOut(inspectingRecord)}
                  className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold transition-colors"
                >
                  Force Clock-Out
                </button>
              )}
              <button
                type="button"
                onClick={() => setInspectingRecord(null)}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Record Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                Edit Attendance Record
              </h3>
              <button
                onClick={() => setEditingRecord(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Attendance Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                >
                  <option value="PRESENT">PRESENT</option>
                  <option value="LATE">LATE</option>
                  <option value="OVERTIME">OVERTIME</option>
                  <option value="EARLY_DEPARTURE">EARLY DEPARTURE</option>
                  <option value="EXCUSED">EXCUSED</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Supervisor Notes / Reason for Change
                </label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-600/20"
                >
                  Save Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Attendance Entry Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                Record Manual Attendance Entry
              </h3>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveManual} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Select Personnel *
                </label>
                <select
                  required
                  value={manualPersonnelId}
                  onChange={(e) => setManualPersonnelId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-medium focus:outline-none focus:border-blue-500"
                >
                  {personnel.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} ({p.dutyId}) — {p.course || p.division}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Duty Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Attendance Status
                  </label>
                  <select
                    value={manualStatus}
                    onChange={(e) => setManualStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                  >
                    <option value="PRESENT">PRESENT</option>
                    <option value="LATE">LATE</option>
                    <option value="OVERTIME">OVERTIME</option>
                    <option value="EARLY_DEPARTURE">EARLY DEPARTURE</option>
                    <option value="EXCUSED">EXCUSED</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Time In (24h) *
                  </label>
                  <input
                    type="time"
                    required
                    value={manualTimeIn}
                    onChange={(e) => setManualTimeIn(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Time Out (Optional if Active)
                  </label>
                  <input
                    type="time"
                    value={manualTimeOut}
                    onChange={(e) => setManualTimeOut(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Administrative Reason / Station Notes
                </label>
                <textarea
                  rows={2}
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  placeholder="e.g. Special coverage assignment, badge scanner replacement authorization..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-600/20"
                >
                  Commit Entry to Cloud Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
