import { AttendanceRecord, DutyShift, Operator, Personnel, SystemSettings } from '../types';
import { getSupabaseClient, syncRecordToSupabase } from './supabaseClient';

const STORAGE_KEYS = {
  PERSONNEL: 'osc_damts_personnel_v2',
  SHIFTS: 'osc_damts_shifts_v2',
  ATTENDANCE: 'osc_damts_attendance_v2',
  OPERATORS: 'osc_damts_operators_v2',
  SETTINGS: 'osc_damts_settings_v2',
};

// Initial Seed Data with generated professional avatars and institutional OSC structure
const DEFAULT_SHIFTS: DutyShift[] = [
  {
    id: 'shift-morning',
    code: 'MW-01',
    name: 'Morning Tactical Watch',
    startTime: '07:00',
    endTime: '15:00',
    gracePeriodMinutes: 15,
    description: 'Primary morning press briefing, media monitoring, and executive dispatch watch.',
    color: '#2563eb',
    activeDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  },
  {
    id: 'shift-afternoon',
    code: 'AT-02',
    name: 'Afternoon Communications Operations',
    startTime: '14:00',
    endTime: '22:00',
    gracePeriodMinutes: 15,
    description: 'Afternoon media relations, digital channels broadcast, and press conference desk.',
    color: '#0891b2',
    activeDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  },
  {
    id: 'shift-evening',
    code: 'EO-03',
    name: 'Evening & Rapid Response Watch',
    startTime: '21:00',
    endTime: '05:00',
    gracePeriodMinutes: 15,
    description: 'Crisis communications standby, nocturnal media intelligence, and emergency liaison.',
    color: '#4f46e5',
    activeDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  },
  {
    id: 'shift-special',
    code: 'SC-04',
    name: 'Special Ministerial Media Coverage',
    startTime: '08:30',
    endTime: '17:30',
    gracePeriodMinutes: 20,
    description: 'Assigned to high-level presidential briefings, bilateral summit coverage, and field broadcasts.',
    color: '#0d9488',
    activeDays: ['Mon', 'Wed', 'Fri'],
  },
];

