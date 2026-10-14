import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  QrCode, 
  Scan, 
  CalendarClock, 
  ClipboardList, 
  BarChart3, 
  ShieldAlert, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { ActiveView } from '../../types';

interface SidebarProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  onLogout: () => void;
  collapsed?: boolean;
}

interface NavItem {
  id: ActiveView;
  number: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', number: '01', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'personnel', number: '02', label: 'Personnel Management', icon: Users },
  { id: 'credentials', number: '03', label: 'QR Credentials', icon: QrCode },
  { id: 'admin-scanner', number: '04', label: 'Duty Attendance Scanner', icon: Scan },
  { id: 'schedules', number: '05', label: 'Duty Schedules and Sessions', icon: CalendarClock },
  { id: 'attendance', number: '06', label: 'Attendance Records', icon: ClipboardList },
  { id: 'reports', number: '07', label: 'Reports and Analytics', icon: BarChart3 },
  { id: 'operators', number: '08', label: 'Operator Management', icon: ShieldAlert },
  { id: 'settings', number: '09', label: 'System Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onNavigate, onLogout }) => {
  return (
    <aside className="w-64 md:w-72 bg-slate-950 border-r border-slate-800 flex flex-col justify-between shrink-0 select-none">
      {/* Top Brand Header */}
      <div>
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <img
            src="/src/assets/images/osc_institutional_emblem_1791956358770.jpg"
            alt="OSC Seal"
            className="w-10 h-10 rounded-full border border-blue-500/30 object-cover shadow-sm shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-bold text-white tracking-tight leading-tight truncate">
              OSC Duty Attendance
            </h2>
            <p className="text-[11px] font-mono text-blue-400 font-medium">
              OSC-DAMTS · Portal
            </p>
          </div>
        </div>

        {/* 10 Navigation Items */}
        <div className="p-3 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
            Command Navigation
          </div>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                type="button"
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'}`} />
                <span className="flex-1 text-left truncate">{item.label}</span>
                <span className={`text-[10px] font-mono ${isActive ? 'text-blue-200' : 'text-slate-600'}`}>
                  {item.number}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Item 10: Logout */}
      <div className="p-3 border-t border-slate-800/80">
        <button
          onClick={onLogout}
          type="button"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 border border-transparent hover:border-rose-900/50 transition-all group"
        >
          <LogOut className="w-4 h-4 shrink-0 text-rose-400 group-hover:translate-x-0.5 transition-transform" />
          <span className="flex-1 text-left">Logout</span>
          <span className="text-[10px] font-mono text-rose-500/70">10</span>
        </button>
      </div>
    </aside>
  );
};
