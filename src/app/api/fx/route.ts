import { NextRequest, NextResponse } from "next/server";
import { Currency } from "@/types";

export const revalidate = 86400; // cached for a day

interface OpenErApiResponse {
  result: string;
  rates: Record<string, number>;
}

// §3.3: fetched daily against base currency, cached, as-of date always shown.
// A free, keyless, no-new-dependency source — open.er-api.com wraps
// exchangerate-api.com's free tier and covers all eight currencies this app
// supports, including AED (not all providers carry it).
const FX_PROVIDER_URL = "https://open.er-api.com/v6/latest";

export async function GET(req: NextRequest) {
  const base = (req.nextUrl.searchParams.get("base") || "USD") as Currency;
  const asOf = new Date().toISOString().slice(0, 10);

  try {
    const res = await fetch(`${FX_PROVIDER_URL}/${base}`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) throw new Error(`fx provider returned ${res.status}`);

    const data = (await res.json()) as OpenErApiResponse;
    if (data.result !== "success") throw new Error("fx provider reported failure");

    // The provider returns "units of X per 1 base". toBase() needs the
    // inverse — "units of base per 1 X" — so an account balance in X
    // multiplies directly into base currency.
    const rates: Record<string, number> = {};
    for (const [code, rate] of Object.entries(data.rates)) {
      if (rate > 0) rates[code] = 1 / rate;
    }

    return NextResponse.json({ base, rates, asOf, source: "live" });
  } catch {
    // Never block the projection on a network call — the caller keeps
    // whatever rate it already has stored and shows that rate's own date.
    return NextResponse.json({ base, rates: null, asOf, source: "unavailable" });
  }
}
