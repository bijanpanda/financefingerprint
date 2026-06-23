import {
  collection,
  doc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { LineItem, ExpenseItem, Transaction, ExpenseSubHead } from "@/types";

function budgetPath(uid: string, monthId: string) {
  return `users/${uid}/budgets/${monthId}`;
}

// --- Income Items ---
export async function getIncomeItems(uid: string, monthId: string): Promise<LineItem[]> {
  const snap = await getDocs(
    query(collection(db, budgetPath(uid, monthId), "incomeItems"), orderBy("order"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as LineItem));
}

export async function addIncomeItem(uid: string, monthId: string, item: Omit<LineItem, "id">) {
  return addDoc(collection(db, budgetPath(uid, monthId), "incomeItems"), item);
}

export async function updateIncomeItem(uid: string, monthId: string, id: string, data: Partial<LineItem>) {
  return updateDoc(doc(db, budgetPath(uid, monthId), "incomeItems", id), data);
}

export async function deleteIncomeItem(uid: string, monthId: string, id: string) {
  return deleteDoc(doc(db, budgetPath(uid, monthId), "incomeItems", id));
}

// --- Expense Items ---
export async function getExpenseItems(uid: string, monthId: string): Promise<ExpenseItem[]> {
  const snap = await getDocs(
    query(collection(db, budgetPath(uid, monthId), "expenseItems"), orderBy("order"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ExpenseItem));
}

export async function addExpenseItem(uid: string, monthId: string, item: Omit<ExpenseItem, "id">) {
  return addDoc(collection(db, budgetPath(uid, monthId), "expenseItems"), item);
}

export async function updateExpenseItem(uid: string, monthId: string, id: string, data: Partial<ExpenseItem>) {
  return updateDoc(doc(db, budgetPath(uid, monthId), "expenseItems", id), data);
}

export async function deleteExpenseItem(uid: string, monthId: string, id: string) {
  return deleteDoc(doc(db, budgetPath(uid, monthId), "expenseItems", id));
}

// --- Savings Items ---
export async function getSavingsItems(uid: string, monthId: string): Promise<LineItem[]> {
  const snap = await getDocs(
    query(collection(db, budgetPath(uid, monthId), "savingsItems"), orderBy("order"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as LineItem));
}

export async function addSavingsItem(uid: string, monthId: string, item: Omit<LineItem, "id">) {
  return addDoc(collection(db, budgetPath(uid, monthId), "savingsItems"), item);
}

export async function updateSavingsItem(uid: string, monthId: string, id: string, data: Partial<LineItem>) {
  return updateDoc(doc(db, budgetPath(uid, monthId), "savingsItems", id), data);
}

export async function deleteSavingsItem(uid: string, monthId: string, id: string) {
  return deleteDoc(doc(db, budgetPath(uid, monthId), "savingsItems", id));
}

// --- Transactions ---
export async function getTransactions(uid: string, monthId: string): Promise<Transaction[]> {
  const snap = await getDocs(
    query(collection(db, budgetPath(uid, monthId), "transactions"), orderBy("date", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Transaction));
}

export async function addTransaction(uid: string, monthId: string, txn: Omit<Transaction, "id" | "createdAt">) {
  return addDoc(collection(db, budgetPath(uid, monthId), "transactions"), {
    ...txn,
    createdAt: Timestamp.now(),
  });
}

export async function deleteTransaction(uid: string, monthId: string, id: string) {
  return deleteDoc(doc(db, budgetPath(uid, monthId), "transactions", id));
}

// --- Budget Month ---
export async function ensureBudgetMonth(uid: string, monthId: string, month: number, year: number) {
  const ref = doc(db, budgetPath(uid, monthId));
  await setDoc(ref, { month, year, createdAt: Timestamp.now() }, { merge: true });
}

// --- Initialize defaults ---
export async function initializeDefaults(
  uid: string,
  monthId: string,
  defaultIncome: string[],
  defaultExpenses: Record<ExpenseSubHead, string[]>,
  defaultSavings: string[]
) {
  const [existingInc, existingExp, existingSav] = await Promise.all([
    getIncomeItems(uid, monthId),
    getExpenseItems(uid, monthId),
    getSavingsItems(uid, monthId),
  ]);
  if (existingInc.length > 0 || existingExp.length > 0 || existingSav.length > 0) return;

  const batch: Promise<unknown>[] = [];

  defaultIncome.forEach((name, i) => {
    batch.push(addIncomeItem(uid, monthId, { name, planned: 0, actual: 0, order: i }));
  });

  let expenseOrder = 0;
  for (const [subHead, items] of Object.entries(defaultExpenses)) {
    for (const name of items) {
      batch.push(
        addExpenseItem(uid, monthId, {
          name,
          subHead: subHead as ExpenseSubHead,
          planned: 0,
          actual: 0,
          order: expenseOrder++,
        })
      );
    }
  }

  defaultSavings.forEach((name, i) => {
    batch.push(addSavingsItem(uid, monthId, { name, planned: 0, actual: 0, order: i }));
  });

  await Promise.all(batch);
}
