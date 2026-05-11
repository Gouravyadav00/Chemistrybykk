import { NextResponse } from "next/server";
import { getSubscriberId } from "@/lib/serverAuth";
import { recordQuizScore } from "@/lib/subscribers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const subId = getSubscriberId();
  if (!subId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const classId = String(body?.classId ?? "").trim();
  const chapterSlug = String(body?.chapterSlug ?? "").trim();
  const title = String(body?.title ?? "").slice(0, 120);
  const correct = Number.isFinite(Number(body?.correct))
    ? Math.max(0, Math.floor(Number(body?.correct)))
    : 0;
  const total = Number.isFinite(Number(body?.total))
    ? Math.max(0, Math.floor(Number(body?.total)))
    : 0;

  if (!classId || !chapterSlug || total <= 0 || correct > total) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const pct = Math.round((correct / total) * 100);
  const sub = await recordQuizScore(subId, {
    classId,
    chapterSlug,
    title,
    correct,
    total,
    pct,
    takenAt: Date.now(),
  });

  if (!sub) {
    return NextResponse.json({ error: "Subscriber not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
