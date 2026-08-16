import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Zap, ShieldCheck, Download, Disc3, Sparkles, Tag, ArrowRight, Check } from 'lucide-react';

interface HeroBannerProps {
  onExplore: () => void;
  onFilterCategory?: (slug: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onExplore }) => {
  const [copiedCoupon, setCopiedCoupon] = useState(false);

  const handleCopyCoupon = () => {
    navigator.clipboard.writeText('BEMVINDO20');
    setCopiedCoupon(true);
    setTimeout(() => setCopiedCoupon(false), 2500);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0e0e12] via-[#09090b] to-[#120f1c] border border-cyan-500/30 p-6 sm:p-10 my-6 shadow-2xl shadow-cyan-950/20">
      
      {/* Background Neon Grid / Glow */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 rounded-full bg-fuchsia-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Content */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-6">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-cyber font-bold tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PLATAFORMA PROFISSIONAL DE MÚSICA 2026</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black font-cyber text-white tracking-wide leading-tight">
            PASTAS & PACOTES DE <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
              MÚSICAS EXCLUSIVAS
            </span>
          </h1>

          <p className="text-[#a0a0a5] text-xs sm:text-sm sm:leading-relaxed max-w-xl">
            Adquira repertórios completos para DJs, paredões, festas e produtores. 
            Pagamento instantâneo via <strong className="text-white">PIX</strong> com <strong className="text-white">liberação automática de download</strong> em alta definição (MP3 320kbps / WAV).
          </p>

          {/* Guarantee Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#0e0e11] border border-[#222226]">
              <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="text-[11px] font-medium text-slate-200">PIX Automático</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#0e0e11] border border-[#222226]">
              <Download className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-[11px] font-medium text-slate-200">Download Imediato</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#0e0e11] border border-[#222226] col-span-2 sm:col-span-1">
              <Disc3 className="w-4 h-4 text-indigo-400 shrink-0" />
              <span className="text-[11px] font-medium text-slate-200">Master 320kbps</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onExplore}
              className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-black font-cyber font-black text-sm tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/30 cursor-pointer"
            >
              <span>EXPLORAR CATÁLOGO</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleCopyCoupon}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 active:scale-95 border border-amber-500/30 text-amber-300 text-xs transition-all cursor-pointer"
              title="Clique para copiar cupom"
            >
              {copiedCoupon ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Tag className="w-3.5 h-3.5 shrink-0" />}
              <span>{copiedCoupon ? 'CUPOM COPIADO: BEMVINDO20' : <>Cupom <strong>BEMVINDO20</strong> (20% OFF)</>}</span>
            </button>
          </div>

        </div>

        {/* Right Artwork / Showcase */}
        <div className="lg:col-span-5 flex justify-center">
          <div 
            onClick={onExplore}
            className="relative w-full max-w-sm cursor-pointer group"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-fuchsia-500/20 blur-xl group-hover:blur-2xl transition-all" />
            <div className="relative rounded-2xl overflow-hidden border border-cyan-500/30 group-hover:border-cyan-400/60 bg-[#0e0e11] shadow-2xl transition-all">
              <img
                src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=700&auto=format&fit=crop&q=80"
                alt="Cyber Music Pack"
                className="w-full h-52 sm:h-64 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="p-4 bg-[#0a0a0d] border-t border-[#1f1f24] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-cyber uppercase tracking-wider text-cyan-400 font-bold">
                    DESTAQUE DA SEMANA
                  </span>
                  <h3 className="text-sm font-bold text-white truncate max-w-[200px]">
                    SUPER PACK FUNK 2026
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-cyber font-bold text-xs">
                  R$ 19,90
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
