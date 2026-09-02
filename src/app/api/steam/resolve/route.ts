import { NextRequest, NextResponse } from "next/server";
import { parseSteamProfileInput } from "@/lib/steamProfile";

export async function GET(req: NextRequest) {
  const input = req.nextUrl.searchParams.get("input");
  const key = req.nextUrl.searchParams.get("key");

  if (!input) {
    return NextResponse.json({ error: "Missing input" }, { status: 400 });
  }

  const parsed = parseSteamProfileInput(input);

  if (parsed.type === "id64") {
    return NextResponse.json({ steamid: parsed.id64 });
  }

  if (!key) {
    return NextResponse.json(
      { error: "Pro vlastní ('vanity') URL potřebuješ Steam Web API klíč, nebo zadej rovnou SteamID64." },
      { status: 400 }
    );
  }

  const url = `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${encodeURIComponent(key)}&vanityurl=${encodeURIComponent(parsed.vanity)}`;
  const res = await fetch(url);
  if (!res.ok) {
    return NextResponse.json({ error: "Steam API selhalo" }, { status: 502 });
  }

  const data = await res.json();
  if (data?.response?.success !== 1) {
    return NextResponse.json({ error: "Profil s tímhle jménem se nepodařilo najít." }, { status: 404 });
  }

  return NextResponse.json({ steamid: data.response.steamid as string });
}
