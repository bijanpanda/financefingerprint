export type EmploymentType =
  | "salaried"
  | "self_employed"
  | "business_owner"
  | "retired"
  | "student"
  | "homemaker";

export type LifeStage =
  | "early_career"
  | "wealth_building"
  | "wealth_accumulation"
  | "wealth_preservation"
  | "pre_retirement"
  | "retirement";

export type InvestmentType =
  | "mutual_funds"
  | "stocks"
  | "fixed_deposit"
  | "real_estate"
  | "gold"
  | "ppf_epf"
  | "crypto"
  | "none";

export type InsuranceType = "life" | "health" | "vehicle" | "home" | "none";

export type EmergencyFundStatus = "none" | "below_3m" | "3_to_6m" | "above_6m";

export type PersonaType = "guardian" | "balancer" | "climber" | "maverick";

export type ProfileStatus = "draft" | "complete";

export type QuestionFormat = "single_choice" | "scale" | "ranking";

export type Dimension =
  | "loss_tolerance"
  | "time_horizon"
  | "knowledge_confidence"
  | "goal_orientation";

export type Gender = "male" | "female" | "other" | "prefer_not_to_say";

export type ResidenceType = "urban" | "semi_urban" | "rural";

export type EducationLevel =
  | "below_10th"
  | "hsc"
  | "graduate"
  | "postgraduate"
  | "professional";

export type FamilyStatus = "single" | "married" | "divorced" | "widowed";

export type IncomeStability = "fixed" | "variable" | "seasonal";

export interface IdentityProfile {
  fullName: string;
  dateOfBirth: string;
  age: number;
  gender?: Gender;
  city: string;
  region: string;
  residenceType: ResidenceType;
  educationLevel: EducationLevel;
  familyStatus: FamilyStatus;
  dependents: number;
  employmentType: EmploymentType;
  employmentSubType: string;
  lifeStage: LifeStage;
}

export interface FinancialProfile {
  monthlyGrossIncome: number;
  incomeStability: IncomeStability;
  hasSecondaryIncome: boolean;
  secondaryIncomeAmount?: number;
  monthlyFixedExpenses: number;
  existingEMIs: number;
  existingInvestments: InvestmentType[];
  insuranceCoverage: InsuranceType[];
  emergencyFundStatus: EmergencyFundStatus;
  debtToIncomeRatio: number;
  savingsCapacityScore: number;
  financialHealthScore: number;
  // Spending Personality — optional so existing callers that don't populate it yet still type-check
  spendingPersona?: SpendingPersona;
}

export type SpendingArchetype =
  | "impulsive_spender"
  | "spender"
  | "moderate_spender"
  | "moderate_saver"
  | "saver"
  | "extreme_saver";

export type SpendingDimension =
  | "impulse_control"
  | "planning_behaviour"
  | "savings_consistency"
  | "lifestyle_inflation"
  | "emotional_spending";

export interface SpendingAnswer {
  questionId: string;
  dimension: SpendingDimension;
  questionText: string;
  selectedOption: string;
  score: number;
}

export interface BudgetRule {
  category: string;
  currentEstimatedPercent: number;
  recommendedPercent: number;
  rationale: string;
}

export interface CategoryNudge {
  category: string;
  nudgeText: string;
  severity: "info" | "warning" | "alert";
}

// Pro/paid tier only — null for free users
export interface SpendingProInsights {
  budgetRules: BudgetRule[];
  categoryNudges: CategoryNudge[];
  autoSavingsTarget: number;
  savingsVehicle: string;
  triggerWarnings: string[];
}

export interface SpendingPersona {
  archetypeScore: number;
  archetype: SpendingArchetype;
  dimensionScores: {
    impulseControl: number;
    planningBehaviour: number;
    savingsConsistency: number;
    lifestyleInflation: number;
    emotionalSpending: number;
  };
  questionsAnswered: SpendingAnswer[];
  proInsights?: SpendingProInsights | null;
}

export interface SpendingArchetypeDefinition {
  name: string;
  emoji: string;
  tagline: string;
  description: string;
  strengths: string[];
  blindSpots: string[];
  color: string;
  proNudge: string;
}

export interface SpendingQuestion {
  id: string;
  dimension: SpendingDimension;
  format: QuestionFormat;
  text: string;
  options?: QuestionOption[];
  scaleMin?: number;
  scaleMax?: number;
  scaleLabels?: { min: string; max: string };
  weight: number;
}

export interface QuestionOption {
  id: string;
  text: string;
  score: number;
}

export interface Question {
  id: string;
  dimension: Dimension;
  format: QuestionFormat;
  text: string;
  options?: QuestionOption[];
  scaleMin?: number;
  scaleMax?: number;
  scaleLabels?: { min: string; max: string };
  rankingItems?: string[];
  weight: number;
}

export interface AnsweredQuestion {
  questionId: string;
  dimension: Dimension;
  questionText: string;
  selectedOption: string;
  score: number;
}

export interface InvestorPersona {
  rawScores: {
    lossTolerance: number;
    timeHorizon: number;
    knowledgeConfidence: number;
    goalOrientation: number;
  };
  compositeScore: number;
  personaType: PersonaType;
  questionnaireVersion: string;
  questionsAnswered: AnsweredQuestion[];
}

export interface ProfileFlag {
  type: "warning" | "info" | "critical";
  category: "debt" | "insurance" | "emergency_fund" | "investment" | "income";
  message: string;
}

export interface AISynthesis {
  financialHealthScore: number;
  lifeStageLabel: string;
  narrativeSummary: string;
  flags: ProfileFlag[];
  moduleRecommendations: {
    budget?: string;
    investment?: string;
    insurance?: string;
    tax?: string;
  };
  suggestedAllocation: {
    equity: number;
    debt: number;
    hybrid: number;
    alternative: number;
    liquid: number;
  };
  peerComparison?: string;
  // Spending Personality synthesis (Addendum v1.1) — optional until spendingPersona is provided
  spendingNarrative?: string;
  combinedPersonaTag?: string;
  spendingFlags?: ProfileFlag[];
  // Only present when synthesized against a previous year's profile
  driftSummary?: string;
}

export interface CustomerProfile {
  profileId: string;
  userId: string;
  profileVersion: string;
  financialYear: string;
  createdAt: Date;
  updatedAt: Date;
  status: ProfileStatus;
  identity: IdentityProfile;
  financial: FinancialProfile;
  persona: InvestorPersona;
  aiSynthesis: AISynthesis;
  previousProfileId?: string;
  driftSummary?: string;
}

export interface ProfileSession {
  userId: string;
  currentStep: "setup" | "identity" | "financial" | "spending" | "questionnaire" | "processing" | "reveal";
  identityData?: Partial<IdentityProfile>;
  financialData?: Partial<FinancialProfile>;
  selectedQuestions?: Question[];
  answers?: AnsweredQuestion[];
  currentQuestionIndex?: number;
  // Spending Personality questionnaire (Addendum v1.1) — blended into Layer 2, shown right after the core financial fields
  selectedSpendingQuestions?: SpendingQuestion[];
  spendingAnswers?: SpendingAnswer[];
  spendingQuestionIndex?: number;
  startedAt: number;
}

export interface PersonaDefinition {
  name: string;
  emoji: string;
  tagline: string;
  description: string;
  strengths: string[];
  blindSpots: string[];
  color: string;
  suggestedAllocation: {
    equity: number;
    debt: number;
    hybrid: number;
    alternative: number;
    liquid: number;
  };
}
