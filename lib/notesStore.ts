"use client";

import {
  classes,
  type Chapter,
  type ChapterPhase,
  type ClassData,
} from "@/data/chapters";
import { assetIdFor, listPhasesFor, type AssetMap } from "@/lib/assets";

// Classes where notes can be split into multiple phases. Class 9/10 stay
// single-PDF per chapter (board-level fits in one file); 11/12 chapters span
// 2–3 YouTube videos so each phase gets its own notes PDF.
export const PHASE_CLASSES = new Set(["11", "12"]);
export const supportsPhases = (classId: string) => PHASE_CLASSES.has(classId);

export type { AssetMap };

export const ROADMAP_DEFAULTS: Record<string, string> = {
  "9": "/images/Class 9th Roadmap Cheatsheet.png",
  "10": "/images/Class 10th Roadmap Cheatsheet.png",
  "11": "/images/Class 11th Roadmap Cheatsheet.png",
  "12": "/images/Class 12th Roadmap Cheatsheet.png",
};

export function applyChapterOverrides(
  classId: string,
  chapter: Chapter,
  assets: AssetMap,
): Chapter {
  const notes = assets[assetIdFor("notes", classId, chapter.slug)];
  const cheat = assets[assetIdFor("cheatsheet", classId, chapter.slug)];
  const pyq = assets[assetIdFor("pastpaper", classId, chapter.slug)];
  const phaseEntries = supportsPhases(classId)
    ? listPhasesFor(assets, classId, chapter.slug)
    : [];
  const phases: ChapterPhase[] = phaseEntries.map((p) => ({
    phase: p.phase!,
    label: p.phaseLabel ?? p.phase!,
    url: p.url,
    fileName: p.fileName,
    size: p.size,
    updatedAt: p.updatedAt,
  }));
  const hasPhases = phases.length > 0;
  return {
    ...chapter,
    notesAvailable: hasPhases || (notes ? true : chapter.notesAvailable),
    // When phases exist, `file` points at the first phase so legacy callers
    // (download buttons, "PDF" download link) still work.
    file: hasPhases ? phases[0].url : (notes?.url ?? chapter.file),
    phases: hasPhases ? phases : undefined,
    cheatsheetAvailable: cheat ? true : chapter.cheatsheetAvailable,
    cheatsheet: cheat?.url ?? chapter.cheatsheet,
    pastpaperAvailable: pyq ? true : chapter.pastpaperAvailable,
    pastpaper: pyq?.url ?? chapter.pastpaper,
  };
}

export function resolveClass(
  classId: string,
  assets: AssetMap = {},
): (ClassData & { chapters: Chapter[] }) | null {
  const cls = classes.find((c) => c.classId === classId);
  if (!cls) return null;
  return {
    ...cls,
    chapters: cls.chapters.map((ch) =>
      applyChapterOverrides(classId, ch, assets),
    ),
  };
}

export function getRoadmap(
  classId: string,
  assets: AssetMap = {},
): { url: string; isOverride: boolean; fileName?: string } {
  const entry = assets[assetIdFor("roadmap", classId)];
  if (entry) return { url: entry.url, isOverride: true, fileName: entry.fileName };
  return { url: ROADMAP_DEFAULTS[classId] ?? "", isOverride: false };
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function fetchAssetMap(): Promise<AssetMap> {
  try {
    const res = await fetch("/api/assets", { cache: "no-store" });
    if (!res.ok) return {};
    const data = await res.json();
    return (data?.assets as AssetMap) ?? {};
  } catch {
    return {};
  }
}
