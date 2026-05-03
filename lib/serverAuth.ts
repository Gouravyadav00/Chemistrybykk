import { cookies } from "next/headers";
import crypto from "crypto";

const SECRET = process.env.AUTH_SECRET || "";
const ADMIN_COOKIE = "cbk_admin";
const SUB_COOKIE = "cbk_sub";

const ADMIN_TTL_DAYS = 7;
const SUB_TTL_DAYS = 365;

const sign = (body: string) =>
  crypto.createHmac("sha256", SECRET).update(body).digest("hex");

const makeToken = (payload: object) => {
  if (!SECRET) throw new Error("AUTH_SECRET not configured");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
};

const verifyToken = <T extends { exp?: number }>(token: string | undefined) => {
  if (!token || !SECRET) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = sign(body);
  if (expected.length !== sig.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) {
    return null;
  }
  try {
    const data = JSON.parse(Buffer.from(body, "base64url").toString());
    if (data.exp && data.exp < Date.now()) return null;
    return data as T;
  } catch {
    return null;
  }
};

export function setAdminCookie() {
  const exp = Date.now() + ADMIN_TTL_DAYS * 86_400_000;
  const token = makeToken({ role: "admin", exp });
  cookies().set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_TTL_DAYS * 86_400,
  });
}

export function clearAdminCookie() {
  cookies().delete(ADMIN_COOKIE);
}

export function getAdmin() {
  const c = cookies().get(ADMIN_COOKIE)?.value;
  return verifyToken<{ role: "admin"; exp: number }>(c);
}

export function setSubscriberCookie(subId: string) {
  const exp = Date.now() + SUB_TTL_DAYS * 86_400_000;
  const token = makeToken({ subId, exp });
  cookies().set(SUB_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SUB_TTL_DAYS * 86_400,
  });
}

export function getSubscriberId() {
  const c = cookies().get(SUB_COOKIE)?.value;
  const data = verifyToken<{ subId: string; exp: number }>(c);
  return data?.subId ?? null;
}

export function clearSubscriberCookie() {
  cookies().delete(SUB_COOKIE);
}
