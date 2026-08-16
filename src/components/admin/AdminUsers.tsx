import React, { useState, useEffect } from 'react';
import { Users, Shield, Edit2, Search, Check, RefreshCw, X, Save } from 'lucide-react';
import { User, UserRole } from '../../types/index.js';
import { api } from '../../services/api.js';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  
  // Edit mode
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');

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

  const handleSaveUser = async (userId: string) => {
    setUpdatingUserId(userId);
    try {
      await api.updateAdminUser(userId, { 
        username: editUsername, 
        password: editPassword || undefined 
      });
      setEditingUserId(null);
      setEditPassword('');
      await fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Erro ao atualizar usuário');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const startEdit = (user: any) => {
    setEditingUserId(user.id);
    setEditUsername(user.username);
    setEditPassword('');
  };

  const filtered = users.filter((u) =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black font-cyber text-white tracking-wider uppercase">
            Usuários & Níveis de Acesso
          </h2>
          <p className="text-xs text-[#888890] mt-1">
            Gerencie clientes, colabore e altere credenciais.
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
          placeholder="Buscar usuário..."
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
                  <th className="py-2.5 px-3">Senha</th>
                  <th className="py-2.5 px-3">Compras</th>
                  <th className="py-2.5 px-3">Cargo</th>
                  <th className="py-2.5 px-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f1f24]">
                {filtered.map((u) => u && (
                  <tr key={u.id} className="hover:bg-[#121215]">
                    <td className="py-3 px-3">
                      {editingUserId === u.id ? (
                        <input
                          value={editUsername}
                          onChange={(e) => setEditUsername(e.target.value)}
                          className="bg-[#121215] border border-cyan-500 rounded px-2 py-1 text-white w-full"
                        />
                      ) : (
                        <div className="flex items-center gap-2.5">
                          <img
                            src={u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username}`}
                            alt=""
                            className="w-8 h-8 rounded-lg bg-[#16161c] object-cover border border-[#26262b]"
                          />
                          <div>
                            <p className="font-semibold text-white">{u.name}</p>
                            <p className="text-[10px] text-cyan-400">@{u.username}</p>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {editingUserId === u.id ? (
                        <input
                          type="password"
                          value={editPassword}
                          onChange={(e) => setEditPassword(e.target.value)}
                          placeholder="Nova senha..."
                          className="bg-[#121215] border border-cyan-500 rounded px-2 py-1 text-white w-full"
                        />
                      ) : (
                        <span className="text-[#888890] italic">********</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-[#121215] border border-[#222226] text-emerald-400 font-cyber font-bold">
                        {u.total_orders || 0}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-cyber font-bold ${
                          u.role === 'ADMIN'
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                            : 'bg-[#16161c] text-[#888890] border border-[#26262b]'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {editingUserId === u.id ? (
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => handleSaveUser(u.id)} className="p-1.5 text-emerald-400"><Check className="w-4 h-4" /></button>
                          <button onClick={() => setEditingUserId(null)} className="p-1.5 text-red-400"><X className="w-4 h-4" /></button>
                        </div>
                      ) : (
                        <button onClick={() => startEdit(u)} className="p-1.5 text-cyan-400"><Edit2 className="w-4 h-4" /></button>
                      )}
                      
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                        disabled={updatingUserId === u.id}
                        className="ml-2 bg-[#070709] border border-[#222226] rounded-lg px-2 py-1 text-xs text-slate-200 cursor-pointer"
                      >
                        <option value="USER">USER</option>
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
