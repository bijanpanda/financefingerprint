import { Question, PersonaDefinition } from "@/types/profile";
import { Currency } from "@/types";
import { formatCurrency } from "./currency";

export const QUESTION_BANK: Question[] = [
  // === LOSS TOLERANCE (8 questions) ===
  {
    id: "LT001",
    dimension: "loss_tolerance",
    format: "single_choice",
    text: "Your mutual fund portfolio drops 25% in 3 months due to market correction. What do you do?",
    options: [
      { id: "a", text: "Sell everything and move to Fixed Deposits immediately", score: 2 },
      { id: "b", text: "Move half to safer instruments, wait with the rest", score: 8 },
      { id: "c", text: "Do nothing — markets always recover eventually", score: 16 },
      { id: "d", text: "Invest more — this is a buying opportunity!", score: 23 },
    ],
    weight: 1.0,
  },
  {
    id: "LT002",
    dimension: "loss_tolerance",
    format: "scale",
    text: "On a scale of 1-10, how much does a sudden 20% drop in your investments affect your sleep?",
    scaleMin: 1,
    scaleMax: 10,
    scaleLabels: { min: "Sleepless for weeks", max: "Sleep perfectly fine" },
    weight: 1.0,
  },
  {
    id: "LT003",
    dimension: "loss_tolerance",
    format: "single_choice",
    text: "You invested ₹5 lakhs. After 1 year it's worth ₹3.5 lakhs. Your reaction?",
    options: [
      { id: "a", text: "I should never have invested — lesson learned", score: 2 },
      { id: "b", text: "Disappointed but I'll wait 1 more year", score: 8 },
      { id: "c", text: "Part of the game — I'm in it for the long run", score: 16 },
      { id: "d", text: "I'm averaging down — adding more at this price", score: 23 },
    ],
    weight: 1.0,
  },
  {
    id: "LT004",
    dimension: "loss_tolerance",
    format: "single_choice",
    text: "What is the maximum loss percentage you can tolerate in any single year without panic-selling?",
    options: [
      { id: "a", text: "Less than 5% — capital protection is everything", score: 3 },
      { id: "b", text: "Up to 15% — within reason", score: 10 },
      { id: "c", text: "Up to 30% — if the fundamentals are strong", score: 18 },
      { id: "d", text: "No limit — I believe in my thesis", score: 24 },
    ],
    weight: 1.0,
  },
  {
    id: "LT005",
    dimension: "loss_tolerance",
    format: "single_choice",
    text: "After a major market crash, would you stop investing entirely?",
    options: [
      { id: "a", text: "Yes — I'd move everything to bank FDs", score: 2 },
      { id: "b", text: "I'd pause new investments for 6+ months", score: 8 },
      { id: "c", text: "I'd continue my SIPs but not invest extra", score: 16 },
      { id: "d", text: "I'd increase my investment — crashes are opportunities", score: 23 },
    ],
    weight: 1.0,
  },
  {
    id: "LT006",
    dimension: "loss_tolerance",
    format: "single_choice",
    text: "Your neighbour sold their investments at a loss and advised you to do the same. What do you do?",
    options: [
      { id: "a", text: "Follow their advice — they must know something", score: 2 },
      { id: "b", text: "Get worried and consider selling partially", score: 8 },
      { id: "c", text: "Ignore them — my investment thesis is different", score: 17 },
      { id: "d", text: "Do the opposite — if everyone is selling, I'm buying", score: 24 },
    ],
    weight: 1.0,
  },
  {
    id: "LT007",
    dimension: "loss_tolerance",
    format: "single_choice",
    text: "How often do you check your investment portfolio value?",
    options: [
      { id: "a", text: "Multiple times a day — I need to know", score: 5 },
      { id: "b", text: "Weekly — I like to stay updated", score: 10 },
      { id: "c", text: "Monthly — during my financial review", score: 18 },
      { id: "d", text: "Rarely — maybe once a quarter or less", score: 22 },
    ],
    weight: 1.0,
  },
  {
    id: "LT008",
    dimension: "loss_tolerance",
    format: "single_choice",
    text: "You have a choice: guaranteed 6% return, or a 40% chance of 15% return (with possibility of -5%). Which do you choose?",
    options: [
      { id: "a", text: "Guaranteed 6% — no question", score: 3 },
      { id: "b", text: "Lean towards guaranteed, but tempted by 15%", score: 10 },
      { id: "c", text: "I'd take the 40% chance — expected value is higher", score: 18 },
      { id: "d", text: "Definitely the 15% chance — I can handle -5%", score: 24 },
    ],
    weight: 1.0,
  },

  // === TIME HORIZON (7 questions) ===
  {
    id: "TH001",
    dimension: "time_horizon",
    format: "single_choice",
    text: "When do you expect to need the primary chunk of money you are investing today?",
    options: [
      { id: "a", text: "Within 1-2 years", score: 3 },
      { id: "b", text: "3-5 years", score: 10 },
      { id: "c", text: "6-10 years", score: 18 },
      { id: "d", text: "10+ years / retirement corpus", score: 24 },
    ],
    weight: 1.0,
  },
  {
    id: "TH002",
    dimension: "time_horizon",
    format: "single_choice",
    text: "Your primary financial goal right now is:",
    options: [
      { id: "a", text: "Emergency / near-term need coverage", score: 3 },
      { id: "b", text: "Saving for a specific goal in 3-5 years (car, education, travel)", score: 10 },
      { id: "c", text: "Building long-term wealth over a decade", score: 18 },
      { id: "d", text: "Creating generational wealth / passive income", score: 24 },
    ],
    weight: 1.0,
  },
  {
    id: "TH003",
    dimension: "time_horizon",
    format: "single_choice",
    text: "How many years until your most important financial milestone (home purchase, child's education, retirement)?",
    options: [
      { id: "a", text: "Less than 2 years", score: 3 },
      { id: "b", text: "3-5 years", score: 10 },
      { id: "c", text: "6-15 years", score: 18 },
      { id: "d", text: "More than 15 years", score: 24 },
    ],
    weight: 1.0,
  },
  {
    id: "TH004",
    dimension: "time_horizon",
    format: "single_choice",
    text: "Would a 3-year lock-in mutual fund concern you significantly?",
    options: [
      { id: "a", text: "Yes — I need access to my money at all times", score: 3 },
      { id: "b", text: "Somewhat — I prefer flexibility but could manage", score: 10 },
      { id: "c", text: "Not really — 3 years is reasonable for good returns", score: 18 },
      { id: "d", text: "Not at all — I'd lock in for 5+ years if returns are better", score: 24 },
    ],
    weight: 1.0,
  },
  {
    id: "TH005",
    dimension: "time_horizon",
    format: "single_choice",
    text: "If your financial plan changes mid-way, do you exit investments early at a loss?",
    options: [
      { id: "a", text: "Yes — plans change, I need the money", score: 3 },
      { id: "b", text: "Only if the loss is small (<5%)", score: 10 },
      { id: "c", text: "I'd try to adjust my plan to avoid exiting", score: 18 },
      { id: "d", text: "Never — I have separate emergency funds for plan changes", score: 24 },
    ],
    weight: 1.0,
  },
  {
    id: "TH006",
    dimension: "time_horizon",
    format: "single_choice",
    text: "At what age do you plan to stop working full-time?",
    options: [
      { id: "a", text: "As soon as possible — within 5 years", score: 5 },
      { id: "b", text: "By age 50-55", score: 12 },
      { id: "c", text: "By age 58-62 (standard retirement)", score: 18 },
      { id: "d", text: "I plan to work as long as I enjoy it — age isn't a factor", score: 23 },
    ],
    weight: 1.0,
  },
  {
    id: "TH007",
    dimension: "time_horizon",
    format: "scale",
    text: "How important is monthly liquidity (being able to withdraw anytime) from your investments?",
    scaleMin: 1,
    scaleMax: 10,
    scaleLabels: { min: "Must have instant access", max: "Happy to lock in for years" },
    weight: 1.0,
  },

  // === KNOWLEDGE & CONFIDENCE (8 questions) ===
  {
    id: "KC001",
    dimension: "knowledge_confidence",
    format: "single_choice",
    text: "How would you describe your understanding of equity markets?",
    options: [
      { id: "a", text: "I avoid them — too complex and risky", score: 2 },
      { id: "b", text: "I know the basics — index funds, blue chips", score: 8 },
      { id: "c", text: "I actively research stocks and sectors", score: 17 },
      { id: "d", text: "I track macro trends, derivatives, global cues", score: 23 },
    ],
    weight: 1.0,
  },
  {
    id: "KC002",
    dimension: "knowledge_confidence",
    format: "scale",
    text: "How confident are you in making your own investment decisions without an advisor?",
    scaleMin: 1,
    scaleMax: 10,
    scaleLabels: { min: "Need full guidance", max: "Fully self-directed" },
    weight: 1.0,
  },
  {
    id: "KC003",
    dimension: "knowledge_confidence",
    format: "single_choice",
    text: "Have you ever invested directly in individual stocks (not mutual funds)?",
    options: [
      { id: "a", text: "No, and I don't plan to", score: 2 },
      { id: "b", text: "No, but I'm considering it", score: 8 },
      { id: "c", text: "Yes, in a few well-known companies", score: 16 },
      { id: "d", text: "Yes, I actively manage a stock portfolio", score: 24 },
    ],
    weight: 1.0,
  },
  {
    id: "KC004",
    dimension: "knowledge_confidence",
    format: "single_choice",
    text: "Do you know what P/E ratio and NAV mean?",
    options: [
      { id: "a", text: "No idea what these terms mean", score: 2 },
      { id: "b", text: "I've heard of them but can't explain them", score: 8 },
      { id: "c", text: "I understand the basics and check them occasionally", score: 17 },
      { id: "d", text: "I use them regularly to evaluate investments", score: 24 },
    ],
    weight: 1.0,
  },
  {
    id: "KC005",
    dimension: "knowledge_confidence",
    format: "single_choice",
    text: "Have you researched a mutual fund scheme before buying it?",
    options: [
      { id: "a", text: "No — I invest based on recommendations from others", score: 3 },
      { id: "b", text: "I check the star rating and past returns", score: 10 },
      { id: "c", text: "I compare expense ratios, fund managers, and portfolios", score: 17 },
      { id: "d", text: "I analyse AUM trends, benchmark tracking error, and sector allocation", score: 24 },
    ],
    weight: 1.0,
  },
  {
    id: "KC006",
    dimension: "knowledge_confidence",
    format: "single_choice",
    text: "Which of these financial instruments have you personally invested in?",
    options: [
      { id: "a", text: "Only savings accounts and FDs", score: 3 },
      { id: "b", text: "FDs + PPF/EPF + maybe one mutual fund", score: 10 },
      { id: "c", text: "Mutual funds + stocks + some gold/real estate", score: 17 },
      { id: "d", text: "Stocks, MFs, derivatives, crypto, international funds", score: 24 },
    ],
    weight: 1.0,
  },
  {
    id: "KC007",
    dimension: "knowledge_confidence",
    format: "single_choice",
    text: "How often do you read financial news or market commentary?",
    options: [
      { id: "a", text: "Never — it's too confusing", score: 2 },
      { id: "b", text: "Occasionally — when something big happens", score: 8 },
      { id: "c", text: "Weekly — I follow a few financial channels/blogs", score: 17 },
      { id: "d", text: "Daily — I track markets, policy changes, and global events", score: 24 },
    ],
    weight: 1.0,
  },
  {
    id: "KC008",
    dimension: "knowledge_confidence",
    format: "single_choice",
    text: "Do you track your portfolio performance against a benchmark index (like Nifty 50)?",
    options: [
      { id: "a", text: "I don't know what a benchmark index is", score: 2 },
      { id: "b", text: "I know what it is but don't compare", score: 8 },
      { id: "c", text: "I check occasionally to see if I'm beating the index", score: 17 },
      { id: "d", text: "Yes — I regularly benchmark and rebalance accordingly", score: 24 },
    ],
    weight: 1.0,
  },

  // === GOAL ORIENTATION (7 questions) ===
  {
    id: "GO001",
    dimension: "goal_orientation",
    format: "ranking",
    text: "Rank these financial goals in order of your current priority (1 = most important):",
    rankingItems: [
      "Capital Protection — don't lose what I have",
      "Regular Income — steady cash flow every month",
      "High Growth — maximize returns over time",
      "Tax Optimization — legally minimize my tax outgo",
    ],
    weight: 1.0,
  },
  {
    id: "GO002",
    dimension: "goal_orientation",
    format: "single_choice",
    text: "Which statement best describes your financial success vision?",
    options: [
      { id: "a", text: "Financial security — no debt, stable income, peaceful retirement", score: 5 },
      { id: "b", text: "Financial freedom — enough passive income to quit working", score: 12 },
      { id: "c", text: "Financial growth — building significant wealth over time", score: 19 },
      { id: "d", text: "Financial dominance — top percentile wealth, legacy creation", score: 24 },
    ],
    weight: 1.0,
  },
  {
    id: "GO003",
    dimension: "goal_orientation",
    format: "single_choice",
    text: "How do you feel about paying tax on investment gains (capital gains tax)?",
    options: [
      { id: "a", text: "I avoid investments that attract tax — prefer tax-free options", score: 4 },
      { id: "b", text: "I consider tax implications but it's not the deciding factor", score: 10 },
      { id: "c", text: "I optimise for post-tax returns — willing to pay tax for higher gains", score: 18 },
      { id: "d", text: "Tax is just a cost of doing well — I focus on absolute returns", score: 24 },
    ],
    weight: 1.0,
  },
  {
    id: "GO004",
    dimension: "goal_orientation",
    format: "single_choice",
    text: "Would you sacrifice liquidity for higher long-term returns?",
    options: [
      { id: "a", text: "No — I need all my money accessible", score: 3 },
      { id: "b", text: "Only a small portion (up to 20%)", score: 10 },
      { id: "c", text: "Yes — up to 50% can be locked for better returns", score: 18 },
      { id: "d", text: "Absolutely — I'd lock in 70%+ for significantly higher returns", score: 24 },
    ],
    weight: 1.0,
  },
  {
    id: "GO005",
    dimension: "goal_orientation",
    format: "single_choice",
    text: "How important is leaving wealth for your children or next generation?",
    options: [
      { id: "a", text: "Not a priority — I plan to spend what I earn", score: 5 },
      { id: "b", text: "Somewhat important — I'll leave what's left naturally", score: 10 },
      { id: "c", text: "Important — I actively plan for inheritance", score: 18 },
      { id: "d", text: "Very important — generational wealth is a core goal", score: 24 },
    ],
    weight: 1.0,
  },
  {
    id: "GO006",
    dimension: "goal_orientation",
    format: "single_choice",
    text: "₹50 lakhs guaranteed vs ₹1 crore at 40% probability. Which do you choose?",
    options: [
      { id: "a", text: "₹50 lakhs guaranteed — absolutely", score: 3 },
      { id: "b", text: "Probably the guaranteed amount, but I'd think about it", score: 10 },
      { id: "c", text: "I'd seriously consider the ₹1 crore — the expected value is higher", score: 18 },
      { id: "d", text: "₹1 crore chance — I'd take the shot", score: 24 },
    ],
    weight: 1.0,
  },
  {
    id: "GO007",
    dimension: "goal_orientation",
    format: "single_choice",
    text: "What motivates you most about building wealth?",
    options: [
      { id: "a", text: "Security — knowing I'm protected against life's uncertainties", score: 5 },
      { id: "b", text: "Freedom — having choices about how I spend my time", score: 12 },
      { id: "c", text: "Growth — seeing my wealth compound and increase over time", score: 19 },
      { id: "d", text: "Legacy — creating something lasting that outlives me", score: 24 },
    ],
    weight: 1.0,
  },
];

