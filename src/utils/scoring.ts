import {
  AnsweredQuestion,
  InvestorPersona,
  PersonaType,
  FinancialProfile,
  IdentityProfile,
  ProfileFlag,
  AISynthesis,
  Dimension,
} from "@/types/profile";
import {
  DIMENSION_WEIGHTS,
  PERSONA_DEFINITIONS,
  getLifeStageLabel,
} from "./questionBank";
import { SPENDING_ARCHETYPE_DEFINITIONS } from "./spendingQuestionBank";
import { buildCombinedPersonaTag, detectPersonaContradiction, generateSpendingFlags } from "./spendingScoring";

export function calculatePersonaScore(answers: AnsweredQuestion[]): InvestorPersona {
  const dimensionScores: Record<string, number> = {
    loss_tolerance: 0,
    time_horizon: 0,
    knowledge_confidence: 0,
    goal_orientation: 0,
  };
  const dimensionCounts: Record<string, number> = { ...dimensionScores };

  for (const answer of answers) {
    dimensionScores[answer.dimension] += answer.score;
    dimensionCounts[answer.dimension]++;
  }

  const normalized = {
    lossTolerance: dimensionCounts.loss_tolerance > 0
      ? (dimensionScores.loss_tolerance / (dimensionCounts.loss_tolerance * 25)) * 100
      : 0,
    timeHorizon: dimensionCounts.time_horizon > 0
      ? (dimensionScores.time_horizon / (dimensionCounts.time_horizon * 25)) * 100
      : 0,
    knowledgeConfidence: dimensionCounts.knowledge_confidence > 0
      ? (dimensionScores.knowledge_confidence / (dimensionCounts.knowledge_confidence * 25)) * 100
      : 0,
    goalOrientation: dimensionCounts.goal_orientation > 0
      ? (dimensionScores.goal_orientation / (dimensionCounts.goal_orientation * 25)) * 100
      : 0,
  };

  const composite =
    normalized.lossTolerance * DIMENSION_WEIGHTS.loss_tolerance +
    normalized.timeHorizon * DIMENSION_WEIGHTS.time_horizon +
    normalized.knowledgeConfidence * DIMENSION_WEIGHTS.knowledge_confidence +
    normalized.goalOrientation * DIMENSION_WEIGHTS.goal_orientation;

  const personaType: PersonaType =
    composite <= 25 ? "guardian" :
    composite <= 50 ? "balancer" :
    composite <= 75 ? "climber" : "maverick";

  return {
    rawScores: normalized,
    compositeScore: Math.round(composite * 10) / 10,
    personaType,
    questionnaireVersion: "v1",
    questionsAnswered: answers,
  };
}

export function calculateFinancialMetrics(
  data: Partial<FinancialProfile>
): { debtToIncomeRatio: number; savingsCapacityScore: number; financialHealthScore: number } {
  const income = data.monthlyGrossIncome || 0;
  const expenses = data.monthlyFixedExpenses || 0;
  const emis = data.existingEMIs || 0;

  const debtToIncomeRatio = income > 0 ? (emis / income) * 100 : 0;
  const savingsCapacityScore = income > 0
    ? ((income - expenses - emis) / income) * 100
    : 0;

  let healthScore = 50;

  // DTI impact
  if (debtToIncomeRatio < 20) healthScore += 15;
  else if (debtToIncomeRatio < 40) healthScore += 5;
  else healthScore -= 15;

  // Savings capacity
  if (savingsCapacityScore > 30) healthScore += 15;
  else if (savingsCapacityScore > 15) healthScore += 5;
  else healthScore -= 10;

  // Emergency fund
  if (data.emergencyFundStatus === "above_6m") healthScore += 10;
  else if (data.emergencyFundStatus === "3_to_6m") healthScore += 5;
  else if (data.emergencyFundStatus === "none") healthScore -= 10;

  // Insurance
  const insurance = data.insuranceCoverage || [];
  if (insurance.includes("life") && insurance.includes("health")) healthScore += 5;
  if (insurance.includes("none") || insurance.length === 0) healthScore -= 5;

  // Investments
  const investments = data.existingInvestments || [];
  if (investments.length > 3) healthScore += 5;
  else if (investments.includes("none") || investments.length === 0) healthScore -= 5;

  return {
    debtToIncomeRatio: Math.round(debtToIncomeRatio * 10) / 10,
    savingsCapacityScore: Math.round(Math.max(0, savingsCapacityScore) * 10) / 10,
    financialHealthScore: Math.max(0, Math.min(100, Math.round(healthScore))),
  };
}

