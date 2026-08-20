import {
  CATEGORY_INFLATION,
  Goal,
  IncomeStream,
  LedgerRow,
  ProjectionResult,
  RetirementPlan,
  SolveLever,
} from "@/types/retirement";

const GOAL_LABELS: Record<Goal["category"], string> = {
  child_education: "Edu",
  wedding: "Wedding",
  home_down_payment: "Home",
  vehicle_purchase: "Vehicle",
  medical_care: "Medical",
  travel: "Travel",
  loan_payoff: "Loan",
  custom: "Goal",
};

function goalRate(goal: Goal, countryInflationRate: number): number {
  if (goal.inflationRate != null) return goal.inflationRate;
  if (goal.category !== "custom") return CATEGORY_INFLATION[goal.category];
  return countryInflationRate;
}

function goalActive(goal: Goal, age: number): boolean {
  if (goal.everyNYears != null) {
    return age >= goal.startAge && (age - goal.startAge) % goal.everyNYears === 0;
  }
  return age >= goal.startAge && age < goal.startAge + goal.durationYears;
}

function streamActive(stream: IncomeStream, age: number): boolean {
  return age >= stream.startAge && (stream.endAge == null || age <= stream.endAge);
}

function streamValue(stream: IncomeStream, age: number, currentAge: number, inflationRate: number): number {
  if (stream.growth === "inflation") {
    return stream.amountPerYear * Math.pow(1 + inflationRate, age - currentAge);
  }
  return stream.amountPerYear;
}

function incomeTotal(plan: RetirementPlan, age: number): number {
  let total = 0;
  for (const stream of plan.incomeStreams) {
    if (streamActive(stream, age)) {
      total += streamValue(stream, age, plan.currentAge, plan.inflationRate);
    }
  }
  return total;
}

export function project(plan: RetirementPlan): ProjectionResult {
  const rows: LedgerRow[] = [];
  let beginBalance = plan.currentBalance;
  let depletionAge: number | null = null;

  for (let age = plan.currentAge; age <= plan.lifeExpectancy; age++) {
    const f = Math.pow(1 + plan.inflationRate, age - plan.currentAge);
    const living = age >= plan.retirementAge ? plan.annualLivingExpense * f : 0;

    const activeGoals = plan.goals.filter((g) => goalActive(g, age));
    const goalsTotal = activeGoals.reduce((sum, g) => {
      const rate = goalRate(g, plan.inflationRate);
      return sum + g.amountPerYear * Math.pow(1 + rate, age - plan.currentAge);
    }, 0);

    const expense = living + goalsTotal;

    const saved =
      age < plan.retirementAge
        ? plan.savingsMode === "indexed"
          ? plan.annualSavings * f
          : plan.annualSavings
        : 0;

    const inflow = saved + incomeTotal(plan, age);
    const rate = age < plan.retirementAge ? plan.returnRatePre : plan.returnRatePost;

    const base = beginBalance + inflow - expense;
    const earning = base * rate;
    const end = base + earning;
    const endToday = end / f;

    const labels: string[] = [];
    for (const g of activeGoals) labels.push(GOAL_LABELS[g.category]);
    if (living > 0) labels.push("Living");

    rows.push({
      age,
      beginBalance,
      in: inflow,
      expense,
      expenseFor: labels.length > 0 ? labels.join(", ") : null,
      earning,
      endToday,
      endNominal: end,
    });

    if (end <= 0) {
      depletionAge = age;
      break;
    }

    beginBalance = end;
  }

  const buffer =
    2 * plan.annualLivingExpense * Math.pow(1 + plan.inflationRate, plan.lifeExpectancy - plan.currentAge);

  const lastRow = rows[rows.length - 1];
  const passes = lastRow.age === plan.lifeExpectancy && lastRow.endNominal >= buffer;

  return { rows, depletionAge, buffer, passes };
}

const MAX_ITERATIONS = 40;
const MONEY_STEP = 5000;
const RATE_STEP = 0.0005;

function roundMoney(value: number, safeDirection: "up" | "down"): number {
  return safeDirection === "up"
    ? Math.ceil(value / MONEY_STEP) * MONEY_STEP
    : Math.floor(value / MONEY_STEP) * MONEY_STEP;
}

function roundRate(value: number, safeDirection: "up" | "down"): number {
  return safeDirection === "up"
    ? Math.ceil(value / RATE_STEP) * RATE_STEP
    : Math.floor(value / RATE_STEP) * RATE_STEP;
}

