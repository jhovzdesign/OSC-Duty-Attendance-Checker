/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { db } from './services/database';
import { ActiveView, AttendanceRecord, DutyShift, Operator, Personnel, SystemSettings } from './types';
import { PublicScanner } from './components/scanner/PublicScanner';
import { LoginView } from './components/auth/LoginView';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { DashboardView } from './components/admin/DashboardView';
import { PersonnelManagementView } from './components/admin/PersonnelManagementView';
import { QrCredentialsView } from './components/admin/QrCredentialsView';
import { DutyScannerView } from './components/admin/DutyScannerView';
import { DutySchedulesView } from './components/admin/DutySchedulesView';
import { AttendanceRecordsView } from './components/admin/AttendanceRecordsView';
import { ReportsAnalyticsView } from './components/admin/ReportsAnalyticsView';
import { OperatorManagementView } from './components/admin/OperatorManagementView';
import { SystemSettingsView } from './components/admin/SystemSettingsView';
import { LogOut, Menu, X } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<ActiveView>('public-scanner');
  const [authenticatedOperator, setAuthenticatedOperator] = useState<string | null>(null);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [shifts, setShifts] = useState<DutyShift[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(db.getSettings());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);

  // Sync state with centralized store
  useEffect(() => {
    const syncState = () => {
      setPersonnel(db.getPersonnel());
      setShifts(db.getShifts());
      setAttendance(db.getAttendanceRecords());
      setOperators(db.getOperators());
      setSettings(db.getSettings());
    };

    syncState();
    return db.subscribe(syncState);
  }, []);

  const handleLoginSuccess = (email: string) => {
    setAuthenticatedOperator(email);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setAuthenticatedOperator(null);
    setShowLogoutModal(false);
    setCurrentView('public-scanner');
  };

  // If in Public Scanner mode
  if (currentView === 'public-scanner') {
    return (
      <PublicScanner
        onNavigateLogin={() => {
          if (authenticatedOperator) {
            setCurrentView('dashboard');
          } else {
            setCurrentView('login');
          }
        }}
      />
    );
  }

  // If in Login view
  if (currentView === 'login') {
    return (
      <LoginView
        onLoginSuccess={handleLoginSuccess}
        onBackToScanner={() => setCurrentView('public-scanner')}
      />
    );
  }

  // Protected Admin Portal Views
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      {/* Institutional Top Bar (Adheres to Top Bar Contract) */}
      <Header
        activeView={currentView}
        operatorEmail={authenticatedOperator || 'admin@osc.gov.ph'}
        onOpenPublicScanner={() => setCurrentView('public-scanner')}
      />

      {/* Mobile Menu Bar for small screens */}
      <div className="md:hidden flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800">
        <span className="text-xs font-semibold text-slate-300">
          Navigation Menu
        </span>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
        >
          {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar (10 Menu Items) */}
        <div className="hidden md:flex">
          <Sidebar
            activeView={currentView}
            onNavigate={(view) => setCurrentView(view)}
            onLogout={handleLogout}
          />
        </div>

        {/* Mobile Slide-Over Sidebar */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="relative w-72 max-w-[85vw] bg-slate-950 flex flex-col z-10 shadow-2xl">
              <Sidebar
                activeView={currentView}
                onNavigate={(view) => {
                  setCurrentView(view);
                  setIsMobileMenuOpen(false);
                }}
                onLogout={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
              />
            </div>
          </div>
        )}

        {/* Main Content Workspace Viewport */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-950">
          <div className="max-w-7xl mx-auto">
            {currentView === 'dashboard' && (
              <DashboardView
                personnel={personnel}
                attendance={attendance}
                shifts={shifts}
                onNavigate={(view) => setCurrentView(view)}
              />
            )}

            {currentView === 'personnel' && (
              <PersonnelManagementView
                personnel={personnel}
                shifts={shifts}
              />
            )}

            {currentView === 'credentials' && (
              <QrCredentialsView
                personnel={personnel}
              />
            )}

            {currentView === 'admin-scanner' && (
              <DutyScannerView
                personnel={personnel}
                attendance={attendance}
              />
            )}

            {currentView === 'schedules' && (
              <DutySchedulesView
                shifts={shifts}
                personnel={personnel}
              />
            )}

            {currentView === 'attendance' && (
              <AttendanceRecordsView
                attendance={attendance}
                personnel={personnel}
              />
            )}

            {currentView === 'reports' && (
              <ReportsAnalyticsView
                personnel={personnel}
                attendance={attendance}
                shifts={shifts}
              />
            )}

            {currentView === 'operators' && (
              <OperatorManagementView
                operators={operators}
              />
            )}

            {currentView === 'settings' && (
              <SystemSettingsView
                settings={settings}
              />
            )}
          </div>
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-950/60 border border-rose-800/80 text-rose-400 flex items-center justify-center mx-auto mb-3">
              <LogOut className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-white">
              End Operator Session?
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              You will be signed out of the OSC Duty Attendance Management Tracking System administration portal.
            </p>

            <div className="mt-5 flex items-center gap-2">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Stay Logged In
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-600/20 transition-colors"
              >
                Confirm Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
