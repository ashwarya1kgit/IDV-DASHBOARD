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
