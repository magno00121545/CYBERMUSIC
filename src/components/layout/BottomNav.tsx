import React from 'react';
import { Home, Layers, Search, Download, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

interface BottomNavProps {
  currentTab: 'home' | 'categories' | 'purchases' | 'profile' | 'admin';
  onSelectTab: (tab: 'home' | 'categories' | 'purchases' | 'profile' | 'admin') => void;
  onOpenSearchModal: () => void;
  onOpenAuth: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenSearchModal,
  onOpenAuth,
}) => {
  const { user, isStaff } = useAuth();

  const navItems = [
    { id: 'home', label: 'Início', icon: Home },
    { id: 'categories', label: 'Categorias', icon: Layers },
    { id: 'search', label: 'Buscar', icon: Search, isAction: true },
    { id: 'purchases', label: 'Compras', icon: Download, requiresAuth: true },
    { id: 'admin', label: 'Admin', icon: Shield },
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#050505]/95 backdrop-blur-lg border-t border-[#1f1f24] px-2 py-1.5 flex items-center justify-around">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentTab === item.id;

        const handleClick = () => {
          if (item.isAction) {
            onOpenSearchModal();
            return;
          }
          if (item.requiresAuth && !user) {
            onOpenAuth();
            return;
          }
          onSelectTab(item.id as any);
        };

        return (
          <button
            key={item.id}
            type="button"
            onClick={handleClick}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
              isActive
                ? 'text-cyan-400 font-bold'
                : 'text-[#888890] hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-lg ${isActive ? 'bg-cyan-500/15 shadow-sm shadow-cyan-500/30' : ''}`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-cyber tracking-wider mt-0.5">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
