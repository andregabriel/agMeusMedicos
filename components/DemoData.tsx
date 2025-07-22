'use client';

import { useApp } from '@/context/AppContext';
import { Medication, MedicationLog, SleepRecord } from '@/types';
import { formatDate } from '@/utils/dateHelpers';
import { TestTubeIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DemoData() {
  const { dispatch } = useApp();

  const addDemoData = () => {
    // Demo medications
    const demoMedications: Medication[] = [
      {
        id: 'med-1',
        name: 'Omeprazol',
        dosage: '20mg',
        times: ['08:00', '20:00'],
        color: '#ef4444',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'med-2',
        name: 'Fluoxetina',
        dosage: '20mg',
        times: ['09:00'],
        color: '#3b82f6',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'med-3',
        name: 'Vitamina D',
        dosage: '2000 UI',
        times: ['12:00'],
        color: '#eab308',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Demo medication logs for the last 7 days
    const demoLogs: MedicationLog[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = formatDate(date);

      demoMedications.forEach(med => {
        med.times.forEach(time => {
          const status = Math.random() > 0.2 ? 'taken' : 'skipped';
          const actualTime = status === 'taken' 
            ? (Math.random() > 0.8 ? '09:05' : time) // 20% chance of slight delay
            : undefined;

          demoLogs.push({
            id: `log-${i}-${med.id}-${time}`,
            medicationId: med.id,
            scheduledTime: time,
            actualTime,
            date: dateString,
            status,
            timestamp: new Date(date.getTime() + Math.random() * 24 * 60 * 60 * 1000),
          });
        });
      });
    }

    // Demo sleep records for the last 7 days
    const demoSleep: SleepRecord[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = formatDate(date);

      const bedtimeHour = 22 + Math.floor(Math.random() * 2); // 22:00 - 23:59
      const bedtimeMinute = Math.floor(Math.random() * 60);
      const bedtime = `${bedtimeHour.toString().padStart(2, '0')}:${bedtimeMinute.toString().padStart(2, '0')}`;

      const wakeHour = 6 + Math.floor(Math.random() * 3); // 06:00 - 08:59
      const wakeMinute = Math.floor(Math.random() * 60);
      const wakeTime = `${wakeHour.toString().padStart(2, '0')}:${wakeMinute.toString().padStart(2, '0')}`;

      // Calculate duration
      const bedtimeMinutes = bedtimeHour * 60 + bedtimeMinute;
      const wakeMinutes = wakeHour * 60 + wakeMinute;
      const duration = (24 * 60) - bedtimeMinutes + wakeMinutes;

      const quality = Math.floor(Math.random() * 5) + 1;

      demoSleep.push({
        id: `sleep-${i}`,
        date: dateString,
        bedtime,
        wakeTime,
        duration,
        quality: quality as 1 | 2 | 3 | 4 | 5,
        notes: i === 0 ? 'Dormi bem hoje!' : undefined,
        timestamp: new Date(date),
      });
    }

    // Add all demo data
    demoMedications.forEach(med => {
      dispatch({ type: 'ADD_MEDICATION', payload: med });
    });

    demoLogs.forEach(log => {
      dispatch({ type: 'ADD_MEDICATION_LOG', payload: log });
    });

    demoSleep.forEach(sleep => {
      dispatch({ type: 'ADD_SLEEP_RECORD', payload: sleep });
    });

    toast.success('Dados de demonstração adicionados! 🎉');
  };

  return (
    <div className="card text-center p-8">
      <TestTubeIcon size={48} className="mx-auto mb-4 text-sage-400" />
      <h3 className="text-lg font-semibold text-sage-800 mb-2">
        Dados de Demonstração
      </h3>
      <p className="text-sage-600 mb-6">
        Adicione dados de exemplo para ver como o aplicativo funciona
      </p>
      <button
        onClick={addDemoData}
        className="btn-primary"
      >
        Carregar Dados Demo
      </button>
    </div>
  );
}