"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/lib/auth";
import {
  getIncomeItems,
  getExpenseItems,
  getSavingsItems,
  getTransactions,
  addTransaction,
  deleteTransaction,
  updateIncomeItem,
  updateExpenseItem,
  updateSavingsItem,
} from "@/lib/db";
import { LineItem, ExpenseItem, Transaction, ExpenseSubHead } from "@/types";
import MonthSelector from "@/components/MonthSelector";
import TransactionForm from "@/components/TransactionForm";
import TransactionList from "@/components/TransactionList";

export default function TransactionsPage() {
  const { user, currency, loading: authLoading } = useAuth();
  const router = useRouter();

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const monthId = `${year}-${String(month).padStart(2, "0")}`;

  const [incomeItems, setIncomeItems] = useState<LineItem[]>([]);
  const [expenseItems, setExpenseItems] = useState<ExpenseItem[]>([]);
  const [savingsItems, setSavingsItems] = useState<LineItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
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
  }, [user, monthId]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
      return;
    }
    if (user) loadData();
  }, [user, authLoading, router, loadData]);

  async function handleAddTransaction(txn: {
    date: string;
    amount: number;
    merchantName: string;
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
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">Budget App</h1>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-blue-600 hover:underline font-medium">
              Dashboard
            </Link>
            <span className="text-sm text-gray-500">{user?.email}</span>
            <button
              onClick={() => signOut().then(() => router.push("/login"))}
              className="text-sm text-gray-500 hover:text-red-600"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <div className="flex justify-center">
          <MonthSelector month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} />
        </div>

        <TransactionForm
          incomeItems={incomeItems}
          expenseItems={expenseItems}
          savingsItems={savingsItems}
          onSubmit={handleAddTransaction}
        />

        <TransactionList
          transactions={transactions}
          currency={currency}
          onDelete={handleDeleteTransaction}
        />
      </main>
    </div>
  );
}
