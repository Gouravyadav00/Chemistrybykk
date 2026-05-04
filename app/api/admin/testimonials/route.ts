import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/serverAuth";
import { listByStatus } from "@/lib/testimonials";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!getAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const all = await listByStatus("all");
  return NextResponse.json({
    testimonials: all,
    counts: {
      pending: all.filter((t) => t.status === "pending").length,
      approved: all.filter((t) => t.status === "approved").length,
      rejected: all.filter((t) => t.status === "rejected").length,
      total: all.length,
    },
  });
}
