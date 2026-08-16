import React, { useState, useEffect } from 'react';
import { Users, Shield, Edit2, Search, Check, RefreshCw } from 'lucide-react';
import { User, UserRole } from '../../types/index.js';
import { api } from '../../services/api.js';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAdminUsers();
      setUsers(data);
    } catch (err) {
      console.warn('Failed to load users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setUpdatingUserId(userId);
    try {
      await api.updateUserRole(userId, newRole);
      await fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Erro ao alterar permissão');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const filtered = users.filter((u) =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black font-cyber text-white tracking-wider uppercase">
            Usuários & Níveis de Acesso
          </h2>
          <p className="text-xs text-[#888890] mt-1">
            Gerencie clientes, colaboradores e defina permissões de ADMIN, EDITOR e SUPORTE.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-[#121215] border border-[#222226] text-xs font-cyber font-bold text-[#888890] hover:text-cyan-400 flex items-center gap-2 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          ATUALIZAR LISTA
        </button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-[#666670] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar usuário por nome, e-mail ou cargo..."
          className="w-full bg-[#0c0c0e] border border-[#222226] rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-[#55555c] focus:outline-none focus:border-cyan-400 font-sans"
        />
      </div>

      <div className="p-6 rounded-3xl bg-[#0c0c0e] border border-[#222226] space-y-4 shadow-xl">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-[#888890] animate-pulse">Carregando usuários...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#888890]">Nenhum usuário encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[10px] font-cyber text-[#888890] uppercase border-b border-[#1f1f24]">
                <tr>
                  <th className="py-2.5 px-3">Usuário</th>
                  <th className="py-2.5 px-3">E-mail</th>
                  <th className="py-2.5 px-3">Compras Feitas</th>
                  <th className="py-2.5 px-3">Data Cadastro</th>
                  <th className="py-2.5 px-3">Cargo Atual</th>
                  <th className="py-2.5 px-3 text-right">Alterar Cargo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f1f24]">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-[#121215]">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.email}`}
                          alt=""
                          className="w-8 h-8 rounded-lg bg-[#16161c] object-cover border border-[#26262b]"
                        />
                        <span className="font-semibold text-white truncate max-w-[140px]">{u.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-300 font-sans">{u.email}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-[#121215] border border-[#222226] text-emerald-400 font-cyber font-bold">
                        {u.purchases_count || 0} pacotes
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[#888890] font-mono">
                      {new Date(u.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-cyber font-bold ${
                          u.role === 'ADMIN'
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                            : u.role === 'EDITOR'
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                            : u.role === 'SUPORTE'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-[#16161c] text-[#888890] border border-[#26262b]'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                        disabled={updatingUserId === u.id}
                        className="bg-[#070709] border border-[#222226] rounded-lg px-2 py-1 text-xs text-slate-200 font-cyber focus:outline-none focus:border-cyan-400 cursor-pointer"
                      >
                        <option value="USER">USER (Cliente)</option>
                        <option value="SUPORTE">SUPORTE</option>
                        <option value="EDITOR">EDITOR</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
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
