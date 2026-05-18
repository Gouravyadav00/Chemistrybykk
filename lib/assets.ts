import { kv } from "./kv";

export type RegistryKind = "notes" | "cheatsheet" | "pastpaper" | "roadmap";

export type AssetEntry = {
  kind: RegistryKind;
  classId: string; // "9" | "10" | "11" | "12"
  slug?: string; // chapter slug for notes/cheatsheet/pastpaper; absent for roadmap
  // Optional sub-section for multi-phase notes (Class 11/12 chapters taught
  // across multiple YouTube videos). Only used for `kind === "notes"`.
  phase?: string;
  phaseLabel?: string;
  url: string; // blob URL
  fileName: string;
  contentKind: "pdf" | "image";
  size: number;
  updatedAt: number;
};

export type AssetMap = Record<string, AssetEntry>;

const ASSET_MAP_KEY = "assets:map";

export function assetIdFor(
  kind: RegistryKind,
  classId: string,
  slug?: string,
  phase?: string,
): string {
  if (kind === "roadmap") return `roadmap:${classId}`;
  if (kind === "notes" && phase) return `notes:${classId}:${slug ?? ""}:${phase}`;
  return `${kind}:${classId}:${slug ?? ""}`;
}

// Returns all phase entries for a given chapter's notes, sorted by createdAt
// fallback updatedAt. Excludes the single-PDF entry (which uses no phase).
export function listPhasesFor(
  map: AssetMap,
  classId: string,
  slug: string,
): AssetEntry[] {
  const prefix = `notes:${classId}:${slug}:`;
  return Object.entries(map)
    .filter(([key, entry]) => key.startsWith(prefix) && entry.phase)
    .map(([, entry]) => entry)
    .sort((a, b) => (a.phase ?? "").localeCompare(b.phase ?? ""));
}

export async function getAssetMap(): Promise<AssetMap> {
  return (await kv.get<AssetMap>(ASSET_MAP_KEY)) ?? {};
}

export async function setAsset(entry: AssetEntry) {
  const map = await getAssetMap();
  const id = assetIdFor(entry.kind, entry.classId, entry.slug, entry.phase);
  map[id] = entry;
  await kv.set(ASSET_MAP_KEY, map);
  return entry;
}

export async function deleteAsset(
  kind: RegistryKind,
  classId: string,
  slug?: string,
  phase?: string,
): Promise<AssetEntry | null> {
  const map = await getAssetMap();
  const id = assetIdFor(kind, classId, slug, phase);
  const entry = map[id] ?? null;
  delete map[id];
  await kv.set(ASSET_MAP_KEY, map);
  return entry;
}

export function detectContentKind(url: string): "pdf" | "image" {
  const ext = url.split("?")[0].split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return "pdf";
  return "image";
}
