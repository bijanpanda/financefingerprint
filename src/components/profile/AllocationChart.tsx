"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, PieLabelRenderProps } from "recharts";

interface Props {
  allocation: {
    equity: number;
    debt: number;
    hybrid: number;
    alternative: number;
    liquid: number;
  };
}

const COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#6b7280"];
const LABELS = ["Equity", "Debt", "Hybrid", "Alternative", "Liquid"];

export default function AllocationChart({ allocation }: Props) {
  const data = [
    { name: "Equity", value: allocation.equity },
    { name: "Debt", value: allocation.debt },
    { name: "Hybrid", value: allocation.hybrid },
    { name: "Alternative", value: allocation.alternative },
    { name: "Liquid", value: allocation.liquid },
  ].filter((d) => d.value > 0);

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
        Suggested Asset Allocation
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
              label={(props: PieLabelRenderProps) => `${String(props.name)} ${Number(props.value)}%`}
              labelLine={false}
            >
              {data.map((entry, i) => (
                <Cell
                  key={entry.name}
                  fill={COLORS[LABELS.indexOf(entry.name)] || COLORS[i]}
                />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${Number(value)}%`} />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value: string) => (
                <span className="text-xs text-gray-600">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
