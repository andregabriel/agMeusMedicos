'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { formatTime, formatDateBR, isToday } from '@/utils/dateHelpers';
import { PlusIcon, AlarmCheckIcon, BellIcon, SunIcon, MoonIcon } from 'lucide-react';
import AlarmModal from './AlarmModal';
import DemoData from './DemoData';
import { motion } from 'framer-motion';

export default function TodayView() {
  const { state, getTodayLogs, getTodaySleep, getMedicationAccuracy } = useApp();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showAlarm, setShowAlarm] = useState(false);
  
  const todayLogs = getTodayLogs();
  const todaySleep = getTodaySleep();
  const todayAccuracy = getMedicationAccuracy(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Simular detecção de horário de medicamento
  useEffect(() => {
    const currentTimeString = formatTime(currentTime);
    const medicationsForNow = state.medications.filter(med => 
      med.active && med.times.includes(currentTimeString)
    );

    if (medicationsForNow.length > 0 && !state.alarm.isActive) {
      setShowAlarm(true);
    }
  }, [currentTime, state.medications, state.alarm.isActive]);

  const getNextMedication = () => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    let nextMed = null;
    let minDiff = Infinity;

    state.medications.forEach(med => {
      if (!med.active) return;
      
      med.times.forEach(time => {
        const [hours, minutes] = time.split(':').map(Number);
        const medMinutes = hours * 60 + minutes;
        
        let diff = medMinutes - currentMinutes;
        if (diff < 0) diff += 24 * 60; // próximo dia
        
        if (diff < minDiff) {
          minDiff = diff;
          nextMed = { ...med, time };
        }
      });
    });

    return nextMed;
  };

  const nextMedication = getNextMedication();

  const getSleepEmoji = (hours: number) => {
    if (hours >= 8 && hours <= 10) return '😌';
    if (hours >= 7) return '😊';
    if (hours >= 6) return '😐';
    return '😴';
  };

  const getAccuracyEmoji = (accuracy: number) => {
    if (accuracy >= 90) return '🎯';
    if (accuracy >= 70) return '👍';
    if (accuracy >= 50) return '😅';
    return '💊';
  };

  return (
    <div className="p-6 pb-32 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h1 className="text-3xl font-light gradient-text">
          Olá, boa {currentTime.getHours() < 12 ? 'manhã' : currentTime.getHours() < 18 ? 'tarde' : 'noite'}!
        </h1>
        <p className="text-sage-600 text-lg">
          {formatDateBR(currentTime, 'EEEE, dd MMMM')}
        </p>
        <div className="text-4xl font-light text-sage-800">
          {formatTime(currentTime)}
        </div>
      </motion.div>

      {/* Próximo Medicamento */}
      {nextMedication && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card card-hover"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sage-400 to-sage-600 flex items-center justify-center">
                <PillIcon className="text-white" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-sage-800">{nextMedication.name}</h3>
                <p className="text-sage-600">{nextMedication.dosage}</p>
                <p className="text-sm text-sage-500">Próximo: {nextMedication.time}</p>
              </div>
            </div>
            <BellIcon className="text-sage-400 animate-gentle-bounce" size={20} />
          </div>
        </motion.div>
      )}

      {/* Resumo do Dia */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="card text-center"
        >
          <div className="text-2xl mb-2">{getAccuracyEmoji(todayAccuracy)}</div>
          <div className="text-2xl font-light text-sage-800">{todayAccuracy}%</div>
          <div className="text-sm text-sage-600">Precisão Remédios</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="card text-center"
        >
          <div className="text-2xl mb-2">{todaySleep ? getSleepEmoji(todaySleep.duration / 60) : '💤'}</div>
          <div className="text-2xl font-light text-sage-800">
            {todaySleep ? `${(todaySleep.duration / 60).toFixed(1)}h` : '--'}
          </div>
          <div className="text-sm text-sage-600">Sono Ontem</div>
        </motion.div>
      </div>

      {/* Medicamentos Hoje */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-sage-800">Medicamentos Hoje</h2>
          <AlarmCheckIcon className="text-sage-400" size={20} />
        </div>

        {state.medications.filter(med => med.active).length === 0 ? (
          <DemoData />
        ) : (
          <div className="space-y-3">
            {state.medications
              .filter(med => med.active)
              .map(medication => (
                <div key={medication.id} className="flex items-center justify-between p-3 bg-zen-50 rounded-2xl">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: medication.color }}
                    />
                    <div>
                      <div className="font-medium text-sage-800">{medication.name}</div>
                      <div className="text-sm text-sage-600">{medication.dosage}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-sage-600">
                      {medication.times.length} vez{medication.times.length > 1 ? 'es' : ''}
                    </div>
                    <div className="text-xs text-sage-500">
                      {medication.times.join(', ')}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </motion.div>

      {/* Histórico Recente */}
      {todayLogs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <h2 className="text-lg font-semibold text-sage-800 mb-4">Tomados Hoje</h2>
          <div className="space-y-2">
            {todayLogs.slice(-3).map(log => {
              const medication = state.medications.find(med => med.id === log.medicationId);
              return (
                <div key={log.id} className="flex items-center justify-between p-2 bg-green-50 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm text-sage-800">{medication?.name}</span>
                  </div>
                  <span className="text-xs text-sage-600">
                    {log.actualTime || log.scheduledTime}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Alarm Modal */}
      {showAlarm && (
        <AlarmModal
          isOpen={showAlarm}
          onClose={() => setShowAlarm(false)}
        />
      )}
    </div>
  );
}