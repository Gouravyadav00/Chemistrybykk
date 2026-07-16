"use client";

import { motion } from "framer-motion";
import { BookOpen, Brain, Play, Youtube } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  lectures,
  shorts,
  SUBSCRIBE_URL,
  thumbUrl,
  watchUrl,
  type SiteVideo,
} from "@/data/videos";
import { hasQuiz } from "@/data/quizzes";
import { classes } from "@/data/chapters";

export default function VideoLectures() {
  return (
    <section id="videos" className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 clay-sm px-4 py-2 mb-4 text-sm text-clay-accent font-semibold">
          <Youtube size={14} /> Video Classes
        </div>
        <h2 className="display text-3xl sm:text-4xl font-extrabold text-clay-ink dark:text-white">
          Full chapters, taught <span className="text-clay-accent">free</span>{" "}
          on YouTube
        </h2>
        <p className="mt-3 text-clay-muted">
          Watch the complete chapter in one shot, then grab the notes and test
          yourself with the chapter quiz — everything stays in sync with the
          Learning Hub.
        </p>
      </div>

      <div className="space-y-6">
        {lectures.map((v) => (
          <LectureCard key={v.id} video={v} />
        ))}
      </div>

      {shorts.length > 0 && (
        <div className="mt-10">
          <h3 className="display text-xl font-extrabold text-clay-ink dark:text-white text-center mb-5">
            Quick <span className="text-clay-accent">Shorts</span> — chemistry
            in under a minute
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            {shorts.map((v) => (
              <ShortCard key={v.id} video={v} />
            ))}
          </div>
        </div>
      )}

      <div className="mt-10 text-center">
        <a
          href={SUBSCRIBE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-white bg-gradient-to-br from-red-500 to-rose-600 shadow-clay-sm hover:scale-[1.03] transition-transform"
        >
          <Youtube size={18} /> Subscribe — new chapters every week
        </a>
      </div>
    </section>
  );
}

function LectureCard({ video }: { video: SiteVideo }) {
  const [playing, setPlaying] = useState(false);
  const cls = video.classId
    ? classes.find((c) => c.classId === video.classId)
    : undefined;
  const quizReady =
    video.classId && video.chapterSlug
      ? hasQuiz(video.classId, video.chapterSlug)
      : false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6 }}
      className="clay p-3 sm:p-4 max-w-3xl mx-auto"
    >
      <div className="relative aspect-video rounded-2xl overflow-hidden clay-inset">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Play: ${video.title}`}
            className="group absolute inset-0 w-full h-full"
          >
            <Image
              src={thumbUrl(video.id)}
              alt={video.title}
              fill
              sizes="(max-width: 768px) 95vw, 720px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/15 group-hover:bg-black/25 transition-colors" />
            <div className="absolute inset-0 grid place-items-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/95 grid place-items-center shadow-xl group-hover:scale-110 transition-transform">
                <Play
                  size={28}
                  className="text-clay-accent fill-clay-accent translate-x-0.5"
                />
              </div>
            </div>
          </button>
        )}
      </div>

      <div className="mt-3 px-1 sm:px-2">
        <p className="text-center text-sm font-semibold text-clay-ink dark:text-white">
          {video.title}
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 pb-1">
          {cls && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-clay-accentDeep">
              {cls.label}
            </span>
          )}
          {video.classId && video.chapterSlug && (
            <a
              href={`/?class=${video.classId}&chapter=${video.chapterSlug}`}
              className="clay-sm px-3 py-1.5 rounded-xl text-xs font-semibold text-clay-accentDeep hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors flex items-center gap-1.5"
            >
              <BookOpen size={12} /> Chapter Notes
            </a>
          )}
          {quizReady && video.classId && video.chapterSlug && (
            <Link
              href={`/quiz/${video.classId}/${video.chapterSlug}`}
              className="clay-sm px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors flex items-center gap-1.5"
            >
              <Brain size={12} /> Take the Quiz
            </Link>
          )}
          <a
            href={watchUrl(video)}
            target="_blank"
            rel="noopener noreferrer"
            className="clay-sm px-3 py-1.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center gap-1.5"
          >
            <Youtube size={12} /> Watch on YouTube
          </a>
        </div>
      </div>
    </motion.div>
  );
}

function ShortCard({ video }: { video: SiteVideo }) {
  const [playing, setPlaying] = useState(false);
  // Shorts get a portrait thumbnail (oar2); fall back to the standard one.
  const [thumb, setThumb] = useState(thumbUrl(video.id, "oar2"));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5 }}
      className="clay p-2.5 w-[180px] sm:w-[210px]"
    >
      <div className="relative aspect-[9/16] rounded-2xl overflow-hidden clay-inset">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Play: ${video.title}`}
            className="group absolute inset-0 w-full h-full"
          >
            <Image
              src={thumb}
              alt={video.title}
              fill
              sizes="210px"
              className="object-cover"
              onError={() => setThumb(thumbUrl(video.id, "hqdefault"))}
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
            <div className="absolute inset-0 grid place-items-center">
              <div className="w-12 h-12 rounded-full bg-white/95 grid place-items-center shadow-xl group-hover:scale-110 transition-transform">
                <Play
                  size={20}
                  className="text-clay-accent fill-clay-accent translate-x-0.5"
                />
              </div>
            </div>
          </button>
        )}
      </div>
      <p className="mt-2 text-center text-xs font-semibold text-clay-ink dark:text-white leading-snug px-1">
        {video.title}
      </p>
    </motion.div>
  );
}
