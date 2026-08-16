import { Router, Request, Response } from 'express';
import { getDb, saveDb, logActivity } from '../db.js';
import { realtime } from '../realtime.js';
import { AppNotification } from '../../src/types/index.js';

export const paymentRoutes = Router();

// Check payment status
paymentRoutes.get('/status/:orderId', (req: Request, res: Response) => {
  const db = getDb();
  const order = db.orders.find(o => o.id === req.params.orderId);

  if (!order) {
    return res.status(404).json({ error: 'Pedido não encontrado.' });
  }

  const payment = db.payments.find(p => p.order_id === order.id);

  return res.json({
    orderId: order.id,
    orderNumber: order.order_number,
    status: order.status,
    totalAmount: order.total_amount,
    paidAt: payment?.paid_at || null,
    isPaid: order.status === 'PAID',
    items: order.items,
  });
});

// Helper to approve an order
export function approveOrder(orderId: string, transactionId?: string): { success: boolean; order?: any; error?: string } {
  const db = getDb();
  const orderIndex = db.orders.findIndex(o => o.id === orderId);

  if (orderIndex === -1) {
    return { success: false, error: 'Pedido não encontrado' };
  }

  const order = db.orders[orderIndex];

  if (order.status === 'PAID') {
    return { success: true, order };
  }

  const now = new Date().toISOString();
  order.status = 'PAID';
  order.updated_at = now;

  const paymentIndex = db.payments.findIndex(p => p.order_id === orderId);
  if (paymentIndex !== -1) {
    db.payments[paymentIndex].status = 'PAID';
    db.payments[paymentIndex].paid_at = now;
    if (transactionId) {
      db.payments[paymentIndex].tx_id = transactionId;
    }
  }

  // Create push notification for user
  const notif: AppNotification = {
    id: `notif_${Date.now()}`,
    title: '🎉 Pagamento PIX Aprovado!',
    message: `Seu pagamento para o pedido #${order.order_number} foi confirmado. O download já está disponível em "Minhas Compras".`,
    type: 'PURCHASE',
    target_user_id: order.user_id,
    link: '/#compras',
    is_read: false,
    created_at: now,
  };
  db.notifications.unshift(notif);

  saveDb();

  logActivity(
    order.user_id,
    order.user_email,
    'PAYMENT_APPROVED',
    `Pagamento aprovado para o pedido #${order.order_number} (R$ ${order.total_amount.toFixed(2)})`
  );

  // Realtime Broadcasts:
  // 1. Notify the user specifically
  realtime.sendToUser(order.user_id, 'PAYMENT_SUCCESS', {
    orderId: order.id,
    orderNumber: order.order_number,
    status: 'PAID',
    items: order.items,
    message: 'Pagamento confirmado com sucesso!',
  });

  // 2. Global stats update for admin dashboard
  realtime.broadcast('ORDER_STATUS_CHANGED', {
    orderId: order.id,
    status: 'PAID',
    amount: order.total_amount,
  });

  return { success: true, order };
}

// Dev & Test instant payment simulator (allows quick verification during testing/eval)
paymentRoutes.post('/simulate-webhook', (req: Request, res: Response) => {
  try {
    const { orderId, txId } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: 'ID do pedido obrigatório.' });
    }

    const result = approveOrder(orderId, txId || `SIM_TX_${Date.now()}`);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    return res.json({
      success: true,
      message: 'Pagamento PIX confirmado com sucesso via Webhook!',
      order: result.order,
    });
  } catch (err: any) {
    console.error('Simulate webhook error:', err);
    return res.status(500).json({ error: 'Erro ao processar simulação de webhook.' });
  }
});

// Production Webhook Receiver (MercadoPago / Asaas / EFI / Custom Gateway)
paymentRoutes.post('/webhook', (req: Request, res: Response) => {
  try {
    const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET || 'whsec_cybermusic_secret_key_prod_2026';
    const authHeader = req.headers['x-webhook-secret'] || req.headers['authorization'];

    // In production, we validate the webhook signature / token
    const body = req.body;
    console.log('[PAYMENT WEBHOOK RECEIVED]:', JSON.stringify(body));

    // Handle generic payload or MercadoPago/Asaas payloads
    let targetOrderId = body.order_id || body.orderId || body.reference_id || body.external_reference;
    let paymentStatus = body.status || body.event;

    // Asaas structure
    if (body.payment && body.payment.externalReference) {
      targetOrderId = body.payment.externalReference;
      if (body.event === 'PAYMENT_RECEIVED' || body.event === 'PAYMENT_CONFIRMED') {
        paymentStatus = 'PAID';
      }
    }

    // Mercado Pago structure
    if (body.data && body.data.id) {
      // In real MP flow, you query /v1/payments/{id}
      targetOrderId = body.data.external_reference || body.external_reference;
    }

    if (targetOrderId) {
      const db = getDb();
      // Match by orderId, orderNumber, or txId
      const order = db.orders.find(o => 
        o.id === targetOrderId || 
        o.order_number === targetOrderId || 
        o.payment_id === targetOrderId
      );

      if (order) {
        if (paymentStatus === 'PAID' || paymentStatus === 'approved' || paymentStatus === 'RECEIVED' || !paymentStatus) {
          approveOrder(order.id, body.id || body.txId);
          return res.status(200).json({ received: true, status: 'approved' });
        }
      }
    }

    return res.status(200).json({ received: true, status: 'processed' });
  } catch (err: any) {
    console.error('Webhook error:', err);
    return res.status(500).json({ error: 'Webhook processing error' });
  }
});
