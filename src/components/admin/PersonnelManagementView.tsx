import React, { useState, useRef } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Download, 
  Trash2, 
  Edit3, 
  Eye, 
  Upload, 
  Check, 
  X,
  QrCode,
  GraduationCap,
  Image as ImageIcon
} from 'lucide-react';
import { Personnel, DutyShift, PersonnelStatus } from '../../types';
import { db } from '../../services/database';

interface PersonnelManagementViewProps {
  personnel: Personnel[];
  shifts: DutyShift[];
}

const COMMON_COURSES = [
  'BA Communication',
  'BS Information Technology',
  'BA Journalism',
  'BS Development Communication',
  'BA Strategic Communications',
  'BFA Digital Media & Creative Arts',
  'BS Public Administration',
  'BA Broadcast Communication',
  'BA Political Science',
];

const PHOTO_PRESETS = [
  { label: 'Officer Portrait 1', url: '/src/assets/images/personnel_avatar_1_1791956361181.jpg' },
  { label: 'Specialist Portrait 2', url: '/src/assets/images/personnel_avatar_2_1791956359867.jpg' },
  { label: 'Executive Portrait 3', url: '/src/assets/images/personnel_avatar_3_1791956360265.jpg' },
];

export const PersonnelManagementView: React.FC<PersonnelManagementViewProps> = ({
  personnel,
  shifts,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [viewingPersonnel, setViewingPersonnel] = useState<Personnel | null>(null);
  const [editingPersonnel, setEditingPersonnel] = useState<Personnel | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State strictly for the 4 requested fields: Name, ID Number, Course, Photo
  const [formData, setFormData] = useState<{
    fullName: string;
    dutyId: string;
    course: string;
    avatarUrl: string;
  }>({
    fullName: '',
    dutyId: '',
    course: 'BA Communication',
    avatarUrl: PHOTO_PRESETS[0].url,
  });

  const courses = Array.from(new Set(personnel.map(p => p.course || 'BA Communication')));

  // Filtered List
  const filteredPersonnel = personnel.filter(p => {
    const matchesSearch =
      p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.dutyId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.course && p.course.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCourse = selectedCourse === 'ALL' || (p.course || 'BA Communication') === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  const handleOpenAddModal = () => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    setFormData({
      fullName: '',
      dutyId: `OSC-2026-${randomSuffix}`,
      course: 'BA Communication',
      avatarUrl: PHOTO_PRESETS[0].url,
    });
    setEditingPersonnel(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Personnel) => {
    setEditingPersonnel(p);
    setFormData({
      fullName: p.fullName,
      dutyId: p.dutyId,
      course: p.course || 'BA Communication',
      avatarUrl: p.avatarUrl || PHOTO_PRESETS[0].url,
    });
    setIsModalOpen(true);
  };

  const handleSavePersonnel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.dutyId.trim()) return;

    if (editingPersonnel) {
      db.updatePersonnel(editingPersonnel.id, {
        fullName: formData.fullName.trim(),
        dutyId: formData.dutyId.trim().toUpperCase(),
        course: formData.course.trim(),
        avatarUrl: formData.avatarUrl,
        division: formData.course.trim(),
      });
    } else {
      db.addPersonnel({
        fullName: formData.fullName.trim(),
        dutyId: formData.dutyId.trim().toUpperCase(),
        course: formData.course.trim(),
        avatarUrl: formData.avatarUrl,
        rankDesignation: 'Communications Specialist',
        division: formData.course.trim(),
        email: `${formData.fullName.toLowerCase().replace(/\s+/g, '.')}@osc.gov.ph`,
        phone: '+63 917 555 0000',
        dutyStation: 'OSC Central Operations Desk',
        clearanceLevel: 'LEVEL_2_CONFIDENTIAL',
        status: 'ACTIVE',
        emergencyContact: 'On file with administration',
        assignedShiftId: shifts[0]?.id || 'shift-morning',
        joinedDate: new Date().toISOString().split('T')[0],
      });
    }

    setIsModalOpen(false);
    setEditingPersonnel(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFormData(prev => ({ ...prev, avatarUrl: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = (p: Personnel) => {
    if (confirm(`Remove personnel record for ${p.fullName} (${p.dutyId})?`)) {
      db.deletePersonnel(p.id);
    }
  };

  const exportCSV = () => {
    const headers = ['ID Number', 'Full Name', 'Course', 'Status'];
    const rows = filteredPersonnel.map(p => [
      `"${p.dutyId}"`,
      `"${p.fullName}"`,
      `"${p.course || 'BA Communication'}"`,
      `"${p.status || 'ACTIVE'}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `OSC-DAMTS_Personnel_${new Date().toISOString().split('T')[0]}.csv`);
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
            Manage officer and personnel profiles, assigned ID numbers, courses, and credential photos.
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
            <span>Enroll Personnel</span>
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
            placeholder="Search by name, ID number (e.g. OSC-2026-558), or course..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Courses</option>
            {courses.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Personnel Roster Table: Displays Name, ID Number, Course, Photo, Status, Actions */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-950/40">
                <th className="py-3 px-4">Photo & Name</th>
                <th className="py-3 px-4">ID Number</th>
                <th className="py-3 px-4">Course</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredPersonnel.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    No personnel records found. Click "Enroll Personnel" to add one.
                  </td>
                </tr>
              ) : (
                filteredPersonnel.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.avatarUrl}
                          alt={p.fullName}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-700 shadow-sm shrink-0"
                        />
                        <div className="font-bold text-slate-100 text-sm">
                          {p.fullName}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-xs text-blue-400">
                      {p.dutyId}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                        <GraduationCap className="w-4 h-4 text-slate-500 shrink-0" />
                        <span>{p.course || 'BA Communication'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        p.status === 'ON_DUTY'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}>
                        {p.status ? p.status.replace('_', ' ') : 'ACTIVE'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => setViewingPersonnel(p)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="View Profile & QR Code"
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
                          title="Remove Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simplified Modal: Strictly Name, ID Number, Course, and Photo */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {editingPersonnel ? 'Edit Personnel' : 'Enroll Personnel'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Enter personnel details for attendance tracking and QR badge generation.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePersonnel} className="mt-5 space-y-4">
              {/* 1. Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Jhovhert Bogtong"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* 2. ID Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  ID Number *
                </label>
                <input
                  type="text"
                  required
                  value={formData.dutyId}
                  onChange={(e) => setFormData({ ...formData, dutyId: e.target.value.toUpperCase() })}
                  placeholder="e.g. OSC-2026-558"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm font-mono font-bold focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* 3. Course */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Course *
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    required
                    value={formData.course}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                    placeholder="e.g. BA Communication or BS Information Technology"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  {/* Quick Course Presets */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {COMMON_COURSES.slice(0, 5).map(c => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setFormData({ ...formData, course: c })}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-colors ${
                          formData.course === c
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4. Photo */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Photo *
                </label>
                <div className="flex items-center gap-4 p-3 bg-slate-950 rounded-2xl border border-slate-800">
                  <img
                    src={formData.avatarUrl}
                    alt="Preview"
                    className="w-16 h-16 rounded-xl object-cover border-2 border-blue-500/50 shadow-md shrink-0"
                  />

                  <div className="flex-1 space-y-2">
                    <span className="text-[11px] text-slate-400 block">
                      Choose an official portrait preset or upload your photo:
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1.5">
                        {PHOTO_PRESETS.map((p, idx) => (
                          <button
                            type="button"
                            key={p.url}
                            onClick={() => setFormData({ ...formData, avatarUrl: p.url })}
                            className={`w-8 h-8 rounded-lg overflow-hidden border-2 transition-all ${
                              formData.avatarUrl === p.url
                                ? 'border-blue-500 scale-105 shadow-md shadow-blue-500/30'
                                : 'border-slate-700 opacity-60 hover:opacity-100'
                            }`}
                            title={p.label}
                          >
                            <img src={p.url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>

                      <span className="text-slate-600 text-xs">or</span>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5 text-blue-400" />
                        <span>Upload Photo</span>
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/20 transition-all"
                >
                  {editingPersonnel ? 'Save Changes' : 'Enroll Officer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Personnel Profile Modal */}
      {viewingPersonnel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative text-center">
            <button
              onClick={() => setViewingPersonnel(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <img
              src={viewingPersonnel.avatarUrl}
              alt={viewingPersonnel.fullName}
              className="w-24 h-24 rounded-2xl object-cover border-2 border-blue-500/40 mx-auto shadow-lg"
            />

            <span className="mt-3 inline-block font-mono text-xs font-bold text-blue-400 px-3 py-0.5 rounded-full bg-blue-950 border border-blue-800">
              {viewingPersonnel.dutyId}
            </span>

            <h3 className="text-lg font-bold text-white mt-1.5">
              {viewingPersonnel.fullName}
            </h3>

            <div className="mt-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left text-xs space-y-2.5">
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-500">ID Number:</span>
                <span className="text-blue-400 font-mono font-bold">{viewingPersonnel.dutyId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-500">Name:</span>
                <span className="text-slate-200 font-bold">{viewingPersonnel.fullName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-500">Course:</span>
                <span className="text-slate-200 font-semibold">{viewingPersonnel.course || 'BA Communication'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Duty Status:</span>
                <span className="text-emerald-400 font-mono font-bold">{viewingPersonnel.status || 'ACTIVE'}</span>
              </div>
            </div>

            <button
              onClick={() => setViewingPersonnel(null)}
              className="mt-5 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-md shadow-blue-600/20"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
