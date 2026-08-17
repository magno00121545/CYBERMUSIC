import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Check, X, RefreshCw } from 'lucide-react';
import { Coupon } from '../../types/index.js';
import { api } from '../../services/api.js';

export const AdminCoupons: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENT' | 'FIXED'>('PERCENT');
  const [discountValue, setDiscountValue] = useState('20');
  const [minOrderValue, setMinOrderValue] = useState('');
  const [maxUses, setMaxUses] = useState('100');
  const [isSaving, setIsSaving] = useState(false);

  const fetchCoupons = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAdminCoupons();
      setCoupons(data);
    } catch (err) {
      console.warn('Failed to load coupons:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !discountValue) return;

    setIsSaving(true);
    try {
      await api.createAdminCoupon({
        code: code.toUpperCase().trim(),
        discount_type: discountType,
        discount_value: parseFloat(discountValue),
        min_order_value: minOrderValue ? parseFloat(minOrderValue) : undefined,
        max_uses: maxUses ? parseInt(maxUses) : undefined,
        is_active: true,
      });
      setIsModalOpen(false);
      setCode('');
      await fetchCoupons();
    } catch (err: any) {
      alert(err.message || 'Erro ao criar cupom');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este cupom?')) return;
    try {
      await api.deleteAdminCoupon(id);
      await fetchCoupons();
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir cupom');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black font-cyber text-white tracking-wider uppercase">
            Cupons de Desconto
          </h2>
          <p className="text-xs text-[#888890] mt-1">
            Crie cupons promocionais em porcentagem ou valor fixo para alavancar vendas.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-cyber font-black text-xs tracking-wider flex items-center gap-1.5 shadow-md shadow-cyan-500/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>NOVO CUPOM</span>
        </button>
      </div>

      {/* Coupons Table */}
      <div className="p-6 rounded-3xl bg-[#0c0c0e] border border-[#222226] space-y-4 shadow-xl">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-[#888890] animate-pulse">Carregando cupons...</div>
        ) : coupons.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#888890]">Nenhum cupom ativo.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[10px] font-cyber text-[#888890] uppercase border-b border-[#1f1f24]">
                <tr>
                  <th className="py-2.5 px-3">Código</th>
                  <th className="py-2.5 px-3">Tipo</th>
                  <th className="py-2.5 px-3">Valor</th>
                  <th className="py-2.5 px-3">Usos / Limite</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f1f24]">
                {coupons.map((c) => c && (
                  <tr key={c.id} className="hover:bg-[#121215]">
                    <td className="py-3 px-3 font-cyber font-black text-cyan-300 text-sm">{c.code}</td>
                    <td className="py-3 px-3 font-mono text-slate-300">{c.discount_type === 'PERCENT' ? 'Porcentagem' : 'Valor Fixo'}</td>
                    <td className="py-3 px-3 font-cyber font-bold text-emerald-400">
                      {c.discount_type === 'PERCENT' ? `${c.discount_value}% OFF` : `R$ ${(c.discount_value ?? 0).toFixed(2)}`}
                    </td>
                    <td className="py-3 px-3 font-mono text-[#888890]">
                      {c.used_count || 0} / {c.max_uses || '∞'}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-cyber font-bold">
                        ATIVO
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-1.5 rounded-lg bg-rose-950/30 text-rose-400 hover:bg-rose-900/50 border border-rose-500/30"
                        title="Excluir Cupom"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleCreate}
            className="w-full max-w-md bg-[#0c0c0e] border border-cyan-500/40 rounded-3xl p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#1f1f24] pb-3">
              <h3 className="font-cyber font-bold text-base text-white">CRIAR CUPOM DE DESCONTO</h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-[#888890] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-cyber font-semibold mb-1">Código do Cupom *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="EX: PROMO2026"
                  className="w-full bg-[#070709] border border-[#222226] rounded-xl px-3.5 py-2 text-white font-cyber uppercase placeholder-[#55555c] focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-cyber font-semibold mb-1">Tipo de Desconto</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full bg-[#070709] border border-[#222226] rounded-xl px-3 py-2 text-white font-cyber focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    <option value="PERCENT">Porcentagem (%)</option>
                    <option value="FIXED">Valor Fixo (R$)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-cyber font-semibold mb-1">Valor do Desconto *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder="20"
                    className="w-full bg-[#070709] border border-[#222226] rounded-xl px-3.5 py-2 text-white font-cyber placeholder-[#55555c] focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-cyber font-semibold mb-1">Valor Mínimo (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-[#070709] border border-[#222226] rounded-xl px-3 py-2 text-white placeholder-[#55555c] focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-cyber font-semibold mb-1">Limite de Usos</label>
                  <input
                    type="number"
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                    placeholder="100"
                    className="w-full bg-[#070709] border border-[#222226] rounded-xl px-3 py-2 text-white placeholder-[#55555c] focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#16161c] hover:bg-[#202028] text-[#888890] hover:text-white text-xs font-cyber font-bold border border-[#26262b]"
              >
                CANCELAR
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-cyber font-black tracking-wider"
              >
                {isSaving ? 'SALVANDO...' : 'CRIAR CUPOM'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
