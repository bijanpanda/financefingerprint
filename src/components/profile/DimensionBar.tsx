"use client";

interface Props {
  label: string;
  value: number;
  weight?: string;
}

// Score semantic colours per Addendum O: >70 blue, 40-70 amber, <40 red
function colorFor(value: number): { bar: string; text: string } {
  if (value > 70) return { bar: "bg-blue-500", text: "text-blue-600" };
  if (value >= 40) return { bar: "bg-amber-500", text: "text-amber-600" };
  return { bar: "bg-rose-500", text: "text-rose-600" };
}

export default function DimensionBar({ label, value, weight }: Props) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const { bar, text } = colorFor(clamped);

  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className="text-gray-500">
          {label} {weight && <span className="text-gray-400">({weight})</span>}
        </span>
        <span className={`font-semibold ${text}`}>{clamped}</span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${bar} transition-all duration-700`} style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}
