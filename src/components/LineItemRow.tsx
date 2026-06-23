"use client";

import { useState } from "react";
import { Currency } from "@/types";
import { formatCurrency } from "@/utils/currency";
import ActualEditModal from "./ActualEditModal";

interface Props {
  name: string;
  planned: number;
  actual: number;
  currency: Currency;
  onUpdatePlanned: (value: number) => void;
  onCreateTransaction: (amount: number, date: string, merchantName: string) => void;
  onDelete: () => void;
}

export default function LineItemRow({
  name,
  planned,
  actual,
  currency,
  onUpdatePlanned,
  onCreateTransaction,
  onDelete,
}: Props) {
  const [editingPlanned, setEditingPlanned] = useState(false);
  const [plannedVal, setPlannedVal] = useState(planned.toString());
  const [showActualModal, setShowActualModal] = useState(false);

  const remaining = planned - actual;
  const isOver = actual > planned && planned > 0;

  function commitPlanned() {
    const num = parseFloat(plannedVal) || 0;
    onUpdatePlanned(num);
    setEditingPlanned(false);
  }

  return (
    <>
      <div className={`flex items-center gap-2 py-2.5 px-3 rounded-xl transition-colors ${isOver ? "bg-rose-50/80" : "bg-emerald-50/60"}`}>
        <span className="flex-1 text-[13px] font-medium text-slate-700 truncate">{name}</span>

        {editingPlanned ? (
          <input
            type="number"
            className="w-24 px-2 py-1 text-sm border border-indigo-300 rounded-lg text-right focus:ring-2 focus:ring-indigo-500"
            value={plannedVal}
            onChange={(e) => setPlannedVal(e.target.value)}
            onBlur={commitPlanned}
            onKeyDown={(e) => e.key === "Enter" && commitPlanned()}
            autoFocus
          />
        ) : (
          <button
            onClick={() => { setPlannedVal(planned.toString()); setEditingPlanned(true); }}
            className="w-24 text-right text-[13px] text-slate-600 hover:bg-white/70 px-2 py-1 rounded-lg transition-colors"
          >
            {formatCurrency(planned, currency)}
          </button>
        )}

        <button
          onClick={() => setShowActualModal(true)}
          className="w-24 text-right text-[13px] text-slate-600 hover:bg-white/70 px-2 py-1 rounded-lg transition-colors"
        >
          {formatCurrency(actual, currency)}
        </button>

        <span className={`w-24 text-right text-[13px] font-semibold ${isOver ? "text-rose-600" : "text-emerald-600"}`}>
          {formatCurrency(remaining, currency)}
        </span>

        <button onClick={onDelete} className="p-1 text-gray-300 hover:text-rose-500 transition-colors" title="Delete">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {showActualModal && (
        <ActualEditModal
          itemName={name}
          currentActual={actual}
          onSave={(amount, date, merchantName) => {
            onCreateTransaction(amount, date, merchantName);
            setShowActualModal(false);
          }}
          onCancel={() => setShowActualModal(false)}
        />
      )}
    </>
  );
}
