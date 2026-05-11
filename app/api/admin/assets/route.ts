import { del } from "@vercel/blob";
import { NextResponse } from "next/server";
import { findClass } from "@/data/chapters";
import {
  type RegistryKind,
  deleteAsset,
  detectContentKind,
  setAsset,
} from "@/lib/assets";
import { notifyNewAsset } from "@/lib/mailer";
import { getAdmin } from "@/lib/serverAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

  const entry = await setAsset({
    kind,
    classId,
    slug,
    url,
    fileName: fileName.slice(0, 200),
    contentKind: detectContentKind(url),
    size,
    updatedAt: Date.now(),
  });

  // Best-effort: email subscribers when a new chapter asset drops.
  // Roadmaps don't trigger a blast — they're a static welcome bonus.
  let notified = 0;
  if (entry.kind !== "roadmap" && slug) {
    const cls = findClass(classId);
    const ch = cls?.chapters.find((c) => c.slug === slug);
    if (ch) {
      try {
        const r = await notifyNewAsset(entry, ch.name);
        notified = r.sent;
      } catch {
        // never let mail failure break the upload
      }
    }
  }

  return NextResponse.json({ entry, notified });
}

export async function DELETE(req: Request) {
  if (!getAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL(req.url);
  const kind = url.searchParams.get("kind") as RegistryKind | null;
  const classId = url.searchParams.get("classId");
  const slug = url.searchParams.get("slug") ?? undefined;

  if (!kind || !VALID_KINDS.includes(kind)) {
    return NextResponse.json({ error: "Invalid kind" }, { status: 400 });
  }
  if (!classId || !VALID_CLASSES.includes(classId)) {
    return NextResponse.json({ error: "Invalid classId" }, { status: 400 });
  }

  const removed = await deleteAsset(kind, classId, slug);
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
