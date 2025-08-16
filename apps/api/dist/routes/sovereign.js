import { Router } from 'express';
import { requireFeature } from '../middleware/auth.js';
export const sovereignRouter = Router();
sovereignRouter.post('/ucc', requireFeature('SOVEREIGN_TOOLS'), async (req, res) => {
    const { form, autofill } = req.body;
    res.json({ form, fields: { ...autofill }, pdfUrl: null });
});
sovereignRouter.post('/trust/docs', requireFeature('SOVEREIGN_TOOLS'), async (req, res) => {
    const { custodian } = req.body;
    res.json({ checklist: [`${custodian} Trust Application`, 'Trust Agreement', 'EIN Letter'] });
});
sovereignRouter.post('/ein/match', requireFeature('SOVEREIGN_TOOLS'), async (req, res) => {
    const { ein, address } = req.body;
    res.json({ ein, address, status: 'PENDING_VERIFICATION' });
});
