"use client";

import { Currency } from "@/types";
import { formatCurrency } from "@/utils/currency";

interface Props {
  totalIncomePlanned: number;
  totalIncomeActual: number;
  totalExpensePlanned: number;
  totalExpenseActual: number;
  totalSavingsPlanned: number;
  totalSavingsActual: number;
  currency: Currency;
}

interface MetricCardProps {
  label: string;
  planned: number;
  actual: number;
  currency: Currency;
  color: "green" | "red" | "blue" | "neutral";
  sign?: "income" | "expense";
}

function MetricCard({ label, planned, actual, currency, color, sign }: MetricCardProps) {
  const pct = planned > 0 ? Math.min(100, (actual / planned) * 100) : 0;

  const numColor =
    color === "green" ? "text-teal-600" :
    color === "red"   ? "text-rose-500" :
    color === "blue"  ? "text-blue-600" :
    planned < 0 ? "text-rose-500" : "text-slate-700";

  const barColor =
    color === "green" ? "bg-teal-500" :
    color === "red"   ? "bg-rose-500" :
    color === "blue"  ? "bg-blue-500" :
    "bg-slate-400";

  const subText =
    sign === "income"  ? `${formatCurrency(actual, currency)} received` :
    sign === "expense" ? `${formatCurrency(actual, currency)} spent` :
                         `${formatCurrency(actual, currency)} actual`;

  return (
    <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-bold mt-1.5 ${numColor}`}>{formatCurrency(planned, currency)}</p>
      <p className="text-xs text-slate-400 mt-1">{subText}</p>
      <div className="mt-3 h-[3px] bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-300 ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function BudgetSummary({
  totalIncomePlanned, totalIncomeActual,
  totalExpensePlanned, totalExpenseActual,
  totalSavingsPlanned, totalSavingsActual,
  currency,
}: Props) {
  const plannedBalance = totalIncomePlanned - totalExpensePlanned - totalSavingsPlanned;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard label="Total Income"   planned={totalIncomePlanned}   actual={totalIncomeActual}   currency={currency} color="green"   sign="income" />
        <MetricCard label="Total Expenses" planned={totalExpensePlanned}  actual={totalExpenseActual}  currency={currency} color="red"     sign="expense" />
        <MetricCard label="Total Savings"  planned={totalSavingsPlanned}  actual={totalSavingsActual}  currency={currency} color="blue" />
        <MetricCard label="Net Balance"    planned={plannedBalance} actual={totalIncomeActual - totalExpenseActual - totalSavingsActual} currency={currency} color="neutral" />
      </div>

      {totalIncomePlanned > 0 && plannedBalance > 0.01 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          {formatCurrency(plannedBalance, currency)} unallocated — assign it to an expense or savings head.
        </div>
      )}
      {totalIncomePlanned > 0 && plannedBalance < -0.01 && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Over budget by {formatCurrency(Math.abs(plannedBalance), currency)} — review your allocations.
        </div>
      )}
    </div>
  );
}
