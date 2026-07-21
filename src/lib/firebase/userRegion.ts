import type { Region } from "./firebaseRegion";

const REGION_KEY = "ff_user_region";
const CURRENCY_KEY = "ff_user_currency";

export function saveUserRegion(region: Region): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(REGION_KEY, region);
  }
}

export function getUserRegion(): Region | null {
  if (typeof window === "undefined") return null;
  return (localStorage.getItem(REGION_KEY) as Region) || null;
}

export function clearUserRegion(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(REGION_KEY);
    localStorage.removeItem(CURRENCY_KEY);
  }
}

export function saveUserCurrency(currency: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(CURRENCY_KEY, currency);
    window.dispatchEvent(new CustomEvent("ff_currency_changed", { detail: currency }));
  }
}

export function getUserCurrency(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CURRENCY_KEY);
}