const INVESTMENT_SCENARIO_AMOUNTS: Record<Currency, { invested: number; nowWorth: number; guaranteed: number; gamble: number }> = {
  INR: { invested: 500000, nowWorth: 350000, guaranteed: 5000000, gamble: 10000000 },
  USD: { invested: 10000, nowWorth: 7000, guaranteed: 100000, gamble: 200000 },
  EUR: { invested: 10000, nowWorth: 7000, guaranteed: 100000, gamble: 200000 },
  GBP: { invested: 8000, nowWorth: 5600, guaranteed: 80000, gamble: 160000 },
  AUD: { invested: 15000, nowWorth: 10500, guaranteed: 150000, gamble: 300000 },
  CAD: { invested: 15000, nowWorth: 10500, guaranteed: 150000, gamble: 300000 },
  SGD: { invested: 15000, nowWorth: 10500, guaranteed: 150000, gamble: 300000 },
  AED: { invested: 40000, nowWorth: 28000, guaranteed: 400000, gamble: 800000 },
};

// Returns the question bank with currency-specific scenario amounts substituted into the
// handful of questions that quote a concrete sum of money (LT003, GO006).
export function getQuestionBank(currency: Currency): Question[] {
  const amt = INVESTMENT_SCENARIO_AMOUNTS[currency];
  return QUESTION_BANK.map((q) => {
    if (q.id === "LT003") {
      return {
        ...q,
        text: `You invested ${formatCurrency(amt.invested, currency)}. After 1 year it's worth ${formatCurrency(amt.nowWorth, currency)}. Your reaction?`,
      };
    }
    if (q.id === "GO006") {
      return {
        ...q,
        text: `${formatCurrency(amt.guaranteed, currency)} guaranteed vs ${formatCurrency(amt.gamble, currency)} at 40% probability. Which do you choose?`,
        options: q.options?.map((opt) => {
          if (opt.id === "a") return { ...opt, text: `${formatCurrency(amt.guaranteed, currency)} guaranteed — absolutely` };
          if (opt.id === "c") return { ...opt, text: `I'd seriously consider the ${formatCurrency(amt.gamble, currency)} — the expected value is higher` };
          if (opt.id === "d") return { ...opt, text: `${formatCurrency(amt.gamble, currency)} chance — I'd take the shot` };
          return opt;
        }),
      };
    }
    return q;
  });
}

