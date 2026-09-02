"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import type { GameRequirements, PcSpecs, ComparisonResult } from "@/lib/types";
import { loadSpecs } from "@/lib/specsStorage";
import { compareSpecs } from "@/lib/compare";
import VerdictBadge from "@/components/VerdictBadge";

export default function GamePage({ params }: { params: Promise<{ appid: string }> }) {
  const { appid } = use(params);
  const [game, setGame] = useState<GameRequirements | null>(null);
  const [specs, setSpecs] = useState<PcSpecs | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from localStorage on mount
    setSpecs(loadSpecs());
    fetch(`/api/game/${appid}`)
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json()).error ?? "Chyba");
        return res.json();
      })
      .then(setGame)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [appid]);

  if (loading) return <main className="mx-auto max-w-xl px-4 py-10">Načítám...</main>;

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

      <div className="flex flex-col gap-3 rounded-xl border border-black/10 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Celkové zhodnocení</h2>
          <VerdictBadge verdict={result.overall} />
        </div>
        <p className="text-sm text-black/70">{result.overallText}</p>
      </div>

      <div className="flex flex-col gap-4">
        {result.components.map((c) => (
          <div key={c.label} className="flex flex-col gap-2 rounded-xl border border-black/10 p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{c.label}</h3>
              <VerdictBadge verdict={c.verdict} />
            </div>
            <p className="text-sm">
              <span className="text-black/50">Ty:</span> {c.yourValue}
            </p>
            {c.minValue && (
              <p className="text-sm">
                <span className="text-black/50">Minimum:</span> {c.minValue}
              </p>
            )}
            {c.recommendedValue && (
              <p className="text-sm">
                <span className="text-black/50">Doporučeno:</span> {c.recommendedValue}
              </p>
            )}
            {c.note && <p className="text-xs text-black/40">{c.note}</p>}
          </div>
        ))}
      </div>

      {(!game.minimum && !game.recommended) && (
        <p className="text-sm text-black/50">Tahle hra na Steamu neuvádí systémové požadavky.</p>
      )}
    </main>
  );
}
