"use client";

import { useState } from "react";
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

export default function TransactionForm({ incomeItems, expenseItems, savingsItems, onSubmit }: Props) {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [amount, setAmount] = useState("");
  const [merchant, setMerchant] = useState("");
  const [comments, setComments] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [error, setError] = useState("");

  const options: BudgetOption[] = [
    ...incomeItems.map((i) => ({ id: i.id, name: i.name, type: "income" as const })),
    ...expenseItems.map((i) => ({ id: i.id, name: `${i.subHead} - ${i.name}`, type: "expense" as const, subHead: i.subHead })),
  ];

  function resetForm() {
    setDate(today);
    setAmount("");
    setMerchant("");
    setComments("");
    setSelectedItem("");
    setError("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!selectedItem) {
      setError("Please select a Budget Item.");
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      setError("Amount must be a positive number.");
      return;
    }

    if (date > today) {
      setError("Date cannot be in the future.");
      return;
    }

    const opt = options.find((o) => o.id === selectedItem);
    if (!opt) return;

    onSubmit({
      date,
      amount: parsedAmount,
      merchantName: merchant,
      comments,
      linkedItemId: opt.id,
      linkedItemType: opt.type,
      linkedSubHead: opt.subHead,
    });

    resetForm();
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-5">
      <h3 className="text-base font-semibold mb-4 text-gray-800">Monthly Expense Tracker</h3>

      {error && (
        <div className="bg-rose-50 text-rose-600 p-3 rounded-xl mb-4 text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Date <span className="text-rose-500">*</span></label>
          <input
            type="date"
            required
            max={today}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Amount <span className="text-rose-500">*</span></label>
          <input
            type="number"
            required
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "" || parseFloat(val) >= 0) setAmount(val);
            }}
            placeholder="0.00"
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Merchant Name</label>
          <input
            type="text"
            required
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
            placeholder="e.g. Amazon, Swiggy"
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Budget Item <span className="text-rose-500">*</span>
          </label>
          <select
            required
            value={selectedItem}
            onChange={(e) => { setSelectedItem(e.target.value); setError(""); }}
            className={`w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
              !selectedItem && error ? "border-rose-400 bg-rose-50" : "border-gray-200"
            }`}
          >
            <option value="">Select item...</option>
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
      </div>

      <div className="mt-3">
        <label className="block text-xs font-medium text-gray-500 mb-1">Comments <span className="text-gray-400">(optional)</span></label>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="Add any notes about this transaction..."
          rows={2}
          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
        />
      </div>

      <div className="flex items-center gap-3 mt-4">
        <button
          type="submit"
          className="px-5 py-2 gradient-btn text-white rounded-xl text-sm font-medium shadow-sm"
        >
          Log Transaction
        </button>
        <button
          type="button"
          onClick={resetForm}
          className="px-5 py-2 border border-gray-300 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
