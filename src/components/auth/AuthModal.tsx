import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, Mail, User as UserIcon, Phone, Sparkles, Shield, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register';
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
}) => {
  const { login, register } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      if (mode === 'login') {
        await login(email, password);
        onClose();
      } else if (mode === 'register') {
        await register({ name, email, password, phone });
        onClose();
      } else if (mode === 'forgot') {
        const res = await api.forgotPassword(email);
        setSuccessMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao processar solicitação');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setMode('login');
    setErrorMessage('');
    setIsLoading(true);
    try {
      await login(demoEmail, demoPass);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao logar com conta demo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-[#0c0c0e] border border-cyan-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10 my-auto"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#1f1f24] flex items-center justify-between bg-[#070709]">
            <div className="flex items-center gap-2">
              <span className="font-cyber font-black tracking-widest text-base text-white">
                CYBER<span className="text-cyan-400">MUSIC</span>
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-[#888890] hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mode Switcher Tabs */}
          {mode !== 'forgot' && (
            <div className="flex border-b border-[#1f1f24] bg-[#070709]">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage('');
                }}
                className={`flex-1 py-3 text-xs font-cyber font-bold tracking-wider transition-all border-b-2 ${
                  mode === 'login'
                    ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                    : 'border-transparent text-[#888890] hover:text-white'
                }`}
              >
                ENTRAR
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMessage('');
                }}
                className={`flex-1 py-3 text-xs font-cyber font-bold tracking-wider transition-all border-b-2 ${
                  mode === 'register'
                    ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                    : 'border-transparent text-[#888890] hover:text-white'
                }`}
              >
                CRIAR CONTA
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
            {mode === 'forgot' && (
              <div className="space-y-1">
                <h3 className="text-base font-cyber font-bold text-white">Recuperação de Senha</h3>
                <p className="text-xs text-[#888890]">
                  Informe seu e-mail cadastrado para receber as instruções de redefinição de acesso.
                </p>
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="block text-xs text-slate-300 font-cyber font-semibold mb-1">
                  Nome Completo
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-[#666670] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full bg-[#070709] border border-[#222226] rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-[#55555c] focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs text-slate-300 font-cyber font-semibold mb-1">
                E-mail
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#666670] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  className="w-full bg-[#070709] border border-[#222226] rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-[#55555c] focus:outline-none focus:border-cyan-400 font-sans"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs text-slate-300 font-cyber font-semibold">
                    Senha
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[11px] text-cyan-400 hover:underline"
                    >
                      Esqueceu?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#666670] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha secreta"
                    className="w-full bg-[#070709] border border-[#222226] rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-[#55555c] focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="block text-xs text-slate-300 font-cyber font-semibold mb-1">
                  Telefone / WhatsApp (Opcional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#666670] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full bg-[#070709] border border-[#222226] rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-[#55555c] focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            )}

            {errorMessage && (
              <p className="text-xs text-rose-400 bg-rose-950/30 p-2.5 rounded-xl border border-rose-500/30">
                {errorMessage}
              </p>
            )}

            {successMessage && (
              <p className="text-xs text-emerald-400 bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-500/30">
                {successMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-cyber font-black text-xs tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/25 active:scale-95"
            >
              {isLoading ? (
                <span>PROCESSANDO...</span>
              ) : mode === 'login' ? (
                <>
                  <span>ACESSAR PLATAFORMA</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : mode === 'register' ? (
                <>
                  <span>CRIAR MINHA CONTA</span>
                  <Sparkles className="w-4 h-4" />
                </>
              ) : (
                <span>ENVIAR INSTRUÇÕES</span>
              )}
            </button>

            {mode === 'forgot' && (
              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full py-2 text-xs text-[#888890] hover:text-white text-center block"
              >
                ← Voltar para o Login
              </button>
            )}
          </form>

          {/* Quick Demo Access Bar */}
          <div className="p-4 bg-[#070709] border-t border-[#1f1f24] space-y-2">
            <div className="flex items-center gap-1 text-[11px] text-[#888890] font-cyber font-semibold">
              <Shield className="w-3 h-3 text-cyan-400" />
              <span>TESTE RÁPIDO COM CONTAS DEMO:</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[10px] font-cyber">
              <button
                type="button"
                onClick={() => handleFillDemo('admin@cybermusic.com', 'admin123')}
                className="p-1.5 rounded-lg bg-cyan-950/30 hover:bg-cyan-900/50 border border-cyan-500/30 text-cyan-300 text-left truncate"
              >
                👑 <strong>ADMIN MASTER</strong>
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('editor@cybermusic.com', 'editor123')}
                className="p-1.5 rounded-lg bg-indigo-950/30 hover:bg-indigo-900/50 border border-indigo-500/30 text-indigo-300 text-left truncate"
              >
                ✏️ <strong>EDITOR</strong>
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('suporte@cybermusic.com', 'suporte123')}
                className="p-1.5 rounded-lg bg-amber-950/30 hover:bg-amber-900/50 border border-amber-500/30 text-amber-300 text-left truncate"
              >
                🎧 <strong>SUPORTE</strong>
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('djmarcos@gmail.com', 'cliente123')}
                className="p-1.5 rounded-lg bg-emerald-950/30 hover:bg-emerald-900/50 border border-emerald-500/30 text-emerald-300 text-left truncate"
              >
                🎵 <strong>CLIENTE DEMO</strong>
              </button>
            </div>
          </div>

        </motion.div>

      </div>
    </AnimatePresence>
  );
};
