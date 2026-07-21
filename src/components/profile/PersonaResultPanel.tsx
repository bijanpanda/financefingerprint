"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { InvestorPersona, SpendingPersona, AISynthesis } from "@/types/profile";
import { PERSONA_DEFINITIONS } from "@/utils/questionBank";
import { SPENDING_ARCHETYPE_DEFINITIONS } from "@/utils/spendingQuestionBank";
import AllocationBar from "./AllocationBar";
import ProfileFlagRow from "./ProfileFlagRow";

interface Props {
  investorPersona: InvestorPersona;
  spendingPersona?: SpendingPersona;
  aiSynthesis: AISynthesis;
}

const ALLOCATION_COLORS: Record<string, string> = {
  Equity: "#10b981",
  Debt: "#3b82f6",
  Hybrid: "#8b5cf6",
  Alternative: "#f59e0b",
  Liquid: "#6b7280",
};

const VISIBLE_FLAG_LIMIT = 4;

export default function PersonaResultPanel({ investorPersona, spendingPersona, aiSynthesis }: Props) {
  const router = useRouter();
  const [showAllFlags, setShowAllFlags] = useState(false);

  const def = PERSONA_DEFINITIONS[investorPersona.personaType];
  const spendingDef = spendingPersona ? SPENDING_ARCHETYPE_DEFINITIONS[spendingPersona.archetype] : null;
  const allocation = aiSynthesis.suggestedAllocation;
  const allFlags = [...aiSynthesis.flags, ...(aiSynthesis.spendingFlags || [])];
  const visibleFlags = showAllFlags ? allFlags : allFlags.slice(0, VISIBLE_FLAG_LIMIT);

  return (
    <div className="h-full overflow-y-auto px-8 py-8 space-y-8">
      {/* Investor persona hero — dark accent tile, echoing a debit-card treatment */}
      <div
        className="relative overflow-hidden rounded-2xl text-center px-6 py-8 shadow-lg"
        style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)" }}
      >
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "repeating-linear-gradient(90deg, #fff 0px, #fff 1px, transparent 1px, transparent 8px)",
          }}
        />
        <div className="relative">
          <span className="text-6xl block mb-2">{def.emoji}</span>
          <p className="text-xl font-extrabold text-white">{def.name}</p>
          <p className="text-sm text-slate-400 mb-4">{def.tagline}</p>
          <div
            className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-white font-bold text-2xl shadow-sm ring-4 ring-white/10"
            style={{ backgroundColor: def.color }}
          >
            {Math.round(investorPersona.compositeScore)}
          </div>

          {aiSynthesis.combinedPersonaTag && (
            <div className="mt-4 inline-block text-sm font-semibold bg-white/10 text-white px-4 py-2 rounded-full">
              {aiSynthesis.combinedPersonaTag}
            </div>
          )}
        </div>
      </div>

      {/* Asset allocation */}
      <section>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Asset Allocation</p>
        <div className="space-y-3.5">
          <AllocationBar label="Equity" value={allocation.equity} color={ALLOCATION_COLORS.Equity} />
          <AllocationBar label="Debt" value={allocation.debt} color={ALLOCATION_COLORS.Debt} />
          <AllocationBar label="Hybrid" value={allocation.hybrid} color={ALLOCATION_COLORS.Hybrid} />
          <AllocationBar label="Alt/Gold" value={allocation.alternative} color={ALLOCATION_COLORS.Alternative} />
          <AllocationBar label="Liquid" value={allocation.liquid} color={ALLOCATION_COLORS.Liquid} />
        </div>
      </section>

      {/* Spending type mini card */}
      {spendingPersona && spendingDef && (
        <section className="bg-white/60 rounded-xl p-5">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Spending Type</p>
          <div className="flex items-center gap-4">
            <span className="text-4xl">{spendingDef.emoji}</span>
            <div className="min-w-0">
              <p className="text-base font-bold text-slate-800 truncate">{spendingDef.name}</p>
              <p className="text-sm text-gray-400 truncate">{spendingDef.tagline}</p>
            </div>
            <span className="ml-auto text-lg font-bold text-amber-600 shrink-0">{spendingPersona.archetypeScore}</span>
          </div>
        </section>
      )}

      {/* Profile flags */}
      {allFlags.length > 0 && (
        <section>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Profile Flags</p>
          <div className="space-y-2.5">
            {visibleFlags.map((flag, i) => (
              <ProfileFlagRow key={i} flag={flag} />
            ))}
          </div>
          {allFlags.length > VISIBLE_FLAG_LIMIT && (
            <button
              onClick={() => setShowAllFlags((s) => !s)}
              className="text-sm font-semibold text-teal-600 hover:text-teal-700 mt-3"
            >
              {showAllFlags ? "Show fewer" : `Show ${allFlags.length - VISIBLE_FLAG_LIMIT} more`}
            </button>
          )}
        </section>
      )}

      {/* Deep dive */}
      <button
        onClick={() => router.push("/profile/reveal")}
        className="w-full gradient-btn text-white text-base font-semibold rounded-lg py-3.5"
      >
        Deep dive my persona &rarr;
      </button>
    </div>
  );
}
