import { describe, expect, it } from "vitest";
import { blendedReturn, currencyExposure, locked, toBase, totalInBase } from "./retirementFx";
import { AssetAccount } from "@/types/retirement";

// §3.1's worked example: base currency INR, two holdings in USD.
const ppf: AssetAccount = {
  id: "ppf",
  label: "Public Provident Fund",
  assetType: "ppf",
  currency: "INR",
  balance: 1200000,
  fxRate: 1,
  fxSource: "manual",
  fxAsOf: "2026-08-19",
  expectedReturn: 0.071,
  availableFromAge: 60,
};

const mutualFund: AssetAccount = {
  id: "mf",
  label: "Index funds",
  assetType: "mutual_fund",
  currency: "INR",
  balance: 2300000,
  fxRate: 1,
  fxSource: "manual",
  fxAsOf: "2026-08-19",
  expectedReturn: 0.11,
  availableFromAge: null,
};

const four01k: AssetAccount = {
  id: "401k",
  label: "Employer plan, USA",
  assetType: "401k",
  currency: "USD",
  balance: 20000,
  fxRate: 87.5,
  fxSource: "live",
  fxAsOf: "2026-08-19",
  expectedReturn: 0.075,
  availableFromAge: 59,
};

const rothIra: AssetAccount = {
  id: "roth",
  label: "Retirement, USA",
  assetType: "roth_ira",
  currency: "USD",
  balance: 8000,
  fxRate: 87.5,
  fxSource: "live",
  fxAsOf: "2026-08-19",
  expectedReturn: 0.08,
  availableFromAge: 59,
};

const accounts = [ppf, mutualFund, four01k, rothIra];

describe("toBase", () => {
  it("USD 20,000 at 87.50 converts to base INR 1,750,000", () => {
    expect(toBase(four01k, "INR")).toBeCloseTo(1750000, 0);
  });

  it("an account already in base currency ignores its rate — no conversion", () => {
    const skewed: AssetAccount = { ...ppf, fxRate: 999 };
    expect(toBase(skewed, "INR")).toBe(1200000);
  });
});

describe("totalInBase", () => {
  it("four accounts, two in USD, total 5,950,000", () => {
    expect(totalInBase(accounts, "INR")).toBeCloseTo(5950000, 0);
  });
});

describe("blendedReturn", () => {
  it("blends to 8.83%", () => {
    expect(blendedReturn(accounts, "INR")).toBeCloseTo(0.0883, 3);
  });
});

describe("currencyExposure", () => {
  it("reports the USD share of the base-currency total", () => {
    const exposure = currencyExposure(accounts, "INR");
    const usd = exposure.find((e) => e.currency === "USD")!;
    expect(usd.amountBase).toBeCloseTo(2450000, 0);
    expect(usd.percentOfTotal).toBeCloseTo(2450000 / 5950000, 4);
  });
});

describe("locked", () => {
  it("flags accounts not yet reachable at a given age", () => {
    // At 58: PPF (opens 60), 401k and Roth IRA (open 59) are all still locked.
    expect(locked(accounts, "INR", 58)).toBeCloseTo(3650000, 0);
    // At 59: 401k and Roth IRA have opened; only PPF remains locked.
    expect(locked(accounts, "INR", 59)).toBeCloseTo(1200000, 0);
    // At 60: everything is open.
    expect(locked(accounts, "INR", 60)).toBe(0);
  });
});
