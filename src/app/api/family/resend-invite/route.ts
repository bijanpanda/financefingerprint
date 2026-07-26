import { NextRequest, NextResponse } from "next/server";
import { sendFamilyInviteEmail } from "@/lib/server/email";
import { getFamilyGroup, findPendingInviteToken, touchInviteTokenReminder } from "@/lib/server/familyDb";

export async function POST(req: NextRequest) {
  try {
    const { familyGroupId, inviteeEmail, requesterUid } = (await req.json()) as {
      familyGroupId: string;
      inviteeEmail: string;
      requesterUid: string;
    };
    if (!familyGroupId || !inviteeEmail || !requesterUid) {
      return NextResponse.json({ error: "familyGroupId, inviteeEmail, and requesterUid are required" }, { status: 400 });
    }

    const group = await getFamilyGroup(familyGroupId);
    if (!group || group.initiatorUid !== requesterUid) {
      return NextResponse.json({ error: "Only the family's organizer can resend an invite." }, { status: 403 });
    }

    const invite = await findPendingInviteToken(familyGroupId, inviteeEmail.trim().toLowerCase());
    if (!invite) {
      return NextResponse.json({ error: "No pending invite found for this email." }, { status: 404 });
    }

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const inviteUrl = `${origin}/family/invite/${invite.token}`;

    await sendFamilyInviteEmail({
      toEmail: invite.inviteeEmail,
      inviterName: invite.inviterName,
      role: invite.role,
      inviteUrl,
      isExistingAccount: !!invite.existingUid,
    });
    await touchInviteTokenReminder(invite.token);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("family/resend-invite error:", err);
    return NextResponse.json({ error: "Failed to resend invite" }, { status: 500 });
  }
}
