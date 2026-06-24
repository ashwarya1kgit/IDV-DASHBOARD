# IDV Analytics Dashboard

An identity-verification (IDV) analytics dashboard: KPI summary cards, verification
volume over time, outcome/document/region breakdowns, and a filterable recent-sessions
table with detail drawer.

**Live demo:** https://ashwarya1kgit.github.io/IDV-DASHBOARD/

> Runs on deterministic **mock data** today. The data layer (`lib/data/idvService.ts`)
> is a typed interface designed so a real-time MongoDB-backed provider can replace the
> mock provider later with a localized change.

## Tech Stack

- Next.js 15 (App Router) + TypeScript, static export (`output: 'export'`)
- Tailwind CSS · Recharts · lucide-react
- Vitest + Testing Library
- Auto-deployed to GitHub Pages via GitHub Actions on push to `main`

## Local Development

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # run the test suite
npm run build      # static export to ./out
```

## Project Structure

- `app/page.tsx` — dashboard shell; owns date-range/filter state, fetches via the service
- `components/` — presentational widgets (KPI cards, charts, table)
- `lib/data/` — domain types, deterministic mock provider, and the service interface

## Documentation

- Design spec: `docs/superpowers/specs/2026-06-24-idv-analytics-dashboard-design.md`
- Implementation plan: `docs/superpowers/plans/2026-06-24-idv-analytics-dashboard.md`
