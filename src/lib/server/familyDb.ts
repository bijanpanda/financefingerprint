// server-only — do NOT import in client components
import "server-only";
import { randomBytes } from "crypto";
import { Timestamp } from "firebase-admin/firestore";
import { getAdminFirestore } from "./adminAuth";
import { Currency } from "@/types";
import {
  FamilyRole,
  MemberInviteStatus,
  InviteTokenStatus,
} from "@/types/family";

function toDate(ts: Timestamp | null | undefined): Date | null {
  return ts ? ts.toDate() : null;
}

// --- Membership lookup (fast "does this uid belong to a family?" check) ---
export async function getFamilyMembership(uid: string) {
  const snap = await getAdminFirestore().collection("familyMembership").doc(uid).get();
  if (!snap.exists) return null;
  const data = snap.data() as { familyGroupId: string; role: FamilyRole };
  return data;
}

// --- Family group ---
export async function getFamilyGroup(groupId: string) {
  const snap = await getAdminFirestore().collection("familyGroups").doc(groupId).get();
  if (!snap.exists) return null;
  const data = snap.data() as {
    initiatorUid: string;
    currency: Currency;
    createdAt: Timestamp;
    orphaned?: boolean;
    orphanedInitiatorName?: string;
  };
  return {
    id: snap.id,
    initiatorUid: data.initiatorUid,
    currency: data.currency,
    createdAt: data.createdAt.toDate(),
    orphaned: data.orphaned || false,
    orphanedInitiatorName: data.orphanedInitiatorName || null,
  };
}

// --- Membership lifecycle (leave / remove / graduate / orphan-confirm all reduce to this) ---

// The one core operation: a member no longer belongs to the group. Their budget data is
// untouched — this only removes the family-group linkage.
export async function departMember(groupId: string, uid: string) {
  const db = getAdminFirestore();
  await db.collection("familyGroups").doc(groupId).collection("members").doc(uid).delete();
  await db.collection("familyMembership").doc(uid).delete();
}

export async function promoteToInitiator(groupId: string, newInitiatorUid: string) {
  await getAdminFirestore().collection("familyGroups").doc(groupId).update({ initiatorUid: newInitiatorUid });
}

export async function markGroupOrphaned(groupId: string, orphaned: boolean, lastInitiatorName?: string) {
  const update: Record<string, unknown> = { orphaned };
  if (lastInitiatorName !== undefined) update.orphanedInitiatorName = lastInitiatorName;
  await getAdminFirestore().collection("familyGroups").doc(groupId).update(update);
}

// After a departure, if no members remain, there's nothing left to keep around.
export async function deleteGroupIfEmpty(groupId: string) {
  const members = await listFamilyMembers(groupId);
  if (members.length === 0) {
    await getAdminFirestore().collection("familyGroups").doc(groupId).delete();
  }
}

// Creates a new family group with `initiatorUid` as its first confirmed principal.
export async function createFamilyGroup(initiatorUid: string, initiatorEmail: string, initiatorDisplayName: string, currency: Currency) {
  const db = getAdminFirestore();
  const groupRef = db.collection("familyGroups").doc();
  const now = Timestamp.now();

  await groupRef.set({ initiatorUid, currency, createdAt: now });
  await groupRef.collection("members").doc(initiatorUid).set({
    role: "principal" as FamilyRole,
    inviteStatus: "confirmed" as MemberInviteStatus,
    invitedBy: initiatorUid,
    email: initiatorEmail,
    displayName: initiatorDisplayName,
    joinedAt: now,
  });
  await db.collection("familyMembership").doc(initiatorUid).set({
    familyGroupId: groupRef.id,
    role: "principal" as FamilyRole,
  });

  return groupRef.id;
}

// --- Family members ---
export async function listFamilyMembers(groupId: string) {
  const snap = await getAdminFirestore()
    .collection("familyGroups")
    .doc(groupId)
    .collection("members")
    .get();
  return snap.docs.map((d) => {
    const data = d.data() as {
      role: FamilyRole;
      inviteStatus: MemberInviteStatus;
      invitedBy: string;
      email: string;
      displayName: string;
      joinedAt: Timestamp | null;
    };
    return {
      uid: d.id,
      role: data.role,
      inviteStatus: data.inviteStatus,
      invitedBy: data.invitedBy,
      email: data.email,
      displayName: data.displayName,
      joinedAt: toDate(data.joinedAt),
    };
  });
}

export async function confirmFamilyMember(
  groupId: string,
  uid: string,
  role: FamilyRole,
  invitedBy: string,
  email: string,
  displayName: string
) {
  const db = getAdminFirestore();
  const now = Timestamp.now();
  await db
    .collection("familyGroups")
    .doc(groupId)
    .collection("members")
    .doc(uid)
    .set({
      role,
      inviteStatus: "confirmed" as MemberInviteStatus,
      invitedBy,
      email,
      displayName,
      joinedAt: now,
    });
  await db.collection("familyMembership").doc(uid).set({ familyGroupId: groupId, role });
}

