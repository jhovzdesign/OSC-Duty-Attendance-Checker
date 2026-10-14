import React, { useState } from 'react';
import { Shield, Lock, Mail, ArrowLeft, CheckCircle, AlertCircle, KeyRound } from 'lucide-react';
import { db } from '../../services/database';

interface LoginViewProps {
  onLoginSuccess: (operatorEmail: string) => void;
  onBackToScanner: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, onBackToScanner }) => {
  const [email, setEmail] = useState<string>('admin@osc.gov.ph');
  const [password, setPassword] = useState<string>('Admin@2026!');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const operators = db.getOperators();
      const op = operators.find(o => o.email.toLowerCase() === email.toLowerCase());

      if (!op) {
        setError('Invalid operator credentials or unauthorized desk account.');
        return;
      }

      if (!op.isActive) {
        setError('This operator account is currently deactivated. Contact Systems Administrator.');
        return;
      }

      onLoginSuccess(op.email);
    }, 450);
  };

  const setDemoCredentials = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('Admin@2026!');
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Top Bar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-800">
        <button
          onClick={onBackToScanner}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Duty Attendance Scanner</span>
        </button>

        <span className="text-xs font-mono text-slate-500">
          OSC-DAMTS · SECURE CONSOLE
        </span>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-3xl p-8 shadow-2xl">
          {/* Institutional Branding Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 mx-auto mb-3 shadow-md">
              <Shield className="w-7 h-7" />
            </div>
            {/* Requested Exact Login Page Title */}
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              OSC Duty Attendance Management Tracking System
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Administrator & Desk Officer Portal
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Official Government Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@osc.gov.ph"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder:text-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Access Password
                </label>
                <span className="text-[11px] text-slate-500 font-mono">Duty Pin Enabled</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder:text-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-colors font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Shield className="w-4 h-4" />
              <span>{isLoading ? 'Verifying Credentials...' : 'Authenticate & Enter Dashboard'}</span>
            </button>
          </form>

          {/* Quick Demo Credentials Strip */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <span className="text-[11px] font-semibold text-slate-400 block mb-2 uppercase tracking-wider text-center">
              Quick Operator Sign-In Presets
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDemoCredentials('admin@osc.gov.ph')}
                className="py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 hover:text-white transition-colors text-center truncate"
              >
                Super Admin
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('supervisor@osc.gov.ph')}
                className="py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 hover:text-white transition-colors text-center truncate"
              >
                Duty Supervisor
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('officer@osc.gov.ph')}
                className="py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 hover:text-white transition-colors text-center truncate"
              >
                Desk Officer
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-600 border-t border-slate-800/60">
        OSC Duty Attendance Management Tracking System · All access monitored and logged
      </footer>
    </div>
  );
};
