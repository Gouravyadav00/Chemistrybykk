"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileText,
  HelpCircle,
  ImageIcon,
  Loader2,
  Lock,
  MessageCircleQuestion,
  Paperclip,
  Plus,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import DoubtChat from "@/components/DoubtChat";
import Logo from "@/components/Logo";

type Whoami =
  | { role: "guest" }
  | { role: "subscriber"; subscriber: { email: string; name?: string; class?: string } }
  | { role: "admin" };

type Thread = {
  id: string;
  title: string;
  status: "open" | "answered";
  createdAt: number;
  updatedAt: number;
  lastAuthor: "student" | "admin";
  messageCount: number;
  studentUnread: number;
};

const MAX_BYTES = 5 * 1024 * 1024;

export default function DoubtsPage() {
  const [me, setMe] = useState<Whoami | null>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<string | null>(null);
  const [composing, setComposing] = useState(false);

  const refresh = async () => {
    const res = await fetch("/api/doubts");
    if (res.status === 401) {
      setLoading(false);
      return;
    }
    const data = await res.json();
    setThreads(data.threads || []);
    setLoading(false);
  };

  useEffect(() => {
    fetch("/api/auth")
      .then((r) => r.json())
      .then((d) => {
        setMe(d);
        if (d.role === "subscriber" || d.role === "admin") refresh();
        else setLoading(false);
      });
  }, []);

  if (!me || loading) {
    return (
      <main className="min-h-screen grid place-items-center">
        <Loader2 className="animate-spin text-clay-accent" />
      </main>
    );
  }

  if (me.role === "guest") {
    return <GuestGate />;
  }

  if (me.role === "admin") {
    return (
      <main className="min-h-screen px-4 sm:px-6 py-8">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/signin"
            className="inline-flex items-center gap-2 text-sm text-clay-accent font-semibold mb-4"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <div className="clay p-6">
            <p className="text-sm text-clay-muted">
              Admins manage all student doubts from the{" "}
              <Link href="/signin" className="text-clay-accent font-semibold">
                Dashboard → Doubts tab
              </Link>
              .
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 sm:px-6 py-8 relative">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-10 -left-10 w-72 h-72 clay-blob alt opacity-40 animate-floatSlow" />
        <div className="absolute bottom-10 -right-10 w-80 h-80 clay-blob opacity-30 animate-float" />
      </div>

      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-clay-accent font-semibold mb-6"
        >
          <ArrowLeft size={16} /> Back to Site
        </Link>

        {active ? (
          <DoubtChat
            threadId={active}
            viewer="student"
            onBack={() => {
              setActive(null);
              refresh();
            }}
          />
        ) : composing ? (
          <NewDoubtForm
            onClose={() => setComposing(false)}
            onCreated={(t) => {
              setComposing(false);
              setThreads((prev) => [t, ...prev]);
              setActive(t.id);
            }}
          />
        ) : (
          <ThreadList
            threads={threads}
            onOpen={(id) => setActive(id)}
            onNew={() => setComposing(true)}
          />
        )}
      </div>
    </main>
  );
}

function GuestGate() {
  return (
    <main className="min-h-screen px-4 sm:px-6 py-12 relative grid place-items-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="clay max-w-md w-full p-8 text-center"
      >
        <Logo size="lg" />
        <div className="mt-5 w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-200 to-blue-500 grid place-items-center text-white shadow-clay-sm">
          <Lock size={26} />
        </div>
        <h1 className="display text-2xl font-extrabold text-clay-ink dark:text-white mt-4">
          Sign in to ask a doubt
        </h1>
        <p className="text-sm text-clay-muted mt-2">
          Doubts are private conversations between you and Khyati. Sign in (or
          create a free account) to start one.
        </p>
        <div className="mt-5 flex flex-wrap gap-2 justify-center">
          <Link href="/signin" className="clay-btn-primary text-sm">
            Sign In
          </Link>
          <Link href="/" className="clay-btn-secondary text-sm">
            <ArrowLeft size={14} /> Home
          </Link>
        </div>
      </motion.div>
    </main>
  );
}

function ThreadList({
  threads,
  onOpen,
  onNew,
}: {
  threads: Thread[];
  onOpen: (id: string) => void;
  onNew: () => void;
}) {
  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-6 flex-wrap">
        <div>
          <h1 className="display text-3xl font-extrabold text-clay-ink dark:text-white flex items-center gap-2">
            <MessageCircleQuestion className="text-clay-accent" />
            Your Doubts
          </h1>
          <p className="text-clay-muted text-sm mt-1">
            Ask Khyati anything — attach a screenshot or PDF if it helps.
          </p>
        </div>
        <button onClick={onNew} className="clay-btn-primary text-sm">
          <Plus size={16} /> Ask a doubt
        </button>
      </div>

      {threads.length === 0 ? (
        <div className="clay p-10 text-center">
          <Sparkles className="mx-auto text-clay-accent" />
          <p className="mt-3 text-clay-ink dark:text-white font-semibold">
            No doubts yet
          </p>
          <p className="text-xs text-clay-muted mt-1">
            Start by asking your first question — Khyati typically replies within
            a day.
          </p>
          <button
            onClick={onNew}
            className="clay-btn-primary text-sm mt-5 mx-auto"
          >
            <Plus size={14} /> Ask your first doubt
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {threads.map((t) => (
            <button
              key={t.id}
              onClick={() => onOpen(t.id)}
              className="clay w-full p-4 sm:p-5 text-left hover:scale-[1.005] transition"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-300 grid place-items-center text-clay-accentDeep shadow-clay-sm flex-shrink-0">
                  <HelpCircle size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="display font-bold text-clay-ink dark:text-white truncate">
                      {t.title}
                    </h3>
                    {t.studentUnread > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-clay-accent text-white">
                        {t.studentUnread} new
                      </span>
                    )}
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        t.status === "answered"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {t.status === "answered" ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle2 size={10} /> Answered
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Clock size={10} /> Waiting
                        </span>
                      )}
                    </span>
                  </div>
                  <p className="text-xs text-clay-muted mt-1.5">
                    {t.messageCount} message{t.messageCount === 1 ? "" : "s"} ·
                    last update {formatRelative(t.updatedAt)}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function NewDoubtForm({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (t: Thread) => void;
}) {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [att, setAtt] = useState<{
    dataUrl: string;
    name: string;
    size: number;
    kind: "image" | "pdf";
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onPickFile = async (file: File) => {
    setError(null);
    if (file.size > MAX_BYTES) {
      setError("File is over 5 MB.");
      return;
    }
    const isPdf = file.type === "application/pdf";
    const isImg = file.type.startsWith("image/");
    if (!isPdf && !isImg) {
      setError("Only PDFs or images are allowed.");
      return;
    }
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    setAtt({
      dataUrl,
      name: file.name,
      size: file.size,
      kind: isPdf ? "pdf" : "image",
    });
  };

  const submit = async () => {
    setError(null);
    if (!title.trim()) return setError("Please add a title.");
    if (!text.trim()) return setError("Please describe your doubt.");
    setSubmitting(true);
    const res = await fetch("/api/doubts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, text, attachment: att ?? undefined }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j?.error ?? "Couldn't post your doubt.");
      return;
    }
    const j = await res.json();
    onCreated(j.thread);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="clay p-5 sm:p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={onClose}
          className="clay-sm w-10 h-10 grid place-items-center"
          aria-label="Back"
        >
          <ArrowLeft size={16} />
        </button>
        <h2 className="display text-xl font-extrabold text-clay-ink dark:text-white">
          Ask a new doubt
        </h2>
      </div>

      <label className="block text-xs font-semibold text-clay-muted mb-1.5">
        Title
      </label>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={140}
        placeholder="e.g. Confused about Le Chatelier's principle"
        className="clay-inset w-full px-4 py-3 text-sm rounded-2xl bg-transparent outline-none text-clay-ink dark:text-white placeholder:text-clay-muted mb-4"
      />

      <label className="block text-xs font-semibold text-clay-muted mb-1.5">
        Your question
      </label>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        placeholder="Describe what's tripping you up. The more specific, the faster Khyati can help."
        className="clay-inset w-full px-4 py-3 text-sm rounded-2xl bg-transparent outline-none text-clay-ink dark:text-white placeholder:text-clay-muted resize-y mb-3"
      />

      {att ? (
        <div className="clay-sm flex items-center gap-2 px-3 py-2 mb-3 text-xs">
          {att.kind === "pdf" ? <FileText size={14} /> : <ImageIcon size={14} />}
          <span className="truncate flex-1">{att.name}</span>
          <button onClick={() => setAtt(null)} aria-label="Remove">
            <X size={14} />
          </button>
        </div>
      ) : (
        <label className="clay-btn-secondary text-xs cursor-pointer inline-flex mb-3">
          <Paperclip size={14} /> Attach screenshot or PDF
          <input
            type="file"
            accept="application/pdf,image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onPickFile(f);
              e.currentTarget.value = "";
            }}
          />
        </label>
      )}

      {error && (
        <div className="text-xs text-red-500 font-medium mb-3">{error}</div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          onClick={submit}
          disabled={submitting}
          className="clay-btn-primary text-sm disabled:opacity-50"
        >
          {submitting ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Send size={14} />
          )}
          Post Doubt
        </button>
        <button onClick={onClose} className="clay-btn-secondary text-sm">
          Cancel
        </button>
      </div>
    </motion.div>
  );
}

function formatRelative(ts: number) {
  const diff = Date.now() - ts;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day} day${day === 1 ? "" : "s"} ago`;
  return new Date(ts).toLocaleDateString();
}
