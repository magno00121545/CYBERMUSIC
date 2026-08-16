import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Upload, Music, Trash2, Edit2, Check, FileAudio, AlertCircle, Sparkles 
} from 'lucide-react';
import { Package, Song } from '../../types/index.js';
import { api } from '../../services/api.js';

interface AdminAudioUploadModalProps {
  pkg: Package | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export const AdminAudioUploadModal: React.FC<AdminAudioUploadModalProps> = ({
  pkg,
  isOpen,
  onClose,
  onUpdated,
}) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [editingSongId, setEditingSongId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editArtist, setEditArtist] = useState('');

  const fetchPackageDetails = async () => {
    if (!pkg) return;
    try {
      const data = await api.getPackageDetails(pkg.id);
      setSongs(data.songs || []);
    } catch {}
  };

  useEffect(() => {
    if (pkg && isOpen) {
      fetchPackageDetails();
    }
  }, [pkg, isOpen]);

  if (!isOpen || !pkg) return null;

  const handleAudioFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(`Enviando ${files.length} arquivo(s) de áudio...`);

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('audioFiles', files[i]);
    }

    try {
      const res = await api.uploadPackageSongs(pkg.id, formData);
      setUploadProgress('');
      await fetchPackageDetails();
      onUpdated();
    } catch (err: any) {
      alert(`Erro ao enviar áudios: ${err.message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress('');
    }
  };

  const handleStartEdit = (song: Song) => {
    setEditingSongId(song.id);
    setEditTitle(song.title);
    setEditArtist(song.artist || '');
  };

  const handleSaveEdit = async (songId: string) => {
    try {
      await api.updateSong(songId, { title: editTitle, artist: editArtist });
      setEditingSongId(null);
      await fetchPackageDetails();
      onUpdated();
    } catch (err: any) {
      alert(err.message || 'Erro ao editar música');
    }
  };

  const handleDeleteSong = async (songId: string) => {
    if (!confirm('Deseja realmente remover esta faixa do pacote?')) return;
    try {
      await api.deleteSong(songId);
      await fetchPackageDetails();
      onUpdated();
    } catch (err: any) {
      alert(err.message || 'Erro ao deletar faixa');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-3xl bg-[#0c0c0e] border border-cyan-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10 my-auto"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#1f1f24] flex items-center justify-between bg-[#070709]">
            <div className="flex items-center gap-2">
              <Music className="w-5 h-5 text-cyan-400" />
              <div>
                <h3 className="font-cyber font-bold text-base text-white">
                  GERENCIAR MÚSICAS DO PACOTE
                </h3>
                <p className="text-xs text-[#888890] truncate max-w-sm">
                  {pkg.title} ({songs.length} faixas cadastradas)
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-[#888890] hover:text-white hover:bg-[#16161c]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            
            {/* Upload Area */}
            <div className="p-6 rounded-2xl border-2 border-dashed border-cyan-500/30 hover:border-cyan-400 bg-[#070709] transition-all text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center mx-auto border border-cyan-500/30">
                <Upload className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-cyber font-bold text-white">
                  {isUploading ? uploadProgress : 'SELECIONE OU ARRASTE ARQUIVOS DE ÁUDIO'}
                </p>
                <p className="text-xs text-[#888890]">
                  Formatos suportados: MP3, WAV, FLAC, M4A, OGG. Múltiplos arquivos permitidos.
                </p>
              </div>
              <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-cyber font-bold text-xs tracking-wider cursor-pointer shadow-md shadow-cyan-500/30 transition-all">
                <Music className="w-4 h-4" />
                <span>{isUploading ? 'PROCESSANDO...' : 'PROCURAR ARQUIVOS NO DISCO'}</span>
                <input
                  type="file"
                  multiple
                  accept="audio/*,.mp3,.wav,.flac,.m4a"
                  onChange={handleAudioFilesUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            </div>

            {/* Current Song List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-[#1f1f24] pb-2">
                <span className="text-xs font-cyber font-bold uppercase tracking-wider text-slate-300">
                  Faixas Cadastradas ({songs.length})
                </span>
                <span className="text-[11px] text-[#888890]">
                  Clique no ícone de lápis para editar nome/artista
                </span>
              </div>

              {songs.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#888890] rounded-xl bg-[#121215] border border-[#222226]">
                  Nenhuma faixa enviada ainda para este pacote. Faça o upload acima.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-72 overflow-y-auto">
                  {songs.map((song, idx) => (
                    <div
                      key={song.id}
                      className="p-3 rounded-xl bg-[#121215] border border-[#222226] flex items-center justify-between gap-3 text-xs"
                    >
                      {editingSongId === song.id ? (
                        <div className="flex-1 flex gap-2 items-center">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder="Título da música"
                            className="flex-1 bg-[#070709] border border-cyan-500 rounded-lg px-2.5 py-1.5 text-xs text-white"
                          />
                          <input
                            type="text"
                            value={editArtist}
                            onChange={(e) => setEditArtist(e.target.value)}
                            placeholder="Artista"
                            className="w-36 bg-[#070709] border border-cyan-500 rounded-lg px-2.5 py-1.5 text-xs text-white"
                          />
                          <button
                            onClick={() => handleSaveEdit(song.id)}
                            className="p-1.5 rounded bg-emerald-500 text-black"
                            title="Salvar"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingSongId(null)}
                            className="p-1.5 rounded bg-[#16161c] text-[#888890] border border-[#26262b]"
                            title="Cancelar"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="font-mono text-[#888890] w-5">
                              {String(song.track_number || idx + 1).padStart(2, '0')}
                            </span>
                            <div className="min-w-0">
                              <p className="font-cyber font-semibold text-white truncate">{song.title}</p>
                              <p className="text-[10px] text-[#888890] truncate">{song.artist || 'Cyber Music'}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="px-1.5 py-0.5 rounded bg-[#16161c] border border-[#26262b] text-[10px] text-cyan-400 font-cyber">
                              {song.file_format?.toUpperCase() || 'MP3'}
                            </span>
                            <button
                              onClick={() => handleStartEdit(song)}
                              className="p-1.5 text-[#888890] hover:text-cyan-400 hover:bg-[#16161c] rounded-lg"
                              title="Editar título e artista"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteSong(song.id)}
                              className="p-1.5 text-[#888890] hover:text-rose-400 hover:bg-rose-950/40 rounded-lg"
                              title="Remover faixa"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[#1f1f24] bg-[#070709] flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-cyber font-bold text-xs"
            >
              CONCLUIR E FECHAR
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
