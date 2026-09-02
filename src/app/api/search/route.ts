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
  const results = data.items.map((item) => ({
    appid: item.id,
    name: item.name,
    icon: item.tiny_image,
  }));

  return NextResponse.json({ results });
}
