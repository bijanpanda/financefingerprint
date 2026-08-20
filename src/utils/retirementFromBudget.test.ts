import { describe, expect, it, vi, beforeEach } from "vitest";
import { deriveAnnualExpense, deriveAnnualSavings } from "./retirementFromBudget";
import { BudgetMonth, ExpenseItem, LineItem } from "@/types";

const { getBudgetMonths, getExpenseItems, getSavingsItems } = vi.hoisted(() => ({
  getBudgetMonths: vi.fn(),
  getExpenseItems: vi.fn(),
  getSavingsItems: vi.fn(),
}));

vi.mock("@/lib/db", () => ({ getBudgetMonths, getExpenseItems, getSavingsItems }));

function month(id: string, m: number, y: number): BudgetMonth {
  return { id, month: m, year: y, createdAt: new Date() };
}

function expenseItem(subHead: ExpenseItem["subHead"], planned: number, actual = 0): ExpenseItem {
  return { id: subHead + planned, name: subHead, subHead, planned, actual, order: 0 };
}

function lineItem(name: string, planned: number, actual = 0): LineItem {
  return { id: name, name, planned, actual, order: 0 };
}

beforeEach(() => {
  getBudgetMonths.mockReset();
  getExpenseItems.mockReset();
  getSavingsItems.mockReset();
});

describe("deriveAnnualExpense", () => {
  it("no budget months exist — source manual, field empty", async () => {
    getBudgetMonths.mockResolvedValue([]);
    const result = await deriveAnnualExpense("u1");
    expect(result).toEqual({ annual: null, monthsUsed: 0, source: "manual" });
  });

  it("four budget months exist — mean × 12, flagged as an estimate", async () => {
    getBudgetMonths.mockResolvedValue([
      month("2026-04", 4, 2026),
      month("2026-03", 3, 2026),
      month("2026-02", 2, 2026),
      month("2026-01", 1, 2026),
    ]);
    // 50,000/month included spend each month.
    getExpenseItems.mockResolvedValue([
      expenseItem("Housing & Necessities", 30000),
      expenseItem("Food", 20000),
    ]);
    const result = await deriveAnnualExpense("u1");
    expect(result.source).toBe("budget-annualised");
    expect(result.monthsUsed).toBe(4);
    expect(result.annual).toBeCloseTo(50000 * 12, 0);
  });

  it("12+ months exist — sums the latest 12 exactly, source 'budget'", async () => {
    const months = Array.from({ length: 14 }, (_, i) => {
      const m = 14 - i; // descending ids so getBudgetMonths' ordering contract is exercised
      const id = `2026-${String(((m - 1) % 12) + 1).padStart(2, "0")}`;
      return month(id, m, 2026);
    });
    getBudgetMonths.mockResolvedValue(months);
    getExpenseItems.mockResolvedValue([expenseItem("Housing & Necessities", 40000)]);
    const result = await deriveAnnualExpense("u1");
    expect(result.source).toBe("budget");
    expect(result.monthsUsed).toBe(12);
    expect(result.annual).toBeCloseTo(40000 * 12, 0);
  });

  it("excludes Loans by default, uses actual over planned when actual > 0", async () => {
    getBudgetMonths.mockResolvedValue([month("2026-01", 1, 2026)]);
    getExpenseItems.mockResolvedValue([
      expenseItem("Housing & Necessities", 30000, 32000), // actual wins
      expenseItem("Loans", 15000), // excluded
    ]);
    const result = await deriveAnnualExpense("u1");
    expect(result.annual).toBeCloseTo(32000 * 12, 0);
  });

  it("months with no expense items at all are skipped, not counted as zero", async () => {
    getBudgetMonths.mockResolvedValue([month("2026-02", 2, 2026), month("2026-01", 1, 2026)]);
    getExpenseItems.mockImplementation(async (_uid: string, monthId: string) =>
      monthId === "2026-01" ? [expenseItem("Food", 10000)] : []
    );
    const result = await deriveAnnualExpense("u1");
    expect(result.monthsUsed).toBe(1);
    expect(result.source).toBe("budget-annualised");
  });
});

describe("deriveAnnualSavings", () => {
  it("annualises savings items the same way, no sub-head filtering", async () => {
    getBudgetMonths.mockResolvedValue([month("2026-01", 1, 2026)]);
    getSavingsItems.mockResolvedValue([lineItem("Index fund SIP", 15000), lineItem("Emergency fund", 5000)]);
    const result = await deriveAnnualSavings("u1");
    expect(result.annual).toBeCloseTo(20000 * 12, 0);
    expect(result.source).toBe("budget-annualised");
  });
});
