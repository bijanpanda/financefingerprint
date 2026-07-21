import { SpendingQuestion, SpendingArchetypeDefinition } from "@/types/profile";
import { Currency } from "@/types";
import { formatCurrency } from "./currency";

export const SPENDING_QUESTION_BANK: SpendingQuestion[] = [
  // === IMPULSE CONTROL (6 questions) ===
  {
    id: "SP_IC001",
    dimension: "impulse_control",
    format: "single_choice",
    text: "You see a great deal on something you didn't plan to buy. What usually happens?",
    options: [
      { id: "a", text: "I buy it immediately — deals don't wait!", score: 2 },
      { id: "b", text: "I add it to cart and usually check out within the hour", score: 8 },
      { id: "c", text: "I sleep on it — if I still want it tomorrow I'll buy", score: 18 },
      { id: "d", text: "I research if I actually need it before considering", score: 24 },
    ],
    weight: 1.0,
  },
  {
    id: "SP_IC002",
    dimension: "impulse_control",
    format: "single_choice",
    text: "How often do you make unplanned purchases you later regret?",
    options: [
      { id: "a", text: "Very often — buyer's remorse is my middle name", score: 2 },
      { id: "b", text: "Sometimes — maybe once or twice a month", score: 10 },
      { id: "c", text: "Rarely — maybe a few times a year", score: 18 },
      { id: "d", text: "Almost never — I think before I spend", score: 24 },
    ],
    weight: 1.0,
  },
  {
    id: "SP_IC003",
    dimension: "impulse_control",
    format: "single_choice",
    text: "A friend messages you: 'We're all going to Goa this weekend, book now!' You:",
    options: [
      { id: "a", text: "Book immediately — FOMO is real", score: 2 },
      { id: "b", text: "Book after a quick check of my balance", score: 10 },
      { id: "c", text: "Ask if next month works — need to plan for it", score: 19 },
      { id: "d", text: "Calculate full trip cost before committing", score: 24 },
    ],
    weight: 1.0,
  },
  {
    id: "SP_IC004",
    dimension: "impulse_control",
    format: "scale",
    text: "When you see a 'Limited Time Offer', how hard is it to resist buying even if unplanned?",
    scaleMin: 1,
    scaleMax: 10,
    scaleLabels: { min: "Impossible to resist", max: "Completely unbothered" },
    weight: 1.0,
  },
  {
    id: "SP_IC005",
    dimension: "impulse_control",
    format: "single_choice",
    text: "It's day 20 of the month. You've already spent your entertainment budget. A new movie you've been waiting for releases. You:",
    options: [
      { id: "a", text: "Go anyway — life is short", score: 2 },
      { id: "b", text: "Go but feel a bit guilty about it", score: 10 },
      { id: "c", text: "Wait for OTT — budget is budget", score: 19 },
      { id: "d", text: "I track my budget so closely this wouldn't surprise me", score: 24 },
    ],
    weight: 1.0,
  },
  {
    id: "SP_IC006",
    dimension: "impulse_control",
    format: "single_choice",
    text: "Which describes how you use shopping apps?",
    options: [
      { id: "a", text: "I browse daily and buy often without needing anything specific", score: 2 },
      { id: "b", text: "I browse casually and sometimes buy on impulse", score: 10 },
      { id: "c", text: "I open apps when I need something specific", score: 19 },
      { id: "d", text: "I have notifications off and only open for planned purchases", score: 24 },
    ],
    weight: 1.0,
  },

  // === PLANNING BEHAVIOUR (5 questions) ===
  {
    id: "SP_PB001",
    dimension: "planning_behaviour",
    format: "single_choice",
    text: "How do you manage your monthly spending?",
    options: [
      { id: "a", text: "I spend as I go — I'll figure it out at month end", score: 2 },
      { id: "b", text: "I loosely track big spends in my head", score: 10 },
      { id: "c", text: "I have a rough budget I try to stick to", score: 18 },
      { id: "d", text: "I maintain a detailed budget with category limits", score: 24 },
    ],
    weight: 1.0,
  },
  {
    id: "SP_PB002",
    dimension: "planning_behaviour",
    format: "single_choice",
    text: "Before a major purchase (phone, appliance, travel), you typically:",
    options: [
      { id: "a", text: "Just buy when I feel like it — I'll manage the finances", score: 2 },
      { id: "b", text: "Check if I have enough in account right now", score: 9 },
      { id: "c", text: "Plan 1–2 months ahead and save up for it", score: 18 },
      { id: "d", text: "Create a sinking fund months in advance with a target date", score: 24 },
    ],
    weight: 1.0,
  },
  {
    id: "SP_PB003",
    dimension: "planning_behaviour",
    format: "single_choice",
    text: "Do you know approximately how much you spent last month across all categories?",
    options: [
      { id: "a", text: "No idea — I never check", score: 2 },
      { id: "b", text: "Vaguely — I know it was 'a lot' or 'okay'", score: 9 },
      { id: "c", text: "Roughly yes — within ₹5,000 probably", score: 18 },
      { id: "d", text: "Yes, almost exactly — I track everything", score: 24 },
    ],
    weight: 1.0,
  },
  {
    id: "SP_PB004",
    dimension: "planning_behaviour",
    format: "single_choice",
    text: "Diwali / a big festival is 3 months away. Your gifting and celebration spending:",
    options: [
      { id: "a", text: "Deal with it when it comes — swipe card or borrow", score: 2 },
      { id: "b", text: "Start thinking about it a month before", score: 9 },
      { id: "c", text: "Set aside a small amount starting now", score: 18 },
      { id: "d", text: "I have a dedicated annual celebration fund I contribute to monthly", score: 24 },
    ],
    weight: 1.0,
  },
  {
    id: "SP_PB005",
    dimension: "planning_behaviour",
    format: "scale",
    text: "How far in advance do you plan large expenses (₹10,000+)?",
    scaleMin: 1,
    scaleMax: 10,
    scaleLabels: { min: "I don't plan — it just happens", max: "Months ahead with a detailed plan" },
    weight: 1.0,
  },

  // === SAVINGS CONSISTENCY (5 questions) ===
  {
    id: "SP_SC001",
    dimension: "savings_consistency",
    format: "single_choice",
    text: "What does your savings habit look like most months?",
    options: [
      { id: "a", text: "I save what's left — usually nothing or very little", score: 2 },
      { id: "b", text: "Some months I save, some months I don't — depends on expenses", score: 9 },
      { id: "c", text: "I try to save a fixed amount but sometimes skip", score: 18 },
      { id: "d", text: "I auto-debit savings on salary day before I can spend it", score: 24 },
    ],
    weight: 1.0,
  },
  {
    id: "SP_SC002",
    dimension: "savings_consistency",
    format: "single_choice",
    text: "Which of these best describes your relationship with saving?",
    options: [
      { id: "a", text: "Saving feels like punishment — I'd rather enjoy life now", score: 2 },
      { id: "b", text: "I know I should save more but struggle to stay consistent", score: 9 },
      { id: "c", text: "Saving is important to me — I do it most of the time", score: 18 },
      { id: "d", text: "Saving is non-negotiable — it's the first thing I do each month", score: 24 },
    ],
    weight: 1.0,
  },
  {
    id: "SP_SC003",
    dimension: "savings_consistency",
    format: "single_choice",
    text: "If you received an unexpected bonus of ₹50,000 today, what would you do with it?",
    options: [
      { id: "a", text: "Treat myself — I deserve it!", score: 2 },
      { id: "b", text: "Split — half spend, half vaguely 'keep'", score: 9 },
      { id: "c", text: "Mostly save it, maybe a small treat", score: 18 },
      { id: "d", text: "Invest all of it according to my financial plan", score: 24 },
    ],
    weight: 1.0,
  },
  {
    id: "SP_SC004",
    dimension: "savings_consistency",
    format: "scale",
    text: "How consistent are you with saving every single month, regardless of how the month went?",
    scaleMin: 1,
    scaleMax: 10,
    scaleLabels: { min: "Very inconsistent", max: "Never miss a month" },
    weight: 1.0,
  },
  {
    id: "SP_SC005",
    dimension: "savings_consistency",
    format: "single_choice",
    text: "Your savings rate (% of income saved) over the last 6 months has been:",
    options: [
      { id: "a", text: "0–5% — barely anything left", score: 2 },
      { id: "b", text: "6–15% — some months more, some less", score: 10 },
      { id: "c", text: "16–25% — reasonably consistent", score: 19 },
      { id: "d", text: "25%+ — I prioritise savings aggressively", score: 24 },
    ],
    weight: 1.0,
  },

  // === LIFESTYLE INFLATION (5 questions) ===
  {
    id: "SP_LI001",
    dimension: "lifestyle_inflation",
    format: "single_choice",
    text: "You get a 30% salary hike. What happens to your monthly spending?",
    options: [
      { id: "a", text: "It goes up by roughly 30% — I've earned it!", score: 2 },
      { id: "b", text: "It goes up somewhat — new income opens new wants", score: 9 },
      { id: "c", text: "Slight lifestyle upgrade, but most goes to savings/investments", score: 18 },
      { id: "d", text: "Spending stays flat — the full raise goes to wealth building", score: 24 },
    ],
    weight: 1.0,
  },
  {
    id: "SP_LI002",
    dimension: "lifestyle_inflation",
    format: "single_choice",
    text: "Compared to 3 years ago, your monthly lifestyle expenses have:",
    options: [
      { id: "a", text: "Increased significantly — I've upgraded everything", score: 2 },
      { id: "b", text: "Increased somewhat — some upgrades felt necessary", score: 9 },
      { id: "c", text: "Stayed similar despite income growth", score: 18 },
      { id: "d", text: "Decreased — I've simplified and redirected to wealth", score: 24 },
    ],
    weight: 1.0,
  },
  {
    id: "SP_LI003",
    dimension: "lifestyle_inflation",
    format: "single_choice",
    text: "When a friend or colleague upgrades (car, phone, home), you typically feel:",
    options: [
      { id: "a", text: "I need to upgrade too — can't fall behind", score: 2 },
      { id: "b", text: "A little inspired — maybe I should too", score: 9 },
      { id: "c", text: "Happy for them — my timeline is different", score: 18 },
      { id: "d", text: "Completely indifferent — my goals drive my decisions", score: 24 },
    ],
    weight: 1.0,
  },
  {
    id: "SP_LI004",
    dimension: "lifestyle_inflation",
    format: "single_choice",
    text: "Subscriptions you pay for (OTT, apps, memberships, gym, etc.) — how many active ones?",
    options: [
      { id: "a", text: "More than 8 — I rarely audit them", score: 2 },
      { id: "b", text: "5–8 — some I barely use but keep anyway", score: 9 },
      { id: "c", text: "3–4 — I review these occasionally", score: 18 },
      { id: "d", text: "1–2 — I only pay for what I actively use", score: 24 },
    ],
    weight: 1.0,
  },
  {
    id: "SP_LI005",
    dimension: "lifestyle_inflation",
    format: "scale",
    text: "How strongly do social comparisons (friends' lifestyles, social media) influence what you spend on?",
    scaleMin: 1,
    scaleMax: 10,
    scaleLabels: { min: "Heavily influences my spending", max: "Has zero influence on me" },
    weight: 1.0,
  },

  // === EMOTIONAL SPENDING (5 questions) ===
  {
    id: "SP_ES001",
    dimension: "emotional_spending",
    format: "single_choice",
    text: "You've had a terrible day at work. That evening you're most likely to:",
    options: [
      { id: "a", text: "Order food, buy something online, or go out — treat yourself", score: 2 },
      { id: "b", text: "Maybe a small treat — it helps, honestly", score: 9 },
      { id: "c", text: "Call a friend or do something free to decompress", score: 18 },
      { id: "d", text: "Stick to my routine — emotions don't drive my spending", score: 24 },
    ],
    weight: 1.0,
  },
  {
    id: "SP_ES002",
    dimension: "emotional_spending",
    format: "single_choice",
    text: "You got great news (promotion, milestone, good results). Your first instinct is:",
    options: [
      { id: "a", text: "Celebrate by spending — this is the moment!", score: 2 },
      { id: "b", text: "Dinner out or a small gift to myself", score: 9 },
      { id: "c", text: "A modest celebration, nothing too extravagant", score: 18 },
      { id: "d", text: "Feel great internally — celebration doesn't need to cost money", score: 24 },
    ],
    weight: 1.0,
  },
  {
    id: "SP_ES003",
    dimension: "emotional_spending",
    format: "single_choice",
    text: "When you're feeling anxious or overwhelmed about life in general, shopping or spending:",
    options: [
      { id: "a", text: "Genuinely makes me feel better — retail therapy works", score: 2 },
      { id: "b", text: "Provides temporary relief — I know it doesn't fix anything", score: 9 },
      { id: "c", text: "I notice the urge but usually don't act on it", score: 18 },
      { id: "d", text: "Doesn't cross my mind — I deal with stress differently", score: 24 },
    ],
    weight: 1.0,
  },
  {
    id: "SP_ES004",
    dimension: "emotional_spending",
    format: "scale",
    text: "How often does your emotional state (stress, boredom, excitement, sadness) influence unplanned spending?",
    scaleMin: 1,
    scaleMax: 10,
    scaleLabels: { min: "Almost every time", max: "Almost never" },
    weight: 1.0,
  },
  {
    id: "SP_ES005",
    dimension: "emotional_spending",
    format: "single_choice",
    text: "When you're bored, which is most true?",
    options: [
      { id: "a", text: "I browse shopping apps — and usually end up buying something", score: 2 },
      { id: "b", text: "I browse apps but mostly just window shop", score: 9 },
      { id: "c", text: "I pick up a hobby, book, or free activity", score: 18 },
      { id: "d", text: "Boredom doesn't trigger any spending impulse for me", score: 24 },
    ],
    weight: 1.0,
  },
];

