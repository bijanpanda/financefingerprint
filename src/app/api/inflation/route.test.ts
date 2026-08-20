import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "./route";

describe("GET /api/inflation", () => {
  it("returns the general rate, seven category rates, and an as-of date for India", async () => {
    const res = await GET(new NextRequest("http://localhost/api/inflation?country=IN"));
    const body = await res.json();

    expect(body.country).toBe("IN");
    expect(body.general).toBeCloseTo(0.06, 4);
    expect(body.categories.child_education).toBeCloseTo(0.1, 4);
    expect(body.categories.loan_payoff).toBe(0);
    expect(Object.keys(body.categories)).toHaveLength(7);
    expect(body.asOf).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(body.source).toBe("fallback");
  });

  it("defaults to the India table for a country with no dedicated data (documented fallback)", async () => {
    const res = await GET(new NextRequest("http://localhost/api/inflation?country=US"));
    const body = await res.json();
    expect(body.country).toBe("US");
    expect(body.categories.child_education).toBeCloseTo(0.1, 4);
  });

  it("defaults to country=IN when no query param is given", async () => {
    const res = await GET(new NextRequest("http://localhost/api/inflation"));
    const body = await res.json();
    expect(body.country).toBe("IN");
  });
});
