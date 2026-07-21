"use client";

import { forwardRef, useState } from "react";
import { LineItem, ExpenseItem, ExpenseSubHead } from "@/types";
import { EXPENSE_SUBHEAD_ORDER } from "@/utils/defaults";

interface BudgetOption {
  id: string;
  name: string;
  type: "income" | "expense" | "savings";
  subHead?: ExpenseSubHead;
}

interface Props {
  incomeItems: LineItem[];
  expenseItems: ExpenseItem[];
  savingsItems: LineItem[];
  onSubmit: (txn: {
    date: string;
    amount: number;
    merchantName: string;
    comments: string;
    linkedItemId: string;
    linkedItemType: "income" | "expense" | "savings";
    linkedSubHead?: ExpenseSubHead;
  }) => void;
}

const inputClass =
  "w-full px-3 text-sm border border-slate-200 rounded-xl bg-[var(--surface-1)] focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none h-[38px]";

const TransactionForm = forwardRef<HTMLDivElement, Props>(function TransactionForm(
  { incomeItems, expenseItems, savingsItems, onSubmit },
  ref
) {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [amount, setAmount] = useState("");
  const [merchant, setMerchant] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [error, setError] = useState("");

  const options: BudgetOption[] = [
    ...incomeItems.map((i) => ({ id: i.id, name: i.name, type: "income" as const })),
    ...expenseItems.map((i) => ({ id: i.id, name: `${i.subHead} — ${i.name}`, type: "expense" as const, subHead: i.subHead })),
  ];

  function resetForm() {
    setDate(today);
    setAmount("");
    setMerchant("");
    setNotes("");
    setSelectedItem("");
    setError("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!selectedItem) { setError("Please select a category."); return; }
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) { setError("Amount must be a positive number."); return; }
    if (date > today) { setError("Date cannot be in the future."); return; }

    const opt = options.find((o) => o.id === selectedItem);
    if (!opt) return;

    onSubmit({
      date,
      amount: parsedAmount,
      merchantName: merchant,
      comments: notes,
      linkedItemId: opt.id,
      linkedItemType: opt.type,
      linkedSubHead: opt.subHead,
    });

    resetForm();
  }

  return (
    <div ref={ref} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
      <h3 className="text-base font-semibold text-slate-800 mb-3">Log a transaction</h3>

      {error && (
        <div className="bg-rose-50 text-rose-600 px-3 py-2 rounded-lg mb-3 text-xs">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-2.5">
        {/* Row 1: Date + Amount */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Date <span className="text-rose-400">*</span></label>
            <input
              type="date"
              required
              max={today}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Amount <span className="text-rose-400">*</span></label>
            <input
              type="number"
              required
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => { const v = e.target.value; if (v === "" || parseFloat(v) >= 0) setAmount(v); }}
              placeholder="0.00"
              className={inputClass}
            />
          </div>
        </div>

        {/* Merchant */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Merchant</label>
          <input
            type="text"
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
            placeholder="e.g. Amazon, Swiggy"
            className={inputClass}
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Category <span className="text-rose-400">*</span></label>
          <select
            required
            value={selectedItem}
            onChange={(e) => { setSelectedItem(e.target.value); setError(""); }}
            className={`${inputClass} ${!selectedItem && error ? "border-rose-400 bg-rose-50" : ""}`}
          >
            <option value="">Select category...</option>
            <optgroup label="Income">
              {incomeItems.map((i) => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </optgroup>
            {EXPENSE_SUBHEAD_ORDER.map((subHead) => {
              const subItems = expenseItems.filter((i) => i.subHead === subHead);
              if (subItems.length === 0) return null;
              return (
                <optgroup key={subHead} label={subHead}>
                  {subItems.map((i) => (
                    <option key={i.id} value={i.id}>{i.name}</option>
                  ))}
                </optgroup>
              );
            })}
          </select>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Notes <span className="text-slate-300">(optional)</span></label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any notes about this transaction..."
            rows={2}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-[var(--surface-1)] focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none resize-none text-sm"
          />
        </div>

        <button
          type="submit"
          className="w-full h-[36px] bg-[var(--fill-success)] hover:bg-slate-700 text-white rounded-xl text-sm font-medium transition-colors"
        >
          Log transaction
        </button>
      </form>
    </div>
  );
});

export default TransactionForm;
