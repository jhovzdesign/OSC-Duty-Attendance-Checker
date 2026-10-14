import React, { useState } from 'react';
import { 
  ShieldAlert, 
  UserPlus, 
  Shield, 
  CheckCircle2, 
  XCircle, 
  Mail, 
  Building, 
  Key, 
  Clock, 
  X 
} from 'lucide-react';
import { Operator, SystemRole } from '../../types';
import { db } from '../../services/database';

interface OperatorManagementViewProps {
  operators: Operator[];
}

export const OperatorManagementView: React.FC<OperatorManagementViewProps> = ({ operators }) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: 'DUTY_SUPERVISOR' as SystemRole,
    station: 'Main Gate Access Desk',
    isActive: true,
  });

  const handleOpenAdd = () => {
    setFormData({
      fullName: '',
      email: '',
      role: 'DUTY_SUPERVISOR',
      station: 'OSC Terminal Desk 01',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim()) return;

    db.addOperator(formData);
    setIsModalOpen(false);
  };

  const handleToggleStatus = (id: string) => {
    db.toggleOperatorStatus(id);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Operator Management
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1 font-medium">
            Manage authenticated desk officers, system administrators, and station permissions.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-colors self-start md:self-auto"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Provision New Desk Operator</span>
        </button>
      </div>

      {/* Role Privileges Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-2 mb-2 text-rose-400">
            <Shield className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Super Administrator</span>
          </div>
          <p className="text-xs text-slate-400">
            Unrestricted access to system configuration, personnel enrollments, centralized cloud database sync, and audit manifests.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-2 mb-2 text-blue-400">
            <Shield className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Duty Supervisor</span>
          </div>
          <p className="text-xs text-slate-400">
            Authorizes shift modifications, overrides tardiness justifications, generates badges, and signs daily duty manifests.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-2 mb-2 text-emerald-400">
            <Shield className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Verification Officer</span>
          </div>
          <p className="text-xs text-slate-400">
            Station checkpoint operator. Conducts live scans, verifies physical badge credentials, and logs time entries.
          </p>
        </div>
      </div>

      {/* Operators List Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-950/40">
                <th className="py-3 px-4">Operator Name</th>
                <th className="py-3 px-4">Official Email</th>
                <th className="py-3 px-4">Role Privileges</th>
                <th className="py-3 px-4">Station Assignment</th>
                <th className="py-3 px-4">Last Terminal Login</th>
                <th className="py-3 px-4">Access Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {operators.map(op => (
                <tr key={op.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-200">
                    {op.fullName}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400">
                    {op.email}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      op.role === 'SUPER_ADMIN'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : op.role === 'DUTY_SUPERVISOR'
                        ? 'bg-blue-950 text-blue-300 border border-blue-800'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}>
                      {op.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {op.station}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                    {new Date(op.lastLogin).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${
                      op.isActive ? 'text-emerald-400' : 'text-slate-500'
                    }`}>
                      {op.isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      {op.isActive ? 'Active' : 'Revoked'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleToggleStatus(op.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        op.isActive
                          ? 'bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-400 border border-slate-700'
                          : 'bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-800'
                      }`}
                    >
                      {op.isActive ? 'Deactivate' : 'Restore'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Operator Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                Enroll New Desk Operator
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Operator Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Captain Ronald Navarro"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Government Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="r.navarro@osc.gov.ph"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Assigned Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                >
                  <option value="DUTY_SUPERVISOR">DUTY SUPERVISOR</option>
                  <option value="VERIFICATION_OFFICER">VERIFICATION OFFICER</option>
                  <option value="SUPER_ADMIN">SUPER ADMIN</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Assigned Terminal Post
                </label>
                <input
                  type="text"
                  value={formData.station}
                  onChange={(e) => setFormData({ ...formData, station: e.target.value })}
                  placeholder="e.g. Main Gate Access Desk"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
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
                  Provision Operator
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
