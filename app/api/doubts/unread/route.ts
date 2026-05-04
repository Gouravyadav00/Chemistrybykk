import { NextResponse } from "next/server";
import { getAdmin, getSubscriberId } from "@/lib/serverAuth";
import {
  listAllThreads,
  listThreadsForSubscriber,
  unreadFor,
} from "@/lib/doubts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (getAdmin()) {
    const threads = await listAllThreads();
    return NextResponse.json({
      role: "admin",
      unread: unreadFor(threads, "admin"),
      openCount: threads.filter((t) => t.status === "open").length,
    });
  }
  const subId = getSubscriberId();
  if (!subId) return NextResponse.json({ role: "guest", unread: 0 });
  const threads = await listThreadsForSubscriber(subId);
  return NextResponse.json({
    role: "subscriber",
    unread: unreadFor(threads, "student"),
  });
}
