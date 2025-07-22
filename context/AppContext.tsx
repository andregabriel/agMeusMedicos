'use client';

import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { Medication, MedicationLog, SleepRecord, ViewMode, AlarmState } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { formatDate } from '@/utils/dateHelpers';

interface AppState {
  medications: Medication[];
  medicationLogs: MedicationLog[];
  sleepRecords: SleepRecord[];
  currentView: ViewMode;
  alarm: AlarmState;
}

type AppAction =
  | { type: 'SET_VIEW'; payload: ViewMode }
  | { type: 'ADD_MEDICATION'; payload: Medication }
  | { type: 'UPDATE_MEDICATION'; payload: Medication }
  | { type: 'DELETE_MEDICATION'; payload: string }
  | { type: 'ADD_MEDICATION_LOG'; payload: MedicationLog }
  | { type: 'UPDATE_MEDICATION_LOG'; payload: MedicationLog }
  | { type: 'ADD_SLEEP_RECORD'; payload: SleepRecord }
  | { type: 'UPDATE_SLEEP_RECORD'; payload: SleepRecord }
  | { type: 'SET_ALARM'; payload: AlarmState }
  | { type: 'LOAD_DATA'; payload: Partial<AppState> };

const initialState: AppState = {
  medications: [],
  medicationLogs: [],
  sleepRecords: [],
  currentView: 'today',
  alarm: {
    isActive: false,
    currentMedications: [],
    currentTime: '',
    snoozeCount: 0,
    maxSnooze: 10,
  },
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, currentView: action.payload };
    
    case 'ADD_MEDICATION':
      return {
        ...state,
        medications: [...state.medications, action.payload],
      };
    
    case 'UPDATE_MEDICATION':
      return {
        ...state,
        medications: state.medications.map(med =>
          med.id === action.payload.id ? action.payload : med
        ),
      };
    
    case 'DELETE_MEDICATION':
      return {
        ...state,
        medications: state.medications.filter(med => med.id !== action.payload),
      };
    
    case 'ADD_MEDICATION_LOG':
      return {
        ...state,
        medicationLogs: [...state.medicationLogs, action.payload],
      };
    
    case 'UPDATE_MEDICATION_LOG':
      return {
        ...state,
        medicationLogs: state.medicationLogs.map(log =>
          log.id === action.payload.id ? action.payload : log
        ),
      };
    
    case 'ADD_SLEEP_RECORD':
      return {
        ...state,
        sleepRecords: [...state.sleepRecords, action.payload],
      };
    
    case 'UPDATE_SLEEP_RECORD':
      return {
        ...state,
        sleepRecords: state.sleepRecords.map(record =>
          record.id === action.payload.id ? action.payload : record
        ),
      };
    
    case 'SET_ALARM':
      return {
        ...state,
        alarm: action.payload,
      };
    
    case 'LOAD_DATA':
      return { ...state, ...action.payload };
    
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Helper functions
  getMedicationsForTime: (time: string) => Medication[];
  getTodayLogs: () => MedicationLog[];
  getTodaySleep: () => SleepRecord | undefined;
  getMedicationAccuracy: (date: string) => number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [medications, setMedications] = useLocalStorage<Medication[]>('agsafe-medications', []);
  const [medicationLogs, setMedicationLogs] = useLocalStorage<MedicationLog[]>('agsafe-logs', []);
  const [sleepRecords, setSleepRecords] = useLocalStorage<SleepRecord[]>('agsafe-sleep', []);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load data from localStorage ONLY on mount
  useEffect(() => {
    if (!isInitialized) {
      dispatch({
        type: 'LOAD_DATA',
        payload: {
          medications,
          medicationLogs,
          sleepRecords,
        },
      });
      setIsInitialized(true);
    }
  }, [medications, medicationLogs, sleepRecords, isInitialized]);

  // Save to localStorage when state changes (but only after initialization)
  useEffect(() => {
    if (isInitialized) {
      setMedications(state.medications);
    }
  }, [state.medications, setMedications, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      setMedicationLogs(state.medicationLogs);
    }
  }, [state.medicationLogs, setMedicationLogs, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      setSleepRecords(state.sleepRecords);
    }
  }, [state.sleepRecords, setSleepRecords, isInitialized]);

  const getMedicationsForTime = (time: string): Medication[] => {
    return state.medications.filter(med => 
      med.active && med.times.includes(time)
    );
  };

  const getTodayLogs = (): MedicationLog[] => {
    const today = formatDate(new Date());
    return state.medicationLogs.filter(log => log.date === today);
  };

  const getTodaySleep = (): SleepRecord | undefined => {
    const today = formatDate(new Date());
    return state.sleepRecords.find(record => record.date === today);
  };

  const getMedicationAccuracy = (date: string): number => {
    const dayLogs = state.medicationLogs.filter(log => log.date === date);
    const dayMedications = state.medications.filter(med => med.active);
    
    if (dayMedications.length === 0) return 100;
    
    const totalExpected = dayMedications.reduce((acc, med) => acc + med.times.length, 0);
    const totalTaken = dayLogs.filter(log => log.status === 'taken').length;
    
    return Math.round((totalTaken / totalExpected) * 100);
  };

  const value: AppContextType = {
    state,
    dispatch,
    getMedicationsForTime,
    getTodayLogs,
    getTodaySleep,
    getMedicationAccuracy,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}