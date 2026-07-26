import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/server/adminAuth";
import { sendFamilyInviteEmail } from "@/lib/server/email";
import {
  getFamilyMembership,
  getFamilyGroup,
  createFamilyGroup,
  findPendingInviteToken,
  createInviteToken,
  deleteInviteToken,
  getUserDoc,
} from "@/lib/server/familyDb";
import { FamilyRole } from "@/types/family";

export async function POST(req: NextRequest) {
  try {
    const { inviterUid, inviteeEmail, role } = await req.json();

    if (!inviterUid || !inviteeEmail || (role !== "principal" && role !== "child")) {
      return NextResponse.json({ error: "inviterUid, inviteeEmail, and a valid role are required" }, { status: 400 });
    }
    const normalizedEmail = String(inviteeEmail).trim().toLowerCase();

    const inviterAuth = await getAdminAuth().getUser(inviterUid);
    if (inviterAuth.email && inviterAuth.email.toLowerCase() === normalizedEmail) {
      return NextResponse.json({ error: "You can't invite yourself." }, { status: 400 });
    }

    const inviterDoc = await getUserDoc(inviterUid);
    const inviterName = inviterDoc?.displayName || inviterAuth.displayName || inviterAuth.email?.split("@")[0] || "Someone";

    // Resolve (or create) the inviter's family group. Only the group's initiator may invite.
    let groupId: string;
    const existingMembership = await getFamilyMembership(inviterUid);
    if (existingMembership) {
      const group = await getFamilyGroup(existingMembership.familyGroupId);
      if (!group || group.initiatorUid !== inviterUid) {
        return NextResponse.json(
          { error: "Only the person who started this family group can send invites." },
          { status: 403 }
        );
      }
      groupId = group.id;
    } else {
      if (!inviterDoc?.currency) {
        return NextResponse.json({ error: "Could not determine your account currency." }, { status: 400 });
      }
      groupId = await createFamilyGroup(inviterUid, inviterAuth.email || "", inviterName, inviterDoc.currency);
    }

    const group = await getFamilyGroup(groupId);
    if (!group) {
      return NextResponse.json({ error: "Family group not found." }, { status: 500 });
    }

    const duplicate = await findPendingInviteToken(groupId, normalizedEmail);
    if (duplicate) {
      return NextResponse.json({ error: "There's already a pending invite for this email." }, { status: 409 });
    }

    // Look up whether the invitee already has a Vestrofin account.
    let existingUid: string | null = null;
    try {
      const inviteeAuth = await getAdminAuth().getUserByEmail(normalizedEmail);
      existingUid = inviteeAuth.uid;
    } catch {
      existingUid = null; // no account with this email yet
    }

    if (existingUid) {
      const inviteeMembership = await getFamilyMembership(existingUid);
      if (inviteeMembership) {
        if (inviteeMembership.familyGroupId === groupId) {
          return NextResponse.json({ error: "This person is already part of your family." }, { status: 409 });
        }
        return NextResponse.json(
          { error: "This person is already part of another family and can't be added." },
          { status: 409 }
        );
      }

      const inviteeDoc = await getUserDoc(existingUid);
      if (inviteeDoc?.currency && inviteeDoc.currency !== group.currency) {
        return NextResponse.json(
          {
            error: `Family Budget requires everyone to use the same currency. This family uses ${group.currency}, but this person's account uses ${inviteeDoc.currency}.`,
          },
          { status: 409 }
        );
      }
    }

    const role_: FamilyRole = role;
    const token = await createInviteToken({
      familyGroupId: groupId,
      inviterUid,
      inviterName,
      inviteeEmail: normalizedEmail,
      role: role_,
      existingUid,
    });

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const inviteUrl = `${origin}/family/invite/${token}`;

    try {
      await sendFamilyInviteEmail({
        toEmail: normalizedEmail,
        inviterName,
        role: role_,
        inviteUrl,
        isExistingAccount: !!existingUid,
      });
    } catch (emailErr) {
      // Don't leave a dangling pending invite that can never be emailed —
      // it would permanently block re-inviting this address (duplicate-invite check).
      await deleteInviteToken(token);
      throw emailErr;
    }

    return NextResponse.json({ ok: true, groupId });
  } catch (err) {
    console.error("family/invite error:", err);
    return NextResponse.json({ error: "Failed to send invite" }, { status: 500 });
  }
}
