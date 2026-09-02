import type { Verdict } from "./types";

export interface HistoryEntry {
  appid: string;
  name: string;
  headerImage?: string;
  overall: Verdict;
  checkedAt: number;
}

const STORAGE_KEY = "spextr:history";
const MAX_ENTRIES = 20;

export function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as HistoryEntry[];
  } catch {
    return [];
  }
}

export function addHistoryEntry(entry: HistoryEntry): void {
  const existing = loadHistory().filter((e) => e.appid !== entry.appid);
  const updated = [entry, ...existing].slice(0, MAX_ENTRIES);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function clearHistory(): void {
  window.localStorage.removeItem(STORAGE_KEY);
}
