"use client";

import { useState } from "react";
import type { PcSpecs } from "@/lib/types";
import { saveSpecs } from "@/lib/specsStorage";

const EMPTY: PcSpecs = { cpu: "", gpu: "", ramGB: 8, storageFreeGB: 50, os: "Windows 11" };

export default function SpecsForm({
  initial,
  onSaved,
}: {
  initial: PcSpecs | null;
  onSaved: (specs: PcSpecs) => void;
}) {
  const [specs, setSpecs] = useState<PcSpecs>(initial ?? EMPTY);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    saveSpecs(specs);
    onSaved(specs);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl border border-black/10 p-6">
      <h2 className="text-lg font-semibold">Tvoje PC specs</h2>

      <label className="flex flex-col gap-1 text-sm">
        Procesor (CPU)
        <input
          required
          value={specs.cpu}
          onChange={(e) => setSpecs({ ...specs, cpu: e.target.value })}
          placeholder="např. Intel Core i5-10400"
          className="rounded-lg border border-black/15 px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Grafika (GPU)
        <input
          required
          value={specs.gpu}
          onChange={(e) => setSpecs({ ...specs, gpu: e.target.value })}
          placeholder="např. NVIDIA RTX 3060"
          className="rounded-lg border border-black/15 px-3 py-2"
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-sm">
          RAM (GB)
          <input
            required
            type="number"
            min={1}
            value={specs.ramGB}
            onChange={(e) => setSpecs({ ...specs, ramGB: Number(e.target.value) })}
            className="rounded-lg border border-black/15 px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Volné místo na disku (GB)
          <input
            required
            type="number"
            min={0}
            value={specs.storageFreeGB}
            onChange={(e) => setSpecs({ ...specs, storageFreeGB: Number(e.target.value) })}
            className="rounded-lg border border-black/15 px-3 py-2"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        Operační systém
        <input
          value={specs.os}
          onChange={(e) => setSpecs({ ...specs, os: e.target.value })}
          className="rounded-lg border border-black/15 px-3 py-2"
        />
      </label>

      <button
        type="submit"
        className="mt-2 rounded-lg bg-black px-4 py-2 font-medium text-white hover:bg-black/80"
      >
        Uložit specs
      </button>
    </form>
  );
}
