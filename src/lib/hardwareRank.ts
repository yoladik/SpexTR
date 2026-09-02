/**
 * Rough, orientation-only performance scoring for CPUs and GPUs.
 * Not a real benchmark database — just enough to rank "is A faster than B"
 * for the common families people actually have. Higher score = faster.
 */

export function scoreCpu(name: string): number | null {
  const s = name.toUpperCase();

  // Intel Core (i3/i5/i7/i9), old-style "i5-10400" or "i7 12700K"
  const intelMatch = s.match(/I([3579])[\s-]?(\d{3,5})/);
  if (intelMatch) {
    const tier = parseInt(intelMatch[1], 10); // 3,5,7,9
    const modelNum = intelMatch[2];
    const gen = modelNum.length >= 4 ? parseInt(modelNum.slice(0, -3), 10) : parseInt(modelNum[0], 10);
    return tier * 1000 + gen * 10;
  }

  // AMD Ryzen (3/5/7/9), e.g. "RYZEN 5 5600X"
  const ryzenMatch = s.match(/RYZEN\s?([3579])\s?(\d{3,5})/);
  if (ryzenMatch) {
    const tier = parseInt(ryzenMatch[1], 10);
    const modelNum = ryzenMatch[2];
    const gen = parseInt(modelNum[0], 10);
    return tier * 1000 + gen * 10;
  }

  // Older/low-end families
  if (/CELERON|PENTIUM/.test(s)) return 500;
  if (/ATHLON/.test(s)) return 700;
  if (/CORE\s?2\s?DUO/.test(s)) return 1500;
  if (/\bFX[\s-]?\d{4}/.test(s)) return 3500;

  // Apple Silicon (rough placement)
  if (/M[1234]\s?(PRO|MAX|ULTRA)?/.test(s)) return 7000;

  return null;
}

// Some (usually older) games only state a bare clock speed ("2.4 GHz or equivalent") instead of
// naming a CPU model. We can't score that against scoreCpu, but we can guess whether a
// recognized CPU family typically clocks at or above that speed. This is a rough estimate on
// purpose — different eras/architectures at the "same" GHz perform very differently — it's only
// meant to turn "cannot determine" into "probably yes/no" for these generic requirements.
const CPU_FAMILY_BASELINE_GHZ: Array<{ pattern: RegExp; ghz: number }> = [
  { pattern: /RYZEN\s?[3579]/, ghz: 3.4 },
  { pattern: /I[3579][\s-]?\d{3,5}/, ghz: 3.2 },
  { pattern: /\bFX[\s-]?\d{4}/, ghz: 3.6 },
  { pattern: /ATHLON/, ghz: 3.0 },
  { pattern: /CORE\s?2\s?DUO/, ghz: 2.6 },
  { pattern: /CELERON|PENTIUM/, ghz: 2.8 },
  { pattern: /M[1234]\s?(PRO|MAX|ULTRA)?/, ghz: 3.5 },
];

export function estimateCpuBaselineGhz(name: string): number | null {
  const s = name.toUpperCase();
  for (const { pattern, ghz } of CPU_FAMILY_BASELINE_GHZ) {
    if (pattern.test(s)) return ghz;
  }
  return null;
}

