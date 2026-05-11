import type { Metadata } from "next";
import { notFound } from "next/navigation";
import QuizRunner from "@/components/QuizRunner";
import { findClass } from "@/data/chapters";
import { findQuiz } from "@/data/quizzes";

type Params = { classId: string; chapterSlug: string };

export function generateMetadata({
  params,
}: {
  params: Params;
}): Metadata {
  const quiz = findQuiz(params.classId, params.chapterSlug);
  if (!quiz) return { title: "Quiz" };
  return {
    title: `${quiz.title} — Class ${quiz.classId} Quiz`,
    description: `Practice ${quiz.questionsPerAttempt} random MCQs in ${
      quiz.durationSec / 60
    } minutes on ${quiz.title} (Class ${quiz.classId} chemistry).`,
  };
}

export default function QuizPage({ params }: { params: Params }) {
  const quiz = findQuiz(params.classId, params.chapterSlug);
  if (!quiz) {
    // Verify chapter exists for a friendlier 404 path
    const cls = findClass(params.classId);
    const chapter = cls?.chapters.find((c) => c.slug === params.chapterSlug);
    if (!chapter) notFound();
    notFound();
  }
  return <QuizRunner quiz={quiz!} />;
}
