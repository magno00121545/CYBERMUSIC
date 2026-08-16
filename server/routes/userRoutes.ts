import { Router, Response } from 'express';
import { getDb, saveDb } from '../db.js';
import { requireAuth, AuthRequest } from '../auth.js';

export const userRoutes = Router();

// User Orders
userRoutes.get('/orders', requireAuth, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const userId = req.user!.id;

  const orders = db.orders
    .filter(o => o.user_id === userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map(order => {
      const payment = db.payments.find(p => p.order_id === order.id);
      return {
        ...order,
        payment,
      };
    });

  return res.json(orders);
});

// User Purchases (Paid packages unlocked for download)
userRoutes.get('/purchases', requireAuth, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const userId = req.user!.id;

  // Get all paid orders
  const paidOrders = db.orders.filter(o => o.user_id === userId && o.status === 'PAID');

  const purchasedPackagesMap = new Map<string, any>();

  for (const order of paidOrders) {
    for (const item of order.items) {
      if (!purchasedPackagesMap.has(item.package_id)) {
        const pkg = db.packages.find(p => p.id === item.package_id);
        const cat = pkg ? db.categories.find(c => c.id === pkg.category_id) : null;
        const songs = pkg ? db.songs.filter(s => s.package_id === pkg.id).sort((a, b) => a.track_number - b.track_number) : [];

        purchasedPackagesMap.set(item.package_id, {
          package_id: item.package_id,
          order_id: order.id,
          order_number: order.order_number,
          title: item.package_title,
          cover_image: item.package_cover || pkg?.cover_image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400',
          category_name: cat?.name || 'Música',
          total_tracks: songs.length || item.total_tracks || 1,
          total_size: pkg?.total_size || item.total_size || 0,
          purchased_at: order.updated_at || order.created_at,
          songs,
        });
      }
    }
  }

  const result = Array.from(purchasedPackagesMap.values());
  return res.json(result);
});

// User Downloads History
userRoutes.get('/downloads-history', requireAuth, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const userId = req.user!.id;

  const history = db.downloads
    .filter(d => d.user_id === userId)
    .sort((a, b) => new Date(b.downloaded_at).getTime() - new Date(a.downloaded_at).getTime())
    .slice(0, 50);

  return res.json(history);
});

// Notifications
userRoutes.get('/notifications', requireAuth, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const userId = req.user!.id;

  const notifs = db.notifications
    .filter(n => !n.target_user_id || n.target_user_id === userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 30);

  return res.json(notifs);
});

// Mark notification read
userRoutes.put('/notifications/:id/read', requireAuth, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const notif = db.notifications.find(n => n.id === req.params.id);
  if (notif) {
    notif.is_read = true;
    saveDb();
  }
  return res.json({ success: true });
});

// Mark all read
userRoutes.put('/notifications/mark-all-read', requireAuth, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const userId = req.user!.id;
  db.notifications.forEach(n => {
    if (!n.target_user_id || n.target_user_id === userId) {
      n.is_read = true;
    }
  });
  saveDb();
  return res.json({ success: true });
});
