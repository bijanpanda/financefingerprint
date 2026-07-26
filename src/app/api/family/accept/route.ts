import { NextRequest, NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { getAdminAuth, getAdminFirestore } from "@/lib/server/adminAuth";
import { sendFamilyInviteResponseEmail } from "@/lib/server/email";
import {
  getInviteToken,
  getFamilyGroup,
  getFamilyMembership,
  confirmFamilyMember,
  markInviteTokenStatus,
  getUserDoc,
} from "@/lib/server/familyDb";

async function notifyInitiator(groupId: string, inviteeEmail: string, outcome: "accepted" | "declined") {
  const group = await getFamilyGroup(groupId);
  if (!group) return;
  try {
    const initiatorAuth = await getAdminAuth().getUser(group.initiatorUid);
    if (!initiatorAuth.email) return;
    const initiatorDoc = await getUserDoc(group.initiatorUid);
    const firstName = (initiatorDoc?.displayName || initiatorAuth.displayName || "there").split(" ")[0];
    await sendFamilyInviteResponseEmail({
      toEmail: initiatorAuth.email,
      inviterFirstName: firstName,
      inviteeEmail,
      outcome,
    });
  } catch (err) {
    console.error("family/accept: failed to notify initiator:", err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token } = body as { token: string };
    if (!token) {
      return NextResponse.json({ error: "token is required" }, { status: 400 });
    }

    const invite = await getInviteToken(token);
    if (!invite) {
      return NextResponse.json({ error: "This invite link is invalid." }, { status: 404 });
    }
    if (invite.status !== "pending") {
      return NextResponse.json({ error: "This invite has already been used." }, { status: 410 });
    }

    const group = await getFamilyGroup(invite.familyGroupId);
    if (!group) {
      return NextResponse.json({ error: "This family group no longer exists." }, { status: 404 });
    }

    let uid: string;
    let displayNameForMember: string;

    if (invite.existingUid) {
      const { uid: callerUid } = body as { uid?: string };
      if (!callerUid || callerUid !== invite.existingUid) {
        return NextResponse.json({ error: "You must be signed in to the invited account to accept." }, { status: 403 });
      }

      const membership = await getFamilyMembership(callerUid);
      if (membership) {
        return NextResponse.json({ error: "This account is already part of a family group." }, { status: 409 });
      }
      const inviteeDoc = await getUserDoc(callerUid);
      if (inviteeDoc?.currency && inviteeDoc.currency !== group.currency) {
        return NextResponse.json(
          { error: `This family uses ${group.currency}, but your account uses ${inviteeDoc.currency}. Currencies must match.` },
          { status: 409 }
        );
      }

      uid = callerUid;
      displayNameForMember = inviteeDoc?.displayName || invite.inviteeEmail.split("@")[0];
    } else {
      const { displayName, password } = body as { displayName?: string; password?: string };
      if (!displayName || !password) {
        return NextResponse.json({ error: "Name and password are required to create your account." }, { status: 400 });
      }

      const created = await getAdminAuth().createUser({
        email: invite.inviteeEmail,
        password,
        displayName,
        emailVerified: true,
      });
      uid = created.uid;
      displayNameForMember = displayName;

      await getAdminFirestore().collection("users").doc(uid).set({
        displayName,
        currency: group.currency,
        createdAt: Timestamp.now(),
      });
    }

    await confirmFamilyMember(group.id, uid, invite.role, invite.inviterUid, invite.inviteeEmail, displayNameForMember);
    await markInviteTokenStatus(token, "accepted");
    await notifyInitiator(group.id, invite.inviteeEmail, "accepted");

    return NextResponse.json({ ok: true, uid, role: invite.role, groupId: group.id, isNewAccount: !invite.existingUid });
  } catch (err) {
    console.error("family/accept error:", err);
    return NextResponse.json({ error: "Failed to accept invite" }, { status: 500 });
  }
}
