import { Router } from 'express';
import { usersById } from '../middleware/auth.js';
export const adminRouter = Router();
// Simple in-memory update API for features
adminRouter.post('/users/:id/features', (req, res) => {
    const { id } = req.params;
    const { features } = req.body;
    const user = usersById[id];
    if (!user)
        return res.status(404).json({ error: 'User not found' });
    user.features = Array.from(new Set(features));
    res.json({ user });
});
adminRouter.post('/users/:id/approve', (req, res) => {
    const { id } = req.params;
    const user = usersById[id];
    if (!user)
        return res.status(404).json({ error: 'User not found' });
    user.approved = true;
    res.json({ user });
});
