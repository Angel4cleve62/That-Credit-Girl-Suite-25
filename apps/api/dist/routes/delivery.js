import { Router } from 'express';
import { requireFeature } from '../middleware/auth.js';
import { sendEmail } from '../services/email.js';
import { createZip } from '../services/zip.js';
import { generateCsv } from '../services/csv.js';
import { PDFDocument, StandardFonts } from 'pdf-lib';
export const deliveryRouter = Router();
deliveryRouter.post('/email', requireFeature('DELIVERY_CENTER'), async (req, res) => {
    const { to, subject, html, attachments = [] } = req.body;
    const id = await sendEmail({
        to,
        subject,
        html,
        attachments: attachments.map((a) => ({ filename: a.filename, content: Buffer.from(a.contentBase64, 'base64'), contentType: a.contentType })),
    });
    res.json({ messageId: id });
});
deliveryRouter.post('/zip', requireFeature('DELIVERY_CENTER'), async (req, res) => {
    const { files } = req.body;
    const buf = createZip(files.map((f) => ({ pathInZip: f.pathInZip, content: Buffer.from(f.contentBase64, 'base64') })));
    res.setHeader('Content-Type', 'application/zip');
    res.send(buf);
});
deliveryRouter.post('/csv', requireFeature('DELIVERY_CENTER'), async (req, res) => {
    const { rows } = req.body;
    const csv = generateCsv(rows);
    res.setHeader('Content-Type', 'text/csv');
    res.send(csv);
});
deliveryRouter.post('/pdf/simple', requireFeature('DELIVERY_CENTER'), async (req, res) => {
    const { title = 'Document', content = '' } = req.body;
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    page.drawText(title, { x: 50, y: 730, size: 18, font });
    page.drawText(content, { x: 50, y: 700, size: 11, font, lineHeight: 14, maxWidth: 512 });
    const pdf = await pdfDoc.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.send(Buffer.from(pdf));
});
