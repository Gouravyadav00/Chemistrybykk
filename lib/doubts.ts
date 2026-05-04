import crypto from "crypto";
import { kv } from "./kv";

export type DoubtAttachment = {
  url: string;
  name: string;
  kind: "image" | "pdf";
  size: number;
};

export type DoubtMessage = {
  id: string;
  threadId: string;
  author: "student" | "admin";
  text: string;
  attachment?: DoubtAttachment;
  createdAt: number;
};

export type DoubtThread = {
  id: string;
  subscriberId: string;
  subscriberEmail: string;
  subscriberName?: string;
  subscriberClass?: string;
  title: string;
  status: "open" | "answered";
  createdAt: number;
  updatedAt: number;
  lastAuthor: "student" | "admin";
  messageCount: number;
  studentUnread: number;
  adminUnread: number;
};

const THREAD_PREFIX = "doubt:";
const MSGS_PREFIX = "doubt:msgs:";
const BY_SUB = "doubts:bySub:";
const ALL_SET = "doubts:all";

const threadKey = (id: string) => THREAD_PREFIX + id;
const msgsKey = (id: string) => MSGS_PREFIX + id;
const subKey = (subId: string) => BY_SUB + subId;

const newId = () => crypto.randomUUID();

export const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_TITLE_LEN = 140;
export const MAX_TEXT_LEN = 5000;

export async function createThread(input: {
  subscriberId: string;
  subscriberEmail: string;
  subscriberName?: string;
  subscriberClass?: string;
  title: string;
  text: string;
  attachment?: DoubtAttachment;
}): Promise<{ thread: DoubtThread; message: DoubtMessage }> {
  const id = newId();
  const now = Date.now();
  const title = input.title.trim().slice(0, MAX_TITLE_LEN) || "Untitled doubt";

  const thread: DoubtThread = {
    id,
    subscriberId: input.subscriberId,
    subscriberEmail: input.subscriberEmail,
    subscriberName: input.subscriberName,
    subscriberClass: input.subscriberClass,
    title,
    status: "open",
    createdAt: now,
    updatedAt: now,
    lastAuthor: "student",
    messageCount: 1,
    studentUnread: 0,
    adminUnread: 1,
  };

  const message: DoubtMessage = {
    id: newId(),
    threadId: id,
    author: "student",
    text: input.text.trim().slice(0, MAX_TEXT_LEN),
    attachment: input.attachment,
    createdAt: now,
  };

  await kv.set(threadKey(id), thread);
  await kv.set(msgsKey(id), [message]);
  await kv.sadd(subKey(input.subscriberId), id);
  await kv.sadd(ALL_SET, id);
  return { thread, message };
}

export async function appendMessage(
  threadId: string,
  author: "student" | "admin",
  text: string,
  attachment?: DoubtAttachment,
): Promise<{ thread: DoubtThread; message: DoubtMessage } | null> {
  const thread = await getThread(threadId);
  if (!thread) return null;

  const now = Date.now();
  const message: DoubtMessage = {
    id: newId(),
    threadId,
    author,
    text: text.trim().slice(0, MAX_TEXT_LEN),
    attachment,
    createdAt: now,
  };

  const messages = (await kv.get<DoubtMessage[]>(msgsKey(threadId))) ?? [];
  messages.push(message);

  const updated: DoubtThread = {
    ...thread,
    updatedAt: now,
    lastAuthor: author,
    messageCount: messages.length,
    status: author === "admin" ? "answered" : "open",
    studentUnread:
      author === "admin" ? thread.studentUnread + 1 : thread.studentUnread,
    adminUnread:
      author === "student" ? thread.adminUnread + 1 : thread.adminUnread,
  };

  await kv.set(threadKey(threadId), updated);
  await kv.set(msgsKey(threadId), messages);
  return { thread: updated, message };
}

export async function getThread(id: string): Promise<DoubtThread | null> {
  return (await kv.get<DoubtThread>(threadKey(id))) ?? null;
}

export async function getMessages(threadId: string): Promise<DoubtMessage[]> {
  return (await kv.get<DoubtMessage[]>(msgsKey(threadId))) ?? [];
}

export async function listThreadsForSubscriber(
  subscriberId: string,
): Promise<DoubtThread[]> {
  const ids = (await kv.smembers(subKey(subscriberId))) as string[] | null;
  if (!ids?.length) return [];
  const records = await kv.mget<(DoubtThread | null)[]>(
    ...ids.map((i) => threadKey(i)),
  );
  return records
    .filter((x): x is DoubtThread => !!x)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function listAllThreads(): Promise<DoubtThread[]> {
  const ids = (await kv.smembers(ALL_SET)) as string[] | null;
  if (!ids?.length) return [];
  const records = await kv.mget<(DoubtThread | null)[]>(
    ...ids.map((i) => threadKey(i)),
  );
  return records
    .filter((x): x is DoubtThread => !!x)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function markRead(
  threadId: string,
  reader: "student" | "admin",
): Promise<DoubtThread | null> {
  const thread = await getThread(threadId);
  if (!thread) return null;
  const updated: DoubtThread = {
    ...thread,
    studentUnread: reader === "student" ? 0 : thread.studentUnread,
    adminUnread: reader === "admin" ? 0 : thread.adminUnread,
  };
  await kv.set(threadKey(threadId), updated);
  return updated;
}

export async function deleteThread(threadId: string): Promise<boolean> {
  const t = await getThread(threadId);
  if (!t) return false;
  await kv.del(threadKey(threadId));
  await kv.del(msgsKey(threadId));
  await kv.srem(subKey(t.subscriberId), threadId);
  await kv.srem(ALL_SET, threadId);
  return true;
}

export function unreadFor(
  threads: DoubtThread[],
  reader: "student" | "admin",
): number {
  return threads.reduce(
    (sum, t) => sum + (reader === "admin" ? t.adminUnread : t.studentUnread),
    0,
  );
}

export function validateAttachment(att: {
  url: string;
  name: string;
  size: number;
  kind?: string;
}): DoubtAttachment | null {
  if (!att?.url) return null;
  if (typeof att.size !== "number" || att.size <= 0) return null;
  if (att.size > MAX_ATTACHMENT_BYTES) return null;
  // URLs from our Blob store
  if (!/^https:\/\/[\w.-]+\.public\.blob\.vercel-storage\.com\//.test(att.url)) {
    return null;
  }
  const ext = att.url.split("?")[0].split(".").pop()?.toLowerCase() ?? "";
  let kind: "image" | "pdf";
  if (att.kind === "pdf" || ext === "pdf") kind = "pdf";
  else if (
    att.kind === "image" ||
    ["png", "jpg", "jpeg", "webp", "gif"].includes(ext)
  )
    kind = "image";
  else return null;
  return {
    url: att.url,
    name: String(att.name ?? "attachment").slice(0, 200),
    size: att.size,
    kind,
  };
}
