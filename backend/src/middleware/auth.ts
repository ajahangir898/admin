import type { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';
import { getAdminAuth } from '../services/firebaseAdmin.js';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  if (!env.requireAuth) {
    return next();
  }

  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  const token = header.slice('Bearer '.length).trim();
  const auth = getAdminAuth();
  if (!auth) {
    return res.status(500).json({ error: 'Auth service not configured' });
  }

  try {
    const decoded = await auth.verifyIdToken(token);
    (req as Request & { user?: typeof decoded }).user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
