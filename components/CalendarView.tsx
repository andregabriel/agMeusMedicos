'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { formatDate, formatDateBR, getWeekDates, getMonthDates, getSleepQuality, getSleepQualityColor, getAccuracyColor } from '@/utils/dateHelpers';
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon } from 'lucide-react';
import { motion } from 'framer-motion';

type ViewType = 'week' | 'month';

export default function CalendarView() {
  const { state, getMedicationAccuracy } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<ViewType>('week');

  const dates = viewType === 'week' ? getWeekDates(currentDate) : getMonthDates(currentDate);

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    if (viewType === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    
    setCurrentDate(newDate);
  };

  const getDayData = (date: Date) => {
    const dateString = formatDate(date);
    const sleepRecord = state.sleepRecords.find(record => record.date === dateString);
    const accuracy = getMedicationAccuracy(dateString);
    
    const sleepHours = sleepRecord ? sleepRecord.duration / 60 : 0;
    const sleepQuality = sleepHours > 0 ? getSleepQuality(sleepHours) : null;
    
    return {
      date,
      dateString,
      sleepRecord,
      sleepHours,
      sleepQuality,
      accuracy,
    };
  };

  const getAccuracyEmoji = (accuracy: number) => {
    if (accuracy >= 90) return '🎯';
    if (accuracy >= 70) return '👍';
    if (accuracy >= 50) return '😅';
    return '💊';
  };

  const getSleepEmoji = (hours: number) => {
    if (hours >= 8 && hours <= 10) return '😌';
    if (hours >= 7) return '😊';
    if (hours >= 6) return '😐';
    if (hours < 6 && hours > 0) return '😴';
    return '💤';
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  return (
    <div className="p-6 pb-32 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold gradient-text">Calendário</h1>
          <p className="text-sage-600">Visualize seu progresso</p>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setViewType('week')}
            className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
              viewType === 'week' 
                ? 'bg-sage-600 text-white' 
                : 'bg-zen-200 text-sage-700 hover:bg-zen-300'
            }`}
          >
            Semana
          </button>
          <button
            onClick={() => setViewType('month')}
            className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
              viewType === 'month' 
                ? 'bg-sage-600 text-white' 
                : 'bg-zen-200 text-sage-700 hover:bg-zen-300'
            }`}
          >
            Mês
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateDate('prev')}
          className="zen-button p-3"
        >
          <ChevronLeftIcon size={20} />
        </button>
        
        <h2 className="text-xl font-medium text-sage-800">
          {viewType === 'week' 
            ? `${formatDateBR(dates[0], 'dd MMM')} - ${formatDateBR(dates[dates.length - 1], 'dd MMM yyyy')}`
            : formatDateBR(currentDate, 'MMMM yyyy')
          }
        </h2>
        
        <button
          onClick={() => navigateDate('next')}
          className="zen-button p-3"
        >
          <ChevronRightIcon size={20} />
        </button>
      </div>

      {/* Week View */}
      {viewType === 'week' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-sm font-medium text-sage-600 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Week Days */}
          <div className="grid grid-cols-7 gap-2">
            {dates.map((date, index) => {
              const dayData = getDayData(date);
              
              return (
                <motion.div
                  key={date.toISOString()}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`card p-3 text-center ${isToday(date) ? 'ring-2 ring-primary-500' : ''}`}
                >
                  <div className={`text-lg font-medium mb-2 ${
                    isToday(date) ? 'text-primary-600' : 'text-sage-800'
                  }`}>
                    {date.getDate()}
                  </div>
                  
                  {/* Medication Accuracy */}
                  <div className="flex items-center justify-center mb-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      getAccuracyColor(dayData.accuracy)
                    }`}>
                      {dayData.accuracy > 0 ? `${dayData.accuracy}%` : '-'}
                    </div>
                  </div>
                  
                  {/* Sleep */}
                  <div className="flex items-center justify-center space-x-1">
                    <span className="text-lg">
                      {getSleepEmoji(dayData.sleepHours)}
                    </span>
                    <span className="text-xs text-sage-600">
                      {dayData.sleepHours > 0 ? `${dayData.sleepHours.toFixed(1)}h` : '-'}
                    </span>
                  </div>
                  
                  {/* Quality Indicator */}
                  {dayData.sleepQuality && (
                    <div className={`w-2 h-2 rounded-full mx-auto mt-2 ${
                      getSleepQualityColor(dayData.sleepQuality)
                    }`} />
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Month View */}
      {viewType === 'month' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map(day => (
              <div key={day} className="text-center text-sm font-medium text-sage-600 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Month Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: (dates[0].getDay() + 6) % 7 }, (_, i) => (
              <div key={`empty-${i}`} className="h-16" />
            ))}
            
            {dates.map((date, index) => {
              const dayData = getDayData(date);
              
              return (
                <motion.div
                  key={date.toISOString()}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.02 }}
                  className={`relative h-16 bg-white/60 rounded-xl p-2 border ${
                    isToday(date) ? 'border-primary-500 bg-primary-50' : 'border-zen-200'
                  } hover:bg-white/80 transition-colors`}
                >
                  <div className={`text-sm font-medium ${
                    isToday(date) ? 'text-primary-600' : 'text-sage-800'
                  }`}>
                    {date.getDate()}
                  </div>
                  
                  {/* Indicators */}
                  <div className="absolute bottom-1 left-1 right-1 flex justify-center space-x-1">
                    {/* Medication indicator */}
                    {dayData.accuracy > 0 && (
                      <div className={`w-2 h-2 rounded-full ${getAccuracyColor(dayData.accuracy)}`} />
                    )}
                    
                    {/* Sleep indicator */}
                    {dayData.sleepQuality && (
                      <div className={`w-2 h-2 rounded-full ${getSleepQualityColor(dayData.sleepQuality)}`} />
                    )}
                  </div>
                  
                  {/* Emoji indicators for small view */}
                  <div className="absolute top-1 right-1 text-xs">
                    {dayData.accuracy > 0 && (
                      <span>{getAccuracyEmoji(dayData.accuracy)}</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-sage-800 mb-4">Legenda</h3>
        
        <div className="space-y-4">
          {/* Medication Accuracy */}
          <div>
            <h4 className="text-sm font-medium text-sage-700 mb-2">Precisão dos Medicamentos</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <span>90%+ 🎯 Excelente</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                <span>70%+ 👍 Bom</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                <span>50%+ 😅 Regular</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-red-500"></div>
                <span>50%- 💊 Precisa melhorar</span>
              </div>
            </div>
          </div>
          
          {/* Sleep Quality */}
          <div>
            <h4 className="text-sm font-medium text-sage-700 mb-2">Qualidade do Sono</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-green-400"></div>
                <span>8-10h 😌 Ideal</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
                <span>7h 😊 Aceitável</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-red-400"></div>
                <span>6-7h 😐 Pouco</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-red-600"></div>
                <span>&lt;6h 😴 Emergência</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-blue-300"></div>
                <span>&gt;10h 😌 Serenidade</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-sage-800 mb-4">
          Estatísticas {viewType === 'week' ? 'da Semana' : 'do Mês'}
        </h3>
        
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-light text-sage-800">
              {Math.round(
                dates.reduce((acc, date) => acc + getDayData(date).accuracy, 0) / dates.length
              )}%
            </div>
            <div className="text-sm text-sage-600">Precisão Média</div>
          </div>
          
          <div>
            <div className="text-2xl font-light text-sage-800">
              {(
                dates.reduce((acc, date) => acc + getDayData(date).sleepHours, 0) / 
                dates.filter(date => getDayData(date).sleepHours > 0).length || 0
              ).toFixed(1)}h
            </div>
            <div className="text-sm text-sage-600">Sono Médio</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}