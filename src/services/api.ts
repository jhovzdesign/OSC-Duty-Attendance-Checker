import { AttendanceRecord, DutyShift, Operator, Personnel, SystemSettings } from '../types';

const API_BASE = '/api';

export interface CloudDbSnapshot {
  version: number;
  lastUpdated: string;
  connectedDevices?: number;
  personnel: Personnel[];
  shifts: DutyShift[];
  attendance: AttendanceRecord[];
  operators: Operator[];
  settings: SystemSettings;
}

export const cloudApi = {
  async fetchAllData(): Promise<CloudDbSnapshot | null> {
    try {
      const res = await fetch(`${API_BASE}/data`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Could not fetch cloud data, falling back to local cache:', err);
      return null;
    }
  },

  async recordScan(dutyId: string, mode: 'AUTO' | 'TIME_IN' | 'TIME_OUT', stationId: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/attendance/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dutyId, mode, stationId }),
      });
      return await res.json();
    } catch (err) {
      console.error('Scan request error:', err);
      return null;
    }
  },

  async addPersonnel(personnel: Omit<Personnel, 'id'>): Promise<Personnel | null> {
    try {
      const res = await fetch(`${API_BASE}/personnel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(personnel),
      });
      return await res.json();
    } catch (err) {
      console.error('Add personnel error:', err);
      return null;
    }
  },

  async updatePersonnel(id: string, updates: Partial<Personnel>): Promise<Personnel | null> {
    try {
      const res = await fetch(`${API_BASE}/personnel/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      return await res.json();
    } catch (err) {
      console.error('Update personnel error:', err);
      return null;
    }
  },

  async deletePersonnel(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/personnel/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch (err) {
      console.error('Delete personnel error:', err);
      return false;
    }
  },

  async updateAttendance(id: string, updates: Partial<AttendanceRecord>): Promise<AttendanceRecord | null> {
    try {
      const res = await fetch(`${API_BASE}/attendance/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      return await res.json();
    } catch (err) {
      console.error('Update attendance error:', err);
      return null;
    }
  },

  async deleteAttendance(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/attendance/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch (err) {
      console.error('Delete attendance error:', err);
      return false;
    }
  },

  async addShift(shift: Omit<DutyShift, 'id'>): Promise<DutyShift | null> {
    try {
      const res = await fetch(`${API_BASE}/shifts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shift),
      });
      return await res.json();
    } catch (err) {
      console.error('Add shift error:', err);
      return null;
    }
  },

  async updateShift(id: string, updates: Partial<DutyShift>): Promise<DutyShift | null> {
    try {
      const res = await fetch(`${API_BASE}/shifts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      return await res.json();
    } catch (err) {
      console.error('Update shift error:', err);
      return null;
    }
  },

  async deleteShift(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/shifts/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch (err) {
      console.error('Delete shift error:', err);
      return false;
    }
  },

  async addOperator(op: Omit<Operator, 'id' | 'lastLogin'>): Promise<Operator | null> {
    try {
      const res = await fetch(`${API_BASE}/operators`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(op),
      });
      return await res.json();
    } catch (err) {
      console.error('Add operator error:', err);
      return null;
    }
  },

  async toggleOperator(id: string): Promise<Operator | null> {
    try {
      const res = await fetch(`${API_BASE}/operators/${id}/toggle`, { method: 'PUT' });
      return await res.json();
    } catch (err) {
      console.error('Toggle operator error:', err);
      return null;
    }
  },

  async updateSettings(settings: Partial<SystemSettings>): Promise<SystemSettings | null> {
    try {
      const res = await fetch(`${API_BASE}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      return await res.json();
    } catch (err) {
      console.error('Update settings error:', err);
      return null;
    }
  },

  async resetDatabase(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/reset`, { method: 'POST' });
      return res.ok;
    } catch (err) {
      console.error('Reset database error:', err);
      return false;
    }
  },
};
