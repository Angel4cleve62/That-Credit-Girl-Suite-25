import { Router } from 'express';
import { requireFeature, AuthenticatedRequest } from '../middleware/auth.js';
import { uploadToS3 } from '../services/storage.js';
import { logEvent } from '../services/events.js';
import { randomUUID } from 'crypto';

export const uploadsRouter = Router();

uploadsRouter.post('/', requireFeature('CREDIT_REPAIR'), async (req: AuthenticatedRequest, res) => {
  const files = (req as any).files as Express.Multer.File[];
  const clientId = (req.body?.clientId as string) || req.user?.id || 'unknown';
  const uploaded: Array<{ key: string; url: string }> = [];
  for (const file of files || []) {
    const key = `${clientId}/${Date.now()}-${file.originalname}`;
    const url = await uploadToS3(key, file.buffer, file.mimetype);
    uploaded.push({ key, url });
  }
  await logEvent({ id: randomUUID(), type: 'upload.create', metadata: { clientId, count: uploaded.length } });
  res.json({ uploaded });
});