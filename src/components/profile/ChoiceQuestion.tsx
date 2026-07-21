"use client";

import { QuestionOption } from "@/types/profile";

interface Props {
  options: QuestionOption[];
  selected: string | null;
  onSelect: (optionId: string, score: number) => void;
}

export default function ChoiceQuestion({ options, selected, onSelect }: Props) {
  return (
    <div className="space-y-3">
      {options.map((opt, i) => {
        const isSelected = selected === opt.id;
        const letter = String.fromCharCode(65 + i);
        return (
          <button
            key={opt.id}
            onClick={() => onSelect(opt.id, opt.score)}
            className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 ${
              isSelected
                ? "border-transparent bg-gradient-to-r from-slate-900/5 via-teal-500/10 to-cyan-500/10 shadow-lg ring-2 ring-slate-800"
                : "border-gray-200 bg-white/80 hover:border-teal-300 hover:bg-gradient-to-r hover:from-slate-50 hover:to-teal-50/50 hover:shadow-md"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 transition-all ${
                  isSelected
                    ? "bg-gradient-to-br from-slate-800 to-slate-950 text-white shadow-md"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {letter}
              </div>
              <span
                className={`text-base leading-snug ${
                  isSelected ? "text-slate-800 font-semibold" : "text-gray-600"
                }`}
              >
                {opt.text}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
