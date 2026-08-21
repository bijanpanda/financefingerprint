"use client";

import { useState } from "react";
import { RetirementPlanDoc } from "@/lib/retirementDb";
import { deriveAnnualExpense } from "@/utils/retirementFromBudget";
import { formatCurrency } from "@/utils/currency";
import RateInput from "./RateInput";

interface Props {
  plan: RetirementPlanDoc;
  userId: string;
  blendedAccountReturn: number | null;
  onChange: (patch: Partial<RetirementPlanDoc>) => void;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block mb-3">
      <span className="profile-label">{label}</span>
      {children}
    </label>
  );
}

function pct(fraction: number): string {
  return (fraction * 100).toFixed(2);
}

export default function AssumptionsRail({ plan, userId, blendedAccountReturn, onChange }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  async function refreshFromBudget() {
    setRefreshing(true);
    const derived = await deriveAnnualExpense(userId);
    onChange({
      annualLivingExpense: derived.annual ?? plan.annualLivingExpense,
      livingExpenseSource: derived.source,
      livingExpenseDerivedAt: derived.annual != null ? new Date().toISOString() : plan.livingExpenseDerivedAt,
    });
    setRefreshing(false);
  }

  const expenseProvenance =
    plan.livingExpenseSource === "budget"
      ? "From your budget · 12 months"
      : plan.livingExpenseSource === "budget-annualised"
        ? "Estimated from your budget"
        : "Your number";

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-4 py-3.5 lg:cursor-default"
      >
        <span className="profile-label mb-0">Assumptions</span>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform lg:hidden ${collapsed ? "" : "rotate-180"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div className={`px-4 pb-4 ${collapsed ? "hidden lg:block" : ""}`}>
        <Field label="Current age">
          <input
            type="number"
            className="profile-input"
            value={plan.currentAge}
            min={18}
            max={90}
            onChange={(e) => onChange({ currentAge: Number(e.target.value) })}
          />
        </Field>

        <Field label="Country of residence">
          <input
            type="text"
            className="profile-input"
            value={plan.country}
            onChange={(e) => onChange({ country: e.target.value.toUpperCase() })}
          />
        </Field>

        <Field label="Retirement age">
          <input
            type="number"
            className="profile-input"
            value={plan.retirementAge}
            onChange={(e) => onChange({ retirementAge: Number(e.target.value) })}
          />
        </Field>

        <Field label="Life expectancy">
          <input
            type="number"
            className="profile-input"
            value={plan.lifeExpectancy}
            onChange={(e) => onChange({ lifeExpectancy: Number(e.target.value) })}
          />
        </Field>

        <Field label="Inflation %">
          <RateInput
            className="profile-input"
            value={plan.inflationRate}
            onChange={(v) => v != null && onChange({ inflationRate: v })}
          />
        </Field>

        <Field label="Return, working years %">
          <RateInput
            className="profile-input"
            value={plan.returnRatePre}
            onChange={(v) => v != null && onChange({ returnRatePre: v })}
          />
          {blendedAccountReturn != null && (
            <button
              type="button"
              onClick={() => onChange({ returnRatePre: blendedAccountReturn })}
              className="text-xs text-teal-700 mt-1 hover:underline"
            >
              Blended from accounts: {pct(blendedAccountReturn)}% · use this
            </button>
          )}
        </Field>

        <Field label="Return, retirement %">
          <RateInput
            className="profile-input"
            value={plan.returnRatePost}
            onChange={(v) => v != null && onChange({ returnRatePost: v })}
          />
        </Field>

        <Field label="Savings mode">
          <div className="flex rounded-xl border-2 border-slate-200 overflow-hidden">
            {(["indexed", "flat"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => onChange({ savingsMode: mode })}
                className={`flex-1 py-2 text-sm font-medium capitalize transition-colors ${
                  plan.savingsMode === mode ? "bg-[var(--bg-success)] text-white" : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Annual savings">
          <input
            type="number"
            className="profile-input"
            value={plan.annualSavings}
            onChange={(e) => onChange({ annualSavings: Number(e.target.value) })}
          />
        </Field>

        <Field label="Living expense / year">
          <input
            type="number"
            className="profile-input"
            value={plan.annualLivingExpense}
            onChange={(e) =>
              onChange({
                annualLivingExpense: Number(e.target.value),
                livingExpenseSource: "manual",
              })
            }
          />
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-[var(--text-muted)]">
              {expenseProvenance} · {formatCurrency(plan.annualLivingExpense, plan.baseCurrency)}
            </span>
            <button
              type="button"
              onClick={refreshFromBudget}
              disabled={refreshing}
              className="text-xs text-teal-700 hover:underline disabled:opacity-50"
            >
              {refreshing ? "Refreshing…" : "Use my budget"}
            </button>
          </div>
        </Field>
      </div>
    </div>
  );
}
