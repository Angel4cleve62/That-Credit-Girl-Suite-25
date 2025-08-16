import { Router } from 'express';
import { requireFeature, AuthenticatedRequest } from '../middleware/auth.js';
import { parseTranscriptTo1040 } from '../services/taxTranscript.js';
import { logEvent } from '../services/events.js';
import { randomUUID } from 'crypto';

export const taxRouter = Router();

taxRouter.post('/transcripts/parse', requireFeature('TAX_BOT'), async (req: AuthenticatedRequest, res) => {
  const { transcriptText, options } = req.body as {
    transcriptText: string;
    options?: { year?: number; includeScheduleC?: boolean };
  };
  const result = await parseTranscriptTo1040(transcriptText, options);
  await logEvent({ id: randomUUID(), type: 'tax.transcript.parse', metadata: { year: result.form.year, includeScheduleC: !!options?.includeScheduleC } });
  res.json(result);
});