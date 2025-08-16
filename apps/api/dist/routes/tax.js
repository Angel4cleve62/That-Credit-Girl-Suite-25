import { Router } from 'express';
import { requireFeature } from '../middleware/auth.js';
import { parseTranscriptTo1040 } from '../services/taxTranscript.js';
export const taxRouter = Router();
taxRouter.post('/transcripts/parse', requireFeature('TAX_BOT'), async (req, res) => {
    const { transcriptText, options } = req.body;
    const result = await parseTranscriptTo1040(transcriptText, options);
    res.json(result);
});
