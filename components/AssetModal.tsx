"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Download, ExternalLink, FileText, Sparkles, X, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import {
  defaultCheatsheetPath,
  defaultNotesPath,
  isImageSrc,
  type AssetKind,
  type Chapter,
} from "@/data/chapters";

export default function AssetModal({
  chapter,
  classId,
  kind,
  onClose,
}: {
  chapter: Chapter | null;
  classId: string;
  kind: AssetKind;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (chapter) {
      setLoading(true);
      const t = setTimeout(() => setLoading(false), 600);
      return () => clearTimeout(t);
    }
  }, [chapter]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!chapter) return null;

  const isCheatsheet = kind === "cheatsheet";
  const available = isCheatsheet
    ? chapter.cheatsheetAvailable
    : chapter.notesAvailable;
  const src =
    (isCheatsheet ? chapter.cheatsheet : chapter.file) ??
    (isCheatsheet
      ? defaultCheatsheetPath(classId, chapter.slug)
      : defaultNotesPath(classId, chapter.slug));

  const isImage = available && isImageSrc(src);
  const downloadName = `${chapter.slug}${isCheatsheet ? "-cheatsheet" : ""}${
    isImage ? src.match(/\.(png|jpe?g|webp|gif|avif)$/i)?.[0] ?? ".png" : ".pdf"
  }`;

  const Icon = isCheatsheet ? Zap : FileText;
  const label = isCheatsheet ? "Cheatsheet" : "Notes";

  return (
    <AnimatePresence>
      {chapter && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-clay-ink/40 dark:bg-black/60 backdrop-blur-sm grid place-items-center p-2 sm:p-6 overflow-y-auto"
          onClick={onClose}
          aria-label="Click outside to close"
        >
          <motion.div
            initial={{ scale: 0.92, y: 20, rotateY: -8 }}
            animate={{ scale: 1, y: 0, rotateY: 0 }}
            exit={{ scale: 0.92, y: 20, rotateY: -8 }}
            transition={{ type: "spring", damping: 22, stiffness: 220 }}
            className="notebook clay relative w-full max-w-5xl h-[92vh] sm:h-[88vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* notebook spine */}
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-blue-300 to-blue-700 rounded-l-clay" />
            <div className="absolute left-2 top-0 bottom-0 w-1 bg-white/60" />

            {/* header */}
            <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 p-3 sm:p-6 pl-5 sm:pl-8 border-b border-clay-soft/60 dark:border-white/5">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div
                  className={`w-9 h-9 sm:w-11 sm:h-11 rounded-2xl grid place-items-center shadow-clay-sm flex-shrink-0 ${
                    isCheatsheet
                      ? "bg-gradient-to-br from-amber-100 to-orange-200 text-orange-600"
                      : "bg-gradient-to-br from-blue-100 to-blue-300 text-clay-accentDeep"
                  }`}
                >
                  <Icon size={16} />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] sm:text-xs text-clay-muted">
                    Class {classId} · {label}
                  </div>
                  <div className="display font-bold text-sm sm:text-base text-clay-ink dark:text-white truncate">
                    {chapter.name}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                {available && (
                  <>
                    <a
                      href={src}
                      target="_blank"
                      rel="noreferrer"
                      className="clay-sm w-9 h-9 sm:w-10 sm:h-10 grid place-items-center text-clay-accent"
                      aria-label="Open in new tab"
                    >
                      <ExternalLink size={14} />
                    </a>
                    <a
                      href={src}
                      download={downloadName}
                      className="clay-btn-primary text-xs sm:text-sm py-2 sm:py-2.5 px-3 sm:px-4"
                    >
                      <Download size={14} />
                      <span className="hidden xs:inline sm:inline">Download</span>
                    </a>
                  </>
                )}
                <button
                  onClick={onClose}
                  className="clay-sm w-9 h-9 sm:w-10 sm:h-10 grid place-items-center"
                  aria-label="Close"
                  title="Close (Esc)"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="hidden sm:block absolute bottom-3 left-1/2 -translate-x-1/2 text-clay-muted text-[10px] font-medium px-3 py-1 rounded-full bg-white/80 dark:bg-black/40 pointer-events-none">
              Press Esc or click outside to close
            </div>

            {/* body */}
            <div className="flex-1 p-2 sm:p-5 overflow-hidden min-h-0">
              {available ? (
                <div className="relative h-full clay-inset rounded-2xl overflow-hidden">
                  {loading && (
                    <div className="absolute inset-0 grid place-items-center">
                      <div className="skeleton w-3/4 h-3/4 rounded-2xl" />
                    </div>
                  )}
                  {isImage ? (
                    <div className="w-full h-full overflow-auto grid place-items-center bg-white dark:bg-[#0a163a]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt={`${chapter.name} ${label}`}
                        className="max-w-full max-h-full object-contain"
                        onLoad={() => setLoading(false)}
                      />
                    </div>
                  ) : (
                    <iframe
                      src={src}
                      title={`${chapter.name} ${label}`}
                      className="w-full h-full"
                      onLoad={() => setLoading(false)}
                    />
                  )}
                </div>
              ) : (
                <ComingSoon name={chapter.name} kind={kind} />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ComingSoon({ name, kind }: { name: string; kind: AssetKind }) {
  const isCheatsheet = kind === "cheatsheet";
  return (
    <div className="h-full grid place-items-center text-center px-6">
      <div>
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="w-32 h-32 mx-auto clay-blob mb-6 grid place-items-center text-white"
        >
          {isCheatsheet ? <Sparkles size={36} /> : <FileText size={36} />}
        </motion.div>
        <h3 className="display text-2xl font-extrabold text-clay-ink dark:text-white">
          Coming Soon
        </h3>
        <p className="mt-2 text-clay-muted max-w-md mx-auto">
          {isCheatsheet ? "Cheatsheet" : "Notes"} for{" "}
          <span className="font-semibold text-clay-ink dark:text-white">
            {name}
          </span>{" "}
          {isCheatsheet ? "is" : "are"} being prepared. Check back soon — or
          follow the YouTube channel for the live walkthrough.
        </p>
      </div>
    </div>
  );
}
