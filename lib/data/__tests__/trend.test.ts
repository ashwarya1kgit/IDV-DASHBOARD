import { describe, it, expect } from "vitest";
import { computeTrend } from "@/lib/data/trend";

describe("computeTrend", () => {
  it("returns positive delta when current exceeds previous", () => {
    expect(computeTrend(150, 100)).toEqual({ value: 150, deltaPct: 50 });
  });

  it("returns negative delta when current is below previous", () => {
    expect(computeTrend(80, 100)).toEqual({ value: 80, deltaPct: -20 });
  });

  it("returns null deltaPct when previous is zero", () => {
    expect(computeTrend(10, 0)).toEqual({ value: 10, deltaPct: null });
  });

  it("rounds deltaPct to one decimal", () => {
    expect(computeTrend(101, 99).deltaPct).toBeCloseTo(2.0, 1);
  });
});
