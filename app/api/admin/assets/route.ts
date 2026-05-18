import { del, put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { findClass } from "@/data/chapters";
import {
  type RegistryKind,
  deleteAsset,
  detectContentKind,
  setAsset,
} from "@/lib/assets";
import { notifyNewAsset } from "@/lib/mailer";
import { isPdfFileName, stampPdf } from "@/lib/pdfWatermark";
import { getAdmin } from "@/lib/serverAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// 20MB / 15-page PDFs stamp end-to-end in ~3-6s. Plenty of headroom.
export const maxDuration = 60;

const STAMPED_KINDS: RegistryKind[] = ["notes", "cheatsheet", "pastpaper"];

function stampedPathname(originalUrl: string, fileName: string): string {
  try {
    const u = new URL(originalUrl);
    const raw = u.pathname.replace(/^\/+/, "");
    const dir = raw.includes("/") ? raw.slice(0, raw.lastIndexOf("/")) : "";
    const base = fileName || raw.slice(raw.lastIndexOf("/") + 1);
    const dot = base.lastIndexOf(".");
    const stem = dot > 0 ? base.slice(0, dot) : base;
    const ext = dot > 0 ? base.slice(dot) : ".pdf";
    return `${dir ? `${dir}/` : ""}${stem}-stamped${ext}`;
  } catch {
    return `library/stamped-${Date.now()}-${fileName || "file.pdf"}`;
  }
}

const VALID_KINDS: RegistryKind[] = ["notes", "cheatsheet", "pastpaper", "roadmap"];
const VALID_CLASSES = ["9", "10", "11", "12"];

const isBlobUrl = (url: string) =>
  /^https:\/\/[\w.-]+\.public\.blob\.vercel-storage\.com\//.test(url);

export async function POST(req: Request) {
  if (!getAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const kind = String(body?.kind ?? "") as RegistryKind;
  const classId = String(body?.classId ?? "");
  const slug = body?.slug ? String(body.slug) : undefined;
  const phaseRaw = body?.phase ? String(body.phase).trim() : undefined;
  const phaseLabel = body?.phaseLabel
    ? String(body.phaseLabel).trim().slice(0, 120)
    : undefined;
  // Only `notes` supports phases. Sanitize to a slug-safe form.
  const phase =
    kind === "notes" && phaseRaw
      ? phaseRaw
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
          .slice(0, 40) || undefined
      : undefined;
  const url = String(body?.url ?? "");
  const fileName = String(body?.fileName ?? "");
  const size = Number(body?.size) || 0;

  if (!VALID_KINDS.includes(kind)) {
    return NextResponse.json({ error: "Invalid kind" }, { status: 400 });
  }
  if (!VALID_CLASSES.includes(classId)) {
    return NextResponse.json({ error: "Invalid classId" }, { status: 400 });
  }
  if (kind !== "roadmap" && !slug) {
    return NextResponse.json(
      { error: "slug required for notes/cheatsheet" },
      { status: 400 },
    );
  }
  if (!isBlobUrl(url)) {
    return NextResponse.json({ error: "Invalid blob URL" }, { status: 400 });
  }

  // Auto-stamp PDFs (notes, cheatsheets, question banks) with the
  // ChemistryByKK logo + multiply-blend watermark. Image cheatsheets,
  // roadmaps, and non-PDF uploads pass through untouched.
  let finalUrl = url;
  let finalSize = size;
  let watermarked = false;
  const shouldStamp =
    STAMPED_KINDS.includes(kind) &&
    isPdfFileName(fileName) &&
    detectContentKind(url) === "pdf";

  if (shouldStamp) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`fetch ${res.status}`);
      const sourceBytes = await res.arrayBuffer();
      const stamped = await stampPdf(sourceBytes);
      const stampedPath = stampedPathname(url, fileName);
      const uploaded = await put(stampedPath, stamped, {
        access: "public",
        contentType: "application/pdf",
        addRandomSuffix: true,
      });
      finalUrl = uploaded.url;
      finalSize = stamped.byteLength;
      watermarked = true;
      // Best-effort: remove the unstamped original to avoid double storage.
      try {
        await del(url);
      } catch {
        // ignore — original is still useful for debugging if delete errors
      }
    } catch (err) {
      // If stamping fails (corrupt PDF, encrypted, oversized), fall back to
      // the original upload rather than blocking the admin from publishing.
      console.error("[assets] watermark failed, using original:", err);
    }
  }

  const entry = await setAsset({
    kind,
    classId,
    slug,
    phase,
    phaseLabel: phase ? phaseLabel ?? phase : undefined,
    url: finalUrl,
    fileName: fileName.slice(0, 200),
    contentKind: detectContentKind(finalUrl),
    size: finalSize,
    updatedAt: Date.now(),
  });

  // Best-effort: email subscribers when a new chapter asset drops.
  // Roadmaps don't trigger a blast — they're a static welcome bonus.
  let notified = 0;
  let mail:
    | {
        sent: number;
        failed: number;
        skipped: boolean;
        reason?: string;
        totalSubs?: number;
        targetCount?: number;
        errors?: string[];
      }
    | undefined;
  if (entry.kind !== "roadmap" && slug) {
    const cls = findClass(classId);
    const ch = cls?.chapters.find((c) => c.slug === slug);
    if (ch) {
      try {
        const r = await notifyNewAsset(entry, ch.name);
        notified = r.sent;
        mail = r;
      } catch (err) {
        console.error("[assets] notifyNewAsset threw:", err);
        mail = {
          sent: 0,
          failed: 0,
          skipped: true,
          reason: (err as Error).message ?? "unknown error",
        };
      }
    }
  }

  return NextResponse.json({ entry, notified, watermarked, mail });
}

export async function DELETE(req: Request) {
  if (!getAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL(req.url);
  const kind = url.searchParams.get("kind") as RegistryKind | null;
  const classId = url.searchParams.get("classId");
  const slug = url.searchParams.get("slug") ?? undefined;
  const phase = url.searchParams.get("phase") ?? undefined;

  if (!kind || !VALID_KINDS.includes(kind)) {
    return NextResponse.json({ error: "Invalid kind" }, { status: 400 });
  }
  if (!classId || !VALID_CLASSES.includes(classId)) {
    return NextResponse.json({ error: "Invalid classId" }, { status: 400 });
  }

  const removed = await deleteAsset(
    kind,
    classId,
    slug,
    kind === "notes" ? phase : undefined,
  );
  // Best-effort delete the blob too — don't fail the request if it errors
  if (removed?.url) {
    try {
      await del(removed.url);
    } catch {
      // blob already gone or token issue — registry is the source of truth
    }
  }
  return NextResponse.json({ ok: true, removed });
}
