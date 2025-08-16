import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { usersById } from '../middleware/auth.js';
export const authRouter = Router();
authRouter.post('/login', (req, res) => {
    const { email } = req.body;
    const user = Object.values(usersById).find((u) => u.email === email);
    if (!user)
        return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'dev-secret', {
        expiresIn: '7d',
    });
    res.json({ token, user });
});
authRouter.get('/me', (req, res) => {
    res.json({ ok: true });
});
