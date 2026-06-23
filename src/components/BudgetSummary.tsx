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

export default function BudgetSummary({
  totalIncomePlanned,
  totalIncomeActual,
  totalExpensePlanned,
  totalExpenseActual,
  totalSavingsPlanned,
  totalSavingsActual,
  currency,
}: Props) {
  const plannedBalance = totalIncomePlanned - totalExpensePlanned - totalSavingsPlanned;
  const actualBalance = totalIncomeActual - totalExpenseActual - totalSavingsActual;
  const isBalanced = Math.abs(plannedBalance) < 0.01;

  return (
    <div className="space-y-3">
      {!isBalanced && totalIncomePlanned > 0 && plannedBalance > 0 && (
        <div className="bg-amber-50 border border-amber-300 text-amber-800 px-4 py-3 rounded-2xl text-sm font-medium flex items-center gap-2">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          You have an extra {formatCurrency(plannedBalance, currency)} unallocated. Please allocate it to an expense or savings head.
        </div>
      )}

      {!isBalanced && totalIncomePlanned > 0 && plannedBalance < 0 && (
        <div className="bg-rose-50 border border-rose-300 text-rose-800 px-4 py-3 rounded-2xl text-sm font-medium flex items-center gap-2">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          You are over budget by {formatCurrency(Math.abs(plannedBalance), currency)}. Please review your expense or savings allocations.
        </div>
      )}

      {isBalanced && totalIncomePlanned > 0 && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-2xl text-sm font-medium flex items-center gap-2">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Budget is balanced! Every unit is allocated.
        </div>
      )}

      <div className="glass-card rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gradient-to-r from-slate-50 to-gray-50">
            <tr>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Category</th>
              <th className="text-right px-5 py-3 font-semibold text-gray-600">Planned</th>
              <th className="text-right px-5 py-3 font-semibold text-gray-600">Actual</th>
              <th className="text-right px-5 py-3 font-semibold text-gray-600">Remaining</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-gray-100">
              <td className="px-5 py-3 font-medium text-emerald-700">Total Income</td>
              <td className="px-5 py-3 text-right">{formatCurrency(totalIncomePlanned, currency)}</td>
              <td className="px-5 py-3 text-right">{formatCurrency(totalIncomeActual, currency)}</td>
              <td className="px-5 py-3 text-right">{formatCurrency(totalIncomePlanned - totalIncomeActual, currency)}</td>
            </tr>
            <tr className="border-t border-gray-100">
              <td className="px-5 py-3 font-medium text-rose-700">Total Expenses</td>
              <td className="px-5 py-3 text-right">{formatCurrency(totalExpensePlanned, currency)}</td>
              <td className="px-5 py-3 text-right">{formatCurrency(totalExpenseActual, currency)}</td>
              <td className="px-5 py-3 text-right">{formatCurrency(totalExpensePlanned - totalExpenseActual, currency)}</td>
            </tr>
            <tr className="border-t border-gray-100">
              <td className="px-5 py-3 font-medium text-blue-700">Total Savings</td>
              <td className="px-5 py-3 text-right">{formatCurrency(totalSavingsPlanned, currency)}</td>
              <td className="px-5 py-3 text-right">{formatCurrency(totalSavingsActual, currency)}</td>
              <td className="px-5 py-3 text-right">{formatCurrency(totalSavingsPlanned - totalSavingsActual, currency)}</td>
            </tr>
            <tr className="border-t-2 border-gray-200 bg-gradient-to-r from-slate-50 to-gray-50">
              <td className="px-5 py-3 font-bold">Net Balance</td>
              <td className={`px-5 py-3 text-right font-bold ${plannedBalance < 0 ? "text-rose-600" : "text-emerald-600"}`}>
                {formatCurrency(plannedBalance, currency)}
              </td>
              <td className={`px-5 py-3 text-right font-bold ${actualBalance < 0 ? "text-rose-600" : "text-emerald-600"}`}>
                {formatCurrency(actualBalance, currency)}
              </td>
              <td className="px-5 py-3 text-right font-bold">
                {formatCurrency(plannedBalance - actualBalance, currency)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
