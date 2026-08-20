"use client";

import { useState } from "react";
import { CATEGORY_INFLATION, Goal, GoalCategory } from "@/types/retirement";
import { formatCurrency } from "@/utils/currency";
import { Currency } from "@/types";
import MiniField from "./MiniField";

interface Props {
  goals: Goal[];
  currentAge: number;
  countryInflationRate: number;
  baseCurrency: Currency;
  onChange: (goals: Goal[]) => void;
}

const CATEGORY_LABELS: Record<GoalCategory, string> = {
  child_education: "Child education",
  wedding: "Wedding",
  home_down_payment: "Home / down payment",
  vehicle_purchase: "Vehicle purchase",
  medical_care: "Medical / long-term care",
  travel: "Travel",
  loan_payoff: "Loan payoff",
  custom: "Custom",
};

const PRESETS: { category: GoalCategory; label: string; durationYears: number; everyNYears: number | null }[] = [
  { category: "child_education", label: "Child education", durationYears: 4, everyNYears: null },
  { category: "wedding", label: "Wedding", durationYears: 1, everyNYears: null },
  { category: "home_down_payment", label: "Home down payment", durationYears: 1, everyNYears: null },
  { category: "vehicle_purchase", label: "Vehicle purchase", durationYears: 1, everyNYears: 7 },
  { category: "medical_care", label: "Medical / long-term care", durationYears: 10, everyNYears: null },
  { category: "travel", label: "Travel", durationYears: 5, everyNYears: null },
  { category: "loan_payoff", label: "Loan payoff", durationYears: 10, everyNYears: null },
];

function goalRate(goal: Goal, countryInflationRate: number): number {
  if (goal.inflationRate != null) return goal.inflationRate;
  if (goal.category !== "custom") return CATEGORY_INFLATION[goal.category];
  return countryInflationRate;
}

function futureValue(goal: Goal, currentAge: number, countryInflationRate: number): number {
  const rate = goalRate(goal, countryInflationRate);
  return goal.amountPerYear * Math.pow(1 + rate, Math.max(0, goal.startAge - currentAge));
}

export default function GoalList({ goals, currentAge, countryInflationRate, baseCurrency, onChange }: Props) {
  const [collapsed, setCollapsed] = useState(true);

  function update(id: string, patch: Partial<Goal>) {
    onChange(goals.map((g) => (g.id === id ? { ...g, ...patch } : g)));
  }

  function remove(id: string) {
    onChange(goals.filter((g) => g.id !== id));
  }

  function addPreset(preset: (typeof PRESETS)[number]) {
    onChange([
      ...goals,
      {
        id: `goal-${Date.now()}`,
        label: preset.label,
        amountPerYear: 0,
        startAge: currentAge + 5,
        durationYears: preset.durationYears,
        everyNYears: preset.everyNYears,
        category: preset.category,
        inflationRate: null,
      },
    ]);
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <button onClick={() => setCollapsed(!collapsed)} className="w-full flex items-center justify-between px-4 py-3.5">
        <span className="profile-label mb-0">Goals · {goals.length}</span>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform ${collapsed ? "" : "rotate-180"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {!collapsed && (
        <div className="px-4 pb-4 space-y-3">
          {goals.map((goal) => {
            const rate = goalRate(goal, countryInflationRate);
            const isCountryRate = goal.inflationRate == null && goal.category === "custom";
            return (
              <div key={goal.id} className="border border-slate-200 rounded-xl p-3 space-y-2">
                <div className="flex items-end gap-2">
                  <MiniField label="Label — your name for this goal">
                    <input
                      type="text"
                      placeholder="e.g. Priya's college fund"
                      className="profile-input flex-1"
                      value={goal.label}
                      onChange={(e) => update(goal.id, { label: e.target.value })}
                    />
                  </MiniField>
                  <button onClick={() => remove(goal.id)} className="text-slate-400 hover:text-red-500 shrink-0 px-1 pb-2.5" aria-label="Remove goal">
                    ×
                  </button>
                </div>

                <MiniField label="Category — sets the default inflation rate">
                  <select
                    className="profile-input"
                    value={goal.category}
                    onChange={(e) => update(goal.id, { category: e.target.value as GoalCategory })}
                  >
                    {(Object.keys(CATEGORY_LABELS) as GoalCategory[]).map((c) => (
                      <option key={c} value={c}>
                        {CATEGORY_LABELS[c]}
                      </option>
                    ))}
                  </select>
                </MiniField>

                <div className="space-y-2">
                  <MiniField label="Amount / yr, today's money">
                    <input
                      type="number"
                      className="profile-input"
                      value={goal.amountPerYear}
                      onChange={(e) => update(goal.id, { amountPerYear: Number(e.target.value) })}
                    />
                  </MiniField>
                  <MiniField label="Start age">
                    <input
                      type="number"
                      className="profile-input"
                      value={goal.startAge}
                      onChange={(e) => update(goal.id, { startAge: Number(e.target.value) })}
                    />
                  </MiniField>
                  <MiniField label="Duration, years">
                    <input
                      type="number"
                      className="profile-input"
                      value={goal.durationYears}
                      onChange={(e) => update(goal.id, { durationYears: Number(e.target.value) })}
                    />
                  </MiniField>
                </div>

                <MiniField label="Rate override % — blank uses the category rate shown alongside">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      placeholder="blank = default"
                      className="profile-input flex-1"
                      value={goal.inflationRate != null ? (goal.inflationRate * 100).toFixed(1) : ""}
                      onChange={(e) =>
                        update(goal.id, {
                          inflationRate: e.target.value === "" ? null : Number(e.target.value) / 100,
                        })
                      }
                    />
                    <span className="text-xs text-[var(--text-muted)] whitespace-nowrap">
                      {(rate * 100).toFixed(1)}% {isCountryRate ? "· country rate" : "· category rate"}
                    </span>
                  </div>
                </MiniField>

                <p className="text-xs text-[var(--text-muted)]">
                  At age {goal.startAge}: {formatCurrency(futureValue(goal, currentAge, countryInflationRate), baseCurrency)}
                </p>
              </div>
            );
          })}

          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((preset) => (
              <button
                key={preset.category}
                onClick={() => addPreset(preset)}
                className="px-2.5 py-1.5 rounded-lg border border-dashed border-slate-200 text-xs text-slate-500 hover:border-teal-300 hover:text-teal-700 transition-colors"
              >
                + {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
