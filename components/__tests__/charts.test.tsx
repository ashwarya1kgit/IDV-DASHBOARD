import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { VolumeChart } from "@/components/VolumeChart";
import { BreakdownCharts } from "@/components/BreakdownCharts";
import type { Breakdowns, VolumePoint } from "@/lib/data/types";

const series: VolumePoint[] = [
  { date: "2026-06-22", passed: 40, failed: 8, pending: 2 },
  { date: "2026-06-23", passed: 45, failed: 6, pending: 3 },
];
const breakdowns: Breakdowns = {
  byOutcome: [{ label: "passed", value: 85 }],
  byDocumentType: [{ label: "passport", value: 50 }],
  byRegion: [{ label: "NA", value: 30 }],
};

describe("charts", () => {
  it("VolumeChart renders its heading", () => {
    render(<VolumeChart data={series} />);
    expect(screen.getByText("Verification Volume")).toBeInTheDocument();
  });

  it("BreakdownCharts renders all three section headings", () => {
    render(<BreakdownCharts data={breakdowns} />);
    expect(screen.getByText("By Outcome")).toBeInTheDocument();
    expect(screen.getByText("By Document Type")).toBeInTheDocument();
    expect(screen.getByText("By Region")).toBeInTheDocument();
  });
});
