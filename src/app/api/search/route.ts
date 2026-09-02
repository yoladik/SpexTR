import { NextRequest, NextResponse } from "next/server";

interface SteamSearchItem {
  id: number;
  name: string;
  tiny_image?: string;
}

export async function GET(req: NextRequest) {
  const term = req.nextUrl.searchParams.get("term")?.trim();
  if (!term) {
    return NextResponse.json({ results: [] });
  }

  const url = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(term)}&cc=us&l=english`;
  const res = await fetch(url, { headers: { "Accept-Language": "en-US" } });

  if (!res.ok) {
    return NextResponse.json({ error: "Steam search failed" }, { status: 502 });
  }

  const data = (await res.json()) as { total: number; items: SteamSearchItem[] };

  const sorted = [...data.items].sort((a, b) => matchScore(a.name, term) - matchScore(b.name, term));

  const results = sorted.map((item) => ({
    appid: item.id,
    name: item.name,
    icon: item.tiny_image,
  }));

  return NextResponse.json({ results });
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
