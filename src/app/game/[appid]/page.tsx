"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import type { GameRequirements, PcSpecs, ComparisonResult } from "@/lib/types";
import { loadSpecs } from "@/lib/specsStorage";
import { compareSpecs } from "@/lib/compare";
import { resolvePlatform } from "@/lib/platform";
import { addHistoryEntry } from "@/lib/historyStorage";
import VerdictBadge, { verdictLabel, verdictBoxClassName } from "@/components/VerdictBadge";

function splitAlternatives(value?: string): string[] {
  if (!value) return ["—"];
  return value
    .split(/\s*\/\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function GamePage({ params }: { params: Promise<{ appid: string }> }) {
  const { appid } = use(params);
  const [game, setGame] = useState<GameRequirements | null>(null);
  const [specs, setSpecs] = useState<PcSpecs | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadedSpecs = loadSpecs();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from localStorage on mount
    setSpecs(loadedSpecs);
    const platform = resolvePlatform(loadedSpecs?.os ?? "Windows 11");
    fetch(`/api/game/${appid}?platform=${platform}`)
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json()).error ?? "Chyba");
        return res.json();
      })
      .then(setGame)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [appid]);

  useEffect(() => {
    if (!game || !specs) return;
    const result = compareSpecs(specs, game);
    addHistoryEntry({
      appid: game.appid,
      name: game.name,
      headerImage: game.headerImage,
      overall: result.overall,
      checkedAt: Date.now(),
    });
  }, [game, specs]);

  if (loading)
    return <main className="mx-auto max-w-xl px-4 py-10 animate-pulse">Načítám...</main>;

  if (error) {
    return (
      <main className="mx-auto flex max-w-xl flex-col gap-4 px-4 py-10">
        <p className="text-red-600">Chyba: {error}</p>
        <Link href="/" className="underline">
          Zpět
        </Link>
      </main>
    );
  }

  if (!specs) {
    return (
      <main className="mx-auto flex max-w-xl flex-col gap-4 px-4 py-10">
        <p>Nejdřív si musíš uložit svoje PC specs.</p>
        <Link href="/" className="underline">
          Zpět na domovskou stránku
        </Link>
      </main>
    );
  }

  if (!game) return null;

  const result: ComparisonResult = compareSpecs(specs, game);

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-10">
      <Link href="/" className="text-sm underline">
        ← Zpět
      </Link>

      {game.headerImage && (
        // eslint-disable-next-line @next/next/no-img-element -- external Steam CDN image, domain varies per game
        <img src={game.headerImage} alt={game.name} className="w-full rounded-xl object-cover" />
      )}
      <h1 className="text-2xl font-bold">{game.name}</h1>

      <div className="flex flex-col gap-3 rounded-xl border border-black/10 dark:border-white/15 p-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Celkové zhodnocení</h2>
          <VerdictBadge verdict={result.overall} />
        </div>
        <p className="text-sm font-medium">
          {result.fpsEstimate ? result.fpsEstimate.text : result.overallText}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {result.components.map((c, i) => (
          <div
            key={c.label}
            style={{ animationDelay: `${60 + i * 60}ms` }}
            className="flex flex-col gap-3 rounded-xl border border-black/10 dark:border-white/15 p-4 animate-fade-in"
          >
            <h3 className="text-center text-xl font-semibold">{c.label}</h3>

            <div className={`flex flex-col items-center gap-1 rounded-lg border p-3 text-center ${verdictBoxClassName(c.verdict)}`}>
              <p className="text-lg font-semibold">{verdictLabel(c.verdict)}</p>
              {splitAlternatives(c.yourValue).map((line, i) => (
                <p key={i} className="text-sm opacity-70">
                  {line}
                </p>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1 rounded-lg border border-black/10 dark:border-white/15 p-3">
                <p className="text-xs text-black/50 dark:text-white/50">Minimum</p>
                {splitAlternatives(c.minValue).map((line, i) => (
                  <p key={i} className="text-sm">
                    {line}
                  </p>
                ))}
              </div>
              <div className="flex flex-col gap-1 rounded-lg border border-black/10 dark:border-white/15 p-3">
                <p className="text-xs text-black/50 dark:text-white/50">Doporučeno</p>
                {splitAlternatives(c.recommendedValue).map((line, i) => (
                  <p key={i} className="text-sm">
                    {line}
                  </p>
                ))}
              </div>
            </div>

            {c.note && <p className="text-xs text-black/40 dark:text-white/40">{c.note}</p>}
          </div>
        ))}
      </div>

      {(!game.minimum && !game.recommended) && (
        <p className="text-sm text-black/50 dark:text-white/50">Tahle hra na Steamu neuvádí systémové požadavky.</p>
      )}
    </main>
  );
}
