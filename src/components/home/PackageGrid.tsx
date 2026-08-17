import React, { useState } from 'react';
import { Package } from '../../types/index.js';
import { PackageCard } from './PackageCard.js';
import { Sparkles, Flame, Star, Zap, ArrowUpDown, Music2, RefreshCw } from 'lucide-react';

interface PackageGridProps {
  packages: Package[];
  isLoading: boolean;
  onOpenDetails: (pkg: Package) => void;
  onBuy: (pkg: Package) => void;
  onRefresh: () => void;
}

export const PackageGrid: React.FC<PackageGridProps> = ({
  packages,
  isLoading,
  onOpenDetails,
  onBuy,
  onRefresh,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'bestseller' | 'featured' | 'new'>('all');
  const [sortBy, setSortBy] = useState<'default' | 'price_asc' | 'price_desc' | 'tracks'>('default');

  // Filter packages
  let filtered = [...packages];

  if (activeFilter === 'bestseller') {
    filtered = filtered.filter(p => p.is_bestseller);
  } else if (activeFilter === 'featured') {
    filtered = filtered.filter(p => p.is_featured);
  } else if (activeFilter === 'new') {
    filtered = filtered.filter(p => p.is_new);
  }

  // Sort packages
  if (sortBy === 'price_asc') {
    filtered.sort((a, b) => (a.discount_price || a.price) - (b.discount_price || b.price));
  } else if (sortBy === 'price_desc') {
    filtered.sort((a, b) => (b.discount_price || b.price) - (a.discount_price || a.price));
  } else if (sortBy === 'tracks') {
    filtered.sort((a, b) => (b.total_tracks || 0) - (a.total_tracks || 0));
  }

  return (
    <div id="pacotes" className="py-6 space-y-6">
      
      {/* Section Header & Sub-Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f1f24] pb-4">
        
        {/* Title */}
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <h2 className="font-cyber font-black text-lg sm:text-xl text-white tracking-wider uppercase">
              Catálogo de Pacotes & Pastas
            </h2>
          </div>
          <p className="text-xs text-[#888890] mt-0.5">
            Exibindo {filtered.length} pacotes disponíveis com download imediato pós-PIX
          </p>
        </div>

        {/* Filters and Sorting Controls */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Quick Filter Buttons */}
          <div className="flex items-center bg-[#0e0e11] p-1 rounded-xl border border-[#222226] gap-1">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-cyber font-bold transition-all cursor-pointer ${
                activeFilter === 'all' ? 'bg-cyan-500 text-black shadow-sm font-black' : 'text-[#888890] hover:text-white'
              }`}
            >
              TODOS
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('featured')}
              className={`px-2.5 py-1 rounded-lg text-xs font-cyber font-bold transition-all flex items-center gap-1 cursor-pointer ${
                activeFilter === 'featured' ? 'bg-cyan-500 text-black shadow-sm font-black' : 'text-[#888890] hover:text-white'
              }`}
            >
              <Star className="w-3 h-3 text-amber-300 fill-amber-300" />
              DESTAQUES
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('bestseller')}
              className={`px-2.5 py-1 rounded-lg text-xs font-cyber font-bold transition-all flex items-center gap-1 cursor-pointer ${
                activeFilter === 'bestseller' ? 'bg-amber-500 text-black shadow-sm font-black' : 'text-[#888890] hover:text-white'
              }`}
            >
              <Flame className="w-3 h-3" />
              MAIS VENDIDOS
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('new')}
              className={`px-2.5 py-1 rounded-lg text-xs font-cyber font-bold transition-all flex items-center gap-1 cursor-pointer ${
                activeFilter === 'new' ? 'bg-fuchsia-500 text-black shadow-sm font-black' : 'text-[#888890] hover:text-white'
              }`}
            >
              <Zap className="w-3 h-3" />
              NOVIDADES
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#0e0e11] border border-[#222226] text-xs text-[#e0e0e0] font-cyber font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="default">ORDENAÇÃO PADRÃO</option>
              <option value="price_asc">MENOR PREÇO</option>
              <option value="price_desc">MAIOR PREÇO</option>
              <option value="tracks">+ MÚSICAS</option>
            </select>
          </div>

          {/* Manual Refresh */}
          <button
            onClick={onRefresh}
            className="p-1.5 rounded-xl bg-[#0e0e11] border border-[#222226] text-[#888890] hover:text-cyan-400 transition-colors"
            title="Atualizar lista do servidor"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

        </div>

      </div>

      {/* Grid Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-2xl bg-[#0e0e11] border border-[#1f1f24] h-80 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-[#0e0e11] border border-[#1f1f24] p-6 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#16161c] flex items-center justify-center mx-auto text-[#666670]">
            <Music2 className="w-6 h-6" />
          </div>
          <h3 className="font-cyber font-bold text-white text-base">Nenhum pacote encontrado</h3>
          <p className="text-xs text-[#888890] max-w-sm mx-auto">
            Não encontramos nenhum pacote nesta categoria ou com estes filtros.
          </p>
          <button
            onClick={() => {
              setActiveFilter('all');
              setSortBy('default');
            }}
            className="px-4 py-2 rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-cyber font-bold hover:bg-cyan-500/20 transition-all"
          >
            LIMPAR FILTROS
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((pkg) => pkg && (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              onOpenDetails={onOpenDetails}
              onBuy={onBuy}
            />
          ))}
        </div>
      )}

    </div>
  );
};
