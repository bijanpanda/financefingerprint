"use client";

interface Props {
  label: string;
  value: number;
  color: string;
}

// Thin horizontal allocation row — dot + label + bar + percentage (Addendum P)
export default function AllocationBar({ label, value, color }: Props) {
  return (
    <div className="flex items-center gap-3 text-base">
      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
      <span className="text-gray-500 w-24 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.max(0, Math.min(100, value))}%`, backgroundColor: color }}
        />
      </div>
      <span className="font-semibold text-slate-700 w-12 text-right shrink-0">{value}%</span>
    </div>
  );
}