// --- Invite tokens ---
export async function listPendingInvites(groupId: string) {
  const snap = await getAdminFirestore()
    .collection("familyInviteTokens")
    .where("familyGroupId", "==", groupId)
    .where("status", "==", "pending")
    .get();
  return snap.docs.map((d) => {
    const data = d.data() as {
      inviteeEmail: string;
      role: FamilyRole;
      createdAt: Timestamp;
      lastReminderSentAt: Timestamp | null;
    };
    return {
      inviteeEmail: data.inviteeEmail,
      role: data.role,
      createdAt: data.createdAt.toDate(),
      lastReminderSentAt: toDate(data.lastReminderSentAt),
    };
  });
}

// All pending invites across every family, for the reminder scan. No orderBy paired with the
// equality filter, so this doesn't need a composite index — staleness is filtered in JS instead.
export async function listAllPendingInviteTokens() {
  const snap = await getAdminFirestore().collection("familyInviteTokens").where("status", "==", "pending").get();
  return snap.docs.map((d) => {
    const data = d.data() as {
      inviterName: string;
      inviteeEmail: string;
      role: FamilyRole;
      existingUid: string | null;
      lastReminderSentAt: Timestamp | null;
    };
    return {
      token: d.id,
      inviterName: data.inviterName,
      inviteeEmail: data.inviteeEmail,
      role: data.role,
      existingUid: data.existingUid,
      lastReminderSentAt: toDate(data.lastReminderSentAt),
    };
  });
}

export async function findPendingInviteToken(groupId: string, inviteeEmail: string) {
  const snap = await getAdminFirestore()
    .collection("familyInviteTokens")
    .where("familyGroupId", "==", groupId)
    .where("inviteeEmail", "==", inviteeEmail)
    .where("status", "==", "pending")
    .limit(1)
    .get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  const data = doc.data() as {
    inviterUid: string;
    inviterName: string;
    inviteeEmail: string;
    role: FamilyRole;
    existingUid: string | null;
    status: InviteTokenStatus;
  };
  return { token: doc.id, ...data };
}

export async function createInviteToken(params: {
  familyGroupId: string;
  inviterUid: string;
  inviterName: string;
  inviteeEmail: string;
  role: FamilyRole;
  existingUid: string | null;
}) {
  const token = randomBytes(32).toString("hex");
  const now = Timestamp.now();
  await getAdminFirestore()
    .collection("familyInviteTokens")
    .doc(token)
    .set({
      familyGroupId: params.familyGroupId,
      inviterUid: params.inviterUid,
      inviterName: params.inviterName,
      inviteeEmail: params.inviteeEmail,
      role: params.role,
      existingUid: params.existingUid,
      status: "pending" as InviteTokenStatus,
      createdAt: now,
      lastReminderSentAt: null,
    });
  return token;
}

export async function getInviteToken(token: string) {
  const snap = await getAdminFirestore().collection("familyInviteTokens").doc(token).get();
  if (!snap.exists) return null;
  const data = snap.data() as {
    familyGroupId: string;
    inviterUid: string;
    inviterName: string;
    inviteeEmail: string;
    role: FamilyRole;
    existingUid: string | null;
    status: InviteTokenStatus;
    createdAt: Timestamp;
    lastReminderSentAt: Timestamp | null;
  };
  return {
    token: snap.id,
    familyGroupId: data.familyGroupId,
    inviterUid: data.inviterUid,
    inviterName: data.inviterName,
    inviteeEmail: data.inviteeEmail,
    role: data.role,
    existingUid: data.existingUid,
    status: data.status,
    createdAt: data.createdAt.toDate(),
    lastReminderSentAt: toDate(data.lastReminderSentAt),
  };
}

export async function markInviteTokenStatus(token: string, status: InviteTokenStatus) {
  await getAdminFirestore().collection("familyInviteTokens").doc(token).update({ status });
}

export async function deleteInviteToken(token: string) {
  await getAdminFirestore().collection("familyInviteTokens").doc(token).delete();
}

export async function touchInviteTokenReminder(token: string) {
  await getAdminFirestore()
    .collection("familyInviteTokens")
    .doc(token)
    .update({ lastReminderSentAt: Timestamp.now() });
}

// --- User lookup helper (reads the default-project users/{uid} doc via Admin SDK) ---
export async function getUserDoc(uid: string) {
  const snap = await getAdminFirestore().collection("users").doc(uid).get();
  if (!snap.exists) return null;
  return snap.data() as { displayName?: string; currency?: Currency; region?: string };
}