const SPENDING_SCENARIO_AMOUNTS: Record<Currency, { trackingMargin: number; largeExpense: number; bonus: number }> = {
  INR: { trackingMargin: 5000, largeExpense: 10000, bonus: 50000 },
  USD: { trackingMargin: 100, largeExpense: 200, bonus: 1000 },
  EUR: { trackingMargin: 100, largeExpense: 200, bonus: 1000 },
  GBP: { trackingMargin: 80, largeExpense: 150, bonus: 800 },
  AUD: { trackingMargin: 150, largeExpense: 300, bonus: 1500 },
  CAD: { trackingMargin: 150, largeExpense: 300, bonus: 1500 },
  SGD: { trackingMargin: 150, largeExpense: 300, bonus: 1500 },
  AED: { trackingMargin: 400, largeExpense: 800, bonus: 4000 },
};

// Returns the spending question bank with currency-specific scenario amounts substituted into
// the handful of questions that quote a concrete sum of money (SP_PB003, SP_PB005, SP_SC003).
export function getSpendingQuestionBank(currency: Currency): SpendingQuestion[] {
  const amt = SPENDING_SCENARIO_AMOUNTS[currency];
  return SPENDING_QUESTION_BANK.map((q) => {
    if (q.id === "SP_PB003") {
      return {
        ...q,
        options: q.options?.map((opt) =>
          opt.id === "c" ? { ...opt, text: `Roughly yes — within ${formatCurrency(amt.trackingMargin, currency)} probably` } : opt
        ),
      };
    }
    if (q.id === "SP_PB005") {
      return { ...q, text: `How far in advance do you plan large expenses (${formatCurrency(amt.largeExpense, currency)}+)?` };
    }
    if (q.id === "SP_SC003") {
      return { ...q, text: `If you received an unexpected bonus of ${formatCurrency(amt.bonus, currency)} today, what would you do with it?` };
    }
    return q;
  });
}

