"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Copy,
  Instagram,
  Linkedin,
  Sparkles,
  Youtube,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Logo from "@/components/Logo";

export default function SharePage() {
  const [copied, setCopied] = useState(false);
  const url =
    typeof window !== "undefined" ? window.location.origin : "https://chemistrybykk.vercel.app";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  return (
    <main className="min-h-screen px-4 sm:px-6 py-10 relative overflow-hidden">
      {/* floating clay shapes */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-10 -left-10 w-72 h-72 clay-blob alt opacity-70 animate-floatSlow" />
        <div className="absolute top-1/3 -right-16 w-96 h-96 clay-blob opacity-50 animate-float" />
        <div className="absolute bottom-0 left-1/4 w-60 h-60 clay-blob cube opacity-60 animate-floatSlow" />
      </div>

      <div className="max-w-5xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-3 text-sm text-clay-accent font-semibold mb-6 group"
        >
          <Logo size="md" />
          <span className="group-hover:underline">Back to Home</span>
        </Link>

        {/* Hero banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="clay overflow-hidden relative"
        >
          <div className="grid md:grid-cols-2">
            <div className="p-6 sm:p-10 md:p-12 flex flex-col justify-center order-2 md:order-1">
              <div className="inline-flex items-center gap-2 clay-sm px-3 py-1.5 mb-4 self-start text-[11px] sm:text-xs text-clay-accent font-bold uppercase tracking-wide">
                <Sparkles size={12} /> New Learning Hub
              </div>
              <h1 className="display text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight text-clay-ink dark:text-white">
                Free Chemistry Notes <br />
                <span className="text-clay-accent">Class 9 → 12</span>
              </h1>
              <p className="mt-4 text-clay-muted text-lg">
                The official student hub for{" "}
                <span className="font-semibold text-clay-ink dark:text-white">
                  ChemistryByKK
                </span>{" "}
                — chapter-wise PDFs, board-ready notes, and structured concept
                clarity by Khyati Kaushik (M.Sc. Chemistry, 94.2%).
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/#learn" className="clay-btn-primary">
                  Start Learning <ArrowRight size={16} />
                </Link>
                <button onClick={copyLink} className="clay-btn-secondary">
                  <Copy size={16} /> {copied ? "Copied!" : "Copy Site Link"}
                </button>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3 max-w-sm">
                <Mini value="4" label="Classes" />
                <Mini value="30+" label="Chapters" />
                <Mini value="100%" label="Free" />
              </div>
            </div>

            <div className="relative bg-gradient-to-br from-clay-soft via-white to-clay-lilac dark:from-[#0a163a] dark:to-[#0f1d3f] aspect-[16/9] md:aspect-auto md:min-h-[420px] order-1 md:order-2">
              <Image
                src="/images/banner-1.png"
                alt="Chemistry by KK banner"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain p-6"
              />
              {/* floating chips */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute top-6 right-6 clay-sm px-3 py-2 text-xs font-semibold text-clay-accent flex items-center gap-2"
              >
                <BookOpen size={14} /> NCERT · Class 9–12
              </motion.div>
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="absolute bottom-6 left-6 clay-sm px-3 py-2 text-xs font-semibold text-clay-accent flex items-center gap-2"
              >
                <Sparkles size={14} /> Notes + Walkthroughs
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* social row */}
        <div className="grid sm:grid-cols-3 gap-4 mt-6">
          <ShareTile
            href="https://www.youtube.com/@KhyatiKaushik-p4c"
            icon={Youtube}
            label="YouTube"
            sub="Live concept walkthroughs"
            grad="from-red-400 to-red-600"
          />
          <ShareTile
            href="https://www.instagram.com/chemistrybykk/"
            icon={Instagram}
            label="Instagram"
            sub="Daily revision reels"
            grad="from-pink-400 to-fuchsia-600"
          />
          <ShareTile
            href="https://www.linkedin.com/in/khyati-kaushik-8849bb205/"
            icon={Linkedin}
            label="LinkedIn"
            sub="Connect with Khyati"
            grad="from-sky-500 to-blue-700"
          />
        </div>

        {/* second banner alt */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="clay mt-8 p-2 overflow-hidden"
        >
          <div className="relative aspect-[3/2] rounded-[22px] overflow-hidden bg-gradient-to-br from-clay-soft via-white to-clay-lilac dark:from-[#0a163a] dark:to-[#0f1d3f]">
            <Image
              src="/images/banner-2.png"
              alt="ChemistryByKK secondary banner"
              fill
              sizes="(max-width: 1024px) 100vw, 64rem"
              className="object-contain"
            />
          </div>
        </motion.div>

        <p className="text-center text-xs text-clay-muted mt-8">
          Share this page from your YouTube description — it's the home for
          every chapter, note and update.
        </p>
      </div>
    </main>
  );
}

function Mini({ value, label }: { value: string; label: string }) {
  return (
    <div className="clay-sm px-3 py-2.5 text-center">
      <div className="display font-extrabold text-lg text-clay-ink dark:text-white">
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-wide text-clay-muted">
        {label}
      </div>
    </div>
  );
}

function ShareTile({
  href,
  icon: Icon,
  label,
  sub,
  grad,
}: {
  href: string;
  icon: typeof Youtube;
  label: string;
  sub: string;
  grad: string;
}) {
  return (
    <motion.a
      whileHover={{ y: -4 }}
      href={href}
      target="_blank"
      rel="noreferrer"
      className="clay p-5 flex items-center gap-3"
    >
      <div
        className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${grad} grid place-items-center text-white shadow-clay-sm`}
      >
        <Icon size={20} />
      </div>
      <div>
        <div className="display font-bold text-clay-ink dark:text-white">
          {label}
        </div>
        <div className="text-xs text-clay-muted">{sub}</div>
      </div>
    </motion.a>
  );
}
