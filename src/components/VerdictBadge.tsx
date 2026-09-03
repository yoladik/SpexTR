import type { Verdict } from "@/lib/types";

const STYLES: Record<
  Verdict,
  { label: string; pillClassName: string; textClassName: string; boxClassName: string }
> = {
  ok: {
    label: "Splňuješ",
    pillClassName: "bg-green-100 text-green-800 border-green-300",
    textClassName: "text-green-600",
    boxClassName: "border-green-300 bg-green-50 text-green-800",
  },
  borderline: {
    label: "Jen tak tak",
    pillClassName: "bg-orange-100 text-orange-800 border-orange-300",
    textClassName: "text-orange-600",
    boxClassName: "border-orange-300 bg-orange-50 text-orange-800",
  },
  fail: {
    label: "Nesplňuješ",
    pillClassName: "bg-red-100 text-red-800 border-red-300",
    textClassName: "text-red-600",
    boxClassName: "border-red-300 bg-red-50 text-red-800",
  },
  unknown: {
    label: "Nelze určit",
    pillClassName: "bg-gray-100 text-gray-600 border-gray-300",
    textClassName: "text-gray-500",
    boxClassName: "border-gray-300 bg-gray-50 text-gray-600",
  },
};

export function verdictLabel(verdict: Verdict): string {
  return STYLES[verdict].label;
}

export function verdictBoxClassName(verdict: Verdict): string {
  return STYLES[verdict].boxClassName;
}

export default function VerdictBadge({
  verdict,
  variant = "pill",
}: {
  verdict: Verdict;
  variant?: "pill" | "text";
}) {
  const style = STYLES[verdict];

  if (variant === "text") {
    return <p className={`text-xl font-semibold ${style.textClassName}`}>{style.label}</p>;
  }

  return (
    <span className={`inline-block rounded-full border px-3 py-1 text-sm font-medium ${style.pillClassName}`}>
      {style.label}
    </span>
  );
}
