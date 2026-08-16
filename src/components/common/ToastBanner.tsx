import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, CheckCircle2, Info, Bell, X } from 'lucide-react';
import { useRealtime } from '../../context/RealtimeContext.js';

export const ToastBanner: React.FC = () => {
  const { toastMessage, clearToast } = useRealtime();

  if (!toastMessage) return null;

  const isSuccess = toastMessage.type === 'success';
  const isPromo = toastMessage.type === 'promo';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className="fixed top-4 right-4 left-4 sm:left-auto sm:w-96 z-50 pointer-events-auto"
      >
        <div
          className={`p-4 rounded-xl border backdrop-blur-md shadow-2xl flex items-start gap-3 ${
            isSuccess
              ? 'bg-[#0a1812]/95 border-emerald-500/40 text-emerald-100 cyber-glow-emerald'
              : isPromo
              ? 'bg-[#1a1405]/95 border-amber-500/40 text-amber-100'
              : 'bg-[#0c0c0e]/95 border-cyan-500/40 text-cyan-100 cyber-glow-sm'
          }`}
        >
          <div className="p-2 rounded-lg bg-black/50 text-cyan-400 shrink-0">
            {isSuccess ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : isPromo ? (
              <Zap className="w-5 h-5 text-amber-400" />
            ) : (
              <Bell className="w-5 h-5 text-cyan-400" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm font-cyber tracking-wide text-white">
              {toastMessage.title}
            </h4>
            <p className="text-xs text-[#888890] mt-0.5 leading-relaxed">
              {toastMessage.message}
            </p>
          </div>

          <button
            type="button"
            onClick={clearToast}
            className="p-1 rounded-md text-[#888890] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
