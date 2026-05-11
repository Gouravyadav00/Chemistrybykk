"use client";

import { motion } from "framer-motion";
import {
  Brain,
  Loader2,
  Search,
  Trophy,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type ScoreEntry = {
  classId: string;
  chapterSlug: string;
  title: string;
  correct: number;
  total: number;
  pct: number;
  takenAt: number;
};

type Student = {
  id: string;
  email: string;
  name?: string;
  class?: string;
  quizScores: Record<string, ScoreEntry>;
};

function avgPct(scores: Record<string, ScoreEntry>): number {
  const arr = Object.values(scores);
  if (arr.length === 0) return 0;
  return Math.round(arr.reduce((a, s) => a + s.pct, 0) / arr.length);
}

function bestPct(scores: Record<string, ScoreEntry>): number {
  const arr = Object.values(scores);
  if (arr.length === 0) return 0;
  return Math.max(...arr.map((s) => s.pct));
}

function fmtDate(t: number): string {
  return new Date(t).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function scoreTone(pct: number): string {
  if (pct >= 75) return "text-emerald-600 dark:text-emerald-400";
  if (pct >= 50) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

export default function AdminQuizScores() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/quiz-scores")
      .then((r) => r.json())
      .then((d) => setStudents(d?.students ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return students;
    const q = search.toLowerCase();
    return students.filter((s) =>
      [s.email, s.name, s.class].some((v) => v?.toLowerCase().includes(q)),
    );
  }, [students, search]);

  const selected = useMemo(
    () => students.find((s) => s.id === selectedId) ?? null,
    [students, selectedId],
  );

  if (loading) {
    return (
      <div className="clay p-10 text-center text-clay-muted">
        <Loader2 className="mx-auto animate-spin" />
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="clay p-10 text-center text-clay-muted">
        <Brain size={28} className="mx-auto mb-2 text-clay-accent" />
        <p className="text-clay-ink dark:text-white font-semibold">
          No quiz attempts yet
        </p>
        <p className="text-xs mt-1">
          Once a student finishes a test, their latest score per chapter will
          show up here.
        </p>
      </div>
    );
  }

  const totalAttempts = students.reduce(
    (n, s) => n + Object.keys(s.quizScores).length,
    0,
  );
  const orgAvg = students.length
    ? Math.round(
        students.reduce((a, s) => a + avgPct(s.quizScores), 0) / students.length,
      )
    : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="grid sm:grid-cols-3 gap-3 mb-6">
        <SummaryTile
          icon={<Users size={18} />}
          tone="blue"
          value={students.length.toString()}
          label="Students attempted"
        />
        <SummaryTile
          icon={<Brain size={18} />}
          tone="rose"
          value={totalAttempts.toString()}
          label="Tests recorded"
        />
        <SummaryTile
          icon={<Trophy size={18} />}
          tone="emerald"
          value={`${orgAvg}%`}
          label="Class-wide average"
        />
      </div>

      <div className="grid lg:grid-cols-[320px_1fr] gap-4">
        {/* Student list */}
        <div className="clay p-4 lg:max-h-[640px] lg:overflow-hidden lg:flex lg:flex-col">
          <div className="clay-inset flex items-center gap-2 px-3 py-2 mb-3 flex-shrink-0">
            <Search size={14} className="text-clay-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, class…"
              className="bg-transparent outline-none text-sm w-full text-clay-ink dark:text-white placeholder:text-clay-muted"
            />
          </div>
          <div className="space-y-2 overflow-y-auto pr-1 -mr-1">
            {filtered.length === 0 && (
              <div className="text-xs text-clay-muted text-center py-6">
                No students match "{search}".
              </div>
            )}
            {filtered.map((s) => {
              const count = Object.keys(s.quizScores).length;
              const avg = avgPct(s.quizScores);
              const best = bestPct(s.quizScores);
              const active = selectedId === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedId(s.id)}
                  className={`w-full text-left clay-sm p-3 transition-all ${
                    active ? "ring-2 ring-clay-accent" : ""
                  }`}
                >
                  <div className="font-semibold text-clay-ink dark:text-white text-sm truncate">
                    {s.name || s.email.split("@")[0]}
                  </div>
                  <div className="text-[10px] text-clay-muted truncate">
                    {s.email} {s.class ? `· Class ${s.class}` : ""}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-[11px]">
                    <span className="text-clay-accent font-bold">
                      {count} {count === 1 ? "test" : "tests"}
                    </span>
                    <span className={`font-semibold ${scoreTone(avg)}`}>
                      avg {avg}%
                    </span>
                    <span className="text-clay-muted">best {best}%</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Score detail */}
        <div className="clay p-5">
          {selected ? (
            <StudentDetail student={selected} />
          ) : (
            <div className="h-full min-h-[300px] grid place-items-center text-clay-muted text-sm text-center px-4">
              <div>
                <Trophy
                  size={28}
                  className="mx-auto mb-2 text-clay-accent"
                />
                Select a student on the left to see their chapter-by-chapter
                quiz history.
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function StudentDetail({ student }: { student: Student }) {
  const entries = Object.values(student.quizScores).sort(
    (a, b) => b.takenAt - a.takenAt,
  );
  const avg = avgPct(student.quizScores);
  const best = bestPct(student.quizScores);

  return (
    <div>
      <div className="flex items-start gap-3 mb-4 flex-wrap">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-100 to-rose-300 text-rose-700 grid place-items-center shadow-clay-sm flex-shrink-0">
          <Trophy size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="display font-extrabold text-clay-ink dark:text-white truncate">
            {student.name || student.email.split("@")[0]}
          </div>
          <div className="text-xs text-clay-muted truncate">
            {student.email} · Class {student.class ?? "—"}
          </div>
        </div>
        <div className="flex gap-2">
          <Stat label="Tests" value={entries.length.toString()} />
          <Stat label="Avg" value={`${avg}%`} tone={scoreTone(avg)} />
          <Stat label="Best" value={`${best}%`} tone={scoreTone(best)} />
        </div>
      </div>

      <div className="space-y-2">
        {entries.map((s) => (
          <div
            key={`${s.classId}:${s.chapterSlug}`}
            className="clay-sm p-3 flex items-center gap-3"
          >
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-clay-ink dark:text-white text-sm truncate">
                {s.title || s.chapterSlug}
              </div>
              <div className="text-[10px] text-clay-muted truncate">
                Class {s.classId} · {fmtDate(s.takenAt)}
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-clay-soft/60 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    s.pct >= 75
                      ? "bg-emerald-500"
                      : s.pct >= 50
                        ? "bg-amber-500"
                        : "bg-red-500"
                  }`}
                  style={{ width: `${s.pct}%` }}
                />
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div
                className={`display font-extrabold text-lg ${scoreTone(s.pct)}`}
              >
                {s.correct}/{s.total}
              </div>
              <div className="text-[10px] text-clay-muted">{s.pct}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="clay-sm px-2.5 py-2 text-center">
      <div
        className={`display font-extrabold text-sm ${
          tone ?? "text-clay-ink dark:text-white"
        }`}
      >
        {value}
      </div>
      <div className="text-[9px] uppercase tracking-wide text-clay-muted">
        {label}
      </div>
    </div>
  );
}

function SummaryTile({
  icon,
  tone,
  value,
  label,
}: {
  icon: React.ReactNode;
  tone: "blue" | "rose" | "emerald";
  value: string;
  label: string;
}) {
  const cls =
    tone === "rose"
      ? "from-rose-100 to-rose-300 text-rose-700"
      : tone === "emerald"
        ? "from-emerald-100 to-emerald-300 text-emerald-700"
        : "from-blue-100 to-blue-300 text-clay-accentDeep";
  return (
    <div className="clay p-4 flex items-center gap-3">
      <div
        className={`w-11 h-11 rounded-2xl bg-gradient-to-br grid place-items-center shadow-clay-sm ${cls}`}
      >
        {icon}
      </div>
      <div>
        <div className="display font-extrabold text-clay-ink dark:text-white">
          {value}
        </div>
        <div className="text-[10px] uppercase tracking-wide text-clay-muted">
          {label}
        </div>
      </div>
    </div>
  );
}
