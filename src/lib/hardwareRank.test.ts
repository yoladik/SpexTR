import { describe, expect, it } from "vitest";
import { estimateCpuBaselineGhz, estimateGpuVramGB, scoreCpu, scoreGpu } from "./hardwareRank";

describe("scoreCpu", () => {
  it("recognizes Intel and AMD families and ranks newer generations higher", () => {
    expect(scoreCpu("Intel Core i5-10400")).not.toBeNull();
    expect(scoreCpu("AMD Ryzen 5 5600X")).not.toBeNull();
    expect(scoreCpu("Intel Core i5-13400")!).toBeGreaterThan(scoreCpu("Intel Core i5-9400")!);
    expect(scoreCpu("AMD Ryzen 7 7700X")!).toBeGreaterThan(scoreCpu("AMD Ryzen 5 7600")!);
  });

  it("returns null for unrecognized text", () => {
    expect(scoreCpu("some made up processor xyz")).toBeNull();
  });
});

describe("scoreGpu", () => {
  it("does not score legacy-era cards as beating modern ones (regression: League of Legends bug)", () => {
    // Real requirement text this app pulled for League of Legends: an old GeForce "9600 GT" /
    // old-style Radeon "HD 6570" minimum used to score ~3942 via a broken raw-number formula,
    // beating a GTX 1650 (1650) and coming close to an RTX 4090.
    const legacyMin = scoreGpu("NVIDIA GeForce 9600GT / AMD Radeon HD 6570")!;
    const legacyRec = scoreGpu("NVIDIA GeForce 560 / AMD Radeon HD 6950")!;
    const modern = scoreGpu("NVIDIA GTX 1650")!;

    expect(legacyMin).toBeLessThan(modern);
    expect(legacyRec).toBeLessThan(modern);
  });

  it("scores a laptop GPU lower than the same-numbered desktop card", () => {
    const desktop = scoreGpu("NVIDIA RTX 4070")!;
    const laptop = scoreGpu("NVIDIA RTX 4070 Laptop GPU")!;
    expect(laptop).toBeLessThan(desktop);
  });

  it("returns null for unrecognized text", () => {
    expect(scoreGpu("some made up gpu xyz")).toBeNull();
  });
});

describe("estimateCpuBaselineGhz", () => {
  it("returns a plausible baseline for a recognized family", () => {
    expect(estimateCpuBaselineGhz("Intel Core i5-10400")).toBeGreaterThan(2);
  });

  it("returns null for an unrecognized family", () => {
    expect(estimateCpuBaselineGhz("some made up processor")).toBeNull();
  });
});

describe("estimateGpuVramGB", () => {
  it("prefers the more specific pattern (Ti/Super) over the base model", () => {
    expect(estimateGpuVramGB("NVIDIA RTX 4070 Ti Super")).toBe(16);
    expect(estimateGpuVramGB("NVIDIA RTX 4070")).toBe(12);
  });

  it("returns null for an unrecognized model", () => {
    expect(estimateGpuVramGB("some made up gpu")).toBeNull();
  });
});
