'use client';

import { useApp } from '@/context/AppContext';
import Header from '@/components/Header';
import SidebarMenu from '@/components/SidebarMenu';
import ChatFooter from '@/components/ChatFooter';
import PWAInstaller from '@/components/PWAInstaller';
import TodayView from '@/components/TodayView';
import MedicationsView from '@/components/MedicationsView';
import SleepView from '@/components/SleepView';
import CalendarView from '@/components/CalendarView';
import HistoryView from '@/components/HistoryView';
import { useNotifications } from '@/hooks/useNotifications';
import { useVoiceCommands } from '@/hooks/useVoiceCommands';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const { state } = useApp();
  const { requestPermission } = useNotifications();
  const { isRecording, startRecording, stopRecording, processVoiceCommand } = useVoiceCommands();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  const handleSendMessage = (message: string) => {
    console.log('Mensagem enviada:', message);
    // Processar como comando de texto
    processVoiceCommand(message);
  };

  const handleVoiceToggle = (recording: boolean) => {
    if (recording) {
      startRecording();
    } else {
      stopRecording();
    }
  };

  return (
    <main className="min-h-screen bg-zen-50">
      {/* Header */}
      <Header onMenuToggle={() => setIsSidebarOpen(true)} />
      
      {/* Sidebar Menu */}
      <SidebarMenu 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      {/* Main Content */}
      <div className="pt-16 pb-32">
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
      </div>
      
      {/* Chat Footer */}
      <ChatFooter 
        onSendMessage={handleSendMessage}
        onVoiceToggle={handleVoiceToggle}
        isRecording={isRecording}
      />
      
      {/* PWA Install Prompt */}
      <PWAInstaller />
    </main>
  );
}