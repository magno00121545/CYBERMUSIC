import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, Sparkles, Image as ImageIcon, DollarSign, Tag, Check } from 'lucide-react';
import { Package, Category } from '../../types/index.js';
import { api } from '../../services/api.js';

interface AdminPackageFormModalProps {
  pkg: Package | null;
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const AdminPackageFormModal: React.FC<AdminPackageFormModalProps> = ({
  pkg,
  categories,
  isOpen,
  onClose,
  onSaved,
}) => {
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('19.90');
  const [discountPrice, setDiscountPrice] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestseller, setIsBestseller] = useState(false);
  const [isNew, setIsNew] = useState(true);
  const [isActive, setIsActive] = useState(true);

  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (pkg) {
      setTitle(pkg.title);
      setCategoryId(pkg.category_id);
      setDescription(pkg.description || '');
      setPrice(pkg.price.toString());
      setDiscountPrice(pkg.discount_price !== null && pkg.discount_price !== undefined ? pkg.discount_price.toString() : '');
      setCoverImage(pkg.cover_image);
      setIsFeatured(pkg.is_featured);
      setIsBestseller(pkg.is_bestseller);
      setIsNew(pkg.is_new);
      setIsActive(pkg.is_active);
    } else {
      setTitle('');
      setCategoryId(categories[0]?.id || '');
      setDescription('');
      setPrice('19.90');
      setDiscountPrice('');
      setCoverImage('https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=700&auto=format&fit=crop&q=80');
      setIsFeatured(false);
      setIsBestseller(false);
      setIsNew(true);
      setIsActive(true);
    }
  }, [pkg, categories, isOpen]);

  if (!isOpen) return null;

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    const formData = new FormData();
    formData.append('cover', file);

    try {
      const res = await api.uploadCoverImage(formData);
      setCoverImage(res.url);
    } catch (err: any) {
      alert(`Erro no upload da capa: ${err.message}`);
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !categoryId || !price) {
      setErrorMessage('Preencha os campos obrigatórios (Título, Categoria e Preço)');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');

    const payload: Partial<Package> = {
      title,
      category_id: categoryId,
      description,
      price: parseFloat(price) || 0,
      discount_price: discountPrice ? parseFloat(discountPrice) : null,
      cover_image: coverImage,
      is_featured: isFeatured,
      is_bestseller: isBestseller,
      is_new: isNew,
      is_active: isActive,
    };

    try {
      if (pkg) {
        await api.updateAdminPackage(pkg.id, payload);
      } else {
        await api.createAdminPackage(payload);
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao salvar pacote');
    } finally {
      setIsSaving(false);
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
          className="relative w-full max-w-2xl bg-[#0c0c0e] border border-cyan-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10 my-auto"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#1f1f24] flex items-center justify-between bg-[#070709]">
            <h3 className="font-cyber font-bold text-base text-white tracking-wider">
              {pkg ? 'EDITAR PACOTE DE MÚSICAS' : 'NOVO PACOTE DE MÚSICAS'}
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-[#888890] hover:text-white hover:bg-[#16161c]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
            
            {/* Title & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-cyber font-semibold mb-1">
                  Título do Pacote *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: MEGA PACK FUNK 2026 VIP"
                  className="w-full bg-[#070709] border border-[#222226] rounded-xl px-3.5 py-2 text-white placeholder-[#55555c] focus:outline-none focus:border-cyan-400 font-cyber"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-cyber font-semibold mb-1">
                  Categoria *
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-[#070709] border border-[#222226] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyan-400 font-cyber cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-slate-300 font-cyber font-semibold mb-1">
                Descrição do Pacote
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalhes sobre faixas, BPM, estilos inclusos..."
                className="w-full bg-[#070709] border border-[#222226] rounded-xl p-3 text-white placeholder-[#55555c] focus:outline-none focus:border-cyan-400 font-sans"
              />
            </div>

            {/* Prices */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-cyber font-semibold mb-1">
                  Preço Normal (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="19.90"
                  className="w-full bg-[#070709] border border-[#222226] rounded-xl px-3.5 py-2 text-white font-cyber placeholder-[#55555c] focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-cyber font-semibold mb-1">
                  Preço Promocional (R$) <span className="text-[#888890]">(Opcional)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={discountPrice}
                  onChange={(e) => setDiscountPrice(e.target.value)}
                  placeholder="14.90"
                  className="w-full bg-[#070709] border border-[#222226] rounded-xl px-3.5 py-2 text-emerald-400 font-cyber placeholder-[#55555c] focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            {/* Cover Image Upload & URL */}
            <div className="space-y-2">
              <label className="block text-slate-300 font-cyber font-semibold">
                Imagem da Capa
              </label>
              <div className="flex gap-3 items-center">
                <div className="w-16 h-16 rounded-xl bg-[#121215] border border-[#222226] overflow-hidden shrink-0">
                  <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 space-y-1.5">
                  <input
                    type="text"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="URL da imagem (ou envie um arquivo)"
                    className="w-full bg-[#070709] border border-[#222226] rounded-xl px-3 py-1.5 text-xs text-white placeholder-[#55555c] focus:outline-none focus:border-cyan-400 font-mono"
                  />
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#16161c] hover:bg-[#202028] text-cyan-300 font-cyber cursor-pointer text-[11px] border border-[#26262b] transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploadingCover ? 'ENVIANDO...' : 'FAZER UPLOAD DE ARQUIVO'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverUpload}
                      disabled={isUploadingCover}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Flags / Checkboxes */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-[#121215] border border-[#222226] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded text-cyan-500 focus:ring-cyan-400 bg-[#070709]"
                />
                <span className="font-cyber font-semibold text-white">DESTAQUE</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-[#121215] border border-[#222226] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBestseller}
                  onChange={(e) => setIsBestseller(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-400 bg-[#070709]"
                />
                <span className="font-cyber font-semibold text-white">MAIS VENDIDO</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-[#121215] border border-[#222226] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isNew}
                  onChange={(e) => setIsNew(e.target.checked)}
                  className="rounded text-cyan-500 focus:ring-cyan-400 bg-[#070709]"
                />
                <span className="font-cyber font-semibold text-white">NOVIDADE</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-[#121215] border border-[#222226] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-emerald-500 focus:ring-emerald-400 bg-[#070709]"
                />
                <span className="font-cyber font-semibold text-white">PUBLICADO</span>
              </label>
            </div>

            {errorMessage && <p className="text-xs text-rose-400">{errorMessage}</p>}

            {/* Actions */}
            <div className="pt-3 border-t border-[#1f1f24] flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-[#16161c] hover:bg-[#202028] text-[#888890] hover:text-white font-cyber font-bold border border-[#26262b] transition-colors"
              >
                CANCELAR
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-cyber font-black tracking-wider transition-all shadow-md shadow-cyan-500/25"
              >
                {isSaving ? 'SALVANDO...' : pkg ? 'ATUALIZAR PACOTE' : 'PUBLICAR PACOTE'}
              </button>
            </div>

          </form>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
