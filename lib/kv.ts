import { Redis } from "@upstash/redis";

// Works with either env-var naming scheme:
//   - Vercel Marketplace "Redis" / "Upstash":  UPSTASH_REDIS_REST_URL / _TOKEN
//   - Older Vercel KV integration:             KV_REST_API_URL / KV_REST_API_TOKEN
const url =
  process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL ?? "";
const token =
  process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN ?? "";

export const kv = new Redis({ url, token });

export const isKvConfigured = () => !!url && !!token;
