import { kv } from "./kv";

export type RegistryKind = "notes" | "cheatsheet" | "pastpaper" | "roadmap";

export type AssetEntry = {
  kind: RegistryKind;
  classId: string; // "9" | "10" | "11" | "12"
  slug?: string; // chapter slug for notes/cheatsheet/pastpaper; absent for roadmap
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
): string {
  if (kind === "roadmap") return `roadmap:${classId}`;
  return `${kind}:${classId}:${slug ?? ""}`;
}

export async function getAssetMap(): Promise<AssetMap> {
  return (await kv.get<AssetMap>(ASSET_MAP_KEY)) ?? {};
}

export async function setAsset(entry: AssetEntry) {
  const map = await getAssetMap();
  const id = assetIdFor(entry.kind, entry.classId, entry.slug);
  map[id] = entry;
  await kv.set(ASSET_MAP_KEY, map);
  return entry;
}

export async function deleteAsset(
  kind: RegistryKind,
  classId: string,
  slug?: string,
): Promise<AssetEntry | null> {
  const map = await getAssetMap();
  const id = assetIdFor(kind, classId, slug);
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