export const DIMENSION_WEIGHTS: Record<string, number> = {
  loss_tolerance: 0.35,
  time_horizon: 0.25,
  knowledge_confidence: 0.20,
  goal_orientation: 0.20,
};

export const PERSONA_DEFINITIONS: Record<string, PersonaDefinition> = {
  guardian: {
    name: "The Guardian",
    emoji: "🛡️",
    tagline: "Protect first. Grow steadily.",
    description:
      "You value certainty and sleep well knowing your money is safe. You're the foundation builder — steady, disciplined, and wise.",
    strengths: [
      "Excellent at capital preservation",
      "Low stress investor",
      "Great at emergency planning",
    ],
    blindSpots: [
      "May miss high-growth opportunities",
      "Inflation can erode real returns over time",
    ],
    color: "#2196F3",
    suggestedAllocation: { equity: 10, debt: 70, hybrid: 15, alternative: 0, liquid: 5 },
  },
  balancer: {
    name: "The Balancer",
    emoji: "⚖️",
    tagline: "Growth with a safety net.",
    description:
      "You seek the best of both worlds — meaningful growth without losing sleep. You're pragmatic, strategic, and measured.",
    strengths: [
      "Diversified approach",
      "Good risk-adjusted returns",
      "Adapts well to market changes",
    ],
    blindSpots: [
      "Can be indecisive during market extremes",
      "May underperform in strong bull runs",
    ],
    color: "#4CAF50",
    suggestedAllocation: { equity: 50, debt: 35, hybrid: 10, alternative: 0, liquid: 5 },
  },
  climber: {
    name: "The Climber",
    emoji: "🧗",
    tagline: "Eyes on the summit. Always climbing.",
    description:
      "You're growth-focused and willing to ride volatility for superior long-term returns. Patient, confident, and ambitious.",
    strengths: [
      "Strong long-term wealth creation",
      "Comfortable with market cycles",
      "Research-driven decisions",
    ],
    blindSpots: [
      "Must maintain liquidity buffer",
      "Short-term volatility can test conviction",
    ],
    color: "#FF9800",
    suggestedAllocation: { equity: 70, debt: 15, hybrid: 5, alternative: 8, liquid: 2 },
  },
  maverick: {
    name: "The Maverick",
    emoji: "🚀",
    tagline: "High conviction. High stakes. High reward.",
    description:
      "You thrive on asymmetric opportunities and aren't afraid to go against the grain. Bold, informed, and high-energy.",
    strengths: [
      "Alpha-seeking mindset",
      "Early mover in emerging opportunities",
      "High return potential",
    ],
    blindSpots: [
      "Significant drawdown risk",
      "Requires active portfolio management",
      "Emotional discipline is critical",
    ],
    color: "#9C27B0",
    suggestedAllocation: { equity: 60, debt: 5, hybrid: 5, alternative: 25, liquid: 5 },
  },
};

