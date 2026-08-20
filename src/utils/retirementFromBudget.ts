import { getBudgetMonths, getExpenseItems, getSavingsItems } from "@/lib/db";
import { ExpenseSubHead } from "@/types";

export type BudgetDerivationSource = "budget" | "budget-annualised" | "manual";

export interface BudgetDerivation {
  annual: number | null;
  monthsUsed: number;
  source: BudgetDerivationSource;
}

// §4 — which sub-heads carry into retirement. Loans excluded by default: most
// end before retirement, and a loan that outlives it is better modelled as a
// goal (§5) than folded into the monthly budget.
export const INCLUDED_EXPENSE_SUBHEADS: ExpenseSubHead[] = [
  "Housing & Necessities",
  "Food",
  "Transportation",
  "Subscriptions",
  "Lifestyle",
  "Insurance",
];

function itemValue(item: { planned: number; actual: number }): number {
  return item.actual > 0 ? item.actual : item.planned;
}

async function deriveAnnual(
  uid: string,
  monthTotal: (monthId: string) => Promise<number | null>
): Promise<BudgetDerivation> {
  const months = await getBudgetMonths(uid);
  const perMonth: number[] = [];

  for (const month of months) {
    const total = await monthTotal(month.id);
    if (total == null) continue;
    perMonth.push(total);
    if (perMonth.length === 12) break;
  }

  if (perMonth.length === 0) {
    return { annual: null, monthsUsed: 0, source: "manual" };
  }

  const sum = perMonth.reduce((a, b) => a + b, 0);
  if (perMonth.length >= 12) {
    return { annual: sum, monthsUsed: 12, source: "budget" };
  }
  return { annual: (sum / perMonth.length) * 12, monthsUsed: perMonth.length, source: "budget-annualised" };
}

// The only place that reads budget documents for the retirement module.
export async function deriveAnnualExpense(uid: string): Promise<BudgetDerivation> {
  return deriveAnnual(uid, async (monthId) => {
    const items = await getExpenseItems(uid, monthId);
    if (items.length === 0) return null;
    return items
      .filter((i) => INCLUDED_EXPENSE_SUBHEADS.includes(i.subHead))
      .reduce((sum, i) => sum + itemValue(i), 0);
  });
}

export async function deriveAnnualSavings(uid: string): Promise<BudgetDerivation> {
  return deriveAnnual(uid, async (monthId) => {
    const items = await getSavingsItems(uid, monthId);
    if (items.length === 0) return null;
    return items.reduce((sum, i) => sum + itemValue(i), 0);
  });
}
