import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { getDb, saveDb, createBackup, listBackups, restoreBackup, logActivity } from '../db.js';
import { requireAuth, requireRoles, AuthRequest } from '../auth.js';
import { realtime } from '../realtime.js';
import { Package, Song, Category, Coupon, AppNotification, DashboardStats } from '../../src/types/index.js';
import { approveOrder } from './paymentRoutes.js';

export const adminRoutes = Router();

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
const COVERS_DIR = path.join(UPLOADS_DIR, 'covers');
const AUDIO_DIR = path.join(UPLOADS_DIR, 'audio');

// Multer Storage Configuration
const coverStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, COVERS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `cover_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${ext}`);
  },
});

const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, AUDIO_DIR),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `audio_${Date.now()}_${safeName}`);
  },
});

const uploadCover = multer({
  storage: coverStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas para capa.'));
    }
  },
});

const uploadAudio = multer({
  storage: audioStorage,
  limits: { fileSize: 250 * 1024 * 1024 }, // 250MB per file
  fileFilter: (req, file, cb) => {
    const allowed = ['.mp3', '.wav', '.flac', '.m4a'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext) || file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Formato inválido. Apenas MP3, WAV, FLAC e M4A são permitidos.'));
    }
  },
});

// 1. Dashboard Statistics
adminRoutes.get('/stats', requireAuth, requireRoles('ADMIN', 'EDITOR', 'SUPORTE'), (req: AuthRequest, res: Response) => {
  const db = getDb();

  const totalUsers = db.users.filter(u => u.role === 'USER').length;
  const totalSales = db.orders.length;
  const paidSales = db.orders.filter(o => o.status === 'PAID');
  const pendingSales = db.orders.filter(o => o.status === 'PENDING');
  const totalRevenue = paidSales.reduce((acc, o) => acc + o.total_amount, 0);
  const totalDownloads = db.downloads.length;

  // Compute bestsellers
  const pkgSalesMap = new Map<string, { count: number; revenue: number }>();
  for (const o of paidSales) {
    for (const item of o.items) {
      const current = pkgSalesMap.get(item.package_id) || { count: 0, revenue: 0 };
      pkgSalesMap.set(item.package_id, {
        count: current.count + 1,
        revenue: current.revenue + item.price_at_purchase,
      });
    }
  }

  const bestsellers = Array.from(pkgSalesMap.entries())
    .map(([pkgId, data]) => {
      const pkg = db.packages.find(p => p.id === pkgId);
      return {
        id: pkgId,
        title: pkg?.title || 'Pacote Removido',
        cover_image: pkg?.cover_image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400',
        sales_count: data.count,
        revenue: data.revenue,
      };
    })
    .sort((a, b) => b.sales_count - a.sales_count)
    .slice(0, 5);

  const stats: DashboardStats = {
    totalUsers,
    totalSales,
    paidSalesCount: paidSales.length,
    pendingSalesCount: pendingSales.length,
    totalRevenue,
    totalDownloads,
    bestsellers,
    recentOrders: db.orders.slice(0, 10),
    recentActivities: db.activity_logs.slice(0, 15),
  };

  return res.json(stats);
});

// 2. Packages Management
adminRoutes.get('/packages', requireAuth, requireRoles('ADMIN', 'EDITOR', 'SUPORTE'), (req: AuthRequest, res: Response) => {
  const db = getDb();
  const packages = db.packages.map(pkg => {
    const cat = db.categories.find(c => c.id === pkg.category_id);
    const songs = db.songs.filter(s => s.package_id === pkg.id);
    return {
      ...pkg,
      category_name: cat?.name || 'Geral',
      total_tracks: songs.length,
      songs,
    };
  });
  return res.json(packages);
});

