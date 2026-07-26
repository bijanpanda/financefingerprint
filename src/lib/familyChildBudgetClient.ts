import { Currency, LineItem, ExpenseItem, Transaction } from "@/types";

interface ChildBudgetData {
  currency: Currency;
  incomeItems: LineItem[];
  expenseItems: ExpenseItem[];
  savingsItems: LineItem[];
  transactions: Transaction[];
}

// Bound to a specific (requesterUid, childUid) pair so the returned functions have the
// same (monthId, ...) call shape as src/lib/db.ts, letting the drill-down page reuse
// dashboard/page.tsx's handler pattern almost verbatim.
export function createFamilyChildBudgetClient(requesterUid: string, childUid: string) {
  async function post(op: string, monthId: string, payload: unknown): Promise<{ id?: string }> {
    const res = await fetch("/api/family/child-budget", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requesterUid, childUid, monthId, op, payload }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Failed: ${op}`);
    return data;
  }

  return {
    async getChildBudget(monthId: string): Promise<ChildBudgetData> {
      const res = await fetch(
        `/api/family/child-budget?requesterUid=${requesterUid}&childUid=${childUid}&monthId=${monthId}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load budget");
      return data as ChildBudgetData;
    },

    async addIncomeItem(monthId: string, item: Omit<LineItem, "id">) {
      return post("addIncome", monthId, item);
    },
    async updateIncomeItem(monthId: string, id: string, data: Partial<LineItem>) {
      await post("updateIncome", monthId, { id, data });
    },
    async deleteIncomeItem(monthId: string, id: string) {
      await post("deleteIncome", monthId, { id });
    },

    async addExpenseItem(monthId: string, item: Omit<ExpenseItem, "id">) {
      return post("addExpense", monthId, item);
    },
    async updateExpenseItem(monthId: string, id: string, data: Partial<ExpenseItem>) {
      await post("updateExpense", monthId, { id, data });
    },
    async deleteExpenseItem(monthId: string, id: string) {
      await post("deleteExpense", monthId, { id });
    },

    async addSavingsItem(monthId: string, item: Omit<LineItem, "id">) {
      return post("addSavings", monthId, item);
    },
    async updateSavingsItem(monthId: string, id: string, data: Partial<LineItem>) {
      await post("updateSavings", monthId, { id, data });
    },
    async deleteSavingsItem(monthId: string, id: string) {
      await post("deleteSavings", monthId, { id });
    },

    async addTransaction(monthId: string, txn: Omit<Transaction, "id" | "createdAt">) {
      return post("addTransaction", monthId, txn);
    },
    async deleteTransaction(monthId: string, id: string) {
      await post("deleteTransaction", monthId, { id });
    },
  };
}
