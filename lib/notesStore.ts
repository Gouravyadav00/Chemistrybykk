"use client";

import {
  classes,
  type Chapter,
  type ClassData,
} from "@/data/chapters";
import { assetIdFor, type AssetMap } from "@/lib/assets";

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
  return {
    ...chapter,
    notesAvailable: notes ? true : chapter.notesAvailable,
    file: notes?.url ?? chapter.file,
    cheatsheetAvailable: cheat ? true : chapter.cheatsheetAvailable,
    cheatsheet: cheat?.url ?? chapter.cheatsheet,
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
