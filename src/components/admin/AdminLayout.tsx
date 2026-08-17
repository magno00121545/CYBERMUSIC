import React, { useState } from 'react';
import { 
  LayoutDashboard, Package as PackageIcon, Layers, ShoppingBag, 
  Tag, Users, Bell, Database, Activity, ArrowLeft, Shield, Settings
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { AdminDashboard } from './AdminDashboard.js';
import { AdminPackages } from './AdminPackages.js';
import { AdminCategories } from './AdminCategories.js';
import { AdminOrders } from './AdminOrders.js';
import { AdminCoupons } from './AdminCoupons.js';
import { AdminUsers } from './AdminUsers.js';
import { AdminLogs } from './AdminLogs.js';
import { AdminNotifications } from './AdminNotifications.js';
import { AdminBackups } from './AdminBackups.js';
import { AdminSettings } from './AdminSettings.js';

interface AdminLayoutProps {
  onBackToApp: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onBackToApp }) => {
  const { user, isStaff, isAdmin, isEditor, login } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);

  // Password verification layer
  if (!isPasswordVerified) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-[#0c0c0e] border border-cyan-500/40 text-center space-y-5 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="font-cyber font-black text-xl text-white tracking-wider uppercase">
          Senha de Administração
        </h2>
        <input
          type="password"
          value={adminPassword}
          onChange={(e) => setAdminPassword(e.target.value)}
          placeholder="Digite a senha admin"
          className="w-full bg-[#121215] border border-[#222226] rounded-xl px-4 py-3 text-white text-center font-mono tracking-widest focus:border-cyan-400 focus:outline-none"
        />
        <button
          onClick={() => {
            if (adminPassword === '258090') {
              setIsPasswordVerified(true);
            } else {
              alert('Senha incorreta!');
              setAdminPassword('');
            }
          }}
          className="w-full py-3 rounded-xl bg-cyan-500 text-black font-cyber font-bold uppercase tracking-wider hover:bg-cyan-400 transition-all"
        >
          Verificar Acesso
        </button>
      </div>
    );
  }

  const navItems = [
    { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard, allowed: true },
    { id: 'packages', label: 'Pacotes & Músicas', icon: PackageIcon, allowed: isAdmin || isEditor },
    { id: 'categories', label: 'Categorias & Estilos', icon: Layers, allowed: isAdmin || isEditor },
    { id: 'orders', label: 'Pedidos PIX', icon: ShoppingBag, allowed: true },
    { id: 'coupons', label: 'Cupons de Desconto', icon: Tag, allowed: isAdmin || isEditor },
    { id: 'users', label: 'Usuários & Permissões', icon: Users, allowed: isAdmin },
    { id: 'notifications', label: 'Notificações Globais', icon: Bell, allowed: isAdmin || isEditor },
    { id: 'backups', label: 'Backups & Cloud', icon: Database, allowed: isAdmin },
    { id: 'logs', label: 'Logs de Auditoria', icon: Activity, allowed: isAdmin },
    { id: 'settings', label: 'Configurações', icon: Settings, allowed: isAdmin },
  ];

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0c0c0e] border border-cyan-500/30 p-4 sm:p-5 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-cyber font-black text-lg text-white">PAINEL ADMINISTRATIVO</span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-cyber font-bold uppercase">
                {user?.role}
              </span>
            </div>
            <p className="text-xs text-[#888890]">
              Gerencie todo o acervo, transações bancárias e usuários em tempo real.
            </p>
          </div>
        </div>

        <button
          onClick={onBackToApp}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-[#121215] border border-[#222226] text-slate-300 hover:text-white text-xs font-cyber font-bold flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-cyan-400" />
          <span>IR PARA LOJA PÚBLICA</span>
        </button>
      </div>

      {/* Main Admin Grid (Sidebar + Content) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Sidebar Nav */}
        <aside className="lg:col-span-3 p-3 rounded-3xl bg-[#0c0c0e] border border-[#222226] space-y-1 shadow-xl">
          <div className="px-3 py-2 text-[10px] font-cyber font-bold uppercase tracking-wider text-[#666670]">
            Módulos do Sistema
          </div>

          {navItems.filter(item => item.allowed).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-cyber font-semibold tracking-wide transition-all ${
                  isActive
                    ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/25 font-bold'
                    : 'text-[#888890] hover:bg-[#121215] hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Content Area */}
        <main className="lg:col-span-9 min-w-0">
          {activeTab === 'dashboard' && <AdminDashboard onNavigateTab={setActiveTab} />}
          {activeTab === 'packages' && <AdminPackages />}
          {activeTab === 'categories' && <AdminCategories />}
          {activeTab === 'orders' && <AdminOrders />}
          {activeTab === 'coupons' && <AdminCoupons />}
          {activeTab === 'users' && <AdminUsers />}
          {activeTab === 'notifications' && <AdminNotifications />}
          {activeTab === 'backups' && <AdminBackups />}
          {activeTab === 'logs' && <AdminLogs />}
          {activeTab === 'settings' && <AdminSettings />}
        </main>

      </div>

    </div>
  );
};
