'use client';

import { useApp } from '@/context/AppContext';
import { ViewMode } from '@/types';
import { 
  HomeIcon, 
  PillIcon, 
  MoonIcon, 
  CalendarIcon, 
  ClockIcon,
  XIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navigationItems = [
  { id: 'today' as ViewMode, label: 'Hoje', icon: HomeIcon },
  { id: 'medications' as ViewMode, label: 'Remédios', icon: PillIcon },
  { id: 'sleep' as ViewMode, label: 'Sono', icon: MoonIcon },
  { id: 'calendar' as ViewMode, label: 'Calendário', icon: CalendarIcon },
  { id: 'history' as ViewMode, label: 'Histórico', icon: ClockIcon },
];

interface SidebarMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SidebarMenu({ isOpen, onClose }: SidebarMenuProps) {
  const { state, dispatch } = useApp();

  const handleViewChange = (view: ViewMode) => {
    dispatch({ type: 'SET_VIEW', payload: view });
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'tween', duration: 0.3 }}
        className="fixed left-0 top-0 bottom-0 w-64 bg-white shadow-xl z-50 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-sage-100">
          <h2 className="text-lg font-semibold text-sage-800">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-sage-50 transition-colors"
          >
            <XIcon size={20} className="text-sage-600" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-4">
          {navigationItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleViewChange(id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-sage-50 transition-colors ${
                state.currentView === id 
                  ? 'bg-sage-100 text-sage-800 border-r-2 border-sage-400' 
                  : 'text-sage-600'
              }`}
            >
              <Icon size={20} strokeWidth={1.5} />
              <span className="font-medium">{label}</span>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-sage-100">
          <div className="text-xs text-sage-500 text-center">
            agSafe v1.0
          </div>
        </div>
      </motion.div>
    </>
  );
}