"use client";

import { Currency } from "@/types";
import { ProjectionResult, RetirementPlan, SolveLever } from "@/types/retirement";
import { formatCurrency } from "@/utils/currency";

interface Props {
  plan: RetirementPlan;
  projection: ProjectionResult;
  currency: Currency;
  solveTiles: Partial<Record<SolveLever, number | null>> | null;
  bareSurvivalSavings: number | null;
  stressDepletionAge: number | null;
  onApply: (lever: SolveLever, value: number) => void;
}

const TILE_META: { lever: SolveLever; label: string; suffix: string; format: (v: number, currency: Currency) => string }[] = [
  { lever: "savings", label: "Required savings", suffix: "/ yr", format: (v, c) => formatCurrency(v, c) },
  { lever: "returnPre", label: "Return, working", suffix: "", format: (v) => `${(v * 100).toFixed(2)}%` },
  { lever: "income", label: "Rental income", suffix: "/ yr", format: (v, c) => formatCurrency(v, c) },
  { lever: "retirementAge", label: "Retire later", suffix: "", format: (v) => `Age ${v}` },
  { lever: "livingExpense", label: "Spend less", suffix: "/ yr", format: (v, c) => formatCurrency(v, c) },
];

export default function VerdictBanner({
  plan,
  projection,
  currency,
  solveTiles,
  bareSurvivalSavings,
  stressDepletionAge,
  onApply,
}: Props) {
  const lastRow = projection.rows[projection.rows.length - 1];
  const reachedLifeExpectancy = lastRow.age === plan.lifeExpectancy;

  const headline = projection.passes
    ? `Reaches ${plan.lifeExpectancy} with ${formatCurrency(lastRow.endToday, currency)} in today's money to spare`
    : reachedLifeExpectancy
      ? lastRow.endNominal < 0
        ? `The money reaches ${plan.lifeExpectancy} and then stops — ${formatCurrency(Math.abs(lastRow.endNominal), currency)} short in nominal terms`
        : `Reaches ${plan.lifeExpectancy} with nothing behind it — short of the two-year buffer`
      : `Runs out at age ${projection.depletionAge}, ${plan.lifeExpectancy - (projection.depletionAge ?? plan.lifeExpectancy)} years early`;

  return (
    <div className={`glass-card rounded-2xl p-5 border-l-4 ${projection.passes ? "border-l-[var(--accent-teal)]" : "border-l-[var(--fill-danger)]"}`}>
      <p className="text-[17px] font-semibold text-slate-800 leading-snug">{headline}</p>

      {projection.passes ? (
        <p className="text-sm text-[var(--text-muted)] mt-1">
          {stressDepletionAge != null
            ? `A point lower on returns would have failed at age ${stressDepletionAge}.`
            : "Holds even with returns a point lower."}
        </p>
      ) : (
        bareSurvivalSavings != null && (
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Bare survival — no buffer — is cheaper: {formatCurrency(bareSurvivalSavings, currency)}/yr in savings alone.
          </p>
        )
      )}

      {solveTiles && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 mt-4">
          {TILE_META.map(({ lever, label, suffix, format }) => {
            const value = solveTiles[lever];
            if (value == null) return null;
            return (
              <button
                key={lever}
                onClick={() => onApply(lever, value)}
                className="text-left px-3 py-2.5 rounded-xl border border-slate-200 hover:border-teal-300 hover:bg-teal-50/50 transition-colors"
              >
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
                <p className="text-sm font-bold text-slate-800">
                  {format(value, currency)} {suffix}
                </p>
                <p className="text-[11px] text-teal-700">apply →</p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
