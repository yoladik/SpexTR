import { describe, expect, it } from "vitest";
import { compareSpecs } from "./compare";
import type { GameRequirements, PcSpecs } from "./types";

const baseSpecs: PcSpecs = {
  cpu: "AMD Ryzen 5 5600X",
  gpu: "NVIDIA RTX 3070",
  ramGB: 16,
  storageFreeGB: 100,
  os: "Windows 11",
};

const baseGame: GameRequirements = {
  appid: "1",
  name: "Test Game",
  minimum: { cpu: "Intel Core i3-10100", gpu: "NVIDIA GTX 1050", ramGB: 8, storageGB: 30 },
  recommended: { cpu: "AMD Ryzen 5 3600", gpu: "NVIDIA GTX 1660", ramGB: 16, storageGB: 30 },
};

describe("compareSpecs", () => {
  it("returns ok when specs clear the recommended requirements", () => {
    const result = compareSpecs(baseSpecs, baseGame);
    expect(result.overall).toBe("ok");
    expect(result.fpsEstimate?.tier).toMatch(/mid|high/);
  });

  it("returns borderline when specs only clear the minimum", () => {
    const weakerSpecs: PcSpecs = { ...baseSpecs, gpu: "NVIDIA GTX 1050 Ti" };
    const result = compareSpecs(weakerSpecs, baseGame);
    expect(result.overall).toBe("borderline");
    expect(result.fpsEstimate?.tier).toBe("low");
  });

  it("returns fail when specs don't clear the minimum", () => {
    const tooWeakSpecs: PcSpecs = { ...baseSpecs, cpu: "Intel Celeron G5905", gpu: "Intel UHD Graphics 630" };
    const result = compareSpecs(tooWeakSpecs, baseGame);
    expect(result.overall).toBe("fail");
    expect(result.fpsEstimate?.tier).toBe("unplayable");
  });

  describe("storage", () => {
    it("treats being short of the storage minimum by <= 20 GB as borderline, not fail", () => {
      const specs: PcSpecs = { ...baseSpecs, storageFreeGB: 15 }; // 15 GB short of min 30
      const result = compareSpecs(specs, baseGame);
      const storage = result.components.find((c) => c.label === "Volné místo na disku");
      expect(storage?.verdict).toBe("borderline");
    });

    it("treats being short of the storage minimum by > 20 GB as fail", () => {
      const specs: PcSpecs = { ...baseSpecs, storageFreeGB: 5 }; // 25 GB short of min 30
      const result = compareSpecs(specs, baseGame);
      const storage = result.components.find((c) => c.label === "Volné místo na disku");
      expect(storage?.verdict).toBe("fail");
    });

    it("never drags the overall verdict below borderline on its own", () => {
      const specs: PcSpecs = { ...baseSpecs, storageFreeGB: 5 }; // storage fails, everything else is fine
      const result = compareSpecs(specs, baseGame);
      expect(result.overall).toBe("borderline");
    });
  });

  describe("OS/platform", () => {
    it("fails overall when the game doesn't ship for the chosen platform", () => {
      const game: GameRequirements = { ...baseGame, platforms: { windows: false, mac: true, linux: false } };
      const result = compareSpecs(baseSpecs, game);
      expect(result.overall).toBe("fail");
    });

    it("does not add a separate OS component card", () => {
      const game: GameRequirements = { ...baseGame, platforms: { windows: true, mac: true, linux: true } };
      const result = compareSpecs(baseSpecs, game);
      expect(result.components.some((c) => c.label === "Operační systém")).toBe(false);
    });
  });
});
