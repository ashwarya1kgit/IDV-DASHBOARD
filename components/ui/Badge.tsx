import type { Outcome } from "@/lib/data/types";

const STYLES: Record<Outcome, string> = {
  passed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  pending: "bg-amber-100 text-amber-800",
};

export function Badge({ outcome }: { outcome: Outcome }) {
  const label = outcome.charAt(0).toUpperCase() + outcome.slice(1);
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLES[outcome]}`}
    >
      {label}
    </span>
  );
}
