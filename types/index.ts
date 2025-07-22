export interface Medication {
  id: string;
  name: string;
  dosage: string;
  times: string[]; // Array de horários no formato "HH:mm"
  color: string;
  icon?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MedicationLog {
  id: string;
  medicationId: string;
  scheduledTime: string; // Formato "HH:mm"
  actualTime?: string; // Formato "HH:mm"
  date: string; // Formato "YYYY-MM-DD"
  status: 'taken' | 'skipped' | 'delayed' | 'other_time';
  notes?: string;
  timestamp: Date;
}

export interface SleepRecord {
  id: string;
  date: string; // Formato "YYYY-MM-DD"
  bedtime: string; // Formato "HH:mm"
  wakeTime: string; // Formato "HH:mm"
  duration: number; // em minutos
  quality: 1 | 2 | 3 | 4 | 5; // 1-5 rating
  notes?: string;
  timestamp: Date;
}

export interface AlarmState {
  isActive: boolean;
  currentMedications: Medication[];
  currentTime: string;
  snoozeCount: number;
  maxSnooze: number;
}

export interface DayStats {
  date: string;
  medicationAccuracy: number; // 0-100%
  sleepHours: number;
  sleepQuality: 'emergency' | 'poor' | 'acceptable' | 'good' | 'excellent';
  medicationsTotal: number;
  medicationsTaken: number;
}

export type ViewMode = 'today' | 'medications' | 'sleep' | 'calendar' | 'history';

export interface NotificationPermission {
  granted: boolean;
  supported: boolean;
}