"use client";

import { useState } from "react";
import type { PcSpecs } from "@/lib/types";
import { saveSpecs } from "@/lib/specsStorage";
import { CPU_OPTIONS, GPU_OPTIONS, RAM_OPTIONS_GB, OS_OPTIONS, PC_PRESETS } from "@/lib/hardwareOptions";

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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl border border-black/10 dark:border-white/15 p-6">
      <h2 className="text-lg font-semibold">Tvoje PC specs</h2>

      <label className="flex flex-col gap-1 text-sm">
        Rychlá volba: hotové PC (volitelné)
        <select
          defaultValue=""
          onChange={(e) => {
            const preset = PC_PRESETS.find((p) => p.id === e.target.value);
            if (preset) setSpecs({ ...specs, cpu: preset.cpu, gpu: preset.gpu, ramGB: preset.ramGB });
          }}
          className="rounded-lg border border-black/15 dark:border-white/20 px-3 py-2 transition-colors focus:border-black/40 dark:focus:border-white/40"
        >
          <option value="">-- vybrat ručně po komponentách níže --</option>
          {PC_PRESETS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
        <span className="text-xs text-black/40 dark:text-white/40">
          Orientační sestavy podle typu PC, ne konkrétní modely z obchodu — pole níže si pak můžeš doladit.
        </span>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Procesor (CPU)
        <input
          required
          list="cpu-options"
          value={specs.cpu}
          onChange={(e) => setSpecs({ ...specs, cpu: e.target.value })}
          placeholder="začni psát nebo vyber ze seznamu, např. Intel Core i5-10400"
          className="rounded-lg border border-black/15 dark:border-white/20 px-3 py-2 transition-colors focus:border-black/40 dark:focus:border-white/40"
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
          className="rounded-lg border border-black/15 dark:border-white/20 px-3 py-2 transition-colors focus:border-black/40 dark:focus:border-white/40"
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
            className="rounded-lg border border-black/15 dark:border-white/20 px-3 py-2 transition-colors focus:border-black/40 dark:focus:border-white/40"
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
            className="rounded-lg border border-black/15 dark:border-white/20 px-3 py-2 transition-colors focus:border-black/40 dark:focus:border-white/40"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        Operační systém
        <select
          value={specs.os}
          onChange={(e) => setSpecs({ ...specs, os: e.target.value })}
          className="rounded-lg border border-black/15 dark:border-white/20 px-3 py-2 transition-colors focus:border-black/40 dark:focus:border-white/40"
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
        className="mt-2 rounded-lg bg-black px-4 py-2 font-medium text-white transition-all hover:bg-black/80 active:scale-[0.98] dark:bg-white dark:text-black dark:hover:bg-white/80"
      >
        Uložit specs
      </button>
    </form>
  );
}
