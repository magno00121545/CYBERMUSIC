import React, { useState, useEffect } from 'react';
import { 
  Download, Music, HardDrive, Calendar, ChevronDown, ChevronUp, 
  ExternalLink, Sparkles, CheckCircle2, ShoppingBag, ArrowLeft, RefreshCw, FileArchive
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import { Package, Song } from '../../types/index.js';
import { useAudioPlayer } from '../../context/AudioPlayerContext.js';

interface MyPurchasesViewProps {
  onBackToCatalog: () => void;
}

export const MyPurchasesView: React.FC<MyPurchasesViewProps> = ({ onBackToCatalog }) => {
  const { user } = useAuth();
  const { playSong } = useAudioPlayer();

  const [purchases, setPurchases] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [expandedPackageId, setExpandedPackageId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const fetchPurchases = async () => {
    setIsLoading(true);
    try {
      const data = await api.getUserPurchases();
      setPurchases(data);
    } catch (err) {
      console.warn('Failed to load purchases:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, [user]);

  const handleDownloadZip = async (pkgId: string) => {
    setDownloadingId(`zip_${pkgId}`);
    try {
      const res = await api.generateDownloadToken(pkgId);
      window.location.href = res.downloadUrl;
    } catch (err: any) {
      alert(`Erro ao gerar download do pacote: ${err.message}`);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDownloadSingleSong = async (pkgId: string, songId: string) => {
    setDownloadingId(`song_${songId}`);
    try {
      const res = await api.generateDownloadToken(pkgId, songId);
      window.location.href = res.downloadUrl;
    } catch (err: any) {
      alert(`Erro ao gerar download da faixa: ${err.message}`);
    } finally {
      setDownloadingId(null);
    }
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return '850 MB';
    if (bytes >= 1024 * 1024 * 1024) {
      return `${((bytes ?? 0) / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    }
    return `${Math.round((bytes ?? 0) / (1024 * 1024))} MB`;
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222226] pb-6">
        <div>
          <button
            onClick={onBackToCatalog}
            className="flex items-center gap-1.5 text-xs text-[#888890] hover:text-cyan-400 font-cyber mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            VOLTAR AO CATÁLOGO
          </button>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-cyan-400" />
            <h1 className="text-xl sm:text-2xl font-black font-cyber text-white tracking-wider uppercase">
              Minhas Compras & Downloads
            </h1>
          </div>
          <p className="text-xs text-[#888890] mt-1">
            Seus pacotes adquiridos com downloads ilimitados protegidos por token de segurança.
          </p>
        </div>

        <button
          onClick={fetchPurchases}
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-[#121215] border border-[#222226] text-xs font-cyber font-bold text-[#888890] hover:text-cyan-400 hover:border-cyan-500/40 flex items-center gap-2 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          ATUALIZAR
        </button>
      </div>

      {/* Purchases List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-36 rounded-2xl bg-[#0c0c0e] border border-[#222226] animate-pulse" />
          ))}
        </div>
      ) : purchases.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-[#0c0c0e] border border-[#222226] p-8 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#16161c] flex items-center justify-center mx-auto text-[#888890] border border-[#26262b]">
            <ShoppingBag className="w-8 h-8 text-[#888890]" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="font-cyber font-bold text-white text-base">Você ainda não comprou nenhum pacote</h3>
            <p className="text-xs text-[#888890]">
              Navegue pelo catálogo, selecione seus pacotes favoritos e pague via PIX para liberar seus downloads instantaneamente.
            </p>
          </div>
          <button
            onClick={onBackToCatalog}
            className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-cyber font-black text-xs tracking-wider transition-all shadow-lg shadow-cyan-500/25 active:scale-95"
          >
            EXPLORAR CATÁLOGO AGORA
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {purchases.map((purchase) => {
            if (!purchase || !purchase.package) return null;
            const pkg: Package = purchase.package;
            const songs: Song[] = pkg?.songs || [];
            const isExpanded = pkg && expandedPackageId === pkg.id;

            return (
              <div
                key={purchase.order_id || pkg.id}
                className="rounded-3xl bg-[#0c0c0e] border border-[#222226] hover:border-[#33333b] transition-all shadow-xl overflow-hidden"
              >
                {/* Package Main Row */}
                <div className="p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  {/* Left: Thumbnail & Title */}
                  <div className="flex items-start sm:items-center gap-4 min-w-0">
                    <img
                      src={pkg.cover_image}
                      alt={pkg.title}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-cyan-500/30 shrink-0"
                    />
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-cyber font-bold uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          ACESSO LIBERADO
                        </span>
                        <span className="text-[11px] text-[#888890] font-mono">
                          Pedido #{purchase.order_number}
                        </span>
                      </div>

                      <h3 className="font-cyber font-bold text-base sm:text-lg text-white truncate">
                        {pkg.title}
                      </h3>

                      <div className="flex items-center gap-3 text-xs text-[#888890]">
                        <span>{pkg.category_name}</span>
                        <span>•</span>
                        <span>{pkg.total_tracks} Faixas</span>
                        <span>•</span>
                        <span>{formatSize(pkg.total_size)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#222226]">
                    
                    {/* Expand Tracks Toggle */}
                    <button
                      onClick={() => setExpandedPackageId(isExpanded ? null : pkg.id)}
                      className="px-3.5 py-2.5 rounded-xl bg-[#121215] hover:bg-[#1a1a20] text-xs font-cyber font-bold text-slate-300 flex items-center gap-1.5 border border-[#222226] transition-all"
                    >
                      <Music className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{isExpanded ? 'OCULTAR FAIXAS' : 'VER FAIXAS'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {/* Download Full ZIP Button */}
                    <button
                      onClick={() => handleDownloadZip(pkg.id)}
                      disabled={downloadingId === `zip_${pkg.id}`}
                      className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-cyber font-black text-xs tracking-wider flex items-center gap-2 transition-all shadow-md shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
                    >
                      <FileArchive className="w-4 h-4" />
                      <span>
                        {downloadingId === `zip_${pkg.id}` ? 'GERANDO LINK...' : 'BAIXAR PACOTE (.ZIP)'}
                      </span>
                    </button>

                  </div>

                </div>

                {/* Expandable Track List */}
                {isExpanded && (
                  <div className="bg-[#070709] border-t border-[#1f1f24] p-4 sm:p-6 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-[#1f1f24]">
                      <span className="text-xs font-cyber font-bold uppercase tracking-wider text-cyan-400">
                        Faixas Individuais para Download ({songs.length})
                      </span>
                      <span className="text-[11px] text-[#888890]">Downloads diretos em 320kbps</span>
                    </div>

                    <div className="space-y-1.5">
                      {songs.map((song, idx) => (
                        <div
                          key={song.id || idx}
                          className="p-2.5 rounded-xl bg-[#121215] border border-[#222226] flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="font-mono text-[#888890] w-5">
                              {String(song.track_number || idx + 1).padStart(2, '0')}
                            </span>
                            <div className="min-w-0">
                              <p className="font-cyber font-semibold text-white truncate">{song.title}</p>
                              <p className="text-[10px] text-[#888890] truncate">{song.artist}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="px-1.5 py-0.5 rounded bg-[#16161c] border border-[#26262b] text-[10px] text-cyan-300 font-cyber">
                              {song.file_format?.toUpperCase() || 'MP3'}
                            </span>
                            <button
                              onClick={() => handleDownloadSingleSong(pkg.id, song.id)}
                              disabled={downloadingId === `song_${song.id}`}
                              className="p-1.5 px-2.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-black font-cyber font-bold text-[11px] flex items-center gap-1 transition-all"
                              title="Baixar esta música"
                            >
                              <Download className="w-3 h-3" />
                              <span>{downloadingId === `song_${song.id}` ? 'BAIXANDO...' : 'BAIXAR'}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
