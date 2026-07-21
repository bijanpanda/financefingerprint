"use client";

import { ExpenseItem, ExpenseSubHead, Currency } from "@/types";
import { EXPENSE_SUBHEAD_ORDER } from "@/utils/defaults";
import { formatCurrency } from "@/utils/currency";

const COLORS: Record<ExpenseSubHead, string> = {
  "Housing & Necessities": "#6366f1",
  Food: "#f59e0b",
  Transportation: "#3b82f6",
  Subscriptions: "#ec4899",
  Lifestyle: "#8b5cf6",
  Insurance: "#14b8a6",
  Loans: "#ef4444",
};

interface Props {
  items: ExpenseItem[];
  currency: Currency;
}

interface BarRowProps {
  category: string;
  planned: number;
  actual: number;
  currency: Currency;
  color: string;
}

function BarRow({ category, planned, actual, currency, color }: BarRowProps) {
  const pct = planned > 0 ? Math.min(100, (actual / planned) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-600 font-medium">{category}</span>
        <span className="text-xs text-slate-400">
          {formatCurrency(actual, currency)}
          <span className="text-slate-300"> / </span>
          {formatCurrency(planned, currency)}
        </span>
      </div>
      <div className="h-[6px] bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export default function ExpensePieChart({ items, currency }: Props) {
  const rows = EXPENSE_SUBHEAD_ORDER
    .map((subHead) => ({
      subHead,
      planned: items.filter((i) => i.subHead === subHead).reduce((s, i) => s + i.planned, 0),
      actual: items.filter((i) => i.subHead === subHead).reduce((s, i) => s + i.actual, 0),
    }))
    .filter((r) => r.planned > 0);

  const hasAnyActual = items.some((i) => i.actual > 0);
  const hasAnyPlanned = rows.length > 0;

  return (
    <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
      <h3 className="text-base font-semibold text-slate-800 mb-4">Planned spending</h3>

      {!hasAnyPlanned ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-sm text-slate-400">Add planned amounts to your expense categories to see the breakdown.</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {rows.map(({ subHead, planned, actual }) => (
            <BarRow
              key={subHead}
              category={subHead}
              planned={planned}
              actual={actual}
              currency={currency}
              color={COLORS[subHead]}
            />
          ))}

          {!hasAnyActual && (
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <svg className="w-4 h-4 text-slate-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-[11px] text-slate-400">No transactions yet. Log your first expense above.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
