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
