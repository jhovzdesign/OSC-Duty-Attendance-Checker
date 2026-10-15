import React from 'react';
import { ExternalLink, User } from 'lucide-react';
import { ActiveView } from '../../types';

interface HeaderProps {
  activeView: ActiveView;
  operatorEmail: string;
  onOpenPublicScanner: () => void;
}

const VIEW_TITLES: Record<ActiveView, string> = {
  'public-scanner': 'Public QR Scanner',
  'login': 'Operator Authentication',
  'dashboard': 'Executive Command Dashboard',
  'personnel': 'Personnel Registry & Roster',
  'credentials': 'QR Credentials & ID Badges',
  'admin-scanner': 'Duty Attendance Scanner Station',
  'schedules': 'Duty Schedules & Shift Sessions',
  'attendance': 'Attendance Records & Time Logs',
  'reports': 'Reports & Institutional Manifests',
  'operators': 'Operator & Access Control',
  'settings': 'System Settings & Cloud Database Hub',
};

export const Header: React.FC<HeaderProps> = ({ activeView, operatorEmail, onOpenPublicScanner }) => {
  return (
    <header className="h-16 px-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-8 shrink-0">
      {/* Zone 1: Brand / Institutional Marker */}
      <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
        <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-mono font-bold text-xs shadow-sm">
          OSC
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-white text-sm tracking-tight">
            OSC-DAMTS
          </span>
          <span className="text-slate-500 text-xs">/</span>
          <span className="text-xs font-medium text-slate-300">
            {VIEW_TITLES[activeView] || 'Control Console'}
          </span>
        </div>
      </div>

      {/* Zone 2: Breadcrumbs */}
      <div className="hidden lg:flex items-center gap-3 text-xs font-medium text-slate-400 whitespace-nowrap">
        <span>Office of Strategic Communications</span>
        <span className="text-slate-600">·</span>
        <span className="text-slate-400">Institutional Duty Roster</span>
      </div>

      {/* Zone 3: Primary Action (Top Bar Contract: 1 Primary CTA) */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenPublicScanner}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 hover:text-blue-200 border border-blue-500/30 transition-colors whitespace-nowrap shrink-0"
          title="Open Public Duty Attendance Scanner Terminal"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Launch Public Scanner</span>
        </button>

        <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-800">
          <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
            <User className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-mono text-slate-300 max-w-[140px] truncate">
            {operatorEmail}
          </span>
        </div>
      </div>
    </header>
  );
};