const DEFAULT_PERSONNEL: Personnel[] = [
  {
    id: 'osc-p-001',
    dutyId: 'OSC-2026-001',
    fullName: 'Director Arthur Vance',
    rankDesignation: 'Executive Director of Strategic Communications',
    division: 'Office of the Executive Director',
    email: 'a.vance@osc.gov.ph',
    phone: '+63 (02) 8928-1101',
    dutyStation: 'OSC Executive Briefing Suite',
    clearanceLevel: 'EXECUTIVE',
    status: 'ON_DUTY',
    avatarUrl: '/src/assets/images/personnel_avatar_3_1791956360265.jpg',
    emergencyContact: 'Eleanor Vance (+63 917 555 0192)',
    assignedShiftId: 'shift-morning',
    joinedDate: '2021-03-15',
  },
  {
    id: 'osc-p-002',
    dutyId: 'OSC-2026-042',
    fullName: 'Captain Marcus Bennett',
    rankDesignation: 'Chief Press Liaison Officer',
    division: 'Media Relations & Press Liaison',
    email: 'm.bennett@osc.gov.ph',
    phone: '+63 (02) 8928-1142',
    dutyStation: 'Press Corps Briefing Room',
    clearanceLevel: 'LEVEL_3_SECRET',
    status: 'ON_DUTY',
    avatarUrl: '/src/assets/images/personnel_avatar_1_1791956361181.jpg',
    emergencyContact: 'Victoria Bennett (+63 918 555 0834)',
    assignedShiftId: 'shift-morning',
    joinedDate: '2022-06-01',
  },
  {
    id: 'osc-p-003',
    dutyId: 'OSC-2026-088',
    fullName: 'Dr. Elena Rostova',
    rankDesignation: 'Head of Strategic Intelligence & Research',
    division: 'Strategic Research & Analytics',
    email: 'e.rostova@osc.gov.ph',
    phone: '+63 (02) 8928-1188',
    dutyStation: 'OSC Analytics Command Room',
    clearanceLevel: 'LEVEL_3_SECRET',
    status: 'ON_DUTY',
    avatarUrl: '/src/assets/images/personnel_avatar_2_1791956359867.jpg',
    emergencyContact: 'Dmitri Rostov (+63 919 555 0411)',
    assignedShiftId: 'shift-afternoon',
    joinedDate: '2023-01-10',
  },
  {
    id: 'osc-p-004',
    dutyId: 'OSC-2026-115',
    fullName: 'Gabriel Santos',
    rankDesignation: 'Senior Digital Broadcast Specialist',
    division: 'Digital Media & Creative Production',
    email: 'g.santos@osc.gov.ph',
    phone: '+63 (02) 8928-1115',
    dutyStation: 'Broadcast Production Studio A',
    clearanceLevel: 'LEVEL_2_CONFIDENTIAL',
    status: 'ON_DUTY',
    avatarUrl: '/src/assets/images/personnel_avatar_1_1791956361181.jpg',
    emergencyContact: 'Rosa Santos (+63 917 555 9922)',
    assignedShiftId: 'shift-morning',
    joinedDate: '2023-08-20',
  },
  {
    id: 'osc-p-005',
    dutyId: 'OSC-2026-143',
    fullName: 'Clarissa Tan',
    rankDesignation: 'Rapid Response Communications Officer',
    division: 'Crisis Comms & Rapid Response',
    email: 'c.tan@osc.gov.ph',
    phone: '+63 (02) 8928-1143',
    dutyStation: 'Incident Media Operations Desk',
    clearanceLevel: 'LEVEL_3_SECRET',
    status: 'OFF_DUTY',
    avatarUrl: '/src/assets/images/personnel_avatar_2_1791956359867.jpg',
    emergencyContact: 'Raymond Tan (+63 920 555 1290)',
    assignedShiftId: 'shift-afternoon',
    joinedDate: '2024-02-14',
  },
  {
    id: 'osc-p-006',
    dutyId: 'OSC-2026-192',
    fullName: 'David Sterling',
    rankDesignation: 'Duty Desk Verification Marshal',
    division: 'Operations & Registry Administration',
    email: 'd.sterling@osc.gov.ph',
    phone: '+63 (02) 8928-1192',
    dutyStation: 'OSC Main Entrance Security Post',
    clearanceLevel: 'LEVEL_2_CONFIDENTIAL',
    status: 'ON_DUTY',
    avatarUrl: '/src/assets/images/personnel_avatar_3_1791956360265.jpg',
    emergencyContact: 'Sarah Sterling (+63 915 555 3341)',
    assignedShiftId: 'shift-morning',
    joinedDate: '2022-11-05',
  },
  {
    id: 'osc-p-007',
    dutyId: 'OSC-2026-210',
    fullName: 'Regina Morales',
    rankDesignation: 'Senior Editorial & Speechwriting Analyst',
    division: 'Editorial & Strategic Messaging',
    email: 'r.morales@osc.gov.ph',
    phone: '+63 (02) 8928-1210',
    dutyStation: 'Executive Speech Archive',
    clearanceLevel: 'LEVEL_2_CONFIDENTIAL',
    status: 'OFF_DUTY',
    avatarUrl: '/src/assets/images/personnel_avatar_2_1791956359867.jpg',
    emergencyContact: 'Miguel Morales (+63 928 555 8819)',
    assignedShiftId: 'shift-morning',
    joinedDate: '2023-04-12',
  },
  {
    id: 'osc-p-008',
    dutyId: 'OSC-2026-255',
    fullName: 'Lieutenant Samuel Ocampo',
    rankDesignation: 'Media Security & Field Liaison',
    division: 'Field Operations & Liaison',
    email: 's.ocampo@osc.gov.ph',
    phone: '+63 (02) 8928-1255',
    dutyStation: 'Mobile Media Command Unit',
    clearanceLevel: 'LEVEL_3_SECRET',
    status: 'ON_LEAVE',
    avatarUrl: '/src/assets/images/personnel_avatar_1_1791956361181.jpg',
    emergencyContact: 'Ana Ocampo (+63 917 555 7701)',
    assignedShiftId: 'shift-special',
    joinedDate: '2024-05-18',
  },
];

