"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { PcSpecs, GameRequirements, ComparisonResult } from "@/lib/types";
import { loadSpecs } from "@/lib/specsStorage";
import { compareSpecs } from "@/lib/compare";
import { resolvePlatform } from "@/lib/platform";
import { loadCompareList, addToCompareList, removeFromCompareList, type CompareListEntry } from "@/lib/compareListStorage";
import GameSearch from "@/components/GameSearch";
import VerdictBadge from "@/components/VerdictBadge";

export default function ComparePage() {
  const [specs, setSpecs] = useState<PcSpecs | null>(null);
  const [list, setList] = useState<CompareListEntry[]>([]);
  const [results, setResults] = useState<Record<string, ComparisonResult | "loading" | "error">>({});

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from localStorage on mount
    setSpecs(loadSpecs());
    setList(loadCompareList());
  }, []);

  useEffect(() => {
    if (!specs) return;
    const platform = resolvePlatform(specs.os);

    for (const entry of list) {
      if (results[entry.appid]) continue;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- marking each item loading as we kick off its fetch
      setResults((prev) => ({ ...prev, [entry.appid]: "loading" }));
      fetch(`/api/game/${entry.appid}?platform=${platform}`)
        .then(async (res) => {
          if (!res.ok) throw new Error("failed");
          return (await res.json()) as GameRequirements;
        })
        .then((game) => setResults((prev) => ({ ...prev, [entry.appid]: compareSpecs(specs, game) })))
        .catch(() => setResults((prev) => ({ ...prev, [entry.appid]: "error" })));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- results is a cache, not a dependency to react to
  }, [specs, list]);

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
        <h1 className="text-2xl font-bold">Porovnání víc her</h1>
        <p className="text-black/60 dark:text-white/60">Přidej hry, co tě zajímají, a uvidíš je vedle sebe.</p>
      </div>

      <GameSearch
        placeholder="Přidat hru do porovnání..."
        onSelect={(g) => setList(addToCompareList({ appid: g.appid, name: g.name }))}
      />

      {list.length === 0 ? (
        <p className="text-sm text-black/50 dark:text-white/50">Zatím žádné hry k porovnání.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {list.map((entry) => {
            const result = results[entry.appid];
            return (
              <li key={entry.appid} className="flex flex-col gap-2 rounded-xl border border-black/10 dark:border-white/15 p-4">
                <div className="flex items-center justify-between">
                  <Link href={`/game/${entry.appid}`} className="font-medium hover:underline">
                    {entry.name}
                  </Link>
                  <div className="flex items-center gap-3">
                    {result && result !== "loading" && result !== "error" && (
                      <VerdictBadge verdict={result.overall} />
                    )}
                    <button
                      onClick={() => setList(removeFromCompareList(entry.appid))}
                      className="text-sm text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white"
                      aria-label={`Odebrat ${entry.name}`}
                    >
                      ✕
                    </button>
                  </div>
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
