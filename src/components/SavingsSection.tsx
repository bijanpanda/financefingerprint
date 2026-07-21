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

export default function SavingsSection({ items, currency, onUpdate, onAdd, onDelete, onCreateTransaction }: Props) {
  const [newName, setNewName] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const totalPlanned = items.reduce((s, i) => s + i.planned, 0);
  const totalActual  = items.reduce((s, i) => s + i.actual,  0);

  function handleAdd() {
    if (!newName.trim()) return;
    onAdd(newName.trim());
    setNewName("");
    setAddOpen(false);
  }

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-4 py-3.5 border-l-[3px] border-l-blue-500 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="text-[15px] font-semibold text-blue-700">Savings</span>
          <span className="text-xs text-slate-400">
            {formatCurrency(totalPlanned, currency)} planned · {formatCurrency(totalActual, currency)} actual
          </span>
        </div>
        <svg className={`w-4 h-4 text-slate-400 transition-transform ${collapsed ? "" : "rotate-180"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {!collapsed && (
        <div className="px-3 pb-3">
          <div className="flex items-center gap-2 py-2 px-3 bg-[var(--surface-1)] rounded-lg mb-1">
            <span className="flex-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">Item</span>
            <span className="w-28 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Planned</span>
            <span className="w-28 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Actual</span>
            <span className="w-28 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Remaining</span>
            <span className="w-6" />
          </div>
          <div className="space-y-0.5">
            {items.map((item) => (
              <LineItemRow
                key={item.id}
                name={item.name} planned={item.planned} actual={item.actual}
                currency={currency} itemType="savings"
                onUpdatePlanned={(v) => onUpdate(item.id, { planned: v })}
                onCreateTransaction={(amt, dt, mer) => onCreateTransaction(item.id, amt, dt, mer)}
                onDelete={() => onDelete(item.id)}
              />
            ))}
          </div>

          {addOpen ? (
            <div className="flex items-center gap-2 mt-2">
              <input
                type="text" placeholder="Savings item name..." value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") setAddOpen(false); }}
                autoFocus
                className="flex-1 px-3 py-2 text-sm border border-blue-300 rounded-lg bg-[var(--surface-1)] focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none"
              />
              <button onClick={handleAdd} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg font-medium">Add</button>
              <button onClick={() => { setAddOpen(false); setNewName(""); }} className="px-3 py-2 text-sm text-slate-500 hover:bg-slate-100 rounded-lg">Cancel</button>
            </div>
          ) : (
            <button
              onClick={() => setAddOpen(true)}
              className="mt-2 w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-slate-200 text-sm text-slate-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/40 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add savings item
            </button>
          )}
        </div>
      )}
    </div>
  );
}
