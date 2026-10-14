import React, { useState } from 'react';
import { 
  CalendarClock, 
  Plus, 
  Clock, 
  Users, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  X, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { DutyShift, Personnel } from '../../types';
import { db } from '../../services/database';

interface DutySchedulesViewProps {
  shifts: DutyShift[];
  personnel: Personnel[];
}

export const DutySchedulesView: React.FC<DutySchedulesViewProps> = ({ shifts, personnel }) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingShift, setEditingShift] = useState<DutyShift | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    startTime: '08:00',
    endTime: '16:00',
    gracePeriodMinutes: 15,
    description: '',
    color: '#2563eb',
    activeDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  });

  const handleOpenAdd = () => {
    setEditingShift(null);
    setFormData({
      code: `DS-0${shifts.length + 1}`,
      name: '',
      startTime: '08:00',
      endTime: '16:00',
      gracePeriodMinutes: 15,
      description: 'Standard strategic communications duty tour.',
      color: '#2563eb',
      activeDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (shift: DutyShift) => {
    setEditingShift(shift);
    setFormData({
      code: shift.code,
      name: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
      gracePeriodMinutes: shift.gracePeriodMinutes,
      description: shift.description,
      color: shift.color,
      activeDays: shift.activeDays,
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) return;

    if (editingShift) {
      db.updateShift(editingShift.id, formData);
    } else {
      db.addShift(formData);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (shift: DutyShift) => {
    if (confirm(`Remove shift schedule "${shift.name}"?`)) {
      db.deleteShift(shift.id);
    }
  };

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      activeDays: prev.activeDays.includes(day)
        ? prev.activeDays.filter(d => d !== day)
        : [...prev.activeDays, day],
    }));
  };

  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Duty Schedules and Sessions
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1 font-medium">
            Configure institutional watch shifts, tour periods, grace intervals, and duty rosters.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-colors self-start md:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Duty Shift Session</span>
        </button>
      </div>

      {/* Shifts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {shifts.map(shift => {
          const assigned = personnel.filter(p => p.assignedShiftId === shift.id);
          return (
            <div
              key={shift.id}
              className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800">
                      {shift.code}
                    </span>
                    <h3 className="text-base font-bold text-white">
                      {shift.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(shift)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      title="Edit Shift"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-blue-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(shift)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Delete Shift"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-xs bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Shift Timing</span>
                    <span className="font-mono font-bold text-slate-200 text-sm">
                      {shift.startTime} – {shift.endTime}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Grace Period</span>
                    <span className="font-mono font-bold text-blue-400 text-sm">
                      {shift.gracePeriodMinutes} Minutes
                    </span>
                  </div>
                </div>

                <p className="mt-3 text-xs text-slate-400 leading-relaxed">
                  {shift.description}
                </p>

                {/* Active Days */}
                <div className="mt-4">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                    Operational Watch Days:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {DAYS.map(day => {
                      const isActive = shift.activeDays.includes(day);
                      return (
                        <span
                          key={day}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                            isActive
                              ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                              : 'bg-slate-950 text-slate-600 border border-slate-800'
                          }`}
                        >
                          {day}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Assigned Personnel Roster preview */}
              <div className="mt-6 pt-4 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-400" />
                    <span>Assigned Officers ({assigned.length})</span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {assigned.slice(0, 4).map(p => (
                    <span
                      key={p.id}
                      className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[11px] text-slate-300 font-medium truncate max-w-[130px]"
                    >
                      {p.fullName.split(' ')[0]} ({p.dutyId})
                    </span>
                  ))}
                  {assigned.length > 4 && (
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[11px] text-slate-400 font-mono">
                      +{assigned.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Shift Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white">
                {editingShift ? 'Modify Duty Shift Session' : 'Create Duty Shift Session'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Shift Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="MW-01"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Shift Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Morning Tactical Watch"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    End Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Grace (Mins)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={formData.gracePeriodMinutes}
                    onChange={(e) => setFormData({ ...formData, gracePeriodMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Description / Operational Scope
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Operational responsibilities for this watch..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">
                  Active Days
                </label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map(day => (
                    <button
                      type="button"
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`px-3 py-1.5 rounded-lg font-mono text-xs font-semibold transition-colors ${
                        formData.activeDays.includes(day)
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-950 text-slate-400 border border-slate-800'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-600/20"
                >
                  Save Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
