"use client";

import { useState } from "react";

interface Props {
  itemName: string;
  currentActual: number;
  onSave: (amount: number, date: string, merchantName: string) => void;
  onCancel: () => void;
}

export default function ActualEditModal({ itemName, currentActual, onSave, onCancel }: Props) {
  const today = new Date().toISOString().split("T")[0];
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today);
  const [merchantName, setMerchantName] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) {
      setError("Amount must be a positive number.");
      return;
    }
    if (!merchantName.trim()) {
      setError("Merchant name is required.");
      return;
    }
    if (date > today) {
      setError("Date cannot be in the future.");
      return;
    }

    onSave(parsed, date, merchantName.trim());
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="glass-card rounded-2xl p-6 w-full max-w-md shadow-2xl mx-4" style={{ background: "rgba(255,255,255,0.92)" }}>
        <h3 className="text-base font-bold text-slate-800 mb-1">Log Expense</h3>
        <p className="text-xs text-gray-500 mb-4">
          Recording transaction for <span className="font-semibold text-slate-700">{itemName}</span>
          {currentActual > 0 && <> (current actual: {currentActual})</>}
        </p>

        {error && (
          <div className="bg-rose-50 text-rose-600 p-2.5 rounded-xl mb-3 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Amount <span className="text-rose-500">*</span>
            </label>
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
              autoFocus
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              max={today}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Merchant Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={merchantName}
              onChange={(e) => setMerchantName(e.target.value)}
              placeholder="e.g. Amazon, Swiggy"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" className="px-5 py-2 gradient-btn text-white rounded-xl text-sm font-medium shadow-sm">
              Save
            </button>
            <button type="button" onClick={onCancel} className="px-5 py-2 border border-gray-300 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
