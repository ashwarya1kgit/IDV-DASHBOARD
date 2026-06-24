import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { KpiCards } from "@/components/KpiCards";
import type { KpiSummary } from "@/lib/data/types";

const kpis: KpiSummary = {
  total: { value: 1200, deltaPct: 12.5 },
  passRate: { value: 78.4, deltaPct: -1.2 },
  failRate: { value: 15.1, deltaPct: 0.5 },
  pending: { value: 80, deltaPct: null },
  avgCompletionSec: { value: 34, deltaPct: -3.0 },
  fraudFlags: { value: 22, deltaPct: 4.0 },
};

describe("KpiCards", () => {
  it("renders the total verifications value", () => {
    render(<KpiCards kpis={kpis} />);
    expect(screen.getByText("Total Verifications")).toBeInTheDocument();
    expect(screen.getByText("1,200")).toBeInTheDocument();
  });

  it("renders a pass rate as a percentage", () => {
    render(<KpiCards kpis={kpis} />);
    expect(screen.getByText("78.4%")).toBeInTheDocument();
  });
});
