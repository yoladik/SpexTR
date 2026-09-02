export type Platform = "windows" | "mac" | "linux";

export function resolvePlatform(os: string): Platform {
  const s = os.toLowerCase();
  if (s.includes("mac")) return "mac";
  if (s.includes("linux")) return "linux";
  return "windows";
}
