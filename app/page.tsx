'use client';

import { useApp } from '@/context/AppContext';
import Navigation from '@/components/Navigation';
import TodayView from '@/components/TodayView';
import MedicationsView from '@/components/MedicationsView';
import SleepView from '@/components/SleepView';
import CalendarView from '@/components/CalendarView';
import HistoryView from '@/components/HistoryView';
import { useNotifications } from '@/hooks/useNotifications';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const { state } = useApp();
  const { requestPermission } = useNotifications();

  useEffect(() => {
    // Request notification permission on app load
    requestPermission();
  }, [requestPermission]);

  const renderView = () => {
    switch (state.currentView) {
      case 'today':
        return <TodayView />;
      case 'medications':
        return <MedicationsView />;
      case 'sleep':
        return <SleepView />;
      case 'calendar':
        return <CalendarView />;
      case 'history':
        return <HistoryView />;
      default:
        return <TodayView />;
    }
  };

  return (
    <main className="min-h-screen">
      <AnimatePresence mode="wait">
        <motion.div
          key={state.currentView}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          {renderView()}
        </motion.div>
      </AnimatePresence>
      
      <Navigation />
    </main>
  );
}