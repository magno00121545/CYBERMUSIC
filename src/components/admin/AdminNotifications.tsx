import React, { useState } from 'react';
import { Send, Bell, Sparkles, Check, Zap } from 'lucide-react';
import { api } from '../../services/api.js';

export const AdminNotifications: React.FC = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('PROMO');
  const [isSending, setIsSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;

    setIsSending(true);
    setSuccessMsg('');
    try {
      await api.broadcastNotification({ title, message, type });
      setSuccessMsg('Notificação transmitida em tempo real via SSE para todos os clientes conectados!');
      setTitle('');
      setMessage('');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      alert(err.message || 'Erro ao disparar notificação');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl sm:text-2xl font-black font-cyber text-white tracking-wider uppercase">
          Disparador de Notificações Globais (Push Real-Time)
        </h2>
        <p className="text-xs text-[#888890] mt-1">
          Envie avisos de novos lançamentos, promoções relâmpago e comunicados que surgem instantaneamente na tela dos usuários.
        </p>
      </div>

      <form onSubmit={handleBroadcast} className="p-6 rounded-3xl bg-[#0c0c0e] border border-[#222226] space-y-4 shadow-xl">
        <div className="flex items-center gap-2 pb-3 border-b border-[#1f1f24]">
          <Bell className="w-4 h-4 text-cyan-400" />
          <h3 className="font-cyber font-bold text-sm text-white uppercase tracking-wider">
            Nova Mensagem Transmitida
          </h3>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-300 font-cyber font-semibold mb-1">Título da Notificação *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: 🔥 SUPER LANÇAMENTO: MEGA PACK 2026 LIBERADO!"
              className="w-full bg-[#070709] border border-[#222226] rounded-xl px-3.5 py-2.5 text-white placeholder-[#55555c] focus:outline-none focus:border-cyan-400 font-cyber"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-cyber font-semibold mb-1">Tipo de Notificação</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-[#070709] border border-[#222226] rounded-xl px-3 py-2 text-white font-cyber focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="PROMO">PROMOÇÃO RELÂMPAGO / CUPOM</option>
              <option value="NEW_PACK">NOVO PACOTE PUBLICADO</option>
              <option value="INFO">COMUNICADO DO SISTEMA</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-cyber font-semibold mb-1">Mensagem Completa *</label>
            <textarea
              rows={3}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Use o cupom BEMVINDO20 agora e garanta 20% de desconto em qualquer pasta do catálogo..."
              className="w-full bg-[#070709] border border-[#222226] rounded-xl p-3 text-white placeholder-[#55555c] focus:outline-none focus:border-cyan-400 font-sans"
            />
          </div>
        </div>

        {successMsg && (
          <p className="text-xs text-emerald-400 bg-emerald-950/30 p-3 rounded-xl border border-emerald-500/30">
            {successMsg}
          </p>
        )}

        <button
          type="submit"
          disabled={isSending}
          className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-cyber font-black text-xs tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all"
        >
          <Send className="w-4 h-4" />
          <span>{isSending ? 'DISPARANDO NO SERVIDOR...' : 'TRANSMITIR NOTIFICAÇÃO REAL-TIME'}</span>
        </button>
      </form>
    </div>
  );
};
