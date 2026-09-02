export type ParsedSteamProfile = { type: "id64"; id64: string } | { type: "vanity"; vanity: string };

export function parseSteamProfileInput(input: string): ParsedSteamProfile {
  const trimmed = input.trim().replace(/\/+$/, "");

  const profileMatch = trimmed.match(/steamcommunity\.com\/profiles\/(\d{17})/i);
  if (profileMatch) return { type: "id64", id64: profileMatch[1] };

  const idMatch = trimmed.match(/steamcommunity\.com\/id\/([^/]+)/i);
  if (idMatch) return { type: "vanity", vanity: idMatch[1] };

  if (/^\d{17}$/.test(trimmed)) return { type: "id64", id64: trimmed };

  return { type: "vanity", vanity: trimmed };
}
