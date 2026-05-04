"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  FileText,
  ImageIcon,
  Loader2,
  Paperclip,
  Send,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Attachment = {
  dataUrl: string;
  name: string;
  size: number;
  kind: "image" | "pdf";
};

type Message = {
  id: string;
  threadId: string;
  author: "student" | "admin";
  text: string;
  attachment?: Attachment;
  createdAt: number;
};

type Thread = {
  id: string;
  title: string;
  status: "open" | "answered";
  subscriberEmail: string;
  subscriberName?: string;
  subscriberClass?: string;
  createdAt: number;
  updatedAt: number;
  messageCount: number;
};

const MAX_BYTES = 5 * 1024 * 1024;

export default function DoubtChat({
  threadId,
  viewer,
  onBack,
}: {
  threadId: string;
  viewer: "student" | "admin";
  onBack: () => void;
}) {
  const [thread, setThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [att, setAtt] = useState<Attachment | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    const res = await fetch(`/api/doubts/${threadId}`);
    if (!res.ok) {
      setError("Couldn't load the conversation.");
      setLoading(false);
      return;
    }
    const data = await res.json();
    setThread(data.thread);
    setMessages(data.messages || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // light polling so admin replies show up without manual refresh
    const t = setInterval(load, 15_000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length]);

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

  const send = async () => {
    if (!text.trim() && !att) return;
    setSending(true);
    setError(null);
    const res = await fetch(`/api/doubts/${threadId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, attachment: att ?? undefined }),
    });
    setSending(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j?.error ?? "Couldn't send message.");
      return;
    }
    const j = await res.json();
    setMessages((prev) => [...prev, j.message]);
    setThread(j.thread);
    setText("");
    setAtt(null);
  };

  if (loading) {
    return (
      <div className="clay p-10 text-center text-clay-muted">
        <Loader2 className="mx-auto animate-spin" />
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="clay p-8 text-center">
        <p className="text-clay-muted">Conversation not found.</p>
        <button
          onClick={onBack}
          className="clay-btn-secondary text-sm mt-4 mx-auto"
        >
          <ArrowLeft size={14} /> Back
        </button>
      </div>
    );
  }

  return (
    <div className="clay p-4 sm:p-6">
      <div className="flex items-start gap-3 mb-4">
        <button
          onClick={onBack}
          className="clay-sm w-10 h-10 grid place-items-center flex-shrink-0"
          aria-label="Back"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="display font-extrabold text-clay-ink dark:text-white text-lg sm:text-xl truncate">
              {thread.title}
            </h2>
            <span
              className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                thread.status === "answered"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {thread.status}
            </span>
          </div>
          {viewer === "admin" && (
            <p className="text-xs text-clay-muted mt-1">
              From {thread.subscriberName ?? thread.subscriberEmail}
              {thread.subscriberClass ? ` · Class ${thread.subscriberClass}` : ""}
              {" · "}
              <a
                href={`mailto:${thread.subscriberEmail}`}
                className="text-clay-accent"
              >
                {thread.subscriberEmail}
              </a>
            </p>
          )}
        </div>
      </div>

      <div
        ref={scrollRef}
        className="clay-inset rounded-2xl p-3 sm:p-4 max-h-[55vh] overflow-y-auto space-y-3"
      >
        {messages.map((m) => (
          <Bubble key={m.id} msg={m} viewer={viewer} />
        ))}
      </div>

      {error && (
        <div className="mt-3 text-xs text-red-500 font-medium">{error}</div>
      )}

      <div className="mt-3">
        {att && (
          <div className="clay-sm flex items-center gap-2 px-3 py-2 mb-2 text-xs">
            {att.kind === "pdf" ? <FileText size={14} /> : <ImageIcon size={14} />}
            <span className="truncate flex-1">{att.name}</span>
            <button onClick={() => setAtt(null)} aria-label="Remove">
              <X size={14} />
            </button>
          </div>
        )}
        <div className="flex items-end gap-2">
          <label className="clay-sm w-11 h-11 grid place-items-center cursor-pointer flex-shrink-0">
            <Paperclip size={16} />
            <input
              type="file"
              className="hidden"
              accept="application/pdf,image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onPickFile(f);
                e.currentTarget.value = "";
              }}
            />
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder={
              viewer === "admin" ? "Reply to your student…" : "Ask a follow-up…"
            }
            className="clay-inset flex-1 px-4 py-3 text-sm resize-none rounded-2xl bg-transparent outline-none text-clay-ink dark:text-white placeholder:text-clay-muted"
          />
          <button
            onClick={send}
            disabled={sending || (!text.trim() && !att)}
            className="clay-btn-primary px-4 py-3 disabled:opacity-50 flex-shrink-0"
            aria-label="Send"
          >
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}

function Bubble({
  msg,
  viewer,
}: {
  msg: Message;
  viewer: "student" | "admin";
}) {
  const mine = msg.author === viewer;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${mine ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[85%] sm:max-w-[75%] px-3.5 py-2.5 rounded-2xl shadow-clay-sm ${
          mine
            ? "bg-gradient-to-br from-blue-400 to-blue-600 text-white"
            : "bg-white/90 dark:bg-white/10 text-clay-ink dark:text-white"
        }`}
      >
        {!mine && (
          <div
            className={`text-[10px] uppercase font-bold mb-1 ${
              msg.author === "admin" ? "text-clay-accent" : "text-clay-muted"
            }`}
          >
            {msg.author === "admin" ? "Khyati" : "Student"}
          </div>
        )}
        {msg.attachment && <AttachmentBlock att={msg.attachment} />}
        {msg.text && (
          <p className="text-sm whitespace-pre-wrap leading-relaxed break-words">
            {msg.text}
          </p>
        )}
        <div
          className={`text-[10px] mt-1 ${
            mine ? "text-white/70" : "text-clay-muted"
          }`}
        >
          {formatTime(msg.createdAt)}
        </div>
      </div>
    </motion.div>
  );
}

function AttachmentBlock({ att }: { att: Attachment }) {
  if (att.kind === "image") {
    return (
      <a
        href={att.dataUrl}
        target="_blank"
        rel="noreferrer"
        className="block mb-1.5"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={att.dataUrl}
          alt={att.name}
          className="rounded-xl max-h-64 object-contain bg-black/5"
        />
      </a>
    );
  }
  return (
    <a
      href={att.dataUrl}
      target="_blank"
      rel="noreferrer"
      download={att.name}
      className="flex items-center gap-2 mb-1.5 px-3 py-2 rounded-xl bg-black/10 dark:bg-white/10 text-sm hover:bg-black/15"
    >
      <FileText size={16} />
      <span className="truncate">{att.name}</span>
    </a>
  );
}

function formatTime(ts: number) {
  const d = new Date(ts);
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  if (isToday) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return (
    d.toLocaleDateString([], { day: "numeric", month: "short" }) +
    " · " +
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
}
