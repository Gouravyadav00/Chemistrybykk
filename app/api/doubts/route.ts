import { NextResponse } from "next/server";
import { ipFromRequest, rateLimit } from "@/lib/rateLimit";
import { getAdmin, getSubscriberId } from "@/lib/serverAuth";
import { getSubscriber } from "@/lib/subscribers";
import {
  createThread,
  listAllThreads,
  listThreadsForSubscriber,
  validateAttachment,
} from "@/lib/doubts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (getAdmin()) {
    const threads = await listAllThreads();
    return NextResponse.json({ role: "admin", threads });
  }
  const subId = getSubscriberId();
  if (!subId) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  const threads = await listThreadsForSubscriber(subId);
  return NextResponse.json({ role: "subscriber", threads });
}

export async function POST(req: Request) {
  const subId = getSubscriberId();
  if (!subId || getAdmin()) {
    return NextResponse.json(
      { error: "Only signed-in students can ask doubts." },
      { status: 401 },
    );
  }

  const ip = ipFromRequest(req);
  const limit = await rateLimit(`doubts:create:${subId}:${ip}`, 5, 3600);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "You've reached the hourly limit. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
    );
  }

  const sub = await getSubscriber(subId);
  if (!sub) {
    return NextResponse.json(
      { error: "Account not found. Please sign in again." },
      { status: 401 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const title = String(body?.title ?? "").trim();
  const text = String(body?.text ?? "").trim();

  if (!title) {
    return NextResponse.json({ error: "Please add a title." }, { status: 400 });
  }
  if (!text) {
    return NextResponse.json(
      { error: "Please describe your doubt." },
      { status: 400 },
    );
  }

  const att = body?.attachment
    ? validateAttachment(body.attachment)
    : undefined;
  if (body?.attachment && !att) {
    return NextResponse.json(
      { error: "Attachment must be a PDF or image, max 5 MB." },
      { status: 400 },
    );
  }

  const { thread } = await createThread({
    subscriberId: sub.id,
    subscriberEmail: sub.email,
    subscriberName: sub.name,
    subscriberClass: sub.class,
    title,
    text,
    attachment: att ?? undefined,
  });

  return NextResponse.json({ thread });
}
