import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'central_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Institutional Seed Data
const DEFAULT_SHIFTS = [
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

const DEFAULT_PERSONNEL = [
  {
    id: 'osc-p-001',
    dutyId: 'OSC-2026-001',
    fullName: 'Director Arthur Vance',
    course: 'BA Strategic Communications',
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
    course: 'BA Journalism',
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
    course: 'BS Development Communication',
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
    course: 'BS Information Technology',
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
    course: 'BA Communication',
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
    course: 'BS Public Administration',
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
    course: 'BA English & Strategic Messaging',
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
    course: 'BS Criminology & Field Security',
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

const DEFAULT_OPERATORS = [
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

const DEFAULT_SETTINGS = {
  systemName: 'OSC Duty Attendance Management Tracking System',
  abbreviation: 'OSC-DAMTS',
  stationName: 'OSC HQ Main Security Checkpoint',
  stationId: 'OSC-GATE-01',
  defaultGracePeriod: 15,
  autoTimeoutHours: 9,
  soundEnabled: true,
  syncConnected: true,
  lastSyncTimestamp: new Date().toISOString(),
};

function getInitialAttendanceRecords() {
  const today = new Date().toISOString().split('T')[0];
  const dateBase = new Date();
  
  return [
    {
      id: 'att-rec-001',
      personnelId: 'osc-p-001',
      dutyId: 'OSC-2026-001',
      personnelName: 'Director Arthur Vance',
      division: 'BA Strategic Communications',
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
      division: 'BA Journalism',
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
      division: 'BS Information Technology',
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
      division: 'BS Public Administration',
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

// Database Schema in JSON
interface CentralDatabaseState {
  version: number;
  lastUpdated: string;
  personnel: any[];
  shifts: any[];
  attendance: any[];
  operators: any[];
  settings: any;
}

let dbState: CentralDatabaseState;

function loadDatabase(): CentralDatabaseState {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      // Ensure course exists on all personnel
      if (parsed.personnel && Array.isArray(parsed.personnel)) {
        parsed.personnel = parsed.personnel.map((p: any) => ({
          ...p,
          course: p.course || p.division || 'BA Communication',
        }));
      }
      return parsed;
    }
  } catch (err) {
    console.error('Error reading central database file:', err);
  }

  // Fallback to fresh seed
  const initial: CentralDatabaseState = {
    version: 1,
    lastUpdated: new Date().toISOString(),
    personnel: DEFAULT_PERSONNEL,
    shifts: DEFAULT_SHIFTS,
    attendance: getInitialAttendanceRecords(),
    operators: DEFAULT_OPERATORS,
    settings: DEFAULT_SETTINGS,
  };
  saveDatabase(initial);
  return initial;
}

function saveDatabase(state: CentralDatabaseState) {
  try {
    state.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing central database file:', err);
  }
}

dbState = loadDatabase();

// Connected Server-Sent Events (SSE) clients across all devices & browsers
const sseClients: Response[] = [];

function broadcastUpdate(action: string, payload?: any) {
  dbState.version += 1;
  saveDatabase(dbState);

  const message = JSON.stringify({
    type: 'DATA_UPDATED',
    action,
    payload,
    version: dbState.version,
    lastUpdated: dbState.lastUpdated,
    data: dbState,
  });

  for (let i = sseClients.length - 1; i >= 0; i--) {
    const res = sseClients[i];
    try {
      res.write(`data: ${message}\n\n`);
    } catch {
      sseClients.splice(i, 1);
    }
  }
}

// Setup Express App
const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    system: 'OSC Duty Attendance Management Tracking System',
    connectedDevices: sseClients.length,
    serverTime: new Date().toISOString(),
    recordsCount: dbState.attendance.length,
    personnelCount: dbState.personnel.length,
    version: dbState.version,
  });
});

// Real-Time Server-Sent Events Endpoint for instantaneous multi-device synchronization
app.get('/api/events', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  sseClients.push(res);

  // Send initial data snapshot
  res.write(`data: ${JSON.stringify({
    type: 'INITIAL_STATE',
    version: dbState.version,
    lastUpdated: dbState.lastUpdated,
    data: dbState,
    connectedDevices: sseClients.length,
  })}\n\n`);

  req.on('close', () => {
    const idx = sseClients.indexOf(res);
    if (idx !== -1) sseClients.splice(idx, 1);
  });
});

// Periodic heartbeat to keep connections open through load balancers
setInterval(() => {
  for (let i = sseClients.length - 1; i >= 0; i--) {
    try {
      sseClients[i].write(': ping\n\n');
    } catch {
      sseClients.splice(i, 1);
    }
  }
}, 20000);

// Get All Centralized Data
app.get('/api/data', (_req: Request, res: Response) => {
  res.json({
    ...dbState,
    connectedDevices: sseClients.length,
  });
});

// ---------------- Personnel REST API ----------------
app.get('/api/personnel', (_req: Request, res: Response) => {
  res.json(dbState.personnel);
});

