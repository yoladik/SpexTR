import type { Verdict } from "@/lib/types";

const STYLES: Record<Verdict, { label: string; className: string }> = {
  ok: { label: "Splňuješ", className: "bg-green-100 text-green-800 border-green-300" },
  borderline: { label: "Jen tak tak", className: "bg-orange-100 text-orange-800 border-orange-300" },
  fail: { label: "Nesplňuješ", className: "bg-red-100 text-red-800 border-red-300" },
  unknown: { label: "Nelze určit", className: "bg-gray-100 text-gray-600 border-gray-300" },
};

export default function VerdictBadge({ verdict }: { verdict: Verdict }) {
  const style = STYLES[verdict];
  return (
    <span className={`inline-block rounded-full border px-3 py-1 text-sm font-medium ${style.className}`}>
      {style.label}
    </span>
  );
}
