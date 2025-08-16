import { Router } from 'express';
import { requireFeature } from '../middleware/auth.js';
import { uploadToS3 } from '../services/storage.js';
export const uploadsRouter = Router();
uploadsRouter.post('/', requireFeature('CREDIT_REPAIR'), async (req, res) => {
    const files = req.files;
    const clientId = req.body?.clientId || req.user?.id || 'unknown';
    const uploaded = [];
    for (const file of files || []) {
        const key = `${clientId}/${Date.now()}-${file.originalname}`;
        const url = await uploadToS3(key, file.buffer, file.mimetype);
        uploaded.push({ key, url });
    }
    res.json({ uploaded });
});
