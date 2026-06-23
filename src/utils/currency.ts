import { Currency } from "@/types";

const currencyConfig: Record<Currency, { symbol: string; locale: string }> = {
  INR: { symbol: "₹", locale: "en-IN" },
  USD: { symbol: "$", locale: "en-US" },
  EUR: { symbol: "€", locale: "de-DE" },
  GBP: { symbol: "£", locale: "en-GB" },
  AUD: { symbol: "A$", locale: "en-AU" },
  CAD: { symbol: "C$", locale: "en-CA" },
  SGD: { symbol: "S$", locale: "en-SG" },
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

export function formatCurrency(amount: number, currency: Currency): string {
  const config = currencyConfig[currency];
  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}
