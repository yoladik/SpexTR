import type { ParsedRequirements } from "./types";

function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

function parseBlock(html: string): ParsedRequirements {
  const result: ParsedRequirements = { raw: stripTags(html) };
  const items = [...html.matchAll(/<li>([\s\S]*?)<\/li>/g)].map((m) => stripTags(m[1]));

  for (const item of items) {
    const colonIndex = item.indexOf(":");
    if (colonIndex === -1) continue;
    const label = item.slice(0, colonIndex).toLowerCase();
    const value = item.slice(colonIndex + 1).trim();
    if (!value) continue;

    if (label.includes("os")) result.os = value;
    else if (label.includes("processor") || label.includes("cpu")) result.cpu = value;
    else if (label.includes("graphics") || label.includes("video card")) result.gpu = value;
    else if (label.includes("memory")) {
      const ramMatch = value.match(/(\d+)\s*GB/i);
      if (ramMatch) result.ramGB = parseInt(ramMatch[1], 10);
    } else if (label.includes("storage") || label.includes("hard drive") || label.includes("disk")) {
      const storageMatch = value.match(/(\d+)\s*GB/i);
      if (storageMatch) result.storageGB = parseInt(storageMatch[1], 10);
    }
  }

  return result;
}

export function parseSteamRequirements(html: string | undefined): ParsedRequirements | undefined {
  if (!html) return undefined;
  return parseBlock(html);
}
