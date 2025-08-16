import { Router } from 'express';
import { requireFeature } from '../middleware/auth.js';
import { PDFDocument, StandardFonts } from 'pdf-lib';

export const labelsRouter = Router();

labelsRouter.post('/', requireFeature('DELIVERY_CENTER'), async (req, res) => {
  const { addresses } = req.body as { addresses: Array<{ name?: string; line1: string; line2?: string; city: string; state: string; zip: string }> };
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const cols = 3;
  const rows = 10;
  const labelWidth = 612 / cols;
  const labelHeight = 792 / rows;

  addresses.slice(0, cols * rows).forEach((addr, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const x = col * labelWidth + 20;
    const y = 792 - (row + 1) * labelHeight + labelHeight - 40;
    const lines = [addr.name, addr.line1, addr.line2, `${addr.city}, ${addr.state} ${addr.zip}`].filter(Boolean) as string[];
    lines.forEach((line, i) => {
      page.drawText(line, { x, y: y - i * 14, size: 11, font });
    });
  });

  const pdf = await pdfDoc.save();
  res.setHeader('Content-Type', 'application/pdf');
  res.send(Buffer.from(pdf));
});