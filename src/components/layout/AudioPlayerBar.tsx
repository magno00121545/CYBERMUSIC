import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, Volume2, VolumeX, X, ShoppingCart, Music2 } from 'lucide-react';
import { useAudioPlayer } from '../../context/AudioPlayerContext.js';

interface AudioPlayerBarProps {
  onOpenCheckout?: (pkg: any) => void;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({ onOpenCheckout }) => {
  const {
    currentSong,
    currentPackage,
    isPlaying,
    currentTime,
    duration,
    volume,
    togglePlay,
    seek,
    setVolume,
    stop,
  } = useAudioPlayer();

  if (!currentSong) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        className="fixed bottom-16 sm:bottom-0 left-0 right-0 z-40 bg-[#070709]/95 backdrop-blur-md border-t border-[#1f1f24] px-3 sm:px-6 py-2.5 shadow-2xl"
      >
        {/* Progress Bar (Clickable) */}
        <div
          className="absolute top-0 left-0 right-0 h-1 bg-[#1a1a20] cursor-pointer group"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            seek(pos * duration);
          }}
        >
          <div
            className="h-full bg-cyan-400 group-hover:bg-cyan-300 relative transition-all"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow-md" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-6">
          {/* Track Info & Visualizer */}
          <div className="flex items-center gap-3 min-w-0 flex-1 sm:flex-initial sm:w-72">
            <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-cyan-500/30 bg-[#121215] flex items-center justify-center">
              {currentPackage?.cover_image ? (
                <img
                  src={currentPackage.cover_image}
                  alt={currentSong.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Music2 className="w-5 h-5 text-cyan-400" />
              )}
              {isPlaying && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-0.5">
                  <div className="w-1 bg-cyan-400 h-3 animate-pulse" />
                  <div className="w-1 bg-cyan-400 h-5 animate-pulse delay-75" />
                  <div className="w-1 bg-cyan-400 h-2 animate-pulse delay-150" />
                </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-300 text-[10px] font-cyber uppercase tracking-wider">
                  Prévia 30s
                </span>
                <p className="text-xs sm:text-sm font-semibold text-white truncate font-cyber">
                  {currentSong.title}
                </p>
              </div>
              <p className="text-[11px] text-[#888890] truncate">
                {currentSong.artist || 'CYBER MUSIC'} • {currentPackage?.title || 'Pacote Digital'}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 sm:gap-5">
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-black flex items-center justify-center shadow-lg shadow-cyan-500/30 transition-all"
              title={isPlaying ? 'Pausar' : 'Reproduzir'}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>

            <div className="hidden md:flex items-center gap-2 text-xs text-[#888890] font-mono">
              <span>0:{String(Math.floor(currentTime)).padStart(2, '0')}</span>
              <span>/</span>
              <span>0:30</span>
            </div>
          </div>

          {/* Actions & Volume */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Volume Control */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => setVolume(volume > 0 ? 0 : 0.8)}
                className="text-[#888890] hover:text-cyan-400 transition-colors"
              >
                {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-16 h-1 bg-[#1f1f24] rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Buy Package Button */}
            {currentPackage && onOpenCheckout && (
              <button
                onClick={() => onOpenCheckout(currentPackage)}
                className="hidden xs:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black font-semibold text-xs font-cyber tracking-wider transition-all shadow-md shadow-emerald-500/20"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>COMPRAR</span>
                <span className="ml-1 bg-black/20 px-1 rounded text-[11px]">
                  R$ {(currentPackage.discount_price ?? currentPackage.price ?? 0).toFixed(2)}
                </span>
              </button>
            )}

            <button
              onClick={stop}
              className="p-1.5 rounded-lg text-[#888890] hover:text-white hover:bg-white/10 transition-colors"
              title="Fechar reprodutor"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
