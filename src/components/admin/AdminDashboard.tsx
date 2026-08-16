import React, { useState, useEffect } from 'react';
import { 
  DollarSign, ShoppingBag, Users, Download, 
  TrendingUp, Clock, CheckCircle2, AlertCircle, RefreshCw, Zap
} from 'lucide-react';
import { DashboardStats, Order, Package } from '../../types/index.js';
import { api } from '../../services/api.js';

interface AdminDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [approvingOrderId, setApprovingOrderId] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [statsData, ordersData] = await Promise.all([
        api.getAdminStats(),
        api.getAdminOrders(),
      ]);
      setStats(statsData);
      setRecentOrders(ordersData.slice(0, 6));
    } catch (err) {
      console.warn('Failed to load admin stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleManualApprove = async (orderId: string) => {
    setApprovingOrderId(orderId);
    try {
      await api.approveOrderManual(orderId);
      await fetchDashboardData();
    } catch (err: any) {
      alert(err.message || 'Erro ao aprovar pedido');
    } finally {
      setApprovingOrderId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black font-cyber text-white tracking-wider uppercase">
            Visão Geral da Plataforma
          </h2>
          <p className="text-xs text-[#888890] mt-1">
            Métricas de faturamento, pedidos PIX em tempo real e atividade recente.
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-[#121215] border border-[#222226] text-xs font-cyber font-bold text-[#888890] hover:text-cyan-400 flex items-center gap-2 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          ATUALIZAR DADOS
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Faturamento Total */}
        <div className="p-5 rounded-2xl bg-[#0c0c0e] border border-emerald-500/30 shadow-xl space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-cyber font-bold text-[#888890] uppercase tracking-wider">
              FATURAMENTO TOTAL PIX
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-cyber text-emerald-400">
            R$ {stats?.totalRevenue?.toFixed(2) || '0.00'}
          </div>
          <div className="text-[11px] text-[#888890]">
            Hoje: <strong className="text-white font-cyber">R$ {stats?.todayRevenue?.toFixed(2) || '0.00'}</strong>
          </div>
        </div>

        {/* Card 2: Vendas Aprovadas */}
        <div className="p-5 rounded-2xl bg-[#0c0c0e] border border-cyan-500/30 shadow-xl space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-cyber font-bold text-[#888890] uppercase tracking-wider">
              VENDAS APROVADAS
            </span>
            <div className="p-2 rounded-lg bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-cyber text-cyan-400">
            {stats?.paidOrders || 0}
          </div>
          <div className="text-[11px] text-[#888890]">
            Aguardando PIX: <strong className="text-amber-400 font-cyber">{stats?.pendingOrders || 0}</strong>
          </div>
        </div>

        {/* Card 3: Usuários Cadastrados */}
        <div className="p-5 rounded-2xl bg-[#0c0c0e] border border-indigo-500/30 shadow-xl space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-cyber font-bold text-[#888890] uppercase tracking-wider">
              CLIENTES & DJS
            </span>
            <div className="p-2 rounded-lg bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-cyber text-indigo-300">
            {stats?.totalUsers || 0}
          </div>
          <div className="text-[11px] text-[#888890]">
            Pacotes no Ar: <strong className="text-white font-cyber">{stats?.totalPackages || 0}</strong>
          </div>
        </div>

        {/* Card 4: Downloads Realizados */}
        <div className="p-5 rounded-2xl bg-[#0c0c0e] border border-fuchsia-500/30 shadow-xl space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-cyber font-bold text-[#888890] uppercase tracking-wider">
              DOWNLOADS EFETUADOS
            </span>
            <div className="p-2 rounded-lg bg-fuchsia-500/15 text-fuchsia-400 border border-fuchsia-500/30">
              <Download className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-cyber text-fuchsia-300">
            {stats?.totalDownloads || 0}
          </div>
          <div className="text-[11px] text-[#888890]">
            Taxa de Conversão: <strong className="text-emerald-400 font-cyber">100% Automática</strong>
          </div>
        </div>

      </div>

      {/* Grid: Recent Orders & Top Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recent Orders Table */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-[#0c0c0e] border border-[#222226] space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#1f1f24] pb-3">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-cyan-400" />
              <h3 className="font-cyber font-bold text-sm text-white uppercase tracking-wider">
                Últimos Pedidos & Pagamentos PIX
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs font-cyber text-cyan-400 hover:underline"
            >
              Ver Todos ({recentOrders.length}) →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[10px] font-cyber text-[#888890] uppercase border-b border-[#1f1f24]">
                <tr>
                  <th className="py-2 px-3">Pedido</th>
                  <th className="py-2 px-3">Cliente</th>
                  <th className="py-2 px-3">Pacote</th>
                  <th className="py-2 px-3">Valor</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f1f24]">
                {recentOrders.filter(Boolean).map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#121215]">
                    <td className="py-3 px-3 font-mono font-bold text-[#c0c0c5]">#{ord.order_number}</td>
                    <td className="py-3 px-3">
                      <p className="font-semibold text-white truncate max-w-[120px]">{ord.user_name}</p>
                      <p className="text-[10px] text-[#888890] truncate max-w-[120px]">{ord.user_email}</p>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-300 truncate max-w-[160px]">{ord.package_title}</td>
                    <td className="py-3 px-3 font-cyber text-emerald-400 font-bold">R$ {(ord.final_amount ?? 0).toFixed(2)}</td>
                    <td className="py-3 px-3">
                      {ord.status === 'PAID' ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-cyber font-bold">
                          APROVADO
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-cyber font-bold">
                          PENDENTE
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {ord.status === 'PENDING' && (
                        <button
                          onClick={() => handleManualApprove(ord.id)}
                          disabled={approvingOrderId === ord.id}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-cyber font-bold text-[10px] uppercase shadow-sm transition-all"
                        >
                          {approvingOrderId === ord.id ? '...' : 'Aprovar'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Bestsellers */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-[#0c0c0e] border border-[#222226] space-y-4 shadow-xl">
          <div className="flex items-center gap-2 border-b border-[#1f1f24] pb-3">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <h3 className="font-cyber font-bold text-sm text-white uppercase tracking-wider">
              Top Pacotes Mais Vendidos
            </h3>
          </div>

          <div className="space-y-3">
            {stats?.bestsellers?.map((pkg, idx) => (
              <div
                key={pkg.id}
                className="p-3 rounded-2xl bg-[#121215] border border-[#222226] flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-amber-500/15 text-amber-300 font-cyber font-bold flex items-center justify-center text-[10px] shrink-0">
                    {idx + 1}
                  </span>
                  <img src={pkg.cover_image} alt="" className="w-9 h-9 rounded-lg object-cover" />
                  <div className="min-w-0">
                    <p className="font-cyber font-semibold text-white truncate">{pkg.title}</p>
                    <p className="text-[10px] text-[#888890]">{pkg.sales_count || 0} vendas realizadas</p>
                  </div>
                </div>
                <span className="font-cyber font-bold text-emerald-400 shrink-0">
                  R$ {(pkg.discount_price ?? pkg.price ?? 0).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
