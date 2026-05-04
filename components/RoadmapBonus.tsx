"use client";

import { motion } from "framer-motion";
import { Download, Eye, Gift, Map } from "lucide-react";
import { useState } from "react";

const roadmaps = [
  { classId: "9", file: "/images/Class 9th Roadmap Cheatsheet.png", label: "Class 9" },
  { classId: "10", file: "/images/Class 10th Roadmap Cheatsheet.png", label: "Class 10" },
  { classId: "11", file: "/images/Class 11th Roadmap Cheatsheet.png", label: "Class 11" },
  { classId: "12", file: "/images/Class 12th Roadmap Cheatsheet.png", label: "Class 12" },
];

export default function RoadmapBonus({
  preferredClass,
}: {
  preferredClass?: string;
}) {
  const initial =
    roadmaps.find((r) => r.classId === preferredClass)?.classId ?? "12";
  const [active, setActive] = useState(initial);
  const [open, setOpen] = useState(false);

  const current = roadmaps.find((r) => r.classId === active) ?? roadmaps[3];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="clay-sm p-5 text-left"
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-200 to-orange-300 grid place-items-center text-orange-700 shadow-clay-sm flex-shrink-0">
          <Gift size={18} />
        </div>
        <div className="min-w-0">
          <h3 className="display font-extrabold text-clay-ink dark:text-white">
            Welcome bonus: Your Class Roadmap
          </h3>
          <p className="text-xs text-clay-muted mt-1">
            A step-by-step cheatsheet to help you finish the syllabus in the
            right order. Choose your class to get started.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {roadmaps.map((r) => (
          <button
            key={r.classId}
            onClick={() => setActive(r.classId)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
              active === r.classId
                ? "clay-btn-primary"
                : "clay-btn-secondary text-clay-ink dark:text-white"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden bg-white/70 dark:bg-white/5 shadow-clay-inset p-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current.file}
          alt={`${current.label} roadmap`}
          className="w-full h-auto rounded-xl object-contain max-h-[420px]"
          onClick={() => setOpen(true)}
          style={{ cursor: "zoom-in" }}
        />
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        <button
          onClick={() => setOpen(true)}
          className="clay-btn-secondary text-xs"
        >
          <Eye size={12} /> View full size
        </button>
        <a
          href={current.file}
          download={`${current.label} Roadmap.png`}
          className="clay-btn-primary text-xs"
        >
          <Download size={12} /> Download
        </a>
        <a href="/#learn" className="clay-btn-secondary text-xs">
          <Map size={12} /> Browse notes
        </a>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black/80 grid place-items-center p-4 cursor-zoom-out"
          onClick={() => setOpen(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current.file}
            alt={`${current.label} roadmap`}
            className="max-w-full max-h-full object-contain rounded-xl"
            onClick={(e) => e.stopPropagation()}
          />
        </motion.div>
      )}
    </motion.div>
  );
}
