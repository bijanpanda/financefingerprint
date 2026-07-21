"use client";

interface Props {
  score: number;
}

export default function FinancialHealthMeter({ score }: Props) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const rotation = (clampedScore / 100) * 180;
  const color =
    clampedScore >= 70 ? "#10b981" : clampedScore >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-40 h-20 overflow-hidden">
        <div
          className="absolute inset-0 rounded-t-full"
          style={{
            background: `conic-gradient(
              ${color} 0deg ${rotation}deg,
              #e5e7eb ${rotation}deg 180deg
            )`,
            clipPath: "polygon(0 100%, 0 0, 100% 0, 100% 100%)",
          }}
        />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-28 h-14 bg-white rounded-t-full" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
          <span className="text-2xl font-bold" style={{ color }}>
            {clampedScore}
          </span>
        </div>
      </div>
      <span className="text-xs text-gray-500 font-medium">Financial Health Score</span>
    </div>
  );
}
