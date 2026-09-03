import { scoreCpu, scoreGpu, estimateCpuBaselineGhz, estimateGpuVramGB } from "./hardwareRank";
import { resolvePlatform } from "./platform";
import type { ComparisonResult, ComponentComparison, FpsEstimate, GameRequirements, PcSpecs, Verdict } from "./types";

function combine(min: Verdict, rec: Verdict): Verdict {
  // Meeting recommended => ok. Meeting only minimum => borderline. Below minimum => fail.
  if (min === "unknown") return "unknown";
  if (min === "fail") return "fail";
  if (rec === "ok") return "ok";
  return "borderline";
}

function compareNumeric(label: string, your: number, min?: number, rec?: number): ComponentComparison {
  let verdict: Verdict = "unknown";
  if (min !== undefined) {
    const meetsMin = your >= min;
    const meetsRec = rec !== undefined ? your >= rec : meetsMin;
    verdict = combine(meetsMin ? (meetsRec ? "ok" : "borderline") : "fail", meetsRec ? "ok" : "borderline");
  }
  return {
    label,
    yourValue: `${your} GB`,
    minValue: min !== undefined ? `${min} GB` : undefined,
    recommendedValue: rec !== undefined ? `${rec} GB` : undefined,
    verdict,
  };
}

// Very old games sometimes only say e.g. "DirectX 9.0-compliant video card with Shader
// Model 3.0" instead of naming a GPU model, and point to an external "supported list" that
// isn't part of Steam's structured data (just a link on the developer's own site) — we can't
// fetch that. But that bar is so low that essentially any named GPU clears it.
const GENERIC_LOW_BAR_GPU = /shader model|directx\s*9|directx\s*10\b/i;

// "2.4 GHz or equivalent" style requirements, with no model name to score.
function meetsClockSpeedRequirement(yourName: string, requirementText: string): boolean | null {
  const match = requirementText.match(/(\d+(?:[.,]\d+)?)\s*-?\s*ghz/i);
  if (!match) return null;
  const requiredGhz = parseFloat(match[1].replace(",", "."));
  const baseline = estimateCpuBaselineGhz(yourName);
  if (baseline === null) return null;
  return baseline >= requiredGhz - 0.15; // small tolerance, this is a rough guess either way
}

// "2 GB VRAM" / "512 MB video memory" style requirements, with no model name to score.
function extractRequiredVramGB(text: string): number | null {
  const patterns = [
    /(\d+(?:\.\d+)?)\s*(GB|MB)\b[^.\n]{0,30}(?:VRAM|video memory|graphics memory|video RAM)/i,
    /(?:VRAM|video memory|graphics memory|video RAM)[^.\n]{0,30}?(\d+(?:\.\d+)?)\s*(GB|MB)\b/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const value = parseFloat(match[1]);
      return match[2].toUpperCase() === "MB" ? value / 1024 : value;
    }
  }
  return null;
}

function meetsVramRequirement(yourName: string, requirementText: string): boolean | null {
  const requiredGB = extractRequiredVramGB(requirementText);
  if (requiredGB === null) return null;
  const baseline = estimateGpuVramGB(yourName);
  if (baseline === null) return null;
  return baseline >= requiredGB;
}

function compareScored(
  label: string,
  yourName: string,
  minName: string | undefined,
  recName: string | undefined,
  scoreFn: (name: string) => number | null,
  estimateFn?: (yourName: string, text: string) => boolean | null
): ComponentComparison {
  const yourScore = scoreFn(yourName);
  const minScore = minName ? scoreFn(minName) : null;
  const recScore = recName ? scoreFn(recName) : null;

  let verdict: Verdict = "unknown";
  let note: string | undefined;

  if (yourScore === null) {
    note = "Nepodařilo se rozpoznat model — porovnej ručně podle textu.";
  } else if (minScore === null) {
    if (minName && GENERIC_LOW_BAR_GPU.test(minName)) {
      verdict = "ok";
      note =
        "Hra jen vyžaduje starou obecnou podporu DirectX/Shader Model (bez konkrétního modelu) — tvoje grafika ji bez problémů splňuje. Ten \"supported list\" v požadavcích je jen odkaz na stránku výrobce hry, Steam ho v datech nemá.";
    } else {
      const meetsMin = minName && estimateFn ? estimateFn(yourName, minName) : null;

      if (meetsMin !== null) {
        let meetsRec = meetsMin;
        if (recName) {
          if (recScore !== null) meetsRec = yourScore >= recScore;
          else if (estimateFn) {
            const recResult = estimateFn(yourName, recName);
            if (recResult !== null) meetsRec = recResult;
          }
        }
        verdict = meetsMin ? (meetsRec ? "ok" : "borderline") : "fail";
        note = "Přesný model hra neuvádí, jen obecný parametr — tohle je odhad podle typických hodnot tvé komponenty, ne jistota.";
      } else {
        note = "Hra neuvádí rozpoznatelný model — porovnej ručně podle textu.";
      }
    }
  } else {
    const meetsMin = yourScore >= minScore;
    const meetsRec = recScore !== null ? yourScore >= recScore : meetsMin;
    verdict = meetsMin ? (meetsRec ? "ok" : "borderline") : "fail";
  }

  return {
    label,
    yourValue: yourName,
    minValue: minName,
    recommendedValue: recName,
    verdict,
    note,
  };
}

