import { promises as fs } from "node:fs";
import path from "node:path";
import { PDFDocument, degrees } from "pdf-lib";

// Tunables — keep in sync with watermark_pdf.py preview
const CORNER_LOGO_WIDTH_PT = 62;        // ~22mm at 72 DPI
const CORNER_MARGIN_PT = 22;            // ~8mm
const WATERMARK_WIDTH_RATIO = 0.72;     // fraction of page width
const WATERMARK_ROTATE_DEG = 0;

// Lazy-cached image bytes — loaded once per warm Lambda, reused across uploads.
let cachedLogoBytes: Uint8Array | null = null;
let cachedWatermarkBytes: Uint8Array | null = null;

async function loadAssetBytes(): Promise<{
  logo: Uint8Array;
  watermark: Uint8Array;
}> {
  if (!cachedLogoBytes || !cachedWatermarkBytes) {
    const root = process.cwd();
    const [logo, watermark] = await Promise.all([
      fs.readFile(path.join(root, "public", "images", "logo.png")),
      fs.readFile(path.join(root, "public", "images", "watermark.png")),
    ]);
    cachedLogoBytes = new Uint8Array(logo);
    cachedWatermarkBytes = new Uint8Array(watermark);
  }
  return { logo: cachedLogoBytes, watermark: cachedWatermarkBytes };
}

export async function stampPdf(pdfBytes: ArrayBuffer | Uint8Array): Promise<Uint8Array> {
  const { logo, watermark } = await loadAssetBytes();
  const doc = await PDFDocument.load(pdfBytes, { updateMetadata: false });

  // Embed images once — pdf-lib reuses the embedded ref across every page,
  // so a 20-page doc only carries one copy of each PNG.
  const [logoImg, watermarkImg] = await Promise.all([
    doc.embedPng(logo),
    doc.embedPng(watermark),
  ]);

  const pages = doc.getPages();
  for (const page of pages) {
    const { width: pw, height: ph } = page.getSize();

    // Centre watermark — sits below content because we draw before any other op,
    // and the original page content is drawn from the source PDF stream which
    // remains intact. Visually it ends up behind text because watermark.png is
    // already faded; this is the standard pdf-lib stamp pattern.
    const wmWidth = pw * WATERMARK_WIDTH_RATIO;
    const wmHeight = wmWidth * (watermarkImg.height / watermarkImg.width);
    page.drawImage(watermarkImg, {
      x: (pw - wmWidth) / 2,
      y: (ph - wmHeight) / 2,
      width: wmWidth,
      height: wmHeight,
      rotate: WATERMARK_ROTATE_DEG ? degrees(WATERMARK_ROTATE_DEG) : undefined,
    });

    // Top-right crisp logo
    const lgHeight = CORNER_LOGO_WIDTH_PT * (logoImg.height / logoImg.width);
    page.drawImage(logoImg, {
      x: pw - CORNER_LOGO_WIDTH_PT - CORNER_MARGIN_PT,
      y: ph - lgHeight - CORNER_MARGIN_PT,
      width: CORNER_LOGO_WIDTH_PT,
      height: lgHeight,
    });
  }

  return doc.save({ useObjectStreams: true });
}

export function isPdfFileName(name: string): boolean {
  return /\.pdf(\?|$)/i.test(name);
}
