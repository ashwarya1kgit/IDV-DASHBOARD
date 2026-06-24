import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { VerificationsTable } from "@/components/VerificationsTable";
import type { Verification } from "@/lib/data/types";

const rows: Verification[] = [
  {
    id: "idv_000001",
    userName: "Alex Lee",
    userMaskedId: "usr_••••1234",
    documentType: "passport",
    outcome: "passed",
    livenessScore: 88,
    biometricScore: 91,
    region: "NA",
    createdAt: "2026-06-23T10:00:00.000Z",
    completionMs: 24000,
    fraudFlag: false,
  },
];

describe("VerificationsTable", () => {
  it("renders a row with the user name and outcome", () => {
    render(
      <VerificationsTable
        rows={rows}
        total={1}
        page={1}
        pageSize={10}
        onFilterChange={() => {}}
        onPageChange={() => {}}
      />,
    );
    expect(screen.getByText("Alex Lee")).toBeInTheDocument();
    const table = screen.getByRole("table");
    expect(within(table).getByText("Passed")).toBeInTheDocument();
  });

  it("opens the detail drawer on row click", () => {
    render(
      <VerificationsTable
        rows={rows}
        total={1}
        page={1}
        pageSize={10}
        onFilterChange={() => {}}
        onPageChange={() => {}}
      />,
    );
    fireEvent.click(screen.getByText("Alex Lee"));
    expect(screen.getByText("Liveness Score")).toBeInTheDocument();
    expect(screen.getByText("88")).toBeInTheDocument();
  });

  it("calls onFilterChange when outcome filter changes", () => {
    const onFilterChange = vi.fn();
    render(
      <VerificationsTable
        rows={rows}
        total={1}
        page={1}
        pageSize={10}
        onFilterChange={onFilterChange}
        onPageChange={() => {}}
      />,
    );
    fireEvent.change(screen.getByLabelText("Filter by outcome"), {
      target: { value: "failed" },
    });
    expect(onFilterChange).toHaveBeenCalledWith({
      outcome: "failed",
      documentType: undefined,
    });
  });
});