// Create Package
adminRoutes.post('/packages', requireAuth, requireRoles('ADMIN', 'EDITOR'), (req: AuthRequest, res: Response) => {
  try {
    const { title, description, category_id, cover_image, price, discount_price, is_active, is_featured, is_bestseller, is_new, display_order } = req.body;

    if (!title || price === undefined || !category_id) {
      return res.status(400).json({ error: 'Título, categoria e preço são obrigatórios.' });
    }

    const db = getDb();
    const pkgId = `pkg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const slug = title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const newPkg: Package = {
      id: pkgId,
      title: title.trim(),
      slug,
      description: description ? description.trim() : '',
      category_id,
      cover_image: cover_image || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600',
      price: parseFloat(price),
      discount_price: discount_price ? parseFloat(discount_price) : null,
      is_active: is_active !== false,
      is_featured: !!is_featured,
      is_bestseller: !!is_bestseller,
      is_new: is_new !== false,
      display_order: display_order ? parseInt(display_order) : db.packages.length + 1,
      total_size: 0,
      total_tracks: 0,
      created_at: new Date().toISOString(),
    };

    db.packages.unshift(newPkg);
    saveDb();

    logActivity(req.user!.id, req.user!.email, 'CREATE_PACKAGE', `Novo pacote criado: ${newPkg.title} (R$ ${newPkg.price})`);

    // Broadcast Real-time event to all connected devices!
    realtime.broadcast('CATALOG_UPDATED', {
      action: 'PACKAGE_CREATED',
      packageId: newPkg.id,
      title: newPkg.title,
    });

    return res.status(201).json(newPkg);
  } catch (err: any) {
    return res.status(500).json({ error: 'Erro ao criar pacote.' });
  }
});

// Update Package
adminRoutes.put('/packages/:id', requireAuth, requireRoles('ADMIN', 'EDITOR'), (req: AuthRequest, res: Response) => {
  try {
    const db = getDb();
    const index = db.packages.findIndex(p => p.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Pacote não encontrado.' });
    }

    const { title, description, category_id, cover_image, price, discount_price, is_active, is_featured, is_bestseller, is_new, display_order } = req.body;

    if (title) db.packages[index].title = title.trim();
    if (description !== undefined) db.packages[index].description = description.trim();
    if (category_id) db.packages[index].category_id = category_id;
    if (cover_image) db.packages[index].cover_image = cover_image;
    if (price !== undefined) db.packages[index].price = parseFloat(price);
    if (discount_price !== undefined) db.packages[index].discount_price = discount_price ? parseFloat(discount_price) : null;
    if (is_active !== undefined) db.packages[index].is_active = is_active;
    if (is_featured !== undefined) db.packages[index].is_featured = is_featured;
    if (is_bestseller !== undefined) db.packages[index].is_bestseller = is_bestseller;
    if (is_new !== undefined) db.packages[index].is_new = is_new;
    if (display_order !== undefined) db.packages[index].display_order = parseInt(display_order);

    saveDb();

    logActivity(req.user!.id, req.user!.email, 'UPDATE_PACKAGE', `Pacote atualizado: ${db.packages[index].title}`);

    // Broadcast Real-time event!
    realtime.broadcast('CATALOG_UPDATED', {
      action: 'PACKAGE_UPDATED',
      packageId: db.packages[index].id,
      title: db.packages[index].title,
      price: db.packages[index].discount_price || db.packages[index].price,
      is_active: db.packages[index].is_active,
    });

    return res.json(db.packages[index]);
  } catch (err: any) {
    return res.status(500).json({ error: 'Erro ao atualizar pacote.' });
  }
});

// Delete Package
adminRoutes.delete('/packages/:id', requireAuth, requireRoles('ADMIN'), (req: AuthRequest, res: Response) => {
  const db = getDb();
  const pkg = db.packages.find(p => p.id === req.params.id);

  if (!pkg) {
    return res.status(404).json({ error: 'Pacote não encontrado.' });
  }

  db.packages = db.packages.filter(p => p.id !== req.params.id);
  db.songs = db.songs.filter(s => s.package_id !== req.params.id);
  saveDb();

  logActivity(req.user!.id, req.user!.email, 'DELETE_PACKAGE', `Pacote excluído: ${pkg.title}`);

  realtime.broadcast('CATALOG_UPDATED', {
    action: 'PACKAGE_DELETED',
    packageId: req.params.id,
  });

  return res.json({ success: true, message: 'Pacote e faixas excluídos com sucesso.' });
});

// Upload Cover Image
adminRoutes.post('/upload-cover', requireAuth, requireRoles('ADMIN', 'EDITOR'), uploadCover.single('cover'), (req: AuthRequest, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhuma imagem foi enviada.' });
  }
  const coverUrl = `/uploads/covers/${req.file.filename}`;
  return res.json({ url: coverUrl });
});

// Multiple Audio Files Upload to Package
adminRoutes.post('/packages/:id/upload-songs', requireAuth, requireRoles('ADMIN', 'EDITOR'), uploadAudio.array('audio_files', 50), (req: AuthRequest, res: Response) => {
  try {
    const db = getDb();
    const pkg = db.packages.find(p => p.id === req.params.id);

    if (!pkg) {
      return res.status(404).json({ error: 'Pacote não encontrado.' });
    }

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'Nenhum arquivo de áudio foi enviado.' });
    }

    const existingSongs = db.songs.filter(s => s.package_id === pkg.id);
    let startTrackNum = existingSongs.length + 1;
    const newSongs: Song[] = [];
    let addedBytes = 0;

    for (const file of files) {
      const ext = path.extname(file.originalname).replace('.', '').toLowerCase() as any;
      const baseName = path.basename(file.originalname, path.extname(file.originalname));
      
      // Attempt to split artist - title if named like "Artist - Title"
      let artist = 'Cyber Producer';
      let title = baseName;
      if (baseName.includes(' - ')) {
        const parts = baseName.split(' - ');
        artist = parts[0].trim();
        title = parts.slice(1).join(' - ').trim();
      }

      const song: Song = {
        id: `sng_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        package_id: pkg.id,
        title,
        artist,
        duration_seconds: Math.floor(160 + Math.random() * 100), // Approximate duration
        file_path: file.filename,
        file_size: file.size,
        file_format: ['mp3', 'wav', 'flac', 'm4a'].includes(ext) ? ext : 'mp3',
        track_number: startTrackNum++,
        created_at: new Date().toISOString(),
      };

      newSongs.push(song);
      db.songs.push(song);
      addedBytes += file.size;
    }

    // Update package aggregates
    pkg.total_tracks = (pkg.total_tracks || 0) + newSongs.length;
    pkg.total_size = (pkg.total_size || 0) + addedBytes;
    saveDb();

    logActivity(req.user!.id, req.user!.email, 'UPLOAD_SONGS', `Enviadas ${newSongs.length} músicas para o pacote: ${pkg.title}`);

    realtime.broadcast('CATALOG_UPDATED', {
      action: 'SONGS_UPLOADED',
      packageId: pkg.id,
      tracksAdded: newSongs.length,
    });

    return res.status(201).json({
      message: `${newSongs.length} faixas adicionadas com sucesso!`,
      songs: newSongs,
      total_tracks: pkg.total_tracks,
      total_size: pkg.total_size,
    });
  } catch (err: any) {
    console.error('Audio upload error:', err);
    return res.status(500).json({ error: 'Erro no processamento de upload dos áudios.' });
  }
});

