import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/serverAuth";
import { listSubscribers } from "@/lib/subscribers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!getAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const subs = await listSubscribers();
  const students = subs
    .filter((s) => s.quizScores && Object.keys(s.quizScores).length > 0)
    .map((s) => ({
      id: s.id,
      email: s.email,
      name: s.name,
      class: s.class,
      quizScores: s.quizScores,
    }));
  return NextResponse.json({ students });
}
