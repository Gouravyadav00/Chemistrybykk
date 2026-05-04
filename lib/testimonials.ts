import crypto from "crypto";
import { kv } from "./kv";

export type TestimonialStatus = "pending" | "approved" | "rejected";

export type Testimonial = {
  id: string;
  subscriberId?: string;
  name: string;
  classId?: string; // "9" | "10" | "11" | "12"
  rating?: 1 | 2 | 3 | 4 | 5;
  text: string;
  status: TestimonialStatus;
  createdAt: number;
  approvedAt?: number;
};

const TES_PREFIX = "tes:";
const ALL_SET = "tes:all";
const APPROVED_SET = "tes:approved";
const PENDING_SET = "tes:pending";

const tesKey = (id: string) => TES_PREFIX + id;
const newId = () => crypto.randomUUID();

export const MAX_TEXT = 800;
export const MIN_TEXT = 20;

export async function submitTestimonial(input: {
  subscriberId?: string;
  name: string;
  classId?: string;
  rating?: number;
  text: string;
}): Promise<Testimonial> {
  const t: Testimonial = {
    id: newId(),
    subscriberId: input.subscriberId,
    name: input.name.trim().slice(0, 80),
    classId: input.classId,
    rating: clampRating(input.rating),
    text: input.text.trim().slice(0, MAX_TEXT),
    status: "pending",
    createdAt: Date.now(),
  };
  await kv.set(tesKey(t.id), t);
  await kv.sadd(ALL_SET, t.id);
  await kv.sadd(PENDING_SET, t.id);
  return t;
}

function clampRating(r?: number) {
  if (typeof r !== "number") return undefined;
  if (r < 1 || r > 5) return undefined;
  return Math.round(r) as 1 | 2 | 3 | 4 | 5;
}

export async function getTestimonial(id: string): Promise<Testimonial | null> {
  return (await kv.get<Testimonial>(tesKey(id))) ?? null;
}

export async function listByStatus(
  status: TestimonialStatus | "all",
): Promise<Testimonial[]> {
  const setKey =
    status === "approved"
      ? APPROVED_SET
      : status === "pending"
        ? PENDING_SET
        : ALL_SET;
  const ids = (await kv.smembers(setKey)) as string[] | null;
  if (!ids?.length) return [];
  const records = await kv.mget<(Testimonial | null)[]>(
    ...ids.map((i) => tesKey(i)),
  );
  return records
    .filter((x): x is Testimonial => !!x)
    .filter((t) => status === "all" || t.status === status)
    .sort((a, b) => (b.approvedAt ?? b.createdAt) - (a.approvedAt ?? a.createdAt));
}

export async function setStatus(
  id: string,
  status: TestimonialStatus,
): Promise<Testimonial | null> {
  const t = await getTestimonial(id);
  if (!t) return null;
  const updated: Testimonial = {
    ...t,
    status,
    approvedAt: status === "approved" ? Date.now() : t.approvedAt,
  };
  await kv.set(tesKey(id), updated);

  if (status === "approved") {
    await kv.sadd(APPROVED_SET, id);
    await kv.srem(PENDING_SET, id);
  } else if (status === "pending") {
    await kv.sadd(PENDING_SET, id);
    await kv.srem(APPROVED_SET, id);
  } else {
    await kv.srem(APPROVED_SET, id);
    await kv.srem(PENDING_SET, id);
  }
  return updated;
}

export async function deleteTestimonial(id: string): Promise<boolean> {
  const t = await getTestimonial(id);
  if (!t) return false;
  await kv.del(tesKey(id));
  await kv.srem(ALL_SET, id);
  await kv.srem(APPROVED_SET, id);
  await kv.srem(PENDING_SET, id);
  return true;
}

export async function countBySubscriber(subscriberId: string): Promise<number> {
  const ids = (await kv.smembers(ALL_SET)) as string[] | null;
  if (!ids?.length) return 0;
  const records = await kv.mget<(Testimonial | null)[]>(
    ...ids.map((i) => tesKey(i)),
  );
  return records.filter((t) => t?.subscriberId === subscriberId).length;
}
