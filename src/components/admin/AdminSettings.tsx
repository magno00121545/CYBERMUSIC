import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { Save, Phone } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const [whatsapp, setWhatsapp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const settings = await api.getAdminSettings();
        setWhatsapp(settings.support_whatsapp || '');
      } catch (err) {
        console.error('Erro ao carregar configurações:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.updateAdminSettings({ support_whatsapp: whatsapp });
      alert('Configurações salvas!');
    } catch (err) {
      alert('Erro ao salvar configurações.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="text-white">Carregando...</div>;

  return (
    <div className="p-6 rounded-3xl bg-[#0c0c0e] border border-[#222226] space-y-6 shadow-xl">
      <h3 className="font-cyber font-bold text-lg text-white">Configurações da Loja</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-cyber text-[#888890] mb-2">WhatsApp de Suporte/Pedidos</label>
          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-cyan-400" />
            <input
              type="text"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="(11) 99999-9999"
              className="flex-1 bg-[#121215] border border-[#222226] rounded-xl px-4 py-3 text-white focus:border-cyan-400 focus:outline-none"
            />
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full py-3 rounded-xl bg-cyan-500 text-black font-cyber font-bold uppercase tracking-wider hover:bg-cyan-400 transition-all flex items-center justify-center gap-2"
        >
          {isSaving ? 'Salvando...' : <><Save className="w-4 h-4" /> Salvar Configurações</>}
        </button>
      </div>
    </div>
  );
};