function compareOs(specs: PcSpecs, game: GameRequirements): ComponentComparison | null {
  if (!game.platforms) return null;

  const platform = resolvePlatform(specs.os);
  const supported = game.platforms[platform];
  const platformLabel = { windows: "Windows", mac: "macOS", linux: "Linux" }[platform];

  return {
    label: "Operační systém",
    yourValue: specs.os,
    minValue: undefined,
    recommendedValue: undefined,
    verdict: supported ? "ok" : "fail",
    note: supported
      ? undefined
      : `Hra podle Steamu nemá ${platformLabel} verzi — na tvém OS se pravděpodobně vůbec nespustí (leda přes emulaci/Proton).`,
  };
}

// Rough FPS ballpark from the overall verdict plus how far CPU/GPU sit above the recommended
// bar. This is explicitly a vibe check, not a benchmark — Steam requirements themselves are
// rarely precise, and our own CPU/GPU scores are ordinal tiers, not real performance numbers.
function estimateFps(overall: Verdict, specs: PcSpecs, game: GameRequirements): FpsEstimate | undefined {
  if (overall === "unknown") return undefined;

  if (overall === "fail") {
    return {
      tier: "unplayable",
      text: "Nehratelné — nesplňuješ ani minimální požadavky.",
    };
  }

  if (overall === "borderline") {
    return {
      tier: "low",
      text: "~30 FPS — splňuješ jen minimum.",
    };
  }

  const gpuScore = scoreGpu(specs.gpu);
  const gpuRecScore = game.recommended?.gpu ? scoreGpu(game.recommended.gpu) : null;
  const cpuScore = scoreCpu(specs.cpu);
  const cpuRecScore = game.recommended?.cpu ? scoreCpu(game.recommended.cpu) : null;

  const gpuMargin = gpuScore !== null && gpuRecScore !== null ? gpuScore - gpuRecScore : null;
  const cpuMargin = cpuScore !== null && cpuRecScore !== null ? cpuScore - cpuRecScore : null;
  const margin = gpuMargin ?? cpuMargin;

  if (margin !== null && margin >= 800) {
    return {
      tier: "high",
      text: "60–120+ FPS — přesahuješ doporučené požadavky.",
    };
  }

  return {
    tier: "mid",
    text: "~60 FPS — splňuješ doporučené požadavky.",
  };
}

export function compareSpecs(specs: PcSpecs, game: GameRequirements): ComparisonResult {
  const components: ComponentComparison[] = [];

  // Not shown as its own card - you already picked your OS in your specs, and it's used to
  // fetch the right platform's requirements in the first place. It only needs to surface when
  // it actually blocks you: the game doesn't ship for your OS at all.
  const osComponent = compareOs(specs, game);

  components.push(
    compareScored(
      "Procesor (CPU)",
      specs.cpu,
      game.minimum?.cpu,
      game.recommended?.cpu,
      scoreCpu,
      meetsClockSpeedRequirement
    )
  );
  components.push(
    compareScored(
      "Grafika (GPU)",
      specs.gpu,
      game.minimum?.gpu,
      game.recommended?.gpu,
      scoreGpu,
      meetsVramRequirement
    )
  );
  components.push(
    compareNumeric("Paměť (RAM)", specs.ramGB, game.minimum?.ramGB, game.recommended?.ramGB)
  );
  components.push(
    compareNumeric("Volné místo na disku", specs.storageFreeGB, game.minimum?.storageGB, game.recommended?.storageGB)
  );

  const known = components.filter((c) => c.verdict !== "unknown");
  const failCount = known.filter((c) => c.verdict === "fail").length;
  const borderlineCount = known.filter((c) => c.verdict === "borderline").length;

  let overall: Verdict;
  let overallText: string;

  if (known.length === 0) {
    overall = "unknown";
    overallText =
      "Nepodařilo se automaticky rozpoznat dost komponent na spolehlivé vyhodnocení. Porovnej si specs ručně v tabulce níže.";
  } else if (failCount > 0) {
    overall = "fail";
    overallText =
      failCount === 1
        ? "Jedna komponenta nesplňuje ani minimální požadavky — hra pravděpodobně nepůjde spustit, nebo poběží velmi špatně."
        : "Víc komponent nesplňuje ani minimální požadavky — hra se nejspíš vůbec nespustí, nebo poběží nehratelně.";
  } else if (borderlineCount > 0) {
    overall = "borderline";
    overallText =
      "Splňuješ minimální požadavky, ale ne doporučené. Hra by měla jít spustit, ale čekej nižší detaily a/nebo nižší FPS.";
  } else {
    overall = "ok";
    overallText = "Splňuješ doporučené požadavky na všech rozpoznaných komponentách — hra by měla jet plynule na vyšší nastavení.";
  }

  if (osComponent?.verdict === "fail") {
    overall = "fail";
    overallText = osComponent.note ?? "Hra na tvém operačním systému podle Steamu neběží.";
  }

  return { components, overall, overallText, fpsEstimate: estimateFps(overall, specs, game) };
}
