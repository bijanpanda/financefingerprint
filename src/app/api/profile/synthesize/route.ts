import { NextRequest, NextResponse } from "next/server";
import { synthesizeProfile } from "@/lib/server/llmSynthesis";
import { IdentityProfile, FinancialProfile, InvestorPersona, CustomerProfile } from "@/types/profile";
import { Currency } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      identity: IdentityProfile;
      financial: FinancialProfile;
      persona: InvestorPersona;
      previousProfile?: CustomerProfile | null;
      currency?: Currency;
    };

    const { identity, financial, persona, previousProfile, currency } = body;

    if (!identity || !financial || !persona) {
      return NextResponse.json(
        { error: "identity, financial, and persona are required" },
        { status: 400 }
      );
    }

    const { synthesis, source } = await synthesizeProfile(identity, financial, persona, previousProfile, currency || "INR");

    return NextResponse.json({ synthesis, source });
  } catch (err) {
    console.error("profile/synthesize error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
