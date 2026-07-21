import {
  SpendingAnswer,
  SpendingPersona,
  SpendingArchetype,
  ProfileFlag,
  PersonaType,
} from "@/types/profile";
import { SPENDING_DIMENSION_WEIGHTS, SPENDING_ARCHETYPE_DEFINITIONS } from "./spendingQuestionBank";
import { PERSONA_DEFINITIONS } from "./questionBank";

export function calculateSpendingScore(answers: SpendingAnswer[]): SpendingPersona {
  const dimensionScores: Record<string, number> = {
    impulse_control: 0,
    planning_behaviour: 0,
    savings_consistency: 0,
    lifestyle_inflation: 0,
    emotional_spending: 0,
  };
  const dimensionCounts: Record<string, number> = { ...dimensionScores };

  for (const answer of answers) {
    dimensionScores[answer.dimension] += answer.score;
    dimensionCounts[answer.dimension]++;
  }

  const normalized = {
    impulseControl: dimensionCounts.impulse_control > 0
      ? (dimensionScores.impulse_control / (dimensionCounts.impulse_control * 25)) * 100
      : 0,
    planningBehaviour: dimensionCounts.planning_behaviour > 0
      ? (dimensionScores.planning_behaviour / (dimensionCounts.planning_behaviour * 25)) * 100
      : 0,
    savingsConsistency: dimensionCounts.savings_consistency > 0
      ? (dimensionScores.savings_consistency / (dimensionCounts.savings_consistency * 25)) * 100
      : 0,
    lifestyleInflation: dimensionCounts.lifestyle_inflation > 0
      ? (dimensionScores.lifestyle_inflation / (dimensionCounts.lifestyle_inflation * 25)) * 100
      : 0,
    emotionalSpending: dimensionCounts.emotional_spending > 0
      ? (dimensionScores.emotional_spending / (dimensionCounts.emotional_spending * 25)) * 100
      : 0,
  };

  const composite =
    normalized.impulseControl * SPENDING_DIMENSION_WEIGHTS.impulse_control +
    normalized.planningBehaviour * SPENDING_DIMENSION_WEIGHTS.planning_behaviour +
    normalized.savingsConsistency * SPENDING_DIMENSION_WEIGHTS.savings_consistency +
    normalized.lifestyleInflation * SPENDING_DIMENSION_WEIGHTS.lifestyle_inflation +
    normalized.emotionalSpending * SPENDING_DIMENSION_WEIGHTS.emotional_spending;

  const archetype: SpendingArchetype =
    composite <= 15 ? "impulsive_spender" :
    composite <= 30 ? "spender" :
    composite <= 45 ? "moderate_spender" :
    composite <= 60 ? "moderate_saver" :
    composite <= 75 ? "saver" : "extreme_saver";

  return {
    archetypeScore: Math.round(composite * 10) / 10,
    archetype,
    dimensionScores: normalized,
    questionsAnswered: answers,
    proInsights: null, // Populated only for Pro tier users — see generateSpendingInsights
  };
}

export function generateSpendingFlags(spending: SpendingPersona): ProfileFlag[] {
  const flags: ProfileFlag[] = [];

  if (spending.dimensionScores.impulseControl < 30) {
    flags.push({
      type: "warning",
      category: "investment",
      message: "Impulse purchases are eating into your ability to save consistently — a short cooling-off rule before non-essential buys could help.",
    });
  }

  if (spending.dimensionScores.savingsConsistency < 30) {
    flags.push({
      type: "warning",
      category: "income",
      message: "Your savings happen inconsistently month to month. An automatic transfer on salary day removes the decision entirely.",
    });
  }

  if (spending.dimensionScores.lifestyleInflation < 30) {
    flags.push({
      type: "info",
      category: "income",
      message: "Spending tends to rise as income grows. Redirecting a fixed share of any future raise straight to investments protects long-term goals.",
    });
  }

  if (spending.archetype === "extreme_saver") {
    flags.push({
      type: "info",
      category: "income",
      message: "Your discipline is exceptional — just make sure frugality isn't costing you experiences that are worth the money.",
    });
  }

  return flags;
}

// Format: "[Investor Name] | [Spending Name]"
export function buildCombinedPersonaTag(
  investorPersonaType: PersonaType,
  spendingArchetype: SpendingArchetype
): string {
  const investorName = PERSONA_DEFINITIONS[investorPersonaType].name;
  const spendingName = SPENDING_ARCHETYPE_DEFINITIONS[spendingArchetype].name;
  return `${investorName} | ${spendingName}`;
}

// High-risk investing ambition undermined by low spending discipline, or vice-versa
const HIGH_RISK_INVESTORS: PersonaType[] = ["climber", "maverick"];
const LOW_DISCIPLINE_ARCHETYPES: SpendingArchetype[] = ["impulsive_spender", "spender"];
const HIGH_DISCIPLINE_ARCHETYPES: SpendingArchetype[] = ["saver", "extreme_saver"];

export function detectPersonaContradiction(
  investorPersonaType: PersonaType,
  spendingArchetype: SpendingArchetype
): { hasContradiction: boolean; note: string } {
  const isHighRiskInvestor = HIGH_RISK_INVESTORS.includes(investorPersonaType);
  const isLowDiscipline = LOW_DISCIPLINE_ARCHETYPES.includes(spendingArchetype);
  const isHighDiscipline = HIGH_DISCIPLINE_ARCHETYPES.includes(spendingArchetype);

  if (isHighRiskInvestor && isLowDiscipline) {
    return {
      hasContradiction: true,
      note:
        "You aim for aggressive wealth growth, but spending patterns suggest the fuel is leaking before it reaches the engine. Aligning your day-to-day habits with your investment ambition is the single biggest unlock available to you.",
    };
  }

  if (investorPersonaType === "guardian" && spendingArchetype === "extreme_saver") {
    return {
      hasContradiction: false,
      note:
        "Your caution is consistent across all financial behaviour — this gives you exceptional stability, but make sure wealth is serving your life, not the other way around.",
    };
  }

  if (isHighRiskInvestor && isHighDiscipline) {
    return {
      hasContradiction: false,
      note: "Your ambition for growth is backed by disciplined day-to-day habits — a genuinely strong combination.",
    };
  }

  if (!isHighRiskInvestor && isLowDiscipline) {
    return {
      hasContradiction: true,
      note:
        "Your investing style favours caution, yet day-to-day spending leaves little left to actually invest. Tightening spending habits would let your natural caution actually build wealth.",
    };
  }

  return { hasContradiction: false, note: "Your investing style and spending habits are broadly in step with each other." };
}
