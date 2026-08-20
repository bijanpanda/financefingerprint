import { Currency } from "@/types";
import { AssetAccount, AssetType } from "@/types/retirement";

interface AssetTypeInfo {
  label: string;
  group: "India" | "USA" | "UK/EU" | "Anywhere";
  defaultReturn: number;
}

// Default expected returns are fractions (0.071 = 7.1%), editable per account.
export const ASSET_TYPES: Record<AssetType, AssetTypeInfo> = {
  ppf: { label: "Public Provident Fund (PPF)", group: "India", defaultReturn: 0.071 },
  epf: { label: "Employee Provident Fund (EPF)", group: "India", defaultReturn: 0.081 },
  nps: { label: "National Pension System (NPS)", group: "India", defaultReturn: 0.09 },
  mutual_fund: { label: "Mutual fund", group: "India", defaultReturn: 0.11 },
  equity: { label: "Equity", group: "India", defaultReturn: 0.12 },
  fixed_deposit: { label: "Fixed deposit", group: "India", defaultReturn: 0.065 },
  gold: { label: "Gold", group: "India", defaultReturn: 0.07 },
  sovereign_gold_bond: { label: "Sovereign gold bond", group: "India", defaultReturn: 0.075 },
  "401k": { label: "401(k)", group: "USA", defaultReturn: 0.075 },
  roth_ira: { label: "Roth IRA", group: "USA", defaultReturn: 0.08 },
  traditional_ira: { label: "Traditional IRA", group: "USA", defaultReturn: 0.08 },
  hsa: { label: "HSA", group: "USA", defaultReturn: 0.07 },
  brokerage: { label: "Brokerage", group: "USA", defaultReturn: 0.1 },
  isa: { label: "ISA", group: "UK/EU", defaultReturn: 0.07 },
  sipp: { label: "SIPP", group: "UK/EU", defaultReturn: 0.07 },
  workplace_pension: { label: "Workplace pension", group: "UK/EU", defaultReturn: 0.06 },
  cash_savings: { label: "Cash / savings", group: "Anywhere", defaultReturn: 0.03 },
  bonds: { label: "Bonds", group: "Anywhere", defaultReturn: 0.05 },
  rental_property_equity: { label: "Rental property equity", group: "Anywhere", defaultReturn: 0.06 },
  crypto: { label: "Crypto", group: "Anywhere", defaultReturn: 0.15 },
  other: { label: "Other", group: "Anywhere", defaultReturn: 0.06 },
};

export function toBase(account: AssetAccount, baseCurrency: Currency): number {
  return account.currency === baseCurrency ? account.balance : account.balance * account.fxRate;
}

export function totalInBase(accounts: AssetAccount[], baseCurrency: Currency): number {
  return accounts.reduce((sum, a) => sum + toBase(a, baseCurrency), 0);
}

export function blendedReturn(accounts: AssetAccount[], baseCurrency: Currency): number {
  const total = totalInBase(accounts, baseCurrency);
  if (total === 0) return 0;
  const weighted = accounts.reduce((sum, a) => sum + toBase(a, baseCurrency) * a.expectedReturn, 0);
  return weighted / total;
}

export interface CurrencyExposure {
  currency: Currency;
  amountBase: number;
  percentOfTotal: number;
}

export function currencyExposure(accounts: AssetAccount[], baseCurrency: Currency): CurrencyExposure[] {
  const total = totalInBase(accounts, baseCurrency);
  const byCurrency = new Map<Currency, number>();
  for (const a of accounts) {
    const amount = toBase(a, baseCurrency);
    byCurrency.set(a.currency, (byCurrency.get(a.currency) ?? 0) + amount);
  }
  return Array.from(byCurrency.entries())
    .map(([currency, amountBase]) => ({
      currency,
      amountBase,
      percentOfTotal: total === 0 ? 0 : amountBase / total,
    }))
    .sort((a, b) => b.amountBase - a.amountBase);
}

// locked(age) — §3.1: balance held in accounts not yet reachable at this age.
export function locked(accounts: AssetAccount[], baseCurrency: Currency, age: number): number {
  return accounts
    .filter((a) => a.availableFromAge != null && a.availableFromAge > age)
    .reduce((sum, a) => sum + toBase(a, baseCurrency), 0);
}
