import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AttendanceRecord, Personnel } from '../types';

let cachedClient: SupabaseClient | null = null;
let currentUrl: string = '';
let currentKey: string = '';

export function getSupabaseClient(url?: string, key?: string): SupabaseClient | null {
  const targetUrl = url || import.meta.env.VITE_SUPABASE_URL || '';
  const targetKey = key || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  if (!targetUrl || !targetKey) {
    return null;
  }

  if (cachedClient && currentUrl === targetUrl && currentKey === targetKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(targetUrl, targetKey);
    currentUrl = targetUrl;
    currentKey = targetKey;
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

export async function testSupabaseConnection(url: string, key: string): Promise<{ success: boolean; message: string }> {
  try {
    const client = createClient(url, key);
    // Simple query to verify authentication and connection
    const { error } = await client.from('attendance_records').select('id').limit(1);
    
    if (error && error.code !== 'PGRST116') {
      // If table doesn't exist yet, it's still reachable as long as auth succeeded
      if (error.message.includes('relation "attendance_records" does not exist') || error.code === '42P01') {
        return { 
          success: true, 
          message: 'Connected to Supabase project! (Table schema not yet run, click "Generate SQL Schema" to provision).' 
        };
      }
      return { success: false, message: `Supabase Error: ${error.message}` };
    }

    return { success: true, message: 'Successfully connected to centralized Supabase database!' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown connection error';
    return { success: false, message: `Connection failed: ${msg}` };
  }
}

export async function syncRecordToSupabase(client: SupabaseClient, record: AttendanceRecord): Promise<boolean> {
  try {
    const { error } = await client.from('attendance_records').upsert({
      id: record.id,
      personnel_id: record.personnelId,
      duty_id: record.dutyId,
      personnel_name: record.personnelName,
      division: record.division,
      shift_id: record.shiftId,
      shift_name: record.shiftName,
      timestamp_in: record.timestampIn,
      timestamp_out: record.timestampOut,
      status: record.status,
      date: record.date,
      verification_type: record.verificationType,
      station_id: record.stationId,
      scanner_notes: record.scannerNotes || null,
      recorded_by: record.recordedBy || null
    });
    return !error;
  } catch (err) {
    console.error('Supabase sync error:', err);
    return false;
  }
}

export async function fetchAttendanceFromSupabase(client: SupabaseClient): Promise<AttendanceRecord[] | null> {
  try {
    const { data, error } = await client
      .from('attendance_records')
      .select('*')
      .order('timestamp_in', { ascending: false });

    if (error || !data) return null;

    return data.map((row: any) => ({
      id: row.id,
      personnelId: row.personnel_id,
      dutyId: row.duty_id,
      personnelName: row.personnel_name,
      division: row.division,
      shiftId: row.shift_id,
      shiftName: row.shift_name,
      timestampIn: row.timestamp_in,
      timestampOut: row.timestamp_out,
      status: row.status,
      date: row.date,
      verificationType: row.verification_type,
      stationId: row.station_id,
      scannerNotes: row.scanner_notes,
      recordedBy: row.recorded_by
    }));
  } catch (err) {
    console.error('Failed to query Supabase records:', err);
    return null;
  }
}

export const SUPABASE_SQL_SCHEMA = `-- OSC Duty Attendance Management Tracking System (OSC-DAMTS)
-- Centralized Supabase PostgreSQL Schema Definition

-- 1. Personnel Table
CREATE TABLE IF NOT EXISTS personnel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  duty_id VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  rank_designation VARCHAR(150) NOT NULL,
  division VARCHAR(150) NOT NULL,
  email VARCHAR(150),
  phone VARCHAR(50),
  duty_station VARCHAR(100) DEFAULT 'OSC Central Operations',
  clearance_level VARCHAR(50) DEFAULT 'LEVEL_2_CONFIDENTIAL',
  status VARCHAR(50) DEFAULT 'ACTIVE',
  avatar_url TEXT,
  emergency_contact VARCHAR(150),
  assigned_shift_id VARCHAR(50),
  joined_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Attendance Records Table
CREATE TABLE IF NOT EXISTS attendance_records (
  id VARCHAR(100) PRIMARY KEY,
  personnel_id VARCHAR(100) NOT NULL,
  duty_id VARCHAR(50) NOT NULL,
  personnel_name VARCHAR(255) NOT NULL,
  division VARCHAR(150) NOT NULL,
  shift_id VARCHAR(50) NOT NULL,
  shift_name VARCHAR(150) NOT NULL,
  timestamp_in TIMESTAMPTZ NOT NULL,
  timestamp_out TIMESTAMPTZ,
  status VARCHAR(50) NOT NULL DEFAULT 'PRESENT',
  date DATE NOT NULL,
  verification_type VARCHAR(50) DEFAULT 'QR_SCAN',
  station_id VARCHAR(50) DEFAULT 'OSC-GATE-01',
  scanner_notes TEXT,
  recorded_by VARCHAR(150),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_attendance_duty_id ON attendance_records(duty_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance_records(date);
CREATE INDEX IF NOT EXISTS idx_attendance_division ON attendance_records(division);

-- Enable Row Level Security (RLS)
ALTER TABLE personnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

-- Allow public read & insert for scanner verification
CREATE POLICY "Public Read Access for Attendance" ON attendance_records FOR SELECT USING (true);
CREATE POLICY "Public Insert Access for Attendance" ON attendance_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Access for Attendance" ON attendance_records FOR UPDATE USING (true);

CREATE POLICY "Public Read Access for Personnel" ON personnel FOR SELECT USING (true);
`;
