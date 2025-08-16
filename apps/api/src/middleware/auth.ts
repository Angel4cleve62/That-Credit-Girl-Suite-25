import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export type Role = 'admin' | 'staff' | 'client';

export type FeatureKey =
  | 'CREDIT_REPAIR'
  | 'SOVEREIGN_TOOLS'
  | 'CUSIP'
  | 'TAX_BOT'
  | 'DELIVERY_CENTER'
  | 'MARKETING'
  | 'TRAINING'
  | 'ADMIN_PANEL';

export interface User {
  id: string;
  email: string;
  role: Role;
  features: FeatureKey[];
  approved: boolean;
  trustedDevices: string[];
}

// Simple in-memory user map for scaffolding
export const usersById: Record<string, User> = Object.create(null);

export function seedUsers() {
  usersById['1'] = {
    id: '1',
    email: 'admin@example.com',
    role: 'admin',
    features: [
      'CREDIT_REPAIR',
      'SOVEREIGN_TOOLS',
      'CUSIP',
      'TAX_BOT',
      'DELIVERY_CENTER',
      'MARKETING',
      'TRAINING',
      'ADMIN_PANEL',
    ],
    approved: true,
    trustedDevices: [],
  };
}

seedUsers();

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export function authenticateRequest(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length)
    : undefined;
  if (!token) {
    return res.status(401).json({ error: 'Missing token' });
  }
  try {
    const secret = process.env.JWT_SECRET || 'dev-secret';
    const payload = jwt.verify(token, secret) as { userId: string };
    const user = usersById[payload.userId];
    if (!user) return res.status(401).json({ error: 'Invalid token' });
    if (!user.approved) return res.status(403).json({ error: 'Account pending approval' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function requireFeature(feature: FeatureKey) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    if (user.role === 'admin') return next();
    if (!user.features.includes(feature)) {
      return res.status(403).json({ error: 'Feature not enabled for this account' });
    }
    next();
  };
}