// server-only — do NOT import in client components
import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import {
  IdentityProfile,
  FinancialProfile,
  InvestorPersona,
  CustomerProfile,
  AISynthesis,
} from "@/types/profile";
import { Currency } from "@/types";
import { generateLocalSynthesis } from "@/utils/scoring";
import { buildCombinedPersonaTag } from "@/utils/spendingScoring";
import { formatCurrency } from "@/utils/currency";

const SYNTHESIS_SYSTEM_PROMPT = `You are a senior financial advisor and behavioral finance expert working within the Vestrofin platform.
Your role is to analyze a customer's complete profile — demographic, financial, and psychological — and produce a structured synthesis.
ALWAYS respond with valid JSON only. No prose outside the JSON structure. Do not wrap the JSON in markdown code fences.
Your tone in narratives must be:
- Warm and encouraging, never alarming
- Specific to the person's actual data
- Action-oriented, not just descriptive
- Culturally relevant to the customer's region and their local currency
NEVER say: "You are a risky investor".
ALWAYS say: "You have the profile of a growth-oriented investor..."
Flag issues empathetically. A high debt ratio is: "Your current commitments leave limited room for investment — let's build a plan to change that."
When both an investor persona and a spending archetype are provided, identify any CONTRADICTION between them (e.g. an aggressive investor persona paired with impulsive spending) and frame it as an empathetic opportunity rather than a criticism. If they are aligned, celebrate the alignment.`;

function buildSynthesisPrompt(
  identity: IdentityProfile,
  financial: FinancialProfile,
  persona: InvestorPersona,
  currency: Currency,
  previousProfile?: CustomerProfile | null
): string {
  const spending = financial.spendingPersona;

  const spendingBlock = spending
    ? `
### Spending Personality
- Archetype: ${spending.archetype}
- Archetype Score: ${spending.archetypeScore.toFixed(0)}/100
- Impulse Control: ${spending.dimensionScores.impulseControl.toFixed(0)}/100
- Planning Behaviour: ${spending.dimensionScores.planningBehaviour.toFixed(0)}/100
- Savings Consistency: ${spending.dimensionScores.savingsConsistency.toFixed(0)}/100
- Lifestyle Inflation: ${spending.dimensionScores.lifestyleInflation.toFixed(0)}/100
- Emotional Spending: ${spending.dimensionScores.emotionalSpending.toFixed(0)}/100`
    : "\n### Spending Personality — not yet assessed";

  const previousBlock = previousProfile
    ? `### Previous Profile (${previousProfile.financialYear})
- Previous Persona: ${previousProfile.persona.personaType}
- Previous Health Score: ${previousProfile.aiSynthesis.financialHealthScore}
- Compare and note any significant shifts.`
    : "### First-time profile — no previous data";

  return `Analyze this customer profile and return a JSON synthesis.

## CUSTOMER DATA

### Identity
- Age: ${identity.age} | Life Stage: ${identity.lifeStage}
- Employment: ${identity.employmentType} — ${identity.employmentSubType}
- Family: ${identity.familyStatus} | Dependents: ${identity.dependents}
- Location: ${identity.city} (${identity.residenceType})
- Education: ${identity.educationLevel}

### Financial Reality
- Currency: ${currency} — use this currency (with correctly formatted symbol) for every money figure in your response
- Monthly Gross Income: ${formatCurrency(financial.monthlyGrossIncome, currency)}
- Income Stability: ${financial.incomeStability}
- Secondary Income: ${financial.hasSecondaryIncome && financial.secondaryIncomeAmount ? formatCurrency(financial.secondaryIncomeAmount, currency) : "None"}
- Monthly EMIs: ${formatCurrency(financial.existingEMIs, currency)}
- Debt-to-Income Ratio: ${financial.debtToIncomeRatio.toFixed(1)}%
- Savings Capacity Score: ${financial.savingsCapacityScore.toFixed(1)}%
- Emergency Fund: ${financial.emergencyFundStatus}
- Current Investments: ${financial.existingInvestments.join(", ")}
- Insurance Coverage: ${financial.insuranceCoverage.join(", ")}

### Investor Persona Scores
- Loss Tolerance: ${persona.rawScores.lossTolerance.toFixed(0)}/100
- Time Horizon: ${persona.rawScores.timeHorizon.toFixed(0)}/100
- Knowledge & Confidence: ${persona.rawScores.knowledgeConfidence.toFixed(0)}/100
- Goal Orientation: ${persona.rawScores.goalOrientation.toFixed(0)}/100
- Composite Score: ${persona.compositeScore.toFixed(0)}/100
- Persona Type: ${persona.personaType.toUpperCase()}
${spendingBlock}

${previousBlock}

## REQUIRED JSON OUTPUT FORMAT
{
  "financialHealthScore": <number 0-100>,
  "lifeStageLabel": "<descriptive label e.g. 'Wealth Accumulation Phase'>",
  "narrativeSummary": "<2-3 paragraphs, warm and personalized>",
  "flags": [
    { "type": "warning|info|critical", "category": "debt|insurance|emergency_fund|investment|income", "message": "<empathetic message>" }
  ],
  "moduleRecommendations": {
    "budget": "<specific recommendation>",
    "investment": "<specific recommendation>",
    "insurance": "<specific recommendation>"
  },
  "suggestedAllocation": {
    "equity": <percent>,
    "debt": <percent>,
    "hybrid": <percent>,
    "alternative": <percent>,
    "liquid": <percent>
  },
  "peerComparison": "<one sentence about similar profiles>",
  "spendingNarrative": "<1-2 paragraphs on spending behaviour, warm and honest, not judgmental — omit if spending personality not assessed>",
  "combinedPersonaTag": "<'[Investor Name] | [Spending Name]' — omit if spending personality not assessed>",
  "spendingFlags": [
    { "type": "warning|info|critical", "category": "debt|insurance|emergency_fund|investment|income", "message": "<empathetic message>" }
  ],
  "driftSummary": "<only if previous profile exists — what changed and why it matters>"
}`;
}