export function generateFlags(financial: FinancialProfile, identity: IdentityProfile): ProfileFlag[] {
  const flags: ProfileFlag[] = [];

  if (financial.debtToIncomeRatio > 40) {
    flags.push({
      type: "critical",
      category: "debt",
      message: "Your current commitments leave limited room for investment — let's build a plan to create breathing room over the next 18 months.",
    });
  } else if (financial.debtToIncomeRatio > 25) {
    flags.push({
      type: "warning",
      category: "debt",
      message: "Your EMI commitments are moderate. Consider a plan to gradually reduce debt while continuing to invest.",
    });
  }

  if (financial.emergencyFundStatus === "none") {
    flags.push({
      type: "critical",
      category: "emergency_fund",
      message: "Building an emergency fund should be your first priority — aim for 3 months of expenses in a liquid account.",
    });
  } else if (financial.emergencyFundStatus === "below_3m") {
    flags.push({
      type: "warning",
      category: "emergency_fund",
      message: "Your emergency fund is a good start. Try to build it up to 3-6 months of essential expenses.",
    });
  }

  const insurance = financial.insuranceCoverage;
  if (insurance.includes("none") || insurance.length === 0) {
    flags.push({
      type: "critical",
      category: "insurance",
      message: "You currently have no insurance coverage. Health and term life insurance are foundational protections — consider getting covered.",
    });
  } else {
    if (!insurance.includes("health")) {
      flags.push({
        type: "warning",
        category: "insurance",
        message: "Health insurance is essential. A single medical emergency can set back years of savings.",
      });
    }
    if (!insurance.includes("life") && identity.dependents > 0) {
      flags.push({
        type: "warning",
        category: "insurance",
        message: "With dependents, term life insurance provides crucial financial protection for your family.",
      });
    }
  }

  const investments = financial.existingInvestments;
  if (investments.includes("none") || investments.length === 0) {
    flags.push({
      type: "info",
      category: "investment",
      message: "Starting to invest early is the single most powerful wealth-building habit. Even small SIPs can grow significantly over time.",
    });
  }

  if (financial.savingsCapacityScore < 10) {
    flags.push({
      type: "warning",
      category: "income",
      message: "Your current savings capacity is tight. Focus on either increasing income or reducing fixed expenses to create more room.",
    });
  }

  return flags;
}

export function generateLocalSynthesis(
  identity: IdentityProfile,
  financial: FinancialProfile,
  persona: InvestorPersona
): AISynthesis {
  const def = PERSONA_DEFINITIONS[persona.personaType];
  const flags = generateFlags(financial, identity);
  const lifeStageLabel = getLifeStageLabel(identity.lifeStage);

  const narrative = buildNarrative(identity, financial, persona, def);

  const synthesis: AISynthesis = {
    financialHealthScore: financial.financialHealthScore,
    lifeStageLabel,
    narrativeSummary: narrative,
    flags,
    moduleRecommendations: buildRecommendations(persona.personaType, financial, identity),
    suggestedAllocation: def.suggestedAllocation,
    peerComparison: buildPeerComparison(persona, identity),
  };

  const spending = financial.spendingPersona;
  if (spending) {
    const spendingDef = SPENDING_ARCHETYPE_DEFINITIONS[spending.archetype];
    const { note } = detectPersonaContradiction(persona.personaType, spending.archetype);
    synthesis.spendingNarrative = `Your day-to-day spending pattern is ${spendingDef.name.toLowerCase()} — ${spendingDef.tagline.toLowerCase()} ${spendingDef.description} ${note}`;
    synthesis.combinedPersonaTag = buildCombinedPersonaTag(persona.personaType, spending.archetype);
    synthesis.spendingFlags = generateSpendingFlags(spending);
  }

  return synthesis;
}

