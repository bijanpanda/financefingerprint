"use client";

import { useState } from "react";

interface Props {
  min: number;
  max: number;
  labels: { min: string; max: string };
  value: number | null;
  onChange: (value: number, score: number) => void;
}

export default function ScaleQuestion({ min, max, labels, value, onChange }: Props) {
  const defaultVal = value ?? Math.ceil((min + max) / 2);
  const [current, setCurrent] = useState(defaultVal);

  const handleChange = (val: number) => {
    setCurrent(val);
    const score = Math.round(((val - min) / (max - min)) * 25);
    onChange(val, score);
  };

  const pct = ((current - min) / (max - min)) * 100;

  return (
    <div className="space-y-8 py-6">
      <div className="text-center">
        <span className="text-7xl font-extrabold gradient-text">{current}</span>
        <span className="text-2xl text-gray-300 ml-2 font-light">/ {max}</span>
      </div>
      <div className="px-4">
        <div className="relative">
          <div className="w-full h-3 bg-gray-100 rounded-full shadow-inner overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 rounded-full transition-all duration-200"
              style={{ width: `${pct}%` }}
            />
          </div>
          <input
            type="range"
            min={min}
            max={max}
            step={1}
            value={current}
            onChange={(e) => handleChange(parseInt(e.target.value))}
            className="absolute inset-0 w-full h-3 opacity-0 cursor-pointer"
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border-3 border-slate-800 shadow-lg transition-all duration-200 pointer-events-none"
            style={{ left: `calc(${pct}% - 12px)` }}
          />
        </div>
        <div className="flex justify-between mt-4">
          <span className="text-sm text-gray-400 font-medium max-w-[40%]">{labels.min}</span>
          <span className="text-sm text-gray-400 font-medium max-w-[40%] text-right">{labels.max}</span>
        </div>
      </div>
      {/* Scale markers */}
      <div className="flex justify-between px-4">
        {Array.from({ length: max - min + 1 }).map((_, i) => {
          const val = min + i;
          const isActive = val <= current;
          return (
            <button
              key={val}
              onClick={() => handleChange(val)}
              className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${
                val === current
                  ? "bg-gradient-to-br from-slate-800 to-slate-950 text-white shadow-md scale-110"
                  : isActive
                  ? "bg-teal-100 text-teal-700"
                  : "bg-gray-50 text-gray-400 hover:bg-gray-100"
              }`}
            >
              {val}
            </button>
          );
        })}
      </div>
    </div>
  );
}
