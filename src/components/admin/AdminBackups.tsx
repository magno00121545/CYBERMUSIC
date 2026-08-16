import React, { useState, useEffect } from 'react';
import { Database, Download, RotateCcw, Plus, Check, RefreshCw, HardDrive } from 'lucide-react';
import { api } from '../../services/api.js';

export const AdminBackups: React.FC = () => {
  const [backups, setBackups] = useState<Array<{ filename: string; createdAt: string; size: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [restoringFilename, setRestoringFilename] = useState<string | null>(null);

  const fetchBackups = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAdminBackups();
      setBackups(data);
    } catch (err) {
      console.warn('Failed to load backups:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleCreateBackup = async () => {
    setIsCreating(true);
    try {
      await api.createAdminBackup();
      await fetchBackups();
    } catch (err: any) {
      alert(err.message || 'Erro ao criar backup');
    } finally {
      setIsCreating(false);
    }
  };

  const handleRestoreBackup = async (filename: string) => {
    if (!confirm(`ATENÇÃO: Restaurar o backup "${filename}" substituirá todos os dados atuais da base. Deseja continuar?`)) {
      return;
    }

    setRestoringFilename(filename);
    try {
      const res = await api.restoreAdminBackup(filename);
      alert(res.message || 'Backup restaurado com sucesso!');
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'Erro ao restaurar backup');
    } finally {
      setRestoringFilename(null);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black font-cyber text-white tracking-wider uppercase">
            Backups & Restauração da Nuvem
          </h2>
          <p className="text-xs text-[#888890] mt-1">
            Gere cópias de segurança instantâneas de pacotes, músicas, categorias, usuários e transações.
          </p>
        </div>

        <button
          onClick={handleCreateBackup}
          disabled={isCreating}
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-cyber font-black text-xs tracking-wider flex items-center gap-1.5 shadow-md shadow-cyan-500/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{isCreating ? 'GERANDO BACKUP...' : 'GERAR NOVO BACKUP'}</span>
        </button>
      </div>

      <div className="p-6 rounded-3xl bg-[#0c0c0e] border border-[#222226] space-y-4 shadow-xl">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-[#888890] animate-pulse">Carregando backups...</div>
        ) : backups.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#888890]">Nenhum backup criado ainda. Clique acima para gerar o primeiro.</div>
        ) : (
          <div className="space-y-2">
            {backups.map((b) => (
              <div
                key={b.filename}
                className="p-4 rounded-2xl bg-[#121215] border border-[#222226] flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-mono font-bold text-white">{b.filename}</p>
                    <p className="text-[11px] text-[#888890]">
                      {new Date(b.createdAt).toLocaleString('pt-BR')} • {formatSize(b.size)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleRestoreBackup(b.filename)}
                  disabled={restoringFilename === b.filename}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black border border-amber-500/40 text-xs font-cyber font-bold flex items-center gap-1.5 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{restoringFilename === b.filename ? 'RESTAURANDO...' : 'RESTAURAR'}</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
