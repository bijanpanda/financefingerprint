import { Currency } from "@/types";

const currencyConfig: Record<Currency, { symbol: string; locale: string }> = {
  INR: { symbol: "₹", locale: "en-IN" },
  USD: { symbol: "$", locale: "en-US" },
  EUR: { symbol: "€", locale: "de-DE" },
  GBP: { symbol: "£", locale: "en-GB" },
  AUD: { symbol: "A$", locale: "en-US" },
  CAD: { symbol: "C$", locale: "en-US" },
  SGD: { symbol: "S$", locale: "en-US" },
  AED: { symbol: "AED", locale: "ar-AE" },
};

export const CURRENCIES: { value: Currency; label: string }[] = [
  { value: "INR", label: "₹ INR - Indian Rupee" },
  { value: "USD", label: "$ USD - US Dollar" },
  { value: "EUR", label: "€ EUR - Euro" },
  { value: "GBP", label: "£ GBP - British Pound" },
  { value: "AUD", label: "A$ AUD - Australian Dollar" },
  { value: "CAD", label: "C$ CAD - Canadian Dollar" },
  { value: "SGD", label: "S$ SGD - Singapore Dollar" },
  { value: "AED", label: "AED - UAE Dirham" },
];

// Intl.NumberFormat construction is expensive — measured as a real INP
// blocker on the retirement page, which formats hundreds of figures
// (ledger rows, chart ticks, solve-for tiles) on every render. One
// formatter per currency, built once and reused.
const formatterCache = new Map<Currency, Intl.NumberFormat>();

function getFormatter(currency: Currency): Intl.NumberFormat {
  let formatter = formatterCache.get(currency);
  if (!formatter) {
    const config = currencyConfig[currency];
    formatter = new Intl.NumberFormat(config.locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    formatterCache.set(currency, formatter);
  }
  return formatter;
}

export function formatCurrency(amount: number, currency: Currency): string {
  return getFormatter(currency).format(amount);
}

export function getCurrencySymbol(currency: Currency): string {
  return currencyConfig[currency].symbol;
}
