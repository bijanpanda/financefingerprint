// server-only — do NOT import in client components
import "server-only";
import { Timestamp } from "firebase-admin/firestore";
import { getAdminFirestore } from "./adminAuth";
import { getFamilyMembership, getFamilyGroup, listFamilyMembers, getUserDoc } from "./familyDb";
import { LineItem, ExpenseItem, Transaction } from "@/types";

export class FamilyPermissionError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function budgetPath(uid: string, monthId: string) {
  return `users/${uid}/budgets/${monthId}`;
}

// --- Permission checks ---

// Requester must be a confirmed Principal somewhere. Used for the read-only overview.
export async function assertPrincipalRole(requesterUid: string) {
  const membership = await getFamilyMembership(requesterUid);
  if (!membership || membership.role !== "principal") {
    throw new FamilyPermissionError("Only a Principal can view the family budget overview.", 403);
  }
  const group = await getFamilyGroup(membership.familyGroupId);
  if (!group) {
    throw new FamilyPermissionError("Family group not found.", 404);
  }
  return { groupId: group.id, currency: group.currency };
}

// Requester must be a confirmed Principal, and childUid must be a confirmed Child in the SAME group.
// Principals cannot use this to touch another Principal's budget — view only for that case.
export async function assertCanEditChild(requesterUid: string, childUid: string) {
  const requesterMembership = await getFamilyMembership(requesterUid);
  if (!requesterMembership || requesterMembership.role !== "principal") {
    throw new FamilyPermissionError("Only a Principal can edit a family member's budget.", 403);
  }
  const childMembership = await getFamilyMembership(childUid);
  if (!childMembership || childMembership.familyGroupId !== requesterMembership.familyGroupId) {
    throw new FamilyPermissionError("That person isn't in your family group.", 403);
  }
  if (childMembership.role !== "child") {
    throw new FamilyPermissionError("Principals can only view — not edit — another Principal's budget.", 403);
  }

  const [group, requesterDoc, childDoc] = await Promise.all([
    getFamilyGroup(requesterMembership.familyGroupId),
    getUserDoc(requesterUid),
    getUserDoc(childUid),
  ]);
  if (!group) throw new FamilyPermissionError("Family group not found.", 404);

  const members = await listFamilyMembers(group.id);
  const childMember = members.find((m) => m.uid === childUid);

  return {
    groupId: group.id,
    currency: group.currency,
    editorName: requesterDoc?.displayName || "A family member",
    childName: childMember?.displayName || childDoc?.displayName || "them",
    childEmail: childMember?.email || "",
  };
}

// --- Budget reads (cross-user, Admin SDK) ---

export async function getMemberBudget(uid: string, monthId: string) {
  const db = getAdminFirestore();
  const [incomeSnap, expenseSnap, savingsSnap] = await Promise.all([
    db.collection(`${budgetPath(uid, monthId)}/incomeItems`).orderBy("order").get(),
    db.collection(`${budgetPath(uid, monthId)}/expenseItems`).orderBy("order").get(),
    db.collection(`${budgetPath(uid, monthId)}/savingsItems`).orderBy("order").get(),
  ]);
  return {
    incomeItems: incomeSnap.docs.map((d) => ({ id: d.id, ...d.data() } as LineItem)),
    expenseItems: expenseSnap.docs.map((d) => ({ id: d.id, ...d.data() } as ExpenseItem)),
    savingsItems: savingsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as LineItem)),
  };
}

export async function getMemberTransactions(uid: string, monthId: string) {
  const snap = await getAdminFirestore()
    .collection(`${budgetPath(uid, monthId)}/transactions`)
    .orderBy("date", "desc")
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Transaction));
}

// --- Budget writes (cross-user, Admin SDK) — mirrors src/lib/db.ts's client-side operations ---

export async function addIncomeItemAdmin(uid: string, monthId: string, item: Omit<LineItem, "id">) {
  const ref = await getAdminFirestore().collection(`${budgetPath(uid, monthId)}/incomeItems`).add(item);
  return ref.id;
}
export async function updateIncomeItemAdmin(uid: string, monthId: string, id: string, data: Partial<LineItem>) {
  await getAdminFirestore().doc(`${budgetPath(uid, monthId)}/incomeItems/${id}`).update(data);
}
export async function deleteIncomeItemAdmin(uid: string, monthId: string, id: string) {
  await getAdminFirestore().doc(`${budgetPath(uid, monthId)}/incomeItems/${id}`).delete();
}

