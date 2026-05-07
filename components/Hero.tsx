"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Youtube } from "lucide-react";
import Image from "next/image";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-16 md:pt-20 pb-10 sm:pb-12"
    >
      <div className="grid md:grid-cols-2 gap-8 sm:gap-10 items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 clay-sm px-4 py-2 mb-5 text-sm text-clay-accent font-semibold">
            <Sparkles size={14} /> NCERT · Class 9–12
          </div>
          <h1 className="display text-[2rem] sm:text-5xl md:text-6xl font-extrabold leading-[1.08] text-clay-ink dark:text-white">
            Chemistry{" "}
            <span className="text-clay-accent">Simplified</span>
            <br /> for Every Student
          </h1>
          <p className="mt-4 sm:mt-5 text-base sm:text-lg text-clay-muted max-w-lg">
            Chapter-wise notes, clear walkthroughs and exam-ready resources
            crafted by{" "}
            <span className="font-semibold text-clay-ink dark:text-white">
              Khyati Kaushik (M.Sc. Chemistry)
            </span>{" "}
            — designed to make Chemistry finally click.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#learn" className="clay-btn-primary">
              Explore Notes <ArrowRight size={18} />
            </a>
            <a
              href="https://www.youtube.com/@chemistrybykk"
              target="_blank"
              rel="noreferrer"
              className="clay-btn-secondary"
            >
              <Youtube size={18} className="text-red-500" /> Visit YouTube
            </a>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-3 max-w-md">
            <Stat label="Classes" value="9–12" />
            <Stat label="M.Sc. Score" value="94.2%" />
            <Stat label="Chapters" value="30+" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative"
        >
          <div className="relative aspect-square w-[88%] max-w-md mx-auto">
            {/* Floating clay shapes around the portrait */}
            <motion.div
              animate={{ y: [0, -16, 0] }}
              transition={{ duration: 6, repeat: Infinity }}
              className="absolute -top-4 -left-4 sm:-top-6 sm:-left-6 w-16 h-16 sm:w-24 sm:h-24 clay-blob cube"
            />
            <motion.div
              animate={{ y: [0, 14, 0] }}
              transition={{ duration: 7, repeat: Infinity }}
              className="absolute -bottom-3 -right-3 sm:-bottom-4 sm:-right-4 w-20 h-20 sm:w-28 sm:h-28 clay-blob alt"
            />
            <motion.div
              animate={{ y: [0, -10, 0], rotate: [0, 8, 0] }}
              transition={{ duration: 8, repeat: Infinity }}
              className="absolute top-1/3 -right-6 sm:-right-10 w-12 h-12 sm:w-16 sm:h-16 clay-blob pill"
            />

            {/* Main clay frame */}
            <div className="relative w-full h-full clay rounded-[40px] overflow-hidden bg-gradient-to-br from-clay-soft to-white dark:from-[#0a163a] dark:to-[#0f1d3f]">
              <Image
                src="/images/hero-clay-teacher.png"
                alt="Khyati Kaushik — Chemistry educator"
                fill
                priority
                sizes="(max-width: 768px) 90vw, 28rem"
                className="object-contain p-4"
              />
            </div>

            {/* small chip badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="absolute -bottom-4 left-3 sm:-bottom-6 sm:left-6 clay-sm px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-2 sm:gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-100 grid place-items-center">
                <Sparkles size={18} className="text-clay-accent" />
              </div>
              <div>
                <div className="text-xs text-clay-muted">Live Concepts</div>
                <div className="font-bold text-clay-ink dark:text-white text-sm">
                  Real-world Chemistry
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="clay-sm px-4 py-3 text-center">
      <div className="display font-extrabold text-xl text-clay-ink dark:text-white">
        {value}
      </div>
      <div className="text-xs text-clay-muted">{label}</div>
    </div>
  );
}
