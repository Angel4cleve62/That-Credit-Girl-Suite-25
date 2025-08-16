import { Router } from 'express';
import { requireFeature } from '../middleware/auth.js';
import ExcelJS from 'exceljs';
import { PDFDocument, StandardFonts } from 'pdf-lib';

export const exportRouter = Router();

exportRouter.post('/xlsx', requireFeature('DELIVERY_CENTER'), async (req, res) => {
  const { rows } = req.body as { rows: Array<Record<string, any>> };
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Export');
  if (rows.length) sheet.columns = Object.keys(rows[0]).map((k) => ({ header: k, key: k }));
  rows.forEach((r) => sheet.addRow(r));
  const buffer = await workbook.xlsx.writeBuffer();
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(Buffer.from(buffer));
});

exportRouter.post('/pdf', requireFeature('DELIVERY_CENTER'), async (req, res) => {
  const { title = 'Export', content = '' } = req.body as { title?: string; content?: string };
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  page.drawText(title, { x: 50, y: 730, size: 18, font });
  page.drawText(content, { x: 50, y: 700, size: 11, font, lineHeight: 14, maxWidth: 512 });
  const pdf = await pdfDoc.save();
  res.setHeader('Content-Type', 'application/pdf');
  res.send(Buffer.from(pdf));
});