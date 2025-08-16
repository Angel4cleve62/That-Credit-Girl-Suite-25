import { Router } from 'express';
import { requireFeature } from '../middleware/auth.js';
export const grantsRouter = Router();
grantsRouter.post('/plan', requireFeature('MARKETING'), async (req, res) => {
    const { businessName, mission, needs } = req.body;
    const plan = {
        businessName,
        mission,
        targetPrograms: needs.map((n) => ({ need: n, suggested: [`Grant for ${n}`, `Program assisting ${n}`] })),
        timeline: [
            { step: 'Research', dueInDays: 7 },
            { step: 'Draft applications', dueInDays: 21 },
            { step: 'Submit', dueInDays: 30 },
        ],
    };
    res.json({ plan });
});
grantsRouter.post('/template', requireFeature('MARKETING'), async (req, res) => {
    const { programName, applicant } = req.body;
    res.json({
        template: `Dear ${programName} Committee,\n\nMy name is ${applicant}. [Describe mission]... [Impact]... [Budget]...\n\nSincerely,\n${applicant}`,
    });
});
