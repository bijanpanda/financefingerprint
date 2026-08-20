import { NextRequest, NextResponse } from "next/server";
import { GoalCategory } from "@/types/retirement";

export const revalidate = 86400; // cached for a day

export type CategoryRates = Record<Exclude<GoalCategory, "custom">, number>;

// §5.1's India table is the only rate set the design doc actually specifies,
// and the doc explicitly sanctions it as "the offline fallback" for any
// country. Per-country category inflation isn't published anywhere
// consistently (§11, open question #1) — rather than invent a multiplier
// per country unasked, every request gets this same curated table, labelled
// honestly as a fallback rather than a live per-country rate.
const FALLBACK_GENERAL_RATE = 0.06;

const FALLBACK_CATEGORY_RATES: CategoryRates = {
  child_education: 0.1,
  wedding: 0.08,
  home_down_payment: 0.07,
  vehicle_purchase: 0.05,
  medical_care: 0.09,
  travel: 0.06,
  loan_payoff: 0,
};

export async function GET(req: NextRequest) {
  const country = req.nextUrl.searchParams.get("country") || "IN";
  const asOf = new Date().toISOString().slice(0, 10);

  return NextResponse.json({
    country,
    general: FALLBACK_GENERAL_RATE,
    categories: FALLBACK_CATEGORY_RATES,
    asOf,
    source: "fallback",
  });
}
