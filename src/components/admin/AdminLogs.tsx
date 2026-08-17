import React, { useState, useEffect } from 'react';
import { Activity, RefreshCw, Clock, User, Shield } from 'lucide-react';
import { api } from '../../services/api.js';

export const AdminLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAdminLogs();
      setLogs(data);
    } catch (err) {
      console.warn('Failed to load logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black font-cyber text-white tracking-wider uppercase">
            Logs de Auditoria & Atividades
          </h2>
          <p className="text-xs text-[#888890] mt-1">
            Registro detalhado de alterações de preços, novos pacotes cadastrados, uploads e aprovações.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-[#121215] border border-[#222226] text-xs font-cyber font-bold text-[#888890] hover:text-cyan-400 flex items-center gap-2 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          ATUALIZAR LOGS
        </button>
      </div>

      <div className="p-6 rounded-3xl bg-[#0c0c0e] border border-[#222226] space-y-3 shadow-xl">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-[#888890] animate-pulse">Carregando logs...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#888890]">Nenhuma atividade registrada ainda.</div>
        ) : (
          <div className="space-y-2 max-h-[70vh] overflow-y-auto">
            {logs.map((log) => log && (
              <div
                key={log.id}
                className="p-3.5 rounded-xl bg-[#121215] border border-[#222226] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                    <Activity className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-cyber font-bold text-white uppercase text-[11px] mr-2">
                      {log.action}
                    </span>
                    <span className="text-slate-300">
                      {log.details ? JSON.stringify(log.details) : 'Ação concluída'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[#888890] text-[11px] font-mono shrink-0">
                  <span>{log.user_name || 'Sistema'}</span>
                  <span>•</span>
                  <span>{new Date(log.created_at).toLocaleString('pt-BR')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
