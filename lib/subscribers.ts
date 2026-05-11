import crypto from "crypto";
import { kv } from "./kv";

export type QuizScore = {
  classId: string;
  chapterSlug: string;
  title: string;
  correct: number;
  total: number;
  pct: number;
  takenAt: number;
};

export type Subscriber = {
  id: string;
  email: string;
  name?: string;
  class?: string;
  school?: string;
  exam?: string;
  city?: string;
  phone?: string;
  interest?: string;
  joinedAt: number;
  visits: number[];
  lastVisit?: number;
  // Latest score per chapter — key is `${classId}:${chapterSlug}`
  quizScores?: Record<string, QuizScore>;
};

const SUB_PREFIX = "sub:";
const BY_EMAIL = "sub:byEmail:";
const ALL_SET = "sub:all";
const MAX_VISIT_HISTORY = 90;

export const newId = () => crypto.randomUUID();

const subKey = (id: string) => SUB_PREFIX + id;
const emailKey = (email: string) => BY_EMAIL + email.toLowerCase();

export async function getSubscriber(id: string): Promise<Subscriber | null> {
  return (await kv.get<Subscriber>(subKey(id))) ?? null;
}

export async function findByEmail(email: string): Promise<Subscriber | null> {
  const id = await kv.get<string>(emailKey(email));
  if (!id) return null;
  return getSubscriber(id);
}

export type SubscriberInput = {
  email: string;
  name?: string;
  class?: string;
  school?: string;
  exam?: string;
  city?: string;
  phone?: string;
  interest?: string;
};

export async function upsertSubscriber(
  input: SubscriberInput,
): Promise<{ sub: Subscriber; status: "added" | "exists" }> {
  const email = input.email.trim().toLowerCase();
  const existing = await findByEmail(email);

  if (existing) {
    // merge new fields if provided (don't overwrite with undefined)
    const merged: Subscriber = {
      ...existing,
      name: input.name ?? existing.name,
      class: input.class ?? existing.class,
      school: input.school ?? existing.school,
      exam: input.exam ?? existing.exam,
      city: input.city ?? existing.city,
      phone: input.phone ?? existing.phone,
      interest: input.interest ?? existing.interest,
    };
    await kv.set(subKey(existing.id), merged);
    await logVisit(existing.id);
    return { sub: merged, status: "exists" };
  }

  const id = newId();
  const now = Date.now();
  const sub: Subscriber = {
    id,
    email,
    name: input.name?.trim() || undefined,
    class: input.class?.trim() || undefined,
    school: input.school?.trim() || undefined,
    exam: input.exam?.trim() || undefined,
    city: input.city?.trim() || undefined,
    phone: input.phone?.trim() || undefined,
    interest: input.interest?.trim() || undefined,
    joinedAt: now,
    visits: [now],
    lastVisit: now,
  };
  await kv.set(subKey(id), sub);
  await kv.set(emailKey(email), id);
  await kv.sadd(ALL_SET, id);
  return { sub, status: "added" };
}

export async function logVisit(id: string): Promise<Subscriber | null> {
  const sub = await getSubscriber(id);
  if (!sub) return null;

  const now = Date.now();
  const lastDay = sub.lastVisit ? new Date(sub.lastVisit).toDateString() : "";
  const today = new Date(now).toDateString();
  if (lastDay === today) return sub;

  const visits = [...(sub.visits || []), now].slice(-MAX_VISIT_HISTORY);
  const updated: Subscriber = { ...sub, visits, lastVisit: now };
  await kv.set(subKey(id), updated);
  return updated;
}

export async function listSubscribers(): Promise<Subscriber[]> {
  const ids = (await kv.smembers(ALL_SET)) as string[] | null;
  if (!ids?.length) return [];
  const records = await kv.mget<(Subscriber | null)[]>(
    ...ids.map((id) => subKey(id)),
  );
  return records.filter((x): x is Subscriber => !!x);
}

export async function deleteSubscriber(id: string) {
  const sub = await getSubscriber(id);
  if (!sub) return false;
  await kv.del(subKey(id));
  await kv.del(emailKey(sub.email));
  await kv.srem(ALL_SET, id);
  return true;
}

export type Stats = {
  total: number;
  byClass: Record<string, number>;
  joinedLast7d: number;
  joinedLast30d: number;
  activeLast7d: number;
};

export function computeStats(subs: Subscriber[]): Stats {
  const now = Date.now();
  const d7 = now - 7 * 86_400_000;
  const d30 = now - 30 * 86_400_000;
  const byClass: Record<string, number> = {};
  let joinedLast7d = 0;
  let joinedLast30d = 0;
  let activeLast7d = 0;

  for (const s of subs) {
    const cls = s.class || "Unknown";
    byClass[cls] = (byClass[cls] ?? 0) + 1;
    if (s.joinedAt >= d7) joinedLast7d++;
    if (s.joinedAt >= d30) joinedLast30d++;
    if ((s.lastVisit ?? 0) >= d7) activeLast7d++;
  }
  return { total: subs.length, byClass, joinedLast7d, joinedLast30d, activeLast7d };
}

// Returns the current daily-visit streak ending today (or yesterday if today
// hasn't been logged yet). 0 if neither today nor yesterday has a visit.
export function computeStreak(visits: number[] | undefined): number {
  if (!visits?.length) return 0;
  const days = new Set<string>();
  for (const t of visits) days.add(new Date(t).toDateString());
  const today = new Date();
  const yesterday = new Date(Date.now() - 86_400_000);
  let cursor: Date;
  if (days.has(today.toDateString())) cursor = today;
  else if (days.has(yesterday.toDateString())) cursor = yesterday;
  else return 0;
  let streak = 0;
  while (days.has(cursor.toDateString())) {
    streak++;
    cursor = new Date(cursor.getTime() - 86_400_000);
  }
  return streak;
}

export async function recordQuizScore(
  id: string,
  score: QuizScore,
): Promise<Subscriber | null> {
  const sub = await getSubscriber(id);
  if (!sub) return null;
  const key = `${score.classId}:${score.chapterSlug}`;
  const next: Subscriber = {
    ...sub,
    quizScores: { ...(sub.quizScores ?? {}), [key]: score },
  };
  await kv.set(subKey(id), next);
  return next;
}

// Counts how many of the last `days` calendar days have at least one visit.
export function consecutiveDailyVisits(visits: number[], days: number): number {
  if (!visits?.length) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const visitedDays = new Set(
    visits.map((t) => {
      const d = new Date(t);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    }),
  );
  let streak = 0;
  for (let i = 0; i < days; i++) {
    const d = today.getTime() - i * 86_400_000;
    if (visitedDays.has(d)) streak++;
  }
  return streak;
}
