import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export async function generateDisputeLetter(args: {
  type: 'METRO2' | 'FCRA' | 'FDCPA' | 'ID_THEFT' | 'FRAUD_BLOCK_605B';
  data: Record<string, unknown>;
  style?: { tone?: string; signature?: string; headers?: string[] };
  brandingMode?: 'branded' | 'legal-neutral';
}): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const { brandingMode = process.env.BRAND_MODE === 'legal-neutral' ? 'legal-neutral' : 'branded' } = args;
  const title = `Dispute Letter - ${args.type}`;
  const brandColor = brandingMode === 'branded' ? hexToRgb(process.env.BRAND_COLOR_PRIMARY || '#FF4DA6') : rgb(0, 0, 0);

  page.drawRectangle({ x: 0, y: 752, width: 612, height: 40, color: brandColor, opacity: brandingMode === 'branded' ? 0.2 : 0 });
  page.drawText(title, { x: 50, y: 730, size: 18, font: fontBold, color: rgb(0.1, 0.1, 0.1) });

  const body = `This letter pertains to ${args.type} dispute. Data: ${JSON.stringify(args.data, null, 2)}`;
  page.drawText(body, {
    x: 50,
    y: 700,
    size: 11,
    font,
    color: rgb(0.1, 0.1, 0.1),
    lineHeight: 14,
    maxWidth: 512,
  });

  if (args.style?.signature) {
    page.drawText(`Signed,\n${args.style.signature}`, { x: 50, y: 150, size: 12, font });
  }

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

export async function generateComplaintLetter(args: {
  agency: 'CFPB' | 'BBB' | 'FTC';
  data: Record<string, unknown>;
}): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const title = `${args.agency} Complaint`;
  page.drawText(title, { x: 50, y: 730, size: 18, font: fontBold });
  const body = `Complaint details: ${JSON.stringify(args.data, null, 2)}`;
  page.drawText(body, { x: 50, y: 700, size: 11, font, lineHeight: 14, maxWidth: 512 });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

function hexToRgb(hex: string) {
  const sanitized = hex.replace('#', '');
  const bigint = parseInt(sanitized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return rgb(r / 255, g / 255, b / 255);
}