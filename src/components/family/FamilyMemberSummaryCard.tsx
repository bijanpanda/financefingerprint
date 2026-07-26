"use client";

import { useState } from "react";
import { LineItem, ExpenseItem, Currency } from "@/types";
import { formatCurrency } from "@/utils/currency";
import BudgetSummary from "@/components/BudgetSummary";

interface RecentEdit {
  editedByName: string;
  changeSummary: string;
  createdAt: string;
}

interface Props {
  displayName: string;
  role: "principal" | "child";
  isSelf: boolean;
  currency: Currency;
  incomeItems: LineItem[];
  expenseItems: ExpenseItem[];
  savingsItems: LineItem[];
  recentEdits?: RecentEdit[];
  onEditClick?: () => void;
}

function ReadOnlyRow({ name, planned, actual, currency, tag }: { name: string; planned: number; actual: number; currency: Currency; tag?: string }) {
  return (
    <div className="flex items-center gap-2 py-1.5 px-3 text-sm">
      <span className="flex-1 text-slate-700">
        {name} {tag && <span className="text-xs text-slate-400">· {tag}</span>}
      </span>
      <span className="w-24 text-right text-slate-500">{formatCurrency(planned, currency)}</span>
      <span className="w-24 text-right text-slate-500">{formatCurrency(actual, currency)}</span>
    </div>
  );
}

export default function FamilyMemberSummaryCard({
  displayName, role, isSelf, currency, incomeItems, expenseItems, savingsItems, recentEdits, onEditClick,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  const totalIncomePlanned = incomeItems.reduce((s, i) => s + i.planned, 0);
  const totalIncomeActual = incomeItems.reduce((s, i) => s + i.actual, 0);
  const totalExpensePlanned = expenseItems.reduce((s, i) => s + i.planned, 0);
  const totalExpenseActual = expenseItems.reduce((s, i) => s + i.actual, 0);
  const totalSavingsPlanned = savingsItems.reduce((s, i) => s + i.planned, 0);
  const totalSavingsActual = savingsItems.reduce((s, i) => s + i.actual, 0);

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-base font-bold text-slate-800">
            {displayName} {isSelf && <span className="text-sm font-normal text-gray-400">(you)</span>}
          </p>
          <span className="text-xs font-semibold bg-teal-100 text-teal-700 px-2.5 py-0.5 rounded-full">
            {role === "principal" ? "Principal" : "Child"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {onEditClick && (
            <button
              onClick={onEditClick}
              className="text-sm font-semibold text-teal-600 hover:underline"
            >
              Edit budget
            </button>
          )}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            {expanded ? "Hide details" : "Show details"}
          </button>
        </div>
      </div>

      <BudgetSummary
        totalIncomePlanned={totalIncomePlanned} totalIncomeActual={totalIncomeActual}
        totalExpensePlanned={totalExpensePlanned} totalExpenseActual={totalExpenseActual}
        totalSavingsPlanned={totalSavingsPlanned} totalSavingsActual={totalSavingsActual}
        currency={currency}
      />

      {expanded && (
        <div className="mt-4 space-y-4">
          {incomeItems.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 px-3">Income</p>
              {incomeItems.map((i) => <ReadOnlyRow key={i.id} name={i.name} planned={i.planned} actual={i.actual} currency={currency} />)}
            </div>
          )}
          {expenseItems.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 px-3">Expenses</p>
              {expenseItems.map((i) => <ReadOnlyRow key={i.id} name={i.name} planned={i.planned} actual={i.actual} currency={currency} tag={i.subHead} />)}
            </div>
          )}
          {savingsItems.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 px-3">Savings</p>
              {savingsItems.map((i) => <ReadOnlyRow key={i.id} name={i.name} planned={i.planned} actual={i.actual} currency={currency} />)}
            </div>
          )}
        </div>
      )}

      {recentEdits && recentEdits.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Recent Edits</p>
          <div className="space-y-1">
            {recentEdits.map((e, i) => (
              <p key={i} className="text-xs text-gray-500">
                <span className="font-medium text-slate-600">{e.editedByName}</span>: {e.changeSummary}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
