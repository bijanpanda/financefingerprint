"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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
import Toast from "@/components/Toast";
import { exportBudgetToExcel } from "@/utils/exportBudget";

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function getGreeting(firstName: string) {
  const h = new Date().getHours();
  const time = h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening";
  return `${time}, ${firstName}!`;
}

export default function DashboardPage() {
  const { user, currency, loading: authLoading } = useAuth();
  const router = useRouter();
  const txnFormRef = useRef<HTMLDivElement>(null);
  // Guard: track which monthIds have already been initialised to prevent double-writes
  const initializedMonths = useRef(new Set<string>());

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [incomeItems, setIncomeItems] = useState<LineItem[]>([]);
  const [expenseItems, setExpenseItems] = useState<ExpenseItem[]>([]);
  const [savingsItems, setSavingsItems] = useState<LineItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState("budget");
  const [toast, setToast] = useState<string | null>(null);

  const monthId = `${year}-${String(month).padStart(2, "0")}`;
  const firstName = (user?.displayName || user?.email || "there").split(/[\s@]/)[0];

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    await ensureBudgetMonth(user.uid, monthId, month, year);
    // Only initialise defaults once per monthId to prevent duplicates
    if (!initializedMonths.current.has(monthId)) {
      initializedMonths.current.add(monthId);
      await initializeDefaults(user.uid, monthId, DEFAULT_INCOME_ITEMS, DEFAULT_EXPENSE_ITEMS, DEFAULT_SAVINGS_ITEMS);
    }
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
    if (!authLoading && !user) { router.replace("/"); return; }
    if (user && !user.emailVerified) { router.replace("/signup/check-email"); return; }
    if (user) loadData();
  }, [user, authLoading, router, loadData]);

  // ── Income handlers ──
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

  // ── Expense handlers ──
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

  // ── Savings handlers ──
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

  // ── Inline actual edit ──
  async function handleInlineTransaction(
    itemId: string, itemType: "income" | "expense" | "savings",
    amount: number, date: string, merchantName: string
  ) {
    if (!user) return;
    const item = itemType === "income" ? incomeItems.find((i) => i.id === itemId)
      : itemType === "expense" ? expenseItems.find((i) => i.id === itemId)
      : savingsItems.find((i) => i.id === itemId);
    const subHead = itemType === "expense" ? (item as ExpenseItem)?.subHead : undefined;
    const txnData: Parameters<typeof addTransaction>[2] = {
      date, amount, merchantName, comments: "", linkedItemId: itemId, linkedItemType: itemType,
    };
    if (subHead) txnData.linkedSubHead = subHead;
    await addTransaction(user.uid, monthId, txnData);
    const allTxns = await getTransactions(user.uid, monthId);
    setTransactions(allTxns);
    const newActual = allTxns.filter((t) => t.linkedItemId === itemId).reduce((s, t) => s + t.amount, 0);
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
    setToast("Transaction added");
  }

  // ── Transaction handlers ──
  async function handleAddTransaction(txn: {
    date: string; amount: number; merchantName: string; comments: string;
    linkedItemId: string; linkedItemType: "income" | "expense" | "savings"; linkedSubHead?: ExpenseSubHead;
  }) {
    if (!user) return;
    await addTransaction(user.uid, monthId, txn);
    const allTxns = await getTransactions(user.uid, monthId);
    setTransactions(allTxns);
    const newActual = allTxns.filter((t) => t.linkedItemId === txn.linkedItemId).reduce((s, t) => s + t.amount, 0);
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
    setToast("Transaction added");
  }

  async function handleDeleteTransaction(id: string) {
    if (!user) return;
    const txn = transactions.find((t) => t.id === id);
    if (!txn) return;
    await deleteTransaction(user.uid, monthId, id);
    const remaining = transactions.filter((t) => t.id !== id && t.linkedItemId === txn.linkedItemId);
    const newActual = remaining.reduce((s, t) => s + t.amount, 0);
    if (txn.linkedItemType === "income") await updateIncomeItem(user.uid, monthId, txn.linkedItemId, { actual: newActual });
    else if (txn.linkedItemType === "expense") await updateExpenseItem(user.uid, monthId, txn.linkedItemId, { actual: newActual });
    else await updateSavingsItem(user.uid, monthId, txn.linkedItemId, { actual: newActual });
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    loadData();
    setToast("Transaction deleted");
  }

  function handleExport() {
    exportBudgetToExcel({
      monthLabel: `${MONTH_NAMES[month - 1]} ${year}`,
      currency,
      incomeItems,
      expenseItems,
      savingsItems,
      transactions,
    });
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--surface-1)]">
        <div className="animate-spin h-8 w-8 border-4 border-slate-800 border-t-transparent rounded-full" />
      </div>
    );
  }

  const totalIncomePlanned  = incomeItems.reduce((s, i) => s + i.planned, 0);
  const totalIncomeActual   = incomeItems.reduce((s, i) => s + i.actual, 0);
  const totalExpensePlanned = expenseItems.reduce((s, i) => s + i.planned, 0);
  const totalExpenseActual  = expenseItems.reduce((s, i) => s + i.actual, 0);
  const totalSavingsPlanned = savingsItems.reduce((s, i) => s + i.planned, 0);
  const totalSavingsActual  = savingsItems.reduce((s, i) => s + i.actual, 0);

  return (
    <div className="h-screen flex overflow-hidden bg-[var(--surface-1)]">

      {/* ── Left Sidebar ── */}
      <nav className="nav-sidebar w-[220px] shrink-0 flex flex-col py-5 px-3">
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-2 mb-7">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center shrink-0 shadow-sm">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
            </svg>
          </div>
          <div className="leading-tight">
            <span className="text-[16px] font-bold text-slate-800 block">Vestro</span>
            <span className="text-[16px] font-bold text-slate-500 block -mt-1">fin</span>
          </div>
        </div>

        {/* PLAN section */}
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">Plan</p>
        <button
          onClick={() => setActiveNav("budget")}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors mb-1 ${
            activeNav === "budget"
              ? "bg-[var(--bg-success)] text-white shadow-sm"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          }`}
        >
          <svg className="w-4.5 h-4.5 w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Budget Planning
        </button>
        <button
          onClick={() => router.push("/retirement")}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Retirement Runway
        </button>

        {/* PROFILE section */}
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2 mt-4">Profile</p>
        <button
          onClick={() => router.push("/profile/setup")}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          My Financial DNA
        </button>
        <button
          onClick={() => router.push("/family")}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4zm6 0a4 4 0 10-4-4" />
          </svg>
          Family Budget
        </button>

        <div className="flex-1" />

        {/* User email at bottom */}
        <p className="px-3 text-[12px] text-slate-400 truncate mt-2">{user?.email}</p>
      </nav>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <header className="h-14 shrink-0 flex items-center px-5 bg-white border-b border-[var(--border-default)] gap-4">
          {/* Left: greeting */}
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-semibold text-slate-800 truncate">{getGreeting(firstName)}</p>
            <p className="text-[12px] text-slate-400">{MONTH_NAMES[month - 1]} {year} budget</p>
          </div>

          {/* Center: month nav */}
          <MonthSelector
            month={month}
            year={year}
            onChange={(m, y) => { setMonth(m); setYear(y); }}
            variant="light"
          />

          {/* Right: actions */}
          <div className="flex-1 flex items-center justify-end gap-2">
            <button
              onClick={handleExport}
              className="px-3 h-8 text-sm font-medium text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Export
            </button>
            <button
              onClick={() => txnFormRef.current?.scrollIntoView({ behavior: "smooth" })}
              className="px-3 h-8 text-sm font-medium text-white bg-[var(--fill-success)] hover:bg-slate-700 rounded-lg transition-colors"
            >
              Log expense
            </button>
            <button
              onClick={() => signOut().then(() => router.push("/?logout=success"))}
              className="px-3 h-8 text-sm font-medium text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">

          {/* Center — Budget table */}
          <main className="flex-[6] overflow-y-auto border-r border-[var(--border-default)]">
            <div className="px-5 py-5 max-w-3xl mx-auto space-y-4">
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
                items={incomeItems} currency={currency}
                onUpdate={handleUpdateIncome} onAdd={handleAddIncome} onDelete={handleDeleteIncome}
                onCreateTransaction={(id, amt, dt, mer) => handleInlineTransaction(id, "income", amt, dt, mer)}
              />
              <ExpenseSection
                items={expenseItems} currency={currency}
                onUpdate={handleUpdateExpense} onAdd={handleAddExpense} onDelete={handleDeleteExpense}
                onCreateTransaction={(id, amt, dt, mer) => handleInlineTransaction(id, "expense", amt, dt, mer)}
              />
              <SavingsSection
                items={savingsItems} currency={currency}
                onUpdate={handleUpdateSavings} onAdd={handleAddSavings} onDelete={handleDeleteSavings}
                onCreateTransaction={(id, amt, dt, mer) => handleInlineTransaction(id, "savings", amt, dt, mer)}
              />
            </div>
          </main>

          {/* Right panel */}
          <aside className="flex-[3] overflow-y-auto bg-[var(--surface-1)]">
            <div className="px-4 py-5 space-y-4">
              <TransactionForm
                ref={txnFormRef}
                incomeItems={incomeItems} expenseItems={expenseItems} savingsItems={savingsItems}
                onSubmit={handleAddTransaction}
              />
              <ExpensePieChart items={expenseItems} currency={currency} />
              <TransactionList transactions={transactions} currency={currency} onDelete={handleDeleteTransaction} />
            </div>
          </aside>
        </div>
      </div>

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
