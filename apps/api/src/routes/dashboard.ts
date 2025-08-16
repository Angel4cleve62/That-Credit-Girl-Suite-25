import { Router } from 'express';
import { requireFeature } from '../middleware/auth.js';
import { readEvents } from '../services/events.js';

export const dashboardRouter = Router();

dashboardRouter.get('/growth-tracker', requireFeature('ADMIN_PANEL'), async (_req, res) => {
  const events = await readEvents();
  res.json({ events });
});

dashboardRouter.get('/status', requireFeature('ADMIN_PANEL'), async (_req, res) => {
  // Placeholder metrics
  res.json({
    cusipLookups: 0,
    trustCreations: 0,
    einResolutions: 0,
    grantApps: 0,
    taxDeadlines: [],
    disputeTriggers: [],
  });
});