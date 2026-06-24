import { computeTrend } from "./trend";
import type {
  Breakdowns,
  DateRange,
  DocumentType,
  KpiSummary,
  Outcome,
  Paginated,
  Region,
  Verification,
  VerificationFilter,
  VolumePoint,
} from "./types";

// Fixed anchor so the dataset is fully deterministic.
const NOW = Date.UTC(2026, 5, 24, 0, 0, 0); // 2026-06-24
const DAY_MS = 24 * 60 * 60 * 1000;
const TOTAL_DAYS = 90;

// Deterministic PRNG (mulberry32).
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DOC_TYPES: DocumentType[] = ["passport", "drivers_license", "id_card"];
const REGIONS: Region[] = ["NA", "EU", "APAC", "LATAM", "MEA"];
const FIRST = ["Alex", "Sam", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Jamie"];
const LAST = ["Lee", "Patel", "Garcia", "Khan", "Nguyen", "Smith", "Olsen", "Costa"];

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function buildDataset(): Verification[] {
  const rng = mulberry32(20260624);
  const out: Verification[] = [];
  let counter = 0;

  for (let d = TOTAL_DAYS - 1; d >= 0; d--) {
    const dayStart = NOW - d * DAY_MS;
    // 30..70 sessions per day, weekends lighter.
    const weekday = new Date(dayStart).getUTCDay();
    const base = weekday === 0 || weekday === 6 ? 25 : 50;
    const count = base + Math.floor(rng() * 25);

    for (let i = 0; i < count; i++) {
      const r = rng();
      const outcome: Outcome =
        r < 0.78 ? "passed" : r < 0.93 ? "failed" : "pending";
      const liveness = 55 + Math.floor(rng() * 45);
      const biometric = 55 + Math.floor(rng() * 45);
      const fraudFlag = outcome === "failed" && rng() < 0.35;
      const createdAt = new Date(
        dayStart + Math.floor(rng() * DAY_MS),
      ).toISOString();
      counter += 1;

      out.push({
        id: `idv_${String(counter).padStart(6, "0")}`,
        userName: `${pick(rng, FIRST)} ${pick(rng, LAST)}`,
        userMaskedId: `usr_••••${String(1000 + Math.floor(rng() * 9000))}`,
        documentType: pick(rng, DOC_TYPES),
        outcome,
        livenessScore: liveness,
        biometricScore: biometric,
        region: pick(rng, REGIONS),
        createdAt,
        completionMs: 8000 + Math.floor(rng() * 52000),
        fraudFlag,
      });
    }
  }
  return out;
}

const DATASET = buildDataset();

function rangeBounds(range: DateRange): { start: number; prevStart: number } {
  const start = NOW - (range.days - 1) * DAY_MS;
  const prevStart = start - range.days * DAY_MS;
  return { start, prevStart };
}

function inWindow(v: Verification, start: number, end: number): boolean {
  const t = Date.parse(v.createdAt);
  return t >= start && t < end;
}

function summarize(items: Verification[]) {
  const total = items.length;
  const passed = items.filter((v) => v.outcome === "passed").length;
  const failed = items.filter((v) => v.outcome === "failed").length;
  const pending = items.filter((v) => v.outcome === "pending").length;
  const fraud = items.filter((v) => v.fraudFlag).length;
  const avgMs =
    total === 0 ? 0 : items.reduce((a, v) => a + v.completionMs, 0) / total;
  return {
    total,
    passRate: total === 0 ? 0 : Math.round((passed / total) * 1000) / 10,
    failRate: total === 0 ? 0 : Math.round((failed / total) * 1000) / 10,
    pending,
    avgCompletionSec: Math.round(avgMs / 1000),
    fraud,
  };
}

export const mockProvider = {
  getVerificationsAll(): Verification[] {
    return DATASET;
  },

  getKpis(range: DateRange): KpiSummary {
    const { start, prevStart } = rangeBounds(range);
    const cur = DATASET.filter((v) => inWindow(v, start, NOW + DAY_MS));
    const prev = DATASET.filter((v) => inWindow(v, prevStart, start));
    const c = summarize(cur);
    const p = summarize(prev);
    return {
      total: computeTrend(c.total, p.total),
      passRate: computeTrend(c.passRate, p.passRate),
      failRate: computeTrend(c.failRate, p.failRate),
      pending: computeTrend(c.pending, p.pending),
      avgCompletionSec: computeTrend(c.avgCompletionSec, p.avgCompletionSec),
      fraudFlags: computeTrend(c.fraud, p.fraud),
    };
  },

  getVolumeSeries(range: DateRange): VolumePoint[] {
    const points: VolumePoint[] = [];
    for (let d = range.days - 1; d >= 0; d--) {
      const dayStart = NOW - d * DAY_MS;
      const dayEnd = dayStart + DAY_MS;
      const dayItems = DATASET.filter((v) => inWindow(v, dayStart, dayEnd));
      points.push({
        date: new Date(dayStart).toISOString().slice(0, 10),
        passed: dayItems.filter((v) => v.outcome === "passed").length,
        failed: dayItems.filter((v) => v.outcome === "failed").length,
        pending: dayItems.filter((v) => v.outcome === "pending").length,
      });
    }
    return points;
  },

  getBreakdowns(range: DateRange): Breakdowns {
    const { start } = rangeBounds(range);
    const items = DATASET.filter((v) => inWindow(v, start, NOW + DAY_MS));
    const countBy = <K extends string>(key: (v: Verification) => K) => {
      const map = new Map<K, number>();
      for (const v of items) map.set(key(v), (map.get(key(v)) ?? 0) + 1);
      return [...map.entries()].map(([label, value]) => ({ label, value }));
    };
    return {
      byOutcome: countBy((v) => v.outcome),
      byDocumentType: countBy((v) => v.documentType),
      byRegion: countBy((v) => v.region),
    };
  },

  getVerifications(filter: VerificationFilter): Paginated<Verification> {
    const { start } = rangeBounds(filter.range);
    let items = DATASET.filter((v) => inWindow(v, start, NOW + DAY_MS));
    if (filter.outcome) items = items.filter((v) => v.outcome === filter.outcome);
    if (filter.documentType)
      items = items.filter((v) => v.documentType === filter.documentType);
    items = [...items].sort(
      (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
    );
    const page = filter.page ?? 1;
    const pageSize = filter.pageSize ?? 10;
    const startIdx = (page - 1) * pageSize;
    return {
      items: items.slice(startIdx, startIdx + pageSize),
      total: items.length,
      page,
      pageSize,
    };
  },
};
