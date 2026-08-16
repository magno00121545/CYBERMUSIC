import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { AudioPlayerProvider } from './context/AudioPlayerContext.js';
import { RealtimeProvider, useRealtime } from './context/RealtimeContext.js';
import { api } from './services/api.js';
import { Category, Package } from './types/index.js';

// Layout Components
import { Navbar } from './components/layout/Navbar.js';
import { BottomNav } from './components/layout/BottomNav.js';
import { Footer } from './components/layout/Footer.js';
import { AudioPlayerBar } from './components/layout/AudioPlayerBar.js';
import { ToastBanner } from './components/common/ToastBanner.js';
import { PwaInstallPrompt } from './components/common/PwaInstallPrompt.js';

// Home & Catalog Components
import { HeroBanner } from './components/home/HeroBanner.js';
import { CategoryChips } from './components/home/CategoryChips.js';
import { PackageGrid } from './components/home/PackageGrid.js';
import { PackageDetailModal } from './components/packages/PackageDetailModal.js';
import { PixCheckoutModal } from './components/checkout/PixCheckoutModal.js';

// User & Auth Components
import { MyPurchasesView } from './components/user/MyPurchasesView.js';
import { UserProfileView } from './components/user/UserProfileView.js';
import { AuthModal } from './components/auth/AuthModal.js';

// Admin Portal
import { AdminLayout } from './components/admin/AdminLayout.js';

// Icons
import { Layers, Music, Search, X } from 'lucide-react';

