import { NextResponse } from "next/server";
import { getSubscriberId } from "@/lib/serverAuth";
import { logVisit } from "@/lib/subscribers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const id = getSubscriberId();
  if (!id) return NextResponse.json({ ok: false }, { status: 204 });
  try {
    await logVisit(id);
  } catch {
    // KV down — silently ignore so it never breaks the page.
  }
  return NextResponse.json({ ok: true });
}
