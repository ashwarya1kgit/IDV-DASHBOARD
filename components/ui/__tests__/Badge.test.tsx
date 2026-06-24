import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "@/components/ui/Badge";

describe("Badge", () => {
  it("renders the outcome label capitalized", () => {
    render(<Badge outcome="passed" />);
    expect(screen.getByText("Passed")).toBeInTheDocument();
  });
});