const DEFAULT_OPERATORS: Operator[] = [
  {
    id: 'op-01',
    fullName: 'Administrator J. Hovz',
    email: 'admin@osc.gov.ph',
    role: 'SUPER_ADMIN',
    station: 'OSC HQ Command Post',
    isActive: true,
    lastLogin: new Date().toISOString(),
  },
  {
    id: 'op-02',
    fullName: 'Duty Supervisor R. Chen',
    email: 'supervisor@osc.gov.ph',
    role: 'DUTY_SUPERVISOR',
    station: 'Main Gate Access Desk',
    isActive: true,
    lastLogin: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'op-03',
    fullName: 'Officer M. Reyes',
    email: 'officer@osc.gov.ph',
    role: 'VERIFICATION_OFFICER',
    station: 'Briefing Hall Checkpoint',
    isActive: true,
    lastLogin: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
];

const DEFAULT_SETTINGS: SystemSettings = {
  systemName: 'OSC Duty Attendance Management Tracking System',
  abbreviation: 'OSC-DAMTS',
  stationName: 'OSC HQ Main Security Checkpoint',
  stationId: 'OSC-GATE-01',
  defaultGracePeriod: 15,
  autoTimeoutHours: 9,
  soundEnabled: true,
  supabaseUrl: '',
  supabaseAnonKey: '',
  syncConnected: false,
  lastSyncTimestamp: null,
};

// Generate realistic today's attendance logs
function getInitialAttendanceRecords(): AttendanceRecord[] {
  const today = new Date().toISOString().split('T')[0];
  const dateBase = new Date();
  
  return [
    {
      id: 'att-rec-001',
      personnelId: 'osc-p-001',
      dutyId: 'OSC-2026-001',
      personnelName: 'Director Arthur Vance',
      division: 'Office of the Executive Director',
      shiftId: 'shift-morning',
      shiftName: 'Morning Tactical Watch',
      timestampIn: new Date(dateBase.getFullYear(), dateBase.getMonth(), dateBase.getDate(), 6, 52, 14).toISOString(),
      timestampOut: null,
      status: 'PRESENT',
      date: today,
      verificationType: 'QR_SCAN',
      stationId: 'OSC-GATE-01',
      scannerNotes: 'Verified badge QR credentials. Early duty arrival.',
      recordedBy: 'OSC Duty Scanner Kiosk',
    },
    {
      id: 'att-rec-002',
      personnelId: 'osc-p-002',
      dutyId: 'OSC-2026-042',
      personnelName: 'Captain Marcus Bennett',
      division: 'Media Relations & Press Liaison',
      shiftId: 'shift-morning',
      shiftName: 'Morning Tactical Watch',
      timestampIn: new Date(dateBase.getFullYear(), dateBase.getMonth(), dateBase.getDate(), 7, 8, 30).toISOString(),
      timestampOut: null,
      status: 'PRESENT',
      date: today,
      verificationType: 'QR_SCAN',
      stationId: 'OSC-GATE-01',
      scannerNotes: 'Standard morning duty check-in.',
      recordedBy: 'OSC Duty Scanner Kiosk',
    },
    {
      id: 'att-rec-003',
      personnelId: 'osc-p-004',
      dutyId: 'OSC-2026-115',
      personnelName: 'Gabriel Santos',
      division: 'Digital Media & Creative Production',
      shiftId: 'shift-morning',
      shiftName: 'Morning Tactical Watch',
      timestampIn: new Date(dateBase.getFullYear(), dateBase.getMonth(), dateBase.getDate(), 7, 28, 45).toISOString(),
      timestampOut: null,
      status: 'LATE',
      date: today,
      verificationType: 'QR_SCAN',
      stationId: 'OSC-GATE-01',
      scannerNotes: 'Arrived after 15m grace window (07:15). Marked late as per duty protocol.',
      recordedBy: 'OSC Duty Scanner Kiosk',
    },
    {
      id: 'att-rec-004',
      personnelId: 'osc-p-006',
      dutyId: 'OSC-2026-192',
      personnelName: 'David Sterling',
      division: 'Operations & Registry Administration',
      shiftId: 'shift-morning',
      shiftName: 'Morning Tactical Watch',
      timestampIn: new Date(dateBase.getFullYear(), dateBase.getMonth(), dateBase.getDate(), 6, 45, 0).toISOString(),
      timestampOut: null,
      status: 'PRESENT',
      date: today,
      verificationType: 'QR_SCAN',
      stationId: 'OSC-GATE-01',
      scannerNotes: 'Security registry check-in verified.',
      recordedBy: 'OSC Duty Scanner Kiosk',
    },
  ];
}

// Global broadcast channel for instant multi-tab sync between Public Scanner & Admin Portal
let channel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    channel = new BroadcastChannel('osc-damts-broadcast');
  }
} catch {
  // Graceful fallback
}

