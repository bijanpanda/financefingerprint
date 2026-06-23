"use client";

import { useState } from "react";
import { ExpenseItem, ExpenseSubHead, Currency } from "@/types";
import { EXPENSE_SUBHEAD_ORDER } from "@/utils/defaults";
import LineItemRow from "./LineItemRow";
import { formatCurrency } from "@/utils/currency";

interface Props {
  items: ExpenseItem[];
  currency: Currency;
  onUpdate: (id: string, data: Partial<ExpenseItem>) => void;
  onAdd: (name: string, subHead: ExpenseSubHead) => void;
  onDelete: (id: string) => void;
  onCreateTransaction: (itemId: string, amount: number, date: string, merchantName: string) => void;
}

export default function ExpenseSection({ items, currency, onUpdate, onAdd, onDelete, onCreateTransaction }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [collapsedSubs, setCollapsedSubs] = useState<Record<string, boolean>>({});
  const [newNames, setNewNames] = useState<Record<string, string>>({});

  const totalPlanned = items.reduce((s, i) => s + i.planned, 0);
  const totalActual = items.reduce((s, i) => s + i.actual, 0);

  const grouped = EXPENSE_SUBHEAD_ORDER.map((sub) => ({
    subHead: sub,
    items: items.filter((i) => i.subHead === sub),
  }));

  function toggleSub(sub: string) {
    setCollapsedSubs((prev) => ({ ...prev, [sub]: !prev[sub] }));
  }

  function handleAdd(subHead: ExpenseSubHead) {
    const name = newNames[subHead]?.trim();
    if (!name) return;
    onAdd(name, subHead);
    setNewNames((prev) => ({ ...prev, [subHead]: "" }));
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-5 py-3.5 border-l-4 border-l-rose-500"
      >
        <div className="flex items-center gap-3">
          <span className="text-base font-semibold text-rose-700">Expenses</span>
          <span className="text-xs text-gray-400">
            {formatCurrency(totalPlanned, currency)} planned · {formatCurrency(totalActual, currency)} actual
          </span>
        </div>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${collapsed ? "" : "rotate-180"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {!collapsed && (
        <div className="px-4 pb-4 space-y-2">
          {grouped.map(({ subHead, items: subItems }) => (
            <div key={subHead} className="border border-gray-100 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleSub(subHead)}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-slate-50 to-gray-50"
              >
                <span className="text-[13px] font-semibold text-slate-600">{subHead}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">
                    {formatCurrency(subItems.reduce((s, i) => s + i.planned, 0), currency)}
                  </span>
                  <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${collapsedSubs[subHead] ? "" : "rotate-180"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {!collapsedSubs[subHead] && (
                <div className="p-3 space-y-1">
                  <div className="flex items-center gap-2 py-1 px-3 text-[11px] text-gray-400 font-medium uppercase tracking-wider">
                    <span className="flex-1">Item</span>
                    <span className="w-24 text-right">Planned</span>
                    <span className="w-24 text-right">Actual</span>
                    <span className="w-24 text-right">Remaining</span>
                    <span className="w-6" />
                  </div>

                  {subItems.map((item) => (
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
                      placeholder={`Add ${subHead.toLowerCase()} item...`}
                      value={newNames[subHead] || ""}
                      onChange={(e) => setNewNames((prev) => ({ ...prev, [subHead]: e.target.value }))}
                      onKeyDown={(e) => e.key === "Enter" && handleAdd(subHead)}
                      className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <button onClick={() => handleAdd(subHead)} className="px-3 py-1.5 text-sm gradient-btn text-white rounded-xl">
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
