'use client';

import { useApp } from '@/context/AppContext';
import { ViewMode } from '@/types';
import { 
  HomeIcon, 
  PillIcon, 
  MoonIcon, 
  CalendarIcon, 
  ClockIcon 
} from 'lucide-react';

const navigationItems = [
  { id: 'today' as ViewMode, label: 'Hoje', icon: HomeIcon },
  { id: 'medications' as ViewMode, label: 'Remédios', icon: PillIcon },
  { id: 'sleep' as ViewMode, label: 'Sono', icon: MoonIcon },
  { id: 'calendar' as ViewMode, label: 'Calendário', icon: CalendarIcon },
  { id: 'history' as ViewMode, label: 'Histórico', icon: ClockIcon },
];

export default function Navigation() {
  const { state, dispatch } = useApp();

  const handleViewChange = (view: ViewMode) => {
    dispatch({ type: 'SET_VIEW', payload: view });
  };

  return (
    <nav className="floating-card">
      <div className="flex justify-around items-center px-4 py-2">
        {navigationItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => handleViewChange(id)}
            className={`nav-item ${state.currentView === id ? 'active' : ''}`}
          >
            <Icon size={20} strokeWidth={1.5} />
            <span className="text-xs mt-1 font-medium">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}