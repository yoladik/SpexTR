"use client";

import { useState } from "react";
import type { PcSpecs } from "@/lib/types";
import { saveSpecs } from "@/lib/specsStorage";
import { CPU_OPTIONS, GPU_OPTIONS, RAM_OPTIONS_GB, OS_OPTIONS } from "@/lib/hardwareOptions";

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
          list="cpu-options"
          value={specs.cpu}
          onChange={(e) => setSpecs({ ...specs, cpu: e.target.value })}
          placeholder="začni psát nebo vyber ze seznamu, např. Intel Core i5-10400"
          className="rounded-lg border border-black/15 px-3 py-2"
        />
        <datalist id="cpu-options">
          {CPU_OPTIONS.map((cpu) => (
            <option key={cpu} value={cpu} />
          ))}
        </datalist>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Grafika (GPU)
        <input
          required
          list="gpu-options"
          value={specs.gpu}
          onChange={(e) => setSpecs({ ...specs, gpu: e.target.value })}
          placeholder="začni psát nebo vyber ze seznamu, např. NVIDIA RTX 3060"
          className="rounded-lg border border-black/15 px-3 py-2"
        />
        <datalist id="gpu-options">
          {GPU_OPTIONS.map((gpu) => (
            <option key={gpu} value={gpu} />
          ))}
        </datalist>
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-sm">
          RAM (GB)
          <select
            required
            value={specs.ramGB}
            onChange={(e) => setSpecs({ ...specs, ramGB: Number(e.target.value) })}
            className="rounded-lg border border-black/15 px-3 py-2"
          >
            {RAM_OPTIONS_GB.map((gb) => (
              <option key={gb} value={gb}>
                {gb} GB
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Volné místo na disku (GB)
          <input
            required
            type="number"
            min={0}
            value={specs.storageFreeGB}
            onChange={(e) => setSpecs({ ...specs, storageFreeGB: Number(e.target.value) })}
            onFocus={(e) => e.target.select()}
            className="rounded-lg border border-black/15 px-3 py-2"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        Operační systém
        <select
          value={specs.os}
          onChange={(e) => setSpecs({ ...specs, os: e.target.value })}
          className="rounded-lg border border-black/15 px-3 py-2"
        >
          {OS_OPTIONS.map((os) => (
            <option key={os} value={os}>
              {os}
            </option>
          ))}
        </select>
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
