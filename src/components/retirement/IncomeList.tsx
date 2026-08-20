"use client";

import { useState } from "react";
import { IncomeKind, IncomeStream } from "@/types/retirement";

interface Props {
  streams: IncomeStream[];
  onChange: (streams: IncomeStream[]) => void;
}

const KIND_LABELS: Record<IncomeKind, string> = {
  rent: "Rental income",
  dividends: "Dividends / interest",
  annuity: "Annuity",
  pension: "Pension",
  part_time: "Part-time work",
};

function newStream(): IncomeStream {
  return {
    id: `income-${Date.now()}`,
    label: "",
    kind: "rent",
    amountPerYear: 0,
    startAge: 60,
    endAge: null,
    growth: "inflation",
  };
}

export default function IncomeList({ streams, onChange }: Props) {
  const [collapsed, setCollapsed] = useState(true);

  function update(id: string, patch: Partial<IncomeStream>) {
    onChange(streams.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function remove(id: string) {
    onChange(streams.filter((s) => s.id !== id));
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <button onClick={() => setCollapsed(!collapsed)} className="w-full flex items-center justify-between px-4 py-3.5">
        <span className="profile-label mb-0">Income · {streams.length}</span>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform ${collapsed ? "" : "rotate-180"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {!collapsed && (
        <div className="px-4 pb-4 space-y-3">
          {streams.map((stream) => (
            <div key={stream.id} className="border border-slate-200 rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Label"
                  className="profile-input flex-1"
                  value={stream.label}
                  onChange={(e) => update(stream.id, { label: e.target.value })}
                />
                <button onClick={() => remove(stream.id)} className="text-slate-400 hover:text-red-500 shrink-0 px-1" aria-label="Remove income">
                  ×
                </button>
              </div>

              <select
                className="profile-input"
                value={stream.kind}
                onChange={(e) => update(stream.id, { kind: e.target.value as IncomeKind })}
              >
                {(Object.keys(KIND_LABELS) as IncomeKind[]).map((k) => (
                  <option key={k} value={k}>
                    {KIND_LABELS[k]}
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  placeholder="Amount / yr"
                  className="profile-input col-span-1"
                  value={stream.amountPerYear}
                  onChange={(e) => update(stream.id, { amountPerYear: Number(e.target.value) })}
                />
                <input
                  type="number"
                  placeholder="From age"
                  className="profile-input col-span-1"
                  value={stream.startAge}
                  onChange={(e) => update(stream.id, { startAge: Number(e.target.value) })}
                />
                <input
                  type="number"
                  placeholder="To age (life)"
                  className="profile-input col-span-1"
                  value={stream.endAge ?? ""}
                  onChange={(e) => update(stream.id, { endAge: e.target.value === "" ? null : Number(e.target.value) })}
                />
              </div>

              <div className="flex rounded-xl border-2 border-slate-200 overflow-hidden">
                {(["inflation", "flat"] as const).map((growth) => (
                  <button
                    key={growth}
                    type="button"
                    onClick={() => update(stream.id, { growth })}
                    className={`flex-1 py-1.5 text-sm font-medium transition-colors ${
                      stream.growth === growth ? "bg-[var(--bg-success)] text-white" : "text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    {growth === "inflation" ? "Indexed" : "Flat"}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <button
            onClick={() => onChange([...streams, newStream()])}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-slate-200 text-sm text-slate-400 hover:border-teal-300 hover:text-teal-600 transition-colors"
          >
            + Add income stream
          </button>
        </div>
      )}
    </div>
  );
}
