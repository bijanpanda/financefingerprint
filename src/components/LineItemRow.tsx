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
  itemType?: "income" | "expense" | "savings";
  onUpdatePlanned: (value: number) => void;
  onCreateTransaction: (amount: number, date: string, merchantName: string) => void;
  onDelete: () => void;
}

export default function LineItemRow({
  name, planned, actual, currency, itemType = "expense",
  onUpdatePlanned, onCreateTransaction, onDelete,
}: Props) {
  const [editingPlanned, setEditingPlanned] = useState(false);
  const [plannedVal, setPlannedVal] = useState(planned.toString());
  const [showActualModal, setShowActualModal] = useState(false);

  const remaining = planned - actual;
  const isOver = actual > planned && planned > 0;
  // Income and Savings: spending more than planned is a good thing (more earned / more saved).
  const isPositiveOver = (itemType === "income" || itemType === "savings") && isOver;

  const remainingColor =
    actual === 0     ? "text-slate-400" :
    isPositiveOver   ? "text-teal-600" :
    remaining > 0    ? "text-teal-600" :
                       "text-rose-500";

  function commitPlanned() {
    const num = parseFloat(plannedVal) || 0;
    onUpdatePlanned(num);
    setEditingPlanned(false);
  }

  return (
    <>
      <div className={`group flex items-center gap-2 py-2.5 px-3 rounded-xl hover:bg-slate-50 transition-colors ${isOver && !isPositiveOver ? "bg-rose-50/60" : ""}`}>
        <span className="flex-1 text-sm font-medium text-slate-700 truncate">{name}</span>

        {editingPlanned ? (
          <input
            type="number"
            className="w-28 px-2 py-1 text-sm border border-teal-300 rounded-lg text-right focus:ring-2 focus:ring-teal-500 bg-white"
            value={plannedVal}
            onChange={(e) => setPlannedVal(e.target.value)}
            onBlur={commitPlanned}
            onKeyDown={(e) => e.key === "Enter" && commitPlanned()}
            autoFocus
          />
        ) : (
          <button
            onClick={() => { setPlannedVal(planned.toString()); setEditingPlanned(true); }}
            className="w-28 text-right text-sm text-slate-600 hover:bg-white px-2 py-1 rounded-lg transition-colors"
          >
            {formatCurrency(planned, currency)}
          </button>
        )}

        <button
          onClick={() => setShowActualModal(true)}
          className="w-28 text-right text-sm text-slate-600 hover:bg-white px-2 py-1 rounded-lg transition-colors"
        >
          {formatCurrency(actual, currency)}
        </button>

        <span className={`w-28 text-right text-sm font-semibold ${remainingColor}`}>
          {formatCurrency(remaining, currency)}
        </span>

        <button
          onClick={onDelete}
          title="Delete"
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-300 hover:text-rose-500"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {showActualModal && (
        <ActualEditModal
          itemName={name}
          currentActual={actual}
          itemType={itemType}
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
