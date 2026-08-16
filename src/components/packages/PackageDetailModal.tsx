import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Play, Pause, Music, HardDrive, ShoppingCart, 
  Sparkles, Flame, ShieldCheck, CheckCircle2, FileAudio, Clock, Download
} from 'lucide-react';
import { Package, Song } from '../../types/index.js';
import { useAudioPlayer } from '../../context/AudioPlayerContext.js';
import { api } from '../../services/api.js';

interface PackageDetailModalProps {
  pkg: Package | null;
  onClose: () => void;
  onBuy: (pkg: Package) => void;
}

export const PackageDetailModal: React.FC<PackageDetailModalProps> = ({
  pkg,
  onClose,
  onBuy,
}) => {
  const { currentSong, isPlaying, playSong, togglePlay } = useAudioPlayer();
  const [detailedPkg, setDetailedPkg] = useState<Package | null>(pkg);
  const [isLoadingSongs, setIsLoadingSongs] = useState(false);

  useEffect(() => {
    if (pkg) {
      setDetailedPkg(pkg);
      setIsLoadingSongs(true);
      api.getPackageDetails(pkg.id)
        .then((data) => {
          setDetailedPkg(data);
          setIsLoadingSongs(false);
        })
        .catch(() => {
          setDetailedPkg(pkg);
          setIsLoadingSongs(false);
        });
    } else {
      setDetailedPkg(null);
    }
  }, [pkg]);

  if (!pkg) return null;
  const activePkg = detailedPkg || pkg;

  const formatSize = (bytes: number) => {
    if (!bytes) return '850 MB';
    if (bytes >= 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    }
    return `${Math.round(bytes / (1024 * 1024))} MB`;
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '3:20';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const songs = activePkg.songs || [];
  const hasDiscount = activePkg.discount_price !== null && activePkg.discount_price !== undefined && activePkg.discount_price < activePkg.price;
  const currentPrice = hasDiscount ? activePkg.discount_price! : activePkg.price;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-3xl max-h-[90vh] bg-[#0c0c0e] border border-[#222226] rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10 my-auto"
        >
          {/* Header Bar */}
          <div className="p-4 sm:p-5 border-b border-[#1f1f24] flex items-center justify-between bg-[#070709]">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-[10px] font-cyber font-bold uppercase tracking-wider">
                {activePkg.category_name || 'MÚSICA'}
              </span>
              <span className="text-xs text-[#888890] font-cyber">
                ID: {activePkg.id}
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-[#888890] hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Scrollable Content */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
            
            {/* Top Banner Info */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
              
              {/* Cover Art */}
              <div className="sm:col-span-4 aspect-square rounded-2xl overflow-hidden border border-cyan-500/30 bg-[#121215] shadow-xl relative group">
                <img
                  src={activePkg.cover_image}
                  alt={activePkg.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Title & Info */}
              <div className="sm:col-span-8 space-y-3">
                <h2 className="text-xl sm:text-2xl font-black font-cyber text-white leading-tight">
                  {activePkg.title}
                </h2>

                <p className="text-xs sm:text-sm text-[#a0a0a5] leading-relaxed">
                  {activePkg.description || 'Pacote profissional com faixas completas em altíssima qualidade de estúdio.'}
                </p>

                {/* Specs Box */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div className="p-2.5 rounded-xl bg-[#121215] border border-[#222226] text-center">
                    <span className="text-[10px] text-[#888890] block font-cyber">TOTAL FAIXAS</span>
                    <span className="text-sm font-bold text-white font-cyber">{songs.length || activePkg.total_tracks} Músicas</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#121215] border border-[#222226] text-center">
                    <span className="text-[10px] text-[#888890] block font-cyber">TAMANHO</span>
                    <span className="text-sm font-bold text-indigo-300 font-cyber">{formatSize(activePkg.total_size)}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#121215] border border-[#222226] text-center">
                    <span className="text-[10px] text-[#888890] block font-cyber">FORMATO</span>
                    <span className="text-sm font-bold text-cyan-300 font-cyber">MP3 320k / WAV</span>
                  </div>
                </div>

              </div>

            </div>

            {/* Track Listing Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#1f1f24] pb-2">
                <div className="flex items-center gap-2">
                  <Music className="w-4 h-4 text-cyan-400" />
                  <h3 className="font-cyber font-bold text-sm text-white uppercase tracking-wider">
                    Faixas Inclusas no Pacote ({songs.length})
                  </h3>
                </div>
                <span className="text-[11px] text-[#888890]">Clique no play para ouvir prévia de 30s</span>
              </div>

              {isLoadingSongs && songs.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#888890] animate-pulse">
                  Carregando lista de faixas do servidor...
                </div>
              ) : songs.length === 0 ? (
                <div className="p-6 rounded-xl bg-[#121215] border border-[#222226] text-center text-xs text-[#888890]">
                  Faixas sendo indexadas pelo produtor. Todas as músicas serão baixadas no pacote.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                  {songs.map((song, idx) => {
                    const isTrackPlaying = isPlaying && currentSong?.id === song.id;

                    return (
                      <div
                        key={song.id || idx}
                        onClick={() => playSong(song, activePkg)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                          isTrackPlaying
                            ? 'bg-cyan-950/40 border-cyan-500/50 text-white cyber-glow-sm'
                            : 'bg-[#121215] border-[#222226] hover:bg-[#18181f] hover:border-[#33333a] text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Play Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isTrackPlaying) togglePlay();
                              else playSong(song, activePkg);
                            }}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                              isTrackPlaying
                                ? 'bg-cyan-400 text-black'
                                : 'bg-[#1a1a20] hover:bg-cyan-500 text-slate-300 hover:text-black'
                            }`}
                          >
                            {isTrackPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                          </button>

                          <span className="text-xs text-[#888890] font-mono w-5">
                            {String(song.track_number || idx + 1).padStart(2, '0')}
                          </span>

                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-white truncate font-cyber">
                              {song.title}
                            </p>
                            <p className="text-[10px] text-[#888890] truncate">
                              {song.artist || 'Cyber Music'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-[#888890] shrink-0">
                          <span className="px-1.5 py-0.5 rounded bg-[#1a1a20] text-[10px] font-cyber text-cyan-300 uppercase">
                            {song.file_format || 'MP3'}
                          </span>
                          <span className="font-mono text-[11px] hidden xs:inline">
                            {formatDuration(song.duration_seconds)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Security Guarantee Box */}
            <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300">
                <p className="font-semibold text-emerald-300 font-cyber uppercase tracking-wider">
                  Garantia de Download Imediato
                </p>
                <p className="mt-0.5 text-[11px] text-[#888890]">
                  Após pagar via PIX, a liberação ocorre em segundos pelo webhook do servidor. Você poderá baixar faixa por faixa ou o pacote completo em arquivo .ZIP em alta velocidade.
                </p>
              </div>
            </div>

          </div>

          {/* Footer Action Bar */}
          <div className="p-4 sm:p-5 border-t border-[#1f1f24] bg-[#070709] flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] text-[#888890] font-cyber block">VALOR TOTAL DO PACOTE</span>
              <div className="flex items-baseline gap-1.5">
                {hasDiscount && (
                  <span className="text-xs text-[#888890] line-through">
                    R$ {activePkg.price.toFixed(2)}
                  </span>
                )}
                <span className="text-xl sm:text-2xl font-black font-cyber text-emerald-400">
                  R$ {currentPrice.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onBuy(activePkg);
              }}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-black font-black font-cyber text-sm tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/25 active:scale-95 cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>COMPRAR AGORA VIA PIX</span>
            </button>
          </div>

        </motion.div>

      </div>
    </AnimatePresence>
  );
};
