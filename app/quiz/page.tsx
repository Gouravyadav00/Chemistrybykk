import type { Metadata } from "next";
import { Brain, ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { classes } from "@/data/chapters";
import { QUIZZES } from "@/data/quizzes";

export const metadata: Metadata = {
  title: "Chemistry Quizzes — Chapter-wise MCQ Tests for Class 9–12",
  description:
    "Free chapter-wise chemistry MCQ tests for Class 9, 10, 11 and 12. Attempt 20 random questions in 10 minutes and get your score instantly — NCERT aligned, board-exam focused.",
  alternates: { canonical: "/quiz" },
};

export default function QuizIndexPage() {
  return (
    <div className="min-h-screen bg-clay-bg dark:bg-[#040d20]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/#learn"
            className="clay-btn-secondary text-xs flex items-center gap-1.5"
          >
            <Home size={14} /> Home
          </Link>
          <div className="text-xs text-clay-muted">
            Chapter-wise MCQ Tests · Class 9–12
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 clay-sm px-4 py-2 mb-4 text-sm text-clay-accent font-semibold">
            <Brain size={14} /> Quizzes
          </div>
          <h1 className="display text-3xl sm:text-4xl font-extrabold text-clay-ink dark:text-white">
            Pick your class. <span className="text-clay-accent">Test</span>{" "}
            yourself.
          </h1>
          <p className="mt-3 text-clay-muted">
            Every test serves 20 random MCQs from a 50-question chapter bank
            with a 10-minute timer — so each attempt feels fresh. Your last
            score is saved when you are signed in.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {classes.map((c) => {
            const live = QUIZZES.filter(
              (q) => q.classId === c.classId,
            ).length;
            return (
              <Link
                key={c.classId}
                href={`/quiz/${c.classId}`}
                className="clay p-6 group hover:-translate-y-1 transition-transform"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl grid place-items-center shadow-clay-sm bg-gradient-to-br from-rose-100 to-rose-300 text-rose-700">
                    <Brain size={20} />
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                      live > 0
                        ? "bg-rose-100 text-rose-700"
                        : "bg-orange-100 text-orange-600"
                    }`}
                  >
                    {live > 0
                      ? `${live} live quiz${live > 1 ? "zes" : ""}`
                      : "Coming soon"}
                  </span>
                </div>
                <h2 className="display text-xl font-extrabold text-clay-ink dark:text-white">
                  {c.label}
                </h2>
                <p className="mt-1 text-sm text-clay-muted">{c.subtitle}</p>
                <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-clay-accent group-hover:text-clay-accentDeep">
                  View chapter quizzes{" "}
                  <ChevronRight
                    size={16}
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                </div>
              </Link>
            );
          })}
        </div>

        <p className="mt-10 text-center text-sm text-clay-muted">
          Want to revise first? Grab the free{" "}
          <Link
            href="/#learn"
            className="font-semibold text-clay-accent hover:text-clay-accentDeep"
          >
            chapter notes &amp; cheatsheets
          </Link>{" "}
          before you take a test.
        </p>
      </main>
    </div>
  );
}
