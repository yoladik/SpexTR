export interface PcSpecs {
  cpu: string;
  gpu: string;
  ramGB: number;
  storageFreeGB: number;
  os: string;
}

export interface ParsedRequirements {
  os?: string;
  cpu?: string;
  gpu?: string;
  ramGB?: number;
  storageGB?: number;
  raw?: string;
}

export interface GameRequirements {
  appid: string;
  name: string;
  headerImage?: string;
  minimum?: ParsedRequirements;
  recommended?: ParsedRequirements;
}

export type Verdict = "ok" | "borderline" | "fail" | "unknown";

export interface ComponentComparison {
  label: string;
  yourValue: string;
  minValue?: string;
  recommendedValue?: string;
  verdict: Verdict;
  note?: string;
}

export interface ComparisonResult {
  components: ComponentComparison[];
  overall: Verdict;
  overallText: string;
}
