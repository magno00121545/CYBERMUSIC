import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getDb } from './db.js';
import { User, UserRole } from '../src/types/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'cyber_music_super_secure_jwt_secret_2026_key';

export interface AuthRequest extends Request {
  user?: User;
}

export function generateToken(user: User): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyAuthToken(token: string): User | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const db = getDb();
    const user = db.users.find(u => u.id === decoded.id);
    return user || null;
  } catch (err) {
    return null;
  }
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Não autorizado. Token de autenticação não fornecido.' });
  }

  const token = authHeader.split(' ')[1];
  const user = verifyAuthToken(token);

  if (!user) {
    return res.status(401).json({ error: 'Sessão expirada ou token inválido.' });
  }

  req.user = user;
  next();
}

export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const user = verifyAuthToken(token);
    if (user) {
      req.user = user;
    }
  }
  next();
}

export function requireRoles(...allowedRoles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Autenticação necessária.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Acesso negado. Esta operação requer permissão de: ${allowedRoles.join(', ')}.`,
      });
    }

    next();
  };
}

// Download Link Signer / Verifier
export function generateDownloadToken(userId: string, packageId: string, songId: string | null = null, expiryMinutes = 30): string {
  return jwt.sign(
    {
      type: 'DOWNLOAD_TOKEN',
      userId,
      packageId,
      songId,
    },
    JWT_SECRET,
    { expiresIn: `${expiryMinutes}m` }
  );
}

export function verifyDownloadToken(token: string): { userId: string; packageId: string; songId: string | null } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.type !== 'DOWNLOAD_TOKEN') return null;
    return {
      userId: decoded.userId,
      packageId: decoded.packageId,
      songId: decoded.songId || null,
    };
  } catch (err) {
    return null;
  }
}
