"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, PieLabelRenderProps } from "recharts";
import { ExpenseItem, ExpenseSubHead, Currency } from "@/types";
import { EXPENSE_SUBHEAD_ORDER } from "@/utils/defaults";
import { formatCurrency } from "@/utils/currency";

const COLORS: Record<ExpenseSubHead, string> = {
  "Housing & Necessities": "#6366f1",
  Food: "#f59e0b",
  Transportation: "#3b82f6",
  Subscriptions: "#ec4899",
  Lifestyle: "#8b5cf6",
  Insurance: "#14b8a6",
  Loans: "#ef4444",
};

interface Props {
  items: ExpenseItem[];
  currency: Currency;
}

function buildData(items: ExpenseItem[], field: "planned" | "actual") {
  return EXPENSE_SUBHEAD_ORDER
    .map((subHead) => {
      const total = items
        .filter((i) => i.subHead === subHead)
        .reduce((s, i) => s + i[field], 0);
      return { name: subHead, value: total, color: COLORS[subHead] };
    })
    .filter((d) => d.value > 0);
}

function renderLabel(props: PieLabelRenderProps) {
  const name = String(props.name || "");
  const percent = Number(props.percent || 0);
  return `${name.split(" ")[0]} ${(percent * 100).toFixed(0)}%`;
}

function ChartSection({ title, data, currency }: { title: string; data: { name: string; value: number; color: string }[]; currency: Currency }) {
  const total = data.reduce((s, d) => s + d.value, 0);

  if (total === 0) {
    return (
      <div>
        <h4 className="text-sm font-semibold text-slate-600 mb-2">{title}</h4>
        <p className="text-xs text-gray-400 text-center py-6">No data yet</p>
      </div>
    );
  }

  return (
    <div>
      <h4 className="text-sm font-semibold text-slate-600 mb-1">{title}</h4>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={75}
            paddingAngle={3}
            dataKey="value"
            label={renderLabel}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => formatCurrency(Number(value), currency)}
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              fontSize: "12px",
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: "11px" }}
            iconType="circle"
            iconSize={7}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function ExpensePieChart({ items, currency }: Props) {
  const plannedData = buildData(items, "planned");
  const actualData = buildData(items, "actual");

  return (
    <div className="glass-card rounded-2xl p-5">
      <h3 className="text-base font-semibold text-gray-800 mb-4">Analytics — Expense Distribution</h3>
      <div className="space-y-4">
        <ChartSection title="Planned Expenses" data={plannedData} currency={currency} />
        <div className="border-t border-gray-100" />
        <ChartSection title="Actual Expenses" data={actualData} currency={currency} />
      </div>
    </div>
  );
}
