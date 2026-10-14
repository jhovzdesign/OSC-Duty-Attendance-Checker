import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Edit3, 
  Eye, 
  ShieldCheck, 
  Phone, 
  Mail, 
  Building,
  Check,
  X
} from 'lucide-react';
import { Personnel, DutyShift, PersonnelStatus } from '../../types';
import { db } from '../../services/database';

interface PersonnelManagementViewProps {
  personnel: Personnel[];
  shifts: DutyShift[];
}

export const PersonnelManagementView: React.FC<PersonnelManagementViewProps> = ({
  personnel,
  shifts,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDivision, setSelectedDivision] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [viewingPersonnel, setViewingPersonnel] = useState<Personnel | null>(null);
  const [editingPersonnel, setEditingPersonnel] = useState<Personnel | null>(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState<{
    dutyId: string;
    fullName: string;
    rankDesignation: string;
    division: string;
    email: string;
    phone: string;
    dutyStation: string;
    clearanceLevel: Personnel['clearanceLevel'];
    status: PersonnelStatus;
    avatarUrl: string;
    emergencyContact: string;
    assignedShiftId: string;
    joinedDate: string;
  }>({
    dutyId: '',
    fullName: '',
    rankDesignation: '',
    division: 'Media Relations & Press Liaison',
    email: '',
    phone: '',
    dutyStation: 'OSC Central Operations Desk',
    clearanceLevel: 'LEVEL_2_CONFIDENTIAL',
    status: 'ACTIVE',
    avatarUrl: '/src/assets/images/personnel_avatar_1_1791956361181.jpg',
    emergencyContact: '',
    assignedShiftId: shifts[0]?.id || 'shift-morning',
    joinedDate: new Date().toISOString().split('T')[0],
  });

  const divisions = Array.from(new Set(personnel.map(p => p.division)));

  // Filtered List
  const filteredPersonnel = personnel.filter(p => {
    const matchesSearch =
      p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.dutyId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.rankDesignation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDiv = selectedDivision === 'ALL' || p.division === selectedDivision;
    const matchesStatus = selectedStatus === 'ALL' || p.status === selectedStatus;
    return matchesSearch && matchesDiv && matchesStatus;
  });

  const handleOpenAddModal = () => {
    // Generate next sequential Duty ID
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    setFormData({
      dutyId: `OSC-2026-${randomSuffix}`,
      fullName: '',
      rankDesignation: 'Communications Specialist',
      division: 'Media Relations & Press Liaison',
      email: '',
      phone: '+63 (02) 8928-1000',
      dutyStation: 'OSC Central Operations Desk',
      clearanceLevel: 'LEVEL_2_CONFIDENTIAL',
      status: 'ACTIVE',
      avatarUrl: '/src/assets/images/personnel_avatar_1_1791956361181.jpg',
      emergencyContact: '',
      assignedShiftId: shifts[0]?.id || 'shift-morning',
      joinedDate: new Date().toISOString().split('T')[0],
    });
    setEditingPersonnel(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (p: Personnel) => {
    setEditingPersonnel(p);
    setFormData({
      dutyId: p.dutyId,
      fullName: p.fullName,
      rankDesignation: p.rankDesignation,
      division: p.division,
      email: p.email,
      phone: p.phone,
      dutyStation: p.dutyStation,
      clearanceLevel: p.clearanceLevel,
      status: p.status,
      avatarUrl: p.avatarUrl,
      emergencyContact: p.emergencyContact,
      assignedShiftId: p.assignedShiftId,
      joinedDate: p.joinedDate,
    });
    setIsAddModalOpen(true);
  };

  const handleSavePersonnel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.dutyId.trim()) return;

    if (editingPersonnel) {
      db.updatePersonnel(editingPersonnel.id, formData);
    } else {
      db.addPersonnel(formData);
    }

    setIsAddModalOpen(false);
    setEditingPersonnel(null);
  };

  const handleDelete = (p: Personnel) => {
    if (confirm(`Are you sure you want to remove ${p.fullName} (${p.dutyId}) from active registry?`)) {
      db.deletePersonnel(p.id);
    }
  };

  const exportCSV = () => {
    const headers = ['Duty ID', 'Full Name', 'Rank/Designation', 'Division', 'Status', 'Clearance', 'Email', 'Phone', 'Station'];
    const rows = filteredPersonnel.map(p => [
      `"${p.dutyId}"`,
      `"${p.fullName}"`,
      `"${p.rankDesignation}"`,
      `"${p.division}"`,
      `"${p.status}"`,
      `"${p.clearanceLevel}"`,
      `"${p.email}"`,
      `"${p.phone}"`,
      `"${p.dutyStation}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `OSC-DAMTS_Personnel_Roster_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Personnel Management
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1 font-medium">
            Directory of authorized Office of Strategic Communications officers, duty assignments, and clearances.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Export Roster CSV</span>
          </button>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Enroll New Officer</span>
          </button>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by officer name, Duty ID (e.g. OSC-2026-001), or designation..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedDivision}
            onChange={(e) => setSelectedDivision(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Operational Divisions</option>
            {divisions.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Duty Statuses</option>
            <option value="ON_DUTY">On Duty</option>
            <option value="ACTIVE">Active (Off Shift)</option>
            <option value="OFF_DUTY">Off Duty</option>
            <option value="ON_LEAVE">On Leave</option>
          </select>
        </div>
      </div>

      {/* Personnel Roster Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-950/40">
                <th className="py-3 px-4">Officer Profile</th>
                <th className="py-3 px-4">Duty ID</th>
                <th className="py-3 px-4">Division & Station</th>
                <th className="py-3 px-4">Clearance Level</th>
                <th className="py-3 px-4">Assigned Shift</th>
                <th className="py-3 px-4">Duty Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredPersonnel.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No personnel records matched your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredPersonnel.map((p) => {
                  const shift = shifts.find(s => s.id === p.assignedShiftId);
                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.avatarUrl}
                            alt={p.fullName}
                            className="w-9 h-9 rounded-xl object-cover border border-slate-700 shadow-sm shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-slate-100 truncate">
                              {p.fullName}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate">
                              {p.rankDesignation}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-xs text-blue-400">
                        {p.dutyId}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-300 font-medium truncate max-w-[200px]">
                          {p.division}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {p.dutyStation}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {p.clearanceLevel.replace('LEVEL_', 'LVL ').replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-300">
                        {shift ? shift.code : 'General'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          p.status === 'ON_DUTY'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : p.status === 'ON_LEAVE'
                            ? 'bg-purple-950 text-purple-300 border border-purple-800'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}>
                          {p.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => setViewingPersonnel(p)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="View Duty Dossier"
                          >
                            <Eye className="w-3.5 h-3.5 text-blue-400" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="Edit Personnel"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                          </button>
                          <button
                            onClick={() => handleDelete(p)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors"
                            title="Remove Personnel"
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

      {/* Add / Edit Personnel Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white tracking-tight">
                {editingPersonnel ? 'Edit Personnel Record' : 'Enroll New Communications Officer'}
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePersonnel} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Assigned Duty ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.dutyId}
                    onChange={(e) => setFormData({ ...formData, dutyId: e.target.value.toUpperCase() })}
                    placeholder="OSC-2026-XXX"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Officer Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Director Alexander Miller"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Rank / Designation *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.rankDesignation}
                    onChange={(e) => setFormData({ ...formData, rankDesignation: e.target.value })}
                    placeholder="e.g. Chief Press Liaison Officer"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Operational Division *
                  </label>
                  <select
                    value={formData.division}
                    onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                  >
                    <option value="Media Relations & Press Liaison">Media Relations & Press Liaison</option>
                    <option value="Digital Media & Creative Production">Digital Media & Creative Production</option>
                    <option value="Strategic Research & Analytics">Strategic Research & Analytics</option>
                    <option value="Crisis Comms & Rapid Response">Crisis Comms & Rapid Response</option>
                    <option value="Editorial & Strategic Messaging">Editorial & Strategic Messaging</option>
                    <option value="Operations & Registry Administration">Operations & Registry Administration</option>
                    <option value="Field Operations & Liaison">Field Operations & Liaison</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="officer@osc.gov.ph"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+63 917 555 0000"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Assigned Duty Station
                  </label>
                  <input
                    type="text"
                    value={formData.dutyStation}
                    onChange={(e) => setFormData({ ...formData, dutyStation: e.target.value })}
                    placeholder="e.g. Press Corps Briefing Room"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Security Clearance
                  </label>
                  <select
                    value={formData.clearanceLevel}
                    onChange={(e) => setFormData({ ...formData, clearanceLevel: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500 font-mono"
                  >
                    <option value="LEVEL_1_BASIC">LEVEL 1 BASIC</option>
                    <option value="LEVEL_2_CONFIDENTIAL">LEVEL 2 CONFIDENTIAL</option>
                    <option value="LEVEL_3_SECRET">LEVEL 3 SECRET</option>
                    <option value="EXECUTIVE">EXECUTIVE CLEARANCE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Assigned Shift Tour
                  </label>
                  <select
                    value={formData.assignedShiftId}
                    onChange={(e) => setFormData({ ...formData, assignedShiftId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                  >
                    {shifts.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.code} · {s.name} ({s.startTime} - {s.endTime})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Official Photo Preset
                  </label>
                  <select
                    value={formData.avatarUrl}
                    onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                  >
                    <option value="/src/assets/images/personnel_avatar_1_1791956361181.jpg">Officer Portrait (Navy Blazer)</option>
                    <option value="/src/assets/images/personnel_avatar_2_1791956359867.jpg">Specialist Portrait (Business Grey)</option>
                    <option value="/src/assets/images/personnel_avatar_3_1791956360265.jpg">Executive Portrait (Senior Director)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-colors"
                >
                  {editingPersonnel ? 'Save Changes' : 'Enroll Officer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Personnel Dossier Modal */}
      {viewingPersonnel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative">
            <button
              onClick={() => setViewingPersonnel(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <img
                src={viewingPersonnel.avatarUrl}
                alt={viewingPersonnel.fullName}
                className="w-24 h-24 rounded-2xl object-cover border-2 border-blue-500/40 mx-auto shadow-lg"
              />
              <span className="mt-3 inline-block font-mono text-xs font-bold text-blue-400 px-2.5 py-0.5 rounded-full bg-blue-950 border border-blue-800">
                {viewingPersonnel.dutyId}
              </span>
              <h3 className="text-lg font-bold text-white mt-1">
                {viewingPersonnel.fullName}
              </h3>
              <p className="text-xs text-slate-400">
                {viewingPersonnel.rankDesignation}
              </p>
            </div>

            <div className="mt-5 space-y-2.5 text-xs bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-500">Division:</span>
                <span className="text-slate-200 font-medium">{viewingPersonnel.division}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-500">Duty Station:</span>
                <span className="text-slate-200 font-medium">{viewingPersonnel.dutyStation}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-500">Clearance:</span>
                <span className="text-emerald-400 font-mono font-semibold">{viewingPersonnel.clearanceLevel.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-500">Email:</span>
                <span className="text-slate-300 font-mono">{viewingPersonnel.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-500">Phone:</span>
                <span className="text-slate-300 font-mono">{viewingPersonnel.phone}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Emergency Contact:</span>
                <span className="text-slate-300">{viewingPersonnel.emergencyContact || 'On File with Administration'}</span>
              </div>
            </div>

            <button
              onClick={() => setViewingPersonnel(null)}
              className="mt-5 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors"
            >
              Close Dossier
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
