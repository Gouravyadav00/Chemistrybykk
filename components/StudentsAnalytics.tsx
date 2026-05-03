"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  Copy,
  Flame,
  GraduationCap,
  Mail,
  Phone,
  School,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Subscriber = {
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
  streak10: number;
  streak30: number;
};

type Stats = {
  total: number;
  byClass: Record<string, number>;
  joinedLast7d: number;
  joinedLast30d: number;
  activeLast7d: number;
};

type StreakFilter = "any" | "7d" | "10d";

const fmtDate = (t?: number) =>
  t ? new Date(t).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "—";

const since = (t?: number) => {
  if (!t) return "—";
  const d = (Date.now() - t) / 86_400_000;
  if (d < 1) return "today";
  if (d < 2) return "yesterday";
  if (d < 30) return `${Math.floor(d)}d ago`;
  if (d < 365) return `${Math.floor(d / 30)}mo ago`;
  return `${Math.floor(d / 365)}y ago`;
};

export default function StudentsAnalytics() {
  const [subs, setSubs] = useState<Subscriber[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [streakFilter, setStreakFilter] = useState<StreakFilter>("any");
  const [sort, setSort] = useState<"recent-joined" | "recent-active" | "longest-streak">(
    "recent-joined",
  );

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/subscribers", { cache: "no-store" });
      if (!res.ok) {
        setError(res.status === 401 ? "Session expired." : "Couldn't load students.");
        return;
      }
      const data = await res.json();
      setSubs(data.subscribers ?? []);
      setStats(data.stats ?? null);
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let out = subs.filter((s) => {
      if (classFilter !== "all" && (s.class ?? "") !== classFilter) return false;
      if (streakFilter === "7d" && s.streak10 < 7) return false;
      if (streakFilter === "10d" && s.streak10 < 10) return false;
      if (!q) return true;
      const hay = [s.email, s.name, s.school, s.city, s.phone, s.interest, s.exam]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
    if (sort === "recent-joined") out.sort((a, b) => b.joinedAt - a.joinedAt);
    if (sort === "recent-active")
      out.sort((a, b) => (b.lastVisit ?? 0) - (a.lastVisit ?? 0));
    if (sort === "longest-streak")
      out.sort((a, b) => b.streak30 - a.streak30 || b.streak10 - a.streak10);
    return out;
  }, [subs, search, classFilter, streakFilter, sort]);

  const remove = async (id: string) => {
    if (!confirm("Remove this student record?")) return;
    const res = await fetch(`/api/admin/subscribers/${id}`, { method: "DELETE" });
    if (res.ok) setSubs((prev) => prev.filter((s) => s.id !== id));
  };

  const copyEmails = async () => {
    const list = filtered.map((s) => s.email).join(", ");
    try {
      await navigator.clipboard.writeText(list);
      alert(`Copied ${filtered.length} emails to clipboard.`);
    } catch {}
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      {/* Stat tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Stat label="Total Students" value={stats?.total ?? 0} icon={<Users size={18} />} />
        <Stat label="Joined · 7d" value={stats?.joinedLast7d ?? 0} icon={<Calendar size={18} />} />
        <Stat label="Joined · 30d" value={stats?.joinedLast30d ?? 0} icon={<Calendar size={18} />} />
        <Stat label="Active · 7d" value={stats?.activeLast7d ?? 0} icon={<Flame size={18} />} tone="warm" />
      </div>

      {/* By-class breakdown */}
      {stats && (
        <div className="clay p-4 mb-6 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wide text-clay-muted mr-1">
            By class:
          </span>
          {Object.entries(stats.byClass).length === 0 && (
            <span className="text-xs text-clay-muted">No data yet.</span>
          )}
          {Object.entries(stats.byClass)
            .sort()
            .map(([k, v]) => (
              <span
                key={k}
                className="clay-sm text-xs font-semibold px-3 py-1.5 text-clay-ink dark:text-white"
              >
                {k}: <span className="text-clay-accent">{v}</span>
              </span>
            ))}
        </div>
      )}

      {/* Filters */}
      <div className="clay p-4 sm:p-5 mb-5 grid md:grid-cols-12 gap-3">
        <div className="clay-inset flex items-center gap-2 px-4 py-3 md:col-span-5">
          <Search size={16} className="text-clay-muted flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search email / name / school / city…"
            className="bg-transparent outline-none text-sm w-full text-clay-ink dark:text-white placeholder:text-clay-muted min-w-0"
          />
        </div>
        <div className="md:col-span-3">
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="clay-inset px-3 py-3 text-sm w-full bg-transparent outline-none text-clay-ink dark:text-white appearance-none cursor-pointer"
          >
            <option value="all">All classes</option>
            <option value="9">Class 9</option>
            <option value="10">Class 10</option>
            <option value="11">Class 11</option>
            <option value="12">Class 12</option>
            <option value="Dropper">Droppers / Repeaters</option>
            <option value="Other">Other</option>
            <option value="">No class set</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <select
            value={streakFilter}
            onChange={(e) => setStreakFilter(e.target.value as StreakFilter)}
            className="clay-inset px-3 py-3 text-sm w-full bg-transparent outline-none text-clay-ink dark:text-white appearance-none cursor-pointer"
          >
            <option value="any">Any activity</option>
            <option value="7d">Daily · 7 days</option>
            <option value="10d">Daily · 10 days</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="clay-inset px-3 py-3 text-sm w-full bg-transparent outline-none text-clay-ink dark:text-white appearance-none cursor-pointer"
          >
            <option value="recent-joined">Newest signups</option>
            <option value="recent-active">Most recent visit</option>
            <option value="longest-streak">Longest streak</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="text-sm text-clay-muted">
          Showing <span className="font-bold text-clay-ink dark:text-white">{filtered.length}</span>{" "}
          of {subs.length}
        </div>
        <div className="flex gap-2">
          <button onClick={copyEmails} className="clay-btn-secondary text-xs">
            <Copy size={14} /> Copy emails
          </button>
          <button onClick={load} className="clay-btn-secondary text-xs">
            Refresh
          </button>
        </div>
      </div>

      {/* List */}
      {error && (
        <div className="clay p-6 text-center text-red-500">{error}</div>
      )}
      {loading && !error && (
        <div className="clay p-6 text-center text-clay-muted">Loading…</div>
      )}
      {!loading && !error && filtered.length === 0 && (
        <div className="clay p-10 text-center text-clay-muted">
          <Users size={28} className="mx-auto mb-2 text-clay-accent" />
          No students match your filters yet.
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-4">
        {filtered.map((s) => (
          <Card key={s.id} sub={s} onDelete={() => remove(s.id)} />
        ))}
      </div>
    </motion.div>
  );
}

function Stat({
  label,
  value,
  icon,
  tone = "blue",
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  tone?: "blue" | "warm";
}) {
  const cls =
    tone === "warm"
      ? "from-amber-100 to-orange-200 text-orange-600"
      : "from-blue-100 to-blue-300 text-clay-accentDeep";
  return (
    <div className="clay p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br grid place-items-center shadow-clay-sm ${cls}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="display font-extrabold text-xl text-clay-ink dark:text-white">
          {value}
        </div>
        <div className="text-[10px] uppercase tracking-wide text-clay-muted">
          {label}
        </div>
      </div>
    </div>
  );
}

function Card({ sub: s, onDelete }: { sub: Subscriber; onDelete: () => void }) {
  return (
    <div className="clay p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <div className="display font-bold text-clay-ink dark:text-white truncate">
            {s.name || s.email}
          </div>
          <div className="text-xs text-clay-muted flex items-center gap-1 truncate">
            <Mail size={12} /> {s.email}
          </div>
        </div>
        <button
          onClick={onDelete}
          className="clay-sm w-8 h-8 grid place-items-center text-red-500 hover:text-red-600 flex-shrink-0"
          aria-label="Remove student"
          title="Remove"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {s.class && (
          <Tag icon={<GraduationCap size={11} />}>Class {s.class}</Tag>
        )}
        {s.exam && <Tag>{s.exam}</Tag>}
        {s.school && <Tag icon={<School size={11} />}>{s.school}</Tag>}
        {s.city && <Tag>{s.city}</Tag>}
        {s.phone && <Tag icon={<Phone size={11} />}>{s.phone}</Tag>}
        {s.interest && <Tag>{s.interest}</Tag>}
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <Mini label="Joined" value={fmtDate(s.joinedAt)} />
        <Mini label="Last seen" value={since(s.lastVisit)} />
        <Mini label="Streak" value={`${s.streak10}/10`} tone={s.streak10 >= 7 ? "warm" : "blue"} />
      </div>
    </div>
  );
}

function Tag({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <span className="clay-sm text-[11px] font-semibold px-2 py-1 inline-flex items-center gap-1 text-clay-ink dark:text-white">
      {icon}
      {children}
    </span>
  );
}

function Mini({
  label,
  value,
  tone = "blue",
}: {
  label: string;
  value: string;
  tone?: "blue" | "warm";
}) {
  const valueClass =
    tone === "warm" ? "text-orange-600" : "text-clay-ink dark:text-white";
  return (
    <div className="clay-sm px-2 py-2">
      <div className={`display font-extrabold text-sm ${valueClass}`}>
        {value}
      </div>
      <div className="text-[9px] uppercase tracking-wide text-clay-muted">
        {label}
      </div>
    </div>
  );
}
