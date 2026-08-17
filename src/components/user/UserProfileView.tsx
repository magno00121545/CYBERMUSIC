import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, Lock, Phone, Mail, Shield, 
  ShoppingBag, LogOut, Check, ArrowLeft, RefreshCw, Key
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import { Order } from '../../types/index.js';

interface UserProfileViewProps {
  onBackToCatalog: () => void;
  onGoToPurchases: () => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  onBackToCatalog,
  onGoToPurchases,
}) => {
  const { user, logout, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrorMsg, setProfileErrorMsg] = useState('');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passSuccessMsg, setPassSuccessMsg] = useState('');
  const [passErrorMsg, setPassErrorMsg] = useState('');

  // Order history
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || '');
      setAvatar(user.avatar || '');

      setIsLoadingOrders(true);
      api.getUserOrders()
        .then(setOrders)
        .catch(() => {})
        .finally(() => setIsLoadingOrders(false));
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileSuccessMsg('');
    setProfileErrorMsg('');
    try {
      const res = await api.updateProfile({ name, phone, avatar });
      updateUser(res.user);
      setProfileSuccessMsg('Perfil atualizado com sucesso!');
      setTimeout(() => setProfileSuccessMsg(''), 4000);
    } catch (err: any) {
      setProfileErrorMsg(err.message || 'Erro ao atualizar perfil');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    setIsChangingPass(true);
    setPassSuccessMsg('');
    setPassErrorMsg('');
    try {
      const res = await api.changePassword({ currentPassword, newPassword });
      setPassSuccessMsg(res.message || 'Senha alterada com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setPassSuccessMsg(''), 4000);
    } catch (err: any) {
      setPassErrorMsg(err.message || 'Erro ao alterar senha');
    } finally {
      setIsChangingPass(false);
    }
  };

  if (!user) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-cyber font-bold uppercase">PAGO</span>;
      case 'PENDING':
        return <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-cyber font-bold uppercase">AGUARDANDO PIX</span>;
      case 'EXPIRED':
        return <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-cyber uppercase">EXPIRADO</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-cyber uppercase">{status}</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1f1f24] pb-6">
        <div>
          <button
            onClick={onBackToCatalog}
            className="flex items-center gap-1.5 text-xs text-[#888890] hover:text-cyan-400 font-cyber mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            VOLTAR AO CATÁLOGO
          </button>
          <h1 className="text-xl sm:text-2xl font-black font-cyber text-white tracking-wider uppercase">
            Meu Perfil & Configurações
          </h1>
          <p className="text-xs text-[#888890] mt-1">
            Gerencie seus dados pessoais, credenciais de acesso e histórico de pedidos.
          </p>
        </div>

        <button
          onClick={logout}
          className="px-3.5 py-2 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-400 hover:bg-rose-900/40 text-xs font-cyber font-bold flex items-center gap-1.5 transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>SAIR DA CONTA</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Profile Info Form */}
        <form onSubmit={handleUpdateProfile} className="p-6 rounded-3xl bg-[#0c0c0e] border border-[#222226] space-y-4 shadow-xl">
          <div className="flex items-center gap-2 pb-3 border-b border-[#1f1f24]">
            <UserIcon className="w-4 h-4 text-cyan-400" />
            <h3 className="font-cyber font-bold text-sm text-white uppercase tracking-wider">
              Dados do Usuário
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-cyber font-semibold mb-1">Nome Completo</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-[#070709] border border-[#222226] rounded-xl px-3.5 py-2.5 text-white placeholder-[#55555c] focus:outline-none focus:border-cyan-400 font-sans"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-cyber font-semibold mb-1">E-mail Cadastrado</label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full bg-[#121215] border border-[#222226] rounded-xl px-3.5 py-2.5 text-[#666670] cursor-not-allowed font-sans"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-cyber font-semibold mb-1">Telefone / WhatsApp</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 99999-9999"
                className="w-full bg-[#070709] border border-[#222226] rounded-xl px-3.5 py-2.5 text-white placeholder-[#55555c] focus:outline-none focus:border-cyan-400 font-sans"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-cyber font-semibold mb-1">Cargo / Permissão</label>
              <div className="p-2.5 rounded-xl bg-[#121215] border border-[#222226] flex items-center justify-between">
                <span className="font-cyber font-bold text-cyan-300 uppercase">{user.role}</span>
                <Shield className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
          </div>

          {profileSuccessMsg && <p className="text-xs text-emerald-400">{profileSuccessMsg}</p>}
          {profileErrorMsg && <p className="text-xs text-rose-400">{profileErrorMsg}</p>}

          <button
            type="submit"
            disabled={isUpdatingProfile}
            className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-cyber font-bold text-xs tracking-wider transition-all disabled:opacity-50"
          >
            {isUpdatingProfile ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
          </button>
        </form>

        {/* Change Password Form */}
        <form onSubmit={handleChangePassword} className="p-6 rounded-3xl bg-[#0c0c0e] border border-[#222226] space-y-4 shadow-xl">
          <div className="flex items-center gap-2 pb-3 border-b border-[#1f1f24]">
            <Key className="w-4 h-4 text-indigo-400" />
            <h3 className="font-cyber font-bold text-sm text-white uppercase tracking-wider">
              Segurança & Senha
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-cyber font-semibold mb-1">Senha Atual</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full bg-[#070709] border border-[#222226] rounded-xl px-3.5 py-2.5 text-white placeholder-[#55555c] focus:outline-none focus:border-indigo-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-cyber font-semibold mb-1">Nova Senha (Mínimo 6 dígitos)</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full bg-[#070709] border border-[#222226] rounded-xl px-3.5 py-2.5 text-white placeholder-[#55555c] focus:outline-none focus:border-indigo-400"
              />
            </div>
          </div>

          {passSuccessMsg && <p className="text-xs text-emerald-400">{passSuccessMsg}</p>}
          {passErrorMsg && <p className="text-xs text-rose-400">{passErrorMsg}</p>}

          <button
            type="submit"
            disabled={isChangingPass || !currentPassword || !newPassword}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-cyber font-bold text-xs tracking-wider transition-all disabled:opacity-50"
          >
            {isChangingPass ? 'ALTERANDO...' : 'ATUALIZAR SENHA'}
          </button>
        </form>

      </div>

      {/* Complete Order History */}
      <div className="p-6 rounded-3xl bg-[#0c0c0e] border border-[#222226] space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-[#1f1f24]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-cyan-400" />
            <h3 className="font-cyber font-bold text-sm text-white uppercase tracking-wider">
              Histórico Completo de Pedidos
            </h3>
          </div>
          <button
            onClick={onGoToPurchases}
            className="text-xs font-cyber text-cyan-400 hover:underline"
          >
            Ver Downloads Liberados →
          </button>
        </div>

        {isLoadingOrders ? (
          <div className="p-4 text-center text-xs text-[#888890] animate-pulse">Carregando pedidos...</div>
        ) : orders.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#888890]">Nenhum pedido registrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[10px] font-cyber text-[#888890] uppercase border-b border-[#1f1f24]">
                <tr>
                  <th className="py-2 px-3">Pedido</th>
                  <th className="py-2 px-3">Pacote</th>
                  <th className="py-2 px-3">Data</th>
                  <th className="py-2 px-3">Valor</th>
                  <th className="py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f1f24]">
                {orders.map((ord) => ord && (
                  <tr key={ord.id} className="hover:bg-[#121215]">
                    <td className="py-3 px-3 font-mono font-bold text-[#c0c0c5]">#{ord.order_number}</td>
                    <td className="py-3 px-3 font-semibold text-white truncate max-w-[200px]">{ord.package_title}</td>
                    <td className="py-3 px-3 text-[#888890] font-mono">{new Date(ord.created_at).toLocaleDateString('pt-BR')}</td>
                    <td className="py-3 px-3 font-cyber text-emerald-400 font-bold">R$ {(ord.final_amount ?? 0).toFixed(2)}</td>
                    <td className="py-3 px-3">{getStatusBadge(ord.status)}</td>
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
