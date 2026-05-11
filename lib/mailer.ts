import type { AssetEntry } from "./assets";
import { listSubscribers } from "./subscribers";

const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

type Recipient = { email: string; name?: string };

type SendResult = { ok: boolean; status?: number; error?: string };

function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://chemistrybykk.vercel.app"
  ).replace(/\/$/, "");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function isMailConfigured(): boolean {
  return !!process.env.BREVO_API_KEY && !!process.env.BREVO_SENDER_EMAIL;
}

async function sendOne(
  to: Recipient,
  subject: string,
  htmlContent: string,
): Promise<SendResult> {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  if (!apiKey || !senderEmail) return { ok: false, error: "not-configured" };

  const senderName = process.env.BREVO_SENDER_NAME ?? "ChemistryByKK";
  try {
    const res = await fetch(BREVO_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [to],
        subject,
        htmlContent,
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { ok: false, status: res.status, error: text.slice(0, 200) };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

function kindLabel(kind: AssetEntry["kind"]): string {
  if (kind === "notes") return "Notes";
  if (kind === "cheatsheet") return "Cheatsheet";
  if (kind === "pastpaper") return "Question Bank";
  return "Roadmap";
}

function newAssetEmail(
  studentName: string | undefined,
  entry: AssetEntry,
  chapterName: string,
): { subject: string; html: string } {
  const label = kindLabel(entry.kind);
  const greet = studentName ? `Hi ${escapeHtml(studentName)},` : "Hi there,";
  const subject = `New ${label} — Class ${entry.classId}: ${chapterName}`;
  const link = `${siteUrl()}/#learn`;
  const html = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1a2a4d; background: #eef4ff; border-radius: 20px;">
    <div style="background: linear-gradient(135deg,#4F8EF7,#3563d3); color: white; padding: 20px; border-radius: 16px; margin-bottom: 20px;">
      <div style="font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.8;">ChemistryByKK</div>
      <div style="font-size: 22px; font-weight: 800; margin-top: 4px;">New ${escapeHtml(label)} just dropped 📘</div>
    </div>
    <p style="font-size: 15px; line-height: 1.55;">${greet}</p>
    <p style="font-size: 15px; line-height: 1.55;">
      Khyati has uploaded a new <b>${escapeHtml(label.toLowerCase())}</b> for
      <b>Class ${escapeHtml(entry.classId)} — ${escapeHtml(chapterName)}</b>.
      Hop in and start reading.
    </p>
    <p style="text-align: center; margin: 28px 0;">
      <a href="${link}" style="display: inline-block; background: #1a2a4d; color: #fff; padding: 14px 26px; border-radius: 14px; text-decoration: none; font-weight: 700;">Open Learning Hub</a>
    </p>
    <p style="font-size: 12px; color: #6c7a99; line-height: 1.5;">
      You're getting this because you signed up at ChemistryByKK. To stop receiving these,
      reply with "unsubscribe" and we'll remove you within 24 hours.
    </p>
  </div>`;
  return { subject, html };
}

export async function notifyNewAsset(
  entry: AssetEntry,
  chapterName: string,
): Promise<{ sent: number; failed: number; skipped: boolean }> {
  if (!isMailConfigured()) {
    return { sent: 0, failed: 0, skipped: true };
  }
  const subs = await listSubscribers();
  // Only notify subscribers who selected the matching class.
  // If subscriber.class is unset, send anyway (better to notify than miss).
  const targets = subs.filter(
    (s) => !!s.email && (!s.class || s.class === entry.classId),
  );

  let sent = 0;
  let failed = 0;
  for (const s of targets) {
    const { subject, html } = newAssetEmail(s.name, entry, chapterName);
    const r = await sendOne({ email: s.email, name: s.name }, subject, html);
    if (r.ok) sent++;
    else failed++;
  }
  return { sent, failed, skipped: false };
}
