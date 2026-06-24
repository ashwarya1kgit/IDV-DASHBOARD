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
