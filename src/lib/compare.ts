import { scoreCpu, scoreGpu } from "./hardwareRank";
import type { ComparisonResult, ComponentComparison, GameRequirements, PcSpecs, Verdict } from "./types";

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

function compareScored(
  label: string,
  yourName: string,
  minName: string | undefined,
  recName: string | undefined,
  scoreFn: (name: string) => number | null
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
      note = "Hra neuvádí rozpoznatelný model — porovnej ručně podle textu.";
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

export function compareSpecs(specs: PcSpecs, game: GameRequirements): ComparisonResult {
  const components: ComponentComparison[] = [];

  components.push(
    compareScored("Procesor (CPU)", specs.cpu, game.minimum?.cpu, game.recommended?.cpu, scoreCpu)
  );
  components.push(
    compareScored("Grafika (GPU)", specs.gpu, game.minimum?.gpu, game.recommended?.gpu, scoreGpu)
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

  return { components, overall, overallText };
}
