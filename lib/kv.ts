import { kv } from "@vercel/kv";

export { kv };

export const isKvConfigured = () =>
  !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN;
