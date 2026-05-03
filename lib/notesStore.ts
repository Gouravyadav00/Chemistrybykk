"use client";

import {
  classes,
  defaultCheatsheetPath,
  defaultNotesPath,
  type AssetKind,
  type Chapter,
} from "@/data/chapters";

type AssetOverride = {
  available: boolean;
  file?: string;
  fileName?: string;
  isLocal?: boolean;
  updatedAt?: number;
};

type ChapterOverride = {
  notes?: AssetOverride;
  cheatsheet?: AssetOverride;
};

type Store = Record<string, Record<string, ChapterOverride>>;

const STORE_KEY = "cbk:notes-store-v2";

const isClient = () => typeof window !== "undefined";

export function readStore(): Store {
  if (!isClient()) return {};
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
  } catch {
    return {};
  }
}

export function writeStore(store: Store) {
  if (!isClient()) return;
  localStorage.setItem(STORE_KEY, JSON.stringify(store));
  window.dispatchEvent(new CustomEvent("cbk:notes-changed"));
}

export function setChapterAsset(
  classId: string,
  slug: string,
  kind: AssetKind,
  override: AssetOverride,
) {
  const store = readStore();
  if (!store[classId]) store[classId] = {};
  if (!store[classId][slug]) store[classId][slug] = {};
  store[classId][slug][kind] = { ...override, updatedAt: Date.now() };
  writeStore(store);
}

export function clearChapterAsset(
  classId: string,
  slug: string,
  kind: AssetKind,
) {
  const store = readStore();
  const chapter = store[classId]?.[slug];
  if (!chapter) return;
  delete chapter[kind];
  if (!chapter.notes && !chapter.cheatsheet) {
    delete store[classId][slug];
  }
  writeStore(store);
}

export function clearChapter(classId: string, slug: string) {
  const store = readStore();
  if (store[classId]) {
    delete store[classId][slug];
    writeStore(store);
  }
}

export function resolveChapter(classId: string, chapter: Chapter): Chapter {
  if (!isClient()) return chapter;
  const store = readStore();
  const ov = store[classId]?.[chapter.slug];
  if (!ov) return chapter;

  let next = { ...chapter };
  if (ov.notes) {
    next.notesAvailable = ov.notes.available;
    next.file =
      ov.notes.file ?? next.file ?? defaultNotesPath(classId, chapter.slug);
  }
  if (ov.cheatsheet) {
    next.cheatsheetAvailable = ov.cheatsheet.available;
    next.cheatsheet =
      ov.cheatsheet.file ??
      next.cheatsheet ??
      defaultCheatsheetPath(classId, chapter.slug);
  }
  return next;
}

export function resolveClass(classId: string) {
  const cls = classes.find((c) => c.classId === classId);
  if (!cls) return null;
  return {
    ...cls,
    chapters: cls.chapters.map((ch) => resolveChapter(classId, ch)),
  };
}

// Auth + subscriber data are server-side now (see app/api/auth + lib/subscribers.ts).
// Only library-management state (PDF/cheatsheet uploads in admin browser) lives here.

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
