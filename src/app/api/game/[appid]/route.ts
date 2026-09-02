import { NextRequest, NextResponse } from "next/server";
import { parseSteamRequirements } from "@/lib/parseRequirements";
import { findLocalGame } from "@/lib/localGames";
import type { GameRequirements } from "@/lib/types";

interface SteamAppDetails {
  name: string;
  header_image?: string;
  pc_requirements?: { minimum?: string; recommended?: string } | [];
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ appid: string }> }) {
  const { appid } = await params;
  if (!appid) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  if (appid.startsWith("local-")) {
    const localGame = findLocalGame(appid.slice("local-".length));
    if (!localGame) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }
    const game: GameRequirements = {
      appid,
      name: localGame.name,
      minimum: localGame.minimum,
      recommended: localGame.recommended,
    };
    return NextResponse.json(game);
  }

  if (!/^\d+$/.test(appid)) {
    return NextResponse.json({ error: "Invalid appid" }, { status: 400 });
  }

  const url = `https://store.steampowered.com/api/appdetails?appids=${appid}&cc=us&l=english`;
  const res = await fetch(url, { headers: { "Accept-Language": "en-US" } });

  if (!res.ok) {
    return NextResponse.json({ error: "Steam appdetails failed" }, { status: 502 });
  }

  const data = await res.json();
  const entry = data[appid];

  if (!entry?.success || !entry.data) {
    return NextResponse.json({ error: "Game not found or has no store page" }, { status: 404 });
  }

  const details = entry.data as SteamAppDetails;
  const reqs = Array.isArray(details.pc_requirements) ? {} : details.pc_requirements ?? {};

  const game: GameRequirements = {
    appid,
    name: details.name,
    headerImage: details.header_image,
    minimum: parseSteamRequirements(reqs.minimum),
    recommended: parseSteamRequirements(reqs.recommended),
  };

  return NextResponse.json(game);
}
