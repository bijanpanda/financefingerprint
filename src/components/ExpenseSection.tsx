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
  const [openAdd, setOpenAdd] = useState<Record<string, boolean>>({});
  const [newNames, setNewNames] = useState<Record<string, string>>({});

  const totalPlanned = items.reduce((s, i) => s + i.planned, 0);
  const totalActual  = items.reduce((s, i) => s + i.actual,  0);

  const grouped = EXPENSE_SUBHEAD_ORDER.map((sub) => ({
    subHead: sub,
    items: items.filter((i) => i.subHead === sub),
  }));

  function handleAdd(subHead: ExpenseSubHead) {
    const name = newNames[subHead]?.trim();
    if (!name) return;
    onAdd(name, subHead);
    setNewNames((prev) => ({ ...prev, [subHead]: "" }));
    setOpenAdd((prev) => ({ ...prev, [subHead]: false }));
  }

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-4 py-3.5 border-l-[3px] border-l-[var(--fill-danger)] hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <svg className="w-4 h-4 text-rose-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 20V4m0 0l-4 4m4-4l4 4" />
          </svg>
          <span className="text-[15px] font-semibold text-rose-600">Expenses</span>
          <span className="text-xs text-slate-400">
            {formatCurrency(totalPlanned, currency)} planned · {formatCurrency(totalActual, currency)} actual
          </span>
        </div>
        <svg className={`w-4 h-4 text-slate-400 transition-transform ${collapsed ? "" : "rotate-180"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {!collapsed && (
        <div className="px-3 pb-3 space-y-2">
          {grouped.map(({ subHead, items: subItems }) => (
            <div key={subHead} className="rounded-xl overflow-hidden border border-slate-100">
              <button
                onClick={() => setCollapsedSubs((prev) => ({ ...prev, [subHead]: !prev[subHead] }))}
                className="w-full flex items-center justify-between px-3 py-2.5 bg-[var(--surface-0)] hover:bg-slate-50 transition-colors"
              >
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{subHead}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">{formatCurrency(subItems.reduce((s, i) => s + i.planned, 0), currency)}</span>
                  <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform ${collapsedSubs[subHead] ? "" : "rotate-180"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {!collapsedSubs[subHead] && (
                <div className="px-2 pb-2">
                  <div className="flex items-center gap-2 py-2 px-3 bg-[var(--surface-1)] rounded-lg mb-1">
                    <span className="flex-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">Item</span>
                    <span className="w-28 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Planned</span>
                    <span className="w-28 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Actual</span>
                    <span className="w-28 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Remaining</span>
                    <span className="w-6" />
                  </div>
                  <div className="space-y-0.5">
                    {subItems.map((item) => (
                      <LineItemRow
                        key={item.id}
                        name={item.name} planned={item.planned} actual={item.actual}
                        currency={currency}
                        onUpdatePlanned={(v) => onUpdate(item.id, { planned: v })}
                        onCreateTransaction={(amt, dt, mer) => onCreateTransaction(item.id, amt, dt, mer)}
                        onDelete={() => onDelete(item.id)}
                      />
                    ))}
                  </div>

                  {openAdd[subHead] ? (
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="text" placeholder={`${subHead} item...`}
                        value={newNames[subHead] || ""}
                        onChange={(e) => setNewNames((p) => ({ ...p, [subHead]: e.target.value }))}
                        onKeyDown={(e) => { if (e.key === "Enter") handleAdd(subHead); if (e.key === "Escape") setOpenAdd((p) => ({ ...p, [subHead]: false })); }}
                        autoFocus
                        className="flex-1 px-3 py-2 text-sm border border-rose-300 rounded-lg bg-[var(--surface-1)] focus:ring-2 focus:ring-rose-300 focus:border-transparent outline-none"
                      />
                      <button onClick={() => handleAdd(subHead)} className="px-4 py-2 text-sm bg-[var(--fill-danger)] text-white rounded-lg font-medium">Add</button>
                      <button onClick={() => setOpenAdd((p) => ({ ...p, [subHead]: false }))} className="px-3 py-2 text-sm text-slate-500 hover:bg-slate-100 rounded-lg">Cancel</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setOpenAdd((p) => ({ ...p, [subHead]: true }))}
                      className="mt-2 w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-slate-200 text-sm text-slate-400 hover:border-rose-300 hover:text-rose-500 hover:bg-rose-50/40 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add {subHead.toLowerCase()} item
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
