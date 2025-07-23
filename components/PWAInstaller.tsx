'use client';

import { useEffect, useState } from 'react';
import { DownloadIcon, XIcon } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Registrar service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }

    // Detectar se o app já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Detectar evento de instalação
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const beforeInstallPrompt = e as BeforeInstallPromptEvent;
      setDeferredPrompt(beforeInstallPrompt);
      
      // Mostrar banner apenas se não estiver instalado
      if (!isInstalled) {
        setShowInstallBanner(true);
      }
    };

    // Detectar quando o app foi instalado
    const handleAppInstalled = () => {
      console.log('App foi instalado');
      setIsInstalled(true);
      setShowInstallBanner(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('Usuário aceitou instalar o app');
    } else {
      console.log('Usuário rejeitou instalar o app');
    }
    
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    // Não mostrar novamente nesta sessão
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Não mostrar se já foi dispensado nesta sessão
  useEffect(() => {
    const dismissed = sessionStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      setShowInstallBanner(false);
    }
  }, []);

  if (!showInstallBanner || isInstalled) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="bg-white/95 backdrop-blur-sm border border-sage-200 rounded-2xl p-4 shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-sage-800 text-sm">
              Instalar agSafe
            </h3>
            <p className="text-xs text-sage-600 mt-1">
              Instale o app no seu celular para acesso rápido e notificações
            </p>
          </div>
          
          <button
            onClick={handleDismiss}
            className="p-1 rounded-lg hover:bg-sage-100 transition-colors ml-2"
          >
            <XIcon size={16} className="text-sage-500" />
          </button>
        </div>
        
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleInstallClick}
            className="flex-1 bg-sage-500 text-white rounded-xl py-2 px-3 text-sm font-medium hover:bg-sage-600 transition-colors flex items-center justify-center gap-2"
          >
            <DownloadIcon size={16} />
            Instalar
          </button>
          
          <button
            onClick={handleDismiss}
            className="px-3 py-2 text-sm text-sage-600 hover:bg-sage-100 rounded-xl transition-colors"
          >
            Depois
          </button>
        </div>
      </div>
    </div>
  );
}