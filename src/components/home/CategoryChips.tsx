import React from 'react';
import { 
  Flame, Music, Radio, Disc, Heart, Globe, Layers, Sparkles, Filter 
} from 'lucide-react';
import { Category } from '../../types/index.js';

interface CategoryChipsProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

const getCategoryIcon = (slugOrIcon?: string) => {
  const str = slugOrIcon?.toLowerCase() || '';
  if (str.includes('funk') || str.includes('flame')) return Flame;
  if (str.includes('forro') || str.includes('piseiro')) return Music;
  if (str.includes('eletronica') || str.includes('edm') || str.includes('radio')) return Radio;
  if (str.includes('flashback') || str.includes('disc')) return Disc;
  if (str.includes('gospel') || str.includes('heart') || str.includes('worship')) return Heart;
  if (str.includes('internacional') || str.includes('globe') || str.includes('pop')) return Globe;
  if (str.includes('mix') || str.includes('layers')) return Layers;
  if (str.includes('sertanejo')) return Music;
  return Sparkles;
};

export const CategoryChips: React.FC<CategoryChipsProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="py-4">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs sm:text-sm font-cyber font-bold tracking-wider text-white uppercase">
            Categorias & Estilos
          </h3>
        </div>
        <span className="text-[11px] text-slate-400 font-cyber">
          {categories.length} Gêneros Disponíveis
        </span>
      </div>

      {/* Horizontal Scrollable Categories */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
        {/* All Categories Button */}
        <button
          type="button"
          onClick={() => onSelectCategory('all')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-cyber font-bold tracking-wider whitespace-nowrap transition-all border shrink-0 cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-cyan-500 text-black border-cyan-400 shadow-md shadow-cyan-500/30 font-black'
              : 'bg-[#0e0e11] text-[#c0c0c5] border-[#222226] hover:border-[#33333a] hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>TODOS OS PACOTES</span>
        </button>

        {/* Dynamic Category Chips */}
        {categories.map((cat) => {
          if (!cat) return null;
          const Icon = getCategoryIcon(cat.slug || cat.icon);
          const isSelected = selectedCategory === cat.id || selectedCategory === cat.slug;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(isSelected ? 'all' : cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-cyber font-bold tracking-wider whitespace-nowrap transition-all border shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-cyan-500 text-black border-cyan-400 shadow-md shadow-cyan-500/30 font-black scale-105'
                  : 'bg-[#0e0e11] text-[#c0c0c5] border-[#222226] hover:border-cyan-500/40 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.name.toUpperCase()}</span>
              {cat.packages_count !== undefined && cat.packages_count > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                    isSelected ? 'bg-black text-cyan-300' : 'bg-[#18181f] text-cyan-400 border border-[#26262f]'
                  }`}
                >
                  {cat.packages_count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