function extractJson(raw: string): unknown {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : trimmed;
  return JSON.parse(candidate);
}

function isValidSynthesis(value: unknown): value is AISynthesis {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.financialHealthScore === "number" &&
    typeof v.narrativeSummary === "string" &&
    Array.isArray(v.flags) &&
    typeof v.suggestedAllocation === "object"
  );
}

async function callClaudeSynthesis(
  identity: IdentityProfile,
  financial: FinancialProfile,
  persona: InvestorPersona,
  currency: Currency,
  previousProfile?: CustomerProfile | null
): Promise<AISynthesis> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY not set");
  }

  const client = new Anthropic({ apiKey });
  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

  const response = await client.messages.create({
    model,
    max_tokens: 2000,
    system: SYNTHESIS_SYSTEM_PROMPT,
    messages: [
      { role: "user", content: buildSynthesisPrompt(identity, financial, persona, currency, previousProfile) },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("LLM response contained no text content");
  }

  const parsed = extractJson(textBlock.text);
  if (!isValidSynthesis(parsed)) {
    throw new Error("LLM response failed synthesis shape validation");
  }

  // Fall back to a deterministic combined tag if the model omitted it despite spending data being present
  if (financial.spendingPersona && !parsed.combinedPersonaTag) {
    parsed.combinedPersonaTag = buildCombinedPersonaTag(persona.personaType, financial.spendingPersona.archetype);
  }

  return parsed;
}

// Server-side only. Tries the real Claude API first; falls back to the deterministic
// local synthesis (src/utils/scoring.ts) if no API key is configured or the call fails,
// so the profiling flow always completes even without live LLM access.
export async function synthesizeProfile(
  identity: IdentityProfile,
  financial: FinancialProfile,
  persona: InvestorPersona,
  previousProfile?: CustomerProfile | null,
  currency: Currency = "INR"
): Promise<{ synthesis: AISynthesis; source: "llm" | "local_fallback" }> {
  try {
    const synthesis = await callClaudeSynthesis(identity, financial, persona, currency, previousProfile);
    return { synthesis, source: "llm" };
  } catch (err) {
    console.error("profile/synthesize: LLM call failed, using local fallback synthesis:", err);
    const synthesis = generateLocalSynthesis(identity, financial, persona);
    return { synthesis, source: "local_fallback" };
  }
}
