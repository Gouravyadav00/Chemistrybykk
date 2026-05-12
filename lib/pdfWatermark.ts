import { promises as fs } from "node:fs";
import path from "node:path";
import {
  PDFDocument,
  PDFDict,
  PDFName,
  degrees,
  drawImage,
  type PDFPage,
} from "pdf-lib";

// Tunables — kept in sync with watermark_pdf.py
const CORNER_LOGO_WIDTH_PT = 48;        // ~17 mm
const CORNER_MARGIN_PT = 8.5;           // ~3 mm
const WATERMARK_WIDTH_RATIO = 0.72;     // fraction of page width
const MULTIPLY_GS_KEY = "GsMult";

// Module-scoped cache: image bytes warmed per Lambda invocation.
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

/**
 * Register an ExtGState entry with /BM /Multiply on the page's Resources and
 * return the name to reference it from a `gs` operator. Idempotent.
 */
function ensureMultiplyState(page: PDFPage): string {
  const Resources = page.node.normalizedEntries().Resources as PDFDict;
  let ExtGState = Resources.lookup(PDFName.of("ExtGState"), PDFDict) as
    | PDFDict
    | undefined;
  if (!ExtGState) {
    ExtGState = page.doc.context.obj({}) as PDFDict;
    Resources.set(PDFName.of("ExtGState"), ExtGState);
  }
  if (!ExtGState.get(PDFName.of(MULTIPLY_GS_KEY))) {
    ExtGState.set(
      PDFName.of(MULTIPLY_GS_KEY),
      page.doc.context.obj({
        Type: "ExtGState",
        BM: "Multiply",
        ca: 1.0,
        CA: 1.0,
      }),
    );
  }
  return MULTIPLY_GS_KEY;
}

export async function stampPdf(
  pdfBytes: ArrayBuffer | Uint8Array,
): Promise<Uint8Array> {
  const { logo, watermark } = await loadAssetBytes();
  const doc = await PDFDocument.load(pdfBytes, { updateMetadata: false });

  // Embed images once — pdf-lib references the same XObject from each page.
  const [logoImg, watermarkImg] = await Promise.all([
    doc.embedPng(logo),
    doc.embedPng(watermark),
  ]);

  for (const page of doc.getPages()) {
    const { width: pw, height: ph } = page.getSize();

    // ----- Centre watermark with /BM /Multiply (visually "under content") -----
    const gsKey = ensureMultiplyState(page);
    const wmXObjName = page.node.newXObject("WMimg", watermarkImg.ref);

    const wmW = pw * WATERMARK_WIDTH_RATIO;
    const wmH = wmW * (watermarkImg.height / watermarkImg.width);

    page.pushOperators(
      ...drawImage(wmXObjName, {
        x: (pw - wmW) / 2,
        y: (ph - wmH) / 2,
        width: wmW,
        height: wmH,
        rotate: degrees(0),
        xSkew: degrees(0),
        ySkew: degrees(0),
        graphicsState: gsKey,
      }),
    );

    // ----- Top-right crisp logo, normal blend ON TOP -----
    const lgH = CORNER_LOGO_WIDTH_PT * (logoImg.height / logoImg.width);
    page.drawImage(logoImg, {
      x: pw - CORNER_LOGO_WIDTH_PT - CORNER_MARGIN_PT,
      y: ph - lgH - CORNER_MARGIN_PT,
      width: CORNER_LOGO_WIDTH_PT,
      height: lgH,
    });
  }

  return doc.save({ useObjectStreams: true });
}

export function isPdfFileName(name: string): boolean {
  return /\.pdf(\?|$)/i.test(name);
}