// Best-effort typical VRAM (GB) per GPU model, used to guess pass/fail when a game states a bare
// VRAM requirement ("2 GB VRAM") instead of naming a GPU. Ordered most-specific pattern first
// since e.g. "RTX 4070 Ti Super" must not be caught by the plain "RTX 4070" rule below it.
// Where a model shipped in multiple VRAM sizes, this picks the smaller/base one (conservative).
const GPU_VRAM_TABLE: Array<{ pattern: RegExp; gb: number }> = [
  { pattern: /GTX\s?1060\s?3\s?GB/, gb: 3 },
  { pattern: /GT\s?1030/, gb: 2 },
  { pattern: /GTX\s?1050\s?TI/, gb: 4 },
  { pattern: /GTX\s?1050/, gb: 2 },
  { pattern: /GTX\s?1060/, gb: 6 },
  { pattern: /GTX\s?1070\s?TI/, gb: 8 },
  { pattern: /GTX\s?1070/, gb: 8 },
  { pattern: /GTX\s?1080\s?TI/, gb: 11 },
  { pattern: /GTX\s?1080/, gb: 8 },
  { pattern: /GTX\s?1650\s?SUPER/, gb: 4 },
  { pattern: /GTX\s?1650/, gb: 4 },
  { pattern: /GTX\s?1660\s?(SUPER|TI)/, gb: 6 },
  { pattern: /GTX\s?1660/, gb: 6 },
  { pattern: /RTX\s?2060\s?SUPER/, gb: 8 },
  { pattern: /RTX\s?2060/, gb: 6 },
  { pattern: /RTX\s?2070\s?SUPER/, gb: 8 },
  { pattern: /RTX\s?2070/, gb: 8 },
  { pattern: /RTX\s?2080\s?TI/, gb: 11 },
  { pattern: /RTX\s?2080/, gb: 8 },
  { pattern: /RTX\s?3050/, gb: 8 },
  { pattern: /RTX\s?3060\s?TI/, gb: 8 },
  { pattern: /RTX\s?3060/, gb: 12 },
  { pattern: /RTX\s?3070\s?TI/, gb: 8 },
  { pattern: /RTX\s?3070/, gb: 8 },
  { pattern: /RTX\s?3080\s?TI/, gb: 12 },
  { pattern: /RTX\s?3080/, gb: 10 },
  { pattern: /RTX\s?3090\s?TI/, gb: 24 },
  { pattern: /RTX\s?3090/, gb: 24 },
  { pattern: /RTX\s?4060\s?TI/, gb: 8 },
  { pattern: /RTX\s?4060/, gb: 8 },
  { pattern: /RTX\s?4070\s?TI\s?SUPER/, gb: 16 },
  { pattern: /RTX\s?4070\s?TI/, gb: 12 },
  { pattern: /RTX\s?4070\s?SUPER/, gb: 12 },
  { pattern: /RTX\s?4070/, gb: 12 },
  { pattern: /RTX\s?4080\s?SUPER/, gb: 16 },
  { pattern: /RTX\s?4080/, gb: 16 },
  { pattern: /RTX\s?4090/, gb: 24 },
  { pattern: /RTX\s?5060/, gb: 8 },
  { pattern: /RTX\s?5070\s?TI/, gb: 16 },
  { pattern: /RTX\s?5070/, gb: 12 },
  { pattern: /RTX\s?5080/, gb: 16 },
  { pattern: /RTX\s?5090/, gb: 32 },
  { pattern: /RX\s?570/, gb: 4 },
  { pattern: /RX\s?580/, gb: 8 },
  { pattern: /RX\s?590/, gb: 8 },
  { pattern: /RX\s?5500\s?XT/, gb: 8 },
  { pattern: /RX\s?5600\s?XT/, gb: 6 },
  { pattern: /RX\s?5700\s?XT/, gb: 8 },
  { pattern: /RX\s?5700/, gb: 8 },
  { pattern: /RX\s?6600\s?XT/, gb: 8 },
  { pattern: /RX\s?6600/, gb: 8 },
  { pattern: /RX\s?6650\s?XT/, gb: 8 },
  { pattern: /RX\s?6700\s?XT/, gb: 12 },
  { pattern: /RX\s?6750\s?XT/, gb: 12 },
  { pattern: /RX\s?6800\s?XT/, gb: 16 },
  { pattern: /RX\s?6800/, gb: 16 },
  { pattern: /RX\s?6900\s?XT/, gb: 16 },
  { pattern: /RX\s?6950\s?XT/, gb: 16 },
  { pattern: /RX\s?7600/, gb: 8 },
  { pattern: /RX\s?7700\s?XT/, gb: 12 },
  { pattern: /RX\s?7800\s?XT/, gb: 16 },
  { pattern: /RX\s?7900\s?GRE/, gb: 16 },
  { pattern: /RX\s?7900\s?XTX/, gb: 24 },
  { pattern: /RX\s?7900\s?XT/, gb: 20 },
  { pattern: /ARC\s?A380/, gb: 6 },
  { pattern: /ARC\s?A750/, gb: 8 },
  { pattern: /ARC\s?A770/, gb: 8 },
  { pattern: /ARC\s?B580/, gb: 12 },
  { pattern: /UHD|IRIS|VEGA\s?(3|6|8|11)\b/, gb: 1 },
];

export function estimateGpuVramGB(name: string): number | null {
  const s = name.toUpperCase();
  for (const { pattern, gb } of GPU_VRAM_TABLE) {
    if (pattern.test(s)) return gb;
  }
  return null;
}

export function scoreGpu(name: string): number | null {
  const s = name.toUpperCase();

  // Integrated graphics - low tier
  if (/(INTEL\s?)?(UHD|HD GRAPHICS|IRIS)/.test(s)) return 300;
  if (/VEGA\s?(3|6|8|11)\b(?!.*RX)/.test(s) && !/RX/.test(s)) return 600;

  // NVIDIA GeForce: GT/GTX/RTX + number
  const nvMatch = s.match(/(GT|GTX|RTX)\s?(\d{3,4})\s?(TI|SUPER)?/);
  if (nvMatch) {
    const series = nvMatch[1];
    const num = parseInt(nvMatch[2], 10);
    const gen = num >= 1000 ? Math.floor(num / 1000) : 0;
    const tier = num >= 1000 ? num % 1000 : num;
    let score = gen * 1000 + tier;
    if (series === "GT") score *= 0.5;
    if (nvMatch[3] === "TI" || nvMatch[3] === "SUPER") score += 40;
    return score;
  }

  // AMD Radeon: HD/R/RX + number
  const amdMatch = s.match(/RX\s?(\d{3,4})\s?(XT)?/);
  if (amdMatch) {
    const num = parseInt(amdMatch[1], 10);
    const gen = num >= 1000 ? Math.floor(num / 1000) : 0;
    const tier = num >= 1000 ? num % 1000 : num;
    let score = gen * 1000 + tier;
    if (amdMatch[2] === "XT") score += 40;
    return score;
  }
  const oldAmdMatch = s.match(/\bHD\s?(\d{3,4})/);
  if (oldAmdMatch) return parseInt(oldAmdMatch[1], 10) * 0.6;

  // Intel Arc
  const arcMatch = s.match(/ARC\s?A(\d{3})/);
  if (arcMatch) return 1000 + parseInt(arcMatch[1], 10);

  // Apple Silicon GPU (bundled in the chip)
  if (/M[1234]\s?(PRO|MAX|ULTRA)?/.test(s)) return 1200;

  return null;
}