// Update Song Details
adminRoutes.put('/songs/:id', requireAuth, requireRoles('ADMIN', 'EDITOR'), (req: AuthRequest, res: Response) => {
  const db = getDb();
  const song = db.songs.find(s => s.id === req.params.id);

  if (!song) {
    return res.status(404).json({ error: 'Música não encontrada.' });
  }

  const { title, artist, track_number } = req.body;
  if (title) song.title = title.trim();
  if (artist) song.artist = artist.trim();
  if (track_number !== undefined) song.track_number = parseInt(track_number);

  saveDb();
  return res.json(song);
});

// Delete Song
adminRoutes.delete('/songs/:id', requireAuth, requireRoles('ADMIN', 'EDITOR'), (req: AuthRequest, res: Response) => {
  const db = getDb();
  const song = db.songs.find(s => s.id === req.params.id);

  if (!song) {
    return res.status(404).json({ error: 'Música não encontrada.' });
  }

  const pkg = db.packages.find(p => p.id === song.package_id);
  db.songs = db.songs.filter(s => s.id !== req.params.id);

  if (pkg) {
    const remaining = db.songs.filter(s => s.package_id === pkg.id);
    pkg.total_tracks = remaining.length;
    pkg.total_size = remaining.reduce((acc, s) => acc + s.file_size, 0);
  }

  saveDb();
  return res.json({ success: true, message: 'Música removida com sucesso.' });
});

// 3. Categories Management
adminRoutes.get('/categories', requireAuth, requireRoles('ADMIN', 'EDITOR', 'SUPORTE'), (req: AuthRequest, res: Response) => {
  const db = getDb();
  return res.json(db.categories);
});

