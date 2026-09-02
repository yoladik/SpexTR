import { NextRequest, NextResponse } from "next/server";

interface GameEntry {
  appid: string;
  name?: string;
}

// Steam's wishlist has two APIs floating around: the newer official IWishlistService (needs an
// API key, only returns appids) and an older, undocumented but widely used
// store.steampowered.com/wishlist endpoint (no key needed, also returns names). We try the
// official one first when a key is given, and always fall back to the legacy one - the surest
// way to find out which one actually still behaves is real traffic, which this sandbox can't send.
export async function GET(req: NextRequest) {
  const steamid = req.nextUrl.searchParams.get("steamid");
  const key = req.nextUrl.searchParams.get("key");

  if (!steamid || !/^\d{17}$/.test(steamid)) {
    return NextResponse.json({ error: "Invalid steamid" }, { status: 400 });
  }

  if (key) {
    try {
      const games = await fetchViaWishlistService(steamid, key);
      if (games) return NextResponse.json({ games });
    } catch {
      // fall through to the legacy endpoint below
    }
  }

  try {
    const games = await fetchViaLegacyWishlist(steamid);
    return NextResponse.json({ games });
  } catch {
    return NextResponse.json({ error: "Wishlist se nepodařilo načíst. Je nastavená jako veřejná?" }, { status: 502 });
  }
}

async function fetchViaWishlistService(steamid: string, key: string): Promise<GameEntry[] | null> {
  const url = `https://api.steampowered.com/IWishlistService/GetWishlist/v1/?key=${encodeURIComponent(key)}&steamid=${steamid}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const items = data?.response?.items;
  if (!Array.isArray(items)) return null;
  return items.map((item: { appid: number }) => ({ appid: String(item.appid) }));
}

async function fetchViaLegacyWishlist(steamid: string): Promise<GameEntry[]> {
  const games: GameEntry[] = [];
  for (let page = 0; page < 10; page++) {
    const url = `https://store.steampowered.com/wishlist/profiles/${steamid}/wishlistdata/?p=${page}`;
    const res = await fetch(url);
    if (!res.ok) break;
    const data = await res.json();
    if (!data || Array.isArray(data) || Object.keys(data).length === 0) break;
    for (const [appid, info] of Object.entries(data as Record<string, { name?: string }>)) {
      games.push({ appid, name: info?.name });
    }
    if (Object.keys(data).length < 100) break; // last page
  }
  return games;
}
