"use client";

import { CustomerProfile } from "@/types/profile";
import { Currency } from "@/types";
import { getLifeStageLabel } from "@/utils/questionBank";
import { formatCurrency } from "@/utils/currency";
import HealthScoreMeter from "./HealthScoreMeter";
import ProfileLayerCard from "./ProfileLayerCard";
import DimensionBar from "./DimensionBar";
import AINarrativeBlock from "./AINarrativeBlock";
import ProfileEvolutionCard from "./ProfileEvolutionCard";

interface Props {
  profile: CustomerProfile;
  previousProfile?: CustomerProfile | null;
  currency: Currency;
}

function dtiColor(dti: number): string {
  if (dti > 40) return "text-rose-600";
  if (dti >= 20) return "text-amber-600";
  return "text-teal-600";
}

export default function ProfileSummaryPanel({ profile, previousProfile, currency }: Props) {
  const { identity, financial, persona, aiSynthesis } = profile;
  const spending = financial.spendingPersona;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <HealthScoreMeter score={aiSynthesis.financialHealthScore} />

      <div className="flex-1 overflow-y-auto px-8 py-7 space-y-6">
        {/* Layer 1 — Identity */}
        <ProfileLayerCard icon="👤" title="Identity Profile" completionBadge="Complete">
          <div className="flex flex-wrap gap-2.5 mb-4">
            {[
              getLifeStageLabel(identity.lifeStage),
              `${identity.age} years`,
              identity.employmentType.replace(/_/g, " "),
              `${identity.dependents} dependents`,
            ].map((chip) => (
              <span key={chip} className="text-sm font-medium bg-slate-50 text-slate-600 px-3 py-1.5 rounded-full capitalize">
                {chip}
              </span>
            ))}
          </div>
          <AINarrativeBlock text={aiSynthesis.narrativeSummary} />
        </ProfileLayerCard>

        {/* Layer 2 — Financial */}
        <ProfileLayerCard icon="💰" title="Financial Profile" completionBadge="Complete">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">EMIs</div>
              <div className="text-lg font-bold text-slate-700">{formatCurrency(financial.existingEMIs, currency)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">DTI Ratio</div>
              <div className={`text-lg font-bold ${dtiColor(financial.debtToIncomeRatio)}`}>{financial.debtToIncomeRatio}%</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">Savings %</div>
              <div className="text-lg font-bold text-slate-700">{financial.savingsCapacityScore}%</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">Emergency Fund</div>
              <div className={`text-lg font-bold flex items-center gap-1 ${financial.emergencyFundStatus === "none" ? "text-rose-600" : "text-slate-700"}`}>
                {financial.emergencyFundStatus === "none" && <span>⚠️</span>}
                {financial.emergencyFundStatus.replace(/_/g, " ")}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-1">
            {financial.existingInvestments.map((inv) => (
              <span key={inv} className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full capitalize">{inv.replace(/_/g, " ")}</span>
            ))}
            {financial.insuranceCoverage.map((ins) => (
              <span
                key={ins}
                className={`text-xs px-2.5 py-1 rounded-full capitalize flex items-center gap-1 ${ins === "none" ? "bg-rose-50 text-rose-700" : "bg-teal-50 text-teal-700"}`}
              >
                {ins === "none" && <span>⚠️</span>}
                {ins} insurance
              </span>
            ))}
          </div>

          {spending && (
            <div className="mt-5 pt-5 border-t border-[var(--border-default)] grid grid-cols-2 gap-x-6 gap-y-3">
              <DimensionBar label="Impulse Control" value={spending.dimensionScores.impulseControl} />
              <DimensionBar label="Savings Consistency" value={spending.dimensionScores.savingsConsistency} />
              <DimensionBar label="Planning" value={spending.dimensionScores.planningBehaviour} />
              <DimensionBar label="Lifestyle Inflation" value={spending.dimensionScores.lifestyleInflation} />
            </div>
          )}
        </ProfileLayerCard>

        {/* Layer 3 — Investor Persona */}
        <ProfileLayerCard icon="🧭" title="Investor Persona" completionBadge="Complete">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-4">
            <DimensionBar label="Loss Tolerance" value={persona.rawScores.lossTolerance} weight="35%" />
            <DimensionBar label="Time Horizon" value={persona.rawScores.timeHorizon} weight="25%" />
            <DimensionBar label="Knowledge" value={persona.rawScores.knowledgeConfidence} weight="20%" />
            <DimensionBar label="Goal Orientation" value={persona.rawScores.goalOrientation} weight="20%" />
          </div>
          <div className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-3">
            <span className="text-sm font-semibold text-slate-600">Composite Score</span>
            <span className="text-lg font-bold text-teal-700">{persona.compositeScore}/100</span>
          </div>
        </ProfileLayerCard>

        {/* Spending Personality */}
        {spending && (
          <ProfileLayerCard icon="🛍️" title="Spending Personality" completionBadge="Complete">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-4">
              <DimensionBar label="Impulse Control" value={spending.dimensionScores.impulseControl} weight="30%" />
              <DimensionBar label="Savings Consistency" value={spending.dimensionScores.savingsConsistency} weight="25%" />
              <DimensionBar label="Planning" value={spending.dimensionScores.planningBehaviour} weight="20%" />
              <DimensionBar label="Lifestyle Inflation" value={spending.dimensionScores.lifestyleInflation} weight="15%" />
              <DimensionBar label="Emotional Spending" value={spending.dimensionScores.emotionalSpending} weight="10%" />
            </div>
            <div className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-3">
              <span className="text-sm font-semibold text-slate-600">Composite Score</span>
              <span className="text-lg font-bold text-amber-700">{spending.archetypeScore}/100</span>
            </div>
          </ProfileLayerCard>
        )}

        {/* AI Synthesis */}
        <ProfileLayerCard icon="🧬" title="AI Synthesis">
          <AINarrativeBlock text={aiSynthesis.narrativeSummary} />
          {aiSynthesis.moduleRecommendations && (
            <div className="mt-5 space-y-3">
              {Object.entries(aiSynthesis.moduleRecommendations)
                .filter(([, v]) => v)
                .map(([key, value]) => (
                  <div key={key} className="bg-white/60 rounded-lg p-4">
                    <span className="text-xs font-semibold text-teal-600 uppercase tracking-wider">{key}</span>
                    <p className="text-sm text-gray-600 mt-1">{value}</p>
                  </div>
                ))}
            </div>
          )}
        </ProfileLayerCard>

        {/* Evolution — returning users only */}
        {previousProfile && <ProfileEvolutionCard current={profile} previous={previousProfile} />}
      </div>
    </div>
  );
}
