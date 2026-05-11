"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  Circle,
  Flag,
  Home,
  Play,
  RotateCcw,
  Send,
  Timer,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { QuizDefinition, QuizQuestion } from "@/data/quizzes";

type Phase = "idle" | "running" | "submitted";

type CellStatus = "answered" | "review" | "visited" | "unvisited";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function formatTime(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60)
    .toString()
    .padStart(2, "0");
  const s = (total % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

const STATUS_STYLES: Record<CellStatus, string> = {
  answered: "bg-emerald-500 text-white border-emerald-600",
  review: "bg-amber-400 text-white border-amber-500",
  visited: "bg-red-500 text-white border-red-600",
  unvisited: "bg-blue-100 text-clay-accentDeep border-blue-200",
};

const STATUS_LABEL: Record<CellStatus, string> = {
  answered: "Answered",
  review: "Marked for review",
  visited: "Visited · not answered",
  unvisited: "Not visited",
};

export default function QuizRunner({ quiz }: { quiz: QuizDefinition }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [visited, setVisited] = useState<Set<number>>(new Set());
  const [markedReview, setMarkedReview] = useState<Set<number>>(new Set());
  const [timeLeftMs, setTimeLeftMs] = useState(quiz.durationSec * 1000);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const endRef = useRef<number>(0);

  // ---------- Lifecycle ----------
  const startTest = () => {
    const picked = shuffle(quiz.questions).slice(0, quiz.questionsPerAttempt);
    setQuestions(picked);
    setAnswers(new Array(picked.length).fill(null));
    setVisited(new Set([0]));
    setMarkedReview(new Set());
    setCurrent(0);
    setTimeLeftMs(quiz.durationSec * 1000);
    endRef.current = Date.now() + quiz.durationSec * 1000;
    setPhase("running");
  };

  // Timer
  useEffect(() => {
    if (phase !== "running") return;
    const id = setInterval(() => {
      const left = Math.max(0, endRef.current - Date.now());
      setTimeLeftMs(left);
      if (left === 0) {
        setPhase("submitted");
      }
    }, 250);
    return () => clearInterval(id);
  }, [phase]);

  // Visited tracking
  useEffect(() => {
    if (phase !== "running") return;
    setVisited((v) => {
      if (v.has(current)) return v;
      const next = new Set(v);
      next.add(current);
      return next;
    });
  }, [current, phase]);

  // Warn on tab close while running
  useEffect(() => {
    if (phase !== "running") return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [phase]);

  // ---------- Mutations ----------
  const selectOption = (opt: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[current] = opt;
      return next;
    });
  };

  const clearOption = () => {
    setAnswers((prev) => {
      const next = [...prev];
      next[current] = null;
      return next;
    });
  };

  const toggleReview = () => {
    setMarkedReview((prev) => {
      const next = new Set(prev);
      if (next.has(current)) next.delete(current);
      else next.add(current);
      return next;
    });
  };

  // ---------- Derived ----------
  const cellStatus = (i: number): CellStatus => {
    if (markedReview.has(i)) return "review";
    if (answers[i] !== null) return "answered";
    if (visited.has(i)) return "visited";
    return "unvisited";
  };

  const stats = useMemo(() => {
    let answered = 0;
    let unanswered = 0;
    answers.forEach((a) => {
      if (a !== null) answered++;
      else unanswered++;
    });
    return { answered, unanswered, review: markedReview.size };
  }, [answers, markedReview]);

  const score = useMemo(() => {
    let correct = 0;
    let wrong = 0;
    let blank = 0;
    questions.forEach((qn, i) => {
      if (answers[i] === null) blank++;
      else if (answers[i] === qn.correct) correct++;
      else wrong++;
    });
    return {
      correct,
      wrong,
      blank,
      total: questions.length,
      pct: questions.length
        ? Math.round((correct / questions.length) * 100)
        : 0,
    };
  }, [questions, answers]);

  // Persist score once we land in the submitted phase (last-attempt only).
  useEffect(() => {
    if (phase !== "submitted" || questions.length === 0) return;
    fetch("/api/quiz/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        classId: quiz.classId,
        chapterSlug: quiz.chapterSlug,
        title: quiz.title,
        correct: score.correct,
        total: score.total,
      }),
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // ---------- Renders ----------
  if (phase === "submitted") {
    return (
      <Results
        quiz={quiz}
        questions={questions}
        answers={answers}
        score={score}
        onRetake={() => {
          setPhase("idle");
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-clay-bg dark:bg-[#040d20]">
      {/* Header / breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/#learn"
            className="clay-btn-secondary text-xs flex items-center gap-1.5"
          >
            <Home size={14} /> Home
          </Link>
          <div className="text-xs text-clay-muted">
            Class {quiz.classId} · {quiz.title} ·{" "}
            <span className="font-semibold">{quiz.questionsPerAttempt} MCQs</span>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {phase === "idle" ? (
          <IdleScreen key="idle" quiz={quiz} onStart={startTest} />
        ) : (
          <RunningScreen
            key="running"
            quiz={quiz}
            questions={questions}
            current={current}
            onJump={setCurrent}
            timeLeftMs={timeLeftMs}
            answers={answers}
            onSelect={selectOption}
            onClear={clearOption}
            onToggleReview={toggleReview}
            markedReview={markedReview}
            cellStatus={cellStatus}
            stats={stats}
            onPrev={() => setCurrent((c) => Math.max(0, c - 1))}
            onNext={() =>
              setCurrent((c) => Math.min(questions.length - 1, c + 1))
            }
            onAskSubmit={() => setConfirmSubmit(true)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmSubmit && (
          <SubmitConfirm
            stats={stats}
            total={questions.length}
            onCancel={() => setConfirmSubmit(false)}
            onConfirm={() => {
              setConfirmSubmit(false);
              setPhase("submitted");
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* -------------------- Idle (start) screen -------------------- */

function IdleScreen({
  quiz,
  onStart,
}: {
  quiz: QuizDefinition;
  onStart: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-3xl mx-auto px-4 sm:px-6 py-10"
    >
      <div className="clay p-6 sm:p-10 text-center">
        <div className="text-xs uppercase tracking-wider text-clay-accent font-bold mb-2">
          Chapter Quiz
        </div>
        <h1 className="display text-3xl sm:text-4xl font-extrabold text-clay-ink dark:text-white">
          {quiz.title}
        </h1>
        <p className="text-clay-muted mt-3 max-w-xl mx-auto">
          {quiz.questionsPerAttempt} random questions, {quiz.durationSec / 60}{" "}
          minutes, no negative marking. The timer starts the moment you hit
          Start.
        </p>

        <div className="grid grid-cols-3 gap-3 max-w-md mx-auto mt-8 mb-8">
          <Stat
            label="Questions"
            value={String(quiz.questionsPerAttempt)}
          />
          <Stat label="Duration" value={`${quiz.durationSec / 60} min`} />
          <Stat label="Class" value={quiz.classId} />
        </div>

        {/* Stopwatch + start button (will morph to top-left via shared layoutId) */}
        <div className="grid place-items-center my-8">
          <motion.div
            layoutId="stopwatch"
            transition={{ type: "spring", stiffness: 220, damping: 26 }}
            className="relative w-44 h-44 rounded-full bg-gradient-to-br from-blue-100 to-blue-300 dark:from-[#0a163a] dark:to-[#0f1d3f] shadow-clay flex items-center justify-center"
          >
            <div className="absolute inset-2 rounded-full border-4 border-white/70 dark:border-white/10" />
            <div className="absolute inset-6 rounded-full bg-white/80 dark:bg-[#0a163a] flex items-center justify-center">
              <motion.div
                layoutId="stopwatch-text"
                className="display font-extrabold text-3xl text-clay-ink dark:text-white"
              >
                {formatTime(quiz.durationSec * 1000)}
              </motion.div>
            </div>
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-3 rounded-t-md bg-clay-accent" />
          </motion.div>
        </div>

        <button
          onClick={onStart}
          className="clay-btn-primary text-base sm:text-lg px-8 py-4"
        >
          <Play size={18} /> Start Test
        </button>

        <p className="text-xs text-clay-muted mt-6">
          Tip: don't refresh once the test starts — you'll lose your progress.
        </p>
      </div>
    </motion.div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="clay-sm px-3 py-3">
      <div className="display font-extrabold text-xl text-clay-ink dark:text-white">
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-wide text-clay-muted">
        {label}
      </div>
    </div>
  );
}

/* -------------------- Running screen -------------------- */

function RunningScreen({
  quiz,
  questions,
  current,
  onJump,
  timeLeftMs,
  answers,
  onSelect,
  onClear,
  onToggleReview,
  markedReview,
  cellStatus,
  stats,
  onPrev,
  onNext,
  onAskSubmit,
}: {
  quiz: QuizDefinition;
  questions: QuizQuestion[];
  current: number;
  onJump: (i: number) => void;
  timeLeftMs: number;
  answers: (number | null)[];
  onSelect: (opt: number) => void;
  onClear: () => void;
  onToggleReview: () => void;
  markedReview: Set<number>;
  cellStatus: (i: number) => CellStatus;
  stats: { answered: number; unanswered: number; review: number };
  onPrev: () => void;
  onNext: () => void;
  onAskSubmit: () => void;
}) {
  const qn = questions[current];
  const isLast = current === questions.length - 1;
  const isFirst = current === 0;
  const sel = answers[current];
  const lowTime = timeLeftMs < 60_000;
  const reviewed = markedReview.has(current);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 py-6"
    >
      {/* Top bar with stopwatch (slides here from idle) */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <motion.div
          layoutId="stopwatch"
          transition={{ type: "spring", stiffness: 220, damping: 26 }}
          className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full shadow-clay flex items-center justify-center ${
            lowTime
              ? "bg-gradient-to-br from-red-200 to-red-400"
              : "bg-gradient-to-br from-blue-100 to-blue-300 dark:from-[#0a163a] dark:to-[#0f1d3f]"
          }`}
        >
          <div className="absolute inset-1.5 rounded-full border-2 border-white/70 dark:border-white/10" />
          <div className="absolute inset-3 rounded-full bg-white/85 dark:bg-[#0a163a] grid place-items-center">
            <motion.div
              layoutId="stopwatch-text"
              className={`display font-extrabold text-sm sm:text-base ${
                lowTime ? "text-red-600" : "text-clay-ink dark:text-white"
              }`}
            >
              {formatTime(timeLeftMs)}
            </motion.div>
          </div>
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-1.5 rounded-t bg-clay-accent" />
        </motion.div>

        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wide text-clay-muted">
            Question
          </div>
          <div className="display font-extrabold text-clay-ink dark:text-white">
            {current + 1}
            <span className="text-clay-muted">/{questions.length}</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_280px] gap-5">
        {/* Question card */}
        <div className="clay p-5 sm:p-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-xs uppercase tracking-wide text-clay-accent font-bold mb-2">
                Q{current + 1}
              </div>
              <h2 className="display text-lg sm:text-xl font-bold text-clay-ink dark:text-white leading-snug">
                {qn?.text}
              </h2>

              <div className="mt-5 grid gap-2.5">
                {qn?.options.map((opt, i) => {
                  const active = sel === i;
                  return (
                    <button
                      key={i}
                      onClick={() => onSelect(i)}
                      className={`clay-sm text-left px-4 py-3 flex items-start gap-3 transition-all ${
                        active
                          ? "bg-clay-accent text-white shadow-clay-sm"
                          : "hover:-translate-y-0.5"
                      }`}
                    >
                      <span
                        className={`mt-0.5 w-6 h-6 rounded-full grid place-items-center text-xs font-bold flex-shrink-0 ${
                          active
                            ? "bg-white text-clay-accent"
                            : "bg-blue-100 text-clay-accentDeep"
                        }`}
                      >
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span
                        className={`text-sm ${
                          active
                            ? "text-white"
                            : "text-clay-ink dark:text-white"
                        }`}
                      >
                        {opt}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 mt-6">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={onPrev}
                    disabled={isFirst}
                    className={`clay-btn-secondary text-sm ${
                      isFirst ? "opacity-40 cursor-not-allowed" : ""
                    }`}
                  >
                    <ArrowLeft size={14} /> Previous
                  </button>
                  <button onClick={onClear} className="clay-btn-secondary text-sm">
                    <RotateCcw size={14} /> Clear
                  </button>
                  <button
                    onClick={onToggleReview}
                    className={`clay-btn-secondary text-sm ${
                      reviewed ? "text-amber-600 font-bold" : ""
                    }`}
                  >
                    <Flag size={14} />
                    {reviewed ? "Unmark Review" : "Mark for Review"}
                  </button>
                </div>
                {isLast ? (
                  <button
                    onClick={onAskSubmit}
                    className="clay-btn-primary text-sm"
                  >
                    <Send size={14} /> Submit Test
                  </button>
                ) : (
                  <button onClick={onNext} className="clay-btn-primary text-sm">
                    Next <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Sidebar */}
        <aside className="clay p-4 lg:p-5 lg:sticky lg:top-4 lg:self-start">
          <div className="flex items-center gap-2 mb-3">
            <Timer size={16} className="text-clay-accent" />
            <span className="display font-extrabold text-clay-ink dark:text-white text-sm">
              Question palette
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] mb-3">
            {(() => {
              let visited = 0;
              let unvisited = 0;
              for (let i = 0; i < questions.length; i++) {
                const s = cellStatus(i);
                if (s === "visited") visited++;
                else if (s === "unvisited") unvisited++;
              }
              return (
                <>
                  <Tally
                    n={stats.answered}
                    label="Answered"
                    tone="bg-emerald-500"
                  />
                  <Tally n={stats.review} label="Review" tone="bg-amber-400" />
                  <Tally n={visited} label="Visited" tone="bg-red-500" />
                  <Tally n={unvisited} label="Not visited" tone="bg-blue-300" />
                </>
              );
            })()}
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {questions.map((_, i) => {
              const s = cellStatus(i);
              const active = i === current;
              return (
                <button
                  key={i}
                  onClick={() => onJump(i)}
                  title={`Q${i + 1} — ${STATUS_LABEL[s]}`}
                  className={`relative w-full aspect-square rounded-lg text-xs font-bold border-2 transition-all ${STATUS_STYLES[s]} ${
                    active ? "ring-2 ring-clay-accent ring-offset-1" : ""
                  }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          <Legend />

          <button
            onClick={onAskSubmit}
            className="clay-btn-primary text-sm w-full mt-4"
          >
            <Send size={14} /> Submit Test
          </button>
        </aside>
      </div>
    </motion.div>
  );
}

function Tally({
  n,
  label,
  tone,
}: {
  n: number;
  label: string;
  tone: string;
}) {
  return (
    <div className="clay-sm px-2 py-1.5 flex items-center gap-2">
      <span className={`w-2.5 h-2.5 rounded-sm ${tone}`} />
      <div>
        <div className="font-bold text-clay-ink dark:text-white text-xs">{n}</div>
        <div className="text-[9px] uppercase tracking-wide text-clay-muted">
          {label}
        </div>
      </div>
    </div>
  );
}

function Legend() {
  const items: { tone: string; label: string }[] = [
    { tone: "bg-emerald-500", label: "Attempted" },
    { tone: "bg-red-500", label: "Visited (blank)" },
    { tone: "bg-amber-400", label: "Marked for review" },
    { tone: "bg-blue-300", label: "Not visited" },
  ];
  return (
    <div className="mt-4 grid grid-cols-2 gap-1.5 text-[10px] text-clay-muted">
      {items.map((it) => (
        <div key={it.label} className="flex items-center gap-1.5">
          <span className={`w-2.5 h-2.5 rounded-sm ${it.tone}`} />
          <span>{it.label}</span>
        </div>
      ))}
    </div>
  );
}

/* -------------------- Submit confirm -------------------- */

function SubmitConfirm({
  stats,
  total,
  onCancel,
  onConfirm,
}: {
  stats: { answered: number; unanswered: number; review: number };
  total: number;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm grid place-items-center p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 20 }}
        className="clay p-6 max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="display text-xl font-extrabold text-clay-ink dark:text-white">
          Submit test?
        </h3>
        <p className="text-clay-muted text-sm mt-2">
          You have answered <b>{stats.answered}</b> of <b>{total}</b>{" "}
          questions. Once submitted, you can't come back to edit.
        </p>
        {stats.unanswered > 0 && (
          <p className="text-xs text-red-600 mt-2">
            {stats.unanswered} question{stats.unanswered === 1 ? "" : "s"}{" "}
            left blank — these will be marked as incorrect.
          </p>
        )}
        <div className="flex flex-wrap gap-2 mt-5 justify-end">
          <button onClick={onCancel} className="clay-btn-secondary text-sm">
            Keep going
          </button>
          <button onClick={onConfirm} className="clay-btn-primary text-sm">
            <Send size={14} /> Submit now
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* -------------------- Results screen -------------------- */

function Results({
  quiz,
  questions,
  answers,
  score,
  onRetake,
}: {
  quiz: QuizDefinition;
  questions: QuizQuestion[];
  answers: (number | null)[];
  score: { correct: number; wrong: number; blank: number; total: number; pct: number };
  onRetake: () => void;
}) {
  const grade =
    score.pct >= 90
      ? "Outstanding"
      : score.pct >= 75
        ? "Great work"
        : score.pct >= 50
          ? "Solid effort"
          : "Keep practising";

  return (
    <div className="min-h-screen bg-clay-bg dark:bg-[#040d20]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between gap-3 mb-6">
          <Link
            href="/#learn"
            className="clay-btn-secondary text-xs flex items-center gap-1.5"
          >
            <Home size={14} /> Home
          </Link>
          <div className="text-xs text-clay-muted">
            Class {quiz.classId} · {quiz.title}
          </div>
        </div>

        <motion.div
          initial={{ scale: 0.94, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="clay p-6 sm:p-10 text-center"
        >
          <div className="inline-flex items-center gap-2 clay-sm px-3 py-1.5 text-xs font-semibold text-clay-accent mb-3">
            <Award size={14} /> {grade}
          </div>
          <h1 className="display text-4xl font-extrabold text-clay-ink dark:text-white">
            {score.correct}
            <span className="text-clay-muted">/{score.total}</span>
          </h1>
          <p className="text-clay-muted mt-1">
            {score.pct}% — {quiz.title}
          </p>

          <div className="grid sm:grid-cols-3 gap-3 max-w-md mx-auto mt-6">
            <ScoreTile
              icon={<CheckCircle2 size={16} />}
              label="Correct"
              value={score.correct}
              tone="emerald"
            />
            <ScoreTile
              icon={<XCircle size={16} />}
              label="Wrong"
              value={score.wrong}
              tone="red"
            />
            <ScoreTile
              icon={<Circle size={16} />}
              label="Skipped"
              value={score.blank}
              tone="muted"
            />
          </div>

          <div className="flex flex-wrap gap-2 justify-center mt-6">
            <button onClick={onRetake} className="clay-btn-primary text-sm">
              <RotateCcw size={14} /> Retake
            </button>
            <Link href="/#learn" className="clay-btn-secondary text-sm">
              <Home size={14} /> Back to Hub
            </Link>
          </div>
        </motion.div>

        {/* Review */}
        <div className="mt-8 space-y-4">
          <h2 className="display font-extrabold text-clay-ink dark:text-white text-xl">
            Review
          </h2>
          {questions.map((qn, i) => {
            const userAns = answers[i];
            const isRight = userAns === qn.correct;
            return (
              <div
                key={qn.id}
                className={`clay p-4 sm:p-5 border-l-4 ${
                  userAns === null
                    ? "border-clay-muted"
                    : isRight
                      ? "border-emerald-500"
                      : "border-red-500"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-xs font-bold text-clay-muted w-8 flex-shrink-0">
                    Q{i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-clay-ink dark:text-white">
                      {qn.text}
                    </div>
                    <div className="mt-2 grid gap-1.5 text-sm">
                      {qn.options.map((opt, oi) => {
                        const isCorrect = oi === qn.correct;
                        const isUserPick = oi === userAns;
                        return (
                          <div
                            key={oi}
                            className={`px-3 py-2 rounded-xl flex items-center gap-2 ${
                              isCorrect
                                ? "bg-emerald-100 text-emerald-900"
                                : isUserPick
                                  ? "bg-red-100 text-red-900"
                                  : "bg-clay-soft/40 text-clay-muted"
                            }`}
                          >
                            <span className="w-5 h-5 rounded-full bg-white/80 grid place-items-center text-[10px] font-bold flex-shrink-0">
                              {String.fromCharCode(65 + oi)}
                            </span>
                            <span className="flex-1">{opt}</span>
                            {isCorrect && (
                              <CheckCircle2
                                size={14}
                                className="text-emerald-700"
                              />
                            )}
                            {!isCorrect && isUserPick && (
                              <XCircle size={14} className="text-red-700" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {userAns === null && (
                      <div className="text-xs text-clay-muted mt-2 italic">
                        Skipped
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ScoreTile({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: "emerald" | "red" | "muted";
}) {
  const cls =
    tone === "emerald"
      ? "from-emerald-100 to-emerald-200 text-emerald-700"
      : tone === "red"
        ? "from-red-100 to-red-200 text-red-700"
        : "from-clay-soft/60 to-clay-soft text-clay-muted";
  return (
    <div className="clay-sm px-3 py-3 flex items-center gap-3">
      <div
        className={`w-9 h-9 rounded-xl bg-gradient-to-br grid place-items-center ${cls}`}
      >
        {icon}
      </div>
      <div className="text-left">
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