interface LeverConfig {
  higherIsBetter: boolean;
  lo: (plan: RetirementPlan) => number;
  hi: (plan: RetirementPlan) => number;
  apply: (plan: RetirementPlan, value: number) => RetirementPlan;
  round: (value: number, safeDirection: "up" | "down") => number;
}

const LEVERS: Record<SolveLever, LeverConfig> = {
  savings: {
    higherIsBetter: true,
    lo: () => 0,
    hi: (p) => Math.max(p.annualSavings, p.annualLivingExpense, p.currentBalance, 1) * 50,
    apply: (p, v) => ({ ...p, annualSavings: v }),
    round: roundMoney,
  },
  returnPre: {
    higherIsBetter: true,
    lo: () => -0.05,
    hi: () => 0.25,
    apply: (p, v) => ({ ...p, returnRatePre: v }),
    round: roundRate,
  },
  returnPost: {
    higherIsBetter: true,
    lo: () => -0.05,
    hi: () => 0.25,
    apply: (p, v) => ({ ...p, returnRatePost: v }),
    round: roundRate,
  },
  retirementAge: {
    higherIsBetter: true,
    lo: (p) => p.currentAge + 1,
    hi: (p) => p.lifeExpectancy - 1,
    apply: (p, v) => ({ ...p, retirementAge: Math.round(v) }),
    round: (v) => Math.ceil(v),
  },
  livingExpense: {
    higherIsBetter: false,
    lo: () => 0,
    hi: (p) => Math.max(p.annualLivingExpense, 1) * 3,
    apply: (p, v) => ({ ...p, annualLivingExpense: v }),
    round: roundMoney,
  },
  income: {
    higherIsBetter: true,
    lo: () => 0,
    hi: (p) => Math.max(p.incomeStreams[0]?.amountPerYear ?? 0, 1) * 20,
    apply: (p, v) => {
      const streams = [...p.incomeStreams];
      if (streams.length > 0) streams[0] = { ...streams[0], amountPerYear: v };
      return { ...p, incomeStreams: streams };
    },
    round: roundMoney,
  },
};

function bisect(
  evaluate: (value: number) => boolean,
  lo: number,
  hi: number,
  higherIsBetter: boolean
): number | null {
  const goodEnd = higherIsBetter ? hi : lo;
  const badEnd = higherIsBetter ? lo : hi;

  if (!evaluate(goodEnd)) return null;
  if (evaluate(badEnd)) return badEnd;

  let good = goodEnd;
  let bad = badEnd;
  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const mid = (good + bad) / 2;
    if (evaluate(mid)) {
      good = mid;
    } else {
      bad = mid;
    }
  }
  return good;
}

function solveGeneric(
  plan: RetirementPlan,
  lever: SolveLever,
  passCheck: (result: ProjectionResult) => boolean
): number | null {
  const config = LEVERS[lever];
  const lo = config.lo(plan);
  const hi = config.hi(plan);

  const evaluate = (value: number) => passCheck(project(config.apply(plan, value)));

  const raw = bisect(evaluate, lo, hi, config.higherIsBetter);
  if (raw == null) return null;

  const safeDirection: "up" | "down" = config.higherIsBetter ? "up" : "down";
  let rounded = config.round(raw, safeDirection);

  let guard = 0;
  while (!evaluate(rounded) && guard < 1000) {
    rounded = config.higherIsBetter
      ? config.round(rounded + (lever === "retirementAge" ? 1 : lever === "returnPre" || lever === "returnPost" ? RATE_STEP : MONEY_STEP), "up")
      : config.round(rounded - (lever === "returnPre" || lever === "returnPost" ? RATE_STEP : MONEY_STEP), "down");
    guard++;
  }

  return rounded;
}

export function solveFor(plan: RetirementPlan, lever: SolveLever): number | null {
  return solveGeneric(plan, lever, (result) => result.passes);
}

export function solveForBareSurvival(plan: RetirementPlan, lever: SolveLever): number | null {
  return solveGeneric(plan, lever, (result) => {
    const last = result.rows[result.rows.length - 1];
    return last.age === plan.lifeExpectancy && last.endNominal >= 0;
  });
}

export function stressOnePointLower(plan: RetirementPlan): number | null {
  const stressed: RetirementPlan = {
    ...plan,
    returnRatePre: plan.returnRatePre - 0.01,
    returnRatePost: plan.returnRatePost - 0.01,
  };
  return project(stressed).depletionAge;
}
