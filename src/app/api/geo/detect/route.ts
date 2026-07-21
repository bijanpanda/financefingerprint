import { NextRequest, NextResponse } from "next/server";

const CURRENCY_MAP: Record<string, { currency: string; symbol: string }> = {
  IN: { currency: "INR", symbol: "₹" },
  US: { currency: "USD", symbol: "$" },
};

export async function GET(req: NextRequest) {
  const country = req.headers.get("x-vercel-ip-country") || "US";
  const detected = CURRENCY_MAP[country] || CURRENCY_MAP["US"];
  const region: "IN" | "US" = country === "IN" || country === "US" ? country : "US";

  return NextResponse.json({
    country,
    region,
    currency: detected.currency,
    symbol: detected.symbol,
  });
}
