'use client';

import { useState } from 'react';
import { MenuIcon } from 'lucide-react';

interface HeaderProps {
  onMenuToggle: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-sage-100">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-3">
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-lg hover:bg-sage-50 transition-colors"
            aria-label="Menu"
          >
            <MenuIcon size={20} className="text-sage-600" />
          </button>
          <h1 className="text-lg font-semibold text-sage-800">
            agSafe
          </h1>
        </div>
      </div>
    </header>
  );
}