import { describe, it, expect } from "vitest";
import * as svc from "@/lib/data/idvService";
import { RANGES } from "@/lib/data/types";

describe("idvService", () => {
  it("getKpis resolves to a KpiSummary", async () => {
    const kpis = await svc.getKpis(RANGES["30d"]);
    expect(kpis.total.value).toBeGreaterThan(0);
  });

  it("getVerifications resolves to a paginated result", async () => {
    const page = await svc.getVerifications({ range: RANGES["7d"], pageSize: 5 });
    expect(page.items.length).toBeLessThanOrEqual(5);
    expect(page.total).toBeGreaterThanOrEqual(page.items.length);
  });
});
