"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface SearchResult {
  appid: string;
  name: string;
  icon?: string;
}

export default function GameSearch({
  onSelect,
  placeholder = "např. cyberpunk, call of...",
}: {
  onSelect?: (game: SearchResult) => void;
  placeholder?: string;
}) {
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (term.trim().length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clearing stale results when input shrinks
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?term=${encodeURIComponent(term)}`);
        const data = await res.json();
        setResults(data.results ?? []);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [term]);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-black/10 dark:border-white/15 p-6">
      <h2 className="text-lg font-semibold">Najdi hru</h2>
      <input
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder={placeholder}
        className="rounded-lg border border-black/15 dark:border-white/20 px-3 py-2"
      />
      {loading && <p className="text-sm text-black/50 dark:text-white/50">Hledám...</p>}
      {results.length > 0 && (
        <ul className="flex flex-col divide-y divide-black/10 dark:divide-white/15">
          {results.map((r) => (
            <li key={r.appid}>
              <button
                onClick={() => (onSelect ? onSelect(r) : router.push(`/game/${r.appid}`))}
                className="flex w-full items-center gap-3 py-2 text-left hover:bg-black/5 dark:hover:bg-white/10"
              >
                {r.icon && (
                  // eslint-disable-next-line @next/next/no-img-element -- external Steam CDN image, domain varies per game
                  <img src={r.icon} alt="" className="h-8 w-14 rounded object-cover" />
                )}
                <span>{r.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
