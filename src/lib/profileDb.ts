import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { CustomerProfile } from "@/types/profile";
import { getCurrentFinancialYear } from "@/utils/questionBank";

export async function saveProfile(uid: string, profile: CustomerProfile): Promise<void> {
  const ref = doc(db, "users", uid, "profiles", profile.financialYear);
  // Firestore rejects `undefined` field values (unlike a missing key) — strip them so
  // optional fields like previousProfileId/driftSummary can be safely omitted by callers.
  const clean = Object.fromEntries(
    Object.entries({ ...profile, createdAt: Timestamp.now(), updatedAt: Timestamp.now() })
      .filter(([, value]) => value !== undefined)
  );
  await setDoc(ref, clean);
}

export async function getLatestProfile(uid: string): Promise<CustomerProfile | null> {
  const fy = getCurrentFinancialYear();
  const ref = doc(db, "users", uid, "profiles", fy);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return { ...snap.data(), profileId: snap.id } as CustomerProfile;
  }
  return null;
}

export async function hasCurrentYearProfile(uid: string): Promise<boolean> {
  const profile = await getLatestProfile(uid);
  return profile !== null && profile.status === "complete";
}

export async function getProfileHistory(uid: string): Promise<CustomerProfile[]> {
  const snap = await getDocs(
    query(collection(db, "users", uid, "profiles"), orderBy("financialYear", "desc"))
  );
  return snap.docs.map((d) => ({ ...d.data(), profileId: d.id } as CustomerProfile));
}

export async function prefillFromBudget(
  uid: string
): Promise<{ totalExpenses: number; totalEMIs: number; totalIncome: number } | null> {
  const now = new Date();
  const monthId = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  try {
    const [incomeDocs, expenseDocs] = await Promise.all([
      getDocs(collection(db, `users/${uid}/budgets/${monthId}/incomeItems`)),
      getDocs(collection(db, `users/${uid}/budgets/${monthId}/expenseItems`)),
    ]);

    if (incomeDocs.empty && expenseDocs.empty) return null;

    let totalIncome = 0;
    incomeDocs.forEach((d) => {
      totalIncome += (d.data().planned as number) || 0;
    });

    let totalExpenses = 0;
    let totalEMIs = 0;
    expenseDocs.forEach((d) => {
      const data = d.data();
      const amount = (data.planned as number) || 0;
      if (data.subHead === "Loans") {
        totalEMIs += amount;
      } else {
        totalExpenses += amount;
      }
    });

    return { totalExpenses, totalEMIs, totalIncome };
  } catch {
    return null;
  }
}
