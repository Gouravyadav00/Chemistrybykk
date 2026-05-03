import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/serverAuth";
import {
  computeStats,
  consecutiveDailyVisits,
  listSubscribers,
} from "@/lib/subscribers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!getAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const subs = await listSubscribers();
  const stats = computeStats(subs);

  // attach computed daily streaks (last 10 days) for filtering on the client
  const enriched = subs.map((s) => ({
    ...s,
    streak10: consecutiveDailyVisits(s.visits || [], 10),
    streak30: consecutiveDailyVisits(s.visits || [], 30),
  }));

  return NextResponse.json({ subscribers: enriched, stats });
}