class CentralDatabase {
  private personnel: Personnel[] = [];
  private shifts: DutyShift[] = [];
  private attendance: AttendanceRecord[] = [];
  private operators: Operator[] = [];
  private settings: SystemSettings = DEFAULT_SETTINGS;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.init();
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key && e.key.startsWith('osc_damts_')) {
          this.loadFromStorage();
          this.notify();
        }
      });
      if (channel) {
        channel.onmessage = (event) => {
          if (event.data?.type === 'DATABASE_UPDATED') {
            this.loadFromStorage();
            this.notify();
          }
        };
      }
    }
  }

  private init() {
    if (typeof window === 'undefined') return;
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const p = localStorage.getItem(STORAGE_KEYS.PERSONNEL);
      this.personnel = p ? JSON.parse(p) : DEFAULT_PERSONNEL;

      const s = localStorage.getItem(STORAGE_KEYS.SHIFTS);
      this.shifts = s ? JSON.parse(s) : DEFAULT_SHIFTS;

      const a = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
      this.attendance = a ? JSON.parse(a) : getInitialAttendanceRecords();

      const o = localStorage.getItem(STORAGE_KEYS.OPERATORS);
      this.operators = o ? JSON.parse(o) : DEFAULT_OPERATORS;

      const set = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      this.settings = set ? { ...DEFAULT_SETTINGS, ...JSON.parse(set) } : DEFAULT_SETTINGS;

      // Ensure initial save if freshly loaded
      if (!p) localStorage.setItem(STORAGE_KEYS.PERSONNEL, JSON.stringify(DEFAULT_PERSONNEL));
      if (!s) localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(DEFAULT_SHIFTS));
      if (!a) localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(this.attendance));
      if (!o) localStorage.setItem(STORAGE_KEYS.OPERATORS, JSON.stringify(DEFAULT_OPERATORS));
      if (!set) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    } catch (err) {
      console.error('Failed to load OSC database from storage:', err);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.PERSONNEL, JSON.stringify(this.personnel));
      localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(this.shifts));
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(this.attendance));
      localStorage.setItem(STORAGE_KEYS.OPERATORS, JSON.stringify(this.operators));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
      
      if (channel) {
        channel.postMessage({ type: 'DATABASE_UPDATED', timestamp: Date.now() });
      }
    } catch (err) {
      console.error('Failed to save to localStorage:', err);
    }
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach(cb => cb());
  }

  // Getters
  public getPersonnel(): Personnel[] {
    return [...this.personnel];
  }

  public getShifts(): DutyShift[] {
    return [...this.shifts];
  }

  public getAttendanceRecords(): AttendanceRecord[] {
    return [...this.attendance];
  }

  public getOperators(): Operator[] {
    return [...this.operators];
  }

  public getSettings(): SystemSettings {
    return { ...this.settings };
  }

  public findPersonnelByDutyId(dutyId: string): Personnel | undefined {
    const cleanId = dutyId.trim().toUpperCase();
    return this.personnel.find(
      p => p.dutyId.toUpperCase() === cleanId || p.id.toUpperCase() === cleanId
    );
  }

  public getActiveClockIn(personnelId: string): AttendanceRecord | undefined {
    const today = new Date().toISOString().split('T')[0];
    return this.attendance.find(
      r => r.personnelId === personnelId && r.date === today && r.timestampOut === null
    );
  }

  // Attendance Scanning Core Logic
  public recordAttendance(
    dutyIdOrCode: string,
    mode: 'AUTO' | 'TIME_IN' | 'TIME_OUT' = 'AUTO',
    scannerStation = this.settings.stationId
  ): {
    success: boolean;
    record?: AttendanceRecord;
    personnel?: Personnel;
    action: 'CLOCKED_IN' | 'CLOCKED_OUT' | 'ALREADY_RECORDED' | 'NOT_FOUND';
    message: string;
  } {
    // Decode duty ID if passed as JSON QR payload or raw ID
    let lookupId = dutyIdOrCode.trim();
    try {
      if (lookupId.startsWith('{')) {
        const parsed = JSON.parse(lookupId);
        if (parsed.dutyId) lookupId = parsed.dutyId;
        else if (parsed.id) lookupId = parsed.id;
      }
    } catch {
      // not JSON, keep as is
    }

    const person = this.findPersonnelByDutyId(lookupId);
    if (!person) {
      return {
        success: false,
        action: 'NOT_FOUND',
        message: `Personnel with Duty ID "${lookupId}" not found in institutional roster.`,
      };
    }

    const today = new Date().toISOString().split('T')[0];
    const nowIso = new Date().toISOString();
    const existingActive = this.getActiveClockIn(person.id);
    const assignedShift = this.shifts.find(s => s.id === person.assignedShiftId) || this.shifts[0];

    // Determine Action
    let finalAction: 'CLOCKED_IN' | 'CLOCKED_OUT' = 'CLOCKED_IN';

    if (mode === 'TIME_OUT') {
      finalAction = 'CLOCKED_OUT';
    } else if (mode === 'TIME_IN') {
      finalAction = 'CLOCKED_IN';
    } else {
      // AUTO mode: If currently clocked in, toggle to clock out. Otherwise clock in.
      finalAction = existingActive ? 'CLOCKED_OUT' : 'CLOCKED_IN';
    }

    if (finalAction === 'CLOCKED_OUT') {
      if (!existingActive) {
        return {
          success: false,
          personnel: person,
          action: 'ALREADY_RECORDED',
          message: `${person.fullName} has no active Time-In record for today to clock out from.`,
        };
      }

      // Update existing record with timestampOut
      existingActive.timestampOut = nowIso;
      existingActive.scannerNotes = (existingActive.scannerNotes || '') + ' | Duty Tour Completed via Scanner.';
      
      // Update personnel status
      person.status = 'OFF_DUTY';

      this.saveToStorage();
      this.notify();

      // Background Supabase Sync if active
      const sb = getSupabaseClient(this.settings.supabaseUrl, this.settings.supabaseAnonKey);
      if (sb) syncRecordToSupabase(sb, existingActive);

      return {
        success: true,
        record: existingActive,
        personnel: person,
        action: 'CLOCKED_OUT',
        message: `Duty Tour Concluded. Clock-Out recorded for ${person.fullName}.`,
      };
    } else {
      // CLOCKED_IN
      if (existingActive) {
        return {
          success: true,
          record: existingActive,
          personnel: person,
          action: 'ALREADY_RECORDED',
          message: `${person.fullName} is already clocked in for duty today at ${new Date(existingActive.timestampIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
        };
      }

      // Determine Status: Present vs Late
      const now = new Date();
      const [shiftH, shiftM] = (assignedShift.startTime || '08:00').split(':').map(Number);
      const shiftStartMinutes = shiftH * 60 + shiftM;
      const arrivalMinutes = now.getHours() * 60 + now.getMinutes();
      const gracePeriod = assignedShift.gracePeriodMinutes ?? this.settings.defaultGracePeriod;

      let status: 'PRESENT' | 'LATE' = 'PRESENT';
      if (arrivalMinutes > shiftStartMinutes + gracePeriod) {
        status = 'LATE';
      }

      const newRecord: AttendanceRecord = {
        id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        personnelId: person.id,
        dutyId: person.dutyId,
        personnelName: person.fullName,
        division: person.division,
        shiftId: assignedShift.id,
        shiftName: assignedShift.name,
        timestampIn: nowIso,
        timestampOut: null,
        status,
        date: today,
        verificationType: 'QR_SCAN',
        stationId: scannerStation,
        scannerNotes: status === 'LATE' 
          ? `Arrived past grace period (${gracePeriod} min window).` 
          : 'Punctual arrival confirmed via secure duty credentials.',
        recordedBy: 'OSC Duty Attendance Scanner',
      };

      this.attendance.unshift(newRecord);
      person.status = 'ON_DUTY';

      this.saveToStorage();
      this.notify();

      // Background Supabase Sync if active
      const sb = getSupabaseClient(this.settings.supabaseUrl, this.settings.supabaseAnonKey);
      if (sb) syncRecordToSupabase(sb, newRecord);

      return {
        success: true,
        record: newRecord,
        personnel: person,
        action: 'CLOCKED_IN',
        message: 'Duty Attendance Successfully Recorded',
      };
    }
  }

  // Personnel Mutations
  public addPersonnel(data: Omit<Personnel, 'id'>): Personnel {
    const newPerson: Personnel = {
      ...data,
      id: `osc-p-${Date.now().toString().slice(-4)}`,
    };
    this.personnel.unshift(newPerson);
    this.saveToStorage();
    this.notify();
    return newPerson;
  }

  public updatePersonnel(id: string, updates: Partial<Personnel>): boolean {
    const idx = this.personnel.findIndex(p => p.id === id);
    if (idx === -1) return false;
    this.personnel[idx] = { ...this.personnel[idx], ...updates };
    this.saveToStorage();
    this.notify();
    return true;
  }

  public deletePersonnel(id: string): boolean {
    this.personnel = this.personnel.filter(p => p.id !== id);
    this.saveToStorage();
    this.notify();
    return true;
  }

  // Shift Mutations
  public addShift(shift: Omit<DutyShift, 'id'>): DutyShift {
    const newShift: DutyShift = {
      ...shift,
      id: `shift-${Date.now().toString().slice(-4)}`,
    };
    this.shifts.push(newShift);
    this.saveToStorage();
    this.notify();
    return newShift;
  }

  public updateShift(id: string, updates: Partial<DutyShift>): boolean {
    const idx = this.shifts.findIndex(s => s.id === id);
    if (idx === -1) return false;
    this.shifts[idx] = { ...this.shifts[idx], ...updates };
    this.saveToStorage();
    this.notify();
    return true;
  }

  public deleteShift(id: string): boolean {
    this.shifts = this.shifts.filter(s => s.id !== id);
    this.saveToStorage();
    this.notify();
    return true;
  }

  // Operator Mutations
  public addOperator(data: Omit<Operator, 'id' | 'lastLogin'>): Operator {
    const newOp: Operator = {
      ...data,
      id: `op-${Date.now().toString().slice(-4)}`,
      lastLogin: new Date().toISOString(),
    };
    this.operators.push(newOp);
    this.saveToStorage();
    this.notify();
    return newOp;
  }

  public toggleOperatorStatus(id: string): boolean {
    const op = this.operators.find(o => o.id === id);
    if (!op) return false;
    op.isActive = !op.isActive;
    this.saveToStorage();
    this.notify();
    return true;
  }

  // Attendance Mutations (Manual Edits)
  public updateAttendanceRecord(id: string, updates: Partial<AttendanceRecord>): boolean {
    const idx = this.attendance.findIndex(a => a.id === id);
    if (idx === -1) return false;
    this.attendance[idx] = { ...this.attendance[idx], ...updates };
    this.saveToStorage();
    this.notify();
    return true;
  }

  public deleteAttendanceRecord(id: string): boolean {
    this.attendance = this.attendance.filter(a => a.id !== id);
    this.saveToStorage();
    this.notify();
    return true;
  }

  // Settings
  public updateSettings(updates: Partial<SystemSettings>): SystemSettings {
    this.settings = { ...this.settings, ...updates };
    this.saveToStorage();
    this.notify();
    return this.settings;
  }

  public resetToDefaultSeed(): void {
    this.personnel = DEFAULT_PERSONNEL;
    this.shifts = DEFAULT_SHIFTS;
    this.attendance = getInitialAttendanceRecords();
    this.operators = DEFAULT_OPERATORS;
    this.settings = DEFAULT_SETTINGS;
    this.saveToStorage();
    this.notify();
  }
}

export const db = new CentralDatabase();
