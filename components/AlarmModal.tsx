'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { formatTime, formatDate } from '@/utils/dateHelpers';
import { useNotifications } from '@/hooks/useNotifications';
import { 
  BellIcon, 
  ClockIcon, 
  CheckIcon, 
  CalendarIcon, 
  XIcon,
  VolumeXIcon 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface AlarmModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AlarmModal({ isOpen, onClose }: AlarmModalProps) {
  const { state, dispatch, getMedicationsForTime } = useApp();
  const { showNotification } = useNotifications();
  const [currentTime, setCurrentTime] = useState(formatTime(new Date()));
  const [snoozeCount, setSnoozeCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const medications = getMedicationsForTime(currentTime);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(formatTime(new Date()));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isOpen && isPlaying) {
      // Simular som de alarme (pode ser implementado com Web Audio API)
      const audio = new Audio('/alarm-sound.mp3');
      audio.loop = true;
      audio.play().catch(() => {
        // Fallback se não conseguir tocar o som
        console.log('Could not play alarm sound');
      });

      return () => {
        audio.pause();
        audio.currentTime = 0;
      };
    }
  }, [isOpen, isPlaying]);

  const handleSnooze = () => {
    if (snoozeCount >= 10) {
      toast.error('Limite de snooze atingido!');
      return;
    }

    setSnoozeCount(prev => prev + 1);
    setIsPlaying(false);
    
    toast.success('Alarme adiado por 5 minutos');
    
    setTimeout(() => {
      setIsPlaying(true);
      showNotification('Hora do medicamento!', {
        body: `${medications.map(m => m.name).join(', ')}`,
        requireInteraction: true,
      });
    }, 5 * 60 * 1000); // 5 minutos

    onClose();
  };

  const handleTaken = (medicationId?: string) => {
    const currentDate = formatDate(new Date());
    const actualTime = formatTime(new Date());

    if (medicationId) {
      // Marcar medicamento específico como tomado
      const log = {
        id: Date.now().toString(),
        medicationId,
        scheduledTime: currentTime,
        actualTime,
        date: currentDate,
        status: 'taken' as const,
        timestamp: new Date(),
      };

      dispatch({ type: 'ADD_MEDICATION_LOG', payload: log });
      toast.success('Medicamento marcado como tomado!');
    } else {
      // Marcar todos os medicamentos como tomados
      medications.forEach(medication => {
        const log = {
          id: `${Date.now()}-${medication.id}`,
          medicationId: medication.id,
          scheduledTime: currentTime,
          actualTime,
          date: currentDate,
          status: 'taken' as const,
          timestamp: new Date(),
        };

        dispatch({ type: 'ADD_MEDICATION_LOG', payload: log });
      });
      toast.success('Todos os medicamentos marcados como tomados!');
      onClose();
    }
  };

  const handleOtherTime = (medicationId?: string) => {
    const customTime = prompt('Digite o horário que você tomou (HH:mm):');
    if (!customTime || !/^\d{2}:\d{2}$/.test(customTime)) {
      toast.error('Horário inválido!');
      return;
    }

    const currentDate = formatDate(new Date());

    if (medicationId) {
      const log = {
        id: Date.now().toString(),
        medicationId,
        scheduledTime: currentTime,
        actualTime: customTime,
        date: currentDate,
        status: 'other_time' as const,
        timestamp: new Date(),
      };

      dispatch({ type: 'ADD_MEDICATION_LOG', payload: log });
      toast.success(`Medicamento marcado como tomado às ${customTime}`);
    } else {
      medications.forEach(medication => {
        const log = {
          id: `${Date.now()}-${medication.id}`,
          medicationId: medication.id,
          scheduledTime: currentTime,
          actualTime: customTime,
          date: currentDate,
          status: 'other_time' as const,
          timestamp: new Date(),
        };

        dispatch({ type: 'ADD_MEDICATION_LOG', payload: log });
      });
      toast.success(`Todos os medicamentos marcados como tomados às ${customTime}`);
      onClose();
    }
  };

  const handleSkip = (medicationId?: string) => {
    const currentDate = formatDate(new Date());

    if (medicationId) {
      const log = {
        id: Date.now().toString(),
        medicationId,
        scheduledTime: currentTime,
        date: currentDate,
        status: 'skipped' as const,
        timestamp: new Date(),
      };

      dispatch({ type: 'ADD_MEDICATION_LOG', payload: log });
      toast('Medicamento marcado como não tomado');
    } else {
      medications.forEach(medication => {
        const log = {
          id: `${Date.now()}-${medication.id}`,
          medicationId: medication.id,
          scheduledTime: currentTime,
          date: currentDate,
          status: 'skipped' as const,
          timestamp: new Date(),
        };

        dispatch({ type: 'ADD_MEDICATION_LOG', payload: log });
      });
      toast('Todos os medicamentos marcados como não tomados');
      onClose();
    }
  };

  const toggleSound = () => {
    setIsPlaying(!isPlaying);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-3xl p-6 max-w-sm w-full mx-4 shadow-2xl"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-4">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                isPlaying ? 'bg-red-500 animate-pulse' : 'bg-gray-400'
              }`}>
                <BellIcon className="text-white" size={32} />
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-sage-800 mb-2">
              Hora do Medicamento!
            </h2>
            <p className="text-sage-600">{currentTime}</p>
            {snoozeCount > 0 && (
              <p className="text-sm text-orange-600 mt-1">
                Snooze: {snoozeCount}/10
              </p>
            )}
          </div>

          {/* Medicamentos */}
          <div className="space-y-3 mb-6">
            {medications.map(medication => (
              <div key={medication.id} className="flex items-center justify-between p-3 bg-zen-50 rounded-2xl">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: medication.color }}
                  />
                  <div>
                    <div className="font-medium text-sage-800">{medication.name}</div>
                    <div className="text-sm text-sage-600">{medication.dosage}</div>
                  </div>
                </div>

                {/* Ações por medicamento */}
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleTaken(medication.id)}
                    className="zen-button p-2"
                    title="Tomei"
                  >
                    <CheckIcon size={16} className="text-green-600" />
                  </button>
                  <button
                    onClick={() => handleOtherTime(medication.id)}
                    className="zen-button p-2"
                    title="Outro horário"
                  >
                    <ClockIcon size={16} className="text-blue-600" />
                  </button>
                  <button
                    onClick={() => handleSkip(medication.id)}
                    className="zen-button p-2"
                    title="Não tomarei"
                  >
                    <XIcon size={16} className="text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Ações Globais */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleSnooze}
                disabled={snoozeCount >= 10}
                className="alarm-button bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400"
              >
                <div className="text-center">
                  <ClockIcon size={20} className="mx-auto mb-1" />
                  <div className="text-xs">+5min</div>
                </div>
              </button>

              <button
                onClick={() => handleTaken()}
                className="alarm-button bg-green-500 hover:bg-green-600"
              >
                <div className="text-center">
                  <CheckIcon size={20} className="mx-auto mb-1" />
                  <div className="text-xs">Todos</div>
                </div>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleOtherTime()}
                className="alarm-button bg-blue-500 hover:bg-blue-600"
              >
                <div className="text-center">
                  <CalendarIcon size={20} className="mx-auto mb-1" />
                  <div className="text-xs">Outro</div>
                </div>
              </button>

              <button
                onClick={() => handleSkip()}
                className="alarm-button bg-red-500 hover:bg-red-600"
              >
                <div className="text-center">
                  <XIcon size={20} className="mx-auto mb-1" />
                  <div className="text-xs">Pular</div>
                </div>
              </button>
            </div>

            {/* Controle de Som */}
            <button
              onClick={toggleSound}
              className="w-full flex items-center justify-center space-x-2 py-3 bg-zen-100 rounded-2xl hover:bg-zen-200 transition-colors"
            >
              <VolumeXIcon size={16} className="text-sage-600" />
              <span className="text-sm text-sage-600">
                {isPlaying ? 'Silenciar' : 'Reativar Som'}
              </span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}