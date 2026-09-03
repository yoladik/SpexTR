import type { Verdict } from "@/lib/types";

const STYLES: Record<
  Verdict,
  { label: string; pillClassName: string; textClassName: string; boxClassName: string }
> = {
  ok: {
    label: "Splňuješ",
    pillClassName: "bg-green-100 text-green-800 border-green-300 dark:bg-green-950 dark:text-green-300 dark:border-green-700",
    textClassName: "text-green-600 dark:text-green-400",
    boxClassName: "border-green-300 bg-green-50 text-green-800 dark:border-green-700 dark:bg-green-950 dark:text-green-300",
  },
  borderline: {
    label: "Jen tak tak",
    pillClassName: "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-400/20 dark:text-yellow-300 dark:border-yellow-400",
    textClassName: "text-yellow-600 dark:text-yellow-400",
    boxClassName: "border-yellow-300 bg-yellow-50 text-yellow-800 dark:border-yellow-400 dark:bg-yellow-400/20 dark:text-yellow-300",
  },
  fail: {
    label: "Nesplňuješ",
    pillClassName: "bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-700",
    textClassName: "text-red-600 dark:text-red-400",
    boxClassName: "border-red-300 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-950 dark:text-red-300",
  },
  unknown: {
    label: "Nelze určit",
    pillClassName: "bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600",
    textClassName: "text-gray-500 dark:text-gray-400",
    boxClassName: "border-gray-300 bg-gray-50 text-gray-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300",
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
