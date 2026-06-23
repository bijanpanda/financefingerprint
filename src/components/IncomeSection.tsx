"use client";

import { useState } from "react";
import { LineItem, Currency } from "@/types";
import LineItemRow from "./LineItemRow";
import { formatCurrency } from "@/utils/currency";

interface Props {
  items: LineItem[];
  currency: Currency;
  onUpdate: (id: string, data: Partial<LineItem>) => void;
  onAdd: (name: string) => void;
  onDelete: (id: string) => void;
  onCreateTransaction: (itemId: string, amount: number, date: string, merchantName: string) => void;
}

export default function IncomeSection({ items, currency, onUpdate, onAdd, onDelete, onCreateTransaction }: Props) {
  const [newName, setNewName] = useState("");
  const [collapsed, setCollapsed] = useState(false);

  const totalPlanned = items.reduce((s, i) => s + i.planned, 0);
  const totalActual = items.reduce((s, i) => s + i.actual, 0);

  function handleAdd() {
    if (!newName.trim()) return;
    onAdd(newName.trim());
    setNewName("");
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-5 py-3.5 border-l-4 border-l-emerald-500"
      >
        <div className="flex items-center gap-3">
          <span className="text-base font-semibold text-emerald-700">Income</span>
          <span className="text-xs text-gray-400">
            {formatCurrency(totalPlanned, currency)} planned · {formatCurrency(totalActual, currency)} actual
          </span>
        </div>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${collapsed ? "" : "rotate-180"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {!collapsed && (
        <div className="px-4 pb-4 space-y-1">
          <div className="flex items-center gap-2 py-1 px-3 text-[11px] text-gray-400 font-medium uppercase tracking-wider">
            <span className="flex-1">Item</span>
            <span className="w-24 text-right">Planned</span>
            <span className="w-24 text-right">Actual</span>
            <span className="w-24 text-right">Remaining</span>
            <span className="w-6" />
          </div>

          {items.map((item) => (
            <LineItemRow
              key={item.id}
              name={item.name}
              planned={item.planned}
              actual={item.actual}
              currency={currency}
              onUpdatePlanned={(v) => onUpdate(item.id, { planned: v })}
              onCreateTransaction={(amount, date, merchant) => onCreateTransaction(item.id, amount, date, merchant)}
              onDelete={() => onDelete(item.id)}
            />
          ))}

          <div className="flex items-center gap-2 mt-2">
            <input
              type="text"
              placeholder="Add income item..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button onClick={handleAdd} className="px-3 py-1.5 text-sm gradient-btn text-white rounded-xl">
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
