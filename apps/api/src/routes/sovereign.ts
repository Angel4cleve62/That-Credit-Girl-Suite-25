import { Router } from 'express';
import { requireFeature } from '../middleware/auth.js';

export const sovereignRouter = Router();

sovereignRouter.post('/ucc', requireFeature('SOVEREIGN_TOOLS'), async (req, res) => {
  const { form, autofill } = req.body as { form: 'UCC-1' | 'UCC-3'; autofill: Record<string, string> };
  res.json({ form, fields: { ...autofill }, pdfUrl: null });
});

sovereignRouter.post('/trust/docs', requireFeature('SOVEREIGN_TOOLS'), async (req, res) => {
  const { custodian } = req.body as { custodian: 'Schwab' | 'Fidelity' | 'TDA' };
  res.json({ checklist: [`${custodian} Trust Application`, 'Trust Agreement', 'EIN Letter'] });
});

sovereignRouter.post('/ein/match', requireFeature('SOVEREIGN_TOOLS'), async (req, res) => {
  const { ein, address } = req.body as { ein: string; address: string };
  res.json({ ein, address, status: 'PENDING_VERIFICATION' });
});