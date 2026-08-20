import { collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";
import { Currency } from "@/types";
import { AssetAccount, Goal, RetirementPlan } from "@/types/retirement";
import { BudgetDerivationSource } from "@/utils/retirementFromBudget";

export interface RetirementPlanDoc extends RetirementPlan {
  accounts: AssetAccount[];
  livingExpenseSource: BudgetDerivationSource;
  livingExpenseDerivedAt: string | null;
}

function planRef(uid: string) {
  return doc(db, "users", uid, "retirement", "plan");
}

function goalsPath(uid: string) {
  return `users/${uid}/retirement/plan/goals`;
}

export async function getGoals(uid: string): Promise<Goal[]> {
  const snap = await getDocs(collection(db, goalsPath(uid)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Goal));
}

export async function addGoal(uid: string, goal: Omit<Goal, "id">) {
  return addDoc(collection(db, goalsPath(uid)), goal);
}

export async function updateGoal(uid: string, goalId: string, data: Partial<Goal>) {
  return updateDoc(doc(db, goalsPath(uid), goalId), data);
}

export async function deleteGoal(uid: string, goalId: string) {
  return deleteDoc(doc(db, goalsPath(uid), goalId));
}

// The plan doc and its goals subcollection, merged into one in-memory
// RetirementPlan ready to hand straight to project().
export async function getRetirementPlan(uid: string): Promise<RetirementPlanDoc | null> {
  const snap = await getDoc(planRef(uid));
  if (!snap.exists()) return null;
  const goals = await getGoals(uid);
  return { ...(snap.data() as Omit<RetirementPlanDoc, "goals">), goals };
}

// Goals persist separately via addGoal/updateGoal/deleteGoal — never through this call.
export async function saveRetirementPlan(uid: string, plan: RetirementPlanDoc): Promise<void> {
  const { goals: _goals, ...rest } = plan;
  await setDoc(planRef(uid), rest, { merge: true });
}

// UserProfile has no country field (checked — identity/financial profiles
// don't carry one either), so a new plan's country starts as a guess from
// the account's base currency and stays user-editable from there.
const CURRENCY_TO_COUNTRY: Record<Currency, string> = {
  INR: "IN",
  USD: "US",
  EUR: "DE",
  GBP: "GB",
  AUD: "AU",
  CAD: "CA",
  SGD: "SG",
  AED: "AE",
};

export function defaultCountryForCurrency(currency: Currency): string {
  return CURRENCY_TO_COUNTRY[currency];
}