const MainApp: React.FC = () => {
  const { user, isStaff } = useAuth();
  const { lastCatalogUpdate } = useRealtime();

  // Navigation State
  const [currentTab, setCurrentTab] = useState<'home' | 'categories' | 'purchases' | 'profile' | 'admin'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Catalog Data
  const [categories, setCategories] = useState<Category[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoadingPackages, setIsLoadingPackages] = useState<boolean>(true);

  // Modals
  const [detailPackage, setDetailPackage] = useState<Package | null>(null);
  const [checkoutPackage, setCheckoutPackage] = useState<Package | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState<boolean>(false);

  // Fetch Catalog Data
  const fetchCatalog = useCallback(async () => {
    setIsLoadingPackages(true);
    try {
      const [cats, pkgs] = await Promise.all([
        api.getCategories(),
        api.getPackages({
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          search: searchQuery.trim() || undefined,
        }),
      ]);
      setCategories(cats);
      setPackages(pkgs);
    } catch (err) {
      console.warn('Failed to load catalog:', err);
    } finally {
      setIsLoadingPackages(false);
    }
  }, [selectedCategory, searchQuery]);

  // Refetch when category, search, or real-time event updates
  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog, lastCatalogUpdate]);

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleBuy = (pkg: Package) => {
    setCheckoutPackage(pkg);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#e0e0e0] flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      
      {/* PWA Prompt */}
      <PwaInstallPrompt />

      {/* Real-time Toast Notifications */}
      <ToastBanner />

      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenAuth={handleOpenAuth}
        onOpenPackage={(pkg) => setDetailPackage(pkg)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-20">
        
        {/* TAB 1: HOME CATALOG */}
        {currentTab === 'home' && (
          <div>
            {/* Hero Showcase */}
            <HeroBanner
              onExplore={() => {
                const el = document.getElementById('pacotes');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* Category Chips Selector */}
            <CategoryChips
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={(catId) => setSelectedCategory(catId)}
            />

            {/* Package Grid */}
            <PackageGrid
              packages={packages}
              isLoading={isLoadingPackages}
              onOpenDetails={(pkg) => setDetailPackage(pkg)}
              onBuy={handleBuy}
              onRefresh={fetchCatalog}
            />
          </div>
        )}

        {/* TAB 2: CATEGORIES BROWSER */}
        {currentTab === 'categories' && (
          <div className="py-8 space-y-6">
            <div className="border-b border-[#222226] pb-4">
              <h2 className="font-cyber font-black text-xl sm:text-2xl text-white tracking-wider uppercase">
                Gêneros & Estilos Musicais
              </h2>
              <p className="text-xs text-[#a0a0a5] mt-1">
                Explore pastas organizadas por estilo musical e encontre o repertório perfeito para seu evento.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setCurrentTab('home');
                  }}
                  className="p-6 rounded-3xl bg-[#0e0e11] border border-[#222226] hover:border-cyan-500/50 hover:bg-[#131317] cursor-pointer transition-all duration-300 shadow-xl space-y-3 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 group-hover:scale-110 transition-transform">
                      <Layers className="w-6 h-6" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-[#050505] border border-[#222226] text-cyan-300 text-xs font-cyber font-bold">
                      {cat.packages_count || 0} Pacotes
                    </span>
                  </div>

                  <div>
                    <h3 className="font-cyber font-bold text-lg text-white group-hover:text-cyan-300 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-[#a0a0a5] mt-1 line-clamp-2">
                      {cat.description || 'Pacotes de alta fidelidade masterizados em 320kbps.'}
                    </p>
                  </div>

                  <div className="pt-2 text-xs font-cyber text-cyan-400 flex items-center gap-1">
                    <span>EXPLORAR GÊNERO →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: PURCHASES & DOWNLOADS */}
        {currentTab === 'purchases' && (
          <MyPurchasesView onBackToCatalog={() => setCurrentTab('home')} />
        )}

        {/* TAB 4: PROFILE */}
        {currentTab === 'profile' && (
          <UserProfileView
            onBackToCatalog={() => setCurrentTab('home')}
            onGoToPurchases={() => setCurrentTab('purchases')}
          />
        )}

        {/* TAB 5: ADMIN PORTAL */}
        {currentTab === 'admin' && (
          <AdminLayout onBackToApp={() => setCurrentTab('home')} />
        )}

      </main>

      {/* Floating Audio Player */}
      <AudioPlayerBar onOpenCheckout={(pkg) => handleBuy(pkg)} />

      {/* Footer */}
      <Footer
        onSelectCategory={(slug) => {
          setSelectedCategory(slug);
          setCurrentTab('home');
          const el = document.getElementById('pacotes');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenAdmin={() => setCurrentTab('admin')}
      />

      {/* Mobile Bottom Dock (Android PWA navigation) */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenSearchModal={() => setIsMobileSearchOpen(true)}
        onOpenAuth={() => handleOpenAuth('login')}
      />

      {/* MODAL 1: PACKAGE DETAIL */}
      <PackageDetailModal
        pkg={detailPackage}
        onClose={() => setDetailPackage(null)}
        onBuy={(pkg) => {
          setDetailPackage(null);
          handleBuy(pkg);
        }}
      />

      {/* MODAL 2: PIX CHECKOUT */}
      <PixCheckoutModal
        pkg={checkoutPackage}
        onClose={() => setCheckoutPackage(null)}
        onGoToPurchases={() => {
          setCheckoutPackage(null);
          setCurrentTab('purchases');
        }}
        onOpenAuth={() => {
          setCheckoutPackage(null);
          handleOpenAuth('login');
        }}
      />

      {/* MODAL 3: AUTH MODAL */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authMode}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* MODAL 4: MOBILE SEARCH OVERLAY */}
      {isMobileSearchOpen && (
        <div className="fixed inset-0 z-50 bg-[#050505]/98 p-4 flex flex-col backdrop-blur-md">
          <div className="flex items-center justify-between pb-3 border-b border-[#222226]">
            <h3 className="font-cyber font-bold text-sm text-white">Pesquisar Pacotes</h3>
            <button
              onClick={() => setIsMobileSearchOpen(false)}
              className="p-1 text-[#a0a0a5] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="pt-4 flex-1">
            <div className="relative">
              <Search className="w-4 h-4 text-[#a0a0a5] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nome da pasta, artista ou estilo..."
                className="w-full bg-[#0e0e11] border border-cyan-500/50 rounded-xl pl-10 pr-3 py-3 text-sm text-white focus:outline-none"
              />
            </div>
            <div className="mt-4">
              <button
                onClick={() => {
                  setCurrentTab('home');
                  setIsMobileSearchOpen(false);
                }}
                className="w-full py-3 rounded-xl bg-cyan-500 text-black font-cyber font-bold text-xs"
              >
                VER RESULTADOS
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AudioPlayerProvider>
        <RealtimeProvider>
          <MainApp />
        </RealtimeProvider>
      </AudioPlayerProvider>
    </AuthProvider>
  );
}
