import type { Metadata } from "next";
import { ArrowLeft, BookOpen, Brain, Clock, Play } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { classes, findClass } from "@/data/chapters";
import { findQuiz } from "@/data/quizzes";

type Params = { classId: string };

export function generateStaticParams() {
  return classes.map((c) => ({ classId: c.classId }));
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const cls = findClass(params.classId);
  if (!cls) return { title: "Quizzes" };
  return {
    title: `Class ${cls.classId} Chemistry Quizzes — Chapter-wise MCQ Tests`,
    description: `Free chapter-wise chemistry MCQ tests for Class ${cls.classId} — 20 random NCERT-based questions in 10 minutes with instant score. ${cls.chapters.map((c) => c.name.replace(/\s*\n\s*/g, " ")).slice(0, 4).join(", ")} and more.`,
    alternates: { canonical: `/quiz/${cls.classId}` },
  };
}

export default function ClassQuizIndexPage({ params }: { params: Params }) {
  const cls = findClass(params.classId);
  if (!cls) notFound();

  const live = cls.chapters.filter((ch) => findQuiz(cls.classId, ch.slug));

  return (
    <div className="min-h-screen bg-clay-bg dark:bg-[#040d20]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/quiz"
            className="clay-btn-secondary text-xs flex items-center gap-1.5"
          >
            <ArrowLeft size={14} /> All Classes
          </Link>
          <div className="text-xs text-clay-muted">
            {cls.label} · {live.length} live ·{" "}
            {cls.chapters.length - live.length} coming soon
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 clay-sm px-4 py-2 mb-4 text-sm text-clay-accent font-semibold">
            <Brain size={14} /> {cls.label} Quizzes
          </div>
          <h1 className="display text-3xl sm:text-4xl font-extrabold text-clay-ink dark:text-white">
            {cls.label} <span className="text-clay-accent">Chemistry</span>{" "}
            chapter tests
          </h1>
          <p className="mt-3 text-clay-muted">
            20 random MCQs per attempt, 10-minute timer, instant score. Revise
            with the{" "}
            <Link
              href={`/?class=${cls.classId}`}
              className="font-semibold text-clay-accent hover:text-clay-accentDeep"
            >
              {cls.label} notes
            </Link>{" "}
            first, then test yourself.
          </p>
        </div>

        {/* other classes switcher */}
        <div className="flex justify-center gap-2 mb-8 flex-wrap">
          {classes.map((c) =>
            c.classId === cls.classId ? (
              <span
                key={c.classId}
                className="px-4 py-2 rounded-2xl font-semibold text-sm clay-btn-primary pointer-events-none"
              >
                {c.label}
              </span>
            ) : (
              <Link
                key={c.classId}
                href={`/quiz/${c.classId}`}
                className="px-4 py-2 rounded-2xl font-semibold text-sm clay-btn-secondary text-clay-ink dark:text-white"
              >
                {c.label}
              </Link>
            ),
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {cls.chapters.map((ch) => {
            const quiz = findQuiz(cls.classId, ch.slug);
            return (
              <div key={ch.slug} className="clay p-5 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-11 h-11 rounded-2xl grid place-items-center shadow-clay-sm bg-gradient-to-br from-rose-100 to-rose-300 text-rose-700">
                    <Brain size={18} />
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                      quiz
                        ? "bg-rose-100 text-rose-700"
                        : "bg-orange-100 text-orange-600"
                    }`}
                  >
                    {quiz ? "Live" : "Soon"}
                  </span>
                </div>
                <h2 className="display font-bold text-clay-ink dark:text-white leading-snug whitespace-pre-line mb-2">
                  {ch.name}
                </h2>
                {quiz ? (
                  <div className="text-xs text-clay-muted flex items-center gap-3 mb-4">
                    <span className="flex items-center gap-1">
                      <Brain size={12} /> {quiz.questionsPerAttempt} MCQs
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> {quiz.durationSec / 60} min
                    </span>
                  </div>
                ) : (
                  <div className="text-xs text-clay-muted mb-4">
                    Quiz is being prepared for this chapter.
                  </div>
                )}
                <div className="mt-auto">
                  {quiz ? (
                    <Link
                      href={`/quiz/${cls.classId}/${ch.slug}`}
                      className="clay-btn-primary text-sm w-full justify-center"
                    >
                      <Play size={14} /> Give Test
                    </Link>
                  ) : (
                    <span className="clay-btn-secondary text-sm w-full justify-center opacity-50 cursor-not-allowed select-none">
                      Coming soon
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-10 text-center text-sm text-clay-muted">
          <BookOpen size={14} className="inline -mt-0.5 mr-1" />
          Notes, cheatsheets and question banks for every chapter are free in
          the{" "}
          <Link
            href={`/?class=${cls.classId}`}
            className="font-semibold text-clay-accent hover:text-clay-accentDeep"
          >
            Learning Hub
          </Link>
          .
        </p>
      </main>
    </div>
  );
}
