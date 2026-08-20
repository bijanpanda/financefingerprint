"use client";

import { useState } from "react";
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Currency } from "@/types";
import { ProjectionResult, RetirementPlan } from "@/types/retirement";
import { formatCurrency } from "@/utils/currency";

interface Props {
  projection: ProjectionResult;
  plan: RetirementPlan;
  currency: Currency;
}

export default function RunwayChart({ projection, plan, currency }: Props) {
  const [view, setView] = useState<"today" | "nominal">("today");

  const data = projection.rows.map((row) => ({
    age: row.age,
    balance: view === "today" ? row.endToday : row.endNominal,
  }));

  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="profile-label mb-0">Balance over time</span>
        <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs">
          {(["today", "nominal"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-2.5 py-1 font-medium transition-colors ${
                view === v ? "bg-[var(--bg-success)] text-white" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              {v === "today" ? "Today's money" : "Nominal"}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[160px] sm:h-[220px] lg:h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="runwayFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-teal)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--accent-teal)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
            <XAxis dataKey="age" tick={{ fontSize: 11 }} />
            <YAxis
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => formatCurrency(v, currency)}
              width={72}
            />
            <Tooltip
              formatter={(value) => formatCurrency(Number(value), currency)}
              labelFormatter={(age) => `Age ${age}`}
            />
            <ReferenceLine x={plan.retirementAge} stroke="var(--text-muted)" strokeDasharray="4 4" label={{ value: "Retire", fontSize: 11, position: "top" }} />
            {projection.depletionAge != null && (
              <ReferenceLine
                x={projection.depletionAge}
                stroke="var(--fill-danger)"
                strokeDasharray="4 4"
                label={{ value: "Runs out", fontSize: 11, position: "top", fill: "var(--fill-danger)" }}
              />
            )}
            <Area type="monotone" dataKey="balance" stroke="var(--accent-teal)" strokeWidth={2} fill="url(#runwayFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
