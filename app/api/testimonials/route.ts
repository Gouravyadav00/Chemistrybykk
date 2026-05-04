import { NextResponse } from "next/server";
import { ipFromRequest, rateLimit } from "@/lib/rateLimit";
import { getAdmin, getSubscriberId } from "@/lib/serverAuth";
import { getSubscriber } from "@/lib/subscribers";
import {
  countBySubscriber,
  listByStatus,
  MIN_TEXT,
  submitTestimonial,
} from "@/lib/testimonials";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_PER_STUDENT = 3;

export async function GET() {
  // Public endpoint — only approved entries
  const approved = await listByStatus("approved");
  return NextResponse.json({
    testimonials: approved.map((t) => ({
      id: t.id,
      name: t.name,
      classId: t.classId,
      rating: t.rating,
      text: t.text,
      approvedAt: t.approvedAt,
    })),
  });
}

export async function POST(req: Request) {
  // Admin shouldn't be submitting their own; only signed-in subscribers
  if (getAdmin()) {
    return NextResponse.json(
      { error: "Admins cannot submit testimonials." },
      { status: 403 },
    );
  }
  const subId = getSubscriberId();
  if (!subId) {
    return NextResponse.json(
      { error: "Please sign in to share your experience." },
      { status: 401 },
    );
  }

  const ip = ipFromRequest(req);
  const limit = await rateLimit(`tes:${subId}:${ip}`, 5, 3600);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many submissions. Please wait an hour." },
      { status: 429 },
    );
  }

  const sub = await getSubscriber(subId);
  if (!sub) {
    return NextResponse.json({ error: "Account not found." }, { status: 401 });
  }

  const existing = await countBySubscriber(subId);
  if (existing >= MAX_PER_STUDENT) {
    return NextResponse.json(
      { error: `You've already submitted ${MAX_PER_STUDENT} testimonials.` },
      { status: 400 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const text = String(body?.text ?? "").trim();
  const rating = Number(body?.rating) || undefined;

  if (text.length < MIN_TEXT) {
    return NextResponse.json(
      { error: `Please write at least ${MIN_TEXT} characters.` },
      { status: 400 },
    );
  }

  const t = await submitTestimonial({
    subscriberId: subId,
    name: sub.name || sub.email.split("@")[0],
    classId: sub.class,
    rating,
    text,
  });

  return NextResponse.json({ status: "pending", id: t.id });
}
