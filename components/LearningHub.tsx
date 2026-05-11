"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Brain,
  CheckCircle2,
  Circle,
  Clock,
  Download,
  Eye,
  FileText,
  Layers,
  Map,
  Play,
  ScrollText,
  Search,
  Sparkles,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  classes,
  defaultPathFor,
  getAssetAvailable,
  getAssetSrc,
  isImageSrc,
  type AssetKind,
  type Chapter,
} from "@/data/chapters";
import { hasQuiz, QUIZZES } from "@/data/quizzes";
import {
  fetchAssetMap,
  getRoadmap,
  resolveClass,
  type AssetMap,
} from "@/lib/notesStore";
import AssetModal from "./AssetModal";

type ResolvedClass = ReturnType<typeof resolveClass>;
type HubKind = AssetKind | "roadmap" | "quiz";

const isAssetTab = (k: HubKind): k is AssetKind =>
  k === "notes" || k === "cheatsheet" || k === "pastpaper";

export default function LearningHub() {
  const [activeId, setActiveId] = useState<string>("12");
  const [kind, setKind] = useState<HubKind>("notes");
  const [assets, setAssets] = useState<AssetMap>({});
  const [resolved, setResolved] = useState<ResolvedClass | null>(null);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState<{ chapter: Chapter; kind: AssetKind } | null>(
    null,
  );
  const [zoomRoadmap, setZoomRoadmap] = useState(false);

  useEffect(() => {
    fetchAssetMap().then(setAssets);
  }, []);

  useEffect(() => {
    setResolved(resolveClass(activeId, assets));
    setSelected(new Set());
  }, [activeId, assets]);

  useEffect(() => {
    setSelected(new Set());
  }, [kind]);

  useEffect(() => {
    if (!zoomRoadmap) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoomRoadmap(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomRoadmap]);

  const chapters = useMemo(() => {
    if (!resolved) return [];
    if (!search.trim()) return resolved.chapters;
    const q = search.toLowerCase();
    return resolved.chapters.filter((c) => c.name.toLowerCase().includes(q));
  }, [resolved, search]);

  const chapterKind: AssetKind = isAssetTab(kind) ? kind : "notes";
  const allAvailable = resolved?.chapters.every((c) =>
    getAssetAvailable(c, chapterKind),
  );

  const toggleSelect = (slug: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const suffixFor = (k: AssetKind) =>
    k === "cheatsheet" ? "-cheatsheet" : k === "pastpaper" ? "-pastpaper" : "";

  const downloadOne = (ch: Chapter) => {
    const src =
      getAssetSrc(ch, chapterKind) ?? defaultPathFor(chapterKind, activeId, ch.slug);
    const ext = isImageSrc(src)
      ? src.match(/\.(png|jpe?g|webp|gif|avif)$/i)?.[0] ?? ".png"
      : ".pdf";
    const a = document.createElement("a");
    a.href = src;
    a.download = `${ch.slug}${suffixFor(chapterKind)}${ext}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const downloadSelected = () => {
    if (!resolved) return;
    resolved.chapters
      .filter((c) => selected.has(c.slug) && getAssetAvailable(c, chapterKind))
      .forEach((c, i) => setTimeout(() => downloadOne(c), i * 250));
  };

  const downloadBundle = () => {
    if (!resolved) return;
    resolved.chapters
      .filter((c) => getAssetAvailable(c, chapterKind))
      .forEach((c, i) => setTimeout(() => downloadOne(c), i * 250));
  };

  return (
    <section id="learn" className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 clay-sm px-4 py-2 mb-4 text-sm text-clay-accent font-semibold">
          <Layers size={14} /> Learning Hub
        </div>
        <h2 className="display text-3xl sm:text-4xl font-extrabold text-clay-ink dark:text-white">
          Pick a class. Open a chapter.
        </h2>
        <p className="mt-3 text-clay-muted">
          Tap any chapter to read inline, switch to <b>Cheatsheets</b> for a
          quick revision sheet, or grab the full class bundle.
        </p>
      </div>

      {/* class tabs */}
      <div className="flex justify-start sm:justify-center gap-2 sm:gap-3 mb-6 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1 snap-x snap-mandatory">
        {classes.map((c) => {
          const active = c.classId === activeId;
          return (
            <button
              key={c.classId}
              onClick={() => setActiveId(c.classId)}
              className={`snap-start flex-shrink-0 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl font-semibold text-sm sm:text-base transition-all min-h-[44px] ${
                active
                  ? "clay-btn-primary"
                  : "clay-btn-secondary text-clay-ink dark:text-white"
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* notes / cheatsheet / pastpaper / roadmap / quiz switch */}
      <div className="flex justify-center mb-6">
        <div className="clay-inset p-1.5 inline-flex items-center gap-1 rounded-2xl flex-wrap">
          <SwitchTab
            active={kind === "notes"}
            onClick={() => setKind("notes")}
            icon={<FileText size={14} />}
            label="Notes"
          />
          <SwitchTab
            active={kind === "cheatsheet"}
            onClick={() => setKind("cheatsheet")}
            icon={<Zap size={14} />}
            label="Cheatsheets"
            tone="warm"
          />
          <SwitchTab
            active={kind === "pastpaper"}
            onClick={() => setKind("pastpaper")}
            icon={<ScrollText size={14} />}
            label="Past Papers"
            tone="violet"
          />
          <SwitchTab
            active={kind === "roadmap"}
            onClick={() => setKind("roadmap")}
            icon={<Map size={14} />}
            label="Roadmaps"
            tone="emerald"
          />
          <SwitchTab
            active={kind === "quiz"}
            onClick={() => setKind("quiz")}
            icon={<Brain size={14} />}
            label="Quizzes"
            tone="rose"
          />
        </div>
      </div>

      {kind === "roadmap" ? (
        <RoadmapView
          classId={activeId}
          assets={assets}
          onZoom={() => setZoomRoadmap(true)}
        />
      ) : kind === "quiz" ? (
        <QuizView classId={activeId} chapters={chapters} search={search} setSearch={setSearch} />
      ) : (
      <>
      {/* search + actions */}
      <div className="clay p-4 sm:p-5 mb-6 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="clay-inset flex items-center gap-2 px-4 py-3 flex-1 md:max-w-md">
          <Search size={16} className="text-clay-muted flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search chapters…`}
            className="bg-transparent outline-none text-sm w-full text-clay-ink dark:text-white placeholder:text-clay-muted min-w-0"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={downloadSelected}
            disabled={selected.size === 0}
            className={`clay-btn-secondary text-xs sm:text-sm flex-1 md:flex-initial ${
              selected.size === 0 ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <Download size={16} />
            Selected ({selected.size})
          </button>
          <button
            onClick={downloadBundle}
            disabled={!allAvailable}
            className={`clay-btn-primary text-xs sm:text-sm flex-1 md:flex-initial ${
              !allAvailable ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <Sparkles size={16} />
            <span className="whitespace-nowrap">
              Full {chapterKind === "cheatsheet" ? "Cheatsheet" : "Notes"} Bundle
            </span>
          </button>
        </div>
      </div>

      {/* chapter grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeId + chapterKind + search}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {chapters.map((ch, i) => {
            const isSel = selected.has(ch.slug);
            const notesOk = ch.notesAvailable;
            const cheatOk = ch.cheatsheetAvailable;
            const pyqOk = ch.pastpaperAvailable;
            const activeAvail = getAssetAvailable(ch, chapterKind);
            const iconCls =
              chapterKind === "cheatsheet"
                ? "bg-gradient-to-br from-amber-100 to-orange-200 text-orange-600"
                : chapterKind === "pastpaper"
                  ? "bg-gradient-to-br from-violet-100 to-violet-300 text-violet-700"
                  : "bg-gradient-to-br from-blue-100 to-blue-300 text-clay-accentDeep";
            const ActiveIcon =
              chapterKind === "cheatsheet"
                ? Zap
                : chapterKind === "pastpaper"
                  ? ScrollText
                  : BookOpen;
            const activeLabelReady =
              chapterKind === "cheatsheet"
                ? "Cheatsheet Ready"
                : chapterKind === "pastpaper"
                  ? "Past Paper Ready"
                  : "Notes Ready";
            const activePillCls = activeAvail
              ? chapterKind === "cheatsheet"
                ? "bg-amber-100 text-orange-700"
                : chapterKind === "pastpaper"
                  ? "bg-violet-100 text-violet-700"
                  : "bg-blue-100 text-clay-accentDeep"
              : "bg-orange-100 text-orange-600";
            return (
              <motion.div
                key={ch.slug}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="clay p-5 group hover:-translate-y-1 transition-transform cursor-pointer"
                onClick={() => setOpen({ chapter: ch, kind: chapterKind })}
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`w-11 h-11 rounded-2xl grid place-items-center shadow-clay-sm ${iconCls}`}
                  >
                    <ActiveIcon size={18} />
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelect(ch.slug);
                    }}
                    aria-label="Select chapter"
                    className="text-clay-accent"
                  >
                    {isSel ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                  </button>
                </div>
                <h3 className="display font-bold text-clay-ink dark:text-white leading-snug whitespace-pre-line">
                  {ch.name}
                </h3>

                <div className="mt-3 flex items-center justify-between">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${activePillCls}`}
                  >
                    {activeAvail ? activeLabelReady : "Coming Soon"}
                  </span>
                  {activeAvail && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadOne(ch);
                      }}
                      className="text-clay-accent hover:text-clay-accentDeep flex items-center gap-1 text-sm font-semibold"
                    >
                      <Download size={14} />{" "}
                      {chapterKind === "cheatsheet"
                        ? "Sheet"
                        : chapterKind === "pastpaper"
                          ? "PYQ"
                          : "PDF"}
                    </button>
                  )}
                </div>

                {/* small tri-availability indicator */}
                <div className="mt-3 flex items-center gap-2 text-[10px] uppercase tracking-wide flex-wrap">
                  <Pill
                    on={notesOk}
                    onClickInline={(e) => {
                      e.stopPropagation();
                      setOpen({ chapter: ch, kind: "notes" });
                    }}
                    icon={<FileText size={10} />}
                    label="Notes"
                  />
                  <Pill
                    on={cheatOk}
                    onClickInline={(e) => {
                      e.stopPropagation();
                      setOpen({ chapter: ch, kind: "cheatsheet" });
                    }}
                    icon={<Zap size={10} />}
                    label="Cheatsheet"
                    tone="warm"
                  />
                  <Pill
                    on={pyqOk}
                    onClickInline={(e) => {
                      e.stopPropagation();
                      setOpen({ chapter: ch, kind: "pastpaper" });
                    }}
                    icon={<ScrollText size={10} />}
                    label="PYQ"
                    tone="violet"
                  />
                </div>
              </motion.div>
            );
          })}
          {chapters.length === 0 && (
            <div className="col-span-full clay p-10 text-center text-clay-muted">
              <FileText size={28} className="mx-auto mb-2 text-clay-accent" />
              No chapters match "{search}". Try a different keyword.
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      </>
      )}

      <AssetModal
        chapter={open?.chapter ?? null}
        classId={activeId}
        kind={open?.kind ?? "notes"}
        onClose={() => setOpen(null)}
      />

      {zoomRoadmap && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black/85 grid place-items-center p-4 cursor-zoom-out"
          onClick={() => setZoomRoadmap(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getRoadmap(activeId, assets).url}
            alt={`Class ${activeId} roadmap`}
            className="max-w-full max-h-full object-contain rounded-xl"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-xs font-medium px-3 py-1.5 rounded-full bg-black/40">
            Press Esc or click outside to close
          </div>
        </motion.div>
      )}
    </section>
  );
}

function RoadmapView({
  classId,
  assets,
  onZoom,
}: {
  classId: string;
  assets: AssetMap;
  onZoom: () => void;
}) {
  const { url, isOverride, fileName } = getRoadmap(classId, assets);
  const cls = classes.find((c) => c.classId === classId);

  if (!url) {
    return (
      <div className="clay p-10 text-center text-clay-muted">
        <Map className="mx-auto mb-3 text-clay-accent" size={32} />
        <p className="text-clay-ink dark:text-white font-semibold">
          Roadmap coming soon
        </p>
      </div>
    );
  }

  return (
    <div className="clay p-4 sm:p-6">
      <div className="flex items-start gap-3 mb-4 flex-wrap">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-300 grid place-items-center text-emerald-700 shadow-clay-sm flex-shrink-0">
          <Map size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] uppercase tracking-wide text-clay-muted">
            {cls?.label} · Syllabus Roadmap
          </div>
          <h3 className="display font-extrabold text-clay-ink dark:text-white">
            Follow this order for full coverage
          </h3>
        </div>
        <div className="flex gap-2">
          <button onClick={onZoom} className="clay-btn-secondary text-xs">
            <Eye size={12} /> Full size
          </button>
          <a
            href={url}
            download={fileName ?? `Class ${classId} Roadmap.png`}
            className="clay-btn-primary text-xs"
          >
            <Download size={12} /> Download
          </a>
        </div>
      </div>
      <button
        onClick={onZoom}
        className="block w-full clay-inset rounded-2xl overflow-hidden bg-white dark:bg-[#0a163a] cursor-zoom-in"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={`Class ${classId} roadmap`}
          className="w-full h-auto object-contain max-h-[70vh]"
        />
      </button>
      {!isOverride && (
        <p className="text-[10px] text-clay-muted mt-3 text-center">
          Built-in roadmap. Khyati can replace it from the dashboard at any
          time.
        </p>
      )}
    </div>
  );
}

function SwitchTab({
  active,
  onClick,
  icon,
  label,
  tone = "blue",
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  tone?: "blue" | "warm" | "emerald" | "violet" | "rose";
}) {
  const activeClass =
    tone === "warm"
      ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-clay-sm"
      : tone === "emerald"
        ? "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-clay-sm"
        : tone === "violet"
          ? "bg-gradient-to-br from-violet-400 to-violet-600 text-white shadow-clay-sm"
          : tone === "rose"
            ? "bg-gradient-to-br from-rose-400 to-rose-600 text-white shadow-clay-sm"
            : "clay-btn-primary";
  return (
    <button
      onClick={onClick}
      className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all ${
        active
          ? activeClass
          : "text-clay-muted hover:text-clay-ink dark:hover:text-white"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function Pill({
  on,
  onClickInline,
  icon,
  label,
  tone = "blue",
}: {
  on: boolean;
  onClickInline: (e: React.MouseEvent) => void;
  icon: React.ReactNode;
  label: string;
  tone?: "blue" | "warm" | "violet";
}) {
  const onClasses =
    tone === "warm"
      ? "bg-amber-100 text-orange-700 hover:bg-amber-200"
      : tone === "violet"
        ? "bg-violet-100 text-violet-700 hover:bg-violet-200"
        : "bg-blue-100 text-clay-accentDeep hover:bg-blue-200";
  return (
    <button
      onClick={onClickInline}
      disabled={!on}
      className={`px-2 py-1 rounded-full flex items-center gap-1 font-semibold transition-colors ${
        on
          ? onClasses
          : "bg-clay-soft/60 text-clay-muted cursor-not-allowed opacity-60"
      }`}
    >
      {icon} {label}
    </button>
  );
}

function QuizView({
  classId,
  chapters,
  search,
  setSearch,
}: {
  classId: string;
  chapters: Chapter[];
  search: string;
  setSearch: (v: string) => void;
}) {
  const available = chapters.filter((ch) => hasQuiz(classId, ch.slug));

  return (
    <div>
      <div className="clay p-4 sm:p-5 mb-6 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="clay-inset flex items-center gap-2 px-4 py-3 flex-1 md:max-w-md">
          <Search size={16} className="text-clay-muted flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chapters…"
            className="bg-transparent outline-none text-sm w-full text-clay-ink dark:text-white placeholder:text-clay-muted min-w-0"
          />
        </div>
        <div className="text-xs text-clay-muted md:text-right">
          {available.length} live · {chapters.length - available.length} coming
          soon
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {chapters.map((ch, i) => {
          const live = hasQuiz(classId, ch.slug);
          const def = live ? QUIZZES.find((q) => q.classId === classId && q.chapterSlug === ch.slug) : undefined;
          return (
            <motion.div
              key={ch.slug}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="clay p-5 flex flex-col"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 rounded-2xl grid place-items-center shadow-clay-sm bg-gradient-to-br from-rose-100 to-rose-300 text-rose-700">
                  <Brain size={18} />
                </div>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                    live
                      ? "bg-rose-100 text-rose-700"
                      : "bg-orange-100 text-orange-600"
                  }`}
                >
                  {live ? "Live" : "Soon"}
                </span>
              </div>
              <h3 className="display font-bold text-clay-ink dark:text-white leading-snug whitespace-pre-line mb-2">
                {ch.name}
              </h3>
              {live && def ? (
                <div className="text-xs text-clay-muted flex items-center gap-3 mb-4">
                  <span className="flex items-center gap-1">
                    <Brain size={12} /> {def.questionsPerAttempt} MCQs
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {def.durationSec / 60} min
                  </span>
                </div>
              ) : (
                <div className="text-xs text-clay-muted mb-4">
                  Quiz is being prepared for this chapter.
                </div>
              )}
              <div className="mt-auto">
                {live ? (
                  <Link
                    href={`/quiz/${classId}/${ch.slug}`}
                    className="clay-btn-primary text-sm w-full justify-center"
                  >
                    <Play size={14} /> Give Test
                  </Link>
                ) : (
                  <button
                    disabled
                    className="clay-btn-secondary text-sm w-full justify-center opacity-50 cursor-not-allowed"
                  >
                    Coming soon
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
        {chapters.length === 0 && (
          <div className="col-span-full clay p-10 text-center text-clay-muted">
            <Brain size={28} className="mx-auto mb-2 text-clay-accent" />
            No chapters match "{search}".
          </div>
        )}
      </div>
    </div>
  );
}
