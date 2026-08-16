import { Router, Response } from 'express';
import { getDb, saveDb, logActivity } from '../db.js';
import { requireAuth, AuthRequest } from '../auth.js';
import { generatePixCopyPaste, generatePixQrCodeDataUrl } from '../pix.js';
import { Order, OrderItem, Payment, Coupon } from '../../src/types/index.js';
import { realtime } from '../realtime.js';

export const checkoutRoutes = Router();

// Validate Coupon
checkoutRoutes.post('/validate-coupon', (req: AuthRequest, res: Response) => {
  const { code, packageId } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Código de cupom não informado.' });
  }

  const db = getDb();
  const cleanCode = code.toUpperCase().trim();
  const coupon = db.coupons.find(c => c.code.toUpperCase() === cleanCode && c.is_active);

  if (!coupon) {
    return res.status(404).json({ error: 'Cupom inválido ou expirado.' });
  }

  if (coupon.expires_at && new Date(coupon.expires_at).getTime() < Date.now()) {
    return res.status(400).json({ error: 'Este cupom já expirou.' });
  }

  if (coupon.max_uses && coupon.uses_count >= coupon.max_uses) {
    return res.status(400).json({ error: 'Este cupom atingiu o limite máximo de utilizações.' });
  }

  if (packageId && coupon.participating_packages && coupon.participating_packages.length > 0) {
    if (!coupon.participating_packages.includes(packageId)) {
      return res.status(400).json({ error: 'Este cupom não é válido para este pacote específico.' });
    }
  }

  return res.json({
    valid: true,
    code: coupon.code,
    discount_type: coupon.discount_type,
    discount_value: coupon.discount_value,
    min_order_value: coupon.min_order_value,
    message: coupon.discount_type === 'PERCENTAGE'
      ? `Cupom aplicado! ${coupon.discount_value}% de desconto.`
      : `Cupom aplicado! R$ ${coupon.discount_value.toFixed(2)} de desconto.`
  });
});

// Create Order and Generate PIX
checkoutRoutes.post('/create-order', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { packageId, couponCode } = req.body;
    const user = req.user!;

    if (!packageId) {
      return res.status(400).json({ error: 'Pacote não selecionado.' });
    }

    const db = getDb();
    const pkg = db.packages.find(p => p.id === packageId && p.is_active);

    if (!pkg) {
      return res.status(404).json({ error: 'Pacote não encontrado ou indisponível.' });
    }

    // Check if user already purchased this package and is PAID
    const existingOrder = db.orders.find(o => 
      o.user_id === user.id && 
      o.status === 'PAID' && 
      o.items.some(item => item.package_id === pkg.id)
    );

    if (existingOrder) {
      return res.status(400).json({
        error: 'Você já comprou este pacote anteriormente! Acesse a área "Minhas Compras" para baixar.',
        alreadyPurchased: true,
        orderId: existingOrder.id,
      });
    }

    // Authoritative Server-Side Price Calculation
    const originalPrice = pkg.discount_price != null && pkg.discount_price > 0 ? pkg.discount_price : pkg.price;
    let finalAmount = originalPrice;
    let discountAmount = 0;
    let validCoupon: Coupon | null = null;

    if (couponCode) {
      const cleanCode = couponCode.toUpperCase().trim();
      const cpn = db.coupons.find(c => c.code.toUpperCase() === cleanCode && c.is_active);
      if (cpn) {
        let isEligible = true;
        if (cpn.expires_at && new Date(cpn.expires_at).getTime() < Date.now()) isEligible = false;
        if (cpn.max_uses && cpn.uses_count >= cpn.max_uses) isEligible = false;
        if (cpn.min_order_value && originalPrice < cpn.min_order_value) isEligible = false;

        if (isEligible) {
          validCoupon = cpn;
          if (cpn.discount_type === 'PERCENTAGE') {
            discountAmount = (originalPrice * cpn.discount_value) / 100;
          } else {
            discountAmount = cpn.discount_value;
          }
          finalAmount = Math.max(1.00, originalPrice - discountAmount);
          // Increment coupon usage
          cpn.uses_count += 1;
        }
      }
    }

    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const orderNumber = `CM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const txId = `TX${Date.now().toString().slice(-8)}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const songsInPkg = db.songs.filter(s => s.package_id === pkg.id);

    const orderItem: OrderItem = {
      id: `item_${Date.now()}`,
      order_id: orderId,
      package_id: pkg.id,
      package_title: pkg.title,
      package_cover: pkg.cover_image,
      price_at_purchase: finalAmount,
      total_tracks: songsInPkg.length || pkg.total_tracks,
      total_size: pkg.total_size,
    };

    // PIX Payload generation
    const pixKey = process.env.PIX_KEY || db.settings.pix_key || 'cyberplay484@gmail.com';
    const beneficiaryName = process.env.PIX_BENEFICIARY_NAME || db.settings.pix_beneficiary || 'CYBER MUSIC DIGITAL';
    const city = process.env.PIX_CITY || db.settings.pix_city || 'SAO PAULO';

    const pixCopyPaste = generatePixCopyPaste({
      pixKey,
      beneficiaryName,
      city,
      amount: finalAmount,
      txId,
      description: `CYBER MUSIC #${orderNumber}`,
    });

    const pixQrCode = await generatePixQrCodeDataUrl(pixCopyPaste);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutes expiration

    const newPayment: Payment = {
      id: paymentId,
      order_id: orderId,
      method: 'PIX',
      pix_qr_code: pixQrCode,
      pix_copy_paste: pixCopyPaste,
      tx_id: txId,
      status: 'PENDING',
      paid_at: null,
      expires_at: expiresAt,
      amount: finalAmount,
    };

    const newOrder: Order = {
      id: orderId,
      order_number: orderNumber,
      user_id: user.id,
      user_name: user.name,
      user_email: user.email,
      total_amount: finalAmount,
      discount_amount: discountAmount,
      coupon_code: validCoupon ? validCoupon.code : null,
      status: 'PENDING',
      payment_id: paymentId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: [orderItem],
      payment: newPayment,
    };

    db.orders.unshift(newOrder);
    db.payments.unshift(newPayment);
    saveDb();

    logActivity(user.id, user.email, 'CREATE_ORDER', `Pedido criado #${orderNumber} - R$ ${finalAmount.toFixed(2)} (${pkg.title})`);

    // Notify user in real-time
    realtime.sendToUser(user.id, 'ORDER_CREATED', {
      orderId,
      orderNumber,
      amount: finalAmount,
    });

    return res.status(201).json({
      order: newOrder,
      payment: newPayment,
      message: 'Cobrança PIX gerada com sucesso!',
    });
  } catch (err: any) {
    console.error('Checkout error:', err);
    return res.status(500).json({ error: 'Erro ao processar pedido.' });
  }
});
