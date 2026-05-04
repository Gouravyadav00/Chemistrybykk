import { NextResponse } from "next/server";
import { getAssetMap } from "@/lib/assets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const assets = await getAssetMap();
  return NextResponse.json({ assets });
}
