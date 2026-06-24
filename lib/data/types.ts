export type Outcome = "passed" | "failed" | "pending";
export type DocumentType = "passport" | "drivers_license" | "id_card";
export type Region = "NA" | "EU" | "APAC" | "LATAM" | "MEA";

export interface Verification {
  id: string;
  userName: string;
  userMaskedId: string;
  documentType: DocumentType;
  outcome: Outcome;
  livenessScore: number; // 0..100
  biometricScore: number; // 0..100
  region: Region;
  createdAt: string; // ISO timestamp
  completionMs: number;
  fraudFlag: boolean;
}

export type RangeKey = "7d" | "30d" | "90d";

export interface DateRange {
  key: RangeKey;
  days: number;
}

export interface KpiMetric {
  value: number;
  deltaPct: number | null; // signed % vs previous period; null if previous was 0
}

export interface KpiSummary {
  total: KpiMetric;
  passRate: KpiMetric; // percentage 0..100
  failRate: KpiMetric; // percentage 0..100
  pending: KpiMetric;
  avgCompletionSec: KpiMetric;
  fraudFlags: KpiMetric;
}

export interface VolumePoint {
  date: string; // YYYY-MM-DD
  passed: number;
  failed: number;
  pending: number;
}

export interface BreakdownSlice {
  label: string;
  value: number;
}

export interface Breakdowns {
  byOutcome: BreakdownSlice[];
  byDocumentType: BreakdownSlice[];
  byRegion: BreakdownSlice[];
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface VerificationFilter {
  range: DateRange;
  outcome?: Outcome;
  documentType?: DocumentType;
  page?: number;
  pageSize?: number;
}

export const RANGES: Record<RangeKey, DateRange> = {
  "7d": { key: "7d", days: 7 },
  "30d": { key: "30d", days: 30 },
  "90d": { key: "90d", days: 90 },
};