export async function addExpenseItemAdmin(uid: string, monthId: string, item: Omit<ExpenseItem, "id">) {
  const ref = await getAdminFirestore().collection(`${budgetPath(uid, monthId)}/expenseItems`).add(item);
  return ref.id;
}
export async function updateExpenseItemAdmin(uid: string, monthId: string, id: string, data: Partial<ExpenseItem>) {
  await getAdminFirestore().doc(`${budgetPath(uid, monthId)}/expenseItems/${id}`).update(data);
}
export async function deleteExpenseItemAdmin(uid: string, monthId: string, id: string) {
  await getAdminFirestore().doc(`${budgetPath(uid, monthId)}/expenseItems/${id}`).delete();
}

export async function addSavingsItemAdmin(uid: string, monthId: string, item: Omit<LineItem, "id">) {
  const ref = await getAdminFirestore().collection(`${budgetPath(uid, monthId)}/savingsItems`).add(item);
  return ref.id;
}
export async function updateSavingsItemAdmin(uid: string, monthId: string, id: string, data: Partial<LineItem>) {
  await getAdminFirestore().doc(`${budgetPath(uid, monthId)}/savingsItems/${id}`).update(data);
}
export async function deleteSavingsItemAdmin(uid: string, monthId: string, id: string) {
  await getAdminFirestore().doc(`${budgetPath(uid, monthId)}/savingsItems/${id}`).delete();
}

export async function addTransactionAdmin(
  uid: string,
  monthId: string,
  txn: Omit<Transaction, "id" | "createdAt">
) {
  const ref = await getAdminFirestore()
    .collection(`${budgetPath(uid, monthId)}/transactions`)
    .add({ ...txn, createdAt: Timestamp.now() });
  return ref.id;
}
export async function deleteTransactionAdmin(uid: string, monthId: string, id: string) {
  await getAdminFirestore().doc(`${budgetPath(uid, monthId)}/transactions/${id}`).delete();
}

// --- Lookups for audit-log wording (so the client doesn't need to pass along display info) ---

export async function getItemName(
  uid: string,
  monthId: string,
  collection: "incomeItems" | "expenseItems" | "savingsItems",
  id: string
): Promise<string> {
  const snap = await getAdminFirestore().doc(`${budgetPath(uid, monthId)}/${collection}/${id}`).get();
  return (snap.data()?.name as string) || "item";
}

export async function getTransactionInfo(
  uid: string,
  monthId: string,
  id: string
): Promise<{ amount: number; merchantName: string } | null> {
  const snap = await getAdminFirestore().doc(`${budgetPath(uid, monthId)}/transactions/${id}`).get();
  if (!snap.exists) return null;
  const data = snap.data() as { amount: number; merchantName: string };
  return { amount: data.amount, merchantName: data.merchantName };
}

// --- Audit log ---

export async function writeBudgetAuditEntry(params: {
  groupId: string;
  childUid: string;
  editedByUid: string;
  editedByName: string;
  monthId: string;
  changeSummary: string;
}) {
  // Nested under the child's own uid (rather than a flat collection filtered by childUid) so
  // "most recent entries for this child" is a plain ordered read — no composite index needed.
  await getAdminFirestore()
    .collection("familyGroups")
    .doc(params.groupId)
    .collection("budgetAuditLog")
    .doc(params.childUid)
    .collection("entries")
    .add({
      editedByUid: params.editedByUid,
      editedByName: params.editedByName,
      monthId: params.monthId,
      changeSummary: params.changeSummary,
      createdAt: Timestamp.now(),
    });
}

export async function listRecentAuditEntries(groupId: string, childUid: string, limit: number) {
  const snap = await getAdminFirestore()
    .collection("familyGroups")
    .doc(groupId)
    .collection("budgetAuditLog")
    .doc(childUid)
    .collection("entries")
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();
  return snap.docs.map((d) => {
    const data = d.data() as { editedByName: string; changeSummary: string; createdAt: Timestamp };
    return {
      editedByName: data.editedByName,
      changeSummary: data.changeSummary,
      createdAt: data.createdAt.toDate(),
    };
  });
}
