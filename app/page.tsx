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
