import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, Check } from 'lucide-react';

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show install prompt if not dismissed recently
      const dismissed = localStorage.getItem('cyber_pwa_dismissed');
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert('Para instalar no Android/Chrome: clique nos três pontinhos ⋮ do navegador e selecione "Instalar aplicativo" ou "Adicionar à tela inicial".');
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('cyber_pwa_dismissed', 'true');
  };

  if (isInstalled || !showPrompt) return null;

  return (
    <div className="bg-[#0c0c0e] border-b border-[#222226] px-4 py-2.5 flex items-center justify-between gap-3 text-xs sm:text-sm">
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 rounded-lg bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
          <Smartphone className="w-4 h-4" />
        </div>
        <div>
          <span className="font-semibold text-white font-cyber tracking-wider">APP ANDROID / WEB:</span>{' '}
          <span className="text-[#888890]">Instale o CYBER MUSIC no seu celular para acesso rápido e downloads diretos!</span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleInstallClick}
          className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20 active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          Instalar App
        </button>
        <button
          onClick={handleDismiss}
          className="p-1 text-[#888890] hover:text-white transition-colors"
          title="Fechar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
