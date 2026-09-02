import { NextRequest, NextResponse } from "next/server";
import { parseSteamRequirements } from "@/lib/parseRequirements";
import { findLocalGame } from "@/lib/localGames";
import type { GameRequirements } from "@/lib/types";
import type { Platform } from "@/lib/platform";

interface SteamAppDetails {
  name: string;
  header_image?: string;
  platforms?: { windows: boolean; mac: boolean; linux: boolean };
  pc_requirements?: { minimum?: string; recommended?: string } | [];
  mac_requirements?: { minimum?: string; recommended?: string } | [];
  linux_requirements?: { minimum?: string; recommended?: string } | [];
}

// Cheap in-memory cache. Only lives for as long as this server instance does (resets on cold
// start / redeploy, isn't shared across instances on serverless) - still cuts a lot of repeat
// calls to Steam within a session, which is all we need for a small app like this.
const CACHE_TTL_MS = 60 * 60 * 1000;
const cache = new Map<string, { expires: number; game: GameRequirements }>();

export async function GET(req: NextRequest, { params }: { params: Promise<{ appid: string }> }) {
  const { appid } = await params;
  if (!appid) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const platformParam = (req.nextUrl.searchParams.get("platform") ?? "windows") as Platform;

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

  const cacheKey = `${appid}:${platformParam}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.expires > Date.now()) {
    return NextResponse.json(cached.game);
  }

  // The "birthtime"/"wants_mature_content" cookies are the commonly used workaround for
  // age-gated store pages, which otherwise return success:false with no explanation.
  const url = `https://store.steampowered.com/api/appdetails?appids=${appid}&cc=us&l=english`;
  const res = await fetch(url, {
    headers: {
      "Accept-Language": "en-US",
      Cookie: "birthtime=0; lastagecheckage=1-January-1970; wants_mature_content=1",
    },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Steam appdetails failed" }, { status: 502 });
  }

  const data = await res.json();
  const entry = data[appid];

  if (!entry?.success || !entry.data) {
    return NextResponse.json(
      {
        error:
          "Hra nenalezena. Pokud víš, že existuje, může jít o věkově omezenou nebo regionálně nedostupnou stránku, kterou Steam API bez přihlášení neuvolní.",
      },
      { status: 404 }
    );
  }

  const details = entry.data as SteamAppDetails;

  const platformReqs = {
    windows: details.pc_requirements,
    mac: details.mac_requirements,
    linux: details.linux_requirements,
  }[platformParam];

  const supportsPlatform = details.platforms?.[platformParam] ?? true;
  const reqs = !supportsPlatform || Array.isArray(platformReqs) ? {} : platformReqs ?? {};

  const game: GameRequirements = {
    appid,
    name: details.name,
    headerImage: details.header_image,
    minimum: parseSteamRequirements(reqs.minimum),
    recommended: parseSteamRequirements(reqs.recommended),
    platforms: details.platforms,
    requirementsPlatform: platformParam,
  };

  cache.set(cacheKey, { expires: Date.now() + CACHE_TTL_MS, game });

  return NextResponse.json(game);
}
