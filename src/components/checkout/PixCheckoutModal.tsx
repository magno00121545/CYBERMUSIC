import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, QrCode, Copy, Check, ShieldCheck, Clock, 
  Sparkles, CheckCircle2, Download, AlertCircle, ArrowRight, RefreshCw, Zap
} from 'lucide-react';
import { Package, Order, Payment } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';

interface PixCheckoutModalProps {
  pkg: Package | null;
  onClose: () => void;
  onGoToPurchases: () => void;
  onOpenAuth: () => void;
}

export const PixCheckoutModal: React.FC<PixCheckoutModalProps> = ({
  pkg,
  onClose,
  onGoToPurchases,
  onOpenAuth,
}) => {
  const { user, register: authRegister } = useAuth();

  // State
  const [step, setStep] = useState<'summary' | 'pix' | 'success'>('summary');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState<{ discountValue: number; discountType: string } | null>(null);
  const [couponMsg, setCouponMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const [order, setOrder] = useState<Order | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');

  // Quick guest credentials if not logged in
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPassword, setGuestPassword] = useState('');
  const [isRegisteringGuest, setIsRegisteringGuest] = useState(false);
  const [guestError, setGuestError] = useState('');

  // Load settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await api.getAdminSettings();
        setWhatsappNumber(settings.support_whatsapp || '(11) 99999-9999');
      } catch (err) {
        console.error('Erro ao carregar configurações:', err);
      }
    };
    fetchSettings();
  }, []);

  // Payment status polling
  useEffect(() => {
    // ...
  }, [step, order]);
  
  if (!pkg) return null;

  const basePrice = pkg.discount_price !== null && pkg.discount_price !== undefined && pkg.discount_price < pkg.price
    ? pkg.discount_price
    : pkg.price;

  let calculatedPrice = basePrice;
  if (couponDiscount) {
    if (couponDiscount.discountType === 'PERCENT') {
      calculatedPrice = Math.max(0.5, basePrice * (1 - couponDiscount.discountValue / 100));
    } else {
      calculatedPrice = Math.max(0.5, basePrice - couponDiscount.discountValue);
    }
  }

  // Handle Coupon Validation
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsValidatingCoupon(true);
    setCouponMsg(null);
    try {
      const res = await api.validateCoupon(couponCode.trim(), pkg.id);
      if (res.valid) {
        setCouponDiscount({
          discountValue: res.discount_value,
          discountType: res.discount_type,
        });
        setCouponMsg({ text: res.message, isError: false });
      }
    } catch (err: any) {
      setCouponDiscount(null);
      setCouponMsg({ text: err.message || 'Cupom inválido ou expirado', isError: true });
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  // Handle Order Creation
  const handleGenerateWhatsappOrder = async () => {
    setIsCreatingOrder(true);
    try {
      // If user not logged in, auto-create a guest session
      if (!user) {
        const guestRandom = Math.floor(1000 + Math.random() * 9000);
        await authRegister({
          name: `Cliente #${guestRandom}`,
          email: `cliente${guestRandom}@cybermusic.com`,
          password: `pass_${guestRandom}_cyber`,
        });
      }
      const res = await api.createOrder(pkg.id, couponDiscount ? couponCode : undefined);
      setOrder(res.order);
      
      // WhatsApp integration
      const message = `Olá! Gostaria de finalizar meu pedido na Cyber Music.\n\nPedido: #${res.order.order_number}\nPacote: ${pkg.title}\nTotal: R$ ${res.order.total_amount.toFixed(2)}\n\nAguardo instruções para o pagamento via PIX.`;
      const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      
      setStep('success');
    } catch (err: any) {
      alert(`Erro ao gerar pedido: ${err.message}`);
    } finally {
      setIsCreatingOrder(false);
    }
  };

  // Quick Guest Registration + Order Creation without reloading window
  const handleRegisterAndPay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !guestEmail || !guestPassword) {
      setGuestError('Preencha nome, email e senha');
      return;
    }
    setIsRegisteringGuest(true);
    setGuestError('');
    try {
      await authRegister({
        name: guestName,
        email: guestEmail,
        password: guestPassword,
      });
      // Directly generate WhatsApp order
      setIsCreatingOrder(true);
      const res = await api.createOrder(pkg.id, couponDiscount ? couponCode : undefined);
      setOrder(res.order);
      
      const message = `Olá! Gostaria de finalizar meu pedido na Cyber Music.\n\nPedido: #${res.order.order_number}\nPacote: ${pkg.title}\nTotal: R$ ${res.order.total_amount.toFixed(2)}\n\nAguardo instruções para o pagamento.`;
      const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      setStep('success');
    } catch (err: any) {
      setGuestError(err.message || 'Erro ao criar conta');
    } finally {
      setIsRegisteringGuest(false);
      setIsCreatingOrder(false);
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
          className="relative w-full max-w-lg bg-[#0c0c0e] border border-cyan-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10 my-auto"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#1f1f24] flex items-center justify-between bg-[#070709]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <QrCode className="w-4 h-4" />
              </div>
              <h3 className="font-cyber font-bold text-sm sm:text-base text-white tracking-wider">
                {step === 'summary' && 'CHECKOUT SEGURO PIX'}
                {step === 'pix' && 'PAGAMENTO VIA PIX'}
                {step === 'success' && 'COMPRA LIBERADA!'}
              </h3>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-[#888890] hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-5 sm:p-6 space-y-5">
            
            {/* STEP 1: SUMMARY */}
            {step === 'summary' && (
              <div className="space-y-5">
                
                {/* Item Card */}
                <div className="p-3.5 rounded-2xl bg-[#121215] border border-[#222226] flex items-center gap-3.5">
                  <img
                    src={pkg.cover_image}
                    alt={pkg.title}
                    className="w-16 h-16 rounded-xl object-cover border border-cyan-500/30 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-cyber text-cyan-400 font-bold uppercase">
                      {pkg.category_name}
                    </span>
                    <h4 className="text-sm font-bold text-white font-cyber truncate">
                      {pkg.title}
                    </h4>
                    <p className="text-xs text-[#888890]">
                      {pkg.total_tracks} músicas • Arquivo .ZIP de alta velocidade
                    </p>
                  </div>
                </div>

                {/* Coupon Code Input */}
                <div className="space-y-2">
                  <label className="text-xs text-slate-300 font-cyber font-semibold block">
                    CUPOM DE DESCONTO
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Ex: BEMVINDO20"
                      className="flex-1 bg-[#09090c] border border-[#222226] rounded-xl px-3.5 py-2 text-xs text-white uppercase font-cyber placeholder-[#55555c] focus:outline-none focus:border-cyan-400"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={isValidatingCoupon || !couponCode.trim()}
                      className="px-4 py-2 rounded-xl bg-[#16161c] hover:bg-[#202028] disabled:opacity-50 text-xs font-cyber font-bold text-cyan-300 border border-[#26262b] transition-all"
                    >
                      {isValidatingCoupon ? 'APLICANDO...' : 'APLICAR'}
                    </button>
                  </div>
                  {couponMsg && (
                    <p className={`text-xs ${couponMsg.isError ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {couponMsg.text}
                    </p>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="p-3.5 rounded-2xl bg-[#09090c] border border-[#222226] space-y-2 text-xs">
                  <div className="flex justify-between text-[#888890]">
                    <span>Subtotal do Pacote</span>
                    <span>R$ {basePrice.toFixed(2)}</span>
                  </div>
                  {couponDiscount && (
                    <div className="flex justify-between text-emerald-400 font-semibold">
                      <span>Desconto Cupom ({couponDiscount.discountType === 'PERCENT' ? `${couponDiscount.discountValue}%` : `R$ ${couponDiscount.discountValue}`})</span>
                      <span>- R$ {(basePrice - calculatedPrice).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-[#1f1f24] pt-2 flex justify-between items-center text-sm font-bold">
                    <span className="text-white font-cyber">TOTAL A PAGAR</span>
                    <span className="text-emerald-400 font-cyber text-lg">
                      R$ {calculatedPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Checkout Actions */}
                {!user ? (
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={handleGenerateWhatsappOrder}
                      disabled={isCreatingOrder}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 disabled:opacity-50 text-black font-cyber font-black text-sm tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/30 transition-all active:scale-95 cursor-pointer"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>{isCreatingOrder ? 'GERANDO PEDIDO...' : 'FINALIZAR VIA WHATSAPP'}</span>
                    </button>

                    <div className="relative flex items-center justify-center">
                      <div className="border-t border-[#222226] w-full" />
                      <span className="bg-[#0c0c0e] px-2 text-[10px] text-[#888890] uppercase font-cyber font-semibold">
                        ou personalize seus dados
                      </span>
                      <div className="border-t border-[#222226] w-full" />
                    </div>

                    <form onSubmit={handleRegisterAndPay} className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-cyber font-bold text-cyan-300 uppercase">
                          Identificação Personalizada
                        </h4>
                        <button
                          type="button"
                          onClick={onOpenAuth}
                          className="text-[11px] text-[#888890] hover:text-cyan-400 underline cursor-pointer"
                        >
                          Já tem conta? Entrar
                        </button>
                      </div>

                      <div className="space-y-2 text-xs">
                        <input
                          type="text"
                          required
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          placeholder="Seu nome completo"
                          className="w-full bg-[#070709] border border-[#222226] rounded-xl px-3 py-2 text-white placeholder-[#55555c] focus:outline-none focus:border-cyan-400"
                        />
                        <input
                          type="email"
                          required
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          placeholder="Seu melhor e-mail (para envio do download)"
                          className="w-full bg-[#070709] border border-[#222226] rounded-xl px-3 py-2 text-white placeholder-[#55555c] focus:outline-none focus:border-cyan-400"
                        />
                        <input
                          type="password"
                          required
                          value={guestPassword}
                          onChange={(e) => setGuestPassword(e.target.value)}
                          placeholder="Crie uma senha de acesso"
                          className="w-full bg-[#070709] border border-[#222226] rounded-xl px-3 py-2 text-white placeholder-[#55555c] focus:outline-none focus:border-cyan-400"
                        />
                      </div>

                      {guestError && <p className="text-xs text-rose-400">{guestError}</p>}

                      <button
                        type="submit"
                        disabled={isRegisteringGuest}
                        className="w-full py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-cyber font-bold text-xs tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        {isRegisteringGuest ? 'CRIANDO CONTA...' : 'SALVAR DADOS E GERAR PIX'}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                ) : (
                  <button
                    onClick={handleGenerateWhatsappOrder}
                    disabled={isCreatingOrder}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 disabled:opacity-50 text-black font-cyber font-black text-sm tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/30 transition-all active:scale-95 cursor-pointer"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>{isCreatingOrder ? 'GERANDO PEDIDO...' : 'FINALIZAR VIA WHATSAPP'}</span>
                  </button>
                )}

              </div>
            )}

            {/* STEP 2: PIX PAYMENT DISPLAY */}
            {step === 'pix' && payment && (
              <div className="space-y-4 text-center">
                
                {/* Timer & Status */}
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs">
                  <div className="flex items-center gap-2 text-cyan-300 font-cyber">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    <span>AGUARDANDO PAGAMENTO</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300 font-mono">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{formatTimer(timeLeft)}</span>
                  </div>
                </div>

                {/* QR Code */}
                <div className="p-4 bg-white rounded-2xl w-56 h-56 mx-auto flex items-center justify-center shadow-2xl border-4 border-cyan-400/80">
                  <img
                    src={payment.pix_qr_image}
                    alt="PIX QR Code"
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-slate-300">
                    Abra o app do seu banco, escolha <strong>PIX</strong> e escaneie o QR Code acima ou copie a chave abaixo.
                  </p>
                  <p className="text-lg font-black font-cyber text-emerald-400">
                    R$ {payment.amount.toFixed(2)}
                  </p>
                </div>

                {/* Copia e Cola EMV */}
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-[#09090c] border border-[#222226] text-[11px] font-mono text-[#888890] break-all max-h-16 overflow-y-auto text-left select-all">
                    {payment.pix_emv}
                  </div>

                  <button
                    onClick={handleCopyPix}
                    className={`w-full py-2.5 rounded-xl font-cyber font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      isCopied
                        ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/30'
                        : 'bg-[#16161c] hover:bg-[#202028] text-cyan-300 border border-[#26262b]'
                    }`}
                  >
                    {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{isCopied ? 'CÓDIGO PIX COPIADO!' : 'COPIAR CÓDIGO PIX (COPIA E COLA)'}</span>
                  </button>
                </div>

                {/* Test Webhook Simulator Button */}
                <div className="pt-2 border-t border-[#1f1f24]">
                  <button
                    type="button"
                    onClick={handleSimulatePayment}
                    disabled={isSimulating}
                    className="w-full py-2.5 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-300 border border-emerald-500/30 text-xs font-cyber font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isSimulating ? 'CONFIRMANDO...' : 'SIMULAR APROVAÇÃO INSTANTÂNEA (TESTE DEMO)'}</span>
                  </button>
                  <p className="text-[10px] text-[#888890] mt-1">
                    *Ambiente de testes: simula o webhook bancário em tempo real para liberação imediata.
                  </p>
                </div>

              </div>
            )}

            {/* STEP 3: SUCCESS CELEBRATION */}
            {step === 'success' && (
              <div className="text-center space-y-5 py-4">
                
                <div className="w-16 h-16 rounded-full bg-emerald-500/15 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg sm:text-xl font-black font-cyber text-white">
                    PAGAMENTO PIX CONFIRMADO!
                  </h3>
                  <p className="text-xs text-slate-300">
                    Seu pedido <strong>#{order?.order_number || 'OK'}</strong> foi liberado no servidor com sucesso.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-left space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Pacote Adquirido:</span>
                    <strong className="text-white font-cyber">{pkg.title}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Total de Faixas:</span>
                    <span className="text-cyan-300 font-cyber">{pkg.total_tracks} músicas</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Acesso Permanente:</span>
                    <span className="text-emerald-400 font-semibold">Salvo na sua conta</span>
                  </div>
                </div>

                {/* Direct Action Buttons */}
                <div className="space-y-2.5 pt-2">
                  <button
                    onClick={handleDirectDownload}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-cyber font-black text-sm tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 transition-all active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>BAIXAR PACOTE COMPLETO (.ZIP)</span>
                  </button>

                  <button
                    onClick={() => {
                      onClose();
                      onGoToPurchases();
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#16161c] hover:bg-[#202028] border border-[#26262b] text-slate-200 text-xs font-cyber font-bold transition-all"
                  >
                    VER EM "MINHAS COMPRAS"
                  </button>
                </div>

              </div>
            )}

          </div>

        </motion.div>

      </div>
    </AnimatePresence>
  );
};