adminRoutes.post('/categories', requireAuth, requireRoles('ADMIN', 'EDITOR'), (req: AuthRequest, res: Response) => {
  const { name, icon, description, display_order } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Nome da categoria é obrigatório.' });
  }

  const db = getDb();
  const catId = `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-');

  const newCat: Category = {
    id: catId,
    name: name.trim(),
    slug,
    icon: icon || 'Music',
    description: description ? description.trim() : '',
    display_order: display_order ? parseInt(display_order) : db.categories.length + 1,
    is_active: true,
    created_at: new Date().toISOString(),
  };

  db.categories.push(newCat);
  saveDb();

  realtime.broadcast('CATALOG_UPDATED', { action: 'CATEGORY_CREATED' });
  return res.status(201).json(newCat);
});

adminRoutes.put('/categories/:id', requireAuth, requireRoles('ADMIN', 'EDITOR'), (req: AuthRequest, res: Response) => {
  const db = getDb();
  const cat = db.categories.find(c => c.id === req.params.id);

  if (!cat) {
    return res.status(404).json({ error: 'Categoria não encontrada.' });
  }

  const { name, icon, description, display_order, is_active } = req.body;
  if (name) cat.name = name.trim();
  if (icon) cat.icon = icon;
  if (description !== undefined) cat.description = description.trim();
  if (display_order !== undefined) cat.display_order = parseInt(display_order);
  if (is_active !== undefined) cat.is_active = is_active;

  saveDb();
  realtime.broadcast('CATALOG_UPDATED', { action: 'CATEGORY_UPDATED' });
  return res.json(cat);
});

adminRoutes.delete('/categories/:id', requireAuth, requireRoles('ADMIN'), (req: AuthRequest, res: Response) => {
  const db = getDb();
  db.categories = db.categories.filter(c => c.id !== req.params.id);
  saveDb();
  realtime.broadcast('CATALOG_UPDATED', { action: 'CATEGORY_DELETED' });
  return res.json({ success: true });
});

// 4. Orders Management
adminRoutes.get('/orders', requireAuth, requireRoles('ADMIN', 'SUPORTE'), (req: AuthRequest, res: Response) => {
  const db = getDb();
  const orders = db.orders.map(order => {
    const payment = db.payments.find(p => p.order_id === order.id);
    return {
      ...order,
      payment,
    };
  });
  return res.json(orders);
});

adminRoutes.put('/orders/:id/approve-manual', requireAuth, requireRoles('ADMIN', 'SUPORTE'), (req: AuthRequest, res: Response) => {
  const result = approveOrder(req.params.id, `MANUAL_BY_${req.user!.email}`);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  return res.json({ success: true, message: 'Pedido aprovado manualmente!', order: result.order });
});

// 5. Coupons Management
adminRoutes.get('/coupons', requireAuth, requireRoles('ADMIN', 'EDITOR'), (req: AuthRequest, res: Response) => {
  const db = getDb();
  return res.json(db.coupons);
});

adminRoutes.post('/coupons', requireAuth, requireRoles('ADMIN', 'EDITOR'), (req: AuthRequest, res: Response) => {
  const { code, discount_type, discount_value, min_order_value, max_uses, expires_at } = req.body;
  if (!code || !discount_value) {
    return res.status(400).json({ error: 'Código e valor do desconto são obrigatórios.' });
  }

  const db = getDb();
  const newCoupon: Coupon = {
    id: `cpn_${Date.now()}`,
    code: code.toUpperCase().trim(),
    discount_type: discount_type || 'PERCENTAGE',
    discount_value: parseFloat(discount_value),
    min_order_value: min_order_value ? parseFloat(min_order_value) : undefined,
    max_uses: max_uses ? parseInt(max_uses) : undefined,
    uses_count: 0,
    expires_at: expires_at || null,
    is_active: true,
    created_at: new Date().toISOString(),
  };

  db.coupons.unshift(newCoupon);
  saveDb();
  return res.status(201).json(newCoupon);
});

adminRoutes.delete('/coupons/:id', requireAuth, requireRoles('ADMIN'), (req: AuthRequest, res: Response) => {
  const db = getDb();
  db.coupons = db.coupons.filter(c => c.id !== req.params.id);
  saveDb();
  return res.json({ success: true });
});

// 6. Users & Roles Management (ADMIN Only)
adminRoutes.get('/users', requireAuth, requireRoles('ADMIN', 'SUPORTE'), (req: AuthRequest, res: Response) => {
  const db = getDb();
  const usersWithStats = db.users.map(u => {
    const orders = db.orders.filter(o => o.user_id === u.id);
    const paidOrders = orders.filter(o => o.status === 'PAID');
    const spent = paidOrders.reduce((acc, o) => acc + o.total_amount, 0);
    return {
      ...u,
      total_orders: orders.length,
      paid_orders: paidOrders.length,
      total_spent: spent,
    };
  });
  return res.json(usersWithStats);
});

adminRoutes.put('/users/:id', requireAuth, requireRoles('ADMIN'), (req: AuthRequest, res: Response) => {
  const { username, password } = req.body;
  const db = getDb();
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

  if (username) {
      const usernameExists = db.users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.id !== user.id);
      if (usernameExists) return res.status(400).json({ error: 'Usuário já existe.' });
      user.username = username;
  }
  if (password) {
      const salt = bcrypt.genSaltSync(10);
      db.user_passwords[user.id] = bcrypt.hashSync(password, salt);
  }
  saveDb();
  return res.json({ success: true, user });
});

adminRoutes.put('/users/:id/role', requireAuth, requireRoles('ADMIN'), (req: AuthRequest, res: Response) => {
  const { role } = req.body;
  if (!['ADMIN', 'EDITOR', 'SUPORTE', 'USER'].includes(role)) {
    return res.status(400).json({ error: 'Nível de permissão inválido.' });
  }

  const db = getDb();
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado.' });
  }

  user.role = role;
  saveDb();
  logActivity(req.user!.id, req.user!.email, 'CHANGE_USER_ROLE', `Alterou nível de ${user.email} para ${role}`);
  return res.json({ success: true, user });
});

// 7. Broadcast Notifications
adminRoutes.post('/notifications/broadcast', requireAuth, requireRoles('ADMIN', 'EDITOR'), (req: AuthRequest, res: Response) => {
  const { title, message, type, link } = req.body;
  if (!title || !message) {
    return res.status(400).json({ error: 'Título e mensagem são obrigatórios.' });
  }

  const db = getDb();
  const notif: AppNotification = {
    id: `notif_${Date.now()}`,
    title: title.trim(),
    message: message.trim(),
    type: type || 'SYSTEM',
    target_user_id: null, // broadcast
    link: link || '/#pacotes',
    is_read: false,
    created_at: new Date().toISOString(),
  };

  db.notifications.unshift(notif);
  saveDb();

  // Push via SSE
  realtime.broadcast('GLOBAL_NOTIFICATION', notif);
  logActivity(req.user!.id, req.user!.email, 'BROADCAST_NOTIFICATION', `Notificação enviada: "${title}"`);

  return res.status(201).json(notif);
});

// 8. Backups Management
adminRoutes.get('/backups', requireAuth, requireRoles('ADMIN'), (req: AuthRequest, res: Response) => {
  const backups = listBackups();
  return res.json(backups);
});

adminRoutes.post('/backups/create', requireAuth, requireRoles('ADMIN'), (req: AuthRequest, res: Response) => {
  try {
    const backup = createBackup();
    logActivity(req.user!.id, req.user!.email, 'CREATE_BACKUP', `Backup criado: ${backup.filename}`);
    return res.status(201).json(backup);
  } catch (err: any) {
    return res.status(500).json({ error: 'Erro ao gerar backup.' });
  }
});

adminRoutes.post('/backups/restore', requireAuth, requireRoles('ADMIN'), (req: AuthRequest, res: Response) => {
  const { filename } = req.body;
  if (!filename) {
    return res.status(400).json({ error: 'Nome do arquivo de backup obrigatório.' });
  }

  const success = restoreBackup(filename);
  if (!success) {
    return res.status(400).json({ error: 'Falha ao restaurar backup.' });
  }

  logActivity(req.user!.id, req.user!.email, 'RESTORE_BACKUP', `Backup restaurado: ${filename}`);
  realtime.broadcast('CATALOG_UPDATED', { action: 'DATABASE_RESTORED' });

  return res.json({ success: true, message: 'Banco de dados restaurado com sucesso!' });
});

// 9. Activity Logs
adminRoutes.get('/logs', requireAuth, requireRoles('ADMIN', 'SUPORTE'), (req: AuthRequest, res: Response) => {
  const db = getDb();
  return res.json(db.activity_logs);
});

// 10. Settings Management
adminRoutes.get('/settings', requireAuth, requireRoles('ADMIN'), (req: AuthRequest, res: Response) => {
  const db = getDb();
  return res.json(db.settings);
});

adminRoutes.put('/settings', requireAuth, requireRoles('ADMIN'), (req: AuthRequest, res: Response) => {
  const db = getDb();
  db.settings = { ...db.settings, ...req.body };
  saveDb();
  return res.json(db.settings);
});
