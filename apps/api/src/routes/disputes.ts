import { Router } from 'express';
import { requireFeature, AuthenticatedRequest } from '../middleware/auth.js';
import { generateDisputeLetter, generateComplaintLetter } from '../services/disputeLetters.js';
import { logEvent } from '../services/events.js';
import { randomUUID } from 'crypto';

export const disputesRouter = Router();

disputesRouter.post(
  '/generate',
  requireFeature('CREDIT_REPAIR'),
  async (req: AuthenticatedRequest, res) => {
    const { type, data, style, brandingMode } = req.body as {
      type: 'METRO2' | 'FCRA' | 'FDCPA' | 'ID_THEFT' | 'FRAUD_BLOCK_605B';
      data: Record<string, unknown>;
      style?: { tone?: string; signature?: string; headers?: string[] };
      brandingMode?: 'branded' | 'legal-neutral';
    };
    const pdf = await generateDisputeLetter({ type, data, style, brandingMode });
    await logEvent({ id: randomUUID(), type: 'dispute.generate', metadata: { type, brandingMode } });
    res.setHeader('Content-Type', 'application/pdf');
    res.send(Buffer.from(pdf));
  }
);

disputesRouter.post(
  '/complaint',
  requireFeature('CREDIT_REPAIR'),
  async (req: AuthenticatedRequest, res) => {
    const { agency, data } = req.body as {
      agency: 'CFPB' | 'BBB' | 'FTC';
      data: Record<string, unknown>;
    };
    const pdf = await generateComplaintLetter({ agency, data });
    await logEvent({ id: randomUUID(), type: 'dispute.complaint', metadata: { agency } });
    res.setHeader('Content-Type', 'application/pdf');
    res.send(Buffer.from(pdf));
  }
);