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
