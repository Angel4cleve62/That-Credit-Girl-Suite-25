import { Router } from 'express';
import { requireFeature } from '../middleware/auth.js';
import { generateDisputeLetter, generateComplaintLetter } from '../services/disputeLetters.js';
export const disputesRouter = Router();
disputesRouter.post('/generate', requireFeature('CREDIT_REPAIR'), async (req, res) => {
    const { type, data, style, brandingMode } = req.body;
    const pdf = await generateDisputeLetter({ type, data, style, brandingMode });
    res.setHeader('Content-Type', 'application/pdf');
    res.send(Buffer.from(pdf));
});
disputesRouter.post('/complaint', requireFeature('CREDIT_REPAIR'), async (req, res) => {
    const { agency, data } = req.body;
    const pdf = await generateComplaintLetter({ agency, data });
    res.setHeader('Content-Type', 'application/pdf');
    res.send(Buffer.from(pdf));
});
