"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  FileText,
  LogOut,
  Trash2,
  Upload,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  classes,
  defaultCheatsheetPath,
  defaultNotesPath,
  type AssetKind,
  type Chapter,
} from "@/data/chapters";
import {
  clearChapterAsset,
  fileToDataUrl,
  resolveClass,
  setChapterAsset,
} from "@/lib/notesStore";
import StudentsAnalytics from "./StudentsAnalytics";

type Tab = "library" | "students";

export default function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>("library");

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="display text-3xl font-extrabold text-clay-ink dark:text-white">
            Welcome back, Khyati 👋
          </h1>
          <p className="text-clay-muted text-sm">
            Manage notes & students from one place.
          </p>
        </div>
        <button onClick={onLogout} className="clay-btn-secondary text-sm">
          <LogOut size={16} /> Sign Out
        </button>
      </div>

      <div className="clay-inset p-1 inline-flex gap-1 rounded-2xl mb-6">
        <TabBtn
          active={tab === "library"}
          onClick={() => setTab("library")}
          icon={<FileText size={14} />}
          label="Library"
        />
        <TabBtn
          active={tab === "students"}
          onClick={() => setTab("students")}
          icon={<BarChart3 size={14} />}
          label="Students"
        />
      </div>

      {tab === "library" ? <LibraryTab /> : <StudentsAnalytics />}
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition ${
        active
          ? "clay-btn-primary"
          : "text-clay-muted hover:text-clay-ink dark:hover:text-white"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

/* -------------------- Library tab -------------------- */

function LibraryTab() {
  const [activeId, setActiveId] = useState("12");
  const [data, setData] = useState(resolveClass(activeId));
  const [, force] = useState(0);

  useEffect(() => {
    setData(resolveClass(activeId));
  }, [activeId]);

  useEffect(() => {
    const handler = () => {
      setData(resolveClass(activeId));
      force((n) => n + 1);
    };
    window.addEventListener("cbk:notes-changed", handler);
    return () => window.removeEventListener("cbk:notes-changed", handler);
  }, [activeId]);

  const onUpload = async (slug: string, kind: AssetKind, file: File) => {
    const dataUrl = await fileToDataUrl(file);
    setChapterAsset(activeId, slug, kind, {
      available: true,
      file: dataUrl,
      fileName: file.name,
      isLocal: true,
    });
  };

  const toggleAvail = (
    slug: string,
    kind: AssetKind,
    current: boolean,
    file?: string,
  ) => {
    setChapterAsset(activeId, slug, kind, {
      available: !current,
      file,
    });
  };

  const removeAsset = (slug: string, kind: AssetKind) => {
    clearChapterAsset(activeId, slug, kind);
  };

  const totalNotes = data?.chapters.filter((c) => c.notesAvailable).length ?? 0;
  const totalSheets =
    data?.chapters.filter((c) => c.cheatsheetAvailable).length ?? 0;
  const total = data?.chapters.length ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex flex-wrap gap-2 mb-6">
        {classes.map((c) => {
          const active = c.classId === activeId;
          return (
            <button
              key={c.classId}
              onClick={() => setActiveId(c.classId)}
              className={`px-4 py-2.5 rounded-2xl font-semibold text-sm ${
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

      <div className="grid sm:grid-cols-2 gap-3 mb-6">
        <SummaryTile
          icon={<FileText size={20} />}
          tone="blue"
          value={`${totalNotes}/${total}`}
          label="Notes"
          sub={data?.label ?? ""}
        />
        <SummaryTile
          icon={<Zap size={20} />}
          tone="warm"
          value={`${totalSheets}/${total}`}
          label="Cheatsheets"
          sub={data?.label ?? ""}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {data?.chapters.map((ch) => (
          <ChapterRow
            key={ch.slug}
            chapter={ch}
            classId={activeId}
            onUpload={onUpload}
            onToggle={toggleAvail}
            onRemove={removeAsset}
          />
        ))}
      </div>

      <div className="clay-inset mt-8 p-5 text-xs text-clay-muted leading-relaxed">
        <strong className="text-clay-ink dark:text-white">Note:</strong> Uploads
        from this browser-only admin are stored locally (in your browser). For
        files that should be available to every visitor, drop them at{" "}
        <code className="text-clay-accent">
          /public/notes/class&lt;X&gt;/&lt;slug&gt;.pdf
        </code>{" "}
        for notes and{" "}
        <code className="text-clay-accent">
          /public/notes/class&lt;X&gt;/&lt;slug&gt;.cheatsheet.pdf
        </code>{" "}
        for cheatsheets — then redeploy. PNG/JPG cheatsheets work too via the
        upload above.
      </div>
    </motion.div>
  );
}

function SummaryTile({
  icon,
  tone,
  value,
  label,
  sub,
}: {
  icon: React.ReactNode;
  tone: "blue" | "warm";
  value: string;
  label: string;
  sub: string;
}) {
  const cls =
    tone === "warm"
      ? "from-amber-100 to-orange-200 text-orange-600"
      : "from-blue-100 to-blue-300 text-clay-accentDeep";
  return (
    <div className="clay p-5 flex items-center gap-4">
      <div
        className={`w-12 h-12 rounded-2xl bg-gradient-to-br grid place-items-center shadow-clay-sm ${cls}`}
      >
        {icon}
      </div>
      <div>
        <div className="display font-bold text-clay-ink dark:text-white">
          {value} {label}
        </div>
        <div className="text-xs text-clay-muted">in {sub}</div>
      </div>
    </div>
  );
}

function ChapterRow({
  chapter: ch,
  classId,
  onUpload,
  onToggle,
  onRemove,
}: {
  chapter: Chapter;
  classId: string;
  onUpload: (slug: string, kind: AssetKind, file: File) => void;
  onToggle: (
    slug: string,
    kind: AssetKind,
    current: boolean,
    file?: string,
  ) => void;
  onRemove: (slug: string, kind: AssetKind) => void;
}) {
  return (
    <div className="clay p-5">
      <div className="flex items-start gap-3 mb-4 min-w-0">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-300 grid place-items-center text-clay-accentDeep shadow-clay-sm flex-shrink-0">
          <FileText size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="display font-bold text-clay-ink dark:text-white truncate">
            {ch.name}
          </div>
          <div className="text-[10px] uppercase tracking-wide text-clay-muted">
            Class {classId}
          </div>
        </div>
      </div>

      <AssetSection
        kind="notes"
        label="Notes"
        accept="application/pdf"
        available={ch.notesAvailable}
        file={ch.file}
        defaultPath={defaultNotesPath(classId, ch.slug)}
        slug={ch.slug}
        onUpload={onUpload}
        onToggle={onToggle}
        onRemove={onRemove}
      />

      <div className="h-px bg-clay-soft/60 dark:bg-white/5 my-3" />

      <AssetSection
        kind="cheatsheet"
        label="Cheatsheet"
        accept="application/pdf,image/png,image/jpeg,image/webp"
        available={ch.cheatsheetAvailable}
        file={ch.cheatsheet}
        defaultPath={defaultCheatsheetPath(classId, ch.slug)}
        slug={ch.slug}
        onUpload={onUpload}
        onToggle={onToggle}
        onRemove={onRemove}
      />
    </div>
  );
}

function AssetSection({
  kind,
  label,
  accept,
  available,
  file,
  defaultPath,
  slug,
  onUpload,
  onToggle,
  onRemove,
}: {
  kind: AssetKind;
  label: string;
  accept: string;
  available: boolean;
  file?: string;
  defaultPath: string;
  slug: string;
  onUpload: (slug: string, kind: AssetKind, file: File) => void;
  onToggle: (
    slug: string,
    kind: AssetKind,
    current: boolean,
    file?: string,
  ) => void;
  onRemove: (slug: string, kind: AssetKind) => void;
}) {
  const isCheat = kind === "cheatsheet";
  const tone = isCheat
    ? "bg-amber-100 text-orange-700"
    : "bg-blue-100 text-clay-accentDeep";
  const Icon = isCheat ? Zap : FileText;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon
            size={14}
            className={isCheat ? "text-orange-600" : "text-clay-accent"}
          />
          <span className="text-xs font-semibold text-clay-ink dark:text-white">
            {label}
          </span>
        </div>
        <span
          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
            available ? tone : "bg-orange-100 text-orange-600"
          }`}
        >
          {available ? "Live" : "Hidden"}
        </span>
      </div>
      <div className="text-[11px] text-clay-muted truncate mb-2.5">
        {file
          ? file.startsWith("data:")
            ? "Uploaded (browser-stored)"
            : file
          : defaultPath}
      </div>
      <div className="flex flex-wrap gap-2">
        <label className="clay-btn-secondary text-xs py-2 px-3 cursor-pointer">
          <Upload size={14} />
          {available ? "Replace" : "Upload"}
          <input
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onUpload(slug, kind, f);
              e.currentTarget.value = "";
            }}
          />
        </label>
        <button
          onClick={() => onToggle(slug, kind, available, file)}
          className="clay-btn-secondary text-xs py-2 px-3"
        >
          {available ? "Hide" : "Mark Available"}
        </button>
        <button
          onClick={() => onRemove(slug, kind)}
          className="clay-btn-secondary text-xs py-2 px-3 text-red-500"
        >
          <Trash2 size={14} /> Delete
        </button>
      </div>
    </div>
  );
}
