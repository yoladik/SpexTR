import type { ParsedRequirements } from "./types";

/**
 * Curated system requirements for popular games that aren't sold on Steam (own launcher,
 * Epic-exclusive, Microsoft Store, mobile-first, etc.), so Steam's API can never return them.
 * There's no free universal API for this — this list is manually maintained and grown over
 * time as specific games are requested. Values come from each game's official requirements
 * page at the time they were added and may drift as games get patched.
 */
export interface LocalGame {
  id: string;
  name: string;
  minimum?: ParsedRequirements;
  recommended?: ParsedRequirements;
}

export const LOCAL_GAMES: LocalGame[] = [
  {
    id: "minecraft-java",
    name: "Minecraft: Java Edition",
    minimum: {
      cpu: "Intel Core i3-3210 / AMD A8-7600",
      gpu: "Intel HD Graphics 4000 (Mesa 11.2) / AMD Radeon R5",
      ramGB: 4,
      storageGB: 1,
      os: "Windows 10/11",
    },
    recommended: {
      cpu: "Intel Core i5-4690 / AMD A10-7800",
      gpu: "NVIDIA GeForce 700 Series / AMD Radeon Rx 200 Series",
      ramGB: 8,
      storageGB: 4,
      os: "Windows 10/11",
    },
  },
  {
    id: "minecraft-bedrock",
    name: "Minecraft: Bedrock Edition (Windows)",
    minimum: {
      cpu: "Dual-core 1.6 GHz",
      gpu: "DirectX 11 compatible",
      ramGB: 4,
      storageGB: 1,
      os: "Windows 10/11",
    },
  },
  {
    id: "fortnite",
    name: "Fortnite",
    minimum: {
      cpu: "Intel Core i3-3225 / AMD equivalent",
      gpu: "Intel HD 4000",
      ramGB: 8,
      storageGB: 30,
      os: "Windows 10/11 64-bit",
    },
    recommended: {
      cpu: "Intel Core i5-7300U / AMD Ryzen 3 3300U",
      gpu: "NVIDIA GTX 960 / AMD R9 280",
      ramGB: 16,
      storageGB: 30,
      os: "Windows 10/11 64-bit",
    },
  },
  {
    id: "valorant",
    name: "Valorant",
    minimum: {
      cpu: "Intel Core 2 Duo E8400",
      gpu: "Intel HD 4000",
      ramGB: 4,
      storageGB: 30,
      os: "Windows 10/11 64-bit",
    },
    recommended: {
      cpu: "Intel Core i3-4150",
      gpu: "NVIDIA GTX 1050 Ti / AMD R7 240",
      ramGB: 4,
      storageGB: 30,
      os: "Windows 10/11 64-bit",
    },
  },
  {
    id: "league-of-legends",
    name: "League of Legends",
    minimum: {
      cpu: "Intel Core i3-530 / AMD equivalent",
      gpu: "NVIDIA GeForce 9600GT / AMD Radeon HD 6570",
      ramGB: 4,
      storageGB: 16,
      os: "Windows 10/11 64-bit",
    },
    recommended: {
      cpu: "Intel Core i5-3300",
      gpu: "NVIDIA GeForce 560 / AMD Radeon HD 6950",
      ramGB: 4,
      storageGB: 16,
      os: "Windows 10/11 64-bit",
    },
  },
  {
    id: "genshin-impact",
    name: "Genshin Impact",
    minimum: {
      cpu: "Intel Core i5",
      gpu: "NVIDIA GeForce GT 1030",
      ramGB: 8,
      storageGB: 30,
      os: "Windows 10/11 64-bit",
    },
    recommended: {
      cpu: "Intel Core i7",
      gpu: "NVIDIA GeForce GTX 1060 6GB",
      ramGB: 16,
      storageGB: 30,
      os: "Windows 10/11 64-bit",
    },
  },
  {
    id: "roblox",
    name: "Roblox",
    minimum: {
      cpu: "1.6 GHz nebo rychlejší",
      gpu: "DirectX 10, 11 nebo 12 kompatibilní",
      ramGB: 4,
      storageGB: 2,
      os: "Windows 10/11 64-bit",
    },
  },
];

export function searchLocalGames(term: string): LocalGame[] {
  const t = term.toLowerCase().trim();
  if (!t) return [];
  return LOCAL_GAMES.filter((g) => g.name.toLowerCase().includes(t));
}

export function findLocalGame(id: string): LocalGame | undefined {
  return LOCAL_GAMES.find((g) => g.id === id);
}
