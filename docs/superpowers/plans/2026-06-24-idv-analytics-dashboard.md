# IDV Analytics Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static-exported Next.js IDV analytics dashboard (KPIs, charts, recent-verifications table) backed by a deterministic mock data layer, auto-deployed to GitHub Pages.

**Architecture:** Presentational React components receive typed data as props. A single client page (`app/page.tsx`) owns date-range state and fetches all data through `lib/data/idvService.ts`, which delegates to a swappable `mockProvider`. The app is statically exported (`output: 'export'`) and published to GitHub Pages via Actions.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 3.4, Recharts 2, lucide-react, Vitest + Testing Library.

## Global Constraints

- Next.js config MUST use `output: 'export'`, `images.unoptimized: true`.
- `basePath` and `assetPrefix` = `/IDV-DASHBOARD` in production only (empty in dev).
- All data access goes through `lib/data/idvService.ts` — components NEVER import `mockProvider` directly.
- Components are presentational: they receive typed props; only `app/page.tsx` calls the service.
- Pin dependency versions exactly as written in Task 1.
- Mock data generator MUST be deterministic (seeded PRNG) — identical output across reloads.
- Domain types: `Outcome = 'passed' | 'failed' | 'pending'`; `DocumentType = 'passport' | 'drivers_license' | 'id_card'`.

---

### Task 1: Scaffold Next.js project with static-export config and tooling

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `next-env.d.ts`
- Create: `postcss.config.mjs`
- Create: `tailwind.config.ts`
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Create: `.gitignore`
- Create: `app/globals.css`
- Create: `app/layout.tsx`
- Create: `app/page.tsx` (placeholder, replaced in Task 4)

**Interfaces:**
- Produces: a building Next.js app; `npm run build` emits static `out/`; `npm test` runs Vitest.

- [ ] **Step 1: Create `.gitignore`**

```
node_modules/
.next/
out/
*.tsbuildinfo
.DS_Store
```

- [ ] **Step 2: Create `package.json`**

```json
{
  "name": "idv-dashboard",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "next": "15.1.6",
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "recharts": "2.15.0",
    "lucide-react": "0.469.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "6.6.3",
    "@testing-library/react": "16.1.0",
    "@types/node": "22.10.5",
    "@types/react": "19.0.7",
    "@types/react-dom": "19.0.3",
    "@vitejs/plugin-react": "4.3.4",
    "autoprefixer": "10.4.20",
    "eslint": "9.18.0",
    "eslint-config-next": "15.1.6",
    "jsdom": "25.0.1",
    "postcss": "8.4.49",
    "tailwindcss": "3.4.17",
    "typescript": "5.7.3",
    "vitest": "2.1.8"
  }
}
```

- [ ] **Step 3: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: Create `next-env.d.ts`**

```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />
```

- [ ] **Step 5: Create `next.config.ts`**

```ts
import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isProd ? "/IDV-DASHBOARD" : "",
  assetPrefix: isProd ? "/IDV-DASHBOARD/" : "",
  images: { unoptimized: true },
};

export default nextConfig;
```

- [ ] **Step 6: Create `postcss.config.mjs`**

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 7: Create `tailwind.config.ts`**

```ts
import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        outcome: {
          passed: "#16a34a",
          failed: "#dc2626",
          pending: "#d97706",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
```

- [ ] **Step 8: Create `app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: light;
}

body {
  @apply bg-slate-50 text-slate-900 antialiased;
}
```

- [ ] **Step 9: Create `app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IDV Analytics Dashboard",
  description: "Identity verification metrics and analytics",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 10: Create placeholder `app/page.tsx`**

```tsx
export default function Home() {
  return <main className="p-8">IDV Dashboard — scaffolding</main>;
}
```

- [ ] **Step 11: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
```

- [ ] **Step 12: Create `vitest.setup.ts`**

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 13: Install dependencies**

Run: `cd ~/IDV-DASHBOARD && npm install`
Expected: completes, creates `package-lock.json` and `node_modules/`.

- [ ] **Step 14: Verify build and typecheck succeed**

