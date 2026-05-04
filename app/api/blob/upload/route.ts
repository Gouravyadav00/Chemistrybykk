import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { getAdmin, getSubscriberId } from "@/lib/serverAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
];

const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(req: Request) {
  // Gate: only signed-in students or admin can upload
  const isAdmin = !!getAdmin();
  const subId = getSubscriberId();
  if (!isAdmin && !subId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as HandleUploadBody;

  try {
    const json = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        const folder = isAdmin ? "admin" : `student/${subId}`;
        const safe = pathname.replace(/[^\w.\-]/g, "_");
        return {
          allowedContentTypes: ALLOWED_TYPES,
          maximumSizeInBytes: MAX_BYTES,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ uploader: folder, original: safe }),
        };
      },
      onUploadCompleted: async () => {
        // hook for future analytics; nothing to persist here
      },
    });
    return NextResponse.json(json);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message ?? "Upload failed" },
      { status: 400 },
    );
  }
}
