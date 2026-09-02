import type { PcSpecs } from "./types";

const STORAGE_KEY = "spextr:pc-specs";

export function loadSpecs(): PcSpecs | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PcSpecs;
  } catch {
    return null;
  }
}

export function saveSpecs(specs: PcSpecs): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(specs));
}

export function clearSpecs(): void {
  window.localStorage.removeItem(STORAGE_KEY);
}