Run: `npm run typecheck && npm run build`
Expected: typecheck passes; build completes and creates `out/index.html`.

- [ ] **Step 15: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js static-export app with Tailwind and Vitest"
```

---

### Task 2: Domain types and KPI trend helper

**Files:**
- Create: `lib/data/types.ts`
- Create: `lib/data/trend.ts`
- Test: `lib/data/__tests__/trend.test.ts`

**Interfaces:**
- Produces:
  - Types: `Outcome`, `DocumentType`, `Region`, `Verification`, `DateRange`, `KpiSummary`, `KpiMetric`, `VolumePoint`, `Breakdowns`, `BreakdownSlice`, `Paginated<T>`, `VerificationFilter`.
  - `computeTrend(current: number, previous: number): { value: number; deltaPct: number | null }` — `deltaPct` is signed percentage change, `null` when `previous === 0`.

- [ ] **Step 1: Create `lib/data/types.ts`**

```ts
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
```

- [ ] **Step 2: Write the failing test for `computeTrend`**

```ts
// lib/data/__tests__/trend.test.ts
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
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test -- trend`
Expected: FAIL — cannot find module `@/lib/data/trend`.

- [ ] **Step 4: Create `lib/data/trend.ts`**

```ts
import type { KpiMetric } from "./types";

