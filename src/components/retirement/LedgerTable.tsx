"use client";

import { useState } from "react";
import { Currency } from "@/types";
import { ProjectionResult } from "@/types/retirement";
import { formatCurrency } from "@/utils/currency";

interface Props {
  projection: ProjectionResult;
  currency: Currency;
  retirementAge: number;
}

export default function LedgerTable({ projection, currency, retirementAge }: Props) {
  const [view, setView] = useState<"today" | "nominal">("today");

  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="profile-label mb-0">Year-by-year ledger</span>
        <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs">
          {(["today", "nominal"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-2.5 py-1 font-medium transition-colors ${
                view === v ? "bg-[var(--bg-success)] text-white" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              {v === "today" ? "Today's money" : "Nominal"}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm tabular-nums">
          <thead>
            <tr className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide sticky top-0 bg-[var(--surface-0)]">
              <th className="py-2 pr-3 sticky left-0 bg-[var(--surface-0)]">Age</th>
              <th className="py-2 pr-3">Beginning</th>
              <th className="py-2 pr-3">In</th>
              <th className="py-2 pr-3">Expense</th>
              <th className="py-2 pr-3">For</th>
              <th className="py-2 pr-3">Earning</th>
              <th className="py-2 pr-3 sticky right-0 bg-[var(--surface-0)]">End</th>
            </tr>
          </thead>
          <tbody>
            {projection.rows.map((row) => (
              <tr
                key={row.age}
                className={`border-t border-[var(--border-default)] ${row.age >= retirementAge ? "bg-slate-50/50" : ""}`}
              >
                <td className="py-1.5 pr-3 font-medium sticky left-0 bg-inherit">
                  {row.age === retirementAge && "▸ "}
                  {row.age}
                </td>
                <td className="py-1.5 pr-3">{formatCurrency(row.beginBalance, currency)}</td>
                <td className="py-1.5 pr-3">{row.in > 0 ? formatCurrency(row.in, currency) : "—"}</td>
                <td className="py-1.5 pr-3">{row.expense > 0 ? formatCurrency(row.expense, currency) : "—"}</td>
                <td className="py-1.5 pr-3 text-[var(--text-muted)]">{row.expenseFor ?? "—"}</td>
                <td className="py-1.5 pr-3">{formatCurrency(row.earning, currency)}</td>
                <td className={`py-1.5 pr-3 font-semibold sticky right-0 bg-inherit ${(view === "today" ? row.endToday : row.endNominal) < 0 ? "text-[var(--fill-danger)]" : ""}`}>
                  {formatCurrency(view === "today" ? row.endToday : row.endNominal, currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {projection.depletionAge != null && (
        <p className="text-xs text-[var(--fill-danger)] mt-2">
          Plan depleted at age {projection.depletionAge} — {projection.rows.length} rows shown, not the full range.
        </p>
      )}
    </div>
  );
}
