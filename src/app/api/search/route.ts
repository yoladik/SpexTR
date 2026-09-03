import { NextRequest, NextResponse } from "next/server";
import { searchLocalGames } from "@/lib/localGames";

interface SteamSearchItem {
  id: number;
  name: string;
  tiny_image?: string;
  type?: string;
}

interface SearchResult {
  appid: string;
  name: string;
  icon?: string;
}

// Cheap in-memory cache, same tradeoffs as /api/game/[appid]'s: only lives for this server
// instance, but cuts a lot of repeat Steam calls from someone typing/backspacing in the search
// box, which otherwise hits Steam on every debounced keystroke with no caching at all.
const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map<string, { expires: number; results: SearchResult[] }>();

export async function GET(req: NextRequest) {
  const term = req.nextUrl.searchParams.get("term")?.trim();
  if (!term) {
    return NextResponse.json({ results: [] });
  }

  const cacheKey = term.toLowerCase();
  const cached = cache.get(cacheKey);
  if (cached && cached.expires > Date.now()) {
    return NextResponse.json({ results: cached.results });
  }

  const steamResults = await searchSteam(term);
  const localResults: SearchResult[] = searchLocalGames(term).map((g) => ({
    appid: `local-${g.id}`,
    name: g.name,
  }));

  const combined = [...steamResults, ...localResults].sort(
    (a, b) => matchScore(a.name, term) - matchScore(b.name, term)
  );

  cache.set(cacheKey, { expires: Date.now() + CACHE_TTL_MS, results: combined });

  return NextResponse.json({ results: combined });
}

async function searchSteam(term: string): Promise<SearchResult[]> {
  try {
    const url = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(term)}&cc=us&l=english`;
    const res = await fetch(url, { headers: { "Accept-Language": "en-US" } });
    if (!res.ok) return [];

    const data = (await res.json()) as { total: number; items: SteamSearchItem[] };
    return data.items
      .filter((item) => !item.type || item.type === "game") // drop DLC/soundtracks/bundles when Steam tells us the type
      .map((item) => ({
        appid: String(item.id),
        name: item.name,
        icon: item.tiny_image,
      }));
  } catch {
    return [];
  }
}

/** Lower = better match. Exact name first, then "starts with", then "contains" (closer to the
 * start wins), then whatever Steam itself considered relevant. Also rewards shorter names so a
 * base game ("Minecraft") ranks above its spin-offs ("Minecraft Dungeons") on a tied prefix. */
function matchScore(name: string, term: string): number {
  const n = name.toLowerCase().trim();
  const t = term.toLowerCase().trim();

  if (n === t) return 0;
  if (n.startsWith(t)) return 1 + n.length / 1000;

  const idx = n.indexOf(t);
  if (idx > 0) return 2 + idx / 100 + n.length / 1000;

  return 5;
}
