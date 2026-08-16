import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { getDb } from './server/db.js';
import { realtime } from './server/realtime.js';
import { authRoutes } from './server/routes/authRoutes.js';
import { catalogRoutes } from './server/routes/catalogRoutes.js';
import { checkoutRoutes } from './server/routes/checkoutRoutes.js';
import { paymentRoutes } from './server/routes/paymentRoutes.js';
import { downloadRoutes } from './server/routes/downloadRoutes.js';
import { userRoutes } from './server/routes/userRoutes.js';
import { adminRoutes } from './server/routes/adminRoutes.js';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize DB
  getDb();

  // Basic Middlewares
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Static uploads directory for cover images and assets
  const uploadsDir = path.join(process.cwd(), 'uploads');
  app.use('/uploads', express.static(uploadsDir));

  // 1. SSE Realtime Event Stream Endpoint
  app.get('/api/events', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    const clientId = `client_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const userId = req.query.userId as string | undefined;

    realtime.addClient(clientId, res, userId);

    req.on('close', () => {
      realtime.removeClient(clientId);
    });
  });

  // 2. Health check
  app.get('/api/health', (req: Request, res: Response) => {
    const db = getDb();
    res.json({
      status: 'ok',
      platform: 'CYBER MUSIC',
      realtimeClients: realtime.getConnectedCount(),
      packagesCount: db.packages.length,
      timestamp: new Date().toISOString(),
    });
  });

  // 3. Mount API Route Handlers
  app.use('/api/auth', authRoutes);
  app.use('/api/catalog', catalogRoutes);
  app.use('/api/checkout', checkoutRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/downloads', downloadRoutes);
  app.use('/api/user', userRoutes);
  app.use('/api/admin', adminRoutes);

  // 4. Vite Middleware (Dev) vs Static Files (Prod)
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CYBER MUSIC] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
});
