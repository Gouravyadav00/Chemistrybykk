"use client";

import { upload } from "@vercel/blob/client";
import { motion } from "framer-motion";
import {
  BarChart3,
  Download,
  FileText,
  Loader2,
  LogOut,
  Map,
  MessageCircleQuestion,
  Star,
  Trash2,
  Upload as UploadIcon,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import AdminDoubts from "./AdminDoubts";
import AdminTestimonials from "./AdminTestimonials";
import {
  classes,
  defaultCheatsheetPath,
  defaultNotesPath,
  type AssetKind,
  type Chapter,
} from "@/data/chapters";
import {
  fetchAssetMap,
  getRoadmap,
  resolveClass,
  ROADMAP_DEFAULTS,
  type AssetMap,
} from "@/lib/notesStore";
import StudentsAnalytics from "./StudentsAnalytics";

type Tab = "library" | "students" | "doubts" | "testimonials";

export default function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>("library");
  const [doubtBadge, setDoubtBadge] = useState(0);
  const [pendingTes, setPendingTes] = useState(0);

  useEffect(() => {
    const load = () => {
      fetch("/api/doubts/unread")
        .then((r) => r.json())
        .then((d) => setDoubtBadge(d.unread ?? 0))
        .catch(() => {});
      fetch("/api/admin/testimonials")
        .then((r) => r.json())
        .then((d) => setPendingTes(d.counts?.pending ?? 0))
        .catch(() => {});
    };
    load();
    const t = setInterval(load, 30_000);
    return () => clearInterval(t);
  }, []);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="display text-3xl font-extrabold text-clay-ink dark:text-white">
            Welcome back, Khyati 👋
          </h1>
          <p className="text-clay-muted text-sm">
            Manage notes, students & doubts from one place.
          </p>
        </div>
        <button onClick={onLogout} className="clay-btn-secondary text-sm">
          <LogOut size={16} /> Sign Out
        </button>
      </div>

      <div className="clay-inset p-1 inline-flex gap-1 rounded-2xl mb-6 flex-wrap">
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
        <TabBtn
          active={tab === "doubts"}
          onClick={() => setTab("doubts")}
          icon={<MessageCircleQuestion size={14} />}
          label="Doubts"
          badge={doubtBadge}
        />
        <TabBtn
          active={tab === "testimonials"}
          onClick={() => setTab("testimonials")}
          icon={<Star size={14} />}
          label="Testimonials"
          badge={pendingTes}
        />
      </div>

      {tab === "library" ? (
        <LibraryTab />
      ) : tab === "students" ? (
        <StudentsAnalytics />
      ) : tab === "doubts" ? (
        <AdminDoubts />
      ) : (
        <AdminTestimonials />
      )}
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  icon,
  label,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition relative ${
        active
          ? "clay-btn-primary"
          : "text-clay-muted hover:text-clay-ink dark:hover:text-white"
      }`}
    >
      {icon}
      {label}
      {badge !== undefined && badge > 0 && (
        <span className="ml-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-clay-accent text-white min-w-[18px] text-center">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </button>
  );
}

/* -------------------- Library tab -------------------- */

function LibraryTab() {
  const [activeId, setActiveId] = useState("12");
  const [assets, setAssets] = useState<AssetMap>({});
  const [data, setData] = useState(resolveClass(activeId, {}));
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const map = await fetchAssetMap();
    setAssets(map);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    setData(resolveClass(activeId, assets));
  }, [activeId, assets]);

  const onUpload = async (slug: string, kind: AssetKind, file: File) => {
    try {
      const blob = await upload(
        `library/class${activeId}/${kind}/${slug}-${file.name}`,
        file,
        { access: "public", handleUploadUrl: "/api/blob/upload" },
      );
      const res = await fetch("/api/admin/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          classId: activeId,
          slug,
          url: blob.url,
          fileName: file.name,
          size: file.size,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error ?? "Failed to register asset");
      }
      await refresh();
    } catch (e) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      alert(
        `Upload failed for "${file.name}" (${sizeMb} MB).\n\n${
          (e as Error).message ?? "Unknown error"
        }\n\nNotes can be up to 100 MB. If your file is larger, compress it first.`,
      );
    }
  };

  const removeAsset = async (slug: string, kind: AssetKind) => {
    if (!confirm(`Remove this ${kind}? The file will be deleted.`)) return;
    await fetch(
      `/api/admin/assets?kind=${kind}&classId=${activeId}&slug=${encodeURIComponent(slug)}`,
      { method: "DELETE" },
    );
    await refresh();
  };

  const totalNotes = data?.chapters.filter((c) => c.notesAvailable).length ?? 0;
  const totalSheets =
    data?.chapters.filter((c) => c.cheatsheetAvailable).length ?? 0;
  const total = data?.chapters.length ?? 0;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
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

      {loading ? (
        <div className="clay p-10 text-center text-clay-muted">
          <Loader2 className="mx-auto animate-spin" />
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          {data?.chapters.map((ch) => (
            <ChapterRow
              key={ch.slug}
              chapter={ch}
              classId={activeId}
              onUpload={onUpload}
              onRemove={removeAsset}
            />
          ))}
        </div>
      )}

      <RoadmapAdmin assets={assets} onChange={refresh} />

      <div className="clay-inset mt-6 p-5 text-xs text-clay-muted leading-relaxed">
        <strong className="text-clay-ink dark:text-white">How it works:</strong>{" "}
        Uploads go straight to Vercel Blob storage and are visible to every
        student instantly — no redeploy needed. Removing a file deletes both
        the registry entry and the underlying Blob.
      </div>
    </motion.div>
  );
}

function RoadmapAdmin({
  assets,
  onChange,
}: {
  assets: AssetMap;
  onChange: () => Promise<void> | void;
}) {
  const [busy, setBusy] = useState<string | null>(null);

  const upload2 = async (classId: string, file: File) => {
    setBusy(classId);
    try {
      const blob = await upload(
        `roadmaps/class${classId}-${file.name}`,
        file,
        { access: "public", handleUploadUrl: "/api/blob/upload" },
      );
      const res = await fetch("/api/admin/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "roadmap",
          classId,
          url: blob.url,
          fileName: file.name,
          size: file.size,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error ?? "Failed to register asset");
      }
      await onChange();
    } catch (e) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      alert(
        `Upload failed for "${file.name}" (${sizeMb} MB).\n\n${
          (e as Error).message ?? "Unknown error"
        }`,
      );
    } finally {
      setBusy(null);
    }
  };

  const remove2 = async (classId: string) => {
    if (!confirm("Reset this roadmap to the built-in default?")) return;
    setBusy(classId);
    try {
      await fetch(
        `/api/admin/assets?kind=roadmap&classId=${classId}`,
        { method: "DELETE" },
      );
      await onChange();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="clay p-5 mt-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-300 grid place-items-center text-emerald-700 shadow-clay-sm">
          <Map size={16} />
        </div>
        <div>
          <h3 className="display font-extrabold text-clay-ink dark:text-white">
            Roadmaps
          </h3>
          <p className="text-xs text-clay-muted">
            One per class — visible in the Learning Hub and as a welcome bonus.
          </p>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {(["9", "10", "11", "12"] as const).map((c) => {
          const r = getRoadmap(c, assets);
          return (
            <div key={c} className="clay-sm p-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="font-bold text-sm text-clay-ink dark:text-white">
                    Class {c}
                  </div>
                  <div className="text-[10px] text-clay-muted">
                    {r.isOverride ? "Custom (Blob)" : "Built-in default"}
                  </div>
                </div>
                {r.url && (
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                    className="clay-sm w-8 h-8 grid place-items-center text-clay-accent"
                    aria-label="Preview"
                  >
                    <Download size={12} />
                  </a>
                )}
              </div>
              {r.url && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={r.url}
                  alt={`Class ${c} roadmap`}
                  className="w-full h-24 object-cover rounded-xl bg-white/60 mb-2"
                />
              )}
              <div className="flex flex-wrap gap-2">
                <label className="clay-btn-secondary text-xs cursor-pointer flex-1">
                  {busy === c ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <UploadIcon size={12} />
                  )}
                  {r.isOverride ? "Replace" : "Upload"}
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    disabled={busy === c}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) upload2(c, f);
                      e.currentTarget.value = "";
                    }}
                  />
                </label>
                {r.isOverride && (
                  <button
                    onClick={() => remove2(c)}
                    disabled={busy === c}
                    className="clay-btn-secondary text-xs text-red-500"
                  >
                    <Trash2 size={12} /> Reset
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
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
  onRemove,
}: {
  chapter: Chapter;
  classId: string;
  onUpload: (slug: string, kind: AssetKind, file: File) => Promise<void>;
  onRemove: (slug: string, kind: AssetKind) => Promise<void>;
}) {
  return (
    <div className="clay p-5">
      <div className="flex items-start gap-3 mb-4 min-w-0">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-300 grid place-items-center text-clay-accentDeep shadow-clay-sm flex-shrink-0">
          <FileText size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="display font-bold text-clay-ink dark:text-white whitespace-pre-line leading-snug break-words">
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
  onRemove,
}: {
  kind: AssetKind;
  label: string;
  accept: string;
  available: boolean;
  file?: string;
  defaultPath: string;
  slug: string;
  onUpload: (slug: string, kind: AssetKind, file: File) => Promise<void>;
  onRemove: (slug: string, kind: AssetKind) => Promise<void>;
}) {
  const isCheat = kind === "cheatsheet";
  const tone = isCheat
    ? "bg-amber-100 text-orange-700"
    : "bg-blue-100 text-clay-accentDeep";
  const Icon = isCheat ? Zap : FileText;
  const [busy, setBusy] = useState(false);

  const isBlob = file?.includes(".blob.vercel-storage.com");

  const handleUpload = async (f: File) => {
    setBusy(true);
    try {
      await onUpload(slug, kind, f);
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async () => {
    setBusy(true);
    try {
      await onRemove(slug, kind);
    } finally {
      setBusy(false);
    }
  };

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
          {available ? (isBlob ? "Live · Blob" : "Default") : "Coming Soon"}
        </span>
      </div>
      <div className="text-[11px] text-clay-muted truncate mb-2.5">
        {file ?? defaultPath}
      </div>
      <div className="flex flex-wrap gap-2">
        <label className="clay-btn-secondary text-xs py-2 px-3 cursor-pointer">
          {busy ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <UploadIcon size={14} />
          )}
          {isBlob ? "Replace" : "Upload"}
          <input
            type="file"
            accept={accept}
            className="hidden"
            disabled={busy}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleUpload(f);
              e.currentTarget.value = "";
            }}
          />
        </label>
        {isBlob && (
          <button
            onClick={handleRemove}
            disabled={busy}
            className="clay-btn-secondary text-xs py-2 px-3 text-red-500"
          >
            <Trash2 size={14} /> Delete
          </button>
        )}
      </div>
    </div>
  );
}
