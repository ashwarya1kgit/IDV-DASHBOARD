import type { KpiMetric } from "./types";

export function computeTrend(current: number, previous: number): KpiMetric {
  if (previous === 0) {
    return { value: current, deltaPct: null };
  }
  const deltaPct = Math.round(((current - previous) / previous) * 1000) / 10;
  return { value: current, deltaPct };
}
