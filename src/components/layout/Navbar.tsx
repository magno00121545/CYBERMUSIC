import React, { useState, useRef, useEffect } from 'react';
import { 
  Music, Search, Bell, ShoppingBag, User as UserIcon, 
  Shield, LogOut, Download, Sparkles, CheckCircle2, ChevronDown, Menu, X, ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useRealtime } from '../../context/RealtimeContext.js';
import { api } from '../../services/api.js';
import { AppNotification, Package } from '../../types/index.js';

interface NavbarProps {
  currentTab: 'home' | 'categories' | 'purchases' | 'profile' | 'admin';
  onSelectTab: (tab: 'home' | 'categories' | 'purchases' | 'profile' | 'admin') => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onOpenPackage: (pkg: Package) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenAuth,
  onOpenPackage,
  searchQuery,
  onSearchChange,
}) => {
  const { user, logout, isStaff, isAdmin } = useAuth();
  const { isConnected, notifications: liveNotifications } = useRealtime();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<{ packages: Package[]; songs: any[] }>({ packages: [], songs: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [dbNotifications, setDbNotifications] = useState<AppNotification[]>([]);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Fetch initial notifications
  useEffect(() => {
    if (user) {
      api.getUserNotifications().then(setDbNotifications).catch(() => {});
    }
  }, [user, liveNotifications]);

  // Combine live and saved notifications
  const allNotifications = [...liveNotifications, ...dbNotifications.filter(n => !liveNotifications.some(ln => ln.id === n.id))];
  const unreadCount = allNotifications.filter(n => !n.is_read).length;

  // Handle instant search
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        api.searchCatalog(searchQuery)
          .then(data => {
            setSearchResults({ packages: data.packages, songs: data.songs });
            setIsSearching(false);
          })
          .catch(() => setIsSearching(false));
      }, 250);
      return () => clearTimeout(timer);
    } else {
      setSearchResults({ packages: [], songs: [] });
      setIsSearching(false);
    }
  }, [searchQuery]);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-[#050505]/95 backdrop-blur-md border-b border-[#1f1f24]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div 
          onClick={() => onSelectTab('home')}
          className="flex items-center gap-2.5 cursor-pointer group select-none shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-fuchsia-500 p-[1.5px] shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
            <div className="w-full h-full bg-[#08080a] rounded-[10px] flex items-center justify-center">
              <Music className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-cyber font-black tracking-widest text-lg sm:text-xl text-white">
                CYBER<span className="text-cyan-400">MUSIC</span>
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.2 rounded text-[9px] font-cyber font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 uppercase">
                PRO 2026
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-[10px] text-[#888890] font-cyber tracking-wider">
                {isConnected ? '100% ONLINE / REAL-TIME' : 'CONECTANDO...'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Nav Links (Desktop) */}
        <div className="hidden lg:flex items-center gap-1">
          <button
            onClick={() => onSelectTab('home')}
            className={`px-3 py-1.5 rounded-xl text-xs font-cyber font-bold tracking-wider transition-all cursor-pointer ${
              currentTab === 'home'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                : 'text-[#a0a0a5] hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            CATÁLOGO
          </button>
          <button
            onClick={() => onSelectTab('categories')}
            className={`px-3 py-1.5 rounded-xl text-xs font-cyber font-bold tracking-wider transition-all cursor-pointer ${
              currentTab === 'categories'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                : 'text-[#a0a0a5] hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            GÊNEROS & PASTAS
          </button>
        </div>

        {/* Search Bar (Desktop & Tablet) */}
        <div ref={searchRef} className="relative flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-[#888890] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Buscar pacotes, faixas, artistas ou ritmos..."
              className="w-full bg-[#0e0e11] border border-[#26262b] rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-[#e0e0e0] placeholder-[#666670] focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40 transition-all font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#888890] hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Dropdown */}
          {isSearchOpen && (searchResults.packages.length > 0 || searchResults.songs.length > 0 || isSearching) && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#0c0c0f] border border-[#26262b] rounded-xl shadow-2xl p-3 max-h-96 overflow-y-auto z-50">
              {isSearching ? (
                <div className="p-4 text-center text-xs text-[#888890]">Buscando no servidor...</div>
              ) : (
                <div className="space-y-3">
                  {searchResults.packages.length > 0 && (
                    <div>
                      <div className="text-[11px] font-cyber uppercase tracking-wider text-cyan-400 font-semibold px-2 mb-1.5">
                        Pacotes Encontrados ({searchResults.packages.length})
                      </div>
                      <div className="space-y-1">
                        {searchResults.packages.map(pkg => pkg && (
                          <div
                            key={pkg.id}
                            onClick={() => {
                              onOpenPackage(pkg);
                              setIsSearchOpen(false);
                            }}
                            className="p-2 rounded-lg hover:bg-[#16161c] cursor-pointer flex items-center gap-3 transition-colors"
                          >
                            <img src={pkg.cover_image} alt="" className="w-9 h-9 rounded object-cover border border-[#26262b]" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-white truncate">{pkg.title}</p>
                              <p className="text-[11px] text-[#888890]">{pkg.category_name} • {pkg.total_tracks} faixas</p>
                            </div>
                            <span className="text-xs font-bold text-emerald-400 font-cyber">
                              R$ {(pkg.discount_price ?? pkg.price ?? 0).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.songs.length > 0 && (
                    <div>
                      <div className="text-[11px] font-cyber uppercase tracking-wider text-[#888890] font-semibold px-2 mb-1.5">
                        Músicas Individuais ({searchResults.songs.length})
                      </div>
                      <div className="space-y-1">
                        {searchResults.songs.map(song => song && (
                          <div
                            key={song.id}
                            className="p-2 rounded-lg hover:bg-[#16161c] flex items-center justify-between text-xs"
                          >
                            <div className="min-w-0 pr-2">
                              <p className="font-semibold text-slate-200 truncate">{song.title}</p>
                              <p className="text-[10px] text-[#888890] truncate">{song.artist} • No pacote: {song.package_title}</p>
                            </div>
                            <span className="px-1.5 py-0.5 rounded bg-[#16161c] border border-[#26262b] text-[10px] text-cyan-400 font-cyber">
                              {song.file_format?.toUpperCase()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Minhas Compras Button */}
          {user && (
            <button
              onClick={() => onSelectTab('purchases')}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                currentTab === 'purchases'
                  ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/50'
                  : 'bg-[#0e0e11] text-[#c0c0c5] border-[#222226] hover:border-[#33333a] hover:text-white'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-cyan-400" />
              <span>Minhas Compras</span>
            </button>
          )}

          {/* Notifications Bell */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-2 rounded-xl bg-[#0e0e11] border border-[#222226] text-[#a0a0a5] hover:text-white hover:border-[#33333a] transition-colors relative"
              title="Notificações"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white font-bold text-[9px] rounded-full flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-[#0c0c0f] border border-[#26262b] rounded-2xl shadow-2xl p-3 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-[#1f1f24] mb-2">
                  <span className="font-cyber font-bold text-xs uppercase tracking-wider text-cyan-400">
                    Notificações
                  </span>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => api.markAllNotificationsRead().then(() => setDbNotifications(prev => prev.map(n => ({ ...n, is_read: true }))))}
                      className="text-[11px] text-[#888890] hover:text-cyan-400"
                    >
                      Marcar lidas
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {allNotifications.length === 0 ? (
                    <p className="text-xs text-[#888890] text-center py-4">Nenhuma notificação no momento.</p>
                  ) : (
                    allNotifications.filter(Boolean).map((n) => (
                      <div
                        key={n.id}
                        className={`p-2.5 rounded-xl border text-xs ${
                          n.is_read ? 'bg-[#121216] border-[#222226] text-[#a0a0a5]' : 'bg-cyan-950/20 border-cyan-500/30 text-white'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-semibold text-cyan-300 mb-0.5">
                          <Sparkles className="w-3 h-3" />
                          <span>{n.title}</span>
                        </div>
                        <p className="text-[11px] text-[#888890] leading-snug">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Account Area - Disabled */}
          <div className="hidden" />

        </div>
      </div>
    </header>
  );
};
