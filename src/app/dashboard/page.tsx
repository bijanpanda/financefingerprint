"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/lib/auth";
import {
  ensureBudgetMonth,
  initializeDefaults,
  getIncomeItems,
  getExpenseItems,
  getSavingsItems,
  getTransactions,
  addIncomeItem,
  updateIncomeItem,
  deleteIncomeItem,
  addExpenseItem,
  updateExpenseItem,
  deleteExpenseItem,
  addSavingsItem,
  updateSavingsItem,
  deleteSavingsItem,
  addTransaction,
  deleteTransaction,
} from "@/lib/db";
import { LineItem, ExpenseItem, Transaction, ExpenseSubHead } from "@/types";
import { DEFAULT_INCOME_ITEMS, DEFAULT_EXPENSE_ITEMS, DEFAULT_SAVINGS_ITEMS } from "@/utils/defaults";
import MonthSelector from "@/components/MonthSelector";
import IncomeSection from "@/components/IncomeSection";
import ExpenseSection from "@/components/ExpenseSection";
import SavingsSection from "@/components/SavingsSection";
import BudgetSummary from "@/components/BudgetSummary";
import TransactionForm from "@/components/TransactionForm";
import TransactionList from "@/components/TransactionList";
import ExpensePieChart from "@/components/ExpensePieChart";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function DashboardPage() {
  const { user, currency, loading: authLoading } = useAuth();
  const router = useRouter();

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [incomeItems, setIncomeItems] = useState<LineItem[]>([]);
  const [expenseItems, setExpenseItems] = useState<ExpenseItem[]>([]);
  const [savingsItems, setSavingsItems] = useState<LineItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState("budget");

  const monthId = `${year}-${String(month).padStart(2, "0")}`;

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    await ensureBudgetMonth(user.uid, monthId, month, year);
    await initializeDefaults(user.uid, monthId, DEFAULT_INCOME_ITEMS, DEFAULT_EXPENSE_ITEMS, DEFAULT_SAVINGS_ITEMS);
    const [inc, exp, sav, txns] = await Promise.all([
      getIncomeItems(user.uid, monthId),
      getExpenseItems(user.uid, monthId),
      getSavingsItems(user.uid, monthId),
      getTransactions(user.uid, monthId),
    ]);
    setIncomeItems(inc);
    setExpenseItems(exp);
    setSavingsItems(sav);
    setTransactions(txns);
    setLoading(false);
  }, [user, monthId, month, year]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
      return;
    }
    if (user) loadData();
  }, [user, authLoading, router, loadData]);

  // --- Income handlers ---
  async function handleUpdateIncome(id: string, data: Partial<LineItem>) {
    if (!user) return;
    await updateIncomeItem(user.uid, monthId, id, data);
    setIncomeItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...data } : i)));
  }
  async function handleAddIncome(name: string) {
    if (!user) return;
    const ref = await addIncomeItem(user.uid, monthId, { name, planned: 0, actual: 0, order: incomeItems.length });
    setIncomeItems((prev) => [...prev, { id: ref.id, name, planned: 0, actual: 0, order: incomeItems.length }]);
  }
  async function handleDeleteIncome(id: string) {
    if (!user) return;
    await deleteIncomeItem(user.uid, monthId, id);
    setIncomeItems((prev) => prev.filter((i) => i.id !== id));
  }

  // --- Expense handlers ---
  async function handleUpdateExpense(id: string, data: Partial<ExpenseItem>) {
    if (!user) return;
    await updateExpenseItem(user.uid, monthId, id, data);
    setExpenseItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...data } : i)));
  }
  async function handleAddExpense(name: string, subHead: ExpenseSubHead) {
    if (!user) return;
    const ref = await addExpenseItem(user.uid, monthId, { name, subHead, planned: 0, actual: 0, order: expenseItems.length });
    setExpenseItems((prev) => [...prev, { id: ref.id, name, subHead, planned: 0, actual: 0, order: expenseItems.length }]);
  }
  async function handleDeleteExpense(id: string) {
    if (!user) return;
    await deleteExpenseItem(user.uid, monthId, id);
    setExpenseItems((prev) => prev.filter((i) => i.id !== id));
  }

  // --- Savings handlers ---
  async function handleUpdateSavings(id: string, data: Partial<LineItem>) {
    if (!user) return;
    await updateSavingsItem(user.uid, monthId, id, data);
    setSavingsItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...data } : i)));
  }
  async function handleAddSavings(name: string) {
    if (!user) return;
    const ref = await addSavingsItem(user.uid, monthId, { name, planned: 0, actual: 0, order: savingsItems.length });
    setSavingsItems((prev) => [...prev, { id: ref.id, name, planned: 0, actual: 0, order: savingsItems.length }]);
  }
  async function handleDeleteSavings(id: string) {
    if (!user) return;
    await deleteSavingsItem(user.uid, monthId, id);
    setSavingsItems((prev) => prev.filter((i) => i.id !== id));
  }

  // --- Inline actual edit → create transaction ---
  async function handleInlineTransaction(
    itemId: string,
    itemType: "income" | "expense" | "savings",
    amount: number,
    date: string,
    merchantName: string
  ) {
    if (!user) return;
    const item = itemType === "income"
      ? incomeItems.find((i) => i.id === itemId)
      : itemType === "expense"
      ? expenseItems.find((i) => i.id === itemId)
      : savingsItems.find((i) => i.id === itemId);

    const subHead = itemType === "expense" ? (item as ExpenseItem)?.subHead : undefined;

    await addTransaction(user.uid, monthId, {
      date,
      amount,
      merchantName,
      comments: "",
      linkedItemId: itemId,
      linkedItemType: itemType,
      linkedSubHead: subHead,
    });

    const allTxns = await getTransactions(user.uid, monthId);
    setTransactions(allTxns);

    const itemTxns = allTxns.filter((t) => t.linkedItemId === itemId);
    const newActual = itemTxns.reduce((s, t) => s + t.amount, 0);

    if (itemType === "income") {
      await updateIncomeItem(user.uid, monthId, itemId, { actual: newActual });
      setIncomeItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, actual: newActual } : i)));
    } else if (itemType === "expense") {
      await updateExpenseItem(user.uid, monthId, itemId, { actual: newActual });
      setExpenseItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, actual: newActual } : i)));
    } else {
      await updateSavingsItem(user.uid, monthId, itemId, { actual: newActual });
      setSavingsItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, actual: newActual } : i)));
    }
  }

  // --- Transaction handlers ---
  async function handleAddTransaction(txn: {
    date: string;
    amount: number;
    merchantName: string;
    comments: string;
    linkedItemId: string;
    linkedItemType: "income" | "expense" | "savings";
    linkedSubHead?: ExpenseSubHead;
  }) {
    if (!user) return;
    await addTransaction(user.uid, monthId, txn);
    const allTxns = await getTransactions(user.uid, monthId);
    setTransactions(allTxns);

    const itemTxns = allTxns.filter((t) => t.linkedItemId === txn.linkedItemId);
    const newActual = itemTxns.reduce((s, t) => s + t.amount, 0);

    if (txn.linkedItemType === "income") {
      await updateIncomeItem(user.uid, monthId, txn.linkedItemId, { actual: newActual });
      setIncomeItems((prev) => prev.map((i) => (i.id === txn.linkedItemId ? { ...i, actual: newActual } : i)));
    } else if (txn.linkedItemType === "expense") {
      await updateExpenseItem(user.uid, monthId, txn.linkedItemId, { actual: newActual });
      setExpenseItems((prev) => prev.map((i) => (i.id === txn.linkedItemId ? { ...i, actual: newActual } : i)));
    } else {
      await updateSavingsItem(user.uid, monthId, txn.linkedItemId, { actual: newActual });
      setSavingsItems((prev) => prev.map((i) => (i.id === txn.linkedItemId ? { ...i, actual: newActual } : i)));
    }
  }

  async function handleDeleteTransaction(id: string) {
    if (!user) return;
    const txn = transactions.find((t) => t.id === id);
    if (!txn) return;
    await deleteTransaction(user.uid, monthId, id);
    const remaining = transactions.filter((t) => t.id !== id && t.linkedItemId === txn.linkedItemId);
    const newActual = remaining.reduce((s, t) => s + t.amount, 0);

    if (txn.linkedItemType === "income") {
      await updateIncomeItem(user.uid, monthId, txn.linkedItemId, { actual: newActual });
    } else if (txn.linkedItemType === "expense") {
      await updateExpenseItem(user.uid, monthId, txn.linkedItemId, { actual: newActual });
    } else {
      await updateSavingsItem(user.uid, monthId, txn.linkedItemId, { actual: newActual });
    }
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    loadData();
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const totalIncomePlanned = incomeItems.reduce((s, i) => s + i.planned, 0);
  const totalIncomeActual = incomeItems.reduce((s, i) => s + i.actual, 0);
  const totalExpensePlanned = expenseItems.reduce((s, i) => s + i.planned, 0);
  const totalExpenseActual = expenseItems.reduce((s, i) => s + i.actual, 0);
  const totalSavingsPlanned = savingsItems.reduce((s, i) => s + i.planned, 0);
  const totalSavingsActual = savingsItems.reduce((s, i) => s + i.actual, 0);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Gradient Header */}
      <header className="gradient-header shrink-0 shadow-lg">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold text-white tracking-tight">Budget App</h1>
            <MonthSelector month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-emerald-100">{user?.email}</span>
            <button
              onClick={() => signOut().then(() => router.push("/login"))}
              className="text-sm px-3 py-1.5 rounded-xl text-emerald-100 hover:bg-white/10 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Three-column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Nav Sidebar */}
        <nav className="nav-sidebar w-[200px] shrink-0 flex flex-col py-4 px-3">
          <button
            onClick={() => setActiveNav("budget")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              activeNav === "budget"
                ? "bg-emerald-600 text-white shadow-md"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Budget Planning
          </button>
        </nav>

        {/* Center Frame — Budget Planning */}
        <main className="flex-[6] overflow-y-auto border-r border-emerald-200/30 bg-gradient-to-br from-emerald-50/40 via-teal-50/30 to-cyan-50/20">
          <div className="px-5 py-5 max-w-3xl mx-auto">
            <h2 className="text-lg font-bold text-slate-800 mb-4">
              Budget Planning for {MONTH_NAMES[month - 1]} {year}
            </h2>

            <div className="space-y-4">
              <BudgetSummary
                totalIncomePlanned={totalIncomePlanned}
                totalIncomeActual={totalIncomeActual}
                totalExpensePlanned={totalExpensePlanned}
                totalExpenseActual={totalExpenseActual}
                totalSavingsPlanned={totalSavingsPlanned}
                totalSavingsActual={totalSavingsActual}
                currency={currency}
              />

              <IncomeSection
                items={incomeItems}
                currency={currency}
                onUpdate={handleUpdateIncome}
                onAdd={handleAddIncome}
                onDelete={handleDeleteIncome}
                onCreateTransaction={(itemId, amount, date, merchant) => handleInlineTransaction(itemId, "income", amount, date, merchant)}
              />

              <ExpenseSection
                items={expenseItems}
                currency={currency}
                onUpdate={handleUpdateExpense}
                onAdd={handleAddExpense}
                onDelete={handleDeleteExpense}
                onCreateTransaction={(itemId, amount, date, merchant) => handleInlineTransaction(itemId, "expense", amount, date, merchant)}
              />

              <SavingsSection
                items={savingsItems}
                currency={currency}
                onUpdate={handleUpdateSavings}
                onAdd={handleAddSavings}
                onDelete={handleDeleteSavings}
                onCreateTransaction={(itemId, amount, date, merchant) => handleInlineTransaction(itemId, "savings", amount, date, merchant)}
              />
            </div>
          </div>
        </main>

        {/* Right Frame — Monthly Expense Tracker */}
        <aside className="flex-[4] overflow-y-auto bg-gradient-to-br from-indigo-50/40 via-purple-50/30 to-violet-50/30">
          <div className="px-5 py-5 space-y-4">
            <TransactionForm
              incomeItems={incomeItems}
              expenseItems={expenseItems}
              savingsItems={savingsItems}
              onSubmit={handleAddTransaction}
            />

            <ExpensePieChart items={expenseItems} currency={currency} />

            <TransactionList
              transactions={transactions}
              currency={currency}
              onDelete={handleDeleteTransaction}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
