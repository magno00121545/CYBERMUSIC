import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Layers, Check, X, RefreshCw } from 'lucide-react';
import { Category } from '../../types/index.js';
import { api } from '../../services/api.js';

export const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create / Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [icon, setIcon] = useState('music');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const data = await api.getCategories(true);
      setCategories(data);
    } catch (err) {
      console.warn('Failed to load categories:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setIcon('music');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setIcon(cat.icon || 'music');
    setDescription(cat.description || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setIsSaving(true);
    const generatedSlug = slug.trim() || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    try {
      if (editingCategory) {
        await api.updateAdminCategory(editingCategory.id, { name, slug: generatedSlug, icon, description });
      } else {
        await api.createAdminCategory({ name, slug: generatedSlug, icon, description });
      }
      setIsModalOpen(false);
      await fetchCategories();
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar categoria');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (catId: string) => {
    if (!confirm('Deseja realmente excluir esta categoria?')) return;
    try {
      await api.deleteAdminCategory(catId);
      await fetchCategories();
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir categoria');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black font-cyber text-white tracking-wider uppercase">
            Categorias & Estilos Musicais
          </h2>
          <p className="text-xs text-[#888890] mt-1">
            Crie novos gêneros para organizar os pacotes de músicas na plataforma.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-cyber font-black text-xs tracking-wider flex items-center gap-1.5 shadow-md shadow-cyan-500/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>NOVA CATEGORIA</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="p-5 rounded-2xl bg-[#0c0c0e] border border-[#222226] hover:border-[#33333a] transition-all flex flex-col justify-between space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-cyber text-cyan-400 font-bold uppercase">
                  SLUG: {cat.slug}
                </span>
                <h3 className="font-cyber font-bold text-base text-white mt-0.5">
                  {cat.name}
                </h3>
                <p className="text-xs text-[#888890] mt-1 line-clamp-2">
                  {cat.description || 'Sem descrição cadastrada.'}
                </p>
              </div>

              <span className="px-2 py-1 rounded-lg bg-[#121215] border border-[#222226] text-cyan-300 font-cyber font-bold text-xs">
                {cat.packages_count || 0} packs
              </span>
            </div>

            <div className="pt-3 border-t border-[#1f1f24] flex items-center justify-end gap-2">
              <button
                onClick={() => handleOpenEdit(cat)}
                className="p-1.5 rounded-lg bg-[#16161c] hover:bg-[#202028] text-slate-300 hover:text-white border border-[#26262b]"
                title="Editar"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(cat.id)}
                className="p-1.5 rounded-lg bg-rose-950/30 text-rose-400 hover:bg-rose-900/50 border border-rose-500/30"
                title="Excluir"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Create / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleSave}
            className="w-full max-w-md bg-[#0c0c0e] border border-cyan-500/40 rounded-3xl p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#1f1f24] pb-3">
              <h3 className="font-cyber font-bold text-base text-white">
                {editingCategory ? 'EDITAR CATEGORIA' : 'NOVA CATEGORIA'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#888890] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-cyber font-semibold mb-1">Nome *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Sertanejo Remix 2026"
                  className="w-full bg-[#070709] border border-[#222226] rounded-xl px-3.5 py-2 text-white placeholder-[#55555c] focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-cyber font-semibold mb-1">Slug (Identificador URL)</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="ex: sertanejo-remix"
                  className="w-full bg-[#070709] border border-[#222226] rounded-xl px-3.5 py-2 text-white placeholder-[#55555c] focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-cyber font-semibold mb-1">Descrição</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Breve descrição dos estilos contidos nesta categoria..."
                  className="w-full bg-[#070709] border border-[#222226] rounded-xl p-3 text-white placeholder-[#55555c] focus:outline-none focus:border-cyan-400 font-sans"
                />
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
                className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-cyber font-black tracking-wider transition-all"
              >
                {isSaving ? 'SALVANDO...' : 'SALVAR'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
