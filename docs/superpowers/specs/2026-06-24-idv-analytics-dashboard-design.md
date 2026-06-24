# IDV Analytics Dashboard — Design

**Date:** 2026-06-24
**Status:** Approved (pending spec review)
**Repo:** ashwarya1kgit/IDV-DASHBOARD

## Purpose

An identity-verification (IDV) **analytics/metrics dashboard**: aggregate KPIs and
charts summarizing verification activity — volume over time, pass/fail rates, fraud
flags, completion time, and breakdowns by document type and region — plus a
filterable table of recent verification sessions.

Built with mock data now, structured so a real-time MongoDB-backed API can replace
the data source later with a localized change.

## Goals

- A polished, responsive analytics dashboard reviewers can open via a live link.
- Deployed free to **GitHub Pages** at `https://ashwarya1kgit.github.io/IDV-DASHBOARD/`.
- A typed data layer that makes the future MongoDB swap a single-file change.

## Non-Goals (YAGNI)

- No authentication / user management (this is a metrics view).
- No real backend or database in this iteration.
- No admin/configuration screens, no write operations.
- No real IDV vendor integration yet.

## Key Architectural Decision: Data Layer vs. Deployment

GitHub Pages requires Next.js **static export** (`output: 'export'`) — no server at
runtime. "MongoDB later" requires a server/API. These are reconciled with a single
typed service interface:

- All data access goes through `lib/data/idvService.ts`, exposing async functions:
  - `getKpis(range): Promise<KpiSummary>`
  - `getVolumeSeries(range): Promise<VolumePoint[]>`
  - `getBreakdowns(range): Promise<Breakdowns>`
  - `getVerifications(filter): Promise<Paginated<Verification>>`
- Today these delegate to `mockProvider` (deterministic seeded generator).
- Later, a `mongoProvider` calls real Next.js API routes hitting MongoDB. Only the
  provider wiring in `idvService.ts` changes; **no component is touched**.
- The Pages deployment continues using the mock provider. Going live with MongoDB
  means moving to a Node host (e.g. Vercel) and flipping the active provider.

## Stack

- **Next.js (App Router) + TypeScript**, `output: 'export'`, `basePath: '/IDV-DASHBOARD'`,
  `images.unoptimized: true` (required for static export).
- **Tailwind CSS** for styling.
- **Recharts** for charts.
- **lucide-react** for icons.
- **GitHub Actions** → build + publish to GitHub Pages on push to `main`.

## Components

Each component is focused, independently understandable, and consumes only typed
data from the service layer.

- `app/page.tsx` — dashboard shell: header, global **date-range filter**
  (7d / 30d / 90d), responsive grid layout. Owns the selected range state.
- `app/layout.tsx` — root layout, fonts, Tailwind globals.
- `components/KpiCards.tsx` — 6 stat cards: total verifications, pass rate,
  fail rate, pending, avg completion time, fraud flags. Each shows a trend
  (delta vs. previous period of equal length).
- `components/VolumeChart.tsx` — stacked area chart of verifications over time,
  split by outcome (passed / failed / pending).
- `components/BreakdownCharts.tsx` — outcome donut, document-type bar chart,
  region bar chart.
- `components/VerificationsTable.tsx` — recent sessions: filterable (by outcome,
  document type), sortable, paginated; row click opens a detail drawer
  (liveness/biometric score, timestamps, document type, region, outcome).
- `components/ui/` — small shared primitives (Card, Badge, Drawer) as needed.

## Data Layer

- `lib/data/types.ts` — domain types:
  - `Outcome = 'passed' | 'failed' | 'pending'`
  - `DocumentType = 'passport' | 'drivers_license' | 'id_card'`
  - `Verification` — id, user (display name + masked id), documentType, outcome,
    livenessScore, biometricScore, region, createdAt, completionMs, fraudFlag.
  - `KpiSummary`, `VolumePoint`, `Breakdowns`, `Paginated<T>`, `DateRange`.
- `lib/data/idvService.ts` — the public interface; selects active provider.
- `lib/data/mockProvider.ts` — deterministic, seeded generator (stable across
  reloads) producing ~90 days of realistic sessions; derives KPIs, series, and
  breakdowns by filtering on the requested range.

## Data Flow

1. `app/page.tsx` holds the selected `DateRange`; the filter control updates it.
2. Each widget calls its `idvService` function with the current range/filter.
3. `idvService` delegates to the active provider (`mockProvider` now).
4. `mockProvider` returns typed, range-filtered data; components render.

KPI trend math: each metric compares the selected period against the immediately
preceding period of equal length and reports a signed percentage delta.

## Error Handling

- Service functions are async and may reject; widgets render a lightweight error
  state (inline message + retry) and a loading skeleton while pending.
- Empty ranges render an explicit "no data for this period" state, not a blank chart.

## Deployment

- `.github/workflows/deploy.yml`:
  - Triggers on push to `main`.
  - Steps: checkout → setup Node → `npm ci` → `tsc --noEmit` → `next lint` →
    `next build` (static export to `out/`) → upload Pages artifact → deploy.
  - Uses `actions/configure-pages`, `actions/upload-pages-artifact`,
    `actions/deploy-pages` with the required `pages: write` / `id-token: write`
    permissions.
- Repo setting: Pages source = "GitHub Actions".
- `next.config` `basePath`/`assetPrefix` = `/IDV-DASHBOARD` so assets resolve at
  the project subpath. A `.nojekyll` file is emitted so `_next/` assets are served.

## Testing & Quality

- `tsc --noEmit` and `next lint` run in CI before any deploy.
- Unit tests:
  - `mockProvider` produces deterministic output for a fixed seed/range.
  - KPI trend math (current vs. previous period delta) is correct.
- `next build` succeeding is the integration gate — Pages only deploys on success.

## Future Work (out of scope now)

- `mongoProvider` + Next.js API routes backed by MongoDB; move hosting to a Node
  platform for live data.
- Auth, real-time updates, configurable thresholds.