app.post('/api/personnel', (req: Request, res: Response) => {
  const newPerson = {
    ...req.body,
    id: `osc-p-${Date.now().toString().slice(-4)}`,
  };
  dbState.personnel.unshift(newPerson);
  broadcastUpdate('PERSONNEL_ADDED', newPerson);
  res.status(201).json(newPerson);
});

app.put('/api/personnel/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = dbState.personnel.findIndex(p => p.id === id);
  if (idx === -1) {
    res.status(404).json({ error: 'Personnel not found' });
    return;
  }
  dbState.personnel[idx] = { ...dbState.personnel[idx], ...req.body };
  broadcastUpdate('PERSONNEL_UPDATED', dbState.personnel[idx]);
  res.json(dbState.personnel[idx]);
});

app.delete('/api/personnel/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const initialLength = dbState.personnel.length;
  dbState.personnel = dbState.personnel.filter(p => p.id !== id);
  if (dbState.personnel.length === initialLength) {
    res.status(404).json({ error: 'Personnel not found' });
    return;
  }
  broadcastUpdate('PERSONNEL_DELETED', { id });
  res.json({ success: true, id });
});

// ---------------- QR Attendance Scanning Engine ----------------
app.post('/api/attendance/scan', (req: Request, res: Response) => {
  const { dutyId, mode = 'AUTO', stationId = dbState.settings.stationId } = req.body;
  if (!dutyId) {
    res.status(400).json({ error: 'Duty ID is required' });
    return;
  }

  let cleanId = String(dutyId).trim();
  try {
    if (cleanId.startsWith('{')) {
      const parsed = JSON.parse(cleanId);
      if (parsed.dutyId) cleanId = parsed.dutyId;
      else if (parsed.id) cleanId = parsed.id;
    }
  } catch {
    // raw string
  }

  const cleanUpper = cleanId.toUpperCase();
  const person = dbState.personnel.find(
    p => p.dutyId.toUpperCase() === cleanUpper || p.id.toUpperCase() === cleanUpper
  );

  if (!person) {
    res.status(404).json({
      success: false,
      action: 'NOT_FOUND',
      message: `Personnel with Duty ID "${cleanId}" not found in institutional roster.`,
    });
    return;
  }

  const today = new Date().toISOString().split('T')[0];
  const nowIso = new Date().toISOString();
  const existingActive = dbState.attendance.find(
    r => r.personnelId === person.id && r.date === today && r.timestampOut === null
  );
  const assignedShift = dbState.shifts.find(s => s.id === person.assignedShiftId) || dbState.shifts[0];

  let finalAction: 'CLOCKED_IN' | 'CLOCKED_OUT' = 'CLOCKED_IN';
  if (mode === 'TIME_OUT') finalAction = 'CLOCKED_OUT';
  else if (mode === 'TIME_IN') finalAction = 'CLOCKED_IN';
  else finalAction = existingActive ? 'CLOCKED_OUT' : 'CLOCKED_IN';

  if (finalAction === 'CLOCKED_OUT') {
    if (!existingActive) {
      res.json({
        success: false,
        personnel: person,
        action: 'ALREADY_RECORDED',
        message: `${person.fullName} has no active Time-In record for today to clock out from.`,
      });
      return;
    }

    existingActive.timestampOut = nowIso;
    existingActive.scannerNotes = (existingActive.scannerNotes || '') + ' | Duty Tour Completed via Centralized Scanner.';
    person.status = 'OFF_DUTY';

    broadcastUpdate('ATTENDANCE_RECORDED', { record: existingActive, personnel: person, action: 'CLOCKED_OUT' });

    res.json({
      success: true,
      record: existingActive,
      personnel: person,
      action: 'CLOCKED_OUT',
      message: `Duty Tour Concluded. Clock-Out recorded for ${person.fullName}.`,
    });
    return;
  }

  // CLOCKED_IN
  if (existingActive) {
    res.json({
      success: true,
      record: existingActive,
      personnel: person,
      action: 'ALREADY_RECORDED',
      message: `${person.fullName} is already clocked in for duty today at ${new Date(existingActive.timestampIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
    });
    return;
  }

  const now = new Date();
  const [shiftH, shiftM] = (assignedShift.startTime || '08:00').split(':').map(Number);
  const shiftStartMinutes = shiftH * 60 + shiftM;
  const arrivalMinutes = now.getHours() * 60 + now.getMinutes();
  const gracePeriod = assignedShift.gracePeriodMinutes ?? dbState.settings.defaultGracePeriod;

  let status: 'PRESENT' | 'LATE' = 'PRESENT';
  if (arrivalMinutes > shiftStartMinutes + gracePeriod) {
    status = 'LATE';
  }

  const newRecord = {
    id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    personnelId: person.id,
    dutyId: person.dutyId,
    personnelName: person.fullName,
    division: person.course || person.division || 'Strategic Communications',
    shiftId: assignedShift.id,
    shiftName: assignedShift.name,
    timestampIn: nowIso,
    timestampOut: null,
    status,
    date: today,
    verificationType: 'QR_SCAN',
    stationId,
    scannerNotes: status === 'LATE'
      ? `Arrived past grace period (${gracePeriod} min window).`
      : 'Punctual arrival confirmed via secure duty credentials.',
    recordedBy: 'OSC Duty Attendance Scanner',
  };

  dbState.attendance.unshift(newRecord);
  person.status = 'ON_DUTY';

  broadcastUpdate('ATTENDANCE_RECORDED', { record: newRecord, personnel: person, action: 'CLOCKED_IN' });

  res.json({
    success: true,
    record: newRecord,
    personnel: person,
    action: 'CLOCKED_IN',
    message: 'Duty Attendance Successfully Recorded',
  });
});

// ---------------- Attendance Records REST API ----------------
app.get('/api/attendance', (_req: Request, res: Response) => {
  res.json(dbState.attendance);
});

app.put('/api/attendance/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = dbState.attendance.findIndex(a => a.id === id);
  if (idx === -1) {
    res.status(404).json({ error: 'Attendance record not found' });
    return;
  }
  dbState.attendance[idx] = { ...dbState.attendance[idx], ...req.body };
  broadcastUpdate('ATTENDANCE_UPDATED', dbState.attendance[idx]);
  res.json(dbState.attendance[idx]);
});

app.delete('/api/attendance/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  dbState.attendance = dbState.attendance.filter(a => a.id !== id);
  broadcastUpdate('ATTENDANCE_DELETED', { id });
  res.json({ success: true, id });
});

// ---------------- Shifts REST API ----------------
app.get('/api/shifts', (_req: Request, res: Response) => {
  res.json(dbState.shifts);
});

app.post('/api/shifts', (req: Request, res: Response) => {
  const newShift = {
    ...req.body,
    id: `shift-${Date.now().toString().slice(-4)}`,
  };
  dbState.shifts.push(newShift);
  broadcastUpdate('SHIFT_ADDED', newShift);
  res.status(201).json(newShift);
});

app.put('/api/shifts/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = dbState.shifts.findIndex(s => s.id === id);
  if (idx === -1) {
    res.status(404).json({ error: 'Shift not found' });
    return;
  }
  dbState.shifts[idx] = { ...dbState.shifts[idx], ...req.body };
  broadcastUpdate('SHIFT_UPDATED', dbState.shifts[idx]);
  res.json(dbState.shifts[idx]);
});

app.delete('/api/shifts/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  dbState.shifts = dbState.shifts.filter(s => s.id !== id);
  broadcastUpdate('SHIFT_DELETED', { id });
  res.json({ success: true, id });
});

// ---------------- Operators REST API ----------------
app.get('/api/operators', (_req: Request, res: Response) => {
  res.json(dbState.operators);
});

app.post('/api/operators', (req: Request, res: Response) => {
  const newOp = {
    ...req.body,
    id: `op-${Date.now().toString().slice(-4)}`,
    lastLogin: new Date().toISOString(),
  };
  dbState.operators.push(newOp);
  broadcastUpdate('OPERATOR_ADDED', newOp);
  res.status(201).json(newOp);
});

app.put('/api/operators/:id/toggle', (req: Request, res: Response) => {
  const { id } = req.params;
  const op = dbState.operators.find(o => o.id === id);
  if (!op) {
    res.status(404).json({ error: 'Operator not found' });
    return;
  }
  op.isActive = !op.isActive;
  broadcastUpdate('OPERATOR_UPDATED', op);
  res.json(op);
});

// ---------------- System Settings REST API ----------------
app.get('/api/settings', (_req: Request, res: Response) => {
  res.json(dbState.settings);
});

app.put('/api/settings', (req: Request, res: Response) => {
  dbState.settings = { ...dbState.settings, ...req.body };
  broadcastUpdate('SETTINGS_UPDATED', dbState.settings);
  res.json(dbState.settings);
});

// ---------------- Reset Database ----------------
app.post('/api/reset', (_req: Request, res: Response) => {
  dbState = {
    version: dbState.version + 1,
    lastUpdated: new Date().toISOString(),
    personnel: DEFAULT_PERSONNEL,
    shifts: DEFAULT_SHIFTS,
    attendance: getInitialAttendanceRecords(),
    operators: DEFAULT_OPERATORS,
    settings: DEFAULT_SETTINGS,
  };
  saveDatabase(dbState);
  broadcastUpdate('DATABASE_RESET', dbState);
  res.json({ success: true, message: 'Database reset to clean institutional seed data' });
});

// Vite Integration: Development & Production Handlers
async function setupVite() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[OSC-DAMTS Cloud Server] Active and listening on http://0.0.0.0:${PORT}`);
  });
}

setupVite().catch(err => {
  console.error('Failed to initialize server:', err);
  process.exit(1);
});