export const EMPLOYMENT_SUBTYPES: Record<string, string[]> = {
  salaried: ["Government", "Private", "PSU", "MNC"],
  self_employed: ["Freelancer", "Consultant", "Gig Worker"],
  business_owner: ["SME", "Startup", "Mid-market", "Enterprise"],
  retired: ["With Pension", "Without Pension"],
  student: ["With Part-time Income", "No Income"],
  homemaker: ["With Spouse Income", "Single Income"],
};

function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function selectQuestionsForSession(pool: Question[] = QUESTION_BANK): Question[] {
  const byDimension: Record<string, Question[]> = {};
  for (const q of pool) {
    if (!byDimension[q.dimension]) byDimension[q.dimension] = [];
    byDimension[q.dimension].push(q);
  }

  const selected: Question[] = [];
  const minimums: Record<string, number> = {
    loss_tolerance: 3,
    time_horizon: 3,
    knowledge_confidence: 3,
    goal_orientation: 3,
  };

  for (const [dimension, questions] of Object.entries(byDimension)) {
    const min = minimums[dimension] || 3;
    const shuffled = shuffle(questions);
    selected.push(...shuffled.slice(0, min));
  }

  const remaining = pool.filter((q) => !selected.includes(q));
  const extraCount = Math.floor(Math.random() * 4);
  selected.push(...shuffle(remaining).slice(0, extraCount));

  return shuffle(selected);
}

export function getLifeStageFromAge(age: number): string {
  if (age <= 25) return "early_career";
  if (age <= 35) return "wealth_building";
  if (age <= 45) return "wealth_accumulation";
  if (age <= 55) return "wealth_preservation";
  if (age <= 60) return "pre_retirement";
  return "retirement";
}

export function getLifeStageLabel(stage: string): string {
  const labels: Record<string, string> = {
    early_career: "Early Career — Foundation Building",
    wealth_building: "Wealth Building — Income Growth Phase",
    wealth_accumulation: "Wealth Accumulation — Peak Earning Phase",
    wealth_preservation: "Wealth Preservation — Protect & Optimise",
    pre_retirement: "Pre-Retirement — Consolidation Phase",
    retirement: "Retirement — Income Distribution Phase",
  };
  return labels[stage] || stage;
}

export function getCurrentFinancialYear(): string {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  if (month >= 3) {
    return `${year}-${(year + 1).toString().slice(2)}`;
  }
  return `${year - 1}-${year.toString().slice(2)}`;
}
