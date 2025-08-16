import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { usersById } from '../middleware/auth.js';
import { logEvent } from '../services/events.js';
import { randomUUID } from 'crypto';

export const authRouter = Router();

authRouter.post('/login', async (req, res) => {
  const { email } = req.body as { email?: string };
  const user = Object.values(usersById).find((u) => u.email === email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'dev-secret', {
    expiresIn: '7d',
  });
  await logEvent({ id: randomUUID(), type: 'auth.login', message: 'User logged in', metadata: { userId: user.id, email: user.email } });
  res.json({ token, user });
});

authRouter.get('/me', (req, res) => {
  res.json({ ok: true });
});