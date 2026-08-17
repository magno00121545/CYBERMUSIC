import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, CheckCircle2, Clock, RefreshCw, Zap } from 'lucide-react';
import { Order } from '../../types/index.js';
import { api } from '../../services/api.js';

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'PENDING'>('ALL');
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAdminOrders();
      setOrders(data);
    } catch (err) {
      console.warn('Failed to load orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleManualApprove = async (orderId: string) => {
    setApprovingId(orderId);
    try {
      await api.approveOrderManual(orderId);
      await fetchOrders();
    } catch (err: any) {
      alert(err.message || 'Erro ao aprovar pedido');
    } finally {
      setApprovingId(null);
    }
  };

  const filtered = orders.filter((o) => {
    const matchesSearch =
      o.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.package_title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black font-cyber text-white tracking-wider uppercase">
            Pedidos & Transações PIX
          </h2>
          <p className="text-xs text-[#888890] mt-1">
            Acompanhe pedidos gerados, pagamentos aprovados e realize aprovação manual de suporte.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-[#121215] border border-[#222226] text-xs font-cyber font-bold text-[#888890] hover:text-cyan-400 flex items-center gap-2 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          ATUALIZAR PEDIDOS
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#666670] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por #pedido, cliente, e-mail ou pacote..."
            className="w-full bg-[#0c0c0e] border border-[#222226] rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-[#55555c] focus:outline-none focus:border-cyan-400 font-sans"
          />
        </div>

        <div className="flex items-center bg-[#0c0c0e] p-1 rounded-xl border border-[#222226]">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-cyber font-bold transition-all ${
              statusFilter === 'ALL' ? 'bg-cyan-500 text-black shadow-sm' : 'text-[#888890] hover:text-white'
            }`}
          >
            TODOS ({orders.length})
          </button>
          <button
            onClick={() => setStatusFilter('PAID')}
            className={`px-3 py-1.5 rounded-lg text-xs font-cyber font-bold transition-all ${
              statusFilter === 'PAID' ? 'bg-emerald-500 text-black shadow-sm' : 'text-[#888890] hover:text-white'
            }`}
          >
            PAGOS ({orders.filter(o => o.status === 'PAID').length})
          </button>
          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-cyber font-bold transition-all ${
              statusFilter === 'PENDING' ? 'bg-amber-500 text-black shadow-sm' : 'text-[#888890] hover:text-white'
            }`}
          >
            PENDENTES ({orders.filter(o => o.status === 'PENDING').length})
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="p-6 rounded-3xl bg-[#0c0c0e] border border-[#222226] space-y-4 shadow-xl">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-[#888890] animate-pulse">Carregando pedidos...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#888890]">Nenhum pedido encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[10px] font-cyber text-[#888890] uppercase border-b border-[#1f1f24]">
                <tr>
                  <th className="py-2.5 px-3">Pedido</th>
                  <th className="py-2.5 px-3">Cliente</th>
                  <th className="py-2.5 px-3">Pacote Adquirido</th>
                  <th className="py-2.5 px-3">Data</th>
                  <th className="py-2.5 px-3">Valor Total</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Ação Suporte</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f1f24]">
                {filtered.map((ord) => ord && (
                  <tr key={ord.id} className="hover:bg-[#121215]">
                    <td className="py-3 px-3 font-mono font-bold text-[#c0c0c5]">#{ord.order_number}</td>
                    <td className="py-3 px-3">
                      <p className="font-semibold text-white truncate max-w-[140px]">{ord.user_name}</p>
                      <p className="text-[10px] text-[#888890] truncate max-w-[140px]">{ord.user_email}</p>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-300 truncate max-w-[180px]">{ord.package_title}</td>
                    <td className="py-3 px-3 text-[#888890] font-mono">
                      {new Date(ord.created_at).toLocaleString('pt-BR')}
                    </td>
                    <td className="py-3 px-3 font-cyber text-emerald-400 font-bold">
                      R$ {(ord.final_amount ?? 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-3">
                      {ord.status === 'PAID' ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-cyber font-bold">
                          APROVADO
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-cyber font-bold">
                          AGUARDANDO PIX
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {ord.status === 'PENDING' ? (
                        <button
                          onClick={() => handleManualApprove(ord.id)}
                          disabled={approvingId === ord.id}
                          className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-cyber font-bold text-[11px] uppercase shadow-sm transition-all"
                        >
                          {approvingId === ord.id ? 'Aprovando...' : 'Aprovar Manual'}
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-400 font-cyber font-semibold">Liberado ✓</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
