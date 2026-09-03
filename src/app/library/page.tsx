"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { PcSpecs, GameRequirements, ComparisonResult } from "@/lib/types";
import { loadSpecs } from "@/lib/specsStorage";
import { compareSpecs } from "@/lib/compare";
import { resolvePlatform } from "@/lib/platform";
import {
  loadSteamProfileInput,
  saveSteamProfileInput,
  loadSteamApiKey,
  saveSteamApiKey,
} from "@/lib/steamAccountStorage";
import VerdictBadge from "@/components/VerdictBadge";

interface GameEntry {
  appid: string;
  name?: string;
}

const MAX_GAMES = 40;

export default function LibraryPage() {
  const [specs, setSpecs] = useState<PcSpecs | null>(null);
  const [profileInput, setProfileInput] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loadingSource, setLoadingSource] = useState<"wishlist" | "library" | null>(null);
  const [games, setGames] = useState<GameEntry[]>([]);
  const [truncated, setTruncated] = useState(false);
  const [results, setResults] = useState<Record<string, ComparisonResult | "loading" | "error">>({});

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from localStorage on mount
    setSpecs(loadSpecs());
    setProfileInput(loadSteamProfileInput());
    setApiKey(loadSteamApiKey());
  }, []);

  useEffect(() => {
    if (!specs) return;
    const platform = resolvePlatform(specs.os);
    for (const g of games) {
      if (results[g.appid]) continue;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- marking each item loading as we kick off its fetch
      setResults((prev) => ({ ...prev, [g.appid]: "loading" }));
      fetch(`/api/game/${g.appid}?platform=${platform}`)
        .then(async (res) => {
          if (!res.ok) throw new Error("failed");
          return (await res.json()) as GameRequirements;
        })
        .then((game) => setResults((prev) => ({ ...prev, [g.appid]: compareSpecs(specs, game) })))
        .catch(() => setResults((prev) => ({ ...prev, [g.appid]: "error" })));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- results is a cache, not a dependency to react to
  }, [specs, games]);

  async function load(source: "wishlist" | "library") {
    setStatus(null);
    setGames([]);
    setResults({});
    setTruncated(false);
    setLoadingSource(source);
    saveSteamProfileInput(profileInput);
    saveSteamApiKey(apiKey);

    try {
      const resolveRes = await fetch(
        `/api/steam/resolve?input=${encodeURIComponent(profileInput)}${apiKey ? `&key=${encodeURIComponent(apiKey)}` : ""}`
      );
      const resolveData = await resolveRes.json();
      if (!resolveRes.ok) throw new Error(resolveData.error ?? "Profil se nepodařilo najít.");
      const steamid = resolveData.steamid as string;

      const listUrl =
        source === "wishlist"
          ? `/api/steam/wishlist?steamid=${steamid}${apiKey ? `&key=${encodeURIComponent(apiKey)}` : ""}`
          : `/api/steam/library?steamid=${steamid}&key=${encodeURIComponent(apiKey)}`;
      const listRes = await fetch(listUrl);
      const listData = await listRes.json();
      if (!listRes.ok) throw new Error(listData.error ?? "Načtení se nepodařilo.");

      const allGames = listData.games as GameEntry[];
      if (allGames.length > MAX_GAMES) setTruncated(true);
      setGames(allGames.slice(0, MAX_GAMES));
      if (allGames.length === 0) setStatus(listData.note ?? "Nic se nenašlo.");
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Něco se pokazilo.");
    } finally {
      setLoadingSource(null);
    }
  }

  if (!specs) {
    return (
      <main className="mx-auto flex max-w-xl flex-col gap-4 px-4 py-10">
        <p>Nejdřív si na hlavní stránce ulož svoje PC specs.</p>
        <Link href="/" className="underline">
          Zpět na domovskou stránku
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-10">
      <Link href="/" className="text-sm underline">
        ← Zpět
      </Link>
      <div>
        <h1 className="text-2xl font-bold">Import ze Steamu</h1>
        <p className="text-black/60 dark:text-white/60">
          Načti si celou wishlist nebo knihovnu a rovnou uvidíš, co všechno na svém PC utáhneš.
        </p>
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-black/10 dark:border-white/15 p-6">
        <label className="flex flex-col gap-1 text-sm">
          Steam profil
          <input
            value={profileInput}
            onChange={(e) => setProfileInput(e.target.value)}
            placeholder="SteamID64, steamcommunity.com/id/... nebo /profiles/..."
            className="rounded-lg border border-black/15 dark:border-white/20 px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Steam Web API klíč (volitelné, potřeba pro vlastní/vanity URL a pro celou knihovnu)
          <input
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="zdarma na steamcommunity.com/dev/apikey"
            className="rounded-lg border border-black/15 dark:border-white/20 px-3 py-2"
          />
          <span className="text-xs text-black/40 dark:text-white/40">Klíč se ukládá jen v tvém prohlížeči, nikam jinam se neposílá.</span>
        </label>

        <div className="flex gap-3">
          <button
            onClick={() => load("wishlist")}
            disabled={loadingSource !== null || !profileInput}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/80 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-white/80"
          >
            {loadingSource === "wishlist" ? "Načítám..." : "Načíst wishlist"}
          </button>
          <button
            onClick={() => load("library")}
            disabled={loadingSource !== null || !profileInput || !apiKey}
            className="rounded-lg border border-black/20 dark:border-white/25 px-4 py-2 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-50"
            title={!apiKey ? "Potřebuje API klíč" : undefined}
          >
            {loadingSource === "library" ? "Načítám..." : "Načíst celou knihovnu"}
          </button>
        </div>

        {status && <p className="text-sm text-black/60 dark:text-white/60">{status}</p>}
        {truncated && (
          <p className="text-xs text-black/40 dark:text-white/40">Zobrazeno prvních {MAX_GAMES}, ať nezahltíme Steam API.</p>
        )}
      </div>

      {games.length > 0 && (
        <ul className="flex flex-col gap-3">
          {games.map((g) => {
            const result = results[g.appid];
            return (
              <li key={g.appid} className="flex flex-col gap-2 rounded-xl border border-black/10 dark:border-white/15 p-4">
                <div className="flex items-center justify-between">
                  <Link href={`/game/${g.appid}`} className="font-medium hover:underline">
                    {g.name ?? `appid ${g.appid}`}
                  </Link>
                  {result && result !== "loading" && result !== "error" && (
                    <VerdictBadge verdict={result.overall} />
                  )}
                </div>
                {result === "loading" && <p className="text-sm text-black/50 dark:text-white/50">Načítám...</p>}
                {result === "error" && <p className="text-sm text-red-600">Nepodařilo se načíst.</p>}
                {result && result !== "loading" && result !== "error" && result.fpsEstimate && (
                  <p className="text-sm text-black/70 dark:text-white/70">{result.fpsEstimate.text}</p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
