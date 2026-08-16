import React from 'react';
import { Music, ShieldCheck, Zap, Download, Smartphone, Heart } from 'lucide-react';

interface FooterProps {
  onSelectCategory?: (slug: string) => void;
  onOpenAdmin?: () => void;
  onOpenTerms?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectCategory, onOpenAdmin }) => {
  return (
    <footer className="bg-[#050505] border-t border-[#1f1f24] pt-12 pb-24 sm:pb-12 text-[#888890] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#1f1f24]">
          
          {/* Col 1: Brand & Bio */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Music className="w-4 h-4" />
              </div>
              <span className="font-cyber font-black tracking-widest text-lg text-white">
                CYBER<span className="text-cyan-400">MUSIC</span>
              </span>
            </div>
            <p className="text-xs text-[#888890] leading-relaxed">
              A plataforma definitiva de distribuição e venda de pacotes e pastas de músicas para DJs, produtores e entusiastas musicais.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-cyan-400 font-cyber font-semibold">
              <Zap className="w-3.5 h-3.5" />
              <span>PAGAMENTO PIX • LIBERAÇÃO INSTANTÂNEA</span>
            </div>
          </div>

          {/* Col 2: Segurança & Garantias */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-white font-cyber uppercase tracking-wider">
              Segurança & Tecnologia
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2 text-[#c0c0c5]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Links assinados com expiração segura</span>
              </li>
              <li className="flex items-center gap-2 text-[#c0c0c5]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Validação criptográfica de compras</span>
              </li>
              <li className="flex items-center gap-2 text-[#c0c0c5]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Áudios masterizados em 320kbps</span>
              </li>
              <li className="flex items-center gap-2 text-[#c0c0c5]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Sincronização em tempo real (Cloud)</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Categorias Populares */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-white font-cyber uppercase tracking-wider">
              Gêneros em Destaque
            </h4>
            <div className="grid grid-cols-2 gap-1.5 text-xs text-[#888890]">
              <button
                type="button"
                onClick={() => onSelectCategory && onSelectCategory('cat_funk')}
                className="text-left hover:text-cyan-400 cursor-pointer transition-colors"
              >
                • Funk Mandelão
              </button>
              <button
                type="button"
                onClick={() => onSelectCategory && onSelectCategory('cat_eletronica')}
                className="text-left hover:text-cyan-400 cursor-pointer transition-colors"
              >
                • Tech House & EDM
              </button>
              <button
                type="button"
                onClick={() => onSelectCategory && onSelectCategory('cat_forro')}
                className="text-left hover:text-cyan-400 cursor-pointer transition-colors"
              >
                • Forró & Piseiro
              </button>
              <button
                type="button"
                onClick={() => onSelectCategory && onSelectCategory('cat_sertanejo')}
                className="text-left hover:text-cyan-400 cursor-pointer transition-colors"
              >
                • Sertanejo VIP
              </button>
              <button
                type="button"
                onClick={() => onSelectCategory && onSelectCategory('cat_gospel')}
                className="text-left hover:text-cyan-400 cursor-pointer transition-colors"
              >
                • Gospel & Worship
              </button>
              <button
                type="button"
                onClick={() => onSelectCategory && onSelectCategory('cat_flashback')}
                className="text-left hover:text-cyan-400 cursor-pointer transition-colors"
              >
                • Flashback 80s/90s
              </button>
              <button
                type="button"
                onClick={() => onSelectCategory && onSelectCategory('cat_internacional')}
                className="text-left hover:text-cyan-400 cursor-pointer transition-colors"
              >
                • Internacional Hits
              </button>
              <button
                type="button"
                onClick={() => onSelectCategory && onSelectCategory('cat_mix')}
                className="text-left hover:text-cyan-400 cursor-pointer transition-colors"
              >
                • DJ Toolkit & Mix
              </button>
            </div>
          </div>

          {/* Col 4: Aplicativo & Suporte */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white font-cyber uppercase tracking-wider">
              Administração & App
            </h4>
            <p className="text-xs text-[#888890]">
              Acesso exclusivo para administradores, equipe e DJs.
            </p>
            {onOpenAdmin && (
              <button
                type="button"
                onClick={onOpenAdmin}
                className="w-full py-2 px-3 rounded-xl bg-transparent hover:bg-cyan-500/5 border border-transparent hover:border-cyan-500/20 text-cyan-500/30 hover:text-cyan-400 transition-all cursor-pointer mt-2 flex justify-center"
                title="Acesso Admin"
              >
                <ShieldCheck className="w-5 h-5" />
              </button>
            )}
            <div className="p-2.5 rounded-xl bg-[#0e0e11] border border-[#222226] flex items-center gap-3">
              <Smartphone className="w-6 h-6 text-cyan-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-white font-cyber">CYBER MUSIC APP</p>
                <p className="text-[10px] text-[#888890]">Instalável sem precisar de loja</p>
              </div>
            </div>
          </div>

        </div>

        {/* Copyright & Legal Disclaimer */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-[#666670]">
          <p>
            © {new Date().getFullYear()} CYBER MUSIC DIGITAL. Todos os direitos reservados.
          </p>
          <p className="text-center max-w-xl text-[10px] text-[#666670] leading-normal">
            Aviso Legal: Todos os pacotes e edições disponibilizados na plataforma são para uso de DJs e produtores autorizados, sem infringência de DRM ou sistemas de proteção de streaming.
          </p>
        </div>

      </div>
    </footer>
  );
};
