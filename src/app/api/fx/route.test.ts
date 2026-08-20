import { describe, expect, it, vi, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "./route";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("GET /api/fx", () => {
  it("inverts the provider's rate so it multiplies directly into base currency", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ result: "success", rates: { USD: 0.01, INR: 1 } }),
      })
    );
    const res = await GET(new NextRequest("http://localhost/api/fx?base=INR"));
    const body = await res.json();

    expect(body.source).toBe("live");
    expect(body.base).toBe("INR");
    expect(body.rates.USD).toBeCloseTo(100, 4); // 1 USD = 100 INR, given the provider's 1 INR = 0.01 USD
  });

  it("returns 'unavailable' with a null rate set when the provider fetch throws", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network down"))
    );
    const res = await GET(new NextRequest("http://localhost/api/fx?base=INR"));
    const body = await res.json();

    expect(body.source).toBe("unavailable");
    expect(body.rates).toBeNull();
    expect(body.asOf).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("returns 'unavailable' on a non-ok HTTP response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 503, json: async () => ({}) })
    );
    const res = await GET(new NextRequest("http://localhost/api/fx?base=INR"));
    const body = await res.json();
    expect(body.source).toBe("unavailable");
  });

  it("returns 'unavailable' when the provider itself reports failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ result: "error", rates: {} }) })
    );
    const res = await GET(new NextRequest("http://localhost/api/fx?base=INR"));
    const body = await res.json();
    expect(body.source).toBe("unavailable");
  });
});
