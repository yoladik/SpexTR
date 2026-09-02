export interface CompareListEntry {
  appid: string;
  name: string;
}

const STORAGE_KEY = "spextr:compare-list";
const MAX_ENTRIES = 8;

export function loadCompareList(): CompareListEntry[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as CompareListEntry[];
  } catch {
    return [];
  }
}

export function addToCompareList(entry: CompareListEntry): CompareListEntry[] {
  const existing = loadCompareList().filter((e) => e.appid !== entry.appid);
  const updated = [...existing, entry].slice(0, MAX_ENTRIES);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function removeFromCompareList(appid: string): CompareListEntry[] {
  const updated = loadCompareList().filter((e) => e.appid !== appid);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}
