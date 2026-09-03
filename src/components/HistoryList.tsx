"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { HistoryEntry } from "@/lib/historyStorage";
import { loadHistory } from "@/lib/historyStorage";
import VerdictBadge from "./VerdictBadge";

export default function HistoryList() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from localStorage on mount
    setHistory(loadHistory());
  }, []);

  if (history.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-black/10 dark:border-white/15 p-6">
      <h2 className="text-lg font-semibold">Poslední kontroly</h2>
      <ul className="flex flex-col divide-y divide-black/10 dark:divide-white/15">
        {history.map((h) => (
          <li key={h.appid}>
            <Link
              href={`/game/${h.appid}`}
              className="flex items-center justify-between gap-3 py-2 hover:bg-black/5 dark:hover:bg-white/10"
            >
              <span className="text-sm">{h.name}</span>
              <VerdictBadge verdict={h.overall} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
