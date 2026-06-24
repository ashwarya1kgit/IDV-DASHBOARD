import { describe, it, expect } from "vitest";
import { mockProvider } from "@/lib/data/mockProvider";
import { RANGES } from "@/lib/data/types";

describe("mockProvider", () => {
  it("produces a deterministic dataset across calls", () => {
    const a = mockProvider.getVerificationsAll();
    const b = mockProvider.getVerificationsAll();
    expect(a.length).toBeGreaterThan(100);
    expect(a[0]).toEqual(b[0]);
    expect(a.length).toEqual(b.length);
  });

  it("getKpis returns rates that sum sensibly and a total > 0", () => {
    const kpis = mockProvider.getKpis(RANGES["30d"]);
    expect(kpis.total.value).toBeGreaterThan(0);
    expect(kpis.passRate.value).toBeGreaterThanOrEqual(0);
    expect(kpis.passRate.value).toBeLessThanOrEqual(100);
    expect(kpis.fraudFlags.value).toBeGreaterThanOrEqual(0);
  });

  it("getVolumeSeries returns one point per day in range, sorted ascending", () => {
    const series = mockProvider.getVolumeSeries(RANGES["7d"]);
    expect(series).toHaveLength(7);
    const dates = series.map((p) => p.date);
    expect([...dates].sort()).toEqual(dates);
  });

  it("getBreakdowns sums byOutcome equal to total verifications in range", () => {
    const range = RANGES["30d"];
    const kpis = mockProvider.getKpis(range);
    const b = mockProvider.getBreakdowns(range);
    const sum = b.byOutcome.reduce((acc, s) => acc + s.value, 0);
    expect(sum).toEqual(kpis.total.value);
  });

  it("getVerifications paginates and filters by outcome", () => {
    const page = mockProvider.getVerifications({
      range: RANGES["90d"],
      outcome: "failed",
      page: 1,
      pageSize: 10,
    });
    expect(page.items.length).toBeLessThanOrEqual(10);
    expect(page.items.every((v) => v.outcome === "failed")).toBe(true);
    expect(page.pageSize).toBe(10);
  });
});
