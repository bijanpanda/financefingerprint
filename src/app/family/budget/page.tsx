"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { createFamilyChildBudgetClient } from "@/lib/familyChildBudgetClient";
import MonthSelector from "@/components/MonthSelector";
import FamilyMemberSummaryCard from "@/components/family/FamilyMemberSummaryCard";
import IncomeSection from "@/components/IncomeSection";
import ExpenseSection from "@/components/ExpenseSection";
import SavingsSection from "@/components/SavingsSection";
import TransactionForm from "@/components/TransactionForm";
import TransactionList from "@/components/TransactionList";
import BudgetSummary from "@/components/BudgetSummary";
import { LineItem, ExpenseItem, Transaction, ExpenseSubHead, Currency } from "@/types";

interface OverviewMember {
  uid: string;
  displayName: string;
  role: "principal" | "child";
  incomeItems: LineItem[];
  expenseItems: ExpenseItem[];
  savingsItems: LineItem[];
  recentEdits: { editedByName: string; changeSummary: string; createdAt: string }[];
}

export default function FamilyBudgetOverviewPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const txnFormRef = useRef<HTMLDivElement>(null);

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const monthId = `${year}-${String(month).padStart(2, "0")}`;

  const [accessChecked, setAccessChecked] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [currency, setCurrency] = useState<Currency>("USD");
  const [members, setMembers] = useState<OverviewMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingChildUid, setEditingChildUid] = useState<string | null>(null);
  const [childIncome, setChildIncome] = useState<LineItem[]>([]);
  const [childExpense, setChildExpense] = useState<ExpenseItem[]>([]);
  const [childSavings, setChildSavings] = useState<LineItem[]>([]);
  const [childTxns, setChildTxns] = useState<Transaction[]>([]);
  const [childLoading, setChildLoading] = useState(false);

  const loadOverview = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    const res = await fetch(`/api/family/budget-overview?requesterUid=${user.uid}&monthId=${monthId}`);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to load family budget");
      setLoading(false);
      return;
    }
    setCurrency(data.currency);
    setMembers(data.members);
    setLoading(false);
  }, [user, monthId]);

  useEffect(() => {
    if (!authLoading && !user) { router.replace("/login"); return; }
    if (!user) return;
    fetch(`/api/family/status?uid=${user.uid}`)
      .then((r) => r.json())
      .then((status) => {
        setAllowed(status.inGroup && status.role === "principal");
        setAccessChecked(true);
      });
  }, [user, authLoading, router]);

  useEffect(() => {
    if (accessChecked && allowed) loadOverview();
  }, [accessChecked, allowed, loadOverview]);

  const loadChildBudget = useCallback(async (childUid: string) => {
    if (!user) return;
    setChildLoading(true);
    const c = createFamilyChildBudgetClient(user.uid, childUid);
    const data = await c.getChildBudget(monthId);
    setChildIncome(data.incomeItems);
    setChildExpense(data.expenseItems);
    setChildSavings(data.savingsItems);
    setChildTxns(data.transactions);
    setChildLoading(false);
  }, [user, monthId]);

  function openEdit(childUid: string) {
    setEditingChildUid(childUid);
    loadChildBudget(childUid);
  }

  function closeEdit() {
    setEditingChildUid(null);
    loadOverview();
  }

  // ── Child-budget handlers (mirrors src/app/dashboard/page.tsx's pattern) ──
  async function handleUpdateIncome(id: string, data: Partial<LineItem>) {
    if (!editingChildUid) return;
    const c = createFamilyChildBudgetClient(user!.uid, editingChildUid);
    await c.updateIncomeItem(monthId, id, data);
    setChildIncome((prev) => prev.map((i) => (i.id === id ? { ...i, ...data } : i)));
  }
  async function handleAddIncome(name: string) {
    if (!editingChildUid) return;
    const c = createFamilyChildBudgetClient(user!.uid, editingChildUid);
    const { id } = await c.addIncomeItem(monthId, { name, planned: 0, actual: 0, order: childIncome.length });
    setChildIncome((prev) => [...prev, { id: id!, name, planned: 0, actual: 0, order: childIncome.length }]);
  }
  async function handleDeleteIncome(id: string) {
    if (!editingChildUid) return;
    const c = createFamilyChildBudgetClient(user!.uid, editingChildUid);
    await c.deleteIncomeItem(monthId, id);
    setChildIncome((prev) => prev.filter((i) => i.id !== id));
  }

  async function handleUpdateExpense(id: string, data: Partial<ExpenseItem>) {
    if (!editingChildUid) return;
    const c = createFamilyChildBudgetClient(user!.uid, editingChildUid);
    await c.updateExpenseItem(monthId, id, data);
    setChildExpense((prev) => prev.map((i) => (i.id === id ? { ...i, ...data } : i)));
  }
  async function handleAddExpense(name: string, subHead: ExpenseSubHead) {
    if (!editingChildUid) return;
    const c = createFamilyChildBudgetClient(user!.uid, editingChildUid);
    const { id } = await c.addExpenseItem(monthId, { name, subHead, planned: 0, actual: 0, order: childExpense.length });
    setChildExpense((prev) => [...prev, { id: id!, name, subHead, planned: 0, actual: 0, order: childExpense.length }]);
  }
  async function handleDeleteExpense(id: string) {
    if (!editingChildUid) return;
    const c = createFamilyChildBudgetClient(user!.uid, editingChildUid);
    await c.deleteExpenseItem(monthId, id);
    setChildExpense((prev) => prev.filter((i) => i.id !== id));
  }

  async function handleUpdateSavings(id: string, data: Partial<LineItem>) {
    if (!editingChildUid) return;
    const c = createFamilyChildBudgetClient(user!.uid, editingChildUid);
    await c.updateSavingsItem(monthId, id, data);
    setChildSavings((prev) => prev.map((i) => (i.id === id ? { ...i, ...data } : i)));
  }
  async function handleAddSavings(name: string) {
    if (!editingChildUid) return;
    const c = createFamilyChildBudgetClient(user!.uid, editingChildUid);
    const { id } = await c.addSavingsItem(monthId, { name, planned: 0, actual: 0, order: childSavings.length });
    setChildSavings((prev) => [...prev, { id: id!, name, planned: 0, actual: 0, order: childSavings.length }]);
  }
  async function handleDeleteSavings(id: string) {
    if (!editingChildUid) return;
    const c = createFamilyChildBudgetClient(user!.uid, editingChildUid);
    await c.deleteSavingsItem(monthId, id);
    setChildSavings((prev) => prev.filter((i) => i.id !== id));
  }

  async function recomputeActual(itemId: string, itemType: "income" | "expense" | "savings", allTxns: Transaction[]) {
    if (!editingChildUid) return;
    const c = createFamilyChildBudgetClient(user!.uid, editingChildUid);
    const newActual = allTxns.filter((t) => t.linkedItemId === itemId).reduce((s, t) => s + t.amount, 0);
    if (itemType === "income") {
      await c.updateIncomeItem(monthId, itemId, { actual: newActual });
      setChildIncome((prev) => prev.map((i) => (i.id === itemId ? { ...i, actual: newActual } : i)));
    } else if (itemType === "expense") {
      await c.updateExpenseItem(monthId, itemId, { actual: newActual });
      setChildExpense((prev) => prev.map((i) => (i.id === itemId ? { ...i, actual: newActual } : i)));
    } else {
      await c.updateSavingsItem(monthId, itemId, { actual: newActual });
      setChildSavings((prev) => prev.map((i) => (i.id === itemId ? { ...i, actual: newActual } : i)));
    }
  }

  async function handleInlineTransaction(
    itemId: string, itemType: "income" | "expense" | "savings",
    amount: number, date: string, merchantName: string
  ) {
    if (!editingChildUid) return;
    const c = createFamilyChildBudgetClient(user!.uid, editingChildUid);
    const item = itemType === "income" ? childIncome.find((i) => i.id === itemId)
      : itemType === "expense" ? childExpense.find((i) => i.id === itemId)
      : childSavings.find((i) => i.id === itemId);
    const subHead = itemType === "expense" ? (item as ExpenseItem)?.subHead : undefined;
    await c.addTransaction(monthId, { date, amount, merchantName, comments: "", linkedItemId: itemId, linkedItemType: itemType, linkedSubHead: subHead });
    const c2 = createFamilyChildBudgetClient(user!.uid, editingChildUid);
    const fresh = await c2.getChildBudget(monthId);
    setChildTxns(fresh.transactions);
    await recomputeActual(itemId, itemType, fresh.transactions);
  }

  async function handleAddTransaction(txn: {
    date: string; amount: number; merchantName: string; comments: string;
    linkedItemId: string; linkedItemType: "income" | "expense" | "savings"; linkedSubHead?: ExpenseSubHead;
  }) {
    if (!editingChildUid) return;
    const c = createFamilyChildBudgetClient(user!.uid, editingChildUid);
    await c.addTransaction(monthId, txn);
    const fresh = await c.getChildBudget(monthId);
    setChildTxns(fresh.transactions);
    await recomputeActual(txn.linkedItemId, txn.linkedItemType, fresh.transactions);
  }

  async function handleDeleteTransaction(id: string) {
    if (!editingChildUid) return;
    const txn = childTxns.find((t) => t.id === id);
    if (!txn) return;
    const c = createFamilyChildBudgetClient(user!.uid, editingChildUid);
    await c.deleteTransaction(monthId, id);
    const remaining = childTxns.filter((t) => t.id !== id);
    setChildTxns(remaining);
    await recomputeActual(txn.linkedItemId, txn.linkedItemType, remaining);
  }

  if (authLoading || !accessChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--surface-1)]">
        <div className="animate-spin h-8 w-8 border-4 border-slate-800 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[var(--surface-1)]">
        <p className="text-gray-500 text-sm">Only a confirmed Principal can view the family budget overview.</p>
        <div className="flex items-center gap-4">
          <Link href="/family" className="gradient-btn text-white px-6 py-2 rounded-xl text-sm">Back to Family Budget</Link>
          <Link href="/dashboard" className="text-sm text-teal-600 hover:underline">Back to Budget Planning</Link>
        </div>
      </div>
    );
  }

  const editingMember = members.find((m) => m.uid === editingChildUid);

  return (
    <div className="min-h-screen bg-[var(--surface-1)] px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="text-sm text-teal-600 hover:underline">&larr; Budget Planning</Link>
              <span className="text-slate-300">|</span>
              <Link href="/family" className="text-sm text-teal-600 hover:underline">&larr; Family Budget</Link>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              {editingChildUid ? `Editing ${editingMember?.displayName}'s budget` : "Family Overview"}
            </h1>
          </div>
          <MonthSelector month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} variant="light" />
        </div>

        {error && <div className="bg-rose-50 text-rose-600 p-3 rounded-xl mb-4 text-sm">{error}</div>}

        {!editingChildUid && (
          loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-slate-800 border-t-transparent rounded-full" />
            </div>
          ) : (
            <div className="space-y-4">
              {members.map((m) => (
                <FamilyMemberSummaryCard
                  key={m.uid}
                  displayName={m.displayName}
                  role={m.role}
                  isSelf={m.uid === user?.uid}
                  currency={currency}
                  incomeItems={m.incomeItems}
                  expenseItems={m.expenseItems}
                  savingsItems={m.savingsItems}
                  recentEdits={m.recentEdits}
                  onEditClick={m.role === "child" ? () => openEdit(m.uid) : undefined}
                />
              ))}
            </div>
          )
        )}

        {editingChildUid && (
          childLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-slate-800 border-t-transparent rounded-full" />
            </div>
          ) : (
            <div className="space-y-6">
              <button onClick={closeEdit} className="text-sm text-teal-600 hover:underline">&larr; Back to overview</button>

              <BudgetSummary
                totalIncomePlanned={childIncome.reduce((s, i) => s + i.planned, 0)}
                totalIncomeActual={childIncome.reduce((s, i) => s + i.actual, 0)}
                totalExpensePlanned={childExpense.reduce((s, i) => s + i.planned, 0)}
                totalExpenseActual={childExpense.reduce((s, i) => s + i.actual, 0)}
                totalSavingsPlanned={childSavings.reduce((s, i) => s + i.planned, 0)}
                totalSavingsActual={childSavings.reduce((s, i) => s + i.actual, 0)}
                currency={currency}
              />

              <IncomeSection
                items={childIncome} currency={currency}
                onUpdate={handleUpdateIncome} onAdd={handleAddIncome} onDelete={handleDeleteIncome}
                onCreateTransaction={(itemId, amount, date, merchantName) => handleInlineTransaction(itemId, "income", amount, date, merchantName)}
              />
              <ExpenseSection
                items={childExpense} currency={currency}
                onUpdate={handleUpdateExpense} onAdd={handleAddExpense} onDelete={handleDeleteExpense}
                onCreateTransaction={(itemId, amount, date, merchantName) => handleInlineTransaction(itemId, "expense", amount, date, merchantName)}
              />
              <SavingsSection
                items={childSavings} currency={currency}
                onUpdate={handleUpdateSavings} onAdd={handleAddSavings} onDelete={handleDeleteSavings}
                onCreateTransaction={(itemId, amount, date, merchantName) => handleInlineTransaction(itemId, "savings", amount, date, merchantName)}
              />

              <TransactionForm
                ref={txnFormRef}
                incomeItems={childIncome} expenseItems={childExpense} savingsItems={childSavings}
                onSubmit={handleAddTransaction}
              />
              <TransactionList transactions={childTxns} currency={currency} onDelete={handleDeleteTransaction} />
            </div>
          )
        )}
      </div>
    </div>
  );
}
