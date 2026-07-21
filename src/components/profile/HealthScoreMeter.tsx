"use client";

interface Props {
  score: number;
}

// Full-width sticky health bar (distinct from the circular FinancialHealthMeter gauge
// used during profiling) — gradient green -> amber -> red per Addendum O.
export default function HealthScoreMeter({ score }: Props) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const label = clamped >= 70 ? "Strong" : clamped >= 40 ? "Building" : "Needs Attention";
  const labelColor = clamped >= 70 ? "text-teal-600" : clamped >= 40 ? "text-amber-600" : "text-rose-600";

  return (
    <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-[var(--border-default)] px-8 py-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Financial Health Score</span>
        <span className={`text-base font-bold ${labelColor}`}>{clamped}/100 &middot; {label}</span>
      </div>
      <div className="relative w-full h-3 rounded-full overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(90deg, #ef4444 0%, #f59e0b 50%, #10b981 100%)" }}
        />
        <div
          className="absolute inset-y-0 right-0 bg-gray-100 transition-all duration-700"
          style={{ width: `${100 - clamped}%` }}
        />
      </div>
    </div>
  );
}
