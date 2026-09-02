import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const steamid = req.nextUrl.searchParams.get("steamid");
  const key = req.nextUrl.searchParams.get("key");

  if (!steamid || !/^\d{17}$/.test(steamid)) {
    return NextResponse.json({ error: "Invalid steamid" }, { status: 400 });
  }
  if (!key) {
    return NextResponse.json(
      { error: "Import celé knihovny potřebuje Steam Web API klíč (zdarma na steamcommunity.com/dev/apikey)." },
      { status: 400 }
    );
  }

  const url = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${encodeURIComponent(key)}&steamid=${steamid}&include_appinfo=1&format=json`;
  const res = await fetch(url);
  if (!res.ok) {
    return NextResponse.json({ error: "Steam API selhalo" }, { status: 502 });
  }

  const data = await res.json();
  const games = (data?.response?.games ?? []) as Array<{ appid: number; name: string }>;

  if (games.length === 0) {
    return NextResponse.json({
      games: [],
      note: "Prázdný výsledek — buď žádné hry, nebo je profil/herní detaily nastavené jako soukromé.",
    });
  }

  return NextResponse.json({ games: games.map((g) => ({ appid: String(g.appid), name: g.name })) });
}
