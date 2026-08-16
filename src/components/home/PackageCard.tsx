import React from 'react';
import { motion } from 'motion/react';
import { 
  Play, Pause, Music, HardDrive, ShoppingCart, 
  Sparkles, Flame, Star, Tag, Eye
} from 'lucide-react';
import { Package } from '../../types/index.js';
import { useAudioPlayer } from '../../context/AudioPlayerContext.js';

interface PackageCardProps {
  pkg: Package;
  onOpenDetails: (pkg: Package) => void;
  onBuy: (pkg: Package) => void;
}

export const PackageCard: React.FC<PackageCardProps> = ({
  pkg,
  onOpenDetails,
  onBuy,
}) => {
  const { currentSong, isPlaying, playSong, togglePlay } = useAudioPlayer();

  const isCurrentPackagePlaying = isPlaying && currentSong?.package_id === pkg.id;

  const handlePlayPreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrentPackagePlaying) {
      togglePlay();
    } else {
      // Pick first song in package or generate synthetic preview
      const previewTrack = pkg.songs?.[0] || {
        id: `sng_preview_${pkg.id}`,
        package_id: pkg.id,
        title: `Prévia: ${pkg.title}`,
        artist: 'CYBER MUSIC PRO',
        duration_seconds: 30,
        file_path: '',
        file_size: 10 * 1024 * 1024,
        file_format: 'mp3',
        track_number: 1,
        created_at: pkg.created_at,
      };
      playSong(previewTrack, pkg);
    }
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return '750 MB';
    if (bytes >= 1024 * 1024 * 1024) {
      return `${((bytes ?? 0) / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    }
    return `${Math.round(bytes / (1024 * 1024))} MB`;
  };

  const hasDiscount = pkg.discount_price !== null && pkg.discount_price !== undefined && pkg.discount_price < pkg.price;
  const currentPrice = hasDiscount ? pkg.discount_price! : pkg.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group relative flex flex-col rounded-2xl bg-[#0e0e11] border border-[#1f1f24] hover:border-cyan-500/40 shadow-xl overflow-hidden transition-all duration-300"
    >
      {/* Cover Image Container */}
      <div 
        onClick={() => onOpenDetails(pkg)}
        className="relative aspect-video sm:aspect-square w-full overflow-hidden bg-[#070709] cursor-pointer"
      >
        <img
          src={pkg.cover_image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500'}
          alt={pkg.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e11] via-black/30 to-transparent opacity-80" />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
          {pkg.is_new && (
            <span className="px-2 py-0.5 rounded-md bg-cyan-500 text-black font-cyber font-bold text-[10px] tracking-wider uppercase shadow-md shadow-cyan-500/30 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              NOVO
            </span>
          )}
          {pkg.is_bestseller && (
            <span className="px-2 py-0.5 rounded-md bg-amber-500 text-black font-cyber font-bold text-[10px] tracking-wider uppercase shadow-md shadow-amber-500/30 flex items-center gap-1">
              <Flame className="w-2.5 h-2.5" />
              TOP VENDAS
            </span>
          )}
          {pkg.is_featured && (
            <span className="px-2 py-0.5 rounded-md bg-fuchsia-600 text-white font-cyber font-bold text-[10px] tracking-wider uppercase shadow-md flex items-center gap-1">
              <Star className="w-2.5 h-2.5 fill-current" />
              DESTAQUE
            </span>
          )}
        </div>

        {/* Play Preview Floating Button */}
        <button
          onClick={handlePlayPreview}
          className={`absolute bottom-3 right-3 w-11 h-11 rounded-full flex items-center justify-center transition-all z-10 shadow-lg ${
            isCurrentPackagePlaying
              ? 'bg-cyan-400 text-black shadow-cyan-500/50 scale-105'
              : 'bg-black/70 hover:bg-cyan-500 text-white hover:text-black border border-cyan-500/40 hover:border-cyan-400'
          }`}
          title="Ouvir Prévia"
        >
          {isCurrentPackagePlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </button>

        {/* Category Tag */}
        <div className="absolute bottom-3 left-3 z-10">
          <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-cyan-300 text-[10px] font-cyber font-semibold tracking-wider border border-cyan-500/20">
            {pkg.category_name || 'MÚSICA'}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        
        {/* Title & Description */}
        <div 
          onClick={() => onOpenDetails(pkg)}
          className="cursor-pointer"
        >
          <h3 className="font-cyber font-bold text-sm sm:text-base text-white group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug">
            {pkg.title}
          </h3>
          <p className="text-xs text-[#888890] mt-1 line-clamp-2 leading-relaxed">
            {pkg.description || 'Pacote de músicas em alta definição masterizadas para DJs e paredões.'}
          </p>
        </div>

        {/* Specs: Tracks count & File Size */}
        <div className="flex items-center gap-3 text-[11px] text-[#c0c0c5] py-1 border-y border-[#1f1f24] font-sans">
          <div className="flex items-center gap-1.5">
            <Music className="w-3.5 h-3.5 text-cyan-400" />
            <span>{pkg.total_tracks || 10} faixas</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
            <span>{formatSize(pkg.total_size)}</span>
          </div>
        </div>

        {/* Price & Buy Action */}
        <div className="flex items-center justify-between gap-2 pt-1">
          {/* Price Tag */}
          <div className="flex flex-col">
            {hasDiscount && (
              <span className="text-[11px] text-[#888890] line-through">
                R$ {(pkg.price ?? 0).toFixed(2)}
              </span>
            )}
            <div className="flex items-baseline gap-1">
              <span className="text-xs font-cyber text-emerald-400 font-bold">R$</span>
              <span className="text-lg sm:text-xl font-cyber font-black text-emerald-400 tracking-tight">
                {(currentPrice ?? 0).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onOpenDetails(pkg)}
              className="p-2 rounded-xl bg-[#16161c] hover:bg-[#202028] text-[#c0c0c5] hover:text-white border border-[#26262b] transition-colors"
              title="Ver detalhes e faixas"
            >
              <Eye className="w-4 h-4" />
            </button>

            <button
              onClick={() => onBuy(pkg)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-black font-cyber font-black text-xs tracking-wider flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20 active:scale-95"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>COMPRAR</span>
            </button>
          </div>
        </div>

      </div>

    </motion.div>
  );
};
