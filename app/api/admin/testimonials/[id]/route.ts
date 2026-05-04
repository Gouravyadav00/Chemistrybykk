import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/serverAuth";
import {
  deleteTestimonial,
  setStatus,
  type TestimonialStatus,
} from "@/lib/testimonials";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  if (!getAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const action = String(body?.action ?? "");
  const valid: TestimonialStatus[] = ["approved", "pending", "rejected"];
  if (!valid.includes(action as TestimonialStatus)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
  const updated = await setStatus(params.id, action as TestimonialStatus);
  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ testimonial: updated });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  if (!getAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const ok = await deleteTestimonial(params.id);
  return NextResponse.json({ ok });
}
