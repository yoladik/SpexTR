"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { PcSpecs } from "@/lib/types";
import { loadSpecs } from "@/lib/specsStorage";
import SpecsForm from "@/components/SpecsForm";
import GameSearch from "@/components/GameSearch";
import HistoryList from "@/components/HistoryList";

export default function Home() {
  const [specs, setSpecs] = useState<PcSpecs | null>(null);
  const [editing, setEditing] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from localStorage on mount
    setSpecs(loadSpecs());
    setReady(true);
  }, []);

  if (!ready) return null;

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-bold">SpexTR</h1>
        <p className="text-black/60 dark:text-white/60">Zjisti, jestli tvůj počítač utáhne hru, kterou chceš hrát.</p>
      </div>

      {!specs || editing ? (
        <SpecsForm
          initial={specs}
          onSaved={(s) => {
            setSpecs(s);
            setEditing(false);
          }}
        />
      ) : (
        <div className="flex flex-col gap-2 rounded-xl border border-black/10 dark:border-white/15 p-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Tvoje PC specs</h2>
            <button onClick={() => setEditing(true)} className="text-sm underline transition-opacity hover:opacity-70">
              Upravit
            </button>
          </div>
          <p className="text-sm">CPU: {specs.cpu}</p>
          <p className="text-sm">GPU: {specs.gpu}</p>
          <p className="text-sm">RAM: {specs.ramGB} GB</p>
          <p className="text-sm">Volné místo: {specs.storageFreeGB} GB</p>
          <p className="text-sm">OS: {specs.os}</p>
        </div>
      )}

      {specs && !editing && (
        <>
          <GameSearch />

          <div className="flex gap-4 text-sm">
            <Link href="/compare" className="underline">
              Porovnat víc her
            </Link>
            <Link href="/library" className="underline">
              Import ze Steamu (wishlist/knihovna)
            </Link>
          </div>

          <HistoryList />
        </>
      )}
    </main>
  );
}
