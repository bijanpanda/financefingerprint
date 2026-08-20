import { Currency } from "@/types";

export type SavingsMode = "indexed" | "flat";

export type FxSource = "live" | "manual";

export type AssetType =
  // India
  | "ppf"
  | "epf"
  | "nps"
  | "mutual_fund"
  | "equity"
  | "fixed_deposit"
  | "gold"
  | "sovereign_gold_bond"
  // USA
  | "401k"
  | "roth_ira"
  | "traditional_ira"
  | "hsa"
  | "brokerage"
  // UK / EU
  | "isa"
  | "sipp"
  | "workplace_pension"
  // Anywhere
  | "cash_savings"
  | "bonds"
  | "rental_property_equity"
  | "crypto"
  | "other";

export interface AssetAccount {
  id: string;
  label: string;
  assetType: AssetType;
  currency: Currency;
  balance: number;
  fxRate: number;
  fxSource: FxSource;
  fxAsOf: string;
  expectedReturn: number;
  availableFromAge: number | null;
}

export type IncomeKind = "rent" | "dividends" | "annuity" | "pension" | "part_time";

export type IncomeGrowth = "inflation" | "flat";

export interface IncomeStream {
  id: string;
  label: string;
  kind: IncomeKind;
  amountPerYear: number;
  startAge: number;
  endAge: number | null;
  growth: IncomeGrowth;
}

export type GoalCategory =
  | "child_education"
  | "wedding"
  | "home_down_payment"
  | "vehicle_purchase"
  | "medical_care"
  | "travel"
  | "loan_payoff"
  | "custom";

export const CATEGORY_INFLATION: Record<Exclude<GoalCategory, "custom">, number> = {
  child_education: 0.1,
  wedding: 0.08,
  home_down_payment: 0.07,
  vehicle_purchase: 0.05,
  medical_care: 0.09,
  travel: 0.06,
  loan_payoff: 0,
};

export interface Goal {
  id: string;
  label: string;
  amountPerYear: number;
  startAge: number;
  durationYears: number;
  everyNYears: number | null;
  category: GoalCategory;
  inflationRate: number | null;
}

export interface RetirementPlan {
  currentAge: number;
  country: string;
  baseCurrency: Currency;
  currentBalance: number;
  lifeExpectancy: number;
  retirementAge: number;
  inflationRate: number;
  returnRatePre: number;
  returnRatePost: number;
  annualSavings: number;
  savingsMode: SavingsMode;
  incomeStreams: IncomeStream[];
  annualLivingExpense: number;
  goals: Goal[];
}

export interface LedgerRow {
  age: number;
  beginBalance: number;
  in: number;
  expense: number;
  expenseFor: string | null;
  earning: number;
  endToday: number;
  endNominal: number;
}

export interface ProjectionResult {
  rows: LedgerRow[];
  depletionAge: number | null;
  buffer: number;
  passes: boolean;
}

export type SolveLever =
  | "savings"
  | "returnPre"
  | "returnPost"
  | "retirementAge"
  | "livingExpense"
  | "income";
