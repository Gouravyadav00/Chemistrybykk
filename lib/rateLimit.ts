import { kv } from "./kv";

export type RateLimitResult = {
  allowed: boolean;
  count: number;
  max: number;
  retryAfterSec: number;
};

/**
 * Fixed-window rate limiter backed by Vercel KV.
 *  - key:    a stable identifier (route + IP, etc.)
 *  - max:    max allowed requests in the window
 *  - window: window length in seconds
 */
export async function rateLimit(
  key: string,
  max: number,
  windowSec: number,
): Promise<RateLimitResult> {
  const bucket = Math.floor(Date.now() / (windowSec * 1000));
  const k = `rl:${key}:${bucket}`;
  let count = 0;
  try {
    count = await kv.incr(k);
    if (count === 1) await kv.expire(k, windowSec);
  } catch {
    // KV not available — fail open so the site keeps working in dev.
    return { allowed: true, count: 0, max, retryAfterSec: 0 };
  }
  return {
    allowed: count <= max,
    count,
    max,
    retryAfterSec: windowSec,
  };
}

export const ipFromRequest = (req: Request) =>
  req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
  req.headers.get("x-real-ip") ||
  "anon";
