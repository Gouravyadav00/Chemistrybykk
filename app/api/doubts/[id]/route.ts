import { NextResponse } from "next/server";
import { ipFromRequest, rateLimit } from "@/lib/rateLimit";
import { getAdmin, getSubscriberId } from "@/lib/serverAuth";
import {
  appendMessage,
  getMessages,
  getThread,
  markRead,
  validateAttachment,
} from "@/lib/doubts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function authorize(threadId: string) {
  const thread = await getThread(threadId);
  if (!thread) return { error: "Not found", status: 404 as const };

  if (getAdmin()) {
    return { thread, role: "admin" as const };
  }
  const subId = getSubscriberId();
  if (subId && subId === thread.subscriberId) {
    return { thread, role: "student" as const };
  }
  return { error: "Forbidden", status: 403 as const };
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const auth = await authorize(params.id);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const messages = await getMessages(params.id);
  // mark read for the viewer
  const updated = await markRead(params.id, auth.role);
  return NextResponse.json({
    role: auth.role,
    thread: updated ?? auth.thread,
    messages,
  });
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const auth = await authorize(params.id);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const ip = ipFromRequest(req);
  const limitKey =
    auth.role === "admin"
      ? `doubts:reply:admin:${ip}`
      : `doubts:reply:${auth.thread.subscriberId}`;
  const limit = await rateLimit(limitKey, 30, 600);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Slow down a little — too many messages too fast." },
      { status: 429 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const text = String(body?.text ?? "").trim();
  if (!text && !body?.attachment) {
    return NextResponse.json(
      { error: "Type a message or attach a file." },
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

  const result = await appendMessage(params.id, auth.role, text, att ?? undefined);
  if (!result) {
    return NextResponse.json({ error: "Thread not found." }, { status: 404 });
  }
  return NextResponse.json(result);
}