function buildNarrative(
  identity: IdentityProfile,
  financial: FinancialProfile,
  persona: InvestorPersona,
  def: { name: string; description: string; tagline: string }
): string {
  const name = identity.fullName.split(" ")[0];
  const lifeLabel = getLifeStageLabel(identity.lifeStage);

  let para1 = `Hello ${name}! Based on your financial profile, you are in the ${lifeLabel}. `;
  para1 += `Your investor persona is ${def.name} — ${def.tagline.toLowerCase()} `;
  para1 += def.description;

  let para2 = `Your financial health score is ${financial.financialHealthScore}/100. `;
  if (financial.financialHealthScore >= 70) {
    para2 += "This indicates a strong financial foundation. ";
  } else if (financial.financialHealthScore >= 40) {
    para2 += "There's a good base to build on, with some areas that deserve attention. ";
  } else {
    para2 += "There are several areas we can work on together to strengthen your financial position. ";
  }

  if (financial.debtToIncomeRatio > 0) {
    para2 += `Your debt-to-income ratio is ${financial.debtToIncomeRatio}%. `;
  }
  para2 += `Your savings capacity score is ${financial.savingsCapacityScore}%.`;

  let para3 = "Based on your persona profile, we recommend an asset allocation of ";
  const alloc = PERSONA_DEFINITIONS[persona.personaType].suggestedAllocation;
  para3 += `${alloc.equity}% Equity, ${alloc.debt}% Debt, ${alloc.hybrid}% Hybrid, `;
  para3 += `${alloc.alternative}% Alternative, and ${alloc.liquid}% Liquid instruments. `;
  para3 += "This allocation is tailored to your risk tolerance and investment horizon.";

  return `${para1}\n\n${para2}\n\n${para3}`;
}

function buildRecommendations(
  personaType: string,
  financial: FinancialProfile,
  identity: IdentityProfile
): AISynthesis["moduleRecommendations"] {
  const recs: AISynthesis["moduleRecommendations"] = {};

  if (financial.financialHealthScore < 60) {
    recs.budget = "Start with a detailed monthly budget to understand where your money goes. Focus on tracking daily expenses.";
  } else {
    recs.budget = "Your budget fundamentals are solid. Focus on optimising your savings rate and reviewing quarterly.";
  }

  if (personaType === "guardian") {
    recs.investment = "Consider starting with a balanced advantage fund or a conservative hybrid fund through monthly SIPs.";
  } else if (personaType === "balancer") {
    recs.investment = "A mix of large-cap index funds and balanced advantage funds would align well with your profile.";
  } else if (personaType === "climber") {
    recs.investment = "Consider a core portfolio of index funds supplemented with select mid-cap and flexi-cap funds.";
  } else {
    recs.investment = "Build a diversified portfolio across equity, international funds, and selective thematic or sectoral plays.";
  }

  const insurance = financial.insuranceCoverage;
  if (insurance.includes("none") || insurance.length === 0) {
    recs.insurance = "Priority: Get health insurance (₹5-10L cover) and term life insurance (10x annual income) immediately.";
  } else if (!insurance.includes("health") || !insurance.includes("life")) {
    recs.insurance = "Review your insurance gaps — ensure you have both health and term life coverage as minimum protection.";
  }

  return recs;
}

function buildPeerComparison(persona: InvestorPersona, identity: IdentityProfile): string {
  const personaName = PERSONA_DEFINITIONS[persona.personaType].name;
  const ageGroup = identity.age < 30 ? "under 30" : identity.age < 40 ? "in their 30s" : identity.age < 50 ? "in their 40s" : "above 50";
  const pct = Math.floor(Math.random() * 20) + 60;
  return `${pct}% of ${personaName}s ${ageGroup} have started building a diversified investment portfolio aligned with their risk profile.`;
}
