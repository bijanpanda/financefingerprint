import { getLatestProfile } from "./profileDb";
import { getCurrentFinancialYear } from "@/utils/questionBank";
import { CustomerProfile } from "@/types/profile";

export type ProfileGuardResult = "proceed" | "redirect_to_profiling";

// Firestore returns raw Timestamp objects (with a .toDate() method) at runtime for
// Date-typed fields, not JS Date instances — normalise before doing date arithmetic.
export function toJsDate(value: unknown): Date {
  if (value && typeof (value as { toDate?: unknown }).toDate === "function") {
    return (value as { toDate: () => Date }).toDate();
  }
  return new Date(value as string | number | Date);
}

function daysSince(date: unknown): number {
  return (Date.now() - toJsDate(date).getTime()) / (1000 * 60 * 60 * 24);
}

function evaluateGuard(latestProfile: CustomerProfile | null): ProfileGuardResult {
  if (!latestProfile || latestProfile.status !== "complete") {
    return "redirect_to_profiling";
  }

  const profileAge = daysSince(latestProfile.createdAt);
  const currentFY = getCurrentFinancialYear();

  if (latestProfile.financialYear !== currentFY && profileAge > 365) {
    return "redirect_to_profiling";
  }

  return "proceed";
}

// Mirrors the spec's profileGuard(userId) algorithm. This app has no server session
// cookie (Firebase Auth state lives client-side only), so this runs as a normal
// async check that pages call client-side — the same pattern every existing
// protected page already uses (see src/app/profile/setup/page.tsx) — rather than
// as Next.js edge middleware, which would have no way to read the user's auth state.
export async function profileGuard(userId: string): Promise<ProfileGuardResult> {
  const latestProfile = await getLatestProfile(userId);
  return evaluateGuard(latestProfile);
}

export async function getProfileGuardContext(
  userId: string
): Promise<{ result: ProfileGuardResult; profile: CustomerProfile | null }> {
  const profile = await getLatestProfile(userId);
  return { result: evaluateGuard(profile), profile };
}
