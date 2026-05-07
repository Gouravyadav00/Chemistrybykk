"use client";

import { motion } from "framer-motion";
import {
  Atom,
  Award,
  BookOpen,
  FlaskConical,
  GraduationCap,
  Microscope,
  Target,
} from "lucide-react";
import Image from "next/image";

const philosophy = [
  {
    icon: Atom,
    title: "Concepts before formulas",
    body:
      "Every topic starts with the why — real-world analogies, then the equation. Chemistry should feel intuitive, not memorised.",
  },
  {
    icon: Target,
    title: "Board-ready",
    body:
      "Chapter-wise tests, focused revision and sample-paper practice keep students one step ahead of the board pattern.",
  },
  {
    icon: Microscope,
    title: "Research-backed teaching",
    body:
      "Lab work in nanocomposite synthesis & photocatalysis flows back into the classroom as practical, real examples.",
  },
];

const credentials = [
  {
    icon: GraduationCap,
    label: "M.Sc. Chemistry — 94.2%",
    sub: "Amity University Haryana · 2023–2025",
  },
  {
    icon: BookOpen,
    label: "PGT Chemistry",
    sub: "RDS School, Dharuhera",
  },
  {
    icon: FlaskConical,
    label: "Foundation Faculty",
    sub: "Gradient Institute",
  },
  {
    icon: Award,
    label: "Research Intern",
    sub: "Nanocomposite synthesis & photocatalysis",
  },
];

export default function About() {
  return (
    <section id="about" className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 clay-sm px-4 py-2 mb-4 text-sm text-clay-accent font-semibold">
            <BookOpen size={14} /> About the Teacher
          </div>
          <h2 className="display text-3xl sm:text-4xl font-extrabold text-clay-ink dark:text-white">
            Meet <span className="text-clay-accent">Khyati Kaushik</span>
          </h2>
          <p className="mt-4 text-clay-muted">
            A dedicated Chemistry educator with hands-on Class 9–12
            teaching experience and a strong academic foundation. Skilled in
            simplifying Organic, Inorganic and Physical Chemistry to lift
            comprehension and board scores.
          </p>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* portrait + quick stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-2 clay p-6"
        >
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden clay-inset">
            <Image
              src="/images/about-teaching.png"
              alt="Khyati Kaushik teaching"
              fill
              sizes="(max-width: 1024px) 90vw, 40vw"
              className="object-cover"
            />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Mini label="Experience" value="9 mo+" />
            <Mini label="Subjects" value="Chemistry" />
            <Mini label="Curriculum" value="NCERT" />
            <Mini label="Based in" value="Bhiwadi, RJ" />
          </div>
        </motion.div>

        {/* philosophy + credentials */}
        <div className="lg:col-span-3 grid gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="clay p-6"
          >
            <h3 className="display font-bold text-xl text-clay-ink dark:text-white mb-4">
              Teaching Philosophy
            </h3>
            <div className="grid sm:grid-cols-3 gap-4">
              {philosophy.map((p) => (
                <div key={p.title} className="clay-sm p-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 grid place-items-center text-clay-accent mb-3">
                    <p.icon size={18} />
                  </div>
                  <div className="font-semibold text-clay-ink dark:text-white text-sm">
                    {p.title}
                  </div>
                  <p className="text-xs text-clay-muted mt-1 leading-relaxed">
                    {p.body}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="clay p-6"
          >
            <h3 className="display font-bold text-xl text-clay-ink dark:text-white mb-4">
              Experience & Qualifications
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {credentials.map((c) => (
                <div key={c.label} className="clay-sm p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 grid place-items-center text-clay-accent flex-shrink-0">
                    <c.icon size={18} />
                  </div>
                  <div>
                    <div className="font-semibold text-clay-ink dark:text-white text-sm">
                      {c.label}
                    </div>
                    <div className="text-xs text-clay-muted">{c.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="clay-sm px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-wide text-clay-muted">
        {label}
      </div>
      <div className="font-semibold text-clay-ink dark:text-white text-sm">
        {value}
      </div>
    </div>
  );
}
