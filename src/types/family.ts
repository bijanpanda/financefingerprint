import { Currency } from "@/types";

export type FamilyRole = "principal" | "child";
export type MemberInviteStatus = "pending" | "confirmed" | "declined";
export type InviteTokenStatus = "pending" | "accepted" | "declined";

export interface FamilyGroup {
  id: string;
  initiatorUid: string;
  currency: Currency;
  createdAt: Date;
}

export interface FamilyMember {
  uid: string;
  role: FamilyRole;
  inviteStatus: MemberInviteStatus;
  invitedBy: string;
  email: string;
  displayName: string;
  joinedAt: Date | null;
}

export interface FamilyMembership {
  familyGroupId: string;
  role: FamilyRole;
}

export interface FamilyInviteToken {
  token: string;
  familyGroupId: string;
  inviterUid: string;
  inviterName: string;
  inviteeEmail: string;
  role: FamilyRole;
  existingUid: string | null;
  status: InviteTokenStatus;
  createdAt: Date;
  lastReminderSentAt: Date | null;
}
