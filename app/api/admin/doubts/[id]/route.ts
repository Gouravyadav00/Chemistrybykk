import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/serverAuth";
import { deleteThread } from "@/lib/doubts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  if (!getAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const ok = await deleteThread(params.id);
  return NextResponse.json({ ok });
}
