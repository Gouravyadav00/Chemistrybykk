import { NextResponse } from "next/server";
import { ipFromRequest, rateLimit } from "@/lib/rateLimit";
import {
  clearAdminCookie,
  clearSubscriberCookie,
  getAdmin,
  getSubscriberId,
  setAdminCookie,
  setSubscriberCookie,
} from "@/lib/serverAuth";
import {
  findByEmail,
  getSubscriber,
  upsertSubscriber,
} from "@/lib/subscribers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIN_PASSWORD = 6;

const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());

export async function POST(req: Request) {
  const ip = ipFromRequest(req);
  const limit = await rateLimit(`auth:${ip}`, 8, 60);
  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: "Too many attempts. Please wait a minute and try again.",
      },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
    );
  }

  const body = await req.json().catch(() => ({}));
  const email = String(body?.email ?? "").trim();
  const password = String(body?.password ?? "");
  const mode = body?.mode === "signin" ? "signin" : "signup";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 },
    );
  }

  // ---------- Admin path ----------
  const adminUser = process.env.ADMIN_USERNAME ?? "";
  const adminPass = process.env.ADMIN_PASSWORD ?? "";

  if (
    adminUser &&
    adminPass &&
    email === adminUser &&
    password === adminPass
  ) {
    setAdminCookie();
    return NextResponse.json({ role: "admin" });
  }

  // ---------- Subscriber path ----------
  if (!isEmail(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }
  if (password.length < MIN_PASSWORD) {
    return NextResponse.json(
      { error: `Password must be at least ${MIN_PASSWORD} characters.` },
      { status: 400 },
    );
  }

  const existing = await findByEmail(email);
  if (mode === "signin" && !existing) {
    return NextResponse.json(
      { error: "We don't have an account for that email yet. Try Create Account." },
      { status: 404 },
    );
  }

  const result = await upsertSubscriber({
    email,
    name: body?.name,
    class: body?.studentClass,
    school: body?.school,
    exam: body?.exam,
    city: body?.city,
    phone: body?.phone,
    interest: body?.interest,
  });

  setSubscriberCookie(result.sub.id);
  return NextResponse.json({ role: "subscriber", status: result.status });
}

export async function GET() {
  const admin = getAdmin();
  if (admin) return NextResponse.json({ role: "admin" });
  const subId = getSubscriberId();
  if (!subId) return NextResponse.json({ role: "guest" });
  const sub = await getSubscriber(subId);
  if (!sub) return NextResponse.json({ role: "guest" });
  return NextResponse.json({
    role: "subscriber",
    subscriber: { email: sub.email, name: sub.name, class: sub.class },
  });
}

export async function DELETE() {
  clearAdminCookie();
  clearSubscriberCookie();
  return NextResponse.json({ ok: true });
}
