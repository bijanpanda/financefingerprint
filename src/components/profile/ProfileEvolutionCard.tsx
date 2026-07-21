"use client";

import { CustomerProfile } from "@/types/profile";
import { PERSONA_DEFINITIONS } from "@/utils/questionBank";

interface Props {
  current: CustomerProfile;
  previous: CustomerProfile;
}

function Delta({ value }: { value: number }) {
  if (value === 0) return <span className="text-gray-400 text-sm font-medium">no change</span>;
  const positive = value > 0;
  return (
    <span className={`text-sm font-bold ${positive ? "text-teal-600" : "text-rose-600"}`}>
      {positive ? "+" : ""}{value}
    </span>
  );
}

// Year-over-year comparison — returning users only (v2+)
export default function ProfileEvolutionCard({ current, previous }: Props) {
  const healthDelta = current.aiSynthesis.financialHealthScore - previous.aiSynthesis.financialHealthScore;
  const personaChanged = current.persona.personaType !== previous.persona.personaType;

  return (
    <div className="glass-card rounded-2xl p-7">
      <div className="flex items-center gap-3 mb-5">
        <span className="text-2xl">📈</span>
        <h3 className="text-lg font-bold text-slate-800">Profile Evolution</h3>
        <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full uppercase tracking-wider ml-auto">
          FY {previous.financialYear} &rarr; FY {current.financialYear}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="bg-white/60 rounded-xl p-4">
          <div className="text-sm text-gray-500 mb-1">Health Score</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-700">{current.aiSynthesis.financialHealthScore}</span>
            <Delta value={current.aiSynthesis.financialHealthScore - previous.aiSynthesis.financialHealthScore} />
          </div>
        </div>
        <div className="bg-white/60 rounded-xl p-4">
          <div className="text-sm text-gray-500 mb-1">Investor Persona</div>
          {personaChanged ? (
            <div className="text-base font-semibold text-slate-700">
              {PERSONA_DEFINITIONS[previous.persona.personaType].name} &rarr; {PERSONA_DEFINITIONS[current.persona.personaType].name}
            </div>
          ) : (
            <div className="text-base font-semibold text-slate-700">
              {PERSONA_DEFINITIONS[current.persona.personaType].name} <span className="text-gray-400 font-normal text-sm">(unchanged)</span>
            </div>
          )}
        </div>
      </div>

      {current.driftSummary && (
        <p className="text-base text-gray-600 leading-relaxed">{current.driftSummary}</p>
      )}
      {!current.driftSummary && Math.abs(healthDelta) > 0 && (
        <p className="text-base text-gray-600 leading-relaxed">
          Your financial health score {healthDelta > 0 ? "improved" : "declined"} by {Math.abs(healthDelta)} points since FY {previous.financialYear}.
        </p>
      )}
    </div>
  );
}