export const SPENDING_DIMENSION_WEIGHTS: Record<string, number> = {
  impulse_control: 0.30,
  planning_behaviour: 0.20,
  savings_consistency: 0.25,
  lifestyle_inflation: 0.15,
  emotional_spending: 0.10,
};

export const SPENDING_ARCHETYPE_DEFINITIONS: Record<string, SpendingArchetypeDefinition> = {
  impulsive_spender: {
    name: "The Impulse Buyer",
    emoji: "🛒",
    tagline: "Live now, worry later.",
    description:
      "Your spending is deeply driven by the moment — deals, emotions, and social energy all trigger your wallet. The good news: awareness is step one, and you're here.",
    strengths: ["Lives fully in the present", "Generous with others", "Open to experiences"],
    blindSpots: ["Month-end stress is real", "Savings rarely happen", "Regret cycles are common"],
    color: "#C0392B",
    proNudge:
      "Vestrofin Pro can set up automatic guardrails — cooling-off reminders, daily spend caps, and pre-committed savings so the future you is protected.",
  },
  spender: {
    name: "The Lifestyle Spender",
    emoji: "💳",
    tagline: "Work hard, spend well.",
    description:
      "You enjoy what you earn — and there's nothing wrong with that. But savings tend to be an afterthought, which means future goals get pushed back month after month.",
    strengths: ["Great quality of life", "Experiences money well", "Financially social"],
    blindSpots: ["Savings rate is low", "Future goals underfunded", "Vulnerable to income dips"],
    color: "#E67E22",
    proNudge:
      "Vestrofin Pro can automate your savings before you see the money — so you spend freely on what's left without guilt.",
  },
  moderate_spender: {
    name: "The Mindful Spender",
    emoji: "☕",
    tagline: "Enjoy today, think about tomorrow.",
    description:
      "You're in a good balance zone but inconsistency holds you back. Some months you nail it; others, lifestyle creep wins. The habits just need a little structure.",
    strengths: ["Good lifestyle balance", "Saves when focused", "Responds well to nudges"],
    blindSpots: ["Inconsistent savings", "Lifestyle creep risk", "No formal budget system"],
    color: "#F39C12",
    proNudge:
      "Vestrofin Pro identifies your overspend categories and builds a personalised budget system to close the consistency gap.",
  },
  moderate_saver: {
    name: "The Steady Planner",
    emoji: "📊",
    tagline: "Planned today. Secure tomorrow.",
    description:
      "You've found a solid rhythm — saving regularly while still enjoying life. The opportunity now is to make sure your savings are working as hard as you are.",
    strengths: ["Consistent savings habits", "Planned approach to spending", "Low financial stress"],
    blindSpots: ["May be saving in low-yield instruments", "Could optimise further", "Occasional lifestyle inflation"],
    color: "#27AE60",
    proNudge:
      "Vestrofin Pro can analyse where your savings sit and redirect them to higher-yield options matching your investor persona.",
  },
  saver: {
    name: "The Disciplined Saver",
    emoji: "🏦",
    tagline: "Future first. Always.",
    description:
      "You are financially disciplined and your future self will thank you. The only watch-out: don't save so aggressively that present joy gets sacrificed entirely.",
    strengths: ["Strong savings rate", "Financially resilient", "Well-prepared for goals"],
    blindSpots: ["May under-enjoy the present", "Can feel restrictive in relationships", "Possibly over-cautious on spending"],
    color: "#2980B9",
    proNudge:
      "Vestrofin Pro helps you find the optimal savings rate — enough to hit all your goals while building in guilt-free spending.",
  },
  extreme_saver: {
    name: "The Ultra-Frugalist",
    emoji: "🔒",
    tagline: "Every rupee has a purpose.",
    description:
      "You treat money with extraordinary discipline. Your financial security is enviable — but check that frugality isn't becoming a source of stress or holding back experiences worth having.",
    strengths: ["Maximum financial security", "Zero lifestyle risk", "High goal achievement rate"],
    blindSpots: ["Quality of life may be impacted", "Can cause friction in relationships", "Money anxiety despite wealth"],
    color: "#1A5276",
    proNudge:
      "Vestrofin Pro can validate that your savings rate is optimal — and give you permission to spend guilt-free on things that align with your values.",
  },
};

function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Selects 10-12 questions, minimum 2 per dimension, from the 26-question pool
export function selectSpendingQuestionsForSession(
  pool: SpendingQuestion[] = SPENDING_QUESTION_BANK
): SpendingQuestion[] {
  const byDimension: Record<string, SpendingQuestion[]> = {};
  for (const q of pool) {
    if (!byDimension[q.dimension]) byDimension[q.dimension] = [];
    byDimension[q.dimension].push(q);
  }

  const selected: SpendingQuestion[] = [];
  const minimums: Record<string, number> = {
    impulse_control: 2,
    planning_behaviour: 2,
    savings_consistency: 2,
    lifestyle_inflation: 2,
    emotional_spending: 2,
  };

  for (const [dimension, questions] of Object.entries(byDimension)) {
    const min = minimums[dimension] || 2;
    const shuffled = shuffle(questions);
    selected.push(...shuffled.slice(0, min));
  }

  const remaining = pool.filter((q) => !selected.includes(q));
  const extraCount = Math.floor(Math.random() * 2) + 1; // top up towards 10-12 total
  selected.push(...shuffle(remaining).slice(0, extraCount));

  return shuffle(selected);
}
