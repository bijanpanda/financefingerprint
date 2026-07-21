"use client";

import { PersonaDefinition, InvestorPersona } from "@/types/profile";

interface Props {
  persona: InvestorPersona;
  definition: PersonaDefinition;
}

export default function PersonaRevealCard({ persona, definition }: Props) {
  return (
    <div className="glass-card rounded-2xl p-8 text-center animate-fadeIn">
      {/* Persona emoji & name */}
      <div className="mb-4">
        <span className="text-6xl block mb-3">{definition.emoji}</span>
        <h2 className="text-2xl font-extrabold text-slate-800">{definition.name}</h2>
        <p className="text-teal-600 font-medium mt-1">{definition.tagline}</p>
      </div>

      {/* Composite score */}
      <div className="inline-flex items-center gap-2 bg-teal-50 rounded-full px-4 py-2 mb-6">
        <span className="text-sm text-gray-600">Composite Score:</span>
        <span className="text-lg font-bold text-teal-700">{persona.compositeScore}/100</span>
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm leading-relaxed max-w-lg mx-auto mb-8">
        {definition.description}
      </p>

      {/* Dimension scores */}
      <div className="grid grid-cols-2 gap-3 mb-8 max-w-md mx-auto">
        {[
          { label: "Loss Tolerance", value: persona.rawScores.lossTolerance, weight: "35%" },
          { label: "Time Horizon", value: persona.rawScores.timeHorizon, weight: "25%" },
          { label: "Knowledge", value: persona.rawScores.knowledgeConfidence, weight: "20%" },
          { label: "Goal Orientation", value: persona.rawScores.goalOrientation, weight: "20%" },
        ].map((dim) => (
          <div key={dim.label} className="bg-white/60 rounded-xl p-3">
            <div className="text-xs text-gray-500 mb-1">{dim.label} <span className="text-gray-400">({dim.weight})</span></div>
            <div className="flex items-end gap-1">
              <span className="text-lg font-bold text-slate-700">{Math.round(dim.value)}</span>
              <span className="text-xs text-gray-400 mb-0.5">/100</span>
            </div>
            <div className="w-full h-1.5 bg-gray-200 rounded-full mt-1.5">
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full transition-all duration-1000"
                style={{ width: `${Math.round(dim.value)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Strengths & Blind spots */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-lg mx-auto">
        <div className="bg-teal-50 rounded-xl p-4">
          <h4 className="text-xs font-semibold text-teal-700 uppercase tracking-wider mb-2">
            Strengths
          </h4>
          <ul className="space-y-1.5">
            {definition.strengths.map((s) => (
              <li key={s} className="text-sm text-teal-800 flex items-start gap-2">
                <span className="text-teal-500 mt-0.5">+</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-amber-50 rounded-xl p-4">
          <h4 className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2">
            Watch Out For
          </h4>
          <ul className="space-y-1.5">
            {definition.blindSpots.map((b) => (
              <li key={b} className="text-sm text-amber-800 flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">!</span>
                {b}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
