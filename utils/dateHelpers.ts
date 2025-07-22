import { format, startOfDay, differenceInMinutes, addDays, subDays } from 'date-fns';

export const formatDate = (date: Date, pattern: string = 'yyyy-MM-dd') => {
  return format(date, pattern);
};

export const formatTime = (date: Date) => {
  return format(date, 'HH:mm');
};

export const formatDateBR = (date: Date, pattern: string = 'dd/MM/yyyy') => {
  return format(date, pattern);
};

export const timeStringToDate = (timeString: string, baseDate: Date = new Date()) => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const date = new Date(baseDate);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

export const timeStringToMinutes = (timeString: string) => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

export const minutesToTimeString = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

export const calculateSleepDuration = (bedtime: string, wakeTime: string) => {
  const bedMinutes = timeStringToMinutes(bedtime);
  const wakeMinutes = timeStringToMinutes(wakeTime);
  
  // Se o horário de acordar é menor que o de dormir, passou da meia-noite
  if (wakeMinutes < bedMinutes) {
    return (24 * 60) - bedMinutes + wakeMinutes;
  }
  
  return wakeMinutes - bedMinutes;
};

export const getSleepQuality = (hours: number) => {
  if (hours < 6) return 'emergency';
  if (hours < 7) return 'poor';
  if (hours < 8) return 'acceptable';
  if (hours <= 10) return 'good';
  return 'excellent';
};

export const getSleepQualityColor = (quality: string) => {
  switch (quality) {
    case 'emergency': return 'bg-red-600';
    case 'poor': return 'bg-red-400';
    case 'acceptable': return 'bg-yellow-400';
    case 'good': return 'bg-green-400';
    case 'excellent': return 'bg-blue-300';
    default: return 'bg-gray-300';
  }
};

export const getAccuracyColor = (accuracy: number) => {
  if (accuracy >= 90) return 'bg-green-500';
  if (accuracy >= 70) return 'bg-yellow-500';
  if (accuracy >= 50) return 'bg-orange-500';
  return 'bg-red-500';
};

export const isToday = (date: Date) => {
  const today = startOfDay(new Date());
  const targetDate = startOfDay(date);
  return today.getTime() === targetDate.getTime();
};

export const addMinutes = (date: Date, minutes: number) => {
  return new Date(date.getTime() + minutes * 60000);
};

export const getWeekDates = (date: Date = new Date()) => {
  const startOfWeek = startOfDay(date);
  // Ajustar para começar na segunda-feira
  const dayOfWeek = startOfWeek.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = addDays(startOfWeek, diff);
  
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
};

export const getMonthDates = (date: Date = new Date()) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  const dates = [];
  for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d));
  }
  
  return dates;
};