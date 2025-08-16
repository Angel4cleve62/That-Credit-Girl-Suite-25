import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';

export async function addWatermark(pdfBytes: Uint8Array, text: string) {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const colorHex = process.env.BRAND_COLOR_PRIMARY || '#FF4DA6';
  const color = hexToRgb(colorHex);
  for (const page of pages) {
    const { width, height } = page.getSize();
    page.drawText(text, {
      x: width / 4,
      y: height / 2,
      size: 40,
      font,
      color,
      opacity: 0.15,
      rotate: degrees(-30),
    });
  }
  return await pdfDoc.save();
}

function hexToRgb(hex: string) {
  const sanitized = hex.replace('#', '');
  const bigint = parseInt(sanitized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return rgb(r / 255, g / 255, b / 255);
}