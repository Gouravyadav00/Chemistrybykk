"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  HelpCircle,
  Loader2,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import DoubtChat from "./DoubtChat";

type Thread = {
  id: string;
  title: string;
  status: "open" | "answered";
  subscriberEmail: string;
  subscriberName?: string;
  subscriberClass?: string;
  createdAt: number;
  updatedAt: number;
  lastAuthor: "student" | "admin";
  messageCount: number;
  adminUnread: number;
};

type Filter = "all" | "open" | "answered" | "unread";

export default function AdminDoubts() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  const refresh = async () => {
    const res = await fetch("/api/doubts");
    const data = await res.json();
    setThreads(data.threads || []);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 30_000);
    return () => clearInterval(t);
  }, []);

  if (active) {
    return (
      <DoubtChat
        threadId={active}
        viewer="admin"
        onBack={() => {
          setActive(null);
          refresh();
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="clay p-10 text-center text-clay-muted">
        <Loader2 className="mx-auto animate-spin" />
      </div>
    );
  }

  const filtered = threads.filter((t) => {
    if (filter === "open" && t.status !== "open") return false;
    if (filter === "answered" && t.status !== "answered") return false;
    if (filter === "unread" && t.adminUnread === 0) return false;
    if (search) {
      const q = search.toLowerCase();
      const hay = `${t.title} ${t.subscriberEmail} ${t.subscriberName ?? ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const open = threads.filter((t) => t.status === "open").length;
  const totalUnread = threads.reduce((s, t) => s + t.adminUnread, 0);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="grid sm:grid-cols-3 gap-3 mb-6">
        <Tile label="Total" value={String(threads.length)} />
        <Tile label="Open" value={String(open)} tone="amber" />
        <Tile label="Unread" value={String(totalUnread)} tone="blue" />
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {(["all", "open", "answered", "unread"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize ${
              filter === f
                ? "clay-btn-primary"
                : "clay-btn-secondary text-clay-ink dark:text-white"
            }`}
          >
            {f}
          </button>
        ))}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search title, name, email…"
          className="clay-inset px-4 py-1.5 text-xs rounded-xl bg-transparent outline-none text-clay-ink dark:text-white placeholder:text-clay-muted flex-1 min-w-[200px]"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="clay p-10 text-center text-sm text-clay-muted">
          No doubts match this view.
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((t) => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className="clay w-full p-4 text-left hover:scale-[1.005] transition"
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
                    {t.adminUnread > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-clay-accent text-white">
                        {t.adminUnread} new
                      </span>
                    )}
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        t.status === "answered"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {t.status === "answered" ? (
                        <>
                          <CheckCircle2 size={10} /> Answered
                        </>
                      ) : (
                        <>
                          <Clock size={10} /> Waiting
                        </>
                      )}
                    </span>
                  </div>
                  <p className="text-xs text-clay-muted mt-1.5">
                    {t.subscriberName ?? t.subscriberEmail}
                    {t.subscriberClass ? ` · Class ${t.subscriberClass}` : ""}
                    {" · "}
                    {t.messageCount} msg · {formatRelative(t.updatedAt)}
                  </p>
                </div>
                <Trash2
                  size={14}
                  className="text-clay-muted hover:text-red-500 flex-shrink-0 mt-1"
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (!confirm("Delete this entire conversation?")) return;
                    await fetch(`/api/admin/doubts/${t.id}`, {
                      method: "DELETE",
                    });
                    refresh();
                  }}
                />
              </div>
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function Tile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "amber" | "blue";
}) {
  const cls =
    tone === "amber"
      ? "from-amber-100 to-orange-200 text-orange-600"
      : tone === "blue"
        ? "from-blue-100 to-blue-300 text-clay-accentDeep"
        : "from-slate-100 to-slate-200 text-slate-600";
  return (
    <div className="clay p-4 flex items-center gap-3">
      <div
        className={`w-11 h-11 rounded-2xl bg-gradient-to-br grid place-items-center shadow-clay-sm ${cls}`}
      >
        <HelpCircle size={18} />
      </div>
      <div>
        <div className="display font-bold text-clay-ink dark:text-white text-lg leading-none">
          {value}
        </div>
        <div className="text-[11px] text-clay-muted uppercase tracking-wide mt-1">
          {label}
        </div>
      </div>
    </div>
  );
}

function formatRelative(ts: number) {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(ts).toLocaleDateString();
}
