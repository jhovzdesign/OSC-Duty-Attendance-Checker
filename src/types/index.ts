export type SystemRole = 'SUPER_ADMIN' | 'DUTY_SUPERVISOR' | 'VERIFICATION_OFFICER';

export type PersonnelStatus = 'ACTIVE' | 'ON_DUTY' | 'OFF_DUTY' | 'ON_LEAVE' | 'SUSPENDED';

export type AttendanceStatus = 'PRESENT' | 'LATE' | 'OVERTIME' | 'EARLY_DEPARTURE' | 'EXCUSED';

export type VerificationType = 'QR_SCAN' | 'MANUAL_VERIFY' | 'STATION_KIOSK';

export interface Personnel {
  id: string;
  dutyId: string; // e.g., "OSC-2026-084"
  fullName: string;
  rankDesignation: string; // e.g., "Senior Strategic Communications Officer"
  division: string; // e.g., "Media Relations & Press Liaison"
  email: string;
  phone: string;
  dutyStation: string;
  clearanceLevel: 'LEVEL_1_BASIC' | 'LEVEL_2_CONFIDENTIAL' | 'LEVEL_3_SECRET' | 'EXECUTIVE';
  status: PersonnelStatus;
  avatarUrl: string;
  emergencyContact: string;
  assignedShiftId: string;
  joinedDate: string;
}

export interface DutyShift {
  id: string;
  code: string;
  name: string; // e.g., "Morning Tactical Watch"
  startTime: string; // "07:00"
  endTime: string; // "15:00"
  gracePeriodMinutes: number; // e.g. 15
  description: string;
  color: string;
  activeDays: string[];
}

export interface AttendanceRecord {
  id: string;
  personnelId: string;
  dutyId: string;
  personnelName: string;
  division: string;
  shiftId: string;
  shiftName: string;
  timestampIn: string; // ISO string
  timestampOut: string | null; // ISO string or null if still clocked in
  status: AttendanceStatus;
  date: string; // "YYYY-MM-DD"
  verificationType: VerificationType;
  stationId: string; // e.g., "OSC-GATE-01"
  scannerNotes?: string;
  recordedBy?: string;
}

export interface Operator {
  id: string;
  fullName: string;
  email: string;
  role: SystemRole;
  station: string;
  isActive: boolean;
  lastLogin: string;
}

export interface SystemSettings {
  systemName: string;
  abbreviation: string;
  stationName: string;
  stationId: string;
  defaultGracePeriod: number;
  autoTimeoutHours: number;
  soundEnabled: boolean;
  supabaseUrl: string;
  supabaseAnonKey: string;
  syncConnected: boolean;
  lastSyncTimestamp: string | null;
}

export type ActiveView = 
  | 'public-scanner' 
  | 'login' 
  | 'dashboard' 
  | 'personnel' 
  | 'credentials' 
  | 'admin-scanner' 
  | 'schedules' 
  | 'attendance' 
  | 'reports' 
  | 'operators' 
  | 'settings';
