"use client";

import { useState, useCallback } from "react";

interface Props {
  items: string[];
  ranked: string[] | null;
  onChange: (ranked: string[], score: number) => void;
}

export default function RankingQuestion({ items, ranked, onChange }: Props) {
  const [order, setOrder] = useState<string[]>(ranked || [...items]);

  const moveUp = useCallback(
    (index: number) => {
      if (index === 0) return;
      const next = [...order];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      setOrder(next);
      const score = calculateRankingScore(next);
      onChange(next, score);
    },
    [order, onChange]
  );

  const moveDown = useCallback(
    (index: number) => {
      if (index === order.length - 1) return;
      const next = [...order];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      setOrder(next);
      const score = calculateRankingScore(next);
      onChange(next, score);
    },
    [order, onChange]
  );

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500 mb-4 font-medium">
        Use the arrows to reorder. Item at top = highest priority.
      </p>
      {order.map((item, i) => (
        <div
          key={item}
          className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
            i === 0
              ? "border-transparent bg-gradient-to-r from-slate-900/5 via-teal-500/10 to-cyan-500/10 ring-2 ring-slate-800/40 shadow-md"
              : "border-gray-200 bg-white/80"
          }`}
        >
          <span
            className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
              i === 0
                ? "bg-gradient-to-br from-slate-800 to-slate-950 text-white shadow-md"
                : i === 1
                ? "bg-teal-100 text-teal-700"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            {i + 1}
          </span>
          <span className={`text-base flex-1 ${i === 0 ? "text-slate-800 font-semibold" : "text-gray-600"}`}>
            {item}
          </span>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => moveUp(i)}
              disabled={i === 0}
              className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-20 transition-colors"
            >
              <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <button
              onClick={() => moveDown(i)}
              disabled={i === order.length - 1}
              className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-20 transition-colors"
            >
              <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function calculateRankingScore(ranked: string[]): number {
  const scores = [25, 17, 8, 0];
  const lastIndex = ranked.length - 1;
  return scores[Math.min(lastIndex, scores.length - 1)];
}
