import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Music, Upload, Eye, 
  Sparkles, CheckCircle2, XCircle, RefreshCw, Layers
} from 'lucide-react';
import { Package, Category } from '../../types/index.js';
import { api } from '../../services/api.js';
import { AdminPackageFormModal } from './AdminPackageFormModal.js';
import { AdminAudioUploadModal } from './AdminAudioUploadModal.js';

export const AdminPackages: React.FC = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadPackage, setUploadPackage] = useState<Package | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [pkgsData, catsData] = await Promise.all([
        api.getAdminPackages(),
        api.getCategories(true),
      ]);
      setPackages(pkgsData);
      setCategories(catsData);
    } catch (err) {
      console.warn('Failed to load packages:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleActive = async (pkg: Package) => {
    try {
      await api.updateAdminPackage(pkg.id, { is_active: !pkg.is_active });
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Erro ao alterar status');
    }
  };

  const handleDelete = async (pkgId: string) => {
    if (!confirm('Deseja realmente excluir este pacote? Todos os arquivos associados serão removidos.')) return;
    try {
      await api.deleteAdminPackage(pkgId);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir pacote');
    }
  };

  // Filter packages
  const filtered = packages.filter(Boolean).filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'all' || p.category_id === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black font-cyber text-white tracking-wider uppercase">
            Gerenciador de Pacotes de Músicas
          </h2>
          <p className="text-xs text-[#888890] mt-1">
            Cadastre novos pacotes, edite capas, atualize preços e faça upload de faixas em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="p-2.5 rounded-xl bg-[#121215] border border-[#222226] text-[#888890] hover:text-cyan-400"
            title="Recarregar"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setEditingPackage(null);
              setIsFormOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-cyber font-black text-xs tracking-wider flex items-center gap-1.5 shadow-md shadow-cyan-500/25 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>NOVO PACOTE</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#666670] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por título ou descrição..."
            className="w-full bg-[#0c0c0e] border border-[#222226] rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-[#55555c] focus:outline-none focus:border-cyan-400 font-sans"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-[#0c0c0e] border border-[#222226] text-xs text-slate-300 font-cyber rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-400 cursor-pointer"
        >
          <option value="all">TODAS AS CATEGORIAS</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Packages Table / Grid */}
      <div className="p-6 rounded-3xl bg-[#0c0c0e] border border-[#222226] space-y-4 shadow-xl">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-[#888890] animate-pulse">Carregando pacotes...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#888890]">Nenhum pacote encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[10px] font-cyber text-[#888890] uppercase border-b border-[#1f1f24]">
                <tr>
                  <th className="py-2.5 px-3">Capa & Pacote</th>
                  <th className="py-2.5 px-3">Categoria</th>
                  <th className="py-2.5 px-3">Faixas</th>
                  <th className="py-2.5 px-3">Preço Normal</th>
                  <th className="py-2.5 px-3">Preço Promo</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f1f24]">
                {filtered.map((pkg) => (
                  <tr key={pkg.id} className="hover:bg-[#121215]">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={pkg.cover_image}
                          alt=""
                          className="w-12 h-12 rounded-xl object-cover border border-cyan-500/30 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-cyber font-bold text-white truncate max-w-[200px]">{pkg.title}</p>
                          <p className="text-[10px] text-[#888890] truncate max-w-[200px]">
                            {pkg.sales_count || 0} vendas • {pkg.views_count || 0} visualizações
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-cyber text-slate-300">{pkg.category_name}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-[#121215] border border-[#222226] text-cyan-300 font-cyber font-bold">
                        {pkg.total_tracks} faixas
                      </span>
                    </td>
                    <td className="py-3 px-3 font-cyber text-slate-300">R$ {pkg.price.toFixed(2)}</td>
                    <td className="py-3 px-3 font-cyber text-emerald-400 font-bold">
                      {pkg.discount_price ? `R$ ${pkg.discount_price.toFixed(2)}` : '-'}
                    </td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => handleToggleActive(pkg)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-cyber font-bold transition-colors ${
                          pkg.is_active
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        {pkg.is_active ? 'ATIVO' : 'PAUSADO'}
                      </button>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Audio Upload / Song Manager */}
                        <button
                          onClick={() => {
                            setUploadPackage(pkg);
                            setIsUploadOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-cyan-950/30 text-cyan-300 hover:bg-cyan-900/50 border border-cyan-500/30"
                          title="Gerenciar / Enviar Músicas"
                        >
                          <Music className="w-4 h-4" />
                        </button>

                        {/* Edit Package */}
                        <button
                          onClick={() => {
                            setEditingPackage(pkg);
                            setIsFormOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-[#16161c] hover:bg-[#202028] text-slate-300 hover:text-white border border-[#26262b]"
                          title="Editar Detalhes"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(pkg.id)}
                          className="p-1.5 rounded-lg bg-rose-950/30 text-rose-400 hover:bg-rose-900/50 border border-rose-500/30"
                          title="Excluir Pacote"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Package Form Modal */}
      <AdminPackageFormModal
        pkg={editingPackage}
        categories={categories}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingPackage(null);
        }}
        onSaved={fetchData}
      />

      {/* Audio Upload Modal */}
      <AdminAudioUploadModal
        pkg={uploadPackage}
        isOpen={isUploadOpen}
        onClose={() => {
          setIsUploadOpen(false);
          setUploadPackage(null);
        }}
        onUpdated={fetchData}
      />

    </div>
  );
};
