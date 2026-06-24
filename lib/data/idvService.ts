import { mockProvider } from "./mockProvider";
import type {
  Breakdowns,
  DateRange,
  KpiSummary,
  Paginated,
  Verification,
  VerificationFilter,
  VolumePoint,
} from "./types";

// Active data provider. Swap this for a MongoDB-backed provider later;
// no consumer changes required because the function shapes are identical.
const provider = mockProvider;

export async function getKpis(range: DateRange): Promise<KpiSummary> {
  return provider.getKpis(range);
}

export async function getVolumeSeries(range: DateRange): Promise<VolumePoint[]> {
  return provider.getVolumeSeries(range);
}

export async function getBreakdowns(range: DateRange): Promise<Breakdowns> {
  return provider.getBreakdowns(range);
}

export async function getVerifications(
  filter: VerificationFilter,
): Promise<Paginated<Verification>> {
  return provider.getVerifications(filter);
}