export function computeTrend(current: number, previous: number): KpiMetric {
  if (previous === 0) {
    return { value: current, deltaPct: null };
  }
  const deltaPct = Math.round(((current - previous) / previous) * 1000) / 10;
  return { value: current, deltaPct };
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- trend`
Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add lib/data/types.ts lib/data/trend.ts lib/data/__tests__/trend.test.ts
git commit -m "feat: add IDV domain types and KPI trend helper"
```

---

### Task 3: Deterministic mock data provider

**Files:**
- Create: `lib/data/mockProvider.ts`
- Test: `lib/data/__tests__/mockProvider.test.ts`

**Interfaces:**
- Consumes: types from `lib/data/types.ts`, `computeTrend` from `lib/data/trend.ts`.
- Produces:
  - `mockProvider.getVerificationsAll(): Verification[]` — full seeded dataset (~90 days), stable across calls.
  - `mockProvider.getKpis(range: DateRange): KpiSummary`
  - `mockProvider.getVolumeSeries(range: DateRange): VolumePoint[]`
  - `mockProvider.getBreakdowns(range: DateRange): Breakdowns`
  - `mockProvider.getVerifications(filter: VerificationFilter): Paginated<Verification>`
  - All read from a fixed "now" anchor `2026-06-24T00:00:00Z` so output is deterministic.

- [ ] **Step 1: Write the failing test**

```ts
// lib/data/__tests__/mockProvider.test.ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- mockProvider`
Expected: FAIL — cannot find module `@/lib/data/mockProvider`.

- [ ] **Step 3: Create `lib/data/mockProvider.ts`**

```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- mockProvider`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/data/mockProvider.ts lib/data/__tests__/mockProvider.test.ts
git commit -m "feat: add deterministic mock IDV data provider"
```

---

### Task 4: Service layer (public data interface)

**Files:**
- Create: `lib/data/idvService.ts`
- Test: `lib/data/__tests__/idvService.test.ts`

**Interfaces:**
- Consumes: `mockProvider`, all types.
- Produces (all async — future MongoDB provider returns the same shapes):
  - `getKpis(range: DateRange): Promise<KpiSummary>`
  - `getVolumeSeries(range: DateRange): Promise<VolumePoint[]>`
  - `getBreakdowns(range: DateRange): Promise<Breakdowns>`
  - `getVerifications(filter: VerificationFilter): Promise<Paginated<Verification>>`

- [ ] **Step 1: Write the failing test**

```ts
// lib/data/__tests__/idvService.test.ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- idvService`
Expected: FAIL — cannot find module `@/lib/data/idvService`.

- [ ] **Step 3: Create `lib/data/idvService.ts`**

```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- idvService`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/data/idvService.ts lib/data/__tests__/idvService.test.ts
git commit -m "feat: add idvService data interface over mock provider"
```

---

### Task 5: UI primitives (Card, Badge)

**Files:**
- Create: `components/ui/Card.tsx`
- Create: `components/ui/Badge.tsx`
- Test: `components/ui/__tests__/Badge.test.tsx`

**Interfaces:**
- Produces:
  - `Card({ children, className })` — styled container.
  - `Badge({ outcome })` where `outcome: Outcome` — colored pill with label.

- [ ] **Step 1: Write the failing test for Badge**

```tsx
// components/ui/__tests__/Badge.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "@/components/ui/Badge";

describe("Badge", () => {
  it("renders the outcome label capitalized", () => {
    render(<Badge outcome="passed" />);
    expect(screen.getByText("Passed")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- Badge`
Expected: FAIL — cannot find module `@/components/ui/Badge`.

- [ ] **Step 3: Create `components/ui/Card.tsx`**

```tsx
export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 4: Create `components/ui/Badge.tsx`**

```tsx
import type { Outcome } from "@/lib/data/types";

const STYLES: Record<Outcome, string> = {
  passed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  pending: "bg-amber-100 text-amber-800",
};

export function Badge({ outcome }: { outcome: Outcome }) {
  const label = outcome.charAt(0).toUpperCase() + outcome.slice(1);
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLES[outcome]}`}
    >
      {label}
    </span>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- Badge`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add components/ui/Card.tsx components/ui/Badge.tsx components/ui/__tests__/Badge.test.tsx
git commit -m "feat: add Card and Badge UI primitives"
```

---

### Task 6: Date-range filter and KPI cards

**Files:**
- Create: `components/DateRangeFilter.tsx`
- Create: `components/KpiCards.tsx`
- Test: `components/__tests__/KpiCards.test.tsx`

**Interfaces:**
- Consumes: `KpiSummary`, `RangeKey`, `RANGES` from types; `Card`.
- Produces:
  - `DateRangeFilter({ value, onChange })` where `value: RangeKey`, `onChange: (k: RangeKey) => void`.
  - `KpiCards({ kpis }: { kpis: KpiSummary })`.

- [ ] **Step 1: Write the failing test for KpiCards**

```tsx
// components/__tests__/KpiCards.test.tsx
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- KpiCards`
Expected: FAIL — cannot find module `@/components/KpiCards`.

- [ ] **Step 3: Create `components/DateRangeFilter.tsx`**

```tsx
import { RANGES, type RangeKey } from "@/lib/data/types";

const LABELS: Record<RangeKey, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
};

export function DateRangeFilter({
  value,
  onChange,
}: {
  value: RangeKey;
  onChange: (key: RangeKey) => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
      {(Object.keys(RANGES) as RangeKey[]).map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
            value === key
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          {LABELS[key]}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Create `components/KpiCards.tsx`**

```tsx
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { KpiMetric, KpiSummary } from "@/lib/data/types";

function Trend({ metric, invert = false }: { metric: KpiMetric; invert?: boolean }) {
  if (metric.deltaPct === null) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-slate-400">
        <Minus size={14} /> n/a
      </span>
    );
  }
  const up = metric.deltaPct >= 0;
  const good = invert ? !up : up;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium ${
        good ? "text-green-600" : "text-red-600"
      }`}
    >
      {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
      {Math.abs(metric.deltaPct)}%
    </span>
  );
}

function Stat({
  label,
  display,
  metric,
  invert = false,
}: {
  label: string;
  display: string;
  metric: KpiMetric;
  invert?: boolean;
}) {
  return (
    <Card>
      <p className="text-sm text-slate-500">{label}</p>
      <div className="mt-2 flex items-end justify-between">
        <span className="text-2xl font-semibold">{display}</span>
        <Trend metric={metric} invert={invert} />
      </div>
    </Card>
  );
}

export function KpiCards({ kpis }: { kpis: KpiSummary }) {
  const nf = new Intl.NumberFormat("en-US");
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
      <Stat label="Total Verifications" display={nf.format(kpis.total.value)} metric={kpis.total} />
      <Stat label="Pass Rate" display={`${kpis.passRate.value}%`} metric={kpis.passRate} />
      <Stat label="Fail Rate" display={`${kpis.failRate.value}%`} metric={kpis.failRate} invert />
      <Stat label="Pending" display={nf.format(kpis.pending.value)} metric={kpis.pending} />
      <Stat label="Avg Completion" display={`${kpis.avgCompletionSec.value}s`} metric={kpis.avgCompletionSec} invert />
      <Stat label="Fraud Flags" display={nf.format(kpis.fraudFlags.value)} metric={kpis.fraudFlags} invert />
    </div>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- KpiCards`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add components/DateRangeFilter.tsx components/KpiCards.tsx components/__tests__/KpiCards.test.tsx
git commit -m "feat: add date-range filter and KPI cards"
```

---

### Task 7: Volume chart and breakdown charts

**Files:**
- Create: `components/VolumeChart.tsx`
- Create: `components/BreakdownCharts.tsx`
- Test: `components/__tests__/charts.test.tsx`

**Interfaces:**
- Consumes: `VolumePoint[]`, `Breakdowns`, `Card`. Recharts.
- Produces:
  - `VolumeChart({ data }: { data: VolumePoint[] })`.
  - `BreakdownCharts({ data }: { data: Breakdowns })`.

- [ ] **Step 1: Write the failing test**

```tsx
// components/__tests__/charts.test.tsx
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- charts`
Expected: FAIL — cannot find modules.

- [ ] **Step 3: Create `components/VolumeChart.tsx`**

```tsx
"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/Card";
import type { VolumePoint } from "@/lib/data/types";

export function VolumeChart({ data }: { data: VolumePoint[] }) {
  return (
    <Card>
      <h2 className="mb-4 text-base font-semibold">Verification Volume</h2>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} minTickGap={24} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Area type="monotone" dataKey="passed" stackId="1" stroke="#16a34a" fill="#bbf7d0" />
            <Area type="monotone" dataKey="failed" stackId="1" stroke="#dc2626" fill="#fecaca" />
            <Area type="monotone" dataKey="pending" stackId="1" stroke="#d97706" fill="#fde68a" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
```

- [ ] **Step 4: Create `components/BreakdownCharts.tsx`**

```tsx
"use client";

import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/Card";
import type { Breakdowns, BreakdownSlice } from "@/lib/data/types";

const OUTCOME_COLORS: Record<string, string> = {
  passed: "#16a34a",
  failed: "#dc2626",
  pending: "#d97706",
};
const BAR_COLOR = "#0ea5e9";

function MiniBar({ data }: { data: BreakdownSlice[] }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="value" fill={BAR_COLOR} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BreakdownCharts({ data }: { data: Breakdowns }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card>
        <h2 className="mb-4 text-base font-semibold">By Outcome</h2>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.byOutcome}
                dataKey="value"
                nameKey="label"
                innerRadius={50}
                outerRadius={80}
              >
                {data.byOutcome.map((s) => (
                  <Cell key={s.label} fill={OUTCOME_COLORS[s.label] ?? "#94a3b8"} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card>
        <h2 className="mb-4 text-base font-semibold">By Document Type</h2>
        <MiniBar data={data.byDocumentType} />
      </Card>
      <Card>
        <h2 className="mb-4 text-base font-semibold">By Region</h2>
        <MiniBar data={data.byRegion} />
      </Card>
    </div>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- charts`
Expected: PASS (2 tests). Note: Recharts `ResponsiveContainer` renders headings fine in jsdom even with zero size; the assertions target the headings, not chart geometry.

- [ ] **Step 6: Commit**

```bash
git add components/VolumeChart.tsx components/BreakdownCharts.tsx components/__tests__/charts.test.tsx
git commit -m "feat: add volume and breakdown charts"
```

---

### Task 8: Recent verifications table with detail drawer

**Files:**
- Create: `components/VerificationsTable.tsx`
- Test: `components/__tests__/VerificationsTable.test.tsx`

**Interfaces:**
- Consumes: `Verification`, `Outcome`, `DocumentType`, `Badge`.
- Produces: `VerificationsTable({ rows, total, page, pageSize, outcome, documentType, onFilterChange, onPageChange })`.
  - `rows: Verification[]`, `total: number`, `page: number`, `pageSize: number`.
  - `outcome?: Outcome`, `documentType?: DocumentType`.
  - `onFilterChange: (f: { outcome?: Outcome; documentType?: DocumentType }) => void`.
  - `onPageChange: (page: number) => void`.
  - Clicking a row opens an in-component detail drawer (local state); no parent wiring needed.

- [ ] **Step 1: Write the failing test**

```tsx
// components/__tests__/VerificationsTable.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
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
    expect(screen.getByText("Passed")).toBeInTheDocument();
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- VerificationsTable`
Expected: FAIL — cannot find module.

- [ ] **Step 3: Create `components/VerificationsTable.tsx`**

```tsx
"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type {
  DocumentType,
  Outcome,
  Verification,
} from "@/lib/data/types";

const DOC_LABELS: Record<DocumentType, string> = {
  passport: "Passport",
  drivers_license: "Driver's License",
  id_card: "ID Card",
};

function fmtTime(iso: string): string {
  return new Date(iso).toISOString().replace("T", " ").slice(0, 16) + " UTC";
}

export function VerificationsTable({
  rows,
  total,
  page,
  pageSize,
  outcome,
  documentType,
  onFilterChange,
  onPageChange,
}: {
  rows: Verification[];
  total: number;
  page: number;
  pageSize: number;
  outcome?: Outcome;
  documentType?: DocumentType;
  onFilterChange: (f: {
    outcome?: Outcome;
    documentType?: DocumentType;
  }) => void;
  onPageChange: (page: number) => void;
}) {
  const [selected, setSelected] = useState<Verification | null>(null);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <Card>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold">Recent Verifications</h2>
        <div className="flex gap-2">
          <select
            aria-label="Filter by outcome"
            className="rounded-md border border-slate-200 px-2 py-1 text-sm"
            value={outcome ?? ""}
            onChange={(e) =>
              onFilterChange({
                outcome: (e.target.value || undefined) as Outcome | undefined,
                documentType,
              })
            }
          >
            <option value="">All outcomes</option>
            <option value="passed">Passed</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
          </select>
          <select
            aria-label="Filter by document type"
            className="rounded-md border border-slate-200 px-2 py-1 text-sm"
            value={documentType ?? ""}
            onChange={(e) =>
              onFilterChange({
                outcome,
                documentType: (e.target.value || undefined) as
                  | DocumentType
                  | undefined,
              })
            }
          >
            <option value="">All documents</option>
            <option value="passport">Passport</option>
            <option value="drivers_license">Driver's License</option>
            <option value="id_card">ID Card</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="py-2 pr-4 font-medium">User</th>
              <th className="py-2 pr-4 font-medium">Document</th>
              <th className="py-2 pr-4 font-medium">Outcome</th>
              <th className="py-2 pr-4 font-medium">Region</th>
              <th className="py-2 pr-4 font-medium">Time</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((v) => (
              <tr
                key={v.id}
                onClick={() => setSelected(v)}
                className="cursor-pointer border-b border-slate-100 hover:bg-slate-50"
              >
                <td className="py-2 pr-4">
                  <div className="font-medium">{v.userName}</div>
                  <div className="text-xs text-slate-400">{v.userMaskedId}</div>
                </td>
                <td className="py-2 pr-4">{DOC_LABELS[v.documentType]}</td>
                <td className="py-2 pr-4">
                  <Badge outcome={v.outcome} />
                </td>
                <td className="py-2 pr-4">{v.region}</td>
                <td className="py-2 pr-4 text-slate-500">{fmtTime(v.createdAt)}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  No verifications for this period.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
        <span>
          Page {page} of {totalPages} · {total} total
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="rounded-md border border-slate-200 px-3 py-1 disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="rounded-md border border-slate-200 px-3 py-1 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
          <div className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Verification Detail</h3>
              <button
                type="button"
                aria-label="Close detail"
                onClick={() => setSelected(null)}
                className="rounded-md p-1 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>
            <dl className="grid grid-cols-2 gap-y-3 text-sm">
              <dt className="text-slate-500">ID</dt>
              <dd className="text-right font-mono">{selected.id}</dd>
              <dt className="text-slate-500">User</dt>
              <dd className="text-right">{selected.userName}</dd>
              <dt className="text-slate-500">Document</dt>
              <dd className="text-right">{DOC_LABELS[selected.documentType]}</dd>
              <dt className="text-slate-500">Outcome</dt>
              <dd className="text-right">
                <Badge outcome={selected.outcome} />
              </dd>
              <dt className="text-slate-500">Liveness Score</dt>
              <dd className="text-right">{selected.livenessScore}</dd>
              <dt className="text-slate-500">Biometric Score</dt>
              <dd className="text-right">{selected.biometricScore}</dd>
              <dt className="text-slate-500">Region</dt>
              <dd className="text-right">{selected.region}</dd>
              <dt className="text-slate-500">Completion</dt>
              <dd className="text-right">
                {Math.round(selected.completionMs / 1000)}s
              </dd>
              <dt className="text-slate-500">Fraud Flag</dt>
              <dd className="text-right">{selected.fraudFlag ? "Yes" : "No"}</dd>
              <dt className="text-slate-500">Created</dt>
              <dd className="text-right">{fmtTime(selected.createdAt)}</dd>
            </dl>
          </div>
        </div>
      )}
    </Card>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- VerificationsTable`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add components/VerificationsTable.tsx components/__tests__/VerificationsTable.test.tsx
git commit -m "feat: add recent verifications table with detail drawer"
```

---

### Task 9: Dashboard page wiring

**Files:**
- Modify: `app/page.tsx` (replace placeholder from Task 1)

**Interfaces:**
- Consumes: `getKpis`, `getVolumeSeries`, `getBreakdowns`, `getVerifications` from `idvService`; `RANGES`, types; all widgets.
- Produces: the complete dashboard. Owns `range`, table `outcome`/`documentType`/`page` state; fetches via service in effects.

- [ ] **Step 1: Replace `app/page.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { DateRangeFilter } from "@/components/DateRangeFilter";
import { KpiCards } from "@/components/KpiCards";
import { VolumeChart } from "@/components/VolumeChart";
import { BreakdownCharts } from "@/components/BreakdownCharts";
import { VerificationsTable } from "@/components/VerificationsTable";
import {
  getBreakdowns,
  getKpis,
  getVerifications,
  getVolumeSeries,
} from "@/lib/data/idvService";
import {
  RANGES,
  type Breakdowns,
  type DocumentType,
  type KpiSummary,
  type Outcome,
  type Paginated,
  type RangeKey,
  type Verification,
  type VolumePoint,
} from "@/lib/data/types";

const PAGE_SIZE = 10;

export default function Home() {
  const [rangeKey, setRangeKey] = useState<RangeKey>("30d");
  const [kpis, setKpis] = useState<KpiSummary | null>(null);
  const [volume, setVolume] = useState<VolumePoint[]>([]);
  const [breakdowns, setBreakdowns] = useState<Breakdowns | null>(null);

  const [outcome, setOutcome] = useState<Outcome | undefined>();
  const [documentType, setDocumentType] = useState<DocumentType | undefined>();
  const [page, setPage] = useState(1);
  const [table, setTable] = useState<Paginated<Verification> | null>(null);

  const range = RANGES[rangeKey];

  useEffect(() => {
    let active = true;
    Promise.all([
      getKpis(range),
      getVolumeSeries(range),
      getBreakdowns(range),
    ]).then(([k, v, b]) => {
      if (!active) return;
      setKpis(k);
      setVolume(v);
      setBreakdowns(b);
    });
    return () => {
      active = false;
    };
  }, [range]);

  useEffect(() => {
    let active = true;
    getVerifications({
      range,
      outcome,
      documentType,
      page,
      pageSize: PAGE_SIZE,
    }).then((res) => {
      if (active) setTable(res);
    });
    return () => {
      active = false;
    };
  }, [range, outcome, documentType, page]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">IDV Analytics Dashboard</h1>
          <p className="text-sm text-slate-500">
            Identity verification metrics · mock data
          </p>
        </div>
        <DateRangeFilter
          value={rangeKey}
          onChange={(k) => {
            setRangeKey(k);
            setPage(1);
          }}
        />
      </header>

      <div className="space-y-6">
        {kpis && <KpiCards kpis={kpis} />}
        <VolumeChart data={volume} />
        {breakdowns && <BreakdownCharts data={breakdowns} />}
        {table && (
          <VerificationsTable
            rows={table.items}
            total={table.total}
            page={table.page}
            pageSize={table.pageSize}
            outcome={outcome}
            documentType={documentType}
            onFilterChange={(f) => {
              setOutcome(f.outcome);
              setDocumentType(f.documentType);
              setPage(1);
            }}
            onPageChange={setPage}
          />
        )}
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verify typecheck, tests, and build all pass**

Run: `npm run typecheck && npm test && npm run build`
Expected: typecheck passes; all tests pass; build emits `out/index.html`.

- [ ] **Step 3: Manually verify in dev (optional but recommended)**

Run: `npm run dev` then open `http://localhost:3000`
Expected: KPI cards, volume chart, breakdowns, and table render; range buttons and filters update the data; clicking a row opens the drawer.

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat: wire up dashboard page with all widgets"
```

---

### Task 10: GitHub Pages deploy workflow

**Files:**
- Create: `.github/workflows/deploy.yml`
- Create: `public/.nojekyll`

**Interfaces:**
- Produces: CI that builds and publishes `out/` to GitHub Pages on push to `main`.

- [ ] **Step 1: Create `public/.nojekyll`**

Create an empty file at `public/.nojekyll` (ensures GitHub Pages serves `_next/` asset folders).

```
```

- [ ] **Step 2: Create `.github/workflows/deploy.yml`**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run typecheck
      - run: npm test
      - run: npm run build
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./out

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/deploy.yml public/.nojekyll
git commit -m "ci: add GitHub Pages deploy workflow"
```

- [ ] **Step 4: Enable Pages and push**

Run:
```bash
gh api -X POST repos/ashwarya1kgit/IDV-DASHBOARD/pages -f build_type=workflow 2>/dev/null || \
  gh api -X PUT repos/ashwarya1kgit/IDV-DASHBOARD/pages -f build_type=workflow
git push origin main
```
Expected: Pages source set to "GitHub Actions"; push triggers the workflow.

- [ ] **Step 5: Verify deployment**

Run: `gh run watch` (or `gh run list --limit 1`)
Expected: workflow succeeds; site live at `https://ashwarya1kgit.github.io/IDV-DASHBOARD/`.

---

## Self-Review

**Spec coverage:**
- KPI summary cards → Task 6 ✓
- Volume over time → Task 7 ✓
- Outcome/document/region breakdowns → Task 7 ✓
- Recent verifications table + drawer + filters → Task 8 ✓
- Date-range filter → Task 6 ✓
- Typed data layer / provider swap → Tasks 2–4 ✓
- Deterministic mock → Task 3 ✓
- Static export + basePath → Task 1 ✓
- GitHub Pages deploy → Task 10 ✓
- Tests (mock determinism, KPI trend, component smoke) → Tasks 2,3,5,6,7,8 ✓
- Error/empty states → empty-state row in Task 8; loading handled via conditional render in Task 9 ✓

**Type consistency:** `KpiMetric`/`KpiSummary`, `VolumePoint`, `Breakdowns`/`BreakdownSlice`, `Paginated<T>`, `VerificationFilter` defined in Task 2 and used identically in Tasks 3,4,6,7,8,9. Service function names (`getKpis`, `getVolumeSeries`, `getBreakdowns`, `getVerifications`) match between Task 4 and Task 9.

**Placeholder scan:** No TBD/TODO; all steps include complete code or exact commands.
