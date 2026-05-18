"use client";

import { motion } from "framer-motion";
import { Compass, Play } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const VIDEO_ID = "AERV3chVzpM";
const VIDEO_TITLE =
  "Introduction to Chemistry by K K | Complete Website Tour | By: Khyati Kaushik";

export default function WalkthroughVideo() {
  const [playing, setPlaying] = useState(false);

  return (
    <section
      id="walkthrough"
      className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-2"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-2xl mx-auto mb-6"
      >
        <div className="inline-flex items-center gap-2 clay-sm px-4 py-2 mb-4 text-sm text-clay-accent font-semibold">
          <Compass size={14} /> Start Here
        </div>
        <h2 className="display text-3xl sm:text-4xl font-extrabold text-clay-ink dark:text-white">
          Website <span className="text-clay-accent">Walkthrough</span>
        </h2>
        <p className="mt-3 text-clay-muted">
          A quick tour from Khyati — see exactly how to find notes, take quizzes
          and download resources before you dive in.
        </p>
      </motion.div>

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
              src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&rel=0`}
              title={VIDEO_TITLE}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          ) : (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              aria-label={`Play: ${VIDEO_TITLE}`}
              className="group absolute inset-0 w-full h-full"
            >
              <Image
                src={`https://i.ytimg.com/vi/${VIDEO_ID}/maxresdefault.jpg`}
                alt={VIDEO_TITLE}
                fill
                sizes="(max-width: 768px) 95vw, 720px"
                className="object-cover"
                priority={false}
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
        <p className="text-center text-sm text-clay-muted mt-3 px-2">
          {VIDEO_TITLE}
        </p>
      </motion.div>
    </section>
  );
}
